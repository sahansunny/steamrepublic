import { useState } from 'react'
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { generateUserBarcode } from '../services/userService'
import './Signup.css'

interface SignupProps {
  onSignupSuccess: (userId: string) => void
  onSwitchToLogin: () => void
}

export default function Signup({ onSignupSuccess, onSwitchToLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name')
      return false
    }
    if (!formData.mobile.trim() || formData.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleSignup = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      console.log('Starting signup process...')
      console.log('Form data:', formData)
      
      // Check if mobile number already exists
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('mobile', '==', formData.mobile))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setError('This mobile number is already registered. Please login.')
        setLoading(false)
        return
      }

      // Create unique user ID from mobile number
      const userId = `USER${formData.mobile}`
      console.log('Creating user with ID:', userId)

      // Generate unique barcode for the user
      const userBarcode = generateUserBarcode(userId, formData.mobile)
      console.log('Generated barcode:', userBarcode)

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userId), {
        id: userId,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim().toLowerCase(),
        barcode: userBarcode,
        coins: 0,
        visits: 0,
        streak: 0,
        createdAt: new Date().toISOString(),
        lastClaimDate: '',
        claimsToday: 0
      })

      console.log('User created successfully!')

      // Initialize empty history collection
      await setDoc(doc(db, 'users', userId, 'history', 'init'), {
        initialized: true,
        timestamp: new Date().toISOString()
      })

      console.log('History initialized!')
      setLoading(false)
      onSignupSuccess(userId)
    } catch (err: any) {
      console.error('Signup error:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      
      let errorMessage = 'Failed to create account. '
      
      if (err.code === 'permission-denied') {
        errorMessage += 'Database permission denied. Please check Firestore rules.'
      } else if (err.code === 'unavailable') {
        errorMessage += 'Cannot connect to database. Check your internet connection.'
      } else if (err.message) {
        errorMessage += err.message
      } else {
        errorMessage += 'Please try again.'
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignup()
    }
  }

  return (
    <div className="signup">
      <div className="logo">
        <img src="/Steamreublic.png" alt="Steam Republic" className="logo-image" />
      </div>
      <h1>Join Steam Republic</h1>
      <p className="tagline">Create your MomoWallet account</p>

      <div className="signup-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your name"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            placeholder="10-digit mobile number"
            maxLength={10}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleSignup} className="signup-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="switch-text">
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} className="switch-link">
            Login here
          </span>
        </p>
      </div>

      <div className="benefits">
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
