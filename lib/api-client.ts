export interface SessionUser {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  plan?: string | null
}

interface AuthResponse {
  success: boolean
  token: string
  user: SessionUser
  message?: string
}

export interface UploadedDocument {
  _id: string
  title: string
  description: string
  category: string
  filePath: string
  fileType: string
  fileSize: number
  views: number
  createdAt: string
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:5000/api'

const TOKEN_KEY = 'lexliberia_token'
const USER_KEY = 'lexliberia_user'

function isBrowser() {
  return typeof window !== 'undefined'
}

function parseErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string'
  ) {
    return payload.message
  }

  return fallback
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

function toFriendlyNetworkError(error: unknown, fallback: string) {
  if (error instanceof TypeError) {
    return `${fallback} The backend server is not reachable at ${API_BASE_URL}.`
  }

  return fallback
}

export function getStoredToken() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): SessionUser | null {
  if (!isBrowser()) return null

  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

export function setSession(token: string, user: SessionUser) {
  if (!isBrowser()) return
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  if (!isBrowser()) return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export async function login(payload: { email: string; password: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = (await parseJsonSafe(res)) as AuthResponse | null
    if (!res.ok || !data?.token || !data.user) {
      throw new Error(parseErrorMessage(data, 'Unable to log in'))
    }

    setSession(data.token, data.user)
    return data
  } catch (error) {
    if (error instanceof Error && error.message !== 'Unable to log in') {
      throw error
    }
    throw new Error(toFriendlyNetworkError(error, 'Unable to log in.'))
  }
}

export async function register(payload: {
  name: string
  email: string
  password: string
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = (await parseJsonSafe(res)) as AuthResponse | null
    if (!res.ok || !data?.token || !data.user) {
      throw new Error(parseErrorMessage(data, 'Unable to create account'))
    }

    setSession(data.token, data.user)
    return data
  } catch (error) {
    if (error instanceof Error && error.message !== 'Unable to create account') {
      throw error
    }
    throw new Error(
      toFriendlyNetworkError(error, 'Unable to create account.'),
    )
  }
}

export async function uploadDocument(payload: {
  title: string
  description: string
  category: string
  file: File
}) {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Please log in as an admin first.')
  }

  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('description', payload.description)
  formData.append('category', payload.category)
  formData.append('file', payload.file)

  try {
    const res = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await parseJsonSafe(res)
    if (!res.ok) {
      throw new Error(parseErrorMessage(data, 'Unable to upload document'))
    }

    return data
  } catch (error) {
    if (
      error instanceof Error &&
      error.message !== 'Unable to upload document'
    ) {
      throw error
    }
    throw new Error(
      toFriendlyNetworkError(error, 'Unable to upload document.'),
    )
  }
}

export async function fetchPlans() {
  const res = await fetch(`${API_BASE_URL}/plans`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 },
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to fetch plans'))
  }

  return data.data
}
