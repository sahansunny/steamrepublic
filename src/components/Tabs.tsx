import './Tabs.css'

type Tab = 'rewards' | 'vouchers' | 'history' | 'leaderboard' | 'secret'

interface TabsProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'rewards',     label: 'Rewards',     icon: '🎁' },
  { id: 'vouchers',    label: 'Vouchers',    icon: '🎟️' },
  { id: 'history',     label: 'History',     icon: '📜' },
  { id: 'leaderboard', label: 'Leaders',     icon: '🏆' },
  { id: 'secret',      label: 'Secret',      icon: '🔮' },
]

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <nav className="tabs" aria-label="Wallet sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
