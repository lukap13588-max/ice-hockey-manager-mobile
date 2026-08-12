const CACHE='ihm-current-v62';
const STATIC=['./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];

self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;

  // HTML navigations: ALWAYS try latest network version first, never trust old HTML cache.
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .then(r=>{
          const copy=r.clone();
          caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{});
          return r;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  // sw.js itself should never be served stale.
  if(new URL(e.request.url).pathname.endsWith('/sw.js')){
    e.respondWith(fetch(e.request,{cache:'no-store'}));
    return;
  }

  // Other assets: network first, cache as offline fallback.
  e.respondWith(
    fetch(e.request,{cache:'no-cache'})
      .then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        return r;
      })
      .catch(()=>caches.match(e.request))
  );
});
