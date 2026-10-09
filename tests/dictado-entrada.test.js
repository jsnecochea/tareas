#!/usr/bin/env node
/* Entrada única del dictado: lo que se dicta en una tarea se guarda en t.dictados ANTES de interpretarlo, sube al servidor,
   pasa a "aplicado" al guardar lo aplicado, "consulta" si era búsqueda, y si nada lo aplicó (hoja cerrada, modelo caído)
   a los DICTADO_ESPERA_MS queda "sin_aplicar" con aviso en la plática y el texto completo. Caso Fiesta Cumpleaños Papá 8-oct.
   Correr: node tests/dictado-entrada.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    var RD = Date, base = RD.parse("2026-10-08T03:30:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true;
      window.__WA = []; window.__agendaNo = 1; window.__LL = [];
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.NOW = Date.now(); document.getElementById("app").style.display = "flex";
      window.abre = function (T, extra) { [].forEach.call(document.querySelectorAll("#preg249,#hoja254,#acom249,#det242,#mov225,.leemask,.cnlbg,.cnlsheet"), function (e) { e.remove(); });
        window.__dest254 = {}; tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; render(); };
      window.envia = function (v) { var tx = document.getElementById("txt"); tx.value = v; document.getElementById("tenv").click(); };
      /* modelo: j = objeto (contesta en ms) | "caido" (error) ; guarda cada llamada */
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { __LL.push({ modo: mod, prompt: msgs[0].content, t: Date.now() });
        setTimeout(function () { if (j === "caido") cb(null, "No contesto a tiempo."); else cb(JSON.stringify(typeof j === "function" ? j(msgs[0].content) : j)); }, ms || 20); }; };
      window.COMEDOR = function () { return { id: "tCOM", nombre: "Comedor Nuevo", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
        f_vigente: "2026-10-30", f_original: "2026-10-30", fecha_dictada: true, contexto: "Mesa del comedor nuevo en mármol con Manuel Parra (piedra); falta la cotización final.",
        wa_contactos: [{ nombre: "Manuel Parra", desde: 1 }],
        resumen: { que_toca: "Esperando la cotización de Manuel", plan: [{ id: "m1", quien: "Manuel Parra", que: "Mandar la cotización del mármol", estado: "pendiente", origen: "mac", fecha: "2026-10-09" }] },
        msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: Mañana le mando la cotización", ts: NOW - 3600000, h: "20:30", wa_id: "w1" }] }; };
      window.MORIC = function () { return { id: "tMOR", nombre: "Cobranza Moric", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
        f_vigente: "2026-10-15", f_original: "2026-10-15", fecha_dictada: true, contexto: "Cobrar al Moric la cena del 26 de septiembre; el gerente es Rodrigo.",
        wa_contactos: [{ nombre: "Rodrigo Moric", desde: 1 }], msgs: [] }; };
    });
    /* 1 · al dictar se guarda antes de interpretar; la interpretación lo marca aplicado */
    var A = await p.evaluate(async function () { var subidos = []; var g0 = datosTareas.guardar; datosTareas.guardar = function (t) { subidos.push(JSON.parse(JSON.stringify(t.dictados || []))); return Promise.resolve(); };
      window.modelo({ tipo: "tarea", ordenes: [], dudas: [], recordar: [], vinculos: [], entendi: "Recordar a los invitados el 10-nov", pasos: [{ quien: "IA", que: "Recordar a los invitados", fecha: "2026-11-10" }], que_toca: "Claude recuerda a los invitados el 10-nov" }, 200);
      var pq = preguntaAClaude; preguntaAClaude = function (m, mo, cb) { var t0 = Date.now(); pq(m, mo, function (a, b) { window.__lat = { modelo: mo, ms: Date.now() - t0, chars: String(m[0].content).length, fin: Date.now() }; cb(a, b); }); };   /* como lo anota preguntaAClaude real */
      var T = COMEDOR(); abre(T); envia("el 10 de noviembre recuérdales a todos los invitados que no se les olvide la fiesta");
      var primero = subidos[0] || []; await espera(900); datosTareas.guardar = g0; var D = (tareas[0].dictados || []);
      return { primero: primero.map(function (d) { return [d.estado, /10 de noviembre/.test(d.t), d.por]; }), final: D.map(function (d) { return d.estado; }),
        medida: D.map(function (d) { return [typeof d.ms === "number" && d.ms >= 150, typeof d.ms_modelo === "number", d.prompt_chars > 0, d.modelo]; }) }; });
    eq("lo dictado sube al servidor ANTES de interpretarse (estado recibido, texto completo, quién)", A.primero, [["recibido", true, "salvador"]]);
    eq("al aplicarse queda «aplicado» (cuando el cerebro termina, no al primer guardado)", A.final, ["aplicado"]);
    eq("se mide: tiempo total, tiempo del modelo, tamaño de lo que se le mandó y modelo", A.medida, [[true, true, true, "rapido"]]);
    /* 2 · si nada lo aplica: aviso en la plática y queda sin_aplicar */
    var B = await p.evaluate(async function () { DICTADO_ESPERA_MS = 300; var T = MORIC(); abre(T);
      var g0 = guarda; var antes = 0;
      window.registraDictado(T, "algo que ninguna rama aplicó"); window.__dict = null;   /* como una hoja cerrada sin terminar */
      await espera(600); var V = tareas[0]; var av = (V.msgs || []).filter(function (m) { return /no quedó aplicada/.test(m.t || ""); })[0] || {};
      var en = (V.encargos || []).filter(function (x) { return x.motivo === "dictado_sin_aplicar"; })[0] || {};
      return { estado: (V.dictados || []).map(function (d) { return d.estado; }), aviso: [!!av.t, /ninguna rama/.test(av.t || ""), av.canal, av.nota_claude], encargo: [en.estado, en.origen, en.t, (V.dictados[0] || {}).encargo_id === en.id] }; });
    eq("sin aplicar: estado sin_aplicar", B.estado, ["sin_aplicar"]);
    eq("sin aplicar: se dice en la plática, privado, con el texto", B.aviso, [true, true, "priv:salvador", 1]);
    eq("sin aplicar: se vuelve encargo para la Mac (app283) con el texto", B.encargo, ["pendiente", "app283", "algo que ninguna rama aplicó", true]);
    /* 3 · una búsqueda queda como consulta */
    var C = await p.evaluate(async function () { var T = MORIC(); abre(T); envia("busca el costo de la cena del Moric"); await espera(100);
      [].forEach.call(document.querySelectorAll(".leemask,.cnlbg,.cnlsheet,#busq"), function (e) { e.remove(); });
      return (tareas.filter(function (x) { return x.id === "tMOR"; })[0].dictados || []).map(function (d) { return d.estado; }); });
    eq("búsqueda: queda «consulta», no se avisa como perdida", C, ["consulta"]);
    var P = await p.evaluate(function () { var T = MORIC(); tareas = [T]; return promptRevision(T, "Respuesta a «¿Cuál es el próximo paso que Claude debe hacer aquí? (revisión 7-oct)»: el 10 de noviembre recuérdales", []); });
    eq("la etiqueta «(revisión 7-oct)» no llega al modelo (la tomaba como fecha de finiquito)", [/revisi[oó]n 7-oct/.test(P), /10 de noviembre/.test(P)], [false, true]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
