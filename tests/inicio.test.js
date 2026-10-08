#!/usr/bin/env node
/* PRUEBAS del home de tres fichas (maqueta D12b): Te esperan · Bandeja · Hoy con sus números, ficha en cero apagada,
   cada ficha abre SU grupo en su propia vista con «‹ Inicio», lista agrupada debajo y sin la línea de estado vieja. 390 px. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión ≥ 294", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 294, true);
eq("sw.js con versión ≥ 294", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 294, true);
eq("la línea de estado vieja ya no existe en el código", /function vEstado272|class="est272|data-est272/.test(html), false);
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

    /* 1 · tres fichas iguales con los números de siempre */
    var A = await p.evaluate(function () { home(FX()); var H = window.__H274, r = {};
      r.fichas = [].map.call(document.querySelectorAll(".fichas-inicio > .ficha-inicio"), function (f) { return f.getAttribute("data-grupo"); });
      r.esperan = ficha("esperan"); r.bandeja = ficha("bandeja"); r.hoy = ficha("hoy");
      var F = filtrosInicio(H, misEncargos()); r.cuentas = [F.esperan.length + F.encEsperan.length, propuestas256().length + platicasAcomodo237().length, F.hoy.length + F.encHoy.length];
      r.mismoAncho = r.esperan.w === r.bandeja.w && r.bandeja.w === r.hoy.w;
      r.sinIconos = !document.querySelector(".fichas-inicio svg, .fichas-inicio img");
      r.filas = [].map.call(document.querySelectorAll(".lista-inicio .fila-inicio"), function (f) { return f.textContent; });
      r.sinViejo = !document.querySelector(".est272, [data-est272], .h270, .aco226, .sc284, .abajo270, #bprop256, #bmsg271");
      r.cabecera = [!!document.getElementById("byo"), !!document.getElementById("bhmas"), !!document.getElementById("badm")];
      r.ancho = document.documentElement.scrollWidth <= 390; r.nFut = H.fut.length;
      r.swipe = window.ordenSwipe.slice(0, 6);
      return r; });
    eq("Tres fichas en orden", A.fichas, ["esperan", "bandeja", "hoy"]);
    eq("Te esperan: número = te preguntan (decisión + pregunta)", [A.esperan.n, A.esperan.l, A.esperan.aria, A.esperan.tag], ["2", "Te esperan", "Te esperan: 2", "BUTTON"]);
    eq("Bandeja: tareas nuevas + mensajes por acomodar", [A.bandeja.n, A.bandeja.l, A.bandeja.aria], [String(A.cuentas[1]), "Bandeja", "Bandeja: " + A.cuentas[1]]);
    eq("Bandeja trae las dos clases (1 nueva + pláticas)", A.cuentas[1] >= 2, true);
    eq("Hoy: Hoy mías + la vencida (es actividad, se junta en hoy)", [A.hoy.n, A.hoy.aria], ["4", "Hoy: 4"]);
    eq("Mismos números que las listas del home", [+A.esperan.n, +A.bandeja.n, +A.hoy.n], A.cuentas);
    eq("Colores de las fichas", [A.esperan.color, A.bandeja.color, A.hoy.color], ["rgb(255, 159, 10)", "rgb(10, 132, 255)", "rgb(48, 209, 88)"]);
    eq("Borde al 45 %", [A.esperan.borde, A.bandeja.borde, A.hoy.borde], ["rgba(255, 159, 10, 0.45)", "rgba(10, 132, 255, 0.45)", "rgba(48, 209, 88, 0.45)"]);
    eq("Número grande (36 px)", A.hoy.tam, "36px");
    eq("Fichas del mismo ancho", A.mismoAncho, true);
    eq("Sin íconos en las fichas", A.sinIconos, true);
    eq("Lista agrupada: Vencidas, Próximas (= Mías futuras), sin renglones vacíos, Historial siempre", A.filas, ["Vencidas1", "Próximas" + A.nFut, "Historial"]);
    eq("Próximas trae algo", A.nFut > 0, true);
    eq("El home ya no pinta las secciones ni la línea de estado", A.sinViejo, true);
    eq("Encabezado igual (nombre, ⋯, engrane)", A.cabecera, [true, true, true]);
    eq("Cabe en 390 px", A.ancho, true);
    eq("Orden del swipe: lo que te espera, vencidas, hoy", A.swipe, ["tDEC", "tPRE", "tV1", "tH1", "tH2", "tH3"]);
    await foto("inicio-home.png");

    /* 2 · ficha en cero: se queda, apagada */
    var Z = await p.evaluate(function () { home(FX().filter(function (t) { return t.id !== "tPROP" && t.id !== "tLER"; })); return ficha("bandeja"); });
    eq("Bandeja en cero: se queda, número gris y sin borde", [Z.n, Z.cero, Z.color, Z.borde], ["0", true, "rgb(99, 99, 102)", "rgba(0, 0, 0, 0)"]);

    /* 3 · Te esperan abre su vista: decisiones con sus botones primero, luego las preguntas */
    await p.evaluate(function () { home(FX()); });
    await p.click('.ficha-inicio[data-grupo="esperan"]'); await p.waitForTimeout(80);
    var E = await p.evaluate(function () { var g = document.querySelector('[data-grupo-vista="esperan"]'), r = {};
      r.titulo = g && g.querySelector(".tit-grupo").textContent; r.atras = (document.getElementById("binicio") || {}).textContent;
      r.sinFichas = !document.querySelector(".fichas-inicio, .lista-inicio");
      r.secciones = [].map.call(g.querySelectorAll(".sc284"), function (s) { return s.getAttribute("aria-label"); });
      r.dec = [].map.call(g.querySelectorAll(".f284"), function (f) { return f.getAttribute("data-dec284"); });
      r.botones = [].map.call(g.querySelectorAll('.f284[data-dec284="tDEC"] .p284'), function (b) { return b.textContent; });
      r.mic = !!g.querySelector('[data-m284="tDEC"]');
      r.preg = [].map.call(g.querySelectorAll('.sc284[aria-label="Te pregunta Doit"] .ttr'), function (b) { return b.getAttribute("data-id"); });
      r.abiertas = [].every.call(g.querySelectorAll(".bl284"), function (x) { return vis(x); });
      return r; });
    eq("Vista Te esperan con «‹ Inicio»", [E.titulo, E.atras], ["Te esperan", "‹Inicio"]);
    eq("Solo ese grupo a la vista (sin fichas ni lista)", E.sinFichas, true);
    eq("Decisiones primero, luego preguntas", E.secciones, ["Decide tú", "Te pregunta Doit"]);
    eq("La decisión con sus botones y micrófono", [E.dec, E.botones, E.mic], [["tDEC"], ["Hikvision", "Dahua"], true]);
    eq("La pregunta abajo", E.preg, ["tPRE"]);
    eq("Todo desplegado dentro de la vista", E.abiertas, true);
    await foto("inicio-te-esperan.png");
    await p.click("#binicio"); await p.waitForTimeout(80);
    eq("‹ Inicio regresa a las fichas", await p.evaluate(function () { return [!!document.querySelector(".fichas-inicio"), !document.querySelector("[data-grupo-vista]"), !!document.getElementById("byo")]; }), [true, true, true]);

    /* 4 · Bandeja: dos pestañas con las tarjetas de siempre */
    await p.click('.ficha-inicio[data-grupo="bandeja"]'); await p.waitForTimeout(80);
    var B = await p.evaluate(function () { var r = {}, g = document.querySelector('[data-grupo-vista="bandeja"]');
      r.tabs = [].map.call(g.querySelectorAll(".seg-bandeja [role=tab]"), function (b) { return [b.textContent, b.getAttribute("aria-selected")]; });
      r.nuevas = [].map.call(g.querySelectorAll(".acor.p256"), function (c) { return c.getAttribute("data-p256"); });
      r.botones = [].map.call(g.querySelectorAll('.acor.p256 [data-p256a]'), function (b) { return b.getAttribute("data-p256a"); });
      r.sinMensajes = !g.querySelector(".msg271");
      return r; });
    eq("Pestañas Tareas nuevas / Mensajes con su número", B.tabs.map(function (x) { return x[0].replace(/\d+$/, ""); }), ["Tareas nuevas", "Mensajes"]);
    eq("Arranca en Tareas nuevas", B.tabs.map(function (x) { return x[1]; }), ["true", "false"]);
    eq("La tarjeta de la propuesta con OK · Mover/Vincular · Dato · No guardar", [B.nuevas, B.botones], [["tPROP"], ["ok", "vinc", "dato", "ng"]]);
    eq("Una pestaña a la vez", B.sinMensajes, true);
    await foto("inicio-bandeja-nuevas.png");
    await p.click('.seg-bandeja [data-seg="mensajes"]'); await p.waitForTimeout(80);
    var M = await p.evaluate(function () { var g = document.querySelector('[data-grupo-vista="bandeja"]');
      return { sel: g.querySelector('[data-seg="mensajes"]').getAttribute("aria-selected"), cards: g.querySelectorAll(".msg271 .acor.g237").length, ok: g.querySelectorAll(".msg271 [data-acok]").length > 0,
        sinCabeza: !g.querySelector("#bmsg271"), sinNuevas: !g.querySelector(".acor.p256"), n: +g.querySelector('[data-seg="mensajes"] em').textContent }; });
    eq("Pestaña Mensajes con las tarjetas y su OK", [M.sel, M.cards > 0, M.ok, M.sinCabeza, M.sinNuevas], ["true", true, true, true, true]);
    eq("El número de la pestaña = tarjetas", M.n, M.cards);
    await foto("inicio-bandeja-mensajes.png");
    await p.click("#binicio"); await p.waitForTimeout(50);

    /* 5 · Hoy: los renglones de siempre; abrir una tarea y regresar vuelve a Hoy */
    await p.click('.ficha-inicio[data-grupo="hoy"]'); await p.waitForTimeout(80);
    var Hh = await p.evaluate(function () { var g = document.querySelector('[data-grupo-vista="hoy"]'); return [].map.call(g.querySelectorAll(".ttr[data-id]"), function (b) { return b.getAttribute("data-id"); }); });
    eq("Vista Hoy con sus renglones (la vencida primero)", Hh, ["tV1", "tH1", "tH2", "tH3"]);
    await foto("inicio-hoy.png");
    await p.click('[data-grupo-vista="hoy"] .ttr[data-id="tH2"]'); await p.waitForTimeout(120);
    var Tt = await p.evaluate(function () { var r = [vista, abierta]; volver(); vista = "lista"; abierta = null; render(); r.push(!!document.querySelector('[data-grupo-vista="hoy"]')); return r; });
    eq("Abre la tarea y al regresar sigue en Hoy", Tt, ["hilo", "tH2", true]);

    /* 6 · los renglones de la lista abren su vista */
    var Lr = await p.evaluate(function () { cierraGrupoInicio(); var r = {};
      document.querySelector('.fila-inicio[data-grupo="venc"]').click(); r.venc = [].map.call(document.querySelectorAll('[data-grupo-vista="venc"] .ttr[data-id]'), function (b) { return b.getAttribute("data-id"); });
      cierraGrupoInicio(); document.querySelector('.fila-inicio[data-grupo="prox"]').click(); r.prox = document.querySelectorAll('[data-grupo-vista="prox"] [data-id]').length > 0;
      cierraGrupoInicio(); document.querySelector('.fila-inicio[data-grupo="hist"]').click(); r.hist = !!document.querySelector('[data-grupo-vista="hist"] .hist285') && !document.querySelector('[data-grupo-vista="hist"] [data-pl285], [data-grupo-vista="hist"] [hidden]');
      cierraGrupoInicio(); return r; });
    eq("Vencidas abre su lista", Lr.venc, ["tV1"]);
    eq("Próximas abre su lista", Lr.prox, true);
    eq("Historial abre Tu historial (sin plegar)", Lr.hist, true);

    /* 7 · Las lleva Claude: puntito verde y número; dentro, el semáforo */
    var C = await p.evaluate(function () { var L = FX(); L.push(T("tCL", "La lleva Claude", { encargos: [{ id: "e", estado: "pendiente" }], detenido_por: "Pepe", espera: { de: "Pepe" } })); home(L);
      var f = document.querySelector('.fila-inicio[data-grupo="claude"]'); if (!f) return { fila: null, lleva: (window.__H274 && 0) };
      var r = { fila: f.textContent, punto: getComputedStyle(f.querySelector(".fl-p")).backgroundColor };
      f.click(); r.sem = !!document.querySelector('[data-grupo-vista="claude"] .sem270'); r.filas = document.querySelectorAll('[data-grupo-vista="claude"] .ttr[data-id]').length; cierraGrupoInicio(); return r; });
    if (C.fila) {
      eq("Las lleva Claude: punto verde + número", [/^Las lleva Claude\d+$/.test(C.fila), C.punto], [true, "rgb(48, 209, 88)"]);
      eq("Dentro: semáforo y renglones", [C.sem, C.filas > 0], [true, true]);
    } else eq("Fixture de Las lleva Claude", "sin renglón", "renglón");

    /* 8 · todo vacío: tres fichas en cero, Historial sigue */
    var V = await p.evaluate(function () { home([]); return { cero: document.querySelectorAll(".ficha-inicio.cero").length, filas: [].map.call(document.querySelectorAll(".fila-inicio"), function (f) { return f.textContent; }) }; });
    eq("Todo vacío: fichas apagadas, solo Historial", V, { cero: 3, filas: ["Historial"] });
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
