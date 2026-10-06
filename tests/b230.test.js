#!/usr/bin/env node
/* PRUEBAS build 230 (Salvador 16:42, "Inversiones BBVA": el filtro no distinguía nada). Hoja "Todo ⌄": Todo · Importante · Claude · integrantes ·
   agregar o quitar. IMPORTANTE: tarjeta Resumen (campo resumen: texto, acuerdos con palomita y fecha, Falta:, act. hh:mm) y solo lo importante
   (msg_imp=1; sin clasificar: se oculta lo corto sin cifra, fecha, archivo ni pregunta); sin resumen: "Claude está preparando el resumen". La ficha
   Resumen abre esta vista y sale siempre (también en indefinidas). CLAUDE: solo lo que le pediste y lo que contestó (sin "Nota IA" automáticas).
   Integrante de puro número: "Contacto sin nombre ·1884" o su nombre de la agenda. App completa sin red, 390 px. Correr: node tests/b230.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión 230 o mayor", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 230, true);
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
      var acc = "", o = {};
      function arma(acc) {
  window.AGENDA_WA=[]; var NOW=Date.now(), H=function(m){ return NOW-m*60000; };
  var T={id:"tINVBBVA",nombre:"Inversiones BBVA",duenio:"salvador",estado:"abierta",indefinida:true,ritmo:"cada mes",contexto:"Inversiones con el asesor de BBVA: pagarés, fondos y el fideicomiso; Salvador decide los montos",
    resumen:acc==="sinres"?null:{texto:"Se reinvierte el pagaré en fondo de deuda a 28 días; falta la tasa final y el contrato del fondo.",acuerdos:[{t:"Reinvertir $2,500,000 del pagaré en fondo de deuda",fecha:"2026-10-05",de:"Salvador"},{t:"Javier manda el contrato del fondo",fecha:"2026-10-05",de:"Javier Ortiz BBVA"}],pendientes:[{t:"Tasa final del fondo",de:"Javier"},{t:"Firmar contrato"}],actualizado:NOW-20*60000},
    msg_imp:{"w2":1,"w5":0},
    msgs:[{k:"bi",wa_in:1,wa_c:"Javier Ortiz BBVA",id:"w1",t:"Javier Ortiz BBVA: Buenos días Salvador, el pagaré de $2,500,000 vence hoy. ¿Lo reinvertimos en el fondo de deuda a 28 días?",ts:H(300),h:"11:00"},
      {k:"bo",de:"salvador",id:"w2",t:"Sí, exacto, al fondo de deuda",ts:H(290),h:"11:10",wa_auto:"Javier Ortiz BBVA"},
      {k:"bi",wa_in:1,wa_c:"Javier Ortiz BBVA",id:"w3",t:"Javier Ortiz BBVA: Ok",ts:H(285),h:"11:15"},
      {k:"bi",wa_in:1,wa_c:"Javier Ortiz BBVA",id:"w4",t:"Javier Ortiz BBVA: Ahorita salí a comer, regreso y te confirmo",ts:H(280),h:"11:20"},
      {k:"bi",wa_in:1,wa_c:"86088425201884",id:"w5",t:"86088425201884: Gracias",ts:H(250),h:"11:50"},
      {k:"bi",nota_ia:1,canal:"priv:salvador",id:"n1",t:"📝 Nota IA 12:01: Javier confirma que manda el contrato hoy",ts:H(239),h:"12:01"},
      {k:"bo",de:"salvador",nota_claude:1,canal:"priv:salvador",id:"c1",t:"Claude, ¿cuánto rinde el fondo de deuda contra el pagaré?",ts:H(200),h:"12:40"},
      {k:"bi",nota_claude:1,canal:"priv:salvador",id:"c2",t:"Con lo que hay en la tarea no tengo la tasa del fondo; Javier quedó de mandarla. El pagaré iba a 10.2%.",ts:H(199),h:"12:41"},
      {k:"bi",wa_in:1,wa_c:"Javier Ortiz BBVA",id:"w6",t:"Javier Ortiz BBVA: La tasa del fondo quedó en 10.45% anual, te mando el contrato el martes 7 de octubre",ts:H(120),h:"14:00"}]};
        return T; }
      function abre(T) { window.__vf230 = {}; window.__cnlClaude = {}; window.__cnl = {}; tareas = [T]; abierta = T.id; vista = "hilo"; render(); /* 235: arranca en Importante; estas pruebas eligen Todo */ poneVista230(T, ""); render(); [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && !/cnl/.test(x.className)) x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      function txt(sel) { return [].map.call(document.querySelectorAll(sel), function (x) { return x.textContent.replace(/\s+/g, " ").trim(); }); }
      function ids() { return [].map.call(document.querySelectorAll(".msgs [data-mix]"), function (x) { return tareas[0].msgs[+x.getAttribute("data-mix")].id; }); }
      abre(arma(""));
      o.fichas = txt(".chips225 > button"); o.todos = ids();
      document.getElementById("cnlpill").click(); o.hoja = txt(".fil227h [data-fil]").map(function (x) { return x.replace(/^(JO|CS)/, ""); });
      document.querySelector('.fil227h [data-fil="imp"]').click();
      o.imp = [document.getElementById("cnlpill").textContent, ids(), !!document.querySelector(".msgs .cmodo"), document.querySelector(".scroll").scrollTop];
      var rc = document.querySelector(".res230"); o.res = [rc.querySelector(".rtx").textContent, txt(".res230 .racu li"), rc.querySelector(".rfal").textContent, /^act\. \d\d:\d\d$/.test(rc.querySelector(".ract").textContent)];
      (function(){ document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="todo"]').click(); })(); o.resCierra = [document.getElementById("cnlpill").textContent, !!document.querySelector(".res230")];
      (function(){ document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="imp"]').click(); })(); o.resAbre = [document.getElementById("cnlpill").textContent, !!document.querySelector(".res230")];
      document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="claude"]').click();
      o.claude = [document.getElementById("cnlpill").textContent, ids(), document.getElementById("txt").getAttribute("data-ph")];
      document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="todo"]').click(); o.vuelveTodo = [document.getElementById("cnlpill").textContent, ids().length];
      abre(arma("sinres")); o.numero = [txt(".msgs .cn").filter(function (x) { return /1884|Contacto/.test(x); }), /86088425201884/.test(document.getElementById("app").innerHTML)];
      (function(){ document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="imp"]').click(); })(); o.sinRes = txt(".res230");
      var t3 = arma(""); window.AGENDA_WA = [{ nombre: "Laura Mendoza", jid: "86088425201884@lid" }]; abre(t3); o.agenda = txt(".msgs .cn").filter(function (x) { return /Laura/.test(x); });
      var t2 = arma(""); t2.indefinida = true; delete t2.resumen; abre(t2); o.indef = !document.querySelector('[data-chip="resumen"]');
      return o; });
    eq("fichas (234): Indefinida · Todo · Resumen (abre Detalles; sin personas)", r.fichas, ["Indefinida", "Todo", "Resumen"]);
    eq("en Todo sale todo", r.todos, ["w1", "w2", "w3", "w4", "w5", "n1", "c1", "c2", "w6"]);
    eq("hoja: Todo · Importante · Claude · integrantes · agregar o quitar", r.hoja,
      ["Importanteacuerdos y conclusiones", "Todotodo junto", "Claudelo que le pediste y lo que contestó", "Javier Ortiz BBVAexterno · por WhatsApp · solo ve lo suyo", "Contacto sin nombre ·1884no está en tu agenda", "Invitar a nuevo miembroagregar o quitar integrantes"]);
    eq("Importante: msg_imp manda (w2=1 aunque sea corto, w5=0) y lo demás por la regla (fuera 'Ok', 'Ahorita salí a comer…', notas y plática con Claude); arriba el Resumen", r.imp, ["Importante", ["w1", "w2", "w6"], false, 0]);
    eq("tarjeta Resumen: texto, acuerdos con palomita y fecha, Falta y act.", r.res,
      ["Se reinvierte el pagaré en fondo de deuda a 28 días; falta la tasa final y el contrato del fondo.", ["Reinvertir $2,500,000 del pagaré en fondo de deudalun 5 oct", "Javier manda el contrato del fondolun 5 oct"], "Falta: Tasa final del fondo (Javier) · Firmar contrato", true]);
    eq("Todo / Importante desde el filtro (el Resumen vive en Importante)", [r.resCierra, r.resAbre], [["Todo", false], ["Importante", true]]);
    eq("Claude: solo lo que le pediste y lo que contestó (sin Nota IA); la caja es para Claude", r.claude, ["Claude", ["c1", "c2"], "Indicación para Claude…"]);
    eq("vuelve a Todo", r.vuelveTodo, ["Todo", 9]);
    eq("sin resumen: 'Claude está preparando el resumen'", r.sinRes, ["ResumenClaude está preparando el resumen"]);
    eq("número sin nombre: 'Contacto sin nombre ·1884' y nunca el número completo", r.numero, [["Contacto sin nombre ·1884:"], false]);
    eq("si la agenda lo tiene, su nombre", r.agenda, ["Laura Mendoza:"]);
    eq("231: sin ficha Resumen suelta", r.indef, true);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
