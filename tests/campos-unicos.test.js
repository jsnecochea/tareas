#!/usr/bin/env node
/* PRUEBAS de los cuatro lectores únicos (docs/campos-unicos.md): estaAbierta, yaContestada (+ anotaRespuesta), esperaDe y
   encargadoDe con todas las formas de antes (tests/fx-campos-unicos.json, el mismo archivo que usa el bot de la Mac); una tarea
   que la Mac cerró con vinculada_a ya no sale; lo contestado no se vuelve a preguntar; espera_a; la fila con cualquier forma
   de encargado. Reloj fijo mié 2026-10-07 9:00 (Monterrey). 390 px. */
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
    try { Object.defineProperty(navigator, "serviceWorker", { value: { addEventListener: function () {}, register: function () { return Promise.resolve({}); }, ready: Promise.resolve({}) }, configurable: true }); } catch (e) {}
    var RD = Date, base = RD.parse("2026-10-07T15:00:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(350); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true;
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      window.llamaPush = function () {}; window.pideWhatsApp = function () { return Promise.resolve({ id: "wa_x" }); };
      document.getElementById("app").style.display = "flex"; window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      var N = Date.now(), hm = function (ms) { var d = new Date(N - ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
      window.T = function (id, nombre, extra) { var t = { id: id, nombre: nombre, duenio: "salvador", plan_seguimiento: { proximo_paso: "Dar seguimiento" }, creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-07", fecha_dictada: true, contexto: "Tarea de prueba con contexto suficiente para que no falte nada de contexto en la ficha de la tarea y se vea completa.", ritmo: "diario", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 100000, h: "07:00" }] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.WA = function (c, tx, hace) { return { k: "bi", wa_in: 1, wa_c: c, t: c + ": " + tx, ts: N - hace, h: hm(hace), wa_id: "w" + Math.random().toString(36).slice(2, 8) }; };
      var Q = function (q) { return { k: "txt", q: q, ops: [] }; };
      window.FX = function () { return [
        T("tDEC", "Cámaras bodega", { f_vigente: "2026-10-20", decision: { pregunta: "¿Cuál cotización autorizo?", opciones: [{ nombre: "Dahua" }, { nombre: "Hikvision", recomendada: true }], ts: N - 7200000 } }),
        T("tPRE", "Pregunta sola", { f_vigente: "2026-10-20", hecho238: { ts: 1, hecho: [], falta: [Q("¿Cuál es la dirección?")] } }),
        T("tV1", "Vencida uno", { f_vigente: "2026-10-03" }),
        T("tH1", "Hoy uno"), T("tH2", "Hoy dos"), T("tH3", "Hoy tres"),
        T("tF1", "Futura", { f_vigente: "2026-10-20" }),
        T("tPROP", "Cotización toldo terraza", { creada_por: "ia_revisor", tipo_elegido: false, autorizada: false, origen: "wa_revisor", msgs: [WA("Toldos Laguna", "Le comparto la cotización del toldo: $38,500", 90 * 60000)] }),
        T("tLER", "Mantenimiento Casa Lerdo", { f_vigente: "2026-10-20", indefinida: true, msgs: [WA("Lalo Madero", "¿Hay miercolitos esta semana? Reservé la cancha 3", 45 * 60000), Object.assign(WA("Manuel Parra", "Mesa comedor alto brillo: mañana te dejo la muestra de melamina para que la veas en tu casa a las 5", 5 * 3600000), { duda_tarea: { alternativa_id: "tF1", alternativa_nombre: "Futura" } })] })
      ]; };
      window.home = function (L) { tareas = L; abierta = null; vista = "lista"; window.__grupoInicio = null; window.__segBandeja = null; window.__rfF263 = 0; render(); };
      window.vis = function (el) { return !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden"); };
      window.ficha = function (k) { var f = document.querySelector('.ficha-inicio[data-grupo="' + k + '"]'); if (!f) return null; var cs = getComputedStyle(f), nn = getComputedStyle(f.querySelector(".fi-n"));
        return { n: f.querySelector(".fi-n").textContent, l: f.querySelector(".fi-l").textContent, aria: f.getAttribute("aria-label"), tag: f.tagName, cero: f.classList.contains("cero"), color: nn.color, borde: cs.borderTopColor, tam: nn.fontSize, w: Math.round(f.getBoundingClientRect().width) }; };
    });

    var FX = JSON.parse(fs.readFileSync(path.join(__dirname, "fx-campos-unicos.json"), "utf8"));

    /* 1 · los cuatro lectores con los casos compartidos con el bot (mismo archivo que usa la Mac) */
    var R = await p.evaluate(function (F) { var C = F.ctx, o = { ab: [], co: [], es: [], en: [] };
      F.abierta.forEach(function (c) { o.ab.push([c[0], estaAbierta(c[1])]); });
      F.contestada.forEach(function (c) { o.co.push([c[0], yaContestada(c[1], c[2], C)]); });
      F.espera.forEach(function (c) { o.es.push([c[0], esperaDe(c[1], C)]); });
      F.encargado.forEach(function (c) { o.en.push([c[0], encargadoDe(c[1], C)]); });
      return o; }, FX);
    FX.abierta.forEach(function (c, i) { eq("estaAbierta · " + c[0], R.ab[i][1], c[2]); });
    FX.contestada.forEach(function (c, i) { eq("yaContestada · " + c[0], R.co[i][1], c[3]); });
    FX.espera.forEach(function (c, i) { eq("esperaDe · " + c[0], R.es[i][1], c[2]); });
    FX.encargado.forEach(function (c, i) { eq("encargadoDe · " + c[0], R.en[i][1], c[2]); });

    /* 2 · sin ctx, la app usa el suyo (yo, PERSONAS, encargos) */
    var X = await p.evaluate(function () { encargos = [{ id: "eA", para: "samuel", cerrado: 0, creado: Date.now() - 86400000, texto: "Cotizar" }];
      return [encargadoDe({ encargado: "samuel" }), encargadoDe({ encargado: { id: "eA" } }).id, (esperaDe({ id: "x", encargado: { id: "eA" } }) || {}).quien,
        (esperaDe({ id: "y", espera_a: { id: "salvador" } }) || {}).deMi, yaContestada({ msgs: [{ k: "bo", de: "salvador", t: "ok", ts: 2000 }] }, { q: "¿Va?", ts: 1000 })]; });
    eq("ctx de la app por omisión", X, [{ id: "samuel", nombre: "Samuel", encargo: "", desde: "", fuente: "encargado" }, "samuel", "Samuel", true, true]);

    /* 3 · una tarea que la Mac cerró con vinculada_a ya no sale en la app */
    var V = await p.evaluate(function () { encargos = [];
      var L = [T("tVIN", "Cerrada por la Mac", { vinculada_a: "tH1" }), T("tH1", "Hoy uno"), T("tEST", "Estado cerrada sin cierre", { estado: "cerrada" })];
      home(L); var H = window.__H274, ids = function (A) { return A.map(function (x) { return x.t.id; }); };
      return { real: [estadoReal(L[0]), estadoReal(L[2]), estadoReal(L[1])], vis: [abiertaVisible(L[0]), abiertaVisible(L[1])], hoy: ids(H.hoy), venc: ids(H.venc), preg: ids(H.preg),
        texto: document.body.textContent.indexOf("Cerrada por la Mac") >= 0, hoyN: ficha("hoy").n }; });
    eq("vinculada_a / estado cerrada → estadoReal «cerrada»", V.real, ["cerrada", "cerrada", "hoy"]);
    eq("vinculada_a no es visible; la otra sí", V.vis, [false, true]);
    eq("En Hoy solo la abierta", [V.hoy, V.venc, V.preg, V.hoyN], [["tH1"], [], [], "1"]);
    eq("La cerrada por la Mac no se pinta en el inicio", V.texto, false);

    /* 4 · lo contestado (en el registro o en la plática) no se vuelve a preguntar */
    var Q = await p.evaluate(function () { var Qx = function (q) { return { k: "txt", q: q, ops: [], ts: Date.now() + 1000 }; };
      var L = [
        T("tLOG", "Contestada en el registro", { f_vigente: "2026-10-20", hecho238: { ts: 1, hecho: [], falta: [Qx("¿A quién le mando el plano?")] }, respuestas_log: [{ pregunta: "¿A quién le mando el plano?", texto: "A Manuel", por: "salvador", via: "mac", ts: 1 }] }),
        T("tMSG", "Contestada en la plática", { f_vigente: "2026-10-20", hecho238: { ts: 1, hecho: [], falta: [Qx("¿Cuál es la dirección de la obra?")] }, msgs: [{ k: "bo", de: "salvador", t: "Respuesta a «¿Cuál es la dirección de la obra?»: Calle 5.", ts: 5 }] }),
        T("tVIVA", "Sin contestar", { f_vigente: "2026-10-20", hecho238: { ts: 1, hecho: [], falta: [Qx("¿Le pido a Pepe otra cotización?")] } })
      ];
      home(L); var t = { id: "z" }, a = anotaRespuesta(t, "IA · ¿Le pido otra?", "sí", "salvador", "app", 10), b = anotaRespuesta(t, "¿Le pido otra?", "sí", "salvador", "app", 11);
      return { preg: window.__H274.preg.map(function (x) { return x.t.id; }), bloquea: [bloqueaQ(L[0], "¿A quién le mando el plano?"), bloqueaQ(L[1], "¿Cuál es la dirección de la obra?"), bloqueaQ(L[2], "¿Le pido a Pepe otra cotización?")],
        anota: [a, b, t.respuestas_log.length, t.respuestas_log[0].clave, t.respuestas_log[0].via, t.resp267] }; });
    eq("Te esperan: solo la que no se ha contestado", Q.preg, ["tVIVA"]);
    eq("bloqueaQ usa el lector único", Q.bloquea, [true, true, false]);
    eq("anotaRespuesta: registro + resp267, sin duplicar", Q.anota, [true, false, 1, "le pido otra", "app", ["le pido otra"]]);

    /* 5 · contestar el cuestionario de la tarea escribe el registro */
    var W = await p.evaluate(function () { var t = T("tCUE", "Cuestionario", { hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿Para cuándo la quieres terminar, o es indefinida?", ops: [] }] } }); tareas = [t];
      window.completaRevision = function () {}; try { enviaPreguntas("tCUE", [{ k: "txt", q: "¿Para cuándo la quieres terminar, o es indefinida?", ops: [], hi: 0 }], [{ texto: "el viernes" }]); } catch (e) { return "error " + e.message; }
      var r = (t.respuestas_log || [])[0] || {}; return [r.pregunta, r.texto, r.por, r.via, yaContestada(t, "¿Para cuándo la quieres terminar, o es indefinida?")]; });
    eq("El cuestionario anota la respuesta en respuestas_log", W, ["¿Para cuándo la quieres terminar, o es indefinida?", "el viernes", "salvador", "app", true]);

    /* 6 · a quién espera: espera_a a un tercero pasa a «Las lleva Claude»; a Salvador, lo detiene él */
    var E = await p.evaluate(function () { encargos = [];
      var L = [T("tESA", "Espera a Samuel", { espera_a: { id: "samuel", quien: "Samuel", desde: Date.now() - 3600000, motivo: "la cotización" } }), T("tH2", "Hoy dos"),
        T("tYO", "Me esperan", { espera_a: { id: "salvador", quien: "Salvador", desde: Date.now() - 3600000 } })];
      home(L); return { hoy: window.__H274.hoy.map(function (x) { return x.t.id; }), terc: (esperaTercero(L[0]) || {}).corto, yo: [meDetiene(L[2]), meDetiene(L[0]), esperaTercero(L[2])] }; });
    eq("espera_a a un tercero sale de Hoy", E.hoy.indexOf("tESA") < 0 && E.hoy.indexOf("tH2") >= 0, true);
    eq("esperaTercero sale de esperaDe", E.terc, "Samuel");
    eq("espera_a a Salvador = lo detiene él (y no es de un tercero)", E.yo, [true, false, null]);

    /* 7 · encargado en cualquier forma: la fila nunca truena */
    var N = await p.evaluate(function () { encargos = [{ id: "e1", para: "samuel", cerrado: 0, creado: Date.now() - 2 * 86400000 }];
      var F = [["texto salvador", "salvador"], ["texto equipo", "samuel"], ["texto externo", "Manuel Parra"], ["canónica", { a: "samuel", id: "e1", desde: "2026-10-05" }], ["solo id", { id: "e1" }], ["id perdido", { id: "eX" }], ["número", 7], ["vacío", {}], ["arreglo", ["x"]]];
      return F.map(function (f) { var t = T("tE" + f[0], "Tarea " + f[0], { encargado: f[1] }), h = fila(t), m = h.match(/class="marcaje">([^<]*)</);
        return [f[0], /dato mal guardado/.test(h), m ? m[1] : ""]; }); });
    eq("fila con cada forma de encargado", N, [["texto salvador", false, ""], ["texto equipo", false, "→ Samuel"], ["texto externo", false, "→ Manuel Parra"], ["canónica", false, "→ Samuel"], ["solo id", false, "→ Samuel"], ["id perdido", false, "→ encargado"], ["número", false, ""], ["vacío", false, ""], ["arreglo", false, ""]]);
    var K = await p.evaluate(function () { var t = { id: "tC", nombre: "x", duenio: "salvador" }; var e = creaEncargo("samuel", "Cotizar", null); tareas = [Object.assign(t, {})];
      var e2 = creaEncargo("samuel", "Cotizar el toldo", "tC"); return [Object.keys(t.encargado).sort(), t.encargado.a, encargadoDe(t).encargo === e2.id, (esperaDe(t) || {}).fuente]; });
    eq("creaEncargo escribe la forma canónica {a, id, desde} y esperaDe la lee", K, [["a", "desde", "id"], "samuel", true, "encargo"]);

    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
