#!/usr/bin/env node
/* Conciliación Firestore → MySQL (mezclaFirestore + datosTareas.concilia).
   Caso real 8-oct: «Fiesta Cumpleaños Papá». El teléfono de Salvador seguía en Firestore (dictado 18:55 + hecho «Contexto»)
   y la Mac escribía en MySQL (mensajes de WhatsApp 18:19-18:20, _historico 18:04). Al pasar la app a MySQL nada se pierde:
   mensajes de los dos lados, gana lo tocado más reciente, la versión de Firestore queda en _fb_copia, y no se repite.
   Node puro. Correr: node tests/concilia.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var IDN = html.slice(html.indexOf("/* @@IDENTIDAD-INICIO"), html.indexOf("/* @@IDENTIDAD-FIN */"));   /* llamaServidor y su prueba de identidad: toda llamada al servidor pasa por ahí */
var i = html.indexOf("/* @@DATOS-TAREAS-INICIO"), j = html.indexOf("/* @@DATOS-TAREAS-FIN */");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var T = function (s) { return Date.parse(s); };
function arma() {
  var S = { tareas: {}, sets: [] }, F = { docs: {} };
  var c = { console: { warn: function () {}, error: function () {}, log: console.log }, JSON: JSON, Object: Object, Array: Array, String: String, Promise: Promise, Math: Math, Date: Date,
    encodeURIComponent: encodeURIComponent, URL: URL, window: { localStorage: null, addEventListener: function () {} },
    setTimeout: function () { return 0; }, clearTimeout: function () {}, APP_TOKEN: "tok", PUSH: "push.php", COL: "bitacora_tareas", yo: "salvador", PERSONAS: {}, toast: function () {},
    fetch: function (url, op) { var u = new URL("https://x/" + url), a = u.searchParams.get("action"), cu = op && op.body ? JSON.parse(op.body) : null;
      function r(j) { return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve(j); } }); }
      if (a === "fs_lista") return r(Object.keys(S.tareas).map(function (k) { return Object.assign({ id: k }, S.tareas[k]); }));
      if (a === "fs_set") { S.sets.push(cu.id); S.tareas[cu.id] = Object.assign({}, S.tareas[cu.id] || {}, cu.data); return r({ ok: true }); }
      return r({ ok: true }); },
    db: { collection: function () { return { get: function () { return Promise.resolve({ forEach: function (g) { Object.keys(F.docs).forEach(function (k) { g({ id: k, data: function () { return F.docs[k]; } }); }); } }); },
      doc: function (id) { return { set: function (d) { F.docs[id] = d; return Promise.resolve(); } }; }, onSnapshot: function () { return function () {}; } }; } } };
  vm.createContext(c); vm.runInContext(IDN + "\n" + html.slice(i, j), c); return { c: c, S: S, F: F };
}
(async function () {
  try {
    var A = arma(), m = A.c.mezclaFirestore;
    var M = { nombre: "Fiesta Cumpleaños Papá", tocada: T("2026-10-08T21:32:00Z"), contexto: "viejo", _historico: { falta_paso_claude: [{ q: "¿próximo paso?" }] },
      msgs: [{ ts: 1, k: "bi", t: "viejo" }, { ts: T("2026-10-09T00:19:00Z"), k: "bi", t: "✉️ Enviado: T acompaño con una copita", wa_id: "W1" }] };
    var F = { nombre: "Fiesta Cumpleaños Papá", tocada: T("2026-10-09T00:55:00Z"), contexto: "nuevo con el 10 de noviembre", hecho238: { hecho: ["Contexto"] },
      msgs: [{ ts: 1, k: "bi", t: "viejo" }, { ts: T("2026-10-09T00:55:00Z"), k: "bo", t: "El 10 de noviembre recuérdales a todos los invitados", de: "salvador" }] };
    var R = m(M, F);
    eq("mensajes de los dos lados, sin repetir y en orden", R.msgs.map(function (x) { return x.t.slice(0, 12); }), ["viejo", "✉️ Enviado: ", "El 10 de nov"]);
    eq("gana lo tocado más reciente (el teléfono, 18:55)", [R.contexto, R.hecho238.hecho[0], R.tocada], ["nuevo con el 10 de noviembre", "Contexto", F.tocada]);
    eq("lo que solo tiene la Mac se queda (_historico)", !!R._historico.falta_paso_claude, true);
    eq("la versión de Firestore queda copiada (sin msgs)", [typeof R._fb_copia, /nuevo con el 10/.test(R._fb_copia), /recuérdales/.test(R._fb_copia), R._fb_tocada], ["string", true, false, F.tocada]);
    eq("ya conciliada: no se vuelve a subir", m(R, F), null);
    /* lo eliminado en el teléfono no revive (caso Fiesta: fotos borradas reaparecieron) */
    var M3 = { tocada: 1, msgs: [{ ts: 5, k: "bi", t: "foto", url: "u1" }] }, F3 = { tocada: T("2026-10-09T01:00:00Z"), msgs: [{ ts: 5, k: "bi", t: "foto", url: "u1", eliminado: true, eliminado_por: "salvador" }] };
    eq("lo eliminado en el teléfono queda eliminado en MySQL", (m(M3, F3).msgs[0] || {}).eliminado, true);
    var M4 = Object.assign({}, R, { _fb_v: undefined }); M4.msgs = [{ ts: 5, k: "bi", t: "foto", url: "u1" }];
    eq("una conciliación vieja (sin _fb_v) vuelve a pasar una vez", !!m(M4, Object.assign({}, F, { msgs: F3.msgs, tocada: R._fb_tocada })), true);
    eq("tocada en Firestore antes de la copia a MySQL: no se toca", m(M, Object.assign({}, F, { tocada: T("2026-10-08T10:00:00Z") })), null);
    var M2 = Object.assign({}, M, { tocada: T("2026-10-09T01:30:00Z"), contexto: "de la Mac, más nuevo" });
    var R2 = m(M2, F);
    eq("si la Mac tocó después: su versión gana, pero el dictado del teléfono entra a la plática", [R2.contexto, R2.msgs.length, R2.tocada], ["de la Mac, más nuevo", 3, M2.tocada]);
    eq("tarea nueva solo en Firestore (creada hoy en el teléfono) se crea en MySQL", m(null, { nombre: "Nueva", tocada: T("2026-10-08T20:00:00Z") }).nombre, "Nueva");
    eq("tarea vieja solo en Firestore no se toca", m(null, { nombre: "Vieja", tocada: T("2026-09-01T00:00:00Z") }), null);

    /* concilia(): de punta a punta */
    A.S.tareas = { tF: M, tIgual: { nombre: "Igual", tocada: 5 } };
    A.F.docs = { tF: F, tIgual: { nombre: "Igual", tocada: 5 }, tNueva: { nombre: "Nueva del teléfono", tocada: T("2026-10-08T22:00:00Z") } };
    var k = await A.c.datosTareas.concilia();
    eq("concilia sube solo lo que hace falta", [k, A.S.sets.sort()], [2, ["tF", "tNueva"]]);
    eq("en MySQL queda el dictado del teléfono", A.S.tareas.tF.msgs.some(function (x) { return /recuérdales/.test(x.t); }), true);
    A.S.sets = []; var k2 = await A.c.datosTareas.concilia();
    eq("segunda vez: nada que subir", [k2, A.S.sets.length], [0, 0]);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
