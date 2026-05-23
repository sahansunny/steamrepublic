import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { User } from '../types'
import './ProfileModal.css'

interface ProfileModalProps {
  user: User
  onClose: () => void
  onUpdated: (updated: Partial<User>) => void
  required?: boolean
}

export default function ProfileModal({ user, onClose, onUpdated, required = false }: ProfileModalProps) {
  const [name, setName]       = useState(user.name || '')
  const [email, setEmail]     = useState(user.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const nameLocked = !!user.nameSet
  const sanitize   = (str: string) => str.replace(/[<>'"]/g, '').trim()

  const handleSave = async () => {
    if (!nameLocked && !name.trim()) { setError('Name cannot be empty'); return }
    if (email.trim() && !email.includes('@')) { setError('Please enter a valid email address'); return }

    setLoading(true)
    setError('')
    try {
      const updates: Partial<User> = { email: sanitize(email).toLowerCase() }
      if (!nameLocked) {
        updates.name    = sanitize(name)
        updates.nameSet = true
      }
      await updateDoc(doc(db, 'users', user.id), updates)
      setSuccess(true)
      onUpdated(updates)
      setTimeout(() => { setSuccess(false); onClose() }, 1200)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`pm-backdrop${required ? '' : ' pm-backdrop--dismissible'}`}
        onClick={required ? undefined : onClose}
      />

      {/* Modal sheet */}
      <div className="pm-modal" role="dialog" aria-modal="true" aria-label="Edit profile">
        <div className="pm-header">
          <div>
            <h2 className="pm-title">{required ? '👋 Welcome!' : 'Edit Profile'}</h2>
            {required && <p className="pm-subtitle">Please enter your name to continue</p>}
          </div>
          {!required && (
            <button className="pm-close" onClick={onClose} aria-label="Close">✕</button>
          )}
        </div>

        {/* Mobile — read only */}
        <div className="pm-fg">
          <label className="pm-label">Mobile Number</label>
          <div className="pm-readonly">{user.mobile}</div>
        </div>

        <div className="pm-fg">
          <label htmlFor="prof-name" className="pm-label">
            Full Name
            {nameLocked && <span className="pm-locked-badge">🔒 Cannot be changed</span>}
          </label>
          {nameLocked ? (
            <div className="pm-readonly">{user.name}</div>
          ) : (
            <input
              id="prof-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
              autoComplete="name"
              className="pm-input"
              autoFocus
            />
          )}
        </div>

        <div className="pm-fg">
          <label htmlFor="prof-email" className="pm-label">Email Address</label>
          <input
            id="prof-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="your@email.com"
            disabled={loading}
            autoComplete="email"
            className="pm-input"
          />
        </div>

        {error   && <p className="pm-error"   role="alert">{error}</p>}
        {success && <p className="pm-success" role="status">✅ Profile updated!</p>}

        <button
          className="pm-save-btn"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  )
}
