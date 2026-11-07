import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LegalPage from './pages/LegalPage'
import AuthForm from './pages/AuthForm'
import ProfileForm from './pages/ProfileForm'
import ProfileCard from './pages/ProfileCard'
import SwipeScreen from './pages/SwipeScreen'
import Matches from './pages/Matches'
import JobTypeSelect from './pages/JobTypeSelect'
import QuestionnairePage from './pages/QuestionnairePage'
import QuestionnaireOverview from './pages/QuestionnaireOverview'
import {
  tryRestoreSession,
  saveProfile,
  loadProfile,
  logout as apiLogout,
  getMyQuestionnaires,
  setInterest,
  getMatches,
} from './api'

function normalizeUser(raw) {
  if (!raw) return null
  return { ...raw, role: raw.roles?.[0] ?? raw.role ?? null }
}

export default function App() {
  const [view, setView] = useState('auth')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [jobType, setJobType] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(null)
  const [returnView, setReturnView] = useState('auth')

  async function loadUserData() {
    const saved = await loadProfile()
    setProfile(saved)

    const questionnaires = await getMyQuestionnaires()

    if (questionnaires?.length > 0) {
      setJobType(questionnaires[0].jobType)
      setView('swipe')
    } else {
      setView('questionnaire-select')
    }

    try {
      const savedMatches = await getMatches()
      setMatches(savedMatches || [])
    } catch {
      setMatches([])
    }
  }

  useEffect(() => {
    async function restoreSession() {
      try {
        const me = await tryRestoreSession()

        if (!me) {
          setView('auth')
          return
        }

        setUser(normalizeUser(me))

        try {
          await loadUserData()
        } catch {
          setView('profile-form')
        }
      } catch {
        setUser(null)
        setProfile(null)
        setJobType(null)
        setView('auth')
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  async function onAuthenticated(authedUser) {
    setUser(normalizeUser(authedUser))

    try {
      await loadUserData()
    } catch {
      setView('profile-form')
    }
  }

  async function onSubmitProfile(formData) {
    setSaveError(null)

    try {
      const saved = await saveProfile(formData)
      setProfile(saved)
      setView('profile-card')
    } catch {
      setSaveError('Profil konnte nicht gespeichert werden.')
      setProfile(formData)
      setView('profile-card')
    }
  }

  // Gibt das Ergebnis zurück, damit die Swipe-Ansicht ein Match direkt anzeigen kann
  async function onInterest(targetUserId, positive) {
    if (!jobType) return null

    try {
      const result = await setInterest(targetUserId, jobType, positive)

      if (result.matched) {
        const savedMatches = await getMatches()
        setMatches(savedMatches || [])
      }

      return result
    } catch (err) {
      setSaveError(err.message || 'Deine Bewertung konnte nicht gespeichert werden. Versuche es erneut.')
      return null
    }
  }

  async function onLogout() {
    try {
      await apiLogout()
    } finally {
      setUser(null)
      setProfile(null)
      setJobType(null)
      setMatches([])
      setView('auth')
    }
  }

  if (loading) {
    return (
      <div aria-busy="true" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>
        JobMatch wird geladen …
      </div>
    )
  }

  // Rechtsseiten sind auch ohne Login erreichbar
  const showNav = Boolean(user) && view !== 'auth'

  function showLegal(page) {
    if (!view.startsWith('legal-')) setReturnView(view)
    setView(`legal-${page}`)
  }

  return (
    <>
      {showNav && (
        <Navbar
          view={view}
          setView={setView}
          matchCount={matches.length}
          userName={profile?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ')}
          onLogout={onLogout}
          onHome={() => setView(jobType ? 'swipe' : 'questionnaire-select')}
          onQuestions={() => setView(jobType ? 'questionnaire-overview' : 'questionnaire-select')}
        />
      )}

      {view === 'auth' && <AuthForm onAuthenticated={onAuthenticated} />}

      {view.startsWith('legal-') && (
        <LegalPage
          page={view.slice('legal-'.length)}
          onBack={() => setView(user ? returnView : 'auth')}
        />
      )}

      {view === 'profile-form' && (
        <ProfileForm
          role={user?.role}
          onSubmit={onSubmitProfile}
          initialValues={profile}
        />
      )}

      {view === 'profile-card' && (
        <ProfileCard
          role={user?.role}
          profile={profile}
          onContinue={() => setView(jobType ? 'swipe' : 'questionnaire-select')}
          onEdit={() => setView('profile-form')}
        />
      )}

      {view === 'questionnaire-select' && (
        <JobTypeSelect
          role={user?.role}
          onContinue={(selectedJobType) => {
            setJobType(selectedJobType)
            setView('questionnaire')
          }}
        />
      )}

      {view === 'questionnaire' && jobType && (
        <QuestionnairePage
          role={user?.role}
          jobType={jobType}
          onSaved={async (savedJobType) => {
            setJobType(savedJobType)

            try {
              const savedMatches = await getMatches()
              setMatches(savedMatches || [])
            } catch {
              setMatches([])
            }

            setView('swipe')
          }}
        />
      )}

      {view === 'questionnaire-overview' && jobType && (
        <QuestionnaireOverview
          role={user?.role}
          jobType={jobType}
          onEdit={() => setView('questionnaire')}
          onBack={() => setView('swipe')}
        />
      )}

      {view === 'swipe' && jobType && (
        <SwipeScreen
          role={user?.role}
          jobType={jobType}
          onInterest={onInterest}
          onShowMatches={() => setView('matches')}
        />
      )}

      {view === 'matches' && <Matches refreshKey={matches.length} />}

      <Footer onShowLegal={showLegal} />

      {saveError && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            padding: '8px 8px 8px 16px',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--text-sm)',
            border: '1px solid var(--color-danger)',
            maxWidth: '90%',
            zIndex: 30,
          }}
        >
          {saveError}
          <button
            type="button"
            onClick={() => setSaveError(null)}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              padding: '6px 8px',
            }}
          >
            Schließen
          </button>
        </div>
      )}
    </>
  )
}