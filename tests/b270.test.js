#!/usr/bin/env node
/* PRUEBAS build 270 (al día con el home de tres fichas): qué entra a Te pregunta Doit · Vencidas mías · Hoy mías, Las lleva Claude con semáforo, Próximas, Las revisas tú. 390 px, anti-regresión. */
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
      /* home de tres fichas: cada sección vive en su propia vista (Te esperan · Vencidas · Hoy); se abren una por una y se regresa al inicio */
      window.secs = function () { var o = {};
        [["esperan"], ["venc", "Vencidas mías"], ["hoy", "Hoy mías"]].forEach(function (x) { window.__grupoInicio = x[0]; render(); var g = document.querySelector('[data-grupo-vista="' + x[0] + '"]'); if (!g) return;
          if (x[1]) { var L = [].map.call(g.querySelectorAll(x[0] === "hoy" ? ".ttr:not(.es-vencida) .rn" : ".ttr .rn"), function (b) { return b.textContent; }); if (L.length) o[x[1]] = L; }   /* «Hoy mías» = lo de hoy; las vencidas que la ficha Hoy junta arriba las cubre inicio-filtros */
          else [].forEach.call(g.querySelectorAll(".sc284"), function (sc) { o[sc.getAttribute("aria-label")] = [].map.call(sc.querySelectorAll(".ttr .rn, .f284n"), function (b) { return b.textContent; }); }); });
        window.__grupoInicio = null; render(); return o; };
      window.enGrupo = function (g, fn) { window.__grupoInicio = g; render(); var r = fn(document.querySelector('[data-grupo-vista="' + g + '"]')); window.__grupoInicio = null; render(); return r; };
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
      r.seps = [].map.call(document.querySelectorAll(".fichas-inicio .fi-l"), function (s) { return s.textContent; }).concat(Object.keys(r.secs));
      r.orden = y(".fichas-inicio") >= 0 && y(".fichas-inicio") < y(".lista-inicio");
      r.abajo = [].map.call(document.querySelectorAll(".lista-inicio .fila-inicio"), function (b) { return b.getAttribute("data-grupo"); });
      var css = function (root, sel, prop) { var e = root && root.querySelector(sel); return e ? getComputedStyle(e)[prop] : ""; };
      var vE = enGrupo("esperan", function (g) { return { tog: [].slice.call(g.querySelectorAll(".ttsum, [data-ttab]")).length, pl: g.querySelectorAll("[data-pl285], [hidden]").length, sinPunto: !g.querySelector(".l284 .ttr i"), tit: css(g, ".hd284 span", "color"), fondo: css(g, ".l284", "backgroundColor") }; });
      var vV = enGrupo("venc", function (g) { return { tog: g.querySelectorAll(".ttsum, [data-ttab]").length, pl: g.querySelectorAll("[data-pl285], [hidden]").length, c: css(g, ".l-venc .ttr i", "backgroundColor") }; });
      var vH = enGrupo("hoy", function (g) { return { tog: g.querySelectorAll(".ttsum, [data-ttab]").length, pl: g.querySelectorAll("[data-pl285], [hidden]").length, c: css(g, ".l-hoy .ttr:not(.es-vencida) i", "backgroundColor") }; });
      r.sinToggles = vE.tog + vV.tog + vH.tog; r.toggles285 = [vE.pl, vV.pl, vH.pl];
      r.colores = [vE.sinPunto, vV.c, vH.c, vE.tit];   /* Te pregunta Doit limpio, sin puntito ni naranja */
      r.fondoPreg = vE.fondo;   /* bloque gris #1C1C1E, sin fondo naranja */
      r.lee = [!document.querySelector("#bttlee"), (window.__ttOrden || []).join(",")];   /* sin audífono en el inicio (la Caminata va con el ícono junto al ⋯) */
      r.swipe = (window.ordenSwipe || []).slice(0, 8).join(",");
      r.ancho = [document.documentElement.scrollWidth, document.querySelector("#app").scrollWidth];
      /* la propuesta de la IA está en Bandeja (su ficha la cuenta y la abre) */
      r.bandeja = [document.querySelector('.ficha-inicio[data-grupo="bandeja"]').getAttribute("aria-label"), !document.querySelector(".aco226")];
      document.querySelector('.ficha-inicio[data-grupo="bandeja"]').click(); await espera(30); r.bandeja.push(!!document.querySelector('[data-grupo-vista="bandeja"] [data-p256="tPRO"]'));
      cierraGrupoInicio();
      return r; });
    eq("Fichas Te esperan · Bandeja · Hoy y sus vistas: Te pregunta Doit · Vencidas mías · Hoy mías", A.seps, ["Te esperan", "Bandeja", "Hoy", "Te pregunta Doit", "Vencidas mías", "Hoy mías"]);
    eq("Orden vertical: las fichas arriba y la lista agrupada abajo", A.orden, true);
    eq("Te pregunta Doit: la pregunta de Claude", A.secs["Te pregunta Doit"], ["Pregunta de Claude"]);
    eq("Vencidas mías: la vencida de Salvador", A.secs["Vencidas mías"], ["Pagar predial"]);
    eq("Hoy mías: primero lo que despertó (expediente), luego lo de hoy; nada de otro dueño", A.secs["Hoy mías"], ["Expediente colegio", "Llamar al notario"]);
    eq("Secciones 2-4 sin renglón resumen ni pestañas", A.sinToggles, 0);
    eq("En su propia vista Te esperan, Vencidas y Hoy van siempre abiertas (nada plegado ni escondido)", A.toggles285, [0, 0, 0]);
    eq("Puntitos: rojo y gris en Vencidas / Hoy; Te pregunta Doit sin puntito y con título claro (build 284)", A.colores, [true, "rgb(255, 59, 48)", "rgb(142, 142, 147)", "rgb(245, 245, 247)"]);
    eq("Te pregunta Doit en bloque gris #1C1C1E, sin fondo naranja (build 284)", A.fondoPreg, "rgb(28, 28, 30)");
    eq("Lista agrupada en orden: Vencidas · Próximas · Las revisas tú · Las lleva Claude · Historial", A.abajo, ["venc", "prox", "rev", "claude", "hist"]);
    eq("build 277: sin audífono en el separador; el orden del home se conserva", A.lee, [true, "tNEC,tVEN,tEXP,tHOY"]);
    eq("El swipe entre tareas sigue el orden del home (2, 3, 4 y luego Claude)", A.swipe.split(",").slice(0, 4).join(","), "tNEC,tVEN,tEXP,tHOY");
    eq("Sin scroll horizontal a 390 px", A.ancho.every(function (w) { return w <= 390; }), true);
    eq("La propuesta de la IA: fuera del inicio, contada en Bandeja y dentro de su vista", A.bandeja, ["Bandeja: 1", true, true]);
    await foto("b270-1-home.png");

    /* ===================== 2. SEMÁFORO DE LAS LLEVA CLAUDE ===================== */
    var B = await p.evaluate(async function () {
      var r = {}, fl = document.querySelector('.fila-inicio[data-grupo="claude"]');
      r.plegada = [!document.querySelector(".cll263"), fl.textContent, getComputedStyle(fl.querySelector(".fl-p")).backgroundColor];
      fl.click(); await espera(40); var b = document.querySelector('[data-grupo-vista="claude"] .clh263');
      r.cab = b.innerText.replace(/\s+/g, " ").trim(); r.aria = b.getAttribute("aria-label");
      r.sem = [].map.call(b.querySelectorAll(".sem270 span"), function (s) { return [getComputedStyle(s.querySelector("i")).backgroundColor, s.textContent]; });
      r.filas = [].map.call(document.querySelectorAll('[data-grupo-vista="claude"] .ttr'), function (e) { return [e.getAttribute("data-id"), e.className.match(/sem-(\w+)/)[1], (e.querySelector(".semw270") || e.querySelector(".semsd270") || { textContent: "" }).textContent]; });
      r.directo = ["cR", "cA", "cS", "cV", "cN"].map(function (id) { var t = tareas.filter(function (x) { return x.id === id; })[0]; var s = semaforo270(t, pelota263(t)); return [id, s.c, s.sinDato]; });
      cierraGrupoInicio(); return r; });
    eq("Las lleva Claude: en el inicio un renglón con puntito verde y su número", B.plegada, [true, "Las lleva Claude5", "rgb(48, 209, 88)"]);
    eq("Dentro, encabezado con semáforo: 2 al corriente, 2 amarillo, 1 rojo", [B.cab, B.sem], ["Semáforo 2 2 1", [["rgb(48, 209, 88)", "2"], ["rgb(255, 214, 10)", "2"], ["rgb(255, 69, 58)", "1"]]]);
    eq("Para lector de pantalla: al corriente y con problema", B.aria, "Las lleva Claude: 2 al corriente, 3 con problema de seguimiento");
    eq("Semáforo por tarea (encargo atrasado 4 días = rojo; Josué 1 día y Karina 2 días = amarillo; Pato contestó = verde; sin fecha = verde sin dato)", B.directo,
      [["cR", "rojo", false], ["cA", "amarillo", false], ["cS", "amarillo", false], ["cV", "verde", false], ["cN", "verde", true]]);
    eq("Al abrirla: primero lo rojo, luego amarillo, luego verde, cada una con su porqué", B.filas, [
      ["cR", "rojo", "Claude va atrasado · tocaba el 3 oct (4 días)"],
      ["cA", "amarillo", "Josué no ha contestado · se esperaba ayer (1 día)"],
      ["cS", "amarillo", "Karina no ha contestado · se esperaba el 5 oct (2 días)"],
      ["cV", "verde", ""],
      ["cN", "verde", "sin dato de seguimiento · cuenta como al corriente"]]);
    await p.evaluate(function () { var e = document.querySelector('.fila-inicio[data-grupo="claude"]'); if (e) e.scrollIntoView({ block: "start" }); });
    await foto("b270-2-claude-semaforo.png");

    /* ===================== 3. PLEGADAS DE ABAJO, SIN DEFINIR Y 100% SUYAS ===================== */
    var C = await p.evaluate(async function () {
      var r = {};
      r.futAntes = !!document.querySelector('[data-id="tFUT"]') || document.body.innerText.indexOf("Renovar seguro del coche") >= 0;
      r.futCab = document.querySelector('.fila-inicio[data-grupo="prox"]').innerText.replace(/\s+/g, " ").trim();
      document.querySelector('.fila-inicio[data-grupo="prox"]').click(); await espera(30); r.futDesp = document.body.innerText.indexOf("Renovar seguro del coche") >= 0;
      cierraGrupoInicio(); document.querySelector('.fila-inicio[data-grupo="rev"]').click(); await espera(30);
      r.rev = [].map.call(document.querySelectorAll('[data-grupo-vista="rev"] .ttr[data-id="tREV"]'), function (e) { return e.innerText.replace(/\s+/g, " "); }); cierraGrupoInicio();
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
      window.__verRev270 = false; verFuturas = false; render(); abreGrupoInicio("esperan");
      document.querySelector('.l284 .ttr[data-id="tNEC"]').click(); await espera(60); r.abre = [vista, abierta];
      vista = "lista"; abierta = null; window.__grupoInicio = null; render();
      /* home vacío: las tres fichas apagadas en cero y solo el renglón Historial */
      tareas = []; render(); r.vacio = [[].map.call(document.querySelectorAll(".ficha-inicio.cero .fi-n"), function (e) { return e.textContent; }).join(","), [].map.call(document.querySelectorAll(".fila-inicio"), function (e) { return e.textContent; }).join(",")];
      return r; });
    eq("Próximas (= Mías futuras) fuera del inicio; al tocar su renglón se ve la futura", [C.futAntes, C.futDesp, C.futCab], [false, true, "Próximas 1"]);
    eq("La de otro dueño que Salvador revisa baja a 'Las revisas tú' (con su dueño)", C.rev, ["Bitácora de obra de Samuel de Samuel · hoy"]);
    eq("Sin fecha definida → Vencidas mías (después de las vencidas); nunca en Hoy", C.sinDef, [["tV2:venció 1 oct", "tSIN:sin fecha · falta definir cuándo"], ["tH2"]]);
    eq("Una tarea ajena no entra a Vencidas ni Hoy mías", C.ajena, [0, 0, ["tO"]]);
    eq("Siguen todas las funciones (menú de pulsación larga, vincular, mover, propuestas, falta, expedientes, compartidas)", C.funciones, []);
    eq("Tocar un renglón abre la tarea", C.abre, ["hilo", "tNEC"]);
    eq("Sin nada pendiente: fichas en cero y solo Historial", C.vacio, ["0,0,0", "Historial"]);
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n")); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
