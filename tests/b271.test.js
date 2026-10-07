#!/usr/bin/env node
/* PRUEBAS build 271: "Mensajes por acomodar" en su propia pestañita plegable, debajo de Nuevas tareas para acomodar y arriba de Te pregunta Doit. 390 px, anti-regresión. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión = 271", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1], 271);
eq("sw.js con versión build 271", /var SW_VERSION = 'build 271'/.test(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")), true);
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
      var orden = function () { var o = []; [].forEach.call(document.querySelectorAll(".aco226:not(.msg271), .msg271, .h270 .sep270.s-preg"), function (e) { o.push(e.classList.contains("msg271") ? "msgs" : e.classList.contains("sep270") ? "preg" : "nuevas"); }); return o; };
      r.orden = orden();
      var top = function (sel) { var e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().top) : -1; };
      r.y = [top(".aco226:not(.msg271)"), top(".msg271"), top(".h270 .sep270.s-preg")];
      r.cab = [document.querySelector("#bmsg271 b").textContent, document.querySelector("#bmsg271 .ttn").textContent, document.getElementById("bmsg271").getAttribute("aria-expanded")];
      r.nuevasCab = document.querySelector(".aco226:not(.msg271) .acoh").textContent;
      r.nuevasSinPlaticas = document.querySelectorAll(".aco226:not(.msg271) .g237").length;
      r.tarjetas = [].map.call(document.querySelectorAll(".msg271 .acor.g237"), function (f) { return [f.querySelector(".acow b").textContent, [].map.call(f.querySelectorAll(":scope > .acob > .ac226 button"), function (b) { return b.textContent; }).join("·")]; });
      r.ancho = [document.documentElement.scrollWidth <= 390, Math.round(document.querySelector(".msg271").getBoundingClientRect().right) <= 390];
      /* plegar: se recuerda */
      document.getElementById("bmsg271").click(); await espera(30);
      r.plegada = [document.getElementById("bmsg271").getAttribute("aria-expanded"), document.querySelectorAll(".msg271 .acor").length, document.querySelector("#bmsg271 .ttn").textContent, localStorage.getItem("bit_msg_pleg271"), orden().join(">")];
      window.__msgPleg271 = undefined; home(fx());   /* como si se reabriera la app */
      r.recuerda = [msgPlegado271(), document.querySelectorAll(".msg271 .acor").length];
      document.getElementById("bmsg271").click(); await espera(30);
      r.desplegada = [document.getElementById("bmsg271").getAttribute("aria-expanded"), document.querySelectorAll(".msg271 .acor").length, localStorage.getItem("bit_msg_pleg271")];
      /* las tarjetas funcionan igual: OK en la de Lalo */
      var lalo = [].filter.call(document.querySelectorAll(".msg271 .acor.g237"), function (f) { return /Lalo/.test(f.textContent); })[0];
      lalo.querySelector(":scope > .acob > .ac226 [data-acok]").click(); await espera(30);
      var L = tareas.filter(function (t) { return t.id === "tLER"; })[0];
      r.ok = [L.msgs.filter(function (x) { return /Lalo/.test(x.wa_c || "") && x.acomodo && x.acomodo.ok === 1; }).length, document.querySelectorAll(".msg271 .acor.g237").length, document.querySelector("#bmsg271 .ttn").textContent];
      /* el banner de Nuevas tareas pliega SOLO las nuevas; los mensajes siguen */
      document.getElementById("bprop256").click(); await espera(30);
      r.banner = [!!document.querySelector(".aco226:not(.msg271)"), !!document.querySelector(".msg271"), orden().join(">")];
      document.getElementById("bprop256").click(); await espera(30);
      /* sin propuestas: la pestañita queda arriba de Te pregunta Doit */
      var F = fx().filter(function (t) { return t.id !== "tPRO"; }); home(F); r.sinNuevas = orden().join(">");
      /* sin mensajes por acomodar: no sale */
      home([fx()[0], fx()[1]]); r.sinMsgs = [!!document.querySelector(".msg271"), orden().join(">")];
      return r; });
    await foto("b271-home.png");
    eq("orden: Nuevas tareas para acomodar → Mensajes por acomodar → Te pregunta Doit", A.orden, ["nuevas", "msgs", "preg"]);
    eq("en pantalla, de arriba hacia abajo", A.y[0] < A.y[1] && A.y[1] < A.y[2], true);
    eq("encabezado con contador, desplegada por defecto", A.cab, ["Mensajes por acomodar", "2", "true"]);
    eq("Nuevas tareas ya no cuenta pláticas", A.nuevasCab, "Acomodo1 tarea nueva por revisar");
    eq("ninguna plática dentro de Nuevas tareas", A.nuevasSinPlaticas, 0);
    eq("tarjetas sin cambios (OK · Mover · Nueva · Dato · No guardar)", A.tarjetas, [["Lalo Madero", "OK·Mover·Nueva·Dato·No guardar"], ["Manuel Parra", "OK·Mover·Nueva·Dato·No guardar"]]);
    eq("cabe en 390 px sin scroll horizontal", A.ancho, [true, true]);
    eq("plegada: sin tarjetas, contador visible, se guarda, sigue en su lugar", A.plegada, ["false", 0, "2", "1", "nuevas>msgs>preg"]);
    eq("al reabrir sigue plegada", A.recuerda, [true, 0]);
    eq("se despliega de nuevo", A.desplegada, ["true", 2, "0"]);
    eq("OK funciona igual y el contador baja", A.ok, [1, 1, "1"]);
    eq("el banner de nuevas tareas no pliega los mensajes", A.banner, [false, true, "msgs>preg"]);
    eq("sin nuevas tareas: Mensajes arriba de Te pregunta Doit", A.sinNuevas, "msgs>preg");
    eq("sin mensajes: la pestañita no sale", A.sinMsgs, [false, "nuevas>preg"]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
