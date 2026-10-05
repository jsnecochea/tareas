#!/usr/bin/env node
/* PRUEBAS build 208 (arnés de 205) (Salvador 2026-10-04 21:14, "Agendar Reunión Consejo Colonia Cumbres"): lo dictado dentro de una tarea
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
var FUNCS = F_FUNCS.concat(["esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "eventoPendiente", "faltaVieja", "tipoRevisar", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "okDeRevision", "palomeaEnOrden", "abiertasParaVincular", "estadoParaClaude", "promptRevision", "aplicaRevisionClaude", "tituloTarea", "traeFecha", "transfiere", "posibleDup"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["PALOMEO_MS", "TITULO_CONECTORES", "RITMO_RE", "CITA_RE", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var RealDate = Date, NOW = new RealDate(2026, 9, 4, 21, 14, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
  return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var COLA = [];
var IA = { resp: null, err: null, llamadas: 0 }, renders = 0, sellos = [];
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, Intl: Intl, isNaN: isNaN, parseInt: parseInt,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, josue: { nombre: "Josué" } }, tareas: [], window: {}, vista: "hilo", abierta: null,
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }, ico: function () { return ""; },
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); }, guarda: function () {}, render: function () { renders++; },
  preguntaAClaude: function (m, mod, cb) { IA.llamadas++; IA.prompt = m[0].content; cb(IA.err ? null : JSON.stringify(IA.resp || {}), IA.err); },
  selloYSigue: function (t, o) { sellos.push(o.tipo); }, sincronizaAvisos: function () {}, cierraHecha: function () {}, completaPendiente: function () {}, nuevoAviso: function () {},
  setTimeout: function (f, ms) { COLA.push({ f: f, ms: ms }); }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, estadoReal: function (t) { return t.estado || "abierta"; } };
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

c.tareas = [];
function corre() { var x = COLA.shift(); if (x) x.f(); return x; }
/* Consejo Cumbres: Claude regresa contexto + indefinida + ritmo -> 3 checks nuevos (contexto, finiquito, seguimiento) */
IA.resp = { contexto: "Tarea maestra de proyectos de la colonia Cumbres: Salvador presidente, Mario Castillo secretario, Adolfo Rodríguez tesorero, Enrique Martínez vocal; se reúnen dos veces al año.", indefinida: true, ritmo: "una vez al mes" };
sellos.length = 0; var T = CONSEJO(); c.abierta = T.id; c.vista = "hilo";
var ant = c.okDeRevision(T); c.completaRevision(T, DICTADO);
eq("antes de dictar: contexto (su descripción) y quién ya estaban; nada se palomea mientras dicta", ant, ["ctx", "quien"]);
var P = c.window.__palomeo[T.id];
eq("al llegar Claude: quedan en fila para palomear, en orden", P && P.pend, ["finiquito", "seguimiento"]);
var v0 = c.vFaltaInfo(T);
si("todavía se ven pendientes y sin 'Solo me falta' ni autorizar", /○ Finiquito/.test(v0) && /○ Próximo seguimiento/.test(v0) && !/Solo me falta/.test(v0) && !T.autorizada);
eq("cada paso espera 250 ms", COLA.map(function (x) { return x.ms; }), [250]);
corre(); var v1 = c.vFaltaInfo(T);
si("1º: finiquito con palomita animada; seguimiento sigue pendiente", /<li class="ok palomea">✓ Finiquito: indefinida<\/li>/.test(v1) && /○ Próximo seguimiento/.test(v1) && !T.autorizada);
corre(); var v2 = c.vFaltaInfo(T);
si("2º: seguimiento palomeado (el anterior ya tenue)", /<li class="ok palomea">✓ Próximo seguimiento listo<\/li>/.test(v2) && /<li class="ok palomea">✓ Finiquito/.test(v2) && !T.autorizada);
eq("un paso más de 250 ms antes de cerrar", COLA.map(function (x) { return x.ms; }), [250]);
corre();
eq("al final: se autoriza con la palomita estándar", [T.autorizada, sellos, c.window.__palomeo[T.id]], [true, ["autorizada"], undefined]);
/* parcial: se palomea lo que entró y al final "Solo me falta" */
IA.resp = { contexto: "Revisar la barda del terreno baldío de la esquina que pidió el consejo de la colonia, con Manuel y el arquitecto, antes de que llueva." };
var T2 = { id: "tB", nombre: "Barda terreno", duenio: "salvador", creada_por: "claude", estado: "abierta", msgs: [] }; c.abierta = T2.id; COLA.length = 0;
c.completaRevision(T2, "es la barda del terreno baldío de la esquina que nos pidió el consejo revisar con Manuel y el arquitecto antes de que llueva");
eq("parcial: solo el contexto en fila", c.window.__palomeo[T2.id].pend, ["ctx"]);
si("sin 'Solo me falta' mientras palomea", !/Solo me falta/.test(T2.msgs.slice(-1)[0].t));
corre(); si("contexto: palomita animada", /class="fic ctx hecho palomea"><span class="ok">✓ Contexto/.test(c.vFaltaInfo(T2)));
while (corre()) {}
eq("al final: 'Anoté… Solo me falta…' y lo hecho tenue", T2.msgs.slice(-1)[0].t, "Anoté: contexto. Solo me falta: la fecha de finiquito (o si es indefinida), el próximo seguimiento.");
si("ya sin animación: contexto tenue", /class="fic ctx hecho"><span class="ok">/.test(c.vFaltaInfo(T2)) && /Solo me falta/.test(c.vFaltaInfo(T2)));
si("CSS: animación palomita (palPop) y respeta reducir movimiento", /@keyframes palPop/.test(html) && /prefers-reduced-motion:reduce\)\{\.chk li\.palomea/.test(html));
si("VERSION_APP build 208", /var VERSION_APP = "build 208/.test(html));
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
