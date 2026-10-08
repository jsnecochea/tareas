/* ═══════════════════════════════════════════════════════════════════════════════
   PIEZAS DEL HOME RETIRADAS DE index.html — 8-oct-2026 (build 294, home de tres fichas)
   Copia ÍNTEGRA de lo que se quitó, tal como estaba en el build 293. La app no carga este archivo.

   Por qué: Salvador aprobó el home nuevo (maqueta «D12b»): arriba tres fichas iguales
   (Te esperan · Bandeja · Hoy) y debajo una lista agrupada (Vencidas, Próximas, Te encargaron,
   Las revisas tú, Compartidas, Las lleva Claude, Historial). Cada grupo abre su propia vista
   con «‹ Inicio». Con eso:
   · vEstado272 (la línea «N te preguntan · N vencidas · N hoy» al final del home) sobra:
     sus números viven ahora en las fichas y en la lista. Se quitó también su CSS (.est272/.est279)
     y el enlace de sus botones en bindHome272 (data-est272 → scroll a su sección).
   · vHome270 (las secciones Decide tú / Te pregunta Doit / Vencidas mías / Hoy mías una tras otra
     en el home) la reemplazan vFichasInicio + las vistas de grupo (vGrupoInicio), que pintan
     las MISMAS filas con las mismas funciones (vDecide284, filas272).
   · vAbajo270 y plegable270 (las secciones plegables de abajo) las reemplaza vListaInicio
     (renglones que abren su vista).
   Para regresar una: copiarla a index.html (son declaraciones de nivel superior) y volver a
   llamarla desde vLista.
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── CSS retirado (estaba en <style>, líneas 673-676 del build 293) */
/*
.est272{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:2px 4px;margin:10px 16px 2px;font-size:14.5px;font-weight:500;color:var(--ink-3)}
.est272 button{border:0;background:none;font:inherit;color:inherit;padding:6px 6px;border-radius:10px;min-height:32px}.est272 button b{font-weight:700}
.est279{margin:18px 16px 8px}
.est272 .e-preg b{color:#FF7A00}.est272 .e-venc b{color:#FF453A}.est272 .e-hoy b{color:var(--ink-2)}.est272 .dot272{opacity:.5}
*/

/* ── vHome270 · reemplazada por vFichasInicio + vGrupoInicio (estaba en la línea 18588) */
var COL270={preg:"#FF7A00", venc:"#FF3B30", hoy:"#8e8e93"};
function vHome270(H){
  var vis={}, ord=[]; [H.preg, H.venc, H.hoy].forEach(function(L){ L.forEach(function(x){ if(!vis[x.t.id]){ vis[x.t.id]=1; ord.push(x.t.id); } }); });
  window.__ttOrden=ord;   /* la lectura en voz ("Escuchar") sigue este mismo orden */
  if(!ord.length && !(H.dec284||[]).length){ window.__sale272=null; try{ foto272(H); }catch(e){} return '<div class="sep270 s-ok"><span>Todo al día</span></div>'; }
  var h='<div class="h270">', primero=true;
  function sec(k, label, L){ if(!L.length) return;
    var ab=abre285(k);   /* build 285: plegable; amanece plegada */
    h+='<button class="sep270 s-'+k+'" id="sec272-'+k+'" data-pl285="'+k+'" aria-expanded="'+(ab?"true":"false")+'" aria-label="'+esc(label)+': '+L.length+'"><span>'+label+'</span><em>'+L.length+'</em>'+CH285+'</button>'; primero=false;   /* build 277: sin audífono aquí (la Caminata se abre con el ícono junto al ⋯) */
    h+='<div class="revl ttl l270 l-'+k+'"'+(ab?'':' hidden')+'>'+filas272(k, L, function(x){ return '<button class="revr ttr" data-id="'+esc(x.t.id)+'"><i style="background:'+COL270[k]+'"></i><span class="ttx"><span class="rn">'+esc(x.t.nombre||"Sin nombre")+'</span>'+(x.why?'<small>'+esc(x.why)+'</small>':'')+'</span></button>'; })+'</div>'; }
  h+=vDecide284(H, filas272);   /* build 284: «Decide tú» en filas con respuesta rápida + lo demás que te pregunta Doit, sin fondo de color */
  sec("venc", "Vencidas mías", H.venc); sec("hoy", "Hoy mías", H.hoy);
  try{ foto272(H); }catch(e){}
  window.__sale272=null;   /* build 272: una sola vez, en el primer home después del Ya está */
  return h+'</div>';
}

/* ── plegable270 y vAbajo270 · reemplazadas por vListaInicio + vGrupoInicio (líneas 18727-18731 y 18862-18872) */
/* una sección plegable de abajo (mismo renglón que "Las lleva Claude") */
function plegable270(id, label, n, abierta, cuerpo){
  if(!n) return "";
  return '<div class="cll263 pl270"><button class="clh263" id="'+id+'" aria-expanded="'+(abierta?"true":"false")+'"><b>'+label+'</b><span class="ttn">'+n+'</span><span class="ttch ch285" aria-hidden="true">'+CH285+'</span></button>'+(abierta?cuerpo():"")+'</div>';
}
function vAbajo270(claudeL, H, hMis, nMis){
  var h='';   /* build 272: Las lleva Claude va hasta abajo; sin nada, la sección no existe */
  h+=plegable270("bfut", "Mías futuras", H.fut.length, abre285("fut"), function(){ return '<ul class="list">'+H.fut.map(function(t){ return fila(t); }).join("")+'</ul>'; });
  h+=plegable270("benc270", "Te encargaron", nMis, abre285("enc"), function(){ return hMis; });
  h+=plegable270("brev270", "Las revisas tú", H.otros.length, abre285("rev"), function(){
    return '<div class="revl ttl">'+H.otros.map(function(x){ return '<button class="revr ttr" data-id="'+esc(x.t.id)+'"><i style="background:#636366"></i><span class="ttx"><span class="rn">'+esc(x.t.nombre||"Sin nombre")+'</span><small>'+esc(((PERSONAS[x.t.duenio]||{}).nombre?("de "+PERSONAS[x.t.duenio].nombre+" · "):"")+x.why)+'</small></span></button>'; }).join("")+'</div>'; });
  var nC=0; try{ nC=compartidasDe().length; }catch(e){}
  h+=plegable270("bcomp", "Compartidas", nC, abre285("comp"), function(){ try{ return vCompartidas().replace(/^<button class="compbtn"[^>]*>[^<]*<\/button>/,''); }catch(e){ console.warn("compartidas",e); return ""; } });
  h+=vClaudeLleva263(claudeL).replace('<div class="cll263">','<div class="cll263 cl272">');
  return h?'<div class="abajo270">'+h+'</div>':'';
}

/* ── vEstado272 · la línea de estado del final del home; sus números van ahora en las fichas (líneas 20322-20330) */
function vEstado272(H){
  var P=[], n;
  n=H.preg.length; if(n) P.push(['preg', n, n===1?'te pregunta':'te preguntan']);
  n=H.venc.length; if(n) P.push(['venc', n, n===1?'vencida':'vencidas']);
  n=H.hoy.length; if(n) P.push(['hoy', n, 'hoy']);
  if(!P.length) return '';
  return '<nav class="est272" aria-label="Lo que te toca">'+P.map(function(x, i){ return (i?'<span class="dot272" aria-hidden="true">·</span>':'')+
    '<button class="e-'+x[0]+'" data-est272="'+x[0]+'"><b>'+x[1]+'</b> '+x[2]+'</button>'; }).join('')+'</nav>';
}

/* ── bindHome272 tal como estaba (líneas 20362-20373); se quitó solo el enlace de [data-est272] */
function bindHome272(){
  try{ bindDec284(); }catch(e){ console.warn("dec284", e); }
  try{ bindPl285(); bindHist285(); }catch(e){ console.warn("pl285", e); }
  Array.prototype.forEach.call(document.querySelectorAll('[data-est272]'), function(b){ b.onclick=function(){
    var k=b.getAttribute('data-est272');   /* build 285: si su sección está plegada, se abre antes de llevarlo ahí */
    if(k==='preg'){ abreSec285('decide'); abreSec285('preg'); } else abreSec285(k);
    var el=document.getElementById('sec272-'+k); if(el) try{ el.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){ el.scrollIntoView(); } }; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-preg272]'), function(b){ b.addEventListener('click', function(){
    var id=b.getAttribute('data-id'); window.__pq255Last=null;
    setTimeout(function(){ try{ if(vista==='hilo' && abierta===id && !document.getElementById('preg249')) abrePreguntas249(id, {gesto:true}); }catch(e){} }, 120); }, true); });
  anima272();
}

/* ── vLista: las líneas del home viejo que se cambiaron (7352-7354 y 7486-7493) */
/*
  h+='<!--est272-->'+bannerAvisos();   /* build 272: aquí va la línea de estado (se llena abajo, con el home ya armado) */
  var _pp256=propuestas256();
  if(_pp256.length){ var _pl=acoPlegado260(); h+='<button class="prop256row clh263" id="bprop256" aria-expanded="'+(_pl?'false':'true')+'" aria-label="Tareas nuevas por revisar: '+_pp256.length+'"><b>Tareas nuevas</b><span class="ttn">'+_pp256.length+'</span><span class="ttch ch285" aria-hidden="true">'+CH285+'</span></button>'; }   /* build 256; 260: plega y despliega Acomodo; 281: ficha «Tareas nuevas» + globito */
  var _h270=armaHome270(_rev, det, mias_venc, hoyYa, futuras);
  h+=vAcomodo()+vMsgs271()+vHome270(_h270)+vAbajo270(_cl263, _h270, hMis, mis.length);
  /* build 279 (Salvador 7-oct): el resumen "N te preguntan · N vencidas · N hoy" baja hasta el FINAL del home, debajo de todas las
     secciones (Las lleva Claude incluida), para que el home arranque limpio. Sus contadores siguen llevando con scroll a su sección. */
  h+=vEstado272(_h270).replace('class="est272"', 'class="est272 est279"');
  try{ h+=vHist285(); }catch(e){ console.warn("hist285", e); }   /* build 285: «Tu historial» hasta abajo, después del resumen */
  window.__H274=_h270;   /* build 274: la caminata sigue el orden del home */
  h=h.replace('<!--est272-->', '').replace('<!--cam277-->', vCamIco277());   /* build 279 sobre 277: la línea de estado ya no va arriba (va al final, ver línea de arriba); arriba solo el ícono chico de Caminata junto al ⋯ */
*/
