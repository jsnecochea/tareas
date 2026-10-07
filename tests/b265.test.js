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
        hecho238: { ts: 1, hecho: ["Fecha límite: 20 oct"], falta: [{ k: "txt", q: "¿Qué modelo de reloj checador compro?", ops: [] }, { k: "txt", q: "¿En qué pared va instalado?", ops: [] }] } }; };
      /* build 267 purga a propósito las preguntas de relleno ("¿Cuándo te recuerdo…?", "¿El próximo seguimiento?") cuando la tarea no tiene
         terceros; esta tarea no tiene, así que aquí van preguntas concretas que sí sobreviven (antes la prueba usaba las de relleno y el chip no salía). */
      window.__SRS = []; window.__micOK = true; window.SpeechRecognition = window.webkitSpeechRecognition = function () { var o = this; o.start = function () { __SRS.push(o); o.on = true; }; o.stop = function () { o.on = false; if (o.onend) o.onend(); }; o.abort = o.stop; };
      window.dicta255 = function (v) { var tx = document.getElementById("txt"); tx.value = v; document.getElementById("tenv").click(); };
      window.abre = function (T, extra) { tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; render(); };
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; setTimeout(function () { cb(JSON.stringify(j)); }, ms || 20); }; };
    });
    /* ===== build 265: chip Falta rojo y ancho; el micrófono no arranca solo; funciona al tocarlo ===== */
    var r1 = await p.evaluate(async function () { tareas = [FIDE()]; abierta = null; vista = "lista"; render(); abierta = "tRELOJ"; vista = "hilo"; render(); await espera(80);
      var f = document.querySelector('[data-chip="falta"]'), otros = [].filter.call(document.querySelectorAll(".chips225 .chip225"), function (c) { return c !== f; }), rf = f.getBoundingClientRect(), cs = getComputedStyle(f);
      return { hay: !!f, txt: f.textContent, alto: Math.round(rf.height), altosOtros: otros.map(function (c) { return Math.round(c.getBoundingClientRect().height); }), ancho: Math.round(rf.width), fondo: cs.backgroundColor, color: cs.color, peso: +cs.fontWeight, bloque: !!document.getElementById("preg249"), mic: __SRS.length, oyendo: !!window.__oyendo }; });
    eq("Chip Falta existe y dice Falta N", [r1.hay, /^Falta \d ›$/.test(r1.txt)], [true, true]);
    eq("Mismo alto que los demás chips", r1.altosOtros.length > 0 && r1.altosOtros.every(function (a) { return Math.abs(a - r1.alto) <= 1; }), true);
    eq("Ancho cómodo (88 px o más)", r1.ancho >= 88, true);
    eq("Rojo con texto blanco en negritas", [r1.fondo, r1.color, r1.peso >= 700], ["rgb(255, 69, 58)", "rgb(255, 255, 255)", true]);
    eq("Al entrar: sale el bloque con preguntas y el micrófono NO arranca", [r1.bloque, r1.mic, r1.oyendo], [true, 0, false]);
    await foto("b265-1-chip-rojo.png");
    await p.evaluate(function () { document.querySelector('#preg249 [data-pq255="later"].pq255d').click(); window.__SRS.length = 0; });
    var r2 = await p.evaluate(function () { document.querySelector('[data-chip="falta"]').click(); return { bloque: !!document.getElementById("preg249"), mic: __SRS.length, oyendo: !!window.__oyendo }; });
    eq("Al tocar el chip: preguntas visibles y NO se llama al reconocimiento de voz", r2, { bloque: true, mic: 0, oyendo: false });
    var r3 = await p.evaluate(async function () { document.querySelector('#preg249 [data-pq255="mic"]').click(); await espera(60); return { mic: __SRS.length, oyendo: !!window.__oyendo }; });
    eq("El micrófono funciona al tocarlo", r3, { mic: 1, oyendo: true });
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n")); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
