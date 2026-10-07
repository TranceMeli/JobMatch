import TagInput from '../components/TagInput'
import ToggleGroup from '../components/ToggleGroup'
import { useState } from 'react'

const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead']
const REMOTE_OPTIONS = ['Remote', 'Hybrid', 'Vor Ort']
const AVAILABILITY_OPTIONS = ['Sofort', '1 Monat', '3 Monate', 'Nach Vereinbarung']
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '200+']

const styles = {
  breakout: {
    width: '100vw',
    position: 'relative',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
    padding: '24px 16px',
    display: 'flex',
    justifyContent: 'center',
  },
  book: {
    width: '100%',
    maxWidth: '880px',
    display: 'flex',
    borderRadius: 'var(--radius-card)',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
    border: '1px solid var(--color-border)',
  },
  page: {
    flex: '1 1 0',
    minWidth: 0,
    background: 'var(--color-surface)',
    padding: '28px 24px',
  },
  pageLeft: { borderRight: '1px solid var(--color-border)' },
  title:     { fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' },
  subtitle:  { fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' },
  section:      { marginTop: '28px', marginBottom: '14px' },
  sectionTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  group:     { marginBottom: '16px' },
  label:     { display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '5px', fontWeight: '500' },
  input: {
    width: '100%', padding: '10px 12px',
    borderRadius: 'var(--radius)', border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)', color: 'var(--color-text-primary)',
    fontSize: '14px', outline: 'none',
  },
  textarea: {
    width: '100%', padding: '10px 12px',
    borderRadius: 'var(--radius)', border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface)', color: 'var(--color-text-primary)',
    fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '90px',
  },
  splitRow:  { display: 'flex', gap: '10px' },
  splitCol:  { flex: 1 },
  submitBtn: {
    width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none',
    background: 'var(--color-accent)', color: '#fff',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '24px', transition: 'opacity 0.15s',
  },
}

const INITIAL_FORM = {
  name: '',
  bio: '',
  desiredPosition: '',
  experienceLevel: '',
  education: '',
  skills: [],
  location: '',
  salaryExpectation: '',
  remotePreference: '',
  availability: '',
  languages: [],
  githubUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  resumeUrl: '',
  industry: '',
  companySize: '',
  locations: [],
  requiredSkills: [],
  requiredExperience: '',
  salaryMin: '',
  salaryMax: '',
  remoteOptions: [],
  benefits: [],
  jobtitle: '',
}


export default function ProfileForm({ role, onSubmit, initialValues }) {
  const isApplicant = role === 'User'
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM, ...(initialValues || {}) }))

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <div style={styles.breakout}>
      <div style={styles.book}>
        <div style={{ ...styles.page, ...styles.pageLeft }}>
          <div style={styles.title}>{isApplicant ? 'Dein Bewerberprofil' : 'Unternehmensprofil'}</div>
          <div style={styles.subtitle}>{isApplicant ? 'Einmal ausfüllen, für jedes Match nutzen.' : 'Zeig, wofür ihr steht und wen ihr sucht.'}</div>

          <div style={styles.group}>
            <label style={styles.label}>{isApplicant ? 'Vollständiger Name *' : 'Unternehmensname *'}</label>
            <input style={styles.input} type="text" placeholder={isApplicant ? 'z.B. Anna Schmidt' : 'z.B. TechBau GmbH'}
              value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>

          {isApplicant ? (
            <>
              <div style={styles.section}><div style={styles.sectionTitle}>Position</div></div>
              <div style={styles.group}>
                <label style={styles.label}>Gewünschte Position</label>
                <input style={styles.input} type="text" placeholder="z.B. Junior Frontend Developer"
                  value={form.desiredPosition} onChange={(e) => update('desiredPosition', e.target.value)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Erfahrungslevel</label>
                <ToggleGroup options={EXPERIENCE_LEVELS} value={form.experienceLevel} onChange={(v) => update('experienceLevel', v)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Ausbildung</label>
                <input style={styles.input} type="text" placeholder="z.B. FIAE-Ausbildung, Lutz + Grub Academy"
                  value={form.education} onChange={(e) => update('education', e.target.value)} />
              </div>

              <div style={styles.section}><div style={styles.sectionTitle}>Skills & Sprachen</div></div>
              <div style={styles.group}>
                <label style={styles.label}>Skills</label>
                <TagInput tags={form.skills} onChange={(tags) => update('skills', tags)} placeholder="z.B. React" />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Sprachen</label>
                <TagInput tags={form.languages} onChange={(tags) => update('languages', tags)} placeholder="z.B. Deutsch" />
              </div>
            </>
          ) : (
            <>
              <div style={styles.section}><div style={styles.sectionTitle}>Unternehmen</div></div>
              <div style={styles.group}>
                <label style={styles.label}>Branche</label>
                <input style={styles.input} type="text" placeholder="z.B. Software / FinTech / E-Commerce"
                  value={form.industry} onChange={(e) => update('industry', e.target.value)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Unternehmensgröße</label>
                <ToggleGroup options={COMPANY_SIZES} value={form.companySize} onChange={(v) => update('companySize', v)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Standorte</label>
                <TagInput tags={form.locations} onChange={(tags) => update('locations', tags)} placeholder="z.B. Karlsruhe" />
              </div>

              <div style={styles.section}><div style={styles.sectionTitle}>Offene Stelle</div></div>
              <div style={styles.group}>
                <label style={styles.label}>Gesuchte Stelle</label>
                <input style={styles.input} type="text" placeholder="z.B. Frontend Developer (React)"
                  value={form.jobtitle} onChange={(e) => update('jobtitle', e.target.value)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Erforderliche Erfahrung</label>
                <ToggleGroup options={EXPERIENCE_LEVELS} value={form.requiredExperience} onChange={(v) => update('requiredExperience', v)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Gesuchte Skills</label>
                <TagInput tags={form.requiredSkills} onChange={(tags) => update('requiredSkills', tags)} placeholder="z.B. TypeScript" />
              </div>
            </>
          )}
        </div>

        <div style={styles.page}>
          {isApplicant ? (
            <>
              <div style={{ ...styles.sectionTitle, marginBottom: '14px' }}>Präferenzen</div>
              <div style={styles.group}>
                <label style={styles.label}>Standort</label>
                <input style={styles.input} type="text" placeholder="z.B. Karlsruhe"
                  value={form.location} onChange={(e) => update('location', e.target.value)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Remote-Präferenz</label>
                <ToggleGroup options={REMOTE_OPTIONS} value={form.remotePreference} onChange={(v) => update('remotePreference', v)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Gehaltsvorstellung (€ / Jahr)</label>
                <input style={styles.input} type="number" placeholder="z.B. 55000"
                  value={form.salaryExpectation} onChange={(e) => update('salaryExpectation', e.target.value)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Verfügbarkeit</label>
                <ToggleGroup options={AVAILABILITY_OPTIONS} value={form.availability} onChange={(v) => update('availability', v)} />
              </div>

              <div style={styles.section}><div style={styles.sectionTitle}>Links</div></div>
              <div style={styles.group}>
                <label style={styles.label}>GitHub</label>
                <input style={styles.input} type="url" placeholder="https://github.com/..."
                  value={form.githubUrl} onChange={(e) => update('githubUrl', e.target.value)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>LinkedIn</label>
                <input style={styles.input} type="url" placeholder="https://linkedin.com/in/..."
                  value={form.linkedinUrl} onChange={(e) => update('linkedinUrl', e.target.value)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Portfolio</label>
                <input style={styles.input} type="url" placeholder="https://..."
                  value={form.portfolioUrl} onChange={(e) => update('portfolioUrl', e.target.value)} />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Lebenslauf (Link)</label>
                <input style={styles.input} type="url" placeholder="Link zu PDF, Drive o.ä."
                  value={form.resumeUrl} onChange={(e) => update('resumeUrl', e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div style={{ ...styles.sectionTitle, marginBottom: '14px' }}>Konditionen</div>
              <div style={styles.group}>
                <label style={styles.label}>Remote-Optionen</label>
                <ToggleGroup options={REMOTE_OPTIONS} value={form.remoteOptions} onChange={(v) => update('remoteOptions', v)} multiple />
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Gehaltsspanne (€ / Jahr)</label>
                <div style={styles.splitRow}>
                  <div style={styles.splitCol}>
                    <input style={styles.input} type="number" placeholder="Min, z.B. 50000"
                      value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} />
                  </div>
                  <div style={styles.splitCol}>
                    <input style={styles.input} type="number" placeholder="Max, z.B. 65000"
                      value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={styles.group}>
                <label style={styles.label}>Benefits</label>
                <TagInput tags={form.benefits} onChange={(tags) => update('benefits', tags)} placeholder="z.B. Homeoffice-Budget" />
              </div>
            </>
          )}

          <div style={styles.section}><div style={styles.sectionTitle}>{isApplicant ? 'Über dich' : 'Unternehmenskultur'}</div></div>
          <div style={styles.group}>
            <label style={styles.label}>{isApplicant ? 'Kurze Bio' : 'Unternehmens-Pitch'}</label>
            <textarea style={styles.textarea}
              placeholder={isApplicant ? 'Was macht dich besonders?' : 'Warum sollte jemand bei euch arbeiten?'}
              value={form.bio} onChange={(e) => update('bio', e.target.value)} />
          </div>

          <button style={styles.submitBtn} onClick={handleSubmit}
            onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-accent-hover)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent)')}>
            {initialValues?.name ? 'Profil speichern →' : 'Profil erstellen →'}
          </button>
        </div>
      </div>
    </div>
  )
}