#!/usr/bin/env node
/* PRUEBAS build 227 (Salvador 16:24, captura de "Fiesta Cumpleaños Papá" en iPhone): encabezado limpio. Título en UNA línea (completo al
   tocarlo), sin el renglón "Tuya · con …"; UNA sola pastilla "Todo ▾" en el renglón del Resumen (hoja: Todo · Claude · cada integrante;
   lo elegido reemplaza el texto); "Te pregunta" minimizable (se recuerda) con OK · Mover · Nueva si el mensaje no tiene acomodo;
   "Resumen" como encabezado plegable con chevron. App completa sin red, 390 px. Correr: node tests/b227.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión 227 o mayor", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 227, true);
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
      function FIESTA() { return { id: "tIAMUUK9ZCWJW", nombre: "Fiesta Cumpleaños Papá con comida en casa de Lerdo para toda la familia", duenio: "salvador", estado: "abierta", f_vigente: "2026-11-13", fecha_dictada: true, agendado: true,
        contexto: "Comida de cumpleaños de mi papá el 13 de noviembre a partir de las dos de la tarde con la familia y amigos en la casa", ritmo: "cada semana",
        checklist: { titulo: "Invitados", items: [{ id: "1", tx: "Lore y Javier", estado: 2 }, { id: "2", tx: "Pollo", estado: 0 }] },
        wa_contactos: [{ nombre: "Eduardo Madero" }, { nombre: "Arturo Tijerina" }, { nombre: "Javier Fernández" }],
        msgs: [{ k: "bo", de: "salvador", t: "Ya le mandé la invitación a todos", ts: NOW - 9e6, h: "09:00" },
          { k: "bi", wa_in: 1, wa_c: "Arturo Tijerina", t: "Arturo Tijerina: Ahí estaremos", ts: NOW - 8e6, h: "09:40" },
          { k: "bi", wa_in: 1, wa_c: "Javier Fernández", t: "Javier Fernández: Muy bien, fecha separada", ts: NOW - 7e6, h: "10:10" },
          { k: "bi", wa_in: 1, wa_c: "Eduardo Madero", t: "Eduardo Madero: ¿Hay miercolitos esta semana?", ts: NOW - 6e6, h: "13:50", duda_tarea: { alternativa_id: "tPADEL", alternativa_nombre: "Pádel miércoles" } }] }; }
      function pinta() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && !/cnl|mov225|leemask/.test(x.className + x.id)) x.style.display = "none"; }); var A = document.getElementById("app"); A.style.display = "flex"; }
      tareas = [FIESTA(), { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] }]; abierta = "tIAMUUK9ZCWJW"; vista = "hilo"; render(); pinta();
      var tt = document.querySelector(".top .t"), cs = getComputedStyle(tt);
      o.titulo = [cs.whiteSpace, tt.scrollWidth > tt.clientWidth, Math.round(tt.getBoundingClientRect().height) < 40, !document.querySelector(".top .d")];
      tt.click(); var t2 = document.querySelector(".top .t"); o.tituloFull = [getComputedStyle(t2).whiteSpace, t2.textContent];
      t2.click();
      var row = document.querySelector(".chips225"); o.pastilla = [document.querySelectorAll("#cnlpill").length, document.getElementById("cnlpill").textContent, !!row.querySelector("#cnlpill"), !!row.querySelector('[data-chip="resumen"]'), document.querySelectorAll(".cnlwrap,#cnlclaude,#intbtn").length];
      document.getElementById("cnlpill").click(); var sh = document.querySelector(".fil227h");
      o.hoja = [].map.call(sh.querySelectorAll("[data-fil]"), function (x) { return x.getAttribute("data-fil"); });
      o.hojaAv = [].map.call(sh.querySelectorAll(".av227"), function (x) { return x.textContent; });
      sh.querySelector('[data-fil="ext:Eduardo Madero"]').click(); o.eligeEduardo = [document.getElementById("cnlpill").textContent, canalActual(tareas[0]).id];
      document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="claude"]').click(); o.eligeClaude = [document.getElementById("cnlpill").textContent, !!modoClaude(tareas[0])];
      document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="todo"]').click(); o.eligeTodo = document.getElementById("cnlpill").textContent;
      /* te pregunta */
      var pc = document.querySelector(".ptcard"); o.pt = [!!pc, [].map.call(pc.querySelectorAll(".ac226 button"), function (x) { return x.textContent; }), document.querySelectorAll(".msgs .ac226").length];
      document.querySelector(".ptmin227").click(); o.ptMin = [!!document.querySelector(".ptcard"), (document.querySelector(".ptmini227") || {}).textContent, document.querySelectorAll(".msgs .ac226").length];
      render(); o.ptRecuerda = !!document.querySelector(".ptmini227");
      document.querySelector(".ptmini227").click(); o.ptAbre = !!document.querySelector(".ptcard .ac226");
      document.querySelector(".ptcard [data-acok]").click(); o.ptOk = [!!document.querySelector(".ptcard"), document.querySelectorAll(".ptcard .ac226").length, tareas[0].msgs[3].duda_resuelta];
      tareas = [FIESTA(), { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] }]; render();
      document.querySelector(".ptcard [data-acmov]").click(); var mv = document.getElementById("mov225"); o.mover = (mv.querySelector(".opt226.best") || {}).textContent;
      mv.querySelector('[data-movto="tPADEL"]').click(); o.moverSale = [!!document.querySelector(".ptcard"), !!tareas[0].msgs[3].oculto, tareas[1].msgs.length];
      tareas = [FIESTA(), { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] }]; render();
      document.querySelector(".ptcard [data-acnueva]").click(); o.nuevaSale = [!!document.querySelector(".ptcard"), tareas.length];
      /* resumen plegable */
      tareas = [FIESTA()]; render(); var rv = document.querySelector('[data-chip="resumen"]'); o.rvAbierto = [rv.getAttribute("aria-expanded"), !!rv.querySelector("svg"), !!document.querySelector(".rv228")];
      rv.click(); var rv2 = document.querySelector('[data-chip="resumen"]'); o.rvMin = [rv2.getAttribute("aria-expanded"), rv2.textContent, !!rv2.querySelector("svg"), !!document.querySelector(".res230")];
      o.sinEmoji = !/[\u{1F300}-\u{1FAFF}]/u.test(document.querySelector(".top").textContent + document.querySelector(".chips225").textContent);
      return o; });
    eq("título en UNA línea con …, sin el renglón de personas", r.titulo, ["nowrap", true, true, true]);
    eq("al tocar el título sale completo", r.tituloFull, ["normal", "Fiesta Cumpleaños Papá con comida en casa de Lerdo para toda la familia"]);
    eq("UNA sola ficha 'Todo' en la fila de fichas, junto a Resumen (build 228)", r.pastilla, [1, "Todo", true, true, 0]);
    eq("hoja: Todo · Claude · cada integrante (con avatar) · integrantes", [r.hoja, r.hojaAv], [["todo", "imp", "claude", "ext:Arturo Tijerina", "ext:Javier Fernández", "ext:Eduardo Madero", "__int"], ["AT", "JF", "EM"]]);
    eq("lo elegido reemplaza el texto: Eduardo / Claude / Todo", [r.eligeEduardo, r.eligeClaude, r.eligeTodo], [["Eduardo", "ext:Eduardo Madero"], ["Claude", true], "Todo"]);
    eq("Te pregunta con OK · Mover · Nueva (y no repetidos en la burbuja)", r.pt, [true, ["OK", "Mover", "Nueva"], 0]);
    eq("minimizar: una línea 'Te pregunta · Eduardo' y los botones vuelven a la burbuja", r.ptMin, [false, "Te pregunta · Eduardo", 1]);
    eq("se recuerda por tarea", r.ptRecuerda, true);
    eq("se vuelve a abrir", r.ptAbre, true);
    eq("OK: desaparecen los botones, la tarjeta sigue", r.ptOk, [true, 0, "esta"]);
    eq("Mover: hoja '¿A dónde va?' (mismo flujo del 226) y la tarjeta sale de la tarea", [r.mover, r.moverSale], ["Pádel miércolesmás probable", [false, true, 1]]);
    eq("Nueva: la tarjeta sale y hay tarea nueva", r.nuevaSale, [false, 3]);
    eq("Resumen (228/230): ficha con chevron; al tocarla abre la vista Importante con su tarjeta", [r.rvAbierto, r.rvMin], [["false", true, false], ["true", "Resumen", true, true]]);
    eq("sin emojis en el encabezado", r.sinEmoji, true);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
