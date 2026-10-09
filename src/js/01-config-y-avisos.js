
/* ============ CONFIG ============
   Reusa el proyecto Firebase que ya existe (golf-necochea), en su propia
   colección. No mezcla datos con la app de golf.
   Si algún día se separa, aquí es lo único que se cambia. */
var FB={apiKey:"AIzaSyCmEJj5Qkd3wWM-YM2jdjFX9C_GXx9TeIk",authDomain:"doit-cce6f.firebaseapp.com",
  projectId:"doit-cce6f",storageBucket:"doit-cce6f.firebasestorage.app",
  messagingSenderId:"876560960271",appId:"1:876560960271:web:52800d5975909dff518c7a"};
/* ---- Proxy de Claude en el mismo servidor ----
   La llamada es RELATIVA: index.html y claude.php viven en el mismo dominio,
   asi que no hay que escribir la URL y no hay CORS que arreglar.
   EL TOKEN NO VIVE EN ESTE ARCHIVO. El servidor lo inyecta al publicar,
   sustituyendo __APP_TOKEN__ por el valor real. Asi el token nunca pasa por
   Drive, ni por chat, ni por el correo. */
/* MARCA DE VERSION — para saber de un vistazo si la app trae los ultimos
   cambios. Se sube el numero en cada build. Si el engrane muestra un
   numero viejo, la app no se ha actualizado (publicador o cache). */
var VERSION_APP = "build 310 · Mensajes solo de 8 a 8 y no antes de tiempo; lo eliminado no revive; aprende a sacar contactos de una tarea";
var PROXY="claude.php";
var APP_TOKEN="__APP_TOKEN__";

/* ============ NOTIFICACIONES PUSH ============ ============================
   PEDIDO por Salvador; VAPID publica entregada por Josue el 2026-09-03.
   REPARTO: el servidor (push.php) genero el par VAPID y guarda las
   suscripciones; la app pide permiso, se suscribe con la PUBLICA y le manda
   la suscripcion a push.php. El aviso llega como JSON {title,body,url}, que es
   lo que ya lee el service worker (sw.js).
   push.php DEBE vivir donde vive claude.php (mismo subdominio), porque la
   llamada es relativa, igual que la del proxy. */
var PUSH="push.php";
var VAPID_PUBLIC="BFnf9NwBioqZIXQ7jibjMPViaGHLDfB5aNLowJMco_u9PdaEZVRibceXV8mlG38wcYi-cjipIi8V4BU0ZjftMwE";

/* build 150: la notificacion lleva la liga EXACTA a la tarea (?recordatorio=<id>),
   asi al tocarla abre ese hilo y no otro. */
function urlTarea(id){ return "https://doit.ok-doit.com/?recordatorio="+encodeURIComponent(id); }
/* ===== build 200 (Salvador 2026-10-04 16:39, maqueta "Fichas limpias" pantalla 7): NOTIFICACIONES =====
   En ⋯ del inicio. Cada persona elige que hace sonar su celular. Se guarda en SU ficha
   (bitacora_personas/<usuario>.notif = {v, preset, tipos:{clave:true/false}, ts}) para que el servidor
   (push.php) tambien la lea. CATALOGO UNICO: para agregar un tipo de aviso nuevo se agrega UNA linea aqui
   (k = clave que viaja en el aviso como "tipo"; nivel = en que atajo entra: urgente < normal < todas). ===== */
var NOTIF_VERSION=3;
var NOTIF_TIPOS=[
  /* build 269: LOS 5 DE SALVADOR (los mismos que le manda la Mac por WhatsApp) */
  {k:"acuerdo",      grupo:"Lo esencial", nivel:"esencial", ico:"cal",    tx:"Acuerdos",                            sub:"Una cita, hora o lugar confirmado o cambiado"},
  {k:"llamada",      grupo:"Lo esencial", nivel:"esencial", ico:"alerta", tx:"Te necesito: llamada",                sub:"Alguien te pide una llamada"},
  {k:"atorado",      grupo:"Lo esencial", nivel:"esencial", ico:"pers",   tx:"Te necesito: atorado",                sub:"Alguien espera tu sí, tu dato o tu pago"},
  {k:"ia_atorada",   grupo:"Lo esencial", nivel:"esencial", ico:"alerta", tx:"Te necesito: la IA se atoró",         sub:"Claude no puede seguir sin ti"},
  {k:"te_necesito", grupo:"Urgente",  nivel:"urgente", ico:"alerta", tx:"Claude necesita tu respuesta",        sub:"Solo lo que requiere tu sí o tu dato para seguir avanzando"},
  {k:"recordatorio", grupo:"Urgente",  nivel:"urgente", ico:"reloj",  tx:"Recordatorios y alarmas",            sub:"Cuando suena un recordatorio que te toca"},
  {k:"espera",       grupo:"Urgente",  nivel:"urgente", ico:"pers",   tx:"Alguien te espera o está atorado",    sub:"Una persona espera tu respuesta o algo se detuvo"},
  {k:"falla",        grupo:"Urgente",  nivel:"urgente", ico:"alerta", tx:"Falla del sistema",                   sub:"La Mac sin señal o un WhatsApp que no salió"},
  {k:"falta_info",   grupo:"Trabajo",  nivel:"normal",  ico:"dato",   tx:"Nueva tarea o dato por completar",    sub:"Llega algo a “Falta info”"},
  {k:"seguimiento",  grupo:"Trabajo",  nivel:"normal",  ico:"recur",  tx:"Seguimientos de Claude",              sub:"Vencidas y ritmos sin avance"},
  {k:"asignado",     grupo:"Trabajo",  nivel:"normal",  ico:"chk",    tx:"Te asignaron o te mencionaron",       sub:"En una tarea compartida"},
  {k:"wa_tarea",     grupo:"WhatsApp", nivel:"normal",  ico:"msj",    tx:"Mensaje de una persona de una tarea", sub:"Solo chats ligados a tus tareas"},
  {k:"wa_todo",      grupo:"WhatsApp", nivel:"todas",   ico:"msj",    tx:"Cualquier WhatsApp",                  sub:"Incluye grupos y plática"}
];
var NOTIF_PRESETS=[{k:"ninguna",tx:"Ninguna",n:0},{k:"esencial",tx:"Solo lo esencial",n:0.4},{k:"respuesta",tx:"Solo lo que necesita mi respuesta",n:0.5},{k:"urgente",tx:"Solo urgente",n:1},{k:"normal",tx:"Normal",n:2},{k:"todas",tx:"Todas",n:3}];
var NOTIF_NIVEL={esencial:0.4, urgente:1, normal:2, todas:3};
var NOTIF_ESENCIAL=["acuerdo","llamada","atorado","ia_atorada","recordatorio"];   /* build 269: lo único que le suena a Salvador */
function esJefe269(k){ return k==="salvador" || !!(PERSONAS[k]&&PERSONAS[k].jefe); }
var NOTIF_DEFECTO="urgente";   /* la maqueta: "Solo urgente" queda de inicio */
function notifDePreset(pk){
  var n=(NOTIF_PRESETS.filter(function(x){ return x.k===pk; })[0]||{n:1}).n, o={};
  if(pk==="esencial"){ NOTIF_TIPOS.forEach(function(t){ o[t.k]=NOTIF_ESENCIAL.indexOf(t.k)>=0 || t.k==="te_necesito"; }); return o; }   /* build 269: los 5 (te_necesito = llamada/atorado/IA atorada, para el servidor) */
  if(pk==="respuesta"){ NOTIF_TIPOS.forEach(function(t){ o[t.k]=(t.k==="te_necesito"); }); return o; }   /* build 258: caso explícito, no es un nivel */
  NOTIF_TIPOS.forEach(function(t){ o[t.k]=NOTIF_NIVEL[t.nivel]<=n; });
  return o;
}
/* preferencias que valen para una persona: las guardadas (completadas con el defecto si falta algun tipo nuevo) o el defecto */
/* build 263: el defecto de Salvador (y de quien es jefe) es "Solo lo que necesita mi respuesta"; los demás siguen con "Solo urgente" */
function notifDefectoDe(k){ var p=PERSONAS[k]||{}; return (k==="salvador" || p.jefe)?"esencial":NOTIF_DEFECTO; }   /* build 269: "Solo lo esencial" */
function notifPrefs(k){
  var p=(PERSONAS[k]||{}).notif, base=notifDePreset(notifDefectoDe(k)), o={};
  /* build 263: lo que Salvador guardó con la versión 1 (el defecto de entonces era "Solo urgente") pasa una vez al nuevo defecto */
  if(p && p.tipos && (+p.v||1)<2 && notifDefectoDe(k)==="respuesta" && p.preset==="urgente") p=null;
  if(p && p.tipos && (+p.v||1)<3 && esJefe269(k)) p=null;   /* build 269: a Salvador se le aplica "Solo lo esencial" una vez */
  NOTIF_TIPOS.forEach(function(t){ o[t.k]=(p && p.tipos && typeof p.tipos[t.k]==="boolean")?p.tipos[t.k]:base[t.k]; });
  /* build 258: migración — quien ya guardó sus preferencias recibe te_necesito encendido, salvo que su preset sea "ninguna" */
  if(p && p.tipos && typeof p.tipos.te_necesito!=="boolean") o.te_necesito=(p.preset!=="ninguna");
  return o;
}
function notifGuardadas(k){ var p=(PERSONAS[k]||{}).notif; return !!(p && p.v && p.tipos); }
/* que atajo coincide con lo prendido ("" = personalizado) */
function notifPresetDe(tipos){
  for(var i=0;i<NOTIF_PRESETS.length;i++){ var o=notifDePreset(NOTIF_PRESETS[i].k);
    if(NOTIF_TIPOS.every(function(t){ return !!tipos[t.k]===!!o[t.k]; })) return NOTIF_PRESETS[i].k; }
  return "";
}
/* ¿le suena a k un aviso de este tipo? Tipo desconocido o persona que nunca eligio = como siempre (si suena) */
function notifPermite(k, tipo, sub){
  /* build 269: a Salvador (jefe) SOLO le suenan los 5 de lo esencial; todo lo demás (wa_tarea, wa_todo, seguimiento, falta_info, asignado, falla, espera genérica, toques, empujones, tipo desconocido) NO */
  if(esJefe269(k)){
    var key=(tipo==="te_necesito")?(/^(llamada|atorado|ia_atorada)$/.test(sub||"")?sub:"atorado"):tipo;
    if(NOTIF_ESENCIAL.indexOf(key)<0) return false;
    return !!notifPrefs(k)[key];
  }
  if(!tipo || !NOTIF_TIPOS.some(function(t){ return t.k===tipo; })) return true;
  if(!notifGuardadas(k)) return notifDefectoDe(k)==='respuesta' ? !!notifPrefs(k)[tipo] : true;   /* build 263: el defecto de Salvador es 'Solo lo que necesita mi respuesta' */
  return !!notifPrefs(k)[tipo];
}
/* el tipo de un aviso que manda la app, por su titulo (los que no se reconocen suenan como siempre) */
function tipoDePush(titulo, cuerpo){
  var s=_nn(String(titulo||"")+" | "+String(cuerpo||""));
  if(/acuerdo|quedamos|(cita|hora|lugar) (confirmad|cambi)|se (confirmo|cambio) (la|el) (cita|hora|lugar)/.test(s)) return "acuerdo";
  if(/necesita tu respuesta|necesito tu (respuesta|si\b|dato)|requiere tu (si|dato)|llamada|te llama/.test(s)) return "te_necesito";
  if(/^urgente|requiere tu (accion|decision)|te espera|esperan tu decision|atorad/.test(s)) return "te_necesito";   /* build 269: alguien espera tu sí/dato/pago = te_necesito/atorado */
  if(/atrasad|no ha cumplido|vencid|sin avance|tocaba/.test(s)) return "seguimiento";
  if(/recordatorio|alarma/.test(s)) return "recordatorio";
  if(/no salio|sin senal|fallo|falla/.test(s)) return "falla";
  if(/falta info|por completar/.test(s)) return "falta_info";
  if(/asignad|encargo|revision|comentari|respuesta a tu consulta|medida|nuevo mensaje|te menciono/.test(s)) return "asignado";
  return "";
}
/* build 269: subtipo de un te_necesito */
function subtipoDePush(titulo, cuerpo){
  var s=_nn(String(titulo||"")+" | "+String(cuerpo||""));
  if(/llamada|te llama|llamame/.test(s)) return "llamada";
  if(/(ia|claude) (se )?(atoro|atorad|no puede|no pudo)|ia atorad/.test(s)) return "ia_atorada";
  return "atorado";
}
function guardaNotif(tipos){
  var o={v:NOTIF_VERSION, preset:notifPresetDe(tipos)||"personalizado", tipos:tipos, ts:Date.now()};
  PERSONAS[yo]=PERSONAS[yo]||{}; PERSONAS[yo].notif=o;
  try{ if(db) db.collection(COLP).doc(yo).set({notif:o},{merge:true}).catch(function(){ toast("No se pudieron guardar tus notificaciones"); }); }catch(e){}
  try{ localStorage.setItem("bit_notif_"+yo, JSON.stringify(o)); }catch(e){}
  try{ resyncAvisosNotif(); }catch(e){}   /* build 263: lo que se apagó deja de sonar desde el servidor y lo que se prendió se vuelve a mandar */
  return o;
}
function vNotif(){
  /* la primera vez se guarda lo que se ve (el defecto), para que lo que dice la pantalla sea lo que vale */
  if(!notifGuardadas(yo) || ((+(PERSONAS[yo].notif||{}).v||1)<NOTIF_VERSION && notifDefectoDe(yo)==="esencial")) guardaNotif(notifDePreset(notifDefectoDe(yo)));
  var pr=notifPrefs(yo), pk=notifPresetDe(pr), h='<div class="top"><button class="iconbtn" id="bback">‹</button><div><div class="tnm"><span class="t">Notificaciones</span></div><div class="d">Qué hace sonar tu celular</div></div></div>';
  var _jf=esJefe269(yo);   /* build 269: Salvador ve solo los 5 de lo esencial */
  h+='<div class="scroll"><div class="ntf"><div class="presets">'+NOTIF_PRESETS.filter(function(x){ return _jf ? (x.k==="ninguna"||x.k==="esencial") : x.k!=="esencial"; }).map(function(x){ return '<button data-npre="'+x.k+'" class="'+(x.k===pk?'on':'')+'">'+esc(x.tx)+'</button>'; }).join("")+'</div>';
  var g="";
  NOTIF_TIPOS.forEach(function(t){
    if(_jf ? NOTIF_ESENCIAL.indexOf(t.k)<0 : t.grupo==="Lo esencial") return;
    if(t.grupo!==g){ g=t.grupo; h+='<div class="ngrp">'+esc(tituloTarea(g))+'</div>'; }
    h+='<button class="nrow" data-ntipo="'+t.k+'" role="switch" aria-checked="'+(pr[t.k]?"true":"false")+'">'+ico(t.ico,20,1.9)+
       '<span class="tx">'+esc(tituloTarea(t.tx))+'<small>'+esc(t.sub)+'</small></span><span class="tg'+(pr[t.k]?' on':'')+'"></span></button>';
  });
  return h+'</div></div>';
}
function bindNotif(){
  var bb=$("bback"); if(bb) bb.onclick=function(){ vista="lista"; render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-npre]"),function(b){ b.onclick=function(){ guardaNotif(notifDePreset(b.getAttribute("data-npre"))); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-ntipo]"),function(b){ b.onclick=function(){ var pr=notifPrefs(yo), k=b.getAttribute("data-ntipo"); pr[k]=!pr[k]; guardaNotif(pr); render(); }; });
}
/* ===== VOCES: el elenco de la Caminata y de la lectura en voz alta (⋯ del inicio → Voces) =====
   Solo voces del dispositivo (speechSynthesis): no hay servicio de paga detrás. Cada quien palomea hasta 3 voces en español;
   la Caminata y la lectura las ROTAN (cada turno o mensaje nuevo, la siguiente) para que suene a plática entre varias voces.
   Se guarda en bitacora_personas/<usuario>.voces = {v:1, elenco:[voiceURI…], ritmo, tono, ts} y en localStorage de respaldo.
   Una voz guardada que no existe en este dispositivo se salta sin error; sin elenco se usa la mejor voz es-MX (Premium > Mejorada > normal). */
var VOCES_MAX=3, VOCES_RITMO=1.1, VOCES_TONO=1;
var VOCES_MUESTRA="En un mundo donde cada minuto cuenta… hoy tienes tres pendientes y una cita a las ocho.";
var VOCES_DIALOGO=["Hola. Así va a sonar la caminata.", "¿Y qué tenemos hoy?", "Tres pendientes y una cita a las ocho.", "Perfecto. Empecemos por lo más urgente."];
/* nombres de voces conocidos (Apple, Microsoft, Google). Lo que no está aquí es "sin dato": no se adivina por el nombre. */
var VOCES_MUJER=["paulina","monica","marisol","angelica","isabela","francisca","soledad","esperanza","sabina","dalia","helena","laura","elvira","lucia","paloma","ximena","flo","sandy","shelley","grandma","abuela"];
var VOCES_HOMBRE=["juan","jorge","diego","carlos","raul","pablo","alvaro","eddy","reed","rocko","grandpa","abuelo"];
var VOCES_REGION=[{k:"mx", tx:"México"}, {k:"latam", tx:"EE.UU. y Latinoamérica"}, {k:"es", tx:"España"}, {k:"otra", tx:"Otras"}];
/* la pantalla muestra pocas: solo las de alta calidad, hasta VOCES_LISTA_MAX; si no hay ninguna, las VOCES_RESPALDO mejores + cómo descargar */
var VOCES_LISTA_MAX=8, VOCES_RESPALDO=3;
/* voces de juguete de Apple (Eloquence y efectos): suenan a caricatura y no sirven para leer tareas */
var VOCES_JUGUETE=["eddy","flo","grandma","grandpa","reed","rocko","sandy","shelley","abuela","abuelo","albert","bad","bahh","bells","boing","bubbles","cellos","fred","good","jester","junior","kathy","organ","ralph","superstar","trinoids","whisper","wobble","zarvox"];
function _vozNv(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }
function vocesEs(){ var vs=[]; try{ vs=(window.speechSynthesis && speechSynthesis.getVoices())||[]; }catch(e){}
  return vs.filter(function(v){ return v && /^es([-_]|$)/i.test(v.lang||""); }); }
function vozId(v){ return v ? String(v.voiceURI||v.name||"") : ""; }
function vozRegion(v){ var l=String((v&&v.lang)||"");
  if(/^es[-_]MX/i.test(l)) return "mx"; if(/^es[-_]ES/i.test(l)) return "es"; if(/^es[-_][A-Z0-9]{2,3}/i.test(l)) return "latam"; return "otra"; }
function vozCalidad(v){ var s=_vozNv((v&&v.name)+" "+(v&&v.voiceURI));
  if(/premium/.test(s)) return "Premium"; if(/enhanced|mejorada|neural|natural|siri/.test(s)) return "Mejorada";
  /* Chrome/Android: las de Google y las de red (localService=false) son las naturales de ese navegador */
  if(/(^|\s)google\s|network/.test(s) || (v && v.localService===false && !/compact/.test(s))) return "Natural";
  return ""; }
function vozJuguete(v){ var s=_vozNv((v&&v.name)+" "+(v&&v.voiceURI));
  if(/eloquence|speech\.synthesis\.voice/.test(s)) return true;
  var w=_vozNv(v&&v.name).split(/[^a-z]+/); return w.some(function(x){ return VOCES_JUGUETE.indexOf(x)>=0; }); }
function vozGenero(v){ var w=_vozNv(v&&v.name).split(/[^a-z]+/);
  if(w.some(function(x){ return VOCES_MUJER.indexOf(x)>=0; })) return "Mujer";
  if(w.some(function(x){ return VOCES_HOMBRE.indexOf(x)>=0; })) return "Hombre";
  return ""; }
function vozNombre(v){ return String((v&&v.name)||"Voz").replace(/\s*\((enhanced|premium|mejorada)\)\s*/ig," ").replace(/^(microsoft|google)\s+/i,"").replace(/\s+online\b.*$/i,"").replace(/\s+/g," ").trim(); }
/* la mejor voz cuando no hay elenco: es-MX > es-US/419/LatAm > es-ES > es, y dentro de cada una Premium > Mejorada > normal */
function vozRango(v){ var r={mx:0, latam:1, es:2, otra:3}[vozRegion(v)], q={Premium:0, Mejorada:1, Natural:1}[vozCalidad(v)];
  if(q==null) q=/compact/.test(_vozNv(v&&v.voiceURI))?3:2; return r*10+q; }
function vocesOrdenadas(){ return vocesEs().filter(function(v){ return !vozJuguete(v); }).map(function(v,i){ return {v:v, i:i}; }).sort(function(a,b){ return (vozRango(a.v)-vozRango(b.v))||(a.i-b.i); }).map(function(x){ return x.v; }); }
function vozMejor(){ return vocesOrdenadas()[0]||null; }
/* lo que enseña la pantalla Voces: las de alta calidad (máx. 8) o, si no hay, las 3 mejores con alta:false para avisar.
   Las ya palomeadas se muestran siempre, para que se puedan quitar. */
function vocesLista(elegidas){ var V=vocesOrdenadas(), A=V.filter(function(v){ return !!vozCalidad(v); }), alta=A.length>0;
  var L=(alta?A:V).slice(0, alta?VOCES_LISTA_MAX:VOCES_RESPALDO);
  (elegidas||[]).forEach(function(v){ if(v && L.indexOf(v)<0) L.push(v); });
  return {voces:V.filter(function(v){ return L.indexOf(v)>=0; }), alta:alta}; }
/* lo guardado: la ficha (Firestore) manda; si no ha llegado, el respaldo local */
function vocesConfig(){
  var p=null; try{ p=(PERSONAS[yo]||{}).voces; }catch(e){}
  if(!p || typeof p!=="object"){ try{ p=JSON.parse(localStorage.getItem("bit_voces_"+yo)||"null"); }catch(e){ p=null; } }
  p=(p && typeof p==="object")?p:{};
  var E=Array.isArray(p.elenco)?p.elenco.filter(function(x){ return typeof x==="string" && x; }).slice(0, VOCES_MAX):[];
  return {v:1, elenco:E, ritmo:(+p.ritmo>0?+p.ritmo:null), tono:(+p.tono>0?+p.tono:VOCES_TONO), ts:p.ts||0};
}
function guardaVoces(o){
  var c=vocesConfig(), n={v:1, elenco:(o.elenco||c.elenco).slice(0, VOCES_MAX), ritmo:(o.ritmo!=null?o.ritmo:(c.ritmo||VOCES_RITMO)), tono:(o.tono!=null?o.tono:c.tono), ts:Date.now()};
  try{ PERSONAS[yo]=PERSONAS[yo]||{}; PERSONAS[yo].voces=n; }catch(e){}
  try{ if(db) db.collection(COLP).doc(yo).set({voces:n},{merge:true}).catch(function(){ toast("No se pudieron guardar tus voces"); }); }catch(e){}
  try{ localStorage.setItem("bit_voces_"+yo, JSON.stringify(n)); }catch(e){}
  try{ localStorage.setItem("bit_lee_rate", String(n.ritmo)); }catch(e){}   /* la velocidad es la misma de "Ajustar lectura" */
  return n;
}
/* el elenco que SÍ existe en este dispositivo, en el orden en que se palomeó */
function vozElenco(){ var vs=vocesEs(), out=[];
  vocesConfig().elenco.forEach(function(id){ var v=vs.filter(function(x){ return vozId(x)===id; })[0]||vs.filter(function(x){ return x.name===id; })[0]; if(v && out.indexOf(v)<0) out.push(v); });
  return out; }
function vozTono(){ return vocesConfig().tono||VOCES_TONO; }
/* ROTACIÓN: rol = quién habla (Caminata: "A"/"B"). Mismo rol seguido = misma voz; rol nuevo o rol null (mensaje nuevo) = la siguiente
   del elenco, así una pregunta y su respuesta nunca salen con la misma voz si hay 2 o más. */
var VOZ_ROT={i:-1, rol:undefined};
function vozRota(rol){ var E=vozElenco(); if(!E.length) return null;
  if(rol==null || rol!==VOZ_ROT.rol || VOZ_ROT.i<0){ VOZ_ROT.i=(VOZ_ROT.i+1)%E.length; }
  VOZ_ROT.rol=(rol==null?undefined:rol);
  return E[VOZ_ROT.i%E.length]; }
function vozTurnoNuevo(){ VOZ_ROT.rol=undefined; }
/* voz para lectura (un mensaje = un turno) */
function vozLectura(){ return vozRota(null)||vozMejor(); }
function vozDi(texto, voz, fin){
  try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(texto); if(voz){ u.voice=voz; u.lang=voz.lang||"es-MX"; } else u.lang="es-MX";
    u.rate=_leeRate(); u.pitch=vozTono(); if(fin){ u.onend=fin; u.onerror=fin; } speechSynthesis.speak(u); return u; }catch(e){ return null; } }
/* el mini diálogo de "Probar el elenco": cada línea con la siguiente voz */
function vocesPrueba(){
  var E=vozElenco(); if(!E.length){ var m=vozMejor(); E=m?[m]:[]; }
  var k=0, tok=(window.__vocTok=(window.__vocTok||0)+1);
  try{ speechSynthesis.cancel(); }catch(e){}
  var uno=function(){ if(tok!==window.__vocTok || k>=VOCES_DIALOGO.length) return;
    var v=E.length?E[k%E.length]:null, t=VOCES_DIALOGO[k++];
    try{ var u=new SpeechSynthesisUtterance(t); if(v){ u.voice=v; u.lang=v.lang||"es-MX"; } else u.lang="es-MX"; u.rate=_leeRate(); u.pitch=vozTono();
      u.onend=function(){ setTimeout(uno, 150); }; u.onerror=function(e){ if(e && (e.error==="interrupted"||e.error==="canceled")) return; setTimeout(uno, 150); };
      speechSynthesis.speak(u); }catch(e){} };
  uno();
}
/* iOS entrega las voces tarde: se espera voiceschanged y se repinta la pantalla si está abierta */
(function(){ try{ if(window.speechSynthesis && speechSynthesis.addEventListener) speechSynthesis.addEventListener("voiceschanged", function(){ if(typeof vista!=="undefined" && vista==="voces") try{ render(); }catch(e){} }); }catch(e){} })();
function _vozAttr(s){ return esc(s).replace(/"/g,"&quot;"); }
var ICO_CHK_VOZ='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path class="pal" d="M8 12.3l2.8 2.8L16.2 9.4"/></svg>';
function vVoces(){
  var c=vocesConfig(), E=vozElenco(), LV=vocesLista(E), V=LV.voces, ritmo=c.ritmo||_leeRate(), elegidas=E.map(vozId);
  var AYUDA='Ajustes → Accesibilidad → Contenido leído (en versiones nuevas puede llamarse «Leer y hablar») → Voces → Español. Descarga las «Mejoradas» o «Premium», son gratis, y vuelve aquí.';
  var h='<div class="top"><button class="iconbtn" id="bback" aria-label="Regresar">‹</button><div><div class="tnm"><span class="t">Voces</span></div><div class="d">Elige hasta 3 para tu caminata</div></div></div>';
  h+='<div class="scroll"><div class="voc">';
  h+='<div class="vocel"><div class="vocelt">Tu elenco</div><div class="vocelv">'+(E.length?esc(E.map(vozNombre).join(" · ")):"Sin elegir. Se usa la mejor voz de México.")+'</div>'+
     '<label class="vocsl"><span>Velocidad</span><input type="range" id="vocritmo" min="0.8" max="1.5" step="0.05" value="'+ritmo+'" aria-label="Velocidad"></label>'+
     '<label class="vocsl"><span>Tono</span><input type="range" id="voctono" min="0.8" max="1.2" step="0.05" value="'+c.tono+'" aria-label="Tono"></label>'+
     '<button class="vocprueba" id="vocprueba">'+svgPlay()+' Probar el elenco</button></div>';
  if(!V.length){
    h+='<p class="vocvacio" id="vocvacio">'+(window.speechSynthesis?"Buscando las voces de tu teléfono…":"Este navegador no lee en voz alta.")+'</p>';
  }
  if(V.length && !LV.alta) h+='<p class="vocaviso" id="vocaviso">Tu teléfono no tiene voces de alta calidad en español; estas son las mejores que hay. Para voces naturales, en el iPhone: '+esc(AYUDA)+'</p>';
  VOCES_REGION.forEach(function(R){
    var L=V.filter(function(v){ return vozRegion(v)===R.k; }); if(!L.length) return;
    h+='<div class="vocgrp">'+esc(R.tx)+'</div>';
    L.forEach(function(v){ var id=vozId(v), on=elegidas.indexOf(id)>=0, g=vozGenero(v), q=vozCalidad(v);
      var det=[g||"Sin dato", q, v.lang].filter(Boolean).join(" · ");
      h+='<div class="vocrow'+(on?' on':'')+'"><button class="vocplay" data-vplay="'+_vozAttr(id)+'" aria-label="Escuchar '+_vozAttr(vozNombre(v))+'">'+svgPlay()+'</button>'+
         '<button class="vocsel" data-vsel="'+_vozAttr(id)+'" role="checkbox" aria-checked="'+(on?"true":"false")+'"><span class="tx">'+esc(vozNombre(v))+'<small>'+esc(det)+'</small></span>'+ICO_CHK_VOZ+'</button></div>';
    });
  });
  if(LV.alta || !V.length) h+='<p class="vocayuda">¿Quieres más voces? En el iPhone: '+esc(AYUDA)+'</p>';
  h+='<p class="vocayuda">Son las voces de tu teléfono. Voces tipo cine o como el podcast de NotebookLM necesitan un servicio de paga.</p>';
  return h+'</div></div>';
}
function bindVoces(){
  var bb=$("bback"); if(bb) bb.onclick=function(){ window.__vocTok=(window.__vocTok||0)+1; try{ speechSynthesis.cancel(); }catch(e){} vista="lista"; render(); };
  var vs=vocesEs(), de=function(id){ return vs.filter(function(x){ return vozId(x)===id; })[0]||null; };
  Array.prototype.forEach.call(document.querySelectorAll("[data-vplay]"),function(b){ b.onclick=function(){ window.__vocTok=(window.__vocTok||0)+1; vozDi(VOCES_MUESTRA, de(b.getAttribute("data-vplay"))); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-vsel]"),function(b){ b.onclick=function(){
    var id=b.getAttribute("data-vsel"), E=vocesConfig().elenco.filter(function(x){ return !!de(x); }), i=E.indexOf(id);
    if(i>=0) E.splice(i,1);
    else { if(E.length>=VOCES_MAX){ toast("Máximo 3 voces. Quita una para poner otra."); return; } E.push(id); }
    guardaVoces({elenco:E}); VOZ_ROT.i=-1; render(); }; });
  var r=$("vocritmo"); if(r) r.onchange=function(){ guardaVoces({ritmo:+r.value}); vocesPrueba(); };
  var t=$("voctono"); if(t) t.onchange=function(){ guardaVoces({tono:+t.value}); vocesPrueba(); };
  var p=$("vocprueba"); if(p) p.onclick=vocesPrueba;
  /* en iOS las voces pueden tardar: se reintenta unos segundos aunque no llegue voiceschanged */
  if(!vs.length && window.speechSynthesis){ var n=0, iv=setInterval(function(){ n++; if(vista!=="voces"){ clearInterval(iv); return; }
    if(vocesEs().length){ clearInterval(iv); render(); } else if(n>=12){ clearInterval(iv); var x=$("vocvacio"); if(x) x.textContent="Este teléfono no tiene voces en español. Descárgalas con la ayuda de abajo."; } }, 400); }
}
/* ===== build 268: TAG ESTABLE de cada notificación y cierre de las resueltas =====
   Tags: "q:<tareaId>:<idPregunta>" · "acuerdo:<id>" · "rec:<tareaId>:<avisoId>". Sin origen conocido: tipo|url|hash del cuerpo.
   El sw.js reemplaza (mismo tag) y no repite (mismo tag + mismo cuerpo en 24 h); aquí se cierran las que ya se resolvieron. */
function hash268(s){ var h=5381; s=String(s||""); for(var i=0;i<s.length;i++){ h=((h<<5)+h+s.charCodeAt(i))|0; } return (h>>>0).toString(36); }
function tagDe268(tipo, url, cuerpo){ return "p:"+(tipo||"")+"|"+(url||"")+"|"+hash268(cuerpo); }
function tidDeUrl(url){ var m=String(url||"").match(/[?&](?:recordatorio|tarea|id)=([^&#]+)/); try{ return m?decodeURIComponent(m[1]):""; }catch(e){ return m?m[1]:""; } }
function tareaResuelta(t){ return !!t && (!!t.cierre || t.estado==="dormida" || t.estado==="cerrada" || !!t.fusionada_en || (typeof estadoReal==="function" && estadoReal(t)==="cerrada")); }
function pendientePreg(t){
  try{ if(preguntas249(t).length) return true; }catch(e){}
  try{ if(preguntaParaMi(t)) return true; }catch(e){}
  try{ if(esDecisionSal(t)) return true; }catch(e){}
  return false;
}
/* ¿esta notificación ya es de algo resuelto? (n: {tag, data}) */
function resueltaNotif(n){
  var tag=String((n&&n.tag)||(n&&n.data&&n.data.tag)||""), m, L=(typeof tareas!=="undefined"&&tareas)||[], tt=function(id){ return L.filter(function(x){ return x && x.id===id; })[0]; };
  if((m=tag.match(/^q:([^:]+):(.*)$/))){ var t=tt(m[1]); return !!t && (tareaResuelta(t) || !pendientePreg(t)); }
  if((m=tag.match(/^rec:([^:]+):(.*)$/))){ var t2=tt(m[1]); if(!t2) return false; if(tareaResuelta(t2)) return true;
    try{ return !avisosDe(t2).some(function(a){ return a && (a.id===m[2] || (a.self && m[2]==="self")); }); }catch(e){ return false; } }
  var id=String((n&&n.data&&(n.data.id||n.data.tarea_id||n.data.tareaId))||tidDeUrl(n&&n.data&&n.data.url)||""); if(id && !/^acuerdo:/.test(tag)){ var t3=tt(id); if(t3 && tareaResuelta(t3)) return true; }
  return false;
}
function swReg(){ try{ if(!("serviceWorker" in navigator)) return Promise.resolve(null); return navigator.serviceWorker.ready.catch(function(){ return null; }); }catch(e){ return Promise.resolve(null); } }
/* barre las notificaciones abiertas y cierra las de cosas resueltas. force = sin esperar el respiro de 20 s */
function barreNotifs(force){
  try{ if(!force && window.__barreN268 && Date.now()-window.__barreN268<20000) return Promise.resolve(0); window.__barreN268=Date.now();
    return swReg().then(function(reg){ if(!reg || !reg.getNotifications) return 0; return reg.getNotifications().then(function(L){ var n=0; L.forEach(function(x){ try{ if(resueltaNotif(x)){ x.close(); n++; } }catch(e){} }); return n; }); }).catch(function(){ return 0; });
  }catch(e){ return Promise.resolve(0); }
}
function disparaPushInstantaneo(para, titulo, cuerpo, url, tipo, tag) {
  if (!para || para === yo) return; // No auto-notificar si la acción la hace uno mismo
  /* build 268: no se dispara el push de un recordatorio o una pregunta que ya está resuelto */
  try{ if(/^(recordatorio|espera|te_necesito|pregunta)$/.test(tipo||"") && typeof tareas!=="undefined"){ var _tid=tidDeUrl(url), _tr=tareas.filter(function(x){ return x && x.id===_tid; })[0]; if(_tr && tareaResuelta(_tr)) return; } }catch(e){}
  /* build 200: lo que esa persona apago en Notificaciones no se le manda; el tipo viaja al servidor */
  tipo = tipo || tipoDePush(titulo, cuerpo);
  var sub = (tipo==="te_necesito") ? subtipoDePush(titulo, cuerpo) : "";
  if (!notifPermite(para, tipo, sub)) return;
  
  fetch('/push.php?action=send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-app-token': APP_TOKEN
    },
    body: JSON.stringify({
      usuario: para,
      title: titulo || 'Doit',
      body: cuerpo || 'Tienes una nueva notificación',
      url: url || '',
      tipo: tipo || '',
      subtipo: sub,   /* build 269: llamada | atorado | ia_atorada */
      tag: tag || (typeof tagDe268==="function"?tagDe268(tipo, url, cuerpo):"")   /* build 268: la Mac manda el suyo (q:/acuerdo:/rec:) */
    })
  }).then(function(r){ return r.json(); })
    .then(function(res){
      console.log('Push instantáneo enviado a ' + para + ':', res);
    }).catch(function(err){
      console.error('Error al disparar push:', err);
    });
}

/* la clave publica viaja como bytes al navegador */
function vapidBytes(base64){
  var pad="=".repeat((4-base64.length%4)%4);
  var b64=(base64+pad).replace(/-/g,"+").replace(/_/g,"/");
  var raw=atob(b64), arr=new Uint8Array(raw.length);
  for(var i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
  return arr;
}

/* ¿se puede tener avisos en este telefono AHORA MISMO? Se dice el porque,
   no un "no" pelon: en iPhone Apple EXIGE que la app este agregada a la
   pantalla de inicio; si no, ni se intenta. */
function estadoAvisos(){
  if(!("serviceWorker" in navigator) || !("PushManager" in window))
    return {ok:false, motivo:"Este navegador no maneja avisos."};
  var iOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  if(iOS && !estaInstalada())
    return {ok:false, motivo:"En iPhone, primero agrega la app a tu pantalla de inicio (Compartir → Agregar a inicio). Los avisos solo funcionan desde ahí."};
  if(Notification.permission==="denied")
    return {ok:false, motivo:"Bloqueaste los avisos. Actívalos en Ajustes → la app."};
  return {ok:true, ya:(Notification.permission==="granted")};
}

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
      return fetch(PUSH,{
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

/* RESINCRONIZAR SIN PREGUNTAR (Salvador 2026-09-22). Al borrar y reinstalar la
   app, el iPhone conserva el permiso pero el servidor pierde la suscripcion:
   push.php contestaba "No se encontro suscripcion push para el usuario". Como
   el permiso ya esta dado, aqui NO se pide (no hace falta toque): solo se toma
   la suscripcion del navegador (o se crea) y se vuelve a mandar al servidor.
   Corre al arrancar y cada vez que se pica el boton de avisos. */
function resincronizaAvisos(cb){
  cb=cb||function(){};
  try{
    if(!("serviceWorker" in navigator) || !("PushManager" in window) || Notification.permission!=="granted"){ cb(false); return; }
    navigator.serviceWorker.ready.then(function(reg){
      return reg.pushManager.getSubscription().then(function(sub){
        if(sub) return sub;
        return reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:vapidBytes(VAPID_PUBLIC)});
      });
    }).then(function(sub){
      var j=sub.toJSON();
      return fetch(PUSH,{method:"POST",
        headers:{"content-type":"application/json","x-app-token":APP_TOKEN},
        body:JSON.stringify({usuario:yo||"anonimo", subscription:{endpoint:j.endpoint, keys:j.keys}})});
    }).then(function(r){ cb(!!(r&&r.ok)); }).catch(function(){ cb(false); });
  }catch(e){ cb(false); }
}
/* --- AVISOS PUSH: tarjeta y banner compartidos (Salvador 2026-09-18).
   La tarjeta vive en "Tu cuenta" (todos) y como PRIMERA sección del engrane.
   El banner sale en el home mientras no estén activados. --- */
function cardAvisos(){
  var e=estadoAvisos(), ya=(e.ok && e.ya);
  var sub = ya ? "Este teléfono tiene permiso de avisos. Si dejaron de llegar (por ejemplo, reinstalaste la app), vuelve a activarlos aquí."
         : (e.ok ? "Un aviso al celular cuando algo te espera o se te vence. Actívalo en cada teléfono donde quieras recibirlos."
                 : (e.motivo||""));
  return '<h2>Avisos en este teléfono</h2>'+
    '<div class="card"><div class="sm">'+esc(sub)+'</div>'+
    (e.ok ? '<div class="acts"><button class="mini" id="bavisos">'+(ya?"Reactivar avisos aquí":"Activar avisos aquí")+'</button></div>' : '')+
    '</div>';
}
function bindBotonAvisos(){
  var ba=$("bavisos"); if(!ba) return;
  ba.onclick=function(){
    ba.disabled=true; ba.textContent="Activando…";
    activaAvisos(function(ok,msg){
      ba.disabled=false; ba.textContent=ok?"Avisos activados":"Activar avisos aquí";
      toast(msg);
      if(ok){ window.__nudgeAvisos=false; render(); }
      /* aunque el permiso ya estuviera dado, se re-manda la suscripcion al servidor */
      if(ok) resincronizaAvisos(function(ok2){ if(!ok2) toast("El servidor no confirmó la suscripción."); });
    });
  };
}
function bannerAvisos(){
  if(window.__nudgeAvisos===false) return "";
  var e=estadoAvisos();
  if(e.ok && e.ya) return "";
  var msg, btn=false;
  if(e.ok){ msg="Activa tus avisos para que este teléfono te recuerde lo que se vence."; btn=true; }
  else if(/inicio/i.test(e.motivo||"")){ msg=e.motivo; }
  else return "";
  return '<div id="nudgeav" style="display:flex;align-items:center;gap:10px;background:rgba(255,159,10,.12);border:.5px solid rgba(255,159,10,.5);border-radius:14px;padding:12px 14px;margin:10px 12px 4px">'+
    '<div class="sm" style="flex:1;margin:0">'+esc(msg)+'</div>'+
    (btn?'<button class="mini" id="bavisos" style="flex:none">Activar</button>':'')+
    '<button id="xnudav" aria-label="Cerrar" style="flex:none;background:none;border:0;color:var(--ink-3,#7A7A80);font-size:20px;line-height:1;padding:2px 4px">×</button>'+
    '</div>';
}

var MODO_CEREBRO="pesado";   /* build 251: dictados, indicaciones a Claude y respuestas de la tarjeta de preguntas; el servidor (claude.php) decide qué modelo es cada modo */
/* build 283 (casos Comedor y Moric, 7-oct): dictados, indicaciones a Claude y respuestas a «Decide tú» van en "rapido" (2-3 s, corte a los 8 s,
   sin reintento). "pesado" queda solo para «Falta info» / tarea nueva. Lo que el rápido no resuelve queda de encargo para la Mac (ordenPendiente). */
var MODO_RAPIDO283="rapido";
window.__MODELO_CLAUDE=window.__MODELO_CLAUDE||{};
/* Pregunta al Claude de la app. modelo: "rapido" o "pesado".
   cb(textoRespuesta, error) */
function preguntaAClaude(mensajes, modelo, cb){
  if(APP_TOKEN.indexOf("__")===0){ cb(null,"La app todavia no esta publicada en el servidor."); return }
  var planos=[];
  mensajes.forEach(function(m){
    if(typeof m.content==="string" && m.content.length>18000){
      for(var i=0;i<m.content.length;i+=18000)
        planos.push({role:m.role, content:m.content.slice(i,i+18000)});
    } else planos.push(m);
  });
  function tira(intento){
    /* Candado de tiempo — Salvador 2026-09-23: sin esto, si el proxy se
       quedaba pensando (servidor saturado, sin red de vuelta), el fetch
       jamas contestaba ni fallaba y la pantalla se quedaba trabada para
       siempre en "Leyendo lo que dijiste...". Ahora, si no hay respuesta en
       25s, se corta solo y cae al intento/aviso de siempre. */
    var ctrl = (typeof AbortController!=="undefined") ? new AbortController() : null;
    var vencio = false;
    var tOut = ctrl ? setTimeout(function(){ vencio=true; ctrl.abort(); }, (modelo==="rapido")?8000:25000) : null;   /* build 283: el rápido corta a los 8 s */
    /* si Claude YA contesto y lo que truena es lo que la app hace despues, NO se
       vuelve a preguntar (antes eso duplicaba el recordatorio). 2026-09-23 */
    var entregado = false, t0lat=Date.now(), chLat=planos.reduce(function(a, m){ return a+String(m.content||"").length; }, 0);
    fetch(PROXY,{method:"POST",
      headers:{"content-type":"application/json","x-app-token":APP_TOKEN,"x-usuario":yo||"anonimo"},
      body:JSON.stringify({modelo:modelo||"rapido",messages:planos}),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function(r){ return r.json().then(function(j){ return {ok:r.ok,j:j} }) })
     .then(function(res){
       if(tOut) clearTimeout(tOut);
       entregado = true;
       try{ window.__lat={modelo:modelo||"rapido", ms:Date.now()-t0lat, chars:chLat, fin:Date.now()}; }catch(_l){}   /* cuánto tardó el modelo y cuánto se le mandó (se anota en el dictado) */
       if(!res.ok){ cb(null,(res.j&&res.j.error)||"No se pudo preguntar."); return }
       try{ if(res.j && res.j.model) window.__MODELO_CLAUDE[modelo||"rapido"]=String(res.j.model); }catch(_m){}   /* build 251: el modelo que dice el servidor */
       cb((res.j.content&&res.j.content[0]&&res.j.content[0].text)||"",null);
     }).catch(function(e){
       if(tOut) clearTimeout(tOut);
       if(entregado){ try{console.error(e)}catch(_e){} toast("Falló después de la respuesta: "+String((e&&e.message)||e).slice(0,80)); return }
       if(intento<1 && modelo!=="rapido"){ setTimeout(function(){tira(intento+1)},800); return }   /* build 283: el rápido no reintenta en serie (lo termina la Mac) */
       cb(null, vencio ? "No contesto a tiempo." : "Sin conexion.");
     });
  }
  tira(0);
}

var COL="bitacora_tareas";     // tareas

/* ================= MOTOR DE REGLAS =================
   Todo lo que se definió con Salvador el 2026-09-02.
   NADA DE ESTO LO VE EL EMPLEADO: él solo ve HOY o VENCIDA.
   Las etiquetas las pone Claude al dar de alta la tarea.

   CAMPOS QUE LLEVA CADA TAREA
     f_original   la fecha con la que nació. NUNCA cambia. Contra ésta se mide.
     f_vigente    la fecha de hoy en día. Puede haberse movido.
     movidas      cuántas veces se movió la fecha.
     movimientos  build 140: [{de,a,ts,por,motivo}] una por movida; motivo ""
                  = no dijo por qué (se pregunta despues, nunca se exige).
     recuperable  true  -> entregar tarde todavía sirve (existe "tarde")
                  false -> pasada la hora ya no sirve (o verde, o NO EJECUTADA)
     criticidad   "diario" | "normal" | "lento"  -> tope de días trabado
     periodicidad null | "semanal" | "mensual"
     detenido     null | {quien,tel,que,desde,cadencia,toques:[{f,r}]}
     cierre       null | {tipo,motivo,f}
*/

var TOPE_TRABADO={diario:2,normal:5,lento:15};
var CADENCIA_TOQUE={diario:1,normal:1,lento:3};
var TOPE_UNICA_VENCIDA=30;   // días vencida sin nada -> no ejecutada
var MAX_MOVIDAS=2;           // la tercera no existe

/* Salvador 2026-09-22: antes usaba toISOString (UTC). En Mexico (UTC-6), de las
   6 pm en adelante eso devolvia el dia SIGUIENTE: "26 de septiembre" dictado a
   las 18:45 quedaba como 27. Ahora usa la fecha LOCAL, igual que hoy(). */
function iso(d){ d=new Date(d); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0") }
function dm(n){ var d=new Date(); d.setDate(d.getDate()+n); return iso(d) }
function dDif(a,b){ return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/86400000) }

/* cuándo deja de servir una recuperable: lo dicta la periodicidad, no se pregunta */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function topeRecuperable(t){
  if(!t.f_original) return null;
  if(t.periodicidad==="semanal") return dmDe(t.f_original,7);
  if(t.periodicidad==="mensual") return dmDe(t.f_original,30);
  return dmDe(t.f_original,TOPE_UNICA_VENCIDA);
}
function dmDe(f,n){ var d=new Date(f+"T00:00:00"); d.setDate(d.getDate()+n); return iso(d) }

/* días que NO le cuentan a la persona: los que estuvo detenida CON su toque hecho */
function diasNoImputables(t){
  if(!t.detenido||!t.detenido.desde) return 0;
  var d=dDif(t.detenido.desde,hoy());
  return pausaValida(t)?d:0;
}

/* LA PAUSA NO ES GRATIS: si no hizo el toque, la pausa se rompe HACIA ATRÁS */
function pausaValida(t){
  var p=t.detenido; if(!p) return false;
  var cad=CADENCIA_TOQUE[t.criticidad||"normal"];
  var dias=dDif(p.desde,hoy());
  var esperados=Math.floor(dias/cad);
  return (p.toques||[]).length>=esperados;
}
function tocaToqueHoy(t){
  var p=t.detenido; if(!p) return false;
  var cad=CADENCIA_TOQUE[t.criticidad||"normal"];
  var ult=(p.toques||[]).length?p.toques[p.toques.length-1].f:p.desde;
  return dDif(ult,hoy())>=cad;
}
function diasDetenido(t){ return t.detenido?dDif(t.detenido.desde,hoy()):0 }

/* @@CAMPOS-UNICOS-INICIO — contrato docs/campos-unicos.md. Este bloque vive IGUAL, letra por letra, en la app (index.html)
   y en el bot de la Mac (index.js): cuatro lectores únicos para lo que antes se leía de varios campos con reglas distintas.
     estaAbierta(t)                 ¿la tarea sigue abierta? (cierre, fusionada_en, vinculada_a, estado de cierre)
     yaContestada(t, pregunta, ctx) ¿Salvador ya contestó esa pregunta? (respuestas_log; respaldo: resp267, apartado, «Respuesta a «q»», ts)
     esperaDe(t, ctx)               ¿a quién espera la tarea? (espera_a; respaldo: detenido, estado espera, encargo abierto)
     encargadoDe(t, ctx)            ¿quién la tiene encargada? (encargado en cualquier forma; respaldo: responsable)
   Leer nunca escribe. Lo único que escribe es anotaRespuesta (agrega a respuestas_log y, para versiones viejas, a resp267).
   ctx = {yo, personas:{id:{nombre, jefe}}, encargos:[{id, para (o a), cerrado, creado, texto}], nombresYo:[...]}; si falta, ctxCampos() del anfitrión. */
var ESTADOS_DE_CIERRE=["cerrada","no_ejecutada","fusionada","eliminada","borrada","descartada"];
function estaAbierta(t){
  if(!t || typeof t!=="object") return false;
  if(t.cierre || t.fusionada_en || t.vinculada_a) return false;
  return ESTADOS_DE_CIERRE.indexOf(String(t.estado||"").toLowerCase().trim())<0;
}
function normCampo(s){ return String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9ñ ]+/g," ").replace(/\s+/g," ").trim(); }
function ctxCamposDe(ctx){
  var c=ctx||(typeof ctxCampos==="function"?ctxCampos():null)||{};
  return {yo:String(c.yo||""), personas:(c.personas && typeof c.personas==="object")?c.personas:{}, encargos:Array.isArray(c.encargos)?c.encargos:[],
    nombresYo:(Array.isArray(c.nombresYo)?c.nombresYo:[]).map(normCampo).filter(Boolean)};
}
/* la Mac repite la misma pregunta cada día con otra fecha («… (revisión 8-oct)») y a veces con «IA ·» al principio: la clave va sin eso */
function clavePregunta(q){
  var s=String(q==null?"":q).replace(/^\s*IA\s*[·:]\s*/i,"").replace(/\(\s*revisi[oó]n[^)]*\)/gi," ");
  return normCampo(s).slice(0,90).trim().replace(/\s*\brevision \d{1,2} [a-z]{3,}$/,"").trim();
}
/* misma pregunta: misma clave, o una empieza con la otra (las claves viejas se cortaban a 80 o 90 letras) */
function mismaPregunta(a, b){
  var x=clavePregunta(a).replace(/^ia /,""), y=clavePregunta(b).replace(/^ia /,"");
  if(!x || !y) return false; if(x===y) return true;
  return Math.min(x.length, y.length)>=30 && (x.indexOf(y)===0 || y.indexOf(x)===0);
}
function textoPregunta(p){ if(p==null) return ""; if(typeof p!=="object") return String(p); return String(p.pregunta||p.q||p.que||p.texto||p.t||""); }
/* la última vez que Salvador contestó algo en la tarea: lo que dictó o escribió él, la nota «Entendí…» con la que se aplicó su
   respuesta, o su respuesta a la decisión. Una pregunta hecha antes de eso ya quedó contestada. */
function ultimaRespuestaDe(t, ctx){
  var C=ctxCamposDe(ctx), m=0; if(!t || typeof t!=="object") return 0;
  (Array.isArray(t.msgs)?t.msgs:[]).forEach(function(x){ if(!x || x.oculto || x.eliminado) return; var ts=+x.ts||0; if(!ts) return;
    var suyo=x.k==="bo" && (x.de===C.yo || (!x.de && t.duenio===C.yo));
    var aplicada=x.k==="bi" && /^\s*(IA:\s*)?Entend[ií]/.test(String(x.t||""));
    if((suyo || aplicada) && ts>m) m=ts; });
  var D=t.decision; if(D && typeof D==="object" && D.respuesta && (+D.respuesta.ts||0)>m) m=+D.respuesta.ts;
  return m;
}
function yaContestada(t, pregunta, ctx){
  if(!t || typeof t!=="object") return false;
  var q=textoPregunta(pregunta); if(!clavePregunta(q)) return false;
  var igual=function(x){ return mismaPregunta(x, q); };
  if((Array.isArray(t.respuestas_log)?t.respuestas_log:[]).some(function(r){ return r && typeof r==="object" && igual(r.pregunta||r.clave||""); })) return true;
  /* respaldo: lo que había antes (sin escribir nada) */
  if((Array.isArray(t.resp267)?t.resp267:[]).some(igual)) return true;
  var A=t.falta_paso_claude_apartado;
  if(A && (Array.isArray(A)?A:[A]).some(function(a){ return a && typeof a==="object" && igual(a.q||a.pregunta||""); })) return true;
  var re=/Respuesta a «([^»]*)»:/g;
  if((Array.isArray(t.msgs)?t.msgs:[]).some(function(m){ if(!m || m.eliminado) return false; var tx=String(m.t||""), x; re.lastIndex=0;
    while((x=re.exec(tx))) if(igual(x[1])) return true; return false; })) return true;
  var ts=(pregunta && typeof pregunta==="object")?(+pregunta.ts||0):0;
  return ts>0 && ts<=ultimaRespuestaDe(t, ctx);
}
/* agrega la respuesta al registro (y a resp267, que leen las versiones viejas). Devuelve true si escribió algo. */
function anotaRespuesta(t, pregunta, texto, por, via, ts){
  if(!t || typeof t!=="object") return false;
  var q=textoPregunta(pregunta).replace(/\s+/g," ").trim(), k=clavePregunta(q); if(!k) return false;
  var r={pregunta:q.slice(0,240), clave:k, texto:String(texto==null?"":texto).replace(/\s+/g," ").trim().slice(0,400), por:String(por||""), via:String(via||""), ts:+ts||Date.now()};
  var L=Array.isArray(t.respuestas_log)?t.respuestas_log.slice():[], cambio=false;
  if(!L.some(function(x){ return x && x.clave===k && x.texto===r.texto; })){ L.push(r); t.respuestas_log=L.slice(-100); cambio=true; }
  var R=Array.isArray(t.resp267)?t.resp267:[];
  if(!R.some(function(x){ return mismaPregunta(x, q); })){ t.resp267=R.concat([k]).slice(-60); cambio=true; }
  return cambio;
}
function personaCampo(x, C){
  x=String(x==null?"":x).trim(); if(!x) return null; var P=C.personas;
  if(P[x]) return {id:x, nombre:String(P[x].nombre||x)};
  var n=normCampo(x); for(var k in P){ if(P[k] && n && normCampo(P[k].nombre)===n) return {id:k, nombre:String(P[k].nombre)}; }
  return {id:"", nombre:x};
}
function encargadoDe(t, ctx){
  if(!t || typeof t!=="object") return null;
  var C=ctxCamposDe(ctx), E=t.encargado, r=null, fuente="";
  if(typeof E==="string" && E.trim()){ r=personaCampo(E, C); fuente="encargado"; }
  else if(E && typeof E==="object"){
    var a=E.a||E.para||E.quien||E.persona||"", id=String(E.id||"").trim(), enc="";
    if(a){ r=personaCampo(a, C); if(id && !C.personas[id]) enc=id; }
    else if(id && C.personas[id]) r=personaCampo(id, C);
    else if(id){ enc=id; var e=C.encargos.filter(function(x){ return x && x.id===id; })[0]; r=(e && (e.para||e.a))?personaCampo(e.para||e.a, C):{id:"", nombre:""}; }
    if(r){ r.encargo=enc; r.desde=String(E.desde||""); fuente="encargado"; }
  }
  if(!r && typeof t.responsable==="string" && t.responsable.trim()){ r=personaCampo(t.responsable, C); fuente="responsable"; }
  if(!r || (!r.id && !r.nombre && !r.encargo)) return null;
  return {id:r.id||"", nombre:r.nombre||"", encargo:r.encargo||"", desde:r.desde||"", fuente:fuente};
}
/* todas las esperas de la tarea, en orden: espera_a, detenido, estado «espera», encargo sin contestar. deMi = la espera es de Salvador (o de quien usa la app). */
function esperasDe(t, ctx){
  if(!estaAbierta(t) || t.es_recordatorio) return [];
  var C=ctxCamposDe(ctx), P=C.personas, out=[];
  var yoNom=normCampo(C.yo && P[C.yo] ? P[C.yo].nombre : C.yo);
  var deMi=function(id, nombre){ var n=normCampo(nombre); return !n || (!!id && id===C.yo) || n===normCampo(C.yo) || n===yoNom || C.nombresYo.indexOf(n)>=0; };
  var msDia=function(f){ return /^\d{4}-\d{2}-\d{2}$/.test(String(f||""))?new Date(f+"T00:00:00").getTime():0; };
  var pon=function(p, desde, motivo, fuente){ if(!p) return; out.push({id:p.id||"", quien:p.nombre||"", desde:+desde||0, motivo:String(motivo||""), fuente:fuente, deMi:deMi(p.id, p.nombre), jefe:!!(p.id && P[p.id] && P[p.id].jefe)}); };
  var W=t.espera_a;
  if(typeof W==="string" && W.trim()) pon(personaCampo(W, C), 0, "", "espera_a");
  else if(W && typeof W==="object" && String(W.quien||W.id||"").trim()){ var pw=personaCampo(W.id||W.quien, C); if(W.quien && pw && !pw.id) pw.nombre=String(W.quien); pon(pw, typeof W.desde==="number"?W.desde:(msDia(W.desde)||Date.parse(String(W.desde||""))||0), W.motivo, "espera_a"); }
  if(t.detenido && typeof t.detenido==="object" && String(t.detenido.quien||"").trim()){ var pd=personaCampo(t.detenido.quien, C); pd.nombre=String(t.detenido.quien); pon(pd, msDia(t.detenido.desde), t.detenido.que, "detenido"); }
  var est=String(t.estado||"").toLowerCase();
  if((est==="espera" || est==="esperando") && t.espera && String(t.espera).trim()) pon(personaCampo(t.espera, C), t.espera_desde, t.espera_motivo, "espera");
  var en=encargadoDe(t, C);
  if(en && en.encargo && en.fuente==="encargado"){ var e=C.encargos.filter(function(x){ return x && x.id===en.encargo; })[0];
    if(e && !e.cerrado && (en.id || en.nombre)) pon({id:en.id, nombre:en.nombre}, msDia(en.desde)||(+e.creado||0), e.texto, "encargo"); }
  return out;
}
function esperaDe(t, ctx){ return esperasDe(t, ctx)[0]||null; }
/* @@CAMPOS-UNICOS-FIN */
/* el contexto de la app para los lectores únicos: quién usa la app, el equipo y los encargos */
function ctxCampos(){ var n=[]; try{ n=(typeof yo!=="undefined" && yo && typeof misNombres==="function")?misNombres():[]; }catch(e){} return {yo:(typeof yo!=="undefined"&&yo)||"", personas:(typeof PERSONAS!=="undefined"&&PERSONAS)||{}, encargos:(typeof encargos!=="undefined"&&encargos)||[], nombresYo:n}; }

/* ---- EL ESTADO SE CALCULA, NO SE GUARDA A MANO ---- */
function estadoReal(t){
  if(t.cierre) return t.cierre.tipo==="hecha"?"cerrada":"no_ejecutada";
  if(typeof estaAbierta==="function" && !estaAbierta(t)) return String(t.estado||"").toLowerCase()==="no_ejecutada"?"no_ejecutada":"cerrada";   /* la cerró la Mac (vinculada_a) o su estado ya es de cierre */
  if(t.estado==="dormida") return "dormida";   /* build 264: expediente enterado, vive para lo que llegue */
  if(t.detenido) return "detenida";
  if(!t.f_vigente) return t.estado||"abierta";
  var d=dDif(t.f_vigente,hoy());
  if(d<0) return "por_ejecutar";
  if(d===0) return "hoy";
  /* build 191 (Salvador 2026-10-04): una tarea INDEFINIDA (t.indefinida, puesta a mano)
     no tiene finiquito: su fecha es solo el proximo ritmo. Nunca sale "vencida" por fecha;
     si el ritmo ya paso, queda en "hoy" (toca atenderla y darle su siguiente fecha).
     Las RECURRENTES si salen vencida, pero solo si la vuelta paso SIN confirmar
     (confirmar = siguienteVuelta, que corre la fecha); el texto va en tono positivo. */
  if(t.indefinida===true) return "hoy";
  if(typeof esperaConHito==="function" && esperaConHito(t)) return "espera";   /* build 263: el siguiente paso es de un tercero con fecha conocida: espera, no vencida */
  return "vencida";
}
function sinFinal(t){ return !!(t && (t.indefinida===true || t.tipo==="recurrente" || esRecurrente(t))); }
/* el chip de fecha de la fila: indefinida = "Indefinida · próximo: lunes" (nunca "vence") */
function chipFechaTarea(t){
  var c=fechaChip(t&&t.f_vigente);
  if(t && t.indefinida===true) return "Indefinida"+(c?" · próximo: "+c:"");
  return c;
}
/* texto corto de una tarea cuya fecha ya paso (lista "Te toca", voz) */
function vencioTxt(t){
  var c=fechaChip(t.f_vigente)||"";
  return sinFinal(t) ? "tocaba "+c+", sin confirmar" : "venció "+c;
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function colorReal(t){
  var e=estadoReal(t);
  if(e==="cerrada"){
    var tarde=t.cierre&&t.f_original&&dDif(t.f_original,t.cierre.f)>0;
    return tarde?"naranja":"verde";
  }
  if(e==="no_ejecutada") return "rojo";
  if(e==="vencida") return "rojo";
  if(t.movidas>0) return "naranja";     // el rojo no se limpia moviendo la fecha
  return "verde";
}

/* ---- MOVER LA FECHA ----
   build 140 (Salvador 2026-09-25): la movida SIEMPRE se ejecuta. Ya no se
   niega por estar vencida (por eso se quedaba en "Vencidas": la fecha nunca
   cambiaba), ya no exige el motivo ANTES y ya no hay tope de movidas. Cada
   movida queda en t.movimientos con su motivo (se pregunta despues, opcional).
   Cintillo de Deshacer 3 s. Las recurrentes de dia fijo siguen sin moverse. */
function mueveFecha(t,nueva,razon){
  if(t.periodicidad&&t.dia_fijo)
    return {ok:false,msg:"Esta es recurrente con día fijo. NO SE MUEVE. Si no se hizo hoy, el día se perdió."};
  t.fecha_dictada=true;   /* build 201: la movio una persona */
  var de=t.f_vigente||"";
  if(nueva===de) return {ok:false,msg:"Ya está para el "+fechaBonita(nueva)+"."};
  var prev={f:de, movidas:t.movidas||0, n:(t.movimientos||[]).length, estado:t.estado,
            nm:(t.msgs||[]).length};
  t.movidas=(t.movidas||0)+1; t.f_vigente=nueva;
  t.movimientos=t.movimientos||[];
  t.movimientos.push({de:de, a:nueva, ts:Date.now(), por:yo||"", motivo:razon||""});
  t.pide_fecha=false; t.fecha_pendiente=null; t.reabre_fecha=false;
  if(t.estado==="vencida") t.estado="abierta";
  msg(t,"bi","Movida "+(de?"del "+fechaMovCorta(de)+" ":"")+"al "+fechaMovCorta(nueva)+".");
  if(!razon){ t.espera_motivo={ts:Date.now(), i:t.movimientos.length-1};
              msg(t,"bi","¿Por qué se movió? (opcional)"); }
  else t.espera_motivo=null;
  t.ultima="Movida al "+fechaMovCorta(nueva);
  sincronizaAvisos(t); guarda(t);
  window.__ultimoDeshacer={id:t.id, tipo:"fecha", cuando:Date.now(), restaurar:function(){
    t.f_vigente=prev.f; t.movidas=prev.movidas; t.estado=prev.estado;
    t.movimientos=(t.movimientos||[]).slice(0,prev.n); t.espera_motivo=null;
    t.msgs=(t.msgs||[]).slice(0,prev.nm);
    msg(t,"bi","Regresada al "+fechaMovCorta(prev.f)+".");
    sincronizaAvisos(t); guarda(t);
  }};
  muestraDeshacer("fecha","Movida al "+fechaBonita(nueva),3000);
  return {ok:true};
}
/* "vie 2 oct": la fecha corta de los mensajes de movida */
function fechaMovCorta(f){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(f||"")) return f||"";
  var d=new Date(f+"T00:00:00");
  return ["dom","lun","mar","mié","jue","vie","sáb"][d.getDay()]+" "+d.getDate()+" "+
    ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][d.getMonth()];
}
/* @@FECHAS-INICIO ===== build 190 (Salvador 2026-10-04 00:49): FECHAS SIN ERROR.
   "Digo el proximo miercoles y pone miercoles con otro numero, o lo pasa al jueves."
   REGLA DE SALVADOR: MANDA LA FECHA DICTADA. El telefono calcula TODAS las fechas;
   lo que proponga Claude (el modelo) solo se guarda si cuadra con lo dictado
   (candadoFecha) y el texto que se le muestra al usuario lo arma el codigo desde la
   fecha guardada (el dia de la semana se calcula de la fecha, nunca se copia).
   CONVENCION (una sola para toda la app; probada en tests/fechas.test.js):
   - Todo en hora LOCAL del telefono: hoy()/iso()/new Date(f+"T00:00:00"). Nunca
     toISOString() ni new Date("AAAA-MM-DD") (eso es UTC: en Monterrey da el dia de antes).
   - "el lunes" = "este lunes" = "el proximo lunes" = "el lunes que viene" = el lunes MAS
     CERCANO que viene, sin contar hoy. Dicho el domingo 4-oct a las 00:41 -> lunes 5-oct.
     Dicho un lunes -> el lunes de la otra semana.
   - "el martes de la proxima/otra/siguiente semana" = el martes de la semana de calendario
     que sigue (semanas de lunes a domingo). Dicho el sabado 3-oct -> martes 6-oct.
   - "la proxima semana" sola = dentro de 7 dias.
   - Dia + numero ("el miercoles 7", F19 "el sabado 10") = la fecha con ESE numero Y ESE
     dia, de hoy en adelante y dentro de 62 dias. Si ninguna cuadra ("lunes 4" y el 4 cae
     en domingo) NO se adivina: queda en DUDA y se hace UNA pregunta corta.
   - "2 de noviembre", "2 de nov", "2-nov", "15 de enero": esa fecha; si ya paso este año,
     la del que sigue. Con dia de la semana que no cuadra ("miercoles 5 de noviembre",
     que es jueves) -> DUDA. Fecha que no existe ("31 de noviembre") -> DUDA.
   - "el 15" / "el dia 15" / "para el 15" = el proximo dia 15 (hoy cuenta).
   - "en N dias/semanas/meses", "fin de mes", "hoy", "mañana", "pasado mañana".
   - "a las 10", "10:30", "10 am", "de la mañana", "en 2 horas" son HORA, nunca dia.
   - Si se dicen varias fechas, la principal es la primera exacta (con numero); si no hay
     exacta, la primera dicha. "hoy" junto con otra fecha no cuenta para mover. */
var _NOMDIA=["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
var _DIAL=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
var _MESL=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
var _MESN={enero:0,ene:0,febrero:1,feb:1,marzo:2,mar:2,abril:3,abr:3,mayo:4,may:4,junio:5,jun:5,
  julio:6,jul:6,agosto:7,ago:7,septiembre:8,setiembre:8,sept:8,sep:8,octubre:9,oct:9,
  noviembre:10,nov:10,diciembre:11,dic:11};
var _MESRE="septiembre|setiembre|noviembre|diciembre|febrero|octubre|agosto|marzo|abril|enero|junio|julio|mayo|sept|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic";
var _DIARE="domingo|lunes|martes|miercoles|jueves|viernes|sabado";
function _fsa(txt){
  return " "+String(txt||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/[¿?¡!,;()\[\]"“”«»]/g," ").replace(/\s+/g," ")+" ";
}
function _tapaTxt(x){ return String(x).replace(/[\s\S]/g," "); }
/* lo que es HORA se tapa con espacios (mismo largo) para que nunca se lea como dia */
function _hTapa(s){
  return s
    .replace(/\b\d{1,2}(?:\s*[:.]\s*\d{2})?\s*(?:de|por|en)\s+la\s+(?:manana|tarde|noche|madrugada)\b/g,_tapaTxt)
    .replace(/\b(?:de|por|en|a)\s+la\s+(?:manana|tarde|noche|madrugada)\b/g,_tapaTxt)
    .replace(/\ba\s+las?\s+(?:una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|\d{1,2})(?:\s*[:.]\s*\d{2})?\b/g,_tapaTxt)
    .replace(/\b\d{1,2}\s*:\s*\d{2}\b/g,_tapaTxt)
    .replace(/\b\d{1,2}\.\d{2}\b/g,_tapaTxt)
    .replace(/\b\d{1,2}\s*(?:am|pm|a\.\s?m\.?|p\.\s?m\.?|hrs?|horas?)(?![a-z])/g,_tapaTxt)
    .replace(/\b(?:en|dentro de)\s+(?:\d{1,3}|un|una|dos|tres|cuatro|cinco|diez|quince|veinte|treinta|media|un cuarto de)\s*(?:minutos?|min|horas?|hrs?|hora)\b/g,_tapaTxt);
}
function _fReal(f){ return /^\d{4}-\d{2}-\d{2}$/.test(f||"") && iso(new Date(f+"T00:00:00"))===f; }
function _fArma(y,mo,d){ return y+"-"+String(mo+1).padStart(2,"0")+"-"+String(d).padStart(2,"0"); }
function _dsem(f){ return new Date(f+"T00:00:00").getDay(); }
/* el proximo dia N del mes, de hoy en adelante (hoy cuenta) */
function _proxNumero(dd, H){
  var d=new Date(H+"T00:00:00");
  for(var i=0;i<400;i++){ if(d.getDate()===dd) return iso(d); d.setDate(d.getDate()+1); }
  return null;
}
/* "lunes 5 de octubre", siempre calculado de la fecha. (OJO: no se llama fechaLarga porque
   había una fechaLarga() más abajo -la de hoy-, sin uso; se retiró el 8-oct, ver archivo/.) */
function fechaConDia(f){ if(!_fReal(f)) return String(f||""); var d=new Date(f+"T00:00:00");
  return _DIAL[d.getDay()]+" "+d.getDate()+" de "+_MESL[d.getMonth()]; }
/* TODAS las fechas dichas, en el orden en que se dijeron, y las dudas. */
function fechasDichas(txt){
  var H=hoy(), h0=new Date(H+"T00:00:00"), w=_hTapa(_fsa(txt)), out=[], dudas=[], m, re;
  function tapa(mm){ w=w.slice(0,mm.index)+_tapaTxt(mm[0])+w.slice(mm.index+mm[0].length); }
  function add(f,i,k){ out.push({f:f,i:i,k:k}); }
  var pre="(?:\\b("+_DIARE+")\\s+(?:(?:el\\s+)?(?:proximo|que viene)\\s+)?(?:el\\s+)?)?";
  /* 1) AAAA-MM-DD (con dia de la semana delante, se revisa que cuadre) */
  re=new RegExp(pre+"\\b(\\d{4})-(\\d{2})-(\\d{2})\\b","g");
  while((m=re.exec(w))){
    var fI=m[2]+"-"+m[3]+"-"+m[4];
    if(!_fReal(fI)) dudas.push("La fecha "+fI+" no existe. ¿Qué fecha es?");
    else if(m[1] && _dsem(fI)!==_NOMDIA.indexOf(m[1])) dudas.push("El "+fechaConDia(fI).replace(/^\S+\s+/,"")+" es "+_DIAL[_dsem(fI)]+", no "+_DIAL[_NOMDIA.indexOf(m[1])]+". ¿Qué fecha es?");
    else add(fI,m.index,"iso");
    tapa(m);
  }
  /* 2) "2 de noviembre", "2 de nov", "2-nov", "2 noviembre 2027" */
  re=new RegExp(pre+"\\b(?:el\\s+)?(?:dia\\s+)?(\\d{1,2})(?:\\s+de\\s+|\\s*[-/]\\s*|\\s+)("+_MESRE+")\\b\\.?(?:\\s*(?:de\\s+|del\\s+|[-/]\\s*)?(\\d{4})\\b)?","g");
  while((m=re.exec(w))){
    var y0=h0.getFullYear(), yx=m[4]?+m[4]:0; if(yx && (yx<y0-1 || yx>y0+5)) yx=0;   /* "2 de nov 1500 pesos" no es año */
    var dd=+m[2], mo=_MESN[m[3]], yr=yx||y0, f=_fArma(yr,mo,dd);
    if(!yx && f<H) f=_fArma(yr+1,mo,dd);
    if(dd<1 || !_fReal(f)) dudas.push("El "+dd+" de "+_MESL[mo]+" no existe. ¿Qué fecha es?");
    else if(m[1] && _dsem(f)!==_NOMDIA.indexOf(m[1])) dudas.push("El "+dd+" de "+_MESL[mo]+" es "+_DIAL[_dsem(f)]+", no "+_DIAL[_NOMDIA.indexOf(m[1])]+". ¿Qué fecha es?");
    else add(f,m.index,"mes");
    tapa(m);
  }
  var noNum="(?!\\s*(?:%|por\\s+ciento|mil\\b|pesos|minutos?|horas?|hrs?|personas|veces|lugar|piso|arboles|focos|y\\s+media|de\\s+(?:la|las|los|el)\\b|o\\s+\\d|y\\s+(?:el\\s+)?\\d|[-/]\\d))";
  /* 2b) "hoy domingo", "mañana lunes", "hoy es sabado": el dia de la semana CONFIRMA, no es
     otra fecha. Si no cuadra ("mañana martes" y mañana es lunes) -> DUDA. */
  re=new RegExp("\\b(pasado\\s+manana|manana|hoy)\\s+(?:es\\s+)?("+_DIARE+")\\b(?!\\s+(?:el\\s+)?(?:dia\\s+)?\\d)","g");
  while((m=re.exec(w))){
    var kb=/^pasado/.test(m[1])?2:(m[1]==="hoy"?0:1), fb=dmDe(H,kb), wb=_NOMDIA.indexOf(m[2]);
    if(_dsem(fb)===wb) add(fb,m.index,kb?"rel":"hoy");
    else dudas.push((kb===0?"Hoy es ":(kb===1?"Mañana es ":"Pasado mañana es "))+fechaConDia(fb)+", no "+_DIAL[wb]+". ¿Qué fecha es?");
    tapa(m);
  }
  /* 3) dia + numero: "el miercoles 7", "sabado 10" */
  re=new RegExp("\\b("+_DIARE+")\\s+(?:el\\s+)?(?:dia\\s+)?(\\d{1,2})\\b"+noNum,"g");
  while((m=re.exec(w))){
    var wd=_NOMDIA.indexOf(m[1]), n=+m[2];
    if(n>=1 && n<=31){
      var d=new Date(H+"T00:00:00"), hit=null;
      for(var i=0;i<=62;i++){ if(d.getDate()===n && d.getDay()===wd){ hit=iso(d); break; } d.setDate(d.getDate()+1); }
      if(hit) add(hit,m.index,"diaNum");
      else { var pn=_proxNumero(n,H);
        dudas.push("Dijiste "+_DIAL[wd]+" "+n+", pero "+(pn?"el "+n+" de "+_MESL[new Date(pn+"T00:00:00").getMonth()]+" es "+_DIAL[_dsem(pn)]:"ese día no existe")+". ¿Qué fecha es?"); }
      tapa(m);
    }
  }
  /* 4) "el 15", "el dia 15", "para el 15" (sin mes): el proximo 15, hoy cuenta */
  re=new RegExp("\\b(?:(?:antes|despues)\\s+del|el|al)\\s+(?:dia\\s+)?(\\d{1,2})\\b"+noNum+"(?!\\s*(?:de\\s+)?(?:"+_MESRE+")\\b)","g");
  while((m=re.exec(w))){
    var n4=+m[1];
    if(n4>=1 && n4<=31){ var p4=_proxNumero(n4,H); if(p4) add(p4,m.index,"elN"); tapa(m); }
  }
  /* 5) relativas */
  re=/\b(?:en|dentro de)\s+(\d{1,3}|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|treinta)\s+(dias?|semanas?|mes|meses)\b/g;
  while((m=re.exec(w))){
    var n5=(NUMREL[m[1]]!=null)?NUMREL[m[1]]:parseInt(m[1],10);
    if(!isNaN(n5)&&n5>0){
      add(/^sem/.test(m[2])?dmDe(H,7*n5):(/^mes/.test(m[2])?masMeses(H,n5):dmDe(H,n5)), m.index, "rel");
    }
    tapa(m);
  }
  re=/\b(?:a\s+)?(?:fin|final|ultimo dia)\s+(?:de|del)\s+mes\b/g;
  while((m=re.exec(w))){
    var fm=iso(new Date(h0.getFullYear(), h0.getMonth()+1, 0));
    if(fm===H) fm=iso(new Date(h0.getFullYear(), h0.getMonth()+2, 0));
    add(fm,m.index,"rel"); tapa(m);
  }
  re=/\bpasado\s+manana\b/g; while((m=re.exec(w))){ add(dmDe(H,2),m.index,"rel"); tapa(m); }
  re=/\bmanana\b/g;          while((m=re.exec(w))){ add(dmDe(H,1),m.index,"rel"); tapa(m); }
  re=/\bhoy\b/g;             while((m=re.exec(w))){ add(H,m.index,"hoy"); tapa(m); }
  /* 6) dia de la semana solo (el mas cercano que viene, sin contar hoy) */
  re=new RegExp("\\b("+_DIARE+")s?\\b(\\s+(?:de\\s+)?(?:la\\s+)?(?:(?:otra|siguiente|proxima)\\s+semana|semana\\s+que\\s+(?:entra|viene)))?","g");
  while((m=re.exec(w))){
    var wd6=_NOMDIA.indexOf(m[1]), dw=h0.getDay(), f6;
    if(m[2]){ var lunesQueSigue=dmDe(H, 7-((dw+6)%7)); f6=dmDe(lunesQueSigue,(wd6+6)%7); }
    else { var dl=(wd6-dw+7)%7; if(dl===0) dl=7; f6=dmDe(H,dl); }
    add(f6,m.index,"dia"); tapa(m);
  }
  re=/\b(?:la\s+)?(?:proxima|siguiente|otra)\s+semana\b|\bla\s+semana\s+que\s+(?:entra|viene)\b/g;
  while((m=re.exec(w))){ add(dmDe(H,7),m.index,"rel"); tapa(m); }
  out.sort(function(a,b){ return a.i-b.i; });
  return {lista:out, dudas:dudas};
}
function _esExacta(x){ return x.k==="iso"||x.k==="mes"||x.k==="diaNum"||x.k==="elN"; }
/* LA fecha dictada: {fecha, duda, todas}. duda = la pregunta corta si no se puede saber. */
function fechaDictada(txt){
  var r=fechasDichas(txt), L=r.lista, todas=[];
  L.forEach(function(x){ if(todas.indexOf(x.f)<0) todas.push(x.f); });
  if(r.dudas.length) return {fecha:null, duda:r.dudas[0], todas:todas};
  if(!L.length) return {fecha:null, duda:"", todas:[]};
  var sinHoy=L.filter(function(x){ return x.k!=="hoy"; }); if(!sinHoy.length) sinHoy=L;
  var ex=sinHoy.filter(_esExacta);
  return {fecha:(ex.length?ex:sinHoy)[0].f, duda:"", todas:todas};
}
function dudaFecha(txt){ return fechaDictada(txt).duda; }
/* build 174 (F19), ahora con candado: dia + numero = esa fecha si cuadran los dos; si
   no cuadran, null (y dudaFecha() trae la pregunta). Se deja por compatibilidad. */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function diaSemanaConNumero(s){
  var r=fechasDichas(s), x=r.lista.filter(function(y){ return y.k==="diaNum"; })[0];
  return x?x.f:null;
}
/* LA FECHA A LA QUE SE MUEVE (build 140), calculada por la app. null si no hay fecha
   o si esta en duda (la pregunta sale con dudaFecha). */
function fechaMovida(txt){ return fechaDictada(txt).fecha; }
/* CANDADO: la fecha que propone el modelo contra la dictada.
   -> {ok, fecha, duda, dictada, corregida}. Si lo dictado trae fecha, MANDA lo dictado:
   la del modelo solo se acepta si es una de las fechas dictadas. Si lo dictado esta en
   duda, no se guarda nada y se pregunta. */
function candadoFecha(dicho, fModelo){
  var fd=fechaDictada(dicho), fm=_fReal(fModelo)?fModelo:"";
  if(fd.duda) return {ok:false, fecha:null, duda:fd.duda, dictada:true, corregida:false};
  if(!fd.todas.length) return fm ? {ok:true, fecha:fm, duda:"", dictada:false, corregida:false}
                                 : {ok:false, fecha:null, duda:"", dictada:false, corregida:false};
  if(fm && fd.todas.indexOf(fm)>=0) return {ok:true, fecha:fm, duda:"", dictada:true, corregida:false};
  return {ok:true, fecha:fd.fecha, duda:"", dictada:true, corregida:!!fm};
}
/* ===== build 248 (Salvador 6-oct 07:47, "Fideicomiso: Seguimiento con BBVA"): LO QUE DIJO SOBRE LAS FECHAS NO SE LEE AL REVES =====
   "esta tarea NO termina el 8 de octubre… el 8 si no tienes respuesta favorable me avisas… va a terminar CUANDO firmemos… me
   gustaría firmar ANTES DEL 15": la app contestó "termina el jueves 8", justo al revés. Ahora cada fecha dicha se lee por su papel:
   · "no termina el X" (y "el X … me avisas") -> AVISO / revisión ese día, nunca finiquito;
   · "antes del X" -> la FECHA META (f_vigente);
   · "termina cuando <evento>" / "continúa hasta que <evento>" -> "Cierra con: <evento>" (t.cierra), sin fecha. */
var EMPRESAS248=["bbva","banorte","santander","hsbc","banamex","citibanamex","scotiabank","inbursa","afirme","bancomer","azteca","telcel","telmex","cfe","imss","sat","infonavit","fovissste","amazon","google","walmart","soriana","costco","liverpool","femsa","cemex","oxxo","coppel","elektra","mercadolibre","pemex","bimbo","apple","microsoft","samsung","toyota","ford","nissan","chevrolet"];
function _hitsFecha(s){
  var out=[], m, re, noNum=/^\s*(?:%|por\s+ciento|mil\b|pesos|minutos?|horas?|hrs?|personas|veces|y\s+media|de\s+(?:la|las|los|el)\b)/;
  re=new RegExp("\\b(?:(antes|despues)\\s+del?\\s+|(?:para\\s+)?(?:el|al)\\s+(?:dia\\s+)?)(\\d{1,2})(?:\\s+de\\s+("+_MESRE+"))?(?![a-z0-9])","g");
  while((m=re.exec(s))){
    var end=m.index+m[0].length; if(!m[3] && noNum.test(s.slice(end))) continue;
    var fd=fechaDictada("el "+(+m[2])+(m[3]?" de "+m[3]:""));
    if(fd.fecha && !fd.duda) out.push({i:m.index, end:end, pref:m[1]||"", f:fd.fecha});
  }
  re=new RegExp("\\b(?:(antes|despues)\\s+del?\\s+|(?:para\\s+)?(?:el|este)\\s+)("+_DIARE+")\\b(?!\\s+(?:el\\s+)?(?:dia\\s+)?\\d)","g");
  while((m=re.exec(s))){ var fw=fechaDictada(m[2]); if(fw.fecha && !fw.duda) out.push({i:m.index, end:m.index+m[0].length, pref:m[1]||"", f:fw.fecha}); }
  return out.sort(function(a,b){ return a.i-b.i; });
}
function lecturaFechas(v){
  var s=_fsa(v), L={noCierre:[], meta:"", avisos:[], continua:false, evento:"", libres:0, hay:false}, H=_hitsFecha(s), H0=hoy();
  H.forEach(function(h, k){
    var antes=s.slice(Math.max(0,h.i-50), h.i), sig=H[k+1]?H[k+1].i:h.end+130, desp=s.slice(h.end, Math.min(sig, h.end+130));
    if(!h.pref && /\bno\s+(?:va\s+a\s+|ira\s+a\s+)?(?:termin\w*|cierr\w*|cerr\w*|acab\w*|venc\w*)\s+(?:(?:para|hasta|en)\s+)?$/.test(antes)){
      if(L.noCierre.indexOf(h.f)<0) L.noCierre.push(h.f); if(h.f>=H0 && L.avisos.indexOf(h.f)<0) L.avisos.push(h.f); }
    else if(h.pref==="antes"){ if(!L.meta && h.f>=H0) L.meta=h.f; }
    else { var ia=desp.search(/\b(?:me\s+avis\w*|avisame|me\s+(?:muestr|record|dig|dic|informa|marc)\w*|revis\w*|checa\w*)\b/), it=desp.search(/\b(?:termin\w*|cierr\w*|acab\w*)\b/);
      if(ia>=0 && (it<0 || ia<it)){ if(h.f>=H0 && L.avisos.indexOf(h.f)<0) L.avisos.push(h.f); } else L.libres++; }
  });
  L.continua=/\bno\s+(?:va\s+a\s+|ira\s+a\s+)?(?:termin\w*|cierr\w*|acab\w*)\b/.test(s) || /\b(?:continu\w*|seguir\w*|sigue)\s+(?:abierta\s+)?(?:hasta\s+que|mas\s+adelante|despues)\b/.test(s);
  var cv=String(v||"").replace(/\s+/g," "), mm=cv.match(/(?:termina(?:r|rá|ra)?|cierra|cerrar|acaba(?:r)?|se\s+cierra|concluye)\s+(?:solo\s+)?cuando\s+((?:[^\s.,;:?!]+\s*){1,10})/i)
    || cv.match(/(?:contin[uú]a(?:r|rá|ra)?|seguir[aá]?|sigue|se\s+queda\s+abierta)\s+(?:abierta\s+)?hasta\s+que\s+((?:[^\s.,;:?!]+\s*){1,10})/i);
  if(mm){ var ws=mm[1].trim().split(/\s+/), out=[]; for(var i=0;i<ws.length;i++){ if(i>0 && /^(me|y|pero|entonces|este|tu|tú|ya|luego|despues|después|ahora|pues|para|porque)$/i.test(ws[i])) break; out.push(ws[i]); } L.evento=out.join(" ").trim(); }
  L.hay=!!(L.noCierre.length||L.meta||L.avisos.length||L.continua||L.evento);
  return L;
}
/* el evento dicho ("tengamos firmado el fideicomiso", "firmemos") -> el texto de "Cierra con" ("Fideicomiso firmado") */
function cierraDeEvento(ev, t){
  var e=String(ev||"").replace(/\s+/g," ").trim().replace(/[.,;:]+$/,""), low=e.toLowerCase(), m; if(!e) return "";
  var r=low.replace(/^(?:que\s+)?(?:ya\s+)?(?:tengamos|tengan|tenga|tenemos|tengo|tienen|hayamos|hayan|haya|quede|queden|este|esten|estemos)\s+/,"");
  if((m=r.match(/^([a-zñ]+(?:ado|ada|ido|ida|ados|adas|idos|idas))\s+(?:el|la|los|las)\s+(.+)$/))) return conMayuscula(m[2]+" "+m[1]);
  if((m=low.match(/^(firm|cerr|pag|entreg|aprob|autoriz|termin|acab|recib)(?:emos|amos|imos|en|an|e|a|es|ues|uemos)$/))){
    var P={firm:"firmado",cerr:"cerrado",pag:"pagado",entreg:"entregado",aprob:"aprobado",autoriz:"autorizado",termin:"terminado",acab:"acabado",recib:"recibido"}, tema=String((t&&t.nombre)||"").split(/[:\-–]/)[0].trim().toLowerCase();
    return conMayuscula((tema?tema+" ":"")+P[m[1]]); }
  return conMayuscula(low);
}
function aplicaLecturaFechas(t, v, j, op){
  op=op||{}; var L=lecturaFechas(v), hecho=[], H0=hoy(), R={L:L, hecho:hecho, bloquea:false};
  if(!L.hay) return R;
  R.bloquea=!!(L.noCierre.length || L.meta || (L.continua && !L.libres));
  if(L.meta && t.indefinida!==true && L.meta!==t.f_vigente){
    if(op.mueve && t.f_vigente){ var rr=mueveFecha(t, L.meta, "lo dijo "+((PERSONAS[yo]||{}).nombre||"")+" (fecha meta)"); if(!(rr && rr.ok===false)){ t.falta_fecha=false; hecho.push("fecha meta: antes del "+fechaBonita(L.meta)); } }
    else { t.fecha_dictada=true; t.f_original=L.meta; t.f_vigente=L.meta; t.falta_fecha=false; hecho.push("fecha meta: antes del "+fechaBonita(L.meta)); } }
  L.avisos.forEach(function(f){ if(f<H0 || avisoMismoDia(t, f)) return; nuevoAviso(t, {texto:"Revisión: "+(t.nombre||"la tarea"), fecha:f, hora:"", dicho:""}); hecho.push("aviso "+fechaBonita(f)); });
  if(L.evento){ var c=cierraDeEvento(L.evento, t);
    if(c===conMayuscula(L.evento.toLowerCase()) && j && typeof j.cierra==="string" && j.cierra.trim().length>=4 && j.cierra.trim().length<=120) c=conMayuscula(j.cierra.trim());
    var ya=String(t.cierra||""), ws=_nn(c).split(/\s+/).filter(function(w){ return w.length>=4; });
    if(c && (!ya || !ws.every(function(w){ return _nn(ya).indexOf(w.slice(0,5))>=0; }))){ t.cierra=c; hecho.push("cierra con: "+c.toLowerCase()); } }
  return R;
}
/* ¿el texto (del modelo) trae fechas o dias? Si si, NO se le muestra al usuario: el
   texto lo arma el codigo desde la fecha guardada. */
function traeFecha(tx){
  var s=_fsa(tx);
  return new RegExp("\\b("+_DIARE+"|hoy|manana|"+_MESRE+")\\b|\\b\\d{4}-\\d{2}-\\d{2}\\b|\\b\\d{1,2}\\s*[-/]\\s*\\d{1,2}\\b").test(s);
}
/* fechas que el modelo escribio DENTRO de un texto (un dato corregido): cada una debe
   cuadrar consigo misma (dia de la semana) y venir de lo dictado o del hilo. */
function fechasRaras(tx, permitidas){
  var r=fechasDichas(tx), malas=[];
  if(r.dudas.length) return r.dudas;
  r.lista.forEach(function(x){ if(_esExacta(x) && permitidas.indexOf(x.f)<0) malas.push(x.f); });
  return malas.map(function(f){ return "No dictaste el "+fechaConDia(f)+"."; });
}
/* CANDADO DE LA BARRA: lo que contesta Claude (j) contra lo dictado, ANTES de aplicarlo.
   - Si lo que se acaba de decir trae una fecha en duda y la intencion lleva fecha -> no se
     aplica nada; regresa {duda} (UNA pregunta corta).
   - Si se dicto alguna fecha (ahora o en las respuestas anteriores), cada fecha de Claude
     tiene que ser una de las dictadas; si no, tarea/recordatorio/paso se quedan con la
     dictada y las de supervisar se vacian (y la barra pregunta "para cuando").
   - "un dia antes / despues de ..." deja la de Claude si cae a menos de 31 dias de una
     dictada (es aritmetica sobre lo dictado, no un dia inventado).
   - Si no se dicto ninguna fecha, se respeta la de Claude (se le pide no inventar). */
function candadoIntencion(j, dicho, hist){
  var i=String(j&&j.intencion||"").toUpperCase().replace(/[^A-Z_]/g,""), cambios=0;
  var ant=(hist||[]).map(function(h){ return String(h).replace(/^Persona:\s*/,""); })
                    .filter(function(h){ return !/^Claude/.test(h); }).join(" . ");
  var fdA=fechaDictada(dicho), fdT=fechaDictada(ant+" . "+dicho);
  if(fdA.duda && ["CREAR","RECORDATORIO","PASO","SUPERVISAR","ENCARGAR","PREGUNTA","REASIGNAR"].indexOf(i)>=0)
    return {duda:fdA.duda, cambios:0};
  var todas=fdT.todas.slice(); fdA.todas.forEach(function(f){ if(todas.indexOf(f)<0) todas.push(f); });
  if(!todas.length) return {duda:"", cambios:0};
  var principal=diaDicho(dicho)||fdA.fecha||fdT.fecha||todas[0];
  var rel=/\b(antes|despues|previo|previa|vispera)\b/.test(_fsa(ant+" "+dicho));
  function cerca(f){ return todas.some(function(x){ return Math.abs(dDif(x,f))<=31; }); }
  function fija(o, k, uno){
    if(!o || !o[k]) return;
    if(_fReal(o[k]) && (todas.indexOf(o[k])>=0 || (rel && cerca(o[k])))) return;
    o[k]=uno?principal:""; cambios++;
  }
  fija(j.tarea,"fecha",1); fija(j.recordatorio,"fecha",1); fija(j.paso,"cuando",1);
  fija(j.supervisar,"fecha_ejecuta",0); fija(j.supervisar,"mi_fecha",0);
  return {duda:"", cambios:cambios};
}
/* @@FECHAS-FIN */
/* ¿lo dicho en el hilo es "mueve la fecha"? Verbo de mover (sin palabra de
   recordatorio) o el mensaje es SOLO una fecha ("en 15 dias", "a fin de mes"). */
function esMovida(v){
  var s=" "+String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")+" ";
  if(/\b(recuerd\w*|acuerd\w*|recordatorio|alarma|alerta|avis\w*|notific\w*)\b/.test(s)) return false;
  if(/\b(muevela|muevelo|muevemela|muevemelo|muevanla|mueve|moverla|moverlo|mover|movamosla|cambiala|cambialo|cambiamela|cambiamelo|pasala|pasalo|pasamela|pasamelo|pasarla|pasarlo|posponla|posponlo|pospon|posponer|posponerla|reprogramala|reprogramalo|reprograma|reprogramar|recorrela|recorrelo|aplazala|aplazalo|aplaza|dejala|dejalo|ponla|ponlo)\b|\bpasa\s+(al|a|para)\b|\b(cambia|cambiar|cambiale)\s+(la\s+)?fecha\b/.test(s)) return true;
  return soloFecha(v);
}
function soloFecha(v){
  /* build 190: tambien "el miercoles 7", "2 de nov", "el 15" y una fecha en duda
     ("el lunes 4") cuentan: el mensaje es SOLO una fecha. */
  var _fd=fechaDictada(v); if(!_fd.fecha && !_fd.duda) return false;
  var s=" "+String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ")+" ";
  s=s.replace(/\b(fin|final|ultimo dia)\s+del?\s+mes\b/g," ")
     .replace(/\b(en|dentro de)\s+\S+\s+(dias?|semanas?|mes|meses)\b/g," ")
     .replace(new RegExp("\\b("+_MESRE+")\\b","g")," ")
     .replace(/\b(pasado manana|manana|hoy|lunes|martes|miercoles|jueves|viernes|sabado|domingo)s?\b/g," ")
     .replace(/\b\d{1,4}\b/g," ")
     .replace(/\b(para|a|al|el|la|de|del|dia|proximo|proxima|este|esta|mejor|entonces|siguiente|otra|semana|que|entra|viene|mejor|va|ok|ya|no)\b/g," ")
     .replace(/\s+/g," ").trim();
  return !s;
}

/* ===== build 143 (Salvador 2026-09-26): ACUERDOS, FICHA DE PERSONA Y
   PREPARAME. Ningun "quedamos de..." se queda sin tarea: nace una tarea NUEVA
   y limpia, sin confirmar y con Deshacer 3 s. La de origen (aunque este
   cerrada) solo recibe el comentario tal cual y una linea "Listo: ..."; NO se
   revive ni se liga. El porque va como PRIMER mensaje del chat nuevo. Las
   fechas las calcula el telefono; Claude solo pone nombre, persona y quien
   debe. Si Claude falla, se crea igual con lo local. Todo acuerdo se lee de
   vuelta de la base y, si no cuadra, se dice. ===== */
function _nrm(s){ return " "+String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")+" "; }
function sonaraAcuerdo(v){
  var s=_nrm(v);
  /* un recado para otro ("dile a Carlos que quedamos...") no es acuerdo mio */
  if(/^\s*(dile|digale|escribele|escribeles|mandale|comentale|pidele|avisale|preguntale)\b/.test(s)) return false;
  return /\b(quedamos|quede (de|en|con)|quedaron (de|en)|quedo (de|en)|acordamos|acorde|acordaron|nos vemos|nos juntamos|nos reunimos|nos vamos a (ver|juntar|reunir)|(me|nos) va a (mandar|enviar|pasar|dar|llamar|hablar|confirmar|entregar|depositar|pagar)|le voy a (mandar|enviar|pasar|dar|llamar|hablar|confirmar|entregar|depositar|pagar)|voy a (enviarle|mandarle|pasarle|llamarle|hablarle|confirmarle|entregarle|depositarle|pagarle)|se comprometio|me comprometi|me prometio|le prometi)\b/.test(s);
}
/* solo la PALABRA de recordatorio (sin contar una hora dicha): "quedamos de
   vernos el martes a las 5" es acuerdo; "recuerdame que quedamos..." es aviso */
function palabraRecordatorio(v){
  return /\b(recuerdamelo|recuerdamela|avisamelo|avisamela|acuerdamelo|recuerdame|recuerdanos|recuerda|acuerdame|acuerdate|acuerda|recordatorio|recordame|alarma|alerta|avisame|avisa|aviso|notificame|notifica|dime|comentame)\b/.test(_nrm(v));
}
/* la persona de la tarea de origen: su acuerdo, su WhatsApp, sus contactos o
   un nombre propio en el titulo ("Cena Guillermo" -> Guillermo) */
function conDeOrigen(t){
  if(!t) return "";
  if(t.acuerdo && t.acuerdo.con) return String(t.acuerdo.con);
  var w=(t.wa_contactos||[])[0]; if(w) return String(w.nombre||w);
  if((t.contactos||[])[0]) return String(t.contactos[0]);
  var ws=String(t.nombre||"").split(/\s+/).slice(1).filter(function(p){
    return /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}$/.test(p) && !/^(Del|Las|Los|Con|Para|Por|Que|Una|Uno)$/.test(p); });
  return ws[0]||"";
}
function conDeFrase(v){
  var m=String(v||"").match(/\bcon\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/);
  return m?m[1]:"";
}
function debeDe(v){
  return /\b((me|nos) va a|se comprometio|me prometio|quedo (de|en)|quedaron (de|en))\b/.test(_nrm(v))?"el":"yo";
}
/* la persona que diga Claude solo vale si sale en lo dicho o en la tarea de
   origen: nunca se inventa a nadie */
function nombreEnFuente(n, t, v){
  var k=nomClave(n); if(k.length<3) return false;
  var re=new RegExp("\\b"+k+"\\b");
  return re.test(_nrm(v)) || re.test(_nrm(t&&t.nombre)) ||
    personasDe(t||{}).some(function(p){ return nomClave(p)===k; });
}
/* "25 de septiembre" */
function diaMes(f){ return String(fechaBonita(f)).replace(/^\S+\s+/,""); }
function masMeses(f,n){
  var d=new Date(f+"T00:00:00"), dia=d.getDate(), x=new Date(d.getFullYear(), d.getMonth()+n, 1);
  x.setDate(Math.min(dia, new Date(x.getFullYear(), x.getMonth()+1, 0).getDate()));
  return iso(x);
}
/* desde cuando se cuenta "en un mes": el dia de la tarea de origen si fue en
   la ultima semana (la cena de ayer); si no, hoy */
function baseAcuerdo(t){
  var H=hoy(), f=t&&t.f_vigente;
  if(f && /^\d{4}-\d{2}-\d{2}$/.test(f) && f<=H && dDif(f,H)<=7) return f;
  return H;
}
/* LAS FECHAS DEL ACUERDO, calculadas por el telefono:
   plazo = lo acordado; fecha = cuando cae la tarea, ANTES, para organizarse.
   "en un mes"/"el proximo mes" -> el 15 del mes siguiente; semanas -> 3 dias
   antes (nunca antes de mañana); fecha exacta -> esa; nada -> en 7 dias. */
function fechasAcuerdo(v, t){
  var s=_nrm(v), H=hoy(), man=dmDe(H,1), b=baseAcuerdo(t), m, n;
  var r={base:b, plazo_texto:"", plazo_fecha:"", fecha:"", hora:""};
  function nro(x){ return (NUMREL[x]!=null)?NUMREL[x]:parseInt(x,10); }
  function antes(p){ return p<=man ? (p<H?man:p) : (dmDe(p,-3)<man?man:dmDe(p,-3)); }
  var dia=/\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/.test(s);
  if(/\b(proximo|siguiente|otro)\s+mes\b|\bmes\s+que\s+(entra|viene)\b/.test(s)){ n=1; r.plazo_texto="en un mes"; }
  else if((m=s.match(/\b(?:en|dentro de)\s+(\d{1,2}|un|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)\s+(mes|meses)\b/))){
    n=nro(m[1]); r.plazo_texto=(n===1?"en un mes":"en "+m[1]+" meses"); }
  if(n>0){
    r.plazo_fecha=masMeses(b,n); if(r.plazo_fecha<man) r.plazo_fecha=masMeses(H,n);
    var mitad=r.plazo_fecha.slice(0,8)+"15";
    r.fecha=(mitad<=dmDe(r.plazo_fecha,-3) && mitad>=man) ? mitad : antes(r.plazo_fecha);
    return r;
  }
  if((m=s.match(/\b(?:en|dentro de)\s+(\d{1,2}|una|un|dos|tres|cuatro|cinco|seis)\s+semanas?\b/))){
    n=nro(m[1]); r.plazo_texto="en "+(n===1?"una semana":m[1]+" semanas");
  } else if(!dia && /\b(proxima|siguiente|otra)\s+semana\b|\bsemana\s+que\s+(entra|viene)\b/.test(s)){
    n=1; r.plazo_texto="la próxima semana";
  }
  if(n>0){
    r.plazo_fecha=dmDe(b,7*n); if(r.plazo_fecha<man) r.plazo_fecha=dmDe(H,7*n);
    r.fecha=antes(r.plazo_fecha); return r;
  }
  if((m=s.match(/\b(?:en|dentro de)\s+(\d{1,3}|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|treinta)\s+dias?\b/))){
    n=nro(m[1]);
    if(n>0){
      r.plazo_texto="en "+m[1]+" día"+(n===1?"":"s");
      r.plazo_fecha=dmDe(b,n); if(r.plazo_fecha<man) r.plazo_fecha=dmDe(H,n);
      r.fecha=(n>=7)?antes(r.plazo_fecha):r.plazo_fecha; return r;
    }
  }
  /* fecha exacta ("el viernes", "el 3 de octubre", "mañana"); "hoy" solo si
     no se dijo otro dia ("quedamos hoy en que me manda el lunes" = lunes) */
  var fx=fechaMovida(String(v||"").replace(/\bhoy\b/gi," "));
  if(!fx && /\bhoy\b/.test(s)) fx=H;
  if(horaDicha(v)){
    var ac=armaCuando(v); r.hora=ac.hora||"";
    if(!fx && ac.fecha) fx=ac.fecha;
  }
  if(fx){ if(fx<H) fx=H; r.plazo_fecha=fx; r.fecha=fx; r.plazo_texto="el "+fechaBonita(fx); return r; }
  r.fecha=dmDe(H,7); r.hora=""; return r;
}
/* EL PORQUE: primer mensaje del chat de la tarea nueva */
function razonAcuerdo(o, v, con, debe, fz){
  var cuando=(fz.base===hoy())?"hoy, "+diaMes(fz.base)+",":"el "+diaMes(fz.base);
  var dicho=String(v||"").trim().replace(/[.\s]+$/,"");
  var junta=/\b(cena|comida|comimos|desayuno|almuerzo|junta|reunion|cafe|cita|visita|lunch)\b/.test(_nrm(o.nombre));
  var tx="Te pongo esta tarea porque "+cuando+
    ((junta&&con)?" te reuniste con "+con+" ("+o.nombre+") y quedaron: “"+dicho+"”."
                 :" en “"+o.nombre+"” anotaste"+(con?" con "+con:"")+": “"+dicho+"”.");
  if(fz.plazo_fecha){
    tx+=(/^el /.test(fz.plazo_texto))?" Plazo: "+fz.plazo_texto+(fz.hora?" a las "+horaBonita(fz.hora):"")+"."
      :" Plazo: "+fz.plazo_texto+", hacia el "+diaMes(fz.plazo_fecha)+".";
    if(fz.fecha!==fz.plazo_fecha) tx+=" Te la pongo el "+fechaBonita(fz.fecha)+" para que tengas tiempo de organizarte.";
  } else tx+=" No se dijo fecha: te la pongo el "+fechaBonita(fz.fecha)+" para que no se pierda.";
  if(debe==="el" && con) tx+=" Le toca a "+con+".";
  return tx;
}
function promptAcuerdo(t, v){
  return "Extraes UN acuerdo dicho dentro de una tarea. CONTESTA SOLO JSON, sin texto extra: "+
    "{\"nombre_tarea\":\"<corto y limpio, 2 a 6 palabras, como: Reunión con Guillermo>\","+
    "\"con\":\"<la persona con quien se acordo; si no se dijo, la de la tarea de origen; si no hay, vacio>\","+
    "\"debe\":\"yo|el\",\"texto\":\"<lo acordado, corto>\"}. "+
    "debe=yo si quien habla quedo de hacer algo o es mutuo; el si le toca a la otra persona. "+
    "NO inventes personas ni datos. NO calcules fechas.\n"+
    "TAREA DE ORIGEN: "+t.nombre+"\nPERSONA DE LA TAREA DE ORIGEN: "+(conDeOrigen(t)||"(ninguna)")+"\nFRASE: "+v;
}
/* 1) lo dicho se queda en la de origen, tal cual; 2) Claude afina (8 s max);
   3) nace la tarea nueva, con Claude o sin el. acuerdos_pend = rastro por si
   la app se cierra a medio camino (al volver a abrir el hilo se termina). */
function acuerdoEnHilo(t, v){
  guardaHablado(t,"bo",v);
  t.ultima=((PERSONAS[yo]&&PERSONAS[yo].nombre)||"")+": "+(esLargo(v)?localResumen(v):v);
  var pend={dicho:v, ts:Date.now(), por:yo||""};
  t.acuerdos_pend=(t.acuerdos_pend||[]).concat([pend]);
  guarda(t); render();
  var hecho=false, tm=setTimeout(function(){ fin(null,"No contestó a tiempo."); }, 8000);
  function fin(j, err){
    if(hecho) return; hecho=true; clearTimeout(tm);
    try{ creaAcuerdo(t, pend, j, err); }
    catch(e){
      var em=String((e&&e.message)||e).slice(0,80);
      msg(t,"bi","No se pudo crear la tarea del acuerdo: "+em); guarda(t);
      toast("No se pudo crear la tarea del acuerdo"); if(vista==="hilo") render();
    }
  }
  try{
    preguntaAClaude([{role:"user",content:promptAcuerdo(t,v)}],"rapido",function(txt,err){
      var j=null; try{ var mm=txt&&String(txt).match(/\{[\s\S]*\}/); j=mm?JSON.parse(mm[0]):null; }catch(e){ j=null; }
      fin(j, j?null:(err||"respuesta sin JSON"));
    });
  }catch(e){ fin(null, String((e&&e.message)||e)); }
}
function creaAcuerdo(t, pend, j, err){
  var v=pend.dicho;
  if(!(t.acuerdos_pend||[]).some(function(p){ return p.ts===pend.ts; })) return null;   /* ya se hizo */
  t.acuerdos_pend=(t.acuerdos_pend||[]).filter(function(p){ return p.ts!==pend.ts; });
  if(!t.acuerdos_pend.length) t.acuerdos_pend=null;
  var con=conDeFrase(v)||conDeOrigen(t), debe=debeDe(v), nombre="", texto="", src="local";
  if(j && typeof j==="object"){
    var cj=String(j.con||"").trim(); if(cj && nombreEnFuente(cj,t,v)) con=cj;
    var nj=String(j.nombre_tarea||"").trim().replace(/[.\s]+$/,""); if(nj.length>=3 && nj.length<=70) nombre=conMayuscula(nj);
    if(j.debe==="yo"||j.debe==="el") debe=j.debe;
    texto=String(j.texto||"").trim(); src="claude";
  }
  var frase=String(v||"").trim().replace(/[.\s]+$/,"");
  if(!nombre) nombre=con?"Seguimiento con "+con:"Seguimiento: "+(frase.length>50?frase.slice(0,49)+"…":frase);
  var fz=fechasAcuerdo(v,t);
  /* build 174 (Salvador 2026-10-02 18:27): contestarle a la misma persona de ESTA tarea
     ("si, nos vemos el sabado 10") no es una tarea nueva: CERO DUPLICADOS. Se queda en
     esta; si la fecha dicha es otra, se mueve; si es la misma, no se dice nada. */
  var _co=_nrm(conDeOrigen(t)||""), _cn=_nrm(con||"");
  var _mismo=!t.es_recordatorio && !t.cierre && estadoReal(t)!=="cerrada" && _co && (!_cn || _co.indexOf(_cn.split(" ")[0])>=0 || _cn.indexOf(_co.split(" ")[0])>=0);
  if(_mismo){
    var _fd=fechaMovida(v);
    if(_fd && _fd>=hoy() && _fd!==t.f_vigente){ var _ant=t.f_vigente; t.f_vigente=_fd; if(!t.f_original) t.f_original=_fd;
      msg(t,"bi","Fecha: "+fechaMovCorta(_fd)+(_ant?" (antes "+fechaMovCorta(_ant)+")":"")+"."); }
    else if(!_fd && dudaFecha(v)) msg(t,"bi",dudaFecha(v)+" No cambié la fecha.");
    guarda(t); if(vista==="hilo") render(); return null;
  }
  var n=creaTarea({nombre:nombre, duenio:yo, fecha:fz.fecha, dicho:nombre});
  n.msgs=[]; msg(n,"bi",razonAcuerdo(t,v,con,debe,fz));
  n.acuerdo={texto:texto||frase, con:con, debe:debe, plazo_texto:fz.plazo_texto, plazo_fecha:fz.plazo_fecha,
    origen:{id:t.id, nombre:t.nombre, f:fz.base}, dicho:v, ts:pend.ts, por:pend.por||yo||"", fuente:src};
  if(err && src==="local") n.acuerdo.sin_claude=String(err).slice(0,80);
  n.contactos=con?[con]:[];
  n.ultima="";
  var av=null;
  if(fz.hora && fz.plazo_fecha){
    av=nuevoAviso(n,{texto:n.nombre, dicho:v, fecha:fz.plazo_fecha, hora:horaCercana(fz.plazo_fecha,fz.hora,v)});
    preguntaAmPm(n,[String(av.ts)],v);
  }
  guarda(n); if(av) sincronizaAvisos(n);
  msg(t,"bi","Listo: “"+n.nombre+"” para el "+fechaMovCorta(n.f_vigente)+(av?", aviso "+textoCuando(av):"")+".");
  t.msgs[t.msgs.length-1].abre=n.id;
  /* build 190: si la fecha dicha no cuadra ("el lunes 4" y el 4 es domingo) no se adivina:
     queda la de siempre (en 7 dias) y se pregunta en la tarea nueva y aqui. */
  if(dudaFecha(v)){ var _dq=dudaFecha(v)+" La dejé para el "+fechaConDia(n.f_vigente)+"; dime la fecha y la muevo.";
    msg(n,"bi",_dq); n.pide_fecha=true; guarda(n); msg(t,"bi",_dq); }
  t.acuerdos_nacidos=(t.acuerdos_nacidos||[]).concat([n.id]);
  t.ultima="Listo: "+n.nombre;
  guarda(t);
  window.__ultimoDeshacer={id:t.id, tipo:"acuerdo", cuando:Date.now(), restaurar:function(){
    /* se cancela como todo en la app (no se borra): queda el rastro */
    n.estado="cerrada"; n.cierre={tipo:"cancelado", f:hoy(), motivo:"deshecho al crear"};
    guarda(n); sincronizaAvisos(n);
    t.msgs=(t.msgs||[]).filter(function(x){ return x.abre!==n.id; });
    t.ultima=""; guarda(t);
  }};
  if((vista==="hilo"&&abierta===t.id)||vista==="lista") render();
  muestraDeshacer("acuerdo","Nueva: "+n.nombre,3000);
  verificaAcuerdo(n,t);
  return n;
}
/* REGISTRO: se lee de vuelta de la base y se compara; si no cuadra, se dice */
function verificaAcuerdo(n, t){
  if(!db || !n || !n.acuerdo) return;
  var dicho=n.acuerdo.dicho, nom=n.nombre;
  function falla(e){
    var tx="No se pudo confirmar que quedó guardado: "+e;
    msg(t,"bi",tx); msg(n,"bi",tx); guarda(t); guarda(n);
    toast("No se pudo confirmar que el acuerdo quedó guardado");
    if(vista==="hilo") render();
  }
  setTimeout(function(){
    if(n.cierre) return;   /* se deshizo */
    try{
      datosTareas.leer(n.id).then(function(x){
        if(!x) return falla("no aparece en la base");
        if(!x.acuerdo || x.acuerdo.dicho!==dicho || x.nombre!==nom) return falla("lo guardado no coincide");
        n.acuerdo.leido=Date.now(); guarda(n);
      }).catch(function(e){ falla(String((e&&e.message)||e).slice(0,80)); });
    }catch(e){ falla(String((e&&e.message)||e).slice(0,80)); }
  }, 1500);
}
/* ---- FICHA DE PERSONA ---- */
var NO_NOMBRE=/^(la|el|los|las|mi|mis|con|de|del|una|uno|un|junta|reunion|cena|comida|cita)$/;
function nomClave(s){ var k=_nrm(s).trim().split(/\s+/)[0]||""; k=k.replace(/[^a-z0-9]/g,""); return NO_NOMBRE.test(k)?"":k; }
function personasDe(t){
  var out=[];
  function add(n){ n=String(n||"").trim(); if(!n) return;
    if(!out.some(function(x){ return nomClave(x)===nomClave(n); })) out.push(n); }
  (t.contactos||[]).forEach(add);
  (t.wa_contactos||[]).forEach(function(c){ add(c&&(c.nombre||c)); });
  if(t.acuerdo) add(t.acuerdo.con);
  return out;
}
function deshechoAlCrear(t){ return !!(t.cierre && t.cierre.motivo==="deshecho al crear"); }
function tareasDePersona(nom){
  var k=nomClave(nom); if(k.length<3) return [];
  var re=new RegExp("\\b"+k+"\\b");
  return tareas.filter(function(t){
    if(deshechoAlCrear(t)) return false;
    return personasDe(t).some(function(n){ return nomClave(n)===k; }) || re.test(_nrm(t.nombre));
  });
}
function nombreCompleto(nom){
  var k=nomClave(nom), mejor="";
  tareas.forEach(function(t){ personasDe(t).forEach(function(n){ if(nomClave(n)===k && n.length>mejor.length) mejor=n; }); });
  return mejor||conMayuscula(String(nom||"").trim());
}
function resumenAcuerdos(lista){
  var a=(lista||tareas).filter(function(t){ return t.acuerdo && !deshechoAlCrear(t); });
  return {total:a.length,
    cumplidos:a.filter(function(t){ return t.cierre&&t.cierre.tipo==="hecha"; }).length,
    vencidos:a.filter(function(t){ return !t.cierre&&estadoReal(t)==="vencida"; }).length,
    movidos:a.filter(function(t){ return (t.movidas||0)>0; }).length};
}
function fichaPersona(nom){
  var ts=tareasDePersona(nom), H=hoy();
  var viva=estaAbierta;
  var vivos=ts.filter(function(t){ return t.acuerdo && viva(t); });
  var abiertas=ts.filter(function(t){ return viva(t) && t.f_vigente; })
    .sort(function(a,b){ return a.f_vigente.localeCompare(b.f_vigente); });
  var ev=[];
  ts.forEach(function(t){
    if(t.cierre){
      var tc=t.cierre.tipo==="hecha"?"Hecha":(t.cierre.tipo==="cancelado"?"Eliminada":"No se hizo");
      ev.push({f:t.cierre.f||t.f_vigente||"", ts:t.tocada||0, id:t.id, txt:t.nombre, tag:tc});
    }
    if(t.acuerdo && t.acuerdo.ts) ev.push({f:iso(new Date(t.acuerdo.ts)), ts:t.acuerdo.ts, id:t.id, txt:"“"+t.acuerdo.dicho+"”", tag:"Acuerdo"});
    (t.msgs||[]).forEach(function(x){ if(x.wa && x.ts) ev.push({f:iso(new Date(x.ts)), ts:x.ts, id:t.id, txt:String(x.t||"").replace(/^→\s*/,""), tag:"WhatsApp"}); });
  });
  ev.sort(function(a,b){ return (b.f+String(b.ts).padStart(15,"0")).localeCompare(a.f+String(a.ts).padStart(15,"0")); });
  return {nombre:nombreCompleto(nom), tareas:ts,
    yoDebo:vivos.filter(function(t){ return t.acuerdo.debe!=="el"; }),
    meDebe:vivos.filter(function(t){ return t.acuerdo.debe==="el"; }),
    sig:abiertas.filter(function(t){ return t.f_vigente>=H; })[0]||abiertas[0]||null,
    historia:ev.slice(0,30), cuenta:resumenAcuerdos(ts)};
}
function abrePersona(nom){
  var vv=(vista==="barra"||vista==="persona")?{vista:"lista",abierta:null}:{vista:vista, abierta:abierta};
  if(vista==="persona" && window.__persona) vv=window.__persona.volver;
  window.__persona={nombre:nom, volver:vv};
  window.__desdePersona=null; barraEstado=null; consulta=""; menuOpen=false;
  vista="persona"; render();
}
function vPersona(){
  var p=window.__persona||{}, F=fichaPersona(p.nombre||""), c=F.cuenta, nv=F.yoDebo.length+F.meDebe.length;
  function lista(arr, vacio){ return '<ul class="list">'+(arr.length?arr.map(function(t){ return fila(t); }).join(""):'<li class="pvac">'+esc(vacio)+'</li>')+'</ul>'; }
  var h=encabezado(F.nombre, "Ficha")+'<div class="scroll">'+
    '<div class="pcab"><div class="pav">'+esc(F.nombre.charAt(0).toUpperCase())+'</div>'+
    '<div class="pnom">'+esc(F.nombre)+'</div>'+
    '<div class="psb">'+[[F.tareas.length,"tarea"],[c.total,"acuerdo"],[c.cumplidos,"cumplido"],[c.vencidos,"vencido"],[c.movidos,"movido"]]
      .filter(function(x,i){ return i===0 || x[0]>0; }).map(function(x){ return x[0]+" "+x[1]+(x[0]===1?"":"s"); }).join(" · ")+'</div>'+
    (F.tareas.length?'<button class="pprep" id="bprep">Prepárame</button>':'')+'</div>';
  if(!F.tareas.length) return h+'<div class="hoynada">No tengo nada registrado con '+esc(F.nombre)+'.</div></div>';
  h+='<div class="grp">Acuerdos vivos · '+nv+'</div>';
  h+='<div class="psub">Tú le debes</div>'+lista(F.yoDebo,"Nada");
  h+='<div class="psub">Te debe</div>'+lista(F.meDebe,"Nada");
  h+='<div class="grp">Siguiente paso</div>'+lista(F.sig?[F.sig]:[],"Nada con fecha");
  h+='<div class="grp">Historia · '+F.historia.length+'</div><ul class="list">';
  if(!F.historia.length) h+='<li class="pvac">Todavía no hay historia.</li>';
  F.historia.forEach(function(e){
    h+='<li><button class="row phis" data-id="'+esc(e.id)+'"><span class="pfe">'+esc(fechaMovCorta(e.f))+'</span><span>'+
      '<span class="nm">'+esc(e.txt)+'</span><span class="ls">'+esc(e.tag)+'</span></span>'+
      '<span class="meta">›</span></button></li>';
  });
  return h+'</ul></div>';
}
function bindPersona(){
  var bb=$("bback"); if(bb) bb.onclick=function(){
    var v=(window.__persona||{}).volver||{}; window.__persona=null;
    vista=v.vista||"lista"; abierta=v.abierta||null;
    if((vista==="hilo"||vista==="galeria")&&!abierta) vista="lista"; render(); };
  var bp=$("bprep"); if(bp) bp.onclick=function(){
    var nm=(window.__persona||{}).nombre||""; preparamePara(nm, "Prepárame para "+nombreCompleto(nm)); };
  Array.prototype.forEach.call(document.querySelectorAll("#app [data-id]"),function(el){
    el.onclick=function(){ window.__desdePersona=window.__persona; abierta=el.getAttribute("data-id"); vista="hilo"; render(); };
  });
}
/* ---- lo dicho en la barra: "ficha de Guillermo" / "preparame para Guillermo" ---- */
function limpiaNombreDicho(n){
  return String(n||"").trim().replace(/[\s.?!,;:]+$/,"")
    .replace(/^(?:(?:la|el|mi|una|un)\s+)?(?:(?:junta|reuni[oó]n|cena|comida|desayuno|llamada|cita|visita|pl[aá]tica)\s+)?(?:con\s+)?/i,"").trim();
}
function pideFicha(tx){
  var m=String(tx||"").trim().match(/^(?:(?:abre|[aá]breme|ver|mu[eé]strame|ens[eé][nñ]ame|dame)\s+)?(?:la\s+)?ficha\s+de\s+(.+)$/i);
  if(!m) return "";
  var nom=limpiaNombreDicho(m[1]); if(nomClave(nom).length<3) return "";
  /* un nombre: con mayuscula o alguien que ya sale en tus tareas */
  if(!/^[A-ZÁÉÍÓÚÑ]/.test(nom) && !tareasDePersona(nom).length) return "";
  return conMayuscula(nom);
}
function pidePrepara(tx){
  var s=String(tx||"").trim(), nom="", m=s.match(/^(?:por\s+favor\s+)?prep[aá]rame\s+para\s+(.+)$/i);
  if(m) nom=limpiaNombreDicho(m[1]);
  else{
    var m2=s.match(/^(?:dame\s+(?:el\s+|un\s+)?)?resumen\s+de\s+(.+)$/i);
    if(!m2) return "";
    nom=limpiaNombreDicho(m2[1]);
    /* "resumen de la semana" no es una persona: nombre con mayuscula o ya ligado */
    if(!/^[A-ZÁÉÍÓÚÑ]/.test(nom) && !tareas.some(function(t){ return personasDe(t).some(function(p){ return nomClave(p)===nomClave(nom); }); })) return "";
  }
  if(nomClave(nom).length<3) return "";
  return conMayuscula(nom);
}
function datosPersona(F){
  return F.tareas.map(function(t){
    return {tarea:t.nombre, estado:estadoReal(t), fecha:t.f_vigente||"",
      cerrada:t.cierre?{como:t.cierre.tipo, f:t.cierre.f||""}:null,
      acuerdo:t.acuerdo?{texto:t.acuerdo.texto, debe:(t.acuerdo.debe==="el"?"la otra persona":"yo"), dicho:t.acuerdo.dicho,
        plazo:t.acuerdo.plazo_fecha||"", f:iso(new Date(t.acuerdo.ts||Date.now()))}:null,
      mensajes:(t.msgs||[]).slice(-6).map(function(x){ return {f:x.ts?iso(new Date(x.ts)):"", t:x.t}; })};
  });
}
/* si Claude falla: lo mismo, armado en el telefono solo con los datos */
function resumenLocal(F){
  function nm(a){ return a.map(function(t){ return t.nombre+(t.f_vigente?" ("+fechaMovCorta(t.f_vigente)+")":""); }).join("; "); }
  var u=F.tareas.filter(function(t){ return t.cierre || (t.f_vigente && t.f_vigente<=hoy()); })
    .sort(function(a,b){ return String((b.cierre&&b.cierre.f)||b.f_vigente).localeCompare(String((a.cierre&&a.cierre.f)||a.f_vigente)); })[0];
  var ac=F.tareas.filter(function(t){ return t.acuerdo; }).slice(0,3);
  return "Última vez: "+(u?fechaBonita((u.cierre&&u.cierre.f)||u.f_vigente)+" · "+u.nombre:"Sin datos.")+"\n"+
    "Pendiente de cada lado: tú: "+(nm(F.yoDebo)||"nada")+" · "+F.nombre+": "+(nm(F.meDebe)||"nada")+"\n"+
    "Negociado: "+(ac.length?ac.map(function(t){ return "“"+t.acuerdo.dicho+"”"; }).join("; "):"Sin datos.")+"\n"+
    "Qué tocar: "+(F.sig?F.sig.nombre+" ("+fechaBonita(F.sig.f_vigente)+")":"Sin datos.");
}
function preparamePara(nom, dicho){
  var F=fichaPersona(nom);
  if(!F.tareas.length){
    barraEstado={modo:"respuesta", dicho:dicho, texto:"No tengo nada registrado con "+F.nombre+"."};
    consulta=""; vista="barra"; render(); return;
  }
  var local=resumenLocal(F);
  var est={modo:"cargando", dicho:dicho, texto:"Juntando lo que hay de "+F.nombre+"…"};
  barraEstado=est; consulta=""; vista="barra"; render();
  var yoN=(PERSONAS[yo]&&PERSONAS[yo].nombre)||"el usuario";
  var p="Preparas a "+yoN+" en un minuto antes de ver a "+F.nombre+". Usa SOLO los DATOS de abajo. "+
    "PROHIBIDO inventar: nada de fechas, montos, nombres ni temas que no esten en los datos. Si hay pocos datos, dilo. "+
    "Formato: texto plano, sin markdown, exactamente 4 apartados con estos titulos, cada uno de 1 a 3 lineas cortas:\n"+
    "Última vez:\nPendiente de cada lado:\nNegociado:\nQué tocar:\n"+
    "Si un apartado no tiene datos, escribe: Sin datos.\n\nHOY: "+hoy()+"\nPERSONA: "+F.nombre+"\nDATOS:\n"+JSON.stringify(datosPersona(F));
  var listo=false;
  function pon(txt, err){
    if(listo) return; listo=true;
    if(barraEstado!==est) return;
    var ok=txt && String(txt).trim();
    barraEstado={modo:"respuesta", dicho:dicho,
      texto: ok ? String(txt).trim() : local+"\n\n(Armado con tus datos en el teléfono: "+String(err||"sin respuesta").slice(0,60)+")"};
    if(vista==="barra") render();
  }
  setTimeout(function(){ pon(null,"No contestó a tiempo."); }, 30000);
  try{ preguntaAClaude([{role:"user",content:p}],"rapido",pon); }catch(e){ pon(null,String((e&&e.message)||e)); }
}

/* ---- ATORADO: declarar, tocar, escalar ---- */
function declaraAtorado(t,quien,tel,que,esDeFuera){
  if(!quien||!que) return {ok:false,msg:"Para declararte atorado hace falta A QUIÉN esperas y QUÉ. Sin nombre no se detiene nada."};
  t.detenido={quien:quien,tel:tel||"",que:que,desde:hoy(),fuera:!!esDeFuera,toques:[]};
  msg(t,"bi","Anotado: esperas a "+quien+". Mañana te recuerdo hablarle.");
  guarda(t); 
  //Notificación push instantánea al que destraba, si no soy yo mismo
  if (quien && quien !== yo) {
    disparaPushInstantaneo(
      quien,
      'Urgente: Requiere tu acción',
      'La tarea "' + t.nombre + '" requiere tu decisión/autorización',
      urlTarea(t.id)
    );
  }
  return {ok:true};
}
function toqueHecho(t,resultado){
  if(!t.detenido) return;
  t.detenido.toques.push({f:hoy(),r:resultado||"no contestó",quien:yo});
  msg(t,"bo","Toque a "+t.detenido.quien+": "+(resultado||"no contestó"));
  var n=t.detenido.toques.length, d=diasDetenido(t);
  var esc=escalaHoy(t);
  if(esc){ msg(t,"bal",esc); t.msgs[t.msgs.length-1].aviso=1; }
  guarda(t);
}
function destrabar(t){
  if(!t.detenido) return;
  msg(t,"bi","Se destrabó: "+t.detenido.quien+" ya contestó. Vuelve a correr el reloj.");
  t.dias_detenido_acum=(t.dias_detenido_acum||0)+diasNoImputables(t);
  t.trabo_historial=t.trabo_historial||[];
  t.trabo_historial.push({quien:t.detenido.quien,dias:diasDetenido(t),que:t.detenido.que});
  t.detenido=null; guarda(t);
}

/* LAS DOS ESCALERAS. La de dentro sube de nivel; la de fuera cambia de proveedor. */
function escalaHoy(t){
  if(!t.detenido) return null;
  var d=diasDetenido(t), tope=TOPE_TRABADO[t.criticidad||"normal"];
  if(t.detenido.fuera){
    if(d===1) return "Primer día de retraso de "+t.detenido.quien+". Vuélvele a hablar Y ve contactando a un segundo, para no depender de él.";
    if(d>=3) return "Van "+d+" días sin contestar. Trabaja con el segundo: no se pide permiso para cambiar de proveedor, se cambia y se avisa. Al primero no se le cancela: gana el que entregue.";
  }else{
    if(d>=3) return "Tres días seguidos sin respuesta de "+t.detenido.quien+". Esto sube solo al jefe del jefe, con qué decisión está parada y desde cuándo. No lo tienes que pedir tú.";
  }
  if(d>=tope) return "Llegó al tope de "+tope+" días trabado. La tarea deja de ser tuya y pasa al tablero de Salvador. Los días que siguen ya no te cuentan.";
  return null;
}

/* la tarea derivada del toque: no es una tarea guardada, se calcula */
function tareaDeToque(t){
  if(!t.detenido||!tocaToqueHoy(t)) return null;
  var d=diasDetenido(t);
  return {
    id:"toque:"+t.id, deriva:t.id, duenio:t.duenio,
    nombre:"Hablarle otra vez a "+t.detenido.quien,
    ultima:"Llevas "+d+" día"+(d===1?"":"s")+" esperando "+t.detenido.que,
    tel:t.detenido.tel, esToque:true
  };
}

/* ---- CIERRES ---- */
var MOTIVOS_NO_EJECUTADA=[
  {k:"ya_no",   t:"Ya no hacía falta / cambió el plan", culpa:"nadie"},
  {k:"otro_lado",t:"Se resolvió por otro lado",          culpa:"nadie"},
  {k:"no_dieron",t:"Nunca me dieron lo que necesitaba",  culpa:"trabo"},
  {k:"tiempo",  t:"No me dio tiempo",                    culpa:"suya"},
  {k:"se_paso", t:"Se me pasó",                          culpa:"suya"}
];
/* CUANDO EL QUE CANCELA ES EL JEFE Y LA TAREA ES DE OTRO, los motivos son otros
   y NINGUNO le cuenta en contra al empleado. Cancelar tú no le mancha el
   semáforo a él: no fue su decisión. */
var MOTIVOS_JEFE=[
  {k:"ya_no",    t:"Ya no hace falta",          culpa:"nadie"},
  {k:"cambio",   t:"Cambió el plan",            culpa:"nadie"},
  {k:"la_hago",  t:"La hago yo",                culpa:"nadie"},
  {k:"otro_lado",t:"Se resolvió por otro lado", culpa:"nadie"}
];
function motivosPara(t){
  return (PERSONAS[yo].jefe && t.duenio!==yo) ? MOTIVOS_JEFE : MOTIVOS_NO_EJECUTADA;
}
/* ===== build 164 (Salvador 2026-10-02): RECURRENTES QUE SE RENUEVAN SOLAS =====
   Antes "Ya está" en una tarea con periodicidad la CERRABA para siempre y no
   nacia la siguiente vuelta. Ahora: la vuelta se guarda en t.vueltas
   [{para, f, a_tiempo, dias_tarde, pasos:"2/3", faltaron:[..], por}], la MISMA
   tarea (mismo id, mismo chat) se va a la fecha de la siguiente vuelta, los
   pasos (t.lista_pasos) vuelven a quedar sin palomear y los recordatorios
   sueltos de esa vuelta se recorren igual. Si se cierra tarde, la siguiente
   vuelta se cuenta desde el dia que tocaba (no desde el dia que se cerro):
   un reporte de los lunes sigue siendo de los lunes.
   Para terminarla para siempre: el bote de basura ("Ya no hace falta"). */
function esRecurrente(t){ return !!(t && (t.periodicidad==="semanal" || t.periodicidad==="mensual") && !t.es_recordatorio); }
function sumaVuelta(f, per, diaMes){
  var d=new Date(f+"T00:00:00");
  if(per==="mensual"){
    var dia=diaMes||d.getDate(); d.setDate(1); d.setMonth(d.getMonth()+1);
    var ult=new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
    d.setDate(Math.min(dia, ult));
  } else d.setDate(d.getDate()+7);
  return iso(d);
}
/* "lunes 13 oct" — el dia que hay que entregar ESTA vuelta */
function diaEntrega(f){
  if(!f||!/^\d{4}-\d{2}-\d{2}$/.test(f)) return "";
  var d=new Date(f+"T00:00:00");
  return DIAS_L[d.getDay()]+" "+d.getDate()+" "+MES_3[d.getMonth()];
}
function siguienteVuelta(t){
  var H=hoy(), para=t.f_vigente||t.f_original||H;
  var tarde=dDif(para,H);
  var tot=(t.lista_pasos||[]).length, faltaron=pasosFaltan(t).map(function(p){ return p.tx; });
  t.vueltas=t.vueltas||[];
  t.vueltas.push({para:para, f:H, a_tiempo:tarde<=0, dias_tarde:tarde>0?tarde:0,
                  pasos:tot?(tot-faltaron.length)+"/"+tot:"", faltaron:faltaron, por:yo||""});
  if(t.vueltas.length>60) t.vueltas=t.vueltas.slice(-60);
  if(!t.f_primera) t.f_primera=t.f_original||para;
  /* mensual: se recuerda el dia del mes (el 31 cae en 28-feb y regresa al 31 en marzo) */
  if(t.periodicidad==="mensual" && !t.dia_mes) t.dia_mes=Number(para.slice(8,10));
  var nueva=sumaVuelta(para, t.periodicidad, t.dia_mes);
  /* recordatorios sueltos de ESTA vuelta (sin "cada"): se recorren a la siguiente */
  var largo=dDif(para,nueva);
  (t.avisos||[]).forEach(function(a){
    if(a.cada || !a.fecha) return;
    if(a.fecha<=para && dDif(a.fecha,para)<largo){ a.fecha=dmDe(a.fecha,largo); a.avisado_en=null; }
  });
  (t.lista_pasos||[]).forEach(function(p){ marcaPaso(t,p,false); });
  t.f_original=nueva; t.f_vigente=nueva; t.movidas=0; t.paso=0;
  t.estado="abierta"; t.cierre=null; t.sin_alarma=null; t.revisar_hoy=null;
  t.pide_atoro=false; t.pide_tel=false; t.pide_fecha=false; t.fecha_pendiente=null;
  if(window.__pasosOpen) window.__pasosOpen[t.id]=false;
  msg(t,"bi",(tarde>0?"Vuelta del "+diaEntrega(para)+" cerrada, "+tarde+" día"+(tarde===1?"":"s")+" tarde.":"Vuelta del "+diaEntrega(para)+" cerrada a tiempo.")+
    (faltaron.length?" Quedaron sin palomear: "+juntaY(faltaron.map(function(x){ return pasoChico({tx:x}); }))+".":"")+
    " La siguiente es para el "+diaEntrega(nueva)+(tot?"; los pasos ya están en blanco.":"."));
  t.ultima="Siguiente vuelta: "+diaEntrega(nueva);
  guarda(t); sincronizaAvisos(t);
}
/* la barra de arriba del chat. window.__vuelOpen[id] = desplegada (solo pantalla) */
function vVuelta(t){
  if(!esRecurrente(t) || t.cierre) return "";
  var f=t.f_vigente||t.f_original, V=(t.vueltas||[]).slice().reverse();
  var ab=!!((window.__vuelOpen||{})[t.id]);
  var venc=f && dDif(f,hoy())>0;
  var h='<div class="vuelw"><div class="vuel'+(ab?' open':'')+'">'+
    '<button class="vh" id="bvuel" aria-expanded="'+(ab?"true":"false")+'">'+
      /* Salvador 2026-10-02: tipo Apple, solo la fecha de ESTA vuelta */
      '<span class="nx'+(venc?' venc':'')+'"><b>'+(f?esc(diaEntrega(f)):'Sin fecha')+'</b></span>'+
      '<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'+
    '</button>';
  if(ab){
    h+='<div class="vlst">';
    if(!V.length) h+='<div class="vvacio">Todavía no hay vueltas cerradas.</div>';
    V.forEach(function(v){
      h+='<div class="vit"><span>'+esc(diaEntrega(v.para))+(v.pasos?' · '+esc(v.pasos):'')+'</span>'+
         (v.a_tiempo?'<b class="ok">✓ a tiempo</b>':'<b class="tarde">✓ '+v.dias_tarde+' día'+(v.dias_tarde===1?'':'s')+' tarde</b>')+'</div>';
    });
    h+='</div>';
  }
  return h+'</div></div>';
}
function cierraHecha(t){
  if(t && t.__cerradaSin241){ var _cs=t.__cerradaSin241; delete t.__cerradaSin241; t.cerrada_sin=_cs; if(!esRecurrente(t)) msg(t,"bi","Cerrada sin "+_cs+" por orden tuya."); }
  /* build 164: una recurrente no se cierra, arranca su siguiente vuelta */
  if(esRecurrente(t)){ siguienteVuelta(t); return; }
  t.cierre={tipo:"hecha",motivo:"",f:hoy()};
  var tarde=t.f_original&&dDif(t.f_original,hoy())>0;
  msg(t,"bi",tarde?"Cerrada. Lo importante es que ya quedó.":"Cerrada a tiempo. Bien hecho.");
  t.estado="cerrada"; t.pide_atoro=false; t.pide_tel=false; t.pide_fecha=false; guarda(t); sincronizaAvisos(t);
  try{ barreNotifs(true); }catch(e){}
}
/* REABRIR: la tarea vuelve a estar viva tal cual estaba, con su historial.
   Se anota quien y por que la reabrio. Si la fecha ya paso, se pide la nueva
   (sin motivo por escrito: reabrir no es mover). Salvador 2026-09-24. */
function reabre(t, porque){
  var ant=t.cierre;
  t.cierre=null; t.estado="abierta"; t.sin_alarma=null;
  t.pide_atoro=false; t.pide_tel=false; t.pide_fecha=false; t.fecha_pendiente=null;
  t.reabierta=(t.reabierta||[]).concat([{f:hoy(), por:yo, motivo:String(porque||"").slice(0,200), cierre_previo:ant?ant.tipo:null}]);
  var fx=fechaEnTexto(porque||"")||diaDicho(porque||"");
  if(fx){ t.f_vigente=fx; msg(t,"bi","Reabierta, para el "+fechaBonita(fx)+"."); }
  else if(t.f_vigente && dDif(t.f_vigente,hoy())>0){ t.pide_fecha=true; t.reabre_fecha=true; msg(t,"bi","Reabierta. ¿Para cuándo?"); }
  else msg(t,"bi","Reabierta."+(t.f_vigente?" Sigue para el "+fechaBonita(t.f_vigente)+".":""));
  sincronizaAvisos(t); guarda(t);
}
/* ===== build 264: TAREAS EXPEDIENTE. "Ya está" en una indefinida no la cierra: queda DORMIDA ("Enterado · queda viva para lo que llegue").
   Sale de Hoy, Vencidas y toda lista, nunca empuja; despierta sola cuando entra algo (WhatsApp, correo, vincular, mover) y sube con "Nuevo". ===== */
function esExpediente(t){ return !!t && !t.es_recordatorio && !t.cierre && (t.indefinida===true || t.expediente===true || t.tipo==="indefinida") && !esRecurrente(t); }
function esDormida(t){ return !!t && t.estado==="dormida" && !t.cierre && !t.fusionada_en; }
function etq264(x){ if(!x) return ""; if(esDormida(x)) return "dormida"; if(x.cierre || (typeof estadoReal==="function" && estadoReal(x)==="cerrada")) return "cerrada"; return ""; }
function entrante264(m){ return !!m && !m.oculto && (m.k!=="bi" || !!m.movido_de || !!m.canal || !!m.wa_in || !!m.wa_c); }
function cuentaEntra(t){ return (t.msgs||[]).filter(entrante264).length; }
function duerme264(t){
  var prev={estado:t.estado, indefinida:t.indefinida, expediente:t.expediente, dormida:t.dormida||null, nuevo264:t.nuevo264||null, n:(t.msgs||[]).length};
  t.expediente=true; t.indefinida=true; t.estado="dormida"; t.nuevo264=null;
  t.pide_atoro=false; t.pide_tel=false; t.pide_fecha=false; t.revisar_hoy=null;
  msg(t,"bi","Enterado · queda viva para lo que llegue");
  t.dormida={ts:Date.now(), q:cuentaEntra(t), e:(t.evidencias||[]).length};
  guarda(t); try{ sincronizaAvisos(t); }catch(e){}
  try{ barreNotifs(true); }catch(e){}
  return prev;
}
function restauraDormir(t, prev){
  t.estado=prev.estado||"abierta"; t.indefinida=prev.indefinida; t.expediente=prev.expediente; t.dormida=prev.dormida; t.nuevo264=prev.nuevo264;
  if(t.msgs && t.msgs.length>prev.n) t.msgs.length=prev.n; guarda(t); try{ sincronizaAvisos(t); }catch(e){}
}
function despierta264(t, porque){
  if(!esDormida(t)) return false;
  t.estado="abierta"; t.dormida=null; t.nuevo264=Date.now();
  t.dormida_porque=String(porque||"").slice(0,120);
  guarda(t); try{ sincronizaAvisos(t); }catch(e){}
  return true;
}
/* barrido: cualquier dormida con algo nuevo (mensaje entrante, archivo) despierta sola; corre en mias() y en misMensajes() */
function despiertaTodas(){
  var n=0;
  (tareas||[]).forEach(function(t){ if(!esDormida(t)) return; var d=t.dormida||{q:0,e:0};
    if(cuentaEntra(t)>(d.q||0) || (t.evidencias||[]).length>(d.e||0)){ if(despierta264(t,"llegó algo nuevo")) n++; } });
  return n;
}
function cierraSinEjecutar(t,motivoK){
  var lista=MOTIVOS_NO_EJECUTADA.concat(MOTIVOS_JEFE);
  var m=(PERSONAS[yo]&&PERSONAS[yo].jefe&&t.duenio!==yo)
    ? MOTIVOS_JEFE.filter(function(x){return x.k===motivoK})[0]
    : lista.filter(function(x){return x.k===motivoK})[0];
  t.cierre={tipo:"no_ejecutada",motivo:motivoK,culpa:m?m.culpa:"suya",f:hoy()};
  /* si dice que lo trabaron pero no hay ni un toque, la excusa no se sostiene */
  if(m&&m.culpa==="trabo"&&!(t.detenido&&(t.detenido.toques||[]).length)&&!(t.trabo_historial||[]).length){
    t.cierre.culpa="suya";
    t.cierre.nota="Dijo que lo trabaron pero no hay ni un toque registrado.";
  }
  t.estado="no_ejecutada"; t.pide_atoro=false; t.pide_tel=false; t.pide_fecha=false;
  msg(t,"bal","Cerrada sin hacerse. Le pregunto a Salvador qué sigue.");
  guarda(t);
}

/* la coleccion de fichas. Aqui NO va ningun NIP: las claves no entran al
   sistema, viven solo en el telefono de cada quien. */
var COLP="bitacora_personas";
/* ============ EL ACCESO (build 72, antes "invitaciones") ==================
   SUPERADO 2026-09-16: las ligas ?inv= de un solo uso (2026-09-03) se
   retiraron junto con el NIP. Ya no hay nada que caduque ni que verificar por
   WhatsApp: la puerta la abre el CORREO dado de alta y Google comprueba que
   la persona es duena de ese correo. Lo que se manda por WhatsApp es la pura
   liga de la app, que no abre nada por si sola. Dar de alta pueden Salvador
   y Josue (PUEDE_ALTA). */

/* la clave interna con la que va a vivir en el sistema: del nombre, sin acentos */
function claveDe(nombre){
  var b=String(nombre||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
        .replace(/[^a-z0-9]+/g,"").slice(0,20);
  if(!b) b="persona";
  var c=b, n=2;
  while(PERSONAS[c]) { c=b+n; n++ }
  return c;
}
/* Mexico son 10 digitos; wa.me los quiere con lada de pais y sin signos */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function telWa(tel){
  var d=String(tel||"").replace(/\D/g,"");
  if(d.length===10) d="52"+d;
  if(d.length===12 && d.indexOf("521")===0) d="52"+d.slice(3);   // el 1 viejo
  return d;
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function creaAcceso(nombre, correo, cb){
  var mail=String(correo||"").toLowerCase().trim();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)){ cb(null,"Ese correo no se ve completo"); return }
  if(!db){ cb(null,"Sin conexión: no se pudo dar el acceso"); return }
  var acc={clave:claveDe(nombre), nombre:String(nombre).trim(), jefe:false,
           por:yo, alta:Date.now()};
  db.collection(COLACC).doc(mail).set(acc)
    .then(function(){ cb(acc,null) })
    .catch(function(){ cb(null,"No se pudo guardar el acceso") });
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function textoAcceso(nombre){
  return "Hola "+nombre+", soy "+((PERSONAS[yo]&&PERSONAS[yo].nombre)||"Salvador")+". "+
    "Te di de alta en la bitácora de la oficina: ahí te llegan tus pendientes y me "+
    "contestas ahí mismo, sin correos.\n\n"+location.origin+location.pathname+"\n\n"+
    "Ábrela y pica “Entrar con Google” con tu cuenta.";
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function APP_URL(){ return location.origin+location.pathname }
/* LIGA DE UN SOLO USO (Salvador 2026-09-16). Cada liga trae un token unico.
   El primero que entra con Google usando esa liga la QUEMA: queda amarrada a
   su correo y ya no sirve para nadie mas. Sin liga valida, un correo NUEVO no
   entra (asi la pura direccion publica no abre la puerta). El que ya entro
   regresa con su solo Google, sin liga. */
function altaToken(){
  if(window.__alta) return window.__alta;
  try{ return localStorage.getItem("bit_alta")||null }catch(e){ return null }
}
function nuevaLiga(cb){
  if(!db){ cb(null,"Sin conexión"); return }
  var tk=uid()+uid();
  db.collection(COLI).doc(tk).set({token:tk, por:yo, creada:Date.now(), usada:0})
    .then(function(){ cb(location.origin+location.pathname+"?alta="+tk, null) })
    .catch(function(){ cb(null,"No se pudo generar la liga") });
}
/* ¿la liga que trae este telefono es valida y esta sin usar? Si si, la QUEMA
   amarrandola a este correo y contesta true. */
function consumeLiga(mail,cb){
  var tk=altaToken();
  if(!tk){ cb(false); return }
  var fb=firebase.firestore();
  fb.collection(COLI).doc(tk).get().then(function(d){
    if(!d.exists){ cb(false); return }
    var inv=d.data()||{};
    if(inv.usada){ cb(false); return }
    fb.collection(COLI).doc(tk).set({usada:Date.now(), correo:mail},{merge:true})
      .then(function(){ try{localStorage.removeItem("bit_alta")}catch(e){} window.__alta=null; cb(true) })
      .catch(function(){ cb(false) });
  }).catch(function(){ cb(false) });
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function abreWhatsApp(tel,texto){
  window.open("https://wa.me/"+telWa(tel)+"?text="+encodeURIComponent(texto),"_blank");
}


var PERSONAS={
  salvador:{nombre:"Salvador",ini:"S",jefe:true},
  samuel:{nombre:"Samuel",ini:"SM",jefe:false},
  cynthia:{nombre:"Cynthia",ini:"C",jefe:false},
  /* Los dos ingenieros. Salvador 6-oct-2026 10:54: cada usuario ve SOLO sus
     tareas; nadie ve las de los demás por ser jefe ni por estar en prueba.
     Ya no traen jefe:true (antes les daba vista completa de las tareas de
     Salvador). */
  josue:{nombre:"Josué",ini:"J",jefe:false,prueba:true},
  carlos:{nombre:"Carlos",ini:"CA",jefe:false,prueba:true},
  /* Karina entra como usuario NIVEL 1: solo recibe, no configura nada.
     Es el usuario mas dificil de complacer y por eso el que mas importa. */
  karina:{nombre:"Karina",ini:"K",jefe:false}
};


/* ================= ENCARGOS Y SUPLENCIA =================
   REGLA MADRE: una tarea, un dueño, una fecha, un semáforo.
   Lo que se comparte es la EJECUCIÓN, nunca la tarea.
   NO SE ACEPTA un encargo: cae en la lista y ya. El primero que responda cierra.
   DELEGAR NO PARA EL RELOJ. Detenido sí; delegado no.  */

var COLE="bitacora_encargos";
var COLS="bitacora_suplencias";
/* ============ LA FICHA DE CADA PERSONA ============
   PEDIDO POR SALVADOR, 2026-09-03.
   EL PROBLEMA: las iniciales de la derecha estaban escritas a mano en el codigo
   (S, SM, C...). Con dos Samueles o dos Carlos deja de servir, y nadie tiene
   como corregirlo sin tocar el archivo.
   LA SOLUCION: cada quien llena su ficha la PRIMERA VEZ que abre la app —
   nombre, apellido, correo de trabajo y correo personal — y de ahi salen las
   iniciales solas: primera del nombre + primera del apellido.
   Las fichas viven en Firestore, no en el codigo, y se pueden corregir en
   "Tu cuenta". NO SE PIDE NADA MAS: ni telefono ni puesto. Lo que no se usa,
   no se pregunta. Y NUNCA una clave: eso no entra al sistema. */

function iniciales(nombre, apellido){
  var n=String(nombre||"").trim(), a=String(apellido||"").trim();
  if(n && a) return (n.charAt(0)+a.charAt(0)).toUpperCase();
  if(n) return n.charAt(0).toUpperCase();
  return "?";
}
function fichaCompleta(k){
  var p=PERSONAS[k];
  return !!(p && p.nombre && p.apellido && p.mail_trabajo);
}
function guardaFicha(k, d){
  var p=PERSONAS[k]; if(!p) return;
  p.nombre=String(d.nombre||"").trim()||p.nombre;
  p.apellido=String(d.apellido||"").trim();
  p.mail_trabajo=String(d.mail_trabajo||"").trim();
  p.mail_personal=String(d.mail_personal||"").trim();
  p.ini=iniciales(p.nombre, p.apellido);
  if(db) db.collection(COLP).doc(k).set({
    nombre:p.nombre, apellido:p.apellido,
    mail_trabajo:p.mail_trabajo, mail_personal:p.mail_personal,
    ini:p.ini, tocada:Date.now()
  },{merge:true}).catch(function(){ toast("No se pudo guardar tu ficha") });
}
var encargos=[], suplencias={};

/* limite por defecto: si cuelga de una tarea, hereda su fecha; si es suelto, hoy */
function creaEncargo(para, texto, tareaId, limite){
  if(!para||!texto) return null;
  var t=tareaId?tareas.filter(function(x){return x.id===tareaId})[0]:null;
  var e={
    id:"e"+uid(), de:yo, para:para, texto:String(texto).trim(),
    tareaId:tareaId||null, tarea:t?t.nombre:"",
    creado:Date.now(), limite:limite||(t&&t.f_vigente)||hoy(),
    visto:0, respuesta:"", respondido:0, cerrado:0
  };
  encargos.push(e);
  guardaEncargo(e);
  if(t){
    t.encargado={a:para, id:e.id, desde:hoy()};
    msg(t,"bi","Le pediste a "+PERSONAS[para].nombre+": “"+e.texto+"”. La tarea sigue siendo tuya; "+
      "si no contesta, te aviso.");   /* build 282 (F39): tono */
    guarda(t);
  }
  return e;
}
function guardaEncargo(e){ if(db) db.collection(COLE).doc(e.id).set(e).catch(function(){}) }

function marcaVistoEncargo(e){ if(!e.visto){ e.visto=Date.now(); guardaEncargo(e) } }

function respondeEncargo(e, texto){
  e.respuesta=String(texto||"").trim();
  e.respondido=Date.now();
  e.cerrado=1;
  guardaEncargo(e);
  var t=e.tareaId?tareas.filter(function(x){return x.id===e.tareaId})[0]:null;
  if(t){
    msg(t,"bo",PERSONAS[e.para].nombre+": "+e.respuesta);
    t.encargado=null;
    guarda(t);
  }
  return t;
}

/* CUATRO ESTADOS, y "nunca contestó" y "ni lo abrió" van aparte a propósito:
   uno estaba ocupado, el otro lo vio y lo ignoró. No es la misma falta. */
function estadoEncargo(e){
  if(e.cerrado){
    return dDif(e.limite, iso(e.respondido))>0 ? "tarde" : "a_tiempo";
  }
  if(dDif(e.limite,hoy())>0) return e.visto ? "sin_contestar" : "ni_abierto";
  return "pendiente";
}
function contadorEncargos(persona){
  var c={a_tiempo:0,tarde:0,sin_contestar:0,ni_abierto:0,pendiente:0};
  encargos.forEach(function(e){ if(e.para===persona) c[estadoEncargo(e)]++ });
  return c;
}
/* el número que es de Salvador, no del empleado: a quién no le contestan */
function noLeContestan(persona){
  var n=0;
  encargos.forEach(function(e){
    if(e.de!==persona) return;
    var st=estadoEncargo(e);
    if(st==="sin_contestar"||st==="ni_abierto") n++;
  });
  return n;
}

/* ---- SUPLENCIA: una persona y un tope. NO una matriz por puesto. ---- */
function ponSuplencia(persona, desde, hasta, suplente, tope, arriba){
  suplencias[persona]={desde:desde,hasta:hasta,suplente:suplente,
    tope:Number(tope)||0, arriba:arriba||"espera"};
  if(db) db.collection(COLS).doc(persona).set(suplencias[persona]).catch(function(){});
}
function quitaSuplencia(persona){
  delete suplencias[persona];
  if(db) db.collection(COLS).doc(persona).delete().catch(function(){});
}
function estaFuera(persona){
  var s=suplencias[persona]; if(!s) return false;
  return dDif(s.desde,hoy())>=0 && dDif(hoy(),s.hasta)>=0;
}
/* a quién le toca autorizar ahorita. El default si nadie nombró suplente:
   sube al jefe inmediato. Ésa es la única regla de puestos que hace falta. */
function quienAutoriza(persona, monto){
  var jefe=null;
  Object.keys(PERSONAS).forEach(function(k){ if(PERSONAS[k].jefe && !jefe) jefe=k });
  var destino=jefe;
  if(estaFuera(destino)){
    var s=suplencias[destino];
    if(monto!=null && s.tope>0 && monto>s.tope){
      return {quien:destino, fuera:true, sobreTope:true,
        nota:"Son "+monto+" y "+PERSONAS[s.suplente].nombre+" puede autorizar hasta "+s.tope+". "+
             (s.arriba==="marca"?"Márcale a "+PERSONAS[destino].nombre+".":"Se espera a que "+PERSONAS[destino].nombre+" regrese el "+s.hasta+".")};
    }
    return {quien:s.suplente, fuera:true, sobreTope:false,
      nota:PERSONAS[destino].nombre+" está fuera. Lo ve "+PERSONAS[s.suplente].nombre+"."};
  }
  return {quien:destino, fuera:false, sobreTope:false, nota:""};
}

/* ---- TRANSFERENCIA: PERMANENTE Y NADA MÁS ----
   La temporal se descartó el 2026-09-02: es una puerta trasera —se transfiere todo
   antes de cada viaje y se regresa limpio— y la responsabilidad no se quita por ir
   en un avión. Para el viaje ya existe la salida honesta: mover la fecha ANTES de
   que venza, con la razón escrita. */
function transfiere(t, nuevo, razon){
  if(!nuevo||!PERSONAS[nuevo]) return {ok:false,msg:"Falta a quién."};
  if(nuevo===t.duenio) return {ok:false,msg:"Ya es suya."};
  t.duenio_anterior=t.duenio;
  t.duenio=nuevo;
  t.transferida={de:t.duenio_anterior, a:nuevo, f:hoy(), razon:razon||""};
  msg(t,"bal","Esta tarea pasó de "+PERSONAS[t.duenio_anterior].nombre+" a "+PERSONAS[nuevo].nombre+
    ", en definitiva"+(razon?": "+razon:"")+". La fecha original no se movió.");
  guarda(t);
  return {ok:true};
}

/* ============ ESTADO ============ */
var menuOpen=false, encAbierto=null, sueltoOpen=false, yoOpen=false;
/* despliega la lista de tareas con fecha por delante — build 285: verFuturas y los demás interruptores de secciones del home
   (window.__verEnc270, __verRev270, __verComp, __clL263) leen y escriben el estado plegado del día (abre285/ponAbre, más abajo) */
var masDias=0;          /* cuántos días extra de "Próximas" pidió ver */
var secAbierta=null;   /* Salvador 2026-09-22: acordeon de las 7 secciones del home
   (atora/pend/venc/msg/hoy/rec/prox). null = todas colapsadas; si trae una clave, esa
   es la UNICA seccion abierta — al abrir otra se cierra la anterior sola, sin mover
   el scroll. Reemplaza a verMsgs/verPend/plegado, que aislaban cada quien a su modo. */
/* build 155: dia calendario (YYYY-MM-DD) en America/Monterrey de un epoch ms */
function diaMonterrey(ms){
  try{
    var p=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Monterrey",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(ms)), o={};
    p.forEach(function(x){ o[x.type]=x.value });
    return o.year+"-"+o.month+"-"+o.day;
  }catch(e){ var d=new Date(ms); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
}
/* dia de creacion de una tarea ("" si no hay dato): `creada` epoch ms; las
   auto-creadas por WhatsApp traen `creado` 'YYYY-MM-DD HH:MM:SS' (hora de Monterrey). */
function diaCreacion(t){
  var c=t&&t.creada;
  if(typeof c==="string" && /^\d{10,}$/.test(c)) c=+c;
  if(typeof c==="number" && isFinite(c) && c>0) return diaMonterrey(c);
  var s=t&&t.creado;
  if(typeof s==="number" && isFinite(s) && s>0) return diaMonterrey(s);
  if(typeof s==="string"){ var m=s.match(/^(\d{4}-\d{2}-\d{2})[ T]\d{2}:\d{2}/); if(m) return m[1]; }
  return "";
}
function msCreacion(t){
  if(typeof t.creada==="number") return t.creada;
  var s=t.creado; if(typeof s==="number") return s;
  if(typeof s==="string"){ var m=s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if(m) return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)); }
  return 0;
}
function tareasCreadasHoy(lista){
  var H=diaMonterrey(Date.now()), seen={};
  return lista.filter(function(t){
    if(!t || t.fusionada_en || seen[t.id]) return false;
    seen[t.id]=1; return diaCreacion(t)===H;
  }).sort(function(a,b){ return msCreacion(b)-msCreacion(a); });
}
function secHead(key,label,n,cls,iconKey){
  var abierta=secAbierta===key;
  return '<button class="sbar '+cls+(abierta?" open":"")+'" data-sb="'+key+'">'+
    '<span class="sicw">'+ico(iconKey,18,1.8)+'<span class="scnt">'+n+'</span></span>'+
    '<b>'+esc(label)+'</b><span class="grow"></span>'+
    '<span class="schev">'+(abierta?"\u25be":"\u203a")+'</span></button>';
}
var posRev=false;       /* hoja de "posponer revisión": ¿cuándo la vuelves a ver? */      /* aísla las tareas con mensajes sin leer */
var negociar=null;      /* flujo "Muy caro": {id, cargando, mensaje, ops[]} */
var dbFail=false;       /* Firestore niega permisos: NADA se guarda (lo dice el aviso) */
var fotoEnMano=null;      /* la foto recien tomada, todavia sin destino */
var fichasLeidas=false;   /* true cuando Firestore ya contesto las fichas */
var db=null, yo=null, tareas=[], vista="lista", abierta=null, fichaOpen=false,
    chkCerrado={}, detOpen={}, listo=false, visorList=[], visorI=0, editaNombre=null,
    msgAn={};  /* build 148: qué mensajes de IA traen su "análisis" desplegado (icono ⓘ) */

/* ---- todos los adjuntos de una tarea, en orden ---- */
function adjuntos(t){
  var out=[];
  /* build 204: cada archivo sabe de donde viene (ref) para poder apartarlo o copiarlo; lo apartado no sale (nada se borra) */
  (t.evidencias||[]).forEach(function(e,i){ if(e && !e.apartado && !e.eliminado) out.push({data:e.data,ts:e.ts,lat:e.lat,lon:e.lon,de:e.de||"evidencia",ref:"ev:"+i}) });
  var ft=t.fotos||{};
  Object.keys(ft).forEach(function(k){
    var f=ft[k]; if(!f || f.apartado || f.eliminado) return; var p=(t.puntos&&t.puntos[k])?t.puntos[k].t:"punto "+k;
    out.push({data:f.data,ts:f.ts,lat:f.lat,lon:f.lon,de:p,ref:"fo:"+k});
  });
  /* build 186 (Salvador 2026-10-03 08:17): el clip junta TODO: tambien fotos y documentos que llegaron por WhatsApp */
  (t.msgs||[]).forEach(function(x,mi){
    if(!x || !x.url || x.apartado || x.eliminado) return;
    var u=String(x.url), tp=String(x.tipo||"").toLowerCase();
    var esImg=/imagen|foto|sticker/.test(tp) || /\.(jpe?g|png|webp|gif|heic)(\?|$)/i.test(u);
    var esAud=/audio/.test(tp) || /\.(ogg|opus|mp3|m4a|wav)(\?|$)/i.test(u);
    var mm=String(x.t||"").match(/^([^:\n]{1,24}):/), quien=mm?mm[1]:(x.wa_c?String(x.wa_c):"WhatsApp");
    var nom=(u.split("/").pop()||"").split("?")[0];
    var _nm=nom; try{ _nm=decodeURIComponent(nom); }catch(e){}
    out.push({url:u, data:esImg?u:"", ts:x.ts, de:quien, wa:1, img:esImg, aud:esAud, nombre:_nm, ref:"ms:"+mi});
  });
  out.forEach(function(f){ if(f.img===undefined) f.img=true; });
  out.sort(function(a,b){return (a.ts||0)-(b.ts||0)});
  return out;
}
/* build 204 (Salvador 21:08): seleccion multiple en "Archivos de esta tarea", como en WhatsApp */
function fuenteAdj(t, ref){
  var p=String(ref||"").split(":"), k=p[0], i=p.slice(1).join(":");
  if(k==="ev") return (t.evidencias||[])[+i]||null;
  if(k==="fo") return (t.fotos||{})[i]||null;
  if(k==="ms") return (t.msgs||[])[+i]||null;
  return null;
}
function apartaAdjuntos(t, refs){
  var n=0; (refs||[]).forEach(function(r){ var f=fuenteAdj(t,r); if(f && !f.apartado){ f.apartado=true; f.apartado_ts=Date.now(); f.apartado_por=yo||""; n++; } });
  if(n){ msg(t,"bi","Aparté "+n+" archivo"+(n===1?"":"s")+" de esta tarea (no se borra"+(n===1?"":"n")+": quedan guardados)."); guarda(t); }
  return n;
}
/* ===== build 215 (Salvador 8:52): ELIMINAR archivos que el elige a mano (excepcion aprobada a "nada se borra") =====
   Fotos guardadas dentro de la tarea (evidencias, fotos de puntos): se borran sus bytes ya. Archivos del servidor (url):
   push.php?action=borrar_archivo {tarea_id, url}; si esa accion aun no existe (falta Carlos), quedan eliminado:true (ocultos
   en todos lados) y en t.eliminar_pendiente, que se reintenta al abrir la app hasta que el servidor los borre. */
function eliminaAdjuntos(t, refs){
  var n=0, urls=[], ahora=Date.now();
  (refs||[]).forEach(function(r){ var f=fuenteAdj(t,r); if(!f || f.eliminado) return;
    f.eliminado=true; f.eliminado_ts=ahora; f.eliminado_por=yo||""; n++;
    if(String(r).split(":")[0]==="ms"){ if(f.url) urls.push(String(f.url)); }
    else { if(f.data && !/^https?:/.test(String(f.data))) f.data=""; else if(f.data) urls.push(String(f.data)); } });
  if(urls.length){ t.eliminar_pendiente=(t.eliminar_pendiente||[]).concat(urls.map(function(u){ return {url:u, ts:ahora}; })); }
  if(n){ guarda(t); setTimeout(function(){ try{ preguntaExcluir(t.id); }catch(e){} }, 500); }
  return {n:n, urls:urls};
}
/* APRENDER DE LO QUE SE ELIMINA (Salvador 9-oct: «borré imágenes que no tienen nada que ver y volvieron; que aprenda»).
   Si ya quitó 2 o más cosas que mandó el mismo contacto, se le ofrece sacar a ese contacto de la tarea: la Mac (18z53) deja de
   pegar aquí lo suyo por la liga del contacto y lo manda a Acomodo. Se pregunta una vez por contacto. */
function preguntaExcluir(tid){
  var t=tareas.filter(function(x){ return x.id===tid; })[0]; if(!t) return;
  var cuenta={}; (t.msgs||[]).forEach(function(m){ if(m && m.wa_c && (m.eliminado||m.apartado) && (m.wa_in===1 || m.k==="bi")) cuenta[m.wa_c]=(cuenta[m.wa_c]||0)+1; });
  var ya=(t.wa_excluidos||[]).concat(t.wa_no_excluir||[]);
  var c=Object.keys(cuenta).filter(function(k){ return cuenta[k]>=2 && ya.indexOf(k)<0; })[0]; if(!c) return;
  var corto=nombreCorto(c);
  sobreHoja('<div class="mov225" role="dialog" aria-label="¿Saco a este contacto?"><div class="h225g"></div><div class="h225h"><b>¿Ya no meto aquí lo de '+esc(corto)+'?</b><button class="h225b" data-hx254="1" aria-label="Cerrar">×</button></div>'+
    '<div class="h225c"><p class="h225v0">Quitaste '+cuenta[c]+' cosas que mandó '+esc(corto)+'. Si dices que sí, lo que mande ya no cae solo en esta tarea: se va a Acomodo para que tú decidas.</p>'+
    '<button class="hop big254 pri" data-h254="si">Sí, ya no lo metas aquí</button><button class="hop big254" data-h254="no">No, sí es de esta tarea</button></div></div>',
    function(k){ var T=tareas.filter(function(x){ return x.id===tid; })[0]||t;
      if(k==="si"){ T.wa_excluidos=(T.wa_excluidos||[]).concat([c]); T.wa_contactos=(T.wa_contactos||[]).filter(function(x){ return x && x.nombre!==c; });
        msg(T,"bi","Listo: lo que mande "+corto+" ya no cae solo en esta tarea; va a Acomodo."); var m=T.msgs[T.msgs.length-1]; m.canal="priv:"+yo; m.res238=1; }
      else T.wa_no_excluir=(T.wa_no_excluir||[]).concat([c]);
      guarda(T); try{ render(); }catch(e){} });
}
function borraEnServidor(tid, url){
  if(typeof APP_TOKEN==="undefined" || String(APP_TOKEN).indexOf("__")===0) return Promise.resolve(false);
  try{ return fetch(PUSH+"?action=borrar_archivo",{method:"POST", headers:{"content-type":"application/json","x-app-token":APP_TOKEN}, body:JSON.stringify({tarea_id:tid, url:url})})
    .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return !!(r.ok && j && (j.ok||j.success||j.borrado) && !j.error); }); })
    .catch(function(){ return false; }); }catch(e){ return Promise.resolve(false); }
}
/* intenta borrar en el servidor lo pendiente de una tarea; lo que si se borro sale de la cola */
function procesaEliminar(t){
  var cola=(t.eliminar_pendiente||[]).slice(); if(!cola.length) return Promise.resolve(0);
  return Promise.all(cola.map(function(x){ return borraEnServidor(t.id, x.url).then(function(ok){ return ok?x.url:null; }); })).then(function(hechos){
    var ok=hechos.filter(Boolean); if(!ok.length) return 0;
    t.eliminar_pendiente=(t.eliminar_pendiente||[]).filter(function(x){ return ok.indexOf(x.url)<0; });
    (t.msgs||[]).forEach(function(m){ if(m && m.eliminado && ok.indexOf(String(m.url))>=0) m.borrado_servidor=Date.now(); });
    guarda(t); return ok.length; });
}
function hojaEliminar(n, cb){
  var v=document.createElement("div"); v.className="mveil"; v.id="mveil";
  v.innerHTML='<div class="mcard" role="alertdialog" aria-labelledby="mvt"><div class="mico">'+svgBasura()+'</div><b id="mvt">¿Eliminar '+n+' archivo'+(n===1?'':'s')+'?</b><p>No se podrán recuperar.</p>'+
    '<div class="mbts"><button class="mno" id="mvno">Cancelar</button><button class="msi" id="mvsi">Eliminar</button></div></div>';
  document.body.appendChild(v);
  var cierra=function(){ if(v.parentNode) v.parentNode.removeChild(v); };
  v.onclick=function(e){ if(e.target===v) cierra(); };
  document.getElementById("mvno").onclick=cierra;
  document.getElementById("mvsi").onclick=function(){ cierra(); if(cb) cb(); };
}
(function(){ var k=setInterval(function(){ if(typeof listo!=="undefined" && listo && typeof tareas!=="undefined"){ clearInterval(k);
  setTimeout(function(){ try{ tareas.forEach(function(t){ if(t && (t.eliminar_pendiente||[]).length) procesaEliminar(t); }); }catch(e){} }, 4000); } }, 2000); })();
function copiaAdjuntos(t, refs, d){
  if(!t || !d || t.id===d.id) return 0;
  var n=0, ahora=Date.now(); d.msgs=d.msgs||[];
  (refs||[]).forEach(function(r){
    var f=fuenteAdj(t,r); if(!f) return;
    var k=String(r).split(":")[0];
    if(k==="ms"){ var c={k:"bi", t:"Copiado de “"+t.nombre+"”: "+String(f.t||"archivo").slice(0,200), url:f.url, tipo:f.tipo||"", ts:ahora+n, h:hhmm(new Date(ahora)), copiado_de:t.id};
      d.msgs.push(c); n++; return; }
    d.evidencias=d.evidencias||[]; d.evidencias.push({data:f.data, ts:f.ts||ahora, lat:f.lat, lon:f.lon, de:"de “"+corta40(t.nombre)+"”", copiado_de:t.id}); n++;
  });
  if(n){ msg(d,"bi","Llegaron "+n+" archivo"+(n===1?"":"s")+" copiado"+(n===1?"":"s")+" de “"+t.nombre+"”."); guarda(d);
    msg(t,"bi","Copié "+n+" archivo"+(n===1?"":"s")+" a “"+d.nombre+"”."); guarda(t); }
  return n;
}
function abreCopiarA(t, refs){
  cierraEnlazar();
  var cand=enlazaCandidatas(t.id), nrm={}; cand.forEach(function(x){ nrm[x.id]=_nrm(x.nombre); });
  var v=document.createElement("div"); v.className="hoja-velo"; v.id="enlv";
  v.innerHTML='<div class="enlh"><div class="enlg">'+
    '<div class="enlt"><b>Copiar a otra tarea</b>'+refs.length+' archivo'+(refs.length===1?'':'s')+' de “'+esc(corta40(t.nombre))+'”</div>'+
    '<div class="enlb">'+ico("lupa",18,1.8)+'<input id="enlq" type="text" placeholder="Buscar tarea" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search"></div>'+
    '<div class="enll" id="enll"></div></div><button class="enlc" id="enlno">Cancelar</button></div>';
  document.body.appendChild(v);
  v.onclick=function(e){ if(e.target===v) cierraEnlazar(); }; $("enlno").onclick=cierraEnlazar;
  var lista=$("enll"), q=$("enlq");
  function pinta(){ var ws=_nrm(q.value).trim().split(/\s+/).filter(Boolean);
    var r=cand.filter(function(x){ return ws.every(function(w){ return nrm[x.id].indexOf(w)>=0; }); }).slice(0,60);
    lista.innerHTML=r.length?r.map(function(x){ return '<button class="enlr" data-d="'+esc(x.id)+'"><span class="enln">'+esc(x.nombre)+'</span><span class="vinc">Copiar</span></button>'; }).join("")
      :'<div class="enlv">'+(cand.length?'No encontré nada con eso.':'No hay otras tareas abiertas.')+'</div>'; }
  lista.onclick=function(e){ var b=e.target; while(b&&b!==lista&&!(b.getAttribute&&b.getAttribute("data-d"))) b=b.parentNode; if(!b||b===lista) return;
    var d=tareas.filter(function(x){ return x.id===b.getAttribute("data-d"); })[0]; if(!d) return;
    var n=copiaAdjuntos(t, refs, d); cierraEnlazar(); window.__galSel=null; toast("Copié "+n+" a “"+corta40(d.nombre)+"”"); render(); };
  q.oninput=pinta; pinta();
}
