import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'

export interface DashboardStats {
  totalCustomers: number
  totalCoins: number
  totalVisits: number
  pendingRedemptions: number
  redeemedRedemptions: number
  visitsToday: number
  coinsAwardedToday: number
  activeStreaks: number
  topCustomers: {
    id: string; name: string; mobile: string
    coins: number; visits: number; streak: number; createdAt: string
  }[]
  recentSignups: { id: string; name: string; mobile: string; createdAt: string }[]
  recentRedemptions: {
    id: string; userName: string; rewardName: string; status: string; createdAt: string
  }[]
  redemptionBreakdown: Record<string, number>
  visitsOverTime: { date: string; visits: number }[]
  coinsOverTime: { date: string; coins: number }[]
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function fetchStats() {
    setLoading(true)
    setError(null)
    try {
      const usersSnap = await getDocs(collection(db, 'users'))
      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any))

      const today = todayStr()
      const days = last7Days()

      let totalCoins = 0, totalVisits = 0, visitsToday = 0, coinsAwardedToday = 0, activeStreaks = 0
      const visitsMap: Record<string, number> = {}
      const coinsMap: Record<string, number> = {}
      days.forEach(d => { visitsMap[d] = 0; coinsMap[d] = 0 })

      for (const u of users) {
        totalCoins += u.coins || 0
        totalVisits += u.visits || 0
        if ((u.streak || 0) >= 2) activeStreaks++
        if (u.lastClaimDate === today) {
          visitsToday++
          coinsAwardedToday += u.claimsToday || 0
        }
        const day = (u.createdAt || '').slice(0, 10)
        if (visitsMap[day] !== undefined) visitsMap[day]++
        if (coinsMap[day] !== undefined) coinsMap[day] += u.coins || 0
      }

      const topCustomers = [...users]
        .sort((a, b) => (b.coins || 0) - (a.coins || 0))
        .slice(0, 5)
        .map(u => ({
          id: u.id, name: u.name || '', mobile: u.mobile || '',
          coins: u.coins || 0, visits: u.visits || 0,
          streak: u.streak || 0, createdAt: u.createdAt || ''
        }))

      const recentSignups = [...users]
        .sort((a, b) => (b.createdAt || '') > (a.createdAt || '') ? 1 : -1)
        .slice(0, 8)
        .map(u => ({ id: u.id, name: u.name || '', mobile: u.mobile || '', createdAt: u.createdAt || '' }))

      // Redemptions
      let pendingRedemptions = 0, redeemedRedemptions = 0
      const redemptionBreakdown: Record<string, number> = {}
      const recentRedemptions: DashboardStats['recentRedemptions'] = []

      try {
        const redSnap = await getDocs(query(collection(db, 'redemptions'), orderBy('createdAt', 'desc'), limit(50)))
        for (const d of redSnap.docs) {
          const r = { id: d.id, ...d.data() } as any
          if (r.status === 'pending') {
            pendingRedemptions++
            redemptionBreakdown[r.rewardName] = (redemptionBreakdown[r.rewardName] || 0) + 1
          }
          if (r.status === 'redeemed' || r.status === 'fulfilled') redeemedRedemptions++
          if (recentRedemptions.length < 10) {
            recentRedemptions.push({
              id: r.id, userName: r.userName || r.userId || '—',
              rewardName: r.rewardName || '—', status: r.status || 'pending',
              createdAt: r.createdAt || ''
            })
          }
        }
      } catch { /* redemptions collection may not exist yet */ }

      setStats({
        totalCustomers: users.length,
        totalCoins, totalVisits,
        pendingRedemptions, redeemedRedemptions,
        visitsToday, coinsAwardedToday, activeStreaks,
        topCustomers, recentSignups, recentRedemptions, redemptionBreakdown,
        visitsOverTime: days.map(d => ({ date: d, visits: visitsMap[d] })),
        coinsOverTime: days.map(d => ({ date: d, coins: coinsMap[d] })),
      })
      setLastUpdated(new Date())
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard data')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30_000)
    return () => clearInterval(interval)
  }, [])

  return { stats, loading, error, lastUpdated }
}
