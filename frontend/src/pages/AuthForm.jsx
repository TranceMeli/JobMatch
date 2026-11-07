import { useState } from 'react'
import { register, login } from '../api'
import { useBreakpoint, widthFor } from '../hooks/useBreakpoint'
import Icon from '../components/Icon'

const styles = {
  screen:    { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: '20px' },
  title:     { fontSize: 'var(--text-2xl)', fontWeight: '600', color: 'var(--color-text-primary)', textAlign: 'center' },
  tabs:      { display: 'flex', gap: '4px', background: 'var(--color-surface-subtle)', padding: '4px', borderRadius: 'var(--radius)' },
  tab: {
    padding: '8px 20px', borderRadius: 'var(--radius)', border: 'none',
    fontSize: 'var(--text-base)', cursor: 'pointer', background: 'transparent', color: 'var(--color-text-secondary)',
  },
  tabActive: { background: 'var(--color-surface)', color: 'var(--color-accent-hover)', fontWeight: '600', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  form:      { width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' },
  splitRow:  { display: 'flex', gap: '10px' },
  group:     { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  label:     { fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: '500' },
  input: {
    width: '100%', padding: '10px 12px',
    borderRadius: 'var(--radius)', border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)', color: 'var(--color-text-primary)',
    fontSize: 'var(--text-base)', outline: 'none',
  },
  inputInvalid: { border: '2px solid var(--color-danger-text)', padding: '9px 11px' },
  fieldError: { display: 'flex', gap: '4px', alignItems: 'flex-start', fontSize: 'var(--text-sm)', lineHeight: '1.4', color: 'var(--color-danger-text)' },
  submitBtn: {
    width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none',
    background: 'var(--color-accent)', color: '#fff',
    fontSize: 'var(--text-base)', fontWeight: '600', cursor: 'pointer', transition: 'background-color var(--duration-fast)',
  },
}

// Übersetzt API-Fehler in eine verständliche Meldung mit Lösungsvorschlag
function describeError(err, mode) {
  if (err.status === null) return 'Der Server ist nicht erreichbar. Prüfe deine Verbindung oder ob das Backend läuft.'
  if (mode === 'login' && err.status === 401) return 'E-Mail oder Passwort stimmt nicht. Prüfe deine Eingabe oder registriere dich.'
  if (mode === 'register' && /already registered/i.test(err.message)) return 'Für diese E-Mail gibt es schon ein Konto. Melde dich stattdessen an.'
  if (mode === 'register' && err.status === 400) return 'Das Passwort muss mindestens 8 Zeichen lang sein.'
  return 'Das hat nicht geklappt. Versuche es gleich noch einmal.'
}

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <div id={id} style={styles.fieldError}>
      <Icon name="error" size={16} />
      <span>{message}</span>
    </div>
  )
}

export default function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const bp = useBreakpoint()
  const formWidth = widthFor(bp, { mobile: 340, tablet: 400, desktop: 420 })

  function validate() {
    const next = {}
    if (mode === 'register' && !firstName.trim()) next.firstName = 'Gib deinen Vornamen ein.'
    if (mode === 'register' && !lastName.trim()) next.lastName = 'Gib deinen Nachnamen ein.'
    if (!email.trim()) next.email = 'Gib deine E-Mail-Adresse ein.'
    if (!password) next.password = 'Gib dein Passwort ein.'
    else if (mode === 'register' && password.length < 8) next.password = 'Das Passwort muss mindestens 8 Zeichen lang sein.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      document.getElementById(`auth-${Object.keys(next)[0]}`)?.focus()
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        await register({ firstName, lastName, email, password })
      }
      const session = await login({ email, password })
      onAuthenticated(session)
    } catch (err) {
      // Login-Fehler gehören zum Passwort-Feld, Registrierungsfehler je nach Ursache
      const message = describeError(err, mode)
      const field = /E-Mail/.test(message) && mode === 'register' ? 'email' : 'password'
      setErrors({ [field]: message })
      document.getElementById(`auth-${field}`)?.focus()
    } finally {
      setLoading(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setErrors({})
  }

  function field(name, label, props) {
    const errorId = `auth-${name}-error`
    return (
      <div style={styles.group}>
        <label htmlFor={`auth-${name}`} style={styles.label}>{label}</label>
        <input
          id={`auth-${name}`}
          style={{ ...styles.input, ...(errors[name] ? styles.inputInvalid : {}) }}
          aria-invalid={errors[name] ? 'true' : undefined}
          aria-describedby={errors[name] ? errorId : undefined}
          {...props}
        />
        <FieldError id={errorId} message={errors[name]} />
      </div>
    )
  }

  return (
    <div style={styles.screen}>
      <h1 style={styles.title}>Job<span style={{ color: 'var(--color-success)' }}>Match</span></h1>

      <div style={styles.tabs}>
        <button type="button" aria-pressed={mode === 'login'} style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }} onClick={() => switchMode('login')}>
          Anmelden
        </button>
        <button type="button" aria-pressed={mode === 'register'} style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }} onClick={() => switchMode('register')}>
          Registrieren
        </button>
      </div>

      <form noValidate onSubmit={handleSubmit} style={{ ...styles.form, maxWidth: `${formWidth}px` }}>
        {mode === 'register' && (
          <div style={styles.splitRow}>
            {field('firstName', 'Vorname', {
              type: 'text', autoComplete: 'given-name', value: firstName,
              onChange: (e) => setFirstName(e.target.value), placeholder: 'Anna',
            })}
            {field('lastName', 'Nachname', {
              type: 'text', autoComplete: 'family-name', value: lastName,
              onChange: (e) => setLastName(e.target.value), placeholder: 'Schmidt',
            })}
          </div>
        )}

        {field('email', 'E-Mail', {
          type: 'email', autoComplete: 'email', value: email,
          onChange: (e) => setEmail(e.target.value), placeholder: 'du@beispiel.de',
        })}

        {field('password', 'Passwort', {
          type: 'password', autoComplete: mode === 'register' ? 'new-password' : 'current-password', value: password,
          onChange: (e) => setPassword(e.target.value), placeholder: mode === 'register' ? 'mind. 8 Zeichen' : '',
        })}

        <button type="submit" style={styles.submitBtn} disabled={loading} aria-busy={loading}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}>
          {loading
            ? (mode === 'register' ? 'Konto wird erstellt …' : 'Anmeldung läuft …')
            : (mode === 'register' ? 'Konto erstellen' : 'Anmelden')}
        </button>
      </form>
    </div>
  )
}
