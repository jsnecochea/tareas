/* Copia íntegra de la pantalla de Notificaciones de UNA columna (antes de build 313), retirada el 2026-10-09.
   Por qué: Salvador pidió dos columnas (Doit y WhatsApp) por tipo de aviso, sin tipos ocultos ni forzados para él.
   Estaba en src/js/01-config-y-avisos.js. */
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
