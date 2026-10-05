#!/usr/bin/env node
/* PRUEBAS build 211 (arnés de 205/206): nota a Claude con contexto que trae fechas dictadas (Fiesta Navideña 07:46) (Salvador 2026-10-04 21:14, "Agendar Reunión Consejo Colonia Cumbres"): lo dictado dentro de una tarea
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
var FUNCS = F_FUNCS.concat(["checklistTexto", "aplicaChecklistClaude", "aplicaResponsable", "esMetas", "aplicaAvisoInmediato", "importanciaDe", "ejecutorMeta", "respuestasEjecutor", "textoEmpuje", "empujaEjecutor", "evidenciaMeta", "fechaPropuesta", "escalaMeta", "decideMeta", "vDecisionMeta", "miembroDeNombre", "metasDe", "metaCumplida", "metaCorta", "tareaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "metaNueva", "_raizMeta", "metaParecidaCumplida", "cumpleMeta", "fotoMeta", "programaSegMeta", "aplicaMetasClaude", "chequeoMetas", "vMetas", "hhmmAhora", "nombreCorto", "_tokPer", "nombresEnTexto", "_compartirLista", "candidatosPersona", "resuelvePersona", "nuevaDudaPersona", "asignaResponsable", "agregaCompartir", "fechasDeCada", "programaSeguimiento", "resuelveDudaPersona", "_n179", "nombreInt", "agregaIntegrante", "aplicaSeguimientoA", "_dichoNombre", "nombreCorto", "tieneChecklist", "chkNuevo", "chkPon", "_nv", "checklistDicho", "respChecklist", "_chkTok", "chkBusca", "hhmmAhora", "esConfirmacion", "juntaY", "tienePasos", "esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "eventoPendiente", "faltaVieja", "tipoRevisar", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "aplicaCamposNota", "autorizaRevision", "juntaNota", "ejecutaNotaClaude", "aplicaNotaClaude", "respuestaHecho", "traeFecha", "fechaConDia", "calendarioProximo", "fechaBonita"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "RITMO_RE", "CITA_RE", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var RealDate = Date, NOW = new RealDate(2026, 9, 4, 21, 14, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
  return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var IA = { resp: null, err: null, llamadas: 0 }, renders = 0, sellos = [];
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, Intl: Intl, isNaN: isNaN, parseInt: parseInt,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true } }, tareas: [], window: {}, vista: "hilo", abierta: null,
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }, ico: function () { return ""; },
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); }, guarda: function () {}, render: function () { renders++; },
  preguntaAClaude: function (m, mod, cb) { IA.llamadas++; IA.prompt = m[0].content; cb(IA.err ? null : JSON.stringify(IA.resp || {}), IA.err); },
  selloYSigue: function (t, o) { sellos.push(o.tipo); }, sincronizaAvisos: function () {}, cierraHecha: function () {}, completaPendiente: function () {}, nuevoAviso: function () {},
  setTimeout: function (f) { f(); }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, estadoReal: function (t) { return t.estado || "abierta"; },
  duenioDicho: function () { return null; }, transfiere: function () { return { ok: false }; }, faltanParaCerrar: function () { return []; }, tituloTarea: function (x) { return x; }, cierraSinEjecutar: function () {}, muestraDeshacer: function () {} };
vm.createContext(c); vm.runInContext(codigo, c);
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
function nota(t, v) { var a = t.msgs.length; c.ejecutaNotaClaude(t, v); return t.msgs.length > a ? ult(t).t : null; }
/* "Fiesta Navideña" (tmuuqah2egllq0) ANTES de la nota de las 07:46 (leída con el conector): contexto = lo cortado de las 07:38 */
var C38 = "Pero esto es de Clau esto es para que pongas el contexto tengas la fecha y me des seguimiento por favor mañana y el jueves para allá definir este todo lo de la fecha";
function FIESTA() { return { id: "tmuuqah2egllq0", nombre: "Fiesta Navideña", creada_por: "salvador", duenio: "salvador", tipo: "unica", tipo_item: "tarea", estado: "abierta", autorizada: true,
  f_original: "2026-10-04", f_vigente: "2026-10-04", falta_fecha: true, contexto: C38, ritmo: "", msgs: [],
  avisos: [{ ts: 1, fecha: "2026-10-06", texto: "Fiesta Navideña", hora: "", cada: "" }, { ts: 2, fecha: "2026-10-08", texto: "Fiesta Navideña", hora: "", cada: "" }] }; }
/* la nota real de las 07:46, tal cual llegó */
var N46 = "Oye Clau a ver déjame te doy el contexto de esta tarea este es una fiesta que tengo que hacer para la colonia Cumbres la organiza la mesa directiva que yo soy el presidente como ya sabes Y este la tengo que hacer antes del 15 de diciembre Yo creo que se me antojaré hacerlo un jueves ando indeciso de hacerla con niños o puro adulto la del verano le hice puros adultos y tengo que definir primero la fecha segundo el menú tercero la temática y para medio decorar padre hacer algún algo de convivió alguna dinámica a ver qué me sugieres sobre todo yo creo que sí va a ser más pendiente a los niños Este lo mejor este que sea así más informal con un chocolatito caliente café buñuelos churros a lo mejor tamales para que sea tipo mexicana Este no sé si ponerme esas sillas dos parados Este alrededor del kiosco del de la plaza central pero pues todos parados no sé cómo vamos a convivir Este entonces tengo todo eso por definir este quiero ponerme a pensar en eso mañana y a más tardar el jueves por eso te pedí esos dos recordatorios entonces es la fecha finiquito de esta tarea es antes del 15 de diciembre tiene que quedar ejecutar la fiesta";
var CTX = "Fiesta para la colonia Cumbres que organiza la mesa directiva (Salvador es presidente). Se tiene que hacer antes del 15 de diciembre, quizá un jueves; falta definir fecha, menú, temática, decoración y dinámica; informal tipo mexicana (chocolate, café, buñuelos, churros, tamales), alrededor del kiosco de la plaza central.";

/* 1 lo que pasó: la IA regresa contexto CON fechas dictadas -> antes se tiraba */
IA.resp = { accion: "contexto", contexto: CTX, contexto_modo: "reemplazar", fecha: "2026-12-15", respuesta: "Te anoté el contexto y la fecha." };
var T = FIESTA(); var r = nota(T, N46);
eq("el contexto con '15 de diciembre' y 'un jueves' (dictados) ahora SÍ entra", T.contexto, CTX);
eq("y la fecha queda el 15 de diciembre", [T.f_vigente, T.fecha_dictada, T.falta_fecha], ["2026-12-15", true, false]);
si("la respuesta dice las dos cosas", /^Anoté: contexto nuevo, fecha: .*15 de diciembre\./.test(r));
/* 2 contexto con una fecha que NO se dictó: se rechaza (candado) */
IA.resp = { accion: "contexto", contexto: "Fiesta de la colonia Cumbres el 20 de diciembre en el kiosco.", contexto_modo: "reemplazar" };
var T2 = FIESTA(); nota(T2, N46);
si("contexto con una fecha inventada (20 de diciembre): no entra", T2.contexto !== "Fiesta de la colonia Cumbres el 20 de diciembre en el kiosco.");
/* 3 pidió contexto ("te doy el contexto") y la IA no lo regresó: entra lo dictado, completo */
IA.resp = { accion: "fecha", valor: "2026-12-15", respuesta: "ok" };
var T3 = FIESTA(); nota(T3, N46);
eq("sin contexto de la IA: entra lo dictado completo (sin cortar a 600)", [T3.contexto.length > 1000, /tiene que quedar ejecutar la fiesta$/.test(T3.contexto), /^a ver déjame te doy el contexto|^Oye Clau/.test(T3.contexto) || /fiesta que tengo que hacer para la colonia Cumbres/.test(T3.contexto)], [true, true, true]);
eq("…y la fecha se movió", T3.f_vigente, "2026-12-15");
/* 4 lo de antes sigue: una nota sin contexto no inventa contexto */
IA.resp = { accion: "nada", respuesta: "No sé qué quieres." };
var T4 = FIESTA(); nota(T4, "Claude, hmm"); eq("nota sin contexto: el contexto no cambia", T4.contexto, C38);
si("VERSION_APP build 211 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 211);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
