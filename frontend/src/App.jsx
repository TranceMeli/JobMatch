import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import AuthForm from './pages/AuthForm'
import ProfileForm from './pages/ProfileForm'
import ProfileCard from './pages/ProfileCard'
import SwipeScreen from './pages/SwipeScreen'
import Matches from './pages/Matches'
import { tryRestoreSession, saveProfile, loadProfile, logout as apiLogout } from './api'

function normalizeUser(raw) {
  if (!raw) return null
  return { ...raw, role: raw.roles?.[0] ?? raw.role ?? null }
}

export default function App() {
  const [view, setView] = useState('auth')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [liked, setLiked] = useState([])
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState(null)

  // Beim Start: Access-Token lebt nur im Speicher, ist nach einem Reload also weg.
  // tryRestoreSession() nutzt das HttpOnly-Refresh-Cookie, um ein neues zu holen.
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
          const saved = await loadProfile()
          if (saved) {
            setProfile(saved)
            setView('swipe')
          } else {
            setView('profile-form')
          }
        } catch {
          setView('profile-form')
        }
      } catch {
        setUser(null)
        setProfile(null)
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
      const saved = await loadProfile()
      if (saved) {
        setProfile(saved)
        setView('swipe')
      } else {
        setView('profile-form')
      }
    } catch {
      setView('profile-form')
    }
  }

  async function onSubmitProfile(formData) {
    setSaveError(null)
    try {
      const saved = await saveProfile(formData)
      setProfile(saved)
    } catch (err) {
      console.error('Profil konnte nicht gespeichert werden:', err)
      setSaveError('Profil konnte nicht gespeichert werden.')
      setProfile(formData)
    }
    setView('profile-card')
  }

  async function onLogout() {
    try {
      await apiLogout()
    } catch (err) {
      console.error('Logout-Request fehlgeschlagen:', err)
    } finally {
      setUser(null)
      setProfile(null)
      setLiked([])
      setView('auth')
    }
  }

  const showNav = view !== 'auth'

  if (loading) return null

  return (
    <>
      {showNav && (
        <Navbar
          view={view}
          setView={setView}
          likedCount={liked.length}
          onReset={onLogout}
        />
      )}

      {view === 'auth' && (
        <AuthForm onAuthenticated={onAuthenticated} />
      )}

      {view === 'profile-form' && (
        <ProfileForm role={user?.role} onSubmit={onSubmitProfile} initialValues={profile} />
      )}

      {view === 'profile-card' && (
        <ProfileCard
          role={user?.role}
          profile={profile}
          onContinue={() => setView('swipe')}
          onEdit={() => setView('profile-form')}
        />
      )}

      {view === 'swipe' && (
        <SwipeScreen
          role={user?.role}
          profile={profile}
          onLike={(id) => setLiked((prev) => [...prev, id])}
          liked={liked}
        />
      )}

      {view === 'matches' && (
        <Matches role={user?.role} liked={liked} />
      )}

      {saveError && (
        <div style={{
          position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-danger-bg)', color: 'var(--color-danger)',
          padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: '13px',
          border: '1px solid var(--color-danger)', maxWidth: '90%', textAlign: 'center',
        }}>
          {saveError}
        </div>
      )}
    </>
  )
}