// Build replaces these constants with a content-addressed public asset inventory.
const CACHE_NAME = "self-distillation-shell-9207ab707a043718";
const APP_SHELL = ["/","/_next/static/chunks/app-route-prefetch-policy-BCi8W2WU.js","/_next/static/chunks/framework-D_rUT4EX.js","/_next/static/chunks/index-Dpun4g51.js","/_next/static/chunks/layout-segment-context-DdPk0b-l.js","/_next/static/chunks/page-D4yb6JHp.js","/_next/static/chunks/rolldown-runtime-C60lm6uB.js","/_next/static/chunks/streamed-icons-Bumrcy-j.js","/_next/static/css/index.BqFj5YEE.css","/_next/static/e0cea11b-1728-4c86-bea3-80402525c67a/_buildManifest.js","/_next/static/e0cea11b-1728-4c86-bea3-80402525c67a/_ssgManifest.js","/favicon.svg","/file.svg","/globe.svg","/icon-192.png","/icon-512.png","/manifest.webmanifest","/window.svg"];
const OWN_PREFIXES = ["self-distillation-shell-", "self-distillation-capture-v"];
self.addEventListener("install", event => {
  // No skipWaiting: old tabs retain their matching shell until closed.
  event.waitUntil((async () => {
    if (!APP_SHELL.length) throw new Error("Production build required");
    const cache = await caches.open(CACHE_NAME);
    try {
      for (const path of APP_SHELL) {
        const response = await fetch(new Request(path, { credentials: "omit", cache: "reload" }));
        if (!response.ok || response.redirected) throw new Error("Shell unavailable");
        await cache.put(path, response);
      }
    } catch (error) { await caches.delete(CACHE_NAME); throw error; }
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE_NAME && OWN_PREFIXES.some(prefix => key.startsWith(prefix))) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  const navigation = event.request.mode === "navigate" && url.pathname === "/";
  const path = navigation ? "/" : url.pathname;
  if (!navigation && (url.search || !APP_SHELL.includes(path))) return;
  // Never dynamically cache requests, query strings, RSC responses or API data.
  event.respondWith(caches.open(CACHE_NAME).then(cache => cache.match(path)).then(response => response || Response.error()));
});
self.addEventListener("message", event => {
  if (event.data === "shell-ready") event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const ready = (await Promise.all(APP_SHELL.map(path => cache.match(path)))).every(Boolean);
    event.ports[0]?.postMessage(ready && APP_SHELL.length > 0);
  })());
});
