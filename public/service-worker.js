// =====================================================
// DRIVELUCRO — SERVICE WORKER
// BLOCO 18A.2 — CACHE INTELIGENTE (SEM TRAVAR JS)
// =====================================================

const CACHE_NAME = "drivelucro-cache-v22";

const ARQUIVOS_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json"
  // ❌ NÃO CACHEAR app.js
];

// ===============================
// INSTALL
// ===============================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );

  self.skipWaiting();
});

// ===============================
// ACTIVATE
// ===============================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// ===============================
// FETCH (CORRIGIDO)
// ===============================
self.addEventListener("fetch", event => {
  const request = event.request;

  // 🔥 NÃO CACHEAR JS (CRÍTICO)
  if (request.url.includes("app.js")) {
    event.respondWith(fetch(request));
    return;
  }

  // 🔥 HTML sempre atualizado
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(fetch(request));
    return;
  }

  // 🔥 CACHE NORMAL PARA O RESTO
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});