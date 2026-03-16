import { useState, useEffect, Suspense, lazy } from 'react'
import UltimateLoader from './components/UltimateLoader.tsx'
import Notification from './components/Notification.tsx'
import ConfirmDialog from './components/ConfirmDialog.tsx'
import { getUserById, updateUserCoins, getAllUsers, redeemReward, subscribeToUser } from './services/userService'
import { User } from './types.ts'

// Lazy load components for better performance
const Signup = lazy(() => import('./components/Signup.tsx'))
const Login = lazy(() => import('./components/Login.tsx'))
const Wallet = lazy(() => import('./components/Wallet.tsx'))
const AdminPanel = lazy(() => import('./components/AdminPanel.tsx'))
const AdminToggle = lazy(() => import('./components/AdminToggle.tsx'))
const AdminLogin = lazy(() => import('./components/AdminLogin.tsx'))
const ClaimCoins = lazy(() => import('./components/ClaimCoins.tsx'))
const CodeGenerator = lazy(() => import('./components/CodeGenerator.tsx'))
const StaffDashboard = lazy(() => import('./components/StaffDashboard.tsx'))
const ParticleSystem = lazy(() => import('./components/ParticleSystem.tsx'))
const NeuralBackground = lazy(() => import('./components/NeuralBackground.tsx'))

type Screen = 'signup' | 'login' | 'wallet' | 'admin-login' | 'admin' | 'claim' | 'generator' | 'staff'

// Simplified scroll to top utility function
const scrollToTop = () => {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    // Fallback for older browsers
    setTimeout(() => window.scrollTo(0, 0), 100)
  } catch (error) {
    window.scrollTo(0, 0)
  }
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; role: string } | null>(null)
  const [allUsers, setAllUsers] = useState<Record<string, User>>({})
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [confirmLogout, setConfirmLogout] = useState<(() => void) | null>(null)

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
  }

  // Real-time user subscription
  useEffect(() => {
    if (!currentUser) return

    let previousCoins = currentUser.coins
    let previousVisits = currentUser.visits

    const unsubscribe = subscribeToUser(currentUser.id, (updatedUser) => {
      if (updatedUser) {
        // Check if coins increased due to barcode scan
        if (updatedUser.coins > previousCoins && updatedUser.visits > previousVisits) {
          const coinsAdded = updatedUser.coins - previousCoins
          showNotification(`🎉 +${coinsAdded} coins added! Visit recorded successfully.`, 'success')
        }
        
        setCurrentUser(updatedUser)
        previousCoins = updatedUser.coins
        previousVisits = updatedUser.visits
      }
    })

    return unsubscribe
  }, [currentUser?.id])

  // Load all users for leaderboard
  const loadAllUsers = async () => {
    const users = await getAllUsers()
    setAllUsers(users)
  }

  useEffect(() => {
    loadAllUsers()
    scrollToTop()
  }, [])

  // Scroll to top whenever screen changes
  useEffect(() => {
    scrollToTop()
  }, [currentScreen])

  // Handle browser navigation and page events
  useEffect(() => {
    const handleNavigation = () => scrollToTop()
    
    window.addEventListener('popstate', handleNavigation)
    window.addEventListener('pageshow', handleNavigation)
    window.addEventListener('focus', handleNavigation)
    
    return () => {
      window.removeEventListener('popstate', handleNavigation)
      window.removeEventListener('pageshow', handleNavigation)
      window.removeEventListener('focus', handleNavigation)
    }
  }, [])

  const handleSignupSuccess = async (userId: string) => {
    setLoading(true)
    scrollToTop()
    const user = await getUserById(userId)
    if (user) {
      setCurrentUser(user)
      setCurrentScreen('wallet')
      await loadAllUsers()
    }
    setLoading(false)
    scrollToTop()
  }

  const handleLoginSuccess = async (userId: string) => {
    setLoading(true)
    scrollToTop()
    const user = await getUserById(userId)
    if (user) {
      setCurrentUser(user)
      setCurrentScreen('wallet')
      await loadAllUsers()
    }
    setLoading(false)
    scrollToTop()
  }

  // Ask for confirmation before any logout
  const requestLogout = (onConfirmed: () => void) => {
    setConfirmLogout(() => onConfirmed)
  }

  const handleLogout = () => {
    requestLogout(() => {
      setCurrentUser(null)
      setCurrentScreen('login')
      scrollToTop()
    })
  }

  const handleAdminLoginSuccess = (adminId: string, role: string) => {
    scrollToTop()
    setCurrentAdmin({ id: adminId, role })
    // Route based on role
    if (role === 'staff') {
      setCurrentScreen('staff')
    } else {
      setCurrentScreen('admin')
    }
    scrollToTop()
  }

  const handleAdminLogout = () => {
    requestLogout(() => {
      setCurrentAdmin(null)
      setCurrentScreen('admin-login')
      scrollToTop()
    })
  }

  const handleClaimSuccess = async (coins: number, _code: string) => {
    if (!currentUser) return
    // Transaction already committed in ClaimCoins — just reload and navigate
    const updatedUser = await getUserById(currentUser.id)
    if (updatedUser) setCurrentUser(updatedUser)
    await loadAllUsers()
    setCurrentScreen('wallet')
    scrollToTop()
    showNotification(`+${coins} MomoCoins added to your wallet 🎉`, 'success')
  }

  const handleAddCoins = async (customerId: string, coins: number, reason: string) => {
    try {
      await updateUserCoins(customerId, coins, `Admin: ${reason}`)
      if (currentUser && currentUser.id === customerId) {
        const updatedUser = await getUserById(customerId)
        if (updatedUser) setCurrentUser(updatedUser)
      }
      await loadAllUsers()
      showNotification(`Added ${coins} coins successfully`, 'success')
    } catch (error) {
      showNotification('Failed to add coins. Please check the user ID.', 'error')
    }
  }

  const handleRedeemReward = async (rewardName: string, cost: number) => {
    if (!currentUser) return
    scrollToTop()
    const result = await redeemReward(currentUser.id, rewardName, cost)
    if (result.success) {
      const updatedUser = await getUserById(currentUser.id)
      if (updatedUser) setCurrentUser(updatedUser)
      await loadAllUsers()
      showNotification(`🎉 ${result.message}`, 'success')
      setCurrentScreen('wallet')
      scrollToTop()
    } else {
      showNotification(`❌ ${result.message}`, 'error')
    }
  }

  if (loading) {
    return <UltimateLoader />
  }

  // Admin Login Screen
  if (currentScreen === 'admin-login') {
    // If already logged in, redirect to appropriate screen
    if (currentAdmin) {
      if (currentAdmin.role === 'staff') {
        setCurrentScreen('staff')
      } else {
        setCurrentScreen('admin')
      }
      return null
    }

    return (
      <Suspense fallback={<UltimateLoader />}>
        <NeuralBackground />
        <ParticleSystem />
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
        />
        <AdminToggle onClick={() => {
          scrollToTop()
          setCurrentScreen(currentUser ? 'wallet' : 'login')
        }} />
      </Suspense>
    )
  }

  // Admin Panel (Protected - Owner/Manager only)
  if (currentScreen === 'admin') {
    if (!currentAdmin || currentAdmin.role === 'staff') {
      setCurrentScreen('admin-login')
      return null
    }
    
    return (
      <Suspense fallback={<UltimateLoader />}>
        <NeuralBackground />
        <AdminPanel
          onAddCoins={handleAddCoins}
          onBack={handleAdminLogout}
          onStaffDashboard={() => {
            scrollToTop()
            setCurrentScreen('staff')
          }}
          adminRole={currentAdmin.role}
        />
        {confirmLogout && (
          <ConfirmDialog
            message="Are you sure you want to logout?"
            onConfirm={() => { const fn = confirmLogout; setConfirmLogout(null); fn() }}
            onCancel={() => setConfirmLogout(null)}
          />
        )}
      </Suspense>
    )
  }

  // Staff Dashboard (Protected)
  if (currentScreen === 'staff') {
    if (!currentAdmin) {
      setCurrentScreen('admin-login')
      return null
    }

    return (
      <Suspense fallback={<UltimateLoader />}>
        <NeuralBackground />
        <StaffDashboard
          staffId={currentAdmin.id}
          onBack={() => {
            scrollToTop()
            if (currentAdmin.role === 'staff') {
              setCurrentScreen('admin-login')
            } else {
              setCurrentScreen('admin')
            }
          }}
          onLogout={() => {
            requestLogout(() => {
              setCurrentAdmin(null)
              setCurrentScreen('admin-login')
              scrollToTop()
            })
          }}
        />
        {confirmLogout && (
          <ConfirmDialog
            message="Are you sure you want to logout?"
            onConfirm={() => { const fn = confirmLogout; setConfirmLogout(null); fn() }}
            onCancel={() => setConfirmLogout(null)}
          />
        )}
      </Suspense>
    )
  }

  // Code Generator (Protected - Owner/Manager only)
  if (currentScreen === 'generator') {
    if (!currentAdmin || currentAdmin.role === 'staff') {
      setCurrentScreen('admin-login')
      return null
    }
    
    return (
      <Suspense fallback={<UltimateLoader />}>
        <NeuralBackground />
        <CodeGenerator onBack={() => {
          scrollToTop()
          setCurrentScreen('admin')
        }} />
      </Suspense>
    )
  }

  // Customer Signup Screen
  if (currentScreen === 'signup') {
    return (
      <Suspense fallback={<UltimateLoader />}>
        <NeuralBackground />
        <ParticleSystem />
        <Signup 
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => {
            scrollToTop()
            setCurrentScreen('login')
          }}
        />
        <AdminToggle onClick={() => {
          scrollToTop()
          setCurrentScreen('admin-login')
        }} />
      </Suspense>
    )
  }

  // Customer Login Screen
  if (currentScreen === 'login') {
    return (
      <Suspense fallback={<UltimateLoader />}>
        <NeuralBackground />
        <ParticleSystem />
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => {
            scrollToTop()
            setCurrentScreen('signup')
          }}
          onAdminAccess={() => {
            scrollToTop()
            setCurrentScreen('admin-login')
          }}
        />
      </Suspense>
    )
  }

  // Claim Coins Screen
  if (currentScreen === 'claim' && currentUser) {
    return (
      <Suspense fallback={<UltimateLoader />}>
        <NeuralBackground />
        <ClaimCoins 
          userId={currentUser.id}
          onClaimSuccess={handleClaimSuccess}
          onBack={() => {
            scrollToTop()
            setCurrentScreen('wallet')
          }}
        />
      </Suspense>
    )
  }

  // Customer Wallet Screen
  if (currentUser) {
    return (
      <Suspense fallback={<UltimateLoader />}>
        <NeuralBackground />
        <ParticleSystem />
        <Wallet
          user={currentUser}
          allUsers={allUsers}
          onLogout={handleLogout}
          onClaimCoins={() => {
            scrollToTop()
            setCurrentScreen('claim')
          }}
          onRedeemReward={handleRedeemReward}
        />
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        {confirmLogout && (
          <ConfirmDialog
            message="Are you sure you want to logout?"
            onConfirm={() => { const fn = confirmLogout; setConfirmLogout(null); fn() }}
            onCancel={() => setConfirmLogout(null)}
          />
        )}
      </Suspense>
    )
  }

  // Default: Customer Login
  return (
    <Suspense fallback={<UltimateLoader />}>
      <NeuralBackground />
      <ParticleSystem />
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          scrollToTop()
          setCurrentScreen('signup')
        }}
        onAdminAccess={() => {
          scrollToTop()
          setCurrentScreen('admin-login')
        }}
      />
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Suspense>
  )
}

export default App
