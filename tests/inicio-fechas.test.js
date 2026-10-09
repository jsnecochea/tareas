#!/usr/bin/env node
/* PRUEBAS de la regla «sin fechas = Falta información»: una tarea sin fecha de finiquito o sin próximo seguimiento no
   cuenta en Hoy ni en Vencidas; va a Te esperan y dice qué le falta. Una indefinida cuenta completa solo si trae su
   próximo seguimiento. 390 px, reloj fijo mié 2026-10-07 9:00 (Monterrey). */
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
      window.FXS = function () { return [
        T("tSF", "Sin fecha", { f_vigente: "", ritmo: "" }),
        T("tFS", "Vencida sin seguimiento", { f_vigente: "2026-10-03", ritmo: "" }),
        T("tHS", "Hoy sin seguimiento", { ritmo: "" }),
        T("tIS", "Indefinida con seguimiento", { indefinida: true, f_vigente: "2026-10-07", ritmo: "" }),
        T("tIN", "Indefinida sin seguimiento", { indefinida: true, f_vigente: "", ritmo: "" }),
        T("tAV", "Con aviso", { ritmo: "", avisos: [{ ts: 1, texto: "x", fecha: "2026-10-09", hora: "09:00" }] }),
        T("tOK", "Completa vencida", { f_vigente: "2026-10-02" })
      ]; };
      window.idsF = function (L) { return L.map(function (x) { return x.t.id; }); };
    });
    var A = await p.evaluate(function () { encargos = []; home(FXS()); var H = window.__H274, F = filtrosInicio(H, []), r = {};
      r.falta = ["tSF", "tFS", "tHS", "tIS", "tIN", "tAV", "tOK"].map(function (id) { return id + ":" + faltaPlanTxt(tareas.filter(function (t) { return t.id === id; })[0]); });
      r.esperan = idsF(F.esperan).sort(); r.hoy = idsF(F.hoy); r.venc = idsF(F.venc);
      r.fichas = [ficha("esperan").n, ficha("hoy").n];
      r.filaVenc = (document.querySelector('.fila-inicio[data-grupo="venc"] .fl-n') || {}).textContent || "";
      r.preg = tareas.filter(function (t) { return t.id === "tSF"; }).map(function (t) { return faltaPreciso(t); })[0];
      return r; });
    eq("Qué le falta a cada una", A.falta, ["tSF:Falta fecha de finiquito y próximo seguimiento", "tFS:Falta próximo seguimiento", "tHS:Falta próximo seguimiento", "tIS:", "tIN:Falta próximo seguimiento", "tAV:", "tOK:"]);
    eq("Las incompletas van a Te esperan", A.esperan, ["tFS", "tHS", "tIN", "tSF"]);
    eq("Hoy sin incompletas (la vencida completa primero)", A.hoy, ["tOK", "tIS", "tAV"]);
    eq("Vencidas solo la completa", [A.venc, A.filaVenc], [["tOK"], "1"]);
    eq("Números de las fichas", A.fichas, ["4", "3"]);
    eq("El cuestionario de siempre pregunta finiquito y seguimiento", A.preg.filter(function (q) { return /terminar|seguimiento/.test(q); }), ["¿Para cuándo la quieres terminar, o es indefinida?", "¿Cuándo te recuerdo para darle seguimiento?"]);

    await p.click('.ficha-inicio[data-grupo="esperan"]'); await p.waitForTimeout(80);
    var E = await p.evaluate(function () { var g = document.querySelector('[data-grupo-vista="esperan"]'), o = {};
      ["tSF", "tFS", "tIN"].forEach(function (id) { var b = g.querySelector('.ttr[data-id="' + id + '"] small'); o[id] = b ? b.textContent : null; }); return o; });
    eq("En Te esperan cada una dice en una línea qué le falta", E, { tSF: "Falta fecha de finiquito y próximo seguimiento", tFS: "Falta próximo seguimiento", tIN: "Falta próximo seguimiento" });
    await foto("fechas-te-esperan.png");
    await p.click("#binicio"); await p.waitForTimeout(50);
    await p.click('.ficha-inicio[data-grupo="hoy"]'); await p.waitForTimeout(80);
    eq("ritmo_seguimiento (lo escribe la Mac) cuenta como próximo seguimiento", await p.evaluate(function () { return tieneSeguimientoPlan(planDe({ id: "x", ritmo_seguimiento: "Diario hasta el viernes" })); }), true);
    eq("Vista Hoy sin las incompletas", await p.evaluate(function () { return [].map.call(document.querySelectorAll('[data-grupo-vista="hoy"] .ttr[data-id]'), function (b) { return b.getAttribute("data-id"); }); }), ["tOK", "tIS", "tAV"]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
