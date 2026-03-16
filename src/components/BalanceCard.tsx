import { useEffect, useState } from 'react'
import { User, CitizenLevel } from '../types'
import './BalanceCard.css'

const citizenLevels: CitizenLevel[] = [
  { name: 'Citizen', minCoins: 0, color: '#667eea' },
  { name: 'Minister of Momos', minCoins: 200, color: '#ffd700' },
  { name: 'President of Steam Republic', minCoins: 1000, color: '#ff6b6b' }
]

function getCitizenLevel(coins: number): CitizenLevel {
  for (let i = citizenLevels.length - 1; i >= 0; i--) {
    if (coins >= citizenLevels[i].minCoins) {
      return citizenLevels[i]
    }
  }
  return citizenLevels[0]
}

interface BalanceCardProps {
  user: User
}

export default function BalanceCard({ user }: BalanceCardProps) {
  const level = getCitizenLevel(user.coins)
  const [isUpdating, setIsUpdating] = useState(false)
  const [previousCoins, setPreviousCoins] = useState(user.coins)

  // Trigger animation when coins change
  useEffect(() => {
    if (user.coins !== previousCoins) {
      setIsUpdating(true)
      const timer = setTimeout(() => setIsUpdating(false), 1000)
      setPreviousCoins(user.coins)
      return () => clearTimeout(timer)
    }
  }, [user.coins, previousCoins])

  return (
    <div className={`balance-card ${isUpdating ? 'updating' : ''}`}>
      <div className="coin-display">
        <div className="rotating-logo">
          <img src="/src/images/Steamreublic.png" alt="Steam Republic" className="coin-logo" />
        </div>
        <span className={`balance ${isUpdating ? 'pulse' : ''}`}>{user.coins}</span>
        <span className="coin-label">MomoCoins</span>
      </div>
      <div 
        className="citizen-badge"
        style={{ background: `linear-gradient(135deg, ${level.color} 0%, ${level.color}dd 100%)` }}
      >
        {level.name}
      </div>
    </div>
  )
}
