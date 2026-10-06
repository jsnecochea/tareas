#!/usr/bin/env node
/* PRUEBAS build 229 (Salvador 16:34 y 16:36; "Limpieza Lote Samuel" y "Blue Cup BBVA"). A) tarea nueva sin clasificar: Tarea · Dato · Vincular
   chicos en una fila; Vincular = la hoja "Vincular a otra tarea" que ya existía (lupa), con "Tarea nueva" y las parecidas primero; al vincular
   todo pasa a la elegida y la suelta queda apartada (nada se borra); encabezado del 228 (sin las pastillas viejas). B) franja compacta
   "Agendar": una línea con lo que propone Claude, clip de evidencia, Sí y ⋯; "¿Te lo agendo?" ya no va en "Datos de la tarea"; la línea se
   lee con el audífono; evidencia (campo "evidencia", o dentro de "datos"): hoja con fuente, título y fecha; imagen al visor, texto completo;
   sin evidencia: clip gris "sin fuente" y fecha en ámbar; clip también en Contexto. App completa sin red, 390 px. Correr: node tests/b229.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión 229 o mayor", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 229, true);
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
      yo = "salvador"; if (!PERSONAS.salvador) PERSONAS.salvador = { nombre: "Salvador", jefe: true };
      var NOW = Date.now(), o = {};
      function LOTE() { return { id: "tIALOTE1", nombre: "Limpieza Lote Samuel", duenio: "salvador", creada_por: "ia_revisor", por_autorizar: true, estado: "abierta",
        msgs: [{ k: "bi", wa_in: 1, wa_c: "Samuel Gamez ciper", t: "Samuel Gamez ciper: Ya quedó la limpieza del lote, mañana te mando fotos", ts: NOW - 3e6, h: "16:20" }] }; }
      function LIMP() { return { id: "tLIMP", nombre: "Limpieza y mantenimiento lotes Cumbres", duenio: "salvador", estado: "abierta", contexto: "Limpieza de lotes con Samuel", msgs: [{ k: "bo", de: "salvador", t: "Samuel, ¿cómo vas?", ts: NOW - 9e6, h: "08:00" }] }; }
      var EVI = [{ tipo: "texto", fuente: "correo", titulo: "Invitación Blue Cup BBVA", fecha: "2026-09-19", de: "BBVA Eventos", texto: "Fecha límite para confirmar renta de equipo: 9 de octubre." },
        { tipo: "imagen", fuente: "whatsapp", titulo: "Itinerario del torneo", fecha: "2026-09-20", de: "Rogelio Sada", url: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=" }];
      function BLUE(evi, enDatos) { var t = { id: "tBLUE", nombre: "Blue Cup BBVA", duenio: "salvador", tipo_item: "tarea", tipo_elegido: true /* 236/237: la franja sale ya clasificada por Salvador */, creada_por: "ia_revisor", por_autorizar: true, estado: "abierta", indefinida: true,
        contexto: "Torneo de golf Blue Cup BBVA en Riviera Maya del 21 al 23 de octubre; hay que confirmar la renta de equipo a más tardar el viernes 9 de octubre",
        evento: { titulo: "Límite confirmar renta de equipo", fecha: "2026-10-09", hora: "", lugar: "", todo_dia: false }, msgs: [{ k: "bi", t: "IA: creada desde correo", ts: NOW - 5e6, h: "09:00" }] };
        if (enDatos) t.datos = { evidencia: evi }; else t.evidencia = evi; return t; }
      function abre(ts) { tareas = ts; abierta = ts[0].id; vista = "hilo"; render(); [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && !/hoja-velo|leemask|visor/.test(x.className + x.id)) x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      /* A */
      abre([LOTE(), LIMP(), { id: "tGOLF", nombre: "Golf simulador", duenio: "salvador", estado: "abierta", msgs: [] }]);
      var tb = [].map.call(document.querySelectorAll(".typep229 button"), function (x) { return [x.textContent, Math.round(x.getBoundingClientRect().top), Math.round(x.getBoundingClientRect().height)]; });
      o.tres = [tb.map(function (x) { return x[0]; }), tb.every(function (x) { return x[1] === tb[0][1]; }), tb.every(function (x) { return x[2] >= 46 && x[2] <= 50; })];   /* 236: grandes otra vez */
      o.encabezado = [document.querySelectorAll(".cnlwrap,#cnlclaude,#intbtn").length, !!document.querySelector(".chips225 #cnlpill")];
      document.querySelector('[data-tipoi="vincular"]').click();
      o.hoja = [!!document.getElementById("enlq"), [].map.call(document.querySelectorAll("#enlv .enlr"), function (x) { return x.querySelector(".enln").textContent; })];
      var L0 = tareas[0]; document.querySelector('#enll [data-d="tLIMP"]').click(); document.getElementById("hojaok").click();
      var D = tareas.filter(function (x) { return x.id === "tLIMP"; })[0];
      o.vincula = [L0.estado, L0.fusionada_en, L0.msgs.length, D.msgs.some(function (m) { return /limpieza del lote/.test(m.t); })];
      abre([LOTE(), LIMP()]); document.querySelector('[data-tipoi="vincular"]').click(); document.querySelector("#enlv [data-nueva]").click();
      o.tareaNueva = [tareas[0].tipo_item, !!document.getElementById("enlv")];
      /* B */
      abre([BLUE(EVI)]);
      var ag = document.querySelector(".agenda229");
      o.franja = [ag.querySelector(".agk").textContent, ag.querySelector(".agp").textContent, ag.querySelector(".agp").classList.contains("ambar"), (ag.querySelector(".evclip") || {}).textContent, !!ag.querySelector("[data-agenda=si]"), !!ag.querySelector("[data-agmenu]"), !!ag.querySelector('input[type="time"]')];
      o.sinRenglonDatos = !/agendo/i.test((document.querySelector(".fic.info") || {}).textContent || "");
      o.clipCtx = !!document.querySelector(".fic.ctx [data-evid]");
      o.lee = _leeAgenda229(tareas[0]).tx;
      ag.querySelector("[data-evid]").click(); var ev = document.getElementById("evi229");
      o.evi = [].map.call(ev.querySelectorAll(".evr"), function (x) { return [!!x.querySelector("svg"), x.querySelector(".evt span").textContent, x.querySelector(".evt small").textContent]; });
      ev.querySelector('[data-evi="0"]').click(); o.texto = (ev.querySelector(".evtx p") || {}).textContent;
      ev.remove(); document.querySelector(".agenda229 [data-evid]").click(); document.querySelector('#evi229 [data-evi="1"]').click(); o.visor = document.getElementById("visor").classList.contains("on");
      document.getElementById("visor").classList.remove("on");
      document.querySelector(".agenda229 [data-agmenu]").click(); o.menu = [].map.call(document.querySelectorAll("#leemask button"), function (x) { return x.textContent; }); leeCierraMenu();
      document.querySelector(".agenda229 [data-agenda=si]").click(); o.si = [tareas[0].agendado, tareas[0].evento.todo_dia === true || !tareas[0].evento.hora];
      abre([BLUE([])]); var ag2 = document.querySelector(".agenda229");
      o.sinFuente = [ag2.querySelector(".evclip").classList.contains("sin"), ag2.querySelector(".evclip").textContent, ag2.querySelector(".agp").classList.contains("ambar")];
      abre([BLUE(EVI, true)]); o.enDatos = [document.querySelector(".agenda229 .evclip").textContent, document.querySelector(".agenda229 .agp").classList.contains("ambar")];
      var B2 = BLUE([{ tipo: "texto", fuente: "drive", titulo: "Hoja de costos", fecha: "2026-09-01", texto: "Sin fechas aquí" }]); abre([B2]); o.noRespalda = document.querySelector(".agenda229 .agp").classList.contains("ambar");
      return o; });
    eq("A) Tarea · Dato · Vincular en una fila (236: grandes, 48 px)", r.tres, [["Tarea", "Dato", "Vincular"], true, true]);
    eq("encabezado del 228 (sin pastillas viejas; Todo ⌄ en las fichas)", r.encabezado, [0, true]);
    eq("Vincular = la hoja que ya existía (lupa), con Tarea nueva y la parecida primero", r.hoja, [true, [" Crear tarea nueva", "Limpieza y mantenimiento lotes Cumbresparecida", "Golf simulador"]]);
    eq("al vincular: los mensajes pasan y la suelta queda apartada (no borrada)", r.vincula, ["fusionada", "tLIMP", 1, true]);
    eq("Tarea nueva: queda como tarea", r.tareaNueva, ["tarea", false]);
    eq("B) franja Agendar: una línea, clip con 2, Sí, ⋯ y sin campo de hora", r.franja, ["Agendar", "Vie 9 oct · todo el día · Límite confirmar renta de equipo", false, "2", true, true, false]);
    eq("'¿Te lo agendo?' ya no va en Datos de la tarea", r.sinRenglonDatos, true);
    eq("el mismo clip en Contexto", r.clipCtx, true);
    eq("la línea se lee con el audífono", r.lee, "Para agendar: Vie 9 oct, todo el día, Límite confirmar renta de equipo. ¿Lo agendo?");
    eq("hoja de evidencia: ícono de fuente, título y fecha", r.evi, [[true, "Invitación Blue Cup BBVA", "correo · BBVA Eventos · 2026-09-19"], [true, "Itinerario del torneo", "whatsapp · Rogelio Sada · 2026-09-20"]]);
    eq("texto completo e imagen en el visor", [r.texto, r.visor], ["Fecha límite para confirmar renta de equipo: 9 de octubre.", true]);
    eq("⋯: Cambiar fecha u hora · Todo el día · No agendar", r.menu, ["Cambiar fecha u hora", "Todo el día", "No agendar"]);
    eq("Sí agenda (todo el día, como propone)", r.si, [true, true]);
    eq("sin evidencia: clip gris 'sin fuente' y fecha en ámbar", r.sinFuente, [true, "sin fuente", true]);
    eq("evidencia dentro de 'datos' también se lee", r.enDatos, ["2", false]);
    eq("evidencia que no dice la fecha: ámbar", r.noRespalda, true);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
