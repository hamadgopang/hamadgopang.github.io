'use strict';
var CVERSION = 'hamaad-shell-v1.0.48';
var PRECACHE = CVERSION + '-precache';
var CRUNTIME = CVERSION + '-CRUNTIME';
var SHELLHMD = [
    './',
    './index.html',
    './404.html',
    './manifest.json',
    './results/',
    './results/index.html',
    './books-past-papers/',
    './books-past-papers/index.html',
    './periodic-table/',
    './periodic-table/index.html',
    './dictionary/',
    './dictionary/index.html',
    './organic-chemistry/',
    './organic-chemistry/index.html',
    './organic-chemistry/hydrocarbons/',
    './organic-chemistry/homologous-series/',
    './organic-chemistry/functional-groups/',
    './organic-chemistry/reactions/',
    './organic-chemistry/quiz/',
    './organic-chemistry/flashcards/',
    './organic-chemistry/properties/',
    './organic-chemistry/isomerism/',
    './organic-chemistry/nomenclature/',
    './organic-chemistry/molecular-builder/',
    './assets/image/icons/favicon.png',
    './assets/image/icons/icon-192.png',
    './assets/image/icons/icon-512.png',
    './assets/image/logo.png',
    './assets/image/og-image.jpg',
    './assets/image/inixio/logo.png',
    './assets/image/inixio/ceo.png',
    './assets/css/style.css',
    './assets/css/responsive.css',
    './assets/css/results.css',
    './assets/css/teacher.css',
    './assets/css/lab.css',
    './assets/css/periodic-table.css',
    './assets/css/dictionary.css',
    './assets/css/welcome.css',
    './assets/css/inixio-about.css',
    './assets/css/books-past-papers.css',
    './assets/css/error.css',
    './assets/js/boot.js',
    './assets/js/main.js',
    './assets/js/animations.js',
    './assets/js/interactions.js',
    './assets/js/results-core.js',
    './assets/js/results-home.js',
    './assets/js/results-page.js',
    './assets/js/lab-teacher.js',
    './assets/js/lab-core.js',
    './assets/js/lab-hub.js',
    './assets/js/lab-hydrocarbons.js',
    './assets/js/lab-homologous.js',
    './assets/js/lab-groups.js',
    './assets/js/lab-reactions.js',
    './assets/js/lab-quiz.js',
    './assets/js/lab-flashcards.js',
    './assets/js/lab-properties.js',
    './assets/js/lab-isomerism.js',
    './assets/js/lab-nomenclature.js',
    './assets/js/lab-molecular-builder.js',
    './assets/js/books-past-papers.js',
    './assets/js/periodic-table.js',
    './assets/js/periodic-table-text.js',
    './assets/js/dictionary.js',
    './assets/js/welcome.js',
    './assets/js/inixio-about.js',
    './assets/json/periodic-table.json',
    './assets/json/dictionary.json',
    './assets/json/results/index.json',
    './assets/json/results/10th-2016.json',
    './assets/json/results/10th-2017.json',
    './assets/json/results/10th-2018.json',
    './assets/json/results/10th-2019.json',
    './assets/json/results/10th-2020.json',
    './assets/json/results/10th-2021.json',
    './assets/json/results/9th-2017.json',
    './assets/json/results/9th-2018.json',
    './assets/json/results/9th-2019.json',
    './assets/json/results/9th-2021.json'
];

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
        return Promise.all(SHELLHMD.map(function(url) {
            return cache.add(url).catch(function(){});
        }));
    }).then(function() {
        return self.skipWaiting();
    }));
});

self.addEventListener('activate', function(event) {
    event.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.map(function(key) {
            if (key.indexOf(CVERSION) !== 0) return caches.delete(key);
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
        event.respondWith(staleOut(request));
    }
});

function networkFirst(request) {
    return fetch(request).then(function(response) {
        if (response && response.ok) {
            var copy = response.clone();
            caches.open(CRUNTIME).then(function(cache) {
                cache.put(request, copy);
            });
        }
        return response;
    }).catch(function() {
        return caches.match(request).then(function(cached) {
            if (cached) return cached;
            return caches.match('./404.html').then(function(missing) {
                if (missing) return missing;
                return caches.match('./index.html').then(function(home) {
                    return home || Response.error();
                });
            });
        });
    });
}

function staleOut(request) {
    return caches.match(request).then(function(cached) {
        var network = fetch(request).then(function(response) {
            if (response && response.ok) {
                var copy = response.clone();
                caches.open(CRUNTIME).then(function(cache) {
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
