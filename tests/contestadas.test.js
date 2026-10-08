#!/usr/bin/env node
/* PRUEBAS: lo que Salvador ya contestó sale de Te esperan al instante y no regresa.
   Decisión contestada → fuera (solo «N contestadas hoy · ver» plegado) · pregunta hecha antes de su última respuesta → fuera
   · la misma pregunta vuelta a hacer con otra fecha («(revisión 8-oct)») → fuera · una pregunta nueva y distinta → sí sale
   · el aviso que Doit le mandó por WhatsApp («Doit: IA · …») no es «Doit te pregunta». 390 px. */
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
      window.T = function (id, nombre, extra) { var t = { id: id, nombre: nombre, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-07", fecha_dictada: true, contexto: "Tarea de prueba con contexto suficiente para que no falte nada de contexto en la ficha de la tarea y se vea completa.", ritmo: "diario", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 100000, h: "07:00" }] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
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
      var N = Date.now(), Q7 = "¿Cuál es el próximo paso que Claude debe hacer aquí? (revisión 7-oct)", Q8 = "¿Cuál es el próximo paso que Claude debe hacer aquí? (revisión 8-oct)";
      window.FXC = function () { return [
        T("tVIVA", "Decisión viva", { decision: { pregunta: "¿Cuál autorizo?", opciones: [{ nombre: "A" }, { nombre: "B" }], ts: N - 3600000 } }),
        T("tRESP", "Decisión contestada", { decision: { pregunta: "¿Cuál compro?", opciones: [{ nombre: "A" }], ts: N - 7200000, resuelta: true, respuesta: { de: "salvador", t: "A", ts: N - 600000 }, aplicado38: { ts: N - 300000 } } }),
        T("tPEND", "Decisión contestada sin aplicar", { decision: { pregunta: "¿Voy?", ts: N - 7200000, respuesta: { de: "salvador", t: "Sí", ts: N - 500000 } } }),
        T("tANT", "Pregunta ya contestada", { hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿A quién le mando el plano?", ops: [], ts: N - 7200000 }] } }),
        T("tREP", "Misma pregunta otro día", { resp267: ["cual es el proximo paso que claude debe hacer aqui revision 7 oct"], falta_paso_claude: { q: Q8, ts: N - 1000, desde: "2026-10-08" }, hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: Q8, ops: [], mac: 1, paso37: 1, ts: N - 1000 }] } }),
        T("tAPA", "Apartada por la Mac", { falta_paso_claude_apartado: { q: Q7, motivo: "Resuelto" }, hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: Q7, ops: [], ts: N - 1000 }] } }),
        T("tNUE", "Pregunta nueva", { resp267: ["cual es el proximo paso que claude debe hacer aqui revision 7 oct"], hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿Le pido a Pepe otra cotización?", ops: [], ts: N - 1000 }] } }),
        T("tDOIT", "Aviso de Doit", { msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 7200000 }, { k: "bi", wa_in: 1, wa_c: "Doit", t: "Doit: IA · Blue Cup BBVA: no tengo el número de Imelda: ¿me lo pasas?", ts: N - 600000 }] }),
        T("tCON", "Pregunta de contacto", { msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 7200000 }, { k: "bi", wa_in: 1, wa_c: "Pepe", t: "Pepe: ¿Me confirmas la hora?", ts: N - 600000 }] })
      ]; };
    });
    var A = await p.evaluate(function () { encargos = []; home(FXC()); var H = window.__H274, r = {};
      r.preg = H.preg.map(function (x) { return x.t.id; }).sort();
      r.why = {}; H.preg.forEach(function (x) { r.why[x.t.id] = x.why; });
      r.ficha = ficha("esperan").n;
      var by = function (id) { return tareas.filter(function (t) { return t.id === id; })[0]; };
      r.paso = [faltaPasoClaude283(by("tREP")), faltaPasoClaude283(by("tAPA"))];
      r.resp = (by("tANT").resp267 || []).slice();
      return r; });
    eq("En Te esperan solo lo vivo: decisión viva, pregunta nueva y la del contacto", A.preg, ["tCON", "tNUE", "tVIVA"]);
    eq("La ficha cuenta solo eso", A.ficha, "3");
    eq("El aviso de Doit no es «Doit te pregunta»; la del contacto sí", [A.why.tDOIT, A.why.tCON], [undefined, "Pepe te pregunta"]);
    eq("La pregunta nueva y distinta se ve tal cual", A.why.tNUE, "¿Le pido a Pepe otra cotización?");
    eq("La misma pregunta de la Mac con otra fecha (o ya apartada) no vuelve", A.paso, ["", ""]);
    eq("La contestada queda anotada para que no regrese", A.resp, ["a quien le mando el plano"]);

    await p.click('.ficha-inicio[data-grupo="esperan"]'); await p.waitForTimeout(80);
    var E = await p.evaluate(function () { var g = document.querySelector('[data-grupo-vista="esperan"]'), dt = g.querySelector(".cont284");
      return { dec: [].map.call(g.querySelectorAll('.sc284[aria-label="Decide tú"] .f284'), function (f) { return f.getAttribute("data-dec284"); }),
        cont: dt ? [dt.querySelector("summary").textContent, dt.open, [].map.call(dt.querySelectorAll(".f284"), function (f) { return f.getAttribute("data-dec284"); }).sort()] : null,
        cuenta: (g.querySelector('.sc284[aria-label="Decide tú"] .hd284 em') || {}).textContent }; });
    eq("Decide tú solo con la viva", [E.dec, E.cuenta], [["tVIVA"], "1"]);
    eq("Las contestadas hoy: un renglón plegado", E.cont, ["2 contestadas hoy · ver", false, ["tPEND", "tRESP"]]);
    await foto("contestadas-te-esperan.png");

    /* contestar una decisión desde el home: sale al instante */
    var C = await p.evaluate(async function () { window.contestaDecision273 = function (t, v) { t.decision.respuesta = { de: "salvador", t: v, ts: Date.now() }; render(); };
      document.querySelector('.f284[data-dec284="tVIVA"] .p284p').click(); await espera(30);
      return { dec: document.querySelectorAll('.sc284[aria-label="Decide tú"] .f284').length, cont: (document.querySelector(".cont284 > summary") || {}).textContent, n: window.__H274.preg.map(function (x) { return x.t.id; }).indexOf("tVIVA") }; });
    eq("Al contestar, la decisión sale de la lista y entra a las contestadas", C, { dec: 0, cont: "3 contestadas hoy · ver", n: -1 });
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
