import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
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
  const [matchNotice, setMatchNotice] = useState(null)

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

  async function onInterest(targetUserId, positive) {
    if (!jobType) return

    try {
      const result = await setInterest(targetUserId, jobType, positive)

      if (result.matched) {
        setMatchNotice({
          score: result.matchScore,
          reasons: result.matchReasons || [],
        })
        const savedMatches = await getMatches()
        setMatches(savedMatches || [])
      }
    } catch (err) {
      setSaveError(err.message || 'Interesse konnte nicht gespeichert werden.')
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
      setMatchNotice(null)
      setView('auth')
    }
  }

  if (loading) return null

  const showNav = view !== 'auth'

  return (
    <>
      {showNav && (
        <Navbar
          view={view}
          setView={setView}
          likedCount={matches.length}
          onReset={onLogout}
          onHome={() => setView(jobType ? 'swipe' : 'questionnaire-select')}
          onQuestions={() => setView(jobType ? 'questionnaire-overview' : 'questionnaire-select')}
        />
      )}

      {view === 'auth' && <AuthForm onAuthenticated={onAuthenticated} />}

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
          profile={profile}
          jobType={jobType}
          onInterest={onInterest}
        />
      )}

      {view === 'matches' && <Matches refreshKey={matches.length} />}

      {saveError && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          padding: '8px 16px',
          borderRadius: 'var(--radius)',
          fontSize: '13px',
          border: '1px solid var(--color-danger)',
          maxWidth: '90%',
          textAlign: 'center',
          zIndex: 30,
        }}>
          {saveError}
        </div>
      )}

      {matchNotice && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: saveError ? '64px' : '16px',
            transform: 'translateX(-50%)',
            width: 'min(460px, 90%)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-card)',
            background: 'var(--color-highlight)',
            color: 'var(--color-highlight-text)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            zIndex: 29,
          }}
        >
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>
            🎉 Ihr habt ein Match!
          </div>
          <div style={{ fontSize: '13px' }}>
            {matchNotice.score != null ? `${matchNotice.score} % Match` : 'Beide Seiten haben Interesse.'}
          </div>
          {matchNotice.reasons?.length > 0 && (
            <div style={{ marginTop: '6px', fontSize: '12px', lineHeight: '1.5' }}>
              {matchNotice.reasons.join(' · ')}
            </div>
          )}
          <button
            type="button"
            onClick={() => setMatchNotice(null)}
            style={{
              marginTop: '10px',
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              fontWeight: '600',
              color: 'inherit',
              padding: 0,
            }}
          >
            Schließen
          </button>
        </div>
      )}
    </>
  )
}