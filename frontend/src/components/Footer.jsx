const styles = {
  footer: {
    marginTop: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px 16px',
    padding: '14px 16px',
    background: 'var(--color-footer-bg)',
    color: 'var(--color-footer-text)',
    fontSize: 'var(--text-sm)',
  },
  links: { display: 'flex', flexWrap: 'wrap', gap: '4px 16px', listStyle: 'none' },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '32px',
    border: 'none',
    background: 'transparent',
    padding: 0,
    color: 'var(--color-footer-text)',
    fontSize: 'var(--text-sm)',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
}

export default function Footer({ onShowLegal }) {
  return (
    <footer style={styles.footer}>
      <span>© 2026 JobMatch · fiktives Beispielprojekt</span>
      <ul style={styles.links}>
        <li><button type="button" style={styles.link} onClick={() => onShowLegal('privacy')}>Datenschutz</button></li>
        <li><button type="button" style={styles.link} onClick={() => onShowLegal('imprint')}>Impressum</button></li>
        <li><a style={styles.link} href="mailto:kontakt@jobmatch.example">Kontakt</a></li>
      </ul>
    </footer>
  )
}
