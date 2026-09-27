self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {})

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Lonestar payment to confirm',
    body: 'A subscriber sent a screenshot. Open it and compare it with your phone.',
    url: '/admin/payments',
  }
  try {
    payload = { ...payload, ...event.data.json() }
  } catch {
    // keep the default message
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      data: { url: payload.url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/admin/payments'
  event.waitUntil(self.clients.openWindow(url))
})
