#!/usr/bin/env node
/* PRUEBAS build 251 (Salvador 6-oct 07:54 y 07:58). a 390 px, reloj fijo 2026-10-06 07:20 (Torreón).
   1) Mover > "Tarea nueva": ventanita "Nombre de la tarea nueva" con sugerencia del MENSAJE (nunca el nombre de la tarea de origen), Crear / Cancelar;
      al crear, la app va a la tarea nueva con el mensaje adentro. Caminos: Mover (globo/Te pregunta), Acomodo (botón Nueva), lote y barra de selección.
   2) Vista de revisión: TODO dictado va al cerebro del 238 (el mensaje que pide lo arma el cerebro, no sale tal cual al WhatsApp); mientras trabaja
      la pantalla se difumina con "Claude está acomodando…"; al terminar se libera YA REFRESCADA (aunque el snapshot haya reemplazado los objetos).
   3) Preguntas del cerebro en su ventanita: una por renglón, con botones o campo; las de persona autocompletan con TODOS los contactos de la app;
      al contestar todas se aplican, se programa y queda refrescada.
   Correr: node tests/b249.test.js (CAP=<carpeta> para capturas) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 255", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 255, true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    var RD = Date, base = RD.parse("2026-10-06T13:20:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; window.__WA = []; window.__agendaNo = 1;
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.NOW = Date.now(); document.getElementById("app").style.display = "flex"; window.__srlog = 0;
      window.FIDE = function () { return { id: "tRELOJ", nombre: "Reloj Checador Casa", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_fija: true, fecha_dictada: true, contexto: "Instalar el reloj checador en la casa.", wa_contactos: [], msgs: [],
        hecho238: { ts: 1, hecho: ["Fecha límite: 20 oct"], falta: [{ k: "txt", q: "¿Cuándo te recuerdo antes de la fecha límite?", ops: [] }, { k: "txt", q: "¿El próximo seguimiento?", ops: [] }] } }; };
      window.__SRS = []; window.__micOK = true; window.SpeechRecognition = window.webkitSpeechRecognition = function () { var o = this; o.start = function () { __SRS.push(o); o.on = true; }; o.stop = function () { o.on = false; if (o.onend) o.onend(); }; o.abort = o.stop; };
      window.dicta255 = function (v) { var tx = document.getElementById("txt"); tx.value = v; document.getElementById("tenv").click(); };
      window.abre = function (T, extra) { tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; render(); };
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; setTimeout(function () { cb(JSON.stringify(j)); }, ms || 20); }; };
    });
    await p.evaluate(function () {
    window.__rfF263 = Date.now() + 1e12; window.VEST = function (extra) { var N = Date.now(); var t = { id: "tVEST", nombre: "Vestidores Carpintería", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-20", contexto: "Vestidores de la casa con carpintería; Manuel Parra pasa las medidas y el costo del trabajo de piedra.",
      msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 900000, h: "07:00" }, { k: "bi", t: "→ Manuel Parra: “¿Cuánto cuesta?”", wa: 1, wa_c: "Manuel Parra", ts: N - 800000, h: "07:10" }, { k: "bo", wa_in: 1, wa_c: "Manuel Parra", t: "No se alcanza a apreciar", ts: N - 700000, h: "07:20", claridad: "no" }],
      decision_dato: [{ id: "dd1", contacto: "Manuel Parra", pregunta: "¿Cuánto cuesta la piedra?", falta: "el costo de la piedra", resp: ["No se alcanza a apreciar"], n: 2, ts: N - 600000 }],
      pendiente_tipo: "decision_salvador", pendiente_dato: "dd1", pendiente_info: "Manuel Parra no da el dato: el costo de la piedra" }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
    });
    var limpia = async function () { await p.evaluate(function () { [].forEach.call(document.querySelectorAll("#preg249,#acom249,#dictacapa,.leemask"), function (e) { e.remove(); }); window.__oyendo = false; window.__SRS.length = 0; window.__pq255Last = null; window.__preg255 = null; }); };
    /* 1) el registro DECIDE se ve como pregunta en texto, sin botones ni fichas */
    var r1 = await p.evaluate(async function () { tareas = [VEST()]; abierta = null; vista = "lista"; render(); abierta = "tVEST"; vista = "hilo"; render(); await espera(80);
      var m = document.getElementById("preg249");
      return { bloque: !!m, items: m ? [].map.call(m.querySelectorAll("ol li"), function (x) { return x.textContent; }) : [], botones: m ? m.querySelectorAll("button:not([data-pq255])").length : -1, fichas: document.querySelectorAll(".c-decmeta,.decban,[data-ddact],[data-dmact],#bdecidi,.c-espera").length, mic: __SRS.length, chip: (document.querySelector('[data-chip="falta"]') || {}).textContent }; });
    eq("Pregunta en texto con las opciones dentro de la frase (una sola, la de Manuel)", r1.items, ["Manuel Parra no da el dato «el costo de la piedra». ¿Hablas tú con él, le vuelvo a preguntar o ya no hace falta?"]);
    eq("Sin fichas ni botones de opción; el micrófono no arranca solo", [r1.bloque, r1.botones, r1.fichas, r1.mic], [true, 0, 0, 0]);
    eq("El chip dice Falta 1", r1.chip, "Falta 1 ›");
    await foto("b266-1-pregunta.png");
    /* 2) dictar la respuesta la cierra */
    await limpia();
    var r2 = await p.evaluate(async function () { var T = VEST(); tareas = [T]; abierta = "tVEST"; vista = "hilo"; render(); await espera(60); window.__PROMPTS = [];
      preguntaAClaude = function (msgs, mod, cb) { window.__PROMPTS.push([mod, msgs[0].content]); var rep = /Reparte su respuesta/.test(msgs[0].content); setTimeout(function () { cb(JSON.stringify(rep ? { respuestas: [{ n: 1, r: "hablo yo con él" }] } : { tipo: "tarea", fecha: null, contexto: "Vestidores con carpintería. Salvador habla con Manuel.", recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null })); }, 20); };
      dicta255("yo hablo con él"); await espera(1500);
      var V = tareas[0];
      return { dd: (V.decision_dato || []).length, pend: [V.pendiente_tipo, V.pendiente_info], bloque: !!document.getElementById("preg249"), fichas: document.querySelectorAll(".c-decmeta,.decban,[data-ddact]").length, chip: !!document.querySelector('[data-chip="falta"]'), modo: window.__PROMPTS.map(function (x) { return x[0]; }), ctx: /Respuesta a «Manuel Parra no da el dato/.test((window.__PROMPTS[1] || [0, ""])[1]), yoHablo: ((V.repreg || [])[0] || {}).yo_hablo || null }; });
    eq("Dictar la respuesta cierra el registro y la pregunta desaparece", [r2.dd, r2.pend, r2.bloque, r2.fichas, r2.chip], [0, ["", ""], false, 0, false]);
    eq("Reparte en pesado con la pregunta como contexto y aplica en rápido (build 283)", [r2.modo, r2.ctx], [["pesado", "rapido"], true]);
    /* 3) si el contacto ya contestó algo útil después, no se muestra */
    await limpia();
    var r3 = await p.evaluate(async function () { var T = VEST(); T.msgs.push({ k: "bo", wa_in: 1, wa_c: "Manuel Parra", t: "Son 48 mil pesos la piedra", ts: Date.now() - 1000, h: "08:00", claridad: "ok" }); tareas = [T]; abierta = "tVEST"; vista = "hilo"; render(); await espera(80);
      return { bloque: !!document.getElementById("preg249"), n: preguntas249(T).length, chip: !!document.querySelector('[data-chip="falta"]'), fichas: document.querySelectorAll(".c-decmeta,.decban").length }; });
    eq("Con respuesta útil posterior no hay pregunta ni ficha", r3, { bloque: false, n: 0, chip: false, fichas: 0 });
    /* 4) si la pelota no es de Salvador, no hay pregunta: solo Qué toca */
    await limpia();
    var r4 = await p.evaluate(async function () { var T = VEST({ resumen: { que_toca: "Esperando respuesta de Manuel Parra con el costo (para el 10 oct)" } }); tareas = [T]; abierta = "tVEST"; vista = "hilo"; render(); await espera(80);
      return { n: preguntas249(T).length, bloque: !!document.getElementById("preg249"), fichas: document.querySelectorAll(".c-decmeta,.decban,[data-ddact]").length, pelota: pelotaMia266(T) ? "yo" : "claude" }; });
    eq("Pelota de Claude: sin pregunta ni ficha", [r4.n, r4.bloque, r4.fichas, r4.pelota], [0, false, 0, "claude"]);
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n")); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
