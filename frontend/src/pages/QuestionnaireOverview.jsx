import { useEffect, useMemo, useState } from 'react'
import {
  getMyQuestionnaires,
  getQuestionnaire,
  getQuestionnaireAnswers,
} from '../api'
import Icon from '../components/Icon'

const PERSONAL = 'Persönlich'

const styles = {
  screen: {
    flex: 1,
    padding: '24px 16px 40px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '820px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    padding: '28px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '6px',
  },
  title: {
    fontSize: 'var(--text-xl)',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
  },
  subtitle: {
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
    marginBottom: '6px',
  },
  weighting: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '16px',
    listStyle: 'none',
  },
  pill: {
    minHeight: '34px',
    padding: '0 12px',
    borderRadius: '17px',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
  },
  pillActive: {
    background: 'var(--color-nav-bg)',
    borderColor: 'var(--color-nav-bg)',
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  sectionHead: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    border: 'none',
    background: 'var(--color-section-head)',
    padding: '12px 18px',
    textAlign: 'left',
    color: 'var(--color-text-primary)',
  },
  sectionTitle: { display: 'block', fontSize: 'var(--text-lg)', fontWeight: '600' },
  sectionHint: { display: 'block', fontSize: 'var(--text-sm)', fontWeight: '400', color: 'var(--color-text-secondary)', marginTop: '2px' },
  sectionMeta: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: '400' },
  openBadge: {
    padding: '1px 8px',
    borderRadius: '10px',
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    fontSize: 'var(--text-xs)',
    fontWeight: '600',
  },
  sectionBody: { padding: '4px 18px' },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '4px 16px',
    padding: '12px 0',
    borderBottom: '1px solid var(--color-border)',
  },
  rowFull: { gridTemplateColumns: '1fr' },
  question: {
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
  },
  answer: {
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  chip: {
    display: 'inline-block',
    padding: '1px 9px',
    margin: '0 4px 4px 0',
    borderRadius: '12px',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
  },
  dots: { letterSpacing: '3px', color: 'var(--color-accent)' },
  scaleText: { fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginLeft: '8px' },
  empty: {
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
  },
  info: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    padding: '10px 12px',
    margin: '12px 0 4px',
    borderRadius: 'var(--radius)',
    background: 'var(--color-bg)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
    lineHeight: '1.55',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  editBtn: {
    minHeight: '42px',
    padding: '0 18px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'var(--color-accent)',
    color: '#fff',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
  },
  secondary: {
    flex: '1 1 160px',
    minHeight: '46px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
  },
  error: {
    padding: '10px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    fontSize: 'var(--text-sm)',
    marginBottom: '18px',
  },
  loading: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-base)',
  },
}

function isAnswered(value) {
  return !(
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function Answer({ question, value }) {
  if (!isAnswered(value)) {
    return <span style={styles.empty}>Noch offen</span>
  }

  if (question.type === 'scale') {
    const n = Number(value)
    const label = n === 1 ? question.scaleMin : n === 5 ? question.scaleMax : null
    return (
      <span>
        <span style={styles.dots} aria-hidden="true">{'●'.repeat(n)}{'○'.repeat(5 - n)}</span>
        <span style={styles.scaleText}>{n} von 5{label ? ` · ${label}` : ''}</span>
      </span>
    )
  }

  if (Array.isArray(value)) {
    return (
      <span>
        {value.map((item) => <span key={item} style={styles.chip}>{item}</span>)}
      </span>
    )
  }

  return <span>{String(value)}</span>
}

export default function QuestionnaireOverview({
  role,
  jobType,
  onEdit,
  onBack,
}) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'open' | Kategoriename
  const [openSections, setOpenSections] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [questionnaire, existingAnswers, questionnaires] =
          await Promise.all([
            getQuestionnaire(jobType),
            getQuestionnaireAnswers(jobType),
            getMyQuestionnaires(),
          ])

        if (!active) return

        setQuestions(questionnaire.questions || [])
        setAnswers(existingAnswers || {})

        const summary = (questionnaires || []).find(
          (item) =>
            item.jobType?.toLowerCase() === jobType.toLowerCase(),
        )

        setUpdatedAt(summary?.updatedAt || null)
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Antworten konnten nicht geladen werden.',
          )
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

  const categories = useMemo(() => {
    const order = []
    for (const q of questions) {
      if (!order.includes(q.category)) order.push(q.category)
    }
    return order
  }, [questions])

  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.loading}>Antworten werden geladen …</div>
      </div>
    )
  }

  const isApplicant = role === 'User'
  const answeredCount = questions.filter((q) => isAnswered(answers[q.key])).length
  const openCount = questions.length - answeredCount

  // Standard: die ersten beiden Kategorien aufgeklappt
  const expanded = openSections ?? new Set(categories.slice(0, 2))

  function toggleSection(category) {
    const next = new Set(expanded)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    setOpenSections(next)
  }

  const visibleCategories = filter === 'all' || filter === 'open' ? categories : [filter]

  function questionsFor(category) {
    const list = questions.filter((q) => q.category === category)
    return filter === 'open' ? list.filter((q) => !isAnswered(answers[q.key])) : list
  }

  const filterOptions = [
    { key: 'all', label: 'Alle' },
    ...categories.map((c) => ({ key: c, label: c })),
    ...(openCount > 0 ? [{ key: 'open', label: `Offen (${openCount})` }] : []),
  ]

  return (
    <main style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>{isApplicant ? 'Deine Antworten' : 'Eure Antworten'}</h1>
          <button type="button" style={styles.editBtn} onClick={onEdit}>
            Bearbeiten
          </button>
        </div>

        <div style={styles.subtitle}>
          {jobType} · {answeredCount} von {questions.length} Fragen beantwortet
          {updatedAt && ` · zuletzt geändert am ${new Date(updatedAt).toLocaleDateString('de-DE')}`}
        </div>
        <div style={styles.weighting}>
          Auswahlfragen bestimmen 85 % des Match-Scores, persönliche Fragen 15 %. Offene Fragen werden beim Matching übersprungen.
        </div>

        {error && <div style={styles.error} role="alert">{error}</div>}

        {!error && (
          <>
            <ul style={styles.filters} aria-label="Antworten filtern">
              {filterOptions.map((option) => (
                <li key={option.key}>
                  <button
                    type="button"
                    style={{ ...styles.pill, ...(filter === option.key ? styles.pillActive : {}) }}
                    aria-pressed={filter === option.key}
                    onClick={() => setFilter(option.key)}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>

            {visibleCategories.map((category) => {
              const all = questions.filter((q) => q.category === category)
              const list = questionsFor(category)
              if (list.length === 0) return null

              const done = all.filter((q) => isAnswered(answers[q.key])).length
              const isOpen = filter !== 'all' || expanded.has(category)
              const bodyId = `section-${category.replace(/\W+/g, '-')}`
              const isPersonal = category === PERSONAL

              return (
                <section key={category} style={styles.section} aria-labelledby={`${bodyId}-title`}>
                  <h2 style={{ margin: 0 }}>
                    <button
                      type="button"
                      style={styles.sectionHead}
                      aria-expanded={isOpen}
                      aria-controls={bodyId}
                      onClick={() => (filter === 'all' ? toggleSection(category) : setFilter('all'))}
                    >
                      <span>
                        <span id={`${bodyId}-title`} style={styles.sectionTitle}>{category}</span>
                        {isPersonal && (
                          <span style={styles.sectionHint}>Fließt über gemeinsame Themen mit 15 % ein.</span>
                        )}
                      </span>
                      <span style={styles.sectionMeta}>
                        {done < all.length
                          ? <span style={styles.openBadge}>{all.length - done} offen</span>
                          : <span>{done}/{all.length}</span>}
                        <Icon name={isOpen ? 'expand_less' : 'expand_more'} size={24} />
                      </span>
                    </button>
                  </h2>

                  <div id={bodyId} hidden={!isOpen} style={styles.sectionBody}>
                    {isPersonal && (
                      <div style={styles.info}>
                        <Icon name="info" size={18} />
                        <div>
                          <b>So werden die Freitexte ausgewertet:</b> JobMatch sucht in den Antworten beider Seiten nach
                          gemeinsamen Themen wie Feedback, Mentoring oder Eigeninitiative. Das passiert lokal auf dem
                          JobMatch-Server, ohne externe Dienste. Erkannt werden nur Stichwörter, keine Bedeutung.
                          <br />
                          <b>Hinweis:</b> Eine Auswertung, die Texte wirklich versteht, z. B. mit einem KI-Sprachmodell,
                          bräuchte eine externe API. Dann würden die Freitexte an diesen Anbieter übermittelt, und dafür
                          wären ein Auftragsverarbeitungsvertrag und ein Hinweis in der Datenschutzerklärung nötig.
                          Bitte keine Angaben zu Gesundheit, Herkunft, Religion oder ähnlich sensiblen Themen.
                        </div>
                      </div>
                    )}

                    {list.map((question, index) => (
                      <div
                        key={question.key}
                        style={{
                          ...styles.row,
                          ...(question.type === 'text' ? styles.rowFull : {}),
                          ...(index === list.length - 1 ? { borderBottom: 'none' } : {}),
                        }}
                      >
                        <div style={styles.question}>{question.text}</div>
                        <div style={styles.answer}>
                          <Answer question={question} value={answers[question.key]} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.secondary}
            onClick={onBack}
          >
            Zurück zu Home
          </button>
        </div>
      </div>
    </main>
  )
}
