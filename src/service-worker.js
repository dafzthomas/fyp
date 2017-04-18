const CACHE_NAME = 'fyp.dafz.com:1704.15';
const urlsToCache = [
    '/',
    '/index.html',
    '/game-text.html',
    '/game-2d.html',
    '/game-3d.html',
    '/css/main.css',
    '/js/app/gameLogic.js',
    '/js/app/gameText.js',
    '/js/app/game2D.js',
    '/js/app/game3D.js',
    '/js/app/checkNetwork.js',
    '/js/libs/stats.min.js',
    '/js/libs/three.min.js',
    '/js/libs/MTLLoader.js',
    '/js/libs/OBJLoader.js',
    '/js/libs/StereoEffect.js',
    '/js/libs/DeviceOrientationController.js',
    "/images/cloud.png",
    "/images/fullscreen.png",
    "/images/google-cardboard.png",
    "/images/house.svg",
    "/images/house-two.svg",
    "/images/models/forest/Tent_Poles_01.obj",
    "/images/models/forest/Tent_Poles_01.mtl",
    "/images/models/forest/Campfire_01.obj",
    "/images/models/forest/Campfire_01.mtl",
    "/images/models/forest/Tree_01.obj",
    "/images/models/forest/Tree_01.mtl",
    "/images/character-2d/leftArm.png",
    "/images/character-2d/legs.png",
    "/images/character-2d/torso.png",
    "/images/character-2d/rightArm.png",
    "/images/character-2d/head.png",
    "/images/character-2d/hair.png",
    "/images/character-2d/leftArm-jump.png",
    "/images/character-2d/legs-jump.png",
    "/images/character-2d/rightArm-jump.png",
];

function addToCache(request, response) {
    if (response.ok) {
        const copy = response.clone()
        caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy)
        });
        return response
    }
}

function fetchFromCache(event) {
    return caches.match(event.request).then(response => {
        if (!response) {
            // A synchronous error that will kick off the catch handler
            throw Error(`${event.request.url} not found in cache`)
        }
        return response
    });
}

function offlineResponse() {
    return new Response('Sorry, the application is offline.')
}

function respondFromNetworkThenCache(event) {
    // Check network first, then cache
    const request = event.request;
    event.respondWith(
        fetch(request)
        .then(response => addToCache(request, response))
        .catch(() => fetchFromCache(event))
        .catch(() => offlineResponse())
    )
}

function respondFromCacheThenNetwork(event) {
    // Check cache first, then network
    const request = event.request;
    event.respondWith(
        fetchFromCache(event)
        .catch(() => fetch(request))
        .then(response => addToCache(request, response))
        .catch(() => offlineResponse())
    )
}

// Open cache and store assets
self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(urlsToCache)
        })
    )
})

self.addEventListener('fetch', (event) => {
    // If HTML check network first, then fallback on cache
    // Else check cache first then network
    // if (event.request.headers.get('Accept').indexOf('text/html') >= 0) {
    //     respondFromNetworkThenCache(event)
    // } else {
    //     respondFromCacheThenNetwork(event)
    // }

    respondFromCacheThenNetwork(event)
})

self.addEventListener('activate', (event) => {
    var cacheWhitelist = [CACHE_NAME]
    // Clean up old cache versions
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            )
        })
    )
})