/* ═══════════════════════════════════════════════════════════════════════════════
   FUNCIONES Y CSS RETIRADOS DE index.html — revisión 8-oct-2026 (build 287)
   Nada se perdió: aquí está cada pieza ÍNTEGRA, tal como estaba en el build 286.
   Este archivo NO lo carga la app; es solo archivo.

   Cómo se decidió (una por una, con evidencia):
   · Análisis con acorn: ninguna función del código de arranque, ni atributos del HTML,
     ni texto dentro de cadenas (nombres armados, onclick, setTimeout con texto) las alcanza.
   · Historia en git: en qué build dejó de llamarse cada una y qué la sustituyó.
   · Pruebas: ninguna aserción las usa (solo estaban en listas de carga de b204-b225/agenda;
     se quitaron de esas listas).
   · sw.js no las menciona. El bot de la Mac (~/doit-whatsapp/index.js) corre en Node y no
     puede llamar funciones del navegador; no se pudo abrir para revisarlo (acceso a la
     carpeta pendiente de aprobación en la Mac).
   Grupos: A = REEMPLAZADA por una versión nueva · B = HUÉRFANA (su pantalla/botón ya no existe).
   Para regresar una: copiarla de aquí a index.html (cualquier lugar del <script>, son
   declaraciones de nivel superior) y conectarla.
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ── resumenTarea · grupo A · estaba en index.html línea 14991 (build 286)
   Por qué se retira: resumen de 2 renglones de la ficha colapsada; su único llamado se quitó en build 195 (fichas limpias: encabezado con chipEncabezado). Nadie la llama ni por texto; ninguna prueba. */
/* el resumen de 2 renglones que se ve con la ficha colapsada */
function resumenTarea(t){
  if(t.es_recordatorio){
    var q=[]; if(t.f_vigente) q.push(fechaBonita(t.f_vigente)); if(t.aviso_hora) q.push("a las "+horaBonita(t.aviso_hora));
    return conMayuscula(t.nombre||"Recordatorio")+(q.length?" · te aviso "+q.join(" "):"");
  }
  var p=[conMayuscula(t.revisar||t.nombre||"")];
  if(t.gasto && /\d/.test(t.gasto) && !/no\s*gasta/i.test(t.gasto)) p.push("monto "+t.gasto);
  if(t.f_vigente) p.push("para "+fechaBonita(t.f_vigente));
  if(t.cierra) p.push("cierra con "+t.cierra);
  return p.join(" · ");
}

/* ── leeResumenSolo · grupo A · estaba en index.html línea 20310 (build 286)
   Por qué se retira: lectura en voz del puro resumen (build 184); en build 185 la lectura pasó a podcast (leeArranca/leeTarea) y quitó su único llamado. Sin pruebas. */
function leeResumenSolo(t){ var r=_leeResumen(t); leeArranca(t, r?[r]:[], "resumen"); }

/* ── _txtBusca259 · grupo A · estaba en index.html línea 6037 (build 286)
   Por qué se retira: texto de búsqueda de la hoja Vincular del 259; build 262 la sustituyó por un solo motor (buscaVinc262/sugeridasPara262) y quitó su llamado. Sin pruebas. */
function _txtBusca259(x){
  var flat=function(v){ return [].concat(v||[]).map(function(z){ return (z&&typeof z==="object")?(z.nombre||z.tx||""):String(z); }).join(" "); };
  var ctx=""; try{ ctx=contextoDe(x)||""; }catch(e){}
  return _n179([x.nombre, flat(x.nombre_anterior), flat(x.nombres_anteriores), ctx||x.contexto||"", flat(x.alias), flat(x.alias_tarea), flat(x.palabras), flat(x.sinonimos), x.de_quien||""].join(" "));
}

/* ── ordenVinc259 · grupo A · estaba en index.html línea 6191 (build 286)
   Por qué se retira: orden de candidatas de Vincular del 259 ("compat" según su propio comentario); build 262 la sustituyó por sugeridasPara262. Sin pruebas. */
function ordenVinc259(oid, simIds){   /* compat: sin motor de parecidas cae a lo que se le pase; las hojas usan sugeridasPara262 */
  var cand=enlazaCandidatas(oid), sims=[], vis={};
  (simIds||[]).forEach(function(id){ var d=cand.filter(function(x){ return x.id===id; })[0]; if(d && !vis[id]){ vis[id]=1; sims.push(d); } });
  var rest=cand.filter(function(x){ return !vis[x.id]; }).sort(function(a,b){ return _n179(a.nombre).localeCompare(_n179(b.nombre)); });
  return {sims:sims, rest:rest};
}

/* ── ultimos10_251 · grupo A · estaba en index.html línea 8913 (build 286)
   Por qué se retira: solo la usaba refuerzo251 (también retirada). */
function ultimos10_251(t){ return (t.msgs||[]).filter(function(m){ return m && !m.oculto && String(m.t||"").trim() && !m.res238; }).slice(-10).map(function(m){
  var q=m.wa_c||(m.de&&PERSONAS[m.de]&&PERSONAS[m.de].nombre)||(m.k==="bo"?"Salvador":"Claude"); return q+": "+String(m.t).replace(/\s+/g," ").slice(0,300); }).join("\n"); }

/* ── refuerzo251 · grupo A · estaba en index.html línea 8915 (build 286)
   Por qué se retira: reintento en serie del cerebro (build 251); build 283 lo quitó a propósito (una sola llamada, sin reintento: la prueba b283 exige que NO esté). Solo seguía en listas de carga de pruebas, sin ninguna aserción. */
function refuerzo251(t, v){
  return "\n\nREINTENTO (build 251): tu respuesta anterior no dejó ninguna orden ni dato aplicable. Vuelve a leer con calma lo dictado y lo que ya hay en la tarea. Devuelve ORDENES concretas (mensaje, condicional, claude, agendar, seguimiento, vincular o clasificar) o los datos que corresponden. Solo si de verdad es imposible, llena \"pregunta\" con UNA pregunta corta y concreta. Nunca contestes que no cambiaste nada.\n"+
    "CONTEXTO COMPLETO DE LA TAREA: "+String(contextoDe(t)||t.contexto||"(nada)").slice(0,3000)+"\nNOMBRE: "+(t.nombre||"")+" · FECHA: "+(t.f_vigente||"sin fecha")+"\nÚLTIMOS 10 MENSAJES:\n"+(ultimos10_251(t)||"(ninguno)")+"\nLO DICTADO AHORA: "+String(v||"").slice(0,1500);
}

/* ── preguntaConcreta251 · grupo A · estaba en index.html línea 8919 (build 286)
   Por qué se retira: pregunta de respaldo del reintento 251; build 283 quitó su llamado (dictado rápido, órdenes de encargo para la Mac). Solo en listas de carga de pruebas, sin aserción. */
function preguntaConcreta251(v, t){
  var s=_fsa(v), q;
  if(/\b(dile|diles|pidele|pideles|escribele|mandale|avisale|preguntale|pregunta|manda|avisa)\b/.test(s)) return {k:"txt", q:"¿A quién se lo mando y qué le digo exactamente?", ops:[]};
  if(/\b(agend\w*|recuerdame|avisame|recordatorio|fecha|cuando|para el)\b/.test(s)) return {k:"txt", q:"¿Para qué día y a qué hora lo agendo?", ops:[]};
  var corto=String(v||"").replace(/\s+/g," ").trim(); corto=corto.length>60?corto.slice(0,59)+"…":corto;
  return {k:"resp", q:"No me quedó claro qué hacer con «"+corto+"». ¿Qué es?", ops:[{id:"dato", label:"Es un dato para anotar"},{id:"msg", label:"Mándale un mensaje a alguien"},{id:"agenda", label:"Agéndame un aviso"}]};
}

/* ── opcionesMover · grupo A · estaba en index.html línea 10362 (build 286)
   Por qué se retira: opciones de «¿A dónde va?» del 226; build 262 la sustituyó por el motor único de parecidas (sugeridasPara262). Solo en la lista de carga de b225, sin aserción. */
/* las tareas para "¿A donde va?": la mas probable primero (la alternativa de la duda, o la de mas palabras en comun),
   luego donde cayo, luego las del mismo contacto; maximo 5 */
function opcionesMover(t, x){
  var L=tareasParaMover(t, x), d=x&&x.duda_tarea, ws={};
  _nn(_txMsg(x)).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).forEach(function(w){ if(w.length>=4 && META_VACIAS.indexOf(w)<0) ws[w.slice(0,6)]=1; });
  L.forEach(function(o){ var s=0, b=_nn([o.d.nombre, o.d.contexto, ((o.d.checklist&&o.d.checklist.items)||[]).map(function(i){ return i.tx; }).join(" ")].join(" ")).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/), vis={};
    b.forEach(function(w){ var r=w.slice(0,6); if(w.length>=4 && ws[r] && !vis[r]){ vis[r]=1; s++; } }); o.p=s+(o.mismo?0.5:0); });
  var best=(d && d.alternativa_id)?L.filter(function(o){ return o.d.id===d.alternativa_id; })[0]:null;
  if(!best){ var sl=L.slice().sort(function(a,b){ return b.p-a.p; }); best=sl[0]||null; }
  var resto=L.filter(function(o){ return o!==best; }).sort(function(a,b){ return (b.p-a.p) || (b.mismo-a.mismo); });
  var out=[]; if(best) out.push({d:best.d, tag:"más probable", best:true});
  out.push({d:t, tag:"aquí cayó", aqui:true});
  resto.slice(0,3).forEach(function(o){ out.push({d:o.d, tag:o.mismo?"":""}); });
  return out;
}

/* ── acomodoOk · grupo A · estaba en index.html línea 10278 (build 286)
   Por qué se retira: OK por mensaje del Acomodo (226); build 237 pasó el Acomodo a pláticas y quitó su llamado. Solo en la lista de carga de b225, sin aserción. */
function acomodoOk(t, ix){
  var x=(t.msgs||[])[ix]; if(!x) return "";
  x.duda_resuelta="esta"; x.duda_ts=Date.now(); x.acomodo={ok:1, ts:Date.now(), por:yo||""};
  censoAcomodo(t, x, t.id, t.id, "ok"); guarda(t); return "Listo: se queda en “"+(t.nombre||"esta tarea")+"”.";
}

/* ── dudasAcomodo · grupo A · estaba en index.html línea 11115 (build 286)
   Por qué se retira: lista de dudas por mensaje del Acomodo (226); build 237 la cambió por pláticas (platicas237). Sin pruebas. */
function dudasAcomodo(){
  var out=[]; tareas.forEach(function(t){ if(!abiertaVisible(t)) return;
    (t.msgs||[]).forEach(function(x,ix){ if(x && x.duda_tarea && !x.duda_resuelta && !x.oculto && !x.eliminado) out.push({t:t, ix:ix, x:x}); }); });
  return out.sort(function(a,b){ return (b.x.ts||0)-(a.x.ts||0); });
}

/* ── grupoDe237 · grupo A · estaba en index.html línea 10485 (build 286)
   Por qué se retira: buscaba la plática de un mensaje; dejó de llamarse en build 238 (botones por globo). Solo en la lista de carga de b225, sin aserción. */
function grupoDe237(t, ix){ var G=platicas237(t); for(var i=0;i<G.length;i++) if(G[i].ixs.indexOf(ix)>=0) return G[i]; return null; }

/* ── vDudaTarea238 · grupo A · estaba en index.html línea 10844 (build 286)
   Por qué se retira: botones OK·Mover·Nueva debajo del globo; build 242 los pasó a la hoja del detalle y dejó vDudaTarea vacía; esta versión 238 nunca se llamó. Sin pruebas. */
function vDudaTarea238(t, x, ix){
  if(!x || x.oculto || confirmado237(x) || esSaludo238(t, x)) return "";
  if(x.duda_tarea && !x.duda_resuelta) return botonesG237(ix, [ix]);
  if(acomodoIA237(x) && (window.__cl238||{})[t.id+"|"+ix]) return botonesG237(ix, [ix], " mq237ab");
  return "";
}

/* ── trivialG240 · grupo A · estaba en index.html línea 10978 (build 286)
   Por qué se retira: «OK sin importancia» del Acomodo (240); build 243 quitó los botones data-movtriv/data-actriv que la llamaban. Sin pruebas. */
function trivialG240(t, ixs){
  var hechos=[]; t.msg_imp=(t.msg_imp && typeof t.msg_imp==="object")?t.msg_imp:{};
  ixs.forEach(function(ix){ var x=(t.msgs||[])[ix]; if(!x || x.oculto) return; var k=msgId230(x)||("ts"+(x.ts||ix)); t.msg_imp[k]=0;
    x.duda_resuelta="esta"; x.duda_ts=Date.now(); x.acomodo={ok:1, ts:Date.now(), por:yo||"", trivial:1}; hechos.push(ix); });
  if(!hechos.length) return ""; hechos.forEach(function(i){ guardaRegla237("trivial", t, [i], t); }); guarda(t);
  try{ hist240("Acomodo: OK sin importancia", t, null); }catch(e){}
  return "Listo: se queda en “"+(t.nombre||"esta tarea")+"”, sin importancia.";
}

/* ── camLista274v · grupo A · estaba en index.html línea 18557 (build 286)
   Por qué se retira: versión vieja del orden de la Caminata; camLista274 ya llama a camLista276. Nunca se llamó. Sin pruebas. */
function camLista274v(){
  var H=window.__H274||{preg:[], venc:[], hoy:[]}, out=[], ya={}, h=hoy();
  var pon=function(t){ if(t && !ya[t.id] && _camVivo(t)){ ya[t.id]=1; out.push(t.id); } };
  (tareas||[]).forEach(function(t){ var d=null; try{ d=decision273(t); }catch(e){} var ds=false; try{ ds=esDecisionSal(t); }catch(e){} if(d || ds) pon(t); });
  var vh=(H.venc||[]).concat(H.hoy||[]).map(function(x){ return x.t; });
  vh.forEach(function(t){ if(esLlamada274(t) && (t.f_vigente===h || (H.hoy||[]).some(function(x){ return x.t===t; }))) pon(t); });
  (tareas||[]).forEach(function(t){ if(t && t.f_vigente===h && !t.es_recordatorio && (t.duenio===yo || !t.duenio) && esLlamada274(t)) pon(t); });
  vh.forEach(pon);
  return out;
}

/* ── vCaminata274 · grupo A · estaba en index.html línea 18960 (build 286)
   Por qué se retira: botón de Caminata del 274; build 277b lo sustituyó por el ícono nuevo del home. Sin pruebas. */
function vCaminata274(){
  if(!window.SpeechSynthesisUtterance && !window.speechSynthesis) return "";
  var n=0; try{ n=camLista274().length; }catch(e){}
  if(!n) return "";
  return '<button class="cam274b" id="bcam274" aria-label="Caminata: escuchar tus pendientes uno por uno">'+
    '<span class="cam274i" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M10.5 21l1.5-6-2.5-2.5 1.5-5 3.5 3 3 1"/><path d="M9.5 8l-3 1.5-1 3.5"/><path d="M12 15l3 2 1 4"/></svg></span>'+
    '<span class="cam274t"><b>Caminata</b><small>'+n+(n===1?' pendiente':' pendientes')+' en voz, sin ver la pantalla</small></span></button>';
}

/* ── abreCanales · grupo A · estaba en index.html línea 7821 (build 286)
   Por qué se retira: hoja para elegir canal (178); build 227/230 la sustituyó por la hoja del filtro (poneVista230 / __cnl). Sin pruebas. */
function abreCanales(t){
  var c=canalActual(t);
  var bg=document.createElement("div"); bg.className="cnlbg";
  var s=document.createElement("div"); s.className="cnlsheet";
  s.innerHTML='<div class="hh"></div>'+canalesDe(t).map(function(x){
    return '<button class="cnlop'+(x.id===c.id?" on":"")+'" data-cnl="'+esc(x.id)+'"><i style="background:'+x.col+'"></i><span>'+esc(x.nom)+'<small>'+esc(x.sub)+'</small></span></button>'; }).join("");
  function cierra(){ if(bg.parentNode) bg.parentNode.removeChild(bg); if(s.parentNode) s.parentNode.removeChild(s); }
  bg.onclick=cierra;
  Array.prototype.forEach.call(s.querySelectorAll("[data-cnl]"),function(b){ b.onclick=function(){ window.__cnl=window.__cnl||{}; window.__cnl[t.id]=b.getAttribute("data-cnl"); cierra(); render(); }; });
  document.body.appendChild(bg); document.body.appendChild(s);
}

/* ── cadaTxt · grupo B · estaba en index.html línea 3026 (build 286)
   Por qué se retira: texto «cada lunes / cada mes»; su único renglón se quitó en build 164 (fecha limpia en recurrentes). Sin pruebas. */
function cadaTxt(t){
  if(t.periodicidad==="mensual"){ var f=t.f_vigente||t.f_original; return t.dia_mes?"cada mes, el "+t.dia_mes:(f?"cada mes, el "+Number(f.slice(8,10)):"cada mes"); }
  var g=t.f_vigente||t.f_original; return g?"cada "+DIAS_L[new Date(g+"T00:00:00").getDay()]:"cada semana";
}

/* ── fechaLarga · grupo B · estaba en index.html línea 9777 (build 286)
   Por qué se retira: fecha de hoy en letra; ya venía sin llamar en el primer archivo subido. Solo la menciona un comentario. Sin pruebas. */
function fechaLarga(){
  var d=new Date();
  var dias=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  var mes=["enero","febrero","marzo","abril","mayo","junio","julio","agosto",
           "septiembre","octubre","noviembre","diciembre"];
  return dias[d.getDay()]+" "+d.getDate()+" de "+mes[d.getMonth()];
}

/* ── pegaFoto · grupo B · estaba en index.html línea 13651 (build 286)
   Por qué se retira: envoltura de pegaFotoA, que todos llaman directo; nunca se llamó. Sin pruebas. */
function pegaFoto(t){ pegaFotoA(t, fotoEnMano); }

/* ── cruzBlanca · grupo B · estaba en index.html línea 15312 (build 286)
   Por qué se retira: ícono SVG de cruz; nunca se llamó desde el primer archivo. Sin pruebas. */
function cruzBlanca(){ return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" '+
  'stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M6.5 6.5 17.5 17.5"/>'+
  '<path d="M17.5 6.5 6.5 17.5"/></svg>'; }

/* ── adjImgs · grupo B · estaba en index.html línea 3582 (build 286)
   Por qué se retira: filtro de adjuntos con imagen (186); nunca se llamó. Sin pruebas. */
function adjImgs(t){ return adjuntos(t).filter(function(f){ return f.img; }); }

/* ── _camMay277 · grupo B · estaba en index.html línea 19703 (build 286)
   Por qué se retira: mayúscula inicial de la Caminata (277); nunca se llamó (se usa conMayuscula). Sin pruebas. */
function _camMay277(s){ s=String(s||""); return s.charAt(0).toUpperCase()+s.slice(1); }


/* ═════════ CSS retirado (149 reglas de clases que ni la app ni las pruebas usan; se revisó que
   ninguna se arme por concatenación de texto). Para regresar una, pegarla dentro de <style>. ═════════
.nip{display:flex;gap:9px}
.nip input{width:52px;height:60px;text-align:center;font-size:35.1px;font-family:Archivo,-apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,system-ui,sans-serif;
  border:1.5px solid var(--line);border-radius:11px;background:var(--surface);color:var(--ink)}
.nip input:focus{outline:2px solid var(--hacer);border-color:var(--hacer)}
.gico{width:42px;height:42px;border-radius:13px;flex:0 0 auto;display:flex;
  align-items:center;justify-content:center;background:linear-gradient(135deg,#3ddc6a,#22a447);
  box-shadow:0 4px 12px rgba(48,209,88,.25)}
.gico svg{width:24px;height:24px}
.gsw{position:relative;width:56px;height:32px;border-radius:16px;background:var(--hacer);
  transition:background .2s;flex:0 0 auto;cursor:pointer}
.gsw.off{background:var(--line)}
.gsw i{position:absolute;top:3px;left:27px;width:26px;height:26px;border-radius:50%;
  background:#fff;transition:left .2s}
.gsw.off i{left:3px}
.encq .icx{display:inline-block;vertical-align:-2px;margin-left:2px}
/* el renglon de abajo del encabezado rojo: quien te espera *\/
.encq{display:block;width:100%;text-align:center;background:none;border:0;margin-top:9px;
  color:var(--rojo-ink);font-size:16.9px;cursor:pointer;padding:2px 0 0;
  animation:resp 1.8s ease-in-out infinite}
.encq{animation:none}
.who{width:38px;height:38px;border-radius:50%;flex:none;background:var(--hacer);color:#fff;
  display:grid;place-items:center;font-family:Archivo,-apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,system-ui,sans-serif;font-weight:600;font-size:17.6px}
/* el encabezado de la lista: Hoy + fecha larga *\/
.hoyh{display:flex;align-items:baseline;gap:8px;padding:16px 15px 6px}
.hoyh b{font-family:Archivo,-apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,system-ui,sans-serif;font-size:23px;font-weight:600;color:var(--ink)}
.hoyh span{font-size:16.9px;color:var(--ink-3)}
/* pie tenue: lo que Claude persigue y no subio *\/
.piesig{display:block;width:100%;text-align:center;background:none;border:0;
  padding:16px 15px 26px;color:var(--ink-4);font-size:16.2px;cursor:pointer}
/* build 143: chip de persona, "Listo" tocable y ficha de persona *\/
.pchip{display:inline-flex;align-items:center;gap:4px;margin-left:8px;padding:2px 10px 2px 7px;border-radius:999px;border:0;
  background:rgba(10,132,255,.16);color:var(--azul);font:inherit;font-size:14.5px;font-weight:500;line-height:1.5;vertical-align:1px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.pchip:active{background:rgba(10,132,255,.28)}
/* puntitos del color de su seccion en el home (Salvador 2026-09-22) *\/
.d-sec-atora{background:var(--venc)}
.d-sec-venc{background:var(--amar)}
.d-sec-msg{background:var(--hacer)}
.d-sec-hoy{background:var(--azul)}
.d-sec-rec{background:var(--morado)}
.binp{width:100%;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;
  padding:9px 12px;font:inherit;font-size:18.9px;color:var(--ink)}
.binp::placeholder{color:var(--ink-3)}
.sec-head{display:flex;align-items:center;gap:8px;width:100%;background:none;border:0;
  margin:0;padding:14px 15px 6px;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent;
  font:inherit;color:inherit}
.sec-head .grp{padding:0}
.sec-chev{width:8px;height:8px;border-right:1.6px solid var(--ink-3);border-bottom:1.6px solid var(--ink-3);
  transform:rotate(-45deg);transition:transform .2s ease;flex:none}
.sec-chev.open{transform:rotate(45deg)}
.sb-venc{background:linear-gradient(180deg,rgba(255,214,10,.14),rgba(255,214,10,.05));border-color:rgba(255,214,10,.40);box-shadow:0 0 20px rgba(255,214,10,.16)}
.sb-venc .sicw{background:rgba(255,214,10,.18);color:#ffe066}
.sb-venc .scnt{background:var(--amar);color:#3a2f00}
.sb-venc b{color:var(--ink)}
.sb-msg{background:linear-gradient(180deg,rgba(48,209,88,.14),rgba(48,209,88,.05));border-color:rgba(48,209,88,.40);box-shadow:0 0 20px rgba(48,209,88,.20)}
.sb-msg .sicw{background:rgba(48,209,88,.18);color:#5ef08a}
.sb-msg .scnt{background:var(--hacer);color:#06340f}
.sb-msg b{color:var(--ink)}
.sb-rec{background:linear-gradient(180deg,rgba(124,100,255,.14),rgba(124,100,255,.05));border-color:rgba(124,100,255,.40);box-shadow:0 0 20px rgba(124,100,255,.18)}
.sb-rec .sicw{background:rgba(124,100,255,.18);color:#b3a4ff}
.sb-rec .scnt{background:var(--morado);color:#180f3a}
.sb-rec b{color:var(--ink)}
.sec-head .grow{flex:1}
.row.sil .ls{color:var(--sil);font-weight:500}
.g-hacer{background:var(--hacer)}
.g-sil{background:var(--sil)}
.strip .scv{color:var(--ink-3);font-size:14px;font-weight:600;flex:none}
.fbody{padding:8px 15px 12px;background:var(--surface);border-bottom:1px solid var(--line);display:none}
.fbody.on{display:block}
.fbody dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:16.9px}
.fbody dt{color:var(--ink-3);font-size:14.9px;text-transform:uppercase;letter-spacing:.05em;font-weight:600;padding-top:2px}
.fbody dd{margin:0;color:var(--ink-2);line-height:1.4}
.hbar .hfch{flex:1;text-align:right;font-size:14.2px;color:var(--ink-3);font-variant-numeric:tabular-nums}
.enchip{font-size:13px;color:var(--ink-3);text-align:center;margin-bottom:8px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.b.swp{transition:none}
.swico{position:absolute;left:-36px;top:50%;width:28px;height:28px;margin-top:-14px;border-radius:50%;background:var(--ok,#30d158);color:#000;display:grid;place-items:center;font-weight:800;opacity:0}
.tth{display:flex;align-items:center;justify-content:space-between;margin:12px 19px 6px}
.tth b{font-family:Archivo,-apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,system-ui,sans-serif;font-size:20px;font-weight:700;color:var(--ink)}
.ttz{color:var(--ink-3);font-size:14px}
.ttpie{display:flex;justify-content:center;gap:22px;margin:18px 0 10px}
.ttpie button{border:0;background:none;color:var(--ink-3);font-size:16px;padding:8px 6px}
.sep270 .ttlee{order:3;margin-left:2px;padding:0 2px}
.ttg{margin:12px 21px 5px;font-size:13.5px;font-weight:700;letter-spacing:.05em;color:var(--ink-3);text-transform:uppercase}
.ttmas{justify-content:center;color:#0a84ff;font-size:15.5px;font-weight:600}
.tth b{font-size:24px!important}
.cnlop{display:flex;align-items:center;gap:12px;width:100%;padding:12px 10px;border:0;border-radius:12px;background:none;color:var(--ink);font-size:16.5px;text-align:left}
.cnlop i{width:11px;height:11px;border-radius:50%;flex:none}
.cnlop small{display:block;color:var(--ink-3);font-size:13px}
.cnlop.on{background:#3a3a3c}
.extpop button.pcl{background:#D97757}
.ncfold{color:#D97757}
.rv225 .rvk{display:block;font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-3);font-weight:700;margin-bottom:2px}
.d225dic{margin-top:8px;border:0;border-radius:10px;background:#0a84ff;color:#fff;font:inherit;font-size:14.5px;font-weight:700;padding:6px 14px}
.dt225{display:flex;flex-direction:column;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid #3a3a3c;font-size:14.5px}
.dt225 .dtb{display:flex;gap:6px;flex-wrap:wrap}
.dt225 button{border:0;border-radius:10px;background:rgba(10,132,255,.18);color:#7cc0ff;font:inherit;font-size:14px;font-weight:600;padding:5px 10px}
.ac226.triv240{margin-top:0}
.ac226.triv240 button{color:var(--ink-3);font-weight:500}
.hcf li{flex-direction:column;gap:6px}
.hco{display:flex;flex-wrap:wrap;gap:6px}
.hco button{border:1px solid var(--azul);color:var(--azul);background:transparent;border-radius:12px;padding:5px 11px;font:inherit;font-size:14px}
.mq237{display:block;border:0;background:none;font:inherit;font-size:12px;color:var(--ink-3);margin:-2px 0 6px 12px;padding:2px 0;cursor:pointer}
.ac226.mq237ab{margin-left:12px}
/* build 271 *\/
.acohint{text-align:center;color:var(--ink-3);font-size:13px;margin:8px 0 0}
.rv225 .rvk{display:flex;align-items:center;gap:4px}
.rv225 .rvk svg{color:var(--ink-3)}
.rv225.min .rvk{margin:0;font-size:12.5px}
.chip225.on228{color:var(--ink);background:#3a3a3c}
.cam274i{flex:none;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.18);display:grid;place-items:center}
.cam274t{display:flex;flex-direction:column;min-width:0}
.cam274t b{font-size:19px;font-weight:700;line-height:1.2}
.cam274t small{font-size:13.5px;opacity:.85;line-height:1.3}
.chip225.det231{padding:5px 7px}
.chip225.det231 svg{width:17px;height:17px}
.hchip{flex:1;display:flex;align-items:center;gap:8px;background:var(--surface-2,#2a2a2d);border-radius:12px;padding:9px 12px;font-size:15px;color:var(--ink,#f2f2f4);min-width:0}
.hchip span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hchip.ind{color:var(--fi-blue)}
.hchip.dato svg{color:#ff9f0a}
.hchip.sin{color:var(--ink-3,#9a9aa2)}
.hchev{width:38px;height:38px;border-radius:12px;border:0;background:var(--surface-2,#2a2a2d);color:var(--ink-3,#9a9aa2);font-size:15px;flex:none}
.aghd{display:flex;align-items:center;gap:8px;color:var(--fi-blue);font-size:17px}
.fic .agev{font-weight:600}
.fic .agcu{color:var(--ink-3,#9a9aa2);font-size:14px}
.agbt{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px}
.agbt button{font-size:20px;font-weight:700;border-radius:14px;padding:16px 8px;border:1px solid #3a3a3e;background:var(--surface-2,#2a2a2d);color:var(--ink,#f2f2f4)}
.agbt .si{background:#1a5c33;border-color:#30d158;color:#fff}
.agin{display:flex;gap:8px}
.agin input{flex:1;min-width:0;font-size:17px;padding:10px;border-radius:10px;border:1px solid #3a3a3e;background:#1c1c1e;color:var(--ink,#f2f2f4)}
.agok{font-size:17px;font-weight:600;padding:13px;border-radius:12px;border:0;background:var(--fi-blue);color:#fff}
.agcam{background:none;border:0;color:var(--fi-blue);font-size:14px;padding:4px 0;align-self:flex-start}
.agtd{flex:1;font-size:16px;font-weight:600;border-radius:10px;border:1px solid #3a3a3e;background:var(--surface-2,#2a2a2d);color:var(--ink-3,#9a9aa2)}
.agtd.on{background:var(--fi-bluebg);border-color:#2f6fa8;color:var(--fi-blue)}
.agin input:disabled{opacity:.4}
.ttgrp{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3,#9a9aa2);padding:8px 4px 2px}
.b .ctag{display:block;font-size:12.5px;color:var(--ink-3);margin-top:2px}
.saltopill{position:sticky;bottom:8px;margin:8px 14px 0;background:var(--surface-2);border:.5px solid var(--line);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;font-size:15px;color:var(--ink-2);animation:saltoPill .3s cubic-bezier(.2,.8,.2,1)}
.saltopill .tx{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.saltopill button{background:none;border:0;color:var(--hacer);font:600 15px Archivo,sans-serif;padding:0}
.negmsg{flex:1 1 100%;color:var(--ink-2);font-size:16px;margin-bottom:2px;line-height:1.35}
/* build 204: clip verde con archivos; seleccion multiple; de donde nacio *\/
.iconbtn.clipon{color:#30d158}
.qpie{padding:18px 18px 26px;border-top:.5px solid var(--line);display:flex;flex-direction:column;align-items:center}
.qdicta{font-size:18px;color:var(--ink-2);font-weight:600;margin-bottom:10px}
.qcancel{width:44px;height:44px;border-radius:50%;border:0;background:var(--venc);display:grid;place-items:center;cursor:pointer;margin-top:26px}
/* RENGLON DE MENSAJES — verde difuminado (glow), delgado, un solo renglon *\/
.msgbar{display:flex;align-items:center;gap:12px;width:calc(100% - 30px);margin:11px 15px 3px;
  padding:9px 13px;border-radius:12px;cursor:pointer;text-align:left;
  background:linear-gradient(180deg,rgba(48,209,88,.14),rgba(48,209,88,.05));
  border:1px solid rgba(48,209,88,.40);box-shadow:0 0 20px rgba(48,209,88,.20)}
.msgbar .micw{position:relative;flex:none;width:34px;height:34px;border-radius:9px;
  background:rgba(48,209,88,.18);color:#5ef08a;display:grid;place-items:center}
.msgbar .mcount{position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;border-radius:10px;
  padding:0 5px;display:grid;place-items:center;font-size:12px;font-weight:800;
  background:var(--hacer);color:#06340f;border:2px solid var(--ground)}
.msgbar b{font-size:16px;font-weight:600;color:#8ff0a9}
.msgbar .grow{flex:1}
.msgbar .mchev{color:#5ef08a;font-size:17px}
.msgbar:active{filter:brightness(1.08)}
/* ===== BOTE "INFORMACION PENDIENTE" — espejo naranja del renglon verde ===== *\/
.pendbar{display:flex;align-items:center;gap:12px;width:calc(100% - 30px);margin:11px 15px 3px;
  padding:9px 13px;border-radius:12px;cursor:pointer;text-align:left;
  background:linear-gradient(180deg,rgba(255,159,10,.16),rgba(255,159,10,.05));
  border:1px solid rgba(255,159,10,.45);box-shadow:0 0 22px rgba(255,159,10,.20);
  animation:pulso 1.5s ease-in-out infinite}
.pendbar{animation:none}
.pendbar .pcw{position:relative;flex:none;width:34px;height:34px;border-radius:9px;
  background:rgba(255,159,10,.20);color:#ffca6a;display:grid;place-items:center}
.pendbar .pcw .qmk{font-family:Archivo,Barlow;font-size:19px;font-weight:800;line-height:1}
.pendbar .pcount{position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;border-radius:10px;
  padding:0 5px;display:grid;place-items:center;font-size:12px;font-weight:800;
  background:var(--esper);color:#3a2400;border:2px solid var(--ground)}
.pendbar b{font-size:16px;font-weight:600;color:#ffca6a}
.pendbar .grow{flex:1}
.pendbar .pchev{color:#ffb340;font-size:17px}
.pendbar:active{filter:brightness(1.08)}
.q249 .qo{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.q249 .qop,.q249 .qsg{border:0;border-radius:12px;padding:8px 12px;background:#1c3a5a;color:var(--ink,#fff);font:inherit;font-size:15.5px;text-align:left}
.q249 .qop.on{background:#0a84ff}
.q249 .qsg small{display:block;color:#9cc9ff;font-size:12.5px}
.preg249 .pie249{display:flex;gap:10px;margin-top:6px}
.preg249 .pie249 button{flex:1;min-height:48px;border:0;border-radius:14px;font:inherit;font-size:17px;font-weight:700;background:var(--surface-2,#2c2c2e);color:var(--ink,#fff)}
.preg249 .pie249 .go{background:#0a84ff;color:#fff}
.preg249 .pie249 .go:disabled{opacity:.4}
.hc238 .hc249{display:block;width:100%;margin-top:6px;min-height:42px;border:0;border-radius:12px;background:#0a84ff;color:#fff;font:inherit;font-size:16px;font-weight:700}
.ttlee{margin-left:auto;border:0;background:none;color:var(--ink-2);padding:2px 8px;display:flex;align-items:center}
*/
