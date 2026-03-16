import { Reward } from '../types'
import './RewardsTab.css'

const rewards: Reward[] = [
  { name: 'Free Plate of Momos', cost: 50, icon: '🥟' },
  { name: 'Secret Menu Unlock', cost: 100, icon: '🔓' },
  { name: 'Premium Combo', cost: 200, icon: '👑' },
  { name: 'Golden Momo Box', cost: 500, icon: '✨' }
]

interface RewardsTabProps {
  coins: number
  onRedeemReward: (rewardName: string, cost: number) => void
}

export default function RewardsTab({ coins, onRedeemReward }: RewardsTabProps) {
  return (
    <div>
      <h3>Available Rewards</h3>
      <div className="rewards-list">
        {rewards.map((reward, index) => {
          const canAfford = coins >= reward.cost
          return (
            <div key={index} className={`reward-item ${canAfford ? '' : 'locked'}`}>
              <div>
                <div className="reward-name">{reward.icon} {reward.name}</div>
              </div>
              <div className="reward-actions">
                <div className="reward-cost">{reward.cost} coins</div>
                {canAfford && (
                  <button 
                    className="redeem-btn"
                    onClick={() => onRedeemReward(reward.name, reward.cost)}
                  >
                    🎟️ Redeem
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
