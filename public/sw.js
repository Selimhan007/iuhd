const CACHE = "student-tm-v3";
const PRECACHE = ["/", "/schedule", "/courses", "/announcements", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Always fetch document and route requests so published deployments receive the same HTML as Preview.
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(fetch(req).catch(() => caches.match("/")));
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.destination === "style" || req.destination === "script" || req.destination === "font" || req.destination === "image")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
