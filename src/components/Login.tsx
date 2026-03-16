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
      // Check if user exists
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('mobile', '==', mobile))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError('Mobile number not found. Please sign up first.')
        setLoading(false)
        return
      }

      // Get user ID
      const userDoc = querySnapshot.docs[0]
      const userId = userDoc.id

      setLoading(false)
      onLoginSuccess(userId)
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please try again.')
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="login">
      <div className="logo">
        <img src="/Steamreublic.png" alt="Steam Republic" className="logo-image" />
      </div>
      <h1>Welcome Back</h1>
      <p className="tagline">Login to your MomoWallet</p>

      <div className="login-form">
        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyPress={handleKeyPress}
            placeholder="Enter your 10-digit mobile"
            maxLength={10}
            disabled={loading}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleLogin} className="login-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="switch-text">
          Don't have an account?{' '}
          <span onClick={onSwitchToSignup} className="switch-link">
            Sign up here
          </span>
        </p>
      </div>

      <div className="qr-hint">
        <p>💡 Scan the QR code at our stall to access your wallet instantly!</p>
        <div className="admin-logo-inline" onClick={onAdminAccess}>
          <img src="/Steamreublic.png" alt="Admin Access" className="admin-logo-image" />
        </div>
      </div>
    </div>
  )
}
