/* "MUY CARO" — no es un "no" seco. Claude mira el monto y el concepto y propone
   2-3 caminos concretos para bajarlo o resolverlo (pedir descuento y de cuánto,
   más cotizaciones, reducir alcance, posponer). El jefe escoge y eso se le manda
   a la persona. Salvador 2026-09-04. */
function muyCaro(t){
  negociar={id:t.id, cargando:true}; render();
  var defecto=["Pide 10-15% de descuento y dime cuánto lograste",
               "Consigue otras 2 cotizaciones para comparar",
               "Reduce el alcance o pospón lo que no urge"];
  if(APP_TOKEN.indexOf("__")===0){ negociar={id:t.id, mensaje:"¿Cómo lo bajamos?", ops:defecto}; render(); return; }
  var sys="Eres el asesor del jefe de una oficina. Le pidieron autorizar un gasto y "+
    "se le hace CARO. Propon 2 o 3 caminos CONCRETOS y cortos para bajarlo o "+
    "resolverlo: pedir descuento (di un % o monto objetivo), pedir mas cotizaciones "+
    "si aplica, reducir el alcance, o posponer parte. Cada opcion es la instruccion "+
    "que se le mandaria a la persona, en imperativo corto (max 9 palabras). "+
    "CONTESTA SOLO JSON: {\"mensaje\":\"<una linea>\",\"opciones\":[\"..\",\"..\",\"..\"]}\n\n"+
    "GASTO: "+(t.gasto||"(sin monto)")+"\nCONCEPTO: "+(t.revisar||t.nombre||"")+
    "\nULTIMO MENSAJE: "+(((t.msgs||[]).filter(function(x){return x.k==="bo"}).slice(-1)[0]||{}).t||"");
  preguntaAClaude([{role:"user",content:sys}],"rapido",function(txt,err){
    if(negociar==null||negociar.id!==t.id) return;   /* ya se salió */
    var j=null; try{ var m=txt&&txt.match(/\{[\s\S]*\}/); j=m?JSON.parse(m[0]):null }catch(e){}
    var ops=(j&&j.opciones&&j.opciones.length)?j.opciones.slice(0,3):defecto;
    negociar={id:t.id, mensaje:(j&&j.mensaje)||"¿Cómo lo bajamos?", ops:ops};
    render();
  });
}

function jefeResponde(t,txt){
  negociar=null;
  msg(t,"bi","Salvador contestó: “"+txt+"”.");
  t.ultima="Salvador: "+txt; t.estado="abierta"; t.espera=null; t.espera_a=null;
  t.pregunta="Salvador dijo “"+txt+"”. ¿Cómo le sigues?";
  t.ops=[{t:"Ya con eso sigo",r:"Va. Te pido la evidencia cuando termines."},
         {t:"Necesito algo más",r:"Dime qué y se lo paso."}];
  guarda(t);
}


/* ---- cerrar: el criterio manda, no el botón ---- */
/* build 151: que falta para cerrar. Ticket = 1 evidencia basta (antes pedia 2);
   si toda la lista de pasos esta palomeada (Costco), la evidencia no se exige. */
/* build 241 (Salvador 21:52, "Foto Anuario Colegio"): una orden de cerrar de Salvador (o del dueño que es jefe) cierra SIEMPRE.
   La condición de cierre solo frena cuando cierra OTRA persona o la IA en automático. Si la puso la IA, se ignora; si la puso
   Salvador, cierra igual y se anota "cerrada sin <condición> por orden tuya". */
function cierreLibre(t){ var p=PERSONAS[yo]||{}; return !!yo && (yo==="salvador" || (p.jefe && !p.prueba) || (t && t.duenio===yo && p.jefe)); }
function condicionDeIA(t){ return !!t && (!!t.cierra_sugerido || t.creada_por==="ia_revisor" || t.creada_por==="claude" || /_revisor$/.test(String(t.origen||""))); }
function faltanParaCerrar(t){
  var f=faltanParaCerrar0(t); if(!f.length || !cierreLibre(t)) return f;
  if(!condicionDeIA(t)) t.__cerradaSin241=f.map(function(x){ return String(x).replace(/^faltan? /,""); }).join(" y ");
  return [];
}
function faltanParaCerrar0(t){
  var faltan=[];
  var lp=t.lista_pasos||[];
  var todoPalomeado=lp.length>0 && lp.every(function(p){return p.hecho});
  if(t.puntos){ var n=Object.keys(t.marcados||{}).length;
    if(n<t.puntos.length) faltan.push("faltan "+(t.puntos.length-n)+" puntos del rondín") }
  if(todoPalomeado) return faltan;
  if(/foto/i.test(t.cierra||"") && !(t.evidencias&&t.evidencias.length) && !t.puntos) faltan.push("falta la foto");
  if(/ticket/i.test(t.cierra||"") && !(t.evidencias&&t.evidencias.length)) faltan.push("falta el ticket");
  return faltan;
}
function intentaCerrar(t){
  var faltan=faltanParaCerrar(t);
  if(faltan.length){
    msg(t,"bi","Todavía no la puedo cerrar: "+faltan.join(" y ")+". Eso fue lo que se escribió cuando nació la tarea.");
    guarda(t); return false;
  }
  if(t.pasos && (t.paso||0) < t.pasos.length-1){
    t.paso=(t.paso||0)+1; t.estado="espera_dia";
    t.ultima="Siguiente paso: "+t.pasos[t.paso].t;
    msg(t,"bi","Listo. Te desaparezco de la lista hasta que toque: "+t.pasos[t.paso].t+". La fecha final no se movió.");
    guarda(t); return true;
  }
  cierraHecha(t);
  return true;
}

/* ============ PANTALLAS NUEVAS ============ */
function encabezado(titulo,sub){
  return '<div class="top"><button class="iconbtn" id="bback">‹</button>'+
    '<div><div class="t">'+esc(titulo)+'</div><div class="d">'+esc(sub||"")+'</div></div></div>';
}
function listaPersonas(exceptuar){
  return Object.keys(PERSONAS).filter(function(k){return k!==exceptuar})
    .map(function(k){ return '<button class="op" data-pers="'+k+'">'+esc(PERSONAS[k].nombre)+'</button>' }).join("");
}

/* pedirle a alguien que haga ESTA tarea */
function vEncargar(){
  var t=tareas.filter(function(x){return x.id===abierta})[0];
  if(!t){vista="lista";return vLista()}
  return encabezado("¿Quién lo hace?", t.nombre)+
    '<div class="scroll"><div class="adm">'+
    '<p>La tarea <b>sigue siendo tuya</b>. Si no contesta, te aviso todos los días.</p>'+
    '<div class="sug">'+listaPersonas(yo)+'</div>'+
    '<div id="encpaso2" style="display:none"><h2 style="margin-top:18px">¿Qué le pides?</h2>'+
    '<textarea class="inp2" id="enctxt" rows="3" placeholder="Confirma que llegó la pipa hoy, con foto del tanque."></textarea>'+
    '<div class="sug"><button class="op k" id="encmandar">Mandar</button></div></div>'+
    '</div></div>';
}

/* encargo suelto: no cuelga de ninguna tarea */
function vSuelto(){
  return encabezado("Pedirle algo a alguien","No crea tarea. Se mide en horas.")+
    '<div class="scroll"><div class="adm">'+
    '<div class="sug">'+listaPersonas(yo)+'</div>'+
    '<div id="encpaso2" style="display:none"><h2 style="margin-top:18px">¿Qué le pides?</h2>'+
    '<textarea class="inp2" id="enctxt" rows="3" placeholder="Háblale al proveedor hoy antes de las 2 y dime qué te dijo."></textarea>'+
    '<div class="sug"><button class="op k" id="encmandar">Mandar</button></div></div>'+
    '</div></div>';
}

/* el encargo, visto por quien lo recibió */
function vEncargo(){
  var e=encargos.filter(function(x){return x.id===encAbierto})[0];
  if(!e){vista="lista";return vLista()}
  marcaVistoEncargo(e);
  var venc=dDif(e.limite,hoy())>0;
  return encabezado(PERSONAS[e.de].nombre+" te encargó", e.tarea||"Encargo suelto")+
    '<div class="scroll"><div class="msgs">'+
    '<div class="b bi">'+esc(e.texto)+'<span class="st">para el '+esc(e.limite)+'</span></div>'+
    '<div class="b bi">'+(e.tarea
       ? 'La tarea sigue siendo de '+esc(PERSONAS[e.de].nombre)+'. Tú nomás confirmas y le llega.'
       : 'Es un encargo suelto: contestas una línea y se cierra.')+
     '</div>'+
    (venc?'<div class="b bal">Ya se pasó la fecha. Contesta hoy aunque sea para decir que no se pudo.</div>':'')+
    '</div></div>'+
    '<div class="comp"><div class="ir2">'+
    '<textarea class="inp" id="txtenc" rows="1" placeholder="¿Qué pasó? Una línea basta…"></textarea>'+
    '<button class="snd" id="bsendenc">↑</button></div></div>';
}

/* cierre con motivo */
function vCerrarMotivo(){
  var t=tareas.filter(function(x){return x.id===abierta})[0];
  if(!t){vista="lista";return vLista()}
  return encabezado("Esto ya no se va a hacer", t.nombre)+
    '<div class="scroll"><div class="adm">'+
    ((PERSONAS[yo].jefe && t.duenio!==yo)
      ? '<p>Es de '+esc(PERSONAS[t.duenio].nombre)+'. <b>Cancelarla tú no le cuenta en contra</b> — no fue su decisión.</p>'
      : '<p>Dime qué pasó. <b>“Se me pasó” es una respuesta válida</b> y vale más que una excusa inventada.</p>')+
    '<div class="sug" style="flex-direction:column">'+
      motivosPara(t).map(function(m){
        return '<button class="op" data-mot="'+m.k+'">'+esc(m.t)+'</button>' }).join("")+
    '</div></div></div>';
}

/* transferencia PERMANENTE */
function vTransferir(){
  var t=tareas.filter(function(x){return x.id===abierta})[0];
  if(!t){vista="lista";return vLista()}
  return encabezado("Pasársela a alguien", t.nombre)+
    '<div class="scroll"><div class="adm">'+
    '<p><b>Esto es definitivo.</b> Cambia el dueño para siempre — se usa cuando el trabajo de verdad cambió de manos, no para un viaje. '+
    'Si te vas de viaje, lo que se hace es mover la fecha antes de que venza, o encargarla.</p>'+
    '<div class="sug">'+listaPersonas(t.duenio)+'</div>'+
    '</div></div>';
}

/* yo: aquí vive la suplencia. Una vez por viaje, no una vez por tarea. */
function vYo(){
  var s=suplencias[yo], c=contadorEncargos(yo), nlc=noLeContestan(yo);
  var h=encabezado(PERSONAS[yo].nombre,"Tu cuenta")+
    '<div class="scroll"><div class="adm">';
  var mp=PERSONAS[yo]||{};
  h+='<h2>Tus datos</h2><div class="card">'+
     '<h3>'+esc((mp.nombre||"")+" "+(mp.apellido||""))+' \u00b7 '+esc(mp.ini||"")+'</h3>'+
     '<div class="sm">'+esc(mp.mail_trabajo||"sin correo de trabajo")+
     (mp.mail_personal?'<br>'+esc(mp.mail_personal):'')+'</div>'+
     '<div class="acts"><button class="mini" id="bficha">Corregir</button></div></div>';
  h+=cardAvisos();
  h+='<h2>Horas</h2><div class="card"><div class="sm">C\u00f3mo se ven las horas de tus recordatorios y avisos.</div>'+
     '<div class="acts"><button class="mini" id="bfmt12"'+(fmt24()?'':' disabled')+'>4:35 PM</button> '+
     '<button class="mini" id="bfmt24"'+(fmt24()?' disabled':'')+'>16:35</button></div></div>';
  h+='<h2>Voy a estar fuera</h2>';
  if(s && estaFuera(yo)){
    h+='<div class="card"><h3>Fuera del '+esc(s.desde)+' al '+esc(s.hasta)+'</h3>'+
       '<div class="sm">Cubre '+esc(PERSONAS[s.suplente].nombre)+' · autoriza hasta '+s.tope+
       '. Arriba de eso: '+(s.arriba==="marca"?"te marca":"se espera a que regreses")+'.</div>'+
       '<div class="acts"><button class="mini" id="bquitasup">Ya regresé</button></div></div>';
  } else {
    h+='<p>Tus tareas <b>no cambian de dueño</b>. Lo que se desvía son tus autorizaciones, para que no se atore una decisión mientras no estás.</p>'+
       '<div class="card">'+
       '<div class="fr"><label>Del</label><input class="in" id="supd" type="date" value="'+hoy()+'"></div>'+
       '<div class="fr"><label>Al</label><input class="in" id="suph" type="date" value="'+dm(7)+'"></div>'+
       '<div class="fr"><label>Cubre</label><select class="in" id="sups">'+
         Object.keys(PERSONAS).filter(function(k){return k!==yo})
           .map(function(k){return '<option value="'+k+'">'+esc(PERSONAS[k].nombre)+'</option>'}).join("")+
       '</select></div>'+
       '<div class="fr"><label>Autoriza hasta</label><input class="in" id="supt" type="number" inputmode="numeric" value="5000"></div>'+
       '<div class="fr"><label>Arriba de eso</label><select class="in" id="supa">'+
         '<option value="espera">Se espera a que regrese</option>'+
         '<option value="marca">Me marca por teléfono</option></select></div>'+
       '<div class="acts"><button class="mini" id="bponsup">Guardar</button></div></div>';
  }
  h+='<h2 style="margin-top:22px">Tus encargos</h2>'+
     '<div class="card"><div class="sm">'+
     'A tiempo: <b>'+c.a_tiempo+'</b> · Tarde: <b>'+c.tarde+'</b><br>'+
     'Sin contestar: <b>'+c.sin_contestar+'</b> · Ni abiertos: <b>'+c.ni_abierto+'</b>'+
     '</div></div>';
  if(PERSONAS[yo].jefe)
    h+='<div class="card"><h3>Encargos tuyos sin respuesta</h3><div class="sm">'+nlc+
       '. Si este número crece, no es problema de tareas: es que no te contestan.</div></div>';
  h+='<h2 style="margin-top:22px">Sesión</h2><div class="card"><div class="sm">Entraste con '+esc(mp.mail_trabajo||mp.mail_personal||"tu cuenta de Google")+'.</div>'+
     '<div class="acts"><button class="mini" id="bsalir">Cerrar sesión</button></div></div>';
  return h+'</div></div>';
}

/* LA FOTO RECIEN TOMADA — 2026-09-03.
   Una foto sola no dice nada: hay que saber de que es. En vez de una lista de
   tareas para escoger (que obliga a leer), se pregunta hablando, igual que todo
   lo demas, y Claude decide si va pegada a una tarea que ya existe o si abre una. */
function vFoto(){
  var f=fotoEnMano||{};
  return encabezado("\u00bfDe qu\u00e9 es esta foto?","Dilo hablando y yo la acomodo")+
    '<div class="scroll"><div class="adm">'+
    (f.data?'<img src="'+f.data+'" style="width:100%;border-radius:12px;display:block">':'')+
    '<p style="margin-top:14px">Ejemplos: <i>\u201ces el recibo de las pipas\u201d</i> \u00b7 '+
    '<i>\u201cas\u00ed qued\u00f3 el aspersor 11\u201d</i> \u00b7 <i>\u201cabre tarea: hay que cambiar esta reja\u201d</i>.</p>'+
    '</div></div>'+barraPie();
}
/* la ficha: se pide una sola vez, o se corrige desde "Tu cuenta" */
function vFicha(primera){
  var p=PERSONAS[yo]||{};
  return encabezado(primera?"Antes de empezar":"Tus datos",
      primera?"Se pregunta una vez y ya":"Corrige lo que haga falta")+
    '<div class="scroll"><div class="adm">'+
    (primera
      ? '<p>Con tu <b>apellido</b> salen las iniciales que ven los demas junto a cada tarea. '+
        'Sin el, dos Samueles se ven igual.</p>'
      : '<p>Tus iniciales salen del nombre y el apellido.</p>')+
    '<div class="card">'+
      '<div class="fr"><label>Nombre</label><input class="in" id="fnom" type="text" '+
        'autocomplete="off" value="'+esc(p.nombre||"")+'"></div>'+
      '<div class="fr"><label>Apellido</label><input class="in" id="fape" type="text" '+
        'autocomplete="off" value="'+esc(p.apellido||"")+'"></div>'+
      '<div class="fr"><label>Correo del trabajo</label><input class="in" id="fmt" type="email" '+
        'inputmode="email" autocapitalize="off" autocomplete="off" value="'+esc(p.mail_trabajo||"")+'"></div>'+
      '<div class="fr"><label>Correo personal</label><input class="in" id="fmp" type="email" '+
        'inputmode="email" autocapitalize="off" autocomplete="off" value="'+esc(p.mail_personal||"")+'"></div>'+
      '<div class="acts"><button class="mini" id="fguarda">Guardar</button></div>'+
    '</div>'+
    '<div class="card"><div class="sm">Aqui <b>nunca</b> va una contrase\u00f1a ni un NIP. '+
      'Si alguien te la pide en esta pantalla, no es esta app.</div></div>'+
    '</div></div>';
}
function bindFicha(primera){
  if(!primera){ var bb=$("bback"); if(bb) bb.onclick=function(){ vista="yo"; render() } }
  var g=$("fguarda"); if(g) g.onclick=function(){
    var d={nombre:$("fnom").value, apellido:$("fape").value,
           mail_trabajo:$("fmt").value, mail_personal:$("fmp").value};
    if(!d.nombre.trim() || !d.apellido.trim()){ toast("Falta nombre y apellido"); return }
    if(!/.+@.+\..+/.test(d.mail_trabajo.trim())){ toast("Falta tu correo del trabajo"); return }
    avisaSiLlego(guardaFicha(yo, d), "Listo. Tus iniciales son "+PERSONAS[yo].ini, "No se pudo guardar tu ficha: revisa tu conexión");
    vista="lista"; render();
  };
}

/* ============ RENDER ============ */
/* UN CAMPO A MEDIO ESCRIBIR NO SE BORRA. render() reemplaza #app completo. Si llegaba uno de fondo (el sondeo del servidor
   que trae cambios, una respuesta de Claude, un reloj) mientras se escribía en un campo de #app —el nombre de una tarea o de
   un dato (⋯ → Cambiar nombre), «Tus datos», la fecha de la agenda— el campo se destruía: se cerraba el teclado y lo escrito
   se perdía o se guardaba a medias. Justo después de acomodar algo de la Bandeja es cuando más pasa, porque lo recién guardado
   regresa en el siguiente sondeo. Ahora ese repintado de fondo espera a que se termine de escribir; lo que hace la persona
   (tocar fuera del campo, o una tecla dentro de él, como Enter = guardar) repinta de inmediato. La barra de escribir (.pie)
   tiene su propio manejo en pintaHilo y no entra aquí. */
var EDICION={pendiente:false, toqueFuera:0, enEvento:false, actividad:0, montado:false};
var EDICION_TOPE_MS=120000;   /* un campo olvidado con el foco no congela la pantalla para siempre */
function campoEnEdicion(){
  var ae=document.activeElement, app=$("app");
  if(!ae || !app || ae===document.body || !app.contains(ae)) return null;
  if(!/^(INPUT|TEXTAREA)$/.test(ae.tagName)) return null;
  if(/^(button|checkbox|radio|submit|reset|range|file|color|hidden)$/i.test(ae.type||"")) return null;
  if(ae.closest && ae.closest(".pie")) return null;
  return ae;
}
function montaEdicionUnaVez(){
  if(EDICION.montado || typeof document==="undefined") return; EDICION.montado=true;
  var fuera=function(ev){ var c=campoEnEdicion(); if(c && !(ev.target && c.contains(ev.target))) EDICION.toqueFuera=Date.now(); };
  ["pointerdown","touchstart","mousedown"].forEach(function(n){ document.addEventListener(n, fuera, true); });
  document.addEventListener("click", function(ev){ var c=campoEnEdicion(); if(c && !(ev.target && c.contains(ev.target))){ EDICION.enEvento=true; setTimeout(function(){ EDICION.enEvento=false; }, 0); } }, true);
  var propio=function(ev){ var c=campoEnEdicion(); if(c && ev.target===c){ EDICION.enEvento=true; EDICION.actividad=Date.now(); setTimeout(function(){ EDICION.enEvento=false; }, 0); } };
  ["keydown","input","change","compositionend"].forEach(function(n){ document.addEventListener(n, propio, true); });
  document.addEventListener("focusin", function(){ if(campoEnEdicion()) EDICION.actividad=Date.now(); }, true);
  /* al soltar el campo se pinta lo que quedó pendiente; espera un momento para no robarle el clic al botón que se tocó */
  document.addEventListener("focusout", function(){ if(!EDICION.pendiente) return;
    setTimeout(function(){ if(EDICION.pendiente && !campoEnEdicion()){ EDICION.pendiente=false; render(); } }, 400); }, true);
}
function posponerRender(){
  montaEdicionUnaVez();
  var c=campoEnEdicion(); if(!c) return false;
  if(EDICION.enEvento || Date.now()-EDICION.toqueFuera<1500) return false;
  if(EDICION.actividad && Date.now()-EDICION.actividad>EDICION_TOPE_MS) return false;
  EDICION.pendiente=true; return true;
}
function render(){
  if(posponerRender()) return;
  EDICION.pendiente=false;
  try{ barreNotifs(); }catch(e){}   /* build 268: cierra las notificaciones de lo ya resuelto (cada 20 s como mucho) */
  cierraDudaHilo();
  if(vista!=="hilo" && vista!=="galeria") window.__visitaDe=null;   /* build 197: salir de la tarea termina la visita */
  /* build 235: cada vez que se abre una tarea, el filtro arranca en Importante */
  var _ab235=(vista==="hilo"||vista==="galeria")?abierta:null; if(_ab235!==window.__ab235){ if(_ab235 && window.__vf230) delete window.__vf230[_ab235]; window.__ab235=_ab235; if(_ab235){ try{ hist240("Abrió la tarea", tareaId240(_ab235), null); }catch(e){} } }
  var a=$("app");
  /* LA PUERTA DE LA FICHA. Solo se cruza cuando Firestore ya contesto: si esta
     sin internet NO se le pide nada, porque no se podria guardar. */
  if(vista==="ficha"){ a.innerHTML=vFicha(false); bindFicha(false); return }
  if(db && fichasLeidas && !fichaCompleta(yo)){
    a.innerHTML=vFicha(true); bindFicha(true); return;
  }
  if(vista==="persona"){a.innerHTML=vPersona();bindPersona();return}
  if(vista==="admin"){a.innerHTML=vAdmin();bindAdmin();return}
  if(vista==="yo"){a.innerHTML=vYo();bindYo();return}
  if(vista==="notif"){a.innerHTML=vNotif();bindNotif();return}
  if(vista==="voces"){a.innerHTML=vVoces();bindVoces();return}
  if(vista==="historial"){a.innerHTML=vHistorial();bindHistorial();return}
  if(vista==="encargo"){a.innerHTML=vEncargo();bindEncargo();return}
  if(vista==="encargar"){a.innerHTML=vEncargar();bindPedir(abierta);return}
  if(vista==="suelto"){a.innerHTML=vSuelto();bindPedir(null);return}
  if(vista==="barra"){a.innerHTML=vBarra();bindBarra();return}
  if(vista==="foto"){a.innerHTML=vFoto();bindLista();return}
  if(vista==="cerrarmotivo"){a.innerHTML=vCerrarMotivo();bindMotivo();return}
  if(vista==="transferir"){a.innerHTML=vTransferir();bindTransferir();return}
  if((vista==="hilo"||vista==="galeria")&&abierta){
    window.__saltoActivo=false; pintaHilo(a); bindHilo();
    a.classList.toggle("salto", !!window.__saltoActivo);
    a.classList.toggle("salto-cierre", !!window.__saltoCierre);
    return }
  a.classList.remove("salto");
  var _sc=a.querySelector(".scroll"), _scTop=_sc?_sc.scrollTop:0;
  a.innerHTML=vLista(); bindLista();
  var _sc2=a.querySelector(".scroll"); if(_sc2) _sc2.scrollTop=_scTop;
}
/* EL TECLADO NO SE CIERRA AL MANDAR — Salvador 2026-09-24. Antes cada render()
   reemplazaba TODO el hilo, la caja de escribir incluida; al destruirla el
   telefono cerraba el teclado en el acto. Como WhatsApp: si la caja tiene el
   foco y sigue siendo la misma tarea, se repinta todo MENOS la barra (.pie),
   que se queda viva en su lugar. Solo cambia su placeholder. */
function pintaHilo(a){
  var oldPie=a.querySelector(".comp > .pie"), ae=document.activeElement;
  var keep=vista==="hilo" && oldPie && a.__hiloId===abierta && ae && oldPie.contains(ae);
  if(!keep){ a.innerHTML=vHilo(); a.__hiloId=abierta; return; }
  var tmp=document.createElement("div"); tmp.innerHTML=vHilo();
  var newComp=tmp.querySelector(".comp"), newPie=newComp&&newComp.querySelector(".pie");
  if(!newPie){ a.innerHTML=tmp.innerHTML; a.__hiloId=abierta; return; }
  var oldComp=oldPie.parentNode;
  Array.prototype.slice.call(a.childNodes).forEach(function(n){ if(n!==oldComp) a.removeChild(n); });
  Array.prototype.slice.call(oldComp.childNodes).forEach(function(n){ if(n!==oldPie) oldComp.removeChild(n); });
  var despues=false;
  Array.prototype.slice.call(tmp.childNodes).forEach(function(n){
    if(n===newComp){
      Array.prototype.slice.call(newComp.childNodes).forEach(function(c){ if(c!==newPie) oldComp.insertBefore(c, oldPie); });
      despues=true;
    } else if(!despues) a.insertBefore(n, oldComp); else a.appendChild(n);
  });
  var ot=oldPie.querySelector("#txt"), nt=newPie.querySelector("#txt");
  if(ot&&nt) ot.setAttribute("data-ph", nt.getAttribute("data-ph")||"");
  a.__hiloId=abierta;
}
function volver(){ vista=abierta?"hilo":"lista"; menuOpen=false; render() }

/* SWIPE ENTRE TAREAS — Salvador 2026-09-17. Dentro de una tarea o recordatorio,
   deslizar a la izquierda pasa a la SIGUIENTE y a la derecha a la ANTERIOR, en el
   MISMO orden en que están pintadas en la lista (window.ordenSwipe, que se arma en
   bindLista leyendo el DOM). Así no hay que volver al home para brincar de una a
   otra: los botones de "ya la hice / no" van a la mano en cada una. */
function swipeATarea(dir){
  var ord=window.ordenSwipe||[]; if(!ord.length) return;
  var i=ord.indexOf(abierta); if(i<0) return;
  var j=i+dir;
  if(j<0){ toast("Es la primera"); return }
  if(j>=ord.length){ toast("Es la última"); return }
  var sig=tareas.filter(function(x){return x.id===ord[j]})[0];
  if(!sig){ return }
  abierta=ord[j]; vista="hilo"; fichaOpen=false; detOpen={}; menuOpen=false; editaNombre=null;
  render();
}
/* Se monta UNA sola vez: #app es un elemento estable, así que sus listeners
   sobreviven a los render(); si se re-montara en cada bindHilo se dispararían
   varias veces. El handler lee el estado vivo (vista, abierta). */
function montaSwipeUnaVez(){
  if(window.__swipeOn) return; window.__swipeOn=true;
  var app=$("app"); if(!app) return;
  var x0=0,y0=0,t0=0,ok=false;
  function zonaViva(el){
    return !!(el&&el.closest&&el.closest('input,textarea,[contenteditable="true"],.caja,.barra,.pie,.galgrid,.tira,.hoja,.top,button,[data-mix],[data-hab],.cnlsheet'));
  }
  /* Como WhatsApp: el teclado se cierra al tocar cualquier parte que no sea
     la barra de escribir ni un boton (Salvador 2026-09-24). */
  app.addEventListener('touchend',function(ev){
    var ae=document.activeElement;
    if(!(ae && ae.id==="txt" && ae.isContentEditable)) return;
    var el=ev.target;
    if(el && el.closest && el.closest('.pie,.sug,.hoja,button,input,textarea,[contenteditable="true"]')) return;
    ae.blur();
  },{passive:true});
  app.addEventListener('touchstart',function(ev){
    ok=false;
    if(vista!=="hilo") return;
    if(!ev.touches||ev.touches.length!==1) return;
    if(zonaViva(ev.target)) return;
    x0=ev.touches[0].clientX; y0=ev.touches[0].clientY; t0=Date.now(); ok=true;
  },{passive:true});
  app.addEventListener('touchend',function(ev){
    if(!ok) return; ok=false;
    if(vista!=="hilo") return;
    var c=(ev.changedTouches&&ev.changedTouches[0]); if(!c) return;
    var dx=c.clientX-x0, dy=c.clientY-y0;
    if(Date.now()-t0>800) return;          /* muy lento: no es swipe */
    if(Math.abs(dx)<70) return;            /* muy corto */
    if(Math.abs(dx)<Math.abs(dy)*1.7) return; /* iba vertical: es scroll */
    swipeATarea(dx<0?1:-1);                /* izq -> siguiente, der -> anterior */
  },{passive:true});
  /* flechas del teclado, para escritorio y pruebas */
  document.addEventListener('keydown',function(ev){
    if(vista!=="hilo") return;
    var a=document.activeElement;
    if(a&&a.closest&&a.closest('input,textarea,[contenteditable="true"],.caja')) return;
    if(ev.key==="ArrowLeft"){ swipeATarea(-1); }
    else if(ev.key==="ArrowRight"){ swipeATarea(1); }
  });
}

/* la barra del pie: misma barra, otro lugar. Se pinta despues del scroll para
   que quede clavada abajo y suba con el teclado. */
/* LA MISMA BARRA EN TODAS LAS PANTALLAS — Salvador 2026-09-05: "todas
   idénticas". Se quitaron el microfono gigante verde y la tacha roja de las
   pantallas de preguntar y de "Muy caro": ahi va esta misma barra, con su +,
   su microfono y su flecha de enviar, en el mismo lugar de siempre. Lo unico
   que cambia entre pantallas es la PISTA de adentro. Cancelar se hace con la
   flechita ‹ de arriba, igual que en todas. */
function barraPie(pista, vacia){
  var txt = vacia ? "" : (consulta||"");
  return '<div class="pie">'+
    '<div class="caja2">'+
      (fotoEnMano
        ? '<button class="mas" id="bnofoto" aria-label="Quitar la foto">\u00d7</button>'
        : '<button class="mas" id="bcam" aria-label="Agregar foto">'+ico("mas",22,2)+'</button>')+
      '<div id="bq" class="caja'+(txt?"":" vacia")+'" contenteditable="true" role="textbox" '+
        'data-ph="'+(pista || (fotoEnMano?"Di de qu\u00e9 es la foto":""))+'" '+
        'autocorrect="on" autocapitalize="sentences" spellcheck="true" '+
        'enterkeyhint="send" inputmode="text" data-lpignore="true">'+esc(txt)+'</div>'+
      '<button class="env" id="benv" aria-label="Enviar">'+ico("sube",21,2.2)+'</button>'+
      '<button class="mic" id="bmic" aria-label="Dictar">'+ico("mic",26,1.7)+'</button>'+
    '</div></div>';
}
function vLista(){
  var esJefe=PERSONAS[yo].jefe;
  var det=loQueDetengo();
  var arr=mias(), mis=misEncargos();
  /* Salvador 2026-09-22: las ya hechas/eliminadas (tachadas) NO se pintan en el
     home, ensucian la lista. Siguen en el buscador ("lo que hice hoy") y al
     abrirlas por voz. */
  arr=arr.filter(function(t){ return !t.cierre && estadoReal(t)!=="cerrada"; });
  var res=esJefe?resumenDelDia():null;
  var _grupo=(!consulta && grupoInicio())||null;
  if(_grupo) h='<div class="enc" id="enc"><div class="r1"><button class="atras-inicio" id="binicio" aria-label="Volver a Inicio"><b aria-hidden="true">\u2039</b>Inicio</button><div class="grow"></div></div></div>';
  else h='<div class="enc" id="enc">'+
    '<div class="r1">'+(consulta?'<button class="iconbtn" id="bback" aria-label="Volver">\u2039</button>':'')+'<div class="nom" id="byo" role="button">'+esc(PERSONAS[yo].nombre)+'</div>'+
    '<div class="grow"></div>'+
    '<!--cam277-->'+   /* build 277: ícono de Caminata junto al ⋯ (se llena al final de vLista) */
    '<button class="iconbtn" id="bhmas" aria-label="Más opciones">'+ico("more",22)+'</button>'+   /* build 200: ⋯ del inicio */
    (esJefe?'<button class="eng" id="badm" aria-label="Ajustes">'+ico("eng",24,1.6)+'</button>':'')+'</div>'+
    '</div>';

  h+='<div class="scroll">';

  if(consulta){
    var enc=busca(consulta);
    h+='<div class="grp">Resultado \u00b7 '+enc.length+'</div><ul class="list">';
    if(!enc.length) h+='<li class="vacio">No encontr\u00e9 nada con eso.</li>';
    enc.forEach(function(t){ h+=fila(t) });
    h+='</ul><div class="pieacc"><button class="op" id="bnueva">Es una tarea nueva</button><button class="op" id="bclr">Limpiar b\u00fasqueda</button></div></div>';
    return h+barraPie();
  }

  try{ if(!window.__rfF263 || Date.now()-window.__rfF263>1500){ window.__rfF263=Date.now(); refrescaFalta(); } }catch(e){}
  var _arriba=bannerAvisos();

  var msgs=misMensajes();
  var pend=pendientesInfo();
  /* si la seccion abierta se quedo sin contenido (se resolvio la ultima
     pendiente/mensaje/traba), se cierra el acordeon solo */
  if(secAbierta==="pend" && !pend.length) secAbierta=null;
  if(secAbierta==="msg" && !msgs.length) secAbierta=null;
  if(secAbierta==="atora" && !det.length) secAbierta=null;

  _arriba+=vRecienCreadas();
  /* build 168: POR REVISAR reemplaza "Creadas hoy", "Atorados" e "informacion pendiente" */
  var _rev=porRevisar(), _revIds={};
  _rev.forEach(function(x){ _revIds[x.t.id]=1; });
  var hRev=vPorRevisar(_rev);

  /* build 155: PESTANA "CREADAS HOY" — la primera, gris, vista DUPLICADA (las
     tareas siguen en Hoy/Proximas/etc. segun su fecha). Dia = America/Monterrey. */
  var creadasHoy=tareasCreadasHoy(arr.concat(misRecordatorios()));
  if(secAbierta==="cre" && !creadasHoy.length) secAbierta=null;
  var hCre="";
  if(creadasHoy.length){
    hCre=secHead("cre","Creadas hoy",creadasHoy.length,"sb-cre","hoja");
    if(secAbierta==="cre"){ hCre+='<ul class="list">'; creadasHoy.forEach(function(t){hCre+=fila(t,false,"d-sec-prox")}); hCre+='</ul>'; }
  }

  /* ===== ACORDEON DE 7 SECCIONES DEL HOME — orden y color fijos, aprobados
     por Salvador 2026-09-22 (mock-up v3): 1 atoras a alguien (rojo) \u00b7
     2 con informacion pendiente (naranja oscuro) \u00b7 3 vencidas (amarillo) \u00b7
     4 avisos/mensajes sin leer (verde) \u00b7 5 hoy (azul) \u00b7 6 recordatorios
     (morado) \u00b7 7 proximas (gris). Solo UNA seccion abierta a la vez
     (secAbierta); el contenido de cada renglon queda siempre blanco/gris,
     nunca de color \u2014 lo unico que cambia por seccion es el icono y el
     puntito/franja. "Te encargaron" no es de las 7 con color: sigue igual,
     pegada despues de "Atoras a alguien". */

  var hAtora="";
  if(det.length){
    hAtora=secHead("atora","Atorados",det.length,"sb-atora","warn");
    if(secAbierta==="atora"){
      hAtora+='<ul class="list">'; det.forEach(function(t){hAtora+=(esDecisionSal(t)?filaDecision(t):filaUrg(t))}); hAtora+='</ul>';
    }
  }

  var hMis="";   /* la lista de «Te encargaron»; se ve en su propia vista (vGrupoInicio) */
  if(mis.length) hMis='<ul class="list">'+mis.map(filaEncargoInicio).join("")+'</ul>';

  var hPend="";
  if(pend.length){
    hPend=secHead("pend","Con informaci\u00f3n pendiente",pend.length,"sb-pend","pencil");
    if(secAbierta==="pend"){
      hPend+='<div class="pendwrap">'; pend.forEach(function(t){hPend+=filaPend(t)}); hPend+='</div>';
    }
  }

  /* ---- UNA SOLA LISTA, NO PESTAÑAS. Decisión de Salvador 2026-09-04: no
     dividir por tipo de traba; atrasadas = Vencidas, lo que DETIENE A OTRO
     va aparte arriba (seccion "atora"). ---- */
  arr=arr.filter(function(t){ return !_revIds[t.id]; });   /* build 168: lo que esta por revisar no sale en otro lado */
  msgs=msgs.filter(function(t){ return !_revIds[t.id]; });
  var mias_venc=arr.filter(function(t){return det.indexOf(t)<0 && estadoReal(t)==="vencida"});
  var resto=arr.filter(function(t){return det.indexOf(t)<0 && mias_venc.indexOf(t)<0});
  /* build 140: una tarea con aviso HOY (ritmo) y entrega futura sale en Hoy,
     con campanita en vez de punto (tocaRevisarHoy). */
  /* build 141: con campanita (roja/naranja/azul) tambien va en Hoy. Y ya no hay
     seccion Recordatorios: el recordatorio suelto va en la lista como cualquiera
     (hoy o ya pasado -> Hoy, nunca Vencidas; futuro -> Proximas). */
  var recs=misRecordatorios();
  resto=resto.concat(recs);
  var hoyYa=resto.filter(function(t){var c=campanaDe(t); return dDif(t.f_vigente||hoy(),hoy())>=0 || !!(c&&!c.fut)});
  hoyYa=ordenHoy(hoyYa);   /* build 246: primero las que tienen aviso (hoy o con hora), por hora del aviso; luego las demás en su orden */
  var futuras=resto.filter(function(t){var c=campanaDe(t); return dDif(t.f_vigente||hoy(),hoy())<0 && !(c&&!c.fut)})
                   .sort(function(a,b){return (a.f_vigente||"").localeCompare(b.f_vigente||"")});

  var _n256=function(t){ return !!((t.nueva256 && Date.now()-t.nueva256<3*864e5) || (t.nuevo264 && Date.now()-t.nuevo264<3*864e5)); };   /* build 256: las recién aceptadas, arriba, con la etiqueta "Nueva" */
  hoyYa=hoyYa.filter(_n256).concat(hoyYa.filter(function(t){ return !_n256(t); })); futuras=futuras.filter(_n256).concat(futuras.filter(function(t){ return !_n256(t); }));

  /* build 263: a Vencidas y Hoy de Salvador solo entra lo que le toca a él; lo que lleva Claude va a "Claude las lleva (N)" */
  var _rp263=reparte263(mias_venc, hoyYa); mias_venc=_rp263.venc; hoyYa=_rp263.hoy; var _cl263=_rp263.claude;
  /* PRÓXIMAS — cuando no hay nada para hoy, en vez del hueco se ven las que
     vienen, agrupadas por dia. El horizonte se adapta al volumen. */
  var proxRestan=0, hProxBody="", dentro=[];
  if(!hoyYa.length && futuras.length){
    var base = futuras.length>=20 ? 2 : (futuras.length>=10 ? 4 : 8);
    var tope = base + masDias;
    var fuera=[];
    futuras.forEach(function(t){
      var ad = -dDif(t.f_vigente||hoy(), hoy());
      (ad<=tope ? dentro : fuera).push(t);
    });
    proxRestan=fuera.length;
    if(dentro.length && secAbierta==="prox"){
      var diaAnt="";
      dentro.forEach(function(t){
        var f=t.f_vigente||hoy();
        if(f!==diaAnt){
          if(diaAnt) hProxBody+='</ul>';
          var ad=-dDif(f,hoy());
          hProxBody+='<div class="proxd">'+esc(ad===1?"Ma\u00f1ana":fechaBonita(f))+'</div><ul class="list">';
          diaAnt=f;
        }
        hProxBody+=fila(t,true,"d-sec-prox");
      });
      hProxBody+='</ul>';
      if(proxRestan) hProxBody+='<div class="futwrap"><button class="futbtn" id="bmas">'+
        ico("cal",18,1.8)+'<span>Ver m\u00e1s \u00b7 '+proxRestan+'</span></button></div>';
    }
  }

  var hProx="";
  if(dentro.length){
    hProx=secHead("prox","Pr\u00f3ximas",dentro.length,"sb-prox","cal")+hProxBody;
  }

  /* ===== build 179 (Salvador 20:29): "TE TOCA" — una sola lista arriba con todo lo que te pide
     algo (primero lo de Por revisar: te espera/atorados, falta informacion, vinculacion, por
     autorizar; luego vencidas, mensajes nuevos y hoy). Abajo Proximas y "Compartidas · N". ===== */
  try{ if(!window.__hitoChk || Date.now()-window.__hitoChk>60000){ window.__hitoChk=Date.now(); chequeoHitos(); /* build 267: chequeoMetas (empujones por WhatsApp al ejecutor) y revisaClaridadTodas (repreguntas) APAGADOS: solo la Mac manda a terceros */ } }catch(e){ console.warn("hitos",e); }   /* build 222: metas */
  /* build 270: el home de arriba hacia abajo — 1 Acomodo (plegable) · 2 Te pregunta Doit · 3 Vencidas mías · 4 Hoy mías (las tres siempre
     desplegadas, sin acordeón) · 5 plegadas: Las lleva Claude (con semáforo), Mías futuras y el resto */
  var _h270=armaHome(_rev, det, mias_venc, hoyYa, futuras);
  /* el home son tres fichas y una lista agrupada; cada grupo se ve en su propia vista (vGrupoInicio) con las mismas filas de siempre */
  var _ctxIni={H:_h270, claude:_cl263, hMis:hMis, nMis:mis.length, F:filtrosInicio(_h270, mis)};
  h+=_grupo?vGrupoInicio(_grupo, _ctxIni):_arriba+vFichasInicio(_h270, _ctxIni.F)+vListaInicio(_ctxIni);
  ordenLecturaInicio(_h270);
  try{ foto272({preg:_h270.preg, venc:_ctxIni.F.venc, hoy:_ctxIni.F.hoy}); }catch(e){}   /* lo que se ve en cada vista: así el renglón que se cierra sale en su lugar */
  window.__sale272=null;   /* el renglón que se cierra tras «Ya está» se pinta una sola vez */
  window.__H274=_h270;   /* la caminata sigue el orden del home */
  h=h.replace('<!--cam277-->', vCamIco());

  /* ORDEN DEL SWIPE ENTRE TAREAS — Salvador 2026-09-22: el swipe (window.
     ordenSwipe) sigue el mismo orden de las 7 secciones AUNQUE esten
     plegadas, para que al llegar al final de "Hoy" siga solo con
     Recordatorios, luego Proximas, etc., sin detenerse por el acordeon.
     Antes se armaba leyendo los renglones pintados en pantalla; con el
     acordeon (solo una seccion pintada a la vez) eso ya no alcanzaba, asi
     que ahora se arma directo de las listas, en el mismo orden fijo. */
  (function(){
    var seen={}, out=[];
    function agrega(lista){
      lista.forEach(function(t){
        if(!seen[t.id]){ seen[t.id]=1; out.push(t.id); }
      });
    }
    var _x270=function(L){ return L.map(function(x){ return x.t; }); };   /* build 270: el mismo orden del home nuevo */
    agrega(_x270(_h270.preg)); agrega(_x270(_h270.venc)); agrega(_x270(_h270.hoy)); agrega(_cl263.map(function(x){ return x.t; }));
    agrega(_h270.fut); agrega(_x270(_h270.otros)); agrega(_rev.map(function(x){ return x.t; })); agrega(mias_venc); agrega(msgs); agrega(hoyYa); agrega(recs); agrega(dentro); agrega(futuras);
    window.ordenSwipe=out.filter(function(id){ var z=(tareas||[]).filter(function(x){ return x && x.id===id; })[0]; return z && !esPropuesta(z); });   /* build 263: las propuestas de Acomodo no entran */
  })();

  /* LA PANTALLA ES SOLO TUYA — decision de Salvador, 2026-09-03. La pantalla
     del jefe muestra solo lo suyo y lo que lo detiene; lo de los demas se
     consulta preguntandole a Claude. */
  return h+'</div>'+barraPie();
}

var DIAS_L=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
var MES_3=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
/* la fecha, dicha corta y clara: hoy, mañana, el dia de la semana si es cerca,
   y dia+mes si ya es de otra semana. Salvador 2026-09-16, estilo limpio. */
function fechaChip(f){
  if(!f||!/^\d{4}-\d{2}-\d{2}$/.test(f)) return "";
  var ad=-dDif(f,hoy());
  if(ad===0) return "hoy";
  if(ad===1) return "mañana";
  if(ad===-1) return "ayer";
  var d=new Date(f+"T00:00:00");
  if(ad>=2 && ad<=6) return DIAS_L[d.getDay()];
  return d.getDate()+" "+MES_3[d.getMonth()];
}
/* build 140: hoy le toca un aviso (ritmo) pero la entrega es otro dia.
   build 141: tambien si hoy se atendio (elimino) el aviso de ritmo. */
function tocaRevisarHoy(t){
  if(!t || t.es_recordatorio || t.cierre || !t.f_vigente || t.f_vigente<=hoy()) return false;
  var H=hoy();
  return t.revisar_hoy===H || (t.avisos||[]).some(function(a){ return a.fecha===H; });
}
/* build 141: la alarma que ya sono y no se ha atendido (ni eliminada ni
   pospuesta). Primero la que llego por push; si no, la primera vencida. */
function alarmaRoja(t){
  if(!t || t.cierre || estadoReal(t)==="cerrada") return null;
  var s=avisoSonando(t);
  if(s && avisoVence(s)) return s;
  return avisosDe(t).filter(avisoVence)[0]||null;
}
function horaChica(h){ return String(horaBonita(h)||"").toLowerCase(); }
/* build 141 (Salvador 2026-09-25): LA CAMPANITA DEL RENGLON, en vez del punto.
   roja = ya sono y no la atiendes > naranja = suena hoy mas tarde > azul = ritmo
   (toca revisar, la entrega es otro dia). Solo en lo abierto. */
/* build 246 (Salvador 6-oct 07:01): en "Hoy" van primero las tareas con recordatorio (aviso de hoy, o ya sonado con hora), ordenadas por la hora
   del aviso; las demás siguen en su orden de antes (orden estable). Un aviso de hoy sin hora va después de los que sí tienen hora. */
function claveAviso246(t){
  try{ var H=hoy(), k=null;
    avisosDe(t).forEach(function(a){ if(!a || !a.fecha || a.fecha>H) return;
      var c=a.fecha<H?"00:00 "+(a.hora||"00:00"):(a.hora||"23:59 sin"); if(a.fecha<H && !a.hora) c="00:00 00:00";
      if(k===null || c<k) k=c; });
    return k;
  }catch(e){ return null; }
}
function ordenHoy(L){
  var ks=L.map(function(t,i){ return {t:t, i:i, k:claveAviso246(t)}; });
  ks.sort(function(a,b){ if((a.k===null)!==(b.k===null)) return a.k===null?1:-1; if(a.k!==null && a.k!==b.k) return a.k<b.k?-1:1; return a.i-b.i; });
  return ks.map(function(x){ return x.t; });
}
function campanaDe(t){
  /* build 148 (Salvador 2026-09-28): blindaje — un documento con un campo mal
     formado (p. ej. un encargado guardado como texto suelto en vez de objeto,
     visto en producción el 28-sep) no debe tronar esta función y tumbar TODO
     el render() de la sección donde se pinta; se registra en consola y esa
     tarea simplemente no trae campanita, en vez de romper a las demás. */
  try{
    if(!t || t.cierre || estadoReal(t)==="cerrada") return null;
    var H=hoy(), ent=(!t.es_recordatorio && t.f_vigente && t.f_vigente>H)?" · entrega "+fechaMovCorta(t.f_vigente):"";
    var r=alarmaRoja(t);
    if(r) return {c:"roja", txt:"sonó "+(r.fecha&&r.fecha<H?"el "+fechaMovCorta(r.fecha)+" ":"")+
      (r.hora?"a las "+horaChica(r.hora)+" ":"")+"· no la has atendido"};
    var ya=nowHM(), n=avisosDe(t).filter(function(a){ return a.fecha===H && a.hora && a.hora>ya; })
      .sort(function(a,b){ return a.hora.localeCompare(b.hora); })[0];
    if(n) return {c:"naranja", txt:"suena a las "+horaChica(n.hora)+ent};
    if(tocaRevisarHoy(t)) return {c:"azul", txt:"toca revisar · entrega "+fechaMovCorta(t.f_vigente)};
    /* build 142b (Salvador 2026-09-26): alarma programada OTRO dia (p. ej. se
       pospuso y cruzo la medianoche) = campanita naranja tambien en Proximas y
       tareas futuras, con dia y hora. fut:true = NO la sube a Hoy. */
    var nf=avisosDe(t).filter(function(a){ return a.fecha && a.fecha>H && a.hora; })
      .sort(function(a,b){ return (a.fecha+a.hora).localeCompare(b.fecha+b.hora); })[0];
    if(nf) return {c:"naranja", fut:true, txt:"suena "+fechaMovCorta(nf.fecha)+" a las "+horaChica(nf.hora)+ent};
    return null;
  }catch(e){
    console.error("campanaDe() truena con tarea", t&&t.id, e);
    return null;
  }
}
/* build 141: puntitos lineales por cada movida: 1 = nunca, 2 = una, 3 = dos o mas */
function puntosDe(t, cls){
  var n=!t.movidas?1:(t.movidas===1?2:3), h="";
  for(var i=0;i<n;i++) h+='<span class="dot '+cls+'"></span>';
  return n===1?h:'<span class="dots n'+n+'">'+h+'</span>';
}
function fila(t, mudo, secClass){
  /* build 148 (Salvador 2026-09-28, tras el bug real del "Hoy" que no abría):
     un documento con un campo mal formado (encargado guardado como texto
     suelto en vez de {a:...}, por ejemplo) truena esta función — y como se
     llama dentro de un .map() de toda la sección, ANTES tumbaba el render()
     completo (por eso "Hoy" no reaccionaba a nada). Ahora ese renglón se
     pinta como aviso corto en vez de tronar, y las demás filas siguen bien. */
  try{
    var b=badge(t), enc=encargadoDe(t), r=ritmo(t), camp=campanaDe(t), toca=!!camp;
    if(enc && (enc.fuente!=="encargado" || (enc.id && enc.id===t.duenio && !enc.encargo))) enc=null;   /* solo un encargo a otra persona lleva «→ Nombre» */
    /* build 144: con pasos, anillo de avance (1/3) y "Falta: ..." en el renglon */
    var _pz=tienePasos(t) && !t.cierre && estadoReal(t)!=="cerrada";
    /* Salvador 2026-09-22: si la fila se pinta dentro de una de las 7 secciones
       con color del home, el puntito toma el color de esa seccion; si no, sigue
       el estado real de la tarea (como siempre). */
    return '<li><button class="row'+(estadoReal(t)==="cerrada"?" done":"")+
      '" data-id="'+t.id+'">'+(_pz?anilloPasos(t):toca?'<span class="rico rcamp c-'+camp.c+'" aria-label="Alarma">'+ico(camp.c==="roja"?"bellr":"bell",16,1.8)+'</span>'
        :puntosDe(t, secClass||(enc?"d-tenue":dotc(t))))+'<span>'+
      '<span class="nm">'+esc(t.nombre)+'</span>'+
      (_pz&&!enc&&!(camp&&camp.c==="roja")?'<span class="ls">'+esc(faltaTxt(t))+'</span>':
       toca&&!enc?'<span class="ls">'+esc(camp.txt)+'</span>':enc
        ? '<span class="ls"><span class="marcaje">→ '+esc(enc.nombre||"encargado")+'</span> · '+esc(respuestaEncargoTxt(t))+'</span>'
        : (r&&r.va_a_fallar
            ? '<span class="ls"><span class="alerta">va a fallar</span> · atrasado en “'+esc(r.paso)+'”</span>'
            : (t.pasos&&t.pasos[t.paso!=null?t.paso:0]&&estadoReal(t)!=="cerrada"
                ? '<span class="paso">→ '+esc(t.pasos[t.paso||0].t)+'</span>'
                : '<span class="ls">'+esc(t.ultima||"")+'</span>')))+'</span>'+
      '<span class="meta">'+(_pz&&toca&&camp.c!=="roja"&&/a las (\S+ [ap]m)/.test(camp.txt)?'<span class="fdate pcamp c-'+camp.c+'">'+ico("bell",13,1.9)+esc(camp.txt.match(/a las (\S+ [ap]m)/)[1])+'</span>':'')+
      ((mudo||toca?"":chipFechaTarea(t))?'<span class="fdate">'+esc(chipFechaTarea(t))+'</span>':'')+
      (t.nueva256 && (Date.now()-t.nueva256)<3*864e5?'<span class="iatag nueva256">Nueva</span>':'')+(t.nuevo264 && (Date.now()-t.nuevo264)<3*864e5?'<span class="iatag nueva256 nuevo264">Nuevo</span>':'')+(t.ia_wa?'<span class="iatag" title="Creada por IA desde WhatsApp">IA·WA</span>':'')+
      '<span class="tm">'+((t.duenio&&t.duenio!==yo&&PERSONAS[t.duenio])?PERSONAS[t.duenio].ini:"")+'</span>'+
      (b?(b.ico?'<span class="bico">'+b.ico+'</span>':'<span class="bdg">'+b.n+'</span>'):'')+'</span></button></li>';
  }catch(e){
    console.error("fila() truena con tarea", t&&t.id, e);
    return '<li><button class="row" data-id="'+(t&&t.id||"")+'"><span class="dot d-tenue"></span>'+
      '<span><span class="nm">'+esc((t&&t.nombre)||"(tarea con datos dañados)")+'</span>'+
      '<span class="ls"><span class="alerta">esta tarea tiene un dato mal guardado — ábrela para revisarla</span></span></span></button></li>';
  }
}

/* CUÁNTO LLEVA ESPERANDO — Salvador 2026-09-04: primero en horas, luego en
   días, luego en semanas. Se mide contra t.espera_desde, la hora en que la
   tarea quedó parada esperándote. */
function esperaHace(t){
  if(!t.espera_desde) return "";
  var ms=Date.now()-t.espera_desde; if(ms<0) ms=0;
  var min=Math.floor(ms/60000);
  if(min<60) return min<=1?"un minuto":min+" minutos";
  var hrs=Math.floor(min/60);
  if(hrs<24) return hrs===1?"una hora":hrs+" horas";
  var dias=Math.floor(hrs/24);
  if(dias<14) return dias===1?"un día":dias+" días";
  return Math.round(dias/7)+" semanas";
}
/* El renglón de abajo de una urgente SIEMPRE dice quién y cuánto lleva parado. */
function quienEspera(t){
  var q=esperaHace(t);
  var nom=(t.duenio&&t.duenio!==yo&&PERSONAS[t.duenio])?PERSONAS[t.duenio].nombre:"";
  if(!q) return t.ultima||respuestaEncargoTxt(t)||"";
  return nom ? nom+" lleva "+q+" esperando" : "Lleva "+q+" esperando tu decisión";
}

/* FILA URGENTE — las que TÚ detienes, primeras en la lista. En vez del puntito
   va un RELOJ dentro de la pastilla naranja que late. Salvador 2026-09-04. */
function filaUrg(t){
  var b=badge(t);
  return '<li><button class="row urg" data-id="'+t.id+'">'+
    '<span class="utag" aria-label="Urge: detienes a alguien">'+
      '<span class="ur">'+ico("reloj",17,1.8)+'</span><span class="uw">Urge</span></span><span>'+
    '<span class="nm">'+esc(t.nombre)+'</span>'+
    '<span class="ls">'+esc(quienEspera(t))+'</span></span>'+
    '<span class="meta"><span class="tm">'+((t.duenio&&t.duenio!==yo&&PERSONAS[t.duenio])?PERSONAS[t.duenio].ini:"")+'</span>'+
    (b?(b.ico?'<span class="bico">'+b.ico+'</span>':'<span class="bdg">'+b.n+'</span>'):'')+'</span></button></li>';
}

/* lo que YO estoy deteniendo: la única categoría que no es sobre mí,
   es sobre otros que no pueden avanzar */
/* ¿ESTA TAREA ESTA FRENADA POR MI? — sacado aparte el 2026-09-03.
   Estaba metido adentro de loQueDetengo() y por eso la lista del jefe no lo
   usaba: se le colaban las que esperan autorizacion SIN nombre puesto, que son
   justo las que traen a alguien parado. Salvador lo pidio: "tambien me tiene
   que llegar lo que yo tengo que autorizar para que otra persona no se frene."
   Los tres casos, y no hay mas:
     · la tarea espera y me nombra a mi
     · la tarea espera y NO nombra a nadie, y yo soy el jefe (por default sube)
     · alguien escribio que esta esperando algo de mi */
function meDetiene(t){
  if(!t || t.cierre) return false;
  if(t.estado==="espera" && (t.espera===yo || (PERSONAS[yo] && PERSONAS[yo].jefe && !t.espera))) return true;
  var W=null; try{ W=esperasDe(t)[0]; }catch(e){} if(W && W.fuente==="espera_a" && W.deMi) return true;   /* espera_a: el campo único de a quién espera */
  if(t.detenido && t.detenido.quien && PERSONAS[yo] &&
     String(t.detenido.quien).toLowerCase().indexOf(PERSONAS[yo].nombre.toLowerCase())>=0) return true;
  return false;
}
/* build 157 (Salvador 2026-09-30): ATORADA POR UNA DECISION DE SALVADOR (autorizar un
   evento, una cita de compras, cual reunion se queda si se empalman, aprobar un
   pedido...). Se escribe (workers/Claude por fs_set) con:
     pendiente_tipo = "decision_salvador"   y   pendiente_info = "la pregunta a decidir"
   Sale en la seccion Atorados con la etiqueta "Esperando tu decision". Se limpia con
   "Ya decidi" (pone pendiente_tipo="" y pendiente_info="", guarda decision_ts). */
function esDecisionSal(t){
  return !!(t && t.pendiente_tipo==="decision_salvador" && t.pendiente_info && !t.cierre &&
            !t.fusionada_en && estadoReal(t)!=="cerrada");
}
/* ===== build 168 (Salvador 2026-10-02): POR REVISAR =====
   Una sola seccion arriba con todo lo que necesita a Salvador, en este orden:
   1 alguien te espera (naranja) · 2 falta informacion (azul) · 3 posible
   vinculacion (morado) · 4 por autorizar (verde). Nada se aprueba desde la
   lista: se toca, se abre la tarea y arriba del microfono sale UNA tarjeta con
   lo que falta; al resolverla, la tarea se va sola a su lugar (Hoy, Futuras...).
   "Por autorizar" = la creo el sistema (WhatsApp, correo, trabajador), no Salvador
   dictando; vale para lo creado desde el 2-oct (no inunda con lo viejo). */
var REV_DESDE=Date.UTC(2026,9,2,6,0,0);
function _fechaDeId(id){
  /* build 201: tambien ids que terminan en _AAAAMMDD (los crea Claude/trabajador: CONSEJO_CUMBRES_REUNION_20260927) */
  var s=String(id||""), m=s.match(/_(20\d{2})(\d{2})(\d{2})$/); if(m) return Date.UTC(+m[1],(+m[2])-1,+m[3],12);
  m=s.match(/_(\d{2})(\d{2})(\d{2})$/); return m?Date.UTC(2000+(+m[3]),(+m[2])-1,+m[1],12):0; }
function creadaPorSistema(t){
  if(t.por_autorizar===true) return true;
  if(t.creada_por && t.creada_por!==yo) return true;
  return /^(wa_|tWA_|t[A-Z])/.test(String(t.id||""));
}
function porAutorizar(t){
  if(!t || t.cierre || t.fusionada_en || t.estado==="fusionada" || t.es_recordatorio || t.autorizada) return false;
  if(t.duenio!==yo || estadoReal(t)==="cerrada" || esEjemplo(t)) return false;
  if(!creadaPorSistema(t)) return false;
  return t.por_autorizar===true || Math.max(msCreacion(t),_fechaDeId(t.id))>=REV_DESDE;
}
function posibleDup(t){
  /* build 168: el trabajador de WhatsApp/correo deja en analisis "posible duplicado de <id o nombre>" */
  var ids=(t.posible_dup||[]).slice(), an=String(t.analisis||"");
  var mm=an.match(/posible(?:s)?\s+duplicad[oa]s?\s+(?:de|con)\s+([^\n.;]+)/i);
  if(mm){ var frag=mm[1].toLowerCase();
    tareas.forEach(function(x){ if(x.id!==t.id && (frag.indexOf(String(x.id).toLowerCase())>=0 || (x.nombre && x.nombre.length>3 && frag.indexOf(x.nombre.toLowerCase())>=0)) && ids.indexOf(x.id)<0) ids.push(x.id); }); }
  var _desc=t.vinculos_descartados||[];   /* build 212: lo que cerro con la ✕ no vuelve a salir */
  return ids.filter(function(id){ return _desc.indexOf(id)<0; }).map(function(id){ return tareas.filter(function(x){ return x.id===id; })[0]; })
    .filter(function(x){ return x && x.id!==t.id && !x.fusionada_en && ((!x.cierre && estadoReal(x)!=="cerrada") || esCerradaReciente(x)); });   /* build 248: también cerradas de los últimos 30 días, marcadas (cerrada) */
}
/* build 212: la ✕ de "Posible vinculación" guarda esas sugerencias como descartadas; otra tarea distinta si vuelve a salir */
function descartaVinculos(t){
  var ids=posibleDup(t).map(function(x){ return x.id; });
  t.vinculos_descartados=(t.vinculos_descartados||[]).concat(ids).filter(function(x,i,a){ return a.indexOf(x)===i; });
  t.vinculos_descartados_ts=Date.now(); guarda(t); return ids;
}
function faltaInfoRev(t){
  if(t.pendiente_info && !esDecisionSal(t)) return true;
  return porAutorizar(t) && !t.f_vigente && !t.periodicidad;
}
/* ===== build 201 (Salvador 2026-10-04 16:42): "Falta info" TAMBIEN para tareas VIEJAS abiertas =====
   Antes solo contaba lo nuevo (creado por el sistema desde el 2-oct) o lo que traia pendiente_info, asi que
   "Agendar Reunión Consejo Colonia Cumbres" y "José Mijares - Barda Terreno Cumbres" (las creo Claude el
   27-sep con la fecha de ese mismo dia, sin que nadie la dictara) nunca salian. Regla SIN FECHA DICTADA =
   SIN FINIQUITO, Y SE PREGUNTA. Una tarea vieja abierta (tuya) sale en "Falta info" si:
     a) no tiene fecha, o su fecha la puso el sistema sola (creada por Claude/trabajador con la fecha de su
        propio dia de creacion, y nadie la ha movido ni dictado);
     b) no tiene NADA de contexto (ni el dictado, ni la descripcion con que nacio);
     c) su finiquito ya vencio y no tiene ritmo, ni recordatorio por delante, ni es indefinida/recurrente.
   Sale de ahi en cuanto se dicta fecha (queda fecha_dictada), contexto o ritmo/recordatorio. */
function _diaCreacion(t){ var ms=msCreacion(t)||_fechaDeId(t.id); if(!ms) return ""; var d=new Date(ms); return d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")+"-"+String(d.getUTCDate()).padStart(2,"0"); }
function fechaPuestaSola(t){
  if(!t || !t.f_vigente || t.fecha_dictada===true || (t.movimientos||[]).length) return false;
  if(t.creada_por && PERSONAS[t.creada_por]) return false;          /* la dicto una persona al crearla */
  var dc=_diaCreacion(t); return !!dc && t.f_vigente===dc;   /* si alguien la cambio despues, ya no es la puesta sola */
}
/* ===================== PLAN DE SEGUIMIENTO =====================
   UN plan por tarea, el mismo que lee el bot de la Mac (contrato: docs/plan-seguimiento.md):
     t.plan_seguimiento = {finiquito:"AAAA-MM-DD"|"indefinida", cada:"lo que dijo", dias:["lun","jue"],
       periodicidad:"diario"|"semanal"|"quincenal"|"mensual", hora:"HH:MM", proximo:"AAAA-MM-DD", metas:[{texto, fecha, hecha}],
       proximo_paso:"", con_quien:"", actualizado:{ts, por}}
     t.plan_log = [{fecha:"AAAA-MM-DD", hecho:true, por:"mac"|"salvador"|"app", nota:""}]  (quien da el seguimiento lo anota)
   planDe(t) es el ÚNICO lector: lo guardado manda y lo que falte se toma de los campos de antes (f_vigente, indefinida,
   periodicidad, ritmo, ritmo_seguimiento, avisos, seg_a, resumen.que_toca, pasos) sin escribir nada. Las fechas se sacan
   con código (días de la semana, diario/semanal/quincenal/mensual), nunca con IA.
   Falta información = sin finiquito, sin seguimiento (días, periodicidad o próxima fecha) o sin próximo paso. */
var DIAS_PLAN=["dom","lun","mar","mie","jue","vie","sab"], DIAS_PLAN_L=["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
var PER_PLAN=/^(diario|semanal|quincenal|mensual)$/;
function ordenSemanaPlan(d){ return (DIAS_PLAN.indexOf(d)+6)%7; }
function leeRitmoPlan(tx){
  var s=_n179(tx), o={dias:[], periodicidad:"", hora:""}; if(!s) return o;
  if(/\b(lunes a viernes|entre semana|dias habiles)\b/.test(s)) o.dias=["lun","mar","mie","jue","vie"];
  else DIAS_PLAN_L.forEach(function(d, i){ if(new RegExp("\\b"+d+"s?\\b").test(s)) o.dias.push(DIAS_PLAN[i]); });
  o.dias.sort(function(a, b){ return ordenSemanaPlan(a)-ordenSemanaPlan(b); });
  if(!o.dias.length){
    if(/\b(diari\w*|cada dia|todos los dias|al dia)\b/.test(s)) o.periodicidad="diario";
    else if(/\b(quincena\w*|quincenal\w*|cada 15 dias|cada quince dias)\b/.test(s)) o.periodicidad="quincenal";
    else if(/\b(mensual\w*|cada mes|al mes|todos los meses)\b/.test(s)) o.periodicidad="mensual";
    else if(/\b(semanal\w*|cada semana|a la semana|por semana|todas las semanas)\b/.test(s)) o.periodicidad="semanal";
  }
  var h=s.match(/\ba las (\d{1,2})(?: (\d{2}))?(?: (am|pm|de la tarde|de la noche|de la manana))?\b/);
  if(h){ var hh=+h[1], mm=+(h[2]||0); if(/pm|tarde|noche/.test(h[3]||"") && hh<12) hh+=12; if(hh<24 && mm<60) o.hora=String(hh).padStart(2,"0")+":"+String(mm).padStart(2,"0"); }
  return o;
}
function sumaDiasPlan(f, n){ var d=new Date(f+"T12:00:00"); d.setDate(d.getDate()+n); return iso(d); }
function ultimoSeguimiento(t){ var u=""; (Array.isArray(t && t.plan_log)?t.plan_log:[]).forEach(function(x){ var f=String((x && x.fecha)||"").slice(0,10); if(x && x.hecho!==false && _fReal(f) && f>u) u=f; }); return u; }
/* la siguiente fecha: después del último seguimiento dado; sin ninguno, desde «desde» */
function proximoPlan(P, ultimo, desde){
  var ini=ultimo?sumaDiasPlan(ultimo, 1):desde;
  if(P.dias.length){ for(var i=0; i<7; i++){ var f=sumaDiasPlan(ini, i); if(P.dias.indexOf(DIAS_PLAN[new Date(f+"T12:00:00").getDay()])>=0) return f; } return ""; }
  if(P.periodicidad==="diario") return ini;
  var ref=ultimo||sumaDiasPlan(desde, -1);
  if(P.periodicidad==="semanal") return sumaDiasPlan(ref, 7);
  if(P.periodicidad==="quincenal") return sumaDiasPlan(ref, 15);
  if(P.periodicidad==="mensual"){ var d=new Date(ref+"T12:00:00"); d.setMonth(d.getMonth()+1); return iso(d); }
  return "";
}
function planGuardado(t){ var G=t && t.plan_seguimiento; return (G && typeof G==="object" && !Array.isArray(G))?G:null; }
function planDe(t){
  var G=planGuardado(t)||{}, guardado=!!planGuardado(t), H=hoy();
  var P={finiquito:"", cada:"", dias:[], periodicidad:"", hora:"", proximo:"", metas:[], proximo_paso:"", con_quien:"", actualizado:G.actualizado||null, guardado:guardado, seguimientoLibre:""};
  if(!t) return P;
  /* finiquito: la fecha de la tarea (f_vigente / indefinida) es la que mueve toda la app; el plan la refleja */
  if(t.indefinida===true || esRecurrente(t) || t.tipo==="recurrente") P.finiquito="indefinida";
  else if(t.f_vigente && !t.falta_fecha && !fechaPuestaSola(t)) P.finiquito=t.f_vigente;
  else if(G.finiquito==="indefinida" || _fReal(G.finiquito)) P.finiquito=G.finiquito;
  /* cada cuándo */
  P.cada=String(G.cada||"").trim(); P.hora=/^\d{2}:\d{2}$/.test(G.hora||"")?G.hora:"";
  P.dias=(Array.isArray(G.dias)?G.dias:[]).filter(function(d){ return DIAS_PLAN.indexOf(d)>=0; }).sort(function(a, b){ return ordenSemanaPlan(a)-ordenSemanaPlan(b); });
  P.periodicidad=P.dias.length?"":(PER_PLAN.test(G.periodicidad||"")?G.periodicidad:"");
  if(!P.dias.length && !P.periodicidad){
    [t.ritmo, t.ritmo_seguimiento, t.seg_a && t.seg_a.cada].forEach(function(x){ var tx=String(x||"").trim(); if(!tx || P.dias.length || P.periodicidad) return;
      var r=leeRitmoPlan(tx); if(r.dias.length || r.periodicidad){ P.dias=r.dias; P.periodicidad=r.periodicidad; if(!P.cada) P.cada=tx; if(!P.hora) P.hora=r.hora; } });
    if(!P.dias.length && !P.periodicidad && esRecurrente(t)) P.periodicidad=t.periodicidad;
  }
  /* sin plan guardado, un ritmo escrito que no dice días sigue contando como seguimiento (así estaban las tareas de antes) */
  if(!guardado && !P.dias.length && !P.periodicidad) P.seguimientoLibre=String(t.ritmo||t.ritmo_seguimiento||"").trim();
  /* próxima fecha: calculada; si no hay ritmo, la que ya estaba (plan, aviso, WhatsApp programado o la próxima de una indefinida) */
  var desde=(guardado && G.actualizado && +G.actualizado.ts)?sumaDiasPlan(iso(new Date(+G.actualizado.ts)), 1):H;
  P.proximo=proximoPlan(P, ultimoSeguimiento(t), desde);
  if(!P.proximo && _fReal(G.proximo)) P.proximo=G.proximo;
  if(!P.proximo){ var c=[];
    (t.avisos||[]).forEach(function(a){ if(a && _fReal(a.fecha) && a.fecha>=H) c.push(a.fecha); });
    if(t.seg_a) (t.seg_a.programados||[]).forEach(function(x){ var f=String(x||"").slice(0,10); if(_fReal(f) && f>=H) c.push(f); });
    if(t.indefinida===true && _fReal(t.f_vigente)) c.push(t.f_vigente);
    c.sort(); P.proximo=c[0]||""; }
  /* próximo paso: el guardado; si no, el «qué toca» del resumen o el primer paso pendiente */
  P.proximo_paso=String(G.proximo_paso||"").trim();
  if(!P.proximo_paso){ var R=(t.resumen && typeof t.resumen==="object")?t.resumen:{}, qt=String(R.que_toca||"").replace(/\s+/g," ").trim();
    if(qt && !/·\s*hecho\s*$/i.test(qt)) P.proximo_paso=qt;
    else { try{ var ps=pasos263(t).filter(function(x){ return !x.hecho; })[0]; if(ps) P.proximo_paso=ps.tx; }catch(e){} } }
  P.con_quien=String(G.con_quien||(t.seg_a && t.seg_a.contacto)||((t.wa_contactos||[])[0]||{}).nombre||"").trim();
  if(Array.isArray(G.metas)) P.metas=G.metas.filter(function(m){ return m && m.texto; });
  else { try{ P.metas=metasDe(t).map(function(m){ return {texto:String(m.tx||""), fecha:m.fecha||"", hecha:metaCumplida(m)}; }); }catch(e){} }
  return P;
}
function tieneSeguimientoPlan(P){ return !!(P.dias.length || P.periodicidad || P.proximo || P.seguimientoLibre); }
/* lo que le falta al plan de una tarea tuya: "finiquito", "seguimiento", "proximo_paso" */
function faltaPlan(t){
  try{
    if(!t || t.cierre || t.fusionada_en || t.es_recordatorio || esDato(t) || esDormida(t) || estadoReal(t)==="cerrada") return [];
    if(typeof esPropuesta==="function" && esPropuesta(t)) return [];
    if(!(t.duenio===yo || (!t.duenio && t.creada_por===yo))) return [];
    var P=planDe(t), L=[]; if(!P.finiquito) L.push("finiquito"); if(!tieneSeguimientoPlan(P)) L.push("seguimiento"); if(!P.proximo_paso) L.push("proximo_paso"); return L;
  }catch(e){ return []; }
}
var FALTA_PLAN_TX={finiquito:"fecha de finiquito", seguimiento:"próximo seguimiento", proximo_paso:"próximo paso"};
function faltaPlanTxt(t){ var L=faltaPlan(t).map(function(k){ return FALTA_PLAN_TX[k]; }); if(!L.length) return "";
  return "Falta "+(L.length===1?L[0]:L.slice(0, -1).join(", ")+" y "+L[L.length-1]); }
/* vigía: la fecha de seguimiento del plan ya pasó y nadie anotó en plan_log que se dio */
function seguimientoPerdido(t){
  try{ if(!t || t.cierre || estadoReal(t)==="cerrada" || !planGuardado(t)) return ""; var P=planDe(t); return (P.proximo && P.proximo<hoy())?P.proximo:""; }catch(e){ return ""; }
}
/* «Seguimiento: lun y jue · próximo jue 9» — lo que quedó, en una línea, para que lo confirme */
function diasPlanTxt(L){ return L.length===1?L[0]:L.slice(0, -1).join(", ")+" y "+L[L.length-1]; }
function lineaPlanTxt(t){
  var P=planDe(t); if(!P.dias.length && !P.periodicidad && !P.proximo) return "";
  var que=P.dias.length?(P.dias.length===5 && P.dias.join()==="lun,mar,mie,jue,vie"?"lunes a viernes":diasPlanTxt(P.dias.map(function(d){ return d==="mie"?"mié":(d==="sab"?"sáb":d); }))):P.periodicidad;
  var f=P.proximo?fechaMovCorta(P.proximo).replace(/ \S+$/,""):"";
  return "Seguimiento: "+(que||"por fecha")+(P.hora?" a las "+P.hora:"")+(f?" · próximo "+f:"");
}
function lineaPlan(t){ var x=""; try{ x=lineaPlanTxt(t); }catch(e){} return x?'<div class="plan-seg" data-plan-seg="1">'+esc(x)+'</div>':""; }
/* escribir el plan: se junta con lo que ya tenía (merge) y se recalcula la próxima fecha */
function escribePlan(t, c, por){
  if(!t || !c) return null;
  var n={}, G=planGuardado(t)||{}; Object.keys(G).forEach(function(k){ n[k]=G[k]; }); Object.keys(c).forEach(function(k){ n[k]=c[k]; });
  n.actualizado={ts:Date.now(), por:por||yo||"app"}; t.plan_seguimiento=n;
  var P=planDe(t); n.proximo=P.proximo||""; if(!n.finiquito && P.finiquito) n.finiquito=P.finiquito;
  return n;
}
/* lo dictado que dice cada cuándo («dos veces a la semana, lunes y jueves», «diario a las 10») va al plan */
function planDesdeDictado(t, v, forzar){
  var s=_n179(v), r=leeRitmoPlan(v);
  var dice=forzar || RITMO_RE.test(s) || r.dias.length>=2 || /\b(cada|todos los|todas las|seguimiento)\b/.test(s);
  if(!dice || (!r.dias.length && !r.periodicidad)) return false;
  var c={cada:String(v||"").replace(/\s+/g," ").trim().slice(0,120), dias:r.dias, periodicidad:r.dias.length?"":r.periodicidad};
  if(r.hora) c.hora=r.hora;
  escribePlan(t, c, yo); return true;
}
/* la respuesta a una pregunta de seguimiento, de próximo paso o de finiquito se queda en el plan */
function planDesdeRespuesta(t, q, tx){
  var qq=String(q||""), v=String(tx||"").replace(/\s+/g," ").trim(); if(!v) return false;
  if(/pr[oó]ximo paso|siguiente paso/i.test(qq)){ escribePlan(t, {proximo_paso:v.slice(0,200)}, yo); return true; }
  if(/seguimiento|recuerdo|cada cu[aá]nto/i.test(qq)) return planDesdeDictado(t, v, true);
  if(/finiquito|terminar|indefinida/i.test(qq) && /indefinid|sin fin|no termina|permanente/.test(_n179(v))){ escribePlan(t, {finiquito:"indefinida"}, yo); return true; }
  return false;
}
function faltaVieja(t){
  if(!t || t.cierre || t.es_recordatorio || esDato(t) || t.autorizada_asi || estadoReal(t)==="cerrada") return "";
  if(!(t.duenio===yo || t.creada_por===yo)) return "";
  var sinFin=t.indefinida===true || esRecurrente(t) || t.tipo==="recurrente";
  if(!sinFin && (!t.f_vigente || fechaPuestaSola(t))) return "finiquito";
  if(!contextoDe(t)) return "contexto";
  var H=hoy(), aviso=(t.avisos||[]).some(function(a){ return a && a.fecha && a.fecha>=H; });
  if(!sinFin && t.f_vigente && t.f_vigente<H && !String(t.ritmo||"").trim() && !aviso) return "seguimiento";
  return "";
}
function tipoRevisar(t){
  /* build 263: "falta" solo si al abrir la tarea sale la pregunta precisa; si no, se quita la marca (y puede seguir "vincular") */
  var k=tipoRevisar0(t);
  if(k==="falta" && typeof faltaConsistente==="function" && !faltaConsistente(t)){ try{ if(t.duenio===yo && !t.dup_resuelto && posibleDup(t).length) return "vincular"; }catch(e){} return null; }
  return k;
}
function tipoRevisar0(t){
  if(!t || t.cierre || t.fusionada_en || t.estado==="fusionada" || estadoReal(t)==="cerrada") return null;
  /* build 243 (Salvador 22:02): la tarea DESTINO de un vínculo nunca entra en revisión ni clasificación (ni "Solo me falta", Datos, Agendar) */
  if(Array.isArray(t.enlazadas) && t.enlazadas.length && !(meDetiene(t) && !t.pendiente_info)) return null;
  if((meDetiene(t) && !t.pendiente_info) || (esDecisionSal(t) && PERSONAS[yo] && PERSONAS[yo].jefe)) return "espera";
  if(typeof faltaPasoClaude==="function" && faltaPasoClaude(t) && !t.autorizada_asi) return "falta";   /* build 283: la Mac (18z37) no le encuentra siguiente paso */
  /* build 195: "Falta info" = lo nuevo o incompleto (antes "Falta información" y "Por autorizar").
     Lo que ya tiene todo (contexto y datos) nunca sale aqui. */
  var _nuevo=!t.autorizada_asi && (porAutorizar(t) || (faltaInfoRev(t) && (t.creada_por===yo || t.duenio===yo)));
  if(_nuevo && !completitud(t).completa) return "falta";
  if(t.en_revision && !t.autorizada && !t.autorizada_asi && t.por_autorizar!==false) return "falta";   /* build 209: completa, esperando "Autorizar"; 225: no si por_autorizar=false */
  if(faltaVieja(t)) return "falta";   /* build 201: tambien lo viejo abierto al que le falta algo */
  if(eventoPendiente(t) && (t.duenio===yo || t.creada_por===yo) && !t.autorizada_asi) return "falta";   /* build 202: ¿te lo agendo? */
  if(t.duenio===yo && !t.dup_resuelto && posibleDup(t).length) return "vincular";
  return null;
}
/* ===== build 192 (Salvador 2026-10-04 08:47): BORRAR SIN MOTIVO AL NACER + CENSO =====
   Una tarea que sigue en su PRIMER estado se borra con el bote SIN preguntar motivo:
   - "Por autorizar" (la creo WhatsApp/correo/trabajador y nadie la ha autorizado), o
   - "Falta informacion" desde que nacio (nunca se completo ni se autorizo), o
   - creada por accidente: la acabas de hacer tu (menos de 15 min), nadie mas ha escrito.
   Si ya VIVIO (autorizada, movida, encargada, detenida, con vueltas, reabierta, con
   vinculaciones o evidencias) se pregunta el motivo como siempre.
   CENSO: cada descarte al nacer y cada vinculacion se queda ANOTADO en el documento de
   la tarea (no se borra nada), para que Claude aprenda que creo mal el robot. */
var ACCIDENTE_MS=15*60000;
function vivioTarea(t){
  return !!(t.autorizada || t.autorizada_ts || (t.movimientos||[]).length || (t.vueltas||[]).length ||
    (t.reabierta||[]).length || (t.enlazadas||[]).length || (t.evidencias||[]).length ||
    t.encargado || t.detenido || t.dup_resuelto);
}
function deOtrosEnTarea(t){
  return (t.msgs||[]).some(function(x){ return x && (x.wa_in || (x.de && x.de!==yo)); });
}
/* -> "por_autorizar" | "falta_info" | "accidente" | "" (""= se pide motivo) */
function borraSinMotivo(t, ahora){
  if(!t || t.cierre || t.fusionada_en || t.estado==="fusionada" || t.es_recordatorio) return "";
  if(esEjemplo(t) || estadoReal(t)==="cerrada" || vivioTarea(t)) return "";
  if(porAutorizar(t)) return "por_autorizar";
  var otros=deOtrosEnTarea(t);
  if(faltaInfoRev(t) && !otros) return "falta_info";
  var edad=(ahora||Date.now())-msCreacion(t);
  var dichos=(t.msgs||[]).filter(function(x){ return x && x.k==="bo"; }).length;
  if(t.creada_por===yo && msCreacion(t)>0 && edad>=0 && edad<ACCIDENTE_MS && !otros && dichos<=1) return "accidente";
  return "";
}
function origenTarea(t){
  if(t.origen) return String(t.origen);
  var id=String(t.id||""), an=String((t.via||"")+" "+(t.fuente||"")+" "+(t.analisis||""));
  if(/^(wa_|tWA_)/.test(id) || /whats\s?app/i.test(an)) return "WhatsApp";
  if(/\b(correo|gmail|e-?mail)\b/i.test(an)) return "correo";
  if(t.por_autorizar===true || /^t[A-Z]/.test(id)) return "trabajador";
  if(t.creada_por===yo) return "dictado app";
  if(t.creada_por && PERSONAS[t.creada_por]) return "app de "+PERSONAS[t.creada_por].nombre;
  return "desconocido";
}
function textoQueLaCreo(t){
  var m=(t.msgs||[]).filter(function(x){ return x && x.k!=="bi" && x.k!=="bal" && (x.tr||x.t); })[0] || (t.msgs||[])[0];
  return String((m&&(m.tr||m.t))||t.dicho||t.nombre||"").slice(0,500);
}
function descartaAlNacer(t, porque){
  var prev={estado:t.estado, cierre:t.cierre||null, n:(t.msgs||[]).length};
  t.descartada_al_nacer=true; t.descartada_ts=Date.now(); t.descartada_por=yo||"";
  t.descartada_como=porque||""; t.censo_origen=origenTarea(t); t.censo_texto=textoQueLaCreo(t);
  t.censo_nombre=String(t.nombre||"");
  t.estado="cerrada"; t.cierre={tipo:"cancelado", motivo:"al_nacer", f:hoy()};
  t.pide_atoro=false; t.pide_tel=false; t.pide_fecha=false;
  guarda(t); try{ sincronizaAvisos(t); }catch(e){}
  selloYSigue(t,{tipo:"eliminada", texto:t.nombre, restaurar:function(){
    t.estado=prev.estado||"abierta"; t.cierre=prev.cierre;
    t.descartada_al_nacer=null; t.descartada_ts=null; t.descartada_por=null; t.descartada_como=null;
    if(t.msgs && t.msgs.length>prev.n) t.msgs.length=prev.n;
    guarda(t); sincronizaAvisos(t); }});
}
/* lo que se le pasa a Claude para que aprenda (cortito): ultimos 20 de cada uno */
function censoEjemplos(){
  var no=[], vin=[];
  (typeof tareas!=="undefined"?tareas:[]).forEach(function(t){
    if(t.descartada_al_nacer) no.push({ts:t.descartada_ts||0, nombre:String(t.censo_nombre||t.nombre||"").slice(0,60),
      origen:t.censo_origen||"", texto:String(t.censo_texto||"").slice(0,120)});
    (t.enlazadas||[]).forEach(function(e){ vin.push({ts:e.ts||0, de:String(e.nombre||"").slice(0,60), a:String(t.nombre||"").slice(0,60), propuso:e.propuso||""}); });
    (t.censo_sumados||[]).forEach(function(e){ vin.push({ts:e.ts||0, de:String(e.texto||"").slice(0,60), a:String(t.nombre||"").slice(0,60), propuso:e.propuso||""}); });
  });
  function ult(a){ return a.sort(function(x,y){ return y.ts-x.ts; }).slice(0,20).map(function(x){ delete x.ts; return x; }); }
  return {no_eran_tarea:ult(no), vinculaciones:ult(vin)};
}
function porRevisar(){
  var ord={espera:0,falta:1,vincular:2,autorizar:3};
  return tareas.filter(function(t){ return !esPropuesta(t); }).map(function(t){ return {t:t,k:tipoRevisar(t)}; }).filter(function(x){ return x.k; })
    .sort(function(a,b){ return ord[a.k]-ord[b.k] || (msCreacion(b.t)-msCreacion(a.t)); });
}
/* quien te espera: el nombre corto */
function quienTeEspera(t){
  if(t.duenio && t.duenio!==yo && PERSONAS[t.duenio]) return PERSONAS[t.duenio].nombre;
  if(t.detenido && t.detenido.de) return String(t.detenido.de);
  var ms=t.msgs||[];
  for(var i=ms.length-1;i>=0;i--){ var x=ms[i]; if(x && (x.wa_in||x.de&&x.de!==yo) && (x.wa_c||x.de)) return String(x.wa_c||(PERSONAS[x.de]&&PERSONAS[x.de].nombre)||x.de).split(" ")[0]; }
  return "Alguien";
}
function etiquetaRev(t,k){
  if(k==="espera") return (esDecisionSal(t)?"Te esperan":quienTeEspera(t)+" te espera");
  if(k==="falta"){ var _fp=faltaPrimero(completitud(t)); return _fp?_fp.txt:"Falta info"; }
  if(k==="vincular") return "Posible vinculación";
  return "Por autorizar";
}
function vPorRevisar(lista){
  if(!lista.length) return "";
  var h='<div class="revh"><b>Por revisar</b><span>'+lista.length+'</span></div><div class="revl">';
  lista.forEach(function(x){
    h+='<button class="revr rv-'+x.k+'" data-id="'+esc(x.t.id)+'"><i></i><span class="rn">'+esc(x.t.nombre||"Sin nombre")+'</span><span class="rl">'+esc(etiquetaRev(x.t,x.k))+'</span></button>';
  });
  return h+'</div>';
}
/* las preguntas de lo que falta, cortas, max. 4 */
function preguntasFalta(t){
  var b=[], pi=String(t.pendiente_info||"").trim();
  var nomMal=!String(t.nombre||"").trim() || /^(whats\s?app:|recordatorio sin)/i.test(t.nombre) || /^\+?\d[\d\s]+$/.test(t.nombre);
  if(nomMal) b.push("¿Cómo la llamo?");
  if(pi && !/cu[aá]ndo|fecha|d[ií]a|hasta/i.test(pi)) b.push(pi);
  if(!t.f_vigente || /cu[aá]ndo|fecha|d[ií]a|hasta/i.test(pi)){
    if(!t.periodicidad) b.push("¿Se repite? ¿Cada cuánto?");
    b.push("¿Cuándo termina?");
  }
  if(!(t.avisos||[]).length) b.push("¿Cuándo te recuerdo antes?");
  if((t.msgs||[]).length<=1 && b.length<4) b.push("Contexto: ¿de qué se trata?");
  return b.slice(0,4);
}
function ultimoDeOtro(t){
  var ms=t.msgs||[];
  for(var i=ms.length-1;i>=0;i--){ var x=ms[i]; if(x && x.k!=="bi" && (x.wa_in || (x.de && x.de!==yo))) return String(x.t||""); }
  return "";
}
function vTarjetaRev(t){
  var k=tipoRevisar(t); if(!k) return "";
  /* build 247 (Salvador 6-oct 07:25, "Cobranza Moric"): solo las creadas por la IA y sin clasificar piden revisión con bloques grandes ("Solo me falta",
     "Datos de la tarea"). Una creada a mano (dictado) deja lo que falta solo en la ficha "Falta N". */
  if(k==="falta" && !esIA(t) && (t.creada_por===yo || t.duenio===yo) && !porAutorizar(t) && !t._leyendo && !t.hecho238 && !(window.__palomeo||{})[t.id]) return "";
  /* build 173: si ya lo habia dicho con un build anterior, se aplica al abrirla */
  /* build 173: si lo ultimo del chat es algo que el dijo con un build anterior
     ("no es mia, es de X" o "ponle de nombre X") y nadie lo atendio, se aplica al abrirla */
  if(!t._chkDuenio){ t._chkDuenio=1;
    var _ul=(t.msgs||[]).slice(-1)[0];
    if(_ul && _ul.k==="bo" && (!_ul.de || _ul.de===yo) && _ul.t){
      if(duenioDicho(_ul.t) && reasignaDicho(t,_ul.t,true)){ setTimeout(function(){ toast("Pasó a "+PERSONAS[t.duenio].nombre); },50); return ""; }
      var _rn=detectaRenombre(_ul.t);
      if(_rn && conMayuscula(_rn)!==t.nombre){ var _vj=t.nombre; t.nombre=conMayuscula(_rn); msg(t,"bi","Cambié el nombre: “"+_vj+"” → “"+t.nombre+"”."); guarda(t); }
    }
  }
  if(k==="espera"){
    if(esDecisionSal(t)) return "";   /* ya trae su banner "Esperando tu decision" */
    if(true) return "";   /* build 266: "Te espera" ya no es ficha: es una pregunta en texto (registroPreg) */
    var q=ultimoDeOtro(t)||quienEspera(t)||"";
    return '<div class="revc c-espera"><span class="rct">'+esc(quienTeEspera(t).toUpperCase())+' TE ESPERA</span>'+
      (q?'<span class="rcq">'+esc(q.length>160?q.slice(0,159)+"…":q)+'</span>':'')+
      '<span class="rcp">Contéstale abajo.</span></div>';
  }
  if(k==="falta") return vistaSup(t)?"":vFaltaInfo(t);   /* build 195; 224: en la vista supervisor lo que le toca va abajo (sugSup) */
  if(k==="vincular"){
    /* build 192: se pide como el paquete de autorizar: "Este mensaje lo pienso vincular a X. ¿Autorizas?" */
    var _pd=posibleDup(t);
    var h='<div class="revc c-vincular"><button class="rvx" data-rvx="1" aria-label="Cerrar sugerencia">✕</button><span class="rct">POSIBLE VINCULACIÓN</span><span class="rcp">'+(_pd.length===1
      ? 'Este mensaje lo pienso vincular a “'+esc(corta40(_pd[0].nombre))+'”. ¿Autorizas?'
      : 'Este mensaje lo pienso vincular a una de estas. ¿Autorizas?')+'</span>';
    _pd.slice(0,3).forEach(function(d){
      var quien=(d.duenio&&PERSONAS[d.duenio])?(d.duenio===yo?"Tuya":PERSONAS[d.duenio].nombre):"";
      var cu=d.f_vigente?fechaChip(d.f_vigente):"";
      h+='<div class="rvv"><span><b>'+esc(nombreVinc(d))+'</b><small>'+esc([quien,cu].filter(Boolean).join(" · "))+'</small></span>'+
         '<button class="rvb" data-rvinc="'+esc(d.id)+'">'+(esCerradaReciente(d)?'Ver':'Vincular')+'</button></div>';
    });
    return h+'<button class="rvn" id="rvnueva">Crear tarea nueva</button></div>';
  }
  return '<div class="revc c-autorizar"><span style="display:flex;flex-direction:column;gap:2px;flex:1;min-width:0">'+
    '<span class="rct">POR AUTORIZAR</span><span class="rcp">Cambios: díctamelos abajo</span></span>'+
    '<button class="rva" id="rvautz">Autorizar</button></div>';
}
/* build 173 (Salvador 2026-10-02 18:21): "no es mia, es de Samuel" dentro de una tarea
   suya -> pasa a esa persona, queda autorizada y sale de "Por revisar". Se resuelve en
   el telefono con reglas fijas, sin esperar a Claude. Devuelve la clave de la persona o null. */
function duenioDicho(v){
  var n=String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  var claves=Object.keys(PERSONAS).filter(function(k){ return k!==yo; });
  var nom="("+claves.map(function(k){ return PERSONAS[k].nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); }).join("|")+")";
  var pats=[
    "no es (mia|para mi|mi tarea)[^.]{0,80}?\\b(es|seria|le toca|la tiene|la lleva|la hace|tarea)\\s+(de|a)\\s+"+nom,
    "\\b(es|le toca a|le corresponde a|corresponde a|es tarea de|es pendiente de)\\s+(de\\s+)?"+nom+"[^.]{0,40}?\\bno (es )?(mia|a mi|para mi)",
    "\\b(le toca a|le corresponde a|es tarea de|es pendiente de|la tiene que hacer|la debe hacer)\\s+"+nom,
    "\\b(pasa(se)?la|pasasela|asigna(se)?la|asignasela|transfierela|transfieresela|mandasela|dasela|ponsela)\\s+(a\\s+)?"+nom,
    "\\bno (me toca|es mia|es para mi)\\b[^.]{0,60}?\\b"+nom
  ];
  for(var i=0;i<pats.length;i++){
    var m=n.match(new RegExp(pats[i]));
    if(m){ var nm=""; for(var g=m.length-1;g>0;g--){ if(m[g] && new RegExp("^"+nom+"$").test(m[g])){ nm=m[g]; break; } } var k=claves.filter(function(c){ return PERSONAS[c].nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")===nm; })[0]; if(k) return k; }
  }
  return null;
}
function reasignaDicho(t, v, silencioso){
  if(!t || t.duenio!==yo || t.cierre || estadoReal(t)==="cerrada") return false;
  var k=duenioDicho(v); if(!k) return false;
  var r=transfiere(t, k, "lo dijo "+(PERSONAS[yo]?PERSONAS[yo].nombre:"")+" al revisarla");
  if(!r.ok) return false;
  t.integrantes=t.integrantes||[]; if(t.integrantes.indexOf(yo)<0) t.integrantes.push(yo);   /* build 179: sigo como involucrado */
  t.autorizada=true; t.autorizada_ts=Date.now(); t.pendiente_info=""; t.pendiente_tipo="";
  var falta=[]; if(!t.f_vigente && !t.periodicidad) falta.push("fecha"); if(!String(t.nombre||"").trim()) falta.push("nombre");
  msg(t,"bi","Listo: es de "+PERSONAS[k].nombre+". Se la pasé con todo lo que dijiste y la quité de tu Por revisar."+
    (falta.length?" Ojo: le falta "+falta.join(" y ")+".":""));
  guarda(t); if(!silencioso) toast("Pasó a "+PERSONAS[k].nombre);
  return true;
}
/* build 176 (Salvador 2026-10-02 18:44): contestar UN mensaje en especifico, como en
   WhatsApp. Deslizas a la derecha la burbuja -> queda pegada arriba de donde escribes
   (la X la quita) -> tu respuesta lleva la cita encima; tocar la cita lleva al original.
   Si el original vino de WhatsApp, la respuesta sale a ESA persona como respuesta a ese
   mensaje (cita_texto; el programa de la Mac v12 la liga). */
/* build 177 (Salvador 2026-10-02 19:11): los avisos de Claude ("ya venció", "segunda vez
   que te pregunto", "llevas N días esperando") ya atendidos se pliegan en UN renglon chiquito
   ("6 avisos de vencimiento"); a un toque se ven. Nada se borra. Atendido = la tarea se cerro
   o despues del aviso contesto una persona. */
var AVISO_RX=/^(Ya venci[oó] |Segunda vez que te pregunto|Van \d+ veces|Vas \d+ d[ií]as? atr[aá]s|Te falta “|Llevas \d+ d[ií]as? esperando|Retomemos “|Propongo partir “|Vamos por “|Sigue “|“[^”]+” (ya pas[oó] su fecha|va un poco atr[aá]s|estaba para el))/;   /* build 282: textos nuevos del correteo */
function esAvisoClaude(x){ return !!x && (x.aviso===1 || ((x.k==="bal"||x.k==="bi") && !x.wa_in && AVISO_RX.test(String(x.t||"")))); }
function avisosPlegados(t){
  var ms=t.msgs||[], res={set:{}, ult:-1, n:0};
  if((window.__avExp||{})[t.id]) return res;
  var cerrada=!!t.cierre || estadoReal(t)==="cerrada", ultPersona=-1;
  for(var i=0;i<ms.length;i++){ var m=ms[i]; if(m && (m.k==="bo" || m.wa_in===1)) ultPersona=i; }
  for(var j=0;j<ms.length;j++){ if(esAvisoClaude(ms[j]) && (cerrada || j<ultPersona)){ res.set[j]=1; res.ult=j; res.n++; } }
  if(res.n<1) res.set={};
  return res;
}
/* ===== build 178 (Salvador 2026-10-02 19:59, maquetas "canales dentro de la tarea" y
   "canales v2" aprobadas): CANALES dentro de una tarea. Una sola tarea; arriba una
   pastilla dice donde estas y DONDE ESTAS = A QUIEN LE LLEGA. Canales: Todo (todo junto) ·
   Equipo (interno + lo que mandan los proveedores) · el dueño (privado tu y el) · un canal
   por externo (su WhatsApp; solo ve lo suyo). En Todo/Equipo lo que escribes es para el
   equipo; si nombras a un externo, se pregunta antes de mandarselo. Nada se borra. ===== */
var CNL_COL={todo:"#bf5af2",equipo:"#30d158",dm:"#64d2ff"};
var CNL_EXT=["#0a84ff","#ff9f0a","#ff375f","#ffd60a","#5e5ce6","#66d4cf","#ac8e68"];
function _nn(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim(); }
function esDelEquipo(nombre){ var n=_nn(nombre).split(" ")[0]; return !!n && Object.keys(PERSONAS).some(function(k){ return _nn(PERSONAS[k].nombre)===n || k===n; }); }
/* ===== build 193 (F38, Salvador 2026-10-04 00:08/00:14): MISMO FORMATO EN TODAS =====
   Una persona se reconoce por su TELEFONO/contacto cuando el mensaje lo trae, no por el
   nombre escrito; los varios nombres de una misma persona ("Samuel Gamez ciper" y "Samuel
   Gamez") cuentan como UNO. Alguien del equipo que platica por WhatsApp (Samuel) tiene su
   canal "dm:<clave>" que sale por su WhatsApp; un externo, "ext:<nombre canonico>". Sirve
   con tareas viejas (sin chat/origen/bandeja_id): solo usa wa_c / wa_auto / chat. */
function _telDe(x){
  var v=x&&(x.tel||x.wa_tel||x.telefono||x.numero||x.wa_num||x.jid||"");
  if(!v && x && /^\+?\d[\d\s-]{7,}(@.*)?$/.test(String(x.chat||""))) v=x.chat;
  var d=String(v||"").replace(/@.*$/,"").replace(/\D/g,"");
  return d.length>=8 ? d.slice(-10) : "";
}
function _nomWA(x){ var c=x&&(x.wa_auto||x.wa_c||""); if(!c && x && x.chat && !_telDe({chat:x.chat}) && /^wa_/.test(x.origen||"")) c=x.chat; return String(c||"").trim(); }
function esMsgWA(x){
  if(!x || !_nomWA(x) || /^grupo\b/i.test(_nomWA(x))) return false;
  return x.wa_in===1 || x.wa_in===0 || !!x.wa_auto || !!x.wa || /^wa_/.test(String(x.origen||""));
}
function miembroDeNombre(nombre){
  var n=_nn(nombre).split(/\s+/)[0]; if(!n) return null;
  var ks=Object.keys(PERSONAS).filter(function(k){ return _nn(PERSONAS[k].nombre).split(/\s+/)[0]===n || k===n; });
  return ks.length===1?ks[0]:null;
}
/* identidades de WhatsApp de la tarea: [{id, nombre (canonico), alias:[...], eq:clave|null, n}] */
var _cwMemo={};
function contactosWA(t){
  var ms=t.msgs||[], ul=ms[ms.length-1], mk=(t.id||"")+"|"+ms.length+"|"+((ul&&ul.ts)||"")+"|"+yo;
  if(_cwMemo.k===mk && _cwMemo.t===t) return _cwMemo.v;
  var v=_contactosWA(t); _cwMemo={k:mk, t:t, v:v}; return v;
}
function _contactosWA(t){
  var g=[];
  function tok(n){ return _nn(n).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(Boolean); }
  function mismo(a,b){ var x=tok(a), y=tok(b); if(!x.length||!y.length) return false;
    var c=x.length<=y.length?x:y, l=c===x?y:x; for(var i=0;i<c.length;i++) if(c[i]!==l[i]) return false;
    return c.length>=2 || x.length===y.length; }
  (t.msgs||[]).forEach(function(x){
    if(!esMsgWA(x)) return;
    var nom=_nomWA(x), tel=_telDe(x), eq=miembroDeNombre(nom), hit=null;
    for(var i=0;i<g.length && !hit;i++){
      var G=g[i];
      if(tel && G.tels.indexOf(tel)>=0) hit=G;
      else if(eq && G.eq===eq) hit=G;
      else if(!(tel && G.tels.length) && G.alias.some(function(a){ return mismo(a,nom); })) hit=G;
    }
    if(!hit){ hit={id:"", nombre:nom, alias:[], tels:[], eq:eq, n:0, cuenta:{}}; g.push(hit); }
    if(hit.alias.indexOf(nom)<0) hit.alias.push(nom);
    if(tel && hit.tels.indexOf(tel)<0) hit.tels.push(tel);
    hit.cuenta[nom]=(hit.cuenta[nom]||0)+1; hit.n++;
  });
  g.forEach(function(G){
    G.nombre=G.alias.slice().sort(function(a,b){ return (G.cuenta[b]-G.cuenta[a]) || (b.length-a.length); })[0];
    G.id=G.eq?"dm:"+G.eq:"ext:"+G.nombre; delete G.cuenta;
  });
  return g.filter(function(G){ return G.eq!==yo; });
}
function _contactoDeNombre(t, nom){
  var l=contactosWA(t), n=_nn(nom);
  for(var i=0;i<l.length;i++) if(l[i].alias.some(function(a){ return _nn(a)===n; })) return l[i];
  return null;
}
function canalDe(x, t){
  if(!x) return "equipo";
  if(x.canal){
    if(t && x.canal.indexOf("ext:")===0){ var C0=_contactoDeNombre(t, x.canal.slice(4)); if(C0) return C0.id; }
    return x.canal;
  }
  if(esMsgWA(x)){
    var nom=_nomWA(x);
    if(t){ var C=_contactoDeNombre(t, nom); if(C) return C.id; }
    var eq=miembroDeNombre(nom); if(eq) return eq===yo?"equipo":"dm:"+eq;
    if(!esDelEquipo(nom)) return "ext:"+nom;
  }
  return "equipo";
}
function externosDe(t){
  return contactosWA(t).filter(function(G){ return !G.eq; }).map(function(G){ return G.nombre; });
}
/* nombre con el que el programa de la Mac encuentra a la persona en WhatsApp */
function nombreWADe(t, cid){ var G=contactosWA(t).filter(function(x){ return x.id===cid; })[0]; return G?G.nombre:""; }
function canalesDe(t){
  var l=[{id:"todo",nom:"Todo",sub:"todo junto, para leer",col:CNL_COL.todo}];
  var eq=[]; if(PERSONAS[yo]) eq.push("tú"); if(t.duenio && t.duenio!==yo && PERSONAS[t.duenio]) eq.push(PERSONAS[t.duenio].nombre);
  l.push({id:"equipo",nom:"Equipo",sub:(eq.length>1?eq.join(" y ")+" · ":"")+"con lo que mandan los externos",col:CNL_COL.equipo});
  /* build 193: un canal por persona del equipo involucrada (dueño, encargado o quien platica por
     WhatsApp); si tiene WhatsApp en la tarea, lo que le escribes sale a su WhatsApp */
  var _dmV={}, _cw=contactosWA(t);
  function _dm(k){ if(!k || k===yo || !PERSONAS[k] || _dmV[k]) return; _dmV[k]=1;
    var wa=_cw.filter(function(G){ return G.eq===k; })[0];
    l.push({id:"dm:"+k,nom:PERSONAS[k].nombre,sub:wa?"su WhatsApp · solo tú y "+PERSONAS[k].nombre:"solo tú y "+PERSONAS[k].nombre,col:CNL_COL.dm,wa:wa?wa.nombre:""}); }
  _dm(t.duenio); _dm((encargadoDe(t)||{}).id);
  _cw.forEach(function(G){ if(G.eq) _dm(G.eq); });
  if(soySupervisor(t)) l.push({id:"sup",nom:"Supervisión",sub:"solo supervisores · "+((PERSONAS[t.duenio]||{}).nombre||"el dueño")+" no lo ve",col:"#ffd60a"});
  externosDe(t).forEach(function(n,i){ l.push({id:"ext:"+n,nom:n,sub:"externo · por WhatsApp · solo ve lo suyo",col:CNL_EXT[i%CNL_EXT.length],ext:true,wa:n}); });
  return l;
}
function canalActual(t){
  window.__cnl=window.__cnl||{};
  var c=window.__cnl[t.id], l=canalesDe(t);
  if(c && l.some(function(x){ return x.id===c; })) return l.filter(function(x){ return x.id===c; })[0];
  /* al abrir: si la tarea es la plática con UN solo externo (lo ultimo es suyo), su canal;
     asi contestarle sigue saliendo por WhatsApp como en el build 175 */
  /* build 193 (F38): si la tarea es la platica con UNA persona por WhatsApp (externo o del
     equipo, como Samuel), se abre en su canal: la pastilla y la caja dicen a quien le llega. */
  var ex=l.filter(function(x){ return x.wa; });
  var _equipo=(t.duenio && t.duenio!==yo && !ex.some(function(x){ return x.id==="dm:"+t.duenio; })) ||
    (t.msgs||[]).some(function(x){ return x && x.de && x.de!==yo && PERSONAS[x.de] && !ex.some(function(c){ return c.id==="dm:"+x.de; }); });
  if(ex.length===1 && !_equipo){ window.__cnl[t.id]=ex[0].id; return ex[0]; }
  window.__cnl[t.id]="todo"; return l[0];
}
function msgEnCanal(x, cid, t){
  var c=canalDe(x, t);
  if(cid==="sup") return c==="sup";
  if(cid==="todo") return c.indexOf("dm:")!==0 || c==="dm:"+yo || (x.de===yo) || cid===c || true;
  if(cid==="equipo") return c==="equipo" || (c.indexOf("ext:")===0 && (x.wa_in===1) && !!(x.url||x.tipo&&x.tipo!=="texto")) || (x.k!=="bo" && c==="equipo");
  return c===cid;
}
function colorExt(t, nombre){ var l=canalesDe(t).filter(function(x){ return x.id==="ext:"+nombre; })[0]; return l?l.col:"#0a84ff"; }
/* build 219 (Salvador 10:15): en la franja de canales SOLO primer nombre y primer apellido: sin apodos entre comillas,
   sin parentesis, sin emojis ni siglas sueltas ("Eduardo Madero "Lalo" (padel Verde) LNN" -> "Eduardo Madero").
   Las particulas se conservan ("Juan de la Garza"). El nombre completo sigue en el menu desplegable. */
function nombreCorto(n){
  var o0=String(n==null?"":n).trim();
  var s=o0.replace(/["“”«»][^"“”«»]*["“”«»]/g," ").replace(/(^|\s)['‘’][^'‘’]*['‘’](?=\s|$)/g," ").replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g," ");
  try{ s=s.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu," "); }catch(e){}
  var w=s.split(/\s+/).map(function(x){ return x.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'.-]/g,"").replace(/^[.'-]+|[.'-]+$/g,""); })
    .filter(function(x){ return x && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(x); });
  while(w.length>1 && /^(dr|dra|ing|lic|arq|sr|sra|srita|don|do[nñ]a|mtro|mtra|c\.?p)\.?$/i.test(w[0])) w.shift();   /* titulos: "Dr. Arturo Ramírez" -> "Arturo Ramírez" */
  if(!w.length) return o0;
  var part=/^(de|del|la|las|los|y|da|das|do|dos|van|von|di|le)$/i, o=[w[0]], i=1;
  while(i<w.length && part.test(w[i]) && o.length<4){ o.push(w[i]); i++; }
  if(i<w.length && !(w[i].length<=4 && w[i]===w[i].toUpperCase() && w[i].length>1 && o.length===1 && i===w.length-1)) o.push(w[i]);
  return o.join(" ");
}
function vPastilla(t){
  /* build 227 (Salvador 16:24): UNA sola pastilla chica "Todo ▾"; la hoja trae Todo · Claude · cada integrante.
     Lo elegido reemplaza el texto ("Claude ▾", "Eduardo ▾"). Va en el renglon del Resumen. */
  var c=canalActual(t), cl=modoClaude(t), v=vista230(t);
  var tx=v==="imp"?"Importante":(cl||v==="claude"?"Claude":(c.id==="todo"?"Todo":nombreCorto(nombreVisible(c.nom, t)).split(" ")[0]));
  return '<button class="chip225 fil227'+(cl||v||c.id!=="todo"?' on':'')+'" id="cnlpill" data-fil227="1" aria-label="Ver: '+esc(tx)+'">'+esc(tx)+ico("down",13)+'</button>';   /* build 228: ficha igual a las demas */
}
function abreFiltro(t){
  var c=canalActual(t), cl=modoClaude(t), vv=vista230(t);
  /* build 230: Todo · Importante · Claude · integrantes · agregar o quitar */
  var ops=[{id:"imp",nom:"Importante",sub:"acuerdos y conclusiones",on:vv==="imp"},{id:"todo",nom:"Todo",sub:"todo junto",on:!cl&&!vv&&c.id==="todo"},   /* build 235: Importante primero */{id:"claude",nom:"Claude",sub:"lo que le pediste y lo que contestó",on:cl||vv==="claude"}];
  canalesDe(t).forEach(function(x){ if(x.id==="todo" || (x.id==="equipo" && !hayEquipo(t))) return; var nv=nombreVisible(x.nom, t); ops.push({id:x.id,nom:nv,sub:/^Contacto sin nombre/.test(nv)?"no está en tu agenda":x.sub,on:!cl&&!vv&&x.id===c.id,av:x.id.indexOf("dm:")===0||x.id.indexOf("ext:")===0}); });
  var bg=document.createElement("div"); bg.className="cnlbg";
  var sh=document.createElement("div"); sh.className="cnlsheet fil227h";
  sh.innerHTML='<div class="hh"></div>'+ops.map(function(o){
    var ic=o.id==="todo"?ico("bubble",20):(o.id==="imp"?ico("check",20):o.id==="claude"?ico("info",20):(o.av?'<span class="av227">'+esc(inicialesDe(o.nom))+'</span>':ico("people",20)));
    return '<button class="cnlop227'+(o.on?' on':'')+'" data-fil="'+esc(o.id)+'">'+ic+'<span>'+esc(o.nom)+'<small>'+esc(o.sub||"")+'</small></span>'+(o.on?ico("check",18):'')+'</button>'; }).join("")+
    '<button class="cnlop227 tenue" data-fil="__int">'+ico("plus",20)+'<span>Invitar a nuevo miembro<small>agregar o quitar integrantes</small></span></button>';
  function cierra(){ if(bg.parentNode) bg.parentNode.removeChild(bg); if(sh.parentNode) sh.parentNode.removeChild(sh); }
  bg.onclick=cierra;
  Array.prototype.forEach.call(sh.querySelectorAll("[data-fil]"),function(b){ b.onclick=function(){ var id=b.getAttribute("data-fil"); cierra();
    if(id==="__int"){ abreIntegrantes(t); return; }
    window.__cnlClaude=window.__cnlClaude||{}; window.__cnl=window.__cnl||{};
    if(id==="claude" || id==="imp"){ poneVista(t, id); window.__cnl[t.id]="todo"; }
    else { poneVista(t, ""); window.__cnl[t.id]=id; }
    render(); }; });
  document.body.appendChild(bg); document.body.appendChild(sh);
}
/* build 186 (Salvador 2026-10-03 08:17): en "Todo" sin nombrar a nadie, el mensaje es para el
   RESPONSABLE: si la tarea es mia y la esta haciendo un externo, ese externo (el ultimo que escribio
   si hay varios); si la lleva alguien del equipo, ya le llega en la app (no se manda por WhatsApp). */
function responsableExt(t){
  if(!t || (t.duenio && t.duenio!==yo)) return null;
  var ex=externosDe(t); if(!ex.length) return null;
  if(ex.length===1) return ex[0];
  var ms=t.msgs||[];
  for(var i=ms.length-1;i>=0;i--){ var c=canalDe(ms[i]||{}, t); if(c.indexOf("ext:")===0) return c.slice(4); }
  return null;
}
function phCanal(t){
  var c=canalActual(t);
  if(modoClaude(t)) return "Indicación para Claude…";
  if(waDest(t) && !modoWA(t)) return "Indicación para Claude…";   /* build 254: por defecto el cuadro es para Claude */
  if(c.id==="todo"){ var _rx=responsableExt(t); if(_rx) return "Mensaje para "+nombreVisible(_rx, t)+" por WhatsApp…"; }   /* 231: nunca el numero */
  if(c.id==="sup") return "Nota de supervisor…";
  if(c.ext) return "Mensaje a "+nombreVisible(c.nom, t)+" por WhatsApp…";
  if(c.id.indexOf("dm:")===0) return c.wa?"Mensaje a "+c.nom+" por WhatsApp…":"Mensaje solo a "+c.nom+"…";
  if(canalesDe(t).length<=2) return "";
  return "Mensaje al equipo…";
}
function externoNombrado(t, v){
  var n=" "+_nn(v).replace(/[^a-z0-9ñ ]+/g," ")+" ";
  var hit=null;
  externosDe(t).forEach(function(e){ var w=_nn(e).split(" ")[0]; if(!hit && w.length>=3 && n.indexOf(" "+w+" ")>=0) hit=e; });
  return hit;
}
/* build 215 (Salvador 8:52: "muy triste"): hoja de accion inferior estilo Apple, con desenfoque. "Para Claude" con un
   destello propio en el naranja de Claude (#D97757; no es el logo) y "Mandar a <nombre>" con un globo de mensaje generico
   de linea en verde. "A todo el equipo" queda chico (era la opcion de antes) y "Cancelar" abajo. */
var SVG_DESTELLO='<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c.5 4.9 2.6 7 7.5 7.5v.1c-4.9.5-7 2.6-7.5 7.5h-.1c-.5-4.9-2.6-7-7.4-7.5V10c4.8-.5 6.9-2.6 7.4-7.5z"/><path d="M19 15.5c.25 2 1.1 2.85 3 3.05v.05c-1.9.2-2.75 1.05-3 3h-.05c-.2-1.95-1.05-2.8-2.95-3v-.05c1.9-.2 2.75-1.05 2.95-3.05z"/></svg>';
var SVG_CHAT='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.3.3-.8 0-.8-.4V16h0A2.5 2.5 0 0 1 4 13.5z"/><path d="M8.5 9.5h7M8.5 12.5h4"/></svg>';
/* build 216 (Salvador): "Para mí (nota)": dato o avance que solo ve el; no sale por WhatsApp, no avisa a nadie,
   Claude no la toma como orden pero si la lee como contexto y entra en la busqueda. "A todo el equipo" sale solo
   si hay otra persona de Doit en la tarea (no=null si no). Orden: Claude, Mandar a, A todo el equipo, Para mí, Cancelar. */
var SVG_LAPIZ='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M14.5 7.5l3 3"/><path d="M13 20h7"/></svg>';
function hayEquipo(t){ return integrantesDe(t).some(function(x){ return x.k!==yo && !!PERSONAS[x.k]; }); }
function notaParaMi(t, v){
  msg(t,"bo",v); var m=t.msgs[t.msgs.length-1]; m.de=yo; m.canal="priv:"+yo; m.nota_mia=1;
  guarda(t); render(); try{ toast("Nota guardada · solo tú la ves"); }catch(e){}
  return m;
}
function preguntaExterno(nombre, v, si, no, paraClaude, paraMi){
  var bg=document.createElement("div"); bg.className="acveil";
  var p=document.createElement("div"); p.className="acsheet"; p.setAttribute("role","dialog");
  p.innerHTML='<div class="acg"><div class="act"><b>¿Para quién es?</b><span>“'+esc(v.length>110?v.slice(0,109)+"…":v)+'”</span></div>'+
    (paraClaude?'<button class="aco acl" data-ac="claude"><span class="aci">'+SVG_DESTELLO+'</span><span><b>Para Claude</b><small>Lo aplica en la tarea</small></span></button>':'')+
    '<button class="aco awa" data-ac="wa"><span class="aci">'+SVG_CHAT+'</span><span><b>Mandar a '+esc(nombre)+'</b><small>Por WhatsApp</small></span></button>'+
    (no?'<button class="acmin" data-ac="equipo">A todo el equipo</button>':'')+
    (paraMi?'<button class="aco ami" data-ac="mia"><span class="aci">'+SVG_LAPIZ+'</span><span><b>Para mí (nota)</b><small>Solo tú la ves · no se manda</small></span></button>':'')+'</div>'+
    '<button class="acx" data-ac="cancel">Cancelar</button>';
  function cierra(){ if(bg.parentNode) bg.parentNode.removeChild(bg); if(p.parentNode) p.parentNode.removeChild(p); }
  var cancela=function(){ cierra(); var ta=$("txt"); if(ta){ ta.value=v; try{ ta.dispatchEvent(new Event("input",{bubbles:true})); }catch(e){} ta.focus(); } };
  p.querySelector('[data-ac="wa"]').onclick=function(){ cierra(); si(); };
  if(paraClaude) p.querySelector('[data-ac="claude"]').onclick=function(){ cierra(); paraClaude(); };
  if(no) p.querySelector('[data-ac="equipo"]').onclick=function(){ cierra(); no(); };
  if(paraMi) p.querySelector('[data-ac="mia"]').onclick=function(){ cierra(); paraMi(); };
  p.querySelector('[data-ac="cancel"]').onclick=cancela;
  bg.onclick=cancela;
  document.body.appendChild(bg); document.body.appendChild(p);
}
/* candado: lo que va a un externo no debe nombrar a OTRO externo (precios, comparativas) */
function candadoExterno(t, destino, v, sigue){
  var otro=null, n=" "+_nn(v)+" ";
  externosDe(t).forEach(function(e){ if(otro || _nn(e)===_nn(destino)) return; var w=_nn(e).split(" ")[0]; if(w.length>=3 && n.indexOf(w)>=0) otro=e; });
  if(!otro){ sigue(); return; }
  var bg=document.createElement("div"); bg.className="cnlbg";
  var p=document.createElement("div"); p.className="extpop";
  p.innerHTML='<b>Ojo</b><p>Esto menciona a <b style="display:inline;font-size:inherit">'+esc(otro)+'</b>. ¿Seguro se lo mando a <b style="display:inline;font-size:inherit">'+esc(destino)+'</b>?</p><button class="no">Corregir</button><button class="si" style="background:#FF2D55">Mandar así</button>';
  function cierra(){ if(bg.parentNode) bg.parentNode.removeChild(bg); if(p.parentNode) p.parentNode.removeChild(p); }
  p.querySelector(".si").onclick=function(){ cierra(); sigue(); };
  p.querySelector(".no").onclick=function(){ cierra(); var tx=$("txt"); if(tx){ tx.value=v; try{ tx.focus(); }catch(e){} } };
  document.body.appendChild(bg); document.body.appendChild(p);
}
/* manda a un externo: se guarda en SU canal y sale por WhatsApp (programa de la Mac) */
function mandaAExterno(t, nombre, v, cita, canal, alId){
  msg(t,"bo",v); var m=t.msgs[t.msgs.length-1]; m.canal=canal||("ext:"+nombre); m.wa_auto=nombre; m.de=yo;
  if(cita) m.cita={ix:cita.ix, de:cita.de, t:String(cita.t).slice(0,300)};
  t.ultima=((PERSONAS[yo]||{}).nombre||"")+" → "+nombre+": "+v; guarda(t); render();
  var cpo={usuario:yo, tarea_id:t.id, contacto:nombre, texto:v, auto_respuesta:1, desde_ts:Date.now()};
  if(cita && cita.t) cpo.cita_texto=String(cita.t).slice(0,300);
  pideWhatsApp(cpo).then(function(j){ var pid=(j&&(j.id||j.pedido_id))||null; if(pid){ m.wa_pid=pid; guarda(t); if(alId) try{ alId(pid); }catch(e){} if(vista==="hilo"&&abierta===t.id) render(); setTimeout(function(){ consultaEstadosWA(t); }, 15000); } })
    .catch(function(e){ msg(t,"bi","No se pudo mandar a "+nombre+" por WhatsApp ("+String((e&&e.message)||e).slice(0,60)+")."); guarda(t); if(vista==="hilo") render(); });
  toast("A "+nombre+" por WhatsApp");
}
/* ===== build 217 (Salvador 2026-10-05 9:20 y 9:23): "todos los avisos iguales, por WhatsApp" =====
   "A todo el equipo": queda en el canal equipo Y sale por WhatsApp a cada integrante de Doit de la tarea que
   tenga su WhatsApp en la tarea (nunca a Salvador ni a quien escribe). Misma cola que "Mandar a": un pedido
   por persona, con los 30 s para deshacer. Lo que escribe a mano sale SIN "IA:". */
function equipoConWA(t){
  var cw=[], out=[], vis={};
  try{ cw=contactosWA(t); }catch(e){}
  integrantesDe(t).forEach(function(x){ var k=x.k;
    if(!k || k===yo || k==="salvador" || !PERSONAS[k] || vis[k]) return;
    var G=cw.filter(function(g){ return g.eq===k; })[0]; if(!G || !G.nombre) return;
    vis[k]=1; out.push({k:k, c:G.nombre}); });
  return out;
}
function mandaAlEquipo(t, v, cita){
  msg(t,"bo",v); var m=t.msgs[t.msgs.length-1]; m.canal="equipo"; m.de=yo;
  if(cita) m.cita={ix:cita.ix, de:cita.de, t:String(cita.t).slice(0,300)};
  var l=equipoConWA(t);
  if(l.length){ m.wa_eq=l.map(function(p){ return p.c; }); m.wa_pids={}; }
  guarda(t); render();
  l.forEach(function(p){
    var cpo={usuario:yo, tarea_id:t.id, contacto:p.c, texto:v, auto_respuesta:1, desde_ts:Date.now()};
    pideWhatsApp(cpo).then(function(j){ var pid=(j&&(j.id||j.pedido_id))||null;
        if(pid){ m.wa_pids[p.c]=pid; guarda(t); if(vista==="hilo"&&abierta===t.id) render(); setTimeout(function(){ consultaEstadosWA(t); }, 15000); } })
      .catch(function(e){ msg(t,"bi","No se pudo mandar a "+p.c+" por WhatsApp ("+String((e&&e.message)||e).slice(0,60)+")."); guarda(t); if(vista==="hilo") render(); });
  });
  if(l.length) toast("Al equipo · por WhatsApp a "+l.map(function(p){ return String(p.c).split(" ")[0]; }).join(" y "));
  return m;
}
/* PALOMITAS (como WhatsApp): reloj = en cola · ✓ = enviado · ✓✓ gris = entregado · ✓✓ azul = leido.
   El estado es el del PEDIDO en la cola del servidor (estado, enviado_en, entregado_en, leido_en), ligado al
   mensaje por wa_pid (Mandar a) o wa_pids (A todo el equipo: una palomita = la del que va mas atras, como un grupo).
   "Para mí (nota)", "Para Claude" y lo que no salio por WhatsApp NO llevan palomitas. Nunca se inventa: si el
   servidor no contesta, se queda en lo ultimo que se supo (al crear el pedido: en cola). */
var WA_EST={};
function nivelWA(e){
  if(!e) return 0;
  if(typeof e.n==="number") return e.n;
  var st=String(e.estado||"").toLowerCase();
  if(e.leido_en || st==="leido" || st==="leído" || st==="respondido") return 3;
  if(e.entregado_en || st==="entregado") return 2;
  if(e.enviado_en || st==="enviado") return 1;
  if(st==="cerrado") return -1;
  return 0;
}
function llevaPalomitas(x){
  if(!x || x.nota_mia || x.nota_claude || x.prog || x.wa_can || x.wa_in===1) return false;
  return !!(x.wa_auto || x.wa_pid || (x.wa_eq && x.wa_eq.length));
}
function pidsWA(x){
  if(!x) return [];
  if(x.wa_eq && x.wa_eq.length) return x.wa_eq.map(function(c){ return (x.wa_pids||{})[c]||null; });
  return [x.wa_pid||null];
}
function nivelMsgWA(x){
  var ns=pidsWA(x).map(function(p){ return p ? nivelWA(WA_EST[p]||(x.wa_st||{})[p]) : 0; });
  var vivos=ns.filter(function(n){ return n>=0; });
  if(!vivos.length) return -1;
  return Math.min.apply(null, vivos);
}
var SVG_WA_RELOJ='<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.4"/></svg>';
var SVG_WA_1='<svg viewBox="0 0 16 16" width="16" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.6l3 3L13 4.6"/></svg>';
var SVG_WA_2='<svg viewBox="0 0 20 16" width="20" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 8.6l3 3L11.5 4.6"/><path d="M8.6 11.2l.4.4L16 4.6"/></svg>';
function palomitasHTML(x){
  if(!llevaPalomitas(x)) return "";
  var n=nivelMsgWA(x);
  if(n<0) return "";
  var nom=["En cola","Enviado","Entregado","Leído"][n];
  return '<span class="wtk w'+n+'" data-wtk="'+n+'" role="img" aria-label="'+nom+'">'+(n===0?SVG_WA_RELOJ:(n===1?SVG_WA_1:SVG_WA_2))+'</span>';
}
/* lee del servidor el estado de los pedidos de la tarea abierta. build 220 (Carlos 10:12): LECTURA = wa_estados (plural)
   POST {usuario, ids:[...]} (tope 200) -> {pedidos:[{id, estado, enviado_en, entregado_en, leido_en, tarea_id, contacto}],
   no_encontrados:[...]}; horas vacias = null. (wa_estado, singular, es la de ESCRITURA de la Mac: no se usa aqui.)
   Los no_encontrados se dejan de pedir (quedan marcados en el mensaje). Si el servidor dice que la accion no existe,
   se deja de preguntar en esta sesion; cualquier otra falla solo salta esa vuelta. Sin avisos de falla. */
var WA_EST_TOPE=200;
function _estadosDe(j){
  if(!j || j.error) return null;
  var l=j.pedidos||j.estados||j.lista||j.items||(Array.isArray(j)?j:null);
  if(l && !Array.isArray(l) && typeof l==="object") l=Object.keys(l).map(function(k){ return Object.assign({id:k}, l[k]); });
  return Array.isArray(l)?l:(Array.isArray(j.no_encontrados)?[]:null);
}
function aplicaEstadosWA(t, l, noEnc){
  var cambio=false;
  (noEnc||[]).forEach(function(id){ id=String(id); (t.msgs||[]).forEach(function(x){ if(!llevaPalomitas(x)) return;
    if(pidsWA(x).indexOf(id)<0) return; x.wa_st=x.wa_st||{}; var a=x.wa_st[id]||{n:nivelWA(WA_EST[id])};
    if(!a.ne){ x.wa_st[id]={n:a.n||0, e:a.e||"", ne:1}; cambio=true; } }); });
  (l||[]).forEach(function(e){ if(!e || e.id==null) return; var id=String(e.id); WA_EST[id]=e; });
  (t.msgs||[]).forEach(function(x){ if(!llevaPalomitas(x)) return;
    pidsWA(x).forEach(function(p){ if(!p || !WA_EST[p]) return; var n=nivelWA(WA_EST[p]);
      x.wa_st=x.wa_st||{}; var a=x.wa_st[p];
      if(!a || a.n!==n){ x.wa_st[p]={n:n, e:String(WA_EST[p].estado||"")}; cambio=true; } }); });
  return cambio;
}
function consultaEstadosWA(t){
  if(!t || window.__waEstNo) return Promise.resolve(false);
  if(typeof APP_TOKEN==="undefined" || String(APP_TOKEN).indexOf("__")===0) return Promise.resolve(false);
  var ids=[];
  (t.msgs||[]).forEach(function(x){ if(!llevaPalomitas(x)) return; if(x.ts && Date.now()-x.ts>7*24*3600*1000) return;
    pidsWA(x).forEach(function(p){ if(!p) return; var g=(x.wa_st||{})[p]; if(g && g.ne) return; var n=nivelWA(WA_EST[p]||g); if(n>=0 && n<3 && ids.indexOf(p)<0) ids.push(p); }); });
  if(!ids.length) return Promise.resolve(false);
  ids=ids.slice(-WA_EST_TOPE);   /* tope del servidor: los mas recientes */
  return llamaServidor(PUSH+"?action=wa_estados",{method:"POST",
      headers:{"content-type":"application/json","x-app-token":APP_TOKEN}, body:JSON.stringify({usuario:yo, ids:ids})})
    .then(function(r){ return r.json().catch(function(){ return {error:"HTTP "+r.status}; }); })
    .then(function(j){ var l=_estadosDe(j);
      if(!l){ if(/desconocid|no existe|unknown|invalid action|accion no|HTTP 404/i.test(String((j&&(j.error||j.message))||""))) window.__waEstNo=1; return false; }
      if(aplicaEstadosWA(t, l, Array.isArray(j.no_encontrados)?j.no_encontrados:[])){ guarda(t); if(vista==="hilo" && abierta===t.id) render(); return true; } return false; })
    .catch(function(){ return false; });
}
setInterval(function(){ try{ if(vista==="hilo" && abierta){ var t=tareas.filter(function(x){ return x.id===abierta; })[0]; if(t) consultaEstadosWA(t); } }catch(e){} }, 20000);
function mandaDM(t, k, v){
  msg(t,"bo",v); var m=t.msgs[t.msgs.length-1]; m.canal="dm:"+k; m.de=yo;
  t.ultima=((PERSONAS[yo]||{}).nombre||"")+": "+v; guarda(t);
  try{ disparaPushInstantaneo(k, (PERSONAS[yo]||{}).nombre||"Mensaje", v, urlTarea(t.id), "asignado"); }catch(e){}
  render();
}
function partesMsg(x){
  var tx=String((x&&(x.tr||x.t))||""), mm=tx.match(/^([^:\n]{1,24}):\s*([\s\S]*)$/);
  var de=x&&x.wa_c?String(x.wa_c):"";
  if(mm && (x.wa_in||x.wa_c||x.origen)){ de=de||mm[1]; tx=mm[2]; }
  if(!de) de=(x&&x.de&&PERSONAS[x.de])?PERSONAS[x.de].nombre:(x&&x.k==="bo"?((PERSONAS[yo]||{}).nombre||""):"Claude");
  return {de:de, t:tx.trim()};
}
function citaHTML(x){
  if(!x || !x.cita) return "";
  return '<span class="qcita" data-irmsg="'+esc(String(x.cita.ix))+'"><b>'+esc(x.cita.de||"")+'</b><span>'+esc(String(x.cita.t||"").slice(0,160))+'</span></span>';
}
function ponCita(t, ix){
  var x=(t.msgs||[])[ix]; if(!x) return;
  var p=partesMsg(x);
  window.__cita={tid:t.id, ix:ix, de:p.de, t:p.t, wa:(x.wa_in===1?(x.wa_c||p.de):"")};
  var _cx2=canalDe(x, t); if(_cx2.indexOf("ext:")===0 || (_cx2.indexOf("dm:")===0 && nombreWADe(t,_cx2))){ window.__cnl=window.__cnl||{}; if(window.__cnl[t.id]!==_cx2){ window.__cnl[t.id]=_cx2; render(); } }
  try{ if(navigator.vibrate) navigator.vibrate(10); }catch(e){}
  pintaCitaBarra(t);
  var tx=$("txt"); if(tx) try{ tx.focus(); }catch(e){}
}
function pintaCitaBarra(t){
  var vieja=document.getElementById("rqbar"); if(vieja) vieja.parentNode.removeChild(vieja);
  var c=window.__cita; if(!c || c.tid!==t.id) return;
  var comp=document.querySelector(".comp"); if(!comp) return;
  var d=document.createElement("div"); d.id="rqbar"; d.className="rqbar";
  d.innerHTML='<span class="qcita"><b>'+esc(c.de)+'</b><span>'+esc(String(c.t).slice(0,160))+'</span></span><button type="button" aria-label="Quitar">✕</button>';
  d.querySelector("button").onclick=function(ev){ ev.stopPropagation(); window.__cita=null; pintaCitaBarra(t); };
  comp.insertBefore(d, comp.firstChild);
}
function pegaCita(t, v, c){
  if(!c) return;
  function hazlo(){
    var ms=t.msgs||[];
    for(var i=ms.length-1;i>=0 && i>=ms.length-6;i--){ var m=ms[i];
      if(m && m.k==="bo" && !m.cita && (String(m.t||"").trim()===v.trim() || String(m.tr||"").trim()===v.trim())){
        m.cita={ix:c.ix, de:c.de, t:String(c.t).slice(0,300)}; guarda(t); if(vista==="hilo"&&abierta===t.id) render(); return true; } }
    return false;
  }
  if(!hazlo()) setTimeout(hazlo, 400);
}
function bindDeslizar(t){
  Array.prototype.forEach.call(document.querySelectorAll(".msgs [data-mix], .msgs [data-hab]"), function(el){
    var ix=el.hasAttribute("data-mix") ? +el.getAttribute("data-mix") : +String(el.getAttribute("data-hab")).split("|").pop();
    if(isNaN(ix)) return;
    var x0=0,y0=0,dx=0,va=false,no=false;
    el.addEventListener("touchstart",function(e){ var p=e.touches[0]; x0=p.clientX; y0=p.clientY; dx=0; va=false; no=false; el.classList.remove("swback"); },{passive:true});
    el.addEventListener("touchmove",function(e){ if(no) return; var p=e.touches[0], ddx=p.clientX-x0, ddy=p.clientY-y0;
      if(!va){ if(Math.abs(ddy)>12 && Math.abs(ddy)>Math.abs(ddx)){ no=true; return; } if(ddx>10) va=true; else return; }
      dx=Math.max(0,Math.min(70,ddx)); el.style.transform="translateX("+dx+"px)"; },{passive:true});
    el.addEventListener("touchend",function(){ if(!va) return; el.classList.add("swback"); el.style.transform=""; if(dx>=48) ponCita(t, ix); },{passive:true});
  });
  Array.prototype.forEach.call(document.querySelectorAll(".msgs [data-irmsg]"), function(q){
    q.onclick=function(ev){ ev.stopPropagation(); var o=document.querySelector('.msgs [data-mix="'+q.getAttribute("data-irmsg")+'"]');
      if(o){ o.scrollIntoView({behavior:"smooth",block:"center"}); o.classList.add("flash"); setTimeout(function(){ o.classList.remove("flash"); },1200); } };
  });
  pintaCitaBarra(t);
}
/* build 175 (Salvador 2026-10-02 18:33): si lo ultimo en la tarea es un mensaje de
   alguien por WhatsApp (pregunta, pedido, aviso) y Salvador le contesta en el chat de
   la tarea, se le manda por WhatsApp sin decir "dile". Las ordenes a la app (renombrar,
   recuerdame, dile a, pasala a, lista...) NO se mandan. Si Salvador ya le contesto en
   WhatsApp, el programa de la Mac no lo duplica (auto_respuesta + desde_ts). */
function aQuienRespondo(t, v, cita){
  if(!t || t.es_recordatorio || t.cierre || estadoReal(t)==="cerrada") return "";
  if(cita && cita.tid===t.id){
    if(!cita.wa || /^grupo\b/i.test(cita.wa)) return "";
    var s0=String(v||"").trim(); if(s0.length<1 || detectaRenombre(s0) || duenioDicho(s0)) return "";
    return cita.wa;
  }
  var ms=t.msgs||[], x=null;
  for(var i=ms.length-1;i>=0;i--){ var m=ms[i]; if(!m || (m.k==="bi" && m.wa_in!==1)) continue; if(m.k==="bo" && (!m.de || m.de===yo) && !m.wa_in) return ""; x=m; break; }
  if(!x || x.wa_in!==1) return "";
  if(x.ts && Date.now()-x.ts > 3*24*3600*1000) return "";
  var c=String(x.wa_c||conDeOrigen(t)||"").trim();
  if(!c || /^grupo\b/i.test(c) || /^\+?\d[\d\s]+$/.test(c)) return "";
  var s=String(v||"").trim();
  if(s.length<2) return "";
  if(detectaRenombre(s) || duenioDicho(s) || detectaLista(s) || listaNumerada(s).length>=2) return "";
  if(/^\s*(recu[eé]rda(me|le)|av[ií]sa(me|le)|apunta|anota|agrega|p[oó]n(me|le)|c[aá]mbia(le)?|dile|d[ií]gale|m[aá]nda(le|me)|preg[uú]nta(le)?|escr[ií]be(le)?|ll[aá]ma(le|me)|m[aá]rca(le|me)|abre|busca|cierra|ci[eé]rrala|borra|b[oó]rrala|elimina|crea|hazme|haz|recordatorio|alarma|mu[eé]vela|p[aá]sala|reenv[ií]a)\b/i.test(s)) return "";
  return c;
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function respondeAuto(t, v, contacto, cita){
  var desde=Date.now(), cpo={usuario:yo, tarea_id:t.id, contacto:contacto, texto:v, auto_respuesta:1, desde_ts:desde};
  if(cita && cita.t) cpo.cita_texto=String(cita.t).slice(0,300);
  pideWhatsApp(cpo)
    .then(function(j){ var pid=(j&&(j.id||j.pedido_id))||null; marca(pid); })
    .catch(function(e){ msg(t,"bi","No se pudo mandar tu respuesta a "+contacto+" por WhatsApp ("+String((e&&e.message)||e).slice(0,60)+")."); guarda(t); if(vista==="hilo") render(); });
  function marca(pid){
    var ms=t.msgs||[];
    for(var i=ms.length-1;i>=0 && i>=ms.length-6;i--){ var m=ms[i]; if(m && m.k==="bo" && String(m.t||"").trim()===v.trim()){ m.wa_auto=contacto; if(pid) m.wa_pid=pid; guarda(t); if(vista==="hilo"&&abierta===t.id) render(); return; } }
  }
  setTimeout(function(){ marca(null); }, 400);
  toast("Se lo mando a "+contacto+" por WhatsApp");
}
/* contestar "falta informacion": Claude saca nombre, fecha, ritmo, avisos y contexto */
/* build 195: "es dato" / "es tarea" (o "no, es información") */
/* build 236: "vincúlala a X" / "vincúlalo con X" / "vincular a X" al inicio del dictado -> la hoja de Vincular con X ya buscado ("" si no dijo a cuál) */
function vincDicho(v){
  var m=String(v||"").trim().match(/^(?:no,?\s+)?(?:v[ií]nc[uú]la(?:la|lo)?|vincular(?:la|lo)?|v[ií]ncula(?:la|lo)|ligal[ao]|j[uú]ntal[ao])(?:\s+(?:a|al|con|en)\s+(?:(?:la|el)\s+)?(?:tarea\s+)?(?:del?\s+)?(.+?))?[.!]?\s*$/i);
  return m?String(m[1]||"").trim():null;
}
function tipoDicho(v){
  var s=_nn(v);
  if(/^(no,?\s+)?(es|era|esto es|eso es)\s+(un\s+)?(dato|informacion|info)\b/.test(s) || /^(es\s+)?solo\s+(dato|informacion)\b/.test(s)) return "dato";
  if(/^(no,?\s+)?(es|era|esto es|eso es)\s+(una\s+)?tarea\b/.test(s)) return "tarea";
  return "";
}
/* si ya tiene todo: queda autorizada, sale la misma palomita de siempre y brinca a la siguiente */
/* build 209 (Salvador 22:08): YA NO se autoriza sola. Completa -> se queda en "Falta info" con la ficha completa y el
   boton "Autorizar"; solo al picarlo (autorizaRevision) sale la palomita y se va de "Falta info". */
function revisaCompleta(t){
  if(t.autorizada || t.cierre) return false;
  var c=completitud(t); if(!c.completa) return false;
  if(!t.en_revision){ t.en_revision=true; t.pendiente_info=""; t.pendiente_tipo=""; t.falta_fecha=false; if(c.tipo==="dato") t.es_dato=true; guarda(t); }
  return false;
}
function autorizaRevision(t){
  if(!t || t.autorizada || t.cierre) return false;
  var c=completitud(t); if(!c.completa) return false;
  delete t.en_revision; t.autorizada=true; t.autorizada_ts=Date.now(); t.pendiente_info=""; t.pendiente_tipo=""; t.falta_fecha=false;
  if(c.tipo==="dato") t.es_dato=true;
  guarda(t);
  if(vista==="hilo" && abierta===t.id) selloYSigue(t,{tipo:"autorizada", texto:t.nombre, restaurar:null, sinDeshacer:true});
  return true;
}
/* build 195: con el ▾ abierto, lo dictado suma al contexto; si es claramente un mensaje, sigue() */
function agregaContexto(t, v, sigue){
  msg(t,"bo",v); var m=t.msgs[t.msgs.length-1]; m.de=yo; m.canal="priv:"+yo; m.nota_claude=1; guarda(t); render();
  var sys="Eres el asistente de una app de tareas. El usuario tiene abierto el detalle de \""+(t.nombre||"")+"\" y dicto algo. "+
    "Si es informacion o una instruccion sobre la tarea (de que se trata, para que, quien, datos), accion contexto: reescribe el contexto COMPLETO (lo que ya habia + lo nuevo) en 1 a 3 frases y hasta 5 palabras para encontrarla. "+
    "Si claramente es un mensaje para otra persona, accion mensaje. No inventes fechas. Contesta SOLO JSON: {\"accion\":\"contexto|mensaje\",\"contexto\":\"\",\"palabras\":[]}";
  preguntaAClaude([{role:"user",content:sys+"\n\nCONTEXTO ACTUAL: "+(t.contexto||"(nada)")+"\nDICTADO: "+v}],MODO_CEREBRO,function(txt,err){
    var j={}; try{ var mm=String(txt||"").match(/\{[\s\S]*\}/); j=mm?JSON.parse(mm[0]):{}; }catch(e){ j={}; }
    if(!err && j.accion==="mensaje"){
      /* era un mensaje: se quita la nota y sigue el camino normal */
      var i=(t.msgs||[]).indexOf(m); if(i>=0) t.msgs.splice(i,1); guarda(t); sigue(); return; }
    if(err || !j.contexto){ t.contexto=((t.contexto?t.contexto+" ":"")+v).slice(0,600); }
    else { t.contexto=String(j.contexto).trim().slice(0,600); if(Array.isArray(j.palabras) && j.palabras.length) t.palabras=j.palabras.map(function(w){ return String(w).toLowerCase().trim(); }).filter(Boolean).slice(0,6); }
    t.notas_claude=(t.notas_claude||[]).concat([{t:"CONTEXTO: "+v, ts:Date.now()}]).slice(-30);
    guarda(t); toast("Contexto actualizado"); if(!revisaCompleta(t) && vista==="hilo") render();
  });
}
/* build 205: ordenes que NO son completar la tarea (siguen yendo a Claude) */
function ordenClaraClaude(v){
  var s=_fsa(v);
  return /^\s*(oye\s+)?((claude|cloud|clod|claud|klaud|clau)\b[\s,:]*)?(eliminala|eliminalo|elimina|borrala|borralo|borra|tirala|pasasela|pasale(la)?|encargale(la)?|asignale(la)?|cancelala|esto ya no se va a hacer|ya no se va a hacer)\b/.test(s);
}
function sinPrefijoClaude(v){ return String(v||"").replace(/^\s*(oye\s+)?(claude|cloud|clod|claud|klaud|clau)\b[\s,:.-]*/i,"").trim() || String(v||""); }
/* build 205: lo que se puede sacar AL INSTANTE, sin IA, de lo dictado: indefinida, ritmo, fecha y el contexto provisional */
var RITMO_RE=/\b(una vez|dos veces|tres veces|cada)\s+(al|a la|por|cada)?\s*(dia|semana|quincena|mes|bimestre|trimestre|ano|lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b|\b(cada\s+\d+\s+(dias|semanas|meses))\b|\b(mensual|semanal|quincenal|diari)(mente|o|a)?\b/;
/* el ritmo que pidio: si dijo varios ("nos reunimos dos veces al año… un ritmo de una vez al mes"), el que va junto a
   "ritmo / recordar / revisar / seguimiento"; si solo hay uno, ese; si hay varios sin pista, ninguno (que lo diga la IA) */
function ritmoDicho(v){
  var s=_fsa(v), re=new RegExp(RITMO_RE.source,"g"), m, todos=[];
  while((m=re.exec(s))){ todos.push({tx:m[0].trim(), antes:s.slice(Math.max(0,m.index-60), m.index)}); }
  if(!todos.length) return "";
  var pista=todos.filter(function(x){ return /ritmo|recuerd|record|revis|seguimiento|avis/.test(x.antes); });
  var r=pista.length?pista[pista.length-1]:(todos.length===1?todos[0]:null); if(!r) return "";
  return r.tx.replace(/\bano\b/g,"año").replace(/\bdia\b/g,"día").replace(/\bmiercoles\b/g,"miércoles").replace(/\bsabado\b/g,"sábado");
}
function extraeLocal(t, v){
  var s=_fsa(v), hecho=[];
  if(/indefinid|sin\s+fecha|no\s+tiene\s+(fecha|fin)|sin\s+fin|permanente/.test(s) && t.indefinida!==true){ t.indefinida=true; t.falta_fecha=false; hecho.push("indefinida"); }
  var rt=ritmoDicho(v);
  if(rt && !String(t.ritmo||"").trim()){ t.ritmo=conMayuscula(rt); hecho.push("ritmo: "+rt); }
  try{ if(planDesdeDictado(t, v)) hecho.push(lineaPlanTxt(t)); }catch(e){}
  var _l248=aplicaLecturaFechas(t, v, null); hecho=hecho.concat(_l248.hecho);   /* build 248: no termina / antes del / termina cuando */
  if(t.indefinida!==true && !_l248.bloquea){ var fd=fechaDictada(v); if(fd && fd.fecha && !fd.duda){ t.fecha_dictada=true; t.f_original=fd.fecha; t.f_vigente=fd.fecha; t.falta_fecha=false; hecho.push("termina el "+fechaBonita(fd.fecha)); } }
  var pal=String(v).split(/\s+/).filter(function(w){ return w.length>1; }).length;
  if(pal>=8 && !String(t.contexto||"").trim()){ t.contexto=String(v).replace(/\s+/g," ").trim().slice(0,600); hecho.push("contexto"); }   /* lo dictado manda sobre la descripcion vieja */
  else if(pal>=8 && contextoPct(t)<75){ t.contexto=(String(contextoDe(t)||"")+" "+String(v)).replace(/\s+/g," ").trim().slice(0,600); hecho.push("contexto"); }
  return hecho;
}
/* "Anoté: … Solo me falta: …" */
function soloMeFalta(t){
  var c=completitud(t), f=c.items.filter(function(x){ return !x.ok; }).map(function(x){ return ({quien:"quién la hace",finiquito:"la fecha de finiquito (o si es indefinida)",seguimiento:"el próximo seguimiento",que:"qué es",de:"de quién o de qué proyecto",cifras:"las cifras",agenda:"si te lo agendo"}[x.k]||x.tx); });
  if(!c.ctxOk) f.unshift("un poco más de contexto");
  return f;
}
/* ===== build 207 (Salvador 21:46): en "Falta info" TODO lo dictado va PRIMERO a Claude, en UNA llamada que regresa
   todos los campos (nombre, tipo, contexto, fechas dictadas, ritmo/seguimiento, indefinida/recurrente, quien, etiquetas
   y sinonimos, y vinculos PROPUESTOS con tareas abiertas parecidas). La extraccion sin IA del 205 queda SOLO de respaldo
   sin red. Candados (nada inventado): fecha por candadoFecha; indefinida, recurrente y ritmo solo si se dijeron; quien
   solo si se nombro; vinculos solo ids de la lista que se le paso, y solo se proponen (franja), nunca se aplican. ===== */
/* lista corta de tareas abiertas para proponer vinculos: primero las que comparten palabras con lo dictado */
/* build 248: palabras de TEMA (sin nombres de empresa: compartir solo "BBVA" no es el mismo tema) y cuántas comparten dos textos */
function palTema(txt){ return palabrasBusqueda(txt).filter(function(w){ return EMPRESAS248.indexOf(_bst(w))<0 && EMPRESAS248.indexOf(w)<0; }).filter(function(w,i,a){ return a.indexOf(w)===i; }); }
function temaComun(base, txt){ var w=palTema(txt), n=0; (Array.isArray(base)?base:palTema(base)).forEach(function(b){ if(w.some(function(x){ return _bpega(b,x); })) n++; }); return n; }
/* cerrada o no ejecutada en los últimos 30 días (sigue siendo del mismo tema y puede servir de vínculo) */
function esCerradaReciente(x){
  if(!x || !x.cierre || x.fusionada_en) return false; var f=String(x.cierre.f||""); if(!_fReal(f)) return false;
  var d=dDif(f, hoy()); return d>=0 && d<=30;
}
function nombreVinc(d){ return String((d&&d.nombre)||"")+(esCerradaReciente(d)?" (cerrada)":""); }
function abiertasParaVincular(t, v, max){
  var base=palTema([v, t.nombre, t.contexto].join(" "));
  var L=(tareas||[]).filter(function(x){ return x && x.id!==t.id && !x.fusionada_en && !x.es_recordatorio && ((!x.cierre && estadoReal(x)!=="cerrada") || esCerradaReciente(x)); })
    .map(function(x, i){ var n=temaComun(base, [x.nombre, x.contexto, (x.palabras||[]).join(" ")].join(" ")); return {t:x, n:n, i:i, c:esCerradaReciente(x)?1:0}; })
    .filter(function(o){ return !o.c || o.n>=2; });   /* las cerradas solo si comparten 2+ palabras de tema */
  return L.sort(function(a,b){ return (b.n-a.n) || (a.c-b.c) || (a.i-b.i); }).slice(0, max||30).map(function(x){ return x.t; });
}
/* lo que se le pasa a Claude: el estado actual de la tarea */
function estadoParaClaude(t){
  var q=t.duenio&&PERSONAS[t.duenio]?PERSONAS[t.duenio].nombre:"(nadie)", av=(t.avisos||[]).filter(function(a){ return a&&a.fecha; }).map(function(a){ return a.fecha+(a.hora?" "+a.hora:""); });
  var cif=(t.datos_corregidos||[]).slice(-1).map(function(d){ return String((d&&d.t)||d||""); })[0]||"";
  return ["NOMBRE: "+(t.nombre||"(sin nombre)"), "TIPO: "+tipoItem(t), "QUIÉN LA HACE: "+q,
    "FECHA: "+(t.f_vigente?(t.f_vigente+(t.fecha_dictada?" (dictada)":(fechaPuestaSola(t)?" (la puso el sistema, no cuenta)":""))):"(sin fecha)"),
    "INDEFINIDA: "+(t.indefinida===true?"sí":"no"), "RECURRENTE: "+(t.periodicidad||"no"), "RITMO: "+(t.ritmo||"(ninguno)"), "AVISOS: "+(av.join(", ")||"(ninguno)"),
    "RESPONSABLE DE FUERA: "+(t.revisa_ext||"(nadie)")+(t.revisa_ext?" (tú la supervisas)":""), "SEGUIMIENTO A: "+(t.seg_a?(t.seg_a.contacto+(t.seg_a.cada?" · "+t.seg_a.cada:"")+(t.seg_a.hora?" "+t.seg_a.hora:"")):"(nadie)"),
    "PASOS: "+(tienePasos(t)?t.lista_pasos.map(function(p){ return (p.hecho?"[x] ":"[ ] ")+(p.tx||""); }).join(" | "):"(ninguno)"), "CONTEXTO: "+(contextoDe(t)||"(nada)"), "ETIQUETAS: "+((t.palabras||[]).join(", ")||"(ninguna)"), "DE QUIÉN/PROYECTO: "+(t.de_quien||"(nada)"), "CIFRAS: "+(cif||"(ninguna)")].join("\n");
}
/* build 283: op.rapido = el clasificador rápido de dictados e indicaciones (2-3 s): calendario de 10 días, solo las reglas que tocan a lo
   dictado y a ESTA tarea, sin la lista de 30 tareas (5 solo si habla de vincular). Sin op: el cerebro de «Falta info» (21 días, 15 tareas).
   Los dos piden además pasos / hechos / que_toca / entendi en el formato del plan que usa la Mac (18z38). */
function promptRevision(t, v, abiertas, op){
  /* «(revisión 7-oct)» es la etiqueta de la pregunta de la Mac, no una fecha que dijo Salvador: el modelo la tomaba como finiquito */
  v=String(v||"").replace(/\s*\(revisi[oó]n \d{1,2}-[a-zé]{3,4}\)/gi, "");
  op=op||{}; var rap=!!op.rapido, s283=_fsa(v);
  var gente=Object.keys(PERSONAS).map(function(k){ return PERSONAS[k].nombre; }).join(", ");
  var R283=[
    "- nombre: un nombre corto y bueno (máx 60 letras) si el actual no sirve o lo pide; si el actual está bien, null.\n",
    "- REGLA DURA (build 259): NUNCA cambies el propósito de una tarea ya existente. Si lo dictado contradice su contexto, sus pasos, su nombre o los mensajes con que nació (ej. la tarea es de cobranza y dicta que es para los mensajes de un ingeniero), NO pongas nombre ni contexto nuevos: pon contradice={\"tema_dictado\":\"de qué habla lo dictado\",\"persona\":\"de quién son los mensajes, o null\"} y el sistema le pregunta. Tampoco pongas ya_hecha=true si quedan pasos sin hacer, salvo que él haya dicho explícitamente que la cierres.\n",
    "- tipo: 'tarea' si alguien tiene que hacer algo; 'dato' si es información para consultar (precios, medidas, teléfonos); null si no se sabe.\n",
    "- contexto: el contexto COMPLETO actualizado (lo que ya había + lo nuevo): de qué se trata, quiénes, para qué, en 1 a 3 frases. contexto_modo 'reemplazar' (default) o 'sumar'.\n",
    "- fecha: fecha de finiquito SOLO si la dictó y es DONDE TERMINA. OJO: \"no termina el 8\", \"continúa hasta que…\" y \"termina cuando <evento>\" NO son fecha de finiquito: esa fecha va en recordar (aviso) y el evento en cierra (texto corto, ej. \"Fideicomiso firmado\"); \"antes del 15\" es la fecha meta y SÍ va en fecha. indefinida=true solo si dijo que no tiene fin. periodicidad 'semanal'/'mensual' solo si dijo que se repite.\n",
    "- ritmo: cada cuánto quiere que le recuerde o revise (ej. 'una vez al mes'), solo si lo dijo. recordar: avisos que pidió [{fecha, hora HH:MM}].\n",
    "- quien: quién la hace, SOLO si lo dijo, con el nombre tal cual de esta lista: "+gente+". Si es alguien de fuera de la lista, ponlo en responsable (nunca lo sueltes).\n",
    "- responsable: si dijo que la tarea es de alguien, que alguien es el responsable o el ejecutor, o que él solo la supervisa: el nombre de esa persona TAL CUAL lo dijo (puede ser alguien de fuera de la lista, como un proveedor); si no, null. yo_superviso=true SOLO si dijo que él supervisa o revisa.\n",
    "- seguimiento_a: SOLO si te pidió que TÚ le des seguimiento a alguien (\"dale seguimiento a X\", \"pregúntale a X cada…\"): {\"quien\":\"nombre tal cual\",\"meta\":\"qué tiene que quedar, con sus palabras\",\"cada\":\"la frecuencia TAL CUAL la dijo, o null\",\"fechas\":[AAAA-MM-DD copiadas del calendario, SOLO los días que salen de esa frecuencia, máx 10, hasta 3 semanas],\"pasos\":[{\"tx\":\"cada paso dictado como cosa que se le pregunta, EN EL ORDEN dictado (ej. 'el contacto del carpintero de Lorena (se lo pide a Karina)', 'el estatus con los dos carpinteros', 'las muestras de un cajón pintado')\",\"fecha\":\"AAAA-MM-DD del calendario si ese paso tiene plazo, o null\",\"hora\":\"HH:MM límite solo si la dijo (ej. 'a las 12'), o null\"}] (el primero es lo urgente de hoy; si no dictó pasos, []),\"hora\":\"HH:MM solo si la dijo, o null\",\"texto\":\"el WhatsApp corto y amable que le mandarías, empezando con 'IA: '\"}; si no, null.\n",
    "- compartir_con: si dijo con quién se comparte la tarea o a quién se le avisa (\"la comparto con mi madre María…\"): los nombres COMPLETOS tal cual los dijo, sin cortarlos; si no, [].\n",
    "- Los nombres de personas SIEMPRE completos, tal cual los dijo; nunca abreviados ni cortados.\n",
    "- metas: SOLO si la tarea es INDEFINIDA/continua (o dice que no tiene fin): cada cosa que debe quedar con su fecha (\"que quede el 9\", \"impermeabilizar en 3 meses\") es una META [{\"tx\":\"qué debe quedar, con sus palabras\",\"fecha\":\"AAAA-MM-DD del calendario o null\",\"quien\":\"quién la ejecuta tal cual o null\",\"seguimiento\":{\"quien\":\"…\",\"cada\":\"…\",\"hora\":\"HH:MM o null\"} o null}]; en una tarea continua NUNCA pongas esa fecha en \"fecha\". Si no, []. Cada meta puede llevar \"aviso_inmediato\":true SOLO si pidió que le avises de inmediato si ESA se vence.\n",
    "- aviso_inmediato: true SOLO si dijo \"avísame de inmediato si se vence\" (o igual) para la tarea en general.\n",
    "- palabras: hasta 5 etiquetas para encontrarla; sinonimos: hasta 5 sinónimos o formas en que la podría buscar.\n",
    "- vinculos: ids (de TAREAS ABIERTAS; las marcadas (cerrada) se cerraron hace poco y también sirven) que traten de LO MISMO, máx 3; solo se proponen. Piden AL MENOS 2 palabras de tema en común, sin contar nombres de empresa (compartir solo \"BBVA\" no es el mismo tema). Si ninguna, [].\n",
    "- de_quien y cifras: para datos (de quién o qué proyecto; montos o medidas tal cual). ya_hecha=true solo si dice que ya se hizo.\n",
    "- pregunta: SOLO lo que de verdad quedó ambiguo, en una pregunta corta; lo demás llénalo igual. Si todo quedó claro, null.\n",
    "- ordenes (build 238): TODO lo que pidió HACER (no los datos), en orden, sin perder ninguna: [{\"tipo\":\"vincular|mensaje|claude|agendar|seguimiento|clasificar\",\"a\":\"persona tal cual (mensaje)\",\"canal\":\"whatsapp|correo\",\"texto\":\"lo que se le dice, breve, en segunda persona, de parte de Salvador\",\"que\":\"qué tiene que revisar o investigar Claude, o qué se agenda\",\"fecha\":\"AAAA-MM-DD copiada del calendario o null\",\"hora\":\"HH:MM o null\",\"tareas\":[ids de TAREAS ABIERTAS candidatas para vincular, la más probable primero],\"busca\":\"cómo nombró la tarea a vincular\",\"tipo_item\":\"tarea|dato\"}]. 'revísalo/investiga/checa' dirigido a ti = tipo claude. 'pídele/dile/escríbele a X' = tipo mensaje. Si no pidió nada, [].\n",
    "- TONO de los mensajes a amigos y familia (fiesta, comida, reunión): casual, alegre y cálido, como lo escribiría Salvador; nunca de tarea u obligación ni «tienes recordatorio». Ej.: «¡Ya casi es la fiesta! Te esperamos el 13 de noviembre en casa de mi papá, no se te olvide, nos la vamos a pasar increíble 🎉». Con proveedores y equipo: cordial y breve.\n",
    "- CONDICIONAL (build 250): 'pregúntale/mándale mensaje a A y si dice/te contesta que sí, dile/confírmale a B' es UNA SOLA orden {\"tipo\":\"condicional\",\"pregunta_a\":\"A tal cual\",\"pregunta_texto\":\"lo que se le pregunta a A, con el contexto (qué, cuándo, para qué), de parte de Salvador\",\"si_a\":\"B tal cual\",\"si_texto\":\"lo que se le confirma a B si A dice que sí\",\"vence\":\"AAAA-MM-DD fecha límite que dijo, o null\",\"vence_hora\":\"HH:MM o null\",\"evento_fecha\":\"AAAA-MM-DD del evento o plan de que se trata (copiada del calendario), o null\"}. No la partas en dos mensajes ni la conviertas en aviso: se manda la pregunta a A y la respuesta de B queda esperando. Si en la misma frase dice 'tengo que contestarle a X' y a la vez pide ejecutarlo, NO pongas recordar: la orden ya lo hace.\n",
    "- dudas: SOLO lo genuinamente ambiguo que no se puede ejecutar sin preguntar: [{\"pregunta\":\"corta\",\"opciones\":[\"opción\",…]}] (máx 4 opciones, la más probable primero). Si no hay, [].\n",
    "- OJO DUEÑO: pedirle algo a una persona, o que una persona dé información, NO la hace dueña. quien/responsable SOLO si dijo explícito que la tarea es suya o la hace ella ('pásasela a X', 'la hace X', 'X es el responsable').\n",
    "- HOY en Monterrey es "+fechaMty(0)+" (mañana "+fechaMty(1)+"). 'mañana', 'el jueves', etc. se convierten con el calendario.\n",
    "- checklist: si pide una lista o checklist: {\"titulo\":\"…\",\"items\":[{\"tx\":\"renglón tal cual\",\"estado\":0}]} (0 pendiente, 1 invitado/hecho, 2 confirmado, solo si se dijo); si no, null. CHECKLIST ACTUAL: "+checklistTexto(t)+".\n"
  ];
  if(rap && typeof reglaRapida==="function") R283=R283.filter(function(r){ return reglaRapida(r, t, s283, abiertas); });
  return "Eres Claude dentro de la app de tareas Doit. "+((PERSONAS[yo]||{}).nombre||"El usuario")+" está completando esta tarea y te dicta TODO de una vez. "+
    "Entiende el concepto completo y saca SOLO lo que dijo, sin inventar. Fechas AAAA-MM-DD copiadas de este calendario (NO calcules el día): "+calendarioProximo(rap?10:21).join(", ")+".\n"+
    R283.join("")+(typeof REGLA_PLAN283==="string"?REGLA_PLAN283:"")+
    "Contesta SOLO JSON: {\"contradice\":null,\"cierra\":null,\"checklist\":null,\"nombre\":null,\"tipo\":null,\"contexto\":null,\"contexto_modo\":\"reemplazar\",\"fecha\":null,\"indefinida\":false,\"periodicidad\":null,\"ritmo\":null,\"recordar\":[],\"quien\":null,\"responsable\":null,\"yo_superviso\":false,\"seguimiento_a\":null,\"compartir_con\":[],\"metas\":[],\"aviso_inmediato\":false,\"palabras\":[],\"sinonimos\":[],\"vinculos\":[],\"de_quien\":null,\"cifras\":null,\"ya_hecha\":false,\"pregunta\":null,\"ordenes\":[],\"dudas\":[],\"entendi\":null,\"pasos\":[],\"hechos\":[],\"que_toca\":null}\n\n"+
    "ESTADO ACTUAL DE LA TAREA:\n"+estadoParaClaude(t)+(esMetas(t)?"\nMETAS: "+metasDe(t).map(function(m){ return m.tx+(m.fecha?" ("+m.fecha+")":"")+(metaCumplida(m)?" CUMPLIDA "+(m.cumplida||""):""); }).join(" | "):"")+"\n\nLO QUE FALTA: "+(soloMeFalta(t).join(" | ")||"(nada)")+"\nPREGUNTAS QUE LE HICE: "+(preguntasFalta(t).join(" | ")||"(ninguna)")+
    (typeof planParaClaude==="function"?planParaClaude(t):"")+
    "\n\nTAREAS ABIERTAS (id | nombre):\n"+(abiertas.map(function(x){ return x.id+" | "+(x.nombre||"")+(esCerradaReciente(x)?" (cerrada)":""); }).join("\n")||"(ninguna)")+
    "\n\nLO QUE DICTÓ: "+v;
}
/* build 283: ¿esta regla del prompt toca a lo dictado o a esta tarea? (solo en el modo rápido; las demás no se mandan) */
function reglaRapida(r, t, s, abiertas){
  var k=String(r).replace(/^\s*"?-?\s*/,"").slice(0,22);
  if(/^nombre:/.test(k)) return !String(t.nombre||"").trim() || /\b(nombre|titulo|llamala|llamalo|renombr\w*)\b/.test(s);
  if(/^tipo:/.test(k)) return !t.tipo_elegido;
  if(/^seguimiento_a:/.test(k)) return /\b(seguimiento|preguntale|preguntales|insistele|checa con|cada)\b/.test(s);
  if(/^compartir_con:/.test(k)) return /\b(compart\w*|avis\w*|que sepan|enterad\w*)\b/.test(s);
  if(/^metas:/.test(k)) return (typeof esMetas==="function" && esMetas(t)) || t.indefinida===true || /\b(meta|metas|que quede|indefinid\w*|continu\w*)\b/.test(s);
  if(/^aviso_inmediato:/.test(k)) return /\binmediat\w*\b/.test(s);
  if(/^palabras:/.test(k)) return false;
  if(/^vinculos:/.test(k)) return (abiertas||[]).length>0;
  if(/^de_quien y cifras:/.test(k)) return (typeof tipoItem==="function" && tipoItem(t)==="dato") || /\d/.test(s);
  if(/^CONDICIONAL/.test(k)) return /\bsi\s+(te\s+)?(dice|contesta|responde|confirma)\b/.test(s);
  if(/^checklist:/.test(k)) return /\b(lista|checklist|invitad\w*)\b/.test(s);
  return true;
}
var REGLA_PLAN283="- pasos (build 283): si lo dicho cambia el plan (qué sigue, quién lo hace, cuándo), los pasos NUEVOS, sin repetir los del PLAN ACTUAL: [{\"quien\":\"IA|Salvador|contacto TAL CUAL de CONTACTOS DE LA TAREA\",\"que\":\"qué se hace, corto\",\"fecha\":\"AAAA-MM-DD del calendario o null\",\"seguir\":null}]. Un mensaje a alguien va en ordenes (tipo mensaje), NO en pasos. hechos: ids del PLAN ACTUAL que ya quedaron según lo dicho. que_toca: la línea «en qué vamos» nueva si cambió, o null. entendi: qué entendiste, en una frase.\n";
/* build 283: el plan, en qué vamos, los contactos de la tarea y la decisión abierta (para que el cerebro sepa qué sigue sin el historial completo) */
function planParaClaude(t){
  var R=(t && t.resumen && typeof t.resumen==="object" && !Array.isArray(t.resumen))?t.resumen:{};
  var P=(Array.isArray(R.plan)?R.plan:[]).filter(function(p){ return p && typeof p==="object"; }).slice(-10).map(function(p){
    return (p.id||"?")+" | "+(p.quien||p.de||"")+" | "+String(p.que||p.t||p.tx||"").replace(/\s+/g," ").slice(0,140)+" | "+(p.estado||(p.hecho?"hecho":"pendiente"))+(p.fecha?" | "+p.fecha:""); });
  var C=contactosPlan(t), D=(t && t.decision && typeof t.decision==="object" && !t.decision.resuelta)?t.decision:null;
  return "\nPLAN ACTUAL (id | quién | qué | estado | fecha):\n"+(P.join("\n")||"(sin plan)")+"\nEN QUÉ VAMOS: "+(String(R.que_toca||"").trim()||"(nada)")+
    "\nCONTACTOS DE LA TAREA: "+(C.join(", ")||"(ninguno)")+(D?"\nDECISIÓN ABIERTA: "+String(D.pregunta||"").slice(0,300)+(D.respuesta?" · CONTESTÓ: "+String(D.respuesta.t||"").slice(0,300):""):"");
}
/* ===== build 219 (Salvador 10:15, "Mantenimiento Casa Lerdo/Eloísa"): "esta tarea es de X / X es el responsable /
   yo solo superviso" y "dale seguimiento a X cada N / a tales horas". Candados: el nombre tiene que estar en lo dictado;
   frecuencia y hora solo si las dijo; las fechas solo del calendario. Si X es de Doit: la tarea pasa a X y quien dicta
   queda de revisor. Si X es de fuera: la tarea sigue siendo de quien supervisa (es quien da seguimiento) y X queda como
   responsable externo (revisa_ext, "Lo hace X"). El seguimiento sale SIEMPRE por Doit: WhatsApps programados en la cola
   ([A LAS …]), nunca dependiendo de un chat. ===== */
function _dichoNombre(v, nom){ var s=_fsa(v), w=_nn(nom).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(function(x){ return x.length>=3 && !/^(mis?|sus?|del?|las?|los)$/.test(x); }); return !!w.length && s.indexOf(" "+w[0])>=0; }
/* ===== build 221 (Salvador: "Si no la tienes, me preguntas, ¿quién es fulanito?… si tienes duda, pones todos los manuales y
   yo te los selecciono. Pero tiene que hacer entendimiento de todo."): TODA persona que nombra se resuelve contra los
   contactos de la tarea (wa_contactos, revisa_ext, de_quien, quien platica por WhatsApp, seguimiento, compartir_con), los
   usuarios de Doit y la agenda de la Mac (wa_agenda cuando exista; mientras, lo que la app conoce). Nunca se suelta a una
   persona de fuera ni se corta su nombre. Una sola -> se aplica; varias o ninguna -> tarjeta "¿Quién es X?" en la ficha con
   TODAS las coincidencias como botones + "Otro / nuevo". ===== */
function _tokPer(s){ return _n179(s).split(" ").filter(function(w){ return w && !/^(de|del|la|las|los|y|el|mi|mis|su|sus|don|dona|sr|sra|ing|lic|dr|dra|arq)$/.test(w); }); }
/* nombres propios dentro de un texto libre ("Propietaria: María Eloísa Albores de la Peña. Ejecutor: Manuel Parra") */
function nombresEnTexto(s){
  var out=[], re=/[A-ZÁÉÍÓÚÑ][a-záéíóúüñ]+(?:\s+(?:(?:de\s+la|de\s+los|del|de)\s+)?[A-ZÁÉÍÓÚÑ][a-záéíóúüñ]+){1,4}/g, m;
  while((m=re.exec(String(s||"")))) if(out.indexOf(m[0])<0) out.push(m[0]);
  return out;
}
function _compartirLista(t){ return (Array.isArray(t.compartir_con)?t.compartir_con:[]).map(function(c){ if(c && typeof c==="object") return {id:String(c.id||("ext:"+(c.nombre||""))), nombre:String(c.nombre||nombreInt(c.id||""))};
  var s0=String(c||"").trim(); if(!s0) return null; return PERSONAS[s0]?{id:s0, nombre:PERSONAS[s0].nombre}:{id:"ext:"+s0, nombre:s0}; }).filter(function(c){ return c && c.nombre; }); }
function candidatosPersona(t){
  var out=[], vis={};
  function pon(id, nombre, sub, prio, alias){
    nombre=String(nombre||"").replace(/\s+/g," ").trim(); var nn=_n179(nombre); if(!nn || /^\+?\d[\d\s-]+$/.test(nombre)) return;
    var o=vis[id]||vis["n:"+nn];
    if(o){ if(prio>o.prio){ o.prio=prio; o.sub=sub; } if(alias) o.alias=(o.alias?o.alias+" ":"")+alias; return; }
    o={id:id, nombre:nombre, sub:sub, prio:prio, alias:alias||""}; vis[id]=o; vis["n:"+nn]=o; out.push(o);
  }
  Object.keys(PERSONAS).forEach(function(k){ var p=PERSONAS[k]; pon(k, (p.nombre||k)+(p.apellido?" "+p.apellido:""), "equipo · Doit", 2); });
  (t.wa_contactos||[]).forEach(function(c){ var n0=String((c&&c.nombre)||c||""); pon("ext:"+n0, n0, "en esta tarea", 3); });
  try{ contactosWA(t).forEach(function(G){ if(G.eq) return; pon("ext:"+G.nombre, G.nombre, "en esta tarea", 3, (G.alias||[]).join(" ")); }); }catch(e){}
  if(t.revisa_ext) pon("ext:"+t.revisa_ext, t.revisa_ext, "en esta tarea", 3);
  if(t.seg_a && t.seg_a.contacto) pon("ext:"+t.seg_a.contacto, t.seg_a.contacto, "en esta tarea", 3);
  _compartirLista(t).forEach(function(c){ pon(c.id, c.nombre, "en esta tarea", 3); });
  nombresEnTexto(t.de_quien).forEach(function(n0){ pon("ext:"+n0, n0, "en esta tarea", 3); });
  try{ todosLosContactos().forEach(function(c){ pon(c.id, c.nombre, c.sub, 1, c.alias||""); }); }catch(e){}
  return out;
}
function resuelvePersona(t, dicho){
  var ws=_tokPer(dicho); if(!ws.length) return {estado:"ninguno", cands:[]};
  var cs=candidatosPersona(t).filter(function(c){ var toks=_tokPer(c.nombre+" "+(c.alias||""));
    return ws.every(function(w){ return toks.some(function(x){ return x===w || (w.length>=3 && x.indexOf(w)===0); }); }); });
  cs.sort(function(a,b){ return (b.prio-a.prio) || String(a.nombre).localeCompare(String(b.nombre)); });
  var ex=cs.filter(function(c){ return _tokPer(c.nombre).join(" ")===ws.join(" "); });
  if(ex.length===1) return {estado:"uno", persona:ex[0], cands:cs};
  var tar=cs.filter(function(c){ return c.prio>=3; });
  if(tar.length===1) return {estado:"uno", persona:tar[0], cands:cs};   /* el de la tarea manda: es de quien se esta hablando */
  if(cs.length===1) return {estado:"uno", persona:cs[0], cands:cs};
  if(!cs.length && ws.length>=2){   /* build 248: "Fernando de BBVA" = nombre + empresa: el nombre empata y la empresa sale en la agenda o en la tarea */
    var ctx248=_tokPer([t.nombre, t.contexto, t.de_quien, (t.palabras||[]).join(" ")].join(" ")), rest=ws.slice(1);
    var rl=candidatosPersona(t).filter(function(c){ var toks=_tokPer(c.nombre+" "+(c.alias||"")+" "+(c.sub||"")), t0=_tokPer(c.nombre)[0]||"";
      return (t0===ws[0] || (ws[0].length>=3 && t0.indexOf(ws[0])===0)) && rest.every(function(w){ return toks.some(function(x){ return x===w || (w.length>=3 && x.indexOf(w)===0); }) || (EMPRESAS248.indexOf(w)>=0 && ctx248.indexOf(w)>=0); }); });
    if(rl.length===1) return {estado:"uno", persona:rl[0], cands:rl}; }
  return {estado:cs.length?"varios":"ninguno", cands:cs};
}
