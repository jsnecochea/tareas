#!/usr/bin/env node
/* PRUEBAS build 204 (Salvador 2026-10-04 21:04-21:10): 1) "¿Te lo agendo?" solo para hoy en adelante (caso real
   "Fideicomiso: seguimiento con BBVA": "el 28-sep" sin año se leía como 28-sep-2027); 2) de dónde nació la tarea
   (caso "Migración Scotia Online"); 3) clip verde; 4) selección múltiple en Archivos (Apartar / Copiar);
   5) un solo cuadro de Contexto. Núcleo de fechas REAL. Correr: TZ=America/Monterrey node tests/b204.test.js */
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
var FUNCS = F_FUNCS.concat([ "_bpega", "viva249", "personasPara", "resuelveDestino", "buscaContactos249", "contactosApp", "nombreWA", "nombresExactosWA", "sinResultado", "ordenesImposibles", "ordenCondicional", "ejecutaCond", "resuelveCond", "eventoDicho", "venceCond", "_diaAntes", "mostrarAcomoda", "ocultaAcomoda", "liberaAcomoda", "preguntas249", "abrePreguntas", "esPersonaQ", "palTema", "temaComun", "esCerradaReciente", "nombreVinc", "preguntaQuienYaResuelta", "aplicaLecturaFechas", "lecturaFechas", "_hitsFecha", "cierraDeEvento", "pasosSeguimiento", "armaMensajesSeguimiento", "reintentaDudas", "eventoDe", "eventoPendiente", "completitud", "contextoPct", "contextoDe", "tipoItem", "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion",
  "fechaPuestaSola", "origenDe", "lineaOrigen", "vDetalle", "adjuntos", "fuenteAdj", "apartaAdjuntos", "copiaAdjuntos", "corta40", "palabrasClave", "palabrasBusqueda", "_sinGrupo", "_bst", "_bw"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["MODO_CEREBRO", "TIPOS_ORDEN251", "ESTADO_COND250", "EMPRESAS248", "CITA_RE", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS"]);
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var RealDate = Date, NOW = new RealDate(2026, 9, 4, 21, 10, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
  return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var falta = false;
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, Intl: Intl, isNaN: isNaN, parseInt: parseInt,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, cynthia: { nombre: "Cynthia" } }, tareas: [], window: {},
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); },
  fechaCorta: function () { return "1 oct · 19:03"; }, hhmm: function () { return "21:10"; }, guarda: function (t) { (c._guardadas = c._guardadas || []).push(t.id); },
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); }, tipoRevisar: function () { return falta ? "falta" : null; },
  estadoReal: function (t) { return t.estado || "abierta"; }, esRecurrente: function () { return false; }, contactosWA: function () { return []; } };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }

/* 1 agendar solo hoy en adelante — forma real de t1790622121475 (leída con el conector 2026-10-04) */
var BBVA = { id: "t1790622121475", nombre: "Fideicomiso: seguimiento con BBVA", duenio: "salvador", creada_por: "salvador", creada: 1790622121475, estado: "abierta", f_vigente: "2026-10-05",
  msgs: [{ h: "13:05", k: "bi", t: "Reunion virtual con BBVA el 28-sep: aceptaron el memorandum y se comprometieron a corregir el contrato. Quedaron de mandarlo completo a mas tardar el lunes 5 de octubre para que lo revises antes de firmar." }] };
var evB = c.eventoDe(BBVA);
eq("BBVA: la fecha leída es el 28-sep de 2026 (el año que no se dijo es el más cercano a cuando nació), no 2027", evB && evB.fecha, "2026-09-28");
eq("y como ya pasó, no se pregunta ni sale en el checklist", [c.eventoPendiente(BBVA), c.completitud(BBVA).items.some(function (x) { return x.k === "agenda"; })], [false, false]);
var FUT = { id: "tF", nombre: "Cita con el dentista", duenio: "salvador", creada_por: "salvador", creada: NOW - 3600000, estado: "abierta", msgs: [{ k: "bo", t: "La abriste dictando: “cita con el dentista el 12 de octubre a las 5 de la tarde”" }] };
eq("futura sin año: sí (12-oct-2026)", [c.eventoDe(FUT).fecha, c.eventoPendiente(FUT)], ["2026-10-12", true]);
var ENE = { id: "tE", nombre: "Junta anual", duenio: "salvador", creada_por: "salvador", creada: NOW - 3600000, estado: "abierta", msgs: [{ k: "bo", t: "La abriste dictando: “junta anual el 15 de enero a las 10”" }] };
eq("enero dicho en octubre: el más cercano es enero que entra (2027)", c.eventoDe(ENE).fecha, "2027-01-15");
var ANO = { id: "tA", nombre: "Boda en 2027", duenio: "salvador", creada_por: "salvador", creada: NOW, estado: "abierta", msgs: [{ k: "bo", t: "La abriste dictando: “boda el 28 de septiembre de 2027 a las 7”" }] };
eq("si el año SÍ se dijo, se respeta", c.eventoDe(ANO).fecha, "2027-09-28");

/* 2 origen — forma real de tSCOTIA_MIGRACION_011026 */
var SCOTIA = { id: "tSCOTIA_MIGRACION_011026", nombre: "Migración Scotia Online", tarea: "Migración Scotia Online", creada_por: "claude", duenio: "salvador", estado: "abierta", creada: 1790903291510, f_vigente: "2026-10-07",
  msgs: [{ k: "bal", h: "19:03", ts: 1790903291510, t: "DATO (correo, Scotiabank, 1-oct 14:01 hora Monterrey): avisan que el 'classic Scotia online' se da de baja…",
    analisis: "Correo de scotiabank@email.scotiabank.com, asunto 'Classic Scotia online decommission', dirigido a Jose Salvador…" }] };
eq("Scotia: nació en un correo (y de quién)", c.origenDe(SCOTIA), { k: "correo", txt: "Correo · scotiabank@email.scotiabank.com" });
eq("revisor IA con su contacto", c.origenDe({ creada_por: "ia_revisor", origen: "wa_revisor", wa_contacto: "Rogelio Sada", msgs: [] }).txt, "Revisor IA · WhatsApp de Rogelio Sada");
eq("WhatsApp de quien escribió", c.origenDe({ id: "tBARDA_MANUEL_031026", creada_por: "claude", msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: van las medidas" }] }).txt, "WhatsApp de Manuel Parra");
eq("tarea con id wa_ sin contacto", c.origenDe({ id: "wa_abbea09d95fd8a79", msgs: [] }).txt, "WhatsApp");
eq("Claude (chat)", c.origenDe({ creada_por: "claude", msgs: [{ k: "bi", t: "Pendiente de la plática" }] }).txt, "Claude (chat)");
eq("Doit a mano (tuya / de otra persona)", [c.origenDe({ creada_por: "salvador", msgs: [] }).txt, c.origenDe({ creada_por: "cynthia", msgs: [] }).txt], ["Doit (a mano)", "Doit (a mano · Cynthia)"]);
eq("sin datos: no se inventa", c.origenDe({ msgs: [] }), null);
var det = c.vDetalle(SCOTIA, "");
si("en 'Creada con' del ▾, chico y de otro color", /<div class="orgn">Nació en: Correo · scotiabank@email\.scotiabank\.com<\/div>/.test(det));
si("y antes del primer mensaje del chat", /var m=lineaOrigen\(t, "orgn ench"\);/.test(html) && /\.orgn\{font-size:12\.5px;color:#64d2ff/.test(html));

/* 5 un solo cuadro de contexto */
falta = false; si("sin Falta info: el ▾ trae su Contexto", /class="dctx"/.test(c.vDetalle(SCOTIA, "")));
falta = true; si("con la tarjeta de Falta info visible, el ▾ ya NO repite el Contexto (uno solo)", !/class="dctx"/.test(c.vDetalle(SCOTIA, "")) && /Creada con/.test(c.vDetalle(SCOTIA, "")));
falta = false;

/* 3 clip verde */
si("el clip sale SOLO si hay archivos, con la cantidad (233)", /\(adj\.length\?'<button class="iconbtn hb233" id="bgal"/.test(html) && /'<span class="cnt cnt233">'\+adj\.length\+'<\/span>/.test(html));

/* 4 archivos: apartar y copiar */
var T1 = { id: "tUNO", nombre: "Invitaciones", msgs: [{ k: "bi", t: "Papá: invitación", url: "https://x/inv.jpg", tipo: "foto", ts: 1 }, { k: "bi", t: "Papá: meme político", url: "https://x/meme.jpg", tipo: "foto", ts: 2 }, { k: "bi", t: "texto" }],
  evidencias: [{ data: "data:image/jpeg;base64,AAA", ts: 3, de: "Salvador" }] };
var A1 = c.adjuntos(T1);
eq("cada archivo sabe de dónde viene", A1.map(function (f) { return f.ref; }), ["ms:0", "ms:1", "ev:0"]);
eq("apartar 1: deja de salir en Archivos, pero sigue guardado", [c.apartaAdjuntos(T1, ["ms:1"]), c.adjuntos(T1).length, T1.msgs[1].apartado, !!T1.msgs[1].url], [1, 2, true, true]);
si("y queda la nota en la tarea", /^Aparté 1 archivo de esta tarea \(no se borra: quedan guardados\)\.$/.test(T1.msgs.slice(-1)[0].t));
var D = { id: "tDOS", nombre: "Fiesta 13 nov", msgs: [] };
eq("copiar 2 a otra tarea (foto de WhatsApp + evidencia)", [c.copiaAdjuntos(T1, ["ms:0", "ev:0"], D), D.msgs.filter(function (x) { return x.url; }).length, (D.evidencias || []).length, c.adjuntos(D).length], [2, 1, 1, 2]);
si("el original se queda donde estaba", c.adjuntos(T1).length === 2);
eq("copiar a la misma tarea: nada", c.copiaAdjuntos(T1, ["ms:0"], T1), 0);
si("presión larga (0.5 s) activa la selección; Apartar y Copiar a otra tarea con íconos de línea", /setTimeout\(function\(\)\{ larga=true; window\.__galSel=\{tid:t\.id, sel:\{\}\}/.test(html) && /ico\("caja",18,1\.7\)\+'Apartar</.test(html) && /ico\("copia",18,1\.7\)\+'Copiar a otra tarea</.test(html) && /abreCopiarA\(t, refs\)/.test(html));
si("Apartar pide confirmación y dice que no se borra nada", /No se borra nada: quedan guardados\./.test(html));
si("VERSION_APP build 204 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 204);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
