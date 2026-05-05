import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { User } from '../types'

interface ProfileModalProps {
  user: User
  onClose: () => void
  onUpdated: (updated: Partial<User>) => void
  required?: boolean // if true, cannot be dismissed without saving a name
}

export default function ProfileModal({ user, onClose, onUpdated, required = false }: ProfileModalProps) {
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const nameLocked = !!user.nameSet // name already set once — cannot change
  const sanitize = (str: string) => str.replace(/[<>'"]/g, '').trim()

  const handleSave = async () => {
    if (!nameLocked && !name.trim()) { setError('Name cannot be empty'); return }
    if (email.trim() && !email.includes('@')) { setError('Please enter a valid email address'); return }

    setLoading(true)
    setError('')
    try {
      const updates: Partial<User> = {
        email: sanitize(email).toLowerCase()
      }
      // Only set name + nameSet flag if name hasn't been locked yet
      if (!nameLocked) {
        updates.name = sanitize(name)
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
      {/* Backdrop — not dismissible when required */}
      <div onClick={required ? undefined : onClose} style={{ ...s.backdrop, cursor: required ? 'default' : 'pointer' }} />

      {/* Modal */}
      <div style={s.modal} role="dialog" aria-modal="true" aria-label="Edit profile">
        {/* Gold top line */}
        <div style={s.topLine} />

        <div style={s.header}>
          <div>
            <h2 style={s.title}>{required ? '👋 Welcome!' : 'Edit Profile'}</h2>
            {required && <p style={s.subtitle}>Please enter your name to continue</p>}
          </div>
          {!required && (
            <button onClick={onClose} style={s.closeBtn} aria-label="Close">✕</button>
          )}
        </div>

        {/* Mobile — read only */}
        <div style={s.fg}>
          <label style={s.label}>Mobile Number</label>
          <div style={s.readOnly}>{user.mobile}</div>
        </div>

        <div style={s.fg}>
          <label htmlFor="prof-name" style={s.label}>
            Full Name
            {nameLocked && <span style={s.lockedBadge}>🔒 Cannot be changed</span>}
          </label>
          {nameLocked ? (
            <div style={s.readOnly}>{user.name}</div>
          ) : (
            <input
              id="prof-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
              autoComplete="name"
              style={s.input}
              autoFocus
            />
          )}
        </div>

        <div style={s.fg}>
          <label htmlFor="prof-email" style={s.label}>Email Address</label>
          <input
            id="prof-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="your@email.com"
            disabled={loading}
            autoComplete="email"
            style={s.input}
          />
        </div>

        {error && <p style={s.error} role="alert">{error}</p>}
        {success && <p style={s.successMsg}>✅ Profile updated!</p>}

        <button
          onClick={handleSave}
          disabled={loading}
          style={{ ...s.saveBtn, ...(loading ? s.disabled : {}) }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  )
}

const s: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    zIndex: 1000, cursor: 'pointer'
  },
  modal: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    zIndex: 1001,
    background: 'rgba(12,12,18,0.98)',
    backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
    borderRadius: '28px 28px 0 0',
    border: '1px solid rgba(255,255,255,0.10)',
    borderBottom: 'none',
    padding: '28px 24px 40px',
    boxShadow: '0 -8px 48px rgba(0,0,0,0.6)',
    animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    maxWidth: 520, margin: '0 auto'
  },
  topLine: {
    position: 'absolute', top: 0, left: '30%', right: '30%', height: 1,
    background: 'linear-gradient(90deg,transparent,rgba(255,215,0,0.6),transparent)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24
  },
  title: {
    fontFamily: "'Orbitron','Inter',sans-serif", color: '#fff',
    fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: 0.5
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '4px 0 0', fontWeight: 400
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)', borderRadius: 10, width: 32, height: 32,
    cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all .2s'
  },
  fg: { marginBottom: 16 },
  label: {
    display: 'block', color: 'rgba(255,255,255,0.38)', fontWeight: 700,
    marginBottom: 7, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase' as const
  },
  lockedBadge: {
    marginLeft: 8, fontSize: 9.5, color: 'rgba(255,215,0,0.7)',
    fontWeight: 600, letterSpacing: 0.5, textTransform: 'none' as const
  },
  input: {
    width: '100%', padding: '13px 16px', fontSize: 15,
    border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14,
    background: 'rgba(0,0,0,0.3)', color: '#fff', fontWeight: 500,
    display: 'block', boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'inherit'
  },
  readOnly: {
    padding: '13px 16px', fontSize: 15, borderRadius: 14,
    background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)',
    border: '1px solid rgba(255,255,255,0.06)', fontWeight: 600, letterSpacing: 1
  },
  error: {
    color: '#fc8181', background: 'rgba(252,129,129,0.09)', padding: '10px 14px',
    borderRadius: 10, marginBottom: 14, fontSize: 13, textAlign: 'center' as const,
    fontWeight: 500, border: '1px solid rgba(252,129,129,0.18)'
  },
  successMsg: {
    color: '#68d391', background: 'rgba(104,211,145,0.09)', padding: '10px 14px',
    borderRadius: 10, marginBottom: 14, fontSize: 13, textAlign: 'center' as const,
    fontWeight: 600, border: '1px solid rgba(104,211,145,0.2)'
  },
  saveBtn: {
    width: '100%', padding: '15px', fontSize: 14, fontWeight: 800,
    background: '#ffd700', color: '#000', border: 'none', borderRadius: 14,
    cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase' as const,
    boxShadow: '0 6px 24px rgba(255,215,0,0.25)', transition: 'transform .2s, box-shadow .2s'
  },
  disabled: { opacity: 0.4, cursor: 'not-allowed' as const }
}
