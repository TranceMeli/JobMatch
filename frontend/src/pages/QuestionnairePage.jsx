import { useEffect, useMemo, useRef, useState } from 'react'
import ToggleGroup from '../components/ToggleGroup'
import Icon from '../components/Icon'
import { getQuestionnaire, getQuestionnaireAnswers, saveQuestionnaire } from '../api'

const styles = {
  screen: {
    flex: 1,
    padding: '24px 16px 40px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '760px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    overflow: 'hidden',
  },
  head: {
    background: 'var(--color-section-head)',
    padding: '20px 28px 16px',
  },
  title: {
    fontSize: 'var(--text-xl)',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '12px',
    marginTop: '14px',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
  },
  progressTrack: {
    height: '8px',
    borderRadius: '4px',
    background: 'var(--color-surface)',
    marginTop: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--color-accent)',
    transition: 'width var(--duration-fast)',
  },
  steps: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '12px',
    listStyle: 'none',
  },
  stepBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    minHeight: '32px',
    padding: '0 10px',
    borderRadius: '16px',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-xs)',
  },
  stepActive: {
    background: 'var(--color-nav-bg)',
    borderColor: 'var(--color-nav-bg)',
    color: '#fff',
    fontWeight: '600',
  },
  body: { padding: '24px 28px 28px' },
  stepTitle: {
    fontSize: 'var(--text-lg)',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    marginBottom: '18px',
  },
  group: {
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    padding: '0 0 22px',
    margin: '0 0 22px',
    minWidth: 0,
  },
  label: {
    display: 'block',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    marginBottom: '10px',
    lineHeight: '1.5',
  },
  scale: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  scaleButton: {
    width: '48px',
    height: '44px',
    borderRadius: '10px',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
  },
  scaleLegend: {
    marginTop: '6px',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  active: {
    background: 'var(--color-accent)',
    borderColor: 'var(--color-accent)',
    color: '#fff',
  },
  textarea: {
    width: '100%',
    minHeight: '110px',
    padding: '11px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-base)',
    resize: 'vertical',
  },
  hint: {
    marginTop: '6px',
    fontSize: 'var(--text-xs)',
    lineHeight: '1.5',
    color: 'var(--color-text-muted)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px',
  },
  primary: {
    flex: 1.4,
    minHeight: '48px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'var(--color-accent)',
    color: '#fff',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
  },
  secondary: {
    flex: 1,
    minHeight: '48px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
  },
  legend: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
    marginBottom: '16px',
  },
  error: {
    marginBottom: '18px',
    padding: '10px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    fontSize: 'var(--text-sm)',
  },
  loading: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-base)',
  },
}

function updateAnswer(setAnswers, key, value) {
  setAnswers((current) => ({ ...current, [key]: value }))
}

function isAnswered(value) {
  return !(value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))
}

export default function QuestionnairePage({ role, jobType, onSaved }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const stepTitleRef = useRef(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [questionnaire, existing] = await Promise.all([
          getQuestionnaire(jobType),
          getQuestionnaireAnswers(jobType),
        ])

        if (!active) return

        setQuestions(questionnaire.questions || [])
        setAnswers(existing || {})
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
  }, [jobType])

  // Kategorien in der Reihenfolge des Katalogs bilden die Schritte
  const categories = useMemo(() => {
    const order = []
    for (const q of questions) {
      if (!order.includes(q.category)) order.push(q.category)
    }
    return order
  }, [questions])

  const current = categories[step]
  const stepQuestions = questions.filter((q) => q.category === current)
  const isLast = step === categories.length - 1

  function goTo(index) {
    setError(null)
    setStep(index)
    window.scrollTo(0, 0)
    // Fokus auf die neue Schrittüberschrift, damit Screenreader den Wechsel ansagen
    setTimeout(() => stepTitleRef.current?.focus(), 0)
  }

  function missingRequired(list) {
    return list.filter((q) => q.required && !isAnswered(answers[q.key]))
  }

  function next() {
    const missing = missingRequired(stepQuestions)
    if (missing.length > 0) {
      setError(`Bitte beantworte noch: ${missing.map((q) => q.text).join(' · ')}`)
      document.getElementById(`q-${missing[0].key}`)?.scrollIntoView({ block: 'center' })
      return
    }
    goTo(step + 1)
  }

  async function handleSubmit() {
    const missing = missingRequired(questions)
    if (missing.length > 0) {
      goTo(categories.indexOf(missing[0].category))
      setError(`Bitte beantworte noch: ${missing.map((q) => q.text).join(' · ')}`)
      return
    }

    setSaving(true)
    setError(null)

    try {
      await saveQuestionnaire(jobType, answers)
      onSaved(jobType)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function renderQuestion(question) {
    const value = answers[question.key]

    if (question.type === 'single') {
      return (
        <ToggleGroup
          options={question.options}
          value={value || ''}
          onChange={(next) => updateAnswer(setAnswers, question.key, next)}
        />
      )
    }

    if (question.type === 'multi') {
      return (
        <ToggleGroup
          options={question.options}
          value={Array.isArray(value) ? value : []}
          multiple
          onChange={(next) => updateAnswer(setAnswers, question.key, next)}
        />
      )
    }

    if (question.type === 'scale') {
      return (
        <>
          <div style={styles.scale}>
            {[1, 2, 3, 4, 5].map((number) => (
              <button
                key={number}
                type="button"
                aria-pressed={Number(value) === number}
                style={{
                  ...styles.scaleButton,
                  ...(Number(value) === number ? styles.active : {}),
                }}
                onClick={() => updateAnswer(setAnswers, question.key, number)}
                aria-label={`${number} von 5${number === 1 && question.scaleMin ? ` (${question.scaleMin})` : ''}${number === 5 && question.scaleMax ? ` (${question.scaleMax})` : ''}`}
              >
                {number}
              </button>
            ))}
          </div>
          {(question.scaleMin || question.scaleMax) && (
            <div style={styles.scaleLegend} aria-hidden="true">
              1 = {question.scaleMin} · 5 = {question.scaleMax}
            </div>
          )}
        </>
      )
    }

    return (
      <>
        <textarea
          style={styles.textarea}
          value={value || ''}
          aria-label={question.text}
          aria-describedby={`${question.key}-hint`}
          onChange={(event) => updateAnswer(setAnswers, question.key, event.target.value)}
          placeholder={role === 'User' ? 'Deine Antwort …' : 'Eure Antwort …'}
        />
        <div id={`${question.key}-hint`} style={styles.hint}>
          Gemeinsame Themen fließen in den Match-Score ein. Bitte keine Angaben zu Gesundheit, Herkunft, Religion oder ähnlich sensiblen Themen.
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.loading}>Fragen werden geladen …</div>
      </div>
    )
  }

  const isApplicant = role === 'User'
  const answeredCount = questions.filter((q) => isAnswered(answers[q.key])).length

  return (
    <main style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.head}>
          <h1 style={styles.title}>{jobType}</h1>
          <div style={styles.subtitle}>
            {isApplicant
              ? 'Deine Antworten helfen JobMatch dabei, passende Unternehmen zu finden.'
              : 'Eure Antworten helfen JobMatch dabei, passende Bewerber für diese Stelle zu finden.'}
          </div>

          <div style={styles.progressRow}>
            <span>Schritt {step + 1} von {categories.length}</span>
            <span>{answeredCount} von {questions.length} beantwortet</span>
          </div>
          <div style={styles.progressTrack} role="progressbar" aria-label="Fortschritt" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answeredCount}>
            <div style={{ ...styles.progressFill, width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} />
          </div>

          <ol style={styles.steps} aria-label="Kategorien">
            {categories.map((category, index) => {
              const list = questions.filter((q) => q.category === category)
              const done = list.every((q) => isAnswered(answers[q.key]))
              return (
                <li key={category}>
                  <button
                    type="button"
                    style={{ ...styles.stepBtn, ...(index === step ? styles.stepActive : {}) }}
                    aria-current={index === step ? 'step' : undefined}
                    onClick={() => goTo(index)}
                  >
                    {done && <Icon name="check" size={14} />}
                    {category}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        <div style={styles.body}>
          <h2 ref={stepTitleRef} tabIndex={-1} style={styles.stepTitle}>{current}</h2>
          <div style={styles.legend}>* Pflichtfrage · alle anderen Fragen sind freiwillig und werden beim Matching übersprungen, wenn sie leer bleiben.</div>

          {error && <div style={styles.error} role="alert">{error}</div>}

          {stepQuestions.map((question) => (
            <fieldset key={question.key} id={`q-${question.key}`} style={styles.group}>
              <legend style={styles.label}>
                {question.text}
                {question.required ? ' *' : ''}
              </legend>
              {renderQuestion(question)}
            </fieldset>
          ))}

          <div style={styles.actions}>
            {step > 0 && (
              <button type="button" style={styles.secondary} onClick={() => goTo(step - 1)}>
                Zurück
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                style={{ ...styles.primary, opacity: saving ? 0.6 : 1 }}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Wird gespeichert …' : 'Antworten speichern'}
              </button>
            ) : (
              <button type="button" style={styles.primary} onClick={next}>
                Weiter: {categories[step + 1]}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
