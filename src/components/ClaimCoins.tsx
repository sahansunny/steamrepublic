import { useState } from 'react'
import { doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'
import './ClaimCoins.css'

interface ClaimCoinsProps {
  userId: string
  onClaimSuccess: (coins: number, code: string) => void
  onBack: () => void
}

export default function ClaimCoins({ userId, onClaimSuccess, onBack }: ClaimCoinsProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClaim = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setError('Please enter a purchase code')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Use a transaction so code-used + coins-awarded are atomic
      const coinsAwarded = await runTransaction(db, async (transaction) => {
        const codeRef = doc(db, 'purchaseCodes', trimmed)
        const userRef = doc(db, 'users', userId)

        const [codeDoc, userDoc] = await Promise.all([
          transaction.get(codeRef),
          transaction.get(userRef)
        ])

        if (!codeDoc.exists()) throw new Error('Invalid purchase code')
        if (!userDoc.exists()) throw new Error('User not found')

        const codeData = codeDoc.data()
        const userData = userDoc.data()

        if (codeData.used) throw new Error('This code has already been used')

        const today = new Date().toDateString()
        if (userData.lastClaimDate === today && (userData.claimsToday || 0) >= 3) {
          throw new Error('Daily claim limit reached (max 3 per day)')
        }

        // Atomic: mark code used AND update coins together
        transaction.update(codeRef, {
          used: true,
          usedBy: userId,
          usedAt: new Date().toISOString()
        })

        transaction.update(userRef, {
          coins: userData.coins + codeData.coins,
          visits: userData.visits + 1,
          lastClaimDate: today,
          claimsToday: userData.lastClaimDate === today ? (userData.claimsToday || 0) + 1 : 1
        })

        return codeData.coins as number
      })

      onClaimSuccess(coinsAwarded, trimmed)
    } catch (err: any) {
      setError(err.message || 'Failed to claim coins. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="claim-coins">
      <div className="claim-header">
        <button onClick={onBack} className="back-btn">← Back</button>
      </div>

      <div className="claim-content">
        <div className="claim-icon">🎟️</div>
        <h2>Claim Your MomoCoins</h2>
        <p className="claim-subtitle">Enter the purchase code provided by our staff</p>

        <div className="code-input-container">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleClaim()}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="code-input"
            disabled={loading}
            autoFocus
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <button
          onClick={handleClaim}
          className="claim-btn"
          disabled={loading || !code.trim()}
        >
          {loading ? 'Validating...' : 'Claim Coins'}
        </button>

        <div className="claim-info">
          <h3>How it works:</h3>
          <ol>
            <li>Purchase momos from our stall</li>
            <li>Staff will give you a unique code</li>
            <li>Enter the code here to claim your coins</li>
            <li>Enjoy your rewards!</li>
          </ol>
          <p className="limit-note">⚠️ Maximum 3 claims per day</p>
        </div>
      </div>
    </div>
  )
}
