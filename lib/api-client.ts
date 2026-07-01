export interface UserPlan {
  _id: string
  name: string
  description?: string
  dailyViewLimit?: number
  priceMonthly?: number
}

export interface UserAccess {
  isAdmin: boolean
  hasPaidPlan: boolean
  canViewPremiumDocuments: boolean
  canUseAiResearch: boolean
}

export interface SessionUser {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  plan?: UserPlan | null
  access?: UserAccess
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
  filePath?: string
  fileType: string
  fileSize: number
  views: number
  createdAt: string
  locked?: boolean
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:5000/api'

const TOKEN_KEY = 'lexliberia_token'
const USER_KEY = 'lexliberia_user'

function isBrowser() {
  return typeof window !== 'undefined'
}

function authHeaders(includeJson = false) {
  const token = getStoredToken()
  const headers: Record<string, string> = {}
  if (includeJson) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
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
    const isLocalhost =
      API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')

    if (isLocalhost) {
      return `${fallback} The site is calling localhost instead of your live API. Set NEXT_PUBLIC_API_BASE_URL on Vercel to your Render URL (e.g. https://your-app.onrender.com/api) and redeploy.`
    }

    return `${fallback} Cannot reach the API at ${API_BASE_URL}. Check that Render is running and CLIENT_URL on Render matches your Vercel URL exactly.`
  }

  if (error instanceof Error && error.message === 'Failed to fetch') {
    return `${fallback} Cannot reach the API at ${API_BASE_URL}. Check Vercel env vars and Render CORS settings.`
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
    if (error instanceof Error && !['Unable to log in', 'Failed to fetch'].includes(error.message)) {
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
    if (error instanceof Error && !['Unable to create account', 'Failed to fetch'].includes(error.message)) {
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
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to fetch plans'))
  }

  return data.data
}

export async function getMe() {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.user) {
    throw new Error(parseErrorMessage(data, 'Unable to load account'))
  }

  setSession(token, data.user)
  return data.user as SessionUser
}

export async function fetchDocuments(limit = 50) {
  const res = await fetch(`${API_BASE_URL}/documents?limit=${limit}`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to fetch documents'))
  }

  return data.data as UploadedDocument[]
}

export async function fetchDocument(documentId: string) {
  const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to fetch document'))
  }

  return data.data as UploadedDocument
}

export async function downloadDocumentFile(documentId: string, filename: string) {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Please log in to download this document.')
  }

  const res = await fetch(`${API_BASE_URL}/documents/download/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await parseJsonSafe(res)
    throw new Error(parseErrorMessage(data, 'Unable to download document'))
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

export async function redeemCoupon(code: string) {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Please log in to redeem a coupon.')
  }

  const res = await fetch(`${API_BASE_URL}/coupons/redeem`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ code }),
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.user) {
    throw new Error(parseErrorMessage(data, 'Unable to redeem coupon'))
  }

  setSession(token, data.user)
  return data
}

export async function getAccessProfile() {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE_URL}/coupons/access`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to load access profile'))
  }

  if (data.data.user) {
    setSession(token, data.data.user)
  }

  return data.data as {
    user: SessionUser
    access: UserAccess
  }
}

export interface AdminCoupon {
  _id: string
  code: string
  description: string
  maxUses: number
  usedCount: number
  expiresAt?: string | null
  isActive: boolean
  plan?: { _id: string; name: string; priceMonthly?: number }
}

export async function fetchAdminCoupons() {
  const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to fetch coupons'))
  }

  return data.data as AdminCoupon[]
}

export async function createCoupon(payload: {
  code: string
  description?: string
  planId: string
  maxUses?: number
  expiresAt?: string
}) {
  const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to create coupon'))
  }

  return data.data as AdminCoupon
}

export async function deactivateCoupon(couponId: string) {
  const res = await fetch(`${API_BASE_URL}/admin/coupons/${couponId}`, {
    method: 'DELETE',
    headers: authHeaders(true),
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to deactivate coupon'))
  }

  return data
}

export async function deleteDocument(documentId: string) {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Please log in as an admin first.')
  }

  const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to delete document'))
  }

  return data
}

export async function fetchAdminStats() {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Please log in as an admin first.')
  }

  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to fetch admin stats'))
  }

  return data.data as { documents: number; users: number; plans: number }
}

export async function fetchAdminUsers() {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Please log in as an admin first.')
  }

  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to fetch users'))
  }

  return data.data as Array<{
    _id: string
    name: string
    email: string
    role: string
    plan?: { name: string } | null
    createdAt: string
  }>
}
