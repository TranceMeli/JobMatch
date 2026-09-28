import React, { useMemo } from 'react'
import SwipeButtons from '../components/SwipeButtons'
import SwipeCard from '../components/SwipeCard'
import { MOCK_JOBS, MOCK_APPLICANTS } from '../data/mockData'
import { useBreakpoint, widthFor } from '../hooks/useBreakpoint'

const styles = {
  screen:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', gap: '12px' },
  welcome: { width: '100%', fontSize: '13px', color: 'var(--color-text-secondary)' },
  welcomeName: { color: 'var(--color-text-primary)', fontWeight: '600' },
  header:  { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)' },
  count:   { fontSize: '13px', color: 'var(--color-text-muted)' },
  profileBadge: {
    width: '100%',
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: 'var(--radius)',
    background: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)',
  },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'var(--color-accent)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '13px', fontWeight: '600',
    color: '#fff', flexShrink: 0,
  },
  profileName: { fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)' },
  profileRole: { fontSize: '12px', color: 'var(--color-text-secondary)' },
  stack:   { position: 'relative', width: '100%', height: '420px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '420px', gap: '12px', textAlign: 'center' },
  emptyIcon:  { fontSize: '44px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)' },
  emptySub:   { fontSize: '14px', color: 'var(--color-text-secondary)' },
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function SwipeScreen({ role, profile, onLike, liked = [] }) {
  const isJob = role === 'User'
  const cards = isJob ? MOCK_JOBS : MOCK_APPLICANTS

  const refs = useMemo(() => cards.map(() => React.createRef()), [])
  const [currentIndex, setCurrentIndex] = React.useState(cards.length - 1)
  const canSwipe = currentIndex >= 0

  const bp = useBreakpoint()
  const contentWidth = widthFor(bp, { mobile: 360, tablet: 420, desktop: 460 })
  const contentStyle = { width: '100%', maxWidth: `${contentWidth}px`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }


  const welcomeLabel = role || 'User'

  function onSwipe(dir, card) {
    if (dir === 'right') onLike?.(card.id)
    setCurrentIndex((prev) => prev - 1)
  }

  async function swipe(dir) {
    if (!canSwipe) return
    await refs[currentIndex].current.swipe(dir)
  }

  return (
    <div style={styles.screen}>
      <div style={contentStyle}>
        <div style={styles.welcome}>
          Willkommen zurück, <span style={styles.welcomeName}>{welcomeLabel}</span>
        </div>

        <div style={styles.header}>
          <div style={styles.headerTitle}>{isJob ? 'Jobs für dich' : 'Kandidaten'}</div>
          <div style={styles.count}>{Math.max(0, currentIndex + 1)} verbleibend</div>
        </div>

        {profile && (
          <div style={styles.profileBadge}>
            <div style={styles.avatar}>{isJob ? getInitials(profile.name) : '🏢'}</div>
            <div>
              <div style={styles.profileName}>{profile.name}</div>
              <div style={styles.profileRole}>{profile.jobtitle || profile.industry || ''}</div>
            </div>
          </div>
        )}

        <div style={styles.stack}>
          {!canSwipe ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>🎉</div>
              <div style={styles.emptyTitle}>Alle gesehen!</div>
              <div style={styles.emptySub}>Du hast {liked.length} Match{liked.length !== 1 ? 'es' : ''} gemacht.</div>
            </div>
          ) : (
            cards.map((card, i) => (
              <SwipeCard
                key={card.id}
                ref={refs[i]}
                card={card}
                isJob={isJob}
                onSwipe={onSwipe}
                onCardLeftScreen={() => {}}
              />
            ))
          )}
        </div>

        <SwipeButtons
          onPass={() => swipe('left')}
          onSuper={() => swipe('up')}
          onLike={() => swipe('right')}
          disabled={!canSwipe}
        />
      </div>
    </div>
  )
}