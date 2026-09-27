'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { fetchPendingProofCount, getStoredToken, getStoredUser } from '@/lib/api-client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getStoredToken()
    const user = getStoredUser()

    if (
      pathname !== '/admin/login' &&
      (!token || !user || user.role !== 'admin')
    ) {
      router.push('/admin/login')
    }

    setReady(true)
  }, [pathname, router])

  useEffect(() => {
    if (pathname === '/admin/login') return
    const user = getStoredUser()
    if (!user || user.role !== 'admin') return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    let lastCount = Number(window.sessionStorage.getItem('lexliberia_pending_proofs') || '-1')
    let stopped = false

    async function watchPayments() {
      try {
        const count = await fetchPendingProofCount()
        if (stopped) return
        if (lastCount >= 0 && count > lastCount && Notification.permission === 'granted') {
          const notice = new Notification('Lonestar payment to confirm', {
            body: 'A subscriber sent a screenshot. Open it and compare it with your phone.',
            icon: '/icons/icon-192.png',
          })
          notice.onclick = () => {
            window.focus()
            router.push('/admin/payments')
          }
        }
        lastCount = count
        window.sessionStorage.setItem('lexliberia_pending_proofs', String(count))
      } catch {
        // stay quiet when the admin session is not ready
      }
    }

    watchPayments()
    const timer = window.setInterval(watchPayments, 20000)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [pathname, router])

  if (!ready && pathname !== '/admin/login') {
    return null
  }

  return <>{children}</>
}
