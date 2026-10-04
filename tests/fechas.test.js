#!/usr/bin/env node
/* PRUEBAS DE FECHAS de Doit (build 190). Correr:  node tests/fechas.test.js
   Saca las funciones de fechas TAL CUAL de index.html (no copia nada) y las corre con
   un "ahora" fijo inyectado (Date falso). Se corre en 3 zonas horarias: Monterrey (la de
   Salvador, UTC-6 sin horario de verano), UTC y Kiritimati (UTC+14): las respuestas
   tienen que ser iguales en las tres, porque todo se calcula en hora LOCAL.
   CONVENCION (la misma que el comentario @@FECHAS-INICIO de index.html):
   - "el lunes" = "este lunes" = "el proximo lunes" = "el lunes que viene" = el lunes mas
     cercano que viene, sin contar hoy. Domingo 00:41 -> lunes 5-oct. Lunes -> el de la otra.
   - dia + numero tienen que cuadrar los dos; si no, DUDA (una pregunta), nunca se adivina.
   - MANDA LA FECHA DICTADA: lo que proponga Claude solo se guarda si cuadra con lo dictado. */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm"), cp = require("child_process");

var ZONAS = ["America/Monterrey", "UTC", "Pacific/Kiritimati"];
if (!process.env.__FECHAS_HIJO) {
  var total = 0, malas = 0;
  ZONAS.forEach(function (z) {
    var r = cp.spawnSync(process.execPath, [__filename], {
      env: Object.assign({}, process.env, { TZ: z, __FECHAS_HIJO: "1" }), encoding: "utf8" });
    process.stdout.write(r.stdout || ""); process.stderr.write(r.stderr || "");
    var m = String(r.stdout || "").match(/RESULTADO (\d+)\/(\d+)/);
    if (!m || r.status !== 0) { malas++; total++; console.log("FALLO la corrida en " + z); }
    else { total += +m[2]; malas += (+m[2] - +m[1]); }
  });
  console.log("\nTOTAL: " + (total - malas) + "/" + total + " pasan (3 zonas horarias)");
  process.exit(malas ? 1 : 0);
}

/* ---------- sacar el codigo de index.html ---------- */
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var lineas = html.split("\n");
/* una funcion o var de nivel superior: empieza en la columna 0 y termina en la linea "}"
   de columna 0, o justo antes de la siguiente linea que empieza en columna 0. Si el
   nombre se define dos veces, gana la ULTIMA (igual que en el navegador). */
function saca(tipo, nombre) {
  var re = tipo === "function" ? new RegExp("^function " + nombre.replace(/\$/g, "\\$") + "\\(")
                               : new RegExp("^var " + nombre + "\\s*=");
  var ini = -1;
  for (var i = 0; i < lineas.length; i++) if (re.test(lineas[i])) ini = i;
  if (ini < 0) throw new Error("no encontre " + tipo + " " + nombre + " en index.html");
  var out = [lineas[ini]];
  for (var k = ini + 1; k < lineas.length; k++) {
    var L = lineas[k];
    if (L.length && !/^[\s}]/.test(L)) break;      /* siguiente cosa de nivel superior */
    out.push(L);
    if (/^}/.test(L)) break;
  }
  return out.join("\n");
}
function bloque(a, b) {
  var i = html.indexOf(a), j = html.indexOf(b);
  if (i < 0 || j < 0) throw new Error("no encontre el bloque " + a);
  return html.slice(i, j + b.length);
}
var FUNCS = ["iso", "dm", "dDif", "dmDe", "masMeses", "hoy", "fechaMovCorta", "fechaBonita",
  "esMovida", "soloFecha", "_nrm", "fechaEnTexto", "diaDicho", "diasDichos", "horaDicha",
  "limpiaHoraDictada", "horaValor", "cadaDicho", "relativoDicho", "horaCercana", "parteDelDia",
  "nowHM", "proximaFranja", "horaEnParte", "franjaVaga", "armaCuando", "normalizaCada",
  "calendarioProximo", "mueveFecha", "aplicaNotaClaude"];
var VARS = ["NUMREL", "NUMHORA", "RANGO_PARTE", "DIAS_SEM"];
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" +
  VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" +
  FUNCS.map(function (f) { return saca("function", f); }).join("\n");
new vm.Script(codigo, { filename: "fechas-extraidas.js" });   /* que compile */

/* ---------- "ahora" inyectado ---------- */
function contexto(y, mo, d, h, mi) {
  var RealDate = Date, NOW = new RealDate(y, mo - 1, d, h, mi, 0).getTime();
  function FakeDate() {
    var a = Array.prototype.slice.call(arguments);
    if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
    return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW);
  }
  FakeDate.prototype = RealDate.prototype;
  FakeDate.now = function () { return NOW; };
  FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
  var ctx = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String,
    Number: Number, RegExp: RegExp, Array: Array, Object: Object, isNaN: isNaN, parseInt: parseInt,
    yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador" } }, window: {},
    msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); },
    guarda: function () {}, sincronizaAvisos: function () {}, muestraDeshacer: function () {} };
  vm.createContext(ctx);
  vm.runInContext(codigo, ctx);
  return ctx;
}

/* ---------- casos ---------- */
var ok = 0, n = 0, fallas = [];
function eq(nom, got, exp) {
  n++;
  var a = JSON.stringify(got), b = JSON.stringify(exp);
  if (a === b) ok++; else fallas.push(nom + "\n      dio:    " + a + "\n      espera: " + b);
}
function si(nom, cond) { eq(nom, !!cond, true); }

var AHORAS = {
  sab2350: [2026, 10, 3, 23, 50],   /* sabado 3-oct 23:50 */
  dom0041: [2026, 10, 4, 0, 41],    /* domingo 4-oct 00:41 (UTC ya es 06:41) */
  lun0900: [2026, 10, 5, 9, 0],     /* lunes 5-oct */
  mie1000: [2026, 10, 7, 10, 0],    /* miercoles 7-oct */
  sab1226: [2026, 12, 26, 10, 0],   /* sabado 26-dic: cambio de año */
  sab0227: [2027, 2, 27, 10, 0]     /* sabado 27-feb-2027: fin de mes corto */
};
/* [texto, {ahora: fecha esperada | "DUDA" | null}] ; fecha = fechaDictada().fecha */
var T = [
  ["el lunes",               { sab2350: "2026-10-05", dom0041: "2026-10-05", lun0900: "2026-10-12", mie1000: "2026-10-12", sab1226: "2026-12-28", sab0227: "2027-03-01" }],
  ["este lunes",             { sab2350: "2026-10-05", dom0041: "2026-10-05", lun0900: "2026-10-12" }],
  ["el próximo lunes",       { sab2350: "2026-10-05", dom0041: "2026-10-05", lun0900: "2026-10-12", mie1000: "2026-10-12" }],
  ["el proximo lunes",       { dom0041: "2026-10-05" }],
  ["el lunes que viene",     { sab2350: "2026-10-05", dom0041: "2026-10-05", lun0900: "2026-10-12" }],
  ["Claude Esta tarea es indefinida de fecha pero el próximo ritmo es el lunes", { dom0041: "2026-10-05" }],
  ["hoy",                    { sab2350: "2026-10-03", dom0041: "2026-10-04", lun0900: "2026-10-05", sab1226: "2026-12-26" }],
  ["mañana",                 { sab2350: "2026-10-04", dom0041: "2026-10-05", sab1226: "2026-12-27", sab0227: "2027-02-28" }],
  ["manana",                 { dom0041: "2026-10-05" }],
  ["pasado mañana",          { sab2350: "2026-10-05", dom0041: "2026-10-06", sab0227: "2027-03-01" }],
  ["el martes",              { sab2350: "2026-10-06", dom0041: "2026-10-06", lun0900: "2026-10-06", mie1000: "2026-10-13" }],
  ["recuérdame el martes de darle seguimiento", { sab2350: "2026-10-06", dom0041: "2026-10-06" }],
  ["el miércoles",           { sab2350: "2026-10-07", dom0041: "2026-10-07", lun0900: "2026-10-07", mie1000: "2026-10-14" }],
  ["el miercoles",           { dom0041: "2026-10-07" }],
  ["el próximo miércoles",   { dom0041: "2026-10-07", mie1000: "2026-10-14" }],
  ["el jueves",              { dom0041: "2026-10-08", mie1000: "2026-10-08" }],
  ["el viernes",             { dom0041: "2026-10-09", sab1226: "2027-01-01" }],
  ["el sábado",              { sab2350: "2026-10-10", dom0041: "2026-10-10" }],
  ["el sabado",              { dom0041: "2026-10-10" }],
  ["el domingo",             { sab2350: "2026-10-04", dom0041: "2026-10-11" }],
  ["el MIÉRCOLES",           { dom0041: "2026-10-07" }],
  ["el martes de la próxima semana", { sab2350: "2026-10-06", lun0900: "2026-10-13" }],
  ["el lunes de la otra semana",     { dom0041: "2026-10-05", lun0900: "2026-10-12", mie1000: "2026-10-12" }],
  ["la próxima semana",      { dom0041: "2026-10-11" }],
  /* dia + numero */
  ["el miércoles 7",         { sab2350: "2026-10-07", dom0041: "2026-10-07", mie1000: "2026-10-07" }],
  ["el miercoles 7 de octubre", { dom0041: "2026-10-07" }],
  ["el sábado 10",           { sab2350: "2026-10-10", dom0041: "2026-10-10" }],
  ["el lunes 5",             { dom0041: "2026-10-05" }],
  ["miércoles 4",            { dom0041: "2026-11-04" }],   /* 4-oct es domingo; 4-nov SI es miercoles */
  ["el lunes 4",             { dom0041: "DUDA" }],         /* ningun lunes 4 en ~2 meses */
  ["el lunes 7",             { dom0041: "DUDA" }],         /* lo que puso Claude en el caso real */
  ["el jueves 5",            { dom0041: "2026-11-05" }],
  ["el miércoles 5 de noviembre", { dom0041: "DUDA" }],    /* 5-nov es jueves */
  ["el lunes 2 de noviembre", { dom0041: "2026-11-02" }],
  ["el domingo 4",           { dom0041: "2026-10-04" }],   /* hoy cuenta */
  ["el viernes 1",           { sab1226: "2027-01-01" }],
  ["el lunes 1",             { sab0227: "2027-03-01" }],
  /* con mes */
  ["el 2 de noviembre",      { sab2350: "2026-11-02", dom0041: "2026-11-02", sab1226: "2027-11-02" }],
  ["esta tarea es para el 2 de noviembre", { sab2350: "2026-11-02" }],
  ["2 de nov",               { dom0041: "2026-11-02" }],
  ["2-nov",                  { dom0041: "2026-11-02" }],
  ["15 de enero",            { dom0041: "2027-01-15", sab1226: "2027-01-15", sab0227: "2028-01-15" }],
  ["el 3 de octubre",        { dom0041: "2027-10-03", sab2350: "2026-10-03" }],
  ["31 de noviembre",        { dom0041: "DUDA" }],
  ["29 de febrero",          { sab0227: "DUDA", sab1226: "DUDA" }],
  ["el 28 de febrero",       { sab0227: "2027-02-28" }],
  ["2026-11-02",             { dom0041: "2026-11-02" }],
  ["miércoles 2026-10-08",   { dom0041: "DUDA" }],         /* 8-oct es jueves */
  /* el N */
  ["el 15",                  { dom0041: "2026-10-15", sab1226: "2027-01-15" }],
  ["para el día 15",         { dom0041: "2026-10-15" }],
  ["el 31",                  { dom0041: "2026-10-31", sab0227: "2027-03-31" }],
  ["el 4",                   { dom0041: "2026-10-04" }],
  /* relativas */
  ["en 15 días",             { dom0041: "2026-10-19", sab1226: "2027-01-10" }],
  ["en dos semanas",         { dom0041: "2026-10-18" }],
  ["en 2 semanas",           { sab0227: "2027-03-13" }],
  ["en un mes",              { dom0041: "2026-11-04", sab1226: "2027-01-26" }],
  ["fin de mes",             { dom0041: "2026-10-31", sab1226: "2026-12-31", sab0227: "2027-02-28" }],
  ["a fin de mes",           { sab0227: "2027-02-28" }],
  /* recurrentes: la primera vez */
  ["cada lunes",             { dom0041: "2026-10-05", lun0900: "2026-10-12" }],
  ["cada 15 días",           { dom0041: null }],
  /* HORA, nunca dia */
  ["a las 10",               { dom0041: null }],
  ["10:30",                  { dom0041: null }],
  ["a las 10 de la mañana",  { dom0041: null }],
  ["mañana a las 10",        { dom0041: "2026-10-05" }],
  ["hoy a las 10 de la mañana", { dom0041: "2026-10-04" }],
  ["el lunes a las 10",      { dom0041: "2026-10-05" }],
  ["el lunes a las 10:30",   { dom0041: "2026-10-05" }],
  ["el sábado a las 5",      { dom0041: "2026-10-10" }],
  ["en 2 horas",             { dom0041: null }],
  ["son 10 pesos",           { dom0041: null }],
  ["el 50% del anticipo",    { dom0041: null }],
  /* varias */
  ["quedamos hoy en que me manda el lunes", { dom0041: "2026-10-05" }],
  ["el lunes o el martes",   { dom0041: "2026-10-05" }],
  ["mañana lunes",           { dom0041: "2026-10-05" }],
  ["hoy domingo",            { dom0041: "2026-10-04" }]
];
Object.keys(AHORAS).forEach(function (k) {
  var c = contexto.apply(null, AHORAS[k]);
  T.forEach(function (row) {
    if (!(k in row[1])) return;
    var exp = row[1][k], r = c.fechaDictada(row[0]);
    var got = r.duda ? "DUDA" : r.fecha;
    eq("[" + k + "] fechaDictada(\"" + row[0] + "\")", got, exp);
    /* diaDicho/fechaMovida nunca contradicen (si hay duda, null) */
    if (exp === "DUDA") { eq("[" + k + "] fechaMovida en duda (\"" + row[0] + "\")", c.fechaMovida(row[0]), null);
                          si("[" + k + "] la duda es una pregunta corta (\"" + row[0] + "\")", /\?$/.test(r.duda) && r.duda.length < 120); }
  });
});

/* todos los dias de la semana, con y sin acento, en todas las frases, contra un calculo
   independiente (aritmetica UTC pura, no usa el codigo de la app) */
(function () {
  var DIAS = [["domingo"], ["lunes"], ["martes"], ["miércoles", "miercoles"], ["jueves"], ["viernes"], ["sábado", "sabado"]];
  var FRASES = ["el X", "este X", "el próximo X", "el proximo X", "el X que viene", "para el X", "X", "muévela al X"];
  Object.keys(AHORAS).forEach(function (k) {
    var a = AHORAS[k], c = contexto.apply(null, a), base = Date.UTC(a[0], a[1] - 1, a[2]), dw = new Date(base).getUTCDay();
    DIAS.forEach(function (nombres, wd) {
      var dl = (wd - dw + 7) % 7; if (dl === 0) dl = 7;
      var e = new Date(base + dl * 86400000).toISOString().slice(0, 10);
      nombres.forEach(function (nm) {
        FRASES.forEach(function (fr) {
          var tx = fr.replace("X", nm), r = c.fechaDictada(tx);
          eq("[" + k + "] \"" + tx + "\"", r.duda ? "DUDA" : r.fecha, e);
          eq("[" + k + "] \"" + tx.toUpperCase() + "\"", c.fechaDictada(tx.toUpperCase()).fecha, e);
        });
      });
    });
  });
})();

/* los nombres nuevos no chocan con otra funcion del archivo (en JS la ultima gana: asi
   fallo fechaLarga, que ya existia y regresaba HOY) */
(function () {
  var blk = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */"), nombres = [];
  blk.replace(/^function\s+([\w$]+)\s*\(/gm, function (_, nm) { nombres.push(nm); });
  nombres.push("aplicaNotaClaude");
  nombres.forEach(function (nm) {
    var veces = (html.match(new RegExp("^\\s*function\\s+" + nm.replace(/\$/g, "\\$") + "\\s*\\(", "gm")) || []).length;
    eq("una sola declaracion de " + nm, veces, 1);
  });
})();

/* el <script> principal completo compila */
(function () {
  var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
  var okc = false; try { new vm.Script(m[1], { filename: "index-script.js" }); okc = true; } catch (e) { console.log(e.message); }
  si("el script de index.html compila", okc);
})();

/* hoy() en Monterrey con el instante UTC real del caso 1 */
(function () {
  var c = contexto(2026, 10, 4, 0, 41);
  eq("hoy() domingo 00:41", c.hoy(), "2026-10-04");
  eq("dia de la semana de 2026-10-05 (local, no UTC)", c.fechaMovCorta("2026-10-05"), "lun 5 oct");
  eq("fechaBonita 2026-10-07", c.fechaBonita("2026-10-07"), "miércoles 7 de octubre");
  eq("fechaConDia 2026-11-02", c.fechaConDia("2026-11-02"), "lunes 2 de noviembre");
  eq("fechaMovCorta 2026-11-05", c.fechaMovCorta("2026-11-05"), "jue 5 nov");
  eq("masMeses 31-ene + 1", c.masMeses("2027-01-31", 1), "2027-02-28");
  eq("dmDe cruza año", c.dmDe("2026-12-31", 1), "2027-01-01");
  if (process.env.TZ === "America/Monterrey") {
    var RealDate = Date, inst = RealDate.UTC(2026, 9, 4, 6, 41);   /* 06:41Z = 00:41 MTY */
    eq("Monterrey: 06:41Z es domingo 4 local", c.iso(new RealDate(inst)), "2026-10-04");
    eq("Monterrey: Monterrey no tiene horario de verano (abril)", new RealDate(RealDate.UTC(2026, 3, 15, 12)).getTimezoneOffset(), 360);
  }
})();

/* diaDicho / diasDichos / armaCuando / esMovida */
(function () {
  var c = contexto(2026, 10, 4, 0, 41);
  eq("diaDicho('el lunes')", c.diaDicho("el lunes"), "2026-10-05");
  eq("diaDicho('2 de noviembre')", c.diaDicho("es para el 2 de noviembre"), "2026-11-02");
  eq("diaDicho('lunes 4') en duda", c.diaDicho("el lunes 4"), null);
  eq("diaDicho('hoy a las 10 de la mañana')", c.diaDicho("hoy a las 10 de la mañana"), "2026-10-04");
  eq("diasDichos('recuérdame el lunes y el miércoles')", c.diasDichos("recuérdame el lunes y el miércoles"), ["2026-10-05", "2026-10-07"]);
  eq("diasDichos('el martes y el jueves 8')", c.diasDichos("el martes y el jueves 8"), ["2026-10-06", "2026-10-08"]);
  eq("diasDichos con duda = []", c.diasDichos("el lunes 4 y el martes"), []);
  var a = c.armaCuando("recuérdame el martes a las 10 de la mañana");
  eq("armaCuando martes 10am", [a.fecha, a.hora], ["2026-10-06", "10:00"]);
  a = c.armaCuando("cada lunes a las 9 de la mañana");
  eq("armaCuando cada lunes", [a.fecha, a.hora, a.cada], ["2026-10-05", "09:00", "semanal"]);
  a = c.armaCuando("el lunes");
  eq("armaCuando el lunes (9:00)", [a.fecha, a.hora], ["2026-10-05", "09:00"]);
  a = c.armaCuando("a las 10");
  eq("armaCuando a las 10 = hoy", a.fecha, "2026-10-04");
  eq("cadaDicho cada 15 dias", c.cadaDicho("cada 15 días"), "quincenal");
  eq("normalizaCada quincenal", c.normalizaCada("quincenal"), "QUINCENAL");
  si("esMovida('el lunes')", c.esMovida("el lunes"));
  si("esMovida('para el 2 de nov')", c.esMovida("para el 2 de nov"));
  si("esMovida('el miércoles 7')", c.esMovida("el miércoles 7"));
  si("esMovida('muévela al jueves')", c.esMovida("muévela al jueves"));
  si("no esMovida('recuérdame el lunes')", !c.esMovida("recuérdame el lunes"));
  eq("fechaEnTexto('a las 10 y el 2 de noviembre')", c.fechaEnTexto("a las 10 y el 2 de noviembre"), "2026-11-02");
  var c31 = contexto(2026, 10, 31, 12, 0);
  eq("fechaEnTexto dicho un 31: '2 de noviembre' (antes daba diciembre)", c31.fechaEnTexto("2 de noviembre"), "2026-11-02");
  eq("fechaMovida dicho un 31: '30 de noviembre'", c31.fechaMovida("30 de noviembre"), "2026-11-30");
  var cal = c.calendarioProximo(3);
  eq("calendarioProximo domingo 00:41", cal, ["2026-10-04 domingo (HOY)", "2026-10-05 lunes (MAÑANA)", "2026-10-06 martes"]);
})();

/* CANDADO: lo que propone Claude contra lo dictado */
(function () {
  var c = contexto(2026, 10, 4, 0, 41), r;
  r = c.candadoFecha("el próximo ritmo es el lunes", "2026-10-07");
  eq("candado caso 1: Claude dijo 7-oct, se guarda lunes 5", [r.ok, r.fecha, r.corregida], [true, "2026-10-05", true]);
  r = c.candadoFecha("el próximo ritmo es el lunes", "2026-10-05");
  eq("candado: Claude acierta", [r.ok, r.fecha, r.corregida], [true, "2026-10-05", false]);
  r = c.candadoFecha("esta tarea es para el 2 de noviembre", "2026-11-05");
  eq("candado caso 2: Claude dijo 5-nov, se guarda 2-nov", [r.ok, r.fecha], [true, "2026-11-02"]);
  r = c.candadoFecha("el lunes 4", "2026-10-05");
  eq("candado: dictado en duda no guarda nada", [r.ok, r.fecha, !!r.duda], [false, null, true]);
  r = c.candadoFecha("sin fecha dicha", "2026-10-09");
  eq("candado: nada dictado, se acepta la de Claude", [r.ok, r.fecha, r.dictada], [true, "2026-10-09", false]);
  r = c.candadoFecha("sin fecha dicha", "2026-02-30");
  eq("candado: fecha imposible de Claude no entra", [r.ok, r.fecha], [false, null]);
  r = c.candadoFecha("el lunes y el miércoles", "2026-10-07");
  eq("candado: Claude toma la segunda dictada", [r.ok, r.fecha], [true, "2026-10-07"]);
  /* textos de Claude con fechas inventadas */
  eq("fechasRaras: 'miércoles 2026-11-05' no dictado", c.fechasRaras("final miércoles 2026-11-05", ["2026-11-02"]).length > 0, true);
  eq("fechasRaras: 'miércoles próximo (2026-10-08)'", c.fechasRaras("seguimiento miércoles próximo (2026-10-08)", ["2026-10-06"]).length > 0, true);
  eq("fechasRaras: lo dictado pasa", c.fechasRaras("final lunes 2 de noviembre", ["2026-11-02"]), []);
  si("traeFecha('Movida al lunes 7-oct')", c.traeFecha("Movida al lunes 7-oct"));
  si("no traeFecha('Anotado')", !c.traeFecha("Anotado, gracias"));
})();

/* CANDADO de la barra (aplicaIntencion) */
(function () {
  var c = contexto(2026, 10, 3, 23, 44), j, r;
  j = { intencion: "CREAR", tarea: { nombre: "Decoración Navideña Cumbres", fecha: "2026-11-05" } };
  r = c.candadoIntencion(j, "esta tarea es para el 2 de noviembre", []);
  eq("barra: tarea.fecha de Claude 5-nov -> 2-nov", [r.duda, j.tarea.fecha], ["", "2026-11-02"]);
  j = { intencion: "RECORDATORIO", recordatorio: { texto: "seguimiento", fecha: "2026-10-08" } };
  r = c.candadoIntencion(j, "recuérdame el martes de darle seguimiento", []);
  eq("barra: recordatorio 8-oct -> martes 6-oct", [r.duda, j.recordatorio.fecha], ["", "2026-10-06"]);
  j = { intencion: "CREAR", tarea: { nombre: "x", fecha: "2026-10-05" } };
  r = c.candadoIntencion(j, "para el lunes 4", []);
  si("barra: lunes 4 -> pregunta", r.duda && /\?$/.test(r.duda));
  j = { intencion: "SUPERVISAR", supervisar: { que: "x", fecha_ejecuta: "2026-10-07", mi_fecha: "2026-10-09" } };
  r = c.candadoIntencion(j, "que Juan lo haga el martes y yo lo reviso el jueves", []);
  eq("barra: supervisar fechas no dictadas se vacian (se pregunta)", [j.supervisar.fecha_ejecuta, j.supervisar.mi_fecha], ["", ""]);
  j = { intencion: "CREAR", tarea: { nombre: "x", fecha: "2026-10-12" } };
  r = c.candadoIntencion(j, "comprar focos", ["Persona: comprar focos", "Claude pregunto: ¿para cuándo?"]);
  eq("barra: nada dictado, se respeta la de Claude", j.tarea.fecha, "2026-10-12");
  j = { intencion: "CREAR", tarea: { nombre: "x", fecha: "2026-11-01" } };
  r = c.candadoIntencion(j, "un día antes del 2 de noviembre", []);
  eq("barra: 'un dia antes' deja la de Claude si esta cerca", j.tarea.fecha, "2026-11-01");
  j = { intencion: "CREAR", tarea: { nombre: "x", fecha: "2026-10-05" } };
  r = c.candadoIntencion(j, "el 5", ["Persona: para el lunes 4", "Claude pregunto: ¿cuál?"]);
  eq("barra: la respuesta a la duda ya no pregunta otra vez", [r.duda, j.tarea.fecha], ["", "2026-10-05"]);
  j = { intencion: "WHATSAPP", whatsapp: { texto: "nos vemos el lunes 4" } };
  r = c.candadoIntencion(j, "mándale a Juan que nos vemos el lunes 4", []);
  eq("barra: WhatsApp no se bloquea por la fecha del texto", r.duda, "");
})();

/* NOTA A CLAUDE (caso 1 real): Claude contesta {accion:fecha, valor:2026-10-07, respuesta:"Movida al lunes 7-oct"} */
(function () {
  var c = contexto(2026, 10, 4, 0, 41);
  var t = { id: "a", nombre: "Trend Rating aclaracion", f_vigente: "2026-10-03", msgs: [] };
  var tx = c.aplicaNotaClaude(t, "Claude Esta tarea es indefinida de fecha pero el próximo ritmo es el lunes",
    { accion: "fecha", valor: "2026-10-07", respuesta: "Movida al lunes 7-oct" });
  eq("nota caso 1: se guarda lunes 5", t.f_vigente, "2026-10-05");
  si("nota caso 1: el texto lo arma el codigo (dice lunes 5)", /lunes 5 de octubre/.test(tx) && !/7/.test(tx));
  si("nota caso 1: el mensaje Movida dice lun 5 oct", t.msgs.some(function (m) { return /Movida del sáb 3 oct al lun 5 oct/.test(m.t); }));
  t = { id: "b", nombre: "x", f_vigente: "2026-10-03", msgs: [] };
  tx = c.aplicaNotaClaude(t, "Claude muévela al lunes 4", { accion: "fecha", valor: "2026-10-05", respuesta: "Listo" });
  eq("nota en duda: no se mueve", t.f_vigente, "2026-10-03");
  si("nota en duda: pregunta", /\?/.test(tx));
  t = { id: "c", nombre: "Decoración Navideña Cumbres", f_vigente: "2026-10-03", msgs: [] };
  tx = c.aplicaNotaClaude(t, "Claude esta tarea es para el 2 de noviembre", { accion: "dato", valor: "Fecha final miércoles 2026-11-05", respuesta: "Anotado: miércoles 5-nov" });
  si("nota caso 2: dato con fecha inventada NO se guarda", !(t.datos_corregidos || []).length);
  si("nota caso 2: dice lo dictado (lunes 2 de noviembre)", /lunes 2 de noviembre/.test(tx));
  t = { id: "d", nombre: "x", f_vigente: "2026-10-03", msgs: [] };
  tx = c.aplicaNotaClaude(t, "Claude el precio es 1500 no 1800", { accion: "dato", valor: "Precio: $1,500", respuesta: "Anotado: precio $1,500" });
  eq("nota dato sin fechas se guarda", (t.datos_corregidos || []).length, 1);
  t = { id: "e", nombre: "x", f_vigente: "2026-10-03", msgs: [] };
  tx = c.aplicaNotaClaude(t, "Claude es para el 2 de noviembre", { accion: "fecha", valor: "2026-11-02", respuesta: "Para el miércoles 2 de nov" });
  eq("nota fecha correcta", t.f_vigente, "2026-11-02");
  si("nota: no copia el dia de la semana de Claude", !/mi[eé]rcoles/.test(tx) && /lunes 2 de noviembre/.test(tx));
  t = { id: "f", nombre: "x", f_vigente: "2026-10-03", msgs: [] };
  tx = c.aplicaNotaClaude(t, "Claude ya no se hace", { accion: "nada", valor: "", respuesta: "¿La muevo al jueves 9?" });
  si("nota: respuesta de Claude con fecha no se muestra tal cual", !/jueves 9/.test(tx));
})();

console.log((fallas.length ? "\n" + fallas.map(function (f) { return "  X " + f; }).join("\n") + "\n" : "") +
  "[" + process.env.TZ + "] RESULTADO " + ok + "/" + n);
process.exit(fallas.length ? 1 : 0);
