const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.3px',
    flexShrink: 0,
  },
  logoAccent: { color: 'var(--color-success)' },
  tabs: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  tab: {
    padding: '6px 10px',
    borderRadius: 'var(--radius)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    fontSize: '12px',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    background: 'transparent',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'var(--color-accent)',
    color: '#fff',
    borderColor: 'var(--color-accent)',
  },
  tabReset: { color: 'var(--color-text-muted)' },
}

export default function Navbar({
  view,
  setView,
  likedCount,
  onReset,
  onHome,
  onQuestions,
}) {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        Job<span style={styles.logoAccent}>Match</span>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(view === 'swipe' ? styles.tabActive : {}) }}
          onClick={onHome}
        >
          Home
        </button>

        <button
          style={{
            ...styles.tab,
            ...(view === 'questionnaire' ||
            view === 'questionnaire-select' ||
            view === 'questionnaire-overview'
              ? styles.tabActive
              : {}),
          }}
          onClick={onQuestions}
        >
          Fragen
        </button>

        <button
          style={{ ...styles.tab, ...(view === 'profile-card' ? styles.tabActive : {}) }}
          onClick={() => setView('profile-card')}
        >
          Profil
        </button>

        <button
          style={{ ...styles.tab, ...(view === 'matches' ? styles.tabActive : {}) }}
          onClick={() => setView('matches')}
        >
          Matches{likedCount > 0 ? ` (${likedCount})` : ''}
        </button>

        <button
          style={{ ...styles.tab, ...styles.tabReset }}
          onClick={onReset}
        >
          Abmelden
        </button>
      </div>
    </nav>
  )
}