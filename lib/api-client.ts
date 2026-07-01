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
  isPlanExpired?: boolean
  canViewPremiumDocuments: boolean
  canUseAiResearch: boolean
}

export interface SessionUser {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  plan?: UserPlan | null
  planExpiresAt?: string | null
  isActive?: boolean
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
  canPreview?: boolean
  fileAvailable?: boolean
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
  if (data?.data) {
    return data.data as UploadedDocument
  }

  throw new Error(parseErrorMessage(data, 'Unable to fetch document'))
}

export function getDocumentFilename(title: string, fileType: string) {
  const safeTitle = title.trim().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-') || 'document'
  if (fileType.includes('pdf')) return `${safeTitle}.pdf`
  if (fileType.includes('word') || fileType.includes('doc')) return `${safeTitle}.docx`
  return safeTitle
}

export function isPdfDocument(fileType: string) {
  return fileType.toLowerCase().includes('pdf')
}

async function fetchDocumentFileResponse(documentId: string, inline = false) {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Please log in to access this document.')
  }

  const query = inline ? '?inline=1' : ''
  const res = await fetch(`${API_BASE_URL}/documents/download/${documentId}${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await parseJsonSafe(res)
      throw new Error(parseErrorMessage(data, 'Unable to access document'))
    }

    throw new Error(`Unable to access document (${res.status})`)
  }

  return res
}

export async function fetchDocumentFileBlob(documentId: string) {
  const res = await fetchDocumentFileResponse(documentId, true)
  return res.blob()
}

export async function downloadDocumentFile(
  documentId: string,
  filename: string,
  fileType?: string,
) {
  const res = await fetchDocumentFileResponse(documentId, false)
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || getDocumentFilename('document', fileType || blob.type)
  link.click()
  window.URL.revokeObjectURL(url)
}

export async function openDocumentFile(documentId: string) {
  const blob = await fetchDocumentFileBlob(documentId)
  const url = window.URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
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
    plan?: { name: string; priceMonthly?: number } | null
    planExpiresAt?: string | null
    isActive: boolean
    createdAt: string
    latestPayment?: {
      amount: number
      billingCycle: string
      paymentMethod: string
      status: string
      startDate: string
      endDate: string
      planName?: string
    } | null
  }>
}

export async function disableAdminUser(userId: string) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/disable`, {
    method: 'PATCH',
    headers: authHeaders(true),
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to disable user'))
  }

  return data
}

export async function enableAdminUser(userId: string) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/enable`, {
    method: 'PATCH',
    headers: authHeaders(true),
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to enable user'))
  }

  return data
}

export async function deleteAdminUser(userId: string) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(true),
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to delete user'))
  }

  return data
}

export async function sendAdminMessage(payload: {
  userId: string
  subject: string
  body: string
}) {
  const res = await fetch(`${API_BASE_URL}/admin/messages`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to send message'))
  }

  return data
}

export interface PublicNotice {
  _id: string
  title: string
  content: string
  createdAt: string
}

export interface AdminNotice extends PublicNotice {
  type: 'public' | 'email' | 'both'
  isPublished: boolean
  emailResults?: Array<{ email: string; sent: boolean; reason?: string }>
}

export async function fetchPublicNotices() {
  const res = await fetch(`${API_BASE_URL}/notices/public`, {
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    return [] as PublicNotice[]
  }

  return data.data as PublicNotice[]
}

export async function fetchAdminNotices() {
  const res = await fetch(`${API_BASE_URL}/admin/notices`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to fetch notices'))
  }

  return data.data as AdminNotice[]
}

export async function createAdminNotice(payload: {
  title: string
  content: string
  type: 'public' | 'email' | 'both'
}) {
  const res = await fetch(`${API_BASE_URL}/admin/notices`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to create notice'))
  }

  return data
}

export interface UserMessage {
  _id: string
  subject: string
  body: string
  readAt?: string | null
  createdAt: string
  sender?: { name: string; email: string; role: string }
}

export async function fetchMyMessages() {
  const res = await fetch(`${API_BASE_URL}/messages`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to fetch messages'))
  }

  return data.data as UserMessage[]
}

export async function markMessageRead(messageId: string) {
  const res = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
    method: 'PATCH',
    headers: authHeaders(true),
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to mark message as read'))
  }

  return data
}
