import { useState, useRef } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './AdminLogin.css'

interface AdminLoginProps {
  onLoginSuccess: (adminId: string, role: string) => void
}

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutes

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const attempts = useRef(0)
  const lockedUntil = useRef<number | null>(null)

  const handleLogin = async () => {
    // Rate limit check
    if (lockedUntil.current && Date.now() < lockedUntil.current) {
      const mins = Math.ceil((lockedUntil.current - Date.now()) / 60000)
      setError(`Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`)
      return
    }

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const adminsRef = collection(db, 'admins')
      const q = query(adminsRef, where('email', '==', email.toLowerCase().trim()))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        recordFailedAttempt()
        setError('Invalid credentials')
        setLoading(false)
        return
      }

      const adminDoc = querySnapshot.docs[0]
      const adminData = adminDoc.data()

      if (!adminData.active) {
        setError('This account has been deactivated')
        setLoading(false)
        return
      }

      if (adminData.password !== password) {
        recordFailedAttempt()
        setError('Invalid credentials')
        setLoading(false)
        return
      }

      // Reset on success
      attempts.current = 0
      lockedUntil.current = null

      onLoginSuccess(adminDoc.id, adminData.role)
    } catch (err: any) {
      setError('Failed to login. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const recordFailedAttempt = () => {
    attempts.current += 1
    if (attempts.current >= MAX_ATTEMPTS) {
      lockedUntil.current = Date.now() + LOCKOUT_MS
      setError(`Too many failed attempts. Locked for 5 minutes.`)
    }
  }

  return (
    <div className="admin-login">
      <div className="logo">
        <img src="/Steamreublic.png" alt="Steam Republic" className="logo-image" />
      </div>
      <h1>Admin Access</h1>
      <p className="tagline">Staff & Management Portal</p>

      <div className="admin-login-form">
        <div className="form-group">
          <label>Admin Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="admin@steamrepublic.com"
            disabled={loading}
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleLogin} className="admin-login-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login to Admin Panel'}
        </button>

        <p className="switch-text">Contact your administrator for access</p>
      </div>

      <div className="admin-info">
        <p>⚠️ Authorized personnel only</p>
      </div>
    </div>
  )
}
