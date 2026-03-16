import { Transaction } from '../types'
import './HistoryTab.css'

interface HistoryTabProps {
  history: Transaction[]
}

const getIcon = (reason: string, coins: number) => {
  if (coins < 0) return '🎁'
  if (reason.toLowerCase().includes('barcode') || reason.toLowerCase().includes('visit')) return '📲'
  if (reason.toLowerCase().includes('purchase') || reason.toLowerCase().includes('code')) return '🎟️'
  if (reason.toLowerCase().includes('bonus') || reason.toLowerCase().includes('admin') || reason.toLowerCase().includes('manual')) return '👑'
  return '🪙'
}

const isAdminAdd = (reason: string) =>
  !reason.toLowerCase().includes('barcode') &&
  !reason.toLowerCase().includes('purchase') &&
  !reason.toLowerCase().includes('code') &&
  !reason.toLowerCase().includes('redeemed')

export default function HistoryTab({ history }: HistoryTabProps) {
  // History comes from Firestore ordered desc (newest first) — no need to reverse
  if (history.length === 0) {
    return (
      <div>
        <h3>Transaction History</h3>
        <p className="empty-message">No transactions yet. Start earning MomoCoins!</p>
      </div>
    )
  }

  return (
    <div>
      <h3>Transaction History</h3>
      <div className="history-list">
        {history.map((item, index) => {
          const isPositive = item.coins > 0
          const adminAdd = isPositive && isAdminAdd(item.reason)
          return (
            <div key={index} className={`history-item ${isPositive ? 'positive' : 'negative'}`}>
              <div className="history-icon">{getIcon(item.reason, item.coins)}</div>
              <div className="history-body">
                <span className="history-reason">
                  {item.reason}
                  {adminAdd && <span className="admin-badge">👑 Admin</span>}
                </span>
                <span className="history-date">
                  {new Date(item.date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <span className={`history-amount ${isPositive ? 'gain' : 'spend'}`}>
                {isPositive ? '+' : ''}{item.coins}
                <span className="coin-unit"> coins</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
