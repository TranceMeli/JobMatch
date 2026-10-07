import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import { getMatches } from '../api'

const styles = {
  screen: { flex: 1, padding: '24px 20px', overflowY: 'auto' },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    marginBottom: '20px',
  },
  card: {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    marginBottom: '10px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logo: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-accent)',
    background: 'var(--color-teal-tint)',
    flexShrink: 0,
  },
  info: { flex: 1 },
  name: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    marginBottom: '2px',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
  },
  match: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 9px',
    borderRadius: '20px',
    background: 'var(--color-highlight)',
    color: 'var(--color-highlight-text)',
    fontSize: '12px',
    fontWeight: '700',
  },
  reasons: {
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid var(--color-border)',
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
  },
  contact: {
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid var(--color-border)',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
  },
  empty: {
    textAlign: 'center',
    padding: '48px 0',
    color: 'var(--color-text-muted)',
    fontSize: '14px',
    lineHeight: '2',
  },
  error: {
    padding: '12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    fontSize: '13px',
  },
}

export default function Matches({ refreshKey = 0 }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const result = await getMatches()
        if (active) setMatches(result || [])
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [refreshKey])

  return (
    <div style={styles.screen}>
      <div style={styles.title}>Deine Matches</div>
      <div style={styles.subtitle}>
        {matches.length === 0
          ? 'Noch keine gegenseitigen Matches.'
          : `${matches.length} Match${matches.length !== 1 ? 'es' : ''} gefunden`}
      </div>

      {loading && <div style={styles.empty}>Matches werden geladen ...</div>}

      {!loading && error && <div style={styles.error}>{error}</div>}

      {!loading && !error && matches.length === 0 && (
        <div style={styles.empty}>
          <div><Icon name="handshake" size={36} /></div>
          Noch keine Matches.<br />
          Ein Match entsteht erst, wenn beide Seiten Interesse zeigen.
        </div>
      )}

      {!loading && !error && matches.map((match) => (
        <div key={`${match.userId}-${match.jobType}`} style={styles.card}>
          <div style={styles.row}>
            <div style={styles.logo}>
              <Icon name="handshake" size={22} />
            </div>

            <div style={styles.info}>
              <div style={styles.name}>{match.name}</div>
              <div style={styles.meta}>
                <Icon name="location_on" size={14} />
                {match.title} · {match.location || 'Standort nicht angegeben'}
              </div>
            </div>

            <span style={styles.match}>
              <Icon name="check_circle" size={14} />
              {match.matchScore} %
            </span>
          </div>

          <div style={styles.reasons}>
            {match.matchReasons?.map((reason) => (
              <div key={reason}>✓ {reason}</div>
            ))}
          </div>

          <div style={styles.contact}>
            <strong>Kontakt freigeschaltet:</strong>{' '}
            {match.email || 'Keine E-Mail-Adresse hinterlegt.'}
            {match.linkedIn && (
              <>
                {' · '}
                <a href={match.linkedIn} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
