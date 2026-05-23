import { useEffect, useState } from 'react'
import { collection, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import type { Customer } from '../../types'
import * as XLSX from 'xlsx'

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
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
    })
  } catch { return '—' }
}

function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 4) return '••••••'
  return '••••••' + mobile.slice(-4)
}

interface Redemption {
  id: string; userId: string; userName: string; rewardName: string
  cost: number; status: string; voucherCode: string
  createdAt: string; fulfilledAt: string; expiresAt: string
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

export default function UsersDashboard() {
  const [users,       setUsers]       = useState<Customer[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [sortBy,      setSortBy]      = useState<'coins' | 'visits' | 'streak' | 'createdAt'>('coins')

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const data: Customer[] = snap.docs
        .filter((doc) => !doc.data()._note)
        .map((doc) => {
          const d = doc.data()
          return {
            id:            doc.id,
            name:          d.name      ?? '',
            mobile:        d.mobile    ?? '',
            coins:         Number(d.coins   ?? 0),
            visits:        Number(d.visits  ?? 0),
            streak:        Number(d.streak  ?? 0),
            createdAt:     toISO(d.createdAt),
            lastVisitTime: toISO(d.lastVisitTime),
          }
        })
      setUsers(data)
      setLoading(false)
    })
    return unsubUsers
  }, [])

  useEffect(() => {
    const unsubRedemptions = onSnapshot(collection(db, 'redemptions'), (snap) => {
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
            expiresAt:   toISO(d.expiresAt),
          }
        })
      setRedemptions(data)
    })
    return unsubRedemptions
  }, [])

  const filtered = users
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search)
    )
    .sort((a, b) => {
      if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return (b[sortBy] as number) - (a[sortBy] as number)
    })

  const fileDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).replace(/ /g, '-')

  function handleDownloadExcel() {
    const wb = XLSX.utils.book_new()

    const userRows = users.sort((a, b) => b.coins - a.coins).map((u, idx) => {
      const userRedemptions = redemptions.filter((r) => r.userId === u.id)
      return {
        '#':                     idx + 1,
        'Name':                  u.name   || '—',
        'Mobile':                u.mobile || '—',
        'Coins Balance':         u.coins,
        'Total Visits':          u.visits,
        'Current Streak':        u.streak,
        'Total Redemptions':     userRedemptions.length,
        'Pending Redemptions':   userRedemptions.filter((r) => r.status === 'pending').length,
        'Fulfilled Redemptions': userRedemptions.filter((r) => r.status === 'fulfilled' || r.status === 'redeemed').length,
        'Coins Redeemed':        userRedemptions.filter((r) => r.status === 'fulfilled' || r.status === 'redeemed').reduce((s, r) => s + r.cost, 0),
        'Joined Date':           formatDate(u.createdAt),
        'Joined Time':           formatDateTime(u.createdAt),
        'Last Visit Date':       formatDate(u.lastVisitTime ?? ''),
        'Last Visit Time':       formatDateTime(u.lastVisitTime ?? ''),
        'User ID':               u.id,
      }
    })
    const wsUsers = XLSX.utils.json_to_sheet(userRows)
    wsUsers['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 13 },
      { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 15 },
      { wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Users')

    const redemptionRows = redemptions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((r, idx) => ({
        '#':             idx + 1,
        'Customer Name': r.userName    || '—',
        'Reward':        r.rewardName  || '—',
        'Coins Cost':    r.cost,
        'Status':        r.status,
        'Voucher Code':  r.voucherCode || '—',
        'Requested At':  formatDateTime(r.createdAt),
        'Fulfilled At':  formatDateTime(r.fulfilledAt),
        'Expires At':    formatDate(r.expiresAt),
        'User ID':       r.userId,
      }))
    const wsRedemptions = XLSX.utils.json_to_sheet(redemptionRows)
    wsRedemptions['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
      { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, wsRedemptions, 'Redemptions')
    XLSX.writeFile(wb, `momocoin-data-${fileDate}.xlsx`)
  }

  function handleDownloadCSV() {
    const headers = [
      '#', 'Name', 'Mobile', 'Coins Balance', 'Total Visits', 'Current Streak',
      'Total Redemptions', 'Pending Redemptions', 'Fulfilled Redemptions',
      'Coins Redeemed', 'Joined Date', 'Joined Time', 'Last Visit Date', 'Last Visit Time', 'User ID',
    ]
    const rows = users.sort((a, b) => b.coins - a.coins).map((u, idx) => {
      const userRedemptions = redemptions.filter((r) => r.userId === u.id)
      return [
        idx + 1, u.name || '—', u.mobile || '—', u.coins, u.visits, u.streak,
        userRedemptions.length,
        userRedemptions.filter((r) => r.status === 'pending').length,
        userRedemptions.filter((r) => r.status === 'fulfilled' || r.status === 'redeemed').length,
        userRedemptions.filter((r) => r.status === 'fulfilled' || r.status === 'redeemed').reduce((s, r) => s + r.cost, 0),
        formatDate(u.createdAt), formatDateTime(u.createdAt),
        formatDate(u.lastVisitTime ?? ''), formatDateTime(u.lastVisitTime ?? ''),
        u.id,
      ]
    })
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `momocoin-users-${fileDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Stats row */}
      <div className="ud-stats-row">
        <div className="ud-stat-pill">
          <span className="ud-stat-icon">👥</span>
          <span className="ud-stat-val">{users.length}</span>
          <span className="ud-stat-lbl">Total Users</span>
        </div>
        <div className="ud-stat-pill">
          <span className="ud-stat-icon">🪙</span>
          <span className="ud-stat-val">{users.reduce((s, u) => s + u.coins, 0).toLocaleString()}</span>
          <span className="ud-stat-lbl">Total Coins</span>
        </div>
        <div className="ud-stat-pill">
          <span className="ud-stat-icon">🔥</span>
          <span className="ud-stat-val">{users.filter((u) => u.streak >= 2).length}</span>
          <span className="ud-stat-lbl">Active Streaks</span>
        </div>
        <div className="ud-stat-pill">
          <span className="ud-stat-icon">🏪</span>
          <span className="ud-stat-val">{users.reduce((s, u) => s + u.visits, 0).toLocaleString()}</span>
          <span className="ud-stat-lbl">Total Visits</span>
        </div>
      </div>

      <section className="od-section">
        <SectionHeader icon="👥" title="All Users" />
        <div className="ud-controls">
          <input
            className="ud-search"
            type="text"
            placeholder="Search by name or mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="ud-sort-group">
            <span className="ud-sort-label">Sort by</span>
            {(['coins', 'visits', 'streak', 'createdAt'] as const).map((key) => (
              <button
                key={key}
                className={`ud-sort-btn ${sortBy === key ? 'ud-sort-btn--active' : ''}`}
                onClick={() => setSortBy(key)}
              >
                {key === 'createdAt' ? 'Newest' : key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <button
            className="ud-download-btn"
            onClick={handleDownloadExcel}
            disabled={loading || users.length === 0}
            title="Download all users as Excel"
          >
            ⬇ Export Excel
          </button>
          <button
            className="ud-download-btn ud-download-btn--csv"
            onClick={handleDownloadCSV}
            disabled={loading || users.length === 0}
            title="Download all users as CSV"
          >
            ⬇ Export CSV
          </button>
        </div>

        {loading ? (
          <div className="od-loading"><div className="od-spinner" /><span>Loading users…</span></div>
        ) : filtered.length === 0 ? (
          <div className="od-empty">No users found.</div>
        ) : (
          <div className="od-table-wrap">
            <table className="od-table">
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Mobile</th><th>Coins</th>
                  <th>Visits</th><th>Streak</th><th>Joined</th><th>Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <tr key={user.id}>
                    <td className="od-rank">{idx + 1}</td>
                    <td className="od-name">{user.name || '—'}</td>
                    <td className="od-mobile">{maskMobile(user.mobile)}</td>
                    <td className="od-coins">🪙 {user.coins.toLocaleString()}</td>
                    <td>{user.visits}</td>
                    <td>{user.streak >= 2 ? <span className="od-streak">🔥 {user.streak}</span> : user.streak || 0}</td>
                    <td className="od-date">{formatDate(user.createdAt)}</td>
                    <td className="od-date">{formatDate(user.lastVisitTime ?? '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
