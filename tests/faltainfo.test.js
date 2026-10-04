#!/usr/bin/env node
/* PRUEBAS build 201: "Falta info" tambien para tareas VIEJAS abiertas (fecha que nadie dicto, sin nada de
   contexto, o finiquito vencido sin ritmo ni recordatorio). Fixtures con la forma de las tareas reales
   CONSEJO_CUMBRES_REUNION_20260927 y JOSE_MIJARES_BARDA_20260927 (leidas con el conector 2026-10-04).
   Reloj fijo: domingo 4-oct-2026 17:00. Correr: TZ=America/Monterrey node tests/faltainfo.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var lineas = html.split("\n");
function saca(tipo, nombre) {
  var re = tipo === "function" ? new RegExp("^function " + nombre.replace(/\$/g, "\\$") + "\\(") : new RegExp("^var " + nombre + "\\s*=");
  var ini = -1;
  for (var i = 0; i < lineas.length; i++) if (re.test(lineas[i])) ini = i;
  if (ini < 0) throw new Error("no encontre " + tipo + " " + nombre);
  var out = [lineas[ini]];
  for (var k = ini + 1; k < lineas.length; k++) {
    var L = lineas[k];
    if (L.length && !/^[\s}\]]/.test(L)) break;
    out.push(L);
    if (/^}/.test(L)) break;
  }
  return out.join("\n");
}
var FUNCS = ["iso", "dDif", "dmDe", "hoy", "fechaMovCorta", "esRecurrente", "estadoReal", "esDecisionSal", "meDetiene", "creadaPorSistema",
  "porAutorizar", "faltaInfoRev", "msCreacion", "_fechaDeId", "diaMonterrey", "tipoRevisar", "completitud", "contextoPct", "contextoDe",
  "tipoItem", "esDato", "_nn", "_diaCreacion", "fechaPuestaSola", "faltaVieja", "creadaCon", "faltaPrimero"];
var codigo = ["REV_DESDE", "CTX_MIN_PAL"].map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var RealDate = Date, NOW = new RealDate(2026, 9, 4, 17, 0, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var c = { Date: FakeDate, console: console, JSON: JSON, Math: Math, String: String, Object: Object, Array: Array, RegExp: RegExp, Number: Number, Intl: Intl,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, samuel: { nombre: "Samuel" } },
  esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, tareas: [] };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }

/* forma real (sin datos privados de mas) */
var CONSEJO = { id: "CONSEJO_CUMBRES_REUNION_20260927", tipo: "unica", creada_por: "claude", duenio: "salvador", f_original: "2026-09-27", f_vigente: "2026-09-27", estado: "abierta",
  nombre: "Agendar Reunión Consejo Colonia Cumbres", tarea: "Agendar reunión del Consejo de la Colonia Cumbres con los consejeros — de preferencia jueves a cenar o viernes a comer",
  msgs: [{ k: "bal", aviso: 1, t: "¿Para cuándo agendas la reunión con el Consejo Colonia Cumbres? Lleva 7 días vencida.", ts: NOW - 3600000 }] };
var MIJARES = { id: "JOSE_MIJARES_BARDA_20260927", tipo: "unica", creada_por: "claude", duenio: "salvador", f_original: "2026-09-27", f_vigente: "2026-09-27", estado: "abierta",
  nombre: "José Mijares - Barda Terreno Cumbres", tarea: "Hablarle a José Mijares para ver si puede bardear el terreno que tiene sin barda dentro del fraccionamiento Cumbres",
  msgs: [{ k: "bal", aviso: 1, t: "Necesito fecha de la barda de José Mijares en Cumbres o qué la traba.", ts: NOW - 3600000 }] };

/* 1 por que no salian (build 195) */
eq("id _AAAAMMDD ahora da su dia de creacion", new RealDate(c._fechaDeId(CONSEJO.id)).toISOString().slice(0, 10), "2026-09-27");
eq("id viejo _DDMMAA sigue igual", new RealDate(c._fechaDeId("tCOMEDOR_NUEVO_300926")).toISOString().slice(0, 10), "2026-09-30");
eq("no eran 'nuevas' (antes del 2-oct) ni traian pendiente_info", [c.porAutorizar(CONSEJO), c.faltaInfoRev(CONSEJO)], [false, false]);

/* 2 la fecha nadie la dicto */
si("Consejo: fecha puesta sola (creada por Claude con la fecha de su propio dia)", c.fechaPuestaSola(CONSEJO));
si("Mijares: igual", c.fechaPuestaSola(MIJARES));

/* 3 ahora si salen */
eq("Consejo en Falta info, por finiquito", [c.tipoRevisar(CONSEJO), c.faltaVieja(CONSEJO)], ["falta", "finiquito"]);
eq("Mijares en Falta info, por finiquito", [c.tipoRevisar(MIJARES), c.faltaVieja(MIJARES)], ["falta", "finiquito"]);
eq("y el renglon dice 'falta finiquito'", c.faltaPrimero(c.completitud(CONSEJO)).txt, "falta finiquito");
si("su descripcion con que nacio cuenta como contexto (ya no 'Todavía no tengo contexto')", /Consejo de la Colonia Cumbres/.test(c.contextoDe(CONSEJO)));

/* salen de Falta info en cuanto se completa */
var c2 = JSON.parse(JSON.stringify(CONSEJO)); c2.fecha_dictada = true; c2.f_vigente = "2026-10-09"; c2.ritmo = "";
eq("con fecha dictada a futuro ya no", c.tipoRevisar(c2), null);
var c3 = JSON.parse(JSON.stringify(CONSEJO)); c3.movimientos = [{ de: "2026-09-27", a: "2026-10-01" }]; c3.f_vigente = "2026-10-01";
eq("movida por una persona pero ya vencida sin ritmo -> falta seguimiento", c.faltaVieja(c3), "seguimiento");
c3.ritmo = "Cada lunes le pregunto a Enrique si ya tiene fecha para la reunión del consejo";
eq("con ritmo ya no", c.faltaVieja(c3), "");
var c4 = JSON.parse(JSON.stringify(c3)); c4.ritmo = ""; c4.avisos = [{ fecha: "2026-10-06" }];
eq("con recordatorio por delante ya no", c.faltaVieja(c4), "");
var c5 = JSON.parse(JSON.stringify(CONSEJO)); c5.indefinida = true;
eq("indefinida: la fecha no es finiquito", c.faltaVieja(c5), "");

/* lo que NO debe entrar */
var dictada = { id: "tmukoa8i69fyns", creada_por: "salvador", duenio: "salvador", f_original: "2026-09-29", f_vigente: "2026-11-01", estado: "abierta", nombre: "Hablar con José Mijares",
  creada: new RealDate(2026, 8, 28, 21, 13).getTime(), movimientos: [{ de: "2026-09-29", a: "2026-11-01" }],
  msgs: [{ k: "bi", t: "La abriste dictando: “Tengo que hablarle yo mismo a José Mijares, no es un encargo para nadie del equipo, es solo una tarea mía”. Se cierra con: hablé con él", ts: 1 }] };
eq("dictada por Salvador con fecha a futuro y contexto: no entra", c.tipoRevisar(dictada), null);
var sinCtx = { id: "tX", creada_por: "salvador", duenio: "salvador", f_vigente: "2026-10-20", estado: "abierta", nombre: "Pago predial", msgs: [{ k: "bo", t: "pago predial", ts: 1 }], fecha_dictada: true };
eq("sin nada de contexto: entra por contexto", c.faltaVieja(sinCtx), "contexto");
var deOtro = JSON.parse(JSON.stringify(CONSEJO)); deOtro.duenio = "samuel"; deOtro.creada_por = "claude";
eq("de otra persona: no entra en MI Falta info", c.faltaVieja(deOtro), "");
var cerrada = JSON.parse(JSON.stringify(CONSEJO)); cerrada.cierre = { tipo: "hecha", f: "2026-10-01" };
eq("cerrada: no", c.tipoRevisar(cerrada), null);
var rec = JSON.parse(JSON.stringify(CONSEJO)); rec.es_recordatorio = true;
eq("recordatorio suelto: no", c.faltaVieja(rec), "");
var dato = JSON.parse(JSON.stringify(CONSEJO)); dato.es_dato = true;
eq("dato: no", c.faltaVieja(dato), "");

si("mover la fecha o dictarla la marca como dictada", /t\.fecha_dictada=true;   \/\* build 201/.test(html) && /t\.fecha_dictada=!!_cf\.dictada;/.test(html));
si("sin lookbehind (iPhone viejos)", html.indexOf("(?<=") < 0);
var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
eq("el script de index.html compila", okc, true);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
