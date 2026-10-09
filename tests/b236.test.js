#!/usr/bin/env node
/* PRUEBAS build 236 (Salvador 19:24, "Firma de Testamento en Notaría"): Tarea · Dato · Vincular vuelven a ser botones GRANDES (48 px,
   mismo ancho, todo el ancho, esquinas 12), solo contorno: Tarea azul, Dato blanco, Vincular morado; elegido = relleno suave. Justo
   debajo de la fila de fichas. Sin clasificar se ocultan "Solo me falta", "Datos de la tarea", "Agendar" (y la ficha "Falta N"); queda
   el Contexto en una línea con su clip. Al elegir Tarea/Dato aparecen como hoy. Por voz: "es tarea", "es dato", "vincúlala a X".
   Correr: node tests/b236.test.js (CAP=<carpeta>) */
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
      yo = "salvador"; var o = {}, NOW = Date.now();
      function solo() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && x.id !== "enlv") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      window.NOTA = function () { return { id: "tNOTA", nombre: "Firma de Testamento en Notaría", duenio: "salvador", creada_por: "ia_revisor", por_autorizar: true, estado: "abierta",
        contexto: "Firma del testamento en la Notaría 4 con el Lic. Garza; llevar identificación y las escrituras",
        evento: { titulo: "Firma de testamento", fecha: "2026-10-15", hora: "11:00", lugar: "Notaría 4" },
        evidencia: [{ titulo: "Correo de la notaría", fuente: "correo", fecha: "2026-10-05", tipo: "texto", texto: "Le confirmamos la cita para la firma el 15 de octubre a las 11:00" }],
        msgs: [{ k: "bi", t: "Correo de la Notaría 4: cita para firma de testamento el jueves 15 a las 11", ts: NOW - 3e6, h: "18:10" }] }; };
      function abre(T) { tareas = [T, { id: "tGOLF", nombre: "Golf simulador", duenio: "salvador", estado: "abierta", msgs: [] }, { id: "tFID", nombre: "Fideicomiso testamentario BBVA", duenio: "salvador", estado: "abierta", msgs: [] }];
        abierta = T.id; vista = "hilo"; window.__hoja225 = null; render(); solo(); }
      function estado() { var tb = [].slice.call(document.querySelectorAll(".tp236 button")), ch = document.querySelector(".chips225"), tp = document.querySelector(".tp236");
        return { botones: tb.map(function (b) { var c = getComputedStyle(b), q = b.getBoundingClientRect(); return [b.textContent, Math.round(q.height), Math.round(q.width), c.borderTopLeftRadius, c.borderTopColor, c.color, c.backgroundColor]; }),
          ancho: tb.length ? Math.round(tb[2].getBoundingClientRect().right - tb[0].getBoundingClientRect().left) : 0,
          debajo: !!(ch && tp && ch.nextElementSibling === tp),
          oculto: [document.querySelectorAll(".solofalta:not(.leyendo)").length, document.querySelectorAll(".fic.info").length, document.querySelectorAll(".agenda229").length, document.querySelectorAll('[data-chip="falta"]').length],
          ctx: [!!document.querySelector(".fic.ctx236"), !!document.querySelector(".fic.ctx236 [data-evid]")] }; }
      abre(NOTA()); o.sin = estado();
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b236-sin-clasificar.png") });
    var r2 = await p.evaluate(function () { var o = {};
      document.querySelector('.tp236 [data-tipoi="tarea"]').click(); var T = tareas[0];
      var b = document.querySelector('.tp236 [data-tipoi="tarea"]'); o.tarea = [T.tipo_item, b.classList.contains("on"), getComputedStyle(b).backgroundColor,
        document.querySelectorAll(".solofalta").length, document.querySelectorAll(".fic.info").length, document.querySelectorAll(".agenda229").length, !!document.querySelector(".fic.ctx236")];
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b236-elegida-tarea.png") });
    var r3 = await p.evaluate(function () { var o = {};
      function abre(T) { tareas = [T, { id: "tGOLF", nombre: "Golf simulador", duenio: "salvador", estado: "abierta", msgs: [] }, { id: "tFID", nombre: "Fideicomiso testamentario BBVA", duenio: "salvador", estado: "abierta", msgs: [] }]; abierta = T.id; vista = "hilo"; render(); }
      function dicta(tx) { document.getElementById("txt").value = tx; document.getElementById("tenv").click(); }
      abre(NOTA()); document.querySelector('.tp236 [data-tipoi="dato"]').click(); var b = document.querySelector('.tp236 [data-tipoi="dato"]'); o.dato = [tareas[0].tipo_item, b.classList.contains("on"), getComputedStyle(b).backgroundColor];
      abre(NOTA()); document.querySelector('.tp236 [data-tipoi="vincular"]').click(); o.vincular = [!!document.getElementById("enlq"), document.getElementById("enlq").value]; cierraEnlazar();
      abre(NOTA()); dicta("es tarea"); o.vozTarea = tareas[0].tipo_item;
      abre(NOTA()); dicta("es dato"); o.vozDato = tareas[0].tipo_item;
      abre(NOTA()); dicta("vincúlala al fideicomiso"); var q = document.getElementById("enlq"); o.vozVinc = [!!q, q && q.value, [].map.call(document.querySelectorAll("#enll .enlr .enln"), function (x) { return x.textContent; }), tareas[0].tipo_item || ""]; cierraEnlazar();
      o.frases = ["vincúlala a golf", "Vincúlalo con la tarea de Golf simulador", "vincular a fideicomiso.", "vincúlala", "vamos a vincular luego"].map(vincDicho);
      return o; });
    var W = "rgb(255, 255, 255)", AZ = "rgb(10, 132, 255)", MO = "rgb(124, 100, 255)", T0 = "rgba(0, 0, 0, 0)";
    eq("sin clasificar: Tarea · Dato · Vincular, 48 px, mismo ancho, esquinas 12, solo contorno (azul, blanco, morado)", r.sin.botones.map(function (b) { return [b[0], b[1], b[3], b[4], b[5], b[6]]; }),
      [["Tarea", 48, "12px", AZ, AZ, T0], ["Dato", 48, "12px", W, W, T0], ["Vincular", 48, "12px", MO, MO, T0]]);
    eq("mismo ancho y ocupan todo el ancho (390 − 24)", [r.sin.botones[0][2] === r.sin.botones[1][2] && r.sin.botones[1][2] === r.sin.botones[2][2], r.sin.ancho], [true, 366]);
    eq("justo debajo de la fila de fichas", r.sin.debajo, true);
    eq("sin clasificar se ocultan Solo me falta, Datos de la tarea, Agendar y 'Falta N'", r.sin.oculto, [0, 0, 0, 0]);
    eq("queda el Contexto en una línea con su clip", r.sin.ctx, [true, true]);
    eq("eligió Tarea: relleno azul suave y aparecen Solo me falta, Datos de la tarea y Agendar", r2.tarea, ["tarea", true, "rgba(10, 132, 255, 0.18)", 1, 1, 1, false]);
    eq("Dato: relleno blanco suave", r3.dato, ["dato", true, "rgba(255, 255, 255, 0.16)"]);
    eq("Vincular abre la hoja", r3.vincular, [true, ""]);
    eq("por voz: 'es tarea' / 'es dato'", [r3.vozTarea, r3.vozDato], ["tarea", "dato"]);
    eq("por voz: 'vincúlala al fideicomiso' abre la hoja ya buscada; no pide datos", r3.vozVinc, [true, "fideicomiso", ["Fideicomiso testamentario BBVA"], ""]);
    eq("frases de vincular (al inicio)", r3.frases, ["golf", "Golf simulador", "fideicomiso", "", null]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
