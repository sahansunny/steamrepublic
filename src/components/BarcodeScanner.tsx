import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { processBarcodeVisit } from '../services/userService'
import { User } from '../types'
import './BarcodeScanner.css'

interface BarcodeScannerProps {
  onScanComplete?: (user: User | null) => void
}

type Mode = 'camera' | 'manual'
type CameraState = 'idle' | 'starting' | 'active' | 'error'

const SCANNER_ID = 'qr-scanner-region'

export default function BarcodeScanner({ onScanComplete }: BarcodeScannerProps) {
  const [mode, setMode] = useState<Mode>('camera')
  const [manualCode, setManualCode] = useState('')
  const [processing, setProcessing] = useState(false)
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string; user?: User } | null>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch (_) {}
      scannerRef.current = null
    }
    setCameraState('idle')
  }, [])

  // Cleanup on unmount or mode switch
  useEffect(() => {
    return () => { stopCamera() }
  }, [stopCamera])

  const startCamera = async () => {
    setCameraError(null)
    setResult(null)
    setCameraState('starting')

    // Small delay to ensure the div is in the DOM
    await new Promise(r => setTimeout(r, 100))

    const el = document.getElementById(SCANNER_ID)
    if (!el) {
      setCameraError('Scanner element not found. Please refresh.')
      setCameraState('error')
      return
    }

    try {
      const scanner = new Html5Qrcode(SCANNER_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (w, h) => {
            const size = Math.min(w, h) * 0.7
            return { width: size, height: size }
          },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          await stopCamera()
          await processCode(decodedText)
        },
        () => {} // suppress per-frame errors
      )

      setCameraState('active')
    } catch (err: any) {
      await stopCamera()
      const msg = err?.message ?? ''
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
        setCameraError('Camera permission denied. Tap "Allow" when your browser asks, then retry.')
      } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('no camera')) {
        setCameraError('No camera found on this device.')
      } else if (msg.toLowerCase().includes('https') || msg.toLowerCase().includes('secure')) {
        setCameraError('Camera requires a secure connection (HTTPS). Please use the deployed URL.')
      } else {
        setCameraError(`Could not start camera: ${msg || 'Unknown error'}. Try manual entry.`)
      }
      setCameraState('error')
    }
  }

  const processCode = async (code: string) => {
    setProcessing(true)
    setResult(null)
    try {
      const scanResult = await processBarcodeVisit(code.trim())
      setResult(scanResult)
      if (scanResult.success && onScanComplete) {
        onScanComplete(scanResult.user || null)
      }
    } catch {
      setResult({ success: false, message: 'Failed to process scan. Please try again.' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = async () => {
    setResult(null)
    setManualCode('')
    if (mode === 'camera') {
      await startCamera()
    }
  }

  const switchMode = async (newMode: Mode) => {
    await stopCamera()
    setResult(null)
    setManualCode('')
    setCameraError(null)
    setMode(newMode)
  }

  return (
    <div className="barcode-scanner">
      <div className="scanner-header">
        <h3>🔍 Customer Scanner</h3>
        <p>Scan customer QR code to award visit coins</p>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'camera' ? 'active' : ''}`}
          onClick={() => switchMode('camera')}
        >
          📷 Camera Scan
        </button>
        <button
          className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => switchMode('manual')}
        >
          ⌨️ Manual Entry
        </button>
      </div>

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="camera-section">
          {/* Always keep div in DOM so html5-qrcode can find it */}
          <div
            id={SCANNER_ID}
            className={`qr-region ${cameraState === 'active' ? 'active' : ''}`}
          />

          {/* Idle: show tap-to-start button (required for mobile user gesture) */}
          {cameraState === 'idle' && !result && (
            <button className="start-camera-btn" onClick={startCamera}>
              📷 Tap to Start Camera
            </button>
          )}

          {cameraState === 'starting' && (
            <div className="processing">
              <div className="spinner" />
              <p>Starting camera...</p>
            </div>
          )}

          {cameraState === 'active' && !result && (
            <p className="scan-hint">Point camera at customer's QR code</p>
          )}

          {cameraState === 'error' && cameraError && (
            <div className="camera-error">
              <p>⚠️ {cameraError}</p>
              <button onClick={startCamera} className="retry-btn">Retry</button>
            </div>
          )}

          {processing && (
            <div className="processing">
              <div className="spinner" />
              <p>Processing...</p>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <div className="scanner-input">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && !processing && processCode(manualCode.trim())}
            placeholder="Enter customer code (e.g. SR1234...)"
            className="barcode-input"
            disabled={processing}
            autoFocus
          />
          <button
            onClick={() => processCode(manualCode.trim())}
            className="scan-btn"
            disabled={processing || !manualCode.trim()}
          >
            {processing ? 'Processing...' : 'Submit'}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`scan-result ${result.success ? 'success' : 'error'}`}>
          <div className="result-icon">{result.success ? '✅' : '❌'}</div>
          <div className="result-content">
            <p className="result-message">{result.message}</p>
            {result.success && result.user && (
              <div className="user-info">
                <span className="user-name">{result.user.name}</span>
                <span className="user-stats">
                  {result.user.coins} coins · {result.user.visits} visits · {result.user.streak} day streak
                </span>
              </div>
            )}
          </div>
          <button onClick={handleReset} className="clear-btn">
            {mode === 'camera' ? '📷 Scan Next' : '✕'}
          </button>
        </div>
      )}
    </div>
  )
}
