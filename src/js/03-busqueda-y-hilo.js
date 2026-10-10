
/* ============ SEMILLA — tareas de ejemplo (demo arriba + operativas de Samuel) ============ */
var SEMILLA=DEMO.concat([
 {id:"linea",nombre:"Línea del alumbrado · fraccionamiento",duenio:"samuel",creada_por:"salvador",tipo:"unica",
  cierra:"Alumbrado encendido + factura del eléctrico",revisar:"Línea que se fundió en la calle 4",
  ritmo:"Por pasos: cada uno tiene su día",gasto:"Diagnóstico primero; el trabajo se autoriza con número",
  estado:"abierta",ultima:"Hoy toca: contactar tres eléctricos",
  paso:0,
  pasos:[
   {t:"Contactar tres eléctricos y pedir presupuesto",dia:0,nota:"Son 10 minutos. Entre más tarde, más se recorre todo lo demás."},
   {t:"Comparar los presupuestos y definir",dia:3,nota:"Se les dieron 3 días para cotizar."},
   {t:"Contratar y apartar la fecha",dia:4,nota:""},
   {t:"Alumbrado encendido y factura",dia:7,nota:"Aquí cierra la tarea."}
  ],
  msgs:[{k:"bi",t:"Tarea nueva. La partí en cuatro pasos: hoy contactas eléctricos, el día 3 comparas presupuestos, el 4 contratas y el 7 debe quedar encendida.",h:"7:00"},{k:"bi",t:"La fecha del día 7 no se mueve. Si un paso se atrasa, el trabajo no se recorre: se te junta.",h:"7:00"}],
  pregunta:"Hoy toca contactar tres eléctricos. ¿Ya los llamaste?",
  ops:[{t:"Ya los contacté",r:"Va. Te lo quito de hoy y te vuelvo a aparecer el día 3 para comparar presupuestos."},
       {t:"Estoy atorado",r:"¿En qué exactamente? Escríbelo abajo y se lo paso a Salvador ahora. La fecha del día 7 no se mueve, así que entre más pronto lo digas, mejor.",atora:true}]},
 {id:"pipas",nombre:"Pipas de riego · lunes y jueves",duenio:"samuel",tipo:"recurrente",
  cierra:"Foto del tanque llenándose · a más tardar 6:00 p.m. el mismo día",
  revisar:"Que lleguen las 2 pipas y descarguen completo",
  ritmo:"Se enciende sola si pasan las 6:00 p.m. sin reporte",gasto:"No gasta",
  estado:"silencio",ultima:"Sin reporte desde el jueves 27",
  msgs:[{k:"bal",t:"Dos riegos seguidos sin reporte. Esto ya subió al tablero de Salvador.",h:"18:00"}],
  pregunta:"Van 2 riegos sin reporte. ¿Qué pasó con las pipas?",
  ops:[{t:"No vinieron",r:"Grave: las plantas llevan días sin riego extra. Se lo paso a Salvador y te abro una tarea para hablar con el proveedor."},
       {t:"Sí vinieron, se me olvidó reportar",r:"Necesito la foto de alguna de las dos para poder cerrarlas."},
       {t:"Vino una sola",r:"Anotado: 1 de 2. ¿De cuál día fue?"}]},

 {id:"palmas",nombre:"Palmas secándose · agrónomo",duenio:"samuel",creada_por:"salvador",tipo:"unica",
  cierra:"Diagnóstico del agrónomo por escrito",revisar:"Palmas del acceso principal",
  ritmo:"Diario hasta que haya cita",gasto:"Diagnóstico primero; el tratamiento se autoriza aparte",
  estado:"vencida",ultima:"7 días sin movimiento",
  msgs:[{k:"bi",t:"Salvador pidió citar al agrónomo por las palmas que se secan.",h:"—"},
        {k:"bal",t:"7 días sin una sola señal de avance. Ni contacto, ni cita, ni diagnóstico.",h:"8:00"}],
  pregunta:"¿Ya hablaste con el agrónomo?",
  ops:[{t:"Ya lo cité",r:"¿Qué día viene? Le aviso a Salvador que ya hay fecha."},
       {t:"No he podido",r:"Se lo digo a Salvador con los 7 días."},
       {t:"No tengo su contacto",r:"Se lo pido a Salvador ahora."}]},

 {id:"bomba",nombre:"Bomba cisterna · la plaza",duenio:"samuel",tipo:"unica",
  cierra:"Foto de la bomba puesta y funcionando + ticket",revisar:"Cisterna de la plaza",
  ritmo:"Diario: sin agua es urgente",gasto:"Hasta 2,000 sin preguntar",
  estado:"abierta",ultima:"Dijo que la llevaba a arreglar",
  msgs:[{k:"bo",t:"Se quemó la bomba de la cisterna de la plaza. La llevo a arreglar.",h:"ayer 16:40"},
        {k:"bi",t:"¿Ya quedó? Salvador no sabe si sigue sin agua.",h:"8:00"}],
  pregunta:"¿En qué va la bomba?",
  ops:[{t:"Ya quedó",r:"Para cerrarla necesito la foto funcionando y el ticket."},
       {t:"Sigue en el taller",r:"¿Para cuándo la entregan?"},
       {t:"Sale más de 2,000",r:"Necesito el número para pedirle autorización a Salvador.",pide:true}]},

 {id:"aspersor11",nombre:"Aspersor 11 · cambiar, ya no reparar",duenio:"samuel",tipo:"unica",
  cierra:"Foto del repuesto puesto y funcionando",revisar:"Aspersor 11 del camellón",
  ritmo:"Esta semana",gasto:"Hasta 2,000 sin preguntar",
  estado:"abierta",ultima:"Cuarta falla del año",
  msgs:[{k:"bi",t:"Van cuatro fallas este año. Ya sale más caro repararlo que cambiarlo.",h:"8:36"}],
  pregunta:"¿Cuándo lo cambias?",
  ops:[{t:"Hoy",r:"Va. Te pido la foto del repuesto puesto."},
       {t:"Esta semana",r:"Anotado. Te lo recuerdo el jueves."}]},

 {id:"rondin",nombre:"Bono jardineros · rondín semanal",duenio:"samuel",tipo:"recurrente",
  cierra:"Los 20 puntos palomeados + las 4 fotos · lunes antes de mediodía",
  revisar:"Poda, riego, basura y herramienta en las 3 áreas, más zonas comunes",
  ritmo:"Semanal · se enciende el lunes 7:00 a.m.",gasto:"El bono es fijo",
  estado:"abierta",ultima:"Semana 35 en curso",
  msgs:[{k:"bi",t:"Rondín de la semana. Son 20 puntos; 4 piden foto.",h:"7:00"}],
  puntos:[
   {t:"Poda de setos · área 1",foto:1,d:"Altura pareja a 1.20 m. Recorte recogido el mismo día."},
   {t:"Riego funcionando · área 1",d:"Los 4 aspersores. Uno tapado ya es falla."},
   {t:"Basura recogida · área 1",d:"Botes vaciados y bolsa nueva."},
   {t:"Herramienta guardada · área 1",d:"Bodega, con candado."},
   {t:"Poda de setos · área 2",foto:1,d:"Igual que el área 1."},
   {t:"Riego funcionando · área 2",d:"6 aspersores. Revisar presión al final."},
   {t:"Basura recogida · área 2",d:"Incluye los botes del área de juegos."},
   {t:"Herramienta guardada · área 2",d:"Bodega chica, junto a la caseta."},
   {t:"Poda de setos · área 3",foto:1,d:"Es la de la entrada. Acabado más fino."},
   {t:"Riego funcionando · área 3",d:"Por goteo. Revisar goteros tapados."},
   {t:"Basura recogida · área 3",d:"Zona de más tránsito."},
   {t:"Herramienta guardada · área 3",d:"Comparte bodega con el área 2."},
   {t:"Palmas del acceso · estado",foto:1,d:"En tratamiento por hongo. Reportar hoja nueva seca."},
   {t:"Andadores barridos",d:"Los tres principales."},
   {t:"Jardineras del portón",d:"Sin maleza, tierra pareja."},
   {t:"Camellón central",d:"Pasto a 5 cm."},
   {t:"Aspersores 1 al 6",d:"Uno por uno, anotar el número del que falle."},
   {t:"Aspersores 7 al 12",d:"El 11 ya se va a cambiar."},
   {t:"Bomba de riego sin fugas",d:"Charco = falla."},
   {t:"Bitácora de asistencia firmada",d:"Sin las tres firmas no hay bono."}
  ],marcados:{},fotos:{}}
]);



/* ---- FILTRO LOCAL: cuesta CERO tokens y resuelve la mayoría ----
   Antes de preguntarle nada a Claude, se busca a mano si lo dictado comparte
   algo con lo que ya está abierto. Si no comparte nada, es nueva y ya:
   NO SE LLAMA A CLAUDE. Y cuando sí, solo se mandan las candidatas, no la
   lista completa: el costo crece con lo que se parece, no con lo que hay. */
var VACIAS=("de la el los las un una unos unas y o que en por para con del al se su sus "+
 "le les lo me mi te tu es son esta este esa ese hay ya no si mas más muy tambien también "+
 "dile dile diles favor porfa oye mira quiero necesito hay que hacer haga hagan poner pon "+
 "ponle ponme mande manda mandar revisa revisar checa checar ver vi "+
 "todos todas cada dias diario diaria semana semanal mensual manana ayer tarde noche siempre "+
 "hasta desde entre lunes martes miercoles jueves viernes sabado domingo hora horas minuto minutos "+
 "recuerda recuerdame recuerdanos recordar recordatorio acuerda acuerdate acuerdame cita").split(" ");
function palabras(txt){
  return String(txt||"").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/[^a-z0-9n ]/g," ").split(/\s+/)
    .filter(function(w){ return w.length>3 && VACIAS.indexOf(w)<0 });
}
/* raíz: pipa y pipas tienen que ser la misma palabra, y aspersor y aspersores */
function raiz(w){ return w.length>4 ? w.slice(0,4) : w }

/* FAMILIAS: lo que la gente dice distinto y es lo mismo. Si dictan "regar",
   tiene que encontrar la tarea de "pipas de riego". Sin esto el filtro local
   deja pasar duplicados, que es peor que llamar a Claude de más. */
var FAMILIAS=[
  ["pipa","pipas","riego","riegos","regar","riega","riegan","rieguen","regando","agua","regadera","cisterna"],
  ["alumbrado","luz","foco","focos","lampara","lamparas","luminaria","electrico","electricidad","apagado","fundido"],
  ["poda","podar","seto","setos","jardin","jardines","jardinero","jardineros","pasto","cesped"],
  ["bomba","motobomba","presion"],
  ["aspersor","aspersores","rociador"],
  ["palma","palmas","arbol","arboles","agronomo","planta","plantas"],
  ["fuente","fuentes"],
  ["basura","botes","limpieza","recoleccion"],
  /* OJO: nada de palabras genéricas aquí. "acceso" se quitó porque "acceso
     principal" es un lugar cualquiera; y "seguridad" porque chocaba con el
     "seguro" del camión, que no tiene nada que ver. */
  ["caseta","vigilancia","guardia","porton","velador"],
  ["pago","pagar","factura","ticket","comprobante","cobranza","recibo"]
];
function familia(w){
  for(var i=0;i<FAMILIAS.length;i++)
    for(var j=0;j<FAMILIAS[i].length;j++)
      if(raiz(FAMILIAS[i][j])===raiz(w)) return i;
  return -1;
}
function candidatas(texto, quien, incCerradas){
  var pw=palabras(texto); if(!pw.length) return [];
  var pr=pw.map(raiz), pf=pw.map(familia).filter(function(x){return x>=0});
  var out=[];
  tareas.forEach(function(t){
    /* Por default NO se ven las cerradas. Con incCerradas si, porque para
       REVISAR algo lo normal es que el otro ya lo haya entregado y cerrado
       (Salvador 2026-09-04). */
    if(t.cierre && !incCerradas) return;
    if(quien && t.duenio!==quien) return;
    var tw=palabras([t.nombre,t.revisar,t.cierra].join(" "));
    var tr=tw.map(raiz), tf=tw.map(familia).filter(function(x){return x>=0});
    var n=0;
    pr.forEach(function(r){ if(tr.indexOf(r)>=0) n+=2 });          // misma palabra
    pf.forEach(function(f){ if(tf.indexOf(f)>=0) n+=1 });          // misma familia
    /* antes bastaba UNA palabra en comun (n>0) y salian hasta 6: cualquier
       palabra suelta ("ver", "el proximo") volvia candidata a media lista. Ahora
       se exige al menos una palabra fuerte compartida (n>=2), o una sola familia
       cuando el dictado fue muy corto. Asi la duda queda entre pocas, no una
       lista gigante. Salvador 2026-09-17. */
    var minimo = (pw.length<=2) ? 1 : 2;
    if(n>=minimo) out.push({t:t,score:n});
  });
  return out.sort(function(a,b){return b.score-a.score}).slice(0,4).map(function(x){return x.t});
}

/* memoria corta: el mismo dictado no se juzga dos veces en 10 minutos */
var CACHE_DUP={};
function claveCache(txt,quien){ return (quien||"")+"|"+String(txt).toLowerCase().replace(/\s+/g," ").trim() }

/* ---- ¿ESTO YA LO TENGO? — el filtro que evita la bandeja llena de repetidas ----
   Antes de crear cualquier tarea, se compara contra las que ya están abiertas.
   NO se compara por texto igual: se compara por DE QUÉ SE TRATA.
   Cuatro salidas, y una de ellas es no decidir solo. */
/* build 167: busqueda por SIGNIFICADO (cuando las palabras no coinciden). Manda solo
   id y nombre de las abiertas; regresa hasta 5 ids de las que tratan de eso. */
/* ===== build 194 (F37, Salvador 2026-10-04 09:25): "abre el costo de la barda" no encontraba
   nada porque la busqueda de "abre" (build 167) solo miraba tareas ABIERTAS y solo su nombre;
   la de la barda se cerro el 3-oct 23:14 ("no la requiero en la lista, solo la info"). Ahora
   se busca en TODAS (abiertas, cerradas, canceladas) y en todo lo que guardan: nombre, datos
   corregidos, analisis, notas a Claude, ritmo, listas y mensajes (con fotos transcritas).
   Regla VARIAS COINCIDENCIAS = LISTA PARA ESCOGER: 1 clara -> se abre; varias -> lista con el
   porque; ninguna -> "No lo encontré". Nunca crea tarea. ===== */
var BUSCA_VACIAS=["abre","abreme","abrir","busca","buscame","buscar","muestrame","ensename","donde","esta","quedo",
  "dame","dato","datos","info","informacion","tarea","tema","para","por","favor","del","las","los","una","uno","que",
  "con","sin","mis","este","esta","ese","esa","esto","eso","sobre","cual","cuanto","cuanta","como","fue","hay","tengo","sus","nos"];
function _bw(txt){
  return String(txt||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9ñ]+/g," ").split(/\s+/).filter(function(w){ return w.length>=3; });
}
function _bst(w){ return w.length>4 ? w.replace(/(es|s)$/,"") : w; }
function _bpega(a,b){ if(a===b) return true; var x=_bst(a), y=_bst(b); if(x===y) return true;
  return x.length>=5 && y.length>=5 && x.slice(0,5)===y.slice(0,5); }
function palabrasBusqueda(q){ return _bw(q).filter(function(w){ return BUSCA_VACIAS.indexOf(w)<0; }); }
/* los campos de una tarea donde se busca, con su peso */
function camposBusqueda(t){
  var c=[["nombre",3,t.nombre||""]];
  (t.datos_corregidos||[]).forEach(function(d){ c.push(["dato",2,(d&&d.t)||d||""]); });
  [["analisis",1,t.analisis],["ritmo",1,t.ritmo],["revisar",1,t.revisar],["cierra",1,t.cierra],["contexto",1,t.contexto]].forEach(function(x){ if(x[2]) c.push(x); });
  (t.notas_claude||[]).forEach(function(d){ c.push(["nota",1,(d&&d.t)||""]); });
  (t.lista_pasos||[]).forEach(function(p){ c.push(["lista",1,(p&&p.tx)||""]); });
  (t.msgs||[]).forEach(function(x){ if(!x || x.eliminado) return;
    if(x.nota_mia){ if(x.de===yo && String(x.t||"").trim()) c.push(["mia",2,String(x.t).slice(0,1500)]); return; }   /* build 216: tu nota pesa como dato; la de otro no sale */
    var tx=[x.tr||x.t||"", x.analisis||"", x.leido||""].join(" "); if(tx.trim()) c.push(["mensaje",1,tx.slice(0,1500)]); });
  return c;
}
function _snip(txt, ws){
  var s=String(txt||"").replace(/\s+/g," ").trim(), low=s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  var at=-1; ws.forEach(function(w){ var g=_sinGrupo(w), vs=g>=0?SINONIMOS[g]:[w]; vs.forEach(function(v){ var i=low.indexOf(_bst(v).slice(0,5)); if(i>=0 && (at<0 || i<at)) at=i; }); });
  if(at<0) at=0; var a=Math.max(0,at-30);
  return (a>0?"…":"")+s.slice(a, a+110).trim()+(s.length>a+110?"…":"");
}
/* -> [{t, n (palabras que pegan), score, porque}] ordenadas, la mejor primero */
function buscaTodo(q, lista){
  var ws=palabrasBusqueda(q); if(!ws.length) return [];
  var need=ws.length<=2?ws.length:ws.length-1, out=[];
  (lista||tareas).forEach(function(t){
    if(!t || t.es_recordatorio || t.fusionada_en || t.estado==="fusionada" || (typeof esEjemplo==="function" && esEjemplo(t))) return;
    var cs=camposBusqueda(t), toks=cs.map(function(c){ return _bw(c[2]); });
    var n=0, sc=0, mejor=null, mejorP=-1, fuerte=0;
    ws.forEach(function(w){
      var best=0, bi=-1;
      for(var i=0;i<cs.length;i++){ if(cs[i][1]<=best) continue; if(toks[i].some(function(x){ return mismoSentido(w,x); })){ best=cs[i][1]; bi=i; } }
      if(best){ n++; sc+=best; if(best>=2) fuerte++; if(cs[bi][0]!=="nombre" && best>mejorP){ mejorP=best; mejor=cs[bi]; } }
    });
    if(n>=need){
      var porque=mejor?({dato:"dato",mia:"tu nota",analisis:"nota",nota:"nota a Claude",mensaje:"mensaje",lista:"lista",ritmo:"ritmo"}[mejor[0]]||mejor[0])+": "+_snip(mejor[2],ws):"por el nombre";
      out.push({t:t, n:n, score:sc, porque:porque, fuerte:fuerte, todas:n===ws.length});
    }
  });
  out.sort(function(a,b){ return (b.n-a.n) || (b.score-a.score) || ((b.t.tocada||0)-(a.t.tocada||0)); });
  return out;
}
/* regla de Salvador VARIAS COINCIDENCIAS = LISTA PARA ESCOGER: solo se abre sola si pega UNA */
function busquedaClara(res){ return res.length===1 ? res[0].t : null; }
/* ¿lo dicho es una busqueda? -> el texto a buscar, o null */
function pideBuscar(texto){
  var s=String(texto||"").trim().replace(/^(?:oye\s+)?(?:claude|cloud|clod|claud|clau)\b[\s,:]*/i,"").replace(/^por\s+favor\s+/i,"");
  var m=s.match(/^(?:[aá]bre(?:me)?|abrir|b[uú]sca(?:me)?|buscar|mu[eé]strame|ens[eé][nñ]ame|d[oó]nde\s+est[aá]n?|d[oó]nde\s+qued[oó]|dame)\s+(?:por\s+favor\s+)?(.{3,})$/i);
  if(m) return m[1].replace(/[?.!]+$/,"").trim();
  m=s.match(/^(?:(?:el|los)\s+)?(?:datos?|costos?|precios?|presupuestos?|cotizaci[oó]n(?:es)?)\s+(?:de\s+(?:la|el|los|las)?\s*|del\s+)?(.{3,})$/i);
  if(m) return s.replace(/[?.!]+$/,"").trim();
  m=s.match(/^(?:cu[aá]nto|qu[eé])\s+(?:cost[oó]|sali[oó]|fue|era)\s+(.{3,})$/i);
  if(m) return s.replace(/[?.!]+$/,"").trim();
  return null;
}
/* frase corta sin verbo de accion ("barda cumbres", "barda y porton"): se busca primero y
   solo si NADA pega se manda a Claude como siempre */
function fraseCortaDeBusqueda(texto){
  var s=String(texto||"").trim(); if(!s || s.length>40 || /[?]/.test(s)) return false;
  var ws=_bw(s); if(!ws.length || ws.length>4) return false;
  if(/^(recu[eé]rda|av[ií]sa|apunta|anota|crea|haz|ponme|pon|dile|m[aá]nda|preg[uú]nta|llama|compra|paga|agenda|cierra|borra|elimina|mueve|cambia)/i.test(s)) return false;
  if(typeof fechaDictada==="function" && fechaDictada(s).todas.length) return false;
  return true;
}
/* build 204 (Salvador 21:06, "Migración Scotia Online"): de donde nacio la tarea, con letra chica y otro color,
   en "Creada con" del ▾ y antes del primer mensaje del chat. Sale de origen / creada_por / wa_contacto. */
function origenDe(t){
  if(!t) return null;
  var m0=(t.msgs||[])[0]||{}, tx=[m0.t, m0.analisis, t.analisis, t.origen].filter(Boolean).join(" ");
  var wc=t.wa_contactos&&t.wa_contactos[0], wac=String(t.wa_contacto || m0.wa_c || (wc&&(wc.nombre||wc)) || "").trim();
  var og=String(t.origen||"").toLowerCase();
  if(t.creada_por==="ia_revisor" || og==="wa_revisor") return {k:"ia", txt:"Revisor IA"+(wac?" · WhatsApp de "+wac:"")};
  if(/correo|gmail|mail/.test(og) || /\(correo\b|\bcorreo de\b|\bcorreo\b[^.]{0,40}\basunto\b/i.test(tx)){
    var rm=tx.match(/correo de\s+([^\s,;)]+)/i); return {k:"correo", txt:"Correo"+(rm?" · "+rm[1].slice(0,40):"")}; }
  if(wac || /^wa_/.test(og) || /^wa_/.test(String(t.id||"")) || m0.wa_in===1) return {k:"wa", txt:"WhatsApp"+(wac?" de "+wac:"")};
  if(t.creada_por==="claude" || /^claude/.test(og)) return {k:"claude", txt:"Claude (chat)"};
  if(t.creada_por && PERSONAS[t.creada_por]) return {k:"doit", txt:"Doit (a mano"+(t.creada_por!==yo?" · "+PERSONAS[t.creada_por].nombre:"")+")"};
  return null;
}
function lineaOrigen(t, cls){ var o=origenDe(t); return o?'<div class="'+(cls||"orgn")+'">Nació en: '+esc(o.txt)+'</div>':''; }
/* build 195: el detalle del ▾ */
/* SIN USO, REEMPLAZADA: se retira junto con su prueba b204 (revisión 8-oct) */
function vDetalle(t, frows){
  var cc=creadaCon(t), cuando=cc.ts?fechaCorta(new Date(cc.ts))+" "+hhmm(new Date(cc.ts)):"";
  var h='<div class="dsec"><h4>Creada con</h4>'+(cc.foto?'<img class="dfoto" src="'+esc(cc.foto)+'" alt="foto con la que se creó">':'')+
    '<div class="dquote">“'+esc(cc.texto.length>600?cc.texto.slice(0,599)+"…":cc.texto)+'”</div>'+
    '<small>'+esc([cc.quien,cuando].filter(Boolean).join(" · "))+'</small>'+lineaOrigen(t)+'</div>';
  var ctx=contextoDe(t), kw=palabrasClave(t);
  /* build 204 (Scotia): si la tarjeta de "Falta info" ya trae el cuadro de Contexto, aqui no se repite */
  if(tipoRevisar(t)!=="falta") h+='<div class="dctx"><h4>Contexto</h4>'+(ctx?'<p>'+esc(ctx)+'</p>':'<p class="vac">Todavía no tengo contexto. Díctalo abajo y lo sumo aquí.</p>')+
     (kw.length?'<div class="kw">'+kw.map(function(w){ return '<span>'+esc(w)+'</span>'; }).join("")+'</div>':'')+'</div>';
  if(frows) h+='<div class="dsec"><dl>'+frows+'</dl></div>';
  return h;
}
/* build 195: Tarea | Dato grande, arriba (solo en lo nuevo/incompleto) */
/* build 195: tarjetas de lo nuevo/incompleto: Contexto (rayita 75%) + lo que falta */
/* build 209: la ficha como quedo, legible, cada campo se toca para corregirlo (dictado a Claude) */
function fichaRevision(t){
  var c=completitud(t), ctx=contextoDe(t), F=[];
  var fin=t.indefinida===true?"Indefinida":(esRecurrente(t)?(t.periodicidad==="semanal"?"Recurrente · cada semana":"Recurrente · cada mes"):(t.f_vigente?fechaConDia(t.f_vigente):""));
  F.push(["nombre","Nombre",t.nombre||""]);
  F.push(["tipo","Es",c.tipo==="dato"?"Dato":"Tarea"]);
  F.push(["contexto","Contexto",ctx]);
  if(c.tipo==="dato"){
    F.push(["de","De",t.de_quien||t.proyecto||""]);
    var _cf=(t.datos_corregidos||[]).slice(-1).map(function(d){ return String((d&&d.t)||d||""); })[0]||""; F.push(["cifras","Cifras",_cf]);
  } else {
    F.push(["fecha",t.indefinida===true||esRecurrente(t)?"Finiquito":"Fecha",fin]);
    F.push(["ritmo","Ritmo",t.ritmo||((t.avisos||[]).filter(function(a){ return a&&a.fecha; }).length?"Avisos puestos":"")]);
    F.push(["quien","Quién",t.revisa_ext&&t.duenio===yo?t.revisa_ext+" · tú supervisas":(t.duenio&&PERSONAS[t.duenio]?(t.duenio===yo?"Tú":PERSONAS[t.duenio].nombre):"")]);
    if(t.seg_a && t.seg_a.contacto) F.push(["seguimiento","Seguimiento",t.seg_a.contacto+(t.seg_a.cada?" · "+t.seg_a.cada:"")+(t.seg_a.hora?" · "+t.seg_a.hora+(t.seg_a.hora_defecto?" (por defecto)":""):"")]);
  }
  var _cp221=_compartirLista(t); if(_cp221.length) F.push(["compartir","Se comparte con",_cp221.map(function(c){ return c.nombre; }).join(" · ")]);
  var kw=(t.palabras||[]).slice(0,10); if(kw.length) F.push(["etiquetas","Etiquetas",kw.join(" · ")]);
  var pd=t.dup_resuelto?[]:posibleDup(t); if(pd.length) F.push(["vinculo","Vínculo propuesto",pd.slice(0,3).map(nombreVinc).join(" · ")+" (no vinculado)"]);
  return '<div class="ffin">'+F.map(function(x){ return '<button class="ffr" data-fedit="'+x[0]+'"><span class="ffl">'+esc(x[1])+'</span><span class="ffv'+(x[2]?'':' vac')+'">'+esc(x[2]||"—")+'</span></button>'; }).join("")+'</div>';
}
function vFaltaInfo(t){
  var c=completitud(t), ctx=contextoDe(t), kw=palabrasClave(t);
  /* build 229: "¿Te lo agendo?" ya no va en "Datos de la tarea": vive solo en su franja "Agendar" */
  c=JSON.parse(JSON.stringify(c)); c.items=c.items.filter(function(x){ return x.k!=="agenda"; }); c.hechos=c.items.filter(function(x){ return x.ok; }).length; c.datosPct=Math.round(c.hechos*100/(c.items.length||1));
  /* build 208: durante el palomeo, lo que aun no toca se ve pendiente y lo recien palomeado va en su renglon, animado */
  var _P=(window.__palomeo||{})[t.id]||null;
  if(_P){ c=JSON.parse(JSON.stringify(c)); c.items.forEach(function(x){ if(_P.pend.indexOf(x.k)>=0) x.ok=false; });
    if(_P.pend.indexOf("ctx")>=0){ c.ctxOk=false; c.ctxPct=Math.min(c.ctxPct,74); }
    c.hechos=c.items.filter(function(x){ return x.ok; }).length; c.datosPct=Math.round(c.hechos*100/(c.items.length||1)); }
  /* build 205: arriba "Solo me falta: …"; lo ya completo se pone tenue y plegado */
  var _sf=_P?[]:soloMeFalta(t), h=_sf.length?'<div class="solofalta"><b>Solo me falta:</b> '+esc(_sf.join(" · "))+'</div>':'';
  if(t.hecho238 && !_P && !(t._leyendo && Date.now()-t._leyendo<60000)) return "";   /* build 238: tras el dictado solo queda la tarjeta Hecho / Me falta */
  /* build 236: mientras NO este clasificada se ocultan "Solo me falta", "Datos de la tarea" y "Agendar": solo el Contexto en una linea con su clip */
  if(!clasif236(t) && !_P){ return '<div class="fic ctx hecho ctx236"><span class="ok">Contexto</span><span class="ctxc'+(ctx?'':' vac')+'">'+esc(ctx?(ctx.length>90?ctx.slice(0,89)+"…":ctx):"sin contexto todavía")+'</span>'+vClipEvid(t,"ctx")+'</div>'; }
  if(t._leyendo && Date.now()-t._leyendo<60000) h='<div class="solofalta leyendo">Claude está leyendo lo que dictaste…</div>'+h;
  var _pd207=t.dup_resuelto?[]:posibleDup(t);   /* build 207: vinculos que propuso Claude, solo propuestos */
  if(_pd207.length) h+='<div class="revc c-vincular"><button class="rvx" data-rvx="1" aria-label="Cerrar sugerencia">✕</button><span class="rct">POSIBLE VINCULACIÓN</span><span class="rcp">Propuesta de Claude; no la vinculé.</span>'+
    _pd207.slice(0,3).map(function(d){ return '<div class="rvv"><span><b>'+esc(nombreVinc(d))+'</b></span><button class="rvb" data-rvinc="'+esc(d.id)+'">'+(esCerradaReciente(d)?'Ver':'Vincular')+'</button></div>'; }).join("")+'</div>';
  if(c.ctxOk) h+='<div class="fic ctx hecho'+(_P&&_P.hechos.indexOf("ctx")>=0?' palomea':'')+'"><span class="ok">✓ Contexto</span><span class="ctxc">'+esc(ctx.length>90?ctx.slice(0,89)+"…":ctx)+'</span>'+vClipEvid(t,"ctx")+'</div>';   /* 229: clip de evidencia */
  else h+='<div class="fic ctx"><div class="meter"><div class="lb"><span class="ok">Contexto'+(c.ctxOk?' ✓':'')+'</span><span class="pend">'+(c.ctxOk?'listo':'mínimo en la rayita')+'</span>'+vClipEvid(t,"ctx")+'</div>'+
    '<div class="bar g"><i style="width:'+c.ctxPct+'%"></i></div></div>'+
    (ctx?'<p>'+esc(ctx)+'</p>':'<p class="vac">Dime de qué se trata.</p>')+
    (kw.length?'<div class="kw">'+kw.map(function(w){ return '<span>'+esc(w)+'</span>'; }).join("")+'</div>':'')+'</div>';
  var _ok=c.items.filter(function(x){ return x.ok; }), _pe=c.items.filter(function(x){ return !x.ok; });
  if(_P){ var _rec=_ok.filter(function(x){ return _P.hechos.indexOf(x.k)>=0; }); _ok=_ok.filter(function(x){ return _P.hechos.indexOf(x.k)<0; });
    h+='<div class="fic info"><div class="meter"><div class="lb"><span style="color:var(--fi-blue)">'+(c.tipo==="dato"?'Datos del dato':'Datos de la tarea')+'</span><span class="pend">'+c.hechos+' de '+c.items.length+'</span></div>'+
      '<div class="bar b"><i style="width:'+c.datosPct+'%"></i></div></div><ul class="chk">'+
      _rec.map(function(x){ return '<li class="ok palomea">✓ '+esc(x.tx)+'</li>'; }).join("")+
      _pe.map(function(x){ return '<li class="pend">○ '+esc(x.tx)+'</li>'; }).join("")+
      (_ok.length?'<li class="ok tenue">✓ '+esc(_ok.map(function(x){ return x.tx; }).join(" · "))+'</li>':'')+'</ul></div>';
    return h; }
  var _btn=function(ok){ return ok?'<button class="autpill" id="autrev">1 cosa para ti · Autorizar</button>':''; };   /* build 209; 225: sin botón verde gigante, pastilla discreta */
  if(!_pe.length && c.ctxOk){ h+='<div class="fic info hecho"><span style="color:var(--fi-blue)">✓ '+(c.tipo==="dato"?'Datos del dato':'Datos de la tarea')+'</span></div>'+vAgenda(t)+fichaRevision(t)+_btn(c.completa); return h; }
  if(!_pe.length){ h+='<div class="fic info hecho"><span style="color:var(--fi-blue)">✓ '+(c.tipo==="dato"?'Datos del dato':'Datos de la tarea')+'</span></div>'+vAgenda(t)+_btn(false); return h; }
  h+='<div class="fic info"><div class="meter"><div class="lb"><span style="color:var(--fi-blue)">'+(c.tipo==="dato"?'Datos del dato':'Datos de la tarea')+'</span><span class="pend">'+c.hechos+' de '+c.items.length+'</span></div>'+
    '<div class="bar b"><i style="width:'+c.datosPct+'%"></i></div></div><ul class="chk">'+
    _pe.map(function(x){ return '<li class="pend">○ '+esc(x.tx)+'</li>'; }).join("")+
    (_ok.length?'<li class="ok tenue">✓ '+esc(_ok.map(function(x){ return x.tx; }).join(" · "))+'</li>':'')+'</ul></div>';
  h+=vAgenda(t);
  return h;   /* build 209: no se autoriza hasta completar; 225: sin el botón gris gigante (lo que falta ya está arriba) */
}
/* build 195: cuerpo de un DATO: Total + Desglose (lo mas nuevo arriba, lo anterior se queda como "anterior") */
function vDatoCuerpo(t){
  var ds=(t.datos_corregidos||[]).slice().reverse(), h="";
  ds.forEach(function(d, i){
    var tx=String((d&&d.t)||d||""), p=parseDesglose(tx);
    if(p.total==null && !p.items.length){ h+='<div class="dsec'+(i?' ant':'')+'">'+(i?'<h4>Anterior</h4>':'')+'<div class="dquote">'+esc(tx)+'</div></div>'; return; }
    if(p.total!=null) h+='<div class="dsec'+(i?' ant':'')+'"><h4>'+(i?'Total anterior':'Total')+'</h4><div class="dtot">'+fmtMonto(p.total,true)+'</div>'+
      (p.porML!=null?'<div class="dsub">'+fmtMonto(p.porML,true)+' por metro lineal</div>':'')+'</div>';
    if(p.items.length && !i) h+='<div class="dsec"><h4>Desglose</h4><div class="dl">'+p.items.map(function(x){ return '<div><span>'+esc(x.tx)+'</span><span>'+fmtMonto(x.monto, x.monto%1!==0)+'</span></div>'; }).join("")+'</div></div>';
  });
  return h;
}
/* build 194: tarjeta de DATOS arriba al abrir una cerrada o una que se abrio buscando */
function vDatosTarea(t){
  var ds=(t.datos_corregidos||[]).map(function(d){ return String((d&&d.t)||d||"").trim(); }).filter(Boolean);
  if(!ds.length || !(t.cierre || t.solo_info || window.__porBusqueda===t.id)) return "";
  return '<div class="datoc"><span class="dch">DATOS'+(t.cierre?' · tarea cerrada':'')+'</span>'+
    ds.slice(-4).reverse().map(function(d){ return '<div class="dct">'+esc(d)+'</div>'; }).join("")+'</div>';
}
function abreBusqueda(q, dicho, res){
  window.__busq=window.__busq||{};
  function abre(t){ window.__porBusqueda=t.id; abierta=t.id; barraEstado=null; consulta=""; vista="hilo"; render(); }
  function lista(rs){
    var por={}; rs.forEach(function(x){ por[x.t.id]=x.porque; });
    barraEstado={modo:"escoge", dicho:dicho, hist:[], foto:null, sv:{__abrir:true, texto:q, porque:por, sinNueva:true},
      ops:rs.slice(0,6).map(function(x){ return x.t.id; }), pregunta:"Encontré "+rs.length+". ¿Cuál?"};
    vista="barra"; render();
  }
  var cl=busquedaClara(res);
  if(cl){ abre(cl); return; }
  if(res.length){ lista(res); return; }
  barraEstado={modo:"cargando", dicho:dicho, texto:"Busco “"+q+"”…"}; vista="barra"; render();
  buscaPorSignificado(q, function(ids){
    var ts=ids.map(function(id){ return tareas.filter(function(t){ return t.id===id; })[0]; }).filter(Boolean);
    if(ts.length===1){ abre(ts[0]); return; }
    if(ts.length){ lista(ts.map(function(t){ return {t:t, porque:"parecida por significado"}; })); return; }
    barraEstado={modo:"respuesta", dicho:dicho, texto:"No lo encontré: “"+q+"”. No creé nada."}; vista="barra"; render();
  });
}
/* ===================== build 195 (Salvador 2026-10-04 11:14, maqueta "Fichas limpias" aprobada) =====================
   1 Encabezado: titulo · "Tuya · con X y Y" · un renglon: chip de fecha + ▾ (sin resumen debajo).
   2 ▾ = "Creada con" (el mensaje que la creo) + "Contexto" en verde con palabras (y sinonimos).
   3 "Falta info": lo nuevo o incompleto (sustituye "Falta información" y "Por autorizar"); dentro:
     Tarea | Dato, barra de contexto con minimo en la rayita (75%) y lista de lo que falta.
   4 Dato: Total + Desglose sacados del texto guardado (nunca escritos a mano en el codigo).
   5 Checklist compacto. 6 Iconos de linea. 7 Sinonimos en la busqueda. ===================================== */
var CTX_MIN_PAL=18;                       /* con 18 palabras de contexto se llega a la rayita (75%) */
var SINONIMOS=[
  ["barda","bardas","muro","muros","cerca","cercas","tapia","tapias","bardeado"],
  ["porton","portones","puerta","puertas","reja","rejas"],
  ["costo","costos","precio","precios","cotizacion","cotizaciones","presupuesto","presupuestos"],
  ["casa","casas","residencia","residencias"]
];
function _sinGrupo(w){ var x=_bst(w); for(var i=0;i<SINONIMOS.length;i++){ if(SINONIMOS[i].some(function(y){ return y===w || _bst(y)===x; })) return i; } return -1; }
function mismoSentido(a,b){ if(_bpega(a,b)) return true; var g=_sinGrupo(a); return g>=0 && g===_sinGrupo(b); }
function esDato(t){ return !!(t && (t.es_dato===true || t.solo_info===true || t.tipo_item==="dato")); }
/* Tarea | Dato: lo que el usuario dijo manda; si no, Claude/la app preselecciona */
function tipoItem(t){
  if(t.tipo_item==="dato" || t.tipo_item==="tarea") return t.tipo_item;
  if(esDato(t)) return "dato";
  var cif=(t.datos_corregidos||[]).some(function(d){ return /\$\s*\d|\d[\d,]*\.\d{2}/.test(String((d&&d.t)||d||"")); });
  return (cif && !t.f_vigente && !t.periodicidad) ? "dato" : "tarea";
}
/* SIN USO, REEMPLAZADA: se retira junto con su prueba fichas y titulos (revisión 8-oct) */
function _primerNombre(s){ return String(s||"").trim().split(/\s+/)[0]||""; }
/* SIN USO, REEMPLAZADA: se retira junto con su prueba fichas y titulos (revisión 8-oct) */
function juntaNombres(l){ l=l.filter(Boolean); if(l.length<=1) return l.join(""); if(l.length>3) return l.slice(0,3).join(", ")+" +"+(l.length-3); return l.slice(0,-1).join(", ")+" y "+l[l.length-1]; }
/* "Tuya · con Chuy y Pato" / "De Samuel · con Cynthia" / "Dato · de Manuel Parra" */
/* SIN USO, REEMPLAZADA: se retira junto con su prueba fichas y titulos (revisión 8-oct) */
function subtituloTarea(t){
  var ints=[]; try{ ints=integrantesDe(t); }catch(e){}
  var otros=ints.filter(function(x){ return x.k!==t.duenio && x.k!==yo; }).map(function(x){ return _primerNombre(nombreInt(x.k)); });
  if(esDato(t)){
    var de=t.de_quien || (ints.filter(function(x){ return String(x.k).indexOf("ext:")===0; })[0]||{}).k || "";
    de=String(de).replace(/^ext:/,"") || (t.duenio===yo?"ti":((PERSONAS[t.duenio]||{}).nombre||""));
    return "Dato · de "+de;
  }
  var dueno=t.duenio===yo?"Tuya":"De "+((PERSONAS[t.duenio]||{}).nombre||t.duenio||"");
  return dueno+(otros.length?" · con "+juntaNombres(otros):"");
}
/* build 196: lo mismo, pero los nombres se tocan y abren la ficha de la persona (como build 143) */
/* SIN USO, REEMPLAZADA: se retira junto con su prueba titulos (revisión 8-oct) */
function subtituloHTML(t){
  var txt=subtituloTarea(t), ints=[]; try{ ints=integrantesDe(t); }catch(e){}
  var nom={}; ints.forEach(function(x){ var n=nombreInt(x.k); nom[_primerNombre(n)]=nom[_primerNombre(n)]||n; });
  if(t.de_quien) nom[t.de_quien]=t.de_quien;
  var partes=txt.split(/( · con | · de |, | y )/), out="";
  partes.forEach(function(p, i){
    if(i===0 || /^( · con | · de |, | y )$/.test(p)){ out+=esc(p); return; }
    var full=nom[p]||nom[_primerNombre(p)]||"";
    out+= full ? '<button class="pnom" data-persona="'+esc(full)+'">'+esc(p)+'</button>' : esc(p);
  });
  return out;
}
/* el chip del encabezado -> {cls, ico, txt} */
function chipEncabezado(t){
  if(esDato(t)){
    /* la fecha del dato = cuando llego (el mensaje que lo creo), no cuando se capturo */
    var ds=(t.datos_corregidos||[]), ts=msCreacion(t) || creadaCon(t).ts || (ds.length && ds[ds.length-1].ts) || 0;
    var f=ts?iso(new Date(ts)):"";
    return {cls:"dato", ico:"dato", txt:"Dato"+(f?" · "+fechaMovCorta(f).replace(/^\S+\s+/,""):"")};
  }
  if(t.indefinida===true || esRecurrente(t) || t.tipo==="recurrente")
    return {cls:"ind", ico:"recur", txt:"Indefinida"+(t.f_vigente?" · próx. "+fechaMovCorta(t.f_vigente):"")};
  if(t.f_vigente) return {cls:"", ico:"cal", txt:"Finiquito: "+fechaMovCorta(t.f_vigente)};
  return {cls:"sin", ico:"cal", txt:"Sin fecha de finiquito"};
}
/* el mensaje que creo la tarea -> {texto, ts, quien, foto} */
function creadaCon(t){
  var ms=t.msgs||[], x=null;
  for(var i=0;i<ms.length && i<4;i++){ var m=ms[i]; if(!m) continue; if(m.k==="bal") continue; x=m; break; }
  if(!x) return {texto:String(t.dicho||t.nombre||""), ts:msCreacion(t)||0, quien:"", foto:""};
  var tx=String(x.tr||x.t||""), quien="", foto="";
  var md=tx.match(/^La abriste dictando:\s*“([\s\S]*?)”/);
  if(md){ tx=md[1]; quien="Dictado tuyo"; }
  else if(x.wa_in===1 || x.wa_c || /^wa_/.test(String(x.origen||""))){
    var mm=tx.match(/^([^:\n]{1,40}):\s*([\s\S]*)$/); if(mm) tx=mm[2];
    quien=(x.origen==="wa_saliente"||x.wa_in===0)?"Tu WhatsApp a "+(x.chat||x.wa_c||""):"WhatsApp de "+(x.wa_c||(mm&&mm[1])||"");
    if(x.tipo==="foto" && x.url) foto=x.url;
  } else if(x.k==="bo") quien=(x.de&&x.de!==yo&&PERSONAS[x.de])?PERSONAS[x.de].nombre:"Dictado tuyo";
  return {texto:tx.trim(), ts:x.ts||msCreacion(t)||0, quien:quien, foto:foto};
}
/* palabras para encontrarla (las guardadas, o del nombre y contexto) + un sinonimo de cada una */
function palabrasClave(t){
  var base=(t.palabras&&t.palabras.length)?t.palabras.slice():palabrasBusqueda([t.nombre,t.contexto].join(" ")).slice(0,5);
  var out=[];
  base.forEach(function(w){ w=String(w).toLowerCase(); if(out.indexOf(w)<0) out.push(w);
    var g=_sinGrupo(w); if(g>=0){ var s2=SINONIMOS[g].filter(function(y){ return _bst(y)!==_bst(w) && !/s$/.test(y); })[0]; if(s2 && out.indexOf(s2)<0) out.push(s2); } });
  return out.slice(0,8);
}
/* ---- COMPLETITUD de algo nuevo: contexto (minimo 75%) + lo que falta segun Tarea o Dato ---- */
/* build 201: el contexto que ya hay: el dictado/guardado, o la descripcion larga con la que nacio (campo "tarea") */
function contextoDe(t){
  function pal(x){ return String(x||"").split(/\s+/).filter(function(w){ return w.length>1; }).length; }
  var c=String(t.contexto||"").trim(); if(c) return c;
  var d=String(t.tarea||"").trim();
  if(d && _nn(d)!==_nn(t.nombre||"") && pal(d)>=6) return d;
  /* lo que ya se sabe aunque nadie lo haya escrito en "contexto": el analisis, el ritmo, el mensaje con que nacio */
  var an=String(t.analisis||"").trim(); if(pal(an)>=8) return (an.indexOf(". ")>0?an.slice(0,an.indexOf(". ")+1):an).slice(0,400);
  var ri=String(t.ritmo||"").trim(); if(pal(ri)>=8) return ri.slice(0,400);
  try{ var cc=creadaCon(t); var tx=String(cc.texto||"").replace(/^\[(audio|foto)\]\s*/i,"").trim(); if(pal(tx)>=8 && _nn(tx)!==_nn(t.nombre||"")) return tx.slice(0,400); }catch(e){}
  return "";
}
function contextoPct(t){
  var n=String(contextoDe(t)).split(/\s+/).filter(function(w){ return w.length>1; }).length;
  return Math.min(100, Math.round(n*75/CTX_MIN_PAL));
}
function completitud(t){
  var tipo=tipoItem(t), pct=contextoPct(t), it=[];
  if(tipo==="dato"){
    var nomOk=!!String(t.nombre||"").trim() && !/^(whats\s?app:|recordatorio sin|sin nombre)/i.test(t.nombre) && !/^\+?\d[\d\s]+$/.test(t.nombre);
    var deQ=t.de_quien||t.proyecto||""; if(!deQ){ try{ var cw=contactosWA(t); if(cw.length) deQ=cw[0].nombre; }catch(e){} }
    var cif=(t.datos_corregidos||[]).some(function(d){ return /\d/.test(String((d&&d.t)||d||"")); });
    it.push({k:"que", ok:nomOk, tx:nomOk?"Qué es: "+t.nombre:"Qué es"});
    it.push({k:"de", ok:!!deQ, tx:deQ?"De: "+deQ:"De quién o de qué proyecto"});
    it.push({k:"cifras", ok:cif, tx:cif?"Cifras guardadas":"Las cifras"});
  } else {
    var q=t.duenio && PERSONAS[t.duenio];
    var fin=t.indefinida===true || esRecurrente(t) || !!(t.f_vigente && !t.falta_fecha && !fechaPuestaSola(t));   /* build 201: la fecha que puso el sistema no cuenta */
    var seg=(typeof permiteGenerica==="function" && !permiteGenerica(t)) || (t.avisos||[]).some(function(a){ return a && a.fecha; }) || !!(t.seg_a && ((t.seg_a.programados||[]).length || String(t.seg_a.cada||"").trim())) || !!String(t.ritmo||"").trim() || esRecurrente(t) || (t.indefinida===true && !!t.f_vigente);
    it.push({k:"quien", ok:!!q, tx:q?"Quién: "+(t.revisa_ext&&t.duenio===yo?nombreCorto(t.revisa_ext)+" · tú supervisas":(t.duenio===yo?"tú":PERSONAS[t.duenio].nombre)):"Quién lo hace"});
    it.push({k:"finiquito", ok:fin, tx:fin?(t.indefinida===true||esRecurrente(t)?"Finiquito: indefinida":"Finiquito: "+fechaMovCorta(t.f_vigente)):"Finiquito: ¿fecha o indefinida?"});
    it.push({k:"seguimiento", ok:seg, tx:seg?"Próximo seguimiento listo":"Próximo seguimiento"});
  }
  /* build 202: invitacion, cita o evento -> ultimo paso "¿Te lo agendo?" (antes de quedar completa/autorizada) */
  var _ev=eventoDe(t);
  if(_ev && !(_ev.fecha && _ev.fecha<hoy())){ var _pas=false;   /* build 204: lo que ya paso NO sale en el checklist */
    it.push({k:"agenda", ok:t.agendado===true || t.agendar===false || _pas,
      tx:t.agendado===true?(t.gcal_id?"Agendado · Calendario ✓":"Agendado · Calendario en camino"):(t.agendar===false?"Sin agendar":(_pas?"El evento ya pasó":(_ev.fecha?"¿Te lo agendo?":"¿Qué día es? (para agendarlo)")))}); }
  var hechos=it.filter(function(x){ return x.ok; }).length;
  return {tipo:tipo, ctxPct:pct, ctxOk:pct>=75, items:it, hechos:hechos, datosPct:Math.round(hechos*100/it.length),
          completa:pct>=75 && hechos===it.length};
}
/* "falta finiquito" / "falta contexto": lo primero que falta, para el renglon de inicio */
function faltaPrimero(c){
  var f=c.items.filter(function(x){ return !x.ok; })[0];
  if(f) return {txt:"falta "+({quien:"quién",finiquito:"finiquito",seguimiento:"seguimiento",que:"qué es",de:"de quién",cifras:"cifras",agenda:"agendar"}[f.k]||f.k), col:"#4aa3ff"};
  if(!c.ctxOk) return {txt:"falta contexto", col:"#30d158"};
  return null;
}
/* ===================== build 202 (Salvador 2026-10-04 19:14): ¿TE LO AGENDO? =====================
   Una tarea o dato con campo evento (la Mac 18f lo llena con invitaciones, citas o eventos, tal como vienen)
   o con una cita que se detecta (palabra de cita + fecha exacta u hora en su nombre/contexto/mensaje con que nacio)
   lleva en "Falta info" un ultimo paso "¿Te lo agendo?" con Si / No grandes. Si: recordatorio de Doit (nuevoAviso,
   el mismo de siempre) + Google Calendar abierto con el evento lleno (hora de Monterrey convertida a UTC) +
   agendado:true. No: agendar:false. Sin fecha: primero se pide el dia (SIN FECHA DICTADA = SIN FINIQUITO, Y SE PREGUNTA);
   la fecha detectada nunca se completa sola: solo se toma una fecha EXACTA (con numero); si no, se pregunta. */
var CITA_RE=/\b(citas?|juntas?|reunion(es)?|boda|invitacion(es)?|invitan|invitados?|eventos?|fiesta|cumpleanos|comida|cena|desayuno|misa|graduacion|bautizo|comunion|xv|conferencia|congreso|torneo|partido|consulta|webinar|sesion|ceremonia|velorio|funeral|inauguracion)\b/;
/* build 212 ("Fiesta Cumpleaños Papá": "de 3:00 a 8:00 PM" se agendaba a las 8 PM): en un rango, la hora es la de INICIO
   y la de fin queda para la duracion. Si el inicio no dice am/pm toma el del fin (3 -> 3 PM si termina 8 PM). */
function rangoHora(tx){
  var s=String(tx||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\b([ap])\.\s?m\.?/g,"$1m");
  var m=s.match(/\b(?:de|desde las?)\s+(?:las?\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|hrs?|horas)?\s*(?:a|hasta)\s+(?:las?\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|hrs?|horas|de la (?:tarde|noche|manana))?/);
  if(!m) return null;
  var h1=+m[1], n1=+(m[2]||0), a1=m[3]||"", h2=+m[4], n2=+(m[5]||0), a2=m[6]||"";
  if(h1>23||h2>23||n1>59||n2>59) return null;
  if(!a1 && !a2 && !m[2] && !m[5]) return null;            /* "de 3 a 5" solo (sin hora clara): no se adivina */
  var pm2=/pm|tarde|noche/.test(a2), am2=/am|manana/.test(a2);
  var f24=function(h, a, pmRef){ if(/pm/.test(a)) return h<12?h+12:h; if(/am/.test(a)) return h===12?0:h; return pmRef && h<12 ? h+12 : h; };
  var e2=f24(h2, a2==="pm"||/tarde|noche/.test(a2)?"pm":(am2?"am":""), false), e1=f24(h1, a1, pm2 && (h1+12)<=e2);
  if(/pm|tarde|noche/.test(a2) && h2<12) e2=h2+12;
  var hh=function(h,n){ return String(h).padStart(2,"0")+":"+String(n).padStart(2,"0"); };
  return {ini:hh(e1,n1), fin:hh(e2,n2)};
}
function eventoDe(t){
  if(!t) return null;
  var _f=function(v){ v=String(v||"").trim(); return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:""; };
  var _h=function(v){ v=String(v||"").trim(); return /^\d{2}:\d{2}$/.test(v)?v:""; };
  if(t.evento && typeof t.evento==="object")
    return {titulo:String(t.evento.titulo||t.nombre||"").trim(), fecha:_f(t.evento.fecha), hora:_h(t.evento.hora),
            lugar:String(t.evento.lugar||"").trim(), notas:String(t.evento.notas||"").trim(), todo_dia:t.evento.todo_dia===true, origen:"campo", hora_fin:_h(t.evento.hora_fin)};
  if(t.es_recordatorio) return null;                      /* un recordatorio ya es alarma */
  var cc={texto:""}; try{ cc=creadaCon(t); }catch(e){}
  var tx=[t.nombre, t.contexto, t.tarea, cc.texto].filter(Boolean).join(" · ");
  if(!CITA_RE.test(_nn(tx))) return null;
  var fd={lista:[],dudas:[]}; try{ fd=fechasDichas(tx); }catch(e){}
  var ex=(fd.dudas&&fd.dudas.length)?[]:(fd.lista||[]).filter(_esExacta);
  var hr="", _rg=null; try{ _rg=rangoHora(tx); hr=_rg?_rg.ini:(horaValor(tx)||""); }catch(e){}   /* build 212: rango -> la de inicio */
  if(!ex.length && !hr) return null;                      /* sin fecha ni hora de cita: no se detecta nada */
  /* build 204 (Salvador 21:04, "Fideicomiso: seguimiento con BBVA"): "el 28-sep" sin año se leia como el 28-sep del
     año que entra (el de este año ya paso) y se ofrecia agendar algo que ya fue. Si el año NO se dijo, la fecha es la
     mas cercana a cuando nacio el mensaje; si esa ya paso, no se pregunta. */
  var _f=ex.length?ex[0].f:"";
  if(_f && !new RegExp("\\b"+_f.slice(0,4)+"\\b").test(tx)){
    var _bms=msCreacion(t)||cc.ts||0, _base=_bms?iso(new Date(_bms)):hoy(), _by=+_base.slice(0,4), _dmin=Infinity, _mej=_f;
    [_by-1,_by,_by+1].forEach(function(y){ var c=y+_f.slice(4), dd=Math.abs(Date.parse(c+"T12:00:00Z")-Date.parse(_base+"T12:00:00Z"));
      if(!isNaN(dd) && dd<_dmin){ _dmin=dd; _mej=c; } });
    _f=_mej;
  }
  return {titulo:String(t.nombre||"").trim(), fecha:_f, hora:_h(hr), lugar:"", notas:"", todo_dia:false, origen:"detectado", hora_fin:_rg?_rg.fin:""};
}
function eventoPendiente(t){
  if(!t || t.cierre || t.fusionada_en || estadoReal(t)==="cerrada") return false;
  if(t.agendado===true || t.agendar===false) return false;
  var ev=eventoDe(t); if(!ev) return false;
  return !(ev.fecha && ev.fecha<hoy());                   /* lo que ya paso no se agenda */
}
/* AAAA-MM-DD + HH:MM en Monterrey -> ms UTC (sin suponer el desfase: se mide con Intl) */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function mtyAUtcMs(fecha, hora){
  var p=fecha.split("-").map(Number), h=String(hora||"00:00").split(":").map(Number);
  var guess=Date.UTC(p[0],p[1]-1,p[2],h[0],h[1]);
  var fmt=new Intl.DateTimeFormat("en-US",{timeZone:"America/Monterrey",hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
  function off(ms){ var o={}; fmt.formatToParts(new Date(ms)).forEach(function(x){ o[x.type]=x.value; });
    return Date.UTC(+o.year,+o.month-1,+o.day,(+o.hour)%24,+o.minute)-ms; }
  var ms=guess-off(guess); return guess-off(ms);
}
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function _gcalUtc(ms){ return new Date(ms).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""); }
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function urlGoogleCal(ev, t){
  var dates;
  if(ev.hora){ var a=mtyAUtcMs(ev.fecha, ev.hora), b=(ev.hora_fin && ev.hora_fin>ev.hora)?mtyAUtcMs(ev.fecha, ev.hora_fin):a+60*60*1000; dates=_gcalUtc(a)+"/"+_gcalUtc(b); }   /* build 212: con hora de fin, esa duracion; si no, 1 hora */
  else { var p=ev.fecha.split("-").map(Number), sig=new Date(Date.UTC(p[0],p[1]-1,p[2]+1)).toISOString().slice(0,10);
    dates=ev.fecha.replace(/-/g,"")+"/"+sig.replace(/-/g,""); }                                            /* todo el dia */
  var det=[ev.notas, (t&&contextoDe(t))||"", t?"Desde Doit: "+t.nombre:""].filter(Boolean).join("\n");
  return "https://calendar.google.com/calendar/render?action=TEMPLATE"+
    "&text="+encodeURIComponent(ev.titulo||(t&&t.nombre)||"Evento")+"&dates="+dates+
    "&details="+encodeURIComponent(det)+(ev.lugar?"&location="+encodeURIComponent(ev.lugar):"")+"&ctz=America%2FMonterrey";
}
/* build 203 (Salvador 2026-10-04 19:26, "ahórrame todos los pasos posibles"): Sí NO abre Google Calendar. Pone al instante
   la alarma de Doit y deja gcal:"pendiente" con el evento completo; el trabajador con el conector de Calendar lo crea y
   escribe gcal_id. Sin hora: en la MISMA pregunta se pide la hora o "Todo el día" (la alarma suena a las 8:00 AM). */
var AGENDA_HORA_TODO_DIA="08:00";
/* ===================== build 229 (Salvador 16:34 y 16:36; "Limpieza Lote Samuel" y "Blue Cup BBVA") =====================
   A) Tarea nueva sin clasificar: Tarea · Dato · Vincular, chicos y en una fila. Vincular = la hoja "Vincular a otra tarea" que ya
      existia (abreEnlazar: lupa + lista), ahora con las parecidas primero y "Tarea nueva" arriba. Al vincular, todo pasa a la elegida y
      esta queda apartada (enlazaTareas: nada se borra).
   B) "¿Te lo agendo?" -> franja compacta "Agendar" como la de Contexto: una linea con lo que propone Claude, clip de evidencia, "Sí" y
      "⋯" (Cambiar fecha u hora · Todo el día · No). La hora solo se pide dentro de "Cambiar". La linea se lee con el audifono.
      EVIDENCIA: campo "evidencia" de la tarea (arreglo {tipo, fuente, titulo, fecha, url?, texto?, de?}); tambien se lee si llega dentro
      de "datos" o "extra" (o como texto JSON). Sin evidencia: clip gris "sin fuente"; fecha propuesta no respaldada: en ambar. */
function evidenciaDe(t){
  var out=[];
  function mete(l){ if(typeof l==="string"){ try{ l=JSON.parse(l); }catch(e){ return; } } if(!Array.isArray(l)) return;
    l.forEach(function(x){ if(x && typeof x==="object" && (x.titulo || x.url || x.texto)) out.push(x); }); }
  if(!t) return out;
  mete(t.evidencia); if(t.datos && typeof t.datos==="object") mete(t.datos.evidencia); if(t.extra && typeof t.extra==="object") mete(t.extra.evidencia);
  return out;
}
var MESES229=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
/* ¿alguna evidencia respalda esta fecha? (dice el dia y el mes, o trae fecha_evento igual) */
function fechaRespaldada(t, f){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(f||"")) return false;
  var d=+f.slice(8,10), m=+f.slice(5,7), mes=MESES229[m-1], ab=mes.slice(0,3);
  var re=new RegExp("(\\b0?"+d+"\\s*(de\\s+)?("+mes+"|"+ab+")\\b)|(\\b0?"+d+"\\s*[/.-]\\s*0?"+m+"\\b)|("+f+")");
  return evidenciaDe(t).some(function(x){ return x.fecha_evento===f || re.test(_nn([x.titulo, x.texto].join(" "))); });
}
function icoFuente(f){ return ico({whatsapp:"bubble", correo:"sobre", drive:"folder", doit:"check"}[String(f||"").toLowerCase()]||"clip",18); }
function vClipEvid(t, donde){
  var n=evidenciaDe(t).length;
  return '<button class="evclip'+(n?'':' sin')+'" data-evid="'+esc(donde||"")+'" aria-label="Evidencia">'+ico("clip",16)+(n?'<span>'+n+'</span>':'<small>sin fuente</small>')+'</button>';
}
function abreEvidencia(t){
  var L=evidenciaDe(t), v=document.createElement("div"); v.className="leemask"; v.id="evi229";
  v.innerHTML='<div class="mov225" role="dialog" aria-label="Evidencia"><div class="h225g"></div><div class="h225h"><b>Evidencia</b><button class="h225b" data-evx="1" aria-label="Cerrar">'+ico("x",14)+'</button></div>'+
    '<div class="h225s">'+(L.length?'De dónde sale lo que propone Claude':'Esta tarea no trae fuente: corrobóralo antes de decir Sí')+'</div><div class="h225c">'+
    L.map(function(x,i){ return '<button class="evr" data-evi="'+i+'">'+icoFuente(x.fuente)+'<span class="evt"><span>'+esc(x.titulo||x.tipo||"Evidencia")+'</span><small>'+esc([x.fuente,x.de,x.fecha].filter(Boolean).join(" · "))+'</small></span>'+ico("der",14)+'</button>'; }).join("")+
    '</div></div>';
  document.body.appendChild(v);
  v.addEventListener("click", function(ev){ ev.stopPropagation(); var b=ev.target.closest("[data-evi]");
    if(b){ var x=L[+b.getAttribute("data-evi")]; if(!x) return; var tp=String(x.tipo||"").toLowerCase();
      if(tp==="imagen" && x.url){ v.remove(); abreVisor([{img:true, data:x.url, url:x.url, de:(x.titulo||"")+(x.de?" · "+x.de:""), ts:Date.parse(x.fecha||"")||Date.now()}], 0); return; }
      if(tp==="pdf" && x.url){ try{ window.open(x.url, "_blank", "noopener"); }catch(e){} return; }
      var c=v.querySelector(".h225c"); c.innerHTML='<button class="evr" data-evback="1">'+ico("back",16)+'<span class="evt"><span>Evidencia</span></span></button><div class="evtx"><b>'+esc(x.titulo||"")+'</b><small>'+esc([x.fuente,x.de,x.fecha].filter(Boolean).join(" · "))+'</small><p>'+esc(x.texto||x.url||"")+'</p></div>'; return; }
    if(ev.target.closest("[data-evback]")){ v.remove(); abreEvidencia(t); return; }
    if(ev.target===v || ev.target.closest("[data-evx]")) v.remove(); });
}
/* la linea que propone Claude: "Vie 9 oct · todo el día · Límite confirmar renta de equipo" */
function propuestaAgenda(t){
  var ev=eventoDe(t); if(!ev) return null;
  var f=ev.fecha?fechaMovCorta(ev.fecha):"Sin fecha"; f=f.charAt(0).toUpperCase()+f.slice(1);
  var h=ev.hora?(ev.hora_fin && ev.hora_fin>ev.hora?"de "+horaBonita(ev.hora)+" a "+horaBonita(ev.hora_fin):"a las "+horaBonita(ev.hora)):"todo el día";
  return {ev:ev, txt:[f, h, ev.titulo||t.nombre, ev.lugar].filter(Boolean).join(" · "), respaldada:fechaRespaldada(t, ev.fecha)};
}
function vAgenda(t){
  if(!eventoPendiente(t)) return "";
  var p=propuestaAgenda(t); if(!p) return "";
  var ev=p.ev, edit=!ev.fecha || !!(window.__agEdit && window.__agEdit[t.id]);
  var h='<div class="fic agenda229"><div class="agr">'+ico("cal",17)+'<span class="agk">Agendar</span>'+
    '<span class="agp'+(p.respaldada?'':' ambar')+'">'+esc(p.txt)+'</span>'+
    vClipEvid(t,"agenda")+
    (edit?'':'<button class="agsi" data-agenda="si">Sí</button>')+
    '<button class="agmas" data-agmenu="1" aria-label="Más opciones">'+ico("more",18)+'</button></div>';
  if(edit) h+='<div class="agin229">'+(!ev.fecha?'<span class="agq">¿Qué día es? Sin fecha no lo agendo.</span>':'')+
    '<input type="date" id="agf" value="'+esc(ev.fecha)+'" aria-label="Día"><input type="time" id="agh" value="'+esc(ev.hora)+'" aria-label="Hora (opcional)">'+
    '<button class="agok229" data-agguarda="1">Guardar</button></div>';
  return h+'</div>';
}
function agendaTodoDia(t){ var ev=eventoDe(t)||{titulo:t.nombre}; t.evento={titulo:ev.titulo||t.nombre, fecha:ev.fecha||"", hora:"", lugar:ev.lugar||"", notas:ev.notas||"", todo_dia:true, fecha_dictada:ev.fecha_dictada||ev.origen==="campo"}; guarda(t); }
function menuAgenda(t, el){
  var r=el.getBoundingClientRect();
  leeMenu(r.left+r.width/2, r.top, [
    ["Cambiar fecha u hora", function(){ window.__agEdit=window.__agEdit||{}; window.__agEdit[t.id]=1; render(); }],
    ["Todo el día", function(){ agendaTodoDia(t); render(); }],
    ["No agendar", function(){ noAgendar(t); }]]);
}
/* para el audifono */
function _leeAgenda(t){
  try{ if(!eventoPendiente(t)) return null; var p=propuestaAgenda(t); if(!p) return null;
    return {tx:"Para agendar: "+limpiaHabla(p.txt.replace(/ · /g,", "))+"."+(p.respaldada?"":" Ojo: esa fecha no viene en ninguna fuente.")+" ¿Lo agendo?"}; }catch(e){ return null; }
}
/* build 236 (Salvador 19:24): Tarea · Dato · Vincular vuelven a ser botones GRANDES (48 px, mismo ancho, todo el ancho), solo contorno:
   Tarea azul, Dato blanco, Vincular morado; elegido = relleno suave del mismo color. Van justo debajo de la fila de fichas. */
function esIA(t){ return !!t && (t.creada_por==="ia_revisor" || /_revisor$/.test(String(t.origen||""))); }
function clasif236(t){ if(t && !esIA(t)) return true;   /* build 240: a mano o con historia: nunca pide clasificar */
  if(!t || !(t.tipo_item==="tarea" || t.tipo_item==="dato")) return false;
  /* build 237: la Mac (armaTarea) pone tipo_item al crear; eso NO es elegir. Clasificada = la eligio Salvador (tipo_elegido) o no la creo la IA */
  return t.tipo_elegido===true || !(t.creada_por==="ia_revisor" || /_revisor$/.test(String(t.origen||""))); }
function vTipoToggle(t){
  var tp=clasif236(t)?t.tipo_item:"";
  return '<div class="typep229 tp236"><button data-tipoi="tarea" class="tp-t'+(tp==="tarea"?" on":"")+'">Tarea</button>'+
    '<button data-tipoi="dato" class="tp-d'+(tp==="dato"?" on":"")+'">Dato</button><button data-tipoi="vincular" class="tp-v">Vincular</button></div>';
}
/* parecidas primero: las que propuso Claude (posibleDup) y las que comparten palabras del nombre/contexto */
function similares229(t){
  var ids={}, out=[]; try{ posibleDup(t).forEach(function(d){ if(!ids[d.id]){ ids[d.id]=1; out.push(d); } }); }catch(e){}
  var ws=palabrasBusqueda([t.nombre, t.contexto].join(" ")).map(function(w){ return _nn(w).slice(0,6); }).filter(function(w){ return w.length>=4; });
  if(ws.length){ tareas.map(function(d){ if(!d || d.id===t.id || ids[d.id] || d.cierre || d.fusionada_en || estadoReal(d)==="cerrada" || d.es_recordatorio) return null;
      var n=_nn([d.nombre, d.contexto].join(" ")), p=ws.filter(function(w){ return n.indexOf(w)>=0; }).length; return p?{d:d,p:p}:null; })
    .filter(Boolean).sort(function(a,b){ return b.p-a.p; }).slice(0,5).forEach(function(o){ ids[o.d.id]=1; out.push(o.d); }); }
  return out.slice(0,6);
}
/* la linea de la ficha cuando ya se agendo */
/* PENDIENTE DE CONECTAR (revisión 8-oct) */
function lineaAgenda(t){
  if(!t || t.agendado!==true) return "";
  return '<div class="agst">'+ico("cal",15)+'<span>Agendado ✓ · '+(t.gcal_id?'Calendario ✓':'Calendario: en camino')+'</span></div>';
}
function guardaFechaEvento(t, f, h){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(f||"")){ toast("Pon el día"); return false; }
  var ev=eventoDe(t)||{titulo:t.nombre, lugar:"", notas:""};
  t.evento={titulo:ev.titulo||t.nombre, fecha:f, hora:/^\d{2}:\d{2}$/.test(h||"")?h:"", lugar:ev.lugar||"", notas:ev.notas||"", todo_dia:false, fecha_dictada:true};
  window.__agEdit=window.__agEdit||{}; window.__agEdit[t.id]=0; guarda(t); return true;
}
function agendaEvento(t, hora, todoDia){
  var ev=eventoDe(t);
  if(!ev || !ev.fecha){ window.__agEdit=window.__agEdit||{}; window.__agEdit[t.id]=1; toast("Primero el día"); render(); return null; }
  var hr=ev.hora || (/^\d{2}:\d{2}$/.test(hora||"")?hora:""), td=!hr && (ev.todo_dia===true || todoDia===true);
  if(!hr && !td){ toast("Pon la hora o Todo el día"); return null; }       /* sin hora la alarma no suena */
  var av=nuevoAviso(t, {texto:ev.titulo||t.nombre, fecha:ev.fecha, hora:hr||AGENDA_HORA_TODO_DIA, dicho:""});
  var _hf=(hr && ev.hora===hr && ev.hora_fin && ev.hora_fin>hr)?ev.hora_fin:"";   /* build 212: fin del rango, para la duracion en Calendar */
  t.evento={titulo:ev.titulo||t.nombre, fecha:ev.fecha, hora:hr, hora_fin:_hf, lugar:ev.lugar||"", notas:ev.notas||"", todo_dia:td, agendado_ts:Date.now(), aviso_ts:av.ts};
  t.agendado=true; t.agendar=true; t.gcal="pendiente";       /* el trabajador con el conector de Calendar lo crea y escribe gcal_id */
  msg(t,"bi","Agendado: “"+t.evento.titulo+"” · "+fechaBonita(ev.fecha)+(hr?(_hf?" · de "+horaBonita(hr)+" a "+horaBonita(_hf):" · a las "+horaBonita(hr)):" · todo el día")+(ev.lugar?" · "+ev.lugar:"")+
    ". La alarma de Doit ya quedó"+(td?" (ese día a las "+horaBonita(AGENDA_HORA_TODO_DIA)+")":"")+"; el Calendario va en camino.");
  guarda(t); sincronizaAvisos(t);
  if(window.__agTodoDia) window.__agTodoDia[t.id]=0;
  if(!revisaCompleta(t)) render();
  return t.evento;
}
function noAgendar(t){ t.agendar=false; guarda(t); if(!revisaCompleta(t)) render(); }
/* ---- DESGLOSE de un dato guardado: Total, por mL y renglones con monto, del texto tal cual ---- */
function _monto(s){ var m=String(s).match(/\$\s*([\d,]+(?:\.\d+)?)/); return m?Number(m[1].replace(/,/g,"")):null; }
function _limpiaEtiqueta(lb){
  var s=String(lb).replace(/\([^)]*\)/g," ").replace(/^.*?:\s*/,"").trim();
  var mm=s.search(/\s\d+(?:[.,]\d+)?\s*(?:m|ml|cm|mts?|metros?)\b/i); if(mm>0) s=s.slice(0,mm);
  return s.replace(/\s+/g," ").replace(/[\s,.;:-]+$/,"").trim();
}
function parseDesglose(txt){
  var s=String(txt||""), r={total:null, porML:null, items:[]};
  s.split(/\s*[·•;\n]\s*/).forEach(function(seg){
    var mo=_monto(seg); if(mo==null) return;
    if(/\btotal\b/i.test(seg) && !/promedio|por\s*m/i.test(seg)){ r.total=mo; return; }
    if(/por\s*(?:m\b|ml\b|metro)/i.test(seg)){ r.porML=mo; return; }
    var lb=_limpiaEtiqueta(seg.slice(0, seg.indexOf("$")));
    if(lb) r.items.push({tx:lb, monto:mo});
  });
  if(r.total==null && r.items.length>1) r.total=null;   /* nunca se suma por nuestra cuenta: si no viene, no se pone */
  return r;
}
function fmtMonto(n, dec){ if(n==null) return ""; var x=Number(n).toLocaleString("en-US",{minimumFractionDigits:dec?2:0, maximumFractionDigits:2}); return "$"+x; }
function buscaPorSignificado(q, cb){
  /* build 194: tambien las cerradas (lo que se guardo "solo para la info") */
  var ab=tareas.filter(function(t){ return !t.es_recordatorio && !t.fusionada_en; })
    .sort(function(a,b){ return (!!a.cierre-!!b.cierre) || ((b.tocada||0)-(a.tocada||0)); })
    .slice(0,260).map(function(t){ return {id:t.id, nombre:t.nombre, cerrada:!!t.cierre}; });
  if(!ab.length){ cb([]); return; }
  var sys="Te doy las tareas abiertas (id y nombre) y lo que alguien busca con sus propias palabras. "+
    "Nadie recuerda el nombre exacto: compara por SIGNIFICADO ('consejo cumbres' = 'mesa directiva cumbres'). Incluye las cerradas. "+
    "Contesta SOLO un JSON: {\"ids\":[<hasta 5 ids, la mas probable primero; vacio si ninguna trata de eso>]}";
  preguntaAClaude([{role:"user",content:sys+"\n\nTAREAS:\n"+JSON.stringify(ab)+"\n\nBUSCA: "+q}],"rapido",function(txt,err){
    if(err){ cb([]); return; }
    try{ var m=String(txt).match(/\{[\s\S]*\}/); var j=m?JSON.parse(m[0]):{}; cb((j.ids||[]).filter(function(id){ return ab.some(function(t){ return t.id===id; }); })); }
    catch(e){ cb([]); }
  });
}
function buscaDuplicado(texto, quien, cb){
  /* 1. caché: mismo dictado en los últimos 10 minutos */
  var ck=claveCache(texto,quien), hit=CACHE_DUP[ck];
  if(hit && Date.now()-hit.ts<600000){ cb(hit.v); return }

  /* 2. filtro local, cero tokens */
  var cand=candidatas(texto,quien);
  /* build 167 (Salvador 2026-10-02): antes, si ninguna PALABRA coincidia se daba
     por NUEVA sin preguntar, y por eso "consejo cumbres" no veia "mesa directiva
     cumbres". Ahora, sin coincidencias de palabra, Claude compara por SIGNIFICADO
     contra TODAS las abiertas (solo id y nombre: barato). */
  if(!cand.length){
    cand=tareas.filter(function(t){ return !t.cierre && !t.es_recordatorio && estadoReal(t)!=="cerrada" && (!quien || t.duenio===quien); })
      .slice(0,220);
    if(!cand.length){ var v0={veredicto:"NUEVA",local:true}; CACHE_DUP[ck]={ts:Date.now(),v:v0}; cb(v0); return }
  }

  /* 3. solo las candidatas, y con los campos cortos */
  var abiertas=cand.map(function(t){
    return {id:t.id, nombre:t.nombre, cada:t.periodicidad||"unica",
            estado:estadoReal(t), de:t.revisar||""};
  });

  var sys="Eres el filtro de tareas repetidas de una empresa pequeña. "+
    "Te doy las tareas ABIERTAS de una persona y una tarea que alguien acaba de dictar. "+
    "Decide en cuál de cinco casos cae.\n"+
    "LOS CINCO:\n"+
    "  MISMA      es la misma tarea que ya existe. No se crea nada.\n"+
    "  ENRIQUECE  es la misma, pero trae MÁS DETALLE: días, lugares, criterios. Se le agrega a la que existe.\n"+
    "  VECINA     es distinta, PERO toca el mismo asunto o el mismo lugar que una que ya existe:\n"+
    "             misma cosa con otra frecuencia, otro día, otro alcance u otro proveedor.\n"+
    "             ES EL CASO MÁS IMPORTANTE: quien dicta puede no acordarse de que ya hay algo parecido.\n"+
    "             Ejemplo: ya hay 'pipas martes y jueves' y dictan 'contrata una pipa los sábados'.\n"+
    "  NUEVA      no se parece a nada abierto.\n"+
    "  DUDA       no estás razonablemente seguro.\n"+
    "REGLAS:\n"+
    "- Una vuelta más de una tarea recurrente NO es una tarea nueva. 'Las pipas del jueves' es la recurrente de pipas.\n"+
    "- Ante VECINA o DUDA nunca decidas solo: hay que preguntar. Equivocarse callado es peor que preguntar.\n"+
    "- Compartir TEMA general (jardin, agua, dinero, mantenimiento) NO hace VECINA: VECINA exige el MISMO objeto o el MISMO servicio. Pagar al jardinero y hacer la poda NO son vecinas.\n"+
    "- NUEVA solo cuando de verdad no toca nada de lo que ya está abierto.\n"+
    "- COMPARA POR SIGNIFICADO, NO POR PALABRAS: la gente no recuerda el nombre exacto. 'Consejo Cumbres' = 'Mesa directiva Cumbres' = 'junta de la colonia'; 'reporte de ventas' = 'informe semanal'; 'seguimiento X' = 'X'. Un archivo o seguimiento NUEVO de una actividad que ya tiene tarea es la MISMA tarea.\n"+
    "Contesta SOLO un JSON: {\"veredicto\":\"MISMA|ENRIQUECE|VECINA|NUEVA|DUDA\",\"id\":\"<id o null>\","+
    "\"que_agrega\":\"<si es ENRIQUECE o VECINA, qué trae de nuevo>\",\"por_que\":\"<una línea>\"}";

  /* build 192: ejemplos reales de vinculaciones que Salvador ya hizo (aprender) */
  var _cv=[]; try{ _cv=censoEjemplos().vinculaciones; }catch(e){}
  var msj=[{role:"user",content:
    (_cv.length?"VINCULACIONES QUE YA SE HICIERON (de -> a, ejemplos reales):\n"+_cv.map(function(x){ return "- "+x.de+" -> "+x.a; }).join("\n")+"\n\n":"")+
    "TAREAS ABIERTAS:\n"+JSON.stringify(abiertas,null,1)+
    "\n\nLO QUE SE ACABA DE DICTAR:\n"+texto}];

  preguntaAClaude([{role:"user",content:sys+"\n\n"+msj[0].content}],"rapido",function(txt,err){
    /* SI EL FILTRO NO PUDO CORRER, LA TAREA SE CREA IGUAL. Antes contestaba
       DUDA y eso BLOQUEABA el alta con un "se parece a algo que ya tienes" que
       ademas era mentira: no se parecia a nada, es que no hubo internet o el
       proxy no contesto. Perder el dictado por una falla tecnica es peor que
       arriesgarse a una repetida, y la falla se DICE en el chat de la tarea.
       Salvador 2026-09-05. */
    if(err){ cb({veredicto:"NUEVA", fallo:true, error:err}); return }
    try{
      var m=txt.match(/\{[\s\S]*\}/);
      var v=m?JSON.parse(m[0]):{veredicto:"DUDA"};
      CACHE_DUP[ck]={ts:Date.now(),v:v};
      cb(v);
    }catch(e){ cb({veredicto:"DUDA"}); }
  });
}

/* qué se le contesta a quien dictó, según el veredicto */
function respuestaDuplicado(v){
  var t=v.id?tareas.filter(function(x){return x.id===v.id})[0]:null;
  if(v.veredicto==="MISMA" && t)
    return {crear:false, texto:"Esa ya existe: “"+t.nombre+"”, de "+PERSONAS[t.duenio].nombre+". "+
      "Va "+estadoReal(t)+(t.ultima?" — "+t.ultima:"")+". No abrí otra."};
  if(v.veredicto==="ENRIQUECE" && t)
    return {crear:false, enriquece:t, texto:"No es nueva: es la misma de “"+t.nombre+"”, con más detalle. "+
      "Le agrego: "+(v.que_agrega||"el detalle que dictaste")+". ¿Lo dejo así?"};
  if(v.veredicto==="VECINA" && t)
    return {crear:null, vecina:t, texto:
      "Ojo: ya tienes “"+t.nombre+"”"+(t.periodicidad?" ("+t.periodicidad+")":"")+", de "+
      PERSONAS[t.duenio].nombre+", y esto toca lo mismo. Antes de abrir otra, dime:",
      ops:[
        {k:"sumar", t:"Súmalo a la que ya existe", d:"Queda una sola tarea con todo. Es lo normal cuando es la misma cosa con otro día o alcance."},
        {k:"aparte",t:"Ábrela aparte",             d:"Solo si de verdad es otro contrato, otro proveedor o se cierra por su lado."},
        {k:"nada",  t:"Con la que ya tengo basta", d:"No se abre nada. Se descarta lo que acabas de dictar."}
      ]};
  /* DUDA solo detiene si se puede ENSEÑAR contra cual choca. Sin eso, el aviso
     era "se parece a algo" sin poder decir a que — imposible de contestar y
     contra la regla de que todo se pueda rastrear. Salvador 2026-09-05. */
  if(v.veredicto==="DUDA" && t)
    return {crear:null, texto:"Se parece a algo que ya tienes: “"+t.nombre+"”"+
      ". ¿Es la misma o de verdad es otra? No la abro hasta que me digas."};
  if(v.fallo)
    return {crear:true, aviso:"No alcancé a revisar si ya tenías una parecida — "+
      "no hubo conexión. La abrí de todos modos: si ya la tenías, ciérrala."};
  return {crear:true, texto:"No se parece a ninguna abierta. La doy de alta."};
}


/* ================= EL CEREBRO: DAÑO Y RITMO =================
   Dictado por Salvador el 2026-09-02, y es la pieza que hace que esto no sea
   una lista de tareas más.

   LO QUE DISPARA LA ESCALADA NO ES LA FECHA. ES EL DAÑO.
   Una tarea vencida no vale lo mismo que otra vencida. Tratarlas igual es lo
   que inunda al jefe: con 15% de retrasos y diez empleados, sin filtro llueve.

   TRES FORMAS DE DAÑO. Las pone Claude al dar de alta la tarea; el empleado
   nunca las ve ni las elige.
     plano       molesta igual todos los días y nunca se vuelve urgente.
                 La luz apagada, un aspersor tapado.
                 NUNCA ESCALA SOLA. Se persigue y entra al resumen.
     escalonado  brinca en cada vuelta perdida. Pipas, rondín, contabilidad.
                 Un martes sin riego no es nada; el jueves ya es plata.
                 ESCALA EN LA SEGUNDA VUELTA PERDIDA.
     acantilado  cero daño hasta la fecha, y al día siguiente catástrofe.
                 Un pago que vence, un permiso, un vuelo.
                 ESCALA ANTES DE VENCERSE, no después.
*/

var DANIO={
  plano:      {escala:false, avisa_antes:0,  toques_antes_de_subir:99},
  escalonado: {escala:true,  avisa_antes:0,  toques_antes_de_subir:2},
  acantilado: {escala:true,  avisa_antes:2,  toques_antes_de_subir:1}
};
function formaDanio(t){ return DANIO[t.danio] ? t.danio : "plano" }

/* cuánto daño lleva acumulado, en "vueltas perdidas" o en días */
function danioAcumulado(t){
  var f=formaDanio(t);
  if(t.cierre) return 0;
  var d=t.f_vigente ? dDif(t.f_vigente,hoy()) : 0;
  if(f==="acantilado") return d>0 ? 99 : 0;              // pasó la fecha: catástrofe
  if(f==="escalonado"){
    var largo = t.periodicidad==="semanal" ? 7 : (t.periodicidad==="mensual" ? 30 : 1);
    return d>0 ? Math.ceil(d/largo) : 0;                  // vueltas perdidas
  }
  return d>0 ? d : 0;                                     // plano: días de molestia
}

/* ---- EL RITMO: ver que va a fallar ANTES de que falle ----
   Si trae pasos y el que tocaba ya se pasó, la tarea todavía no está vencida
   pero ya va a fallar. Ése es el momento de apretar.
   AVISAR ANTES VALE MÁS QUE REPORTAR DESPUÉS. */
function ritmo(t){
  if(t.cierre || !t.pasos || !t.pasos.length || !t.f_original) return null;
  var i=t.paso||0;
  var paso=t.pasos[i]; if(!paso) return null;
  var nace=t.pasos[0] && t.pasos[0].dia!=null ? t.pasos[0].dia : 0;
  var inicio=dmDe(t.f_original, -(t.pasos[t.pasos.length-1].dia||0));
  var debio=dmDe(inicio, paso.dia||0);
  var atraso=dDif(debio,hoy());
  if(atraso<=0) return null;
  var quedan=dDif(hoy(), t.f_vigente||t.f_original);
  var faltan=t.pasos.length-i;
  return {
    paso:paso.t, atraso:atraso, quedan:quedan, faltan:faltan,
    /* va a fallar si lo que falta ya no cabe en lo que queda */
    va_a_fallar: quedan < (t.pasos[t.pasos.length-1].dia||0) - (paso.dia||0)
  };
}

/* ---- ¿ESTO LE TOCA AL JEFE, O TODAVÍA ME TOCA A MÍ? ----
   Yo absorbo el perseguir. Solo lo que sobrevive a mis toques sube.
   Devuelve null cuando NO debe subir. */
function subeAlJefe(t){
  if(t.cierre) return null;
  var f=formaDanio(t), cfg=DANIO[f];
  var toques=(t.empujones||[]).length;

  /* acantilado: se avisa ANTES de la fecha */
  /* build 196 (TONO DE LOS SEGUIMIENTOS): positivo, sin "vence"; una indefinida/recurrente no tiene finiquito */
  if(f==="acantilado" && !sinFinal(t)){
    var faltan=t.f_vigente?dDif(hoy(),t.f_vigente):99;
    var _q=(t.duenio&&PERSONAS[t.duenio])?PERSONAS[t.duenio].nombre:"";
    if(faltan<=cfg.avisa_antes)
      return {por:"acantilado_cerca",
        texto:"“"+t.nombre+"” tiene su fecha "+(faltan<=0?"hoy":"en "+faltan+" día"+(faltan===1?"":"s"))+
              " y después ya no sirve. "+(_q?"Un empujón a "+_q+" para cerrarla a tiempo puede hacer la diferencia.":"Vale la pena cerrarla a tiempo.")};
  }
  if(!cfg.escala) return null;
  var acum=danioAcumulado(t);
  if(acum<=0) return null;
  if(f==="escalonado" && acum<2) return null;              // la primera vuelta no sube
  if(toques<cfg.toques_antes_de_subir) return null;        // primero la persigo yo

  return {por:"danio", vueltas:acum,
    texto:"“"+t.nombre+"”: "+(f==="escalonado"
      ? acum+" vueltas perdidas seguidas"
      : acum+" días vencida")+
      " y todavía sin fecha nueva. Ya le propuse el siguiente paso; una palabra tuya puede destrabarla."};   /* build 282 (F39): sin conteo de veces */
}

/* lo que yo hago antes de molestar a nadie.
   'dicho' es el texto que escribió Claude para ESTA tarea. Si no llegó (sin
   internet, sin proxy, o contestó cualquier cosa), se usa el texto de siempre:
   el correteo NUNCA se detiene porque la IA no contestó. */
/* build 282 (F39): textos de respaldo del correteo (cuando Claude no redacta). Rotan para no repetir el mismo texto. */
var EMPUJON282=[
  function(x){ return "“"+x+"” ya pasó su fecha. ¿Cuál es el siguiente paso y qué día te queda para cerrarla? Si algo te frena, dime y lo resolvemos juntos."; },
  function(x){ return "Retomemos “"+x+"”: con una fecha corta la dejamos encaminada. ¿Qué te ayudaría a terminarla?"; },
  function(x){ return "Propongo partir “"+x+"” en un paso chico para esta semana. ¿Qué día te queda? Si prefieres otro plan o que la apoye alguien más, dímelo."; },
  function(x){ return "Vamos por “"+x+"”: ¿qué es lo primero que se puede avanzar hoy? Cuenta conmigo para lo que necesites."; }
];
function textoEmpujon(nombre, n){ n=Math.max(0, +n||0); var i=n<EMPUJON282.length?n:1+((n-1)%(EMPUJON282.length-1)); return EMPUJON282[i](nombre); }
function empujon(t, dicho){
  t.empujones=t.empujones||[];
  var n=t.empujones.length, f=formaDanio(t), r=ritmo(t);
  var txt;
  if(dicho && String(dicho).trim().length>8){ txt=String(dicho).trim(); }
  else if(r && !danioAcumulado(t)){
    /* build 282 (F39, regla TONO DE LOS SEGUIMIENTOS de Salvador 2026-10-04): proactivo y motivador, como lider de empresa top:
       reconoce + propone el siguiente paso + ofrece ayuda + pide una fecha corta. Nunca conteos, regaños ni tercera persona. */
    txt = r.va_a_fallar
      ? "“"+r.paso+"” va un poco atrás, pero todavía estamos a tiempo de sacar “"+t.nombre+"”. ¿Qué te ayudaría a destrabarlo hoy? Si necesitas algo, dímelo y lo resolvemos."
      : "Sigue “"+r.paso+"” en “"+t.nombre+"”. ¿Lo dejamos listo hoy? Si algo lo frena, dime qué necesitas.";
  } else if(n===0 && sinFinal(t)){
    /* build 191: recurrente/indefinida no tiene finiquito: se pide el avance, en positivo */
    txt="Tocaba “"+t.nombre+"” el "+fechaBonita(t.f_vigente)+". ¿Ya quedó? Si sí, dímelo y la paso a la siguiente.";
  } else {
    txt=textoEmpujon(t.nombre, n);
  }
  t.empujones.push({f:hoy(),t:txt});
  msg(t,"bal",txt); t.msgs[t.msgs.length-1].aviso=1;
  guarda(t);
  return txt;
}

/* ================= EL CORRETEO — el barrido que trabaja solo =================
   Build 56, 2026-09-04. Hasta aquí barrido() estaba escrito pero NADIE lo
   llamaba: el motor de escalamiento existía y nunca corría.

   DÓNDE CORRE Y POR QUÉ AQUÍ. Corre en el teléfono, no en el servidor. La razón
   es la que más le importa a Salvador: el criterio de a quién se persigue y qué
   sube al jefe es DETERMINÍSTICO y vive en UN SOLO LUGAR (subeAlJefe, ritmo,
   danioAcumulado). Si se reescribiera en PHP para el cron, habría dos motores
   que con el tiempo dejan de decir lo mismo, y nadie se daría cuenta. Así que
   el que decide es este archivo, siempre.

   QUIÉN LO CORRE. El que abra la app barre TODAS las tareas, no solo las suyas:
   la colección es una sola y cualquier sesión abierta puede hacer el trabajo.
   Con que uno del equipo abra la app en el día, el correteo del día ya corrió.

   QUE NO SE REPITA. El candado real vive en Firestore, no en el teléfono:
   ultimoEmpujonHoy(t) y t.subio. Si dos personas abren la app al mismo tiempo,
   el primero que escribe deja marcada la tarea y el segundo ya no la toca.

   LA VOZ. El motor decide A QUIÉN se le habla; Claude solo REDACTA. Si Claude
   no contesta, el correteo sigue con el texto de siempre — jamás se detiene por
   la IA. Y nunca se inventa un dato: Claude solo recibe lo que ya está escrito.

   LOS AVISOS. La app no manda el push: deja el aviso escrito en la cola
   (bitacora_avisos) y barrido.php lo entrega. El servidor es el cartero, no
   decide nada. */
var COLA="bitacora_avisos";
var correteoCorrido=0;

/* un aviso que hay que hacerle llegar a alguien aunque traiga la app cerrada */
function encola(para, titulo, cuerpo, tareaId){
  if(!db || !para || !PERSONAS[para]) return;
  var id="a"+uid();
  db.collection(COLA).doc(id).set({
    id:id, para:para,
    titulo:String(titulo||"Doit").slice(0,60),
    cuerpo:String(cuerpo||"").slice(0,240),
    tarea:tareaId||"", creado:Date.now(), dia:hoy(), enviado:false
  }).catch(function(){});
}

/* lo que el motor escogió, contado en corto para que Claude lo redacte */
function fichaCorreteo(s,i){
  var t=s.t, r=s.ritmo;
  var o={n:i, tarea:t.nombre,
    de:(PERSONAS[t.duenio]&&PERSONAS[t.duenio].nombre)||t.duenio||"",
    toques:(t.empujones||[]).length};
  var d=t.f_vigente?dDif(t.f_vigente,hoy()):0;
  if(d>0) o.vencida_hace=d+(d===1?" día":" días");
  if(r){ o.paso_atrasado=r.paso; o.atraso=r.atraso; if(r.va_a_fallar) o.ya_no_alcanza=true }
  if(t.cierra) o.cierra_con=t.cierra;
  var m=(t.msgs||[]).filter(function(x){return x.k==="bo"});
  if(m.length) o.lo_ultimo_que_contesto=String(m[m.length-1].t).slice(0,120);
  return o;
}

/* Claude redacta los empujones, TODOS en una sola llamada */
function vozDelCorreteo(sel, cb){
  var emp=[]; sel.forEach(function(s,i){ if(s.tipo==="empujon") emp.push(fichaCorreteo(s,i)) });
  if(!emp.length || APP_TOKEN.indexOf("__")===0){ cb(null); return }
  var p=
   "Eres el que persigue las tareas en Duet, la bitacora de una oficina chica en "+
   "Mexico. El motor ya decidio a quien hay que apretar; tu SOLO REDACTAS el "+
   "mensaje que le va a caer en su chat.\n"+
   "COMO SE ESCRIBE (build 282, regla de Salvador): como lo escribiria un lider de "+
   "una empresa de primer nivel: PROACTIVO y MOTIVADOR. Le hablas de tu a la persona "+
   "responsable, en español de Mexico, sin saludo ni preambulo. MAXIMO 2 renglones. "+
   "Estructura: reconoce el avance o el esfuerzo, propone el siguiente paso concreto, "+
   "ofrece ayuda o un plan B y pide una fecha corta. Firme en la fecha, nunca duro. "+
   "Si ya se le pregunto antes (mira 'toques'), cambia el enfoque (partirla en un paso "+
   "chico, ofrecer apoyo), nunca subas el tono.\n"+
   "PROHIBIDO: inventar datos, montos o fechas que no vengan abajo; regañar; amenazar "+
   "(\"le aviso a tu jefe\"); contar cuantas veces se le ha dicho (\"van 3 veces\"); "+
   "pedir explicaciones de por que no se hizo; hablar de Salvador en tercera persona; "+
   "repetir un texto anterior; escribir mas de 2 renglones; poner el nombre de la persona al "+
   "principio como si fuera carta.\n"+
   "Contesta SOLO un JSON, la llave es el numero 'n' de cada una:\n"+
   '{"0":"texto","3":"texto"}\n\n'+
   "LAS TAREAS:\n"+JSON.stringify(emp);
  preguntaAClaude([{role:"user",content:p}],"rapido",function(txt,err){
    if(err||!txt){ cb(null); return }
    var j=null;
    try{ var m=txt.match(/\{[\s\S]*\}/); j=m?JSON.parse(m[0]):null }catch(e){ j=null }
    cb(j);
  });
}

/* EL CORRETEO. Se llama al abrir la app y cada media hora mientras siga abierta. */
function correteo(){
  if(!db || !listo) return;
  if(Date.now()-correteoCorrido < 25*60000) return;
  correteoCorrido=Date.now();

  var sel=[];
  tareas.forEach(function(t){
    if(t.cierre || esEjemplo(t) || t.es_recordatorio) return;
    var sube=subeAlJefe(t);
    if(sube){ if(t.subio!==hoy()) sel.push({t:t, tipo:"jefe", aviso:sube}); return }
    var r=ritmo(t), venc=dDif(t.f_vigente||hoy(),hoy())>0;
    if((r||venc) && ultimoEmpujonHoy(t)!==hoy()) sel.push({t:t, tipo:"empujon", ritmo:r});
  });
  if(!sel.length) return;

  vozDelCorreteo(sel, function(voz){
    sel.forEach(function(s,i){
      var t=s.t;
      if(s.tipo==="empujon"){
        /* si otra sesión ya lo apretó mientras Claude redactaba, ya no */
        if(ultimoEmpujonHoy(t)===hoy()) return;
        var txt=empujon(t, voz?voz[String(i)]:null);
        encola(t.duenio, "Doit", txt, t.id);
      } else {
        if(t.subio===hoy()) return;
        t.subio=hoy(); guarda(t);
        /* El aviso de escalamiento va SOLO a los jefes de verdad. Josué y
           Carlos traen jefe:true nada más para cazar fallas durante la prueba
           (prueba:true): avisarles del riego del fraccionamiento sería puro
           ruido para ellos. */
        Object.keys(PERSONAS).forEach(function(k){
          if(PERSONAS[k] && PERSONAS[k].jefe && !PERSONAS[k].prueba)
            encola(k, "Se te subió una", s.aviso.texto, t.id);
        });
      }
    });
    if(typeof render==="function") render();
  });
}

/* El barrido viejo se borró en el build 63: lo reemplazó correteo(), y dejar
   dando vueltas una segunda función que también escribe en los chats de la
   gente es justo como se cuelan los mensajes dobles. */
function ultimoEmpujonHoy(t){
  var e=t.empujones||[]; return e.length?e[e.length-1].f:null;
}

/* el resumen de una línea. NADA SE ESCONDE, SOLO SE APLAZA:
   lo que no escaló aparece aquí de todos modos. */
function resumenDelDia(){
  var vivas=tareas.filter(function(t){return estaAbierta(t) && !esPropuesta(t)});
  var venc=vivas.filter(function(t){return estadoReal(t)==="vencida"});
  var mal=vivas.filter(function(t){var r=ritmo(t); return r&&r.va_a_fallar});
  var sube=vivas.filter(subeAlJefe);
  return {
    vivas:vivas.length, en_tiempo:vivas.length-venc.length,
    vencidas:venc.length, mal_ritmo:mal.length, para_ti:sube.length,
    acuerdos:resumenAcuerdos(),   /* build 143: cumplidos, vencidos y movidos */
    linea: vivas.length+" tareas vivas, "+(vivas.length-venc.length)+" en tiempo."+
      (venc.length?" "+venc.length+" vencida"+(venc.length===1?"":"s")+": "+
        venc.slice(0,3).map(function(t){return t.nombre.split(" · ")[0]}).join(", ")+".":"")+
      (mal.length?" "+mal.length+" va"+(mal.length===1?"":"n")+" a fallar por ritmo.":"")
  };
}

/* ---- LA ETIQUETA DE CADA TAREA. La pone Claude, no el empleado. ---- */
var REGLAS={
  linea:      {recuperable:true,  criticidad:"normal", f:7,  per:null,      danio:"plano"},
  pipas:      {recuperable:false, criticidad:"diario", f:0,  per:"semanal", dia_fijo:true, danio:"escalonado"},
  palmas:     {recuperable:true,  criticidad:"normal", f:-7, per:null,      danio:"plano"},
  bomba:      {recuperable:true,  criticidad:"diario", f:-1, per:null,      danio:"acantilado"},
  aspersor11: {recuperable:true,  criticidad:"normal", f:3,  per:null,      danio:"plano"},
  rondin:     {recuperable:false, criticidad:"normal", f:0,  per:"semanal", dia_fijo:true, danio:"escalonado"}
};
SEMILLA.forEach(function(t){
  var r=REGLAS[t.id]; if(!r) return;
  t.recuperable=r.recuperable; t.criticidad=r.criticidad; t.danio=r.danio||"plano";
  t.periodicidad=r.per; t.dia_fijo=!!r.dia_fijo;
  t.f_original=dm(r.f); t.f_vigente=t.f_original;
  t.movidas=0; t.detenido=null; t.cierre=null;
});

/* ============ FOTOS: EXIF primero, luego comprimir ============ */
/* cb se llama SIEMPRE una vez: si el archivo no se puede leer (FileReader con error, iCloud sin bajar) se sigue sin EXIF,
   en vez de quedarse en «Comprimiendo…» */
function leerExif(file,cb){
  var listo=false, sale=function(out){ if(listo) return; listo=true; try{ out.tomada=out.tomada||(file&&file.lastModified?new Date(file.lastModified).toISOString():null); }catch(e){} cb(out); };
  var fr; try{ fr=new FileReader(); }catch(e){ sale({}); return; }
  fr.onerror=function(){ sale({error_lectura:true}); };
  fr.onabort=function(){ sale({error_lectura:true}); };
  fr.onload=function(e){
    var out={};
    try{
      var dv=new DataView(e.target.result);
      if(dv.getUint16(0)===0xFFD8){
        var off=2,len=dv.byteLength;
        while(off<len-4){
          if(dv.getUint16(off)===0xFFE1){ out.exif=true; break }
          off+=2+dv.getUint16(off+2);
        }
      }
    }catch(err){}
    out.tomada=file.lastModified?new Date(file.lastModified).toISOString():null;
    sale(out);
  };
  try{ fr.readAsArrayBuffer(file.slice(0,131072)); }catch(e){ sale({error_lectura:true}); }
}
var FOTO_TOPE_MS=20000;
function comprime(file,cb0){
  /* una sola respuesta y con tope: la ubicación (iOS puede no contestar nunca si el permiso queda en el aire) o una
     imagen que no termina de cargar no dejan la foto en «Comprimiendo…» */
  var listo=false, tm=setTimeout(function(){ cb(null, {}); }, FOTO_TOPE_MS);
  var cb=function(data, meta){ if(listo) return; listo=true; clearTimeout(tm); cb0(data, meta); };
  leerExif(file,function(meta){
    var img=new Image(), url=URL.createObjectURL(file);
    img.onload=function(){
      var W=1100, r=Math.min(1,W/img.width);
      var c=document.createElement("canvas");
      c.width=Math.round(img.width*r); c.height=Math.round(img.height*r);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      var data=c.toDataURL("image/jpeg",0.62);
      if(navigator.geolocation){
        var sinUbic=setTimeout(function(){ cb(data,meta); }, 6000);
        try{ navigator.geolocation.getCurrentPosition(function(p){ clearTimeout(sinUbic);
          meta.lat=+p.coords.latitude.toFixed(5); meta.lon=+p.coords.longitude.toFixed(5);
          cb(data,meta);
        },function(){ clearTimeout(sinUbic); cb(data,meta); },{timeout:4000,maximumAge:60000}); }catch(e){ clearTimeout(sinUbic); cb(data,meta); }
      } else cb(data,meta);
    };
    img.onerror=function(){URL.revokeObjectURL(url);cb(null,meta)};
    img.src=url;
  });
}
function pideFoto(cb){
  var i=document.createElement("input");
  i.type="file"; i.accept="image/*";   /* SIN capture: iOS deja escoger del carrete o tomar foto */
  i.onchange=function(){
    var f=i.files&&i.files[0]; if(!f)return;
    toast("Comprimiendo…");
    comprime(f,function(data,meta){ if(data) cb(data,meta); else toast("No se pudo leer la foto") });
  };
  i.click();
}

/* ============ ACCIONES ============ */
/* LO QUE VE EL JEFE EN SU PANTALLA — corregido el 2026-09-03.
   ESTABA MAL: decia "if(PERSONAS[yo].jefe) return true", o sea que a Salvador
   le caian TODAS las tareas de todos, incluidas las de Samuel que van al
   corriente. El lo cacho.
   LA REGLA, PARTE 13: "lo que Salvador ve: solo lo atrasado y lo que vence
   esta semana. Lo que yo llevo: todas las tareas, calladito."
   ASI QUE AHORA al jefe le llegan a la lista SOLO tres cosas:
     · las suyas
     · las que lo estan deteniendo a el (una autorizacion, un si o un no)
     · las que YA ESCALARON, segun subeAlJefe()
   Todo lo demas de los demas NO desaparece: se va al pie, en "En seguimiento
   mio", plegado. Nada se esconde, solo se aplaza.
   POR QUE IMPORTA: la app anterior murio por saturacion. Si al jefe le caen
   cientos de renglones deja de abrirla, y entonces no ve ni lo urgente. */
function leToca(t){
  if(t.duenio===yo) return true;                 // suya
  /* build 179: si yo la reviso (papel REVISA dentro de la misma tarea), me toca desde mi fecha */
  if((t.revisores||[]).indexOf(yo)>=0 && (!t.rev_fecha || dDif(t.rev_fecha,hoy())>=0)) return true;
  if(meDetiene(t)) return true;                  // alguien esta parado por el
  if(!PERSONAS[yo] || !PERSONAS[yo].jefe) return false;
  return !!subeAlJefe(t);                        // ya escalo
}
/* QUÉ TAREAS LLEGAN A ESTE TELÉFONO. El servidor (fs_lista) y Firestore entregan la base completa, y
   muchas vistas recorren `tareas` entera (Te esperan, Vencidas, porRevisar, Bandeja, la barra, el correteo):
   si una ajena entra a la lista, alguna vista acaba pintándola. Por eso el filtro va en la puerta, al cargar:
   el jefe ve todo (su pantalla ya decide qué le sube); los demás solo lo suyo y lo que les toca por las
   reglas de siempre: lo crearon, son encargados o revisores, están integrados, la tarea los espera
   (leToca), escribieron en ella, o cubren al dueño mientras está fuera. Una tarea sin dueño es del jefe. */
function veTarea(t){
  if(!t) return false;
  if(!yo || esJefe(yo)) return true;
  if(t.duenio===yo || t.creada_por===yo || t.encargado===yo) return true;
  if((t.revisores||[]).indexOf(yo)>=0 || (t.integrantes||[]).indexOf(yo)>=0) return true;
  try{ if(leToca(t)) return true; }catch(e){}
  try{ if((encargadoDe(t)||{}).id===yo) return true; }catch(e){}
  if((t.msgs||[]).some(function(m){ return m && m.de===yo; })) return true;
  try{ var s=t.duenio && suplencias[t.duenio]; if(s && s.suplente===yo && estaFuera(t.duenio)) return true; }catch(e){}
  return false;
}
function mias(){
  try{ despiertaTodas(); }catch(e){}
  /* EL BARRIDO CORRE SOBRE TODAS, no solo sobre las que se pintan: si no, una
     no recuperable de otro nunca se cerraria en la sesion del jefe. */
  tareas.forEach(function(t){
    if(t.cierre||!t.f_vigente||t.recuperable!==false) return;
    if(dDif(t.f_vigente,hoy())>0){
      t.cierre={tipo:"no_ejecutada",motivo:"no_recuperable",culpa:"suya",f:hoy()};
      t.estado="no_ejecutada";
      msg(t,"bal","Se pasó la hora y esta tarea no admite entrega tarde. Se cierra y sale de tu lista. Salvador la ve en el semáforo.");
      guarda(t);
    }
  });
  /* los RECORDATORIOS no son tareas: no llevan semaforo ni entran a los grupos.
     Se sacan aqui y se pintan en su propia seccion (misRecordatorios). */
  var base=tareas.filter(function(t){ return leToca(t) && !t.es_recordatorio && !t.pendiente_info && !esPropuesta(t) && !esDormida(t) });
  var vivas=base.filter(function(t){ return !(t.cierre&&t.cierre.tipo==="no_ejecutada") });
  /* el toque del día del atorado sale como una tarea más, hasta arriba */
  var toques=[];
  vivas.forEach(function(t){ var q=tareaDeToque(t); if(q&&(PERSONAS[yo].jefe||t.duenio===yo)) toques.push(q) });
  vivas.sort(function(a,b){
    var o={vencida:0,silencio:1,detenida:2,hoy:3,espera:4,abierta:5,por_ejecutar:6,cerrada:9};
    var ea=estadoReal(a), eb=estadoReal(b);
    var va=(o[ea]==null?(o[a.estado]==null?5:o[a.estado]):o[ea]);
    var vb=(o[eb]==null?(o[b.estado]==null?5:o[b.estado]):o[eb]);
    return va-vb;
  });
  return toques.concat(vivas);
}
/* tareas MIAS con algo nuevo sin ver (un comentario, una foto, un mensaje).
   Alimentan el renglon verde de "Tienes mensajes sin leer" que va hasta arriba. */
/* SIGO EL HILO DE LO QUE YO MANDE. Antes, si Salvador le escribia un comentario
   a una tarea de Karina y ella contestaba, esa respuesta no le llegaba a ningun
   lado: la tarea no es suya, no lo detiene y no escalo. Se quedaba esperando una
   contestacion que ya estaba escrita. Ahora la tarea que YO abri para otro entra
   al renglon verde de "mensajes sin leer" — solo ahi, no en la lista, para que
   el home siga limpio. Se apaga sola al abrirla. 2026-09-04. */
function sigoElHilo(t){ return !!(t.creada_por && t.creada_por===yo && t.duenio!==yo) }
function misMensajes(){
  try{ despiertaTodas(); }catch(e){}
  return tareas.filter(function(t){
    return !esDormida(t) && (leToca(t)||sigoElHilo(t)) && !t.es_recordatorio && !t.pendiente_info && !esPropuesta(t) &&
           estadoReal(t)!=="cerrada" && nuevosNov(t)>0;
  });
}
/* los avisos de Salvador: sin semaforo, sin comprobante; solo la fecha en que avisan */
function misRecordatorios(){
  return tareas.filter(function(t){
      return t.es_recordatorio && t.duenio===yo && !t.pendiente_info && estadoReal(t)!=="cerrada" && !(t.cierre); })
    .sort(function(a,b){ return (a.f_vigente||"").localeCompare(b.f_vigente||""); });
}
/* EL BADGE SOLO DICE "HAY ALGO SIN VER". No es adorno permanente ni repite el
   estado — eso ya lo dice el punto de color. Se apaga al abrir la tarea, como
   WhatsApp. Los recordatorios de ritmo NO pintan badge.
   Aprobado por Salvador el 2026-09-02. Uno maximo por renglon. */
function badge(t){
  if(estadoReal(t)==="cerrada") return null;
  var n=nuevosNov(t);
  if(n<=0) return null;
  if(n===1) return {ico:ico("clip",19,1.6)};
  return {n:n};
}
function dotc(t){
  if(t.esToque) return "d-venc";
  if(t.detenido) return "d-esper";
  if(estadoReal(t)==="vencida") return "d-venc";
  if(t.estado==="cerrada")return"d-ok";
  if(t.estado==="espera_dia")return"d-ok";
  if(t.estado==="silencio")return"d-sil";
  if(t.estado==="espera")return"d-esper";
  if(t.duenio!==yo)return"d-super";
  return"d-hacer";
}
/* OJO 2026-09-23: NUNCA un campo con valor undefined — Firestore rechaza el
   documento COMPLETO ("Unsupported field value: undefined") y la tarea no se
   guarda. Desde el 2026-09-22 18:50 cada mensaje del sistema llevaba de:undefined
   y por eso los recordatorios y tareas nuevas no se guardaban y la pantalla se
   quedaba en "Leyendo lo que dijiste…". */
function msg(t,k,txt){ t.msgs=t.msgs||[]; var o={k:k,t:txt,h:hhmm(),ts:Date.now()}; if(k==="bo" && yo) o.de=yo;
  /* build 241: la misma respuesta de la app no sale dos veces seguidas (21:52 salió duplicada) */
  if(k!=="bo"){ var u=t.msgs[t.msgs.length-1]; if(u && u.k===k && String(u.t)===String(txt) && Date.now()-(+u.ts||0)<120000) return; }
  t.msgs.push(o); }
/* ===== LO HABLADO LARGO NO SE HACE CHORIZO (Salvador 2026-09-17) =====
   Se guarda COMPLETO (transcript) pero se muestra un resumen mío de 2-3
   renglones; a un toque sale el texto exacto. Un dictado corto se muestra tal
   cual, sin colapsar. El resumen bueno lo hace Claude en segundo plano; mientras,
   se pone uno local para que se vea al instante. Nunca sustituye tus palabras. */
function esLargo(txt){ txt=String(txt||""); return txt.length>170 || (txt.match(/[.?!]/g)||[]).length>=3; }
function localResumen(txt){
  txt=String(txt||"").trim().replace(/\s+/g," ");
  var m=txt.match(/^[\s\S]*?[.?!](\s|$)/); var s=m?m[0].trim():txt;
  if(s.length>170) s=s.slice(0,167).replace(/\s+\S*$/,"")+"…";
  return s;
}
function resumeHablado(transcript, cb){
  if(typeof APP_TOKEN==="undefined" || String(APP_TOKEN).indexOf("__")===0){ cb(localResumen(transcript)); return; }
  var sys="Eres el que resume dictados de tareas de una empresa. Te doy lo que alguien dictó "+
    "y lo resumes en 2 o 3 renglones, español claro y directo: SOLO el qué hay que hacer y los "+
    "datos clave que haya dicho (quién, cuándo, dónde, cuánto). NO inventes nada que no esté "+
    "en el dictado. No escribas la palabra 'Resumen'. Contesta únicamente el resumen.";
  preguntaAClaude([{role:"user",content:sys+"\n\nDICTADO:\n"+transcript}], "rapido", function(txt,err){
    if(err||!txt||!String(txt).trim()){ cb(localResumen(transcript)); return; }
    cb(String(txt).trim());
  });
}
/* guarda un mensaje hablado: si es corto, normal; si es largo, resumen+transcript */
function guardaHablado(t, k, transcript){
  transcript=String(transcript||"").trim(); if(!transcript) return;
  if(!esLargo(transcript)){ msg(t,k,transcript); return; }
  var m={k:k, t:localResumen(transcript), tr:transcript, ts:Date.now(), h:hhmm(), hab:true};
  t.msgs=t.msgs||[]; t.msgs.push(m); guarda(t);
  resumeHablado(transcript, function(res){
    if(res && res.trim() && res.trim()!==m.t){ m.t=res.trim(); guarda(t);
      if(typeof abierta!=="undefined" && abierta===t.id) render(); }
  });
}
/* lee un texto en voz alta con la voz del teléfono (para oírlo manejando). No
   graba nada: usa el sintetizador del navegador. Segundo toque: se calla. */
function leeEnVoz(texto, boton){
  try{
    var S=window.speechSynthesis; if(!S){ toast("Este navegador no lee en voz alta"); return; }
    /* leyendo = rojo + ícono de PAUSA (para que se vea que puedes pausar);
       en reposo = verde + play. Salvador 2026-09-17. */
    var vuelvePlay=function(b){ if(b){ b.classList.remove("on"); b.innerHTML=svgPlay(); } };
    if(S.speaking || window.__leyendo){ S.cancel(); window.__leyendo=false; window.__leyU=null; clearTimeout(window.__leyWd);
      vuelvePlay(window.__leyBtn); return; }
    var u=new SpeechSynthesisUtterance(String(texto||"")); u.lang="es-MX"; u.rate=1;
    try{ var v=_leeVoz(); if(v){ u.voice=v; u.lang=v.lang||"es-MX"; } u.pitch=vozTono(); }catch(e){}
    /* vigía: si el motor de voz no avisa que terminó (se traba en iOS), el botón no se queda en pausa para siempre */
    clearTimeout(window.__leyWd);
    var termina=function(){ clearTimeout(window.__leyWd); if(window.__leyU!==u) return; window.__leyendo=false; window.__leyU=null; vuelvePlay(boton); };
    u.onend=termina; u.onerror=termina;
    window.__leyU=u; window.__leyWd=setTimeout(function(){ if(window.__leyU===u){ try{ S.cancel(); }catch(e){} termina(); } }, vigiaVoz(texto));
    window.__leyendo=true; window.__leyBtn=boton;
    if(boton){ boton.classList.add("on"); boton.innerHTML=svgPausa(); }
    S.cancel(); S.speak(u);
  }catch(e){ toast("No se pudo leer en voz alta"); }
}
/* pinta una burbuja hablada (resumen colapsado + ver más + transcript + fecha + play) */
function burbujaHablada(x, meta, mid){
  var ab=(window.__habAbre||{})[mid];
  var fecha=(x.ts?fechaCorta(new Date(x.ts))+" · ":"")+esc(x.h||"");
  return '<div class="b '+(x.k==="bo"?"bo":"bi")+' hab'+(ab?" on":"")+'" data-hab="'+esc(mid)+'">'+
    '<div class="hres"><span class="hlab">Resumen:</span> '+esc(x.t||"")+'</div>'+
    /* ver más y el play, juntos: puedes oír todo sin expandir primero */
    '<div class="hbar"><button class="hmas" data-hmas="'+esc(mid)+'">'+(ab?"ver menos":"ver más")+'</button>'+
      '<button class="hplay" data-hplay="'+esc(mid)+'" aria-label="Escuchar">'+svgPlay()+'</button>'+
      '</div>'+   /* build 242: sin autor ni fecha en el globo */
    '<div class="htr"><span class="hlab">Transcript:</span> '+esc(x.tr||"")+'</div>'+
  '</div>';
}
function fechaCorta(d){ d=d||new Date();
  return d.getDate()+" "+["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][d.getMonth()]; }
function svgPlay(){ return '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M7 5.2v13.6L18.5 12z"/></svg>'; }
function svgPausa(){ return '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6.5" y="5" width="3.6" height="14" rx="1.1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.1"/></svg>'; }
/* Quién mandó cada mensaje del hilo, para el renglón chico junto a la hora.
   Salvador 2026-09-04: cada burbuja lleva el nombre del que la mandó.
   bo = la contraparte (quien ejecuta); bi/bal = la voz del sistema (Claude).
   Si el mensaje trae 'de' explícito, ese manda. */
function autorMsg(x,t){
  if(x.de) return PERSONAS[x.de]?PERSONAS[x.de].nombre:x.de;
  if(x.k==="bo"){
    var q=(t.duenio&&t.duenio!==yo)?t.duenio:(t.para&&t.para!==yo?t.para:t.duenio);
    return (q&&PERSONAS[q])?PERSONAS[q].nombre:"";
  }
  return "Claude";
}

/* responder() se eliminó el 2026-09-02: los botones bajaron a dos y cada uno
   tiene su propio manejador (intentaCerrar y el flujo de atorado). */

/* ¿el texto dictado DENTRO de una tarea suena a que NO es comentario de ella,
   sino a una instruccion o tarea nueva? Heuristica local (sin tokens): verbos
   de crear/pedir, o mencionar a OTRA persona del equipo con un verbo de mandar.
   Solo dispara una PREGUNTA, nunca una accion a ciegas. */
/* build 136: suena a "mandale un WhatsApp a alguien de fuera" (no del equipo) */
function sonaraWhatsApp(v){
  var s=String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  s=s.replace(/\ba\s+(whats?\s?app|whats|wasap|guasap|was)\s+a\s+/g,"a ");
  var m=s.match(/(?:escribe(?:le|les|la)?|preguntale|mandale(?: un)?(?: whats(?:app)?| mensaje)?|whats(?:app)?)\s+al?\s+([a-z\u00f1]+)/);
  if(!m) return false;
  /* build 137: "escribele" o decir WhatsApp manda aunque sea del equipo */
  if(/\b(whats?\s?app|whats|wasap|guasap|escribele|escribeles)\b/.test(s)) return true;
  var nom=m[1];
  var esEquipo=Object.keys(PERSONAS).some(function(k){
    var n=String(PERSONAS[k].nombre||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    return n.indexOf(nom)===0; });
  return !esEquipo;
}
function sonaraNoComentario(v, t){
  var s=String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  /* Salvador 2026-09-22 (segunda vuelta): la pregunta "comentario o algo
     nuevo" salia casi siempre y estorbaba. Ahora SOLO sale con lo raro de
     verdad: pedir explicitamente una tarea nueva, o encargarle algo a OTRA
     persona del equipo (rama de abajo). Lo de recordatorio/hora ya no pasa por
     aqui: eso se arma directo en la tarea (sonaraRecordatorio). Todo lo demas
     entra como comentario, con bote de basura 5 min por si fue error. */
  if(/\b(abre|abreme|abrir|crea|creame|crear|levanta|nueva tarea|nuevo recordatorio|encargale|encarga a|encargarle)\b/.test(s)) return true;
  var otros=Object.keys(PERSONAS).filter(function(k){return k!==yo && k!==(t&&t.duenio)});
  for(var i=0;i<otros.length;i++){
    var nom=String((PERSONAS[otros[i]]||{}).nombre||"").toLowerCase().normalize("NFD")
            .replace(/[\u0300-\u036f]/g,"").split(" ")[0];
    if(nom && nom.length>2 && s.indexOf(nom)>=0 &&
       /\b(dile|digale|que |encargale|comentale|manda|mandale|avisa|avisale|recuerda|pidele|habla|llama)\b/.test(s)) return true;
  }
  return false;
}
/* ¿lo dictado DENTRO de una tarea es un recordatorio PARA esa tarea? Palabra
   de recordatorio (todos los sinonimos que usa Salvador) o una hora o un tiempo
   relativo ("en 20 minutos"). Regla suya 2026-09-22: "si le pongo una hora, se
   entiende que es un recordatorio especifico". */
function sonaraRecordatorio(v){
  var s=" "+String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")+" ";
  if(/\b(recuerdamelo|recuerdamela|avisamelo|avisamela|acuerdamelo|recuerdame|recuerdanos|recuerda|acuerdame|acuerdate|acuerda|recordatorio|recordame|alarma|alerta|avisame|avisa|aviso|notificame|notifica|dime|comentame)\b/.test(s)) return true;
  if(horaDicha(v)) return true;
  if(relativoDicho(v)) return true;
  return false;
}
/* el ASUNTO del recordatorio: lo dictado sin la palabra de recordatorio ni el
   tiempo. Si no queda nada ("recuerdame a las 6"), se usa el nombre de la tarea. */
function asuntoRecordatorio(v, t){
  var s=String(v||"").trim();
  s=s.replace(/\b(recu[e\u00e9]rdamel[oa]|av[i\u00ed]samel[oa]|acu[e\u00e9]rdamel[oa]|recu[e\u00e9]rdame|recu[e\u00e9]rdanos|recuerda|acu[e\u00e9]rdame|acu[e\u00e9]rdate|acuerda|recordatorio|record[a\u00e1]me|alarma|alerta|av[i\u00ed]same|avisa|aviso|notif[i\u00ed]came|notifica|dime|com[e\u00e9]ntame)\b/gi," ")
     .replace(/\b(por|en|a|de)\s+la\s+(ma[n\u00f1]ana|tarde|noche)\b/gi," ")
     /* la hora se va con su «am / pm / a.m. / p.m. / hrs»; si no, «a las 9 am confirmar» dejaba «Am confirmar» */
     .replace(/\ba\s+la(s)?\s+(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|\d{1,2})([:.]\d{2})?(\s*(a\.?\s?m\.?|p\.?\s?m\.?|hrs?\.?|horas?))?(?![\wáéíóúñ])/gi," ")
     .replace(/\b\d{1,2}([:.]\d{2})?\s*(a\.?\s?m\.?|p\.?\s?m\.?|horas?|hrs?\.?)(?![\wáéíóúñ])/gi," ")
     .replace(/\b(en|dentro de)\s+(\d{1,3}|un|una|uno|dos|tres|cuatro|cinco|diez|quince|veinte|treinta|media|un cuarto de)\s*(minutos?|min|horas?|hrs?|hora y media)?\b/gi," ")
     .replace(/\b(mediod[i\u00ed]a|medianoche|hoy|ma[n\u00f1]ana|pasado ma[n\u00f1]ana|lunes|martes|mi[e\u00e9]rcoles|jueves|viernes|s[a\u00e1]bado|domingo)\b/gi," ")
     .replace(/\s+/g," ").trim()
     .replace(/^(que|de|para|a|el|la|y|,|\.)\s+/i,"")
     /* el dictado a veces repite la hora en letra ("6:55 cinco"): fuera */
     .replace(/^(una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|y\s+(media|cuarto)|en\s+punto)\s+/i,"")
     .replace(/^[,.\s]+|[,.\s]+$/g,"").trim();
  if(s.length<3) return t.nombre||"Recordatorio";
  /* build 210 ("Este recuérdame el martes y el jueves" -> "Este el y el"): muletillas y conectores no son asunto */
  s=s.replace(/^(este|pues|eh+|mm+|bueno|o sea|oye|entonces|ok|okay)\b[,.\s]*/i,"").trim();
  for(var _k=0;_k<4;_k++) s=s.replace(/[,\s]+(el|la|los|las|y|e|de|del|a|al|en|para|que|o)$/i,"").trim();
  var _util=_nn(s).replace(/[^a-z0-9ñ ]+/g," ").split(/\s+/).filter(function(w){ return w.length>=3 && ["este","esta","pues","bueno","oye","entonces","okay","que","para","por","los","las","del","con","una","uno","eso","esto"].indexOf(w)<0; });
  if(!_util.length) return t.nombre||"Recordatorio";
  return s;
}
function nombreCortoTarea(t){
  var n=String((t&&t.nombre)||"").trim();
  return n.length>26 ? n.slice(0,25)+"\u2026" : n;
}
function cierraDudaHilo(){ var e=document.getElementById("dudah"); if(e&&e.parentNode) e.parentNode.removeChild(e); }
/* hoja de confirmacion estilo iOS. o = {titulo, sub, accion, rojo, cb}. Tocar
   fuera o "Cancelar" cierra sin hacer nada. */
function hojaConfirma(o){
  cierraHoja();
  var v=document.createElement("div"); v.className="hoja-velo"; v.id="hojav";
  v.innerHTML='<div class="hoja"><div class="grp">'+
    ((o.titulo||o.sub)?'<div class="ttl">'+(o.titulo?'<b>'+esc(o.titulo)+'</b>':'')+(o.sub?esc(o.sub):'')+'</div>':'')+
    '<button class="'+(o.rojo?'rojo':'')+'" id="hojaok">'+esc(o.accion||"OK")+'</button></div>'+
    '<button class="cancel" id="hojano">Cancelar</button></div>';
  document.body.appendChild(v);
  v.onclick=function(e){ if(e.target===v) cierraHoja(); };
  $("hojano").onclick=cierraHoja;
  $("hojaok").onclick=function(){ cierraHoja(); if(o.cb) o.cb(); };
}
function cierraHoja(){ var e=$("hojav"); if(e&&e.parentNode) e.parentNode.removeChild(e); }

/* ===== build 155: ENLAZAR A OTRA TAREA =====
   Pasa TODO lo de la tarea origen (msgs: texto, audios transcritos, fotos, url,
   WhatsApp; evidencias; fotos de puntos) a la tarea destino, ordenado por ts, y
   aparta la origen: estado "fusionada" + fusionada_en=<id destino>. NADA SE
   BORRA (regla 8 de Salvador): la origen queda en la base y solo se excluye de
   toda vista (snapshot) y de las alarmas del servidor. */
function cierraEnlazar(){ var e=$("enlv"); if(e&&e.parentNode) e.parentNode.removeChild(e); }
function enlazaCandidatas(oid){
  return tareas.filter(function(x){
    return x.id!==oid && !x.cierre && !x.fusionada_en && x.estado!=="fusionada" && !x.es_recordatorio &&
           estadoReal(x)!=="cerrada" && !esEjemplo(x) && !esPropuesta(x) && (leToca(x)||sigoElHilo(x)) && String(x.nombre||"").trim();
  }).sort(function(a,b){ return (b.tocada||0)-(a.tocada||0); });
}
/* ===== build 259: UNA SOLA HOJA "Vincular · Nueva" (la de Vincular a otra tarea y la de ¿A dónde va?) =====
   Orden: [+ Crear tarea nueva] fijo · las PARECIDAS (de más a menos) · TODAS las demás abiertas en orden alfabético sin acentos.
   Buscador: nombre, nombre anterior, contexto y alias, sin acentos, en TODAS las abiertas; si no hay coincidencia en abiertas muestra
   también las cerradas (marcadas "cerrada", en gris); al vincular a una cerrada, se reabre. */
function esCerradaVinc(x){ var c=!!x.cierre; if(!c){ try{ c=estadoReal(x)==="cerrada"; }catch(e){} } return c; }
/* ===================== build 262: UN SOLO MOTOR DE PARECIDAS Y DE BÚSQUEDA (sugeridasPara) =====================
   Lo usan TODAS las hojas (Vincular, Mover mensajes / ¿A dónde va?, Acomodo, Nueva y Dato): mismo formato — buscador, "+ Crear tarea nueva",
   las parecidas (de más a menos, con la marca "parecida") y el resto en orden alfabético sin acentos.
   Parecidas por SIGNIFICADO: texto de los mensajes y nombre/contexto de origen contra nombre, nombre anterior, alias, contexto, pasos y
   contactos de cada tarea abierta; sin acentos, por raíces y con un diccionario de sinónimos del dominio; los contactos en común suman fuerte.
   Con confianza baja o empate, el cerebro ligero ("rapido") ordena por significado las 30 mejores (caché de 10 min por origen; 1 llamada por hoja).
   El buscador es del mismo motor: tolera errores de dedo, raíces y sinónimos; con 3+ letras y menos de 3 resultados suma una búsqueda por
   significado con el cerebro ligero (debounce de 600 ms). */
var SIN262=[
  "cobro cobros cobranza cobranzas cobrar cobrado pago pagos pagar pagado vale vales anuncio anuncios anunciar",
  "casa casas residencia hogar vivienda domicilio",
  "reparacion reparaciones reparar arreglo arreglos arreglar mantenimiento mantener compostura",
  "junta juntas reunion reuniones asamblea sesion",
  "cotizacion cotizaciones cotizar presupuesto presupuestos",
  "factura facturas facturar cfdi comprobante comprobantes recibo recibos",
  "carro carros auto autos automovil coche coches vehiculo camioneta",
  "fiesta fiestas evento eventos celebracion cumpleanos",
  "viaje viajes vuelo vuelos boleto boletos reservacion",
  "medico doctor doctora clinica hospital consulta",
  "terreno terrenos lote lotes predio",
  "dinero efectivo billete billetes pesos",
  "restaurante restaurantes restaurant comedor",
  "limpieza limpiar aseo",
  "contrato contratos convenio acuerdo",
  "proveedor proveedores vendedor",
  "empleado empleados trabajador trabajadores personal"
];
var STOP262=["hola","buen","buenas","buenos","dias","tardes","noches","gracias","favor","para","como","esta","este","esto","estos","estas","pero","porque","cuando","donde","quien","tiene","tengo","tienen","puedo","puede","hacer","haces","vamos","mismo","sigue","ahora","ahorita","luego","todo","toda","todos","todas","algo","unos","unas","entre","sobre","desde","hasta","ya","que","con","los","las","del","una","por","mas","muy","sin","nos","les","hay","fue","son","ser","era","sus","mis","tus","dos","tres","hoy","manana","salvador","mensaje","tarea","mandame","manda","dime","oye","ok","okey","si","no"];
var SINMAP262=null;
function stem(w){ w=String(w||""); if(w.length>3 && w.charAt(w.length-1)==="s") w=w.slice(0,-1); if(w.length>4 && /[aeo]$/.test(w)) w=w.slice(0,-1); return w.slice(0,6); }
function grupos262(){ if(SINMAP262) return SINMAP262; SINMAP262={}; SIN262.forEach(function(g, i){ g.split(" ").forEach(function(w){ SINMAP262[stem(_n179(w))]="g"+i; }); }); return SINMAP262; }
function concepto262(w){ var st=stem(w); return grupos262()[st]||st; }
function toks262(txt){ var out=[], seen={}; _n179(txt).split(" ").forEach(function(w){ if(w.length<3 || STOP262.indexOf(w)>=0 || /^\d+$/.test(w)) return; var c=concepto262(w); if(!seen[c]){ seen[c]=1; out.push({w:w, c:c, st:stem(w)}); } }); return out; }
function lev(a, b){ if(a===b) return 0; var m=a.length, n=b.length; if(Math.abs(m-n)>2) return 9; var p=[], i, j; for(j=0;j<=n;j++) p[j]=j; for(i=1;i<=m;i++){ var prev=p[0]; p[0]=i; for(j=1;j<=n;j++){ var tmp=p[j]; p[j]=Math.min(p[j]+1, p[j-1]+1, prev+(a.charAt(i-1)===b.charAt(j-1)?0:1)); prev=tmp; } } return p[n]; }
/* ¿la palabra q (de la búsqueda) coincide con alguna de la tarea? 3 = exacta, 2 = raíz o sinónimo, 1 = prefijo o error de dedo, 0 = no */
function coincide262(q, kt){
  var best=0; for(var i=0;i<kt.length;i++){ var k=kt[i];
    if(q.w===k.w) return 3; if(q.c===k.c){ best=Math.max(best,2); continue; }
    if(q.w.length>=3 && (k.w.indexOf(q.w)===0 || (q.w.length>=5 && q.w.indexOf(k.w)===0 && k.w.length>=4))){ best=Math.max(best,1); continue; }
    var L=Math.min(q.st.length,k.st.length); if(L>=5 && lev(q.st,k.st)<=(L>=8?2:1)) best=Math.max(best,1); }
  return best;
}
function camposTarea(d){
  var flat=function(v){ return [].concat(v||[]).map(function(z){ return (z&&typeof z==="object")?(z.nombre||z.tx||z.t||""):String(z); }).join(" "); };
  var ctx=""; try{ ctx=contextoDe(d)||""; }catch(e){}
  var pasos=flat((d.lista_pasos||[]).map(function(p){ return p&&p.tx; }))+" "+flat(((d.checklist&&d.checklist.items)||[]).map(function(i){ return i&&i.tx; }));
  var contactos=[]; (d.wa_contactos||[]).forEach(function(w){ contactos.push(String((w&&w.nombre)||w||"")); }); (d.msgs||[]).forEach(function(m){ if(m && m.wa_c) contactos.push(String(m.wa_c)); }); if(d.revisa_ext) contactos.push(String(d.revisa_ext)); if(d.seg_a && d.seg_a.contacto) contactos.push(String(d.seg_a.contacto));
  return {nom:toks262(d.nombre), ant:toks262(flat(d.nombre_anterior)+" "+flat(d.nombres_anteriores)), ali:toks262(flat(d.alias)+" "+flat(d.alias_tarea)+" "+flat(d.palabras)+" "+flat(d.sinonimos)+" "+(d.de_quien||"")),
    ctx:toks262(ctx||d.contexto||""), pas:toks262(pasos), con:contactos.map(function(c){ return _n179(nombreLimpio(c)).split(" ")[0]; }).filter(function(c){ return c.length>=3; })};
}
function cacheCampos(d){ var k=(d.nombre||"")+"|"+(d.contexto||"")+"|"+((d.msgs||[]).length)+"|"+((d.lista_pasos||[]).length); if(!d.__c262 || d.__c262k!==k){ try{ Object.defineProperty(d,"__c262",{value:camposTarea(d),writable:true,configurable:true,enumerable:false}); Object.defineProperty(d,"__c262k",{value:k,writable:true,configurable:true,enumerable:false}); }catch(e){ return camposTarea(d); } } return d.__c262; }
/* texto del ORIGEN: los mensajes elegidos (o los de la tarea) + su nombre y contexto */
function origen262(t, ixs){
  var ms=(ixs&&ixs.length)?ixs.map(function(i){ return (t.msgs||[])[i]; }):(t.msgs||[]).slice(-15);
  ms=ms.filter(function(m){ return m && !m.oculto && !m.nota_ia && !m.res238 && !m.dict238 && String(m.t||"").trim() && !(typeof esNotaIA==="function" && esNotaIA(m)); });
  var txt=ms.map(function(m){ return String(m.tr||m.t||"").replace(/^\s*[^:\n]{1,40}:\s*/,""); }).join(" ")+" "+(t.nombre||"")+" "+(function(){ try{ return contextoDe(t)||t.contexto||""; }catch(e){ return t.contexto||""; } })();
  var cont=[]; ms.forEach(function(m){ if(m.wa_c) cont.push(_n179(nombreLimpio(m.wa_c)).split(" ")[0]); }); (t.wa_contactos||[]).forEach(function(w){ cont.push(_n179(nombreLimpio((w&&w.nombre)||w||"")).split(" ")[0]); });
  var alts={}; ms.forEach(function(m){ if(m.duda_tarea && m.duda_tarea.alternativa_id) alts[m.duda_tarea.alternativa_id]=1; });   /* la duda del acomodo (la alternativa) suma como una pista más */
  return {alts:alts, txt:txt, toks:toks262(txt), contactos:cont.filter(function(c){ return c.length>=3; }), key:t.id+"|"+(ixs&&ixs.length?ixs.join(","):"t")+"|"+txt.length};
}
function candidatas262(excl){ return enlazaCandidatas(excl); }
function sugeridasPara(t, ixs){
  var O=origen262(t, ixs), C=candidatas262(t.id), N=C.length||1, df={};
  var F=C.map(function(d){ return cacheCampos(d); });
  F.forEach(function(f){ var vis={}; [f.nom,f.ant,f.ali,f.ctx,f.pas].forEach(function(arr){ arr.forEach(function(k){ if(!vis[k.c]){ vis[k.c]=1; df[k.c]=(df[k.c]||0)+1; } }); }); });
  var R=C.map(function(d, i){ var f=F[i], sc=0, why=[];
    O.toks.forEach(function(q){ var w=0; var peso=[[f.nom,3],[f.ant,2],[f.ali,2],[f.ctx,1],[f.pas,1]];
      peso.forEach(function(pr){ var m=0; pr[0].forEach(function(k){ if(k.c===q.c || (q.st.length>=6 && k.st.length>=6 && lev(q.st,k.st)<=1)) m=1; }); if(m) w=Math.max(w,pr[1]); });
      if(w){ var idf=Math.log(1+N/(1+(df[q.c]||0))); sc+=w*Math.max(idf,0.35); why.push(q.w); } });
    if(O.alts[d.id]) sc+=6;
    var comunes=0; O.contactos.forEach(function(c){ if(f.con.indexOf(c)>=0) comunes++; }); if(comunes) sc+=Math.min(comunes,2)*3;
    return {d:d, sc:sc, why:why}; });
  R.sort(function(a,b){ return (b.sc-a.sc) || (_n179(a.d.nombre)<_n179(b.d.nombre)?-1:1); });
  /* build 264: las cerradas también salen entre las parecidas (después de las abiertas igual de fuertes, con su etiqueta); no entran al resto alfabético */
  var RC=[]; try{ (tareas||[]).forEach(function(d){
    if(!d || d.id===t.id || d.fusionada_en || d.estado==="fusionada" || d.es_recordatorio || !String(d.nombre||"").trim() || !esCerradaVinc(d)) return;
    try{ if(esEjemplo(d) || esPropuesta(d)) return; }catch(e){}
    var f=cacheCampos(d), sc=0, why=[];
    O.toks.forEach(function(q){ var w=0; [[f.nom,3],[f.ant,2],[f.ali,2],[f.ctx,1],[f.pas,1]].forEach(function(pr){ var m=0; pr[0].forEach(function(k){ if(k.c===q.c || (q.st.length>=6 && k.st.length>=6 && lev(q.st,k.st)<=1)) m=1; }); if(m) w=Math.max(w,pr[1]); });
      if(w){ var idf=Math.log(1+N/(1+(df[q.c]||0))); sc+=w*Math.max(idf,0.35); why.push(q.w); } });
    if(O.alts[d.id]) sc+=6;
    var comunes=0; O.contactos.forEach(function(c){ if(f.con.indexOf(c)>=0) comunes++; }); if(comunes) sc+=Math.min(comunes,2)*3;
    if(sc>=2.5) RC.push({d:d, sc:sc, why:why}); }); }catch(e){}
  var UMBRAL=2.5, sims=R.filter(function(r){ return r.sc>=UMBRAL; }).concat(RC);
  sims.sort(function(a,b){ var r=function(v){ return Math.round(v*10)/10; }; return (r(b.sc)-r(a.sc)) || ((etq264(a.d)?1:0)-(etq264(b.d)?1:0)) || (b.sc-a.sc); });
  sims=sims.slice(0,6);
  var simIds={}; sims.forEach(function(r){ simIds[r.d.id]=1; });
  var rest=R.filter(function(r){ return !simIds[r.d.id]; }).map(function(r){ return r.d; }).sort(function(a,b){ return _n179(a.nombre)<_n179(b.nombre)?-1:(_n179(a.nombre)>_n179(b.nombre)?1:0); });
  var top=sims[0]?sims[0].sc:0, segundo=sims[1]?sims[1].sc:0;
  var dudosa=!sims.length || top<6 || (segundo>=0.75*top && top<14);
  return {sims:sims.map(function(r){ return r.d; }), scores:sims.map(function(r){ return r.sc; }), rest:rest, todas:R, dudosa:dudosa, key:O.key, texto:O.txt};
}
/* el cerebro ligero ordena por significado las 30 mejores candidatas; caché de 10 min por origen y 1 llamada por hoja abierta */
function refinaSug(S, cb){
  window.__sug262=window.__sug262||{}; var c=window.__sug262[S.key];
  if(c && Date.now()-c.ts<10*60000){ cb(c.ids); return; }
  if(typeof preguntaAClaude!=="function" || !S.dudosa || !S.todas.length) return;
  var L=S.todas.slice(0,30).map(function(r){ var cx=""; try{ cx=contextoDe(r.d)||""; }catch(e){} return r.d.id+" | "+(r.d.nombre||"")+" | "+String(cx||r.d.contexto||"").replace(/\s+/g," ").slice(0,140); }).join("\n");
  var prompt="Salvador va a pasar esto a otra tarea:\n“"+String(S.texto||"").replace(/\s+/g," ").slice(0,700)+"”\n\nTAREAS CANDIDATAS (id | nombre | contexto):\n"+L+"\n\nOrdénalas por SIGNIFICADO, de la que más trata de lo mismo a la que menos, y devuelve SOLO las que de verdad tratan del mismo asunto (máx 5; puede ser ninguna). Contesta SOLO JSON: {\"ids\":[\"id\",…]}";
  try{ preguntaAClaude([{role:"user",content:prompt}],"rapido",function(txt,err){ if(err) return; var ids=null; try{ var j=JSON.parse(String(txt||"").replace(/^[^{]*/,"").replace(/[^}]*$/,"")); ids=Array.isArray(j.ids)?j.ids.map(String):null; }catch(e){} if(!ids) return;
    var vál={}; S.todas.forEach(function(r){ vál[r.d.id]=1; }); ids=ids.filter(function(id){ return vál[id]; }).slice(0,5); window.__sug262[S.key]={ts:Date.now(), ids:ids}; cb(ids); }); }catch(e){}
}
/* aplica el orden del cerebro: los que dijo van primero y con la marca; los fuertes del motor se quedan; el resto alfabético */
function aplicaRefino(S, ids){
  var by={}; S.todas.forEach(function(r){ by[r.d.id]=r; });
  var sims=ids.map(function(id){ return by[id].d; }); S.sims.forEach(function(d, i){ if(sims.indexOf(d)<0 && ((S.scores[i]||0)>=14 || etq264(d))) sims.push(d); });
  sims=sims.slice(0,6); var m={}; sims.forEach(function(d){ m[d.id]=1; });
  var rest=S.todas.map(function(r){ return r.d; }).filter(function(d){ return !m[d.id]; }).sort(function(a,b){ return _n179(a.nombre)<_n179(b.nombre)?-1:(_n179(a.nombre)>_n179(b.nombre)?1:0); });
  return {sims:sims, rest:rest};
}
/* BUSCADOR: tolerante a errores de dedo, raíces y sinónimos; abiertas primero y, si no hay, cerradas */
function buscaVinc262(q, excl){
  var qs=toks262(q); if(!qs.length) return {lista:[], cerradas:false};
  /* build 264: las cerradas y dormidas SIEMPRE entran (después de las abiertas con la misma fuerza, en gris y con su estado); una fusionada manda a la tarea donde quedó */
  var L=[], red=[];
  var puntua=function(x){ var f=cacheCampos(x), sc=0, ok=true;
    qs.forEach(function(w){ if(!ok) return; var best=0; [[f.nom,3],[f.ant,2.5],[f.ali,2],[f.ctx,1],[f.pas,1]].forEach(function(pr){ var m=coincide262(w, pr[0]); if(m) best=Math.max(best, pr[1]*(m===3?1.3:(m===2?1:0.7))); }); if(!best) ok=false; else sc+=best; });
    return ok?sc:0; };
  (tareas||[]).forEach(function(x){
    if(!x || x.id===excl || x.estado==="descartada" || x.es_recordatorio || !String(x.nombre||"").trim()) return;
    if(x.fusionada_en || x.estado==="fusionada"){ red.push(x); return; }
    try{ if(esEjemplo(x) || esPropuesta(x)) return; }catch(e){}
    var cer=esCerradaVinc(x); if(!cer){ try{ if(!(leToca(x)||sigoElHilo(x))) return; }catch(e){} }
    var sc=puntua(x); if(!sc) return;
    L.push({d:x, sc:sc, cerrada:cer, etq:etq264(x)}); });
  var by={}; L.forEach(function(o){ by[o.d.id]=o; });
  red.forEach(function(x){ var sc=puntua(x); if(!sc) return;
    var d=x, n=0; while(d && d.fusionada_en && n++<6){ var id=(d.fusionada_en&&d.fusionada_en.id)||d.fusionada_en; d=tareas.filter(function(z){ return z.id===id; })[0]; }
    if(!d || d.fusionada_en || d.id===excl || d.es_recordatorio) return;
    try{ if(esEjemplo(d) || esPropuesta(d)) return; }catch(e){}
    var cer=esCerradaVinc(d); if(!cer){ try{ if(!(leToca(d)||sigoElHilo(d))) return; }catch(e){} }
    if(by[d.id]){ if(sc*0.9>by[d.id].sc) by[d.id].sc=sc*0.9; return; }
    var o={d:d, sc:sc*0.9, cerrada:cer, etq:etq264(d), via:x.nombre}; by[d.id]=o; L.push(o); });
  var r1=function(v){ return Math.round(v*10)/10; };
  L.sort(function(a,b){ return (r1(b.sc)-r1(a.sc)) || ((a.etq?1:0)-(b.etq?1:0)) || _n179(a.d.nombre).localeCompare(_n179(b.d.nombre)); });
  return {lista:L, cerradas:L.length>0 && L.every(function(o){ return !!o.etq; })};
}
/* búsqueda por significado con el cerebro ligero (si hay menos de 3 resultados con 3+ letras); caché por texto */
function semBusca(q, excl, cb){
  window.__sem262=window.__sem262||{}; var k=_n179(q), c=window.__sem262[k]; if(c && Date.now()-c.ts<10*60000){ cb(c.ids); return; }
  if(typeof preguntaAClaude!=="function") return;
  var C=candidatas262(excl).slice(0,80); if(!C.length) return;
  var L=C.map(function(d){ var cx=""; try{ cx=contextoDe(d)||""; }catch(e){} return d.id+" | "+(d.nombre||"")+" | "+String(cx||d.contexto||"").replace(/\s+/g," ").slice(0,100); }).join("\n");
  var prompt="Salvador busca una tarea con estas palabras: “"+String(q||"").slice(0,120)+"”.\n\nTAREAS ABIERTAS (id | nombre | contexto):\n"+L+"\n\nDevuelve SOLO las que tratan de lo que busca, entendiendo el significado (sinónimos, otras palabras para lo mismo), de la más a la menos parecida, máx 5; puede ser ninguna. Contesta SOLO JSON: {\"ids\":[\"id\",…]}";
  try{ preguntaAClaude([{role:"user",content:prompt}],"rapido",function(txt,err){ if(err) return; var ids=null; try{ var j=JSON.parse(String(txt||"").replace(/^[^{]*/,"").replace(/[^}]*$/,"")); ids=Array.isArray(j.ids)?j.ids.map(String):null; }catch(e){} if(!ids) return;
    var ok={}; C.forEach(function(d){ ok[d.id]=1; }); ids=ids.filter(function(id){ return ok[id]; }).slice(0,5); window.__sem262[k]={ts:Date.now(), ids:ids}; cb(ids); }); }catch(e){}
}
function buscaVinc259(q, excl){ return buscaVinc262(q, excl); }   /* build 262: un solo motor */
function abreEnlazar(oid, op){
  op=op||{};   /* build 229: desde "Vincular" de una tarea nueva: parecidas primero y "Tarea nueva" */
  var o=tareas.filter(function(x){return x.id===oid})[0]; if(!o) return;
  cierraEnlazar();
  var S=sugeridasPara(o, null), RF=null, EXTRA=[];   /* build 262: un solo motor; op.similares ya no manda */
  var v=document.createElement("div"); v.className="hoja-velo"; v.id="enlv";
  v.innerHTML='<div class="enlh"><div class="enlg">'+
    '<div class="enlt"><b>Vincular · Nueva</b>Elige a cuál pasar todo lo de “'+esc(corta40(o.nombre))+'”, o crea una tarea nueva</div>'+
    '<div class="enlb">'+ico("lupa",18,1.8)+'<input id="enlq" type="text" placeholder="Buscar tarea" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search"></div>'+
    '<button class="enlr enlnueva" data-nueva="1" id="enlcrea"><span class="enln">'+ico("plus",16)+' '+esc(op.etiquetaNueva||'Crear tarea nueva')+'</span><span class="vinc">'+esc(op.subNueva||'Nombre nuevo')+'</span></button>'+
    '<div class="enll" id="enll"></div></div>'+
    '<button class="enlc" id="enlno">Cancelar</button></div>';
  document.body.appendChild(v);
  v.onclick=function(e){ if(e.target===v) cierraEnlazar(); };
  $("enlno").onclick=cierraEnlazar;
  var lista=$("enll"), q=$("enlq");
  var fila=function(x, sim, cer){ var et=(typeof cer==="string"&&cer)?cer:etq264(x); if(!et && cer) et="cerrada"; cer=!!et; return '<button class="enlr'+(cer?' enlcer':'')+'" data-d="'+esc(x.id)+'"><span class="enln">'+esc(x.nombre)+(sim?'<small class="enlsim">parecida</small>':'')+(cer?'<small class="enlcerr">'+esc(et)+'</small>':'')+'</span><span class="vinc">'+(cer?(et==='dormida'?'Despertar y vincular':'Reabrir y vincular'):'Vincular')+'</span></button>'; };
  function pinta(){
    var txt=_n179(q.value);
    if(!txt){ var O=RF||S;
      lista.innerHTML=(O.sims.length||O.rest.length)?O.sims.map(function(x){ return fila(x,true,false); }).join("")+O.rest.slice(0,300).map(function(x){ return fila(x,false,false); }).join(""):'<div class="enlv">No hay otras tareas abiertas.</div>'; return; }
    var R=buscaVinc262(q.value, oid), L=R.lista.slice(0,60), vis={}; L.forEach(function(o2){ vis[o2.d.id]=1; });
    var ex=EXTRA.filter(function(d){ return !vis[d.id]; });
    lista.innerHTML=(L.length||ex.length)?L.map(function(o2){ return fila(o2.d, false, o2.etq||o2.cerrada); }).join("")+ex.map(function(d){ return fila(d, true, false); }).join("")+(R.lista.length>L.length?'<div class="enlv">Escribe más para acotar · '+R.lista.length+' tareas</div>':''):'<div class="enlv">No encontré nada con eso.</div>';
    if(R.lista.length<3 && txt.length>=3) semDeb(q.value, oid, function(ids){ if(q.value!==ids.q || !document.getElementById("enlv")) return; EXTRA=ids.d; pinta(true); }, sem);
  }
  var sem={t:null};
  v.querySelector("#enlcrea").onclick=function(){
    if(op.tareaNueva){ cierraEnlazar(); op.tareaNueva(); return; }   /* build 229: la propia tarea ya es la nueva */
    cierraEnlazar();
    pideNombreNueva(o, [], function(nombre){ var n=creaTarea({nombre:nombre, duenio:o.duenio, pendiente_info:"", falta_fecha:true}); if(!n) return; n.tipo_elegido=true; n.tipo_item=o.tipo_item||"tarea"; n.creada_desde={tarea_id:o.id, ts:Date.now(), tipo:"vincular_nueva"}; guarda(n); enlazaTareas(oid, n.id, "nueva"); vaATareaNueva(n); });
  };
  lista.onclick=function(e){
    var b=e.target; while(b&&b!==lista&&!(b.getAttribute&&b.getAttribute("data-d"))) b=b.parentNode;
    if(!b||b===lista) return;
    var did=b.getAttribute("data-d"), d=tareas.filter(function(x){return x.id===did})[0]; if(!d) return;
    var dor=esDormida(d), cer=esCerradaVinc(d);
    if(dor){ hojaConfirma({titulo:"Despertar y pasar todo a “"+corta40(d.nombre)+"”",
      sub:"Lo de “"+corta40(o.nombre)+"” se junta allá y esta tarea sale de tu lista. “"+corta40(d.nombre)+"” está dormida: despierta.",
      accion:"Despertar y pasar todo a "+corta40(d.nombre), cb:function(){ despierta264(d, "vinculada desde “"+corta40(o.nombre)+"”"); enlazaTareas(oid,did); }}); return; }
    hojaConfirma({titulo:(cer?"Reabrir y pasar todo a “":"Pasar todo a “")+corta40(d.nombre)+"”",
      sub:"Lo de “"+corta40(o.nombre)+"” se junta allá y esta tarea sale de tu lista."+(cer?" “"+corta40(d.nombre)+"” está cerrada: se reabre.":""),
      accion:(cer?"Reabrir y pasar todo a ":"Pasar todo a ")+corta40(d.nombre), cb:function(){ if(cer) reabre(d, "vinculada desde “"+corta40(o.nombre)+"”"); enlazaTareas(oid,did); }});
  };
  if(op.q) q.value=op.q;   /* build 236: "vincúlala a X" por voz */
  q.oninput=function(){ EXTRA=[]; pinta(); }; pinta();
  refinaSug(S, function(ids){ if(!document.getElementById("enlv")) return; RF=aplicaRefino(S, ids); if(!_n179(q.value)) pinta(); });
  setTimeout(function(){ try{ q.focus() }catch(e){} }, 60);
}
/* build 262: búsqueda semántica con debounce de 600 ms; devuelve {q, d:[tareas]} */
function semDeb(qv, excl, cb, st){
  clearTimeout(st.t); st.t=setTimeout(function(){ if(!document.getElementById("enlv") && !document.getElementById("mov225")) return; semBusca(qv, excl, function(ids){ var d=ids.map(function(id){ return tareas.filter(function(x){ return x.id===id; })[0]; }).filter(Boolean); if(d.length){ var r={q:qv, d:d}; cb(r); } }); }, 600);
}
function corta40(s){ s=String(s||"").trim(); return s.length>40 ? s.slice(0,39)+"\u2026" : s; }
function enlazaTareas(oid,did,propuso){
  propuso=propuso||"a mano";   /* build 192: censo de vinculaciones */
  var o=tareas.filter(function(x){return x.id===oid})[0], d=tareas.filter(function(x){return x.id===did})[0];
  cierraEnlazar();
  if(!o||!d||o===d){ toast("No se pudo vincular"); render(); return; }
  if(o.cierre||d.cierre||o.fusionada_en||d.fusionada_en){ toast("Una de las dos ya est\u00e1 cerrada"); render(); return; }
  if(esEjemplo(o)||esEjemplo(d)){ toast("Es una tarea de ejemplo: no se vincula"); render(); return; }
  var cp=function(x){ return JSON.parse(JSON.stringify(x)); };
  /* 1) se arma todo sobre COPIAS y se revisa el tama\u00f1o (1 MB por documento en Firestore) */
  var msgsO=cp(o.msgs||[]), msgsD=cp(d.msgs||[]);
  var todos=msgsD.concat(msgsO).map(function(m,i){ return {m:m,i:i}; });
  todos.sort(function(a,b){ return ((a.m&&a.m.ts)||0)-((b.m&&b.m.ts)||0) || a.i-b.i; });
  var msgsN=todos.map(function(z){ return z.m; });
  /* si algun mensaje no trae ts, se conserva su lugar relativo dentro de su tarea:
     el sort con ts=0 los manda al inicio, que es donde estarian los mas viejos */
  var evN=cp(d.evidencias||[]).concat(cp(o.evidencias||[]));
  var ftO=o.fotos||{};
  Object.keys(ftO).forEach(function(k){
    var f=ftO[k]; if(!f||!f.data) return;
    var p=(o.puntos&&o.puntos[k])?o.puntos[k].t:"punto "+k;
    evN.push({data:f.data,lat:f.lat,lon:f.lon,ts:f.ts,de:p+" (de \u201c"+corta40(o.nombre)+"\u201d)"});
  });
  evN.sort(function(a,b){ return ((a&&a.ts)||0)-((b&&b.ts)||0); });
  var wa=cp(d.wa_contactos||[]);
  (o.wa_contactos||[]).forEach(function(c){
    var n=String((c&&c.nombre)||c).toLowerCase();
    if(!wa.some(function(w){ return String((w&&w.nombre)||w).toLowerCase()===n })) wa.push(cp(c));
  });
  var nMsg=msgsO.length, nArch=(o.evidencias||[]).length+Object.keys(ftO).length;
  var ultO=0, ultD=0;
  msgsO.forEach(function(m){ if(m&&m.ts>ultO) ultO=m.ts }); msgsD.forEach(function(m){ if(m&&m.ts>ultD) ultD=m.ts });
  var tam=JSON.stringify(msgsN).length+JSON.stringify(evN).length+JSON.stringify(d).length-JSON.stringify(d.msgs||[]).length-JSON.stringify(d.evidencias||[]).length;
  if(tam>900000){ toast("Juntas pesar\u00edan demasiado (fotos). No se vincul\u00f3 nada."); render(); return; }
  /* 2) se aplica a la destino */
  d.msgs=msgsN;
  if(esDormida(d)) despierta264(d, "vinculada desde “"+corta40(o.nombre)+"”");
  if(evN.length) d.evidencias=evN;
  if(wa.length) d.wa_contactos=wa;
  if(nMsg && ultO>=ultD && o.ultima) d.ultima=o.ultima;
  d.enlazadas=(d.enlazadas||[]).concat([{id:o.id,nombre:o.nombre||"",ts:Date.now(),msgs:nMsg,archivos:nArch,propuso:propuso,por:yo||"",texto:textoQueLaCreo(o).slice(0,300)}]);
  msg(d,"bi","Se pas\u00f3 aqu\u00ed todo lo de \u201c"+(o.nombre||"otra tarea")+"\u201d ("+nMsg+" mensaje"+(nMsg===1?"":"s")+(nArch?" y "+nArch+" archivo"+(nArch===1?"":"s"):"")+").");
  /* 3) la origen se aparta (no se borra) */
  o.estado="fusionada"; o.fusionada_en=d.id; o.fusionada_ts=Date.now();
  o.censo_vinc={a:d.id, a_nombre:d.nombre||"", ts:Date.now(), por:yo||"", propuso:propuso, origen:origenTarea(o)};
  try{ sincronizaAvisos(o); }catch(e){}
  guarda(d); guarda(o);
  /* fuera de la memoria local de inmediato (el snapshot tambien la excluye) */
  var i=tareas.indexOf(o); if(i>=0) tareas.splice(i,1);
  window.recienCreadas=(window.recienCreadas||[]).filter(function(r){ return r.id!==o.id && r.taskId!==o.id; });
  toast("Pasado a \u201c"+corta40(d.nombre)+"\u201d");
  abierta=d.id; vista="hilo"; fichaOpen=false; detOpen={}; menuOpen=false; editaNombre=null; render();
}
/* borrar un recordatorio suelto y SEGUIR: sin toast, brinca al que sigue en el
   orden del swipe; si era el ultimo, al anterior; si no queda ninguno, al home.
   Salvador 2026-09-22: "una vez que confirmas, ya no requieres que te digan que
   fue borrada; mandanos al recordatorio siguiente". */
/* SELLO Y QUEDATE (Salvador 2026-09-24): la app cambia el estado, el usuario
   cambia de pantalla. o = {tipo:"alarma"|"hecha"|"eliminada", texto, restaurar}. */
function selloYQuedate(t, o){
  /* Salvador 2026-09-24/25: palomita ~1 s con el chat oculto y la campana
     gris; luego vuelve el chat. Cintillo delgado de Deshacer 3 s (build 135). */
  window.__avSheet=null; window.__avSonando=null; menuOpen=false;
  window.__ultimoDeshacer={id:t.id, tipo:o.tipo, de:o.texto||"", restaurar:o.restaurar, cuando:Date.now()};
  window.__salto={id:t.id, sig:t.id, tipo:o.tipo, de:o.texto||"", hasta:Date.now()+1100};
  try{ if(navigator.vibrate) navigator.vibrate(12); }catch(e){}
  var st=document.createElement("div"); st.className="salto-stamp";
  st.innerHTML='<span><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span>';
  document.body.appendChild(st);
  abierta=t.id; vista="hilo"; render();
  setTimeout(function(){ if(st.parentNode) st.parentNode.removeChild(st); }, 900);
  setTimeout(function(){ if(window.__salto && window.__salto.id===t.id){ window.__salto=null; if(vista==="hilo") render(); } }, 1100);
  muestraDeshacer(o.tipo);
}
/* build 175 (Salvador 2026-10-02 18:33): Autorizar, Ya esta y Eliminar son "ya
   terminé con esta": la pantalla se oscurece, palomita verde (o bote rojo) al centro,
   se difumina y aparece la SIGUIENTE de "Por revisar" (si no hay, el inicio).
   Sigue el cintillo de Deshacer. */
function siguienteDe(t){
  /* build 263: la que sigue es la del MISMO orden del home (window.ordenSwipe: Te toca → vencidas → hoy → …), sin las propuestas de Acomodo */
  try{ var ord=window.ordenSwipe||[], i=ord.indexOf(t.id);
    if(i>=0){ for(var j=i+1;j<ord.length;j++){ var s=(tareas||[]).filter(function(x){ return x && x.id===ord[j]; })[0];
        if(s && s.id!==t.id && !s.cierre && !s.fusionada_en && estadoReal(s)!=="cerrada" && !esPropuesta(s)) return s; }
      return null; } }catch(e){}
  try{ var l=porRevisar().filter(function(x){ return x.t.id!==t.id; }); if(l.length) return l[0].t; }catch(e){}
  return null;
}
function selloYSigue(t, o){
  try{ if(o && o.tipo==='hecha' && t) window.__sale272={id:t.id, ts:Date.now()}; }catch(e){}   /* build 272: en el home, la siguiente sube a su lugar */
  window.__avSheet=null; window.__avSonando=null; menuOpen=false;
  window.__ultimoDeshacer={id:t.id, tipo:o.tipo, de:o.texto||"", restaurar:o.restaurar, cuando:Date.now()};
  try{ if(navigator.vibrate) navigator.vibrate(15); }catch(e){}
  var del=(o.tipo==="eliminada");
  var ov=document.createElement("div"); ov.className="sigue-ov "+(del?"del":"ok");
  ov.innerHTML='<span>'+(del
    ? '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4.8h6V7"/><path d="M6.5 7l1 12.2h9l1-12.2"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>'
    : '<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>')+'</span>';
  document.body.appendChild(ov);
  setTimeout(function(){
    var s=siguienteDe(t);
    if(s){ abierta=s.id; vista="hilo"; }
    else { abierta=null; vista="lista"; }
    render();
    window.__dejarViva264=o.dejarViva||null;
    if(!o.sinDeshacer) muestraDeshacer(o.tipo, o.tipo==="autorizada"?"Autorizada":(o.textoPill||null));   /* build 195: completar lo nuevo no deja ventana */
  }, 620);
  setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 1100);
}
/* CINTILLO DE DESHACER — Salvador 2026-09-25: regresa, delgadito, justo arriba
   de la barra donde se pico la accion, unos 3 segundos. Vive en <body>, asi
   sobrevive a los render(). El deshacer por chat ("regresalo") sigue igual. */
function muestraDeshacer(tipo, txtLibre, ms){
  var viejo=document.getElementById("undopill"); if(viejo) viejo.parentNode.removeChild(viejo);
  if(window.__undoT){ clearTimeout(window.__undoT); window.__undoT=null; }
  var txt=txtLibre||(tipo==="alarma"?"Alarma quitada":tipo==="hecha"?"Marcada como hecha":"Eliminado");
  var el=document.createElement("div"); el.id="undopill"; el.className="undopill"; el.setAttribute("role","status");
  var _dv=(tipo==="hecha" && window.__dejarViva264)?window.__dejarViva264:null; window.__dejarViva264=null;
  el.innerHTML='<span class="tx">'+esc(txt)+'</span>'+(_dv?'<button type="button" id="bviva264">Dejar viva (expediente)</button>':'')+'<button type="button" id="bundo">Deshacer</button>';
  var comp=document.querySelector(".comp"), abajo=comp?Math.max(12, window.innerHeight-comp.getBoundingClientRect().top+10):96;
  el.style.bottom=abajo+"px";
  document.body.appendChild(el);
  el.querySelector("#bundo").onclick=function(ev){ ev.stopPropagation(); quitaDeshacer(true); deshaceSalto(); };
  var _bv=el.querySelector("#bviva264");
  if(_bv) _bv.onclick=function(ev){ ev.stopPropagation(); quitaDeshacer(true);
    var sal=window.__ultimoDeshacer; window.__ultimoDeshacer=null;
    try{ if(sal && typeof sal.restaurar==="function") sal.restaurar(); }catch(e){}
    var tt=tareas.filter(function(z){ return z.id===_dv; })[0]; if(!tt) return;
    var pd=duerme264(tt);
    window.__ultimoDeshacer={id:tt.id, tipo:"hecha", de:tt.nombre, restaurar:function(){ restauraDormir(tt,pd); }, cuando:Date.now()};
    toast("Enterado · queda viva para lo que llegue"); render(); };
  window.__undoT=setTimeout(function(){ quitaDeshacer(false); }, ms||3000);
}
function quitaDeshacer(ya){
  var el=document.getElementById("undopill"); if(!el) return;
  if(window.__undoT){ clearTimeout(window.__undoT); window.__undoT=null; }
  if(ya){ el.parentNode.removeChild(el); return; }
  el.classList.add("fuera"); setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 260);
}
/* Deshacer lo ultimo que se quito (alarma, cierre o eliminacion); se pide
   por el chat, ya no hay boton. */
function deshaceSalto(){
  var sal=window.__ultimoDeshacer; if(!sal) return false;
  window.__ultimoDeshacer=null;
  try{ if(typeof sal.restaurar==="function") sal.restaurar(); }catch(e){ toast("No se pudo deshacer: "+(e&&e.message||e)); return false; }
  abierta=sal.id; vista="hilo"; menuOpen=false; render(); toast("Recuperado"); return true;
}
/* bote de basura de un recordatorio suelto: se cierra como cancelado y te
   quedas en el, tachado, con Deshacer. */
function borraRecordatorioYQuedate(t){
  var prev={estado:t.estado, cierre:t.cierre||null, n:(t.msgs||[]).length};
  t.estado="cerrada"; t.cierre={tipo:"cancelado",f:hoy()}; guarda(t);
  sincronizaAvisos(t);
  selloYSigue(t,{tipo:"eliminada", texto:t.nombre, restaurar:function(){
    t.estado=prev.estado||"abierta"; t.cierre=prev.cierre; guarda(t); sincronizaAvisos(t); }});
}
/* la tarjetita chiquita: "esto no suena a comentario de X" con dos salidas.
   Comentar aqui = mete lo dictado sin repetirlo y sin salir. Es algo nuevo =
   lo procesa como intencion (crear/encargar/...). */
function muestraDudaHilo(t, v){
  cierraDudaHilo();
  var el=document.createElement("div");
  el.className="dudah"; el.id="dudah";
  el.innerHTML='<div class="q">Esto no suena a comentario de <b>\u00ab'+esc(nombreCortoTarea(t))+'\u00bb</b>. \u00bfQu\u00e9 hago con lo que dijiste?</div>'+
    '<div class="rw"><button id="dudaqui">Comentar aqu\u00ed</button>'+
    '<button class="nuevo" id="dudanuevo">Es algo nuevo</button></div>';
  document.body.appendChild(el);
  document.getElementById("dudaqui").onclick=function(){
    cierraDudaHilo();
    var c=$("txt"); if(c) c.value="";
    mandar(t, v);
  };
  document.getElementById("dudanuevo").onclick=function(){
    cierraDudaHilo();
    var c=$("txt"); if(c) c.value="";
    abierta=null;
    barraEnviar(v);
  };
}
/* saca una fecha "26 de septiembre" / "2026-09-26" de un texto -> ISO, o null.
   Si el dia/mes ya paso este anio, se va al que viene. (Era codigo inline de
   mandar(); se saco aparte el 2026-09-22 para usarlo tambien al dictar directo.) */
function fechaEnTexto(txt){
  /* build 190: antes tomaba SOLO el primer "numero + palabra" (con "a las 10 y el 2 de
     noviembre" no veia la fecha) y hacia setMonth sobre hoy: dicho un dia 31, "2 de
     noviembre" quedaba 2 de DICIEMBRE (31-nov no existe y JS lo brinca). Ahora sale del
     nucleo de fechas (fechasDichas) y acepta "2 de nov", "2-nov" y AAAA-MM-DD. */
  var r=fechasDichas(txt), x=r.lista.filter(function(y){ return y.k==="iso"||y.k==="mes"; })[0];
  return (x && !r.dudas.length) ? x.f : null;
}
function mandar(t,txt){
  guardaHablado(t,"bo",txt);
  t.ultima=PERSONAS[yo].nombre+": "+(esLargo(txt)?localResumen(txt):txt);

  /* Salvador 2026-09-24: una tarea cerrada no sigue esperando nada; lo que se
     escribe ahi es comentario (antes repetia "Todavia me falta..." sin parar). */
  if(t.cierre){ t.pide_atoro=false; t.pide_tel=false; t.pide_fecha=false; }

  /* ---- "regresa lo que acabo de borrar / deshacer": SOLO si lo ultimo borrado
     es ESTA tarea. Salvador 2026-09-24: "reactivar" en una tarea cerrada
     deshizo el cierre de OTRA (la del golf) y lo brinco alla. ---- */
  if(/\b(deshac\w*|regres\w*|devuelv\w*|vuelve a poner)\b/i.test(txt) && window.__ultimoDeshacer && window.__ultimoDeshacer.id===t.id && (Date.now()-window.__ultimoDeshacer.cuando)<10*60*1000){
    if(deshaceSalto()){ msg(t,"bi","Listo, lo regresé."); guarda(t); }
    return;
  }

  /* ---- REABRIR UNA TAREA CERRADA DESDE EL CHAT (Salvador 2026-09-24): "hay
     que reactivarla", "se me paso", "falto hacer otra llamada", "abrela". Se
     queda en la misma tarea; si su fecha ya paso, se pide la nueva. ---- */
  var _sr=String(txt||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if(t.cierre && /\b(reactiv\w*|reabr\w*|se me paso|falt(o|a|an|aron) (hacer|otra|otro|una|un|algo|la|el|que)|no (esta|quedo|quedaron|quedaba) (lista|hecha|terminada|completa)|abrela|abrirla|vuelve(la)? a abrir|regres\w*|devuelv\w*|reviv\w*|sigue pendiente|no la (cierres|des por))\b/.test(_sr)){
    reabre(t, txt); return;
  }

  /* ---- build 140: MOTIVO DE LA ULTIMA MOVIDA. Lo siguiente que se dice en el
     hilo (dentro de 10 min) es el porque; se guarda y no se procesa como otra
     cosa. Si no contesta, queda "sin decir por qué". ---- */
  if(t.espera_motivo){
    var _em=t.espera_motivo, _mv=(t.movimientos||[])[_em.i];
    t.espera_motivo=null;
    if(_mv && (Date.now()-_em.ts)<10*60*1000 && !esMovida(txt)){
      _mv.motivo=String(txt||"").trim(); msg(t,"bi","Anotado el motivo."); guarda(t); return;
    }
    if(_mv && !_mv.motivo) _mv.motivo="sin decir por qué";
  }
  /* ---- reabierta con fecha vencida: solo hace falta la nueva fecha ---- */
  if(t.reabre_fecha && !t.cierre){
    var _nf=fechaMovida(txt);
    if(!_nf){ msg(t,"bi",dudaFecha(txt)||"No le entendí la fecha. Dime por ejemplo: el lunes, o 3 de octubre."); guarda(t); return; }
    t.reabre_fecha=false; t.pide_fecha=false; t.f_vigente=_nf;
    msg(t,"bi","Va, para el "+fechaBonita(_nf)+"."); sincronizaAvisos(t); guarda(t); return;
  }
  /* ---- MOVER FECHA HABLANDO — build 140 (Salvador 2026-09-25): "pasala al
     proximo viernes", "en 15 dias", "a fin de mes". La app calcula la fecha y
     la mueve YA; el motivo se pregunta despues y es opcional. Solo pregunta
     si no dijo fecha ("muevela"). ---- */
  if(!t.cierre && (t.pide_fecha || esMovida(txt))){
    var _fm=fechaMovida(txt);
    var _mot=(txt.match(/\b(?:porque|por que|porqu\u00e9|ya que|debido a)\b\s*(.+)$/i)||[])[1]||"";
    if(!_fm && t.pide_fecha && t.fecha_pendiente && !dudaFecha(txt)){ _fm=t.fecha_pendiente; _mot=String(txt||"").trim(); }
    /* build 190: fecha en duda ("el lunes 4" y el 4 es domingo) -> UNA pregunta, no se adivina */
    if(!_fm){ t.pide_fecha=true; msg(t,"bi",dudaFecha(txt)||"¿Para cuándo la muevo? Dime por ejemplo: el viernes, en 15 días o a fin de mes."); guarda(t); return; }
    var _r0=mueveFecha(t,_fm,_mot.trim()); if(!_r0.ok){ t.pide_fecha=false; msg(t,"bi",_r0.msg); }
    guarda(t); return;
  }

  /* ---- ATORADO, hablando (Salvador 2026-09-24): con el nombre basta; el
     telefono se pide despues, en una linea, solo si no esta en el directorio. */
  var _sa=String(txt||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  if(t.pide_tel){
    var telx=(txt.match(/(\+?\d[\d\s\-()]{7,})/)||[])[1]||"";
    t.pide_tel=false;
    if(telx && t.detenido){ t.detenido.tel=telx.replace(/[\s\-()]/g,""); msg(t,"bi","Listo, ya lo tengo."); }
    else msg(t,"bi","Va, sin teléfono por ahora. Cuando lo tengas me lo pasas.");
    guarda(t); return;
  }
  var _dice=t.pide_atoro || /\b(esper(o|ando|amos)|atorad|detenid|trabad|depend(o|e|iendo)|me falta que)\b/.test(_sa);
  if(_dice && !t.cierre){
    var _m=txt.match(/\b(?:a|de|por|con)\s+([A-ZÁÉÍÓÚ][\wáéíóú]+(?:\s+[A-ZÁÉÍÓÚ][\wáéíóú]+)?)/);
    var quien=_m?_m[1]:(t.pide_atoro?(txt.split(/[,;]/)[0]||"").trim():"");
    if(!quien){ t.pide_atoro=true; msg(t,"bi","¿Quién te está deteniendo?"); guarda(t); return; }
    var tel=(txt.match(/(\+?\d[\d\s\-()]{7,})/)||[])[1]||"";
    var que=(txt.match(/\b(?:por|para|que me|el|la|los|las)\s+(.{4,80})$/i)||[])[1]||"su parte";
    var fuera=/proveedor|electric|eléctric|taller|agronom|agrónom|plomer|jardiner|cotiza|presupuesto/i.test(txt);
    t.pide_atoro=false;
    declaraAtorado(t,quien,tel,que,fuera);
    t.ultima="Detenida: espera a "+quien;
    var _conocido=Object.keys(PERSONAS).some(function(k){ return (PERSONAS[k].nombre||"").toLowerCase()===quien.toLowerCase().split(" ")[0]; });
    if(!_conocido && !tel){ t.pide_tel=true; msg(t,"bi","No tengo a "+quien+" en el directorio. ¿Me pasas su teléfono?"); }
    guarda(t); return;
  }

  /* ---- está contestando el toque del día ---- */
  if(t.espera_toque){
    t.espera_toque=false;
    toqueHecho(t,txt);
    if(/ya (me |nos )?(contest|mand|dio|entreg)|quedamos|ya me lo pas/i.test(txt)) destrabar(t);
    return;
  }

  if(/autoriza|presupuesto|permiso|cuánto|cuanto/i.test(txt) && !PERSONAS[yo].jefe){
    t.estado="espera"; t.espera="salvador"; t.espera_desde=Date.now(); t.espera_a={id:"salvador", quien:"Salvador", desde:t.espera_desde, motivo:"autorizar"};
    msg(t,"bi","Se lo paso a Salvador. Te aviso en cuanto conteste.");
  }
  guarda(t);
}
