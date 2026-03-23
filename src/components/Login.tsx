import { useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './Login.css'

interface LoginProps {
  onLoginSuccess: (userId: string) => void
  onSwitchToSignup: () => void
  onAdminAccess: () => void
}

export default function Login({ onLoginSuccess, onSwitchToSignup, onAdminAccess }: LoginProps) {
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!mobile.trim() || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('mobile', '==', mobile))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('Mobile number not found. Please sign up first.')
        setLoading(false)
        return
      }

      const userId = querySnapshot.docs[0].id
      setLoading(false)
      onLoginSuccess(userId)
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="logo">
        <img src="/Steamreublic.png" alt="Steam Republic logo" className="logo-image" width="80" height="80" />
      </div>
      <h1>Welcome Back</h1>
      <p className="tagline">Login to your MomoWallet</p>

      <div className="login-form" role="form" aria-label="Login form">
        <div className="form-group">
          <label htmlFor="login-mobile">Mobile Number</label>
          <input
            id="login-mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter your 10-digit mobile"
            maxLength={10}
            disabled={loading}
            autoComplete="tel"
            inputMode="numeric"
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>

        {error && <p id="login-error" className="error-message" role="alert">{error}</p>}

        <button onClick={handleLogin} className="login-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="switch-text">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToSignup} className="switch-link">
            Sign up here
          </button>
        </p>
      </div>

      <div className="qr-hint">
        <p>💡 Scan the QR code at our stall to access your wallet instantly!</p>
        <button
          type="button"
          className="admin-logo-inline"
          onClick={onAdminAccess}
          aria-label="Admin access"
        >
          <img src="/Steamreublic.png" alt="" className="admin-logo-image" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
