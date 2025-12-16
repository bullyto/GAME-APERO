// sw.js — Hibou66 (fix cache GitHub/PWA + cheat.jpeg)
// - Bump CACHE_NAME when you deploy
// - Precache cheat.jpeg
// - Network-first for navigation (index.html) to avoid stale HTML
// - Cache-first for static assets

const CACHE_NAME = "hibou66-v2"; // <-- change this to v3, v4... on future updates

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./cheat.jpeg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Network-first for page navigations (keeps index.html fresh)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy)).catch(()=>{});
          return resp;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(()=>{});
        return resp;
      });
    })
  );
});
