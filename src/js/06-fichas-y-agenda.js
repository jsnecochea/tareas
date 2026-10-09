/* cuantas cosas le tocan a quien mira (para la pastilla discreta) */
/* SIN USO, REEMPLAZADA: se retira junto con su prueba b225 (revisión 8-oct) */
function cosasParaTi(t){
  var n=0; try{ n+=porAprobar(t).length; }catch(e){}
  n+=(t.decision_meta||[]).length+(t.decision_dato||[]).length+(t.quien_dudas||[]).length+(t.msj_borrador?1:0);
  try{ if(tipoRevisar(t)==="falta" && t.en_revision && completitud(t).completa) n++; }catch(e){}
  try{ (t.msgs||[]).forEach(function(x){ if(msgVisible(x) && x.duda_tarea && !x.duda_resuelta) n++; }); }catch(e){}
  return n;
}
function personas225(t){
  var cp=[]; try{ cp=_compartirLista(t); }catch(e){}
  var ints=[]; try{ ints=integrantesDe(t).filter(function(x){ return x.k!==yo; }); }catch(e){}
  return {compartir:cp, ints:ints, n:cp.length||ints.length};
}
/* la linea de chips */
function chipsTarea(t){
  if(esDato(t)) return "";
  var ch=chipEncabezado(t), h='<div class="chips225">', falta=[];
  try{ if(tipoRevisar(t)==="falta" && !vistaSup(t) && clasif236(t)) falta=soloMeFalta(t); }catch(e){}   /* 236: sin clasificar no pide nada mas */
  var _np255=0; try{ _np255=preguntas249(t).length; }catch(e){}
  if(_np255||falta.length) h+='<button class="chip225 falta" data-chip="falta">Falta '+(_np255||falta.length)+' ›</button>';   /* build 255: con preguntas pendientes, el chip vuelve a abrirlas */
  var ftx=ch.cls==="ind"?ch.txt.replace(/ · próx\. .*/,""):(ch.cls==="sin"?"Sin fecha":ch.txt.replace(/^Finiquito:\s*/,""));   /* 226: sin emojis */
  /* build 234 (Salvador 18:56): sin ficha "Agendado": se fusiona con la de FECHA. Calendario siempre; VERDE (icono y texto) si el evento
     esta completo (alerta de Doit + Google Calendar); icono ámbar y texto normal si falta algo; sin evento, fecha normal. Indefinida: verde
     con el calendario si hay alguna cita completa. Tocar = hoja con lo que hay y lo que falta, cada cita y "Mover la fecha". */
  var ag=estadoAgenda(t), cz=citas234(t), cok=cz.some(function(c){ return c.ok; }), cfa=cz.length && !cz.every(function(c){ return c.ok; });
  var verde=ch.cls==="ind"?cok:!!(ag&&ag.ok&&!cfa), amb=!verde && !!(ag||cz.length);
  h+='<button class="chip225 fecha234'+(verde?' verde':'')+(amb?' amb234':'')+'" data-chip="fecha">'+(ch.cls==="ind"&&!verde&&!amb?ico("recur",15):ico("cal",15))+'<span class="ftx234">'+esc(ftx)+'</span></button>';
  h+=vChipClaves(t);   /* build 235: Claves n/m despues de la fecha */
  if(tienePasos(t)) h+='<button class="chip225" data-chip="pasos">'+ico("list",15)+'Pasos '+pasosHechos(t)+'/'+t.lista_pasos.length+'</button>';   /* build 242: Pasos es ficha (antes bloque grande) */
  if(esMetas(t)){ var pe=metasEnCurso(t), rj=pe.filter(function(m){ return (+m.estado||0)===0 && semaforoMeta(m).k==="rojo"; }).length;
    var mt=metasDe(t), fm=filtroMeta(t), fmm=fm&&fm!=="otro"?mt.filter(function(m){ return m.id===fm; })[0]:null;   /* build 232: con filtro, el nombre de la meta */
    h+='<button class="chip225'+(rj&&!fm?' red':'')+(fm?' on232':'')+'" data-chip="metas">'+ico("list",15)+(fm?esc(fmm?metaCorta(fmm):"Otro")+ico("down",13):'Metas '+mt.filter(metaCumplida).length+'/'+mt.length)+'</button>'; }   /* build 231: n/m */
  else if(tieneChecklist(t)){ var L=t.checklist.items; h+='<button class="chip225" data-chip="lista">'+ico("list",15)+'Lista '+L.filter(function(x){ return (+x.estado||0)>=1; }).length+'/'+L.length+'</button>'; }
  /* build 231 (Salvador 17:00): sin ficha de personas (los integrantes viven en la hoja del filtro) ni ficha "Resumen" (vive en Importante y en Detalles) */
  /* build 228 (Salvador 16:33): UNA fila de fichas iguales: fecha · Lista · personas · Agendado · Resumen · Todo ⌄ · Detalles.
     Sin "1 cosa para ti", sin el renglon "Agendado ✓ · Calendario…" y sin el bloque grande del Resumen. */
  h+=vPastilla(t);
  h+='<button class="chip225 res234" data-chip="detalles">Resumen</button></div>';   /* build 234: la palabra "Resumen" (abre la hoja numerada) */
  return h+(typeof lineaPlan==="function"?lineaPlan(t):"");
}
/* build 228: agendado = alerta de Doit Y evento en Google Calendar. Solo sale si es evento o ya se agendo algo. */
function estadoAgenda(t){
  var ev=null; try{ ev=eventoDe(t); }catch(e){}
  var alerta=t.agendado===true, cal=!!t.gcal_id;
  if(!alerta && !cal && !ev) return null;
  if(!alerta && !cal && t.agendar===false) return null;   /* dijo que no se agenda */
  var txt=alerta&&cal?"Agendado":(!alerta&&!cal?"Sin agendar":(alerta?"Falta calendario":"Falta alerta"));
  return {ok:alerta&&cal, alerta:alerta, cal:cal, gcalPend:t.gcal==="pendiente", txt:txt, ev:ev};
}
/* ===== build 235 (Salvador 18:58): CLAVES = lo indispensable que hay que tener asegurado (viaje: vuelo ida, vuelo regreso, hotel noche 1...).
   t.claves=[{id, t, ok, fecha_limite?, evidencia_ref? (indice o id en t.evidencia), nota?}]. Ficha "Claves 3/4" despues de la fecha:
   ÁMBAR si falta alguna y su limite (o la fecha de la tarea) esta a 7 dias o menos; ROJO si ya paso; todas completas: normal con palomita.
   Salvador palomea a mano; Claude la palomea cuando encuentra la confirmacion (eso lo hace la Mac). ===== */
function claves235(t){ return (Array.isArray(t&&t.claves)?t.claves:[]).filter(function(c){ return c && String(c.t||"").trim() && !c.apartado; }); }
function semClaves(t){
  var L=claves235(t), fal=L.filter(function(c){ return !c.ok; }); if(!L.length) return null;
  var k="", h=hoy();
  fal.forEach(function(c){ var f=/^\d{4}-\d{2}-\d{2}$/.test(c.fecha_limite||"")?c.fecha_limite:(/^\d{4}-\d{2}-\d{2}$/.test(t.f_vigente||"")?t.f_vigente:""); if(!f) return;
    var d=dDif(h, f); if(d<0) k="rojo"; else if(d<=7 && k!=="rojo") k="ambar"; });
  return {n:L.length, ok:L.length-fal.length, todas:!fal.length, k:k};
}
function vChipClaves(t){
  var S=semClaves(t); if(!S) return "";
  return '<button class="chip225 clv235'+(S.k==="rojo"?' red':(S.k==="ambar"?' amb235':''))+'" data-chip="claves">'+ico(S.todas?"check":"llave",15)+'Claves '+S.ok+'/'+S.n+'</button>';
}
function evidClave(t, c){
  var r=c&&c.evidencia_ref; if(r===undefined || r===null || r==="") return -1; var L=evidenciaDe(t);
  if(typeof r==="number" || /^\d+$/.test(String(r))){ var i=+r; return L[i]?i:-1; }
  for(var j=0;j<L.length;j++) if(String(L[j].id||"")===String(r)) return j; return -1;
}
function vClaves(t){
  var L=claves235(t), h=hoy(), fc=function(f){ return typeof fechaMovCorta==="function"?fechaMovCorta(f):f; };
  return '<div class="clv235l">'+L.map(function(c){ var ei=evidClave(t,c), f=c.fecha_limite||"", d=(!c.ok && /^\d{4}-\d{2}-\d{2}$/.test(f))?dDif(h,f):null;
      return '<div class="clv235r'+(c.ok?' ok':'')+'"><button class="clvk" data-clv="'+esc(c.id)+'" aria-label="'+(c.ok?'Quitar palomita':'Palomear')+'">'+ico(c.ok?"check":"circ",18)+'</button>'+
        '<span class="clvt"><span>'+esc(c.t)+'</span>'+((f||c.nota)?'<small'+(d!==null&&d<0?' class="red"':(d!==null&&d<=7?' class="amb235"':''))+'>'+esc([f?(c.ok?"":"límite ")+fc(f):"", c.nota||""].filter(Boolean).join(" · "))+'</small>':'')+'</span>'+
        (ei>=0?'<button class="clvc" data-clvev="'+ei+'" aria-label="Ver la confirmación">'+ico("clip",17)+'</button>':'')+'</div>'; }).join("")+
    '</div><div class="clvadd"><input id="clvnew" placeholder="Agregar clave" autocapitalize="sentences" enterkeyhint="done"><button class="clvaddb" data-clvadd="1">Agregar</button></div>';
}
/* build 234: las citas/reuniones de la tarea, cada una con su estado. t.citas=[{titulo,fecha,hora,lugar,alerta,gcal_id}] si viene;
   si no, las alertas de Doit con fecha (t.avisos); el evento de Google Calendar de la tarea (t.gcal_id) cuenta para todas. */
function citas234(t){
  var out=[];
  if(Array.isArray(t.citas) && t.citas.length) t.citas.forEach(function(c){ if(!c || c.apartado) return; var al=c.alerta===true, ca=!!c.gcal_id;
    out.push({titulo:String(c.titulo||"").trim(), fecha:c.fecha||"", hora:c.hora||"", lugar:String(c.lugar||"").trim(), alerta:al, cal:ca, ok:al&&ca}); });
  else if(t.agendado===true || t.gcal_id) (t.avisos||[]).filter(function(a){ return a && a.fecha && !a.apartado && !a.borrado; }).forEach(function(a){ var ca=!!(a.gcal_id||t.gcal_id);
    out.push({titulo:String(a.texto||"").trim(), fecha:a.fecha, hora:a.hora||"", lugar:"", alerta:true, cal:ca, ok:ca}); });
  return out.sort(function(x,y){ return String(x.fecha+(x.hora||"")).localeCompare(String(y.fecha+(y.hora||""))); });
}
function vFecha(t){
  var cz=citas234(t), fc=function(f){ return typeof fechaMovCorta==="function"?fechaMovCorta(f):f; }, h="";
  if(cz.length>1){
    h='<div class="mf225 cit234">'+cz.map(function(c){ var fal=[c.alerta?"":"alerta de Doit", c.cal?"":"Google Calendar"].filter(Boolean);
      return '<div class="mfr"><span class="k">'+ico("cal",15)+esc([fc(c.fecha), c.hora].filter(Boolean).join(" ")+(c.titulo?" · "+c.titulo:"")+(c.lugar?" · "+c.lugar:""))+'</span>'+
        '<span class="v'+(c.ok?' verde':' amb234')+'">'+esc(c.ok?"Agendada":"Falta "+fal.join(" y "))+'</span></div>'; }).join("")+'</div>'+
      '<p class="h225v0">'+esc(cz.every(function(c){ return c.ok; })?"Todas tienen la alerta de Doit y el evento en tu Google Calendar.":"Cada cita necesita las dos: la alerta de Doit y el evento en Google Calendar.")+'</p>';
  } else if(estadoAgenda(t)) h=vAgenda228(t);
  else h='<p class="h225v0">Esta tarea no tiene evento agendado.</p>';
  if(!t.cierre) h+='<div class="fbt234"><button class="hop" data-f234="mover">Mover la fecha</button></div>';
  return h;
}
function vAgenda228(t){
  var a=estadoAgenda(t); if(!a) return '<p class="h225v0">Esta tarea no tiene nada que agendar.</p>';
  var av=(t.avisos||[]).filter(function(x){ return x && x.fecha; }).sort(function(x,y){ return String(x.fecha+(x.hora||"")).localeCompare(String(y.fecha+(y.hora||""))); })[0];
  var r=function(ok, k, v){ return '<div class="mfr"><span class="k">'+esc(k)+'</span><span class="v'+(ok?' verde':'')+'">'+esc(v)+'</span></div>'; };
  var h='<div class="mf225">'+
    r(a.alerta, "Alerta de Doit", a.alerta?("Lista"+(av?" · "+(typeof fechaMovCorta==="function"?fechaMovCorta(av.fecha):av.fecha)+(av.hora?" "+av.hora:""):"")):"Falta")+
    r(a.cal, "Google Calendar", a.cal?"Evento creado":(a.gcalPend?"Falta · en camino (lo crea el trabajador de Calendar)":"Falta"))+
    (a.ev && (a.ev.fecha||a.ev.hora||a.ev.lugar)?r(false, "Evento", [a.ev.fecha?(typeof fechaMovCorta==="function"?fechaMovCorta(a.ev.fecha):a.ev.fecha):"", a.ev.hora||"", a.ev.lugar||""].filter(Boolean).join(" · ")):"")+
    '</div><p class="h225v0">'+esc(a.ok?"Tiene las dos cosas: la alerta de Doit y el evento en tu Google Calendar.":"Para quedar agendado necesita las dos: la alerta de Doit y el evento en Google Calendar.")+'</p>';
  return h;
}
/* SIN USO, REEMPLAZADA: se retira junto con su prueba b225 (revisión 8-oct) */
function vResumenVivo(t){
  /* build 228: ya no es bloque fijo: la ficha "Resumen" lo despliega debajo de las fichas y lo pliega al volver a tocarla */
  var r=resumenVivo(t); if(!r.una || !min225(t.id,"rvab")) return "";
  return '<div class="rv228"><span class="rvt">'+r.partes.map(function(p){ return '<span'+(p.rojo?' class="red"':'')+'>'+esc(p.tx)+'</span>'; }).join('<br>')+'</span></div>';
}
/* filtro del chat por meta */
function filtroMeta(t){ var f=(window.__mfil225||{})[t.id]||""; if(f && f!=="otro" && !metasDe(t).some(function(m){ return m.id===f; })) f=""; return f; }
/* SIN USO, REEMPLAZADA: se retira junto con su prueba b225 (revisión 8-oct) */
function vFiltroMeta(t){
  var pe=metasEnCurso(t); if(!pe.length || esDato(t)) return "";
  var f=filtroMeta(t);
  if(min225(t.id,"fm")) return '<div class="fm225"><button class="fmb min" data-min225="fm">⌕ '+esc(f?(f==="otro"?"Otro":metaCorta(metasDe(t).filter(function(m){ return m.id===f; })[0])):"Filtrar por meta")+'</button></div>';
  return '<div class="fm225"><button class="fmb'+(f?'':' on')+'" data-mfil="">Todo</button>'+
    pe.map(function(m){ return '<button class="fmb'+(f===m.id?' on':'')+'" data-mfil="'+esc(m.id)+'">'+esc(metaCorta(m))+'</button>'; }).join("")+
    '<button class="fmb'+(f==="otro"?' on':'')+'" data-mfil="otro">Otro</button><button class="fmx" data-min225="fm" aria-label="Minimizar filtro">–</button></div>';
}
/* evidencia de una meta: su foto, la entrega y las fotos del hilo que le tocan */
function evidenciaMeta225(t, m){
  var f=[]; function pon(u){ if(u && f.indexOf(u)<0) f.push(u); }
  pon(m.foto); ((m.entrega||{}).fotos||[]).forEach(pon);
  (t.msgs||[]).forEach(function(x){ if(!msgVisible(x) || !x.url) return; var esF=x.tipo==="foto" || x.tipo==="imagen" || /\.(jpe?g|png|webp|heic)(\?|$)/i.test(String(x.url));
    if(esF && metaDeMsg(t,x)===m.id) pon(String(x.url)); });
  return f;
}
function vFichaMeta(t, mid){
  var m=metasDe(t).filter(function(x){ return x.id===mid; })[0]; if(!m) return '<p class="h225v0">Esa meta ya no está.</p>';
  var H=hoy(), sf=semaforoMeta(m,H), e=+m.estado||0, atr=e===0 && sf.k==="rojo";
  var fx=(m.fecha?fechaMovCorta(m.fecha):"Sin fecha")+(e===2?" · cumplida":(e===1?" · por aprobar":(atr?" · atrasada "+(-dDif(H,m.fecha))+" día"+(dDif(H,m.fecha)===-1?"":"s"):(m.fecha?" · en tiempo":""))));
  var rows=[["Fecha", fx, atr?"red":""], ["Sigue", String(m.siguiente||m.sigue||"").trim(), ""], ["Se espera de", quienMeta(t,m), ""], ["Seguimiento", segMetaTx(m), ""]]
    .filter(function(r){ return String(r[1]||"").trim(); });
  var h='<div class="mf225">'+rows.map(function(r){ return '<div class="mfr"><span class="k">'+esc(r[0])+'</span><span class="v'+(r[2]?' '+r[2]:'')+'">'+esc(r[1])+'</span></div>'; }).join("");
  var ev=evidenciaMeta225(t,m);
  h+='<div class="mfr"><span class="k">Evidencia</span><span class="v">'+(ev.length?ev.length+' foto'+(ev.length===1?'':'s'):'sin fotos aún')+'</span></div>';
  if(ev.length) h+='<div class="mfev">'+ev.slice(0,6).map(function(u){ return '<img src="'+esc(u)+'" alt="evidencia">'; }).join("")+'</div>';
  var ms=[]; (t.msgs||[]).forEach(function(x){ if(msgVisible(x) && _txMsg(x) && metaDeMsg(t,x)===m.id) ms.push(x); });
  if(ms.length) h+='<div class="mfms">'+ms.slice(-12).map(function(x){ var tx=_txMsg(x); return '<div class="mfm">'+esc(tx.length>220?tx.slice(0,219)+"…":tx)+'<small>'+esc(x.h||"")+'</small></div>'; }).join("")+'</div>';
  else h+='<p class="h225v0">Todavía no hay mensajes de esta meta.</p>';
  if(e===1) h+='<div class="ebt"><button class="ebk pri" data-entok="'+esc(m.id)+'">Aprobar</button><button class="ebk" data-entcor="'+esc(m.id)+'">Pedir corrección</button></div>';
  return h+'</div>';
}
/* hoja Detalles: de lo mas valioso a lo menos; los bloques vacios no ocupan lugar */
function vDetalles(t){
  /* build 231: orden fijo y numerado: 1 Resumen vivo · 2 Lo que sigue · 3 Metas · 4 Contexto (con clip) · 5 Seguimiento · 6 Origen */
  var B=[], r=resumenVivo(t), H=hoy(), R=(t.resumen && typeof t.resumen==="object")?t.resumen:null;
  if(R && (String(R.texto||"").trim() || (R.acuerdos||[]).length || (R.pendientes||[]).length)){
    var fc=function(f){ return /^\d{4}-\d{2}-\d{2}/.test(f||"")?fechaMovCorta(String(f).slice(0,10)):String(f||""); };
    B.push(["Resumen vivo", (String(R.texto||"").trim()?'<p>'+esc(R.texto)+'</p>':'')+
      ((R.acuerdos||[]).length?'<ul class="racu">'+R.acuerdos.map(function(a){ return '<li>'+ico("check",14)+'<span>'+esc(a.t||a.texto||"")+'</span>'+(a.fecha?'<small>'+esc(fc(a.fecha))+'</small>':'')+'</li>'; }).join("")+'</ul>':'')+
      ((R.pendientes||[]).length?'<p class="rfal"><b>Falta:</b> '+R.pendientes.map(function(q){ return esc((q.t||q.texto||"")+(q.de?" ("+q.de+")":"")); }).join(" · ")+'</p>':'')]);
  } else if(r.una) B.push(["Resumen vivo", '<p>'+r.partes.map(function(p){ return esc(p.tx); }).join('<br>')+'</p>']);
  var sg=[]; var pe=esMetas(t)?metasEnCurso(t):[];
  if(pe.length){ var s0=pe[0]; sg.push(metaCorta(s0)+(s0.fecha?" · "+fechaMovCorta(s0.fecha):"")+((+s0.estado||0)===1?" · por aprobar":"")); var q0=quienMeta(t,s0); if(q0) sg.push("Se espera de "+q0); }
  else { var esp=r.partes.filter(function(p){ return p.k==="espera"; })[0]; if(esp) sg.push(esp.tx); }
  if(t.seg_a && t.seg_a.contacto) sg.push("Seguimiento a "+t.seg_a.contacto+(t.seg_a.cada?" · "+t.seg_a.cada:"")+(t.seg_a.hora?" · "+t.seg_a.hora:""));
  if(sg.length) B.push(["Lo que sigue · de quién se espera", '<p>'+sg.map(esc).join('<br>')+'</p>']);
  if(pe.length) B.push(["Metas", pe.map(function(m){ var atr=(+m.estado||0)===0 && semaforoMeta(m,H).k==="rojo";
    return '<button class="d225m" data-fmeta="'+esc(m.id)+'"><span>'+esc(metaCorta(m))+'</span><span class="'+(atr?'red':'')+'">'+esc(m.fecha?fechaMovCorta(m.fecha):"sin fecha")+((+m.estado||0)===1?" · por aprobar":"")+' ›</span></button>'; }).join("")]);
  else if(!esMetas(t) && tieneChecklist(t)){ var L=t.checklist.items; B.push(["Lista", '<button class="d225m" data-chip="lista"><span>'+esc(t.checklist.titulo||"Lista")+'</span><span>'+L.filter(function(x){ return (+x.estado||0)>=1; }).length+'/'+L.length+' ›</span></button>']); }
  var cx=contextoDe(t); if(cx) B.push(["Contexto", '<p>'+esc(cx)+'</p>'+vClipEvid(t,"ctx")]);   /* 229 */
  var pp=personas225(t), sq=[];
  if(t.seg_a && t.seg_a.contacto) sq.push("Claude a "+t.seg_a.contacto+(t.seg_a.cada?" · "+t.seg_a.cada:"")+(t.seg_a.hora?" · "+t.seg_a.hora:""));
  else if(String(t.ritmo||"").trim()) sq.push("Ritmo: "+String(t.ritmo).trim());
  if(pp.compartir.length) sq.push("Se comparte con: "+pp.compartir.map(function(c){ return c.nombre; }).join(" · "));
  else if(pp.ints.length) sq.push("Participan: "+pp.ints.map(function(x){ return nombreVisible(nombreInt(x.k), t); }).join(" · "));
  if(sq.length) B.push(["Seguimiento y con quién se comparte", '<p>'+sq.map(esc).join('<br>')+'</p>']);
  B.push(["Contactos", vPersonas(t, true)]);   /* quién está en la tarea y cómo agregar a alguien de tu agenda (la fila de fichas queda sin personas) */
  var cc=creadaCon(t); if(String(cc.texto||"").trim()){ var ab=!!((window.__orig225||{})[t.id]), cu=cc.ts?fechaCorta(new Date(cc.ts))+" "+hhmm(new Date(cc.ts)):"";
    B.push(["Origen", '<button class="d225o" data-orig225="1"><b>Creada con'+(cc.quien?" · "+esc(cc.quien):"")+(cu?" · "+esc(cu):"")+'</b> '+(ab?'▴':'▾')+'</button>'+
      (ab?'<div class="dquote">“'+esc(cc.texto)+'”</div>'+lineaOrigen(t):'<p class="tenue">“'+esc(cc.texto.length>70?cc.texto.slice(0,69)+"…":cc.texto)+'”</p>')]); }
  return B.map(function(b,i){ return '<div class="d225b'+(b[2]?' '+b[2]:'')+'"><h4><i>'+(i+1)+'</i>'+esc(b[0])+'</h4>'+b[1]+'</div>'; }).join("");
}
function vPersonas(t, plano){
  var pp=personas225(t), h="";
  if(plano){   /* dentro del Resumen: sin subtítulos (los bloques del Resumen van numerados) */
    if(pp.ints.length) h+='<p>'+pp.ints.map(function(x){ return esc(nombreVisible(nombreInt(x.k), t))+' <span class="tenue">· '+esc({hace:"lo hace",revisa:"revisa",opina:"opina",externo:"contacto"}[x.rol]||x.rol)+'</span>'; }).join('<br>')+'</p>';
    pp={compartir:[], ints:[]}; }
  if(pp.compartir.length) h+='<div class="d225b"><h4>Se comparte con</h4><p>'+pp.compartir.map(function(c){ return esc(c.nombre); }).join('<br>')+'</p></div>';
  if(pp.ints.length) h+='<div class="d225b"><h4>Participan</h4><p>'+pp.ints.map(function(x){ return esc(nombreInt(x.k))+' <span class="tenue">· '+esc({hace:"lo hace",revisa:"revisa",opina:"opina",externo:"externo"}[x.rol]||x.rol)+'</span>'; }).join('<br>')+'</p></div>';
  try{ cargaAgendaWA(function(){ if(hoja225(t)) render(); }); }catch(e){}
  var ag=window.AGENDA_WA, agTx=ag?('Tu agenda de WhatsApp en Doit: '+ag.length+' contactos.'):(window.__agendaNo?'La agenda completa de WhatsApp todavía no llega a la app: por ahora busco en los contactos que ya conozco (equipo y quienes te han escrito).':'Cargando tu agenda de WhatsApp…');
  return (h||'<p class="h225v0">Nadie más en esta tarea.</p>')+'<button class="d225m" data-int227="1"><span>Agregar o quitar contactos</span><span>'+ico("chev",14)+'</span></button>'+
    '<p class="tenue" style="margin-top:8px">'+esc(agTx)+'</p>';
}
/* la hoja de abajo (una a la vez) */
function hoja225(t){ var H=window.__hoja225; return (H && H.tid===t.id)?H:null; }
function abreHoja(t, k, mid){ window.__hoja225={tid:t.id, k:k, mid:mid||"", alto:(k==="lista"?"media":(k==="detalles"?"completa":"media"))}; }
function vHoja(t){
  var H=hoja225(t); if(!H) return "";
  var tit="", sub="", cuerpo="";
  if(H.k==="metas"){ tit="Metas"; var pe=metasEnCurso(t), hc=metasDe(t).filter(metaCumplida);
    sub=pe.length+" en curso"+(t.seg_a&&t.seg_a.contacto?" · seguimiento a "+nombreCorto(t.seg_a.contacto)+(t.seg_a.cada?" "+t.seg_a.cada:""):"");
    /* build 232: el filtro del chat por meta vive aqui (antes era una segunda fila): tocar una meta filtra el chat; › abre su ficha */
    var _f232=filtroMeta(t), _fr=function(id, nom, sub, rojo){ return '<div class="mf232'+(_f232===id?' on':'')+'"><button class="mfb" data-mfil="'+esc(id)+'"><span>'+esc(nom)+'</span><small class="'+(rojo?'red':'')+'">'+esc(sub||"")+'</small>'+(_f232===id?ico("check",16):'')+'</button>'+(id&&id!=="otro"?'<button class="mff" data-fmeta="'+esc(id)+'" aria-label="Ficha de la meta">'+ico("der",15)+'</button>':'')+'</div>'; };
    cuerpo='<div class="mf232l">'+_fr("", "Todo", "todo el chat")+
      pe.map(function(m){ var atr=(+m.estado||0)===0 && semaforoMeta(m).k==="rojo"; return _fr(m.id, metaCorta(m), (+m.estado||0)===1?"por aprobar":(m.fecha?fechaMovCorta(m.fecha):"sin fecha"), atr); }).join("")+
      _fr("otro", "Otro", "lo que no es de ninguna meta")+'</div>'+
      (vistaSup(t)?'<div class="d225m tenue"><span>Cumplidas (historial)</span><span>'+(hc.length||"ninguna")+'</span></div>':'<div class="mf232h">Marcar avance</div>'+vChecklist(t));
  } else if(H.k==="meta"){ var m=metasDe(t).filter(function(x){ return x.id===H.mid; })[0]; tit=m?metaCorta(m):"Meta"; sub="Meta de "+tareaCorta(t)+(m&&quienMeta(t,m)?" · la hace "+quienMeta(t,m):""); cuerpo=vFichaMeta(t,H.mid); }
  else if(H.k==="lista"){ tit=(t.checklist&&t.checklist.titulo)||"Lista"; window.__chkOpen=window.__chkOpen||{}; var _ab=window.__chkOpen[t.id]; window.__chkOpen[t.id]=true; cuerpo=vChecklist(t); window.__chkOpen[t.id]=_ab; }
  else if(H.k==="personas"){ tit="Personas"; cuerpo=vPersonas(t); }
  else if(H.k==="agenda"){ var _a228=estadoAgenda(t); tit=_a228?_a228.txt:"Agenda"; cuerpo=vAgenda228(t); }
  else if(H.k==="pasos"){ tit="Pasos"; sub=pasosHechos(t)+" de "+t.lista_pasos.length; window.__pasosOpen=window.__pasosOpen||{}; var _pa242=window.__pasosOpen[t.id]; window.__pasosOpen[t.id]=true; cuerpo=vPasos(t); window.__pasosOpen[t.id]=_pa242; }
  else if(H.k==="claves"){ var _S=semClaves(t); tit="Claves"; sub=_S?(_S.todas?"Todo asegurado":(_S.n-_S.ok)+" por asegurar"+(_S.k==="rojo"?" · ya pasó el límite":(_S.k==="ambar"?" · 7 días o menos":""))):""; cuerpo=vClaves(t); }
  else if(H.k==="fecha"){ var _ch=chipEncabezado(t); tit=_ch.cls==="ind"?"Indefinida":(_ch.cls==="sin"?"Sin fecha":_ch.txt.replace(/^Finiquito:\s*/,"")); var _ag=estadoAgenda(t), _cz=citas234(t);
    sub=_cz.length>1?_cz.length+" citas":(_ag?_ag.txt:"Sin evento agendado"); cuerpo=vFecha(t); }
  else { tit="Resumen"; cuerpo=vDetalles(t); }   /* build 234: antes "Detalles" */
  if(H.alto==="min") return '<button class="h225bar" data-h225alto="media">'+esc(tit)+' ▴</button>';
  return '<div class="h225v" data-h225x="1"></div><div class="h225 '+esc(H.alto)+'" role="dialog" aria-label="'+esc(tit)+'"><div class="h225g"></div>'+
    (H.k==="lista"?'<div class="h225al"><button data-h225alto="media" class="'+(H.alto==="media"?'on':'')+'">media</button><button data-h225alto="completa" class="'+(H.alto==="completa"?'on':'')+'">completa ⇡</button></div>':'')+
    '<div class="h225h"><b>'+esc(tit)+'</b><button class="h225b" data-h225alto="min" aria-label="Minimizar">–</button><button class="h225b" data-h225x="1" aria-label="Cerrar">✕</button></div>'+
    (sub?'<div class="h225s">'+esc(sub)+'</div>':'')+'<div class="h225c">'+cuerpo+'</div></div>';
}
/* ---- mover un mensaje a otra tarea (nunca se borra: en el origen queda oculto) ---- */
/* SIN USO, REEMPLAZADA: se retira junto con su prueba b225 (revisión 8-oct) */
function tareasParaMover(t, x){
  var c=_nn(String((x&&x.wa_c)||"")), H=[];
  tareas.forEach(function(d){ if(!d || d.id===t.id || d.cierre || d.fusionada_en || d.es_recordatorio || estadoReal(d)==="cerrada") return;
    var mismo=!!c && ([d.revisa_ext, d.seg_a&&d.seg_a.contacto].concat((d.wa_contactos||[]).map(function(w){ return (w&&w.nombre)||w; })).some(function(n){ return n && _nn(String(n))===c; }) ||
      (d.msgs||[]).some(function(y){ return y && y.wa_c && _nn(String(y.wa_c))===c; }));
    H.push({d:d, mismo:mismo}); });
  H.sort(function(a,b){ return (b.mismo-a.mismo) || ((b.d.tocada||0)-(a.d.tocada||0)); });
  return H;
}
function mueveMensaje(t, ix, destId, tipo){
  var x=(t.msgs||[])[ix], d=tareas.filter(function(z){ return z.id===destId; })[0];
  if(!x || !d || d.id===t.id || x.oculto) return "";
  var tx=_txMsg(x), ahora=Date.now();
  x.oculto=true; x.oculto_ts=ahora; x.oculto_por=yo||""; x.movido_a={id:d.id, nombre:d.nombre||""}; if(x.duda_tarea) x.duda_resuelta="otra";
  x.acomodo={ok:0, ts:ahora, por:yo||""}; censoAcomodo(t, x, t.id, d.id, tipo||"mover");   /* build 226: aprendizaje */
  var n={k:x.k==="bo"?"bo":"bi", t:"Movido desde "+(t.nombre||"otra tarea")+": "+tx, h:x.h||hhmm(), ts:ahora, movido_de:{id:t.id, nombre:t.nombre||"", ts:x.ts||0, por:yo||""}, nuevo_mov:1};
  ["wa_c","wa_in","canal","url","tipo","origen","chat","de"].forEach(function(k){ if(x[k]!==undefined && x[k]!==null) n[k]=x[k]; });
  d.msgs=d.msgs||[]; d.msgs.push(n);
  if(typeof esDormida==="function" && esDormida(d)) despierta264(d, "le movieron un mensaje"); else if(typeof esCerradaVinc==="function" && esCerradaVinc(d) && !d.fusionada_en) reabre(d, "recibe mensajes movidos desde otra tarea");
  guarda(t); guarda(d);
  return "Lo moví a “"+(d.nombre||"la otra tarea")+"”. Aquí queda oculto, no borrado.";
}
/* "¿Es de esta o de otra?" (la Mac 18q deja duda_tarea cuando no esta segura del tema) */
/* build 225 (Salvador: el Claude de la app partio las metas en 5 renglones cuando dijo "me mezclaste"):
   "me mezclaste / esto es de otra tarea / esto es de <tarea>" -> se mueven los mensajes; NUNCA se toca lista ni metas */
var MEZCLA_RE=/\b(me\s+(los\s+|las\s+|lo\s+|la\s+)?(mezclaste|revolviste|confundiste|equivocaste)|(no\s+)?(es|son|va|van|era|eran)\s+(de|para|en)\s+(otra|la\s+otra)\s+tarea|no\s+(es|son|va|van)\s+(de|en)\s+esta\s+tarea|cayo\s+en\s+(otra|la\s+otra|esta)\s+tarea|esta\s+mal\s+acomodad)/;
var MEZCLA_DE_RE=/\b(esto|eso|este|ese|estos|esos|lo\s+ultimo|el\s+ultimo|lo\s+de\s+\w+)(\s+(mensaje|mensajes|audio|foto|fotos))?\s+(es|son|va|van|era|eran)\s+(del|de\s+(la|el|lo)|en\s+(la|el|lo))\s+\w+/;
function _nmz(v){ return _nn(String(v||"")).replace(/[^a-z0-9ñ ]+/g," ").replace(/\s+/g," "); }
function mezclaDicho(v, t){ var s=_nmz(v); if(MEZCLA_RE.test(s)) return true; return !!(t && MEZCLA_DE_RE.test(s) && tareaNombrada(t, v)); }
/* la tarea que nombro ("esto es del comedor") entre las abiertas; si no nombro ninguna o hay empate -> null */
function tareaNombrada(t, v){
  var s=" "+_nn(String(v||"")).replace(/[^a-z0-9ñ ]+/g," ")+" ", best=null, bs=0, emp=false;
  tareas.forEach(function(d){ if(!d || d.id===t.id || d.cierre || d.fusionada_en || d.es_recordatorio || estadoReal(d)==="cerrada") return;
    var ws=_nn(String(d.nombre||"")).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(function(w){ return w.length>=4 && META_VACIAS.indexOf(w)<0 && ["mantenimiento","seguimiento","tarea","casa","nuevo","nueva"].indexOf(w)<0; });
    var sc=ws.filter(function(w){ return s.indexOf(" "+w.slice(0,6))>=0; }).length;
    if(sc>bs){ bs=sc; best=d; emp=false; } else if(sc && sc===bs) emp=true; });
  return (best && !emp) ? best : null;
}
/* que mensajes se mueven: los que estan en duda; si no, la ultima rafaga entrante (mismo contacto, 15 min) */
function mensajesMezclados(t, dest){
  var ms=t.msgs||[], out=[];
  ms.forEach(function(x,i){ if(msgVisible(x) && x.duda_tarea && !x.duda_resuelta && (!dest || x.duda_tarea.alternativa_id===dest.id)) out.push(i); });
  if(out.length) return out;
  var u=-1; for(var i=ms.length-1;i>=0;i--){ if(msgVisible(ms[i]) && ms[i].wa_in){ u=i; break; } }
  if(u<0) return [];
  var c=String(ms[u].wa_c||""), t0=ms[u].ts||0;
  for(var j=u;j>=0;j--){ var y=ms[j]; if(!msgVisible(y) || !y.wa_in) continue; if(String(y.wa_c||"")!==c || (t0 && y.ts && t0-y.ts>15*60000)) break; out.unshift(j); }
  return out;
}
function arreglaMezcla(t, v){
  _notaPriv(t,"bo",v);
  var dest=tareaNombrada(t, v);
  if(!dest){ var dd=(t.msgs||[]).filter(function(x){ return msgVisible(x) && x.duda_tarea && !x.duda_resuelta; })[0];
    if(dd) dest=tareas.filter(function(z){ return z.id===dd.duda_tarea.alternativa_id; })[0]||null; }
  var ixs=mensajesMezclados(t, dest);
  if(!ixs.length){ _notaPriv(t,"bi","No encontré qué mensaje mover. Deja presionado el mensaje y escoge “Mover a otra tarea”."); guarda(t); return {movidos:0}; }
  if(!dest){ _notaPriv(t,"bi","¿A qué tarea va? Te dejé la lista para escoger; no toqué las metas ni la lista."); guarda(t); return {movidos:0, pregunta:ixs[ixs.length-1]}; }
  ixs.slice().reverse().forEach(function(i){ mueveMensaje(t, i, dest.id); });
  _notaPriv(t,"bi","Moví "+ixs.length+" mensaje"+(ixs.length===1?"":"s")+" a “"+dest.nombre+"”. Aquí quedan ocultos, no borrados; no toqué las metas ni la lista.");
  guarda(t); return {movidos:ixs.length, dest:dest.id};
}
/* ===================== build 226 (Salvador 15:40, maqueta-acomodo pantallas 1-3 con ajustes) =====================
   ACOMODO DE MENSAJES. Un mensaje con duda de tarea (duda_tarea) ya no pregunta "¿Es de esta tarea?": abajo de la burbuja
   van 3 botoncitos discretos OK · Mover · Nueva. OK = va aqui (quita la duda y cuenta como acierto). Mover = hoja "¿A donde
   va?" (la mas probable resaltada, "aqui cayo" marcada, Tarea nueva con nombre sugerido y Solo platica). Nueva = tarea
   nueva con nombre sugerido (queda en Falta info) y el mensaje pasa ahi. Nunca se borra: en el origen queda oculto.
   Cada correccion queda en el censo de la tarea (contacto, texto corto, origen -> destino) para que Claude aprenda.
   En el Inicio, seccion "Acomodo": arriba solo lo dudoso (OK · Mover · Nueva, o deslizar: derecha OK, izquierda Mover);
   abajo plegado "Acomodé solo hoy · N" y "acerté X/Y" (contado de los mensajes de hoy en Doit; nada estimado). */
function censoAcomodo(t, x, de, a, tipo){
  t.censo_acomodo=(t.censo_acomodo||[]).concat([{contacto:String((x&&x.wa_c)||""), texto:_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,"").slice(0,80),
    de:de||"", a:a||"", tipo:tipo, ts:Date.now(), por:yo||""}]).slice(-100);
}
function soloPlatica(t, ix){
  var x=(t.msgs||[])[ix]; if(!x || x.oculto) return "";
  x.oculto=true; x.oculto_ts=Date.now(); x.oculto_por=yo||""; x.oculto_motivo="platica"; x.duda_resuelta="platica"; x.acomodo={ok:0, ts:Date.now(), por:yo||""};
  censoAcomodo(t, x, t.id, "", "platica"); guarda(t); return "Solo plática: ya no sale en la tarea (queda guardado, no borrado).";
}
/* nombre sugerido para una tarea nueva: las palabras de peso del mensaje + "con <nombre>" */
function nombreSugerido(x){
  var tx=_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,"").replace(/^\s*tema\s*\d+\s*[.…:-]*\s*/i,"").split(/[\n.!?¿]/).filter(function(s){ return s.trim(); })[0]||"";
  var ws=tx.replace(/[^\wáéíóúñü ]+/gi," ").split(/\s+/).filter(function(w){ return w.length>=3 && META_VACIAS.indexOf(_nn(w))<0 && !/^(hay|que|los|las|del|una|uno|con|por|sin|mas|muy|hola|oye|buenas?|buenos)$/i.test(_nn(w)); }).slice(0,4);
  var c=nombreCorto(String((x&&x.wa_c)||"")).replace(/\(.*?\)/g,"").trim().split(/\s+/)[0]||"";
  var n=ws.join(" "); if(!n) n="Mensaje"; n=n.charAt(0).toUpperCase()+n.slice(1).toLowerCase();
  n=(n+(c?" con "+c.charAt(0).toUpperCase()+c.slice(1).toLowerCase():"")).slice(0,60);
  try{ n=tituloTarea(n); }catch(e){}   /* igual que queda al guardarla */
  return n;
}
/* ===== build 249 (Salvador 07:54): MOVER > "TAREA NUEVA" PIDE EL NOMBRE =====
   Hoy, al mover el mensaje de Carlos a Nueva, nació una tarea con el mismo nombre que la de origen. Ahora, en TODOS los caminos
   de "Nueva" (globo, Acomodo, Te pregunta, mover en lote, barra de selección) sale al instante una ventanita: "Nombre de la
   tarea nueva", con una sugerencia ya escrita sacada del MENSAJE (nunca el nombre de la tarea de origen), Crear y Cancelar.
   Al crear, la app lleva a la tarea nueva, con el mensaje ya adentro. */

/* ===== build 252: VENTANITAS CON CAMPO DE TEXTO =====
   iOS solo abre el teclado si focus() ocurre DENTRO del mismo toque que abre la ventanita: el input ya existe y se enfoca en el acto,
   sin setTimeout ni await. Cada ventanita lleva su propio micrófono que dicta AL CAMPO (no a la caja principal) y no la cierra. */
function micBtn(i){ return '<button type="button" class="mic252" data-mic252="'+(i==null?"":i)+'" aria-label="Dictar en este campo">'+ico("mic",22,1.8)+'</button>'; }
function enfoca252(inp){ try{ inp.focus({preventScroll:false}); }catch(e){ try{ inp.focus(); }catch(_e){} } }
function dictaACampo(btn, inp){
  if(!btn || !inp) return;
  if(btn.__r252){ try{ btn.__r252.stop(); }catch(e){} return; }
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ toast("Este navegador no dicta"); enfoca252(inp); return; }
  var r; try{ r=new SR(); }catch(e){ toast("No se pudo abrir el micrófono"); return; }
  var previo=String(inp.value||"").replace(/\s+$/,""); previo=previo?previo+" ":"";
  r.lang="es-MX"; r.continuous=true; r.interimResults=true;
  var fin=function(){ btn.__r252=null; try{ btn.classList.remove("on"); }catch(e){} };
  r.onresult=function(ev){ if(!document.body.contains(inp)){ try{ r.stop(); }catch(e){} return; }
    var f="", p="", L=(ev&&ev.results)||[]; for(var i=0;i<L.length;i++){ var x=L[i]; if(!x||!x[0]) continue; if(x.isFinal) f+=x[0].transcript+" "; else p+=x[0].transcript; }
    inp.value=(previo+f+p).replace(/\s+/g," ").replace(/^\s+|\s+$/g,""); try{ inp.dispatchEvent(new Event("input",{bubbles:true})); }catch(e){} };
  r.onerror=function(ev){ var e=(ev&&ev.error)||""; if(e==="not-allowed"||e==="service-not-allowed") toast("El micrófono está bloqueado para Doit"); else if(e==="network") toast("El dictado necesita internet"); fin(); };
  r.onend=fin;
  btn.__r252=r; btn.classList.add("on");
  try{ r.start(); }catch(e){ fin(); toast("No se pudo abrir el micrófono"); }
}
function paraDictadosCampo(v){ try{ Array.prototype.forEach.call((v||document).querySelectorAll("[data-mic252]"), function(b){ if(b.__r252){ try{ b.__r252.abort(); }catch(e){} } }); }catch(e){} }
function sugerenciaNombre(t, ixs){
  var xs=(ixs||[]).map(function(i){ return (t.msgs||[])[i]; }).filter(function(x){ return x && !x.oculto; });
  var x=xs.slice().sort(function(a,b){ return _txMsg(b).length-_txMsg(a).length; })[0]||null, n=x?nombreSugerido(x):"";
  var orig=_nn(t.nombre||"");
  if(!n || _nn(n)===orig){
    var tx=x?_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,""):"", ws=tx.replace(/[^\wáéíóúñü ]+/gi," ").split(/\s+/).filter(Boolean).slice(0,5).join(" ");
    n=ws?ws.charAt(0).toUpperCase()+ws.slice(1).toLowerCase():"Tarea nueva";
    if(_nn(n)===orig) n="Nueva: "+n; }
  return n.slice(0,60);
}
function pideNombreNueva(t, ixs, alCrear){
  var ya=document.getElementById("nom249"); if(ya) ya.remove();
  var v=document.createElement("div"); v.className="leemask"; v.id="nom249";
  v.innerHTML='<div class="nom249" role="dialog" aria-label="Tarea nueva"><h3>Tarea nueva</h3><label for="nom249i">Nombre de la tarea nueva</label>'+
    '<div class="row252"><input id="nom249i" type="text" maxlength="80" autocomplete="off" autocapitalize="sentences" enterkeyhint="done">'+micBtn()+'</div>'+
    '<div class="nom249b"><button class="no" data-nom249="x">Cancelar</button><button class="si" data-nom249="ok">Crear</button></div></div>';
  document.body.appendChild(v);
  var inp=v.querySelector("#nom249i"); inp.value=sugerenciaNombre(t, ixs);
  enfoca252(inp); try{ inp.setSelectionRange(inp.value.length, inp.value.length); }catch(e){}   /* build 252: focus SÍNCRONO, dentro del toque que abrió la ventanita (iOS) */
  function crea(){ var nm=String(inp.value||"").replace(/\s+/g," ").trim(); if(!nm){ toast("Ponle un nombre"); return; } paraDictadosCampo(v); v.remove(); alCrear(nm.slice(0,80)); }
  v.addEventListener("click", function(ev){ ev.stopPropagation(); var mb=ev.target.closest("[data-mic252]"); if(mb){ dictaACampo(mb, inp); return; } var b=ev.target.closest("[data-nom249]");
    if(b){ if(b.getAttribute("data-nom249")==="ok") crea(); else { paraDictadosCampo(v); v.remove(); } return; } if(ev.target===v){ paraDictadosCampo(v); v.remove(); } });
  inp.addEventListener("keydown", function(ev){ if(ev.key==="Enter"){ ev.preventDefault(); crea(); } });
}
function tareaNuevaDe(t, ixs){ for(var i=0;i<ixs.length;i++){ var m=(t.msgs||[])[ixs[i]]; if(m && m.movido_a && m.movido_a.id){ var d=tareas.filter(function(z){ return z.id===m.movido_a.id; })[0]; if(d) return d; } } return null; }
function vaATareaNueva(n){ if(!n) return; abierta=n.id; vista="hilo"; try{ render(); }catch(e){} }
function nuevaDesdeMsg(t, ix, nombre){
  var x=(t.msgs||[])[ix]; if(!x || x.oculto) return null;
  var n=creaTarea({nombre:(nombre && String(nombre).trim()) || nombreSugerido(x), dicho:_txMsg(x), pendiente_info:"Viene del acomodo: falta la fecha y el seguimiento", pendiente_tipo:"dato", falta_fecha:true});
  n.creada_desde={tarea_id:t.id, ts:x.ts||0, tipo:"acomodo"};
  var r=mueveMensaje(t, ix, n.id, "nueva"); guarda(n);
  return r?n:null;
}
function inicialesDe(n){ var w=nombreCorto(String(n||"")).replace(/\(.*?\)/g,"").replace(/[^\wáéíóúñü ]+/gi," ").trim().split(/\s+/).filter(Boolean); return ((w[0]||"?").charAt(0)+((w[1]||"").charAt(0)||"")).toUpperCase(); }
function nombreLimpio(n){ return String(n||"").replace(/\s*\(.*?\)\s*/g," ").replace(/[☀-➿️‍]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]/g,"").replace(/\s+/g," ").trim(); }
/* hoja "¿A donde va?" */

/* ===== build 253: BUSCADOR EN "¿A DÓNDE VA?" =====
   Todas las tareas abiertas y las cerradas de los últimos 30 días ("(cerrada)"), por nombre, sinónimos, palabras y contexto, sin acentos. */
function buscaTareasMover(q, t){   /* build 259: misma búsqueda que "Vincular · Nueva" (abiertas; si no hay, cerradas) */
  var R=buscaVinc259(q, t&&t.id); return R.lista.slice(0,20).map(function(o){ return {d:o.d, sc:o.sc, cerrada:o.cerrada}; });
}
/* build 262: la lista de "¿A dónde va?" con el MISMO formato que Vincular: parecidas (marca "parecida") y luego todas alfabético; la de origen en gris "aquí cayó" */
function listaMover(t, S){
  var f=function(d, par, aqui){ var et=etq264(d); return '<button class="opt226'+(par?' sim262':'')+(aqui?' aqui262':'')+(et?' cer259':'')+'" data-movto="'+esc(d.id)+'">'+ico("folder",20)+'<span class="ot">'+esc(d.nombre||"(sin nombre)")+'</span>'+(et?'<span class="tag">'+et+'</span>':'')+(par?'<span class="tag">parecida</span>':(aqui?'<span class="tag aqui262">aquí cayó</span>':''))+'</button>'; };
  var rest=S.rest.slice(); if(!rest.some(function(d){ return d.id===t.id; })) rest.push(t);
  rest.sort(function(a,b){ return _n179(a.nombre)<_n179(b.nombre)?-1:(_n179(a.nombre)>_n179(b.nombre)?1:0); });
  return S.sims.map(function(d){ return f(d,true,false); }).join("")+rest.slice(0,300).map(function(d){ return f(d,false,d.id===t.id); }).join("");
}
function abreMover(t, ix, ixs, opts){
  var x=(t.msgs||[])[ix]; if(!x) return; ixs=(ixs&&ixs.length)?ixs:null; opts=opts||{};   /* build 237: con ixs mueve toda la plática */
  var S=sugeridasPara(t, ixs||[ix]), RF=null, EXTRA=[];   /* build 262: el mismo motor que Vincular */
  var q=nombreLimpio(x.wa_c||((PERSONAS[x.de]||{}).nombre)||""), tx=_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,"");
  var v=document.createElement("div"); v.className="leemask"; v.id="mov225";
  v.innerHTML='<div class="mov225" role="dialog" aria-label="Vincular · Nueva"><div class="h225g"></div>'+
    '<div class="mvctx"><span class="av226">'+esc(inicialesDe(q))+'</span><span class="mvt"><small>'+esc((q||"Mensaje")+(x.h?" · "+x.h:"")+(ixs&&ixs.length>1?" · "+ixs.length+" mensajes":""))+'</small><span>'+htmlTx(tx, x)+'</span></span><button class="h225b" data-movx="1" aria-label="Cerrar">'+ico("x",14)+'</button></div>'+
    '<h3 class="mvh">'+(opts.soloNg?'No guardar':'Vincular · Nueva')+'</h3>'+
    (opts.desde?'<div class="desde245"><label>Solo desde <input type="date" id="desde245"></label><span id="nd245">'+ixs.length+' mensajes</span></div>':'')+
    '<div class="h225c">'+
    (opts.soloNg?'<button class="opt226 plain" data-movplatica="1">'+ico("bubble",20)+'<span class="two"><span id="ngt245">No guardar '+(ixs?ixs.length:1)+' mensajes</span><small>no va a ninguna tarea; queda oculto, no borrado</small></span></button></div></div>':
    '<div class="bus253"><button type="button" class="lupa" data-lupa253="1" aria-label="Buscar tarea">'+ico("lupa",20,1.8)+'</button><input id="mbus253" type="search" placeholder="Buscar tarea…" autocomplete="off" autocapitalize="none" enterkeyhint="search"></div><button class="opt226 plain nueva259" data-movnueva="1">'+ico("plus",20)+'<span class="two"><span>+ Crear tarea nueva</span><small>“'+esc(nombreSugerido(x))+'”</small></span></button><div id="mres253"></div><div id="mops253">'+
    listaMover(t, S)+
    '</div><div class="sep226"></div>'+
    '<button class="opt226 plain" data-movplatica="1">'+ico("bubble",20)+'<span class="two"><span>Solo plática</span><small>saludo o charla, no va a ninguna tarea</small></span></button></div></div>');
  document.body.appendChild(v);
  /* build 245: en lote ("Mover todos" / selección) la hoja aplica a todos, o solo a los desde una fecha */
  function usa245(){ var f=(v.querySelector("#desde245")||{}).value, d=f?new Date(f+"T00:00:00").getTime():0; return (ixs||[ix]).filter(function(i){ var m=(t.msgs||[])[i]; return m && !m.oculto && (!d || (+m.ts||0)>=d); }); }
  var _de=v.querySelector("#desde245"); if(_de) _de.onchange=function(){ var n=usa245().length; v.querySelector("#nd245").textContent=n+" mensaje"+(n===1?"":"s"); var g=v.querySelector("#ngt245"); if(g) g.textContent="No guardar "+n+" mensajes"; };
  /* build 253: buscador. La lupa enfoca el campo DENTRO del toque (iOS); los resultados son botones data-movto como las propuestas */
  var _bi=v.querySelector("#mbus253"), _br=v.querySelector("#mres253"), _bo=v.querySelector("#mops253"), _sem={t:null};
  var fila262=function(d, cer, par){ var et=etq264(d)||(cer?"cerrada":""); cer=!!et; return '<button class="opt226'+(cer?' cer259':'')+(par?' sim262':'')+'" data-movto="'+esc(d.id)+'">'+ico("folder",20)+'<span class="ot">'+esc(d.nombre||"(sin nombre)")+'</span>'+(cer?'<span class="tag">'+et+'</span>':(par?'<span class="tag">parecida</span>':''))+'</button>'; };
  function pintaBus262(){ var q=_bi.value, L=buscaTareasMover(q, t), hay=!!_n179(q), vis={}; L.forEach(function(o){ vis[o.d.id]=1; }); var ex=EXTRA.filter(function(d){ return !vis[d.id]; });
    if(_bo) _bo.style.display=hay?"none":"";
    _br.innerHTML=!hay?"":((L.length||ex.length)?L.map(function(o){ return fila262(o.d, o.cerrada, false); }).join("")+ex.map(function(d){ return fila262(d, false, true); }).join(""):'<div class="bus253x">No encontré “'+esc(q.trim())+'” en tus tareas.</div>');
    if(hay && L.length<3 && _n179(q).length>=3) semDeb(q, t.id, function(r){ if(!document.getElementById("mov225") || _bi.value!==r.q) return; EXTRA=r.d; pintaBus262(); }, _sem); }
  if(_bi) _bi.addEventListener("input", function(){ EXTRA=[]; pintaBus262(); });
  if(!opts.soloNg) refinaSug(S, function(ids){ if(!document.getElementById("mov225") || !_bo) return; RF=aplicaRefino(S, ids); _bo.innerHTML=listaMover(t, RF); });
  v.addEventListener("click", function(ev){ ev.stopPropagation(); if(ev.target.closest("[data-lupa253]")){ if(_bi) enfoca252(_bi); return; }
    var b=ev.target.closest("[data-movto],[data-movnueva],[data-movplatica]"), r="";
    if(b && b.hasAttribute("data-movnueva")){   /* build 249: Nueva pide el nombre; al crear, se va a la tarea nueva */
      var uso9=opts.lote?usa245():(ixs||[ix]); if(!uso9.length){ toast("Ninguno desde esa fecha"); return; }
      v.remove();
      pideNombreNueva(t, uso9, function(nombre){ var n9=null, r9="";
        if(opts.lote){ r9=aplicaLote(t, uso9, "nueva", "", nombre); window.__sel245=null; n9=tareaNuevaDe(t, uso9); }
        else if(ixs){ n9=nuevaG(t, ixs, false, nombre); r9=n9?"Tarea nueva “"+n9.nombre+"”; "+(ixs.length>1?"la plática pasó":"el mensaje pasó")+" ahí.":""; }
        else { n9=nuevaDesdeMsg(t, ix, nombre); if(n9) guardaRegla("nueva", t, [ix], n9); r9=n9?"Tarea nueva “"+n9.nombre+"”; el mensaje pasó ahí.":""; }
        if(r9 && r9!=="ok") toast(r9); if(n9) vaATareaNueva(n9); else render(); });
      return; }
    if(b && b.hasAttribute("data-movto")){ try{ var _dc2=tareas.filter(function(z){ return z.id===b.getAttribute("data-movto"); })[0]; if(_dc2 && _dc2.id!==t.id && esCerradaVinc(_dc2)) reabre(_dc2, "recibe mensajes movidos desde otra tarea"); }catch(e){} }
    if(b && opts.lote){ var uso=usa245(); if(!uso.length){ toast("Ninguno desde esa fecha"); return; }
      r=aplicaLote(t, uso, b.hasAttribute("data-movnueva")?"nueva":(b.hasAttribute("data-movplatica")?"ng":"mover"), b.getAttribute("data-movto")||""); v.remove(); window.__sel245=null; if(r && r!=="ok") toast(r); render(); return; }
    if(b){ if(b.hasAttribute("data-movnueva")){ var n=ixs?nuevaG(t, ixs):nuevaDesdeMsg(t, ix); if(n && !ixs) guardaRegla("nueva", t, [ix], n); r=n?"Tarea nueva “"+n.nombre+"” en Falta info; "+(ixs&&ixs.length>1?"la plática pasó":"el mensaje pasó")+" ahí.":""; }
      else if(b.hasAttribute("data-movplatica")){ (ixs||[ix]).forEach(function(i){ var rr=soloPlatica(t, i); if(rr) r=rr; }); reglasPorMsg("platica", t, ixs||[ix], null); }
      else { var id=b.getAttribute("data-movto"); try{ var _dc=tareas.filter(function(z){ return z.id===id; })[0]; if(_dc && _dc.id!==t.id && esCerradaVinc(_dc)) reabre(_dc, "recibe mensajes movidos desde otra tarea"); }catch(e){} r=(id===t.id)?okG(t, ixs||[ix]):(ixs?moverG(t, ixs, id):(guardaRegla("mover", t, [ix], tareas.filter(function(z){ return z.id===id; })[0]), mueveMensaje(t, ix, id))); }
      v.remove(); if(r) toast(r); render(); return; }
    if(ev.target===v || ev.target.closest("[data-movx]")) v.remove(); });
}
/* ===================== build 237 (Salvador 19:42): ACOMODO POR PLÁTICA, NO POR MENSAJE =====================
   Plática = mensajes de WhatsApp del mismo contacto en la misma tarea con menos de 30 min entre uno y otro. En el Inicio, UNA tarjeta
   por plática con duda (duda_tarea, o tarea que creó la IA y que Salvador aún no clasifica): contacto · "N mensajes" (sin la pura
   plática: regla del 230) · extracto (el de más contenido) · "creo que es: <tarea>" · OK · Mover · Nueva para TODA la plática; al
   tocarla se despliegan sus mensajes. Dentro de la tarea: lo que acomodó Claude lleva "acomodó Claude" (al tocar: OK · Mover · Nueva);
   con duda, los botones van visibles UNA vez por plática. Cada OK/Mover/Nueva deja una regla en bitacora_personas/<usuario>.acomodo_reglas.
   OJO (encontrado 237): el servidor (push.php wa_multimedia) NO guarda el campo duda_tarea que manda la Mac 18q; la Mac sí deja su
   nota privada "no estoy seguro del tema del mensaje de X de las HH:MM; … puede ser de «Y»". Mientras se arregla el servidor, la duda
   se recupera de esa nota. */
var DUDA_NOTA_RE=/no estoy seguro del tema del mensaje de (.+?) de las (\d{1,2}:\d{2});[^«]*«([^»]+)»/i;
function dudasDeNotas(t){
  var out=[]; (t&&t.msgs||[]).forEach(function(n){ if(!n || !(n.nota_ia || /Nota IA/.test(String(n.t||"")))) return; var m=String(n.t||"").match(DUDA_NOTA_RE); if(m) out.push({c:m[1].trim(), h:m[2].length===4?"0"+m[2]:m[2], alt:m[3].trim()}); });
  return out;
}
/* pone duda_tarea (de_nota:1) en el mensaje que dice la nota de la Mac; no toca lo ya resuelto */
function aplicaDudasNota(t){
  var D=dudasDeNotas(t); if(!D.length) return 0; var n=0;
  D.forEach(function(d){ var c=_nn(d.c); (t.msgs||[]).forEach(function(x){ if(!x || x.duda_tarea || x.duda_resuelta || !x.wa_in || !x.wa_c) return;
      var h=String(x.h||""); if(h.length===4) h="0"+h; if(h!==d.h || _nn(String(x.wa_c)).indexOf(c)<0 && c.indexOf(_nn(String(x.wa_c)))<0) return;
      var a=tareas.filter(function(z){ return z && z.id!==t.id && _nn(z.nombre)===_nn(d.alt); })[0];
      x.duda_tarea={alternativa_id:a?a.id:"", alternativa_nombre:d.alt, de_nota:1}; n++; }); });
  return n;
}
function confirmado237(x){ return !!(x && ((x.acomodo && typeof x.acomodo==="object") || x.duda_resuelta)); }
/* ¿lo acomodo Claude solo? marca explicita (acomodo/por:"ia") o entrante de WhatsApp que cayo solo (no movido ni arrastrado a mano) */
function acomodoIA(x){
  if(!x || x.oculto || x.eliminado || confirmado237(x)) return false;
  if(x.acomodo==="ia" || x.por==="ia" || x.acomodado_por==="ia") return true;
  return !!(+x.wa_in===1 && x.wa_c && !x.movido_de && x.origen!=="arrastrado" && x.k!=="bo");
}
function esPlatica(t, x){ try{ return !esImp(t, x); }catch(e){ return false; } }
function platicas237(t){
  var L=[]; (t&&t.msgs||[]).forEach(function(x,ix){ if((msgVisible(x) || (x && x.oculto && x.movido_a && !x.eliminado)) && +x.wa_in===1 && x.wa_c && !esNotaIA(x)) L.push({x:x, ix:ix, ts:+x.ts||0}); });   /* 238 + 245: las notas de la IA no son mensajes del Acomodo */
  /* 238: lo movido uno por uno sigue contando en su plática */
  L.sort(function(a,b){ return a.ts-b.ts; });
  var ult={}, G=[];
  L.forEach(function(o){ var c=nombreLimpio(o.x.wa_c), g=ult[c];
    if(g && o.ts-g.ts1<30*60000){ g.ixs.push(o.ix); g.ts1=o.ts; } else { g={t:t, contacto:c, ixs:[o.ix], ts0:o.ts, ts1:o.ts}; ult[c]=g; G.push(g); } });
  G.forEach(function(g){ var xs=g.ixs.map(function(i){ return t.msgs[i]; });
    g.duda=xs.filter(function(x){ return x.duda_tarea && !x.duda_resuelta && !x.oculto; })[0]||null; g.tuvoDuda=xs.some(function(x){ return !!x.duda_tarea; });
    g.ia=xs.some(acomodoIA); g.listos=xs.every(function(x){ return confirmado237(x) || x.oculto; });
    var imp=xs.filter(function(x){ return !x.oculto && !esSaludo239(t, x); }); g.n=imp.length; g.soloSaludo=!imp.length && xs.some(function(x){ return !x.oculto && !confirmado237(x); });   /* 239 */
    var base=imp.length?imp:xs, _tx=function(x){ return _txMsg(x).replace(/^[^:\n]{1,40}:\s*/,""); };
    var mejor=base.slice().sort(function(a,b){ return _tx(b).length-_tx(a).length; })[0]; g.extractoX=mejor||null; g.extracto=mejor?_tx(mejor):""; });   /* 245: se guarda el mensaje para mostrar su imagen */
  return G;
}
/* tarea que creo la IA y Salvador aun no clasifica */
function sinClasificarIA(t){ return !!t && t.creada_por==="ia_revisor" && t.por_autorizar===true && !clasif236(t) && !t.cierre; }
function botonesG(ix, ixs, extra){ var g=esc(ixs.join(","));
  return '<div class="ac226'+(extra||"")+'" data-acix="'+ix+'" data-acg="'+g+'"><button data-acok="'+ix+'">OK</button><span>·</span><button data-acmov="'+ix+'">Mover</button><span>·</span><button data-acnueva="'+ix+'">Nueva</button><span>·</span><button data-acdato="'+ix+'">Dato</button><span>·</span><button data-acng="'+ix+'">No guardar</button></div>'; }
/* build 238 (Salvador 20:17): el acomodo es por MENSAJE. Cada globo que acomodó Claude lleva el iconito de Claude en su esquina
   (los saludos y la plática sin contenido, no); al tocar ESE globo: OK · Mover · Nueva para ese mensaje solo. Con duda: visibles. */
/* saludo / plática sin contenido: Claude ya la clasificó (msg_imp 0) o es un saludo o acuse corto */
function esSaludo238(t, x){
  var mi=(t && t.msg_imp && typeof t.msg_imp==="object")?t.msg_imp:{}, k=msgId(x); if(k && Object.prototype.hasOwnProperty.call(mi,k)) return +mi[k]!==1;
  if(x.url || x.tipo==="foto" || x.tipo==="documento" || x.img || x.data) return false;
  var tx=_fsa(_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,"")).replace(/[^a-z0-9ñ ]+/g," ").replace(/\s+/g," ").trim(), w=tx?tx.split(" "):[];
  if(!w.length) return true; if(/\d/.test(tx)) return false;
  if(w.length<=6 && /^(hola|ok|okay|oki|va|vale|sale|gracias|muchas gracias|mil gracias|de nada|buen dia|buenos dias|buenas|buenas tardes|buenas noches|saludos|ahi estaremos|ahi nos vemos|perfecto|listo|si|sip|claro|excelente|enterado|enterada|de acuerdo|esta bien|muy bien|que bien|igualmente|con gusto|gusto en saludarte|hola salvador|jaja\w*|ja ja)( [a-z]+)?( [a-z]+)?$/.test(tx)) return true;
  return w.length<=2;
}
/* build 239 (Salvador): en el Acomodo, saludo = la regla del 230 (menos de 60 letras, sin cifra, fecha, pregunta ni archivo) o la
   lista ampliada (igualmente, jaja, emojis solos, saludos, abrazo, bonita semana, va, sale, ok, gracias, de nada, perfecto, listo,
   ahí estaremos). Lo que Claude marcó importante (msg_imp 1) nunca es saludo. */
var SALUDO239=/^(igualmente|ja(ja)+j?a?|je(je)+|ji(ji)+|jajaja\w*|hola|ola|buen dia|buenos dias|buenas|buenas tardes|buenas noches|saludos|un abrazo|abrazo|abrazos|bonita semana|bonito dia|bonita noche|feliz noche|feliz dia|que descanses|va|vale|sale|ok|okay|oki|gracias|muchas gracias|mil gracias|de nada|perfecto|listo|ahi estaremos|ahi nos vemos|si|sip|claro|excelente|enterado|enterada|de acuerdo|con gusto|igual|igualmente \w+|gracias \w+|ok \w+|sale \w+|va \w+)$/;
function esSaludo239(t, x){
  if(!x) return true;
  var mi=(t && t.msg_imp && typeof t.msg_imp==="object")?t.msg_imp:{}, k=msgId(x); if(k && Object.prototype.hasOwnProperty.call(mi,k) && +mi[k]===1) return false;
  if(x.url || x.tipo==="foto" || x.tipo==="documento" || x.img || x.data) return false;
  var raw=_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,""), tx=_fsa(raw).replace(/[^a-z0-9ñ ]+/g," ").replace(/\s+/g," ").trim();
  if(!tx) return true;                                  /* emojis o signos solos */
  if(SALUDO239.test(tx)) return true;
  return esPlatica(t, x);                            /* la regla del 230 */
}
/* ===================== build 242 (Salvador 21:58, "Decoración Navideña Cumbres"): globos limpios estilo iMessage =====================
   Bajo el globo nada de "Salvador · 17:20" ni "acomodó Claude": solo palomitas en los enviados y el destello de Claude en los que acomodó.
   Tocar el globo = hoja con canal, fecha y hora, de quién, entrega, quién lo acomodó y OK · Mover · Nueva · Dato. Separadores de día.
   Las notas que escribió la IA (aunque traigan otro autor: "HILO (", "Nota IA", "Chuy pregunta (3:22pm)…") son nota gris de Claude. */
var NIA242_RE=/^\s*(?:📝\s*)?(?:HILO\s*\(|IA\s+nota\b|IA\s+avis[oó](?=\s|$)|Nota\s+IA\b|IA\s*:|Resumen\s*:|Contexto\s*:)/i;
var NIA242_PAT=/^[A-ZÁÉÍÓÚÑ][\wáéíóúñÁÉÍÓÚÑ.]*(?:\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñÁÉÍÓÚÑ.]*){0,3}\s+(?:(?:pregunta|dice|pide|contesta|responde|avisa)\s*\(\s*\d{1,2}:\d{2}|confirma\b)/;
function textoSinAutor(x){ var tx=String((x&&(x.t||""))||""); if(x && x.wa_c) tx=tx.replace(/^[^:\n]{1,40}:\s*/,""); return tx; }
function esNotaIA(x){
  if(!x || x.hab) return false;
  if(x.nota_ia) return true;
  var tx=textoSinAutor(x);
  if(NIA242_RE.test(tx)){ if(/^\s*IA\s*:/i.test(tx) && (llevaPalomitas(x) || x.wa_pid || x.wa_auto)) return false; return true; }
  return NIA242_PAT.test(tx);
}
function originalDe(x){
  if(!x || !(+x.wa_in===1 || x.wa_c) || x.k==="bo") return "";
  var m=textoSinAutor(x).match(/[“"«]([^”"»]{3,400})[”"»]/); return m?m[1].trim():"";
}
function vNotaIA(x, mid){
  var ab=!!(window.__nia242||{})[mid], tx=sinEmojiUI(String(x.t||"")).replace(/\s+/g," ").trim();
  return '<div class="nia242'+(ab?' ab':'')+'" data-nix="'+esc(mid)+'"><span class="niai">'+SVG_DESTELLO+'</span><span class="niat">'+esc(tx)+'</span><button class="niam" data-nia242="'+esc(mid)+'">'+(ab?'ver menos':'ver más')+'</button></div>';
}
function sepDia(x){
  var ts=+(x&&x.ts)||0; if(!ts) return ""; var d=iso(new Date(ts)); if(window.__dia242===d) return ""; window.__dia242=d;
  var h=hoy(), lab=d===h?"Hoy":(dDif(d,h)===1?"Ayer":fechaMovCorta(d));
  return '<div class="dia242"><span>'+esc(lab)+'</span></div>';
}
/* ===================== build 244 (Salvador 6-oct 06:40): fotos de WhatsApp como miniatura, nunca como nombre de archivo =====================
   Un mensaje cuyo texto es SOLO un nombre de imagen (wa_1791128012427.jpeg/jpg/png/webp/heic) y trae url o archivo se pinta como miniatura.
   Varias seguidas de la misma persona (menos de 2 min entre una y otra) van en UN globo en cuadrícula, estilo iMessage; cuentan como un elemento.
   Sin url: ícono de foto y la palabra "Foto" (nunca el nombre del archivo). Tocar una miniatura abre el visor con todas las del globo. */
var FOTO_NOM244=/^[^\s:\/\\]+\.(?:jpe?g|png|webp|heic|heif)$/i;
function textoFoto(x){ return sinEmojiUI(quitaEtiquetasWA(String((x&&x.t)||""))).replace(/^[^:\n]{1,40}:\s*/,"").trim(); }
function esFoto(x){ return !!x && x.k!=="bal" && !x.hab && !x.prog && FOTO_NOM244.test(textoFoto(x)); }
function urlFoto(x){ var u=x&&(x.url||x.archivo||x.file_url||x.src||""); return (typeof u==="string" && u)?u:""; }
function autorFoto(x){ var m=sinEmojiUI(String((x&&x.t)||"")).match(/^([^:\n]{1,40}):\s*/); return nombreLimpio((m&&m[1])||(x&&(x.wa_c||x.chat))||""); }
function claveFoto(x){ return _n179(autorFoto(x))+"|"+(+x.wa_in===1?1:(+x.wa_in===0?0:2))+"|"+(x.k||""); }
var SVG_FOTO244='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.4"/><circle cx="9" cy="10.5" r="1.7"/><path d="M4 17l4.6-4.4 3.4 3.2 3-2.6L20 16.2"/></svg>';
/* los índices de las fotos que siguen a la de ix y van en el mismo globo (misma persona, <2 min entre una y otra, nada en medio) */
function grupoFotos(t, ix, ok){
  var ms=t.msgs||[], out=[ix], x=ms[ix], ult=x;
  for(var j=ix+1;j<ms.length;j++){ var z=ms[j]; if(!z || z.oculto || z.eliminado) continue;
    if(!esFoto(z) || claveFoto(z)!==claveFoto(x)) break;
    var d=(+z.ts||0)-(+ult.ts||0); if(!(+z.ts && +ult.ts) || d<0 || d>=120000) break;
    if(ok && !ok(z, j)) break; out.push(j); ult=z; }
  return out;
}
function vFotos(t, ixs, mid){
  var ms=t.msgs||[], x0=ms[ixs[0]], n=ixs.length, saliente=(x0.k==="bo" || esSaliente(x0)), nom=esSaliente(x0)?"":autorFoto(x0);
  var col=n===1?1:(n===2||n===4?2:3);
  var tl=ixs.map(function(i){ var z=ms[i], u=urlFoto(z);
    return u?'<button class="ft244" data-f244="'+i+'" aria-label="Foto"><img src="'+esc(u)+'" alt="Foto" loading="lazy" onerror="this.parentNode.classList.add(\'err\')"><span class="fti">'+SVG_FOTO244+'<small>Foto</small></span></button>'
            :'<span class="ft244 sin"><span class="fti">'+SVG_FOTO244+'<small>Foto</small></span></span>'; }).join("");
  return '<div class="b '+(saliente?"bo":"bi")+' bfoto244 c'+col+(n>1?' multi':'')+'" data-mix="'+ixs[0]+'" data-g244="'+ixs.join(",")+'">'+
    (nom?'<b class="cn fn244">'+esc(nombreVisible(nom, t))+'</b>':'')+'<div class="gf244">'+tl+'</div>'+
    '<span class="st">'+icoCl(t,x0,ixs[0])+palomitasHTML(ms[ixs[n-1]])+'</span></div>';
}
function bindFotos(raiz, t){
  Array.prototype.forEach.call(raiz.querySelectorAll("[data-f244]"), function(el){ el.onclick=function(ev){ ev.stopPropagation();
    var g=el.closest("[data-g244]"), ixs=g?String(g.getAttribute("data-g244")||"").split(",").map(Number):[+el.getAttribute("data-f244")], lst=[], k=0, me=+el.getAttribute("data-f244");
    ixs.forEach(function(i){ var z=(t.msgs||[])[i], u=urlFoto(z); if(!u) return; if(i===me) k=lst.length; lst.push({img:true, data:u, url:u, de:autorFoto(z), ts:+z.ts||Date.now()}); });
    if(lst.length) abreVisor(lst, k); }; });
}
/* ===================== build 245 (Salvador 6-oct 06:47-06:56) =====================
   1) Nombres de imagen en el texto ("wa_1791209996617.jpeg") = chip amarillo subrayado con ícono (y miniatura si hay url); tocar abre el visor
      (el de siempre, con X). Sin url: gris y "foto no disponible".
   4) Lo SALIENTE (wa_in 0, origen wa_saliente, fromMe, de:"salvador" con contacto) se pinta de Salvador: derecha, verde, sin el nombre del otro. */
function esSaliente(x){
  if(!x) return false;
  return x.wa_in===0 || x.wa_in==="0" || x.origen==="wa_saliente" || x.fromMe===true || x.from_me===true || x.wa_fromMe===true || x.fromme===true ||
    (x.de==="salvador" && !!(x.wa_c || x.chat) && x.k!=="bal");
}
/* el "autor" de un saliente no es la otra persona: Enviado, Audio enviado, Salvador, o el nombre del propio contacto */
function autorSalida(x, pre){
  var n=_n179(pre), c=_n179(x&&(x.wa_c||x.chat)||"");
  return /^(salvador|yo|tu|enviado|audio enviado|archivo enviado|mensaje enviado|nota de voz enviada|foto enviada|tu whatsapp.*)$/.test(n) || (!!c && (n===c || c.indexOf(n)===0 || n.indexOf(c)===0));
}
var IMG_RE245=/(^|[\s(“"«:])([\w\-.]+\.(?:jpe?g|png|webp|heic|heif))(?=$|[\s).,;:”"»!?])/gi;
var SVG_FOTO245='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.4"/><circle cx="9" cy="10.5" r="1.6"/><path d="M4 17l4.6-4.4 3.4 3.2 3-2.6L20 16.2"/></svg>';
function tieneImg(s){ IMG_RE245.lastIndex=0; var r=IMG_RE245.test(String(s||"")); IMG_RE245.lastIndex=0; return r; }
/* texto a HTML (ya escapado) con los nombres de imagen convertidos en chip; x = el mensaje (de ahí sale la url si hay UN solo nombre) */
function htmlTx(str, x){
  str=String(str==null?"":str); var ms=[], m; IMG_RE245.lastIndex=0;
  while((m=IMG_RE245.exec(str))){ ms.push({i:m.index+m[1].length, n:m[2]}); }
  IMG_RE245.lastIndex=0;
  if(!ms.length) return esc(str);
  var url=(ms.length===1)?urlFoto(x):"", out="", last=0;
  ms.forEach(function(o){ out+=esc(str.slice(last,o.i));
    out+=url?'<button type="button" class="img245" data-img245="'+esc(url)+'" aria-label="Ver la foto">'+SVG_FOTO245+'<span class="in245">'+esc(o.n)+'</span><img class="it245" src="'+esc(url)+'" alt="" loading="lazy"></button>'
            :'<span class="img245 sin">'+SVG_FOTO245+'<span class="in245">'+esc(o.n)+'</span><small> · foto no disponible</small></span>';
    last=o.i+o.n.length; });
  return out+esc(str.slice(last));
}
(function(){ if(typeof document==="undefined" || window.__img245) return; window.__img245=1;
  document.addEventListener("click", function(ev){ var b=ev.target.closest && ev.target.closest("[data-img245]"); if(!b) return;
    ev.stopPropagation(); ev.preventDefault(); var u=b.getAttribute("data-img245"); if(!u) return;
    abreVisor([{img:true, data:u, url:u, de:"", ts:Date.now()}], 0); }, true);
})();
/* ===================== build 247 (Salvador 6-oct 07:25): MENÚ COMPLETO AL TOCAR CUALQUIER GLOBO =====================
   Todos: Mover · No guardar · Nueva · Dato. Propios de Salvador: Editar · Eliminar · Es para Claude. "No guardar" en uno ya acomodado = sacarlo de
   esta tarea (oculto, oculto_motivo "no_es_de_aqui", no se borra, Historial con Deshacer). Tarjeta "Te pregunta" (y sus Dato:): Mover · No es de aquí · Ya la contesté. */
function botones247(ix){ return '<div class="ac226 hj242" data-acix="'+ix+'" data-acg="'+ix+'"><button data-acmov="'+ix+'">Mover</button><span>·</span><button data-acng="'+ix+'">No guardar</button><span>·</span><button data-acnueva="'+ix+'">Nueva</button><span>·</span><button data-acdato="'+ix+'">Dato</button></div>'; }
function botonesPropio(){ return '<div class="ac226 hj242 prop247"><button data-d247="edit">Editar</button><span>·</span><button data-d247="del">Eliminar</button><span>·</span><button data-d247="claude" class="cl247">Es para Claude</button></div>'; }
function propio247(x){ return !!x && !x.oculto && !x.nota_ia && !esNotaIA(x) && x.k!=="bal" && ((x.k==="bo" && (!x.de || x.de===yo)) || esSaliente(x)); }
function yaSalio(x){ return !!(x && (x.wa || x.wa_c || x.wa_auto || x.wa_ok || x.wa_pid || esSaliente(x) || String(x.canal||"").indexOf("ext:")===0)); }
function aparta247(t, ix, motivo){
  var x=(t.msgs||[])[ix]; if(!x || x.oculto) return false; if(!x.ts) x.ts=Date.now()+ix;
  var ahora=Date.now(); x.oculto=true; x.oculto_ts=ahora; x.oculto_por=yo||""; x.oculto_motivo=motivo; x.acomodo={ok:0, ts:ahora, por:yo||""};
  try{ censoAcomodo(t, x, t.id, "", motivo); }catch(e){} return true;
}
function noEsDeAqui(t, ix){
  if(!aparta247(t, ix, "no_es_de_aqui")) return false; var x=t.msgs[ix]; guarda(t);
  try{ hist240("No es de aquí (1 mensaje)", t, {tipo:"ng_lote", tss:[x.ts]}); }catch(e){} return true;
}
function accion247(t, ix, a, v){
  var x=(t.msgs||[])[ix]; if(!x) return;
  if(a==="edit"){ if(v.querySelector(".ed247")) return; var c=v.querySelector(".h225c"), d=document.createElement("div"); d.className="ed247";
    d.innerHTML='<div class="row252"><textarea id="ed247t" rows="4"></textarea>'+micBtn()+'</div><div class="ed247b"><button class="hop" data-d247="save">Guardar</button><button class="hop" data-d247="cancel">Cancelar</button></div>';
    c.appendChild(d); var ta=d.querySelector("textarea"); ta.value=String(x.t||""); enfoca252(ta); var mb0=d.querySelector("[data-mic252]"); if(mb0) mb0.onclick=function(ev){ ev.stopPropagation(); dictaACampo(mb0, ta); }; return; }
  if(a==="cancel"){ var e0=v.querySelector(".ed247"); if(e0){ paraDictadosCampo(e0); e0.remove(); } return; }
  if(a==="save"){ var ta2=v.querySelector("#ed247t"), nv=ta2?String(ta2.value||"").trim():""; if(!nv){ toast("El texto no puede quedar vacío"); return; }
    if(nv!==String(x.t||"")){ x.t_original=x.t_original||x.t; x.t=nv; x.editado=Date.now(); guarda(t); }
    var enviado=yaSalio(x); v.remove(); render(); toast(enviado?"Ya se envió, solo se corrige aquí":"Corregido"); return; }
  if(a==="del"){ if(aparta247(t, ix, "eliminado")){ guarda(t); try{ hist240("Eliminó un mensaje propio", t, {tipo:"ng_lote", tss:[x.ts]}); }catch(e){} }
    v.remove(); render(); toast("Apartado, no borrado. Deshacer en el Historial"); return; }
  if(a==="claude"){ v.remove(); esParaClaude(t, ix); return; }
}
/* "Es para Claude": ese texto va al cerebro de dictado (238) como indicación, ejecuta las órdenes y deja su tarjeta Hecho / Me falta */
function esParaClaude(t, ix){
  var x=(t.msgs||[])[ix]; if(!x) return false; var tx=String(x.tr||x.t||"").trim(); if(!tx) return false;
  if(aparta247(t, ix, "es_para_claude")){ try{ hist240("Es para Claude: “"+(tx.length>50?tx.slice(0,49)+"…":tx)+"”", t, {tipo:"ng_lote", tss:[x.ts]}); }catch(e){} }
  var _ya254=yaSalio(x), _con254=contactoDeMsg(x)||(String(x.canal||"").indexOf("ext:")===0?String(x.canal).slice(4):"")||x.wa_auto||"";
  completaRevision(t, tx, {sinRevision:true});
  if(_ya254) avisoYaLlego(_con254);   /* build 254: ya salió por WhatsApp: no se borra por servidor, se le dice cómo */
  return true;
}
function abreMenuPregunta(t, ixDato){
  var p=null; try{ p=preguntaParaMi(t); }catch(e){} if(!p) return;
  var _v0=document.getElementById("det242"); if(_v0) _v0.remove();
  var v=document.createElement("div"); v.className="leemask"; v.id="det242";
  var ds=(typeof ixDato==="number" && ixDato!==p.ix && t.msgs[ixDato] && !t.msgs[ixDato].oculto)?t.msgs[ixDato]:null;
  v.innerHTML='<div class="mov225" role="dialog" aria-label="Te pregunta"><div class="h225g"></div><div class="h225h"><b>'+esc(p.todos?"Piden a todos":"Te pregunta")+' · '+esc(p.de)+'</b><button class="h225b" data-detx="1" aria-label="Cerrar">'+ico("x",14)+'</button></div>'+
    '<div class="h225c"><p class="h225v0">“'+esc(p.t)+'”</p>'+(ds?'<p class="h225v0">Dato: '+esc(String(ds.t||"").replace(/^[^:\n]{1,40}:\s*/,""))+'</p>':'')+
    '<div class="det242b det247"><div class="ac226 hj242 pt247"><button data-p247="mover">Mover</button><span>·</span><button data-p247="noaqui">No es de aquí</button><span>·</span><button data-p247="contesta">Ya la contesté</button><span>·</span><button data-p247="del">Eliminar</button></div></div></div></div>';
  document.body.appendChild(v);
  v.addEventListener("click", function(ev){
    var b=ev.target.closest("[data-p247]");
    if(b){ ev.stopPropagation(); var a=b.getAttribute("data-p247"); v.remove(); var ixs=[p.ix]; if(ds){ var di=t.msgs.indexOf(ds); if(di>=0 && ixs.indexOf(di)<0) ixs.push(di); }
      if(a==="mover") abreMover(t, p.ix, ixs);
      else if(a==="del"){ ixs.forEach(function(i){ aparta247(t, i, "eliminado"); }); guarda(t); try{ hist240("Eliminó la pregunta de “"+p.de+"”", t, {tipo:"ng_lote", tss:ixs.map(function(i){ return (t.msgs[i]||{}).ts; })}); }catch(e){} render(); toast("Apartada, no borrada. Deshacer en el Historial"); }   /* build 260: oculto:true, nunca se borra */
      else if(a==="noaqui"){ var q=t.msgs[p.ix], alt=q&&q.duda_tarea&&q.duda_tarea.alternativa_id, d=alt?tareaId240(alt):null, r="";
        if(d && d.id!==t.id){ r=moverG(t, ixs, d.id); render(); toast(r||"Quitada de aquí. Deshacer en el Historial"); }   /* con la alternativa que propuso Claude, pasa allá */
        else abreMover(t, p.ix, ixs); }   /* build 260: si no, la hoja Vincular · Nueva: ahí elige a dónde va (o Solo plática) */
      else if(a==="contesta"){ var y=t.msgs[p.ix]; if(y){ y.contestada247=Date.now(); guarda(t); try{ hist240("Te pregunta: ya la contesté", t, {tipo:"contestada247", ts:y.ts}); }catch(e){} } render(); toast("Listo: ya no te la pregunta"); }
      return; }
    if(ev.target===v || ev.target.closest("[data-detx]")) v.remove(); });
}
/* la hoja del detalle del globo */
function abreDetalle(t, ix){
  var x=(t.msgs||[])[ix]; if(!x) return; var cx=""; try{ cx=canalDe(x,t); }catch(e){} var _v0=document.getElementById("det242"); if(_v0) _v0.remove();
  var canal=(/correo/i.test(String(x.origen||""))||x.correo||x.tipo==="correo")?"Correo":((x.wa_c||x.wa_auto||x.wa_pid||+x.wa_in===1||/^wa_/.test(String(x.origen||""))||cx.indexOf("ext:")===0)?"WhatsApp":"App");
  var fecha=(x.ts?fechaBonita(iso(new Date(+x.ts))):"")+(x.h?" · "+x.h:"");
  var de=""; try{ de=partesMsg(x).de||autorMsg(x,t)||""; }catch(e){}
  if(esNotaIA(x)) de="Claude (nota)"+(x.wa_c?" · sobre "+nombreCorto(x.wa_c).split(" ")[0]:"");
  var ent="—"; try{ if(llevaPalomitas(x)){ var nv=nivelMsgWA(x); ent=nv>=0?["En cola","Enviado","Entregado","Leído"][nv]:"Sin confirmar"; } else if(+x.wa_in===1) ent="Recibido"; }catch(e){}
  var aco=x.movido_de?"Tú (lo moviste desde “"+tareaCorta({nombre:x.movido_de.nombre||""})+"”)":((x.acomodo&&x.acomodo.por==="auto")?"Claude (plática)":((x.acomodo&&x.acomodo.ok===1)?"Confirmado por ti":(acomodoIA(x)?"Claude":"—")));
  var fila=function(k,v){ return '<div class="mfr"><span class="k">'+esc(k)+'</span><span class="v">'+esc(v)+'</span></div>'; };
  var hay=function(sel){ return !!document.querySelector('.msgs [data-mix="'+ix+'"] '+sel); };
  var v=document.createElement("div"); v.className="leemask"; v.id="det242";
  v.innerHTML='<div class="mov225" role="dialog" aria-label="Detalle del mensaje"><div class="h225g"></div><div class="h225h"><b>Detalle</b><button class="h225b" data-detx="1" aria-label="Cerrar">'+ico("x",14)+'</button></div>'+
    '<div class="h225c"><div class="mf225">'+fila("Canal", canal)+fila("Fecha", fecha||"—")+fila("De", de||"—")+fila("Entrega", ent)+fila("Lo acomodó", aco)+'</div>'+
    (tieneImg(x.t)?'<p class="h225v0">'+htmlTx(textoSinAutor(x), x)+'</p>':'')+   /* build 245: la foto se abre desde aquí */
    (x.analisis?'<p class="h225v0">'+esc(x.analisis)+'</p>':'')+
    (!x.oculto?'<div class="det242b det247">'+(((+x.wa_in===1 || x.wa_c) && !confirmado237(x))?botonesG(ix, [ix], " hj242"):botones247(ix))+(propio247(x)?botonesPropio():'')+'</div>':'')+   /* build 247: menú completo en todos los globos */
    ((x.oculto && puedeRestaurar(x))?'<button class="hop" data-d252="restaura">Volver a mostrarlo en “'+esc(tareaCorta(t))+'”</button>':'')+
    (contactoDeMsg(x)?'<button class="hop" data-d252="plat">Ver toda la plática con '+esc(nombreCorto(contactoDeMsg(x)).split(" ")[0])+'</button>':'')+
    ((hay("[data-mdel]")||hay("[data-wacan]"))?'<button class="hop det242x" data-detdel="1">'+(hay("[data-wacan]")?"Cancelar este WhatsApp":"Borrar este mensaje")+'</button>':'')+
    '</div></div>';
  document.body.appendChild(v);
  bindAcomodo(v, function(){ return t; });
  v.addEventListener("click", function(ev){
    var _b252=ev.target.closest("[data-d252]"); if(_b252){ ev.stopPropagation(); var _k252=_b252.getAttribute("data-d252");
      if(_k252==="plat"){ v.remove(); abrePlatica(contactoDeMsg(x)); return; }
      if(_k252==="restaura"){ if(restaura252(t, ix)){ v.remove(); if(vista==="hilo" && abierta===t.id) render(); abreDetalle(t, ix); toast("Volvió a la tarea"); } return; } }
    var _b247=ev.target.closest("[data-d247]"); if(_b247){ ev.stopPropagation(); accion247(t, ix, _b247.getAttribute("data-d247"), v); return; }
    if(ev.target.closest("[data-detdel]")){ var b=document.querySelector('.msgs [data-mix="'+ix+'"] [data-wacan], .msgs [data-mix="'+ix+'"] [data-mdel]'); v.remove(); if(b) b.click(); return; }
    if(ev.target.closest(".ac226 button")){ if(v.parentNode) v.remove(); return; }
    if(ev.target===v || ev.target.closest("[data-detx]")) v.remove(); });
}

/* ===================== build 254 (Salvador 10:29, "IQOSA Proyecto"): LO DE ABAJO ES PARA CLAUDE, NUNCA SALE SOLO POR WHATSAPP =====================
   Un dictado con instrucciones para Claude ("…para que le comentes que… a ver si tú le puedes poner el mensaje…") salió tal cual al contacto.
   Ahora: en toda tarea con WhatsApp el cuadro de abajo manda por defecto a CLAUDE (indicación: el flujo de dictado 249–251, modo "pesado").
   WhatsApp directo solo con el selector (chip a la izquierda del cuadro); vuelve solo a Claude tras cada envío. Aun en WhatsApp, antes de mandar
   se clasifica el texto (regla barata y, si duda, Claude): si suena a indicación, hoja "Esto parece indicación para Claude"; y todo directo muestra
   su vista previa "Se va a mandar a <contacto>:" con Mandar / Cancelar. */
window.__dest254=window.__dest254||{};
function waDest(t){
  try{ if(!t || modoClaude(t)) return ""; var c=canalActual(t); if(c.id==="sup") return "";
    if(c.ext) return c.nom; if(c.id.indexOf("dm:")===0) return c.wa||"";
    if(c.id==="todo"){ var r=responsableExt(t); if(r) return r; var ex=externosDe(t); if(ex.length===1) return ex[0]; }
  }catch(e){} return "";
}
function modoWA(t){ return !!(t && typeof window!=="undefined" && window.__dest254 && window.__dest254[t.id]==="wa" && waDest(t)); }
function chip254(t){ if(!waDest(t)) return ""; var wa=modoWA(t); return '<button class="dest254'+(wa?' wa':'')+'" id="tdest254" aria-label="Destino: '+(wa?'WhatsApp':'Claude')+'">'+(wa?'WhatsApp':'Claude')+'<span aria-hidden="true">⌄</span></button>'; }
function repinta254(t){ var tx=document.getElementById("txt"), d=tx?tx.value:""; try{ render(); }catch(e){} var n=document.getElementById("txt"); if(n && d) n.value=d; try{ marcaEnvio("tenv", d); }catch(e){} }
function abreDestino(t){
  var d=waDest(t); if(!d) return; var _o=document.getElementById("dest254"); if(_o) _o.remove();
  var wa=modoWA(t), nom=nombreVisible(d, t);
  var bg=document.createElement("div"); bg.className="cnlbg"; bg.id="dest254bg"; var sh=document.createElement("div"); sh.className="cnlsheet fil227h"; sh.id="dest254";
  sh.innerHTML='<div class="hh"></div><button class="cnlop227'+(wa?'':' on')+'" data-d254="claude"><span>Claude<small>una indicación: él la ejecuta, no sale a nadie</small></span>'+(wa?'':ico("check",18))+'</button>'+
    '<button class="cnlop227'+(wa?' on':'')+'" data-d254="wa"><span>WhatsApp a '+esc(nom)+'<small>sale directo, con vista previa</small></span>'+(wa?ico("check",18):'')+'</button>';
  function cierra(){ if(bg.parentNode) bg.parentNode.removeChild(bg); if(sh.parentNode) sh.parentNode.removeChild(sh); }
  bg.onclick=cierra;
  sh.addEventListener("click", function(ev){ var b=ev.target.closest("[data-d254]"); if(!b) return; var k=b.getAttribute("data-d254"); cierra(); if(k==="wa") window.__dest254[t.id]="wa"; else delete window.__dest254[t.id]; repinta254(t); });
  document.body.appendChild(bg); document.body.appendChild(sh);
}
function limpiaCaja(){ var tx=document.getElementById("txt"); if(tx) tx.value=""; try{ marcaEnvio("tenv",""); }catch(e){} }
/* el texto como indicación para Claude: el mismo flujo de dictado de 249–251 (blur, modo pesado, ejecutar órdenes, tarjeta de dudas) */
function aClaude(t, v){ limpiaCaja(); try{ delete window.__dest254[t.id]; }catch(e){} completaRevision(t, sinPrefijoClaude(v), {sinRevision:true}); }
/* ¿suena a indicación para Claude? "claude" seguro · "wa" seguro · "duda" (menciona al contacto en tercera persona: lo decide Claude) */
function clasifica254(v, contacto){
  var s=" "+_n179(v)+" ", pn=_n179(nombreCorto(contacto||"")).split(" ")[0]||"";
  var CL=[/\b(le|les)\s+(comentes?|digas?|pidas?|preguntes?|avises?|mandes?|escribas?|expliques?|recuerdes?|pongas?|cotices?|informes?|insistas?|contestes?|respondas?|confirmes?|agradezcas?)\b/, /\bpara que\s+(le|les|me|nos)\s+\w+/, /\ba ver si (tu|usted|claude)\b/, /\btu\s+(le|me|nos)\s+(puedes|podrias|puedas|ayudas)\b/,
    /\b(preguntale|pidele|comentale|avisale|recuerdale|escribele|mandale|insistele|contestale|respondele|dile|dile que|digale|cotizame|cotiza|recuerdame|avisame|apuntame|agendame|hazme|ponle)\b/, /\birme\s+(dando|diciendo|avisando|mandando)\b/, /\bme\s+(vayas|vaya)\s+(dando|diciendo|avisando)\b/, /\bdandome\s+(el\s+)?avance\b/, /\bclaude\b/, /\bpor favor (preguntale|dile|avisale)\b/];
  for(var i=0;i<CL.length;i++) if(CL[i].test(s)) return "claude";
  if(pn.length>=3 && s.indexOf(" "+pn+" ")>=0 && !/^\s*(hola|buen|buenos|buenas|gracias|que tal|saludos)/.test(s)) return "duda";
  if(/\b(el|ella|ellos|ellas)\s+(quiere|quieren|necesita|necesitan|dice|dicen|pidio|pidieron|va a|van a|puede|pueden|tiene que|tienen que)\b/.test(s)) return "duda";
  return "wa";
}
function sobreHoja(html, onClick){
  var _o=document.getElementById("hoja254"); if(_o) _o.remove();
  var v=document.createElement("div"); v.className="leemask"; v.id="hoja254"; v.innerHTML=html; document.body.appendChild(v);
  v.addEventListener("click", function(ev){ var b=ev.target.closest("[data-h254]"); if(b){ ev.stopPropagation(); var k=b.getAttribute("data-h254"); v.remove(); onClick(k); return; } if(ev.target===v || ev.target.closest("[data-hx254]")) { v.remove(); onClick("cancela"); } });
  return v;
}
function salidaWA(t, dest, v, cita, canal){
  var nom=nombreVisible(dest, t), corto=nombreCorto(nom).split(" ")[0]||nom;
  var devuelve=function(){ var tx=document.getElementById("txt"); if(tx){ tx.value=v; try{ marcaEnvio("tenv", v); }catch(e){} } };
  var manda=function(){ limpiaCaja(); try{ delete window.__dest254[t.id]; }catch(e){}
    candadoExterno(t, dest, v, function(){ mandaAExterno(t, dest, v, cita, canal); }); };
  var preview=function(){
    sobreHoja('<div class="mov225" role="dialog" aria-label="Vista previa"><div class="h225g"></div><div class="h225h"><b>Se va a mandar a '+esc(corto)+':</b><button class="h225b" data-hx254="1" aria-label="Cerrar">'+ico("x",14)+'</button></div>'+
      '<div class="h225c"><div class="pv254">'+esc(v)+'</div><button class="hop big254 pri" data-h254="manda">Mandar</button><button class="hop big254" data-h254="cancela">Cancelar</button></div></div>',
      function(k){ if(k==="manda") manda(); else devuelve(); }); };
  var hojaClaude=function(){
    sobreHoja('<div class="mov225" role="dialog" aria-label="Esto parece indicación para Claude"><div class="h225g"></div><div class="h225h"><b>Esto parece indicación para Claude</b><button class="h225b" data-hx254="1" aria-label="Cerrar">'+ico("x",14)+'</button></div>'+
      '<div class="h225c"><p class="h225v0">“'+esc(v)+'”</p><button class="hop big254 pri" data-h254="claude">Es para Claude</button><button class="hop big254" data-h254="asi">Mandarlo así a '+esc(corto)+'</button></div></div>',
      function(k){ if(k==="claude") aClaude(t, v); else if(k==="asi") manda(); else devuelve(); }); };
  var c=clasifica254(v, dest);
  if(c==="claude") return hojaClaude();
  if(c==="wa") return preview();
  /* duda: lo decide Claude (modo pesado); si no contesta o no se entiende, se trata como indicación (lo seguro) */
  try{ toast("Revisando a quién va…"); }catch(e){}
  var hecho=false, fin=function(r){ if(hecho) return; hecho=true; if(r==="contacto") preview(); else hojaClaude(); };
  try{ preguntaAClaude([{role:"user",content:"Salvador escribió este texto en el cuadro de mensaje de una tarea cuyo contacto de WhatsApp es “"+nom+"”. Decide si es un mensaje para MANDARLE a "+nom+" (le habla a él/ella, en segunda persona) o una indicación para Claude, el asistente (habla de "+nom+" en tercera persona, o le pide algo a Claude).\nTEXTO: “"+v+"”\nContesta SOLO JSON: {\"para\":\"contacto\"} o {\"para\":\"claude\"}."}], MODO_CEREBRO, function(txt,err){
      var r="claude"; try{ var j=JSON.parse(String(txt||"").replace(/^[^{]*/,"").replace(/[^}]*$/,"")); if(j && j.para==="contacto") r="contacto"; }catch(e){} fin(err?"claude":r); }); }catch(e){ fin("claude"); }
}
function avisoYaLlego(contacto){
  var nom=nombreCorto(contacto||"").split(" ")[0]||"el contacto";
  sobreHoja('<div class="mov225" role="dialog" aria-label="Ya le llegó"><div class="h225g"></div><div class="h225h"><b>Este ya le llegó a '+esc(nom)+'</b><button class="h225b" data-hx254="1" aria-label="Cerrar">'+ico("x",14)+'</button></div>'+
    '<div class="h225c"><p class="h225v0">Bórralo en tu WhatsApp: mantenlo presionado → Eliminar → Eliminar para todos.</p><button class="hop big254 pri" data-h254="ok">Entendido</button></div></div>', function(){});
}
/* el menú de pulsación larga abre la misma hoja de detalle y toca el mismo botón */
function menuAcc(t, ix, sel){ abreDetalle(t, ix); var b=document.querySelector("#det242 "+sel); if(b) b.click(); }

/* ===== build 252: "¿A DÓNDE SE FUE EL RESTO DE LA PLÁTICA?" =====
   En el detalle de cualquier globo de una persona: "Ver toda la plática con <persona>": los mensajes de ese contacto de los últimos 7 días,
   en orden de hora, de TODAS las tareas, con los ocultos y los de "no guardar" marcados. Cada uno con una etiqueta de dónde quedó (nombre
   de la tarea, "sin acomodar" o "no guardado"); al tocarla se abre esa tarea en ese mensaje. Tocar el mensaje abre su detalle (Mover · Nueva ·
   No guardar). Fuente: solo lo que está en tareas (la app aún no consulta la bandeja del servidor). */
function contactoDeMsg(x){
  if(!x) return ""; var c=x.wa_c||x.wa_auto||"";
  if(!c){ var m=String(x.canal||"").match(/^ext:(.+)$/); if(m) c=m[1]; }
  if(!c && x.prog && x.prog.contacto) c=x.prog.contacto;
  return nombreLimpio(c||"");
}
function mismoContacto252(a, b){ var na=_n179(a), nb=_n179(b); if(!na||!nb) return false; return na===nb || na.indexOf(nb+" ")===0 || nb.indexOf(na+" ")===0; }
function platicaDe(nombre, dias){
  var desde=Date.now()-(dias||7)*864e5, out=[], vis={};
  (tareas||[]).forEach(function(t){ if(!t || t.fusionada_en) return;
    (t.msgs||[]).forEach(function(x, ix){
      if(!x || x.nota_claude || x.res238 || x.dict238 || String(x.canal||"").indexOf("priv:")===0) return;
      var c=contactoDeMsg(x); if(!c || !mismoContacto252(c, nombre)) return;
      var ts=+(x.movido_de&&x.movido_de.ts)||+x.ts||0; if(!ts || ts<desde) return;
      if(x.oculto && x.movido_a) return;   /* el que cuenta es la copia en la tarea de destino */
      var txt=_txMsg(x).replace(/^Movido desde [^:]*:\s*/,""); if(c && txt.toLowerCase().indexOf(String(x.wa_c||c).toLowerCase()+":")===0) txt=txt.slice(String(x.wa_c||c).length+1).trim(); if(!txt) return;   /* sin el "Nombre:" del inicio */
      var kind, tag;
      if(x.oculto){ var mo=String(x.oculto_motivo||"");
        if(mo==="platica"||mo==="no_es_de_aqui"){ kind="ng"; tag="no guardado"; } else if(mo==="eliminado"){ kind="ng"; tag="eliminado"; } else if(mo==="es_para_claude"){ kind="ng"; tag="para Claude"; } else { kind="ng"; tag="no guardado"; } }
      else { var sa=false; try{ sa=(!!x.duda_tarea && !x.duda_resuelta) || tipoRevisar(t)==="falta"; }catch(e){}
        if(sa){ kind="sa"; tag="sin acomodar"; } else { kind="t"; tag=String(t.nombre||"Tarea"); } }
      var key=String(x.wa_id||"")||(Math.round(ts/60000)+"|"+_n179(txt).slice(0,60)), o=vis[key];
      var it={t:t, ix:ix, x:x, ts:ts, txt:txt, kind:kind, tag:tag, yo:(+x.wa_in!==1 && x.k==="bo"), de:(+x.wa_in===1||x.wa_c)?c:"Tú", oculto:!!x.oculto};
      if(o){ if(o.oculto && !it.oculto){ out[out.indexOf(o)]=it; vis[key]=it; } return; }
      vis[key]=it; out.push(it); }); });
  out.sort(function(a,b){ return a.ts-b.ts; }); return out;
}
function abrePlatica(nombre){
  var ya=document.getElementById("plat252"); if(ya) ya.remove();
  var v=document.createElement("div"); v.id="plat252"; v.className="plat252"; v.setAttribute("role","dialog"); v.setAttribute("aria-label","Plática con "+nombre);
  document.body.appendChild(v); var L=[];
  function pinta(){ L=platicaDe(nombre, 7); var corto=nombreCorto(nombre).split(" ")[0], dia="";
    var h='<div class="ph"><div><b>Plática con '+esc(corto)+'</b><small>'+esc(nombre)+' · últimos 7 días · '+L.length+' mensaje'+(L.length===1?"":"s")+', de todas las tareas</small></div><button data-pl252="x" aria-label="Cerrar">'+ico("x",16)+'</button></div>';
    if(!L.length) h+='<p class="pie">No hay mensajes de '+esc(corto)+' en los últimos 7 días en tus tareas.</p>';
    L.forEach(function(it, i){ var d=new Date(it.ts), f=fechaBonita(iso(d)); if(f!==dia){ dia=f; h+='<div class="pie" style="margin:14px 16px 0"><b>'+esc(f)+'</b></div>'; }
      var hh=it.x.h||(("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2));
      h+='<div class="pl252'+(it.yo?' yo':'')+(it.oculto?' of':'')+'" data-pli="'+i+'"><div class="pq">'+esc(it.de)+'</div><button class="pt" data-plm="'+i+'">'+esc(it.txt.length>600?it.txt.slice(0,600)+"…":it.txt)+'</button>'+
        '<div class="pm"><span>'+esc(hh)+'</span><button class="pg '+(it.kind==="sa"?'sa':(it.kind==="ng"?'ng':''))+'" data-plt="'+i+'">'+esc(it.tag)+'</button></div></div>'; });
    h+='<p class="pie">Aquí sale lo que está en tus tareas (con los escondidos y los de “no guardar” marcados). La bandeja del servidor aún no se consulta desde la app: lo que no esté en ninguna tarea no aparece.</p>';
    var sc=v.scrollTop; v.innerHTML=h; v.scrollTop=sc; }
  pinta(); v.scrollTop=v.scrollHeight;
  var sig=function(){ return JSON.stringify(platicaDe(nombre, 7).map(function(i){ return [i.ts, i.tag, i.oculto]; })); }, sg=sig(), iv=setInterval(function(){ if(!document.getElementById("plat252")){ clearInterval(iv); return; } if(document.getElementById("det242") || document.getElementById("nom249") || document.getElementById("mov225")) return; var n=sig(); if(n!==sg){ sg=n; pinta(); } }, 400);   /* se repinta sola cuando Mover · Nueva · No guardar cambian algo */
  v.addEventListener("click", function(ev){ ev.stopPropagation();
    if(ev.target.closest('[data-pl252="x"]')){ clearInterval(iv); v.remove(); return; }
    var g=ev.target.closest("[data-plt]"); if(g){ var it=L[+g.getAttribute("data-plt")]; if(!it) return; clearInterval(iv); v.remove();
      abierta=it.t.id; vista="hilo"; render();   /* al abrir, la app siempre arranca en Importante... */
      try{ poneVista(it.t, ""); window.__cnl=window.__cnl||{}; window.__cnl[it.t.id]="todo"; render(); }catch(e){}   /* ...así que se pasa a Todo para que el mensaje se vea */ setTimeout(function(){ var o=document.querySelector('.msgs [data-mix="'+it.ix+'"]'); if(o){ try{ o.scrollIntoView({behavior:"smooth",block:"center"}); }catch(e){} o.classList.add("flash"); setTimeout(function(){ o.classList.remove("flash"); },1400); } else if(it.oculto){ toast("Ese mensaje está escondido en esta tarea"); } }, 80); return; }
    var m=ev.target.closest("[data-plm]"); if(m){ var it2=L[+m.getAttribute("data-plm")]; if(!it2) return; abreDetalle(it2.t, it2.ix); } });
}
function puedeRestaurar(x){ return !!x && x.oculto && !x.movido_a && /^(platica|no_es_de_aqui|es_para_claude)$/.test(String(x.oculto_motivo||"")); }
function restaura252(t, ix){ var x=(t.msgs||[])[ix]; if(!puedeRestaurar(x)) return false;
  x.oculto=false; delete x.oculto_ts; delete x.oculto_por; delete x.oculto_motivo; if(x.duda_resuelta==="platica") delete x.duda_resuelta; delete x.acomodo; guarda(t); return true; }
function claudeAcomodo(t, x){ return !!x && acomodoIA(x) && !esSaludo238(t, x); }
function icoCl(t, x, ix){
  if(!claudeAcomodo(t, x)) return "";
  return '<span class="cl238'+(((window.__cl238||{})[t.id+"|"+ix])?' on':'')+'" data-cl238="'+ix+'" role="img" aria-label="Lo acomodó Claude">'+SVG_DESTELLO+'</span>';
}
/* build 242: OK · Mover · Nueva · Dato ya no van debajo del globo: viven en la hoja del detalle (tocar el globo) */
function vDudaTarea(t, x, ix){ return ""; }
/* acciones sobre TODA la plática */
function ixsDe(el, ix){ var c=el && el.closest && el.closest("[data-acg]"); var v=c?String(c.getAttribute("data-acg")||""):""; var l=v?v.split(",").map(function(n){ return +n; }).filter(function(n){ return !isNaN(n); }):[]; return l.length?l:[ix]; }
function palabrasRegla(xs){
  var cnt={}, ord=[]; xs.forEach(function(x){ _nn(_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,"")).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).forEach(function(w){
    if(w.length<4 || META_VACIAS.indexOf(w)>=0 || /^(para|como|esta|este|esto|pero|porque|gracias|buenos|buenas|dias|tardes|noches|salvador|manana|ahorita|tengo|tiene|hacer|listo|favor|solo|nada|algo|bien|claro|saludos|espero|encuentres|mande|mando|quedo|creo)$/.test(w)) return;
    if(!cnt[w]){ cnt[w]=0; ord.push(w); } cnt[w]++; }); });
  return ord.sort(function(a,b){ return (cnt[b]-cnt[a]) || (b.length-a.length); }).slice(0,5);
}
/* APRENDIZAJE: bitacora_personas/<usuario> campo acomodo_reglas (mapa id -> regla), merge: no se lee ni se pisa lo anterior */
function guardaRegla(tipo, t, ixs, dest, extra){
  var xs=ixs.map(function(i){ return (t.msgs||[])[i]; }).filter(Boolean); if(!xs.length) return null;
  var r=Object.assign({contacto:nombreLimpio(xs[0].wa_c||((PERSONAS[xs[0].de]||{}).nombre)||""), palabras_clave:palabrasRegla(xs), tarea_destino:dest?dest.id:"",
    tarea_destino_nombre:dest?String(dest.nombre||""):"", tarea_origen:t.id, tipo:tipo, fecha:new Date().toISOString(), mensajes:xs.length, por:yo||""}, extra||{});
  var id="r"+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36), o={}; o[id]=r;
  window.__reglas237=(window.__reglas237||[]).concat([r]).slice(-50);
  try{ if(db) db.collection(COLP).doc(yo).set({acomodo_reglas:o},{merge:true}).catch(function(){}); }catch(e){}
  return r;
}
/* build 238: una regla por MENSAJE (los saludos no cuentan) */
function reglasPorMsg(tipo, t, ixs, dest){ var con=ixs.filter(function(i){ var x=(t.msgs||[])[i]; return x && !esSaludo238(t, x); });
  if(window.__lote245){ reglaLote(tipo, t, con.length?con:ixs, dest); return; }   /* build 245: en lote, UNA regla por contacto y tema */ (con.length?con:ixs.slice(0,1)).forEach(function(i){ guardaRegla(tipo, t, [i], dest); }); }
function okG(t, ixs){
  var hechos=[]; ixs.forEach(function(ix){ var x=(t.msgs||[])[ix]; if(!x || x.oculto || confirmado237(x)) return; x.duda_resuelta="esta"; x.duda_ts=Date.now(); x.acomodo={ok:1, ts:Date.now(), por:yo||""}; hechos.push(ix); });
  var n=hechos.length; if(!n) return ""; censoAcomodo(t, t.msgs[hechos[0]], t.id, t.id, "ok"); reglasPorMsg("ok", t, hechos, t); guarda(t);
  return "Listo: "+(n===1?"se queda":"los "+n+" se quedan")+" en “"+(t.nombre||"esta tarea")+"”.";
}
function moverG(t, ixs, did){
  var d=tareas.filter(function(z){ return z.id===did; })[0]; if(!d) return "";
  var vivos=ixs.filter(function(ix){ var x=(t.msgs||[])[ix]; return x && !x.oculto && !confirmado237(x); }); if(!vivos.length) vivos=ixs.filter(function(ix){ var x=(t.msgs||[])[ix]; return x && !x.oculto; });
  reglasPorMsg("mover", t, vivos, d); var n=0; vivos.forEach(function(ix){ if(mueveMensaje(t, ix, did, "mover")) n++; });
  return n?(n===1?"Lo moví":"Moví los "+n)+" a “"+(d.nombre||"la otra tarea")+"”. Aquí quedan ocultos, no borrados.":"";
}
/* build 240: Dato = un dato nuevo con ese mensaje (el mismo "Dato" de la tarea nueva); sin importancia = se queda aquí con msg_imp 0 */
function datoG(t, ixs){
  var n=nuevaG(t, ixs, true); if(!n) return null;
  n.tipo_item="dato"; n.es_dato=true; n.tipo_elegido=true; n.falta_fecha=false; guarda(n); return n;
}
/* build 243: "No guardar" = lo mismo que "Solo plática" (no va a ninguna tarea, queda oculto, no se borra). Debajo, 6 s, una pregunta
   opcional "¿Sí era de <tarea>? Sí · No": si contesta, regla "no_guardar" con acierto_tema; si no, no pasa nada. */
function noGuardar(t, ixs){
  var hechos=[], fuera=[]; ixs.forEach(function(ix){ var x=(t.msgs||[])[ix]; if(!x || x.oculto) return;
    if(confirmado237(x)){ if(noEsDeAqui(t, ix)) fuera.push(ix); return; }   /* build 247: ya acomodado = sacarlo de esta tarea (no_es_de_aqui) */
    if(soloPlatica(t, ix)) hechos.push(ix); });
  if(fuera.length && !hechos.length) return "ok";
  if(!hechos.length) return "";
  try{ hist240("No guardar ("+hechos.length+" mensaje"+(hechos.length===1?"":"s")+")", t, {tipo:"ng_lote", tss:hechos.map(function(i){ return t.msgs[i].ts; })}); }catch(e){}   /* 245: con Deshacer */
  preguntaTema(t, hechos); return "ok";
}
/* ===================== build 245: LOTE ("Mover todos", "No guardar todos", selección) =====================
   Todo entra al Historial como UN renglón con Deshacer; las reglas de aprendizaje van en lote: una por contacto y tema. */
function reglaLote(tipo, t, ixs, dest, extra){
  var xs=ixs.map(function(i){ return (t.msgs||[])[i]; }).filter(Boolean); if(!xs.length) return 0;
  var por={}, orden=[]; xs.forEach(function(x){ var c=nombreLimpio(x.wa_c||((PERSONAS[x.de]||{}).nombre)||""); if(!por[c]){ por[c]=[]; orden.push(c); } por[c].push(x); });
  var o={}, n=0; orden.forEach(function(c){ var g=por[c];
    var r=Object.assign({contacto:c, palabras_clave:palabrasRegla(g), tarea_destino:dest?dest.id:"", tarea_destino_nombre:dest?String(dest.nombre||""):"", tarea_origen:t.id, tipo:tipo, fecha:new Date().toISOString(), mensajes:g.length, lote:true, por:yo||""}, extra||{});
    o["r"+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36)+n]=r; n++; window.__reglas237=(window.__reglas237||[]).concat([r]).slice(-50); });
  try{ if(db) db.collection(COLP).doc(yo).set({acomodo_reglas:o},{merge:true}).catch(function(){}); }catch(e){}
  return n;
}
/* todos los mensajes de WhatsApp de esa persona (canal ext:/dm:) en la tarea, sin las notas de la IA */
function ixsContacto(t, cid){
  var out=[]; (t.msgs||[]).forEach(function(x,i){ if(!x || x.oculto || x.eliminado || x.prog || esNotaIA(x) || !esMsgWA(x)) return; if(canalDe(x,t)===cid) out.push(i); }); return out;
}
function aplicaLote(t, ixs, accion, did, nombre){
  ixs=ixs.filter(function(i){ var x=(t.msgs||[])[i]; return x && !x.oculto && !x.eliminado; }); if(!ixs.length) return "";
  var L=window.__lote245={items:[]}, r="", d=did?tareaId240(did):null, c0=nombreLimpio((t.msgs[ixs[0]]||{}).wa_c||""), quien=c0?" de "+nombreCorto(c0).split(" ")[0]:"", N=ixs.length, sn="mensaje"+(N===1?"":"s");
  try{
    if(accion==="mover"){ r=(did===t.id)?okG(t, ixs):moverG(t, ixs, did); }
    else if(accion==="nueva"){ var n=nuevaG(t, ixs, false, nombre); d=n||null; r=n?"Tarea nueva “"+n.nombre+"” en Falta info; pasaron "+N+" "+sn+".":""; }
    else if(accion==="ng"){ window.__lote245=null; r=noGuardar(t, ixs); }
  } finally { window.__lote245=null; }
  if(accion==="ng") return r;
  if(L.items.length){ hist240("Movió "+N+" "+sn+quien+" a “"+((d&&d.nombre)||"otra tarea")+"”", t, {tipo:"mover_lote", items:L.items});
    var e=histLee()[0]; window.__ultimoDeshacer={id:t.id, tipo:"lote", cuando:Date.now(), restaurar:function(){ if(e){ var m=deshaz240(e); if(m) toast(m); render(); } }}; muestraDeshacer("lote", "Moví "+N+" "+sn, 8000); }
  else if(r && accion==="mover") hist240("Acomodo: OK a "+N+" "+sn+quien, t, null);
  return r;
}
/* barra de arriba cuando el filtro está en UNA persona */
function barraLote(t, cn){
  if(!cn || !cn.ext) return ""; var n=ixsContacto(t, cn.id).length; if(n<2) return "";
  return '<div class="lote245"><span class="lq">'+esc(nombreCorto(cn.nom).split(" ")[0])+' · '+n+' mensajes</span><button data-lote245="mover">Mover todos ('+n+')</button><button data-lote245="ng">No guardar todos ('+n+')</button></div>';
}
function bindLote(raiz, t){
  Array.prototype.forEach.call(raiz.querySelectorAll("[data-lote245]"), function(el){ el.onclick=function(ev){ ev.stopPropagation();
    var cn=canalActual(t), ixs=ixsContacto(t, cn.id); if(!ixs.length) return;
    abreMover(t, ixs[0], ixs, {lote:true, desde:true, soloNg:el.getAttribute("data-lote245")==="ng"}); }; });
}
/* selección por mantener presionado un globo */
function ixsBurbuja(b){ var g=b.getAttribute("data-g244"); return g?String(g).split(",").map(Number):[+b.getAttribute("data-mix")]; }
function iniciaSel(t, ix){ window.__sel245={tid:t.id, set:{}}; var b=document.querySelector('.msgs [data-mix="'+ix+'"]'); (b?ixsBurbuja(b):[ix]).forEach(function(i){ window.__sel245.set[i]=1; }); pintaSel(); }
function pintaSel(){
  var S=window.__sel245, bar=document.getElementById("selbar245");
  if(S && (vista!=="hilo" || abierta!==S.tid)){ window.__sel245=S=null; }
  if(!S){ if(bar) bar.remove(); Array.prototype.forEach.call(document.querySelectorAll(".sel245"), function(e){ e.classList.remove("sel245"); }); return; }
  var n=0; Array.prototype.forEach.call(document.querySelectorAll(".msgs [data-mix]"), function(b){ var ixs=ixsBurbuja(b), on=ixs.every(function(i){ return S.set[i]; }); b.classList.toggle("sel245", on); });
  n=Object.keys(S.set).length;
  if(!bar){ bar=document.createElement("div"); bar.id="selbar245"; bar.className="selbar245"; document.body.appendChild(bar);
    bar.addEventListener("click", function(ev){ var b=ev.target.closest("[data-sel245]"); if(!b) return; ev.stopPropagation(); var S2=window.__sel245; if(!S2) return; var k=b.getAttribute("data-sel245"), t=tareas.filter(function(z){ return z.id===S2.tid; })[0], ixs=Object.keys(S2.set).map(Number).sort(function(a,b2){ return a-b2; });
      if(k==="x"){ window.__sel245=null; pintaSel(); return; } if(!t || !ixs.length){ toast("Marca al menos un mensaje"); return; }
      if(k==="mover"){ abreMover(t, ixs[0], ixs, {lote:true}); return; }
      if(k==="nueva"){ pideNombreNueva(t, ixs, function(nombre){ var r2=aplicaLote(t, ixs, "nueva", "", nombre); window.__sel245=null; if(r2 && r2!=="ok") toast(r2); var n2=tareaNuevaDe(t, ixs); if(n2) vaATareaNueva(n2); else render(); }); return; }
      var r=aplicaLote(t, ixs, k==="ng"?"ng":"nueva"); window.__sel245=null; if(r && r!=="ok") toast(r); render(); }); }
  bar.innerHTML='<span class="sn">'+n+' seleccionado'+(n===1?'':'s')+'</span><button data-sel245="mover">Mover</button><button data-sel245="ng">No guardar</button><button data-sel245="nueva">Nueva</button><button class="x" data-sel245="x" aria-label="Cancelar">✕</button>';
}
(function(){ if(typeof document==="undefined" || window.__selinit245) return; window.__selinit245=1;
  document.addEventListener("click", function(ev){ var S=window.__sel245; if(!S || vista!=="hilo" || abierta!==S.tid) return;
    var b=ev.target.closest && ev.target.closest(".msgs [data-mix]"); if(!b) return; ev.stopPropagation(); ev.preventDefault();
    var ixs=ixsBurbuja(b), on=!ixs.every(function(i){ return S.set[i]; }); ixs.forEach(function(i){ if(on) S.set[i]=1; else delete S.set[i]; }); pintaSel(); }, true);
  var _r=render; render=function(){ var r=_r.apply(this, arguments); try{ pintaSel(); }catch(e){} return r; };
})();
function preguntaTema(t, ixs){
  var viejo=document.getElementById("ng243"); if(viejo) viejo.remove(); if(window.__ngT243) clearTimeout(window.__ngT243);
  var el=document.createElement("div"); el.id="ng243"; el.className="ng243"; el.setAttribute("role","status");
  el.innerHTML='<span class="q245">No lo guardé. ¿Sí era de “'+esc(tareaCorta(t))+'”?</span><span class="b245"><button data-ngr="si">Sí</button><button data-ngr="no">No</button></span><i class="ar245"></i>';
  document.body.appendChild(el);
  /* build 245: burbuja anclada JUSTO donde se tocó "No guardar" (arriba del botón; si no cabe, abajo); 8 s o hasta que conteste */
  var a=window.__tap245; if(a && Date.now()-a.ts>3000) a=null; window.__tap245=null;
  if(a){ var W=window.innerWidth, H=window.innerHeight, w=Math.min(300, W-24); el.style.width=w+"px"; el.classList.add("anc245");
    var hh=el.offsetHeight, left=Math.max(12, Math.min(W-w-12, a.l+a.w/2-w/2)), top=a.t-hh-12, abajo=false;
    if(top<12){ top=a.t+a.h+12; abajo=true; } if(top+hh>H-8) top=Math.max(8, H-8-hh);
    el.style.left=left+"px"; el.style.top=top+"px"; el.classList.add(abajo?"abajo":"arriba");
    el.style.setProperty("--ax", Math.max(22, Math.min(w-22, a.l+a.w/2-left))+"px"); }
  el.onclick=function(ev){ var b=ev.target.closest("[data-ngr]"); if(!b) return; ev.stopPropagation(); var si=b.getAttribute("data-ngr")==="si";
    var con=ixs.filter(function(i){ var x=(t.msgs||[])[i]; return x && !esSaludo238(t, x); }), usa=con.length?con:ixs.slice(0,1);
    if(usa.length>1) reglaLote("no_guardar", t, usa, t, {acierto_tema:si}); else usa.forEach(function(i){ guardaRegla("no_guardar", t, [i], t, {acierto_tema:si}); });
    el.remove(); clearTimeout(window.__ngT243); toast(si?"Anotado: el tema sí era de esa tarea":"Anotado: no era de esa tarea"); };
  window.__ngT243=setTimeout(function(){ if(el.parentNode) el.remove(); }, 8000);
}
function nuevaG(t, ixs, comoDato, nombre){
  var xs=ixs.filter(function(i){ var x=(t.msgs||[])[i]; return x && !x.oculto && !confirmado237(x); }); if(!xs.length) xs=ixs.filter(function(i){ var x=(t.msgs||[])[i]; return x && !x.oculto; }); if(!xs.length) return null;
  var best=xs.slice().sort(function(a,b){ return _txMsg(t.msgs[b]).length-_txMsg(t.msgs[a]).length; })[0];
  var n=nuevaDesdeMsg(t, best, nombre); if(!n) return null;
  xs.forEach(function(i){ if(i!==best) mueveMensaje(t, i, n.id, "nueva"); });
  reglasPorMsg(comoDato?"dato":"nueva", t, xs, n); return n;
}
function bindAcomodo(raiz, tareaDe){
  function q(sel, fn){ Array.prototype.forEach.call(raiz.querySelectorAll(sel), function(el){ el.onclick=function(ev){ ev.stopPropagation(); var ix=+el.getAttribute(sel.slice(1,-1)), t=tareaDe(el); if(!t) return; fn(t, ix); }; }); }
  /* build 237: el botón aplica a TODA la plática (data-acg) */
  function q2(sel, fn){ Array.prototype.forEach.call(raiz.querySelectorAll(sel), function(el){ el.onclick=function(ev){ ev.stopPropagation(); try{ var _rc=el.getBoundingClientRect(); window.__tap245={l:_rc.left, t:_rc.top, w:_rc.width, h:_rc.height, ts:Date.now()}; }catch(e){} var ix=+el.getAttribute(sel.slice(1,-1)), t=tareaDe(el); if(!t) return; fn(t, ix, ixsDe(el, ix)); if(raiz.id==="det242" && raiz.parentNode) raiz.remove(); }; }); }   /* build 252: la hoja de detalle se cierra al usar su botón */
  q2("[data-acok]", function(t, ix, ixs){ var r=okG(t, ixs); if(r) toast(r); render(); });
  q2("[data-acmov]", function(t, ix, ixs){ abreMover(t, ix, ixs); });
  q2("[data-acdato]", function(t, ix, ixs){ var n=datoG(t, ixs); if(n) toast("Dato nuevo “"+n.nombre+"”; "+(ixs.length===1?"el mensaje pasó":"la plática pasó")+" ahí."); render(); });
  q2("[data-acng]", function(t, ix, ixs){ var r=noGuardar(t, ixs); if(r) render(); });
  q2("[data-acnueva]", function(t, ix, ixs){ var dv=document.getElementById("det242"); if(dv) dv.remove();   /* build 249: pide el nombre */
    pideNombreNueva(t, ixs, function(nombre){ var n=nuevaG(t, ixs, false, nombre); if(n) toast("Tarea nueva “"+n.nombre+"”; "+(ixs.length===1?"el mensaje pasó":"la plática pasó")+" ahí."); if(n) vaATareaNueva(n); else render(); }); });
  /* build 238: tocar el globo con el iconito de Claude = OK · Mover · Nueva para ese mensaje */
  Array.prototype.forEach.call(raiz.querySelectorAll(".msgs [data-mix]"), function(el){ if(el.classList.contains("liga")) return; el.addEventListener("click", function(ev){
    if(ev.target.closest("button,a,input") || (window.__lp238 && Date.now()-window.__lp238<700)) return; var t=tareaDe(el); if(!t) return;
    abreDetalle(t, +el.getAttribute("data-mix")); }); });   /* build 242: tocar el globo = su hoja de detalle */
  /* build 247: tocar un globo hablado (dictado) o una nota de la IA también abre su menú */
  Array.prototype.forEach.call(raiz.querySelectorAll(".msgs [data-hab], .msgs .nia242[data-nix]"), function(el){ el.addEventListener("click", function(ev){
    if(ev.target.closest("button,a,input,textarea") || (window.__lp238 && Date.now()-window.__lp238<700) || (window.__leeLP && Date.now()-window.__leeLP<700)) return; var t=tareaDe(el); if(!t) return;
    var k=el.hasAttribute("data-hab")?el.getAttribute("data-hab"):el.getAttribute("data-nix"); var ix=+String(k).split("|").pop(); if(isNaN(ix)) return; abreDetalle(t, ix); }); });
  Array.prototype.forEach.call(raiz.querySelectorAll("[data-nia242]"), function(el){ el.onclick=function(ev){ ev.stopPropagation(); window.__nia242=window.__nia242||{}; var k=el.getAttribute("data-nia242"); window.__nia242[k]=!window.__nia242[k]; render(); }; });
  Array.prototype.forEach.call(raiz.querySelectorAll("[data-mq237]"), function(el){ el.onclick=function(ev){ ev.stopPropagation(); window.__mq237=window.__mq237||{}; var k=el.getAttribute("data-mq237"); window.__mq237[k]=!window.__mq237[k]; render(); }; });
}
/* ---- Inicio: seccion Acomodo ---- */
function abiertaVisible(t){ return t && !esPropuesta(t) && estaAbierta(t) && !t.es_recordatorio && estadoReal(t)!=="cerrada" && (t.duenio===yo || (PERSONAS[yo]&&PERSONAS[yo].jefe)); }
/* build 237: pláticas por acomodar (solo las que tienen duda o están en una tarea de la IA sin clasificar), la más reciente primero */
function platicasAcomodo(){
  var out=[]; tareas.forEach(function(t){ if(!abiertaVisible(t)) return; try{ aplicaDudasNota(t); }catch(e){}
    var sc=sinClasificarIA(t); platicas237(t).forEach(function(g){ if(g.listos) return; if(g.duda || sc || g.tuvoDuda){
      if(g.soloSaludo){ (window.__plat239=window.__plat239||[]).push(g); return; }   /* build 239: puro saludo: no sale; se marca sola como plática */
      g.sinClasificar=sc && !g.duda; out.push(g); } }); });
  if((window.__plat239||[]).length && !window.__plat239T) window.__plat239T=setTimeout(platicaSola, 0);
  return out.sort(function(a,b){ return b.ts1-a.ts1; });
}
/* marca como "Solo plática" (como el botón) las pláticas de puro saludo; sin regla de aprendizaje */
/* ===================== build 240: HISTORIAL de lo que tocó Salvador (últimas 50 en el Inicio · ⋯ · Historial) =====================
   localStorage doit_hist240 + bitacora_personas/<usuario>.historial_acciones (las últimas 200). Cada renglón: hora · tarea · qué hizo;
   tocarlo abre la tarea; "Deshacer" cuando se puede: reabrir, regresar lo movido, quitar el vínculo, restaurar fecha, despalomear. */
var HIST240_K="doit_hist240";
function histLee(){ var l=[]; try{ l=JSON.parse(localStorage.getItem(HIST240_K)||"[]"); }catch(e){} if(!Array.isArray(l)) l=[];
  (Array.isArray(window.__histRemoto240)?window.__histRemoto240:[]).forEach(function(r){ if(r && r.id && !l.some(function(x){ return x.id===r.id; })) l.push(r); });
  return l.sort(function(a,b){ return (b.ts||0)-(a.ts||0); }); }
function hist240(que, t, undo){
  if(!yo) return;
  var e={id:"h"+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36), ts:Date.now(), tid:t?t.id:"", tnom:t?String(t.nombre||""):"", que:String(que||""), undo:undo||null, hecho:false, por:yo};
  var l=histLee(); l.unshift(e); l=l.slice(0,200);
  try{ localStorage.setItem(HIST240_K, JSON.stringify(l)); }catch(er){}
  if(window.__histT240) clearTimeout(window.__histT240);
  window.__histT240=setTimeout(function(){ window.__histT240=null; try{ if(db) db.collection(COLP).doc(yo).set({historial_acciones:histLee().slice(0,200)},{merge:true}).catch(function(){}); }catch(er){} }, 1500);
  return e;
}
function histMarca(id){ var l=histLee(); l.forEach(function(x){ if(x.id===id) x.hecho=true; }); try{ localStorage.setItem(HIST240_K, JSON.stringify(l)); }catch(e){}
  window.__histRemoto240=(window.__histRemoto240||[]).map(function(x){ if(x.id===id) x.hecho=true; return x; });
  try{ if(db) db.collection(COLP).doc(yo).set({historial_acciones:l.slice(0,200)},{merge:true}).catch(function(){}); }catch(e){} }
function tareaId240(id){ return tareas.filter(function(x){ return x.id===id; })[0]||null; }
function deshaz240(e){
  var u=e&&e.undo; if(!u || e.hecho) return "";
  var t=tareaId240(e.tid);
  if(u.tipo==="reabrir" && t && t.cierre){ reabre(t, "deshacer desde el historial"); }
  else if(u.tipo==="fecha" && t){ t.f_vigente=u.f||""; t.movidas=Math.max(0,(t.movidas||1)-1); msg(t,"bi","Regresada al "+(u.f?fechaMovCorta(u.f):"sin fecha")+"."); sincronizaAvisos(t); guarda(t); }
  else if(u.tipo==="mover" && t){ var x=(t.msgs||[]).filter(function(m){ return m && m.ts===u.ts && m.movido_a && m.movido_a.id===u.did; })[0], d=tareaId240(u.did);
    if(x){ x.oculto=false; delete x.movido_a; delete x.oculto_ts; delete x.oculto_por; if(x.duda_resuelta==="otra") delete x.duda_resuelta; delete x.acomodo; }
    if(d) d.msgs=(d.msgs||[]).filter(function(m){ return !(m && m.movido_de && m.movido_de.id===t.id && m.movido_de.ts===u.ts); });
    guarda(t); if(d) guarda(d); }
  else if(u.tipo==="mover_lote" && t){ var tocados={};
    (u.items||[]).forEach(function(it){ var x=(t.msgs||[]).filter(function(m){ return m && m.ts===it.ts && m.oculto && m.movido_a && m.movido_a.id===it.did; })[0]; if(!x) return;
      x.oculto=false; delete x.movido_a; delete x.oculto_ts; delete x.oculto_por; if(x.duda_resuelta==="otra") delete x.duda_resuelta; delete x.acomodo; tocados[it.did]=1; });
    Object.keys(tocados).forEach(function(did){ var d=tareaId240(did); if(d){ d.msgs=(d.msgs||[]).filter(function(m){ return !(m && m.movido_de && m.movido_de.id===t.id && (u.items||[]).some(function(it){ return it.did===did && it.ts===m.movido_de.ts; })); }); guarda(d); } });
    guarda(t); }
  else if(u.tipo==="ng_lote" && t){ (u.tss||[]).forEach(function(ts){ var x=(t.msgs||[]).filter(function(m){ return m && m.ts===ts && m.oculto && /^(platica|no_es_de_aqui|eliminado|es_para_claude)$/.test(m.oculto_motivo||""); })[0]; if(!x) return;
      x.oculto=false; delete x.oculto_ts; delete x.oculto_por; delete x.oculto_motivo; if(x.duda_resuelta==="platica") delete x.duda_resuelta; delete x.acomodo; }); guarda(t); }
  else if(u.tipo==="contestada247" && t){ (t.msgs||[]).forEach(function(m){ if(m && m.ts===u.ts) delete m.contestada247; }); guarda(t); }
  else if(u.tipo==="vincular"){ var sn=(window.__undo240||{})[e.id]; if(!sn) return "Este vínculo ya no se puede deshacer desde este teléfono.";
    var o=sn.o, d2=tareaId240(sn.did); if(d2){ d2.msgs=sn.dmsgs; d2.enlazadas=sn.denl; guarda(d2); } if(!tareaId240(o.id)) tareas.push(o); guarda(o); }
  else if(u.tipo==="palomita" && t){ if(u.clave){ (t.claves||[]).forEach(function(c){ if(c && String(c.id)===u.clave) c.ok=!!u.prev; }); }
    else if(t.checklist){ (t.checklist.items||[]).forEach(function(it){ if(it && it.id===u.item) it.estado=u.prev; }); } guarda(t); }
  else if(u.tipo==="prop256" && t){ delete t.tipo_elegido; t.autorizada=false; t.por_autorizar=true; delete t.nueva256; t.tipo_item=u.prev||t.tipo_item; t.es_dato=!!u.dato; if(window.__p256f) delete window.__p256f[t.id]; guarda(t); }
  else if(u.tipo==="tipo" && t){ t.tipo_item=u.prev||""; t.es_dato=(u.prev==="dato"); if(u.elegido) t.tipo_elegido=true; else delete t.tipo_elegido; guarda(t); }
  else return "";
  histMarca(e.id); return "Deshecho: "+e.que;
}
function vHistorial(){
  var l=histLee().slice(0,50), h='<div class="top"><button class="iconbtn" id="bback">‹</button><div><div class="tnm"><span class="t">Historial</span></div><div class="d">Lo último que tocaste</div></div></div><div class="scroll"><ul class="hist240">';
  if(!l.length) h+='<li class="vac">Todavía no hay nada.</li>';
  l.forEach(function(e){ var d=new Date(e.ts||0), hh=("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2), dia=iso(d)===hoy()?"":fechaMovCorta(iso(d))+" ";
    h+='<li><button class="hrow240" data-hid="'+esc(e.tid||"")+'"><time>'+esc(dia+hh)+'</time><span class="ht"><b>'+esc(e.tnom||"—")+'</b><span>'+esc(e.que)+'</span></span></button>'+
      (e.undo && !e.hecho?'<button class="hund240" data-hund="'+esc(e.id)+'">Deshacer</button>':(e.hecho?'<small class="hok">deshecho</small>':''))+'</li>'; });
  return h+'</ul></div>';
}
function bindHistorial(){
  var b=$("bback"); if(b) b.onclick=function(){ vista="lista"; render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-hid]"), function(el){ el.onclick=function(){ var id=el.getAttribute("data-hid"); if(!id || !tareaId240(id)){ toast("Esa tarea ya no está abierta"); return; } abierta=id; vista="hilo"; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-hund]"), function(el){ el.onclick=function(ev){ ev.stopPropagation(); var e=histLee().filter(function(x){ return x.id===el.getAttribute("data-hund"); })[0]; var r=deshaz240(e); if(r) toast(r); render(); }; });
}
/* envoltorios del historial: lo que ya hacen estas funciones no cambia, solo se anota */
(function(){
  if(typeof window==="undefined" || window.__envueltas240) return; window.__envueltas240=1;
  var _ch=cierraHecha; cierraHecha=function(t){ var r=_ch.apply(this, arguments); try{ if(t && t.cierre) hist240("Ya está (la cerró)", t, {tipo:"reabrir"}); }catch(e){} return r; };
  var _mf=mueveFecha; mueveFecha=function(t, nueva){ var de=t&&t.f_vigente; var r=_mf.apply(this, arguments); try{ if(r && r.ok!==false && t.f_vigente===nueva) hist240("Movió la fecha "+(de?"del "+fechaMovCorta(de)+" ":"")+"al "+fechaMovCorta(nueva), t, {tipo:"fecha", f:de||""}); }catch(e){} return r; };
  var _mm=mueveMensaje; mueveMensaje=function(t, ix, did){ var x=t&&(t.msgs||[])[ix]; var r=_mm.apply(this, arguments); try{ if(r && x){ var d=tareaId240(did); if(window.__lote245){ window.__lote245.items.push({ts:x.ts, did:did}); return r; } hist240("Movió un mensaje a “"+((d&&d.nombre)||"otra tarea")+"”", t, {tipo:"mover", ts:x.ts, did:did}); } }catch(e){} return r; };
  var _en=enlazaTareas; enlazaTareas=function(oid, did){ var o=tareaId240(oid), d=tareaId240(did), sn=(o&&d)?{o:JSON.parse(JSON.stringify(o)), did:did, dmsgs:JSON.parse(JSON.stringify(d.msgs||[])), denl:JSON.parse(JSON.stringify(d.enlazadas||[]))}:null;
    var r=_en.apply(this, arguments); try{ if(o && o.fusionada_en===did){ var e=hist240("Vinculó a “"+((d&&d.nombre)||"")+"”", o, {tipo:"vincular", did:did}); if(e && sn){ window.__undo240=window.__undo240||{}; window.__undo240[e.id]=sn; }
      /* build 243: la destino abre en su vista normal (Importante) con "Vinculada · Deshacer" */
      if(window.__vf230) delete window.__vf230[did]; window.__hoja225=null; menuOpen=false; quitaToast();
      if(e && sn){ window.__ultimoDeshacer={id:o.id, tipo:"vinculo", cuando:Date.now(), restaurar:function(){ deshaz240(e); }}; muestraDeshacer("vinculo", "Vinculada", 6000); }
      if(vista==="hilo" && abierta===did) render(); } }catch(er){}
    try{ if(window.__volver256 && window.__volver256.oid===oid){ window.__volver256=null; if(o && o.fusionada_en===did){ abierta=null; vista="lista"; render(); } } }catch(er){}   /* build 256: se vuelve al Acomodo */
    return r; };
  var _ok=okG; okG=function(t, ixs){ var r=_ok.apply(this, arguments); try{ if(r && !window.__lote245) hist240("Acomodo: OK", t, null); }catch(e){} return r; };
  var _nv=nuevaG; nuevaG=function(t, ixs, comoDato){ var n=_nv.apply(this, arguments); try{ if(n && !window.__lote245) hist240("Acomodo: "+(comoDato?"Dato":"Nueva")+" “"+n.nombre+"”", t, null); }catch(e){} return n; };
  var _cr=completaRevision; completaRevision=function(t, v){ try{ hist240("Dictado: “"+String(v||"").replace(/\s+/g," ").slice(0,60)+(String(v||"").length>60?"…":"")+"”", t, null); }catch(e){} return _cr.apply(this, arguments); };
  var _nc=notaClaude; notaClaude=function(t, v){ try{ hist240("Indicación a Claude: “"+String(v||"").replace(/\s+/g," ").slice(0,60)+"”", t, null); }catch(e){} return _nc.apply(this, arguments); };
  var _ma=mandaAExterno; mandaAExterno=function(t, nombre, v){ try{ hist240("Mensaje a "+nombreCorto(nombre).split(" ")[0]+": “"+String(v||"").replace(/\s+/g," ").slice(0,50)+"”", t, null); }catch(e){} return _ma.apply(this, arguments); };
  var _md=mandaDM; mandaDM=function(t, k, v){ try{ hist240("Mensaje a "+((PERSONAS[k]||{}).nombre||k)+": “"+String(v||"").replace(/\s+/g," ").slice(0,50)+"”", t, null); }catch(e){} return _md.apply(this, arguments); };
})();
function quitaToast(){ var tt=document.getElementById("toast"); if(tt){ tt.classList.remove("on"); tt.textContent=""; } }
function platicaSola(){
  var L=window.__plat239||[]; window.__plat239=[]; window.__plat239T=null; var tocadas=[];
  L.forEach(function(g){ var t=g.t, n=0; g.ixs.forEach(function(ix){ var x=(t.msgs||[])[ix]; if(!x || x.oculto || confirmado237(x)) return;
      x.oculto=true; x.oculto_ts=Date.now(); x.oculto_por="auto"; x.oculto_motivo="platica"; x.duda_resuelta="platica"; x.acomodo={ok:0, ts:Date.now(), por:"auto", platica:1}; n++; });
    if(n){ censoAcomodo(t, t.msgs[g.ixs[0]], t.id, "", "platica_auto"); if(tocadas.indexOf(t)<0) tocadas.push(t); } });
  tocadas.forEach(function(t){ guarda(t); });
  if(tocadas.length && db) render();
}
/* lo de HOY: mensajes de WhatsApp que llegaron solos a una tarea (los movidos a mano no cuentan dos veces) */
function acomodoHoy(){
  var H=hoy(), n=0, mal=0, L=[];
  tareas.forEach(function(t){ if(!t || t.es_recordatorio) return;
    (t.msgs||[]).forEach(function(x){ if(!x || !x.wa_in || x.movido_de || x.nota_ia || !x.ts) return; var f=""; try{ f=iso(x.ts); }catch(e){} if(f!==H) return;
      if(x.duda_tarea && !x.duda_resuelta) return;   /* lo dudoso va arriba, todavia no cuenta */
      if(x.acomodo && x.acomodo.por==="auto") return;   /* build 239: el saludo que se marcó solo como plática no cuenta ni como acierto ni como error */
      n++; var m=!!(x.movido_a || x.duda_resuelta==="otra" || x.duda_resuelta==="platica" || (x.acomodo && x.acomodo.ok===0)); if(m) mal++;
      L.push({t:t, x:x, mal:m}); }); });
  return {n:n, ok:n-mal, lista:L.sort(function(a,b){ return (b.x.ts||0)-(a.x.ts||0); })};
}
/* ===================== build 256 (Salvador): NINGUNA TAREA NUEVA DE LA IA QUEDA CREADA SIN PASAR POR ÉL =====================
   Toda tarea con creada_por "ia" / "mac" / "revisor" / "ia_revisor" y sin tipo_elegido es una PROPUESTA: no sale en ninguna lista normal ni cuenta
   en ellas; sale en Acomodo como "Tarea nueva propuesta: <título> · de <contacto>" con los mensajes que la originaron y OK · Mover/Vincular · Dato ·
   No guardar. OK la crea (si no tiene fecha, fechas rápidas) y queda arriba con la etiqueta "Nueva"; Vincular la fusiona en otra; Dato la deja como
   dato; No guardar la deja "descartada" (no se borra) y pregunta "¿Sí era de X?" para que el sistema aprenda. Las que ya existían se muestran igual. */
var PROP256=/^(ia|mac|revisor|ia_revisor)$/i;
/* build 260: el banner "N tareas nuevas por revisar" PLIEGA y DESPLIEGA la sección Acomodo de la lista principal (se recuerda en localStorage) */
function acoPlegado(){ return !abre285("aco"); }   /* build 285: el plegado vive en el estado del día (amanece plegada) */
function poneAcoPlegado(v){ window.__acoPleg260=!!v; ponAbre("aco", !v); try{ localStorage.setItem("bit_aco_pleg260", v?"1":"0"); }catch(e){} }
function esPropuesta(t){
  if(!t || !PROP256.test(String(t.creada_por||""))) return false;
  if(t.tipo_elegido || t.autorizada || t.cierre || t.fusionada_en || t.es_recordatorio || t.descartada_al_nacer) return false;
  if(t.estado==="fusionada" || t.estado==="descartada") return false;
  try{ if(estadoReal(t)==="cerrada" || esEjemplo(t)) return false; }catch(e){}
  return !t.duenio || t.duenio===yo || !!(PERSONAS[yo] && PERSONAS[yo].jefe);
}
function propuestas256(){
  window.__p256f=window.__p256f||{};
  return (tareas||[]).filter(function(t){ return esPropuesta(t) || (t && window.__p256f[t.id] && !t.fusionada_en); })
    .sort(function(a,b){ return (msCreacion(b)||b.ultimo_ts||0)-(msCreacion(a)||a.ultimo_ts||0); });
}
function contactoProp(t){
  var c=""; (t.wa_contactos||[]).some(function(w){ c=String((w&&w.nombre)||w||""); return !!c; });
  if(!c) (t.msgs||[]).some(function(x){ if(x && (x.wa_c||x.chat)){ c=String(x.wa_c||x.chat); return true; } return false; });
  if(!c && t.revisa_ext) c=String(t.revisa_ext);
  return nombreLimpio(c||"")||"la IA";
}
/* build 260: ORIGEN de la propuesta (canal · quién · frase · por qué). Campos que deja la Mac: origen ("correo_revisor"…), correo_de (nombre del remitente),
   analisis, msgs[0] ("IA: Tarea creado desde correo de X: …"). Opcionales y mejores si la Mac los llena: correo_asunto, correo_remitente (email),
   correo_fragmento (primeras líneas del correo), por_que. */
function msgsProp(t){
  return (t.msgs||[]).map(function(x,i){ return {x:x, i:i}; }).filter(function(o){ var x=o.x; return x && !x.nota_ia && !x.nota_claude && !x.res238 && !x.dict238 && x.k!=="bal" && !x.prog && !(typeof esNotaIA==="function" && esNotaIA(x)) && String(_txMsg(x)||"").trim(); }).slice(0,3);
}
function sinPrefijoIA(x){ return String(x||"").replace(/^\s*IA:\s*/i,"").replace(/^\s*Tarea\s+(crea\w+|nueva)\s+(desde|por)\s+(correo|whats\s?app|dictado)[^:]{0,80}:\s*/i,"").replace(/\s+/g," ").trim(); }
function origenProp(t){
  var og=String(t.origen||"")+" "+String(t.analisis||"")+" "+String(t.fuente||"")+" "+String(t.via||""), m0=(t.msgs||[])[0]||{};
  var msgsWA=(t.msgs||[]).some(function(x){ return x && (x.wa_c || +x.wa_in===1); }), esCorreo=!!(t.correo_de||t.correo_asunto||t.correo_remitente||t.correo||t.gmail_id||t.gmail_thread||/correo|gmail|e-?mail/i.test(og) || m0.tipo==="correo" || m0.correo || /correo/i.test(String(m0.origen||"")) || /desde correo/i.test(String(m0.t||"")));
  var canal=esCorreo?"Correo":((msgsWA||(t.wa_contactos||[]).length||/whats\s?app|^wa_|_wa\b/i.test(og))?"WhatsApp":((/dict/i.test(og)||m0.dict238||(m0.k==="bo" && !m0.wa_c))?"Dictado":(/mac|revisor|ia/i.test(String(t.creada_por||""))&&!msgsWA?"Dictado":"WhatsApp")));
  if(canal==="Dictado" && (t.msgs||[]).length && !(t.msgs[0].k==="bo" || t.msgs[0].dict238) && !/dict/i.test(og)) canal=esCorreo?"Correo":"WhatsApp";
  var quien, frase=[], extra="";
  if(canal==="Correo"){
    quien=String(t.correo_remitente||"").trim()||String(t.correo_de||"").trim(); if(t.correo_remitente && t.correo_de && !/@/.test(t.correo_de)) quien=t.correo_de+" <"+t.correo_remitente+">";
    if(!quien){ var mm=String(m0.t||"").match(/desde correo de ([^:]{2,60}):/i); quien=mm?mm[1].trim():"remitente no registrado"; }
    var cuerpo=sinPrefijoIA(m0.t||t.contexto||"");
    if(t.correo_asunto) frase.push("Asunto: "+String(t.correo_asunto).trim());
    var fr=String(t.correo_fragmento||"").trim()||cuerpo; if(fr){ var ls=(fr.match(/[^.!?\n]+[.!?]?/g)||[fr]).map(function(z){ return z.trim(); }).filter(Boolean).slice(0,2).join(" "); frase.push((t.correo_asunto?"":"Del correo: ")+ls.slice(0,260)); }
    if(!t.correo_asunto) extra="asunto";
  } else if(canal==="WhatsApp"){
    quien=contactoProp(t); var ms=msgsProp(t); ms.forEach(function(o){ frase.push(_txMsg(o.x).replace(/^[^:\n]{1,40}:\s*/,"")); });
    if(!frase.length && m0.t) frase.push(sinPrefijoIA(m0.t).slice(0,260));
  } else {
    quien="Salvador"; var d0=(t.msgs||[]).filter(function(x){ return x && String(x.t||"").trim(); })[0]; if(d0) frase.push(sinPrefijoIA(d0.t).slice(0,260));
  }
  var pq=String(t.por_que||"").trim(), nc=(t.notas_claude||[]).filter(function(n){ return n && n.t && !/^CONTEXTO:/.test(n.t); }).slice(-1)[0];
  var ctx=String(t.contexto||"").replace(/\s+/g," ").trim(), mostrada=_n179(frase.join(" "));
  if(!pq && nc) pq=String(nc.t||"");
  if(!pq && ctx && _n179(ctx).indexOf(mostrada.slice(0,60))<0 && mostrada.indexOf(_n179(ctx).slice(0,60))<0) pq=ctx;
  if(!pq) pq=String(t.analisis||"").replace(/\s+/g," ").trim()||String(t.pendiente_info||"").trim();
  if(!pq) pq="La IA detectó un pendiente en "+(canal==="Correo"?"este correo":(canal==="Dictado"?"lo que dictaste":"estos mensajes"))+" y lo dejó aquí para que tú decidas.";
  return {canal:canal, quien:nombreLimpio(quien)||quien, frase:frase, porque:pq.slice(0,220), falta:extra};
}
function vPropuestas(P){
  return P.map(function(t){
    var og=origenProp(t), c=og.quien, esp=!!(window.__p256f||{})[t.id];
    if(esp) return '<div class="acor p256" data-p256="'+esc(t.id)+'"><span class="av226">'+esc(inicialesDe(c))+'</span><span class="acob"><span class="acow"><b>Creada: '+esc(t.nombre||"Tarea nueva")+'</b><button class="p256x" data-p256d="sin" aria-label="Después: sin fecha">'+ico("x",14)+'</button></span><span class="ac226 p256f"><span class="q">¿Para cuándo?</span><button data-p256d="hoy">Hoy</button><span>·</span><button data-p256d="man">Mañana</button><span>·</span><button data-p256d="sem">Esta semana</button><span>·</span><button data-p256d="sin">Sin fecha</button></span></span></div>';
    return '<div class="acor p256" data-p256="'+esc(t.id)+'"><span class="av226">'+esc(inicialesDe(c))+'</span><span class="acob"><span class="acow"><b>Tarea nueva propuesta: '+esc(t.nombre||"Sin nombre")+'</b></span>'+
      '<span class="p256de"><span class="p256cn">'+esc(og.canal)+'</span> · '+esc(og.quien)+'</span>'+
      og.frase.map(function(f){ return '<span class="p256m">'+htmlTx(f, {})+'</span>'; }).join("")+
      (og.porque?'<span class="p256why"><b>Por qué la propuse:</b> '+esc(og.porque)+'</span>':'')+
      '<span class="ac226 p256b"><button data-p256a="ok">OK</button><span>·</span><button data-p256a="vinc">Mover / Vincular a…</button><span>·</span><button data-p256a="dato">Dato</button><span>·</span><button data-p256a="ng">No guardar</button></span></span></div>';
  }).join("");
}
function viernes256(){ var d=new Date(hoy()+"T12:00:00"), w=d.getDay(), add=(w>=1&&w<=5)?(5-w):(w===6?6:5); if(w===0) add=5; d.setDate(d.getDate()+add); return iso(d); }
function okProp(t, esp){
  var ant={tipo:t.tipo_item||"", dato:!!t.es_dato};
  t.tipo_elegido=true; t.tipo_item=(t.tipo_item==="dato")?"dato":"tarea"; t.es_dato=(t.tipo_item==="dato"); t.autorizada=true; t.autorizada_ts=Date.now(); t.por_autorizar=false; t.nueva256=Date.now();
  window.__p256f=window.__p256f||{}; if(!t.f_vigente) window.__p256f[t.id]=1;
  guarda(t); try{ hist240("Propuesta aceptada: “"+String(t.nombre||"")+"”", t, {tipo:"prop256", prev:ant.tipo, dato:ant.dato}); }catch(e){}
  return t;
}
function fechaProp(t, k){
  var f=""; if(k==="hoy") f=hoy(); else if(k==="man"){ var d=new Date(hoy()+"T12:00:00"); d.setDate(d.getDate()+1); f=iso(d); } else if(k==="sem") f=viernes256();
  if(window.__p256f) delete window.__p256f[t.id];
  if(f){ t.f_vigente=f; t.f_original=t.f_original||f; t.fecha_dictada=true; delete t.falta_fecha; try{ sincronizaAvisos(t); }catch(e){} }
  guarda(t); return f;
}
function descartaProp(t){
  var ixs=[]; (t.msgs||[]).forEach(function(x,i){ if(x && !x.oculto && !x.nota_ia && !x.nota_claude && !x.res238 && !x.dict238 && x.k!=="bal" && !x.prog && !(typeof esNotaIA==="function" && esNotaIA(x))) ixs.push(i); });
  try{ noGuardar(t, ixs); }catch(e){}   /* oculta los mensajes y pregunta "¿Sí era de X?" (acomodo_reglas) */
  t.estado="descartada"; t.descartada256_ts=Date.now(); t.descartada256_por=yo||""; guarda(t);
  var i=tareas.indexOf(t); if(i>=0) tareas.splice(i,1);
  try{ hist240("Propuesta descartada: “"+String(t.nombre||"")+"”", t, null); }catch(e){}
}
function bindPropuestas(){
  var r=document.querySelector(".aco226:not(.msg271)");
  var rb=$("bprop256"); if(rb) rb.onclick=function(){ poneAcoPlegado(!acoPlegado()); render(); };
  if(!r) return;
  var tDe=function(el){ var c=el.closest("[data-p256]"); return c?tareas.filter(function(z){ return z.id===c.getAttribute("data-p256"); })[0]:null; };
  Array.prototype.forEach.call(r.querySelectorAll("[data-p256a]"), function(el){ el.onclick=function(ev){ ev.stopPropagation(); var t=tDe(el); if(!t) return; var a=el.getAttribute("data-p256a");
    try{ var _rc=el.getBoundingClientRect(); window.__tap245={l:_rc.left, t:_rc.top, w:_rc.width, h:_rc.height, ts:Date.now()}; }catch(e){}
    if(a==="ok"){ okProp(t); toast(t.f_vigente?"Creada: “"+corta40(t.nombre)+"”":"Creada. ¿Para cuándo?"); render(); return; }
    if(a==="ng"){ descartaProp(t); render(); return; }
    var sim=[]; try{ sim=similares229(t).map(function(d){ return d.id; }); }catch(e){}
    window.__volver256={oid:t.id};
    if(a==="vinc"){ abreEnlazar(t.id, {similares:sim}); return; }
    if(a==="dato"){ abreEnlazar(t.id, {similares:sim, etiquetaNueva:"Dato suelto", subNueva:"Queda como dato", tareaNueva:function(){ t.tipo_item="dato"; t.es_dato=true; t.tipo_elegido=true; t.autorizada=true; t.autorizada_ts=Date.now(); t.por_autorizar=false; t.falta_fecha=false; guarda(t);
      try{ hist240("Propuesta como dato: “"+String(t.nombre||"")+"”", t, {tipo:"prop256", prev:t.tipo_item||"", dato:false}); }catch(e){} window.__volver256=null; toast("Quedó como dato “"+corta40(t.nombre)+"”"); render(); }}); return; } }; });
  Array.prototype.forEach.call(r.querySelectorAll("[data-p256d]"), function(el){ el.onclick=function(ev){ ev.stopPropagation(); var t=tDe(el); if(!t) return; var f=fechaProp(t, el.getAttribute("data-p256d")); toast("Creada: “"+corta40(t.nombre)+"”"+(f?" · "+fechaMovCorta(f):" · sin fecha")); render(); }; });
}
function vAcomodo(fijo){
  var P=propuestas256(), solo=(window.__aco256==="prop" && P.length);
  if(!fijo && acoPlegado() && P.length) return "";   /* build 260: el banner plegó la sección */
  if(!P.length) return "";   /* build 271: las pláticas (mensajes sin tarea) viven en su propia pestaña plegable, vMsgs */
  var _np=P.length;   /* build 260: cuenta las dos clases (propuestas y 'Creada · ¿Para cuándo?'): el número cuadra con las tarjetas */
  var h='<div class="aco226"><div class="acoh"><b>Acomodo</b><span>'+_np+(_np===1?' tarea nueva':' tareas nuevas')+' por revisar'+'</span></div>';
  if(P.length) h+='<div class="acog">'+vPropuestas(P)+'</div>'+(solo?'<button class="acof" id="bprop256x" onclick="window.__aco256=\'\';render()"><span>Ver todo el Acomodo</span></button>':'');
  return h+'</div>';
}
/* build 271 (Salvador 7-oct): "Mensajes por acomodar" — los mensajes de WhatsApp o correo que la IA no sabe a qué tarea van (tarjetas
   OK · Mover · Nueva · Dato · No guardar, sin cambios por dentro) salen del Acomodo a su propia pestañita plegable, justo debajo de
   "Nuevas tareas para acomodar" y arriba de "Te pregunta Doit". El encabezado lleva el contador; el plegado se recuerda (localStorage). */
function msgPlegado(){ return !abre285("msg"); }   /* build 285: estado del día */
function poneMsgPlegado(v){ window.__msgPleg271=!!v; ponAbre("msg", !v); try{ localStorage.setItem("bit_msg_pleg271", v?"1":"0"); }catch(e){} }
function vMsgs(fijo){
  if(!fijo && window.__aco256==="prop" && propuestas256().length) return "";   /* "solo propuestas" (build 256) */
  var D=platicasAcomodo(), A=acomodoHoy(); if(!D.length && !A.n) return "";   /* build 237: UNA tarjeta por plática */
  var pl=!fijo && msgPlegado();
  var h='<div class="aco226 msg271">'+(fijo?'':'<button class="clh263 msgh271" id="bmsg271" aria-expanded="'+(pl?"false":"true")+'" aria-label="Mensajes por acomodar: '+D.length+'"><b>Mensajes por acomodar</b><span class="ttn'+(D.length?'':' n0')+'">'+D.length+'</span><span class="ttch ch285" aria-hidden="true">'+CH285+'</span></button>');
  if(pl) return h+'</div>';
  if(D.length) h+='<div class="acog">'+D.slice(0,8).map(function(g){ var t=g.t, ix0=g.ixs[0], x0=t.msgs[g.ixs[g.ixs.length-1]], k=t.id+"|"+ix0, ab=!!(window.__g237open||{})[k],
      _pm=ab && g.ixs.some(function(i){ var x=t.msgs[i]; return !(esSaludo239(t,x) || confirmado237(x) || x.oculto); });   /* build 245: con botones por mensaje, la fila del final sobra */
    return '<div class="acor g237'+(ab?' ab':'')+'" data-acot="'+esc(t.id)+'" data-acoix="'+ix0+'" data-acg="'+esc(g.ixs.join(","))+'" data-g237="'+esc(k)+'"><span class="av226">'+esc(inicialesDe(g.contacto))+'</span><span class="acob"><span class="acow"><b>'+esc(g.contacto||"Contacto")+'</b><span class="n237">'+(g.n||g.ixs.length)+' mensaje'+((g.n||g.ixs.length)===1?'':'s')+'</span><time>'+esc(x0.h||"")+'</time></span>'+
      '<span class="acom x237">'+htmlTx(g.extracto, g.extractoX)+'</span><span class="pill226">'+ico("folder",14)+'creo que es: '+esc(tareaCorta(t))+(g.sinClasificar?'<span class="q"> · sin clasificar</span>':'')+'</span>'+
      (ab?'<span class="msgs237">'+g.ixs.map(function(i){ var x=t.msgs[i], pl=esSaludo239(t,x), ok=confirmado237(x)||x.oculto; return '<span class="m237'+(pl?' tenue':'')+(ok?' listo':'')+'"><span class="mtx"><time>'+esc(x.h||"")+'</time>'+htmlTx(_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,""), x)+'</span>'+(pl||ok?'':'<span class="prop238">creo que es: '+esc(tareaCorta(t))+(x.duda_tarea&&x.duda_tarea.alternativa_nombre&&!x.duda_resuelta?' · ¿o '+esc(x.duda_tarea.alternativa_nombre)+'?':'')+'</span>'+botonesG(i, [i], " m238"))+'</span>';   /* build 238: su propia propuesta */ }).join("")+'</span>':'')+
      (_pm?'':'<span class="ac226" data-acix="'+ix0+'" data-acg="'+esc(g.ixs.join(","))+'"><button data-acok="'+ix0+'">OK</button><span>·</span><button data-acmov="'+ix0+'">Mover</button><span>·</span><button data-acnueva="'+ix0+'">Nueva</button><span>·</span><button data-acdato="'+ix0+'">Dato</button><span>·</span><button data-acng="'+ix0+'">No guardar</button></span>')+'</span></div>'; }).join("")+'</div>';   /* build 243: "OK · sin importancia" vive solo en ¿A dónde va? */
  var ab=!!window.__aco226;
  if(A.n){ h+='<button class="acof" id="bacof">'+ico("check",18)+'<span>Acomodé solo hoy · '+A.n+'</span><span class="r">acerté '+A.ok+'/'+A.n+'</span>'+ico(ab?"down":"chev",16)+'</button>';
    if(ab) h+='<div class="acol">'+A.lista.slice(0,30).map(function(o){ return '<button class="acoli" data-id="'+esc(o.t.id)+'"><span>'+esc(nombreLimpio(o.x.wa_c||""))+'</span><span class="'+(o.mal?'tenue':'')+'">'+esc(tareaCorta(o.t))+(o.mal?' · corregido':'')+'</span></button>'; }).join("")+'</div>'; }
  return h+'</div>';
}
function bindAcomodoInicio(){
  var bm=$("bmsg271"); if(bm) bm.onclick=function(){ poneMsgPlegado(!msgPlegado()); render(); };
  Array.prototype.forEach.call(document.querySelectorAll(".aco226"), bindAcomodoUna);
}
function bindAcomodoUna(r){
  var tDe=function(el){ var c=el.closest("[data-acot]"); return c?tareas.filter(function(z){ return z.id===c.getAttribute("data-acot"); })[0]:null; };
  bindAcomodo(r, tDe);
  Array.prototype.forEach.call(r.querySelectorAll("[data-g237]"), function(el){ el.addEventListener("click", function(ev){ if(ev.target.closest("button")) return; window.__g237open=window.__g237open||{}; var k=el.getAttribute("data-g237"); window.__g237open[k]=!window.__g237open[k]; render(); }); });   /* build 237: tocar = desplegar */
  var bf=$("bacof"); if(bf) bf.onclick=function(){ window.__aco226=!window.__aco226; render(); };
  Array.prototype.forEach.call(r.querySelectorAll(".acoli[data-id]"), function(el){ el.onclick=function(){ abierta=el.getAttribute("data-id"); vista="hilo"; fichaOpen=false; detOpen={}; menuOpen=false; editaNombre=null; render(); }; });
  /* deslizar: derecha = OK, izquierda = Mover (como en Mail) */
  Array.prototype.forEach.call(r.querySelectorAll(".acor"), function(el){ var x0=0, y0=0, dx=0, va=false;
    el.addEventListener("touchstart", function(e){ var p=e.touches[0]; x0=p.clientX; y0=p.clientY; dx=0; va=false; }, {passive:true});
    el.addEventListener("touchmove", function(e){ var p=e.touches[0]; dx=p.clientX-x0; if(!va && Math.abs(dx)>12 && Math.abs(dx)>Math.abs(p.clientY-y0)*1.7) va=true; if(va) el.style.transform="translateX("+dx+"px)"; }, {passive:true});
    el.addEventListener("touchend", function(){ el.style.transform=""; if(!va) return; var t=tDe(el), ix=+el.getAttribute("data-acoix"); if(!t) return;
      var _gx=ixsDe(el, ix); if(dx>80){ var s=okG(t, _gx); if(s) toast(s); render(); } else if(dx<-80) abreMover(t, ix, _gx); });   /* build 237: toda la plática */
  });
}
/* sin emojis en la interfaz: los avisos del sistema ("📝 Nota IA", "✉️ Enviado", "🎙️ Audio enviado") se pintan sin el dibujito */
function sinEmojiUI(s){ return String(s==null?"":s).replace(/^(\s*(?:[☀-➿⭐️‍]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF])+\s*)+/,""); }
/* ===================== build 230 (Salvador 16:42, "Inversiones BBVA": el filtro no distinguía nada) =====================
   Hoja "Todo ⌄": Todo · Importante ("acuerdos y conclusiones") · Claude ("lo que le pediste y lo que contestó") · integrantes ·
   "Integrantes · agregar o quitar". IMPORTANTE: arriba la tarjeta "Resumen" (campo resumen = {texto, acuerdos[{t,fecha,de,msg_id}],
   pendientes[{t,de}], actualizado}); debajo SOLO lo importante: msg_imp[id]=1; sin clasificar, regla de respaldo (se oculta lo de
   menos de 60 letras sin cifra, fecha, archivo ni pregunta). La ficha "Resumen" abre esta vista (un solo resumen). CLAUDE: solo lo
   que le pediste a Claude y lo que contestó; las "Nota IA" automaticas no. Integrantes con nombre de puro numero: se busca en la
   agenda o en otro mensaje del mismo numero; si no, "Contacto sin nombre ·1884" (nunca el numero completo). */
function vista230(t){ var o=window.__vf230||{}; if(t && !Object.prototype.hasOwnProperty.call(o, t.id)) return "imp";   /* build 235: al abrir, SIEMPRE en Importante */
  var v=o[t&&t.id]||""; return v==="imp"||v==="claude"?v:""; }
function poneVista(t, v){ window.__vf230=window.__vf230||{}; window.__vf230[t.id]=v||""; window.__cnlClaude=window.__cnlClaude||{}; window.__cnlClaude[t.id]=(v==="claude")?1:0; }
function msgId(x){ return String((x&&(x.id||x.msg_id||x.wa_id||x.nid))||((x&&x.ts)?"ts"+x.ts:"")); }
/* ¿es importante? 1/0 si Claude ya lo clasificó en msg_imp; si no, la regla de respaldo */
function esOrdenFecha(tx){ var s=_fsa(tx); return s.length<200 && (/\b(modific\w*|muev\w*|mueve|reprogram\w*|recorr\w*|para cuando|vencid\w*|ritmo|recuerdame|avisame|ejecutar? para|ejecutada para|esta tarea es para|fecha)\b/.test(s) || /^\s*para el\b/.test(s)); }   /* 242: "deben estar listos para el próximo miércoles" es contenido */
/* build 246 (Salvador 6-oct 07:15, "Importante más estricto"): las indicaciones de Salvador a Claude ya cumplidas o superadas no salen en Importante.
   Es indicación: k "bo" con nota_claude/indicacion_ts, dictado (hab), completa_info o dict238 cortos, o texto que empieza con "Claude…", "prográmame",
   "recuérdame", "muévela", "Es: Tarea/Dato". Sale de Importante si tiene más de 24 h o si Claude ya contestó después ("Anotado", "Movida", "Reprogramada", "Listo"). */
function esIndicacion(x){
  if(!x || x.k!=="bo") return false;
  if(x.nota_claude || x.indicacion_ts || x.hab) return true;
  var tx=String(x.tr||x.t||"").trim();
  if(/^\s*(ok[,.\s]+)?(claude\b|progr[aá]ma\w*|recu[eé]rda\w*|m[uú]eve\w*|m[uú]ev[eé]la\w*|es\s*:\s*(tarea|dato)\b)/i.test(tx)) return true;
  if((x.completa_info || x.dict238) && tx.length<140) return true;
  return false;
}
function indicacionCaduca(t, x){
  if(!esIndicacion(x)) return false;
  var ts=+x.ts||0;
  if(ts && Date.now()-ts>24*3600000) return true;
  if(!ts) return false;
  return (t&&t.msgs||[]).some(function(y){ return y && y!==x && y.k==="bi" && !(+y.wa_in) && !y.wa_c && (+y.ts||0)>=ts && /^\s*(anotad[oa]|anot[eé]|movid[ao]|reprogramad[ao]|list[oa])(?![a-záéíóúñ])/i.test(String(y.t||"")); });
}
function esImp(t, x){
  if(x && x.oculto) return false;                                  /* build 246: lo oculto nunca sale */
  if(indicacionCaduca(t, x)) return false;
  var mi=(t && t.msg_imp && typeof t.msg_imp==="object")?t.msg_imp:{}, k=msgId(x);
  if(k && Object.prototype.hasOwnProperty.call(mi,k)) return +mi[k]===1;
  if(x.nota_ia || /^\s*(📝\s*)?Nota IA\b/i.test(String(x.t||""))) return false;   /* las notas automaticas solo si Claude las marcó */
  /* build 240 (Salvador 21:31 "NO LIMPIA NADA"): nunca en Importante (solo en Todo): los toques automáticos de seguimiento o presión
     ("Van 9 veces…", "Ya venció…"), los avisos del sistema ("Movida del… al…", "Anotado. Te aviso…", "¿Para cuándo…?") y las órdenes de
     fecha o ritmo de Salvador ("muévela para el viernes", "recuérdame martes y jueves"). */
  if(x.k==="bal" || x.aviso || x.empujon) return false;
  if(esNotaIA(x)) return false;
  if(+x.wa_in!==1 && (x.wa_c || x.origen==="wa_saliente") && x.k!=="bo" && !(x.url || x.tipo==="foto" || x.tipo==="documento")) return false;   /* 242: lo que mandó Salvador por WhatsApp (salvo archivos) */
  if(x.k==="bo" && !x.nota_claude && (t && t.msgs||[]).some(function(y){ return y!==x && y && y.nota_claude && y.k==="bo" && _nn(String(y.t||"")).replace(/^\s*claude\s*/,"").slice(0,60)===_nn(String(x.t||"")).slice(0,60); })) return false;   /* 242: la misma indicación a Claude repetida */
  if(x.k==="bi" && !(+x.wa_in) && !x.wa_c && !x.de && !x.hab && !x.url && !x.tipo) return false;
  if(x.k==="bo" && esOrdenFecha(String(x.tr||x.t||""))) return false;
  if(x.nota_claude || x.indicacion_ts) return false;   /* la platica con Claude vive en la vista Claude (salvo que la marque importante) */
  var tx=String(x.tr||x.t||"").replace(/^[^:\n]{1,40}:\s*/,"").trim();
  if(x.url || x.tipo==="foto" || x.tipo==="documento" || x.img || x.data) return true;
  /* build 246: pasa la regla de contenido Y es reciente (7 días) o trae cifra, fecha o decisión */
  var _ts=+x.ts||0, _viejo=_ts && Date.now()-_ts>7*864e5;
  var _cifra=/\d/.test(tx), _fecha=/\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|hoy|ma[ñn]ana|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/i.test(tx),
      _decide=/\b(decid\w*|acord\w*|aprob\w*|autoriz\w*|confirmad[oa]s?|quedamos|queda(do|ron)?\b|vamos a|se va a)\b/i.test(tx);
  if(_cifra || _fecha || _decide) return true;
  if(tx.length>=60 || /\?/.test(tx)) return !_viejo;
  return false;
}
