import Icon from '../components/Icon'

const styles = {
  container: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    padding: '8px 0 0',
  },
  btn: {
    minHeight: '48px',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
    transition: 'background-color var(--duration-fast), border-color var(--duration-fast)',
  },
  pass: {
    flex: 1,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-strong)',
    color: 'var(--color-danger-text)',
  },
  like: {
    flex: 1.4,
    background: 'var(--color-accent)',
    border: '1px solid var(--color-accent)',
    color: '#fff',
  },
}

export default function SwipeButtons({ onPass, onLike, disabled }) {
  return (
    <div style={styles.container}>
      <button
        type="button"
        style={{ ...styles.btn, ...styles.pass }}
        onClick={onPass}
        disabled={disabled}
        aria-keyshortcuts="ArrowLeft"
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-danger-text)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
      >
        <Icon name="close" size={20} />
        Passen
      </button>
      <button
        type="button"
        style={{ ...styles.btn, ...styles.like }}
        onClick={onLike}
        disabled={disabled}
        aria-keyshortcuts="ArrowRight"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
      >
        <Icon name="favorite" size={20} />
        Interesse zeigen
      </button>
    </div>
  )
}
