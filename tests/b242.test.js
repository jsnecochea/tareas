#!/usr/bin/env node
/* PRUEBAS build 242 (Salvador 21:58, "Decoración Navideña Cumbres", datos REALES leídos con el conector: chuy-cumbres-decidir-arboles).
   Globos limpios estilo iMessage: sin "Salvador · 17:20" ni "acomodó Claude"; palomitas y destello; tocar = hoja de detalle (canal, fecha,
   de quién, entrega, quién lo acomodó, OK · Mover · Nueva · Dato). Separadores de día. Notas de la IA disfrazadas ("HILO (", "Chuy pregunta
   (3:22pm)…") = nota gris de Claude; con el original entre comillas, el original es el globo de la persona. Importante: resumen, el dictado,
   la pregunta real de Chuy y los 5 archivos (más lo que Claude marcó msg_imp 1). Pasos es ficha. Correr: node tests/b242.test.js (CAP=…) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var FX = JSON.parse(fs.readFileSync(path.join(__dirname, "fx-navidena-242.json"), "utf8"));
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 242", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 242, true);
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
    var r = await p.evaluate(function (FX) {
      yo = "salvador"; var o = {};
      function solo() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      window.solo = solo; window.N242 = JSON.parse(JSON.stringify(FX)); tareas = [N242]; abierta = N242.id; vista = "hilo"; render(); solo();
      function vis() { return [].map.call(document.querySelectorAll(".msgs [data-mix], .msgs [data-hab], .msgs .nia242, .msgs .res230"), function (b) { return (b.classList.contains("nia242") ? "NOTA " : b.classList.contains("res230") ? "RESUMEN " : "") + b.textContent.replace(/\s+/g, " ").trim().slice(0, 50); }); }
      o.imp = vis(); o.filtro = document.getElementById("cnlpill").textContent;
      o.fichas = [].map.call(document.querySelectorAll(".chips225 > button"), function (b) { return b.textContent; });
      o.pasosBloque = document.querySelectorAll(".msgs .pasos, .pasos210, .pz").length;
      return o; }, FX);
    async function foto(nom) { if (!process.env.CAP) return; var hh = await p.evaluate(function () { var sc = document.querySelector(".scroll"); return sc ? sc.scrollHeight : 700; }); await p.setViewportSize({ width: 390, height: Math.min(3200, hh + 260) }); await p.evaluate(function () { var sc = document.querySelector(".scroll"); if (sc) sc.scrollTop = 0; });
      await p.screenshot({ path: path.join(process.env.CAP, nom) }); await p.setViewportSize({ width: 390, height: 844 }); }
    await foto("b242-navidena-importante.png");
    var r2 = await p.evaluate(function () { var o = {}; poneVista230(N242, ""); window.__cnl = window.__cnl || {}; window.__cnl[N242.id] = "todo"; render(); solo();   /* como tocar "Todo" en la hoja del filtro */
      o.todo = [].map.call(document.querySelectorAll(".msgs [data-mix], .msgs [data-hab], .msgs .nia242, .msgs .dia242"), function (b) { return (b.classList.contains("nia242") ? "NOTA " : b.classList.contains("dia242") ? "DIA " : "") + b.textContent.replace(/\s+/g, " ").trim().slice(0, 45); });
      o.metaTexto = [].filter.call(document.querySelectorAll(".msgs .b .st"), function (s) { return /\d{1,2}:\d{2}|acomodó|Salvador ·|Claude ·/.test(s.textContent); }).length;
      o.sinTextoAcomodo = !/acomodó Claude/.test(document.querySelector(".msgs").textContent);
      return o; });
    await foto("b242-navidena-todo.png");
    var r3 = await p.evaluate(function () { var o = {};
      var b = [].filter.call(document.querySelectorAll(".msgs [data-mix]"), function (x) { return /clavijas/.test(x.textContent); })[0]; b.click();
      var h = document.getElementById("det242"); o.det = [].map.call(h.querySelectorAll(".mfr"), function (r) { return r.querySelector(".k").textContent + ": " + r.querySelector(".v").textContent; });
      o.botones = [].map.call(h.querySelectorAll(".ac226 button"), function (x) { return x.textContent; });
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b242-detalle-globo.png") });
    var r4 = await p.evaluate(function () { var o = {}; var h = document.getElementById("det242"); if (h) h.remove();
      document.querySelector('[data-chip="pasos"]').click(); var hj = document.querySelector(".h225"); o.pasos = [hj.querySelector(".h225h b").textContent, /Dar seguimiento a Pato/.test(hj.textContent)];
      o.nia = [esNotaIA242({ k: "bo", de: "salvador", t: "HILO (WhatsApp, Chuy), hoy: …" }), esNotaIA242({ k: "bi", wa_in: 1, wa_c: "Chuy", t: "Chuy: Chuy pregunta (3:22pm): \"Ya nomas\"" }), esNotaIA242({ k: "bi", t: "📝 Nota IA 19:35: x" }), esNotaIA242({ k: "bi", wa_in: 1, wa_c: "Chuy", t: "Chuy: Ya quedó lo del cable" }), esNotaIA242({ k: "bo", de: "salvador", t: "Ya le dije que comience" })];
      return o; });
    var I = r.imp.join(" | "), T = r2.todo.join(" | ");
    eq("arranca en Importante, con 'Pasos 0/4' como ficha (no el bloque grande)", [r.filtro, r.fichas.indexOf("Pasos 0/4") >= 0, r.pasosBloque], ["Importante", true, 0]);
    eq("Importante: resumen, el dictado de Salvador, la pregunta real de Chuy y los 5 archivos", [/^RESUMEN/.test(r.imp[0]), /Ya le dije que comience con los de avenida/.test(I), /Ya nomas me dise cuales árboles van hacer/.test(I), r.imp.filter(function (x) { return /\[foto\]|Archivo enviado|^(?:Foto)+$/.test(x); }).length], [true, true, true, 3]);   /* build 244: los 4 "Archivo enviado: wa_….jpeg" van en 2 globos de cuadrícula (los separa un audio) + la foto con texto = 3 elementos */
    eq("Importante: nada de notas de IA, HILO, toques, avisos ni lo que salió por WhatsApp sin archivo", [/NOTA|HILO|Nota IA|Ya venció|Van 3|Segunda vez|Audio enviado|✉️|Enviado:|Movida|No entiendo bien|La de esta tarea son todos/.test(I)], [false]);
    eq("Importante: y lo que Claude marcó importante (msg_imp 1)", [/Ya ahorita qe me valla/.test(I), /Si salvador son a los/.test(I)], [true, true]);
    eq("Todo: HILO y la nota de Chuy son nota gris; el original de Chuy es su globo", [/NOTA HILO \(WhatsApp, Chuy Cumbres Zatarain\)/.test(T), /Chuy: Ya nomas me dise cuales árboles/.test(T), /NOTA Chuy Cumbres Zatarain: Chuy pregunta \(3:22pm\)/.test(T)], [true, true, true]);
    eq("Todo: separadores de día solo cuando cambia", [r2.todo.filter(function (x) { return /^DIA /.test(x); }).length >= 3, r2.todo.some(function (x, i) { return /^DIA /.test(x) && /^DIA /.test(r2.todo[i + 1] || ""); })], [true, false]);
    eq("globos limpios: sin 'Salvador · 17:20' ni 'acomodó Claude'", [r2.metaTexto, r2.sinTextoAcomodo], [0, true]);
    eq("tocar el globo: canal, fecha, de quién, entrega, quién lo acomodó y OK · Mover · Nueva · Dato", [r3.det.map(function (x) { return x.split(":")[0]; }), r3.det[0], r3.det[2], r3.det[3], r3.det[4], r3.botones], [["Canal", "Fecha", "De", "Entrega", "Lo acomodó"], "Canal: WhatsApp", "De: Chuy Cumbres Zatarain", "Entrega: Recibido", "Lo acomodó: Claude", ["OK", "Mover", "Nueva", "Dato", "No guardar"]]);
    eq("Pasos en su hoja", r4.pasos, ["Pasos", true]);
    eq("detecta notas de la IA aunque vengan con otro autor", r4.nia, [true, true, true, false, false]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
