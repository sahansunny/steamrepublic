import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { useDashboard } from '../../hooks/useDashboard'
import KpiCard from './KpiCard'
import Chart from './Charts'
import UsersDashboard from './UsersDashboard'
import PaymentDashboard from './PaymentDashboard'
import { Icons, GridBackground, NoiseTexture, LiveRings } from './Icons'
import './OwnerDashboard.css'

type Page = 'overview' | 'users' | 'payments'

function LiveBadge() {
  return (
    <span className="od-live-badge">
      <LiveRings />
      LIVE
    </span>
  )
}

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="od-header-right">
      <div className="od-date-display">
        {time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
      </div>
      <div className="od-time-display">
        {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </div>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="od-section-header">
      <span className="od-section-icon">{icon}</span>
      <h2 className="od-section-title">{title}</h2>
      <div className="od-section-line" />
    </div>
  )
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 4) return '••••••'
  return '••••••' + mobile.slice(-4)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
    })
  } catch { return '—' }
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  } catch { return '—' }
}

const REWARD_ICONS: Record<string, string> = {
  momo: '🥟', drink: '🥤', dessert: '🍮', meal: '🍱', '10%': '🏷️', '20%': '🏷️',
}
function getRewardIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(REWARD_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '🎁'
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'od-status--pending'  },
  fulfilled: { label: 'Fulfilled', cls: 'od-status--redeemed' },
  redeemed:  { label: 'Redeemed',  cls: 'od-status--redeemed' },
  expired:   { label: 'Expired',   cls: 'od-status--expired'  },
}

interface OwnerDashboardProps {
  onBack?: () => void
}

export default function OwnerDashboard({ onBack }: OwnerDashboardProps) {
  const { stats, loading, error, lastUpdated } = useDashboard()
  const [page, setPage] = useState<Page>('overview')

  async function handleSignOut() {
    await signOut(auth)
    onBack?.()
  }

  const PAGE_TITLES: Record<Page, string> = {
    overview: 'Owner Dashboard',
    users:    'Users Dashboard',
    payments: 'Payment Dashboard',
  }

  return (
    <div className="od-root">
      <GridBackground />
      <NoiseTexture />
      <div className="od-layout">

        {/* ── Sidebar ── */}
        <aside className="od-sidebar">
          <div className="od-sidebar-logo">
            <img src="/Steamreublic.png" alt="Logo" width="42" height="42" style={{ display: 'block', borderRadius: '50%' }} />
          </div>
          <div className="od-sidebar-divider" />

          <button
            className={`od-nav-btn ${page === 'overview' ? 'od-nav-btn--active' : ''}`}
            onClick={() => setPage('overview')}
            title="Overview" aria-label="Overview Dashboard"
          >
            <span className="od-nav-icon">{Icons.overview}</span>
            <span className="od-nav-label">Overview</span>
          </button>

          <button
            className={`od-nav-btn ${page === 'users' ? 'od-nav-btn--active' : ''}`}
            onClick={() => setPage('users')}
            title="Users Dashboard" aria-label="Users Dashboard"
          >
            <span className="od-nav-icon">{Icons.users}</span>
            <span className="od-nav-label">Users</span>
          </button>

          <button
            className={`od-nav-btn ${page === 'payments' ? 'od-nav-btn--active' : ''}`}
            onClick={() => setPage('payments')}
            title="Payment Dashboard" aria-label="Payment Dashboard"
          >
            <span className="od-nav-icon">{Icons.payments}</span>
            <span className="od-nav-label">Payments</span>
          </button>

          <div className="od-sidebar-divider" />

          <button
            className="od-sidebar-signout"
            onClick={handleSignOut}
            title="Sign Out" aria-label="Sign Out"
          >
            {Icons.signout}
          </button>
        </aside>

        {/* ── Main ── */}
        <main className="od-main">
          {/* Header */}
          <header className="od-header">
            <div className="od-header-left">
              <h1 className="od-title">{PAGE_TITLES[page]}</h1>
              <div className="od-header-meta">
                {page === 'overview' && stats && <LiveBadge />}
                {page === 'overview' && lastUpdated && (
                  <span className="od-updated">
                    Synced {lastUpdated.toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
            <Clock />
          </header>

          {/* ── Users page ── */}
          {page === 'users' && <UsersDashboard />}

          {/* ── Payments page ── */}
          {page === 'payments' && <PaymentDashboard />}

          {/* ── Overview page ── */}
          {page === 'overview' && (
            <>
              {error && <div className="od-error" role="alert">⚠️ {error}</div>}

              {loading && !stats && (
                <div className="od-loading">
                  <div className="od-spinner" />
                  <span>Connecting to live data…</span>
                </div>
              )}

              {stats && (
                <div className={loading ? 'od-content--faded' : ''}>

                  {/* Overview KPIs */}
                  <section className="od-section">
                    <SectionHeader icon="◈" title="Overview" />
                    <div className="od-kpi-grid">
                      <KpiCard icon="👥" value={formatNumber(stats.totalCustomers)}      label="Total Customers"      accent="blue"   />
                      <KpiCard icon="🪙" value={formatNumber(stats.totalCoins)}          label="Coins in Circulation" accent="gold"   />
                      <KpiCard icon="🏪" value={formatNumber(stats.totalVisits)}         label="Total Visits"         accent="green"  />
                      <KpiCard icon="🎟️" value={formatNumber(stats.pendingRedemptions)}  label="Pending Redemptions"  accent="orange" />
                      <KpiCard icon="✅" value={formatNumber(stats.redeemedRedemptions)} label="Redeemed Rewards"     accent="cyan"   />
                    </div>
                  </section>

                  {/* Today */}
                  <section className="od-section">
                    <SectionHeader icon="◈" title="Today's Activity" />
                    <div className="od-today-grid">
                      <KpiCard icon="📅" value={String(stats.visitsToday)}       label="Visits Today"        accent="cyan"   topBorder />
                      <KpiCard icon="✨" value={String(stats.coinsAwardedToday)} label="Coins Awarded Today" accent="gold"   topBorder />
                      <KpiCard icon="🔥" value={String(stats.activeStreaks)}     label="Active Streaks"      accent="purple" topBorder />
                    </div>
                  </section>

                  {/* Charts */}
                  <section className="od-section">
                    <SectionHeader icon="◈" title="Last 7 Days" />
                    <div className="od-charts-grid">
                      <Chart
                        data={stats.visitsOverTime.map((d) => ({ date: d.date, value: d.visits }))}
                        color="#06b6d4" type="bar" label="Daily Visits"
                      />
                      <Chart
                        data={stats.coinsOverTime.map((d) => ({ date: d.date, value: d.coins }))}
                        color="#ffd700" type="area" label="Coins Awarded"
                      />
                    </div>
                  </section>

                  {/* Top Customers */}
                  <section className="od-section">
                    <SectionHeader icon="🏆" title="Top 5 Customers" />
                    {stats.topCustomers.length === 0 ? (
                      <div className="od-empty">No customers yet.</div>
                    ) : (
                      <div className="od-table-wrap">
                        <table className="od-table">
                          <thead>
                            <tr>
                              <th>Rank</th><th>Name</th><th>Mobile</th>
                              <th>Coins</th><th>Visits</th><th>Streak</th><th>Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.topCustomers.map((user, idx) => (
                              <tr key={user.id} className={idx === 0 ? 'od-row--gold' : ''}>
                                <td className="od-rank">{idx === 0 ? '👑' : `#${idx + 1}`}</td>
                                <td className="od-name">{user.name || '—'}</td>
                                <td className="od-mobile">{maskMobile(user.mobile)}</td>
                                <td className="od-coins">🪙 {user.coins.toLocaleString()}</td>
                                <td>{user.visits}</td>
                                <td>{user.streak >= 2
                                  ? <span className="od-streak">🔥 {user.streak}</span>
                                  : user.streak || 0}
                                </td>
                                <td className="od-date">{formatDate(user.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  {/* Redemptions */}
                  <section className="od-section">
                    <SectionHeader icon="🎟️" title="Redemptions" />
                    <div className="od-charts-grid">
                      <div>
                        <p className="chart-label" style={{ marginBottom: 12 }}>Pending by Reward</p>
                        {Object.keys(stats.redemptionBreakdown).length === 0 ? (
                          <div className="od-empty">No pending redemptions.</div>
                        ) : (
                          <ul className="od-reward-list">
                            {Object.entries(stats.redemptionBreakdown)
                              .sort(([, a], [, b]) => b - a)
                              .map(([name, count]) => (
                                <li key={name} className="od-reward-item">
                                  <span className="od-reward-icon">{getRewardIcon(name)}</span>
                                  <span className="od-reward-name">{name}</span>
                                  <span className="od-reward-count">{count}</span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <p className="chart-label" style={{ marginBottom: 12 }}>Recent Activity</p>
                        {stats.recentRedemptions.length === 0 ? (
                          <div className="od-empty">No redemptions yet.</div>
                        ) : (
                          <div className="od-table-wrap">
                            <table className="od-table">
                              <thead>
                                <tr><th>Customer</th><th>Reward</th><th>Status</th><th>Date</th></tr>
                              </thead>
                              <tbody>
                                {stats.recentRedemptions.map((r) => {
                                  const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending
                                  return (
                                    <tr key={r.id}>
                                      <td className="od-name">{r.userName || '—'}</td>
                                      <td><span style={{ marginRight: 6 }}>{getRewardIcon(r.rewardName)}</span>{r.rewardName}</td>
                                      <td><span className={`od-status ${s.cls}`}>{s.label}</span></td>
                                      <td className="od-date">{formatDateTime(r.createdAt)}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Recent Signups */}
                  <section className="od-section">
                    <SectionHeader icon="🆕" title="Recent Signups" />
                    {stats.recentSignups.length === 0 ? (
                      <div className="od-empty">No signups yet.</div>
                    ) : (
                      <ul className="od-signup-list">
                        {stats.recentSignups.map((user) => (
                          <li key={user.id} className="od-signup-item">
                            <div className="od-avatar">{(user.name || '?').charAt(0).toUpperCase()}</div>
                            <div className="od-signup-info">
                              <span className="od-signup-name">{user.name || 'Unknown'}</span>
                              <span className="od-signup-mobile">{maskMobile(user.mobile)}</span>
                            </div>
                            <span className="od-signup-date">{formatDate(user.createdAt)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
