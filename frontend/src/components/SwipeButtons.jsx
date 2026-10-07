import Icon from '../components/Icon'

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '16px 0',
  },
  btn: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  pass: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border-strong)',
    color: 'var(--color-danger)',
  },

  super: {
    background: 'var(--color-accent)',
    color: '#fff',
    boxShadow: '0 4px 14px hsla(160, 13%, 33%, 0.35)',
  },

  like: {
    background: 'var(--color-highlight)',
    color: 'var(--color-highlight-text)',
    boxShadow: '0 4px 14px hsla(50, 91%, 52%, 0.35)',
  },
}

export default function SwipeButtons({ onPass, onSuper, onLike, disabled }) {
  return (
    <div style={styles.container}>
      <button style={{ ...styles.btn, ...styles.pass }} onClick={onPass} disabled={disabled} title="Weiter (Pass)"
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
        <Icon name="close" size={24} />
      </button>
      <button style={{ ...styles.btn, ...styles.super }} onClick={onSuper} disabled={disabled} title="Super Like"
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
        <Icon name="star" size={24} />
      </button>
      <button style={{ ...styles.btn, ...styles.like }} onClick={onLike} disabled={disabled} title="Match"
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
        <Icon name="favorite" size={24} />
      </button>
    </div>
  )
}