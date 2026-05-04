const CACHE_NAME = "geopic-v1";
const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/src/css/style.css",
    "/src/js/firebase-config.js",
    "/src/js/app.js",
    "/assets/android-chrome-192x192.png",
    "/assets/android-chrome-512x512.png",
    "/assets/apple-touch-icon.png",
    "/assets/favicon-16x16.png",
    "/assets/favicon-32x32.png",
    "/assets/favicon.ico"
];

// install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.url.includes("firestore") ||
      request.url.includes("googleapis") ||
      request.url.includes("firebase")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).catch(() => caches.match("/index.html"));
    })
  );
});