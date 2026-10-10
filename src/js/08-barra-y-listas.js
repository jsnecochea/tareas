
/* foto -> evidencia de una tarea */
function pegaFotoA(t, foto){
  if(!t||!foto) return;
  t.evidencias=t.evidencias||[];
  var ev={data:foto.data, ts:foto.ts, lat:foto.lat, lon:foto.lon};
  t.evidencias.push(ev);
  msg(t,"bi","Le pegaste una foto.");
  guarda(t); fotoEnMano=null;
  leeFoto(t, ev);
}

/* LEE LA FOTO Y DEJA SUS DATOS EN TEXTO — Salvador 2026-09-04. Sin esto, lo que
   vive dentro de una imagen (la dirección del hotel, el monto del presupuesto)
   no se puede consultar después: la app sabía que el documento existía, pero no
   qué decía. Ahora al subirla se le pide a Claude que saque los datos y quedan
   como nota en el hilo, buscables y consultables. Si falla, no pasa nada: la
   foto se guarda igual, solo sin la lectura. */
function leeFoto(t, ev){
  if(!t||!ev||APP_TOKEN.indexOf("__")===0) return;
  var m=String(ev.data||"").match(/^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,(.+)$/i);
  if(!m) return;
  var tipo=m[1].toLowerCase().replace("image/jpg","image/jpeg");
  var b64=m[2];
  if(b64.length>4200000) return;              /* muy pesada: no se manda */
  var pide="Lee esta foto y saca SOLO los datos que se puedan consultar despues: montos, "+
    "direcciones, telefonos, paginas web, fechas, horas, numeros de reserva o folio, "+
    "nombres de proveedor o de hotel. En 1 a 3 renglones cortos, en español, TAL COMO se "+
    "lee en la imagen. NO interpretes ni completes lo que no se alcance a leer. Si no hay "+
    "nada util, contesta exactamente: NADA";
  preguntaAClaude([{role:"user",content:[
      {type:"image",source:{type:"base64",media_type:tipo,data:b64}},
      {type:"text",text:pide}]}],"rapido",function(txt,err){
    if(err||!txt) return;
    var leido=String(txt).trim();
    if(!leido || /^nada\.?$/i.test(leido)) return;
    ev.leido=leido;
    msg(t,"bi","De la foto: "+leido);
    guarda(t); if(typeof render==="function") render();
  });
}

/* ===== build 144 (Salvador 2026-09-26): PASOS DENTRO DE LA TAREA =====
   Un dictado con 2+ cosas nace como UNA tarea con su lista t.lista_pasos:
   [{id, tx, sec, meta, hecho, por, f}]. OJO: NO se llama t.pasos porque ese
   campo ya existe (los pasos con dia del "ritmo", que usan ritmo() e
   intentaCerrar); mezclarlos rompia el cierre. En pantalla se llaman "Pasos".
   Se palomean tocando el circulo o diciendo en el chat "ya compre la carne". */
function normalizaPasos(arr){
  if(!Array.isArray(arr)) return [];
  var vistos={}, out=[];
  arr.forEach(function(p){
    var tx="", sec="", meta="";
    if(typeof p==="string") tx=p;
    else if(p && typeof p==="object"){ tx=p.tx||p.texto||p.t||p.que||""; sec=p.sec||p.seccion||""; meta=p.meta||p.nota||""; }
    tx=String(tx||"").replace(/\s+/g," ").trim().replace(/[.;,]+$/,"");
    sec=String(sec||"").replace(/\s+/g," ").trim();
    meta=String(meta||"").replace(/\s+/g," ").trim();
    if(!tx || /^[<\[]/.test(tx) || /^(\.\.\.|…)$/.test(tx)) return;
    if(/^[<\[]/.test(sec)) sec=""; if(/^[<\[]/.test(meta)) meta="";
    var k=_nrm(tx).trim(); if(vistos[k]) return; vistos[k]=1;
    out.push({id:"p"+uid()+out.length, tx:conMayuscula(tx).slice(0,120), sec:sec.slice(0,40),
              meta:meta.slice(0,80), hecho:false, por:null, f:null});
  });
  return out.slice(0,40);
}
/* ===== build 214 (Salvador 8:07, "Fiesta Cumpleaños Papá": pidió 3 veces un checklist de invitados y Claude no lo hizo) =====
   t.checklist = {titulo, items:[{id, tx, estado 0|1|2, alias[], ts, fuente}]}: 0 pendiente ○, 1 invitado ✓, 2 confirmado ✓✓.
   Seccion desplegable arriba (como Pasos); tocar un renglon: ○ -> ✓ -> ✓✓ -> ○. Por voz o escrito: "ya invité a X", "X confirmó",
   "agrega a Y" (con "lista"/"checklist" o si la tarea ya tiene checklist). Crear la lista: Claude (accion checklist). */
var CHK_EST=["○","✓","✓✓"], CHK_NOM=["pendiente","invitado","confirmado"];
function tieneChecklist(t){ return !!(t && t.checklist && (t.checklist.items||[]).length); }
function _chkTok(x){ return _nv(x).split(" ").filter(function(w){ return w.length>=3 && ["esposa","esposo","senora","senor","pareja","novia","novio","con","los","las","del"].indexOf(w)<0; }); }
function chkBusca(t, nombre){
  var q=_chkTok(nombre); if(!q.length) return [];
  return (t.checklist.items||[]).filter(function(it){ var w=_chkTok(it.tx).concat((it.alias||[]).map(_nv).join(" ").split(" ").filter(Boolean));
    return q.some(function(x){ return w.indexOf(x)>=0 || (x==="xavier" && w.indexOf("javier")>=0) || (x==="javier" && w.indexOf("xavier")>=0); }); });
}
function chkNuevo(t, tx, estado, fuente){
  t.checklist=t.checklist||{titulo:"Lista", items:[]};
  var it={id:"c"+Date.now().toString(36)+Math.random().toString(36).slice(2,5), tx:conMayuscula(String(tx).replace(/\s+/g," ").trim()), estado:estado||0, ts:Date.now()};
  if(fuente) it.fuente=fuente; t.checklist.items.push(it); return it;
}
function chkPon(it, est, fuente){ if(est>it.estado || est===0){ it.estado=est; it.ts=Date.now(); if(fuente) it.fuente=fuente; return true; } return false; }
/* lo dicho -> cambios en la lista. Regresa null si no es para la lista; si si, {hecho:[], dudas:[]} */
function checklistDicho(t, v){
  var s=_nv(v), habla=/\b(check ?list|checklist|lista)\b/.test(s), tiene=tieneChecklist(t);
  var verbo=/\b(invite|invitamos|invitado|invitados|mande (la )?invitacion|le mande|les mande|confirmo|confirmaron|confirmado|confirmados|ya confirmo|agrega|agregale|anade|suma|apunta|quita|palomea)\b/.test(s);
  if(!verbo || !(habla || tiene)) return null;
  if(!tiene && tienePasos(t) && !/\b(check ?list|checklist|invit|confirm)/.test(s)) return null;   /* "agrégale a la lista" de Pasos sigue en Pasos */
  if(!tiene) return {crear:true};                                          /* no hay lista: la arma Claude con los nombres de la tarea */
  var hecho=[], dudas=[], fte="lo dijo "+((PERSONAS[yo]||{}).nombre||"")+" "+hhmmAhora();
  var nombres=function(seg){ return String(seg||"").replace(/\b(a la lista|en la lista|al checklist|en el checklist|por favor|tambien|ya|nada mas)\b/g," ").split(/,|\by\b|\be\b|\ba\b/).map(function(x){ return x.trim(); }).filter(function(x){ return _chkTok(x).length; }); };
  var aplica=function(lista, est){ lista.forEach(function(nm){ var m=chkBusca(t, nm);
    if(m.length===1){ if(chkPon(m[0], est, fte) && hecho.indexOf(m[0].tx+" "+CHK_EST[est])<0) hecho.push(m[0].tx+" "+CHK_EST[est]); }
    else if(m.length>1) dudas.push("¿Cuál "+nm+"? "+juntaY(m.map(function(x){ return x.tx; }))+".");
    else dudas.push("No encontré a "+conMayuscula(nm)+" en la lista; dime \"agrega a "+nm+"\" y lo pongo."); }); };
  var m;
  /* "X y Y confirmaron" / "ya confirmó X" / "confirmaron X" */
  if((m=s.match(/^(.*?)\b(ya )?(me |nos )?(confirmo|confirmaron)\b(.*)$/))){ var antes=m[1].replace(/\b(oye|clau|claude|en la lista|en el checklist|ponle que|pon que)\b/g," "), despues=m[5];
    aplica(nombres(_chkTok(antes).length?antes:despues), 2); }
  if((m=s.match(/\b(ya )?(le |les )?(invite|invitamos|mande (la )?invitacion|le mande (la )?invitacion|les mande (la )?invitacion)( a)?\s+(.*)$/))) aplica(nombres(m[8]||""), 1);
  if((m=s.match(/\b(agrega|agregale|anade|suma|apunta)\b( a)?\s+(.*)$/))){ nombres(m[3]).forEach(function(nm){ if(!chkBusca(t, nm).length){ chkNuevo(t, nm, 0, fte); hecho.push("agregué "+conMayuscula(nm)+" "+CHK_EST[0]); } }); }
  return {hecho:hecho, dudas:dudas};
}
function hhmmAhora(){ var d=new Date(); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); }
function respChecklist(t, r){
  var tot=t.checklist.items.length, inv=t.checklist.items.filter(function(x){ return x.estado>=1; }).length, conf=t.checklist.items.filter(function(x){ return x.estado===2; }).length;
  return [r.hecho.length?"Anoté en la lista: "+r.hecho.join(", ")+".":"", r.dudas.join(" "), "Van "+inv+" de "+tot+" invitados y "+conf+" confirmados."].filter(Boolean).join(" ");
}
/* ===== build 282 (F36, Salvador 2026-10-03, "Decoración Navideña Cumbres") =====
   "Claude, recuérdame el martes de darle seguimiento a Pato y Chuy y pedir la grúa y el material" se mandaba al modelo
   y el modelo no hizo nada (contestó con una fecha que nadie dijo). Regla fija EN EL TELÉFONO, sin IA:
   "recuérdame <cuándo> de <hacer X> y <hacer Y>…" (2+ cosas) -> UN aviso ese día (a la hora dicha o 9:00) y los pasos
   en la lista de la tarea, con la sección del día. La fecha de finiquito NO se toca. Fecha dudosa = una pregunta, nada
   se guarda. Lo que no encaja exacto (sin fecha, una sola cosa, otra fecha dentro de las cosas) sigue su camino de siempre. */
var VERBO282=/^[a-zñ]*(ar|er|ir)(le|les|lo|la|los|las|se|selo|sela|selos|selas|me|nos)?$/;
function recuerdaLista(v){
  var s=sinPrefijoClaude(String(v||"")).replace(/\s+/g," ").trim().replace(/[.!]+$/,"");
  var m=/^(?:por\s+favor\s+)?(?:recu[eé]rda(?:me|nos)|acu[eé]rda(?:me|te)|av[ií]same)\s+(.+)$/i.exec(s); if(!m) return null;
  var w=m[1].split(" "), nw=function(x){ return _nv(x); }, ini=-1;
  /* las cosas empiezan en el primer infinitivo que va despues de "de"/"que" (o pegado al cuando) */
  for(var i=1;i<w.length;i++){ if(VERBO282.test(nw(w[i])) && /^(de|que)$/.test(nw(w[i-1]))){ ini=i; break; } }
  if(ini<2) return null;
  var cuando=w.slice(0,ini-1).join(" "), cosas=w.slice(ini).join(" ");
  if(!cuando.trim() || cuando.split(" ").length>8) return null;
  var fd=fechaDictada(cuando); if(!fd.duda && fd.todas.length!==1) return null;
  if(fechaDictada(cosas).todas.length || fechaDictada(cosas).duda) return null;   /* otra fecha adentro: que lo vea el cerebro */
  /* partir por comas y por " y ": si el pedazo empieza con verbo es otra cosa; si empieza con articulo
     ("y el material") hereda el verbo de la anterior ("pedir el material"); si no, sigue siendo la misma ("a Pato y Chuy") */
  var crudo=cosas.split(/\s*,\s*(?:y\s+)?|\s+y\s+(?=\S)/i).map(function(x){ return x.trim(); }).filter(Boolean), out=[];
  crudo.forEach(function(x){ var p0=nw(x.split(" ")[0]);
    if(!out.length || VERBO282.test(p0)){ out.push(x); return; }
    var prev=out[out.length-1], pm=/^(\S+)\s+(el|la|los|las|un|una|unos|unas|lo)\b/i.exec(prev);
    if(/^(el|la|los|las|un|una|unos|unas)$/.test(p0) && pm && VERBO282.test(nw(pm[1]))) out.push(pm[1]+" "+x);
    else out[out.length-1]=prev+" y "+x; });
  if(out.length<2 || !VERBO282.test(nw(out[0].split(" ")[0]))) return null;
  return {fecha:fd.fecha, duda:fd.duda||"", cuando:cuando, cosas:out.map(function(x){ return conMayuscula(x.replace(/\s+/g," ").trim()).slice(0,120); })};
}
function aplicaRecuerdaLista(t, v, r){
  msg(t,"bo",v); var mo=t.msgs[t.msgs.length-1]; mo.de=yo; mo.canal="priv:"+yo; mo.nota_claude=1;
  if(r.duda){ msg(t,"bi",r.duda+" No puse nada; dímelo otra vez con la fecha."); var md=t.msgs[t.msgs.length-1]; md.canal="priv:"+yo; md.nota_claude=1; guarda(t); render(); return; }
  var hr=horaDicha(r.cuando)?horaValor(r.cuando):"", hora=hr?horaCercana(r.fecha,hr,r.cuando):"09:00";
  var texto=juntaY(r.cosas.map(function(x,i){ return i?x.charAt(0).toLowerCase()+x.slice(1):x; }));
  var av=avisoMismoDia(t, r.fecha);
  if(av){ if(!av.hora) av.hora=hora; if(_nv(av.texto).indexOf(_nv(texto))<0) av.texto=conMayuscula(String(av.texto||"")+" · "+texto).slice(0,240); }
  else av=nuevoAviso(t, {texto:texto, dicho:v, fecha:r.fecha, hora:hora});
  var sec=conMayuscula(fechaMovCorta(r.fecha)).slice(0,40);
  var nuevos=agregaPasos(t, "", r.cosas); nuevos.forEach(function(p){ p.sec=sec; });
  msg(t,"bi","Anotado. Te aviso "+(textoCuando(av)||fechaBonita(r.fecha))+": "+texto+"."+(nuevos.length?" Lo dejé en la lista ("+nuevos.length+" paso"+(nuevos.length===1?"":"s")+", "+sec+").":""));
  var mr=t.msgs[t.msgs.length-1]; mr.canal="priv:"+yo; mr.nota_claude=1;
  try{ if(hr) preguntaAmPm(t, [String(av.ts)], r.cuando); }catch(e){}
  guarda(t); try{ sincronizaAvisos(t); }catch(e){} render();
}
/* lo que regresa Claude: checklist {titulo, items:[{tx, estado}]} (crear o actualizar) */
function aplicaChecklistClaude(t, j){
  var c=j && j.checklist; if(!c || !Array.isArray(c.items) || !c.items.length) return "";
  var nuevo=!tieneChecklist(t), n=0;
  if(nuevo) t.checklist={titulo:String(c.titulo||"Lista").trim().slice(0,40)||"Lista", items:[]};
  c.items.slice(0,60).forEach(function(x){ var tx=String((x&&x.tx)||x||"").trim(); if(!tx) return; var est=+((x&&x.estado)||0); if(!(est>=0&&est<=2)) est=0;
    var ya=(t.checklist.items||[]).filter(function(it){ return _nv(it.tx)===_nv(tx); })[0];
    if(ya){ if(chkPon(ya, est, "Claude")) n++; } else { chkNuevo(t, tx, est, est?"Claude":""); n++; } });
  return nuevo?"lista “"+t.checklist.titulo+"” ("+t.checklist.items.length+")":(n?"lista ("+n+" cambios)":"");
}
function checklistTexto(t){ return tieneChecklist(t)?t.checklist.items.map(function(x){ return x.tx+" "+CHK_EST[x.estado||0]; }).join(" | "):"(no hay)"; }
/* ===== build 224 (maqueta "supervisor" aprobada por Salvador 12:03: "mucho más limpio y muy bien el diseño") =====
   VISTA SUPERVISOR de una tarea donde otro ejecuta (externo por WhatsApp, o alguien de Doit con metas):
   - encabezado "Lo hace X · supervisas tú"; secciones plegables Metas (abierta, 1 renglón por meta, ROJO solo si atrasada),
     Contexto y Datos (plegadas, 1 línea de resumen); sin Cumplida/Foto para el supervisor;
   - tarjeta "X terminó <meta> · evidencia" con Aprobar / Pedir corrección (y la siguiente meta);
   - abajo SOLO lo que le toca; si no hay nada: "Nada pendiente para ti" (sin botón gigante).
   El ejecutor de Doit ve Cumplida + Foto; si la tarea tiene supervisor, su "Cumplida" queda POR APROBAR (estado 1). ===== */
function ejecutorNombre(t){ if(t.revisa_ext) return String(t.revisa_ext); if(t.duenio && t.duenio!==yo && PERSONAS[t.duenio]) return PERSONAS[t.duenio].nombre; return ""; }
function vistaSup(t){
  if(!t || t.cierre || esDato(t)) return false;
  if(t.revisa_ext && (t.duenio===yo || !t.duenio)) return true;
  try{ return soySupervisor(t) && esMetas(t); }catch(e){ return false; }
}
function necesitaAprobacion(t){ return (t.revisores||[]).some(function(k){ return k && k!==yo; }) || (t.duenio===yo && !!t.supervisa && t.supervisa!==yo); }
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function subSupHTML(t){ return esc(propietario233(t)); }   /* build 233: era "Lo hace X · supervisas tú" */
/* build 233: primer nombre (o el alias corto de Doit) para que quepa en una linea */
function pila233(k){ if(k && PERSONAS[k]) return nombreCorto(PERSONAS[k].nombre).split(" ")[0]; return nombreCorto(String(k||"")).split(" ")[0]; }
function propietario233(t){
  if(!t) return "";
  var de="", sup="";
  if(t.revisa_ext){ de=t.revisa_ext; sup=(!t.duenio||t.duenio===yo)?yo:t.duenio; }
  else if(t.duenio && t.duenio!==yo){ de=t.duenio; sup=(t.revisores||[]).filter(function(k){ return k && k!==t.duenio; })[0] || (t.supervisa&&t.supervisa!==t.duenio?t.supervisa:""); }
  else return "";
  var n=pila233(de); if(!n) return "";
  return "De "+n+(sup?" · sup. "+(sup===yo?"tú":pila233(sup)):"");
}
function _supAb(t, k, def){ var o=window.__supAb=window.__supAb||{}, kk=t.id+"|"+k; return (kk in o)?!!o[kk]:def; }
function porAprobar(t){ return metasDe(t).filter(function(m){ return (+m.estado||0)===1; }); }
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function resumenDatos(t){
  var p=[];
  if(t.seg_a && t.seg_a.contacto) p.push(("Seguimiento "+(t.seg_a.cada||"")+(t.seg_a.hora?" "+t.seg_a.hora:"")).replace(/\s+/g," ").trim());
  else if(String(t.ritmo||"").trim()) p.push(String(t.ritmo).split(/[.(]/)[0].trim().slice(0,60));
  var cp=0; try{ cp=_compartirLista(t).length; }catch(e){}
  if(cp) p.push("se comparte con "+cp);
  return p.join(" · ")||"Sin datos extra";
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function vMetasSup(t){
  var L=metasDe(t), H=hoy(), pend=L.filter(function(m){ return !metaCumplida(m); }), hech=L.filter(metaCumplida);
  pend.sort(function(a,b){ return String(a.fecha||"9999").localeCompare(String(b.fecha||"9999")); });
  var rojo=pend.filter(function(m){ return (+m.estado||0)===0 && semaforoMeta(m,H).k==="rojo"; }).length, pa=pend.filter(function(m){ return (+m.estado||0)===1; }).length;
  var ab=_supAb(t,"metas",true);
  var r=rojo?'<span class="r red">'+rojo+' atrasada'+(rojo===1?'':'s')+' · '+pend.length+'</span>':'<span class="r">'+(pa?pa+' por aprobar · ':'')+pend.length+' en curso</span>';
  var h='<div class="ssec" data-ssec="metas"><button class="ssh" data-supab="metas">Metas'+r+'<span class="chev">'+(ab?'▴':'▾')+'</span></button>';
  if(ab){
    h+=pend.map(function(m){ var sf=semaforoMeta(m,H), e=+m.estado||0, atr=e===0 && sf.k==="rojo";
      var f=e===1?"por aprobar":(atr?"atrasada · "+(-dDif(H,m.fecha))+" día"+(dDif(H,m.fecha)===-1?"":"s"):(m.fecha?fechaMovCorta(m.fecha):"sin fecha"));
      return '<div class="smeta'+(atr?' atr':'')+(e===1?' pa':'')+'"><span class="t">'+esc(metaCorta(m))+'</span><span class="f">'+esc(f)+'</span></div>'; }).join("");
    if(!pend.length) h+='<div class="smeta"><span class="t vac">Sin metas en curso</span></div>';
    if(hech.length) h+='<div class="shist">Historial · '+hech.length+' cumplida'+(hech.length===1?'':'s')+'</div>';
  }
  return h+'</div>';
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function vSecSup(t, k, titulo, linea){
  var ab=_supAb(t,k,false);
  return '<div class="ssec" data-ssec="'+k+'"><button class="ssh" data-supab="'+k+'">'+esc(titulo)+'<span class="r"></span><span class="chev">'+(ab?'▴':'▾')+'</span></button>'+
    (ab?'<div class="sfull">'+linea.full+'</div>':'<div class="sone">'+esc(linea.una)+'</div>')+'</div>';
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function vSupSecciones(t){
  var ctx=contextoDe(t)||"";
  var full=[["Finiquito", t.indefinida===true?"Indefinida":(t.f_vigente?fechaConDia(t.f_vigente):"")], ["Lo hace", ejecutorNombre(t)],
    ["Seguimiento", t.seg_a&&t.seg_a.contacto?t.seg_a.contacto+(t.seg_a.cada?" · "+t.seg_a.cada:"")+(t.seg_a.hora?" · "+t.seg_a.hora:""):""], ["Ritmo", t.ritmo||""],
    ["Se comparte con", (function(){ try{ return _compartirLista(t).map(function(c){ return c.nombre; }).join(" · "); }catch(e){ return ""; } })()]]
    .filter(function(x){ return String(x[1]||"").trim(); }).map(function(x){ return '<div class="sdl"><b>'+esc(x[0])+'</b> '+esc(x[1])+'</div>'; }).join("");
  return '<div class="supsec">'+(esMetas(t)?vMetasSup(t):'')+
    vSecSup(t,"ctx","Contexto",{una:ctx?ctx.replace(/\s+/g," ").slice(0,90):"Sin contexto", full:'<p>'+esc(ctx||"Sin contexto")+'</p>'})+
    vSecSup(t,"datos","Datos",{una:resumenDatos(t), full:full||'<p>Sin datos</p>'})+'</div>';
}
/* tarjeta: el ejecutor entregó una meta (Claude ya revisó la evidencia) */
function vEntregas(t){
  var pa=porAprobar(t); if(!pa.length || !vistaSup(t)) return "";
  var sig=metasDe(t).filter(function(m){ return (+m.estado||0)===0; }).sort(function(a,b){ return String(a.fecha||"9999").localeCompare(String(b.fecha||"9999")); })[0];
  return pa.map(function(m){ var e=m.entrega||{}, fotos=(e.fotos||[]).concat(m.foto&&!(e.fotos||[]).length?[m.foto]:[]), quien=nombreCorto(e.por_nombre||ejecutorNombre(t)||"");
    return '<div class="entc" data-ent="'+esc(m.id)+'"><span class="ek">PARA TI · APROBAR</span><span class="eq">'+esc((quien?quien.split(" ")[0]+" terminó ":"Terminaron ")+metaCorta(m))+'</span>'+
      '<span class="es">'+esc(e.resumen?("Claude revisó la evidencia: "+(fotos.length?fotos.length+" foto"+(fotos.length===1?"":"s")+" · ":"")+e.resumen):(fotos.length?fotos.length+" foto"+(fotos.length===1?"":"s")+" de evidencia":"Sin fotos de evidencia"))+'</span>'+
      (fotos.length?'<div class="eth">'+fotos.slice(0,4).map(function(u){ return '<img src="'+esc(u)+'" alt="evidencia">'; }).join("")+'</div>':'')+
      '<div class="ebt"><button class="ebk pri" data-entok="'+esc(m.id)+'">Aprobar</button><button class="ebk" data-entcor="'+esc(m.id)+'">Pedir corrección</button></div>'+
      (sig?'<span class="enx">Sigue: '+esc(metaCorta(sig))+(sig.fecha?' · '+esc(fechaMovCorta(sig.fecha)):'')+'</span>':'')+'</div>'; }).join("");
}
function apruebaMeta(t, mid){
  var m=metasDe(t).filter(function(x){ return x.id===mid; })[0]; if(!m) return "";
  var e=m.entrega||{}; m.estado=2; m.cumplida=hoy(); m.cumplida_ts=Date.now(); m.aprobada_por=yo; m.fuente="aprobó "+((PERSONAS[yo]||{}).nombre||"");
  if(!m.foto && (e.fotos||[]).length) m.foto=e.fotos[0];
  var ej=ejecutorNombre(t);
  if(t.revisa_ext && ej) pideWhatsAppAuto(t, {usuario:yo, tarea_id:t.id, contacto:ej, texto:"IA: ¡Gracias, "+nombreCorto(ej).split(" ")[0]+"! "+((PERSONAS[yo]||{}).nombre||"Salvador")+" aprobó “"+metaCorta(m)+"”.", sin_espera:1});
  else if(t.duenio && t.duenio!==yo){ try{ disparaPushInstantaneo(t.duenio, tareaCorta(t), "Aprobada: “"+metaCorta(m)+"”", urlTarea(t.id), "asignado"); }catch(e2){} }
  var tx="Aprobada: “"+metaCorta(m)+"”. Queda en el historial."; msg(t,"bi",tx); guarda(t); return tx;
}
function pideCorreccion(t, mid){
  var m=metasDe(t).filter(function(x){ return x.id===mid; })[0]; if(!m) return "";
  m.estado=0; m.correccion_ts=Date.now(); m.correcciones=(m.correcciones||0)+1; guarda(t);
  var ej=ejecutorNombre(t);
  if(t.revisa_ext && ej){ window.__cnl=window.__cnl||{}; window.__cnl[t.id]="ext:"+ej; }
  else if(t.duenio && t.duenio!==yo){ window.__cnl=window.__cnl||{}; window.__cnl[t.id]="dm:"+t.duenio; }
  window.__prefill={tid:t.id, tx:"Para cerrar “"+metaCorta(m)+"” falta: "};
  return "Dicta qué falta en “"+metaCorta(m)+"”";
}
/* abajo, en la vista supervisor: SOLO lo que le toca */
function sugSup(t){
  var pa=porAprobar(t).length, dec=(t.decision_meta||[]).length+(t.decision_dato||[]).length+((t.quien_dudas||[]).length)+(t.msj_borrador?1:0);
  try{ (t.msgs||[]).forEach(function(x){ if(x && !x.oculto && x.duda_tarea && !x.duda_resuelta) dec++; }); }catch(e){}   /* build 225: "¿Es de esta o de otra?" */
  if(pa || dec) return '<div class="suptodo">'+(pa+dec)+' cosa'+((pa+dec)===1?'':'s')+' para ti arriba</div>';
  if(tipoRevisar(t)==="falta"){
    var f=[]; try{ f=soloMeFalta(t); }catch(e){}
    if(f.length) return '<div class="suptodo">Falta: '+esc(f.join(" · "))+'</div>';
    try{ if(completitud(t).completa) return '<button class="op k supaut" id="autrev">Autorizar</button>'; }catch(e){}
  }
  return '<div class="suptodo vac">Nada pendiente para ti</div>';
}
/* ===== build 223 (Salvador 11:23; caso Manuel 10:48 "no se alcanza a apreciar panal por todo el ramerío" ante "¿sí es panal?") =====
   Cuando el Claude de la app lee las respuestas del hilo: si la IA o Salvador le hicieron a alguien una pregunta CONCRETA
   (sí/no, dato, foto, costo, fecha) y la respuesta no la contesta claro (evasiva, cambia de tema, promete sin dato):
   1) nota "📝 Nota IA: respuesta no clara a «…» — falta: …" (privada); 2) repregunta por la cola, positiva pero firme, máx 1
   cada 4 h por el mismo dato; 3) si Salvador ya repreguntó (mensaje suyo después, audio incluido) solo se anota y se espera;
   4) tras 2 repreguntas sin dato claro, tarjeta de decisión para Salvador con todo el contexto.
   La Mac (v18m) hace lo mismo al instante; la app espera 10 min y no actúa si la Mac ya lo anotó (nunca doble repregunta). ===== */
var CLARIDAD_ESPERA_MS=10*60000, REPREG_CADA_MS=4*3600*1000;
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function _quienMsg(x){ return String((x&&(x.wa_c||x.wa_auto))||"").trim(); }
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function _esPreguntaA(x, c){
  if(!x) return false; var tx=String(x.tr||x.t||"").replace(/^→\s*[^:]{1,40}:\s*/,"");
  if(!/[?¿]/.test(tx)) return false;
  var mio=x.k==="bo" && (!x.de || x.de===yo), ia=x.k==="bi" && (x.wa===1 || /^IA:/i.test(tx) || /^→/.test(String(x.t||"")));
  if(!(mio||ia)) return false;
  var d=_quienMsg(x) || (String(x.canal||"").indexOf("ext:")===0?String(x.canal).slice(4):"");
  return !d || _nn(d).split(/\s+/)[0]===_nn(c).split(/\s+/)[0];
}
/* la ultima respuesta de alguien que sigue a una pregunta concreta suya, sin revisar, con 10 min de reposo */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function candidatoClaridad(t, ahora){
  var ms=t.msgs||[]; ahora=ahora||Date.now();
  for(var i=ms.length-1;i>=0 && i>=ms.length-25;i--){
    var x=ms[i]; if(!x || x.wa_in!==1) continue;
    if(x.claridad || ahora-(x.ts||0)<CLARIDAD_ESPERA_MS || ahora-(x.ts||0)>48*3600*1000) return null;
    var c=_quienMsg(x); if(!c) return null;
    for(var j=i-1;j>=0 && j>=i-15;j--){ var y=ms[j]; if(!y) continue;
      if(y.wa_in===1 && _nn(_quienMsg(y)).split(/\s+/)[0]===_nn(c).split(/\s+/)[0]) continue;   /* sus mensajes seguidos */
      if(y.nota_ia || y.priv || y.nota_claude || y.nota_mia || (y.k==="bi" && y.wa_in!==1 && !y.wa && !/^(IA:|→)/i.test(String(y.t||""))) || y.k==="bal") continue;   /* notas y avisos internos no cortan la plática */
      if(_esPreguntaA(y, c)) return {ix:i, qix:j, contacto:c, pregunta:String(y.tr||y.t||"").replace(/^→\s*[^:]{1,40}:\s*/,"").replace(/^IA:\s*/i,"").replace(/[“”]/g,"").slice(0,300), respuesta:String(x.tr||x.t||"").replace(/^[^:\n]{1,40}:\s*/,"").slice(0,500)};
      return null; }
    return null;
  }
  return null;
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function _raizDato(s){ return _nn(s).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(function(w){ return w.length>=5; }).map(function(w){ return w.slice(0,6); }); }
/* aplica el criterio con lo que dijo Claude: info {clara, pregunta, falta, texto} */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function aplicaNoClara(t, cand, info, ahora){
  return "";   /* build 267: APAGADO. Ya no escribe repreguntas ni registros (repreg, decision_dato, decision_salvador); la Mac lleva el seguimiento con plan[] (18z8/18z15) */
  ahora=ahora||Date.now(); var x=(t.msgs||[])[cand.ix]; if(!x) return "";
  if(!info || info.clara!==false){ x.claridad="ok"; return "clara"; }
  x.claridad="no";
  var preg=String(info.pregunta||cand.pregunta).replace(/\s+/g," ").trim().slice(0,200), falta=String(info.falta||"el dato concreto").replace(/\s+/g," ").trim().slice(0,160);
  var nota=function(tx){ msg(t,"bi","📝 Nota IA: "+tx); var m=t.msgs[t.msgs.length-1]; m.canal="priv:"+yo; m.nota_ia=1; m.priv=1; };
  /* la Mac ya lo anotó: no se duplica nada */
  if((t.msgs||[]).slice(cand.ix+1).some(function(m){ return m && /respuesta no clara a «/.test(String(m.t||"")); })){ x.claridad="mac"; return "mac"; }
  nota("respuesta no clara a «"+preg+"» — falta: "+falta);
  var salvYa=(t.msgs||[]).slice(cand.ix+1).some(function(m){ return m && m.k==="bo" && (!m.de || m.de===yo) && !m.nota_mia && !m.nota_claude && !m.completa_info; });
  if(salvYa){ nota("ya le repreguntaste a "+nombreCorto(cand.contacto)+"; no repregunto, espero su respuesta."); return "espera"; }
  t.repreg=t.repreg||[]; var rz=_raizDato(falta+" "+preg);
  var r=t.repreg.filter(function(q){ return q.contacto===cand.contacto && _raizDato(q.falta+" "+q.pregunta).some(function(w){ return rz.indexOf(w)>=0; }); })[0];
  if(!r){ r={contacto:cand.contacto, pregunta:preg, falta:falta, n:0, ts:0, resp:[]}; t.repreg.push(r); }
  r.resp=(r.resp||[]).concat([cand.respuesta]).slice(-4);
  if(r.yo_hablo || r.cerrado) return "pausa";   /* "Hablo yo con él" / "Ya no hace falta" */
  if(r.n>=2){
    if(r.escalado) return "ya escalado";
    r.escalado=ahora;
    var d={id:"dd"+ahora.toString(36), contacto:cand.contacto, pregunta:preg, falta:falta, resp:r.resp.slice(), n:r.n, ts:ahora};
    t.decision_dato=(t.decision_dato||[]).concat([d]);
    if(!t.pendiente_info || t.pendiente_dato){ t.pendiente_tipo="decision_salvador"; t.pendiente_dato=d.id; t.pendiente_info=nombreCorto(cand.contacto)+" no da el dato: "+falta; }
    try{ if(yo!=="salvador" && PERSONAS.salvador) disparaPushInstantaneo("salvador", tareaCorta(t), "Decide: "+nombreCorto(cand.contacto)+" no da «"+falta+"»", urlTarea(t.id), "espera"); }catch(e){}
    return "escalado";
  }
  if(r.ts && ahora-r.ts<REPREG_CADA_MS) return "esperando";
  var tx=String(info.texto||"").replace(/\s+/g," ").trim() || ("IA: Gracias, "+nombreCorto(cand.contacto).split(" ")[0]+". Para poder decidir necesito el dato concreto: "+(/[?¿]/.test(preg)?preg:"¿"+preg+"?"));
  if(!/^IA:/i.test(tx)) tx="IA: "+tx;
  msg(t,"bi","→ "+nombreCorto(cand.contacto)+": “"+tx.replace(/^IA:\s*/,"")+"” · en cola"); var mw=t.msgs[t.msgs.length-1]; mw.wa=1; mw.wa_c=cand.contacto;
  pideWhatsApp({usuario:yo, tarea_id:t.id, contacto:cand.contacto, texto:tx, sin_espera:1})
    .then(function(j){ var pid=(j&&(j.id||j.pedido_id))||null; if(pid){ mw.wa_pid=pid; guarda(t); } }).catch(function(){});
  r.n++; r.ts=ahora; return "repregunto";
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function promptClaridad(cand){
  return "Eres Claude dentro de la app Doit. Se le hizo a "+cand.contacto+" esta pregunta: «"+cand.pregunta+"». Contestó: «"+cand.respuesta+"».\n"+
    "¿La respuesta contesta la pregunta de forma CLARA y concreta (sí/no, el dato, la foto, el costo o la fecha que se pidió)? Es NO clara si es evasiva "+
    "(\"no se alcanza a apreciar\", \"creo que\", \"ahorita lo checo\"), cambia de tema o promete sin dar el dato. Si la pregunta no era concreta, cuenta como clara.\n"+
    "Contesta SOLO JSON: {\"clara\":true|false,\"pregunta\":\"la pregunta concreta, corta\",\"falta\":\"el dato concreto que falta, corto\",\"texto\":\"IA: Gracias, <nombre>. Para poder decidir necesito el dato concreto: <una sola pregunta concreta>\"}";
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function revisaClaridadTodas(ahora){
  return;   /* build 267: apagado, ver aplicaNoClara */
  ahora=ahora||Date.now(); if(window.__clarPend) return; var n=0;
  tareas.forEach(function(t){
    if(n>=2 || t.cierre || estadoReal(t)==="cerrada") return;
    var cand=candidatoClaridad(t, ahora); if(!cand) return; n++;
    window.__clarPend=(window.__clarPend||0)+1;
    try{ preguntaAClaude([{role:"user",content:promptClaridad(cand)}],"rapido",function(txt,err){
      window.__clarPend=Math.max(0,(window.__clarPend||1)-1);
      if(err) return; var j=null; try{ var mm=String(txt||"").match(/\{[\s\S]*\}/); j=mm?JSON.parse(mm[0]):null; }catch(e){}
      if(!j) return; var x=(t.msgs||[])[cand.ix]; if(!x || x.claridad) return;
      aplicaNoClara(t, cand, j, Date.now()); guarda(t); if(vista==="hilo" && abierta===t.id) render(); }); }catch(e){ window.__clarPend=0; }
  });
}
/* ===== build 266: TODA pregunta de Claude a Salvador va en el bloque de preguntas (texto + micrófono/cuadro), nunca en fichas de botones fijos =====
   Registros que antes eran ficha: decision_dato (DECIDE · SIN DATO CLARO / repregunta), decision_meta (DECIDE · META ATRASADA),
   pendiente_tipo "decision_salvador" (Esperando tu decisión) y "Te espera". Las opciones pasan a ser texto de la pregunta.
   Si la pelota no es de Salvador (pelota263 sin contar estos registros) no se muestra ninguna: arriba solo va "Qué toca". */
function pelotaMia(t){
  window.__sinReg266=1; var o=null; try{ o=pelota263(t); }catch(e){ o=null; } finally{ window.__sinReg266=0; }
  return !o || o.de==="yo";
}
function _contacto(m, c){ if(!m || !c) return false; var a=_nn(String(m.wa_c||m.chat||(PERSONAS[m.de]&&PERSONAS[m.de].nombre)||m.de||"")).split(/\s+/)[0], b=_nn(String(c)).split(/\s+/)[0]; return !!a && a===b; }
/* el contacto ya contestó algo útil DESPUÉS de la pregunta: la ficha no sale (la Mac la va a cerrar) */
function contestoUtil(t, d){
  var ts=+d.ts||0; if(!ts) return false;
  return (t.msgs||[]).some(function(m){ return m && !m.oculto && m.wa_in && (+m.ts||0)>ts && _contacto(m, d.contacto) && m.claridad==="ok"; });
}
function ultimoOtroTs(t){ var ms=t.msgs||[]; for(var i=ms.length-1;i>=0;i--){ var x=ms[i]; if(x && x.k!=="bi" && (x.wa_in || (x.de && x.de!==yo))) return +x.ts||1; } return 0; }
function registroPreg(t){
  var R=[]; if(!t || t.cierre || t.fusionada_en || window.__sinReg266) return R;
  var dds=t.decision_dato||[], dms=t.decision_meta||[], hay=dds.length||dms.length||esDecisionSal(t)||(meDetiene(t) && !t.pendiente_info);
  if(!hay || !pelotaMia(t)) return R;
  dds.forEach(function(d){ if(contestoUtil(t,d)) return; var n=nombreCorto(d.contacto);
    R.push({k:"dd", id:d.id, q:n+" no da el dato «"+d.falta+"». ¿Hablas tú con él, le vuelvo a preguntar o ya no hace falta?", ops:[], reg:1}); });
  dms.forEach(function(d){ var ej=d.ejecutor?nombreCorto(d.ejecutor):"el responsable";
    R.push({k:"dm", id:d.id, q:"La meta «"+(d.corta||d.meta)+"» lleva "+d.atraso+" día"+(d.atraso===1?"":"s")+" de atraso con "+ej+". ¿Le pongo nueva fecha"+(d.nueva?" ("+fechaMeta(d.nueva)+")":"")+", hablas tú con él"+(d.costo?" o autorizas "+d.costo:"")+"?", ops:[], reg:1}); });
  if(esDecisionSal(t) && !(t.pendiente_dato && dds.some(function(d){ return d.id===t.pendiente_dato; })) && !(t.pendiente_meta && dms.some(function(d){ return d.id===t.pendiente_meta; })) && !(t.pendiente_dato && !dds.some(function(d){ return d.id===t.pendiente_dato; }) && false)){
    var pi=String(t.pendiente_info||"").trim(); R.push({k:"dsal", q:/[?¿]/.test(pi)?pi:pi+". ¿Qué decides?", ops:[], reg:1}); }
  else if(meDetiene(t) && !t.pendiente_info && !esDecisionSal(t)){ var uo=ultimoOtroTs(t); if(uo && t.espera266!==uo){ var q0=ultimoDeOtro(t)||quienEspera(t)||"";
    R.push({k:"espera", q:quienTeEspera(t)+" te espera"+(q0?": «"+(q0.length>160?q0.slice(0,159)+"…":q0)+"»":"")+". ¿Qué le contesto?", ops:[], uo:uo, reg:1}); } }
  return R;
}
/* la respuesta dictada o escrita cierra el registro de origen (la acción fina la aplica el cerebro con la pregunta como contexto) */
function resuelveReg(t, p, tx){
  var n=_n179(tx);
  if(p.k==="dd"){ var d=(t.decision_dato||[]).filter(function(x){ return x.id===p.id; })[0]; if(!d) return;
    var acc=/\b(yo (le )?hablo|hablo yo|le hablo yo|yo hablo|hablo con el)\b/.test(n)?"hablo":(/\b(repregunt\w*|otra vez|vuelve a preguntar|vuelvele a preguntar|pregunt\w* otra vez)\b/.test(n)?"otra":(/\b(ya no hace falta|no hace falta|ya no|dejalo|olvidalo)\b/.test(n)?"ya":""));
    if(acc){ decideDato(t, p.id, acc); return; }
    t.decision_dato=t.decision_dato.filter(function(x){ return x.id!==p.id; }); if(t.pendiente_dato===p.id){ t.pendiente_info=""; t.pendiente_tipo=""; delete t.pendiente_dato; }
    var r=(t.repreg||[]).filter(function(q){ return q.contacto===d.contacto && _n179(q.falta)===_n179(d.falta); })[0]; if(r) r.yo_hablo=true;
    msg(t,"bi","Decidiste sobre «"+d.falta+"»: "+tx); guarda(t); return; }
  if(p.k==="dm"){ var dm=(t.decision_meta||[]).filter(function(x){ return x.id===p.id; })[0]; if(!dm) return;
    var ac2=/\bautoriz\w*\b/.test(n)?"autorizo":(/\b(yo (le )?hablo|hablo yo|le hablo yo)\b/.test(n)?"hablo":(/\b(nueva fecha|fecha|d[ei]ja|pasal\w*|muevel\w*)\b/.test(n)?"fecha":""));
    if(ac2){ decideMeta(t, p.id, ac2, fechaEnTexto(tx)||""); return; }
    t.decision_meta=t.decision_meta.filter(function(x){ return x.id!==p.id; }); if(t.pendiente_meta===p.id){ t.pendiente_info=""; t.pendiente_tipo=""; delete t.pendiente_meta; }
    msg(t,"bi","Decidiste sobre la meta «"+(dm.corta||dm.meta)+"»: "+tx); guarda(t); return; }
  if(p.k==="dsal"){ msg(t,"bi","Ya decidiste: "+t.pendiente_info); t.pendiente_tipo=""; t.pendiente_info=""; t.decision_ts=Date.now(); guarda(t); return; }
  if(p.k==="espera"){ t.espera266=p.uo||ultimoOtroTs(t); guarda(t); return; }
}
/* build 268: duerme264 / resolución también barren */
function decideDato(t, did, accion){
  var d=(t.decision_dato||[]).filter(function(x){ return x.id===did; })[0]; if(!d) return "";
  t.decision_dato=t.decision_dato.filter(function(x){ return x.id!==did; });
  if(t.pendiente_dato===did){ t.pendiente_info=""; t.pendiente_tipo=""; delete t.pendiente_dato; }
  var r=(t.repreg||[]).filter(function(q){ return q.contacto===d.contacto && _n179(q.falta)===_n179(d.falta); })[0], tx="";
  if(accion==="hablo"){ if(r) r.yo_hablo=true; tx="Tú hablas con "+nombreCorto(d.contacto)+"; ya no le repregunto."; }
  else if(accion==="otra"){ if(r){ r.n=1; r.escalado=null; r.ts=0; } tx="Le repregunto una vez más a "+nombreCorto(d.contacto)+" en cuanto conteste."; }
  else { if(r) r.cerrado=true; tx="Listo: ya no hace falta «"+d.falta+"»."; }
  msg(t,"bi",tx); guarda(t); return tx;
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function vDecisionDato(t){
  return (t.decision_dato||[]).map(function(d){
    return '<div class="revc c-decmeta" data-dd="'+esc(d.id)+'"><span class="rct">DECIDE · SIN DATO CLARO</span>'+
      '<span class="rcq">'+esc(nombreCorto(d.contacto))+' no contesta: «'+esc(d.pregunta)+'»</span>'+
      '<span class="rcp">Falta: '+esc(d.falta)+' · '+d.n+' repreguntas</span>'+
      '<div class="dmr"><b>Contestó:</b> '+d.resp.map(function(x){ return '“'+esc(x)+'”'; }).join(" · ")+'</div>'+
      '<div class="dmb"><button class="dmk si" data-ddact="hablo" data-ddid="'+esc(d.id)+'">Hablo yo con él</button>'+
      '<button class="dmk" data-ddact="otra" data-ddid="'+esc(d.id)+'">Repregúntale otra vez</button>'+
      '<button class="dmk" data-ddact="ya" data-ddid="'+esc(d.id)+'">Ya no hace falta</button></div></div>';
  }).join("");
}
/* ===== build 222 (Salvador, tareas continuas con METAS; caso "Mantenimiento Casa Lerdo/Eloísa") =====
   Una tarea indefinida no tiene finiquito: lo que tiene fecha son sus METAS. Viven en el checklist con titulo "Metas":
   items {id, tx, fecha, estado 0 pendiente | 1 en curso | 2 cumplida, quien, foto, cumplida, fuente, seguimiento|seg}.
   - En la tarea: bloque "Metas" (texto, fecha meta, quién, semáforo: SOLO rojo si está atrasada; foto y palomear).
   - Las cumplidas NO se borran: "Historial de metas" plegado, con fecha de cumplido y foto.
   - Claude: en una tarea indefinida toda fecha dictada ("que quede el 9", "en 3 meses") entra como META, nunca como
     finiquito; si se parece a una del historial lo dice ("Se cumplió “Azotea” el 9-oct; ¿duró poco?").
   - Seguimiento por meta (contacto, días, hora) programado por la cola con [A LAS …].
   - Meta vencida sin palomear (ajuste 11:17): primero se le escribe al ejecutor; a Salvador solo una decisión armada (abajo). ===== */
var AVISO_INM_RE=/\b(av[ií]s(a|ame|enme)|dime|notif[ií]ca(me)?)\b[^.]{0,40}\b(de inmediato|inmediatamente|de volada|luego luego|en cuanto|al momento|enseguida)\b|\b(de inmediato|en cuanto|luego luego)\b[^.]{0,30}\bse venc/;
/* "avísame de inmediato si se vence": la tarea escala a Salvador desde el primer día de atraso */
function aplicaAvisoInmediato(t, v, j){ if(!j || j.aviso_inmediato!==true || !AVISO_INM_RE.test(_fsa(v)) || t.aviso_inmediato===true) return ""; t.aviso_inmediato=true; return "aviso inmediato si se vence"; }
function esMetas(t){ return !!(t && t.checklist && /^metas?$/i.test(String(t.checklist.titulo||"").trim())); }
function metasDe(t){ return esMetas(t) ? (t.checklist.items||[]) : []; }
function metaCumplida(m){ return !!m && (+m.estado||0)>=2; }
function metaCorta(m){ var s=String((m&&m.tx)||"").trim(), i=s.indexOf(":"); if(i>1 && i<=30) return s.slice(0,i).trim();
  return s.split(/\s+/).slice(0,4).join(" ").replace(/[.,;:]+$/,""); }
function tareaCorta(t){ var s=String((t&&t.nombre)||"").replace(/^(mantenimiento|seguimiento|revisi[oó]n|tarea)\s+(de\s+)?/i,"").split("/")[0].trim(); return s||String((t&&t.nombre)||""); }
function fechaMeta(f){ if(!/^\d{4}-\d{2}-\d{2}$/.test(f||"")) return ""; var d=new Date(f+"T00:00:00"); return d.getDate()+"-"+["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][d.getMonth()]; }
/* semáforo: a tiempo (verde) / vence hoy (ámbar) / atrasada (rojo) / sin fecha */
function semaforoMeta(m, H){
  H=H||hoy(); if(metaCumplida(m)) return {k:"ok", tx:"Cumplida"};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(m.fecha||"")) return {k:"sin", tx:"Sin fecha"};
  var d=dDif(H, m.fecha);
  if(d>0) return {k:"verde", tx:"A tiempo · faltan "+d+" día"+(d===1?"":"s")};
  if(d===0) return {k:"ambar", tx:"Vence hoy"};
  return {k:"rojo", tx:"Atrasada · "+(-d)+" día"+(d===-1?"":"s")};
}
function quienMeta(t, m){ return String((m&&m.quien)||t.revisa_ext||((PERSONAS[t.duenio]||{}).nombre)||"").trim(); }
function segMetaTx(m){ var g=m&&m.seg; if(g && g.contacto) return nombreCorto(g.contacto)+(g.cada?" · "+g.cada:"")+(g.hora?" · "+g.hora:""); return typeof (m&&m.seguimiento)==="string"?m.seguimiento:""; }
function metaNueva(t, o){
  if(!esMetas(t)){ if(tieneChecklist(t)) return null; t.checklist={titulo:"Metas", items:[]}; }   /* otra lista con renglones: no se pisa */
  var m={id:"m"+Date.now().toString(36)+Math.random().toString(36).slice(2,5), tx:conMayuscula(String(o.tx||"").replace(/\s+/g," ").trim()).slice(0,160),
    fecha:/^\d{4}-\d{2}-\d{2}$/.test(o.fecha||"")?o.fecha:"", estado:0, ts:Date.now(), fuente:o.fuente||""};
  if(o.quien) m.quien=String(o.quien).trim();
  t.checklist.items.push(m); return m;
}
/* palabras de peso para comparar metas ("impermeabilizar" ~ "impermeabilizado") */
function _raizMeta(tx){ return _nn(tx).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(function(w){ return w.length>=5 && ["techo","quede","quedar","limpio","limpia","listo","lista","hacer","antes","despues","todos","todas"].indexOf(w)<0; }).map(function(w){ return w.slice(0,7); }); }
function metaParecidaCumplida(t, tx){
  var r=_raizMeta(tx); if(!r.length) return null;
  var c=metasDe(t).filter(metaCumplida).filter(function(m){ var q=_raizMeta(m.tx); return r.some(function(w){ return q.indexOf(w)>=0; }); });
  return c.length ? c.sort(function(a,b){ return String(b.cumplida||"").localeCompare(String(a.cumplida||"")); })[0] : null;
}
/* palomear (cumplida) y foto de comprobante */
function cumpleMeta(t, mid, foto){
  var m=metasDe(t).filter(function(x){ return x.id===mid; })[0]; if(!m) return null;
  if(foto){ m.foto=foto; m.foto_ts=Date.now(); }
  if(necesitaAprobacion(t)){   /* build 224: hay supervisor -> queda POR APROBAR con su evidencia */
    m.estado=1; m.entrega={ts:Date.now(), por:yo, por_nombre:(PERSONAS[yo]||{}).nombre||"", fotos:m.foto?[m.foto]:[]};
    msg(t,"bi","Entregaste “"+metaCorta(m)+"”"+(m.foto?" con foto":" sin foto")+". Falta que la apruebe tu supervisor.");
    (t.revisores||[]).forEach(function(k){ if(k!==yo){ try{ disparaPushInstantaneo(k, tareaCorta(t), "Por aprobar: “"+metaCorta(m)+"”", urlTarea(t.id), "asignado"); }catch(e){} } });
    guarda(t); return m; }
  m.estado=2; m.cumplida=hoy(); m.cumplida_ts=Date.now(); m.fuente="palomeó "+((PERSONAS[yo]||{}).nombre||"");
  msg(t,"bi","Meta cumplida: “"+metaCorta(m)+"” ("+fechaMeta(m.cumplida)+(m.foto?", con foto":", sin foto")+"). Queda en el historial.");
  guarda(t); return m;
}
function fotoMeta(t, mid, data){ var m=metasDe(t).filter(function(x){ return x.id===mid; })[0]; if(!m || !data) return null; m.foto=data; m.foto_ts=Date.now(); guarda(t); return m; }
/* seguimiento de UNA meta por la cola: días dichos hasta la fecha de la meta, hora dicha o 10:00 */
function programaSegMeta(t, m, persona, pl){
  var k=persona.id.indexOf("ext:")===0?null:persona.id, canon=String(persona.nombre).trim();
  if(k && PERSONAS[k]){ var G=null; try{ G=contactosWA(t).filter(function(g){ return g.eq===k; })[0]; }catch(e){} canon=G?G.nombre:PERSONAS[k].nombre; }
  var hora=pl.hora||SEG_HORA_DEFECTO, corto=nombreCorto(canon);
  m.seg={contacto:canon, cada:String(pl.cada||"").trim().slice(0,80), hora:hora, hora_defecto:!pl.hora, programados:[]};
  t.wa_contactos=t.wa_contactos||[];
  if(!t.wa_contactos.some(function(c){ return _nn(String((c&&c.nombre)||c))===_nn(canon); })) t.wa_contactos.push({nombre:canon, desde:Date.now()});
  var ahora=Date.now(), fs=(pl.local||[]).filter(function(f){ return _tsDe(f,hora)>ahora && (!m.fecha || f<=m.fecha); }).slice(0,10);
  var ya=(t.msgs||[]).filter(function(x){ return x && x.prog && !x.prog.cancelado && _nn(x.prog.contacto||"")===_nn(canon); }).map(function(x){ return x.prog.a_las?x.prog.a_las.fecha+" "+x.prog.a_las.hora:""; });
  var texto="IA: Hola "+corto.split(" ")[0]+", ¿cómo vas con "+metaCorta(m).toLowerCase()+"?"+(m.fecha?" Quedamos para el "+fechaMeta(m.fecha)+".":"");
  fs.forEach(function(f){ if(ya.indexOf(f+" "+hora)<0) mandaProgramado(t, {contacto:canon, a_las:{fecha:f, hora:hora}, sino_desde:null, texto:texto}, null); m.seg.programados.push(f+" "+hora); });
  return "seguimiento de “"+metaCorta(m)+"” a "+corto+": "+fs.length+" WhatsApp ("+(fs.map(fechaMovCorta).join(", ")||"sin días antes de la meta")+" "+hora+")"+(pl.hora?"":" · a las "+hora+" porque no dijiste hora");
}
/* lo que regresa Claude: metas:[{tx, fecha, quien, seguimiento:{quien, cada, hora}}]. Solo en tareas indefinidas. */
function aplicaMetasClaude(t, v, j){
  var out={hecho:[], dudas:[]}; if(!j || !Array.isArray(j.metas) || !j.metas.length || t.indefinida!==true) return out;
  var s=_fsa(v), fd=fechaDictada(v), todas=fd.todas||[];
  j.metas.slice(0,8).forEach(function(x){
    var tx=String((x&&x.tx)||"").replace(/\s+/g," ").trim(); if(tx.length<3) return;
    var f=String((x&&x.fecha)||""), fecha="";
    if(_fReal(f) && todas.indexOf(f)>=0) fecha=f; else if(todas.length===1 && !fd.duda) fecha=todas[0];
    var ya=metasDe(t).filter(function(m){ return !metaCumplida(m) && _nn(m.tx)===_nn(tx); })[0];
    if(ya){ if(fecha && ya.fecha!==fecha){ ya.fecha=fecha; out.hecho.push("meta “"+metaCorta(ya)+"” para el "+fechaMeta(fecha)); } return; }
    var par=metaParecidaCumplida(t, tx);
    var m=metaNueva(t, {tx:tx, fecha:fecha, fuente:"dictado "+hhmmAhora()});
    if(!m){ out.dudas.push("Esta tarea ya tiene la lista “"+t.checklist.titulo+"”; no puse la meta “"+tx+"”."); return; }
    if(x.quien && _dichoNombre(v, x.quien)){ var rq=resuelvePersona(t, x.quien); if(rq.estado==="uno") m.quien=rq.persona.nombre; else out.dudas.push(nuevaDudaPersona(t, x.quien, "quien_meta", rq.cands, {metaId:m.id})); }
    if(x.aviso_inmediato===true && AVISO_INM_RE.test(s)) m.aviso_inmediato=true;
    out.hecho.push("meta “"+metaCorta(m)+"”"+(fecha?" para el "+fechaMeta(fecha):"")+(m.aviso_inmediato?" · aviso inmediato si se vence":""));
    if(!fecha) out.dudas.push("¿Para cuándo queda “"+metaCorta(m)+"”?");
    if(par) out.dudas.push("Se cumplió “"+metaCorta(par)+"” el "+fechaMeta(par.cumplida)+"; ¿duró poco?");
    var sg=x.seguimiento;
    if(sg && typeof sg==="object" && sg.quien && _dichoNombre(v, sg.quien) && /\b(seguimiento|segu[ií]r(le|lo|la)|preg[uú]nt(ale|arle)|recu[eé]rd(ale|arle)|checa con)\b/.test(s)){
      var cadaOk=RITMO_RE.test(s) || new RegExp("\\b("+_DIARE+")s?\\b").test(s) || /\b(diario|diariamente|todos los dias)\b/.test(s);
      var hh=String(sg.hora||""), mh=hh.match(/^(\d{1,2}):(\d{2})$/), pl={cada:String(sg.cada||""), hora:(mh && horaDicha(v))?String(+mh[1]).padStart(2,"0")+":"+mh[2]:"", local:cadaOk?fechasDeCada(s):[]};
      if(!cadaOk){ out.dudas.push("¿Cada cuándo le doy seguimiento a "+nombreCorto(sg.quien)+" para “"+metaCorta(m)+"”?"); return; }
      var rp=resuelvePersona(t, sg.quien);
      if(rp.estado==="uno") out.hecho.push(programaSegMeta(t, m, rp.persona, pl));
      else out.dudas.push(nuevaDudaPersona(t, sg.quien, "seguimiento_meta", rp.cands, Object.assign({metaId:m.id}, pl)));
    }
  });
  return out;
}
/* ===== build 222 (Salvador 11:17): CLAUDE ES EL SUPERVISOR OPERATIVO DE CADA RESPONSABLE; los de arriba solo ven problemas
   o decisiones ya armadas. Meta vencida sin palomear:
   1) primero se le escribe AL EJECUTOR por la cola de WhatsApp, positivo y motivador (reconoce, propone el siguiente paso,
      pide fecha corta; nunca regaño ni conteo de veces), máximo 1 al día, de 8 a 20 h;
   2) a Salvador SOLO si: la tarea o la meta tiene aviso_inmediato (él lo dictó), o el desfase es grande según la importancia:
      criticidad alta (diario/alta) 1 día; normal 3 días o 2 seguimientos sin respuesta; baja (lento/baja) 7 días;
   3) le llega UNA tarjeta para decidir en un toque: meta, fecha, atraso, qué contestó el ejecutor, evidencia (fotos),
      costo si lo hay, y botones con la decisión ("Nueva fecha 12-oct" / "Hablo yo con él" / "Autorizo"). ===== */
var ESCALA_DIAS={alta:1, normal:3, baja:7};
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function importanciaDe(t){ var c=String((t&&t.criticidad)||"normal").toLowerCase(); return (c==="diario"||c==="alta"||c==="critica")?"alta":((c==="lento"||c==="baja")?"baja":"normal"); }
function ejecutorMeta(t, m){
  var c=String((m.seg&&m.seg.contacto)||m.quien||t.revisa_ext||"").trim();
  if(c) return {nombre:c};                                                      /* por WhatsApp (la cola) */
  if(t.duenio && t.duenio!==yo && PERSONAS[t.duenio]) return {k:t.duenio, nombre:PERSONAS[t.duenio].nombre};   /* de Doit: en la app */
  return null;
}
/* lo que contestó el ejecutor desde que venció la meta (sus mensajes entrantes) */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function respuestasEjecutor(t, ej, desdeTs){
  var nn=_nn(ej.nombre).split(/\s+/)[0];
  return (t.msgs||[]).filter(function(x){ return x && x.wa_in===1 && (x.ts||0)>=desdeTs && _nn(String(x.wa_c||"")).split(/\s+/)[0]===nn; });
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function textoEmpuje(t, m, ej){
  var n=nombreCorto(ej.nombre).split(" ")[0];
  return "IA: Hola "+n+", gracias por lo que van avanzando en "+tareaCorta(t)+". La meta “"+metaCorta(m)+"” estaba para el "+fechaMeta(m.fecha)+
    ". ¿Qué te falta para dejarla lista y para qué día la podemos cerrar? Si me mandas una foto de cómo va, mejor.";
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function empujaEjecutor(t, m, ej){
  var tx=textoEmpuje(t, m, ej);
  if(ej.k){ msg(t,"bal",tx.replace(/^IA:\s*/,"")); var mm=t.msgs[t.msgs.length-1]; mm.canal="dm:"+ej.k; mm.aviso=1; mm.meta_id=m.id; mm.pide_a=ej.k;
    try{ disparaPushInstantaneo(ej.k, tareaCorta(t), "Meta “"+metaCorta(m)+"”: ¿para cuándo queda?", urlTarea(t.id), "seguimiento"); }catch(e){}
    return; }
  msg(t,"bi","→ "+nombreCorto(ej.nombre)+": “"+tx.replace(/^IA:\s*/,"")+"” · en cola"); var mw=t.msgs[t.msgs.length-1]; mw.wa=1; mw.wa_c=ej.nombre; mw.meta_id=m.id;
  pideWhatsApp({usuario:yo, tarea_id:t.id, contacto:ej.nombre, texto:tx, sin_espera:1})
    .then(function(j){ var pid=(j&&(j.id||j.pedido_id))||null; if(pid){ mw.wa_pid=pid; guarda(t); } })
    .catch(function(e){ mw.wa_err=String((e&&e.message)||e).slice(0,60); guarda(t); });
}
/* fotos que mandó el ejecutor desde que venció + la foto de la meta; costo en lo que dijo o en el gasto de la tarea */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function evidenciaMeta(t, m, ej, desdeTs){
  var rs=ej?respuestasEjecutor(t, ej, desdeTs):[], fotos=[];
  rs.forEach(function(x){ if(x.url && /foto|imagen|image|jpe?g|png/i.test(String(x.tipo||"")+" "+x.url)) fotos.push(x.url); });
  if(m.foto) fotos.unshift(m.foto);
  var costo=""; rs.concat([{t:t.gasto||""}]).some(function(x){ var mm=String(x.t||"").match(/\$\s?[\d.,]+(\s*(mil|\+\s*iva|m\.?n\.?))?|\b\d[\d.,]*\s*(mil\s*)?pesos\b/i); if(mm){ costo=mm[0].trim(); return true; } return false; });
  return {resp:rs.map(function(x){ return String(x.t||"").replace(/^[^:]{1,40}:\s*/,"").slice(0,240); }).filter(Boolean).slice(-3), fotos:fotos.slice(0,4), costo:costo};
}
/* propuesta de nueva fecha: la que dijo el ejecutor, si dijo una; si no, en 3 días */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function fechaPropuesta(ev, H){
  for(var i=ev.resp.length-1;i>=0;i--){ try{ var fd=fechaDictada(ev.resp[i]); if(fd && fd.todas && fd.todas.length && fd.todas[0]>H) return fd.todas[0]; }catch(e){} }
  var d=new Date(H+"T00:00:00"); d.setDate(d.getDate()+3); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function escalaMeta(t, m, ej, atraso, motivo, desdeTs, H){
  var ev=evidenciaMeta(t, m, ej, desdeTs), nf=fechaPropuesta(ev, H);
  t.decision_meta=(t.decision_meta||[]).filter(function(d){ return d.metaId!==m.id; });
  var d={id:"dm"+Date.now().toString(36), metaId:m.id, meta:m.tx, corta:metaCorta(m), fecha:m.fecha, atraso:atraso, motivo:motivo,
    ejecutor:ej?ej.nombre:"", resp:ev.resp, fotos:ev.fotos, costo:ev.costo, nueva:nf, ts:Date.now()};
  t.decision_meta.push(d); m.escalada=m.fecha;
  if(!t.pendiente_info || t.pendiente_meta){ t.pendiente_tipo="decision_salvador"; t.pendiente_meta=d.id;
    t.pendiente_info="Meta “"+d.corta+"” atrasada "+atraso+" día"+(atraso===1?"":"s")+(ej?" · "+nombreCorto(ej.nombre):"")+": decide"; }
  try{ if(yo!=="salvador" && PERSONAS.salvador) disparaPushInstantaneo("salvador", tareaCorta(t), "Decide: meta “"+d.corta+"” atrasada "+atraso+" día"+(atraso===1?"":"s"), urlTarea(t.id), "espera"); }catch(e){}
  return d;
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function chequeoMetas(ahoraMs){
  var ahora=ahoraMs||Date.now(), H=hoy(), hr=new Date(ahora).getHours();
  tareas.forEach(function(t){
    if(t.cierre || estadoReal(t)==="cerrada" || !esMetas(t)) return;
    var imp=importanciaDe(t), cambio=false;
    metasDe(t).forEach(function(m){
      if(metaCumplida(m) || (+m.estado||0)===1 || !/^\d{4}-\d{2}-\d{2}$/.test(m.fecha||"") || m.fecha>=H || m.escalada===m.fecha) return;   /* 224: entregada = no atrasada */
      var atraso=dDif(m.fecha, H), ej=ejecutorMeta(t, m), desde=new Date(m.fecha+"T23:59:59").getTime();
      m.empuje=(m.empuje && m.empuje.fecha===m.fecha)?m.empuje:{fecha:m.fecha, n:0, ult:"", ts:[]};
      var resp=ej?respuestasEjecutor(t, ej, desde):[], ultResp=resp.length?Math.max.apply(null, resp.map(function(x){ return x.ts||0; })):0;
      var sinResp=m.empuje.ts.filter(function(x){ return x>ultResp; }).length;
      var inmediato=t.aviso_inmediato===true || m.aviso_inmediato===true;
      var motivo=inmediato?"pediste aviso inmediato":(atraso>=ESCALA_DIAS[imp]?"lleva "+atraso+" día"+(atraso===1?"":"s")+" de atraso (importancia "+imp+")":
        ((imp==="normal" && sinResp>=2)?"no contestó 2 seguimientos":""));
      if(motivo || !ej){ escalaMeta(t, m, ej, atraso, motivo||"no hay a quién darle seguimiento", desde, H); cambio=true; return; }
      if(m.yo_hablo || m.empuje.ult===H || hr<8 || hr>=20) return;
      empujaEjecutor(t, m, ej); m.empuje.n++; m.empuje.ult=H; m.empuje.ts.push(ahora); cambio=true;
    });
    if(cambio) guarda(t);
  });
}
/* Salvador decide en un toque desde la tarjeta */
function decideMeta(t, did, accion, fecha){
  var d=(t.decision_meta||[]).filter(function(x){ return x.id===did; })[0]; if(!d) return "";
  var m=metasDe(t).filter(function(x){ return x.id===d.metaId; })[0], ej=m?ejecutorMeta(t, m):null, tx="";
  t.decision_meta=t.decision_meta.filter(function(x){ return x.id!==did; });
  if(t.pendiente_meta===did){ t.pendiente_info=""; t.pendiente_tipo=""; delete t.pendiente_meta; }
  if(accion==="fecha" && m){ var nf=/^\d{4}-\d{2}-\d{2}$/.test(fecha||"")?fecha:d.nueva; m.fecha_antes=(m.fecha_antes||[]).concat([m.fecha]); m.fecha=nf; m.escalada=null; m.empuje=null; m.aviso_atraso=null;
    tx="Nueva fecha para “"+d.corta+"”: "+fechaMeta(nf)+".";
    if(ej && !ej.k) pideWhatsAppAuto(t, {usuario:yo, tarea_id:t.id, contacto:ej.nombre, texto:"IA: Hola "+nombreCorto(ej.nombre).split(" ")[0]+", quedamos para el "+fechaMeta(nf)+" con “"+d.corta+"”. ¡Gracias!", sin_espera:1}); }
  else if(accion==="hablo" && m){ m.yo_hablo=true; tx="Tú hablas con "+(d.ejecutor?nombreCorto(d.ejecutor):"el responsable")+" de “"+d.corta+"”; dejo de insistirle."; }
  else if(accion==="autorizo" && m){ m.autorizado={costo:d.costo||"", ts:Date.now(), por:yo}; m.escalada=m.fecha; tx="Autorizaste “"+d.corta+"”"+(d.costo?" ("+d.costo+")":"")+".";
    if(ej && !ej.k) pideWhatsAppAuto(t, {usuario:yo, tarea_id:t.id, contacto:ej.nombre, texto:"IA: Hola "+nombreCorto(ej.nombre).split(" ")[0]+", Salvador autoriza “"+d.corta+"”"+(d.costo?" ("+d.costo+")":"")+". Adelante, ¡gracias!", sin_espera:1}); }
  if(tx) msg(t,"bi",tx); guarda(t); return tx;
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function vDecisionMeta(t){
  return (t.decision_meta||[]).map(function(d){
    return '<div class="revc c-decmeta" data-dm="'+esc(d.id)+'"><span class="rct">DECIDE · META ATRASADA</span>'+
      '<span class="rcq">'+esc(d.meta)+'</span>'+
      '<span class="rcp">Meta '+esc(fechaMovCorta(d.fecha))+' · <b>'+d.atraso+' día'+(d.atraso===1?'':'s')+' de atraso</b>'+(d.ejecutor?' · '+esc(nombreCorto(d.ejecutor)):'')+' · '+esc(d.motivo)+'</span>'+
      '<div class="dmr"><b>Contestó:</b> '+(d.resp.length?d.resp.map(function(x){ return '“'+esc(x)+'”'; }).join(" · "):'<span class="vac">nada desde que venció</span>')+'</div>'+
      (d.fotos.length?'<div class="dmf">'+d.fotos.map(function(u){ return '<img src="'+esc(u)+'" alt="evidencia">'; }).join("")+'</div>':'<div class="dmr"><b>Evidencia:</b> <span class="vac">sin fotos</span></div>')+
      (d.costo?'<div class="dmr"><b>Costo:</b> '+esc(d.costo)+'</div>':'')+
      '<div class="dmb"><button class="dmk si" data-dmact="fecha" data-dmid="'+esc(d.id)+'">Nueva fecha '+esc(fechaMeta(d.nueva))+'</button>'+
      '<button class="dmk" data-dmact="hablo" data-dmid="'+esc(d.id)+'">Hablo yo con él</button>'+
      (d.costo?'<button class="dmk" data-dmact="autorizo" data-dmid="'+esc(d.id)+'">Autorizo</button>':'')+'</div></div>';
  }).join("");
}
function vMetas(t){
  var L=metasDe(t), H=hoy(), pend=L.filter(function(m){ return !metaCumplida(m); }), hech=L.filter(metaCumplida);
  pend.sort(function(a,b){ return String(a.fecha||"9999").localeCompare(String(b.fecha||"9999")); });
  var rojo=pend.filter(function(m){ return semaforoMeta(m,H).k==="rojo"; }).length;
  var h='<div class="metas" id="metas"><div class="mth">'+ico("chk",18,1.9)+'<b>Metas</b><span class="mtc'+(rojo?' rojo':'')+'">'+(rojo?rojo+" atrasada"+(rojo===1?"":"s")+" · ":"")+pend.length+" pendiente"+(pend.length===1?"":"s")+'</span></div>';
  h+=pend.map(function(m){ var sf=semaforoMeta(m,H), q=quienMeta(t,m), sg=segMetaTx(m);
    return '<div class="mt s-'+sf.k+'" data-meta="'+esc(m.id)+'"><span class="mts" aria-hidden="true"></span><div class="mtb"><div class="mtx">'+esc(m.tx)+'</div>'+
      '<div class="mtm">'+(m.fecha?'<b>Meta: '+esc(fechaMovCorta(m.fecha))+'</b> · ':'')+'<span class="mtsf">'+esc(sf.tx)+'</span>'+(q?' · '+esc(q):'')+'</div>'+
      (sg?'<div class="mtg">Seguimiento: '+esc(sg)+'</div>':'')+
      ((+m.estado||0)===1?'<div class="mta"><span class="mtpa">Entregada · por aprobar</span></div>':
      '<div class="mta">'+(m.foto?'<img class="mtf" src="'+esc(m.foto)+'" alt="comprobante">':'')+
      '<button class="mtfoto" data-metafoto="'+esc(m.id)+'">'+ico("cam",16,1.8)+(m.foto?'Cambiar foto':'Foto')+'</button>'+
      '<button class="mtok" data-metaok="'+esc(m.id)+'">✓ Cumplida</button></div>')+'</div></div>'; }).join("");
  if(!pend.length) h+='<div class="mtv">Sin metas pendientes.</div>';
  if(hech.length){ var ab=!!((window.__metaHist||{})[t.id]);
    h+='<button class="mthist" id="bmetahist" aria-expanded="'+(ab?"true":"false")+'">Historial de metas ('+hech.length+') '+(ab?'▴':'▾')+'</button>';
    if(ab) h+='<div class="mthl">'+hech.slice().sort(function(a,b){ return String(b.cumplida||"").localeCompare(String(a.cumplida||"")); }).map(function(m){
      return '<div class="mth1">'+(m.foto?'<img class="mtf" src="'+esc(m.foto)+'" alt="comprobante">':'<span class="mtnf">sin foto</span>')+'<div><div class="mtx">'+esc(m.tx)+'</div>'+
        '<div class="mtm">Cumplida '+esc(fechaMeta(m.cumplida)||"")+(m.fecha?' · meta '+esc(fechaMeta(m.fecha)):'')+'</div></div></div>'; }).join("")+'</div>';
  }
  return h+'<input type="file" id="metain" accept="image/*" capture="environment" hidden></div>';
}
function vChecklist(t){
  if(esMetas(t)) return vMetas(t);
  if(!tieneChecklist(t)) return "";
  var L=t.checklist.items, inv=L.filter(function(x){ return x.estado>=1; }).length, conf=L.filter(function(x){ return x.estado===2; }).length;
  var ab=!!((window.__chkOpen||{})[t.id]);
  var h='<div class="pasosw"><div class="pasos chkl'+(ab?' open':'')+'" id="chkl"><button class="ph" id="bchkl" aria-expanded="'+(ab?"true":"false")+'">'+
    '<span class="ttl pchk">'+ico("chk",18,1.9)+'<span>'+esc(t.checklist.titulo||"Lista")+'</span></span>'+
    '<span class="cn'+(conf===L.length?' full':'')+'">✓ '+inv+' · ✓✓ '+conf+' de '+L.length+'</span>'+
    '<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>'+
    '<div class="pbar"><i style="width:'+Math.round(L.length?inv*100/L.length:0)+'%"></i></div>';
  if(ab){ h+='<div class="plst">'+L.map(function(x){ var e=x.estado||0;
      return '<button class="cit e'+e+'" data-chk="'+esc(x.id)+'" aria-label="'+esc(x.tx)+': '+CHK_NOM[e]+'"><span class="ctx2">'+esc(x.tx)+'</span><span class="cst">'+CHK_EST[e]+'</span></button>'; }).join("")+
    '<div class="chlev">○ pendiente · ✓ invitado · ✓✓ confirmado · toca para cambiar</div></div>'; }
  return h+'</div></div>';
}
function tienePasos(t){ return !!(t && t.lista_pasos && t.lista_pasos.length); }
function pasosHechos(t){ return (t.lista_pasos||[]).filter(function(p){ return p.hecho; }).length; }
function pasosCompletos(t){ return tienePasos(t) && pasosHechos(t)===t.lista_pasos.length; }
function pasosFaltan(t){ return (t.lista_pasos||[]).filter(function(p){ return !p.hecho; }); }
/* "vino", "menú": el paso en chiquito para decirlo en una frase */
function pasoChico(p){
  var s=String((p&&p.tx)||"");
  return (s.length>1 && s.charAt(1)===s.charAt(1).toLowerCase()) ? s.charAt(0).toLowerCase()+s.slice(1) : s;
}
function juntaY(a){ return a.length<=1 ? (a[0]||"") : a.slice(0,-1).join(", ")+" y "+a[a.length-1]; }
/* home: "Falta: vino, menú" (corto, nunca la lista entera) */
function faltaTxt(t){
  var f=pasosFaltan(t); if(!f.length) return "Todo palomeado · falta darle Ya está";
  var s="Falta: "+f.slice(0,3).map(pasoChico).join(", ");
  return s+(f.length>3?"…":"");
}
/* el anillo del renglon del home: avance hechos/total */
function anilloPasos(t){
  var tot=t.lista_pasos.length, n=pasosHechos(t), C=2*Math.PI*15, L=(tot?n/tot:0)*C;
  return '<svg class="ranillo" viewBox="0 0 36 36" aria-label="'+n+' de '+tot+' pasos">'+
    '<circle cx="18" cy="18" r="15" fill="none" stroke="#3a3a40" stroke-width="3.2"/>'+
    (n?'<circle cx="18" cy="18" r="15" fill="none" stroke="#30D158" stroke-width="3.2" stroke-linecap="round" '+
      'stroke-dasharray="'+L.toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 18 18)"/>':'')+
    '<text x="18" y="22.5" text-anchor="middle" font-size="12.5" font-weight="600" fill="#F5F5F7" '+
      'font-family="-apple-system,BlinkMacSystemFont,sans-serif">'+n+'/'+tot+'</text></svg>';
}
var SVG_CHK='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#06340f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';
/* la barra fija de arriba del chat. window.__pasosOpen[id] = desplegada (solo pantalla) */
function vPasos(t){
  if(!tienePasos(t)) return "";
  /* build 167: varias listas con nombre = pestañas; se ve una a la vez */
  var LS=listasDe(t), act=listaActiva(t);
  var L=t.lista_pasos.filter(function(p){ return (p.lista||"")===act; });
  var n=L.filter(function(p){ return p.hecho; }).length, tot=L.length, sig=L.filter(function(p){ return !p.hecho; })[0];
  var ab=!!((window.__pasosOpen||{})[t.id]);
  var h='<div class="pasosw"><div class="pasos'+(ab?' open':'')+'" id="pasos">'+
    '<button class="ph" id="bpasos" aria-expanded="'+(ab?"true":"false")+'">'+
      /* build 195: hojita verde + nombre de la lista + "N de M" + barrita */
      '<span class="ttl pchk">'+ico("chk",18,1.9)+'<span>'+esc(act||"Pasos")+'</span></span>'+
      '<span class="cn'+(n===tot?' full':'')+'">'+n+' de '+tot+'</span>'+
      (LS.length>1?'<span class="lmas">+'+(LS.length-1)+'</span>':'')+
      '<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'+
    '</button>'+
    '<div class="pbar"><i style="width:'+Math.round(tot?n*100/tot:0)+'%"></i></div>';
  if(ab && LS.length>1){
    h+='<div class="ltabs">';
    LS.forEach(function(nm){
      var it=t.lista_pasos.filter(function(p){ return (p.lista||"")===nm; }), hh=it.filter(function(p){ return p.hecho; }).length;
      h+='<button class="ltab'+(nm===act?' on':'')+'" data-ltab="'+esc(nm)+'">'+esc(nm||"Pasos")+' <span>'+hh+'/'+it.length+'</span></button>';
    });
    h+='</div>';
  }
  if(ab){
    h+='<div class="plst">';
    var secAnt=null;
    /* agrupado por seccion, en el orden en que aparecen */
    var orden=[], grupos={};
    L.forEach(function(p){ var s=p.sec||""; if(!grupos[s]){ grupos[s]=[]; orden.push(s); } grupos[s].push(p); });
    orden.forEach(function(s){
      if(s) h+='<div class="pgrp">'+esc(s)+'</div>';
      grupos[s].forEach(function(p){
        h+='<button class="pit'+(p.hecho?' on':'')+'" data-paso="'+esc(p.id)+'" aria-pressed="'+(p.hecho?"true":"false")+'">'+
           '<span class="pck">'+SVG_CHK+'</span>'+
           '<span class="ptx">'+esc(p.tx)+(p.meta?'<span class="pmeta">'+esc(p.meta)+'</span>':'')+'</span></button>';
      });
    });
    h+='<button class="padd" id="bpadd"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Dicta otro punto</button>';
    h+='</div>';
  }
  return h+'</div></div>';
}
/* se pliega sola al escribir o dictar, para dejar el chat libre */
function pliegaPasos(){
  var id=abierta; if(!id || !(window.__pasosOpen||{})[id]) return;
  window.__pasosOpen[id]=false;
  var pb=document.getElementById("pasos"); if(!pb) return;
  pb.classList.remove("open");
  var l=pb.querySelector(".plst"); if(l && l.parentNode) l.parentNode.removeChild(l);
  var b=document.getElementById("bpasos"); if(b) b.setAttribute("aria-expanded","false");
}
function marcaPaso(t, p, on){
  p.hecho=!!on; p.por=on?(yo||null):null; p.f=on?Date.now():null;
}
/* palabras para comparar: sin acentos, sin relleno ni verbos de "ya quedo" */
var PASO_RELLENO=/^(ya|el|la|los|las|lo|un|una|unos|unas|de|del|al|a|y|e|o|en|con|para|por|que|se|me|te|le|les|mi|mis|su|sus|tu|tus|es|son|esta|estan|quedo|quedaron|queda|listo|lista|listos|listas|hecho|hecha|hechos|compre|compramos|comprado|comprada|termine|terminamos|palomea|palomealo|marca|marcalo|tacha|tache|tachalo|consegui|conseguimos|recogi|pague|pagamos|mande|llame|revise|cheque|checamos|hice|hicimos|lleve|traje|tambien|todo|toda|bien|ok|va|sale|pues|ahi|aqui|eso|esto|ese|esa|compra|comprar|checar|revisar|ir)$/;
function palabrasPaso(s){
  return _nrm(s).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(function(w){ return w.length>=3 && !PASO_RELLENO.test(w); });
}
function pegaPalabra(a,b){
  if(a===b) return true;
  var ra=a.replace(/(es|s)$/,""), rb=b.replace(/(es|s)$/,"");
  if(ra.length>=4 && ra===rb) return true;
  var n=Math.min(a.length,b.length);
  return n>=5 && a.slice(0,5)===b.slice(0,5);
}
/* ¿dice que ya quedo algo? "ya compré la carne", "ya quedó el acomodo", "listo el vino" */
/* build 146: "cambia el nombre de la tarea a/por X", "ponle de nombre X",
   "renombrala X", "el nombre correcto es X" -- el nombre nuevo se recorta
   ademas en la primera coma o "y" que introduzca un comentario aparte
   (dictado corrido: "...a Julio Mori. Ya te lo puse como se escribe..."),
   asi el pedazo que sigue explicando algo no se cuela en el nombre.
   Salvador 2026-09-27, caso real "Julio de MKS". */
function detectaRenombre(v){
  var s=String(v||"").trim();
  /* build 168: "cambiale el nombre A ESTA TAREA por X", "que se llame X", "llamala X" */
  s=s.replace(/\b(a|de)\s+(la|esta|[eé]sta|esa|[eé]sa)\s+(tarea|chat|conversaci[oó]n)\b/i,"").replace(/\s{2,}/g," ");
  var m=s.match(/c[aá]mbia(le|r|rle)?\s+(el\s+)?nombre\s+(de\s+(la|esta|[eé]sta|esa|[eé]sa)\s+(tarea|chat|conversaci[oó]n)\s+)?(a|por|como|:)\s*(.+)/i)
    || s.match(/\b(?:que\s+se\s+llame|ll[aá]mala|n[oó]mbrala|el\s+nombre\s+(?:debe\s+ser|ser[aá]|va\s+a\s+ser))\s+(.+)/i)
    || s.match(/cambia(le)?\s+(el\s+)?nombre\s+(a|por)\s+(.+)/i)
    || s.match(/\b(?:p[oó]n(?:le|erle|gale|ganle)?|cambi(?:ale|arle|a)|d[aá]le|tiene\s+que\s+(?:llamarse|tener\s+(?:el\s+)?nombre)|deber[ií]a\s+llamarse)\s+(?:de\s+|por\s+|como\s+|el\s+|un\s+)?(?:nombre|t[ií]tulo)\s*(?:de\s+|a\s+|por\s+|como\s+|:\s*)?(.+)/i)
    || s.match(/^\s*(?:nombre|t[ií]tulo)\s*:\s*(.+)/i)
    || s.match(/renombra(la)?\s+((a|por)\s+)?(.+)/i)
    || s.match(/el\s+nombre\s+correcto\s+es\s+(.+)/i);
  if(!m) return "";
  var nuevo=m[m.length-1];
  nuevo=nuevo.replace(/\s*[.,;]?\s*\b(ya te lo puse|c[oó]mo se escribe|as[ií] se escribe|revisa el chat|ah[ií] en el chat|registra(lo)?|apuntal[oó])\b.*$/i, "");
  nuevo=nuevo.replace(/[.,;]+$/,"").trim();
  if(/^(en|del?|al)\s+(la|el|los|las|esta|este)\b/i.test(nuevo)) return "";
  return nuevo.length>=2 ? nuevo : "";
}
function diceQueYa(v){
  var s=_nrm(v);
  if(/\b(no|todavia|aun|falta|faltan)\b/.test(s) && !/\bya\b/.test(s)) return false;
  return /\b(ya|listo|lista|listos|listas|quedo|quedaron|hecho|hecha|compre|compramos|termine|terminamos|palomea\w*|tacha\w*|consegui|recogi|pague|pagamos|mande|llame|revise|cheque|hice|lleve|traje)\b/.test(s);
}
/* marca los pasos que pegan con lo dicho; devuelve los que marco (o []) */
function palomeaPorTexto(t, v){
  if(!tienePasos(t) || !diceQueYa(v)) return [];
  var ws=palabrasPaso(v); if(!ws.length) return [];
  var cand=pasosFaltan(t).map(function(p){ var pw=palabrasPaso(p.tx+" "+(p.sec||"")); return {p:p, pw:pw.length?pw:palabrasPaso(p.tx)}; });
  var marcar={};
  ws.forEach(function(w){
    /* cada palabra dicha se queda con el paso donde pesa mas (vino -> "Vino", no "Vino tinto") */
    var pegan=cand.map(function(c){
      var hits=c.pw.filter(function(x){ return pegaPalabra(w,x); }).length;
      return {c:c, r:hits?hits/c.pw.length:0};
    }).filter(function(x){ return x.r>0; });
    if(!pegan.length) return;
    var mx=Math.max.apply(null, pegan.map(function(x){ return x.r; }));
    pegan.filter(function(x){ return x.r===mx; }).forEach(function(x){ marcar[x.c.p.id]=x.c.p; });
  });
  var hechos=Object.keys(marcar).map(function(k){ return marcar[k]; });
  hechos.forEach(function(p){ marcaPaso(t,p,true); });
  return hechos;
}
/* la contestacion corta de Claude en el chat, max. dos renglones */
/* build 145: entre TODAS las tareas con pasos pendientes, cuales pegan con
   lo dicho -- para palomear "ya compre el camaron" se dicte desde donde se
   dicte, no solo dentro de la tarea. Salvador 2026-09-27, caso Costco. */
function buscaTareaConPaso(v){
  var ws=palabrasPaso(v); if(!ws.length) return [];
  return tareas.filter(function(t){
    if(t.cierre || !tienePasos(t)) return false;
    var falt=pasosFaltan(t); if(!falt.length) return false;
    return ws.some(function(w){
      return falt.some(function(p){
        var pw=palabrasPaso(p.tx+" "+(p.sec||""));
        return (pw.length?pw:palabrasPaso(p.tx)).some(function(x){ return pegaPalabra(w,x); });
      });
    });
  });
}
function respuestaPalomeo(t, hechos){
  var falta=pasosFaltan(t), tot=t.lista_pasos.length, n=tot-falta.length;
  var s=hechos.length===1 ? "Palomeé “"+hechos[0].tx+"”." : "Listo, palomeé "+juntaY(hechos.map(pasoChico))+".";
  if(!falta.length) s+=" Ya quedó todo: dale Ya está.";
  else if(falta.length<=3) s+=" Te "+(falta.length===1?"falta ":"faltan ")+juntaY(falta.map(pasoChico))+".";
  else s+=" Van "+n+" de "+tot+".";
  return s;
}
/* "agrega pan y leche" -> dos pasos nuevos (van a la ultima seccion) */
/* ===== build 166 (Salvador 2026-10-02): LISTAS DICTADAS =====
   "numero uno mi aportacion de 500,000 numero dos las bardas numero tres..."
   -> ["mi aportacion de 500,000","las bardas",...]. Un numero sin nada (numero
   cuatro numero cinco) se salta. Solo parte con "numero/punto + N", ordinales
   (primero, segundo...) o "1." / "2)": nunca con cifras sueltas como 500,000. */
var NUM_LISTA="uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|\\d{1,2}";
function listaNumerada(texto){
  var s=" "+String(texto||"").replace(/\s+/g," ")+" ";
  var marca=new RegExp("(?:\\b(?:n[uú]mero|punto|el\\s+n[uú]mero)\\s+(?:"+NUM_LISTA+")\\b|\\b(?:primero|segundo|tercero|cuarto|quinto|sexto|s[eé]ptimo|octavo|noveno|d[eé]cimo)\\b|(?:^|\\s)\\d{1,2}\\s*[.)-](?=\\s))\\s*[.,:;)-]?","ig");
  var cortes=[], m;
  while((m=marca.exec(s))){ cortes.push({i:m.index, f:m.index+m[0].length}); if(m[0].length===0) marca.lastIndex++; }
  if(cortes.length<2) return [];
  var out=[];
  for(var k=0;k<cortes.length;k++){
    var pz=s.slice(cortes[k].f, k+1<cortes.length?cortes[k+1].i:s.length)
      .replace(/^[\s,.;:y-]+/i,"").replace(/[\s,.;:-]+$/,"").replace(/\s+y$/i,"").trim();
    if(pz.length>=2) out.push(pz);
  }
  return out;
}
/* el nombre corto de una tarea-lista: lo de antes del "numero uno" */
function nombreLista(texto){
  var s=String(texto||"");
  var m=s.match(new RegExp("\\b(?:n[uú]mero|punto)\\s+(?:"+NUM_LISTA+")\\b","i"));
  var pre=(m?s.slice(0,m.index):s)
    .replace(/\b(por\s+favor|porfa|hazme|haz|ponme|pon|cr[eé]ame|crea|quiero|necesito|me|un|una|el|la|los|las|de|del|siguientes?)\b/gi," ")
    .replace(/[,:;.]/g," ").replace(/\s+/g," ").trim();
  if(pre.length<3) pre="Lista de puntos";
  return conMayuscula(pre.slice(0,60));
}
/* "en la tarea (que tengo) de X ponme un checklist..." -> {frase:"X", items:[...]}.
   Solo si nombra una TAREA/JUNTA que ya existe Y pide lista/checklist/puntos. */
function detectaLista(texto){
  var s=String(texto||"").replace(/\s+/g," ");
  if(!/\b(check\s*-?\s*lists?|checklists?|lista|puntos|pasos|temas|agenda|orden del d[ií]a)\b/i.test(s)) return null;
  var m=s.match(/\b(?:en|a|dentro\s+de|para)\s+(?:mi|la|esta|el)\s+(?:tarea|junta|reuni[oó]n)\s+(?:que\s+tengo\s+)?(?:del|de|sobre|con)?\s*(.+?)(?=\s+(?:p[oó]n(?:me|le|gas)?|h[aá]z(?:me|le)?|agr[eé]ga(?:me|le)?|m[eé]te(?:me|le)?|cr[eé]a(?:me|le)?|quiero|necesito|an[oó]ta(?:me|le)?|arma(?:me|le)?)\b|[,:]|$)/i);
  if(!m) return null;
  var frase=m[1].replace(/\b(que\s+tengo|ahorita|ahora|hoy|de\s+hoy)\b/gi," ").replace(/\s+/g," ").trim();
  if(palabras(frase).length===0) return null;
  var resto=s.slice(m.index+m[0].length);
  var items=listaNumerada(resto);
  if(!items.length){
    var dp=resto.split(/:/); if(dp.length>1){
      items=dp.slice(1).join(":").split(/\s*,\s*|\s+y\s+(?=\S)/i).map(function(x){ return x.trim(); }).filter(function(x){ return x.length>=2; });
    }
  }
  /* build 167: nombre de la lista ("checklist PARA LA JUNTA DEL CONSEJO", "lista DE MIS TAREAS") */
  var nm=s.match(/\b(?:check\s*-?\s*lists?|checklists?|lista|puntos|temas|agenda)\s+(?:de|para|con)\s+(?!los\s+siguientes|las\s+siguientes|lo\s+siguiente)(.+?)(?=\s*[:,]|\s+(?:n[uú]mero|punto|primero)\b|$)/i);
  var nomL=nm?conMayuscula(nm[1].replace(/^(la|el|los|las)\s+/i,"").trim().slice(0,30)):"";
  return {frase:frase, items:items, nombre:nomL};
}
/* agrega los puntos a ESA tarea y la abre con la lista desplegada; sin puntos,
   la abre esperando que se dicten */
function listasDe(t){
  var o=[]; (t.lista_pasos||[]).forEach(function(p){ var n=p.lista||""; if(o.indexOf(n)<0) o.push(n); }); return o;
}
function listaActiva(t){
  var ls=listasDe(t), a=(window.__listaAct||{})[t.id];
  if(a!=null && ls.indexOf(a)>=0) return a;
  /* la primera con pendientes */
  for(var i=0;i<ls.length;i++){ if((t.lista_pasos||[]).some(function(p){ return (p.lista||"")===ls[i] && !p.hecho; })) return ls[i]; }
  return ls[0]||"";
}
function aplicaLista(t, items, texto, nombre){
  msg(t,"bo",texto);
  /* build 167: cada lista con su nombre es una pestaña. Sin nombre: va a la activa. */
  var ls=listasDe(t), dest=nombre||"";
  if(!dest && ls.length) dest=listaActiva(t);
  if(dest && ls.length===1 && ls[0]==="" && !(t.lista_pasos||[]).length) dest=dest;
  window.__listaDest=dest;
  var nuevos=agregaPasos(t, items.length?items.join(" | "):"", items);
  window.__listaDest=null;
  window.__listaAct=window.__listaAct||{}; window.__listaAct[t.id]=dest;
  if(nuevos.length){
    msg(t,"bi", nuevos.length<=3 ? "Agregué "+juntaY(nuevos.map(function(p){ return "“"+p.tx+"”"; }))+" a la lista."
                                 : "Agregué "+nuevos.length+" puntos a la lista.");
    window.__pasosOpen=window.__pasosOpen||{}; window.__pasosOpen[t.id]=true;
    toast("Lista en “"+t.nombre+"”");
  } else if(items.length){
    msg(t,"bi","Esos puntos ya estaban en la lista.");
  } else {
    msg(t,"bi","Dime los puntos de la lista (por ejemplo: número uno…, número dos…).");
    window.__pasoAdd=t.id;
    toast("Dicta los puntos de la lista");
  }
  t.ultima=PERSONAS[yo].nombre+": "+texto;
  guarda(t);
  abierta=t.id; barraEstado=null; consulta=""; fotoEnMano=null; vista="hilo"; render();
}
function agregaPasos(t, texto, yaPartidos){
  var s=String(texto||"").replace(/^\s*(agr[eé]ga(le|me)?|a[nñ]ade(le)?|s[uú]male|apunta(le|me)?|pon(le)?|mete(le)?|tambi[eé]n)\s+(a\s+la\s+lista\s+|otro\s+paso:?\s*|un\s+paso:?\s*)?/i,"");
  /* build 166: lista ya partida, o dictada con numero uno/dos... */
  var _num=yaPartidos&&yaPartidos.length?yaPartidos:listaNumerada(s);
  var partes=_num.length?_num:s.split(/\s*,\s*|\s+y\s+(?=\S)/i).map(function(x){ return x.trim(); }).filter(function(x){ return x.length>=2; });
  var nuevos=normalizaPasos(partes);
  var _dst0=(window.__listaDest!=null)?window.__listaDest:listaActiva(t);
  /* los nuevos van a la ultima seccion (tienda/lugar) de ESA lista */
  var _mis=(t.lista_pasos||[]).filter(function(p){ return (p.lista||"")===(_dst0||""); });
  var ult=_mis.length?(_mis[_mis.length-1].sec||""):"";
  var ya={}; (t.lista_pasos||[]).forEach(function(p){ if((p.lista||"")===(_dst0||"")) ya[_nrm(p.tx).trim()]=1; });
  nuevos=nuevos.filter(function(p){ return !ya[_nrm(p.tx).trim()]; });
  var _dst=(window.__listaDest!=null)?window.__listaDest:listaActiva(t);
  nuevos.forEach(function(p){ p.sec=ult; p.lista=_dst||""; });
  t.lista_pasos=(t.lista_pasos||[]).concat(nuevos);
  return nuevos;
}
/* hora dicha fuera del nombre: "Ir a Mori a las cinco 30" -> "Ir a Mori" */
function quitaHoraNombre(n){
  var s=limpiaHoraDictada(String(n||""))
    .replace(/\ba\s+la(s)?\s+(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)(\s+y\s+(media|cuarto)|\s+menos\s+cuarto|\s+\d{2}\b|\s+(y\s+)?(cincuenta y cinco|cincuenta|cuarenta y cinco|cuarenta|treinta y cinco|treinta|veinticinco|veinte|quince|diez|cinco))?\b/gi," ")
    .replace(/\b(de|en|por)\s+la\s+(ma[nñ]ana|tarde|noche)\b/gi," ")
    .replace(/\b(mediod[ií]a|medianoche)\b/gi," ")
    .replace(/\s+·\s*$/,"").replace(/\s{2,}/g," ").trim();
  return sinHoraEnTitulo(s);
}
/* build 164: las RECURRENTES (con o sin pasos) ya arrancan su siguiente vuelta:
   ver siguienteVuelta() junto a cierraHecha(). */

/* CREAR TAREA — campos reales del motor. La fecha ya viene de Claude (si faltaba,
   se pregunto); si de plano no hay, hoy. */
/* build 241: la condición de cierre solo es obligación si Salvador la dijo (sus palabras están en lo dictado); si la inventó la IA, es sugerencia */
function cierraDicho(d){ var c=String((d&&d.cierra)||"").trim(); if(!c) return true; var s=_fsa((d&&(d.dicho||d.texto))||"");
  var ws=_fsa(c).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(function(w){ return w.length>=4 && !/^(para|como|esta|este|cuando|donde|quede|queda|hecho|hecha|listo|lista)$/.test(w); });
  return !!s.trim() && ws.length>0 && ws.some(function(w){ return s.indexOf(" "+w.slice(0,5))>=0; }) &&
    /\b(se cierra|cierra con|cerrarla|cerrarlo|para cerrar|la cierras?|lo cierras?|hasta que|cuando (me )?(mande|manden|entregue|entreguen|llegue|traiga)|con (la|el|su|una|un) (foto|comprobante|ticket|evidencia|recibo|factura|firma))\b/.test(s); }
function creaTarea(d){
  var f=(d.fecha&&/^\d{4}-\d{2}-\d{2}$/.test(d.fecha))?d.fecha:hoy();
  var per=(["semanal","mensual"].indexOf(d.periodicidad)>=0)?d.periodicidad:null;
  var t={
    id:"t"+uid(), nombre:String(d.nombre).trim(),
    duenio:(d.duenio&&PERSONAS[d.duenio])?d.duenio:yo,
    tipo:per?"recurrente":"unica",
    f_original:f, f_vigente:f, movidas:0,
    recuperable:(d.recuperable===false?false:true),
    criticidad:(["diario","normal","lento"].indexOf(d.criticidad)>=0?d.criticidad:"normal"),
    periodicidad:per, cierra:cierraDicho(d)?(d.cierra||""):"", cierra_sugerido:cierraDicho(d)?"":(d.cierra||""), revisar:d.revisar||"", ritmo:d.ritmo||"", gasto:d.gasto||"",
    estado:"abierta", detenido:null, cierre:null, encargado:null,
    /* REVISION: esta tarea es el respaldo de otra que ejecuta alguien mas.
       revisa_a = id de la tarea del que ejecuta; revisa_ext = nombre, si el que
       ejecuta es de fuera y no tiene la app. Salvador 2026-09-04. */
    revisa_a:d.revisa_a||null, revisa_ext:d.revisa_ext||"",
    ultima:"", msgs:[], creada:Date.now(), creada_por:yo,
    pendiente_info:d.pendiente_info||"", pendiente_tipo:d.pendiente_tipo||"", falta_fecha:!!d.falta_fecha
  };
  /* build 144: PASOS (2 o mas cosas). Una sola cosa = tarea normal, sin lista. */
  var _lp=normalizaPasos(d.pasos);
  if(_lp.length>=2){
    t.lista_pasos=_lp;
    /* el nombre corto: lo de despues de " · " era la lista repetida */
    if(t.nombre.indexOf(" · ")>0) t.nombre=t.nombre.split(" · ")[0].trim();
  }
  /* build 144: HORA DICHA = ALARMA. Solo lo que viene de un dictado CREAR
     (d.aviso_hora_dicha); los WhatsApp y acuerdos tienen su propio camino. */
  var _hDicha=!!(d.aviso_hora_dicha && d.dicho && (horaDicha(d.dicho)||relativoDicho(d.dicho)));
  if(_hDicha){ var _nq=quitaHoraNombre(t.nombre); if(_nq && _nq.length>=3) t.nombre=_nq; }
  /* si lo que dictó es largo (contexto para el que ejecuta), se guarda como
     burbuja hablada: resumen corto + el dictado completo a un toque. Si es corto,
     el mensaje de siempre. Salvador 2026-09-17. */
  if(esLargo(d.dicho||"")){
    tareas.push(t);
    guardaHablado(t,"bi", d.dicho);
    if(t.cierra) msg(t,"bi","Se cierra con: "+t.cierra);
    guarda(t);
  }else{
    msg(t,"bi","La abriste dictando: “"+(d.dicho||t.nombre)+"”."+
      (t.cierra?" Se cierra con: "+t.cierra:""));
    tareas.push(t); guarda(t);
  }
  /* build 144 (Salvador 2026-09-26): "Dame a las cinco 30 ir a Mori..." (el
     iPhone oyo "Dame" en vez de "Recuerdame") creaba la tarea SIN alarma. Toda
     tarea dictada con hora nace con su aviso, igual que un recordatorio: misma
     matriz de hora (armaCuando/horaCercana), mismo aviso_set al servidor. */
  if(_hDicha){
    var _ac=armaCuando(d.dicho), _fa=_ac.fecha;
    if(!relativoDicho(d.dicho) && !diaDicho(d.dicho) && d.fecha && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) _fa=d.fecha;
    var _ha=relativoDicho(d.dicho) ? _ac.hora : (horaCercana(_fa, horaValor(d.dicho), d.dicho)||_ac.hora);
    var _av=nuevoAviso(t, {texto:t.nombre, dicho:d.dicho, fecha:_fa, hora:_ha});
    msg(t,"bi","Te aviso "+(textoCuando(_av)||"")+".");
    preguntaAmPm(t, [String(_av.ts)], d.dicho);
    guarda(t); sincronizaAvisos(t);
  }

  //Enviar notificación push (nunca si aun le falta un dato: todavia no es de nadie)
  if (t.duenio && t.duenio !== yo && !t.pendiente_info) {
    disparaPushInstantaneo(
      t.duenio,
      'Nueva tarea asignada',
      'Te asignaron: "' + t.nombre + '"',
      urlTarea(t.id)
    );
  }
  return t;
}

/* RECORDATORIO — MVP: se guarda marcado, sin la maquinaria de tarea (no escala,
   no pide comprobante). Vive en la misma coleccion con es_recordatorio:true.
   Su comportamiento fino (avisar por push, verse aparte) se pule despues. */
/* build 163: ¿lo dictado ya trae fin? ("hasta el 30 de nov", "sin fin", "por 3 meses") */
function finDicho(tx){
  var n=String(tx||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  return /\b(hasta\s+(el|que|fin|diciembre|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre)|sin\s+fin|por\s+\d+\s+(semanas|meses|dias)|indefinid)/.test(n);
}
function creaRecordatorio(r){
  var f=(r.fecha&&/^\d{4}-\d{2}-\d{2}$/.test(r.fecha))?r.fecha:hoy();
  var _dic=r.dicho||r.texto||"";
  var _hora=r.hora||horaValor(_dic);
  var _cada=normalizaCada(cadaDicho(_dic)||r.periodicidad||r.cada||"");
  var t={
    id:"r"+uid(), nombre:String(r.texto).trim(),
    duenio:yo, tipo:"recordatorio", es_recordatorio:true,
    f_original:f, f_vigente:f, movidas:0, recuperable:true,
    criticidad:"lento", periodicidad:null,
    /* para que el servidor (Josué) haga sonar la alarma a la hora exacta y la
       repita si es recurrente. Salvador 2026-09-17. */
    aviso_hora:_hora, aviso_cada:_cada, aviso_dicho:_dic, avisado_en:null,
    cierra:"", revisar:"", ritmo:"", gasto:"",
    estado:"abierta", detenido:null, cierre:null, encargado:null,
    ultima:"", msgs:[], creada:Date.now(), creada_por:yo
  };
  msg(t,"bi","Recordatorio. Te aviso el "+fechaBonita(f)+(_hora?" a las "+horaBonita(_hora):"")+".");
  /* build 163 (Salvador 2026-10-01): si se repite y no dijo hasta cuándo, cae a
     información pendiente preguntando la fecha de finalización. */
  if(_cada && !finDicho(_dic)){ t.pendiente_info="¿Hasta cuándo se repite? Dime la fecha de finalización, o “sin fin”."; t.pendiente_tipo="fin"; }
  preguntaAmPm(t, ["self"], _dic);
  tareas.push(t); guarda(t); sincronizaAvisos(t);
  return t;
}

/* ===== NADA SE PIERDE (Salvador 2026-09-16) =====================
   Al dictar: si la tarea esta completa, se crea SOLA y sale una fichita con
   "Deshacer" (ya no hay boton de Confirmar). Si le falta un dato, se crea IGUAL
   pero cae en el bote naranja "informacion pendiente", con su pregunta y su
   microfono, para contestarla cuando se pueda. Asi ni una tarea se pierde por
   no haber picado un boton o por no contestar una duda. */
window.recienCreadas = window.recienCreadas || [];

/* las que estan a medias, para el bote naranja (del que las dicto) */
function pendientesInfo(){
  return tareas.filter(function(t){
    return t.pendiente_info && !esDecisionSal(t) && !esPropuesta(t) && (t.creada_por===yo || t.duenio===yo) &&
           !t.cierre && estadoReal(t)!=="cerrada";
  }).sort(function(a,b){ return (b.creada||0)-(a.creada||0); });
}
/* un renglon del bote: nombre, la pregunta, y su microfono ahi mismo */
/* build 150 (Salvador 2026-09-29): el renglon del bote dice QUE dictaste (contexto
   en texto) y trae un PLAY que lo lee en voz alta: la pregunta + lo que dijiste,
   para acordarte de cual tarea era antes de contestar. */
function contextoPend(t){
  var ms=t.msgs||[], c="";
  for(var i=0;i<ms.length;i++){
    var m=String(ms[i].t||"").match(/dictando:\s*[“"](.+?)[”"]\.?(?:\s*Se cierra|$)/);
    if(m){ c=m[1]; break; }
  }
  if(!c && ms.length){ c=String(ms[0].t||""); }
  if(!c) c=t.nombre||"";
  return String(c).trim();
}
function filaPend(t){
  var titulo=(t.nombre&&String(t.nombre).trim())?t.nombre:"Recordatorio sin título";
  var ctx=contextoPend(t);
  return '<div class="pendrow" data-abrep="'+t.id+'">'+
    '<span class="dot d-sec-pend" style="margin-top:2px"></span>'+
    '<div class="ptx"><div class="pnm">'+esc(titulo)+'</div>'+
    '<div class="pq" id="cq_'+t.id+'">'+esc(t.pendiente_info||"Falta un dato")+'</div>'+
    (ctx?'<div class="pctx">Dijiste: “'+esc(ctx)+'”</div>':'')+'</div>'+
    '<button class="pplay" data-cplay="'+t.id+'" aria-label="Escuchar el contexto">'+svgPlay()+'</button>'+
    '<button class="pmic" id="cm_'+t.id+'" data-cmic="'+t.id+'" aria-label="Contestar dictando">'+
      ico("mic",22,1.7)+'</button>'+
    '</div>';
}
/* las fichitas de "recien creadas" con su Deshacer */
function vRecienCreadas(){
  var rc=window.recienCreadas||[]; if(!rc.length) return "";
  var h='<div class="recabe"><span class="rtick">✓</span>Recién creadas</div>';
  rc.forEach(function(o){
    var meta=[];
    if(o.para&&PERSONAS[o.para]) meta.push("para "+PERSONAS[o.para].nombre);
    if(o.tipo==="recordatorio") meta.push("recordatorio");
    if(o.fecha) meta.push(o.fecha);
    /* aviso insertado -> Desinsertar; algo que salió del bote -> Deshacer que lo
       REGRESA al bote (no lo borra); lo demás (recién creado) -> Deshacer que borra */
    var boton=(o.tipo==="aviso")
      ? '<button class="fides" data-desin="'+esc(o.taskId+"|"+o.ts)+'">Desinsertar</button>'
      : (o.tipo==="completada"
         ? '<button class="fides" data-descom="'+esc(o.id)+'">Deshacer</button>'
         : '<button class="fides" data-undo="'+o.id+'">Deshacer</button>');
    /* toda la fichita se puede picar para ABRIR la tarea/recordatorio; el botón
       (Deshacer/Desinsertar) hace lo suyo sin abrirla. Salvador 2026-09-17. */
    var abreId=(o.tipo==="aviso")?o.taskId:o.id;
    h+='<div class="fichi" data-abrefichi="'+esc(abreId)+'"><div class="fitx"><div class="finm">'+esc(o.nombre)+'</div>'+
       (meta.length?'<div class="fimt">'+esc(meta.join(" · "))+'</div>':'')+'</div>'+
       boton+'</div>';
  });
  return h;
}

/* crea YA y deja la fichita de deshacer (tareas y recordatorios completos) */
function autoEjecuta(b){
  var creada=null, meta=null;
  if(b.accion==="crear"||b.accion==="enviar"){
    creada=creaTarea(b.pendiente.tarea);
    if(b.foto) pegaFotoA(creada,b.foto);
    meta={id:creada.id, nombre:creada.nombre, tipo:"tarea",
          para:(creada.duenio!==yo?creada.duenio:null),
          fecha:(creada.f_vigente?("para el "+fechaBonita(creada.f_vigente)):"")};
  }else if(b.accion==="recordatorio"){
    creada=creaRecordatorio(b.pendiente.recordatorio);
    if(b.foto) pegaFotoA(creada,b.foto);
    meta={id:creada.id, nombre:creada.nombre, tipo:"recordatorio", para:null,
          fecha:(creada.f_vigente?("te aviso el "+fechaBonita(creada.f_vigente)):"")};
  }
  if(meta){ window.recienCreadas.unshift(meta);
    if(window.recienCreadas.length>8) window.recienCreadas.length=8; }
  /* Salvador 2026-09-23: un RECORDATORIO recien dictado abre SU chat, para seguir
     platicando ahi (la campana, "Ya esta" y el bote quedan a la mano). Las tareas
     siguen yendo al home (regla build 36). */
  if(b.accion==="recordatorio" && creada && creada.id){
    barraEstado=null; consulta=""; fotoEnMano=null; secAbierta=null;
    abierta=creada.id; vista="hilo"; fichaOpen=false; detOpen={}; menuOpen=false; editaNombre=null; render();
    return;
  }
  barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; secAbierta=null; render();
}
/* ===== RECORDATORIO QUE PERTENECE A UNA TAREA (Salvador 2026-09-17) =====
   Cuando un "recuerdame" habla de algo que YA es una tarea, no nace suelto: se
   inserta DENTRO de esa tarea como un aviso (un "ritmo") que brincara a la hora
   o el dia que dijo, para picar el avance. La app guarda el aviso y lo enseña;
   que la alerta BRINQUE a la hora exacta es el push del servidor (Josue). */
/* HORAS SIN AMBIGUEDAD — Salvador 2026-09-23: "9:35" a secas no dice si es de
   la manana o de la tarde. Todo aviso y recordatorio sale "4:35 PM"; quien
   prefiera 24 horas ("16:35") lo cambia en Tu cuenta y se guarda en su telefono. */
function fmt24(){ try{ return localStorage.getItem("bit_fmt24")==="1" }catch(e){ return false } }
function horaBonita(hm){
  var m=/^(\d{1,2}):(\d{2})$/.exec(String(hm||"").trim()); if(!m) return hm||"";
  var h=parseInt(m[1],10), mi=m[2];
  if(fmt24()) return String(h).padStart(2,"0")+":"+mi;
  var suf=h>=12?"PM":"AM"; h=h%12; if(h===0) h=12;
  return h+":"+mi+" "+suf;
}
function textoCuando(av){
  var p=[];
  if(av.fecha) p.push(fechaBonita(av.fecha));
  if(av.hora) p.push("a las "+horaBonita(av.hora));
  if(av.cada) p.push(av.cada);
  return p.join(" · ");
}
/* ===== SISTEMA DE RECORDATORIOS DE UNA TAREA (Salvador 2026-09-18) =========
   El relojito de la barra: gris = sin aviso, ámbar = programado, rojo = sonando.
   Al picarlo abre la hoja "Recordatorios de esta tarea": el que suena arriba con
   Posponer 1 h / Eliminar, los programados abajo con su bote de basura, y
   Agregar recordatorio. Un recordatorio suelto ES su propio aviso; una tarea trae
   sus avisos insertados en t.avisos[]. */
function nowHM(){var d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
function avisosDe(t){
  var out=[];
  /* Salvador 2026-09-24: una tarea/recordatorio ya cerrado no tiene avisos vivos
     (antes "Eliminar" en SONANDO AHORA cerraba la tarea pero la tarjeta seguia ahi). */
  if(t.cierre || t.estado==="cerrada") return out;
  var sinA=t.sin_alarma && t.sin_alarma.f===(t.f_vigente||"") && t.sin_alarma.h===(t.aviso_hora||"");
  /* build 170: si se guardo sin ritmo (antes del arreglo), se recupera de lo que se dicto */
  if(t.es_recordatorio && !sinA) out.push({id:"self", self:true, texto:t.nombre, fecha:t.f_vigente||"", hora:t.aviso_hora||"", cada:t.aviso_cada||normalizaCada(cadaDicho(t.aviso_dicho||""))});
  (t.avisos||[]).forEach(function(a){ out.push({id:String(a.ts), texto:a.texto||"", fecha:a.fecha||"", hora:a.hora||"", cada:a.cada||normalizaCada(cadaDicho(a.dicho||"")), fin:a.fin||""}); });
  return out;
}
function avisoVence(a){
  if(!a.fecha||!/^\d{4}-\d{2}-\d{2}$/.test(a.fecha)) return false;
  if(a.fecha<hoy()) return true;
  if(a.fecha===hoy()) return !a.hora || a.hora<=nowHM();
  return false;
}
function avisoSonando(t){
  var av=avisosDe(t); if(!av.length) return null;
  if(window.__avSonando && window.__avSonando.taskId===t.id){
    var m=av.filter(function(a){return a.id===String(window.__avSonando.id)})[0]; if(m) return m;
  }
  var venc=av.filter(avisoVence); return venc.length?venc[0]:null;
}
function estadoRelojito(t){
  if(!avisosDe(t).length) return "gris";
  return avisoSonando(t)?"roj":"amb";
}
/* REPETICIÓN NORMALIZADA a un código fijo para que el servidor no adivine
   (Salvador 2026-09-18). Texto libre dictado -> DIARIO·LV·SEMANAL·QUINCENAL·MENSUAL·"" */
function normalizaCada(c){ c=String(c||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  if(!c.trim()) return "";
  if(["DIARIO","LV","SEMANAL","QUINCENAL","MENSUAL"].indexOf(String(c).toUpperCase())>=0) return String(c).toUpperCase();
  if(/l\s*-?\s*v|lunes a viernes|entre semana|habil/.test(c)) return "LV";
  if(/quincen|cada 15|15 dias|dos semanas/.test(c)) return "QUINCENAL";
  if(/diario|cada dia|todos los dias|cada d[ií]a/.test(c)) return "DIARIO";
  if(/mensual|cada mes|al mes/.test(c)) return "MENSUAL";
  if(/semanal|cada semana|por semana/.test(c)) return "SEMANAL";
  /* build 169 (Josue 2-oct): "cada lunes", "los martes", "todos los jueves" = SEMANAL (antes se iba vacio) */
  if(/(cada|los|todos los)\s+(lunes|martes|miercoles|jueves|viernes|sabados?|domingos?)/.test(c)) return "SEMANAL";
  return "";
}
function nombraCada(c){ var cod=normalizaCada(c);
  if(cod==="DIARIO") return "Todos los días";
  if(cod==="LV") return "Todos los días L–V";
  if(cod==="QUINCENAL") return "Cada 15 días";
  if(cod==="SEMANAL") return "Cada semana";
  if(cod==="MENSUAL") return "Cada mes";
  return c?conMayuscula(String(c)):"";
}
/* ===== ESPEJO EN bitacora_avisos (Salvador 2026-09-18) =====================
   La app escribe cada aviso ACTIVO como un documento plano en la colección
   bitacora_avisos, para que el cron de Josué lea UNA sola lista lista para
   disparar, sin escarbar dentro de cada tarea. Se sincroniza en cada cambio. */
var COLAV="bitacora_avisos";
function claveAviso(t, a){ return a.self ? t.id : (t.id+"|"+a.id); }
function escribeAvisoEspejo(t, a){
  var key=claveAviso(t,a);
  /* sin Firestore (motor MySQL) el espejo no se escribe, pero el aviso SÍ va al servidor de push */
  if(!db){ avisoAlServidor(t, a, key); return; }
  var doc={ id:key, tarea:t.id, aviso_ts:(a.self?"self":a.id), owner:(t.duenio||yo),
    texto:(a.texto||t.nombre||""), fecha:(a.fecha||""), hora:(a.hora||""),
    cada:normalizaCada(a.cada), deep:key, activo:true, actualizado:Date.now() };
  /* build 263: antes cada guardado reescribía el documento con avisado_en:null y el servidor volvía a disparar el aviso en cada barrido (~15 min).
     Ahora se escribe con merge y avisado_en SOLO se pone en null cuando el aviso cambió de verdad (otra fecha, hora, texto o repetición). */
  var _sg=sigAviso({texto:doc.texto, cuando:doc.fecha+" "+doc.hora, cada:doc.cada, f_fin:"", usuario:doc.owner}), _mm=memAv(), _k="esp:"+key;
  if(!_mm[_k] || _mm[_k].sig!==_sg){ doc.avisado_en=null; _mm[_k]={sig:_sg, ts:Date.now()}; guardaMemAv(); }
  try{ db.collection(COLAV).doc(key).set(doc,{merge:true}); }catch(e){}
  avisoAlServidor(t, a, key);
}
function borraAvisoEspejo(key){ if(!key) return; if(db){ try{ db.collection(COLAV).doc(key).delete(); }catch(e){} }
  llamaPush("aviso_del", {id:key}); }
/* ===== LOS AVISOS AL SERVIDOR DE PUSH (Salvador 2026-09-23) =====
   Desde el 23-sep Josue cambio el servidor: barrido.php ya NO lee Firestore,
   lee la tabla avisos_push de MySQL, que solo se llena con push.php
   action=aviso_set. La app seguia escribiendo solo a Firestore, asi que NINGUN
   recordatorio nuevo sonaba. Contrato probado en vivo el 23-sep 16:33:
   {id, usuario, tarea, texto, cuando:"AAAA-MM-DD HH:MM:SS", cada?}; aviso_del {id}.
   Nunca se manda un aviso ya pasado (sonaria de golpe): si es recurrente se
   corre a su proxima vez; si no, se omite. */
/* Devuelve una promesa: true si el servidor lo confirmó, false si no. Un aviso_set / aviso_del que falla (sin red,
   servidor caído, tope) queda anotado en este teléfono (AVISOS_FALLIDOS_K, el último por id) y se reintenta al arrancar,
   al volver la red y cada AVISOS_REINTENTO_MS; antes se daba por mandado y no se volvía a intentar en 20 h. */
var AVISOS_FALLIDOS_K="doit_avisos_fallidos", AVISOS_REINTENTO_MS=600000;
function avisosFallidos(){ var m={}; try{ m=JSON.parse(localStorage.getItem(AVISOS_FALLIDOS_K)||"{}")||{}; }catch(e){ m={}; } return (m && typeof m==="object")?m:{}; }
function grabaAvisosFallidos(m){ try{ if(Object.keys(m).length) localStorage.setItem(AVISOS_FALLIDOS_K, JSON.stringify(m)); else localStorage.removeItem(AVISOS_FALLIDOS_K); }catch(e){} }
function llamaPush(accion, cuerpo){
  if(typeof APP_TOKEN==="undefined" || String(APP_TOKEN).indexOf("__")===0) return Promise.resolve(false);
  var id=(accion==="aviso_set" || accion==="aviso_del") && cuerpo && cuerpo.id ? String(cuerpo.id) : "", t0=Date.now();
  var mal=function(m){ fallaPush(accion+": "+m);
    if(id){ var f=avisosFallidos(), ya=f[id]; if(!(ya && +ya.ts>t0)){ f[id]={accion:accion, cuerpo:cuerpo, ts:t0, n:(ya && ya.accion===accion ? (+ya.n||0) : 0)+1}; grabaAvisosFallidos(f); } }
    return false; };
  try{
    return llamaServidor(PUSH+"?action="+accion,{method:"POST", keepalive:true,
      headers:{"content-type":"application/json","x-app-token":APP_TOKEN},
      body:JSON.stringify(cuerpo)})
    .then(function(r){ return r.json().catch(function(){return {}}).then(function(j){
      if(!r.ok || (j&&j.error)) return mal((j&&j.error)||("HTTP "+r.status));
      if(id){ var f=avisosFallidos(); if(f[id] && +f[id].ts<=t0){ delete f[id]; grabaAvisosFallidos(f); } }
      return true; }); })
    .catch(function(e){ return mal((e&&e.message)||"sin red"); });
  }catch(e){ return Promise.resolve(mal(e.message)); }
}
/* reintenta lo que no llegó; un aviso único ya pasado no se manda (sonaría de golpe) */
function reintentaAvisosFallidos(){
  var f=avisosFallidos(), ids=Object.keys(f); if(!ids.length) return Promise.resolve(0);
  if(window.__reintAvisos) return window.__reintAvisos;
  var ahora=hoy()+" "+nowHM()+":00", pasados=[];
  window.__reintAvisos=ids.reduce(function(p, id){ return p.then(function(){
    var x=f[id]; if(!x || !x.cuerpo) return;
    if(x.accion==="aviso_set" && !x.cuerpo.cada && String(x.cuerpo.cuando||"")<=ahora){ pasados.push([id, x.ts]); return; }
    return Promise.resolve(llamaPush(x.accion, x.cuerpo)).then(function(ok){
      if(ok && x.accion==="aviso_set"){ var mm=memAv(); mm[id]={sig:sigAviso(x.cuerpo), ts:Date.now()}; guardaMemAv(); } }); }); }, Promise.resolve())
    .then(function(){ if(pasados.length){ var g=avisosFallidos(); pasados.forEach(function(p){ if(g[p[0]] && g[p[0]].ts===p[1]) delete g[p[0]]; }); grabaAvisosFallidos(g); }
      window.__reintAvisos=null; return Object.keys(avisosFallidos()).length; }, function(){ window.__reintAvisos=null; return -1; });
  return window.__reintAvisos;
}
try{ window.addEventListener("online", function(){ try{ reintentaAvisosFallidos(); }catch(e){} }); }catch(e){}
function fallaPush(m){
  window.__fallasPush=(window.__fallasPush||[]); window.__fallasPush.push(m);
  try{ console.error("push", m); }catch(_e){}
  if(!window.__fallaPushAvisada){ window.__fallaPushAvisada=true;
    toast("No pude programar el aviso en el servidor: "+String(m).slice(0,70)); }
}
function sumaDias(f,n){ return dmDe(f,n); }
function proximaVez(fecha, hora, cada){
  var ahora=hoy()+" "+nowHM();
  if(fecha+" "+hora > ahora) return fecha;
  if(!cada) return "";
  var f=fecha, g=0;
  while(f+" "+hora <= ahora && g<400){ g++;
    if(cada==="DIARIO") f=sumaDias(f,1);
    else if(cada==="LV"){ f=sumaDias(f,1); var dw=new Date(f+"T00:00:00").getDay(); while(dw===0||dw===6){ f=sumaDias(f,1); dw=new Date(f+"T00:00:00").getDay(); } }
    else if(cada==="SEMANAL") f=sumaDias(f,7);
    else if(cada==="QUINCENAL") f=sumaDias(f,14);
    else if(cada==="MENSUAL"){ f=masMeses(f,1); }   /* build 190: antes setMonth: 31-ene + 1 mes = 3-mar */
    else return "";
  }
  return f;
}
function avisoAlServidor(t, a, key){
  if(!a || !a.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(a.fecha) || !/^\d{2}:\d{2}$/.test(a.hora||"")) return;
  var cada=normalizaCada(a.cada), f=proximaVez(a.fecha, a.hora, cada), kk=key||claveAviso(t,a), mm=memAv();
  /* build 263: a Salvador no le llegan los recordatorios de "revisar avance" de lo que lleva Claude; y solo suena lo que permite su tablero de Notificaciones */
  var prohibido=false; try{ prohibido=avisoEsDeClaude(t, a) || !notifPermite(t.duenio||yo, "recordatorio"); }catch(e){}
  if(prohibido){ if(mm[kk]){ delete mm[kk]; guardaMemAv(); llamaPush("aviso_del", {id:kk}); } return; }
  if(!f) return;
  var cuerpo={id:kk, usuario:(t.duenio||yo), tarea:t.id,
    texto:String(a.texto||t.nombre||"Recordatorio").slice(0,180), cuando:f+" "+a.hora+":00", tipo:"recordatorio", repite_max:1,
    tag:"rec:"+t.id+":"+(a.self?"self":a.id)};   /* build 268: tag estable del aviso */   /* 263: una vez, y como mucho 1 más al día siguiente */
  if(cada){
    cuerpo.cada=cada;
    /* build 169 (contrato con Josue 2-oct): f_fin AAAA-MM-DD o "sin_fin". El servidor deja de repetir despues de esa fecha. */
    var fin=String(a.fin||t.f_fin||"").trim();
    if(/^\d{4}-\d{2}-\d{2}$/.test(fin)){ if(f>fin) return; cuerpo.f_fin=fin; }
    else cuerpo.f_fin="sin_fin";
  }
  /* build 263: el mismo aviso no se vuelve a mandar en cada guardado ni en cada arranque: solo si cambió o pasó un día (para sanar el servidor) */
  var sg=sigAviso(cuerpo), ya=mm[kk];
  if(ya && ya.sig===sg && Date.now()-(+ya.ts||0)<20*3600000) return;
  /* se da por mandado SOLO cuando el servidor lo confirma; mientras va en camino no se manda otra vez */
  var vuelo=window.__avisoEnVuelo||(window.__avisoEnVuelo={}); if(vuelo[kk]===sg) return; vuelo[kk]=sg;
  return Promise.resolve(llamaPush("aviso_set", cuerpo)).then(function(ok){
    if(vuelo[kk]===sg) delete vuelo[kk];
    if(ok){ var m2=memAv(); m2[kk]={sig:sg, ts:Date.now()}; guardaMemAv(); }
    return ok; });
}
/* una vez por arranque: sube los avisos FUTUROS de mis tareas vivas, para los
   que se crearon antes de este arreglo y nunca llegaron al servidor */
function subeAvisosPendientes(){
  if(window.__avisosSubidos) return; window.__avisosSubidos=true;
  (tareas||[]).forEach(function(t){
    if(!t || t.cierre || estadoReal(t)==="cerrada" || (t.duenio||"")!==yo) return;
    avisosDe(t).forEach(function(a){ avisoAlServidor(t, a, claveAviso(t,a)); });
  });
}
function sincronizaAvisos(t){
  if(!t) return;   /* también sin Firestore: en MySQL los avisos igual van a push.php */
  var cerr=!!(t.cierre) || !!t.fusionada_en || estadoReal(t)==="cerrada" || esDormida(t);   /* build 155: una fusionada no suena */
  var av=cerr?[]:avisosDe(t);
  var ahora=av.map(function(a){ return claveAviso(t,a); });
  /* Salvador 2026-09-24: al cerrar o quitar la alarma se borra en el servidor
     TODA clave posible (la propia y las insertadas), no solo las anotadas en
     avisos_espejo -- las tareas viejas no traian esa lista y el servidor les
     seguia mandando push (caso "Prueba de push numero cuatro", 14:10). */
  var viejas=(t.avisos_espejo||[]).slice(); viejas.push(t.id);
  (t.avisos||[]).forEach(function(a){ viejas.push(t.id+"|"+a.ts); });
  viejas.filter(function(k,i){ return viejas.indexOf(k)===i; }).forEach(function(k){ if(ahora.indexOf(k)<0) borraAvisoEspejo(k); });
  av.forEach(function(a){ escribeAvisoEspejo(t,a); });
  t.avisos_espejo=ahora;
}
function textoRec(a){
  var p=[];
  if(a.cada) p.push(nombraCada(a.cada));
  else if(a.fecha && /^\d{4}-\d{2}-\d{2}$/.test(a.fecha)) p.push(fechaBonita(a.fecha));
  if(a.hora) p.push(horaBonita(a.hora));
  return p.join(" · ")||"sin hora fija";
}
function svgBote(){ return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M10 4h4M6 7l1 13h10l1-13"/><path d="M10 10.5v6M14 10.5v6"/></svg>'; }
/* arma {fecha,hora,cada} de una frase, con la misma matriz de hora inteligente */
function armaCuando(v){
  var _dia=diaDicho(v), _rel=relativoDicho(v), _hor=horaDicha(v)?horaValor(v):"", _vg=_hor?"":franjaVaga(v), _cada=cadaDicho(v);
  var f,h;
  if(_rel){ f=_rel.fecha; h=_rel.hora; }
  else if(_hor){ f=_dia||hoy(); h=horaCercana(f,_hor,v); }
  else if(_vg){ f=_dia||_vg.fecha; h=_vg.hora; }
  else if(_dia){ f=_dia; h="09:00"; }
  else { var _pf=proximaFranja(); f=_pf.fecha; h=_pf.hora; }
  return {fecha:f, hora:h, cada:_cada||""};
}
function vAvisosSheet(t){
  var son=avisoSonando(t), todos=avisosDe(t);
  var prog=todos.filter(function(a){ return !(son && a.id===son.id); });
  var h='<div class="avscrim" id="avscrim"></div><div class="avsheet"><div class="avgrab"></div>'+
    '<div class="avtit">Recordatorios de esta tarea</div>';
  if(son){
    var det=(son.texto && !son.self && son.texto!==t.nombre)?' — '+esc(son.texto):'';
    h+='<div class="avring"><div class="rl">'+ico("bell",16,1.9)+' Sonando ahora</div>'+
       '<div class="rw">'+esc(textoRec(son))+det+'</div>'+
       '<div class="rb"><button data-avpos="'+esc(son.id)+'">Posponer 1 h</button>'+
       '<button class="del" data-avdel="'+esc(son.id)+'">Eliminar</button></div></div>';
  }
  if(prog.length){
    h+='<div class="avsub">Programados</div>';
    prog.forEach(function(a){
      var det=(a.texto && !a.self && a.texto!==t.nombre)?' — '+esc(a.texto):'';
      h+='<div class="avrow"><span class="ic">'+ico("reloj",19,1.8)+'</span>'+
         '<span class="tx" data-avedit="'+esc(a.id)+'">'+esc(textoRec(a))+det+'</span>'+
         '<button class="bs" data-avdel="'+esc(a.id)+'" aria-label="Eliminar">'+svgBote()+'</button></div>';
    });
  }
  if(!todos.length) h+='<div class="avempty">No hay recordatorios en esta tarea.</div>';
  /* Salvador 2026-09-23: abajo va LA BARRA DE SIEMPRE (+, caja, microfono), no
     un renglon "Agregar recordatorio". Tocar la caja, el + o el microfono cierra
     la hoja y deja la barra del hilo lista para dictar o escribir el aviso nuevo. */
  h+='<div class="pie avpie"><div class="caja2">'+
       '<button class="mas" id="avadd" aria-label="Agregar recordatorio">'+ico("mas",22,2)+'</button>'+
       '<div id="avtxt" class="caja vacia" role="textbox" data-ph="Dicta o escribe un recordatorio" data-avadd="1"></div>'+
       '<button class="mic" id="avmic" aria-label="Dictar recordatorio">'+ico("mic",26,1.7)+'</button>'+
     '</div></div></div>';
  return h;
}
/* borra un aviso (por id) de la tarea. "self" = el recordatorio suelto -> se cierra. */
function eliminaAvisoDe(t, id){
  /* Salvador 2026-09-24: quitar una alarma NO cambia de tarea ni la cierra.
     Se quita la alarma, sello de palomita, campana gris y "Deshacer" 5 s. */
  var av=avisosDe(t).filter(function(a){return a.id===String(id)})[0];
  var texto=av?textoRec(av):"";
  var restaurar;
  if(id==="self" && t.es_recordatorio){
    t.sin_alarma={f:t.f_vigente||"", h:t.aviso_hora||""}; guarda(t);
    restaurar=function(){ t.sin_alarma=null; guarda(t); sincronizaAvisos(t); };
  } else {
    var quitado=(t.avisos||[]).filter(function(a){return String(a.ts)===String(id)})[0];
    t.avisos=(t.avisos||[]).filter(function(a){return String(a.ts)!==String(id)}); guarda(t);
    restaurar=function(){ if(quitado){ t.avisos=(t.avisos||[]); t.avisos.push(quitado); } guarda(t); sincronizaAvisos(t); };
  }
  sincronizaAvisos(t);
  selloYQuedate(t,{tipo:"alarma", texto:texto, restaurar:restaurar});
}
/* posponer 1 hora: mueve el aviso a hoy + (ahora+1h), en punto. */
function posponeAvisoDe(t, id){
  /* build 141: ahora + 1 hora exacta; si cruza la medianoche, mañana */
  var d=new Date(Date.now()+60*60*1000);
  var hh=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"), f=iso(d);
  if(id==="self" && t.es_recordatorio){ t.f_vigente=f; t.aviso_hora=hh; t.sin_alarma=null; guarda(t); }
  else { var a=(t.avisos||[]).filter(function(x){return String(x.ts)===String(id)})[0];
         if(a){ a.fecha=f; a.hora=hh; a.avisado_en=null; guarda(t); } }
  sincronizaAvisos(t);
  window.__avSonando=null; window.__avSheet=null; toast("Pospuesto a las "+horaBonita(hh)); render();
}
/* crea el aviso dentro de la tarea y lo devuelve. NO navega, NO pinta fichita:
   sirve para insertar de una (loss-proof) y luego, si hace falta, preguntar. */
/* build 210: el aviso del MISMO dia (sin "cada") ya existe -> se reusa, no se duplica */
function avisoMismoDia(t, fecha){ return (t.avisos||[]).filter(function(a){ return a && a.fecha===fecha && !a.cada && !a.avisado_en; })[0]||null; }
function nuevoAviso(t, r){
  t.avisos=t.avisos||[];
  var ts=Date.now();
  while(t.avisos.some(function(a){ return a.ts===ts; })) ts++;
  var dichoR=r.dicho||r.texto||"";
  var av={ts:ts, texto:conMayuscula(r.texto||t.nombre),
          fecha:(r.fecha&&/^\d{4}-\d{2}-\d{2}$/.test(r.fecha))?r.fecha:"",
          hora:(r.hora||horaValor(dichoR)), cada:normalizaCada(cadaDicho(dichoR)||r.periodicidad||r.cada||""),
          dicho:dichoR, por:yo, creado:ts, avisado_en:null};
  t.avisos.push(av);
  return av;
}
function fichitaAviso(t, av){
  window.recienCreadas=(window.recienCreadas||[]);
  window.recienCreadas.unshift({id:t.id+"|"+av.ts, tipo:"aviso", taskId:t.id, ts:av.ts,
    nombre:"Lo inserté a “"+t.nombre+"”", fecha:(textoCuando(av)||"falta el día u hora")});
  if(window.recienCreadas.length>8) window.recienCreadas.length=8;
}
function insertaAviso(t, r, foto){
  if(!t) return;
  var av=nuevoAviso(t, r);
  var cuando=textoCuando(av);
  msg(t,"bi","Le insertaste un recordatorio: “"+av.texto+"”"+(cuando?" · "+cuando:"")+".");
  preguntaAmPm(t, [String(av.ts)], r.dicho||"");
  if(foto) pegaFotoA(t,foto);
  guarda(t); sincronizaAvisos(t);
  fichitaAviso(t, av);
  barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; secAbierta=null; render();
  toast("Insertado en “"+t.nombre+"”");
}
function desinsertaAviso(taskId, ts){
  var t=tareas.filter(function(x){return x.id===taskId})[0];
  if(t && t.avisos){
    t.avisos=t.avisos.filter(function(a){return String(a.ts)!==String(ts)});
    guarda(t); sincronizaAvisos(t);
  }
  window.recienCreadas=(window.recienCreadas||[]).filter(function(o){
    return !(o.tipo==="aviso" && o.taskId===taskId && String(o.ts)===String(ts)); });
  toast("Desinsertado"); render();
}
/* 1 tarea clara pero SIN cuándo: se inserta YA (nada se pierde) y luego se pide
   el cuándo para completarlo. Si abandona, el aviso queda guardado en la tarea. */
function preguntaCuandoInserta(t, r, foto){
  var av=nuevoAviso(t, r);
  msg(t,"bi","Le insertaste un recordatorio: “"+av.texto+"”. (falta el cuándo)");
  if(foto) pegaFotoA(t,foto);
  guarda(t);
  barraEstado={modo:"pregunta", insertaEn:t.id, avisoTs:av.ts, foto:null,
    titulo:"Recordatorio en “"+t.nombre+"”",
    pregunta:"¿Cuándo te aviso? Dime el día o la hora."};
  consulta=""; fotoEnMano=null; vista="barra"; secAbierta=null; render();
}
/* GUARDA EL RECORDATORIO DE UNA, ANTES DE PREGUNTAR NADA (Salvador 2026-09-17:
   la prioridad es que NADA se pierda). Si trae cuándo, nace como recordatorio
   suelto; si no, cae al bote de información pendiente. Devuelve su id y tipo.
   NO pinta fichita ni cambia barraEstado. */
function guardaRecordatorioSeguro(r, foto){
  if(r.fecha && /^\d{4}-\d{2}-\d{2}$/.test(r.fecha)){
    var t1=creaRecordatorio(r); if(foto) pegaFotoA(t1,foto);
    return {id:t1.id, tipo:"recordatorio"};
  }
  var t2=creaTarea({nombre:conMayuscula(r.texto||""), duenio:yo, fecha:"", dicho:r.dicho||"",
    pendiente_info:"¿Para cuándo? Dime el día o la hora.", pendiente_tipo:"fecha", falta_fecha:true});
  if(foto) pegaFotoA(t2,foto);
  return {id:t2.id, tipo:"bin"};
}
/* las tareas candidatas para ligar un recordatorio: abiertas, mias, no otro
   recordatorio, no la que se acaba de crear. */
/* CANDIDATAS PARA INSERTAR un recordatorio en una tarea. Aquí NO basta el parecido
   de FAMILIA como en el filtro de duplicados: un recordatorio se mete DENTRO de una
   tarea (a veces sin preguntar), así que se exige que compartan una PALABRA FUERTE
   de verdad — la misma raíz de una palabra con contenido, no una coincidencia de
   familia. Salvador 2026-09-17: "recuérdame ir a recoger a los niños" se pegó solo
   a "Limpiar el cuarto" porque "recoger" y "limpiar" caían en la familia de
   limpieza/recolección; no comparten ninguna palabra, así que ya no liga. */
function tareasParaLigar(texto){
  var pw=palabras(texto); if(!pw.length) return [];
  var pr=pw.map(raiz);
  return tareas.filter(function(t){
    if(t.es_recordatorio || t.cierre || estadoReal(t)==="cerrada" || t.pendiente_info) return false;
    if(t.duenio!==yo) return false;
    var tw=palabras([t.nombre,t.revisar,t.cierra].join(" ")); if(!tw.length) return false;
    var trr=tw.map(raiz), fuertes=0;
    pr.forEach(function(r){ if(trr.indexOf(r)>=0) fuertes++; });
    t.__lig=fuertes; return fuertes>=1;
  }).sort(function(a,b){ return (b.__lig||0)-(a.__lig||0); }).slice(0,4);
}
/* crea a medias y la manda al bote, abriendolo para contestar de una si se puede */
function creaIncompleta(d, pregunta, tipo, foto){
  /* CASO 3 de la matriz: HORA sin dia -> HOY. Se crea de una con su Deshacer. */
  if((tipo||"dato")==="fecha" && horaDicha(d.dicho)){
    d.fecha=hoy(); d.pendiente_info=""; d.pendiente_tipo=""; d.falta_fecha=false;
    var tc=creaTarea(d); if(foto) pegaFotoA(tc,foto);
    window.recienCreadas=(window.recienCreadas||[]);
    window.recienCreadas.unshift({id:tc.id,nombre:tc.nombre,tipo:"tarea",
      para:(tc.duenio!==yo?tc.duenio:null),
      fecha:(tc.f_vigente?("para el "+fechaBonita(tc.f_vigente)):"")});
    if(window.recienCreadas.length>8) window.recienCreadas.length=8;
    barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; secAbierta=null; render();
    return;
  }
  /* CASO 4: ni dia ni hora -> se guarda YA en el bote (nada se pierde) y se
     PREGUNTA en el momento, con el microfono listo, ligada a esa tarea. Si
     contesta se completa y sale del bote; si no (va manejando), queda guardada. */
  d.pendiente_info=pregunta||"Falta un dato";
  d.pendiente_tipo=tipo||"dato";
  d.falta_fecha = !(d.fecha && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha));
  var t=creaTarea(d);
  if(foto) pegaFotoA(t,foto);
  barraEstado={modo:"pregunta", dicho:d.dicho||"", pregunta:(pregunta||"Falta un dato"),
    titulo:(t.nombre||""), completandoId:t.id};
  consulta=""; fotoEnMano=null; vista="barra"; secAbierta=null; render();
}
/* borra de verdad (para Deshacer) */
function borraTarea(id){
  var i=tareas.map(function(t){return t.id}).indexOf(id);
  if(i>=0) tareas.splice(i,1);
  datosTareas.borrar(id);
}
function deshaceReciente(id){
  borraTarea(id);
  window.recienCreadas=(window.recienCreadas||[]).filter(function(o){return o.id!==id});
  toast("Deshecho"); render();
}
/* Deshacer de algo que SALIÓ del bote: no se borra, se REGRESA al bote pidiendo
   el dato otra vez (Salvador 2026-09-17). */
function descompletaReciente(id){
  var t=tareas.filter(function(x){return x.id===id})[0];
  if(t){ t.pendiente_info="¿Para cuándo? Dime el día o la hora."; t.pendiente_tipo="fecha";
    t.falta_fecha=true; t.aviso_hora=""; t.aviso_cada=""; guarda(t); }
  window.recienCreadas=(window.recienCreadas||[]).filter(function(o){return o.id!==id});
  toast("Regresó a información pendiente"); render();
}
/* contesta el dato que faltaba; si queda completa, sale del bote */
function completaPendiente(id, texto){
  var t=tareas.filter(function(x){return x.id===id})[0];
  if(!t){ barraEstado=null; vista="lista"; render(); return }
  barraEstado=null;
  texto=String(texto||"").trim();
  if(!texto){ vista="lista"; render(); return }
  /* build 150 (Salvador 2026-09-29): si contesta que YA SE HIZO ("ya lo mande", "ya lo
     envie", "ya quedo", "es para mi mismo y ya lo envie"), la tarea NO es una fecha
     pendiente: se anota lo que dijo y se CIERRA. Antes se quedaba pidiendo fecha. */
  if(/\bya\s+(?:se\s+|lo\s+|la\s+|los\s+|las\s+)*(?:envi|mand|hice|hizo|hic|termin|qued|resolv|contest|cumpl|pas[eé]|dej[eé])|\bya\s+est[aá](?:\s+hech[oa])?\b|\bya\s+lo\s+hic/i.test(texto.normalize("NFD").replace(/[\u0300-\u036f]/g,"")) && !(tienePasos(t) && pasosFaltan(t).length && !cierreExplicito(texto))){   /* build 259: con pasos sin palomear no se cierra sola */
    msg(t,"bi","Contestaste: “"+texto+"”.");
    t.pendiente_info=""; t.pendiente_tipo=""; t.falta_fecha=false;
    cierraHecha(t);
    toast("Cerrada: "+t.nombre); vista="lista"; render(); return;
  }
  var tipo=t.pendiente_tipo||"dato";
  if(tipo==="fecha"){
    var f=diaDicho(texto)||(/^\d{4}-\d{2}-\d{2}$/.test(texto)?texto:"");
    if(!f && horaDicha(texto)) f=hoy();   /* si contestó una hora, es HOY */
    if(!f){ msg(t,"bi",dudaFecha(texto)||("Anotado: “"+texto+"” (sin fecha todavía).")); guarda(t);   /* build 190: fecha en duda = la pregunta */
            toast(dudaFecha(texto)||'No pesqué la fecha, dímela otra vez (ej. "mañana", "el viernes" o una hora)');
            vista="lista"; render(); return; }
    t.f_original=f; t.f_vigente=f; t.falta_fecha=false;
    /* CAPTURA TAMBIÉN LA HORA Y LA RECURRENCIA (Salvador 2026-09-17): antes solo
       agarraba el día y tiraba la hora, así el "a las 6" se perdía y no quedaba
       alarma. Ahora se guarda para que el servidor la haga sonar a esa hora. */
    var _hc=horaCercana(f,horaValor(texto),texto), _cc=cadaDicho(texto);
    if(_hc) t.aviso_hora=_hc;
    if(_cc) t.aviso_cada=_cc;
    t.aviso_dicho=texto;
    msg(t,"bi","Le pusiste cuándo: "+fechaBonita(f)+(_hc?" a las "+horaBonita(_hc):"")+(_cc?" · "+_cc:"")+".");
  }else if(tipo==="fin"){
    var _n=texto.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    if(/sin\s+fin|indefinid|siempre|no\s+termina|no\s+tiene/.test(_n)){ t.f_fin="sin_fin"; msg(t,"bi","Sin fecha de finalización."); }
    else{
      var _ff=diaDicho(texto)||(/^\d{4}-\d{2}-\d{2}$/.test(texto)?texto:"");
      if(!_ff){ msg(t,"bi","Anotado: “"+texto+"” (sin fecha de fin todavía)."); guarda(t);
        toast('No pesqué la fecha de fin. Dime "hasta el 30 de noviembre" o "sin fin"'); vista="lista"; render(); return; }
      t.f_fin=_ff; msg(t,"bi","Se repite hasta el "+fechaBonita(_ff)+".");
    }
  }else if(tipo==="asunto"){
    /* recordatorio que nacio sin asunto (solo hora): ahora se le pone el nombre */
    t.nombre=conMayuscula(asuntoRecordatorio(texto,{nombre:texto})); msg(t,"bi","Queda: "+t.nombre+".");
  }else if(tipo==="monto"){
    t.gasto=texto; msg(t,"bi","Monto o tope: "+texto+".");
  }else{
    msg(t,"bi","El dato que faltaba: "+texto+".");
  }
  /* si todavia le falta la fecha, sigue en el bote pero ahora pidiendola */
  if(t.falta_fecha){
    t.pendiente_info="¿Para qué fecha? Dime el día."; t.pendiente_tipo="fecha";
    guarda(t); toast("Anotado. Ahora dime la fecha."); vista="lista"; render(); return;
  }
  t.pendiente_info=""; t.pendiente_tipo="";
  if(t.duenio && t.duenio!==yo && !t.es_recordatorio)
    disparaPushInstantaneo(t.duenio,'Nueva tarea asignada','Te asignaron: "'+t.nombre+'"',urlTarea(t.id));
  guarda(t);
  /* sube ARRIBA en "Recién creadas" para que se VEA lo que acaba de salir del bote,
     igual que las nuevas; a la siguiente entrada ya se acomoda en su lugar. El
     Deshacer aquí la regresa al bote, no la borra. Salvador 2026-09-17. */
  window.recienCreadas=(window.recienCreadas||[]);
  window.recienCreadas=window.recienCreadas.filter(function(o){return o.id!==t.id});
  window.recienCreadas.unshift({id:t.id, tipo:"completada", nombre:t.nombre,
    para:(t.duenio!==yo?t.duenio:null),
    fecha:("para el "+fechaBonita(t.f_vigente)+(t.aviso_hora?" a las "+horaBonita(t.aviso_hora):""))});
  if(window.recienCreadas.length>8) window.recienCreadas.length=8;
  toast("Listo: "+t.nombre+" · "+fechaBonita(t.f_vigente)+(t.aviso_hora?" a las "+horaBonita(t.aviso_hora):""));
  vista="lista"; render();
}
/* microfono de cada renglon del bote — mismo mecanismo robusto del hilo */
function paraDictadoCompleta(id){
  window.__oyendo=false; paraVigia();
  if(window.__silT){ clearTimeout(window.__silT); window.__silT=null }
  try{ if(window.__rec){ if(window.__rec.abort) window.__rec.abort(); else window.__rec.stop(); } }catch(e){}
  window.__rec=null;
  var b=document.getElementById("cm_"+id); if(b) b.classList.remove("oyendo");
  cierraDictado();
  var texto=((window.__dicho||"")+" "+(window.__parcial||"")).trim();
  window.__dicho=""; window.__parcial="";
  if(texto) completaPendiente(id, texto); else render();
}
function arrancaDictadoCompleta(btn,id){
  if(window.__oyendo){ paraDictadoCompleta(window.__compId||id); return }
  recargaMic();
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ toast("Este navegador no dicta: usa el micrófono del teclado"); return }
  var r; try{ r=new SR() }catch(e){ toast("No se pudo abrir el micrófono"); return }
  window.__rec=r; window.__oyendo=true; window.__compId=id; window.__dicho=""; window.__parcial="";
  r.lang="es-MX"; r.continuous=true; r.interimResults=true;
  btn.classList.add("oyendo");
  btn.innerHTML=ico("sube",22,2.2);   /* al grabar: la flechita de enviar, no el micrófono */
  abreDictado(function(){ paraDictadoCompleta(id) },
              function(){ window.__dicho=""; window.__parcial=""; paraDictadoCompleta(id); });
  function silencio(){ if(window.__silT){ clearTimeout(window.__silT); window.__silT=null; } }  /* sin auto-envío: solo manda el avioncito */
  r.onresult=function(ev){ if(window.__pausado) return;
    var interim=srJunta(ev).parcial;
    var ln=document.getElementById("cq_"+id);
    if(ln){ ln.textContent=(window.__dicho+interim).trim()||"Escuchando…"; }
    marcaVivo(); window.__parcial=interim; pintaDictado(); silencio();
  };
  r.onerror=function(ev){ var e=(ev&&ev.error)||"";
    if(e==="not-allowed"||e==="service-not-allowed"){ paraDictadoCompleta(id); avisoMicBloqueado() }
    else if(e==="network"){ paraDictadoCompleta(id); toast("El dictado necesita internet") } };
  enlazaRec(r, function(){ paraDictadoCompleta(id) });
  try{ r.start(); silencio() }catch(e){ paraDictadoCompleta(id); toast("No se pudo abrir el micrófono") }
}

/* ---------- LAS PANTALLAS DE LA BARRA ---------- */
function palomita(){ return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" '+
  'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'+
  '<path d="M5 12.8l4.6 4.6L19 7.4"/></svg>' }
function cruzRoja(){ return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" '+
  'stroke="#FF453A" stroke-width="2.4" stroke-linecap="round"><path d="M6.5 6.5 17.5 17.5"/>'+
  '<path d="M17.5 6.5 6.5 17.5"/></svg>'; }

function vBarra(){
  var b=barraEstado||{};
  if(b.modo==="pregunta") return vBarraPregunta(b);   /* ya trae su barra */
  if(b.modo==="escoge")   return vBarraEscoge(b)+barraPie();
  if(b.modo==="ligarec")  return vBarraLigaRec(b)+barraPie();
  if(b.modo==="confirmar") return vBarraConfirmar(b)+barraPie();
  /* Salvador 2026-09-22: la barra de abajo (microfono) va SIEMPRE, tambien en
     la pantalla de respuesta, para seguir preguntando sin regresar al home. */
  return vBarraTexto(b)+barraPie();   /* cargando y respuesta */
}
/* DE QUIÉN ES LO QUE SE ESTÁ CREANDO — Salvador 2026-09-04: arriba NO va la
   palabra "Claude" (nadie sabe qué es eso), va el NOMBRE de la persona a la que
   se le está creando: la tuya si es tuyo, o la del otro si es para alguien más. */
function paraQuien(b){
  b=b||{}; var p=b.pendiente||{}, k="";
  if(b.accion==="crear"||b.accion==="enviar") k=(p.tarea&&p.tarea.duenio);
  else if(b.accion==="encargar")   k=(p.encargo&&p.encargo.para)||b.para;
  else if(b.accion==="reasignar")  k=(p.reasignar&&p.reasignar.a);
  else if(b.accion==="paso")       k=(p.paso&&p.paso.quien);
  else if(b.accion==="supervisar") k=p.revisor;
  else if(b.accion==="comentar"){
    var tc=(p.comentar&&p.comentar.tareaId)
      ? tareas.filter(function(x){return x.id===p.comentar.tareaId})[0] : null;
    k=tc?tc.duenio:"";
  }
  else if(b.accion==="whatsapp") k=yo;
  if(!k) k=b.para||yo;
  return (PERSONAS[k]?PERSONAS[k].nombre:(PERSONAS[yo]?PERSONAS[yo].nombre:""));
}

/* Por si Claude no marcó los datos: se pescan del texto el teléfono y la web. */
function datosDelTexto(txt){
  var out=[], t=String(txt||"");
  var w=t.match(/\b(?:https?:\/\/|www\.)[^\s,;)]+|\b[a-z0-9][a-z0-9-]*\.(?:com|mx|org|net|es|io)(?:\.[a-z]{2})?\b(?:\/[^\s,;)]*)?/gi);
  if(w) w.slice(0,2).forEach(function(u){
    var esDoc=/(docs|drive|sheets)\.google\.com|\.pdf(\?|$)/i.test(u);
    out.push({tipo:esDoc?"documento":"web", que:esDoc?"Documento":"Página", valor:u});
  });
  var f=t.match(/\+?\d[\d\s().-]{8,}\d/g);
  if(f) f.slice(0,2).forEach(function(n){
    if((n.replace(/\D/g,"")||"").length>=8) out.push({tipo:"telefono",que:"Teléfono",valor:n.trim()});
  });
  return out;
}
/* Cada dato con lo que de verdad se hace con él: marcar, abrir, ver en el mapa,
   y siempre copiar. Salvador 2026-09-04: "que te los dé ya utilizables". */
function vDatos(datos){
  if(!datos||!datos.length) return "";
  return '<div class="datos">'+datos.map(function(d,i){
    var v=String(d.valor||"").trim(); if(!v) return "";
    var tipo=String(d.tipo||"texto").toLowerCase(), acc="", vis=v, sitio="";
    if(tipo==="telefono"){
      acc='<a class="dacc" href="tel:'+esc(v.replace(/[^\d+]/g,""))+'">Llamar</a>';
    }else if(tipo==="web"||tipo==="documento"){
      var url=/^https?:\/\//i.test(v)?v:("https://"+v);
      /* Una liga de Drive es larguísima e ilegible: se enseña el NOMBRE del
         documento y debajo nada más el sitio. Salvador 2026-09-04. */
      sitio=(url.match(/^https?:\/\/([^\/?#]+)/i)||[])[1]||"";
      sitio=sitio.replace(/^www\./i,"");
      var nom={"docs.google.com":"Documento de Drive","drive.google.com":"Archivo de Drive",
               "sheets.google.com":"Hoja de Drive"}[sitio.toLowerCase()];
      vis=(tipo==="documento"||v.length>34) ? (nom||sitio) : v;
      acc='<a class="dacc" href="'+esc(url)+'" target="_blank" rel="noopener">Abrir</a>';
    }else if(tipo==="direccion"){
      acc='<a class="dacc" href="https://maps.apple.com/?q='+encodeURIComponent(v)+
          '" target="_blank" rel="noopener">Mapa</a>';
    }
    return '<div class="dato"><div class="dinfo"><span class="dq">'+esc(d.que||"Dato")+'</span>'+
      '<span class="dv">'+esc(vis)+'</span></div>'+acc+
      '<button class="dcopy" data-cop="'+i+'">Copiar</button></div>';
  }).join("")+'</div>';
}

function vBarraTexto(b){
  /* En una CONSULTA, arriba va la TAREA de donde salió el dato (así se ve de
     dónde viene, no cae del cielo) y abajo el acceso a verla completa. */
  var org1=b.abrir ? tareas.filter(function(x){return x.id===b.abrir})[0] : null;
  var h=encabezado(org1?org1.nombre:paraQuien(b), b.dicho?("“"+b.dicho+"”"):"")+
    '<div class="scroll"><div class="rwrap"><div class="rtexto">'+
    esc(b.texto||"…").replace(/\n/g,"<br>")+'</div>';
  if(b.ops&&b.ops.length){
    h+='<div class="ropts">'+b.ops.map(function(o){
      return '<button class="op" data-bop="'+esc(o.k)+'">'+esc(o.t)+
        (o.d?'<br><span class="sm">'+esc(o.d)+'</span>':'')+'</button>';
    }).join("")+'</div>';
  }
  h+=vDatos(b.datos);
  h+='</div></div>';
  if(b.abrir) h+='<div class="cacc"><button class="cbtn" id="cabrir">'+
    (b.consulta?"Explorar la tarea completa":"Abrirla")+'</button></div>';
  return h;
}
function vBarraPregunta(b){
  return encabezado(paraQuien(b), b.dicho?("“"+b.dicho+"”"):"")+
    '<div class="scroll"><div class="qwrap">'+
      (b.titulo?'<div class="qtit">'+esc(b.titulo)+'</div>':'')+
      '<div class="qpreg">'+esc(b.pregunta||"").replace(/\n/g,"<br>")+'</div>'+
    '</div></div>'+
    barraPie(null, true);
}
/* Lista limpia para escoger cual tarea se revisa. Minimalista, igual que el home:
   titulo y subtitulo, nada mas. Salvador 2026-09-04. */
function vBarraEscoge(b){
  var h=encabezado(paraQuien(b), b.dicho?("“"+b.dicho+"”"):"");
  h+='<div class="scroll">'+
     '<div class="escq">'+esc(b.pregunta||"¿Tiene que ver con alguna de estas?")+'</div>'+
     (b.nota?'<div class="escs esn">'+esc(b.nota)+'</div>':'')+
     '<div class="escs">Se liga a esa tarea, aunque quieras revisar solo una parte o un paso.</div>'+
     '<ul class="list">';
  (b.ops||[]).forEach(function(id){
    var t=tareas.filter(function(x){return x.id===id})[0]; if(!t) return;
    var quien=(t.duenio&&PERSONAS[t.duenio])?PERSONAS[t.duenio].nombre:"";
    var est=t.cierre ? "ya cerrada"
          : (t.f_vigente?("para el "+fechaBonita(t.f_vigente)):"");
    var sub=[quien, est].filter(function(v){return v}).join(" · ");
    if(b.sv && b.sv.porque && b.sv.porque[id]) sub=b.sv.porque[id]+(est?" · "+est:"");   /* build 194: por que pego */
    h+='<li><button class="row" data-esc="'+id+'">'+
       '<span class="dot '+dotc(t)+'"></span><span>'+
       '<span class="nm">'+esc(t.nombre)+'</span>'+
       '<span class="ls">'+esc(sub)+'</span></span>'+
       '<span class="meta"><span class="vinc">'+((b.sv&&b.sv.__abrir)?'Abrir':'Vincular')+'</span></span></button></li>';
  });
  h+='</ul></div>'+
     /* MISMO PIE QUE LA PANTALLA DE CONFIRMAR: la acción a la izquierda y la
        tacha roja a su derecha, misma figura, mismo color, mismo lugar. */
     '<div class="cacc">'+
       ((b.sv&&b.sv.sinNueva)?'':'<button class="cbtn dos escn" data-esc="nueva"><span class="g">Ninguna</span>'+
       '<span class="c">crear tarea nueva</span></button>')+
       '<button class="ccancel" id="ccancel">'+cruzRoja()+'</button>'+
     '</div>';
  return h;
}

/* escoger a cuál tarea se le pega el recordatorio. Toques, sin micrófono: un sí
   o un no nunca pide dictar. Salvador 2026-09-17. */
function vBarraLigaRec(b){
  var rec=(b.pendrec&&b.pendrec.texto)||b.dicho||"";
  var h=encabezado("Tu recordatorio", rec?("“"+rec+"”"):"");
  h+='<div class="scroll">'+
     '<div class="escq">¿Es para avanzar una de estas tareas?</div>'+
     '<ul class="list">';
  (b.ops||[]).forEach(function(id){
    var t=tareas.filter(function(x){return x.id===id})[0]; if(!t) return;
    var quien=(t.duenio&&PERSONAS[t.duenio])?PERSONAS[t.duenio].nombre:"";
    var est=t.cierre?"ya cerrada":(t.f_vigente?("para el "+fechaBonita(t.f_vigente)):"");
    var sub=[quien, est].filter(function(v){return v}).join(" · ");
    h+='<li><button class="row" data-ligar="'+id+'">'+
       '<span class="dot '+dotc(t)+'"></span><span>'+
       '<span class="nm">'+esc(t.nombre)+'</span>'+
       '<span class="ls">'+esc(sub)+'</span></span>'+
       '<span class="meta"></span></button></li>';
  });
  h+='</ul></div>'+
     '<div class="cacc">'+
       '<button class="cbtn dos escn" data-ligar="aparte"><span class="g">Ninguna</span>'+
       '<span class="c">es un recordatorio aparte</span></button>'+
       '<button class="ccancel" id="ccancel">'+cruzRoja()+'</button>'+
     '</div>';
  return h;
}
function vBarraConfirmar(b){
  var rens=b.renglones||[];
  var h=encabezado(paraQuien(b),"")+
    '<div class="scroll"><div class="cbloque">'+
    rens.map(function(r){
      return '<div class="'+(r.k==="m"?"crmonto":"crdato")+'">'+esc(r.v)+'</div>';
    }).join("")+
    '</div></div>'+
    '<div class="cacc">'+botonAccion(b)+
    '<button class="ccancel" id="ccancel">'+cruzRoja()+'</button></div>';
  return h;
}
function botonAccion(b){
  var nom=(b.para&&PERSONAS[b.para])?PERSONAS[b.para].nombre:"";
  if(b.accion==="enviar")
    return '<button class="cbtn dos" id="cok"><span class="g">Para '+esc(nom)+'</span>'+
           '<span class="c">crear tarea</span></button>';
  if(b.accion==="encargar")
    return '<button class="cbtn dos" id="cok"><span class="g">Encargar a '+esc(nom)+'</span>'+
           '<span class="c">se mide en horas</span></button>';
  if(b.accion==="recordatorio")
    return '<button class="cbtn" id="cok">Guardar recordatorio</button>';
  if(b.accion==="reasignar")
    return '<button class="cbtn dos" id="cok"><span class="g">Pasar a '+esc(nom)+'</span>'+
           '<span class="c">cambia de dueño</span></button>';
  if(b.accion==="pasos_multi"){
    var _n145=(b.pendiente&&b.pendiente.pasos_multi&&b.pendiente.pasos_multi.partes||[]).length;
    return '<button class="cbtn dos" id="cok"><span class="g">Agregar '+_n145+' pasos</span>'+
           '<span class="c">a tu tarea</span></button>';
  }
  if(b.accion==="paso" && b.esRevision)
    return '<button class="cbtn dos" id="cok"><span class="g">Programar revisión</span>'+
           '<span class="c">queda en tu propia tarea</span></button>';
  if(b.accion==="paso")
    return nom
      ? '<button class="cbtn dos" id="cok"><span class="g">Paso para '+esc(nom)+'</span>'+
        '<span class="c">ligado a la tarea</span></button>'
      : '<button class="cbtn" id="cok">Guardar paso</button>';
  /* TODOS LOS BOTONES SON LA MISMA FIGURA, MISMO COLOR, MISMO LUGAR. Lo único
     que cambia es el NOMBRE (Salvador 2026-09-04): que nadie sienta que se
     cambió de pantalla. Los de revisión arrancan con "Programar revisión". */
  if(b.accion==="supervisar"){
    var q=b.pendiente&&b.pendiente.quien;
    var qn=(q&&PERSONAS[q])?PERSONAS[q].nombre:"";
    var rv=b.pendiente&&b.pendiente.revisor;
    if(rv && rv!==yo)
      return '<button class="cbtn dos" id="cok"><span class="g">Revisión para '+esc(PERSONAS[rv].nombre)+'</span>'+
             '<span class="c">'+(qn?"y la tarea para "+esc(qn):"le llega a él")+'</span></button>';
    return qn
      ? '<button class="cbtn dos" id="cok"><span class="g">Programar revisión</span>'+
        '<span class="c">y la tarea para '+esc(qn)+'</span></button>'
      : '<button class="cbtn" id="cok">Programar revisión</button>';
  }
  if(b.accion==="comentar")
    return '<button class="cbtn dos" id="cok"><span class="g">Comentar a '+esc(nom)+'</span>'+
           '<span class="c">solo le llega el aviso</span></button>';
  if(b.accion==="whatsapp"){
    var _wc=(b.pendiente&&b.pendiente.whatsapp&&b.pendiente.whatsapp.contacto)||"";
    return '<button class="cbtn dos" id="cok"><span class="g">Mandar WhatsApp a '+esc(_wc)+'</span>'+
           '<span class="c">desde tu número · la respuesta cae aquí</span></button>';
  }
  return '<button class="cbtn" id="cok">Crear tarea</button>';
}

function cancelaBarra(){
  if(window.__oyendo){ try{pararDictado(false)}catch(e){} }
  barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render();
}
function bindBarra(){
  var b=barraEstado||{};
  bindCaja2();   /* la barra de abajo es la misma que en el home */
  var bb=$("bback"); if(bb) bb.onclick=cancelaBarra;
  var cc=$("ccancel"); if(cc) cc.onclick=cancelaBarra;

  /* escoger cual tarea se revisa: al picar una se sigue con ella; "ninguna"
     manda a crear una nueva. En los dos casos se vuelve a entrar al mismo
     flujo de SUPERVISAR, ya sin ambiguedad. Salvador 2026-09-04. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-esc]"),function(el){
    el.onclick=function(){
      var k=el.getAttribute("data-esc"), sv=(b.sv||{});
      /* build 145: escoger a cual tarea pertenece un PASO suelto ("ya compre
         el camaron") -- se palomea directo, no se reentra a SUPERVISAR. */
      /* build 167: "abre X" -> abrir la que toco, o crear nueva con lo dicho */
      if(sv.__abrir){
        if(k==="nueva"){
          var nn=creaTarea({nombre:conMayuscula(sv.texto.slice(0,60)), dicho:b.dicho||sv.texto});
          abierta=nn.id; barraEstado=null; consulta=""; vista="hilo"; render(); toast("Tarea nueva creada"); return;
        }
        window.__porBusqueda=k; abierta=k; barraEstado=null; consulta=""; vista="hilo"; render(); return;
      }
      /* build 166: escoger en cual tarea va la lista */
      if(sv.__lista){
        var t166=tareas.filter(function(x){return x.id===k})[0];
        if(k==="nueva" || !t166){
          var nl=creaTarea({nombre:nombreLista(sv.texto), dicho:sv.texto, pasos:sv.items});
          abierta=nl.id; barraEstado=null; consulta=""; vista="hilo"; render(); return;
        }
        aplicaLista(t166, sv.items||[], sv.texto, sv.nombre); return;
      }
      if(sv.__paso){
        if(k==="nueva"){
          window.__saltaPaso=true; barraEstado=null; consulta=sv.texto; vista="lista"; render(); return;
        }
        var t145=tareas.filter(function(x){return x.id===k})[0];
        if(t145){
          var h145=palomeaPorTexto(t145, sv.texto);
          if(h145.length){
            msg(t145,"bo",sv.texto); msg(t145,"bi",respuestaPalomeo(t145,h145));
            t145.ultima=PERSONAS[yo].nombre+": "+sv.texto; guarda(t145);
          }
          abierta=t145.id; barraEstado=null; consulta=""; fotoEnMano=null; vista="hilo"; render(); return;
        }
        cancelaBarra(); return;
      }
      if(k==="nueva"){ sv.__nueva=true; sv.__yaId=null; }
      else { sv.__yaId=k; sv.__nueva=false; sv.__deLista=true; }
      aplicaIntencion({intencion:"SUPERVISAR",supervisar:sv}, b.dicho, b.hist||[], b.foto);
    };
  });

  /* ligar el recordatorio a una tarea (o dejarlo aparte). Toques, sin micrófono.
     El recordatorio YA está guardado (b.guardadoId): esto solo decide si se MUEVE
     a una tarea o se queda como está. Así nada se pierde ni se duplica. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-ligar]"),function(el){
    el.onclick=function(){
      var k=el.getAttribute("data-ligar"), r=(b.pendrec||{}), fo=b.foto||null;
      if(k==="aparte"){
        var g=tareas.filter(function(x){return x.id===b.guardadoId})[0];
        if(g && b.guardadoTipo==="bin"){
          /* le falta el cuándo: se abre su pregunta para completarlo de una */
          barraEstado={modo:"pregunta", dicho:"", pregunta:g.pendiente_info||"¿Para cuándo? Dime el día o la hora.",
            titulo:g.nombre, completandoId:g.id};
          vista="barra"; render(); return;
        }
        if(g){ window.recienCreadas=(window.recienCreadas||[]);
          window.recienCreadas.unshift({id:g.id, tipo:"recordatorio", nombre:g.nombre,
            fecha:(g.f_vigente?("te aviso el "+fechaBonita(g.f_vigente)):"")});
          if(window.recienCreadas.length>8) window.recienCreadas.length=8; }
        barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render();
        toast("Quedó como recordatorio aparte"); return;
      }
      var t=tareas.filter(function(x){return x.id===k})[0];
      if(!t){ cancelaBarra(); return; }
      /* MOVER: se borra el guardado suelto y se inserta en la tarea (sin duplicar) */
      if(b.guardadoId) borraTarea(b.guardadoId);
      var _rd=r.fecha && /^\d{4}-\d{2}-\d{2}$/.test(r.fecha);
      if(_rd) insertaAviso(t, r, fo); else preguntaCuandoInserta(t, r, fo);
    };
  });

  var ok=$("cok"); if(ok) ok.onclick=function(){ confirmaAccion(b); };
  /* copiar el dato al portapapeles, sin salir de la pantalla */
  Array.prototype.forEach.call(document.querySelectorAll("[data-cop]"),function(el){
    el.onclick=function(){
      var i=+el.getAttribute("data-cop");
      var d=((b.datos||[])[i]||{}).valor||"";
      function ok(){ el.textContent="Copiado"; el.classList.add("ok");
        setTimeout(function(){ el.textContent="Copiar"; el.classList.remove("ok") },1600); }
      try{
        if(navigator.clipboard&&navigator.clipboard.writeText)
          navigator.clipboard.writeText(d).then(ok,function(){ toast("No se pudo copiar") });
        else{
          var ta=document.createElement("textarea"); ta.value=d;
          ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta);
          ta.select(); document.execCommand("copy"); document.body.removeChild(ta); ok();
        }
      }catch(e){ toast("No se pudo copiar") }
    };
  });

  var ab=$("cabrir"); if(ab) ab.onclick=function(){
    abierta=b.abrir; barraEstado=null; vista="hilo"; render(); };

  Array.prototype.forEach.call(document.querySelectorAll("[data-bop]"),function(el){
    el.onclick=function(){
      var k=el.getAttribute("data-bop");
      if(k==="ver_mas_cerr"){ barraEnviar(b.dicho, true); return }
      if(k==="nada"){ cancelaBarra(); return }
      if(k==="aparte"){
        var d=(b.pendiente&&b.pendiente.tarea)||null;
        if(d){ var t=creaTarea(d); if(b.foto) pegaFotoA(t,b.foto); toast("Quedó aparte: “"+t.nombre+"”") }
        barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render(); return;
      }
      if(k==="sumar"){
        var v=(b.pendiente&&b.pendiente.vecina)||null;
        var dd=(b.pendiente&&b.pendiente.tarea)||null;
        if(v&&dd){
          msg(v,"bi","Se le sumó lo que dictaste: “"+(dd.dicho||dd.nombre)+"”.");
          v.censo_sumados=(v.censo_sumados||[]).concat([{texto:String(dd.dicho||dd.nombre||"").slice(0,300), ts:Date.now(), por:yo||"", propuso:"Claude (filtro de repetidas)"}]).slice(-30);
          v.ultima=dd.nombre; guarda(v); toast("Sumado a “"+v.nombre+"”");
        }
        cancelaBarra(); return;
      }
      /* REGLA (1): la tarea ya existía. Estas dos salidas la mueven en vez de duplicarla. */
      if(k==="reasignarE"){
        var p=b.pendiente||{}; var tt=tareas.filter(function(x){return x.id===p.existenteId})[0];
        if(tt&&p.target){ var r=transfiere(tt,p.target,""); if(r.ok){ toast("Ahora es de "+PERSONAS[p.target].nombre);
          abierta=tt.id; barraEstado=null; consulta=""; vista="hilo"; render(); return; } toast(r.msg||"No se pudo"); }
        cancelaBarra(); return;
      }
      if(k==="encargarE"){
        var p2=b.pendiente||{}; var tt2=tareas.filter(function(x){return x.id===p2.existenteId})[0];
        if(tt2&&p2.target){ creaEncargo(p2.target, tt2.nombre, tt2.id, tt2.f_vigente);
          toast("Le encargaste a "+PERSONAS[p2.target].nombre); }
        barraEstado=null; consulta=""; vista="lista"; render(); return;
      }
      cancelaBarra();
    };
  });
}
function confirmaAccion(b){
  if(b.accion==="crear" || b.accion==="enviar"){
    var d=b.pendiente.tarea; var t=creaTarea(d);
    if(b.foto) pegaFotoA(t,b.foto);
    toast(b.accion==="enviar" ? "Enviada a "+PERSONAS[t.duenio].nombre : "Tarea creada");
    /* AL HOME, no al hilo de la tarea recién creada (Salvador 2026-09-04):
       ahí salía el botón de "ya quedó / resuelto", que no tiene sentido en una
       tarea que acabas de crear. Desde el home entras a la que quieras. */
    barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render(); return;
  }
  if(b.accion==="supervisar"){
    var sv=b.pendiente.supervisar;
    var dela=b.pendiente.yaId ? tareas.filter(function(x){return x.id===b.pendiente.yaId})[0] : null;
    /* la tarea del que EJECUTA: solo si es del equipo y no existia ya */
    if(!dela && b.pendiente.quien && PERSONAS[b.pendiente.quien]){
      dela=creaTarea({nombre:sv.que, duenio:b.pendiente.quien, fecha:sv.fecha_ejecuta,
        revisar:sv.que, dicho:b.dicho});
    }
    /* MI revision: tarea mia, con semaforo, ligada a la de el */
    var quienRev=b.pendiente.revisor||yo;
    /* build 179 (Salvador 19:28): si la tarea del que ejecuta existe, NO se crea "Revisión · X":
       el revisor entra a la MISMA tarea con el papel REVISA (su lente, su semaforo, sus notas). */
    if(dela && PERSONAS[dela.duenio] && dela.duenio!==quienRev){
      dela.revisores=dela.revisores||[]; if(dela.revisores.indexOf(quienRev)<0) dela.revisores.push(quienRev);
      dela.rev_fecha=sv.mi_fecha||dela.f_vigente||hoy(); guarda(dela);
      if(quienRev===yo && !dela.medida) iniciaEntrevista(dela, yo);
      if(quienRev!==yo){ try{ disparaPushInstantaneo(quienRev,'Revisión asignada','Revisas: "'+(sv.que||dela.nombre)+'"',urlTarea(dela.id)); }catch(e){} }
      if(b.foto) pegaFotoA(dela,b.foto);
      toast(quienRev!==yo?"La revisión le llegó a "+PERSONAS[quienRev].nombre:"Le llegó a "+PERSONAS[dela.duenio].nombre+" · tú la revisas el "+fechaBonita(dela.rev_fecha));
      barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render(); return;
    }
    var rev=creaTarea({nombre:"Revisión · "+sv.que, duenio:quienRev, fecha:sv.mi_fecha,
      revisar:sv.que, dicho:b.dicho,
      revisa_a:(dela?dela.id:null),
      revisa_ext:(dela?"":(sv.externo||""))});

    // ===== INICIO SITUACIÓN 6: ASIGNACIÓN DE REVISIÓN =====
    if (quienRev && quienRev !== yo) {
      disparaPushInstantaneo(
        quienRev,
        'Revisión asignada',
        'Tienes pendiente la revisión de: "' + (sv.que || rev.nombre) + '"'
      );
    }
    // ===== FIN SITUACIÓN 6 =====

    /* Se enseña EN EL MOMENTO en que costó trabajo (tuvo que escoger de una
       lista) y solo si no habia dicho de quien era. Una linea, dentro del hilo,
       nada de letreros. Salvador 2026-09-04. */
    if(sv.__deLista && !PERSONAS[sv.de_quien] && dela && PERSONAS[dela.duenio])
      msg(rev,"bi","Tip: la próxima dime “"+sv.que+" de "+PERSONAS[dela.duenio].nombre+
          "” y te la encuentro de una, sin darte la lista.");
    if(b.foto) pegaFotoA(rev,b.foto);
    toast(quienRev!==yo
      ? "La revisión le llegó a "+PERSONAS[quienRev].nombre
      : ((dela&&dela.duenio!==yo)
          ? "Le llegó a "+PERSONAS[dela.duenio].nombre+" · tú la revisas el "+fechaBonita(sv.mi_fecha)
          : "Revisión guardada"));
    barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render(); return;
  }
  if(b.accion==="encargar"){
    var e=b.pendiente.encargo; creaEncargo(e.para, e.texto, null, null);
    toast("Le llegó a "+PERSONAS[e.para].nombre);
    barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render(); return;
  }
  if(b.accion==="recordatorio"){
    var r=b.pendiente.recordatorio; var rt=creaRecordatorio(r);
    if(b.foto) pegaFotoA(rt,b.foto);
    toast("Recordatorio guardado");
    barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render(); return;
  }
  if(b.accion==="reasignar"){
    var rp=b.pendiente.reasignar;
    var tt=tareas.filter(function(x){ return x.id===rp.id })[0];
    if(tt){
      var res=transfiere(tt, rp.a, rp.razon);
      if(!res.ok){ toast(res.msg||"No se pudo pasar"); }
      else{ toast("Ahora es de "+PERSONAS[rp.a].nombre); abierta=tt.id;
            barraEstado=null; consulta=""; vista="hilo"; render(); return; }
    }
    barraEstado=null; consulta=""; vista="lista"; render(); return;
  }
  if(b.accion==="whatsapp" && typeof enviaWhatsAppYa==="function"){ enviaWhatsAppYa(b); return; }
  if(b.accion==="whatsapp"){
    var wp=b.pendiente.whatsapp;
    var tw2=wp.tareaId ? tareas.filter(function(x){ return x.id===wp.tareaId })[0] : null;
    if(!tw2 && wp.nueva) tw2=creaTarea({nombre:wp.nueva, duenio:yo, dicho:b.dicho||wp.nueva});
    if(tw2){
      msg(tw2,"bi","WhatsApp a "+wp.contacto+": “"+_corto(wp.texto)+"” · en cola");
      if(b.foto) pegaFotoA(tw2,b.foto);
      tw2.ultima="WhatsApp a "+wp.contacto+": "+wp.texto; guarda(tw2);
      pideWhatsApp({usuario:yo, tarea_id:tw2.id, contacto:wp.contacto, texto:conIA(wp.texto)})
        .then(function(){ toast("WhatsApp en cola para "+wp.contacto); })
        .catch(function(e){
          msg(tw2,"bi","No se pudo dejar el WhatsApp en el servidor ("+String((e&&e.message)||e).slice(0,60)+"). Dictalo otra vez.");
          guarda(tw2); toast("No se pudo dejar el WhatsApp en el servidor"); if(vista==="hilo") render(); });
      barraEstado=null; consulta=""; fotoEnMano=null; abierta=tw2.id; vista="hilo"; render(); return;
    }
    barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render(); return;
  }
  if(b.accion==="comentar"){
    var cp=b.pendiente.comentar;
    var tc2=tareas.filter(function(x){ return x.id===cp.tareaId })[0];
    if(tc2){
      msg(tc2,"bo",PERSONAS[yo].nombre+": "+cp.texto);
      if(b.foto) pegaFotoA(tc2,b.foto);
      tc2.ultima=PERSONAS[yo].nombre+": "+cp.texto; guarda(tc2);
      
      // ===== INICIO SITUACIÓN 5 =====
      // Identifica si hay un creador del hilo diferente al dueño
      var creadorDelHilo = tc2.creador || tc2.duenio;
      var autor = (PERSONAS[yo] && PERSONAS[yo].nombre) || yo;

      // 1. Notifica al dueño (si no eres tú)
      if (tc2.duenio && tc2.duenio !== yo) {
        disparaPushInstantaneo(
          tc2.duenio,
          'Nuevo comentario',
          autor + ' comentó en "' + tc2.nombre + '": ' + cp.texto,
          urlTarea(tc2.id)
        );
      }

      // 2. Notifica al creador del hilo si es otra persona distinta del dueño y de ti
      if (creadorDelHilo && creadorDelHilo !== yo && creadorDelHilo !== tc2.duenio) {
        disparaPushInstantaneo(
          creadorDelHilo,
          'Respuesta a tu consulta',
          autor + ' respondió en "' + tc2.nombre + '": ' + cp.texto,
          urlTarea(tc2.id)
        );
      }
      // ===== FIN SITUACIÓN 5 =====

      toast("Comentario enviado a "+PERSONAS[tc2.duenio].nombre);
    }
    barraEstado=null; consulta=""; fotoEnMano=null; vista="lista"; render(); return;
  }
  if(b.accion==="pasos_multi"){
    var pm145=b.pendiente.pasos_multi;
    var tt145=tareas.filter(function(x){ return x.id===pm145.tareaId })[0];
    if(tt145){
      var _nv145=agregaPasos(tt145, pm145.partes.join(", "));
      msg(tt145,"bi", _nv145.length
        ? "Agregué "+juntaY(_nv145.map(pasoChico))+" a la lista."
        : "Esos pasos ya estaban en la lista.");
      tt145.ultima="Pasos: "+juntaY(pm145.partes); guarda(tt145);
      abierta=tt145.id; barraEstado=null; consulta=""; fotoEnMano=null; vista="hilo"; render(); return;
    }
    barraEstado=null; consulta=""; vista="lista"; render(); return;
  }
  if(b.accion==="paso"){
    var pp=b.pendiente.paso;
    var tt3=tareas.filter(function(x){ return x.id===pp.tareaId })[0];
    if(tt3){
      if(pp.quien && pp.quien!==yo){
        /* paso ejecutado por otro = encargo ligado a la tarea, con tiempo corto */
        creaEncargo(pp.quien, pp.texto, tt3.id, pp.cuando);
        toast("Paso ligado · le llegó a "+PERSONAS[pp.quien].nombre);
      }else{
        /* paso mío: queda como próximo paso anotado en la tarea */
        if(b.esRevision){
          msg(tt3,"bi","Listo: quedó programada tu revisión de “"+pp.texto+"” para el "+
              fechaBonita(pp.cuando)+", aquí en tu propia tarea.");
          toast("Revisión programada en “"+tt3.nombre+"”");
        }else{
          msg(tt3,"bi","Próximo paso: "+pp.texto+" · para el "+fechaBonita(pp.cuando)+".");
          toast("Paso anotado en “"+tt3.nombre+"”");
        }
        if(b.foto) pegaFotoA(tt3,b.foto);
        tt3.ultima=(b.esRevision?"Revisión: ":"Paso: ")+pp.texto; guarda(tt3);
      }
      abierta=tt3.id; barraEstado=null; consulta=""; fotoEnMano=null; vista="hilo"; render(); return;
    }
    barraEstado=null; consulta=""; vista="lista"; render(); return;
  }
  cancelaBarra();
}
