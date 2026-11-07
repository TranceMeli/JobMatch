import { useEffect, useRef } from 'react'
import Icon from '../components/Icon'

const styles = {
  screen: { flex: 1, padding: '24px 16px 40px', display: 'flex', justifyContent: 'center' },
  card: {
    width: '100%',
    maxWidth: '720px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    overflow: 'hidden',
  },
  head: { background: 'var(--color-section-head)', padding: '20px 24px' },
  title: { fontSize: 'var(--text-2xl)', fontWeight: '600', color: 'var(--color-text-primary)' },
  notice: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    marginTop: '8px',
    fontSize: 'var(--text-sm)',
    lineHeight: '1.5',
    color: 'var(--color-text-secondary)',
  },
  body: { padding: '8px 24px 24px', fontSize: 'var(--text-base)', lineHeight: '1.7', color: 'var(--color-text-primary)' },
  h2: { fontSize: 'var(--text-lg)', fontWeight: '600', color: 'var(--color-text-secondary)', margin: '20px 0 6px' },
  p: { margin: '0 0 8px' },
  ul: { margin: '0 0 8px', paddingLeft: '20px' },
  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '20px',
    minHeight: '44px',
    padding: '0 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-base)',
    fontWeight: '600',
  },
}

// Fiktive Angaben – JobMatch ist ein Beispielprojekt
const PROVIDER = {
  name: 'JobMatch Beispielprojekt (fiktiv)',
  person: 'Max Mustermann',
  street: 'Musterstraße 1',
  city: '12345 Musterstadt',
  email: 'kontakt@jobmatch.example',
  privacyEmail: 'datenschutz@jobmatch.example',
}

function Privacy() {
  return (
    <>
      <h2 style={styles.h2}>1. Verantwortlicher</h2>
      <p style={styles.p}>
        {PROVIDER.name}, {PROVIDER.person}, {PROVIDER.street}, {PROVIDER.city}.
        Fragen zum Datenschutz: <a href={`mailto:${PROVIDER.privacyEmail}`}>{PROVIDER.privacyEmail}</a>
      </p>

      <h2 style={styles.h2}>2. Welche Daten wir verarbeiten</h2>
      <ul style={styles.ul}>
        <li><b>Konto:</b> Vor- und Nachname, E-Mail-Adresse und dein Passwort, das nur als sicherer Hash gespeichert wird.</li>
        <li><b>Profil:</b> die Angaben, die du selbst einträgst, z. B. Position, Erfahrung, Ausbildung, Skills, Sprachen, Standort, Gehaltsvorstellung, Verfügbarkeit und Links (GitHub, LinkedIn, Portfolio). Bei Unternehmen: Branche, Größe, Standorte, Gehaltsspanne, Remote-Optionen und Benefits.</li>
        <li><b>Fragebogen:</b> deine Antworten für die gewählte Jobkategorie, auch Freitexte.</li>
        <li><b>Bewertungen und Matches:</b> bei wem du Interesse gezeigt oder gepasst hast, und daraus entstandene Matches.</li>
        <li><b>Sitzung:</b> ein Anmelde-Token mit Erstell- und Ablaufdatum.</li>
      </ul>
      <p style={styles.p}>Bitte mach in Freitexten keine Angaben zu Gesundheit, Herkunft, Religion oder ähnlich sensiblen Themen. Sie werden für das Matching nicht gebraucht.</p>

      <h2 style={styles.h2}>3. Zweck und Rechtsgrundlage</h2>
      <p style={styles.p}>
        Wir verarbeiten diese Daten, um dir die Plattform bereitzustellen: dein Profil anzeigen, passende Gegenüber vorschlagen
        und bei gegenseitigem Interesse den Kontakt herstellen. Rechtsgrundlage ist die Erfüllung des Nutzungsvertrags
        (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h2 style={styles.h2}>4. Matching und Profiling</h2>
      <p style={styles.p}>
        JobMatch berechnet aus den Fragebogen-Antworten beider Seiten automatisch einen Match-Score. 85 % stammen aus
        den Auswahlfragen, gewichtet nach Kriterien wie Technologien, Arbeitsmodell und Einarbeitung. 15 % stammen aus den
        Freitext-Antworten: Dafür sucht JobMatch in beiden Antworten nach gemeinsamen Themen wie Feedback oder Mentoring.
        Das geschieht anhand einer festen Stichwortliste ausschließlich auf unserem Server, ohne KI-Dienst und ohne
        Übermittlung an Dritte. Die Gründe für den Score werden dir angezeigt.
      </p>
      <p style={styles.p}>
        Der Score ist eine Orientierung. Es gibt keine automatisierte Entscheidung mit rechtlicher Wirkung im Sinne von
        Art. 22 DSGVO, denn ob ein Kontakt entsteht, entscheidet ihr beide selbst.
      </p>

      <h2 style={styles.h2}>5. Wer deine Daten sieht</h2>
      <ul style={styles.ul}>
        <li>Passende Nutzer der anderen Seite sehen deine Profilkarte: Name, Position, Tags, Beschreibung und Standort, dazu Match-Score und Gründe.</li>
        <li>E-Mail-Adresse und LinkedIn werden erst nach einem gegenseitigen Match freigeschaltet.</li>
        <li>Es gibt keine Weitergabe an Dritte und keine Übermittlung in Drittländer. Schriften werden von unserem eigenen Server geladen, es gibt keine Analyse- oder Tracking-Dienste.</li>
      </ul>

      <h2 style={styles.h2}>6. Cookies</h2>
      <p style={styles.p}>
        Wir setzen nur ein technisch notwendiges Cookie („refreshToken“). Es hält dich angemeldet, ist für Skripte nicht
        lesbar (HttpOnly), wird nur verschlüsselt übertragen (Secure) und läuft nach 7 Tagen ab. Dafür ist keine Einwilligung
        nötig (§ 25 Abs. 2 TDDDG). Weitere Cookies gibt es nicht.
      </p>

      <h2 style={styles.h2}>7. Speicherdauer</h2>
      <p style={styles.p}>
        Konto-, Profil- und Fragebogendaten speichern wir, solange dein Konto besteht. Anmelde-Tokens laufen nach 7 Tagen ab.
        Wenn du dein Konto löschen möchtest, schreib an <a href={`mailto:${PROVIDER.privacyEmail}`}>{PROVIDER.privacyEmail}</a>. Wir löschen
        dann alle zugehörigen Daten.
      </p>

      <h2 style={styles.h2}>8. Deine Rechte</h2>
      <p style={styles.p}>
        Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
        (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Dein Profil und deine Antworten kannst du
        jederzeit selbst bearbeiten. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren.
      </p>

      <h2 style={styles.h2}>9. Sicherheit</h2>
      <p style={styles.p}>Die Übertragung ist per HTTPS verschlüsselt, Passwörter werden nur als Hash gespeichert, und Anmelde-Tokens sind kurzlebig und werden bei jeder Erneuerung ausgetauscht.</p>
    </>
  )
}

function Imprint() {
  return (
    <>
      <h2 style={styles.h2}>Angaben gemäß § 5 DDG</h2>
      <p style={styles.p}>
        {PROVIDER.name}<br />
        {PROVIDER.person}<br />
        {PROVIDER.street}<br />
        {PROVIDER.city}
      </p>

      <h2 style={styles.h2}>Kontakt</h2>
      <p style={styles.p}>E-Mail: <a href={`mailto:${PROVIDER.email}`}>{PROVIDER.email}</a></p>

      <h2 style={styles.h2}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p style={styles.p}>{PROVIDER.person}, Anschrift wie oben</p>

      <h2 style={styles.h2}>Hinweis</h2>
      <p style={styles.p}>
        JobMatch ist ein Open-Source-Beispielprojekt. Anbieter, Anschrift und E-Mail-Adressen sind fiktiv. Wer das Projekt
        selbst betreibt, muss hier die eigenen Angaben eintragen.
      </p>
    </>
  )
}

export default function LegalPage({ page, onBack }) {
  const headingRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus()
  }, [page])

  const isPrivacy = page === 'privacy'

  return (
    <main style={styles.screen}>
      <article style={styles.card}>
        <div style={styles.head}>
          <h1 ref={headingRef} tabIndex={-1} style={styles.title}>
            {isPrivacy ? 'Datenschutzerklärung' : 'Impressum'}
          </h1>
          <div style={styles.notice}>
            <Icon name="info" size={18} />
            <span>Beispielprojekt: Alle Anbieterangaben sind fiktiv.</span>
          </div>
        </div>
        <div style={styles.body}>
          {isPrivacy ? <Privacy /> : <Imprint />}
          <button type="button" style={styles.back} onClick={onBack}>
            <Icon name="arrow_back" size={18} />
            Zurück
          </button>
        </div>
      </article>
    </main>
  )
}
