import { User } from '../types'
import './LeaderboardTab.css'

interface LeaderboardTabProps {
  users: Record<string, User>
}

export default function LeaderboardTab({ users }: LeaderboardTabProps) {
  const sortedUsers = Object.values(users)
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 10)

  return (
    <div>
      <h3>Top Momo Citizens</h3>
      <div className="leaderboard-list">
        {sortedUsers.map((user, index) => (
          <div key={user.id} className="leaderboard-item">
            <span className="rank">{index + 1}</span>
            <div className="player-info">
              <div className="player-name">{user.name}</div>
              <div className="player-coins">{user.coins} coins</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
