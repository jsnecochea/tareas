#!/usr/bin/env node
/* PRUEBAS build 271 (al día con el home de tres fichas): "Mensajes por acomodar" separado de las tareas nuevas — hoy es la pestaña Mensajes de Bandeja. 390 px, anti-regresión. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión ≥ 271", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 271, true);
eq("sw.js con versión build ≥ 271", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 271, true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    window.__SWH = []; try { Object.defineProperty(navigator, "serviceWorker", { value: { addEventListener: function (t, f) { window.__SWH.push(f); }, register: function () { return Promise.resolve({}); }, ready: Promise.resolve({}) }, configurable: true }); } catch (e) {}
    var RD = Date, base = RD.parse("2026-10-07T15:00:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    /* build 285: las secciones del home amanecen plegadas; en esta prueba vieja Acomodo, Mensajes, Te pregunta Doit, Vencidas y Hoy arrancan abiertas como antes (lo que se toque se sigue recordando) */
    await p.evaluate(function () { if (typeof abre285 === "function") abre285 = function (k) { var o = _pl285(); return Object.prototype.hasOwnProperty.call(o.o, k) ? !!o.o[k] : /^(aco|msg|decide|preg|venc|hoy)$/.test(k); }; });
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true;
      window.__esp = []; window.__push = []; window.__pids = [];
      db = { collection: function () { return { doc: function (k) { return { set: function (d, o) { window.__esp.push([k, d, o]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      window.llamaPush = function (a, c) { window.__push.push([a, c]); };
      window.pideWhatsApp = function (c) { window.__pids.push(c); return Promise.resolve({ id: "wa_x" }); };
      document.getElementById("app").style.display = "flex"; window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      var N = Date.now();
      window.T = function (id, nombre, ctx, extra) { var t = { id: id, nombre: nombre, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-07", fecha_dictada: true, contexto: ctx || "Tarea de prueba con contexto suficiente para que no falte nada de contexto en la ficha de la tarea y se vea completa.", ritmo: "diario", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 100000, h: "07:00" }] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.home = function (L) { tareas = L; abierta = null; vista = "lista"; window.__grupoInicio = null; window.__segBandeja = null; window.__clL263 = false; window.__ttAb = { venc: true, hoy: true }; window.__rfF263 = 0; render(); };
      window.filas = function () { return [].map.call(document.querySelectorAll(".ttl .ttr:not(.ttsum)"), function (b) { return b.querySelector(".rn").textContent; }); };
      window.sumas = function () { return [].map.call(document.querySelectorAll(".ttsum .rn"), function (b) { return b.textContent; }); };
      /* build 270: secciones siempre desplegadas del home (Te pregunta Doit · Vencidas mías · Hoy mías) */
      window.secs = function () { var o = {}; [].forEach.call(document.querySelectorAll(".h270 .sep270, .h270 .hd284"), function (s) { var L = s.nextElementSibling; o[s.querySelector("span").textContent] = [].map.call(L.querySelectorAll(".ttr .rn, .f284n"), function (b) { return b.textContent; }); }); return o; };
    });

    var A = await p.evaluate(async function () {
      var N = Date.now(), r = {};
      function fx() { return [
        T("tPRO", "Propuesta de IA", "x", { creada_por: "ia_revisor", tipo_elegido: false, autorizada: false, f_vigente: "" }),
        T("tNEC", "Pregunta de Claude", "", { hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿A qué hora es la junta?", ops: [] }] } }),
        T("tLER", "Mantenimiento Casa Lerdo", "", { indefinida: true, f_vigente: "", msgs: [
          { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: mañana te dejamos la muestra de la melamina al alto brillo para la mesa", ts: N - 5e6, h: "11:51", duda_tarea: { alternativa_id: "tVES", alternativa_nombre: "Vestidores" } },
          { k: "bi", wa_in: 1, wa_c: "Lalo Madero", t: "Lalo Madero: ¿Hay miercolitos esta semana para revisar la cotización de 12,500?", ts: N - 1e6, h: "13:50", duda_tarea: { alternativa_id: "tVES", alternativa_nombre: "Vestidores" } }] }),
        T("tVES", "Vestidores", "", { f_vigente: "2026-10-20" })]; }
      try { localStorage.removeItem("bit_msg_pleg271"); } catch (e) {} window.__msgPleg271 = undefined; poneAcoPlegado260(false);
      home(fx());
      var tab = function (k) { return document.querySelector('.seg-bandeja [data-seg="' + k + '"]'); };
      r.ficha = document.querySelector('.ficha-inicio[data-grupo="bandeja"]').getAttribute("aria-label");
      r.inicioLimpio = !document.querySelector(".aco226, .msg271");
      abreGrupoInicio("bandeja");
      r.orden = [].map.call(document.querySelectorAll(".seg-bandeja [data-seg]"), function (b) { return b.textContent + ":" + b.getAttribute("aria-selected"); });
      r.nuevasCab = document.querySelector(".aco226:not(.msg271) .acoh").textContent;
      r.nuevasSinPlaticas = document.querySelectorAll(".aco226 .g237").length;
      tab("mensajes").click(); await espera(30);
      r.cab = [tab("mensajes").getAttribute("aria-selected"), !document.querySelector("#bmsg271"), !document.querySelector(".aco226:not(.msg271)")];
      r.tarjetas = [].map.call(document.querySelectorAll(".msg271 .acor.g237"), function (f) { return [f.querySelector(".acow b").textContent, [].map.call(f.querySelectorAll(":scope > .acob > .ac226 button"), function (b) { return b.textContent; }).join("·")]; });
      r.ancho = [document.documentElement.scrollWidth <= 390, Math.round(document.querySelector(".msg271").getBoundingClientRect().right) <= 390];
      /* las tarjetas funcionan igual: OK en la de Lalo */
      var lalo = [].filter.call(document.querySelectorAll(".msg271 .acor.g237"), function (f) { return /Lalo/.test(f.textContent); })[0];
      lalo.querySelector(":scope > .acob > .ac226 [data-acok]").click(); await espera(30);
      var L = tareas.filter(function (t) { return t.id === "tLER"; })[0];
      r.ok = [L.msgs.filter(function (x) { return /Lalo/.test(x.wa_c || "") && x.acomodo && x.acomodo.ok === 1; }).length, document.querySelectorAll(".msg271 .acor.g237").length, tab("mensajes").querySelector("em").textContent];
      cierraGrupoInicio(); r.ficha2 = document.querySelector('.ficha-inicio[data-grupo="bandeja"]').getAttribute("aria-label");
      /* sin propuestas: la Bandeja abre directo en Mensajes */
      var F = fx().filter(function (t) { return t.id !== "tPRO"; }); home(F); abreGrupoInicio("bandeja"); r.sinNuevas = [tab("mensajes").getAttribute("aria-selected"), !!document.querySelector(".msg271 .acor.g237")];
      /* sin mensajes por acomodar: la pestaña dice 0 y avisa que no hay */
      home([fx()[0], fx()[1]]); abreGrupoInicio("bandeja"); tab("mensajes").click(); await espera(30);
      r.sinMsgs = [!!document.querySelector(".msg271"), tab("mensajes").querySelector("em").textContent, (document.querySelector(".vacio-grupo") || {}).textContent];
      cierraGrupoInicio();
      return r; });
    await foto("b271-home.png");
    eq("la ficha Bandeja cuenta 1 tarea nueva + 2 pláticas y el inicio no pinta las tarjetas", [A.ficha, A.inicioLimpio], ["Bandeja: 3", true]);
    eq("dentro: pestañas Tareas nuevas · Mensajes con su número, arranca en Tareas nuevas", A.orden, ["Tareas nuevas1:true", "Mensajes2:false"]);
    eq("Mensajes: una pestaña a la vez, sin el encabezado plegable viejo", A.cab, ["true", true, true]);
    eq("Nuevas tareas ya no cuenta pláticas", A.nuevasCab, "Acomodo1 tarea nueva por revisar");
    eq("ninguna plática dentro de Nuevas tareas", A.nuevasSinPlaticas, 0);
    eq("tarjetas sin cambios (OK · Mover · Nueva · Dato · No guardar)", A.tarjetas, [["Lalo Madero", "OK·Mover·Nueva·Dato·No guardar"], ["Manuel Parra", "OK·Mover·Nueva·Dato·No guardar"]]);
    eq("cabe en 390 px sin scroll horizontal", A.ancho, [true, true]);
    eq("OK funciona igual y el contador baja (pestaña y ficha)", [A.ok, A.ficha2], [[1, 1, "1"], "Bandeja: 2"]);
    eq("sin nuevas tareas: la Bandeja abre en Mensajes", A.sinNuevas, ["true", true]);
    eq("sin mensajes: la pestaña dice 0 y lo avisa", A.sinMsgs, [false, "0", "No hay mensajes por acomodar."]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
