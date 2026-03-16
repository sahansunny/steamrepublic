import { doc, getDoc, updateDoc, collection, addDoc, query, orderBy, getDocs, limit, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { User, Transaction, RedemptionVoucher } from '../types'

// Cache for user data to reduce Firebase calls
const userCache = new Map<string, { data: User; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

// Generate unique voucher code
const generateVoucherCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'MOMO-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate unique barcode for user
export const generateUserBarcode = (userId: string, mobile: string): string => {
  // Create a unique barcode using user ID and mobile number
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
  const mobileHash = mobile.slice(-4) // Last 4 digits of mobile
  const userHash = userId.replace('USER', '').slice(0, 4) // First 4 digits of mobile from userId
  
  return `SR${userHash}${mobileHash}${timestamp}` // Steam Republic + unique identifier
}

// Real-time user listener
export const subscribeToUser = (userId: string, callback: (user: User | null) => void): (() => void) => {
  const userRef = doc(db, 'users', userId)
  
  return onSnapshot(userRef, async (doc) => {
    if (!doc.exists()) {
      callback(null)
      return
    }
    
    try {
      // Get recent history
      const historyRef = collection(db, 'users', userId, 'history')
      const historyQuery = query(historyRef, orderBy('date', 'desc'), limit(20))
      const historySnapshot = await getDocs(historyQuery)
      
      const history: Transaction[] = []
      historySnapshot.forEach((historyDoc) => {
        const data = historyDoc.data()
        if (data.coins) {
          history.push(data as Transaction)
        }
      })
      
      const user = {
        ...doc.data(),
        history
      } as User

      // Update cache
      userCache.set(userId, { data: user, timestamp: Date.now() })
      
      callback(user)
    } catch (error) {
      console.error('Error in user subscription:', error)
      callback(null)
    }
  })
}

// Process barcode scan and award coins
export const processBarcodeVisit = async (barcode: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Find user by barcode
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('barcode', '==', barcode))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return { success: false, message: 'Invalid barcode. User not found.' }
    }
    
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    const userId = userDoc.id
    
    const today = new Date().toDateString()
    const now = new Date()
    
    // Check if user already visited today
    if (userData.lastClaimDate === today && userData.claimsToday >= 1) {
      return { 
        success: false, 
        message: `${userData.name} has already visited today. Next visit: tomorrow.`,
        user: userData as User
      }
    }
    
    // Award 10 coins for barcode scan visit
    const visitCoins = 10
    const newCoins = userData.coins + visitCoins
    const newVisits = userData.visits + 1
    
    // Calculate streak
    const lastVisit = userData.lastClaimDate ? new Date(userData.lastClaimDate) : null
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let newStreak = userData.streak || 0
    if (lastVisit && lastVisit.toDateString() === yesterday.toDateString()) {
      newStreak += 1
    } else if (!lastVisit || lastVisit.toDateString() !== today) {
      newStreak = 1
    }
    
    // Update user document
    await updateDoc(doc(db, 'users', userId), {
      coins: newCoins,
      visits: newVisits,
      streak: newStreak,
      lastClaimDate: today,
      claimsToday: 1,
      lastVisitTime: now.toISOString()
    })
    
    // Add transaction to history
    await addDoc(collection(db, 'users', userId, 'history'), {
      coins: visitCoins,
      reason: 'Barcode Scan Visit',
      code: barcode,
      date: now.toISOString()
    })
    
    // Clear cache for this user
    userCache.delete(userId)
    
    // Get updated user data
    const updatedUser = await getUserById(userId)
    
    return {
      success: true,
      message: `Welcome ${userData.name}! +${visitCoins} coins awarded. Total: ${newCoins} coins`,
      user: updatedUser || undefined
    }
  } catch (error) {
    console.error('Error processing barcode visit:', error)
    return { success: false, message: 'Failed to process barcode scan. Please try again.' }
  }
}

// Get user by mobile number (for staff identification)
export const getUserByMobile = async (mobile: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('mobile', '==', mobile))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) return null
    
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    
    // Get limited recent history
    const historyRef = collection(db, 'users', userDoc.id, 'history')
    const historyQuery = query(historyRef, orderBy('date', 'desc'), limit(10))
    const historySnapshot = await getDocs(historyQuery)
    
    const history: Transaction[] = []
    historySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.coins) {
        history.push(data as Transaction)
      }
    })
    
    return {
      ...userData,
      history
    } as User
  } catch (error) {
    console.error('Error fetching user by mobile:', error)
    return null
  }
}

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // Check cache first
    const cached = userCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) return null
    
    // Get limited recent history for better performance
    const historyRef = collection(db, 'users', userId, 'history')
    const historyQuery = query(historyRef, orderBy('date', 'desc'), limit(20)) // Limit to 20 recent transactions
    const historySnapshot = await getDocs(historyQuery)
    
    const history: Transaction[] = []
    historySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.coins) { // Skip the init document
        history.push(data as Transaction)
      }
    })
    
    const user = {
      ...userDoc.data(),
      history
    } as User

    // Cache the result
    userCache.set(userId, { data: user, timestamp: Date.now() })
    
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export const updateUserCoins = async (
  userId: string,
  coins: number,
  reason: string,
  code?: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) throw new Error('User not found')
    
    const userData = userDoc.data()
    const today = new Date().toDateString()
    
    // Update user document
    await updateDoc(userRef, {
      coins: userData.coins + coins,
      visits: userData.visits + 1,
      lastClaimDate: today,
      claimsToday: userData.lastClaimDate === today ? (userData.claimsToday || 0) + 1 : 1
    })
    
    // Add transaction to history subcollection
    await addDoc(collection(db, 'users', userId, 'history'), {
      coins,
      reason,
      code: code || null,
      date: new Date().toISOString()
    })

    // Clear cache for this user
    userCache.delete(userId)
  } catch (error) {
    console.error('Error updating user coins:', error)
    throw error
  }
}

export const redeemReward = async (
  userId: string,
  rewardName: string,
  cost: number
): Promise<{ success: boolean; voucherCode?: string; message: string }> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      return { success: false, message: 'User not found' }
    }
    
    const userData = userDoc.data()
    
    if (userData.coins < cost) {
      return { success: false, message: 'Insufficient coins' }
    }
    
    // Generate voucher code and expiry (7 days from now)
    const voucherCode = generateVoucherCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    // Create redemption voucher (simplified object)
    const voucher = {
      userId,
      userName: userData.name || 'Unknown User',
      rewardName,
      cost,
      voucherCode,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    }
    
    // Batch operations for better performance
    const promises = [
      addDoc(collection(db, 'redemptions'), voucher),
      updateDoc(userRef, { coins: userData.coins - cost }),
      addDoc(collection(db, 'users', userId, 'history'), {
        coins: -cost,
        reason: `Redeemed: ${rewardName}`,
        code: voucherCode,
        date: new Date().toISOString()
      })
    ]

    await Promise.all(promises)

    // Clear cache for this user
    userCache.delete(userId)
    
    return { 
      success: true, 
      voucherCode, 
      message: `Reward redeemed successfully! Your voucher code is: ${voucherCode}. Valid for 7 days.` 
    }
  } catch (error) {
    console.error('Error redeeming reward:', error)
    return { success: false, message: `Failed to redeem reward: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

// Cache for all users data
let allUsersCache: { data: Record<string, User>; timestamp: number } | null = null

export const getAllUsers = async (): Promise<Record<string, User>> => {
  try {
    // Check cache first
    if (allUsersCache && Date.now() - allUsersCache.timestamp < CACHE_DURATION) {
      return allUsersCache.data
    }

    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    const users: Record<string, User> = {}
    
    // Process users in parallel for better performance
    const userPromises = snapshot.docs.map(async (doc) => {
      const userData = doc.data()
      
      // Get limited recent history for each user
      const historyRef = collection(db, 'users', doc.id, 'history')
      const historyQuery = query(historyRef, orderBy('date', 'desc'), limit(10)) // Reduced limit
      const historySnapshot = await getDocs(historyQuery)
      
      const history: Transaction[] = []
      historySnapshot.forEach((historyDoc) => {
        const data = historyDoc.data()
        if (data.coins) {
          history.push(data as Transaction)
        }
      })
      
      return {
        id: doc.id,
        user: {
          ...userData,
          history
        } as User
      }
    })

    const userResults = await Promise.all(userPromises)
    
    userResults.forEach(({ id, user }) => {
      users[id] = user
    })

    // Cache the result
    allUsersCache = { data: users, timestamp: Date.now() }
    
    return users
  } catch (error) {
    console.error('Error fetching all users:', error)
    return {}
  }
}

// Get all redemptions for staff (including fulfilled ones)
export const getPendingRedemptions = async (): Promise<RedemptionVoucher[]> => {
  try {
    const redemptionsRef = collection(db, 'redemptions')
    const q = query(redemptionsRef, orderBy('createdAt', 'desc'), limit(100)) // Increased limit to show more redemptions
    const snapshot = await getDocs(q)
    
    const redemptions: RedemptionVoucher[] = []
    snapshot.forEach((doc) => {
      const data = doc.data() as RedemptionVoucher
      // Return both pending and fulfilled redemptions (exclude only expired ones)
      if (new Date(data.expiresAt) > new Date() || data.status === 'fulfilled') {
        redemptions.push({ ...data, id: doc.id })
      }
    })
    
    return redemptions
  } catch (error) {
    console.error('Error fetching redemptions:', error)
    return []
  }
}

// Fulfill a redemption (for staff use)
export const fulfillRedemption = async (
  redemptionId: string,
  staffId: string
): Promise<boolean> => {
  try {
    const redemptionRef = doc(db, 'redemptions', redemptionId)
    await updateDoc(redemptionRef, {
      status: 'fulfilled',
      fulfilledAt: new Date().toISOString(),
      fulfilledBy: staffId
    })
    return true
  } catch (error) {
    console.error('Error fulfilling redemption:', error)
    return false
  }
}

// Get user's active vouchers
export const getUserVouchers = async (userId: string): Promise<RedemptionVoucher[]> => {
  try {
    const redemptionsRef = collection(db, 'redemptions')
    const q = query(redemptionsRef, orderBy('createdAt', 'desc'), limit(20)) // Limit results
    const snapshot = await getDocs(q)
    
    const vouchers: RedemptionVoucher[] = []
    snapshot.forEach((doc) => {
      const data = doc.data() as RedemptionVoucher
      if (data.userId === userId && new Date(data.expiresAt) > new Date()) {
        vouchers.push({ ...data, id: doc.id })
      }
    })
    
    return vouchers
  } catch (error) {
    console.error('Error fetching user vouchers:', error)
    return []
  }
}