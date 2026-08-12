const CACHE='ihm-v57';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const req=event.request;
  event.respondWith(fetch(req).then(res=>{
    const copy=res.clone();
    caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
    return res;
  }).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
});