// Permite recargar la página sin señal: primero la red y, si no hay, la última copia guardada.
const CACHE = 'tests-agua-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || (u.origin !== location.origin && !u.host.endsWith('gstatic.com') && !u.host.endsWith('googleapis.com'))) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const c = r.clone();
      caches.open(CACHE).then(k => k.put(e.request, c));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
