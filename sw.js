
const CACHE_NAME = 'my-website-v1';

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request).catch(() =>
            caches.open(CACHE_NAME).then(cache =>
                cache.match(event.request)
            ).then(response => response || Response.error())
        )
    );
});
