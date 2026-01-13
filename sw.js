// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});


self.addEventListener('push', event => {
  const data = event.data?.json() || {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'Уведомление', {
      body: data.body || 'Текст',
      icon: '/icon-192.png',
      data: {
        url: data.url || '/'
      }
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})



// Query the user for permission.
const periodicSyncPermission = await navigator.permissions.query({
  name: 'periodic-background-sync',
});

// Check if permission was properly granted.
if (periodicSyncPermission.state == 'granted') {

  // Register a new periodic sync.
  await registration.periodicSync.register('fetch-new-content', {
    // Set the sync to happen no more than once a day.
    minInterval: 24 * 60 * 60 * 1000
  });
} 
// Listen for the `periodicsync` event.
self.addEventListener('periodicsync', event => {

  // Check for correct tag on the periodicSyncPermissionsync event.
  if (event.tag === 'fetch-new-content') {

    // Execute the desired behavior with waitUntil().
    event.waitUntil(

      // This is just a hypothetical function for the behavior we desire.
      fetchNewContent();
    );
  }
});
