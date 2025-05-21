// const CACHE_NAME = "steamdesktop-b";
// const ASSETS_TO_CACHE = [
//     "",
//     "index.html",
//     "app.html",
//     "login.html",
//     "css/app.css",
//     "css/login.css",
//     "js/app.js",
//     "js/login.js",
//     "img/icon_478x478.png",
//     "img/defaultuserimage.png",
//     "img/defaultappimage.png"
// ];

// self.addEventListener("install", (event) => {
//     event.waitUntil(
//         caches.open(CACHE_NAME)
//             .then((cache) => cache.addAll(ASSETS_TO_CACHE))
//     );
// });

// self.addEventListener("fetch", (event) => {
//     event.respondWith(
//         caches.match(event.request).then((response) => {
//             if (response) {
//                 return response;
//             }

//             return fetch(event.request).then((networkResponse) => {
//                 return caches.open(CACHE_NAME).then((cache) => {
//                     cache.put(event.request, networkResponse.clone());
//                     return networkResponse;
//                 });
//             });
//         })
//     );
// });
const CACHE_NAME = "steamdesktop-v1";
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/app.html",
    "/login.html",
    "/css/app.css",
    "/css/login.css",
    "/js/app.js",
    "/js/login.js",
    "/js/sw-register.js",
    "/img/icon_478x478.png",
    "/img/defaultuserimage.png",
    "/img/defaultappimage.png"
];

// Install Event
self.addEventListener("install", event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(STATIC_ASSETS);
            await self.skipWaiting();
        })()
    );
});

// Activate Event
self.addEventListener("activate", event => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
            await self.clients.claim();
        })()
    );
});

// Fetch Event
self.addEventListener("fetch", event => {
    event.respondWith(
        (async () => {
            try {
                // Try the cache first
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) return cachedResponse;

                // If not in cache, try network
                const networkResponse = await fetch(event.request);
                
                // Only cache same-origin requests
                if (event.request.url.startsWith(self.location.origin)) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, networkResponse.clone());
                }
                
                return networkResponse;
            } catch (error) {
                console.error('Fetch failed:', error);
                // Could add offline fallback here
                throw error;
            }
        })()
    );
});