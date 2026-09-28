// Service Worker for QR Generator PWA
// All paths are relative to this file, so the app also works when it is
// hosted in a sub-folder (for example GitHub Pages project sites).
const VERSION = '1.0.2';
const CACHE_NAME = `qr-generator-v${VERSION}`;
const STATIC_CACHE = `qr-generator-static-v${VERSION}`;
const DYNAMIC_CACHE = `qr-generator-dynamic-v${VERSION}`;

// Files that the app needs to work offline. Install fails if one is missing,
// so a broken list is noticed at once. scripts/check-offline.js checks this list.
const STATIC_FILES = [
	'./',
	'./index.html',
	'./manifest.json',
	'./css/style.min.css',
	'./js/app.js',
	'./js/pwa.js',
	'./js/qr-types.js',
	'./js/qr-worker.js',
	'./js/utils.js',
	'./js/validation.js',
	'./js/langs/de.js',
	'./js/langs/en.js',
	'./js/langs/es.js',
	'./js/langs/fr.js',
	'./js/langs/pt.js',
	'./js/libs/FileSaver.min.js',
	'./js/libs/jsQR.min.js',
	'./js/libs/qrcode-worker-compatible.js',
	'./js/libs/qrcode-worker-wrapper.js',
	'./js/libs/qrcode-wrapper.js',
	'./js/libs/qrcode.min.js',
	'./assets/icons/apple-touch-icon.png',
	'./assets/icons/favicon-16x16.png',
	'./assets/icons/favicon-32x32.png',
	'./assets/icons/icon-16x16.png',
	'./assets/icons/icon-32x32.png',
	'./assets/icons/icon-180x180.png',
	'./assets/icons/icon-192x192.png',
	'./assets/icons/icon-512x512.png'
];

// Libraries that app.js loads from a CDN when the user exports a PDF or a ZIP.
// They are stored on a best-effort basis: if the CDN is not reachable during
// install, the app still installs, but PDF and ZIP export need a network
// connection until the next successful install.
const CDN_FILES = [
	'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install event
self.addEventListener('install', (event) => {
	console.log('Service Worker installing...');

	event.waitUntil(
		caches.open(STATIC_CACHE)
			.then((cache) => {
				console.log('Caching static files');
				return cache.addAll(STATIC_FILES)
					.then(() => Promise.all(CDN_FILES.map((url) => {
						return cache.add(url).catch((error) => {
							console.warn('Could not cache optional file:', url, error);
						});
					})));
			})
			.then(() => {
				console.log('Service Worker installed');
				return self.skipWaiting();
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

// Answer from the cache first, then from the network. Successful network
// responses are stored so that files that are not in the lists above also work
// offline after their first use.
async function cacheFirst(event) {
	const request = event.request;
	// Links like ./?lang=de or ./?type=wifi must find the cached page
	const cached = await caches.match(request, { ignoreSearch: request.mode === 'navigate' });
	if (cached) {
		return cached;
	}

	try {
		const response = await fetch(request);
		if (response.status === 200) {
			const copy = response.clone();
			event.waitUntil(caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, copy)));
		}
		return response;
	} catch (error) {
		console.error('Network request failed:', error);
		if (request.mode === 'navigate') {
			const page = await caches.match('./index.html');
			if (page) {
				return page;
			}
		}
		return new Response('Network error occurred', {
			status: 408,
			headers: { 'Content-Type': 'text/plain' }
		});
	}
}

// Fetch event
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') {
		return;
	}

	const url = new URL(event.request.url);
	const isSameOrigin = url.origin === self.location.origin;
	const isKnownCdnFile = CDN_FILES.includes(url.href);

	// Other cross-origin requests (for example web fonts) stay with the browser
	if (isSameOrigin || isKnownCdnFile) {
		event.respondWith(cacheFirst(event));
	}
});

// Handle push notifications
self.addEventListener('push', (event) => {
	console.log('Push notification received');

	const options = {
		body: event.data ? event.data.text() : 'New notification from QR Generator',
		icon: 'assets/icons/icon-192x192.png',
		badge: 'assets/icons/icon-32x32.png',
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1
		},
		actions: [
			{
				action: 'explore',
				title: 'Open app',
				icon: 'assets/icons/icon-32x32.png'
			},
			{
				action: 'close',
				title: 'Close',
				icon: 'assets/icons/icon-32x32.png'
			}
		]
	};

	event.waitUntil(
		self.registration.showNotification('QR Generator', options)
	);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
	console.log('Notification clicked:', event.action);

	event.notification.close();

	if (event.action === 'explore') {
		event.waitUntil(
			clients.openWindow(self.registration.scope)
		);
	}
});

// Handle message
self.addEventListener('message', (event) => {
	console.log('Message received in SW:', event.data);

	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
