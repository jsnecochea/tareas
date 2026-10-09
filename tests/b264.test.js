#!/usr/bin/env node
/* PRUEBAS build 264: avisos una vez, siguiente en orden, Hoy solo de Salvador, espera con fecha, falta info coherente, dictado oculto, WhatsApp sin contacto basura, siguiente paso arriba. 390 px. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 264", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 263, true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    window.__SWH = []; try { Object.defineProperty(navigator, "serviceWorker", { value: { addEventListener: function (t, f) { window.__SWH.push(f); }, register: function () { return Promise.resolve({}); }, ready: Promise.resolve({}) }, configurable: true }); } catch (e) {}
    var RD = Date, base = RD.parse("2026-10-06T13:20:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    /* build 285: las secciones del home amanecen plegadas; en esta prueba vieja Acomodo, Mensajes, Te pregunta Doit, Vencidas y Hoy arrancan abiertas como antes (lo que se toque se sigue recordando) */
    await p.evaluate(function () { if (typeof abre285 === "function") abre285 = function (k) { var o = _pl(); return Object.prototype.hasOwnProperty.call(o.o, k) ? !!o.o[k] : /^(aco|msg|decide|preg|venc|hoy)$/.test(k); }; });
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true;
      window.__esp = []; window.__push = []; window.__pids = [];
      db = { collection: function () { return { doc: function (k) { return { set: function (d, o) { window.__esp.push([k, d, o]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      window.llamaPush = function (a, c) { window.__push.push([a, c]); };
      window.pideWhatsApp = function (c) { window.__pids.push(c); return Promise.resolve({ id: "wa_x" }); };
      document.getElementById("app").style.display = "flex"; window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      var N = Date.now();
      window.T = function (id, nombre, ctx, extra) { var t = { id: id, nombre: nombre, duenio: "salvador", plan_seguimiento: { proximo_paso: "Dar seguimiento" }, creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-06", fecha_dictada: true, contexto: ctx || "Tarea de prueba con contexto suficiente para que no falte nada de contexto en la ficha de la tarea y se vea completa.", ritmo: "diario", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 100000, h: "07:00" }] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.home = function (L) { tareas = L; abierta = null; vista = "lista"; window.__grupoInicio = "hoy";   /* home de tres fichas: lo de hoy vive en la vista Hoy */
        window.__clL263 = false; window.__ttAb = { venc: true, hoy: true }; window.__rfF263 = 0; render(); };
      window.filas = function () { return [].map.call(document.querySelectorAll(".ttl .ttr:not(.ttsum)"), function (b) { return b.querySelector(".rn").textContent; }); };
      window.sumas = function () { return [].map.call(document.querySelectorAll(".ttsum .rn"), function (b) { return b.textContent; }); };
    });
    await p.evaluate(function () { window.__hist = []; });
    /* ===================== 1. Ya está en una indefinida => dormida ===================== */
    var A = await p.evaluate(async function () {
      var r = {};
      var fc = T("tFC", "Faltas Colegio", "Expediente del CAT de los niños: faltas, justificantes y avisos del colegio.", { indefinida: true, f_vigente: "2026-10-06" });
      var otra = T("tOT", "Comprar pintura", "x", {});
      tareas = [fc, otra]; abierta = "tFC"; vista = "hilo"; render();
      r.hay = !!document.getElementById("bya");
      document.getElementById("bya").click(); await espera(900);
      var t = tareas.filter(function (x) { return x.id === "tFC"; })[0];
      r.estado = [t.estado, !!t.cierre, estadoReal(t)];
      r.texto = (t.msgs || []).slice(-1)[0].t;
      home(tareas); r.enHoy = document.body.innerText.indexOf("Faltas Colegio") >= 0;
      r.mias = mias().map(function (x) { return x.id; });
      r.pill = (document.getElementById("undopill") || {}).innerText || "";
      /* llega un WhatsApp */
      t.msgs.push({ k: "bo", de: "papa", wa_in: 1, canal: "wa", t: "Falta del jueves justificada", ts: Date.now() + 5, h: "13:30" });
      home(tareas);
      r.despierta = [t.estado, !!t.nuevo264, mias().map(function (x) { return x.id; })];
      r.arriba = (filas()[0] || "") ;
      r.etiqueta = document.body.innerText.indexOf("Nuevo") >= 0;
      return r; });
    eq("Ya está existe en la indefinida", A.hay, true);
    eq("Ya está la deja dormida, no cerrada", A.estado, ["dormida", false, "dormida"]);
    eq("Texto del enterado", A.texto, "Enterado · queda viva para lo que llegue");
    eq("Dormida no sale en Hoy ni en mias()", [A.enHoy, A.mias], [false, ["tOT"]]);
    eq("Cintillo habla de enterado", /Enterado/.test(A.pill), true);
    eq("Al llegar un mensaje despierta, con Nuevo y en mias()", [A.despierta[0], A.despierta[1], A.despierta[2].indexOf("tFC") >= 0], ["abierta", true, true]);
    eq("Sube arriba con la marca Nuevo", [/Faltas Colegio/.test(A.arriba), A.etiqueta], [true, true]);
    await foto("b264-1-despierta.png");
    /* ===================== 2. Dejar viva (expediente) en una normal ===================== */
    var B = await p.evaluate(async function () {
      var r = {}, n = T("tN", "Revisar uniformes", "x", {});
      tareas = [n]; abierta = "tN"; vista = "hilo"; render();
      document.getElementById("bya").click(); await espera(900);
      r.cerrada = !!n.cierre; r.btn = !!document.getElementById("bviva264");
      document.getElementById("bviva264").click(); await espera(200);
      r.tras = [n.estado, !!n.cierre, n.indefinida, n.expediente];
      return r; });
    eq("Una normal sí se cierra y ofrece Dejar viva", [B.cerrada, B.btn], [true, true]);
    eq("Dejar viva la convierte en expediente dormido", B.tras, ["dormida", false, true, true]);
    /* ===================== 3. Cerradas y dormidas siempre en la búsqueda ===================== */
    var C = await p.evaluate(async function () {
      var r = {};
      var ab = T("tA", "Seguimiento Colegio CAT", "x", {});
      var ce = T("tC", "Colegio CAT inscripción", "x", { cierre: { tipo: "hecha", motivo: "", f: "2026-09-30" }, estado: "cerrada" });
      var dor = T("tD", "Colegio CAT faltas", "x", { indefinida: true, expediente: true, estado: "dormida", dormida: { ts: 1, q: 1, e: 0 } });
      var fus = T("tF", "Colegio CAT viejo", "x", { fusionada_en: "tA", estado: "fusionada" });
      var otro = T("tX", "Origen", "x", {});
      tareas = [ab, ce, dor, fus, otro];
      var R = buscaVinc262("colegio cat", "tX");
      r.ids = R.lista.map(function (o) { return o.d.id; });
      r.etq = R.lista.map(function (o) { return o.etq || ""; });
      var R2 = buscaVinc262("viejo", "tX"); r.fus = R2.lista.map(function (o) { return o.d.id; });
      abreEnlazar("tX"); document.getElementById("enlq").value = "colegio cat"; document.getElementById("enlq").dispatchEvent(new Event("input")); await espera(100);
      r.filas = [].map.call(document.querySelectorAll("#enll .enlr"), function (b) { return b.innerText.replace(/\s+/g, " ").trim(); });
      return r; });
    eq("Abierta, cerrada y dormida salen juntas; la fusionada no", [C.ids.indexOf("tA") >= 0, C.ids.indexOf("tC") >= 0, C.ids.indexOf("tD") >= 0, C.ids.indexOf("tF") >= 0], [true, true, true, false]);
    eq("La abierta va antes que las de estado igual de fuertes", C.ids.indexOf("tA") < C.ids.indexOf("tC"), true);
    eq("Etiquetas de estado", [C.etq[C.ids.indexOf("tC")], C.etq[C.ids.indexOf("tD")], C.etq[C.ids.indexOf("tA")]], ["cerrada", "dormida", ""]);
    eq("Buscar una fusionada lleva a donde quedó", C.fus, ["tA"]);
    eq("La hoja pinta las etiquetas", [C.filas.some(function (f) { return /cerrada /.test(f); }), C.filas.some(function (f) { return /dormida /.test(f); })], [true, true]);
    await foto("b264-3-busqueda.png");
    await p.evaluate(function () { cierraEnlazar(); });
    /* parecidas */
    var D = await p.evaluate(async function () {
      var r = {};
      var ab = T("tA", "Junta Colegio CAT", "Reunión de padres del colegio CAT", {});
      var ce = T("tC", "Junta Colegio CAT anterior", "Reunión de padres del colegio CAT", { cierre: { tipo: "hecha", motivo: "", f: "2026-09-30" }, estado: "cerrada" });
      var org = T("tX", "Mensajes", "x", { msgs: [{ k: "bo", de: "salvador", wa_in: 1, t: "Junta de padres del colegio CAT el viernes", ts: Date.now(), h: "08:00" }] });
      tareas = [ab, ce, org];
      var S = sugeridasPara(org, [0]);
      r.sims = S.sims.map(function (d) { return d.id; }); r.rest = S.rest.map(function (d) { return d.id; });
      return r; });
    eq("Parecidas: la cerrada también sale, después de la abierta, y no en el resto", [D.sims, D.rest.indexOf("tC") >= 0], [["tA", "tC"], false]);
    /* ===================== 4. Vincular / mover a dormida o cerrada ===================== */
    var E = await p.evaluate(async function () {
      var r = {};
      var dor = T("tD", "Expediente Colegio", "x", { indefinida: true, expediente: true, estado: "dormida", dormida: { ts: 1, q: 0, e: 0 } });
      var org = T("tX", "Plática suelta", "x", { msgs: [{ k: "bo", de: "salvador", wa_in: 1, t: "Aviso del colegio", ts: Date.now(), h: "08:00" }] });
      tareas = [dor, org];
      enlazaTareas("tX", "tD");
      r.vinc = [dor.estado, !!dor.nuevo264];
      var dor2 = T("tD2", "Expediente Otro", "x", { indefinida: true, expediente: true, estado: "dormida", dormida: { ts: 1, q: 0, e: 0 } });
      var org2 = T("tX2", "Plática 2", "x", { msgs: [{ k: "bo", de: "salvador", wa_in: 1, t: "Otro aviso", ts: Date.now(), h: "08:00" }] });
      var ce = T("tC2", "Cerrada", "x", { cierre: { tipo: "hecha", motivo: "", f: "2026-09-30" }, estado: "cerrada" });
      tareas = [dor2, org2, ce];
      org2.msgs.push({ k: "bo", de: "salvador", wa_in: 1, t: "Y otro", ts: Date.now() + 1, h: "08:01" }); mueveMensaje(org2, 0, "tD2"); mueveMensaje(org2, 1, "tC2");
      r.mover = [dor2.estado, !!dor2.nuevo264, ce.estado, !!ce.cierre];
      return r; });
    eq("Vincular a una dormida la despierta", E.vinc, ["abierta", true]);
    eq("Mover a dormida despierta y a cerrada reabre", E.mover, ["abierta", true, "abierta", false]);
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n")); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
