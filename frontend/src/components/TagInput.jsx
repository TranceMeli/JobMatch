import Icon from '../components/Icon'
import { useState } from 'react'

const styles = {
  row:    { display: 'flex', gap: '8px' },
  input: {
    flex: 1,
    padding: '9px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    outline: 'none',
  },
  addBtn: {
    padding: '9px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface-subtle)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  tagList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
  tag: {
    padding: '4px 10px',
    borderRadius: '20px',
    background: 'var(--color-chip-bg)',
    color: 'var(--color-highlight-text)',
    fontSize: '12px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0',
    color: 'var(--color-highlight-text)',
    opacity: 0.6,
  },
}

export default function TagInput({ tags, onChange, placeholder = 'Tag hinzufügen' }) {
  const [input, setInput] = useState('')

  function add() {
    const val = input.trim()
    if (!val || tags.includes(val)) return
    onChange([...tags, val])
    setInput('')
  }

  function remove(index) {
    onChange(tags.filter((_, i) => i !== index))
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); add() }
  }

  return (
    <div>
      <div style={styles.row}>
        <input
          style={styles.input}
          type="text"
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button style={styles.addBtn} onClick={add} type="button">
          + Hinzufügen
        </button>
      </div>
      <div style={styles.tagList}>
        {tags.map((tag, i) => (
          <span key={tag} style={styles.tag}>
            {tag}
            <button style={styles.removeBtn} onClick={() => remove(i)} type="button">
              <Icon name="close" size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}