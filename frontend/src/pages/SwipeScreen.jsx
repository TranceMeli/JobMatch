import React, { useEffect, useMemo, useRef, useState } from 'react'
import SwipeButtons from '../components/SwipeButtons'
import SwipeCard from '../components/SwipeCard'
import Icon from '../components/Icon'
import { getMatchingCandidates, undoInterest } from '../api'
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
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
  },
  count: {
    fontSize: '13px',
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
  skeleton: {
    height: '400px',
    borderRadius: 'var(--radius-card)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg)',
  },
  matchPanel: {
    height: '470px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '24px',
    textAlign: 'center',
    borderRadius: 'var(--radius-card)',
    border: '2px solid var(--color-accent)',
    background: 'var(--color-surface)',
  },
  matchTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
  },
  matchText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'var(--color-text-secondary)',
    maxWidth: '320px',
  },
  matchActions: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    marginTop: '8px',
  },
  primary: {
    flex: 1,
    minHeight: '44px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'var(--color-accent)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
  },
  secondary: {
    flex: 1,
    minHeight: '44px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    fontSize: '12px',
    color: 'var(--color-text-secondary)',
  },
  undo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: 'none',
    background: 'transparent',
    padding: '6px 2px',
    color: 'var(--color-accent-hover)',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'underline',
  },
  error: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    fontSize: '13px',
  },
}

export default function SwipeScreen({ role, jobType, onInterest, onShowMatches }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [lastSwipe, setLastSwipe] = useState(null)
  const [match, setMatch] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const matchHeadingRef = useRef(null)
  // react-tinder-card ruft onSwipe mit dem Handler vom ersten Render auf – deshalb die Karten per Ref lesen
  const cardsRef = useRef(cards)
  cardsRef.current = cards

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

  useEffect(() => {
    if (match) matchHeadingRef.current?.focus()
  }, [match])

  function handleSwipe(dir, card) {
    if (dir !== 'left' && dir !== 'right') return

    const positive = dir === 'right'
    const index = cardsRef.current.findIndex((c) => c.userId === card.userId)
    const request = Promise.resolve(onInterest?.(card.userId, positive))

    setCurrentIndex((previous) => previous - 1)
    setLastSwipe({ index, card, request })
    setAnnouncement(positive ? `Interesse an ${card.name} gespeichert.` : `${card.name} übersprungen.`)

    request.then((result) => {
      if (result?.matched) {
        // Ein Match lässt sich nicht rückgängig machen
        setLastSwipe(null)
        setMatch({ name: card.name, score: result.matchScore })
      }
    })
  }

  async function swipe(dir) {
    if (currentIndex < 0 || match) return
    await refs[currentIndex].current.swipe(dir)
  }

  async function undo() {
    if (!lastSwipe) return
    const { index, card, request } = lastSwipe

    setLastSwipe(null)

    try {
      await request
      await undoInterest(card.userId, jobType)
      await refs[index]?.current?.restoreCard()
      setCurrentIndex(index)
      setAnnouncement(`Bewertung von ${card.name} zurückgenommen.`)
    } catch (err) {
      setError(err.message || 'Die Bewertung konnte nicht zurückgenommen werden.')
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

      if (e.key === 'ArrowLeft') { e.preventDefault(); swipe('left') }
      if (e.key === 'ArrowRight') { e.preventDefault(); swipe('right') }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

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

  const hasCards = currentIndex >= 0
  const position = cards.length - currentIndex

  return (
    <div style={styles.screen}>
      <div style={contentStyle}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            {isApplicant ? `Jobs für ${jobType}` : `Kandidaten für ${jobType}`}
          </h1>
          {!loading && hasCards && (
            <div style={styles.count}>{position} von {cards.length}</div>
          )}
        </div>

        <div className="sr-only" aria-live="polite">{announcement}</div>

        {loading && (
          <div style={{ width: '100%' }} aria-busy="true">
            <div style={styles.skeleton} />
            <div className="sr-only">Passende Profile werden gesucht …</div>
          </div>
        )}

        {!loading && error && (
          <div style={styles.error} role="alert">{error}</div>
        )}

        {!loading && !error && match && (
          <div style={{ ...styles.matchPanel, width: '100%' }}>
            <span style={styles.emptyIcon}><Icon name="handshake" size={40} /></span>
            <h2 ref={matchHeadingRef} tabIndex={-1} style={styles.matchTitle}>
              Match mit {match.name}
            </h2>
            {match.score != null && (
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-highlight-text)' }}>
                {match.score} % Übereinstimmung
              </div>
            )}
            <p style={styles.matchText}>
              Ihr habt beide Interesse gezeigt. Der Kontakt ist jetzt in {isApplicant ? 'deinen' : 'euren'} Matches freigeschaltet.
            </p>
            <div style={styles.matchActions}>
              <button type="button" style={styles.primary} onClick={onShowMatches}>
                Kontakt ansehen
              </button>
              <button type="button" style={styles.secondary} onClick={() => setMatch(null)}>
                Weiter
              </button>
            </div>
          </div>
        )}

        {!loading && !error && !match && (
          <>
            <div style={styles.stack}>
              {!hasCards && (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon}>
                    <Icon name="celebration" size={44} />
                  </div>
                  <h2 style={styles.emptyTitle}>Alles gesehen</h2>
                  <p style={styles.emptySub}>
                    Für diese Jobkategorie gibt es gerade keine weiteren Profile.
                    Schau später wieder vorbei.
                  </p>
                </div>
              )}
              {/* Offene Karten plus die zuletzt bewertete, damit „Rückgängig“ sie zurückholen kann */}
              {cards.map((card, index) => (index <= currentIndex || index === lastSwipe?.index) && (
                <SwipeCard
                  key={card.userId}
                  ref={refs[index]}
                  card={{ ...card, onSwipe: handleSwipe }}
                  isJob={isApplicant}
                  swiped={index > currentIndex}
                />
              ))}
            </div>

            {hasCards && (
              <SwipeButtons
                onPass={() => swipe('left')}
                onLike={() => swipe('right')}
              />
            )}

            <div style={styles.footer}>
              <span>{hasCards ? 'Tastatur: ← Passen · → Interesse' : ''}</span>
              {lastSwipe && (
                <button type="button" style={styles.undo} onClick={undo}>
                  <Icon name="undo" size={16} />
                  Rückgängig
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
