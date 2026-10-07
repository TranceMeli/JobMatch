import { useEffect, useState } from 'react'
import ToggleGroup from '../components/ToggleGroup'
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
    marginBottom: '28px',
  },
  group: {
    paddingBottom: '22px',
    marginBottom: '22px',
    borderBottom: '1px solid var(--color-border)',
  },
  label: {
    display: 'block',
    fontSize: '14px',
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
    width: '44px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
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
    fontSize: '14px',
    resize: 'vertical',
  },
  submit: {
    width: '100%',
    padding: '13px',
    marginTop: '6px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'var(--color-accent)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
  },
  error: {
    marginBottom: '18px',
    padding: '10px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-danger)',
    background: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    fontSize: '13px',
  },
  loading: {
    color: 'var(--color-text-secondary)',
    fontSize: '14px',
  },
}

function updateAnswer(setAnswers, key, value) {
  setAnswers((current) => ({ ...current, [key]: value }))
}

export default function QuestionnairePage({ role, jobType, onSaved }) {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

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
        <div style={styles.scale}>
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              type="button"
              style={{
                ...styles.scaleButton,
                ...(Number(value) === number ? styles.active : {}),
              }}
              onClick={() => updateAnswer(setAnswers, question.key, number)}
              aria-label={`${number} von 5`}
            >
              {number}
            </button>
          ))}
        </div>
      )
    }

    return (
      <textarea
        style={styles.textarea}
        value={value || ''}
        onChange={(event) => updateAnswer(setAnswers, question.key, event.target.value)}
        placeholder="Deine Antwort ..."
      />
    )
  }

  async function handleSubmit() {
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

  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.loading}>Fragen werden geladen ...</div>
      </div>
    )
  }

  const isApplicant = role === 'User'

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.title}>{jobType}</div>
        <div style={styles.subtitle}>
          {isApplicant
            ? 'Deine Antworten helfen JobMatch dabei, passende Unternehmen zu finden.'
            : 'Eure Antworten helfen JobMatch dabei, passende Bewerber für diese Stelle zu finden.'}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {questions.map((question) => (
          <div key={question.key} style={styles.group}>
            <label style={styles.label}>
              {question.text}
              {question.required ? ' *' : ''}
            </label>
            {renderQuestion(question)}
          </div>
        ))}

        <button
          type="button"
          style={{ ...styles.submit, opacity: saving ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Wird gespeichert ...' : 'Antworten speichern →'}
        </button>
      </div>
    </div>
  )
}
