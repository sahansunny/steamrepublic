import { useState, useEffect } from 'react'

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
    // Already installed as standalone PWA — never show
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // User already installed — never show again
    if (localStorage.getItem(STORAGE_KEY)) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    const isMobileOrTablet = /android|iphone|ipad|ipod|tablet|mobile/i.test(navigator.userAgent)

    if (ios && isMobileOrTablet) {
      setIsIOS(true)
      setTimeout(() => setShowBanner(true), 3000)
      return
    }

    // Android/Chrome — capture the native prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (isMobileOrTablet) {
        setTimeout(() => setShowBanner(true), 3000)
      }
    }

    // Listen for app installed event — hide banner and mark done
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
    // If dismissed — keep showing on next visit (don't store anything)
    setDeferredPrompt(null)
  }

  // iOS: no dismiss — keep showing until installed manually
  // Android: no dismiss button — keep showing until installed or accepted
  if (!showBanner) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.banner}>
        <img src="/Steamreublic.png" alt="MomoWallet" style={styles.icon} />

        <div style={styles.text}>
          <p style={styles.title}>Add MomoWallet to your home screen</p>
          {isIOS ? (
            <p style={styles.sub}>
              Tap <strong>Share</strong> <span style={styles.iosIcon}>⎙</span> then <strong>"Add to Home Screen"</strong>
            </p>
          ) : (
            <p style={styles.sub}>Get the full app experience — works offline too!</p>
          )}
        </div>

        {!isIOS && (
          <button onClick={handleInstall} style={styles.installBtn}>
            Install
          </button>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: '0 12px 12px',
    animation: 'slideUp 0.4s ease-out',
  },
  banner: {
    background: 'rgba(20, 20, 20, 0.97)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 215, 0, 0.5)',
    borderRadius: 20,
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 -4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.15)',
    position: 'relative',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    flexShrink: 0,
    border: '1px solid rgba(255,215,0,0.3)',
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    margin: '0 0 4px',
    lineHeight: 1.3,
  },
  sub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    margin: 0,
    lineHeight: 1.4,
  },
  iosIcon: {
    fontSize: 13,
  },
  installBtn: {
    background: '#ffd700',
    color: '#000',
    border: 'none',
    borderRadius: 12,
    padding: '10px 18px',
    fontWeight: 800,
    fontSize: 13,
    cursor: 'pointer',
    flexShrink: 0,
    letterSpacing: 0.5,
    whiteSpace: 'nowrap',
  },
}
