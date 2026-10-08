#!/usr/bin/env node
/* PRUEBAS build 279: el resumen "te preguntan · vencidas · hoy" va hasta abajo del home; arriba solo el botón Caminata. 390 px. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión ≥ 279", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 279, true);
eq("sw.js con versión build ≥ 279", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 279, true);
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
      window.home = function (L) { tareas = L; abierta = null; vista = "lista"; window.__clL263 = false; window.__ttAb = { venc: true, hoy: true }; window.__rfF263 = 0; render(); };
      window.filas = function () { return [].map.call(document.querySelectorAll(".ttl .ttr:not(.ttsum)"), function (b) { return b.querySelector(".rn").textContent; }); };
      window.sumas = function () { return [].map.call(document.querySelectorAll(".ttsum .rn"), function (b) { return b.textContent; }); };
      /* build 270: secciones siempre desplegadas del home (Te pregunta Doit · Vencidas mías · Hoy mías) */
      window.secs = function () { var o = {}; [].forEach.call(document.querySelectorAll(".h270 .sep270"), function (s) { var L = s.nextElementSibling; o[s.querySelector("span").textContent] = [].map.call(L.querySelectorAll(".ttr .rn"), function (b) { return b.textContent; }); }); return o; };
    });


    var A = await p.evaluate(async function () {
      var Q = function (q) { return { k: "txt", q: q, ops: [] }; }, r = {};
      var L = [T("tP1", "Pregunta sola", "", { hecho238: { ts: 1, hecho: [], falta: [Q("¿Cuál es la dirección?")] } }),
        T("tV1", "Vencida uno", "", { f_vigente: "2026-10-03" }), T("tH1", "Hoy uno", ""), T("tH2", "Hoy dos", ""),
        T("tF1", "Futura", "", { f_vigente: "2026-10-20" }), T("tCL", "La lleva Claude", "", { encargos: [{ id: "e", estado: "pendiente" }] })];
      for (var i = 0; i < 12; i++) L.push(T("tX" + i, "Hoy extra " + i, ""));
      home(L);
      var est = document.querySelectorAll(".est272");
      r.una = est.length;
      est = est[0];
      r.texto = est.textContent.replace(/\s*·\s*/g, " · ").replace(/\s+/g, " ").trim();
      var pos = function (a, b) { return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); };
      var todas = [].slice.call(document.querySelectorAll(".h270 .sep270, .abajo270 .cll263, .prop256row, .msg271, .cam274, .camb274"));
      r.despuesDeTodo = todas.every(function (el) { return pos(el, est); });
      r.despuesDeAbajo = pos(document.querySelector(".abajo270"), est);
      var sc = document.querySelector(".scroll") || document.scrollingElement;
      var primero = sc.querySelector(".est272, .sep270, .h270");
      r.primeroNoEsResumen = !(primero && primero.classList.contains("est272"));
      r.nadaAbajoEnLista = (function () { var n = est.nextElementSibling; while (n) { if (n.querySelector && (n.querySelector(".ttr") || n.classList.contains("sep270") || n.classList.contains("cll263"))) return false; n = n.nextElementSibling; } return true; })();
      r.ancho = document.documentElement.scrollWidth <= 390;
      /* el contador sigue llevando a su sección (ahora hacia arriba) */
      sc.scrollTop = sc.scrollHeight;
      var llamado = null, orig = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (o) { llamado = [this.id, o && o.behavior]; return orig.call(this, o); };
      document.querySelector('[data-est272="venc"]').click(); await espera(900);
      Element.prototype.scrollIntoView = orig;
      r.llamado = llamado;
      r.llego = Math.abs(document.getElementById("sec272-venc").getBoundingClientRect().top - sc.getBoundingClientRect().top) < 40;
      home([]); r.vacio = !document.querySelector(".est272");
      return r; });
    eq("Un solo resumen en el home", A.una, 1);
    eq("Mismos contadores", A.texto, "1 te pregunta · 1 vencida · 14 hoy");
    eq("El resumen va después de todas las secciones", A.despuesDeTodo, true);
    eq("El resumen va después de Las lleva Claude / plegadas", A.despuesDeAbajo, true);
    eq("Lo primero del home ya no es el resumen", A.primeroNoEsResumen, true);
    eq("Nada de la lista queda debajo del resumen", A.nadaAbajoEnLista, true);
    eq("Cabe en 390 px", A.ancho, true);
    eq("Tocar 'vencida' lleva con scroll suave a Vencidas mías", A.llamado, ["sec272-venc", "smooth"]);
    eq("La sección queda arriba", A.llego, true);
    eq("Todo vacío: sin resumen", A.vacio, true);
    await foto("b279-home.png");
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
