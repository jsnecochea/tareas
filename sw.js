/* El publicador sustituye __APP_TOKEN__ por el valor real (igual que en index.html); el token nunca va escrito en el repo, que es público. */
const APP_TOKEN_SW = '__APP_TOKEN__';
/* Service worker de Duet. Existe para instalar la PWA y para que la app se
   ACTUALICE SOLA: la navegacion (el index) se pide siempre a la red SIN CACHE,
   asi un cambio publicado llega con solo cerrar y reabrir, sin reinstalar. */

/* build 270 (276): versión del service worker. Cambiar este número cambia los bytes de sw.js, y el navegador instala el SW nuevo
   (skipWaiting + clients.claim abajo) y borra los caches viejos en 'activate'. */
var SW_VERSION = 'build 302';

self.addEventListener('install', function(e){ self.skipWaiting(); });

self.addEventListener('activate', function(e){
  e.waitUntil(Promise.resolve()
    .then(function(){ return self.caches ? caches.keys().then(function(ks){
      return Promise.all(ks.map(function(k){ return caches.delete(k) }));
    }) : null; })
    .then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  /* solo la navegacion (el HTML de la app): red fresca siempre, nunca cache */
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request, {cache:'no-store'}).catch(function(){ return fetch(e.request); })
    );
  }
});

/* ===== build 268: SIN NOTIFICACIONES REPETIDAS =====
   Toda notificación lleva un TAG estable del origen ("q:<tareaId>:<idPregunta>", "acuerdo:<id>", "rec:<tareaId>:<avisoId>") y renotify:false:
   una nueva con el mismo tag REEMPLAZA a la vieja en vez de apilarse. Sin tag en el push, se arma uno con tipo + url + cuerpo.
   Además un registro corto (IndexedDB; si falla, memoria) de los tags de las últimas 24 h: mismo tag + mismo cuerpo = no se vuelve a mostrar.
   OJO iOS: si un push no muestra nada, iOS puede castigar la suscripción; por eso, tras 2 duplicados seguidos del mismo tag, el tercero sí se muestra. */
var REG_MS = 24 * 3600 * 1000, MAX_SALTOS = 2, REG_MEM = {};
function hash268(s) { var h = 5381; s = String(s || ''); for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); }
function tagDe268(payload, data) {
  var t = (payload && payload.tag) || (data && data.tag);
  if (t) return String(t).slice(0, 200);
  var tipo = (payload && payload.tipo) || (data && data.tipo) || '';
  var url = (data && (data.url || data.tag_url)) || (payload && payload.url) || '';
  return 'p:' + tipo + '|' + url + '|' + hash268((payload && payload.body) || '');
}
function idb268() {
  return new Promise(function (ok, no) {
    try {
      var r = indexedDB.open('doit-push-268', 1);
      r.onupgradeneeded = function () { try { r.result.createObjectStore('tags', { keyPath: 'tag' }); } catch (e) {} };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { no(r.error); };
    } catch (e) { no(e); }
  });
}
function lee268(tag) {
  return idb268().then(function (db) { return new Promise(function (ok) {
    try { var q = db.transaction('tags', 'readonly').objectStore('tags').get(tag); q.onsuccess = function () { ok(q.result || null); }; q.onerror = function () { ok(REG_MEM[tag] || null); }; } catch (e) { ok(REG_MEM[tag] || null); } }); })
    .catch(function () { return REG_MEM[tag] || null; });
}
function guarda268(rec) {
  REG_MEM[rec.tag] = rec;
  return idb268().then(function (db) { return new Promise(function (ok) {
    try {
      var tx = db.transaction('tags', 'readwrite'), st = tx.objectStore('tags'); st.put(rec);
      var cr = st.openCursor(); cr.onsuccess = function () { var c = cr.result; if (!c) return; if (Date.now() - (c.value.ts || 0) > REG_MS) c.delete(); c.continue(); };
      tx.oncomplete = function () { ok(); }; tx.onerror = function () { ok(); };
    } catch (e) { ok(); } }); }).catch(function () {});
}
/* true = mostrar; false = duplicado (mismo tag y mismo cuerpo en 24 h) */
function debeMostrar268(tag, body) {
  return lee268(tag).then(function (r) {
    var ahora = Date.now();
    if (r && ahora - (r.ts || 0) < REG_MS && r.body === body && (r.saltos || 0) < MAX_SALTOS) {
      r.saltos = (r.saltos || 0) + 1; return guarda268(r).then(function () { return false; });
    }
    return guarda268({ tag: tag, body: body, ts: ahora, saltos: 0 }).then(function () { return true; });
  }).catch(function () { return true; });
}

self.addEventListener('push', function(event) {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (err) {
    payload = { title: 'Recordatorio', body: event.data.text() };
  }

  const data268 = payload.data || {};
  const tag268 = tagDe268(payload, data268);
  data268.tag = tag268;
  const options = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/badge.png',
    data: data268,
    tag: tag268,
    renotify: false
  };

  // Botones: si el SERVIDOR los manda en el payload (payload.actions) se usan
  // esos; si no, los tres de siempre. Solo se adjuntan donde el navegador los
  // soporta — iOS NO soporta botones en web push, y el guard evita cualquier
  // riesgo de que la notificacion no se muestre. Salvador/Josué 2026-09-17.
  var actions = payload.actions;
  if (!actions || !actions.length) {
    actions = [
      { action: 'del', title: '🗑️ Eliminar' },
      { action: 'snooze', title: '⏰ 1 h' },
      { action: 'mic', title: '🎙️ Hablar' }
    ];
  }
  if ('actions' in Notification.prototype) {
    options.actions = actions;
  }

  event.waitUntil(
    debeMostrar268(tag268, options.body).then(function (mostrar) {
      if (!mostrar) return null;
      return self.registration.showNotification(payload.title || 'Recordatorio', options);
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();
  /* build 268: al tocar una, se cierran las demás con el mismo tag */
  try { if (notification.tag) event.waitUntil(self.registration.getNotifications({ tag: notification.tag }).then(function (L) { L.forEach(function (n) { try { n.close(); } catch (e) {} }); }).catch(function () {})); } catch (e) {}

  if (action === 'del') {
    event.waitUntil(
      fetch(`/push.php?action=recordatorio_del&id=${data.id}&aviso_ts=${data.aviso_ts || ''}`, {
        method: 'POST',
        headers: { 'x-app-token': APP_TOKEN_SW }
      })
    );
  } else if (action === 'snooze') {
    event.waitUntil(
      fetch(`/push.php?action=recordatorio_snooze&id=${data.id}&aviso_ts=${data.aviso_ts || ''}`, {
        method: 'POST',
        headers: { 'x-app-token': APP_TOKEN_SW }
      })
    );
  } else {
    // Acción 'mic' o clic directo sobre la notificación: ABRE LA APP
    // build 164 (Salvador 2026-10-02): la notificacion de WhatsApp abria OTRA tarea.
    // Sin id, la app "adivinaba" la unica tarea con novedades (abre_ultimo) y esa
    // no era la del mensaje. Ahora: se busca el id en todos los nombres que puede
    // traer el servidor; si no viene ninguno, se abre el INICIO, nunca se adivina.
    const tid = String(data.id || data.tarea_id || data.tareaId || data.tarea || '');
    // build 172 (Salvador 2026-10-02 18:18): sin id, la app solo abria la tarea si UNA
    // sola tenia novedades; con 2+ se iba al inicio. Ahora la liga lleva el titulo y el
    // texto de la notificacion para que la app busque el mensaje exacto que acaba de llegar.
    let deepLink;
    if (tid) deepLink = data.url || `https://doit.ok-doit.com/?recordatorio=${tid}&action=mic`;
    else {
      let u;
      try { u = new URL(data.url || 'https://doit.ok-doit.com/'); } catch (e) { u = new URL('https://doit.ok-doit.com/'); }
      u.searchParams.set('ultimo', '1');
      u.searchParams.set('n_t', String(notification.title || '').slice(0, 120));
      u.searchParams.set('n_b', String(notification.body || '').slice(0, 300));
      deepLink = u.toString();
    }
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          if (client.url.includes('doit.ok-doit.com') && 'focus' in client) {
            // build 142: si la notificacion es de una tarea/alarma, la app ya
            // abierta abre ESA tarea (postMessage); si es general, al home.
            // build 164: con la app YA abierta, el aviso por postMessage (build 142) se
            // perdia cuando iOS tenia la app dormida: solo se enfocaba y quedaba la
            // ultima tarea vista (la equivocada). Cerrar y abrir si funcionaba porque
            // entraba por la URL. Ahora SIEMPRE entra por la URL (navigate), igual
            // que en frio; postMessage queda solo de respaldo si navigate falla.
            if (tid) {
              return client.focus().then(function(c){ return (c||client).navigate(deepLink); })
                .catch(function(){ client.postMessage({ tipo: 'abre', id: tid }); return client.focus(); });
            }
            return client.focus().then(function(c){ return (c||client).navigate(deepLink); })
              .catch(function(){ client.postMessage({ tipo: 'abre_pista', t: notification.title || '', b: notification.body || '' }); return client.focus(); });
          }
        }
        if (clients.openWindow) return clients.openWindow(deepLink);
      })
    );
  }
});
