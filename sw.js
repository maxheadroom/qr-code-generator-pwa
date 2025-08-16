// Service Worker for QR Generator PWA
const CACHE_NAME = 'qr-generator-v1.0.0';
const STATIC_CACHE = 'qr-generator-static-v1.0.0';
const DYNAMIC_CACHE = 'qr-generator-dynamic-v1.0.0';

// Files to cache
const STATIC_FILES = [
	'/',
	'/index.html',
	'/css/style.css',
	'/js/app.js',
	'/js/qr-types.js',
	'/js/pwa.js',
	'/manifest.json',
	'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
	'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js'
];

// Install event
self.addEventListener('install', (event) => {
	console.log('Service Worker installing...');
	
	event.waitUntil(
		caches.open(STATIC_CACHE)
			.then((cache) => {
				console.log('Caching static files');
				return cache.addAll(STATIC_FILES);
			})
			.then(() => {
				console.log('Service Worker installed');
				return self.skipWaiting();
			})
			.catch((error) => {
				console.error('Error during install:', error);
			})
	);
});

// Activate event
self.addEventListener('activate', (event) => {
	console.log('Service Worker activating...');
	
	event.waitUntil(
		caches.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
							console.log('Deleting old cache:', cacheName);
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => {
				console.log('Service Worker activated');
				return self.clients.claim();
			})
	);
});

// Fetch event
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') {
		return;
	}

	// Handle different types of requests
	if (url.origin === self.location.origin) {
		// Same origin requests
		event.respondWith(handleSameOriginRequest(request));
	} else if (url.origin.includes('cdn.jsdelivr.net')) {
		// CDN requests
		event.respondWith(handleCDNRequest(request));
	} else {
		// Other external requests
		event.respondWith(handleExternalRequest(request));
	}
});

// Handle same origin requests
async function handleSameOriginRequest(request) {
	try {
		// Try network first
		const networkResponse = await fetch(request);
		
		// Cache the response for future use
		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE);
			cache.put(request, networkResponse.clone());
		}
		
		return networkResponse;
	} catch (error) {
		console.log('Network failed, trying cache:', request.url);
		
		// Try cache
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		
		// Return offline page for HTML requests
		if (request.headers.get('accept').includes('text/html')) {
			return caches.match('/index.html');
		}
		
		throw error;
	}
}

// Handle CDN requests
async function handleCDNRequest(request) {
	try {
		// Try cache first for CDN resources
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		
		// Try network
		const networkResponse = await fetch(request);
		
		// Cache successful responses
		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE);
			cache.put(request, networkResponse.clone());
		}
		
		return networkResponse;
	} catch (error) {
		console.log('CDN request failed:', request.url);
		throw error;
	}
}

// Handle external requests
async function handleExternalRequest(request) {
	try {
		// Try network first
		const networkResponse = await fetch(request);
		return networkResponse;
	} catch (error) {
		console.log('External request failed:', request.url);
		throw error;
	}
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
	console.log('Background sync triggered:', event.tag);
	
	if (event.tag === 'background-sync') {
		event.waitUntil(doBackgroundSync());
	}
});

async function doBackgroundSync() {
	try {
		// Get stored offline actions
		const offlineActions = await getOfflineActions();
		
		for (const action of offlineActions) {
			try {
				// Process each offline action
				await processOfflineAction(action);
				
				// Remove from storage if successful
				await removeOfflineAction(action.id);
			} catch (error) {
				console.error('Error processing offline action:', error);
			}
		}
	} catch (error) {
		console.error('Background sync failed:', error);
	}
}

// Get offline actions from IndexedDB
async function getOfflineActions() {
	// This would be implemented with IndexedDB
	// For now, return empty array
	return [];
}

// Process offline action
async function processOfflineAction(action) {
	// This would process stored offline actions
	// For now, just log
	console.log('Processing offline action:', action);
}

// Remove offline action
async function removeOfflineAction(actionId) {
	// This would remove from IndexedDB
	console.log('Removing offline action:', actionId);
}

// Push notification handling
self.addEventListener('push', (event) => {
	console.log('Push notification received');
	
	const options = {
		body: event.data ? event.data.text() : 'Nueva notificación de QR Generator',
		icon: '/assets/icons/android-chrome-192x192.png',
		badge: '/assets/icons/favicon-32x32.png',
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1
		},
		actions: [
			{
				action: 'explore',
				title: 'Abrir app',
				icon: '/assets/icons/favicon-32x32.png'
			},
			{
				action: 'close',
				title: 'Cerrar',
				icon: '/assets/icons/favicon-32x32.png'
			}
		]
	};

	event.waitUntil(
		self.registration.showNotification('QR Generator', options)
	);
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
	console.log('Notification clicked:', event.action);
	
	event.notification.close();

	if (event.action === 'explore') {
		event.waitUntil(
			clients.openWindow('/')
		);
	}
});

// Message handling
self.addEventListener('message', (event) => {
	console.log('Message received in SW:', event.data);
	
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
	
	if (event.data && event.data.type === 'CACHE_QR') {
		event.waitUntil(cacheQRImage(event.data));
	}
});

// Cache QR image
async function cacheQRImage(data) {
	try {
		const cache = await caches.open(DYNAMIC_CACHE);
		const response = await fetch(data.imageUrl);
		await cache.put(data.url, response);
		console.log('QR image cached:', data.url);
	} catch (error) {
		console.error('Error caching QR image:', error);
	}
}
