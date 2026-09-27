'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  fetchPendingProofCount,
  getStoredToken,
  getStoredUser,
  syncAdminPush,
  type AdminPushStatus,
} from '@/lib/api-client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [alertStatus, setAlertStatus] = useState<AdminPushStatus | ''>('')
  const [alertError, setAlertError] = useState('')

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

    syncAdminPush(false)
      .then(setAlertStatus)
      .catch(() => setAlertStatus('needs-permission'))

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

  async function allowAlerts() {
    setAlertError('')
    try {
      setAlertStatus(await syncAdminPush(true))
    } catch (error) {
      setAlertError(error instanceof Error ? error.message : 'Unable to turn on phone alerts.')
    }
  }

  const showAlertBanner = pathname !== '/admin/login' && alertStatus && alertStatus !== 'ready'

  return (
    <>
      {showAlertBanner ? (
        <div className="border-b border-border bg-primary/10 px-4 py-3">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              {alertStatus === 'blocked'
                ? 'Phone alerts are blocked. Allow notifications for LexLiberia in the phone settings, then open this app again.'
                : alertStatus === 'server-missing'
                  ? 'The server is not ready to send phone alerts yet. Add the VAPID keys on Render, then open this app again.'
                  : alertStatus === 'unsupported'
                    ? 'Open LexLiberia from the icon on your home screen, then allow notifications.'
                    : 'Allow notifications so a payment screenshot appears on this phone even when the app is closed.'}
            </p>
            {alertStatus === 'needs-permission' ? (
              <Button type="button" onClick={allowAlerts}>Allow phone alerts</Button>
            ) : null}
          </div>
          {alertError ? <p className="mx-auto mt-2 max-w-3xl text-sm text-destructive">{alertError}</p> : null}
        </div>
      ) : null}
      {children}
    </>
  )
}
