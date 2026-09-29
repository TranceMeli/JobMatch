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
    width: '56px', height: '56px', borderRadius: '14px',
    background: 'var(--color-accent-bg)', color: 'var(--color-accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title:       { fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)' },
  subtitle:    { fontSize: '14px', color: 'var(--color-success)', marginTop: '-4px' },
  tags:        { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' },
  tag: {
    padding: '3px 10px',
    borderRadius: '20px',
    border: '1px solid var(--color-border-strong)',
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
  },
  description: { fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', flex: 1 },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid var(--color-border)',
  },
  location: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-muted)' },
  salary:   { fontSize: '13px', fontWeight: '600', color: 'var(--color-success)' },
}

const SwipeCard = forwardRef(function SwipeCard({ card, isJob, onSwipe, onCardLeftScreen }, ref) {
  return (
    <div style={styles.tinderWrapper}>
      <TinderCard
        ref={ref}
        onSwipe={(dir) => onSwipe(dir, card)}
        onCardLeftScreen={onCardLeftScreen}
        preventSwipe={['up', 'down']}
      >
        <div style={styles.card}>
          <div style={styles.iconWrap}>
            <Icon name={card.icon} size={28} />
          </div>
          <div style={styles.title}>{isJob ? card.title : card.name}</div>
          <div style={styles.subtitle}>{isJob ? card.company : card.title}</div>
          <div style={styles.tags}>
            {(card.tags || []).map((tag) => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>
          <p style={styles.description}>{card.description}</p>
          <div style={styles.meta}>
            <span style={styles.location}><Icon name="location_on" size={14} /> {card.location}</span>
            {isJob && card.salary && (
              <span style={styles.salary}>{card.salary}</span>
            )}
          </div>
        </div>
      </TinderCard>
    </div>
  )
})

export default SwipeCard