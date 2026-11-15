/* Service worker — offline shell for Hamad Khan portfolio (GitHub Pages).
   Strategy:
   - Precache the app shell (HTML routes + CSS/JS/JSON needed offline)
   - Network-first for navigations (fresh pages when online)
   - Stale-while-revalidate for same-origin static assets
   - Never cache large PDFs under assets/books/ (too heavy for install/offline)
   - Ignore cross-origin requests (fonts, analytics, etc.)
*/
'use strict';
var CACHE_VERSION = 'hk-shell-v1.0.30';
var PRECACHE = CACHE_VERSION + '-precache';
var RUNTIME = CACHE_VERSION + '-runtime';
var SHELL = ['./', './index.html', './manifest.json', './results/', './results/index.html', './books-past-papers/', './books-past-papers/index.html', './periodic-table/', './periodic-table/index.html', './organic-chemistry/', './organic-chemistry/index.html', './organic-chemistry/hydrocarbons/', './organic-chemistry/homologous-series/', './organic-chemistry/functional-groups/', './organic-chemistry/reactions/', './organic-chemistry/quiz/', './organic-chemistry/flashcards/', './assets/image/favicon.png', './assets/image/icon-192.png', './assets/image/icon-512.png', './assets/image/logo.png', './assets/image/og-image.png', './assets/css/style.css', './assets/css/responsive.css', './assets/css/results.css', './assets/css/teacher.css', './assets/css/lab.css', './assets/css/periodic-table.css', './assets/css/books-past-papers.css', './assets/js/boot.js', './assets/js/main.js', './assets/js/animations.js', './assets/js/interactions.js', './assets/js/results-core.js', './assets/js/results-home.js', './assets/js/results-page.js', './assets/js/lab-teacher.js', './assets/js/lab-core.js', './assets/js/lab-hub.js', './assets/js/lab-hydrocarbons.js', './assets/js/lab-homologous.js', './assets/js/lab-groups.js', './assets/js/lab-reactions.js', './assets/js/lab-quiz.js', './assets/js/lab-flashcards.js', './assets/js/books-past-papers.js', './assets/js/periodic-table.js', './assets/js/periodic-table-text.js', './assets/json/periodic-table.json'];

function sameOrigin(url) {
    return url.origin === self.location.origin;
}

function isNavigation(request) {
    return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept') && request.headers.get('accept').indexOf('text/html') !== -1);
}

function isBookPdf(url) {
    return /\/assets\/books\/.+\.pdf$/i.test(url.pathname);
}

function isStaticAsset(url) {
    return /\.(?:css|js|json|png|jpe?g|webp|gif|svg|ico|woff2?)$/i.test(url.pathname);
}
self.addEventListener('install', function(event) {
    event.waitUntil(caches.open(PRECACHE).then(function(cache) {
        return Promise.all(SHELL.map(function(url) {
            return cache.add(url).catch(function() {
                /* Missing optional paths must not fail the whole install. */
            });
        }));
    }).then(function() {
        return self.skipWaiting();
    }));
});
self.addEventListener('activate', function(event) {
    event.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.map(function(key) {
            if (key.indexOf(CACHE_VERSION) !== 0) return caches.delete(key);
        }));
    }).then(function() {
        return self.clients.claim();
    }));
});
self.addEventListener('fetch', function(event) {
    var request = event.request;
    if (request.method !== 'GET') return;
    var url;
    try {
        url = new URL(request.url);
    } catch (e) {
        return;
    }
    if (!sameOrigin(url)) return;
    if (isBookPdf(url)) return;
    if (isNavigation(request)) {
        event.respondWith(networkFirst(request));
        return;
    }
    if (isStaticAsset(url)) {
        event.respondWith(staleWhileRevalidate(request));
    }
});

function networkFirst(request) {
    return fetch(request).then(function(response) {
        if (response && response.ok) {
            var copy = response.clone();
            caches.open(RUNTIME).then(function(cache) {
                cache.put(request, copy);
            });
        }
        return response;
    }).catch(function() {
        return caches.match(request).then(function(cached) {
            if (cached) return cached;
            return caches.match('./index.html').then(function(home) {
                return home || Response.error();
            });
        });
    });
}

function staleWhileRevalidate(request) {
    return caches.match(request).then(function(cached) {
        var network = fetch(request).then(function(response) {
            if (response && response.ok) {
                var copy = response.clone();
                caches.open(RUNTIME).then(function(cache) {
                    cache.put(request, copy);
                });
            }
            return response;
        }).catch(function() {
            return cached || Response.error();
        });
        return cached || network;
    });
}