const CACHE_NAME = 'trip-app-v2'; // 更新版本號以強制更新
const ASSETS_TO_CACHE = [
  './',              // 重要！快取根目錄
  './index.html',    // 快取主檔案
  './manifest.json', // 快取設定檔
  './icon.png',      // 確保圖示也被快取 (如果您有上傳的話)
  
  // CDN 資源 (必須全部都能正常讀取，否則離線功能會失效)
  'https://cdn.tailwindcss.com?plugins=forms,container-queries',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
];

// 安裝事件：快取所有檔案
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(error => {
        console.error('[Service Worker] Cache failed:', error);
    })
  );
  // 強制立即接管頁面
  self.skipWaiting();
});

// 啟用事件：刪除舊的快取
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // 讓新的 Service Worker 立即控制所有開啟的分頁
  return self.clients.claim();
});

// 抓取事件：網路優先，失敗則讀取快取 (Offline First 策略)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. 如果快取有，直接回傳
      if (response) {
        return response;
      }
      
      // 2. 如果快取沒有，去網路抓
      return fetch(event.request).catch(() => {
        // 3. 如果沒網路也沒快取...
        // 針對 HTML 頁面請求，回傳 index.html (SPA 的 fallback)
        if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
        }
      });
    })
  );
});
