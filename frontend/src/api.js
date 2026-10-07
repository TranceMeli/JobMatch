import axios from 'axios'

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5254'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let accessToken = null

async function refreshAccessToken() {
  try {
    const response = await api.post('/api/auth/refresh')
    accessToken = response.data.accessToken
    return accessToken
  } catch {
    accessToken = null
    return null
  }
}

async function request(path, options = {}, allowRetry = true) {
  try {
    const response = await api.request({
      url: path,
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    return response.data
  } catch (err) {
    if (err.response?.status === 401 && allowRetry) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        return request(path, options, false)
      }
    }

    const data = err.response?.data
    let message = 'Anfrage fehlgeschlagen'

    if (typeof data === 'string') {
      message = data
    } else if (data?.error) {
      message = data.error
    } else if (data?.title) {
      message = data.title
    }

    throw new Error(message)
  }
}

export function register({ firstName, lastName, email, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    data: { firstName, lastName, email, password },
  })
}

export async function login({ email, password }) {
  const result = await request('/api/auth/login', {
    method: 'POST',
    data: { email, password },
  })

  accessToken = result.accessToken
  return result
}

export async function logout() {
  try {
    await request('/api/auth/revoke', { method: 'POST' })
  } finally {
    accessToken = null
  }
}

export async function tryRestoreSession() {
  const refreshed = await refreshAccessToken()

  if (!refreshed) {
    return null
  }

  try {
    return await getMe()
  } catch {
    return null
  }
}

export function getMe() {
  return request('/api/auth/me')
}

export function saveProfile(profile) {
  return request('/api/profile', {
    method: 'POST',
    data: profile,
  })
}

export function loadProfile() {
  return request('/api/profile')
}

export function getJobTypes() {
  return request('/api/questionnaires/job-types')
}

export function getQuestionnaire(jobType) {
  return request(`/api/questionnaires/${encodeURIComponent(jobType)}`)
}

export function getQuestionnaireAnswers(jobType) {
  return request(`/api/questionnaires/${encodeURIComponent(jobType)}/answers`)
}

export function getMyQuestionnaires() {
  return request('/api/questionnaires/mine')
}

export function saveQuestionnaire(jobType, answers) {
  return request(`/api/questionnaires/${encodeURIComponent(jobType)}`, {
    method: 'POST',
    data: { answers },
  })
}

export function getMatchingCandidates(jobType) {
  return request(`/api/matching/candidates?jobType=${encodeURIComponent(jobType)}`)
}

export function setInterest(targetUserId, jobType, positive) {
  return request('/api/matching/interest', {
    method: 'POST',
    data: { targetUserId, jobType, positive },
  })
}

export function getMatches() {
  return request('/api/matching/matches')
}
