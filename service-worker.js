/**
 * DURGA PUJA SONG (দুর্গাপূজার গান) - PWA Service Worker
 * Caches application shell and visual assets. NEVER caches YouTube video or audio.
 */

const CACHE_NAME = 'durga-puja-song-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/themes.css',
  './css/animations.css',
  './css/responsive.css',
  './js/app.js',
  './js/player.js',
  './js/queue.js',
  './js/theme-manager.js',
  './js/search.js',
  './js/filters.js',
  './js/favorites.js',
  './js/storage.js',
  './js/quotes.js',
  './js/radio.js',
  './js/visualizer.js',
  './js/admin.js',
  './js/share.js',
  './data/categories.json',
  './data/singers.json',
  './data/quotes.json',
  './assets/icons/trishul.svg',
  './assets/icons/dhaak.svg',
  './assets/icons/dhunuchi.svg',
  './assets/icons/shankha.svg',
  './assets/icons/pradip.svg',
  './assets/icons/lotus.svg',
  './assets/icons/alpana.svg',
  './assets/icons/radio.svg',
  './assets/icons/cassette.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strictly DO NOT cache YouTube endpoints or external media
  if (url.origin.includes('youtube.com') || url.origin.includes('googlevideo.com') || url.origin.includes('ytimg.com')) {
    return;
  }

  // Network first, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (event.request.method === 'GET' && response.status === 200 && url.origin === location.origin) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
