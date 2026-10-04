#!/usr/bin/env node
/* PRUEBAS build 199: WhatsApp PROGRAMADOS dentro de Doit. Etiquetas que entiende la Mac (v16):
   [A LAS AAAA-MM-DD HH:MM] y [SI NO CONTESTA DESDE AAAA-MM-DD HH:MM]. Reloj fijo: domingo
   4-oct-2026 16:15 (Monterrey). Correr: TZ=America/Monterrey node tests/programados.test.js */
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
function bloque(a, b) { var i = html.indexOf(a), j = html.indexOf(b); return html.slice(i, j + b.length); }
var FUNCS = ["iso", "dm", "dDif", "dmDe", "masMeses", "hoy", "fechaMovCorta", "fechaBonita", "_nn", "horaDicha", "limpiaHoraDictada", "horaValor",
  "parteDelDia", "nowHM", "_hm", "_tsDe", "_sacaFrases", "cuandoDe", "programaWA", "etiquetasWA", "quitaEtiquetasWA", "horaCorta",
  "textoProgramado", "mandaProgramado", "cancelaProgramado", "_corto"];
var VARS = ["NUMREL", "NUMHORA", "RANGO_PARTE", "WA_VERBO", "WA_DIA", "WA_HORA", "WA_TIEMPO", "WA_SINO"];
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");

var RealDate = Date, NOW = new RealDate(2026, 9, 4, 16, 15, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var pedidos = [], marcas = [];
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, isNaN: isNaN, parseInt: parseInt,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador" } }, vista: "lista", abierta: null,
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); }, guarda: function () {}, render: function () {}, toast: function () {},
  pideWhatsApp: function (cpo) { pedidos.push(cpo); return Promise.resolve({ id: "p" + pedidos.length }); },
  llamaPush: function (a, b) { marcas.push([a, b]); } };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
function resumen(p) { return p ? { contacto: p.contacto, texto: p.texto, a_las: p.a_las, sino: p.sino_desde, seg: p.seguimiento, duda: p.duda } : null; }

/* ---------- frases ---------- */
eq("mañana a las 8", resumen(c.programaWA("mándale a Carlos mañana a las 8 que me pase el presupuesto", NOW)),
  { contacto: "Carlos", texto: "Me pase el presupuesto", a_las: { fecha: "2026-10-05", hora: "08:00" }, sino: null, seg: null, duda: "" });
eq("el lunes a las 9", resumen(c.programaWA("dile a Josué el lunes a las 9 que revise el servidor", NOW)),
  { contacto: "Josué", texto: "Revise el servidor", a_las: { fecha: "2026-10-05", hora: "09:00" }, sino: null, seg: null, duda: "" });
eq("a las 12 si no ha contestado (condicional)", resumen(c.programaWA("a las 12 si no ha contestado recuérdale a Carlos que me mande la cotización", NOW)),
  { contacto: "Carlos", texto: "Me mande la cotización", a_las: { fecha: "2026-10-05", hora: "12:00" }, sino: { fecha: "2026-10-04", hora: "16:15" }, seg: null, duda: "" });
eq("y si no contesta, insístele a las 5 (par)", resumen(c.programaWA("mándale a Carlos que me pase el precio del portón, mañana a las 8, y si no contesta, insístele a las 5", NOW)),
  { contacto: "Carlos", texto: "Me pase el precio del portón", a_las: { fecha: "2026-10-05", hora: "08:00" }, sino: null,
    seg: { a_las: { fecha: "2026-10-05", hora: "17:00" }, sino_desde: { fecha: "2026-10-05", hora: "08:00" }, texto: "" }, duda: "" });
eq("Claude, recuérdale a Samuel el martes a las 10", resumen(c.programaWA("Claude, recuérdale a Samuel el martes a las 10 que pida la grúa", NOW)),
  { contacto: "Samuel", texto: "Pida la grúa", a_las: { fecha: "2026-10-06", hora: "10:00" }, sino: null, seg: null, duda: "" });
eq("a las 7 de la noche (hoy)", c.programaWA("escríbele a Manuel Parra a las 7 de la noche que ya llegó el material", NOW).a_las, { fecha: "2026-10-04", hora: "19:00" });
eq("a las 11 de la noche se respeta (dictado)", c.programaWA("mándale a Josué a las 11 de la noche que reinicie la Mac", NOW).a_las, { fecha: "2026-10-04", hora: "23:00" });
eq("2 de noviembre a las 10", c.programaWA("dile a Chuy el 2 de noviembre a las 10 que ya pongan la decoración", NOW).a_las, { fecha: "2026-11-02", hora: "10:00" });
eq("insistencia con su propio texto", c.programaWA("dile a Carlos mañana a las 9 que me mande el contrato y si no contesta mándale a las 12 que es urgente", NOW).seguimiento,
  { a_las: { fecha: "2026-10-05", hora: "12:00" }, sino_desde: { fecha: "2026-10-05", hora: "09:00" }, texto: "Es urgente" });
var ld = c.programaWA("dile a Josué el lunes 4 a las 9 que revise", NOW);
si("candado de fechas: 'lunes 4' no cuadra -> UNA pregunta", ld.duda && /\?$/.test(ld.duda) && !ld.a_las);
si("sin hora en el seguimiento -> pregunta", /hora le insisto/.test(c.programaWA("mándale a Carlos mañana a las 8 que me pase el precio y si no contesta insístele", NOW).duda));
eq("pregúntale … si ya", resumen(c.programaWA("pregúntale a Manuel mañana a las 9 si ya tiene el precio", NOW)),
  { contacto: "Manuel", texto: "Si ya tiene el precio", a_las: { fecha: "2026-10-05", hora: "09:00" }, sino: null, seg: null, duda: "" });
eq("'esto' -> se usa el mensaje citado o el ultimo", c.programaWA("mándale a Carlos esto mañana a las 9", NOW).texto, "__ESTO__");
eq("sin hora ni 'si no contesta' -> camino de siempre (no programado)", c.programaWA("dile a Carlos que mañana no venga", NOW), null);
eq("'mañana' dentro del mensaje no programa", c.programaWA("mándale a Juan que mañana a las 8 pasa el camión", NOW), null);
eq("recuérdame (a mi) no es WhatsApp", c.programaWA("recuérdame mañana a las 8 pagar la luz", NOW), null);

/* ---------- etiquetas ---------- */
eq("etiquetas", c.etiquetasWA({ fecha: "2026-10-05", hora: "12:00" }, { fecha: "2026-10-05", hora: "08:00" }), "[A LAS 2026-10-05 12:00] [SI NO CONTESTA DESDE 2026-10-05 08:00] ");
si("las entiende la Mac v16 (mismo formato que RX_HORA / RX_SINO)", /^\[A LAS (\d{4}-\d{2}-\d{2}) (\d{1,2}):(\d{2})\]/.test(c.etiquetasWA({ fecha: "2026-10-05", hora: "08:00" })));
eq("se quitan al pintar", c.quitaEtiquetasWA("[A LAS 2026-10-05 12:00] [SI NO CONTESTA DESDE 2026-10-05 08:00] IA: hola"), "IA: hola");
eq("se quitan aunque vengan en medio", c.quitaEtiquetasWA("Carlos: [A LAS 2026-10-05 12:00] hola"), "Carlos: hola");
si("el render quita etiquetas en las burbujas", (html.match(/quitaEtiquetasWA\(/g) || []).length >= 4);

/* ---------- par condicional en la cola + chat sin etiquetas ---------- */
var t = { id: "tX", msgs: [] }, pg = c.programaWA("mándale a Carlos que me pase el precio del portón, mañana a las 8, y si no contesta, insístele a las 5", NOW);
c.mandaProgramado(t, pg, null);
eq("dos pedidos en la cola, al instante", pedidos.map(function (p) { return p.texto; }),
  ["[A LAS 2026-10-05 08:00] Me pase el precio del portón", "[A LAS 2026-10-05 17:00] [SI NO CONTESTA DESDE 2026-10-05 08:00] Te lo recuerdo: Me pase el precio del portón"]);
eq("burbujas: reloj, sin etiquetas", t.msgs.map(function (m) { return m.t; }),
  ["Programado · lun 5 oct 8:00 → Carlos: “Me pase el precio del portón”", "Programado · lun 5 oct 17:00 → Carlos · solo si no contesta: “Te lo recuerdo: Me pase el precio del portón”"]);
si("ningun texto guardado en la tarea trae etiquetas", !JSON.stringify(t).match(/\[A LAS|\[SI NO CONTESTA/));
setTimeout(function () {
  eq("id del pedido guardado para poder cancelar", t.msgs[0].wa_pid, "p1");
  c.cancelaProgramado(t, t.msgs[0]);
  eq("cancelar = wa_marca cerrado (el servidor ya lo tiene)", marcas, [["wa_marca", { id: "p1", estado: "cerrado" }]]);
  eq("queda marcado cancelado", t.msgs[0].prog.cancelado, true);
  var t2 = { id: "t2", msgs: [] }; c.pideWhatsApp = function () { return new Promise(function () {}); };
  vm.runInContext("pideWhatsApp=this.pideWhatsApp", c);
  c.mandaProgramado(t2, c.programaWA("dile a Josué el lunes a las 9 que revise el servidor", NOW), null);
  c.cancelaProgramado(t2, t2.msgs[0]);
  eq("cancelar antes de tener id: queda pendiente de cerrar al llegar el id", [t2.msgs[0].prog.cancelar, t2.msgs[0].prog.cancelado], [true, true]);
  si("barra: programado antes de Claude", html.indexOf("var _pgB=null; try{ _pgB=programaWA(texto)") > 0 && html.indexOf("var _pgB=null") < html.indexOf('hist.push("Persona: "+texto);'));
  si("hilo: programado antes de los canales", html.indexOf("var _pgH=null;") > 0 && html.indexOf("var _pgH=null;") < html.indexOf("var _cnA=canalActual(t)"));
  si("nota a Claude: se programa de verdad (F40)", /var _pgN=null; try\{ _pgN=programaWA\(v\); \}/.test(html));
  var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
  try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
  eq("el script de index.html compila", okc, true);
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
}, 20);
