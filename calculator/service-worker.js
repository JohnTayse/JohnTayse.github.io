const CACHE_NAME = ‘calculator-cache-v1’;
const urlsToCache = [
‘./’,
‘./index.html’,
‘./main.css’,
‘./index.js’,
‘./favicon.svg’,
‘./favicon.ico’,
‘./favicon-96x96.png’,
‘./apple-touch-icon.png’,
‘./web-app-manifest-192x192.png’,
‘./web-app-manifest-512x512.png’,
‘./site.webmanifest’,
‘./img/352426_history_icon.svg’,
‘./img/calculator.svg’,
‘https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css’,
‘https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js’,
‘https://code.jquery.com/jquery-3.7.1.min.js’,
‘https://cdn.jsdelivr.net/npm/mathjs@14.4.0/lib/browser/math.min.js’
];

// Install event - cache all resources
self.addEventListener(‘install’, event => {
event.waitUntil(
caches.open(CACHE_NAME)
.then(cache => {
console.log(‘Opened cache’);
return cache.addAll(urlsToCache);
})
);
});

// Fetch event - serve from cache, fallback to network
self.addEventListener(‘fetch’, event => {
event.respondWith(
caches.match(event.request)
.then(response => {
// Cache hit - return response
if (response) {
return response;
}

```
    // Clone the request
    const fetchRequest = event.request.clone();
    
    return fetch(fetchRequest).then(response => {
      // Check if valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      
      // Clone the response
      const responseToCache = response.clone();
      
      caches.open(CACHE_NAME)
        .then(cache => {
          cache.put(event.request, responseToCache);
        });
      
      return response;
    });
  })
```

);
});

// Activate event - clean up old caches
self.addEventListener(‘activate’, event => {
const cacheWhitelist = [CACHE_NAME];
event.waitUntil(
caches.keys().then(cacheNames => {
return Promise.all(
cacheNames.map(cacheName => {
if (cacheWhitelist.indexOf(cacheName) === -1) {
return caches.delete(cacheName);
}
})
);
})
);
});
