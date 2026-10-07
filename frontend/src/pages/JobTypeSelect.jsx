import { useState } from 'react'

const JOB_TYPES = ['Junior Developer']

const styles = {
  screen: {
    flex: 1,
    padding: '32px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
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
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
    marginBottom: '22px',
  },
  option: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: '600',
  },
  active: {
    borderColor: 'var(--color-accent)',
    background: 'var(--color-accent-bg)',
  },
  note: {
    marginTop: '12px',
    fontSize: '12px',
    color: 'var(--color-text-muted)',
  },
  button: {
    width: '100%',
    marginTop: '20px',
    padding: '12px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'var(--color-accent)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
  },
}

export default function JobTypeSelect({ role, onContinue }) {
  const [selected, setSelected] = useState(JOB_TYPES[0])
  const isApplicant = role === 'User'

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.title}>
          {isApplicant ? 'Welche Stelle suchst du?' : 'Für welche Stelle sucht ihr?'}
        </div>

        <div style={styles.subtitle}>
          {isApplicant
            ? 'Wähle eine Jobkategorie. Danach beantwortest du Fragen, die für das spätere Matching relevant sind.'
            : 'Wähle die Jobkategorie, für die du deine Anforderungen und Erwartungen festlegen möchtest.'}
        </div>

        {JOB_TYPES.map((jobType) => (
          <button
            key={jobType}
            type="button"
            style={{ ...styles.option, ...(selected === jobType ? styles.active : {}) }}
            onClick={() => setSelected(jobType)}
          >
            {jobType}
          </button>
        ))}

        <div style={styles.note}>
          Weitere Jobkategorien können später über dasselbe Question-Set-System ergänzt werden.
        </div>

        <button
          type="button"
          style={styles.button}
          onClick={() => onContinue(selected)}
        >
          Fragen beantworten →
        </button>
      </div>
    </div>
  )
}
