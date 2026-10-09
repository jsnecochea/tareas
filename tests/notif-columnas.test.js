#!/usr/bin/env node
/* PRUEBAS: pantalla Notificaciones con DOS columnas (Doit = push de la app, WhatsApp = número de Doit), a 390 px.
   Ve las dos columnas, defectos de Salvador, atajos, guardado v2 {k:{push,wa}}, migración del formato viejo,
   notifPermite con la columna Doit y tipo desconocido = apagado. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    window.__esc = [];
    var fs0 = { enablePersistence: P, collection: function (col) { return { doc: function (id) { return { set: function (o, m) { window.__esc.push([col, id, JSON.parse(JSON.stringify(o)), m]); return P(); }, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    try { Object.defineProperty(navigator, "serviceWorker", { value: { addEventListener: function () {}, register: function () { return Promise.resolve({}); }, ready: Promise.resolve({}) }, configurable: true }); } catch (e) {} });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom), fullPage: true }); }
  var E6 = ["recordatorio", "cita", "acuerdo", "llamada", "espera", "autorizar", "falla"];
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(500);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true };
      /* lo que Salvador tenía guardado con la pantalla de una columna */
      PERSONAS.salvador.notif = { v: 3, preset: "todas", tipos: { wa_todo: true, wa_tarea: true, falla: true, recordatorio: false }, ts: 1 };
      db = firebase.firestore(); window.__esc.length = 0; window.resyncAvisosNotif = function () {};
      document.getElementById("app").style.display = "flex"; vista = "notif"; render(); });
    /* 1. las dos columnas y los defectos (la migración pone el defecto, no lo viejo) */
    var r1 = await p.evaluate(function () {
      var filas = [].map.call(document.querySelectorAll(".ntf .nrow"), function (f) { var sw = f.querySelectorAll("button.tg");
        return { k: f.getAttribute("data-nfila"), n: sw.length, push: sw[0].getAttribute("data-ncol") === "push" && sw[0].classList.contains("on"), wa: sw[1].getAttribute("data-ncol") === "wa" && sw[1].classList.contains("on") }; });
      var cab = [].map.call(document.querySelectorAll(".ntf .ngrp"), function (g) { return [].map.call(g.querySelectorAll(".ncol"), function (x) { return x.textContent; }).join("|"); });
      var g = window.__esc.filter(function (e) { return e[0] === "bitacora_personas" && e[2].notif; }).pop();
      return { filas: filas.length, cat: NOTIF_TIPOS.length, dos: filas.every(function (f) { return f.n === 2; }), push: filas.filter(function (f) { return f.push; }).map(function (f) { return f.k; }), wa: filas.filter(function (f) { return f.wa; }).map(function (f) { return f.k; }),
        cab: cab, guardado: g ? [g[1], g[2].notif.v, g[2].notif.preset, g[2].notif.tipos.wa_todo, g[2].notif.tipos.recordatorio] : null,
        marcado: (document.querySelector("[data-npre].on") || {}).textContent, ancho: document.documentElement.scrollWidth };
    });
    eq("Una fila por tipo del catálogo, nada oculto", [r1.filas, r1.filas === r1.cat], [17, true]);
    eq("Cada fila con DOS interruptores (Doit, WhatsApp)", r1.dos, true);
    eq("Cada grupo dice qué columna es cuál", r1.cab.every(function (c) { return c === "Doit|WhatsApp"; }) && r1.cab.length === 4, true);
    eq("Defecto de Salvador en Doit: recordatorio, cita, acuerdo, llamada, espera, autorizar", r1.push, E6);
    eq("Defecto de Salvador en WhatsApp: lo mismo", r1.wa, E6);
    eq("Lo de una columna (v3) no se conserva: se guarda v2 con el defecto", r1.guardado, ["salvador", 2, "esencial", { push: false, wa: false }, { push: true, wa: true }]);
    eq("«Solo lo esencial» queda marcado", r1.marcado, "Solo lo esencial");
    eq("Cabe a 390 px sin scroll de lado", r1.ancho <= 390, true);
    await foto("notif-columnas-1.png");
    /* 2. un interruptor solo cambia su columna */
    var r2 = await p.evaluate(function () { window.__esc.length = 0;
      document.querySelector('[data-ncol="push"][data-ntipo="no_supe"]').click();
      var g = window.__esc.pop(), t = g && g[2].notif.tipos;
      return { no_supe: t && t.no_supe, preset: g && g[2].notif.preset, v: g && g[2].notif.v, on: document.querySelector('[data-ncol="push"][data-ntipo="no_supe"]').classList.contains("on"), waOn: document.querySelector('[data-ncol="wa"][data-ntipo="no_supe"]').classList.contains("on"),
        permite: [notifPermite("salvador", "no_supe"), notifPermite("salvador", "wa_todo"), notifPermite("salvador", "tipo_que_no_existe"), notifPermite("salvador", "")] }; });
    eq("Prender Doit de «No supe qué contestar» no toca WhatsApp", [r2.no_supe, r2.on, r2.waOn], [{ push: true, wa: false }, true, false]);
    eq("Se guarda v2 a tu medida", [r2.v, r2.preset], [2, "personalizado"]);
    eq("notifPermite usa la columna Doit; desconocido o vacío = apagado", r2.permite, [true, false, false, false]);
    /* 3. atajos ponen AMBAS columnas */
    var r3 = await p.evaluate(function () { function cuenta() { return [document.querySelectorAll('[data-ncol="push"].on').length, document.querySelectorAll('[data-ncol="wa"].on').length]; }
      var o = {}; document.querySelector('[data-npre="todas"]').click(); o.todas = cuenta();
      document.querySelector('[data-npre="ninguna"]').click(); o.nada = cuenta(); o.permNada = notifPermite("salvador", "recordatorio");
      document.querySelector('[data-npre="esencial"]').click(); o.esencial = cuenta(); o.pre = PERSONAS.salvador.notif.preset;
      return o; });
    eq("«Todo» prende las dos columnas", r3.todas, [17, 17]);
    eq("«Nada» apaga las dos columnas y ya no suena ni el recordatorio", [r3.nada, r3.permNada], [[0, 0], false]);
    eq("«Solo lo esencial» deja 7 y 7", [r3.esencial, r3.pre], [[7, 7], "esencial"]);
    /* 4. lo que la app manda: el tipo viaja y respeta la columna Doit */
    var r4 = await p.evaluate(function () { var mand = []; window.fetch = function (u, o) { mand.push(JSON.parse(o.body)); return Promise.resolve({ json: function () { return {}; } }); };
      yo = "samuel"; PERSONAS.samuel = PERSONAS.samuel || { nombre: "Samuel" };
      disparaPushInstantaneo("salvador", "Nuevo comentario", "x comentó", "u");
      disparaPushInstantaneo("salvador", "Hola", "nada que se reconozca", "u");
      disparaPushInstantaneo("salvador", "Te necesito", "Te necesito en una llamada", "u");
      yo = "salvador"; return mand.map(function (x) { return x.tipo; }); });
    eq("A Salvador solo sale la llamada; comentario y desconocido no", r4, ["llamada"]);
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
