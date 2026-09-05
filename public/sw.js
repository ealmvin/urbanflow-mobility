// UrbanFlow Mobility — Service Worker (PWA C1)
const CACHE_NAME = 'urbanflow-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard/map',
  '/dashboard',
  '/manifest.json',
]

// Installation : mise en cache des assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache statique installé')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch : stratégie Network First avec fallback cache
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les appels API (toujours réseau)
  if (event.request.url.includes('/api/')) {
    return
  }

  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse fraîche
        if (response && response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback : servir depuis le cache si hors-ligne
        return caches.match(event.request).then((cached) => {
          if (cached) return cached
          // Page offline de fallback
          return caches.match('/')
        })
      })
  )
})
