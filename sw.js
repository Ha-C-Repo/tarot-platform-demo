/* sw.js — the service worker that lets the site install as an app and open offline.
   Registered by js/site.js on http(s) only (not from a file).

   - On install, the pages, styles, scripts, fonts and the smaller data files are stored (PRECACHE).
   - Network first for everything from this site, so a visitor online always gets the published version
     (a page and its scripts can never come from two different publishes); the stored copy when offline.
     Every successful fetch refreshes the store, so big files (the pair readings, cities, the Handbook's
     books, card images) are kept from the first time they are used.
   - Nothing from any other site is touched.
   Bump VERSION whenever the site is published; old caches are deleted when the new worker takes over. */
const VERSION = 'tarotdemo-2026-10-05d';
const PRECACHE = [
  './', 'index.html', 'pull.html', 'journal.html', 'learn.html', 'oracle.html', 'moon.html', 'birthchart.html', 'vedic.html', 'astromap.html', 'pastlife.html', 'karmic.html',
  'horoscope.html', 'signs.html', 'tools.html', 'compatibility.html', 'numerology.html', 'chinese.html', 'maya.html',
  'handbook.html', 'pricing.html', 'book.html', 'checkout.html', 'live.html', 'account.html', '404.html',
  'css/base.css', 'css/book.css', 'css/report.css',
  'js/acg.js', 'js/astro.js', 'js/cards.js', 'js/chart.js', 'js/chinese.js', 'js/deck.js', 'js/handbook.js', 'js/icons.js',
  'js/gooddays.js', 'js/journal.js', 'js/learn.js', 'js/oracle.js', 'js/kundli.js', 'js/maya.js', 'js/members.js', 'js/moonviz.js', 'js/natal.js', 'js/numerology.js', 'js/factors.js', 'js/reportpage.js',
  'js/places.js', 'js/reading.js', 'js/share.js', 'js/signs.js', 'js/site.js', 'js/spreads.js', 'js/tools.js', 'js/tour.js',
  'js/transits.js', 'js/vedic.js', 'js/wheel.js',
  'js/vendor/astronomy.browser.min.js', 'js/vendor/astrochart.js',
  'js/data/collective.js', 'js/data/correspondences.js', 'js/data/handbook.js', 'js/data/meanings.js',
  'js/data/interpretations.js', 'js/data/signs-text.js', 'js/data/transit-text.js', 'js/data/tools-text.js',
  'js/data/vedic-text.js', 'js/data/world.js', 'js/data/chiron.js', 'js/data/extra-text.js', 'js/data/asteroids.js', 'js/data/astro-extra-text.js', 'js/data/iching.js', 'js/data/runes.js', 'js/data/report-text.js',
  'assets/fonts/Anton-Regular.ttf', 'assets/fonts/Inter.ttf', 'assets/fonts/CormorantItalic.ttf', 'assets/fonts/Cormorant.ttf',
  'assets/app/icon-192.png', 'assets/app/icon-512.png', 'manifest.webmanifest'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('tarotdemo-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' })
    .then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
