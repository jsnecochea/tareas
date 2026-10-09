#!/usr/bin/env node
/* Contactos de la tarea (caso Fiesta 9-oct: no había dónde agregar a Sada). Bloque «Contactos» en la hoja Resumen → con quién
   está y «Agregar o quitar contactos»; un contacto de fuera agregado queda en wa_contactos (lo usa la Mac). Eliminar fotos ya no
   pregunta por sacar al contacto. Correr: node tests/contactos-tarea.test.js. Arnés copiado de tests/dictado-entrada.test.js. */
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
    var R = await p.evaluate(async function () { var T = { id: "tFIE", nombre: "Fiesta", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-11-13",
        wa_contactos: [{ nombre: "Salvador N.S.", desde: 1 }], msgs: [{ k: "bi", wa_in: 1, wa_c: "Salvador N.S.", t: "Salvador N.S.: wa_1.jpeg", tipo: "foto", url: "https://x/1.jpeg", ts: 1 },
        { k: "bi", wa_in: 1, wa_c: "Salvador N.S.", t: "Salvador N.S.: wa_2.jpeg", tipo: "foto", url: "https://x/2.jpeg", ts: 2 }] };
      window.AGENDA_WA = [{ nombre: "Sada Garza", jid: "5218100000000@s.whatsapp.net", numero: "", alias: "" }];
      abre(T); var chip = document.querySelector('[data-chip="detalles"]'), chipTx = chip ? chip.textContent : "";
      chip.click(); await espera(80); var hoja = document.body.textContent;
      var bloque = /Contactos/.test(hoja) && /Salvador N\.S\./.test(hoja), agrega = /Agregar o quitar contactos/.test(hoja), agenda = /agenda de WhatsApp en Doit: 1 contactos/.test(hoja);
      document.querySelector("[data-int227]").click(); await espera(80); document.querySelector(".itadd").click(); await espera(50);
      var q = document.getElementById("itq"); q.value = "sada"; q.oninput(); await espera(30);
      var pick = document.querySelector(".itpick"); var pickTx = pick ? pick.textContent : ""; if (pick) pick.click(); await espera(50);
      var V = tareas[0], sada = (V.wa_contactos || []).filter(function (c) { return c.nombre === "Sada Garza"; })[0];
      eliminaAdjuntos(V, ["ms:0"]); eliminaAdjuntos(V, ["ms:1"]); await espera(700);
      var quitar = puedeQuitar(V, "ext:Sada Garza") && quitaIntegrante(V, "ext:Sada Garza");
      return { bloque: bloque, agrega: agrega, agenda: agenda, pickTx: /Sada Garza/.test(pickTx), sada: !!sada, jid: sada && sada.jid, preguntaExcluir: typeof window.preguntaExcluir, sinHoja: !document.getElementById("hoja254") || !/Ya no meto/.test(document.getElementById("hoja254").textContent),
        papa: (V.wa_contactos || []).some(function (c) { return c.nombre === "Salvador N.S."; }), quitada: quitar && !(V.wa_contactos || []).some(function (c) { return c.nombre === "Sada Garza"; }) }; });
    eq("en Resumen hay bloque Contactos", R.bloque, true);
    eq("la hoja ofrece agregar y dice cuántos hay en la agenda", [R.agrega, R.agenda], [true, true]);
    eq("busca en la agenda y agrega a Sada como contacto de la tarea (con su jid)", [R.pickTx, R.sada, R.jid], [true, true, "5218100000000@s.whatsapp.net"]);
    eq("eliminar fotos ya no ofrece sacar al contacto", [R.preguntaExcluir, R.sinHoja, R.papa], ["undefined", true, true]);
    eq("quitarlo lo saca de los contactos de la tarea", R.quitada, true);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
