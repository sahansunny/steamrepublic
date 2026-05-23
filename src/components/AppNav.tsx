import { useState, useEffect } from 'react'
import './AppNav.css'

interface AppNavProps {
  onHome: () => void
  onLogin?: () => void
  onSignup?: () => void
  isLoggedIn?: boolean
  isAdmin?: boolean
  userName?: string
  onLogout?: () => void
}

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export default function AppNav({ onHome, onLogin, onSignup, isLoggedIn, isAdmin, userName, onLogout }: AppNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <nav className={`app-nav${scrolled ? ' app-nav--solid' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="app-nav__wrap">

        {/* Brand / Home */}
        <button className="app-nav__brand" onClick={() => { close(); onHome() }} aria-label="Steam Republic — go to home">
          <div className="app-nav__brand-ring">
            <img src="/Steamreublic.png" alt="" className="app-nav__brand-img" width="32" height="32" aria-hidden="true" />
          </div>
          <span className="app-nav__brand-name">Steam Republic</span>
        </button>

        {/* Desktop CTAs */}
        <div className="app-nav__ctas">
          {isLoggedIn || isAdmin ? (
            <>
              {userName && <span className="app-nav__user">👋 {userName}</span>}
              {onLogout && (
                <button className="app-nav__btn app-nav__btn--ghost" onClick={onLogout}>
                  Logout
                </button>
              )}
            </>
          ) : (
            <>
              {onLogin && (
                <button className="app-nav__btn app-nav__btn--ghost" onClick={() => { close(); onLogin() }}>
                  Login
                </button>
              )}
              {onSignup && (
                <button className="app-nav__btn app-nav__btn--gold" onClick={() => { close(); onSignup() }}>
                  Get Started
                </button>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="app-nav__toggle"
          onClick={() => setMenuOpen(v => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {/* Overlay backdrop */}
      <div 
        className={`app-nav__overlay${menuOpen ? ' app-nav__overlay--visible' : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div className={`app-nav__drawer${menuOpen ? ' app-nav__drawer--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="app-nav__drawer-inner">
          <button
            className="app-nav__drawer-link"
            onClick={() => { close(); onHome() }}
            tabIndex={menuOpen ? 0 : -1}
          >
            🏠 Home
          </button>

          {isLoggedIn || isAdmin ? (
            <>
              {userName && <span className="app-nav__drawer-user">👋 {userName}</span>}
              {onLogout && (
                <button
                  className="app-nav__drawer-link app-nav__drawer-link--danger"
                  onClick={() => { close(); onLogout() }}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  🚪 Logout
                </button>
              )}
            </>
          ) : (
            <div className="app-nav__drawer-ctas">
              {onLogin && (
                <button
                  className="app-nav__btn app-nav__btn--ghost"
                  onClick={() => { close(); onLogin() }}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  Login
                </button>
              )}
              {onSignup && (
                <button
                  className="app-nav__btn app-nav__btn--gold"
                  onClick={() => { close(); onSignup() }}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  Get Started
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
