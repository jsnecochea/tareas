/* Copia íntegra de lo que se reescribió el 2026-10-10 (pedido de Salvador 08:05: «que nada se quede zombi o trabado»).
   Por qué se reemplazó: activaAvisos esperaba navigator.serviceWorker.ready sin tope; llamaServidor no tenía tope;
   cerrarSesion borraba la cola sin subir; vacia() podía subir en paralelo; llamaPush no decía si el servidor confirmó.
   Versión nueva y detalle en CHANGELOG.md (build 318). No se carga en la app. */

/* ---- llamaServidor (01) ---- */
/* igual que fetch(url, op), con la prueba de identidad */
function llamaServidor(url, op){
  op=op||{}; op.headers=op.headers||{};
  function sale(t){
    if(t){ op.headers["Authorization"]="Bearer "+t; tokenAlServiceWorker(t); }
    return fetch(url, op).then(function(r){ revisaSesion(r); return r; });
  }
  var tk=tokenIdentidad();
  return tk ? tk.then(sale) : sale("");
}

/* ---- activaAvisos (01) ---- */
/* pedir permiso + suscribir + mandar la suscripcion a push.php.
   TIENE QUE SALIR DE UN TOQUE del usuario: iOS no deja pedir permiso solo. */
function activaAvisos(cb){
  var e=estadoAvisos();
  if(!e.ok){ cb(false,e.motivo); return }
  Notification.requestPermission().then(function(p){
    if(p!=="granted"){ cb(false,"No diste permiso de avisos."); return }
    navigator.serviceWorker.ready.then(function(reg){
      return reg.pushManager.getSubscription().then(function(sub){
        if(sub) return sub;
        return reg.pushManager.subscribe({
          userVisibleOnly:true,
          applicationServerKey:vapidBytes(VAPID_PUBLIC)
        });
      });
    }).then(function(sub){
      var j=sub.toJSON();
      /* EL TOKEN VA AQUI TAMBIEN. Sin el, push.php contesta 401 y la
         suscripcion nunca quedaba: el telefono se suscribia con el navegador
         pero el servidor jamas la guardaba, asi que los avisos no podian
         llegarle a nadie. Encontrado probando en vivo el 2026-09-04. */
      return llamaServidor(PUSH,{
        method:"POST",
        headers:{"content-type":"application/json","x-app-token":APP_TOKEN},
        body:JSON.stringify({
          usuario:yo||"anonimo",
          subscription:{endpoint:j.endpoint, keys:j.keys}
        })
      });
    }).then(function(r){
      if(r && r.ok) cb(true,"Listo: los avisos llegan a este teléfono.");
      else cb(false,"El teléfono quedó suscrito, pero el servidor no confirmó. Falta instalar push.php.");
    }).catch(function(){
      cb(false,"No se pudo activar. Revisa la señal e inténtalo otra vez.");
    });
  }).catch(function(){ cb(false,"No se pudo pedir el permiso."); });
}


/* ---- cerrarSesion (02) ---- */
/* CERRAR SESIÓN (⋯ del inicio y Tu cuenta). La sesión de Google vive dentro de la app instalada y sobrevive
   a reinstalarla, así que sin este botón nadie podía cambiar de cuenta. Antes de salir se intenta subir lo
   que quedó en la cola de MySQL (con tope, para no colgarse sin red); luego se limpia lo LOCAL de la sesión
   (usuario, cola, motor de prueba, liga pendiente, caché de Firestore) y se recarga en el login. En el
   servidor no se borra nada. */
var SESION_LOCAL=["bit_u","doit_cola_mysql","doit_motor_tareas","bit_alta"];
function cerrarSesion(sinPreguntar){
  if(!sinPreguntar){
    var pend=0; try{ pend=datosTareas.pendientes(); }catch(e){}
    var q="¿Cerrar sesión"+(yo&&PERSONAS[yo]?" de "+PERSONAS[yo].nombre:"")+"?"+
      (pend?"\n\nHay "+pend+" cambio"+(pend===1?"":"s")+" sin subir; se intentará subirlos antes de salir.":"");
    if(!window.confirm(q)) return Promise.resolve(false);
  }
  try{ toast("Cerrando sesión…"); }catch(e){}
  var tope=function(p, ms){ return Promise.race([p, new Promise(function(ok){ setTimeout(ok, ms); })]).catch(function(){}); };
  var sube=Promise.resolve(); try{ sube=tope(datosTareas.vacia(), 4000); }catch(e){}
  return sube.then(function(){
    try{ datosTareas.para(); }catch(e){}
    try{ SESION_LOCAL.forEach(function(k){ localStorage.removeItem(k); }); }catch(e){}
    try{ olvidaLigaTarea(); }catch(e){}
    var fa=null; try{ fa=firebase.auth(); }catch(e){}
    return tope(fa ? fa.signOut() : Promise.resolve(), 4000);
  }).then(function(){
    var fs=null; try{ fs=firebase.firestore(); }catch(e){}
    if(fs && typeof fs.terminate==="function" && typeof fs.clearPersistence==="function")
      return tope(fs.terminate().then(function(){ return fs.clearPersistence(); }), 3000);
  }).then(function(){
    yo=null;
    try{ location.replace(location.pathname); }catch(e){ location.reload(); }
    return true;
  });
}

/* ---- datosTareas.vacia (02) ---- */
  function vacia(){
    var c=leeCola(), ids=Object.keys(c);
    if(!ids.length){ intento=0; return Promise.resolve(true); }
    return ids.reduce(function(p, id){
      return p.then(function(){
        var mandado=c[id]; if(!mandado) return;
        return subeUna(id, entrada(mandado)).then(function(nuevo){
          if(c[id]===mandado){ delete c[id]; grabaCola(); }   /* si cambió mientras subía, se queda la versión nueva */
          if(nuevo){ var b=copia(nuevo); delete b.id; bases[id]=b; }
        });
      });
    }, Promise.resolve()).then(function(){ intento=0; return true; }, function(e){
      programaReintento(); throw e;
    });
  }

/* ---- llamaPush (08) ---- */
function llamaPush(accion, cuerpo){
  if(typeof APP_TOKEN==="undefined" || String(APP_TOKEN).indexOf("__")===0) return;
  try{
    llamaServidor(PUSH+"?action="+accion,{method:"POST", keepalive:true,
      headers:{"content-type":"application/json","x-app-token":APP_TOKEN},
      body:JSON.stringify(cuerpo)})
    .then(function(r){ return r.json().catch(function(){return {}}).then(function(j){
      if(!r.ok || (j&&j.error)) fallaPush(accion+": "+((j&&j.error)||("HTTP "+r.status))); }); })
    .catch(function(e){ fallaPush(accion+": "+((e&&e.message)||"sin red")); });
  }catch(e){ fallaPush(accion+": "+e.message); }
}

