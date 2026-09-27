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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api'
)
  .trim()
  .replace(/\/+$/, '')
  .replace(/\.+$/, '')

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

export async function askLegalResearch(question: string, attachment?: File) {
  const headers: Record<string, string> = {}
  const token = getStoredToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let body: BodyInit
  if (attachment) {
    const form = new FormData()
    form.append('question', question)
    form.append('attachment', attachment)
    body = form
  } else {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify({ question })
  }

  const res = await fetch(`${API_BASE_URL}/ai/research`, {
    method: 'POST',
    headers,
    body,
  })

  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data?.content) {
    throw new Error(parseErrorMessage(data, 'Unable to complete legal research'))
  }

  return data.data as {
    content: string
    citations?: { title: string; citation: string; href: string }[]
    webSearchUsed?: boolean
    webSources?: { title: string; url: string }[]
  }
}

export async function loginWithGoogle(credential: string) {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })

  const data = (await parseJsonSafe(res)) as AuthResponse | null
  if (!res.ok || !data?.token || !data.user) {
    throw new Error(parseErrorMessage(data, 'Google sign-in failed'))
  }

  setSession(data.token, data.user)
  return data
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
  return uploadDocuments([payload])
}

export async function uploadDocuments(items: Array<{
  title: string
  description?: string
  category: string
  file: File
}>) {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Please log in as an admin first.')
  }

  const formData = new FormData()
  formData.append('items', JSON.stringify(items.map((item) => ({
    title: item.title,
    description: item.description || item.title,
    category: item.category,
  }))))
  items.forEach((item) => formData.append('files', item.file))

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
  try {
    const res = await fetch(`${API_BASE_URL}/plans`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    const data = await parseJsonSafe(res)
    if (!res.ok || !data?.data) {
      throw new Error(parseErrorMessage(data, 'Unable to fetch plans'))
    }

    return data.data
  } catch (error) {
    console.warn('[lexliberia] fetchPlans network error, let caller fall back:', error instanceof Error ? error.message : error)
    throw error
  }
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

export interface PayInstructions {
  name: string
  phone: string
  network: string
}

export interface PaymentProof {
  _id: string
  status: 'pending' | 'approved' | 'rejected'
  amount: number
  billingCycle: 'monthly' | 'annual'
  approvedBillingCycle?: 'monthly' | 'annual' | null
  reviewNote: string
  createdAt: string
  updatedAt: string
  reviewedAt?: string | null
  user?: { _id: string; name: string; email: string }
  plan?: { _id: string; name: string; priceMonthly?: number; priceAnnual?: number }
  approvedPlan?: { _id: string; name: string } | null
}

export async function fetchPayInstructions() {
  const res = await fetch(`${API_BASE_URL}/payments/instructions`, { cache: 'no-store' })
  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to load payment details'))
  }
  return data.data as PayInstructions
}

export async function fetchMyPaymentProof() {
  const token = getStoredToken()
  if (!token) return null
  const res = await fetch(`${API_BASE_URL}/payments/proof/mine`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })
  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to load your payment'))
  }
  return (data?.data || null) as PaymentProof | null
}

export async function submitPaymentProof(payload: {
  planId: string
  billingCycle: 'monthly' | 'annual'
  screenshot: File
}) {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Please log in before you subscribe.')
  }

  const body = new FormData()
  body.append('planId', payload.planId)
  body.append('billingCycle', payload.billingCycle)
  body.append('screenshot', payload.screenshot)

  const res = await fetch(`${API_BASE_URL}/payments/proof`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to send the screenshot'))
  }
  return data.data as PaymentProof
}

export async function fetchPendingProofCount() {
  const res = await fetch(`${API_BASE_URL}/admin/payment-proofs/count`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })
  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to check pending payments'))
  }
  return Number(data.data.count || 0)
}

export async function fetchPaymentProofs(status: 'pending' | 'approved' | 'rejected' = 'pending') {
  const res = await fetch(`${API_BASE_URL}/admin/payment-proofs?status=${status}`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })
  const data = await parseJsonSafe(res)
  if (!res.ok || !data?.data) {
    throw new Error(parseErrorMessage(data, 'Unable to load payment screenshots'))
  }
  return data.data as PaymentProof[]
}

export async function fetchPaymentProofImage(proofId: string) {
  const res = await fetch(`${API_BASE_URL}/admin/payment-proofs/${proofId}/screenshot`, {
    headers: { Authorization: `Bearer ${getStoredToken()}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Unable to load the screenshot')
  }
  return URL.createObjectURL(await res.blob())
}

export async function approvePaymentProof(proofId: string, payload: {
  planId: string
  billingCycle: 'monthly' | 'annual'
}) {
  const res = await fetch(`${API_BASE_URL}/admin/payment-proofs/${proofId}/approve`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  })
  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to confirm this payment'))
  }
  return data
}

export async function rejectPaymentProof(proofId: string) {
  const res = await fetch(`${API_BASE_URL}/admin/payment-proofs/${proofId}/reject`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({}),
  })
  const data = await parseJsonSafe(res)
  if (!res.ok) {
    throw new Error(parseErrorMessage(data, 'Unable to reject this payment'))
  }
  return data
}

export type AdminPushStatus = 'ready' | 'needs-permission' | 'blocked' | 'unsupported' | 'server-missing'

export async function syncAdminPush(requestPermission: boolean): Promise<AdminPushStatus> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'unsupported'
  }

  let permission = Notification.permission
  if (permission === 'default' && requestPermission) {
    permission = await Notification.requestPermission()
  }
  if (permission === 'denied') return 'blocked'
  if (permission !== 'granted') return 'needs-permission'

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  const keyRes = await fetch(`${API_BASE_URL}/admin/push/public-key`, {
    headers: authHeaders(true),
    cache: 'no-store',
  })
  const keyData = await parseJsonSafe(keyRes)
  const publicKey = keyData?.data?.publicKey
  if (!keyRes.ok || !publicKey) return 'server-missing'

  const existing = await registration.pushManager.getSubscription()
  if (existing) await existing.unsubscribe()

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })

  const res = await fetch(`${API_BASE_URL}/admin/push/subscribe`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  })
  if (!res.ok) {
    const data = await parseJsonSafe(res)
    throw new Error(parseErrorMessage(data, 'Unable to save phone alerts'))
  }
  return 'ready'
}

export async function enableAdminPush() {
  const status = await syncAdminPush(true)
  if (status === 'unsupported') {
    throw new Error('This phone cannot receive app alerts. Open LexLiberia from the installed icon.')
  }
  if (status === 'blocked') {
    throw new Error('Notifications are blocked. In the phone settings, allow notifications for LexLiberia, then open the app again.')
  }
  if (status === 'needs-permission') {
    throw new Error('Tap Allow when the phone asks for notifications.')
  }
  return status === 'ready'
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
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
  try {
    const res = await fetch(`${API_BASE_URL}/notices/public`, {
      cache: 'no-store',
    })

    const data = await parseJsonSafe(res)
    if (!res.ok || !data?.data) {
      return [] as PublicNotice[]
    }

    return data.data as PublicNotice[]
  } catch {
    return [] as PublicNotice[]
  }
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
