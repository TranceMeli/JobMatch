import { useBreakpoint, widthFor } from '../hooks/useBreakpoint'

const styles = {
  screen: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', gap: '18px' },
  heading: { fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', textAlign: 'center' },
  subheading: { fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '-10px' },
  card: {
    width: '100%',
    borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)',
    background: 'var(--color-surface)', padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '10px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  },
  avatar: {
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '600', color: '#fff',
  },
  name: { fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)' },
  subtitle: { fontSize: '14px', color: 'var(--color-success)', marginTop: '-6px' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' },
  chip: {
    padding: '3px 10px', borderRadius: '20px',
    border: '1px solid var(--color-border-strong)', fontSize: '12px', color: 'var(--color-text-secondary)',
  },
  bio: { fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' },
  metaGrid: { display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' },
  metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px' },
  metaLabel: { color: 'var(--color-text-muted)' },
  metaValue: { color: 'var(--color-text-primary)', fontWeight: '500', textAlign: 'right' },
  links: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '2px' },
  link: { fontSize: '13px', color: 'var(--color-accent)', textDecoration: 'none' },
  actions: { width: '100%', display: 'flex', gap: '10px' },
  continueBtn: {
    flex: 1, padding: '12px', borderRadius: 'var(--radius)', border: 'none',
    background: 'var(--color-accent)', color: '#fff', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', transition: 'background-color 0.15s',
  },
  editBtn: {
    flex: 1, padding: '12px', borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border-strong)', background: 'var(--color-surface)',
    color: 'var(--color-text-primary)', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', transition: 'background-color 0.15s',
  },
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

// role kommt als "User" oder "Admin" vom Backend (Roles.cs), nicht mehr "applicant"/"company".
export default function ProfileCard({ role, profile, onContinue, onEdit }) {
  if (!profile) return null
  const isApplicant = role === 'User'

  const bp = useBreakpoint()
  const cardWidth = widthFor(bp, { mobile: 360, tablet: 440, desktop: 480 })

  const tags = isApplicant ? profile.skills : profile.requiredSkills
  const subtitle = isApplicant ? profile.desiredPosition : profile.jobtitle
  const badge = isApplicant ? profile.experienceLevel : profile.companySize

  return (
    <div style={styles.screen}>
      <div style={styles.heading}>Dein Profil ist gespeichert</div>
      <div style={styles.subheading}>So sehen andere dich (Vorschau).</div>

      <div style={{ ...styles.card, maxWidth: `${cardWidth}px` }}>
        <div style={styles.avatar}>{getInitials(profile.name)}</div>
        <div style={styles.name}>{profile.name}</div>
        {subtitle && <div style={styles.subtitle}>{subtitle}</div>}

        {(tags?.length > 0 || badge) && (
          <div style={styles.chips}>
            {badge && <span style={styles.chip}>{badge}</span>}
            {(tags || []).map((tag) => <span key={tag} style={styles.chip}>{tag}</span>)}
          </div>
        )}

        {profile.bio && <p style={styles.bio}>{profile.bio}</p>}

        <div style={styles.metaGrid}>
          {isApplicant ? (
            <>
              {profile.location && (
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Standort</span>
                  <span style={styles.metaValue}>{profile.location}</span>
                </div>
              )}
              {profile.remotePreference && (
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Remote</span>
                  <span style={styles.metaValue}>{profile.remotePreference}</span>
                </div>
              )}
              {profile.salaryExpectation && (
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Gehaltsvorstellung</span>
                  <span style={styles.metaValue}>{profile.salaryExpectation} €</span>
                </div>
              )}
              {profile.availability && (
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Verfügbarkeit</span>
                  <span style={styles.metaValue}>{profile.availability}</span>
                </div>
              )}
            </>
          ) : (
            <>
              {profile.industry && (
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Branche</span>
                  <span style={styles.metaValue}>{profile.industry}</span>
                </div>
              )}
              {profile.locations?.length > 0 && (
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Standorte</span>
                  <span style={styles.metaValue}>{profile.locations.join(', ')}</span>
                </div>
              )}
              {(profile.salaryMin || profile.salaryMax) && (
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Gehaltsspanne</span>
                  <span style={styles.metaValue}>{profile.salaryMin || '?'}–{profile.salaryMax || '?'} €</span>
                </div>
              )}
              {profile.remoteOptions?.length > 0 && (
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Remote-Optionen</span>
                  <span style={styles.metaValue}>{profile.remoteOptions.join(', ')}</span>
                </div>
              )}
            </>
          )}
        </div>

        {isApplicant && (profile.githubUrl || profile.linkedinUrl || profile.portfolioUrl || profile.resumeUrl) && (
          <div style={styles.links}>
            {profile.githubUrl && <a style={styles.link} href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
            {profile.linkedinUrl && <a style={styles.link} href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
            {profile.portfolioUrl && <a style={styles.link} href={profile.portfolioUrl} target="_blank" rel="noreferrer">Portfolio</a>}
            {profile.resumeUrl && <a style={styles.link} href={profile.resumeUrl} target="_blank" rel="noreferrer">Lebenslauf</a>}
          </div>
        )}
      </div>

      <div style={{ ...styles.actions, maxWidth: `${cardWidth}px` }}>
        <button style={styles.editBtn} onClick={onEdit}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-surface-subtle)')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-surface)')}>
          Bearbeiten
        </button>
        <button style={styles.continueBtn} onClick={onContinue}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-accent-hover)')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent)')}>
          Weiter →
        </button>
      </div>
    </div>
  )
}