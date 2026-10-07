#!/usr/bin/env node
/* PRUEBAS build 246 (Salvador 6-oct 07:01 y 07:15). a 390 px. Reloj fijo: mar 6-oct-2026 07:20 (Torreón).
   1) Lista "Hoy": primero las tareas con recordatorio (aviso de hoy, o con hora), por hora del aviso; luego las demás en su orden.
   2) Importante: tarjeta "Qué toca" PRIMERO (resumen.que_toca; sin él, se arma con resumen.pendientes); debajo el resumen (plegado si no agrega).
   3) Importante más estricto (caso real "Mandar a Hacer Testamentos", fixture fx-testamentos-246.json): sin indicaciones viejas a Claude, sin ocultos;
      personas: msg_imp=1 o contenido + reciente (7 días) o cifra/fecha/archivo/decisión.
   Correr: node tests/b246.test.js (CAP=<carpeta> para capturas) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var FX = JSON.parse(fs.readFileSync(path.join(__dirname, "fx-testamentos-246.json"), "utf8"));
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 246", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 246, true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    /* reloj fijo: 2026-10-06 13:20Z (07:20 en Torreón) */
    var RD = Date, base = RD.parse("2026-10-06T13:20:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  async function foto(nom, alto) { if (!process.env.CAP) return; await p.setViewportSize({ width: 390, height: alto || 844 }); await p.waitForTimeout(350); await p.evaluate(function () { [].forEach.call(document.querySelectorAll(".scroll, .msgs"), function (sc) { sc.scrollTop = 0; }); }); await p.waitForTimeout(150); await p.screenshot({ path: path.join(process.env.CAP, nom) }); await p.setViewportSize({ width: 390, height: 844 }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; window.__ESCR = [];
      db = { collection: function (c) { return { doc: function (id) { return { set: function (v) { __ESCR.push([c, id, JSON.parse(JSON.stringify(v))]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      window.solo = function () { [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }; });
    /* ---------- 1) Hoy ---------- */
    var r1 = await p.evaluate(function () { var o = {}, H = hoy(); o.hoy = H;
      function T(id, nom, extra) { var t = { id: id, nombre: nom, duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: H, ritmo: "diario", msgs: [], contexto: "Tarea de la oficina de Salvador con contexto completo: qué se hace, para quién, con qué documentos, cuánto cuesta, quién la revisa y cuándo debe quedar lista, para que el sistema no pida más información sobre ella." }; for (var k in extra) t[k] = extra[k]; return t; }
      var L = [T("t1", "Llamar al contador"), T("t2", "Pagar predial", { avisos: [{ ts: 1, texto: "Pagar predial", fecha: H, hora: "11:00" }] }), T("t3", "Revisar contrato", { avisos: [{ ts: 2, texto: "Revisar contrato", fecha: H, hora: "09:30" }] }),
        T("t4", "Comprar tinta"), T("t5", "Aviso sin hora", { avisos: [{ ts: 3, texto: "x", fecha: H }] }), T("t6", "Junta con Josué", { avisos: [{ ts: 4, texto: "Junta", fecha: H, hora: "08:00" }] }),
        T("t7", "Vencida de ayer", { f_vigente: "2026-10-01" })];
      tareas = L; abierta = null; vista = "lista"; secAbierta = "hoy"; render(); solo(); var hd = [].filter.call(document.querySelectorAll("#app button"), function (b) { return /para hoy|Hoy/.test(b.textContent) && b.className.indexOf("row") < 0; })[0]; if (hd) hd.click();
      var sec = document.querySelector(".sb-hoy"); var ul = sec ? sec.parentNode.querySelector("ul.list") || sec.nextElementSibling : null;
      return o; });
    await p.waitForTimeout(400);
    var r1b = await p.evaluate(function () { var o = {};
      o.orden = [].map.call(document.querySelectorAll("button.revr .rn, [data-id] .nm"), function (e) { return e.textContent.trim(); });
      o.venc = (function () { var sp = [].filter.call(document.querySelectorAll(".h270 .sep270"), function (x) { return /Vencidas mías/.test(x.textContent); })[0]; return !!sp && /Vencida de ayer/.test(sp.nextElementSibling.textContent); })();   /* build 270: su sección es "Vencidas mías" */ o.dbg = document.getElementById("app").innerHTML.slice(-1800); return o; });
    eq("lista Hoy: con aviso por hora (08:00, 09:30, 11:00), luego aviso sin hora, luego el resto en su orden", r1b.orden.filter(function (x) { return x !== "Vencida de ayer" && !/^\d+ (vencida|para hoy)/.test(x); }),
      ["Junta con Josué", "Revisar contrato", "Pagar predial", "Aviso sin hora", "Llamar al contador", "Comprar tinta"]);
    if (process.env.DBG) console.log(r1b.dbg);
    eq("la vencida sigue en su sección propia", r1b.venc, true);
    await foto("b246-lista-hoy.png");
    /* ---------- 2) Qué toca ---------- */
    var r2 = await p.evaluate(function (FX) { var o = {}, T = JSON.parse(JSON.stringify(FX)); window.T246 = T; tareas = [T]; abierta = T.id; vista = "hilo"; render(); solo();
      var c = document.querySelector(".res230");
      o.hijos = [].map.call(c.children, function (e) { return e.tagName + "." + (e.className || ""); });
      o.qt = c.querySelector(".qtx").textContent; o.primero = c.firstElementChild.textContent; o.rtx = c.querySelector(".rtx") ? c.querySelector(".rtx").textContent.slice(0, 40) : null;
      o.plegado = !!c.querySelector("details.rsm246"); o.acu = c.querySelectorAll(".racu li").length;
      o.antes = !!(c.querySelector(".qtx").compareDocumentPosition(c.querySelector(".rtx")) & 4);
      o.cardEnTop = c.getBoundingClientRect().top < 400;
      return o; }, FX);
    eq("la tarjeta abre con 'Qué toca' y su párrafo (resumen.que_toca)", [r2.primero, r2.qt.slice(0, 60)], ["Qué toca", "Cynthia le pide a la Notaría 14 los borradores de los dos te"]);
    eq("debajo, el resumen (2-3 renglones) porque agrega el reparto", [r2.antes, r2.plegado, r2.rtx], [true, false, "Testamentos de tus padres en la Notaría "]);
    eq("sigue la lista de acuerdos", r2.acu, 2);
    var r2b = await p.evaluate(function () { var T = JSON.parse(JSON.stringify(T246)), o = {};
      T.resumen.texto = "La Notaría 14 manda los borradores de los dos testamentos; Claude los revisa contra el reparto."; tareas = [T]; render(); solo();
      var c = document.querySelector(".res230"); o.plegado = [!!c.querySelector("details.rsm246"), c.querySelector("summary") && c.querySelector("summary").textContent, getComputedStyle(c.querySelector(".rtx")).display];
      /* sin que_toca: se arma con resumen.pendientes */
      T.resumen.que_toca = ""; T.resumen.texto = ""; tareas = [T]; render(); solo(); c = document.querySelector(".res230");
      o.local = [c.firstElementChild.textContent, c.querySelector(".qtx").textContent];
      /* sin nada: resumen local de antes */
      T.resumen = null; tareas = [T]; render(); solo(); o.sinRes = !!document.querySelector(".res230.local240, .res230.vacio");
      return o; });
    eq("texto que no agrega nada: plegado con 'ver resumen'", r2b.plegado[0] && r2b.plegado[1], "ver resumen");
    eq("sin que_toca: 'Qué toca' local con resumen.pendientes (lo que sigue y de quién)", r2b.local, ["Qué toca", "Cynthia pide a la notaría los borradores y los manda · Claude revisa y sugiere cambios · Regresar a la notaría y dar fecha de firma (Salvador)"]);
    eq("sin resumen, el local de antes", r2b.sinRes, true);
    /* ---------- 3) Importante más estricto ---------- */
    var r3 = await p.evaluate(function (FX) { var T = JSON.parse(JSON.stringify(FX)); tareas = [T]; abierta = T.id; vista = "hilo"; render(); solo();
      var o = {}; o.filtro = document.getElementById("cnlpill").textContent;
      o.vis = [].map.call(document.querySelectorAll(".msgs .b, .msgs [data-mix], .msgs [data-hab]"), function (b) { return b.textContent.replace(/\s+/g, " ").trim().slice(0, 70); });
      o.todo = document.querySelector(".msgs").textContent.replace(/\s+/g, " ");
      o.es = {}; ["Esta tarea está se vincula", "OK prográmame el recordatorio", "no están las indicaciones", "Es: Tarea", "Enviar mensaje a Cynthia", "Maria Eloisa Albores:", "corrigen en el contexto"].forEach(function (q) { var x = T.msgs.filter(function (y) { return String(y.t || "").indexOf(q) === 0; })[0]; o.es[q] = x ? esImp230(T, x) : "NO ESTÁ"; });
      return o; }, FX);
    await foto("b246-testamentos-importante.png", 1900);
    var txt = r3.todo;
    ["¿Quién es albacea?", "No, porque lo más seguro", "Lo correcto es en los bancos", "Salvador buenas tardes, me marcaron de la Notaria 14", "Esta tarea está se vincula a la del nuevo fideicomiso"].forEach(function (s) { eq("SALE en Importante: " + s.slice(0, 40), txt.indexOf(s) >= 0, true); });
    ["OK prográmame el recordatorio", "Resumen: Enviar mensaje a Cynthia", "Enviar mensaje a Cynthia pidiéndole", "Es: Tarea", "Claude esta tarea es para el 15", "no están las indicaciones", "Modifícame esta tarea", "Se va ejecutar para el 20 de octubre", "Quiero que me la mandas", "corrigen en el contexto", "Ya estoy ahí", "Van 8 veces", "Movida del"].forEach(function (s) { eq("NO sale en Importante: " + s.slice(0, 40), txt.indexOf(s) >= 0, false); });
    eq("la regla por mensaje (índice del hilo): dictado del reparto sí; indicaciones y ocultos no", ["Esta tarea está se vincula", "OK prográmame el recordatorio", "no están las indicaciones", "Es: Tarea", "Enviar mensaje a Cynthia", "Maria Eloisa Albores:", "corrigen en el contexto"].map(function (q) { return r3.es[q]; }), [true, false, false, false, false, false, false]);
    /* personas: msg_imp=1 sube uno viejo y sin contenido; msg_imp=0 baja uno con contenido; viejo sin cifra/fecha/archivo/decisión no sale */
    var r4 = await p.evaluate(function () { var T = JSON.parse(JSON.stringify(T246)), o = {}, NOW = Date.now(), D = 864e5;
      function m(tx, dias, ex) { var x = { k: "bi", wa_in: 1, wa_c: "Garza", t: "Garza: " + tx, ts: NOW - dias * D, h: "10:00" }; for (var q in (ex || {})) x[q] = ex[q]; return x; }
      var A = m("Quedó pendiente revisar con calma el asunto de las firmas de los testigos allá", 10), B = m("Quedó pendiente revisar con calma el asunto de las firmas de los testigos allá", 2),
        C = m("Ok", 20, { id: "mC" }), Dd = m("Son 4 partes iguales entre los hermanos", 20), E = m("Se aprobó el borrador", 20), F = m("Mándame la foto", 20, { url: "https://x/y.jpg", tipo: "foto" }), G = m("Quedó pendiente revisar con calma el asunto de las firmas de los testigos allá", 1, { id: "mG" });
      T.msg_imp = { mC: 1, mG: 0 };
      o.r = [A, B, C, Dd, E, F, G].map(function (x) { return esImp230(T, x); });
      var I = { k: "bo", de: "salvador", t: "Claude muévela para el viernes", ts: NOW - 3600000 }, I2 = { k: "bo", de: "salvador", t: "Recuérdame el lunes", ts: NOW - 3600000 }; T.msgs = [I, I2];
      o.ind = [indicacionCaduca246(T, I)];
      T.msgs.push({ k: "bi", t: "Listo, reprogramada.", ts: NOW - 1800000 }); o.ind.push(indicacionCaduca246(T, I), indicacionCaduca246(T, I2));
      var J = { k: "bo", de: "salvador", t: "Prográmame el recordatorio para el lunes", ts: NOW - 25 * 3600000 }; o.ind.push(indicacionCaduca246(T, J));
      return o; });
    eq("personas: viejo largo sin cifra NO; reciente largo SÍ; msg_imp=1 SÍ; cifra vieja SÍ; decisión vieja SÍ; archivo SÍ; msg_imp=0 NO", r4.r, [false, true, true, true, true, true, false]);
    eq("indicación a Claude caduca: de menos de 24 h y sin respuesta no; con 'Listo' o >24 h, no", r4.ind, [false, true, true, true]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  malas.forEach(function (m) { console.log("MAL " + m); });
  console.log("RESULTADO " + ok + "/" + n); process.exit(ok === n ? 0 : 1);
})();
