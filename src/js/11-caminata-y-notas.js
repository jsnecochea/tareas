/* medidor de volumen: getUserMedia con cancelación de eco; si no hay, decide el filtro de texto */
function camMedidor(){
  if(CAM.med || window.__sinMedidor276 || CAM.bargeNo) return;
  try{ if(localStorage.getItem("doit_medidor276_off")==="1") return; }catch(e){}   /* apagador por si en el iPhone el medidor baja el volumen de la voz */
  CAM.med={ok:false, picos:[], base:0};
  try{ var md=navigator.mediaDevices; if(!md || !md.getUserMedia){ CAM.med.err="sin getUserMedia"; return; }
    md.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:false}}).then(function(st){
      var ac=camAudio(); if(!ac || !CAM.on){ st.getTracks().forEach(function(x){ x.stop(); }); CAM.med=null; return; }
      var src=ac.createMediaStreamSource(st), an=ac.createAnalyser(); an.fftSize=1024; src.connect(an);
      var buf=new Float32Array(an.fftSize), M={ok:true, st:st, picos:[], base:0, ec:null};
      try{ var se=st.getAudioTracks()[0].getSettings(); M.ec=se.echoCancellation; }catch(e){}
      M.iv=setInterval(function(){ try{ an.getFloatTimeDomainData(buf); }catch(e){ return; } var q=0; for(var i=0;i<buf.length;i++) q+=buf[i]*buf[i];
        var r=Math.sqrt(q/buf.length); M.picos.push({r:r, ts:Date.now()}); if(M.picos.length>30) M.picos.shift();
        if(CAM.fase==="hablando" && !CAM.oyeBarge) M.base=M.base?M.base*0.95+r*0.05:r; }, 100);   /* ruido de fondo + eco que se cuela mientras habla */
      CAM.med=M;
    }).catch(function(e){ CAM.med={ok:false, picos:[], base:0, err:String((e&&e.name)||e)}; });
  }catch(e){ CAM.med={ok:false, picos:[], base:0, err:String(e&&e.message)}; }
}
function camMedidorApaga(){ var M=CAM.med; CAM.med=null; if(M){ clearInterval(M.iv); try{ M.st.getTracks().forEach(function(x){ x.stop(); }); }catch(e){} } }
function camNivelOk(){
  if(typeof window.__nivel276==="number") return window.__nivel276>=CAM_BARGE_UMBRAL;   /* pruebas */
  var M=CAM.med; if(!M || !M.ok) return true;
  var now=Date.now(), pico=0; M.picos.forEach(function(p){ if(now-p.ts<=700 && p.r>pico) pico=p.r; });
  return pico>=Math.max(CAM_BARGE_UMBRAL, (M.base||0)*2.5);
}
function camBargeAbre(tok){
  camBargeCierra();
  if(!camBargeOk()) return;
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition, r=null; try{ r=new SR(); }catch(e){} if(!r) return;
  r.__barge=true; r.lang="es-MX"; r.continuous=true; r.interimResults=true; try{ r.maxAlternatives=1; }catch(e){}
  r.onresult=function(e){ if(r.__muerto || tok!==CAM.tok) return; var tx="", fin=false;
    for(var j=0;j<e.results.length;j++){ var x=e.results[j]; tx+=x[0].transcript+" "; if(x.isFinal) fin=true; }
    camBargeOye(tx.replace(/\s+/g," ").trim(), tok, fin); };
  r.onerror=function(ev){ var er=(ev&&ev.error)||""; if(er==="not-allowed"||er==="service-not-allowed"||er==="audio-capture"){ r.__muerto=true; if(CAM.brec===r) camBargeFalla("micrófono mientras habla: "+er); } };
  r.onend=function(){ if(r.__muerto || CAM.brec!==r) return; setTimeout(function(){ if(CAM.brec===r && CAM.fase==="hablando" && tok===CAM.tok) camBargeAbre(tok); }, 150); };
  CAM.brec=r;
  try{ r.start(); }catch(e){ CAM.brec=null; }
}
function camBargeCierra(){ var r=CAM.brec; CAM.brec=null; CAM.oyeBarge=false; if(r){ r.__muerto=true; try{ r.abort ? r.abort() : r.stop(); }catch(e){ try{ r.stop(); }catch(e2){} } } }
function camBargeFalla(por){
  camBargeCierra(); CAM.bargeNo=true; camMedidorApaga();   /* sin interrupción el medidor no sirve: se suelta el micrófono */
  window.__barge276={off:true, por:por, ts:Date.now()};
  try{ localStorage.setItem("doit_barge276", JSON.stringify(window.__barge276)); }catch(e){}
  try{ console.warn("caminata 276: interrupción apagada en esta sesión — "+por); }catch(e){}
}
var CAM_BARGE_CMD=/^(espera|esperame|esperate|un momento|para|a ver|voy|a ver voy|ahi voy|oye|no|no no|repite|repiteme lo ultimo|que dijiste|siguiente|pausa|alto|repiteme|deshaz|deshazlo|cancela|retrocede|regresa|si|confirmame)$/;   /* build 277: + repíteme, deshazlo, cancela, retrocede, sí */
function camBargeOye(tx, tok, fin){
  var n=_camNv(tx); if(!n || !CAM.on || CAM.fase!=="hablando") return;
  if(camEco(n)){ window.__eco276=(window.__eco276||0)+1; return; }   /* es su propia voz */
  if(!camNivelOk()){ window.__bajo276=(window.__bajo276||0)+1; return; }   /* muy bajito: no es él */
  CAM.oyeBarge=true;
  if(!fin && n.split(" ").length<2 && !CAM_BARGE_CMD.test(n)) return;   /* una palabra suelta a medias: espera a confirmar */
  window.__barge276n=(window.__barge276n||0)+1;
  CAM.tok++; clearTimeout(CAM.wd); camBargeCierra();
  try{ speechSynthesis.cancel(); }catch(e){}
  if(CAM.rest) CAM.rest.cortado=true;
  camHablo(); CAM.fase=""; camPinta();
  camInterrumpido(tx);
}
function camInterrumpido(tx){
  var c=camComando(tx);
  if(c) return camHaz274(c);
  CAM.limpia=false; CAM.buf=String(tx||"").trim(); CAM.par="";   /* es el inicio de su respuesta: se queda y se sigue escuchando */
  if(CAM_CORTO.test(_camNv(CAM.buf)) || (CAM.conf && camConfCorto(CAM.buf))) return camEnvia();   /* build 277: sí / no a la confirmación */
  camEscucha("resp"); camPinta(); camRelojSilencio();
}
/* tocar el círculo mientras habla también interrumpe (respaldo si iOS no deja escuchar mientras habla) */
function camToca(){ if(!CAM.on || CAM.pausa || CAM.fase!=="hablando") return;
  CAM.tok++; clearTimeout(CAM.wd); camBargeCierra(); try{ speechSynthesis.cancel(); }catch(e){} if(CAM.rest) CAM.rest.cortado=true;
  camHablo(); CAM.fase=""; CAM.limpia=true; camEscucha("resp"); camPinta(); }
function camRepiteUlt(){
  var R=CAM.rest; if(!R || !R.G || !R.G.length) return camPresenta(true);
  var from=Math.max(0, Math.min(R.k, R.G.length-1)-1);
  camDi(R.G.slice(from), R.done);
}
/* los comandos nuevos; true = ya lo atendió */
function camAux(G){ G.aux=true; return G; }   /* frases de servicio: no cambian "lo último" ni dónde iba */
function camHaz276(c){
  if(c==="ultimo"){ camRepiteUlt(); return true; }
  if(c==="espera"){ CAM.espera276=true; camDi(camAux([{v:"A", t:camVar("espera", ["Va, te espero.","Sale, aquí estoy."]), bajito:true}]), function(){ CAM.limpia=false; camEscucha("resp"); }); return true; }
  if(c==="voy"){ camDi(camAux([{v:"A", t:camVar("voy", ["Te escucho.","Dime."]), bajito:true}]), function(){ CAM.limpia=true; camEscucha("resp"); }); return true; }
  if(c==="continua"){ var R=CAM.rest; CAM.espera276=false;
    if(R && R.cortado && R.k<R.G.length){ camDi(R.G.slice(R.k), R.done); return true; }
    CAM.limpia=true; camEscucha("resp"); return true; }
  if(CAM.qz){   /* dentro del cuestionario */
    var z=CAM.qz;
    if(c==="siguiente"){ camQuizResp("paso"); return true; }
    if(c==="repite"){ camQuizPregunta(true); return true; }
    if(c==="atras"){ if(z.i>0){ z.i--; var q=z.Q[z.i]; z.A=z.A.filter(function(o){ return o.q!==q; }); z.salt=z.salt.filter(function(o){ return o!==q; }); } camQuizPregunta(true); return true; }
    if(c==="despues"){ camQuizFin(true); return true; }
    if(c==="deshaz"){ if(CAM.ult && (z.desdeNue || !z.A.length)){ CAM.qz=null; camDeshaz(); } else { CAM.qz=null; camPresenta(true); } return true; }   /* build 277: sin respuestas aún, "deshazlo" deshace lo de la tarea anterior */
    if(c==="detalle"){ var t=camTarea(); if(t) camDi(camDetalle275(t), function(){ camQuizPregunta(true); }); return true; }
  }
  if(camK()==="msg"){
    if(c==="detalle"){ camDi(camMsgDetalle(), function(){ CAM.limpia=true; camEscucha("resp"); }); return true; }
    if(c==="deshaz" && !CAM.ult){ camSiguiente(-1); return true; }
  }
  return false;
}
/* ---------- 2 · la lista completa ---------- */
function camEsFalta(t){
  if(!t || t.es_recordatorio || !_camVivo(t)) return false;
  if(!(t.duenio===yo || (!t.duenio && t.creada_por===yo))) return false;
  try{ if(esDato(t)) return false; }catch(e){}
  return camPreguntas(t).length>0 && camChipFalta(t);
}
/* la ficha roja "Falta N" de la tarea (la misma regla de chipsTarea) */
function camChipFalta(t){
  var f=[], np=0; try{ if(tipoRevisar(t)==="falta" && !vistaSup(t) && clasif236(t)) f=soloMeFalta(t); }catch(e){}
  try{ np=preguntas249(t).length; }catch(e){}
  return !!(np || f.length);
}
function camLista276(){
  var C=camLista275(), ya={}, F=[], M=[], mg={}, conMsg={};
  var D=[]; try{ D=platicasAcomodo(); }catch(e){}
  D.forEach(function(gr){ if(!gr || !gr.t || !gr.ixs || !gr.ixs.length) return; var k="msg:"+gr.t.id+"|"+gr.ixs[0]; if(mg[k]) return; mg[k]=gr; C.g[k]="msg"; M.push(k); conMsg[gr.t.id]=1; });
  /* "Te pregunta Doit" que NO es decisión: si lo que falta son datos, va al cuestionario (4); si son mensajes, a los mensajes (5) */
  var dec=[]; C.L.forEach(function(id){ var t=tareaId240(id); if(C.g[id]!=="dec" || !t){ dec.push(id); return; }
    var real=false; try{ real=!!decision273(t) || esDecisionSal(t) || registroPreg(t).length>0; }catch(e){ real=true; }
    if(real){ dec.push(id); return; }
    var fa=false; try{ fa=camEsFalta(t); }catch(e){}
    if(fa){ C.g[id]="fal"; F.push(id); return; }
    if(conMsg[id]){ delete C.g[id]; return; }
    dec.push(id); });
  C.L=dec; dec.forEach(function(id){ ya[id]=1; }); F.forEach(function(id){ ya[id]=1; });
  (tareas||[]).forEach(function(t){ if(!t || ya[t.id]) return; var ok=false; try{ ok=camEsFalta(t); }catch(e){} if(ok){ ya[t.id]=1; C.g[t.id]="fal"; F.push(t.id); } });
  var n={dec:0, lla:0, nue:0}; C.L.forEach(function(id){ n[C.g[id]]=(n[C.g[id]]||0)+1; });
  C.L=C.L.concat(F, M); n.fal=F.length; n.msg=M.length; C.n=n; C.mg=mg;
  return C;
}
/* ---------- el cuestionario ---------- */
var CAM_QM={quien:"¿Quién la hace?", finiquito:"¿Para cuándo la quieres terminar, o es indefinida?", seguimiento:"¿Cuándo te recuerdo para darle seguimiento?", que:"¿Qué es esto?", de:"¿De quién o de qué proyecto es?", cifras:"¿Cuáles son las cifras?"};
var CAM_MONTO=/\b(cotiz\w*|pag[oa]r?|pagos?|precio|costo|cuesta|monto|presupuesto|factura\w*|cobr\w*|abono|anticipo|renta|deposit\w*|transfer\w*)\b|\$/;
function camPreguntas(t){
  var Q=[], ya={}; if(!t) return Q;
  var pon=function(o){ var k=_camNv(o.q); if(!k || ya[k]) return; try{ if(!o.reg && o.k!=="persona" && bloqueaQ(t, o.q)) return; }catch(e){} ya[k]=1; Q.push(o); };
  try{ preguntas249(t).forEach(function(p){ if(p && p.q && !p.reg && ["txt","persona","resp","falta273"].indexOf(p.k||"txt")>=0) pon(p); }); }catch(e){}
  var c=null; try{ c=completitud(t); }catch(e){}
  if(c){
    if(!c.ctxOk) pon({k:"txt", q:"¿De qué se trata? Dame un poco de contexto.", c276:"ctx"});
    c.items.forEach(function(x){ if(x.ok || x.k==="agenda") return; var q=CAM_QM[x.k]; if(q) pon({k:"txt", q:q, c276:x.k}); });
    var txt=_camNv([t.nombre, t.contexto, (t.resumen&&t.resumen.texto)||""].join(" "));
    var hayMonto=/\d/.test(String(t.gasto||"")) || /no\s*gasta/i.test(String(t.gasto||"")) || (t.datos_corregidos||[]).some(function(d){ return /\d/.test(String((d&&d.t)||d||"")); }) || /\$\s?\d|\d[\d,.]*\s*(pesos|mil|mxn|dlls?|dolares)/.test(txt);
    if(c.tipo!=="dato" && !hayMonto && CAM_MONTO.test(txt)) pon({k:"txt", q:"¿De cuánto es el monto?", c276:"monto"});
  }
  return Q.slice(0, CAM_QZ_MAX);
}
function camEtiqueta(q){
  var s=String((q&&q.q)||q||""), k=q&&q.c276;
  if(k==="ctx" || /contexto|de qu[eé] se trata/i.test(s)) return "el contexto";
  if(k==="finiquito" || /finiquito|para cu[aá]ndo|cu[aá]ndo termina|fecha/i.test(s)) return "la fecha";
  if(k==="quien" || /^¿?qui[eé]n la hace/i.test(s)) return "quién la hace";
  if(k==="seguimiento" || /seguimiento|te recuerdo/i.test(s)) return "el seguimiento";
  if(k==="monto" || /monto|cifras|cu[aá]nto/i.test(s)) return "el monto";
  if(k==="de" || /de qui[eé]n o de qu[eé] proyecto/i.test(s)) return "de quién es";
  return camCorta(s.replace(/[¿?]/g,"").trim(), 60).replace(/[.\s]+$/,"");
}
var CAM_QZ_SALTA=/^(paso|lo paso|no se|no lo se|no se todavia|todavia no se|ni idea|no tengo ese dato|no tengo idea|no sabria decirte|luego te digo|despues te digo|no tengo|sin dato|ahorita no se)$/;
function camQuizTrasAcomodar(t, a){
  if(!t || (CAM.g[t.id]||"")!=="nue" || a!=="aprobar") return [];
  try{ if(esPropuesta(t) || esDato(t) || t.fusionada_en || t.cierre) return []; }catch(e){ return []; }
  return camPreguntas(t);
}
function camQuizEmpieza(t, Q, G0, op){
  op=op||{};
  CAM.qz={id:t.id, Q:Q, i:0, A:[], salt:[], desdeNue:!!op.desdeNue};
  var G=(G0||[]).slice();
  if(op.desdeNue) G.push({v:"A", t:Q.length===1?"Le falta un dato.":"Le faltan "+Q.length+" datos."});
  if(!CAM.qzExpl){ CAM.qzExpl=true; G.push({v:"A", t:"Una por una. Si no lo sabes, di paso."}); }
  camQuizPregunta(false, G);
}
function camQuizPregunta(rep, G0){
  var z=CAM.qz; if(!z) return camSiguiente(1);
  if(z.i>=z.Q.length) return camQuizFin(false);
  var G=(G0||[]).slice(); G.push({v:"A", t:z.Q[z.i].q});
  CAM.limpia=true; CAM.vacioDicho=false; camPinta();
  camDi(G, function(){ camEscucha("resp"); });
}
function camQuizResp(v){
  var z=CAM.qz; if(!z) return camSiguiente(1);
  var q=z.Q[z.i], n=_camNv(v), salta=CAM_QZ_SALTA.test(n);
  if(salta) z.salt.push(q); else z.A.push({q:q, a:String(v).replace(/\s+/g," ").trim()});
  z.i++;
  var ack=salta?camVar("qsal", ["Va, queda pendiente.","Sale, lo dejamos."]):camVar("qok", ["Va.","Anotado.","Sale."]);
  if(z.i>=z.Q.length) return camQuizFin(false, ack);
  camQuizPregunta(false, [{v:"A", t:ack}]);
}
function camQuizFin(abandona, ack){
  var z=CAM.qz; CAM.qz=null; if(!z) return camSiguiente(1);
  var t=tareaId240(z.id);
  if(abandona) z.salt=z.salt.concat(z.Q.slice(z.i));
  var pend=[], ya={}; z.salt.forEach(function(q){ var e=camEtiqueta(q); if(!ya[e]){ ya[e]=1; pend.push(e); } });
  if(t && z.A.length){ try{ camAplicaQuiz(t, z.A); }catch(e){ console.warn("caminata 276 cuestionario", e); } }
  CAM.res276=CAM.res276||{}; if(t) CAM.res276[t.id]=1;
  if(pend.length && t) CAM.pendQ=(CAM.pendQ||[]).concat([juntaY(pend.slice(0,3))+" de "+camNombre(t)]);
  var tx=!pend.length?camVar("qfin", ["Listo, ya tiene todo.","Quedó completa."]):(pend.length===1?"Quedó pendiente: ":"Quedaron pendientes: ")+juntaY(pend.slice(0,4))+".";
  var G=[]; if(ack && !pend.length) G.push({v:"A", t:ack}); G.push({v:"A", t:tx});
  camDi(G, function(){ camSiguiente(1); });
}
/* las respuestas van a la tarea como la tarjeta de preguntas (enviaPreguntas): persona, "ninguno", y lo demás junto a completaRevision.
   No se espera al cerebro: la caminata sigue; lo que él no alcance queda en la ficha Falta. */
function camAplicaQuiz(t, A, cb){
  if(!t) return; var T=tareaId240(t.id)||t, textos=[], quita=[], H=T.hecho238;
  try{ (T.encargos||[]).forEach(function(e){ if(e && e.caminata && e.k==="cuestionario" && e.estado==="pendiente"){ e.estado="hecho"; e.hecho_ts=Date.now(); e.resultado="respuesta del cuestionario aplicada a la tarea"; e.por286="app"; } }); }catch(e){}
  A.forEach(function(o){ var p=o.q, tx=String(o.a||"").replace(/\s+/g," ").trim(); if(!tx) return;
    if(p.k==="persona"){ var r=null; try{ r=resuelvePersona(T, tx); }catch(e){} var per=(r && r.estado==="uno")?{id:r.persona.id, nombre:r.persona.nombre}:{id:"ext:"+tx, nombre:tx}; try{ resuelveDudaPersona(T, p.id, per); }catch(e){} return; }
    try{ anotaRespuesta(T, p.q, tx, yo, "caminata"); }catch(e){}
    if(p.hi!=null) quita.push(p.hi);
    if(p.d263 && Array.isArray(T.falta263)) T.falta263=T.falta263.filter(function(f){ return !(f && f.q===p.q); });
    var neg=false; try{ neg=esNegativa(tx); }catch(e){}
    if(neg){ if(/seguimiento/i.test(p.q)){ T.ritmo=T.ritmo||"ninguno"; T.seg_ninguno=true; } if(/recuerdo/i.test(p.q)) T.recordar_ninguno=true;
      if(/finiquito|para cu[aá]ndo/i.test(p.q) && /indefinid/i.test(_camNv(tx))) T.indefinida=true;
      msg(T,"bi","Entendí: «"+camCorta(p.q, 80)+"» → ninguno."); var mn=T.msgs[T.msgs.length-1]; mn.canal="priv:"+yo; mn.nota_ia=1; return; }
    try{ planDesdeRespuesta(T, p.q, tx); }catch(e){}
    textos.push("Respuesta a «"+p.q+"»: "+tx+"."); });
  if(H && quita.length){ quita.sort(function(a,b){ return b-a; }).forEach(function(ix){ (H.falta||[]).splice(ix,1); }); }
  guarda(T);
  if(!textos.length){ if(cb) cb(true); return; }
  var sinRev=true; try{ sinRev=tipoRevisar(T)!=="falta"; }catch(e){}
  try{ completaRevision(T, textos.join(" "), {sinRevision:sinRev, caminata276:1, alTerminar:function(r){
      var X=tareaId240(T.id); if(X && X.f_vigente && window.__p256f) delete window.__p256f[X.id];
      window.__qz276=(window.__qz276||[]).concat([{id:T.id, r:r, ts:Date.now()}]).slice(-20); if(cb) cb(true, r); }}); }
  catch(e){ console.warn("caminata 276 completaRevision", e); if(cb) cb(false); }
}
function camFalPresenta(repite){
  var t=camTarea(); if(!t) return camSiguiente(1);
  var Q=camPreguntas(t); if(!Q.length) return camSiguiente(1);
  CAM.limpia=true; CAM.vacioDicho=false; CAM.aclara=null;
  var G=[], pos=CAM.i, prevK=pos>0?CAM.g[CAM.L[pos-1]]:"";
  if(!repite && pos>0 && prevK!=="fal") G.push({v:"A", t:camVar("gf", ["Ahora las que tienen datos pendientes.","Vamos con las que les faltan datos."])});
  G.push({v:"A", t:(repite?camVar("otra", ["Otra vez: ","De nuevo: "]):camVar("abfal", ["Le faltan datos a: ","Sigue: ","Ahora: "]))+camNombre(t)+"."});
  G.push({v:"B", t:Q.length===1?"Es una pregunta.":"Son "+Q.length+" preguntas."});
  camQuizEmpieza(t, Q, G);
}
/* ---------- 5 · mensajes por acomodar ---------- */
function camMsgGr(){ return (CAM.mg||{})[CAM.L[CAM.i]]||null; }
function camMsgVivo(id){
  var gr=(CAM.mg||{})[id]; if(!gr) return false; var t=tareaId240(gr.t.id); if(!t) return false;
  return gr.ixs.some(function(ix){ var x=(t.msgs||[])[ix]; return x && !x.oculto && !x.eliminado && !confirmado237(x); });
}
function camNomT(x){ return camCorta(limpiaHabla(tareaCorta(x)||x.nombre||""), 60).replace(/[.\s]+$/,""); }
/* las 2 tareas más probables: la que adivinó la IA, la alternativa de su duda y si no, la mejor parecida (motor de Vincular) */
function camMsgCands(gr){
  var t=tareaId240(gr.t.id), C=[]; if(!t) return C; C.push(t);
  var d=gr.duda && gr.duda.duda_tarea;
  if(d){ var a=d.alternativa_id?tareaId240(d.alternativa_id):null;
    if(!a && d.alternativa_nombre) a=(tareas||[]).filter(function(x){ return x && x.id!==t.id && _camNv(x.nombre)===_camNv(d.alternativa_nombre); })[0]||null;
    if(a && a.id!==t.id) C.push(a); }
  if(C.length<2){ try{ var S=sugeridasPara(t, gr.ixs); (S.sims||[]).some(function(x){ if(x && x.id!==t.id && _camVivo(x)){ C.push(x); return true; } return false; }); }catch(e){} }
  return C.slice(0,2);
}
function camMsgPresenta(repite){
  var gr=camMsgGr(), t=camTarea(); if(!gr || !t) return camSiguiente(1);
  CAM.limpia=true; CAM.vacioDicho=false; CAM.aclara=null;
  var C=camMsgCands(gr); CAM.mc=C;
  var G=[], pos=CAM.i, prevK=pos>0?CAM.g[CAM.L[pos-1]]:"";
  if(!repite && pos>0 && prevK!=="msg") G.push({v:"A", t:camVar("gm", ["Y ahora, los mensajes por acomodar.","Ahora los mensajes sin tarea."])});
  var quien=limpiaHabla(nombreCorto(gr.contacto||"")||gr.contacto||"alguien");
  G.push({v:"A", t:(repite?camVar("otra", ["Otra vez: ","De nuevo: "]):"")+(repite?"mensaje":"Mensaje")+" de "+quien+"."});
  var ex=camFrases(gr.extracto, 1)[0]||camCorta(limpiaHabla(gr.extracto||""), 150);
  if(ex) G.push({v:"B", t:camPunto("Dice: "+ex)});
  var preg=C.length>=2?"¿Va a "+camNomT(C[0])+" o a "+camNomT(C[1])+"?":(C.length?"¿Va a "+camNomT(C[0])+"?":"¿A qué tarea va?");
  G.push({v:"A", t:preg});
  camDi(G, function(){ camEscucha("resp"); });
}
function camMsgDetalle(){
  var gr=camMsgGr(), t=camTarea(), G=[]; if(!gr || !t) return [{v:"B", t:"No tengo más."}];
  gr.ixs.slice(0,4).forEach(function(ix){ var x=t.msgs[ix]; if(!x) return; var s=camFrases(_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,""), 2).join(" "); if(s) G.push({v:"B", t:camPunto(s)}); });
  if(!G.length) G.push({v:"B", t:"No tengo más."});
  G.push({v:"A", t:"¿A dónde va?"});
  return G;
}
/* sin IA: "la primera", "la segunda", o el nombre de UNA de las dos */
function camMsgLocal(v, C){
  var n=_camNv(v).replace(/^(a|al|va a|va al|va en|en|es de|es|a la|la de|lo de|el de|pa|para)\s+/,"");
  if(/^(la )?(primera|1|uno|la primera opcion)$/.test(n) && C[0]) return {accion:"a_tarea", destino:C[0].id};
  if(/^(la )?(segunda|2|dos|otra|la otra|la segunda opcion)$/.test(n) && C[1]) return {accion:"a_tarea", destino:C[1].id};
  var pal=function(x){ return _camNv(camNomT(x)+" "+(x.nombre||"")).split(" ").filter(function(w){ return w.length>3 && !/^(para|con|del|las|los|una|unos|tarea|llamar|revisar|hacer|pagar|ver)$/.test(w); }); };
  var hit=C.map(function(x){ return pal(x).some(function(w){ return (" "+_camNv(v)+" ").indexOf(" "+w+" ")>=0; }); });
  if(hit.filter(Boolean).length===1){ var i=hit.indexOf(true); if(_camNv(v).split(" ").length<=6) return {accion:"a_tarea", destino:C[i].id}; }
  if(/^(no lo guardes|no guardar|no se guarda|es platica|solo platica|ninguna|a ninguna|no va|no va a ninguna|borralo|bórralo|no sirve)$/.test(n)) return {accion:"no_guardar"};
  if(/^(es (un )?dato|dato|como dato|solo un dato)$/.test(n)) return {accion:"dato"};
  return null;
}
function camMsgPrompt(gr, t, C, v){
  var L=[];
  L.push("Eres Doit, el asistente de Salvador. Van caminando y él te contesta por voz (puede venir impreciso). Hay un MENSAJE que no se sabe a qué tarea va. Entiende a dónde lo manda y conviértelo en UNA acción.");
  L.push("MENSAJE de "+String(gr.contacto||"")+": “"+gr.ixs.map(function(ix){ var x=t.msgs[ix]; return x?_txMsg(x).replace(/^[^:\n]{1,40}:\s*/,""):""; }).join(" / ").slice(0,700)+"”");
  L.push("LAS 2 MÁS PROBABLES:\n"+C.map(function(x, i){ return (i+1)+") "+x.id+" · "+String(x.nombre||""); }).join("\n"));
  L.push("OTRAS TAREAS ABIERTAS (destino = el id):\n"+camCandidatas(t).filter(function(x){ return !C.some(function(c){ return c.id===x.id; }); }).map(function(x){ return x.id+" · "+String(x.nombre||"").slice(0,80); }).join("\n"));
  L.push("LO QUE DIJO: “"+v+"”");
  L.push("ACCIONES:\n- a_tarea: va a una tarea; destino = el id (de las 2 o de la lista).\n- nueva: es una tarea nueva; nombre = nombre corto.\n- dato: es solo un dato.\n- no_guardar: plática, no va a ninguna.\n- despues: lo deja para después.\n- aclarar: SOLO si de verdad no se entiende; respuesta_hablada = UNA pregunta corta.");
  L.push("respuesta_hablada: 2 a 5 palabras, como un amigo (ej. \"Listo, a Vestidores.\"). Nunca pidas confirmación.");
  L.push(CAM_PROMPT277);
  L.push("Contesta SOLO JSON: {\"accion\":\"...\",\"destino\":\"\",\"nombre\":\"\",\"respuesta_hablada\":\"...\",\"pide_confirmar\":false}");
  return L.join("\n");
}
function camMsgEntiende(v){
  var gr=camMsgGr(), t=camTarea(), key=CAM.L[CAM.i]; if(!gr || !t) return camSiguiente(1);
  if(CAM.aclara && CAM.aclara.id===key) v=CAM.aclara.v+". "+v; CAM.aclara=null;
  var C=CAM.mc||camMsgCands(gr), loc=camMsgLocal(v, C), ord=camOrdId(t, null);
  if(loc){ if(ord) loc._ord286=ord; return camMsgEjecuta(gr, t, loc, v, true); }
  var tok=++CAM.tok, t0=Date.now(), listo=false;
  try{ speechSynthesis.cancel(); }catch(e){}
  CAM.fase="pensando"; camPinta(); camPiensa(true);
  var fin=function(j){ if(listo) return; listo=true; clearTimeout(to); camPiensa(false); camLat("mensaje", Date.now()-t0, !!j);
    if(tok!==CAM.tok || !CAM.on) return; CAM.fase="";
    if(!j){ camOrdenSigue(t, ord, {motivo:"ia_sin_respuesta"}); return camDi([{v:"A", t:"No me contestó la IA. Lo dejo pendiente."}], function(){ camSiguiente(1); }); }
    if(ord) j._ord286=ord; camMsgEjecuta(gr, t, j, v, true); };
  var to=setTimeout(function(){ fin(null); }, CAM_IA_MS);
  try{ preguntaAClaude([{role:"user", content:camMsgPrompt(gr, t, C, v)}], "rapido", function(txt, err){ if(err) return fin(null); var j=_camJSON(txt); fin(j && j.accion?j:null); }); }
  catch(e){ fin(null); }
}
function camMsgEjecuta(gr, t, j, v, vivo, confirmado){
  var a=_camNv(j.accion).replace(/\s+/g,"_"), key=CAM.L[CAM.i], dh=String(j.respuesta_hablada||"").replace(/\s+/g," ").trim(), C=CAM.mc||[], ord=camOrdId(t, j);
  if(a==="deshacer"){ camOrdenCierra(t, ord, "pidió deshacer lo anterior"); CAM.pideConf277=false; return camHaz274("deshaz"); }
  if(a==="aclarar") camOrdenSigue(t, ord, {motivo:"aclarar", pregunta_ia:dh, preguntar_despues:true});
  if(a==="despues" || a==="detalle"){ if(camConContenido(v)) camOrdenSigue(t, ord, {motivo:a}); else camOrdenCierra(t, ord, "mensaje: "+a); }
  if(a==="aclarar"){ CAM.aclara={id:key, v:v}; return camDi([{v:"A", t:camCorta(dh && /\?/.test(dh)?dh:"¿A cuál de las dos?", 140)}], function(){ CAM.limpia=false; camEscucha("resp"); }); }
  if(a==="despues") return camHaz274("despues");
  if(a==="detalle") return camHaz274("detalle");
  var dest=null;
  if(a==="a_tarea" || a==="mover" || a==="vincular"){ a="a_tarea"; var dd=String(j.destino||"").trim();
    dest=tareaId240(dd); if(!dest){ try{ dest=camDestino(t, dd); }catch(e){} }
    if(!dest && dd){ dest=C.filter(function(x){ return _camNv(x.nombre).indexOf(_camNv(dd))>=0; })[0]||null; }
    if(!dest){ CAM.aclara={id:key, v:v}; return camDi([{v:"A", t:C.length>=2?"¿A "+camNomT(C[0])+" o a "+camNomT(C[1])+"?":"¿A cuál tarea?"}], function(){ CAM.limpia=false; camEscucha("resp"); }); } }
  try{ var cx8=correccion278(t, v); if(cx8){ a="a_tarea"; dest=cx8.x; }   /* build 278: "es la de X" / "es esta" manda sobre la IA */
    else if(a==="a_tarea" && dest && niega278(v, dest)){ CAM.aclara={id:key, v:v}; return camDi([{v:"A", t:"Dijiste que no es "+camNomT(dest)+". ¿A cuál lo mando?"}], function(){ CAM.limpia=false; camEscucha("resp"); }); } }catch(e){ console.warn("caminata 278 msg", e); }
  if(!/^(a_tarea|nueva|dato|no_guardar)$/.test(a)){ CAM.aclara={id:key, v:v}; return camDi([{v:"A", t:"¿A qué tarea lo mando?"}], function(){ CAM.limpia=false; camEscucha("resp"); }); }
  var _d7=camDescribeMsg(gr, a, dest, j);
  if(!confirmado && (CAM.pideConf277 || j.pide_confirmar===true)){ CAM.pideConf277=false; camOrdenSigue(t, ord, {motivo:"esperando_confirmacion", entendi:_d7}); var jj={}; for(var _k in j) jj[_k]=j[_k]; jj.accion=a; if(dest) jj.destino=dest.id;
    return camConfPide({k:"msg", id:key, gr:gr, t:t, j:jj, v:v, a:a, desc:_d7}); }
  CAM.pideConf277=false;
  var F=camFoto([t, dest]), nueva=null, dicho="Listo.", vw={a:abierta, v:vista};
  try{
    if(a==="a_tarea"){ if(dest.id===t.id) okG(t, gr.ixs); else moverG(t, gr.ixs, dest.id); dicho="Listo, a "+camNomT(dest)+"."; }
    else if(a==="nueva"){ nueva=nuevaG(t, gr.ixs, false, String(j.nombre||"").trim()||undefined); dicho=camVar("mnu", ["Listo, tarea nueva.","Va, la creé."]); }
    else if(a==="dato"){ nueva=datoG(t, gr.ixs); dicho="Va, queda como dato."; }
    else { gr.ixs.forEach(function(ix){ soloPlatica(t, ix); }); try{ reglasPorMsg("platica", t, gr.ixs, null); }catch(e){} dicho=camVar("mng", ["Va, no lo guardo.","Listo, fuera."]); }
  }catch(e){ console.warn("caminata 276 mensaje", e); }
  abierta=vw.a; vista=vw.v;
  CAM.ult={foto:F, i:CAM.i, a:"msg_"+a, nueva:nueva?nueva.id:"", desc:_d7}; try{ ultRegistra(CAM.ult, _d7); }catch(e){} CAM.hechas275=(CAM.hechas275||0)+1;
  if(ord){ CAM.ult.ord286={id:ord, tid:t.id}; camOrdenCierra(t, ord, _d7||a); }
  CAM.res276=CAM.res276||{}; CAM.res276[key]=1;
  try{ render(); }catch(e){}
  var w=dh.split(" ").filter(Boolean).length; if(dh && w<=8 && !/\?/.test(dh) && !_camCodigo(dh)) dicho=camPunto(dh);
  camDi([{v:"A", t:dicho}], function(){ camSiguiente(1); });
}
/* ---------- el cierre ---------- */
function camEtiq(id){
  var k=(CAM.g||{})[id];
  if(k==="msg"){ var gr=(CAM.mg||{})[id]; var c=gr?limpiaHabla(nombreCorto(gr.contacto||"")||gr.contacto||""):""; return "el mensaje de "+(String(c).split(" ")[0]||"un contacto"); }
  var t=tareaId240(id); return t?camCorta(camNombre(t), 50).replace(/[.\s]+$/,""):"una tarea";
}
function camFin(){
  var P=[]; (CAM.L||[]).forEach(function(id){ if((CAM.res276||{})[id]) return; var vivo=false; try{ vivo=camSigue(id); }catch(e){} if(vivo) P.push(camEtiq(id)); });
  (CAM.pendQ||[]).forEach(function(s){ P.push(s); });
  window.__fin276=P.slice();
  if(!P.length) return "Bandeja limpia.";
  var L=P.slice(0,5).join(". ")+(P.length>5?". Y "+(P.length-5)+" más":"");
  return (P.length===1?"Quedó 1 pendiente: ":"Quedaron "+P.length+" pendientes: ")+L+".";
}

/* ===================== build 277 (Salvador 7-oct): CAMINATA — CONFÍRMAME, DESHAZLO, REPÍTEME / REGRESA UN POCO, ÍCONO CHICO =====================
   Sobre el 276, con lo que encontró al estrenarla caminando.
   1 CONFÍRMAME: si en la orden dice "confírmame", "¿entendiste bien?", "dime qué entendiste", "repíteme qué vas a hacer"… (o la IA marca
     pide_confirmar), NO se ejecuta: repite lo que dijo ("Me dijiste: …"), cómo lo entendió ("Entendí: juntar X con la tarea Y.") y pregunta
     "¿Lo hago?". Sí / va / hazlo / correcto = ejecuta. No / cancela / eso no = no hace nada y le pide la orden otra vez (esa siguiente
     también se confirma). Cualquier otra cosa = es la corrección: se vuelve a entender y se vuelve a confirmar. Vale para tareas y para
     mensajes por acomodar. "¿Qué hiciste?" / "¿entendiste?" después de una acción: dice lo último que hizo y cómo deshacerlo.
   2 DESHAZLO: además de las frases del 275, "deshazlo", "cancela eso", "retrocede", "revierte", "está mal", "la juntaste mal", "esa no era"
     (solas o con "no," delante), y frases cortas que traigan un verbo de deshacer. Si la IA recibe algo como "no, la vinculaste mal",
     devuelve accion "deshacer". Deshace la última acción (CAM.ult, foto de las tareas antes) y lo dice: "Va, lo deshice."
   3 REPÍTEME = lo último que dijo (la frase anterior y la que iba). REGRESA UN POCO / más atrás / retrocede un poco = vuelve a leer desde
     dos frases antes. "Repite" (sin -me) sigue siendo la tarea completa otra vez.
   4 HOME: sin la barra grande de Caminata; un ícono chico de persona caminando (silueta sólida en zancada, dibujo propio) junto al ⋯ de arriba.
     El audífono que estaba en el título de la primera sección (abría lo mismo) se quita. */
var CAM_CONF_PIDE=/(^|\s)(confirmame|confirmamelo|confirmamela|me confirmas|confirma (antes|primero)|confirmame (antes|primero)|antes de hacerlo|antes de que lo hagas|(me )?entendiste( bien)?|dime (si|que|lo que) (me )?entendiste|dime que vas a hacer|repiteme (lo )?que (vas a hacer|entendiste|te dije)|que vas a hacer|no lo hagas todavia|espera mi (ok|visto bueno|autorizacion)|pideme (confirmacion|autorizacion))(\s|$)/;
var CAM_CONF_SI=/^((si |va |sale |ok |okey )?(si|va|sale|dale|ok|okey|orale|andale|claro|de acuerdo|perfecto|esta bien|hazlo|hazle|adelante|procede|correcto|asi es|exacto|eso|eso es|confirmo|confirmado|afirmativo|si hazlo|si adelante|si correcto|si eso|si asi|si eso es|si esta bien|sale hazlo|va hazlo|si si|si por favor|si va|si dale|va que va|dale pues|hazlo ya|si procede|asi|tal cual))$/;
var CAM_CONF_NO=/^(no|nel|no no|no gracias|negativo|mejor no|asi no|no asi no|no lo hagas|no hagas nada|no hagas eso|esta mal|eso no|no es eso|no era eso|cancela|cancela eso|cancelalo|olvidalo|olvidate|te equivocaste|no entendiste|no me entendiste|para nada|nada|no espera)$/;
var CAM_PROMPT278="REGLAS DE VINCULAR: usa vincular SOLO si él nombra la otra tarea o dice claramente que sí es el mismo tema. Si dice que es ESTA misma tarea (\"es esta\", \"esa es la tarea de …\" con el nombre de esta), o que NO tiene que ver con la tarea propuesta, NO es vincular: usa rechazar con destino vacío. Nunca vincules a una tarea que él negó.";
var CAM_PROMPT277="- deshacer: quiere deshacer o cancelar lo que acabas de hacer en la tarea ANTERIOR (\"no, esa no era\", \"la vinculaste mal\", \"regrésalo como estaba\").\n"+
  "pide_confirmar: true SOLO si te pide que le confirmes o le repitas lo que entendiste ANTES de hacerlo (\"confírmame\", \"¿entendiste bien?\", \"dime qué vas a hacer\"); esa parte NO es parte de la orden. Si no, false.";
function _camNv277(s){ return _camNv(s).replace(/^(oye|doit|claude)\s+/,"").replace(/\s+(por favor|porfa)$/,""); }
function camPideConf(v){ return CAM_CONF_PIDE.test(_camNv(v)); }
function camConfCorto(txt){ var n=_camNv277(camQuitaFin(txt)); return !!n && (CAM_CORTO.test(n) || CAM_CONF_SI.test(n) || CAM_CONF_NO.test(n)); }
/* frase corta con un verbo de deshacer ("no, deshazlo, la juntaste con otra", "cancela lo que hiciste") */
function camDeshazSuelto(n){
  n=String(n||""); var w=n.split(" ").filter(Boolean); if(!w.length || w.length>9) return false;
  if(/\b(un poco|tantito|un poquito|poquito)\b/.test(n)) return false;   /* "regresa un poco" es releer, no deshacer */
  if(/\bno (lo |la )?(deshagas|reviertas|canceles|anules)\b/.test(n)) return false;
  return /^(\S+ ){0,2}(deshaz|deshazlo|deshazla|deshacer|reviertelo|anulalo)\b/.test(n) ||   /* al principio de la frase ("dile que hay que deshacer el muro" es orden); "anula la factura" también */
    /\b(cancela|cancelalo|cancelala|retrocede|regresalo|regresala|revierte|anula) (eso|lo que hiciste|lo que acabas de hacer|lo ultimo|la ultima|lo de antes|esa accion)\b/.test(n) ||
    /\b(lo hiciste mal|la (vinculaste|juntaste|mandaste|pusiste) (mal|en otra|con otra|a otra)|te equivocaste de tarea|no era esa tarea)\b/.test(n);
}
/* lo dicho sin el "confírmame" (para repetírselo) */
function camSinConf(v){
  var s=String(v||"").replace(/[,.;:\s]*¿?\s*(conf[ií]rm(amelo|amela|ame|a)( antes| primero)?|me confirmas|(me )?entendiste( bien)?|dime (si|qu[eé]|lo que) (me )?entendiste|dime qu[eé] vas a hacer|rep[ií]teme (lo )?qu[eé] (vas a hacer|entendiste|te dije)|qu[eé] vas a hacer|antes de hacerlo|antes de que lo hagas|no lo hagas todav[ií]a)\s*\??[.,;!]*/gi, " ");
  return s.replace(/\s+/g," ").replace(/^[\s,.;:]+|[\s,.;:]+$/g,"").trim();
}
/* cómo entendió la orden, en palabras (sin ejecutar nada) */
function camDescribe(t, a, j, dest){
  var nom=camNombre(t), tx=camCorta(limpiaHabla(String((j&&j.texto_para_tarea)||"").replace(/\s+/g," ").trim()), 160).replace(/[.\s]+$/,""), nue=false, d=null;
  try{ nue=((CAM.g||{})[t.id]==="nue") || esPropuesta(t); }catch(e){} try{ d=decision273(t); }catch(e){}
  if(a==="vincular") return dest?"juntar "+nom+" con la tarea "+camCorta(limpiaHabla(dest.nombre||""), 60).replace(/[.\s]+$/,""):"juntar "+nom+" con otra tarea";
  if(a==="aprobar") return nue?"crear la tarea nueva "+nom:(d?"contestar la decisión de "+nom+(tx?": "+tx:" con lo que recomiendo"):"anotar en "+nom+(tx?": "+tx:" que va"));
  if(a==="rechazar") return nue?"quitar la tarea nueva "+nom:"anotar en "+nom+" que no va"+(tx?": "+tx:"");
  if(a==="eliminar") return "eliminar la tarea "+nom;
  if(a==="dato") return "guardar "+nom+" como dato, no como tarea";
  return "anotar en "+nom+(tx?": "+tx:" lo que me dijiste");
}
function camDescribeMsg(gr, a, dest, j){
  var q=limpiaHabla(nombreCorto((gr&&gr.contacto)||"")||(gr&&gr.contacto)||"el contacto"), de="el mensaje de "+q;
  if(a==="a_tarea") return "mandar "+de+" a la tarea "+(dest?camNomT(dest):"que dijiste");
  if(a==="nueva") return "crear una tarea nueva con "+de+(j && j.nombre?": "+camCorta(limpiaHabla(String(j.nombre)), 60).replace(/[.\s]+$/,""):"");
  if(a==="dato") return "guardar "+de+" como dato";
  return "no guardar "+de;
}
/* repite la orden y cómo la entendió, y espera su sí */
function camConfPide(c){
  CAM.conf=c; CAM.aclara=null;
  var dijo=camSinConf(c.v), G=[];
  if(dijo) G.push({v:"A", t:camPunto("Me dijiste: "+camCorta(dijo, 170))});
  G.push({v:"A", t:camPunto("Entendí: "+c.desc)});
  G.push({v:"A", t:CAM.confExpl277?"¿Lo hago?":"¿Lo hago? Dime sí o no."}); CAM.confExpl277=true;
  camDi(G, function(){ CAM.limpia=true; camEscucha("resp"); });
}
function camConfResp(v){
  var c=CAM.conf; CAM.conf=null; if(!c) return camEscucha("resp");
  var n=_camNv277(v);
  if(CAM_CORTO.test(n) || CAM_CONF_SI.test(n)){   /* sí: ahora sí se ejecuta, tal cual lo entendió */
    window.__conf277=(window.__conf277||[]).concat([{id:c.id, a:c.a, ok:true, ts:Date.now()}]).slice(-20);
    if(c.k==="msg") return camMsgEjecuta(c.gr, c.t, c.j, c.v, true, true);
    return camResuelve(c.t, c.j, c.v, true, true);
  }
  var v2=String(v||"").replace(/^\s*(no|nel)\b[\s,.;:]*/i,"").trim();
  if(CAM_CONF_NO.test(n) || !_camNv277(v2) || CAM_CONF_NO.test(_camNv277(v2))){   /* no: no se hace nada */
    window.__conf277=(window.__conf277||[]).concat([{id:c.id, a:c.a, ok:false, ts:Date.now()}]).slice(-20);
    CAM.confSig277=true;   /* la orden que sigue también se confirma */
    /* build 286: el «No» es a CÓMO lo entendió, no a la orden: queda viva para la Mac y se le pregunta después */
    var _o6=camOrdId(c.t, c.j); camOrdenSigue(c.t, _o6, {motivo:"dijo_no_a_confirmacion", entendi:c.desc, preguntar_despues:true});
    if(CAM.ord286 && CAM.ord286.id===_o6) CAM.ord286.no=true;
    return camDi([{v:"A", t:camVar("confno", ["Va, así no lo hago. Queda anotado para Claude; dímelo de otra forma o seguimos.","Sale, así no. Lo dejo anotado y te pregunto después. ¿Cómo sería?"])}], function(){ CAM.limpia=true; camEscucha("resp"); });
  }
  /* otra cosa: es la corrección; se vuelve a entender y se vuelve a confirmar */
  CAM.pideConf277=true;
  if(c.k==="msg") return camMsgEntiende(v2);
  return camEntiende(c.t, v2);
}
/* "regresa un poco": vuelve a leer desde dos frases antes de donde iba */
function camRebobina(){
  var R=CAM.rest; if(!R || !R.G || !R.G.length) return camPresenta(true);
  var from=Math.max(0, Math.min(R.k, R.G.length-1)-2);
  camDi(R.G.slice(from), R.done);
}
/* los comandos del 277; true = ya lo atendió */
function camHaz277(c){
  if(CAM.conf){
    if(c==="deshaz"){ camConfResp("no"); return true; }   /* "eso no" / "cancela" a la confirmación = no */
    if(c==="entendiste" || c==="repite"){ var cc=CAM.conf; CAM.conf=null; camConfPide(cc); return true; }
    if(/^(siguiente|despues|atras|salir|pausa)$/.test(c)){ CAM.conf=null; CAM.pideConf277=false; return false; }
  }
  if(c==="rebobina"){ camRebobina(); return true; }
  if(c==="entendiste"){
    if(CAM.qz){ camQuizPregunta(true); return true; }
    var u=CAM.ult;
    if(u && u.desc) camDi([{v:"A", t:camPunto("Lo último que hice: "+u.desc)}, {v:"A", t:"Si está mal, di deshazlo."}], function(){ CAM.limpia=true; camEscucha("resp"); });
    else { CAM.confSig277=true; camDi([{v:"A", t:"Todavía no hago nada. Dime qué hacemos y te lo confirmo antes de hacerlo."}], function(){ CAM.limpia=true; camEscucha("resp"); }); }
    return true;
  }
  return false;
}
/* ===================== build 278 (Salvador 7-oct): VINCULAR SOLO LO QUE ÉL DIJO · DESHACER CON UN TOQUE =====================
   El caso: la caminata preguntó "¿Es el mismo tema que «Inversiones BBVA»? Si sí, la vinculo." sobre «Estado de Cuenta Inversión
   Septiembre». Salvador dijo que NO tenía nada que ver con sus inversiones BBVA, que esa era la tarea de estado de cuenta inversiones,
   y la caminata la juntó con Inversiones BBVA. Causas: (1) la IA solo veía las OTRAS tareas para vincular (la actual no estaba), sin
   regla para "es esta misma" ni para "no tiene que ver con X"; (2) camDestino aceptaba una sola palabra suelta ("inversiones")
   o que un nombre contuviera al otro (0.9); (3) vincular se ejecutaba sin confirmar aunque la frase NEGABA esa tarea.
   Ahora:
   1 NOMBRES: una tarea se reconoce por su nombre, nombres anteriores, sinónimos y alias, sin acentos, en singular/plural, sin
     palabras de relleno ni meses. Para tomarla, TODAS las palabras de uno de sus nombres tienen que estar en lo dicho (o lo dicho
     tiene que ser al menos dos palabras de su nombre). Una sola palabra suelta ya no alcanza. Empate entre dos = no se adivina.
   2 NEGACIÓN: si en lo que dijo niega la tarea ("no tiene nada que ver con mis inversiones de BBVA", "no es la de BBVA", "no la
     juntes con…"), NUNCA se vincula a esa, venga de la IA o del match.
   3 SU CORRECCIÓN MANDA: "¿es esta tarea?", "es esta misma", "es la tarea de X", "esa es la de X", "no, es X" → si X es la tarea
     actual, no se vincula y se quita la propuesta pendiente (no se vuelve a preguntar); si X es otra tarea, va a esa, por encima de
     lo que haya dicho la IA. Vale también en la confirmación del 277 (la corrección vuelve a pasar por aquí) y en los mensajes.
   4 Si la IA pide vincular a una tarea que él NO nombró en lo que dijo, primero se le confirma (camConfPide).
   5 DESHACER, UNA SOLA FUNCIÓN (deshazUlt) para la voz ("deshazlo") y para el ícono ↩ de la pantalla de la tarea: lo último que
     se hizo EN ESA tarea (vínculo, fecha, nombre, mensaje movido, nota, datos). Se muestra junto al ⋯ solo si hay algo que deshacer;
     al tocarlo dice "Se deshace: …" y pide un toque más. Sin historial ni lista. Lo enviado por WhatsApp no se puede des-enviar:
     esas acciones no dejan ↩. */
var STOP278={de:1,del:1,la:1,las:1,el:1,los:1,y:1,e:1,a:1,al:1,en:1,con:1,para:1,por:1,que:1,mi:1,mis:1,tu:1,tus:1,su:1,sus:1,un:1,una:1,unos:1,unas:1,es:1,esta:1,este:1,esa:1,ese:1,eso:1,esto:1,tarea:1,tareas:1,lo:1,le:1,les:1,se:1,si:1,no:1,ni:1,ya:1,mas:1,muy:1,pero:1,como:1,otra:1,otro:1,misma:1,mismo:1,
  enero:1,febrero:1,marzo:1,abril:1,mayo:1,junio:1,julio:1,agosto:1,septiembre:1,setiembre:1,octubre:1,noviembre:1,diciembre:1,mes:1};
function _st(w){ w=String(w||""); return w.length>4?w.replace(/(es|s|e)$/,""):w; }   /* singular/plural: "inversiones" = "inversión", "clientes" = "cliente" */
function _tok(s){ return _camNv(s).split(" ").filter(function(w){ return w.length>1 && !STOP278[w]; }).map(_st); }
function _flat(v){ return [].concat(v||[]).map(function(z){ return (z&&typeof z==="object")?(z.nombre||z.tx||""):String(z||""); }).filter(Boolean); }
/* todos los nombres con los que Salvador puede llamar a una tarea */
function nombres278(x){ if(!x) return [];
  return [x.nombre].concat(_flat(x.nombre_anterior), _flat(x.nombres_anteriores), _flat(x.sinonimos), _flat(x.alias), _flat(x.alias_tarea)).map(function(s){ return String(s||"").trim(); }).filter(Boolean); }
/* ¿qué tanto nombra el texto a la tarea x? 0 = no la nombra */
function puntaje(P, x){
  var best=0, Ps={}; P.forEach(function(w){ Ps[w]=1; });
  nombres278(x).forEach(function(nm){ var T=_tok(nm); if(!T.length) return;
    var c=T.filter(function(w){ return Ps[w]; }).length, s=0;
    if(c===T.length && (T.length>=2 || P.length<=2)) s=T.length*2+(P.length===T.length?3:0);   /* todas las palabras de un nombre */
    else if(P.length>=2 && P.every(function(w){ return T.indexOf(w)>=0; })) s=P.length*2-1;   /* lo dicho es parte de su nombre (2+ palabras) */
    if(s>best) best=s; });
  return best;
}
/* la tarea que el texto nombra, entre L; null si ninguna o si hay empate */
function resuelveNombre(texto, L){
  var P=_tok(texto); if(!P.length) return null;
  var R=(L||[]).filter(Boolean).map(function(x){ return {x:x, s:puntaje(P, x)}; }).filter(function(r){ return r.s>0; }).sort(function(a,b){ return b.s-a.s; });
  if(!R.length) return null;
  if(R.length>1 && R[1].s===R[0].s && R[1].x.id!==R[0].x.id) return null;   /* empate: no se adivina */
  return R[0].x;
}
/* ¿niega a la tarea x en lo que dijo? ("no tiene nada que ver con mis inversiones de BBVA") */
var NEG278=/\b(nada que ver|no tiene (nada )?que ver|no tienen (nada )?que ver|no es|no son|no era|no la de|no el de|no con|no a|no en|ni con|ni a|tampoco|no (la |lo )?(juntes|vincules|pegues|mandes|metas|pongas|mezcles|relaciones)|sin relacion|otra cosa que)\b/;
function niega278(v, x){
  if(!x) return false;
  var w=String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[,;:.!?¿¡()]+/g," | ").replace(/["'«»“”]/g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean), ws=w.map(_st);   /* la coma cuenta: «no, es la de X» no niega a X */
  if(!w.length) return false;
  return nombres278(x).some(function(nm){ var T=_tok(nm); if(!T.length) return false;
    for(var i=0;i<ws.length;i++){ if(ws[i]!==T[0]) continue;
      var win=ws.slice(i, i+T.length+4); if(!T.every(function(t){ return win.indexOf(t)>=0; })) continue;
      var ini=Math.max(0, i-8);
      for(var k=i-1;k>=ini;k--){ if(w[k]==="|" || (/^(es|sino|pero|si)$/.test(w[k]) && w[k-1]!=="no")){ ini=k+1; break; } }   /* "no es la de BBVA, es la de X": lo de antes de "es" no niega a X */
      var antes=w.slice(ini, i).join(" ");
      if(NEG278.test(antes)) return true; }
    return false; });
}
/* ¿la nombró (sin negarla)? */
function nombra278(v, x){ return !!x && puntaje(_tok(v), x)>0 && !niega278(v, x); }
/* su corrección explícita: "¿es esta tarea?", "es esta misma", "es la tarea de X", "esa es la de X", "no, es X" → {x, misma} o null */
var CORR278=/\b(es esta( misma)?( tarea)?|esta es( la tarea)?|es la misma|es la tarea de|es la de|esa es la( tarea)?( de)?|esta es la( tarea)?( de)?|la tarea es|la tarea de|no es esa es|no es otra|es otra tarea|va en la de|va con la de|va en la tarea de|es de la tarea)\b/;
function correccion278(t, v){
  var n=_camNv(v); if(!t || !n) return null;
  var m=n.match(CORR278); if(!m) return null;
  var tras=n.slice(m.index+m[0].length).trim(), tras2=tras.split(/\b(y|pero|porque|pues)\b/)[0].trim();
  var L=camCandidatas(t).concat([t]);
  var x=tras2?resuelveNombre(tras2, L):null;
  if(!x && /^(es esta( misma)?( tarea)?|esta es( la tarea)?|es la misma)$/.test(m[0]) && !tras2) x=t;   /* "¿es esta tarea?" sin nombre = esta */
  if(!x){ var y=resuelveNombre(n, L); if(y && !niega278(v, y)) x=y; }   /* el nombre puede venir antes ("estado de cuenta inversiones, esa es") */
  if(!x || niega278(v, x)) return null;
  return {x:x, misma:x.id===t.id};
}
/* "no se vincula": quita la pregunta / propuesta pendiente de vincular (a dest o a cualquiera) para que no se vuelva a preguntar */
function rechazaVinc(t, dest, por){
  if(!t) return false; var H=t.hecho238, quito=false, did=dest&&dest.id;
  if(H && Array.isArray(H.falta)){ var antes=H.falta.length;
    H.falta=H.falta.filter(function(f){ if(!f || f.k!=="vinc") return true; if(!did) return false; return !(f.ops||[]).some(function(o){ return o && o.id===did; }); });
    quito=H.falta.length!==antes; if(quito) H.hecho=(H.hecho||[]).concat(["No se vincula"+(dest?" a «"+String(dest.nombre||"")+"»":"")+" ("+(por||"Salvador")+")"]); }
  if(t.propuesta_fusion && (!did || t.propuesta_fusion.a===did)){ t.propuesta_fusion_no=t.propuesta_fusion; t.propuesta_fusion_no.no_ts=Date.now(); delete t.propuesta_fusion; quito=true; }
  if(quito || dest){ t.censo_vinc_no={ts:Date.now(), por:yo||"", propuestas:dest?[{id:dest.id, nombre:dest.nombre||""}]:[], motivo:"caminata 278"}; guarda(t); }
  return quito;
}
/* lo que hace con la acción de la IA antes de ejecutarla; devuelve {a, dest, no, misma, conf} */
function vincPend(t){ var Q=[]; try{ Q=preguntas249(t); }catch(e){} var p=Q[0]; if(!p || p.k!=="vinc") return null; var op=(p.ops||[])[0]; return (op && tareaId240(op.id)) || {id:"", nombre:""}; }
function camFiltraVinc(t, a, j, v){
  var r={a:a, dest:null}, cx=correccion278(t, v), pend=vincPend(t);
  if(String((j&&j.destino)||"")===t.id) cx={x:t, misma:true};   /* la IA "vinculó" a la misma tarea */
  if(cx && !cx.misma){ r.a="vincular"; r.dest=cx.x; r.corr=1; return r; }   /* su corrección manda sobre la IA */
  if(cx && cx.misma){ r.misma=1; if(a==="vincular" || (pend && (a==="aprobar" || a==="rechazar"))){ r.a="no_vincular"; r.dest=(pend&&pend.id)?pend:null; } return r; }
  if(a!=="vincular") return r;
  var dest=camDestino(t, j.destino); r.dest=dest; if(!dest) return r;
  if(dest.id===t.id || niega278(v, dest)){ r.a="no_vincular"; r.niega=1; if(dest.id===t.id) r.dest=(pend&&pend.id)?pend:null; return r; }
  if(!nombra278(v, dest) && !/^(si|va|sale|dale|ok|okey|claro|de acuerdo|si vinculala|si juntala|vinculala|juntala|si es el mismo|si es lo mismo|es lo mismo|es el mismo)( tema)?$/.test(_camNv277(v))) r.conf=1;   /* no la nombró: se le confirma */
  return r;
}
/* ---------- 5 · DESHACER: una sola función para la voz y para el ícono ---------- */
var ULT278_K="doit_ult278", ULT278_MS=24*3600*1000;
window.__ult278=window.__ult278||null;
function _ultCarga(){ if(window.__ult278) return window.__ult278; var o={}; try{ o=JSON.parse(localStorage.getItem(ULT278_K)||"{}")||{}; }catch(e){ o={}; } window.__ult278=o; return o; }
function _ultGuarda(){ var o=_ultCarga(), ks=Object.keys(o).sort(function(a,b){ return (o[b].ts||0)-(o[a].ts||0); });
  ks.slice(20).forEach(function(k){ delete o[k]; });
  try{ var s=JSON.stringify(o); if(s.length>1500000){ ks.slice(5).forEach(function(k){ delete o[k]; }); s=JSON.stringify(o); } localStorage.setItem(ULT278_K, s); }catch(e){ try{ localStorage.removeItem(ULT278_K); }catch(e2){} } }
/* u = {foto (camFoto), que, nueva?} · se apunta en cada tarea de la foto (o en tids) */
function ultRegistra(u, que, tids){
  if(!u || !u.foto) return null; u.que=String(que||u.que||u.desc||"lo último que se hizo"); u.ts=u.ts||Date.now();
  var ids=(tids||(u.foto.copias||[]).map(function(c){ return c && c.id; })).filter(Boolean); u.tids=ids;
  window.__ultN278=(window.__ultN278||0)+1;
  var o=_ultCarga(), slim={foto:u.foto, que:u.que, ts:u.ts, nueva:u.nueva||"", tids:ids};
  ids.forEach(function(id){ o[id]=slim; }); _ultGuarda(); return slim;
}
function ultDe(tid){ var o=_ultCarga(), u=o[tid]; if(!u) return null; if(Date.now()-(u.ts||0)>ULT278_MS){ delete o[tid]; _ultGuarda(); return null; } return u; }
function _ultOlvida(u){ var o=_ultCarga(); Object.keys(o).forEach(function(k){ var x=o[k]; if(x===u || (x && u && x.ts===u.ts && String(x.tids)===String(u.tids))) delete o[k]; }); _ultGuarda(); }
/* LA función: regresa las tareas como estaban antes de la acción. Lo que llegó DESPUÉS de la acción (WhatsApp, notas de la IA) se conserva. */
function deshazUlt(u){
  if(!u || !u.foto) return false;
  var nuevos={}, ya={};   /* lo que ya estaba en CUALQUIERA de las tareas de la foto (incluye lo que la acción copió de una a otra) */
  (u.foto.copias||[]).forEach(function(c){ (c.msgs||[]).forEach(function(m){ if(m) ya[(m.ts||0)+"|"+String(m.t||"").slice(0,60)]=1; }); });
  (u.foto.copias||[]).forEach(function(c){ var vivo=tareaId240(c.id); if(!vivo) return;
    nuevos[c.id]=(vivo.msgs||[]).filter(function(m){ return m && (+m.ts||0)>(u.ts||0)+1500 && !ya[(m.ts||0)+"|"+String(m.t||"").slice(0,60)] && !m.movido_de && (m.wa_in===1 || m.nota_ia || m.origen==="revisor"); }); });
  camRestaura(u.foto);
  Object.keys(nuevos).forEach(function(id){ var L=nuevos[id]; if(!L.length) return; var x=tareaId240(id); if(!x) return;
    x.msgs=(x.msgs||[]).concat(L).sort(function(a,b){ return ((a&&a.ts)||0)-((b&&b.ts)||0); }); guarda(x); });
  if(u.nueva){ try{ borraTarea(u.nueva); }catch(e){} }
  _ultOlvida(u);
  try{ hist240("Deshizo: "+(u.que||""), tareaId240((u.tids||[])[0])||null, null); }catch(e){}
  return true;
}
/* foto + registro alrededor de una acción táctil. Si una acción llama a otra (mandar → vincular; mover varios → mover uno),
   queda UNA sola entrada: la foto más vieja de cada tarea y el texto de la acción más importante (pri). Si en medio se mandó algo
   por WhatsApp, no se deja deshacer (no se puede des-enviar). */
window.__ultPila278=null;
function ultEnvuelve(fn, quienes, que, pri){
  return function(){ var a=arguments, F=null; try{ F=camFoto((quienes.apply(this, a)||[]).filter(Boolean)); }catch(e){}
    var raiz=!window.__ultPila278, t0=Date.now(); if(raiz) window.__ultPila278={fotos:[], q:"", p:-1, env:false};
    var P=window.__ultPila278; if(F) P.fotos.push(F);
    var r;
    try{ r=fn.apply(this, a);
      var q=""; try{ q=que.apply(this, [r].concat([].slice.call(a))); }catch(e){}
      if(q && (pri||1)>P.p){ P.q=q; P.p=pri||1; }
    } finally {
      if(raiz){ window.__ultPila278=null;
        try{ if(P.q && !P.env && !(typeof CAM!=="undefined" && CAM.on)){ var ya={}, cop=[], p2=[];
            P.fotos.forEach(function(f){ (f.copias||[]).forEach(function(c, i){ if(c && !ya[c.id]){ ya[c.id]=1; cop.push(c); p2.push((f.p256f||[])[i]); } }); });
            ultRegistra({foto:{copias:cop, p256f:p2.filter(Boolean)}, ts:t0}, P.q); if(vista==="hilo") render(); } }catch(e){ console.warn("ult278", e); } }
    }
    return r; };
}
(function(){
  if(typeof window==="undefined" || window.__envueltas278) return; window.__envueltas278=1;
  var T=function(id){ return tareaId240(id); };
  var env=function(){ if(window.__ultPila278) window.__ultPila278.env=true; };
  var _ma=mandaAExterno; mandaAExterno=function(){ env(); return _ma.apply(this, arguments); };
  var _md=mandaDM; mandaDM=function(){ env(); return _md.apply(this, arguments); };
  enlazaTareas=ultEnvuelve(enlazaTareas, function(oid, did){ return [T(oid), T(did)]; },
    function(r, oid, did){ var d=T(did), o=null; try{ window.__ultPila278.fotos.forEach(function(f){ (f.copias||[]).forEach(function(c){ if(c && c.id===oid && !o) o=c; }); }); }catch(e){}
      var fus=(tareas||[]).every(function(x){ return x.id!==oid; }) || ((T(oid)||{}).fusionada_en===did);
      return (d && fus)?"se juntó aquí «"+camCorta(String((o&&o.nombre)||"otra tarea"), 50)+"»":""; }, 3);
  moverG=ultEnvuelve(moverG, function(t, ixs, did){ return [t, T(did)]; }, function(r, t, ixs, did){ var d=T(did); return "se movió "+((ixs||[]).length>1?(ixs.length+" mensajes"):"un mensaje")+" a «"+camCorta(String((d&&d.nombre)||"otra tarea"), 50)+"»"; }, 3);
  mueveMensaje=ultEnvuelve(mueveMensaje, function(t, ix, did){ return [t, T(did)]; }, function(r, t, ix, did){ var d=T(did); return r?"se movió un mensaje a «"+camCorta(String((d&&d.nombre)||"otra tarea"), 50)+"»":""; }, 2);
  mueveFecha=ultEnvuelve(mueveFecha, function(t){ return [t]; }, function(r, t, nueva){ return (r && r.ok!==false && t && t.f_vigente===nueva)?"se movió la fecha al "+fechaMovCorta(nueva):""; }, 2);
  mandar=ultEnvuelve(mandar, function(t){ return [t]; }, function(r, t, txt){ return "se anotó: “"+camCorta(String(txt||"").replace(/\s+/g," "), 50)+"”"; }, 1);
  notaClaude=ultEnvuelve(notaClaude, function(t){ return [t]; }, function(r, t, v){ return "se le pidió a Claude: “"+camCorta(String(v||"").replace(/\s+/g," "), 50)+"”"; }, 1);
  enviaPreguntas=ultEnvuelve(enviaPreguntas, function(tid){ return [T(tid)]; }, function(){ return "se guardaron tus respuestas"; }, 1);
})();
/* caminata: NO se vincula (dijo "es esta" o "no tiene que ver con X"): se quita la propuesta pendiente, queda anotado y se puede deshacer */
function camNoVincula(t, fv, v, vivo){
  var F=camFoto([t]), d=(fv && fv.dest && fv.dest.id)?fv.dest:null, dn=d?camCorta(limpiaHabla(String(d.nombre||"")), 50).replace(/[.\s]+$/,""):"";
  try{ rechazaVinc(t, d, "Salvador, caminata");
    msg(t,"bi","No la junté"+(dn?" con «"+dn+"»":"")+": "+(fv.misma?"dijiste que es esta misma tarea.":"dijiste que no tiene que ver.")+" Lo que dijiste: “"+String(v||"").replace(/\s+/g," ").slice(0,200)+"”");
    var m=t.msgs[t.msgs.length-1]; m.canal="priv:"+(yo||""); m.nota_ia=1; guarda(t); }catch(e){ console.warn("caminata 278 no vincula", e); }
  var desc="no juntar "+camNombre(t)+(dn?" con "+dn:"");
  CAM.ult={foto:F, i:CAM.L.indexOf(t.id), a:"no_vincular", desc:desc}; try{ ultRegistra(CAM.ult, desc); }catch(e){}
  CAM.hechas275=(CAM.hechas275||0)+1; CAM.res276=CAM.res276||{}; CAM.res276[t.id]=1; CAM.pideConf277=false;
  if(!vivo) return; CAM.fase="";
  camDi([{v:"A", t:"Va, no la junto"+(dn?" con "+dn:"")+". Se queda aparte."}], function(){ camSiguiente(1); });
}
/* el nombre de la tarea, a mano (menú ⋯ → Cambiar nombre) */
function ultNombre(t, F, antes){ if(!t || !F) return; ultRegistra({foto:F, ts:Date.now()}, "se cambió el nombre (era «"+camCorta(String(antes||""), 40)+"»)"); }
/* el ícono ↩ (línea, estilo SF Symbols) junto al ⋯ de la tarea */
function vUndoIco(t){ var u=t && ultDe(t.id); if(!u) return "";
  return '<button class="iconbtn hb233 und278b'+(window.__undoAsk278===t.id?' on':'')+'" id="bund278" aria-label="Deshacer lo último en esta tarea">'+ico("undo",20)+'</button>'; }
function vUndoLinea(t){ var u=t && ultDe(t.id); if(!u || window.__undoAsk278!==t.id) return "";
  return '<div class="und278" id="und278" role="status"><span>Se deshace: '+esc(u.que||"lo último")+'</span><button type="button" id="bund278ok">Deshacer</button></div>'; }
function bindUndo(t){
  var b=$("bund278"); if(b) b.onclick=function(ev){ ev.stopPropagation(); menuOpen=false;
    if(window.__undoAsk278===t.id){ window.__undoAsk278=null; render(); return; }   /* tocarlo otra vez = no */
    window.__undoAsk278=t.id; clearTimeout(window.__undoAskT278);
    window.__undoAskT278=setTimeout(function(){ if(window.__undoAsk278===t.id){ window.__undoAsk278=null; if(vista==="hilo") render(); } }, 7000);
    render(); };
  var ok=$("bund278ok"); if(ok) ok.onclick=function(ev){ ev.stopPropagation(); window.__undoAsk278=null; clearTimeout(window.__undoAskT278);
    var u=ultDe(t.id); if(!u){ render(); return; }
    var que=u.que; deshazUlt(u); abierta=tareaId240(t.id)?t.id:((u.tids||[]).filter(function(id){ return tareaId240(id); })[0]||null); vista=abierta?"hilo":"lista"; render(); toast("Deshecho: "+que); };
}

/* ---------- 4 · el ícono chico del home (junto al ⋯) ---------- */
/* build 277b (Salvador 7-oct): silueta SÓLIDA en zancada (tipo peatón), trazo propio — no es copia de ningún ícono de terceros */
function _icoCamina(){ return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.6" cy="3.2" r="2.3" fill="currentColor" stroke="none"/><path d="M12.9 7.4L11.5 12.9" stroke-width="3.9"/><path d="M12.2 8.5L9.2 10 7.7 12.9M13.1 8.7L15.3 11 17.9 9.9M11.7 13.3L15.3 15.6 16.6 20.7M11.1 13.6L9.6 17.4 5.6 19.9" stroke-width="2.6"/></svg>'; }
function vCamIco(){
  if(!window.SpeechSynthesisUtterance && !window.speechSynthesis) return "";
  var n=0; try{ n=camLista274().length; }catch(e){}
  if(!n) return "";
  return '<button class="iconbtn cam277" id="bcam274" aria-label="Caminata: '+n+(n===1?' pendiente':' pendientes')+' en voz">'+_icoCamina()+'</button>';
}

/* ===================== build 272 (Salvador 7-oct): HOME SÚPER MINIMALISTA =====================
   2 Sección vacía = no existe (ni su título).
   3 Varias preguntas de una misma tarea = UN renglón "N preguntas"; al tocarlo se abre la tarea con el popup de preguntas.
   4 Lo de Salvador (hoy o vencido) que espera respuesta de un tercero pasa a "Las lleva Claude" hasta que conteste (solo con campos confiables).
   5 "Ya está": al volver al home, el renglón se cierra en ~250 ms y la siguiente sube a su lugar.
   6 "Las lleva Claude" hasta abajo, plegada, con su semáforo y el encabezado en gris tenue. */
/* las preguntas de Claude pendientes en una tarea (las mismas del popup) */
function nPreg(t){ try{ return preguntas249(t).length; }catch(e){ return 0; } }
/* los renglones de una sección: preguntas agrupadas y, si se acaba de dar "Ya está", el renglón fantasma que se cierra */
function filas272(k, L, base){
  var out=L.map(function(x){ var r=base(x);
    if(k==='preg' && !faltaPlan(x.t).length){ var n=nPreg(x.t); if(n>=2){   /* lo que falta de fechas se dice tal cual, no «N preguntas» */ r=r.replace('<button class="revr ttr" data-id=', '<button class="revr ttr" data-preg272="'+n+'" data-id=');
      r=r.replace(/<small>[\s\S]*?<\/small>/, '<small>'+n+' preguntas</small>'); if(r.indexOf('<small>')<0) r=r.replace('</span></span></button>', '</span><small>'+n+' preguntas</small></span></button>'); } }
    return r; });
  var g=fantasma272(k, L);
  if(g) out.splice(Math.min(g.i, out.length), 0, g.html);
  return out.join('');
}
function fantasma272(k, L){
  var s=window.__sale272, f=window.__foto272; if(!s || !f || Date.now()-s.ts>15*60e3) return null;
  if(L.some(function(x){ return x.t.id===s.id; })) return null;
  var A=f[k]||[], i=-1; A.forEach(function(x, j){ if(x.id===s.id) i=j; }); if(i<0) return null;
  window.__sale272=null;
  return {i:i, html:'<button class="revr ttr sale272" aria-hidden="true" tabindex="-1"><i style="background:'+COL270[k]+'"></i><span class="ttx"><span class="rn">'+esc(A[i].nombre)+'</span>'+(A[i].why?'<small>'+esc(A[i].why)+'</small>':'')+'</span></button>'};
}
function foto272(H){ var o={}; ['preg','venc','hoy'].forEach(function(k){ o[k]=H[k].map(function(x){ return {id:x.t.id, nombre:x.t.nombre||'Sin nombre', why:x.why||''}; }); }); window.__foto272=o; }
function anima272(){
  Array.prototype.forEach.call(document.querySelectorAll('.ttr.sale272'), function(el){
    var quita=function(){ if(el.parentNode) el.parentNode.removeChild(el); };
    var red=false; try{ red=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
    if(red){ quita(); return; }
    el.style.height=el.offsetHeight+'px'; void el.offsetHeight;
    requestAnimationFrame(function(){ el.style.height='0px'; el.style.opacity='0'; el.style.paddingTop='0px'; el.style.paddingBottom='0px'; el.style.borderTopWidth='0px'; });
    el.addEventListener('transitionend', function(ev){ if(ev.propertyName==='height') quita(); });
    setTimeout(quita, 400);
  });
}
function bindHome(){
  try{ bindDec(); }catch(e){ console.warn("dec284", e); }
  try{ bindPl(); bindHist(); }catch(e){ console.warn("pl285", e); }
  Array.prototype.forEach.call(document.querySelectorAll('[data-preg272]'), function(b){ b.addEventListener('click', function(){
    var id=b.getAttribute('data-id'); window.__pq255Last=null;
    setTimeout(function(){ try{ if(vista==='hilo' && abierta===id && !document.getElementById('preg249')) abrePreguntas(id, {gesto:true}); }catch(e){} }, 120); }, true); });
  anima272();
}
/* espera de un tercero, SOLO con los campos que ya existen: detenido (quién la detiene), estado "espera" de otra persona, encargo sin contestar.
   Si la pelota es de Salvador (le preguntan, decide) o ya contestaron después de la espera, no. Sin quién confiable, no. */
function esperaTercero(t){
  if(!t || !estaAbierta(t) || t.es_recordatorio) return null;
  var p=null; try{ p=pelota263(t); }catch(e){} if(p && p.por==='te_necesito') return null;
  var c=null; esperasDe(t).some(function(w){ if(w.deMi || !w.quien || (w.fuente==='espera' && w.jefe)) return false; c={quien:w.quien, desde:w.desde}; return true; });   /* esperaDe: el lector único */
  if(!c) return null;
  var lastIn=0; (t.msgs||[]).forEach(function(m){ if(m && !m.oculto && !m.eliminado && +m.wa_in===1 && (+m.ts||0)>lastIn) lastIn=+m.ts||0; });
  if(c.desde && lastIn>c.desde) return null;   /* ya contestó: vuelve a sus secciones */
  c.corto=nombreCorto(c.quien).split(' ')[0]||c.quien;
  return c;
}


/* ===================== build 182 (Salvador 21:53, maqueta "Claude como supervisor") =====================
   1 ENTREVISTA al supervisor (max 3 preguntas, una burbuja, contesta con voz; "luego" la deja en Te toca).
   2 MEDIDA: entregable, fecha final y entregas intermedias (lista "Entregas" con fecha). Si el dueño
     tenia fecha mas relajada, se le deja la del supervisor y se le dice SOLO al supervisor.
   3 RITMO: entrega vencida -> Claude le insiste al dueño (1 al dia, maximo 2); si no reacciona,
     avisa a su jefe inmediato (canal Supervisión + push). Lo corre cualquier app que abra Doit.
   ====================================================================================================== */
function quienSupervisa(t){
  var r=(t.revisores||[]).slice();
  try{ var up=(PERSONAS[t.duenio]||{}).reporta_a; if(up && r.indexOf(up)<0) r.push(up); }catch(e){}
  return r;
}
function iniciaEntrevista(t, para){
  if(!t || t.cierre) return;
  t.entrevista={pend:true, para:para||yo, ts:Date.now()};
  var q=(PERSONAS[t.duenio]||{}).nombre||"el responsable";
  msg(t,"bal","Para medir a "+q+":\n1. ¿Qué te tiene que entregar y cómo?\n2. ¿Para cuándo lo quieres terminado?\n3. ¿Cuántos presupuestos (o qué revisiones) antes de decidir?\nContéstame con voz, todo de corrido. Si ahorita no, dime “luego”.");
  var m=t.msgs[t.msgs.length-1]; m.canal="sup"; m.de_ia=1; m.entrevista=1;
  guarda(t);
}
function entrevistaPendiente(t){ return !!(t && t.entrevista && t.entrevista.pend && t.entrevista.para===yo && !t.cierre); }
function contestaEntrevista(t, v){
  if(/^\s*(luego|despu[eé]s|ahorita no|m[aá]s tarde)\b/i.test(v)){
    msg(t,"bo",v); var mm=t.msgs[t.msgs.length-1]; mm.canal="sup"; mm.de=yo;
    msg(t,"bi","Va. Queda en “Te toca” hasta que me digas cómo medirlo."); t.msgs[t.msgs.length-1].canal="sup";
    guarda(t); render(); return;
  }
  msg(t,"bo",v); var m0=t.msgs[t.msgs.length-1]; m0.canal="sup"; m0.de=yo; guarda(t); render();
  var q=(PERSONAS[t.duenio]||{}).nombre||"el responsable";
  var sys="Eres el supervisor de tareas. El jefe dijo como quiere medir a "+q+" en la tarea “"+(t.nombre||"")+"”. Saca SOLO lo que dijo, sin inventar. "+
    "Fechas AAAA-MM-DD con este calendario: "+calendarioProximo(120).join(", ")+". Hoy es "+hoy()+". "+
    "Propon de 2 a 5 entregas intermedias con fecha entre hoy y la fecha final (la primera puede ser lo que el jefe pidio primero). "+
    "Contesta SOLO JSON: {\"entregable\":\"...\",\"como\":\"...\",\"fecha_final\":\"AAAA-MM-DD o null\",\"presupuestos\":n o null,\"entregas\":[{\"fecha\":\"AAAA-MM-DD\",\"que\":\"corto\"}]}\n\nLO QUE DIJO: "+v;
  try{
    preguntaAClaude([{role:"user",content:sys}],MODO_CEREBRO,function(txt,err){
      var j=null; try{ var mm=String(txt||"").match(/\{[\s\S]*\}/); j=mm?JSON.parse(mm[0]):null; }catch(e){ j=null; }
      if(!j){ msg(t,"bi","No pude leer tu respuesta ahorita; quedó anotada. Dímela otra vez cuando puedas."); t.msgs[t.msgs.length-1].canal="sup"; guarda(t); render(); return; }
      aplicaMedida(t, j, v);
    });
  }catch(e){}
}
function aplicaMedida(t, j, dicho){
  var q=(PERSONAS[t.duenio]||{}).nombre||"el responsable", ff=/^\d{4}-\d{2}-\d{2}$/.test(j.fecha_final||"")?j.fecha_final:null;
  /* build 190: CANDADO — la fecha final la manda lo que dijo el jefe; si esta en duda no
     se pone y se pregunta. Las entregas que propone Claude quedan entre hoy y esa fecha. */
  var _cm=candadoFecha(dicho, ff); ff=_cm.ok?_cm.fecha:null;
  if(_cm.duda){ msg(t,"bi",_cm.duda+" La fecha final no la puse."); t.msgs[t.msgs.length-1].canal="sup"; }
  t.medida={entregable:String(j.entregable||"").slice(0,200), como:String(j.como||"").slice(0,200), fecha_final:ff, presupuestos:j.presupuestos||null, por:yo, ts:Date.now(), dicho:String(dicho||"").slice(0,600)};
  t.entrevista={pend:false, para:yo, ts:Date.now()};
  /* entregas -> lista "Entregas" con fecha (el dueño las palomea hablando como cualquier paso) */
  var ents=(Array.isArray(j.entregas)?j.entregas:[]).filter(function(e){ return e && _fReal(e.fecha) && e.fecha>=hoy() && (!ff || e.fecha<=ff) && String(e.que||"").trim(); }).slice(0,6);
  t.lista_pasos=(t.lista_pasos||[]).filter(function(p){ return !p.hito; });
  ents.forEach(function(e){ t.lista_pasos.push({tx:String(e.que).trim().slice(0,80), hecho:false, sec:"", lista:"Entregas", fecha:e.fecha, hito:1}); });
  var antes=t.f_vigente, txt="Listo. Así medimos a "+q+": ";
  txt+=ents.map(function(e){ return e.que+" → "+fechaChip(e.fecha); }).join(" · ")||(t.medida.entregable||"");
  if(ff){ if(!antes || ff<antes){ t.f_vigente=ff; if(!t.f_original) t.f_original=ff; } txt+=(ents.length?"":" → "+fechaChip(ff)); }
  msg(t,"bi",txt+"."); t.msgs[t.msgs.length-1].canal="sup";
  if(ff && antes && ff<antes){ msg(t,"bi",q+" había puesto "+fechaBonita(antes)+". Le dejé tu fecha, "+fechaBonita(ff)+(ents.length?", con estas "+ents.length+" entregas":"")+"."); t.msgs[t.msgs.length-1].canal="sup"; }
  /* al dueño: lo que se le pide, en el chat del equipo */
  msg(t,"bal",q+": "+((PERSONAS[yo]||{}).nombre||"Tu jefe")+" pide "+(t.medida.entregable||"lo acordado")+(ff?" para el "+fechaBonita(ff):"")+(ents.length?". Entregas: "+ents.map(function(e){ return e.que+" ("+fechaChip(e.fecha)+")"; }).join(", "):"")+". ¿Te queda? Si no, dime para cuándo.");
  var mdu=t.msgs[t.msgs.length-1]; mdu.canal="equipo"; mdu.de_ia=1; mdu.pide_a=t.duenio;
  t.medida.espera_dueno=true;
  guarda(t); try{ sincronizaAvisos(t); }catch(e){}
  try{ if(t.duenio!==yo) disparaPushInstantaneo(t.duenio,"Nueva medida en "+(t.nombre||"tu tarea"), (t.medida.entregable||"")+(ff?" · para "+fechaChip(ff):""), urlTarea(t.id)); }catch(e){}
  if(vista==="hilo") render();
}
/* el dueño contesta "si me queda" o da otra fecha: se le avisa SOLO al supervisor */
function respuestaDueno(t, v){
  if(!t.medida || !t.medida.espera_dueno || t.duenio!==yo) return;
  t.medida.espera_dueno=false;
  var f=null; try{ f=fechaMovida(v); }catch(e){}
  var q=(PERSONAS[yo]||{}).nombre||"El responsable";
  if(f && t.medida.fecha_final && f>t.medida.fecha_final){
    msg(t,"bi",q+" dice "+fechaBonita(f)+"; tú pediste "+fechaBonita(t.medida.fecha_final)+". Le dejé tu fecha."); t.msgs[t.msgs.length-1].canal="sup";
  }
  guarda(t);
}
/* RITMO: entregas vencidas -> insistir al dueño 1 vez al dia (max 2); despues, al jefe inmediato */
function chequeoHitos(){
  var H=hoy();
  tareas.forEach(function(t){
    if(t.cierre || estadoReal(t)==="cerrada" || !tienePasos(t)) return;
    var q=(PERSONAS[t.duenio]||{}).nombre||"";
    (t.lista_pasos||[]).forEach(function(p,ix){
      if(!p.hito || p.hecho || !p.fecha || p.fecha>=H) return;
      t.hito_nag=t.hito_nag||{}; var g=t.hito_nag[ix]||(t.hito_nag[ix]={n:0, ult:"", jefe:0});
      if(g.ult===H) return;
      /* contesto el dueño despues del ultimo empujon? entonces no se insiste hoy */
      var ultNag=g.ts||0, contesto=(t.msgs||[]).some(function(m){ return m && m.k==="bo" && (m.de===t.duenio || (!m.de && t.duenio===yo)) && (m.ts||0)>ultNag && ultNag; });
      if(contesto){ g.ult=H; g.ts=Date.now(); return; }
      if(g.n<2){
        /* build 282 (F39): tono de lider, sin amenaza ("le aviso a tu jefe") ni conteo de dias sin respuesta */
        msg(t,"bal", g.n===0 ? "“"+p.tx+"” estaba para el "+fechaBonita(p.fecha)+". ¿Qué día te queda bien para entregarlo? Si algo te frena, dime y vemos cómo ayudarte." : "Retomemos “"+p.tx+"”: con una fecha corta lo dejamos encaminado. ¿Qué necesitas para sacarlo?");
        var m=t.msgs[t.msgs.length-1]; m.canal="equipo"; m.aviso=1; m.pide_a=t.duenio;
        g.n++; g.ult=H; g.ts=Date.now(); guarda(t);
        try{ disparaPushInstantaneo(t.duenio, t.nombre||"Tarea", "“"+p.tx+"” está atrasado", urlTarea(t.id)); }catch(e){}
      } else if(!g.jefe){
        var sups=quienSupervisa(t);
        msg(t,"bi", q+" todavía no entrega “"+p.tx+"” (era para el "+fechaBonita(p.fecha)+"). Ya se lo recordé con propuesta de siguiente paso; quizá le ayude una palabra tuya.");   /* build 282 (F39): sin conteo */ var mj=t.msgs[t.msgs.length-1]; mj.canal="sup"; mj.aviso=1;
        g.jefe=1; g.ult=H; guarda(t);
        sups.forEach(function(k){ try{ disparaPushInstantaneo(k, t.nombre||"Tarea", q+" no ha cumplido “"+p.tx+"”", urlTarea(t.id)); }catch(e){} });
      }
    });
  });
}
/* "yo lo superviso" / "que Samuel lo revise" al crear; "entrevístame" dentro de la tarea */
function superviseDicho(v){ return /\b(yo\s+(lo|la|los|las)\s+(superviso|reviso)|lo\s+superviso\s+yo|lo\s+reviso\s+yo)\b/i.test(String(v||"")); }
function pideEntrevista(v){ return /^\s*(entrev[ií]stame|hazme\s+la\s+entrevista|c[oó]mo\s+lo\s+medimos)\b/i.test(String(v||"")); }

/* build 179: envolturas finales (organigrama desde la barra; integrantes al crear con "que estén ...") */
(function(){
  if(typeof barraEnviar==="function"){
    var _b179=barraEnviar;
    barraEnviar=function(texto){
      try{ if(!(barraEstado && (barraEstado.completandoId||barraEstado.insertaEn)) && organigramaDicho(texto)){ aplicaOrganigrama(texto); barraEstado=null; consulta=""; render(); return; } }catch(e){}
      return _b179.apply(this, arguments);
    };
  }
  if(typeof creaTarea==="function"){
    var _c179=creaTarea;
    creaTarea=function(d){
      var t=_c179.apply(this, arguments);
      try{
        var dicho=String((d&&(d.dicho||d.nombre))||"");
        /* build 182: "yo lo superviso" -> entro como REVISA y arranca la entrevista */
        if(t && superviseDicho(dicho) && t.duenio!==yo){ t.revisores=(t.revisores||[]); if(t.revisores.indexOf(yo)<0) t.revisores.push(yo); setTimeout(function(){ iniciaEntrevista(t, yo); }, 50); }
        if(t && nombresDeIntegrantes(dicho).length){
          var prop=propuestaIntegrantes(dicho);
          if(prop.length){
            /* el nombre no carga la lista de personas */
            t.nombre=conMayuscula(String(t.nombre||"").replace(/\s*,?\s*\b(?:que\s+est[eé]n|que\s+participen|con\s+la\s+participaci[oó]n\s+de)\b.*$/i,"").trim()||t.nombre);
            window.__propInt={tid:t.id, prop:prop};
            setTimeout(function(){ if(window.__propInt && window.__propInt.tid===t.id){ window.__propInt=null; abrePropuestaIntegrantes(t,prop); } }, 700);
          }
        }
      }catch(e){ console.warn("integrantes al crear",e); }
      return t;
    };
  }
})();
/* ===== build 184 (Salvador 2026-10-02 22:40 / 10-03 06:22): LECTURA EN VOZ =====
   Dejas picado el dedo: en un mensaje "Leer desde aquí"; en el resumen "Leer el resumen" /
   "Leer toda la tarea"; en el titulo "Leer toda la tarea". Audífonos (arriba en la tarea y en
   Te toca) = modo podcast: titulo, quien la lleva y para cuando, resumen, repaso de los 3
   ultimos que ya oiste y lo nuevo. Al acabar la tarea SE DETIENE: "¿Contestas o seguimos?".
   Solo lee los meros mensajes, el resumen, el nombre y la fecha: NUNCA botones, avisos de
   seguimiento, mensajes del sistema, ligas, coordenadas ni emojis (se arma de los DATOS, no
   de la pantalla). */
var LEE={cola:[],i:0,t:null,act:false,pausa:false,modo:"",fin:false,tok:0};
function _leeRate(){ var r=0; try{ r=+localStorage.getItem("bit_lee_rate"); }catch(e){} if(!(r>0)){ try{ r=vocesConfig().ritmo||0; }catch(e){} } return r>0?r:1.1; }
/* la voz fija (un solo aviso, ajustes): la primera del elenco o la mejor es-MX */
function _leeVoz(){ try{ return vozElenco()[0]||vozMejor(); }catch(e){ return null; } }
function limpiaHabla(s){
  s=String(s||"");
  s=s.replace(/^\s*IA:\s*/i,"");
  s=s.replace(/https?:\/\/\S+|www\.\S+/gi," ");
  s=s.replace(/\[(?:audio|imagen|foto|video|documento|sticker|archivo|ubicaci[oó]n)[^\]]*\]/gi," ");
  s=s.replace(/-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/g," ");
  s=s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu," ");
  s=s.replace(/[*_~`#>|•·→←▾▴›‹✓✔︎]+/g," ");
  s=s.replace(/\$\s?(\d[\d,\.]*)/g,"$1 pesos");
  s=s.replace(/\s+/g," ").trim();
  if(s.length>420){ var c=s.slice(0,380), p=Math.max(c.lastIndexOf(". "),c.lastIndexOf("? "),c.lastIndexOf("! "));
    s=(p>150?c.slice(0,p+1):c.replace(/\s+\S*$/,""))+" … y sigue un texto largo."; }
  return s;
}
function _leeVisible(x,t){
  if(!x) return false;
  try{ if(esAvisoClaude(x) || x.aviso) return false; }catch(e){}
  var cx=canalDe(x, t);
  if(cx.indexOf("dm:")===0 && cx!=="dm:"+yo && x.de!==yo && !(PERSONAS[yo]&&PERSONAS[yo].jefe)) return false;
  if(cx.indexOf("priv:")===0 && cx!=="priv:"+yo) return false;
  if(cx==="sup" && !soySupervisor(t) && x.de!==yo) return false;
  try{ if(!msgEnCanal(x, canalActual(t).id, t)) return false; }catch(e){}
  return true;
}
/* un mensaje -> {quien, tx} o null si es paja */
function leible(x,t){
  if(!_leeVisible(x,t)) return null;
  if(x.k==="bal") return null;                                    /* voz de Claude (avisos rojos) */
  var esWa=(x.k==="bi" && (x.wa_in||x.wa_c||x.origen||x.tipo));
  if(x.k==="bi" && !esWa && !x.de) return null;                   /* mensajes del sistema */
  var quien="", raw=String(x.hab?(x.t||x.tr||""):(x.t||""));
  if(esWa){ var mm=raw.match(/^([^:\n]{1,24}):\s*([\s\S]*)$/); if(mm){ quien=mm[1].trim(); raw=mm[2]; } else quien=x.wa_c?String(x.wa_c).split(" ")[0]:""; }
  else if(x.k==="bo" && (!x.de || x.de===yo)) quien=x.nota_mia?"Tú (nota)":"Tú";
  else { try{ quien=autorMsg(x,t)||""; }catch(e){} }
  if(quien==="Claude") return null;
  if(/^(Sin confirmaci[oó]n de entrega a |NO SALI[OÓ] a )/.test(raw)) return null;
  var foto=/imagen|foto|video|sticker|documento/i.test(String(x.tipo||"")) || /^\s*\[(imagen|foto|video|documento|sticker)/i.test(raw);
  var tx=limpiaHabla(raw);
  if(foto && tx.length<4) return {quien:quien, tx:"", foto:/video/i.test(String(x.tipo||raw))?"un video":(/documento/i.test(String(x.tipo||raw))?"un documento":"una foto")};
  if(!tx || tx.length<2) return null;
  return {quien:quien, tx:tx};
}
function _leeMsgs(t, desde, hasta){
  var out=[], ult="", ms=t.msgs||[];
  for(var i=desde;i<hasta && i<ms.length;i++){
    var r=leible(ms[i],t); if(!r) continue;
    if(r.foto){ var prev=out[out.length-1];
      if(prev && prev.fotoDe===r.quien){ prev.nf++; prev.tx=(r.quien==="Tú"?"Mandaste ":r.quien+" mandó ")+prev.nf+(/video/.test(r.foto)?" videos":(/doc/.test(r.foto)?" documentos":" fotos"))+"."; prev.ix=i; continue; }
      out.push({ix:i, quien:r.quien, fotoDe:r.quien, nf:1, tx:(r.quien==="Tú"?"Mandaste ":(r.quien||"Alguien")+" mandó ")+r.foto+"."}); ult=""; continue; }
    var pre=(r.quien && r.quien!==ult)?(r.quien==="Tú"?"Tú: ":(r.quien==="Tú (nota)"?"Tu nota: ":r.quien+" dice: ")):"";
    out.push({ix:i, quien:r.quien, tx:_punto(pre+r.tx)}); ult=r.quien;
  }
  return out;
}
function _leeEntrada(t){
  var s=_punto("Tarea: "+limpiaHabla(t.nombre||"sin nombre"))+" ";
  var d=t.duenio===yo?"La llevas tú":"La lleva "+((PERSONAS[t.duenio]&&PERSONAS[t.duenio].nombre)||"otra persona");
  if(t.f_vigente){ var e=estadoReal(t);
    if(sinFinal(t)) d+=(t.indefinida===true?", indefinida":"")+(e==="hoy"?", le toca hoy":(e==="vencida"?", tocaba el "+fechaBonita(t.f_vigente)+" y no se ha confirmado":", próximo el "+fechaBonita(t.f_vigente)));
    else d+=(e==="hoy"?", vence hoy":(e==="vencida"?", venció el "+fechaBonita(t.f_vigente):", para el "+fechaBonita(t.f_vigente))); }
  return {tx:s+d+"."};
}
function _punto(s){ s=String(s||"").trim(); return /[.?!…:]$/.test(s)?s:s+"."; }
function _leeResumen(t, sinPregunta){
  var p=null; try{ p=preguntaParaMi(t); }catch(e){}
  if(!p) return null;
  var s=sinPregunta?"":_punto((p.todos?"Piden a todos, ":"Te pregunta ")+limpiaHabla(p.de)+": "+limpiaHabla(p.t)), x0=s;
  var r=(window.__paraTi||{})[t.id+"|"+p.ix];
  if(!r){ try{ var ls=localStorage.getItem("bit_pt_"+t.id+"|"+p.ix); if(ls) r=JSON.parse(ls); }catch(e){} }
  if(r && !r.err){
    (r.posturas||[]).slice(0,3).forEach(function(x){ s+=" "+_punto(limpiaHabla(x.postura||"")+": "+limpiaHabla((x.quienes||[]).join(", "))); });
    (r.datos||[]).slice(0,4).forEach(function(x){ s+=" "+_punto(limpiaHabla(x.texto||"")); });
    (r.decidido||[]).slice(0,2).forEach(function(x){ s+=" Se decidió: "+_punto(limpiaHabla(x.texto||"")); });
    (r.falta||[]).slice(0,2).forEach(function(x){ s+=" Falta: "+_punto(limpiaHabla(String(x.texto||x))); });
  }
  s=s.trim(); if(!s) return null;
  if(sinPregunta) s="Resumen: "+s;
  return {tx:s, ix:sinPregunta?undefined:p.ix, pix:p.ix};
}
function _leeMarca(t){ try{ return +localStorage.getItem("bit_leido_"+t.id)||0; }catch(e){ return 0; } }
function _leePonMarca(tid, ts){ try{ if(ts && ts>(+localStorage.getItem("bit_leido_"+tid)||0)) localStorage.setItem("bit_leido_"+tid, String(ts)); }catch(e){} }
function leeArranca(t, cola, modo){
  if(!window.speechSynthesis){ toast("Este teléfono no lee en voz alta"); return; }
  if(!cola.length){ toast("No hay mensajes para leer"); return; }
  try{ if(typeof leeEnVoz==="function" && window.__leyendo){ speechSynthesis.cancel(); window.__leyendo=false; } }catch(e){}
  try{ if(LEE.rec) LEE.rec.abort(); }catch(e){}
  LEE.t=t; LEE.cola=cola; LEE.i=0; LEE.act=true; LEE.pausa=false; LEE.fin=false; LEE.modo=modo;
  LEE.charla=false; LEE.confirma=null; LEE.espera=false; LEE.oye=false; LEE.pensando=false;
  LEE.rehace=function(){ leeArranca(t, cola, modo); };
  leePaso();
}
function leeDesde(t, ix){ leeArranca(t, _leeMsgs(t, ix, (t.msgs||[]).length), "desde"); }
function leeTarea(t){
  var c=[_leeEntrada(t)], r=_leeResumen(t, true); if(r) c.push(r);
  var _ag=_leeAgenda(t); if(_ag) c.push(_ag);   /* build 229: la franja Agendar tambien se lee */
  leeArranca(t, c.concat(_leeMsgs(t,0,(t.msgs||[]).length)), "tarea");
}
function leeNuevo(t){
  var ms=t.msgs||[], mk=_leeMarca(t), k=ms.length;
  for(var i=0;i<ms.length;i++){ if(ms[i] && (ms[i].ts||0)>mk){ k=i; break; } }
  if(!mk) k=0;
  var antes=_leeMsgs(t,0,k).slice(-3), nuevos=_leeMsgs(t,k,ms.length);
  var leidos=antes.concat(nuevos).map(function(x){ return x.ix; });
  var c=[_leeEntrada(t)], r0=_leeResumen(t), r=(r0 && leidos.indexOf(r0.pix)>=0)?_leeResumen(t,true):r0; if(r) c.push(r);
  var _ag2=_leeAgenda(t); if(_ag2) c.push(_ag2);
  if(antes.length && mk){ c.push({tx:"Lo último que escuchaste."}); antes.forEach(function(x){ c.push(x); }); }
  if(nuevos.length){ if(antes.length && mk) c.push({tx:"Ahora lo nuevo."}); nuevos.forEach(function(x){ c.push(x); }); }
  else c.push({tx:"No hay mensajes nuevos."});
  leeArranca(t, c, "nuevo");
}
function leePaso(){
  var tok=++LEE.tok;
  if(!LEE.act || LEE.pausa) { leeBarra(); return; }
  if(LEE.i>=LEE.cola.length){ return leeFin(); }
  var it=LEE.cola[LEE.i]; leeBarra(); leeRepinta(true);
  try{
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(it.tx); u.lang="es-MX"; u.rate=_leeRate(); u.pitch=vozTono(); var v=vozLectura(); if(v){ u.voice=v; u.lang=v.lang||"es-MX"; }   /* cada mensaje con la siguiente voz del elenco */
    var sig=function(){ if(tok!==LEE.tok || !LEE.act || LEE.pausa) return;
      if(typeof it.ix==="number" && LEE.t && LEE.t.msgs && LEE.t.msgs[it.ix]) _leePonMarca(LEE.t.id, LEE.t.msgs[it.ix].ts);
      LEE.i++; leePaso(); };
    u.onend=sig; u.onerror=function(e){ if(e && (e.error==="interrupted"||e.error==="canceled")) return; sig(); };
    clearTimeout(LEE.wd); LEE.wd=setTimeout(sig, 4000+it.tx.length*90/_leeRate());
    setTimeout(function(){ if(tok===LEE.tok) speechSynthesis.speak(u); }, 60);
  }catch(e){ toast("No se pudo leer en voz alta"); leePara(); }
}
function leeFin(){
  clearTimeout(LEE.wd);
  if(LEE.modo==="tarea"||LEE.modo==="nuevo"||LEE.modo==="actual") return leeCharlaFin();
  leePara();
}
function leePara(){ LEE.charla=false; LEE.confirma=null; LEE.espera=false; LEE.oye=false; LEE.pensando=false;
  try{ if(LEE.rec) LEE.rec.abort(); }catch(e){} clearTimeout(LEE.swd);
  LEE.act=false; LEE.fin=false; LEE.tok++; clearTimeout(LEE.wd); try{ speechSynthesis.cancel(); }catch(e){} leeRepinta(false); var b=document.getElementById("leebar"); if(b) b.remove(); }
function leeOrdenTT(){ return (window.__ttOrden||[]).filter(function(id){ return tareas.some(function(x){ return x.id===id && !x.cierre; }); }); }
function leeAbre(id){
  var tt=tareas.filter(function(x){return x.id===id})[0]; if(!tt) return null;
  try{ marcaVistos(tt.id, adjuntos(tt).length); marcaVistosNov(tt.id, novedadesTot(tt)); }catch(e){}
  abierta=id; vista="hilo"; fichaOpen=false; detOpen={}; menuOpen=false; editaNombre=null; render(); return tt;
}
function leeSiguienteTarea(){
  var raw=window.__ttOrden||[], ok=leeOrdenTT(), cur=LEE.t?LEE.t.id:null, k=raw.indexOf(cur), sig=null;
  for(var q=k+1;q<raw.length;q++){ if(ok.indexOf(raw[q])>=0 && raw[q]!==cur){ sig=raw[q]; break; } }
  if(!sig && k<0) sig=ok.filter(function(id){ return id!==cur; })[0];
  if(!sig){ LEE.charla=false; leeDi("Ya no hay más tareas en Te toca.", function(){ leePara(); }); return; }
  var tt=leeAbre(sig); if(tt) leeNuevo(tt);
}
function leeBarra(){
  var b=document.getElementById("leebar");
  if(!LEE.act){ if(b) b.remove(); return; }
  if(!b){ b=document.createElement("div"); b.id="leebar"; document.body.appendChild(b);
    b.addEventListener("click", leeBarraClick); }
  var x='<button class="lbb" data-lee="x" aria-label="Cerrar lectura">✕</button>';
  if(LEE.espera){
    b.className="leebar big";
    b.innerHTML='<button class="lbg on" data-lee="hablar">'+ico("mic",24,1.9)+'<span>Toca para hablar</span></button>'+
      (leeOrdenTT().length?'<button class="lbg" data-lee="sigt"><span>Siguiente ›</span></button>':'')+x;
    return;
  }
  var it=LEE.cola[LEE.i]||{}, txt, cls="leebar";
  if(LEE.oye){ cls+=" oye"; txt=LEE.oido?("“"+esc(LEE.oido)+"”"):"Te escucho…"; }
  else if(LEE.pensando){ txt="Un momento…"; }
  else if(LEE.charla||LEE.fin){ txt="Hablando contigo"; }
  else { txt=(LEE.pausa?"En pausa":"Leyendo")+(it.quien?" · "+esc(it.quien):""); }
  b.className=cls;
  b.innerHTML='<span class="lbdot"></span><span class="lbt">'+txt+'</span>'+
    ((!LEE.charla && !LEE.fin)?'<button class="lbb" data-lee="pp" aria-label="'+(LEE.pausa?"Seguir":"Pausa")+'">'+(LEE.pausa?svgPlay():svgPausa())+'</button>':'')+x;
}
function leeBarraClick(ev){
  var el=ev.target.closest("[data-lee]"); if(!el) return; ev.stopPropagation();
  var a=el.getAttribute("data-lee");
  if(a==="x") return leePara();
  if(a==="pp"){ LEE.pausa=!LEE.pausa; if(LEE.pausa){ LEE.tok++; clearTimeout(LEE.wd); try{ speechSynthesis.cancel(); }catch(e){} leeBarra(); } else leePaso(); return; }
  if(a==="hablar"){ LEE.charla=true; leeEscucha(leeComando); return; }
  if(a==="sigt") return leeSiguienteTarea();
}
function leeRepinta(scroll){
  Array.prototype.forEach.call(document.querySelectorAll(".msgs .leyendo"),function(e){ e.classList.remove("leyendo"); });
  if(!LEE.act || LEE.fin || !LEE.t || vista!=="hilo" || abierta!==LEE.t.id) return;
  var it=LEE.cola[LEE.i]; if(!it || typeof it.ix!=="number") return;
  var o=document.querySelector('.msgs [data-mix="'+it.ix+'"]')||document.querySelector('.msgs [data-hab$="|'+it.ix+'"]');
  if(o){ o.classList.add("leyendo"); if(scroll) try{ o.scrollIntoView({behavior:"smooth",block:"center"}); }catch(e){} }
}
/* menu de dejar picado */
function leeMenu(x, y, ops){
  leeCierraMenu();
  var m=document.createElement("div"); m.className="leemask"; m.id="leemask";
  var _u=ops.some(function(o){ return !o[1]; });   /* build 261: el menú único trae opciones en gris (sin acción) */
  m.innerHTML='<div class="leemenu'+(ops.unico261?' u261':'')+'">'+ops.map(function(o,i){ return '<button data-lmo="'+i+'"'+(o[1]?'':' class="lmoff" disabled aria-disabled="true"')+'>'+esc(o[0])+'</button>'; }).join("")+'</div>';
  document.body.appendChild(m);
  var mn=m.firstChild, w=230, h=Math.min(ops.length*(ops.unico261?45:50)+8, window.innerHeight-24);
  mn.style.left=Math.max(12,Math.min(window.innerWidth-w-12, x-w/2))+"px";
  mn.style.top=Math.max(12,Math.min(window.innerHeight-h-12, y-h-14))+"px";
  m.addEventListener("click",function(ev){ ev.stopPropagation(); var b=ev.target.closest("[data-lmo]"); if(b && !ops[+b.getAttribute("data-lmo")][1]) return; leeCierraMenu(); if(b) ops[+b.getAttribute("data-lmo")][1](); });
}
function leeCierraMenu(){ var m=document.getElementById("leemask"); if(m) m.remove(); }
function _leeTareaAbierta(){ return tareas.filter(function(x){return x.id===abierta})[0]; }
function _leeCopia(s){ try{ navigator.clipboard.writeText(String(s||"")).then(function(){ toast("Copiado"); },function(){ toast("No se pudo copiar"); }); }catch(e){ toast("No se pudo copiar"); } }
/* ===================== build 261 (Salvador): UN SOLO MENÚ COMPLETO, IGUAL EN CUALQUIER TEXTO =====================
   Burbujas propias y ajenas, tarjeta Te pregunta, Hecho / Me falta, notas IA, resumen, preguntas de Claude, comentarios y acomodo.
   Orden fijo: Leer desde aquí · Leer lo actual · Es para Claude · Mover a otra tarea · Nueva tarea · Dato · Copiar · Editar (solo lo propio) ·
   Ya la contesté (solo preguntas) · No guardar · Eliminar (oculta, nunca borra). Lo que no aplica sale en gris (siempre se ve igual).
   Mover y Nueva usan la hoja Vincular · Nueva. */
var MENU261=["Leer desde aquí","Leer lo actual","Es para Claude","Mover a otra tarea","Nueva tarea","Dato","Copiar","Editar","Ya la contesté","No guardar","Eliminar"];
function ctx261(el){
  var t=_leeTareaAbierta(), c={t:t, kind:"", ix:null, x:null, texto:"", el:el, card:null};
  if(!el) return c;
  var pt=el.closest(".ptcard"); if(pt && t){ c.kind="pt"; var p=null; try{ p=preguntaParaMi(t); }catch(e){} c.p=p; if(p){ c.ix=p.ix; c.x=t.msgs[p.ix]; } c.texto=pt.innerText.replace(/ver (todo|menos)\s*[▾▴]/g,"").trim(); return c; }
  var b=el.closest(".msgs [data-mix], .msgs [data-hab], .msgs .nia242[data-nix]");
  if(b && t){ var ix=b.hasAttribute("data-mix")?+b.getAttribute("data-mix"):+String(b.getAttribute(b.hasAttribute("data-hab")?"data-hab":"data-nix")).split("|").pop(); if(!isNaN(ix)){ c.kind="msg"; c.ix=ix; c.x=t.msgs[ix]; c.texto=(c.x&&(c.x.tr||c.x.t))||b.innerText||""; return c; } }
  var ac=el.closest(".acor"); if(ac){ c.kind="acomodo"; c.card=ac; c.texto=ac.innerText.replace(/\s+/g," ").trim(); return c; }
  var hc=el.closest(".hc238"); if(hc){ c.kind="hecho"; c.texto=hc.innerText.replace(/\s+/g," ").trim(); return c; }
  var pq=el.closest("#preg249 li, .pq255l li"); if(pq){ c.kind="pregunta"; c.texto=pq.innerText.replace(/\s+/g," ").trim(); return c; }
  var rs=el.closest(".rsm246, .rtx, .sub246"); if(rs){ c.kind="resumen"; c.texto=(rs.closest(".rsm246")||rs.parentNode||rs).innerText.replace(/\s+/g," ").trim(); return c; }
  return c;
}
function opcionesUnico(el){
  if(el && el.closest && el.closest(".top .tnm")) return leeOpcionesDe(el);
  var c=ctx261(el), t=c.t, x=c.x, ix=c.ix, k=c.kind, hayMsg=!!(t && x && !x.oculto && ix!=null), propio=hayMsg && propio247(x);
  var inner=function(sel){ return c.card && c.card.querySelector(sel); };
  var A=[]; for(var i=0;i<MENU261.length;i++) A.push([MENU261[i], null]);
  var pon=function(n, fn){ A[n][1]=fn; };
  if(t && k==="pt" && c.p) pon(0, function(){ var r=_leeResumen(t,false), ms=_leeMsgs(t,c.p.ix+1,(t.msgs||[]).length); leeArranca(t,(r?[r]:[]).concat(ms),"desde"); });
  else if(t && hayMsg && k==="msg") pon(0, function(){ leeDesde(t, ix); });
  if(t) pon(1, function(){ leeActual(t); });
  /* Es para Claude: lo propio va directo; lo ajeno que suena a indicación, como indicación */
  if(hayMsg){ if(propio) pon(2, function(){ accion247(t, ix, "claude", document.createElement("div")); }); else if(puedeSerIndicacion(x, t)) pon(2, function(){ convierteEnIndicacion(t, ix); }); }
  /* Mover / Nueva / Dato / No guardar: sobre el mensaje, sobre la plática (acomodo) o sobre la propuesta */
  if(hayMsg){ pon(3, function(){ abreMover(t, ix); }); pon(4, function(){ menuAcc(t, ix, '[data-acnueva]'); }); pon(5, function(){ menuAcc(t, ix, '[data-acdato]'); }); pon(9, function(){ menuAcc(t, ix, '[data-acng]'); }); }
  if(k==="acomodo"){ var pr=c.card.hasAttribute("data-p256");
    var b3=inner(pr?'[data-p256a="vinc"]':'[data-acmov]'), b4=inner(pr?'[data-p256a="ok"]':'[data-acnueva]'), b5=inner(pr?'[data-p256a="dato"]':'[data-acdato]'), b9=inner(pr?'[data-p256a="ng"]':'[data-acng]');
    if(b3) pon(3, function(){ b3.click(); }); if(b4) pon(4, function(){ b4.click(); }); if(b5) pon(5, function(){ b5.click(); }); if(b9) pon(9, function(){ b9.click(); }); }
  pon(6, function(){ _leeCopia(c.texto); });
  if(propio) pon(7, function(){ menuAcc(t, ix, '[data-d247="edit"]'); });
  if(k==="pt" && c.p) pon(8, function(){ var y=t.msgs[c.p.ix]; if(y){ y.contestada247=Date.now(); guarda(t); try{ hist240("Te pregunta: ya la contesté", t, {tipo:"contestada247", ts:y.ts}); }catch(e){} } render(); toast("Listo: ya no te la pregunta"); });
  if(k==="pt" && c.p){ pon(3, function(){ abreMover(t, c.p.ix, [c.p.ix]); }); pon(4, function(){ menuAcc(t, c.p.ix, '[data-acnueva]'); }); pon(5, function(){ menuAcc(t, c.p.ix, '[data-acdato]'); });
    pon(9, function(){ noEsDeAqui(t, c.p.ix); render(); toast("Quitada de aquí. Deshacer en el Historial"); });
    pon(10, function(){ if(aparta247(t, c.p.ix, "eliminado")){ guarda(t); try{ hist240("Eliminó la pregunta de “"+c.p.de+"”", t, {tipo:"ng_lote", tss:[(t.msgs[c.p.ix]||{}).ts]}); }catch(e){} } render(); toast("Apartada, no borrada. Deshacer en el Historial"); }); }
  if(hayMsg && k==="msg") pon(10, function(){ if(aparta247(t, ix, "eliminado")){ guarda(t); try{ hist240("Eliminó un mensaje", t, {tipo:"ng_lote", tss:[x.ts]}); }catch(e){} } render(); toast("Apartado, no borrado. Deshacer en el Historial"); });
  A.unico261=true; A.kind261=k; return A;
}
function leeOpcionesDe(el){
  var t=_leeTareaAbierta(); if(!t) return null;
  var actual=["Leer lo actual",function(){ leeActual(t); }];
  if(el.closest(".ptcard")){
    var p=null; try{ p=preguntaParaMi(t); }catch(e){}
    return [["Leer desde aquí",function(){ var r=_leeResumen(t,false), ms=p?_leeMsgs(t,p.ix+1,(t.msgs||[]).length):[]; leeArranca(t,(r?[r]:[]).concat(ms),"desde"); }],
      actual, ["Copiar",function(){ var c=el.closest(".ptcard"); _leeCopia(c?c.innerText.replace(/ver (todo|menos)\s*[▾▴]/g,"").trim():""); }]];
  }
  if(el.closest(".top .tnm")) return [["Leer toda la tarea",function(){ leeTarea(t); }], actual];
  var b=el.closest(".msgs [data-mix], .msgs [data-hab]"); if(!b) return null;
  var ix=b.hasAttribute("data-mix")?+b.getAttribute("data-mix"):+String(b.getAttribute("data-hab")).split("|").pop();
  if(isNaN(ix)) return null;
  var _ops=[["Seleccionar",function(){ iniciaSel(t, ix); }], ["Leer desde aquí",function(){ leeDesde(t, ix); }], actual,
    ["Copiar",function(){ var x=t.msgs[ix]; _leeCopia((x&&(x.tr||x.t))||""); }]];
  /* build 254: el MISMO menú que al tocar el globo (247): Editar · Eliminar · Es para Claude · Mover · Nueva · Dato · No guardar */
  var _x254=t.msgs[ix];
  if(_x254 && !_x254.oculto){
    if(propio247(_x254)){ _ops.push(["Editar",function(){ menuAcc(t, ix, '[data-d247="edit"]'); }], ["Eliminar",function(){ accion247(t, ix, "del", document.createElement("div")); }], ["Es para Claude",function(){ accion247(t, ix, "claude", document.createElement("div")); }]); }
    else if(puedeSerIndicacion(_x254, t)) _ops.push(["Indicación",function(){ convierteEnIndicacion(t, ix); }]);
    _ops.push(["Mover a otra tarea",function(){ abreMover(t, ix); }]);
    _ops.push(["Nueva",function(){ menuAcc(t, ix, '[data-acnueva]'); }], ["Dato",function(){ menuAcc(t, ix, '[data-acdato]'); }], ["No guardar",function(){ menuAcc(t, ix, '[data-acng]'); }]);
  }
  return _ops;
}
(function(){
  var tm=null, x0=0, y0=0, el0=null;
  var SEL=".msgs [data-mix], .msgs [data-hab], .msgs .nia242[data-nix], .ptcard, .hc238, .rsm246, .rtx, .sub246, #preg249 li, .acor, .top .tnm";
  document.addEventListener("touchstart",function(e){
    if(vista!=="hilo" && !(vista==="lista" && e.target.closest && e.target.closest(".acor"))) return; var el=e.target.closest && e.target.closest(SEL); if(!el) return;
    if(e.target.closest("button,a,input,[contenteditable]")) return;
    var p=e.touches[0]; x0=p.clientX; y0=p.clientY; el0=el; clearTimeout(tm);
    tm=setTimeout(function(){ var ops=opcionesUnico(el0); if(!ops) return; window.__leeLP=Date.now();   /* build 261: UN solo menú, igual en cualquier texto */
      try{ navigator.vibrate&&navigator.vibrate(12); }catch(_){} leeMenu(x0,y0,ops); }, 520);
  },{passive:true});
  document.addEventListener("touchmove",function(e){ if(!tm) return; var p=e.touches[0]; if(Math.abs(p.clientX-x0)>10||Math.abs(p.clientY-y0)>10){ clearTimeout(tm); tm=null; } },{passive:true});
  document.addEventListener("touchend",function(){ clearTimeout(tm); tm=null; },{passive:true});
  document.addEventListener("contextmenu",function(e){
    if(vista!=="hilo" && !(vista==="lista" && e.target.closest && e.target.closest(".acor"))) return; var el=e.target.closest && e.target.closest(SEL); if(!el) return;
    e.preventDefault(); if(window.__leeLP && Date.now()-window.__leeLP<900) return;
    var ops=opcionesUnico(el); if(ops){ window.__leeLP=Date.now(); leeMenu(e.clientX,e.clientY,ops); }
  });
  document.addEventListener("click",function(e){ if(window.__leeLP && Date.now()-window.__leeLP<700 && !(e.target.closest&&e.target.closest("#leemask"))){ e.stopPropagation(); e.preventDefault(); } },true);
})();
/* build 261: un toque en el texto de Hecho / Me falta, el resumen o una pregunta de Claude abre el MISMO menú único */
document.addEventListener("click",function(e){
  if(window.__leeLP && Date.now()-window.__leeLP<700) return; var t0=e.target; if(!t0 || !t0.closest) return;
  if(t0.closest("button,a,input,textarea,summary,select,[data-hc238x]")) return;
  var el=t0.closest(".hc238, .rsm246 .rtx, .rtx, .sub246, #preg249 li"); if(!el) return;
  var ops=opcionesUnico(el); if(ops){ window.__leeLP=Date.now(); leeMenu(e.clientX, e.clientY, ops); }
});
/* lo que ya viste en pantalla cuenta como leido: al salir de una tarea se marca hasta su ultimo mensaje */
(function(){
  var _r=render;
  render=function(){
    var antes=window.__leeHilo||null;
    if(window.__pq255Last && !(vista==="hilo" && abierta===window.__pq255Last)){ window.__pq255Last=null; try{ cierraPreg(); }catch(e){} }   /* build 255: al salir de la tarea el bloque se va y vuelve a salir al entrar */
    var r=_r.apply(this, arguments);
    var ahora=(vista==="hilo"&&abierta)?abierta:null;
    if(antes && antes!==ahora && !(LEE.act && LEE.t && LEE.t.id===antes)){
      var tt=tareas.filter(function(x){return x.id===antes})[0];
      if(tt && tt.msgs && tt.msgs.length) _leePonMarca(tt.id, tt.msgs[tt.msgs.length-1].ts);
    }
    window.__leeHilo=ahora;
    try{ leeExtras(); }catch(e){}
    return r;
  };
})();
function _icoAudif(){ return '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.6"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.6"/></svg>'; }
function leeExtras(){
  leeRepinta(false); leeBarra();
  if(vista==="hilo" && abierta){
    var top=document.querySelector("#app .top"), g=top&&top.querySelector(".grow");
    if(g && !document.getElementById("bleeh")){
      var b=document.createElement("button"); b.className="iconbtn"; b.id="bleeh"; b.setAttribute("aria-label","Escuchar esta tarea"); b.innerHTML=_icoAudif();
      g.parentNode.insertBefore(b, g.nextSibling);
      b.onclick=function(ev){ ev.stopPropagation(); var t=_leeTareaAbierta(); if(!t) return; if(CAM.on) return camSal(false); camEmpieza(t.id); };   /* build 274: el audífono de la tarea abre la Caminata desde esta tarea */
    }
  }
  var bt=document.getElementById("bttlee");
  if(bt) bt.onclick=function(ev){ ev.stopPropagation(); camEmpieza(); };   /* build 274: el audífono del home abre la Caminata */
}

/* ===== build 185 (Salvador 2026-10-03 06:47): LECTURA = PODCAST EN VIVO =====
   - Barra: ya no trae velocidad ni controles; solo una pastilla chica (pausa / cerrar).
     La velocidad vive en ⋯ > "Ajustar lectura" (la ultima opcion).
   - Dejar picado: mensaje -> Leer desde aquí / Leer lo actual / Copiar;
     resumen -> Leer desde aquí / Leer lo actual / Copiar. "Lo actual" = lo de hoy (o lo
     ultimo) y Claude se regresa SOLO lo necesario para entenderlo.
   - Al acabar (audífonos, toda la tarea, lo actual): "¿Contestas, tienes una duda o
     seguimos?" y el microfono se abre solo. Entiende: siguiente / repite / léeme todo el
     chat / hazme el resumen / duda (contesta con lo que dice el chat) / ya está hecha /
     elimínala (pregunta por qué; si no la pudieron hacer, a quién se la pasa) / para.
     Lo demas es una respuesta: la repite y pregunta "¿Lo mando?" antes de mandarla. */
function _nv(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[¿?¡!.,;:]/g," ").replace(/\s+/g," ").trim(); }
function leeDi(txt, done){
  var tok=++LEE.tok; LEE.hablando=true; leeBarra();
  var fin=function(){ if(tok!==LEE.tok) return; clearTimeout(LEE.wd); LEE.hablando=false; if(done) done(); };
  try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(txt); u.lang="es-MX"; u.rate=_leeRate(); u.pitch=vozTono(); var v=vozLectura(); if(v){ u.voice=v; u.lang=v.lang||"es-MX"; }
    u.onend=fin; u.onerror=function(e){ if(e && (e.error==="interrupted"||e.error==="canceled")) return; fin(); };
    clearTimeout(LEE.wd); LEE.wd=setTimeout(fin, 4000+String(txt).length*90/_leeRate());
    setTimeout(function(){ if(tok===LEE.tok) speechSynthesis.speak(u); }, 60);
  }catch(e){ fin(); }
}
/* build 210 (Salvador 07:3x, "me corta mientras hablo"): escucha CONTINUA. Motor: Web Speech API del navegador
   (webkitSpeechRecognition; en iPhone es el dictado de Apple a traves de Safari/WebKit). Antes era continuous=false: se
   cerraba en la primera pausa. Ahora: continuous=true, cierra solo tras LEE_SILENCIO ms sin palabras nuevas (o
   LEE_ESPERA_HABLA si no ha dicho nada); si el motor se cae solo (iOS lo hace), se reabre sin perder lo ya dictado; tope
   LEE_MAX. Cada sesion del motor queda en localStorage "doit_sr_log" (cuanto duro y por que cerro) para medir el limite real. */
var LEE_SILENCIO=3500, LEE_ESPERA_HABLA=8000, LEE_MAX=120000;
function srLog(o){ try{ var l=JSON.parse(localStorage.getItem("doit_sr_log")||"[]"); l.push(o); if(l.length>40) l=l.slice(-40); localStorage.setItem("doit_sr_log", JSON.stringify(l)); }catch(e){} }
function leeEscucha(cb){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  LEE.espera=false;
  if(!SR){ LEE.espera=true; leeBarra(); return; }
  var fin="", par="", hecho=false, cerrando=false, t0=Date.now(), r=null, sesT0=0, reinicios=0, motivo="";
  var acaba=function(){ if(hecho) return; hecho=true; LEE.oye=false; clearTimeout(LEE.swd); clearTimeout(LEE.swdMax);
    var v=(fin+" "+par).replace(/\s+/g," ").trim();
    srLog({ts:Date.now(), total:Date.now()-t0, reinicios:reinicios, motivo:motivo||"fin", letras:v.length});
    if(!LEE.charla) return; if(!v){ LEE.espera=true; leeBarra(); return; } cb(v); };
  var cierra=function(m){ if(hecho) return; cerrando=true; motivo=motivo||m; try{ r&&r.stop(); }catch(e){} clearTimeout(LEE.swdFb); LEE.swdFb=setTimeout(acaba, 800); };
  var reloj=function(ms){ clearTimeout(LEE.swd); LEE.swd=setTimeout(function(){ cierra(fin||par?"silencio":"no hablo"); }, ms); };
  var abre=function(){
    r=null; try{ r=new SR(); }catch(e){}
    if(!r){ if(fin||par){ motivo="no se pudo reabrir"; return acaba(); } LEE.espera=true; LEE.oye=false; leeBarra(); return; }
    r.lang="es-MX"; r.continuous=true; r.interimResults=true; sesT0=Date.now();
    r.onresult=function(e){ par=""; for(var i=e.resultIndex;i<e.results.length;i++){ if(e.results[i].isFinal) fin+=e.results[i][0].transcript+" "; else par+=e.results[i][0].transcript; }
      LEE.oido=(fin+par).trim(); leeBarra(); reloj(LEE_SILENCIO); };
    r.onerror=function(ev){ var er=(ev&&ev.error)||""; if(er==="not-allowed"||er==="service-not-allowed"||er==="audio-capture"){ motivo="error "+er; cerrando=true; } };
    r.onend=function(){ srLog({ts:Date.now(), sesion:Date.now()-sesT0, cerro:cerrando?"nosotros":"motor"});
      if(hecho) return;
      if(cerrando || !LEE.charla || Date.now()-t0>LEE_MAX){ return acaba(); }
      if(par){ fin+=par+" "; par=""; }            /* lo que iba a medias no se pierde */
      reinicios++; setTimeout(function(){ if(!hecho && LEE.charla) abre(); }, 200); };
    try{ r.start(); }catch(e){ if(fin||par){ motivo="no se pudo reabrir"; return acaba(); } LEE.espera=true; LEE.oye=false; leeBarra(); return; }
    LEE.rec=r;
  };
  LEE.oye=true; LEE.oido=""; leeBarra();
  abre(); reloj(LEE_ESPERA_HABLA);
  clearTimeout(LEE.swdMax); LEE.swdMax=setTimeout(function(){ cierra("tope"); }, LEE_MAX);
}
function leePregunta(txt){
  LEE.act=true; LEE.charla=true; LEE.fin=true; LEE.pensando=false;
  leeDi(txt, function(){ setTimeout(function(){ if(LEE.charla) leeEscucha(leeComando); }, 250); });
}
function leeOtraVez(){ leePregunta("¿Algo más, o seguimos?"); }
function leeCharlaFin(){
  LEE.fin=true; leeRepinta(false);
  leePregunta("Fin de "+limpiaHabla(LEE.t.nombre||"esta tarea")+". ¿Contestas, tienes una duda, o seguimos?");
}
function leeAseguraHilo(t){ if(vista!=="hilo" || abierta!==t.id) leeAbre(t.id); }
function leeComando(v){
  var t=LEE.t; if(!t) return leePara();
  var s=_nv(v), nw=s.split(" ").length, c=LEE.confirma; LEE.confirma=null;
  var SI=/^(si|sale|va|vale|claro|ok|okay|dale|andale|mandalo|mandala|correcto|asi|exacto|esta bien|si mandalo|perfecto)\b/, NO=/^(no|nel|cancela|espera|mejor no|todavia no)\b/;
  /* build 225: por voz igual: "ponle un mensaje a X para…" -> borrador dicho en voz -> "¿Lo mando?" */
  if(c && c.tipo==="mbor"){
    if(SI.test(s) && t.msj_borrador){ var _bc=t.msj_borrador.contacto; mandaBorrador(t); leeDi("Listo, se lo mandé a "+limpiaHabla(_bc)+".", leeOtraVez); return; }
    if(NO.test(s) && nw<=4){ t.msj_borrador=null; _notaPriv(t,"bi","No lo mandé."); guarda(t); leeDi("Va, no lo mando.", leeOtraVez); return; }
  }
  var _lmd=(t.pide_msj||t.msj_borrador)?null:mensajeDicho(v);
  if(t.pide_msj && msjEnCurso(t, v)) _lmd={ya:1};
  else if(_lmd){ var _lpg=null; try{ _lpg=programaWA(v); }catch(e){} if(_lpg && (_lpg.a_las||_lpg.sino_desde)) _lmd=null; else { leeAseguraHilo(t); pideMensaje(t, v, _lmd); } }
  if(_lmd){
    if(t.msj_borrador){ LEE.confirma={tipo:"mbor"}; return leePregunta("Le escribo a "+limpiaHabla(t.msj_borrador.contacto)+": "+limpiaHabla(t.msj_borrador.texto)+" ¿Lo mando?"); }
    if(t.pide_msj) return leePregunta("¿Qué le digo a "+limpiaHabla(t.pide_msj.nombre)+"?");
    return leePregunta("¿Quién es "+limpiaHabla(_lmd.quien||"")+"? Te dejé las opciones en la tarea.");
  }
  if(c && c.tipo==="manda"){
    if(SI.test(s)) return leeManda(t, c.v);
    if(NO.test(s) && nw<=4){ leeDi("Va, no lo mando.", leeOtraVez); return; }
    LEE.confirma={tipo:"manda", v:v}; return leePregunta("Entonces escribo: "+v+". ¿Lo mando?");
  }
  if(c && c.tipo==="seguir"){
    if(SI.test(s) || /siguiente|seguimos|sigue/.test(s)) return leeSiguienteTarea();
    if(NO.test(s) && nw<=3){ leeDi("Va.", function(){ leePara(); }); return; }
  }
  if(c && c.tipo==="destino"){   /* build 210: "¿Es para Claude o se lo mando a X?" */
    if(/\b(claude|clau|cloud|para ti|anotalo|anotala|es para ti|apuntalo|la tarea)\b/.test(s)) return leeAClaude(t, c.v);
    if(/\b(mandaselo|mandaselos|mandale|mandalo|enviaselo|enviale|a el|a ella|si mandalo|mandar)\b/.test(s) || (c.wa && s.indexOf(_nv(c.wa).split(" ")[0])>=0)) return leeManda(t, c.v);
    if(!c.n){ LEE.confirma={tipo:"destino", v:c.v, wa:c.wa, n:1}; return leePregunta("No te entendí. ¿Es para Claude o se lo mando a "+c.wa+"?"); }
    return leeAClaude(t, c.v);
  }
  if(c && c.tipo==="motivo") return leeMotivo(t, s, c.n||0);
  if(c && c.tipo==="aquien") return leeAQuien(t, v, s);
  if(/\b(eliminala|borrala|desechala|tirala|cancelala|a la basura|ya no (va a )?servir|ya no sirve|ya no se va a hacer|ya no hace falta|eliminar esta)\b/.test(s)) return leePideMotivo(t);
  if(/\b(ya (la |lo )?(hice|termine|terminamos|terminaron|hicieron|quedo)|ya esta (hecha|terminada|lista)|ya se hizo|marcala (como )?hecha|cierrala|ya esta$)/.test(s)) return leeHecha(t);
  if(nw<=4 && /^(para|alto|detente|callate|basta|es todo|termina|apaga|ya no|ya estuvo|gracias)\b/.test(s)){ leeDi("Va.", function(){ leePara(); }); return; }
  if(nw<=6 && /\b(siguiente|seguimos|sigamos|la que sigue|otra tarea|pasa a la otra|adelante|sigue)\b/.test(s)) return leeSiguienteTarea();
  if(nw<=5 && /\b(autorizala|autorizalo|autoriza|autorizar|autorizada)\b/.test(s)) return leeAutoriza(t);
  if(c && c.tipo==="agenda" && (horaDicha(v) || /todo el dia/.test(s))) return leeAgenda(t, v, s);
  if(nw<=10 && /\b(no (lo |la )?agendes|sin agendar|no lo pongas en el calendario|no hace falta agendar)\b/.test(s)){ try{ noAgendar(t); }catch(e){} return leePregunta(leeDiceAnote(t, {hecho:["sin agendar"], falta:soloMeFalta(t)}, tipoRevisar(t)==="falta")); }
  if(nw<=10 && /^(si\s+)?(agendalo|agendala|agendamelo|agendamela|ponlo en el calendario|ponla en el calendario)\b/.test(s)) return leeAgenda(t, v, s);
  if(/\bresumen\b/.test(s)) return leeResumenIA(t);
  if(/\b(todo el (chat|historial|whatsapp)|toda la (tarea|conversacion|platica)|desde el (principio|inicio)|el historial|todo$)/.test(s)) return leeTarea(t);
  if(/\b(lo actual|lo de hoy|lo ultimo)\b/.test(s)) return leeActual(t);
  if(nw<=7 && /\b(repite|repitela|repitemela|repiteme|otra vez|de nuevo|no escuche|no entendi)\b/.test(s)) return (LEE.rehace?LEE.rehace():leeNuevo(t));
  var esPreg=/^(tengo (una )?duda|duda|una pregunta|pregunta|oye)\b/.test(s) || /^(cuando|cuanto|cuantos|cuantas|quien|quienes|como|donde|por que|cual|cuales)\b/.test(s) ||
    /^que (dijo|dijeron|paso|falta|onda|precio|fecha|tal|hay|es|era|quedo|dice|opina|opinan|respondio|contesto)\b/.test(s) || /\?\s*$/.test(String(v));
  if(esPreg) return leeDuda(t, v);
  /* build 210: en audifonos TODO lo dictado es para Claude (contexto, fechas, ritmo, avisos, vinculos). Solo si la tarea
     tiene contacto de WhatsApp y suena a mensaje para esa persona, se pregunta a quien va. */
  var wa=leeContactoWA(t);
  if(wa && leeSuenaMensaje(v, wa)){ LEE.confirma={tipo:"destino", v:v, wa:wa}; return leePregunta("¿Es para Claude o se lo mando a "+wa+"?"); }
  return leeAClaude(t, v);
}
function leeContactoWA(t){ try{ var c=(contactosWA(t)||[])[0]; return c&&c.nombre?String(c.nombre):""; }catch(e){ return ""; } }
function leeSuenaMensaje(v, wa){
  var s=_nv(v), n=_nv(wa).split(" ")[0];
  if(/^(dile|digale|dile que|preguntale|preguntales|avisale|mandale|contestale|respondele|escribele|comentale|recuerdale)\b/.test(s)) return true;
  if(n && n.length>=3 && new RegExp("^(oye\\s+)?"+n+"\\b").test(s)) return true;    /* le habla directo: "Rogelio, ..." */
  try{ return !!sonaraWhatsApp(v); }catch(e){ return false; }
}
/* lo dictado va a Claude (una llamada); al terminar, la voz dice corto que anoto y que falta */
function leeAClaude(t, v){
  var _ck=checklistDicho(t, v);   /* build 214: "ya invité a X", "X confirmó" por voz */
  if(_ck && !_ck.crear){ guarda(t); return leePregunta(limpiaHabla(respChecklist(t,_ck).replace(/✓✓/g," confirmado").replace(/✓/g," invitado").replace(/○/g," pendiente"))+" ¿Algo más, o siguiente?"); }
  leeAseguraHilo(t); LEE.pensando=true; leeBarra();
  var falta=tipoRevisar(t)==="falta";
  completaRevision(t, v, {sinRevision:!falta, alTerminar:function(r){
    LEE.pensando=false; LEE.t=tareas.filter(function(x){ return x.id===t.id; })[0]||t;
    if(r && r.cerrada){ LEE.confirma={tipo:"seguir"}; return leePregunta("Listo, la marqué como hecha. ¿Seguimos con la siguiente?"); }
    leePregunta(leeDiceAnote(LEE.t, r||{}, falta)); }});
}
function leeDiceAnote(t, r, falta){
  var h=r.hecho||[], av=[], otros=[];
  h.forEach(function(x){ var m=String(x).match(/^aviso (.+?)(\s\d{1,2}:\d{2})?$/); if(m) av.push(m[1]); else otros.push(String(x).replace(/^termina el /,"fecha ").replace(/^nombre “(.+)”$/,"el nombre $1").replace(/^ritmo: /,"ritmo ")); });
  if(av.length) otros.push((av.length>1?"avisos ":"aviso ")+juntaY(av));
  var p=[];
  if(otros.length) p.push("Anoté "+juntaY(otros)+".");
  if((r.dudas||[]).length) p.push(r.dudas.join(" "));
  if(!otros.length && !(r.dudas||[]).length) p.push("No pesqué nada nuevo.");
  if((r.vinc||[]).length) p.push("Te dejé propuesto un vínculo, no lo vinculé.");
  var f=r.falta||[];
  if(falta){ if(f.length) p.push("Solo falta "+juntaY(f)+"."); else if(completitud(t).completa) p.push("Ya está completa. Di autorízala, o siguiente."); }
  else p.push("¿Algo más, o siguiente?");
  return limpiaHabla(p.join(" "));
}
/* build 210: "¿Te lo agendo?" por voz: con hora o "todo el día" se agenda; sin eso, se pregunta */
function leeAgenda(t, v, s){
  var hr=horaDicha(v)?horaValor(v):"", td=/todo el dia/.test(s);
  if(!hr && !td){ LEE.confirma={tipo:"agenda"}; return leePregunta("¿A qué hora lo agendo, o todo el día?"); }
  try{ agendaEvento(t, hr, td); }catch(e){ return leePregunta("No lo pude agendar. ¿Algo más, o siguiente?"); }
  leePregunta(leeDiceAnote(t, {hecho:[td?"agendado todo el día":"agendado a las "+hr], falta:soloMeFalta(t)}, tipoRevisar(t)==="falta"||!!t.en_revision));
}
function leeAutoriza(t){
  if(tipoRevisar(t)!=="falta"){ LEE.confirma={tipo:"seguir"}; return leePregunta("Esta ya está autorizada. ¿Seguimos con la siguiente?"); }
  if(!completitud(t).completa){ var f=soloMeFalta(t); return leePregunta("Todavía no la puedo autorizar: falta "+juntaY(f)+". Dímelo y la completo."); }
  var _ab=abierta; abierta=null; try{ autorizaRevision(t); }finally{ abierta=_ab; }   /* la siguiente la abre la lectura, no el sello */
  try{ render(); }catch(e){}
  leeDi("Autorizada.", function(){ leeSiguienteTarea(); });
}
function leeManda(t, v){
  leeAseguraHilo(t);
  setTimeout(function(){
    var ta=document.getElementById("txt"), b=document.getElementById("tenv");
    if(!ta || !b){ leeDi("No pude escribir en la tarea. Inténtalo en pantalla.", leeOtraVez); return; }
    ta.value=v; try{ ta.dispatchEvent(new Event("input",{bubbles:true})); }catch(e){}
    b.click();
    setTimeout(function(){ LEE.t=tareas.filter(function(x){return x.id===t.id})[0]||t; leeDi("Listo, enviado.", leeOtraVez); }, 300);
  }, 150);
}
function leeHecha(t){
  var f=[]; try{ f=faltanParaCerrar(t)||[]; }catch(e){}
  if(f.length){ leeDi("Todavía no la puedo cerrar: "+f.join(" y ")+".", leeOtraVez); return; }
  try{ cierraHecha(t); }catch(e){ leeDi("No la pude cerrar.", leeOtraVez); return; }
  leeAseguraHilo(t);
  LEE.confirma={tipo:"seguir"}; leePregunta("Listo, la marqué como hecha. ¿Seguimos con la siguiente?");
}
function _leeEsJefeAjena(t){ return !!(PERSONAS[yo] && PERSONAS[yo].jefe && t.duenio!==yo); }
function leePideMotivo(t){
  LEE.confirma={tipo:"motivo", n:0};
  leePregunta(_leeEsJefeAjena(t)
    ? "¿Por qué la eliminamos? ¿Ya no hace falta, cambió el plan, se resolvió por otro lado, la haces tú, o no la pudieron hacer y se la paso a alguien más?"
    : "¿Por qué la eliminamos? ¿Ya no hacía falta, se resolvió por otro lado, nunca te dieron lo que necesitabas, no te dio tiempo, o se te pasó?");
}
function leeMotivo(t, s, n){
  var jefe=_leeEsJefeAjena(t), k="";
  if(/(no (la )?(pudo|pudieron|hizo|hicieron|alcanzo)|a alguien|otra persona|pasa|encarga|reasigna)/.test(s)) k=jefe?"pasar":"no_dieron";
  else if(/otro lado|ya se resolvio|se resolvio/.test(s)) k="otro_lado";
  else if(/la hago yo|lo hago yo|yo la hago/.test(s)) k=jefe?"la_hago":"ya_no";
  else if(/cambio|cambiamos/.test(s)) k=jefe?"cambio":"ya_no";
  else if(/no me dieron|no nos dieron|nunca me dieron|me faltaron|no tenia/.test(s)) k=jefe?"ya_no":"no_dieron";
  else if(/tiempo/.test(s)) k=jefe?"ya_no":"tiempo";
  else if(/se me paso|se me olvido|olvide/.test(s)) k=jefe?"ya_no":"se_paso";
  else if(/ya no|no hace falta|no sirve|no servia|innecesari/.test(s)) k="ya_no";
  if(!k){ if(n>=1){ k="ya_no"; } else { LEE.confirma={tipo:"motivo", n:1}; return leePregunta("No te entendí. ¿Ya no hace falta, se resolvió por otro lado, o se la paso a alguien más?"); } }
  if(k==="pasar"){ LEE.confirma={tipo:"aquien"}; return leePregunta("¿A quién se la paso?"); }
  try{ cierraSinEjecutar(t, k); sincronizaAvisos(t); guarda(t); }catch(e){ leeDi("No la pude eliminar.", leeOtraVez); return; }
  leeAseguraHilo(t); try{ render(); }catch(e){}
  LEE.confirma={tipo:"seguir"}; leePregunta("Listo, la eliminé. ¿Seguimos con la siguiente?");
}
function leeAQuien(t, v, s){
  if(/^(a nadie|nadie|eliminala|no)\b/.test(s)){ try{ cierraSinEjecutar(t, "ya_no"); sincronizaAvisos(t); guarda(t); }catch(e){}
    LEE.confirma={tipo:"seguir"}; return leePregunta("Listo, la eliminé. ¿Seguimos con la siguiente?"); }
  var k=null; try{ k=duenioDicho("pasasela a "+v); }catch(e){}
  if(!k){ LEE.confirma={tipo:"aquien"}; return leePregunta("No encontré a "+v+". ¿A quién se la paso?"); }
  var r={ok:false}; try{ r=transfiere(t, k, "lo dijo "+((PERSONAS[yo]||{}).nombre||"")+" por voz"); }catch(e){}
  if(!r.ok){ leeDi("No se la pude pasar"+(r.msg?": "+r.msg:"")+".", leeOtraVez); return; }
  try{ msg(t,"bi","Se la pasé a "+PERSONAS[k].nombre+" (dictado en la lectura)."); guarda(t); render(); }catch(e){}
  LEE.confirma={tipo:"seguir"}; leePregunta("Listo, ahora la lleva "+PERSONAS[k].nombre+". ¿Seguimos con la siguiente?");
}
function _leeLineas(t, max){
  var ms=t.msgs||[], out=[], d0=Math.max(0, ms.length-(max||70));
  for(var i=d0;i<ms.length;i++){ var r=leible(ms[i],t); if(!r) continue;
    var f=ms[i].ts?fechaCorta(new Date(ms[i].ts)):"";
    out.push("["+i+(f?" · "+f:"")+"] "+(r.quien||"?")+": "+(r.foto?"("+r.foto+")":r.tx.slice(0,350))); }
  return out;
}
function _leeClaude(prompt, cb){
  LEE.pensando=true; leeBarra();
  try{ preguntaAClaude([{role:"user",content:prompt}],"rapido",function(txt,err){ LEE.pensando=false; cb(err?null:txt); }); }
  catch(e){ LEE.pensando=false; cb(null); }
}
function leeDuda(t, q){
  var ls=_leeLineas(t, 80);
  leeDi("Déjame ver.", function(){
    _leeClaude("Eres la voz de la app Doit. "+((PERSONAS[yo]||{}).nombre||"El usuario")+" va manejando y pregunta sobre la tarea \""+(t.nombre||"")+"\""+(t.f_vigente?" (fecha "+t.f_vigente+")":"")+".\n"+
      "Contesta en español, para oírse en voz: máximo 3 frases cortas, sin listas ni símbolos. Usa SOLO lo que dicen los mensajes; NO inventes ni calcules cifras. Si no está, di: Eso no está en el chat.\n\nPREGUNTA: "+q+"\n\nMENSAJES:\n"+ls.join("\n"),
      function(txt){ leeDi(txt?limpiaHabla(txt):"No pude consultar ahorita.", leeOtraVez); });
  });
}
function leeResumenIA(t){
  var ls=_leeLineas(t, 80);
  if(ls.length<2){ var r=_leeResumen(t); leeDi(r?r.tx:"Casi no hay mensajes en esta tarea.", leeOtraVez); return; }
  leeDi("Va, te lo resumo.", function(){
    _leeClaude("Resume para oírse en voz la tarea \""+(t.nombre||"")+"\". 3 a 5 frases cortas: de qué va, en qué quedó, qué falta y si algo espera respuesta de "+((PERSONAS[yo]||{}).nombre||"el usuario")+". Sin listas ni símbolos. SOLO con lo que dicen los mensajes; no inventes ni calcules cifras.\n\nMENSAJES:\n"+ls.join("\n"),
      function(txt){ leeDi(txt?limpiaHabla(txt):"No pude armar el resumen ahorita.", leeOtraVez); });
  });
}
/* "Leer lo actual": lo de hoy (o lo ultimo) + lo de atras SOLO si hace falta para entenderlo */
function _leeDesdeHeur(t){
  var ms=t.msgs||[], hoy0=new Date(); hoy0.setHours(0,0,0,0);
  var lb=_leeMsgs(t,0,ms.length); if(!lb.length) return 0;
  var k=-1; for(var i=0;i<lb.length;i++){ var x=ms[lb[i].ix]; if(x && x.ts && x.ts>=hoy0.getTime()){ k=i; break; } }
  if(k<0) k=Math.max(0, lb.length-2);
  return lb[Math.max(0,k-2)].ix;
}
function leeActual(t, conResumen){
  var ls=_leeLineas(t, 80);
  var arma=function(desde){
    var ms=t.msgs||[]; if(typeof desde!=="number" || desde<0 || desde>=ms.length || !ms[desde]) desde=_leeDesdeHeur(t);
    var msgs=_leeMsgs(t, desde, ms.length), ixs=msgs.map(function(x){return x.ix;});
    var c=[], r0=_leeResumen(t), r=(r0 && ixs.indexOf(r0.pix)>=0)?_leeResumen(t,true):r0;
    if(conResumen!==false && r) c.push(r);
    leeArranca(t, c.concat(msgs), "actual"); LEE.rehace=function(){ arma(desde); };
  };
  if(ls.length<5) return arma(0);
  LEE.t=t; LEE.act=true; LEE.fin=false; LEE.charla=false;
  var hoy=fechaCorta(new Date());
  _leeClaude("Hoy es "+hoy+". "+((PERSONAS[yo]||{}).nombre||"El usuario")+" quiere ESCUCHAR lo actual de esta conversación: los mensajes de hoy (o los últimos 2 o 3 si hoy no hay) y, antes de eso, SOLO los mensajes anteriores que hagan falta para entenderlos (de qué se está hablando, qué se preguntó). No te regreses de más.\n"+
    "Contesta SOLO JSON: {\"desde\": n} con el número del primer mensaje que hay que leer.\n\nMENSAJES:\n"+ls.join("\n"),
    function(txt){ var n=null; try{ var m=String(txt||"").match(/\{[\s\S]*\}/); if(m) n=JSON.parse(m[0]).desde; }catch(e){} arma(typeof n==="number"?n:null); });
}
/* ajustes de lectura (⋯ > Ajustar lectura) */
function leeAjustes(){
  leeCierraMenu();
  var rs=[[0.9,"Más lenta"],[1,"Normal"],[1.1,"Un poco rápida"],[1.25,"Rápida"],[1.5,"Muy rápida"]], cur=_leeRate();
  var m=document.createElement("div"); m.className="leemask"; m.id="leemask";
  m.innerHTML='<div class="leeaj"><b>Velocidad de lectura</b>'+rs.map(function(r){ return '<button data-lr="'+r[0]+'"'+(Math.abs(r[0]-cur)<0.01?' class="on"':'')+'>'+r[1]+(Math.abs(r[0]-cur)<0.01?' ✓':'')+'</button>'; }).join("")+'<button class="lst" data-lr="0">Listo</button></div>';
  document.body.appendChild(m);
  m.addEventListener("click",function(ev){ ev.stopPropagation(); var b=ev.target.closest("[data-lr]");
    if(!b){ if(ev.target===m) leeCierraMenu(); return; }
    var r=+b.getAttribute("data-lr"); if(!r){ leeCierraMenu(); return; }
    try{ localStorage.setItem("bit_lee_rate", String(r)); }catch(e){}
    leeAjustes(); try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance("Así voy a leer tus mensajes."); u.lang="es-MX"; u.rate=r; var v=_leeVoz(); if(v) u.voice=v; speechSynthesis.speak(u); }catch(e){} });
}
document.addEventListener("click",function(e){ var b=e.target.closest && e.target.closest('[data-mn="lectura"]'); if(!b) return;
  e.stopPropagation(); e.preventDefault(); menuOpen=false; render(); leeAjustes(); }, true);


/* ===== build 188 (Salvador 2026-10-03 08:39) =====
   1) Todo mensaje que va a un externo por WhatsApp desde el chat espera 30 s antes de salir:
      arriba de donde escribes sale "Se manda a X en 30 s · Deshacer"; el bote de basura del
      mensaje tambien lo cancela. Si lo borras, NO le llega.
   2) Notas para Claude ("Claude, …", "para que puedas…", "corrige…", "ojo, los 45 son 45 mil")
      se quedan en la tarea como nota privada y Claude las usa (resumen, lectura); nunca salen. */
window.__waHold=window.__waHold||{};
function _holdTxt(s){ return String(s||"").trim().toLowerCase(); }
(function(){
  var _pwa=pideWhatsApp;
  pideWhatsApp=function(c){
    if(!c || !c.tarea_id || !c.auto_respuesta || c.sin_espera) return _pwa(c);
    return new Promise(function(res, rej){
      var k="h"+Date.now()+Math.floor(Math.random()*1e4), fin=Date.now()+30000;
      var p={c:c, fin:fin, res:res};
      p.to=setTimeout(function(){ delete window.__waHold[k]; pintaHold(); _pwa(c).then(res, rej); }, 30000);
      window.__waHold[k]=p; pintaHold();
    });
  };
})();
function cancelaEnvio(tid, texto, k){
  var n=0;
  Object.keys(window.__waHold).forEach(function(q){ var p=window.__waHold[q];
    if(k ? q===k : (p.c.tarea_id===tid && _holdTxt(p.c.texto)===_holdTxt(texto))){ clearTimeout(p.to); delete window.__waHold[q]; try{ p.res({cancelado:true}); }catch(e){} n++; } });
  pintaHold(); return n;
}
function pintaHold(){ var b=document.getElementById("holdbar"); if(b) b.remove(); try{ if(vista==="hilo") render(); }catch(e){} }
function enEspera(tid, texto){ return Object.keys(window.__waHold||{}).some(function(k){ var p=window.__waHold[k]; return p.c.tarea_id===tid && _holdTxt(p.c.texto)===_holdTxt(texto); }); }
function esNotaClaude(v){
  var s=String(v||"").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  return /^(oye\s+)?(claude|cloud|clod|claud|klaud|clau)\b/.test(s) || /^(ia\b|nota para (claude|cloud|ti)|nota:|para (claude|cloud)|ojo (claude|cloud)|aclaracion|correccion|corrige)/.test(s) ||
    /\bpara que (puedas|sepas|tengas|corrijas|lo ajustes|los ajustes)\b/.test(s) ||
    /\b(el|los|ese|esos) (mensaje|numero|numeros|precio|precios) (de|que (pone|puso|mando|dice|dijo))\b/.test(s) && /\b(son|eran|significa|quiere decir|es)\b/.test(s);
}
/* ===== build 193: INDICACION PARA CLAUDE sin tener que decir "Claude" (Salvador 2026-10-04 00:24/00:29) =====
   (a) dejar picado un mensaje que no va dirigido a nadie -> ultima opcion "Indicación";
   (b) "Para Claude" (naranja) primera opcion del aviso "X es externo";
   (c) canal fijo naranja "Claude" junto a la pastilla. Las tres van por notaClaude/ejecutaNotaClaude
   (builds 188/189): nunca salen por WhatsApp, quedan privadas (priv:<yo>) y se pliegan. */
var CLAUDE_COL="#D97757";
function modoClaude(t){ return !!(t && window.__cnlClaude && window.__cnlClaude[t.id]); }
/* ¿este mensaje puede volverse indicacion? Lo escribiste tu y no va dirigido a nadie
   (ni por WhatsApp, ni privado a alguien, ni ya es nota de Claude). */
function puedeSerIndicacion(x, t){
  if(!x || x.nota_claude || x.k!=="bo") return false;
  if(x.de && x.de!==yo) return false;
  if(x.wa_auto || x.wa || x.wa_in===1 || x.wa_in===0) return false;
  var c=String(x.canal||"equipo");
  if(c.indexOf("ext:")===0 || c.indexOf("dm:")===0 || c.indexOf("priv:")===0 || c==="sup") return false;
  return !!String(x.tr||x.t||"").trim();
}
function convierteEnIndicacion(t, ix){
  var x=(t.msgs||[])[ix]; if(!puedeSerIndicacion(x, t)) return false;
  var v=String(x.tr||x.t||"").trim();
  x.canal_antes=x.canal||"equipo"; x.canal="priv:"+yo; x.nota_claude=1; x.indicacion_ts=Date.now();
  t.notas_claude=(t.notas_claude||[]).concat([{t:v, ts:Date.now()}]).slice(-30);
  guarda(t); try{ render(); }catch(e){}
  ejecutaNotaClaude(t, v);
  return true;
}
/* F36: las notas a Claude (nota_claude) y sus respuestas se pliegan: cada tramo seguido de
   notas visibles es UN renglon "! N indicaciones a Claude · ver" (nada se borra). */
/* build 196: los avisos del sistema ("Movida al…", "Te aviso…", "Cerrada sin hacerse…") se pliegan en
   un renglon gris "N avisos · ver", igual que las indicaciones. Nada se borra. El ultimo mensaje del
   chat, si es un aviso de hace menos de 10 min, se deja a la vista (es la respuesta a lo que acabas de hacer). */
var AVISO_SIS=/^(Movida |Regresada al |Te aviso|Fecha: |Listo[:,.]|Cambié el nombre|Cerrada|Reabierta|Revisión pospuesta|Se pasó aquí|Se le sumó|Queda como tarea aparte|Va, para el|Sigue guardado|Recordatorio agregado|Pasado a|Ahora es de|Ya es de|Ya está para el|Anotado)/;
function esAvisoSistema(x){
  if(!x || x.nota_claude || x.wa_in===1 || x.wa_c || x.origen || x.hab || x.abre || x.entrevista || x.de) return false;
  var tx=String(x.t||"").trim(); if(!tx) return false;
  if(x.k==="bal") return !/\?\s*$/.test(tx);
  return x.k==="bi" && AVISO_SIS.test(tx);
}
function avisosSistemaPlegados(t, abiertos, ahora){
  var r={set:{}, cab:{}}; if(abiertos) return r;
  var ms=t.msgs||[], ini=-1, n=0, ult=ms.length-1, now=ahora||Date.now();
  var dejar=(ult>=0 && esAvisoSistema(ms[ult]) && ms[ult].ts && now-ms[ult].ts<10*60000)?ult:-1;
  for(var i=0;i<=ms.length;i++){
    var es=i<ms.length && i!==dejar && esAvisoSistema(ms[i]);
    if(es){ if(ini<0){ ini=i; n=0; } r.set[i]=1; n++; }
    else if(ini>=0){ r.cab[ini]=n; ini=-1; }
  }
  return r;
}
/* ===== build 197 (Salvador 2026-10-04 12:25): CHAT LIMPIO =====
   1 AVISOS SE REEMPLAZAN: de cada TEMA solo se ve el ultimo aviso de Claude (vence en 4 -> en 3 ->
     vencida hace 5: queda el ultimo). Los viejos siguen en los datos, ocultos en "Importante".
   2 Importante | Todo arriba del chat (Importante por omision; se recuerda solo en esta sesion).
   3 Indicaciones a Claude: la indicacion y lo que Claude HIZO se ven hasta que ya las viste y
     regresas otra vez a la tarea; entonces se pliegan en "N indicaciones a Claude · ver". ===== */
function _normAviso(tx){
  return _nn(tx).replace(/\d+([.,:]\d+)*/g,"#").replace(/\b(lun|mar|mie|jue|vie|sab|dom)[a-z]*\b/g,"@")
    .replace(/\b(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*\b/g,"@").replace(/[^a-z#@ ]+/g," ").replace(/\s+/g," ").trim();
}
/* tema de un aviso de Claude, o "" si el mensaje no es aviso de Claude (persona, WhatsApp, nota) */
function temaAviso(x){
  if(!x || x.nota_claude || x.wa_in===1 || x.wa_in===0 || x.wa_c || x.origen || x.hab || x.abre || x.entrevista || x.url) return "";
  if(x.k!=="bi" && x.k!=="bal") return "";
  if(x.de && x.de!==yo && PERSONAS[x.de] && !x.aviso) return "";
  var tx=String(x.t||"").trim(); if(!tx) return "";
  if(x.aviso===1 || AVISO_RX.test(tx) || /\b(vence|venci[oó]|vencid[ao]|atrasad[ao]|tocaba|no ha cumplido|ya le insist)/i.test(tx)) return "seguimiento";
  var ms=tx.match(AVISO_SIS); if(ms) return "sis:"+_nn(ms[1]).replace(/[^a-z ]/g,"").trim();
  if(/\?\s*$/.test(tx)) return "pregunta:"+_normAviso(tx);
  return "txt:"+_normAviso(tx);
}
/* {set: indices de avisos viejos que ya fueron reemplazados por uno mas nuevo del mismo tema} */
function avisosReemplazados(t){
  var ms=t.msgs||[], ult={}, set={};
  ms.forEach(function(x,i){ var k=temaAviso(x); if(!k) return; if(ult[k]!=null) set[ult[k]]=1; ult[k]=i; });
  return {set:set};
}
/* Importante | Todo (solo pantalla, por sesion) */
function modoChat(t){ var m=(window.__chatModo||{})[t&&t.id]; return m==="todo"?"todo":"importante"; }
/* lo que sale en Importante: personas, WhatsApp, fotos/archivos, el ultimo aviso de cada tema, notas */
function esConfirmacion(x){ return !!x && !x.nota_claude && /\b(confirm(o|a|amos|ado|ada|aron|ada)|ahi estaremos|alli estaremos|cuenta(n)? con (migo|nosotros)|si vamos|si asistimos|asistiremos|ahi nos vemos|claro que si vamos|no podremos ir|no vamos a poder)\b/.test(_nv(x.t||x.tr||"")); }
function esImportante(x, ix, reempl){
  if(!x) return false;
  if(esConfirmacion(x)) return true;   /* build 214: quien confirma (o no puede) siempre se ve en Importante */
  if(reempl && reempl.set[ix]) return false;
  return true;
}
/* indicaciones: fresca hasta que la viste y volviste a entrar. Sin visto_ts y de hace mas de un dia = ya vista. */
function indicacionVigente(ms, i, visitaIni, ahora){
  var j=i; while(j+1<ms.length && ms[j+1] && ms[j+1].nota_claude) j++;
  var resp=null; for(var k=j;k>=i;k--){ if(ms[k] && ms[k].k!=="bo"){ resp=ms[k]; break; } }
  if(!resp) return true;                                   /* Claude no ha contestado: se ve */
  for(var k2=i;k2<=j;k2++){ if(ms[k2] && ms[k2].orden38 && !ms[k2].visto_ts && (ahora-(+ms[k2].ts||0))<86400000) return true; }   /* build 283: la confirmación de la Mac se ve hasta que la veas */
  var vis=resp.visto_ts || ((ahora-(resp.ts||0))>86400000 ? (resp.ts||1) : 0);
  if(!vis) return true;                                    /* todavia no la ves */
  return !(visitaIni && visitaIni>vis);                    /* ya la viste: se pliega en la siguiente visita */
}
function notasPlegadas(t, abiertas, visitaIni, ahora){
  var r={set:{}, cab:{}}; if(abiertas) return r;
  var ms=t.msgs||[], ini=-1, n=0, now=ahora||Date.now();
  for(var i=0;i<=ms.length;i++){
    var x=ms[i], es=!!(x && x.nota_claude && String(x.canal||"")==="priv:"+yo);
    /* build 197: el tramo fresco (sin ver, o visto en esta misma visita) no se pliega */
    if(es && ini<0 && visitaIni!==undefined && indicacionVigente(ms, i, visitaIni, now)){
      while(i+1<ms.length && ms[i+1] && ms[i+1].nota_claude && String(ms[i+1].canal||"")==="priv:"+yo) i++;
      continue;
    }
    if(es){ if(ini<0){ ini=i; n=0; } r.set[i]=1; if(x.k==="bo") n++; }
    else if(ini>=0){ r.cab[ini]=Math.max(n,1); ini=-1; }
  }
  return r;
}
function notaClaude(t, v){
  msg(t,"bo",v); var m=t.msgs[t.msgs.length-1]; m.de=yo; m.canal="priv:"+yo; m.nota_claude=1;
  /* build 199 (F40): "Claude, mándale/recuérdale a X a las … " -> se deja PROGRAMADO de verdad, nunca "estaré pendiente" */
  var _pgN=null; try{ _pgN=programaWA(v); }catch(e){}
  if(_pgN && (_pgN.duda || _pgN.texto==="__ESTO__")) _pgN=null;   /* build 283: sin contacto o texto claro lo decide Claude (nunca «No programé nada») */
  if(_pgN){
    var _rn=function(tx){ msg(t,"bi",tx); var r=t.msgs[t.msgs.length-1]; r.canal="priv:"+yo; r.nota_claude=1; guarda(t); render(); };
    if(revisaPG(t,_pgN)) return;
    _pgN.contacto=contactoDeTarea(t,_pgN.contacto); mandaProgramado(t,_pgN,null);
    _rn("Programé el WhatsApp a "+_pgN.contacto+(_pgN.a_las?" para el "+fechaMovCorta(_pgN.a_las.fecha)+" a las "+horaCorta(_pgN.a_las.hora):" ahora")+(_pgN.sino_desde?", solo si no contesta":"")+(_pgN.seguimiento?"; si no contesta, le insisto el "+fechaMovCorta(_pgN.seguimiento.a_las.fecha)+" a las "+horaCorta(_pgN.seguimiento.a_las.hora):"")+".");
    return;
  }
  t.notas_claude=(t.notas_claude||[]).concat([{t:v, ts:Date.now()}]).slice(-30);
  guarda(t); render();
  ejecutaNotaClaude(t, v);
}
/* build 190 (Salvador 2026-10-04 00:49): CANDADO de las notas a Claude. Caso real: "el
   proximo ritmo es el lunes" (domingo 00:41) -> Claude dijo 2026-10-07 y "Movida al lunes
   7-oct" (el 7 es miercoles). Ahora: la fecha que se guarda es la DICTADA (candadoFecha) y
   el texto lo arma el codigo desde la fecha guardada; el de Claude, si trae fechas, no se
   muestra. Un dato corregido con una fecha que no se dicto (o cuyo dia de la semana no
   cuadra) no se guarda. Regresa el texto para el usuario, o null si la accion no es de
   fecha/dato/nada (la sigue ejecutaNotaClaude). */
function aplicaNotaClaude(t, v, j){
  var a=String(j&&j.accion||"").toLowerCase(), val=String(j&&j.valor||"").trim(), r=String(j&&j.respuesta||"").trim();
  var fd=fechaDictada(v), rOk=(r && !traeFecha(r))?r:"";
  if(a==="fecha"){
    var cf=candadoFecha(v, val);
    if(cf.duda) return cf.duda+" No moví la fecha.";
    if(!cf.fecha) return "¿Para qué fecha la muevo? No la moví.";
    var rr=mueveFecha(t, cf.fecha, "lo dijo "+((PERSONAS[yo]||{}).nombre||"")+" en nota a Claude");
    try{ sincronizaAvisos(t); }catch(e){}
    if(rr && rr.ok===false) return rr.msg;
    return "Movida al "+fechaConDia(cf.fecha)+".";
  }
  if(a==="dato" && val){
    var perm=fd.todas.slice(); if(t.f_vigente) perm.push(t.f_vigente); if(t.f_original) perm.push(t.f_original);
    (t.avisos||[]).forEach(function(x){ if(x&&x.fecha) perm.push(x.fecha); });
    var malas=fd.duda?[fd.duda]:fechasRaras(val, perm);
    if(malas.length) return fd.duda ? fd.duda+" No guardé el dato."
      : "No lo guardé: traía una fecha que no dictaste"+(fd.fecha?"; dictaste el "+fechaConDia(fd.fecha):"")+". Dímelo otra vez.";
    t.datos_corregidos=(t.datos_corregidos||[]).concat([{t:val, ts:Date.now()}]).slice(-30);
    t.notas_claude=(t.notas_claude||[]).concat([{t:"DATO CORREGIDO: "+val, ts:Date.now()}]).slice(-30);
    return respuestaHecho("Guardé el dato: "+val.replace(/[.]+$/,"")+".", "");   /* build 197: dice que hizo */
  }
  if(a==="nada" || !a) return fd.duda || respuestaHecho("", rOk);
  return null;
}
/* build 206 (Salvador 21:14, Consejo Cumbres): Claude dentro de la tarea ya no solo renombra/mueve/cierra/guarda dato:
   tambien escribe contexto (sumar o reemplazar), ritmo, indefinida/recurrente y fecha dictada. Lo que entiende lo aplica;
   lo dudoso lo pregunta SIN tirar lo demas. Indefinida y ritmo tambien se sacan del texto aunque la IA no los diga. */
function aplicaCamposNota(t, v, j){
  j=j||{}; var a=String(j.accion||"").toLowerCase(), hecho=[], dudas=[], s=_fsa(v);
  if(/indefinid|sin\s+fecha\s+de\s+(fin|termino)|no\s+tiene\s+(fecha|fin)|sin\s+fin|permanente/.test(s) && t.indefinida!==true){ t.indefinida=true; t.falta_fecha=false; hecho.push("indefinida"); }
  var per=String(j.recurrente||j.periodicidad||"").toLowerCase();
  if((per==="semanal"||per==="mensual") && /recurrente|se\s+repite|repetir|cada\s+(semana|mes)|semanal|mensual/.test(s) && t.periodicidad!==per){ t.periodicidad=per; t.tipo="recurrente"; hecho.push(per==="semanal"?"recurrente cada semana":"recurrente cada mes"); }
  var rt=(j.ritmo && String(j.ritmo).trim() && RITMO_RE.test(s)) ? String(j.ritmo).trim().slice(0,80) : ritmoDicho(v);
  if(rt && _nn(rt)!==_nn(t.ritmo||"")){ t.ritmo=conMayuscula(rt); hecho.push("ritmo: "+rt.toLowerCase()); }
  try{ if(planDesdeDictado(t, v)) hecho.push(lineaPlanTxt(t)); }catch(e){}
  var cx=String(j.contexto||"").replace(/\s+/g," ").trim();
  /* build 211 (Fiesta Navideña 07:46): antes un contexto con CUALQUIER dia o mes ("antes del 15 de diciembre", "un jueves")
     se tiraba completo (traeFecha) y la nota solo movia la fecha. Ahora solo se rechaza si trae una fecha que no se dicto. */
  var _permC=fechaDictada(v).todas.concat([t.f_vigente, t.f_original, j.fecha].filter(function(x){ return _fReal(x); }));
  if(!cx && /\b(contexto|de que se trata|te explico)\b/.test(s) && String(v).split(/\s+/).length>=CTX_MIN_PAL &&
     (!String(t.contexto||"").trim() || /\b(te doy el contexto|el contexto es|este es el contexto|ponle (el )?contexto|para que (tengas|sepas) el contexto)\b/.test(s))){
    cx=sinPrefijoClaude(v).replace(/\s+/g," ").trim(); j.contexto_modo="reemplazar"; }   /* pidio poner contexto y la IA no lo regreso: va lo dictado */
  if(cx && !fechasRaras(cx, _permC).length){ var modo=String(j.contexto_modo||"").toLowerCase();
    t.contexto=(modo==="reemplazar" || !String(t.contexto||"").trim()) ? cx.slice(0,1500) : (String(t.contexto).trim()+" "+cx).slice(0,1500);   /* build 211: 600 cortaba lo dictado */
    if(Array.isArray(j.palabras) && j.palabras.length) t.palabras=j.palabras.map(function(w){ return String(w).toLowerCase().trim(); }).filter(Boolean).slice(0,6);
    hecho.push(modo==="reemplazar"?"contexto nuevo":"contexto"); }
  var _l248=aplicaLecturaFechas(t, v, j, {mueve:true}); hecho=hecho.concat(_l248.hecho);   /* build 248: no termina el X / antes del X / termina cuando */
  if(a!=="fecha" && j.fecha && t.indefinida!==true){ var fd=fechaDictada(v); if(_l248.bloquea) fd={todas:[]};   /* build 222: en una continua la fecha es meta */
    if(fd.todas.length){ var cf=candadoFecha(v, j.fecha);
      if(cf.duda) dudas.push(cf.duda);
      else if(cf.fecha && cf.fecha!==t.f_vigente){ var rr=mueveFecha(t, cf.fecha, "lo dijo "+((PERSONAS[yo]||{}).nombre||"")+" en nota a Claude"); if(!(rr && rr.ok===false)){ t.fecha_dictada=true; t.falta_fecha=false; hecho.push("fecha: "+fechaConDia(cf.fecha)); } } } }
  if(hecho.length && (t.indefinida===true || t.f_vigente || t.periodicidad)){ t.pendiente_info=""; t.pendiente_tipo=""; }
  var pq=String(j.pregunta||"").trim(), rr2=String(j.respuesta||"").trim();
  if(!pq && j.pregunta===undefined && !hecho.length && /\?/.test(rr2)) pq=rr2.replace(/^\s*(no\s+entend[ií]\s+bien|no\s+me\s+qued[oó]\s+claro)[:,.]?\s*/i,"");
  if(pq && !traeFecha(pq) && !preguntaQuienYaResuelta(t, pq)) dudas.push(pq);
  return {hecho:hecho, dudas:dudas, bloquea248:_l248.bloquea};
}
/* junta lo anotado con lo que hizo la accion y lo que falta preguntar ("No cambié nada" ya no aplica si se anotó algo) */
function juntaNota(c, tx){
  var pre=c.hecho.length?"Anoté: "+c.hecho.join(", ")+".":"", dud=c.dudas.length?c.dudas.join(" "):"";
  var vacio=!tx || /no cambi[eé] nada/i.test(tx);
  var out=[pre, vacio?"":tx, dud].filter(Boolean).join(" ");
  return out || tx || (typeof LO_PASO283==="string"?LO_PASO283:"No cambié nada todavía: lo paso a Claude para que lo aplique.");   /* build 283: nunca «dímelo otra vez»; queda de encargo para la Mac */
}
/* build 189: Claude entiende lo que le pides en la nota y lo hace (renombrar, fecha, cerrar, eliminar,
   pasarla) o guarda el dato corregido. Contesta en UNA linea privada, solo para ti. */
/* "Hice X. (Entendí: Y)". Las respuestas vagas ("Listo", "Ok") no cuentan como entender. */
function respuestaHecho(hecho, entendi){
  var e=String(entendi||"").trim(); if(traeFecha(e) || /^(listo|ok|okay|va|hecho|entendido|anotado|de acuerdo|claro)[.!]?$/i.test(e)) e="";
  /* build 199 (F40): nunca prometer vigilar sin dejar nada montado */
  if(/\b(estar[eé]\s+pendiente|te\s+aviso|lo\s+vigilo|voy\s+a\s+estar\s+(al\s+)?pendiente|le\s+doy\s+seguimiento)\b/i.test(e)){ e=""; if(!hecho) return "No dejé nada programado. Dime a quién y a qué hora (\"dile a Carlos mañana a las 9 que…\") y lo programo."; }
  if(hecho) return e && _nn(e)!==_nn(hecho) ? hecho+" Entendí: "+e.replace(/[.]+$/,"")+"." : hecho;
  return e ? "Entendí: "+e.replace(/[.]+$/,"")+". No cambié nada en la tarea." : (typeof LO_PASO283==="string"?LO_PASO283:"No cambié nada todavía: lo paso a Claude para que lo aplique.");
}
function ejecutaNotaClaude(t, v){
  try{ cargaAgendaWA(); }catch(e){}
  var ls=[]; (t.msgs||[]).slice(-40).forEach(function(x,i){ if(!x||x.nota_claude||x.eliminado||(x.nota_mia&&x.de!==yo)) return; var q=x.wa_c||(x.de&&PERSONAS[x.de]&&PERSONAS[x.de].nombre)||(x.k==="bo"?"Salvador":"Sistema"); ls.push(q+(x.nota_mia?" (nota suya, contexto)":"")+": "+String(x.tr||x.t||"").slice(0,300)); });
  (t.msgs||[]).slice(0,-40).forEach(function(x){ if(x && x.nota_mia && x.de===yo && !x.eliminado) ls.unshift(((PERSONAS[yo]||{}).nombre||"Salvador")+" (nota suya, contexto): "+String(x.t||"").slice(0,300)); });
  var hoyS=hoy();
  /* build 190: antes solo iba "hoy es AAAA-MM-DD" y Claude sacaba el dia de la semana a ojo
     ("el lunes" lo puso 7-oct, que es miercoles). Ahora va el calendario hecho; y de todos
     modos la fecha la valida el telefono (aplicaNotaClaude -> candadoFecha). */
  var p="Eres Claude dentro de la app de tareas Doit. "+((PERSONAS[yo]||{}).nombre||"El usuario")+" te escribe una nota privada sobre la tarea \""+(t.nombre||"")+"\" (fecha actual de la tarea: "+(t.f_vigente?t.f_vigente+" "+fechaBonita(t.f_vigente):"sin fecha")+"; hoy es "+fechaBonita(hoyS)+" "+hoyS+").\n"+
    "CALENDARIO (copia la fecha de aqui, NO calcules el dia de la semana): "+calendarioProximo(70).join(", ")+".\n"+
    "Si dice para cuando es la tarea o su proxima fecha, accion fecha. En respuesta NO escribas fechas ni dias (las escribe la app).\n"+
    "NUNCA contestes 'estaré pendiente' o 'te aviso': si pide mandar o recordar algo a alguien despues, la app ya lo programa sola; si no la entendiste, accion nada y pregunta a quien y a que hora.\n"+
    "Decide qué quiere y contesta SOLO JSON: {\"accion\":\"dato|renombrar|fecha|cerrar|eliminar|pasar|contexto|nada\",\"valor\":\"...\",\"respuesta\":\"QUÉ ENTENDISTE, en una frase corta en español (nunca solo 'Listo' u 'Ok')\","+
      "\"cierra\":null,\"contexto\":null,\"contexto_modo\":\"sumar|reemplazar\",\"ritmo\":null,\"indefinida\":false,\"recurrente\":null,\"fecha\":null,\"checklist\":null,\"responsable\":null,\"yo_superviso\":false,\"seguimiento_a\":null,\"compartir_con\":[],\"pregunta\":null}.\n"+
    "- responsable: si dice que la tarea es de alguien / alguien es el responsable / él solo supervisa: el nombre COMPLETO tal cual (puede ser de fuera); yo_superviso=true solo si lo dijo.\n"+
    "- seguimiento_a: SOLO si te pide que TÚ le des seguimiento a alguien: {\"quien\":\"nombre completo tal cual\",\"meta\":\"qué tiene que quedar\",\"cada\":\"frecuencia tal cual o null\",\"fechas\":[AAAA-MM-DD del calendario que salen de esa frecuencia, máx 10],\"pasos\":[{\"tx\":\"cada paso dictado como cosa que se le pregunta, EN EL ORDEN dictado (ej. 'el contacto del carpintero de Lorena (se lo pide a Karina)', 'el estatus con los dos carpinteros', 'las muestras de un cajón pintado')\",\"fecha\":\"AAAA-MM-DD del calendario si ese paso tiene plazo, o null\",\"hora\":\"HH:MM límite solo si la dijo (ej. 'a las 12'), o null\"}] (el primero es lo urgente de hoy; si no dictó pasos, []),\"hora\":\"HH:MM solo si la dijo\",\"texto\":\"WhatsApp corto y amable empezando con 'IA: '\"}.\n"+
    "- compartir_con: nombres COMPLETOS de con quién dice que se comparte o a quién se avisa; si no, [].\n"+
    "- aviso_inmediato: true SOLO si dice que le avises de inmediato si se vence. Cada meta puede llevar aviso_inmediato igual.\n"+
    "- metas: SOLO si la tarea es continua (indefinida): [{\"tx\":\"qué debe quedar\",\"fecha\":\"AAAA-MM-DD o null\",\"quien\":null,\"seguimiento\":{\"quien\":\"…\",\"cada\":\"…\",\"hora\":null} o null}]; en ese caso NUNCA uses accion fecha.\n"+
    "- checklist: si pide una lista o checklist (invitados, pendientes) o cambia una: {\"titulo\":\"Invitados\",\"items\":[{\"tx\":\"renglón tal cual viene en los mensajes\",\"estado\":0}]}; estado 0 pendiente, 1 invitado/mandado, 2 confirmado, SOLO si está dicho en los mensajes. NUNCA contestes con preguntas en vez de hacer la lista: hazla con lo que hay. CHECKLIST ACTUAL: "+checklistTexto(t)+".\n"+
    "ADEMÁS de la accion, llena TODO lo que la nota diga (puede ser varias cosas a la vez; nada inventado):\n"+
    "- contexto: de qué se trata la tarea, quiénes, para qué (1 a 3 frases); contexto_modo 'reemplazar' si lo cuenta completo o pide cambiarlo, 'sumar' si agrega algo.\n"+
    "- ritmo: cada cuánto quiere que le recuerde o revise (ej. 'una vez al mes'). - indefinida: true solo si dice que no tiene fin.\n"+
    "- OJO fechas: \"no termina el 8\", \"va a continuar hasta que…\" y \"termina cuando <evento>\" NO mueven la fecha de finiquito (accion nunca fecha por eso): el evento va en cierra (texto corto, ej. \"Fideicomiso firmado\"); \"antes del 15\" es la fecha meta.\n"+
    "- recurrente: 'semanal' o 'mensual' solo si dice que la tarea se repite. - fecha: AAAA-MM-DD solo si dicta una fecha.\n"+
    "- pregunta: SOLO lo que de verdad no quedó claro, en una pregunta corta; lo demás se aplica igual.\n"+
    "- dato: corrige o aclara información (precios, medidas, quién dijo qué). valor = el dato ya corregido, claro y completo.\n- renombrar: valor = nombre nuevo.\n- fecha: valor = AAAA-MM-DD.\n- cerrar: ya se hizo.\n- eliminar: ya no se va a hacer.\n- pasar: valor = nombre de la persona.\nNo inventes; si no entiendes, accion nada y pregunta en respuesta.\n\nNOTA: "+v+"\n\nULTIMOS MENSAJES:\n"+ls.join("\n");
  var _c206={hecho:[], dudas:[]}, _falta206=false; try{ _falta206=(tipoRevisar(t)==="falta"); }catch(e){}
  var _LP283=(typeof LO_PASO283==="string"?LO_PASO283:"No cambié nada todavía: lo paso a Claude para que lo aplique.");
  var nota=function(tx){ tx=juntaNota(_c206, tx); if(tx.indexOf(_LP283)>=0){ try{ ordenPendiente(t, v, "nota_sin_accion"); }catch(e283){} }
    msg(t,"bi",tx); var m=t.msgs[t.msgs.length-1]; m.canal="priv:"+yo; m.nota_claude=1; guarda(t);
    try{ if(_c206.hecho.length && _falta206 && revisaCompleta(t)) return; }catch(e){}
    if(vista==="hilo"&&abierta===t.id) render(); };
  try{
    preguntaAClaude([{role:"user",content:p}],(typeof MODO_RAPIDO283==="string"?MODO_RAPIDO283:"rapido"),function(txt,err){   /* build 283: nota a Claude en el modo rápido (2-3 s) */
      var j=null; try{ var mm=String(txt||"").match(/\{[\s\S]*\}/); if(mm) j=JSON.parse(mm[0]); }catch(e){}
      /* build 206: primero se aplica todo lo que dijo (contexto, ritmo, indefinida/recurrente, fecha); sin IA, lo local */
      try{ _c206=aplicaCamposNota(t, v, j||{}); if(t.indefinida===true && j && String(j.accion||"").toLowerCase()==="fecha"){ j.accion="nada"; j.fecha=null; }   /* build 222: continua: la fecha es meta */
        if(_c206.bloquea248 && j && String(j.accion||"").toLowerCase()==="fecha"){ j.accion="nada"; j.fecha=null; j.valor=""; }   /* build 248: "no termina el X" no mueve el finiquito */
        var _mt222=aplicaMetasClaude(t, v, j||{}); _c206.hecho=_c206.hecho.concat(_mt222.hecho); _c206.dudas=_c206.dudas.concat(_mt222.dudas);
        var _ai222=aplicaAvisoInmediato(t, v, j||{}); if(_ai222) _c206.hecho.push(_ai222);
        var _pr221=aplicaResponsable(t, v, j||{}); if(_pr221) _c206.hecho.push(_pr221); if(t.__dudas221){ _c206.dudas=_c206.dudas.concat(t.__dudas221); delete t.__dudas221; }
        var _sg221=aplicaSeguimientoA(t, v, j||{}); if(_sg221.hecho) _c206.hecho.push(_sg221.hecho); if(_sg221.duda) _c206.dudas.push(_sg221.duda);
        var _ckc=aplicaChecklistClaude(t, j||{}); if(_ckc){ _c206.hecho.push(_ckc); window.__chkOpen=window.__chkOpen||{}; window.__chkOpen[t.id]=true; }
        if(_c206.hecho.length){ guarda(t); try{ sincronizaAvisos(t); }catch(e){} } }catch(e){ _c206={hecho:[], dudas:[]}; }
      if(!j){ nota(_c206.hecho.length?"":_LP283); return; }   /* build 283: la IA no contestó: queda de encargo (antes "Anotado." y se perdía) */
      if(String(j.accion||"").toLowerCase()==="contexto"){ nota(""); return; }
      var a=j.accion, val=String(j.valor||"").trim(), r=String(j.respuesta||"").trim();
      try{
        /* build 190: fecha, dato y nada pasan por el CANDADO (aplicaNotaClaude) */
        var _tx=aplicaNotaClaude(t, v, j); if(_tx!=null){ nota(_tx); return; }
        if(traeFecha(r)) r="";   /* el texto de Claude con fechas no se muestra */
        /* build 197: la respuesta dice QUE HIZO (lo arma la app) y, si sirve, que entendio */
        if(a==="renombrar" && val){ var _vj=t.nombre; t.nombre=tituloTarea(conMayuscula(val)); guarda(t); nota(respuestaHecho("Cambié el nombre de “"+_vj+"” a “"+t.nombre+"”.", r)); return; }
        if(a==="cerrar"){ var f=[]; try{ f=faltanParaCerrar(t)||[]; }catch(e){} if(f.length){ nota("No la cerré: "+f.join(" y ")+"."); return; } cierraHecha(t); nota(respuestaHecho(esRecurrente(t)?"Marqué esta vuelta como hecha y la pasé a la siguiente.":"La cerré como hecha.", r)); return; }
        if(a==="eliminar"){ cierraSinEjecutar(t, "ya_no"); try{ sincronizaAvisos(t); }catch(e){} nota(respuestaHecho("La eliminé: ya no se va a hacer.", r)); return; }
        if(a==="pasar" && val){ var k=duenioDicho("pasasela a "+val); var rs=k?transfiere(t,k,"nota a Claude"):{ok:false}; nota(rs.ok?respuestaHecho("Se la pasé a "+PERSONAS[k].nombre+".", r):("No encontré a "+val+"; no se la pasé a nadie.")); return; }
      }catch(e){ nota("No pude hacerlo: "+String(e&&e.message||e).slice(0,60)); return; }
      nota(respuestaHecho("", r));
    });
  }catch(e){ nota(_LP283); }
}

