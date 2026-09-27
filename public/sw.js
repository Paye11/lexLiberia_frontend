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
    url: '/admin/payments',
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
      data: { url: payload.url || '/admin/payments' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const path = event.notification.data?.url || '/admin/payments'
  const target = new URL(path, self.location.origin).href

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of windowClients) {
      if ('navigate' in client) {
        await client.navigate(target)
      }
      if ('focus' in client) return client.focus()
    }
    return self.clients.openWindow(target)
  })())
})
