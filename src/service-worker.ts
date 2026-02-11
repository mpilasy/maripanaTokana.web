/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE_APP = `app-${version}`;
const CACHE_API = 'api-cache';
const CACHE_FONTS = 'font-cache';

// Install: precache app shell, activate immediately
sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_APP)
			.then((cache) => cache.addAll([...build, ...files]))
			.then(() => sw.skipWaiting())
	);
});

// Activate: clean old caches, claim all clients immediately
sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys
					.filter((key) => key !== CACHE_APP && key !== CACHE_API && key !== CACHE_FONTS)
					.map((key) => caches.delete(key))
			)
		).then(() => sw.clients.claim())
	);
});

// Fetch: strategy per request type
sw.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Skip non-GET requests
	if (event.request.method !== 'GET') return;

	// API calls: NetworkFirst
	if (url.hostname === 'api.open-meteo.com' || url.hostname === 'nominatim.openstreetmap.org') {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					const clone = response.clone();
					caches.open(CACHE_API).then((cache) => cache.put(event.request, clone));
					return response;
				})
				.catch(() => caches.match(event.request).then((r) => r || new Response('Offline', { status: 503 })))
		);
		return;
	}

	// Google Fonts: CacheFirst
	if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
		event.respondWith(
			caches.match(event.request).then((cached) => {
				if (cached) return cached;
				return fetch(event.request).then((response) => {
					const clone = response.clone();
					caches.open(CACHE_FONTS).then((cache) => cache.put(event.request, clone));
					return response;
				});
			})
		);
		return;
	}

	// App shell: CacheFirst
	if (url.origin === sw.location.origin) {
		event.respondWith(
			caches.match(event.request).then((cached) => cached || fetch(event.request))
		);
	}
});
