import { useEffect, useState } from 'react'
import {
  getMyQuestionnaires,
  getQuestionnaire,
  getQuestionnaireAnswers,
} from '../api'

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
  title: {
    fontSize: '22px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    marginBottom: '6px',
  },
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
  primary: {
    flex: '1 1 220px',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'var(--color-accent)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
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
    color: 'var(--color-danger)',
    fontSize: '13px',
    marginBottom: '18px',
  },
  loading: {
    color: 'var(--color-text-secondary)',
    fontSize: '14px',
  },
}

function formatAnswer(question, value) {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  ) {
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

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.title}>Meine Antworten</div>

        <div style={styles.subtitle}>
          {isApplicant
            ? 'Hier siehst du deine gespeicherten Antworten für diese Jobkategorie. Du kannst sie jederzeit bearbeiten.'
            : 'Hier seht ihr die gespeicherten Antworten für diese Jobkategorie. Ihr könnt sie jederzeit bearbeiten.'}
        </div>

        <div style={styles.meta}>{jobType}</div>

        {updatedAt && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              marginBottom: '22px',
            }}
          >
            Zuletzt aktualisiert:{' '}
            {new Date(updatedAt).toLocaleString('de-DE')}
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {!error &&
          questions.map((question) => (
            <div key={question.key} style={styles.group}>
              <div style={styles.question}>{question.text}</div>

              <div style={styles.answer}>
                {formatAnswer(question, answers[question.key])}
              </div>
            </div>
          ))}

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.primary}
            onClick={onEdit}
          >
            Antworten bearbeiten →
          </button>

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