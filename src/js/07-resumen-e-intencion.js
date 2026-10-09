/* ¿va en la vista Claude? lo que se le pidió a Claude y lo que contestó (no las notas automaticas de seguimiento) */
function esClaude(x){
  if(!x) return false;
  if(x.nota_ia || /^\s*(📝\s*)?Nota IA\b/i.test(String(x.t||""))) return false;
  if(x.k==="bo") return !!(x.nota_claude || x.indicacion_ts);
  return !!(x.nota_claude && !x.wa_in && !x.wa_c);
}
function vResumen(t){
  var r=(t.resumen && typeof t.resumen==="object")?t.resumen:null;
  if(!r || !(String(r.texto||"").trim() || String(r.que_toca||"").trim() || (r.acuerdos||[]).length || (r.pendientes||[]).length)){
    /* build 240: sin resumen de Claude se arma uno local (2 o 3 líneas: contexto, lo que sigue y el último dato real) */
    var L=[], cx=String(contextoDe(t)||"").replace(/\s+/g," ").trim(); if(cx) L.push(cx.length>140?cx.slice(0,139).replace(/\s+\S*$/,"")+"…":cx);
    try{ (resumenVivo(t).partes||[]).forEach(function(p){ if(L.length<3 && p && p.tx && p.k!=="falta" && p.k!=="ultimo") L.push(p.tx); });   /* build 247: sin "Falta:" ni "Último:" */ }catch(e){}
    if(!L.length) return '<div class="res230 vacio"><b>Resumen</b><span>Claude está preparando el resumen</span></div>';
    return '<div class="res230 local240"><b>Resumen</b>'+L.map(function(x){ return '<p class="rtx">'+esc(x)+'</p>'; }).join("")+'</div>'; }
  var fc=function(f){ return /^\d{4}-\d{2}-\d{2}/.test(f||"")?fechaMovCorta(String(f).slice(0,10)):String(f||""); };
  var hm=""; try{ var d=new Date(typeof r.actualizado==="number"?r.actualizado:Date.parse(r.actualizado)); if(!isNaN(d)) hm=hhmm(d); }catch(e){}
  /* build 246 (Salvador 6-oct 07:01): PRIMERO "Qué toca" (resumen.que_toca; sin él, se arma con resumen.pendientes: lo que sigue y de quién se espera);
     DEBAJO el resumen (2-3 renglones), plegado con "ver resumen" si no agrega nada a Qué toca. */
  var qt=String(r.que_toca||"").replace(/\s+/g," ").trim(), qtLocal=false, tx=String(r.texto||"").trim();
  if(/·\s*hecho\s*$/i.test(qt) || /\bya se confirm/i.test(qt)) qt=pasoSiguiente(t);   /* build 263: lo hecho no va arriba; arriba va el siguiente paso y quién lo tiene */
  if(!qt && (r.pendientes||[]).length){ qtLocal=true;
    qt=r.pendientes.map(function(p){ var a=String(p.t||p.texto||"").trim().replace(/[.\s]+$/,""); return a+((p.de && a.toLowerCase().indexOf(String(p.de).toLowerCase())<0)?" ("+p.de+")":""); }).filter(Boolean).join(" · "); }
  var plegar=false;
  if(qt && tx){ var pk=function(z){ var o={}; _nn(String(z)).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).forEach(function(w){ if(w.length>=4) o[w.slice(0,6)]=1; }); return o; };
    var A=pk(qt), B=pk(tx), nb=Object.keys(B).length, en=Object.keys(B).filter(function(w){ return A[w]; }).length; plegar=nb===0 || en/nb>=0.7; }
  return '<div class="res230'+(qt?' qt246':'')+'">'+
    (qt?'<b>Qué toca</b><p class="qtx">'+esc(qt)+'</p>':'<b>Resumen</b>')+
    (tx?(qt&&plegar?'<details class="rsm246"><summary>ver resumen</summary><p class="rtx">'+esc(tx)+'</p></details>':(qt?'<b class="sub246">Resumen</b>':'')+'<p class="rtx">'+esc(tx)+'</p>'):'')+
    ((r.acuerdos||[]).length?'<ul class="racu">'+r.acuerdos.map(function(a){ return '<li>'+ico("check",14)+'<span>'+esc(a.t||a.texto||"")+'</span>'+(a.fecha?'<small>'+esc(fc(a.fecha))+'</small>':'')+'</li>'; }).join("")+'</ul>':'')+
    (hm?'<small class="ract">act. '+esc(hm)+'</small>':'')+'</div>';
}
/* ===================== build 273 (Salvador 7-oct): LA TAREA EN 4 CAPAS =====================
   Estilo Apple, de arriba hacia abajo (en la vista Importante, la que sale al abrir):
   1 "En qué vamos": el siguiente paso en una o dos líneas, quién y para cuándo (plan[] / resumen.pendientes / resumen.que_toca).
     El resumen y los acuerdos de siempre quedan debajo, plegados ("Ver resumen"). Si no hay siguiente paso, el resumen de siempre.
   2 "Decide tú": SOLO si la tarea trae t.decision pendiente y quien la ve es el jefe. Recomendación de la IA, comparativa
     compacta (palomita / tache y precio), links y la caja (o el micrófono) para contestar ahí mismo; la respuesta va al hilo
     como nota para Claude y queda en t.decision.respuesta.
       t.decision = {pregunta, recomendacion, opciones:[{nombre, precio, link, cumple:{"<requisito>":bool}, recomendada?:bool}],
                     resuelta?:bool, respuesta?:{t, ts, de}}   (respuesta la escribe la app; resuelta la pone la Mac)
   3 "Lo que sabemos": t.sabemos (texto, un renglón por viñeta, o arreglo de textos u objetos {t, tipo, por_que}). Sin él, no sale.
   4 "Plática": el hilo de siempre. Los mensajes con archivado:true (y de hace más de 24 h) se pliegan en un renglón
     "Plática anterior (N) ▸" que se abre al tocarlo. */
var ARCH273_RECIENTE=24*3600000;
function decision273(t){
  var d=t && t.decision; if(!d || typeof d!=="object" || Array.isArray(d)) return null;
  if(d.resuelta===true || t.cierre) return null;
  if(!(PERSONAS[yo] && PERSONAS[yo].jefe)) return null;   /* solo Salvador decide */
  var ops=(Array.isArray(d.opciones)?d.opciones:[]).filter(function(o){ return o && typeof o==="object" && String(o.nombre||"").trim(); });
  var preg=String(d.pregunta||"").trim(), rec=String(d.recomendacion||"").trim();
  if(!preg && !rec && !ops.length) return null;
  return {pregunta:preg, recomendacion:rec, opciones:ops, respuesta:(d.respuesta && String(d.respuesta.t||"").trim())?d.respuesta:null};
}
function sabemos273(t){
  var s=t && t.sabemos, L=[];
  var limpia=function(x){ return String(x||"").replace(/^\s*(?:[-•*·]|\d+[.)])\s*/,"").replace(/\s+/g," ").trim(); };
  if(typeof s==="string") s.split(/\n+|\s+•\s+/).forEach(function(r){ var x=limpia(r); if(x) L.push({t:x, tipo:""}); });
  else if(Array.isArray(s)) s.forEach(function(r){
    if(typeof r==="string"){ var x=limpia(r); if(x) L.push({t:x, tipo:""}); return; }
    if(r && typeof r==="object"){ var y=limpia(r.t||r.texto||r.txt); if(!y) return;
      var tp=_n179(String(r.tipo||r.k||"")); L.push({t:y, tipo:/descart/.test(tp)?"descartado":(/decisi|decid/.test(tp)?"decision":(/cifra|monto|numero|dato/.test(tp)?"cifra":(/idea/.test(tp)?"idea":""))), por:limpia(r.por_que||r.porque||r.motivo)}); } });
  return L;
}
function quienPaso(de, tx){
  var d=dueno263(de); if(!d && tx) d=infiereDe(tx);
  if(d==="yo") return "Tú";
  if(d==="claude") return "Claude";
  if(d==="otro" && de) return nombreCorto(de).split(" ")[0];
  if(d==="otro"){ var m=String(tx||"").match(/\b[Ee]spera(?:ndo)?\s+(?:respuesta\s+)?(?:de\s+|a\s+)?([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)/); return m?m[1]:""; }
  return "";
}
function vamos273(t){
  var R=(t.resumen && typeof t.resumen==="object")?t.resumen:{}, tx="", quien="", f="";
  var L=pasos263(t).filter(function(p){ return !p.hecho; });
  if(L.length){ var p=L[0]; tx=p.tx.replace(/[.\s]+$/,"")+(p.nota?" ("+p.nota+")":""); quien=quienPaso(p.de, p.tx); f=p.fecha||fechaEnTexto263(p.tx)||""; }
  else { var qt=String(R.que_toca||"").replace(/\s+/g," ").trim();
    if(qt && !/·\s*hecho\s*$/i.test(qt) && !/\bya se confirm/i.test(qt)){ tx=qt; quien=quienPaso("", qt); f=fechaEnTexto263(qt)||""; } }
  if(tx && !f && _fReal(t.f_vigente||"") && !t.indefinida) f=t.f_vigente;
  return {tx:tx, quien:quien, fecha:f};
}
function vCapaVamos(t){
  var v=vamos273(t);
  if(!v.tx) return '<section class="cp273 cp273v" id="cp273v"><h4>En qué vamos</h4>'+vResumen(t)+'</section>';   /* sin siguiente paso: el resumen de siempre */
  var meta=[v.quien?'<span class="cp273w">'+esc(v.quien==="Tú"?"Te toca a ti":(v.quien==="Claude"?"Lo lleva Claude":"Espera a "+v.quien))+'</span>':'',
            v.fecha?'<span class="cp273f">'+ico("cal",13)+esc(fechaChip(v.fecha)||fechaMovCorta(v.fecha))+'</span>':''].filter(Boolean).join("");
  /* el resumen de siempre (texto, acuerdos, act. hh:mm) va completo debajo, plegado en "Ver resumen"; su "Qué toca" ya es la línea de arriba */
  var res=vResumen(t).replace(/<details class="rsm246"><summary>ver resumen<\/summary>([\s\S]*?)<\/details>/, "$1"), det=/class="rtx"|class="racu"/.test(res);
  return '<section class="cp273 cp273v" id="cp273v"><h4>En qué vamos</h4><p class="cp273sig">'+esc(v.tx)+'</p>'+(meta?'<div class="cp273m">'+meta+'</div>':'')+
    (det?'<details class="cp273r"><summary>Ver resumen</summary>'+res+'</details>':'')+'</section>';
}
function vCapaDecide(t){
  var d=decision273(t); if(!d) return (typeof vDecAplicada==="function")?vDecAplicada(t):"";   /* build 283: ya aplicada -> «Aplicado» y lo que cambió */
  var ops=d.opciones, reqs=[], vis={};
  ops.forEach(function(o){ var c=(o.cumple && typeof o.cumple==="object")?o.cumple:{}; Object.keys(c).forEach(function(k){ if(!vis[k]){ vis[k]=1; reqs.push(k); } }); });
  var recN=_n179(d.recomendacion), esRec=function(o){ if(o.recomendada===true) return true; if(ops.some(function(z){ return z.recomendada===true; })) return false; var n=_n179(o.nombre); return !!(n && n.length>=3 && recN.indexOf(n)>=0); };
  var tabla="";
  if(ops.length){
    var th='<tr><th></th>'+ops.map(function(o){ return '<th class="'+(esRec(o)?'rec':'')+'">'+esc(o.nombre)+'</th>'; }).join("")+'</tr>';
    var filas=reqs.map(function(k){ return '<tr><td class="rq">'+esc(k)+'</td>'+ops.map(function(o){ var c=(o.cumple||{})[k], cls=esRec(o)?' rec':'';
      return c===true?'<td class="si'+cls+'" aria-label="Cumple">✓</td>':(c===false?'<td class="no'+cls+'" aria-label="No cumple">✕</td>':'<td class="nd'+cls+'">–</td>'); }).join("")+'</tr>'; }).join("");
    var hayP=ops.some(function(o){ return o.precio!=null && String(o.precio).trim(); });
    var fp=hayP?'<tr class="pr"><td class="rq">Precio</td>'+ops.map(function(o){ return '<td class="'+(esRec(o)?'rec':'')+'">'+esc(String(o.precio==null?"–":o.precio))+'</td>'; }).join("")+'</tr>':'';
    var hayL=ops.some(function(o){ return /^https?:\/\//i.test(String(o.link||"")); });
    var fl=hayL?'<tr class="lk"><td class="rq"></td>'+ops.map(function(o){ var l=String(o.link||""); return '<td class="'+(esRec(o)?'rec':'')+'">'+(/^https?:\/\//i.test(l)?'<a href="'+esc(l)+'" target="_blank" rel="noopener">Ver ›</a>':'')+'</td>'; }).join("")+'</tr>':'';
    tabla='<div class="cp273t"><table>'+th+filas+fp+fl+'</table></div>';
  }
  var bor=((window.__dec273||{})[t.id])||"";
  var caja=d.respuesta
    ? '<div class="cp273ok pend283">'+ico("reloj",15)+'<span>Contestaste: «'+esc(d.respuesta.t)+'». Pendiente de aplicar · Claude lo está aplicando…</span><button class="cp273cam" data-dec273="otra">Cambiar</button></div>'
    : '<div class="cp273c"><textarea id="dec273t" rows="1" placeholder="Contesta aquí o dicta" enterkeyhint="send" autocapitalize="sentences">'+esc(bor)+'</textarea>'+
        '<button class="cp273b" id="dec273m" aria-label="Dictar la respuesta">'+ico("mic",22,1.7)+'</button>'+
        '<button class="cp273b env" id="dec273e" aria-label="Enviar la respuesta">'+ico("sube",19,2.2)+'</button></div>';
  return '<section class="cp273 cp273d" id="cp273d"><h4>Decide tú</h4>'+
    (d.pregunta?'<p class="cp273q">'+esc(d.pregunta)+'</p>':'')+
    (d.recomendacion?'<div class="cp273rec"><b>Recomiendo</b><span>'+esc(d.recomendacion)+'</span></div>':'')+
    tabla+caja+'</section>';
}
function vCapaSabemos(t){
  var L=sabemos273(t); if(!L.length) return "";
  var MAX=6, li=function(x){ return '<li class="'+(x.tipo||"")+'">'+(x.tipo==="descartado"?'<s>'+esc(x.t)+'</s>'+(x.por?' <span class="pq">— '+esc(x.por)+'</span>':''):esc(x.t)+(x.por?' <span class="pq">— '+esc(x.por)+'</span>':''))+'</li>'; };
  var ab=!!((window.__sab273||{})[t.id]), vis=ab?L:L.slice(0,MAX);
  return '<section class="cp273 cp273s" id="cp273s"><h4>Lo que sabemos</h4><ul>'+vis.map(li).join("")+'</ul>'+
    (L.length>MAX?'<button class="cp273mas" data-sab273="1">'+(ab?'Ver menos':'Ver '+(L.length-MAX)+' más')+'</button>':'')+'</section>';
}
function vCapas(t){
  return '<div class="cp273w4">'+vCapaVamos(t)+vCapaDecide(t)+vCapaSabemos(t)+'<div class="cp273h" id="cp273h">Plática</div></div>';
}
/* ¿se pliega este mensaje? archivado:true y no reciente */
function archivado273(x){ return !!(x && x.archivado===true && !(x.ts && Date.now()-(+x.ts)<ARCH273_RECIENTE)); }
function vPlegado(t, n){
  var ab=!!((window.__arch273||{})[t.id]);
  return '<button class="ar273" data-ar273="1" aria-expanded="'+(ab?'true':'false')+'">Plática anterior ('+n+') '+(ab?'▾':'▸')+'</button>';
}
/* contestar la decisión ahí mismo: la respuesta va al hilo (nota para Claude) y queda en t.decision.respuesta */
function contestaDecision(t, v){
  v=String(v||"").replace(/\s+/g," ").trim(); if(!v || !t || !t.decision) return false;
  msg(t,"bo",v); var m=t.msgs[t.msgs.length-1]; m.de=yo; m.canal="priv:"+yo; m.nota_claude=1; m.resp_decision273=1;
  if(t.decision.pregunta) m.cita_decision273=String(t.decision.pregunta).slice(0,200);
  t.decision.respuesta={t:v, ts:Date.now(), de:yo||""};
  t.notas_claude=(t.notas_claude||[]).concat([{t:"Respuesta a la decisión «"+String(t.decision.pregunta||"")+"»: "+v, ts:Date.now()}]).slice(-30);
  if(window.__dec273) delete window.__dec273[t.id];
  try{ hist240("Contestó la decisión: "+v, t, null); }catch(e){}
  /* build 283: queda de encargo (la Mac 18z38 la aplica si la app no puede) y el clasificador rápido la aplica en el acto (2-3 s) */
  delete t.decision.aplicado38; var _enc283=null; try{ _enc283=ordenPendiente(t, v, "respuesta_decision", "decision_resp"); if(_enc283) _enc283.resp_ts=t.decision.respuesta.ts; }catch(e){}
  /* build 284: la fila del home dice «Aplicando…» mientras corre y «Pendiente de aplicar» si no se pudo */
  var _tid284=t.id, _rts284=t.decision.respuesta.ts; window.__dec284=window.__dec284||{}; window.__dec284[_tid284]={st:"aplicando", resp_ts:_rts284};
  guarda(t); render(); toast("Entendido, lo aplico…");
  try{ clasificaDecision(t, v, _enc283, function(ok){ var m=(window.__dec284||{})[_tid284]; if(m && m.resp_ts===_rts284) m.st=ok?"hecho":"fallo"; try{ if(vista==="lista") render(); }catch(e){} }); }
  catch(e){ var m0=(window.__dec284||{})[_tid284]; if(m0) m0.st="fallo"; }
  return true;
}
function bindCapas(t){
  var ar=document.querySelectorAll("[data-ar273]");
  Array.prototype.forEach.call(ar, function(b){ b.onclick=function(ev){ ev.stopPropagation(); window.__arch273=window.__arch273||{}; window.__arch273[t.id]=!window.__arch273[t.id]; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-sab273]"), function(b){ b.onclick=function(ev){ ev.stopPropagation(); window.__sab273=window.__sab273||{}; window.__sab273[t.id]=!window.__sab273[t.id]; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-dec273="otra"]'), function(b){ b.onclick=function(ev){ ev.stopPropagation(); if(t.decision){ delete t.decision.respuesta; guarda(t); } render(); setTimeout(function(){ var x=$("dec273t"); if(x) x.focus(); }, 30); }; });
  var ta=$("dec273t"); if(!ta) return;
  window.__dec273=window.__dec273||{};
  var tid=t.id, px={ get value(){ return window.__dec273[tid]||""; }, set value(s){ window.__dec273[tid]=s; var e=$("dec273t"); if(e && e.value!==s) e.value=s; },
    style:{}, scrollHeight:0, focus:function(){ var e=$("dec273t"); if(e) e.focus(); } };
  ta.oninput=function(){ window.__dec273[tid]=ta.value; };
  var manda=function(){ var e=$("dec273t"), v=(e?e.value:"")||window.__dec273[tid]||""; if(window.__oyendo){ try{ paraDictadoHilo(); cierraDictado(); }catch(er){} }
    var T=tareas.filter(function(x){ return x.id===tid; })[0]; if(!String(v).trim()){ if(e) e.focus(); return; } contestaDecision(T||t, v); };
  ta.onkeydown=function(ev){ if(ev.key==="Enter" && !ev.shiftKey){ ev.preventDefault(); manda(); } };
  var be=$("dec273e"); if(be) be.onclick=function(ev){ ev.stopPropagation(); manda(); };
  var bm=$("dec273m"); if(bm) bm.onclick=function(ev){ ev.stopPropagation(); arrancaDictadoRev(bm, px); };
}
/* build 273: la ficha roja "Falta" SIEMPRE abre el cuestionario. Si no hay preguntas precisas (preguntas249), se arma con lo que
   falta (soloMeFalta); lo dictado o escrito con ese bloque abierto completa la tarea (completaRevision), como antes del 255. */
function faltaComoPreg(t){
  var f=[]; try{ if(tipoRevisar(t)==="falta" && !vistaSup(t)) f=soloMeFalta(t); }catch(e){}
  return f.map(function(x){ var s=String(x||"").trim(); return {k:"falta273", q:"Dime "+s+".", ops:[]}; });
}
/* nombre que se puede mostrar: un "nombre" de puro numero se busca en la agenda o en otro mensaje del mismo numero */
function nombreVisible(nom, t){
  var s=String(nom||"").trim(), d=s.replace(/\D/g,"");
  if(!(d.length>=8 && /^[\s+\d()-]+$/.test(s))) return s;
  var fin=function(x){ return String(x||"").replace(/@.*$/,"").replace(/\D/g,""); }, igual=function(a){ return a && (a===d || (a.length>=10 && d.length>=10 && a.slice(-10)===d.slice(-10))); };
  var ag=(window.AGENDA_WA||[]).filter(function(a){ return a && a.nombre && (igual(fin(a.jid)) || igual(fin(a.numero)) || igual(fin(a.tel))); })[0];
  if(ag) return ag.nombre;
  var m=((t&&t.msgs)||[]).filter(function(x){ var nm=_nomWA(x); return nm && !/^[\s+\d()-]+$/.test(nm) && (igual(fin(x.jid)) || igual(fin(x.tel)) || igual(fin(x.wa_tel)) || igual(_telDe(x))); })[0];
  if(m) return _nomWA(m);
  if(!window.AGENDA_WA && !window.__agendaNo){ try{ cargaAgendaWA(function(){ if(vista==="hilo") render(); }); }catch(e){} }
  return "Contacto sin nombre ·"+d.slice(-4);
}
function vHilo(){
  var t=tareas.filter(function(x){return x.id===abierta})[0];
  if(!t){vista="lista";return vLista()}
  window.__g237r={}; window.__dia242=""; try{ aplicaDudasNota(t); }catch(e){}   /* build 237; 242: separadores de día */
  /* si es una REVISION ligada, su hilo es el de la tarea que revisa */
  if(t.revisa_a){
    var _org=tareas.filter(function(x){return x.id===t.revisa_a})[0];
    if(_org) return vRevision(t,_org);
  }
  /* "MUY CARO": pantalla limpia y centrada con las opciones grandes, SIN la ficha
     ni el chat (Salvador 2026-09-04). Se escoge una o se dicta otra. */
  if(negociar && negociar.id===t.id) return vNegociar(t);
  /* salto al siguiente en curso (recordatorio recién eliminado) */
  var _sal=!!(window.__salto && window.__salto.sig===t.id && Date.now()<window.__salto.hasta);
  window.__saltoActivo=_sal; window.__saltoCierre=_sal && window.__salto.tipo!=="alarma";
  var adj=adjuntos(t);
  var h='<div class="top"><button class="iconbtn" id="bback">‹</button>'+
    '<div class="ttl227"><div class="tnm">'+(editaNombre===t.id
      ? '<input id="enom" class="tin" value="" placeholder="'+esc(t.nombre)+'" autocapitalize="sentences" enterkeyhint="done">'
      : '<span class="t uno227'+(t.cierre?" tach":"")+((window.__tit227||{})[t.id]?' full':'')+'" id="tit227" role="button">'+esc(t.nombre)+'</span>')+   /* build 227: una linea; tocar = completo */
    '</div>'+
    /* build 227 (Salvador 16:24): sin el renglon "Tuya · con X, Y +1": lo dice el chip de personas. En la vista supervisor queda "Lo hace X". */
    /* build 233 (Salvador 18:45, opcion A): renglon de propietario en TODAS las vistas. Mia: sin subtitulo. De otro: UNA linea
       "De Manuel" / "De Manuel · sup. tú" / "De Manuel · sup. Carlos" (solo primer nombre; nunca salta de renglon). */
    (propietario233(t)?'<div class="d own233">'+esc(propietario233(t))+'</div>':'')+
    '</div>'+
    '<div class="grow"></div>'+
    /* build 233: audifono (lo pone leeExtras) · clip SOLO si hay archivos, con la cantidad en azul · ⋯ siempre. Sin fondo ni borde. */
    (adj.length?'<button class="iconbtn hb233" id="bgal" aria-label="Archivos de esta tarea">'+ico("clip",20,1.5)+
       '<span class="cnt cnt233">'+adj.length+'</span></button>':'')+
    vUndoIco(t)+   /* build 278: ↩ deshace lo último en esta tarea (solo si hay algo) */
    '<button class="iconbtn hb233" id="bmenu" aria-label="Qué hago con esta tarea">'+ico("more",22)+'</button>'+
    '</div>'+vUndoLinea(t)+
    /* TODO LO QUE NO ES RESPUESTA DEL DÍA VIVE AQUÍ. Nadie lo usa a diario,
       así que no merece lugar permanente en la pantalla. */
    (menuOpen?'<div class="hoja"><button class="hop" data-mn="renombrar">Cambiar nombre</button>'+
      '<button class="hop" data-mn="encargar">Pedirle a alguien que lo haga</button>'+
      '<button class="hop" data-mn="fecha">Mover la fecha</button>'+
      '<button class="hop" data-mn="enlazar">Vincular a otra tarea</button>'+
      '<button class="hop" data-mn="nose">Esto ya no se va a hacer</button>'+
      (PERSONAS[yo].jefe?'<button class="hop" data-mn="pasar">Pasársela a alguien definitivamente</button>':'')+
      '<button class="hop" data-mn="lectura">Ajustar lectura</button>'+
      '<button class="hop x" data-mn="cerrar">Cancelar</button></div>':'');
  if(vista==="galeria"){
    if(!adj.length) return h+'<div class="scroll"><div class="gal"><h2>Archivos de esta tarea</h2>'+
      '<p style="color:var(--ink-3);font-size:18.2px;line-height:1.6;margin:0">Todavía no hay ninguno.<br>'+
      'Las fotos y comprobantes que se suban aquí se van a ir juntando en esta pantalla, por fecha.</p></div></div>';
    /* MÁS RECIENTE ARRIBA (adj viene de viejo a nuevo, se recorre al revés).
       El data-gi apunta al índice real en adj para que el visor abra el correcto. */
    var _ims=adj.filter(function(f){return f.img;});
    var orden=adj.map(function(f,i){return i}).reverse();
    /* build 204: presion larga = seleccionar; luego Apartar / Copiar a otra tarea */
    var _gs=(window.__galSel && window.__galSel.tid===t.id)?window.__galSel:null, _ns=_gs?Object.keys(_gs.sel).length:0;
    var _gh=_gs?'<div class="galsel"><button class="gsx" id="gsx" aria-label="Cancelar">✕</button><b>'+_ns+' seleccionado'+(_ns===1?'':'s')+'</b>'+
        '<button class="gsb" id="gsapa"'+(_ns?'':' disabled')+'>'+ico("caja",18,1.7)+'Apartar</button>'+
        '<button class="gsb" id="gscop"'+(_ns?'':' disabled')+'>'+ico("copia",18,1.7)+'Copiar a otra tarea</button>'+
        '<button class="gsb rojo" id="gsdel"'+(_ns?'':' disabled')+'>'+svgBasura()+'Eliminar</button></div>'
      :'<h2>Archivos de esta tarea · '+adj.length+'</h2><p class="galtip">Deja presionado uno para seleccionar varios.</p>';
    return h+'<div class="scroll"><div class="gal'+(_gs?' selmodo':'')+'">'+_gh+'<div class="galgrid">'+
      orden.map(function(i){var f=adj[i], _on=_gs&&_gs.sel[f.ref]?' sel':'', _gk=' data-gk="'+esc(f.ref||"")+'"';
        if(f.img) return '<figure class="gfig'+_on+'"'+_gk+'><img src="'+esc(f.data||f.url)+'" data-gi="'+_ims.indexOf(f)+'" alt="'+esc(f.de)+'"><span class="gchk">✓</span>'+
          '<figcaption>'+esc(f.de)+'<br>'+(f.ts?fechaCorta(new Date(f.ts)):'')+'</figcaption></figure>';
        var ext=(String(f.nombre||"").split(".").pop()||"").toUpperCase().slice(0,4)||"DOC";
        return '<figure class="gfig'+_on+'"'+_gk+'><a class="gdoc" href="'+esc(f.url)+'" target="_blank" rel="noopener"><span>'+esc(f.aud?"AUDIO":ext)+'</span><small>'+esc(String(f.nombre||"").slice(0,40))+'</small></a><span class="gchk">✓</span>'+
          '<figcaption>'+esc(f.de)+'<br>'+(f.ts?fechaCorta(new Date(f.ts)):'')+'</figcaption></figure>';
      }).join("")+
      '</div></div></div>';
  }
  /* LA FICHA GRIS — resumen clave, SIEMPRE desplegada (Salvador 2026-09-04).
     Deja fijo lo importante (sobre todo el MONTO) aunque el chat crezca: así una
     autorización nunca se decide con un precio que se fue para arriba. */
  var esMoney=/\d/.test(t.gasto||"") && !/no\s*gasta/i.test(t.gasto||"");
  var top = esMoney ? 'Autorización · <b>'+esc(t.gasto)+'</b>'
                    : 'Cierra con: <b>'+esc(t.cierra||"—")+'</b>';
  var frows='';
  function _fr(k,v){ if(v&&String(v).trim()) frows+='<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>'; }
  if(esMoney) _fr("Monto", t.gasto);
  _fr("Concepto", t.revisar||t.nombre);
  _fr("Cierra con", t.cierra);
  if(t.f_vigente && !t.es_recordatorio) _fr("Para", fechaBonita(t.f_vigente));
  _fr("Ritmo", t.ritmo);
  if(t.revisa_ext) _fr("Lo hace", t.revisa_ext+(t.duenio===yo?" · tú supervisas":""));
  if(t.seg_a && t.seg_a.contacto) _fr("Seguimiento a", t.seg_a.contacto+(t.seg_a.cada?" · "+t.seg_a.cada:"")+(t.seg_a.hora?" · "+t.seg_a.hora:""));
  _fr("Se comparte con", _compartirLista(t).map(function(c){ return c.nombre; }).join(" · "));
  /* los recordatorios YA NO se listan aquí: viven en el relojito y su hoja
     "Recordatorios de esta tarea" (Salvador 2026-09-18). */
  /* QUIÉN SE LA ASIGNÓ — Salvador 2026-09-04. Solo si se la mandó ALGUIEN MÁS:
     si el dueño la abrió él solo, no se dice nada (ya sabe que es suya). Sirve
     para legitimar: quien ve que la tarea se la encargó el jefe o el arquitecto,
     ya no cuestiona el gasto ni la iniciativa. Va aquí, en la ficha, para no
     ensuciar la pantalla. */
  if(t.creada_por && t.creada_por!==t.duenio && PERSONAS[t.creada_por])
    _fr("Asignada por", PERSONAS[t.creada_por].nombre);
  /* build 195: un renglon: chip de fecha + ▾. Sin resumen debajo. El ▾ abre "Creada con" + Contexto. */
  var _ch=chipEncabezado(t);
  /* build 225: chips en una linea (cada uno abre su hoja) + "Resumen vivo · Claude". El ▾ y su detalle viven en ⓘ Detalles */
  h+=chipsTarea(t);   /* build 228/230: una fila de fichas; el resumen vive en la vista Importante */
  h+=vHecho(t);   /* build 238: Hecho / Me falta */
  h+=vCondicional(t);   /* build 250: Esperando respuesta de A → confirmar a B */
  if(tipoRevisar(t)==="falta" && !vistaSup(t) && esIA(t)) h+=vTipoToggle(t);   /* build 240: solo las que creó la IA */   /* build 236: lo primero que se ve, justo debajo de las fichas */
  /* build 228: el renglon "Agendado ✓ · Calendario…" ahora es la ficha "Agendado" (lineaAgenda queda para otras vistas) */
  h+=vQuienDudas(t)+vBorradorMsj(t);   /* build 266: DECIDE (meta / dato) ya no son fichas de botones: van como pregunta en texto (registroPreg) */
     /* build 225: mensaje por confirmar; "Se comparte con" va en 👥 */   /* build 221; 222: decisión de meta atrasada */

  /* Si esta tarea es MI REVISION de algo que ejecuta otro, aqui va el acceso
     directo a su tarea: ahi vive su evidencia. Salvador 2026-09-04. */
  if(t.revisa_a || (t.revisa_ext && !vistaSup(t))){   /* build 224: en la vista supervisor "Lo hace X" va en el encabezado */
    var org=t.revisa_a ? tareas.filter(function(x){return x.id===t.revisa_a})[0] : null;
    if(org){
      var qn2=PERSONAS[org.duenio]?PERSONAS[org.duenio].nombre:"";
      h+='<button class="verorig" id="bverorig"><span class="g2"><b>Ver la tarea de '+esc(qn2)+'</b>'+
         '<span class="s2">'+esc(org.nombre)+' · '+esc(estadoReal(org)==="cerrada"?"ya la cerró":"sigue abierta")+'</span></span>'+
         '<span class="ch2">›</span></button>';
    }else if(t.revisa_ext){
      h+='<button class="verorig"><span class="g2"><b>Lo hace '+esc(t.revisa_ext)+'</b>'+
         '<span class="s2">No está en la app · el seguimiento es tuyo</span></span></button>';
    }else{
      /* la tarea que revisabas ya no está: se dice, no se calla */
      h+='<button class="verorig"><span class="g2"><b>La tarea que revisabas ya no está</b>'+
         '<span class="s2">La borraron o se perdió · esta revisión quedó suelta</span></span></button>';
    }
  }

  var m=lineaOrigen(t, "orgn ench");   /* build 204: de donde nacio, antes del primer mensaje */
  /* build 197: Importante | Todo. En Todo se ve todo desplegado; en Importante los avisos viejos de un tema no salen */
  if(window.__visitaDe!==t.id){ window.__visitaDe=t.id; window.__visitaIni=Date.now(); }
  var _mf225=filtroMeta(t);
  var _pq227=-1; try{ var _pp227=preguntaParaMi(t); if(_pp227 && !min225(t.id,"pt")) _pq227=_pp227.ix; }catch(e){}   /* build 227: OK·Mover·Nueva van en la tarjeta */
  var _v230=vista230(t);   /* build 230: Importante / Claude */
  var _todo=modoChat(t)==="todo", _rmp=_todo?{set:{}}:avisosReemplazados(t), _vistoNuevo=false, _ocultos=0, _visibles=0;
  var _plg=_todo?{set:{},ult:-1,n:0}:avisosPlegados(t), _cn=canalActual(t),
      _pln=notasPlegadas(t, _todo || !!(window.__ncExp&&window.__ncExp[t.id]), window.__visitaIni, Date.now()),
      _pls=avisosSistemaPlegados(t, _todo || !!(window.__sisExp&&window.__sisExp[t.id]));
  /* build 186: cada foto subida desde la app va en SU lugar del chat (por hora), no amontonada al final */
  var _evs=(t.evidencias||[]).filter(function(f){ return f && !f.eliminado; }).sort(function(a,b){return (a.ts||0)-(b.ts||0)}), _evI=0;
  function _evHasta(ts){ while(_evI<_evs.length && (ts===Infinity || (_evs[_evI].ts||0)<=ts)){ var f=_evs[_evI++];
    var _hh=""; try{ _hh=f.ts?hhmm(new Date(f.ts)):""; }catch(e){}
    if(_v230==="claude") continue;
    m+='<div class="fot fotin"><img src="'+f.data+'" alt="evidencia"><span class="fh">'+esc(((f.de&&PERSONAS[f.de])?PERSONAS[f.de].nombre+" · ":"")+_hh)+'</span></div>'; } }
  /* build 224: notas del campo "notas" (nota_privada del conector/Mac): en su lugar por hora; las privadas solo para Salvador */
  var _nts=(Array.isArray(t.notas)?t.notas:[]).filter(function(n){ return n && String(n.t||"").trim() && !n.oculto && (!n.privado || yo==="salvador"); }).sort(function(a,b){ return (a.ts||0)-(b.ts||0); }), _ntI=0;
  function _ntHasta(ts){ while(_ntI<_nts.length && (ts===Infinity || (_nts[_ntI].ts||0)<=ts)){ var n=_nts[_ntI++];
    if(_v230==="claude" || (_v230==="imp" && !esImp(t, {id:n.id||n.nid, ts:n.ts, t:n.t, nota_ia:1}))) continue;   /* 230: las notas automaticas no van en Claude; en Importante solo si estan en msg_imp */
    m+='<div class="b bi bnota'+(n.privado?' priv':'')+'">'+esc(sinEmojiUI(n.t))+'<span class="st">'+esc((n.h||"")+(n.privado?" · solo tú":""))+'</span></div>'; } }
  var _fc244={};   /* build 244: fotos que ya fueron en el globo de otra */
  var _nAr273=0, _abAr273=!!((window.__arch273||{})[t.id]), _TK273='\u0001AR273\u0001';
  function _ar273(x){ if(!archivado273(x)) return false; _nAr273++; if(_nAr273===1) m+=_TK273; return !_abAr273; }
  m+=barraLote(t, _cn);   /* build 245: Mover todos / No guardar todos cuando el filtro está en una persona */
  (t.msgs||[]).forEach(function(x,ix){
    if(x && x.ts){ _evHasta(x.ts); _ntHasta(x.ts); }
    if(_fc244[ix]) return;
    if(x && x.k==="bi" && !x.wa_in && /^Foto guardada( con ubicaci[oó]n)?\.?$/.test(String(x.t||"").trim())) return;   /* build 186: paja */
    /* build 195: "Resumen:", "Se cierra con:" y "La abriste dictando" ya no van en el chat: estan en el ▾ */
    if(x && x.k==="bi" && !x.wa_in && !x.wa_c && /^(Resumen:|Se cierra con:|La abriste dictando:)/.test(String(x.t||"").trim())) return;
    if(ix===0 && x && x.k==="bi" && x.hab) return;   /* el dictado largo con el que nacio (burbuja "Resumen:") tambien va en el ▾ */
    /* build 187 (Salvador 08:28): los avisos del programa de la Mac ("Sin confirmación de entrega… tras 2 intentos",
       "NO SALIÓ a…") no ensucian el chat; el estado va en las palomitas del mensaje */
    if(x && x.k==="bi" && /^(?:[^:\n]{1,40}:\s*)?(Sin confirmaci[oó]n de entrega a |NO SALI[OÓ] a )/.test(String(x.t||""))) return;
    var _cx=canalDe(x, t);
    if(_cx.indexOf("dm:")===0 && _cx!=="dm:"+yo && x.de!==yo && !(PERSONAS[yo]&&PERSONAS[yo].jefe)) return;  /* lo privado de otros no se pinta */
    if(_cx.indexOf("priv:")===0 && _cx!=="priv:"+yo) return;                 /* build 179: nota de Claude solo para quien contesto */
    if(_cx==="sup" && !soySupervisor(t) && x.de!==yo) return;                /* build 179: notas de supervisor, el dueño no las ve */
    if(!msgEnCanal(x,_v230?"todo":_cn.id,t)) return;   /* build 238: Importante y Claude miran TODOS los canales (con el 235 arrancaba filtrado por la persona) */
    if(x && x.eliminado) return;   /* build 215: archivo eliminado: no sale en ningun lado */
    if(x && x.oculto) return;      /* build 225: oculto (movido a otra tarea u ocultado): no se pinta, sigue en los datos */
    if(_mf225 && metaDeMsg(t,x)!==_mf225) return;   /* build 225: filtro por meta */
    if(x.res238) return;                                 /* build 238: la respuesta larga no se repite (va en la tarjeta); el dictado sí queda */
    var _exAr=false; if(_v230!=="claude" && archivado273(x)){ if(_ar273(x)) return; _exAr=true; }   /* build 273: plática anterior (archivado:true) plegada; abierta, se ve completa */
    /* build 242: lo que escribió la IA (aunque venga con otro autor) es nota gris de Claude; nunca en Importante. Si trae el texto
       original entre comillas, ese original es el globo de la persona (y sí puede salir en Importante). */
    if(esNotaIA(x)){ var _or242=originalDe(x);
      if(_v230==="claude") return;
      if(_or242){ _visibles++; m+=sepDia(x)+'<div class="b bi orig242" data-mix="'+ix+'"><b class="cn">'+esc(nombreCorto(partesMsg(x).de).split(" ")[0])+':</b> '+esc(_or242)+'<span class="st">'+icoCl(t,x,ix)+'</span></div>'; }
      if(_v230==="imp" && !_exAr) return;
      if(!_or242) _visibles++;
      m+=(_or242?'':sepDia(x))+vNotaIA(x, t.id+"|"+ix); return; }
    if(_v230==="imp" && !esImp(t,x) && !_exAr) return;        /* build 230: solo lo importante */
    if(_v230==="claude" && !esClaude(x)) return;    /* build 230: solo lo que le pediste a Claude y lo que contesto */
    if(!_v230 && !_exAr && !esImportante(x, ix, _rmp)){ _ocultos++; return; }   /* build 197: aviso reemplazado por uno mas nuevo del mismo tema */
    if(x.nota_claude && x.k!=="bo" && !x.visto_ts && !_pln.set[ix]){ x.visto_ts=Date.now(); _vistoNuevo=true; }   /* build 197: ya la viste */
    /* build 193 (F36): las notas/indicaciones a Claude y sus respuestas se pliegan en un renglon */
    /* build 198 (Salvador 12:55): lo que se oculta NO deja renglon "N … · ver": en Importante simplemente
       no sale (indicaciones viejas, avisos del sistema, avisos de seguimiento atendidos); en Todo sale todo */
    if(!_v230 && !_exAr && (_pln.set[ix] || _pls.set[ix] || _plg.set[ix])){ _ocultos++; return; }
    _visibles++;
    m+=sepDia(x);   /* build 242: separador de día estilo iMessage, solo cuando cambia el día */
    var q=autorMsg(x,t);
    if(x.hab){ m+=burbujaHablada(x, (q||""), t.id+"|"+ix); return; }
    if(esFoto(x)){
      var _g244=grupoFotos(t, ix, function(z, jz){ return canalDe(z,t)===_cx && msgEnCanal(z,_v230?"todo":_cn.id,t) && !(_mf225 && metaDeMsg(t,z)!==_mf225) &&
        (_v230==="imp"?esImp(t,z):(_v230==="claude"?esClaude(z):esImportante(z, jz, _rmp))); });
      _g244.forEach(function(i){ if(i!==ix) _fc244[i]=1; });
      m+=vFotos(t, _g244, t.id+"|"+ix); return; }
    var meta=(q?esc(q)+" · ":"")+esc(x.h)+(x.wa_auto?" · → "+esc(String(x.wa_auto).split(" ")[0])+" por WhatsApp":"")+(_cx.indexOf("dm:")===0?" · privado":"")+(x.nota_mia?" · nota para ti":"")+(x.wa_eq&&x.wa_eq.length?" · por WhatsApp a "+esc(x.wa_eq.map(function(c){ return String(c).split(" ")[0]; }).join(" y ")):"");   /* build 216/217 */
    /* Salvador 2026-09-22: el ULTIMO mensaje mio trae un botecito 5 minutos,
       por si se subio mal y era otra cosa. Se borra sin preguntar. */
    var undo=(x.k==="bo" && ix===(t.msgs.length-1) && x.ts && (Date.now()-x.ts)<5*60000 && (!x.de||x.de===yo));
    /* build 189 (Salvador 08:48): si va por WhatsApp, el bote solo vive los 30 s antes de que salga */
    if(x.k==="bo" && x.wa_auto){ undo=(typeof enEspera==="function") && enEspera(t.id, x.t); }
    var waCan=(x.wa && x.wa_pid && !x.wa_can && x.ts && (Date.now()-x.ts)<10*60000);
    /* build 148 (Salvador 2026-09-28): mensajes de IA con análisis guardado (súper-
       revisión de vigencia, cita textual, etc. — lo llena el trabajador de WhatsApp)
       traen un iconito ⓘ; al picarlo despliega ese análisis SIN ensuciar el mensaje
       normal. Si no hay x.analisis, no aparece nada — cero cambio visual de por sí. */
    var tieneAn=(x.k==="bi" && x.analisis);
    /* build 199: mensaje PROGRAMADO: reloj + "Programado · lun 5 oct 8:00 → Carlos"; tocar = Cancelar (antes de que salga) */
    if(x.prog){
      var _pc=x.prog, _pend=!_pc.cancelado && !_pc.error && (!_pc.a_las || _tsDe(_pc.a_las.fecha,_pc.a_las.hora)>Date.now());
      m+='<div class="b bi bprog'+(_pc.cancelado?' cancel':'')+'" data-mix="'+ix+'"'+(_pend?' data-progc="'+ix+'"':'')+'><span class="pgh">'+ico("reloj",15,1.9)+
        esc(_pc.cancelado?"Cancelado · no salió":textoProgramado(_pc.a_las,_pc.contacto,_pc.sino))+'</span>'+
        '<span class="pgt">'+esc(quitaEtiquetasWA(_pc.texto))+'</span>'+(_pend?'<span class="pgx">Tocar para cancelar</span>':'')+'</div>';
      return;
    }
    /* build 158 (Salvador 2026-09-30): mensaje de WhatsApp capturado = súper compacto:
       solo "Nombre: texto" y un puntito tenue que despliega el detalle. */
    if(x.k==="bi" && (x.wa_in||x.wa_c||x.origen||x.tipo)){
      var tx=sinEmojiUI(quitaEtiquetasWA(String(x.t||""))), mm=tx.match(/^([^:\n]{1,40}):\s*([\s\S]*)$/);   /* 226: sin emojis */
      var _sal245=esSaliente(x);   /* build 245: lo que mandó Salvador va a la derecha, verde, sin el nombre del otro */
      if(_sal245 && mm && autorSalida(x, mm[1])){ tx=sinEmojiUI(mm[2]); mm=null; }
      var cab=mm?'<b class="cn">'+esc(nombreVisible(nombreLimpio(mm[1]), t))+':</b> '+htmlTx(sinEmojiUI(mm[2]), x):htmlTx(tx, x);
      var dt="";
      if(msgAn[ix]){
        var fd=x.ts?new Date(x.ts).toLocaleString("es-MX",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):(x.h||"");
        var og={wa_entrante:"WhatsApp · entrante",wa_saliente:"WhatsApp · enviado por Salvador",arrastrado:"Arrastrado a mano"}[x.origen]||(x.wa_in?"WhatsApp · entrante":"Capturado");
        dt='<div class="dt">'+esc(fd)+' · '+esc(og)+(x.wa_c?' · '+esc(x.wa_c):'')+(x.chat?' · chat: '+esc(x.chat):'')+
           (x.tipo&&x.tipo!=="texto"?' · '+esc(String(x.tipo).replace("audio_transcrito","audio transcrito")):'')+
           (x.url?' · <a href="'+esc(x.url)+'" target="_blank" rel="noopener">abrir archivo</a>':'')+
           (x.analisis?'<br>'+esc(x.analisis):'')+'</div>';
      }
      var _xc=(_cx.indexOf("ext:")===0)?colorExt(t,_cx.slice(4)):((_cx.indexOf("dm:")===0 && nombreWADe(t,_cx))?CNL_COL.dm:"");
      m+='<div class="b '+(_sal245?'bo':'bi')+' bcomp'+((_xc&&!_sal245)?' ext" style="--xc:'+_xc:'')+'" data-mix="'+ix+'">'+(x.movido_de?'<span class="mvnuevo">NUEVO · movido desde '+esc(tareaCorta({nombre:x.movido_de.nombre||""}))+'</span>':'')+cab+icoCl(t,x,ix)+palomitasHTML(x)+'<button class="mdot" data-an="'+ix+'" aria-label="Ver detalle del mensaje">·</button>'+dt+'</div>'+((_pq227===ix && x.duda_tarea && !x.duda_resuelta)?'':vDudaTarea(t,x,ix));   /* build 226: OK · Mover · Nueva abajo */
      return;
    }
    m+='<div class="b '+(x.k==="bal"?"bal":(x.k==="bo"?"bo":"bi"))+(x.abre?' liga" data-abre="'+esc(x.abre):'')+'" data-mix="'+ix+'">'+(x.movido_de?'<span class="mvnuevo">NUEVO · movido desde '+esc(tareaCorta({nombre:x.movido_de.nombre||""}))+'</span>':'')+citaHTML(x)+htmlTx(sinEmojiUI(quitaEtiquetasWA(x.t)), x)+
       (x.abre?'<span class="abre">Abrir ›</span>':'')+'<span class="st">'+   /* build 242: sin autor ni hora (van en la hoja de detalle) */
       (tieneAn?'<button class="mdel" data-an="'+ix+'" aria-label="Ver cómo se decidió este mensaje">'+ico("info",15,1.8)+'</button>':'')+
       (waCan?'<button class="mdel" data-wacan="'+ix+'" aria-label="Cancelar este WhatsApp">'+ico("trash",15,1.8)+'</button>':'')+
       (undo?'<button class="mdel" data-mdel="'+ix+'" aria-label="Borrar este mensaje">'+ico("trash",15,1.8)+'</button>':'')+
       icoCl(t,x,ix)+palomitasHTML(x)+'</span>'+(tieneAn&&msgAn[ix]?'<div class="dt">'+esc(x.analisis)+'</div>':'')+'</div>'+((_pq227===ix && x.duda_tarea && !x.duda_resuelta)?'':vDudaTarea(t,x,ix));
  });
  if(t.puntos){
    var mk=t.marcados||{}, ft=t.fotos||{}, n=Object.keys(mk).length;
    var items=t.puntos.map(function(p,i){
      var cam=p.foto?'<span class="cm'+(ft[i]?" ok":"")+'">FOTO'+(ft[i]?" ✓":"")+'</span>':'';
      return '<li class="'+(mk[i]?"on":"")+'"><div class="ir">'+
        '<button class="tk" data-tk="'+i+'"><span class="bx">✓</span></button>'+
        '<button class="lb" data-lb="'+i+'"><span class="tx">'+esc(p.t)+'</span>'+cam+
        '<span class="cv">'+(detOpen[i]?"▲":"▼")+'</span></button></div>'+
        (detOpen[i]?'<div class="dt">'+esc(p.d)+'</div>':'')+'</li>';
    }).join("");
    m+='<div class="chk'+(chkCerrado[t.id]?" cl":"")+'"><button class="ch" id="bchk">'+
       '<span class="tt">Rondín</span><span class="cn'+(n===t.puntos.length?" full":"")+'">'+n+' de '+t.puntos.length+'</span>'+
       '<span class="cv">'+(chkCerrado[t.id]?"▼":"▲")+'</span></button><ul>'+items+'</ul></div>';
    var fotosArr=Object.keys(ft).map(function(k){return ft[k]}).filter(function(f){ return f && !f.eliminado; });
    if(fotosArr.length){
      m+='<div class="fot">'+fotosArr.map(function(f){return '<img src="'+f.data+'" alt="evidencia">'}).join("")+'</div>';
    }
  }
  _evHasta(Infinity); _ntHasta(Infinity);
  if(_nAr273) m=m.replace(_TK273, vPlegado(t, _nAr273));
  if(t.evidencias&&t.evidencias.length){
    /* build 183 (Salvador 22:09): sin burbuja de coordenadas/hora; la ubicacion queda guardada en la foto */
  }

  /* Tarjeta de decisión: el jefe ve el resumen Y lo adjunto sin ir a buscarlo.
     Rediseño 2026-09-04 (opción C que escogió Salvador): franja naranja a la
     izquierda, descripción a la izquierda, adjuntos a la DERECHA alineados EXACTO
     con los del chat (el más reciente arriba). */
  if(t.estado==="espera"&&PERSONAS[yo].jefe){
    var ult=(t.msgs||[]).filter(function(x){return x.k==="bo"}).slice(-1)[0];
    var conc=[t.revisar,t.gasto].filter(function(v){return v&&String(v).trim()}).join(" · ");
    var rev=adj.map(function(f,i){return i}).reverse();   /* más reciente arriba */
    var tiras=rev.slice(0,3).map(function(i){
      return '<img src="'+adj[i].data+'" data-ai="'+i+'" alt="adjunto">'; }).join("")+
      (adj.length>3?'<span class="mas">+'+(adj.length-3)+'</span>':'');
    m+='<div class="adj"><div class="dtxt">'+
         '<div class="hh">Esperan tu decisión</div>'+
         (conc?'<div class="dc">'+esc(conc)+'</div>':'')+
         '<div class="sub">'+esc(ult?ult.t:t.ultima||"")+'</div>'+
         (adj.length?'':'<div class="noarch">No mandaron archivo. Si lo necesitas, pídelo abajo.</div>')+
       '</div>'+
       (adj.length?'<div class="dtadj">'+tiras+'</div>':'')+
       '</div>';
  }

  /* ---- DOS BOTONES. NUNCA MÁS. ----
     El tercero se fue el 2026-09-02: "no vino", "no me ha contestado" no son
     información, son la ausencia de que pase algo — y eso ya lo mide el silencio.
     Un botón que significa "no pasó nada" enseña a apretar en vez de a hacer.
     Lo que traía ese botón entra por ESTOY ATORADO, que sí mueve la maquinaria. */
  var sug="";
  if(t.estado==="espera"&&PERSONAS[yo].jefe){
    /* SOLO DOS, mitad y mitad: autorizar, o "muy caro" (abre la pantalla con las
       opciones inteligentes — vNegociar). */
    sug='<button class="op k" data-jr="Autorizo">Autorizo</button>'+
        '<button class="op w" id="bcaro">Muy caro</button>';
  } else if(t.estado==="espera"){
    var qa=quienAutoriza(yo);
    sug='<button class="op" disabled>Esperando a '+esc(PERSONAS[qa.quien].nombre)+'</button>';
  } else if(!t.cierre && estadoReal(t)!=="cerrada" && t.duenio===yo && !esDato(t)){   /* build 195: datos sin campana/Ya está/bote */
    /* orden nuevo (Salvador 2026-09-18): relojito a la izq, "Ya está" a la derecha
       arriba del micrófono. Un recordatorio suelto no lleva "Estoy atorado". */
    var _est=_sal?"gris":estadoRelojito(t);
    var _rel='<button class="op alrm '+_est+'" id="brel" aria-label="Recordatorios">'+ico("bell",22,1.7)+'</button>';
    var _ya='<button class="op ya'+(pasosCompletos(t)?' listo':'')+'" id="bya"><svg class="icx" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg> Ya está</button>';
    /* bote de basura (Salvador 2026-09-22): mismo tamaño que la campana.
       En tarea abre el cierre honesto (motivo) que ya existia en el menu "...".
       En recordatorio suelto solo pide confirmar y lo borra, sin pedir motivo. */
    var _tr='<button class="op del" id="'+(t.es_recordatorio?"btrashrec":"btrash")+'" aria-label="Eliminar">'+ico("trash",22,1.7)+'</button>';
    if(t.es_recordatorio){
      sug=_rel+_ya+_tr;
    } else {
      /* Salvador 2026-09-22: mientras espera nombre+motivo (t.pide_atoro) el
         boton se apaga, para que no de la impresion de que aceptar de nuevo
         hace algo -- ya se le pregunto, esta esperando la respuesta escrita. */
      /* Salvador 2026-09-24: ya no hay boton "Estoy atorado"; el atoro se
         dice hablando ("estoy esperando a Rodrigo") y Claude lo entiende. */
      sug=_rel+_ya+_tr;
    }
  }
  if(vistaSup(t)) sug=sugSup(t);   /* build 224: solo lo que le toca; si nada, "Nada pendiente para ti" */
  var pre=t.pregunta&&t.duenio===yo?'<div class="b bi" style="margin:0 14px 8px">'+esc(t.pregunta)+'</div>':"";

  var _cc=modoClaude(t)?CLAUDE_COL:canalActual(t).col, _conPill=!!(modoClaude(t) || canalActual(t).id!=="todo");
  var _pre179=""; try{ _pre179=(vistaSup(t)?"":vSupervisor(t))+vParaTi(t); }catch(e){ console.warn("paraTi",e); }
  if(_vistoNuevo) setTimeout(function(){ try{ guarda(t); }catch(e){} }, 0);
  var _tgl='<div class="cmodo"><button data-cmodo="importante" class="'+(_todo?'':'on')+'">Importante</button><button data-cmodo="todo" class="'+(_todo?'on':'')+'">Todo</button></div>';
  /* build 198: si en Importante el chat queda vacio, una pista chiquita para que no parezca roto */
  if(_v230==="claude" && !_visibles) m+='<div class="vac230">Aquí sale lo que le pidas a Claude y lo que te conteste.</div>';
  if(!_v230 && !_todo && !_visibles && _ocultos && !(t.evidencias||[]).length) m+='<button class="avfold" data-cmodo="todo">Hay '+_ocultos+' mensaje'+(_ocultos===1?'':'s')+' oculto'+(_ocultos===1?'':'s')+' · Todo</button>';
  m=_v230==='imp'?vCapas(t)+(!_visibles && /res230 (vacio|local240)/.test(vResumen(t))?'<button class="vt235" data-vt235="1">Ver todo</button>':'')+m:m;   /* build 235: sin nada importante ni resumen, "Ver todo" */   /* build 230: Importante arriba con su Resumen; 232: sin el selector "Importante | Todo" (Importante vive en el filtro) */
  return h+(esDato(t)?vDatoCuerpo(t):vDatosTarea(t))+vVuelta(t)+vEntregas(t)+bannerDecision(t)+_pre179+'<div class="scroll'+(_conPill?' cnl" style="--cc:'+_cc:'')+'"><div class="msgs">'+m+pre+'</div></div>'+vTarjetaRev(t)+
    /* LA MISMA BARRA DE TODAS LAS VISTAS — 2026-09-04. Antes el hilo tenia la
       camara a la IZQUIERDA y una flecha de enviar a la derecha, distinto de la
       caratula (camara a la DERECHA, sin flecha). Salvador lo cacho: "tiene que
       ser igual en todas". Ahora es identica: pill (campo + microfono) y la
       camara a la derecha. Se envia con Enter o dictando. */
    '<div class="comp">'+
      (sug?'<div class="sug">'+sug+'</div>':'')+
    '<div class="pie">'+
      '<div class="caja2">'+
        '<button class="mas" id="tcam" aria-label="Agregar foto">'+ico("mas",22,2)+'</button>'+chip254(t)+
        '<div id="txt" class="caja vacia" contenteditable="true" role="textbox" '+
          'data-ph="'+(window.__avAdd===t.id?"Dicta o escribe el recordatorio":(window.__pasoAdd===t.id?"Dicta o escribe el paso nuevo":esc(phCanal(t))))+'" enterkeyhint="send" '+
          'autocorrect="on" autocapitalize="sentences" spellcheck="true"></div>'+
        '<button class="env" id="tenv" aria-label="Enviar">'+ico("sube",21,2.2)+'</button>'+
        '<button class="mic" id="tmic" aria-label="Dictar">'+ico("mic",26,1.7)+'</button>'+
      '</div>'+
    '</div></div>'+
    (alarmaRoja(t)?vAlarmaRoja(t):(window.__avSheet===t.id?vAvisosSheet(t):vHoja(t)));   /* build 225: la hoja del chip */
}
/* build 141 (Salvador 2026-09-25): ALARMA ROJA. Al abrir algo cuya alarma ya
   sono y no se atendio, sale al centro esta tarjeta y NO se quita tocando
   afuera: solo "Eliminar alarma" o "Posponer 1 hora". Mientras esta, la caja y
   el microfono no sirven. Si hay varias rojas, salen una tras otra. */
function vAlarmaRoja(t){
  var a=alarmaRoja(t); if(!a) return "";
  var n=avisosDe(t).filter(avisoVence).length, H=hoy();
  return '<div class="armodal" id="armodal"><div class="arcard" role="alertdialog" aria-modal="true">'+
    '<div class="aric">'+ico("bellr",34,1.9)+'</div>'+
    '<div class="artit">'+esc(a.texto||t.nombre||"Alarma")+'</div>'+
    '<div class="arhora">Sonó '+(a.fecha&&a.fecha!==H?"el "+esc(fechaBonita(a.fecha)):"hoy")+
      (a.hora?" a las "+esc(horaBonita(a.hora)):"")+'</div>'+
    (n>1?'<div class="arn">1 de '+n+' alarmas</div>':'')+
    '<div class="arbtn"><button class="arpos" data-arpos="'+esc(a.id)+'">Posponer 1 hora</button>'+
    '<button class="ardel" data-ardel="'+esc(a.id)+'">Eliminar alarma</button></div></div></div>';
}

function vAdmin(){
  var h='<div class="top"><button class="iconbtn" id="bback">‹</button>'+
    '<div><div class="t">Administración</div><div class="d">Invitaciones y accesos</div></div></div>'+
    '<div class="scroll"><div class="adm">';
  h+=cardAvisos();
  if(PUEDE_ALTA[yo]){
    h+='<h2>Invitar</h2>'+
       '<div class="card"><div class="acts"><button class="mini" id="bliga">Generar liga y copiar</button></div>'+
       '<div class="sm" id="ligaout" style="margin:0;display:none;color:var(--ink)"></div></div>';
  }
  h+='<h2 style="margin-top:18px">Con acceso</h2>'+
     '<div id="lent"><div class="card"><div class="sm">Cargando…</div></div></div>'+
     '<div class="sm" style="text-align:center;color:var(--ink-4);font-size:12px;margin-top:26px">'+
       esc(VERSION_APP.split("·")[0].trim())+'</div>';
  return h+'</div></div>';
}


/* ============ LA BARRA HABLA CON CLAUDE ============
   PEDIDO POR SALVADOR, 2026-09-03, Y ES REGLA SUYA:
   "si no es con Claude no va a jalar bien". Ya lo probo en la app de golf.

   ANTES: la barra corria busca(), un filtro de texto tonto. No sabia crear
   nada, y para dar de alta una tarea habia que ir a otra pantalla.

   AHORA: lo que se dicta o se escribe va INTEGRO a Claude junto con las tareas
   abiertas, y Claude decide una de cuatro cosas:
     BUSCAR     -> filtra la lista con los terminos que Claude entendio
     CREAR      -> abre tarea, PERO antes pasa por el filtro de repetidas
     ENCARGAR   -> solo si YA era tarea suya y pasa la ejecucion. No abre tarea nueva.
     RESPONDER  -> contesta con lo que hay. No inventa: si no esta, lo dice.

   SI CLAUDE NO CONTESTA no se inventa nada: se cae al filtro local y SE AVISA
   en el toast que fue busqueda local, para que nadie crea que Claude respondio. */

var barraEstado=null;   /* {cargando,texto,dicho,ops,pendiente,abrir} */

/* lo que Claude alcanza a ver. Corto a proposito: nombre, de quien, como va.
   NADA de mensajes ni de telefonos: no hacen falta para decidir que hacer. */
/* EL FOLDER COMPLETO DE UNA TAREA — 2026-09-03.
   Esto es lo que le pasamos a Claude SOLO de las tareas relevantes a lo que
   dictaste (nunca de las 120: eso quemaria tokens). Con esto Claude puede:
     - NARRAR el avance fino: en que paso va, que dice la ultima nota, si esta
       detenido y desde cuando, si va a fallar.
     - LIGAR un paso dictado a la tarea correcta.
   NO inventa: solo cuenta lo que hay en este folder. */
function detalleTarea(t, ancho){
  var d={
    id:t.id, nombre:t.nombre,
    de:(PERSONAS[t.duenio]&&PERSONAS[t.duenio].nombre)||t.duenio||"",
    estado:estadoReal(t),
    criticidad:t.criticidad||"normal",
    recuperable:t.recuperable!==false,
    cada:t.periodicidad||"unica",
    nacio:t.f_original||"", vence:t.f_vigente||"", veces_movida:t.movidas||0,
    se_cierra_con:t.cierra||"", asunto:t.revisar||"", gasto:t.gasto||""
  };
  if(t.movimientos && t.movimientos.length)
    d.movidas=t.movimientos.map(function(m){ return {de:m.de, a:m.a, por:m.por, motivo:m.motivo||"sin decir por qué"}; });
  /* build 143: el acuerdo (para contexto y reportes) */
  if(t.acuerdo) d.acuerdo={con:t.acuerdo.con||"", debe:(t.acuerdo.debe==="el"?"la otra persona":"yo"), texto:t.acuerdo.texto||"",
    dicho:t.acuerdo.dicho||"", plazo:t.acuerdo.plazo_fecha||"", salio_de:(t.acuerdo.origen&&t.acuerdo.origen.nombre)||""};
  /* build 144: la lista de pasos, para que Claude conteste "que me falta" */
  if(t.lista_pasos && t.lista_pasos.length)
    d.lista_pasos=t.lista_pasos.map(function(p){ return {que:p.tx, seccion:p.sec||"", nota:p.meta||"", hecho:!!p.hecho}; });
  if(t.pasos && t.pasos.length){
    d.pasos=t.pasos.map(function(p,i){
      return {n:i+1, que:p.t, dia:p.dia, es_donde_va:(i===(t.paso||0))};
    });
    var r=ritmo(t);
    if(r) d.ritmo={paso_actual:r.paso, dias_atrasado:r.atraso, va_a_fallar:!!r.va_a_fallar};
  }
  if(t.detenido){
    d.detenido={espera_a:t.detenido.quien, que_espera:t.detenido.que,
                dias_detenido:diasDetenido(t)};
  }
  var _enc=typeof encargadoDe==="function"?encargadoDe(t):null; if(_enc && _enc.fuente==="encargado" && _enc.id && PERSONAS[_enc.id] && _enc.id!==t.duenio)
    d.delegado_a=_enc.nombre;
  /* Las notas del hilo: de ahi sale "ya localizo al electrico". Para una
     CONSULTA se manda TODO el hilo (ahi vive el dato que preguntan: la
     direccion del hotel, el monto del presupuesto), no solo las ultimas.
     Salvador 2026-09-04. */
  if(t.msgs && t.msgs.length)
    d.notas=(ancho ? t.msgs.slice(-25) : t.msgs.slice(-4)).filter(function(m){ return m && !m.eliminado && !(m.nota_mia && m.de!==yo); }).map(function(m){return m.t});
  /* build 216: tus notas "Para mí" van siempre (aunque sean viejas): son contexto, nunca ordenes */
  var _mias=(t.msgs||[]).filter(function(m){ return m && m.nota_mia && m.de===yo && !m.eliminado; });
  if(_mias.length) d.notas_mias_contexto_no_ordenes=_mias.slice(-10).map(function(m){ return (m.ts?fechaCorta(new Date(m.ts))+": ":"")+m.t; });
  /* Los DOCUMENTOS que trae pegados, por nombre y fecha: asi Claude puede decir
     "el ultimo presupuesto que subio" y señalar cual es. */
  if(ancho){
    var ad=adjuntos(t);
    if(ad.length) d.documentos=ad.slice(-8).map(function(e,i){
      var o={n:i+1, que:e.de||"documento", cuando:(e.ts?fechaCorta(new Date(e.ts)):"")};
      if(e.leido) o.dice=e.leido;     /* lo que se leyó de la imagen */
      return o;
    });
  }
  if(t.cierre) d.cerrada={como:t.cierre.tipo, cuando:t.cierre.f};
  return d;
}

function contextoBarra(completo){
  var abiertas=tareas.filter(estaAbierta)
    .slice(0,120)
    .map(function(t){
      return {id:t.id, nombre:t.nombre, de:t.duenio||"", estado:estadoReal(t),
              fecha:t.f_vigente||"", cada:t.periodicidad||"unica",
              ultima:t.ultima||""};
    });
  /* Salvador 2026-09-22: las cerradas ya no se pintan en el home, asi que
     "que hice / termine / elimine hoy" se contesta de aqui. Por default
     ultimos 7 dias (build 147: "Ver mas" pide completo=true y ya no hay
     tope de dias ni de renglones). */
  var cerradas=tareas.filter(function(t){ return t.cierre && t.cierre.f && (completo || dDif(t.cierre.f,hoy())<=7) })
    .sort(function(a,b){ return String(b.cierre.f).localeCompare(String(a.cierre.f)); })
    .slice(0, completo?400:60)
    .map(function(t){
      /* build 147: las eliminaciones normales (papelera+motivo, no_ejecutada)
         TAMBIEN cuentan como "eliminada" para esta respuesta, sin importar el
         motivo -- no_ejecutada sigue significando lo mismo en el resto de la
         app (semaforo, estadoReal, etc.), esto solo cambia como se narra aqui. */
      return {id:t.id, nombre:t.nombre, de:t.duenio||"", cerrada_el:t.cierre.f,
              como:(t.cierre.tipo==="hecha"?"hecha":"eliminada"),
              es_recordatorio:!!t.es_recordatorio};
    });
  return {yo:yo, soy_jefe:!!(PERSONAS[yo]&&PERSONAS[yo].jefe), hoy:hoy(),
          hoy_es:DIAS_SEM[new Date().getDay()],
          calendario:calendarioProximo(16),
          cerradas_recientes:cerradas,
          cerradas_rango:(completo?"todo el historial":"ultimos 7 dias"),
          censo:(function(){ try{ return censoEjemplos(); }catch(e){ return {}; } })(),
          gente:Object.keys(PERSONAS).map(function(k){
            return {clave:k, nombre:PERSONAS[k].nombre};
          }),
          abiertas:abiertas};
}

var SYS_BARRA =
"Eres el cerebro de Duet, una bitacora de tareas de una oficina chica en Mexico. "+
"Alguien dicto o escribio en la barra. Decide QUE QUISO y contesta SOLO un JSON.\n"+
"CENSO (build 192): en el contexto, 'censo.no_eran_tarea' son cosas que se crearon como tarea y Salvador borro al nacer (NO eran tarea): no vuelvas a crear algo asi sin preguntar. 'censo.vinculaciones' son cosas que se juntaron con una tarea que ya existia: si lo dictado se parece, propon esa tarea.\n"+
"\n=== EL ARBOL. RECORRELO EN ESTE ORDEN, PARATE EN LA PRIMERA QUE PEGUE ===\n"+
"0. ¿Dijo LITERALMENTE que abre o crea una tarea ('abre tarea', 'abreme una "+
"tarea', 'creame una tarea', 'apuntame', 'nueva tarea', 'levanta una tarea')? -> "+
"CREAR, y ya. No sigas bajando el arbol. Aunque el tema se parezca a una tarea que "+
"ya existe, el te esta diciendo que quiere una NUEVA.\n"+
"1. ¿Esta CONTESTANDO una pregunta tuya (hay conversacion previa)? -> junta lo que "+
"ya sabias con lo nuevo y AVANZA a la intencion que ya traias. NUNCA reinicies.\n"+
"2. ¿Esta PIDIENDO UN DATO que ya deberia estar guardado ('cual es la direccion "+
"del hotel', 'cuanto quedo el presupuesto', 'que dijo Karina')? -> RESPONDER.\n"+
"2b. ¿Pregunta que HIZO, TERMINO, EJECUTO, COMPLETO, LOGRO, AVANZO, CERRO, TACHO, "+
"RESOLVIO, como le fue o en que trabajo (hoy/ayer/esta semana/este mes) -- o que "+
"ELIMINO, CANCELO, QUITO, DESECHO, BOTO, saco de la lista o ya no aplica? -> "+
"RESPONDER con la lista 'cerradas_recientes' del contexto ('cerradas_rango' dice "+
"que tanto cubre), filtrada por el dia que pide (cerrada_el) y por 'como': hecha o "+
"eliminada (ya no hay 'cerrada sin hacerse': toda no-hecha se cuenta como eliminada "+
"para esta respuesta, sin importar el motivo). FORMATO OBLIGATORIO en 'respuesta': "+
"DOS LISTAS con salto de linea, la mas reciente primero dentro de cada una, nunca "+
"un parrafo corrido -- 'Hechas hoy:' con las hecha, luego 'Eliminadas hoy:' con las "+
"eliminada (cambia 'hoy' por el dia que pidio); una lista vacia se omite. NUNCA "+
"contestes con las abiertas de hoy: eso es otra pregunta. Si 'cerradas_recientes' "+
"viene vacia para ese dia, di que no hay nada cerrado ni eliminado ese dia.\n"+
"3. ¿Quiere REVISARLE a OTRO algo que ese otro ejecuta? -> SUPERVISAR.\n"+
"4. ¿Habla de una tarea que YA EXISTE en la lista de abiertas?\n"+
"   - le agrega un paso o un avance -> PASO\n"+
"   - le manda un recado a su duenio -> COMENTAR\n"+
"   - la cambia de duenio en definitiva -> REASIGNAR\n"+
"   - solo la quiere ver -> BUSCAR\n"+
"5. ¿Hay algo que HACER y comprobar? -> CREAR (con su duenio y su fecha).\n"+
"6. ¿Solo quiere que le avisen, sin nada que ejecutar? -> RECORDATORIO.\n"+
"7. ¿Te falta algo esencial para lo de arriba? -> PREGUNTA, UNA sola.\n"+
"\n=== LAS TRAMPAS QUE YA HAN FALLADO. LEELAS ANTES DE CONTESTAR ===\n"+
"a) NINGUNA PALABRA CLASIFICA. 'encargale', 'dile', 'recuerdame', 'porfa' se usan "+
"para todo. Deciden los HECHOS: quien va a EJECUTAR, y si la cosa YA EXISTIA como "+
"tarea de alguien en la lista de abiertas que te paso.\n"+
"b) 'Encargale a Karina que deposite la renta' cuando NO existe esa tarea = ES "+
"TAREA DE KARINA -> CREAR con duenio karina. NO es ENCARGAR. ENCARGAR es SOLO "+
"cuando esa tarea YA ERA del que habla y le pasa la ejecucion sin soltarla; si no "+
"ves esa tarea previa en el contexto, NO es encargo.\n"+
"c) 'Abre tarea de X', 'abreme una tarea', 'apuntame', 'creame una tarea' = CREAR. "+
"NUNCA BUSCAR, aunque venga con muchos datos pegados atras.\n"+
"d) 'Es tarea de Karina: sacar copias el jueves' = CREAR con duenio karina. Llena "+
"el cajon 'tarea', no el de 'encargo'. CADA INTENCION LLENA SU PROPIO CAJON: si "+
"contestas CREAR llena 'tarea'; si contestas ENCARGAR llena 'encargo' CON 'para'. "+
"Mandar una intencion con el cajon de junto es un error que rompe el flujo.\n"+
"e0) QUE SE PUEDE PREGUNTAR — LISTA CERRADA. Solo hay CUATRO cosas que cambian "+
"lo que el sistema HACE, y son las unicas que se pueden preguntar:\n"+
"    1. QUE hay que hacer (sin eso no hay tarea)\n"+
"    2. QUIEN lo hace (decide en la lista de quien cae y a quien se corretea)\n"+
"    3. PARA QUE DIA (decide el semaforo, el vencimiento y el escalamiento)\n"+
"    4. CUANTO, y SOLO si hay dinero de por medio (autorizar, comprar, pagar, "+
"depositar): ese monto se le enseña al que autoriza antes de decidir.\n"+
"   TODO LO DEMAS ESTA PROHIBIDO PREGUNTARLO. Prohibido de verdad: la HORA (el "+
"sistema trabaja por DIAS, la hora no la usa para nada — si importara, la "+
"habrian dicho), la marca, el modelo, el material, el color, la cantidad, las "+
"medidas, el proveedor, el numero de cuenta, cual de varios lugares, y "+
"cualquier detalle de como se hace el trabajo.\n"+
"   LA RAZON DE FONDO: ese detalle NO LO SABE el que dicta, lo sabe EL QUE VA A "+
"EJECUTAR. Preguntarle a Salvador cual jardin, cuando el que corta el pasto es "+
"Josue, es preguntarle a quien no tiene la respuesta. Ese detalle se resuelve "+
"solo en el chat de la tarea, entre ellos dos, y ahi queda escrito.\n"+
"   Si algo de eso te lo dijeron, se ANOTA (va en el nombre, en 'gasto' o en "+
"'datos'). Lo que no dijeron, NO SE PREGUNTA.\n"+
"   Y CUANDO LA PREGUNTA SI ES LEGITIMA, NO LE CUELGUES NADA MAS. La pregunta "+
"solo puede traer los huecos de esas cuatro. Ejemplos reales que salieron mal:\n"+
"     'que Karina lave la camioneta' -> falta el dia. Se pregunta SOLO "+
"'¿Para cuando?'. NO '¿Cual camioneta y para cuando?': cual camioneta lo sabe "+
"Karina, que es la que la va a lavar.\n"+
"     'que Josue corte el pasto el viernes' -> no falta nada. CERO preguntas. "+
"NO '¿cual jardin y a que hora?'.\n"+
"   Colgarle un detalle prohibido a una pregunta legitima cuenta igual que "+
"preguntar de mas.\n"+
"e) LA REGLA DE LOS TRES DATOS. Para una tarea lo esencial son TRES: QUE hay que "+
"hacer, QUIEN lo hace y PARA CUANDO. SI YA TIENES LOS TRES, CREA — no preguntes "+
"NADA mas, ni el monto, ni la cuenta, ni el comprobante, ni el detalle fino. Eso "+
"se anota si lo dicen y si no, se pregunta despues, en el chat de la tarea, cuando "+
"toque. Ej: 'encargale a Karina que el lunes deposite la renta del local' ya trae "+
"los tres (depositar la renta / Karina / lunes) -> CREAR, sin una sola pregunta. "+
"Preguntar teniendo los tres cansa igual que preguntar en serie, y es el error que "+
"mas se ha repetido.\n"+
"   El 'cierra con' NO es un cuarto dato obligatorio: sacalo tu del sentido comun "+
"('el comprobante del deposito') y sigue. Solo se pregunta cuando de plano no se "+
"puede saber como se comprueba.\n"+
"f) Los datos duros que vengan en el dictado (montos, direcciones, telefonos, "+
"folios, nombres de proveedor) NO SE PIERDEN: van en 'datos', y el monto ademas "+
"en 'gasto'.\n"+
"TE PASO: la conversacion previa (si ya venias preguntando, el usuario te esta "+
"RESPONDIENDO: junta lo que ya sabias con lo nuevo y AVANZA, no empieces de cero), "+
"el resumen de tareas, y los folders de las que parecen relevantes.\n"+
"SALIDAS:\n"+
"  PREGUNTA   te falta algo esencial. Haz UNA sola pregunta que pida TODO lo que "+
"falta junto, como el juego que adivina con pocas preguntas. Sin preambulo. Ej: "+
"'Depositar el 7' -> titulo 'Depositar...', pregunta '¿Cuanto, a que cuenta y "+
"cuando?'. NUNCA inventes la fecha: si no la dieron, preguntala aqui. Max 2 rondas.\n"+
"  REGLA DURA DE LA PREGUNTA UNICA: NUNCA preguntes en serie (una cosa, y luego "+
"otra). Junta TODOS los huecos en la MISMA pregunta: que es, quien lo va a hacer y "+
"cuando. Ej: 'recuerdame revisar el tema del apagon de la casa' -> UNA pregunta: "+
"'¿Que hay que revisar, quien lo hace y cuando?'. Preguntar primero una cosa y "+
"despues otra es el error que mas molesta.\n"+
"  NO PREGUNTES '¿es tarea o solo recordatorio?' cuando el dictado YA trae un verbo "+
"de accion (revisar, checar, verificar, apretar, llamar, comprar, pagar, arreglar...): "+
"eso SE EJECUTA, o sea es TAREA (o SUPERVISAR si lo ejecuta otro). Esa pregunta solo "+
"cabe si de verdad no hay nada que hacer y podria ser solo un aviso.\n"+
"  CREAR      ya tienes lo esencial para una TAREA (algo que HAY QUE HACER y "+
"comprobar). Duenio = quien dicta, salvo que diga que es de otro ('que Karina...' "+
"-> duenio karina). REGLA DURA DE FECHA: una TAREA SIEMPRE lleva fecha. Si NO te "+
"dieron cuando, NO uses CREAR: usa PREGUNTA '¿para cuando?' y SUGIERE un dia con "+
"criterio (si suena urgente, pronto; si no, unos dias), para que confirme. Nunca "+
"metas la fecha de hoy por no preguntar.\n"+
"  SUPERVISAR el que habla quiere REVISAR algo que VA A EJECUTAR OTRO. Senal: pide "+
"revisar/checar/verificar/estar al pendiente de algo, y el que lo hace es alguien mas. "+
"Ej: 'recuerdame revisar que aprieten los cables de la casa' + 'Chuy lo hace manana'. "+
"Son DOS cosas: la TAREA del que ejecuta, y la REVISION del que habla. Llena "+
"'supervisar': 'que' (lo que se revisa, infinitivo), 'ejecuta' (clave del equipo) o "+
"'externo' (nombre, si no es del equipo y no tiene la app), 'fecha_ejecuta' (cuando lo "+
"hace el otro) y 'mi_fecha' (cuando lo revisa el que habla). Si esa tarea YA EXISTE en "+
"el contexto, pon sus terminos en 'tarea_existente' y NO la dupliques. Si te falta "+
"'mi_fecha' o el 'cuando' del otro, usa PREGUNTA y pidelo TODO junto en una sola "+
"pregunta. NO uses SUPERVISAR si el que revisa y el que ejecuta son la misma persona: "+
"eso es CREAR normal.\n"+
"   SI ESA TAREA YA EXISTE en el contexto, el QUE y el QUIEN ya se saben: NO los "+
"vuelvas a preguntar. Pon sus terminos en 'tarea_existente' y pregunta SOLO la fecha "+
"de la revision ('¿Cuando quieres que te recuerde revisarsela?').\n"+
"   SI DICEN DE QUIEN ES LA TAREA ('revisa el alumbrado DE JUANITO', 'como va lo de "+
"Karina'), pon su clave en 'de_quien': con eso la busqueda es mucho mas precisa. Si no "+
"lo dijeron, dejalo vacio y NO lo preguntes: la app le enseña sola cual es el camino "+
"rapido.\n"+
"   QUIEN REVISA no siempre es el que habla: un jefe puede mandarle la revision a "+
"otro ('Samuel, revisale a Karina como va el riego'). Si nombran a alguien mas para "+
"REVISAR, pon su clave en 'revisa'; si no, dejalo vacio y revisa el que habla.\n"+
"  ENCARGAR   NINGUNA PALABRA clasifica esto: 'encargar', 'encargale', 'encargo', "+
"'favor', 'porfa', 'dile que' se usan igual para asignar una tarea y para pedir un "+
"favor. NO las tomes como senal. Deciden los HECHOS: quien va a EJECUTAR y si la cosa "+
"YA EXISTIA como tarea de alguien. Dos casos:\n"+
"   (a) NADIE la ejecutaba (no existe esa tarea) -> la persona nombrada queda "+
"RESPONSABLE: es TAREA DE ELLA -> CREAR con su clave de duenio. Ej: 'encargale a Karina "+
"lavar la camioneta el viernes', 'porfa que Karina vaya por las tortillas' = TAREA de "+
"Karina (nadie la tenia, ahora es de ella).\n"+
"   (b) YA ERA TAREA DEL QUE HABLA (aparece en el contexto como suya) y pasa la "+
"EJECUCION a otro sin dejar de ser suya -> eso si es ENCARGO: el duenio y el reloj "+
"siguen siendo del que habla, el otro solo ejecuta. Ej: si 'conseguir la reja' ya es "+
"tarea de Salvador y dice 'que Samuel le hable al proveedor', eso es encargo/paso, no "+
"tarea nueva de Samuel. Si NO ves esa tarea en el contexto, NO es encargo: es (a).\n"+
"   (c) YA EXISTIA como tarea (de quien habla o de otro) y ahora CAMBIA DE DUENIO en "+
"definitiva ('esta tarea ahora va a ser de Karina', 'que Samuel se haga cargo de X de "+
"aqui en adelante') -> REASIGNAR: pasa el duenio a la persona nombrada, permanente. "+
"Distinto de (b): en (b) sigue siendo tuya y el otro solo ejecuta; en (c) deja de ser "+
"tuya. Si DUDAS entre encargo temporal y cambio permanente, PREGUNTA: '¿esta tarea "+
"queda permanentemente de Karina, o solo esta vez la ejecuta?'. Para REASIGNAR pon en "+
"'reasignar' los terminos para hallar la tarea y la clave del nuevo duenio.\n"+
"  RECORDATORIO  solo quiere que le AVISES de algo; nada que ejecutar ni comprobar. "+
"Ej: 'recuerdame mi vuelo el jueves'. OJO: 'recuerdame HACER algo' (llamar, revisar, "+
"pagar) es TAREA, no recordatorio. El eje: hay algo que EJECUTAR (tarea) o solo "+
"AVISAR (recordatorio). Si dudas, PREGUNTA '¿es algo que hay que hacer, o solo "+
"quieres que te lo recuerde?'.\n"+
"  PASO       lo dictado es una GESTION dentro de una tarea que YA EXISTE (la ves "+
"abierta en el contexto), no una tarea nueva ni un encargo suelto. Ej: si ya existe "+
"'conseguir la reja' y dicen 'que Samuel le hable al proveedor', eso es un PASO de esa "+
"tarea. Ligalo a esa tarea. El tiempo del paso es CORTO (lo que tarda esa gestion), NO "+
"el vencimiento final de la tarea. Si no ves la tarea a la que pertenece, NO es paso: "+
"es CREAR o ENCARGAR. Si dudas si es paso o algo aparte, PREGUNTA. Pon en 'paso' los "+
"terminos para hallar la tarea, quien lo hace (clave; vacio si es el que habla), que "+
"hace, y cuando (corto). Si falta el cuando, PREGUNTA '¿para cuando ese paso?'.\n"+
"  COMENTAR   solo quiere INFORMARLE algo a alguien sobre una tarea suya, sin pedirle "+
"que haga nada ni esperar respuesta. Ej: 'coméntale a Karina que se me antojó esa "+
"película', 'avísale a Samuel que el proveedor ya tiene el material'. Se pega en el "+
"hilo de la tarea de esa persona y le aparece el badge de no visto — NADA mas: no lo "+
"detiene ni lo obliga a contestar. EL EJE: ¿le PIDES algo (tarea/encargo) o solo le "+
"INFORMAS (comentario)? Pon en 'comentar' la clave de a quién, los términos para "+
"hallar su tarea, y el texto.\n"+
"  WHATSAPP   quiere que se le mande un WhatsApp a alguien de FUERA del equipo "+
"(proveedor, ingeniero, contacto) desde el telefono del que habla, ligado a una "+
"tarea. Ej: 'escribele a Carlos que si ya quedo el servidor', 'preguntale a Josue "+
"por WhatsApp como va el avance', 'mandale un whats al herrero que cuando entrega'. "+
"Si dice WhatsApp o 'escribele' es WHATSAPP AUNQUE sea del equipo (Carlos, Josue); "+
"si no lo dice y es del equipo, es ENCARGAR o COMENTAR. Pon en 'whatsapp' el contacto tal cual lo dijo, el mensaje ya redactado "+
"en segunda persona listo para mandarse (corto, natural, sin 'preguntale que'), y "+
"terminos para hallar la tarea (vacio si no dijo).\n"+
"  BUSCAR     quiere ver algo que ya existe. Ej: 'las vencidas de Samuel'.\n"+
"  RESPONDER  te PREGUNTARON algo: el estado de una tarea, o un DATO guardado "+
"(la direccion del hotel, el monto del ultimo presupuesto, que dijo fulano). "+
"Contesta CORTO y DIRECTO con el dato, como a un jefe apurado que va caminando: "+
"primero la respuesta, sin rodeos. SOLO con lo que este en los folders — si el dato "+
"no esta, dilo ('no lo tengo') y di que haria falta; NO lo inventes ni lo supongas. "+
"Cuando el dato salga de una tarea, pon su id en 'abrir_tarea' para que pueda ir a "+
"verla completa, y di de cual salio ('viene de tu tarea del viaje a Madrid'). Si hay "+
"un documento que lo respalda, di cual es ('esta en el presupuesto que subio el 2 de "+
"septiembre').\n"+
"   DATOS QUE SE USAN, NO QUE SE LEEN: si la respuesta trae un TELEFONO, una DIRECCION, "+
"una PAGINA WEB o un dato que la persona va a copiar (folio, cuenta, numero de reserva), "+
"ponlo TAMBIEN en el arreglo 'datos', cada uno con su tipo y una etiqueta corta. El "+
"telefono va en limpio (solo digitos y +), la web con su dominio. Un archivo de Drive, "+
"Docs, Sheets o un PDF va como tipo 'documento', con su NOMBRE en 'que' y su liga "+
"completa en 'valor'. Asi le sale el boton para marcar, abrir o copiar y no tiene que ir "+
"escribiendolo a mano.\n"+
"REGLAS:\n"+
"- USA TODO TU CRITERIO de asistente listo; NO encajones a ciegas. Antes de CREAR, "+
"ENCARGAR o lo que sea, si a lo dicho le falta un dato que cualquiera pediria "+
"(cual de varios, para cuando, cuanto, a quien, como se sabra que quedo), contesta "+
"PREGUNTA primero. Ej: 'dile a Karina que lave la camioneta' -> PREGUNTA titulo "+
"'Lavar la camioneta...', pregunta '¿Cual camioneta y para cuando?'. Mejor una "+
"buena pregunta que un encargo o una tarea vagos. El cuestionario expres aplica a "+
"TODAS las intenciones, no solo a crear tareas.\n"+
"- NUNCA inventes datos ni fechas. Lo que falte, se pregunta.\n"+
"- Si esta completo, NO preguntes de mas: crea directo.\n"+
"- Lo esencial de una tarea: que es, para cuando, como se sabe que quedo (cierra), "+
"quien si es de otro, y si toca dinero el monto y la cuenta.\n"+
"- DINERO A LA FICHA: si hay un monto (autorizar, comprar, depositar, pagar), ponlo "+
"SIEMPRE en 'gasto' (ej '$6,400', '$18,500 · BBVA'). Ahi vive el resumen que decide; "+
"si el monto no queda en la ficha, alguien autoriza a ciegas. En la confirmacion se le "+
"muestra al que pide para que valide que la ficha es correcta antes de mandarla.\n"+
"- Fechas AAAA-MM-DD.\n"+
"- DIAS DE LA SEMANA: NO los calcules tu. En el contexto viene 'calendario', una "+
"lista de los proximos 16 dias ya resueltos ('2026-09-07 lunes'). Si dice 'el "+
"lunes', 'el martes', 'el viernes', BUSCA ESA PALABRA en el calendario y COPIA la "+
"fecha de la PRIMERA que coincida DESPUES de hoy. 'mañana' y 'hoy' vienen marcados "+
"ahi mismo. Equivocarte de dia manda la tarea al dia que no es.\n"+
"CAMPOS de tarea: nombre (infinitivo), duenio (clave), fecha, cierra, revisar, "+
"criticidad ('diario'|'normal'|'lento'), periodicidad (null|'semanal'|'mensual'), "+
"recuperable (bool), gasto.\n"+
"CONTESTA SOLO ESTE JSON:\n"+
"{\"intencion\":\"PREGUNTA|CREAR|SUPERVISAR|ENCARGAR|REASIGNAR|PASO|RECORDATORIO|COMENTAR|WHATSAPP|BUSCAR|RESPONDER\","+
"\"titulo\":\"<si PREGUNTA: interpretacion corta con ... si falta>\","+
"\"pregunta\":\"<si PREGUNTA: una sola>\","+
"\"tarea\":{\"nombre\":\"\",\"duenio\":\"\",\"fecha\":\"\",\"cierra\":\"\",\"revisar\":\"\","+
"\"criticidad\":\"\",\"periodicidad\":null,\"recuperable\":true,\"gasto\":\"\",\"pasos\":[]},"+
"\"encargo\":{\"para\":\"<clave>\",\"texto\":\"\"},"+
"\"reasignar\":{\"tarea\":\"<terminos para hallarla>\",\"a\":\"<clave>\",\"razon\":\"\"},"+
"\"paso\":{\"tarea\":\"<terminos para hallar la existente>\",\"quien\":\"<clave o vacio>\",\"texto\":\"\",\"cuando\":\"AAAA-MM-DD\"},"+
"\"comentar\":{\"a\":\"<clave>\",\"tarea\":\"<terminos>\",\"texto\":\"\"},"+
"\"whatsapp\":{\"contacto\":\"<nombre tal cual>\",\"texto\":\"<mensaje listo>\",\"tarea\":\"<terminos o vacio>\"},"+
"\"recordatorio\":{\"texto\":\"\",\"fecha\":\"AAAA-MM-DD\"},"+
"\"supervisar\":{\"que\":\"<que se revisa, en infinitivo>\",\"ejecuta\":\"<clave del equipo, o vacio si es alguien de fuera>\",\"externo\":\"<nombre si es de fuera>\",\"tarea_existente\":\"<terminos para hallarla si ya existe, o vacio>\",\"fecha_ejecuta\":\"AAAA-MM-DD\",\"mi_fecha\":\"AAAA-MM-DD\",\"revisa\":\"<clave de QUIEN REVISA; vacio = el que habla>\",\"de_quien\":\"<clave del DUENIO de la tarea a revisar, si lo dijeron>\"},"+
"\"terminos\":\"<si BUSCAR>\",\"respuesta\":\"<si RESPONDER, 1-3 lineas tuteando>\","+
"\"abrir_tarea\":\"<si RESPONDER y el dato sale de una tarea: su id>\","+
"\"datos\":[{\"tipo\":\"telefono|direccion|web|documento|texto\",\"que\":\"<etiqueta corta: "+
"para un documento, SU NOMBRE, ej Presupuesto del electrico>\","+
"\"valor\":\"<el dato tal cual, sin adornos>\"}]}";

/* EL FILTRO DE DOS PASOS QUE CUIDA LOS TOKENS. candidatas() busca gratis en el
   telefono; solo a esas pocas les mandamos el folder completo a Claude. */
/* ¿Suena a que están PIDIENDO UN DATO y no mandando hacer algo? Corre gratis en
   el teléfono y sirve para abrirle a Claude el hilo completo y los documentos de
   las tareas que pegan, que es de donde sale el dato. Salvador 2026-09-04. */
function pareceConsulta(txt){
  txt=String(txt||"");
  return /\?|\bcu[aá]l\b|\bcu[aá]nto|\bd[oó]nde\b|\bqu[eé] (dijo|qued|hay|trae)|\bdirecci[oó]n\b|\btel[eé]fono\b|\bhotel\b|\bvuelo\b|\breserva|\bpresupuesto\b|\bcotiza|\bc[oó]mo va\b|\ben qu[eé] va\b|\bqui[eé]n (es|dijo|lo)\b/i.test(txt);
}
function detalleRelevante(texto, ancho){
  /* Para una CONSULTA se abren menos tareas pero MAS a fondo (todo su hilo y
     sus documentos); para lo demas, el resumen de siempre. */
  var cands=candidatas(texto, null, !!ancho).slice(0, ancho?3:5);
  if(!cands.length) return "";
  return "\n\nFOLDERS DE LO RELEVANTE (para narrar avance, ubicar o CONTESTAR UN DATO; "+
    "NO inventes nada que no este aqui):\n"+
    JSON.stringify(cands.map(function(t){ return detalleTarea(t, !!ancho) }));
}

/* fecha bonita a partir de AAAA-MM-DD */
function fechaBonita(iso){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||"")) return iso||"";
  var d=new Date(iso+"T00:00:00");
  var dias=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  var mes=["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
           "septiembre","octubre","noviembre","diciembre"];
  return dias[d.getDay()]+" "+d.getDate()+" de "+mes[d.getMonth()];
}

/* ============ LA BARRA HABLA CON CLAUDE — rediseño conversacional 2026-09-03 ============
   Ahora es una conversacion con memoria: si Claude te pregunta algo, tu respuesta se
   junta con lo anterior y avanza (no empieza de cero). Cuestionario expres: pregunta
   solo lo que falta, en una sola. Y distingue tarea, encargo, recordatorio. */
function barraEnviar(texto,completo){
  texto=String(texto||"").trim();
  if(!texto) return;
  /* Si venia una pregunta para COMPLETAR una tarea a medias, esto es la
     respuesta: se llena el dato que faltaba, no se manda a Claude. */
  if(barraEstado && barraEstado.completandoId){
    completaPendiente(barraEstado.completandoId, texto); return;
  }
  /* El recordatorio YA quedó insertado en la tarea (nada se pierde); esto es la
     respuesta con el CUÁNDO, que solo le pone el día/hora al aviso. Nunca va a
     Claude ni abre la lista. Si no se pesca el cuándo, el aviso sigue guardado. */
  if(barraEstado && barraEstado.insertaEn){
    var _t=tareas.filter(function(x){return x.id===barraEstado.insertaEn})[0];
    var _ts=barraEstado.avisoTs;
    var _f=diaDicho(texto)||(/^\d{4}-\d{2}-\d{2}$/.test(texto)?texto:"");
    if(!_f && horaDicha(texto)) _f=hoy();
    if(!_f){ toast(dudaFecha(texto)||'Sigue guardado sin hora — dímela otra vez (ej. "mañana" o "a las 7")'); return; }   /* build 190: fecha en duda = la pregunta */
    if(_t && _t.avisos){
      var _av=_t.avisos.filter(function(a){return String(a.ts)===String(_ts)})[0];
      if(_av){ _av.fecha=_f; _av.hora=horaCercana(_f,horaValor(texto),texto)||_av.hora;
               _av.cada=cadaDicho(texto)||_av.cada; _av.dicho=((_av.dicho||"")+" "+texto).trim();
               msg(_t,"bi","Le pusiste cuándo al recordatorio: "+textoCuando(_av)+".");
               guarda(_t); fichitaAviso(_t, _av); }
    }
    barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render();
    toast("Listo, recordatorio en “"+((_t||{}).nombre||"")+"”");
    return;
  }
  /* Si esta abierta la pantalla de "Muy caro", lo que se dicta o se escribe es
     LA RESPUESTA a esa negociacion, no una orden nueva para Claude. */
  if(negociar && negociar.id){
    var tneg=tareas.filter(function(x){return x.id===negociar.id})[0];
    if(tneg){ jefeResponde(tneg, texto); return }
  }
  /* build 143: "ficha de Guillermo" y "preparame para Guillermo" los resuelve
     la app (la ficha sin Claude; el resumen con Claude y, si falla, local) */
  var _fp=pideFicha(texto);
  if(_fp){ abrePersona(_fp); return; }
  var _pp=pidePrepara(texto);
  if(_pp){ preparamePara(_pp, texto); return; }
  /* build 145: "ya compre el camaron", "ya quedo el vino" -- es un PALOMEO de
     un paso pendiente en alguna tarea con lista de pasos; se resuelve aqui
     mismo, sin pasar por Claude (igual que ficha o prepara), se dicte desde
     donde se dicte. Si ya estas DENTRO de la tarea, enviaHilo ya lo resuelve
     solo; esto es para el resto de los casos (home, otra tarea abierta).
     Salvador 2026-09-27, caso real de Costco. */
  if(!window.__saltaPaso && diceQueYa(texto)){
    var _pgTareas=buscaTareaConPaso(texto);
    if(_pgTareas.length===1){
      var _pgHechos=palomeaPorTexto(_pgTareas[0], texto);
      if(_pgHechos.length){
        msg(_pgTareas[0],"bo",texto); msg(_pgTareas[0],"bi",respuestaPalomeo(_pgTareas[0],_pgHechos));
        _pgTareas[0].ultima=PERSONAS[yo].nombre+": "+texto; guarda(_pgTareas[0]);
        abierta=_pgTareas[0].id; barraEstado=null; consulta=""; fotoEnMano=null; vista="hilo"; render();
        return;
      }
    }else if(_pgTareas.length>1){
      barraEstado={modo:"escoge", dicho:texto, hist:[], foto:fotoEnMano||null,
        sv:{__paso:true, texto:texto}, ops:_pgTareas.slice(0,6).map(function(t){return t.id}),
        pregunta:"¿De cuál tarea es ese paso?"};
      vista="barra"; render(); return;
    }
  }
  /* build 167 (Salvador 2026-10-02): "abre / busca / dime / muestrame / donde esta X"
     = quiere una tarea que YA EXISTE. Nunca se crea sola: se ensenan las que pegan
     (basta una palabra) y abajo "Ninguna · crear tarea nueva". Una sola: abre directo.
     Ninguna por palabras: Claude busca por significado. */
  /* build 194 (F37): "abre / busca / muestrame / donde esta / el dato de / el costo de X" y
     frases cortas ("barda cumbres") buscan en TODAS las tareas (abiertas y cerradas) y en sus
     datos. Nunca va a Claude como CREAR. */
  var _qB=detectaLista(texto)?null:pideBuscar(texto);
  var _corta=!_qB && !detectaLista(texto) && fraseCortaDeBusqueda(texto);
  if(_qB || _corta){
    var _rB=buscaTodo(_qB||texto);
    /* frase corta sin "abre": solo si alguna pega TODAS las palabras y al menos una en su nombre o sus datos */
    if(_corta) _rB=_rB.filter(function(x){ return x.todas && x.fuerte; });
    if(_rB.length || _qB){ abreBusqueda(_qB||texto, texto, _rB); return; }
  }
  /* build 199: "mándale a X mañana a las 8 que…" -> WhatsApp programado, sin pasar por Claude */
  var _pgB=null; try{ _pgB=programaWA(texto); }catch(e){}
  if(_pgB){
    if(_pgB.duda || _pgB.texto==="__ESTO__"){ barraEstado={modo:"respuesta", dicho:texto, texto:_pgB.duda||("¿Qué le mando a "+_pgB.contacto+"?")}; vista="barra"; render(); return; }
    aplicaIntencion({intencion:"WHATSAPP", whatsapp:{contacto:_pgB.contacto, texto:_pgB.texto, tarea:"", programa:_pgB}}, texto, [], fotoEnMano||null); return;
  }
  /* build 166 (Salvador 2026-10-02): "en la tarea de la mesa directiva ponme un
     checklist de..." = la lista va DENTRO de esa tarea. Antes se iba a Claude y
     nacia una tarea nueva con el nombre de la lista. Se resuelve aqui, sin tokens. */
  var _dl=detectaLista(texto);
  if(_dl){
    var _lc=candidatas(_dl.frase).filter(function(t){ return !t.cierre && !t.es_recordatorio; });
    /* si una pega claramente mas que las otras, va directo a esa */
    if(_lc.length>1){
      var _pw=palabras(_dl.frase).map(raiz);
      var _sc=_lc.map(function(t){ var tw=palabras(t.nombre).map(raiz); return _pw.filter(function(r){ return tw.indexOf(r)>=0; }).length; });
      var _mx=Math.max.apply(null,_sc);
      if(_sc.filter(function(x){ return x===_mx; }).length===1) _lc=[_lc[_sc.indexOf(_mx)]];
    }
    if(_lc.length===1){ aplicaLista(_lc[0], _dl.items, texto, _dl.nombre); return; }
    if(_lc.length>1){
      barraEstado={modo:"escoge", dicho:texto, hist:[], foto:fotoEnMano||null,
        sv:{__lista:true, items:_dl.items, texto:texto, nombre:_dl.nombre}, ops:_lc.slice(0,6).map(function(t){return t.id}),
        pregunta:"¿En cuál tarea va la lista?"};
      vista="barra"; render(); return;
    }
    barraEstado={modo:"respuesta", dicho:texto,
      texto:"No encontré la tarea “"+_dl.frase+"”. Dime cómo se llama, o ábrela y dicta ahí la lista."};
    vista="barra"; render(); return;
  }
  window.__saltaPaso=false;
  if(APP_TOKEN.indexOf("__")===0){
    consulta=texto; vista="lista"; render();
    toast("Claude no esta conectado todavia — busque con el filtro local");
    return;
  }
  /* memoria: si venia una pregunta de Claude, esto es la respuesta */
  var hist = (barraEstado && barraEstado.hist) ? barraEstado.hist.slice() : [];
  var foto = (barraEstado && barraEstado.foto) || fotoEnMano || null;
  hist.push("Persona: "+texto);

  /* build 145: si el dictado salio desde DENTRO de una tarea (mic flotante),
     se recuerda cual era -- para que una respuesta de Claude sobre esa MISMA
     tarea se conteste en su hilo, sin tarjeta ni boton de mas. Salvador
     2026-09-27, caso real de Costco. */
  window.__origenHilo=(vista==="hilo" && abierta) ? abierta : null;
  /* lo enviado SUBE al encabezado y la caja queda en blanco, como WhatsApp */
  consulta="";
  barraEstado={modo:"cargando", dicho:texto, hist:hist, foto:foto, texto:"Leyendo lo que dijiste…"};
  vista="barra"; render();

  /* LO QUE LA APP YA RESOLVIO SE LE ENTREGA HECHO. Regla de Salvador: si ya se
     saben QUE, QUIEN y CUANDO, no se pregunta nada. Decirselo como regla
     general en el prompt no bastaba — seguia preguntando el monto, el modelo o
     el presupuesto. Diciendoselo como HECHOS de este dictado, con nombre y
     fecha resueltos, si obedece. 2026-09-05. */
  var _q=quienDicho(texto), _c=diaDicho(texto), _v=VERBOS_ACCION.test(texto);
  /* aqui todavia no hay respuesta de Claude, asi que solo cuenta la lista */
  var yaSe="";
  if(_q||_c){
    yaSe="\n\nYA RESUELTO POR LA APP — usalo TAL CUAL, no lo vuelvas a preguntar:\n"+
      (_q?"  responsable: "+_q+" ("+PERSONAS[_q].nombre+", lo dijo por su nombre)\n":"")+
      (_c?"  fecha: "+_c+" (sacada del dia que dijo, ya calculada con el calendario del telefono)\n":"");
    if(_q && _c && _v)
      yaSe+="  CON ESO YA TIENES LOS TRES DATOS (que hacer, quien y cuando). "+
            "NO PREGUNTES NADA: contesta CREAR con duenio "+_q+" y fecha "+_c+". "+
            "El monto, el modelo, la cantidad o el presupuesto NO son esenciales; "+
            "si no los dijo, se anotan despues en el chat de la tarea.\n";
  }

  window.__barraCompleto=!!completo;
  var prompt = SYS_BARRA +
    "\n\nHOY (resumen para ubicar):\n"+JSON.stringify(contextoBarra(!!completo)) + yaSe +
    detalleRelevante(texto, pareceConsulta(texto)) +
    (foto?"\n\nHAY UNA FOTO en mano. Su PROPOSITO lo dice el texto, y segun eso eliges la "+
          "intencion:\n"+
          "  - evidencia de una tarea que YA existe -> BUSCAR (se pega a esa tarea).\n"+
          "  - amerita una tarea nueva ('abre tarea: hay que cambiar esta reja') -> CREAR.\n"+
          "  - solo para acordarse ('recuerdame este boleto') -> RECORDATORIO.\n"+
          "  - para mandarsela/ensenarsela a alguien ('mandasela a Karina', 'ensenale a "+
          "Samuel esto') -> COMENTAR a esa persona (la foto va con el comentario).\n"+
          "  - referencia para una tarea ('me gusta para la remodelacion') -> BUSCAR y se "+
          "pega, o CREAR si no existe.\n"+
          "Si el texto no alcanza a decir el proposito, PREGUNTA.":"") +
    (hist.length>1
      ? "\n\nCONVERSACION (lo ultimo es lo recien dicho; si te responde una pregunta "+
        "tuya, junta y avanza):\n"+hist.join("\n")
      : "\n\nLO QUE DIJO "+((PERSONAS[yo]&&PERSONAS[yo].nombre)||yo)+":\n"+texto);

  /* NUNCA SE QUEDA CONGELADO EN "Leyendo lo que dijiste…" — Salvador 2026-09-23.
     Tres redes: (1) si lo que hace la app con la respuesta TRUENA a medio camino
     (ya guardo el recordatorio pero no alcanzo a pintar), se atrapa, se dice el
     error exacto y se sale de la pantalla; (2) si al terminar la pantalla sigue
     en "Leyendo" con este mismo dictado, se destraba; (3) vigia de 60 s por si la
     respuesta nunca llega a este callback. */
  var _esteEstado=barraEstado;
  var _vigia=setTimeout(function(){
    if(barraEstado===_esteEstado && vista==="barra")
      caeALocal(texto,"Claude no contestó a tiempo — busqué local");
  }, 60000);
  preguntaAClaude([{role:"user", content: prompt}],MODO_CEREBRO,function(txt,err){
    clearTimeout(_vigia);
    if(err){ caeALocal(texto,"No alcance a Claude ("+err+") — busque local"); return }
    var j=null;
    try{ var m=txt.match(/\{[\s\S]*\}/); j=m?JSON.parse(m[0]):null }catch(e){ j=null }
    if(!j){ caeALocal(texto,"Claude contesto algo que no entendi — busque local"); return }
    try{ aplicaIntencion(j, texto, hist, foto); }
    catch(e){
      try{ console.error("aplicaIntencion", e); }catch(_e){}
      var _ult=(window.recienCreadas||[])[0], _ok=_ult && tareas.some(function(t){return t.id===_ult.id});
      if(_ok && _ult.tipo==="recordatorio"){
        barraEstado=null; consulta=""; fotoEnMano=null; secAbierta=null;
        abierta=_ult.id; vista="hilo"; render();
      } else caeALocal(texto,"");
      toast("Se guardó, pero falló al mostrarlo: "+String((e&&e.message)||e).slice(0,90));
      return;
    }
    if(barraEstado===_esteEstado && vista==="barra")
      caeALocal(texto,"No se pudo mostrar la respuesta — busqué local");
  });
}
function caeALocal(texto,aviso){
  barraEstado=null; consulta=texto; vista="lista"; render(); if(aviso) toast(aviso);
}

/* Claude a veces contesta la intencion en singular o con otra palabra
   ("ENCARGO" en vez de "ENCARGAR"). Antes eso caia en "No entendi que querias
   hacer" y el dictado se perdia. Aqui se traduce antes de decidir. 2026-09-04. */
var SINONIMOS_INT={
  ENCARGO:"ENCARGAR", ENCARGOS:"ENCARGAR", PEDIR:"ENCARGAR", PEDIDO:"ENCARGAR",
  CREAR_TAREA:"CREAR", TAREA:"CREAR", NUEVA:"CREAR", NUEVA_TAREA:"CREAR", ABRIR:"CREAR",
  ENVIAR:"CREAR", MANDAR:"CREAR", ASIGNAR:"CREAR",
  SUPERVISION:"SUPERVISAR", REVISION:"SUPERVISAR", REVISAR:"SUPERVISAR",
  REASIGNACION:"REASIGNAR", PASAR:"REASIGNAR", TRANSFERIR:"REASIGNAR",
  COMENTARIO:"COMENTAR", MENSAJE:"COMENTAR", AVISAR:"COMENTAR", DECIR:"COMENTAR",
  RECORDAR:"RECORDATORIO", AVISO:"RECORDATORIO",
  BUSQUEDA:"BUSCAR", ABRIR_TAREA:"BUSCAR",
  RESPUESTA:"RESPONDER", CONSULTA:"RESPONDER", CONTESTAR:"RESPONDER",
  PREGUNTAR:"PREGUNTA", DUDA:"PREGUNTA",
  WHATS:"WHATSAPP", WA:"WHATSAPP", MENSAJE_WHATSAPP:"WHATSAPP", WHATSAPPEAR:"WHATSAPP",
  ESCRIBIR:"WHATSAPP", ESCRIBIRLE:"WHATSAPP"
};
/* EL DIA DE LA SEMANA NO SE LE DEJA A CLAUDE. Aunque se le pase el calendario
   hecho, se equivoca de vez en cuando y una tarea dictada "para el jueves" cae
   en viernes. Aqui se saca del texto, con la fecha del telefono, y se le gana.
   Si dijeron un dia con numero ("el lunes 20 de septiembre") no se toca nada:
   ahi el numero manda. 2026-09-04. */
/* ¿dijo una HORA? (a las 7, 7 de la tarde, 7pm, mediodia). La app trabaja por
   dias, pero si hay hora y no dia, el dia es HOY. Salvador 2026-09-16. */
function horaDicha(txt){
  var s=" "+String(txt||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")+" ";
  if(/\ba\s+la(s)?\s+(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|\d{1,2})\b/.test(s)) return true;
  /* "4:20" suelto tambien es hora (Salvador 2026-09-23: "recuerdame 4:20
     prender la camioneta" quedaba para mañana a las 9) */
  if(/\b\d{1,2}:\d{2}\b/.test(s)) return true;
  /* "cuarto para las cuatro", "diez para las cinco" (Salvador 2026-09-23) */
  if(/\b(cuarto|cinco|diez|quince|veinte|\d{1,2})\s+para\s+la(s)?\s+(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|\d{1,2})\b/.test(s)) return true;
  if(/\b\d{1,2}(\s*[:.]\s*\d{2})?\s*(am|pm|a\.?m\.?|p\.?m\.?)\b/.test(s)) return true;
  if(/\b\d{1,2}(\s*[:.]\s*\d{2})?\s*(de\s+la\s+(manana|tarde|noche)|horas?|hrs?)\b/.test(s)) return true;
  if(/\b(mediodia|medianoche)\b/.test(s)) return true;
  return false;
}
/* saca la hora en "HH:MM" (24h) de lo dictado, o "" si no hay. Aproximado pero
   sirve para los casos comunes: "a las 10 de la manana"->10:00, "6 de la tarde"->
   18:00, "a las 7"->07:00, mediodia->12:00. Salvador 2026-09-17. */
var NUMHORA={una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12};
/* EL DICTADO DE IPHONE CORRIGE LA HORA EN VIVO y deja las dos versiones:
   "cuatro treinta y cinco" llega como "4:30 35", "4:40 45", "4:50 51". No hay
   segundos: el segundo numero, de la misma decena, ES el minuto. Salvador 2026-09-23. */
function limpiaHoraDictada(txt){
  return String(txt||"").replace(/\b(\d{1,2}):([0-5])0(?:\s+|:\s*)([0-5]\d)\b/g,
    function(all,h,dz,nn){ return nn.charAt(0)===dz ? h+":"+nn : all; });
}
function horaValor(txt){
  txt=limpiaHoraDictada(txt);
  var s=String(txt||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  if(/\bmediodia\b/.test(s)) return "12:00";
  if(/\bmedianoche\b/.test(s)) return "00:00";
  var _para=s.match(/\b(cuarto|cinco|diez|quince|veinte|\d{1,2})\s+para\s+la(?:s)?\s+(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|\d{1,2})\b/);
  if(_para){
    var _pm={cuarto:15,cinco:5,diez:10,quince:15,veinte:20}[_para[1]]; if(_pm==null) _pm=parseInt(_para[1],10);
    var _ph=NUMHORA[_para[2]]!=null?NUMHORA[_para[2]]:parseInt(_para[2],10);
    if(!isNaN(_pm)&&_pm>0&&_pm<60&&!isNaN(_ph)){
      _ph=_ph-1; if(_ph<0) _ph=23;
      var _pc=s.slice(_para.index, _para.index+50);
      if(/(tarde|noche|\bpm\b|p\.?m)/.test(_pc) && _ph<12) _ph+=12;
      return String(_ph).padStart(2,"0")+":"+String(60-_pm).padStart(2,"0");
    }
  }
  var m=s.match(/\ba\s+la(?:s)?\s+(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|\d{1,2})(?:[:.](\d{2}))?/);
  if(!m) m=s.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(?:de\s+la\s+(?:manana|tarde|noche)|am|pm|a\.?m|p\.?m|hrs?|horas?)/);
  if(!m) m=s.match(/\b(\d{1,2}):(\d{2})\b/);
  if(!m) return "";
  var h=NUMHORA[m[1]]!=null?NUMHORA[m[1]]:parseInt(m[1],10);
  var mm=m[2]?parseInt(m[2],10):0;
  /* MINUTOS DICTADOS SIN DOS PUNTOS — Salvador 2026-09-23: "a las tres 45 de la
     tarde" quedaba a las 15:00 porque solo se leian minutos con ":" o ".". El
     dictado de iPhone escribe "tres 45", "3 45", "tres y media", "tres y cuarto",
     "tres cuarenta y cinco", "cuatro menos cuarto". */
  if(!m[2] && /^a\s+la/.test(m[0])){
    var resto=s.slice(m.index+m[0].length), mw;
    var MINPAL={"cincuenta y cinco":55,"cincuenta":50,"cuarenta y cinco":45,"cuarenta":40,
      "treinta y cinco":35,"treinta":30,"veinticinco":25,"veinte":20,"quince":15,
      "diez":10,"cinco":5,"media":30,"cuarto":15};
    var PALRE="cincuenta y cinco|cincuenta|cuarenta y cinco|cuarenta|treinta y cinco|treinta|veinticinco|veinte|quince|diez|cinco";
    if((mw=resto.match(/^\s+y\s+(media|cuarto)\b/))) mm=MINPAL[mw[1]];
    else if((mw=resto.match(/^\s+menos\s+(cuarto|\d{1,2}|cinco|diez|quince|veinte|veinticinco)\b/))){
      var mn=MINPAL[mw[1]]!=null?MINPAL[mw[1]]:parseInt(mw[1],10);
      if(!isNaN(mn)&&mn>0&&mn<60){ h=h-1; if(h<0) h=23; mm=60-mn; } }
    else if((mw=resto.match(/^\s+y\s+(\d{1,2})\b/))) mm=parseInt(mw[1],10);
    else if((mw=resto.match(/^\s+(\d{2})\b/))) mm=parseInt(mw[1],10);
    else if((mw=resto.match(new RegExp("^\\s+(?:y\\s+)?("+PALRE+")\\b")))) mm=MINPAL[mw[1]];
  }
  var cola=s.slice(m.index, m.index+40);
  if(/(tarde|noche|\bpm\b|p\.?m)/.test(cola) && h<12) h+=12;
  if(/(manana|\bam\b|a\.?m)/.test(cola) && h===12) h=0;
  if(isNaN(h)||h<0||h>23) return "";
  if(isNaN(mm)||mm<0||mm>59) mm=0;
  return String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0");
}
/* ¿es recurrente? "todos los dias"/"diario", "cada semana"/"semanal", etc. */
function cadaDicho(txt){
  var s=String(txt||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  if(/\b(todos los dias|cada dia|diario|diariamente|a diario)\b/.test(s)) return "diario";
  if(/\b(cada semana|semanal|todas las semanas)\b/.test(s)) return "semanal";
  if(/\b(cada mes|mensual|todos los meses)\b/.test(s)) return "mensual";
  /* build 170 (Josue 2-oct): antes "cada lunes" no se reconocia y el aviso se guardaba como de una sola vez */
  if(/\b(de lunes a viernes|entre semana|dias habiles)\b/.test(s)) return "LV";
  if(/\b(cada quince dias|cada 15 dias|quincenal|cada dos semanas|cada 2 semanas)\b/.test(s)) return "quincenal";
  if(/\b(cada|los|todos los)\s+(lunes|martes|miercoles|jueves|viernes|sabados?|domingos?)\b/.test(s)) return "semanal";
  return "";
}
/* TIEMPO RELATIVO: "en 2 minutos", "dentro de una hora", "en media hora", "en un
   cuarto de hora", "en una hora y media". Devuelve {fecha,hora} = ahora + delta, o
   "" si no hay. Tiene prioridad sobre todo lo demás porque es intención exacta e
   inmediata. `nowMs` es opcional (para pruebas). Salvador 2026-09-18. */
var NUMREL={un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,
  nueve:9,diez:10,once:11,doce:12,quince:15,veinte:20,treinta:30,cuarenta:40,
  cincuenta:50,noventa:90};
function relativoDicho(txt, nowMs){
  var s=" "+String(txt||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")+" ";
  var mins=null;
  if(/\b(en|dentro de)\s+(una|1)\s+hora\s+y\s+media\b/.test(s)) mins=90;
  else if(/\b(en|dentro de)\s+media\s+hora\b/.test(s)) mins=30;
  else if(/\b(en|dentro de)\s+un\s+cuarto\s+de\s+hora\b/.test(s)) mins=15;
  else {
    var m=s.match(/\b(?:en|dentro de)\s+(\d{1,3}|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|treinta|cuarenta|cincuenta|noventa)\s*(minutos?|min|horas?|hrs?)\b/);
    if(m){
      var n=(NUMREL[m[1]]!=null)?NUMREL[m[1]]:parseInt(m[1],10);
      if(!isNaN(n)) mins=/hora|hr/.test(m[2]) ? n*60 : n;
    }
  }
  if(mins==null || mins<=0) return "";
  var base=(typeof nowMs==="number")?nowMs:Date.now();
  var d=new Date(base + Math.round(mins*60000));
  var f=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  var hh=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
  return {fecha:f, hora:hh};
}
/* cuando un recordatorio no trae hora ni día: suena en la PRÓXIMA franja del día
   —9:00, 12:00 o 16:00— y si ya pasaron las 4, a las 9:00 de mañana. Salvador
   2026-09-17. */
/* HORA AMBIGUA DE HOY (Salvador 2026-09-23): "a las 4:20" sin decir mañana/tarde,
   dicho a las 4:15 pm, es HOY a las 16:20, no las 4:20 am que ya pasaron. Si no
   dijo parte del dia, es para hoy, ya paso y +12 h todavia no: se toma la tarde. */
function horaCercana(fecha, hora, txt){
  if(!hora) return hora;
  var s=" "+String(txt||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")+" ";
  if(parteDelDia(s) || /\b(0\d|1[3-9]|2[0-3]):\d{2}\b/.test(s)) return hora;
  var h=parseInt(hora.slice(0,2),10), mm=hora.slice(3);
  if(isNaN(h) || h<1 || h>11) return hora;
  var pm=String(h+12).padStart(2,"0")+":"+mm;
  /* build 141 (Salvador 2026-09-25): de 1 a 5 sin decir = de la tarde,
     cualquier dia; de 6 a 11 = de la mañana (salvo hoy si ya paso, abajo). */
  if(h<=5) return pm;
  if(fecha!==hoy()) return hora;
  var ya=nowHM();
  return (hora<=ya && pm>ya) ? pm : hora;
}
/* build 141: ¿dijo la parte del dia? "de la mañana/tarde/noche", am/pm,
   mediodia... OJO: "mañana" solo (el dia de mañana) NO es parte del dia. */
function parteDelDia(s){
  s=" "+String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")+" ";
  return /\b(de|en|por|a)\s+la\s+(manana|tarde|noche|madrugada)\b|\b(tarde|noche|madrugada|mediodia|medianoche|am|pm)\b|\ba\.\s?m\b|\bp\.\s?m\b|\btemprano\b/.test(s);
}
/* build 141: la hora dicha sin mañana/tarde (1 a 11, no 24 h ni "en 20 min").
   Devuelve la hora en numero, o 0 si no hay duda. */
function horaAmbigua(txt){
  if(!horaDicha(txt) || relativoDicho(txt) || parteDelDia(txt)) return 0;
  var s=String(txt||"").toLowerCase();
  if(/\b(0\d|1[3-9]|2[0-3]):\d{2}\b/.test(s)) return 0;
  var hv=horaValor(txt), h=parseInt(String(hv).slice(0,2),10);
  return (h>=1 && h<=11) ? h : 0;
}
/* build 141: el aviso ya quedo con la hora por omision; en el hilo se
   pregunta "¿5 de la mañana o de la tarde?" y la respuesta la corrige. */
function preguntaAmPm(t, ids, dicho){
  var h=horaAmbigua(dicho); if(!h) return false;
  var mm=String(horaValor(dicho)).slice(3)||"00";
  t.pide_ampm={ids:ids, h:h, mm:mm, ts:Date.now()};
  msg(t,"bi","¿"+h+(mm!=="00"?":"+mm:"")+" de la mañana o de la tarde?");
  return true;
}
/* la respuesta: "de la tarde" / "pm" / "noche" -> tarde; "mañana" / "am" -> mañana */
function respuestaAmPm(v){
  var s=" "+String(v||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")+" ";
  if(s.trim().split(/\s+/).length>6) return "";
  if(/\b(tarde|noche|pm)\b|\bp\.\s?m\b/.test(s)) return "pm";
  if(/\b(manana|madrugada|am|temprano)\b|\ba\.\s?m\b/.test(s)) return "am";
  return "";
}
function aplicaAmPm(t, cual){
  var p=t.pide_ampm; t.pide_ampm=null; if(!p) return "";
  var nh=String(cual==="pm"?p.h+12:p.h).padStart(2,"0")+":"+p.mm;
  (p.ids||[]).forEach(function(id){
    if(id==="self" && t.es_recordatorio){ t.aviso_hora=nh; t.avisado_en=null; t.sin_alarma=null; }
    else (t.avisos||[]).forEach(function(a){ if(String(a.ts)===String(id)){ a.hora=nh; a.avisado_en=null; } });
  });
  return nh;
}
/* quita la hora dicha del titulo de un recordatorio ("4:20 prende camioneta") */
function sinHoraEnTitulo(txt){
  var s=String(txt||"")
    .replace(/\b(hoy|ma[nñ]ana)\s+/gi," ")
    .replace(/\ba\s+la(s)?\s+\d{1,2}([:.]\d{2})?\s*(am|pm|a\.?m\.?|p\.?m\.?|hrs?|horas?)?\b/gi," ")
    .replace(/\b\d{1,2}[:.]\d{2}\s*(am|pm|a\.?m\.?|p\.?m\.?|hrs?|horas?)?\b/gi," ")
    .replace(/\b\d{1,2}\s*(am|pm|a\.?m\.?|p\.?m\.?)\b/gi," ")
    .replace(/\s+/g," ").trim().replace(/^(de|para|a|que|,|\.)\s+/i,"")
    .replace(/^\d{1,2}\s+/,"").replace(/^(de|para|a|que)\s+/i,"").trim();
  return s.length>=3 ? conMayuscula(s) : String(txt||"");
}
function proximaFranja(){
  var d=new Date(), franjas=[9,12,16];
  for(var i=0;i<franjas.length;i++){
    if(d.getHours()<franjas[i]) return {fecha:hoy(), hora:String(franjas[i]).padStart(2,"0")+":00"};
  }
  return {fecha:dmDe(hoy(),1), hora:"09:00"};
}
/* ¿de qué PARTE del día habla? "en la mañana", "a mediodía", "por la tarde",
   "en la noche". Devuelve la clave o "". Salvador 2026-09-17. */
function parteDelDia(txt){
  var s=" "+String(txt||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")+" ";
  if(/\b(a|al|el|en)\s+(el\s+)?mediodia\b/.test(s) || /\bmediodia\b/.test(s)) return "mediodia";
  if(/\b(por|en|a|de)\s+la\s+manana\b/.test(s)) return "manana";
  if(/\b(por|en|a|de)\s+la\s+tarde\b/.test(s))  return "tarde";
  if(/\b(por|en|a|de)\s+la\s+noche\b/.test(s))  return "noche";
  return "";
}
/* RANGOS de cada parte (Salvador 2026-09-17): mañana 8–11, mediodía 12–15,
   tarde 15–19, noche 19–22. */
var RANGO_PARTE={manana:[8,11],mediodia:[12,15],tarde:[15,19],noche:[19,22]};
/* HORA INTELIGENTE de una parte del día, según la hora en que se pide (Salvador
   2026-09-17). La idea: si el periodo TODAVÍA no empieza o ya se brincó a mañana,
   el recordatorio cae en el ARRANQUE del periodo, para que tenga todo el periodo
   para ejecutarlo. Solo cuando YA estás dentro se hace algo intermedio.
   - si ya pasó esa parte hoy    -> mañana, al ARRANQUE del rango
   - si todavía no llega hoy      -> hoy, al ARRANQUE del rango
   - si estás DENTRO de la parte  -> a la mitad entre AHORA y el fin del rango,
     nunca a menos de ~45 min (para que no sea "ahoritita").
   Se redondea a la media hora. `nowDec` es opcional (para pruebas). */
function horaEnParte(part, nowDec){
  var R=RANGO_PARTE[part]; if(!R) return null;
  var start=R[0], end=R[1], fecha=hoy(), t;
  var ahora;
  if(typeof nowDec==="number") ahora=nowDec;
  else { var d=new Date(); ahora=d.getHours()+d.getMinutes()/60; }
  if(ahora>=end){ fecha=dmDe(hoy(),1); t=start; }             // ya pasó -> mañana, arranque
  else if(ahora<start){ t=start; }                            // aún no llega hoy -> arranque
  else { t=(ahora+end)/2; if(t<ahora+0.75) t=ahora+0.75; }    // dentro -> mitad hacia el fin
  var mins=Math.round(t*60/30)*30, hh=Math.floor(mins/60), mm=mins%60;
  if(hh>=24){ hh=23; mm=30; }
  return {fecha:fecha, hora:String(hh).padStart(2,"0")+":"+String(mm).padStart(2,"0")};
}
/* "en la tarde" sin número -> {fecha,hora} calculada. "" si no menciona parte. */
function franjaVaga(txt, nowDec){
  var p=parteDelDia(txt);
  if(!p) return "";
  return horaEnParte(p, nowDec);
}
/* ¿lo dictado como recordatorio trae SOLO tiempo, sin decir QUÉ recordar? (ej.
   "recuerdame por la tarde"). Se quitan las palabras de tiempo y de "recuerdame";
   si no queda nada, no hay asunto y hay que preguntar. Salvador 2026-09-17. */
function soloEsTiempo(txt){
  var s=String(txt||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  s=s.replace(/\b(recuerdame|recuerdanos|recuerda|acuerdame|acuerdate|ponme( un)? recordatorio( de| para)?|recordatorio)\b/g," ")
     .replace(/\b(por|en|a|de)\s+la\s+(manana|tarde|noche)\b/g," ")
     .replace(/\ba\s+la(s)?\s+(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|\d{1,2})([:.]\d{2})?\b/g," ")
     .replace(/\b\d{1,2}([:.]\d{2})?\s*(de\s+la\s+(manana|tarde|noche)|am|pm|horas?|hrs?)\b/g," ")
     .replace(/\b(hoy|manana|pasado\s+manana|lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/g," ")
     .replace(/\b(mediodia|medianoche|todos los dias|cada dia|diario|diariamente|cada semana|semanal|cada mes|mensual)\b/g," ")
     .replace(/\b(el|la|los|las|un|una|de|del|para|a|en|que|me|te|este|esta)\b/g," ")
     .replace(/[^a-z0-9]/g," ").replace(/\s+/g," ").trim();
  return s.length===0;
}
function diaDicho(txt){
  /* build 190: sale del nucleo de fechas (fechasDichas). "de la mañana", "a las 10",
     "10:30" son HORA, no dia (Salvador 2026-09-17). "hoy" explicito manda (como antes).
     Antes regresaba null con "2 de noviembre" y la fecha se le dejaba a Claude: ahora la
     fecha con mes TAMBIEN la pone el telefono (MANDA LA FECHA DICTADA). Fecha en duda
     ("lunes 4" y el 4 es domingo) -> null; dudaFecha() trae la pregunta. Varias fechas:
     la primera exacta (con numero); si no hay, la primera dicha (antes ganaba la del
     orden domingo..sabado, no la que se dijo primero). */
  var r=fechasDichas(txt), L=r.lista;
  if(r.dudas.length || !L.length) return null;
  if(L.some(function(x){ return x.k==="hoy"; })) return hoy();
  var ex=L.filter(_esExacta);
  return (ex.length?ex:L)[0].f;
}
/* build 140: TODAS las fechas dichas, en orden ("el lunes y el miercoles"). build 190:
   del nucleo; si alguna esta en duda, no regresa ninguna (se pregunta). */
function diasDichos(txt){
  var r=fechasDichas(txt), out=[];
  if(r.dudas.length) return [];
  r.lista.forEach(function(x){ if(out.indexOf(x.f)<0) out.push(x.f); });
  return out;
}
/* saca un nombre presentable de un dictado tipo "abreme una tarea del viaje a
   Madrid: me hospedo en el Riu". Quita el "abre tarea de" del principio y se
   queda con lo de antes de los dos puntos, que es el titulo. */
/* CUANTO PEGA una tarea con unas pistas. Cuenta raices de palabra en comun y
   pide DOS para dar por buena la coincidencia (una sola basta si la pista era
   una sola palabra). Sin esto, "comprar las sillas de la SALA DE JUNTAS" pegaba
   con "JUNTA con los socios" por una palabra suelta, y una tarea nueva se
   confundia con una que ya existia. Salvador 2026-09-05. */
function pegaFuerte(t, pistas){
  var pr=palabras(pistas||"").map(raiz);
  var tw=palabras([t.nombre,t.revisar||""].join(" ")).map(raiz);
  var n=0; pr.forEach(function(r){ if(tw.indexOf(r)>=0) n++ });
  return (n>=2 || (pr.length===1 && n===1)) ? n : 0;
}
/* el nombre de una tarea NO carga la fecha: la fecha ya es su propio campo y
   repetirla ensucia la lista ("Cortar el pasto del jardin EL VIERNES"). */
function sinLaFecha(txt){
  return String(txt||"")
    .replace(/\s*[,·-]?\s*\b(el|este|proximo|próximo|para el|para)?\s*(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|ma[ñn]ana|hoy|pasado ma[ñn]ana)\b\s*$/i,"")
    .replace(/\s*[,·-]?\s*\b(el|para el)?\s*\d{1,2}\s+de\s+[a-záéíóú]+\s*$/i,"")
    .trim().replace(/[.,;·-]+$/,"").trim();
}
/* la primera letra en mayuscula: las tareas se ven en lista y una minuscula
   suelta entre puros titulos se ve como error */
function conMayuscula(t){
  t=String(t||"").trim();
  return t ? t.charAt(0).toUpperCase()+t.slice(1) : t;
}
/* build 196 (Salvador 2026-10-04 11:43): TITULOS con mayuscula inicial en cada palabra, menos
   conectores (de, la, con, para...). La primera palabra siempre con mayuscula. Siglas (BBVA, PTR,
   CFE) y marcas con mayusculas por dentro (iPhone, McAllen) se quedan como estan; numeros igual. */
var TITULO_CONECTORES=["de","del","la","las","el","los","y","e","o","u","a","al","en","con","por","para","sin","sobre","entre","que","un","una","unos","unas","se","su","sus","lo"];
function tituloTarea(txt){
  var s=String(txt==null?"":txt).replace(/\s+/g," ").trim(); if(!s) return s;
  var primera=true;
  return s.split(" ").map(function(w){
    var i=w.search(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/); if(i<0){ return w; }
    var letras=w.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g,""), base=letras.toLowerCase();
    var esPrimera=primera; primera=false;
    if(letras.length>=2 && letras===letras.toUpperCase() && /[A-ZÁÉÍÓÚÜÑ]/.test(letras) && TITULO_CONECTORES.indexOf(base)<0) return w;   /* sigla */
    if(/[A-ZÁÉÍÓÚÜÑ]/.test(letras.slice(1)) && letras!==letras.toUpperCase()) return w;                                            /* marca: iPhone, McAllen */
    if(!esPrimera && TITULO_CONECTORES.indexOf(base)>=0 && letras.length===w.length) return w.toLowerCase();
    return w.slice(0,i)+w.charAt(i).toUpperCase()+w.slice(i+1);
  }).join(" ");
}
function nombreDeLoDicho(dicho){
  var t=String(dicho||"").trim();
  t=t.replace(/^.*?\b(tareas?|pendientes?)\b\s*/i,"");
  t=t.replace(/^(del|de la|de los|de las|de|para|:)\s*/i,"");
  var dp=t.indexOf(":"); if(dp>2) t=t.slice(0,dp);
  t=t.trim().replace(/[.,;]+$/,"");
  if(!t) t=String(dicho||"").trim();
  return t.charAt(0).toUpperCase()+t.slice(1);
}
/* ¿NOMBRARON A ALGUIEN DEL EQUIPO? Devuelve su clave, o "". Se compara sin
   acentos y por palabra completa, para que "Josué" y "josue" sean el mismo y
   para que "Carlos" no pegue dentro de otra palabra. */
function quienDicho(txt){
  var t=" "+String(txt||"").toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")+" ";
  var hit="";
  Object.keys(PERSONAS).forEach(function(k){
    if(hit) return;
    var n=String((PERSONAS[k]&&PERSONAS[k].nombre)||k).toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    if(new RegExp("(^|[^a-z])"+n+"([^a-z]|$)").test(t)) hit=k;
  });
  return hit;
}
var VERBOS_ACCION=/\b(compr|paga|pague|deposit|llam|habl|manda|envi|revis|chec|verific|arregl|repar|cambi|instal|limpi|cotiz|contrat|firm|entreg|recog|lleva|trae|program|agend|confirm|autoriz|cobr|factur|renov|renue|solicit|tramit|busc|consig|prepar|termin|acab|poda|pode|riega|riegue|pint|cort|saca|saque|pon|hace|haga|quit|met|sub|baj|abr|cierr|cerr|avis|coment|ajust|sold|barr|sell|mid|med|marc|plant|sembr|fumig|desazolv|desmont|arm|carg|descarg|surt|abast|reemplaz|reponer|repon|afin|lav|sec|orden|acomod|guard|imprim|escane|copi|firm|sell|coloc|ancl|nivel|desyerb|escarb|excav|tap|destap|conect|desconect|prend|apag)/i;
/* ¿HAY ALGO QUE EJECUTAR? Dos señales, con que pegue una basta:
   la lista de verbos de arriba, o que el TITULO que escribió Claude empiece en
   infinitivo — Claude siempre titula así lo que se hace ("Cortar el pasto"),
   y eso ya es su propio dictamen de que hay trabajo. Una lista de verbos sola
   nunca alcanza: se olvidó "cortar" y por eso siguió preguntando de más. */
function hayQueHacerAlgo(dicho, j){
  if(VERBOS_ACCION.test(String(dicho||""))) return true;
  var tit=String((j&&((j.tarea&&j.tarea.nombre)||j.titulo))||"").trim();
  return /^[a-záéíóúñ]+(ar|er|ir)\b/i.test(tit.normalize("NFC"));
}

/* build 147: sinonimos para detectar si la pregunta es del tipo "que hice /
   que elimine hoy", para decidir si se ofrece el boton "Ver mas" (historial
   completo). Coincide con los sinonimos que ya trae SYS_BARRA 2b. */
var RE_CERRADAS_Q=/\b(qu[eé]\s+(hice|hizo|complet[eé]|termin[eé]|elimin[eé]|cancel[eé]))\b|\blogr[eé]\b|\bavanc[eé]\b|\bcerr[eé]\b|\btach[eé]\b|\bresolv[ií]\b|\bc[oó]mo\s+me\s+fue\b|\ben\s+qu[eé]\s+trabaj[eé]\b|\bresumen\s+del\s+d[ií]a\b|\bcancel[eé]\b|\bquit[eé]\b|\bdesech[eé]\b|\bbot[eé]\b|\bsaqu[eé]\s+de\s+la\s+lista\b|\bya\s+no\s+aplica\b/i;
function aplicaIntencion(j, dicho, hist, foto){
  var i=String(j.intencion||"").toUpperCase().replace(/[^A-Z_]/g,"");
  if(SINONIMOS_INT[i]) i=SINONIMOS_INT[i];
  hist = hist || [];

  /* build 149 (Salvador 2026-09-29): "manda / avisale / comentale / dile / escribele
     (whatsapp o mensaje) a X que ..." = MENSAJERIA, sale AHORA, sin preguntar fecha
     ni contacto. No hace falta decir WhatsApp. Sale por WhatsApp y queda ligado al
     hilo de la tarea (las respuestas vuelven a los dos lados). Si X es del equipo
     (PERSONAS) y no dijo whatsapp, sigue el camino de siempre (encargo/comentario).
     "mi cel / mi celular" = su propio chat ("Salvador Necochea (Tú)"). */
  try{
    var _dW=String(dicho||"").replace(/\b(a|para|con)\s+(gris|sinthia|cinthia|cintia|sintia|zinthia)\b/ig,function(m,a){ return a+" Cynthia" });
    var _mW=_dW.match(/\b(?:m[aá]nda(?:r|le|me)?|env[ií]a(?:r|le)?|escr[ií]be(?:le)?|av[ií]sa(?:le|r)?|com[eé]nta(?:le|r)?|d[ií]le|d[ií]game|p[oó]n(?:le|gale)?)\s+(?:un\s+)?(?:(whats?\s?app|whats|wasap|guasap|mensaje|aviso)\s+)?(?:a|al)\s+(.+?)\s*,?\s+(?:(?:para\s+)?que(?:\s+(?:le\s+)?(?:dig(?:as|a)|dice|dijera))?|diciendo(?:le)?|con\s+el\s+(?:texto|mensaje))\s*:?\s*(?:que\s+)?(.+)$/i);
    if(_mW && !(j.whatsapp && j.whatsapp.programa)){
      var _cW=_mW[2].trim(), _tW=_mW[3].trim().replace(/[.\s]+$/,"");
      var _mio=/^(mi|m[ií])\s+(cel|celular|m[oó]vil|whats(app)?|tel[eé]fono)$/i.test(_cW);
      if(_mio) _cW="Salvador Necochea (Tú)";
      /* build 150: "en mi tarea de X" = la tarea donde va */
      var _tarH=_dW.match(/\ben\s+(?:mi|la|esta)\s+tarea\s+(?:de\s+)?(.+?)\s*(?:,|\s+que\s|\s+ya\s|por\s+favor|m[aá]nd|av[ií]s|d[ií]l|p[oó]n|com[eé]nt|env)/i);
      /* build 150: "... tambien compartelo / compartele el formato X" = ademas comparte el archivo */
      var _a2=null;
      var _mS=_tW.match(/(?:\s+|[,.]\s*)(?:y\s+)?(?:tambi[eé]n\s+)?comp[aá]rt\S*\s+(?:(?:el|la|lo)\s+)?(.+)$/i);
      if(_mS){ _a2=_mS[1].trim().replace(/[.\s]+$/,"");
        var _sl=_a2.match(/se\s+llama\s+(.+?)(?:\s+o\s+algo|\s+lo\s+acabo|$)/i);
        _a2=_sl?_sl[1].trim():_a2.replace(/\s+que\s+tengo\s+en\s+mi.*$/i,"").replace(/^archivo\s+/i,""); _tW=_tW.slice(0,_mS.index).trim(); }
      _tW=_tW.replace(/\s*(?:el|la)\s+\S+\s+(?:est[aá]|lo\s+tengo)\s+en\s+mi\s+(?:google\s+)?drive/i,"").trim();
      if(/^llene\b/i.test(_tW)) _tW="Por favor "+_tW.replace(/^llene\b/i,"llena");
      if(_tW){ i="WHATSAPP"; j.intencion="WHATSAPP"; j.whatsapp={contacto:_cW,texto:_tW,tarea:_tarH?_tarH[1].trim():"",archivo2:_a2}; }
    }
  }catch(e){}
  /* build 149: CORREO ("correo" o "mail") y ARCHIVO (compartir/dar/pasar/enviar el
     archivo). Se dejan en la misma cola; el trabajador los ejecuta con Gmail/Drive
     y la respuesta vuelve al hilo de la tarea. */
  try{
    var _d2=String(dicho||"");
    var _quien=function(c){ c=String(c||"").trim();
      if(/^(a\s+)?(m[ií]|m[ií]\s+mism[oa]|yo|yo\s+mism[oa]|mi\s+(correo|mail|email))$/i.test(c)){
        var _k=Object.keys(CORREOS_SEMILLA).filter(function(x){ return CORREOS_SEMILLA[x]===yo })[0];
        return _k||c; }
      return c; };
    var _mC=_d2.match(/\b(?:m[aá]nda(?:r|le|me)?|env[ií]a(?:r|le)?|escr[ií]be(?:le)?|p[aá]sa(?:le)?)\s+(?:un\s+)?(?:correo|mail|e-?mail)\s+(?:a|al|para)\s+(.+?)\s*,?\s+(?:con\s+asunto\s*:?\s*(.+?)\s*,?\s+(?:que(?:\s+diga)?|diciendo|y\s+(?:que\s+)?diga)\s*:?\s*(.+)|(?:que(?:\s+(?:diga|dice|le\s+diga))?|diciendo(?:le)?)\s*:?\s*(.+))$/i);
    var _mC2=!_mC && _d2.match(/\b(?:m[aá]nda(?:r|le|me)?|env[ií]a(?:r|le)?|escr[ií]be(?:le)?)\s+(?:un\s+)?(?:correo|mail|e-?mail)\s+(?:a|al|para)\s+(.+?)\s+con\s+asunto\s*:?\s*(.+)$/i);
    if(_mC){
      var _cuerpo=(_mC[3]||_mC[4]||"").trim().replace(/[.\s]+$/,"");
      var _asu=(_mC[2]||"").trim() || _cuerpo.split(/\s+/).slice(0,6).join(" ");
      if(_cuerpo){ i="WHATSAPP"; j.intencion="WHATSAPP";
        j.whatsapp={contacto:_quien(_mC[1]),texto:_cuerpo,asunto:_asu,canal:"correo",tarea:""}; }
    } else if(_mC2){
      i="WHATSAPP"; j.intencion="WHATSAPP";
      j.whatsapp={contacto:_quien(_mC2[1]),texto:_mC2[2].trim(),asunto:_mC2[2].trim(),canal:"correo",tarea:""};
    }
    var _mA=!(_mC||_mC2) && _d2.match(/\b(?:comp[aá]rte(?:le|les)?|comparte(?:le|les)?|d[aá](?:le|les)?|p[aá]sa(?:le|les)?|m[aá]nda(?:le|les)?|env[ií]a(?:le|les)?)\s+(?:una\s+copia\s+de(?:l|\s+la)?\s+|el\s+|la\s+)?(archivo|documento|pdf|excel|hoja|presentaci[oó]n|foto)\s+(.+?)\s+(?:a|al|para)\s+(.+)$/i);
    if(_mA){
      var _arch=(_mA[1]+" "+_mA[2]).replace(/^(archivo|documento)\s+(de|del)?\s*/i,"").trim();
      var _arch2=_mA[2].replace(/^(de|del|de la)\s+/i,"").trim();
      i="WHATSAPP"; j.intencion="WHATSAPP";
      j.whatsapp={contacto:_quien(_mA[3]),texto:_arch2,archivo:_arch2,canal:"archivo",tarea:""};
    }
  }catch(e){}

  var _dd=diaDicho(dicho);
  if(_dd){
    if(j.tarea && j.tarea.fecha)             j.tarea.fecha=_dd;
    if(j.recordatorio && j.recordatorio.fecha) j.recordatorio.fecha=_dd;
    if(j.paso && j.paso.cuando)              j.paso.cuando=_dd;
  }

  /* ===== LO QUE SE PUEDE DECIDIR EN EL TELEFONO, NO SE LE DEJA A CLAUDE =====
     Salvador 2026-09-05. Dos reglas suyas que el modelo seguia fallando aunque
     estuvieran escritas en el prompt. Son verificables aqui, asi que aqui se
     resuelven y se le gana a lo que haya contestado.

     1) "ABRE TAREA" ES CREAR, SIEMPRE. Si dijo literalmente que quiere abrir o
        crear una tarea, eso manda — aunque el tema se parezca a una que ya
        existe. Fallaba clasificandolo como PASO o como BUSCAR y el dictado se
        iba a la tarea equivocada. */
  var _pideAbrir=/\b(abre|abre?me|crea|crea?me|levanta|apunta|apunta?me|agrega|mete)\s+(me\s+)?(una\s+|la\s+|el\s+)?(tarea|pendiente)\b/i
      .test(String(dicho||"").normalize("NFD").replace(/[\u0300-\u036f]/g,""));
  /* PERO no pisa a Claude si de verdad hay una tarea que pega fuerte con lo
     dicho: "abreme LA tarea del viaje a Madrid" tambien puede querer decir
     "enseñamela", y ahi el que sabe leer la frase es Claude, no un renglon de
     codigo. La regla solo entra cuando no hay ninguna que pegue: ahi "abre
     tarea" no puede significar otra cosa que crear una. */
  if(_pideAbrir && ["CREAR","ENVIAR"].indexOf(i)<0 && i!=="PREGUNTA"){
    var _yaHay=false;
    try{ _yaHay=tareas.some(function(t){ return !t.cierre && pegaFuerte(t,dicho)>=2 }) }catch(e){}
    if(_yaHay) _pideAbrir=false;
  }
  if(_pideAbrir && ["CREAR","ENVIAR"].indexOf(i)<0 && i!=="PREGUNTA"){
    i="CREAR";
    if(!j.tarea || !j.tarea.nombre){
      j.tarea={nombre:nombreDeLoDicho(dicho),
               duenio:yo, fecha:(j.paso&&j.paso.cuando)||"", cierra:"", criticidad:"normal",
               periodicidad:null, recuperable:true, gasto:""};
    }
  }



  /* CANDADO CONTRA PREGUNTAR DE MAS — Salvador 2026-09-05, viendolo en su
     telefono: dicto "que Josue corte el pasto del jardin el viernes" y la app
     le contesto "¿cual jardin y a que hora el viernes?". Las dos preguntas
     sobran: la HORA el sistema ni la usa (trabaja por dias), y CUAL JARDIN no
     lo sabe el que dicta sino el que va a cortar el pasto.
     Asi que si la app ya pudo resolver QUIEN y QUE DIA, y hay un verbo de
     accion, YA ESTAN LOS TRES DATOS y no se pregunta: se crea. Decirselo en el
     prompt ayudo pero no siempre obedecia; esto ya no depende de el.
     No aplica cuando la intencion trae 'supervisar' (ahi si faltan dos fechas
     distintas y la pregunta es legitima). */
  /* EXCEPCION DEL DINERO: si la tarea mueve plata y NO dijeron cuanto, esa
     pregunta SI es de las cuatro que valen — el que autoriza necesita el monto
     enfrente. Ahi no se pisa la pregunta de Claude. */
  var _plata=/\b(pag|paga|pague|deposit|compr|autoriz|cotiz|abon|liquid|transfer|factur)/i.test(String(dicho||""));
  var _autoriza=/\bautoriz/i.test(String(dicho||""));
  var _traeMonto=/(\$\s*\d|\b\d{3,}\b|\bmil\b|\bpesos\b)/i.test(String(dicho||"")) ||
                  !!(j.tarea&&j.tarea.gasto);
  if(i==="PREGUNTA" && !j.supervisar && !(_autoriza && !_traeMonto) &&
     quienDicho(dicho) && diaDicho(dicho) && hayQueHacerAlgo(dicho, j)){
    var _qd=quienDicho(dicho), _cd=diaDicho(dicho);
    var _nom=conMayuscula(sinLaFecha((j.tarea&&j.tarea.nombre)||
             String(j.titulo||"").replace(/[.…]+$/,"").trim()||
             nombreDeLoDicho(dicho)));
    j={intencion:"CREAR", titulo:_nom,
       tarea:{nombre:_nom, duenio:_qd, fecha:_cd,
              cierra:(j.tarea&&j.tarea.cierra)||"", revisar:"",
              criticidad:"normal", periodicidad:null, recuperable:true,
              gasto:(j.tarea&&j.tarea.gasto)||"",
              pasos:(j.tarea&&j.tarea.pasos)||j.pasos||null},
       datos:j.datos||[]};
    i="CREAR";
  }

  /* RED: si aun asi colgo "¿y a que hora?" en la pregunta, se le quita. La hora
     el motor no la usa para nada, asi que preguntarla nunca puede ser correcto.
     Solo se recorta ese pedazo; el resto de la pregunta se respeta tal cual. */
  if(i==="PREGUNTA" && j.pregunta){
    var _p=String(j.pregunta)
      .replace(/\s*,?\s*(y\s+)?¿?\s*a\s+qu[eé]\s+horas?\s*[?¿]*/gi," ")
      .replace(/\s*\by\s*\?/g,"?")
      .replace(/\s{2,}/g," ").trim();
    /* si al quitar la hora quedo una pregunta a medias o vacia, se rearma con
       el hueco que de verdad falta, en vez de dejarla coja */
    if(/^[¿\s?]*$/.test(_p) || !/\?$/.test(_p)){
      var _faltaQ=!quienDicho(dicho), _faltaC=!diaDicho(dicho);
      _p = (_faltaQ&&_faltaC) ? "¿Quién lo hace y para cuándo?"
         : (_faltaC ? "¿Para cuándo?"
         : (_faltaQ ? "¿Quién lo hace?" : ""));
    }
    j.pregunta=_p;
    if(!_p){ /* no falta nada de lo esencial: se crea, no se pregunta */
      i="CREAR";
      if(!j.tarea || !j.tarea.nombre){
        j.tarea={nombre:conMayuscula(sinLaFecha(String(j.titulo||"").replace(/[.…]+$/,"").trim()||nombreDeLoDicho(dicho))),
                 duenio:quienDicho(dicho)||yo, fecha:diaDicho(dicho)||"",
                 cierra:"", revisar:"", criticidad:"normal",
                 periodicidad:null, recuperable:true, gasto:""};
      }
    }
  }

  /* FALTA UN DATO -> NADA SE PIERDE: se crea al bote naranja con la pregunta,
     en vez de bloquear con un cuestionario que si no se contesta pierde la tarea. */
  if(i==="PREGUNTA" && j.pregunta){
    var _pn=conMayuscula(sinLaFecha(String(j.titulo||"").replace(/[.\u2026]+$/,"").trim()
             || (j.tarea&&j.tarea.nombre) || nombreDeLoDicho(dicho)));
    var _pd=(j.tarea&&j.tarea.duenio&&PERSONAS[j.tarea.duenio])?j.tarea.duenio:(quienDicho(dicho)||yo);
    var _pf=(j.tarea&&j.tarea.fecha)||diaDicho(dicho)||"";
    var _pt=/cu[a\u00e1]ndo|fecha|qu[e\u00e9]\s+d[i\u00ed]a/i.test(j.pregunta)?"fecha"
           :(/cu[a\u00e1]nto|monto|precio|tope/i.test(j.pregunta)?"monto":"dato");
    creaIncompleta({nombre:_pn, duenio:_pd, fecha:_pf,
      gasto:(j.tarea&&j.tarea.gasto)||"", dicho:dicho}, j.pregunta, _pt, foto);
    return;
  }

  /* NARRAR estado */
  if(i==="RESPONDER"){
    /* si el dato salio de una tarea, se deja el acceso para verla completa */
    var org0=j.abrir_tarea ? tareas.filter(function(x){return x.id===j.abrir_tarea})[0] : null;
    /* build 145: si la pregunta salio de DENTRO de esa misma tarea, se
       contesta ahi, en su hilo -- sin tarjeta ni boton para "explorarla"
       cuando ya la tienes abierta enfrente. Salvador 2026-09-27. */
    if(org0 && window.__origenHilo===org0.id){
      window.__origenHilo=null;
      msg(org0,"bo",dicho); msg(org0,"bi", j.respuesta||"No supe qué contestar con lo que tengo.");
      org0.ultima=PERSONAS[yo].nombre+": "+dicho; guarda(org0);
      abierta=org0.id; barraEstado=null; consulta=""; fotoEnMano=null; vista="hilo"; render(); return;
    }
    /* build 147: "que hice / elimine hoy" viene con tope de 7 dias por
       default; si NO se pidio ya con completo=true, se ofrece "Ver mas"
       para volver a preguntar sobre TODO el historial. */
    var _verMas=RE_CERRADAS_Q.test(dicho) && !window.__barraCompleto;
    barraEstado={modo:"respuesta", dicho:dicho, consulta:true,
      abrir:(org0?org0.id:null),
      datos:(j.datos&&j.datos.length?j.datos:datosDelTexto(j.respuesta||"")),
      texto:(j.respuesta||"No supe que contestar con lo que tengo."),
      ops:(_verMas?[{k:"ver_mas_cerr", t:"Ver más"}]:null)};
    vista="barra"; render(); return;
  }

  /* BUSCAR — o, si hay foto, pegarla a la tarea que Claude senalo */
  if(i==="BUSCAR"){
    if(foto){
      var cand=busca(j.terminos||dicho).filter(function(t){ return !t.cierre });
      if(cand.length===1){
        pegaFotoA(cand[0], foto);
        barraEstado={modo:"respuesta", dicho:dicho, abrir:cand[0].id,
          texto:"La foto quedó pegada a “"+cand[0].nombre+"”."};
        vista="barra"; render(); return;
      }
      barraEstado={modo:"respuesta", dicho:dicho, texto:(cand.length
        ? "Encontré "+cand.length+" que pegan con eso. No adivino a cuál: "+
          "ábrela y pégale la foto ahí, o dímelo con el nombre exacto."
        : "No encontré ninguna que pegue con eso.")};
      vista="barra"; render(); return;
    }
    barraEstado=null; consulta=(j.terminos||dicho); vista="lista"; render();
    return;
  }

  /* SUPERVISAR — lo ejecuta OTRO y yo me quedo la revision (Salvador 2026-09-04).
     Salen DOS cosas: la tarea del que ejecuta (si es del equipo y no existe ya) y
     MI tarea de revision, ligada a ella, con MI fecha y con semaforo normal. */
  if(i==="SUPERVISAR"){
    var sv=j.supervisar||{};
    /* PRIMERO se busca si esa tarea YA EXISTE. Si existe, el QUE y el QUIEN ya
       se saben, asi que NO se vuelven a preguntar: solo falta cuando revisar
       (Salvador 2026-09-04). La pregunta se arma con los huecos REALES. */
    var ya=null;
    if(sv.__yaId){                       /* ya la escogio el en la lista */
      ya=tareas.filter(function(x){return x.id===sv.__yaId})[0]||null;
    }else if(!sv.__nueva){               /* dijo "ninguna": no se busca */
      var pistas=sv.tarea_existente||sv.que||"";
      /* Si dijo DE QUIEN es, se busca solo entre las de esa persona: mucho mas
         preciso. El que no lo dice no se castiga — ve la lista. Salvador
         2026-09-04: se educa premiando, no con instructivos. */
      var dq = PERSONAS[sv.de_quien] ? sv.de_quien : null;
      if(pistas){
        var filtra=function(x){
          if(x.revisa_a) return false;                       /* no revisar una revisión */
          if(x.cierre) return dDif(x.cierre.f||hoy(),hoy())<=20;  /* cerradas recientes sí */
          return true;
        };
        var cs=candidatas(pistas,dq,true).filter(filtra);
        /* dijo un nombre pero esa persona no tiene nada asi: se DICE, y se le
           enseñan las de los demas en vez de dejarlo sin nada */
        var sinLasDeEl=false;
        if(dq && !cs.length){
          cs=candidatas(pistas,null,true).filter(filtra);
          if(cs.length) sinLasDeEl=true;
        }
        var fuerza=function(t){
          var pr2=palabras(pistas).map(raiz);
          var tw2=palabras([t.nombre,t.revisar].join(" ")).map(raiz);
          var n2=0; pr2.forEach(function(r){ if(tw2.indexOf(r)>=0) n2++ });
          return (n2>=2 || (pr2.length===1 && n2===1)) ? n2 : 0;
        };
        var buenas=cs.filter(function(t){ return fuerza(t)>0 });
        var lista=buenas.length?buenas:cs;
        /* SI SON DEMASIADAS, NO SE LE AVIENTA UNA LISTA LARGA: se le pide mas
           detalle. Salvador 2026-09-04: "si ves que vas a desplegar muchas,
           preguntale mas detalle de la tarea y quien es el responsable".
           Umbral: mas de 3 tareas, o mas de 2 personas distintas — eso quiere
           decir que la pista fue vaga. */
        var duenios=[];
        lista.forEach(function(t){ if(duenios.indexOf(t.duenio)<0) duenios.push(t.duenio) });
        if(!ya && lista.length && (lista.length>3 || duenios.length>2)){
          var hs2=hist.slice(); hs2.push("Claude pidio mas detalle de la revision");
          barraEstado={modo:"pregunta", dicho:dicho, hist:hs2, foto:foto,
            titulo:"Encontré "+lista.length+" que podrían ser"+
                   (duenios.length>1?", de "+duenios.length+" personas":""),
            pregunta:"Dime más de la tarea y quién es el responsable, para encontrarte la tuya."};
          vista="barra"; render(); return;
        }
        /* build 145: antes, con UNA sola coincidencia fuerte se pegaba sola,
           sin preguntar -- asi paso el caso real del Mori: se penso que ya
           sabia y adjunto el dictado a una tarea vieja sin que Salvador lo
           viera venir. Ahora, con 1 o mas, siempre se enseña la pantalla de
           escoger (un toque nomas); "crear tarea nueva" siempre sigue abajo.
           Salvador 2026-09-27. */
        if(buenas.length>=1 || (cs.length && !buenas.length)){
          barraEstado={modo:"escoge", dicho:dicho, hist:hist, foto:foto, sv:sv,
            ops:(buenas.length?buenas:cs).slice(0,6).map(function(t){return t.id}),
            nota:(sinLasDeEl?PERSONAS[dq].nombre+" no tiene ninguna que pegue con eso.":""),
            pregunta:(buenas.length===1?"¿Tiene que ver con esta tarea tuya?":"¿Tiene que ver con alguna de estas?")};
          vista="barra"; render(); return;
        }
      }
    }
    var okF=function(f){ return /^\d{4}-\d{2}-\d{2}$/.test(f||"") };
    var faltan=[];
    if(!ya){
      if(!sv.que) faltan.push("qué hay que revisar");
      if(!PERSONAS[sv.ejecuta] && !sv.externo) faltan.push("quién lo hace");
      else if(!okF(sv.fecha_ejecuta) && PERSONAS[sv.ejecuta]) faltan.push("para cuándo lo hace");
    }
    if(!okF(sv.mi_fecha)) faltan.push(ya?"cuándo quieres que te recuerde revisársela":"cuándo lo revisas");
    if(faltan.length){
      var hs=hist.slice(); hs.push("Claude pregunto por la revision");
      var pg=faltan.length===1 ? faltan[0]
           : faltan.slice(0,-1).join(", ")+" y "+faltan[faltan.length-1];
      pg="¿"+pg.charAt(0).toUpperCase()+pg.slice(1)+"?";
      var tit;
      if(ya){
        var nq=PERSONAS[ya.duenio]?PERSONAS[ya.duenio].nombre:"";
        tit="Esa ya es tarea de "+nq+(ya.f_vigente?" · "+fechaBonita(ya.f_vigente):"");
      }else tit=(sv.que?("Revisión · "+sv.que+"…"):"Revisión…");
      barraEstado={modo:"pregunta", dicho:dicho, hist:hs, foto:foto, titulo:tit, pregunta:pg};
      vista="barra"; render(); return;
    }
    if(ya && !sv.que) sv.que=ya.nombre;

    /* REVISAR MI PROPIA TAREA NO ES SUPERVISION. Salvador 2026-09-04: "si es
       tarea de ellos, esa revisión se convierte en un ritmo, un proceso del
       ritmo de la tarea". Se le dice y se guarda como PASO, no como revisión
       aparte — asi no se le llena la lista de revisiones de si mismo. */
    if(ya && ya.duenio===yo && (!PERSONAS[sv.revisa] || sv.revisa===yo)){
      /* build 145: "revisar el menu, los vinos, el acomodo de las mesas y la
         musica" no es UN paso -- son varios. Si lo dicho trae 2 o mas cosas
         (coma o "y"), se agregan como lista completa (regla u), igual que si
         la tarea hubiera nacido asi. Salvador 2026-09-27, caso real del Mori. */
      var _partes145=String(sv.que||"").split(/\s*,\s*|\s+y\s+(?=\S)/i)
        .map(function(x){ return x.trim(); }).filter(function(x){ return x.length>=2; });
      if(_partes145.length>=2){
        barraEstado={modo:"confirmar", accion:"pasos_multi", esRevision:true, dicho:dicho, foto:foto,
          renglones:[{k:"m",v:"Se agregan "+_partes145.length+" pasos"},
                     {k:"d",v:"A tu tarea: “"+ya.nombre+"”"},
                     {k:"d",v:juntaY(_partes145.map(conMayuscula))}],
          pendiente:{pasos_multi:{tareaId:ya.id, partes:_partes145}}};
        vista="barra"; render(); return;
      }
      barraEstado={modo:"confirmar", accion:"paso", esRevision:true, dicho:dicho, foto:foto,
        renglones:[{k:"m",v:sv.que},
                   {k:"d",v:"Esa tarea ya es tuya: “"+ya.nombre+"”"},
                   {k:"d",v:"Queda como paso tuyo para el "+fechaBonita(sv.mi_fecha)}],
        pendiente:{paso:{tareaId:ya.id, quien:"", texto:sv.que, cuando:sv.mi_fecha}}};
      vista="barra"; render(); return;
    }

    var revisor = PERSONAS[sv.revisa] ? sv.revisa : yo;
    var quien = ya ? ya.duenio : (PERSONAS[sv.ejecuta]?sv.ejecuta:"");
    var nomQuien = (quien&&PERSONAS[quien]) ? PERSONAS[quien].nombre : (sv.externo||"");
    var rens=[{k:"m",v:"Revisión · "+sv.que}];
    if(ya)              rens.push({k:"d",v:"Ya es tarea de "+nomQuien+": “"+ya.nombre+"” · no se duplica"});
    else if(quien)      rens.push({k:"d",v:"Se le manda a "+nomQuien+(sv.fecha_ejecuta?" para el "+fechaBonita(sv.fecha_ejecuta):"")});
    else if(sv.externo) rens.push({k:"d",v:nomQuien+" no está en la app · solo queda tu revisión"});
    rens.push({k:"d", v:(revisor===yo?"Tú la revisas el ":PERSONAS[revisor].nombre+" la revisa el ")+
      fechaBonita(sv.mi_fecha)});
    barraEstado={modo:"confirmar", accion:"supervisar", dicho:dicho, foto:foto,
      renglones:rens, pendiente:{supervisar:sv, yaId:(ya?ya.id:null), quien:quien, revisor:revisor}};
    vista="barra"; render(); return;
  }

  /* (la regla de "abre tarea" se movia aqui abajo y NUNCA se alcanzaba cuando
     Claude contestaba BUSCAR, porque BUSCAR se resuelve mas arriba. Ahora vive
     al principio de la funcion, junto a las demas correcciones de la app.) */

  /* 2) ENCARGO SOLO SI ESA TAREA YA ERA MIA. Regla dura suya: ninguna palabra
        clasifica. "Encargale a Karina que deposite la renta" NO es un encargo
        si nadie tenia esa tarea: es TAREA DE KARINA. Encargo es unicamente
        cuando el que habla YA la traia y le pasa la ejecucion sin soltarla.
        Eso se comprueba mirando SUS tareas abiertas — no hace falta que el
        modelo lo adivine, y adivinandolo fallaba casi siempre. */
  if(i==="ENCARGAR" && j.encargo && j.encargo.para && PERSONAS[j.encargo.para]){
    var _txt=String(j.encargo.texto||(j.tarea&&j.tarea.nombre)||"");
    var _mias=[];
    try{ _mias=candidatas(_txt, yo, false).filter(function(t){
           return t.duenio===yo && pegaFuerte(t,_txt)>0 }) }catch(e){}
    if(!_mias.length){
      var _f=(j.tarea&&j.tarea.fecha)||"";
      var _n=(j.tarea&&j.tarea.nombre)||_txt;
      j.tarea={nombre:_n, duenio:j.encargo.para, fecha:_f,
               cierra:(j.tarea&&j.tarea.cierra)||"", revisar:"",
               criticidad:(j.tarea&&j.tarea.criticidad)||"normal",
               periodicidad:(j.tarea&&j.tarea.periodicidad)||null,
               recuperable:true, gasto:(j.tarea&&j.tarea.gasto)||""};
      if(_dd) j.tarea.fecha=_dd;
      i="CREAR";
    }
  }

  /* SE EQUIVOCO DE CAJON. Pasa: contesta ENCARGAR pero llena 'tarea' con dueño,
     o al reves. La informacion esta completa, nomas viene en el cajon de junto:
     antes eso moria en "no me quedo claro a quien" y el dictado se perdia. */
  if(i==="ENCARGAR" && (!j.encargo||!j.encargo.para) && j.tarea && j.tarea.duenio &&
     PERSONAS[j.tarea.duenio]) i="CREAR";
  if(i==="CREAR" && (!j.tarea||!j.tarea.nombre) && j.encargo && j.encargo.para &&
     PERSONAS[j.encargo.para]) i="ENCARGAR";

  /* ENCARGAR */
  if(i==="ENCARGAR"){
    var e=j.encargo||{};
    if(!e.para || !PERSONAS[e.para] || !e.texto){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"Entendí que le pides algo a alguien, pero no me quedó claro a quién. "+
              "Dilo con su nombre."};
      vista="barra"; render(); return;
    }

    /* INYECCIÓN PUSH INSTANTÁNEO */
    if (j.encargo && j.encargo.para) {
      var nombreQuien = (PERSONAS[yo] && PERSONAS[yo].nombre) || yo;
      disparaPushInstantaneo(
        j.encargo.para,
        'Nuevo encargo',
        nombreQuien + ' te encargó: "' + j.encargo.texto + '"'
      );
    }

    barraEstado={modo:"confirmar", accion:"encargar", dicho:dicho, para:e.para, foto:foto,
      renglones:[{k:"m",v:e.texto},{k:"d",v:"Encargo · se mide en horas · sigue siendo tuya"}],
      pendiente:{encargo:e}};
    vista="barra"; render(); return;
  }

  /* REASIGNAR — cambia el duenio de una tarea que YA existe, en definitiva.
     Busca la tarea; si hay una sola clara la confirma, si hay varias o ninguna
     no adivina. Usa transfiere(), la misma maquinaria del cambio permanente. */
  if(i==="REASIGNAR"){
    var rz=j.reasignar||{};
    if(!rz.a || !PERSONAS[rz.a]){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"¿A quién se la paso? Dilo con su nombre."};
      vista="barra"; render(); return;
    }
    var camb=busca(rz.tarea||dicho).filter(function(t){ return estadoReal(t)!=="cerrada" });
    if(camb.length===0){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"No encontré esa tarea abierta. Si es nueva, dímelo como tarea de "+
              PERSONAS[rz.a].nombre+" y la abro a su nombre."};
      vista="barra"; render(); return;
    }
    if(camb.length>1){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"Hay "+camb.length+" que pegan con eso. Dime el nombre exacto de cuál "+
              "le paso a "+PERSONAS[rz.a].nombre+"."};
      vista="barra"; render(); return;
    }
    var tc=camb[0];
    if(tc.duenio===rz.a){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"“"+tc.nombre+"” ya es de "+PERSONAS[rz.a].nombre+"."};
      vista="barra"; render(); return;
    }
    barraEstado={modo:"confirmar", accion:"reasignar", dicho:dicho, para:rz.a,
      renglones:[{k:"m",v:tc.nombre},
                 {k:"d",v:"pasa de "+(tc.duenio===yo?"ti":PERSONAS[tc.duenio].nombre)+
                        " a "+PERSONAS[rz.a].nombre+" · en definitiva · la fecha no se mueve"}],
      pendiente:{reasignar:{id:tc.id, a:rz.a, razon:rz.razon||""}}};
    vista="barra"; render(); return;
  }

  /* PASO — una gestion dentro de una tarea que YA existe. Si el que ejecuta es
     OTRO, se resuelve con un encargo ligado a esa tarea (maquinaria probada), con
     tiempo CORTO. Si es el que habla, queda como nota de proximo paso. */
  if(i==="PASO"){
    var ps=j.paso||{};
    var cand=busca(ps.tarea||dicho).filter(function(t){ return estadoReal(t)!=="cerrada" });
    if(cand.length===0){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"No vi a qué tarea abierta pertenece ese paso. Si es algo nuevo, dímelo "+
              "como tarea; si es paso de una, nómbrala."};
      vista="barra"; render(); return;
    }
    if(cand.length>1){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"¿De cuál tarea es ese paso? Pegan "+cand.length+". Dime el nombre."};
      vista="barra"; render(); return;
    }
    var tp=cand[0];
    if(!ps.texto){ barraEstado={modo:"respuesta",dicho:dicho,texto:"¿Cuál es el paso?"};
      vista="barra"; render(); return; }
    if(!ps.cuando || !/^\d{4}-\d{2}-\d{2}$/.test(ps.cuando)){
      var hp=(hist||[]).slice(); hp.push("Claude preguntó: ¿para cuándo ese paso?");
      barraEstado={modo:"pregunta", dicho:dicho, hist:hp, foto:foto,
        titulo:"Paso de “"+tp.nombre+"”: "+ps.texto,
        pregunta:"¿Para cuándo ese paso? (es corto, no la fecha final)"};
      vista="barra"; render(); return;
    }
    var quienP=(ps.quien&&PERSONAS[ps.quien])?ps.quien:null;
    var rens=[{k:"m",v:ps.texto},{k:"d",v:"paso de “"+tp.nombre+"”"},
              {k:"d",v:(quienP&&quienP!==yo?PERSONAS[quienP].nombre+" · ":"")+"para el "+fechaBonita(ps.cuando)}];
    barraEstado={modo:"confirmar", accion:"paso", dicho:dicho, para:(quienP&&quienP!==yo?quienP:null), foto:foto,
      renglones:rens, pendiente:{paso:{tareaId:tp.id, quien:quienP, texto:ps.texto, cuando:ps.cuando}}};
    vista="barra"; render(); return;
  }

  /* WHATSAPP (build 136) — mandarle un WhatsApp a alguien de FUERA desde el
     numero del que habla, ligado a una tarea. La app solo deja el pedido en la
     cola del servidor; Claude lo manda desde su computadora y la respuesta cae
     aqui en el hilo. Si venia desde un hilo (__waDesde) la tarea es esa. */
  if(i==="WHATSAPP"){
    var w=j.whatsapp||{};
    var _waDesde=(window.__waDesde && Date.now()-window.__waDesde.ts<180000)?window.__waDesde.id:null; window.__waDesde=null;
    if(w.contacto && PERSONAS[w.contacto]) w.contacto=PERSONAS[w.contacto].nombre;
    if(!w.contacto || !w.texto){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"¿A quién le escribo por WhatsApp y qué le digo? Dilo con su nombre."};
      vista="barra"; render(); return;
    }
    /* build 137: la tarea se busca SOLO entre las tuyas abiertas y por las
       palabras (antes busca() veia "Carlos" y filtraba tareas DE Carlos: nunca
       encontraba nada). Si no pega ninguna, se abre una tarea nueva tuya. */
    var tw=null, _nueva="";
    if(_waDesde) tw=tareas.filter(function(x){ return x.id===_waDesde })[0];
    if(!tw){
      var _pis=[w.tarea||"", w.texto||"", w.contacto||""].join(" ");
      var _mias=tareas.filter(function(t){ return t.duenio===yo && !t.es_recordatorio && !t.cierre && estadoReal(t)!=="cerrada" });
      var _sc=_mias.map(function(t){ return {t:t, n:pegaFuerte(t,_pis)} })
                   .filter(function(x){ return x.n>0 }).sort(function(a,b){ return b.n-a.n });
      if(_sc.length===1 || (_sc.length>1 && _sc[0].n>_sc[1].n)) tw=_sc[0].t;
      else if(_sc.length>1){
        barraEstado={modo:"respuesta", dicho:dicho,
          texto:"¿A cuál tarea va ese WhatsApp? Pegan "+_sc.length+": "+
                _sc.slice(0,3).map(function(x){ return "“"+x.t.nombre+"”" }).join(", ")+
                ". Ábrela y dímelo desde ahí."};
        vista="barra"; render(); return;
      }
      else _nueva=((w.canal==="correo"?"Correo":(w.canal==="archivo"?"Archivo":"WhatsApp"))+" a "+w.contacto+" · "+(w.asunto||w.archivo||w.texto)).slice(0,90);
    }
    /* build 139 (Salvador 2026-09-25): si dijo dile/escribele/comentale, SALE
       DIRECTO, sin pantalla de confirmar; queda el cintillo de Deshacer 5 s.
       CANDADO DE PRIVACIDAD: si el texto trae montos o el nombre de OTRO
       contacto de la tarea, entonces si se detiene a confirmar. */
    if(tw){
      var _ligados=(tw.wa_contactos||[]).map(function(c){ return String(c.nombre||c) });
      var _pn=String(w.contacto||"").toLowerCase().split(/\s+/)[0];
      var _mismo=_ligados.filter(function(n){ return n.toLowerCase().split(/\s+/)[0]===_pn })[0];
      if(_mismo) w.contacto=_mismo;
    }
    /* Salvador 17:49: sin candado; montos y presupuestos si se hablan con
       proveedores. Sale siempre directo; Claude confirma el destinatario. */
    enviaWhatsAppYa({dicho:dicho, foto:foto,
      pendiente:{whatsapp:{tareaId:tw?tw.id:null, nueva:_nueva, contacto:w.contacto, texto:w.texto,
                           canal:w.canal||"whatsapp", asunto:w.asunto||"", archivo:w.archivo||"", archivo2:w.archivo2||"", programa:w.programa||null}}});
    return;
    barraEstado={modo:"confirmar", accion:"whatsapp", dicho:dicho, para:yo, foto:foto,
      renglones:[{k:"m",v:w.texto},{k:"d",v:"Ojo: trae montos o nombres de otros · revísalo antes de mandar"},{k:"d",v:"WhatsApp a "+w.contacto+" · desde tu número"},
                 {k:"d",v:(tw?"en “"+tw.nombre+"”":"abre tarea nueva tuya: “"+_nueva+"”")+" · la respuesta cae en el hilo"}],
      pendiente:{whatsapp:{tareaId:tw?tw.id:null, nueva:_nueva, contacto:w.contacto, texto:w.texto}}};
    vista="barra"; render(); return;
  }

  /* COMENTAR — informa algo en la tarea de otra persona. Solo le aparece el badge;
     NO va a "te están esperando", NO pide respuesta. Distinto de encargar. */
  if(i==="COMENTAR"){
    var cm=j.comentar||{};
    if(!cm.a || !PERSONAS[cm.a] || !cm.texto){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"¿A quién le comento y qué? Dilo con su nombre."};
      vista="barra"; render(); return;
    }
    var suyas=busca(cm.tarea||cm.texto).filter(function(t){
      return t.duenio===cm.a && estadoReal(t)!=="cerrada"; });
    if(suyas.length===0){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"No le veo una tarea a "+PERSONAS[cm.a].nombre+" que pegue con eso. "+
              "Dime a cuál va el comentario."};
      vista="barra"; render(); return;
    }
    if(suyas.length>1){
      barraEstado={modo:"respuesta", dicho:dicho,
        texto:"¿En cuál de sus tareas se lo dejo? Pegan "+suyas.length+"."};
      vista="barra"; render(); return;
    }
    var tcm=suyas[0];
    barraEstado={modo:"confirmar", accion:"comentar", dicho:dicho, para:cm.a, foto:foto,
      renglones:[{k:"m",v:cm.texto},{k:"d",v:"comentario en “"+tcm.nombre+"”"+(foto?" · con foto":"")},
                 {k:"d",v:"solo le aparece el aviso · no lo detiene"}],
      pendiente:{comentar:{tareaId:tcm.id, texto:cm.texto}}};
    vista="barra"; render(); return;
  }

  /* RECORDATORIO */
  if(i==="RECORDATORIO"){
    var r=j.recordatorio||{};
    /* SIN ASUNTO -> preguntar. Cubre "recuerdame" a secas y también cuando solo
       dijo la hora ("recuerdame por la tarde"): no hay QUÉ recordar. */
    /* Salvador 2026-09-22: si Claude devolvio el texto vacio pero LO DICTADO si
       trae asunto ("recuerdame a las 6:55 salir a caminar hoy"), se saca del
       dictado en el telefono en vez de preguntar "que te recuerdo". */
    if(!r.texto || soloEsTiempo(r.texto)){
      var _asun=soloEsTiempo(dicho)?"":asuntoRecordatorio(dicho,{nombre:""});
      if(_asun==="Recordatorio") _asun="";
      if(_asun) r.texto=_asun;
    }
    /* Salvador 2026-09-22: "en el acto lo debe haber creado". Si aun asi no hay
       asunto, el recordatorio NACE de todos modos con su hora, en el bote de
       informacion pendiente, y se pregunta el asunto con la barra abajo. Nada se
       pierde aunque se regrese. */
    if(!r.texto || soloEsTiempo(r.texto)){
      var _rr=armaCuando(dicho);
      var tb=creaRecordatorio({texto:"Recordatorio (falta el asunto)", dicho:dicho, fecha:_rr.fecha, hora:_rr.hora, cada:_rr.cada});
      tb.pendiente_info="\u00bfQu\u00e9 te recuerdo?"; tb.pendiente_tipo="asunto"; guarda(tb);
      barraEstado={modo:"pregunta", dicho:dicho, pregunta:"\u00bfQu\u00e9 te recuerdo? Ya qued\u00f3 para "+fechaBonita(_rr.fecha)+(_rr.hora?" a las "+horaBonita(_rr.hora):"")+".",
        titulo:"Recordatorio", completandoId:tb.id};
      vista="barra"; render(); return; }
    r.dicho=dicho;
    /* MATRIZ DE CUÁNDO (Salvador 2026-09-17): un recordatorio SIEMPRE nace con
       fecha y hora, nunca se queda preguntando ni se pierde.
         día + hora  -> ese día, esa hora
         solo día    -> ese día, 9:00 (primera franja)
         solo hora   -> HOY, esa hora
         ni día ni hora -> la PRÓXIMA franja de 9:00 / 12:00 / 16:00 (hoy o mañana)
       Cuando suene, la alarma trae 3 botones para reprogramar (eso lo hace el
       servidor/sw: eliminar, recordar en 1 hora, micrófono). */
    var _dia=(r.fecha && /^\d{4}-\d{2}-\d{2}$/.test(r.fecha)) ? r.fecha : diaDicho(dicho);
    var _rel=relativoDicho(dicho);           /* "en 2 minutos" -> ahora + delta */
    var _hor=horaDicha(dicho) ? horaValor(dicho) : "";
    var _vg=_hor ? "" : franjaVaga(dicho);   /* {fecha,hora} de la parte del día */
    if(_rel){ r.fecha=_rel.fecha; r.hora=_rel.hora; }         /* tiempo relativo exacto */
    else if(_hor){ r.fecha=_dia||hoy(); r.hora=horaCercana(r.fecha,_hor,dicho); } /* hora exacta dicha */
    if(r.texto) r.texto=sinHoraEnTitulo(asuntoRecordatorio(limpiaHoraDictada(r.texto),{nombre:r.texto}));
    else if(_vg){ r.fecha=_dia||_vg.fecha; r.hora=_vg.hora; } /* "en la tarde" -> hora calculada por la parte */
    else if(_dia){ r.fecha=_dia; r.hora="09:00"; }            /* solo día -> 9:00 */
    else { var _pf=proximaFranja(); r.fecha=_pf.fecha; r.hora=_pf.hora; } /* ni día ni hora ni parte */
    /* ¿ESTE RECORDATORIO ES SOBRE UNA TAREA QUE YA TIENES? (Salvador 2026-09-17)
       Si pega claro con una, se INSERTA dentro de esa tarea como un ritmo, directo
       y con Deshacer. Si pega con pocas (2-4), se escoge con toques. Si no pega con
       ninguna, nace suelto. Siempre con su fecha+hora ya resuelta. */
    var lig=tareasParaLigar(r.texto);
    if(lig.length===1){ insertaAviso(lig[0], r, foto); return; }
    if(lig.length>=2){
      var g=guardaRecordatorioSeguro(r, foto);
      barraEstado={modo:"ligarec", dicho:dicho, foto:foto, pendrec:r,
        ops:lig.map(function(t){return t.id;}), guardadoId:g.id, guardadoTipo:g.tipo};
      vista="barra"; render(); return;
    }
    autoEjecuta({accion:"recordatorio", foto:foto, pendiente:{recordatorio:r}}); return;
  }

  /* CREAR (o ENVIAR si el duenio es otro) — pasa por el filtro de repetidas */
  if(i==="CREAR"){
    var d=j.tarea||{};
    /* build 144: los pasos pueden venir dentro de tarea o sueltos en el JSON */
    if(!d.pasos && j.pasos) d.pasos=j.pasos;
    /* build 166: si Claude no partio la lista dictada ("numero uno..., numero dos..."), se parte aqui */
    if(!(d.pasos&&d.pasos.length)){ var _ln=listaNumerada(dicho);
      if(_ln.length>=2){ d.pasos=_ln; if(!d.nombre || /\b(n[uú]mero|punto)\s+(uno|dos|1|2)\b/i.test(d.nombre) || d.nombre.length>60) d.nombre=nombreLista(dicho); } }
    /* build 144 (Salvador 2026-09-26): HORA DICHA = ALARMA. Si dijo una hora (o
       "en 20 minutos") y no dijo dia, la tarea es de HOY (o del dia de ese
       tiempo) y nace con su aviso, aunque no haya dicho "recuerdame". */
    if(d.nombre && !(d.fecha && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) && !d.periodicidad && (horaDicha(dicho)||relativoDicho(dicho)))
      d.fecha=armaCuando(dicho).fecha;
    d.aviso_hora_dicha=true;
    if(!d.nombre){ barraEstado={modo:"respuesta",dicho:dicho,
      texto:"¿Qué tarea abro? Dímelo con el verbo por delante."};
      vista="barra"; render(); return; }
    /* CANDADO DE FECHA — regla de Salvador: NO suponer. Si Claude manda CREAR sin
       fecha (y no es recurrente), no se crea con "hoy" a ciegas: se pregunta. */
    var tieneFecha = d.fecha && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha);
    if(!tieneFecha && !d.periodicidad){
      d.dicho=dicho;
      creaIncompleta(d, "¿Para qué fecha? Dime el día.", "fecha", foto);
      return;
    }
    d.dicho=dicho;
    var esOtro = d.duenio && PERSONAS[d.duenio] && d.duenio!==yo;

    /* el filtro de repetidas de siempre, contra las tareas del DUEÑO que toca */
    function procedeCrear(){
      barraEstado={modo:"cargando", dicho:dicho, foto:foto, texto:"Reviso si ya la tienes…"};
      vista="barra"; render();
      buscaDuplicado(d.nombre+(d.revisar?" · "+d.revisar:"")+(dicho&&dicho!==d.nombre?" — dijo: "+String(dicho).slice(0,300):""), d.duenio||yo, function(v){
        var rr=respuestaDuplicado(v);
        if(rr.crear===true){
          /* si el filtro de repetidas no pudo correr, se dice con un toast */
          if(rr.aviso) toast(rr.aviso);
          autoEjecuta({accion:(esOtro?"enviar":"crear"), foto:foto, pendiente:{tarea:d}});
          return;
        }else if(rr.crear===false){
          barraEstado={modo:"respuesta", dicho:dicho, texto:rr.texto,
            abrir:(rr.enriquece?rr.enriquece.id:(v.id||null))};
        }else{
          barraEstado={modo:"respuesta", dicho:dicho, texto:rr.texto,
            pendiente:{tarea:d, vecina:rr.vecina||null},
            ops:(rr.ops||[{k:"aparte",t:"Ábrela aparte"},{k:"nada",t:"Déjalo así"}])};
        }
        vista="barra"; render();
      });
    }

    /* REGLA (1) — Salvador: al asignar a OTRO, primero revisar si esa tarea YA
       existe (de él o de alguien más). Si existe, no se abre doble a ciegas: se
       avisa de quién es y se ofrece pasársela, encargársela o abrir una nueva. */
    if(esOtro){
      barraEstado={modo:"cargando", dicho:dicho, foto:foto, texto:"Reviso si ya existe…"};
      vista="barra"; render();
      buscaDuplicado(d.nombre+(d.revisar?" · "+d.revisar:"")+(dicho&&dicho!==d.nombre?" — dijo: "+String(dicho).slice(0,300):""), null, function(v){
        var ya=v.id?tareas.filter(function(x){return x.id===v.id})[0]:null;
        var pega=(["MISMA","ENRIQUECE","VECINA","DUDA"].indexOf(v.veredicto)>=0);
        if(ya && pega && ya.duenio!==d.duenio && estadoReal(ya)!=="cerrada"){
          var quien=(ya.duenio===yo?"tuya":"de "+PERSONAS[ya.duenio].nombre);
          barraEstado={modo:"respuesta", dicho:dicho,
            texto:"Ojo: “"+ya.nombre+"” ya existe, es "+quien+". No la abro doble. "+
                  "¿Qué hago con "+PERSONAS[d.duenio].nombre+"?",
            pendiente:{tarea:d, existenteId:ya.id, target:d.duenio},
            ops:[
              {k:"reasignarE",t:"Pásasela a "+PERSONAS[d.duenio].nombre,d:"Cambia de dueño en definitiva. La fecha no se mueve."},
              {k:"encargarE", t:"Encárgasela a "+PERSONAS[d.duenio].nombre,d:"Sigue siendo "+quien+"; él solo ejecuta y contesta."},
              {k:"aparte",    t:"Ábrela aparte como nueva",d:"Solo si de verdad es otra cosa distinta de la que ya está."},
              {k:"nada",      t:"Déjalo así",d:"No abre nada."}
            ]};
          vista="barra"; render(); return;
        }
        procedeCrear();   /* no existe en ningún lado: crear normal para esa persona */
      });
      return;
    }

    procedeCrear();
    return;
  }

  barraEstado={modo:"respuesta", dicho:dicho, texto:(j.respuesta||"No entendí qué querías hacer.")};
  vista="barra"; render();
}
