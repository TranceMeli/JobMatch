import React, { useEffect, useMemo, useState } from 'react'
import SwipeButtons from '../components/SwipeButtons'
import SwipeCard from '../components/SwipeCard'
import Icon from '../components/Icon'
import { getMatchingCandidates } from '../api'
import { useBreakpoint, widthFor } from '../hooks/useBreakpoint'

const styles = {
  screen: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    gap: '12px',
  },
  welcome: {
    width: '100%',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
  },
  welcomeName: {
    color: 'var(--color-text-primary)',
    fontWeight: '600',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
  },
  count: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
  },
  profileBadge: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    background: 'var(--color-surface-subtle)',
    border: '1px solid var(--color-border)',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'var(--color-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    flexShrink: 0,
  },
  profileName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text-primary)',
  },
  profileRole: {
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
  },
  stack: {
    position: 'relative',
    width: '100%',
    height: '470px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '470px',
    gap: '12px',
    textAlign: 'center',
  },
  emptyIcon: { color: 'var(--color-highlight-text)' },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
  },
  emptySub: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    maxWidth: '340px',
    lineHeight: '1.6',
  },
  error: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    fontSize: '13px',
  },
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function SwipeScreen({ role, profile, jobType, onInterest }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(-1)

  const isApplicant = role === 'User'

  const refs = useMemo(
    () => cards.map(() => React.createRef()),
    [cards.length],
  )

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const result = await getMatchingCandidates(jobType)

        if (!active) return

        setCards(result || [])
        setCurrentIndex((result?.length || 0) - 1)
      } catch (err) {
        if (active) {
          setCards([])
          setCurrentIndex(-1)
          setError(err.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [jobType])

  function handleSwipe(dir, card) {
    if (dir === 'right') {
      onInterest?.(card.userId, true)
    } else if (dir === 'left') {
      onInterest?.(card.userId, false)
    }

    setCurrentIndex((previous) => previous - 1)
  }

  async function swipe(dir) {
    if (currentIndex < 0) return
    await refs[currentIndex].current.swipe(dir)
  }

  const contentWidth = widthFor(useBreakpoint(), {
    mobile: 360,
    tablet: 420,
    desktop: 460,
  })

  const contentStyle = {
    width: '100%',
    maxWidth: `${contentWidth}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  }

  return (
    <div style={styles.screen}>
      <div style={contentStyle}>
        <div style={styles.welcome}>
          Willkommen zurück,{' '}
          <span style={styles.welcomeName}>
            {profile?.name || (isApplicant ? 'Bewerber' : 'Unternehmen')}
          </span>
        </div>

        <div style={styles.header}>
          <div style={styles.headerTitle}>
            {isApplicant ? `Jobs für ${jobType}` : `Kandidaten für ${jobType}`}
          </div>
          <div style={styles.count}>
            {Math.max(0, currentIndex + 1)} verbleibend
          </div>
        </div>

        {profile && (
          <div style={styles.profileBadge}>
            <div style={styles.avatar}>
              {isApplicant
                ? getInitials(profile.name)
                : <Icon name="apartment" size={16} color="#fff" />}
            </div>
            <div>
              <div style={styles.profileName}>{profile.name}</div>
              <div style={styles.profileRole}>
                {profile.jobtitle || profile.desiredPosition || jobType}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={styles.empty}>
            <div style={styles.emptyTitle}>Passende Profile werden gesucht ...</div>
          </div>
        )}

        {!loading && error && <div style={styles.error}>{error}</div>}

        {!loading && !error && (
          <>
            <div style={styles.stack}>
              {currentIndex < 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>
                    <Icon name="celebration" size={44} />
                  </div>
                  <div style={styles.emptyTitle}>Alles gesehen!</div>
                  <div style={styles.emptySub}>
                    Es gibt für diese Jobkategorie aktuell keine weiteren Profile.
                    Deine bereits bewerteten Profile werden nicht erneut angezeigt.
                  </div>
                </div>
              ) : (
                cards.map((card, index) => (
                  <SwipeCard
                    key={card.userId}
                    ref={refs[index]}
                    card={{ ...card, onSwipe: handleSwipe }}
                    isJob={isApplicant}
                  />
                ))
              )}
            </div>

            <SwipeButtons
              onPass={() => swipe('left')}
              onSuper={() => swipe('right')}
              onLike={() => swipe('right')}
              disabled={currentIndex < 0}
            />
          </>
        )}
      </div>
    </div>
  )
}
