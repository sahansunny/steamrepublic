import './OfflineBanner.css'

export default function OfflineBanner() {
  return (
    <div
      className="offline-banner"
      role="alert"
      aria-live="assertive"
    >
      📡 You're offline. Some features may not work until you reconnect.
    </div>
  )
}
