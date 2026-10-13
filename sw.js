const CACHE_NAME = 'hvr-cache-v16-bugfix';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './features.js',
  './expansion.js',
  './creator.js',
  './boxes.js',
  './manifest.json',
  './config.js',
  './icon-192.png',
  './icon-512.png',
  // Սփրայթներ / Նկարներ
  './mraveli.png',
  './mraveli_bust.png',
  './atoriponch.png',
  './atoriponch_bust.png',
  './skochitagavor.png',
  './skochitagavor_bust.png',
  './skochitagavor_throw1.png',
  './skochitagavor_throw2.png',
  './skochitagavor_throw3.png',
  './skochitagavor_throw4.png',
  './simvolneri_mard.png',
  './simvolneri_mard_bust.png',
  './kettle.png',
  './kettle_bust.png',
  './shamshyan.png',
  './shamshyan_bust.png',
  './brain_base.png',
  './hikler.png',
  './expelearmus.png',
  './ferri.png',
  './heraxos.png',
  './jutak.png',
  './kungfu.png',
  './matem.png',
  './nikolaganner.png',
  './taguhi.png',
  './tort.png',
  './hikler_bust.png',
  './expelearmus_bust.png',
  './ferri_bust.png',
  './heraxos_bust.png',
  './jutak_bust.png',
  './kungfu_bust.png',
  './matem_bust.png',
  './nikolaganner_bust.png',
  './taguhi_bust.png',
  './tort_bust.png'
];

// Տեղադրում և ֆայլերի քեշավորում
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ակտիվացում և հին քեշի մաքրում
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
    })
  );
  self.clients.claim();
});

// Հարցումների սպասարկում. նախ ցանց (թարմ տարբերակ), ձախողման դեպքում՝ քեշ (offline աշխատանք)
// Only same-origin GET requests are cached: Firebase / gstatic traffic (POST, long-polling,
// opaque responses) must never be cached or answered from an old cache.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => caches.match(req).then((cached) => cached || Response.error()))
  );
});
