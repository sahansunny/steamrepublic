import { useState, useEffect } from 'react'
import { getUserVouchers } from '../services/userService'
import { RedemptionVoucher } from '../types'
import './VouchersTab.css'

interface VouchersTabProps {
  userId: string
}

export default function VouchersTab({ userId }: VouchersTabProps) {
  const [vouchers, setVouchers] = useState<RedemptionVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [copyToast, setCopyToast] = useState('')

  useEffect(() => {
    const loadVouchers = async () => {
      setLoading(true)
      const data = await getUserVouchers(userId)
      setVouchers(data)
      setLoading(false)
    }
    loadVouchers()
  }, [userId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'fulfilled': return '#10b981'
      case 'expired': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopyToast('Voucher code copied!')
    setTimeout(() => setCopyToast(''), 2500)
  }

  if (loading) {
    return <div className="loading">Loading your vouchers...</div>
  }

  return (
    <div>
      {copyToast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(16,185,129,0.95)', color: '#fff', padding: '10px 20px',
          borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)', whiteSpace: 'nowrap'
        }}>
          📋 {copyToast}
        </div>
      )}
      <h3>Your Vouchers</h3>
      {vouchers.length === 0 ? (
        <div className="no-vouchers">
          <div className="empty-icon">🎟️</div>
          <p>No active vouchers</p>
          <small>Redeem rewards to get vouchers!</small>
        </div>
      ) : (
        <div className="vouchers-list">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="voucher-card">
              <div className="voucher-header">
                <div className="reward-info">
                  <h4>{voucher.rewardName}</h4>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(voucher.status) }}
                  >
                    {voucher.status.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="voucher-code-section">
                <div className="voucher-code">{voucher.voucherCode}</div>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(voucher.voucherCode)}
                >
                  📋 Copy
                </button>
              </div>

              <div className="voucher-details">
                <div className="detail-item">
                  <span className="label">Created:</span>
                  <span>{formatDate(voucher.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Expires:</span>
                  <span className={getDaysUntilExpiry(voucher.expiresAt) <= 2 ? 'expiring-soon' : ''}>
                    {getDaysUntilExpiry(voucher.expiresAt)} days left
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Value:</span>
                  <span>{voucher.cost} coins</span>
                </div>
              </div>

              {voucher.status === 'pending' && (
                <div className="usage-instructions">
                  <p>📍 Show this code to staff at the restaurant to redeem your reward</p>
                </div>
              )}

              {voucher.status === 'fulfilled' && voucher.fulfilledAt && (
                <div className="fulfilled-info">
                  <p>✅ Redeemed on {formatDate(voucher.fulfilledAt)}</p>
                  {voucher.fulfilledBy && (
                    <p className="fulfilled-by">Processed by: {voucher.fulfilledBy}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}