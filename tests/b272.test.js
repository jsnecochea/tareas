#!/usr/bin/env node
/* PRUEBAS build 272: home súper minimalista (línea de estado, secciones vacías fuera, preguntas agrupadas, espera de terceros a Las lleva Claude, Ya está con la siguiente subiendo, Claude hasta abajo en gris). 390 px, anti-regresión. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión ≥ 272", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 272, true);
eq("sw.js con versión build ≥ 272", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 272, true);
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
      var Q = function (q) { return { k: "txt", q: q, ops: [] }; };
      function fx() { return [
        T("tP3", "Junta con el banco", "", { hecho238: { ts: 1, hecho: [], falta: [Q("¿A qué hora es la junta?"), Q("¿Quién va contigo?"), Q("¿Llevo los estados de cuenta?")] } }),
        T("tP1", "Pregunta sola", "", { hecho238: { ts: 1, hecho: [], falta: [Q("¿Cuál es la dirección?")] } }),
        T("tV1", "Vencida uno", "", { f_vigente: "2026-10-03" }), T("tV2", "Vencida dos", "", { f_vigente: "2026-10-04" }),
        T("tH1", "Hoy uno", ""), T("tH2", "Hoy dos", ""), T("tH3", "Hoy tres", ""),
        T("tF1", "Futura", "", { f_vigente: "2026-10-20" })]; }
      window.fx272 = fx;
      home(fx());
      var est = document.querySelector(".est272");
      r.est = est ? est.textContent.replace(/\s*·\s*/g, " · ").replace(/\s+/g, " ").trim() : null;
      r.estArriba = (function () { var e = est.getBoundingClientRect().top, s = document.querySelector(".h270 .sep270").getBoundingClientRect().top; return e > s; })();   /* build 279: la línea de estado va hasta abajo */
      r.secs = secs();
      r.grupo = (function () { var b = document.querySelector('.l-preg [data-id="tP3"]'); return b ? [b.getAttribute("data-preg272"), b.querySelector("small").textContent, document.querySelectorAll('.l-preg [data-id="tP3"]').length] : null; })();
      r.sola = document.querySelector('.l-preg [data-id="tP1"] small').textContent;
      r.solaSinGrupo = document.querySelector('.l-preg [data-id="tP1"]').hasAttribute("data-preg272");
      r.ancho = document.documentElement.scrollWidth <= 390;
      /* abajo: Las lleva Claude hasta abajo, plegada, gris tenue (con una tarea de Claude) */
      var L2 = fx(); L2.push(T("tCL", "La lleva Claude", "", { encargos: [{ id: "e", estado: "pendiente" }] })); home(L2);
      var ab = document.querySelectorAll(".abajo270 > .cll263"), ult = ab[ab.length - 1];
      r.claudeUltima = [ult.classList.contains("cl272"), ult.querySelector("b").textContent, !ult.querySelector(".revl"), !!ult.querySelector(".sem270")];
      var cs = getComputedStyle(ult.querySelector(".clh263 b")), ink3 = getComputedStyle(document.body).getPropertyValue("--ink-3").trim();
      var tmp = document.createElement("span"); tmp.style.color = ink3; document.body.appendChild(tmp); var c3 = getComputedStyle(tmp).color; tmp.remove();
      r.gris = [cs.color === c3, cs.fontWeight];
      /* secciones vacías: solo Hoy -> ni título de preguntas ni de vencidas, y la línea de estado solo trae "hoy" */
      home([T("tH1", "Hoy uno", ""), T("tH2", "Hoy dos", "")]);
      r.soloHoy = [document.querySelector(".est272").textContent.replace(/\s+/g, " ").trim(), Object.keys(secs()), document.body.innerText.indexOf("Te pregunta Doit") < 0, document.body.innerText.indexOf("Vencidas mías") < 0, !document.querySelector(".abajo270")];
      /* todo vacío: sin línea de estado */
      home([]); r.vacio = [!document.querySelector(".est272"), !document.querySelector(".h270"), !document.querySelector(".abajo270")];
      return r; });
    if (process.env.CAP) { await p.evaluate(function () { var L = fx272(); L.push(T("tCL", "La lleva Claude", "", { encargos: [{ id: "e", estado: "pendiente" }] })); home(L); }); await foto("b272-inicio.png"); }
    eq("Línea de estado: contadores chicos", A.est, "2 te preguntan · 2 vencidas · 3 hoy");
    eq("La línea de estado va abajo de las secciones (build 279)", A.estArriba, true);
    eq("Secciones del home", A.secs, { "Te pregunta Doit": ["Junta con el banco", "Pregunta sola"], "Vencidas mías": ["Vencida uno", "Vencida dos"], "Hoy mías": ["Hoy uno", "Hoy dos", "Hoy tres"] });
    eq("3 preguntas de una tarea = un renglón 'N preguntas'", A.grupo, ["3", "3 preguntas", 1]);
    eq("Una sola pregunta se ve como antes (su texto)", [A.sola, A.solaSinGrupo], ["¿Cuál es la dirección?", false]);
    eq("Cabe en 390 px", A.ancho, true);
    eq("Las lleva Claude: la última de abajo, plegada, con semáforo", A.claudeUltima, [true, "Las lleva Claude", true, true]);
    eq("Encabezado de Las lleva Claude en gris tenue", A.gris, [true, "600"]);
    eq("Sin preguntas ni vencidas: no salen ni sus títulos; la línea solo dice hoy", A.soloHoy, ["2 hoy", ["Hoy mías"], true, true, true]);
    eq("Todo vacío: sin línea de estado ni secciones", A.vacio, [true, true, true]);

    /* ===== tocar un contador: scroll suave a su sección ===== */
    var B = await p.evaluate(async function () {
      var L = fx272(); for (var i = 0; i < 14; i++) L.push(T("tX" + i, "Hoy extra " + i, ""));
      home(L); var sc = document.querySelector(".scroll"), r = {};
      var llamado = null, orig = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (o) { llamado = [this.id, o && o.behavior]; return orig.call(this, o); };
      document.querySelector('[data-est272="hoy"]').click(); await espera(900);
      Element.prototype.scrollIntoView = orig;
      r.llamado = llamado;
      var s = document.getElementById("sec272-hoy").getBoundingClientRect().top, top = sc.getBoundingClientRect().top;
      r.llego = [sc.scrollTop > 0, Math.abs(s - top) < 40];
      return r; });
    eq("Tocar 'hoy' hace scroll suave a Hoy mías", B.llamado, ["sec272-hoy", "smooth"]);
    eq("La sección queda arriba", B.llego, [true, true]);

    /* ===== tocar el renglón agrupado: abre la tarea con el popup de preguntas ===== */
    var C = await p.evaluate(async function () {
      home(fx272()); window.__pq255Last = "tP3";   /* aunque ya la hubiera cerrado antes, el renglón la vuelve a abrir */
      document.querySelector('[data-preg272]').click(); await espera(300);
      var r = [vista, abierta, !!document.getElementById("preg249"), document.querySelectorAll("#preg249 .pq255l li").length];
      try { cierraPreg255(); } catch (e) {}
      return r; });
    eq("Renglón agrupado → tarea abierta con el popup de sus 3 preguntas", C, ["hilo", "tP3", true, 3]);

    /* ===== espera de un tercero → Las lleva Claude (y regresa cuando contesta) ===== */
    var D = await p.evaluate(async function () {
      var N = Date.now(), r = {};
      encargos = [{ id: "enc1", a: "samuel", de: "salvador", texto: "Cotizar", cerrado: false }];
      PERSONAS.samuel = PERSONAS.samuel || { nombre: "Samuel" };
      var L = [T("tDET", "Firma de Karina", "", { detenido: { quien: "Karina López", que: "la firma", desde: "2026-10-06", toques: [] } }),
        T("tESP", "Visto bueno", "", { f_vigente: "2026-10-05", estado: "espera", espera: "samuel", espera_desde: N - 2 * 864e5 }),
        T("tENC", "Cotización", "", { encargado: { id: "enc1", desde: "2026-10-06" } }),
        T("tCON", "Ya contestó", "", { detenido: { quien: "Pato", que: "el dato", desde: "2026-10-05", toques: [] } }),
        T("tSIN", "Detenida sin quién", "", { detenido: { quien: "", que: "algo", desde: "2026-10-06", toques: [] } }),
        T("tYO", "Me espera a mí", "", { estado: "espera", espera: "salvador", espera_desde: N - 864e5 }),
        T("tPRE", "Detenida pero con pregunta para mí", "", { detenido: { quien: "Lalo", que: "x", desde: "2026-10-06", toques: [] }, hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿Le digo que sí?", ops: [] }] } })];
      L[3].msgs.push({ k: "bi", wa_in: 1, wa_c: "Pato", t: "Pato: ya te lo mandé", ts: N - 3600e3, h: "08:00" });
      home(L); window.__clL263 = true; render();
      r.secs = secs();
      r.claude = [].map.call(document.querySelectorAll(".cl272 .ttr"), function (e) { return [e.getAttribute("data-id"), (e.querySelector(".pel263") || { textContent: "" }).textContent]; }).sort();
      return r; });
    eq("Te pregunta Doit: la que me espera a mí y la que me pregunta (aunque esté detenida)", D.secs["Te pregunta Doit"], ["Me espera a mí", "Detenida pero con pregunta para mí"]);
    eq("Hoy mías: la que ya contestó y la que no tiene quién (sin dato confiable no se mueve)", D.secs["Hoy mías"], ["Ya contestó", "Detenida sin quién"]);
    eq("La vencida que esperaba a Samuel ya no está en Vencidas mías (los toques 'Hablarle otra vez' siguen como antes)", (D.secs["Vencidas mías"] || []).filter(function (x) { return !/^Hablarle otra vez/.test(x); }), []);
    eq("Las lleva Claude las tiene, con a quién se espera", D.claude, [["tDET", "espera a Karina"], ["tENC", "espera a Samuel"], ["tESP", "espera a Samuel"]]);

    /* ===== Ya está: la siguiente sube a su lugar (~250 ms) y no se cambia de pantalla dentro de la tarea ===== */
    var E = await p.evaluate(async function () {
      var r = {}; home(fx272());
      abierta = "tH2"; vista = "hilo"; render();
      document.getElementById("bya").click(); await espera(800);
      r.flujo = [vista, abierta !== null];
      abierta = null; vista = "lista"; render();
      var g = document.querySelector(".l-hoy .sale272");
      r.fantasma = g ? [g.querySelector(".rn").textContent, [].map.call(document.querySelectorAll(".l-hoy .ttr"), function (e) { return e.querySelector(".rn").textContent; }), getComputedStyle(g).transitionDuration.split(",")[0].trim(), g.hasAttribute("data-id")] : null;
      await espera(150); var g2 = document.querySelector(".l-hoy .sale272"); r.aMitad = g2 ? Math.round(g2.getBoundingClientRect().height) : -1;
      await espera(400);
      r.despues = [!!document.querySelector(".sale272"), [].map.call(document.querySelectorAll(".l-hoy .ttr"), function (e) { return e.querySelector(".rn").textContent; })];
      render(); r.otraVez = !!document.querySelector(".sale272");
      return r; });
    eq("'Ya está' dentro de la tarea no regresa al home", E.flujo, ["hilo", true]);
    eq("Al volver: el renglón cerrado se cierra en su lugar con transición de 250 ms", E.fantasma, ["Hoy dos", ["Hoy uno", "Hoy dos", "Hoy tres"], "0.25s", false]);
    eq("A media animación ya se está cerrando", E.aMitad > 0 && E.aMitad < 60, true);
    eq("Después: la siguiente quedó en su lugar", E.despues, [false, ["Hoy uno", "Hoy tres"]]);
    eq("La animación es una sola vez", E.otraVez, false);
    await foto("b272-home.png");
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
