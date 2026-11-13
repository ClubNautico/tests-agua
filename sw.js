// Permite abrir y recargar la página sin señal: primero la red y, si no hay, la última copia guardada.
// Al instalarse guarda de entrada la página, la configuración, el manifiesto y los iconos.
const CACHE = 'tests-agua-v2';
const BASE = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'icon-512-maskable.png', 'apple-touch-icon.png', 'favicon-32.png'];
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE)
    .then(k => Promise.all(BASE.map(u => fetch(new Request(u, { cache: 'reload' }))
      .then(r => { if (r.ok) return k.put(u, r); }).catch(() => {}))))
    .then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.indexOf('tests-agua-') === 0 && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || (u.origin !== location.origin && !u.host.endsWith('gstatic.com') && !u.host.endsWith('googleapis.com'))) return;
  e.respondWith(
    fetch(e.request).then(r => {
      // Solo se guardan respuestas buenas: un error (por ejemplo config.js que no cargó) no reemplaza la copia buena.
      if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })
      .then(m => m || (e.request.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});
