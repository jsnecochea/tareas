#!/usr/bin/env node
/* Candado de datos documentados (Salvador 9-oct): si lo dictado cambia una fecha o un monto que la tarea ya tiene, no se
   aplica solo; sale «⚠️ Ojo: ¿seguro?» con lo que dice la documentación, y él decide. Caso Fiesta Cumpleaños Papá (13-nov).
   Correr: node tests/candado-datos.test.js
   Arnés copiado de tests/dictado-entrada.test.js. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    var RD = Date, base = RD.parse("2026-10-08T03:30:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true;
      window.__WA = []; window.__agendaNo = 1; window.__LL = [];
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.NOW = Date.now(); document.getElementById("app").style.display = "flex";
      window.abre = function (T, extra) { [].forEach.call(document.querySelectorAll("#preg249,#hoja254,#acom249,#det242,#mov225,.leemask,.cnlbg,.cnlsheet"), function (e) { e.remove(); });
        window.__dest254 = {}; tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; render(); };
      window.envia = function (v) { var tx = document.getElementById("txt"); tx.value = v; document.getElementById("tenv").click(); };
      /* modelo: j = objeto (contesta en ms) | "caido" (error) ; guarda cada llamada */
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { __LL.push({ modo: mod, prompt: msgs[0].content, t: Date.now() });
        setTimeout(function () { if (j === "caido") cb(null, "No contesto a tiempo."); else cb(JSON.stringify(typeof j === "function" ? j(msgs[0].content) : j)); }, ms || 20); }; };
      window.COMEDOR = function () { return { id: "tCOM", nombre: "Comedor Nuevo", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
        f_vigente: "2026-10-30", f_original: "2026-10-30", fecha_dictada: true, contexto: "Mesa del comedor nuevo en mármol con Manuel Parra (piedra); falta la cotización final.",
        wa_contactos: [{ nombre: "Manuel Parra", desde: 1 }],
        resumen: { que_toca: "Esperando la cotización de Manuel", plan: [{ id: "m1", quien: "Manuel Parra", que: "Mandar la cotización del mármol", estado: "pendiente", origen: "mac", fecha: "2026-10-09" }] },
        msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: Mañana le mando la cotización", ts: NOW - 3600000, h: "20:30", wa_id: "w1" }] }; };
      window.MORIC = function () { return { id: "tMOR", nombre: "Cobranza Moric", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
        f_vigente: "2026-10-15", f_original: "2026-10-15", fecha_dictada: true, contexto: "Cobrar al Moric la cena del 26 de septiembre; el gerente es Rodrigo.",
        wa_contactos: [{ nombre: "Rodrigo Moric", desde: 1 }], msgs: [] }; };
    });
    var FIESTA = function () { return { id: "tFIE", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
      f_vigente: "2026-11-13", f_original: "2026-11-13", fecha_dictada: true, evento: { fecha: "2026-11-13", hora: "14:00" }, contexto: "Fiesta del papá de Salvador.",
      sabemos: [{ t: "Fecha: 13-nov, 3:00 a 8:00 PM, Calle Everest 164 Col Cumbres (de la invitación enviada a Arturo Tijerina)." }], msgs: [] }; };
    var A = await p.evaluate(async function (F) { var T = eval("(" + F + ")")(); window.modelo({ tipo: "tarea", fecha: "2026-11-20", ordenes: [], dudas: [], recordar: [], vinculos: [], entendi: "La fiesta es el 20 de noviembre" }, 50);
      abre(T); envia("la fiesta es el 20 de noviembre"); await espera(1200); var V = tareas[0], h = document.getElementById("hoja254");
      return { f: V.f_vigente, hoja: !!h, tx: h ? h.textContent : "" }; }, FIESTA.toString());
    eq("no se cambia sola la fecha documentada", A.f, "2026-11-13");
    eq("sale el aviso con lo que dice la documentación", [A.hoja, /Ojo/.test(A.tx), /13-nov/.test(A.tx), /Lo dice Lo que sabemos/.test(A.tx)], [true, true, true, true]);
    var B = await p.evaluate(async function () { document.querySelector('#hoja254 [data-h254="queda"]').click(); await espera(100); var V = tareas[0];
      return [V.f_vigente, (V.msgs || []).some(function (m) { return /Se quedó la fecha de la tarea/.test(m.t || ""); })]; });
    eq("«No, se queda»: sigue el 13 y se anota", B, ["2026-11-13", true]);
    var C = await p.evaluate(async function (F) { var T = eval("(" + F + ")")(); window.modelo({ tipo: "tarea", fecha: "2026-11-20", ordenes: [], dudas: [], recordar: [], vinculos: [], entendi: "La fiesta es el 20 de noviembre" }, 50);
      abre(T); envia("la fiesta es el 20 de noviembre"); await espera(1200); document.querySelector('#hoja254 [data-h254="cambia"]').click(); await espera(100); return tareas[0].f_vigente; }, FIESTA.toString());
    eq("«Sí, cambiar»: se aplica el 20", C, "2026-11-20");
    var D = await p.evaluate(async function () { var T = MORIC(); T.f_vigente = ""; T.f_original = ""; window.modelo({ tipo: "tarea", fecha: "2026-10-15", ordenes: [], dudas: [], recordar: [], vinculos: [], entendi: "x" }, 50);
      abre(T); envia("es para el 15 de octubre"); await espera(1200); return [tareas[0].f_vigente, !!document.getElementById("hoja254")]; });
    eq("sin fecha antes: se pone directo, sin preguntar", D[1], false);
    var E = await p.evaluate(async function (F) { var T = eval("(" + F + ")")(); window.modelo({ tipo: "tarea", fecha: "2026-11-20", ordenes: [], dudas: [], recordar: [], vinculos: [], entendi: "x" }, 50);
      abre(T); envia("cámbiala, ya no es el 13, la fiesta se pasó al 20 de noviembre"); await espera(1200); return [tareas[0].f_vigente, !!document.getElementById("hoja254")]; }, FIESTA.toString());
    eq("si lo dice a propósito («ya no es el 13, se pasó al 20»): se cambia sin preguntar", E, ["2026-11-20", false]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
