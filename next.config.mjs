import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(fileURLToPath(import.meta.url))

const REMOTE_API_BASE = (
  process.env.NEXT_PUBLIC_REMOTE_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api'
)
  .trim()
  .replace(/\/+$/, '')

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
