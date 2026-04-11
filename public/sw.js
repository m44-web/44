/* ═══════════════════════════════════════
   北海工務店 CRM — Service Worker
   オフラインキャッシュ + 高速起動
   ═══════════════════════════════════════ */
var CACHE_NAME = 'crm-v1';
var STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];
var API_CACHE = 'crm-api-v1';

/* インストール: 静的アセットをプリキャッシュ */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* アクティベート: 古いキャッシュを削除 */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) {
          return n !== CACHE_NAME && n !== API_CACHE;
        }).map(function(n) {
          return caches.delete(n);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* フェッチ: ネットワーク優先、失敗時キャッシュ */
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  /* Supabase API リクエスト */
  if (url.hostname.indexOf('supabase.co') >= 0 && e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request).then(function(res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(API_CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  /* 静的アセット: キャッシュ優先、なければネットワーク */
  if (e.request.method === 'GET') {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) {
          /* バックグラウンドで更新 (stale-while-revalidate) */
          fetch(e.request).then(function(res) {
            if (res.ok) {
              caches.open(CACHE_NAME).then(function(cache) {
                cache.put(e.request, res);
              });
            }
          }).catch(function() {});
          return cached;
        }
        return fetch(e.request).then(function(res) {
          if (res.ok) {
            var clone = res.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(e.request, clone);
            });
          }
          return res;
        });
      })
    );
    return;
  }

  /* POST/PATCH/DELETE はそのまま通す */
  e.respondWith(fetch(e.request));
});
