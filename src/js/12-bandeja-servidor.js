/* ===================== BANDEJA DEL SERVIDOR: MENSAJES DE WHATSAPP POR ACOMODAR =====================
   Los mensajes que la Mac no supo a qué tarea mandar se quedan en push.php con estado «por_acomodar» y no viven en
   ninguna tarea; por eso no salían en la app. Aquí se leen (bandeja_lista) y se pintan en «Bandeja → Mensajes»,
   arriba de las pláticas con duda que ya viven en tareas.
   - Un toque: si la Mac propuso tarea (propuesta_tarea_id), el primer botón la acomoda ahí. «Otra tarea…» abre la
     lista (mismo buscador que Vincular) con «+ Crear tarea nueva». «Descartar» la saca de la bandeja.
   - Al acomodar se pega el mensaje en la tarea como lo deja la Mac: entrante = k "bi", wa_in 1, «Contacto: texto»;
     saliente (es_salida=1, lo mandó Salvador) = k "bo", wa_in 0, origen wa_saliente, sin prefijo. Luego bandeja_marca.
   - Lo marcado se recuerda en este teléfono (localStorage) hasta que el servidor deja de listarlo: si bandeja_marca
     falla, el mensaje no regresa a la pantalla ni se pega dos veces, y la marca se reintenta en la siguiente lectura.
   - Se lee al abrir la pestaña y cada 60 s mientras está abierta. Sin token (file:// o pruebas) no llama a nada. */
var BANDEJA_SRV={lista:[], cargado:false, enCurso:false, error:"", ts:0, timer:null, abierta:false, ver:30};
var BANDEJA_MARCAS_K="doit_bandeja_marcas";
function hayTokenBandeja(){ return typeof APP_TOKEN!=="undefined" && String(APP_TOKEN).indexOf("__")!==0; }
function marcasBandeja(){ var m={}; try{ m=JSON.parse(localStorage.getItem(BANDEJA_MARCAS_K)||"{}")||{}; }catch(e){ m={}; } return (m && typeof m==="object")?m:{}; }
function grabaMarcasBandeja(m){ try{ localStorage.setItem(BANDEJA_MARCAS_K, JSON.stringify(m)); }catch(e){} }
/* hora del mensaje: ts (segundos o ms) o hora/creado/fecha "AAAA-MM-DD HH:MM[:SS]"; si solo hay "HH:MM", es de hoy */
function tsBandeja(x){
  var n=+(x.ts||x.timestamp||0); if(n) return n<1e12?n*1000:n;
  var s=String(x.creado||x.created_at||x.fecha||x.hora||"").trim();   /* el servidor manda hora "AAAA-MM-DD HH:MM:SS" */
  if(/^\d{4}-\d{2}-\d{2}/.test(s)){ var d=new Date(s.replace(" ","T")); if(!isNaN(d)) return d.getTime(); }
  var h=String(x.hora||"").match(/^(\d{1,2}):(\d{2})/); if(h){ var d2=new Date(); d2.setHours(+h[1], +h[2], 0, 0); return d2.getTime(); }
  return 0;
}
function normalizaBandeja(x){
  if(!x || x.id==null) return null;
  var ts=tsBandeja(x), d=ts?new Date(ts):null;
  return {id:String(x.id), contacto:nombreLimpio(String(x.contacto||x.wa_c||x.chat||x.nombre||"")).trim()||"Contacto sin nombre",
    texto:String(x.texto!=null?x.texto:(x.t!=null?x.t:(x.mensaje||""))), tipo:String(x.tipo||""), url:x.url?String(x.url):"", wa_id:x.wa_id?String(x.wa_id):"",
    propuesta:x.propuesta_tarea_id?String(x.propuesta_tarea_id):"", salida:(+x.es_salida===1 || x.es_salida===true), ts:ts,
    h:String(x.hora||"").match(/^\d{1,2}:\d{2}/)?String(x.hora).slice(0,5):(d?hhmm(d):""), dia:d?iso(d):""};
}
function leeRespuestaBandeja(j){
  if(Array.isArray(j)) return j;
  if(j && typeof j==="object") for(var k of ["items","lista","bandeja","mensajes","data"]) if(Array.isArray(j[k])) return j[k];
  return [];
}
/* lo que se ve: lo del servidor menos lo ya marcado aquí; la más reciente primero */
function bandejaSrvVisible(){ var m=marcasBandeja(); return BANDEJA_SRV.lista.filter(function(x){ return !m[x.id]; }); }
function llamaBandeja(accion, cuerpo){
  var op={method:cuerpo?"POST":"GET", headers:{"x-app-token":APP_TOKEN, "x-usuario":yo||"anonimo"}};
  if(cuerpo){ op.headers["content-type"]="application/json"; op.body=JSON.stringify(cuerpo); }
  return fetch(PUSH+"?action="+accion, op).then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){
    if(!r.ok || (j && !Array.isArray(j) && j.error)) throw new Error((j&&j.error)||("HTTP "+r.status)); return j; }); });
}
function cargaBandejaSrv(){
  if(!hayTokenBandeja() || BANDEJA_SRV.enCurso || !yo) return Promise.resolve(false);
  BANDEJA_SRV.enCurso=true;
  var antes=bandejaSrvVisible().map(function(x){ return x.id; }).join(",");
  return llamaBandeja("bandeja_lista").then(function(j){
    BANDEJA_SRV.lista=leeRespuestaBandeja(j).map(normalizaBandeja).filter(Boolean).sort(function(a,b){ return (b.ts||0)-(a.ts||0); });
    BANDEJA_SRV.cargado=true; BANDEJA_SRV.error=""; BANDEJA_SRV.ts=Date.now();
    /* marcas: las que el servidor ya no lista se olvidan; las que sigue listando se vuelven a mandar */
    var m=marcasBandeja(), hay={}, cambio=false; BANDEJA_SRV.lista.forEach(function(x){ hay[x.id]=1; });
    Object.keys(m).forEach(function(id){ if(!hay[id]){ delete m[id]; cambio=true; } else if(Date.now()-(+m[id].ts||0)>20000) mandaMarcaBandeja(id, m[id]); });
    if(cambio) grabaMarcasBandeja(m);
    return true;
  }).catch(function(e){ BANDEJA_SRV.error=String((e&&e.message)||e); console.warn("bandeja_lista", e); return false; })
  .then(function(ok){ BANDEJA_SRV.enCurso=false;
    var ahora=bandejaSrvVisible().map(function(x){ return x.id; }).join(",");
    if(ok && ahora!==antes) repintaBandeja();
    return ok; });
}
/* repinta solo si se está viendo el inicio y no hay una hoja abierta encima */
function repintaBandeja(){ try{ if(vista==="lista" && !document.querySelector(".leemask")) render(); }catch(e){} }
function mandaMarcaBandeja(id, m){
  if(!hayTokenBandeja()) return Promise.resolve(false);
  var c={id:id, ids:[id], estado:m.estado, usuario:yo||""}; if(m.tarea_id) c.tarea_id=m.tarea_id;
  return llamaBandeja("bandeja_marca", c).then(function(){ return true; }).catch(function(e){ console.warn("bandeja_marca", e); return false; });
}
function marcaBandeja(x, estado, tareaId){
  var m=marcasBandeja(); m[x.id]={estado:estado, tarea_id:tareaId||"", ts:Date.now()}; grabaMarcasBandeja(m);
  return mandaMarcaBandeja(x.id, m[x.id]);
}
/* el mensaje como lo deja la Mac en la tarea */
function mensajeDeBandeja(x){
  var cuerpo=String(x.texto||"").trim()||(x.url?(x.tipo||"archivo"):"");
  /* en grupos el servidor ya trae «Quién: texto»; ese prefijo se respeta y no se pone el del grupo encima */
  var ent=/^[^:\n]{2,60}:\s/.test(cuerpo)?cuerpo:(x.contacto+": "+cuerpo);
  var o={k:x.salida?"bo":"bi", wa_in:x.salida?0:1, wa_c:x.contacto, chat:x.contacto, t:x.salida?cuerpo:ent,
    h:x.h||hhmm(), ts:x.ts||Date.now(), id:"bnd"+x.id, bandeja_id:x.id, origen:x.salida?"wa_saliente":"wa_entrante",
    acomodo:{ok:1, ts:Date.now(), por:yo||"", desde:"bandeja"}};
  if(x.salida && yo) o.de=yo;
  if(x.wa_id) o.wa_id=x.wa_id;
  if(x.url) o.url=x.url;
  if(x.tipo && x.tipo!=="texto") o.tipo=x.tipo;
  return o;
}
function tareaDeBandeja(id){
  var d=(tareas||[]).filter(function(z){ return z && z.id===id; })[0], n=0;
  while(d && d.fusionada_en && n++<6){ var f=(d.fusionada_en&&d.fusionada_en.id)||d.fusionada_en; d=tareas.filter(function(z){ return z.id===f; })[0]; }
  if(!d || d.estado==="descartada" || d.es_recordatorio) return null;
  return d;
}
function acomodaBandeja(x, d){
  if(!x || !d) return "";
  var o=mensajeDeBandeja(x);
  d.msgs=d.msgs||[];
  var ya=d.msgs.some(function(y){ return y && (y.id===o.id || (o.wa_id && y.wa_id===o.wa_id)); });
  if(!ya){ d.msgs.push(o); d.msgs.sort(function(a,b){ return ((a&&+a.ts)||0)-((b&&+b.ts)||0); }); }
  try{ if(typeof esDormida==="function" && esDormida(d)) despierta264(d, "le acomodaron un mensaje"); else if(typeof esCerradaVinc==="function" && esCerradaVinc(d) && !d.fusionada_en) reabre(d, "recibe un mensaje acomodado desde la bandeja"); }catch(e){}
  try{ censoAcomodo(d, o, "bandeja", d.id, x.propuesta===d.id?"bandeja_propuesta":"bandeja_otra"); }catch(e){}
  guarda(d);
  marcaBandeja(x, "acomodado", d.id);
  try{ hist240("Bandeja: mensaje de "+x.contacto+" a “"+String(d.nombre||"")+"”", d, null); }catch(e){}
  return "Acomodado en “"+corta40(d.nombre||"la tarea")+"”";
}
function descartaBandeja(x){
  if(!x) return "";
  marcaBandeja(x, "descartado", "");
  try{ hist240("Bandeja: descartó un mensaje de "+x.contacto, null, null); }catch(e){}
  return "Descartado";
}
function itemBandeja(id){ return BANDEJA_SRV.lista.filter(function(x){ return x.id===id; })[0]||null; }
function textoBandeja(x){
  var s=String(x.texto||"").trim();
  var h=s?htmlTx(s, x):'<span class="q">'+esc(x.tipo||"archivo")+'</span>';
  if(x.url && /^(https?:\/\/|\/|[\w-]+\/)/i.test(x.url)) h+=' <a class="bsrv-url" href="'+esc(x.url)+'" target="_blank" rel="noopener">Ver '+esc(x.tipo&&x.tipo!=="texto"?x.tipo:"archivo")+'</a>';
  return h;
}
function vBandejaSrv(){
  var L=bandejaSrvVisible(); if(!L.length) return "";
  var ver=Math.max(30, +BANDEJA_SRV.ver||30), h='<div class="bsrv"><div class="bsrv-h"><b>Del servidor</b><span>'+L.length+' sin acomodar</span></div><div class="acog">';
  h+=L.slice(0, ver).map(function(x){
    var p=x.propuesta?tareaDeBandeja(x.propuesta):null, quien=x.salida?"Tú → "+x.contacto:x.contacto;
    return '<div class="acor bsrv-r" data-bsrv="'+esc(x.id)+'"><span class="av226">'+esc(x.salida?"TÚ":inicialesDe(x.contacto))+'</span><span class="acob">'+
      '<span class="acow"><b>'+esc(quien)+'</b><time>'+esc((x.dia && x.dia!==hoy()?fechaMovCorta(x.dia)+" ":"")+(x.h||""))+'</time></span>'+
      '<span class="bsrv-t">'+textoBandeja(x)+'</span>'+
      '<span class="bsrv-b">'+(p?'<button class="bsrv-si" data-bsrva="prop" aria-label="Acomodar en '+esc(p.nombre||"")+'">A «'+esc(corta40(p.nombre||"tarea"))+'»</button>':'')+
      '<button data-bsrva="otra">'+(p?'Otra tarea…':'Acomodar en…')+'</button><button class="bsrv-no" data-bsrva="desc">Descartar</button></span></span></div>';
  }).join("");
  h+='</div>'+(L.length>ver?'<button class="acof" id="bsrvmas"><span>Ver más</span><span class="r">'+(L.length-ver)+' más</span></button>':'')+'</div>';
  return h;
}
/* hoja para escoger la tarea: las del mismo contacto primero, luego las abiertas en orden alfabético; buscador como Vincular */
function abreTareaBandeja(x){
  var ya=document.getElementById("bsrv-hoja"); if(ya) ya.remove();
  var c=_nn(x.contacto), abiertas=(tareas||[]).filter(function(d){ try{ return abiertaVisible(d); }catch(e){ return false; } });
  var mismo=function(d){ return !!c && ([d.revisa_ext, d.seg_a&&d.seg_a.contacto].concat((d.wa_contactos||[]).map(function(w){ return (w&&w.nombre)||w; })).some(function(n){ return n && _nn(nombreLimpio(String(n)))===c; }) ||
      (d.msgs||[]).some(function(y){ return y && y.wa_c && _nn(nombreLimpio(String(y.wa_c)))===c; })); };
  var sims=abiertas.filter(mismo), rest=abiertas.filter(function(d){ return sims.indexOf(d)<0; }).sort(function(a,b){ return _n179(a.nombre)<_n179(b.nombre)?-1:(_n179(a.nombre)>_n179(b.nombre)?1:0); });
  var fila=function(d, par, cer){ return '<button class="opt226'+(par?' sim262':'')+(cer?' cer259':'')+'" data-bsrvto="'+esc(d.id)+'">'+ico("folder",20)+'<span class="ot">'+esc(d.nombre||"(sin nombre)")+'</span>'+(cer?'<span class="tag">'+esc(cer)+'</span>':(par?'<span class="tag">mismo contacto</span>':''))+'</button>'; };
  var v=document.createElement("div"); v.className="leemask"; v.id="bsrv-hoja";
  v.innerHTML='<div class="mov225" role="dialog" aria-label="¿A qué tarea va?"><div class="h225g"></div>'+
    '<div class="mvctx"><span class="av226">'+esc(x.salida?"TÚ":inicialesDe(x.contacto))+'</span><span class="mvt"><small>'+esc((x.salida?"Tú → ":"")+x.contacto+(x.h?" · "+x.h:""))+'</small><span>'+textoBandeja(x)+'</span></span><button class="h225b" data-bsrvx="1" aria-label="Cerrar">'+ico("x",14)+'</button></div>'+
    '<h3 class="mvh">¿A qué tarea va?</h3><div class="h225c">'+
    '<div class="bus253"><button type="button" class="lupa" data-bsrvlupa="1" aria-label="Buscar tarea">'+ico("lupa",20,1.8)+'</button><input id="bsrvbus" type="search" placeholder="Buscar tarea…" autocomplete="off" autocapitalize="none" enterkeyhint="search"></div>'+
    '<button class="opt226 plain nueva259" data-bsrvnueva="1">'+ico("plus",20)+'<span class="two"><span>+ Crear tarea nueva</span></span></button>'+
    '<div id="bsrvres"></div><div id="bsrvops">'+sims.map(function(d){ return fila(d, true); }).join("")+rest.slice(0,300).map(function(d){ return fila(d, false); }).join("")+'</div></div></div>';
  document.body.appendChild(v);
  var bi=v.querySelector("#bsrvbus"), br=v.querySelector("#bsrvres"), bo=v.querySelector("#bsrvops");
  bi.addEventListener("input", function(){ var q=bi.value, hay=!!_n179(q); bo.style.display=hay?"none":"";
    if(!hay){ br.innerHTML=""; return; }
    var R=[]; try{ R=buscaVinc259(q, null).lista.slice(0,20); }catch(e){}
    br.innerHTML=R.length?R.map(function(o){ return fila(o.d, false, o.etq||(o.cerrada?"cerrada":"")); }).join(""):'<div class="bus253x">No encontré “'+esc(q.trim())+'” en tus tareas.</div>'; });
  v.addEventListener("click", function(ev){ ev.stopPropagation();
    if(ev.target.closest("[data-bsrvlupa]")){ enfoca252(bi); return; }
    var b=ev.target.closest("[data-bsrvto]");
    if(b){ var d=tareaDeBandeja(b.getAttribute("data-bsrvto")); v.remove(); if(d){ toast(acomodaBandeja(x, d)); } render(); return; }
    if(ev.target.closest("[data-bsrvnueva]")){ v.remove();
      var tmp={nombre:"", msgs:[{k:"bi", wa_c:x.contacto, t:x.contacto+": "+String(x.texto||"")}]};
      pideNombreNueva(tmp, [0], function(nombre){
        var n=creaTarea({nombre:nombre, dicho:String(x.texto||""), pendiente_info:"Viene de la bandeja de WhatsApp: falta la fecha y el seguimiento", pendiente_tipo:"dato", falta_fecha:true});
        if(!n) return; n.creada_desde={tipo:"bandeja", bandeja_id:x.id};
        toast(acomodaBandeja(x, n)); vaATareaNueva(n); });
      return; }
    if(ev.target===v || ev.target.closest("[data-bsrvx]")) v.remove(); });
}
function bindBandejaSrv(){
  var abierta=false; try{ abierta=vista==="lista" && grupoInicio()==="bandeja" && segBandeja()==="mensajes"; }catch(e){}
  /* la primera vez se lee para que el número salga en la ficha y en la pestaña; al abrir la pestaña, se vuelve a leer */
  if(!BANDEJA_SRV.cargado && !BANDEJA_SRV.ts) cargaBandejaSrv();
  else if(abierta && !BANDEJA_SRV.abierta) cargaBandejaSrv();
  BANDEJA_SRV.abierta=abierta;
  if(abierta && !BANDEJA_SRV.timer && hayTokenBandeja()) BANDEJA_SRV.timer=setInterval(function(){
    var sigue=false; try{ sigue=vista==="lista" && grupoInicio()==="bandeja" && segBandeja()==="mensajes"; }catch(e){}
    if(!sigue){ clearInterval(BANDEJA_SRV.timer); BANDEJA_SRV.timer=null; BANDEJA_SRV.abierta=false; return; }
    if(document.visibilityState!=="hidden") cargaBandejaSrv(); }, 60000);
  var raiz=document.querySelector(".bsrv"); if(!raiz) return;
  var mas=$("bsrvmas"); if(mas) mas.onclick=function(){ BANDEJA_SRV.ver=(+BANDEJA_SRV.ver||30)+30; render(); };
  Array.prototype.forEach.call(raiz.querySelectorAll("[data-bsrva]"), function(b){ b.onclick=function(ev){ ev.stopPropagation();
    var c=b.closest("[data-bsrv]"), x=c?itemBandeja(c.getAttribute("data-bsrv")):null; if(!x) return; var a=b.getAttribute("data-bsrva");
    if(a==="prop"){ var d=tareaDeBandeja(x.propuesta); if(!d){ toast("Esa tarea ya no está"); render(); return; } toast(acomodaBandeja(x, d)); render(); return; }
    if(a==="otra"){ abreTareaBandeja(x); return; }
    if(a==="desc"){ toast(descartaBandeja(x)); render(); } }; });
}
