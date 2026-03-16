import { useState } from 'react'
import BarcodeScanner from './BarcodeScanner'
import './AdminPanel.css'

interface AdminPanelProps {
  onAddCoins: (customerId: string, coins: number, reason: string) => void
  onBack: () => void
  onStaffDashboard: () => void
  adminRole: string
}

export default function AdminPanel({ onAddCoins, onBack, onStaffDashboard, adminRole }: AdminPanelProps) {
  const [mobile, setMobile] = useState('')
  const [coins, setCoins] = useState('')
  const [reason, setReason] = useState('')
  const [activeTab, setActiveTab] = useState<'scanner' | 'manual'>('scanner')
  const [formError, setFormError] = useState('')

  const handleSubmit = () => {
    setFormError('')
    if (!mobile.trim() || !coins || !reason.trim()) {
      setFormError('Please fill all fields')
      return
    }
    if (mobile.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number')
      return
    }
    const coinsNum = parseInt(coins)
    if (isNaN(coinsNum) || coinsNum <= 0) {
      setFormError('Please enter a valid number of coins')
      return
    }
    onAddCoins(`USER${mobile}`, coinsNum, reason.trim())
    setMobile('')
    setCoins('')
    setReason('')
  }

  return (
    <div className="admin-panel">
      <div className="header">
        <h2>{adminRole === 'owner' ? 'Owner Panel' : 'Manager Panel'}</h2>
        <div className="header-buttons">
          <button onClick={onStaffDashboard} className="staff-btn">Staff Dashboard</button>
          <button onClick={onBack} className="logout-btn">🚪 Logout</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          🔍 Barcode Scanner
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          ➕ Manual Add Coins
        </button>
      </div>

      {activeTab === 'scanner' && (
        <div className="scanner-section">
          <BarcodeScanner onScanComplete={(user) => {
            if (user) {
              console.log('User scanned by admin:', user.name)
            }
          }} />
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="manual-section">
          <div className="admin-form">
            <h3>Add MomoCoins</h3>
            <div className="form-group">
              <label>Customer Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>
            <div className="form-group">
              <label>Coins to Add</label>
              <input
                type="number"
                value={coins}
                onChange={(e) => setCoins(e.target.value)}
                placeholder="Enter number of coins"
              />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., 2 plates, Bonus, Promotion"
              />
            </div>
            {formError && <p className="error-message">{formError}</p>}
            <button onClick={handleSubmit}>Add Coins</button>
          </div>
        </div>
      )}
    </div>
  )
}
