import { useState, useEffect, useMemo } from 'react'
import { getPendingRedemptions, fulfillRedemption } from '../services/userService'
import { RedemptionVoucher } from '../types'
import BarcodeScanner from './BarcodeScanner'
import './StaffDashboard.css'

interface StaffDashboardProps {
  staffId: string
  onBack: () => void
  onLogout: () => void
}

export default function StaffDashboard({ staffId, onBack, onLogout }: StaffDashboardProps) {
  const [redemptions, setRedemptions] = useState<RedemptionVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'fulfilled'>('all')
  const [activeTab, setActiveTab] = useState<'scanner' | 'redemptions'>('scanner')
  const [fulfillMsg, setFulfillMsg] = useState('')

  const showMsg = (msg: string) => {
    setFulfillMsg(msg)
    setTimeout(() => setFulfillMsg(''), 3000)
  }

  const loadRedemptions = async () => {
    setLoading(true)
    const data = await getPendingRedemptions()
    setRedemptions(data)
    setLoading(false)
  }

  useEffect(() => {
    loadRedemptions()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRedemptions, 30000)
    return () => clearInterval(interval)
  }, [])

  // Filter and search redemptions
  const filteredRedemptions = useMemo(() => {
    let filtered = redemptions

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus)
    }

    // Search by voucher code, customer name, or reward name
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        r.voucherCode.toLowerCase().includes(search) ||
        r.userName.toLowerCase().includes(search) ||
        r.rewardName.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [redemptions, searchTerm, filterStatus])

  const handleFulfill = async (redemptionId: string) => {
    const success = await fulfillRedemption(redemptionId, staffId)
    if (success) {
      showMsg('Redemption fulfilled!')
      loadRedemptions()
    } else {
      showMsg('Failed to fulfill redemption')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b'
      case 'fulfilled': return '#10b981'
      case 'expired': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const clearSearch = () => {
    setSearchTerm('')
    setFilterStatus('all')
  }

  if (loading) {
    return (
      <div className="staff-dashboard">
        <div className="header">
        <h2>Staff Dashboard</h2>
        <div className="header-buttons">
          <button onClick={onBack} className="back-btn">← Back</button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      <div className="loading">Loading redemptions...</div>
      </div>
    )
  }

  return (
    <div className="staff-dashboard">
      {fulfillMsg && <div className="toast">{fulfillMsg}</div>}
      <div className="header">
        <h2>Staff Dashboard</h2>
        <div className="header-buttons">
          <button onClick={onBack} className="back-btn">← Back</button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          🔍 Barcode Scanner
        </button>
        <button 
          className={`tab-btn ${activeTab === 'redemptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('redemptions')}
        >
          🎟️ Redemptions
        </button>
      </div>

      {activeTab === 'scanner' && (
        <div className="scanner-tab">
          <BarcodeScanner onScanComplete={(user) => {
            if (user) {
              // Optionally refresh redemptions or show success message
              console.log('User scanned:', user.name)
            }
          }} />
        </div>
      )}

      {activeTab === 'redemptions' && (
        <div className="redemptions-tab">
          <div className="stats">
            <div className="stat-card">
              <h3>{redemptions.filter(r => r.status === 'pending').length}</h3>
              <p>Pending Redemptions</p>
            </div>
            <div className="stat-card">
              <h3>{redemptions.filter(r => r.status === 'fulfilled').length}</h3>
              <p>Fulfilled Today</p>
            </div>
            <div className="stat-card">
              <h3>{filteredRedemptions.length}</h3>
              <p>Search Results</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="search-section">
            <div className="search-controls">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search by voucher code, customer name, or reward..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                    ✕
                  </button>
                )}
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'fulfilled')}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="fulfilled">Fulfilled</option>
              </select>

              {(searchTerm || filterStatus !== 'all') && (
                <button onClick={clearSearch} className="clear-all-btn">
                  Clear All
                </button>
              )}
            </div>

            {searchTerm && (
              <div className="search-info">
                Found {filteredRedemptions.length} result{filteredRedemptions.length !== 1 ? 's' : ''} 
                {searchTerm && ` for "${searchTerm}"`}
              </div>
            )}
          </div>

          <div className="redemptions-list">
            <h3>
              {filterStatus === 'all' ? 'All Redemptions' : 
               filterStatus === 'pending' ? 'Pending Redemptions' : 'Fulfilled Redemptions'}
              {filteredRedemptions.length > 0 && ` (${filteredRedemptions.length})`}
            </h3>
            
            {filteredRedemptions.length === 0 ? (
              <div className="no-redemptions">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No redemptions match your search criteria' 
                  : 'No active redemptions'
                }
              </div>
            ) : (
              filteredRedemptions.map((redemption) => (
                <div key={redemption.id} className="redemption-card">
                  <div className="redemption-header">
                    <div className="voucher-code">{redemption.voucherCode}</div>
                    <div 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(redemption.status) }}
                    >
                      {redemption.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="redemption-details">
                    <div className="detail-row">
                      <span className="label">Customer:</span>
                      <span className="value">{redemption.userName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Reward:</span>
                      <span className="value">{redemption.rewardName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Cost:</span>
                      <span className="value">{redemption.cost} coins</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Created:</span>
                      <span className="value">{formatDate(redemption.createdAt)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Expires:</span>
                      <span className="value">
                        {getDaysUntilExpiry(redemption.expiresAt)} days left
                      </span>
                    </div>
                    {redemption.status === 'fulfilled' && redemption.fulfilledAt && (
                      <>
                        <div className="detail-row fulfilled-row">
                          <span className="label">✅ Fulfilled:</span>
                          <span className="value fulfilled-date">{formatDate(redemption.fulfilledAt)}</span>
                        </div>
                        {redemption.fulfilledBy && (
                          <div className="detail-row fulfilled-row">
                            <span className="label">👤 Fulfilled by:</span>
                            <span className="value">{redemption.fulfilledBy}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {redemption.status === 'pending' && (
                    <button 
                      className="fulfill-btn"
                      onClick={() => handleFulfill(redemption.id)}
                    >
                      Mark as Fulfilled
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}