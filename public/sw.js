const PAYMENTS_PATH = '/admin/payments'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Payment to confirm',
    body: 'A subscriber sent a Lonestar screenshot. Tap to open it.',
    url: PAYMENTS_PATH,
  }
  let payload = fallback
  try {
    if (event.data) payload = { ...fallback, ...event.data.json() }
  } catch {
    payload = fallback
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'lexliberia-payment',
      renotify: true,
      requireInteraction: true,
      data: { url: PAYMENTS_PATH },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(PAYMENTS_PATH, self.location.origin).href

  event.waitUntil((async () => {
    const cache = await caches.open('lexliberia-nav')
    await cache.put('/__open-payments', new Response(PAYMENTS_PATH))

    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })

    for (const client of windowClients) {
      client.postMessage({ type: 'open-payments', url: PAYMENTS_PATH })
      if ('navigate' in client) {
        try {
          await client.navigate(target)
        } catch {
          // The page message handler opens the payments screen.
        }
      }
      if ('focus' in client) return client.focus()
    }

    return self.clients.openWindow(target)
  })())
})
