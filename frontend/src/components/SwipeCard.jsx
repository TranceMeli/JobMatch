import { forwardRef } from 'react'
import TinderCard from 'react-tinder-card'
import Icon from './Icon'

const styles = {
  tinderWrapper: { position: 'absolute', width: '100%' },
  card: {
    position: 'relative',
    borderRadius: 'var(--radius-card)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    padding: '24px',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    userSelect: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  iconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'var(--color-accent-bg)',
    color: 'var(--color-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)' },
  subtitle: { fontSize: '14px', color: 'var(--color-success)', marginTop: '-4px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' },
  tag: {
    padding: '3px 10px',
    borderRadius: '20px',
    border: '1px solid var(--color-border-strong)',
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
  },
  description: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
    flex: 1,
  },
  match: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    alignSelf: 'flex-start',
    padding: '5px 10px',
    borderRadius: '20px',
    background: 'var(--color-highlight)',
    color: 'var(--color-highlight-text)',
    fontSize: '12px',
    fontWeight: '700',
  },
  reasons: {
    fontSize: '12px',
    lineHeight: '1.5',
    color: 'var(--color-text-secondary)',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid var(--color-border)',
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: 'var(--color-text-muted)',
  },
}

const SwipeCard = forwardRef(function SwipeCard(
  { card, isJob },
  ref,
) {
  return (
    <div style={styles.tinderWrapper}>
      <TinderCard
        ref={ref}
        onSwipe={(dir) => {
          card.onSwipe?.(dir, card)
        }}
        preventSwipe={['up', 'down']}
      >
        <div style={styles.card}>
          <div style={styles.iconWrap}>
            <Icon name={isJob ? 'apartment' : 'person'} size={28} />
          </div>

          <div style={styles.title}>{isJob ? card.name : card.name}</div>
          <div style={styles.subtitle}>{card.title || card.jobType}</div>

          {card.matchScore != null && (
            <>
              <div style={styles.match}>
                <Icon name="auto_awesome" size={14} />
                {card.matchScore} % Match
              </div>

              {card.matchReasons?.length > 0 && (
                <div style={styles.reasons}>
                  {card.matchReasons.map((reason) => (
                    <div key={reason}>✓ {reason}</div>
                  ))}
                </div>
              )}
            </>
          )}

          <div style={styles.tags}>
            {(card.tags || []).map((tag) => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>

          <p style={styles.description}>{card.description || 'Noch keine Beschreibung vorhanden.'}</p>

          <div style={styles.meta}>
            <span style={styles.location}>
              <Icon name="location_on" size={14} />
              {card.location || 'Standort nicht angegeben'}
            </span>
          </div>
        </div>
      </TinderCard>
    </div>
  )
})

export default SwipeCard
