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
      window.ESIM = function (extra) { var N = Date.now(); var t = { id: "tESIM", nombre: "Comprar Esim Telcel", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-12", contexto: "Comprar una eSIM de Telcel para el viaje.", msgs: [{ k: "bo", de: "salvador", t: "Comprar esim", ts: N - 900000, h: "07:00" }],
        hecho238: { ts: N, hecho: [], falta: [{ k: "txt", q: "¿Qué marca de chip prefieres?", ops: [] }, { k: "txt", q: "¿El próximo seguimiento?", ops: [] }, { k: "resp", q: "No me quedó claro qué hacer con «Respuesta a «¿El próximo seguimiento?»: Ninguno.». ¿Qué es?", ops: [{ id: "dato", label: "Es un dato para anotar" }] }] } }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
    });
    var limpia = async function () { await p.evaluate(function () { [].forEach.call(document.querySelectorAll("#preg249,#acom249,#dictacapa,.leemask"), function (e) { e.remove(); }); window.__oyendo = false; window.__SRS.length = 0; window.__pq255Last = null; window.__preg255 = null; }); };
    /* 1) tarea simple sin terceros: ni las de relleno ni la atorada */
    var r1 = await p.evaluate(async function () { var T = ESIM(); tareas = [T]; abierta = "tESIM"; vista = "hilo"; render(); await espera(80);
      return { qs: preguntas249(T).map(function (x) { return x.q; }), fichas: document.querySelectorAll("#preg249 li").length }; });
    eq("Tarea simple: solo sale la pregunta real; no la de relleno ni 'No me quedó claro…'", r1.qs, ["¿Qué marca de chip prefieres?"]);
    /* 2) con fecha y terceros la de relleno sí sale; "Ninguno" la cierra y no crea otra */
    await limpia();
    var r2 = await p.evaluate(async function () { var T = ESIM({ wa_contactos: [{ nombre: "Pedro Telcel" }], hecho238: { ts: Date.now(), hecho: [], falta: [{ k: "txt", q: "¿El próximo seguimiento?", ops: [] }] } }); tareas = [T]; abierta = "tESIM"; vista = "hilo"; render(); await espera(80);
      var antes = preguntas249(T).map(function (x) { return x.q; }); window.__PROMPTS = [];
      preguntaAClaude = function (msgs, mod, cb) { window.__PROMPTS.push(msgs[0].content); setTimeout(function () { cb(JSON.stringify(/Reparte su respuesta/.test(msgs[0].content) ? { respuestas: [{ n: 1, r: "Ninguno" }] } : { tipo: "tarea", fecha: null, recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null })); }, 20); };
      dicta255("Ninguno"); await espera(1500);
      var V = tareas[0], dsp = preguntas249(V).map(function (x) { return x.q; });
      return { antes: antes, dsp: dsp, ritmo: V.ritmo, nota: (V.msgs || []).some(function (m) { return /^Entendí: «¿El próximo seguimiento\?» → ninguno/.test(m.t || ""); }), bloque: !!document.getElementById("preg249"), noClaro: (V.msgs || []).concat(((V.hecho238 || {}).falta || [])).some(function (m) { return /No me quedó claro/.test(m.t || m.q || ""); }) }; });
    eq("Con fecha y terceros la de seguimiento sí sale", r2.antes, ["¿El próximo seguimiento?"]);
    eq("Contestar 'Ninguno' la cierra, deja el campo en ninguno y no crea otra", [r2.dsp, r2.ritmo, r2.nota, r2.bloque, r2.noClaro], [[], "ninguno", true, false, false]);
    for (var w of ["no", "nada", "no hace falta", "sin seguimiento", "no quiero"]) eq("'" + w + "' es respuesta válida", await p.evaluate(function (x) { return esNegativa267(x); }, w), true);
    eq("'jueves' no es negativa", await p.evaluate(function () { return [esNegativa267("el jueves a las 9"), esNegativa267("sí"), esNegativa267("ok")]; }), [false, false, false]);
    /* 3) respuesta incomprensible: se aplica con "Entendí: …" y cierra */
    await limpia();
    var r3 = await p.evaluate(async function () { var T = ESIM({ hecho238: { ts: Date.now(), hecho: [], falta: [{ k: "txt", q: "¿Qué marca de chip prefieres?", ops: [] }] } }); tareas = [T]; abierta = "tESIM"; vista = "hilo"; render(); await espera(80);
      preguntaAClaude = function (msgs, mod, cb) { setTimeout(function () { cb(JSON.stringify(/Reparte su respuesta/.test(msgs[0].content) ? { respuestas: [{ n: 1, r: "blablá xyz zzz" }] } : { tipo: "tarea", fecha: null, recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null })); }, 20); };
      dicta255("blablá xyz zzz"); await espera(2500);
      var V = tareas[0], H = V.hecho238 || {};
      return { falta: (H.falta || []).map(function (f) { return f.q; }), hecho: H.hecho || [], preg: preguntas249(V).map(function (x) { return x.q; }), bloque: !!document.getElementById("preg249"), noClaro: (V.msgs || []).some(function (m) { return /No me quedó claro/.test(m.t || ""); }) }; });
    eq("Incomprensible: queda 'Entendí: …' y no hay pregunta nueva", [r3.falta, r3.hecho.some(function (h) { return /^Entendí: blablá xyz zzz/.test(h); }), r3.preg, r3.bloque, r3.noClaro], [[], true, [], false, false]);
    /* 4) aplicaNoClara no escribe nada */
    var r4 = await p.evaluate(function () { var T = ESIM({ msgs: [{ k: "bi", t: "→ Manuel Parra: “¿Cuánto cuesta?”", wa: 1, wa_c: "Manuel Parra", ts: 1, h: "07" }, { k: "bo", wa_in: 1, wa_c: "Manuel Parra", t: "No se alcanza a apreciar", ts: 2, h: "08" }] }); var n0 = T.msgs.length;
      var r = aplicaNoClara(T, { ix: 1, qix: 0, contacto: "Manuel Parra", pregunta: "¿Cuánto cuesta?", respuesta: "No se alcanza a apreciar" }, { clara: false, pregunta: "¿Cuánto cuesta?", falta: "el costo" }, Date.now());
      window.__WAx = 0; var old = pideWhatsApp; window.pideWhatsApp = function () { window.__WAx++; return Promise.resolve({}); }; tareas = [T]; revisaClaridadTodas(Date.now() + 99999999); window.pideWhatsApp = old;
      return { r: r, msgs: T.msgs.length - n0, repreg: T.repreg || null, dd: T.decision_dato || null, pend: T.pendiente_tipo || "", wa: window.__WAx, claridad: T.msgs[1].claridad || null }; });
    eq("aplicaNoClara y revisaClaridadTodas ya no escriben ni mandan nada", r4, { r: "", msgs: 0, repreg: null, dd: null, pend: "", wa: 0, claridad: null });
    /* 5) lo viejo se limpia solo */
    var r5 = await p.evaluate(function () { var T = ESIM({ decision_dato: [{ id: "dd1", contacto: "Manuel Parra", pregunta: "x", falta: "y", resp: [], n: 2, ts: 1 }], repreg: [{ contacto: "Manuel Parra" }], pendiente_tipo: "decision_salvador", pendiente_dato: "dd1", pendiente_info: "Manuel no da el dato" }); tareas = [T]; refrescaFalta263();
      return { dd: (T.decision_dato || []).length, repreg: !!T.repreg, pend: T.pendiente_tipo || "", hf: ((T.hecho238 || {}).falta || []).map(function (f) { return f.q; }) }; });
    eq("Se limpian repreg, decision_dato, la decisión pendiente y 'No me quedó claro…'", r5, { dd: 0, repreg: false, pend: "", hf: ["¿Qué marca de chip prefieres?"] });
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n")); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
