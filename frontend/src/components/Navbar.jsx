import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { useBreakpoint } from '../hooks/useBreakpoint'

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 16px',
    background: 'var(--color-nav-bg)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: 'var(--text-xl)',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '-0.3px',
    flexShrink: 0,
  },
  logoAccent: { color: 'var(--color-highlight)' },
  links: { display: 'flex', gap: '4px' },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '40px',
    padding: '0 12px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-nav-text)',
    fontSize: 'var(--text-base)',
    fontWeight: '500',
    transition: 'background-color var(--duration-fast)',
  },
  linkActive: {
    background: 'var(--color-nav-active-bg)',
    color: 'var(--color-nav-active-text)',
    fontWeight: '600',
  },
  count: {
    minWidth: '18px',
    padding: '0 5px',
    borderRadius: '9px',
    background: 'var(--color-accent)',
    color: '#fff',
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    lineHeight: '18px',
    textAlign: 'center',
  },
  accountWrap: { position: 'relative' },
  account: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '40px',
    padding: '3px 10px 3px 3px',
    borderRadius: '20px',
    border: '1px solid var(--color-highlight)',
    background: 'transparent',
    color: '#fff',
    fontSize: 'var(--text-sm)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--color-highlight)',
    color: 'var(--color-nav-active-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    flexShrink: 0,
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 6px)',
    minWidth: '200px',
    padding: '4px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    boxShadow: '0 8px 24px rgba(18, 26, 66, 0.18)',
    zIndex: 20,
  },
  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '40px',
    padding: '0 10px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-base)',
    textAlign: 'left',
  },
  menuDivider: { height: '1px', background: 'var(--color-border)', margin: '4px 0' },
  tabBar: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    background: 'var(--color-nav-bg)',
    zIndex: 10,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    minHeight: '60px',
    border: 'none',
    background: 'transparent',
    color: 'var(--color-nav-text)',
    fontSize: 'var(--text-xs)',
    fontWeight: '500',
  },
  tabActive: {
    color: '#fff',
    fontWeight: '700',
    boxShadow: 'inset 0 3px 0 var(--color-highlight)',
  },
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function AccountMenu({ userName, compact, onProfile, onLogout }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const firstItemRef = useRef(null)

  useEffect(() => {
    if (!open) return
    firstItemRef.current?.focus()

    function onPointerDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        wrapRef.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function choose(action) {
    setOpen(false)
    action()
  }

  return (
    <div ref={wrapRef} style={styles.accountWrap}>
      <button
        type="button"
        style={compact ? { ...styles.account, padding: '3px', borderColor: 'transparent' } : styles.account}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? `Kontomenü von ${userName || 'dir'}` : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span style={styles.avatar}>{getInitials(userName)}</span>
        {!compact && (
          <>
            <span>{userName || 'Mein Konto'}</span>
            <Icon name={open ? 'expand_less' : 'expand_more'} size={18} />
          </>
        )}
      </button>

      {open && (
        <div role="menu" style={styles.menu}>
          <button ref={firstItemRef} type="button" role="menuitem" style={styles.menuItem}
            onClick={() => choose(onProfile)}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <Icon name="person" size={20} />
            Mein Profil
          </button>
          <div style={styles.menuDivider} />
          <button type="button" role="menuitem" style={{ ...styles.menuItem, color: 'var(--color-danger-text)' }}
            onClick={() => choose(onLogout)}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-danger-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <Icon name="logout" size={20} />
            Abmelden
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar({
  view,
  setView,
  matchCount,
  userName,
  onLogout,
  onHome,
  onQuestions,
}) {
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'

  const items = [
    { key: 'discover', label: 'Entdecken', icon: 'style', active: view === 'swipe', onClick: onHome },
    { key: 'matches', label: 'Matches', icon: 'handshake', active: view === 'matches', onClick: () => setView('matches'), count: matchCount },
    {
      key: 'questions',
      label: isMobile ? 'Fragen' : 'Fragebogen',
      icon: 'checklist',
      active: ['questionnaire', 'questionnaire-select', 'questionnaire-overview'].includes(view),
      onClick: onQuestions,
    },
  ]

  const logo = (
    <div style={styles.logo}>
      Job<span style={styles.logoAccent}>Match</span>
    </div>
  )

  if (isMobile) {
    const tabs = [...items, { key: 'profile', label: 'Profil', icon: 'person', active: view === 'profile-card' || view === 'profile-form', onClick: () => setView('profile-card') }]

    return (
      <>
        <header style={styles.nav}>
          {logo}
          <AccountMenu userName={userName} compact onProfile={() => setView('profile-card')} onLogout={onLogout} />
        </header>

        <nav style={styles.tabBar} aria-label="Hauptnavigation">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              style={{ ...styles.tab, ...(item.active ? styles.tabActive : {}) }}
              aria-current={item.active ? 'page' : undefined}
              onClick={item.onClick}
            >
              <span style={{ position: 'relative' }}>
                <Icon name={item.icon} size={24} />
                {item.count > 0 && (
                  <span style={{ ...styles.count, position: 'absolute', top: '-4px', right: '-12px' }}>{item.count}</span>
                )}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </>
    )
  }

  return (
    <header style={styles.nav}>
      {logo}

      <nav style={styles.links} aria-label="Hauptnavigation">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            style={{ ...styles.link, ...(item.active ? styles.linkActive : {}) }}
            aria-current={item.active ? 'page' : undefined}
            onClick={item.onClick}
            onMouseEnter={(e) => !item.active && (e.currentTarget.style.background = 'rgba(149, 204, 221, 0.18)')}
            onMouseLeave={(e) => !item.active && (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name={item.icon} size={20} />
            {item.label}
            {item.count > 0 && (
              <span style={styles.count}>{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      <AccountMenu userName={userName} compact={breakpoint !== 'desktop'} onProfile={() => setView('profile-card')} onLogout={onLogout} />
    </header>
  )
}
