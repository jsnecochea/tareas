#!/usr/bin/env node
/* PRUEBAS de los filtros del inicio: Vencidas y Te encargaron son FILTROS con globito de color (rojo #D70015 / morado #8944AB)
   arriba de Próximas, y lo que hay en ellos también cuenta en la ficha que le toca por su tipo: lo que pide decisión o respuesta
   en Te esperan; lo que hay que hacer en Hoy aunque ya venció (primero, con la etiqueta roja «Vencida»). Dentro de una ficha
   nada cuenta dos veces. 390 px, reloj fijo mié 2026-10-07 9:00 (Monterrey). */
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


    await p.evaluate(function () {
      PERSONAS.josue = PERSONAS.josue || { nombre: "Josué" }; PERSONAS.carlos = PERSONAS.carlos || { nombre: "Carlos" };
      var N = Date.now();
      window.FXF = function () { return [
        T("tDEC", "Cámaras bodega", { f_vigente: "2026-10-20", decision: { pregunta: "¿Cuál cotización autorizo?", opciones: [{ nombre: "Dahua" }, { nombre: "Hikvision", recomendada: true }], ts: N - 7200000 } }),
        T("tVD", "Decisión vencida", { f_vigente: "2026-10-03", decision: { pregunta: "¿Renuevo el seguro?", opciones: [{ nombre: "Sí" }, { nombre: "No" }], ts: N - 3600000 } }),
        T("tV1", "Llamar al notario", { f_vigente: "2026-10-03" }),
        T("tH1", "Hoy uno"), T("tH2", "Hoy dos"),
        T("tF1", "Futura", { f_vigente: "2026-10-20" })
      ]; };
      window.ENC = function () { return [
        { id: "ePRE", de: "josue", para: "salvador", texto: "¿Me autorizas el pago a CFE?", limite: "2026-10-07", creado: N - 3600000, cerrado: 0 },
        { id: "eHAZ", de: "carlos", para: "salvador", texto: "Firmar los cheques de nómina", limite: "2026-10-05", creado: N - 3 * 864e5, cerrado: 0 },
        { id: "eDUP", de: "josue", para: "salvador", texto: "Revisar la llave del jardín", tareaId: "tH1", tarea: "Hoy uno", limite: "2026-10-07", creado: N - 600000, cerrado: 0 },
        { id: "eOTRO", de: "salvador", para: "josue", texto: "No es mío", limite: "2026-10-01", cerrado: 0 }
      ]; };
      window.homeF = function () { encargos = ENC(); home(FXF()); };
      window.ids = function (sel) { return [].map.call(document.querySelectorAll(sel), function (b) { return b.getAttribute("data-id") || b.getAttribute("data-enc"); }); };
    });

    /* 1 · las fichas cuentan lo vencido y lo encargado según su tipo */
    var A = await p.evaluate(function () { homeF(); var H = window.__H274, F = filtrosInicio(H, misEncargos()), r = {};
      r.esperan = ficha("esperan").n; r.hoy = ficha("hoy").n;
      r.esperanIds = F.esperan.map(function (x) { return x.t.id; }).concat(F.encEsperan.map(function (e) { return "enc:" + e.id; }));
      r.hoyIds = F.hoy.map(function (x) { return x.t.id; }).concat(F.encHoy.map(function (e) { return "enc:" + e.id; }));
      r.vencIds = F.venc.map(function (x) { return x.t.id; }).concat(F.encVenc.map(function (e) { return "enc:" + e.id; }));
      r.unicoEsp = r.esperanIds.length === Object.keys(r.esperanIds.reduce(function (o, k) { o[k] = 1; return o; }, {})).length;
      r.unicoHoy = r.hoyIds.length === Object.keys(r.hoyIds.reduce(function (o, k) { o[k] = 1; return o; }, {})).length;
      r.filas = [].map.call(document.querySelectorAll(".lista-inicio .fila-inicio"), function (f) { return [f.getAttribute("data-grupo"), (f.querySelector(".fl-n") || {}).textContent || ""]; });
      var gb = function (k) { var e = document.querySelector('.fila-inicio[data-grupo="' + k + '"] .fl-n'); if (!e) return null; var c = getComputedStyle(e); return [e.classList.contains("globo"), c.backgroundColor, c.color, parseFloat(c.borderTopLeftRadius) >= 8]; };
      r.gVenc = gb("venc"); r.gEnc = gb("enc"); r.gProx = gb("prox");
      return r; });
    eq("Actividad vencida cuenta en Hoy (primero) y la decisión vencida NO", A.hoyIds, ["tV1", "tH1", "tH2", "enc:eHAZ"]);
    eq("Decisión vencida cuenta en Te esperan; el encargo con pregunta también", A.esperanIds, ["tDEC", "tVD", "enc:ePRE"]);
    eq("Número de las fichas = sus listas", [A.esperan, A.hoy], ["3", "4"]);
    eq("Encargo de una tarea que ya está en Hoy no se cuenta dos veces", A.hoyIds.indexOf("enc:eDUP"), -1);
    eq("Dentro de cada ficha, nada repetido", [A.unicoEsp, A.unicoHoy], [true, true]);
    eq("Filtro Vencidas: actividad, decisión y encargo vencidos", A.vencIds, ["tV1", "tVD", "enc:eHAZ"]);
    eq("Orden de la lista: Vencidas, Te encargaron, Próximas … Historial", A.filas, [["venc", "3"], ["enc", "3"], ["prox", "1"], ["hist", ""]]);
    eq("Globito rojo en Vencidas", A.gVenc, [true, "rgb(215, 0, 21)", "rgb(255, 255, 255)", true]);
    eq("Globito morado en Te encargaron", A.gEnc, [true, "rgb(137, 68, 171)", "rgb(255, 255, 255)", true]);
    eq("Próximas sigue con número gris sin globito", A.gProx, [false, "rgba(0, 0, 0, 0)", "rgb(142, 142, 147)", false]);
    await foto("filtros-home.png");

    /* 2 · vista Hoy: lo vencido primero con la etiqueta roja; el encargo que hay que hacer abajo */
    await p.click('.ficha-inicio[data-grupo="hoy"]'); await p.waitForTimeout(80);
    var Hv = await p.evaluate(function () { var g = document.querySelector('[data-grupo-vista="hoy"]'), et = g.querySelector('.ttr[data-id="tV1"] .et-venc');
      return { filas: ids('[data-grupo-vista="hoy"] .ttr[data-id]'), enc: ids('[data-grupo-vista="hoy"] [data-enc]'), et: et && et.textContent, color: et && getComputedStyle(et).color,
        sinEt: !g.querySelector('.ttr[data-id="tH1"] .et-venc'), etEnc: !!g.querySelector('[data-enc="eHAZ"] .et-venc') }; });
    eq("Hoy: la vencida arriba", Hv.filas, ["tV1", "tH1", "tH2"]);
    eq("Etiqueta roja «Vencida»", [Hv.et, Hv.color], ["Vencida", "rgb(255, 69, 58)"]);
    eq("Lo de hoy sin etiqueta", Hv.sinEt, true);
    eq("Encargo que hay que hacer en Hoy, marcado vencido", [Hv.enc, Hv.etEnc], [["eHAZ"], true]);
    await foto("filtros-hoy.png");
    await p.click("#binicio"); await p.waitForTimeout(50);

    /* 3 · vista Te esperan: la decisión vencida con su etiqueta; el encargo con pregunta */
    await p.click('.ficha-inicio[data-grupo="esperan"]'); await p.waitForTimeout(80);
    var Ev = await p.evaluate(function () { var g = document.querySelector('[data-grupo-vista="esperan"]');
      return { dec: [].map.call(g.querySelectorAll(".f284"), function (f) { return f.getAttribute("data-dec284"); }), et: !!g.querySelector('.f284[data-dec284="tVD"] .et-venc'), sinEt: !g.querySelector('.f284[data-dec284="tDEC"] .et-venc'), enc: ids('[data-grupo-vista="esperan"] [data-enc]') }; });
    eq("Te esperan con las dos decisiones", Ev.dec.sort(), ["tDEC", "tVD"]);
    eq("La decisión vencida con etiqueta, la otra no", [Ev.et, Ev.sinEt], [true, true]);
    eq("El encargo que pregunta, en Te esperan", Ev.enc, ["ePRE"]);
    await p.click("#binicio"); await p.waitForTimeout(50);

    /* 4 · los filtros abren su vista */
    var Lr = await p.evaluate(function () { var r = {};
      document.querySelector('.fila-inicio[data-grupo="venc"]').click(); r.venc = ids('[data-grupo-vista="venc"] .ttr[data-id]'); r.vencEnc = ids('[data-grupo-vista="venc"] [data-enc]');
      cierraGrupoInicio(); document.querySelector('.fila-inicio[data-grupo="enc"]').click(); r.enc = ids('[data-grupo-vista="enc"] [data-enc]');
      cierraGrupoInicio(); return r; });
    eq("Vencidas filtra actividad + decisión vencidas", Lr.venc, ["tV1", "tVD"]);
    eq("Vencidas trae el encargo vencido", Lr.vencEnc, ["eHAZ"]);
    eq("Te encargaron trae todos los encargos para mí", Lr.enc.sort(), ["eDUP", "eHAZ", "ePRE"]);

    /* 5 · sin encargos ni vencidas: no salen los renglones */
    var V = await p.evaluate(function () { encargos = []; home(FXF().filter(function (t) { return t.id !== "tV1" && t.id !== "tVD"; }));
      return [].map.call(document.querySelectorAll(".fila-inicio"), function (f) { return f.getAttribute("data-grupo"); }); });
    eq("Renglones en cero no salen", V, ["prox", "hist"]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
