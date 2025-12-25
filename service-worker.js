const CACHE_NAME = 'trip-app-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  // 以下是您程式碼中用到的所有 CDN 資源
  'https://cdn.tailwindcss.com?plugins=forms,container-queries',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// 安裝 Service Worker 並快取資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 攔截網路請求：如果有快取就用快取，沒網路也能跑
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果快取中有，直接回傳
      if (response) {
        return response;
      }
      // 如果沒有，則去網路抓（適用於地圖圖磚等動態資源）
      return fetch(event.request).catch(() => {
        // 如果沒網路且沒快取（例如天氣 API），這裡可以回傳一個空或錯誤，避免 App 當掉
        return new Response("Offline");
      });
    })
  );
});
