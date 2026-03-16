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
import { User } from '../types'
import './Wallet.css'

interface WalletProps {
  user: User
  allUsers: Record<string, User>
  onLogout: () => void
  onClaimCoins: () => void
  onRedeemReward: (rewardName: string, cost: number) => void
}

export default function Wallet({ user, allUsers, onLogout, onClaimCoins, onRedeemReward }: WalletProps) {
  const [activeTab, setActiveTab] = useState<'rewards' | 'vouchers' | 'history' | 'leaderboard' | 'secret'>('rewards')

  return (
    <div className="wallet">
      <div className="header">
        <h2>MomoWallet</h2>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      <BalanceCard user={user} />
      <Stats user={user} />
      
      {/* User Barcode Section */}
      {user.barcode && (
        <div className="user-barcode-section">
          <div className="barcode-header">
            <h3>🏛️ Presidential ID</h3>
            <p>Your unique Steam Republic identifier</p>
          </div>
          <Barcode value={user.barcode} width={180} height={180} displayValue={true} />
          <div className="barcode-info">
            <p>Show this square barcode at our stall for quick identification</p>
          </div>
        </div>
      )}
      
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
    </div>
  )
}
