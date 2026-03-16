import { useEffect, useState } from 'react'
import { User } from '../types'
import './Stats.css'

interface StatsProps {
  user: User
}

export default function Stats({ user }: StatsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [previousVisits, setPreviousVisits] = useState(user.visits)

  // Trigger animation when visits change
  useEffect(() => {
    if (user.visits !== previousVisits) {
      setIsUpdating(true)
      const timer = setTimeout(() => setIsUpdating(false), 800)
      setPreviousVisits(user.visits)
      return () => clearTimeout(timer)
    }
  }, [user.visits, previousVisits])

  return (
    <div className={`stats ${isUpdating ? 'updating' : ''}`}>
      <div className="stat">
        <span className={`stat-value ${isUpdating ? 'pulse' : ''}`}>{user.visits}</span>
        <span className="stat-label">Total Visits</span>
      </div>
      <div className="stat">
        <span className="stat-value">{user.streak}</span>
        <span className="stat-label">Day Streak</span>
      </div>
    </div>
  )
}
