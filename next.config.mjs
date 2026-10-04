import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(fileURLToPath(import.meta.url))

const _RAW_REMOTE =
  process.env.NEXT_PUBLIC_REMOTE_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api'

const REMOTE_API_BASE = (() => {
  const trimmed = _RAW_REMOTE.trim().replace(/\/+$/, '').replace(/\.+$/, '')
  if (!trimmed) return 'http://localhost:5000/api'
  if (trimmed.startsWith('/')) return 'http://localhost:5000/api'
  if (
    trimmed !== '/api' &&
    !trimmed.endsWith('/api') &&
    !trimmed.includes('localhost') &&
    !trimmed.includes('127.0.0.1') &&
    /^https?:\/\//i.test(trimmed)
  ) {
    return `${trimmed}/api`
  }
  return trimmed
})()

const remoteApiHost = (() => {
  try {
    const u = new URL(REMOTE_API_BASE)
    return `${u.protocol}//${u.host}`
  } catch {
    return 'http://localhost:5000'
  }
})()

const remoteApiPathname = (() => {
  try {
    const u = new URL(REMOTE_API_BASE)
    return u.pathname.replace(/\/+$/, '')
  } catch {
    return '/api'
  }
})()

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${remoteApiHost}${remoteApiPathname}/:path*`,
      },
    ]
  },
}

export default nextConfig
