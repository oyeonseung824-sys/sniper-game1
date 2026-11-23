const CACHE = "sniper-v4";
const FILES = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k).then(() => null))))
      .then(() => caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {}))
      .then(() => self.clients.claim())
  );
});

// 인터넷이 되면 최신 파일, 안 되면 저장본. 어떤 경우에도 빈 응답은 반환하지 않음
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === "navigate") {
          const home = await caches.match("./index.html");
          if (home) return home;
        }
        return new Response("오프라인입니다. 인터넷 연결 후 다시 시도하세요.", {
          status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});
