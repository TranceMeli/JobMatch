import { useEffect, useState } from 'react'
import {
  getMyQuestionnaires,
  getQuestionnaire,
  getQuestionnaireAnswers,
} from '../api'
import Icon from '../components/Icon'

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
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
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
    fontSize: '22px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
  },
  section: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '16px 18px 0',
    marginBottom: '14px',
  },
  sectionHead: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    border: 'none',
    background: 'transparent',
    padding: 0,
    textAlign: 'left',
    color: 'var(--color-text-primary)',
    marginBottom: '14px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '600' },
  sectionHint: { fontSize: '13px', fontWeight: '400', color: 'var(--color-text-secondary)', marginTop: '2px' },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  meta: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'var(--color-accent-bg)',
    color: 'var(--color-accent)',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '22px',
  },
  group: {
    padding: '0 0 18px',
    marginBottom: '18px',
    borderBottom: '1px solid var(--color-border)',
  },
  question: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
    marginBottom: '7px',
  },
  answer: {
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  empty: {
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  editBtn: {
    padding: '9px 16px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'var(--color-accent)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
  },
  secondary: {
    flex: '1 1 160px',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    padding: '10px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger-text)',
    fontSize: '13px',
    marginBottom: '18px',
  },
  loading: {
    color: 'var(--color-text-secondary)',
    fontSize: '14px',
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

function formatAnswer(question, value) {
  if (!isAnswered(value)) {
    return 'Keine Antwort hinterlegt.'
  }

  if (question.type === 'scale') {
    return `${value} von 5`
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return String(value)
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
  const [personalOpen, setPersonalOpen] = useState(false)

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

  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.loading}>
          Antworten werden geladen ...
        </div>
      </div>
    )
  }

  const isApplicant = role === 'User'

  // Freitext-Fragen sind persönliche Angaben und fließen nicht in den Match-Score ein
  const scoredQuestions = questions.filter((q) => q.type !== 'text')
  const personalQuestions = questions.filter((q) => q.type === 'text')
  const answeredCount = questions.filter((q) => isAnswered(answers[q.key])).length

  function renderQuestion(question) {
    return (
      <div key={question.key} style={styles.group}>
        <div style={styles.question}>{question.text}</div>
        <div style={styles.answer}>
          {formatAnswer(question, answers[question.key])}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>{isApplicant ? 'Deine Antworten' : 'Eure Antworten'}</h1>
          <button type="button" style={styles.editBtn} onClick={onEdit}>
            Bearbeiten
          </button>
        </div>

        <div style={styles.subtitle}>
          {answeredCount} von {questions.length} Fragen beantwortet
          {updatedAt && ` · zuletzt geändert am ${new Date(updatedAt).toLocaleDateString('de-DE')}`}
        </div>

        <div style={styles.meta}>{jobType}</div>

        {error && <div style={styles.error} role="alert">{error}</div>}

        {!error && (
          <>
            <section style={styles.section} aria-labelledby="scored-title">
              <div style={{ ...styles.sectionHead, cursor: 'default' }}>
                <div>
                  <h2 id="scored-title" style={styles.sectionTitle}>Fließt ins Matching ein</h2>
                  <div style={styles.sectionHint}>Diese Antworten bestimmen den Match-Score.</div>
                </div>
              </div>
              {scoredQuestions.map(renderQuestion)}
            </section>

            {personalQuestions.length > 0 && (
              <section style={styles.section} aria-labelledby="personal-title">
                <button
                  type="button"
                  style={styles.sectionHead}
                  aria-expanded={personalOpen}
                  aria-controls="personal-answers"
                  onClick={() => setPersonalOpen((open) => !open)}
                >
                  <div>
                    <h2 id="personal-title" style={styles.sectionTitle}>
                      Persönliche Fragen ({personalQuestions.length})
                    </h2>
                    <div style={styles.sectionHint}>Nicht Teil des Match-Scores – zeigt dem Gegenüber mehr über {isApplicant ? 'dich' : 'euch'}.</div>
                  </div>
                  <Icon name={personalOpen ? 'expand_less' : 'expand_more'} size={24} />
                </button>
                <div id="personal-answers" hidden={!personalOpen}>
                  {personalQuestions.map(renderQuestion)}
                </div>
              </section>
            )}
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
    </div>
  )
}