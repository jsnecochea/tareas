#!/usr/bin/env node
/* PRUEBAS build 228 (Salvador 16:33): encabezado aún más compacto, estilo Apple. Botones de arriba chicos (≈33 px) y sin fondo; UNA fila de
   fichas iguales: fecha · Lista · personas · Agendado · Resumen · Todo ⌄ · Detalles (se desliza de lado, sin segunda fila); sin "1 cosa para
   ti", sin el renglón "Agendado ✓ · Calendario…" y sin el bloque grande del Resumen. "Agendado" verde SOLO con alerta de Doit Y evento en
   Google Calendar; si falta uno, gris "Sin agendar" / "Falta calendario"; al tocarla, hoja chica con qué hay y qué falta. "Resumen" se despliega
   debajo de las fichas. App completa sin red, 390 px. Correr: node tests/b228.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión 228 o mayor", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 228, true);
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
      try { localStorage.clear(); } catch (e) {}
      function FIESTA(ag, cal) { return { id: "tIAMUUK9ZCWJW", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", f_vigente: "2026-11-13", fecha_dictada: true, agendado: ag, gcal_id: cal ? "evt1" : "", gcal: cal ? "" : (ag ? "pendiente" : ""),
        avisos: ag ? [{ id: "a1", fecha: "2026-11-13", hora: "14:00" }] : [], evento: { titulo: "Comida cumpleaños", fecha: "2026-11-13", hora: "14:00", lugar: "Casa" },
        contexto: "Comida de cumpleaños de mi papá el 13 de noviembre a partir de las dos de la tarde con la familia y amigos en la casa", ritmo: "cada semana",
        checklist: { titulo: "Invitados", items: [{ id: "1", tx: "Lore y Javier", estado: 2 }, { id: "2", tx: "Pollo", estado: 0 }, { id: "3", tx: "Sada", estado: 1 }, { id: "4", tx: "Néstor", estado: 2 }] },
        wa_contactos: [{ nombre: "Eduardo Madero" }, { nombre: "Arturo Tijerina" }, { nombre: "Javier Fernández" }],
        msgs: [{ k: "bo", de: "salvador", t: "Ya le mandé la invitación a todos", ts: NOW - 9e6, h: "09:00" },
          { k: "bi", wa_in: 1, wa_c: "Arturo Tijerina", t: "Arturo Tijerina: Ahí estaremos", ts: NOW - 8e6, h: "09:40" },
          { k: "bi", wa_in: 1, wa_c: "Javier Fernández", t: "Javier Fernández: Muy bien, fecha separada", ts: NOW - 7e6, h: "10:10" },
          { k: "bi", wa_in: 1, wa_c: "Eduardo Madero", t: "Eduardo Madero: ¿Hay miercolitos esta semana?", ts: NOW - 6e6, h: "13:50", duda_tarea: { alternativa_id: "tPADEL", alternativa_nombre: "Pádel miércoles" } }] }; }
      function abre(t) { tareas = [t, { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] }]; abierta = t.id; vista = "hilo"; window.__hoja225 = null; render();
        [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && !/cnl|mov225|leemask/.test(x.className + x.id)) x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      function fichas() { return [].map.call(document.querySelectorAll(".chips225 > button"), function (x) { return x.textContent + (x.classList.contains("verde") ? "[verde]" : ""); }); }
      abre(FIESTA(true, true));
      o.fichas = fichas();
      var tops = [].map.call(document.querySelectorAll(".chips225 > button"), function (x) { return Math.round(x.getBoundingClientRect().top); }), w = document.querySelector(".chips225");
      o.unaFila = [tops.every(function (y) { return y === tops[0]; }), getComputedStyle(w).overflowX, getComputedStyle(w).flexWrap];
      o.quitado = [document.querySelectorAll(".paraTi225,.agst,.rv225,.rvrow227,.rv228").length];
      var bts = [].map.call(document.querySelectorAll(".top .iconbtn:not(#bback)"), function (x) { var r = x.getBoundingClientRect(), cs = getComputedStyle(x); return [Math.round(r.width), cs.backgroundColor === "rgba(0, 0, 0, 0)", cs.borderTopWidth]; });
      o.botones = bts;
      o.tituloAncho = Math.round(document.querySelector(".top .t").getBoundingClientRect().width);
      document.querySelector('[data-chip="agenda"]').click(); var hj = document.querySelector(".h225");
      o.hojaCompleto = [hj.querySelector(".h225h b").textContent, [].map.call(hj.querySelectorAll(".mfr"), function (x) { return x.querySelector(".k").textContent + ": " + x.querySelector(".v").textContent; })];
      abre(FIESTA(true, false)); o.faltaCal = fichas().filter(function (x) { return /agend|calendario/i.test(x); })[0];
      document.querySelector('[data-chip="agenda"]').click(); o.hojaFalta = [].map.call(document.querySelectorAll(".h225 .mfr"), function (x) { return x.querySelector(".k").textContent + ": " + x.querySelector(".v").textContent; });
      abre(FIESTA(false, false)); o.sinAgendar = fichas().filter(function (x) { return /agend|calendario/i.test(x); })[0];
      var sin = FIESTA(false, false); delete sin.evento; sin.nombre = "Revisar bomba"; delete sin.checklist; sin.contexto = "Revisar la bomba de agua del jardín porque hace ruido y no sube bien la presión al tinaco"; sin.msgs = sin.msgs.slice(0, 1); abre(sin); o.sinEvento = fichas().some(function (x) { return /agend|calendario/i.test(x); });
      abre(FIESTA(true, true));
      (function(){ document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="imp"]').click(); })(); o.resAbre = [!!document.querySelector(".msgs .res230"), "true", document.getElementById("cnlpill").textContent];
      (function(){ document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="todo"]').click(); })(); o.resCierra = !!document.querySelector(".res230");
      document.getElementById("cnlpill").click(); o.todoHoja = !!document.querySelector(".fil227h"); document.querySelector('.fil227h [data-fil="claude"]').click(); o.todoTx = document.getElementById("cnlpill").textContent;
      o.pregunta = [!!document.querySelector(".ptcard .ac226"), !!document.querySelector(".ptmin227")];
      o.mic = getComputedStyle(document.getElementById("tmic")).backgroundColor;
      return o; });
    eq("UNA fila (231): fecha · Lista n/m · Agendado · Todo · ⓘ", r.fichas, ["vie 13 nov", "Lista 3/4", "Agendado[verde]", "Todo", ""]);
    eq("sin segunda fila: se desliza de lado", r.unaFila, [true, "auto", "nowrap"]);
    eq("quitados: '1 cosa para ti', el renglón de agendado y el bloque del Resumen", r.quitado, [0]);
    eq("audífono y … chicos (30 px, 233) sin fondo ni borde; sin archivos no hay clip", r.botones, [[30, true, "0px"], [30, true, "0px"]]);
    eq("el título gana espacio", r.tituloAncho >= 200, true);
    eq("Agendado completo: hoja con lo que hay", r.hojaCompleto, ["Agendado", ["Alerta de Doit: Lista · vie 13 nov 14:00", "Google Calendar: Evento creado", "Evento: vie 13 nov · 14:00 · Casa"]]);
    eq("alerta sin evento de Calendar: gris 'Falta calendario' y la hoja dice qué falta", [r.faltaCal, r.hojaFalta.slice(0, 2)], ["Falta calendario", ["Alerta de Doit: Lista · vie 13 nov 14:00", "Google Calendar: Falta · en camino (lo crea el trabajador de Calendar)"]]);
    eq("evento sin nada agendado: gris 'Sin agendar'; sin evento no hay ficha", [r.sinAgendar, r.sinEvento], ["Sin agendar", false]);
    eq("Resumen (231): vive en Importante, dentro del filtro", [r.resAbre, r.resCierra], [[true, "true", "Importante"], false]);
    eq("Todo ⌄ abre la hoja del filtro (227) y lo elegido reemplaza el texto", [r.todoHoja, r.todoTx], [true, "Claude"]);
    eq("se quedan: Te pregunta con OK · Mover · Nueva y minimizar", r.pregunta, [true, true]);
    eq("micrófono verde", r.mic, "rgb(48, 209, 88)");
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
