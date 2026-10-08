#!/usr/bin/env node
/* PRUEBAS build 270: home reacomodado (Acomodo · Te pregunta Doit · Vencidas mías · Hoy mías · plegadas: Las lleva Claude con semáforo, Mías futuras, resto). 390 px, anti-regresión. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión ≥ 270", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 270, true);
eq("sw.js con versión build ≥ 270", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 270, true);
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
      window.secs = function () { var o = {}; [].forEach.call(document.querySelectorAll(".h270 .sep270, .h270 .hd284"), function (s) { var L = s.nextElementSibling; o[s.querySelector("span").textContent] = [].map.call(L.querySelectorAll(".ttr .rn, .f284n"), function (b) { return b.textContent; }); }); return o; };
    });
    /* ===================== 1. ORDEN DEL HOME Y SECCIONES SIEMPRE DESPLEGADAS ===================== */
    var A = await p.evaluate(async function () {
      PERSONAS.samuel = PERSONAS.samuel || { nombre: "Samuel" };
      var N = Date.now(), D = 864e5;
      var L = [
        T("tPRO", "Propuesta de IA", "x", { creada_por: "ia_revisor", tipo_elegido: false, autorizada: false, f_vigente: "" }),
        T("tNEC", "Pregunta de Claude", "", { hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿A qué hora es la junta?", ops: [] }] } }),
        T("tVEN", "Pagar predial", "", { f_vigente: "2026-10-03" }),
        T("tHOY", "Llamar al notario", "", {}),
        T("tEXP", "Expediente colegio", "", { nuevo264: N - 60000 }),
        T("tREV", "Bitácora de obra de Samuel", "", { duenio: "samuel", creada_por: "samuel", revisores: ["salvador"] }),
        T("tFUT", "Renovar seguro del coche", "", { f_vigente: "2026-10-15" }),
        T("cR", "Trámite SAT (Claude atrasado)", "", { encargos: [{ id: "e1", estado: "pendiente", t: "revisar el buzón", cuando: "2026-10-03T09:00:00-06:00" }] }),
        T("cA", "Presupuesto de Josué", "", { resumen: { pendientes: [{ t: "Mandar presupuesto de la barda", de: "Josué", fecha: "2026-10-06" }] },
          msgs: [{ k: "bo", wa_c: "Josué", t: "¿Me mandas el presupuesto?", ts: N - 3 * D, h: "09:00" }] }),
        T("cS", "Seguimiento a Karina", "", { seg_a: { contacto: "Karina López", programados: ["2026-10-05 10:00"] } }),
        T("cV", "Instalación con Pato", "", { resumen: { pendientes: [{ t: "Confirmar fecha de instalación", de: "Pato", fecha: "2026-10-05" }] },
          msgs: [{ k: "bo", wa_c: "Pato", t: "¿Ya tienes fecha?", ts: N - 3 * D, h: "09:00" }, { k: "bi", wa_in: 1, wa_c: "Pato", t: "Ya quedó, el jueves", ts: N - 3600e3, h: "08:00" }] }),
        T("cN", "Mantenimiento Cumbres", "", { encargos: [{ id: "e2", estado: "pendiente" }] })];
      poneAcoPlegado260(false); window.__verEnc270 = false; window.__verRev270 = false; window.__verComp = false; verFuturas = false;
      home(L);
      var r = { secs: secs() };
      var y = function (sel) { var e = document.querySelector(sel); return e ? e.getBoundingClientRect().top + window.scrollY + (document.querySelector(".scroll") || { scrollTop: 0 }).scrollTop : -1; };
      var seps = [].map.call(document.querySelectorAll(".h270 .sep270 span, .h270 .hd284 span"), function (s) { return s.textContent; });
      r.seps = seps;
      var pos = [y("#bprop256")].concat([].map.call(document.querySelectorAll(".h270 .sep270, .h270 .hd284"), function (s) { return s.getBoundingClientRect().top; })).concat([y(".abajo270")]);
      r.orden = pos.every(function (v, i) { return v >= 0 && (i === 0 || v > pos[i - 1]); });
      r.abajo = [].map.call(document.querySelectorAll(".abajo270 .clh263"), function (b) { return b.id; });
      r.sinToggles = document.querySelectorAll(".h270 .ttsum, .h270 [data-ttab]").length; r.toggles285 = [].map.call(document.querySelectorAll(".h270 [data-pl285]"), function (b) { return b.getAttribute("data-pl285") + ":" + b.getAttribute("aria-expanded"); });   /* build 285: Salvador pidió que se plieguen tocando el encabezado */
      var css = function (sel, prop) { var e = document.querySelector(sel); return e ? getComputedStyle(e)[prop] : ""; };
      r.colores = [!document.querySelector(".l284 .ttr i"), css(".l-venc .ttr i", "backgroundColor"), css(".l-hoy .ttr i", "backgroundColor"), css(".hd284 span", "color")];   /* build 284: Te pregunta Doit limpio, sin puntito ni naranja */
      r.fondoPreg = css(".l284", "backgroundColor");   /* build 284: bloque gris #1C1C1E, sin fondo naranja */
      r.lee = [!document.querySelector(".h270 .sep270 #bttlee"), (window.__ttOrden || []).join(",")];   /* build 277: el audífono del separador se quitó (la Caminata va con el ícono junto al ⋯) */
      r.swipe = (window.ordenSwipe || []).slice(0, 8).join(",");
      r.ancho = [document.documentElement.scrollWidth, document.querySelector("#app").scrollWidth];
      /* Acomodo sigue plegándose como antes */
      document.getElementById("bprop256").click(); await espera(30); r.acoPleg = [acoPlegado260(), !!document.querySelector(".aco226:not(.msg271)")];
      document.getElementById("bprop256").click(); await espera(30); r.acoDesp = [acoPlegado260(), !!document.querySelector(".aco226:not(.msg271)")];
      return r; });
    eq("Separadores en orden: Te pregunta Doit · Vencidas mías · Hoy mías", A.seps, ["Te pregunta Doit", "Vencidas mías", "Hoy mías"]);
    eq("Orden vertical: Acomodo arriba, luego 2, 3, 4 y hasta abajo las plegadas", A.orden, true);
    eq("Te pregunta Doit: la pregunta de Claude", A.secs["Te pregunta Doit"], ["Pregunta de Claude"]);
    eq("Vencidas mías: la vencida de Salvador", A.secs["Vencidas mías"], ["Pagar predial"]);
    eq("Hoy mías: primero lo que despertó (expediente), luego lo de hoy; nada de otro dueño", A.secs["Hoy mías"], ["Expediente colegio", "Llamar al notario"]);
    eq("Secciones 2-4 sin renglón resumen ni pestañas", A.sinToggles, 0);
    eq("build 285: Te pregunta Doit, Vencidas y Hoy se pliegan tocando su encabezado (aquí abiertas)", A.toggles285, ["preg:true", "venc:true", "hoy:true"]);
    eq("Puntitos: rojo y gris en Vencidas / Hoy; Te pregunta Doit sin puntito y con título claro (build 284)", A.colores, [true, "rgb(255, 59, 48)", "rgb(142, 142, 147)", "rgb(245, 245, 247)"]);
    eq("Te pregunta Doit en bloque gris #1C1C1E, sin fondo naranja (build 284)", A.fondoPreg, "rgb(28, 28, 30)");
    eq("Abajo, plegadas y en orden: Mías futuras · Las revisas tú · y hasta abajo Las lleva Claude (build 272)", A.abajo, ["bfut", "brev270", "bcl263"]);
    eq("build 277: sin audífono en el separador; el orden del home se conserva", A.lee, [true, "tNEC,tVEN,tEXP,tHOY"]);
    eq("El swipe entre tareas sigue el orden del home (2, 3, 4 y luego Claude)", A.swipe.split(",").slice(0, 4).join(","), "tNEC,tVEN,tEXP,tHOY");
    eq("Sin scroll horizontal a 390 px", A.ancho.every(function (w) { return w <= 390; }), true);
    eq("Acomodo (Nuevas tareas para acomodar) se pliega y se despliega como antes", [A.acoPleg, A.acoDesp], [[true, false], [false, true]]);
    await foto("b270-1-home.png");

    /* ===================== 2. SEMÁFORO DE LAS LLEVA CLAUDE ===================== */
    var B = await p.evaluate(async function () {
      var r = {}, b = document.getElementById("bcl263");
      r.plegada = !document.querySelector(".abajo270 .cll263 .revl");
      r.cab = b.innerText.replace(/\s+/g, " ").trim(); r.aria = b.getAttribute("aria-label");
      r.sem = [].map.call(b.querySelectorAll(".sem270 span"), function (s) { return [getComputedStyle(s.querySelector("i")).backgroundColor, s.textContent]; });
      b.click(); await espera(40);
      r.filas = [].map.call(document.querySelectorAll(".abajo270 .cl272 .ttr"), function (e) { return [e.getAttribute("data-id"), e.className.match(/sem-(\w+)/)[1], (e.querySelector(".semw270") || e.querySelector(".semsd270") || { textContent: "" }).textContent]; });
      r.directo = ["cR", "cA", "cS", "cV", "cN"].map(function (id) { var t = tareas.filter(function (x) { return x.id === id; })[0]; var s = semaforo270(t, pelota263(t)); return [id, s.c, s.sinDato]; });
      return r; });
    eq("Las lleva Claude viene plegada", B.plegada, true);
    eq("Encabezado con semáforo: 2 al corriente, 2 amarillo, 1 rojo", [B.cab, B.sem], ["Las lleva Claude 2 2 1", [["rgb(48, 209, 88)", "2"], ["rgb(255, 214, 10)", "2"], ["rgb(255, 69, 58)", "1"]]]);
    eq("Para lector de pantalla: al corriente y con problema", B.aria, "Las lleva Claude: 2 al corriente, 3 con problema de seguimiento");
    eq("Semáforo por tarea (encargo atrasado 4 días = rojo; Josué 1 día y Karina 2 días = amarillo; Pato contestó = verde; sin fecha = verde sin dato)", B.directo,
      [["cR", "rojo", false], ["cA", "amarillo", false], ["cS", "amarillo", false], ["cV", "verde", false], ["cN", "verde", true]]);
    eq("Al abrirla: primero lo rojo, luego amarillo, luego verde, cada una con su porqué", B.filas, [
      ["cR", "rojo", "Claude va atrasado · tocaba el 3 oct (4 días)"],
      ["cA", "amarillo", "Josué no ha contestado · se esperaba ayer (1 día)"],
      ["cS", "amarillo", "Karina no ha contestado · se esperaba el 5 oct (2 días)"],
      ["cV", "verde", ""],
      ["cN", "verde", "sin dato de seguimiento · cuenta como al corriente"]]);
    await p.evaluate(function () { var e = document.getElementById("bcl263"); if (e) e.scrollIntoView({ block: "start" }); });
    await foto("b270-2-claude-semaforo.png");

    /* ===================== 3. PLEGADAS DE ABAJO, SIN DEFINIR Y 100% SUYAS ===================== */
    var C = await p.evaluate(async function () {
      var r = {};
      r.futAntes = !!document.querySelector('.abajo270 [data-id="tFUT"]') || document.body.innerText.indexOf("Renovar seguro del coche") >= 0;
      document.getElementById("bfut").click(); await espera(30); r.futDesp = document.body.innerText.indexOf("Renovar seguro del coche") >= 0;
      r.futCab = document.getElementById("bfut").innerText.replace(/\s+/g, " ").trim();
      document.getElementById("brev270").click(); await espera(30);
      r.rev = [].map.call(document.querySelectorAll('.abajo270 .ttr[data-id="tREV"]'), function (e) { return e.innerText.replace(/\s+/g, " "); });
      /* sin fecha definida (y sin pregunta pendiente) va a Vencidas mías, nunca a Hoy */
      var S = T("tSIN", "Sin fecha", "", { f_vigente: "" }), V = T("tV2", "Otra vencida", "", { f_vigente: "2026-10-01" }), Hh = T("tH2", "De hoy", "", {});
      var X = armaHome270([], [], [V], [S, Hh], []);
      r.sinDef = [X.venc.map(function (x) { return x.t.id + ":" + x.why; }), X.hoy.map(function (x) { return x.t.id; })];
      /* una tarea de otro dueño nunca entra a 3 ni a 4 */
      var O = T("tO", "De Samuel", "", { duenio: "samuel" }), Y = armaHome270([], [], [O], [O], []);
      r.ajena = [Y.venc.length, Y.hoy.length, Y.otros.map(function (x) { return x.t.id; })];
      /* las funciones de siempre siguen ahí */
      r.funciones = ["opcionesUnico261", "abreEnlazar", "menuAcc254", "vPropuestas256", "okProp256", "descartaProp256", "faltaPreciso263", "esDormida264", "despiertaTodas264", "abreMover225", "vCompartidas", "pelota263", "reparte263"].filter(function (f) { return typeof window[f] !== "function"; });
      /* tocar un renglón de Te pregunta Doit abre la tarea */
      window.__verRev270 = false; verFuturas = false; render();
      document.querySelector('.l284 .ttr[data-id="tNEC"]').click(); await espera(60); r.abre = [vista, abierta];
      vista = "lista"; abierta = null; render();
      /* home vacío: una sola línea */
      tareas = []; render(); r.vacio = (document.querySelector(".sep270.s-ok") || { textContent: "" }).textContent;
      return r; });
    eq("Mías futuras plegada; al tocarla se ve la futura", [C.futAntes, C.futDesp, C.futCab], [false, true, "Mías futuras 1"]);
    eq("La de otro dueño que Salvador revisa baja a 'Las revisas tú' (con su dueño)", C.rev, ["Bitácora de obra de Samuel de Samuel · hoy"]);
    eq("Sin fecha definida → Vencidas mías (después de las vencidas); nunca en Hoy", C.sinDef, [["tV2:venció 1 oct", "tSIN:sin fecha · falta definir cuándo"], ["tH2"]]);
    eq("Una tarea ajena no entra a Vencidas ni Hoy mías", C.ajena, [0, 0, ["tO"]]);
    eq("Siguen todas las funciones (menú de pulsación larga, vincular, mover, propuestas, falta, expedientes, compartidas)", C.funciones, []);
    eq("Tocar un renglón abre la tarea", C.abre, ["hilo", "tNEC"]);
    eq("Sin nada pendiente: 'Todo al día'", C.vacio, "Todo al día");
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n")); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
