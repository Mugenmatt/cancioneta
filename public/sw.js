const CACHE_NAME = 'cancioneta-shell-v26';
const ROUTES = ['juegos', 'acordes', 'ajustes', 'escribir', 'material', 'onboarding'];
const GAME_IDS = [
  'f0-1', 'f0-2', 'f0-3', 'f0-4', 'f0-5',
  'g01', 'g02', 'g03', 'g04', 'g05', 'g06', 'g07', 'g08', 'g09', 'g10',
  'g11', 'g12', 'g13', 'g14', 'g15', 'g16', 'g17', 'g18', 'g19', 'g20',
  'g21', 'g22', 'g23', 'g24', 'g25', 'g26', 'g27', 'g28', 'g29', 'g30',
  'g32', 'g33', 'g34', 'g35', 'g36', 'g37', 'g38', 'g39', 'g41', 'g42', 'g43', 'g44', 'g45', 'g46', 'g47', 'g48', 'g49', 'g50', 'g51', 'g52', 'g53', 'g54', 'g55', 'g56', 'g57',
];
const STATIC_FILES = [
  '/fonts/Fraunces_400Regular.ttf',
  '/fonts/Fraunces_400Regular_Italic.ttf',
  '/fonts/Fraunces_700Bold.ttf',
  '/fonts/Literata_400Regular.ttf',
  '/fonts/Literata_400Regular_Italic.ttf',
  '/fonts/Literata_600SemiBold.ttf',
  '/fonts/Inter_400Regular.ttf',
  '/fonts/Inter_500Medium.ttf',
  '/fonts/Inter_600SemiBold.ttf',
  '/fonts/Inter_700Bold.ttf',
  '/fonts/Feather.ttf',
  '/manifest.webmanifest',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];
const SHELL_PATHS = [
  '/',
  '/index.html',
  ...ROUTES.flatMap((route) => [`/${route}`, `/${route}.html`]),
  ...GAME_IDS.flatMap((id) => [`/juego/${id}`, `/juego/${id}.html`]),
  ...STATIC_FILES,
];

function assetUrls(html) {
  return [...html.matchAll(/(?:src|href)="(\/_expo\/[^"]+)"/g)].map((match) => match[1]);
}

async function cacheShell() {
  const cache = await caches.open(CACHE_NAME);
  const assets = new Set();
  await Promise.all(SHELL_PATHS.map(async (path) => {
    try {
      const response = await fetch(path, { cache: 'reload' });
      if (!response.ok) return;
      await cache.put(path, response.clone());
      const html = await response.text();
      for (const url of assetUrls(html)) assets.add(url);
    } catch {
      return;
    }
  }));
  await Promise.all([...assets].map(async (url) => {
    try {
      await cache.add(url);
    } catch {
      return;
    }
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match('/index.html'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('', { status: 503 });
    }
  })());
});
