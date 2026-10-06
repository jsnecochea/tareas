#!/usr/bin/env node
/* PRUEBAS build 258: notificaciones — tipo te_necesito, preset 'Solo lo que necesita mi respuesta', migración, ?recordatorio abre la tarea. 390 px. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 258", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 256, true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    window.__SWH = []; try { Object.defineProperty(navigator, "serviceWorker", { value: { addEventListener: function (t, f) { window.__SWH.push(f); }, register: function () { return Promise.resolve({}); }, ready: Promise.resolve({}) }, configurable: true }); } catch (e) {}
    var RD = Date, base = RD.parse("2026-10-06T13:20:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html") + "?recordatorio=tREC1"); await p.waitForTimeout(600);
    var u = await p.evaluate(function () { return { ir: window.__irARec, url: location.search }; });
    eq("?recordatorio=<id> queda guardado para abrir esa tarea y la URL se limpia", u, { ir: "tREC1", url: "" });
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true };
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      document.getElementById("app").style.display = "flex"; localStorage.removeItem("bit_notif_salvador"); });
    /* catálogo y preset */
    var r1 = await p.evaluate(function () { var o = notifDePreset("respuesta"); return { on: Object.keys(o).filter(function (k) { return o[k]; }), primero: NOTIF_TIPOS[0].k, grupo: NOTIF_TIPOS[0].grupo, nivel: NOTIF_TIPOS[0].nivel, tx: NOTIF_TIPOS[0].tx, sub: NOTIF_TIPOS[0].sub, ico: NOTIF_TIPOS[0].ico, presets: NOTIF_PRESETS.map(function (x) { return x.k; }), pTx: NOTIF_PRESETS[1].tx, urg: Object.keys(notifDePreset("urgente")).filter(function (k) { return notifDePreset("urgente")[k]; }) }; });
    eq("te_necesito es el PRIMER tipo de Urgente", [r1.primero, r1.grupo, r1.nivel, r1.tx, r1.sub, r1.ico], ["te_necesito", "Urgente", "urgente", "Claude necesita tu respuesta", "Solo lo que requiere tu sí o tu dato para seguir avanzando", "alerta"]);
    eq("Preset 'respuesta' va entre Ninguna y Solo urgente", [r1.presets.slice(0, 3), r1.pTx], [["ninguna", "respuesta", "urgente"], "Solo lo que necesita mi respuesta"]);
    eq("Preset 'respuesta': solo te_necesito encendido", r1.on, ["te_necesito"]);
    eq("Solo urgente incluye te_necesito", r1.urg.indexOf("te_necesito") === 0, true);
    /* pantalla: tocar el atajo */
    var r2 = await p.evaluate(function () { vista = "notif"; render(); var b = document.querySelector('[data-npre="respuesta"]'); var hay = !!b; b.click();
      var on = [].filter.call(document.querySelectorAll("[data-ntipo]"), function (e) { return e.querySelector(".tg.on") || /\bon\b/.test(e.className) && /tg/.test(e.className); }).length;
      return { hay: hay, pre: PERSONAS[yo].notif.preset, tipos: Object.keys(PERSONAS[yo].notif.tipos).filter(function (k) { return PERSONAS[yo].notif.tipos[k]; }), marcado: (document.querySelector("[data-npre].on") || {}).textContent, encendidos: (document.getElementById("app").innerHTML.match(/class="tg on"/g) || []).length }; });
    eq("Tocar el atajo guarda 'respuesta' con solo te_necesito, lo marca y enciende 1 interruptor", [r2.hay, r2.pre, r2.tipos, r2.marcado, r2.encendidos], [true, "respuesta", ["te_necesito"], "Solo lo que necesita mi respuesta", 1]);
    await foto("b258-1-preset.png");
    /* permite / push */
    var r3 = await p.evaluate(function () { return { si: notifPermite("salvador", "te_necesito"), no: notifPermite("salvador", "recordatorio"), t1: tipoDePush("Claude necesita tu respuesta", "¿Confirmas?"), t2: tipoDePush("Necesito tu respuesta", "Falta la fecha"), t3: tipoDePush("Recordatorio", "Pagar") }; });
    eq("notifPermite y tipoDePush reconocen te_necesito", r3, { si: true, no: false, t1: "te_necesito", t2: "te_necesito", t3: "recordatorio" });
    /* migración */
    var r4 = await p.evaluate(function () { var viejo = function (preset, tipos) { PERSONAS.carlos = { nombre: "Carlos", notif: { v: 1, preset: preset, tipos: tipos, ts: 1 } }; return notifPrefs("carlos").te_necesito; };
      var todoFalse = { recordatorio: false, espera: false, falla: false, falta_info: false, seguimiento: false, asignado: false, wa_tarea: false, wa_todo: false };
      var urg = { recordatorio: true, espera: true, falla: true, falta_info: false, seguimiento: false, asignado: false, wa_tarea: false, wa_todo: false };
      return { ninguna: viejo("ninguna", todoFalse), urgente: viejo("urgente", urg), personal: viejo("personalizado", Object.assign({}, todoFalse, { wa_todo: true })), yaTiene: (function () { PERSONAS.carlos = { notif: { v: 1, preset: "urgente", tipos: Object.assign({}, urg, { te_necesito: false }) } }; return notifPrefs("carlos").te_necesito; })(), nunca: (function () { delete PERSONAS.carlos; return notifPermite("carlos", "te_necesito"); })() }; });
    eq("Migración: guardó preferencias → te_necesito encendido, salvo preset 'ninguna'; lo ya elegido se respeta", r4, { ninguna: false, urgente: true, personal: true, yaTiene: false, nunca: true });
    /* abrir con ?recordatorio: el sw manda 'abre' y la app abre la tarea directo (app ya abierta) */
    var r5 = await p.evaluate(function () { tareas = [{ id: "tREC1", nombre: "Llamar al contador", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", msgs: [] }]; abierta = null; vista = "lista"; render();
      var hs = window.__SWH.slice(); hs.forEach(function (f) { f({ data: { tipo: "abre", id: "tREC1" } }); }); return { handlers: hs.length, abierta: abierta, vista: vista }; });
    eq("Mensaje 'abre' del sw abre la tarea del recordatorio directo (hilo)", [r5.handlers >= 1, r5.abierta, r5.vista], [true, "tREC1", "hilo"]);
    /* sw.js: la notificación con id navega a ?recordatorio=<id> y respalda con postMessage tipo 'abre' */
    var sw = fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8");
    eq("sw.js: deepLink ?recordatorio=<id> y respaldo postMessage {tipo:'abre'}", [/\?recordatorio=\$\{tid\}/.test(sw), /tipo: 'abre', id: tid/.test(sw), /\.navigate\(deepLink\)/.test(sw)], [true, true, true]);
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
