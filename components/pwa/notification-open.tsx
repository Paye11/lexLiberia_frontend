'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PAYMENTS_PATH = '/admin/payments'

export function NotificationOpen() {
  const router = useRouter()

  useEffect(() => {
    function openPayments() {
      if (window.location.pathname !== PAYMENTS_PATH) {
        router.push(PAYMENTS_PATH)
      }
    }

    function onMessage(event: MessageEvent) {
      if (event.data?.type === 'open-payments') openPayments()
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onMessage)
    }

    caches.open('lexliberia-nav').then(async (cache) => {
      const pending = await cache.match('/__open-payments')
      if (!pending) return
      await cache.delete('/__open-payments')
      openPayments()
    }).catch(() => {})

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onMessage)
      }
    }
  }, [router])

  return null
}
