/* build 248: la pregunta "¿Quién es X?" (de la tarjeta o del modelo) no se hace si X ya se resuelve con los contactos de la tarea o la agenda */
function preguntaQuienYaResuelta(t, tx){
  var m=String(tx||"").match(/qui[eé]n\s+es\s+(?:el\s+|la\s+)?([^?¿]{2,60})\?/i); if(!m) return false;
  var r; try{ r=resuelvePersona(t, m[1].trim()); }catch(e){ return false; }
  return r.estado==="uno";
}
/* llegó la agenda: lo que quedó preguntado ("¿Quién es X?") y ya se resuelve, se aplica solo */
function reintentaDudas(){
  (tareas||[]).forEach(function(t){ if(!t || !(t.quien_dudas||[]).length) return;
    (t.quien_dudas||[]).slice().forEach(function(d){ var r; try{ r=resuelvePersona(t, d.dicho); }catch(e){ return; }
      if(r.estado==="uno"){ var h=""; try{ h=resuelveDudaPersona(t, d.id, r.persona); }catch(e){}
        _notaPriv(t,"bi","Ya sé quién es "+d.dicho+": "+r.persona.nombre+(h&&h!=="Listo"?" · "+h:"")+"."); guarda(t); } }); });
  try{ if(vista==="hilo") render(); }catch(e){}
}
/* deja la pregunta en la ficha. extra = lo necesario para aplicar al elegir */
function nuevaDudaPersona(t, dicho, rol, cands, extra){
  t.quien_dudas=(t.quien_dudas||[]).filter(function(d){ return !(d.rol===rol && _n179(d.dicho)===_n179(dicho)); });
  t.quien_dudas.push({id:"q"+Date.now().toString(36)+Math.floor(Math.random()*1e4), dicho:String(dicho).trim(), rol:rol,
    cands:(cands||[]).slice(0,40).map(function(c){ return {id:c.id, nombre:c.nombre, sub:c.sub||""}; }), extra:extra||{}, ts:Date.now()});
  return "¿Quién es "+String(dicho).trim()+"? Te dejé "+((cands||[]).length?"las opciones":"la pregunta")+" en la ficha.";
}
function asignaResponsable(t, persona, sup){
  if(typeof t.encargado==="string" && !PERSONAS[t.encargado]) t.encargado=null;   /* encargado mal guardado (texto suelto) */
  if(t.duenio && !PERSONAS[t.duenio]) t.duenio=yo;                                   /* dueño que no es de Doit: lo lleva quien supervisa */
  var k=persona.id.indexOf("ext:")===0?null:persona.id;
  if(k===yo) return "";
  if(k && PERSONAS[k]){
    if(k!==t.duenio){ if(!t.duenio) t.duenio=k; else transfiere(t, k, "lo dijo "+((PERSONAS[yo]||{}).nombre||"")+": es el responsable"); }
    if(sup){ t.revisores=t.revisores||[]; if(t.revisores.indexOf(yo)<0) t.revisores.push(yo); }
    return "responsable: "+PERSONAS[k].nombre+(sup?" · tú supervisas":"");
  }
  var canon=String(persona.nombre).trim();
  if(!t.duenio) t.duenio=yo;
  if(_nn(t.revisa_ext||"")===_nn(canon)) return "";
  t.revisa_ext=canon;
  t.wa_contactos=t.wa_contactos||[];
  if(!t.wa_contactos.some(function(c){ return _nn(String((c&&c.nombre)||c))===_nn(canon); })) t.wa_contactos.push({nombre:canon, desde:Date.now()});
  return "responsable: "+canon+(t.duenio===yo?" · tú supervisas":"");
}
function agregaCompartir(t, persona){
  var l=_compartirLista(t);
  if(l.some(function(c){ return c.id===persona.id || _n179(c.nombre)===_n179(persona.nombre); })) return "";
  l.push({id:persona.id, nombre:String(persona.nombre).trim()}); t.compartir_con=l;
  if(persona.id.indexOf("ext:")!==0 && PERSONAS[persona.id] && persona.id!==yo){ try{ agregaIntegrante(t, persona.id); }catch(e){} }
  return "se comparte con "+String(persona.nombre).trim();
}
/* responsable / "yo solo superviso" (y un "quien" que no es de Doit: nunca se suelta) + con quien se comparte */
function aplicaResponsable(t, v, j){
  j=j||{}; var s=_fsa(v), out=[], dud=[];
  var nom=String(j.responsable||"").replace(/\s+/g," ").trim();
  if(!nom && j.quien){ var qq=String(j.quien).trim(), pq=_nn(qq).split(/\s+/)[0];
    if(!Object.keys(PERSONAS).some(function(x){ return _nn(PERSONAS[x].nombre).split(/\s+/)[0]===pq; })) nom=qq; }
  if(nom && _dichoNombre(v, nom) && duenoDicho(v, nom)){   /* build 238: pedirle algo o que dé información NO la hace dueña/responsable */
    var sup=j.yo_superviso===true && /\b(supervis\w*|superviso|reviso|la reviso|lo reviso|revisor)\b/.test(s);
    var r=resuelvePersona(t, nom);
    if(r.estado==="uno"){ var h=asignaResponsable(t, r.persona, sup); if(h) out.push(h); }
    else dud.push(nuevaDudaPersona(t, nom, "responsable", r.cands, {sup:sup}));
  }
  if(Array.isArray(j.compartir_con) && j.compartir_con.length && /\b(compart\w*|av[ií]s\w*|que sepan|enterad\w*|copia|est[eé]n? (aqui|en esta tarea)|pueden estar)\b/.test(s)){
    j.compartir_con.slice(0,8).forEach(function(nm){ nm=String((nm&&nm.nombre)||nm||"").replace(/\s+/g," ").trim(); if(!nm || !_dichoNombre(v, nm)) return;
      var r2=resuelvePersona(t, nm);
      if(r2.estado==="uno"){ var h2=agregaCompartir(t, r2.persona); if(h2) out.push(h2); }
      else dud.push(nuevaDudaPersona(t, nm, "compartir", r2.cands, {})); });
  }
  t.__dudas221=(t.__dudas221||[]).concat(dud);
  return out.join(", ");
}
/* fechas de una frecuencia dicha ("lunes, miércoles y viernes", "diario"), del calendario, hasta 3 semanas */
function fechasDeCada(s){
  var cal=calendarioProximo(22).map(function(x){ return {f:x.slice(0,10), d:_nn(x.slice(11).replace(/\s*\(.*$/,""))}; });
  if(/\b(diario|diariamente|todos los dias|cada dia)\b/.test(s)) return cal.map(function(x){ return x.f; });
  var dias=(_DIARE.split("|")).filter(function(d){ return new RegExp("\\b"+d+"s?\\b").test(s); });
  if(!dias.length) return [];
  return cal.filter(function(x){ return dias.indexOf(x.d)>=0; }).map(function(x){ return x.f; });
}
var SEG_HORA_DEFECTO="10:00";
function programaSeguimiento(t, persona, pl){
  var k=persona.id.indexOf("ext:")===0?null:persona.id, canon=String(persona.nombre).trim();
  if(k && PERSONAS[k]){ var G=null; try{ G=contactosWA(t).filter(function(g){ return g.eq===k; })[0]; }catch(e){} canon=G?G.nombre:PERSONAS[k].nombre; }
  else canon=nombreWA(canon);   /* build 251: nombre exacto de WhatsApp */
  var corto=nombreCorto(canon), meta=String(pl.meta||"").trim();
  t.seg_a=Object.assign({}, t.seg_a||{}, {contacto:canon, meta:meta||((t.seg_a||{}).meta||""), dicho:String(pl.dicho||"").slice(0,400), ts:Date.now()});
  t.wa_contactos=t.wa_contactos||[];
  if(!t.wa_contactos.some(function(c){ return _nn(String((c&&c.nombre)||c))===_nn(canon); })) t.wa_contactos.push({nombre:canon, desde:Date.now()});
  var base="seguimiento a "+corto+(meta?" ("+meta+")":"");
  if(!pl.cadaOk){ t.seg_a.cada=t.seg_a.cada||""; t.seg_a.hora=t.seg_a.hora||""; }
  if(!pl.cadaOk) return {hecho:base, duda:"¿Cada cuándo y a qué hora le doy seguimiento a "+corto+"?"};
  var hora=pl.hora||SEG_HORA_DEFECTO, defecto=!pl.hora;
  t.seg_a.cada=String(pl.cada||"").trim().slice(0,80); t.seg_a.hora=hora; t.seg_a.hora_defecto=defecto;
  var cal=calendarioProximo(22).map(function(x){ return x.slice(0,10); }), ahora=Date.now();
  var fechas=(pl.fechas||[]).map(String).filter(function(f,i,a){ return cal.indexOf(f)>=0 && a.indexOf(f)===i; });
  if(!fechas.length) fechas=pl.local||[];
  fechas=fechas.filter(function(f){ return _tsDe(f,hora)>ahora; }).sort().slice(0,10);
  if(!fechas.length) return {hecho:base+" · "+t.seg_a.cada, duda:"¿Qué días le doy seguimiento a "+corto+"?"};
  var ya=(t.msgs||[]).filter(function(m){ return m && m.prog && !m.prog.cancelado && _nn(m.prog.contacto||"")===_nn(canon); }).map(function(m){ return m.prog.a_las?m.prog.a_las.fecha+" "+m.prog.a_las.hora:""; });
  var MS=armaMensajesSeguimiento(corto, fechas, hora, pl, meta, t), extras=[];   /* build 248: por pasos, nunca N textos iguales */
  var nuevas=fechas.filter(function(f){ return ya.indexOf(f+" "+hora)<0; });
  nuevas.forEach(function(f){ mandaProgramado(t, {contacto:canon, a_las:{fecha:f, hora:hora}, sino_desde:null, texto:MS[f].texto}, null);
    (MS[f].extra||[]).forEach(function(e){ if(_tsDe(e.fecha,e.hora)>ahora && ya.indexOf(e.fecha+" "+e.hora)<0){ mandaProgramado(t, {contacto:canon, a_las:{fecha:e.fecha, hora:e.hora}, sino_desde:null, texto:e.texto}, null); extras.push(e); } }); });
  t.seg_a.programados=fechas.map(function(f){ return f+" "+hora; }).concat(extras.map(function(e){ return e.fecha+" "+e.hora; }));
  var rt="Seguimiento a "+corto+": "+(t.seg_a.cada||"según lo dictado")+" a las "+hora;
  if(!String(t.ritmo||"").trim() || /^Seguimiento a /.test(t.ritmo)) t.ritmo=rt;
  var _nt=nuevas.length+extras.length;
  return {hecho:base+": "+_nt+" WhatsApp programado"+(_nt===1?"":"s")+" ("+fechas.map(fechaMovCorta).join(", ")+" "+hora+(extras.length?" y a las "+extras[0].hora+" el del plazo":"")+")"+(defecto?" · a las "+hora+" porque no dijiste hora":"")};
}
/* build 248 (Vestidores): los pasos dictados, en orden: [{tx, fecha, hora}]. Fecha solo del calendario o dictada; hora solo si se dijo */
function pasosSeguimiento(v, sa){
  var cal=calendarioProximo(40).map(function(x){ return x.slice(0,10); }), dich=fechaDictada(v).todas;
  return (Array.isArray(sa&&sa.pasos)?sa.pasos:[]).slice(0,6).map(function(p){
    if(typeof p==="string") p={tx:p};
    var tx=String((p&&(p.tx||p.paso))||"").replace(/\s+/g," ").trim().slice(0,160); if(tx.length<3) return null;
    var f=String((p&&p.fecha)||"").trim(); f=(_fReal(f) && (cal.indexOf(f)>=0 || dich.indexOf(f)>=0))?f:"";
    var h=String((p&&p.hora)||"").trim(), mh=h.match(/^(\d{1,2}):(\d{2})$/); h=(mh && horaDicha(v))?String(+mh[1]).padStart(2,"0")+":"+mh[2]:"";
    return {tx:tx, fecha:f, hora:h}; }).filter(Boolean);
}
/* cada WhatsApp programado sigue los pasos, en orden; nunca el mismo texto en todos. Regresa {fecha: {texto, extra:[{fecha,hora,texto}]}} */
function armaMensajesSeguimiento(corto, fechas, hora, pl, meta, t){
  var n1=String(corto||"").split(/\s+/)[0]||"", P=(pl&&pl.pasos)||[], out={}, usados={}, tema=meta||(t&&t.nombre)||"el tema";
  var VAR=["¿qué avance hay con TEMA desde ayer?","¿ya hay algo concreto de TEMA? Cuéntame en qué vas.","¿cómo va TEMA? Si algo se atoró, dime y lo movemos.","paso a ver cómo va TEMA: ¿qué ya quedó y qué falta?","¿me das un avance de TEMA?"];
  fechas.forEach(function(f, k){
    var tx="", extra=[];
    if(!P.length){
      tx=(k===0 && String((pl&&pl.texto)||"").trim()) ? String(pl.texto).replace(/\s+/g," ").trim() : "Hola "+n1+", "+(k===0?"¿cómo vas con TEMA?":VAR[(k-1)%VAR.length]).replace("TEMA", tema);
    } else {
      var idx=Math.min(k, P.length-1), st=P[idx], rep=Math.max(0, k-(P.length-1));
      var plazo=function(){ if(!st.fecha) return ""; var d=Math.round((new Date(st.fecha+"T00:00:00")-new Date(f+"T00:00:00"))/86400000);
        return d>0?"Faltan "+d+" día"+(d===1?"":"s")+" para el "+fechaMovCorta(st.fecha)+".":(d===0?"El plazo es hoy.":"El plazo era el "+fechaMovCorta(st.fecha)+"."); };
      if(k===0){
        tx="Hola "+n1+", lo primero de hoy: "+st.tx+"."+(st.hora?" Necesito que me lo pases a las "+st.hora+".":"")+" ¿Ya lo tienes?";
        if(st.hora && st.hora>hora) extra.push({fecha:f, hora:st.hora, texto:"IA: "+n1+", ya es la hora ("+st.hora+"): ¿me pasas "+st.tx+"?"});
      } else if(rep===0){
        tx="Hola "+n1+", sigue: "+st.tx+"."+(plazo()?" "+plazo():"")+" ¿Cómo vas? Cuéntame el estatus.";
      } else {
        tx="Hola "+n1+", sobre "+st.tx+": "+(plazo()?plazo()+" ¿Cómo van?":VAR[(rep-1)%VAR.length].replace("TEMA","eso"));
      }
    }
    tx="IA: "+String(tx).replace(/^IA:\s*/i,"");
    if(usados[_nn(tx)]) tx=tx.replace(/(\?|\.)?$/," ("+fechaMovCorta(f)+")$1");
    usados[_nn(tx)]=1; out[f]={texto:tx, extra:extra};
  });
  return out;
}
function aplicaSeguimientoA(t, v, j){
  var sa=j&&j.seguimiento_a; if(!sa || typeof sa!=="object") return {};
  var quien=String(sa.quien||"").replace(/\s+/g," ").trim(), s=_fsa(v);
  if(!quien || !_dichoNombre(v, quien) || !/\b(seguimiento|segu[ií]r(le|lo|la)|preg[uú]nt(ale|arle)|insist(ele|irle)|recu[eé]rd(ale|arle)|checa con|lata)\b/.test(s)) return {};
  var cadaOk=RITMO_RE.test(s) || new RegExp("\\b("+_DIARE+")s?\\b").test(s) || /\b(diario|diariamente|todos los dias|cada\s+(\d+|dos|tres|cuatro)\s+(horas|dias))\b/.test(s);
  var hora=String(sa.hora||"").trim(), mh=hora.match(/^(\d{1,2}):(\d{2})$/), horaOk=!!mh && horaDicha(v);
  var pl={meta:String(sa.meta||"").replace(/\s+/g," ").trim().slice(0,200), cada:cadaOk?String(sa.cada||"").trim():"", cadaOk:cadaOk,
    hora:horaOk?String(+mh[1]).padStart(2,"0")+":"+mh[2]:"", fechas:Array.isArray(sa.fechas)?sa.fechas:[], local:cadaOk?fechasDeCada(s):[],
    texto:String(sa.texto||""), dicho:String(v).slice(0,400), pasos:pasosSeguimiento(v, sa)};
  var r=personasPara(t, quien);
  if(r.estado!=="uno") return {hecho:"", duda:nuevaDudaPersona(t, quien, "seguimiento", r.cands, pl)};
  return programaSeguimiento(t, r.persona, pl);
}
/* Salvador eligio en la tarjeta "¿Quién es X?" (o escribio uno nuevo): se aplica lo que estaba esperando */
function resuelveDudaPersona(t, did, persona){
  var d=(t.quien_dudas||[]).filter(function(x){ return x.id===did; })[0]; if(!d || !persona || !String(persona.nombre||"").trim()) return "";
  t.quien_dudas=(t.quien_dudas||[]).filter(function(x){ return x.id!==did; });
  var h="", du="";
  if(d.rol==="mensaje"){   /* build 225: ya se sabe a quien: el borrador del mensaje */
    msg(t,"bi","Listo: "+String(persona.nombre).trim()+"."); var _lm=t.msgs[t.msgs.length-1]; _lm.canal="priv:"+yo; _lm.nota_claude=1;
    borradorMensaje(t, persona, d.extra||{}); guarda(t); return "Listo";
  }
  if(d.rol==="responsable") h=asignaResponsable(t, persona, !!(d.extra&&d.extra.sup));
  else if(d.rol==="compartir") h=agregaCompartir(t, persona);
  else if(d.rol==="seguimiento"){ var r=programaSeguimiento(t, persona, d.extra||{}); h=r.hecho||""; du=r.duda||""; }
  else if(d.rol==="quien_meta" || d.rol==="seguimiento_meta"){ var mm=metasDe(t).filter(function(x){ return x.id===(d.extra||{}).metaId; })[0];
    if(mm && d.rol==="quien_meta"){ mm.quien=String(persona.nombre).trim(); h="“"+metaCorta(mm)+"” la hace "+mm.quien; }
    else if(mm) h=programaSegMeta(t, mm, persona, d.extra||{}); }
  var tx=[h?"Anoté: "+h+".":"Listo: "+String(persona.nombre).trim()+".", du].filter(Boolean).join(" ");
  msg(t,"bi",tx); guarda(t);
  try{ if(d.rol==="seguimiento") sincronizaAvisos(t); }catch(e){}
  return tx;
}
/* ===== build 225 (Salvador 13:24): "ponle / mándale / escríbele un mensaje a X para <tema>" dentro de una tarea =====
   Antes: "ponle" no lo entendia nadie y "mándale un mensaje a X" se iba a la barra de inicio (barraEnviar): la tarea no
   guardaba NI lo dictado NI la respuesta, y si la IA no sacaba el texto preguntaba "¿qué le digo?". Ahora: lo dictado se
   guarda en la tarea (privado), el mensaje se ARMA con el resto ("para ver si ya tiene…" -> "Hola Fernando, ¿ya tiene…?")
   y sale una tarjeta para CONFIRMAR (Mandar / Cambiar / No). Si X no esta claro (no es de esta tarea y hay varios o
   ninguno), tarjeta "¿Quién es X?" con las coincidencias de Doit y de la agenda + "Otro / nuevo". Solo si no dijo nada
   mas se pregunta "¿Qué le digo a X?", y lo siguiente que dicte en la tarea es el mensaje. */
var MSJ_RE=/^\s*(?:(?:oye|ok|bueno|mira)\s+)?(?:(?:claude|clau|claus|cloud|claud|clod)\b[\s,:]*)?(?:(?:por\s+favor|porfa)\s*,?\s*)?(?:(?:p[oó]nle|m[aá]ndale|env[ií]ale|escr[ií]bele|d[eé]jale|p[aá]sale|preg[uú]ntale|ponme\s+en\s+contacto\s+con)\s+)(?:(?:un|una)\s+)?(?:(?:mensaje|mensajito|whats\s?app|whats|wasap|guasap|recado|texto)\s+)?(?:(?:por|de)\s+(?:whats\s?app|whats|wasap)\s+)?(?:a|al|a\s+la)\s+(.+)$/i;
var MSJ_CORTE=/^(?:para|que|si|diciendo(?:le)?|dici[eé]ndole|preguntando(?:le)?|pregunt[aá]ndole|sobre|acerca|por\s+lo|por\s+favor|porfa|y|de\s+que|a\s+ver\s+si|con)$/i;
function mensajeDicho(v){
  var m=String(v||"").replace(/\s+/g," ").match(MSJ_RE); if(!m) return null;
  var resto=m[1].replace(/^[\s,]+/,""), ws=resto.split(" "), nom=[], i=0;
  for(;i<ws.length && nom.length<3;i++){ var w=ws[i], wl=w.replace(/[,.;:!?]+$/,"");
    if(!wl || MSJ_CORTE.test(wl) || (nom.length && /^[a-záéíóúñ]/.test(wl) && !/^(de|del)$/i.test(wl))) break;
    nom.push(wl); if(/[,.;:!?]$/.test(w)){ i++; break; } }
  while(nom.length && /^(de|del)$/i.test(nom[nom.length-1])){ nom.pop(); i--; }
  if(!nom.length) return null;
  var cuerpo=ws.slice(i).join(" ").replace(/^[\s,.:;]+/,"").replace(/[\s,]*(?:por\s+favor|porfa|gracias)[\s.!]*$/i,"").trim();
  var pregunta=/^preg[uú]ntale/i.test(String(v).replace(/^.*?(preg[uú]ntale)/i,"$1"));
  return {quien:nom.join(" "), cuerpo:cuerpo, pregunta:pregunta};
}
function _minus1(x){ return x.charAt(0).toLowerCase()+x.slice(1); }
/* el resto de lo dictado -> el texto del mensaje (de usted: "ya tiene" queda "¿ya tiene…?") */
function armaMensaje(cuerpo, nombre, pregunta){
  var c=String(cuerpo||"").replace(/\s+/g," ").trim().replace(/[.!]+$/,""), q=false, m;
  if(!c) return "";
  if((m=c.match(/^(?:para\s+)?(?:ver|saber|preguntar(?:le)?|checar|revisar|confirmar)\s+si\s+(.+)$/i)) || (m=c.match(/^(?:a\s+ver|preguntando(?:le)?|pregunt[aá]ndole)?\s*si\s+(.+)$/i))){ c=m[1]; q=true; }
  else if((m=c.match(/^(?:para\s+)?(?:pedirle|solicitarle)\s+que\s+(.+)$/i))) c="le pido de favor que "+m[1];
  else if((m=c.match(/^(?:para\s+)?(?:decirle|avisarle|comentarle|recordarle|informarle|contarle)\s+que\s+(.+)$/i))) c=m[1];
  else if((m=c.match(/^(?:para\s+que|que|diciendo(?:le)?\s+que|dici[eé]ndole\s+que|diciendo(?:le)?|dici[eé]ndole)\s+(.+)$/i))) c=m[1];
  else if((m=c.match(/^(?:sobre|acerca\s+de)\s+(.+)$/i))) c="le escribo sobre "+m[1];
  else if((m=c.match(/^para\s+(.+)$/i))) c="le escribo para "+m[1];
  c=c.replace(/\?+$/,"").trim();
  if(pregunta && !q && !/^(le\s+escribo|le\s+pido)/i.test(c)) q=true;
  var pn=String(nombre||"").trim().split(/\s+/)[0]; pn=pn?pn.charAt(0).toUpperCase()+pn.slice(1):"";
  if(/^(hola|buen[oa]s?|qu[eé]\s+tal|oye)\b/i.test(c)) return c.charAt(0).toUpperCase()+c.slice(1)+(q?"?":".");
  return (pn?"Hola "+pn+", ":"")+(q?"¿"+(pn?_minus1(c):c.charAt(0).toUpperCase()+c.slice(1))+"?":(pn?_minus1(c):c.charAt(0).toUpperCase()+c.slice(1))+".");
}
/* a quien va: solo se da por hecho si es de ESTA tarea (uno solo) o si dijo el nombre completo y hay uno; si no, se pregunta.
   "Fernando" tambien encuentra a "Fer Peñaloza" (apodo corto) para que salga en las opciones. */
function resuelveDestino(t, dicho){
  var ws=_tokPer(dicho); if(!ws.length) return {estado:"ninguno", cands:[]};
  var cs=candidatosPersona(t).filter(function(c){ if(c.id===yo) return false; var toks=_tokPer(c.nombre+" "+(c.alias||""));
    return ws.every(function(w){ return toks.some(function(x){ return x===w || (w.length>=3 && x.indexOf(w)===0) || (x.length>=3 && w.indexOf(x)===0); }); }); });
  cs.sort(function(a,b){ return (b.prio-a.prio) || String(a.nombre).localeCompare(String(b.nombre)); });
  var tar=cs.filter(function(c){ return c.prio>=3; });
  if(tar.length===1) return {estado:"uno", persona:tar[0], cands:cs};
  var ex=cs.filter(function(c){ return _tokPer(c.nombre).join(" ")===ws.join(" "); });
  if(ws.length>=2 && ex.length===1) return {estado:"uno", persona:ex[0], cands:cs};
  return {estado:cs.length?"varios":"ninguno", cands:cs};
}
function _notaPriv(t, k, tx){ msg(t,k,tx); var m=t.msgs[t.msgs.length-1]; m.canal="priv:"+yo; m.nota_claude=1; if(k==="bo") m.de=yo; return m; }
/* deja el borrador (o pregunta que le digo). No guarda ni pinta: lo hace quien llama. */
function borradorMensaje(t, persona, md){
  var nom=String(persona.nombre||"").trim(), dichoNom=String((md&&md.quien)||nom);
  if(!String((md&&md.cuerpo)||"").trim()){
    t.pide_msj={id:persona.id, nombre:nom, quien:dichoNom, pregunta:!!(md&&md.pregunta), ts:Date.now()};
    _notaPriv(t,"bi","¿Qué le digo a "+nom+"? Díctamelo aquí y te lo enseño antes de mandarlo.");
    return "";
  }
  var tx=armaMensaje(md.cuerpo, dichoNom, md&&md.pregunta);
  t.pide_msj=null;
  t.msj_borrador={id:persona.id, contacto:nom, texto:tx, ts:Date.now()};
  _notaPriv(t,"bi","Le escribo a "+nom+" por WhatsApp: «"+tx+"» ¿Lo mando?");
  return tx;
}
function pideMensaje(t, v, md){
  _notaPriv(t,"bo",v);
  var r=personasPara(t, md.quien);
  if(r.estado==="uno") borradorMensaje(t, r.persona, md);
  else { _notaPriv(t,"bi",nuevaDudaPersona(t, md.quien, "mensaje", r.cands, {quien:md.quien, cuerpo:md.cuerpo||"", pregunta:!!md.pregunta}));
    if(!window.AGENDA_WA && !window.__agendaNo){ try{ cargaAgendaWA(function(){ var d=(t.quien_dudas||[]).filter(function(x){ return x.rol==="mensaje" && x.dicho===String(md.quien).trim(); })[0];
      if(d){ d.cands=personasPara(t, md.quien).cands.slice(0,40).map(function(c){ return {id:c.id, nombre:c.nombre, sub:c.sub||""}; }); guarda(t); if(vista==="hilo" && abierta===t.id) render(); } }); }catch(e){} } }
  guarda(t); render();
  if((t.quien_dudas||[]).length) setTimeout(function(){ try{ if(vista==="hilo" && abierta===t.id) abrePreguntas(t.id); }catch(e){} }, 60);   /* build 251: la tarjeta sale en el acto */
}
/* lo dictado en la tarea mientras hay un mensaje en curso: el texto que faltaba, o el cambio al borrador */
function msjEnCurso(t, v){
  if(window.__msjEdit && window.__msjEdit.tid===t.id && t.msj_borrador){ window.__msjEdit=null;
    t.msj_borrador.texto=String(v).trim(); t.msj_borrador.ts=Date.now(); guarda(t); render(); return true; }
  var pm=t.pide_msj; if(!pm || Date.now()-(pm.ts||0)>30*60000 || mensajeDicho(v)) return false;
  _notaPriv(t,"bo",v); borradorMensaje(t, {id:pm.id, nombre:pm.nombre}, {quien:pm.quien, cuerpo:v, pregunta:pm.pregunta}); guarda(t); render(); return true;
}
function vBorradorMsj(t){
  var b=t.msj_borrador; if(!b) return "";
  return '<div class="revc c-quien"><span class="rct">MENSAJE PARA '+esc(String(b.contacto).toUpperCase())+'</span>'+
    '<span class="rcq">«'+esc(b.texto)+'»</span><span class="rcp">Por WhatsApp · revísalo antes de mandarlo</span>'+
    '<div class="dmb"><button class="dmk si" data-mbact="manda">Mandar</button><button class="dmk" data-mbact="cambia">Cambiar</button><button class="dmk" data-mbact="no">No mandar</button></div></div>';
}
function mandaBorrador(t){
  var b=t.msj_borrador; if(!b) return; t.msj_borrador=null;
  if(PERSONAS[b.id]){ mandaDM(t, b.id, b.texto); return; }
  t.wa_contactos=t.wa_contactos||[];
  if(!t.wa_contactos.some(function(c){ return _nn(String(c.nombre||c))===_nn(b.contacto); })) t.wa_contactos.push({nombre:b.contacto, desde:Date.now()});
  candadoExterno(t, b.contacto, b.texto, function(){ mandaAExterno(t, b.contacto, b.texto, null); });
}
function vQuienDudas(t){
  var l=(t.quien_dudas||[]); if(!l.length) return "";
  return l.map(function(d){
    var ot=window.__qdOtro===d.id;
    return '<div class="revc c-quien" data-qd="'+esc(d.id)+'"><span class="rct">'+esc({responsable:"RESPONSABLE",seguimiento:"SEGUIMIENTO",compartir:"SE COMPARTE CON",mensaje:"MENSAJE PARA"}[d.rol]||"PERSONA")+'</span>'+
      '<span class="rcq">¿Quién es '+esc(d.dicho)+'?</span>'+
      (d.cands.length?'<span class="rcp">'+(d.cands.length===1?"Encontré a esta persona":"Encontré "+d.cands.length+" · escoge")+'</span>':'<span class="rcp">No lo tengo en tus contactos</span>')+
      '<div class="qdl">'+d.cands.map(function(c,i){ return '<button class="qdb" data-qdpick="'+esc(d.id)+'|'+i+'"><b>'+esc(c.nombre)+'</b><small>'+esc(c.sub||"")+'</small></button>'; }).join("")+
      (ot?'<div class="qdn"><input id="qdin" type="text" value="'+esc(d.dicho)+'" autocomplete="off" autocapitalize="words" enterkeyhint="done"><button class="qdok" data-qdnuevo="'+esc(d.id)+'">Listo</button></div>':
        '<button class="qdb otro" data-qdotro="'+esc(d.id)+'"><b>Otro / nuevo</b><small>escribe el nombre</small></button>')+'</div></div>';
  }).join("");
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function vCompartir(t){
  var l=_compartirLista(t); if(!l.length) return "";
  return '<div class="compc"><span class="cpl">Se comparte con</span>'+l.map(function(c){ return '<span class="cpp">'+esc(c.nombre)+'</span>'; }).join("")+'</div>';
}
/* aplica lo que regreso Claude, con candados. Regresa {hecho, dudas, vinc, yaHecha} */
/* ===== build 259 (caso real "Cobranza Moric Pádel Draw"): EL CEREBRO NUNCA CAMBIA EL PROPÓSITO DE UNA TAREA NI LA CIERRA A LA LIGERA =====
   a) Si lo dictado contradice el contexto o la historia de la tarea (pasos, nombre, mensajes de origen), NO renombra ni cambia el
      contexto: pregunta "Esta tarea es de <tema actual>. ¿Creo una tarea nueva para <lo que dictaste> y muevo ahí los mensajes de
      <persona>?" con [Sí, crear nueva] [Cambiar esta]. Renombrar con orden explícita ("cámbiale el nombre a…") sí se hace.
   b) Nunca la cierra con pasos sin palomear si la orden de cierre no vino explícita de Salvador en ese mismo dictado. */
function stems(s){ return _n179(s).split(" ").filter(function(w){ return w.length>=4; }).map(function(w){ return w.slice(0,5); }); }
function renombreExplicito(v){ return /\b(cambi\w*|renombr\w*|pon\w*|dej\w*|llam\w*)\s+(le\s+|la\s+|lo\s+)?(el\s+)?(nombre|titulo)\b|\b(que\s+se\s+llame|ll[aá]mala|ll[aá]malo|renombr[aá]la)\b/.test(_fsa(v)); }
function cierreExplicito(v){ return /\b(cierr\w*|ci[eé]rra(la|lo)|dala\s+por\s+(hecha|cerrada|terminada)|dalo\s+por\s+(hecho|cerrado|terminado)|marca(la|lo)?\s+(como\s+)?(hecha|cerrada|terminada|hecho|cerrado)|ya\s+(la|lo)\s+(hice|termine|cerre)|quedo\s+cerrada|termina(la|lo))\b/.test(_fsa(v)); }
function historiaTarea(t){
  var real=(t.msgs||[]).filter(function(m){ return m && !m.nota_ia && !m.nota_claude && !m.res238 && !m.dict238 && m.k!=="bal" && !m.oculto && String(m.t||"").trim(); }).length;
  var ctx=String(contextoDe(t)||t.contexto||"").trim().split(/\s+/).filter(Boolean).length;
  return tienePasos(t) || ((t.checklist&&t.checklist.items||[]).length>0) || real>=4 || (ctx>=10 && !!(t.autorizada||t.tipo_elegido));
}
function contradice259(t, v, j){
  j=j||{}; if(!t || renombreExplicito(v) || !historiaTarea(t)) return null;
  var nj=String(j.nombre||"").replace(/\s+/g," ").trim(), cj=String(j.contexto||"").replace(/\s+/g," ").trim(), cd=j.contradice;
  var cambia=(nj.length>=2 && _n179(nj)!==_n179(t.nombre||"")) || (cj && _n179(cj)!==_n179(contextoDe(t)||""));
  var base=stems([t.nombre, contextoDe(t)||t.contexto||"", (t.lista_pasos||[]).map(function(p){ return p&&p.tx; }).join(" "), ((t.checklist&&t.checklist.items)||[]).map(function(i){ return i&&i.tx; }).join(" ")].join(" "));
  var nuevo=stems(nj+" "+cj), comparte=nuevo.some(function(w){ return base.indexOf(w)>=0; });
  var flag=(cd===true) || !!(cd && typeof cd==="object" && (cd.tema_dictado||cd.persona));
  if(!(flag || (cambia && nuevo.length && !comparte))) return null;
  var persona=String((cd&&cd.persona)||"").trim();
  if(!persona){ var ds=_n179(v); (t.msgs||[]).slice().reverse().some(function(m){ var c=nombreLimpio((m&&m.wa_c)||""); if(!c) return false; var p0=_n179(c).split(" ")[0]; if(p0.length>=3 && (" "+ds+" ").indexOf(" "+p0+" ")>=0){ persona=c; return true; } return false; }); }
  var nuevoTema=String((cd&&cd.tema_dictado)||nj||"").trim()||corta40(String(v||"").replace(/\s+/g," ").trim());
  return {nombre:nj, contexto:cj, persona:persona, tema:nuevoTema};
}
function preguntaContradice(t, c, v){
  return {k:"contradice259", q:"Esta tarea es de “"+(t.nombre||"")+"”. ¿Creo una tarea nueva para “"+corta40(c.tema)+"” y muevo ahí los mensajes de "+(c.persona||"esa persona")+"?",
    ops:[{id:"nueva", label:"Sí, crear nueva"},{id:"cambiar", label:"Cambiar esta"}], dato259:{nombre:c.nombre, contexto:c.contexto, persona:c.persona, tema:c.tema, dicho:String(v||"").slice(0,400)}};
}
/* responde la pregunta: "nueva" crea la tarea y mueve los mensajes de la persona; "cambiar" aplica el nombre y contexto nuevos */
function resuelveContradice(t, f, op){
  var d=(f&&f.dato259)||{}; var id=String((op&&op.id)||"");
  if(id==="cambiar"){ if(d.nombre){ t.nombre=tituloTarea(conMayuscula(d.nombre.slice(0,60))); } if(d.contexto){ t.contexto=d.contexto.slice(0,1500); } guarda(t); return "Cambié esta tarea: “"+(t.nombre||"")+"”."; }
  if(id!=="nueva") return "";
  var nom=tituloTarea(conMayuscula((d.nombre||d.tema||"Tarea nueva").slice(0,60)));
  var n=creaTarea({nombre:nom, duenio:t.duenio, pendiente_info:"", falta_fecha:true}); if(!n) return "";
  n.tipo_elegido=true; n.tipo_item="tarea"; n.creada_desde={tarea_id:t.id, ts:Date.now(), tipo:"contradice259"}; if(d.contexto) n.contexto=d.contexto.slice(0,1500); guarda(n);
  var p0=_n179(d.persona||"").split(" ")[0], movidos=0;
  if(p0.length>=3) (t.msgs||[]).forEach(function(m, i){ if(m && !m.oculto && +m.wa_in===1 && m.wa_c && _n179(m.wa_c).split(" ")[0]===p0){ if(mueveMensaje(t, i, n.id, "nueva")) movidos++; } });
  guarda(t);
  return "Tarea nueva “"+nom+"”"+(movidos?"; pasaron ahí "+movidos+" mensaje"+(movidos===1?"":"s")+" de "+d.persona:"")+".";
}
function aplicaRevisionClaude(t, v, j, abiertas){
  j=j||{}; var s=_fsa(v), hecho=[], dudas=[], vinc=[];
  if(j.ya_hecha===true){
    /* build 259: con pasos sin palomear NO se cierra si la orden de cierre no vino explícita en ESTE dictado */
    if(tienePasos(t) && pasosFaltan(t).length && !cierreExplicito(v)){ var _nf=pasosFaltan(t).length; j.ya_hecha=false; dudas.push("No la cerré: quedan "+_nf+" paso"+(_nf===1?"":"s")+" sin palomear. Dime \u201ccierra la tarea\u201d si de verdad la cierro."); }
    else return {hecho:hecho, dudas:dudas, vinc:vinc, yaHecha:true};
  }
  var _c259=contradice259(t, v, j), _cp259=null;
  if(_c259){ _cp259=preguntaContradice(t, _c259, v); j=JSON.parse(JSON.stringify(j)); j.nombre=null; j.contexto=null; }   /* build 259: no renombra ni cambia el propósito */
  var tp=String(j.tipo||"").toLowerCase();
  if((tp==="tarea"||tp==="dato") && tipoItem(t)!==tp){ t.tipo_item=tp; t.es_dato=(tp==="dato"); hecho.push(tp==="dato"?"es dato":"es tarea"); }
  else if(tp==="tarea"||tp==="dato"){ t.tipo_item=tp; t.es_dato=(tp==="dato"); }
  if(j.nombre && String(j.nombre).trim().length>=2){ var nn=tituloTarea(conMayuscula(String(j.nombre).replace(/\s+/g," ").trim().slice(0,60)));
    if(nn!==t.nombre){ t.nombre=nn; hecho.push("nombre “"+nn+"”"); } }
  var cx=String(j.contexto||"").replace(/\s+/g," ").trim();
  if(cx && !fechasRaras(cx, fechaDictada(v).todas.concat([t.f_vigente,t.f_original].filter(Boolean))).length){
    var _pw=function(x){ return String(x||"").split(/\s+/).filter(function(w){ return w.length>1; }).length; }, ant=String(contextoDe(t)||"").trim();
    var reemp=String(j.contexto_modo||"reemplazar").toLowerCase()!=="sumar" && _pw(cx)>=Math.min(CTX_MIN_PAL, _pw(ant));
    var nuevo=(reemp || !ant) ? cx : (ant+" "+cx);
    /* si el resumen de Claude queda corto (bajo la rayita) y lo dictado traia mas, no se pierde lo dictado */
    if(_pw(nuevo)<CTX_MIN_PAL && _pw(v)>_pw(nuevo)) nuevo=(ant && _pw(ant)<CTX_MIN_PAL ? ant+" " : "")+String(v).replace(/\s+/g," ").trim();
    if(_nn(nuevo)!==_nn(ant)){ t.contexto=nuevo.slice(0,1500); hecho.push("contexto"); } }
  if(j.indefinida===true && t.indefinida!==true && /indefinid|sin\s+fecha|no\s+tiene\s+(fecha|fin)|sin\s+fin|permanente/.test(s)){ t.indefinida=true; t.falta_fecha=false; hecho.push("indefinida"); }
  var per=String(j.periodicidad||"").toLowerCase();
  if((per==="semanal"||per==="mensual") && /recurrente|se\s+repite|repetir|cada\s+(semana|mes)|semanal|mensual|todas\s+las\s+semanas|todos\s+los\s+meses/.test(s) && t.periodicidad!==per){ t.periodicidad=per; t.tipo="recurrente"; hecho.push(per==="semanal"?"recurrente cada semana":"recurrente cada mes"); }
  if(j.ritmo && String(j.ritmo).trim() && RITMO_RE.test(s)){ var rt=String(j.ritmo).trim().slice(0,80); if(_nn(rt)!==_nn(t.ritmo||"")){ t.ritmo=conMayuscula(rt); hecho.push("ritmo: "+rt.toLowerCase()); } }
  try{ if(planDesdeDictado(t, v)) hecho.push(lineaPlanTxt(t)); }catch(e){}
  /* fecha SOLO si Claude la vio como fecha de la tarea Y se dicto (el candado manda la dictada); sin fecha dictada, ninguna */
  var _fdv=fechaDictada(v), _cf=(j.fecha && _fdv.todas.length) ? candadoFecha(v, j.fecha) : {ok:false, fecha:null, duda:_fdv.duda||""};
  if(t.indefinida===true){ _cf={ok:false, fecha:null, duda:""}; }   /* build 222: continua -> lo que tiene fecha es META, nunca finiquito */
  var _l248=aplicaLecturaFechas(t, v, j); if(_l248.bloquea){ _cf={ok:false, fecha:null, duda:_fdv.duda||""}; }   /* build 248: "no termina el 8" no es finiquito; "antes del 15" es la meta */
  if(_cf.ok && _cf.corregida && _fdv.todas.length>1){ _cf={ok:false, fecha:null, duda:"¿Cuál de las fechas que dijiste es la de la tarea?"}; }
  if(_cf.duda) dudas.push(_cf.duda+" La fecha no la cambié.");
  else if(_cf.ok && _cf.fecha && _cf.fecha!==t.f_vigente){ t.fecha_dictada=!!_cf.dictada; t.f_original=_cf.fecha; t.f_vigente=_cf.fecha; t.falta_fecha=false; hecho.push("termina el "+fechaBonita(_cf.fecha)); }
  else if(_cf.ok && _cf.fecha){ t.fecha_dictada=!!_cf.dictada; t.falta_fecha=false; }
  hecho=hecho.concat(_l248.hecho);
  var _todas=fechaDictada(v).todas, _rel=/\b(antes|despues|previo|previa)\b/.test(s);
  var _ej250=(Array.isArray(j.ordenes)?j.ordenes:[]).some(function(o){ return o && /^(mensaje|condicional)$/i.test(String(o.tipo||"")); }) && /\b(tengo que|debo|hay que|me toca|quiero)\s+(contestar|responder|confirmar|avisar|decir)\w*/.test(s);   /* build 250: "mañana tengo que contestarle a X" + orden ejecutable = no es aviso sin hora */
  (Array.isArray(j.recordar)?j.recordar:[]).slice(0,6).forEach(function(r){
    if(r && !(_ej250 && !r.hora) && _fReal(r.fecha) && !_cf.duda && (!_todas.length || _rel || _todas.indexOf(r.fecha)>=0) && !avisoMismoDia(t, r.fecha)){ nuevoAviso(t,{texto:t.nombre, fecha:r.fecha, hora:r.hora||"", dicho:v}); hecho.push("aviso "+fechaBonita(r.fecha)+(r.hora?" "+r.hora:"")); } });
  if(j.quien && String(j.quien).trim() && duenoDicho(v, String(j.quien))){ var qn=_nn(String(j.quien).trim()), k=Object.keys(PERSONAS).filter(function(x){ var pn=_nn(PERSONAS[x].nombre); return pn===qn || pn.split(" ")[0]===qn.split(" ")[0]; })[0];
    var dicho=k && (s.indexOf(_nn(PERSONAS[k].nombre).split(" ")[0])>=0 || (k===yo && /\b(yo|mia|mio|me toca|la hago|lo hago)\b/.test(s)));
    if(dicho && k!==t.duenio){ if(!t.duenio) t.duenio=k; else transfiere(t, k, "lo dijo "+((PERSONAS[yo]||{}).nombre||"")+" al completarla"); hecho.push("quién: "+(k===yo?"tú":PERSONAS[k].nombre)); } }
  var pal=(Array.isArray(j.palabras)?j.palabras:[]).concat(Array.isArray(j.sinonimos)?j.sinonimos:[]).map(function(w){ return String(w).toLowerCase().trim(); }).filter(Boolean);
  pal=pal.filter(function(w,i){ return pal.indexOf(w)===i; });
  if(pal.length){ t.palabras=pal.slice(0,10); if(Array.isArray(j.sinonimos)) t.sinonimos=j.sinonimos.map(function(w){ return String(w).toLowerCase().trim(); }).filter(Boolean).slice(0,6); hecho.push("etiquetas"); }
  if(j.de_quien && String(j.de_quien).trim() && _nn(j.de_quien)!==_nn(t.de_quien||"")){ var _dq=String(j.de_quien).trim(); if(_dq.length>120) _dq=_dq.slice(0,120).replace(/\s+\S*$/,"")+"…"; t.de_quien=_dq; hecho.push("de "+t.de_quien); }   /* build 219: ya no se corta a media palabra ("ejecutor: Man.") */
  if(j.cifras && String(j.cifras).trim() && /\d/.test(String(j.cifras))){ var _fr=fechasRaras(String(j.cifras), _todas);
    if(!_fr.length){ t.datos_corregidos=(t.datos_corregidos||[]).concat([{t:String(j.cifras).trim().slice(0,600), ts:Date.now(), dicho:String(v).slice(0,300)}]).slice(-30); hecho.push("cifras"); } }
  var ids=(abiertas||[]).map(function(x){ return x.id; }), _b248=palTema([v, t.nombre, t.contexto].join(" "));
  (Array.isArray(j.vinculos)?j.vinculos:[]).forEach(function(id){ id=String(id||"").trim(); var xo=(abiertas||[]).filter(function(x){ return x.id===id; })[0];
    if(id && id!==t.id && xo && vinc.indexOf(id)<0 && (t.vinculos_descartados||[]).indexOf(id)<0 && vinc.length<3 && temaComun(_b248, [xo.nombre, xo.contexto, (xo.palabras||[]).join(" ")].join(" "))>=2) vinc.push(id); });   /* build 248: 2+ palabras de tema, sin contar empresas */
  if(vinc.length && !t.dup_resuelto){ t.posible_dup=(t.posible_dup||[]).concat(vinc).filter(function(x,i,a){ return a.indexOf(x)===i; }); }   /* solo se PROPONE (franja) */
  if(t.f_vigente || t.periodicidad || t.indefinida===true){ t.pendiente_info=""; t.pendiente_tipo=""; }
  /* la pregunta puede nombrar dias o meses SOLO si los dijo el ("¿jueves o viernes?"); fechas sueltas del modelo, no */
  var _mt2=aplicaMetasClaude(t, v, j); hecho=hecho.concat(_mt2.hecho); dudas=dudas.concat(_mt2.dudas);
  var _ai2=aplicaAvisoInmediato(t, v, j); if(_ai2) hecho.push(_ai2);
  if(t.indefinida===true && j.fecha && !(_mt2.hecho.length) && _fdv.todas.length && !esMetas(t)) dudas.push("Es continua: esa fecha la tomo como meta. ¿Meta de qué?");
  var _ck7=(esMetas(t) && !(j.checklist && /^metas?$/i.test(String(j.checklist.titulo||""))))?"":aplicaChecklistClaude(t, j); if(_ck7) hecho.push(_ck7);
  var _rs9=aplicaResponsable(t, v, j); if(_rs9) hecho.push(_rs9);
  if(t.__dudas221){ dudas=dudas.concat(t.__dudas221); delete t.__dudas221; }   /* build 221: ¿Quién es X? */
  var _sg9=aplicaSeguimientoA(t, v, j); if(_sg9.hecho) hecho.push(_sg9.hecho); if(_sg9.duda) dudas.push(_sg9.duda);
  var pq=String(j.pregunta||"").trim();
  if(pq){ var _dm=_fsa(pq).match(new RegExp("\\b("+_DIARE+"|"+_MESRE+")\\b","g"))||[];
    var _pqOk=!/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\s*[-/]\s*\d{1,2}\b/.test(pq) && _dm.every(function(w){ return new RegExp("\\b"+w+"\\b").test(s); });
    if(_pqOk && !preguntaQuienYaResuelta(t, pq)) dudas.push(pq); }
  return {hecho:hecho, dudas:dudas, vinc:vinc, yaHecha:false, contradice:_cp259};
}
/* ===== build 208 (Salvador 22:04): nada de palomeo en vivo mientras dicta. Al llegar lo de Claude, lo que se completo
   se palomea UNO POR UNO (animacion de palomita, PALOMEO_MS entre cada uno); al final queda tenue y sale "Solo me falta"
   o se autoriza. Mientras se palomea, lo que aun no toca se ve pendiente. ===== */
var PALOMEO_MS=250;
function okDeRevision(t){ var c=completitud(t), r=c.items.filter(function(x){ return x.ok; }).map(function(x){ return x.k; }); if(c.ctxOk) r.unshift("ctx"); return r; }
function palomeaEnOrden(t, antes, alFinal){
  var nuevos=okDeRevision(t).filter(function(k){ return antes.indexOf(k)<0; });
  if(!nuevos.length){ alFinal(); return; }
  window.__palomeo=window.__palomeo||{}; var P=window.__palomeo[t.id]={pend:nuevos.slice(), hechos:[]};
  if(vista==="hilo" && abierta===t.id) render();
  var paso=function(){
    if(!P.pend.length){ delete window.__palomeo[t.id]; alFinal(); return; }
    P.hechos.push(P.pend.shift()); if(vista==="hilo" && abierta===t.id) render();
    setTimeout(paso, PALOMEO_MS); };
  setTimeout(paso, PALOMEO_MS);
}
/* ===================== build 238 (Salvador 20:17, "Firma de Testamento en Notaría 14", dictado 19:49) =====================
   1) En la vista general TODO lo dictado se analiza completo: el mismo cerebro (promptRevision) devuelve además ordenes[] y
      CADA orden se ejecuta: vincular (una candidata clara = se vincula; varias = "¿a cuál?" con botones), mensajes a personas por
      la cola de WhatsApp de siempre con "IA: " de parte de Salvador, trabajo para Claude -> t.encargos (lo procesa la Mac),
      agendar/seguimiento -> aviso, clasificar. Fechas relativas con la fecha de Monterrey. El dueño NUNCA cambia salvo que lo diga.
   2) Después de enviar: la conversación no se repite; queda la tarjeta "Hecho:" / "Me falta:" (solo lo que de verdad falta, con
      botones). Si dio una fecha ("mañana") no se le vuelve a pedir. */
function fechaMty(d){
  var b; try{ b=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Monterrey",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()); }catch(e){ b=iso(new Date()); }
  var x=new Date(b+"T12:00:00Z"); x.setUTCDate(x.getUTCDate()+(d||0)); return x.toISOString().slice(0,10);
}
function horaMty(){ try{ return new Intl.DateTimeFormat("es-MX",{timeZone:"America/Monterrey",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date()); }catch(e){ return hhmm(); } }
/* ¿dijo explícito que la tarea es de esa persona? */
function duenoDicho(v, nom){
  var s=_fsa(v), w=_nn(String(nom||"")).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(function(x){ return x.length>=3; })[0]; if(!w) return false;
  var V="(?:pas[a-z]*sela|pas[a-z]*selo|pasala|pasalo|pasale|encarga\\w*|asigna\\w*|delega\\w*|dasela|daselo|que la haga|que lo haga|la hace|lo hace|le toca|la lleva|lo lleva|responsable|ejecutor\\w*|la tarea es de|esta tarea es de|es de)";
  return new RegExp(V+"(?:\\s+[^\\s.]+){0,10}?\\s+"+w+"\\b").test(s) || new RegExp("\\b"+w+"(?:\\s+\\S+){0,3}?\\s+(?:la hace|lo hace|la lleva|lo lleva|es (?:el |la )?responsable|se encarga|la va a hacer|lo va a hacer|es (?:el |la )?ejecutor\\w*|es su(?:ya|yo))\\b").test(s);
}
/* fecha de la orden: la del calendario si es real; si no, la relativa dicha (hoy/mañana/pasado mañana) con la fecha de Monterrey */
function fechaOrden(o, v){
  var f=String((o&&o.fecha)||"").trim(); if(_fReal(f)) return f;
  var s=_fsa(((o&&(o.que||o.texto))||"")+" "+(v||""));
  if(/\bpasado manana\b/.test(s)) return fechaMty(2); if(/\bmanana\b/.test(s)) return fechaMty(1); if(/\bhoy\b/.test(s)) return fechaMty(0);
  return "";
}
function candidatasVinc(t, o, abiertas){
  var ids=(abiertas||[]).map(function(x){ return x.id; }), c=[];
  (Array.isArray(o.tareas)?o.tareas:[]).forEach(function(id){ id=String(id||""); if(id && id!==t.id && ids.indexOf(id)>=0 && c.indexOf(id)<0) c.push(id); });
  if(!c.length && o.busca){ var ws=_nn(o.busca).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(function(w){ return w.length>=4; });
    if(ws.length) (abiertas||[]).forEach(function(x){ var n=_nn(x.nombre||""); if(x.id!==t.id && ws.every(function(w){ return n.indexOf(w.slice(0,6))>=0; })) c.push(x.id); }); }
  /* rankeo: el orden que dio Claude + palabras en común con la tarea (nombre, contexto, de quién, lo dictado): puede decir una palabra por otra */
  var base={}, pon=function(tx, p){ _nn(tx||"").replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).forEach(function(w){ if(w.length>=5) base[w.slice(0,6)]=Math.max(base[w.slice(0,6)]||0, p); }); };
  pon([t.contexto, t.de_quien, (t.palabras||[]).join(" "), o.busca].join(" "), 1); pon(t.nombre, 3);   /* el nombre de la tarea pesa más */
  var sc=c.map(function(id,i){ var n=_nn(nombreTarea(id)+" "+((tareas.filter(function(x){ return x.id===id; })[0]||{}).contexto||"")).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/), vis={}, p=0;
    n.forEach(function(w){ var r=w.slice(0,6); if(w.length>=5 && base[r] && !vis[r]){ vis[r]=1; p+=base[r]; } }); return {id:id, p:p*2+(c.length-i)/10}; });
  return sc.sort(function(a,b){ return b.p-a.p; }).map(function(x){ return x.id; }).slice(0,4);
}
function corto238(s){ s=String(s||"").replace(/\s+/g," ").trim(); return s.length>70?s.slice(0,69).replace(/\s+\S*$/,"")+"…":s; }
function nombreTarea(id){ var d=tareas.filter(function(x){ return x.id===id; })[0]; return d?String(d.nombre||""):""; }
/* manda por la cola de WhatsApp de siempre, "IA: " y de parte de Salvador */
function mandaOrden(T, persona, texto, alId){
  var p1=String(persona.nombre||"").split(/\s+/)[0], tx=conIA(p1+", de parte de "+(((PERSONAS[yo]||{}).nombre)||"Salvador")+": "+String(texto||"").replace(/^IA:\s*/i,"").trim());
  if(PERSONAS[persona.id]){ var G=null; try{ G=contactosWA(T).filter(function(g){ return g.eq===persona.id; })[0]; }catch(e){}
    if(G && G.nombre){ mandaAExterno(T, G.nombre, tx, null, "dm:"+persona.id, alId); return "por WhatsApp"; }
    mandaDM(T, persona.id, tx); return "en Doit"; }
  var nomWA=nombreWA(persona.nombre);
  T.wa_contactos=T.wa_contactos||[]; if(!T.wa_contactos.some(function(c){ return _nn(String(c.nombre||c))===_nn(nomWA); })) T.wa_contactos.push({nombre:nomWA, desde:Date.now()});
  mandaAExterno(T, nomWA, tx, null, null, alId); return "por WhatsApp";
}
function ejecutaOrdenes(t, v, j, abiertas){
  var L=(Array.isArray(j&&j.ordenes)?j.ordenes:[]).filter(function(o){ return o && typeof o==="object"; }).slice(0,8), hecho=[], falta=[], T=t, hm=horaMty();
  /* 1) vincular primero: con una sola candidata clara, lo demás se hace en la tarea vinculada */
  L.filter(function(o){ return String(o.tipo)==="vincular"; }).slice(0,1).forEach(function(o){ var c=candidatasVinc(t, o, abiertas);
    if(c.length===1){ var dn=nombreTarea(c[0]); enlazaTareas(t.id, c[0], "dictado"); var d=tareas.filter(function(x){ return x.id===c[0]; })[0]; if(d && t.fusionada_en===d.id){ T=d; hecho.push("Vinculada a “"+dn+"”"); } }
    else falta.push({k:"vinc", q:c.length?"¿A cuál la vinculo?":"¿A cuál tarea la vinculo? No encontré “"+String(o.busca||"").trim()+"”.", ops:c.map(function(id){ return {id:id, label:nombreTarea(id)}; })}); });
  L.forEach(function(o){ var tp=String(o.tipo||"").toLowerCase();
    if(tp==="clasificar"){ var ti=String(o.tipo_item||"").toLowerCase(); if(ti==="tarea"||ti==="dato"){ T.tipo_item=ti; T.es_dato=(ti==="dato"); T.tipo_elegido=true; hecho.push(ti==="dato"?"Es dato":"Es tarea"); } }
    else if(tp==="mensaje"){ var a=String(o.a||"").trim(), tx=String(o.texto||"").trim(); if(!a || !tx) return;
      if(String(o.canal||"").toLowerCase()==="correo"){ falta.push({k:"txt", q:"El correo a "+a+" no lo mando desde aquí: ¿se lo mando por WhatsApp?", ops:[]}); return; }
      var r=personasPara(T, a);   /* build 251: nombre repetido o sin coincidencia = pregunta cuál, no se manda nada */
      if(r.estado==="uno"){ var por=mandaOrden(T, r.persona, tx); hecho.push("Le escribí a "+nombreCorto(r.persona.nombre).split(" ")[0]+" "+por+": “"+corto238(tx.replace(/^IA:\s*/i,""))+"”"); }
      else falta.push({k:"msg", q:"¿A quién le mando “"+tx+"”? "+(r.cands.length?"Hay varios "+a+":":"No encontré a "+a+": escribe el nombre."), texto:tx, ops:r.cands.slice(0,4).map(function(c){ return {id:c.id, label:c.nombre}; })}); }
    else if(tp==="claude"){ var que=String(o.que||o.texto||"").trim(); if(!que) return; var f=fechaOrden(o, "");
      if(!f){ var sv=_fsa(v); if(/\bmanana\b/.test(sv) && !/\bpasado manana\b/.test(sv)) f=fechaMty(1); }
      /* t.encargos: lo que Claude tiene que hacer (la Mac los procesa). cuando = ISO con hora de Monterrey (9:00 si no dijo hora) */
      T.encargos=(Array.isArray(T.encargos)?T.encargos:[]).concat([{id:"enc"+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36), t:que.slice(0,300),
        cuando:f?(f+"T"+(o.hora&&/^\d{2}:\d{2}$/.test(o.hora)?o.hora:"09:00")+":00-06:00"):"", origen:"dictado", hora_dictado:hm, estado:"pendiente", creado:Date.now(), tarea_id:T.id, por:yo||""}]);
      if(f && !T.revisar) T.revisar=f;
      hecho.push("Lo reviso yo"+(f?" "+(f===fechaMty(1)?"mañana":fechaBonita(f)):"")+": "+corto238(que)); }
    else if(tp==="condicional"){ ordenCondicional(T, v, o, hecho, falta); }
    else if(tp==="agendar" || tp==="seguimiento"){ var f2=fechaOrden(o, v), q2=String(o.que||o.texto||T.nombre).trim();
      if(f2 && !avisoMismoDia(T, f2)){ nuevoAviso(T,{texto:q2, fecha:f2, hora:(/^\d{2}:\d{2}$/.test(o.hora||"")?o.hora:""), dicho:v}); hecho.push((tp==="agendar"?"Agendado ":"Seguimiento ")+fechaBonita(f2)+(o.hora?" "+o.hora:"")+": "+q2); }
      else if(!f2) falta.push({k:"txt", q:"¿Qué día "+(tp==="agendar"?"lo agendo":"le doy seguimiento")+"? ("+q2+")", ops:[]}); }
  });
  return {hecho:hecho, falta:falta, T:T};
}

/* ===== build 250: ÓRDENES CONDICIONALES =====
   "pregúntale a A … y si dice que sí, dile a B …": se manda la pregunta a A (IA: …, con contexto) y se deja un encargo
   t.encargos {tipo:"condicional", estado:"esperando", pregunta:{contacto, pedido_id}, si_si:{contacto, texto}, si_no:{accion:"nota"}, vence, …}.
   La Mac (18y) espera la respuesta y manda lo de B. Si el nombre coincide con varios contactos, se pregunta cuál ANTES de mandar. */
function personasPara(T, dicho){
  var r={cands:[]}; try{ r=resuelveDestino(T, dicho); }catch(e){}
  var out=(r.cands||[]).slice(), vis={}; out.forEach(function(c){ vis[_n179(c.nombre)]=1; });
  try{ buscaContactos249(dicho, 10).forEach(function(c){ var k=_n179(c.nombre); if(!vis[k]){ vis[k]=1; out.push({id:c.id, nombre:c.nombre, sub:c.sub||"", prio:0}); } }); }catch(e){}
  /* una persona de Doit y su propio contacto de WhatsApp ("Cynthia" y "Cynthia Contadora…") son la misma: se queda el contacto */
  out=out.filter(function(c){ if(!PERSONAS[c.id]) return true; var t0=_tokPer(c.nombre)[0]; return !out.some(function(o){ var to=_tokPer(o.nombre); return !PERSONAS[o.id] && to.length>1 && to[0]===t0; }); });
  var ws=_tokPer(dicho), ex=out.filter(function(c){ return _tokPer(c.nombre).join(" ")===ws.join(" "); });
  if(ex.length===1 && (ws.length>=2 || out.length===1)) return {estado:"uno", persona:ex[0], cands:out};   /* un solo nombre ("Karina") con varios contactos que lo comparten: se pregunta cuál */
  if(out.length===1) return {estado:"uno", persona:out[0], cands:out};
  return {estado:out.length?"varios":"ninguno", cands:out};
}
function _diaAntes(f){ var d=new Date(f+"T12:00:00Z"); d.setUTCDate(d.getUTCDate()-1); return d.toISOString().slice(0,10); }
function eventoDicho(v){
  var s=_fsa(v), DIAS=["domingo","lunes","martes","miercoles","jueves","viernes","sabado"], m=s.match(/\b(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\b/); if(!m) return "";
  var h=new Date(fechaMty(0)+"T12:00:00Z"), want=DIAS.indexOf(m[1]), add=(want-h.getUTCDay()+7)%7||7; return fechaMty(add);
}
function venceCond(o, v){
  var f=String((o&&o.vence)||"").trim(), hr=/^\d{2}:\d{2}$/.test(o&&o.vence_hora||"")?o.vence_hora:"20:00";
  if(!_fReal(f)){ var ev=String((o&&o.evento_fecha)||"").trim(); if(!_fReal(ev)) ev=eventoDicho(v); f=_fReal(ev)?_diaAntes(ev):fechaMty(1); hr="20:00"; }
  return f+"T"+hr+":00-06:00";
}
function ordenCondicional(T, v, o, hecho, falta){
  var aN=String(o.pregunta_a||o.a||"").trim(), bN=String(o.si_a||"").trim(), txA=String(o.pregunta_texto||o.texto||"").trim(), txB=String(o.si_texto||"").trim();
  if(!aN || !bN || !txA || !txB){ falta.push({k:"txt", q:"En lo condicional me faltó algo: ¿a quién le pregunto y a quién le confirmo si dice que sí?", ops:[]}); return; }
  var cid="cd"+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36), rA=personasPara(T, aN), rB=personasPara(T, bN);
  var P={cid:cid, aN:aN, bN:bN, txA:txA, txB:txB, vence:venceCond(o, v), dicho:String(v||"").slice(0,300), A:null, B:null};
  if(rA.estado==="uno") P.A={id:rA.persona.id, nombre:rA.persona.nombre};
  if(rB.estado==="uno") P.B={id:rB.persona.id, nombre:rB.persona.nombre};
  var dudas=false;
  if(!P.A){ dudas=true; falta.push({k:"cond", lado:"A", cid:cid, q:(rA.estado==="ninguno"?"¿A quién le pregunto? No encontré a "+aN+": escribe el nombre.":"¿Cuál "+aN+" es? Le pregunto a ella/él antes de mandar nada."), ops:rA.cands.slice(0,5).map(function(c){ return {id:c.id, label:c.nombre}; })}); }
  if(!P.B){ dudas=true; falta.push({k:"cond", lado:"B", cid:cid, q:(rB.estado==="ninguno"?"¿A quién le confirmo? No encontré a "+bN+": escribe el nombre.":"¿Cuál "+bN+" es? Es a quien le confirmo si "+nombreCorto(aN).split(" ")[0]+" dice que sí."), ops:rB.cands.slice(0,5).map(function(c){ return {id:c.id, label:c.nombre}; })}); }
  if(dudas){ T.cond_pend250=T.cond_pend250||{}; T.cond_pend250[cid]=P; return; }
  hecho.push(ejecutaCond(T, P));
}
function ejecutaCond(T, P){
  var enc={id:"enc"+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36), tipo:"condicional", estado:"esperando", t:"Esperar respuesta de "+P.A.nombre+" y, si dice que sí, confirmar a "+P.B.nombre,
    pregunta:{contacto:(PERSONAS[P.A.id]?P.A.nombre:nombreWA(P.A.nombre)), pedido_id:""}, si_si:{contacto:(PERSONAS[P.B.id]?P.B.nombre:nombreWA(P.B.nombre)), texto:conIA(String(P.B.nombre||"").split(/\s+/)[0]+", de parte de "+(((PERSONAS[yo]||{}).nombre)||"Salvador")+": "+String(P.txB).replace(/^IA:\s*/i,"").trim())},
    si_no:{accion:"nota"}, vence:P.vence, creado:Date.now(), por:yo||"", origen:"dictado", tarea_id:T.id};
  T.encargos=(Array.isArray(T.encargos)?T.encargos:[]).concat([enc]); var tid=T.id;
  mandaOrden(T, P.A, P.txA, function(pid){ var V=viva249(T)||T, e=(V.encargos||[]).filter(function(x){ return x.id===enc.id; })[0]; if(e){ e.pregunta.pedido_id=pid; guarda(V); } });
  guarda(T);
  return "Le pregunté a "+nombreCorto(P.A.nombre).split(" ")[0]+". Si dice que sí, le confirmo a "+nombreCorto(P.B.nombre).split(" ")[0]+".";
}
/* una opción elegida en la duda de "¿cuál X?": cuando ya están los dos, se ejecuta. Devuelve la línea de Hecho o "" */
function resuelveCond(T, f, op){
  var P=(T.cond_pend250||{})[f.cid]; if(!P) return "";
  var per={id:op.id, nombre:op.label||op.nombre}; if(f.lado==="A") P.A=per; else P.B=per;
  if(!P.A || !P.B){ return ""; }
  delete T.cond_pend250[f.cid]; return ejecutaCond(T, P);
}
var ESTADO_COND250={esperando:"esperando respuesta", contesto_si:"dijo que sí, ya se confirmó", contesto_no:"dijo que no", confirmado:"ya se confirmó", vencido:"venció sin respuesta", cancelado:"cancelado"};
function vCondicional(t){
  var L=(t&&Array.isArray(t.encargos)?t.encargos:[]).filter(function(e){ return e && e.tipo==="condicional" && e.pregunta && e.si_si && !ENC_CERRADO263.test(String(e.estado||"")); }); if(!L.length) return "";   /* build 263: lo hecho se oculta solo */
  return '<div class="cond250">'+L.map(function(e){ var est=ESTADO_COND250[e.estado]||String(e.estado||"");
    return '<div class="cd250 e-'+esc(String(e.estado||""))+'"><span class="cdt">Esperando respuesta de '+esc(nombreCorto(e.pregunta.contacto).split(" ")[0])+' → confirmar a '+esc(nombreCorto(e.si_si.contacto).split(" ")[0])+'</span><span class="cde">'+esc(est)+(e.vence&&e.estado==="esperando"?' · vence '+esc(fechaBonita(String(e.vence).slice(0,10)))+' '+esc(String(e.vence).slice(11,16)):'')+'</span></div>'; }).join("")+'</div>';
}

/* ===== build 251: NADA SE QUEDA ATORADO =====
   Si el cerebro no dejó ninguna orden ni dato ("No cambié nada", "no me quedó claro") o la acción es imposible, se reintenta UNA vez
   (mismo modo pesado) con el prompt reforzado: contexto completo de la tarea y los últimos 10 mensajes. Si aun así no queda claro,
   sale en el acto la tarjeta de preguntas del 249 con una pregunta concreta. Nunca más un "dímelo otra vez" sin pregunta. */
var TIPOS_ORDEN251=["vincular","mensaje","claude","agendar","seguimiento","clasificar","condicional"];
function ordenesImposibles(j){ var L=(Array.isArray(j&&j.ordenes)?j.ordenes:[]).filter(function(o){ return o && typeof o==="object"; });
  return L.length>0 && L.every(function(o){ return TIPOS_ORDEN251.indexOf(String(o.tipo||"").toLowerCase())<0; }); }
function sinResultado(t, v, j, r, or, err){
  var pal=String(v||"").trim().split(/\s+/).filter(Boolean).length; if(pal<3) return false;
  if(err || ordenesImposibles(j)) return true;
  var vacio=!(r.hecho||[]).length && !(r.dudas||[]).length && !(r.vinc||[]).length && !(or.hecho||[]).length && !(or.falta||[]).length && !String((j&&j.pregunta)||"").trim();
  if(!vacio) return false;
  var comp=true; try{ comp=!!completitud(t).completa; }catch(e){}
  return !comp || ordenesDichas238(v);
}
/* nombre EXACTO como lo usa WhatsApp (el de contactos o la agenda), no el alias con paréntesis que arma la app: la Mac lo busca tal cual */
function nombresExactosWA(){
  var L=[]; try{ (window.AGENDA_WA||[]).forEach(function(a){ if(a && a.nombre) L.push(String(a.nombre).replace(/\s+/g," ").trim()); }); }catch(e){}
  (tareas||[]).forEach(function(t){ if(!t) return; (t.msgs||[]).forEach(function(x){ if(x && x.wa_c) L.push(String(x.wa_c).replace(/\s+/g," ").trim()); }); });
  return L.filter(Boolean);
}
function nombreWA(nombre){
  var n=String(nombre||"").replace(/\s+/g," ").trim(), m=n.match(/^(.*\S)\s*\(([^()]*)\)\s*$/); if(!m) return n;
  var base=m[1].trim(), L=nombresExactosWA(), nn=_n179(n), nb=_n179(base);
  var ex=L.filter(function(x){ return _n179(x)===nn; })[0]; if(ex) return ex;   /* así se llama de verdad en WhatsApp */
  var eb=L.filter(function(x){ return _n179(x)===nb; })[0]; if(eb) return eb;
  return base;   /* el alias entre paréntesis lo puso la app, no WhatsApp */
}
/* ¿es un dictado con órdenes? (largo, o dirigido a Claude) — un mensaje corto a una persona sigue su camino */
function ordenesDichas238(v){
  var s=_fsa(v), n=s.trim().split(/\s+/).filter(Boolean).length;
  var o=/\b(vincul\w*|pidele|pideles|dile|diles|escribele|mandale|avisale|revis\w*|investig\w*|analiz\w*|agend\w*|recuerdame|avisame|pasasela|que la haga|que lo haga|es de \w+|es tarea|es dato|dale seguimiento|seguimiento)\b/.test(s);
  return o && (n>=20 || /^\s*(claude|cloud|claus|oye claude|oye cloud)\b/.test(s));
}
/* ¿dio una fecha en lo dictado? entonces no se le vuelve a pedir */
function dioFecha(v, j){ var o=(j&&j.ordenes)||[]; return !!(fechaDictada(v).todas.length || /\b(manana|pasado manana|hoy|lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/.test(_fsa(v)) || o.some(function(x){ return x && _fReal(x.fecha); })); }
function vHecho(t){
  var H=t && t.hecho238; if(!H || !(H.hecho||[]).length) return "";   /* build 255: las preguntas ("Me falta") ya no van en la tarjeta: salen difuminadas, en texto, y se contestan dictando */
  return '<div class="hc238"><button class="hcx" data-hc238x="1" aria-label="Cerrar">'+ico("x",14)+'</button>'+
    '<b>Hecho:</b><ul class="hch">'+H.hecho.map(function(x){ return '<li>'+ico("check",15)+'<span>'+esc(x)+'</span></li>'; }).join("")+'</ul></div>';
}
/* ===== build 249: LA VISTA DE REVISIÓN =====
   enRevision = tarea nueva/incompleta, o con preguntas del cerebro pendientes (quien_dudas, "Me falta" con preguntas).
   Mientras el cerebro trabaja la pantalla se difumina con "Claude está acomodando…"; al terminar se libera YA REFRESCADA.
   Causa de que "no se refrescara": el snapshot de Firestore REEMPLAZA los objetos de `tareas` cada vez que se guarda; la respuesta
   del cerebro llegaba segundos después y escribía en un `t` viejo, y el render pintaba el nuevo sin los cambios hasta salir y volver
   a entrar. Ahora el callback retoma la tarea viva por id y, al terminar, repinta (y otra vez 350 ms después). */
function enRevision(t){
  if(!t || t.cierre || t.fusionada_en) return false;
  try{ if(vistaSup(t)) return false; }catch(e){}
  var f=false; try{ f=(tipoRevisar(t)==="falta"); }catch(e){}
  return f || (t.quien_dudas||[]).length>0 || !!(t.hecho238 && (t.hecho238.falta||[]).length>0);
}
function viva249(t){ var v=t&&(tareas||[]).filter(function(x){ return x && x.id===t.id; })[0]; return v||t; }
function mostrarAcomoda(){
  try{ var ya=document.getElementById("acom249"); if(ya) return;
    var d=document.createElement("div"); d.id="acom249"; d.className="acom249"; d.setAttribute("role","status"); d.setAttribute("aria-live","polite");
    d.innerHTML='<div class="ac249c"><span class="ac249sp"></span><b>Claude está acomodando…</b></div>'; document.body.appendChild(d);
    clearTimeout(window.__acomT249); window.__acomT249=setTimeout(ocultaAcomoda, 60000); }catch(e){}
}
function ocultaAcomoda(){ try{ clearTimeout(window.__acomT249); var d=document.getElementById("acom249"); if(d) d.remove(); }catch(e){} }
function liberaAcomoda(tid){
  var go=function(){ try{ if(vista==="hilo" && abierta===tid) render(); }catch(e){} };
  go(); setTimeout(go, 350); ocultaAcomoda();
  try{ var T=(tareas||[]).filter(function(z){ return z.id===tid; })[0]; if(T && vista==="hilo" && abierta===tid && preguntas249(T).length) abrePreguntas(tid); }catch(e){}
}
/* ===== build 249: LAS PREGUNTAS DEL CEREBRO, EN SU VENTANITA =====
   Una tarjeta con una pregunta por renglón, cada una con su campo (texto o dictado) o con botones si son opciones. En las de persona el
   campo autocompleta mientras se escribe, buscando en TODOS los contactos de la app (equipo, wa_contactos de todas las tareas,
   quienes escriben por WhatsApp, responsables y seguimientos, y la agenda cuando el servidor la suba). Al contestar todas se aplican
   (las de persona al momento; el resto junto al cerebro) y la tarea queda programada y refrescada. */
function esPersonaQ(q){ return /cu[aá]l\s+\S+\s+es\b|qui[eé]n\s+es\b|a\s+qui[eé]n\b|con\s+qui[eé]n\b/i.test(String(q||"")); }
/* ===== build 267: SIN BUCLE DE PREGUNTAS =====
   · "Ninguno / no / nada / no hace falta / sin seguimiento / no quiero" es una respuesta VÁLIDA: cierra la pregunta (campo "ninguno").
   · Nunca se genera una pregunta sobre la respuesta de Salvador a otra pregunta: si el cerebro no la entiende, se aplica lo más razonable, se anota "Entendí: …" y se cierra.
   · Cada pregunta contestada queda en t.resp267 y no se vuelve a hacer.
   · Las de relleno ("¿Cuándo te recuerdo…?", "¿El próximo seguimiento?") solo salen si hay fecha límite real Y seguimiento con terceros. */
var NEG267=/^(ninguno|ninguna|ningun|no|nel|nada|nada mas|no hace falta|no hay|sin seguimiento|sin fecha|sin recordatorio|no quiero|no gracias|no por ahora|por ahora no|ahorita no)$/;
function esNegativa(tx){ var s=_n179(String(tx||"")).replace(/[^a-z0-9ñ ]+/g," ").replace(/\s+/g," ").trim(); return NEG267.test(s); }
function normQ(q){ return _n179(String(q||"")).replace(/[^a-z0-9ñ ]+/g," ").replace(/\s+/g," ").trim().slice(0,90); }
var GENERICA267=/cu[aá]ndo te recuerdo|pr[oó]ximo seguimiento|darle seguimiento|antes de la fecha l[ií]mite/i;
function permiteGenerica(t){
  var fecha=!!(t && t.f_vigente && t.indefinida!==true && !t.falta_fecha && !(typeof fechaPuestaSola==="function" && fechaPuestaSola(t)));
  var terceros=!!(t && ((t.wa_contactos||[]).length || (t.seg_a && t.seg_a.contacto) || t.revisa_ext || (t.duenio && t.duenio!==yo) || (t.revisores||[]).length));
  return fecha && terceros;
}
/* la última respuesta de Salvador en la tarea y si una pregunta ya se contestó: lectores del bloque @@CAMPOS-UNICOS */
function ultimaRespuesta(t){ return ultimaRespuestaDe(t); }
function contestadaDespues(t, f){ var ts=+(f && f.ts)||0; return ts>0 && ts<=ultimaRespuesta(t); }
/* contestada = el lector único (respuestas_log y, de respaldo, resp267, lo apartado y «Respuesta a «q»») */
function respondida(t, q){ return yaContestada(t, q); }
function bloqueaQ(t, q){ return (GENERICA267.test(String(q||"")) && !permiteGenerica(t)) || respondida(t, q) || /^No me quedó claro qué hacer con «Respuesta a/.test(String(q||"")); }
function purga267(t){
  if(!t) return false; var cambio=false;
  if(t.hecho238 && Array.isArray(t.hecho238.falta)){ var a=t.hecho238.falta.length;
    t.hecho238.falta=t.hecho238.falta.filter(function(f){
      if(f && f.q && contestadaDespues(t, f)){ anotaRespuesta(t, f.q, "", yo, "app", ultimaRespuesta(t)); return false; }   /* contestada: que no regrese con otra fecha */
      return !(f && f.q && (bloqueaQ(t,f.q))); });
    if(t.hecho238.falta.length!==a) cambio=true; }
  if(Array.isArray(t.falta263)){ var b=t.falta263.length; t.falta263=t.falta263.filter(function(f){ return !(f && f.q && bloqueaQ(t,f.q)); }); if(t.falta263.length!==b){ cambio=true; if(!t.falta263.length) delete t.falta263; } }
  return cambio;
}
function purgaViejo(t){
  var cambio=false;
  /* lo que escribía el viejo "respuesta no clara": ya no existe (la Mac lleva el seguimiento con plan[]) */
  if((t.decision_dato||[]).length || (t.repreg||[]).length){ t.decision_dato=[]; delete t.repreg; cambio=true; if(t.pendiente_dato){ t.pendiente_info=""; t.pendiente_tipo=""; delete t.pendiente_dato; } }
  return cambio;
}
function purga267Todas(){ var n=0; (tareas||[]).forEach(function(t){ try{ var c1=purga267(t), c2=purgaViejo(t); if(c1||c2){ n++; guarda(t); } }catch(e){} }); return n; }
function preguntas249(t){
  var P=[]; if(!t) return P;
  try{ purga267(t); }catch(e){}
  (t.quien_dudas||[]).forEach(function(d){ P.push({k:"persona", id:d.id, q:"¿Quién es "+d.dicho+"?", dicho:d.dicho, cands:(d.cands||[]).slice(0,5)}); });
  ((t.hecho238||{}).falta||[]).forEach(function(f, i){ if(!f || !f.q) return;
    if(f.k==="txt" && /^¿Quién es .*Te dejé/.test(String(f.q))) return;   /* ya va como renglón de persona */
    P.push({k:f.k||"txt", hi:i, q:String(f.q), ops:(f.ops||[]).slice(0,6), texto:f.texto, persona:esPersonaQ(f.q)}); });
  (t.falta263||[]).forEach(function(f){ if(f && f.q) P.push({k:"txt", q:String(f.q), ops:[], d263:1, persona:esPersonaQ(f.q)}); });   /* build 263: lo que falta, en pregunta precisa */
  try{ if(typeof registroPreg==="function") registroPreg(t).forEach(function(r){ P.push(r); }); }catch(e){ console.warn("reg266",e); }
  return P;
}
function contactosApp(){
  var out=[], vis={};
  function pon(id, nombre, sub, alias){ nombre=String(nombre||"").replace(/\s+/g," ").trim(); var nn=_n179(nombre); if(!nn || /^\+?\d[\d\s-]+$/.test(nombre) || /^grupo\b/i.test(nombre)) return;
    var o=vis[nn]; if(o){ if(alias && (o.alias||"").indexOf(alias)<0) o.alias=((o.alias||"")+" "+alias).trim(); return; }
    o={id:id||"ext:"+nombre, nombre:nombre, sub:sub||"", alias:alias||""}; vis[nn]=o; out.push(o); }
  try{ todosLosContactos().forEach(function(c){ pon(c.id, c.nombre, c.sub, c.alias); }); }catch(e){}
  (tareas||[]).forEach(function(t){ if(!t) return;
    (t.wa_contactos||[]).forEach(function(c){ var n=String((c&&c.nombre)||c||""); pon("ext:"+n, n, "contacto en “"+corta40(t.nombre||"")+"”"); });
    if(t.revisa_ext) pon("ext:"+t.revisa_ext, t.revisa_ext, "responsable en “"+corta40(t.nombre||"")+"”");
    if(t.seg_a && t.seg_a.contacto) pon("ext:"+t.seg_a.contacto, t.seg_a.contacto, "seguimiento en “"+corta40(t.nombre||"")+"”");
    if(t.wa_contacto) pon("ext:"+t.wa_contacto, t.wa_contacto, "WhatsApp en “"+corta40(t.nombre||"")+"”");
    try{ _compartirLista(t).forEach(function(c){ pon(c.id, c.nombre, "compartida en “"+corta40(t.nombre||"")+"”"); }); }catch(e){}
    (t.msgs||[]).forEach(function(x){ var c=x&&(x.wa_c||x.chat); if(c) pon("ext:"+c, c, "WhatsApp"); }); });
  return out;
}
function buscaContactos249(q, max){
  var ws=_tokPer(q); if(!ws.length) return [];
  return contactosApp().filter(function(c){ var toks=_tokPer(c.nombre+" "+(c.alias||""));
    return ws.every(function(w){ return toks.some(function(x){ return x===w || x.indexOf(w)===0; }); }); })
    .sort(function(a,b){ return (a.id.indexOf("ext:")===0)-(b.id.indexOf("ext:")===0) || String(a.nombre).localeCompare(String(b.nombre)); }).slice(0, max||8);
}
function cierraPreg(){ var v=document.getElementById("preg249"); if(v){ try{ clearInterval(v.__iv); }catch(e){} v.remove(); } window.__preg255=null; }
function abrePreguntas(tid, opt){
  var t=(tareas||[]).filter(function(z){ return z.id===tid; })[0]; if(!t) return;
  var P=preguntas249(t), _sf273=false; if(!P.length){ P=faltaComoPreg(t); _sf273=true; } if(!P.length) return;   /* build 273: sin preguntas precisas, lo que falta */
  var ya=document.getElementById("preg249"); if(ya){ try{ clearInterval(ya.__iv); }catch(e){} ya.remove(); }
  window.__preg255=tid; window.__pq255Last=tid;
  var v=document.createElement("div"); v.className="pq255"; v.id="preg249"; if(_sf273) v.setAttribute("data-falta273","1");
  v.innerHTML='<div class="pq255c" role="dialog" aria-label="Preguntas de Claude"><button class="pq255x" data-pq255="later" aria-label="Cerrar">'+ico("x",16)+'</button>'+
    '<h3>Contéstame por favor estas preguntas sobre <b>'+esc(t.nombre||"esta tarea")+'</b></h3>'+
    '<ol class="pq255l">'+P.map(function(p){ var ex=(p.k==="persona")?(p.cands||[]).map(function(c){ return c.nombre; }):(p.ops||[]).map(function(o){ return o.label; });
      return '<li>'+esc(p.q)+(ex.length?'<small>('+esc(ex.join(" · "))+')</small>':'')+'</li>'; }).join("")+'</ol>'+
    '<button class="pq255m" data-pq255="mic">'+ico("mic",28,1.7)+'<span>Toca y contesta con tu voz</span></button>'+
    '<button class="pq255d" data-pq255="later">Después</button></div>';
  document.body.appendChild(v);
  /* la barra normal (cuadro + micrófono) queda libre abajo: el bloque se detiene justo arriba de ella */
  var ajusta=function(){ if(!v.parentNode){ clearInterval(v.__iv); return; } var c=document.querySelector(".comp"), h=c?c.getBoundingClientRect().height:0, dc=document.getElementById("dictacapa"), h2=dc?dc.getBoundingClientRect().height:0;
    v.style.bottom=Math.max(h,h2,60)+"px"; v.classList.toggle("oyendo255", !!window.__oyendo); };
  ajusta(); v.__iv=setInterval(ajusta, 300);
  v.addEventListener("click", function(ev){
    if(ev.target.closest("[data-pq255='mic']")){ ev.stopPropagation(); var m=document.getElementById("tmic"); if(m && !window.__oyendo) m.click(); return; }
    if(ev.target.closest("[data-pq255='later']") || ev.target===v){ ev.stopPropagation(); if(window.__oyendo){ try{ paraDictadoHilo(); cierraDictado(); }catch(e){} } cierraPreg(); } });
  /* build 265: el micrófono ya NO arranca solo; Salvador lo toca (o escribe) para contestar */
}
/* UN SOLO PASO: lo dictado responde TODAS las preguntas; el cerebro (pesado) reparte la respuesta y se aplica; lo que quedó sin contestar vuelve solo en el bloque */
function enviaRespuestas(tid, texto){
  var t=(tareas||[]).filter(function(z){ return z.id===tid; })[0]; if(!t) return;
  var P=preguntas249(t); if(!P.length) return;
  cierraPreg(); mostrarAcomoda();
  var lista=P.map(function(p, i){ var ex=(p.k==="persona")?(p.cands||[]).map(function(c){ return c.nombre; }):(p.ops||[]).map(function(o){ return o.label; }); return (i+1)+". "+p.q+(ex.length?" (opciones: "+ex.join(", ")+")":""); }).join("\n");
  var prompt="Le hiciste a Salvador estas PREGUNTAS sobre la tarea “"+(t.nombre||"")+"”:\n"+lista+"\n\nÉl contestó TODO JUNTO, dictando: “"+texto+"”.\nReparte su respuesta: para cada pregunta pon lo que contestó, con sus palabras y completo (fecha y hora incluidas), o null si NO contestó esa. No inventes nada: si no la contestó, null.\nResponde SOLO JSON: {\"respuestas\":[{\"n\":1,\"r\":\"...\"},{\"n\":2,\"r\":null}]}";
  var vuelve=function(msg){ ocultaAcomoda(); var tx=document.getElementById("txt"); if(tx){ tx.value=texto; try{ marcaEnvio("tenv", texto); }catch(e){} } abrePreguntas(tid); if(msg) toast(msg); };
  preguntaAClaude([{role:"user",content:prompt}], MODO_CEREBRO, function(txt, err){
    var J=null; try{ J=JSON.parse(String(txt||"").replace(/^[^{]*/,"").replace(/[^}]*$/,"")); }catch(e){}
    if(err || !J || !Array.isArray(J.respuestas)){ vuelve("No pude repartir tu respuesta. Inténtalo otra vez"); return; }
    var A=P.map(function(){ return {texto:"", persona:null, opt:null}; });
    J.respuestas.forEach(function(x){ var i=(+(x&&x.n))-1; var r=x&&x.r; if(i>=0 && i<A.length && r!=null && String(r).trim() && !/^(null|ninguna|no contest[oó])$/i.test(String(r).trim())) A[i].texto=String(r).replace(/\s+/g," ").trim(); });
    A.forEach(function(a, i){ var ops=(P[i].k==="persona")?[]:(P[i].ops||[]), tx=_n179(a.texto); if(!tx || !ops.length) return;   /* la respuesta que coincide con una opción la elige */
      var m=ops.filter(function(o){ var l=_n179(o.label); return l && (tx===l || tx.indexOf(l)>=0 || (tx.length>=3 && l.indexOf(tx)>=0)); })[0]; if(m) a.opt=m; });
    if(!A.some(function(a){ return a.texto; })){ vuelve("No encontré respuesta a ninguna pregunta. Dímelo otra vez"); return; }
    var T=viva249(t); try{ _notaPriv(T,"bo",texto); T.msgs[T.msgs.length-1].resp_preguntas255=1; guarda(T); }catch(e){}
    enviaPreguntas(tid, P, A);
  });
}
function enviaPreguntas(tid, P, A){
  var t=(tareas||[]).filter(function(z){ return z.id===tid; })[0]; if(!t) return;
  var textos=[], quitar=[], aplicadas=0, H=t.hecho238;
  P.forEach(function(p, i){ var a=A[i], tx=String(a.texto||"").replace(/\s+/g," ").trim(); if(!tx) return;
    if(p.k==="persona"){ var per=a.persona; if(!per){ var r=resuelvePersona(t, tx); per=(r.estado==="uno")?{id:r.persona.id, nombre:r.persona.nombre}:{id:"ext:"+tx, nombre:tx}; }
      try{ resuelveDudaPersona(t, p.id, per); aplicadas++; }catch(e){} return; }
    if(!p.reg && p.k!=="persona"){ anotaRespuesta(t, p.q, tx, yo, "app"); }   /* build 267: contestada = no se vuelve a preguntar */
    if(p.hi!=null) quitar.push(p.hi);
    if(esNegativa(tx) && !p.reg && ["cond","msg","vinc","contradice259"].indexOf(p.k)<0){   /* build 267: "Ninguno" es respuesta válida */
      if(/seguimiento/i.test(p.q)){ t.ritmo=t.ritmo||"ninguno"; t.seg_ninguno=true; }
      if(/recuerdo/i.test(p.q)){ t.recordar_ninguno=true; }
      if(p.d263 && Array.isArray(t.falta263)) t.falta263=t.falta263.filter(function(f){ return !(f && f.q===p.q); });
      msg(t,"bi","Entendí: «"+corto238(p.q)+"» → ninguno."); var _mn=t.msgs[t.msgs.length-1]; _mn.canal="priv:"+yo; _mn.nota_ia=1; aplicadas++; return; }
    if(!p.reg){ try{ planDesdeRespuesta(t, p.q, tx); }catch(e){} }   /* seguimiento / próximo paso / finiquito: al plan */
    if(p.k==="contradice259"){ var fc9=(H&&H.falta||[])[p.hi]; var op9=a.opt||(/\b(cambi\w+|esta)\b/.test(_n179(tx))&&!/\bnueva\b/.test(_n179(tx))?{id:"cambiar"}:(/\b(si|nueva|crea\w*)\b/.test(_n179(tx))?{id:"nueva"}:null));
      if(fc9 && op9){ var h9=resuelveContradice(t, fc9, op9); if(h9 && H) H.hecho=(H.hecho||[]).concat([h9]); aplicadas++; } else if(p.hi!=null){ quitar.pop(); } return; }
    if(p.k==="vinc" && a.opt){ var pc=t.encargos; enlazaTareas(t.id, a.opt.id, "dictado"); var d=tareas.filter(function(x){ return x.id===a.opt.id; })[0];
      if(d && t.fusionada_en===d.id){ if(Array.isArray(pc) && pc.length) d.encargos=(Array.isArray(d.encargos)?d.encargos:[]).concat(pc); if(H){ H.hecho=(H.hecho||[]).concat(["Vinculada a “"+(d.nombre||"")+"”"]); d.hecho238=H; guarda(d); } } aplicadas++; return; }
    if((p.k==="cond"||p.k==="msg") && !a.opt && tx){ a.opt=a.persona?{id:a.persona.id, label:a.persona.nombre}:{id:"ext:"+tx, label:tx}; }   /* build 251: elegido del autocompletar o escrito */
    if(p.k==="cond" && a.opt){ var fc=(H&&H.falta||[])[p.hi]; if(fc){ var h250=resuelveCond(t, fc, a.opt); if(h250 && H) H.hecho=(H.hecho||[]).concat([h250]); } aplicadas++; return; }
    if(p.k==="msg" && a.opt){ var per2=(candidatosPersona(t).filter(function(c){ return c.id===a.opt.id; })[0])||{id:a.opt.id, nombre:a.opt.label}; var por=mandaOrden(t, per2, p.texto);
      if(H) H.hecho=(H.hecho||[]).concat(["Le escribí a "+nombreCorto(per2.nombre)+" "+por+": “"+p.texto+"”"]); aplicadas++; return; }
    if(p.reg){ try{ resuelveReg(t, p, tx); }catch(e266){ console.warn("resuelve266", e266); } }   /* build 266: cierra el registro de origen */
    textos.push("Respuesta a «"+p.q+"»: "+tx+"."); });
  if(H && quitar.length){ quitar.sort(function(a,b){ return b-a; }).forEach(function(ix){ (H.falta||[]).splice(ix,1); }); }
  guarda(t); try{ barreNotifs(true); }catch(e){}   /* build 268: contestada la pregunta, se cierra su notificación */
  if(textos.length){ completaRevision(t, textos.join(" "), {sinRevision:tipoRevisar(t)!=="falta", conservaFalta:(H&&H.falta||[]).slice()}); return; }
  liberaAcomoda(t.id);
}
/* build 263 · 6: todo dictado procesado como indicación queda OCULTO y no se guarda dos veces (el "Es para Claude" ya ocultaba el original y
   completaRevision metía una COPIA nueva sin ocultar: salía en Importante). Si ya está el mismo texto, se reutiliza. */
function registraDictado263(t, v){
  t.msgs=t.msgs||[]; var nv=_n179(String(v||"")).slice(0,200), ahora=Date.now(), ex=null;
  for(var i=t.msgs.length-1;i>=0;i--){ var m=t.msgs[i]; if(m && m.k==="bo" && (!m.de || m.de===yo) && !m.nota_ia && _n179(String(m.tr||m.t||"")).slice(0,200)===nv && ahora-(+m.ts||0)<48*3600000){ ex=m; break; } }
  if(!ex){ msg(t,"bo",v); ex=t.msgs[t.msgs.length-1]; ex.de=yo; }
  ex.completa_info=1; ex.dict238=1; if(!ex.canal && yo) ex.canal="priv:"+yo;   /* build 283: contrato con la Mac (18z38): bo + de + canal priv + marca */
  if(!ex.oculto){ ex.oculto=true; ex.oculto_ts=ahora; ex.oculto_por=yo||""; ex.oculto_motivo=ex.oculto_motivo||"dictado_procesado"; }
  return ex;
}
/* ===== build 283 (casos «Comedor Nuevo» 7-oct 21:30 y «Cobranza Moric» 21:20): UNA ORDEN DE SALVADOR SIEMPRE PRODUCE UN CAMBIO =====
   · Lo que el cerebro rápido no resuelve (o si se cae la IA) queda de encargo en la tarea y la Mac (18z38) lo aplica en <= 2 min.
   · El texto nunca dice «dímelo otra vez»: dice que nada cambió TODAVÍA y que Claude lo termina (la Mac reconoce «No cambié nada» como orden sin aplicar).
   · La respuesta a «Decide tú» se aplica al plan con el clasificador rápido; si no se pudo, queda «Pendiente de aplicar» hasta que la Mac pone aplicado38. */
var LO_PASO283="No cambié nada todavía: lo paso a Claude para que lo aplique; en un par de minutos te confirmo aquí qué quedó.";
function ordenPendiente(t, v, motivo, tipo){
  if(!t) return null;
  var e={ id:"enc283_"+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36), tipo:tipo||"orden", estado:"pendiente",
    t:String(v||"").slice(0,1500), motivo:motivo||"", por:yo||"", creado:Date.now(), origen:"app283" };
  t.encargos=(Array.isArray(t.encargos)?t.encargos:[]).concat([e]);
  try{ guarda(t); }catch(er){}
  return e;
}
/* los contactos de ESTA tarea, tal cual (wa_contactos, revisa_ext, seg_a, quien platica por WhatsApp) */
function contactosPlan(t){
  var L=[], vis={}; if(!t) return L;
  var pon=function(n){ n=String(n||"").replace(/\s+/g," ").trim(); var k=_n179(n); if(!n || !k || vis[k] || /^\+?\d[\d\s-]+$/.test(n)) return; vis[k]=1; L.push(n); };
  (t.wa_contactos||[]).forEach(function(c){ pon((c&&c.nombre)||c); });
  if(t.revisa_ext) pon(t.revisa_ext);
  if(t.seg_a && t.seg_a.contacto) pon(t.seg_a.contacto);
  try{ contactosWA(t).forEach(function(G){ if(G && !G.eq) pon(G.nombre); }); }catch(e){}
  return L.slice(0,12);
}
/* quien de un paso: "IA", "Salvador" o un contacto de la lista TAL CUAL; si no se reconoce, null */
function quienPlan(t, q){
  var s=_n179(String(q||"")); if(!s) return null;
  if(/^(ia|claude|la ia|asistente)$/.test(s)) return "IA";
  var yoN=[]; try{ yoN=misNombres(); }catch(e){} yoN=yoN.concat(["salvador","yo","tu"]);
  if(yoN.indexOf(s)>=0 || yoN.indexOf(s.split(" ")[0])>=0) return "Salvador";
  var C=contactosPlan(t), ex=C.filter(function(c){ return _n179(c)===s; })[0]; if(ex) return ex;
  var w=s.split(" ")[0]; var pr=C.filter(function(c){ return w.length>=3 && _n179(c).split(" ").some(function(x){ return x===w; }); });
  return pr.length===1?pr[0]:null;
}
function pasoVivo(p){ return p && typeof p==="object" && p.hecho!==true && !/^(hecho|hecha|listo|lista|cumplido|cumplida|cerrado|cancelado|done)$/i.test(String(p.estado||"")); }
/* aplica pasos / hechos / que_toca (formato del plan de la Mac) con los candados de siempre. op: {dichoTs, sinSeguir}. -> {hecho:[], aplicado} */
function aplicaPlan(t, v, j, op){
  op=op||{}; var out={hecho:[], aplicado:false}; if(!t || !j || typeof j!=="object") return out;
  if(!t.resumen || typeof t.resumen!=="object" || Array.isArray(t.resumen)) t.resumen={};
  var R=t.resumen; if(!Array.isArray(R.plan)) R.plan=[];
  var dt=+op.dichoTs||Date.now(), cal=calendarioProximo(22).map(function(x){ return x.slice(0,10); }), dich=[]; try{ dich=fechaDictada(v).todas||[]; }catch(e){}
  var fOk=function(f){ f=String(f||"").slice(0,10); return (_fReal(f) && (cal.indexOf(f)>=0 || dich.indexOf(f)>=0))?f:""; };
  (Array.isArray(j.hechos)?j.hechos:[]).slice(0,10).forEach(function(id){ R.plan.forEach(function(p){
    if(pasoVivo(p) && p.id!=null && String(p.id)===String(id)){ p.estado="hecho"; p.hecho_ts=Date.now(); out.hecho.push("Ya quedó: "+String(p.que||p.t||p.tx||"").replace(/[.\s]+$/,"")); out.aplicado=true; } }); });
  var nuevos=[], base=Date.now().toString(36).slice(-4);
  (Array.isArray(j.pasos)?j.pasos:[]).slice(0,5).forEach(function(p, i){
    if(!p || typeof p!=="object") return;
    var que=String(p.que||p.tx||p.t||"").replace(/\s+/g," ").trim().slice(0,300); if(que.length<3) return;
    if(R.plan.concat(nuevos).some(function(x){ return pasoVivo(x) && _n179(String(x.que||x.t||x.tx||""))===_n179(que); })) return;   /* sin repetir */
    var quien=quienPlan(t, p.quien||"IA")||"IA", f=fOk(p.fecha);
    var paso={ id:"a283"+base+i, quien:quien, que:que, estado:"pendiente", requiere_autorizacion:false, origen:"salvador37", dicho_ts:dt, fecha:f||hoy() };
    var sg=p.seguir;
    if(sg && typeof sg==="object" && !op.sinSeguir){
      var a=quienPlan(t, sg.a), m=String(sg.en||"").match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/), tx=String(sg.texto||"").replace(/\s+/g," ").trim().replace(/^IA:\s*/i,"");
      if(a && a!=="IA" && a!=="Salvador" && m && fOk(m[1]) && +m[2]>=7 && +m[2]<=21 && tx.length>=3){
        var ms=new Date(m[1]+"T"+m[2]+":"+m[3]+":00").getTime();
        if(ms>Date.now()-60000){ paso.seguir={ en:m[1]+"T"+m[2]+":"+m[3]+":00-06:00", a:a, texto:"IA: "+tx.slice(0,700) }; if(!f) paso.fecha=m[1]; } } }
    nuevos.push(paso);
  });
  if(nuevos.length){
    var ix=-1; for(var k=0;k<R.plan.length;k++){ if(pasoVivo(R.plan[k]) && R.plan[k].origen!=="salvador37"){ ix=k; break; } }
    if(ix<0) R.plan=R.plan.concat(nuevos); else Array.prototype.splice.apply(R.plan, [ix,0].concat(nuevos));
    nuevos.forEach(function(p){
      if(p.seguir) out.hecho.push("Claude le escribe a "+nombreCorto(p.seguir.a).split(" ")[0]+" el "+fechaMovCorta(p.seguir.en.slice(0,10))+" a las "+horaCorta(p.seguir.en.slice(11,16))+": "+p.que);
      else out.hecho.push((p.quien==="IA"?"Lo hace Claude: ":(p.quien==="Salvador"?"Te toca: ":"Lo hace "+nombreCorto(p.quien).split(" ")[0]+": "))+p.que+(p.fecha && p.fecha!==hoy()?" ("+fechaMovCorta(p.fecha)+")":""));
    });
    out.aplicado=true;
  }
  var qt=String(j.que_toca||"").replace(/\s+/g," ").trim().slice(0,300);
  if(qt && _n179(qt)!==_n179(String(R.que_toca||""))){ R.que_toca=qt; out.hecho.push("En qué vamos: "+qt.replace(/[.\s]+$/,"")); out.aplicado=true; }
  if(out.aplicado) R.act283=Date.now();
  return out;
}
/* encargos que dejó la app (origen app283): se cierran solos cuando la Mac ya los aplicó, o a las 24 h. -> true si cambió algo */
function cierraEncargos(t){
  if(!t || !Array.isArray(t.encargos)) return false;
  var ch=false, R=(t.resumen && typeof t.resumen==="object")?t.resumen:{}, plan=Array.isArray(R.plan)?R.plan:[], ahora=Date.now();
  t.encargos.forEach(function(e){
    if(!e || e.origen!=="app283" || e.estado!=="pendiente") return;
    var c=+e.creado||0, listo=false;
    if(e.tipo==="decision_resp") listo=!!(t.decision && t.decision.aplicado38);
    else listo=plan.some(function(p){ return p && p.origen==="salvador37" && +p.dicho_ts>=c-600000 && +p.dicho_ts<=c+60000; }) ||   /* el paso nació de ESA orden */
      (t.msgs||[]).some(function(m){ return m && m.k==="bi" && m.orden38 && +m.ts>=c; });
    if(listo){ e.estado="hecho"; e.hecho_ts=ahora; ch=true; }
    else if(ahora-c>24*3600000){ e.estado="vencido"; ch=true; }
  });
  return ch;
}
/* build 283 (d.4): respuesta a «Decide tú» -> UNA llamada rápida (8 s) con el formato de la Mac; lo que sale se aplica en el acto */
function promptDecision(t, v){
  var D=t.decision||{}, ops=(Array.isArray(D.opciones)?D.opciones:[]).map(function(o){ return o && o.nombre; }).filter(Boolean).join(" | ");
  return "Eres Claude dentro de la app de tareas Doit. "+((PERSONAS[yo]||{}).nombre||"Salvador")+" contestó la decisión de esta tarea. Convierte su respuesta en cambios concretos del plan, sin inventar.\n"+
    "Fechas AAAA-MM-DD copiadas de este calendario (NO calcules el día): "+calendarioProximo(10).join(", ")+". HOY en Monterrey es "+fechaMty(0)+".\n"+
    "- quien de cada paso: \"IA\" (lo hace Claude), \"Salvador\", o un contacto TAL CUAL de CONTACTOS DE LA TAREA.\n"+
    "- seguir: solo si hay que escribirle a un contacto: {\"en\":\"AAAA-MM-DDTHH:MM\" entre 07:00 y 21:00,\"a\":\"contacto tal cual\",\"texto\":\"IA: … en segunda persona, de parte de Salvador\"}; si no, null.\n"+
    "- hechos: ids del PLAN ACTUAL que ya quedaron. que_toca: la línea «en qué vamos» nueva. decision_resuelta=true si su respuesta decide. campos: solo lo que dijo (ritmo, fecha AAAA-MM-DD, contexto a sumar).\n"+
    "- entendi: qué entendiste, en una frase. pregunta: SOLO si de verdad no se puede aplicar nada; si no, null.\n"+
    "Contesta SOLO JSON: {\"tipo\":\"datos|orden|decision|nada\",\"entendi\":\"…\",\"hechos\":[],\"pasos\":[{\"quien\":\"IA\",\"que\":\"…\",\"fecha\":null,\"seguir\":null}],\"que_toca\":null,\"decision_resuelta\":false,\"campos\":{\"ritmo\":null,\"fecha\":null,\"contexto\":null},\"pregunta\":null}\n\n"+
    "TAREA: "+(t.nombre||"")+"\nCONTEXTO: "+String((typeof contextoDe==="function"?contextoDe(t):"")||t.contexto||"(nada)").replace(/\s+/g," ").slice(0,800)+
    "\nDECISIÓN: "+String(D.pregunta||"").slice(0,300)+(D.recomendacion?"\nRECOMENDACIÓN: "+String(D.recomendacion).slice(0,300):"")+(ops?"\nOPCIONES: "+ops.slice(0,400):"")+
    planParaClaude(t)+"\n\nRESPUESTA DE SALVADOR: "+String(v||"").slice(0,1500);
}
function clasificaDecision(t, v, enc, cb){
  var tid=t.id, rts=(t.decision&&t.decision.respuesta&&t.decision.respuesta.ts)||Date.now(), listo=false;
  var fin=function(ok){ if(listo) return; listo=true; if(cb) try{ cb(ok); }catch(e){} };
  try{
    preguntaAClaude([{role:"user",content:promptDecision(t, v)}], MODO_RAPIDO283, function(txt, err){
      var T=viva249(t); if(!T || !T.decision || T.id!==tid){ fin(false); return; }
      if(err){ fin(false); return; }   /* sin red / se cortó: queda «Pendiente de aplicar» y la Mac lo cierra */
      var j=null; try{ var mm=String(txt||"").match(/\{[\s\S]*\}/); j=mm?JSON.parse(mm[0]):null; }catch(e){ j=null; }
      if(!j){ fin(false); return; }
      var r=aplicaPlan(T, v, j, {dichoTs:rts}), hecho=r.hecho.slice();
      try{ var cp=(j.campos && typeof j.campos==="object")?j.campos:{};
        if(cp.ritmo || cp.fecha || cp.contexto){ var c=aplicaCamposNota(T, v, {ritmo:cp.ritmo||null, fecha:cp.fecha||null, contexto:cp.contexto||null, contexto_modo:"sumar"}); (c.hecho||[]).forEach(function(h){ hecho.push(conMayuscula(String(h))); }); } }catch(e){}
      if(!hecho.length){ fin(false); return; }   /* nada aplicable: lo termina la Mac (nunca «dímelo otra vez») */
      T.decision.resuelta=true; T.decision.aplicado38={ts:Date.now(), resp_ts:rts, por:"app"};
      if(T.decision.origen284==="pendiente_info" && T.pendiente_tipo==="decision_salvador"){ T.pendiente_tipo=""; T.pendiente_info=""; T.decision_ts=Date.now(); }   /* build 284: igual que «Ya decidí» */
      (T.encargos||[]).forEach(function(e){ if(e && enc && e.id===enc.id){ e.estado="hecho"; e.hecho_ts=Date.now(); } });
      var ent=String(j.entendi||"").replace(/\s+/g," ").trim().replace(/[.\s]+$/,"");
      var nota=(ent?"Entendí: "+ent+" · ":"")+"Hice: "+hecho.join("; ")+".";
      msg(T,"bi",nota); var m=T.msgs[T.msgs.length-1]; m.canal="priv:"+yo; m.nota_claude=1; m.res283=1; m.dec283=rts;
      T.hecho238={ts:Date.now(), hecho:hecho, falta:[]};
      guarda(T); try{ sincronizaAvisos(T); }catch(e){}
      try{ if(vista==="hilo" && abierta===tid) render(); }catch(e){}
      fin(true);
    });
  }catch(e){ fin(false); }
}
/* «Decide tú» ya aplicada (por la app o por la Mac): se ve «Aplicado» y lo que cambió, 36 h */
function vDecAplicada(t){
  var D=t && t.decision; if(!D || typeof D!=="object" || !D.aplicado38 || !D.respuesta || t.cierre) return "";
  if(!(PERSONAS[yo] && PERSONAS[yo].jefe)) return "";
  if(Date.now()-(+D.aplicado38.ts||0)>36*3600000) return "";
  var rts=+D.respuesta.ts||0, nota="";
  (t.msgs||[]).forEach(function(m){ if(m && m.k==="bi" && +m.ts>=rts && (m.orden38 || m.dec283 || /^\s*IA:\s*Entend[ií]/i.test(String(m.t||"")))) nota=String(m.t||""); });
  return '<section class="cp273 cp273d" id="cp273d"><h4>Decide tú</h4>'+(D.pregunta?'<p class="cp273q">'+esc(String(D.pregunta))+'</p>':'')+
    '<div class="cp273ok">'+ico("check",15)+'<span>Contestaste: «'+esc(String(D.respuesta.t||""))+'». Aplicado.</span></div>'+
    (nota?'<p class="cp273n283">'+esc(nota)+'</p>':'')+'</section>';
}
/* build 283 (extra): la Mac (18z37) marca falta_paso_claude cuando no encuentra el siguiente paso: la tarea sale en «Falta info» con su pregunta */
function faltaPasoClaude(t){
  var f=t && t.falta_paso_claude; if(!f) return "";
  if(typeof f==="object"){ if(f.resuelto || f.hecho || /^(hecho|resuelto|cerrado|cumplido)$/i.test(String(f.estado||""))) return "";
    var fq=f.pregunta||f.q||f.que||f.texto||f.t||""; if(yaContestada(t, f)) return "";   /* ya la contestó: no se vuelve a preguntar */
    return String(f.pregunta||f.q||f.que||f.texto||f.t||"").replace(/\s+/g," ").trim().slice(0,160)||"¿Cuál es el siguiente paso de esta tarea?"; }
  if(typeof f==="string" && f.trim().length>3 && !/^(1|si|true)$/i.test(f.trim())) return f.replace(/\s+/g," ").trim().slice(0,160);
  return "¿Cuál es el siguiente paso de esta tarea?";
}
/* CANDADO DE DATOS DOCUMENTADOS (Salvador 9-oct: «dicto pensando en otra cosa; avísame antes de cambiar una fecha o un monto
   que ya está documentado»). Si lo dictado cambia la fecha de la tarea, la del evento o el monto y ya había un valor, el
   cambio NO se aplica solo: se regresa el valor de antes y se pregunta con lo que dice la documentación (lo que sabemos,
   la evidencia, el contexto). */
function datosClave(t){ var e=(t && t.evento && typeof t.evento==="object")?t.evento:{};
  var fDoc=!!(t && t.f_vigente && !t.falta_fecha && !(typeof fechaPuestaSola==="function" && fechaPuestaSola(t)));
  return {f_vigente:fDoc?String(t.f_vigente):"", ev_fecha:String(e.fecha||""), ev_hora:String(e.hora||""), gasto:String((t&&t.gasto)||"")}; }
var CLAVE_NOMBRE={f_vigente:"la fecha de la tarea", ev_fecha:"la fecha del evento", ev_hora:"la hora del evento", gasto:"el monto"};
function ponClave(t, k, val){ if(k==="f_vigente") t.f_vigente=val; else if(k==="gasto") t.gasto=val;
  else { t.evento=(t.evento && typeof t.evento==="object")?t.evento:{}; if(k==="ev_fecha") t.evento.fecha=val; else t.evento.hora=val; } }
/* compara contra lo de antes: lo que cambió un valor que ya existía se regresa y se devuelve para preguntar */
/* si lo dicho corrige a propósito («ya no es el 8», «cámbiala al 15», «en vez de…»), es un cambio pedido: no se pregunta */
var CAMBIO_A_PROPOSITO=/\b(no (termina|es|va a ser|sera|será)|ya no|cambi[oóa]\w*|c[aá]mbia\w*|mu[eé]ve\w*|en vez de|en lugar de|se pas[oó]|se movi[oó]|recorr\w*|pospon\w*|adelant\w*)\b/i;
function revisaClave(t, antes, v){ if(!t || !antes) return []; if(CAMBIO_A_PROPOSITO.test(String(v||""))) return []; var ahora=datosClave(t), out=[];
  Object.keys(antes).forEach(function(k){ if(antes[k] && ahora[k] && antes[k]!==ahora[k]){ out.push({k:k, antes:antes[k], nuevo:ahora[k]}); ponClave(t, k, antes[k]); } });
  return out; }
/* dónde dice el valor de antes: lo que sabemos, la evidencia (invitación, ticket, foto) o el contexto */
function fuenteDe(t, val){
  var d=String(val||""), pats=[d];
  if(/^\d{4}-\d{2}-\d{2}$/.test(d)){ var dd=+d.slice(8,10), mm=+d.slice(5,7)-1, M=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][mm];
    pats=[d, dd+"-"+M, dd+" de "+M, dd+" "+M]; }
  var re=new RegExp("("+pats.map(function(x){ return x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }).join("|")+")","i");
  var cand=[];
  (Array.isArray(t.evidencia)?t.evidencia:[]).forEach(function(x){ if(x) cand.push({de:(x.tipo==="texto"?"un mensaje":"la "+(x.tipo||"evidencia"))+(x.de?" de "+x.de:""), tx:String(x.texto||x.titulo||"")}); });
  (Array.isArray(t.sabemos)?t.sabemos:[]).forEach(function(x){ cand.push({de:"Lo que sabemos", tx:String((x&&(x.t||x.texto))||x||"")}); });
  cand.push({de:"el contexto", tx:String(t.contexto||"")});
  for(var i=0;i<cand.length;i++){ var m=cand[i].tx.match(re); if(m){ var p=Math.max(0, m.index-50); return {de:cand[i].de, tx:(p?"…":"")+cand[i].tx.slice(p, m.index+70).replace(/\s+/g," ")+"…"}; } }
  return null;
}
function valorBonito(k, v){ return (k==="f_vigente"||k==="ev_fecha")?fechaBonita(v):(k==="gasto"?"$"+v:v); }
function confirmaClave(tid, lista){
  var t=tareas.filter(function(x){ return x.id===tid; })[0]; if(!t || !lista.length) return;
  var c=lista[0], resto=lista.slice(1), f=fuenteDe(t, c.antes);
  sobreHoja('<div class="mov225" role="dialog" aria-label="¿Seguro que lo cambio?"><div class="h225g"></div><div class="h225h"><b>⚠️ Ojo: ¿seguro?</b><button class="h225b" data-hx254="1" aria-label="Cerrar">×</button></div>'+
    '<div class="h225c"><p class="h225v0">Aquí '+esc(CLAVE_NOMBRE[c.k])+' es <b>'+esc(valorBonito(c.k, c.antes))+'</b> y dictaste <b>'+esc(valorBonito(c.k, c.nuevo))+'</b>.</p>'+
    (f?'<p class="h225v0">Lo dice '+esc(f.de)+': «'+esc(f.tx)+'»</p>':'')+
    '<button class="hop big254 pri" data-h254="queda">No, se queda '+esc(valorBonito(c.k, c.antes))+'</button><button class="hop big254" data-h254="cambia">Sí, cambiar a '+esc(valorBonito(c.k, c.nuevo))+'</button></div></div>',
    function(k){ var T=tareas.filter(function(x){ return x.id===tid; })[0]||t;
      if(k==="cambia"){ ponClave(T, c.k, c.nuevo); msg(T,"bi","Cambié "+CLAVE_NOMBRE[c.k]+" a "+valorBonito(c.k, c.nuevo)+" (antes "+valorBonito(c.k, c.antes)+")."); var m=T.msgs[T.msgs.length-1]; m.canal="priv:"+yo; m.res238=1; guarda(T); render(); }
      else { msg(T,"bi","Se quedó "+CLAVE_NOMBRE[c.k]+" en "+valorBonito(c.k, c.antes)+"; no cambié nada."); var m2=T.msgs[T.msgs.length-1]; m2.canal="priv:"+yo; m2.res238=1; guarda(T); render(); }
      if(resto.length) setTimeout(function(){ confirmaClave(tid, resto); }, 300); });
}
function completaRevision(t, v, op){
  op=op||{};   /* build 210: {alTerminar(r), sinRevision}: audifonos (respuesta hablada; en una tarea ya autorizada no la regresa a Falta info) */
  /* build 283: "pesado" (y pantalla difuminada) solo para «Falta info» / tarea nueva; dictados e indicaciones van en "rapido", sin difuminar */
  var _pes283=!!op.pesado; if(!_pes283 && !op.sinRevision){ try{ _pes283=(tipoRevisar(t)==="falta"); }catch(e){} }
  var _modo283=_pes283?MODO_CEREBRO:(typeof MODO_RAPIDO283==="string"?MODO_RAPIDO283:"rapido"), _caida283=false, _pend283=false, _LP283=(typeof LO_PASO283==="string"?LO_PASO283:"No cambié nada todavía: lo paso a Claude para que lo aplique.");
  var _ov249=!op.alTerminar && _pes283; if(_ov249) mostrarAcomoda();   /* build 249: pantalla difuminada mientras el cerebro trabaja */
  if(!_pes283 && !op.alTerminar) try{ toast("Entendido, lo aplico…"); }catch(e){}   /* build 283: respuesta optimista; la caja ya quedó libre */
  if(window.__dict && window.__dict.tid===t.id) window.__dict.espera=true;   /* el dictado queda «aplicado» cuando el cerebro termina, no al primer guardado */
  try{ cargaAgendaWA(); }catch(e){}   /* build 248: la agenda se pide ya, para no preguntar "¿Quién es Fernando de BBVA?" si está en ella */
  if(!op.sinRevision) t.en_revision=true;   /* build 209: ya la esta completando: no sale de "Falta info" hasta "Autorizar" */
  var _antes208=okDeRevision(t);   /* build 208: lo que ya estaba palomeado ANTES de dictar (el dictado mismo cuenta en contextoDe) */
  var _m0=(typeof registraDictado263==="function")?registraDictado263(t, v):(msg(t,"bo",v), t.msgs[t.msgs.length-1]); _m0.de=yo; _m0.completa_info=1; _m0.dict238=1;   /* build 238: queda en el historial, no se repite en la vista; 263: oculto y sin duplicarse */
  t.hecho238=null; var _j238=null, _T238=t, _or238={hecho:[], falta:[]};
  t._leyendo=Date.now(); guarda(t); render();   /* la tarjeta dice "Claude está leyendo…" */
  var _fin=function(hecho, dudas, vinc){ delete t._leyendo; guarda(t); try{ sincronizaAvisos(t); }catch(e){}
    palomeaEnOrden(t, _antes208, function(){ _cierre(hecho, dudas, vinc); }); };
  var _cierre=function(hecho, dudas, vinc){
    var _pv=(vinc||[]).map(function(id){ var d=tareas.filter(function(x){ return x.id===id; })[0]; return d?"“"+nombreVinc(d)+"”":""; }).filter(Boolean);
    var _vx=_pv.length?" Posible vínculo con "+_pv.join(" o ")+": te lo dejo propuesto, no lo vinculé.":"";
    if(!op.sinRevision) revisaCompleta(t);
    var f=op.sinRevision?[]:soloMeFalta(t), _lista=!op.sinRevision && !f.length && completitud(t).completa;
    var tx=[hecho.length?"Anoté: "+hecho.join(", ")+".":"", (dudas||[]).join(" "), f.length?"Solo me falta: "+f.join(", ")+".":""].filter(Boolean).join(" ")+_vx;
    if(!hecho.length && !(dudas||[]).length && !_vx && !_or238.hecho.length && !(_or238.falta||[]).length){
      if(_lista) tx=""; else { tx=_LP283; _pend283=_pend283||(_caida283?"ia_caida":"sin_resultado"); } }   /* build 283: nunca «dímelo otra vez»: queda de encargo */
    else if(_caida283){ tx=(tx?tx+" ":"")+"No cambié nada más todavía: Claude lo termina de aplicar en un momento."; _pend283=_pend283||"ia_caida"; }
    else if(_pend283 && tx.indexOf(_LP283)<0){ tx=(tx?tx+" ":"")+_LP283; }
    if(_lista) tx=(tx?tx+" ":"")+"Revisa la ficha y pica Autorizar.";
    t=viva249(t); if(_T238 && _T238.id===t.id) _T238=t;   /* build 249: la tarea viva, no la que el snapshot ya reemplazó */
    if(_pend283){ try{ ordenPendiente(t, v, _pend283); }catch(e283){} }   /* build 283: la Mac lo aplica en <= 2 min */
    msg(t,"bi",tx.trim()); var _mr238=t.msgs[t.msgs.length-1]; _mr238.res238=1; _mr238.canal="priv:"+yo;   /* build 238: queda en el historial; en la vista va la tarjeta */
    /* build 238: tarjeta "Hecho:" / "Me falta:" (en la tarea donde quedó, si se vinculó) */
    var _dio=dioFecha(v, _j238), _fx=(op.sinRevision?[]:soloMeFalta(_T238)).filter(function(x){ return !(_dio && /fecha|finiquito|indefinid/i.test(x)); });
    _T238.hecho238={ts:Date.now(), hecho:(hecho||[]).filter(function(x){ return !/^etiquetas$/i.test(String(x)); }).map(function(x){ return conMayuscula(String(x)); }).concat(_or238.hecho),
      falta:_or238.falta.concat(((!/^Respuesta a «/.test(String(v||"")) && Array.isArray(_j238&&_j238.dudas))?_j238.dudas:[]).filter(function(d){ return d && d.pregunta && !preguntaQuienYaResuelta(t, d.pregunta); }).slice(0,3).map(function(d){ return {k:"resp", q:String(d.pregunta), ops:(Array.isArray(d.opciones)?d.opciones:[]).slice(0,4).map(function(x){ return {id:String(x), label:String(x)}; })}; })).concat((/^Respuesta a «/.test(String(v||"")) ? [] : (dudas||[])).map(function(d){ return {k:"txt", q:String(d), ops:[]}; })).concat(_fx.map(function(x){ return {k:"txt", q:"¿"+conMayuscula(String(x).replace(/[.?¿]+$/,""))+"?", ops:[]}; }))};
    try{ _T238.hecho238.falta=(_T238.hecho238.falta||[]).filter(function(f){ return f && !bloqueaQ(_T238, f.q); }); }catch(e267){}   /* build 267: una respuesta no genera preguntas nuevas; las de relleno no salen */
    if(op.conservaFalta && op.conservaFalta.length){ var _qs255=_T238.hecho238.falta.map(function(f){ return f.q; }); op.conservaFalta.forEach(function(f){ if(f && !bloqueaQ(_T238, f.q) && _qs255.indexOf(f.q)<0) _T238.hecho238.falta.push(f); }); }   /* build 255: lo que no contestó se queda */
    if(_T238!==t) guarda(_T238);
    if(window.__dict && window.__dict.tid===t.id){ window.__dict.espera=false; marcaDictado(t, _pend283?"encargado":"aplicado"); }
    guarda(t); render();
    if(_ov249 || !op.alTerminar) liberaAcomoda((_T238||t).id); else ocultaAcomoda();   /* build 249: se libera YA REFRESCADA y, si hay dudas, sale su ventanita (283: también en el rápido, sin difuminar) */
    if(op.alTerminar) try{ op.alTerminar({hecho:hecho||[], dudas:dudas||[], vinc:vinc||[], falta:f}); }catch(e){} };
  /* respaldo SIN red (o respuesta ilegible): la extraccion local del 205 */
  var _respaldo=function(){ t=viva249(t); _T238=t; _caida283=true; var loc=extraeLocal(t, v); if(t.pendiente_info && !loc.length){ delete t._leyendo; try{ ordenPendiente(t, v, "ia_caida"); }catch(e283){} completaPendiente(t.id, v); ocultaAcomoda(); if(op.alTerminar) try{ op.alTerminar({hecho:[], dudas:[], vinc:[], falta:soloMeFalta(t)}); }catch(e){} return; } _fin(loc, [], []); };
  /* build 283: «Falta info» con 15 tareas para vincular; el rápido solo 5 y solo si habla de vincular */
  var _ab=_pes283?abiertasParaVincular(t, v, 15):(/\b(vincul\w*|enlaz\w*|misma tarea|es de la tarea|junta\w*)\b/.test(_fsa(v))?abiertasParaVincular(t, v, 5):[]);
  var _lanza251=function(prompt, intento){
  try{
    preguntaAClaude([{role:"user",content:prompt}],_modo283,function(txt,err){   /* build 283: una sola llamada, sin reintento en serie */
      if(err){ _respaldo(); return; }
      var j=null; try{ var mm=String(txt||"").match(/\{[\s\S]*\}/); j=mm?JSON.parse(mm[0]):null; }catch(e){ j=null; }
      if(!j){ _respaldo(); return; }
      t=viva249(t); _T238=t;
      var _clave=(typeof datosClave==="function")?datosClave(t):null;   /* lo que la tarea ya tiene documentado (fechas, monto): un dictado no lo cambia sin preguntar */
      var r=aplicaRevisionClaude(t, v, j, _ab); _j238=j;
      var _err251=false;
      try{ if(!r.yaHecha){ _or238=ejecutaOrdenes(t, v, j, _ab); _T238=_or238.T||t; } }catch(e238){ _err251=true; try{ console.warn("ordenes238", e238); }catch(_e){} }
      if(r.contradice){ _or238=_or238||{hecho:[], falta:[]}; _or238.falta=(_or238.falta||[]).concat([r.contradice]); }
      /* build 283: pasos / hechos / que_toca en el plan (formato de la Mac). Si ya salió un mensaje por órdenes, el paso no lleva "seguir" (sin duplicar) */
      if(!r.yaHecha && !r.contradice){ try{ var _msj283=(Array.isArray(j.ordenes)?j.ordenes:[]).some(function(o){ return o && /^(mensaje|condicional|seguimiento)$/i.test(String(o.tipo||"")); });
        var _pl283=aplicaPlan(_T238||t, v, j, {dichoTs:_m0.ts, sinSeguir:_msj283}); if(_pl283.hecho.length) _or238.hecho=(_or238.hecho||[]).concat(_pl283.hecho); }catch(e283){ try{ console.warn("plan283", e283); }catch(_e){} } }
      /* build 251: NADA SE QUEDA ATORADO. Sin órdenes ni datos (o una acción imposible): UNA vez más con el prompt reforzado; si aun así no, pregunta concreta en la tarjeta del 249 */
      /* build 283: sin reintento en serie (251): lo que no dejó nada aplicable queda de encargo para la Mac, sin pregunta ni «dímelo otra vez» */
      if(!r.yaHecha && sinResultado(t, v, j, r, _or238, _err251)){
        if(/^Respuesta a «/.test(String(v||""))){ _or238.hecho=(_or238.hecho||[]).concat(["Entendí: "+String(v).replace(/Respuesta a «[^»]*»:\s*/g,"").replace(/\s+/g," ").trim().slice(0,160)]); }   /* build 267: nunca una pregunta sobre una respuesta */
        _pend283="sin_resultado"; }
      if(r.yaHecha){ delete t._leyendo; t.pendiente_info=""; t.pendiente_tipo=""; t.falta_fecha=false; t.autorizada=true; cierraHecha(t); render(); ocultaAcomoda(); if(op.alTerminar) try{ op.alTerminar({hecho:["la cerré como hecha"], dudas:[], vinc:[], falta:[], cerrada:true}); }catch(e){} return; }
      var _cg=(_clave && typeof revisaClave==="function")?revisaClave(_T238||t, _clave, v):[];
      _fin(r.hecho, r.dudas, r.vinc);
      if(_cg.length) setTimeout(function(){ confirmaClave((_T238||t).id, _cg); }, 400);
    });
  }catch(e){ _respaldo(); }
  };
  _lanza251(promptRevision(t, v, _ab, {rapido:!_pes283}), 0);
}
function loQueDetengo(){
  var a=tareas.filter(function(t){ return meDetiene(t) && !t.pendiente_info && !esDecisionSal(t) && !esPropuesta(t) });
  if(PERSONAS[yo] && PERSONAS[yo].jefe){
    tareas.forEach(function(t){ if(esDecisionSal(t) && a.indexOf(t)<0 && !esPropuesta(t)) a.push(t) });
  }
  return a;
}
function filaDecision(t){
  var b=badge(t);
  return '<li><button class="row urg" data-id="'+t.id+'" data-decision="1">'+
    '<span class="utag" aria-label="Esperando tu decisi\u00f3n">'+
      '<span class="ur">'+ico("pencil",17,1.8)+'</span><span class="uw">Decide</span></span><span>'+
    '<span class="nm">'+esc(t.nombre)+'</span>'+
    '<span class="ls dec"><b>Esperando tu decisi\u00f3n</b> \u00b7 '+esc(t.pendiente_info)+'</span></span>'+
    '<span class="meta"><span class="tm">'+((t.duenio&&t.duenio!==yo&&PERSONAS[t.duenio])?PERSONAS[t.duenio].ini:"")+'</span>'+
    (b?(b.ico?'<span class="bico">'+b.ico+'</span>':'<span class="bdg">'+b.n+'</span>'):'')+'</span></button></li>';
}
function bannerDecision(t){
  if(true) return "";   /* build 266: "Esperando tu decisión" ya no es ficha con botón: es una pregunta en texto (registroPreg) */
  if(!esDecisionSal(t) || !PERSONAS[yo] || !PERSONAS[yo].jefe) return "";
  return '<div class="decban"><div class="dect">Esperando tu decisi\u00f3n</div>'+
    '<div class="decq">'+esc(t.pendiente_info)+'</div>'+
    '<button class="op k" id="bdecidi">Ya decid\u00ed</button></div>';
}

/* EL BUSCADOR. Reusa el mismo filtro de las repetidas: cero tokens. */
var consulta="";
var vertodo=false;

/* ---- ICONOS DE TRAZO, ESTILO MAC (SF Symbols) ----
   Nada de emoji: se ven como estampas pegadas, cada una trae su propio color y
   su propio peso, y no se pueden escalar parejo. Estos son SVG de linea, un
   solo grosor, esquinas redondeadas, y heredan el color del texto
   (currentColor) — por eso el encabezado rojo los tine solo.
   Pedido por Salvador el 2026-09-02. */
function ico(n,px,gr){
  var s=px||18, w=1.5, p={   /* build 226 (regla de Salvador): todos los iconos de linea 1.5, estilo SF Symbols, un solo color */
    people:'<circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c0-3.2 2.7-5.3 6-5.3s6 2.1 6 5.3"/><circle cx="17" cy="9.5" r="2.5"/><path d="M16.5 14.3c2.6.2 4.5 2 4.5 4.6"/>',
    list:'<path d="M4 7l1.6 1.6L8.5 5.7M4 16.5l1.6 1.6 2.9-2.9M11.5 7.5h9M11.5 17h9"/>',
    audio:'<path d="M4 15v-3a8 8 0 0116 0v3"/><rect x="3.5" y="14" width="4.5" height="6.5" rx="1.6"/><rect x="16" y="14" width="4.5" height="6.5" rx="1.6"/>',
    undo:'<path d="M9 14.5 4.5 10 9 5.5"/><path d="M4.5 10H15a4.75 4.75 0 0 1 0 9.5h-3.5"/>',   /* build 278: arrow.uturn.backward */
    more:'<circle cx="5.5" cy="12" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><circle cx="18.5" cy="12" r="1.1" fill="currentColor"/>',
    move:'<path d="M4 12h15M14 7l5 5-5 5"/>', back:'<path d="M15 5l-7 7 7 7"/>', sobre:'<rect x="3.5" y="6" width="17" height="12.5" rx="2"/><path d="M4 7l8 6 8-6"/>', der:'<path d="M9 5l7 7-7 7"/>', plus:'<path d="M12 5v14M5 12h14"/>', down:'<path d="M5 9l7 7 7-7"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
    folder:'<path d="M3.5 7.5a2 2 0 012-2h4l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2h-13a2 2 0 01-2-2z"/>',
    bubble:'<path d="M5.5 4.5h13a2 2 0 012 2v8.5a2 2 0 01-2 2H10l-4.5 3.5V17h0a2 2 0 01-2-2V6.5a2 2 0 012-2z"/>',
    lupa:'<circle cx="10.5" cy="10.5" r="6.2"/><path d="M15.1 15.1 21 21"/>',
    /* build 195 (maqueta "Fichas limpias"): calendario, recurrente, dato y checklist */
    /* build 200: notificaciones */
    voces:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    campana:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    alerta:'<path d="M12 3.8 21 19.5H3z"/><path d="M12 10v4.2M12 17.2v.3"/>',
    msj:'<path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z"/>',
    cal:'<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    recur:'<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5"/>',
    dato:'<path d="M14.5 3.5l6 6-3 1-4 4 .5 4.5-1.5 1.5-4.5-4.5L4 20.5M8 11l5 5M9.5 9.5l4-4 1-2"/>',
    chk:'<path d="M7 3.5h8l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z"/><path d="M15 3.5V7.5h4M8.5 11.5l1.2 1.2 2-2.2M13.5 12h3M8.5 16h8"/>',
    mic :'<rect x="9" y="2.6" width="6" height="11.4" rx="3"/>'+
         '<path d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0"/><path d="M12 17.8v3.4"/>',
    cam :'<path d="M3 8.4h3.3l1.5-2.2h8.4l1.5 2.2H21a1 1 0 0 1 1 1v8.2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9.4a1 1 0 0 1 1-1z"/>'+
         '<circle cx="12" cy="13.4" r="3.5"/>',
    /* engrane de verdad, con dientes. Con rayos parecia un sol. */
    eng :'<path d="M10.63 2.90L13.37 2.90L13.60 5.08L15.76 5.98L17.47 4.60L19.40 6.53'+
         'L18.02 8.24L18.92 10.40L21.10 10.63L21.10 13.37L18.92 13.60L18.02 15.76'+
         'L19.40 17.47L17.47 19.40L15.76 18.02L13.60 18.92L13.37 21.10L10.63 21.10'+
         'L10.40 18.92L8.24 18.02L6.53 19.40L4.60 17.47L5.98 15.76L5.08 13.60'+
         'L2.90 13.37L2.90 10.63L5.08 10.40L5.98 8.24L4.60 6.53L6.53 4.60'+
         'L8.24 5.98L10.40 5.08Z"/><circle cx="12" cy="12" r="3.15"/>',
    clip:'<path d="M19.4 11.6 11.9 19a4.7 4.7 0 0 1-6.6-6.6l7.9-7.9a3.2 3.2 0 0 1 4.5 4.5l-7.8 7.8a1.7 1.7 0 0 1-2.4-2.4l7.1-7.1"/>',
    /* build 204: apartar (caja) y copiar */
    caja:'<path d="M3.5 7.5h17v3h-17zM5 10.5v8a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-8M10 14h4"/>',
    copia:'<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V5.5a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3"/>',
    chev:'<path d="M5.8 8.9 12 15.1l6.2-6.2"/>',
    cal :'<rect x="3.2" y="4.6" width="17.6" height="16.2" rx="2.4"/>'+
         '<path d="M3.2 9.2h17.6M8 2.8v3.4M16 2.8v3.4"/>',
    bell:'<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/>'+
         '<path d="M10 20a2 2 0 0 0 4 0"/>',
    /* build 141: campana sonando (con ondas) para la alarma roja */
    bellr:'<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/>'+
         '<path d="M10 20a2 2 0 0 0 4 0"/><path d="M3 5.5A9 9 0 0 1 5.4 3M21 5.5A9 9 0 0 0 18.6 3"/>',
    /* build 143: persona (ficha) */
    pers:'<circle cx="12" cy="8.2" r="3.6"/><path d="M5 20c.9-3.6 3.7-5.6 7-5.6s6.1 2 7 5.6"/>',
    chat:'<path d="M4 5h16v11H8l-4 4z"/>',
    reloj:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.4V12l3 2"/>',
    /* la flecha de enviar: arriba, como la de Claude y la de WhatsApp */
    sube:'<path d="M12 19.2V5.2"/><path d="M5.6 11.6 12 5.2l6.4 6.4"/>',
    mas :'<path d="M12 5.6v12.8M5.6 12h12.8"/>',
    /* bote de basura — eliminar tarea/recordatorio (Salvador 2026-09-22) */
    trash:'<path d="M4 7h16M9.5 7V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7M6.5 7l.9 12.1a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L18.5 7"/>'+
          '<path d="M10 11v6M14 11v6"/>',
    /* iconos de las 7 franjas de seccion del home (Salvador 2026-09-22) */
    warn:'<path d="M12 3.4 21.6 20H2.4L12 3.4Z"/><path d="M12 9.6v4.4M12 17.2h.01"/>',
    pencil:'<path d="M15 4l5 5-11 11H4v-5L15 4Z"/><path d="M13 6l5 5"/>',
    calx:'<path d="M7 3h8l3 3v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M9 9l6 6M15 9l-6 6"/>',
    hoja:'<path d="M7 3h10v18l-5-3-5 3V3Z"/><path d="M9 8h6M9 11.5h6"/>',
    /* palomita sola (cintillo "Hecha · Deshacer", 2026-09-24) */
    check:'<path d="M5 12.5l4.5 4.5L19 7"/>', llave:'<circle cx="7.5" cy="12" r="3.5"/><path d="M11 12h10M17.5 12v3M20.5 12v2.5"/>', circ:'<circle cx="12" cy="12" r="8"/>',
    /* circulo con "i" — build 148: icono de "análisis" en mensajes de IA */
    info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11.6v4.6M12 8.1v.01"/>'
  }[n]||"";
  return '<svg class="icx" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" '+
    'stroke="currentColor" stroke-width="'+w+'" stroke-linecap="round" '+
    'stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
}

/* ---- fecha larga para el encabezado de la lista "Hoy" ---- */
/* EL PIE SUBE CON EL TECLADO.
   En iPhone, al abrirse el teclado la pagina NO se encoge: se queda del mismo
   alto y el teclado la tapa. Por eso el pie se sube a mano con lo que mide el
   teclado, que es lo que informa visualViewport. Asi queda pegado arriba del
   teclado, como en WhatsApp, y lo que dictas o escribes se ve siempre. */
(function(){
  var vv=window.visualViewport; if(!vv) return;
  /* SOLO es "tapado por teclado" si de veras hay un input/textarea enfocado:
     el teclado real de iOS nada mas sale entonces. Sin este candado, el
     indicador de grabacion del microfono (u otro cambio del viewport durante
     el dictado por voz) se confundia con el teclado y dejaba la barra de
     abajo empujada hacia arriba, con un hueco vacio debajo, sin que hubiera
     teclado ni texto que lo justificara — bug reportado por Salvador el
     2026-09-23 (recordatorio nuevo por voz que ademas se quedo trabado). */
  function tecladoReal(){
    var e=document.activeElement;
    return !!(e && (e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.isContentEditable));
  }
  function acomoda(){
    var pie=document.querySelector(".pie"); if(!pie) return;
    var tapado=tecladoReal() ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
    pie.style.transform = tapado>0 ? "translateY(-"+tapado+"px)" : "";
    var sc=document.querySelector(".scroll");
    if(sc) sc.style.paddingBottom = tapado>0 ? tapado+"px" : "";
  }
  vv.addEventListener("resize",acomoda);
  vv.addEventListener("scroll",acomoda);
  window.addEventListener("orientationchange",function(){setTimeout(acomoda,250)});
  document.addEventListener("focusin",function(){setTimeout(acomoda,60);setTimeout(acomoda,320)});
  document.addEventListener("focusout",function(){setTimeout(acomoda,60);setTimeout(acomoda,320)});
})();

/* ====== CAPA DE DICTADO — una sola, para todos los micrófonos ======
   Se abre al empezar a hablar y muestra en vivo lo que vas diciendo (lo ya
   reconocido en blanco, lo que todavía se está oyendo en gris), con las
   barritas de audio abajo. El botón "Listo" hace lo mismo que volver a tocar
   el micrófono. Salvador 2026-09-04. */
function barritasAudio(){
  var s="";
  for(var i=0;i<34;i++) s+='<i style="animation-delay:-'+((i*7)%70)/100+'s"></i>';
  return s;
}
function abreDictado(onListo,onCancel){
  cierraDictado();
  var el=document.createElement("div");
  el.className="dictacapa vivo"; el.id="dictacapa";
  /* UNA SOLA FILA, del mismo tamaño que la barra de escribir: basura, tiempo,
     onditas y avioncito. Sin bloque de texto arriba, para que no crezca ni empuje
     nada (Salvador 2026-09-17). */
  el.innerHTML='<div class="dtxt vacio" id="dictatxt">Te escucho…</div>'+
    '<div class="dfila">'+
      '<button class="dx" id="dictax" aria-label="Cancelar">'+svgBasura()+'</button>'+
      '<span class="dtime" id="dictatime">0:00</span>'+
      '<div class="dmid"><div class="dbars">'+barritasAudio()+'</div>'+
        '<button class="dsigue" id="dictasigue" aria-label="Seguir dictando">'+ico("mic",24,1.8)+'</button></div>'+
      '<button class="dok" id="dictaok" aria-label="Enviar">'+ico("sube",21,2.2)+'</button>'+
    '</div>';
  document.body.appendChild(el);
  /* build 213: el borrador se borra SOLO al mandar o al tirar a la basura; nunca porque el motor se cayo */
  window.__dictaListo=function(){ borraBorrador(); if(typeof onListo==="function") onListo(); };
  window.__dictaCancel=function(){ borraBorrador(); if(typeof onCancel==="function") onCancel(); else cierraDictado(); };
  window.__noReabre=false;
  var bo=document.getElementById("dictaok");
  if(bo) bo.onclick=function(){ window.__dictaListo(); };
  var bx=document.getElementById("dictax");
  if(bx) bx.onclick=function(){ window.__dictaCancel(); };
  window.__pausado=false; window.__enPausa=false; window.__recPausa=null;
  var bsg=document.getElementById("dictasigue");
  if(bsg) bsg.onclick=function(){ sigueDictado(); };
  /* cronometro del dictado */
  window.__dictaSec=0;
  if(window.__dictaTimer) clearInterval(window.__dictaTimer);
  window.__dictaTimer=setInterval(function(){
    if(!document.getElementById("dictacapa")){ clearInterval(window.__dictaTimer); window.__dictaTimer=null; return }
    if(window.__enPausa) return;   /* build 165: en pausa el reloj no corre */
    window.__dictaSec++;
    var tt=document.getElementById("dictatime");
    if(tt){ var mm=Math.floor(window.__dictaSec/60), ss=window.__dictaSec%60; tt.textContent=mm+":"+(ss<10?"0":"")+ss; }
  },1000);
  return el;
}
function svgBasura(){ return '<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M9 7V5.2h6V7M6.6 7l.9 11.3a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9L18.4 7M10 10.6v5M14 10.6v5"/></svg>'; }
/* se llama en cada onresult: repinta y se va SOLO hasta abajo, para que el
   ultimo renglon dictado quede siempre a la vista */
function pintaDictado(){
  guardaBorrador();   /* build 213: en CADA resultado, lo dicho queda en el telefono */
  var c=document.getElementById("dictatxt"); if(!c) return;
  var firme=(window.__dicho||""), par=(window.__parcial||"");
  if(!firme.trim() && !par.trim()){ c.className="dtxt vacio"; c.textContent=window.__enPausa?"En pausa":"Te escucho…"; return }
  c.className="dtxt";
  c.innerHTML=esc(firme)+(par?'<span class="par">'+esc(par)+'</span>':'');
  c.scrollTop=c.scrollHeight;
  try{ requestAnimationFrame(function(){ c.scrollTop=c.scrollHeight; }); }catch(e){}   /* build 225: tras pintar, otra vez al final */
}
function cierraDictado(){
  var el=document.getElementById("dictacapa");
  if(el && el.parentNode) el.parentNode.removeChild(el);
  if(window.__dictaTimer){ clearInterval(window.__dictaTimer); window.__dictaTimer=null; }
  window.__pausado=false; window.__enPausa=false; window.__recPausa=null;
}
/* ===== ROBUSTEZ DEL MICROFONO EN IPHONE (build 81) =====
   El motor de Safari se corta solo cada rato. Antes se reprendia AL INSTANTE y
   en iPhone eso truena: quedaba muerto pero la onda seguia moviendose (la onda
   es pura animacion). Ahora: (1) al cortarse, se reprende con un respiro; (2) la
   onda solo se ilumina cuando el microfono de veras esta oyendo; (3) un vigilante
   detecta cuando quedo mudo y, en vez de dejar la onda falsa, lo apaga y avisa
   "tocalo otra vez" — asi ya no hay que cerrar la app. */
function marcaVivo(){
  window.__ultOye=Date.now(); window.__audioAbrio=true;
  var c=document.getElementById("dictacapa"); if(c) c.classList.add("vivo");
}
function paraVigia(){
  if(window.__oyeWatch){ clearInterval(window.__oyeWatch); window.__oyeWatch=null; }
}
/* RECARGA ULTRA LIGERA DEL MICROFONO (idea de Salvador 2026-09-16). En vez de
   recargar toda la app, se suelta el canal de audio que iOS deja agarrado tras
   una dictada y se limpian las banderas. Es puro JS, sin audio, imperceptible.
   Se llama al llegar al home y al empezar cada dictado, para que el canal SIEMPRE
   este fresco cuando el usuario pica el microfono. NO toca una dictada en curso. */
function recargaMic(){
  if(window.__oyendo) return;
  try{ if(window.__rec){ if(window.__rec.abort) window.__rec.abort(); else window.__rec.stop(); } }catch(e){}
  window.__rec=null; window.__audioAbrio=false; window.__gotSpeech=false;
  paraVigia();
}
/* ARRANQUE EN FRIO — el caso terco de Salvador: le picaba varias veces al
   microfono y no agarraba, y solo un reset destrababa. En iPhone, cuando el
   canal de audio de Safari se atora, ni creando microfonos nuevos revive: hay
   que recargar la pagina para que lo suelte. Aqui se hace SOLO, en silencio.
   Candados para no caer en un ciclo de recargas:
   - NO recarga en el primer intento tras abrir la app (por si es el permiso
     del microfono la primera vez).
   - NO recarga dos veces en 15s (si tras recargar sigue sin arrancar, ya no
     insiste: avisa por texto).
   - NO recarga si hay texto sin mandar en la barra (no se pierde nada). */
function reaccionaFrio(){
  var ahora=Date.now(), ult=0;
  try{ ult=+sessionStorage.getItem("bit_micReset")||0 }catch(e){}
  var bq=document.getElementById("bq");
  var _ta=document.getElementById("txt");
  var hayTexto=(bq && String(bq.textContent||"").trim()) || (_ta && String(_ta.value||"").trim()) || leeBorrador();   /* build 213: tampoco con texto en la tarea */
  var primero=(window.__micIntentos||0) <= 1;
  if(!primero && !hayTexto && ahora-ult > 15000){
    try{ sessionStorage.setItem("bit_micReset", String(ahora)) }catch(e){}
    location.reload();
  } else {
    toast("El micrófono no arrancó, tócalo otra vez");
  }
}
/* build 165: PAUSA DEL DICTADO. Antes, si el microfono se cortaba (llamada,
   silencio largo, la app se iba a segundo plano) se cerraba el dictado: lo dicho
   se perdia o salia incompleto y al querer completarlo nacia OTRA tarea. Ahora
   se pausa: el texto se queda y el microfono de en medio lo retoma, pegado a lo
   que ya llevaba. Nunca se manda solo: solo el avioncito manda. */
function pausaDictado(r, stopFn){
  if(!window.__oyendo || (r && window.__rec!==r)) return;
  var capa=document.getElementById("dictacapa");
  if(!capa){ if(stopFn) stopFn(); return; }   /* sin capa de dictado: como antes */
  window.__oyendo=false; paraVigia();
  if(window.__silT){ clearTimeout(window.__silT); window.__silT=null }
  try{ if(r){ if(r.abort) r.abort(); else r.stop(); } }catch(e){}
  if(String(window.__parcial||"").trim()){ window.__dicho=(window.__dicho||"")+window.__parcial+" "; }
  window.__parcial="";
  window.__enPausa=true; window.__recPausa={r:r, stopFn:stopFn};
  capa.classList.remove("vivo"); capa.classList.add("pausa");
  pintaDictado(); srLogD({ev:"pausa", motivo:window.__motivoPausa||"", letras:_dictaTexto().texto.length}); window.__motivoPausa="";
  pintaPausa(window.__noReabre?"No pude volver a abrir el micrófono. Lo que llevas está guardado: mándalo así o inténtalo otra vez.":"");
}
/* ===== build 213 (Salvador 7:56: entro una llamada dictando; al colgar estaba en pausa, le pico y no siguio ni mando) =====
   Causa: "seguir" hacia start() sobre el MISMO motor ya abortado (en iPhone no truena pero no oye); el vigia de arranque
   en frio, a los 3.2 s sin audio, llamaba al cierre del dictado (que vacia lo dictado) y a reaccionaFrio, que RECARGA la
   pagina si la barra de inicio esta vacia (no miraba la caja de la tarea). Ahora: lo dicho se guarda en cada resultado
   (localStorage doit_dictado); seguir SIEMPRE abre un motor nuevo y pega; si no oye, vuelve a la pausa diciendolo (no
   cierra ni recarga); en pausa: "Seguir dictando" y "Mandar así"; si la app se cerro, al volver se ofrece lo guardado. */
function _dictaTexto(){
  var ta=document.getElementById("txt"), bq=document.getElementById("bq");
  if(vista==="hilo" && ta && String(ta.value||"").trim()) return {texto:String(ta.value).trim(), campo:"txt"};
  if(bq && String(bq.value||bq.textContent||"").trim()) return {texto:String(bq.value||bq.textContent).trim(), campo:"bq"};
  return {texto:((window.__dicho||"")+" "+(window.__parcial||"")).replace(/\s+/g," ").trim(), campo:vista==="hilo"?"txt":"bq"};
}
function guardaBorrador(){
  if(!(window.__oyendo || window.__enPausa || document.getElementById("dictacapa"))) return;   /* solo lo DICTADO, no lo que se escribe */
  try{ var d=_dictaTexto(); if(!d.texto) return;
    localStorage.setItem("doit_dictado", JSON.stringify({texto:d.texto, campo:d.campo, tid:(vista==="hilo"?abierta:"")||"", ts:Date.now()})); }catch(e){}
}
function leeBorrador(){ try{ var b=JSON.parse(localStorage.getItem("doit_dictado")||"null"); if(b && b.texto && Date.now()-(b.ts||0)<48*3600000) return b; }catch(e){} return null; }
function borraBorrador(){ try{ localStorage.removeItem("doit_dictado"); }catch(e){} var x=document.getElementById("borrador"); if(x) x.remove(); }
function srLogD(o){ try{ o.ts=Date.now(); o.d=1; var l=JSON.parse(localStorage.getItem("doit_sr_log")||"[]"); l.push(o); if(l.length>40) l=l.slice(-40); localStorage.setItem("doit_sr_log", JSON.stringify(l)); }catch(e){} }
function pintaPausa(msgTx){
  var capa=document.getElementById("dictacapa"); if(!capa) return;
  var x=capa.querySelector(".dpwrap"); if(x) x.remove();
  var w=document.createElement("div"); w.className="dpwrap";
  w.innerHTML=(msgTx?'<div class="dpmsg">'+esc(msgTx)+'</div>':'')+'<div class="dpbtns"><button class="dpsigue" id="dpsigue">Seguir dictando</button><button class="dpmanda" id="dpmanda">Mandar así</button></div>';
  capa.insertBefore(w, capa.querySelector(".dfila"));
  var a=document.getElementById("dpsigue"); if(a) a.onclick=function(){ sigueDictado(); };
  var b=document.getElementById("dpmanda"); if(b) b.onclick=function(){ if(window.__dictaListo) window.__dictaListo(); };
}
function sigueDictado(){
  var p=window.__recPausa, capa=document.getElementById("dictacapa");
  if(!p || !capa) return;
  var r=p.r, SR=window.SpeechRecognition||window.webkitSpeechRecognition, n=null;
  try{ n=new SR(); }catch(e){}   /* SIEMPRE un motor nuevo: el viejo, abortado, en iPhone "arranca" pero ya no oye */
  if(n){ n.lang=(r&&r.lang)||"es-MX"; n.continuous=true; n.interimResults=true; n.onresult=r&&r.onresult; n.onerror=r&&r.onerror;
    try{ n.start(); }catch(e){ n=null; } }
  srLogD({ev:"seguir", ok:!!n});
  if(!n){ window.__noReabre=true; pintaPausa("No pude volver a abrir el micrófono. Lo que llevas está guardado: mándalo así o inténtalo otra vez."); return; }
  window.__rec=n; window.__oyendo=true; window.__pausado=false;
  window.__enPausa=false; window.__recPausa=null; window.__reanuda=true;
  capa.classList.remove("pausa"); var x=capa.querySelector(".dpwrap"); if(x) x.remove();
  pintaDictado();
  enlazaRec(n, p.stopFn);
}
/* al volver (o si la app se cerro): lo dictado sin mandar se ofrece con "Seguir dictando" y "Mandar así" */
function ofreceBorrador(){
  var b=leeBorrador(); if(!b || window.__oyendo || document.getElementById("dictacapa") || document.getElementById("borrador")) return;
  var tt=b.tid?tareas.filter(function(x){ return x.id===b.tid; })[0]:null;
  var el=document.createElement("div"); el.id="borrador";
  el.innerHTML='<button class="brx" id="brx" aria-label="Descartar">✕</button><b>Tienes un dictado sin mandar'+(tt?' en “'+esc(tt.nombre)+'”':'')+'</b>'+
    '<div class="brt">'+esc(b.texto)+'</div><div class="dpbtns"><button class="dpsigue" id="brsigue">Seguir dictando</button><button class="dpmanda" id="brmanda">Mandar así</button></div>';
  document.body.appendChild(el);
  var pon=function(){ el.remove();
    if(b.campo==="txt" && tt){ abierta=tt.id; vista="hilo"; render(); var ta=document.getElementById("txt"); if(ta){ ta.value=b.texto; try{ marcaEnvio("tenv", ta.value); }catch(e){} } return "txt"; }
    vista="lista"; render(); var bq=document.getElementById("bq"); if(bq){ bq.textContent=b.texto; try{ bq.value=b.texto; bq.classList.remove("vacia"); marcaEnvio("benv", b.texto); }catch(e){} } return "bq"; };
  document.getElementById("brx").onclick=function(){ borraBorrador(); };
  document.getElementById("brsigue").onclick=function(){ var c=pon(); srLogD({ev:"recupera", como:"seguir"}); var m=document.getElementById(c==="txt"?"tmic":"bmic"); if(m) m.click(); };
  document.getElementById("brmanda").onclick=function(){ var c=pon(); srLogD({ev:"recupera", como:"mandar"}); var e=document.getElementById(c==="txt"?"tenv":"benv"); if(e){ e.click(); borraBorrador(); } };
}
(function(){ var k=setInterval(function(){ if(typeof listo!=="undefined" && listo){ clearInterval(k); setTimeout(function(){ try{ ofreceBorrador(); }catch(e){} }, 800); } }, 1500); })();
/* si la app se va a segundo plano (entra una llamada) mientras se dicta: pausa */
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState==="hidden"){ guardaBorrador(); if(window.__oyendo && window.__rec){ window.__motivoPausa="app oculta (llamada, otra app o bloqueo)"; pausaDictado(window.__rec, window.__recStop); } }
  else { srLogD({ev:"vuelve", enPausa:!!window.__enPausa}); setTimeout(function(){ try{ ofreceBorrador(); }catch(e){} }, 600); }
});
window.addEventListener("pagehide", function(){ guardaBorrador(); srLogD({ev:"pagehide"}); });
/* ===== build 225 (Salvador 13:24, "Fideicomiso: seguimiento con BBVA": dictó "Por favor, ponle un mensaje a Fernando para
   ver si ya tiene el fideicomiso actualizado…" y solo quedó "ponle un mensaje a Fernando") =====
   CAUSA: en iPhone el motor se cierra solo tras cada pausa y enlazaRec lo reabre. Lo ultimo que iba oyendo (resultado
   "interim", sin isFinal) NUNCA se pasaba a lo firme: el siguiente resultado de la sesion nueva repintaba la caja con
   previo + __dicho + interim NUEVO y lo de antes de la pausa desaparecia. AHORA: los resultados finales de la sesion se
   juntan por posicion (sin repetir lo que Safari reenvia igual) sobre la base de las sesiones anteriores; al cerrarse el
   motor, lo que iba a medias pasa a la base (srCorte). Nada se manda solo: lo manda el avioncito; la escucha por voz
   (leeEscucha) solo cierra tras LEE_SILENCIO (3.5 s) sin palabras nuevas, con todo junto. */
function srJunta(ev){
  var res=(ev&&ev.results)||[], n=res.length||0, i0=(ev&&typeof ev.resultIndex==="number"&&ev.resultIndex>=0)?ev.resultIndex:0, p="";
  var S=window.__srSes||(window.__srSes={fins:[], prev:window.__srPrev||null});
  for(var k=i0;k<n;k++){ var r=res[k]; if(!r || !r[0]) continue; var x=String(r[0].transcript||"");
    if(!r.isFinal){ p+=x; continue; }
    var ult=null; for(var j=S.fins.length-1;j>=0;j--){ if(S.fins[j].k===k){ ult=S.fins[j]; break; } }
    if(ult && ult.t===x) continue;                                   /* Safari reenvia el mismo resultado: no se repite */
    if(!ult && S.prev && S.prev[k]===x && !S.fins.length) continue;  /* motor reabierto que no vacio su lista */
    S.fins.push({k:k, t:x}); }
  window.__dicho=((window.__srBase||"")+S.fins.map(function(f){ return f.t; }).join(" ")+(S.fins.length?" ":"")).replace(/\s{2,}/g," ").replace(/^\s+/,"");
  window.__parcial=p;
  return {dicho:window.__dicho, parcial:p};
}
function srCorte(){
  var t=((window.__dicho||"")+" "+(window.__parcial||"")).replace(/\s+/g," ").trim();
  window.__srBase=t?t+" ":""; window.__dicho=window.__srBase; window.__parcial="";
  var S=window.__srSes; window.__srSes=null; var pv={};
  if(S) S.fins.forEach(function(f){ pv[f.k]=f.t; }); window.__srPrev=S?pv:null;
}
function srArranca(){   /* base = lo que ya hay (vacio al empezar; lo dictado al seguir tras una pausa) */
  var t=((window.__dicho||"")+" "+(window.__parcial||"")).replace(/\s+/g," ").trim();
  window.__srBase=t?t+" ":""; window.__dicho=window.__srBase; window.__parcial=""; window.__srPrev=null; window.__srSes=null;
}
function enlazaRec(r, stopFn){
  srArranca();
  window.__recStop=stopFn;
  window.__micIntentos=(window.__micIntentos||0)+1;
  window.__audioAbrio=false; window.__inicioRec=Date.now();
  /* build 213: un motor viejo (ya abortado) que avisa tarde NO cuenta como que el nuevo esta oyendo */
  r.onaudiostart=function(){ if(window.__rec!==r) return; marcaVivo(); window.__reanuda=false; window.__noReabre=false; };
  r.onspeechstart=function(){ if(window.__rec===r) marcaVivo(); }; r.onsoundstart=function(){ if(window.__rec===r) marcaVivo(); };
  r.onend=function(){
    if(!window.__oyendo || window.__rec!==r) return;
    srCorte();   /* build 225: lo que iba a medias se queda */
    try{ pintaDictado(); }catch(e){}
    setTimeout(function(){
      if(!window.__oyendo || window.__rec!==r) return;
      try{ r.start(); }
      catch(e){
        setTimeout(function(){
          if(!window.__oyendo || window.__rec!==r) return;
          try{ r.start(); }
          catch(e2){ window.__motivoPausa="el motor se cerró y no reabrió"; pausaDictado(r, stopFn); }   /* build 165: pausa, no cierra */
        }, 500);
      }
    }, 250);
  };
  paraVigia();
  window.__ultOye=Date.now();
  window.__oyeWatch=setInterval(function(){
    if(!window.__oyendo || window.__rec!==r){ paraVigia(); return; }
    if(window.__pausado){ window.__ultOye=Date.now(); window.__inicioRec=Date.now(); return; }
    var ahora=Date.now();
    if(!window.__audioAbrio && ahora-window.__inicioRec > 3200){
      /* build 213: si ya habia algo dictado (o venia de una pausa), NUNCA se cierra ni se recarga: vuelve a la pausa diciendolo */
      if(window.__reanuda || _dictaTexto().texto){ window.__noReabre=true; window.__reanuda=false; window.__motivoPausa="al seguir, el micrófono no oyó"; pausaDictado(r, stopFn); return; }
      paraVigia(); if(stopFn) stopFn(); reaccionaFrio(); return;
    }
    if(window.__audioAbrio && ahora-(window.__ultOye||0) > 9000){
      window.__motivoPausa="9 s sin oír nada"; pausaDictado(r, stopFn);   /* build 165: pausa con lo dicho, no cierra */
    }
  }, 1200);
}

/* parar el dictado. usar=true -> se queda lo dictado y se busca. */
/* apagar el dictado del hilo. NO manda nada: el texto se queda en la caja
   para que se relea antes de soltarlo. */
function paraDictadoHilo(){
  window.__oyendo=false; paraVigia();
  if(window.__silT){ clearTimeout(window.__silT); window.__silT=null }
  try{ if(window.__rec){ if(window.__rec.abort) window.__rec.abort(); else window.__rec.stop(); } }catch(e){}
  window.__rec=null;
  var b=document.getElementById("tmic"); if(b) b.classList.remove("oyendo");
  cierraDictado();
  window.__dicho=""; window.__parcial="";
  try{ var _tv=document.getElementById("txt"); if(_tv) marcaEnvio("tenv", _tv.value); }catch(e){}
}
function pararDictado(usar){
  window.__oyendo=false; paraVigia();
  if(window.__silT){ clearTimeout(window.__silT); window.__silT=null }
  try{ if(window.__rec){ if(window.__rec.abort) window.__rec.abort(); else window.__rec.stop(); } }catch(e){}
  window.__rec=null;
  var b=document.getElementById("bmic"); if(b) b.classList.remove("oyendo");
  cierraDictado();
  var texto=((window.__dicho||"")+" "+(window.__parcial||"")).trim();
  window.__dicho=""; window.__parcial="";
  /* AL SOLTAR EL MICROFONO VA DERECHO A CLAUDE, no al filtro. */
  if(usar && texto){ barraEnviar(texto); }
  marcaEnvio("benv","");
}

/* ---- ¿ya la agrego a la pantalla de inicio? Si si, cero aviso. ---- */
function estaInstalada(){
  try{
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
        || window.navigator.standalone===true;
  }catch(e){ return false }
}
function busca(q){
  var ql=String(q).toLowerCase();
  /* por persona: "las vencidas de Samuel", "quién va mal de ritmo" */
  var quien=null;
  Object.keys(PERSONAS).forEach(function(k){
    var _nk=String((PERSONAS[k]&&PERSONAS[k].nombre)||"").toLowerCase();
    if(_nk && ql.indexOf(_nk)>=0) quien=k;
  });
  /* "lo que hice hoy" / "las que terminé ayer" / "las hechas": solo cerradas.
     Salvador 2026-09-22 — las tachadas ya no salen en el home, se piden aqui. */
  if(/\b(hech[oa]s?|hice|hicimos|realic\w*|realizad\w*|termin\w*|logr\w*|cerrad\w*|tachad\w*|complet\w*|cumplid\w*)\b/.test(ql)){
    var diaH=/\bhoy\b/.test(ql)?hoy():(/\bayer\b/.test(ql)?dm(-1):null);
    return tareas.filter(function(t){
        if(!(t.cierre||estadoReal(t)==="cerrada")) return false;
        if(quien && t.duenio!==quien) return false;
        if(diaH) return (t.cierre&&t.cierre.f)===diaH;
        return true;
      }).sort(function(a,b){ return String((b.cierre||{}).f||"").localeCompare(String((a.cierre||{}).f||"")); });
  }
  var soloVenc=/vencid|atrasad|tarde|rojo/.test(ql);
  var soloRitmo=/ritmo|avance|va mal|van mal|atrasad/.test(ql);
  var base=tareas.filter(function(t){
    if(quien && t.duenio!==quien) return false;
    if(soloVenc && estadoReal(t)!=="vencida") return false;
    if(soloRitmo){ var r=ritmo(t); if(!r) return false }
    return true;
  });
  if(quien||soloVenc||soloRitmo) return base.filter(estaAbierta);
  if(ql==="todo") return base.filter(estaAbierta);
  var c=candidatas(q,null,true);   /* cerradas tambien: ya no se ven en el home */
  return c.length?c:base.filter(estaAbierta);
}

/* los encargos que me hicieron a mí y siguen abiertos */
function misEncargos(){
  return encargos.filter(function(e){ return e.para===yo && !e.cerrado })
    .sort(function(a,b){ return dDif(b.limite,a.limite) });
}
/* cómo va el encargo de la tarea (texto corto de la fila) */
function respuestaEncargoTxt(t){
  var en=encargadoDe(t); if(!en || en.fuente!=="encargado") return t.ultima||"";
  var e=en.encargo?encargos.filter(function(x){return x.id===en.encargo})[0]:null;
  if(!e) return "encargado";
  if(e.cerrado) return "contestó";
  var d=dDif(e.creado?iso(e.creado):en.desde, hoy());
  return d<=0 ? "sin respuesta todavía" : "sin respuesta desde hace "+d+(d===1?" día":" días");
}

/* PANTALLA "MUY CARO" — limpia, sin la ficha ni el chat. Salvador 2026-09-04:
   nada de preguntas grandes ni tarjetas pesadas. Solo "Díctame tu respuesta",
   luego "Sugerencias:" en texto suave y delgado (fácil de leer, tocables), y el
   micrófono para que él dicte lo suyo — puede mezclar ideas, subir el %, etc. */
function vNegociar(t){
  var h=encabezado("Se te hizo caro", "“"+esc(t.revisar||t.nombre)+"”"+(t.gasto?" · "+esc(t.gasto):""));
  h+='<div class="scroll"><div class="qwrap">';
  if(negociar.cargando){
    h+='<div class="negask">Pensando cómo bajarlo…</div>';
  }else{
    h+='<div class="negask">Díctame tu respuesta</div>';
    if((negociar.ops||[]).length){
      h+='<div class="suglist"><div class="suglbl">Sugerencias:</div>';
      (negociar.ops||[]).forEach(function(o){
        h+='<button class="sugln" data-jr="'+esc(o)+'">'+esc(o)+'</button>';
      });
      h+='</div>';
    }
  }
  h+='</div></div>'+barraPie(null, true);
  return h;
}
/* ====== EL HILO DE UNA REVISION ======
   Salvador 2026-09-04: el que revisa NO ejecuta nada. Ve la tarea del otro con
   su estatus, ve su chat y su evidencia, y abajo — en vez de "Ya está / Estoy
   atorado", que son del que ejecuta — tiene SUS botones: "Revisada" y
   "Posponer revisión". Lo que escribe abajo cae en el chat de la tarea del otro,
   igual que un comentario. Mismos formatos que todo lo demás. */
function vRevision(t,org){
  var qn=PERSONAS[org.duenio]?PERSONAS[org.duenio].nombre:"";
  var er=estadoReal(org);
  var pill = er==="cerrada" ? '<span class="pill p-ok">Ya la cerró</span>'
           : (er==="vencida" ? '<span class="pill p-vn">Vencida</span>'
                             : '<span class="pill p-ab">Sigue abierta</span>');
  var h='<div class="top"><button class="iconbtn" id="bback">‹</button>'+
    '<div><div class="t">'+esc(t.nombre)+'</div><div class="d">Revisas a '+esc(qn)+'</div></div>'+
    '</div>';

  h+='<div class="revficha">'+
     '<div class="rq">Tarea de '+esc(qn)+'</div>'+
     '<div class="rn">'+esc(org.nombre)+'</div>'+
     '<div class="rl">'+pill+
       (org.f_vigente?' <span class="rd" style="margin-left:7px">para el '+esc(fechaBonita(org.f_vigente))+'</span>':'')+
     '</div>'+
     (org.creada_por && org.creada_por!==org.duenio && PERSONAS[org.creada_por]
        ?'<div class="ru">Asignada por '+esc(PERSONAS[org.creada_por].nombre)+'</div>':'')+
     (org.cierra?'<div class="ru">Cierra con: '+esc(org.cierra)+'</div>':'')+
     (org.ultima?'<div class="ru">'+esc(org.ultima)+'</div>':'')+
     '</div>';

  /* su chat y su evidencia, tal cual */
  var m="";
  (org.msgs||[]).forEach(function(x){
    var q=autorMsg(x,org), meta=(q?esc(q)+" · ":"")+esc(x.h);
    m+='<div class="b '+(x.k==="bal"?"bal":(x.k==="bo"?"bo":"bi"))+'">'+esc(x.t)+
       '<span class="st">'+meta+'</span></div>';
  });
  var _orgEv=(org.evidencias||[]).filter(function(f){ return f && !f.eliminado; });
  if(_orgEv.length)
    m+='<div class="fot">'+_orgEv.map(function(f){
         return '<img src="'+f.data+'" alt="evidencia">' }).join("")+'</div>';

  /* SUS botones, no los del que ejecuta */
  var sug = estadoReal(t)==="cerrada" ? ""
    : '<button class="op k" id="brevok">Revisada</button>'+
      '<button class="op" id="brevpos">Posponer revisión</button>';

  return h+
    (posRev?'<div class="hoja"><button class="hop" data-pr="1">Mañana</button>'+
       '<button class="hop" data-pr="3">En 3 días</button>'+
       '<button class="hop" data-pr="7">En una semana</button>'+
       '<button class="hop x" data-pr="x">Cancelar</button></div>':'')+
    '<div class="scroll"><div class="msgs">'+m+'</div></div>'+
    '<div class="comp">'+(sug?'<div class="sug">'+sug+'</div>':'')+
    '<div class="pie">'+
      '<div class="caja2">'+
        '<button class="mas" id="tcam" aria-label="Agregar foto">'+ico("mas",22,2)+'</button>'+chip254(t)+
        '<div id="txt" class="caja vacia" contenteditable="true" role="textbox" '+
          'data-ph="'+(window.__avAdd===t.id?"Dicta o escribe el recordatorio":(window.__pasoAdd===t.id?"Dicta o escribe el paso nuevo":esc(phCanal(t))))+'" enterkeyhint="send" '+
          'autocorrect="on" autocapitalize="sentences" spellcheck="true"></div>'+
        '<button class="env" id="tenv" aria-label="Enviar">'+ico("sube",21,2.2)+'</button>'+
        '<button class="mic" id="tmic" aria-label="Dictar">'+ico("mic",26,1.7)+'</button>'+
      '</div>'+
    '</div></div>';
}

/* ===================== build 225 (maquetas aprobadas por Salvador: maqueta-chips-v2 + maqueta-info-tarea) =====================
   ENCABEZADO DE TAREA: chips en una linea (fecha · Metas N o Lista x/N · 👥 N · ⓘ Detalles; "Falta N" azul si falta algo).
   Cada chip abre SU hoja. Debajo, el "Resumen vivo · Claude" (una linea, se arma SOLO con lo que ya hay en la tarea; si no
   hay nada que decir no sale) y el filtro por meta sobre el chat. Las dos cosas se minimizan y se recuerda por tarea.
   Ficha de meta: fecha y estado (rojo SOLO si atrasada), siguiente paso, de quien se espera, evidencia y solo sus mensajes;
   Aprobar / Pedir correccion solo si hay entrega. MENSAJE MAL ACOMODADO: duda_tarea -> "¿Es de esta o de otra?"; dejar
   presionado -> "Mover a otra tarea" (en el origen queda OCULTO, nunca borrado; en el destino llega como NUEVO). */
var MIN225_KEY="doit_min225";
function min225(tid, k){ try{ var o=JSON.parse(localStorage.getItem(MIN225_KEY)||"{}"); return !!o[tid+"|"+k]; }catch(e){ return !!((window.__min225||{})[tid+"|"+k]); } }
function togMin(tid, k){
  var kk=tid+"|"+k, v=!min225(tid,k); window.__min225=window.__min225||{}; window.__min225[kk]=v;
  try{ var o=JSON.parse(localStorage.getItem(MIN225_KEY)||"{}"); if(v) o[kk]=1; else delete o[kk]; localStorage.setItem(MIN225_KEY, JSON.stringify(o)); }catch(e){}
  return v;
}
function _txMsg(x){ return quitaEtiquetasWA(String((x&&(x.tr||x.t))||"")).replace(/\s+/g," ").trim(); }
function msgVisible(x){ return !!x && !x.oculto && !x.eliminado; }
/* las metas en curso, por fecha */
function metasEnCurso(t){ return metasDe(t).filter(function(m){ return !metaCumplida(m); }).sort(function(a,b){ return String(a.fecha||"9999").localeCompare(String(b.fecha||"9999")); }); }
/* palabras de una meta para reconocer sus mensajes (heuristica: solo palabras de la meta; nada inventado) */
var META_VACIAS=["para","como","esta","este","esto","todo","todos","todas","quede","quedar","listo","lista","hacer","bien","antes","despues","desde","hasta","cada","pero","porque","sobre","entre","cuando","donde","resuelto","resuelta","funcionando"];
function palMeta(m){
  var out=[], fuerte=[];
  function mete(tx, arr){ _nn(tx).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).forEach(function(w){ if(w.length>=4 && META_VACIAS.indexOf(w)<0){ var r=w.slice(0,6); if(arr.indexOf(r)<0) arr.push(r); } }); }
  mete(metaCorta(m), fuerte); mete((m&&m.tx)||"", out);
  return {fuerte:fuerte, todas:out};
}
/* a que meta pertenece un mensaje: id de la meta, o "otro" si no encaja o empata */
function metaDeMsg(t, x){
  var ms=metasDe(t); if(!ms.length || !x) return "otro";
  var tx=_nn(_txMsg(x)).replace(/[^a-z0-9ñ ]+/g," "), ws={};
  tx.split(/\s+/).forEach(function(w){ if(w.length>=4) ws[w.slice(0,6)]=1; });
  var best=null, bs=0, emp=false;
  ms.forEach(function(m){ var p=palMeta(m), s=0;
    p.todas.forEach(function(r){ if(ws[r]) s+=(p.fuerte.indexOf(r)>=0?2:1); });
    if(s>bs){ bs=s; best=m; emp=false; } else if(s && s===bs) emp=true; });
  return (best && !emp) ? best.id : "otro";
}
/* RESUMEN VIVO: estado + que sigue + de quien se espera, SOLO con lo que ya hay. Sin nada -> "" */
function resumenVivo(t){
  if(!t || esDato(t)) return {una:"", partes:[]};
  var P=[], H=hoy();
  try{ if(tipoRevisar(t)==="falta"){ var f=soloMeFalta(t); if(f.length) P.push({k:"falta", tx:"Falta: "+f[0]+(f.length>1?" y "+(f.length-1)+" más":"")}); } }catch(e){}
  if(esMetas(t)){
    var pend=metasEnCurso(t), pa=pend.filter(function(m){ return (+m.estado||0)===1; }), atr=pend.filter(function(m){ return (+m.estado||0)===0 && semaforoMeta(m,H).k==="rojo"; });
    if(pa.length) P.push({k:"aprobar", tx:metaCorta(pa[0])+": entregada, por aprobar"});
    else if(atr.length) P.push({k:"atrasada", tx:metaCorta(atr[0])+": atrasada "+(-dDif(H,atr[0].fecha))+" día"+(dDif(H,atr[0].fecha)===-1?"":"s"), rojo:1});
    var sig=pend.filter(function(m){ return (+m.estado||0)===0 && pa.indexOf(m)<0 && atr.indexOf(m)<0; })[0];
    if(sig) P.push({k:"sigue", tx:"Sigue: "+metaCorta(sig)+(sig.fecha?" · "+fechaMovCorta(sig.fecha):"")});
    if(!pend.length && metasDe(t).length) P.push({k:"metas", tx:"Todas las metas cumplidas"});
  } else if(tieneChecklist(t)){
    var L=t.checklist.items, hechos=L.filter(function(x){ return (+x.estado||0)>=1; }).length;
    P.push({k:"lista", tx:(t.checklist.titulo||"Lista")+" "+hechos+"/"+L.length});
  }
  if(t.estado==="espera" && PERSONAS[yo] && PERSONAS[yo].jefe) P.push({k:"espera", tx:"Espera tu decisión"});
  else { var q=""; try{ q=vistaSup(t)?ejecutorNombre(t):""; }catch(e){}
    if(!q && t.seg_a && t.seg_a.contacto) q=String(t.seg_a.contacto);
    if(!q && t.duenio && t.duenio!==yo && PERSONAS[t.duenio]) q=PERSONAS[t.duenio].nombre;
    if(q) P.push({k:"espera", tx:"Se espera de "+nombreCorto(q)}); }
  var ult=null; (t.msgs||[]).forEach(function(x){ if(msgVisible(x) && x.wa_in && _txMsg(x)) ult=x; });
  if(ult){ var tu=_txMsg(ult).replace(/^[^:\n]{1,40}:\s*/,""); P.push({k:"ultimo", tx:"Último: "+nombreCorto(String(ult.wa_c||"")).split(" ")[0]+(ult.h?" "+ult.h:"")+" «"+(tu.length>48?tu.slice(0,47)+"…":tu)+"»"}); }
  if(/\d/.test(t.gasto||"") && !/no\s*gasta/i.test(t.gasto||"")) P.push({k:"gasto", tx:"Gasto: "+String(t.gasto).trim()});
  var sust=P.filter(function(p){ return p.k!=="ultimo"; });
  if(!sust.length) return {una:"", partes:[]};
  return {una:P.map(function(p){ return p.tx; }).join(" · "), partes:P};
}
