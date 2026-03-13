// Synergos PWA Engine - Service Worker
// Offline-First with Stale-While-Revalidate for AgentSyn responses

const CACHE_NAME = 'synergos-pwa-v3';
const AGENT_CACHE = 'synergos-agent-v1';
const STATIC_CACHE = 'synergos-static-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/performance/',
    '/performance/offline.html',
    '/performance/icons/icon-192.png',
    '/performance/icons/icon-512.png',
    '/performance/favicon.png'
];

// API patterns for caching strategies
const AGENT_API_PATTERN = /\/performance\/api\/(agent|chat|n8n-proxy|coach)/;
const BRANDING_API_PATTERN = /\/performance\/api\/pwa\/(manifest|config|subscribe)/;

// Install: Cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Synergos PWA Service Worker');
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Synergos PWA Service Worker');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME && key !== AGENT_CACHE && key !== STATIC_CACHE)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: Implement caching strategies
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Strategy: Stale-While-Revalidate for Agent APIs
    if (AGENT_API_PATTERN.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(event.request, AGENT_CACHE));
        return;
    }

    // Strategy: Cache-First for Branding/Manifest
    if (BRANDING_API_PATTERN.test(url.pathname)) {
        event.respondWith(cacheFirst(event.request, STATIC_CACHE, 3600)); // 1 hour
        return;
    }

    // Strategy: Network-First for everything else
    event.respondWith(networkFirst(event.request));
});

// Stale-While-Revalidate: Return cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

// Cache-First: Check cache, fallback to network
async function cacheFirst(request, cacheName, maxAge) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

// Network-First: Try network, fallback to cache
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503 });
    }
}

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');

    let data = { title: 'Synergos', body: 'Nueva notificación' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/performance/icons/icon-192.png',
        badge: data.badge || '/performance/icons/icon-192.png',
        image: data.image,
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/performance/',
            ...data.data
        },
        actions: [
            { action: 'open', title: 'Ver ahora' },
            { action: 'close', title: 'Cerrar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Focus existing window or open new one
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});

// Background Sync for offline requests
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'synergos-offline-queue') {
        event.waitUntil(processOfflineQueue());
    }
});

async function processOfflineQueue() {
    // Process queued requests from IndexedDB
    // This would integrate with the offline queue system
    console.log('[SW] Processing offline queue...');
}

console.log('[SW] Synergos PWA Service Worker loaded');
