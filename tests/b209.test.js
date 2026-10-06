#!/usr/bin/env node
/* PRUEBAS build 209 (arnés de 205) (Salvador 2026-10-04 21:14, "Agendar Reunión Consejo Colonia Cumbres"): lo dictado dentro de una tarea
   en "Falta info" la completa aunque suene a nota para Claude ("…es para que sepas el contexto" caía en esNotaClaude ->
   "No cambié nada en la tarea"). Al instante, sin IA: indefinida, ritmo, fecha y contexto; luego la IA afina; barras y
   renglones en vivo; "Solo me falta: …"; completa -> palomita. Núcleo de fechas REAL. Correr: TZ=America/Monterrey node tests/b205.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var lineas = html.split("\n");
function saca(tipo, nombre) {
  var re = tipo === "function" ? new RegExp("^function " + nombre.replace(/\$/g, "\\$") + "\\(") : new RegExp("^var " + nombre + "\\s*=");
  var ini = -1; for (var i = 0; i < lineas.length; i++) if (re.test(lineas[i])) ini = i;
  if (ini < 0) throw new Error("no encontre " + tipo + " " + nombre);
  var out = [lineas[ini]];
  for (var k = ini + 1; k < lineas.length; k++) { var L = lineas[k]; if (L.length && !/^[\s}\]]/.test(L)) break; out.push(L); if (/^}/.test(L)) break; }
  return out.join("\n");
}
function bloque(a, b) { var i = html.indexOf(a), j = html.indexOf(b); return html.slice(i, j + b.length); }
var ft = fs.readFileSync(path.join(__dirname, "fechas.test.js"), "utf8");
var F_FUNCS = eval(ft.match(/var FUNCS = (\[[\s\S]*?\]);/)[1]), F_VARS = eval(ft.match(/var VARS = (\[[\s\S]*?\]);/)[1]);
var FUNCS = F_FUNCS.concat([ "_bpega", "viva249", "personasPara250", "resuelveDestino", "buscaContactos249", "contactosApp249", "nombreWA251", "nombresExactosWA251", "sinResultado251", "ordenesImposibles251", "refuerzo251", "preguntaConcreta251", "ultimos10_251", "ordenCondicional250", "ejecutaCond250", "resuelveCond250", "eventoDicho250", "venceCond250", "_diaAntes250", "mostrarAcomoda249", "ocultaAcomoda249", "liberaAcomoda249", "preguntas249", "abrePreguntas249", "esPersonaQ249", "palTema248", "temaComun248", "esCerradaReciente248", "nombreVinc248", "preguntaQuienYaResuelta248", "aplicaLecturaFechas248", "lecturaFechas248", "_hitsFecha248", "cierraDeEvento248", "pasosSeguimiento248", "armaMensajesSeguimiento248", "reintentaDudas248", "checklistTexto", "aplicaChecklistClaude", "aplicaResponsable", "esMetas", "necesitaAprobacion", "ejecutorNombre", "vistaSup", "porAprobar", "aplicaAvisoInmediato", "importanciaDe", "ejecutorMeta", "respuestasEjecutor", "textoEmpuje", "empujaEjecutor", "evidenciaMeta", "fechaPropuesta", "escalaMeta", "decideMeta", "vDecisionMeta", "miembroDeNombre", "metasDe", "metaCumplida", "metaCorta", "tareaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "metaNueva", "_raizMeta", "metaParecidaCumplida", "cumpleMeta", "fotoMeta", "programaSegMeta", "aplicaMetasClaude", "chequeoMetas", "vMetas", "hhmmAhora", "nombreCorto", "_tokPer", "nombresEnTexto", "_compartirLista", "candidatosPersona", "resuelvePersona", "nuevaDudaPersona", "asignaResponsable", "agregaCompartir", "fechasDeCada", "programaSeguimiento", "resuelveDudaPersona", "_n179", "nombreInt", "agregaIntegrante", "aplicaSeguimientoA", "_dichoNombre", "nombreCorto", "tieneChecklist", "chkNuevo", "chkPon", "_nv", "checklistDicho", "respChecklist", "_chkTok", "chkBusca", "hhmmAhora", "esConfirmacion", "juntaY", "tienePasos", "esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "fechaMty238", "horaMty238", "duenoDicho238", "fechaOrden238", "candidatasVinc238", "nombreTarea238", "corto238", "mandaOrden238", "ejecutaOrdenes238", "dioFecha238", "vHecho238", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "propuestaAgenda", "fechaRespaldada", "evidenciaDe", "vClipEvid", "eventoPendiente", "faltaVieja", "tipoRevisar", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "okDeRevision", "palomeaEnOrden", "autorizaRevision", "fichaRevision", "abiertasParaVincular", "estadoParaClaude", "promptRevision", "aplicaRevisionClaude", "tituloTarea", "traeFecha", "transfiere", "posibleDup"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["MODO_CEREBRO", "TIPOS_ORDEN251", "ESTADO_COND250", "EMPRESAS248", "SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "PALOMEO_MS", "TITULO_CONECTORES", "RITMO_RE", "CITA_RE", "MESES229", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var RealDate = Date, NOW = new RealDate(2026, 9, 4, 21, 14, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
  return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var IA = { resp: null, err: null, llamadas: 0 }, renders = 0, sellos = [];
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, Intl: Intl, isNaN: isNaN, parseInt: parseInt,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, josue: { nombre: "Josué" } }, tareas: [], window: {}, vista: "hilo", abierta: null,
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }, ico: function () { return ""; },
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); }, guarda: function () {}, render: function () { renders++; },
  preguntaAClaude: function (m, mod, cb) { IA.llamadas++; IA.prompt = m[0].content; cb(IA.err ? null : JSON.stringify(IA.resp || {}), IA.err); },
  selloYSigue: function (t, o) { sellos.push(o.tipo); }, sincronizaAvisos: function () {}, cierraHecha: function () {}, completaPendiente: function () {}, nuevoAviso: function () {},
  setTimeout: function (f) { f(); }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, estadoReal: function (t) { return t.estado || "abierta"; } };
vm.createContext(c); vm.runInContext(codigo, c);
c.clasif236 = function () { return true; };   /* build 236: estas pruebas son de la tarea YA clasificada (Tarea o Dato) */
(function () { var _vf = c.vFaltaInfo; c.vFaltaInfo = function (t) { var h = t.hecho238; delete t.hecho238; try { return _vf(t); } finally { if (h) t.hecho238 = h; } }; })();   /* build 238: la ficha completa es lo que queda al cerrar la tarjeta Hecho / Me falta */
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
/* forma real de CONSEJO_CUMBRES_REUNION_20260927 (leída con el conector 2026-10-04 21:1x), antes del dictado */
function CONSEJO() { return { id: "CONSEJO_CUMBRES_REUNION_20260927", nombre: "Agendar Reunión Consejo Colonia Cumbres", creada_por: "claude", duenio: "salvador", tipo: "unica", estado: "abierta",
  f_original: "2026-09-27", f_vigente: "2026-09-27",
  tarea: "Agendar reunión del Consejo de la Colonia Cumbres con Enrique Martínez, Adolfo Rodríguez, Mario Castillo y Salvador — de preferencia jueves a cenar o viernes a comer",
  msgs: [{ aviso: 1, h: "14:53", k: "bal", t: "¿Para cuándo agendas la reunión con el Consejo Colonia Cumbres? Lleva 7 días vencida.", ts: NOW - 6 * 3600000 }] }; }
var DICTADO = "Esto es una tarea en contexto de donde meto todo lo que quiero hacer de proyectos en la colonia Cumbres donde yo estuve el presidente está Mario Castillo que es el secretario Adolfo Rodríguez que es el tesorero Enrique Martínez que es el vocal y Luis Mario no escucha que mi hermano y ahí nos ayuda a participar en el concepto no dormimos normalmente dos veces al año Y sacamos conclusiones de qué queremos hacer de nuevos proyectos como van las finanzas etc. entonces los casos importantes de proyectos grandes de finanzas aquí los meto cuando hay algo relevante es para que sepas el contexto Esta tarea es indefinida y cuyo propio es que merece un ritmo de una vez al mes estarme recordando este aquí para ver si vamos avanzando si no vamos avanzando ni pendiente el macro por lo pronto macro aquí tengo ahorita pues no no esté en mi proyecto de Navidad que es la decoración navideña cada año el proyecto de ponerle barda a todos los terrenos baldíos El proyecto de poner unas cámaras de seguridad el proyecto de ponerle jardinería alrededor de las plazas este para que queden muy bien el proyecto de reforestar unos árboles que se secaron";

var ult = function (t) { return t.msgs.slice(-1)[0]; };
c.tareas = [{ id: "JUNTA_CUMBRES_SEP", nombre: "Junta Consejo Cumbres septiembre", duenio: "salvador", estado: "abierta", contexto: "Junta del consejo de la colonia Cumbres", msgs: [] }];
/* 1 Consejo Cumbres: completa, pero NO se autoriza sola */
IA.resp = { nombre: "consejo de la colonia cumbres: proyectos", tipo: "tarea",
  contexto: "Tarea maestra donde Salvador mete todos los proyectos de la colonia Cumbres. Consejo: Salvador presidente, Mario Castillo secretario, Adolfo Rodríguez tesorero, Enrique Martínez vocal.",
  indefinida: true, ritmo: "una vez al mes", quien: "Salvador", palabras: ["cumbres", "consejo"], sinonimos: ["fraccionamiento"], vinculos: ["JUNTA_CUMBRES_SEP"] };
sellos.length = 0; var T = CONSEJO(); c.tareas.push(T); c.abierta = T.id; c.completaRevision(T, DICTADO);
eq("completa pero NO autorizada sola; sigue en Falta info", [!!T.autorizada, sellos, c.tipoRevisar(T)], [false, [], "falta"]);
var v = c.vFaltaInfo(T);
si("ficha completa: nombre", /<span class="ffl">Nombre<\/span><span class="ffv">Consejo de la Colonia Cumbres: Proyectos<\/span>/.test(v));
si("ficha: Tarea", /<span class="ffl">Es<\/span><span class="ffv">Tarea<\/span>/.test(v));
si("ficha: contexto", /<span class="ffl">Contexto<\/span><span class="ffv">Tarea maestra donde Salvador/.test(v));
si("ficha: finiquito indefinida", /<span class="ffl">Finiquito<\/span><span class="ffv">Indefinida<\/span>/.test(v));
si("ficha: ritmo", /<span class="ffl">Ritmo<\/span><span class="ffv">Una vez al mes<\/span>/.test(v));
si("ficha: quién", /<span class="ffl">Quién<\/span><span class="ffv">Tú<\/span>/.test(v));
si("ficha: etiquetas", /<span class="ffl">Etiquetas<\/span><span class="ffv">cumbres · consejo · fraccionamiento<\/span>/.test(v));
si("ficha: vínculo propuesto (no vinculado)", /<span class="ffl">Vínculo propuesto<\/span><span class="ffv">Junta Consejo Cumbres septiembre \(no vinculado\)<\/span>/.test(v));
si("cada campo se toca para corregirlo", (v.match(/data-fedit="/g) || []).length === 8);
si("abajo, Autorizar HABILITADO como pastilla discreta (build 225: sin botón verde gigante)", /<button class="autpill" id="autrev">1 cosa para ti · Autorizar<\/button>$/.test(v));
si("sin 'Solo me falta'", !/Solo me falta/.test(v));
eq("le dice que revise y autorice", ult(T).t, "Anoté: nombre “Consejo de la Colonia Cumbres: Proyectos”, contexto, indefinida, ritmo: una vez al mes, etiquetas. Posible vínculo con “Junta Consejo Cumbres septiembre”: te lo dejo propuesto, no lo vinculé. Revisa la ficha y pica Autorizar.");
/* 2 corrección dictada: Claude la aplica, la ficha se refresca y el botón sigue */
IA.resp = { ritmo: "cada semana" };
c.completaRevision(T, "no, el ritmo es cada semana");
eq("corrección aplicada, sigue sin autorizar", [T.ritmo, !!T.autorizada, c.tipoRevisar(T)], ["Cada semana", false, "falta"]);
var v2 = c.vFaltaInfo(T);
si("ficha refrescada con el botón otra vez abajo", /<span class="ffv">Cada semana<\/span>/.test(v2) && /<button class="autpill" id="autrev">1 cosa para ti · Autorizar<\/button>$/.test(v2));
/* 3 Autorizar: palomita estándar y sale de Falta info */
eq("Autorizar -> palomita estándar y sale de Falta info", [c.autorizaRevision(T), T.autorizada, sellos, T.en_revision, c.tipoRevisar(T) !== "falta"], [true, true, ["autorizada"], undefined, true]);
/* 4 incompleta: Solo me falta + botón deshabilitado */
IA.resp = { contexto: "Barda del terreno baldío de la esquina que pidió revisar el consejo de la colonia con Manuel y el arquitecto antes de las lluvias." };
var T2 = { id: "tB", nombre: "Barda terreno", duenio: "salvador", creada_por: "claude", estado: "abierta", msgs: [] }; c.abierta = T2.id;
c.completaRevision(T2, "es la barda del terreno baldío de la esquina que nos pidió el consejo revisar con Manuel y el arquitecto");
var v4 = c.vFaltaInfo(T2);
si("incompleta: 'Solo me falta' y SIN botón (build 225)", /Solo me falta:/.test(v4) && !/id="autrev"/.test(v4) && !/class="ffin"/.test(v4));
eq("incompleta: Autorizar no hace nada", [c.autorizaRevision(T2), !!T2.autorizada], [false, false]);
/* 5 dato */
IA.resp = { nombre: "cotización barandal terraza herrería lópez", tipo: "dato", contexto: "Cotización de Herrería López para el barandal de la terraza de acero negro, 6.5 metros lineales, para decidir después si se hace.",
  de_quien: "Herrería López", cifras: "6.5 m lineales a $2,800 el metro; total $18,200 más IVA", palabras: ["barandal", "herrería"] };
var D = { id: "WA_HERRERIA_1", nombre: "WhatsApp: Herrería López", creada_por: "claude", duenio: "salvador", estado: "abierta", msgs: [] }; c.abierta = D.id;
c.completaRevision(D, "Esto es un dato: la cotización de Herrería López para el barandal de la terraza, acero negro, 6.5 metros lineales a 2,800 pesos el metro, total 18,200 más IVA");
var vd = c.vFaltaInfo(D);
si("dato: ficha con Es Dato, De y Cifras, y Autorizar habilitado", /<span class="ffv">Dato<\/span>/.test(vd) && /<span class="ffl">De<\/span><span class="ffv">Herrería López<\/span>/.test(vd) && /<span class="ffl">Cifras<\/span><span class="ffv">6.5 m lineales a \$2,800 el metro; total \$18,200 más IVA<\/span>/.test(vd) && /id="autrev">1 cosa para ti · Autorizar<\/button>$/.test(vd) && !D.autorizada);
si("botón y campos conectados en la pantalla", /var _ar=\$\("autrev"\); if\(_ar\) _ar\.onclick=function\(\)\{ if\(!autorizaRevision\(t\)\) render\(\); \};/.test(html) && /querySelectorAll\("\[data-fedit\]"\)/.test(html));
si("VERSION_APP build 209 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 209);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
