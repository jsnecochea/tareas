#!/usr/bin/env node
/* PRUEBAS build 235 (Salvador 18:56–18:58): 1) al abrir CUALQUIER tarea el filtro arranca en "Importante" (resumen arriba y solo lo
   importante; ficha "Importante ⌄"); hoja: Importante · Todo · Claude · integrantes · Invitar; sin nada importante ni resumen: tarjeta
   "Claude está preparando el resumen" + botón chico "Ver todo". 2) Ficha "Claves n/m" despues de la fecha (t.claves): ÁMBAR si falta
   alguna y el límite (o la fecha de la tarea) está a ≤7 días, ROJO si pasó, completas = normal con palomita; hoja con palomita/círculo,
   clip a la confirmación (visor del 229) y "Agregar clave". Fila: una sola, se desliza. Correr: node tests/b235.test.js (CAP=<carpeta>) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 233", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 233, true);

eq("ninguna font-family sin respaldo del sistema", (html.match(/font-family:(Archivo|Barlow);/g) || []).length, 0);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };   /* firebase sin red: solo lo que se llama al arrancar */
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {}; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    var r = await p.evaluate(function () {
      yo = "salvador"; var o = {}, NOW = Date.now(), H = hoy(), mas = function (d) { var x = new Date(H + "T12:00:00"); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
      function solo() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && !/cnl|leemask|mov225/.test(x.className) && x.id !== "evi229") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      function abre(T) { tareas = [T]; abierta = T.id; vista = "hilo"; window.__hoja225 = null; render(); solo(); }
      function fichas() { return [].map.call(document.querySelectorAll(".chips225 > button"), function (x) { return x.textContent; }); }
      var TUL = { id: "tTULUM", nombre: "Viaje Tulum", duenio: "salvador", estado: "abierta", f_vigente: mas(5), fecha_dictada: true,
        claves: [{ id: "k1", t: "Vuelo de ida", ok: true, evidencia_ref: 0 }, { id: "k2", t: "Vuelo de regreso", ok: true, evidencia_ref: "ev-reg" },
          { id: "k3", t: "Hotel noche 1", ok: true, evidencia_ref: 2 }, { id: "k4", t: "Hotel noche 2", ok: false, fecha_limite: mas(3), nota: "el hotel pide confirmar con tarjeta" }],
        evidencia: [{ titulo: "Confirmación Viva Aerobus TRC→TQO", fuente: "Gmail", fecha: H, tipo: "texto", texto: "Reservación confirmada · ida" },
          { id: "ev-reg", titulo: "Confirmación Viva Aerobus TQO→TRC", fuente: "Gmail", fecha: H, tipo: "texto", texto: "Reservación confirmada · regreso" },
          { titulo: "Reserva hotel · noche 1", fuente: "Gmail", fecha: H, tipo: "texto", texto: "Una noche confirmada" }],
        resumen: { texto: "Vuelos y primera noche confirmados; falta asegurar la segunda noche del hotel.", acuerdos: [{ t: "Vuelos comprados" }], pendientes: [{ t: "Hotel noche 2", de: "Salvador" }], actualizado: NOW },
        msgs: [{ k: "yo", de: "salvador", t: "Ya compré los vuelos, salimos el viernes a las 7:40", ts: NOW - 4e6, h: "10:00" }, { k: "yo", de: "salvador", t: "ok", ts: NOW - 3e6, h: "10:20" }] };
      abre(TUL); o.tulum = [fichas(), document.querySelector('[data-chip="claves"]').className, !!document.querySelector(".msgs .res230")];
      o.unaFila = (function () { var b = document.querySelectorAll(".chips225 > button"), y = Math.round(b[0].getBoundingClientRect().top); return [].every.call(b, function (x) { return Math.round(x.getBoundingClientRect().top) === y; }); })();
      o.mensajes = [].map.call(document.querySelectorAll(".msgs [data-mix]"), function (x) { return x.textContent.replace(/\s+/g, " ").slice(0, 25); }).length;
      document.getElementById("cnlpill").click(); o.hojaFil = [].map.call(document.querySelectorAll(".fil227h [data-fil]"), function (x) { return x.getAttribute("data-fil"); }).slice(0, 3).concat([[].slice.call(document.querySelectorAll(".fil227h [data-fil]")).pop().getAttribute("data-fil")]);
      document.querySelector('.fil227h [data-fil="todo"]').click(); o.todo = [document.getElementById("cnlpill").textContent, !!document.querySelector(".res230")];
      tareas = [TUL, { id: "tOTRA", nombre: "Otra", duenio: "salvador", estado: "abierta", msgs: [] }]; abierta = "tOTRA"; render(); abierta = "tTULUM"; render(); solo(); o.reabre = document.getElementById("cnlpill").textContent;
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b235-tulum-importante.png") });
    var r2 = await p.evaluate(function () { var o = {};
      document.querySelector('[data-chip="claves"]').click(); var h = document.querySelector(".h225");
      o.hoja = [h.querySelector(".h225h b").textContent, (h.querySelector(".h225s") || {}).textContent || "", [].map.call(h.querySelectorAll(".clv235r"), function (x) { return [x.querySelector(".clvt span").textContent, x.classList.contains("ok"), !!x.querySelector("[data-clvev]")]; }), !!h.querySelector("#clvnew"), !!h.querySelector("[data-clvadd]")];
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b235-hoja-claves.png") });
    var r3 = await p.evaluate(function () { var o = {}, NOW = Date.now(), H = hoy(), mas = function (d) { var x = new Date(H + "T12:00:00"); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
      function solo() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      document.querySelector('.h225 [data-clvev="1"]').click(); var ev = document.getElementById("evi229"); o.visor = ev ? ev.querySelector(".evtx b").textContent : ""; if (ev) ev.remove();
      var T = tareas[0]; document.querySelector('.h225 [data-clv="k4"]').click(); o.palomea = [T.claves[3].ok, T.claves[3].por, (document.querySelector('[data-chip="claves"]') || {}).textContent];
      document.querySelector('.h225 [data-clv="k4"]').click();
      document.getElementById("clvnew").value = "seguro de viaje"; document.querySelector(".h225 [data-clvadd]").click(); o.agrega = [T.claves.length, T.claves[4].t, T.claves[4].ok, document.querySelector('[data-chip="claves"]').textContent];
      var ro = JSON.parse(JSON.stringify(T)); ro.id = "tRO"; ro.claves = ro.claves.slice(0, 4); ro.claves[3].fecha_limite = mas(-1); tareas = [ro]; abierta = "tRO"; window.__hoja225 = null; render(); o.rojo = document.querySelector('[data-chip="claves"]').className;
      var lej = JSON.parse(JSON.stringify(ro)); lej.id = "tLEJ"; lej.f_vigente = mas(30); lej.claves[3].fecha_limite = mas(20); tareas = [lej]; abierta = "tLEJ"; render(); o.lejos = document.querySelector('[data-chip="claves"]').className;
      var ok = JSON.parse(JSON.stringify(ro)); ok.id = "tOK"; ok.claves[3].ok = true; tareas = [ok]; abierta = "tOK"; render(); var c = document.querySelector('[data-chip="claves"]'); o.todas = [c.className, c.textContent, /M5 12.5l4.5/.test(c.innerHTML)];
      var sin = { id: "tSIN", nombre: "Revisar bomba", duenio: "salvador", estado: "abierta", msgs: [{ k: "yo", de: "salvador", t: "ok", ts: NOW - 1e6, h: "9:00" }] };
      tareas = [sin]; abierta = "tSIN"; render(); solo(); o.vacio = [document.getElementById("cnlpill").textContent, !!document.querySelector(".res230"), !!document.querySelector("[data-vt235]"), !document.querySelector('[data-chip="claves"]')];
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b235-importante-vacio.png") });
    var r4 = await p.evaluate(function () { document.querySelector("[data-vt235]").click(); return [document.getElementById("cnlpill").textContent, document.querySelectorAll(".msgs [data-mix]").length]; });
    eq("Viaje Tulum: fecha · Claves 3/4 (ámbar) · Importante ⌄ · Resumen, en una fila; abre en Importante con el resumen", [r.tulum[0], / amb235/.test(r.tulum[1]), r.tulum[2], r.unaFila], [[r.tulum[0][0], "Claves 3/4", "Importante", "Resumen"], true, true, true]);
    eq("en Importante solo lo importante (el 'ok' no sale)", r.mensajes, 1);
    eq("hoja del filtro: Importante · Todo · Claude … Invitar", r.hojaFil, ["imp", "todo", "claude", "__int"]);
    eq("Todo lo regresa todo; al volver a abrir la tarea arranca otra vez en Importante", [r.todo, r.reabre], [["Todo", false], "Importante"]);
    eq("hoja de claves: palomita o círculo, clip con confirmación, Agregar clave", r2.hoja, ["Claves", "1 por asegurar · 7 días o menos",
      [["Vuelo de ida", true, true], ["Vuelo de regreso", true, true], ["Hotel noche 1", true, true], ["Hotel noche 2", false, false]], true, true]);
    eq("el clip abre la confirmación (evidencia_ref por id) en el visor", r3.visor, "Confirmación Viva Aerobus TQO→TRC");
    eq("palomear a mano: queda ok, por Salvador, ficha 4/4", r3.palomea, [true, "salvador", "Claves 4/4"]);
    eq("Agregar clave", r3.agrega, [5, "Seguro de viaje", false, "Claves 3/5"]);
    eq("límite vencido: ROJO; lejos (>7 días): normal", [/ red/.test(r3.rojo), / red| amb235/.test(r3.lejos)], [true, false]);
    eq("todas completas: normal con palomita", [/ red| amb235/.test(r3.todas[0]), r3.todas[1], r3.todas[2]], [false, "Claves 4/4", true]);
    eq("sin nada importante ni resumen: Importante con 'Claude está preparando el resumen' y 'Ver todo'; sin claves no hay ficha", r3.vacio, ["Importante", true, true, true]);
    eq("'Ver todo' pasa a Todo", r4, ["Todo", 1]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
