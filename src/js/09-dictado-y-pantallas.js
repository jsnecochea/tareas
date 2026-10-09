
/* dictado para la pantalla de pregunta: al soltar, manda la respuesta a barraEnviar,
   que la junta con lo anterior. Mismo motor vivo que la caratula. */
/* dictado dentro de una REVISION: deja el texto en la caja para releerlo */
function arrancaDictadoRev(btn,ta){
  if(window.__oyendo){ paraDictadoHilo(); return }
  recargaMic();
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ if(ta) ta.focus(); toast("Este navegador no dicta"); return }
  var r; try{ r=new SR() }catch(e){ toast("No se pudo abrir el micrófono"); return }
  window.__rec=r; window.__oyendo=true;
  var previo=(ta&&ta.value)?ta.value+" ":"";
  window.__dicho=""; window.__parcial="";
  r.lang="es-MX"; r.continuous=true; r.interimResults=true;
  btn.classList.add("oyendo");
  abreDictado(function(){ paraDictadoHilo() },
              function(){ paraDictadoHilo(); if(ta){ ta.value=""; } });
  function silencio(){ if(window.__silT){ clearTimeout(window.__silT); window.__silT=null; } }  /* sin auto-envío: solo manda el avioncito */
  r.onresult=function(ev){ if(window.__pausado) return;
    var interim=srJunta(ev).parcial;
    if(ta){ ta.value=(previo+window.__dicho+interim).trim();
      ta.style.height="auto"; ta.style.height=Math.min(ta.scrollHeight,96)+"px"; }
    marcaVivo(); window.__parcial=interim; pintaDictado(); silencio();
  };
  r.onerror=function(ev){
    var e=(ev&&ev.error)||"";
    if(e==="not-allowed"||e==="service-not-allowed"){ paraDictadoHilo(); avisoMicBloqueado() }
    else if(e==="network"){ paraDictadoHilo(); toast("El dictado necesita internet") }
  };
  enlazaRec(r, paraDictadoHilo);
  try{ r.start(); silencio() }catch(e){ paraDictadoHilo(); toast("No se pudo abrir el micrófono") }
}

/* dictado de la pantalla "Muy caro": termina mandando la respuesta del jefe */
/* ===== LOS BOTONES DE LA BARRA DE ABAJO, EN UN SOLO LUGAR =====
   Salvador 2026-09-05: la barra es la MISMA en todas las pantallas, asi que
   sus botones se amarran una sola vez y desde aqui las llaman el home, las
   pantallas de la barra (preguntar, contestar, escoger, confirmar) y la de
   "Muy caro". Antes esto vivia suelto dentro de bindLista y por eso el
   microfono y la flecha no servian fuera del home. */
/* PERMISO DEL MICROFONO — Salvador 2026-09-16: en iPhone instalado (PWA) iOS
   pedia el permiso en CADA dictado. Aqui se pide UNA sola vez por sesion con
   getUserMedia (mismo permiso que usa el dictado); ya concedido, el reconocedor
   de voz lo reutiliza sin volver a preguntar. Solo corre en el PRIMER dictado:
   del segundo en adelante entra directo, sin tocar nada de lo ya estable. */
/* aviso limpio cuando el micrófono está bloqueado. iOS NO permite abrir Ajustes
   ni re-activar el permiso desde una página web (regla de Apple, para todos los
   sitios). Así que se muestra la ruta más corta según si la app está instalada o
   se abrió en Safari, y un "Reintentar" por si no fue un bloqueo duro. */
function avisoMicBloqueado(){
  var prev=document.getElementById("micperm"); if(prev&&prev.parentNode) prev.parentNode.removeChild(prev);
  var pwa=estaInstalada();
  var ruta=pwa
    ? 'Ajustes  ›  Doit  ›  <b>Micrófono</b>'
    : 'En Safari toca <b>aA</b> (arriba)  ›  Ajustes del sitio web  ›  <b>Micrófono</b>  ›  Permitir';
  var el=document.createElement("div"); el.id="micperm"; el.className="micperm";
  el.innerHTML='<div class="mpcard">'+
    '<div class="mpico">'+ico("mic",30,1.8)+'</div>'+
    '<div class="mptit">Activa el micrófono</div>'+
    '<div class="mpsub">Está bloqueado. Se prende una sola vez:</div>'+
    '<div class="mpruta">'+ruta+'</div>'+
    '<button class="mpok" id="mpretry">Reintentar</button>'+
    '<button class="mpcerrar" id="mpx">Cerrar</button></div>';
  document.body.appendChild(el);
  var cerrar=function(){ if(el.parentNode) el.parentNode.removeChild(el); };
  el.onclick=function(ev){ if(ev.target===el) cerrar(); };
  document.getElementById("mpx").onclick=cerrar;
  document.getElementById("mpretry").onclick=function(){
    window.__micOK=false;
    if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){ cerrar(); return; }
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){
      try{ s.getTracks().forEach(function(t){t.stop()}); }catch(e){}
      window.__micOK=true; cerrar(); toast("Micrófono listo. Pícale otra vez para dictar.");
    }).catch(function(){ toast("Sigue bloqueado. Actívalo en la ruta de arriba."); });
  };
}
function aseguraMic(cb){
  if(window.__micOK){ cb(); return; }
  if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)){ window.__micOK=true; cb(); return; }
  /* SIN TEMPORIZADOR QUE SE ADELANTE (Salvador 2026-09-17): antes, si tardabas
     más de 1.8s en picar "Permitir", el código arrancaba el reconocedor SIN
     permiso y salía "bloqueado". Ahora se ESPERA a que contestes el aviso: si das
     Permitir, sigue; si lo niegas, sale el aviso con la ruta, y no arranca a la
     fuerza. Un tope largo por si el navegador nunca contesta. */
  var listo=false;
  var tope=setTimeout(function(){ if(!listo){ listo=true; avisoMicBloqueado(); } }, 25000);
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){
    try{ s.getTracks().forEach(function(t){ t.stop(); }); }catch(e){}
    if(listo) return; listo=true; clearTimeout(tope); window.__micOK=true; cb();
  }).catch(function(){
    if(listo) return; listo=true; clearTimeout(tope); avisoMicBloqueado();
  });
}
function bindCaja2(){
  var bq=cajaEditable($("bq")); if(bq){
    /* EL ENTER YA NO FILTRA: MANDA A CLAUDE. Regla de Salvador, 2026-09-03. */
    bq.onkeydown=function(ev){
      if(ev.key==="Enter"){ ev.preventDefault(); barraEnviar(bq.value); }
    };
    /* al salir del campo NO se manda nada: mandar cuesta tokens y salir del
       campo no es una orden. Solo se recuerda lo escrito. Pero si quedo algo
       escrito, la flecha verde empieza a latir: el que cerro el teclado con la
       palomita gris de iOS cree que ya mando, y no. */
    bq.onblur=function(){ consulta=bq.value.trim(); avisaPendiente("benv", consulta); marcaEnvio("benv", consulta) };
    bq.oninput=function(){ avisaPendiente("benv", ""); marcaEnvio("benv", bq.value) };
    bq.onfocus=function(){ avisaPendiente("benv", "") };
    marcaEnvio("benv", bq.value);
  }
  /* LA FLECHA DE ENVIAR — Salvador 2026-09-04. Antes solo se mandaba con Enter
     o dictando, y en el teclado del telefono la tecla de Enter no siempre dice
     "enviar". Ahora hay flecha, igual que en Claude y en WhatsApp. */
  var benv=$("benv"); if(benv && bq) benv.onclick=function(){
    var v=bq.value.trim(); if(!v){ bq.focus(); return }
    barraEnviar(v);
  };
  /* EL + METE FOTOS. Antes era una camara suelta a la derecha, y antes de eso
     abria "Pedirle algo a alguien", que no tenia nada que ver: eso se llego ahi
     por herencia. Salvador lo cacho el 2026-09-03. */
  var bnf=$("bnofoto"); if(bnf) bnf.onclick=function(){ fotoEnMano=null; vista="lista"; render() };
  var bcam=$("bcam"); if(bcam) bcam.onclick=function(){
    pideFoto(function(data,meta){
      fotoEnMano={data:data, ts:(meta&&meta.ts)||Date.now(),
                  lat:meta&&meta.lat, lon:meta&&meta.lon};
      vista="foto"; render();
    });
  };
  /* EL MICROFONO — copiado del mecanismo que YA funciona en la app de golf.
     LO QUE LE FALTABA Y POR ESO SE MORIA: en iPhone, Safari corta el
     reconocimiento cada pocos segundos por su cuenta. Golf lo resuelve
     reiniciandolo en onend mientras siga escuchando. Sin eso, dictas dos
     palabras y se apaga solo. Segundo toque para; corta solo tras 4s de
     silencio y al soltar va DERECHO a Claude. */
  var bmic=$("bmic");
  if(bmic) bmic.onclick=function(){
    var i=$("bq"); if(!i) return;
    if(window.__oyendo){ pararDictado(true); return }
    aseguraMic(function(){
    recargaMic();
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ i.focus(); toast("Este navegador no dicta: usa el micrófono del teclado"); return }
    var r;
    try{ r=new SR() }catch(e){ toast("No se pudo abrir el micrófono"); return }
    window.__rec=r; window.__oyendo=true; window.__dicho=""; window.__parcial="";
    r.lang="es-MX"; r.continuous=true; r.interimResults=true;
    bmic.classList.add("oyendo");
    abreDictado(function(){ pararDictado(true) },
                function(){ pararDictado(false); var _b=$("bq"); if(_b){_b.textContent=""; _b.classList.add("vacia");} marcaEnvio("benv",""); });
    function silencio(){ if(window.__silT){ clearTimeout(window.__silT); window.__silT=null; } }  /* sin auto-envío: solo manda el avioncito */
    r.onresult=function(ev){ if(window.__pausado) return;
      var interim=srJunta(ev).parcial;
      window.__parcial=interim;
      var c=$("bq"); if(c){ c.value=(window.__dicho+interim).trim(); alFinalDeLaCaja(c); marcaEnvio("benv", c.value) }
      marcaVivo(); pintaDictado(); silencio();
    };
    r.onerror=function(ev){
      var e=(ev&&ev.error)||"";
      if(e==="not-allowed"||e==="service-not-allowed"){
        pararDictado(false); avisoMicBloqueado();
      }else if(e==="network"){ pararDictado(false); toast("El dictado necesita internet") }
      /* no-speech y demas: el reinicio-con-respiro se encarga */
    };
    enlazaRec(r, function(){ pararDictado(false) });
    try{ r.start(); silencio() }
    catch(e){ pararDictado(false); toast("No se pudo abrir el micrófono") }
    });
  };
}

/* ============ BINDS ============ */
function bindLista(){
  try{ bindAcomodoInicio(); }catch(e){ console.warn("acomodo",e); }
  try{ bindPropuestas256(); }catch(e){ console.warn("propuestas256",e); }
  recargaMic();   /* canal de audio fresco en cuanto se vuelve al home */
  /* la pantalla de la foto reusa estos binds: su flecha suelta la foto */
  var bbk=$("bback"); if(bbk) bbk.onclick=function(){ fotoEnMano=null; vista="lista"; render() };
  var b=$("badm"); if(b) b.onclick=function(){vista="admin";render()};
  var _hm=$("bhmas"); if(_hm) _hm.onclick=function(){
    var v=document.createElement("div"); v.className="hoja-velo"; v.id="hojav";
    v.innerHTML='<div class="hoja"><div class="grp"><button id="hmhist">'+ico("reloj",18,1.9)+' Historial</button><button id="hmnotif">'+ico("campana",18,1.9)+' Notificaciones</button><button id="hmvoces">'+ico("voces",18,1.9)+' Voces</button></div><button class="cancel" id="hojano">Cancelar</button></div>';
    document.body.appendChild(v);
    v.onclick=function(e){ if(e.target===v) cierraHoja(); };
    $("hojano").onclick=cierraHoja;
    $("hmnotif").onclick=function(){ cierraHoja(); vista="notif"; render(); };
    $("hmhist").onclick=function(){ cierraHoja(); vista="historial"; render(); };
    $("hmvoces").onclick=function(){ cierraHoja(); vista="voces"; render(); };
  };
  var by=$("byo");  if(by) by.onclick=function(){vista="yo";render()};
  bindBotonAvisos();
  var xn=$("xnudav"); if(xn) xn.onclick=function(){ window.__nudgeAvisos=false; render(); };
  var bs=$("bsuelto"); if(bs) bs.onclick=function(){ sueltoOpen=true; vista="suelto"; render() };
  bindCaja2();
  /* build 162: la pantalla de resultados siempre deja crear lo dicho como tarea
     (o recordatorio) NUEVA — antes solo se podia buscar, sin salida. */
  var bnu=$("bnueva"); if(bnu) bnu.onclick=function(){
    var tx=String(consulta||"").trim(); if(!tx) return;
    var nom=(nombreDeLoDicho(tx)||tx).replace(/\s+/g," ").trim(); nom=conMayuscula(nom.length>60?nom.slice(0,59)+"\u2026":nom);
    var nt;
    if(/recu[e\u00e9]rdame|recordatorio|av[i\u00ed]same/i.test(tx)) nt=creaRecordatorio({texto:nom,dicho:tx});
    else nt=creaTarea({nombre:nom,dicho:tx,aviso_hora_dicha:true});
    consulta=""; barraEstado=null; abierta=nt.id; vista="hilo"; render(); toast("Tarea nueva creada");
  };
  var bc=$("bclr"); if(bc) bc.onclick=function(){ consulta=""; render() };
  var bcp=$("bcomp"); if(bcp) bcp.onclick=function(){ window.__verComp=!window.__verComp; render(); };
  var bcl=$("bcl263"); if(bcl) bcl.onclick=function(){ window.__clL263=!window.__clL263; render(); };
  try{ bindHome272(); }catch(e){ console.warn("home272", e); }
  try{ bindInicio(); }catch(e){ console.warn("inicio", e); }
  try{ bindCam274(); }catch(e){ console.warn("cam274", e); }
  var be270=$("benc270"); if(be270) be270.onclick=function(){ window.__verEnc270=!window.__verEnc270; render(); };
  var br270=$("brev270"); if(br270) br270.onclick=function(){ window.__verRev270=!window.__verRev270; render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-ttmas]"),function(b){ b.onclick=function(){ window.__ttMas=window.__ttMas||{}; var g=b.getAttribute("data-ttmas"); window.__ttMas[g]=!window.__ttMas[g]; render(); }; }); var bkc=$("bback"); if(bkc && consulta) bkc.onclick=function(){ consulta=""; render() };
  var bfu=$("bfut"); if(bfu) bfu.onclick=function(){ verFuturas=!verFuturas; render() };
  var bms2=$("bmas"); if(bms2) bms2.onclick=function(){ masDias+=7; render() };
  /* Salvador 2026-09-22: una sola franja de seccion abierta a la vez (acordeon) */
  Array.prototype.forEach.call(document.querySelectorAll("[data-sb]"),function(el){
    el.onclick=function(){ var k=el.getAttribute("data-sb"); secAbierta=(secAbierta===k?null:k); render() };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-cplay]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation();
      var tp=tareas.filter(function(x){ return x.id===el.getAttribute("data-cplay") })[0]; if(!tp) return;
      leeEnVoz("Falta un dato en "+(tp.nombre||"una tarea")+". "+(tp.pendiente_info||"")+" Esto dijiste: "+contextoPend(tp), el); };
  });
  /* build 161: picar la tarea "con información pendiente" la ABRE como cualquier otra
     (para llenarla, editarla o borrarla); el play y el micrófono siguen haciendo lo suyo */
  Array.prototype.forEach.call(document.querySelectorAll("[data-abrep]"),function(el){
    el.onclick=function(ev){
      if(ev.target.closest && ev.target.closest("[data-cplay],[data-cmic]")) return;
      var id=el.getAttribute("data-abrep");
      if(tareas.some(function(x){ return x.id===id; })){ abierta=id; vista="hilo"; render(); }
    };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-cmic]"),function(el){
    el.onclick=function(){ arrancaDictadoCompleta(el, el.getAttribute("data-cmic")); };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-desin]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation();
      var p=String(el.getAttribute("data-desin")||"").split("|");
      desinsertaAviso(p[0], p[1]); };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-abrefichi]"),function(el){
    el.onclick=function(){ var id=el.getAttribute("data-abrefichi");
      if(tareas.some(function(t){return t.id===id})){ abierta=id; vista="hilo"; render(); } };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-descom]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation(); descompletaReciente(el.getAttribute("data-descom")); };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-undo]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation(); deshaceReciente(el.getAttribute("data-undo")); };
  });
  var bt=$("btodo"); if(bt) bt.onclick=function(){ vertodo=!vertodo; render() };


  Array.prototype.forEach.call(document.querySelectorAll("[data-enc]"),function(el){
    el.onclick=function(){ encAbierto=el.getAttribute("data-enc"); vista="encargo"; render() };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-id]"),function(el){
    el.onclick=function(){
      window.recienCreadas=[];   /* abrir una tarea cierra la ventana de deshacer */
      var id=el.getAttribute("data-id");
      /* EL BADGE SE APAGA AL ABRIR, como WhatsApp. */
      if(id.indexOf("toque:")!==0){
        var tt=tareas.filter(function(x){return x.id===id})[0];
        if(tt){ marcaVistos(tt.id, adjuntos(tt).length); marcaVistosNov(tt.id, novedadesTot(tt)); }
      }
      if(id.indexOf("toque:")===0){
        var padre=id.slice(6);
        var t=tareas.filter(function(x){return x.id===padre})[0];
        if(t&&t.detenido){
          t.espera_toque=true;
          var d=diasDetenido(t);
          msg(t,"bi","Llevas "+d+" día"+(d===1?"":"s")+" esperando "+t.detenido.que+" de "+t.detenido.quien+
            (t.detenido.tel?" ("+t.detenido.tel+")":"")+". Háblale y escríbeme abajo qué te dijo. \"No contestó\" también cuenta.");
          t.msgs[t.msgs.length-1].aviso=1;
          var e2=escalaHoy(t); if(e2){ msg(t,"bal",e2); t.msgs[t.msgs.length-1].aviso=1; }
          guarda(t);
        }
        abierta=padre;
      } else abierta=id;
      vista="hilo"; fichaOpen=false; detOpen={}; menuOpen=false; editaNombre=null; render();
    };
  });
  /* el orden del swipe (window.ordenSwipe) ya se arma en vLista(), en el
     orden fijo de las 7 secciones, no leyendo el DOM — asi sigue funcionando
     aunque la seccion este plegada. Salvador 2026-09-22. */
}
function bindHilo(){
  var t=tareas.filter(function(x){return x.id===abierta})[0]; if(!t)return;
  /* PANTALLA "MUY CARO" (negociar): sus propias bindings y nada más */
  if(negociar && negociar.id===t.id){
    if(window.__oyendo){ try{ pararDictado(false) }catch(e){} }
    var nb=$("bback"); if(nb) nb.onclick=function(){ if(window.__oyendo){try{pararDictado(false)}catch(e){}} negociar=null; render(); };
    bindCaja2();
    Array.prototype.forEach.call(document.querySelectorAll("[data-jr]"),function(el){
      el.onclick=function(){ jefeResponde(t,el.getAttribute("data-jr")); };
    });
    return;
  }
  /* ---- BINDS DE UNA REVISION: sus propios botones, y lo que escribe cae en el
     chat de la tarea del otro (Salvador 2026-09-04). ---- */
  if(t.revisa_a){
    var org=tareas.filter(function(x){return x.id===t.revisa_a})[0];
    if(org){
      marcaVistosNov(org.id, novedadesTot(org));
      $("bback").onclick=function(){ posRev=false; vista="lista"; abierta=null; render() };
      var bok=$("brevok"); if(bok) bok.onclick=function(){
        msg(t,"bi","Revisada. "+(PERSONAS[org.duenio]?PERSONAS[org.duenio].nombre:"")+
            " tenía “"+org.nombre+"”.");
        cierraHecha(t); toast("Revisión cerrada"); vista="lista"; abierta=null; render();
      };
      var bps=$("brevpos"); if(bps) bps.onclick=function(){ posRev=!posRev; render() };
      Array.prototype.forEach.call(document.querySelectorAll("[data-pr]"),function(el){
        el.onclick=function(){
          var k=el.getAttribute("data-pr"); posRev=false;
          if(k==="x"){ render(); return }
          /* build 190: antes toISOString (UTC): de las 6 pm en adelante en Monterrey
             la revision se posponia UN DIA DE MAS. */
          var nueva=dmDe(hoy(),+k);
          t.f_vigente=nueva; t.estado="abierta";
          msg(t,"bi","Revisión pospuesta al "+fechaBonita(nueva)+".");
          guarda(t); toast("La vuelves a ver el "+fechaBonita(nueva));
          vista="lista"; abierta=null; render();
        };
      });
      /* lo que escriba abajo entra al chat de la tarea del OTRO, como comentario */
      var rta=$("txt");
      function mandaRev(){
        var v=(rta.value||"").trim(); if(!v) return;
        msg(org,"bo",PERSONAS[yo].nombre+": "+v);
        org.ultima=PERSONAS[yo].nombre+": "+v; guarda(org);
        rta.value=""; rta.style.height="auto"; render();
      }
      if(rta){
        rta.onkeydown=function(ev){ if(ev.key==="Enter"&&!ev.shiftKey){ ev.preventDefault(); mandaRev() } };
        rta.oninput=function(){ rta.style.height="auto"; rta.style.height=Math.min(rta.scrollHeight,96)+"px" };
      }
      var rtm=$("tmic"); if(rtm) rtm.onclick=function(){ arrancaDictadoRev(rtm,rta) };
      var rtc=$("tcam"); if(rtc) rtc.onclick=function(){ var c=$("foto"); if(c) c.click() };
      return;
    }
  }

  var adj=adjuntos(t);
  /* al ver el hilo se marca visto: se apaga el badge y el renglon verde */
  marcaVistosNov(t.id, novedadesTot(t));
  $("bback").onclick=function(){
    if(vista==="galeria"){vista="hilo";render();return}
    /* build 143: de la tarea nueva regresas a la de origen; de la ficha, a la ficha */
    var _va=window.__volverA; window.__volverA=null;
    if(_va && _va!==t.id && tareas.some(function(x){ return x.id===_va; })){ abierta=_va; vista="hilo"; render(); return }
    if(window.__desdePersona){ window.__persona=window.__desdePersona; window.__desdePersona=null; vista="persona"; render(); return }
    vista="lista";abierta=null;render();
  };
  /* build 147: "Cambiar nombre" ahora vive como primera opcion del menu de tres
     puntos (ver data-mn==="renombrar" abajo); el lapiz del header se quito. */
  var enm146=$("enom");
  if(enm146){
    var guardaNombre146=function(){
      var v146=(enm146.value||"").trim();
      editaNombre=null;
      if(v146 && v146!==t.nombre){ var F278=null, n278=t.nombre; try{ F278=camFoto275([t]); }catch(e){} t.nombre=v146; guarda(t); try{ ultNombre278(t, F278, n278); }catch(e){} try{ hist240("Cambió el nombre a “"+v146+"” (era “"+n278+"”)", t, null); }catch(e){} toast("Nombre actualizado"); }
      render();
    };
    enm146.onkeydown=function(ev){
      if(ev.key==="Enter"){ ev.preventDefault(); guardaNombre146(); }
      else if(ev.key==="Escape"){ editaNombre=null; render(); }
    };
    enm146.onblur=guardaNombre146;
  }
  /* build 143: "Listo: ..." abre la tarea nueva; el chip abre la ficha */
  Array.prototype.forEach.call(document.querySelectorAll("[data-abre]"),function(el){
    el.onclick=function(){ var id=el.getAttribute("data-abre");
      if(tareas.some(function(x){ return x.id===id; })){ window.__volverA=t.id; abierta=id; vista="hilo"; render(); }
      else toast("Esa tarea ya no está"); };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-persona]"),function(el){
    el.onclick=function(ev){ if(ev&&ev.stopPropagation) ev.stopPropagation(); abrePersona(el.getAttribute("data-persona")); };
  });
  /* build 143: si la app se cerro a medio acuerdo, se termina aqui (local) */
  (t.acuerdos_pend||[]).slice().forEach(function(p){
    if(p && (Date.now()-(p.ts||0))>30000){ try{ creaAcuerdo(t, p, null, "la app se cerró antes de terminar"); }catch(e){} }
  });
  var bdc=$("bdecidi"); if(bdc) bdc.onclick=function(){
    msg(t,"bi","Ya decidiste: "+t.pendiente_info);
    t.pendiente_tipo=""; t.pendiente_info=""; t.decision_ts=Date.now();
    guarda(t); toast("Listo, ya no est\u00e1 atorada"); render();
  };
  var bvo=$("bverorig"); if(bvo) bvo.onclick=function(){
    if(t.revisa_a){ abierta=t.revisa_a; vista="hilo"; render(); }
  };
  var bg=$("bgal"); if(bg) bg.onclick=function(){
    if(vista!=="galeria") marcaVistos(t.id, adj.length);
    window.__galSel=null; vista=(vista==="galeria"?"hilo":"galeria"); render();
  };
  Array.prototype.forEach.call(document.querySelectorAll("[data-gi]"),function(el){
    el.onclick=function(ev){ if(window.__galSel && window.__galSel.tid===t.id) return;   /* build 204: en seleccion, el toque marca (abajo) */
      abreVisor(adj.filter(function(f){return f.img;}),+el.getAttribute("data-gi"))};
  });
  /* build 204: presion larga (0.5 s) activa la seleccion; ya activa, cada toque marca o desmarca */
  Array.prototype.forEach.call(document.querySelectorAll("[data-gk]"),function(fg){
    var tmr=null, larga=false, ref=fg.getAttribute("data-gk");
    var ini=function(){ larga=false; clearTimeout(tmr); tmr=setTimeout(function(){ larga=true; window.__galSel={tid:t.id, sel:{}}; window.__galSel.sel[ref]=1; try{ navigator.vibrate&&navigator.vibrate(15); }catch(e){} render(); }, 500); };
    var fin=function(){ clearTimeout(tmr); };
    fg.addEventListener("touchstart", ini, {passive:true}); fg.addEventListener("touchend", fin); fg.addEventListener("touchmove", fin, {passive:true});
    fg.addEventListener("mousedown", ini); fg.addEventListener("mouseup", fin); fg.addEventListener("mouseleave", fin);
    fg.addEventListener("contextmenu", function(e){ e.preventDefault(); });
    fg.addEventListener("click", function(e){
      if(larga){ e.preventDefault(); e.stopPropagation(); larga=false; return; }
      var gs=window.__galSel; if(!gs || gs.tid!==t.id) return;
      e.preventDefault(); e.stopPropagation(); if(gs.sel[ref]) delete gs.sel[ref]; else gs.sel[ref]=1; render(); }, true);
  });
  var gsx=$("gsx"); if(gsx) gsx.onclick=function(){ window.__galSel=null; render(); };
  var gsa=$("gsapa"); if(gsa) gsa.onclick=function(){ var refs=Object.keys((window.__galSel||{}).sel||{}); if(!refs.length) return;
    hojaConfirma({titulo:"Apartar "+refs.length+" archivo"+(refs.length===1?"":"s"), sub:"Dejan de salir aquí. No se borra nada: quedan guardados.", accion:"Apartar",
      cb:function(){ var n=apartaAdjuntos(t, refs); window.__galSel=null; toast("Aparté "+n); render(); }}); };
  var gsc=$("gscop"); if(gsc) gsc.onclick=function(){ var refs=Object.keys((window.__galSel||{}).sel||{}); if(refs.length) abreCopiarA(t, refs); };
  var gsd=$("gsdel"); if(gsd) gsd.onclick=function(){ var refs=Object.keys((window.__galSel||{}).sel||{}); if(!refs.length) return;
    hojaEliminar(refs.length, function(){ var r=eliminaAdjuntos(t, refs); window.__galSel=null; render();
      if(!r.urls.length){ toast("Eliminé "+r.n); return; }
      procesaEliminar(t).then(function(ok){ if(ok>=r.urls.length) toast("Eliminé "+r.n); else toast("Eliminé "+r.n+". Se borrarán del servidor en cuanto esté listo."); render(); }); }); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-ai]"),function(el){
    el.onclick=function(){abreVisor(adj,+el.getAttribute("data-ai"))};
  });
  bindFotos244(document, t);
  bindLote245(document, t);
  Array.prototype.forEach.call(document.querySelectorAll(".fot img"),function(el,i){
    el.style.cursor="pointer";
    el.onclick=function(){ var _ims=adj.filter(function(f){return f.img;}), s=el.getAttribute("src"), k=-1;
      for(var q=0;q<_ims.length;q++){ if((_ims[q].data||_ims[q].url)===s){ k=q; break; } }
      abreVisor(_ims, k<0?Math.min(i,_ims.length-1):k); };
  });
  if(vista==="galeria") return;
  montaSwipeUnaVez();   /* deslizar der/izq brinca de tarea en tarea */
  var _bst=$("bstrip"); if(_bst) _bst.onclick=function(){fichaOpen=!fichaOpen;render()};   /* build 225: ya no hay ▾ (ⓘ Detalles) */
  var bc=$("bchk"); if(bc) bc.onclick=function(){chkCerrado[t.id]=!chkCerrado[t.id];render()};

  Array.prototype.forEach.call(document.querySelectorAll("[data-tk]"),function(el){
    el.onclick=function(){
      var i=+el.getAttribute("data-tk");
      t.marcados=t.marcados||{}; t.fotos=t.fotos||{};
      if(t.puntos[i].foto && !t.fotos[i] && !t.marcados[i]){
        pideFoto(function(data,meta){
          t.fotos=t.fotos||{};
          t.fotos[i]={data:data,lat:meta.lat,lon:meta.lon,ts:Date.now()};
          t.marcados=t.marcados||{}; t.marcados[i]=1;
          msg(t,"bi","Foto colgada en “"+t.puntos[i].t+"”"+(meta.lat?" con ubicación":"")+".");
          t.ultima="Rondín: "+Object.keys(t.marcados).length+" de "+t.puntos.length;
          guarda(t);
        });
        return;
      }
      if(t.marcados[i]) delete t.marcados[i]; else t.marcados[i]=1;
      var n=Object.keys(t.marcados).length;
      t.ultima="Rondín: "+n+" de "+t.puntos.length;
      if(n===t.puntos.length){ t.estado="cerrada"; msg(t,"bi","20 de 20 y las fotos. Semana cerrada, bono autorizado."); }
      guarda(t);
    };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-lb]"),function(el){
    el.onclick=function(){var i=+el.getAttribute("data-lb");detOpen[i]=!detOpen[i];render()};
  });
  /* build 148: icono ⓘ en un mensaje de IA — despliega/oculta su campo "analisis" */
  Array.prototype.forEach.call(document.querySelectorAll("[data-an]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation();
      var i=+el.getAttribute("data-an"); msgAn[i]=!msgAn[i]; render(); };
  });
  /* burbuja hablada: ver más / ver menos, y el play que la lee en voz alta */
  window.__habAbre=window.__habAbre||{};
  Array.prototype.forEach.call(document.querySelectorAll("[data-hmas]"),function(el){
    el.onclick=function(){ var id=el.getAttribute("data-hmas");
      window.__habAbre[id]=!window.__habAbre[id]; render(); };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-hplay]"),function(el){
    el.onclick=function(){ var p=String(el.getAttribute("data-hplay")).split("|");
      var tt=tareas.filter(function(z){return z.id===p[0]})[0]; if(!tt) return;
      var x=(tt.msgs||[])[+p[1]]; if(!x) return;
      leeEnVoz(x.tr||x.t||"", el); };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-mdel]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation();
      var ix=+el.getAttribute("data-mdel"); if(!t.msgs||!t.msgs[ix]) return;
      try{ cancelaEnvio(t.id, t.msgs[ix].t); }catch(e){}
      t.msgs.splice(ix,1); guarda(t); render(); };
  });
  /* build 139: cancelar un WhatsApp desde su mensaje (10 min, mientras no sale) */
  Array.prototype.forEach.call(document.querySelectorAll("[data-wacan]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation();
      var ix=+el.getAttribute("data-wacan"), x=t.msgs&&t.msgs[ix]; if(!x||!x.wa_pid) return;
      llamaPush("wa_marca",{id:x.wa_pid, estado:"cerrado"});
      x.wa_can=1; x.t="WhatsApp a "+(x.wa_c||"")+" cancelado · si ya había salido, te aviso";
      guarda(t); render(); toast("WhatsApp cancelado"); };
  });
  /* build 144: PASOS — la barra se abre/cierra; el circulo palomea */
  /* build 164: barra Vuelta (recurrentes) se abre/cierra con su historial */
  var bvu=$("bvuel"); if(bvu) bvu.onclick=function(ev){ ev.stopPropagation();
    window.__vuelOpen=window.__vuelOpen||{}; window.__vuelOpen[t.id]=!window.__vuelOpen[t.id]; render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-ltab]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation(); window.__listaAct=window.__listaAct||{};
      window.__listaAct[t.id]=el.getAttribute("data-ltab"); render(); };
  });
  /* build 168: tarjeta POR REVISAR */
  var rva=$("rvautz"); if(rva) rva.onclick=function(){ t.autorizada=true; t.autorizada_ts=Date.now(); guarda(t);
    selloYSigue(t,{tipo:"autorizada", texto:t.nombre, restaurar:function(){ t.autorizada=false; t.autorizada_ts=null; guarda(t); }}); };
  var rvn=$("rvnueva"); if(rvn) rvn.onclick=function(){ t.dup_resuelto=true;
    /* build 192: censo — la vinculacion propuesta NO era */
    t.censo_vinc_no={ts:Date.now(), por:yo||"", propuestas:posibleDup(t).slice(0,3).map(function(x){ return {id:x.id, nombre:x.nombre||""}; })};
    msg(t,"bi","Queda como tarea aparte."); guarda(t); render(); };
  try{ bindCapas273(t); }catch(e){ console.warn("capas273",e); }
  try{ if(cierraEncargos283(t)) guarda(t); }catch(e){}   /* build 283: los encargos que la Mac ya aplicó se cierran solos */
  /* build 225: chips -> su hoja; Falta -> dictado; resumen y filtro minimizables; ficha de meta; duda de tarea */
  Array.prototype.forEach.call(document.querySelectorAll("[data-chip]"),function(el){ el.onclick=function(ev){ ev.stopPropagation();
    var k=el.getAttribute("data-chip");
    if(k==="falta"){ window.__hoja225=null; abrePreguntas249(t.id, {gesto:true}); if(document.getElementById("preg249")) return; }   /* build 255; 273: SIEMPRE abre el cuestionario */
    if(k==="falta"){ window.__hoja225=null; var f=[]; try{ f=soloMeFalta(t); }catch(e){} render();
      setTimeout(function(){ if(f.length) toast("Toca el micrófono y dímelo: "+f.join(" · ")); }, 60); return; }   /* build 265: sin autoarranque */
    if(k==="resumen"){ var _imp=vista230(t)==="imp"; poneVista230(t, _imp?"":"imp"); if(!_imp){ window.__cnl=window.__cnl||{}; window.__cnl[t.id]="todo"; } render(); return; }   /* build 230: un solo resumen = la vista Importante */
    abreHoja225(t, k); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-min225]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); togMin225(t.id, el.getAttribute("data-min225")); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-mfil]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); window.__mfil225=window.__mfil225||{}; window.__mfil225[t.id]=el.getAttribute("data-mfil"); if(el.closest(".h225")) window.__hoja225=null; render(); }; });   /* build 232: desde la hoja de Metas: filtra y cierra */
  /* build 235: claves (palomear a mano, ver la confirmacion, agregar) y "Ver todo" de Importante */
  /* build 238: tarjeta Hecho / Me falta */
  Array.prototype.forEach.call(document.querySelectorAll("[data-hc238x]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); t.hecho238=null; guarda(t); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-hc238]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var a=el.getAttribute("data-hc238").split("|"), H=t.hecho238; if(!H) return; var f=(H.falta||[])[+a[0]], o=f&&f.ops[+a[1]]; if(!o) return;
    H.falta.splice(+a[0],1);
    if(f.k==="resp"){ guarda(t); completaRevision(t, "Respuesta a «"+f.q+"»: "+o.label, {sinRevision:tipoRevisar(t)!=="falta"}); return; }
    if(f.k==="vinc"){ var pc=t.encargos, hh=H; enlazaTareas(t.id, o.id, "dictado"); var d=tareas.filter(function(x){ return x.id===o.id; })[0];
      if(d && t.fusionada_en===d.id){ if(Array.isArray(pc) && pc.length) d.encargos=(Array.isArray(d.encargos)?d.encargos:[]).concat(pc);
        hh.hecho=(hh.hecho||[]).concat(["Vinculada a “"+(d.nombre||"")+"”"]); d.hecho238=hh; guarda(d); render(); } return; }
    if(f.k==="cond"){ var _h250=resuelveCond250(t, f, o); if(_h250) H.hecho=(H.hecho||[]).concat([_h250]); guarda(t); render(); return; }
    if(f.k==="msg"){ var per=(candidatosPersona(t).filter(function(c){ return c.id===o.id; })[0])||{id:o.id, nombre:o.label}; var por=mandaOrden238(t, per, f.texto); H.hecho=(H.hecho||[]).concat(["Le escribí a "+nombreCorto(per.nombre)+" "+por+": “"+f.texto+"”"]); }
    guarda(t); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-clv]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var id=el.getAttribute("data-clv");
    (t.claves||[]).forEach(function(c){ if(c && String(c.id)===id){ try{ hist240((c.ok?"Quitó la palomita: ":"Palomeó: ")+c.t, t, {tipo:"palomita", clave:id, prev:!!c.ok}); }catch(e){} c.ok=!c.ok; c.por=c.ok?yo:null; c.ok_ts=c.ok?Date.now():null; } }); guarda(t); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-clvev]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var i=el.getAttribute("data-clvev");
    abreEvidencia(t); var b=document.querySelector('#evi229 [data-evi="'+i+'"]'); if(b) b.click(); }; });
  var _cad=function(){ var inp=$("clvnew"), v=inp?String(inp.value||"").trim():""; if(!v) return; t.claves=Array.isArray(t.claves)?t.claves:[];
    var id="c"+Date.now().toString(36); t.claves.push({id:id, t:v.charAt(0).toUpperCase()+v.slice(1), ok:false, por:yo, creado:Date.now()}); guarda(t); render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-clvadd]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); _cad(); }; });
  var _cin=$("clvnew"); if(_cin) _cin.onkeydown=function(ev){ if(ev.key==="Enter"){ ev.preventDefault(); _cad(); } };
  Array.prototype.forEach.call(document.querySelectorAll("[data-vt235]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); poneVista230(t, ""); window.__cnl=window.__cnl||{}; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-f234]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); window.__hoja225=null; menuOpen=false;   /* build 234: igual que ⋯ > Mover la fecha */
    t.pide_fecha=true; msg(t,"bi","¿Para cuándo la muevo? Dime por ejemplo: el viernes, en 15 días o a fin de mes."); guarda(t); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-h225x]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); window.__hoja225=null; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-h225alto]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var H=hoja225(t); if(H){ H.alto=el.getAttribute("data-h225alto"); render(); } }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-fmeta]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); abreHoja225(t, "meta", el.getAttribute("data-fmeta")); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll(".h225 .mt[data-meta] .mtx"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var r=el.closest("[data-meta]"); abreHoja225(t, "meta", r.getAttribute("data-meta")); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-orig225]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); window.__orig225=window.__orig225||{}; window.__orig225[t.id]=!window.__orig225[t.id]; render(); }; });
  try{ var _ms226=document.querySelector(".msgs"); if(_ms226) bindAcomodo(_ms226, function(){ return t; }); var _pt227=document.querySelector(".ptcard"); if(_pt227) bindAcomodo(_pt227, function(){ return t; }); }catch(e){}   /* build 226: OK · Mover · Nueva */
  var _ib227=document.querySelector("[data-int227]"); if(_ib227) _ib227.onclick=function(ev){ ev.stopPropagation(); window.__hoja225=null; render(); abreIntegrantes(t); };
  /* build 225: el mensaje armado: Mandar / Cambiar / No mandar */
  Array.prototype.forEach.call(document.querySelectorAll("[data-mbact]"),function(el){ el.onclick=function(ev){ ev.stopPropagation();
    var a=el.getAttribute("data-mbact"), b=t.msj_borrador; if(!b) return;
    if(a==="manda"){ mandaBorrador(t); render(); return; }
    if(a==="cambia"){ window.__msjEdit={tid:t.id}; var x=$("txt"); if(x){ x.value=b.texto; try{ marcaEnvio("tenv", x.value); x.focus(); alFinalDeLaCaja(x); }catch(e){} } toast("Corrígelo y manda: queda como el mensaje"); return; }
    t.msj_borrador=null; _notaPriv(t,"bi","No lo mandé."); guarda(t); render(); }; });
  /* build 221: ¿Quién es X? -> escoge una opción o escribe otro/nuevo */
  Array.prototype.forEach.call(document.querySelectorAll("[data-qdpick]"),function(el){ el.onclick=function(ev){ ev.stopPropagation();
    var a=el.getAttribute("data-qdpick").split("|"), d=(t.quien_dudas||[]).filter(function(x){ return x.id===a[0]; })[0], c=d&&d.cands[+a[1]]; if(!c) return;
    resuelveDudaPersona(t, a[0], {id:c.id, nombre:c.nombre}); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-qdotro]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); window.__qdOtro=el.getAttribute("data-qdotro"); render();
    var i=document.getElementById("qdin"); if(i) try{ i.focus(); i.select(); }catch(e){} }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-qdnuevo]"),function(el){ el.onclick=function(ev){ ev.stopPropagation();
    var i=document.getElementById("qdin"), nm=String((i&&i.value)||"").replace(/\s+/g," ").trim(); if(!nm) return;
    var r=resuelvePersona(t, nm), p=(r.estado==="uno" && _tokPer(r.persona.nombre).join(" ")===_tokPer(nm).join(" "))?r.persona:{id:"ext:"+nm, nombre:nm};
    window.__qdOtro=null; resuelveDudaPersona(t, el.getAttribute("data-qdnuevo"), {id:p.id, nombre:p.nombre}); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-rvx]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); descartaVinculos(t); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-rvinc]"),function(el){
    el.onclick=function(){ var did=el.getAttribute("data-rvinc"), d=tareas.filter(function(x){ return x.id===did; })[0]; if(!d) return;
      if(esCerradaReciente248(d)){ abierta=d.id; vista="hilo"; render(); return; }   /* build 248: una cerrada no se vincula, se abre para verla */
      hojaConfirma({titulo:"Pasar todo a \u201c"+corta40(d.nombre)+"\u201d", sub:"Lo de \u201c"+corta40(t.nombre)+"\u201d se junta all\u00e1.",
        accion:"Vincular", cb:function(){ d.autorizada=true; enlazaTareas(t.id, did, "trabajador (posible duplicado)"); }}); };
  });
  /* build 224: vista supervisor — secciones plegables, aprobar / pedir corrección, texto listo para dictar */
  Array.prototype.forEach.call(document.querySelectorAll("[data-supab]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var k=el.getAttribute("data-supab"); window.__supAb=window.__supAb||{}; window.__supAb[t.id+"|"+k]=!_supAb(t,k,k==="metas"); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-entok]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var tx=apruebaMeta(t, el.getAttribute("data-entok")); if(tx) toast(tx); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-entcor]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var tx=pideCorreccion(t, el.getAttribute("data-entcor")); render(); if(tx) toast(tx); }; });
  if(window.__prefill && window.__prefill.tid===t.id){ var _pf=window.__prefill, _tx=$("txt"); window.__prefill=null; if(_tx){ _tx.value=_pf.tx; try{ _tx.dispatchEvent(new Event("input",{bubbles:true})); _tx.focus(); }catch(e){} } }
  /* build 222: metas — palomear, foto de comprobante, historial; decisión de meta atrasada en un toque */
  Array.prototype.forEach.call(document.querySelectorAll("[data-ddact]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var tx=decideDato(t, el.getAttribute("data-ddid"), el.getAttribute("data-ddact")); if(tx) toast(tx); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-dmact]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var tx=decideMeta(t, el.getAttribute("data-dmid"), el.getAttribute("data-dmact")); if(tx) toast(tx); render(); }; });
  var _bmh=$("bmetahist"); if(_bmh) _bmh.onclick=function(ev){ ev.stopPropagation(); window.__metaHist=window.__metaHist||{}; window.__metaHist[t.id]=!window.__metaHist[t.id]; render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-metaok]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var mid=el.getAttribute("data-metaok"), m=metasDe(t).filter(function(x){ return x.id===mid; })[0]; if(!m) return;
    hojaConfirma({titulo:"¿Se cumplió “"+metaCorta(m)+"”?", sub:m.foto?"Con su foto de comprobante. Se va al historial.":"Sin foto de comprobante. Se va al historial.", accion:"Cumplida", cb:function(){ cumpleMeta(t, mid); render(); }}); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-metafoto]"),function(el){ el.onclick=function(ev){ ev.stopPropagation(); var inp=$("metain"); if(!inp) return; var mid=el.getAttribute("data-metafoto");
    inp.value=""; inp.onchange=function(){ var f=inp.files&&inp.files[0]; if(!f) return; comprime(f, function(data){ if(!data){ toast("No pude leer la foto"); return; } fotoMeta(t, mid, data); toast("Foto guardada en la meta"); render(); }); }; inp.click(); }; });
  var bck=$("bchkl"); if(bck) bck.onclick=function(ev){ ev.stopPropagation(); window.__chkOpen=window.__chkOpen||{}; window.__chkOpen[t.id]=!window.__chkOpen[t.id]; render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-chk]"),function(el){ el.onclick=function(ev){ ev.stopPropagation();
    var it=(t.checklist.items||[]).filter(function(x){ return x.id===el.getAttribute("data-chk"); })[0]; if(!it) return;
    try{ hist240("Palomeó en la lista: "+it.tx, t, {tipo:"palomita", item:it.id, prev:+it.estado||0}); }catch(e){}
    it.estado=((it.estado||0)+1)%3; it.ts=Date.now(); it.fuente="lo tocó "+((PERSONAS[yo]||{}).nombre||""); guarda(t); render(); }; });
  var bps=$("bpasos"); if(bps) bps.onclick=function(ev){ ev.stopPropagation();
    window.__pasosOpen=window.__pasosOpen||{}; window.__pasosOpen[t.id]=!window.__pasosOpen[t.id]; render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-paso]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation();
      var p=(t.lista_pasos||[]).filter(function(x){ return x.id===el.getAttribute("data-paso"); })[0]; if(!p) return;
      marcaPaso(t, p, !p.hecho); guarda(t); render(); };
  });
  var bpa=$("bpadd"); if(bpa) bpa.onclick=function(ev){ ev.stopPropagation();
    window.__pasoAdd=t.id; pliegaPasos(); render();
    setTimeout(function(){ var m=$("tmic"); if(m) m.click(); toast("Dicta el paso nuevo (ej: “el pan y la leche”)"); }, 60); };
  var bya=$("bya"); if(bya) bya.onclick=function(){
    /* Salvador 2026-09-24: "Ya esta" no te saca de la tarea. Si de verdad se
       cerro, sello de palomita, titulo tachado y "Hecha · Deshacer". */
    /* build 264: un expediente (indefinida) no se cierra: queda dormido, enterado */
    if(esExpediente264(t)){
      var _pd=duerme264(t);
      selloYSigue(t,{tipo:"hecha", texto:t.nombre, textoPill:"Enterado · queda viva", restaurar:function(){ restauraDormir264(t,_pd); }});
      return;
    }
    var prev={estado:t.estado, cierre:t.cierre||null, n:(t.msgs||[]).length};
    var _faltanP=pasosFaltan(t);
    var _nv0=(t.vueltas||[]).length;
    intentaCerrar(t);
    if((t.vueltas||[]).length>_nv0){ toast("Vuelta cerrada · sigue el "+diaEntrega(t.f_vigente)); render(); return; }
    /* build 144: se puede cerrar con pasos sin palomear, pero se dice cuales */
    if(t.estado==="cerrada" && _faltanP.length && tienePasos(t)){
      msg(t,"bi","Quedaron sin palomear: "+juntaY(_faltanP.map(pasoChico))+"."); guarda(t); }
    if(t.estado==="cerrada" && t.cierre && t.cierre.tipo==="hecha"){
      selloYSigue(t,{tipo:"hecha", texto:t.nombre, dejarViva:t.id, restaurar:function(){
        t.estado=prev.estado||"abierta"; t.cierre=prev.cierre; if(t.msgs && t.msgs.length>prev.n) t.msgs.length=prev.n;
        guarda(t); sincronizaAvisos(t); }});
    } else render();
  };
  /* bote de basura (Salvador 2026-09-22) */
  var btr=$("btrash"); if(btr) btr.onclick=function(){
    /* build 192: recien nacida (por autorizar / falta info / accidente) se borra sin motivo y queda en el censo */
    var _bsm=""; try{ _bsm=borraSinMotivo(t); }catch(e){}
    if(_bsm){ descartaAlNacer(t,_bsm); return; }
    vista="cerrarmotivo"; render(); };
  /* Salvador 2026-09-25: sin hoja de confirmacion; se borra en el acto y
     sale el cintillo de Deshacer arriba de la barra. */
  var btrr=$("btrashrec"); if(btrr) btrr.onclick=function(){ borraRecordatorioYQuedate(t); };
  /* ===== HOJA DE RECORDATORIOS (relojito) — Salvador 2026-09-18 ===== */
  var brel=$("brel"); if(brel) brel.onclick=function(){ window.__avSheet=(window.__avSheet===t.id?null:t.id); render(); };
  /* build 141: alarma roja — la caja se apaga y solo quedan los dos botones */
  var arm=$("armodal");
  if(arm){
    var _tx=$("txt"); if(_tx){ _tx.setAttribute("contenteditable","false"); try{ _tx.blur(); }catch(e){} }
    arm.onclick=function(ev){ ev.stopPropagation(); };
    var _ad=arm.querySelector("[data-ardel]"), _ap=arm.querySelector("[data-arpos]");
    if(_ad) _ad.onclick=function(ev){ ev.stopPropagation(); var id=_ad.getAttribute("data-ardel");
      var _a=avisosDe(t).filter(function(x){ return x.id===id; })[0];
      if(_a && !_a.self && _a.fecha===hoy() && !t.es_recordatorio && t.f_vigente>hoy()) t.revisar_hoy=hoy();
      window.__avSonando=null; eliminaAvisoDe(t, id); };
    if(_ap) _ap.onclick=function(ev){ ev.stopPropagation(); posponeAvisoDe(t, _ap.getAttribute("data-arpos")); };
  }
  var avsc=$("avscrim"); if(avsc) avsc.onclick=function(){ window.__avSheet=null; render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-avdel]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation(); eliminaAvisoDe(t, el.getAttribute("data-avdel")); };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-avpos]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation(); posponeAvisoDe(t, el.getAttribute("data-avpos")); };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-avedit]"),function(el){
    el.onclick=function(ev){ ev.stopPropagation();
      window.__avSheet=null; window.__avEdit={taskId:t.id, id:el.getAttribute("data-avedit")}; render();
      setTimeout(function(){ var m=$("tmic"); if(m) m.click(); toast("Dicta la nueva fecha u hora (ej: “el lunes a las 8”)"); }, 60); };
  });
  /* + o caja: cierra la hoja y abre el teclado en la barra del hilo, ya en modo
     "agregar recordatorio"; microfono: lo mismo pero dictando de una. */
  function aAgregarAviso(dictar){
    window.__avSheet=null; window.__avAdd=t.id; render();
    setTimeout(function(){
      if(dictar){ var m=$("tmic"); if(m) m.click(); toast("Dicta el recordatorio (ej: “el viernes a las 9”)"); }
      else { var tx=$("txt"); if(tx) tx.focus(); }
    }, 60);
  }
  var avadd=$("avadd"); if(avadd) avadd.onclick=function(ev){ ev.stopPropagation(); aAgregarAviso(false); };
  var avtx=$("avtxt"); if(avtx) avtx.onclick=function(ev){ ev.stopPropagation(); aAgregarAviso(false); };
  var avmc=$("avmic"); if(avmc) avmc.onclick=function(ev){ ev.stopPropagation(); aAgregarAviso(true); };
  var bat=$("batorado"); if(bat) bat.onclick=function(){
    t.pregunta=null; t.pide_atoro=true;
    msg(t,"bi","Va. Para detener el reloj necesito DOS cosas: a quién estás esperando (nombre y teléfono) y qué exactamente. Escríbelo abajo así: Rodrigo Méndez, 6621234567, el presupuesto del alumbrado.");
    msg(t,"bi","Y te aviso desde ahora: el reloj se para, pero el toque no. Mañana te aparece la tarea de volverle a hablar. Si no la haces, los días vuelven a contar como tuyos. La fecha final no se mueve.");
    guarda(t);
  };
  var bmn=$("bmenu"); if(bmn) bmn.onclick=function(){ menuOpen=!menuOpen; window.__undoAsk278=null; render() };
  try{ bindUndo278(t); }catch(e){ console.warn("undo278", e); }
  Array.prototype.forEach.call(document.querySelectorAll("[data-mn]"),function(el){
    el.onclick=function(){
      var k=el.getAttribute("data-mn");
      menuOpen=false;
      if(k==="renombrar"){
        /* build 159: el teclado sale al instante (iOS solo lo abre si el foco ocurre
           dentro del toque): input temporal enfocado ya, luego se pasa al real, vacio. */
        var tmpk=document.createElement("input");
        tmpk.style.cssText="position:fixed;top:0;left:0;opacity:0;height:1px;width:1px;font-size:16px";
        document.body.appendChild(tmpk); tmpk.focus();
        editaNombre=t.id; render();
        var pasaFoco=function(){ var i=$("enom"); if(i){ i.value=""; i.focus(); } if(tmpk.parentNode) tmpk.parentNode.removeChild(tmpk); };
        pasaFoco(); setTimeout(pasaFoco,40);
        return;
      }
      if(k==="cerrar"){ render(); return }
      if(k==="encargar"){ vista="encargar"; render(); return }
      if(k==="fecha"){ t.pide_fecha=true;
        msg(t,"bi","¿Para cuándo la muevo? Dime por ejemplo: el viernes, en 15 días o a fin de mes.");
        guarda(t); render(); return }
      if(k==="enlazar"){ render(); abreEnlazar(t.id); return }
      if(k==="nose"){ vista="cerrarmotivo"; render(); return }
      if(k==="pasar"){ vista="transferir"; render(); return }
    };
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-jr]"),function(el){
    el.onclick=function(){jefeResponde(t,el.getAttribute("data-jr"))};
  });
  var bcz=$("bcerrar");
  if(bcz) bcz.onclick=function(){
    var faltan=faltanParaCerrar(t);
    if(faltan.length){ msg(t,"bi","Todavía no la puedo cerrar: "+faltan.join(" y ")+". Eso fue lo que se escribió cuando nació la tarea."); guarda(t); return }
    cierraHecha(t);
  };

  try{ bindDeslizar(t); }catch(e){ console.warn("deslizar",e); }
  var _cp=$("cnlpill"); if(_cp) _cp.onclick=function(ev){ if(ev) ev.stopPropagation(); abreFiltro227(t); };   /* build 227: una sola pastilla */
  var _t227=$("tit227"); if(_t227) _t227.onclick=function(){ window.__tit227=window.__tit227||{}; window.__tit227[t.id]=!window.__tit227[t.id]; render(); };
  var _ar=$("autrev"); if(_ar) _ar.onclick=function(){ if(!autorizaRevision(t)) render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-fedit]"),function(b){ b.onclick=function(){ var tx=$("txt"); if(!tx) return;   /* build 209: tocar un campo = corregirlo dictando */
    var k=b.getAttribute("data-fedit"), et={nombre:"El nombre es",tipo:"Es",contexto:"El contexto es",fecha:"La fecha es",ritmo:"El ritmo es",quien:"La hace",etiquetas:"Las etiquetas son",vinculo:"El vínculo es con",de:"Es de",cifras:"Las cifras son"}[k]||"";
    var val=(b.querySelector(".ffv")||{}).textContent||""; if(val==="—") val="";
    tx.value=et+": "+val.replace(/ \(no vinculado\)$/,""); try{ tx.focus(); tx.setSelectionRange(et.length+2, tx.value.length); }catch(e){} }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-tipoi]"),function(b){ b.onclick=function(){ var k=b.getAttribute("data-tipoi");
    if(k==="vincular"){ abreEnlazar(t.id, {similares:similares229(t).map(function(d){ return d.id; }), tareaNueva:function(){ t.tipo_item="tarea"; t.es_dato=false; t.tipo_elegido=true; guarda(t); if(!revisaCompleta(t)) render(); }}); return; }
    try{ hist240("Tocó “"+(k==="dato"?"Dato":"Tarea")+"”", t, {tipo:"tipo", prev:t.tipo_item||"", elegido:!!t.tipo_elegido}); }catch(e){}
    t.tipo_item=k; t.es_dato=(k==="dato"); t.tipo_elegido=true; guarda(t); if(!revisaCompleta(t)) render(); }; });   /* build 195; 237: tipo_elegido */
  Array.prototype.forEach.call(document.querySelectorAll("[data-agenda]"),function(b){ b.onclick=function(){ if(b.getAttribute("data-agenda")==="si"){ var _ev=eventoDe(t); agendaEvento(t, "", !(_ev&&_ev.hora)); } else noAgendar(t); }; });   /* build 202/203; 229: sin hora = todo el dia (lo que propone la franja) */
  Array.prototype.forEach.call(document.querySelectorAll("[data-agmenu]"),function(b){ b.onclick=function(ev){ ev.stopPropagation(); menuAgenda229(t, b); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-evid]"),function(b){ b.onclick=function(ev){ ev.stopPropagation(); abreEvidencia(t); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-agtododia]"),function(b){ b.onclick=function(){ window.__agTodoDia=window.__agTodoDia||{}; window.__agTodoDia[t.id]=window.__agTodoDia[t.id]?0:1; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-agcambia]"),function(b){ b.onclick=function(){ window.__agEdit=window.__agEdit||{}; window.__agEdit[t.id]=1; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-agguarda]"),function(b){ b.onclick=function(){ var f=$("agf"), h=$("agh"); if(guardaFechaEvento(t, f&&f.value, h&&h.value)) render(); }; });
  var _d254=$("tdest254"); if(_d254) _d254.onclick=function(ev){ if(ev) ev.stopPropagation(); abreDestino254(t); };
  var _ccl=$("cnlclaude"); if(_ccl) _ccl.onclick=function(){ window.__cnlClaude=window.__cnlClaude||{}; window.__cnlClaude[t.id]=window.__cnlClaude[t.id]?0:1; render(); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-progc]"),function(b){ b.onclick=function(){ var mx=(t.msgs||[])[+b.getAttribute("data-progc")]; if(!mx||!mx.prog) return;
    hojaConfirma({titulo:"Mensaje programado a "+mx.prog.contacto, sub:"“"+_corto(mx.prog.texto)+"”", accion:"Cancelar el mensaje", rojo:true, cb:function(){ cancelaProgramado(t, mx); }}); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-cmodo]"),function(b){ b.onclick=function(){ window.__chatModo=window.__chatModo||{}; window.__chatModo[t.id]=b.getAttribute("data-cmodo"); render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-sisexp]"),function(b){ b.onclick=function(){ window.__sisExp=window.__sisExp||{}; window.__sisExp[t.id]=1; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll("[data-ncexp]"),function(b){ b.onclick=function(){ window.__ncExp=window.__ncExp||{}; window.__ncExp[t.id]=1; render(); }; });
  var _ib=$("intbtn"); if(_ib) _ib.onclick=function(){ abreIntegrantes(t); };
  Array.prototype.forEach.call(document.querySelectorAll("[data-ptab]"),function(b){ b.onclick=function(ev){ ev.stopPropagation(); window.__ptAb=window.__ptAb||{}; window.__ptAb[t.id]=b.getAttribute("data-ptab")==="1"; render(); }; });
  Array.prototype.forEach.call(document.querySelectorAll(".ptcard"),function(c){ c.addEventListener("click",function(ev){   /* build 247: tocar la tarjeta (o un Dato:) = su menú */
    if(ev.target.closest("button,a,input,[data-irmsg]") || (window.__leeLP && Date.now()-window.__leeLP<700)) return;
    var e2=ev.target.closest("[data-pt247]"), n=e2?+e2.getAttribute("data-pt247"):NaN; abreMenuPregunta247(t, isNaN(n)?undefined:n); }); });
  Array.prototype.forEach.call(document.querySelectorAll(".ptcard [data-irmsg]"),function(q){ q.onclick=function(ev){ ev.stopPropagation();
    window.__cnl=window.__cnl||{}; if(window.__cnl[t.id]!=="todo"){ window.__cnl[t.id]="todo"; render(); }
    var o=document.querySelector('.msgs [data-mix="'+q.getAttribute("data-irmsg")+'"]'); if(o){ o.scrollIntoView({behavior:"smooth",block:"center"}); o.classList.add("flash"); setTimeout(function(){ o.classList.remove("flash"); },1200); } }; });
  if(window.__propInt && window.__propInt.tid===t.id){ var _pp=window.__propInt; window.__propInt=null; setTimeout(function(){ abrePropuestaIntegrantes(t,_pp.prop); },60); }
  Array.prototype.forEach.call(document.querySelectorAll("[data-avexp]"),function(b){ b.onclick=function(){ window.__avExp=window.__avExp||{}; window.__avExp[t.id]=1; render(); }; });
  var tc=$("tcam"); if(tc) tc.onclick=function(){
    pideFoto(function(data,meta){
      t.evidencias=t.evidencias||[];
      var ev2={data:data,lat:meta&&meta.lat,lon:meta&&meta.lon,ts:Date.now()};
      t.evidencias.push(ev2);
      /* build 186: ya no se escribe "Foto guardada": la foto misma aparece en el chat */
      t.ultima=PERSONAS[yo].nombre+": mandó una foto"; guarda(t);
      leeFoto(t, ev2);
    });
  };
  function enviaHilo(){
    /* build 141: con la alarma roja abierta no se escribe ni se dicta */
    if(alarmaRoja(t)){ toast("Primero: Eliminar alarma o Posponer 1 hora"); render(); return; }
    var v=limpiaHoraDictada($("txt").value.trim()); if(!v)return;
    if(!window.__ctxPasa) registraDictado(t, v);   /* lo dicho se guarda ANTES de interpretarlo: nunca se pierde */
    /* build 255: con el bloque de preguntas abierto, lo dictado o escrito las contesta TODAS (un solo paso) */
    if(window.__preg255===t.id && document.getElementById("preg249")){ $("txt").value=""; marcaEnvio("tenv","");
      if(!preguntas249(t).length){ cierraPreg255(); completaRevision(t, sinPrefijoClaude(v), {sinRevision:tipoRevisar(t)!=="falta"}); return; }   /* build 273: el cuestionario de lo que falta */
      enviaRespuestas255(t.id, v); return; }
    /* build 249 (Salvador 07:58): en la vista de revisión (nueva, incompleta o con preguntas) TODO lo dictado o escrito es indicación para el
       cerebro del 238 (si pide un mensaje, el cerebro lo arma; nunca sale tal cual al WhatsApp). Solo siguen su camino "es dato/es tarea",
       "autorízala así" y la corrección del borrador de un mensaje que ya está en curso. */
    if(enRevision249(t) && !window.__msjEdit && !t.pide_msj && !(tipoRevisar(t)==="falta" && vincDicho236(v)!==null) && !(tipoDicho(v) && String(v).split(/\s+/).filter(Boolean).length<=6) && !/^\s*(autor[ií]za(la|lo)?|aut[oó]rizal[ao])\s+(as[ií]|como\s+est[aá])\b/i.test(v)){
      $("txt").value=""; marcaEnvio("tenv","");
      var _tp249=tipoDicho(v); if(_tp249 && tipoRevisar(t)==="falta"){ t.tipo_item=_tp249; t.es_dato=(_tp249==="dato"); t.tipo_elegido=true; }
      completaRevision(t, sinPrefijoClaude(v), {sinRevision:tipoRevisar(t)!=="falta"}); return; }
    /* build 188 (Salvador 08:39): lo que le dices a Claude (correcciones, aclaraciones) nunca sale por WhatsApp */
    /* build 194: "abre / busca / el costo de X" dentro de una tarea (aunque empiece con "Claude") = busqueda en todas */
    var _qT=pideBuscar(v); if(_qT){ $("txt").value=""; marcaEnvio("tenv",""); marcaDictado(t, "consulta"); abreBusqueda(_qT, v, buscaTodo(_qT)); return; }
    /* build 225: mensaje en curso (lo que faltaba decirle, o el cambio al borrador) y "ponle un mensaje a X para…" */
    /* build 225: "me mezclaste / esto es de otra tarea / esto es de <tarea>" -> se mueven los mensajes; NUNCA se tocan metas ni lista */
    /* build 236: en una tarea por clasificar, "vincúlala a X" hace lo mismo que el botón Vincular (la hoja, con X ya buscado) */
    var _vin236=tipoRevisar(t)==="falta"?vincDicho236(v):null;
    if(_vin236!==null){ $("txt").value=""; marcaEnvio("tenv",""); abreEnlazar(t.id, {similares:similares229(t).map(function(d){ return d.id; }), q:_vin236, tareaNueva:function(){ t.tipo_item="tarea"; t.es_dato=false; t.tipo_elegido=true; guarda(t); if(!revisaCompleta(t)) render(); }}); return; }
    if(mezclaDicho(v, t)){ $("txt").value=""; marcaEnvio("tenv",""); var _am=arreglaMezcla(t, v); render(); if(_am.movidos) toast("Moví "+_am.movidos+" mensaje"+(_am.movidos===1?"":"s")); else if(_am.pregunta!=null) abreMover225(t, _am.pregunta); return; }
    if(msjEnCurso(t, v)){ $("txt").value=""; marcaEnvio("tenv",""); return; }
    var _md225=mensajeDicho(v), _pg225=null; if(_md225){ try{ _pg225=programaWA(v); }catch(e){} }
    if(_md225 && !(_pg225 && (_pg225.a_las || _pg225.sino_desde))){ $("txt").value=""; marcaEnvio("tenv",""); pideMensaje(t, v, _md225); return; }
    /* build 214: "ya invité a X" / "X confirmó" / "agrega a Y" -> la lista; "hazme un checklist…" sin lista -> Claude la arma */
    var _ck=checklistDicho(t, v);
    if(_ck){ $("txt").value=""; marcaEnvio("tenv","");
      if(_ck.crear){ notaClaude(t, v); return; }
      msg(t,"bo",v); var _mc=t.msgs[t.msgs.length-1]; _mc.de=yo; _mc.canal="priv:"+yo; _mc.nota_claude=1;
      msg(t,"bi",respChecklist(t,_ck)); var _rc=t.msgs[t.msgs.length-1]; _rc.canal="priv:"+yo; _rc.nota_claude=1;
      window.__chkOpen=window.__chkOpen||{}; window.__chkOpen[t.id]=true; guarda(t); render(); return; }
    /* build 282 (F36): "recuérdame el martes de X y Y" = aviso ese día + pasos, sin IA y sin tocar el finiquito */
    var _rl282=recuerdaLista282(v);
    if(_rl282){ $("txt").value=""; marcaEnvio("tenv",""); aplicaRecuerdaLista282(t, v, _rl282); return; }
    /* build 205 (Salvador 21:14, "Agendar Reunión Consejo Colonia Cumbres"): en "Falta info" lo dictado COMPLETA la tarea
       aunque suene a nota para Claude ("…es para que sepas el contexto" caia en esNotaClaude -> notaClaude -> "No cambié nada").
       Solo las ordenes claras (eliminar, pasarla, encargarla) siguen yendo a Claude. */
    var _corto205=String(v).split(/\s+/).filter(Boolean).length<=6;   /* "es dato" / "es tarea" solos siguen su camino de abajo */
    if(tipoRevisar(t)==="falta" && !ordenClaraClaude(v) && (tipoItem(t)==="dato" || (!detectaLista(v) && listaNumerada(v).length<2)) && !(tipoDicho(v) && _corto205) &&
       !/^\s*(autor[ií]za(la|lo)?|aut[oó]rizal[ao])\s+(as[ií]|como\s+est[aá])\b/i.test(v)){
      $("txt").value=""; marcaEnvio("tenv","");
      var _tp205=tipoDicho(v); if(_tp205){ t.tipo_item=_tp205; t.es_dato=(_tp205==="dato"); t.tipo_elegido=true; }   /* "Esto es una tarea en contexto…" tambien fija el tipo */
      completaRevision(t, sinPrefijoClaude(v)); return; }
    /* build 238: en CUALQUIER estado, un dictado largo con órdenes va al mismo cerebro (datos + órdenes) */
    /* build 283 (caso Comedor 7-oct 21:30): si el cuadro dice «Indicación para Claude…» (destino 254 en Claude), lo que suena a mensaje programado
       («dile que mañana…» sin decir a quién, «mándale esto», cualquier orden) va a Claude ANTES de programaWA: nunca «¿A quién se lo mando? No programé
       nada.» ni una nota suelta que nadie aplica. Siguen en el teléfono, como siempre: los modos abiertos a mano (agregar/reprogramar aviso, paso,
       contexto, ¿am o pm?) y las órdenes que el teléfono ya resuelve completas: «dile a <nombre> mañana a las 9 que…», renombrar, «es de X»,
       mover la fecha, «recuérdame / avísame…» y la entrevista. */
    if(waDest254(t) && !modoWA254(t)){
      var _ui283=window.__avAdd===t.id || (window.__avEdit && window.__avEdit.taskId===t.id) || window.__pasoAdd===t.id || (fichaOpen && !window.__ctxPasa) || !!(t.pide_ampm && (Date.now()-t.pide_ampm.ts)<3600000);
      var _loc283=false; try{ var _pg283=programaWA(v); _loc283=!!(_pg283 && !_pg283.duda && _pg283.texto!=="__ESTO__") || !!detectaRenombre(v) || !!(t.duenio===yo && duenioDicho(v)) || !!(!t.cierre && esMovida(v)) ||
        /^\s*(recu[eé]rdame|av[ií]same)\b/i.test(v) || !!pideEntrevista(v); }catch(e){}
      if(!_ui283 && !_loc283){ $("txt").value=""; marcaEnvio("tenv",""); aClaude254(t, v); return; } }
    var _pg238=null; try{ _pg238=programaWA(v); }catch(e){}
    if(tipoRevisar(t)!=="falta" && !_pg238 && ordenesDichas238(v)){ $("txt").value=""; marcaEnvio("tenv",""); completaRevision(t, sinPrefijoClaude(v), {sinRevision:true}); return; }
    if(typeof esNotaClaude==="function" && esNotaClaude(v)){ $("txt").value=""; marcaEnvio("tenv",""); notaClaude(t, v); return; }
    /* build 193: con el canal naranja "Claude" puesto, todo lo dictado es indicacion para Claude */
    if(modoClaude(t)){ $("txt").value=""; marcaEnvio("tenv",""); notaClaude(t, v); return; }
    /* build 199: "dile a Josué el lunes a las 9 que…" / "…y si no contesta, insístele a las 5" = WhatsApp programado */
    var _pgH=null; try{ if(!esNotaClaude(v)) _pgH=programaWA(v); }catch(e){}
    if(_pgH){ $("txt").value=""; marcaEnvio("tenv","");
      if(_pgH.texto==="__ESTO__"){ var _ct=(window.__cita&&window.__cita.tid===t.id&&window.__cita.t)||((t.msgs||[]).filter(function(x){ return x && x.k==="bo" && (!x.de||x.de===yo) && !x.nota_claude; }).slice(-1)[0]||{}).t||""; if(_ct) _pgH.texto=_ct; else _pgH.duda="¿Qué le mando a "+_pgH.contacto+"?"; }
      msg(t,"bo",v); t.msgs[t.msgs.length-1].de=yo;
      if(_pgH.duda){ msg(t,"bi",_pgH.duda+" No programé nada."); guarda(t); render(); return; }
      if(revisaPG263(t,_pgH)) return;   /* build 263: el contacto tiene que ser alguien de la agenda o de la tarea */
      _pgH.contacto=contactoDeTarea(t,_pgH.contacto); mandaProgramado(t,_pgH,null); render(); return; }
    /* build 195: en un DATO, "¿de dónde sacaste esto?" abre el ▾ con la foto o el texto de origen */
    if(esDato(t) && /\bde\s+d[oó]nde\s+(lo\s+|la\s+|los\s+)?(sacaste|sali[oó]|salieron|viene|vienen|tomaste)\b/i.test(v)){ $("txt").value=""; marcaEnvio("tenv",""); fichaOpen=true; render(); return; }
    /* build 195: lo nuevo/incompleto ("Falta info") se llena dictando, ANTES de cualquier canal:
       nunca se le manda por WhatsApp a quien lo origino. "es dato"/"es tarea" cambia el tipo;
       "autorízala así" la autoriza y deja lo que falte pendiente. */
    if(tipoRevisar(t)==="falta"){
      var _tpv=tipoDicho(v);
      if(_tpv){ $("txt").value=""; marcaEnvio("tenv",""); t.tipo_item=_tpv; t.tipo_elegido=true; if(_tpv==="dato") t.es_dato=true; else t.es_dato=false; guarda(t); revisaCompleta(t); render(); return; }
      if(/^\s*(autor[ií]za(la|lo)?|aut[oó]rizal[ao])\s+(as[ií]|como\s+est[aá])\b/i.test(v)){ $("txt").value=""; marcaEnvio("tenv","");
        t.autorizada=true; t.autorizada_ts=Date.now(); t.autorizada_asi=true;
        t.pendiente_aut=completitud(t).items.filter(function(x){ return !x.ok; }).map(function(x){ return x.k; });
        guarda(t); selloYSigue(t,{tipo:"autorizada", texto:t.nombre, restaurar:null, sinDeshacer:true}); return; }
      if(!detectaLista(v) && listaNumerada(v).length<2){ $("txt").value=""; marcaEnvio("tenv",""); completaRevision(t, v); return; }
    }
    /* build 195: con el ▾ abierto, lo dictado es primero indicacion para el CONTEXTO; si Claude ve
       que claramente es un mensaje, sigue el camino normal */
    if(fichaOpen && !window.__ctxPasa){
      $("txt").value=""; marcaEnvio("tenv","");
      var _vC2=v;
      agregaContexto(t, _vC2, function(){ fichaOpen=false; window.__ctxPasa=true; render(); try{ $("txt").value=_vC2; enviaHilo(); }finally{ window.__ctxPasa=false; } });
      return;
    }
    /* build 146: renombrar la tarea por voz o escrito, sin confirmar aparte */
    var _rn146=detectaRenombre(v);
    if(_rn146){
      $("txt").value=""; marcaEnvio("tenv","");
      var _viejo146=t.nombre;
      t.nombre=conMayuscula(_rn146);
      msg(t,"bi","Cambié el nombre: “"+_viejo146+"” → “"+t.nombre+"”.");
      guarda(t); render(); return;
    }
    /* build 173: "no es mia, es de Samuel" -> se la pasa y la autoriza */
    if(t.duenio===yo && duenioDicho(v)){
      $("txt").value=""; marcaEnvio("tenv","");
      msg(t,"bo",v); reasignaDicho(t, v, true);
      selloYSigue(t,{tipo:"autorizada", texto:t.nombre, restaurar:null}); return;
    }
    /* build 176: si deslizo un mensaje, la respuesta lleva esa cita */
    var _cita=(window.__cita && window.__cita.tid===t.id)?window.__cita:null; window.__cita=null;
    if(_cita){ var _rb=document.getElementById("rqbar"); if(_rb) _rb.parentNode.removeChild(_rb); }
    /* build 182: entrevista del supervisor */
    if(pideEntrevista(v) && t.duenio!==yo){ $("txt").value=""; marcaEnvio("tenv",""); if(soySupervisor(t)||true){ t.revisores=t.revisores||[]; if(t.revisores.indexOf(yo)<0) t.revisores.push(yo); } iniciaEntrevista(t,yo); window.__cnl=window.__cnl||{}; window.__cnl[t.id]="sup"; render(); return; }
    if(entrevistaPendiente(t) && (canalActual(t).id==="sup" || canalActual(t).id==="todo")){ $("txt").value=""; marcaEnvio("tenv",""); contestaEntrevista(t,v); return; }
    if(t.medida && t.medida.espera_dueno && t.duenio===yo){ var _vD2=v; setTimeout(function(){ try{ respuestaDueno(t,_vD2); }catch(e){} },500); }
    /* build 179: "agrega a X" / "quita a X de esta tarea" / organigrama */
    if(integranteDicho(t, v)){ $("txt").value=""; marcaEnvio("tenv",""); return; }
    if(organigramaDicho(v)){ $("txt").value=""; marcaEnvio("tenv",""); aplicaOrganigrama(v); return; }
    var _p179=null; try{ _p179=preguntaParaMi(t); }catch(e){}
    if(_p179){ var _v179=v; setTimeout(function(){ try{ revisaMiRespuesta(t,_v179,_p179); }catch(e){} }, 900); }
    if(canalActual(t).id==="sup"){
      $("txt").value=""; marcaEnvio("tenv","");
      msg(t,"bo",v); var _ms=t.msgs[t.msgs.length-1]; _ms.canal="sup"; _ms.de=yo; guarda(t); render(); return;
    }
    /* build 178: DONDE ESTAS = A QUIEN LE LLEGA. Ordenes a Doit (recuerdame, ponle nombre,
       dile a, lista...) nunca se le mandan a un externo: se procesan como siempre. */
    var _cnA=canalActual(t), _esOrden=(aQuienRespondo(t,v,{tid:t.id,wa:"x"})==="" || /^\s*(recu[eé]rda(me|le)|av[ií]sa(me|le)|apunta|anota|agrega|p[oó]n(me|le)|c[aá]mbia(le)?|dile|m[aá]nda(le|me)|preg[uú]nta(le)?|abre|busca|cierra|borra|elimina|crea|hazme)\b/i.test(v));
    if(_cnA.ext && !_esOrden){
      var _dest=_cnA.nom, _vE=v;
      if(!modoWA254(t)){ aClaude254(t, _vE); return; }   /* build 254: lo de abajo es para Claude; WhatsApp directo solo con el selector */
      salidaWA254(t, _dest, _vE, _cita); return;
    }
    /* build 193 (F38): alguien del equipo con WhatsApp en la tarea (Samuel): sale a su WhatsApp */
    if(_cnA.id.indexOf("dm:")===0 && _cnA.wa && !_esOrden){
      var _dW=_cnA.wa, _vW=v, _cW=_cnA.id;
      if(!modoWA254(t)){ aClaude254(t, _vW); return; }
      salidaWA254(t, _dW, _vW, _cita, _cW); return;
    }
    if(_cnA.id.indexOf("dm:")===0 && !_esOrden){
      $("txt").value=""; marcaEnvio("tenv","");
      mandaDM(t, _cnA.id.slice(3), v); if(_cita){ var _vD=v; setTimeout(function(){ pegaCita(t,_vD,_cita); },0); } return;
    }
    var _exN=(!_esOrden)?externoNombrado(t, v):null;
    if(_exN){
      var _vN=v;
      if(!modoWA254(t)){ aClaude254(t, _vN); return; }   /* build 254: por defecto, para Claude */
      $("txt").value=""; marcaEnvio("tenv","");
      preguntaExterno(_exN, _vN, function(){ salidaWA254(t, _exN, _vN, _cita); },
        hayEquipo(t)?function(){ mandaAlEquipo(t, _vN, _cita); }:null,
        function(){ notaClaude(t, _vN); }, function(){ notaParaMi(t, _vN); });
      return;
    }
    /* build 188: si le estas contestando a lo ultimo que te mando un externo, sale directo a el (con 30 s para deshacer) */
    var _aq188=(!_esOrden && !_cita && _cnA.id==="todo")?aQuienRespondo(t,v,null):"";
    if(_aq188 && externosDe(t).some(function(n){ return _nn(n)===_nn(_aq188); })){
      var _vA=v, _dA=externosDe(t).filter(function(n){ return _nn(n)===_nn(_aq188); })[0];
      if(!modoWA254(t)){ aClaude254(t, _vA); return; }
      salidaWA254(t, _dA, _vA, null); return;
    }
    var _rx186=(!_esOrden && !_cita && _cnA.id==="todo")?responsableExt(t):null;
    if(_rx186){
      var _vR=v;
      if(!modoWA254(t)){ aClaude254(t, _vR); return; }
      $("txt").value=""; marcaEnvio("tenv","");
      preguntaExterno(_rx186, _vR, function(){ salidaWA254(t, _rx186, _vR, null); },
        hayEquipo(t)?function(){ mandaAlEquipo(t, _vR, null); }:null,
        function(){ notaClaude(t, _vR); }, function(){ notaParaMi(t, _vR); });
      return;
    }
    if(_cita){ var _vC=v; setTimeout(function(){ pegaCita(t, _vC, _cita); }, 0); }
    /* build 168: si la tarea esta en "Falta informacion", lo que contesta llena los datos */
    if(tipoRevisar(t)==="falta" && !detectaLista(v) && listaNumerada(v).length<2){
      $("txt").value=""; marcaEnvio("tenv","");
      completaRevision(t, v); return;
    }
    /* build 141: contesta "¿5 de la mañana o de la tarde?" */
    if(t.pide_ampm && (Date.now()-t.pide_ampm.ts)<60*60*1000 && respuestaAmPm(v) && !(esMovida(v) && !soloFecha(v))){
      $("txt").value=""; marcaEnvio("tenv","");
      var _nh=aplicaAmPm(t, respuestaAmPm(v));
      msg(t,"bo",v); msg(t,"bi","Listo, a las "+horaBonita(_nh)+".");
      guarda(t); sincronizaAvisos(t); render(); return;
    }
    /* AGREGAR RECORDATORIO: lo dictado no es comentario, es un aviso nuevo para
       ESTA tarea. Se arma su fecha/hora con la hora inteligente y se inserta. */
    if(window.__avAdd===t.id){
      window.__avAdd=null; $("txt").value=""; marcaEnvio("tenv","");
      if(dudaFecha(v)){ msg(t,"bo",v); msg(t,"bi",dudaFecha(v)+" No puse nada; dímelo otra vez con la fecha."); guarda(t); render(); return; }
      var rr=armaCuando(v);
      var av=nuevoAviso(t, {texto:sinHoraEnTitulo(asuntoRecordatorio(v,t)), dicho:v, fecha:rr.fecha, hora:rr.hora, cada:rr.cada});
      preguntaAmPm(t, [String(av.ts)], v);
      guarda(t); sincronizaAvisos(t);
      toast("Recordatorio agregado: "+(textoCuando(av)||"sin hora")); render(); return;
    }
    /* REPROGRAMAR un aviso existente: lo dictado es la nueva fecha/hora */
    if(window.__avEdit && window.__avEdit.taskId===t.id){
      var ed=window.__avEdit; window.__avEdit=null; $("txt").value=""; marcaEnvio("tenv","");
      if(dudaFecha(v)){ msg(t,"bo",v); msg(t,"bi",dudaFecha(v)+" No puse nada; dímelo otra vez con la fecha."); guarda(t); render(); return; }
      var nc=armaCuando(v);
      if(ed.id==="self" && t.es_recordatorio){ t.f_vigente=nc.fecha; t.aviso_hora=nc.hora; if(nc.cada) t.aviso_cada=nc.cada; }
      else { var a=(t.avisos||[]).filter(function(x){return String(x.ts)===String(ed.id)})[0];
             if(a){ a.fecha=nc.fecha; a.hora=nc.hora; a.cada=normalizaCada(nc.cada); a.avisado_en=null; } }
      if(ed.id==="self" && nc.cada) t.aviso_cada=normalizaCada(nc.cada);
      window.__avSonando=null; guarda(t); sincronizaAvisos(t);
      toast("Reprogramado: "+fechaBonita(nc.fecha)+(nc.hora?" a las "+horaBonita(nc.hora):"")); render(); return;
    }
    /* build 144: PASOS POR VOZ. "+ Dicta otro paso" o "agrega pan y leche"
       suma pasos; "ya compre la carne" / "ya quedo el acomodo" los palomea y
       Claude contesta corto. Si no pega con ningun paso, sigue como siempre. */
    if(window.__pasoAdd===t.id || (tienePasos(t) && !t.cierre && /^\s*(agr[eé]ga(le|me)?|a[nñ]ade(le)?|s[uú]male)\b/i.test(v))
       || (!t.cierre && listaNumerada(v).length>=2)){   /* build 166: "numero uno..., numero dos..." dentro de la tarea */
      var _adding=window.__pasoAdd===t.id; window.__pasoAdd=null;
      var _nv=agregaPasos(t, v);
      if(_nv.length || _adding){
        $("txt").value=""; marcaEnvio("tenv","");
        msg(t,"bo",v);
        msg(t,"bi", _nv.length ? (_nv.length<=3 ? "Agregué "+juntaY(_nv.map(function(p){ return "“"+p.tx+"”"; }))+"." : "Agregué "+_nv.length+" puntos a la lista.") : "Ese paso ya estaba en la lista.");
        if(_nv.length){ window.__pasosOpen=window.__pasosOpen||{}; window.__pasosOpen[t.id]=true; }
        guarda(t); render(); return;
      }
    }
    if(tienePasos(t) && !t.cierre){
      var _pal=palomeaPorTexto(t, v);
      if(_pal.length){
        $("txt").value=""; marcaEnvio("tenv","");
        msg(t,"bo",v); msg(t,"bi",respuestaPalomeo(t,_pal));
        t.ultima=PERSONAS[yo].nombre+": "+v;
        guarda(t); render(); return;
      }
    }
    /* build 140: MOVER LA FECHA hablando, o el motivo de la ultima movida:
       directo a mandar(), sin tarjeta de duda y sin pasar por el jefe. */
    if(!t.cierre && (esMovida(v) || (t.espera_motivo && !sonaraRecordatorio(v) && !sonaraWhatsApp(v)))){
      $("txt").value=""; marcaEnvio("tenv",""); mandar(t,v); render(); return;
    }
    /* RECORDATORIO PARA ESTA TAREA (Salvador 2026-09-22): palabra de recordatorio
       u hora dicha = aviso de ESTA tarea, armado directo, sin preguntar. No aplica
       si esta contestando una pregunta del bot (atorado / fecha / toque). */
    if(!(PERSONAS[yo].jefe && t.estado==="espera") && !t.pide_atoro && !t.pide_fecha && !t.espera_toque && sonaraRecordatorio(v) && !(sonaraAcuerdo(v) && !palabraRecordatorio(v))){
      $("txt").value=""; marcaEnvio("tenv","");
      /* build 140 RITMO: "recuerdame el lunes y el miercoles" = un aviso de ESTA
         tarea por cada dia dicho, a la hora dicha o a las 9:00. */
      if(dudaFecha(v)){ msg(t,"bo",v); msg(t,"bi",dudaFecha(v)+" No puse nada; dímelo otra vez con la fecha."); guarda(t); render(); return; }
      var _dias=cadaDicho(v)?[]:diasDichos(v);
      if(_dias.length>1){
        var _hr=horaDicha(v)?horaValor(v):"", _as=sinHoraEnTitulo(asuntoRecordatorio(v,t)), _avs=[];
        if(/^((el|la|los|las|y|e|de|para|a|,)\s*)+$/i.test(_as+" ")) _as=t.nombre||"Recordatorio";
        _dias.forEach(function(f){ var _ya=avisoMismoDia(t, f);   /* build 210: no duplicar el del mismo dia */
          if(_ya){ if(!_ya.hora) _ya.hora=(_hr?horaCercana(f,_hr,v):"09:00"); _avs.push(_ya); return; }
          _avs.push(nuevoAviso(t, {texto:_as, dicho:v, fecha:f, hora:(_hr?horaCercana(f,_hr,v):"09:00")})); });
        msg(t,"bo",v);
        msg(t,"bi","Anotado. Te aviso "+_avs.map(textoCuando).join(" y ")+": "+_avs[0].texto+".");
        preguntaAmPm(t, _avs.map(function(a){ return String(a.ts); }), v);
        guarda(t); sincronizaAvisos(t); render(); return;
      }
      var rr2=armaCuando(v);
      var av2=nuevoAviso(t, {texto:sinHoraEnTitulo(asuntoRecordatorio(v,t)), dicho:v, fecha:rr2.fecha, hora:rr2.hora, cada:rr2.cada});
      msg(t,"bo",v);
      msg(t,"bi","Anotado. Te aviso "+(textoCuando(av2)||"en la siguiente franja")+": "+av2.texto+".");
      preguntaAmPm(t, [String(av2.ts)], v);
      guarda(t); sincronizaAvisos(t); render(); return;
    }
    /* si estamos en una tarea y lo dictado NO suena a comentario de ella,
       preguntar antes en vez de encajarlo como comentario (Salvador 2026-09-16) */
    /* build 136: WhatsApp a alguien de fuera dicho desde el hilo: la tarea es
       ESTA. Se manda a Claude con la marca y el confirmar sale en la barra. */
    if(!(PERSONAS[yo].jefe && t.estado==="espera") && sonaraWhatsApp(v)){
      $("txt").value=""; marcaEnvio("tenv","");
      _notaPriv(t,"bo",v); guarda(t);   /* build 225: lo dictado SIEMPRE queda en la tarea, aunque lo procese la barra */
      window.__waDesde={id:t.id, ts:Date.now()}; abierta=null; barraEnviar(v); return;
    }
    /* build 143: ACUERDO ("quedamos de...", "me va a mandar..."), en tarea
       abierta O CERRADA: nace una tarea nueva; la de origen solo recibe el
       comentario y la linea "Listo". PRECEDENCIA (lo de arriba gana): am/pm,
       agregar/reprogramar aviso, mover fecha y motivo de la movida, recordatorio
       (con palabra; una hora sola dentro de un acuerdo NO lo gana), WhatsApp.
       Despues: la duda "comentario o nuevo" y el comentario normal. */
    if(!(PERSONAS[yo].jefe && t.estado==="espera") && sonaraAcuerdo(v)){
      $("txt").value=""; marcaEnvio("tenv",""); acuerdoEnHilo(t,v); return;
    }
    if(!(PERSONAS[yo].jefe && t.estado==="espera") && sonaraNoComentario(v,t)){
      muestraDudaHilo(t, v); return;
    }
    $("txt").value=""; marcaEnvio("tenv","");
    if(PERSONAS[yo].jefe && t.estado==="espera") jefeResponde(t,v); else mandar(t,v);
  }
  /* "Muy caro": abre la inteligencia para proponer cómo bajarlo/resolverlo */
  var bcaro=$("bcaro"); if(bcaro) bcaro.onclick=function(){ muyCaro(t); };
  var ncc=$("negcancel"); if(ncc) ncc.onclick=function(){ negociar=null; render(); };
  var ta=cajaEditable($("txt"));
  /* el alto ya lo maneja el CSS de .caja (max-height + scroll), asi que aqui
     no se toca style.height: en un div eso peleaba con el crecer natural. */
  ta.onkeydown=function(ev){ if(ev.key==="Enter" && !ev.shiftKey){ ev.preventDefault(); enviaHilo(); } };
  var tenv=$("tenv"); if(tenv) tenv.onclick=function(){
    if(!ta.value.trim()){ ta.focus(); return }
    enviaHilo();
  };
  /* la barra puede sobrevivir al render (pintaHilo): los listeners fijos se
     cuelgan UNA vez, y tocar la flecha no le quita el foco a la caja para que
     el teclado siga abierto, como en WhatsApp (Salvador 2026-09-24). */
  if(!ta.__hiloEv){ ta.__hiloEv=true;
    ta.addEventListener("blur", function(){ avisaPendiente("tenv", ta.value); marcaEnvio("tenv", ta.value) });
    ta.addEventListener("focus", function(){ avisaPendiente("tenv", ""); marcaEnvio("tenv", ta.value); pliegaPasos(); });
    ta.addEventListener("input", function(){ avisaPendiente("tenv", ""); marcaEnvio("tenv", ta.value) });
    if(tenv){ tenv.addEventListener("pointerdown", function(ev){ ev.preventDefault(); });
              tenv.addEventListener("mousedown", function(ev){ ev.preventDefault(); }); }
  }
  marcaEnvio("tenv", ta.value);   /* al abrir el hilo: vacío -> micrófono */
  /* DICTAR SIN ABRIR EL TECLADO, aqui igual que en la caratula. Mismo motor:
     continuous + interimResults + el reinicio en onend, que es lo que lo
     sostiene vivo en iPhone. Segundo toque para; corta solo a los 4s de
     silencio y deja el texto en la caja, SIN mandarlo: aqui se relee antes. */
  var tm=$("tmic");
  if(tm) tm.onclick=function(){
    if(alarmaRoja(t)){ toast("Primero: Eliminar alarma o Posponer 1 hora"); return }
    if(window.__oyendo){ paraDictadoHilo(); enviaHilo(); return }
    pliegaPasos();   /* build 144: al dictar, los pasos se pliegan */
    aseguraMic(function(){
    recargaMic();
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ ta.focus(); toast("Este navegador no dicta: usa el micrófono del teclado"); return }
    var r; try{ r=new SR() }catch(e){ toast("No se pudo abrir el micrófono"); return }
    window.__rec=r; window.__oyendo=true;
    var previo=ta.value?ta.value+" ":"";
    window.__dicho=""; window.__parcial="";
    r.lang="es-MX"; r.continuous=true; r.interimResults=true;
    tm.classList.add("oyendo");
    abreDictado(function(){ paraDictadoHilo(); enviaHilo(); },
                function(){ paraDictadoHilo(); var _t=$("txt"); if(_t){_t.textContent="";} marcaEnvio("tenv",""); });
    function silencio(){ if(window.__silT){ clearTimeout(window.__silT); window.__silT=null; } }  /* sin auto-envío: solo manda el avioncito */
    r.onresult=function(ev){ if(window.__pausado) return;
      var interim=srJunta(ev).parcial;
      ta.value=(previo+window.__dicho+interim).trim();
      alFinalDeLaCaja(ta); ta.scrollTop=ta.scrollHeight;
      marcaVivo(); window.__parcial=interim; pintaDictado(); silencio();
    };
    r.onerror=function(ev){
      var e=(ev&&ev.error)||"";
      if(e==="not-allowed"||e==="service-not-allowed"){
        paraDictadoHilo(); avisoMicBloqueado();
      }else if(e==="network"){ paraDictadoHilo(); toast("El dictado necesita internet") }
    };
    enlazaRec(r, paraDictadoHilo);
    try{ r.start(); silencio() }
    catch(e){ paraDictadoHilo(); toast("No se pudo abrir el micrófono") }
    });
  };

  /* SIEMPRE ABAJO. Al abrir el hilo y al tocar la caja de escribir, porque el
     teclado de iOS encoge la pantalla y se lleva lo ultimo fuera de vista. */
  function alFondo(){
    var sc=document.querySelector(".scroll");
    if(sc) sc.scrollTop=sc.scrollHeight;
  }
  if(vista230(t)==="imp"){ var _sc230=document.querySelector(".scroll"); if(_sc230) _sc230.scrollTop=0; } else alFondo();   /* build 230: en Importante se ve el Resumen arriba */
  ta.onfocus=function(){ setTimeout(alFondo,120); setTimeout(alFondo,420) };
  if(window.visualViewport) window.visualViewport.addEventListener("resize",alFondo);
  /* build 255: al entrar a una tarea con preguntas pendientes, el bloque sale solo (difuminado); build 265: el micrófono NO arranca solo */
  try{ if(window.__pq255Last!==t.id && !t._leyendo && !document.getElementById("acom249") && preguntas249(t).length) abrePreguntas249(t.id, {gesto:true}); }catch(e){ console.warn("preguntas255",e); }
}
/* quien ha entrado = las fichas reales en bitacora_personas. Cada una con su
   bote para quitarle el acceso (a bitacora_bloqueados) y borrar su ficha. */
function cargaEntrados(){
  var el=$("lent"); if(!el) return;
  if(!db){ el.innerHTML='<div class="card"><div class="sm">Sin conexión</div></div>'; return }
  db.collection(COLP).get().then(function(q){
    var rows=[];
    q.forEach(function(d){
      var a=d.data()||{};
      var nom=((a.nombre||"")+" "+(a.apellido||"")).trim()||d.id;
      var mail=a.mail_trabajo||a.mail_personal||"";
      rows.push({clave:d.id, nom:nom, mail:mail, seed:(d.id==="salvador"||d.id==="josue")});
    });
    if(!rows.length){ el.innerHTML='<div class="card"><div class="sm">Nadie todavía.</div></div>'; return; }
    el.innerHTML=rows.map(function(r){
      return '<div class="card entrow">'+
        '<div class="gcx"><h3>'+esc(r.nom)+'</h3>'+
        '<div class="sm" style="margin:0">'+esc(r.mail||"sin correo")+'</div></div>'+
        ((yo==="salvador" && !r.seed)?'<button class="tras" data-k="'+esc(r.clave)+'" data-m="'+esc(r.mail)+'" aria-label="Quitar">'+svgBasura()+'</button>':'')+
        '</div>';
    }).join("");
    Array.prototype.forEach.call(el.querySelectorAll(".tras"),function(b){
      b.onclick=function(){
        var k=b.getAttribute("data-k"), m=b.getAttribute("data-m"), row=b.parentNode;
        var box=document.createElement("div"); box.className="confirmq";
        box.innerHTML='<button class="mini danger">Quitar</button><button class="mini ghost">Cancelar</button>';
        row.replaceChild(box,b);
        box.children[0].onclick=function(){ quitaAcceso(k,m) };
        box.children[1].onclick=function(){ cargaEntrados() };
      };
    });
  }).catch(function(){ el.innerHTML='<div class="card"><div class="sm">No se pudo leer la lista</div></div>' });
}
function quitaAcceso(clave,mail){
  if(!db){ toast("Sin conexión"); return }
  var ops=[];
  if(mail) ops.push(db.collection(COLBLOQ).doc(mail).set({por:yo,cuando:Date.now()}));
  ops.push(db.collection(COLP).doc(clave).delete());
  Promise.all(ops).then(function(){ toast("Listo, se le quitó el acceso"); cargaEntrados() })
    .catch(function(){ toast("No se pudo quitar"); cargaEntrados() });
}
function bindAdmin(){
  $("bback").onclick=function(){vista="lista";render()};
  cargaEntrados();
  bindBotonAvisos();
  var bl=$("bliga"); if(bl) bl.onclick=function(){
    bl.disabled=true; bl.textContent="Generando…";
    nuevaLiga(function(url,err){
      if(err){ bl.disabled=false; bl.textContent="Generar liga y copiar"; toast(err); return }
      var o=$("ligaout");
      function ok(){ bl.disabled=false; bl.textContent="¡Copiada!";
        if(o){o.style.display="none"}
        setTimeout(function(){ bl.textContent="Generar liga y copiar" },1600); }
      function muestra(){ bl.disabled=false; bl.textContent="Generar liga y copiar";
        if(o){ o.textContent=url; o.style.display="block" } }
      if(navigator.clipboard) navigator.clipboard.writeText(url).then(ok).catch(muestra);
      else muestra();
    });
  };
  Array.prototype.forEach.call(document.querySelectorAll("[data-cp]"),function(el){
    el.onclick=function(){
      var u=el.getAttribute("data-cp");
      if(navigator.clipboard) navigator.clipboard.writeText(u).then(function(){toast("Liga copiada")}).catch(function(){toast("Copia manual: "+u)});
      else toast(u);
    };
  });
}


/* ---- binds de las pantallas nuevas ---- */
function bindYo(){
  var bf=$("bficha"); if(bf) bf.onclick=function(){ vista="ficha"; render() };
  var f12=$("bfmt12"); if(f12) f12.onclick=function(){ try{localStorage.setItem("bit_fmt24","0")}catch(e){} toast("Horas como 4:35 PM"); render() };
  var f24=$("bfmt24"); if(f24) f24.onclick=function(){ try{localStorage.setItem("bit_fmt24","1")}catch(e){} toast("Horas como 16:35"); render() };
  bindBotonAvisos();
  var bb=$("bback"); if(bb) bb.onclick=function(){ vista="lista"; render() };
  var bp=$("bponsup"); if(bp) bp.onclick=function(){
    var d=$("supd").value, hh=$("suph").value, q=$("sups").value,
        tp=$("supt").value, ar=$("supa").value;
    if(!d||!hh||!q){ toast("Faltan las fechas"); return }
    if(dDif(d,hh)<0){ toast("La fecha de regreso va después"); return }
    ponSuplencia(yo,d,hh,q,tp,ar);
    toast("Listo. Lo ve "+PERSONAS[q].nombre);
    render();
  };
  var bq=$("bquitasup"); if(bq) bq.onclick=function(){ quitaSuplencia(yo); toast("Bienvenido"); render() };
}

function bindEncargo(){
  var bb=$("bback"); if(bb) bb.onclick=function(){ vista="lista"; encAbierto=null; render() };
  var bs=$("bsendenc"); if(bs) bs.onclick=function(){
    var e=encargos.filter(function(x){return x.id===encAbierto})[0];
    var v=($("txtenc")||{}).value||"";
    if(!v.trim()){ toast("Escribe aunque sea una línea"); return }
    respondeEncargo(e,v);
    toast("Le llegó a "+PERSONAS[e.de].nombre);
    vista="lista"; encAbierto=null; render();
  };
}

/* una sola pantalla sirve para el encargo de tarea y para el suelto:
   lo único que cambia es si trae tareaId */
function bindPedir(tareaId){
  var bb=$("bback"); if(bb) bb.onclick=function(){ vista=tareaId?"hilo":"lista"; render() };
  var elegido=null;
  Array.prototype.forEach.call(document.querySelectorAll("[data-pers]"),function(el){
    el.onclick=function(){
      elegido=el.getAttribute("data-pers");
      Array.prototype.forEach.call(document.querySelectorAll("[data-pers]"),function(x){x.classList.remove("k")});
      el.classList.add("k");
      $("encpaso2").style.display="block";
      setTimeout(function(){ var i=$("enctxt"); if(i) i.focus() },80);
    };
  });
  var bm=$("encmandar"); if(bm) bm.onclick=function(){
    var txt=($("enctxt")||{}).value||"";
    if(!elegido){ toast("Escoge a quién"); return }
    if(!txt.trim()){ toast("Escribe qué le pides"); return }
    var e=creaEncargo(elegido,txt,tareaId);
    if(!e){ toast("No se pudo"); return }
    toast("Le llegó a "+PERSONAS[elegido].nombre);
    vista=tareaId?"hilo":"lista"; render();
  };
}

function bindMotivo(){
  var bb=$("bback"); if(bb) bb.onclick=function(){ vista="hilo"; render() };
  var t=tareas.filter(function(x){return x.id===abierta})[0];
  Array.prototype.forEach.call(document.querySelectorAll("[data-mot]"),function(el){
    el.onclick=function(){
      var prev={estado:t.estado, cierre:t.cierre||null, n:(t.msgs||[]).length};
      cierraSinEjecutar(t, el.getAttribute("data-mot"));
      sincronizaAvisos(t);
      /* build 175: bote rojo y pasa a la siguiente (antes te quedabas en la tarea) */
      selloYSigue(t,{tipo:"eliminada", texto:t.nombre, restaurar:function(){
        t.estado=prev.estado||"abierta"; t.cierre=prev.cierre; if(t.msgs && t.msgs.length>prev.n) t.msgs.length=prev.n;
        guarda(t); sincronizaAvisos(t); }});
    };
  });
}

function bindTransferir(){
  var bb=$("bback"); if(bb) bb.onclick=function(){ vista="hilo"; render() };
  var t=tareas.filter(function(x){return x.id===abierta})[0];
  Array.prototype.forEach.call(document.querySelectorAll("[data-pers]"),function(el){
    el.onclick=function(){
      var r=transfiere(t, el.getAttribute("data-pers"), "");
      toast(r.ok?"Ya es de "+PERSONAS[t.duenio].nombre:r.msg);
      vista="lista"; abierta=null; render();
    };
  });
}

/* pantalla suelta, antes de que exista la app: sirve para la invitacion */
function pantallaSuelta(html){
  document.body.innerHTML='<div style="padding:40px 24px;font-family:Barlow,-apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,system-ui,sans-serif;'+
    'text-align:center;color:#6A635A;line-height:1.6;max-width:420px;margin:0 auto">'+html+'</div>';
}

/* ---- LIGAS ?inv= VIEJAS (retiradas en build 72) ----
   Una liga de invitacion mandada antes del cambio no debe dejar a nadie
   colgado en una pantalla rota: se le dice que cambio y que hacer. */
function entraPorInvitacion(tk){
  pantallaSuelta(
    "La forma de entrar cambió: ahora es con tu cuenta de <b>Google</b>.<br><br>"+
    "Pídele a Salvador que dé de alta tu correo y luego abre la app normal:<br>"+
    '<a href="'+location.origin+location.pathname+'" style="color:#30D158">doit.ok-doit.com</a>');
}

/* Liga a una tarea pendiente de abrir: vive 15 min en localStorage (lo que tarda un login) y se
   borra en cuanto se abre o se avisa que no existe. */
var LIGA_TAREA_LS="doit_ir_tarea";
function guardaLigaTarea(id){ try{ localStorage.setItem(LIGA_TAREA_LS, JSON.stringify({id:String(id), ts:Date.now()})); }catch(e){} }
function leeLigaTarea(){ try{ var o=JSON.parse(localStorage.getItem(LIGA_TAREA_LS)||"null"); if(o && o.id && Date.now()-Number(o.ts||0)<15*60000) return String(o.id); localStorage.removeItem(LIGA_TAREA_LS); }catch(e){} return ""; }
function olvidaLigaTarea(){ try{ localStorage.removeItem(LIGA_TAREA_LS); }catch(e){} }
/* La tarea de la liga: si se fusionó, la tarea en la que quedó (fusionMap: id -> fusionada_en). */
function tareaDeLiga(id, lista, fusionMap){
  var tid=String(id||"").split("|")[0], vistos={};
  for(var i=0;i<6 && tid && !vistos[tid];i++){ vistos[tid]=1;
    var t=(lista||[]).filter(function(x){ return x && x.id===tid; })[0]; if(t) return t;
    tid=(fusionMap||{})[tid]||""; }
  return null;
}
function avisoLigaTarea(txt){ var e=$("toast"); if(!e) return; e.textContent=txt; e.classList.add("on"); clearTimeout(window.__tLiga); window.__tLiga=setTimeout(function(){ e.classList.remove("on"); }, 7000); }

/* ============ ARRANQUE ============ */
(function(){
  var q=new URLSearchParams(location.search);
  var tk=q.get("inv");
  if(tk){ entraPorInvitacion(tk); return }
  /* build 77: la liga ?alta= trae el token de un solo uso. Se guarda (sobrevive
     el ida y vuelta de Google) y se limpia de la URL para que no quede rondando. */
  var alta=q.get("alta");
  if(alta){ window.__alta=alta; try{ localStorage.setItem("bit_alta",alta) }catch(e){}
            try{ history.replaceState(null,"",location.pathname) }catch(e){} }
  /* LLEGÓ DESDE UNA NOTIFICACIÓN de recordatorio: el sw.js abre la app con
     ?recordatorio=<id>. Se guarda para, en cuanto carguen las tareas, abrir ese
     recordatorio directo (no la pantalla de inicio). Salvador 2026-09-17. */
  if(q.get("ultimo")){ window.__irUltimo=true;
    if(q.get("n_t")||q.get("n_b")) window.__notiPista={t:q.get("n_t")||"", b:q.get("n_b")||"", hasta:Date.now()+25000};
    try{ history.replaceState(null,"",location.pathname) }catch(e){} }
  /* La liga de una tarea (WhatsApp del bot, notificación) tiene que sobrevivir al login de Google:
     si el popup está bloqueado (navegador dentro de WhatsApp) el login va por redirect y la página
     regresa SIN el parámetro. Por eso se guarda también en localStorage, como ?alta=. */
  var _rec=q.get("recordatorio");
  if(_rec){ window.__irARec=_rec; guardaLigaTarea(_rec);
            try{ history.replaceState(null,"",location.pathname) }catch(e){} }
  else { var _lg=leeLigaTarea(); if(_lg) window.__irARec=_lg; }
  fbListo();
  firebase.auth().onAuthStateChanged(function(user){
    if(yo) return;                       /* ya esta adentro */
    if(user&&user.email) resuelveAcceso(user);
    else pintaLogin();
  });
  if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(function(){}); }
  /* build 142 (Salvador 2026-09-25): con la app YA abierta, al tocar la
     notificacion el sw.js manda {tipo:"abre", id} y aqui se abre esa tarea
     (antes solo se enfocaba la app y se quedaba en el home). */
  if("serviceWorker" in navigator){ try{ navigator.serviceWorker.addEventListener("message", function(ev){
    var d=ev&&ev.data;
    if(d && d.tipo==="abre_pista"){ var _tp=tareaDePista({t:d.t,b:d.b}); if(!_tp) _tp=abreUltimoNuevo(); if(_tp){ barraEstado=null; menuOpen=false; abierta=_tp.id; vista="hilo"; render(); } return; }
    if(d && d.tipo==="abre_ultimo"){ var _u2=abreUltimoNuevo(); if(_u2){ barraEstado=null; menuOpen=false; abierta=_u2.id; vista="hilo"; render(); } return; }
    if(!d || d.tipo!=="abre" || !d.id) return;
    var pp=String(d.id).split("|"), t=tareaDeLiga(pp[0], (typeof tareas!=="undefined"?tareas:[]), window.__fusLiga);
    if(!t){ window.__irARec=String(d.id); window.__recAbierto=false; return; }
    window.__avSonando={taskId:t.id, id:(pp[1]||"self")};
    barraEstado=null; menuOpen=false; abierta=t.id; vista="hilo";
    window.__avSheet=avisoSonando(t)?t.id:null; if(!avisoSonando(t)) window.__avSonando=null;
    render();
  }); }catch(e){} }
})();

/* ===== CANDADOS DE LA BARRA · batería 2026-09-05 (30/30) ===== */
(function(){
  var _norm=function(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")};
  var PET=/\b(me\s+(mande|pase|confirme|diga|traiga|consiga|avise|regrese)|mandame|pasame|confirmame|dime|avisame|traeme|consigueme|confirme|averigue|verifique|consiga|traiga)\b/;
  function diaW(t){ if(/\bhoy\b/.test(_norm(t))) return hoy(); return diaDicho(t) }
  function limpiaDictado(t){
    t=String(t||"");
    t=t.replace(/\.{2,}|…/g," ");
    t=t.replace(/\s*,?\s*no\?/gi," ");
    t=t.replace(/\b(este|eh|em+|mm+|o sea|pues|bueno|oye|a ver)\b[,.\s]*/gi," ");
    t=t.replace(/^\s*(apunta(le|me)?|anota(me)?|ponme|agrega(me)?)( ahi)?( que)?\s+/i,"");
    t=t.replace(/^\s*(una\s+)?(tarea|pendiente)\s+(de|para)\s+/i,"");
    t=t.replace(/\b(pinche|chingad[oa]|pendej[oa]|mendig[oa]|maldit[oa])\s*/gi,"");
    t=t.replace(/\s+(antes del?|para el|para|del|el|la|los|las|de)\s*$/i,"");
    return t.replace(/\s{2,}/g," ").replace(/^[,.\s?¿]+|[,.\s?¿]+$/g,"").trim();
  }
  function yaExisteIgual(nombre){
    var n=_norm(nombre); if(n.length<6) return null;
    var hit=null;
    tareas.forEach(function(t){ if(hit||t.cierre) return;
      var m=_norm(t.nombre||"");
      if(m===n||(m.length>9&&n.length>9&&(m.indexOf(n)>=0||n.indexOf(m)>=0))) hit=t; });
    return hit;
  }

  /* C4 nombre desconocido + C5 "todo": se resuelven en el telefono, antes de Claude */
  var _barraEnviar=barraEnviar;
  window.__terminosExtra=null;
  barraEnviar=function(texto){
    texto=limpiaHoraDictada(String(texto||"").trim());
    /* BLINDAJE: si hay una pregunta en el momento (tarea a medias esperando su
       dato), la respuesta la COMPLETA y nunca pasa por los filtros ni por Claude.
       Antes el "completandoId" solo se veia dentro de _barraEnviar, despues de los
       filtros; asi un dato como "hoy a las 10" podia colarse a otro camino y el
       usuario terminaba en la lista sin que se guardara. Salvador 2026-09-17. */
    if(barraEstado && (barraEstado.completandoId || barraEstado.insertaEn)){ _barraEnviar(texto); return; }
    var enHilo=barraEstado&&barraEstado.hist&&barraEstado.hist.length;
    if(!enHilo){
      var _t=_norm(texto);
      /* filtro directo: "vencidas de samuel", "muestrame lo de la pipa" */
      var mF=_t.match(/(vencid|viv[ao]|abiert|detenid|parad)\w*\s+de\s+([a-z]+)/);
      if(mF&&PERSONAS[mF[2]]){
        barraEstado=null; consulta=mF[2]+" "+(mF[1].indexOf("venc")===0?"vencidas":mF[1]);
        vista="lista"; render(); return;
      }
      var mL=texto.match(/^(?:[Mm]u[eé]strame|[Ee]ns[eé]ñame|[Dd]ame|[Vv]er)(?:me)?(?: todo)? lo de (?:la |el |los |las )?(.+?)\??$/);
      if(mL){ barraEstado=null; consulta=mL[1].trim(); vista="lista"; render(); return; }
      /* borrar y mover: la barra no lo hace; camino fijo, sin fingir */
      if(/^(borra|elimina|quita)\b/.test(_t)){
        barraEstado={modo:"respuesta",dicho:texto,
          texto:"La barra no borra tareas. Abre la tarea > menú '...' > 'Esto ya no se va a hacer'. Ahí pones el motivo y se cierra."};
        vista="barra"; render(); return;
      }
      if(/^(mueve|muevele|cambia|cambiale|pasa|pasale|recorre)\b/.test(_t)&&/fecha|al lunes|al martes|al miercoles|al jueves|al viernes|al sabado|al domingo|para el/.test(_t)){
        barraEstado={modo:"respuesta",dicho:texto,
          texto:"La barra no mueve fechas. Abre la tarea > 'Mover la fecha': te pide el motivo y ahí queda la nueva."};
        vista="barra"; render(); return;
      }
      if(/^que tengo( para)? hoy\??$/.test(_norm(texto))){
        var H=hoy(), mias=tareas.filter(function(t){return estaAbierta(t)&&t.duenio===yo});
        var deHoy=mias.filter(function(t){return t.f_vigente===H});
        var venc=mias.filter(function(t){return t.f_vigente&&t.f_vigente<H});
        var tx = deHoy.length
          ? "Para hoy, tuyas: "+deHoy.map(function(t){return "“"+t.nombre+"”"}).join(", ")+"."
          : "Hoy no tienes nada tuyo con fecha de hoy.";
        if(venc.length) tx+=" Traes "+venc.length+" tuya"+(venc.length>1?"s":"")+" vencida"+(venc.length>1?"s":"")+".";
        barraEstado={modo:"respuesta",dicho:texto,texto:tx}; vista="barra"; render(); return;
      }
      if(/^tod[oa]s?( las vivas)?$/.test(_norm(texto))){
        barraEstado=null; consulta=""; vista="lista"; render();
        toast("Todas las vivas"); return;
      }
      if(/\b(apunta(le|me)?|anota(me)?|ponme)\b/.test(_norm(texto))){
        var cand=limpiaDictado(sinLaFecha(texto));
        var ex0=cand&&yaExisteIgual(conMayuscula(cand));
        if(ex0){
          barraEstado={modo:"respuesta",dicho:texto,
            texto:"Ya existe “"+ex0.nombre+"” (de "+((PERSONAS[ex0.duenio]||{}).nombre||ex0.duenio)+
                  (ex0.f_vigente?", para el "+fechaBonita(ex0.f_vigente):"")+"). Ábrela si quieres."};
          vista="barra"; render(); return;
        }
      }
      var m2=texto.match(/\b(?:[Dd][ií]le|[Ee]nc[aá]rga(?:le|selo|sela)?|[Pp][ií]dele|[Mm][aá]ndale|[Aa]v[ií]sale)\s+a\s+([A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00d1][a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1]+)/);
      if(m2){
        var nom=_norm(m2[1]);
        var esta=Object.keys(PERSONAS).some(function(k){
          return _norm(PERSONAS[k].nombre||k)===nom });
        if(!esta){
          barraEstado={modo:"pregunta",dicho:texto,hist:["Persona: "+texto],
            titulo:"No encuentro a "+m2[1],
            pregunta:"No tengo a "+m2[1]+" en el equipo. ¿A quién de la lista se lo encargo, o es alguien nuevo?"};
          vista="barra"; render(); return;
        }
      }
    }
    _barraEnviar(texto);
  };

  /* C1,C2,C3,C6,C7: candados sobre lo que contesta Claude */
  var _aplica=aplicaIntencion;
  aplicaIntencion=function(j,dicho,hist,foto){
    hist=hist||[];
    var dichoTotal=hist.map(function(h){return h.replace(/^Persona:\s*/,"")})
                       .filter(function(h){return !/^Claude/.test(h)}).join(" ")+" "+dicho;
    var i=String(j.intencion||"").toUpperCase().replace(/[^A-Z_]/g,"");
    if(SINONIMOS_INT[i]) i=SINONIMOS_INT[i];
    var plata=/\b(pag|paga|pague|deposit|compr|autoriz|cotiz|abon|liquid|transfer|factur)/i.test(dichoTotal);
    var soloAutoriza=/\bautoriz/i.test(dichoTotal);
    var traeMonto=/(\$\s*\d|\b\d{3,}\b|\bmil\b|\bpesos\b)/i.test(dichoTotal)||!!(j.tarea&&j.tarea.gasto);

    /* C7: apuntar/anotar/ponme = CREAR, sin excepcion (regla 0 de Salvador) */
    if(/\b(apunta(le|me)?|anota(me)?|ponme)\b/.test(_norm(dicho)) &&
       ["CREAR","ENVIAR"].indexOf(i)<0){
      if(i==="BUSCAR" && j.terminos) window.__terminosExtra=String(j.terminos);
      i="CREAR"; j.intencion="CREAR";
      if(!j.tarea||!j.tarea.nombre)
        j.tarea={nombre:conMayuscula(limpiaDictado(sinLaFecha(nombreDeLoDicho(dicho)))),
                 duenio:quienDicho(dicho)||yo, fecha:diaW(dichoTotal)||"",
                 cierra:"",revisar:"",criticidad:"normal",periodicidad:null,
                 recuperable:true,gasto:""};
    }
    /* C7-bis (Salvador 2026-09-16, corregida 2026-09-22): "recuerdame ..." NO es
       automaticamente RECORDATORIO. Si lo dictado trae un verbo de accion (algo
       que HACER, no solo un aviso que llega solo), es TAREA con su fecha, y el
       recordatorio se cuelga ahi \u2014 nunca recordatorio suelto. Ejemplo real de
       Salvador: "recuerdame cortarte el pelo" -> tarea "Cortarte el pelo", NO
       recordatorio. Solo sigue siendo RECORDATORIO cuando no hay nada que
       ejecutar (p. ej. "recuerdame que sale mi vuelo a las 6"). Lista de verbos
       es heuristica: se amplia si aparece un caso que no cubre. */
    var _VERBO_ACCION=/\b(cort(a|ar|arte|arme|alo|ala)|ba[n\u00f1](a|ar|arte|arme|alo|ala)|llam(a|ar|arle|arla|arlo)|llev(a|ar|arte|arlo|arla|arlos|arlas)|pag(a|ar|arle|alo|ala)|revis(a|ar|alo|ala)|entreg(a|ar|arlo|arla)|compr(a|ar|arlo|arla)|recog(e|er|elo|ela)|mand(a|ar|arlo|arla)|envi(a|ar|arlo|arla)|arregl(a|ar|arlo|arla)|repar(a|ar|arlo|arla)|chec(a|ar|alo|ala)|confirm(a|ar|alo|ala)|cobr(a|ar|arle)|firm(a|ar|alo|ala)|imprim(e|ir|elo|ela)|renov(a|ar|arlo|arla)|tramit(a|ar|arlo|arla)|sac(a|ar|alo|ala)|contrat(a|ar|arlo|arla)|agend(a|ar|alo|ala)|program(a|ar|alo|ala)|visit(a|ar|arlo|arla)|hac(er|elo|ela)|cambi(a|ar|arlo|ala)|limpi(a|ar|alo|ala)|organiz(a|ar|alo|ala)|comprar|actualiz(a|ar|alo|ala)|termin(a|ar|alo|ala)|escrib(e|ir|elo|ela)|mand(a|ar))\b/i;
    if(/\b(recu[e\u00e9]rda(me|nos)?|acu[e\u00e9]rda(te|me)?|recordatorio)\b/.test(_norm(dicho)) &&
       ["RECORDATORIO","CREAR","ENVIAR"].indexOf(i)<0 && !_VERBO_ACCION.test(_norm(dicho))){
      i="RECORDATORIO"; j.intencion="RECORDATORIO";
      var _rt=String(dicho||"").replace(/^\s*(recu[e\u00e9]rda(me|nos)?|acu[e\u00e9]rda(te|me)?|ponme (un )?recordatorio( de| para)?)\s+/i,"");
      j.recordatorio={texto:conMayuscula(limpiaDictado(sinLaFecha(nombreDeLoDicho(_rt||dicho)))),
                      fecha:diaW(dichoTotal)||""};
    } else if(/\b(recu[e\u00e9]rda(me|nos)?|acu[e\u00e9]rda(te|me)?|recordatorio)\b/.test(_norm(dicho)) &&
       ["CREAR","ENVIAR"].indexOf(i)<0 && _VERBO_ACCION.test(_norm(dicho))){
      i="CREAR"; j.intencion="CREAR";
      var _rt2=String(dicho||"").replace(/^\s*(recu[e\u00e9]rda(me|nos)?|acu[e\u00e9]rda(te|me)?|ponme (un )?recordatorio( de| para)?)\s+/i,"");
      if(!j.tarea||!j.tarea.nombre)
        j.tarea={nombre:conMayuscula(limpiaDictado(sinLaFecha(nombreDeLoDicho(_rt2||dicho)))),
                 duenio:quienDicho(dicho)||yo, fecha:diaW(dichoTotal)||"",
                 cierra:"",revisar:"",criticidad:"normal",periodicidad:null,
                 recuperable:true,gasto:""};
    }
    /* C0 (build 136): si suena a WhatsApp y el destinatario NO es del equipo,
       es WHATSAPP aunque Claude lo haya marcado como comentar/encargar */
    var _WA=/\b(whats?app|whats|escr[ií]bele|escr[ií]bale|escr[ií]beles|m[aá]ndale (un )?(whats|mensaje)|preg[uú]ntale)\b/i;
    if((i==="COMENTAR"||i==="ENCARGAR"||i==="CREAR"||i==="PREGUNTA") && _WA.test(String(dicho||""))){
      var _dest=(i==="COMENTAR"&&j.comentar&&j.comentar.a)||(i==="ENCARGAR"&&j.encargo&&j.encargo.para)||(j.tarea&&j.tarea.duenio)||"";
      /* build 137: "escribele" o decir WhatsApp = WhatsApp, aunque sea del equipo
         (Carlos, Josue). "a was a Carlos" (dictado) se limpia a "a Carlos". */
      var _explWA=/\b(whats?\s?app|whats|wasap|guasap|was|escr[ií]bele|escr[ií]beles|escr[ií]bale)\b/i.test(String(dicho||""));
      var _dLimpio=String(dicho||"").replace(/\ba\s+(whats?\s?app|whats|wasap|guasap|was)\s+a\s+/gi,"a ");
      var _mNom=_dLimpio.match(/(?:escr[ií]be(?:le|les|la)?|preg[uú]ntale|m[aá]ndale(?: un)?(?: whats(?:app)?| mensaje)?)\s+al?\s+([A-Za-zÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]+)?)/i);
      var _nom=_mNom?_mNom[1].replace(/\s+(que|si|por|como|c[oó]mo|cu[aá]ndo|d[oó]nde|para|a|al|y|de|del|en|ver)$/i,"").trim():"";
      var _esEquipo=!!(_dest&&PERSONAS[_dest]) || Object.keys(PERSONAS).some(function(k){
        return _nom && PERSONAS[k].nombre.toLowerCase().indexOf(_nom.toLowerCase())===0; });
      if(_nom && (!_esEquipo || _explWA)){
        i="WHATSAPP"; j.intencion="WHATSAPP";
        var _txt=(j.comentar&&j.comentar.texto)||(j.encargo&&j.encargo.texto)||(j.tarea&&j.tarea.nombre)||"";
        j.whatsapp=j.whatsapp||{contacto:_nom, texto:_txt, tarea:(j.comentar&&j.comentar.tarea)||""};
        if(!j.whatsapp.contacto) j.whatsapp.contacto=_nom;
      }
    }
    /* C2: peticion que espera respuesta = ENCARGO, nunca comentario */
    if(i==="COMENTAR" && j.comentar && j.comentar.a && PET.test(_norm(j.comentar.texto||dicho))){
      i="ENCARGAR"; j.intencion="ENCARGAR";
      j.encargo={para:j.comentar.a, texto:j.comentar.texto};
    }
    if(i==="PREGUNTA" && j.encargo && j.encargo.para && PET.test(_norm(dicho))){
      i="ENCARGAR"; j.intencion="ENCARGAR";
    }
    /* C2-bis: un encargo de INFORMACION vale aunque la tarea no fuera mia */
    if(i==="ENCARGAR" && j.encargo && j.encargo.para && PERSONAS[j.encargo.para] &&
       j.encargo.texto && PET.test(_norm(j.encargo.texto+" "+dicho))){
      barraEstado={modo:"confirmar",accion:"encargar",dicho:dicho,para:j.encargo.para,foto:foto,
        renglones:[{k:"m",v:j.encargo.texto},
                   {k:"d",v:"Encargo · se mide en horas · sigue siendo tuya"}],
        pendiente:{encargo:j.encargo}};
      vista="barra"; render(); return;
    }
    /* C6: recordatorio con dinero = tarea (pagar es HACER) */
    if(i==="RECORDATORIO" && plata && j.recordatorio){
      i="CREAR"; j.intencion="CREAR";
      j.tarea={nombre:conMayuscula(j.recordatorio.texto||nombreDeLoDicho(dicho)),
               duenio:quienDicho(dichoTotal)||yo,
               fecha:j.recordatorio.fecha||diaW(dichoTotal)||"",
               cierra:"",revisar:"",criticidad:"normal",periodicidad:null,
               recuperable:true,gasto:""};
    }
    /* C1: PREGUNTA = UN solo hueco de las cuatro; dueño por defecto = el que habla */
    var esSupervision=/supervis|dale seguimiento|vigila|revisa que|checa que|que revise/.test(_norm(dicho));
    if(i==="PREGUNTA" && (!j.supervisar || (!esSupervision && hayQueHacerAlgo(dichoTotal,j)))){
      var quien=quienDicho(dichoTotal)||yo;
      var dia=diaW(dichoTotal)||((j.tarea&&/^\d{4}-\d{2}-\d{2}$/.test(j.tarea.fecha))?j.tarea.fecha:null);
      var nombre=(j.tarea&&j.tarea.nombre)||
                 sinLaFecha(String(j.titulo||"").replace(/[.…]+$/,"").trim())||
                 nombreDeLoDicho(dicho);
      nombre=limpiaDictado(nombre)||limpiaDictado(nombreDeLoDicho(dicho));
      var accionable=hayQueHacerAlgo(dichoTotal,j);
      if(accionable && !dia){
        j.pregunta="¿Para cuándo?"; j.titulo=conMayuscula(nombre);
      } else if(accionable && soloAutoriza && !traeMonto){
        j.pregunta="¿Cuánto, o hasta cuánto?"; j.titulo=conMayuscula(nombre);
      } else if(accionable && nombre){
        i="CREAR"; j.intencion="CREAR";
        j.tarea={nombre:conMayuscula(sinLaFecha(nombre)),duenio:quien,fecha:dia,
                 cierra:(j.tarea&&j.tarea.cierra)||"",revisar:"",criticidad:"normal",
                 periodicidad:null,recuperable:true,gasto:(j.tarea&&j.tarea.gasto)||""};
      }
      /* no accionable ("pipa martes"): se respeta la pregunta de Claude tal cual */
    }
    /* build 144: PASOS. Claude los manda en tarea.pasos (o sueltos). Las reglas
       de arriba a veces rearman j.tarea: aqui se le regresan. Un RECORDATORIO
       que trae 2+ cosas que hacer se vuelve TAREA con pasos (su hora = alarma). */
    var _pz=(j.tarea&&j.tarea.pasos)||j.pasos||(j.recordatorio&&j.recordatorio.pasos)||null;
    if(i==="RECORDATORIO" && normalizaPasos(_pz).length>=2){
      i="CREAR"; j.intencion="CREAR";
      j.tarea={nombre:conMayuscula((j.recordatorio&&j.recordatorio.texto)||nombreDeLoDicho(dicho)),
               duenio:yo, fecha:(j.recordatorio&&j.recordatorio.fecha)||diaW(dichoTotal)||"",
               cierra:"",revisar:"",criticidad:"normal",periodicidad:null,
               recuperable:true,gasto:""};
    }
    if(i==="CREAR" && j.tarea && !j.tarea.pasos && _pz) j.tarea.pasos=_pz;
    /* dup exacto local: ya existe una viva igual -> se dice, sin gastar tokens */
    if(i==="CREAR" && j.tarea && j.tarea.nombre){
      j.tarea.nombre=conMayuscula(limpiaDictado(j.tarea.nombre));
      var ex=yaExisteIgual(j.tarea.nombre);
      if(ex){
        barraEstado={modo:"respuesta",dicho:dicho,
          texto:"Ya existe “"+ex.nombre+"” (de "+((PERSONAS[ex.duenio]||{}).nombre||ex.duenio)+
                (ex.f_vigente?", para el "+fechaBonita(ex.f_vigente):"")+"). Ábrela si quieres."};
        vista="barra"; render(); return;
      }
    }
    /* C1-bis: SOLO una AUTORIZACION sin monto pregunta cuanto (punto fino
       2026-09-16: pagar/depositar/comprar NO lo preguntan al crear; el monto
       se anota si lo dicen y si no se pide al autorizar o cerrar). */
    if(i==="CREAR" && soloAutoriza && !traeMonto && j.tarea && j.tarea.nombre){
      creaIncompleta({nombre:conMayuscula(j.tarea.nombre),
        duenio:(j.tarea.duenio||quienDicho(dichoTotal)||yo),
        fecha:(j.tarea.fecha&&/^\d{4}-\d{2}-\d{2}$/.test(j.tarea.fecha))?j.tarea.fecha:(diaW(dichoTotal)||""),
        gasto:j.tarea.gasto||"", dicho:dicho}, "¿Cuánto, o hasta cuánto?", "monto", foto);
      return;
    }
    /* C3: doble orden — la busqueda no se pierde */
    if(i==="CREAR" && j.terminos) window.__terminosExtra=String(j.terminos);
    _aplica(j,dicho,hist,foto);
  };
  /* build 190: CANDADO DE FECHAS — va POR FUERA de todos los candados de arriba, asi lo
     primero que pasa con lo que contesta Claude es cuadrar sus fechas con lo dictado
     (candadoIntencion). Fecha dictada en duda -> UNA pregunta, no se crea nada. */
  var _aplicaSinCandado=aplicaIntencion;
  aplicaIntencion=function(j,dicho,hist,foto){
    var _ci={duda:""}; try{ _ci=candadoIntencion(j||{}, dicho, hist||[]); }catch(e){}
    if(_ci.duda){
      var _hs=(hist||[]).slice(); _hs.push("Claude pregunto: "+_ci.duda);   /* hist ya trae "Persona: "+dicho */
      barraEstado={modo:"pregunta", dicho:dicho, hist:_hs, foto:foto, titulo:"Fecha", pregunta:_ci.duda};
      vista="barra"; render(); return;
    }
    return _aplicaSinCandado(j,dicho,hist,foto);
  };

  var _confirma=confirmaAccion;
  confirmaAccion=function(b){
    _confirma(b);
    if(window.__terminosExtra){
      consulta=window.__terminosExtra; window.__terminosExtra=null;
      vista="lista"; render(); toast("Y te dejo buscado: "+consulta);
    }
  };

  /* renglones nuevos del prompt */
  SYS_BARRA += "\n=== REGLAS AGREGADAS 2026-09-05 ===\n"+
  "f) DUEÑO POR DEFECTO: si no dijo quien lo hace, el dueño es EL QUE HABLA. NUNCA preguntes quien.\n"+
  "g) 'apuntame X', 'anota X', 'ponme X', 'apuntale que X' = CREAR, siempre, aunque exista una parecida.\n"+
  "h) PEDIRLE a alguien algo que requiere que CONTESTE o ENTREGUE ('que me mande', 'que confirme', 'que me pase') = ENCARGAR con 'para' y 'texto'. NUNCA COMENTAR: comentar es informar sin esperar respuesta.\n"+
  "i) NOMBRE que no esta en 'gente': dilo de inmediato ('No tengo a X en el equipo') en 'pregunta'. NUNCA supongas que existe.\n"+
  "j) DOBLE ORDEN ('busca X y de paso apuntame Y'): contesta CREAR para Y y pon los terminos de X en 'terminos', para que la busqueda no se pierda.\n"+
  "k) 'que tengo para hoy' = SOLO tareas cuyo de: sea el que habla. Las de otros NO son suyas: no las mezcles.\n"+
  "l) 'quien trae X' = RESPONDER corto con el de: de esa tarea ('La trae Samuel'). No BUSCAR.\n"+
  "m) BORRAR o MOVER FECHA: la barra NO borra ni mueve. RESPONDER explicando el camino: borrar = abrir la tarea > menu '...' > 'esto ya no se va a hacer'; mover = abrir la tarea y decirlo ('pasala al viernes', 'en 15 dias', 'a fin de mes'): se mueve al instante y el motivo es opcional. NUNCA digas que ya quedo.\n"+
  "n) DINERO SIN MONTO — el orden manda. Lo esencial de una tarea sigue siendo la FECHA, "+
  "no el monto. Si hay dinero (pagar, depositar, comprar) y falta el CUANDO, pregunta SOLO "+
  "'¿para cuando?'; el monto NO se pregunta al crear (se anota si lo dicen, y si no, se pide "+
  "despues, al autorizar o cerrar). El monto solo se vuelve la pregunta cuando la tarea es una "+
  "AUTORIZACION y el monto es lo UNICO que falta para decidir. Nunca preguntes fecha y monto "+
  "por separado: si de veras faltan los dos, van juntos en una sola pregunta.\n";
  /* === FALLAS QUE SALVADOR HALLO EN SU IPHONE 2026-09-08 — arreglo 2026-09-16 === */
  SYS_BARRA += "\n=== REGLAS AGREGADAS 2026-09-16 (fallas del iPhone) ===\n"+
  "o) ESPANOL DE MEXICO, TUTEO. Nunca voseo: jamas 'vos', 'tenes', 'queres', 'decime', "+
  "'cual tarea vos'. Se dice 'tienes', 'quieres', 'dime', 'de cual tarea hablas'.\n"+
  "p) LAS FECHAS SALEN DE LA TABLA 'calendario' QUE TE PASO, no de tu memoria. 'manana', "+
  "'pasado manana', 'el viernes', 'el lunes' se resuelven buscando ese dia en 'calendario' "+
  "(trae cada fecha con su dia de la semana, y marca HOY y MANANA). NUNCA calcules el dia "+
  "de la semana de memoria, y NUNCA pongas la fecha de HOY cuando dijeron 'manana' u otro "+
  "dia: eso hace que una tarea amanezca vencida sin deberla.\n"+
  "q) EL DICTADO DE VOZ A VECES DEFORMA PALABRAS (cambia 'como van las palmas' por 'solo "+
  "van Las Palmas'). Si la frase llega rara y NO trae un verbo de accion claro (comprar, "+
  "pagar, revisar, llamar, mandar, arreglar...), NO te lances a CREAR: primero BUSCA en las "+
  "abiertas a ver si pega con algo y ensenalo; crear una tarea nueva solo con intencion "+
  "clara. Ante frase deforme y ambigua, mejor una pregunta corta que una tarea inventada.\n"+
  "r) ENCARGO SUELTO DESDE LA BARRA. Pedirle algo puntual a una persona que NO cuelga de "+
  "una tarea existente ('dile a Karina que me mande un OK', 'que Samuel me confirme') es "+
  "ENCARGAR, se mide en horas y NO se cuelga de ninguna tarea suya. NO preguntes '¿en cual "+
  "de sus tareas se lo dejo?': el encargo va suelto.\n"+
  "s) NUNCA DIGAS 'PEGAN 2' O 'HAY VARIAS' SIN ENSENAR CUALES. Si mencionas que coinciden "+
  "tareas, listalas por su nombre para que las vea. Preguntar a ciegas esta prohibido.\n"+
  "t) CON FOTO EN MANO, PROPON LA TAREA QUE OBVIAMENTE PEGA. Si el texto de la foto menciona "+
  "algo que coincide con una tarea abierta ('de la prueba de los tornillos' y existe 'prueba "+
  "comprar tornillos'), PROPONLA POR SU NOMBRE: '¿Es de \u00abprueba comprar tornillos\u00bb?'. "+
  "No preguntes en abstracto '¿es para reportar o abro una nueva?' cuando la tarea salta a la "+
  "vista.\n";
  /* build 144 (Salvador 2026-09-26): PASOS dentro de la tarea */
  SYS_BARRA += "\n=== REGLAS AGREGADAS 2026-09-26 (pasos) ===\n"+
  "u) VARIAS COSAS EN UN DICTADO = PASOS. Si dice 2 o mas cosas distintas que hacer o comprar, "+
  "es UNA tarea con su lista en tarea.pasos: [{\"tx\":\"<cosa corta>\",\"sec\":\"<seccion o vacio>\",\"meta\":\"<nota corta o vacio>\"}]. "+
  "El nombre queda CORTO y general ('Ir a Moric', 'Compras para la cena'), sin repetir la lista ni la hora. "+
  "Una sola cosa = pasos vacio []. SECCIONES (sec): si dijo DONDE ('el vino en el Chalan, los camarones en Costco') "+
  "la seccion es el lugar o tienda ('Chalan', 'Costco'); si no dijo donde y es una compra larga, agrupa natural "+
  "('Carnes y mariscos', 'Vinos y licores'); lista corta = sec vacio. Condicion ('revisar si tengo vino, si no "+
  "comprarlo') = un paso con meta corta ('solo si no hay en casa'). Nunca inventes cosas que no dijo.\n"+
  "v) HORA DICHA: si dijo una hora ('a las 5:30', 'a las cinco 30', '6 de la tarde'), aunque no diga recuerdame "+
  "(el iPhone a veces escribe 'Dame' en vez de 'Recuerdame'), la tarea lleva alarma: la app la pone sola. "+
  "NO metas la hora en el nombre.\n";
})();

/* ===================== build 179 (Salvador 2026-10-02 20:25 "Programa todo") =====================
   INTEGRANTES, ORGANIGRAMA, COMPARTIDAS, "PARA TI", RESPUESTAS QUE NO RESUELVEN y SUPERVISOR.
   Diseno: claude/doit-diseno-compartidas.md (maquetas aprobadas 18:53-20:20).
   - Una tarea = un hilo; cada quien la ve con su lente. Nunca una tarea aparte para revisar.
   - El organigrama se dicta una vez ("Samuel es jefe de Manuel") y se guarda en la ficha.
   - Los jefes (hacia arriba) nunca se pueden quitar de una tarea.
   ============================================================================================ */
function _n179(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9ñ ]+/g," ").replace(/\s+/g," ").trim(); }
/* clave de persona del equipo por nombre o apodo dicho */
function claveDe(nombre){
  var n=_n179(nombre); if(!n) return null;
  var w=n.split(" ")[0];
  var ks=Object.keys(PERSONAS);
  for(var i=0;i<ks.length;i++){ var p=PERSONAS[ks[i]]||{};
    if(ks[i]===w || _n179(p.nombre)===w || _n179((p.nombre||"")+" "+(p.apellido||""))===n) return ks[i];
    var ap=(p.apodos||[]).map(_n179); if(ap.indexOf(n)>=0 || ap.indexOf(w)>=0) return ks[i]; }
  return null;
}
/* a es jefe (directo o de mas arriba) de b */
function jefeDe(a, b){
  if(!a || !b || a===b || !PERSONAS[a] || !PERSONAS[b]) return false;
  var k=b, vistos={};
  while(k && !vistos[k]){ vistos[k]=1; var up=(PERSONAS[k]||{}).reporta_a; if(up===a) return true; k=up; }
  /* sin organigrama dictado: el que trae jefe:true esta arriba de quien no */
  return !!(PERSONAS[a].jefe && !PERSONAS[b].jefe && !PERSONAS[a].prueba);
}
function guardaOrg(k, campos){
  var p=PERSONAS[k]; if(!p) return;
  Object.keys(campos).forEach(function(c){ p[c]=campos[c]; });
  try{ if(db) db.collection(COLP).doc(k).set(campos,{merge:true}).catch(function(){ toast("No se pudo guardar el organigrama"); }); }catch(e){}
}
/* "Samuel es jefe de Manuel" / "Manuel reporta a Samuel" / "el jefe de Manuel es Samuel" */
function organigramaDicho(v){
  var s=_n179(v), m;
  if((m=s.match(/^(?:oye )?([a-zñ]+(?: [a-zñ]+)?) es (?:el |la )?(?:jefe|jefa|supervisor|supervisora|encargado|encargada) de ([a-zñ]+(?: [a-zñ]+)?)$/))) return {jefe:m[1], de:m[2]};
  if((m=s.match(/^(?:oye )?el (?:jefe|supervisor|encargado) de ([a-zñ]+(?: [a-zñ]+)?) es ([a-zñ]+(?: [a-zñ]+)?)$/))) return {jefe:m[2], de:m[1]};
  if((m=s.match(/^(?:oye )?([a-zñ]+(?: [a-zñ]+)?) (?:reporta|le reporta) a ([a-zñ]+(?: [a-zñ]+)?)$/))) return {jefe:m[2], de:m[1]};
  return null;
}
function aplicaOrganigrama(v){
  var o=organigramaDicho(v); if(!o) return false;
  var j=claveDe(o.jefe), d=claveDe(o.de);
  if(!j || !d){ toast("No encontré a "+(!j?o.jefe:o.de)+" en el equipo"); return true; }
  if(j===d || jefeDe(d,j)){ toast("Eso haría un círculo en el organigrama; no lo guardé"); return true; }
  guardaOrg(d,{reporta_a:j});
  toast(PERSONAS[j].nombre+" es jefe de "+PERSONAS[d].nombre);
  return true;
}

/* ---------- integrantes ---------- */
function integrantesDe(t){
  var out=[], vistos={};
  function pon(k, rol){ if(!k || vistos[k]) return; vistos[k]=1; out.push({k:k, rol:rol}); }
  if(t.duenio) pon(t.duenio,"hace");
  (t.revisores||[]).forEach(function(k){ pon(k,"revisa"); });
  if(t.creada_por && PERSONAS[t.creada_por]) pon(t.creada_por,"opina");
  (t.integrantes||[]).forEach(function(k){ pon(k, String(k).indexOf("ext:")===0?"externo":"opina"); });
  (t.msgs||[]).forEach(function(x){ if(x && x.de && PERSONAS[x.de]) pon(x.de,"opina"); });
  /* build 193 (F38): tambien el encargado, quien platica por WhatsApp (una persona = uno,
     aunque tenga varios nombres) y el externo que revisa */
  var _enc=(encargadoDe(t)||{}).id;
  if(_enc && PERSONAS[_enc]) pon(_enc,"hace");
  try{ contactosWA(t).forEach(function(G){ pon(G.eq?G.eq:"ext:"+G.nombre, G.eq?"opina":"externo"); }); }catch(e){}
  if(t.revisa_ext) pon("ext:"+String(t.revisa_ext),"externo");
  return out.filter(function(x){ return !(t.integrantes_fuera||[]).some(function(f){ return f===x.k; }) || x.rol==="hace"; });
}
function nombreInt(k){ return String(k).indexOf("ext:")===0 ? String(k).slice(4) : ((PERSONAS[k]&&PERSONAS[k].nombre)||k); }
function iniInt(k){ if(String(k).indexOf("ext:")===0){ var w=String(k).slice(4).split(" "); return (w[0][0]||"").toUpperCase()+((w[1]||"")[0]||"").toUpperCase(); } return (PERSONAS[k]&&PERSONAS[k].ini)||String(k).slice(0,2).toUpperCase(); }
function agregaIntegrante(t, k){
  t.integrantes=t.integrantes||[];
  t.integrantes_fuera=(t.integrantes_fuera||[]).filter(function(x){ return x!==k; });
  if(t.integrantes.indexOf(k)<0 && k!==t.duenio) t.integrantes.push(k);
  guarda(t);
}
/* quitar: solo el dueño, y nunca a sus jefes (hacia arriba) ni al dueño */
function puedeQuitar(t, k){
  if(t.duenio!==yo || k===t.duenio || k===yo) return false;
  if(PERSONAS[k] && jefeDe(k, t.duenio)) return false;
  return true;
}
function quitaIntegrante(t, k){
  if(!puedeQuitar(t,k)) return false;
  t.integrantes=(t.integrantes||[]).filter(function(x){ return x!==k; });
  t.revisores=(t.revisores||[]).filter(function(x){ return x!==k; });
  t.integrantes_fuera=(t.integrantes_fuera||[]).concat([k]);
  guarda(t); return true;
}
/* contactos para proponer: equipo + nombres de WhatsApp vistos en todas las tareas, con cuanto se platica */
function contactosConocidos(){
  var m={};
  Object.keys(PERSONAS).forEach(function(k){ if(k===yo) return; var p=PERSONAS[k]; m["k:"+k]={id:k, nombre:(p.nombre||k)+(p.apellido?" "+p.apellido:""), sub:"equipo · Doit", n:5, ts:0}; });
  tareas.forEach(function(t){ (t.msgs||[]).forEach(function(x){
    var c=x&&(x.wa_c||x.wa_auto); if(!c || /^grupo\b/i.test(c) || /^\+?\d[\d\s]+$/.test(c)) return;
    var kk=claveDe(c); if(kk && PERSONAS[kk]) return;
    var id="ext:"+c, o=m[id]||(m[id]={id:id, nombre:c, sub:"WhatsApp", n:0, ts:0});
    o.n++; if((x.ts||0)>o.ts) o.ts=x.ts||0; }); });
  return Object.keys(m).map(function(k){ return m[k]; });
}
/* build 219 (Salvador 10:15): AGREGAR con buscador. Busca en TODOS los contactos: los de Doit (equipo), los de
   WhatsApp vistos en las tareas y la AGENDA completa que importa la Mac, si el servidor la da (accion wa_agenda,
   pendiente de Carlos; sin ella busca solo en lo que la app conoce). Sin importar acentos ni mayusculas, por nombre o apodo. */
window.AGENDA_WA=window.AGENDA_WA||null;
function _agendaDe(j){
  if(!j || j.error) return null;
  var l=j.contactos||j.agenda||j.lista||j.items||(Array.isArray(j)?j:null);
  if(l && !Array.isArray(l) && typeof l==="object") l=Object.keys(l).map(function(k){ var v=l[k]; return typeof v==="object"&&v?Object.assign({nombre:k},v):{nombre:k, jid:v}; });
  if(!Array.isArray(l)) return null;
  return l.map(function(a){ return typeof a==="string"?{nombre:a}:{nombre:String((a&&(a.nombre||a.name||a.n))||"").trim(), alias:String((a&&(a.alias||a.apodo||a.notify))||""), jid:String((a&&a.jid)||""), numero:String((a&&(a.numero||a.tel||a.telefono))||"")}; })   /* 230: con numero/jid para nombrar ids sueltos */
    .filter(function(a){ return a.nombre && !/^\+?\d[\d\s-]+$/.test(a.nombre); });
}
function cargaAgendaWA(alLlegar){
  if(window.AGENDA_WA || window.__agendaNo || window.__agendaPide) return;
  if(typeof APP_TOKEN==="undefined" || String(APP_TOKEN).indexOf("__")===0){ window.__agendaNo=1; return; }
  window.__agendaPide=1;
  fetch(PUSH+"?action=wa_agenda",{method:"POST", headers:{"content-type":"application/json","x-app-token":APP_TOKEN}, body:JSON.stringify({usuario:yo})})
    .then(function(r){ return r.json().catch(function(){ return {error:"HTTP "+r.status}; }); })
    .then(function(j){ window.__agendaPide=0; var l=_agendaDe(j); if(!l){ window.__agendaNo=1; return; } window.AGENDA_WA=l; if(alLlegar) try{ alLlegar(); }catch(e){} try{ reintentaDudas248(); }catch(e){} })
    .catch(function(){ window.__agendaPide=0; window.__agendaNo=1; });
}
function todosLosContactos(){
  var out=contactosConocidos(), vis={};
  out.forEach(function(c){ vis[c.id]=1; vis["n:"+_n179(c.nombre)]=1; });
  (window.AGENDA_WA||[]).forEach(function(a){ var id="ext:"+a.nombre, nn="n:"+_n179(a.nombre); if(vis[id]||vis[nn]) return;
    var kk=claveDe(a.nombre); if(kk && PERSONAS[kk] && _n179(PERSONAS[kk].nombre)===_n179(a.nombre)) return;
    vis[id]=vis[nn]=1; out.push({id:id, nombre:a.nombre, alias:a.alias||"", sub:"agenda de WhatsApp", n:0, ts:0}); });
  return out;
}
function buscaContactos(q, excl){
  var nq=_n179(q); if(!nq) return [];
  var ws=nq.split(" ").filter(Boolean); excl=excl||{};
  return todosLosContactos().map(function(c){
    if(excl[c.id]) return null;
    var hay=_n179(c.nombre+" "+(c.alias||"")+" "+(c.id.indexOf("ext:")===0?"":c.id+" "+((PERSONAS[c.id]||{}).apellido||""))), toks=hay.split(" ");
    if(!ws.every(function(w){ return toks.some(function(x){ return x.indexOf(w)===0; }) || (w.length>=3 && hay.indexOf(w)>=0); })) return null;
    var sc=(toks[0].indexOf(ws[0])===0?4:0)+(toks.some(function(x){ return x===ws[0]; })?2:0)+(c.id.indexOf("ext:")!==0?3:0)+Math.min(c.n||0,10)/5+(c.ts?1:0);
    return {c:c, sc:sc}; }).filter(Boolean).sort(function(a,b){ return (b.sc-a.sc) || String(a.c.nombre).localeCompare(String(b.c.nombre)); })
    .map(function(x){ return x.c; }).slice(0,40);
}
function haceCuanto(ts){ if(!ts) return ""; var d=Math.floor((Date.now()-ts)/86400000); return d<=0?"hablaron hoy":(d===1?"hablaron ayer":(d<14?"hace "+d+" días":(d<60?"hace "+Math.round(d/7)+" semanas":"hace "+Math.round(d/30)+" meses"))); }
/* candidatos para un nombre dicho ("Perlita" -> "Perla ...") */
function candidatosDe(nombre){
  var n=_n179(nombre).replace(/(it[oa]s?|cit[oa]s?)$/,""); if(n.length<3) n=_n179(nombre);
  return contactosConocidos().filter(function(c){
    return _n179(c.nombre).split(" ").some(function(w){ return w.indexOf(n)===0 || n.indexOf(w)===0 && w.length>=3; });
  }).sort(function(a,b){ return (b.n-a.n) || (b.ts-a.ts); });
}
/* "que estén Manuel, Cynthia y Perlita" / "con Manuel y Cynthia" */
function nombresDeIntegrantes(v){
  var s=String(v||""), m=s.match(/\b(?:que\s+est[eé]n|que\s+participen|integrantes?:?|involucra(?:dos)?\s+a|con\s+la\s+participaci[oó]n\s+de)\s+(.+)$/i);
  if(!m) return [];
  return m[1].replace(/[.;]+$/,"").split(/\s*,\s*|\s+y\s+|\s+e\s+/).map(function(x){ return x.replace(/^(a|al|la|el)\s+/i,"").trim(); })
    .filter(function(x){ return x && x.length>=2 && x.split(" ").length<=3; }).slice(0,8);
}
function propuestaIntegrantes(v){
  return nombresDeIntegrantes(v).map(function(nm){
    var cs=candidatosDe(nm);
    var dudoso = cs.length>1 && cs[0].n<=cs[1].n*1.5 && !(PERSONAS[cs[0].id]);
    return {dicho:nm, cands:cs, elegido:(cs.length && !dudoso)?cs[0].id:null};
  });
}
function abrePropuestaIntegrantes(t, prop){
  if(!prop || !prop.length) return;
  var bg=document.createElement("div"); bg.className="cnlbg";
  var s=document.createElement("div"); s.className="cnlsheet intsheet";
  function pinta(){
    var listo=prop.every(function(p){ return p.elegido || !p.cands.length; });
    s.innerHTML='<div class="hh"></div><div class="ith">NUEVA TAREA</div><div class="itn">'+esc(t.nombre)+'</div>'+
      prop.map(function(p,i){
        if(!p.cands.length) return '<div class="itr q"><span class="av">?</span><span class="ix"><b>'+esc(p.dicho)+'</b><small>no está en tus contactos de Doit</small></span></div>';
        if(!p.elegido) return '<div class="itr q"><span class="av">?</span><span class="ix"><b>¿Cuál '+esc(p.dicho)+'?</b><small>tienes '+p.cands.length+'</small></span></div>'+
          '<div class="itchips">'+p.cands.slice(0,4).map(function(c,j){ return '<button data-pk="'+i+'|'+j+'">'+esc(c.nombre)+'</button>'; }).join("")+'</div>';
        var c=p.cands.filter(function(x){ return x.id===p.elegido; })[0]||p.cands[0];
        return '<div class="itr"><span class="av">'+esc(iniInt(c.id))+'</span><span class="ix"><b>'+esc(c.nombre)+'</b><small>'+esc(c.sub+(c.ts?" · "+haceCuanto(c.ts):""))+'</small></span>'+
          (p.cands.length>1?'<button class="otro" data-otro="'+i+'">otro ▾</button>':'')+'<span class="ok">✓</span></div>';
      }).join("")+'<button class="itcrear"'+(listo?'':' disabled')+'>Crear</button>';
    Array.prototype.forEach.call(s.querySelectorAll("[data-pk]"),function(b){ b.onclick=function(){ var a=b.getAttribute("data-pk").split("|"); prop[+a[0]].elegido=prop[+a[0]].cands[+a[1]].id; pinta(); }; });
    Array.prototype.forEach.call(s.querySelectorAll("[data-otro]"),function(b){ b.onclick=function(){ prop[+b.getAttribute("data-otro")].elegido=null; pinta(); }; });
    var bc=s.querySelector(".itcrear"); if(bc) bc.onclick=function(){
      prop.forEach(function(p){ if(p.elegido) agregaIntegrante(t, p.elegido); });
      cierra(); toast("Listo: "+t.nombre); abreIntegrantes(t);
    };
  }
  function cierra(){ if(bg.parentNode) bg.parentNode.removeChild(bg); if(s.parentNode) s.parentNode.removeChild(s); }
  bg.onclick=cierra; pinta();
  document.body.appendChild(bg); document.body.appendChild(s);
}
/* pop-up de integrantes: sale cada vez que se agrega o quita a alguien */
function abreIntegrantes(t){
  var vieja=document.querySelector(".intsheet"); if(vieja){ var vb=document.querySelector(".cnlbg"); if(vb) vb.parentNode.removeChild(vb); vieja.parentNode.removeChild(vieja); }
  var bg=document.createElement("div"); bg.className="cnlbg";
  var s=document.createElement("div"); s.className="cnlsheet intsheet";
  function cierra(){ if(bg.parentNode) bg.parentNode.removeChild(bg); if(s.parentNode) s.parentNode.removeChild(s); if(vista==="hilo") render(); }
  function pinta(){
    var rolTx={hace:"hace la tarea",revisa:"revisa",opina:"participa",externo:"externo · WhatsApp"};
    s.innerHTML='<div class="hh"></div><div class="ith">INTEGRANTES</div><div class="itn">'+esc(t.nombre)+'</div>'+
      integrantesDe(t).map(function(x){
        var jefe=PERSONAS[x.k] && jefeDe(x.k, t.duenio);
        return '<div class="itr"><span class="av">'+esc(iniInt(x.k))+'</span><span class="ix"><b>'+esc(nombreInt(x.k))+(x.k===yo?' (tú)':'')+'</b><small>'+esc(rolTx[x.rol]||"")+(jefe?' · jefe':'')+'</small></span>'+
          (puedeQuitar(t,x.k)?'<button class="itdel" data-qk="'+esc(x.k)+'" aria-label="Quitar">'+(typeof svgBote==="function"?svgBote():ico("trash",18))+'</button>':'')+'</div>';
      }).join("")+'<button class="itadd">+ Agregar</button>';
    Array.prototype.forEach.call(s.querySelectorAll("[data-qk]"),function(b){ b.onclick=function(){ var k=b.getAttribute("data-qk"); if(quitaIntegrante(t,k)){ toast("Quité a "+nombreInt(k)); pinta(); } }; });
    s.querySelector(".itadd").onclick=function(){
      var ya={}; integrantesDe(t).forEach(function(x){ ya[x.k]=1; });
      /* build 219: lupa arriba; vacia = los recientes de siempre; con texto = TODOS los contactos */
      s.innerHTML='<div class="hh"></div><div class="ith">AGREGAR A</div><div class="itn">'+esc(t.nombre)+'</div>'+
        '<label class="itbus">'+ico("lupa",18,1.8)+'<input id="itq" type="search" placeholder="Buscar en todos tus contactos" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"></label>'+
        '<div class="itlst"></div><div class="itnota">O díctalo: “agrega a Perla a esta tarea”.</div>';
      var lst=s.querySelector(".itlst"), inp=s.querySelector("#itq");
      function lista(){
        var q=inp.value, cs=String(q).trim()?buscaContactos(q, ya):contactosConocidos().filter(function(c){ return !ya[c.id]; }).sort(function(a,b){ return (b.n-a.n)||(b.ts-a.ts); }).slice(0,12);
        lst.innerHTML=cs.length?cs.map(function(c){ return '<button class="itr itpick" data-ak="'+esc(c.id)+'"><span class="av">'+esc(iniInt(c.id))+'</span><span class="ix"><b>'+esc(c.nombre)+'</b><small>'+esc(c.sub+(c.ts?" · "+haceCuanto(c.ts):""))+'</small></span></button>'; }).join(""):
          '<div class="itvacio">No encontré “'+esc(String(q).trim())+'”'+(window.AGENDA_WA?'':' · la agenda completa de WhatsApp aún no está en Doit')+'</div>';
        Array.prototype.forEach.call(lst.querySelectorAll("[data-ak]"),function(b){ b.onclick=function(){ agregaIntegrante(t,b.getAttribute("data-ak")); toast("Agregué a "+nombreInt(b.getAttribute("data-ak"))); pinta(); }; });
      }
      inp.oninput=lista; lista();
      cargaAgendaWA(function(){ if(inp.isConnected && String(inp.value).trim()) lista(); });
      try{ inp.focus(); }catch(e){}
    };
  }
  bg.onclick=cierra; pinta();
  document.body.appendChild(bg); document.body.appendChild(s);
}
/* dentro de la tarea: "agrega a Cynthia" / "quita a Pedro de esta tarea" */
function integranteDicho(t, v){
  var s=String(v||"").trim(), m;
  if((m=s.match(/^(?:agrega|agr[eé]gale|mete|m[eé]tele|suma|añade|incluye|invita)\s+a\s+(.+?)(?:\s+(?:a|en)\s+(?:esta|la)\s+tarea)?[.!]?$/i))){
    var nm=m[1].trim(), cs=candidatosDe(nm);
    if(cs.length===1 || (cs.length>1 && cs[0].n>cs[1].n*1.5)){ agregaIntegrante(t, cs[0].id); toast("Agregué a "+cs[0].nombre); abreIntegrantes(t); return true; }
    abrePropuestaIntegrantes(t, [{dicho:nm, cands:cs, elegido:null}]); return true;
  }
  if((m=s.match(/^(?:quita|s[aá]ca|elimina|borra)\s+a\s+(.+?)\s+(?:de|en)\s+(?:esta|la)\s+tarea[.!]?$/i))){
    var nm2=_n179(m[1]), hit=integrantesDe(t).filter(function(x){ return _n179(nombreInt(x.k)).indexOf(nm2.split(" ")[0])===0; })[0];
    if(!hit){ toast(m[1]+" no está en esta tarea"); abreIntegrantes(t); return true; }
    if(!puedeQuitar(t,hit.k)){ toast(t.duenio!==yo?"Solo el dueño de la tarea puede quitar gente":("A "+nombreInt(hit.k)+" no se le puede quitar")); abreIntegrantes(t); return true; }
    quitaIntegrante(t,hit.k); toast("Quité a "+nombreInt(hit.k)); abreIntegrantes(t); return true;
  }
  return false;
}

/* ---------- compartidas ---------- */
function compartidasDe(){
  return tareas.filter(function(t){
    if(t.cierre || estadoReal(t)==="cerrada" || t.es_recordatorio || t.fusionada_en) return false;
    if(t.duenio===yo) return false;
    try{ if(leToca(t)) return false; }catch(e){}
    return integrantesDe(t).some(function(x){ return x.k===yo; });
  });
}
function vCompartidas(){
  var cs=compartidasDe(); if(!cs.length) return "";
  var h='<button class="compbtn" id="bcomp">Compartidas · '+cs.length+' '+(window.__verComp?'▴':'›')+'</button>';
  if(window.__verComp){
    h+='<div class="revl">'+cs.map(function(t){
      var p=preguntaParaMi(t), q=(PERSONAS[t.duenio]&&PERSONAS[t.duenio].nombre)||"";
      return '<button class="revr" data-id="'+esc(t.id)+'"><i style="background:'+(p?'#ff9f0a':'#636366')+'"></i><span class="rn">'+esc(t.nombre||"")+(q?' · '+esc(q):'')+'</span><span class="rl" style="color:'+(p?'#ff9f0a':'var(--ink-3)')+'">'+(p?esc(p.de+" te pregunta"):"")+'</span></button>';
    }).join("")+'</div>';
  }
  return h;
}

/* ---------- ¿me preguntan algo? ---------- */
function misNombres(){
  var p=PERSONAS[yo]||{}, l=[_n179(p.nombre)].concat((p.apodos||[]).map(_n179));
  if(yo==="salvador") l=l.concat(["chava","jefe","patron","lic","licenciado","ingeniero","inge"]);
  return l.filter(Boolean);
}
function PIDE_RXf(){ return /\?|¿|\b(autoriza|autorizas|me (pasas|mandas|confirmas|dices|apruebas)|necesito|ocupo|pasame|mandame|confirmame|dime|que opinas|como ves|le doy|lo compro|cuanto|cual|apruebas|vobo|visto bueno)\b/; }
/* la ultima pregunta o pedido de OTRO dirigido a mi, que no he contestado bien */
/* build 260: ¿este mensaje es de OTRO tema? movido_de, o la Mac dudó de la tarea (apunta a otra), o la tarea ya tiene historia y el mensaje no comparte ni una raíz de palabra con su nombre/contexto/pasos (y no es respuesta directa a lo último que dijo Salvador) */
function temaAjeno260(t, y, respondeAlUltimo){
  if(!y) return false; if(y.movido_de) return true;
  if(y.duda_tarea && !y.duda_resuelta) return false;   /* con duda de la Mac, la tarjeta ofrece OK · Mover · Nueva: ahí se acomoda */
  try{ if(dudasDeNotas237(t).some(function(d){ return _n179(d.c).split(" ")[0]===_n179(y.wa_c||"").split(" ")[0]; })) return false; }catch(e){}
  if(y.cita || !historiaTarea259(t)) return false;
  var cuerpo=String(y.tr||y.t||"").replace(/^\s*[^:\n]{1,40}:\s*/,""), ms=stems259(cuerpo); if(ms.length<2) return false;
  var base=stems259([t.nombre, contextoDe(t)||t.contexto||"", (t.lista_pasos||[]).map(function(p){ return p&&p.tx; }).join(" ")].join(" "));
  if(ms.length<3 || ms.some(function(w){ return base.indexOf(w)>=0; })) return false;
  var c0=_n179(y.wa_c||"").split(" ")[0]; if(c0 && (t.wa_contactos||[]).some(function(w){ return _n179((w&&w.nombre)||w||"").split(" ")[0]===c0; })) return false;   /* un contacto de la tarea no es ajeno */
  var c=_n179(y.wa_c||"").split(" ")[0];   /* ¿quien lo manda ya hablaba del tema de esta tarea? entonces no es ajeno */
  if(c && (t.msgs||[]).some(function(m){ if(!m || m===y || m.oculto || m.movido_de || _n179(m.wa_c||"").split(" ")[0]!==c) return false; return stems259(String(m.t||"").replace(/^\s*[^:\n]{1,40}:\s*/,"")).some(function(w){ return base.indexOf(w)>=0; }); })) return false;
  return true;
}
