// Minimal Service Worker to satisfy PWA install requirements
const CACHE_NAME = 'terminal-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Simply pass through requests to the network
    event.respondWith(fetch(event.request));
});
