const CACHE = 'almira-shell-v2'
const STATIC_PATHS = new Set(['/icon.svg', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest'])

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/index.html', ...STATIC_PATHS])))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('almira-shell-') && key !== CACHE).map(key => caches.delete(key)))))
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('authorization')) return
  const shellPath = url.pathname === '/' || url.pathname === '/index.html'
  if (request.mode === 'navigate' && shellPath) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request)
        if (response.ok && !response.headers.get('cache-control')?.includes('no-store')) {
          const copy = response.clone()
          event.waitUntil(caches.open(CACHE).then(cache => cache.put('/index.html', copy)).catch(() => undefined))
        }
        return response
      } catch {
        return await caches.match('/index.html') ?? new Response('Almira needs a connection for its first visit. Please reconnect and reload.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      }
    })())
    return
  }
  // Only cache public assets; account/API requests never enter this cache.
  if (!url.pathname.startsWith('/assets/') && !STATIC_PATHS.has(url.pathname)) return
  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok && !response.headers.get('cache-control')?.includes('no-store')) {
      const copy = response.clone()
      event.waitUntil(cache.put(request, copy).catch(() => undefined))
    }
    return response
  })())
})
