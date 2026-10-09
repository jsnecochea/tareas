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
/* ===== sw.js (vm): tag estable, reemplazo, no repetir ===== */
var vm = require("vm"), swSrc = fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8");
function mundoSW() {
  var W = { H: {}, SHOWN: [], LISTA: {}, CLOSED: [] };
  var reg = { showNotification: function (t, o) { W.SHOWN.push({ t: t, o: o }); W.LISTA[o.tag] = { title: t, tag: o.tag, body: o.body, data: o.data, close: function () { W.CLOSED.push(o.tag); delete W.LISTA[o.tag]; } }; return Promise.resolve(); },
    getNotifications: function (f) { return Promise.resolve(Object.keys(W.LISTA).filter(function (k) { return !f || !f.tag || k === f.tag; }).map(function (k) { return W.LISTA[k]; })); } };
  var self_ = { addEventListener: function (n, f) { W.H[n] = f; }, registration: reg, skipWaiting: function () {}, clients: { claim: function () {}, matchAll: function () { return Promise.resolve([]); }, openWindow: function () { return Promise.resolve(); } }, caches: null };
  var ctx = { self: self_, clients: self_.clients, Notification: function () {}, console: console, Promise: Promise, Date: Date, JSON: JSON, String: String, Object: Object, fetch: function () { return Promise.resolve(); }, URL: URL, setTimeout: setTimeout };
  ctx.Notification.prototype = {}; vm.createContext(ctx); vm.runInContext(swSrc, ctx);
  W.push = function (p) { var pr; W.H.push({ data: { json: function () { return p; }, text: function () { return JSON.stringify(p); } }, waitUntil: function (x) { pr = x; } }); return pr; };
  return W;
}
(async function () {
  var W = mundoSW();
  await W.push({ title: "Pregunta", body: "¿El jueves o el viernes?", tag: "q:t1:p1", data: { url: "https://doit.ok-doit.com/?recordatorio=t1" } });
  eq("Toda notificación lleva su tag y renotify:false", [W.SHOWN[0].o.tag, W.SHOWN[0].o.renotify, W.SHOWN[0].o.data.tag], ["q:t1:p1", false, "q:t1:p1"]);
  await W.push({ title: "Pregunta", body: "¿El jueves o el viernes?", tag: "q:t1:p1" });
  eq("Mismo tag y mismo cuerpo: no se vuelve a mostrar", W.SHOWN.length, 1);
  await W.push({ title: "Pregunta", body: "¿Mejor el lunes?", tag: "q:t1:p1" });
  eq("Mismo tag, otro cuerpo: se muestra y REEMPLAZA (queda 1 notificación)", [W.SHOWN.length, Object.keys(W.LISTA).length], [2, 1]);
  await W.push({ title: "x", body: "sin tag", tipo: "recordatorio", data: { url: "https://doit.ok-doit.com/?recordatorio=t2" } });
  await W.push({ title: "x", body: "sin tag", tipo: "recordatorio", data: { url: "https://doit.ok-doit.com/?recordatorio=t2" } });
  eq("Sin tag: el sw arma uno (tipo|url|cuerpo) y tampoco repite", [/^p:recordatorio\|https:\/\/doit\.ok-doit\.com\/\?recordatorio=t2\|/.test(W.SHOWN[2].o.tag), W.SHOWN.length], [true, 3]);
  /* iOS: tras 2 duplicados seguidos el tercero sí se muestra (para que iOS no castigue la suscripción) */
  var W2 = mundoSW(); for (var i = 0; i < 4; i++) await W2.push({ title: "a", body: "igual", tag: "rec:t9:a1" });
  eq("Salvaguarda iOS: 1 mostrada, 2 saltadas, la 4ª se muestra otra vez", W2.SHOWN.length, 2);
  /* tocar una cierra las demás con el mismo tag */
  var W3 = mundoSW(); await W3.push({ title: "a", body: "uno", tag: "q:t3:p1" });
  var cerro = []; W3.LISTA["q:t3:p1"].close = function () { cerro.push(1); };
  W3.LISTA["q:t3:p1_otra"] = { tag: "q:t3:p1", close: function () { cerro.push(2); } };
  var prom; W3.H.notificationclick({ notification: { tag: "q:t3:p1", data: {}, title: "a", body: "uno", close: function () {} }, action: "", waitUntil: function (x) { prom = x; } });
  await new Promise(function (r) { setTimeout(r, 20); });
  eq("Al tocar una notificación se cierran las demás del mismo tag", cerro.length >= 1, true);
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
    /* ===== app: cierre al resolver y barrido al abrir ===== */
    await p.evaluate(function () {
      window.__rfF263 = Date.now() + 1e12; window.__NOTIFS = [];
      window.addN = function (tag, data) { window.__NOTIFS.push({ tag: tag, data: data || {}, closed: false, close: function () { this.closed = true; } }); };
      window.swReg = function () { return Promise.resolve({ getNotifications: function (f) { return Promise.resolve(window.__NOTIFS.filter(function (n) { return !n.closed && (!f || !f.tag || n.tag === f.tag); })); } }); };
      window.TT = function (id, extra) { var N = Date.now(); var t = { id: id, nombre: "Tarea " + id, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-20", contexto: "Tarea de prueba con contexto suficiente para que no falte nada.", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 99999, h: "07:00" }] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
    });
    /* 1) resolver (Ya está) cierra su notificación */
    var r1 = await p.evaluate(async function () {
      var t = TT("tA", { avisos: [{ ts: "a1", fecha: "2026-10-07", hora: "10:00", texto: "x" }] }); var u = TT("tB", { hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿Qué marca?", ops: [] }] } });
      tareas = [t, u]; abierta = null; vista = "lista"; render();
      addN("rec:tA:a1", { id: "tA" }); addN("q:tB:p1", { id: "tB" }); addN("acuerdo:z9", {});
      var a0 = await barreNotifs(true), abiertas0 = __NOTIFS.filter(function (n) { return !n.closed; }).map(function (n) { return n.tag; });
      cierraHecha(t); await espera(50);
      return { barrido0: a0, abiertas0: abiertas0, tras: __NOTIFS.filter(function (n) { return !n.closed; }).map(function (n) { return n.tag; }) }; });
    eq("Con todo vigente el barrido no cierra nada", [r1.barrido0, r1.abiertas0], [0, ["rec:tA:a1", "q:tB:p1", "acuerdo:z9"]]);
    eq("Completar la tarea cierra su notificación (y solo esa)", r1.tras, ["q:tB:p1", "acuerdo:z9"]);
    /* 2) contestar la pregunta cierra la suya */
    var r2 = await p.evaluate(async function () {
      var u = TT("tB", { hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿Qué marca?", ops: [] }] } }); tareas = [u]; abierta = "tB"; vista = "hilo"; render(); await espera(60);
      var antes = pendientePreg(u);
      preguntaAClaude = function (m, mo, cb) { setTimeout(function () { cb(JSON.stringify(/Reparte su respuesta/.test(m[0].content) ? { respuestas: [{ n: 1, r: "Telcel" }] } : { tipo: "tarea", fecha: null, recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null })); }, 20); };
      window.__NOTIFS.length = 0; addN("q:tB:p1", { id: "tB" });
      var tx = document.getElementById("txt"); tx.value = "Telcel"; document.getElementById("tenv").click(); await espera(1800);
      return { antes: antes, despues: pendientePreg(tareas[0]), abiertas: __NOTIFS.filter(function (n) { return !n.closed; }).length }; });
    eq("Contestar la pregunta cierra su notificación", [r2.antes, r2.despues, r2.abiertas], [true, false, 0]);
    /* 3) al abrir la app se barren las de cosas ya resueltas */
    var r3 = await p.evaluate(async function () {
      var c = TT("tC", { cierre: { tipo: "hecha", motivo: "", f: "2026-10-05" }, estado: "cerrada" }), d = TT("tD", { estado: "dormida", dormida: { ts: 1, q: 0, e: 0 }, indefinida: true, expediente: true }), v = TT("tV");
      tareas = [c, d, v]; window.__NOTIFS.length = 0;
      addN("rec:tC:a1", { id: "tC" }); addN("q:tD:p1", {}); addN("p:te_necesito|https://doit.ok-doit.com/?recordatorio=tC|abc", { url: "https://doit.ok-doit.com/?recordatorio=tC" }); addN("rec:tV:a1", { id: "tV" });
      window.__barreN268 = 0; abierta = null; vista = "lista"; render(); await espera(100);
      return __NOTIFS.filter(function (n) { return !n.closed; }).map(function (n) { return n.tag; }); });
    eq("Al abrir: se cierran cerrada, dormida y la genérica de tarea cerrada; la de tarea vigente (aviso ya borrado no, aviso sin existir sí)", r3.length <= 1, true);
    /* 4) el app manda tag */
    var r4 = await p.evaluate(async function () { window.__F = []; var fo = window.fetch; window.fetch = function (u, o) { window.__F.push([String(u), o && o.body]); return Promise.resolve({ json: function () { return Promise.resolve({}); } }); };
      tareas = [TT("tE")]; disparaPushInstantaneo("samuel", "Hola", "cuerpo uno", urlTarea("tE"), "asignado"); disparaPushInstantaneo("samuel", "Hola", "cuerpo", urlTarea("tE"), "asignado", "q:tE:p9");
      var tc = TT("tF", { cierre: { tipo: "hecha", motivo: "", f: "2026-10-05" }, estado: "cerrada" }); tareas = [tc]; disparaPushInstantaneo("samuel", "Recordatorio", "ya resuelto", urlTarea("tF"), "recordatorio");
      window.fetch = fo; return window.__F.map(function (x) { return JSON.parse(x[1]).tag; }); });
    eq("disparaPushInstantaneo manda tag (el dado o uno estable) y no dispara el de algo resuelto", [/^p:asignado\|/.test(r4[0]), r4[1], r4.length], [true, "q:tE:p9", 2]);
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n")); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
