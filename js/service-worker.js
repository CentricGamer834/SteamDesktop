const CACHE_NAME = "steamdesktop_cache";
const ASSETS_TO_CACHE = [
    "/app/index.html",
    "/css/app.css",
    "/css/login.css",
    "/img/cluster_bg.png",
    "/img/defaultappimage.png",
    "/img/defaultuserimage.png",
    "/img/icon_512x512.png",
    "/img/icon_192x192.png",
    "/img/icon_48x48.png",
    "/js/app.js",
    "/js/login.js",
    "/js/networkManager.js",
    "/js/renderManager.js",
    "/js/service-worker.js",
    "/js/storageManager.js",
    "/login/index.html",
];

// Utility: log if enabled
const DEBUG = true;
function log(...args) { if (DEBUG) console.log("[SW]", ...args); }

// Install: cache core assets
self.addEventListener("install", event => {
    log("Installing and caching core assets");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", event => {
    log("Activating and cleaning up old caches");
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first with stale-while-revalidate fallback
self.addEventListener("fetch", event => {
    const req = event.request;
    if (req.method !== "GET") {
        // Let non-GET pass-through (except for background sync)
        return;
    }

    event.respondWith(
        caches.match(req).then(cachedResp => {
            const fetchPromise = fetch(req).then(networkResp => {
                // Update cache with fresh response
                if (networkResp && networkResp.status === 200) {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(req, networkResp.clone());
                        log("Cache updated for:", req.url);
                    });
                }
                return networkResp.clone();
            }).catch(() => {
                log("Network failed for:", req.url);
            });

            // Return cached if available, else network
            return cachedResp || fetchPromise;
        })
    );
});

// Background sync queue for offline POST requests
const bgSyncQueueName = "bg-sync-queue";

self.addEventListener("sync", event => {
    if (event.tag === bgSyncQueueName) {
        event.waitUntil(processQueue());
    }
});

async function processQueue() {
    log("Processing background sync queue");
    const db = await openRequestQueueDB();
    const tx = db.transaction("requests", "readwrite");
    const store = tx.objectStore("requests");
    const allRequests = await store.getAll();

    for (const reqData of allRequests) {
        try {
            const req = new Request(reqData.url, reqData.options);
            const response = await fetch(req);
            if (response.ok) {
                log("Successfully sent queued request:", reqData.url);
                await store.delete(reqData.id);
            } else {
                log("Failed to send queued request:", reqData.url);
            }
        } catch (err) {
            log("Network error sending queued request:", reqData.url);
            // Leave in queue for retry
        }
    }
    await tx.complete;
    db.close();
}

// IndexedDB helpers for background sync queue
function openRequestQueueDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("bg-sync-requests", 1);
        request.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("requests")) {
                db.createObjectStore("requests", { keyPath: "id", autoIncrement: true });
            }
        };
        request.onsuccess = e => resolve(e.target.result);
        request.onerror = e => reject(e.target.error);
    });
}

// Save POST requests offline (if offline)
self.addEventListener("fetch", event => {
    const req = event.request;
    if (req.method === "POST") {
        event.respondWith(
            fetch(req.clone()).catch(async () => {
                log("Offline POST detected, queuing request:", req.url);
                const db = await openRequestQueueDB();
                const tx = db.transaction("requests", "readwrite");
                const store = tx.objectStore("requests");
                const body = await req.clone().json().catch(() => null); // try json
                const options = {
                    method: "POST",
                    headers: [...req.headers],
                    body: JSON.stringify(body),
                    mode: req.mode,
                    credentials: req.credentials,
                    cache: req.cache,
                    redirect: req.redirect,
                    referrer: req.referrer,
                };
                await store.add({ url: req.url, options });
                await tx.complete;
                db.close();
                // Inform client request queued
                return new Response(JSON.stringify({ offline: true }), {
                    status: 202,
                    headers: { "Content-Type": "application/json" }
                });
            })
        );
    }
});

// Push notifications
self.addEventListener("push", event => {
    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const title = data.title || "Notification";
    const options = {
        body: data.body || "",
        icon: data.icon || "/icons/icon-192.png",
        badge: data.badge || "/icons/badge-72.png",
        data: data.url || "/",
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handling
self.addEventListener("notificationclick", event => {
    event.notification.close();
    const urlToOpen = event.notification.data;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
            // Check if one client already open
            for (const client of windowClients) {
                if (client.url === urlToOpen && "focus" in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
