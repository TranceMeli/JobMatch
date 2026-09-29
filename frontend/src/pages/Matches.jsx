import Icon from '../components/Icon'
import { MOCK_JOBS, MOCK_APPLICANTS } from '../data/mockData'

const styles = {
  screen:    { flex: 1, padding: '24px 20px', overflowY: 'auto' },
  title:     { fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' },
  subtitle:  { fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' },
  card: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px', borderRadius: '12px',
    border: '1px solid var(--color-border)', background: 'var(--color-surface)', marginBottom: '10px',
  },
  logo: {
    width: '44px', height: '44px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-accent)', background: 'var(--color-teal-tint)', flexShrink: 0,
  },
  info: { flex: 1 },
  name: { fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' },
  meta: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-secondary)' },
  badge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '3px 10px', borderRadius: '20px',
    background: 'var(--color-highlight)', color: 'var(--color-highlight-text)',
    fontSize: '12px', fontWeight: '600',
  },
  empty:     { textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '2' },
  emptyIcon: { color: 'var(--color-border-strong)', marginBottom: '8px' },
}

export default function Matches({ role, liked = [] }) {
  const isJob = role === 'User'
  const allCards = isJob ? MOCK_JOBS : MOCK_APPLICANTS
  const matchedItems = liked.map((id) => allCards.find((c) => c.id === id)).filter(Boolean)

  return (
    <div style={styles.screen}>
      <div style={styles.title}>Deine Matches</div>
      <div style={styles.subtitle}>
        {matchedItems.length === 0
          ? 'Noch keine Matches – wisch weiter!'
          : `${matchedItems.length} Match${matchedItems.length !== 1 ? 'es' : ''} gefunden`}
      </div>

      {matchedItems.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}><Icon name="work" size={36} /></div>
          Noch keine Matches.<br />Geh zurück und swipe weiter.
        </div>
      ) : (
        matchedItems.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={styles.logo}><Icon name={item.icon} size={22} /></div>
            <div style={styles.info}>
              <div style={styles.name}>{isJob ? item.title : item.name}</div>
              <div style={styles.meta}>
                <Icon name="location_on" size={14} />
                {isJob ? item.company : item.title} · {item.location}
              </div>
            </div>
            <span style={styles.badge}><Icon name="check_circle" size={14} /> Match</span>
          </div>
        ))
      )}
    </div>
  )
}