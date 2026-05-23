import { useState, useEffect } from 'react'
import './InstallPrompt.css'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'pwa-installed'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem(STORAGE_KEY)) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    const isMobileOrTablet = /android|iphone|ipad|ipod|tablet|mobile/i.test(navigator.userAgent)

    if (ios && isMobileOrTablet) {
      setIsIOS(true)
      setTimeout(() => setShowBanner(true), 3000)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (isMobileOrTablet) setTimeout(() => setShowBanner(true), 3000)
    }

    const onInstalled = () => {
      localStorage.setItem(STORAGE_KEY, '1')
      setShowBanner(false)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem(STORAGE_KEY, '1')
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  if (!showBanner) return null

  return (
    <div className="install-prompt">
      <div className="install-banner">
        <img src="/Steamreublic.png" alt="MomoWallet" className="install-icon" width={48} height={48} />

        <div className="install-text">
          <p className="install-title">Add MomoWallet to your home screen</p>
          {isIOS ? (
            <p className="install-sub">
              Tap <strong>Share</strong> <span className="install-ios-icon">⎙</span> then <strong>"Add to Home Screen"</strong>
            </p>
          ) : (
            <p className="install-sub">Get the full app experience — works offline too!</p>
          )}
        </div>

        {!isIOS && (
          <button className="install-btn" onClick={handleInstall}>
            Install
          </button>
        )}
      </div>
    </div>
  )
}
