export default function OfflineBanner() {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99998,
        background: '#c53030',
        color: '#fff',
        textAlign: 'center',
        padding: '10px 16px',
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      📡 You're offline. Some features may not work until you reconnect.
    </div>
  )
}
