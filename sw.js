/* Service worker de Duet. Existe para instalar la PWA y para que la app se
   ACTUALICE SOLA: la navegacion (el index) se pide siempre a la red SIN CACHE,
   asi un cambio publicado llega con solo cerrar y reabrir, sin reinstalar. */

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

self.addEventListener('push', function(event) {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (err) {
    payload = { title: 'Recordatorio', body: event.data.text() };
  }

  const options = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/badge.png',
    data: payload.data || {}
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
    self.registration.showNotification(payload.title || 'Recordatorio', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (action === 'del') {
    event.waitUntil(
      fetch(`/push.php?action=recordatorio_del&id=${data.id}&aviso_ts=${data.aviso_ts || ''}`, {
        method: 'POST',
        headers: { 'x-app-token': '57a921847b942349c0f6d6d187658edb6c9991b313adb010036554e81bc4af19' }
      })
    );
  } else if (action === 'snooze') {
    event.waitUntil(
      fetch(`/push.php?action=recordatorio_snooze&id=${data.id}&aviso_ts=${data.aviso_ts || ''}`, {
        method: 'POST',
        headers: { 'x-app-token': '57a921847b942349c0f6d6d187658edb6c9991b313adb010036554e81bc4af19' }
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
