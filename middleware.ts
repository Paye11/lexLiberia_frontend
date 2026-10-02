import { NextResponse, NextRequest } from 'next/server'

const ADMIN_PREFIX = '/admin'
const ADMIN_LOGIN = '/admin/login'
const PUBLIC_PAGE_LOGIN = '/login'

const _RAW_URL =
  process.env.NEXT_PUBLIC_REMOTE_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:5000/api'
const API_BASE_URL = (() => {
  const trimmed = _RAW_URL.trim().replace(/\/+$/, '').replace(/\.+$/, '')
  if (trimmed.startsWith('/')) {
    return 'http://localhost:5000/api'
  }
  return trimmed
})()

const TOKEN_KEY = 'lexliberia_token'
const USER_KEY = 'lexliberia_user'

function base64UrlDecode(input: string): string | null {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf-8')
    }
    return atob(padded)
  } catch {
    return null
  }
}

function readRoleFromUserCookie(raw: string | undefined): string | null {
  if (!raw) return null
  try {
    const decoded = decodeURIComponent(raw)
    const parsed = JSON.parse(decoded) as unknown
    if (parsed && typeof parsed === 'object' && 'role' in parsed) {
      const r = (parsed as { role?: unknown }).role
      return typeof r === 'string' ? r : null
    }
    return null
  } catch {
    return null
  }
}

function jwtLooksWellFormed(token: string | null): boolean {
  if (!token || !token.includes('.')) return false
  const [headerB64, payloadB64] = token.split('.')
  if (!headerB64 || !payloadB64) return false
  const headerStr = base64UrlDecode(headerB64)
  const payloadStr = base64UrlDecode(payloadB64)
  if (!headerStr || !payloadStr) return false
  try {
    const header = JSON.parse(headerStr)
    const payload = JSON.parse(payloadStr)
    return (
      header &&
      typeof header === 'object' &&
      (header.alg === 'HS256' ||
        header.alg === 'HS384' ||
        header.alg === 'HS512' ||
        header.alg === 'RS256') &&
      payload &&
      typeof payload === 'object' &&
      ('id' in payload || 'sub' in payload)
    )
  } catch {
    return false
  }
}

async function backendConfirmsAdmin(token: string): Promise<'admin' | 'not-admin' | 'backend-unreachable'> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    if (res.status === 401 || res.status === 403) return 'not-admin'
    if (!res.ok) return 'backend-unreachable'
    const json = (await res.json()) as unknown
    if (
      json &&
      typeof json === 'object' &&
      'success' in json &&
      json.success === true &&
      'user' in json
    ) {
      const user = (json as { user?: { role?: unknown } }).user
      if (user && typeof user === 'object' && user.role === 'admin') {
        return 'admin'
      }
      return 'not-admin'
    }
    return 'not-admin'
  } catch (error) {
    console.warn(
      `[middleware] backend /auth/me unreachable (${API_BASE_URL}/auth/me); deferring to client-side admin gate.`,
      error instanceof Error ? error.message : error,
    )
    return 'backend-unreachable'
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX)
  const isAdminLogin = pathname === ADMIN_LOGIN || pathname.startsWith(`${ADMIN_LOGIN}/`)
  if (!isAdminRoute || isAdminLogin) {
    return NextResponse.next()
  }

  const tokenCookie = request.cookies.get(TOKEN_KEY)?.value ?? null
  const userCookie = request.cookies.get(USER_KEY)?.value
  const roleFromCookie = readRoleFromUserCookie(userCookie)

  if (!tokenCookie) {
    const redirect = new URL(ADMIN_LOGIN, request.nextUrl.origin)
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  if (!jwtLooksWellFormed(tokenCookie)) {
    const redirect = new URL(ADMIN_LOGIN, request.nextUrl.origin)
    redirect.searchParams.set('next', pathname)
    const res = NextResponse.redirect(redirect)
    res.cookies.delete(TOKEN_KEY)
    res.cookies.delete(USER_KEY)
    return res
  }

  if (roleFromCookie && roleFromCookie !== 'admin') {
    const redirect = new URL(PUBLIC_PAGE_LOGIN, request.nextUrl.origin)
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  const verdict = await backendConfirmsAdmin(tokenCookie)

  if (verdict === 'not-admin') {
    const redirect = new URL(PUBLIC_PAGE_LOGIN, request.nextUrl.origin)
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  if (verdict === 'admin') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
