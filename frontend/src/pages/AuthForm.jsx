import { useState } from 'react'
import { register, login } from '../api'
import { useBreakpoint, widthFor } from '../hooks/useBreakpoint'

const styles = {
  screen:    { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: '20px' },
  title:     { fontSize: '24px', fontWeight: '600', color: 'var(--color-text-primary)', textAlign: 'center' },
  tabs:      { display: 'flex', gap: '4px', background: 'var(--color-surface-subtle)', padding: '4px', borderRadius: 'var(--radius)' },
  tab: {
    padding: '8px 20px', borderRadius: 'var(--radius)', border: 'none',
    fontSize: '14px', cursor: 'pointer', background: 'transparent', color: 'var(--color-text-secondary)',
  },
  tabActive: { background: 'var(--color-surface)', color: 'var(--color-accent)', fontWeight: '600', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  form:      { width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' },
  splitRow:  { display: 'flex', gap: '10px' },
  group:     { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  label:     { fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500' },
  input: {
    width: '100%', padding: '10px 12px',
    borderRadius: 'var(--radius)', border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)', color: 'var(--color-text-primary)',
    fontSize: '14px', outline: 'none',
  },
  error:     { fontSize: '13px', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', padding: '8px 12px', borderRadius: 'var(--radius)' },
  submitBtn: {
    width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none',
    background: 'var(--color-accent)', color: '#fff',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.15s',
  },
}

export default function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const bp = useBreakpoint()
  const formWidth = widthFor(bp, { mobile: 340, tablet: 400, desktop: 420 })

  async function handleSubmit() {
    setError(null)

    if (!email.trim() || !password) {
      setError('E-Mail und Passwort werden benötigt.')
      return
    }
    if (mode === 'register' && (!firstName.trim() || !lastName.trim())) {
      setError('Vor- und Nachname werden benötigt.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        await register({ firstName, lastName, email, password })
        const session = await login({ email, password })
        onAuthenticated(session)
      } else {
        const session = await login({ email, password })
        onAuthenticated(session)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit() }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.title}>Job<span style={{ color: 'var(--color-success)' }}>Match</span></div>

      <div style={styles.tabs}>
        <button type="button" style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }} onClick={() => setMode('login')}>
          Login
        </button>
        <button type="button" style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }} onClick={() => setMode('register')}>
          Registrieren
        </button>
      </div>

      <div style={{ ...styles.form, maxWidth: `${formWidth}px` }}>
        {mode === 'register' && (
          <div style={styles.splitRow}>
            <div style={styles.group}>
              <label style={styles.label}>Vorname</label>
              <input style={styles.input} type="text" value={firstName} onKeyDown={onKeyDown}
                onChange={(e) => setFirstName(e.target.value)} placeholder="Anna" />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Nachname</label>
              <input style={styles.input} type="text" value={lastName} onKeyDown={onKeyDown}
                onChange={(e) => setLastName(e.target.value)} placeholder="Schmidt" />
            </div>
          </div>
        )}

        <div style={styles.group}>
          <label style={styles.label}>E-Mail</label>
          <input style={styles.input} type="email" value={email} onKeyDown={onKeyDown}
            onChange={(e) => setEmail(e.target.value)} placeholder="du@beispiel.de" />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Passwort</label>
          <input style={styles.input} type="password" value={password} onKeyDown={onKeyDown}
            onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'register' ? 'mind. 8 Zeichen' : ''} />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.submitBtn} onClick={handleSubmit} disabled={loading}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-accent-hover)')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent)')}>
          {loading ? '...' : mode === 'register' ? 'Konto erstellen' : 'Anmelden'}
        </button>
      </div>
    </div>
  )
}