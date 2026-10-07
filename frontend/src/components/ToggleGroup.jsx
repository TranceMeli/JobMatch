const styles = {
  row: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: {
    padding: '7px 14px',
    borderRadius: '20px',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  chipActive: {
    background: 'var(--color-accent)',
    borderColor: 'var(--color-accent)',
    color: '#fff',
    fontWeight: '600',
  },
}

export default function ToggleGroup({ options, value, onChange, multiple = false }) {
  function isActive(opt) {
    return multiple ? Array.isArray(value) && value.includes(opt) : value === opt
  }

  function toggle(opt) {
    if (multiple) {
      const arr = Array.isArray(value) ? value : []
      onChange(arr.includes(opt) ? arr.filter((v) => v !== opt) : [...arr, opt])
    } else {
      onChange(value === opt ? '' : opt)
    }
  }

  return (
    <div style={styles.row}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          style={{ ...styles.chip, ...(isActive(opt) ? styles.chipActive : {}) }}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}