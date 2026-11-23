// 이전에 설치된 서비스 워커/캐시를 모두 지우고 스스로 삭제합니다.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (err) {}
    try { await self.registration.unregister(); } catch (err) {}
    try {
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach(c => { try { c.navigate(c.url); } catch (err) {} });
    } catch (err) {}
  })());
});
