import { useState } from 'react'
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { generateUserBarcode } from '../services/userService'
import './Signup.css'

interface SignupProps {
  onSignupSuccess: (userId: string) => void
  onSwitchToLogin: () => void
  onShowPrivacy?: () => void
}

export default function Signup({ onSignupSuccess, onSwitchToLogin, onShowPrivacy }: SignupProps) {
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '' })
  const [consentGiven, setConsentGiven] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sanitize = (str: string) => str.replace(/[<>'"]/g, '').trim()

  const validateForm = () => {
    if (!formData.name.trim()) { setError('Please enter your name'); return false }
    if (!formData.mobile.trim() || formData.mobile.length !== 10) { setError('Please enter a valid 10-digit mobile number'); return false }
    if (!formData.email.trim() || !formData.email.includes('@')) { setError('Please enter a valid email address'); return false }
    if (!consentGiven) { setError('Please accept the privacy policy to continue'); return false }
    return true
  }

  const handleSignup = async () => {
    if (!validateForm()) return
    setLoading(true)
    setError('')

    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('mobile', '==', formData.mobile))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setError('This mobile number is already registered. Please login.')
        setLoading(false)
        return
      }

      const userId = `USER${formData.mobile}`
      const userBarcode = generateUserBarcode(userId, formData.mobile)

      await setDoc(doc(db, 'users', userId), {
        id: userId,
        name: sanitize(formData.name),
        mobile: formData.mobile.trim(),
        email: sanitize(formData.email).toLowerCase(),
        barcode: userBarcode,
        coins: 0,
        visits: 0,
        streak: 0,
        createdAt: new Date().toISOString(),
        lastClaimDate: '',
        claimsToday: 0,
        whatsappConsent: true,
        consentDate: new Date().toISOString()
      })

      await setDoc(doc(db, 'users', userId, 'history', 'init'), {
        initialized: true,
        timestamp: new Date().toISOString()
      })

      setLoading(false)
      onSignupSuccess(userId)
    } catch (err: any) {
      let errorMessage = 'Failed to create account. '
      if (err.code === 'permission-denied') errorMessage += 'Database permission denied.'
      else if (err.code === 'unavailable') errorMessage += 'Cannot connect. Check your internet.'
      else errorMessage += err.message || 'Please try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="signup">
      <div className="logo">
        <img src="/Steamreublic.png" alt="Steam Republic logo" className="logo-image" width="80" height="80" />
      </div>
      <h1>Join Steam Republic</h1>
      <p className="tagline">Create your MomoWallet account</p>

      <div className="signup-form" role="form" aria-label="Sign up form">
        <div className="form-group">
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your name"
            disabled={loading}
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-mobile">Mobile Number</label>
          <input
            id="signup-mobile"
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            placeholder="10-digit mobile number"
            maxLength={10}
            disabled={loading}
            autoComplete="tel"
            inputMode="numeric"
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-email">Email Address</label>
          <input
            id="signup-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            placeholder="your@email.com"
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div className="form-group consent-group">
          <label className="consent-label">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              disabled={loading}
              aria-required="true"
            />
            <span>
              I agree to the{' '}
              <button type="button" className="privacy-link" onClick={onShowPrivacy}>
                Privacy Policy
              </button>
              {' '}and consent to receiving WhatsApp notifications about my MomoCoins.
            </span>
          </label>
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}

        <button onClick={handleSignup} className="signup-btn" disabled={loading || !consentGiven}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="switch-text">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="switch-link">
            Login here
          </button>
        </p>
      </div>

      <div className="benefits" aria-label="Benefits of joining">
        <h3>Why join?</h3>
        <ul>
          <li>🪙 Earn MomoCoins with every purchase</li>
          <li>🎁 Redeem coins for free momos</li>
          <li>🔓 Unlock secret menu items</li>
          <li>👑 Become President of Steam Republic</li>
        </ul>
      </div>
    </div>
  )
}
