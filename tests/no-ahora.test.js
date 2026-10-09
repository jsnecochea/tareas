#!/usr/bin/env node
/* Un mensaje no sale ahora si no se pidió ahora (caso Fiesta 9-oct 7:12: «también avísale a Néstor y a Xavier» mandó el
   mensaje en el acto en vez de sumarlos al recordatorio del 10-nov). Correr: node tests/no-ahora.test.js
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
      f_vigente: "2026-11-13", f_original: "2026-11-13", fecha_dictada: true, contexto: "Fiesta del papá de Salvador.", wa_contactos: [{ nombre: "Nestor Perez Vecino", desde: 1 }, { nombre: "Eduardo Madero Lalo", desde: 1 }],
      resumen: { que_toca: "El 10-nov se recuerda a los invitados", plan: [{ id: "p1", quien: "IA", que: "Recordar la fiesta a Lalo", estado: "pendiente", origen: "salvador37", fecha: "2026-11-10",
        seguir: { en: "2026-11-10T10:30:00-06:00", a: "Eduardo Madero Lalo", texto: "IA: Hola Lalo, te recordamos la fiesta" } }] }, msgs: [] }; };
    var A = await p.evaluate(async function (F) { var T = eval("(" + F + ")")(); window.modelo({ tipo: "tarea", ordenes: [{ tipo: "mensaje", a: "Nestor", texto: "IA: Néstor, te recordamos la fiesta del 13 de noviembre en casa del papá de Salvador" }], dudas: [], recordar: [], vinculos: [], entendi: "Avisarle a Néstor" }, 50);
      __WA.length = 0; abre(T); completaRevision(tareas[0], "por favor también avísale a Néstor", { sinRevision: true });   /* como en la Fiesta: el cerebro (vista de revisión / preguntas) */ await espera(1200); var V = tareas[0];
      var p = (V.resumen.plan || []).filter(function (x) { return x.seguir && x.seguir.a === "Nestor Perez Vecino"; })[0] || {};
      return { wa: __WA.length, en: p.seguir && p.seguir.en, tx: p.seguir && /Néstor/.test(p.seguir.texto) }; }, FIESTA.toString());
    eq("no sale ahora: queda con el recordatorio del 10-nov a las 10:30", A, { wa: 0, en: "2026-11-10T10:30:00-06:00", tx: true });
    var B = await p.evaluate(async function (F) { var T = eval("(" + F + ")")(); window.modelo({ tipo: "tarea", ordenes: [{ tipo: "mensaje", a: "Nestor", texto: "IA: Néstor, ¿me confirmas hoy?" }], dudas: [], recordar: [], vinculos: [], entendi: "x" }, 50);
      __WA.length = 0; abre(T); completaRevision(tareas[0], "mándale ahorita a Néstor que me confirme", { sinRevision: true }); await espera(1200); return __WA.length; }, FIESTA.toString());
    eq("si dice «ahorita», sale en el acto", B, 1);
    var H = await p.evaluate(async function (F) { var T = eval("(" + F + ")")(); T.resumen.plan = []; window.__PRUEBA_HORARIO = 1; var hm0 = horaMty; horaMty = function () { return "06:40"; };
      window.modelo({ tipo: "tarea", ordenes: [{ tipo: "mensaje", a: "Nestor", texto: "IA: Néstor, ¿me confirmas?" }], dudas: [], recordar: [], vinculos: [], entendi: "x" }, 50);
      __WA.length = 0; abre(T); completaRevision(tareas[0], "dile a Néstor que me confirme", { sinRevision: true }); await espera(1300);
      var h = document.getElementById("hoja254"), tx = h ? h.textContent : ""; var p = (tareas[0].resumen.plan || []).filter(function (x) { return x.seguir && x.seguir.a === "Nestor Perez Vecino"; })[0] || {};
      var r = { wa: __WA.length, en: p.seguir && p.seguir.en.slice(10), pregunta: /quedó para las 8:00/.test(tx) };
      if (h) h.querySelector('[data-h254="ya"]').click(); await espera(150); r.waYa = __WA.length; r.estado = p.estado; horaMty = hm0; window.__PRUEBA_HORARIO = 0; return r; }, FIESTA.toString());
    eq("6:40 am: no sale; queda a las 8:00 y pregunta", [H.wa, H.en, H.pregunta], [0, "T08:00:00-06:00", true]);
    eq("«Mandarlo ya»: sale y el programado queda hecho", [H.waYa, H.estado], [1, "hecho"]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
