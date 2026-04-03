import { useState } from 'react'
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { generateUserBarcode } from '../services/userService'

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
        coins: 0, visits: 0, streak: 0,
        createdAt: new Date().toISOString(),
        lastClaimDate: '', claimsToday: 0,
        whatsappConsent: true,
        consentDate: new Date().toISOString()
      })
      await setDoc(doc(db, 'users', userId, 'history', 'init'), {
        initialized: true, timestamp: new Date().toISOString()
      })
      setLoading(false)
      onSignupSuccess(userId)
    } catch (err: any) {
      let msg = 'Failed to create account. '
      if (err.code === 'permission-denied') msg += 'Database permission denied.'
      else if (err.code === 'unavailable') msg += 'Cannot connect. Check your internet.'
      else msg += err.message || 'Please try again.'
      setError(msg)
      setLoading(false)
    }
  }

  // ── Inline styles — immune to CSS file wipes ──
  const s = {
    page: { textAlign: 'center' as const, padding: '48px 0 48px', animation: 'fadeIn .5s ease-out' },
    logoWrap: { marginBottom: 28, display: 'flex', justifyContent: 'center' as const },
    logoImg: { width: 96, height: 96, objectFit: 'cover' as const, borderRadius: '50%', border: '1.5px solid rgba(255,215,0,0.55)', boxShadow: '0 0 28px rgba(255,215,0,0.18), 0 8px 28px rgba(0,0,0,0.55)', background: 'rgba(0,0,0,0.3)' },
    h1: { fontFamily: "'Orbitron','Inter',sans-serif", color: '#fff', fontSize: 'clamp(1.65rem,6vw,2.9rem)', fontWeight: 900, marginBottom: 8, letterSpacing: -1, animation: 'glow 7s ease-in-out infinite' },
    tagline: { color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(.88rem,2.5vw,1.05rem)', marginBottom: 28, fontWeight: 400 },
    card: { background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', padding: 'clamp(24px,5vw,44px) clamp(20px,5vw,40px)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 8px 32px rgba(0,0,0,0.45)', marginBottom: 16, position: 'relative' as const, overflow: 'hidden' as const, textAlign: 'left' as const },
    label: { display: 'block', color: 'rgba(255,255,255,0.38)', fontWeight: 700, marginBottom: 7, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase' as const },
    input: { width: '100%', padding: '14px 18px', fontSize: 15, border: '1px solid rgba(255,255,255,0.10)', borderRadius: 18, background: 'rgba(0,0,0,0.28)', color: '#fff', fontWeight: 500, display: 'block', boxSizing: 'border-box' as const, outline: 'none', fontFamily: 'inherit' },
    fg: { marginBottom: 16, textAlign: 'left' as const },
    consentWrap: { marginTop: 4, marginBottom: 16 },
    consentLabel: { display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', lineHeight: 1.55 },
    checkbox: { width: 16, height: 16, minWidth: 16, marginTop: 2, accentColor: '#ffd700', cursor: 'pointer', flexShrink: 0 },
    consentText: { fontSize: '.84rem', color: 'rgba(255,255,255,0.65)', fontWeight: 400 },
    privacyBtn: { background: 'none', border: 'none', color: '#ffd700', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit', padding: 0, fontWeight: 700, display: 'inline' },
    error: { color: '#fc8181', background: 'rgba(252,129,129,0.09)', padding: '11px 15px', borderRadius: 12, marginBottom: 14, fontSize: 13, textAlign: 'center' as const, fontWeight: 500, border: '1px solid rgba(252,129,129,0.18)' },
    btn: { width: '100%', padding: '16px', fontSize: 14, fontWeight: 800, background: '#ffffff', color: '#000', border: 'none', borderRadius: 18, cursor: 'pointer', marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase' as const, boxShadow: '0 6px 24px rgba(255,255,255,0.18)', transition: 'transform .22s ease, box-shadow .22s ease' },
    btnDisabled: { opacity: .38, cursor: 'not-allowed' as const },
    switchRow: { marginTop: 18, color: 'rgba(255,255,255,0.65)', fontSize: 13.5, fontWeight: 500, textAlign: 'center' as const },
    switchBtn: { background: 'none', border: 'none', color: '#ffd700', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' },
    benefits: { background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: 'clamp(20px,4vw,30px) clamp(20px,5vw,36px)', borderRadius: 24, textAlign: 'left' as const, border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 8px 32px rgba(0,0,0,0.45)', position: 'relative' as const, overflow: 'hidden' as const },
    benefitsH3: { color: 'rgba(255,255,255,0.38)', marginBottom: 16, textAlign: 'center' as const, fontSize: '.78rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 2.5 },
    ul: { listStyle: 'none', padding: 0, margin: 0 },
    li: { color: 'rgba(255,255,255,0.65)', padding: '12px 0', fontSize: 13.5, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 },
  }

  return (
    <div style={s.page}>
      {/* Gold top line on cards via pseudo — use a real div instead */}
      <style>{`
        .su-card::before, .su-benefits::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,215,0,0.55), transparent);
        }
        .su-card:hover { transform: translateY(-3px); box-shadow: 0 20px 56px rgba(0,0,0,0.55); }
        .su-input:focus { border-color: rgba(255,215,0,0.35) !important; background: rgba(0,0,0,0.42) !important; box-shadow: 0 0 0 3px rgba(255,215,0,0.18), 0 4px 16px rgba(0,0,0,0.3) !important; }
        .su-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(255,255,255,0.26); }
        .su-li:last-child { border-bottom: none !important; }
        .su-li:hover { color: #fff !important; padding-left: 6px; }
      `}</style>

      <div style={s.logoWrap}>
        <img src="/Steamreublic.png" alt="Steam Republic logo" style={s.logoImg} width={96} height={96} />
      </div>

      <h1 style={s.h1}>Join Steam Republic</h1>
      <p style={s.tagline}>Create your MomoWallet account</p>

      <div style={s.card} className="su-card" role="form" aria-label="Sign up form">
        <div style={s.fg}>
          <label htmlFor="su-name" style={s.label}>Full Name</label>
          <input id="su-name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your name" disabled={loading} autoComplete="name" style={s.input} className="su-input" />
        </div>

        <div style={s.fg}>
          <label htmlFor="su-mobile" style={s.label}>Mobile Number</label>
          <input id="su-mobile" type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile number" maxLength={10} disabled={loading} autoComplete="tel" inputMode="numeric" style={s.input} className="su-input" />
        </div>

        <div style={s.fg}>
          <label htmlFor="su-email" style={s.label}>Email Address</label>
          <input id="su-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSignup()} placeholder="your@email.com" disabled={loading} autoComplete="email" style={s.input} className="su-input" />
        </div>

        <div style={s.consentWrap}>
          <label style={s.consentLabel}>
            <input type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} disabled={loading} aria-required="true" style={s.checkbox} />
            <span style={s.consentText}>
              I agree to the{' '}
              <button type="button" style={s.privacyBtn} onClick={onShowPrivacy}>Privacy Policy</button>
              {' '}and consent to receiving WhatsApp notifications about my MomoCoins.
            </span>
          </label>
        </div>

        {error && <p style={s.error} role="alert">{error}</p>}

        <button onClick={handleSignup} style={{ ...s.btn, ...(loading || !consentGiven ? s.btnDisabled : {}) }} disabled={loading || !consentGiven} className="su-btn">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p style={s.switchRow}>
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} style={s.switchBtn}>Login here</button>
        </p>
      </div>

      <div style={s.benefits} className="su-benefits" aria-label="Benefits of joining">
        <h3 style={s.benefitsH3}>Why join?</h3>
        <ul style={s.ul}>
          <li style={s.li} className="su-li">🪙 Earn MomoCoins with every purchase</li>
          <li style={s.li} className="su-li">🎁 Redeem coins for free momos</li>
          <li style={s.li} className="su-li">🔓 Unlock secret menu items</li>
          <li style={s.li} className="su-li">👑 Become President of Steam Republic</li>
        </ul>
      </div>
    </div>
  )
}
