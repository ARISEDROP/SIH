const CACHE_NAME = 'smart-health-water-alert-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/styles/global.css',
  '/src/index.tsx',
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll for atomic operation, but handle potential individual failures if necessary.
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache some files during install:', error);
          // Even if some non-critical assets fail, we might want the SW to install.
        });
      })
  );
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // We only cache GET requests. Other requests, like POST to Gemini API, are passed through.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (loading the page), use a network-first strategy.
  // This ensures users get the latest version of the app if they are online.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, serve the cached index page.
        return caches.match('/index.html');
      })
    );
    return;
  }
  
  // For all other assets (JS, CSS, images, fonts), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache, go to network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response to cache
            if (networkResponse && networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetching failed:', error);
            // This part is reached when the network request itself fails,
            // e.g., for an asset that was never cached and the user is offline.
        });
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
