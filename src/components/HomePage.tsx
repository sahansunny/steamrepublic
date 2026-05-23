import { useState, useEffect, useRef } from 'react'
import './HomePage.css'

interface HomePageProps {
  onLogin: () => void
  onSignup: () => void
  onDashboard: () => void
}

/* ── SVG Icon Components ── */
const IconCoin = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
    <path d="M24 14v2M24 32v2M14 24h2M32 24h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 20.5C20 18.567 21.79 17 24 17s4 1.567 4 3.5c0 1.933-1.79 3.5-4 3.5s-4 1.567-4 3.5S21.79 31 24 31s4-1.567 4-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconGift = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="8" y="20" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
    <rect x="6" y="14" width="36" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 14v28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 14c0 0-4-8 0-8s4 8 0 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M24 14c0 0 4-8 0-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 14c0 0-8-2-8 2s8 2 8 2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M24 14c0 0 8-2 8 2s-8 2-8 2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
)

const IconBarcode = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="6" y="10" width="4" height="28" rx="1" fill="currentColor"/>
    <rect x="13" y="10" width="2" height="28" rx="1" fill="currentColor"/>
    <rect x="18" y="10" width="4" height="28" rx="1" fill="currentColor"/>
    <rect x="25" y="10" width="2" height="28" rx="1" fill="currentColor"/>
    <rect x="30" y="10" width="4" height="28" rx="1" fill="currentColor"/>
    <rect x="37" y="10" width="2" height="28" rx="1" fill="currentColor"/>
    <rect x="42" y="10" width="2" height="28" rx="1" fill="currentColor"/>
    <path d="M6 42h8M34 42h8M6 6h8M34 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconTrophy = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16 6h16v18a8 8 0 01-16 0V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M16 10H8a4 4 0 004 4h4M32 10h8a4 4 0 01-4 4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 32v6M16 42h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 20l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconShield = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M24 6L8 12v12c0 9.4 6.8 18.2 16 20 9.2-1.8 16-10.6 16-20V12L24 6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M17 24l5 5 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconArrow = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconCheck = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconSpark = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

/* ── Intersection Observer hook for scroll reveal ── */
function useReveal() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement | null>(null)

  const setRef = (el: HTMLElement | null) => {
    if (!el || ref.current === el) return
    ref.current = el
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
  }

  return { setRef, visible }
}

/* ── Animated counter ── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { setRef, visible } = useReveal()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [visible, target])
  return <span ref={setRef}>{count.toLocaleString()}{suffix}</span>
}

export default function HomePage({ onLogin, onSignup, onDashboard }: HomePageProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Handle scroll to section
  const scrollToSection = (sectionId: string) => {
    setMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const featuresReveal = useReveal()
  const stepsReveal    = useReveal()
  const levelsReveal   = useReveal()
  const statsReveal    = useReveal()

  const features = [
    {
      Icon: IconCoin,
      title: 'Earn MomoCoins',
      desc: 'Collect coins on every visit to Steam Republic. The more you come, the faster your balance grows.',
      accent: '#ffd700',
    },
    {
      Icon: IconGift,
      title: 'Redeem Rewards',
      desc: 'Spend your coins on exclusive free items, discounts, and limited-edition perks at our stall.',
      accent: '#67e8f9',
    },
    {
      Icon: IconTrophy,
      title: 'Climb the Ranks',
      desc: 'Maintain your visit streak and rise through citizen levels — from Newcomer all the way to Elite.',
      accent: '#48bb78',
    },
    {
      Icon: IconBarcode,
      title: 'Instant Scan',
      desc: 'Your personal barcode lives in your pocket. Staff scan it in seconds — no app download needed.',
      accent: '#a78bfa',
    },
  ]

  const steps = [
    {
      num: '01',
      title: 'Create your wallet',
      desc: 'Sign up with just your mobile number. No passwords, no hassle — your wallet is ready instantly.',
      Icon: IconShield,
    },
    {
      num: '02',
      title: 'Visit & get scanned',
      desc: 'Show your barcode at the stall. Our staff scan it and MomoCoins land in your wallet immediately.',
      Icon: IconBarcode,
    },
    {
      num: '03',
      title: 'Redeem your rewards',
      desc: 'Browse the rewards store, pick what you want, and redeem your coins for real perks.',
      Icon: IconGift,
    },
  ]

  const levels = [
    { name: 'Newcomer', range: '0 – 99',   color: '#94a3b8', glow: 'rgba(148,163,184,0.2)',  icon: '🌱', perks: ['Welcome bonus coins', 'Basic wallet access'] },
    { name: 'Regular',  range: '100 – 499', color: '#67e8f9', glow: 'rgba(103,232,249,0.2)', icon: '⭐', perks: ['Priority scan queue', 'Monthly bonus coins'] },
    { name: 'Loyal',    range: '500 – 999', color: '#48bb78', glow: 'rgba(72,187,120,0.2)',  icon: '💎', perks: ['Exclusive reward access', 'Double streak bonus'] },
    { name: 'Elite',    range: '1000+',     color: '#ffd700', glow: 'rgba(255,215,0,0.25)',  icon: '👑', perks: ['VIP rewards unlocked', 'Special event invites'] },
  ]

  const stats = [
    { value: 500,  suffix: '+', label: 'Active Members' },
    { value: 12000, suffix: '+', label: 'Coins Earned' },
    { value: 4,    suffix: '',  label: 'Citizen Levels' },
    { value: 100,  suffix: '%', label: 'Free to Join' },
  ]

  return (
    <div className="hp">

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav className={`hp-nav${scrolled ? ' hp-nav--solid' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="hp-nav__wrap">

          {/* Brand */}
          <a href="#hp-hero" className="hp-nav__brand" aria-label="Steam Republic — go to top">
            <div className="hp-nav__brand-ring">
              <img src="/Steamreublic.png" alt="" className="hp-nav__brand-img" width="32" height="32" aria-hidden="true" />
            </div>
            <span className="hp-nav__brand-name">Steam Republic</span>
          </a>

          {/* Desktop links */}
          <ul className="hp-nav__links">
            <li><a href="#hp-features" className="hp-nav__link" onClick={(e) => { e.preventDefault(); scrollToSection('hp-features') }}>About</a></li>
            <li><a href="#hp-how-it-works" className="hp-nav__link" onClick={(e) => { e.preventDefault(); scrollToSection('hp-how-it-works') }}>How it Works</a></li>
          </ul>

          {/* Desktop CTAs */}
          <div className="hp-nav__ctas">
            <button className="hp-btn hp-btn--ghost hp-btn--sm" onClick={onLogin}>
              Login
            </button>
            <button className="hp-btn hp-btn--gold hp-btn--sm" onClick={onDashboard}>
              Dashboard
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="hp-nav__toggle"
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {/* Overlay backdrop */}
        <div 
          className={`hp-nav__overlay${menuOpen ? ' hp-nav__overlay--visible' : ''}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Mobile drawer */}
        <div className={`hp-nav__drawer${menuOpen ? ' hp-nav__drawer--open' : ''}`} aria-hidden={!menuOpen}>
          <div className="hp-nav__drawer-inner">
            <a href="#hp-features" className="hp-nav__drawer-link" onClick={(e) => { e.preventDefault(); scrollToSection('hp-features') }}>About</a>
            <a href="#hp-how-it-works" className="hp-nav__drawer-link" onClick={(e) => { e.preventDefault(); scrollToSection('hp-how-it-works') }}>How it Works</a>
            <div className="hp-nav__drawer-ctas">
              <button className="hp-btn hp-btn--ghost" onClick={() => { setMenuOpen(false); onLogin() }} tabIndex={menuOpen ? 0 : -1}>Login</button>
              <button className="hp-btn hp-btn--gold"  onClick={() => { setMenuOpen(false); onDashboard() }} tabIndex={menuOpen ? 0 : -1}>Dashboard</button>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section id="hp-hero" className="hp-hero" aria-label="Hero">

        {/* Decorative orbs */}
        <div className="hp-hero__orb hp-hero__orb--1" aria-hidden="true" />
        <div className="hp-hero__orb hp-hero__orb--2" aria-hidden="true" />
        <div className="hp-hero__orb hp-hero__orb--3" aria-hidden="true" />

        {/* Decorative grid */}
        <div className="hp-hero__grid" aria-hidden="true" />

        <div className="hp-hero__content">
          {/* Pill badge */}
          <div className="hp-hero__pill">
            <IconSpark />
            <span>Steam Republic Loyalty Program</span>
          </div>

          {/* Logo */}
          <div className="hp-hero__logo-ring" aria-hidden="true">
            <div className="hp-hero__logo-orbit" />
            <div className="hp-hero__logo-orbit hp-hero__logo-orbit--2" />
            <img
              src="/Steamreublic.png"
              alt="Steam Republic"
              className="hp-hero__logo-img"
              width="140"
              height="140"
            />
          </div>

          {/* Headline */}
          <h1 className="hp-hero__h1">
            Your Loyalty,
            <br />
            <span className="hp-hero__h1-gold">Rewarded</span>
          </h1>

          <p className="hp-hero__sub">
            Earn MomoCoins every visit, unlock exclusive rewards, and rise through the ranks at Steam Republic — the loyalty program built for real fans.
          </p>

          {/* CTA row */}
          <div className="hp-hero__cta-row">
            <button className="hp-btn hp-btn--gold hp-btn--lg" onClick={onSignup}>
              <span>Get Started Free</span>
              <IconArrow />
            </button>
            <button className="hp-btn hp-btn--outline hp-btn--lg" onClick={onLogin}>
              I Have an Account
            </button>
          </div>

          {/* Trust row */}
          <div className="hp-hero__trust">
            {['Free to join', 'No app needed', 'Instant rewards'].map(t => (
              <span key={t} className="hp-hero__trust-item">
                <IconCheck />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hp-hero__scroll" aria-hidden="true">
          <div className="hp-hero__scroll-dot" />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAND
      ══════════════════════════════════════════ */}
      <div className="hp-stats-band" ref={statsReveal.setRef}>
        <div className="hp-stats-band__inner">
          {stats.map((s, i) => (
            <div key={i} className={`hp-stat${statsReveal.visible ? ' hp-stat--visible' : ''}`} style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="hp-stat__num">
                <Counter target={s.value} suffix={s.suffix} />
              </span>
              <span className="hp-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ABOUT DARJEELING MOMOS
      ══════════════════════════════════════════ */}
      <section className="hp-section" aria-labelledby="hp-about-momos-h">
        <div className="hp-momos-content">
          {/* Left side - Text content */}
          <div className="hp-momos-left">
            <div className="hp-momos-intro">
              <p className="hp-momos-intro-eyebrow">Our Heritage</p>
              <h2 id="hp-about-momos-h" className="hp-momos-intro-title">Darjeeling Momos</h2>
              <p className="hp-momos-intro-subtitle">The authentic taste of the hills</p>
            </div>

            <div className="hp-momos-cards-grid">
              <div className="hp-momos-card">
                <h3 className="hp-momos-title">The Crust</h3>
                <p className="hp-momos-text">Ultra-thin, delicate wrappers hand-pleated to perfection. Each fold tells a story of tradition and craftsmanship.</p>
              </div>

              <div className="hp-momos-card">
                <h3 className="hp-momos-title">The Filling</h3>
                <p className="hp-momos-text">Pure, simple, and incredibly juicy. Seasoned only with fresh ginger, onions, and a touch of butter—no heavy spices.</p>
              </div>

              <div className="hp-momos-card">
                <h3 className="hp-momos-title">The Sides</h3>
                <p className="hp-momos-text">Served hot with a bowl of clear, comforting broth and our signature fiery Dalle chili chutney.</p>
              </div>
            </div>
          </div>

          {/* Right side - Premium visual */}
          <div className="hp-momos-right">
            <div className="hp-momos-visual">
              <img 
                src="/src/images/dargling_momo.png" 
                alt="Darjeeling Momo" 
                className="hp-momos-visual-img"
              />
            </div>
            <div className="hp-momos-visual-content">
              <p className="hp-momos-visual-text">Handcrafted with <strong>love</strong> from the <strong>hills</strong></p>
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="hp-momos-quote">
          <p>Clean, light, and packed with flavor. <strong>One bite, and you're in the mist-covered hills of Darjeeling.</strong></p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section id="hp-features" className="hp-section" aria-labelledby="hp-features-h">
        <div className="hp-section__head">
          <p className="hp-eyebrow">Why MomoWallet?</p>
          <h2 id="hp-features-h" className="hp-section__h2">Everything in one wallet</h2>
          <p className="hp-section__sub">A powerful loyalty experience built for Steam Republic fans.</p>
        </div>

        <div
          className={`hp-features${featuresReveal.visible ? ' hp-features--visible' : ''}`}
          ref={featuresReveal.setRef}
          role="list"
        >
          {features.map((f, i) => (
            <article
              key={f.title}
              className="hp-feat"
              role="listitem"
              style={{ '--feat-accent': f.accent, transitionDelay: `${i * 90}ms` } as React.CSSProperties}
            >
              <div className="hp-feat__icon-wrap">
                <f.Icon />
              </div>
              <h3 className="hp-feat__title">{f.title}</h3>
              <p className="hp-feat__desc">{f.desc}</p>
              <div className="hp-feat__line" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="hp-how-it-works" className="hp-section hp-section--alt" aria-labelledby="hp-how-h">
        <div className="hp-section__head">
          <p className="hp-eyebrow">Simple Process</p>
          <h2 id="hp-how-h" className="hp-section__h2">How it works</h2>
          <p className="hp-section__sub">Three steps to start earning rewards today.</p>
        </div>

        <ol
          className={`hp-steps${stepsReveal.visible ? ' hp-steps--visible' : ''}`}
          ref={stepsReveal.setRef}
          aria-label="Steps to get started"
        >
          {steps.map((s, i) => (
            <li key={s.num} className="hp-step" style={{ transitionDelay: `${i * 120}ms` }}>
              {/* Connector line */}
              {i < steps.length - 1 && <div className="hp-step__connector" aria-hidden="true" />}

              <div className="hp-step__icon-wrap" aria-hidden="true">
                <s.Icon />
              </div>
              <div className="hp-step__body">
                <span className="hp-step__num" aria-hidden="true">{s.num}</span>
                <h3 className="hp-step__title">{s.title}</h3>
                <p className="hp-step__desc">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ══════════════════════════════════════════
          CITIZEN LEVELS
      ══════════════════════════════════════════ */}
      <section id="hp-levels" className="hp-section" aria-labelledby="hp-levels-h">
        <div className="hp-section__head">
          <p className="hp-eyebrow">Citizen Ranks</p>
          <h2 id="hp-levels-h" className="hp-section__h2">Rise through the ranks</h2>
          <p className="hp-section__sub">The more coins you earn, the higher your citizen status — and the better your perks.</p>
        </div>

        <div
          className={`hp-levels${levelsReveal.visible ? ' hp-levels--visible' : ''}`}
          ref={levelsReveal.setRef}
          role="list"
        >
          {levels.map((l, i) => (
            <div
              key={l.name}
              className="hp-level"
              role="listitem"
              style={{
                '--lv-color': l.color,
                '--lv-glow': l.glow,
                transitionDelay: `${i * 100}ms`,
              } as React.CSSProperties}
            >
              {/* Top glow bar */}
              <div className="hp-level__bar" aria-hidden="true" />

              <div className="hp-level__header">
                <span className="hp-level__icon" aria-hidden="true">{l.icon}</span>
                <div>
                  <p className="hp-level__name">{l.name}</p>
                  <p className="hp-level__range">{l.range} coins</p>
                </div>
              </div>

              <ul className="hp-level__perks" aria-label={`${l.name} perks`}>
                {l.perks.map(p => (
                  <li key={p} className="hp-level__perk">
                    <span className="hp-level__perk-check" aria-hidden="true"><IconCheck /></span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="hp-cta" aria-label="Call to action">
        <div className="hp-cta__orb hp-cta__orb--1" aria-hidden="true" />
        <div className="hp-cta__orb hp-cta__orb--2" aria-hidden="true" />
        <div className="hp-cta__inner">
          <div className="hp-cta__logo-wrap" aria-hidden="true">
            <img src="/Steamreublic.png" alt="" className="hp-cta__logo" width="72" height="72" />
          </div>
          <h2 className="hp-cta__h2">Ready to start earning?</h2>
          <p className="hp-cta__sub">Join hundreds of Steam Republic fans already earning MomoCoins. It takes 30 seconds to sign up.</p>
          <div className="hp-cta__btns">
            <button className="hp-btn hp-btn--gold hp-btn--lg" onClick={onSignup}>
              <span>Create Free Account</span>
              <IconArrow />
            </button>
            <button className="hp-btn hp-btn--outline hp-btn--lg" onClick={onLogin}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="hp-footer" role="contentinfo">
        <div className="hp-footer__inner">
          <div className="hp-footer__brand">
            <img src="/Steamreublic.png" alt="Steam Republic" width="26" height="26" className="hp-footer__logo" />
            <span className="hp-footer__brand-name">Steam Republic</span>
          </div>

          <p className="hp-footer__copy">
            © {new Date().getFullYear()} Steam Republic. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}
