/* copia en la tarea de un aviso que Doit le mandó a Salvador por WhatsApp («Doit: IA · …»): la pregunta de verdad vive
   en la tarea (decisión, preguntas); su respuesta llega por el chat de Doit, no como respuesta en esta tarea */
function esAvisoDeDoit(y){ return !!y && (_n179(String(y.wa_c||""))==="doit" || /^\s*Doit:\s*IA\s*·/.test(String(y.t||""))); }
function preguntaParaMi(t){
  var ms=t.msgs||[], nombres=misNombres();
  var iUlt=-1; for(var i=ms.length-1;i>=0;i--){ var x=ms[i]; if(x && x.k==="bo" && (x.de===yo || (!x.de && t.duenio===yo)) && !x.vaga){ if(x.compromiso && x.compromiso.hasta>Date.now()) return null; iUlt=i; break; } }
  for(var j=ms.length-1;j>iUlt;j--){
    var y=ms[j]; if(!y || y.de===yo || y.oculto || y.eliminado || y.contestada247) continue;
    if(temaAjeno(t, y, j-1===iUlt && iUlt>=0)) continue;   /* build 260: un mensaje movido de otra tarea o de otro tema no genera "Te pregunta" aquí */   /* build 247: ya la contesté; build 227: lo movido/oculto ya no pregunta aqui */
    var deOtro=(y.wa_in===1) || (y.k==="bo" && y.de && y.de!==yo); if(!deOtro) continue;
    if(esAvisoDeDoit(y)) continue;   /* el aviso que la propia app le mandó por WhatsApp no es alguien que le pregunta */
    var tx=_n179((y.tr||y.t||"")), mm=String(y.t||"").match(/^([^:\n]{1,24}):\s*/), quien=y.wa_c||(y.de&&PERSONAS[y.de]&&PERSONAS[y.de].nombre)||(mm?mm[1]:"Alguien");
    var pide=PIDE_RXf().test(" "+tx+" ") || /\?/.test(String(y.t||""));
    if(!pide) continue;
    /* build 183: un documento o un borrador largo no es una pregunta; ni lo que saluda a OTRA persona ("¿Qué tal, Roberto?") */
    if(String(y.tr||y.t||"").length>450) continue;
    var _voc=String(y.tr||y.t||"").replace(/^\s*[^:\n\[]{1,24}:\s*/,"").replace(/^\s*\[audio\]\s*/i,"").match(/^\s*¿?\s*(?:[Qq]u[eé]\s+tal|[Hh]ola|[Oo]ye|[Bb]uen[oa]s(?:\s+(?:d[ií]as|tardes|noches))?)\s*,?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/);
    if(_voc && misNombres().indexOf(_n179(_voc[1]))<0) continue;
    var meNombra=nombres.some(function(n){ return n && (" "+tx+" ").indexOf(" "+n+" ")>=0; });
    var aMi=meNombra || (y.cita && _n179(y.cita.de)===_n179((PERSONAS[yo]||{}).nombre)) || (j-1===iUlt && iUlt>=0) || (t.duenio===yo && y.wa_in===1);
    var paraTodos=/\b(todos ustedes|opinen|votemos|que opinan|que opinan todos|alguien sabe)\b/.test(tx);
    if(aMi || paraTodos){
      if(contestadoPorSalida(ms, j, y, quien)) continue;   /* build 244: Salvador ya le contestó (desde su celular o la Mac) */
      return {ix:j, de:String(quien).split(" ")[0], t:String(y.t||"").replace(/^([^:\n]{1,24}):\s*/,""), todos:!aMi&&paraTodos};
    }
  }
  return null;
}
/* build 244 (Salvador 6-oct 06:40, "TE PREGUNTA · Jorge"): si DESPUÉS de la pregunta hay cualquier mensaje saliente de Salvador a ese mismo
   contacto, ya no se cuenta. Salientes: wa_in 0 / origen wa_saliente (los que mandó desde su celular y la Mac registra en el hilo), o un
   globo suyo por WhatsApp (bo con wa_c / wa_auto). Mismo contacto = mismo teléfono si ambos lo traen; si no, mismo nombre (o el nombre
   del saliente contiene al otro); un saliente sin contacto en el hilo cuenta. Las notas, avisos, programados y cancelados no cuentan. */
function esSalidaWA(z){
  if(!z || z.oculto || z.eliminado || z.nota_ia || z.aviso || z.empujon || z.prog || z.wa_can || z.hab) return false;
  if(esSaliente(z)) return true;
  return z.k==="bo" && !!(z.wa_c || z.wa_auto) && (!z.de || z.de==="salvador");
}
function mismoContacto244(z, y, quien){
  var tz=_telDe(z), ty=_telDe(y); if(tz && ty) return tz===ty;
  var nz=_n179(z.wa_c||z.wa_auto||z.chat||""), nq=_n179((y&&y.wa_c)||quien||""); if(!nz || !nq) return true;
  if(nz===nq || nz.indexOf(nq)===0 || nq.indexOf(nz)===0) return true;
  return nz.split(" ")[0]===nq.split(" ")[0];
}
function contestadoPorSalida(ms, j, y, quien){
  var yts=+y.ts||0;
  for(var k=0;k<ms.length;k++){ if(k===j) continue; var z=ms[k]; if(!esSalidaWA(z)) continue;
    var despues=(yts && +z.ts)?(+z.ts>yts):(k>j); if(!despues) continue;
    if(mismoContacto244(z, y, quien)) return true; }
  return false;
}

/* ---------- "PARA TI": la pregunta textual + resumen con fuentes ---------- */
function vParaTi(t){
  window.__paraTi=window.__paraTi||{};
  var p=preguntaParaMi(t); if(!p) return "";
  var key=t.id+"|"+p.ix, r=window.__paraTi[key];
  if(!r){ try{ var ls=localStorage.getItem("bit_pt_"+key); if(ls) r=window.__paraTi[key]=JSON.parse(ls); }catch(e){} }
  if(!r && !window.__paraTiPidiendo){ setTimeout(function(){ pideParaTi(t,p,key); },30); }
  function fuente(ix){ return (typeof ix==="number" && t.msgs && t.msgs[ix])?' <span class="ptsrc" data-irmsg="'+ix+'">·</span>':''; }
  window.__ptAb=window.__ptAb||{}; var _ab=!!window.__ptAb[t.id];
  /* build 227: se minimiza a una linea delgada (se recuerda por tarea); si el mensaje no tiene acomodo confirmado, OK · Mover · Nueva aqui */
  var _tit=(p.todos?"Piden a todos · ":"Te pregunta · ")+p.de;
  if(min225(t.id,"pt")) return '<button class="ptmini227" data-min225="pt" aria-expanded="false">'+esc(_tit)+ico("der",13)+'</button>';
  var _x=(t.msgs||[])[p.ix], _ac=(_x && _x.duda_tarea && !_x.duda_resuelta && !_x.oculto)?botonesG(p.ix, [p.ix], " pt227"):'';   /* build 238: por mensaje */
  var h='<div class="ptcard'+(_ab?' ab':'')+'"><span class="pth">'+esc((p.todos?"PIDEN A TODOS · ":"TE PREGUNTA · ")+p.de)+'<button class="ptmin227" data-min225="pt" aria-label="Minimizar">'+ico("down",15)+'</button></span><span class="ptq" data-pt247="'+p.ix+'">“'+esc(p.t)+'”</span>'+_ac;
  if(!_ab) return h+'<button class="ptmas" data-ptab="1">ver todo ▾</button></div>';
  if(r && !r.err){
    (r.posturas||[]).slice(0,3).forEach(function(x){ if(typeof x.ix==="number"&&t.msgs[x.ix]) h+='<span class="ptl"><b>'+esc(x.postura||"")+':</b> '+esc((x.quienes||[]).join(", "))+fuente(x.ix)+'</span>'; });
    (r.datos||[]).slice(0,4).forEach(function(x){ if(typeof x.ix==="number"&&t.msgs[x.ix]) h+='<span class="ptl" data-pt247="'+x.ix+'"><b>Dato:</b> '+esc(x.texto||"")+fuente(x.ix)+'</span>'; });
    (r.decidido||[]).slice(0,2).forEach(function(x){ if(typeof x.ix==="number"&&t.msgs[x.ix]) h+='<span class="ptl"><b>Se decidió:</b> '+esc(x.texto||"")+fuente(x.ix)+'</span>'; });
    (r.falta||[]).slice(0,2).forEach(function(x){ h+='<span class="ptl ptf"><b>Falta:</b> '+esc(String(x.texto||x))+'</span>'; });
  } else if(!r) h+='<span class="ptl ptw">Armando el contexto…</span>';
  return h+'<button class="ptmas" data-ptab="0">ver menos ▴</button></div>';
}
function pideParaTi(t, p, key){
  window.__paraTi=window.__paraTi||{};
  if(window.__paraTi[key] || window.__paraTiPidiendo===key) return;
  var ms=(t.msgs||[]), desde=Math.max(0, ms.length-60), lines=[];
  for(var i=desde;i<ms.length;i++){ var x=ms[i]; if(!x || (x.k==="bi" && !x.wa_in)) continue; var q=x.wa_c||(x.de&&PERSONAS[x.de]&&PERSONAS[x.de].nombre)||(x.k==="bo"?"Salvador":"?"); lines.push("["+i+"] "+q+": "+String(x.tr||x.t||"").slice(0,400)); }
  if(lines.length<4){ window.__paraTi[key]={posturas:[],datos:[],decidido:[],falta:[]}; return; }
  window.__paraTiPidiendo=key;
  if(t.notas_claude && t.notas_claude.length) lines.push("CORRECCIONES DE SALVADOR (mandan sobre los mensajes): "+t.notas_claude.map(function(n){return n.t;}).join(" | ").slice(0,1200));
  var sys="Armas el contexto MINIMO para que "+((PERSONAS[yo]||{}).nombre||"el usuario")+" conteste esta pregunta: [" + p.ix + "] " + p.t +
    "\nUsa SOLO lo que dicen los mensajes; NO inventes, NO calcules ni redondees cifras (copialas tal cual). Si dos dicen cifras distintas, pon las dos. "+
    "Ignora 'ok', 'si', emojis como texto (cuentalos solo como voto). Solo lo del tema de esa pregunta. Cada renglon lleva ix = numero del mensaje de donde salio. "+
    "Contesta SOLO JSON: {\"posturas\":[{\"postura\":\"A favor de X\",\"quienes\":[\"Nombre\"],\"ix\":n}],\"datos\":[{\"texto\":\"...\",\"ix\":n}],\"decidido\":[{\"texto\":\"...\",\"ix\":n}],\"falta\":[{\"texto\":\"...\"}]}. Listas vacias si no hay.\n\nMENSAJES:\n"+lines.join("\n");
  try{
    preguntaAClaude([{role:"user",content:sys}],"rapido",function(txt,err){
      window.__paraTiPidiendo=null;
      var j=null; try{ var mm=String(txt||"").match(/\{[\s\S]*\}/); j=mm?JSON.parse(mm[0]):null; }catch(e){ j=null; }
      window.__paraTi[key]=j||{err:1};
      try{ if(j) localStorage.setItem("bit_pt_"+key, JSON.stringify(j)); }catch(e){}
      if(vista==="hilo" && abierta===t.id) render();
    });
  }catch(e){ window.__paraTiPidiendo=null; window.__paraTi[key]={err:1}; }
}

/* ---------- respuestas que no resuelven ---------- */
function VAGA_RXf(){ return /\b(lo (estoy )?(analizando|reviso|checo|veo|pienso|consulto)|d[eé]jame (ver|checar|revisar|pensarlo|lo veo)|ahorita (te|lo) (digo|veo|checo|reviso)|al rato|luego (te|lo)|despu[eé]s (te|lo)|lo platicamos|lo vemos|en eso estoy|estoy en eso|ya veremos)\b/i; }
function clasificaRespuesta(v){
  var s=String(v||""), fx=null;
  try{ fx=fechaMovida(s); }catch(e){}
  var hora=false; try{ hora=!!horaDicha(s); }catch(e){}
  var vaga=VAGA_RXf().test(s);
  if(vaga && (fx||hora)){
    var hasta=Date.now()+24*3600*1000;
    if(fx){ var d=new Date(fx+"T00:00:00"); d.setHours(hora?12:18); hasta=d.getTime(); }
    if(hora){ try{ var ac=armaCuando(s); if(ac&&ac.hora){ var d2=new Date((ac.fecha||fx||hoy())+"T"+ac.hora+":00"); if(!isNaN(d2)) hasta=d2.getTime(); } }catch(e){} }
    return {tipo:"compromiso", hasta:hasta};
  }
  if(vaga || s.trim().length<4) return {tipo:"vaga"};
  return {tipo:"resuelve"};
}
/* se llama despues de que se guarda lo que contesto */
function revisaMiRespuesta(t, v, p){
  if(!p) return;
  var c=clasificaRespuesta(v);
  var ms=t.msgs||[], m=null;
  for(var i=ms.length-1;i>=0 && i>=ms.length-6;i--){ var x=ms[i]; if(x && x.k==="bo" && (String(x.t||"").trim()===v.trim() || String(x.tr||"").trim()===v.trim())){ m=x; break; } }
  if(!m) return;
  if(c.tipo==="vaga"){
    m.vaga=1;
    msg(t,"bi","Esto no contesta lo que te pidió "+p.de+": “"+(p.t.length>90?p.t.slice(0,89)+"…":p.t)+"”. Dale el dato, o di para cuándo lo tienes.");
    var n=t.msgs[t.msgs.length-1]; n.canal="priv:"+yo; n.priv=1;
  } else if(c.tipo==="compromiso"){ m.compromiso={hasta:c.hasta, ix:p.ix}; }
  guarda(t); if(vista==="hilo") render();
}

/* ---------- SUPERVISOR: misma tarea, otra lente ---------- */
function soySupervisor(t){ return !!(t && t.duenio && t.duenio!==yo && (jefeDe(yo,t.duenio) || (t.revisores||[]).indexOf(yo)>=0)); }
function vSupervisor(t){
  if(!soySupervisor(t) || t.cierre) return "";
  var e=estadoReal(t), _sf=sinFinal(t), en=(e==="vencida")?[_sf?"Sin confirmar":"Atrasada","#FF453A"]:((t.f_vigente&&dDif(t.f_vigente,hoy())===0)?[_sf?"Toca hoy":"Vence hoy","#ff9f0a"]:["En tiempo","#30d158"]);
  var _atr=(t.lista_pasos||[]).filter(function(p){ return p.hito && !p.hecho && p.fecha && p.fecha<hoy(); })[0];
  if(_atr){ var _d=-dDif(hoy(),_atr.fecha); en=["Atrasado "+Math.abs(dDif(_atr.fecha,hoy()))+" día"+(Math.abs(dDif(_atr.fecha,hoy()))===1?"":"s")+" · "+_atr.tx,"#FF453A"]; }
  var pasos=(t.lista_pasos||[]), hechos=pasos.filter(function(p){ return p.hecho; }).length;
  var fotos=(t.evidencias||[]).filter(function(f){ return f && !f.eliminado; }).length+((t.adjuntos||[]).length||0);
  var h='<div class="supcard"><span class="sph">SUPERVISAS · '+esc((PERSONAS[t.duenio]||{}).nombre||"")+'</span>'+
    '<span class="spsem" style="--sc:'+en[1]+'"><i></i>'+en[0]+(t.f_vigente?(_sf?' · próximo ':' · entrega ')+esc(fechaChip(t.f_vigente)):'')+'</span>';
  if(pasos.length){
    h+='<span class="spl">'+(pasos.some(function(p){ return p.hito; })?'Entregas':'Revisar')+' · '+hechos+'/'+pasos.length+'</span><ul class="splist">'+pasos.slice(0,8).map(function(p){ return '<li class="'+(p.hecho?"ok":"")+'">'+(p.fecha?'<span class="spf">'+esc(fechaChip(p.fecha))+'</span>':'')+(p.hecho?"✓ ":"○ ")+esc(p.tx||"")+'</li>'; }).join("")+'</ul>';
  }
  if(t.medida && t.medida.entregable) h+='<span class="spl"><b>Pediste:</b> '+esc(t.medida.entregable)+(t.medida.fecha_final?' · '+esc(fechaChip(t.medida.fecha_final)):'')+'</span>';
  else if(!entrevistaPendiente(t)) h+='<span class="spl">Sin medida todavía. Dime “entrevístame” y la armamos.</span>';
  if(fotos) h+='<span class="spl">'+fotos+' foto'+(fotos===1?'':'s')+'/documento'+(fotos===1?'':'s')+' en la tarea</span>';
  return h+'<span class="spp">Tus notas en el canal “Supervisión” no las ve '+esc((PERSONAS[t.duenio]||{}).nombre||"el dueño")+'.</span></div>';
}

/* ===================== build 263 (Salvador 6-oct): QUIÉN TIENE LA PELOTA, "CLAUDE LAS LLEVA", AVISOS UNA VEZ, FALTA INFO COHERENTE =====================
   pelota263(t): de quién es el SIGUIENTE PASO. "yo" = Salvador (decidir, autorizar, llamar, hacerlo él, o una pregunta te_necesito abierta);
   "claude" = lo lleva Claude (con "esperaA" cuando la espera es de un tercero). Lee lo que llena la Mac (resumen.que_toca, resumen.pendientes, plan[]);
   si no hay, la regla: encargo o seguimiento de IA activo, o el último mensaje es una pregunta nuestra sin responder → Claude. */
function dueno263(de){
  var s=_n179(String(de||"")); if(!s) return "";
  if(/\b(claude|ia|mac|asistente|robot|doit)\b/.test(s)) return "claude";
  var yoN=[]; try{ yoN=misNombres(); }catch(e){} yoN=yoN.concat(["yo","tu","usted","salvador"]);
  var p=s.split(" ")[0]; if(yoN.indexOf(s)>=0 || yoN.indexOf(p)>=0) return "yo";
  return "otro";
}
function pasoNorm(p, esPend){
  if(p==null) return null;
  if(typeof p==="string") p={t:p};
  var tx=String(p.t||p.texto||p.paso||p.que||p.tx||"").replace(/\s+/g," ").trim(); if(!tx) return null;
  var de=String(p.de||p.quien||p.responsable||p.owner||p.espera||"").trim();
  var hecho=p.hecho===true || p.hecha===true || p.done===true || /^(hecho|hecha|listo|lista|cumplido|cumplida|done|cerrado)$/i.test(String(p.estado||""));
  var f=String(p.fecha||p.para||p.cuando||p.hito||"").slice(0,10); if(!_fReal(f)) f="";
  return {tx:tx, de:de, hecho:hecho, fecha:f, nota:String(p.nota||p.por_que||p.detalle||"").trim(), pend:!!esPend};
}
function pasos263(t){
  var R=(t && t.resumen && typeof t.resumen==="object")?t.resumen:{}, L=[];
  [t&&t.plan, R.plan].forEach(function(a){ if(Array.isArray(a)) a.forEach(function(p){ var n=pasoNorm(p,false); if(n) L.push(n); }); });
  if(Array.isArray(R.pendientes)) R.pendientes.forEach(function(p){ var n=pasoNorm(p,true); if(n) L.push(n); });
  return L;
}
function fechaEnTexto263(tx){ try{ var d=fechaDictada(String(tx||"")); var f=d&&d.fecha; return _fReal(f)?f:""; }catch(e){ return ""; } }
/* hito de un tercero: el siguiente paso es de otra persona y tiene fecha conocida (hoy o futura). Sin llamar a nada que dependa de estadoReal. */
function esperaConHito(t){
  try{
    if(!t || t.cierre || t.es_recordatorio) return null;
    var H=hoy(), L=pasos263(t).filter(function(p){ return !p.hecho; }); if(!L.length) return null;
    if(L.some(function(p){ return dueno263(p.de)==="yo"; })) return null;
    var best=null;
    L.forEach(function(p){ if(dueno263(p.de)!=="otro") return; var f=p.fecha || fechaEnTexto263(p.tx); if(!f || f<H) return; if(!best || f<best.fecha) best={fecha:f, quien:p.de, tx:p.tx}; });
    return best;
  }catch(e){ return null; }
}
var ENC_CERRADO263=/^(hecho|hecha|cumplido|cumplida|cerrado|cerrada|cancelado|cancelada|confirmado|vencido|completado|completada|contesto_si|contesto_no)$/i;
function pelota263(t){
  var o={de:"yo", esperaA:"", fecha:"", txt:"", por:""};
  if(!t) return o;
  if(t.es_recordatorio){ o.por="recordatorio"; return o; }
  /* 1) una pregunta te_necesito abierta, una decisión o alguien que lo espera: es suya */
  try{ if((!window.__sinReg266 && esDecisionSal(t)) || (typeof decision273==="function" && decision273(t) && !t.decision.respuesta) || meDetiene(t) || preguntaParaMi(t) || (t.quien_dudas||[]).length || preguntas249(t).length || t.te_necesito===true){ o.por="te_necesito"; return o; } }catch(e){}
  var R=(t.resumen && typeof t.resumen==="object")?t.resumen:{};
  /* 2) lo que llena la Mac: el siguiente paso pendiente y de quién es */
  var L=pasos263(t).filter(function(p){ return !p.hecho; });
  for(var i=0;i<L.length;i++){ var p=L[i], d=dueno263(p.de);
    if(!d) d=infiereDe(p.tx);
    if(d){ o.txt=p.tx+(p.nota?" ("+p.nota+")":""); o.fecha=p.fecha||fechaEnTexto263(p.tx)||""; o.por="plan";
      if(d==="yo"){ o.de="yo"; return o; }
      o.de="claude"; if(d==="otro") o.esperaA=nombreCorto(p.de).split(" ")[0]; return o; } }
  var qt=String(R.que_toca||"").replace(/\s+/g," ").trim();
  if(qt && !/·\s*hecho\s*$/i.test(qt)){ var d2=infiereDe(qt);
    if(d2){ o.txt=qt; o.por="que_toca"; if(d2==="yo"){ o.de="yo"; return o; } o.de="claude"; var m=qt.match(/\b[Ee]spera(?:ndo)?\s+(?:respuesta\s+)?(?:de\s+|a\s+)?([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)/); if(m) o.esperaA=m[1]; return o; } }
  /* 3) la regla: encargo o seguimiento de IA activo, o la última pregunta es nuestra y nadie contestó */
  var enc=(Array.isArray(t.encargos)?t.encargos:[]).some(function(e){ return e && !ENC_CERRADO263.test(String(e.estado||"")); });
  var seg=!!(t.seg_a && (t.seg_a.contacto || (t.seg_a.programados||[]).length || String(t.seg_a.cada||"").trim()));
  var ult=null; (t.msgs||[]).forEach(function(m){ if(m && !m.oculto && !m.eliminado && !m.nota_ia && !m.res238 && !m.dict238 && String(m.t||"").trim()) ult=m; });
  var nuestraSinResp=!!(ult && !(+ult.wa_in) && (ult.k==="bo" || (ult.k==="bi" && !ult.wa_c) || ult.wa_auto) && (/\?|¿/.test(String(ult.t||""))) && (ult.wa_auto||ult.wa_c||ult.canal));
  if(enc || seg || nuestraSinResp){ o.de="claude"; o.por=enc?"encargo":(seg?"seguimiento":"pregunta nuestra"); if(nuestraSinResp) o.esperaA=nombreCorto(String(ult.wa_auto||ult.wa_c||"")).split(" ")[0]; else if(seg) o.esperaA=nombreCorto(String(t.seg_a.contacto||"")).split(" ")[0]; return o; }
  return o;   /* sin pista de que lo lleve Claude: es de Salvador */
}
function infiereDe(tx){
  var s=_n179(tx); if(!s) return "";
  if(/^(esper\w+|en espera|pendiente de|a la espera)\b/.test(s) || /\bespera (a|de|respuesta)\b/.test(s)) return "otro";
  if(/\b(claude|doit)\b/.test(s)) return "claude";
  var yoN=[]; try{ yoN=misNombres(); }catch(e){}
  if(/\b(te toca|tu decision|tu respuesta|tu si|tuyo|tu)\b/.test(s) || yoN.some(function(n){ return n && n.length>=3 && new RegExp("\\b"+n+"\\b").test(s); })) return "yo";
  if(/^(llamar|llama|decidir|decide|definir|define|autorizar|autoriza|aprobar|aprueba|elegir|elige|escoger|escoge|firmar|firma|pagar|paga|hablar|habla|contestar|contesta|responder|responde|visitar|ir a)\b/.test(s)) return "yo";
  return "";
}
function llevaClaude(t){ try{ var p=pelota263(t); return p.de==="claude"; }catch(e){ return false; } }
/* reparte Vencidas y Hoy de Salvador: lo que le toca a él se queda; lo que lleva Claude va a "Claude las lleva (N)" */
function reparte263(venc, hoyL){
  var jefe=!!(PERSONAS[yo] && PERSONAS[yo].jefe), out={venc:venc, hoy:hoyL, claude:[]};
  if(!jefe) return out;
  var vis={};
  function filtra(L){ return L.filter(function(t){ var p=pelota263(t); if(p.de==="claude"){ if(!vis[t.id]){ vis[t.id]=1; out.claude.push({t:t, p:p}); } return false; } return true; }); }
  out.venc=filtra(venc); out.hoy=filtra(hoyL);
  /* build 272: las que esperan respuesta de un tercero (detenida, en espera de alguien, encargo sin contestar) salen de Vencidas y Hoy hasta que conteste */
  function filtra272(L){ return L.filter(function(t){ var e=null; try{ e=esperaTercero(t); }catch(err){ e=null; } if(!e) return true; if(!vis[t.id]){ vis[t.id]=1; out.claude.push({t:t, p:{de:"claude", esperaA:e.corto, fecha:"", txt:"", por:"espera272"}}); } return false; }); }
  out.venc=filtra272(out.venc); out.hoy=filtra272(out.hoy);
  /* las que esperan a un tercero con fecha conocida (hito) salen de Hoy aunque su fecha ya pasó */
  out.hoy=out.hoy.filter(function(t){ if(esperaConHito(t)){ if(!vis[t.id]){ vis[t.id]=1; out.claude.push({t:t, p:pelota263(t)}); } return false; } return true; });
  return out;
}
function queTocaTxt(t, p){
  var R=(t.resumen && typeof t.resumen==="object")?t.resumen:{}, tx=p&&p.txt||"";
  if(!tx){ var qt=String(R.que_toca||"").replace(/\s+/g," ").trim(); if(qt && !/·\s*hecho\s*$/i.test(qt)) tx=qt; }
  if(!tx){ var P=pasos263(t).filter(function(x){ return !x.hecho; })[0]; if(P) tx=P.tx; }
  return tx.length>110?tx.slice(0,109)+"…":tx;
}
/* build 270: SEMÁFORO de lo que lleva Claude, SOLO con lo que ya traen las tareas (no se inventa nada):
   - fechas esperadas: pasos pendientes de otro o de Claude con fecha (plan[], resumen.pendientes, o fecha en el texto), encargos abiertos
     con "cuando" (Claude) o "vence" (condicional: espera la respuesta de un contacto), y los seguimientos programados (seg_a.programados)
     que ya pasaron sin respuesta del contacto;
   - el último mensaje que llegó (wa_in) contra el último que mandamos: si lo último es del contacto, ya contestó y esa espera no cuenta.
   Atraso = días desde la fecha esperada: 0 = verde, 1–2 = amarillo, 3 o más = rojo. Sin ninguna fecha esperada no hay dato confiable:
   se cuenta como al corriente (verde) y el renglón lo dice ("sin dato de seguimiento"). */
function msDe(f, hm){ var d=new Date(f+"T"+(/^\d{2}:\d{2}$/.test(hm||"")?hm:"00:00")+":00"); return d.getTime(); }
function semaforo270(t, p){
  var H=hoy(), lastIn=0, lastOut=0, E=[]; p=p||{};
  (t.msgs||[]).forEach(function(m){ if(!m || m.oculto || m.eliminado) return; var ts=+m.ts||0; if(!ts) return;
    if(+m.wa_in===1){ if(ts>lastIn) lastIn=ts; return; }
    var sal=false; try{ sal=esSalidaWA(m); }catch(e){} if(sal && ts>lastOut) lastOut=ts; });
  var contesto=lastIn>0 && lastIn>lastOut;
  var corto=function(n){ return nombreCorto(String(n||"")).split(" ")[0]; };
  pasos263(t).forEach(function(x){ if(x.hecho) return; var d=dueno263(x.de)||infiereDe(x.tx); if(!d || d==="yo") return;
    var f=x.fecha||fechaEnTexto263(x.tx); if(!_fReal(f)) return;
    E.push({fecha:f, tipo:d==="otro"?"otro":"claude", quien:d==="otro"?(corto(x.de)||p.esperaA||"El contacto"):"Claude"}); });
  (Array.isArray(t.encargos)?t.encargos:[]).forEach(function(e){ if(!e || ENC_CERRADO263.test(String(e.estado||""))) return;
    var cond=e.tipo==="condicional", f=String((cond?(e.vence||e.cuando):(e.cuando||e.vence))||"").slice(0,10); if(!_fReal(f)) return;
    E.push({fecha:f, tipo:cond?"otro":"claude", quien:cond?(corto(e.pregunta&&e.pregunta.contacto)||"El contacto"):"Claude"}); });
  if(t.seg_a && t.seg_a.contacto && Array.isArray(t.seg_a.programados)){
    var ahora=Date.now(), sp=t.seg_a.programados.map(function(s){ s=String(s||""); var f=s.slice(0,10); return _fReal(f)?{f:f, ms:msDe(f, s.slice(11,16))}:null; })
      .filter(function(o){ return o && o.ms<=ahora && o.ms>lastIn; }).sort(function(a,b){ return a.ms-b.ms; })[0];
    if(sp) E.push({fecha:sp.f, tipo:"otro", quien:corto(t.seg_a.contacto)||"El contacto", seg:1});
  }
  var peor=null;
  E.forEach(function(x){ var d=dDif(x.fecha, H); if(d<1) return; if(x.tipo==="otro" && !x.seg && contesto) return;
    if(!peor || d>peor.d) peor={d:d, x:x}; });
  if(!peor) return {c:"verde", why:"", sinDato:!E.length};
  var fc=fechaChip(peor.x.fecha), cuando=(fc==="ayer"?"ayer":"el "+fc), dias=peor.d+" día"+(peor.d===1?"":"s");
  var why=peor.x.tipo==="claude" ? "Claude va atrasado · tocaba "+cuando+" ("+dias+")" : peor.x.quien+" no ha contestado · se esperaba "+cuando+" ("+dias+")";
  return {c:peor.d>=3?"rojo":"amarillo", why:why, sinDato:false};
}
var SEM270={verde:"#30d158", amarillo:"#ffd60a", rojo:"#FF453A"};
function vClaudeLleva(L, fijo){
  if(!L.length) return "";
  var ab=fijo || abre285("claude"), n={verde:0, amarillo:0, rojo:0}, rk={rojo:0, amarillo:1, verde:2};
  var S=L.map(function(x, i){ var s={c:"verde", why:"", sinDato:true}; try{ s=semaforo270(x.t, x.p); }catch(e){ console.warn("semaforo270", e); } n[s.c]++; return {t:x.t, p:x.p, s:s, i:i}; })
    .sort(function(a,b){ return (rk[a.s.c]-rk[b.s.c]) || (a.i-b.i); });
  var prob=n.amarillo+n.rojo;
  var sem='<span class="sem270" aria-hidden="true"><span><i style="background:'+SEM270.verde+'"></i>'+n.verde+'</span>'+(n.amarillo?'<span><i style="background:'+SEM270.amarillo+'"></i>'+n.amarillo+'</span>':'')+(n.rojo?'<span><i style="background:'+SEM270.rojo+'"></i>'+n.rojo+'</span>':'')+'</span>';
  var h=fijo?'<div class="cll263"><div class="clh263" role="note" aria-label="Las lleva Claude: '+n.verde+' al corriente, '+prob+' con problema de seguimiento"><b>Semáforo</b>'+sem+'</div>'
    :'<div class="cll263"><button class="clh263" id="bcl263" aria-expanded="'+(ab?"true":"false")+'" aria-label="Las lleva Claude: '+n.verde+' al corriente, '+prob+' con problema de seguimiento"><b>Las lleva Claude</b>'+sem+'<span class="ttch ch285" aria-hidden="true">'+CH285+'</span></button>';
  if(ab){ h+='<div class="revl ttl">'; S.forEach(function(x){ var t=x.t, p=x.p, hito=esperaConHito(t), qt=queTocaTxt(t,p);
      var pel=hito?("espera a "+nombreCorto(String(hito.quien||p.esperaA||"")).split(" ")[0]+" · "+fechaChip(hito.fecha)):(p.esperaA?"espera a "+p.esperaA+(p.fecha?" · "+fechaChip(p.fecha):""):"Claude lo lleva");
      h+='<button class="revr ttr sem-'+x.s.c+'" data-id="'+esc(t.id)+'"><i style="background:'+SEM270[x.s.c]+'"></i><span class="ttx"><span class="rn">'+esc(t.nombre||"Sin nombre")+'</span>'+(qt?'<small>Qué toca: '+esc(qt)+'</small>':'')+'<small class="pel263">'+esc(pel)+'</small>'+
        (x.s.why?'<small class="semw270" style="color:'+SEM270[x.s.c]+'">'+esc(x.s.why)+'</small>':'')+(x.s.sinDato?'<small class="semsd270">sin dato de seguimiento · cuenta como al corriente</small>':'')+'</span></button>'; });
    h+='</div>'; }
  return h+'</div>';
}

/* build 263 · 8: la tarjeta de "siguiente paso" (arriba de la tarea): el paso que sigue y quién lo tiene. Lo hecho no va arriba */
function pasoSiguiente(t){
  var R=(t.resumen && typeof t.resumen==="object")?t.resumen:{}, L=pasos263(t).filter(function(p){ return !p.hecho; });
  if(L.length){ var p=L[0], d=dueno263(p.de), tx=p.tx.replace(/[.\s]+$/,"");
    var quien=d==="yo"?"te toca a ti":(d==="claude"?"lo lleva Claude":(p.de?"espera a "+nombreCorto(p.de).split(" ")[0]:""));
    return tx+(quien?" — "+quien:"")+(p.nota?" ("+p.nota+")":"")+(p.fecha?" · "+fechaChip(p.fecha):""); }
  var qt=String(R.que_toca||"").replace(/\s+/g," ").trim();
  if(qt && !/·\s*hecho\s*$/i.test(qt) && !/\bya se confirm/i.test(qt)) return qt;
  return "";
}

/* ===== build 263 · 5: "Falta info" coherente =====
   La marca del home solo sale si al abrir la tarea hay una pregunta precisa (el bloque del 255); si no falta nada, se quita.
   Se recalcula al guardar y al refrescar el home. */
function hiddenManual(t){
  return !esIA(t) && (t.creada_por===yo || t.duenio===yo) && !porAutorizar(t) && !t._leyendo && !t.hecho238 && !(window.__palomeo||{})[t.id];
}
function faltaPreciso(t){
  var Q=[], c=null; try{ c=completitud(t); }catch(e){ return Q; }
  var pi=String(t.pendiente_info||"").trim();
  if(pi && !esDecisionSal(t)) Q.push(pi.length>160?pi.slice(0,159)+"…":pi);
  try{ var _fp283=(typeof faltaPasoClaude==="function")?faltaPasoClaude(t):""; if(_fp283 && Q.indexOf(_fp283)<0) Q.unshift(_fp283); }catch(e){}
  var M={proximo_paso:"¿Cuál es el siguiente paso de esta tarea y quién lo hace?", quien:"¿Quién la hace?", finiquito:"¿Para cuándo la quieres terminar, o es indefinida?", seguimiento:"¿Cuándo te recuerdo para darle seguimiento?", que:"¿Qué es esto?", de:"¿De quién o de qué proyecto es?", cifras:"¿Cuáles son las cifras?"};
  c.items.forEach(function(x){ if(x.ok || x.k==="agenda") return; var q=M[x.k]; if(q && Q.indexOf(q)<0 && !bloqueaQ(t, q)) Q.push(q); });
  (typeof faltaPlan==="function"?faltaPlan(t):[]).forEach(function(k){ var q=M[k]; if(q && Q.indexOf(q)<0 && !respondida(t, q)) Q.push(q); });
  if(!c.ctxOk && Q.length<4) Q.push("¿De qué se trata? Dame un poco más de contexto.");
  return Q.slice(0,4);
}
function faltaConsistente(t){
  return !(hiddenManual(t) && !(t.falta263 && t.falta263.length) && !t.en_revision && !eventoPendiente(t) && !preguntas249(t).length && !faltaPreciso(t).length);
}
function recalculaFalta(t){
  if(!t || esPropuesta(t)) return false;   /* una propuesta de la IA no es una tarea todavía */
  var k=null; try{ k=tipoRevisar0(t); }catch(e){}
  var vive=(k==="falta" && hiddenManual(t)), Q=vive?faltaPreciso(t):[];
  var nuevo=Q.map(function(q){ return {k:"txt", q:q, d263:1}; });
  if(JSON.stringify(t.falta263||[])===JSON.stringify(nuevo)) return false;
  if(nuevo.length) t.falta263=nuevo; else delete t.falta263;
  return true;
}
function refrescaFalta(){
  var n=0; try{ n+=purga267Todas(); }catch(e){} (tareas||[]).forEach(function(t){ if(!t || t.cierre || esEjemplo(t) || !(t.duenio===yo || t.creada_por===yo)) return; try{ if(recalculaFalta(t)){ n++; guarda(t); } }catch(e){} });
  return n;
}

/* ===== build 263 · 7: el contacto de un WhatsApp dictado solo puede ser alguien de la agenda o de la tarea ===== */
var BASURA_CONTACTO263=/^(un|una|unos|unas|whatsapp|whats|wasap|guasap|mensaje|aviso|nomas|para|confirmar|recordar|que|si|como|esto|eso|lo|la|el|mi|su|desde|hoy|manana|le|les|por|favor|solo|nada)$/;
function contactoPlausible(c){
  var s=_n179(c); if(!s) return false; var w=s.split(" ").filter(Boolean); if(!w.length || w.length>5) return false;
  return !w.some(function(x){ return BASURA_CONTACTO263.test(x); });
}
function validaContacto(t, c){
  var cands=[]; try{ cands=candidatosPersona(t).filter(function(x){ return x.id!==yo; }); }catch(e){}
  if(contactoPlausible(c)){ var r=null; try{ r=resuelveDestino(t, c); }catch(e){}
    if(r && r.estado==="uno") return {ok:true, nombre:r.persona.nombre}; if(r && r.cands && r.cands.length) cands=r.cands; }
  cands=cands.slice().sort(function(a,b){ return (b.prio-a.prio) || String(a.nombre).localeCompare(String(b.nombre)); });   /* primero los de la tarea */
  return {ok:false, cands:cands.slice(0,5)};
}
/* true = bloqueado: no se programa nada y sale la tarjeta de dudas (con autocompletar) */
function revisaPG(t, pg){
  var v=validaContacto(t, pg.contacto); if(v.ok){ pg.contacto=v.nombre; return false; }
  var tx=String(pg.texto||"").trim(); if(!tx || tx==="__ESTO__") tx="el mensaje";
  t.hecho238=t.hecho238||{ts:Date.now(), hecho:[], falta:[]}; t.hecho238.falta=t.hecho238.falta||[];
  t.hecho238.falta.push({k:"msg", q:"¿A quién le mando «"+corto238(tx)+"»? No encontré a “"+corta40(pg.contacto||"nadie")+"” en tus contactos: escribe el nombre.", texto:tx, ops:v.cands.map(function(c){ return {id:c.id, label:c.nombre}; })});
  guarda(t); render(); try{ setTimeout(function(){ abrePreguntas(t.id); }, 50); }catch(e){}
  return true;
}
/* ventana hábil: 8:00–20:00 de lunes a sábado. Dentro = ahora (null); fuera = el siguiente día hábil a las 9:00 */
function ventanaHabil(ahora){
  var d=new Date(ahora||Date.now()), h=d.getHours(), dw=d.getDay();
  if(dw!==0 && h>=8 && h<20) return null;
  var f=iso(d); if(dw!==0 && h<8) return {fecha:f, hora:"09:00"};
  var g=dmDe(f,1); while(new Date(g+"T12:00:00").getDay()===0) g=dmDe(g,1);
  return {fecha:g, hora:"09:00"};
}
/* limpieza de contactos de WhatsApp que quedaron con basura ("un WhatsApp nomás para confirmar") y de sus pedidos programados */
var LIMPIA_PEDIDOS263=["wa_64c21258c3364ac228fea94f","wa_74673629d6dba4c3029f9a96"];
function limpiaWABasura(){
  var n=0;
  (tareas||[]).forEach(function(t){ if(!t || t.cierre) return; var cambio=false;
    if(Array.isArray(t.wa_contactos)){ var a=t.wa_contactos.filter(function(c){ var nm=String((c&&c.nombre)||c||""); return contactoPlausible(nm) || !/\b(whatsapp|whats|wasap|mensaje|nomas|confirmar)\b/i.test(_n179(nm)); }); if(a.length!==t.wa_contactos.length){ t.wa_contactos=a; cambio=true; } }
    (t.msgs||[]).forEach(function(m){ if(m && m.prog && !m.prog.cancelado && m.prog.contacto && !contactoPlausible(m.prog.contacto) && /\b(whatsapp|whats|wasap|mensaje|nomas|confirmar)\b/i.test(_n179(m.prog.contacto))){ try{ cancelaProgramado(t, m); }catch(e){} cambio=true; } });
    if(cambio){ n++; try{ guarda(t); }catch(e){} } });
  try{ var yaL=localStorage.getItem("bit_limpia263"); if(!yaL){ LIMPIA_PEDIDOS263.forEach(function(id){ llamaPush("wa_marca",{id:id, estado:"cerrado"}); }); localStorage.setItem("bit_limpia263","1"); } }catch(e){}
  return n;
}

/* ===== build 263 · 1: avisos UNA vez =====
   Causas encontradas: (a) cada guardado de cualquier tarea volvía a mandar aviso_set de todos sus avisos y el espejo de Firestore se reescribía con
   avisado_en:null, así que el servidor los volvía a armar y los re-disparaba en cada barrido (~15 min); (b) los "revisar avance" de tareas que lleva
   Claude se mandaban a Salvador. Ahora: el aviso_set solo sale si algo cambió (firma) o una vez al día; el espejo no pisa avisado_en; los de Claude no se mandan;
   y solo pasa lo que permite el tablero de Notificaciones (tipo "recordatorio"). */
function avisoEsDeClaude(t, a){
  var tx=String((a&&a.texto)||t.nombre||""), s=_n179(tx);
  if(/\b(revisar (el )?avances?|revisar avances|ritmo no (afloje|baje)|ver que el ritmo|revision:|dar seguimiento)\b/.test(s) || /^revision\b/.test(s)) return true;
  if(a && a.por && a.por!==yo && !PERSONAS[a.por]) return true;   /* lo puso Claude, no una persona */
  if(/^(revisar|checar|verificar|ver si|seguimiento)\b/.test(s)){
    if(!t.es_recordatorio && llevaClaude(t)) return true;
    var W=toks262(tx).filter(function(k){ return k.w.length>=5; });
    return (tareas||[]).some(function(d){ if(!d || d.cierre || d.es_recordatorio || d.id===t.id || !llevaClaude(d)) return false; var f=cacheCampos(d);
      return W.some(function(k){ return f.nom.some(function(z){ return z.c===k.c; }) || f.con.indexOf(k.w)>=0; }); });
  }
  return false;
}
function sigAviso(cuerpo){ return [cuerpo.texto, cuerpo.cuando, cuerpo.cada||"", cuerpo.f_fin||"", cuerpo.usuario].join("|"); }
function memAv(){ if(window.__memAv263) return window.__memAv263; var o={}; try{ o=JSON.parse(localStorage.getItem("bit_avsig263")||"{}")||{}; }catch(e){ o={}; } window.__memAv263=o; return o; }
function guardaMemAv(){ try{ localStorage.setItem("bit_avsig263", JSON.stringify(window.__memAv263||{})); }catch(e){} }
function resyncAvisosNotif(){
  window.__memAv263={}; guardaMemAv();
  (tareas||[]).forEach(function(t){ if(!t || t.cierre || (t.duenio||"")!==yo) return; avisosDe(t).forEach(function(a){ avisoAlServidor(t, a, claveAviso(t,a)); }); });
}

/* ===================== build 270 (Salvador 7-oct): EL HOME REACOMODADO =====================
   De arriba hacia abajo: 1 "Nuevas tareas para acomodar" (Acomodo, plegable como antes) · 2 "Te pregunta Doit" · 3 "Vencidas mías" · 4 "Hoy mías"
   · 5 plegadas: "Las lleva Claude" (con semáforo), "Mías futuras" y el resto (Te encargaron, Las revisas tú, Compartidas).
   2, 3 y 4: sin acordeón, siempre desplegadas, separadas solo por una rayita con su etiqueta chica. Solo lo que le toca 100% a quien ve el home:
   lo que tiene otro dueño (lo revisa o ya le escaló) baja a "Las revisas tú". Cada tarea sale UNA vez, en la primera sección que le toca.
   - Te pregunta Doit (naranja vivo): alguien te espera / tu decisión, te preguntan, preguntas de Claude (preguntas249), falta info,
     entrevista de medida, por autorizar y posible vinculación.
   - Vencidas mías (rojo): vencidas y las que no tienen fecha definida (sin f_vigente, no indefinidas, sin aviso).
   - Hoy mías (gris): lo de hoy, primero lo que despertó (expediente con algo nuevo). */
function suya270(t){ return !!t && (t.duenio===yo || (t.es_recordatorio && !t.duenio)); }
function nuevo270(t){ return !!(t && t.nuevo264 && Date.now()-t.nuevo264<3*864e5); }
function armaHome(rev, det, venc, hoyL, futL){
  var out={preg:[], venc:[], hoy:[], otros:[], fut:[]}, ya={};
  function pon(L, t, why){ if(!t || ya[t.id]) return; ya[t.id]=1; L.push({t:t, why:why||""}); }
  function vivo(t){ try{ return !!t && !t.cierre && !esDormida(t) && !esPropuesta(t) && !t.fusionada_en && estadoReal(t)!=="cerrada"; }catch(e){ return false; } }
  /* 2 · TE PREGUNTA DOIT — build 284: primero las decisiones que esperan a Salvador (t.decision o «esperando tu decisión») */
  tareas.forEach(function(t){ if(!t || t.es_recordatorio || !vivo(t)) return; var e=null; try{ e=estadoDec(t); }catch(er){} if(e==="vivo") pon(out.preg, t, "esperan tu decisión"); });
  var contestada=function(t){ var e=null; try{ e=estadoDec(t); }catch(er){} return !!e && e!=="vivo"; };   /* ya contestó la decisión: no se le vuelve a pedir */
  rev.filter(function(x){ return x.k==="espera" && !contestada(x.t); }).forEach(function(x){ pon(out.preg, x.t, etiquetaRev(x.t,x.k)); });
  det.forEach(function(t){ if(!contestada(t)) pon(out.preg, t, esDecisionSal(t)?"esperan tu decisión":"alguien te espera"); });
  var _q=[]; try{ _q=compartidasDe(); }catch(e){}
  _q.concat(tareas.filter(function(t){ return t && t.duenio===yo && vivo(t) && !t.es_recordatorio; }))
    .forEach(function(t){ var p=null; try{ p=preguntaParaMi(t); }catch(e){} if(p) pon(out.preg, t, p.de+(p.todos?" pide opinión a todos":" te pregunta")); });
  tareas.forEach(function(t){ if(!vivo(t) || t.es_recordatorio || !(t.duenio===yo || (!t.duenio && t.creada_por===yo))) return;
    var Q=[]; try{ Q=preguntas249(t); }catch(e){} if(Q.length) pon(out.preg, t, faltaPlanTxt(t)||String(Q[0].q||"Claude te pregunta")); });
  /* una decisión ya contestada no regresa como «falta info» si no hay una pregunta concreta nueva */
  var sinPreguntaNueva=function(t){ var q=[]; try{ q=preguntas249(t); }catch(e){} return !q.length && !faltaPasoClaude(t) && !faltaPlan(t).length; };
  rev.filter(function(x){ return x.k==="falta" && !(contestada(x.t) && sinPreguntaNueva(x.t)); }).forEach(function(x){ var ff=faltaPlanTxt(x.t), fp=null; if(!ff) try{ fp=faltaPrimero(completitud(x.t)); }catch(e){} pon(out.preg, x.t, ff||(fp&&fp.txt)||"falta info"); });
  venc.concat(hoyL, futL||[]).forEach(function(t){ if(suya270(t)){ var ff=faltaPlanTxt(t); if(ff) pon(out.preg, t, ff); } });
  /* vigía del plan: tocaba seguimiento y nadie anotó que se dio */
  tareas.forEach(function(t){ if(!t || t.es_recordatorio || !suya270(t) || !vivo(t)) return; var f=seguimientoPerdido(t); if(f) pon(out.preg, t, "No se dio el seguimiento del "+fechaMovCorta(f).replace(/ \S+$/,"")); });
  tareas.forEach(function(t){ try{ if(entrevistaPendiente(t)) pon(out.preg, t, "falta información · ¿cómo medimos a "+((PERSONAS[t.duenio]||{}).nombre||"")+"?"); }catch(e){} });
  rev.filter(function(x){ return x.k==="autorizar" || x.k==="vincular"; }).forEach(function(x){ pon(out.preg, x.t, x.k==="vincular"?"posible vinculación":"por autorizar"); });
  /* build 284: las decisiones ya contestadas (Aplicando… / Pendiente de aplicar / Listo · …) se quedan a la vista 24 h; no cuentan como pendientes */
  out.dec284=[]; try{ tareas.forEach(function(t){ if(!t || t.es_recordatorio || ya[t.id]) return; var e=estadoDec(t); if(e && e!=="vivo") out.dec284.push({t:t, why:""}); }); }catch(e){}
  /* 3 · VENCIDAS MÍAS (vencidas y sin fecha definida) */
  var pre=function(t, s){ return (nuevo270(t)?"Nuevo · ":"")+s; };
  venc.forEach(function(t){ if(suya270(t)) pon(out.venc, t, pre(t, vencioTxt(t))); else pon(out.otros, t, vencioTxt(t)); });
  /* 4 · HOY MÍAS: primero lo que despertó */
  tareas.filter(function(t){ return nuevo270(t) && vivo(t) && !t.es_recordatorio && leToca(t) && hoyL.indexOf(t)>=0; })
    .sort(function(a,b){ return b.nuevo264-a.nuevo264; }).forEach(function(t){ if(suya270(t)) pon(out.hoy, t, "Nuevo · llegó algo"); });
  hoyL.forEach(function(t){ var c=null; try{ c=campanaDe(t); }catch(e){} var w=c?c.txt:"hoy"; if(suya270(t)) pon(out.hoy, t, w); else pon(out.otros, t, w); });
  /* 5 · las futuras: las suyas a "Mías futuras"; las de otro dueño a "Las revisas tú" */
  (futL||[]).forEach(function(t){ if(ya[t.id]) return; if(suya270(t)){ ya[t.id]=1; out.fut.push(t); } else pon(out.otros, t, fechaChip(t.f_vigente)||"próxima"); });
  return out;
}
var COL270={preg:"#FF7A00", venc:"#FF3B30", hoy:"#8e8e93"};
/* ===================== HOME DE TRES FICHAS (maqueta D12b) =====================
   Arriba tres fichas iguales que dicen cuánto hay en cada grupo y lo abren en su propia vista («‹ Inicio» regresa):
   · Te esperan — lo que hoy era «Decide tú» + «Te pregunta Doit» (la misma lista H.preg); el número es H.preg.length.
   · Bandeja — «Tareas nuevas» (propuestas256) + «Mensajes» (los por_acomodar del servidor, vBandejaSrv, y las pláticas con
     duda que ya viven en tareas, platicasAcomodo), en dos pestañas.
   · Hoy — «Hoy mías» (H.hoy).
   Abajo una lista agrupada (Vencidas, Te encargaron, Próximas, Las revisas tú, Compartidas, Las lleva Claude, Historial):
   un renglón sin nada no sale, salvo Historial. Una ficha en cero se queda, apagada.
   Vencidas y Te encargaron son FILTROS: su número solo dice cuántas vencieron o te encargaron, y esas mismas cosas
   también cuentan en la ficha que les toca por su tipo (filtrosInicio): lo que pide tu decisión o tu respuesta va a
   Te esperan; lo que hay que hacer (actividad, cita, llamada) va a Hoy aunque ya haya vencido, porque todo lo atrasado
   se junta en hoy. Una cosa puede salir en una ficha y en un filtro; dentro de una ficha cuenta una sola vez.
   Solo cambia DÓNDE se pintan las cosas: la selección (armaHome, reparte263…), las filas y sus botones son los de siempre,
   y el orden del swipe y de la Caminata sale de las mismas listas. Al abrir una tarea desde un grupo y regresar, se vuelve al grupo. */
var GRUPOS_INICIO={
  esperan:{t:"Te esperan", c:"#FF9F0A", b:"rgba(255,159,10,0.45)"},
  bandeja:{t:"Bandeja", c:"#0A84FF", b:"rgba(10,132,255,0.45)"},
  hoy:{t:"Hoy", c:"#30D158", b:"rgba(48,209,88,0.45)"},
  venc:{t:"Vencidas"}, prox:{t:"Próximas"}, enc:{t:"Te encargaron"}, rev:{t:"Las revisas tú"},
  comp:{t:"Compartidas"}, claude:{t:"Las lleva Claude"}, hist:{t:"Historial"}
};
function grupoInicio(){ var g=window.__grupoInicio; return (g && GRUPOS_INICIO[g])?g:null; }
function abreGrupoInicio(g, seg){
  if(!GRUPOS_INICIO[g]) return;
  if(!grupoInicio()){ var sc=document.querySelector("#app .scroll"); window.__scrollInicio=sc?sc.scrollTop:0; }
  window.__grupoInicio=g; if(g==="bandeja") window.__segBandeja=seg||null;
  vista="lista"; render();
  var s2=document.querySelector("#app .scroll"); if(s2) s2.scrollTop=0;
}
function cierraGrupoInicio(){
  window.__grupoInicio=null; vista="lista"; render();
  var sc=document.querySelector("#app .scroll"); if(sc) sc.scrollTop=+window.__scrollInicio||0;
}
function cuentaBandeja(){
  var a=0, b=0; try{ a=propuestas256().length; }catch(e){} try{ b=platicasAcomodo().length; }catch(e){} try{ b+=bandejaSrvVisible().length; }catch(e){}
  return {nuevas:a, mensajes:b, total:a+b};
}
/* sin pestaña elegida: Tareas nuevas si hay, si no Mensajes */
function segBandeja(){ var s=window.__segBandeja; if(s==="nuevas" || s==="mensajes") return s; return cuentaBandeja().nuevas?"nuevas":(cuentaBandeja().mensajes?"mensajes":"nuevas"); }
/* venció: la misma regla que manda una tarea a Vencidas (estadoReal) */
function vencidaInicio(t){ try{ return !!t && estadoReal(t)==="vencida"; }catch(e){ return false; } }
function encargoVencido(e){ return !!(e && e.limite && dDif(e.limite, hoy())>0); }
/* un encargo pide tu respuesta si pregunta algo o pide decidir/confirmar; si no, es algo que hacer */
var PIDE_RESPUESTA_ENC=/^(¿|decid|decide|define|autoriz|aprueb|elig|escog|confirm|dime|d[ií]game|av[ií]sa|contest|respond|opin|qué\s|cu[aá]l|cu[aá]ndo|cómo\s|d[oó]nde|qui[eé]n|cu[aá]nt|s[ií] o no)/;
function encargoPideRespuesta(e){ var s=String(e && e.texto||"").trim().toLowerCase(); return s.indexOf("?")>=0 || PIDE_RESPUESTA_ENC.test(s); }
/* reparte lo de las fichas y los filtros. Las listas de siempre (armaHome) no cambian: Te esperan es H.preg (una
   decisión vencida ya está ahí); Hoy suma las vencidas que no son decisión ni pregunta (H.venc), primero, y luego H.hoy.
   Los encargos van a Te esperan o a Hoy por su tipo; si su tarea ya está en esa ficha no se cuentan otra vez. */
function filtrosInicio(H, mis){
  var F={esperan:[], hoy:[], venc:[], encEsperan:[], encHoy:[], encVenc:[], enc:(mis||[]).slice()}, enPreg={}, enHoy={}, enVenc={}, vencHoy=[], restoHoy=[];
  (H.preg||[]).forEach(function(x){ if(enPreg[x.t.id]) return; enPreg[x.t.id]=1; F.esperan.push(x); });
  (H.venc||[]).concat(H.hoy||[]).forEach(function(x){ if(enHoy[x.t.id] || enPreg[x.t.id]) return; enHoy[x.t.id]=1; (vencidaInicio(x.t)?vencHoy:restoHoy).push(x); });
  F.hoy=vencHoy.concat(restoHoy);
  var pv=function(x, why){ if(enVenc[x.t.id]) return; enVenc[x.t.id]=1; F.venc.push(why==null?x:{t:x.t, why:why}); };
  (H.venc||[]).forEach(function(x){ pv(x); });
  (H.preg||[]).concat(H.hoy||[]).forEach(function(x){ if(vencidaInicio(x.t) && !faltaPlan(x.t).length) pv(x, vencioTxt(x.t)); });
  F.enc.forEach(function(e){ var tid=e.tareaId||"";
    if(encargoVencido(e)) F.encVenc.push(e);
    if(encargoPideRespuesta(e) || (tid && enPreg[tid])){ if(!(tid && enPreg[tid])) F.encEsperan.push(e); }
    else if(!(tid && enHoy[tid])) F.encHoy.push(e); });
  return F;
}
function cuentasInicio(H, F){ F=F||filtrosInicio(H, []); return {esperan:F.esperan.length+F.encEsperan.length, bandeja:cuentaBandeja().total, hoy:F.hoy.length+F.encHoy.length}; }
function vFichasInicio(H, F){
  var n=cuentasInicio(H, F);
  return '<div class="fichas-inicio">'+["esperan","bandeja","hoy"].map(function(k){ var G=GRUPOS_INICIO[k];
    return '<button class="ficha-inicio'+(n[k]?'':' cero')+'" data-grupo="'+k+'" style="--fc:'+G.c+';--fb:'+G.b+'" aria-label="'+G.t+': '+n[k]+'">'+
      '<span class="fi-n" aria-hidden="true">'+n[k]+'</span><span class="fi-l" aria-hidden="true">'+G.t+'</span></button>'; }).join("")+'</div>';
}
function nCompartidas(){ try{ return compartidasDe().length; }catch(e){ return 0; } }
function vListaInicio(C){
  var H=C.H, F=C.F||filtrosInicio(H, []), R=[], nv=F.venc.length+F.encVenc.length;
  if(nv) R.push(["venc", nv, "globo rojo"]);
  if(C.nMis) R.push(["enc", C.nMis, "globo morado"]);
  if(H.fut.length) R.push(["prox", H.fut.length]);
  if(H.otros.length) R.push(["rev", H.otros.length]);
  var nc=nCompartidas(); if(nc) R.push(["comp", nc]);
  if(C.claude.length) R.push(["claude", C.claude.length, "", 1]);
  R.push(["hist", null]);
  return '<nav class="lista-inicio" aria-label="Más">'+R.map(function(r){ var t=GRUPOS_INICIO[r[0]].t;
    return '<button class="fila-inicio" data-grupo="'+r[0]+'" aria-label="'+t+(r[1]!=null?': '+r[1]:'')+'"><span class="fl-t">'+t+'</span>'+
      (r[3]?'<span class="fl-p" aria-hidden="true"></span>':'')+(r[1]!=null?'<span class="fl-n'+(r[2]?' '+r[2]:'')+'" aria-hidden="true">'+r[1]+'</span>':'')+'</button>'; }).join("")+'</nav>';
}
/* los renglones de Vencidas y Hoy, iguales a los de las secciones de antes (con el renglón que se cierra tras «Ya está»);
   en Hoy lo vencido lleva su etiqueta roja para que no se confunda con lo de hoy */
function filasInicio(k, L){
  return '<div class="revl ttl l270 l-'+k+'">'+filas272(k, L, function(x){ var v=k!=="venc" && vencidaInicio(x.t);
    return '<button class="revr ttr'+(v?' es-vencida':'')+'" data-id="'+esc(x.t.id)+'"><i style="background:'+COL270[v?"venc":k]+'"></i><span class="ttx"><span class="rn">'+esc(x.t.nombre||"Sin nombre")+'</span>'+(v?'<span class="et-venc">Vencida</span>':'')+(x.why?'<small>'+esc(x.why)+'</small>':'')+'</span></button>'; })+'</div>';
}
/* el renglón de un encargo que te hicieron (el mismo en Te encargaron, en las fichas y en Vencidas) */
function filaEncargoInicio(e){
  var venc=encargoVencido(e), de=(PERSONAS[e.de]||{}).nombre||"Alguien";
  return '<li><button class="row'+(venc?' es-vencida':'')+'" data-enc="'+esc(e.id)+'">'+
    '<span class="dot '+(venc?"d-venc":"d-esper")+'"></span><span>'+
    '<span class="nm">'+esc(de)+' te encargó'+(venc?'<span class="et-venc">Vencida</span>':'')+'</span>'+
    '<span class="ls">'+esc(e.texto)+'</span></span>'+
    '<span class="meta">'+(venc?'<span class="bdg g-venc">!</span>':'<span class="bdg g-esper">1</span>')+
    '</span></button></li>';
}
function encargosInicio(L, tit){ if(!L || !L.length) return ""; return '<section class="sc284 sc-enc" aria-label="'+tit+'"><h2 class="hd284"><span>'+tit+'</span><em>'+L.length+'</em></h2><ul class="list l-enc">'+L.map(filaEncargoInicio).join("")+'</ul></section>'; }
function vGrupoInicio(g, C){
  var H=C.H, F=C.F||filtrosInicio(H, []), G=GRUPOS_INICIO[g], cuerpo="", vacio="Nada pendiente aquí.";
  if(g==="esperan") cuerpo=vDecide(H, filas272, true)+encargosInicio(F.encEsperan, "Te encargaron");
  else if(g==="hoy"){ cuerpo=(F.hoy.length?filasInicio("hoy", F.hoy):"")+encargosInicio(F.encHoy, "Te encargaron"); }
  else if(g==="venc"){ cuerpo=(F.venc.length?filasInicio("venc", F.venc):"")+encargosInicio(F.encVenc, "Te encargaron"); }
  else if(g==="bandeja"){
    var nb=cuentaBandeja(), sg=segBandeja();
    cuerpo='<div class="seg-bandeja" role="tablist" aria-label="Bandeja">'+[["nuevas","Tareas nuevas",nb.nuevas],["mensajes","Mensajes",nb.mensajes]].map(function(x){
      return '<button role="tab" data-seg="'+x[0]+'" aria-selected="'+(sg===x[0]?"true":"false")+'">'+x[1]+'<em>'+x[2]+'</em></button>'; }).join("")+'</div>';
    var dentro=sg==="nuevas"?vAcomodo(true):(vBandejaSrv()+vMsgs(true));
    cuerpo+=dentro||'<div class="vacio-grupo">'+(sg==="nuevas"?"No hay tareas nuevas por revisar.":"No hay mensajes por acomodar.")+'</div>';
    vacio="";
  }
  else if(g==="prox"){ if(H.fut.length) cuerpo='<ul class="list">'+H.fut.map(function(t){ return fila(t); }).join("")+'</ul>'; }
  else if(g==="enc") cuerpo=C.hMis||"";
  else if(g==="rev"){ if(H.otros.length) cuerpo='<div class="revl ttl">'+H.otros.map(function(x){ return '<button class="revr ttr" data-id="'+esc(x.t.id)+'"><i style="background:#636366"></i><span class="ttx"><span class="rn">'+esc(x.t.nombre||"Sin nombre")+'</span><small>'+esc(((PERSONAS[x.t.duenio]||{}).nombre?("de "+PERSONAS[x.t.duenio].nombre+" · "):"")+x.why)+'</small></span></button>'; }).join("")+'</div>'; }
  else if(g==="comp"){ if(nCompartidas()) try{ window.__verComp=true; cuerpo=vCompartidas().replace(/^<button class="compbtn"[^>]*>[^<]*<\/button>/,''); }catch(e){ console.warn("compartidas",e); } }
  else if(g==="claude") cuerpo=vClaudeLleva(C.claude, true);
  else if(g==="hist"){ try{ cuerpo=vHist(true); }catch(e){ console.warn("hist285", e); } }
  return '<div class="grupo-inicio" data-grupo-vista="'+g+'"><h1 class="tit-grupo">'+G.t+'</h1>'+(cuerpo||(vacio?'<div class="vacio-grupo">'+vacio+'</div>':''))+'</div>';
}
/* la lectura en voz («Escuchar») sigue el orden de lo que te toca: Te esperan, Vencidas, Hoy */
function ordenLecturaInicio(H){
  var vis={}, ord=[]; [H.preg, H.venc, H.hoy].forEach(function(L){ L.forEach(function(x){ if(!vis[x.t.id]){ vis[x.t.id]=1; ord.push(x.t.id); } }); });
  window.__ttOrden=ord;
}
function bindInicio(){
  var anima=function(c){ var sc=document.querySelector("#app .scroll"); if(sc){ sc.classList.add(c); setTimeout(function(){ sc.classList.remove(c); }, 320); } };
  Array.prototype.forEach.call(document.querySelectorAll("[data-grupo]"), function(b){ b.onclick=function(ev){ if(ev) ev.preventDefault(); abreGrupoInicio(b.getAttribute("data-grupo")); anima("entra-grupo"); }; });
  var bi=$("binicio"); if(bi) bi.onclick=function(){ cierraGrupoInicio(); anima("sale-grupo"); };
  Array.prototype.forEach.call(document.querySelectorAll(".seg-bandeja [data-seg]"), function(b){ b.onclick=function(){ window.__segBandeja=b.getAttribute("data-seg"); render(); }; });
  try{ bindBandejaSrv(); }catch(e){ console.warn("bandeja servidor", e); }
}
/* ===================== build 284 (Salvador 7-oct, mockup «C · Filas con respuesta rápida»): «DECIDE TÚ» LIMPIO =====================
   Lo que pide decisión de Salvador sale arriba en «Decide tú» (20px, contador gris), en UN bloque gris #1C1C1E con filas separadas por
   una línea de 1px: círculo con iniciales (quien espera o el tema), nombre, cuánto lleva esperando, la pregunta y los botones píldora
   con las opciones de la decisión (si no hay: «Sí» / «Todavía no») más el micrófono para contestar dictando. Sin fondo rojo/naranja.
   - Picar la fila abre la tarea. Un botón contesta por el MISMO camino del 283: contestaDecision (encargo decision_resp +
     clasificaDecision; aplicado38 cuando se aplicó).
   - Estado: «Aplicando…» (gris) mientras corre el clasificador · «Listo · <lo que hizo>» (verde, palomita) solo con aplicado38 ·
     «Pendiente de aplicar» si no se pudo (la Mac lo termina). Las resueltas se quitan del home a las 24 h.
   - Lo demás de «Te pregunta Doit» (falta info, preguntas de datos, mensajes) sigue igual pero en el mismo estilo limpio: filas sin
     botones, con chevron. */
var DEC284_VIVE=24*3600000;
function estadoDec(t){
  if(!t || !(PERSONAS[yo] && PERSONAS[yo].jefe)) return null;
  var D=(t.decision && typeof t.decision==="object" && !Array.isArray(t.decision))?t.decision:null;
  if(D && D.respuesta && String(D.respuesta.t||"").trim()){
    if(D.aplicado38) return (Date.now()-(+D.aplicado38.ts||0)<DEC284_VIVE)?"listo":null;
    if(D.resuelta===true || t.cierre || t.fusionada_en) return null;
    var m=(window.__dec284||{})[t.id];
    return (m && m.st==="aplicando" && +m.resp_ts===+D.respuesta.ts)?"aplicando":"pendiente";
  }
  if(t.cierre || t.fusionada_en) return null;
  try{ if(decision273(t)) return "vivo"; }catch(e){}
  try{ if(esDecisionSal(t)) return "vivo"; }catch(e){}
  return null;
}
function preguntaDec(t){
  var D=(t.decision && typeof t.decision==="object")?t.decision:{};
  return String(D.pregunta||(typeof esDecisionSal==="function" && esDecisionSal(t)?t.pendiente_info:"")||D.recomendacion||"").replace(/\s+/g," ").trim();
}
/* las opciones como botones: la recomendada primero; sin opciones, «Sí» / «Todavía no» */
function opcionesDec(t){
  var D=(t.decision && typeof t.decision==="object")?t.decision:{};
  var ops=(Array.isArray(D.opciones)?D.opciones:[]).filter(function(o){ return o && typeof o==="object" && String(o.nombre||"").trim(); });
  if(!ops.length) return [{n:"Sí", p:true}, {n:"Todavía no", p:false}];
  var recN=_n179(String(D.recomendacion||"")), hayMarca=ops.some(function(o){ return o.recomendada===true; });
  var esRec=function(o){ if(hayMarca) return o.recomendada===true; var n=_n179(o.nombre); return !!(n && n.length>=3 && recN.indexOf(n)>=0); };
  var r=ops.filter(esRec).slice(0,1), resto=ops.filter(function(o){ return r.indexOf(o)<0; });
  return r.concat(resto).slice(0,3).map(function(o, i){ return {n:String(o.nombre).replace(/\s+/g," ").trim(), p:i===0}; });
}
/* iniciales de quien espera (contacto de la tarea, quien la creó) o del tema (sigla en mayúsculas o primeras letras) */
function iniDec(t){
  var D=(t.decision && typeof t.decision==="object")?t.decision:{}, q=String(D.de||D.quien||"").trim();
  if(!q && Array.isArray(t.wa_contactos) && t.wa_contactos[0] && t.wa_contactos[0].nombre) q=String(t.wa_contactos[0].nombre);
  if(!q && t.creada_por && t.creada_por!==yo && PERSONAS[t.creada_por]) return PERSONAS[t.creada_por].ini||iniciales(PERSONAS[t.creada_por].nombre||"", PERSONAS[t.creada_por].apellido||"");
  var src=q||String(t.nombre||"");
  if(!q){ var sig=src.match(/\b[A-ZÁÉÍÓÚÑ]{2,4}\b/); if(sig) return sig[0]; }
  var W=src.replace(/[^\wáéíóúñÁÉÍÓÚÑ\s]/g," ").split(/\s+/).filter(function(w){ return w && !/^(de|del|la|las|el|los|y|a|en|con|para|por)$/i.test(w); });
  return (W.slice(0,2).map(function(w){ return w.charAt(0); }).join("")||"·").toUpperCase();
}
/* desde cuándo espera: la marca de la decisión, si no el último mensaje */
function haceDec(t){
  var D=(t.decision && typeof t.decision==="object")?t.decision:{}, ts=0;
  [D.ts, D.creado, D.desde, D.fecha, t.decision_desde, t.pendiente_ts].some(function(v){ if(v==null || v==="") return false; var n=+v; if(!n) n=Date.parse(String(v)); if(n>0){ ts=n; return true; } return false; });
  if(!ts) (t.msgs||[]).forEach(function(m){ if(m && !m.oculto && !m.eliminado && (+m.ts||0)>ts) ts=+m.ts||0; });
  if(!ts) return "";
  var min=Math.max(0, Math.round((Date.now()-ts)/60000));
  if(min<60) return min<1?"ahora":min+" min";
  var hr=Math.floor(min/60); if(hr<24) return hr+" h";
  var a=new Date(ts), b=new Date(); a.setHours(0,0,0,0); b.setHours(0,0,0,0); var d=Math.round((b-a)/864e5);
  return d<=1?"ayer":d+" d";
}
/* lo que hizo, de la nota «Entendí… · Hice…» / «Hecho: …» (una línea); nunca un «Listo» genérico */
function hizoDec(t){
  var D=t.decision||{}, rts=+((D.respuesta||{}).ts)||0, nota="";
  (t.msgs||[]).forEach(function(m){ if(m && m.k==="bi" && +m.ts>=rts && (m.orden38 || m.dec283 || /^\s*(IA:\s*)?(Entend[ií]|Hecho:|Hice:)/i.test(String(m.t||"")))) nota=String(m.t||""); });
  var s=nota.replace(/^\s*IA:\s*/i,""), mm=s.match(/Hice:\s*([\s\S]+)/i)||s.match(/Hecho:\s*([\s\S]+)/i);
  s=(mm?mm[1]:s.replace(/^Entend[ií]:?\s*/i,"")).replace(/\s+/g," ").trim().replace(/[.\s]+$/,"");
  if(!s) s="contestaste «"+String((D.respuesta||{}).t||"").trim()+"»";
  return s.length>90?s.slice(0,89)+"…":s;
}
var SVG284={
  mic:'<svg width="12" height="16" viewBox="0 0 14 18" fill="none" stroke="#D1D1D6" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="4" y="1" width="6" height="10" rx="3"/><path d="M1 8a6 6 0 0 0 12 0M7 14v3"/></svg>',
  ok:'<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#30D158" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3.5"/></svg>',
  chev:'<svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="#5A5A5F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5l5 5-5 5"/></svg>'
};
/* una vez contestada y aplicada, la fila ya no debe seguir mostrando la pregunta/recomendación vieja (confunde:
   parece que sigue pidiendo lo mismo). En su lugar se enseña el próximo paso YA actualizado de la tarea
   (resumen.que_toca), que es lo que de verdad sigue pendiente ahora. Salvador, 8-oct. */
function proximoPasoDec(t){
  var qt=String(((t.resumen||{}).que_toca)||"").replace(/\s+/g," ").trim();
  return qt.length>120?qt.slice(0,119)+"…":qt;
}
function filaDec(t, i){
  var e=estadoDec(t), id=esc(t.id), hace=haceDec(t);
  var q=(e==="listo")?proximoPasoDec(t):preguntaDec(t);
  var h='<div class="f284'+(i?'':' f284a')+'" data-dec284="'+id+'" data-e284="'+e+'">'+
    '<button class="f284h" data-id="'+id+'"><span class="f284i" aria-hidden="true">'+esc(iniDec(t))+'</span><span class="f284x">'+
      '<span class="f284t"><span class="f284n">'+esc(t.nombre||"Sin nombre")+'</span>'+(vencidaInicio(t)?'<span class="et-venc">Vencida</span>':'')+(hace?'<span class="f284w">'+esc(hace)+'</span>':'')+'</span>'+
      (q?'<span class="f284q">'+esc(q)+'</span>':'')+'</span></button>';
  if(e==="vivo"){
    h+='<div class="f284b">'+opcionesDec(t).map(function(o){ return '<button class="p284'+(o.p?' p284p':'')+'" data-r284="'+id+'" data-v284="'+esc(o.n)+'">'+esc(o.n)+'</button>'; }).join("")+
      '<button class="p284m" data-m284="'+id+'" aria-label="Contestar dictando">'+SVG284.mic+'</button></div>';
  } else if(e==="aplicando"){
    h+='<div class="s284 s284g" role="status">Aplicando…</div>';
  } else if(e==="listo"){
    h+='<div class="s284 s284ok" role="status">'+SVG284.ok+'<span>Listo · '+esc(hizoDec(t))+'</span></div>';
  } else {
    h+='<div class="s284 s284g" role="status">Pendiente de aplicar</div>';
  }
  return h+'</div>';
}
/* «Decide tú» (solo decisiones) y debajo lo demás que te pregunta Doit, ambos con el mismo estilo limpio */
/* contestada hoy: la respuesta (o lo que se aplicó) es de hoy */
function contestadaHoy(t){ var D=(t && t.decision && typeof t.decision==="object")?t.decision:{}, ts=+((D.respuesta||{}).ts)||+((D.aplicado38||{}).ts)||0;
  if(!ts) return false; var a=new Date(ts), b=new Date(); return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function vDecide(H, filas, fijo){
  var dec=[], resto=[], h='', ids={};
  var cont=[];   /* contestadas: salen de la lista al instante; solo un renglón plegado con las de hoy */
  (H.preg||[]).forEach(function(x){ var e=null; try{ e=estadoDec(x.t); }catch(er){} if(e==="vivo"){ if(!ids[x.t.id]){ ids[x.t.id]=1; dec.push(x); } } else { if(e && !ids[x.t.id]){ ids[x.t.id]=1; cont.push(x); } resto.push(x); } });
  (H.dec284||[]).forEach(function(x){ if(!ids[x.t.id]){ ids[x.t.id]=1; cont.push(x); } });
  cont=cont.filter(function(x){ return contestadaHoy(x.t); });
  var vivos=dec.length, conId=false;
  var cab=function(lbl, n, k){ var a=conId?'':' id="sec272-preg"'; conId=true; var ab=abre285(k);   /* build 285: encabezado plegable con contador visible */
    if(fijo) return '<h2 class="hd284"'+a+'><span>'+lbl+'</span>'+(n?'<em>'+n+'</em>':'')+'</h2>';   /* en su propia vista: siempre abierto, sin plegar */
    return '<button class="hd284"'+a+' data-pl285="'+k+'" aria-expanded="'+(ab?"true":"false")+'" aria-label="'+esc(lbl)+(n?': '+n:'')+'"><span>'+lbl+'</span>'+(n?'<em>'+n+'</em>':'')+CH285+'</button>'; };
  var oc=function(k){ return (fijo || abre285(k))?'':' hidden'; };
  if(dec.length){ h+='<section class="sc284" aria-label="Decide tú">'+cab("Decide tú", vivos, "decide")+'<div class="bl284"'+oc("decide")+'>'+dec.map(function(x, i){ return filaDec(x.t, i); }).join("")+'</div></section>'; }
  var hCont=cont.length?'<details class="cont284"><summary>'+cont.length+' contestada'+(cont.length===1?'':'s')+' hoy · ver</summary><div class="bl284">'+cont.map(function(x, i){ return filaDec(x.t, i); }).join("")+'</div></details>':'';
  if(resto.length){
    h+='<section class="sc284" aria-label="Te pregunta Doit">'+cab("Te pregunta Doit", resto.length, "preg")+'<div class="bl284 revl ttl l284"'+oc("preg")+'>'+(filas||function(k, L, b){ return L.map(b).join(""); })("preg", resto, function(x){
      return '<button class="revr ttr" data-id="'+esc(x.t.id)+'"><span class="f284i" aria-hidden="true">'+esc(iniDec(x.t))+'</span><span class="ttx"><span class="rn">'+esc(x.t.nombre||"Sin nombre")+'</span>'+(vencidaInicio(x.t)?'<span class="et-venc">Vencida</span>':'')+(x.why?'<small>'+esc(x.why)+'</small>':'')+'</span>'+SVG284.chev+'</button>'; })+'</div></section>';
  }
  return h+hCont;
}
/* contestar desde el home: crea t.decision con la pregunta de «esperando tu decisión» si hacía falta y va por contestaDecision */
function asegDec(t){
  if(t && (!t.decision || typeof t.decision!=="object") && esDecisionSal(t)) t.decision={pregunta:String(t.pendiente_info||""), origen284:"pendiente_info", ts:Date.now()};
  return t;
}
function bindDec(){
  var busca=function(id){ return tareas.filter(function(x){ return x.id===id; })[0]; };
  Array.prototype.forEach.call(document.querySelectorAll("[data-r284]"), function(b){ b.onclick=function(ev){ ev.stopPropagation(); ev.preventDefault();
    var t=busca(b.getAttribute("data-r284")); if(!t || b.disabled) return; b.disabled=true; asegDec(t); contestaDecision(t, b.getAttribute("data-v284")||""); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-m284]"), function(b){ b.onclick=function(ev){ ev.stopPropagation(); ev.preventDefault();
    var id=b.getAttribute("data-m284"), t=busca(id); if(!t) return; asegDec(t);
    window.recienCreadas=[]; abierta=id; vista="hilo"; fichaOpen=false; detOpen={}; menuOpen=false; editaNombre=null; render();
    setTimeout(function(){ var s=document.getElementById("cp273d"); if(s) try{ s.scrollIntoView({block:"center"}); }catch(e){} var m=document.getElementById("dec273m"); if(m) m.click(); }, 60); }; });
}
/* ===================== build 285 (Salvador 8-oct): SECCIONES PLEGABLES Y «TU HISTORIAL» =====================
   1 TODAS las secciones del home se pliegan / despliegan tocando su encabezado (chevron que gira, aria-expanded, ≥44 px), con el
     contador visible aunque estén plegadas. Estado POR DÍA: al empezar un día nuevo (fecha local distinta a la guardada) TODAS
     amanecen plegadas menos «Decide tú», que amanece abierta; durante el día se recuerda lo que abrió o cerró
     (localStorage doit_pleg285_<usuario>_<fecha>, con try/catch). Los interruptores viejos (Acomodo 260, Mensajes 271, Mías futuras,
     Te encargaron, Las revisas tú, Compartidas, Las lleva Claude) leen y escriben este mismo estado.
   2 «Tu historial» hasta abajo del home (después del resumen): un renglón por cada cosa que hizo EL USUARIO ACTUAL hoy, lo más
     reciente arriba: hora · tarea · qué hizo, con ícono por tipo. Fuente: el registro del build 240 (hist240: localStorage
     doit_hist240 + bitacora_personas/<usuario>.historial_acciones, con ts y por). Solo entradas con por === yo (cada quien ve lo
     suyo); «Abrió la tarea» no cuenta. Picar el renglón abre la tarea (ahí está el ↩ deshacer del 278). «Ver días anteriores»
     carga 7 días más cada vez. Se agregan al registro las acciones que no dejaban rastro: cambiar nombre y eliminar la tarea. */
var PL285_K="doit_pleg285_";
function _pl(){
  var d=hoy(), u=String(yo||""), o=window.__pl285;
  if(!o || o.d!==d || o.u!==u){ var s=null; try{ s=JSON.parse(localStorage.getItem(PL285_K+u+"_"+d)||"null"); }catch(e){ s=null; }
    o={d:d, u:u, o:(s && typeof s==="object" && s.o && typeof s.o==="object")?s.o:{}}; window.__pl285=o; }
  return o;
}
/* ¿abierta? lo que el usuario tocó hoy; si no tocó nada, solo «Decide tú» */
function abre285(k){ var o=_pl(); if(Object.prototype.hasOwnProperty.call(o.o, k)) return !!o.o[k]; return k==="decide"; }
function ponAbre(k, v){ var o=_pl(); o.o[k]=!!v;
  try{ localStorage.setItem(PL285_K+o.u+"_"+o.d, JSON.stringify({d:o.d, o:o.o}));
    for(var i=localStorage.length-1; i>=0; i--){ var kk=localStorage.key(i); if(kk && kk.indexOf(PL285_K+o.u+"_")===0 && kk!==PL285_K+o.u+"_"+o.d) localStorage.removeItem(kk); }   /* solo el estado de hoy */
  }catch(e){} }
(function(){ if(typeof window==="undefined" || window.__acc285) return; window.__acc285=1;
  [["verFuturas","fut"],["__verEnc270","enc"],["__verRev270","rev"],["__verComp","comp"],["__clL263","claude"]].forEach(function(p){
    try{ Object.defineProperty(window, p[0], {configurable:true, get:function(){ return abre285(p[1]); }, set:function(v){ ponAbre(p[1], !!v); }}); }catch(e){} });
})();
var CH285='<svg class="ch285" width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5l5 5-5 5"/></svg>';
/* abre o pliega en su lugar (sin volver a pintar el home: no brinca el scroll) */
function pinta285(k){ var v=abre285(k);
  Array.prototype.forEach.call(document.querySelectorAll('[data-pl285="'+k+'"]'), function(b){ b.setAttribute("aria-expanded", v?"true":"false");
    var c=b.nextElementSibling; if(c){ if(v) c.removeAttribute("hidden"); else c.setAttribute("hidden", ""); } }); }
function abreSec(k, v){ ponAbre(k, v!==false); pinta285(k); }
function bindPl(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-pl285]"), function(b){ b.onclick=function(ev){ if(ev) ev.preventDefault();
    var k=b.getAttribute("data-pl285"); abreSec(k, !abre285(k)); }; });
}
/* ---------- «Tu historial» ---------- */
var HIST285_RUIDO=/^(Abrió la tarea)$/;
function histMio(dias){
  var ini=new Date(); ini.setHours(0,0,0,0); var desde=ini.getTime()-(dias||0)*864e5, ya={};
  return histLee().filter(function(e){ if(!e || !yo || e.por!==yo || (+e.ts||0)<desde || HIST285_RUIDO.test(String(e.que||""))) return false;
    if(e.id && ya[e.id]) return false; if(e.id) ya[e.id]=1; return true; })
    .sort(function(a,b){ return (+b.ts||0)-(+a.ts||0); });
}
/* lo que hizo, dicho a él (segunda persona) */
var TU285=[
  [/^Ya está \(la cerró\)$/, "Cerraste · Ya está"],
  [/^Movió la fecha (.*)$/, "Cambiaste la fecha $1"],
  [/^Movió (.*)$/, "Reacomodaste $1"],
  [/^Vinculó a (.*)$/, "Vinculaste con $1"],
  [/^Acomodo: OK sin importancia$/, "Autorizaste acomodo (sin importancia)"],
  [/^Acomodo: OK a (.*)$/, "Autorizaste acomodo de $1"],
  [/^Acomodo: OK$/, "Autorizaste acomodo"],
  [/^Acomodo: Nueva (.*)$/, "Acomodo: creaste la tarea $1"],
  [/^Acomodo: Dato (.*)$/, "Acomodo: lo guardaste como dato $1"],
  [/^Dictado: (.*)$/, "Dictaste: $1"],
  [/^Indicación a Claude: (.*)$/, "Le pediste a Claude: $1"],
  [/^Mensaje a ([^:]+): (.*)$/, "Le escribiste a $1: $2"],
  [/^Contestó la decisión: (.*)$/, "Respondiste Decide tú: «$1»"],
  [/^Contestó en caminata: (.*)$/, "Contestaste en caminata: «$1»"],
  [/^Caminata: como dato (.*)$/, "En caminata la dejaste como dato $1"],
  [/^Propuesta aceptada: (.*)$/, "Autorizaste la tarea nueva $1"],
  [/^Propuesta descartada: (.*)$/, "Descartaste la propuesta $1"],
  [/^Propuesta como dato: (.*)$/, "Guardaste la propuesta como dato $1"],
  [/^Quitó la palomita: (.*)$/, "Quitaste la palomita: $1"],
  [/^Palomeó en la lista: (.*)$/, "Palomeaste en la lista: $1"],
  [/^Palomeó: (.*)$/, "Palomeaste: $1"],
  [/^Tocó “(.*)”$/, "Marcaste «$1»"],
  [/^Te pregunta: ya la contesté$/, "Marcaste «ya la contesté»"],
  [/^No guardar (.*)$/, "No guardaste $1"],
  [/^No es de aquí (.*)$/, "Marcaste «No es de aquí» $1"],
  [/^Es para Claude: (.*)$/, "Marcaste «Es para Claude»: $1"],
  [/^Eliminó (.*)$/, "Eliminaste $1"],
  [/^Deshizo: (.*)$/, "Deshiciste: $1"],
  [/^Cambió el nombre (.*)$/, "Renombraste $1"]
];
function tu285(q){ q=String(q||"").replace(/\s+/g," ").trim(); for(var i=0;i<TU285.length;i++){ if(TU285[i][0].test(q)) return q.replace(TU285[i][0], TU285[i][1]); } return q; }
function tipo285(q){ q=String(q||"");
  if(/^Deshizo/.test(q)) return "undo";
  if(/^Vinculó/.test(q)) return "link";
  if(/^Movió la fecha/.test(q)) return "cal";
  if(/^Movió/.test(q)) return "move";
  if(/^(Acomodo|Propuesta|Tocó|No es de aquí|Es para Claude|No guardar|Caminata: como dato)/.test(q)) return "folder";
  if(/^(Dictado|Indicación a Claude|Contestó en caminata)/.test(q)) return "mic";
  if(/^Contestó la decisión|^Te pregunta/.test(q)) return "decide";
  if(/^Mensaje a/.test(q)) return "chat";
  if(/^Cambió el nombre/.test(q)) return "pencil";
  if(/^(Ya está|Palomeó|Quitó la palomita)/.test(q)) return "check";
  if(/^Eliminó/.test(q)) return "trash";
  return "dot";
}
function ico285(k){
  var P={link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    mic:'<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>',
    decide:'<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.3l2.5 2.5 5-5"/>', dot:'<circle cx="12" cy="12" r="2.2"/>'}[k];
  if(!P) return ico(k, 16);
  return '<svg class="icx" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+P+'</svg>';
}
function hora285(ts){ var d=new Date(+ts||0), H=fmt24()?("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2):((d.getHours()%12)||12)+":"+("0"+d.getMinutes()).slice(-2)+(d.getHours()<12?" a. m.":" p. m.");
  return H; }
function vHist(fijo){
  if(!yo) return "";
  var dias=+window.__hist285dias||0, L=histMio(dias), H=hoy(), deHoy=L.filter(function(e){ return iso(+e.ts||0)===H; }), ab=fijo || abre285("hist");
  var h='<section class="sc284 hist285" aria-label="Tu historial">'+(fijo?'<h2 class="hd284" id="sec285-hist"><span>Hoy</span>'+(deHoy.length?'<em>'+deHoy.length+'</em>':'')+'</h2>':'<button class="hd284" id="sec285-hist" data-pl285="hist" aria-expanded="'+(ab?"true":"false")+'" aria-label="Tu historial: '+deHoy.length+'"><span>Tu historial</span>'+(deHoy.length?'<em>'+deHoy.length+'</em>':'')+CH285+'</button>');
  h+='<div class="bl284 bl285"'+(ab?'':' hidden')+'>';
  if(!deHoy.length) h+='<div class="h285v">Hoy no has movido nada todavía</div>';
  var dia="";
  L.forEach(function(e){ var f=iso(+e.ts||0);
    if(f!==H && f!==dia){ dia=f; h+='<div class="h285d">'+esc(fechaChip(f)==="ayer"?"Ayer":fechaBonita(f))+'</div>'; }
    h+='<button class="h285r" data-h285="'+esc(e.tid||"")+'" data-h285id="'+esc(e.id||"")+'"><span class="h285i" aria-hidden="true">'+ico285(tipo285(e.que))+'</span><span class="h285x">'+
      '<span class="h285t"><span class="h285n">'+esc(e.tnom||"Sin tarea")+'</span><time class="h285h">'+esc(hora285(e.ts))+'</time></span>'+
      '<span class="h285q">'+esc(tu285(e.que))+'</span></span></button>'; });
  h+='<button class="h285m" id="bhist285">Ver días anteriores</button>';
  return h+'</div></section>';
}
function bindHist(){
  Array.prototype.forEach.call(document.querySelectorAll("[data-h285]"), function(el){ el.onclick=function(){ var id=el.getAttribute("data-h285");
    if(!id || !tareaId240(id)){ toast("Esa tarea ya no está"); return; }
    window.recienCreadas=[]; abierta=id; vista="hilo"; fichaOpen=false; detOpen={}; menuOpen=false; editaNombre=null; render(); }; });
  var m=$("bhist285"); if(m) m.onclick=function(){ window.__hist285dias=(+window.__hist285dias||0)+7; render(); };
}
/* lo que no dejaba rastro en el historial: eliminar la tarea (con motivo, al nacer, recordatorio) */
(function(){
  if(typeof window==="undefined" || window.__envueltas285) return; window.__envueltas285=1;
  var _cs=cierraSinEjecutar; cierraSinEjecutar=function(t, mk){ var r=_cs.apply(this, arguments); try{ if(t && t.cierre) hist240("Eliminó la tarea"+(mk?" ("+String(mk).replace(/_/g," ")+")":""), t, {tipo:"reabrir"}); }catch(e){} return r; };
  var _da=descartaAlNacer; descartaAlNacer=function(t){ var r=_da.apply(this, arguments); try{ if(t && t.cierre) hist240("Eliminó la tarea nueva", t, {tipo:"reabrir"}); }catch(e){} return r; };
  var _br=borraRecordatorioYQuedate; borraRecordatorioYQuedate=function(t){ var r=_br.apply(this, arguments); try{ if(t && t.cierre) hist240("Eliminó el recordatorio", t, {tipo:"reabrir"}); }catch(e){} return r; };
})();

/* ===================== build 274 (Salvador 7-oct): MODO CAMINATA =====================
   Para usarlo caminando o manejando, sin ver la pantalla. Reemplaza al modo audífonos (que se cortaba a los 5 s).
   1 Botón grande "Caminata" en el home: recorre UNA POR UNA sus pendientes, en este orden: decisiones (t.decision / esperan tu
     decisión) · llamadas de hoy · vencidas y de hoy (el mismo orden del home).
   2 Formato PODCAST a DOS VOCES (speechSynthesis, es-MX > es-US > es-ES): A presentadora ("Tarea 2 de 7: Reloj checador."),
     B analista (contexto en 2-3 frases cortas, "Lo que hay que decidir: …", "Yo haría: … porque …"); A cierra con la pregunta.
     Si solo hay una voz en español, se distinguen por tono y velocidad. Frases cortas; nunca bloques largos ni código.
   3 ESCUCHA SIN CORTAR: continuous + interimResults, se reabre sola si el motor se cae. El SILENCIO NUNCA ENVÍA: a los 2.5 s
     la voz A pregunta bajito "¿Terminaste o sigues?" ("sigo"/"espera" = sigue escuchando y acumula; "terminé"/"listo"/"ya" = envía).
     Decir "terminé" al final de la respuesta también envía. La primera vez de la sesión explica: "Cuando acabes de contestar, di 'terminé'."
   4 Comandos de voz: repite · más detalle · siguiente · atrás · pausa · salir (y "la dejamos para después" = siguiente sin anotar).
   5 La respuesta va al hilo de la tarea como mensaje de Salvador (nota para Claude; la Mac la procesa). Si la tarea trae una decisión
     pendiente, queda además como su respuesta (contestaDecision). Voz A: "Anotado." y pasa a la siguiente.
   6 Pantalla mínima: título, círculo que indica hablando / escuchando, botones grandes Pausa y Siguiente; pantalla encendida (Wake Lock). */
var CAM_SILENCIO=2500, CAM_ESPERA_VACIO=20000;
var CAM={on:false, L:[], i:0, fase:"", pausa:false, tok:0, explicado:false, rec:null, buf:"", par:"", modo:"", tSil:null, tVac:null, wl:null, n:0};
function _camNv(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[¿?¡!.,;:"'«»“”]/g," ").replace(/\s+/g," ").trim(); }
function _camVivo(t){ try{ return !!t && !t.cierre && !t.fusionada_en && !esDormida(t) && !esPropuesta(t) && estadoReal(t)!=="cerrada"; }catch(e){ return !!t && !t.cierre; } }
var CAM_LLAMA=/\b(llama|llamar|llamale|llamarle|llamada|llamadas|marcale|marcarle|telefonea|telefonear|hablale por telefono)\b/;
function esLlamada(t){
  var s=_camNv(t && t.nombre); if(CAM_LLAMA.test(s)) return true;
  try{ var v=vamos273(t); if(v && CAM_LLAMA.test(_camNv(v.tx))) return true; }catch(e){}
  return false;
}
/* el orden de la caminata: decisiones · llamadas de hoy · vencidas y de hoy */
function camLista274(){ return camLista276().L; }   /* build 276: + ficha Falta · mensajes por acomodar */   /* build 275: decisiones · llamadas de MAÑANA · tareas nuevas de Acomodo */
/* ---------- texto hablado: frases cortas, sin código ni ligas ---------- */
function _camCodigo(s){ return /[{}<>;=\\]|=>|\bfunction\b|\bvar\b|\bconst\b|\breturn\b|\.(js|html|php|json|py)\b|`/.test(s); }
function camFrases(s, max){
  s=limpiaHabla(String(s||"").replace(/```[\s\S]*?```/g," ").replace(/`[^`]*`/g," ")).replace(/\s*…\s*y sigue un texto largo\.?$/,"");
  var F=(s.match(/[^.!?]+[.!?]*/g)||[]).map(function(x){ return x.trim(); }).filter(function(x){ return x.length>2 && !_camCodigo(x); });
  return F.slice(0, max||2).map(function(x){ return camCorta(x, 150); });
}
function camCorta(s, n){ s=String(s||"").replace(/\s+/g," ").trim(); if(s.length<=n) return s;
  var c=s.slice(0,n), p=Math.max(c.lastIndexOf(", "), c.lastIndexOf("; ")); return (p>n*0.5?c.slice(0,p):c.replace(/\s+\S*$/,""))+"."; }
function camPunto(s){ s=String(s||"").trim().replace(/[\s,;:]+$/,""); return s && !/[.!?]$/.test(s)?s+".":s; }
function camNombre(t){ return camCorta(limpiaHabla((t && t.nombre)||"Sin nombre"), 90).replace(/[.\s]+$/,""); }
/* el guion de una tarea: [{v:"A"|"B", t:"…"}] */
function camGuion274(t, i, n){
  var G=[], d=null; try{ d=decision273(t); }catch(e){}
  G.push({v:"A", t:"Tarea "+(i+1)+" de "+n+": "+camNombre(t)+"."});
  /* contexto: 2 o 3 frases (resumen de Claude o contexto, y el siguiente paso) */
  var R=(t.resumen && typeof t.resumen==="object")?t.resumen:{}, ctx=camFrases(R.texto, 2);
  if(!ctx.length){ var cx=""; try{ cx=contextoDe(t); }catch(e){} ctx=camFrases(cx, 2); }
  var v={}; try{ v=vamos273(t)||{}; }catch(e){}
  if(v.tx && !_camCodigo(v.tx)){
    var q=v.quien==="Tú"?"te toca a ti":(v.quien==="Claude"?"lo lleva Claude":(v.quien?"lo tiene "+v.quien:"")), f=v.fecha?(fechaChip(v.fecha)||""):"";
    ctx.push(camPunto("En qué vamos: "+camCorta(limpiaHabla(v.tx), 140))+(q||f?" "+camPunto(q?(q.charAt(0).toUpperCase()+q.slice(1))+(f?", para "+f:""):"Para "+f):""));
  }
  if(ctx.length<2){ var S=[]; try{ S=sabemos273(t); }catch(e){} if(S.length) ctx.push(camPunto(camCorta(limpiaHabla(S[0].t), 140))); }
  ctx.slice(0,3).forEach(function(x){ G.push({v:"B", t:camPunto(x)}); });
  if(d){
    if(d.pregunta) G.push({v:"B", t:camPunto("Lo que hay que decidir: "+camCorta(limpiaHabla(d.pregunta), 160))});
    if(d.recomendacion){ var rec=camCorta(limpiaHabla(d.recomendacion), 170).replace(/[.\s]+$/,""), pq=camPorque(d);
      G.push({v:"B", t:"Yo haría: "+rec+(pq && !/\bporque\b/i.test(rec)?", porque "+pq:"")+"."}); }
  } else {
    var Q=[]; try{ Q=preguntas249(t); }catch(e){}
    var ds=false; try{ ds=esDecisionSal(t); }catch(e){}
    if(Q.length && Q[0].q) G.push({v:"B", t:camPunto("Lo que hay que decidir: "+camCorta(limpiaHabla(Q[0].q), 160))});
    else if(ds && t.pendiente_info) G.push({v:"B", t:camPunto("Lo que hay que decidir: "+camCorta(limpiaHabla(t.pendiente_info), 160))});
  }
  if(G.length===1) G.push({v:"B", t:"No tengo más contexto de esta tarea."});
  return G;
}
/* "porque": de la opción recomendada, lo que cumple (solo con los datos de la decisión; si no hay, no se inventa) */
function camPorque(d){
  var ops=d.opciones||[], r=ops.filter(function(o){ return o.recomendada===true; })[0];
  if(!r){ var rn=_camNv(d.recomendacion); r=ops.filter(function(o){ var n=_camNv(o.nombre); return n && n.length>=3 && rn.indexOf(n)>=0; })[0]; }
  if(!r || !r.cumple || typeof r.cumple!=="object") return "";
  var si=Object.keys(r.cumple).filter(function(k){ return r.cumple[k]===true; }).map(function(k){ return limpiaHabla(k).toLowerCase(); });
  if(!si.length) return "";
  return "cumple con "+juntaY(si.slice(0,3))+(r.precio!=null && String(r.precio).trim()?" y cuesta "+limpiaHabla(String(r.precio)):"");
}
/* "más detalle": las viñetas de Lo que sabemos y la comparativa, resumidas */
function camDetalle274(t){
  var G=[], S=[], d=null; try{ S=sabemos273(t); }catch(e){} try{ d=decision273(t); }catch(e){}
  if(S.length){ G.push({v:"B", t:"Lo que sabemos."}); S.slice(0,5).forEach(function(x){ var s=camCorta(limpiaHabla(x.t), 140); if(!s || _camCodigo(s)) return; G.push({v:"B", t:camPunto((x.tipo==="descartado"?"Descartado: ":"")+s)}); }); }
  if(d && d.opciones && d.opciones.length){
    G.push({v:"B", t:"Las opciones."});
    d.opciones.slice(0,4).forEach(function(o){ var c=(o.cumple && typeof o.cumple==="object")?o.cumple:{}, si=[], no=[];
      Object.keys(c).forEach(function(k){ if(c[k]===true) si.push(limpiaHabla(k).toLowerCase()); else if(c[k]===false) no.push(limpiaHabla(k).toLowerCase()); });
      var s=limpiaHabla(o.nombre)+(o.precio!=null && String(o.precio).trim()?", "+limpiaHabla(String(o.precio)):"");
      if(si.length) s+=". Cumple con "+juntaY(si.slice(0,3)); if(no.length) s+=". No cumple con "+juntaY(no.slice(0,3));
      G.push({v:"B", t:camPunto(camCorta(s, 200))}); });
  }
  if(!G.length) G.push({v:"B", t:"No tengo más detalle de esta tarea."});
  return G;
}
/* ---------- las dos voces ---------- */
function camVoces(){
  var vs=[]; try{ vs=speechSynthesis.getVoices()||[]; }catch(e){}
  try{ vs=vs.filter(function(x){ return !vozJuguete(x); }); }catch(e){}
  try{ vs=vs.slice().sort(function(a,b){ return (vozCalidad(b)?1:0)-(vozCalidad(a)?1:0); }); }catch(e){}   /* Premium/Mejorada primero */
  var de=function(re){ return vs.filter(function(x){ return re.test(x.lang||""); }); };
  var L=de(/^es[-_]MX/i); if(!L.length) L=de(/^es[-_](US|419)/i); if(!L.length) L=de(/^es[-_]ES/i); if(!L.length) L=de(/^es/i);
  var a=L[0]||null, b=L.length>1?L[1]:null;
  /* una sola voz en español: B usa otra variante de español si la hay (es-US / es-ES); si no, la misma con otro tono */
  if(a && !b){ var o=de(/^es/i).filter(function(x){ return x!==a; }); b=o[0]||null; }
  return {A:a, B:b, distintas:!!(a && b && a!==b)};
}
function camDi(G, done){
  var tok=++CAM.tok, k=0, V=camVoces(), E=[]; try{ E=vozElenco(); vozTurnoNuevo(); }catch(e){}
  CAM.fase="hablando"; camPinta();
  try{ if(speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel(); }catch(e){}
  camBargeAbre(tok);   /* build 276: el micrófono sigue abierto mientras habla (interrupción) */
  var uno=function(){
    if(tok!==CAM.tok) return;
    if(k>=G.length){ camBargeCierra(); camHablo(); CAM.fase=""; camPinta(); if(done) done(); return; }
    if(!G.aux) CAM.rest={G:G, k:k, done:done};   /* build 276: dónde va (para "repíteme lo último" y "sigue" después de "espera") */
    var g=G[k++], u=null, listo=false;
    var sig=function(){ if(listo) return; listo=true; clearTimeout(CAM.wd); if(tok===CAM.tok) setTimeout(uno, 120); };
    try{ u=new SpeechSynthesisUtterance(g.t); }catch(e){ return sig(); }
    var rate=1.0; try{ rate=_leeRate(); }catch(e){}
    var tono=1; try{ tono=vozTono(); }catch(e){}
    if(E.length){   /* elenco palomeado: cada turno con la siguiente voz; con una sola voz, A y B se distinguen por tono */
      var ve=vozRota(g.v)||E[0], dist=E.length>1; u.voice=ve; u.lang=ve.lang||"es-MX";
      u.pitch=tono*(dist?1:(g.v==="A"?1.15:0.85)); u.rate=rate*(dist?1:(g.v==="A"?1.02:0.92)); }
    else if(g.v==="A"){ u.voice=V.A||null; u.lang=(V.A&&V.A.lang)||"es-MX"; u.pitch=tono*(V.distintas?1.05:1.25); u.rate=rate*1.02; }
    else { u.voice=V.B||V.A||null; u.lang=((V.B||V.A)&&(V.B||V.A).lang)||"es-MX"; u.pitch=tono*(V.distintas?0.95:0.75); u.rate=rate*(V.distintas?0.97:0.9); }
    u.volume=g.bajito?0.55:1;
    u.onend=sig; u.onerror=function(e){ if(e && (e.error==="interrupted"||e.error==="canceled") && tok!==CAM.tok) return;
      if(e && (e.error==="interrupted"||e.error==="canceled") && tok===CAM.tok && CAM.brec){ camBargeFalla("la voz se cortó al abrir el micrófono ("+e.error+")"); k--; }   /* build 276: iOS no deja hablar y escuchar a la vez: se apaga la interrupción y se repite la frase */
      sig(); };
    CAM.voz=g.v; CAM.dicho=g.t; camHablo(g.t); camPinta();
    clearTimeout(CAM.wd); CAM.wd=setTimeout(sig, 3500+String(g.t).length*95/rate);
    try{ speechSynthesis.speak(u); }catch(e){ sig(); }
  };
  uno();
}
/* ---------- escucha sin cortar ---------- */
function camCallaMic(){ clearTimeout(CAM.tSil); clearTimeout(CAM.tVac); var r=CAM.rec; CAM.rec=null; CAM.oye=false; if(r){ r.__muerto=true; try{ r.abort ? r.abort() : r.stop(); }catch(e){ try{ r.stop(); }catch(e2){} } } }
function camEscucha(modo){
  camCallaMic();
  if(!CAM.on || CAM.pausa) return;
  CAM.modo=modo||"resp"; CAM.fase="escuchando"; CAM.par=""; if(CAM.modo==="resp" && CAM.limpia){ CAM.buf=""; CAM.limpia=false; }
  CAM.oidoModo="";   /* lo dicho en la pregunta "¿Terminaste o sigues?" */
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ CAM.sinMic=true; camPinta(); return; }
  var abre=function(){
    if(!CAM.on || CAM.pausa || CAM.fase!=="escuchando") return;
    var r=null; try{ r=new SR(); }catch(e){} if(!r){ CAM.sinMic=true; camPinta(); return; }
    r.lang="es-MX"; r.continuous=true; r.interimResults=true; try{ r.maxAlternatives=1; }catch(e){}
    var finR="";
    r.onresult=function(e){ if(r.__muerto) return; var fin="", par="";
      for(var j=0;j<e.results.length;j++){ var x=e.results[j]; if(x.isFinal) fin+=x[0].transcript+" "; else par+=x[0].transcript; }
      /* lo final de ESTA sesión del motor se suma a lo acumulado de antes */
      if(fin!==finR){ var nuevo=fin.slice(finR.length); finR=fin; camOye(nuevo, true); }
      CAM.par=par.trim(); camPinta();
      /* iOS a veces nunca marca isFinal en continuo: "terminé" al final de lo que va a medias también envía */
      if(CAM.par && CAM.modo==="resp" && CAM_FIN.test(_camNv(CAM.par))){ var pp=CAM.par; CAM.par=""; r.__muerto=true; return camOye(pp, true); }
      if(CAM.par || fin) camRelojSilencio(); };
    r.onerror=function(ev){ var er=(ev&&ev.error)||""; if(er==="not-allowed"||er==="service-not-allowed"||er==="audio-capture"){ r.__muerto=true; CAM.sinMic=true; camPinta(); } };
    r.onend=function(){ if(r.__muerto || CAM.rec!==r) return;
      if(CAM.par){ camOye(CAM.par, true); CAM.par=""; }   /* lo que iba a medias no se pierde */
      setTimeout(function(){ if(CAM.rec===r && CAM.on && !CAM.pausa && CAM.fase==="escuchando") abre(); }, 200); };
    CAM.rec=r; CAM.oye=true;
    try{ r.start(); }catch(e){ CAM.sinMic=true; }
    camPinta();
  };
  abre();
  clearTimeout(CAM.tVac); CAM.tVac=setTimeout(function(){ if(CAM.on && CAM.fase==="escuchando" && !CAM.buf && !CAM.par && CAM.modo==="resp" && !CAM.vacioDicho){ CAM.vacioDicho=true; camDi(camAux([{v:"A", t:"Te escucho. Si quieres pasar, di siguiente.", bajito:true}]), function(){ camEscucha("resp"); }); } }, CAM_ESPERA_VACIO);
}
function camRelojSilencio(){
  clearTimeout(CAM.tSil);
  CAM.tSil=setTimeout(function(){
    if(!CAM.on || CAM.fase!=="escuchando") return;
    var pp=CAM.par; CAM.par="";
    if(CAM.modo==="check"){   /* la respuesta a "¿Terminaste o sigues?" (en iPhone a veces llega solo a medias) */
      if(!pp) return;
      camCallaMic(); camOye(pp, true);
      if(CAM.on && CAM.fase==="escuchando" && !CAM.rec) camEscucha(CAM.modo);
      return;
    }
    var todo=(CAM.buf+" "+pp).trim();
    var c=camComando(todo); if(c){ CAM.buf=""; return camHaz274(c); }   /* un comando dicho solo, aunque no llegue como final */
    CAM.buf=todo;
    if(CAM.buf && CAM.conf && camConfCorto(CAM.buf)) return camEnvia();   /* build 277: sí / no a la confirmación */
    if(CAM.buf && CAM_CORTO.test(_camNv(CAM.buf))) return camEnvia();   /* build 275: corto y claro = se envía ya */
    if(CAM.buf && (CAM.qz || camK()==="msg") && _camNv(CAM.buf).split(" ").length<=CAM_QZ_CORTO) return camEnvia();   /* build 276: en el cuestionario y en mensajes, lo corto se envía sin "¿Terminaste?" */
    if(CAM.buf){   /* 2.5 s callado con algo dicho: NO se envía, se pregunta bajito */
      camCallaMic(); CAM.modo="check";
      camDi(camAux([{v:"A", t:"¿Terminaste o sigues?", bajito:true}]), function(){ camEscucha("check"); });
    }
  }, CAM.modo==="check"?1200:((CAM.modo==="resp" && !CAM.buf && (CAM_CORTO.test(_camNv(CAM.par)) || (CAM.conf && camConfCorto(CAM.par))))?700:CAM_SILENCIO));   /* build 275: "va"/"sí" a medias no espera 2.5 s */
}
var CAM_CMD=[
  ["ultimo", /^((repiteme|repite|repetir|repitemelo|dime|di) (otra vez |de nuevo )?lo ultimo( que dijiste)?|lo ultimo otra vez|que dijiste|como dijiste|perdon que dijiste|que dijiste perdon|repiteme|repitemelo|repitemela|repiteme eso|repiteme otra vez|repitemelo otra vez)$/],   /* build 277: «repíteme» solo = lo último que dijo */
  ["rebobina", /^((regresa|regresate|regresale|retrocede|retrocedele|vuelve|echate|ve|hazte) (un poco|tantito|un poquito|poquito|un poco mas|mas)( (para )?atras)?|(un poco |tantito )?mas atras|un poco (mas )?(para )?atras|rebobina|rebobinale)$/],   /* build 277: «regresa un poco» = vuelve a leer desde un par de frases antes */
  ["entendiste", /^((me )?entendiste( bien)?|que entendiste|dime (si|que|lo que) (me )?entendiste|que (hiciste|acabas de hacer)|que vas a hacer|confirmame|confirmamelo|me confirmas|confirma|confirmalo)$/],
  ["espera", /^(espera|esperame|esperate|espera tantito|un momento|un segundo|dame un segundo|aguanta|aguantame|para|para tantito)$/],
  ["voy", /^((a ver|haber|aver) ?voy|a ver|haber|aver|voy|ahi voy|dejame ver|a ver dejame ver|a ver espera|a ver a ver|mira)$/],
  ["continua", /^(sigue|continua|continuale|sigamos|ya sigue|puedes seguir|sigue hablando|sigue sigue)$/],   /* build 276: después de "espera" */
  ["repite", /^(repite|repitelo|repitela|repitemelo|repitemela|otra vez|de nuevo|no te entendi|no entendi)$/],
  ["detalle", /^((dame |quiero )?mas detalles?|detalles?|cuentame mas|explicame mas)$/],
  ["despues", /^((la |lo )?(dejamos|dejo|deja|dejala|dejalo) para (despues|luego|mas tarde)|para (despues|luego)|despues|luego)$/],
  ["siguiente", /^(siguiente|la siguiente|sigue la otra|otra|pasa|pasala|salta|saltala|adelante|next)$/],
  ["deshaz", /^(no eso no|eso no|no no eso no|no no|regresa|regresate|deshaz|deshazlo|deshacer|me equivoque|no era eso)$/],   /* build 275: deshace la última acción (si no hay, es atrás) */
  ["deshaz", /^(no |no no |oye no |ay no |no espera )?(deshaz|deshazlo|deshaz eso|deshazla|deshacer|deshazlo ya|cancela|cancela eso|cancelalo|cancelala|retrocede|retrocedelo|revierte|revierte eso|reviertelo|anula|anulalo|anula eso|quita eso|quitalo|regresalo|regresa eso|regresalo como estaba|dejalo como estaba|como estaba|esta mal|eso esta mal|lo hiciste mal|te equivocaste|no era esa|esa no era|esa no es|no es esa|la vinculaste mal|la juntaste mal|no la juntes|no era esa tarea|no era ahi|ahi no)( por favor)?$/],   /* build 277: más formas naturales de deshacer */
  ["atras", /^(atras|anterior|la anterior|vuelve a la anterior)$/],
  ["pausa", /^(pausa|pausala|ponle pausa|pon pausa|deten|detente|alto)$/],
  ["salir", /^(salir|sal|salte|termina la caminata|terminar caminata|cierra|cierra la caminata|adios|ya no|basta)$/]
];
function camComando(s){ s=_camNv(s).replace(/^(oye|doit|claude)\s+/,"").replace(/\s+(por favor|porfa)$/,""); for(var i=0;i<CAM_CMD.length;i++) if(CAM_CMD[i][1].test(s)) return CAM_CMD[i][0];
  if(camDeshazSuelto(s)) return "deshaz";   /* build 277: «no, deshazlo, la juntaste con otra» */
  return ""; }
var CAM_FIN=/(?:^|\s)(ya\s+)?(termine|terminado|he terminado)$/;
/* llega un pedazo final de lo dictado */
function camOye(txt, esFinal){
  txt=String(txt||"").replace(/\s+/g," ").trim(); if(!txt || !CAM.on) return;
  clearTimeout(CAM.tVac);
  if(CAM.conf && CAM.modo==="resp" && !CAM.buf && camConfCorto(txt)){ CAM.buf=txt; return camEnvia(); }   /* build 277: «sí» / «no» a la confirmación, al instante */
  if(CAM.modo==="check"){
    var s=_camNv(txt);
    if(/^(sigo|sigue|espera|esperame|no|todavia no|aun no|no he terminado|todavia|un momento|dejame pensar|a ver|voy|a ver voy)$/.test(s)){ CAM.modo="resp"; camPinta(); return; }   /* build 276: antes de los comandos (espera/a ver aquí = sigo) */
    var c=camComando(s);
    if(c) return camHaz274(c);
    if(/^(si\s+)?(ya\s+)?(termine|listo|ya|ya esta|eso es todo|es todo|si|manda(lo)?|envia(lo)?)$/.test(s)) return camEnvia();
    /* otra cosa: es más respuesta; se acumula y se sigue escuchando */
    CAM.modo="resp";
  }
  var todo=(CAM.buf+" "+txt).trim();
  var cmd=camComando(todo.replace(CAM_FIN,"").trim()) || (!CAM.buf?camComando(txt):"");
  if(cmd){ CAM.buf=""; return camHaz274(cmd); }
  var _b0=!CAM.buf; CAM.buf=todo; camPinta();
  var n=_camNv(todo);
  if(_b0 && CAM_CORTO.test(n)) return camEnvia();   /* build 275: "va", "sí", "dale"… dicho solo = se envía al instante */
  if(CAM_FIN.test(n)) return camEnvia();
}
function camQuitaFin(s){ var w=String(s||"").replace(/\s+/g," ").trim().split(" "), k=w.length;
  while(k>0 && /^(termine|terminado|he|ya)$/.test(_camNv(w[k-1]))) k--; return w.slice(0,k).join(" ").replace(/[\s,;:]+$/,""); }
function camEnvia(){
  var v=camQuitaFin((CAM.buf+" "+CAM.par).trim()); CAM.buf=""; CAM.par=""; camCallaMic();
  if(!v){ return camDi([{v:"A", t:"No alcancé a oír nada. ¿Me lo repites?"}], function(){ camEscucha("resp"); }); }
  var t=camTarea(); if(!t) return camSiguiente(1);
  CAM.espera276=false;
  camCrudo(t, v);   /* hotfix 276 (7-oct): lo que dijo queda escrito en la tarea YA, antes de la IA y del cuestionario */
  camOrden(t, v);   /* build 286: y queda como ORDEN pendiente (encargo) antes de la IA; solo se cierra cuando algo se aplicó de verdad */
  if(CAM.conf) return camConfResp(v);   /* build 277: contesta «¿Lo hago?» */
  if(!CAM.qz){ CAM.pideConf277=camPideConf(v) || !!CAM.confSig277 || !!(CAM.aclara && CAM.pideConf277); CAM.confSig277=false; }   /* build 277: «confírmame» / «¿entendiste bien?» = repetir y esperar su sí */
  if(CAM.qz) return camQuizResp(v);   /* build 276: contesta una pregunta del cuestionario */
  if(camK()==="msg") return camMsgEntiende(v);   /* build 276: a qué tarea va el mensaje */
  camEntiende(t, v);   /* build 275: lo que dijo va a la IA (sin palabras clave), se ejecuta sin reconfirmar */
}
/* ===== build 286 (Caminata 8-oct: testamentos, reloj, ICOSA): TODO LO QUE DICE SALVADOR EN UNA TAREA ES ORDEN Y NUNCA SE PIERDE =====
   · Cada respuesta se guarda PRIMERO como orden pendiente (t.encargos, tipo "orden", origen app283, caminata:1) ANTES de llamar a la IA.
   · La IA solo clasifica y aplica lo rápido (aprobar, rechazar, vincular, eliminar, dato, Decide tú). Solo entonces la orden se cierra (hecho + resultado).
   · «aclarar», «después»/«detalle» con contenido, una «instrucción» (que pide TRABAJO), la IA caída o un «No» a «¿Lo hago?» NUNCA la descartan:
     queda viva para la Mac (ejecutor 18z40) con su motivo; con «No» queda preguntar_despues y lo que entendió la app.
   · Si después corrige o aclara en la misma tarea, se suma a la MISMA orden (no se duplica). Deshacer la marca «deshecho». ===== */
/* solo el campo encargos (merge), como camCrudo: no toca el nombre ni nada más; sin red queda en la cola de Firestore */
function camGuardaEnc(T){
  try{ if(!T || esEjemplo(T) || !db) return;
    datosTareas.guardarCampos(T.id, {encargos:limpiaUndef(T.encargos||[])})
      .catch(function(e){ try{ console.error("caminata 286 orden", e); }catch(_e){} toast("No se pudo guardar la orden"); });
  }catch(e){ try{ console.warn("caminata 286 guarda", e); }catch(_e){} }
}
function camOrdEnc(T, id){ return (T && Array.isArray(T.encargos))?(T.encargos.filter(function(e){ return e && e.id===id; })[0]||null):null; }
function camOrden(t, v){
  try{
    if(!t || !String(v||"").trim()) return null;
    var T=tareaId240(t.id)||t, o=CAM.ord286, ex=(o && o.tid===T.id)?camOrdEnc(T, o.id):null, key=CAM.L && CAM.L[CAM.i];
    if(ex && ex.estado!=="pendiente") ex=null;
    if(ex && (CAM.conf || (CAM.aclara && (CAM.aclara.id===T.id || CAM.aclara.id===key)) || o.no)){   /* corrección / aclaración / respuesta a «¿Lo hago?»: misma orden */
      ex.dichos286=(Array.isArray(ex.dichos286)?ex.dichos286:[]).concat([{ts:Date.now(), t:String(v).slice(0,600)}]).slice(-10);
      if(camConContenido(v)) ex.t=String((ex.t||"")+" · Luego dijo: "+v).slice(0,3000);
      camGuardaEnc(T);
      return ex;
    }
    var z=CAM.qz, q=(z && z.id===T.id && z.Q && z.Q[z.i])?String(z.Q[z.i].q||""):"";
    var e={ id:"enc283_"+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36), tipo:"orden", estado:"pendiente",
      t:String(v||"").slice(0,1500), motivo:"caminata286", por:yo||"", creado:Date.now(), origen:"app283",   /* mismo contrato que ordenPendiente (la Mac ya los lee) */
      caminata:1, origen286:"caminata", k:z?"cuestionario":(camK()||""), dicho_ts:Date.now() };
    if(q) e.pregunta=q.slice(0,300);
    T.encargos=(Array.isArray(T.encargos)?T.encargos:[]).concat([e]);
    camGuardaEnc(T);
    CAM.ord286={id:e.id, tid:T.id};
    return e;
  }catch(er){ try{ console.warn("caminata 286 orden", er); }catch(_e){} return null; }
}
/* la orden con la que se está trabajando para esta tarea (la que viaja en j._ord286 o la abierta) */
function camOrdId(t, j){ if(j && j._ord286) return j._ord286; var o=CAM.ord286; return (o && t && o.tid===t.id)?o.id:null; }
/* se aplicó algo de verdad: la orden se cierra con lo que se hizo */
function camOrdenCierra(t, id, res, estado){
  try{ if(!t || !id) return; var T=tareaId240(t.id)||t, e=camOrdEnc(T, id); if(!e || e.estado!=="pendiente") return;
    e.estado=estado||"hecho"; e.hecho_ts=Date.now(); e.resultado=String(res||"").slice(0,400); e.por286="app";
    if(CAM.ord286 && CAM.ord286.id===id) CAM.ord286=null;
    camGuardaEnc(T);
  }catch(er){ try{ console.warn("caminata 286 cierra", er); }catch(_e){} }
}
/* NO se aplicó (o solo quedó una nota): sigue pendiente para la Mac, con su motivo */
function camOrdenSigue(t, id, campos){
  try{ if(!t || !id) return; var T=tareaId240(t.id)||t, e=camOrdEnc(T, id); if(!e || e.estado!=="pendiente") return;
    for(var k in (campos||{})) if(campos[k]!=null && campos[k]!=="") e[k]=campos[k];
    e.motivos286=(Array.isArray(e.motivos286)?e.motivos286:[]).concat([String((campos||{}).motivo||"")]).filter(Boolean).slice(-6);
    camGuardaEnc(T);
  }catch(er){ try{ console.warn("caminata 286 sigue", er); }catch(_e){} }
}
/* la respuesta dictada va al hilo como mensaje de Salvador (nota para Claude, la procesa la Mac) */
function camGuarda(t, v){
  var d=null; try{ d=decision273(t); }catch(e){}
  if(d && contestaDecision(t, v)){ var m0=t.msgs[t.msgs.length-1]; if(m0){ m0.caminata274=1; m0.dictado=1; } guarda(t); }
  else {
    msg(t,"bo",v); var m=t.msgs[t.msgs.length-1]; m.de=yo; m.canal="priv:"+yo; m.nota_claude=1; m.caminata274=1; m.dictado=1;
    t.notas_claude=(t.notas_claude||[]).concat([{t:"Caminata (dictado de "+((PERSONAS[yo]||{}).nombre||yo)+"): "+v, ts:Date.now()}]).slice(-30);
    try{ t.ultima=((PERSONAS[yo]||{}).nombre||"")+": "+v; }catch(e){}
    try{ hist240("Contestó en caminata: "+v, t, null); }catch(e){}
    guarda(t);
  }
  CAM.anotadas=(CAM.anotadas||0)+1;
}
/* ===== hotfix 276 (Salvador 7-oct, caminata 07:00): contestó 4-5 cosas y solo 1 llegó a la base.
   Huecos: (a) el cuestionario guardaba las respuestas SOLO en memoria (CAM.qz.A) hasta la última pregunta: si iOS
   suspendía o cerraba la app a media tanda, se perdían; (b) si la IA lo leía como "después" o "detalle", o como
   vincular / aprobar una tarea nueva / dato, lo que dijo no se escribía en ningún lado aunque la voz dijera "Anotado".
   Ahora: (1) cada cosa que dice se escribe en la tarea al instante (caminata_dichos, crudo, con la pregunta);
   (2) al esconderse la app, lo contestado del cuestionario se aplica; (3) en después / vincular / aprobar nueva / dato,
   si dijo algo con contenido, va como nota para Claude. ===== */
function camCrudo(t, v){
  try{ if(!t || !String(v||"").trim()) return; var T=tareaId240(t.id)||t, z=CAM.qz, q="";
    if(z && z.id===T.id && z.Q && z.Q[z.i]) q=String(z.Q[z.i].q||"");
    T.caminata_dichos=(T.caminata_dichos||[]).concat([{ts:Date.now(), de:yo, t:String(v).slice(0,2000), k:camK()||"", q:q}]).slice(-60);
    if(esEjemplo(T) || !db) return;
    /* solo este campo (merge): no toca nombre ni nada más; sin red queda en la cola de Firestore y sube sola */
    datosTareas.guardarCampos(T.id, {caminata_dichos:limpiaUndef(T.caminata_dichos)})
      .catch(function(e){ try{ console.error("caminata crudo", e); }catch(_e){} toast("No se pudo guardar lo que dijiste"); });
  }catch(e){ try{ console.warn("caminata crudo", e); }catch(_e){} }
}
function camConContenido(v){ var s=_camNv(v); return !!s && s.split(" ").length>=4; }
function camNota(t, v, pre){
  try{ if(!t || !camConContenido(v)) return; var T=tareaId240(t.id)||t;
    msg(T,"bo",v); var m=T.msgs[T.msgs.length-1]; m.de=yo; m.canal="priv:"+yo; m.nota_claude=1; m.caminata274=1; m.dictado=1;
    T.notas_claude=(T.notas_claude||[]).concat([{t:"Caminata ("+(pre||"dictado")+" de "+((PERSONAS[yo]||{}).nombre||yo)+"): "+v, ts:Date.now()}]).slice(-30);
    guarda(T);
  }catch(e){ try{ console.warn("caminata nota", e); }catch(_e){} }
}
function camQuizFlush(){
  var z=CAM.qz; if(!z || !z.A || !z.A.length) return;
  var A=z.A; z.A=[]; z.aplicadas=(z.aplicadas||[]).concat(A);
  try{ camAplicaQuiz(tareaId240(z.id), A); }catch(e){ try{ console.warn("caminata flush", e); }catch(_e){} }
}
window.addEventListener("pagehide", function(){ try{ if(CAM.on) camQuizFlush(); }catch(e){} });
function camTarea(){ var id=CAM.L[CAM.i]; if(String(id||"").indexOf("msg:")===0){ var gr=(CAM.mg||{})[id]; id=gr?gr.t.id:""; }   /* build 276: un mensaje por acomodar vive en una tarea */
  return (tareas||[]).filter(function(x){ return x.id===id; })[0]||null; }
function camHaz274(c){
  if(c==="entendiste" && (CAM.buf||"").trim() && !CAM.conf){ CAM.confSig277=true; return camEnvia(); }   /* build 277: «…¿entendiste bien?» al final de una orden = confírmamela antes */
  camCallaMic(); CAM.buf=""; CAM.par="";
  if(camHaz277(c)) return;   /* build 277: confirmación pendiente · regresa un poco · ¿entendiste? */
  if(camHaz276(c)) return;   /* build 276: lo último · espera · a ver voy · sigue · cuestionario · mensajes */
  if(c==="repite") return camPresenta(true);
  if(c==="detalle"){ var t=camTarea(); if(!t) return camSiguiente(1);
    return camDi(camDetalle275(t).concat([{v:"A", t:camVar("cierra", ["¿Qué hacemos?","¿Cómo la ves?","Tú dime."])}]), function(){ camEscucha("resp"); }); }
  if(c==="despues") return camDi([{v:"A", t:camVar("despues", ["Va, la dejamos para después.","Sale, luego la vemos.","Va, para después."])}], function(){ camSiguiente(1); });
  if(c==="deshaz") return CAM.ult ? camDeshaz() : camSiguiente(-1);
  if(c==="siguiente") return camSiguiente(1);
  if(c==="atras") return camSiguiente(-1);
  if(c==="pausa") return camPausa(true);
  if(c==="salir") return camSal(true);
}
function camPresenta(repite){
  var t=camTarea(); if(!t) return camSiguiente(1);
  CAM.qz=null; CAM.espera276=false; CAM.conf=null;
  var _k6=camK(); if(_k6==="msg") return camMsgPresenta(!!repite); if(_k6==="fal") return camFalPresenta(!!repite);
  CAM.limpia=true; CAM.vacioDicho=false; CAM.aclara=null; camPinta();
  camGuion275(t, !!repite, function(G){   /* build 275: por tipo (decisión · llamada con su guion · tarea nueva), sin menú */
    if(camTarea()!==t || !CAM.on) return;
    if(!CAM.explicado){ CAM.explicado=true; G.push({v:"A", t:"Contéstame como quieras. Cuando acabes, di terminé."}); }
    G.push({v:"A", t:camVar("cierra"+(CAM.g[t.id]||""), CAM.g[t.id]==="nue"?["¿Qué hacemos con ella?","¿Qué hacemos?","¿Cómo la ves?"]:["¿Qué hacemos?","¿Cómo la ves?","¿Qué decides?"])});
    camDi(G, function(){ camEscucha("resp"); });
  });
}
function camSiguiente(dir){
  camCallaMic(); CAM.conf=null;
  var j=CAM.i+dir;
  while(j>=0 && j<CAM.L.length && !camSigue(CAM.L[j])) j+=dir>=0?1:-1;   /* build 275: las tareas nuevas (propuestas) también cuentan */
  if(j<0){ CAM.i=0; return camDi([{v:"A", t:"Esta es la primera."}], function(){ camPresenta(); }); }
  if(j>=CAM.L.length){ CAM.i=CAM.L.length-1; return camDi([{v:"A", t:camFin()}], function(){ camSal(false); }); }   /* build 276: "Bandeja limpia." o "Quedaron N pendientes: …" */
  CAM.i=j; camPresenta();
}
function camPausa(dicho){
  if(!CAM.on) return;
  if(CAM.pausa){ CAM.pausa=false; camPinta(); return camPresenta(); }
  CAM.pausa=true; camCallaMic(); CAM.tok++; camPiensa(false); try{ speechSynthesis.cancel(); }catch(e){} CAM.fase=""; camPinta();
  if(dicho){ try{ var u=new SpeechSynthesisUtterance("En pausa."); u.lang="es-MX"; var V=camVoces(), va=null; try{ va=vozRota(null); }catch(e){} va=va||V.A; if(va){ u.voice=va; u.lang=va.lang||"es-MX"; } speechSynthesis.speak(u); }catch(e){} }
}
function camEmpieza(desdeId){
  if(CAM.on) return;
  try{ if(typeof leePara==="function" && (LEE.act||LEE.charla)) leePara(); }catch(e){}
  if(!window.speechSynthesis){ toast("Este teléfono no lee en voz alta"); return; }
  var C=camLista276(), L=C.L;   /* build 276: + ficha Falta y mensajes por acomodar */
  CAM.mg=C.mg||{}; CAM.res276={}; CAM.pendQ=[]; CAM.qz=null; CAM.rest=null; CAM.habla276=[]; CAM.espera276=false; CAM.bargeNo=false;
  if(desdeId){ L=L.filter(function(x){ return x!==desdeId; }); L.unshift(desdeId); if(!C.g[desdeId]){ C.g[desdeId]="dec"; C.n.dec++; } }
  CAM.on=true; CAM.L=L; CAM.g=C.g; CAM.i=0; CAM.pausa=false; CAM.explicado=!!window.__camExplicado274; CAM.buf=""; CAM.par=""; CAM.anotadas=0; CAM.hechas275=0; CAM.ult=null; CAM.aclara=null; CAM.sinMic=false; CAM.gl=CAM.gl||{}; CAM.conf=null; CAM.pideConf277=false; CAM.confSig277=false;
  window.__camExplicado274=true;   /* "di terminé" se explica una vez por sesión de la app */
  camAudio();   /* build 275: el sonido de "pensando" se desbloquea con este toque (iOS) */
  camMedidor();   /* build 276: medidor de volumen (getUserMedia con echoCancellation), pedido dentro del toque */
  L.forEach(function(id){ if(C.g[id]==="lla"){ var t=tareaId240(id); if(t) camPideGuion(t); } });   /* los guiones se piden desde ya, en paralelo */
  camAbreUI(); camWake(true);
  if(!L.length) return camDi([{v:"A", t:"No tienes pendientes para la caminata. Buen día."}], function(){ camSal(false); });
  camDi([{v:"A", t:camResumen(C.n)}], function(){ camPresenta(); });
}
function camSal(dicho){
  camCallaMic(); camBargeCierra(); CAM.tok++; clearTimeout(CAM.wd); camPiensa(false);
  try{ if(CAM.qz && CAM.qz.A.length) camAplicaQuiz(tareaId240(CAM.qz.id), CAM.qz.A); }catch(e){} CAM.qz=null;   /* build 276: lo contestado no se pierde */
  camMedidorApaga();
  try{ speechSynthesis.cancel(); }catch(e){}
  if(dicho){ try{ var u=new SpeechSynthesisUtterance("Listo, salimos de la caminata."); u.lang="es-MX"; var V=camVoces(), va=null; try{ va=vozRota(null); }catch(e){} va=va||V.A; if(va){ u.voice=va; u.lang=va.lang||"es-MX"; } speechSynthesis.speak(u); }catch(e){} }
  CAM.on=false; CAM.pausa=false; CAM.fase=""; CAM.conf=null; CAM.pideConf277=false; CAM.confSig277=false;
  camWake(false);
  var o=document.getElementById("cam274"); if(o) o.remove();
  document.documentElement.classList.remove("cam274on");
  try{ render(); }catch(e){}
}
/* pantalla encendida mientras corre (Wake Lock; iOS 16.4+; en PWA instalada desde iOS 18.4) */
function camWake(on){
  try{
    if(on && navigator.wakeLock && navigator.wakeLock.request){ navigator.wakeLock.request("screen").then(function(w){ CAM.wl=w; }).catch(function(){}); }
    if(!on && CAM.wl){ CAM.wl.release().catch(function(){}); CAM.wl=null; }
  }catch(e){}
}
document.addEventListener("visibilitychange", function(){
  if(!CAM.on) return;
  if(document.visibilityState==="hidden"){ camQuizFlush(); return; }   /* hotfix 276: iOS puede matar la app escondida */
  if(document.visibilityState==="visible"){ camWake(true); if(CAM.fase==="escuchando" && !CAM.oye) camEscucha(CAM.modo||"resp"); }
});
/* ---------- pantalla mínima ---------- */
function camAbreUI(){
  var o=document.getElementById("cam274"); if(o) o.remove();
  o=document.createElement("div"); o.id="cam274"; o.className="cam274"; o.setAttribute("role","dialog"); o.setAttribute("aria-label","Caminata");
  o.innerHTML='<div class="c274top"><span id="c274n"></span><button id="c274x" aria-label="Salir de la caminata">✕</button></div>'+
    '<h2 id="c274tit"></h2>'+
    '<div class="c274mid"><div id="c274o" class="c274o" aria-hidden="true"><i></i><i></i><i></i></div><p id="c274st" aria-live="polite"></p><p id="c274oy"></p></div>'+
    '<div class="c274bt"><button id="c274p" class="c274big">Pausa</button><button id="c274s" class="c274big sig">Siguiente</button></div>';
  document.body.appendChild(o); document.documentElement.classList.add("cam274on");
  document.getElementById("c274x").onclick=function(){ camSal(false); };
  document.getElementById("c274p").onclick=function(){ camPausa(false); };
  document.getElementById("c274s").onclick=function(){ CAM.pausa=false; camHaz274("siguiente"); };
  document.getElementById("c274o").onclick=camToca; document.getElementById("c274tit").onclick=camToca;   /* build 276: tocar = interrumpir */
  camPinta();
}
function camPinta(){
  var o=document.getElementById("cam274"); if(!o) return;
  var t=camTarea(), n=CAM.L.length;
  var s=function(id, x){ var e=document.getElementById(id); if(e && e.textContent!==x) e.textContent=x; };
  s("c274n", n?("Caminata · "+Math.min(CAM.i+1,n)+" de "+n):"Caminata");
  var _gr6=camK()==="msg"?(CAM.mg||{})[CAM.L[CAM.i]]:null;
  s("c274tit", _gr6?("Mensaje de "+(_gr6.contacto||"contacto")):(t?(t.nombre||"Sin nombre"):""));
  var est=CAM.pausa?"En pausa":(CAM.fase==="pensando"?"Pensando…":CAM.fase==="hablando"?(CAM.voz==="B"?"Analista":"Doit"):(CAM.fase==="escuchando"?(CAM.sinMic?"Sin micrófono: usa los botones":(CAM.modo==="check"?"¿Terminaste o sigues?":(CAM.qz?"Pregunta "+Math.min(CAM.qz.i+1,CAM.qz.Q.length)+" de "+CAM.qz.Q.length+" · di «paso» si no sabes":"Te escucho · di «terminé» al acabar"))):""));
  s("c274st", est);
  s("c274oy", CAM.fase==="escuchando"?camCorta((CAM.buf+" "+CAM.par).trim(), 160):"");
  var c=document.getElementById("c274o"); if(c) c.className="c274o"+(CAM.pausa?" pausa":(CAM.fase==="pensando"?" piensa":CAM.fase==="hablando"?" habla"+(CAM.voz==="B"?" vb":""):(CAM.fase==="escuchando"?" oye":"")));
  s("c274p", CAM.pausa?"Seguir":"Pausa");
}
function bindCam(){ var b=document.getElementById("bcam274"); if(b) b.onclick=function(){ camEmpieza(); }; }

/* ===================== build 275 (Salvador 7-oct): CAMINATA COMO PLÁTICA CON UN ASISTENTE =====================
   Sobre el 274. Que se sienta como platicar con un asistente real, no como VoiceOver.
   1 ORDEN: (1) lo del home que requiere su decisión (decisiones y "Te pregunta Doit") · (2) llamadas de MAÑANA, cada una con su
     guion ("IA: Guion de llamada", se pide a la IA al arrancar, en paralelo, y queda en el hilo) · (3) tareas NUEVAS de Acomodo.
     Al empezar, una sola frase: "Tienes 4 decisiones, 3 llamadas para mañana y 2 tareas nuevas. Empezamos."
   2 NADA DE MENÚS: se plantea el tema y la recomendación y se pregunta abierto ("¿Qué hacemos?"). Lo que él diga, como lo diga,
     va a la IA (sin palabras clave). VÍA: el mismo proxy del servidor (claude.php vía preguntaAClaude) que usa el composer "para
     Claude", pero en modo "rapido" (no "pesado") y sin pasar por la Mac: es la vía más rápida que hay. Se pide un JSON corto
     {accion: aprobar|rechazar|detalle|despues|vincular|eliminar|dato|instruccion|aclarar, destino, texto_para_tarea, respuesta_hablada}.
     Mientras responde suena un "pensando" suave (WebAudio), nada de silencio. Si la IA no contesta en 12 s, NO se pierde:
     queda anotado en la tarea como nota para Claude (la Mac lo procesa) y se dice.
   3 SIN RECONFIRMAR: se ejecuta y se confirma en 3-4 palabras ("Listo, va con Rubén.") y sigue. Solo si de verdad no entendió,
     UNA pregunta concreta (accion "aclarar"). "No, eso no" / "regrésate" deshace la última acción y vuelve a esa tarea.
   4 Tono de amigo: frases cortas y variadas; las dos voces del 274.
   5 Escucha del 274 intacta; además "va", "sí", "dale"… dichos solos se envían al instante. */
var CAM_IA_MS=12000, CAM_GUION_ESPERA=6000;
CAM.g={}; CAM.gl={};
var CAM_CORTO=/^(va|si|sale|dale|ok|okey|orale|andale|claro|de acuerdo|perfecto|esta bien|va que va|si va|si dale|si si|hazlo|adelante con eso)$/;
function _camManiana(){ var d=new Date(hoy()+"T12:00:00"); d.setDate(d.getDate()+1); return iso(d); }
/* frases variadas: no repite la última de cada tipo */
function camVar(k, L){ CAM.uv=CAM.uv||{}; var i=Math.floor(Math.random()*L.length); if(L.length>1 && L[i]===CAM.uv[k]) i=(i+1)%L.length; CAM.uv[k]=L[i]; return L[i]; }
/* la lista: {L:[ids], g:{id:"dec"|"lla"|"nue"}, n:{dec, lla, nue}} */
function camLista275(){
  var H=window.__H274||{preg:[], venc:[], hoy:[]}, ya={}, g={}, G={dec:[], lla:[], nue:[]}, m=_camManiana();
  var pon=function(k, t){ if(!t || ya[t.id]) return; var ok=false; try{ ok=(k==="nue")?esPropuesta(t):_camVivo(t); }catch(e){} if(!ok) return; ya[t.id]=1; g[t.id]=k; G[k].push(t.id); };
  (tareas||[]).forEach(function(t){ var d=null, ds=false; try{ d=decision273(t); }catch(e){} try{ ds=esDecisionSal(t); }catch(e){} if(d || ds) pon("dec", t); });
  (H.preg||[]).forEach(function(x){ pon("dec", x && x.t); });
  (tareas||[]).forEach(function(t){ if(t && t.f_vigente===m && (t.duenio===yo || !t.duenio) && esLlamada(t)) pon("lla", t); });
  var P=[]; try{ P=propuestas256(); }catch(e){} P.forEach(function(t){ pon("nue", t); });
  return {L:G.dec.concat(G.lla, G.nue), g:g, n:{dec:G.dec.length, lla:G.lla.length, nue:G.nue.length}};
}
function camResumen(n){
  var P=[];
  if(n.dec) P.push(n.dec+(n.dec===1?" decisión":" decisiones"));
  if(n.lla) P.push(n.lla+(n.lla===1?" llamada":" llamadas")+" para mañana");
  if(n.nue) P.push(n.nue+(n.nue===1?" tarea nueva":" tareas nuevas"));
  if(n.fal) P.push(n.fal+(n.fal===1?" con datos que faltan":" con datos que faltan"));
  if(n.msg) P.push(n.msg+(n.msg===1?" mensaje por acomodar":" mensajes por acomodar"));
  return P.length?"Tienes "+juntaY(P)+". Empezamos.":"No tienes pendientes para la caminata.";
}
/* ---------- el guion de cada tarea ---------- */
function camGuion275(t, repite, cb){
  var k=CAM.g[t.id]||"dec", G=[], pos=CAM.i, n=CAM.L.length, nom=camNombre(t), prevK=pos>0?CAM.g[CAM.L[pos-1]]:"";
  if(repite) G.push({v:"A", t:camVar("otra", ["Otra vez: ","De nuevo: "])+nom+"."});
  else {
    if(pos>0 && k!==prevK) G.push({v:"A", t:k==="lla"?camVar("gl", ["Ahora las llamadas de mañana.","Vamos con las llamadas de mañana."]):(k==="nue"?camVar("gn", ["Y ahora las tareas nuevas.","Ahora, las tareas nuevas."]):"Ahora lo que te toca decidir.")});
    var ab=(k==="lla")?["Llamada: ","Le toca a: ","Sigue la llamada: "]:(k==="nue")?["Tarea nueva: ","Llegó esta: ","Nueva: "]:["Sigue: ","Ahora: ","Otra: "];
    G.push({v:"A", t:(pos===0 && k!=="lla" && k!=="nue"?"Primera: ":(pos===n-1 && n>1?"La última: ":camVar("ab"+k, ab)))+nom+"."});
  }
  if(k==="nue"){ camOrigen(t).forEach(function(x){ G.push(x); }); return cb(G); }
  if(k==="lla"){
    return camEsperaGuion(t, function(txt){
      var F=txt?camFrases(txt, 4):[];
      if(F.length){ G.push({v:"B", t:"Guion de llamada."}); F.forEach(function(x){ G.push({v:"B", t:camPunto(x)}); }); }
      else { G.push({v:"B", t:"No tengo guion todavía."}); camGuion274(t, 0, 1).slice(1, 3).forEach(function(x){ G.push(x); }); }
      cb(G); });
  }
  camGuion274(t, 0, 1).slice(1).forEach(function(x){ G.push(x); });
  cb(G);
}
/* tarea nueva: de dónde llegó y por qué se propuso (solo con lo que hay) */
function camOrigen(t){
  var G=[], og=null; try{ og=origenProp(t); }catch(e){} if(!og) return [{v:"B", t:"No tengo más contexto de esta tarea."}];
  G.push({v:"B", t:og.canal==="Dictado"?"La dictaste tú.":camPunto("Llegó por "+og.canal+(og.quien && og.quien!=="la IA"?" de "+limpiaHabla(og.quien):""))});
  var f=(og.frase||[])[0]; if(f){ var ff=camFrases(f, 1)[0]; if(ff) G.push({v:"B", t:camPunto("Dice: "+ff)}); }
  if(og.porque && !/^La IA detectó un pendiente/.test(og.porque)){ var pq=camFrases(og.porque, 1)[0]; if(pq) G.push({v:"B", t:camPunto(pq)}); }
  return G;
}
function camDetalle275(t){
  if((CAM.g[t.id]||"")==="nue") return camOrigen(t).concat(camDetalle274(t).filter(function(x){ return !/^No tengo más detalle/.test(x.t); }));
  return camDetalle274(t);
}
/* ---------- guion de llamada: del hilo o del campo; si no hay, lo escribe la IA y queda en el hilo como "IA: Guion de llamada: …" ---------- */
function camGuionHay(t){
  var g=t && t.guion_llamada; if(g && typeof g==="object") g=g.t; if(g && String(g).trim()) return String(g).trim();
  var ms=(t && t.msgs)||[]; for(var i=ms.length-1;i>=0;i--){ var x=ms[i]; var m=x && String(x.t||"").match(/^\s*(?:📝\s*)?(?:Nota\s+)?IA:\s*Guion de llamada:\s*([\s\S]+)$/i); if(m) return m[1].trim(); }
  return "";
}
function camDatos(t){
  var L=[];
  var R=(t.resumen && typeof t.resumen==="object")?t.resumen:{}; if(R.texto) L.push("RESUMEN: "+String(R.texto).slice(0,600));
  var cx=""; try{ cx=contextoDe(t); }catch(e){} if(cx) L.push("CONTEXTO: "+String(cx).slice(0,600));
  try{ var v=vamos273(t); if(v && v.tx) L.push("EN QUÉ VAMOS: "+v.tx+(v.quien?" ("+v.quien+")":"")); }catch(e){}
  try{ var S=sabemos273(t); if(S.length) L.push("LO QUE SABEMOS: "+S.slice(0,6).map(function(x){ return x.t; }).join(" | ")); }catch(e){}
  var ms=(t.msgs||[]).filter(function(x){ return x && String(x.t||"").trim() && !x.oculto && !x.eliminado; }).slice(-6);
  if(ms.length) L.push("ÚLTIMOS MENSAJES:\n"+ms.map(function(x){ return "- "+String(x.t).replace(/\s+/g," ").slice(0,220); }).join("\n"));
  return L.join("\n");
}
function camPideGuion(t){
  CAM.gl=CAM.gl||{}; var hay=camGuionHay(t); if(hay){ CAM.gl[t.id]={st:"listo", txt:hay, cbs:[]}; return; }
  if(CAM.gl[t.id] && CAM.gl[t.id].st==="pide") return;
  var E=CAM.gl[t.id]={st:"pide", txt:"", cbs:[]}, t0=Date.now();
  var P="Eres Doit, el asistente de Salvador. Mañana él tiene que hacer esta llamada y va a oír el guion caminando.\n"+
    "Escribe un GUION DE LLAMADA muy corto: 3 o 4 frases cortas, en segunda persona (para qué llama, qué decir, qué preguntar, qué dejar acordado).\n"+
    "Usa SOLO estos datos; si falta algo, no lo inventes. Sin listas, sin markdown, sin ligas.\n"+
    "TAREA: "+String(t.nombre||"")+"\n"+camDatos(t)+"\n"+
    "Contesta SOLO JSON: {\"guion\":\"...\"}";
  var fin=function(txt){ if(E.st!=="pide") return; E.st=txt?"listo":"falla"; E.txt=txt||""; E.ms=Date.now()-t0; camLat("guion", E.ms, !!txt);
    if(txt){ try{ var T=tareaId240(t.id)||t; msg(T,"bi","IA: Guion de llamada: "+txt); var m=T.msgs[T.msgs.length-1]; m.nota_ia=1; m.priv=1; m.canal="priv:"+yo; m.caminata275=1;
      T.guion_llamada={t:txt, ts:Date.now(), por:"ia"}; guarda(T); }catch(e){ console.warn("guion 275", e); } }
    var c=E.cbs; E.cbs=[]; c.forEach(function(f){ try{ f(E.txt); }catch(e){} }); };
  var to=setTimeout(function(){ fin(""); }, CAM_IA_MS);
  try{ preguntaAClaude([{role:"user", content:P}], "rapido", function(txt, err){ clearTimeout(to); if(err){ console.warn("guion 275", err); return fin(""); }
    var j=_camJSON(txt), g=j && String(j.guion||"").replace(/\s+/g," ").trim(); fin(g && !_camCodigo(g)?g:""); }); }catch(e){ clearTimeout(to); fin(""); }
}
function camEsperaGuion(t, cb){
  CAM.gl=CAM.gl||{}; if(!CAM.gl[t.id]) camPideGuion(t);
  var E=CAM.gl[t.id]; if(E.st!=="pide") return cb(E.txt);
  var tok=CAM.tok, listo=false;
  CAM.fase="pensando"; camPinta(); camPiensa(true);
  var sal=function(txt){ if(listo) return; listo=true; clearTimeout(w); camPiensa(false); if(tok!==CAM.tok || !CAM.on) return; CAM.fase=""; cb(txt); };
  var w=setTimeout(function(){ sal(""); }, CAM_GUION_ESPERA);
  E.cbs.push(sal);
}
function _camJSON(txt){ try{ return JSON.parse(String(txt||"").replace(/^[^{]*/,"").replace(/[^}]*$/,"")); }catch(e){ return null; } }
/* latencias medidas (ms) de la IA en esta sesión de la app: window.__lat275 */
function camLat(k, ms, ok){ window.__lat275=(window.__lat275||[]).concat([{k:k, ms:ms, ok:!!ok, ts:Date.now()}]).slice(-50); try{ console.info("caminata IA "+k+": "+ms+" ms"+(ok?"":" (falló)")); }catch(e){} }
/* ---------- el sonido de "pensando": dos notas suaves que se alternan, muy bajito ---------- */
function camAudio(){ try{ var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return null; if(!CAM.ac) CAM.ac=new AC(); if(CAM.ac.state==="suspended" && CAM.ac.resume) CAM.ac.resume(); return CAM.ac; }catch(e){ return null; } }
function camPiensa(on){
  clearInterval(CAM.tPi); CAM.tPi=null;
  if(!on){ CAM.pensando=false; return; }
  CAM.pensando=true; window.__piensa275=(window.__piensa275||0)+1;
  var ac=camAudio(); if(!ac) return;
  var k=0, toca=function(){ try{ var o=ac.createOscillator(), g=ac.createGain(), t0=ac.currentTime;
    o.type="sine"; o.frequency.setValueAtTime((k++%2)?523.25:659.25, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.05, t0+0.08); g.gain.exponentialRampToValueAtTime(0.0001, t0+0.5);
    o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0+0.55); }catch(e){} };
  toca(); CAM.tPi=setInterval(toca, 750);
}
/* ---------- lo que dijo -> IA -> acción ---------- */
function camCandidatas(t){
  return (tareas||[]).filter(function(x){ return x && x!==t && x.id!==t.id && !x.es_recordatorio && _camVivo(x); })
    .sort(function(a, b){ return (b.ultimo_ts||b.tocada||0)-(a.ultimo_ts||a.tocada||0); }).slice(0, 60);
}
function camPrompt(t, v){
  var k=CAM.g[t.id]||"dec", L=[];
  L.push("Eres Doit, el asistente de Salvador. Van caminando y él te contesta por voz: viene dictado, puede ser impreciso o traer errores de transcripción. Entiende lo que QUIERE y conviértelo en UNA acción. No busques palabras clave: entiende la intención.");
  L.push("TIPO: "+(k==="lla"?"llamada de mañana (con su guion)":(k==="nue"?"tarea NUEVA propuesta por la IA (Acomodo): él decide si va, si se vincula a otra tarea, si se elimina o si es solo un dato":"tarea que requiere su decisión")));
  L.push("TAREA: "+String(t.nombre||""));
  try{ var _o8=nombres278(t).slice(1); L.push("ESTA TAREA: id "+t.id+(_o8.length?" · también se llama: "+_o8.join(" | "):"")); }catch(e){}
  var d=null; try{ d=decision273(t); }catch(e){}
  if(d){ if(d.pregunta) L.push("PREGUNTA: "+d.pregunta); if(d.recomendacion) L.push("RECOMENDACIÓN: "+d.recomendacion);
    if(d.opciones.length) L.push("OPCIONES: "+d.opciones.map(function(o){ return o.nombre+(o.precio?" ("+o.precio+")":""); }).join(" | ")); }
  else { try{ var Q=preguntas249(t); if(Q.length && Q[0].q) L.push("PREGUNTA: "+Q[0].q); }catch(e){} if(t.pendiente_info) L.push("PENDIENTE: "+t.pendiente_info); }
  if(k==="lla"){ var g=(CAM.gl&&CAM.gl[t.id]&&CAM.gl[t.id].txt)||camGuionHay(t); if(g) L.push("GUION: "+g); }
  if(k==="nue"){ try{ var og=origenProp(t); L.push("ORIGEN: "+og.canal+" · "+og.quien+(og.frase.length?" · "+og.frase.join(" ").slice(0,300):"")); }catch(e){} }
  var R=(t.resumen && typeof t.resumen==="object")?t.resumen:{}; if(R.texto) L.push("RESUMEN: "+String(R.texto).slice(0,400));
  L.push("TAREAS ABIERTAS (para vincular; destino = el id):\n"+camCandidatas(t).map(function(x){ var o8=[]; try{ o8=nombres278(x).slice(1,4); }catch(e){} return x.id+" · "+String(x.nombre||"").slice(0,80)+(o8.length?" (también: "+o8.join(" | ").slice(0,80)+")":""); }).join("\n"));
  L.push(CAM_PROMPT278);
  L.push("LO QUE DIJO: “"+v+"”");
  L.push("ACCIONES:\n- aprobar: está de acuerdo (con la recomendación, con la tarea nueva, con el guion).\n- rechazar: no se hace / no está de acuerdo.\n- detalle: pide más información.\n- despues: la deja para después.\n- vincular: va junto con otra tarea; destino = el id de esa tarea de la lista.\n- eliminar: borrarla, no sirve.\n- dato: no es tarea, solo un dato para guardar.\n- instruccion: da una indicación, elige otra opción o pide algo concreto (\"dile a Rubén que…\", \"que sea el jueves\").\n- aclarar: SOLO si de verdad no se entiende; respuesta_hablada = UNA pregunta concreta y corta.");
  L.push("texto_para_tarea: lo que queda anotado en la tarea, claro y completo, con su decisión (ej. \"Va con la de Dahua.\", \"Que la llamada sea el jueves a las 10.\").\nrespuesta_hablada: confirmación de 2 a 5 palabras, natural, como un amigo (ej. \"Listo, va con Rubén.\", \"Hecho, la junté.\", \"Va, queda como dato.\"). Nunca pidas confirmación ni repitas la pregunta.");
  L.push(CAM_PROMPT277);   /* build 277: deshacer · pide_confirmar */
  L.push("Contesta SOLO JSON: {\"accion\":\"...\",\"destino\":\"\",\"texto_para_tarea\":\"...\",\"respuesta_hablada\":\"...\",\"pide_confirmar\":false}");
  return L.join("\n");
}
function camEntiende(t, v){
  if(CAM.aclara && CAM.aclara.id===t.id) v=CAM.aclara.v+". "+v;   /* contesta la aclaración: va junto con lo de antes */
  CAM.aclara=null;
  var tok=++CAM.tok, t0=Date.now(), listo=false, ord=camOrdId(t, null);
  try{ speechSynthesis.cancel(); }catch(e){}
  CAM.fase="pensando"; CAM.oyeTx=v; camPinta(); camPiensa(true);
  var fin=function(j, err){ if(listo) return; listo=true; clearTimeout(to); camPiensa(false); camLat("decide", Date.now()-t0, !!j);
    var vivo=(tok===CAM.tok && CAM.on);
    if(j && ord) j._ord286=ord;
    if(!j){   /* la IA no contestó: no se pierde, queda como nota para Claude */
      camOrdenSigue(t, ord, {motivo:"ia_sin_respuesta"});   /* build 286: la orden sigue viva para la Mac */
      var u=camFoto([t]); try{ camGuarda(t, v); }catch(e){ console.warn("caminata guarda", e); } CAM.ult={foto:u, i:CAM.L.indexOf(t.id), desc:"anotar para Claude lo que dijiste"}; try{ ultRegistra(CAM.ult, CAM.ult.desc); }catch(e){} CAM.hechas275=(CAM.hechas275||0)+1; CAM.res276=CAM.res276||{}; CAM.res276[t.id]=1;
      try{ console.warn("caminata 275: IA sin respuesta", err); }catch(e){}
      if(!vivo) return; CAM.fase="";
      return camDi([{v:"A", t:"No me contestó la IA. Lo dejé anotado para Claude."}], function(){ camSiguiente(1); });
    }
    camResuelve(t, j, v, vivo); };
  var to=setTimeout(function(){ fin(null, "tiempo"); }, CAM_IA_MS);
  try{ preguntaAClaude([{role:"user", content:camPrompt(t, v)}], "rapido", function(txt, err){ if(err) return fin(null, err); var j=_camJSON(txt); fin(j && j.accion?j:null, j?"":"sin JSON"); }); }
  catch(e){ fin(null, e && e.message); }
}
var CAM_ACC=/^(aprobar|rechazar|detalle|despues|vincular|eliminar|dato|instruccion|aclarar|deshacer)$/;   /* build 277: + deshacer */
function camResuelve(t, j, v, vivo, confirmado){
  var a=_camNv(j.accion).replace(/\s+/g,""); if(!CAM_ACC.test(a)) a="instruccion";
  var dh=String(j.respuesta_hablada||"").replace(/\s+/g," ").trim(), ord=camOrdId(t, j);
  if(a==="deshacer"){ camOrdenCierra(t, ord, "pidió deshacer lo anterior", "hecho"); CAM.pideConf277=false; if(vivo){ CAM.fase=""; camHaz274("deshaz"); } return; }   /* build 277: «no, esa no era» lo entiende la IA */
  var fv=null; try{ fv=camFiltraVinc(t, a, j, v); }catch(e){ console.warn("caminata 278", e); }   /* build 278: su corrección y su «no tiene que ver» mandan */
  if(fv){
    if(fv.a==="no_vincular") return camNoVincula(t, fv, v, vivo);
    if(fv.misma){ try{ rechazaVinc(t, null, "Salvador, caminata"); }catch(e){} }
    if(fv.a==="vincular" && fv.dest && (fv.corr || a==="vincular")){ var j2={}; for(var _k8 in j) j2[_k8]=j[_k8]; j2.destino=fv.dest.id; j=j2; a="vincular"; }
    if(fv.conf && !confirmado && fv.dest){ CAM.pideConf277=false; if(!vivo) return; CAM.fase=""; return camConfPide({k:"tarea", id:CAM.L[CAM.i], t:t, j:j, v:v, a:"vincular", desc:camDescribe(t, "vincular", j, fv.dest)}); }
  }
  if(!confirmado && a!=="aclarar" && a!=="detalle" && a!=="despues" && (CAM.pideConf277 || j.pide_confirmar===true)){   /* build 277: repetir y esperar su sí */
    var dc=(a==="vincular")?camDestino(t, j.destino):null;
    if(a!=="vincular" || dc){ CAM.pideConf277=false; var _dsc=camDescribe(t, a, j, dc); camOrdenSigue(t, ord, {motivo:"esperando_confirmacion", entendi:_dsc, clasif:a});
      if(!vivo) return; CAM.fase=""; return camConfPide({k:"tarea", id:CAM.L[CAM.i], t:t, j:j, v:v, a:a, desc:_dsc}); }
  }
  var _d7=""; try{ _d7=camDescribe(t, a, j, a==="vincular"?camDestino(t, j.destino):null); }catch(e){}
  if(a==="aclarar"){ camOrdenSigue(t, ord, {motivo:"aclarar", pregunta_ia:dh, preguntar_despues:true});   /* build 286: «aclarar» nunca descarta la orden */
    if(!vivo) return; CAM.fase=""; CAM.aclara={id:t.id, v:v};
    return camDi([{v:"A", t:camCorta(dh && /\?/.test(dh)?dh:"¿Me lo dices de otra forma?", 140)}], function(){ camEscucha("resp"); }); }
  if(a==="detalle" || a==="despues"){ if(camConContenido(v)) camOrdenSigue(t, ord, {motivo:a, clasif:a}); else camOrdenCierra(t, ord, a==="detalle"?"pidió más detalle":"la dejó para después"); }
  if(a==="detalle"){ if(vivo){ CAM.fase=""; camHaz274("detalle"); } return; }
  if(a==="despues"){ camNota(t, v, "la dejó para después; dijo");
    if(vivo){ CAM.fase=""; camHaz274("despues"); } return; }
  var r=camEjecuta(t, a, j, v);
  try{ if(CAM.ult && ord && !r.falta) CAM.ult.ord286={id:ord, tid:t.id}; }catch(e){}
  if(r.falta) camOrdenSigue(t, ord, {motivo:"aclarar", pregunta_ia:r.falta, preguntar_despues:true});
  else if(r.soloNota) camOrdenSigue(t, ord, {motivo:"instruccion", clasif:a, texto_ia:String(j.texto_para_tarea||"").slice(0,1500), entendi:_d7});   /* trabajo: lo hace la Mac */
  else camOrdenCierra(t, ord, _d7||a);
  if(!r.falta){ CAM.pideConf277=false; if(CAM.ult){ CAM.ult.desc=_d7; try{ ultRegistra(CAM.ult, _d7); }catch(e){} } }   /* build 277: para «¿qué hiciste?» · 278: queda el ↩ en la tarea */
  if(!vivo) return; CAM.fase="";
  if(r.falta){ CAM.aclara={id:t.id, v:v}; return camDi([{v:"A", t:r.falta}], function(){ camEscucha("resp"); }); }
  var w=dh.split(" ").filter(Boolean).length, dicho=(dh && w<=8 && !/\?/.test(dh) && !_camCodigo(dh))?camPunto(dh):r.dicho;
  var _Q6=camQuizTrasAcomodar(t, a);   /* build 276: al acomodar una tarea nueva, de inmediato el cuestionario de lo que le falta */
  if(_Q6.length) return camQuizEmpieza(t, _Q6, [{v:"A", t:dicho}], {desdeNue:true});
  camDi([{v:"A", t:dicho}], function(){ camSiguiente(1); });
}
/* foto de las tareas antes de la acción, para deshacer */
function camFoto(L){ var cp=function(x){ return JSON.parse(JSON.stringify(x)); };
  return {copias:L.filter(Boolean).map(cp), p256f:L.filter(Boolean).map(function(x){ return [x.id, !!(window.__p256f||{})[x.id]]; })}; }
function camRestaura(F){
  (F.copias||[]).forEach(function(c){ var x=JSON.parse(JSON.stringify(c)), vivo=tareaId240(c.id);
    var dich=vivo && vivo.caminata_dichos;   /* build 280: deshacer NUNCA borra lo que Salvador dijo (hotfix 276, caminata_dichos solo crece) */
    if(vivo){ Object.keys(vivo).forEach(function(k){ delete vivo[k]; }); for(var k in x) vivo[k]=x[k]; if(dich) vivo.caminata_dichos=dich; } else { vivo=x; tareas.push(x); }
    guarda(vivo); });
  (F.p256f||[]).forEach(function(p){ window.__p256f=window.__p256f||{}; if(p[1]) window.__p256f[p[0]]=1; else delete window.__p256f[p[0]]; });
}
/* a qué tarea se vincula: el id que dio la IA o, si dio un nombre, la que ese nombre señala (build 278: todas las palabras de uno de
   sus nombres/sinónimos; ya no basta una palabra suelta como "inversiones"; si el nombre es el de ESTA tarea, no hay destino) */
function camDestino(t, d){
  d=String(d||"").trim(); if(!d) return null;
  var C=camCandidatas(t), x=C.filter(function(z){ return z.id===d; })[0]; if(x) return x;
  var y=resuelveNombre(d, C.concat(t?[t]:[]));
  return (y && (!t || y.id!==t.id))?y:null;
}
function camEjecuta(t, a, j, v){
  var k=CAM.g[t.id]||"dec", tx=String(j.texto_para_tarea||"").replace(/\s+/g," ").trim()||v, dest=null, nue=(k==="nue"||esPropuesta(t)), d=null; try{ d=decision273(t); }catch(e){}
  if(a==="vincular"){ dest=camDestino(t, j.destino); if(!dest) return {falta:"¿Con cuál tarea la junto?"}; }
  var F=camFoto([t, dest]), dicho="Listo.", vw={a:abierta, v:vista}, soloNota=false;   /* build 286: soloNota = solo quedó un mensaje; la orden sigue para la Mac */
  try{
    if(a==="aprobar"){ if(nue){ okProp(t); camNota(t, v); dicho=camVar("ok", ["Listo, va.","Va, quedó creada.","Hecho."]); } else if(d){ contestaDecision(t, tx); dicho=camVar("ok", ["Listo.","Va, hecho.","Perfecto, quedó."]); } else { camGuarda(t, tx); soloNota=true; dicho=camVar("ok", ["Listo.","Va, hecho."]); } }
    else if(a==="rechazar" && !nue && vincPend(t)){ rechazaVinc(t, vincPend(t), "Salvador, caminata"); camGuarda(t, tx); dicho=camVar("no", ["Va, no la junto.","Entendido, se queda aparte."]); }
    else if(a==="rechazar"){ if(nue){ descartaProp(t); dicho=camVar("no", ["Va, la quité.","Listo, fuera."]); } else if(d){ contestaDecision(t, tx); dicho=camVar("no", ["Entendido, no va.","Va, no se hace."]); } else { camGuarda(t, tx); soloNota=true; dicho="Entendido."; } }
    else if(a==="vincular"){ enlazaTareas(t.id, dest.id, "caminata"); camNota(dest, v, "al juntar «"+String(t.nombre||"")+"»; dijo"); dicho="Listo, la junté con "+camCorta(limpiaHabla(dest.nombre), 50).replace(/[.\s]+$/,"")+"."; }
    else if(a==="eliminar"){ if(nue) descartaProp(t); else { t.estado="cerrada"; t.cierre={tipo:"cancelado", motivo:"caminata", f:hoy()}; msg(t,"bi","Eliminada en la caminata: "+tx); guarda(t); try{ sincronizaAvisos(t); }catch(e){} }
      dicho=camVar("del", ["Listo, eliminada.","Hecho, la quité."]); }
    else if(a==="dato"){ t.tipo_item="dato"; t.es_dato=true; t.tipo_elegido=true; t.autorizada=true; t.autorizada_ts=Date.now(); t.por_autorizar=false; t.falta_fecha=false; guarda(t); camNota(t, v);
      try{ hist240("Caminata: como dato “"+String(t.nombre||"")+"”", t, null); }catch(e){} dicho=camVar("dato", ["Va, queda como dato.","Listo, es dato."]); }
    else { camGuarda(t, tx); soloNota=true; dicho=camVar("ins", ["Anotado.","Listo, se lo paso a Claude.","Va, hecho."]); }
  }catch(e){ console.warn("caminata 275 ejecuta", e); }
  abierta=vw.a; vista=vw.v;   /* vincular abre la tarea destino: la caminata se queda donde estaba */
  CAM.ult={foto:F, i:CAM.L.indexOf(t.id), a:a}; CAM.hechas275=(CAM.hechas275||0)+1;
  CAM.res276=CAM.res276||{}; CAM.res276[t.id]=1;
  return {dicho:dicho, soloNota:soloNota};
}
function camSigue(id){ var k6=(CAM.g||{})[id]; if(k6==="msg") return camMsgVivo(id); var t=tareaId240(id); if(!t) return false;
  if(k6==="fal"){ try{ return _camVivo(t) && camPreguntas(t).length>0; }catch(e){ return false; } } try{ return (CAM.g||{})[id]==="nue"?esPropuesta(t):_camVivo(t); }catch(e){ return false; } }
function camDeshaz(){
  var u=CAM.ult; CAM.ult=null; if(!u) return camSiguiente(-1);
  try{ deshazUlt(u); }catch(e){ console.warn("caminata 275 deshaz", e); }   /* build 278: la misma función que el ↩ de la tarea (incluye la tarea o dato que nació de un mensaje) */
  try{ if(u.ord286){ var T6=tareaId240(u.ord286.tid), e6=camOrdEnc(T6, u.ord286.id); if(e6){ e6.estado="deshecho"; e6.hecho_ts=Date.now(); e6.resultado="Salvador lo deshizo en la caminata"; camGuardaEnc(T6); } } }catch(e){}
  CAM.qz=null; try{ if(u.i>=0) delete CAM.res276[CAM.L[u.i]]; }catch(e){}
  CAM.hechas275=Math.max(0, (CAM.hechas275||1)-1);
  if(u.i>=0) CAM.i=u.i;
  try{ render(); }catch(e){}
  camDi([{v:"A", t:camVar("undo", ["Va, lo deshice.","Listo, lo regresé.","Sale, como estaba."])}], function(){ camPresenta(true); });
}

/* ===================== build 276 (Salvador 7-oct): CAMINATA CON INTERRUPCIÓN Y BANDEJA LIMPIA =====================
   Sobre el 275.
   1 INTERRUPCIÓN (barge-in, como el modo de voz de Claude): mientras la app habla, un segundo reconocedor queda abierto
     (camBargeAbre). Si Salvador empieza a hablar, la voz se calla al instante (speechSynthesis.cancel + CAM.tok++) y lo escucha.
     Entiende al momento, sin botones: "repíteme lo último" (repite la frase anterior y la que iba y sigue), "espera" ("Va, te espero."
     y escucha; "sigue" retoma donde se quedó), "a ver, voy" ("Te escucho."). Cualquier otra cosa es el inicio de su respuesta.
     Para que no se escuche a sí misma: (a) getUserMedia con echoCancellation/noiseSuppression para el medidor de volumen;
     (b) se ignora lo reconocido que coincide con lo que la app está diciendo o dijo hace < 1.5 s (la frase tal cual, o ≥ 70 % de
     palabras si son 4 o más);
     (c) umbral de volumen: el pico de los últimos 700 ms debe pasar 0.03 RMS y 2.5 veces el ruido de fondo medido mientras habla.
     iOS: si al abrir el micrófono la voz se corta sola (utterance "interrupted" que no pedimos), se apaga la interrupción en esa
     sesión, se repite la frase y queda como el 275 (micrófono cerrado mientras habla) + tocar el círculo interrumpe. Motivo en
     localStorage doit_barge276 y en window.__barge276.
   2 ORDEN para dejar la bandeja limpia: (1) decisiones · (2) llamadas de mañana · (3) tareas nuevas por acomodar, y al acomodar
     cada una, de inmediato el CUESTIONARIO de lo que le falta (contexto, fecha, quién, seguimiento, monto), una pregunta a la vez;
     al terminar dice qué datos quedaron pendientes · (4) tareas con la ficha roja "Falta": el mismo cuestionario · (5) mensajes por
     acomodar (pláticas de WhatsApp sin tarea segura): quién, qué dice en una línea y las 2 tareas más probables ("¿Va a Vestidores
     o a Comedor?"); contesta libre. Al final: "Bandeja limpia." o "Quedaron N pendientes: …".
   3 Sin menús ni reconfirmar: lo que contesta lo interpreta la IA (modo rápido) o, si nombra una de las dos candidatas, se aplica
     directo. Las respuestas del cuestionario van juntas a completaRevision (como la tarjeta de preguntas) sin esperar al cerebro. */
var CAM_ECO_MS=1500, CAM_BARGE_UMBRAL=0.03, CAM_QZ_CORTO=6, CAM_QZ_MAX=5;
function camK(){ return ((CAM.g||{})[CAM.L[CAM.i]])||""; }
/* ---------- 1 · interrupción ---------- */
function camBargeOk(){
  if(window.__sinBarge276 || CAM.bargeNo || !CAM.on || CAM.pausa) return false;
  try{ if(localStorage.getItem("doit_barge276_off")==="1") return false; }catch(e){}
  return !!(window.SpeechRecognition||window.webkitSpeechRecognition);
}
/* lo que la app va diciendo (para no escucharse a sí misma) */
function camHablo(t){ var now=Date.now(), H=CAM.habla276=CAM.habla276||[];
  if(H.length && !H[H.length-1].fin) H[H.length-1].fin=now;
  if(t) H.push({n:_camNv(t), ini:now, fin:0}); CAM.habla276=H.slice(-6); }
function camEco(n){
  var w=n.split(" ").filter(function(x){ return x.length>=2; }); if(!w.length) return true;
  var now=Date.now();
  return (CAM.habla276||[]).some(function(h){ if(h.fin && now-h.fin>CAM_ECO_MS) return false; if(!h.n) return false;
    if((" "+h.n+" ").indexOf(" "+n+" ")>=0) return true;   /* la frase tal cual dentro de lo que dice */
    if(w.length<=3) return false;   /* corto y no contiguo: puede ser él repitiendo una palabra ("el de huella") */
    var hw=h.n.split(" "), c=w.filter(function(x){ return hw.indexOf(x)>=0; }).length; return c/w.length>=0.7; });
}
