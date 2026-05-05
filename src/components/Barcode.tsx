import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import './Barcode.css'

interface BarcodeProps {
  value: string
  width?: number
  displayValue?: boolean
}

export default function Barcode({ value, width = 200, displayValue = true }: BarcodeProps) {
  const [overlayVisible, setOverlayVisible] = useState(true)

  if (!value) return null

  return (
    <div className="barcode-container">
      <div className="barcode-qr-wrapper" onClick={() => setOverlayVisible(false)}>
        <QRCodeSVG
          value={value}
          size={width}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          className="barcode-canvas square-barcode"
        />

        {/* Instruction overlay — tap to dismiss */}
        {overlayVisible && (
          <div className="barcode-overlay">
            <div className="barcode-overlay-inner">
              <span className="barcode-overlay-icon">🏪</span>
              <p className="barcode-overlay-text">Show this QR code to the staff at our stall</p>
              <span className="barcode-overlay-tap">Tap to reveal</span>
            </div>
          </div>
        )}
      </div>

      {displayValue && (
        <p className="barcode-text">{value}</p>
      )}
    </div>
  )
}
