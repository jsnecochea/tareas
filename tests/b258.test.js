#!/usr/bin/env node
/* PRUEBAS build 258 (al día con la pantalla de dos columnas): atajos, interruptores Doit/WhatsApp, migración, ?recordatorio abre la tarea. 390 px. */
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
    /* catálogo de dos columnas: lo que antes era te_necesito queda en sus renglones (llamada, espera, ia_atorada) */
    var r1 = await p.evaluate(function () { var o = notifDePreset("esencial"); return { on: Object.keys(o).filter(function (k) { return o[k].push && o[k].wa; }), primero: NOTIF_TIPOS[0].k, hayTeNecesito: !!notifTipo("te_necesito"), presets: NOTIF_PRESETS.map(function (x) { return x.k; }) }; });
    eq("Lo esencial (ambas columnas) y sin la clave te_necesito en el catálogo", [r1.on, r1.primero, r1.hayTeNecesito, r1.presets], [["recordatorio", "cita", "acuerdo", "llamada", "espera", "autorizar", "falla"], "recordatorio", false, ["esencial", "todas", "ninguna"]]);
    /* pantalla: tocar los atajos y un interruptor */
    var r2 = await p.evaluate(function () { vista = "notif"; render(); document.querySelector('[data-npre="ninguna"]').click(); var nada = (document.getElementById("app").innerHTML.match(/class="tg on"/g) || []).length;
      var b = document.querySelector('[data-npre="esencial"]'); var hay = !!b; b.click();
      var tipos = PERSONAS[yo].notif.tipos;
      return { hay: hay, nada: nada, v: PERSONAS[yo].notif.v, pre: PERSONAS[yo].notif.preset, push: Object.keys(tipos).filter(function (k) { return tipos[k].push; }), wa: Object.keys(tipos).filter(function (k) { return tipos[k].wa; }), marcado: (document.querySelector("[data-npre].on") || {}).textContent, encendidos: (document.getElementById("app").innerHTML.match(/class="tg on"/g) || []).length }; });
    var E6 = ["recordatorio", "cita", "acuerdo", "llamada", "espera", "autorizar", "falla"];
    eq("«Nada» apaga todo; «Solo lo esencial» guarda v2, lo marca y enciende 7 + 7 interruptores", [r2.hay, r2.nada, r2.v, r2.pre, r2.push, r2.wa, r2.marcado, r2.encendidos], [true, 0, 2, "esencial", E6, E6, "Solo lo esencial", 14]);
    var r2b = await p.evaluate(function () { document.querySelector('[data-ncol="wa"][data-ntipo="cita"]').click(); var t = PERSONAS[yo].notif.tipos.cita;
      return { cita: t, pre: PERSONAS[yo].notif.preset, marcado: !!document.querySelector("[data-npre].on"), aria: document.querySelector('[data-ncol="wa"][data-ntipo="cita"]').getAttribute("aria-checked") }; });
    eq("Apagar solo WhatsApp de «Cita» deja Doit prendido y queda a tu medida", r2b, { cita: { push: true, wa: false }, pre: "personalizado", marcado: false, aria: "false" });
    await foto("b258-1-preset.png");
    /* permite / push */
    var r3 = await p.evaluate(function () { return { si: notifPermite("salvador", "cita"), viejo: notifPermite("salvador", "te_necesito"), no: notifPermite("salvador", "wa_tarea"), t1: tipoDePush("Claude necesita tu respuesta", "¿Confirmas?"), t2: tipoDePush("Necesito tu respuesta", "Falta la fecha"), t3: tipoDePush("Recordatorio", "Pagar") }; });
    eq("notifPermite usa la columna Doit; tipoDePush da claves del catálogo", r3, { si: true, viejo: true, no: false, t1: "ia_atorada", t2: "espera", t3: "recordatorio" });
    /* migración: lo de una columna no se conserva */
    var r4 = await p.evaluate(function () { PERSONAS.carlos = { nombre: "Carlos", notif: { v: 3, preset: "todas", tipos: { wa_todo: true, asignado: false, recordatorio: false }, ts: 1 } };
      var o = notifPrefs("carlos"); var r = { wa_todo: o.wa_todo, asignado: o.asignado, recordatorio: o.recordatorio }; delete PERSONAS.carlos; return r; });
    eq("Migración: lo guardado de una columna se cambia por el defecto", r4, { wa_todo: { push: false, wa: false }, asignado: { push: true, wa: false }, recordatorio: { push: true, wa: true } });
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
