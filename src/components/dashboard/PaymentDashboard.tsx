import { useEffect, useState } from 'react'
import { collection, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'

interface Redemption {
  id: string
  userId: string
  userName: string
  rewardName: string
  cost: number
  status: string
  voucherCode: string
  createdAt: string
  fulfilledAt: string
  fulfilledBy: string
  expiresAt: string
}

function toISO(value: unknown): string {
  if (!value) return ''
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return ''
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
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
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

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="od-section-header">
      <span className="od-section-icon">{icon}</span>
      <h2 className="od-section-title">{title}</h2>
      <div className="od-section-line" />
    </div>
  )
}

export default function PaymentDashboard() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'fulfilled' | 'expired'>('all')
  const [search,      setSearch]      = useState('')

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'redemptions'), (snap) => {
      const data: Redemption[] = snap.docs
        .filter((doc) => !doc.data()._note)
        .map((doc) => {
          const d = doc.data()
          return {
            id:          doc.id,
            userId:      d.userId      ?? '',
            userName:    d.userName    ?? '',
            rewardName:  d.rewardName  ?? 'Unknown',
            cost:        Number(d.cost ?? 0),
            status:      d.status      ?? 'pending',
            voucherCode: d.voucherCode ?? '',
            createdAt:   toISO(d.createdAt),
            fulfilledAt: toISO(d.fulfilledAt),
            fulfilledBy: d.fulfilledBy ?? '',
            expiresAt:   toISO(d.expiresAt),
          }
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setRedemptions(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const filtered = redemptions.filter((r) => {
    const matchStatus = filter === 'all' || r.status === filter
    const matchSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.rewardName.toLowerCase().includes(search.toLowerCase()) ||
      r.voucherCode.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const pending   = redemptions.filter((r) => r.status === 'pending').length
  const redeemed  = redemptions.filter((r) => r.status === 'fulfilled' || r.status === 'redeemed').length
  const totalCost = redemptions
    .filter((r) => r.status === 'fulfilled' || r.status === 'redeemed')
    .reduce((s, r) => s + r.cost, 0)

  return (
    <div>
      {/* Stats row */}
      <div className="ud-stats-row">
        <div className="ud-stat-pill">
          <span className="ud-stat-icon">🎟️</span>
          <span className="ud-stat-val">{redemptions.length}</span>
          <span className="ud-stat-lbl">Total Redemptions</span>
        </div>
        <div className="ud-stat-pill ud-stat-pill--orange">
          <span className="ud-stat-icon">⏳</span>
          <span className="ud-stat-val">{pending}</span>
          <span className="ud-stat-lbl">Pending</span>
        </div>
        <div className="ud-stat-pill ud-stat-pill--green">
          <span className="ud-stat-icon">✅</span>
          <span className="ud-stat-val">{redeemed}</span>
          <span className="ud-stat-lbl">Fulfilled</span>
        </div>
        <div className="ud-stat-pill ud-stat-pill--red">
          <span className="ud-stat-icon">🪙</span>
          <span className="ud-stat-val">{totalCost.toLocaleString()}</span>
          <span className="ud-stat-lbl">Coins Spent</span>
        </div>
      </div>

      {/* Table */}
      <section className="od-section">
        <SectionHeader icon="🎟️" title="All Redemptions" />
        <div className="ud-controls">
          <input
            className="ud-search"
            type="text"
            placeholder="Search by name, reward or voucher code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="ud-sort-group">
            <span className="ud-sort-label">Filter</span>
            {(['all', 'pending', 'fulfilled', 'expired'] as const).map((s) => (
              <button
                key={s}
                className={`ud-sort-btn ${filter === s ? 'ud-sort-btn--active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="od-loading"><div className="od-spinner" /><span>Loading redemptions…</span></div>
        ) : filtered.length === 0 ? (
          <div className="od-empty">No redemptions found.</div>
        ) : (
          <div className="od-table-wrap">
            <table className="od-table">
              <thead>
                <tr>
                  <th>#</th><th>Customer</th><th>Reward</th><th>Cost (Coins)</th>
                  <th>Voucher Code</th><th>Status</th><th>Requested</th>
                  <th>Fulfilled</th><th>Fulfilled By</th><th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending
                  return (
                    <tr key={r.id}>
                      <td className="od-rank">{idx + 1}</td>
                      <td className="od-name">{r.userName || '—'}</td>
                      <td><span style={{ marginRight: 6 }}>{getRewardIcon(r.rewardName)}</span>{r.rewardName}</td>
                      <td className="od-coins">🪙 {r.cost.toLocaleString()}</td>
                      <td>{r.voucherCode ? <span className="ud-voucher">{r.voucherCode}</span> : <span className="od-date">—</span>}</td>
                      <td><span className={`od-status ${s.cls}`}>{s.label}</span></td>
                      <td className="od-date">{formatDateTime(r.createdAt)}</td>
                      <td className="od-date">{formatDateTime(r.fulfilledAt ?? '')}</td>
                      <td className="od-date">{r.fulfilledBy || '—'}</td>
                      <td className="od-date">{formatDate(r.expiresAt ?? '')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
