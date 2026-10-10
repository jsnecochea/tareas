function fechaCorta(ts){
  if(!ts)return"";
  var d=new Date(ts);
  return d.getDate()+" "+["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][d.getMonth()]+" · "+hhmm(d);
}
/* ---- cuántos adjuntos ya vio esta persona de esta tarea ---- */
function vistos(id){
  try{ return +(localStorage.getItem("bit_vis_"+yo+"_"+id)||0) }catch(e){ return 0 }
}
function marcaVistos(id,n){
  try{ localStorage.setItem("bit_vis_"+yo+"_"+id,n) }catch(e){}
}
function nuevos(t){ return Math.max(0, adjuntos(t).length - vistos(t.id)) }

/* NOVEDADES SIN VER = fotos/evidencia + MENSAJES entrantes (los "bo", de otra
   persona; los del sistema "bi"/"bal" no cuentan como mensaje). Alimenta el badge
   y el renglon verde "Tienes mensajes sin leer". Se marca visto al abrir el hilo.
   Corregido 2026-09-04: antes solo contaba fotos, por eso un comentario de texto
   no prendia nada. */
function _corto(x){ x=String(x||"").replace(/\s+/g," ").trim(); return x.length>70 ? x.slice(0,70)+"…" : x; }
function msgsEntrantes(t){
  /* build 152 (Salvador 2026-09-29): lo que llega por WhatsApp (wa_respuesta del
     servidor o del trabajador) se guardaba como "bi" y NUNCA prendia el renglon verde
     ni el badge. Ahora tambien cuenta todo mensaje marcado wa_in:1 (entrante de WhatsApp). */
  return ((t.msgs||[]).filter(function(m){ return m.k==="bo" || m.wa_in===1 })).length;
}
function novedadesTot(t){ return adjuntos(t).length + msgsEntrantes(t); }
function vistosNov(id){
  try{ return +(localStorage.getItem("bit_nov_"+yo+"_"+id)||0) }catch(e){ return 0 }
}
function marcaVistosNov(id,n){
  try{ localStorage.setItem("bit_nov_"+yo+"_"+id,n) }catch(e){}
}
/* build 172 (Salvador 2026-10-02 18:18): la notificacion sin id trae su titulo y texto.
   Se busca la tarea cuyo mensaje coincide con ese texto (el mas reciente gana); si no,
   la tarea con novedades cuyo nombre o remitente coincide con el titulo. Nunca al azar. */
function tareaDePista(p){
  var N=function(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9ñ ]+/g," ").replace(/\s+/g," ").trim(); };
  var tit=N(p&&p.t), bod=N(p&&p.b);
  /* "Karina: hola" -> nombre y texto por separado */
  var m2=String((p&&p.b)||"").match(/^\s*([^:]{2,40}):\s*(.+)$/);
  var bodTxt=m2?N(m2[2]):bod, bodDe=m2?N(m2[1]):"";
  var abiertas=tareas.filter(function(t){ return !t.es_recordatorio && estadoReal(t)!=="cerrada"; });
  var mejor=null, mejorTs=0;
  if(bodTxt.length>=4){
    var clave=bodTxt.slice(0,60);
    abiertas.forEach(function(t){ (t.msgs||[]).forEach(function(m){
      var mt=N(m.t); if(!mt) return;
      if((mt.indexOf(clave)>=0 || (mt.length>=8 && bodTxt.indexOf(mt.slice(0,60))>=0)) && (m.ts||0)>=mejorTs){ mejor=t; mejorTs=m.ts||0; }
    }); });
    if(mejor) return mejor;
  }
  var quien=[tit,bodDe].filter(function(x){ return x && x.length>=3; });
  var cand=abiertas.filter(function(t){
    var nom=N(t.nombre)+" "+N(t.contacto||t.wa_nombre||"");
    var ult=(t.msgs||[]).filter(function(m){ return m.k==="bo"||m.wa_in===1; }).slice(-1)[0]||{};
    var de=N(ult.de||ult.nombre||"");
    return quien.some(function(q){ return q.split(" ").some(function(w){ return w.length>=4 && (nom.indexOf(w)>=0 || de.indexOf(w)>=0); }); });
  });
  if(cand.length>1){ var conNov=cand.filter(function(t){ return nuevosNov(t)>0; }); if(conNov.length) cand=conNov; }
  cand.sort(function(a,b){ return (((b.msgs||[]).slice(-1)[0]||{}).ts||0)-(((a.msgs||[]).slice(-1)[0]||{}).ts||0); });
  return cand[0]||null;
}
/* la tarea con lo mas reciente sin ver (mensajes de otros); null si no hay */
function abreUltimoNuevo(){
  var c=tareas.filter(function(t){ return !t.es_recordatorio && estadoReal(t)!=="cerrada" && nuevosNov(t)>0 });
  c.sort(function(a,b){
    var ma=(a.msgs||[]).slice(-1)[0]||{}, mb=(b.msgs||[]).slice(-1)[0]||{};
    return (mb.ts||0)-(ma.ts||0); });
  return c.length===1?c[0]:null;   /* exacto o nada: con 2+ no se adivina */
}
function nuevosNov(t){ return Math.max(0, novedadesTot(t) - vistosNov(t.id)) }

function abreVisor(lista,i){
  if(abierta){ var _tv=tareas.filter(function(x){return x.id===abierta})[0]; marcaVistos(abierta, Math.max(lista.length, _tv?adjuntos(_tv).length:0)); }
  visorList=lista; visorI=i;
  var v=$("visor"); v.classList.add("on"); pintaVisor();
}
function pintaVisor(){
  /* build 183 (Salvador 22:09): la foto dejaba la pantalla negra sin salida: fechaCorta recibia un
     numero y tronaba ANTES de pintar el boton Cerrar. Ahora: fecha segura, X fija arriba, tocar el
     fondo cierra, y sin coordenadas. */
  var v=$("visor"), f=visorList[visorI]; if(!f){v.classList.remove("on");return}
  var _fd=""; try{ _fd=fechaCorta(new Date(f.ts||Date.now())); }catch(e){ _fd=""; }
  v.innerHTML='<button class="vx" id="vx" aria-label="Cerrar">×</button><img src="'+esc(f.data||f.url||"")+'" alt="adjunto">'+
    '<div class="info">'+esc(f.de||"")+(_fd?' · '+esc(_fd):'')+(visorList.length>1?'<br>'+(visorI+1)+' de '+visorList.length:'')+'</div>'+
    '<div class="nav">'+(visorI>0?'<button id="vprev">‹ Anterior</button>':'')+
    '<button id="vclose">Cerrar</button>'+
    (visorI<visorList.length-1?'<button id="vnext">Siguiente ›</button>':'')+'</div>';
  var p=$("vprev"),n=$("vnext");
  if(p)p.onclick=function(){visorI--;pintaVisor()};
  if(n)n.onclick=function(){visorI++;pintaVisor()};
  $("vclose").onclick=function(){$("visor").classList.remove("on")};
  $("vx").onclick=function(){$("visor").classList.remove("on")};
  v.onclick=function(ev){ if(ev.target===v) v.classList.remove("on"); };
}

function $(id){return document.getElementById(id)}

/* ===== LA CAJA DE ESCRIBIR (contenteditable) SE COMPORTA COMO UN INPUT =====
   Salvador, 2026-09-04. Se cambiaron el <input> de la barra y los <textarea>
   del hilo por divs editables, para que el teclado de iPhone traiga el
   AUTOCORRECTOR y para que se vaya la franja de las flechitas < > (esa la
   pone Safari sola encima del teclado cuando lo enfocado es un control de
   formulario; no se quita con CSS ni con JS, solo dejando de usar uno).

   Para no tener que tocar las veinte partes del codigo que ya decian
   caja.value, aqui se le cuelga un .value de mentiras que lee y escribe el
   texto de adentro. Asi el dictado, el Enter, el borrar al mandar y el
   crecer de alto siguen funcionando exactamente igual que antes. */
function cajaEditable(el){
  if(!el || el.__caja) return el;
  el.__caja=true;
  function vacia(){ el.classList.toggle("vacia", !el.textContent.trim()) }
  Object.defineProperty(el,"value",{
    configurable:true,
    get:function(){ return (el.innerText||"").replace(/\u00a0/g," ") },
    set:function(v){ el.textContent=(v==null?"":String(v)); vacia() }
  });
  el.addEventListener("input", vacia);
  /* LO PEGADO ENTRA COMO TEXTO PELON. Si no, se cuela el formato (negritas,
     colores, ligas) de donde lo hayan copiado y la barra se descompone. */
  el.addEventListener("paste", function(ev){
    ev.preventDefault();
    var t=(((ev.clipboardData||window.clipboardData).getData("text/plain"))||"")
          .replace(/\s+/g," ");
    try{ document.execCommand("insertText", false, t) }
    catch(e){ el.textContent=el.textContent+t; vacia() }
  });
  vacia();
  return el;
}
/* deja el cursor al final: lo usa el dictado, que va escribiendo solo */
/* prende o apaga el latido de la flecha de enviar */
function avisaPendiente(idBoton, texto){
  var b=$(idBoton); if(!b) return;
  if(String(texto||"").trim()) b.classList.add("pendiente");
  else b.classList.remove("pendiente");
}
function marcaEnvio(idBoton, texto){
  var b=$(idBoton); if(!b) return;
  /* WhatsApp: un SOLO botón a la derecha. Vacío -> micrófono; con texto -> flecha
     verde. Mientras se dicta (oyendo) SIEMPRE el micrófono, para poder pararlo. */
  var hay=!!String(texto||"").trim() && !window.__oyendo;
  b.classList.toggle("listo", hay);
  var mic=$(idBoton.replace("env","mic"));
  if(mic) mic.classList.toggle("oculto", hay);
}
function alFinalDeLaCaja(el){
  if(!el) return;
  try{
    var r=document.createRange(); r.selectNodeContents(el); r.collapse(false);
    var s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }catch(e){}
}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
/* HOY, EN LA HORA DE AQUI. Antes usaba toISOString(), que es UTC: en Torreon
   (GMT-6) despues de las 6 de la tarde la app ya creia que era el dia siguiente
   y todo lo dictado en la noche se iba con la fecha de mañana. 2026-09-04. */
function hoy(){
  var d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+
         String(d.getDate()).padStart(2,"0");
}
var DIAS_SEM=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
/* El calendario que se le pasa a Claude. Antes solo iba "hoy: 2026-09-04" y el
   tenia que sacar solo que dia de la semana era: fallaba casi siempre y "el
   lunes" caia en martes. Ahora se le da la tabla hecha. */
function calendarioProximo(n){
  var d=new Date(), out=[];
  for(var i=0;i<n;i++){
    var x=new Date(d.getFullYear(), d.getMonth(), d.getDate()+i);
    var iso=x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+
            String(x.getDate()).padStart(2,"0");
    out.push(iso+" "+DIAS_SEM[x.getDay()]+(i===0?" (HOY)":(i===1?" (MAÑANA)":"")));
  }
  return out;
}
function hhmm(d){d=d||new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}
function toast(t){var e=$("toast");e.textContent=t;e.classList.add("on");setTimeout(function(){e.classList.remove("on")},2200)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

/* ============ ENTRADA — CON GOOGLE (build 72) ============
   DECISION DE SALVADOR (2026-09-16): mueren el NIP y la liga ?u= como puerta.
   La PWA instalada arrancaba con almacenamiento separado de Safari y el
   telefono borraba al usuario (probado en dos telefonos el 09-11); ademas el
   NIP dejaba abierto como evitar que alguien re-eligiera el de otro. Ahora la
   identidad la valida GOOGLE y la sesion vive DENTRO de la app instalada: se
   entra una vez por telefono. La puerta la abre la LISTA DE CORREOS dados de
   alta (bitacora_accesos, o el correo que ya vive en una ficha) — la liga de
   la app se puede reenviar mil veces y no abre nada. */
var COLACC="bitacora_accesos";      // (modelo viejo, ya no se usa como puerta)
var COLBLOQ="bitacora_bloqueados";   // correos a los que se les quito el acceso
var COLI="bitacora_invitaciones";    // ligas de un solo uso (build 77)
/* los dos de siembra: la puerta les abre aunque la base llegara vacia */
var CORREOS_SEMILLA={ "jsnecochea@gruponec.com.mx":"salvador",
                      "jescamilla@gruponec.com.mx":"josue" };
/* quienes pueden DAR de alta correos (decision 2026-09-16: Salvador y Josue) */
var PUEDE_ALTA={salvador:true,josue:true};

function fbListo(){
  if(firebase.apps.length) return;
  firebase.initializeApp(FB);
  /* build 136: cache local de Firestore. Cada telefono guarda las tareas en
     disco y al abrir pinta desde ahi; solo baja lo que cambio (menos lecturas
     cobradas) y lo que se guarda sin red se encola y sube solo. Si el navegador
     no lo soporta o hay otra pestana vieja, sigue como antes, sin cache. */
  try{ firebase.firestore().enablePersistence({synchronizeTabs:true})
       .catch(function(e){ try{ console.warn("sin cache local", e&&e.code) }catch(_e){} }); }
  catch(e){}
}
/* build 73 (diseno pedido por Salvador 2026-09-16): en el gate manda el LOGO.
   El "Doit" en letras y el subtitulo sobraban — el logo ya lo dice. gname se
   esconde siempre; gtxt solo sale cuando la pantalla necesita decir algo. */
function gTitulos(txt){
  var n=$("gname"); if(n) n.style.display="none";
  var t=$("gtxt"); if(!t) return;
  if(txt){ t.style.display=""; t.textContent=txt } else t.style.display="none";
}
/* la G oficial de Google, la de "Sign in with Google" que usan todas las apps */
var G_LOGO='<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">'+
 '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>'+
 '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>'+
 '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>'+
 '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>' 
function gz(html){ var z=$("gzona"); if(z) z.innerHTML=html }
function gErr(t){ var e=$("gerr"); if(e) e.textContent=t||"" }

function pintaLogin(err){
  /* si el servidor dio la sesión por vencida, el aviso sobrevive a la recarga y sale aquí una vez */
  if(!err){ try{ err=sessionStorage.getItem("doit_msg_login")||""; sessionStorage.removeItem("doit_msg_login"); }catch(e){} }
  $("gate").classList.add("on");
  gTitulos(null);
  gz('<button class="gbtn" id="bgoogle" style="margin-top:52px">'+G_LOGO+'<span>Entrar con Google</span></button>');
  gErr(err||"");
  $("bgoogle").onclick=function(){ gErr(""); loginGoogle() };
}
function pintaEspera(t){
  $("gate").classList.add("on");
  gTitulos(null);
  gz('<p>'+(t||"Un momento…")+'</p>'); gErr("");
}
function pintaSinLiga(mail){
  $("gate").classList.add("on");
  gTitulos("Este correo no está autorizado");
  gz('<div class="gcol"><div class="gcard"><div class="gcx"><div class="tt">'+esc(mail)+'</div>'+
     '<div class="dd">Pide que te manden una liga de invitación para entrar.</div></div></div>'+
     '<button class="gbtn wide" id="botro">Probar con otra cuenta</button></div>');
  gErr("");
  $("botro").onclick=function(){
    firebase.auth().signOut().then(function(){ pintaLogin() }).catch(function(){ pintaLogin() });
  };
}
function pintaBloqueado(mail){
  $("gate").classList.add("on");
  gTitulos("No tienes acceso a esta app");
  gz('<div class="gcol"><div class="gcard"><div class="gcx"><div class="tt">'+esc(mail)+'</div>'+
     '<div class="dd">Si crees que es un error, avísale a Salvador.</div></div></div>'+
     '<button class="gbtn wide" id="botro">Probar con otra cuenta</button></div>');
  gErr("");
  $("botro").onclick=function(){
    firebase.auth().signOut().then(function(){ pintaLogin() })
      .catch(function(){ pintaLogin() });
  };
}
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
/* LA MAÑA DE IPHONE: dentro de la app instalada, el camino por redirect es
   el que Safari rompe (particiona el almacenamiento del dominio de auth).
   Por eso el camino PRINCIPAL es el popup en todos lados, y el redirect
   queda solo de respaldo si el popup sale bloqueado. Se prueba en el iPhone
   de Salvador antes de que lo vea nadie mas. */
function loginGoogle(){
  fbListo();
  var pr=new firebase.auth.GoogleAuthProvider();
  pr.setCustomParameters({prompt:"select_account"});
  pintaEspera("Abriendo Google…");
  firebase.auth().signInWithPopup(pr).catch(function(e){
    var c=(e&&e.code)||"";
    if(c==="auth/popup-blocked"){
      firebase.auth().signInWithRedirect(pr).catch(function(){
        pintaLogin("No se pudo abrir Google. Intenta otra vez.") });
    } else if(c==="auth/popup-closed-by-user"||c==="auth/cancelled-popup-request"){
      pintaLogin();
    } else {
      pintaLogin("No se pudo entrar. Revisa la señal e intenta otra vez.");
    }
  });
}
/* MODELO ABIERTO (Salvador 2026-09-16): la liga es la llave. Cualquiera que la
   abra y entre con Google queda dado de alta SOLO, con su propio correo y su
   nombre de Google. El control es reactivo: Salvador y Josue ven la lista de
   quien entro y quitan a quien no debia (lo manda a bitacora_bloqueados).
   ¿quien es este correo? 1) siembra  2) una ficha que ya lo tiene  3) NUEVO. */
function buscaAcceso(mail,displayName,cb,err){
  if(CORREOS_SEMILLA[mail]){ cb({clave:CORREOS_SEMILLA[mail],seed:true}); return }
  var fb=firebase.firestore();
  fb.collection(COLP).where("mail_trabajo","==",mail).limit(1).get().then(function(q){
    if(q.size){ cb({clave:q.docs[0].id}); return }
    fb.collection(COLP).where("mail_personal","==",mail).limit(1).get().then(function(q2){
      if(q2.size){ cb({clave:q2.docs[0].id}); return }
      cb({clave:claveDe(displayName||mail.split("@")[0]), nombre:displayName||"", nuevo:true});
    }).catch(err);
  }).catch(err);
}
/* mete al usuario ya resuelto: pega su correo/nombre la primera vez y entra */
function entraCon(acc, mail){
  var clave=acc.clave, fb=firebase.firestore();
  if(!PERSONAS[clave]) PERSONAS[clave]={nombre:acc.nombre||clave,ini:"?",jefe:false};
  try{ localStorage.setItem("bit_u",clave) }catch(e){}
  fb.collection(COLP).doc(clave).get().then(function(d){
    var f=d.exists?(d.data()||{}):{}, pon={};
    if(!f.mail_trabajo && !f.mail_personal)
      pon[/@gruponec\.com\.mx$/.test(mail)?"mail_trabajo":"mail_personal"]=mail;
    if(!f.nombre && acc.nombre) pon.nombre=acc.nombre;
    if(!f.entro) pon.entro=Date.now();
    if(Object.keys(pon).length) fb.collection(COLP).doc(clave).set(pon,{merge:true}).catch(function(){});
  }).catch(function(){});
  yo=clave;
  pasoAvisos(function(){ entrar(clave) });
}
function resuelveAcceso(user){
  pintaEspera("Un momento…");
  var mail=String(user.email||"").toLowerCase().trim();
  if(!mail){ pintaLogin("Tu cuenta de Google no trajo correo."); return }
  var fb=firebase.firestore();
  /* los de siembra nunca se pueden bloquear (si no, un error deja fuera al jefe) */
  var revisa = CORREOS_SEMILLA[mail]
    ? Promise.resolve(false)
    : fb.collection(COLBLOQ).doc(mail).get().then(function(d){ return d.exists });
  revisa.then(function(bloqueado){
    if(bloqueado){ pintaBloqueado(mail); return; }
    buscaAcceso(mail, user.displayName||"", function(acc){
      /* un correo NUEVO solo entra con una liga valida y sin usar, que se quema
         al entrar. El que ya tiene ficha (o es de siembra) no necesita liga. */
      if(acc.nuevo){
        consumeLiga(mail, function(ok){
          if(!ok){ pintaSinLiga(mail); return }
          entraCon(acc, mail);
        });
      } else {
        entraCon(acc, mail);
      }
    }, function(){
      pintaLogin("No se pudo entrar. Revisa la señal e intenta otra vez.");
    });
  }).catch(function(){
    pintaLogin("No se pudo entrar. Revisa la señal e intenta otra vez.");
  });
}
/* EL PASO DE AVISOS EN EL ALTA (PENDIENTE 2026-09-10): activado por defecto,
   con su apagador visible. A quien ya los tiene no se le molesta; en iPhone
   sin instalar no se puede pedir y se brinca sin regañar; y solo se ofrece
   una vez por telefono — despues queda el boton de "Tu cuenta". */
function pasoAvisos(cont){
  var e=estadoAvisos(), visto=null;
  try{ visto=localStorage.getItem("bit_avisos_visto_"+yo) }catch(x){}
  if(!e.ok || e.ya || visto){ cont(); return }
  $("gate").classList.add("on");
  gTitulos(null);
  /* build 74 (decision de Salvador 2026-09-16): sin apagador. Un solo toque;
     el que no quiera avisos pica "No permitir" en el dialogo de Apple, y
     despues queda "Tu cuenta". Apple exige el toque y su dialogo: ninguna
     app puede prenderse los avisos sola. */
  gz('<div class="gcol" style="margin-top:36px">'+
     '<div class="gcard"><div class="gcx" style="text-align:center"><div class="tt">Avisos al celular</div></div></div>'+
     '<button class="gbtn wide" id="bsigue">Entrar</button>'+
     '</div>');
  gErr("");
  $("bsigue").onclick=function(){
    try{ localStorage.setItem("bit_avisos_visto_"+yo,"1") }catch(x){}
    this.disabled=true; this.textContent="Entrando…";
    activaAvisos(function(ok,m){ cont(); if(m) toast(m) });
  };
}
function entrar(u){ yo=u; $("gate").classList.remove("on"); $("app").style.display="flex"; arranca();
  /* Salvador 2026-09-22: re-mandar la suscripcion push al servidor en cada
     arranque, por si se reinstalo la app y el servidor la perdio. Silencioso. */
  setTimeout(function(){ resincronizaAvisos(); }, 2500);
  /* y los avisos que nunca llegaron al servidor nuevo (2026-09-23) */
  setTimeout(function(){ try{ subeAvisosPendientes(); }catch(e){} }, 9000);
  setTimeout(function(){ try{ limpiaWABasura(); }catch(e){} }, 11000);
  /* build 136: le dice al servidor que este usuario acaba de ver la app, para
     que no le repita por push lo que ya vio (Carlos: nunca se llamaba visto) */
  setTimeout(function(){ try{ avisaVisto(); }catch(e){} }, 1500); }
/* build 139: CANDADO DE PRIVACIDAD. true = hay que confirmar antes de mandar:
   el texto trae dinero/cifras o nombra a otro contacto ligado a la tarea. */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function waCandado(texto, contacto, t){
  var s=String(texto||"");
  if(/\$\s*\d|\b\d{1,3}(,\d{3})+\b|\b\d{4,}\b|\b\d+\s*(mil|k|pesos|usd|dlls?|d[oó]lares)\b|\bpresupuest|\bcotizaci/i.test(s)) return true;
  var otros=((t&&t.wa_contactos)||[]).map(function(c){ return String(c.nombre||c) })
    .filter(function(n){ return n.toLowerCase()!==String(contacto||"").toLowerCase() });
  var low=s.toLowerCase();
  return otros.some(function(n){ var p=n.toLowerCase().split(/\s+/)[0]; return p.length>2 && low.indexOf(p)>=0; });
}
/* build 139: manda el WhatsApp SIN confirmar. Se deja en la cola del servidor
   al instante (si cierras la app no se pierde) y el cintillo de Deshacer 5 s
   lo cancela en el servidor (wa_marca cerrado) antes de que Claude lo mande. */
function enviaWhatsAppYa(b){
  var wp=b.pendiente.whatsapp;
  var t=wp.tareaId ? tareas.filter(function(x){ return x.id===wp.tareaId })[0] : null;
  if(!t && wp.nueva) t=creaTarea({nombre:wp.nueva, duenio:yo, dicho:b.dicho||wp.nueva});
  if(!t){ toast("No encontré la tarea para ese WhatsApp"); return; }
  /* build 199: programado (con hora y/o "si no contesta"): se deja en la cola con etiquetas y burbuja con reloj */
  if(wp.programa){ var _pg=Object.assign({}, wp.programa, {contacto:contactoDeTarea(t, wp.contacto)});
    mandaProgramado(t, _pg, null);
    barraEstado=null; consulta=""; fotoEnMano=null; abierta=t.id; vista="hilo"; render(); return; }
  t.wa_contactos=t.wa_contactos||[];
  if(!t.wa_contactos.some(function(c){ return String(c.nombre||c).toLowerCase()===String(wp.contacto).toLowerCase() }))
    t.wa_contactos.push({nombre:wp.contacto, desde:Date.now()});
  var _canal=wp.canal||"whatsapp";
  var _et=_canal==="correo"?"Correo":(_canal==="archivo"?"Archivo":"WhatsApp");
  var _txPed=wp.texto;
  if(_canal==="correo") _txPed="[CORREO] asunto: "+(wp.asunto||"(sin asunto)")+" | mensaje: "+wp.texto;
  else if(_canal==="archivo") _txPed="[ARCHIVO] archivo: "+(wp.archivo||wp.texto)+(wp.texto&&wp.texto!==wp.archivo?" | nota: "+wp.texto:"");
  /* build 150 (Salvador 2026-09-29): DOBLE VIDA. Si el contacto es del equipo con
     app (PERSONAS), ademas del WhatsApp/correo le queda una tarea ESPEJO suya con
     el mensaje en su app (badge + push). El pedido va ligado al espejo: su
     respuesta por WhatsApp, o escrita en la app, cae en ese mismo hilo, y a ti
     (creada_por) te aparece en "mensajes sin leer". */
  var _tid=t.id, _esp=null;
  try{
    var _kp=Object.keys(PERSONAS).filter(function(k){ return k!==yo && String(PERSONAS[k].nombre||"").toLowerCase()===String(wp.contacto).toLowerCase() })[0];
    if(_kp){
      t.espejos=t.espejos||{};
      _esp=t.espejos[_kp]?tareas.filter(function(x){ return x.id===t.espejos[_kp] })[0]:null;
      var _txE=PERSONAS[yo].nombre+": "+(_canal==="archivo"?("te comparto el archivo “"+(wp.archivo||wp.texto)+"”"):wp.texto);
      if(!_esp){
        _esp=creaTarea({nombre:t.nombre, duenio:_kp, dicho:wp.texto});
        _esp.msgs=[]; _esp.espejo_de=t.id; t.espejos[_kp]=_esp.id;
      } else disparaPushInstantaneo(_kp,"Nuevo mensaje",_txE,urlTarea(_esp.id));
      msg(_esp,"bo",_txE); _esp.ultima=_txE; guarda(_esp);
      _tid=_esp.id;
    }
  }catch(e){ console.warn("espejo",e); }
  msg(t,"bi","→ "+_et+" a "+wp.contacto+(_esp?" (y en su app)":"")+": “"+_corto(_canal==="archivo"?(wp.archivo||wp.texto):wp.texto)+"” · en cola");
  var _m=t.msgs[t.msgs.length-1]; _m.wa=1; _m.wa_c=wp.contacto;
  if(b.foto) pegaFotoA(t,b.foto);
  t.ultima="→ "+wp.contacto+": "+wp.texto; guarda(t);
  var _estado={id:null, cancelado:false};
  pideWhatsApp({usuario:yo, tarea_id:_tid, contacto:wp.contacto, texto:conIA(_txPed)})
    .then(function(j){ _estado.id=(j&&(j.id||j.pedido_id))||null;
      if(_estado.id && !_estado.cancelado){ _m.wa_pid=_estado.id; guarda(t); }
      if(_estado.cancelado && _estado.id) llamaPush("wa_marca",{id:_estado.id, estado:"cerrado"}); })
    .catch(function(e){
      msg(t,"bi","No se pudo dejar el WhatsApp en el servidor ("+String((e&&e.message)||e).slice(0,60)+"). Díctalo otra vez.");
      guarda(t); toast("No se pudo dejar el WhatsApp en el servidor"); if(vista==="hilo") render(); });
  if(wp.archivo2){
    msg(t,"bi","→ Archivo a "+wp.contacto+": “"+wp.archivo2+"” · en cola");
    var _m2=t.msgs[t.msgs.length-1]; _m2.wa=1; _m2.wa_c=wp.contacto; guarda(t);
    pideWhatsApp({usuario:yo, tarea_id:_tid, contacto:wp.contacto, texto:"[ARCHIVO] archivo: "+wp.archivo2})
      .then(function(j2){ var id2=(j2&&(j2.id||j2.pedido_id))||null; if(id2){ _m2.wa_pid=id2; guarda(t); } })
      .catch(function(e){ msg(t,"bi","No se pudo dejar el archivo en el servidor ("+String((e&&e.message)||e).slice(0,60)+")."); guarda(t); });
  }
  barraEstado=null; consulta=""; fotoEnMano=null; abierta=t.id; vista="hilo"; render();
  window.__ultimoDeshacer={id:t.id, tipo:"whatsapp", cuando:Date.now(), restaurar:function(){
    _estado.cancelado=true;
    if(_estado.id) llamaPush("wa_marca",{id:_estado.id, estado:"cerrado"});
    t.msgs=(t.msgs||[]).filter(function(x){ return x!==_m });
    msg(t,"bi","WhatsApp a "+wp.contacto+" cancelado, no salió.");
    t.ultima=""; guarda(t);
  }};
  muestraDeshacer("whatsapp", _et+" a "+wp.contacto, 3000);
}
/* action=visto: al entrar y cada vez que la app vuelve al frente (max 1/min) */
function avisaVisto(){
  if(!yo) return;
  if(typeof APP_TOKEN==="undefined" || String(APP_TOKEN).indexOf("__")===0) return;
  var ah=Date.now();
  if(window.__vistoTs && ah-window.__vistoTs<60000) return;
  window.__vistoTs=ah;
  try{
    llamaServidor(PUSH+"?action=visto&usuario="+encodeURIComponent(yo),{method:"GET", keepalive:true,
      headers:{"x-app-token":APP_TOKEN}}).catch(function(){});
  }catch(e){}
}
document.addEventListener("visibilitychange", function(){ if(document.visibilityState==="visible"){ try{ avisaVisto(); }catch(e){} } });
window.addEventListener("pageshow", function(){ try{ avisaVisto(); }catch(e){} });
/* build 136: deja el pedido de WhatsApp en la cola del servidor (wa_pedido).
   Claude, desde la computadora del que lo pide, lo manda por SU WhatsApp y la
   respuesta cae en el hilo de la tarea (wa_respuesta). Devuelve promesa. */
/* ===== build 199 (Salvador 2026-10-04 16:11): MENSAJES PROGRAMADOS DENTRO DE DOIT =====
   El servidor no tiene campo de horario; el programa de la Mac (v16) entiende ETIQUETAS al inicio
   del texto y las QUITA antes de mandar:
     [A LAS AAAA-MM-DD HH:MM]                 -> no sale antes de esa hora (Monterrey)
     [SI NO CONTESTA DESDE AAAA-MM-DD HH:MM]  -> solo sale si la persona no escribio despues de esa hora
   "mándale a Carlos mañana a las 8 que…", "dile a Josué el lunes a las 9 que…", "a las 12 si no ha
   contestado recuérdale a Carlos que…", "…y si no contesta, insístele a las 5". La fecha la pone el
   telefono con el candado de fechas (manda la dictada; dia+numero tienen que cuadrar o se pregunta).
   Las etiquetas NUNCA se ven: el chat guarda el texto limpio. ===== */
var WA_VERBO="(?:m[aá]nd(?:a|ale|arle|ales)|env[ií](?:a|ale|arle)|escr[ií]b(?:e|ele|irle)|av[ií]s(?:a|ale|arle)|com[eé]nt(?:a|ale|arle)|d[ií]le|d[ií]gale|recu[eé]rd(?:ale|arle)|ins[ií]st(?:e|ele|irle)|preg[uú]nt(?:a|ale|arle)|p[ií]d(?:e|ele|irle))";
var WA_DIA="(?:hoy|pasado\\s+ma[nñ]ana|ma[nñ]ana(?!\\s+(?:de|por)\\s+la)|(?:el\\s+)?(?:pr[oó]ximo\\s+)?(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)(?:\\s+\\d{1,2}(?!\\s*(?::|am|pm|hrs?|horas)))?(?:\\s+que\\s+viene)?|(?:el\\s+)?\\d{1,2}\\s+de\\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre))";
var WA_HORA="(?:a\\s+las?\\s+(?:\\d{1,2}(?::\\d{2})?|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)(?:\\s+y\\s+media)?(?:\\s*(?:am|pm|a\\.\\s?m\\.?|p\\.\\s?m\\.?|hrs?|horas)\\b|\\s+de\\s+la\\s+(?:ma[nñ]ana|tarde|noche))?|a\\s+mediod[ií]a|al\\s+mediod[ií]a)";
var WA_TIEMPO="(?:"+WA_DIA+"(?:\\s*,?\\s*"+WA_HORA+")?|"+WA_HORA+"(?:\\s+(?:del?\\s+)?"+WA_DIA+")?)";
var WA_SINO=/(?:[,.;]\s*)?(?:y\s+)?si\s+no\s+(?:me\s+|te\s+|le\s+|nos\s+)?(?:ha\s+)?(?:contesta(?:do)?|responde|respondido|contest[oó]|respondi[oó])\b\s*,?\s*/i;
function _hm(d){ return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); }
function _tsDe(f,h){ return new Date(f+"T"+h+":00").getTime(); }
/* las frases de tiempo de un pedazo: {frases:[...], resto} */
function _sacaFrases(z){
  var fr=[], re=new RegExp("(?:^|\\s|,)("+WA_TIEMPO+")(?=$|[\\s,.;:!?])","ig"), resto=String(z||"");
  resto=resto.replace(re,function(all,f){ fr.push(f); return all.charAt(0)===","?",":" "; }).replace(/\s{2,}/g," ");
  return {frases:fr, resto:resto};
}
/* fecha y hora de unas frases de tiempo -> {fecha,hora} | {duda} | null. base = {fecha,hora} para "a las 5" de un seguimiento */
function cuandoDe(frases, ahora, base){
  var z=frases.join(" "); if(!z.trim()) return null;
  var fd=fechaDictada(z); if(fd.duda) return {duda:fd.duda};
  var hv=horaDicha(z)?horaValor(z):"", f=fd.fecha||"", now=new Date(ahora);
  if(!f && !hv) return null;
  if(!hv) return {fecha:f, hora:"09:00"};
  var parte=(typeof parteDelDia==="function" && parteDelDia(" "+_nn(z)+" ")) || /\b(0\d|1[3-9]|2[0-3]):\d{2}\b/.test(z) || /\b(am|pm|a\.\s?m|p\.\s?m)\b/i.test(z);
  var h=parseInt(hv.slice(0,2),10), mm=hv.slice(3);
  var cands=[hv]; if(!parte && h>=1 && h<=11) cands.push(String(h+12).padStart(2,"0")+":"+mm);
  var desde=base?_tsDe(base.fecha,base.hora):ahora;
  if(f){
    var ok=cands.filter(function(c){ return _tsDe(f,c)>desde; });
    if(!ok.length) return {duda:"Esa hora ya pasó ("+fechaMovCorta(f)+" "+hv+"). ¿A qué hora lo mando?"};
    /* sin decir parte del dia: de 1 a 5 = tarde (regla de build 141), de 6 a 11 = mañana si aun no pasa */
    var pref=(!parte && h>=1 && h<=5 && cands[1] && _tsDe(f,cands[1])>desde)?cands[1]:ok[0];
    return {fecha:f, hora:pref};
  }
  var dia=base?base.fecha:iso(now);
  for(var k=0;k<3;k++){
    var fx=k?dmDe(dia,k):dia, ok2=cands.filter(function(c){ return _tsDe(fx,c)>desde; });
    if(!parte && h>=1 && h<=5 && cands[1] && ok2.indexOf(cands[1])>=0) return {fecha:fx, hora:cands[1]};
    if(ok2.length) return {fecha:fx, hora:ok2[0]};
  }
  return null;
}
/* lo dictado -> el (o los) WhatsApp programados, o null si no es un mensaje programado */
function programaWA(texto, ahora){
  ahora=ahora||Date.now();
  var s=String(texto||"").trim().replace(/^(?:oye\s+)?(?:claude|cloud|clod|claud|clau)\b[\s,:]*/i,"");
  var desdeHoy=/\bdesde\s+hoy\b/i.test(s); if(desdeHoy) s=s.replace(/\bdesde\s+hoy\b[\s,]*/i," ").replace(/\s{2,}/g," ").trim();   /* build 263: "desde hoy" = hoy, en la siguiente ventana hábil */
  var rv=new RegExp("\\b"+WA_VERBO+"\\b","i"), v=s.match(rv); if(!v) return null;
  var sn=s.match(WA_SINO), main=s, seg="", condicional=false;
  if(sn){
    if(sn.index>v.index){ main=s.slice(0,sn.index); seg=s.slice(sn.index+sn[0].length); }
    else { condicional=true; main=(s.slice(0,sn.index)+" "+s.slice(sn.index+sn[0].length)).replace(/\s{2,}/g," ").trim(); }
  }
  var vm=main.match(rv); if(!vm) return null;
  var pre=main.slice(0,vm.index), after=main.slice(vm.index+vm[0].length);
  var qi=after.search(/\s(?:para\s+)?que\s|\sdiciendo(?:le)?\s|:\s|\s(?=si\s)/i);   /* "pregúntale a Manuel mañana a las 9 si ya…" */
  var cz=qi>=0?after.slice(0,qi):after, body=qi>=0?after.slice(qi):"";
  var P=_sacaFrases(pre), C=_sacaFrases(cz), T={frases:[], resto:body};
  var tr=body.match(/,\s*([^,]+?)\s*[.!]?\s*$/);
  if(tr && new RegExp("^"+WA_TIEMPO+"$","i").test(tr[1].trim())){ T.frases.push(tr[1].trim()); T.resto=body.slice(0,tr.index); }
  var frases=P.frases.concat(C.frases, T.frases);
  if(!frases.length && !condicional && !seg && !desdeHoy) return null;   /* no hay nada que programar: sigue el camino de siempre */
  var contacto=C.resto.replace(/^\s*(?:un\s+)?(?:(?:whats?\s?app|whats|wasap|guasap|mensaje|aviso)\s+)?(?:a|al)\s+/i,"").replace(/[\s,.:;]+$/,"").trim();
  var msj=T.resto.replace(/^\s*,?\s*(?:(?:para\s+)?que(?:\s+(?:le\s+)?(?:dig(?:as|a)|dice|dijera))?|diciendo(?:le)?|:)\s*:?\s*(?:que\s+)?/i,"").replace(/[\s,]+$/,"").trim();
  if(qi<0){ var me=contacto.match(/^(.+?)\s+(esto|eso|lo\s+(?:anterior|de\s+arriba|siguiente))\b\s*:?\s*(.*)$/i);
    if(me){ contacto=me[1].trim(); msj=me[3].trim()||"__ESTO__"; } }
  var out={programado:true, contacto:contacto, texto:msj?msj.charAt(0).toUpperCase()+msj.slice(1):"", a_las:null, sino_desde:null, seguimiento:null, duda:""};
  if(!contacto) out.duda="¿A quién se lo mando?";
  else if(!msj) out.duda="¿Qué le mando a "+contacto+"?";
  var cu=cuandoDe(frases, ahora, null);
  if(cu && cu.duda) out.duda=out.duda||cu.duda; else if(cu) out.a_las=cu;
  /* build 263: "desde hoy" / "hoy" sin hora = hoy en la siguiente ventana hábil (8–20, lunes a sábado); fuera de ella, el siguiente día hábil a las 9 */
  if(!out.duda && (desdeHoy || (frases.length && frases.every(function(f){ return /^hoy$/i.test(String(f).trim()); }))) && !(cu && cu.hora && frases.some(function(f){ return horaDicha(f); }))) out.a_las=ventanaHabil(ahora);
  if(condicional){ var d0=new Date(ahora); out.sino_desde={fecha:iso(d0), hora:_hm(d0)}; if(!out.a_las) out.duda=out.duda||"¿A qué hora se lo mando si no contesta?"; }
  if(seg){
    var sq=seg.search(/\s(?:para\s+)?que\s|:\s/i), sz=sq>=0?seg.slice(0,sq):seg, sb=sq>=0?seg.slice(sq):"";
    var S=_sacaFrases(sz), txs=sb.replace(/^\s*(?:(?:para\s+)?que|:)\s*:?\s*/i,"").replace(/[\s,.]+$/,"").trim();
    var base=out.a_las || (function(){ var d1=new Date(ahora); return {fecha:iso(d1), hora:_hm(d1)}; })();
    var cs=cuandoDe(S.frases, ahora, base);
    if(!cs) out.duda=out.duda||"¿A qué hora le insisto si no contesta?";
    else if(cs.duda) out.duda=out.duda||cs.duda;
    else out.seguimiento={a_las:cs, sino_desde:base, texto:txs?txs.charAt(0).toUpperCase()+txs.slice(1):""};
  }
  return out;
}
/* las etiquetas que entiende la Mac (v16) */
function etiquetasWA(a_las, sino){
  return (a_las?"[A LAS "+a_las.fecha+" "+a_las.hora+"] ":"")+(sino?"[SI NO CONTESTA DESDE "+sino.fecha+" "+sino.hora+"] ":"");
}
/* nunca se ven: se quitan de cualquier texto que se pinte */
function quitaEtiquetasWA(tx){
  var t=String(tx==null?"":tx), m, cambio=true;
  while(cambio){ cambio=false; m=t.match(/^\s*\[(?:A LAS|SI NO CONTESTA DESDE) \d{4}-\d{2}-\d{2} \d{1,2}:\d{2}\]\s*/i); if(m){ t=t.slice(m[0].length); cambio=true; } }
  return t.replace(/\[(?:A LAS|SI NO CONTESTA DESDE) \d{4}-\d{2}-\d{2} \d{1,2}:\d{2}\]\s*/gi,"");
}
function horaCorta(h){ var x=parseInt(h,10), mm=String(h).slice(3); return x+":"+mm; }
function textoProgramado(a_las, contacto, sino){
  return "Programado · "+(a_las?fechaMovCorta(a_las.fecha)+" "+horaCorta(a_las.hora):"ahora")+" → "+contacto+(sino?" · solo si no contesta":"");
}
/* deja en la cola los pedidos de un programado (y su seguimiento). t = tarea donde se anota. */
function mandaProgramado(t, pg, tid){
  var hechos=[];
  function uno(a_las, sino, texto, esSeg){
    msg(t,"bi",textoProgramado(a_las, pg.contacto, sino)+": “"+_corto(texto)+"”");
    var m=t.msgs[t.msgs.length-1]; m.wa=1; m.wa_c=pg.contacto; m.prog={a_las:a_las, sino:sino||null, contacto:pg.contacto, texto:texto, seg:!!esSeg};
    pideWhatsApp({usuario:yo, tarea_id:tid||t.id, contacto:pg.contacto, texto:conIA(etiquetasWA(a_las, sino)+texto)})
      .then(function(j){ var pid=(j&&(j.id||j.pedido_id))||null; if(pid){ m.wa_pid=pid; if(m.prog.cancelar){ llamaPush("wa_marca",{id:pid, estado:"cerrado"}); m.prog.cancelado=true; } guarda(t); if(vista==="hilo"&&abierta===t.id) render(); } })
      .catch(function(e){ m.prog.error=String((e&&e.message)||e).slice(0,60); msg(t,"bi","No se pudo dejar programado el WhatsApp a "+pg.contacto+" ("+m.prog.error+"). Díctalo otra vez."); guarda(t); if(vista==="hilo") render(); });
    hechos.push(m);
  }
  uno(pg.a_las, pg.sino_desde, pg.texto, false);
  if(pg.seguimiento) uno(pg.seguimiento.a_las, pg.seguimiento.sino_desde, pg.seguimiento.texto||("Te lo recuerdo: "+pg.texto), true);
  t.wa_contactos=t.wa_contactos||[];
  if(!t.wa_contactos.some(function(c){ return String(c.nombre||c).toLowerCase()===String(pg.contacto).toLowerCase(); })) t.wa_contactos.push({nombre:pg.contacto, desde:Date.now()});
  t.ultima=textoProgramado(pg.a_las, pg.contacto, pg.sino_desde); guarda(t);
  return hechos;
}
function cancelaProgramado(t, m){
  if(!m || !m.prog || m.prog.cancelado) return;
  if(m.wa_pid) llamaPush("wa_marca",{id:m.wa_pid, estado:"cerrado"}); else m.prog.cancelar=true;
  m.prog.cancelado=true; guarda(t); if(vista==="hilo") render(); toast("Cancelado: no sale");
}
/* contacto dicho -> el nombre con que la tarea ya lo conoce (mismo primer nombre) */
function contactoDeTarea(t, c){
  if(!t || !c) return c;
  var pn=_nn(c).split(/\s+/)[0], l=[];
  try{ l=contactosWA(t).map(function(G){ return G.nombre; }); }catch(e){}
  (t.wa_contactos||[]).forEach(function(x){ l.push(String(x.nombre||x)); });
  var hit=l.filter(function(n){ return _nn(n).split(/\s+/)[0]===pn; })[0];
  return hit||c;
}
/* build 217: la Mac (v18k) ya no pone "IA: ". Lo que redacto Claude lo lleva desde aqui; lo escrito a mano, no. */
function conIA(tx){ var s=String(tx==null?"":tx); if(/^\s*\[(CORREO|ARCHIVO)\]/i.test(s)) return s; var e="", m;
  while((m=s.match(/^\s*\[(?:A LAS|SI NO CONTESTA DESDE) \d{4}-\d{2}-\d{2} \d{1,2}:\d{2}\]\s*/i))){ e+=m[0]; s=s.slice(m[0].length); }
  return /^IA:/i.test(s.trim()) ? e+s : e+"IA: "+s.replace(/^\s+/,""); }
function pideWhatsApp(cuerpo){
  /* build 171 (Salvador 2-oct): lo que se pide desde la app lo pidio una persona en ese momento:
     va como "urgente" y el programa de la Mac lo manda antes que la fila automatica */
  cuerpo=Object.assign({prioridad:"urgente"}, cuerpo||{});
  if(typeof APP_TOKEN==="undefined" || String(APP_TOKEN).indexOf("__")===0)
    return Promise.reject(new Error("sin token"));
  return llamaServidor(PUSH+"?action=wa_pedido",{method:"POST", keepalive:true,
      headers:{"content-type":"application/json","x-app-token":APP_TOKEN},
      body:JSON.stringify(cuerpo)})
    .then(function(r){ return r.json().catch(function(){return {}}).then(function(j){
      if(!r.ok || (j&&j.error)) throw new Error((j&&j.error)||("HTTP "+r.status)); return j; }); });
}

/* @@DATOS-TAREAS-INICIO
   CAPA DE DATOS DE TAREAS. Toda lectura y escritura de bitacora_tareas pasa por aquí, con dos motores:
   "firestore" (el de siempre) y "mysql" (push.php: fs_lista, fs_doc, fs_set, msg_agregar, hay_nuevo).
   EL MOTOR SE ESCOGE POR USUARIO y en este orden: localStorage "doit_motor_tareas" (prueba en un teléfono),
   el campo motor de su ficha (bitacora_personas/<usuario>.motor) y, si no hay, MOTOR_POR_OMISION.
   MySQL es el de todos: desde que push.php resuelve bitacora_tareas en MySQL, la Mac y el conector leen y escriben
   ahí; un teléfono que se quedara en Firestore trabaja en una base que nadie más ve.
   Mientras dure la transición, quien está en MySQL ESCRIBE EN LOS DOS (MySQL y Firestore) y LEE de MySQL;
   así nada se pierde si hay que regresarlo a Firestore. En MySQL nada se borra: la tarea que se deshace
   queda estado "descartada" (la app ya no la pinta).
   SIN PÉRDIDA: lo que no alcanzó a subir a MySQL queda en una cola local (localStorage "doit_cola_mysql",
   la última versión de cada tarea) y se reintenta solo, con espera creciente y al volver la red. */
var MOTOR_POR_OMISION="mysql";
/* Conciliación: lo que un teléfono guardó solo en Firestore después de que las tareas se copiaron a MySQL
   (8-oct 08:55 Monterrey) se junta en MySQL al arrancar: mensajes y bitácoras se suman, y en lo demás gana
   la versión tocada más reciente. La versión de Firestore queda copiada en _fb_copia (nada se pierde). */
var CONCILIA_DESDE=Date.parse("2026-10-08T14:55:00Z");
var CONCILIA_HASTA=Date.parse("2026-10-20T06:00:00Z");   /* después de esta fecha ningún teléfono escribe solo en Firestore */
var CONCILIA_UNEN=["msgs","notas_claude","respuestas_log","plan_log","notas","evidencia","censo_acomodo","encargos"];
var CONCILIA_JUNTA=["msg_imp","contestadas","_historico"];
var MARCAS_BAJA=["eliminado","eliminado_ts","eliminado_por","oculto","oculto_ts","oculto_por","oculto_motivo","apartado","apartado_ts","apartado_por","movido_a","borrado_servidor"];
/* junta la versión de Firestore (F) sobre la de MySQL (M). Devuelve null si F no trae nada nuevo. */
function mezclaFirestore(M, F){
  if(!F) return null;
  var fT=+F.tocada||0;
  if(!M) return fT>CONCILIA_DESDE ? Object.assign({}, F, {_fb_tocada:fT}) : null;
  if(fT<=CONCILIA_DESDE || (fT<=(+M._fb_tocada||0) && (+M._fb_v||1)>=2)) return null;   /* v2: vuelve a pasar una vez para recuperar lo eliminado/oculto en el teléfono */
  var clave=function(x){ return (x && typeof x==="object") ? (x.id || x.nid || x.wa_id || ((x.ts||"")+"|"+(x.k||"")+"|"+String(x.t||x.texto||"").slice(0,80))) : JSON.stringify(x); };
  var R=Object.assign({}, M), gana=fT>(+M.tocada||0), cambio=false;
  Object.keys(F).forEach(function(k){
    if(k==="id" || k==="_fb_copia" || k==="_fb_tocada") return;
    var f=F[k], m=M[k];
    if(JSON.stringify(f)===JSON.stringify(m)) return;
    if(CONCILIA_UNEN.indexOf(k)>=0 && (Array.isArray(f) || Array.isArray(m))){
      var vistos={}, out=[];
      var porC={}; (Array.isArray(f)?f:[]).forEach(function(x){ porC[clave(x)]=x; });
      (Array.isArray(m)?m:[]).concat(Array.isArray(f)?f:[]).forEach(function(x){ var c=clave(x); if(vistos[c]) return; vistos[c]=1;
        var y=porC[c]; if(y && y!==x && x && typeof x==="object"){ var z=null; MARCAS_BAJA.forEach(function(k){ if(y[k] && !x[k]){ z=z||Object.assign({}, x); z[k]=y[k]; } }); if(z) x=z; }
        out.push(x); });   /* lo que en el teléfono quedó eliminado, oculto o apartado sigue así: no revive */
      if(k==="msgs") out.sort(function(a,b){ return ((a&&+a.ts)||0)-((b&&+b.ts)||0); });
      if(JSON.stringify(out)!==JSON.stringify(m)){ R[k]=out; cambio=true; }
      return;
    }
    if(CONCILIA_JUNTA.indexOf(k)>=0 && f && m && typeof f==="object" && typeof m==="object" && !Array.isArray(f)){
      var j=Object.assign({}, m, f); if(JSON.stringify(j)!==JSON.stringify(m)){ R[k]=j; cambio=true; } return;
    }
    if(m===undefined || gana){ R[k]=f; cambio=true; }
  });
  if(!cambio) return null;
  var copia=Object.assign({}, F); delete copia.msgs; delete copia._fb_copia;
  R._fb_copia=JSON.stringify(copia).slice(0, 60000);
  R._fb_tocada=fT; R._fb_v=2;
  if(gana) R.tocada=fT;
  return R;
}
var MYSQL_CADA_MS=20000;                       /* cada cuánto se vuelve a leer la lista en MySQL */
var MYSQL_REINTENTOS_MS=[2000,5000,15000,60000];
var datosTareas=(function(){
  var COLA_KEY="doit_cola_mysql", MOTOR_KEY="doit_motor_tareas";
  var cola=null, reintento=null, intento=0, sub=null, ultimoJSON="";
  function ls(){ try{ return window.localStorage; }catch(e){ return null; } }
  function motor(){
    var m=null, s=ls();
    try{ m=s && s.getItem(MOTOR_KEY); }catch(e){}
    if(m!=="mysql" && m!=="firestore"){ try{ m=(PERSONAS[yo]||{}).motor; }catch(e){ m=null; } }
    if(m!=="mysql" && m!=="firestore") m=MOTOR_POR_OMISION;
    return m;
  }
  function hayToken(){ return typeof APP_TOKEN!=="undefined" && String(APP_TOKEN).indexOf("__")!==0; }
  /* una llamada a push.php: GET con parámetros o POST con cuerpo; error si HTTP falla o trae error */
  function llama(accion, params, cuerpo){
    if(!hayToken()) return Promise.reject(new Error("sin token"));
    var q="?action="+encodeURIComponent(accion);
    Object.keys(params||{}).forEach(function(k){ if(params[k]!=null && params[k]!=="") q+="&"+k+"="+encodeURIComponent(params[k]); });
    var op={method:cuerpo?"POST":"GET", headers:{"x-app-token":APP_TOKEN,"x-usuario":yo||"anonimo"}};
    if(cuerpo){ op.headers["content-type"]="application/json"; op.body=JSON.stringify(cuerpo); }
    return llamaServidor(PUSH+q, op).then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(j){
        if(r.status===404 && accion==="fs_doc") return null;
        if(!r.ok || (j && j.error && !Array.isArray(j))) throw new Error((j&&j.error)||("HTTP "+r.status));
        return j;
      });
    });
  }
  /* ---- cola local de lo que falta subir a MySQL ---- */
  function leeCola(){
    if(cola) return cola;
    cola={};
    try{ var s=ls(), v=s && s.getItem(COLA_KEY); if(v) cola=JSON.parse(v)||{}; }catch(e){ cola={}; }
    return cola;
  }
  function grabaCola(){ try{ var s=ls(); if(s) s.setItem(COLA_KEY, JSON.stringify(leeCola())); }catch(e){} }
  /* NADIE PISA A NADIE. La app, la Mac y el conector escriben la misma tarea. Por eso aquí:
     1) se manda SOLO lo que cambió contra la última versión leída del servidor (bases[id]);
     2) antes de escribir se relee la tarea (fs_doc) y se junta: lo que cambió el otro se respeta y las listas que
        crecen (mensajes, bitácoras, encargos, dictados) se juntan a tres bandas (base / mío / servidor): lo que yo
        agregué entra, lo que yo quité sale, y lo que agregó el otro se queda;
     3) lo que no sube queda en la cola (solo los cambios, con su base) y se reintenta con el mismo cuidado. */
  var bases={};
  function copia(o){ return o==null ? o : JSON.parse(JSON.stringify(o)); }
  function igual(a, b){ return JSON.stringify(a)===JSON.stringify(b); }
  function claveItem(x){ return (x && typeof x==="object") ? String(x.id || x.nid || x.wa_id || ((x.ts||"")+"|"+(x.k||"")+"|"+String(x.t||x.texto||"").slice(0,80))) : JSON.stringify(x); }
  function esLista(k){ return CONCILIA_UNEN.indexOf(k)>=0 || k==="dictados"; }
  /* junta una lista a tres bandas, por clave de cada elemento */
  function junta3(base, mio, srv){
    base=Array.isArray(base)?base:[]; mio=Array.isArray(mio)?mio:[]; srv=Array.isArray(srv)?srv:[];
    var B={}, M={}, S={}; base.forEach(function(x){ B[claveItem(x)]=x; }); mio.forEach(function(x){ M[claveItem(x)]=x; }); srv.forEach(function(x){ S[claveItem(x)]=x; });
    var out=[], vistos={};
    mio.forEach(function(x){ var c=claveItem(x); if(vistos[c]) return; vistos[c]=1;
      if(c in S && c in B && igual(x, B[c])) out.push(S[c]); else out.push(x); });     /* sin cambio mío: gana la del servidor */
    srv.forEach(function(x){ var c=claveItem(x); if(vistos[c]) return; vistos[c]=1;
      if(c in B && !(c in M)) return;                                                   /* yo lo quité: no regresa */
      out.push(x); });
    if(out.some(function(x){ return x && typeof x==="object" && x.ts; })) out.sort(function(a,b){ return ((a&&+a.ts)||0)-((b&&+b.ts)||0); });
    return out;
  }
  /* qué cambió: los campos de d distintos de la base (y las listas con su base para juntar después) */
  /* cada tarea recuerda (sin que se vea ni se guarde) la versión del servidor de la que salió: así un guardado tardío
     (una respuesta del modelo que llega 8 s después) nunca "deshace" lo que la Mac escribió mientras tanto */
  function ponBase(o, b){ try{ Object.defineProperty(o, "__base", {value:b, writable:true, configurable:true, enumerable:false}); }catch(e){} return o; }
  function cambiosDe(id, d, b0){
    var b=b0 || bases[id], c={}, cb={};
    if(!b) return { cambios:copia(d), base:{} };
    Object.keys(d).forEach(function(k){ if(!igual(d[k], b[k])){ c[k]=copia(d[k]); cb[k]=copia(b[k]); } });
    return { cambios:c, base:cb };
  }
  /* ---- cola local de lo que falta subir a MySQL ---- */
  function leeCola(){
    if(cola) return cola;
    cola={};
    try{ var s=ls(), v=s && s.getItem(COLA_KEY); if(v) cola=JSON.parse(v)||{}; }catch(e){ cola={}; }
    return cola;
  }
  function grabaCola(){ try{ var s=ls(); if(s) s.setItem(COLA_KEY, JSON.stringify(leeCola())); }catch(e){} }
  /* entrada de la cola: {cambios, base}; las viejas (doc suelto) se leen como cambios sin base */
  function entrada(x){ return (x && x.__v===2) ? x : { __v:2, cambios:x||{}, base:{} }; }
  function encola(id, campos, base){
    var c=leeCola(), prev=entrada(c[id]);
    var nb=Object.assign({}, base||{}); Object.keys(prev.base||{}).forEach(function(k){ nb[k]=prev.base[k]; });   /* la base más vieja manda */
    c[id]={ __v:2, cambios:Object.assign({}, prev.cambios, copia(campos)), base:nb };
    grabaCola();
  }
  function vistaCola(id){ var x=leeCola()[id]; return x ? entrada(x).cambios : null; }
  /* sube una entrada: relee la tarea, junta y escribe solo lo que cambió */
  /* CHOQUE: el mismo dato lo cambiaron dos al mismo tiempo con valores distintos. Regla de Salvador (8-oct): lo que dice
     una persona gana sobre lo que dice la Mac; entre dos personas gana el último, y lo del otro nunca se pierde: queda
     en t.conflictos {campo, quedo, otro, otro_por, por, ts} y, si el otro era una persona, se avisa. _tocado_por guarda
     quién cambió cada campo y cuándo (la Mac no lo pone: sin marca = la Mac). */
  var SIN_CHOQUE={tocada:1, _tocado_por:1, conflictos:1, ultima:1, msg_imp:1, _fb_tocada:1, _fb_copia:1};
  /* "gana la persona" vale solo para lo que una persona cambia a mano. Lo que la app recalcula sola (hecho238, falta_*,
     pendiente_info, resumen, sabemos…) no es una decisión: en un choque gana la versión del servidor (la Mac lo acaba de escribir). */
  var DE_PERSONA={nombre:1, f_vigente:1, f_original:1, fecha_dictada:1, indefinida:1, estado:1, cierre:1, cierra:1, duenio:1, encargado:1, espera_a:1,
    checklist:1, checklist_apartado:1, avisos:1, citas:1, evento:1, plan_seguimiento:1, contexto:1, contexto_detalle:1, autorizada:1, autorizada_ts:1,
    tipo_item:1, tipo_elegido:1, es_dato:1, criticidad:1, ritmo:1, periodicidad:1, compartida_con:1, revisores:1, claves:1, metas:1, gasto:1,
    wa_contactos:1, wa_excluidos:1, wa_no_excluir:1};
  function subeUna(id, ent){
    return llama("fs_doc", {col:COL, id:id}).then(function(j){
      var S=j ? (j.doc||j) : {}; var data={}, choques=[], ahora=Date.now(), tp=Object.assign({}, S._tocado_por||{});
      Object.keys(ent.cambios).forEach(function(k){
        if(esLista(k)){ data[k]=junta3(ent.base[k], ent.cambios[k], S[k]); return; }
        data[k]=ent.cambios[k];
        if(SIN_CHOQUE[k]) return;
        var real=(k in ent.base);   /* un cambio medido contra la base; una subida completa (conciliación, tarea nueva) no marca a nadie */
        if(real && DE_PERSONA[k]) tp[k]={por:yo||"app", ts:ahora};
        if(j && real && !igual(S[k], ent.base[k]) && !igual(S[k], ent.cambios[k])){
          var otro=(S._tocado_por||{})[k]||{};
          if(!DE_PERSONA[k]){ data[k]=S[k]; choques.push({campo:k, quedo:S[k], otro:ent.cambios[k], otro_por:"app", por:"mac", ts:ahora}); return; }
          choques.push({campo:k, quedo:ent.cambios[k], otro:S[k], otro_por:otro.por||"mac", por:yo||"app", ts:ahora}); }
      });
      if(!Object.keys(data).length) return S;
      data._tocado_por=tp;
      if(choques.length){
        data.conflictos=(Array.isArray(S.conflictos)?S.conflictos:[]).concat(choques).slice(-50);
        var personas=choques.filter(function(c){ return c.otro_por!=="mac" && c.otro_por!==(yo||"app"); });
        if(personas.length){ try{ toast("Lo cambiaste al mismo tiempo que "+personas.map(function(c){ return c.otro_por; }).join(", ")+": quedó lo tuyo y lo suyo está en el historial"); }catch(e){} }
      }
      return llama("fs_set", {col:COL}, {col:COL, id:id, data:data, merge:true}).then(function(){ return Object.assign({}, S, data); });
    });
  }
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
  function programaReintento(){
    if(reintento) return;
    var ms=MYSQL_REINTENTOS_MS[Math.min(intento, MYSQL_REINTENTOS_MS.length-1)]; intento++;
    reintento=setTimeout(function(){ reintento=null; vacia().catch(function(){}); }, ms);
  }
  function aMySQL(id, campos, base){
    encola(id, campos, base);
    return vacia().catch(function(e){
      try{ console.warn("MySQL: queda en cola para reintento", e); }catch(_e){}
      return false;
    });
  }
  /* ---- lo que usa la app ---- */
  function listar(){
    return llama("fs_lista", {col:COL, usuario:yo, limit:1000}).then(function(j){
      var arr=Array.isArray(j) ? j : ((j&&(j.docs||j.documentos))||[]);
      var c=leeCola();   /* lo que aún no sube se ve como el usuario lo dejó */
      var porId={}; arr.forEach(function(o){ if(o && o.id){ porId[o.id]=o; var b=copia(o); delete b.id; bases[o.id]=b; } });
      Object.keys(c).forEach(function(id){ porId[id]=Object.assign({id:id}, porId[id]||{}, vistaCola(id)); });
      return Object.keys(porId).map(function(id){ return porId[id]; });
    });
  }
  function leer(id){
    if(motor()==="mysql") return llama("fs_doc", {col:COL, id:id}).then(function(j){
      if(!j) return null; var o=j.doc||j; var b=copia(o); delete b.id; bases[id]=b; return Object.assign({}, o, vistaCola(id)||{});
    });
    return db.collection(COL).doc(id).get().then(function(d){ return (d && d.exists) ? d.data() : null; });
  }
  /* guarda la tarea completa. Devuelve la promesa de Firestore (o la de MySQL si no hay Firestore). */
  function guardar(t){
    var pf=null;
    if(db) pf=db.collection(COL).doc(t.id).set(t);
    if(motor()!=="mysql") return pf;
    var d=copia(t); delete d.id;
    var cb=cambiosDe(t.id, d, t.__base);
    if(!Object.keys(cb.cambios).length) return pf || Promise.resolve(true);
    ponBase(t, copia(d));   /* lo siguiente que cambie se mide contra lo que ya mandé */
    var pm=aMySQL(t.id, cb.cambios, cb.base);
    return pf || pm;
  }
  /* guarda solo unos campos (merge), en el motor elegido y en Firestore */
  function guardarCampos(id, campos){
    var pf=null;
    if(db) pf=db.collection(COL).doc(id).set(campos, {merge:true});
    if(motor()!=="mysql") return pf;
    var base={}; Object.keys(campos||{}).forEach(function(k){ if(esLista(k) && bases[id]) base[k]=copia(bases[id][k]); });
    var pm=aMySQL(id, campos, base);
    return pf || pm;
  }
  /* en MySQL no se borra: queda descartada. En Firestore, como siempre. */
  function borrar(id){
    if(db){ try{ db.collection(COL).doc(id).delete().catch(function(){}); }catch(e){} }
    if(motor()==="mysql") aMySQL(id, {estado:"descartada", descartada_ts:Date.now()});
  }
  function agregarMsg(tarea_id, texto, privado){
    return llama("msg_agregar", null, {tarea_id:tarea_id, texto:String(texto==null?"":texto), privado:privado?1:0});
  }
  /* sube a MySQL lo que este teléfono dejó solo en Firestore (ver mezclaFirestore). Una vez por arranque. */
  function concilia(){
    if(!db || !hayToken() || Date.now()>CONCILIA_HASTA) return Promise.resolve(0);
    return Promise.all([db.collection(COL).get(), listar()]).then(function(r){
      var porId={}; (r[1]||[]).forEach(function(o){ if(o && o.id) porId[o.id]=o; });
      var subir=[];
      r[0].forEach(function(d){ var F=d.data(); if(!F) return; var M=porId[d.id]||null;
        var X=mezclaFirestore(M, F); if(X){ var x=Object.assign({}, X); delete x.id; subir.push({id:d.id, data:x}); } });
      return subir.reduce(function(p, u){ return p.then(function(){ return aMySQL(u.id, u.data); }); }, Promise.resolve()).then(function(){
        try{ if(subir.length) console.warn("Conciliación Firestore→MySQL: "+subir.length+" tareas"); }catch(e){}
        return subir.length; });
    }).catch(function(e){ try{ console.warn("Conciliación falló", e); }catch(_e){} return 0; });
  }
  function hayNuevo(desde_ts){ return llama("hay_nuevo", {usuario:yo, desde_ts:desde_ts}); }
  /* la lista viva: en Firestore es el onSnapshot de siempre; en MySQL se vuelve a leer cada MYSQL_CADA_MS
     y solo se avisa si cambió. El "snap" imita al de Firestore para que el resto de la app no cambie. */
  function comoSnap(arr){
    return { metadata:{fromCache:false}, forEach:function(g){ arr.forEach(function(o){
      g({ id:o.id, data:function(){ var x=Object.assign({}, o); delete x.id; return ponBase(x, bases[o.id] ? copia(bases[o.id]) : null); } }); }); } };
  }
  function suscribir(alCambiar, alFallar){
    para();
    if(motor()!=="mysql"){ var u=db.collection(COL).onSnapshot(alCambiar, alFallar); sub={tipo:"firestore", fin:u}; return u; }
    var vivo={tipo:"mysql", timer:null, fin:null}; sub=vivo; ultimoJSON="";
    function vuelta(){
      if(sub!==vivo) return;
      listar().then(function(arr){
        if(sub!==vivo) return;
        var j=JSON.stringify(arr);
        if(j!==ultimoJSON){ ultimoJSON=j; alCambiar(comoSnap(arr)); }
        vivo.falla=false;
      }, function(e){
        if(sub!==vivo) return;
        if(!vivo.falla){ vivo.falla=true; try{ toast("No se pudieron leer las tareas del servidor; reintento solo"); }catch(_t){} }
        if(alFallar) alFallar(e);
      })
      .then(function(){ if(sub===vivo) vivo.timer=setTimeout(vuelta, MYSQL_CADA_MS); });
    }
    /* primero se junta lo que quedó solo en Firestore y luego se lee: así nunca se pinta (ni se edita) la versión vieja */
    var _arranco=false, _arranca=function(){ if(_arranco) return; _arranco=true; vuelta(); };
    vacia().catch(function(){}).then(function(){ return concilia(); }).then(_arranca, _arranca);
    setTimeout(_arranca, 15000);
    vivo.fin=function(){ if(vivo.timer) clearTimeout(vivo.timer); if(sub===vivo) sub=null; };
    return vivo.fin;
  }
  function para(){ var s=sub; sub=null; if(!s) return; try{ if(s.tipo==="firestore"){ if(typeof s.fin==="function") s.fin(); } else s.fin(); }catch(e){} }
  try{ window.addEventListener("online", function(){ vacia().catch(function(){}); }); }catch(e){}
  return { motor:motor, listar:listar, leer:leer, guardar:guardar, guardarCampos:guardarCampos, borrar:borrar,
           agregarMsg:agregarMsg, hayNuevo:hayNuevo, suscribir:suscribir, para:para, vacia:vacia, concilia:concilia,
           pendientes:function(){ return Object.keys(leeCola()).length; } };
})();
/* @@DATOS-TAREAS-FIN */

/* ============ DATOS ============ */
function arranca(){
  try{
    /* build 72: la entrada ya inicializo Firebase para el login;
       build 136: fbListo() tambien prende la cache local */
    fbListo();
    db=firebase.firestore();
    db.collection(COLE).onSnapshot(function(snap){
      encargos=[]; snap.forEach(function(d){var o=d.data();o.id=d.id;encargos.push(o)});
      if(listo) render();
    },function(){});
    db.collection(COLS).onSnapshot(function(snap){
      suplencias={}; snap.forEach(function(d){ suplencias[d.id]=d.data() });
      if(listo) render();
    },function(){});
    /* las fichas se mezclan ENCIMA del catalogo del codigo: asi todo lo que ya
       lee PERSONAS[k].nombre y .ini sigue funcionando sin tocar una sola linea. */
    db.collection(COLP).onSnapshot(function(snap){
      snap.forEach(function(d){
        var o=d.data()||{}, p=PERSONAS[d.id];
        if(!p){ PERSONAS[d.id]={jefe:false}; p=PERSONAS[d.id] }
        if(o.nombre) p.nombre=o.nombre;
        /* build 148 (2026-09-29): una ficha sin nombre (p. ej. un registro de
           prueba técnica) tronaba la barra con "PERSONAS[k].nombre.toLowerCase";
           nunca se deja una persona sin nombre. */
        if(!p.nombre) p.nombre=d.id;
        p.apellido=o.apellido||"";
        p.mail_trabajo=o.mail_trabajo||"";
        p.mail_personal=o.mail_personal||"";
        if(o.reporta_a) p.reporta_a=o.reporta_a;            /* build 179: organigrama dictado */
        if(o.notif && typeof o.notif==="object") p.notif=o.notif;   /* build 200: notificaciones de cada quien */
        if(o.voces && typeof o.voces==="object") p.voces=o.voces;   /* el elenco de voces de cada quien (⋯ → Voces) */
        if(Array.isArray(o.apodos)) p.apodos=o.apodos;
        if(o.motor==="mysql" || o.motor==="firestore") p.motor=o.motor;   /* motor de tareas de cada quien (capa datosTareas) */
        if(d.id===yo && Array.isArray(o.historial_acciones)) window.__histRemoto240=o.historial_acciones;
        if(o.nombre&&o.apellido) p.ini=iniciales(o.nombre,o.apellido);
      });
      fichasLeidas=true;
      try{ notifFallaUnaVez(); }catch(e){}
      if(listo) render();
    },function(){
      /* si la coleccion esta bloqueada NO se abre la puerta de la ficha:
         seria encerrar a la gente en un formulario que no puede guardar. */
      fichasLeidas=false;
      console.warn("No se pudieron leer las fichas de personas");
    });
    datosTareas.suscribir(function(snap){
      dbFail=false;   /* enganchó de verdad: no hay falla */
      tareas=[]; var _fus={}, _desc={}, _enBase=0; snap.forEach(function(d){var o=d.data();o.id=d.id; _enBase++;
        /* build 155: una tarea fusionada (enlazada a otra) NO se pinta en ninguna vista;
           sigue en la base (nada se borra). Y las que crea WhatsApp con `tarea` en vez de
           `nombre` se leen con ese nombre. La liga a una fusionada lleva a la tarea en que quedó. */
        if(o.fusionada_en || o.vinculada_a) _fus[o.id]=String(o.fusionada_en||o.vinculada_a);   /* vinculada_a (la pone la Mac) = quedó dentro de otra tarea */
        if(o.estado==="descartada") _desc[o.id]=1;
        if(o.estado==="fusionada" || o.fusionada_en || o.vinculada_a || o.estado==="descartada") return;   /* build 256: la propuesta descartada no se pinta (queda en la base) */
        if(!veTarea(o)) return;   /* las de otros no entran a este teléfono (ver veTarea) */
        if(!o.nombre && o.tarea) o.nombre=String(o.tarea);
        if(o.nombre && !o.es_recordatorio) o.nombre=tituloTarea(o.nombre);   /* build 196: se ve ya normalizado; se guarda asi la proxima vez */
        tareas.push(o)});
      window.__fusLiga=_fus;
      /* LOS EJEMPLOS NO SE SIEMBRAN EN LA BASE — corregido 2026-09-04, el día
         que Josué abrió las reglas. Antes, con la base vacía, se subían las ~15
         tareas de ejemplo a Firestore y le habrían aparecido a TODO el equipo
         como si fueran reales. Ahora, si la base está vacía, los ejemplos se
         pintan SOLO en pantalla y jamás se suben (ver el candado en guarda()).
         En cuanto haya una tarea de verdad, los ejemplos desaparecen solos. */
      var _hayReal=_enBase>0;   /* la base tiene tareas aunque ninguna sea de este usuario: no se pintan ejemplos */
      /* build 136: si el snapshot vacio viene de la cache local (aun no llega
         el servidor) NO se siembran ejemplos: en un segundo llega lo real. */
      var _deCache=!!(snap.metadata && snap.metadata.fromCache);
      if(!_hayReal && !_deCache) tareas=SEMILLA.slice();
      listo=true; render();
      /* ESPEJO INICIAL: los avisos que ya existían también se registran en
         bitacora_avisos, una sola vez por tarea (Salvador 2026-09-18). Nunca con
         los ejemplos: solo si había datos reales en la base. */
      if(db && _hayReal && !window.__espejoInicial){ window.__espejoInicial=true;
        setTimeout(function(){ tareas.forEach(function(x){
          if(!x.cierre && (x.es_recordatorio || (x.avisos&&x.avisos.length)) && !x.avisos_espejo){
            try{ sincronizaAvisos(x); }catch(e){}
          }
        }); }, 3000);
      }
      /* si venías de una notificación, abre ese recordatorio directo, con el
         micrófono listo para dictar qué hacer con él (una sola vez) */
      /* build 142: si el primer snapshot viene de la cache local y la tarea de la
         notificacion aun no esta (se creo en otro lado), se ESPERA al del servidor
         en vez de rendirse y quedarse en el home. */
      /* build 150: notificacion sin id (p. ej. "LISTO" de un WhatsApp): abre el hilo
         con lo mas reciente sin leer, en vez del home */
      if(window.__irUltimo && !_deCache){
        /* build 172: primero se busca el mensaje exacto de la notificacion (titulo+texto);
           si aun no llega al servidor, se espera hasta 25 s a los siguientes cambios. */
        try{
          var _pi=window.__notiPista, _u=_pi?tareaDePista(_pi):null;
          if(!_u && _pi && Date.now()<_pi.hasta){ /* se reintenta en el siguiente cambio */ }
          else {
            window.__irUltimo=false; window.__notiPista=null;
            if(!_u) _u=abreUltimoNuevo();
            if(_u){ barraEstado=null; menuOpen=false; abierta=_u.id; vista="hilo"; render(); }
          }
        }catch(e){ window.__irUltimo=false; }
      }
      if(window.__irARec && !window.__recAbierto &&
         !(_deCache && !tareaDeLiga(window.__irARec, tareas, _fus))){
        window.__recAbierto=true;
        /* también puede venir el id de un aviso insertado (tarea|ts) */
        var _pp=String(window.__irARec).split("|"), _rr=tareaDeLiga(_pp[0], tareas, _fus);
        if(_rr) window.__avSonando={taskId:_rr.id, id:(_pp[1] && _rr.id===_pp[0])?_pp[1]:"self"};
        else avisoLigaTarea(_desc[_pp[0]] ? "Esa tarea se descartó; ya no está en tu lista." : "No encontré la tarea de esa liga. Puede que se haya borrado o que no la tengas compartida.");
        window.__irARec=null; olvidaLigaTarea();
        /* Salvador 2026-09-24: la hoja de recordatorios solo se abre si hay
           uno sonando; si la tarea ya esta cerrada o sin alarmas, solo el hilo. */
        if(_rr){ abierta=_rr.id; vista="hilo"; window.__avSheet=avisoSonando(_rr)?_rr.id:null; if(!avisoSonando(_rr)) window.__avSonando=null; render(); }
      }
      /* EL CORRETEO ARRANCA SOLO. Se espera 6 segundos para que terminen de
         llegar encargos, fichas y suplencias, y se le mete un empujoncito al
         azar para que si dos personas abren la app al mismo tiempo no lleguen
         las dos al mismo segundo. Después, cada media hora mientras siga
         abierta. */
      if(!window.__correteoArmado){
        window.__correteoArmado=true;
        setTimeout(function(){ try{ correteo() }catch(e){ console.error(e) } },
                   6000+Math.floor(Math.random()*4000));
        setInterval(function(){ try{ correteo() }catch(e){ console.error(e) } },
                    30*60000);
      }
    },function(err){
      /* HONESTIDAD DE FALLAS — corregido 2026-09-04. Antes se callaba este error
         creyendo que era un parpadeo de arranque. NO lo era: si Firestore niega
         permisos (permission-denied), la base esta CERRADA y NADA se guarda —
         ni lo propio. Callarlo va contra la regla de Salvador: las fallas
         tecnicas se dicen. Ahora, si es permiso denegado, se prende un aviso
         PERSISTENTE; si es otro error transitorio, se deja pasar. */
      console.error(err);
      if(err && err.code==="permission-denied"){ dbFail=true; }
      if(!listo && !tareas.length){ tareas=SEMILLA.slice(); render(); }
      else render();
    });
  }catch(e){
    console.error(e); dbFail=true; tareas=SEMILLA.slice(); render();
  }
}
/* Los ids que vienen de la SEMILLA son EJEMPLOS, no datos de la oficina.
   El índice se arma la PRIMERA VEZ que se pregunta, no al cargar: aquí arriba
   SEMILLA todavía no existe y armarlo de una rompía la app entera. */
var IDS_EJEMPLO=null;
function esEjemplo(t){
  if(!t||!t.id) return false;
  if(!IDS_EJEMPLO){
    IDS_EJEMPLO={};
    try{ SEMILLA.forEach(function(x){ IDS_EJEMPLO[x.id]=true }) }catch(e){}
    try{ DEMOS_KARINA.forEach(function(x){ IDS_EJEMPLO[x.id]=true }) }catch(e){}
  }
  return !!IDS_EJEMPLO[t.id];
}

/* ENTRADA ÚNICA DEL DICTADO. Todo lo que se dicta o escribe dentro de una tarea queda primero en t.dictados (estado
   "recibido") y se sube al servidor en ese momento; después se interpreta. Al guardar la tarea con lo aplicado pasa a
   "aplicado" (o "consulta" si solo era una búsqueda). Si a los 90 s sigue "recibido" (una hoja que se cerró sin terminar,
   un modelo caído), queda "sin_aplicar", se vuelve encargo para la Mac (ordenPendiente, que la Mac aplica en ~2 min)
   y se dice en la plática con el texto completo. */
var DICTADO_ESPERA_MS=90000;
function registraDictado(t, v){
  var d={id:"d"+Date.now().toString(36)+Math.random().toString(36).slice(2,6), ts:Date.now(), t:String(v), por:yo, estado:"recibido"};
  t.dictados=(t.dictados||[]).concat([d]).slice(-60);
  window.__dict={tid:t.id, id:d.id, ts:d.ts, registrando:true};
  try{ guarda(t); }finally{ if(window.__dict && window.__dict.id===d.id) window.__dict.registrando=false; }
  setTimeout(function(){ revisaDictado(t.id, d.id); }, DICTADO_ESPERA_MS);
  return d;
}
function marcaDictado(t, estado){
  var w=window.__dict; if(!t || !w || w.tid!==t.id) return;
  var d=(t.dictados||[]).filter(function(x){ return x && x.id===w.id; })[0];
  if(d && d.estado==="recibido"){ d.estado=estado; d.ap_ts=Date.now(); d.ms=d.ap_ts-d.ts;
    var L=window.__lat; if(L && L.fin>=d.ts){ d.ms_modelo=L.ms; d.prompt_chars=L.chars; d.modelo=L.modelo; } }
  if(estado!=="recibido") window.__dict=null;
}
function revisaDictado(tid, did){
  var t=(typeof tareas!=="undefined" ? tareas : []).filter(function(x){ return x && x.id===tid; })[0]; if(!t) return;
  var d=(t.dictados||[]).filter(function(x){ return x && x.id===did; })[0];
  if(!d || d.estado!=="recibido") return;
  if((t.encargos||[]).some(function(e){ return e && e.origen==="app283" && e.creado>=d.ts && String(e.t||"")===String(d.t).slice(0,1500); })){ d.estado="encargado"; d.ap_ts=Date.now(); guarda(t); return; }   /* ya quedó de encargo (IA caída): no se duplica */
  if(window.__dict && window.__dict.id===did) window.__dict=null;
  d.estado="sin_aplicar"; d.ap_ts=Date.now();
  var e=null; try{ if(typeof ordenPendiente==="function"){ window.__dict=null; e=ordenPendiente(t, d.t, "dictado_sin_aplicar"); } }catch(er){}
  if(e) d.encargo_id=e.id;
  msg(t,"bi","⚠️ Tu indicación «"+String(d.t).slice(0,300)+"» no quedó aplicada aquí: ya se la pasé a Claude en la Mac y te confirmo en un par de minutos qué quedó.");
  var m=t.msgs[t.msgs.length-1]; m.canal="priv:"+yo; m.nota_claude=1; m.dictado_id=did;
  guarda(t); try{ render(); }catch(e2){}
}
function guarda(t){
  t.tocada=Date.now();
  if(t && t.nombre && !t.es_recordatorio) t.nombre=tituloTarea(t.nombre);   /* build 196: titulos con mayuscula inicial */
  if(t && window.__dict && window.__dict.tid===t.id && !window.__dict.registrando && !window.__dict.espera) marcaDictado(t, "aplicado");
  try{ if(t && (t.duenio===yo || t.creada_por===yo)) recalculaFalta(t); }catch(e){}   /* build 263: la marca de Falta info se recalcula al guardar */
  /* CANDADO: un ejemplo se ve, pero NUNCA sube a la base que comparte el
     equipo. Y se dice, para que nadie crea que quedó guardado. */
  if(esEjemplo(t)){ toast("Es una tarea de ejemplo: no se guarda"); render(); return }
  if(!db){render();return}
  /* Red: se limpian los undefined antes de subir, y si Firestore truena en el
     acto se DICE (antes el error rompia todo lo que venia despues). 2026-09-23 */
  limpiaUndef(t);
  /* build 136: sin red queda en la cola local y sube solo; se dice una vez/min */
  if(navigator.onLine===false){
    var _ahoraSR=Date.now();
    if(!window.__sinRedAviso || _ahoraSR-window.__sinRedAviso>60000){
      window.__sinRedAviso=_ahoraSR; toast("Sin red · queda guardado aqui y sube en cuanto haya conexion"); }
  }
  var _p;
  try{ _p=datosTareas.guardar(t); }
  catch(e){ try{console.error(e)}catch(_e){} toast("No se pudo guardar: "+String((e&&e.message)||e).slice(0,80)); return; }
  _p.catch(function(e){
    console.error(e);
    if(e && e.code==="permission-denied"){ dbFail=true; render(); }
    toast("No se pudo guardar");
  });
}
/* quita (en su lugar) los campos undefined de objetos y arreglos anidados */
function limpiaUndef(o){
  if(Array.isArray(o)){ for(var i=0;i<o.length;i++){ if(o[i]===undefined) o[i]=null; else limpiaUndef(o[i]); } return o; }
  if(o && typeof o==="object" && Object.getPrototypeOf(o)===Object.prototype){
    Object.keys(o).forEach(function(k){ if(o[k]===undefined) delete o[k]; else limpiaUndef(o[k]); });
  }
  return o;
}
/* semilla() SE ELIMINÓ el 2026-09-04: sembraba los ejemplos en la base que
   comparte el equipo. Los ejemplos ahora viven solo en pantalla. */

/* ============ TAREA DE PRUEBA · KARINA DETENIENDO ============
   NO ES UNA TAREA REAL. La pidió Salvador el 2026-09-02 para ver cómo se ve la
   pantalla de Karina cuando ella está deteniendo a alguien.
   Cómo funciona: la tarea es de Salvador y queda en estado "espera" apuntando a
   karina. Por eso, cuando Karina entra, su encabezado se pone rojo con
   "Detienes a 1" y abajo "Salvador te espera".
   PARA BORRARLA: quita el documento "demo-karina" de Firestore, esta constante
   y el bloque que la da de alta. Lleva PRUEBA en el título a propósito. */
var DEMOS_KARINA=[{
  id:"demo-karina",nombre:"PRUEBA · Autorizar el cambio de la impresora",
  duenio:"salvador",tipo:"unica",
  cierra:"El sí o el no de Karina, por escrito aquí",
  revisar:"Impresora de la oficina",
  ritmo:"Diario hasta que conteste",gasto:"Lo autoriza Karina",
  estado:"espera",espera:"karina",
  ultima:"Esperando el visto bueno de Karina",
  msgs:[{k:"bi",t:"Tarea de PRUEBA para ver cómo se ve la pantalla cuando alguien está deteniendo a otro. No es real: se borra cuando ya se vio.",h:"—"}],
  pregunta:"¿Autorizas el cambio de la impresora?",
  ops:[{t:"Sí, adelante",r:"Listo, se lo digo a Salvador y esto deja de detenerlo."},
       {t:"Todavía no",r:"Anotado. Sigue apareciendo hasta que decidas."}]
},{
  id:"demo-karina-2",nombre:"PRUEBA · Firmar la póliza del seguro",
  duenio:"samuel",tipo:"unica",
  cierra:"La póliza firmada",
  revisar:"Póliza del seguro",
  ritmo:"Diario hasta que firme",gasto:"No gasta",
  estado:"espera",espera:"karina",
  ultima:"Samuel lleva 3 días esperando la firma",
  msgs:[{k:"bi",t:"Tarea de PRUEBA. No es real: se borra cuando ya se vio.",h:"—"}],
  pregunta:"¿Ya firmaste la póliza?",
  ops:[{t:"Ya firmé",r:"Listo, Samuel puede seguir."},
       {t:"Todavía no",r:"Anotado. Sigue apareciendo hasta que la firmes."}]
}];

/* ============ SEMILLA — tareas de ejemplo ============
   BLOQUE DEMO 2026-09-04 (pedido por Salvador para ver TODOS los estados mientras
   la base esta cerrada). Cubre: vencidas, de hoy, futuras, que lo detienen,
   recordatorios, con mensaje sin leer, y tareas de Karina para consultar.
   PARA QUITARLO cuando abra la base y entren datos reales: borrar los items con
   id que empieza en "demo-". */
var DEMO=[
 /* --- TUYAS (Salvador) --- */
 {id:"demo-renta",nombre:"Depositar la renta del local",duenio:"salvador",tipo:"unica",
  f_original:"2026-09-02",f_vigente:"2026-09-02",recuperable:true,criticidad:"normal",
  cierra:"Comprobante del depósito",revisar:"Local de la esquina",gasto:"$18,500 · BBVA",
  estado:"abierta",ultima:"Karina: el casero preguntó si ya salió",
  msgs:[{k:"bo",t:"Karina: el casero preguntó si ya salió",h:"ayer 17:20"}]},
 {id:"demo-cheques",nombre:"Firmar los cheques de la nómina",duenio:"salvador",tipo:"unica",
  f_original:"2026-09-04",f_vigente:"2026-09-04",recuperable:true,criticidad:"normal",
  cierra:"Cheques firmados",revisar:"Nómina de la quincena",gasto:"No gasta",
  estado:"abierta",ultima:"Para hoy",msgs:[]},
 {id:"demo-contador",nombre:"Llamar al contador por el SAT",duenio:"salvador",tipo:"unica",
  f_original:"2026-09-04",f_vigente:"2026-09-04",recuperable:true,criticidad:"normal",
  cierra:"Saber si falta algo del SAT",revisar:"Aviso del SAT",gasto:"No gasta",
  estado:"abierta",ultima:"Griselda te marcó dos veces",
  msgs:[{k:"bo",t:"Griselda: te marqué dos veces, es rápido",h:"9:10"}]},
 {id:"demo-seguro",nombre:"Renovar el seguro de la camioneta",duenio:"salvador",tipo:"unica",
  f_original:"2026-09-11",f_vigente:"2026-09-11",recuperable:true,criticidad:"lento",
  cierra:"Póliza nueva",revisar:"Camioneta blanca",gasto:"~$9,000",
  estado:"abierta",ultima:"Vence la póliza vieja",msgs:[]},
 {id:"demo-junta",nombre:"Junta con los socios",duenio:"salvador",tipo:"unica",
  f_original:"2026-09-08",f_vigente:"2026-09-08",recuperable:true,criticidad:"normal",
  cierra:"Acuerdos anotados",revisar:"Resultados del trimestre",gasto:"No gasta",
  estado:"abierta",ultima:"El lunes",msgs:[]},
 /* --- RECORDATORIOS (solo avisan) --- */
 {id:"demo-vuelo",nombre:"Vuelo a CDMX",duenio:"salvador",tipo:"recordatorio",es_recordatorio:true,
  f_original:"2026-09-07",f_vigente:"2026-09-07",recuperable:true,criticidad:"lento",
  cierra:"",revisar:"",gasto:"",estado:"abierta",ultima:"",
  msgs:[{k:"bi",t:"Recordatorio. Te aviso el domingo 7.",h:"—"}]},
 {id:"demo-tenencia",nombre:"Pagar la tenencia",duenio:"salvador",tipo:"recordatorio",es_recordatorio:true,
  f_original:"2026-09-15",f_vigente:"2026-09-15",recuperable:true,criticidad:"lento",
  cierra:"",revisar:"",gasto:"",estado:"abierta",ultima:"",
  msgs:[{k:"bi",t:"Recordatorio. Te aviso el 15.",h:"—"}]},
 /* --- TE ESTÁN ESPERANDO (te detienen a TI) --- */
 {id:"demo-autoriza-mat",nombre:"Autorizar la compra de material",duenio:"karina",tipo:"unica",
  recuperable:true,criticidad:"diario",
  cierra:"Tu sí o tu no, por escrito",revisar:"Material para el fraccionamiento",gasto:"$6,400",
  estado:"espera",espera:"salvador",espera_desde:Date.now()-26*3600e3,ultima:"Karina lleva un día esperando tu ok",
  msgs:[{k:"bo",t:"Karina: el proveedor aparta el precio solo hasta hoy",h:"8:00"}],
  evidencias:[{data:"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAH3AjADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6pooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKoS6zpkNybeXULNJwdpjadAwPpjOaAL9FUrzVtPs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igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACmyv5cbPtZtoJwoyT9KdTJld4XWNzG5UhXAB2n1waAOU8OeKrvWI7e7+xWX9nyoZJGgvhJNagKTiWPaMHjBAJIPHPWp/EHi+z07QG1C0ZZ3ey+3wo4ZQ8QKAsTjj/WLx1qinhXUL3VbG71Z9KWe1LF7uzt2jnucoybXJOAp3ZI55A6Vny+B9WutKjsrnULJfs+ltpkDRwsc/NERI2T1xHyo9etAG9d+NdMgKIsd7JMbqK1aEWzq6GTO1ipAO0gHB74NWf8AhLdJMzxpLM5HmhGWB9kzRgl1jbGHYbW4B7H0rFvPC+r3t5Lqc93YDUPtFrJHGkb+VsgLnBOc5bzG+mAOeTT7TwjexGwspLy3OlafNNcQbY285i6yBVbnGF81uR1wOnNJjL8PjXS20uzvZ1vII7i2W6YNayN5MZ/ikIUhV68nggZ6c1o6Jqj6jdavE8aoLK7+zKVOd48tHyf++/0ribvwDql9pEVheX1k6rpq2CErKVgKBh5iLuAJYFc56beMjiuy8N6XPpp1GS6kieW8uBcERA7U/dRoRz15Qn8afURs0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABWL4t1waBpa3XkrK7yrCnmSCONSc4Lufurx19SB3rarM8RWd7faeYtOuYoJcnKzReZHKpUgow6gHOcg5BA69KTGjml8bTpo2mz3llaWt5ek+WZrwLbFBGHMnmYJ28hcbc7uOnNdXpt/wDatIhvrhYoA8fmPtmWRFHXIccEd8+lcVo3ga80u1sLuCbTxqltIZVg8ki2XdCsTqADkE7QxcdTnjmtK08M3C6Inh67lDaZJBI881v+6fzmm37VGSBHgsMYPAxnmm/IRHa+N2vbeZrTTX8579LKzSWXYJg8YkWVjglF2ZbGCcAdzU0Xiu8ubiPTrXTYTrIm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px0keLoW/nU3i/4X+HfFervqOorfQ3E0SwXQtLp4Vu41PCShfvAVNtLf1sVfW/8AW5L8Frm5vPhT4VnvmZrhtPi3M3UgDAJ/ACu0qGytYLK0gtbSJYbeBFjjjQYCKBgAewFTVTd3clKysFFFFIYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUHOPlxn3oAKKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKb+89F/Oj956L+dADqKBnHzYz7UUAFFFFABRRRQAUUVQ129fTtIuruMIXiTcN/Tr3oAv0VzsHiB1llSREvF3xxxyWikBnfPy/McZGMk56GnjxTY+ZKrCTagfawKtvKHBAAORz0yBmgDforFn1v7PIv2q2uITsc+UVVixDIowwbHJcD+eMUkniKKJhHLazpcbzG0bMgwQFONxbaSQwwAcnn0oA26KztU1WPTvs4kikdpiQoBVRwM4JYgZ9BnmorjW4UglYJKrLK8HKg4ZYy+cZ6YFAGtRWAvia280QhHeTAXIKjMhTft25yOOM4xnvTrXxEksEMklrMilImmYFSsRkxtB5yeo6DgGgDdorO0nVY9SMnlRSIqHGXK9c4wQCSp46ECmWOtQ3epS2QjdJUDMMspyFYA5AJI6jrigDUorE/4SO2a+ktYopZJFZ412lcu6AkqBnI6EAkAE0x/EduUS4iEz2pWRgVjz5mwAnHPGCSOnUH0oA3qKwZPESReXJJbOtsYZZnlEiMAE29NpO7O7tTofEcM5WOG2mkuGcxiNHRudhcfMG24wD360AblFY8Gux3Ww2ttcSRmNHeQKMRbhkAjOT746VFb+IoDNYwSo+65SPa+UGS65Hybi2PfoPWgDdorO1++fTtMa5i2bg8aZdSwAZwpOBycZ6Cqlpqs8s9mnmQypNO0bFYHjwBGzdGPqBzQBuUVkz63FDeyQNbz7I5VhebjYGZQVHXPcDpxUC+I4mt1nFndbPJFy/wB3KRHox574PA54oA3aKxrjxFaW8JkkWX5TKHAAyuwgHPPcsuP94VA3iqzEY/dsZt7IYxJHjhQxO7dtPDDoevFAHQUVz8viISm3NlDI0DzRRvM4AUbwGxjOc7SOcYzT/wDhI4vKRzaXQ81UeBcLmVWYKCOeOWHBxwaAN2is3V9WTTLaOWaFzvzkb0XbgZPLEAn2HWoI/EEEk6qkFwYS8cZmwAoaRVZeM5/iA6cGgDZorATxPbv5qi3mMqFAI1ZGLb32Do2Ac9QcYpH8SCG2mmubOSMRzvDjzYxnaOTksBn2oA6Cisy+1m3tLO1uCC4uSBEuQucru5LEAcDvTNI1YalcTmIf6OIY5EyMNli4IP8A3zQBrUVz6eJ4mRXNldrGyJNuIXiNztDfe9e3Wi98SxQG9jS3d5reOSRV8xPn2EA9CSvUHkDIoA6CisI+JbQXTwNHIGQshO5T86qWK4znsRnGM0DX1EbzNBKq+XFIsblEIDlsEsWwPu9O1AG7RWTpGrjU7pvJGLc28cq5HzZLOpBwcfw9qih8RQTQGSO3nYtIIo0ym5mOeCN3yngkhsYFAG3RXP8A/CQj7WF8h9pTYIsDzPO8wptznGOOucY5q8NXh/s2a7eOVfJcxvFgFg4O3bwcHJIxzjmgDSorGm1zyQVksLoTIjSyR/JlEXGWzuwevGOuDT7fXIZ7tIkgm8p5TAsx27S4Xf65wR3xQBrUVlXmtQ2mpw2csb5kZUD7l6scD5c7j9ccVTbxMGgSSGxuCZBG8YdlXerSKhPXjBYdfWgDoaKxrfWvMk8qO3uLh1dvMMaqPLXzGQEjPP3T07DPtUMPiKMRBnhnkVUWSWVVVVRWdlBxuz1XtnjmgDforMs9ZiurlIhDKiS7/JlbG2TYcNjByPbIGRVK98TW8b3cECkzRCVEYlSDIiFiCud2ODzjFAHQUVl3erC0htC0Es0s6FgseB0XcepHaqyeII5TDthniDtGwDIGLo6OykAHj7h9/bmgDdorEh8Qxz28MkFpPIZ38uNVaM7jtLcndgcDkHkU2HxJBKilbW5DSLG0KEKDKHJAxzxyDnOKAN2is3+2IRpkt40co8pzE8WAXD7tu3rjqRznHNUINbnkvHjmiaEJPIvl7QWKpEr4zux1Y8/SgDoaKzdG1eHVRMIlKPCQGUsrdRkcqSK0qACiiigAooooAKKKKACiiigAooooAKKKKACiiigAqC+tY720kt593lyDDbTg1PVLWr7+zdLubsIH8lN20tgH6mgCa6tY7ryfN3fupBKuDj5h0/nVM6LbGOeItObeUPmHzDsUsckgeuefbtVe312Py2eaS2lBkWJRZuZTubOARgY6Uh8S2oZi0NyI1iEjN5fQ+YY9mOudwxQBO2hWsinz5LiZyrLvklJbkqcj0wUXGPSkl0O3lhljaa5/fFjMfM5lyAPm4x0AAwBjtR/wkFiJzFIzx4JVndcKrhdxQn1A/wAOtC69bOkpWK6LRqjFPJIYhydp57cHnt3oAsX2mxXdusBkmjiClCsb8MpGMEHOf51QvPD0JimNo0iuQWjjeQ+WrmMx7sdfumrw1e0/soahvb7OeB8vzbt23bj1zxVVvEdmI9wS4dwHLxrHlk2Y3Z+m4H3zxQBNa6PFbkESzYIHmIr4R2CBdxH0A46VHF4ftI0jQPO0ahAytJxJs+5u9ccfXAzmrV1qUFvHAwEkzT/6pIl3M4xnOPTFZ8PiKB7x0KObYiEpMqEgeZkDd6c8fzoAv2emQ2t09z5k0szJ5e6V9xC5zj3/AByahsdEtrK4imhknzErois+VVWOSuPTIB9feon8RWi2YuvKuvIJb5/KIGF6tz2/U4OAauX2pwWgg3CSRpyRGsa7i2Bk4/CgCP8AsmIPOY5rmNJi5aNJSFDN95h79/rzTF0OzRgYPNhC7tgicqE3AA7fToD9c+pqOTXYIpJEZJpH3sqJFExbCorHIPfDf061an1OCO0t508yUXGPJSNcs+Ru4H0BPNAFX/hHrIg7zM5fzPMJfHmBwA2cD/ZXpjpVqHTI0lhkkmuJpInLq0smcErt+mMVCNctDMiYnCkorOYiFjZvuq2ehOR+YzUQ8QQPFbyw291JHPKkaMI8Ahs4YE9uDx19qAHw6DaQtH5T3CIqqjIspAfbnbu9cZ/Hvmmx+HbONo/Le4VUeORVEnG5FCg9OeAB6VYsNXtr6YRwiUblMkbOhUSqDgsp7jkfmKpXHiKCK8Rdri1HneZOyEL+7HO3154/lQBo3Onx3NgLWWWcqCrCTf8AOCrBgc/UCmQ6YiSxSSXFzO8Tl0Mr5wSpU9h2JqsviC1bCrHcGcuU8kR5fO3d0zjkc9ajHiS1LtiK4aPbEY3VM+YZAdoA65470ASDRUk1K6ubiR2SSZJliViFyqKoJHqCM/l6U+TQrR4YoszKiQC2YLIR5kY/hb17+/JqS21i2uLsQIJQWLKjshCOy/eAPcjB/I4qvea9FDeRwRoxQT+TLKykIuELEZ9QAKAJ5dEspZryV42LXSKj4YjGOhX0PA5HoPSh9IjcIWubszoWKzeZ84DAAjpjHA4x2z1p2matbaizrBvV1VX2uuCUbOGHscGqln4gieGyNzHJG9yF+ZVyiljgDP19OnfFAEz6HbPciZnuDiRJSnmEqzqAAx9TgDPrRFoNnH5fMzCLYIg0mfLVWDBR7ZA/IVPeanDa3SQMk0khAZvKjLbFJwC2Ogzn8jVeDXLY20kkjEmNQ7bEOMF2QYz7qaALOoaZDfSRSStKrRqyZRsZVsbgfrge9Z1l4cihnkMssskAkjaOMucfJGqru9SMfy9Kedfja+SKKGZoCkzGTyz83l4B2Y+9ySP5U9fEFq0Y2R3DTF2jMIjy4IUMSQDjGCD17+tACQeHrSFoSJLhvKVEUNJwFRgyDp2I/wAc0+XQbWSZ5fMuFLtIxCyYGHxvA44BwD6+lW9JujfaXaXTKFaaJZCo6DIzVugCg2lQmztYA8ym1x5Uob51wNvXHPBIqW1sYraR5FaRpHjSNmdyxIXOPx+Y1aooAyxodmIBFiTYIUgHz/wo24fjmon8OWbBlL3GwrKgXzOFWQ5YD8efXitmigDMTRoFMoE1zslDeYnmYVmZdpYj1PX0zzikl0O1d4nVpkkiEYR1fldgYDr7O1alFAGfpmk22nMxtzKdy7PnfdhdzNj82NQ/2DbNI0sktw8/y7JWkyybSSMHHPU9c1rUUAZP9g2eAR5wkHPmb/m3b9+7PruP9OlTjSrb+z5bNg7RysXdix3MxOd2fXOD+FX6KAMl9Ct5FO+a6Z2VkeQync6tjKn24HTGO1TxaTaxMjIrDZObhRu4DFdv5YPSr9FAGXdaJbXF09w0k6M7pKQj4G9MbW/Qe3tSNoNmYIogZUEUYiRlflQHVwfrlRWrRQBlDQ7VZFeN7iNskvslI8wFy+G9txP5kdKrp4dhF0+6ST7IY40ESufm2u7EN6jLVu0UAZ9rpNtbXKzR+Ydm/wAtGbKx7jlto9//ANVNfR4Ga4xJOsU+/fEsmEJYYY49f0zzWlRQBUm0+CU25cN+4VkTDdmXaf0quuiWitCQJAYljRSHIwEVgv6Oa06KAMy20W2huVuC80s4YN5kj5JwrKM4Azwx96b/AGDZiOJV81TFGkcbB+V2MSpHvkmtWigCgdJtjp0lmfMMcjF2fd85ctu3Z9c81XPh+zZJFlM8pkMhdnkyW3oEb9AK16KAM600mK2uGmSe5aRyhctJ9/aCBkY9D0HoK0aKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAqrqdmmoWE1rI7Isq7Sy4yPzq1RQBmf2W8jRG6vZpxHKsqAoi4K59APWoG8PQFyRPMFbO5fl5/e+aO3ZiR9K2qKAMeXQbdri5lVjtn3M8ZVeWZdp+bG4Dvwev5Vn2mgXM5kfUJmVgIVjBZZP9Xv6jaAR8/TGeM11FFAGSmhwLo504ySNCH8xGIXKnfvHbBwfUUqaJEF+eVy3lSxEqiIMPtzwABxtGP61q0UAZ82lo8dmIppIpbUbY5BgnG3aQQRg8fyqnH4cgjwsdxOICIg8Z2kP5ZyMnGeT1x1rcooAwrjw1bTW8MLTTbI4nhOQpyrnJPI4PuKt3ulC7sIbV522ooViY0YPxjJBBGfpWlRQBk2+hW8EyyLLOxG77zA53IiHJxzwg/EmpH0lPsVlBFNLE9mAIpRgsMLt5BGDkE1pUUAZA0OPzMtdXLIzRySKxB8x0xhicZ/hXOPQVEnh6NZWl+0y+cZEk3hEXJUk5IAwSdxBPWtyigDM07SI7KaJ1mlkWGMwwq+MRoSCRwOegGT2FVZfDdvMWSW4na3/e7YflAXzPvc4yeTkZ6Vu0UAZdro0cEsErSs7xOzjCIgOV24woH/66ht/D0EDwFJ5isQiwp28mPO0nj3Oa2qKAMy20eKC6jlEsrRxPI8URxtRnzu7ZPU4z0zUM2gQzXLu883kPMZzANu3eUKnnGcEHpnrWzRQBn6TpiaajKkhcEBRmNFwB/ugZPuazv+EWt1Mey4mHliPaSqEgocqckcD1A4NdDRQBn3em+fei5juZ7eQoI38sj51ByByOOp5HYmqT+HISmxLq4SNlCOo2/OBIXHOOOWPTtW7RQBgyeG4pFeNru48rbKsaDaBGJCCe2TyOM9uKIvDiQymaG7mjlLFyURAOVCsAMYAIVfoRW9RQBV02yFhbRwJNI8UcaRoHxwFGM8Dqe9WqKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//2Q==",ts:1788456000000,de:"presupuesto"}],
  pregunta:"¿Autorizas la compra de $6,400 en material?",
  ops:[{t:"Sí, adelante",r:"Listo, Karina puede comprar."},
       {t:"Todavía no",r:"Anotado. Sigue apareciendo hasta que decidas."}]},
 {id:"demo-autoriza-predial",nombre:"Autorizar el pago del predial",duenio:"cynthia",tipo:"unica",
  recuperable:true,criticidad:"normal",
  cierra:"Tu visto bueno",revisar:"Predial de las propiedades",gasto:"$21,300",
  estado:"espera",espera:"salvador",espera_desde:Date.now()-3*3600e3,ultima:"Cynthia espera el visto bueno",
  msgs:[{k:"bo",t:"Cynthia: ya viene el vencimiento del predial",h:"ayer"}],
  evidencias:[{data:"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAG5AjADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6pooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACikR1kUMjBlPcHIpaACiiigAooooAKKCQoySB9aKACigkAgEjJ6UUAFFFIzBR8xA+tAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUVDeXdvZQ+beTxQRZxvlcIM+mTUNlqun30pjsr61uJANxWKZXIHrgGgC5RVKDVtOuHmS3v7SVoQWlCTKxQDqWwePxqFfEGjuyquq2BLHAAuUOT+dAGnRUK3du121qJ4jcqu8xBxvC+u3rioH1bTkujbPf2i3IO3yjMofPpjOaALtFR3M8NtC01xKkUSDLPIwVR9SabZ3dvewCazninhPR4nDqfxFAE1FUrrVdPtZxBc31rDMcERyTKrc9OCc1JeX9pZRpJeXUEEbnCtLIqAn2JNAFmiqljqVjflxZXltcFMFhDKr4z64NOvtQs7AIb67t7YOcKZpFTcfQZPNAFmioWurdZYYmniEkwJjUuMvgZO0d/wAKjm1CzgaZZru3jMKhpA8qjYD0LZPAPvQBaorPt9a0u4k8u31GylfBbak6McAZJwD2qcX9mbNbsXUBtWIAm8xdhycDDZx14oAs0Vmya9pEUjpJqlgjoSrK1wgII6gjNWft9mDbj7VBm55h/eL+9/3eefwoAs0UUUAFFFFABRRRQAVn69pUOtaVNYXMlxFFLjLW8picYIPDDkdK0KKAavoeG6B4StL74heJ9GudS1oWOnRxPDt1CQMNy5bJzzV1Pi48Vo2oomkDSIbgW/2WS8P294wQvmhenvj0712+h+Friw8deItcmnhkttTjiRIlB3LtGDntz7Vzml/D/WtGD6dpV7ow0lrkzLcXFkJbqNCcmMZyp9MmpV9DjdOcfg01f/AJvEHxAvYPFV5o2l/2LbNbQxyo+qXDRfaiy7gI8DHoMk9a0Na8ZapBN4f0qw0u3/4SDVozKYZ7jMNuqjLEumdw64xTfF/hfXNWu7pYm0C/06aMJFDqVmS9rxg7GTk+vNUR8Or3TbLwxPoepxf2xokbxCS6jJinRySykA5UcnGO1PUp+1u7f1r/AJAfiBqVnZeKbXVNPtItc0SAXAWKRmgnQ4wQThh1HHvUd18Q9W07wgmu6ppdnEt80MenRC4ILFwSzykjCqMZGM8dalPw/wBRvLHxTdarf2kmu63ALfdFGywQIAMKAfmPQc+1aOveBn1fwHpOitdxxX2mrC8M/l7k8yNccqeqnmlrb7gtV6edv0MzSviNPLPrVjcto91e2envfwTabcmWCUKOUPcEHH4GsnWvF+t6p8Lb/XNR022g06aCLykhunSSYmQLJuI5VCM4wckfWuosvDGuT2msrq0+iwm7s3tYIbC02IjMpBdnI3HPp0qC/wDA15c/CWHwmt3bi7SKOMzlW8slXDdOtDvYLVGvk/8AgEet+Ir3w5Dp9jotloWn6etmJVkvrxYUJx/qo4wd2fc8V03gTxEPFPhWy1fyPs7zqQ8WchWUlTg9xkVyepeANUfxbJqtje6aIrqyjs5vtVsZXgCqAWi7ZOO/qetb/wANvDt94V8PnSb64triGGVzbyRKwYoxJ+fPfJ7VXVjh7RT1Wh5x4e1a9074w6nPPdTvptzqkulsjyEpG7JvjIBOBypFM8K6xf3/AMWTqzXE7WN7FeyW0LSNs8uI+Wp25xztJrqdU+HF3e2PiuMX0CXGp6gl/ZyAN+4Zem736jj1q/pvgJtP1/w/dQ3EX2LTdLewkjwd7s3Vh26kmpSf9en+Zmqc7+V7/j/kZ/8AwsTUP+FTL4r+xWv2wy+X5GW8vHm7OvXpV3UPGGuv40k8PaNptjPKbBLtJZ5WRUJPO7GcjsABnJrn5Phl4iPhC58MrrenjSkm862/cN5jfPuxIc8AcnA798V2Vh4Wubb4hSeIHuITbtpqWXlAHfuBB3Z6Y4p7/wBeX+ZS9q7J+X56nE6941Gt/DkX2raJaTXNtq6WU1tJI5jEit99SCDxmun1Lxbrd54o1TRvCmnWNw2lxK9zJeSsod2GRGgUdfc8Vjz/AAz1CTwpf6UL+0EtxrP9pK+1toTOdp75/StfUvCOuWXinVNZ8J6hYwHVYlS5ivI2bY6jAkQr39jS1/r0BKot/L9f+AU9U1lrjxX4CbVNAjt9QuzPkXDkyWjBedu07Tn37VVTx74nvLDxFd6bpGmPBotzLHK0szqZETsoA+8AMkk45GBWzJ4L1F9Y8IXtzq322TRvNNxNcL+8nLjtjgY/lXD+EtI1/WLLxtZaHqFjb293qtxb3AuYmZkB6shU9SDjBHah32Xn+gpOafXX0vt/mdnqHjm9m0vQ73SINKtbXUYPPe61W9WKOE/3NoO5jnjIGOlch4x8UN4t+G2kahJAtvOmuQwSpG+5Nyk8qe4IINb9x8Nr6y1fRbvQrzT2Sx09bArqFuZQuCSZEAONxJJxVSP4Y6tF4cfRF1Kxe2j1ZNRhlaNg5AzuDgcZ6Yxx1p9f67ikqsk010/T/M9cFFFFM7QooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPJf2mE8zwHpqeVbyltZswEuP9U3znh/9k9/bNZdlpFtbeHfFA1i18E+GoJtNkhOoeH3LzRq3DFxsB2j5TxXr+taNpuuWX2TWbC1v7XcH8m5iEibh0ODxms7SfBXhjR7iSfSvD2k2c0kbQu8FoiFkbqpIHIOBxR0aDqmeKeFrXT9A8TeDrHWdA8JX8d6jWNlquhSlHkDRHcZ4f41Zc5JJAJNbPh3wl4Xi+OHi23k0HSEsbLTbK4ijNqgSFvmJdRjCngHI9K9U0Xwd4a0O8a70bQdLsbpsgzW9qiPg9RkDOKvSaLpkl1e3L6fatcXsIguZTEN00YBARz3XBPB9ad+oW6HzPpHiN4vGFn8Q5tL1eJL7WZIp7+S3xanTZAIYlEmeqsqt06k11Wm6R4O1Hxx8VZPGltpTRRXkJWa7CB418gbijHkfh3r22XQ9Km0QaPLptm+kiMRCzaFTDsGMLsxjAwOKzbzwN4VvdQa/vfDmj3F6zBmnls43ckAAEkjngD8qVugX6ngfhuU6nbfCm08fSNL4cmhvWjGoMfKnlVyLbzd3BPl4Khutd74Og03TPjtq1h4OWCLRW0hJtRt7THkR3XmYQgL8quUzkDtXqmqaRpuraebHVLC1vLI4/cTxK6cdPlIxxUWh6JpHh+2+yaLp9lp0Lkt5VtEsYY9zgdTR1F0PJNS0vw7qnx98Qx+KrTTLi0XQrZl+3qhVT5jZILdDjuK83uVN14a8P21klpf6LH4yuIdHXVHJt5LURnarMQT5e7cAea+ltY8IeGNdv2u9X0LSr+8UBDLcWySOAOgyRnv+tT6l4a0HWNOtrPUNI068sbc5gglt0eOPjHyrjA444oX9ffcr+vwscv8K9O+wNqRl0jwhps7hNv/AAj77i6jP+s+VehPHXqa5PSdP8P6x8XPHq+O4LC6u7cwLYRaltZUtDFktGr8YLZyR3r1PQvCvh/w9NLNoei6bp0sqhJHtbZIi4ByASByM0viDwvoHiIxHXtH07UWj4jN1brIV9gSMigR4yJ/C+n+MPhXceG7wf8ACNQ3Gp20NzPIxRXKY2K7/wAO7IXt6Vz/AMVZ4NRv/i/dWUkVzappmmQPLGQ6CQSglcjjI9K+jL7w/o9/pKaXfaXY3GmoAFtZIFaJcdMKRgY9qgg8KeH7fQ5dGg0XTo9KlOZLRbdBE5yDllxgnIHX0oA8n0HSGtbTUZrjQPAFj/xK7kRzaPJuutxiPGCg4IznmvNWln8MfCfStEuDI+keIIdP1LTnYZENyJYjcQ/QjEi/8Cr6X0/wF4S066FzYeGtGtrgKyCSKzjVgGUqwyB0IJB9jV658N6HdaZaabc6TYS2FoVa3tngUxwleFKrjAx2xTvrcVtLHlfjzwl4db4z+BIm0HSzHf8A9oSXam1TFwwjDBnGPmOSTk9zXF/Eqc6j4s1u50LRdSmTwjFb2ukSafabre2uInWabcQRtG0KnAPFfSdxpljdaha31xaW8t7abhBO8YLxbhhtp6jI64pun6Xp2n288VhZ21vDPI80qxRhVkdvvM2OpPcnrUrQb1GeHdWt9d0HT9VsmDW17Ak8ZznhgDj8OlaNVdL0+z0qwhstMtYbSzhGI4YUCIgznAA4HJNWqpggooopAFFFFABUdxPFbQvNcSLHEgyzucAD3NSVk+LLWa+8OahbWqeZPLEVRcgZP40Aa1FcRL4eubjUZJZ4ZmSW6uvM/fnDRFP3YwG6bsEDseaoabZ6hPqBQxXR1CCa0D3BmysQEEfmqRu789Ackj0oA9Gorzx9O1y5sraP7NdxCC0t4Jw8isZikmZABv5yO5I3DipptJ1CK3smhgvriSMuY4ZiqxqDJkD5ZMoQOjZbC8EdqAO8V1YZUhhkjjnkcGq1/qFpp6I99cxQK7bVMjY3HGcD8K4dtDvI0uYxp1w0e678lYpQoE7ylo5fvDjaQN3UYPHNdDqunajczaCYpik1u7Ge4VVbbmFlJweuSf1o6Ablrcw3cCT2ssc0L8q8bBlP4ipa4u88N3kU0wsJZml+x3Dxzs4UfapHzu2jAB5ODjiqtvo93EsBe1v5bAXIaaz+VP8AlmwDACQ5G4qTk9RnHegDtbO+tr1N1rKJV2htyg4IOcc/gakS4ie5kt1kUzRqruncBs4P44P5V59a6Nq0OmQW09lK0JW3WRN4k2bRKW+UOA3JQHJxznnFbngqx1G1Z31OKRJBaQwFpGDFmR5c8gnIwy80AdNczxWtvJPcSJFDGpZ3c4CgdyaqWus6fdki2u4piGVT5Z3YLdM4+lU/Etnd3XhXUbWM/aLuSF1TYoTcT0ABOM4wOtYl7LeRpaRPNqqSy3sIjN6Yhnk5CiPr6kHsKAO2qOeZIIjJKSEGMnBPU47VwGn6BqRtI4rhb0Mz2y3SllVZCr5kfcHJY4zk8ZB6elqbS78C9SOxu/trSOftS3OEeLzVKKBu7IMYwMbT68gHbTTJCm+QkLkLnBPJOB+pp9cQmmagDKBZ3Yvjch5rv7QAkqfaVYYXdz8mewwAR3q14Z06+ttRgkngniZYJFvZZJdy3EpZSrAZPYMc4GAQPoAdAuq2DXctqt5bm4iBZ4/MGVA65+nGfSoI9Z0hLN7uO9sxbGTa0iuMFzzj645+lc9qun3mrS6jC2nS2+2OeO0wEERZlIaR2DZy/I6cA85J4fMNTF3dX9rpMsb3DRRRhljZ4AqOGlC7sZ+baOfrxxQB0r6tp6S20bXtsHuQGhHmD94D0I9c9vWrtcEmj39neJ/ZlvfRxulqsO5o9kYjY7xMM88EkYzyeMGu9oAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArzbxwLZvHdoL06II/7Nbb/AGsf3efNH3f9r+lek1Q1vULbStPkvb1GNvEVDlV3bAWA3H2Gcn0ANAHA6jqd9b290dF1K3t7Sxs7KSGOxije3ZpJXR8ZBJXA4AI6VV8RajqiRarZfbp5Gtl1GOK48tBNhbaKRcMF4OXYZAGRj0zXoV7ren2F+LO6lWEiA3DyOQscaBgo3MTxknAHfB9KdNrujwwRTzapYRwyrujkadArjOMg55GeKNwRw8etTLqy2x1gW2mSXYRtQAiy+LSJ0BcrtO5ixzjnbgVj6Nrl5ZeFoVi1Q2kltpkU9jAI0/06VpJNy4YEtyFXauCN2e4r1V9Q0xbyOwe7tBdSAMluZF3sOoIXqen6VHFrGkXCyyRahYyLbMBIyzIREScDJzxk8UCWhz/jP7A+saIPEQhGjmK4MguD+587amzdnjO3zMZ79Oa5KJ9OvLPRLLUJ4LfWvs1vI97e3Gx7WEOTH5YY581gO31bsD6Zreppp4hT7BeX0kxO2K2iDnCjJJLEKO3U5J6ZrJfxnpTLBNHDdT2rwwzyXKQgpbpKfkMmSCPU4BwOTgUDK3xB1O7077G1tqSWkQSV5I1ljilkxtwUMqlWxzlOCcjnisez8Q6vd+I0QX0UCfaoI0trh0jaWBo0Yt5WwuWO5iCGABGOxrvdU1HTtPjjbVLu1tkdsIbiRUBI9M96Q6npv9ox2hvbT7c65SHzV8xlPPAznHehAzifA2vX2oXmjCXVTqDXdnNLeQlEH2ZlZQhwoBXOSMHOcZFM1V9Ku/GrR6dNaQara3AkmuZrgCaSTy8JbxKTnacruH3ecAEkkdd4bm0aG1j03Rb22nW2jA2RzrI4XsTg5qK58RWlvqy2s9neKhmW3+2NCBD5pGQu4nJ9Mgbc8ZoA8+06bQrWxtpXci2/sZm1vynYO0u+PashBz5hfzRgkHBIPFK8VsbWw2XOiwaRd6i8tzbiQT2lmfIxHG4VgpJI3EZC7j34z21p4v0+eKWRbLUEVoPtUObbJu49wXdGASTyy8HBwwPSnjxRZmB0/s++F59o+ymw8pPOL7N/97bjZ82d2Me/FH9fiBY8DT/afCemyCBYF8sqqIWKlQxAZd3O0gAjPYit2oLC5F5Zw3CxTQiRQ3lzIUdfZlPQ1PQwCiiigAooooAKKKKACkCgEkAAnqcdaWigAooooAKKKKACiiigAooooAKRkVmVmUEryCR0paKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACob21ivbOe1uUDwTxtHIp7qwwR+RqaigDzr/AIQ3Vm0xJbu6jn1SG7hdWjmaPzIIUZI134O1juZzwRuP41bs/CNxGzSGKBDJY3kLK87TESzyK2dxUcEA5wByeAa7qigDhdN8NapaRy2Tw6fLBcmKR7p3JkgZbdIjsXbywKZVsjAY/ivhbw3f6SiSXFpDPc29mllG0l8zpIoZc4XZhF+XIHJzx7nuaKLgYXiyzvL+yFtBZ217aShluIJLh7dmHG0q65xznIxzn8DzK+E9Zh0ufTfMs501G1t7e6uC5UwmMbWKrt+YFMAdORz1r0OigDl/GekXmotbS6bEv2mJJI1nW58l492OMFGV0O0ZUjsKyLPwjfxawJLwR3MD3cN6zpdNEiOiIDiIKc4KcfMBg4PTnv6KAPPfh7pF81r4du7i3t7W3sbKaNdjHzJTKyn5lKjbjbk8nJNal7pmrX/iR5b+2t5tNjJS123ZXyQy7WlKbPmk5YD5sAdMEk111FD1A4O30XxJb21q0Kacl3penNYWbGViszMYwZG+X5QFjBC88n0qOTwrdS21hLLplpNPZ3Mk0sNxemX7Z5ke1nd/LHzZxgbSMDAxxj0CigDJ8KafcaV4fs7K8kWSeJSG2sWVcsSFBPJCghQT2Fa1FFABRRRQAUUUUAFZPinUr3SdGlu9M0uXVbpGULaxNtZgWAJzg9Bz+Fa1FAmrrQ8x/wCFgeLf+idal/4ED/4mj/hYHi3/AKJ1qX/gQP8A4mvTsD0owPSlYy9nP+d/h/keY/8ACwPFv/ROtS/8CB/8TR/wsDxb/wBE61L/AMCB/wDE16dgelGB6UWD2c/53+H+R5j/AMLA8W/9E61L/wACB/8AE0f8LA8W/wDROtS/8CB/8TXp2B6UYHpRYPZz/nf4f5HmP/CwPFv/AETrUv8AwIH/AMTR/wALA8W/9E61L/wIH/xNenYHpRgelFg9nP8Anf4f5HmP/CwPFv8A0TrUv/Agf/E0f8LA8W/9E61L/wACB/8AE16dgelGB6UWD2c/53+H+R5j/wALA8W/9E61L/wIH/xNH/CwPFv/AETrUv8AwIH/AMTXp2B6UYHpRYPZz/nf4f5HmP8AwsDxb/0TrUv/AAIH/wATR/wsDxb/ANE61L/wIH/xNenYHpRgelFg9nP+d/h/keY/8LA8W/8AROtS/wDAgf8AxNH/AAsDxb/0TrUv/Agf/E16dgelGB6UWD2c/wCd/h/keY/8LA8W/wDROtS/8CB/8TR/wsDxb/0TrUv/AAIH/wATXp2B6UYHpRYPZz/nf4f5HmP/AAsDxb/0TrUv/Agf/E0f8LA8W/8AROtS/wDAgf8AxNenYHpRgelFg9nP+d/h/keY/wDCwPFv/ROtS/8AAgf/ABNH/CwPFv8A0TrUv/Agf/E16dgelGB6UWD2c/53+H+R5j/wsDxb/wBE61L/AMCB/wDE0f8ACwPFv/ROtS/8CB/8TXp2B6UYHpRYPZz/AJ3+H+R5j/wsDxb/ANE61L/wIH/xNH/CwPFv/ROtS/8AAgf/ABNenYHpRgelFg9nP+d/h/keY/8ACwPFv/ROtS/8CB/8TR/wsDxb/wBE61L/AMCB/wDE16dgelGB6UWD2c/53+H+R5j/AMLA8W/9E61L/wACB/8AE0f8LA8W/wDROtS/8CB/8TXp2B6UYHpRYPZz/nf4f5HmP/CwPFv/AETrUv8AwIH/AMTR/wALA8W/9E61L/wIH/xNenYHpRgelFg9nP8Anf4f5HmP/CwPFv8A0TrUv/Agf/E0f8LA8W/9E61L/wACB/8AE16dgelGB6UWD2c/53+H+R5j/wALA8W/9E61L/wIH/xNH/CwPFv/AETrUv8AwIH/AMTXp2B6UYHpRYPZz/nf4f5HmP8AwsDxb/0TrUv/AAIH/wATR/wsDxb/ANE61L/wIH/xNenYHpRgelFg9nP+d/h/keY/8LA8W/8AROtS/wDAgf8AxNH/AAsDxb/0TrUv/Agf/E16dgelGB6UWD2c/wCd/h/keY/8LA8W/wDROtS/8CB/8TR/wsDxb/0TrUv/AAIH/wATXp2B6UYHpRYPZz/nf4f5HmP/AAsDxb/0TrUv/Agf/E0f8LA8W/8AROtS/wDAgf8AxNenYHpRgelFg9nP+d/h/keY/wDCwPFv/ROtS/8AAgf/ABNH/CwPFv8A0TrUv/Agf/E16dgelGB6UWD2c/53+H+R5j/wsDxb/wBE61L/AMCB/wDE0f8ACwPFv/ROtS/8CB/8TXp2B6UYHpRYPZz/AJ3+H+R5j/wsDxb/ANE61L/wIH/xNH/CwPFv/ROtS/8AAgf/ABNenYHpRgelFg9nP+d/h/keY/8ACwPFv/ROtS/8CB/8TR/wsDxb/wBE61L/AMCB/wDE16dgelGB6UWD2c/53+H+R5j/AMLA8W/9E61L/wACB/8AE0f8LA8W/wDROtS/8CB/8TXp2B6UYHpRYPZz/nf4f5HmP/CwPFv/AETrUv8AwIH/AMTR/wALA8W/9E61L/wIH/xNenYHpRgelFg9nP8Anf4f5HmP/CwPFv8A0TrUv/Agf/E0f8LA8W/9E61L/wACB/8AE16dgelGB6UWD2c/53+H+R5j/wALA8W/9E61L/wIH/xNH/CwPFv/AETrUv8AwIH/AMTXp2B6UYHpRYPZz/nf4f5HmP8AwsDxb/0TrUv/AAIH/wATR/wsDxb/ANE61L/wIH/xNenYHpRgelFg9nP+d/h/kZPhbUr3VtGiu9T0uXSrp2YNaytuZQGIBzgdRz+Na1FFM1SstQooooGFFFFABRRVHXNQGlaRd35jMot4zJsBxux2zQBeornNP8R3EmoWNrqOlvZ/bkZreQTLKrYG4g4wRxVeXxTe+ZqbW2itPa6fK8csouVU/KMkhSPT3oA6uiue1PxKYLXSJbCza7bUyBEjSCLGV3ckg1Zi1S9TTL671HTRam3jMioLhZPMAUk8gcdKNgNiiuXsPFU0h099R0uWztr8qsE4mWRSzDKhsYK5rVt9WE3iC80vySpt4UmMm7htxPGPwoA06K5+PxLE/idtI+ztsBMYud3ymUKHKY9dpq6+rBfEcWk+SSXtjc+bu6YbbjH9aANOiiucvfEN4mtXmn2GkPeG1jSSRluFQ4YZGARz09aAOjornbvxTAnhmPWbS3edHdYxEzbGDFtpB64INXtJvdSuZ3W/0pbOMLkOLlZcnPTAFAGpRWZ4j1UaLpjXhhMwDomwNt+8wXOfxrToAKKwLPxLFc+JZtKFu6ohZEuN3yySIFLoB6gN+lLquvy22srpljZLc3Rh88iScQrjOAASDk8UAb1FVtNuZLuxhnmtpbWRxloZcbkPocVk6nrt3b64NM0/S/tsv2cXDH7QseF3be4oA36K5iXxag8NR6tBZyOzTi3MDOFKvv2kZ5HWrOna9cS6wmmanpr2NzJEZosTLKrqDg8joeaAN6iuYl8TXMkl42maPNe2do7RyziZUyy/eCKeWx+FTah4mSLSdMvtPtjeDUJUihQuIzlgcZJBx0xQB0NFYOma+9zcX9re2L2l7ZxiVojIHDKQcEMPpVebxSw8PaVqcFgZJNQkSJIDMF2ls4y2MdqAOmorK0+/1CWK4fUNMFmIl3Li5WXf1yOBx0rGsfGMslrZXt9pMtrp12yolysyyBSxwNw4IGe9AHXUVjeJ9cGh2kUiWz3c8rlEhRtpbClmP4AGl1XXYrLwy+swxmeERJKqBtu4MRjn8aANiisCx8QTNqVvY6rpslhNcqWgbzVlSTAyRkdDjnBqA+ItQm1LULXTtGFytnL5TubtY8nAPQj3oA6aisTWtdfTP7Oh+yB7y9JVY2mCIpC5OXP5cDmruj3lxeW7teWMllMjlCjMHDf7SsOo/KgC9RRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABWZ4nsZtS8P39nbbPOnhZE3nAyfWtOigDD0Tw3Yaa0FwIma9SIJ5kkrybeOdu48fhWBd+CTeR63LL5a3txdNPav5jFdvBCuvQgkEHg9a7uigDkvEuiXuq2mikWdk7Wr75rZ5CsZ+TG0EDpn2qew0m4j0PVLJdNsdPM8TLGLeYurMVIy2VGO3rXTUUAcZaaHq91b6PY6ktnb2OnNHITFI0jzMgwo5ACjPJ61rW2mXMPirUtS/dmGe2jjjG7ncpOc8cDmt2igDg08IaimnRXIv3bVkuvtphLjyDIW+bnbn7uRmtfVrDVF8T2+q6dBazKtobdkmmMZBLZzwprpaKAILB7l7VGvYo4bg53JG5dRzxgkDt7VzlxYa1a+JdSv9MgspY7uKKNTPMy7CoPJAU56+tdVRQBxt94VuB4KXSbd4p7ozLPI0hKK7b9zdjgdRV7w1pkun3crHRtOsI3TBe2nZ2Yg8AgqOOtdJRQBieMdNudW0KS1svL88yRuPMbaPlcHrg+lTWU+sOs/2yytISEJi8u4L7m9DlRge9atFAHCW3hC/tLPT7mK+eTU4LgXLxO4EJZj+8wdueQTWr4m0u8v7tT/ZumalZ7MKlwxjkjbuQ4B4/KumooAyfCun3Ol6Hb2l5MJpkzkhiwUEkhQTyQBxzWfqfhsan4pN7d7vsYsxCBHM0b795PO3HGD6101FAHNeIvDi3PhyHStKiiihjmjfYWKjaGy3PJz1pNI8O/2N4kmubGOI2FxCFbe5aSFgeik5JU9xnrXTUUAchFpet6UNQs9KSymtLqV5opZpGVoC/wB4FQDuAPSlvvCrtoGh6VC4eKyuI3mcuULKM7ipHIOTxXXUUAZNpoVnp1reJp8RWW4Uh5JHZ2Y4IGWYk45rnrrwzfSeDtE03y7WaeyljeaN5CEcLnIzjvn0rt6KAOb0HTJrOG9i/sqw09Zk4NtOX3tgjnKjHWsmy8O6zNomnaJfrZQWFuyNLLHKzyShW3BQNoAye9d1RQBzer6Fdar4hhuZLqS1tLaArCbdx5hdj8xOQQBjAqi3h3UB4HvdDDxO4cpbOz9Y94Zd3HBxkV2VFAHM2+mapf6zYXmrLa28NgGMUUEhkLuw25YkDAA7Vk3Xhi6bWtUupNJ0zUI7mbzI2nuGRkG0DGAp9K7yigDn9dsb68sbNEsdNuolH+kWlwTjOONj44xz25pPB2kXOk292Ljy4o5pvMitYpGkSBcAYDH1610NFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSOcLmlpsn3KGJ7DfMPoKPMPoKgnmjt4JJp3WOKNS7uxwFUDJJ/CuctvGulzwyzGLUIYVtnu45JrR0WeJBlmQnrxzg4JzUXMXNrdnVeYfQUeYfQVSivoJNNS/37bVoRPvYYwm3dk+nFY+m+MNJ1G0025t5J/Kv7hrSIvEV2ygE7XB+7kDjPXinqHtPM6XzD6CjzD6CuWuvGmmQziGOK/uZmuZbRUtrYyF5IlBfGOoGevqD6VrRarb/ANjvqV0s1lbRo0kn2uMxtGq5yWU9OmaVwU79TT8w+go8w+grA0TxLZ6vdC3hgv7eVovPjF1avEJY+PmUngjkccHnpVW28aaXeaXdX9il7dw2sxhlWC3ZnHGd+3+5jnd0ouxe08zqfMPoKPMPoK5M+ONKTw8dbnjv4LAsixtLasGl3DIKL/EMZOfQGrureJrHTpLSIJdXk91EZ4obOEzO0Yxl8Dt8w/Ondh7TzN/zD6CjzD6CuUv/ABpYWclmrWerSC8Cm3aKyciQlS20ZwdwAOR1GKbdeOdLtJ7tLiDUkjs2Rbmf7GxjgLKGG9h04YZ9KLsPa+Z1vmH0FHmH0FYl54i06z12w0ieVheXql4gEJXHOMt0GcHHrg1Z03VLbUZ7+K2Ll7Kc2025cYcKG49RhhzSux8/maXmH0FHmH0FR0UXY+ZknmH0FHmH0FR0UXYczJPMPoKPMPoKjoouw5mSeYfQUeYfQVHRRdhzMk8w+go8w+grH8Qa3a6Fb28t2lxJ58y28UdvEZHd2BIAA+hrKPjjSjFAYodRlnluJLX7MloxmSVF3MrJ1GFOfpRcl1Lbs63zD6CjzD6CuTbxvpRhtWhi1CeW4mlt1t4rRjMskYy6snUEA1JdeL7K2ezjlsdW+0XUTzLAtk7SqiMFZmUcjkj86LsPaeZ1HmH0FHmH0Fc7F4u0WUQul4DBLZyX4m2kIIUYKxJPQgnp160aP4r0/Vb2O0jjvbaeaIzQLd2zQ+fGMZZM9cZHHXnpRdh7TzOi8w+go8w+gqOii7K5mSeYfQUeYfQVHRRdhzMk8w+go8w+gqOii7DmZJ5h9BR5h9BUdFF2HMyTzD6CjzD6Co6KLsOZknmH0FHmH0FR0UXYczJPMPoKPMPoKjoouw5mSeYfQUeYfQVHRRdhzMk8w+go8w+gqOii7DmZJ5h9BR5h9BUdFF2HMyTzD6CjzD6Co6KLsOZknmH0FHmH0FR1k6vr9jpN0Le8aQSG1mvBtQsPLiAL/jyMDvRcXOza8w+go8w+grmIPGejTjQvKmlY61n7IPLOTjru/u+nPeo9J8b6RqU1siC9t0ug5t5rm2aOKbYCW2ueOACfwNF2L2vmdX5h9BR5h9BXL6b4z0rULq3hiF5Gt0GNrNPbPHHc7Rk+Wx68AkdMjpUOneOdKv8A7L5UGpRrdozWrS2bKtxtUsVQ9C2AcDvRdh7TzOu8w+go8w+grj4/HmmNb6jO9pqsUOnqxuXls2URlQCUP+1hhxWxo2sLqrSBLDUrUIAc3dsYg2f7uetO7BVL7M2PMPoKPMPoKjopXZXMyTzD6CjzD6Co6KLsOZk6HK5pabH9ynVZqtgooooGFFFFABTZPuU6myfdpMUtjN1mwj1XSL3T5mZY7qF4GZeoDKRkfnXMroviS40KbSb680tbb7BJZq0Eb7pmKbFds/cA6kDOa7PB9DRg+hqLHO431OJm0PxHfeFJdCvJtLgieCK18+2eUv5YIEnDLjJQED3NQyeCbyK31iC11LzVuJIL2zluQN8N1Fj5jtUDaQqDgZ613mD6GjB9DTF7NHneqeBLqXS/DtvbtZXEmntNJci5eWNZ5JR8zAp8w+Yk/lW9/wAI8954HuNBvhBamaF4P9Fd5FQEnBBf5j68102D6GjB9DQCgkcm1j4sn0u7t573SYZDaNbxGBJDukIA81ieVwM/KAeT1qrovgyfRLi6Sy1F7iyudNFm6XONyugKxldqgbQrMDnnp1rtsH0NGD6Gh6hybPscN/whl5caf4YsLnUfItdJtSkjWuN8k2wRgjepG3aX6jPzVXl8HakdD0qwlGk6h/Z6PDG9wZYpAu792yyp8ykLgMMYJHWvQcH0NGD6Gh6i9mjkk8N35tfCaXWoLd3Gkz+dcTy7t037t14685Ydew9aytZ8AzX95rl6t0n2i6u4rmCJ5JPIdUVAY5oxwwO084JHH0r0LB9DRg+hoG6aaszgda8Fahqd/qepjVPs9+88ElnEnMKCHBQPld3UvnaR97vWhpWk69peu6pNbnSpNP1C++1PveQSopVVIAA2k/LxXXYPoaMH0NC0DkV7/wBf1qJRS4PoaMH0NBQlFLg+howfQ0BYSilwfQ0YPoaAsJRS4PoaMH0NAWOe8ZaA/iCDTIUm8lLa+juZGV2RyihgQrLyG561mah4Es5bjR0tGkhtLW5mubk/aZRPMzx7d3mA7t2cZJPQYrtMH0NGD6GgTgnq0eZXHw/v/wCz9JtkbTboafdXMpM7yobhZBhWkZPm8wdznBwK0Y/Dmu2d7pF9pq6NFNZWs9qYXkneMB3VgQxG4/d5z613mD6GjB9DQT7NLY87X4dubVLSa/V4X0y6s5pQhDGWaUSl1XptBzxn0rX0/RNZudc0q/1+fT8aZFIkKWYfMruoUu277owPujPJ611uD6GjB9DQNU0hKKXB9DRg+hoKsJRS4PoaMH0NAWEopcH0NGD6GgLCUUuD6GjB9DQFhKKXB9DRg+hoCwlFLg+howfQ0BYSilwfQ0YPoaAsJRS4PoaMH0NAWEopcH0NGD6GgLCUUuD6GjB9DQFhKKXB9DRg+hoCwlcr4t8NXOtagLi3nhjUaZeWOHznfMFCtx2GOa6vB9DRg+hpWBq+h51p3gC5s9Ztbz7XA0VrdxTQx4P7qMIxlUcdWkfcPYVc8N/D6zsNEht9Skkub5YZofME8jRxCTcGMaMcKdrYzj1rucH0NGD6GmQqcU72OGsfDGtSf2Fa6tdaebHRiHha3VxJcMsZjQsDwgAOSBnJqv4X8BzaFceH7gXKXEtlC8VzHLLI8YLDiSEHhGHToAQTXoOD6GjB9DR5h7NHF3/hO7udC8X2KXFuJNZuHmhY7sRgoi4bj/ZPSrfgvQrvRXuRPa6bBHKq82s88hYjPXzOgwe1dTg+howfQ0D5Fe4lFLg+howfQ0FWEopcH0NGD6GgLEsf3KdTY/u06rRvHYKKKKBhRRRQAUUUUAFFNkLLGxjUM4BIBOAT9a47Q9Z8Q6nouugppSavZag9oh/eeQqgRksf4mIDt/d3ED7ueADs6K43wT4pfUrXUH1G9sJraC7+zW19Gv2dbn5FYjY7EhgxK9ecZFUrTxXqrz2GpTfYjot/qsmmR26xMJowryIspfdg5aPldowGHPHIB39FeZX/AI+1Rj4jn02yhaxtdNW7012id3uD5jxmQqDyhK5UDkgZ7iuj8MeIYp4r3+0tatJpIHRWV7J7BotwJG5ZWJIbBIPAOD1oA6qivP5vFmqrPcamv2L+w4NXXSmtzGxmIMixGYSbsffb7u37o65NVrXxjry2OmalNBYXEGtW1xNZ2kamN4XSJpY1eQsQwZVIJwuD7UdLh5HpNFcJ8PfFl34g1CeCS4tb22WzhuTPDbvbmORy2YtjsSwAGQw+hru6LAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFYHi3WLjSP7G+zLE32zUoLOTeCcI+7JGD14p+t+IBp2oWmn2tjc6hqFzG8ywQFF2xoVDMzOwA5dQBnJJ+tAG5RXH2/jy1v1gfR9N1LUY2torqYwIu6BJCwUMpYEtlGyq5IC/TJc+OLeLXn0d7S4guHeWGCSR4jvkSNn/1YcuFIQkMVAOPcZHoC1OworlNN8UeT4A0TWtTVp7q9t7X91AoDSzzBQFUEgDLN3OAPpQ3i+QTW9mNC1M6tN5rfYj5SsEj2hpN5fYVy6gEHknHY4GC7nV0VwVz8TdOjsmvLbTtTurSKzhvp5I0QeVFIzoMqWBLBkYFRk8VZuviBZ2aXMd7YXdtfw3aWYtZXiUu7xmRTv37AuwEkk8YI64yAdpRXGWPxBsL+awhs7S7mluDcCTa0ZW28h0WUuwbbgbwQVJyOlMfxqLjSY74adqljZzm2ktrt4Y3WaOWZEHG75Sd4OGwQpyBkYoA7aiuJv8Ax5BFqd1pYtJ7e72XC2zyvE294o2c5jDl1UhSQWUAge4zveHtT+0+E9K1PUpoo3ntIZpZGIRdzopPXpyaNwNiiuf8Za1daRa2EWmwwy6hqN4llb+eT5aMwZi7Y5ICoxwMZOBkZzVK71jVPC9neXviaeyvNPRYxDLaRGCVpXcIIyjMV5LLhtw75HGaAOtoriYPiHZXHlwwWF1PqDXgsTawyQyESNC0qner7NpVTzngg5FVn+IyrPG/9kXYsksL28umZ4/Mga2kCOm3d83ORkEg5XHGcAHf0Vx03jlY48rompySx2n9oTwr5W+G3JYKzZfBZgrEICTwc4NdVY3UN9ZW93avvt541ljb+8rAEH8jQBPRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFcb8UfEGqeHdC+06VEqgiTzbx4HnS2CxsykovPzMAuT8ozzVK78QayfBqa3b6roz7QyKLS2a5S7kL7Ygn7xSjMSqlTnBJ54oA7+iuV8S6xqmg+CEv7kWh1JBAt1IqMYYizqskgTO5guSQoOTgCuWXxxq00EC289vJC2py2n9oRaZNNviSDzN3kK25W3nZycHGRwRQB6nRXAReJdW1We2s/D2oaXO6ac1/LeS2rhJj5jIsYj3gx8o4YkkjGMZrrfDOqLrnh3TNUWPyhe20dxsznbuUHGe+M0AaVFFFABRRRQAUUUUAFFFDEKMk4FADJlZ4XWN/LcqQr4ztPrjvXG6b4Mv7O31WM+Jr/AH3832vzYYYonjnynzDAwVIQAoQQQT612fmp/eFHmp/eFAHNaP4QtbeW+udZkTWL68mSeWW5t4woZE2JsQDC4Hfk89aqjwLbvfBbi+uJtGS5lvI9NZFCLNJu3EuBuK5kchc8FvYY6/zU/vCjzU/vCgDjYPh1pNlqE95pEt5psz2S2cbW8zEwgMSGXcSM8gYIIwOnWruneEYPtN7d6/OutXd2scbNc28YjVI9xRVQDAwXc55OT+FdL5qf3hR5qf3hQBycngmJtVMq6hcLpbXq6k+nBE2NcDBB3Y3bdyhtv94enFVI/h1aPB9ivtRvLnSobae1s7QhV+zpMpVvnAyxCkqpPQE9etdv5qf3hR5qf3hQBzug+GpLDVzqd/qU2oXi2osomaJIgkQbd0UcsSBk+3AHNdJTfNT+8KPNT+8KAHUU3zU/vCjzU/vCgB1FN81P7wo81P7woAdRTfNT+8KPNT+8KAHUU3zU/vCjzU/vCgB1FN81P7wo81P7woAdRTfNT+8KPNT+8KAMXxboB1+ztIo72WyntbqO7imjRXIdM4yGGCOazZfCuoyS216fENx/bECSwrefZYsGGTaShjxtOGRWB659RxXWean94Uean94UAcba+A000W6aHq9/p8YtobS58sIzzpGWKtuIyrne4LDsenANVo/hzFDfRXEOqToIL6W+iX7PETmXzBIrvjc/ErAEnjjriu781P7wo81P7woA56Xwnbv4Q07QluZ0/s9Lf7NdKF8xJIdpR8EYJyoyMYPIqm/hG8MtvfL4gvP7aiEqfbGhjZTHJtzGI8YCgxoR3BBznJrrfNT+8KPNT+8KAOKT4dafFpF9p0N3dLDdWEFgWO0sBE7vvzjlmMjE9vSrGt+BrXVL+8vjdSR3U1zDdxlokkSN44jFjawIYFWbIPrkEECut81P7wo81P7woA5rTvCMFtdWNxcXLXElvbXFsy+THEkgmZGb5UAAxsAGO3XJ5qlb+BnTTotOn1y/n0+2+zraQMkYESQypIobA+dv3aruPbPck12Xmp/eFHmp/eFAHAR/DSCK4hkj1W4VYLi4niXyIskTiQSB2xuc4kOGJ4wOtdhp+kW1roNnpMqLdW1tBHBiZA28IAASOmflB+tX/NT+8KPNT+8KNgMvxLocGvWCW80s1vNDMlxb3EBAkglU5V1yCPUEEEEEg9axbvwXLqlhdw67rl7fSyiMRny4444DG4kVliAKltwGS2cgY4GRXXean94Uean94UActYeD1gk06W4vjLNZ3pvF8q2igQkxPFt2oBxhyckk5744qjefD2GdZVi1O5iSaLUIJh5aNvju33sBkcFWxg+g5rt/NT+8KPNT+8KAOV1rwcb2Z5bHVLnT5J7FdOuWjjR/NhXOMbh8rjc+GH97ocCul0+0h0+wtrO1XZb28axRrnOFUAAfkKl81P7wo81P7woAdRTfNT+8KPNT+8KAHUU3zU/vCjzU/vCgB1FN81P7wo81P7woAdRTfNT+8KPNT+8KAHUU3zU/vCjzU/vCgB1FN81P7wo81P7woAdRTfNT+8KPNT+8KAHUU3zU/vCjzU/vCgDC8ZeHpfEOmSQW2p3WnTmKSJXiIZGDrtIdDww/IjsRVS38GW0NtZRNeXMrw6n/AGrPI4XNxNg/eAAAGSCAoH3R711Hmp/eFHmp/eFAHPa/4fudbmnSfUHitUNtcWYjRS0FxE7Pv5HzA/Jwc9D0qpF4SvLdrm7ttfu4dWurj7RPcLDH5cuIxGEMWMbQqjHOc857V1nmp/eFHmp/eFAHFf8ACAi3gi/szWb60vTFNDc3eyN3uFlkMrkgjCtvZipA43EYIrrdLsYNL0y0sLNNltaxLDEuc4VQAB+Qqx5qf3hR5qf3hQA6ihSGGQciigAooooAKKKKACiiigAopsrMsbMi72AJC5xk+ma4/RvEGu6lomtuLHTk1ayv3s0iM7eSoAQ7mcjJ2hyTgDO3AxmgDsqK5XwL4jn1y31Frp7GeK2ufIhvbJj5FyNikldxJypJU8kZHWlg17VD4x1PSJrC2EMNiLu12TEySnzGT5iRtXO3jrjv6UAdTRXHaLruv6t4cvZYLLThrEGoS2WzzX8hAku0uTgM2Bk4AGSO2au+C9cudXtL43/2Qva3klolxakiG5ChcsgYk8ElSMnlTzQB0lFcSfEHiG18S2dheWemSC9Fy0VpBK3nQxxqSkkjn5drEKp4GC4HODRpOv8AiFtYvtKvrTS7q+hskusWkrokEjNgQyM2eSMsGABIUnbyMgHbUVg+BtYuNe8LWWo3scMVzNvEiwklAVdl4zzj5e9b1ABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRXLfEPxFP4b0qyuLd7KI3F9DatNeZ8qJXzljgjpj1rK0Dx8J7G+lvxb3vlX6WFrNpWXS9kdA21Ax4K5IOTjgnNAHfUVyaeObCV4beCy1KbUHmlheySFfNiMQUuWy23ADpyGOd4xnNZGh/Em3k8N2N7qVvPJcNYjULs2sQCW0JZgHYMwPRGO0bm+U8UAeh0Vyd3470y3u5IhBfT28d1DZNdwwhoRNLs2JnOf8AlohJxtGcZzxVm18W2c+vx6TJaX9tNM8qQSTxBFmMfLbRu3DgEgsoBAyM0AdHRSb137Nw34zjPOK4DXvF2o2viPWrGC80CxttNt4Zt2pO6tKXVyeQwAA24zg9aL2Glc9Aori/+E/tYNJ06/1HTNRtobm1guppPLHl24lwApJILEE87ASBgkDNTy+O9PWW7jjs9Sla3vf7OXZCv7+4z/q48sMkAFiThQOp7UeQvM62iuZ0Xxpp2rajHYww3sN08tzBsniC7Xg2eYDyf+ei49eapN8RdI+xxXUMF/PE1p9vl8uJcwQbmAdwWHXY/C7mwp4oA7OisbVtZhtV0aSKceVf3SQxssXmCQMjMBnI25C53c/TmsO1+I+jy2K3s9vqNpZyWL6hBNPAAJ4kKhtgBJ3AuvBAzkYzQB2tFcPZ+OSfEd7Z6hY3VnBH9hiiimiAlEtw8ijcQxUr8i8g8c5q9e+N9Pt75rGK2vbq9+1yWawQogZ3jjSRiCzKCAsi98k9AcUAdVRXEz/EG2tb3UUu9K1OK1tIbOTzTEN7NcNtVPLzuDZwMY/vdMDNqPxaq/bmay1CeWK6jt/ssduqvCzQrJh3L7MANyxKjJ2jJxkA6yiuR0Hxcuu+IrSGwA/s24017sGRCsiyLOIip5xwdwPuOtddQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFcb8T/FF74X0Rbmwgh3SeYGurhWaGDahYbgvOWICjJAyeT65b+M9Yn+xW1r/AGDFcyWU98109y0lrMkbhF8plwfmzuJOdg4waAPRqKwtN1qfWfB9lrOkWsbz3ttHcRQzS7FG8A4ZgDwMnoOcVlabruuax4N0PVLCHTIJ7yITXctyzeTbrtJJCggtyAOSMDknjFD0BanZUV5zpnjLXtbt7KPSrPTo702D387TmQxSIJWjj8vGCBJsLhjnCkcHNdt4d1SPW9B07VIUMcd5bx3CoxyVDKDg/TOKANCiiigAooooAKKKKACiigkAZJAHvQA2YO0TiJgkhUhWK7gD2OO9cXpvhLWrO21dB4kCS39x9sE1vYiNo5spnguwZCEwVPJBPNdp5if31/OjzE/vr+dAHKaV4KtFkv7jxB9k1e6vLhLlt9oqQxsiBFKRktg46sSSfwAok8N6wfFs+tw63ap5lv8AZVgbT922MMzL83mDJBbk4GQOgrq/MT++v50eYn99fzoA4SPwTrC6FqmmnxJGov7prp5IrEoQXk3ypxLna33eCCBnmtzT/DUP2O1h1uHS782ThrPy7AQpbgAYCKWbBGOoI7elb/mJ/fX86PMT++v50Acfo/hbWNNvNQuBrttNNetI8k76d+/5B8sb/MxtTIwu3GB6kmn+GvDWr6Fpk1pFrFlIzpuE7acd7zEjdLKfNJkY4OenUdAMV1vmJ/fX86PMT++v50AYHgfQbvw3o40661GO+ijZjEy23klQzFiD8zZ5b2roab5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dAGJ4u0KXXbWxW2vBZ3FneRXkcjQ+apZM8FcjIOfWsSTwLNPcz6ldauX1t7m3uUuEtlSJDCrqo8rdyCsjgktk5GCMCu28xP76/nR5if31/OgDh7fwNeWuoRara60E1kzXElzO9oGjlWYRgqI9w27RDHtO49DnOaz4fhZBb29osV7aTzRWSWUst9psVyXCMzK6BjhH+dgeqnjjivSPMT++v50eYn99fzoA8u1rw5q39vTWGlw3aaZc6raak+6KLyf3bRFz5m7cq4i/wBXsyW6HaeNLRvhz/Zet6dqMWpRNJZXM8wY2SiWdZd24SybtzsN3DcDjlT27/zE/vr+dHmJ/fX86AIvsdt9uF75EX2sR+T520b9mc7c9cZ5xWLH4UsT4l1PWLuOC7kvEgRUmgVvJ8oMMqTk87v0rf8AMT++v50eYn99fzoA4Lxf8OU8Rajqly2oRxfbookzJZrNJAY/u+W7H5VJwWUDJ5wRmrk3gqQ2TeRqfl366sdYinNuGRZCCChTdypBYdQeevFdj5if31/OjzE/vr+dAHm/h/wdrCX9xqEmofZNRg1S8kSWS2WRLiGZYskIGG3lBt54xyDmnR/C6CCCyWG8tJpobFLCSW+02K53KjMyuoY4R/nYHqp4yOK9G8xP76/nR5if31/OgDI1jQo9RXR1WXyV027S5VVQYbajIFxwAPm7elc5d/DqC68P6XpUmoyhLHS5dNEixgM2/wAvEnXgqYgccg5ruvMT++v50eYn99fzoA4a48DX95cXl7e66smpzNZSRSJZBIomtpGdfk3kkNvORu+hFJN4Eupba8jm1SyuzeXsl7cR3umJNCzNGiABNwKldmQQ2eSDnrXdeYn99fzo8xP76/nQBwUXw7aJUiXWZXg8iwik82EPI72ku9X37v4hkEYPY545sa14CXUdTmvVvot0l/8AbvIubUTwk/Z1hwyFhuI27gexPQ12vmJ/fX86PMT++v50Acf4M8DjwzeQTLqDXKQW81tGhgWPCST+dzg4yCSOABjHArsqb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dADqKb5if31/OjzE/vr+dAGB420G817SZbfTtUl0+dopYvuh4pQ67SJFPX1BBBH6VhS/D1v7NjtoNStzIZprmaS502GYebKRmSJTgRMMcYyOTuDHmu88xP76/nR5if31/OgDnrPR9R061fTtJvILbT4LO3t7LzoPNMbJuDlgGXdldncc5NYSeBNTXwtpehvr0ElrYyKSj6flLiNVwscq+Z8wDfN1AOACCOvfeYn99fzo8xP76/nQByN94V1S4mivYNcittUNo9jPPHZDZJEW3LtQv8rLk4OSOTkGul0fT4NJ0mz06zDC2tIUgjDHJ2qABk+vFWfMT++v50eYn99fzoAdRQCCMggj2ooAKKKKACiiigAooooAMUYpsjFI2ZVLkAkKMZPtzXJaP4k1fU9E1iaPR4F1SyvWs1tTdjZwEO5pNvAAfJwD90gZ4oA6/FGK5rwT4guNdi1AXMdoxs7jyFurKUy29x8itlGIHQttI5wQeay4PGt0bm3vLiytk8P3V/Lp8M4mYzB0Lr5jJtxtLRsMA5GVPcgAHc4oxXA+E/Gl74nSc6euiF5LYXNvCL5nkjBI2iZQvcHkrkAgqfWtjwhrOqardavHqNtZLDZTC3Se1kdllkA/eLhlH3SQM+u4dqAOmxRiuE07xpNf+MbzSVm0SCO3vWtBFLdMLmUKisSqYxnk4GegJp178QIrbXNXgFm0mmadp89212r8yywsokjQdwNwBbP3sjsaLhY7nFGK5fw9r2pT60dK12ytba7ktBfQm1maRdm7ayNuUfMpK8jg57YrqKADFGKKKADFGKKKADFGKKKADFGKKKADFGKKKADFGKKKADFGKw/FmuPolpafZrX7Xf31ylnawl9itIwJyzYO1QqsxOCcDgE1Wg1jV9OhvJPEmnQi3hjWSOfTWefzCTjy/K2792cdAQQeowaAOlxRiuWPjjTPIXEN+bxrk2f2H7M32gSiPzCuz/c+bOcYp+oeNdNsbaG4ng1MW7Q/aJZPsEoFtHkgtLkDbgg5HUAE4xzQB02KMVznjLxC/h+DSZoofPS8v4rRwqs7bXVjlAOrZUe3NRL4106Swiube11S4keWWFreGydpYnjOHDrj5ccdTzkYzQB1GKMVwknxFsYdVu96TTaOmnW2opd29u8m2KQybpJMfdUBAemevHFW/+E1gTxHBpQhmu2uLyW2EtvCwSDZEkh3kn5uHByOMH2NAHYYoxXLQ+OtGK3T3RvLJILZrwNd2kkXmwhgpdARk8soxjPzDjmgeMbJ7i1SRprDM0kc0V9avG4CwtLkHoBtXdu5HBHBoA6nFGK4i2+IOnJFf3WpPNbWqRpdWytZyq8lszKgkGfv5ZhwACARkc10Oha9aazJeRW6XENxZyCOeC4iMboSoZTg9iDkGgDWxRig15/4W8YatqumW2sXqaHBpkkL3EkcV3JJcoihj9zaATxyM+tAHoGKMVyj+OtNGmW9+lrq0ttPG06MlhIf3KgEynjhcEEZ5PYGrDeMtJN/FbQNc3KuIS89vbvJFF5oBi3sBxuBB9gQTgGgDo8UYrB0fxVp2rX/2azF0VYOYZ2t2WGcI219j4wcH6Z6jI5reoAMUYoooAMUYoooAMUYoooAMUYoooAMUYoooAMUYoooAMUYoooAMUYoooAMUYrkPiT4sm8J6RHPbW8DyzeYFmupDHBEVjLjewBOWxtUcZJ6iq2ueNrnR/Bf9pz6bDLq0iStBaQXQkjmCAsZVkA/1ewbskZGQMZIoA7jFGKytTvr1NDF1plpFcXTqhVJphFGgbGWZsH5VBJOAScYFcvZeL9WvtGuLi3tdIxbXbW8uovekWPlqgbzVcjLDLbMDowPPFAbne4oxXn1j421fV7ayTSdItftzWT39wlxcMsewSNGgjYJlvM2MysQBtwT1rs9B1OLWtEsNTt1ZYbyBJ0VuoDKDg+/NAF6iiigAooooAKKKKACiigkAZJxQA2YOYnERUSFTtLDIB7ZHpXE6V4Z8R2VtrKjXLCKe/uTerLBYt8kp2ZVlaQhoyEwRwfmOCK7fev8AeH50b1/vD86AON0fwPAPtsuvizu5Lq5S6WC2haG3gZECAou4nJxkknk9uKii8E3H2y3tp7+GTQLa+l1CK1EBEvmOXOxpN2CgaRiMKD90Z457fev94fnRvX+8PzoA4zwz4Pu9Kv8AS5LvUYJ7bR7J7CwSK28ttjbOZTuIYgRqOAB1P0vaZ4QsY/CNjoerKmoJB88jspUSSklmfAPBLMx6966Xev8AeH50b1/vD86AOQ1Xwvqep3kcFzqlt/Y0d7HerGlptuFMZDLGJA2MZUfNt3Y4z3rO/wCFX6etxti1DUhp502fTvsz3LSACUjkEntgnB6nB7V6BvX+8Pzo3r/eH50Acz4e8P6hbay2q65qEF5dpaLYw+RAYlEYbczMCzZdiFzjAG0YFdPSb1/vD86N6/3h+dAC0Um9f7w/Ojev94fnQAtFJvX+8Pzo3r/eH50ALRSb1/vD86N6/wB4fnQAtFJvX+8Pzo3r/eH50ALRSb1/vD86N6/3h+dAC0Um9f7w/Ojev94fnQBjeK9DOuWVssF01nfWdwl3a3ATeI5FyPmXI3KVZlIyOCeQeaxdV8Na/rWmXkGqa5bhpREI7e2tWjt8JIHYON5dg4GwgMBtJ4rs96/3h+dG9f7w/OgDzWL4dXUFvqEEcmhS2t5dJdtaS6afJRhEIyEAfK42qwYHOS2evEGp/C671DTvsd5rMV4H04WXnXls0z27Aud8O58LneAS25sIvzGvUd6/3h+dG9f7w/OgDB1TQ5tTt9BE9xHHNp13FdyFIztkKIylQCcgHd3z0rm7/wCHktxetN9ttJ4JLu7uGtru1MsQ84oQ4XeAZECEAnIwx4Fehb1/vD86N6/3h+dG4HmVt8O9YtNJl0+31yzENxpMOjTlrJi3lR+YBIvz8OVkxg5GefatJvAlxBqsd7YamkJW+luMGEkrFJbRwFVO7748sMG6c9K7vev94fnRvX+8PzoA8rt/hTMEVZtRskZrB7CWW3syskp3pIk7szktJvjUnPBBPTrXQah4R1HXfIPiHVIJVR5sxWtsYkWOS3eEqpLE5+ctkk+gHeu03r/eH50b1/vD86HroGx55deAdR1KBU1TWLd3t7OOxtmhtSnyLNFIzuC5yzeSg4wBz1zXWaXopsfEOtamZw41EwkR7MeX5abeuec9e1a+9f7w/Ojev94fnRcCvZWNtYxyJaRLEskrzOF7u5LMfxJJrk9D+H2l6V4VTTUtrBtSFrJbnUVs0WQs6spfP3v4vXmu03r/AHh+dG9f7w/OjyDzPP8AXPh9LqkOmwPfW0lvbaZ/ZzR3NsZVRsAefGu4BZMDGWB4x75n8P8AhDWdEeMWes2qRzJbC8/0QszGFFjzGS2FDoig7g2OSOvHc71/vD86N6/3h+dFwOQ0Hw3rWiWX9n2Os2o0+2hljskazLNljlDKd/zBOmF27u5rr1yFG4gtjkgY5o3r/eH50b1/vD86AFopN6/3h+dG9f7w/OgBaKTev94fnRvX+8PzoAWik3r/AHh+dG9f7w/OgBaKTev94fnRvX+8PzoAWik3r/eH50b1/vD86AFopN6/3h+dG9f7w/OgBaKTev8AeH50b1/vD86AFopN6/3h+dG9f7w/OgDnfHWiajrmjTW2k6ilpK8MsTRzxCSGZXXGHHUEHBDA8c8Gubb4W2r6NewNqV1Df3MNxEZbRmggjEx3FVhU4CZwSueccmvRt6/3h+dG9f7w/OgDmJNJ1xLSTT7DU1ggggtxbXE8Xnu7qzeYsoJ+ZGUKONpGTg1mWnhDWLK2upLXVNOS4u7o3E9mbDNi6+WqbBHu3D7ofcG5bORiu63r/eH50b1/vD86AOAs/AupaVbQPo+sW8V+baa0uJJrQtHsklaUGNA42bC7BVJIwcHpXZ6HpsOjaNY6baljBZwJAhbqVVQAT78Vc3r/AHh+dG9f7w/OgBaKAQRkHNFABRRRQAUUUUAFBAPWiigBNq/3R+VG1f7o/KlooATav90flRtX+6PypaKAE2r/AHR+VG1f7o/KlooATav90flRtX+6PypaKAE2r/dH5UbV/uj8qWigBNq/3R+VG1f7o/KlooATav8AdH5UbV/uj8qWigBNq/3R+VG1f7o/KlooATav90flRtX+6PypaKAE2r/dH5UbV/uj8qWigBNq/wB0flRtX+6PypaKAE2r/dH5UbV/uj8qWigBNq/3R+VG1f7o/KlooATav90flRtX+6PypaKAE2r/AHR+VG1f7o/KlooATav90flRtX+6PypaKAE2r/dH5UbV/uj8qWigBNq/3R+VG1f7o/KlooATav8AdH5UbV/uj8qWigBNq/3R+VG1f7o/KlooATav90flRtX+6PypaKAE2r/dH5UbV/uj8qWigBNq/wB0flRtX+6PypaKAE2r/dH5UbV/uj8qWigBNq/3R+VG1f7o/KlooATav90flRtX+6PypaKAE2r/AHR+VG1f7o/KlooATav90flRtX+6PypaKAE2r/dH5UbV/uj8qWigBNq/3R+VG1f7o/KlooATav8AdH5UbV/uj8qWigAAA6UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFQ3t1BY2ktzeTRwW8Slnkkbaqj1JqasbxfDBceHbuK7tLu7gYLujs+ZhhgdyDqSpAbjnjgHpQBNpGvaZrEksenXkc0sQDPGMq6g9DtIBwfXpVu7vre0ltY7iQI9zL5MIwTvfaWx+Sk/hXm2pS6vc2upJZSajqdnHBDIt1NYG3uUZZ0JiUhVMgKBiQF7Y5zima0smp6295NY6rLpP9rW0nFvKCYhayKzBcbtm4gHjn8aAPUTLGJVjLqJGBZVJ5IGMkD2yPzFEsscMZeaRY0GMs5wB26mvIl02+E0NzaWd8srQapFpUkkcm6HcyGAHP3BxJt34wMewpNZ0wXWn3y6bp2pnTEs7ZrmGaGbc06zozEK3zM4j37iuc8dTQB7Dmq2m31tqVlFd2Uolt5RuRwCMjOO/0rzGf7b/wk0F9bWV5AItVjRttvcO32XbtDFy2wRkEfIqnHU4IJHbfD63mtfB2lwXUUkMyRkMkilWU7j1Bo6AdDRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAEdxNFbQSTXEiRQxqWd3YKqgdSSegrGtvF2gXWn3F7Bqtq1tbvslbdgqxOAMdeSOOOe2an8V28d34evYJrOe9jdMNBAwWRhkcqSRyOo+leeaBqN/Y2moXB0y61WBZmFvNdaeUmWU3MmNxVdzIoJckL8pJAyTgAHoR8TaKulf2k2pWqWO/y/Nd9oD5xtIPO7261pXdzBZ2stzdSxw28Sl3kkYKqqOpJPQV51rVvbr4A1ZYo76/1K9eVzJ/Zsyu87KAdqFMou0BQemBjJOa6u/1yzls2jWwu75mtmuRam1ZWkRXCkbZAPmyQdp5PagCaHxRos1hcXqajB9ngYJKxJBRm+6Cp5ycjHHPall8TaNFp0N8+owC1mYpG4OdzDOVAHORg5GOMHNcGkV1LrMmreTqF/Zw39rcSXU1m8UrIEmQosW0FljLq2QuTubqRVnTlmsvEY8QXFjerpc9zeFAts7SRh0gCyGMDeAxiftn5hnGaAPR7aeK6t457aVJYZFDpIhyrA9CD3FSVgeA7Sey8K2cV3C0EpMkvlN1jV5GdVPoQGAx2rfoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKhvLq3srZ7i8nit7eMZeSVwqr9SeBQBNRVTTtTsNSR3069trtUOGMEquFPocHirdABRRRQAUUUjMqKWYhVHJJOMUALRRRQAUUUUAFFIWAIBIBJwAe9LQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFN2Lv37RvxjdjnHpTqKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK5f4mAnwXfYVmCyQMQqljgTIScD2BrqKKAPNPEV1NqepT6j4Mhla5tdMukluooCqyOwXyowSBvYEFgOcf8CxVGKa6fSr949caKyzbD5TeSqH3MWDyNh0DjCttI28E4zz6zRQB5Tbaj5sVmdWm1az0URXSpLBczyb51kXYUkADsu3cUDDnBHOBVu61i6gbUbJrjUhdyajYPbo6OJPs5FvvPAwBxJuxwDuz1r0uigDyjSLnWZNUkN1fPFfrJdm5t91wzMgEmwbceWgH7sqw646kk1T1q0vR4YjSWfVbgXfh9bm6Es0r5mV4TnH8Jwz5AxkduK9jopDPL5ryc3k/wBnu9QOqnUb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huURYmS2d82+CeeElZ27dwa6uigDk7jw5cuzmMwqgdnVFbGR5/mBehA49jzT/wDhHZHhlDRwgva3EYV337ZJGBBztGBx2HHaupooA5dNFuorwzGC1nRZXcI7YD70UZPB5BUj6Ma2dGtp7OwgtJyjCGJEEgYncQOeMce1X6KAObtfD8kGjJGZPMvo4Gjj81y8SMwIOFPGMHHTpVSPQbxBMTCjBpEljHnjdGQhQ/wbT+Ixg+1dfRQByL6HqTXNvI4tQ8TwtuhIjGFXaQBtzkZJHOMYGBTI9Av0hVVgs0MdtFbkK2TLscMW5XAJAyMg4P512NFAHOwaPdL4fvrBzGJJZXaM78jDNu5OB7jpTbHSb2HXI7yUQ7A84fYwGQ5ypChR6DOSeea6SigDmb/QriS8kuYxGc3TTbAwXcpiVOSVIyCD26E0lvodxbPsSC1ljZIwskshZ4NqbcKcZPPQ8dTxXT0UAcq+gXMMEK2yWw229vFIowNxjYliCVIzyMEj16VbtdJnTw5Np9xHHK/mOyqJSAQX3j5scEZ9MZHpW/RQByEnh69mCtOIpA0ckRjVxHtDNnJITBPqQAeBV3xNF5Zs5TEs8cccsRSRWYZZRg8KeeMe+etdFRQBx+laBcIbSSZONsEhJl2GIpGq7cbSTyD3A5OfdzeGpxaW0cXkIY7aFHCHb5jI4YjOOh55IPPauuooA5iLQZ03yIkCym3nRBK3mhZHYHP3QMcc4HfvUVjoFyl4jzxw/Z/Pjm2M4YjbG6EYCgZyQf8A9VdZRQBgro0h0K1sZBC3lXCSMp5UoJd2Onp2qjL4bnklvF3KPMad45hLjbvUgAqFycZx97GAPw6yigDlrzR726RQtpY2yEsGSJhnJQKGLFPqMAA4xzVdtHns7A3FzHC0qy2zMBucOsaKhBIUnGRnofeuxooA4qz0a5ubGWRLa3C3CXESJJlRFvlZg6gjOMEdgeBWtp2l3Nrq5lCRLAd5diwcuTjlflypOMkZI9K36KAOd/sEtqHnyR2zA3cs7ZGSVaLaB09e1VbHw7cQXFuZ9siqICWWXbsMagYA25IyOORnJz79ZRQBycfhyWK0t08m3YparE6o+zc6urBgdvbBIyOv1pJdF1JreVAloTcW5hY7tmz94zAkKuCcNyQBzXW0UAcfeaBqE9xcOBbgyC4QkOFBEn3TgL2wM5Jyean/AOEelN1dGaNJ0d5nVmnKbvMBG0gLnocdewPsOpooAyNDtbyzVkmjh8t5M/eG9V2gDJVQGOR+WOTWvRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/2Q==",ts:1788369600000,de:"estado de cuenta"}],
  pregunta:"¿Autorizas el pago del predial?",
  ops:[{t:"Sí, págalo",r:"Listo, Cynthia lo paga."},
       {t:"Espérame",r:"Anotado."}]},
 /* --- DE KARINA (para consultar: "muéstrame las de Karina") --- */
 {id:"demo-ka-camioneta",nombre:"Lavar la camioneta",duenio:"karina",tipo:"unica",
  f_original:"2026-09-03",f_vigente:"2026-09-03",recuperable:true,criticidad:"normal",
  cierra:"Foto de la camioneta lavada",revisar:"Camioneta blanca",gasto:"No gasta",
  estado:"abierta",ultima:"Se pasó un día",msgs:[]},
 {id:"demo-ka-papeleria",nombre:"Comprar papelería de oficina",duenio:"karina",tipo:"unica",
  f_original:"2026-09-04",f_vigente:"2026-09-04",recuperable:true,criticidad:"normal",
  cierra:"Ticket de la compra",revisar:"Lista de papelería",gasto:"Hasta $1,500",
  estado:"abierta",ultima:"Para hoy",msgs:[]},
 {id:"demo-ka-archivo",nombre:"Organizar el archivo muerto",duenio:"karina",tipo:"unica",
  f_original:"2026-09-10",f_vigente:"2026-09-10",recuperable:true,criticidad:"lento",
  cierra:"Cajas etiquetadas",revisar:"Bodega de archivo",gasto:"No gasta",
  estado:"abierta",ultima:"La próxima semana",msgs:[]},
 {id:"demo-ka-deposito",nombre:"Depositar al proveedor de limpieza",duenio:"karina",tipo:"unica",
  f_original:"2026-09-06",f_vigente:"2026-09-06",recuperable:true,criticidad:"normal",
  cierra:"Comprobante del depósito",revisar:"Proveedor de limpieza",gasto:"$3,200",
  estado:"abierta",ultima:"Salvador: confírmame cuando quede",
  msgs:[{k:"bo",t:"Salvador: confírmame en cuanto quede",h:"10:00"}]},
 {id:"demo-comprobantes",nombre:"Comprobantes del material \u00b7 fraccionamiento",duenio:"salvador",tipo:"unica",
  f_original:"2026-09-04",f_vigente:"2026-09-04",recuperable:true,criticidad:"normal",
  cierra:"Factura + comprobante de pago",revisar:"Material del fraccionamiento",gasto:"$6,400",
  estado:"abierta",ultima:"Se juntaron 4 documentos",
  msgs:[{k:"bi",t:"Aqu\u00ed se van juntando los comprobantes de esta compra.",h:"—"}],
  evidencias:[
   {data:"data:image/jpeg;base64,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WAjhWVnMxfGNpUjBzzXvQooo6WDqFFFFABRRRQAUUU3ePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GjePRvyNADqKbvHo35GnUAFFFFABRRRQAUUViLdS+TBCJW+0xzyGRTk4UbyN3t939KANuisFdSuTEAZ1TG7dL5YZSwUEKCODnJ9DxjrWg1zMNOnnUbp1Td5W37jbQdvvQBeorn7jVLlVmWGdZCjHY4jADgIGx9cnt1pbrUrlkn8ucLmPenloDsGAec8jqfUGgDforEfULsPJsljz+8G1kwIwD8rE+4/Dn2qwL2U6WJlY7vMCM7IPlXdgtxwQB36UAadFYCalevIqq8W0MwVmXaJcSFcfkB09fSnPf36R78hvMUnmPHlgSBc/wDfJzz6UAbtFYf2+8WN3aRSscRYMibtxLlQc8Dgde34VD/aF2TvB3PHvjLdgu+P5j26E89KAOiorFS/uRJb+ZLGyscYjG5m+fAOOM8f3enXpVnVnklsojZSsrPKm1l+vf24waANGiudkvbqR5p0MiRTrGoVuBEuWBPscjr7inx3l0jKrToiskQyq5VFJYFx+Sj0GaAN+iuee/upjGkkmwh4tihCDMPMwW9hgD8/erVhezzOolmGGVGY+XjY5bBj/wA80Aa9FZN7cXSak0UUxUP5QVSgIAJbcR+QqsNUumndEcYcgJuTlf3gUjA9iTyfegDforFF9dJLGkkowJGjOEG9/n2g47jHp069KhsLq9ja3iMgOdrEy9ZCzHd78D0/HigDoKKwVv8AUMW+XjBkQSZddoYlsbPwHpzzTmvr1AGZxtk3ZPl/6oCULu9/lOefTNAG5RWFJfTKzBJg2/YqzCPaG+/68DoO3P41p6Zdfa7OJ2I80xqzqBjBI/8A10AWqKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKR1V0ZHGVYYI9RS0UARW9vFbqVhXaGOSSSST7k1LRRQAUyaJJozHIMqevOKfRQAyCGOCMRxLtUZOPr1NPoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z",ts:1788310000000,de:"factura"},
   {data:"data:image/jpeg;base64,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/fb9KAHUU3af77fpRtP99v0oAdRTdp/vt+lG0/32/SgB1FN2n++36UbT/fb9KAHUU3af77fpRtP99v0oAdRTdp/vt+lG0/32/SgB1FN2n++36UbT/fb9KAHUU3af77fpRtP99v0oAdRTdp/vt+lG0/32/SgB1FN2n++36UbT/fb9KAHUU3af77fpRtP99v0oAdRTdp/vt+lG0/32/SgB1FN2n++36UbT/fb9KAHUU3af77fpTqACiiigAooooAKox6pEzLvjkjjdnVZGxtJXOehyPumr1UI9JhjtpEj+WaQP+/CgONxJ6/jQBIdSsxF5hnVVyRzkEYGTx16c0+O9tpJhCkymQjIH4Z/PHOKy7jSZ4Vka1YO8odSAoULuUA9T0+Ue/XrVy20wwvEWmyqP5uwL/Ht2nn060AWJL+1jleN5lVowWbPQADJ5+nNQvqluCvlsHB3ZOcAEY65+oqtqGjyTmeWOfdIwfYrD+8hXbnPT0/rUj6QZWaSW4JkbqQgA6KBx/wAB/WgCydRtBv8A3ykxnBAyTnOOPXnjimzanax+VtkEjSlNoXuGOAf8+hqH+zJPKEIuj5SNlEKcYyThsHJ6+3QVHDopiRY1uT5fybhsGW2Nkc549DQBoW93BcswglVyvXHp6+496jnvfLmaKOCWd0UO4jx8oOcdSOeDxUdrp7W7ownLGNFiXKD7gPQ+/vTp7OQ3DzW1x5LSIEfKBgcZwR6Hk0APOoWodlaZVZVLMG4xgZOffHOKb/aVnt3eeuMle/YZ/LBBzUEukCRXQ3DeWzM+CozuZCpOfxJxS3Glea7sk2xnIO7byuFC5Uggg8UAWH1C0RpA86DywSxPQY68+2RR9vtfLEhnQKSRk8cjk1UOixnzB5gw5YglAWBYgnn8+3en3OkR3E1w7SMBMoAXAwrcZb8dq/l70AW1u4Gt2nEq+WudzHjGPXPSmf2ha4U+cvzkgDnPHByO3UdfWojpqNYS2zlR5rbiyJt54xx36Co20olV2SpG4YsXjj2nJx0Ocjgd85oAnj1OzcKRMBuYqNwI6HH4DPepJry3gk8uWVUbaXwf7vrVL+xl8zc0iuDkEPHn5d5bHXryef0qe905LtpS7keZGI8AdMNuB/OgB51G0CIxnUByQM5zkdcjt1HX1qOLVLd7jyXYI3GDnIOSRjP1WmJpjROJIZ1ik+YOViGGBIPQnrx1OaYuj7SQLg+W5UuuwZO1yw57cn9KALtvd29yzLBKrleuP5+496nqja6e1u6MJy3loIkyg4QHOD6npzV6gAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==",ts:1788400000000,de:"recibo predial"},
   {data:"data:image/jpeg;base64,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Oopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkaN49G/I0AOopu8ejfkadQAUUUUAFFFFABRRWFBcETQmRpmuzMVkTzWG0Zx9zGCuOc/rQBu0Vz76neRRWzvIC7IkrqYwAQzYIHfgZ+nU1IL+Zgru+9hLl4REcxY3cZ79KANyiuej1S7ML7poxtKtuIGWUqTgfw5yP5jOat6jfSxJalJhCJYncs0fOQoIGO3XpQBrUVhSalehZHwFlAb9x5edgEe4Nnr14/HHWrmozz2tpEwmQNn52KgFuCeM8Z9jQBo0Vk2uoyy3UcLH5mlIKlCCE8vcCfTn/Cm3F/cJLc7ZAHjJVYfKJwvHz5/En9KANiisKW/vgsnkyq6xK7LJ5WRLgrj+ZHHpSXGoXcLyRGdQ0YlKkxcyFSu1fx3EcUAb1FYV1f3scLMH2u0koRfLGAE6DJ6k/r2rXs7hbmBZFIJIBYDsSAf60ATUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFMaJGlSRlBdAQp9M9f5U+igAooooAKKKKACmGJDKJdo3hSob2ODj9BT6KACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z",ts:1788480000000,de:"ticket"},
   {data:"data:image/jpeg;base64,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9vZRFb26F5HIzgD27n270AT4b+8Pyow394flWMvieylngitoL25aaCK5zDbMwRJM7Cx7ZwePanxeJtPk1L7EftCMXkjSWSB1ikdAS6q5GCQA3/fJxnFAGthv7w/KnVR0bV7TWrZ7iwZ2jSVoSXjZDuU88MAavUAFFFFABRRRQAVha5Y36a1ZaxpkMV09vDLbS28knllkco25WwQGBQcHggnnit2m71/vD86AOT1Cy8QXV3aai9jaNMILq2MCXGPKWTyyhLEfNjYd2B3GM45ydN8GalbXlqLpTLFixdmiuERYjBGikcxljhkJG0gHcQcck+hb1/vD86N6/wB4fnQB5/P4KvjoEFrDb2i3A0+/t5MMAGeVlZOccjI5PY0+fQNduNdh1A2kMSRX8F1sjljUeUIwhU4TLOMnktggYHpXe71/vD86N6/3h+dAHF+NPDuo6lc6n9jsbW8XUdOS0jknlC/ZnVnOeQTg7weO68+tRJ4Svv7cuZLiNriB7ya8R/tKonzoVCMBGX6HYfmxjn2rud6/3h+dG9f7w/OgDz+y8NavElq32CEQ2l1ayRwyyxNKFQOrDzFQblUOu3d83Dc8ikg8E3y6NdwSwWjXT6fbW0TFs7Xjllc844HzKc+v0r0Hev8AeH50b1/vD86AOP07w9fwazZ+Za26R2l/dXrXyyAyTrL5mExjOf3gzk4+QY7Y7Km71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6im71/vD86N6/wB4fnQA6sTxX4ZtvE0NlFdXV5bCzukulNrL5ZZl6BvUVs71/vD86N6/3h+dAHGH4aacZC/9q6xk6p/auPtXHmf3On3f196P+EBayjuBper3B8+8lv3jvR9oRpGX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x+Ymom0uWKW1a3l5iCKWZQcBUZc4753UAWzqVmM/6QhwFbjng9PzpiapavcCESD5gpVuzbiQP1GOaii0hYY1WOZgyMjqxUHBVdvI755/Ompo+0kfaGKuUaQbBlirl+D25NAFoalZ4Y+euFIXvyTnGPXOD0pq6pZsTiYEBVfODghiQMep46darQaN5cyStcFypQn5OW2kkEnPXk5/pQdFU/8ALbOCGAZM/MGY+vT5yKANOKRJo1kiYMjDIIp1QWlubaNYwy7APuqm0ZyST+OanoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//Z",ts:1788500000000,de:"comprobante de pago"}
  ]}
];
