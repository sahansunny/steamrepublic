import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          color: '#fff',
          background: '#000'
        }}>
          <img src="/Steamreublic.png" alt="Steam Republic" style={{ width: 80, marginBottom: 24 }} />
          <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>
            We hit an unexpected error. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #48bb78, #38a169)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
