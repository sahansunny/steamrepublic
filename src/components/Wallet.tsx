import { useState } from 'react'
import BalanceCard from './BalanceCard'
import Stats from './Stats'
import Tabs from './Tabs'
import RewardsTab from './RewardsTab'
import VouchersTab from './VouchersTab'
import HistoryTab from './HistoryTab'
import LeaderboardTab from './LeaderboardTab'
import SecretMenuTab from './SecretMenuTab'
import Barcode from './Barcode'
import ProfileModal from './ProfileModal'
import { User } from '../types'
import './Wallet.css'

interface WalletProps {
  user: User
  allUsers: Record<string, User>
  onLogout: () => void
  onClaimCoins: () => void
  onRedeemReward: (rewardName: string, cost: number) => void
  onShowPrivacy?: () => void
  onUserUpdated: (updated: Partial<User>) => void
}

export default function Wallet({ user, allUsers, onLogout, onClaimCoins, onRedeemReward, onShowPrivacy, onUserUpdated }: WalletProps) {
  const [activeTab, setActiveTab] = useState<'rewards' | 'vouchers' | 'history' | 'leaderboard' | 'secret'>('rewards')
  const [showProfile, setShowProfile] = useState(false)

  // Force profile modal open if name is missing
  const profileIncomplete = !user.name || user.name.trim() === ''
  const [forceProfile, setForceProfile] = useState(profileIncomplete)

  return (
    <div className="wallet">
      <div className="header">
        <h2>MomoWallet</h2>
        <div className="header-actions">
          <button
            onClick={() => setShowProfile(true)}
            className="profile-btn"
            aria-label="Edit profile"
            title="Edit profile"
          >
            {profileIncomplete ? '⚠️' : '👤'} Profile
          </button>
          <button onClick={onLogout} className="logout-btn" aria-label="Logout from MomoWallet">Logout</button>
        </div>
      </div>

      {/* Nudge banner if profile is incomplete */}
      {profileIncomplete && !forceProfile && (
        <div className="profile-nudge" onClick={() => setForceProfile(true)}>
          👋 Welcome! Tap here to add your name to complete your profile.
        </div>
      )}

      {/* User Barcode Section — shown first */}
      {user.barcode && (
        <div className="user-barcode-section">
          <div className="barcode-header">
            <h3>🏛️ Presidential ID</h3>
            <p>Your unique Steam Republic identifier</p>
          </div>
          <Barcode value={user.barcode} width={180} displayValue={true} />
        </div>
      )}

      <BalanceCard user={user} />
      <Stats user={user} />

      <button onClick={onClaimCoins} className="claim-coins-btn">
        🎟️ Claim MomoCoins
      </button>
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="tab-content">
        {activeTab === 'rewards' && <RewardsTab coins={user.coins} onRedeemReward={onRedeemReward} />}
        {activeTab === 'vouchers' && <VouchersTab userId={user.id} />}
        {activeTab === 'history' && <HistoryTab history={user.history} />}
        {activeTab === 'leaderboard' && <LeaderboardTab users={allUsers} />}
        {activeTab === 'secret' && <SecretMenuTab coins={user.coins} />}
      </div>

      <footer className="wallet-footer">
        <button type="button" className="footer-privacy-link" onClick={onShowPrivacy}>
          Privacy Policy
        </button>
        <span className="footer-sep">·</span>
        <span className="footer-copy">© {new Date().getFullYear()} Steam Republic</span>
      </footer>

      {/* Force profile modal if name missing, otherwise normal profile modal */}
      {forceProfile && (
        <ProfileModal
          user={user}
          required={true}
          onClose={() => setForceProfile(false)}
          onUpdated={(updates) => {
            onUserUpdated(updates)
            setForceProfile(false)
          }}
        />
      )}

      {showProfile && !forceProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdated={(updates) => {
            onUserUpdated(updates)
            setShowProfile(false)
          }}
        />
      )}
    </div>
  )
}
