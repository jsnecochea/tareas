#!/usr/bin/env node
/* PRUEBAS del Plan de seguimiento (plan_seguimiento + plan_log): planDe lee lo guardado y, si falta, lo arma con los campos
   de antes sin escribir; lo dictado («lunes y jueves») queda en plan_seguimiento.dias con su próxima fecha calculada y se
   enseña en una línea; plan completo = nada que preguntar; incompleto = Te esperan con lo que falta; seguimiento que tocaba
   y no se anotó en plan_log = «No se dio el seguimiento del …». Reloj fijo mié 2026-10-07 9:00 (Monterrey). */
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





    /* 1 · planDe desde los campos de antes, sin escribir nada */
    var L = await p.evaluate(function () {
      var a = T("tLEG", "Comedor", { plan_seguimiento: undefined, ritmo: "Seguimiento a Manuel Parra: diario a las 10:00", seg_a: { contacto: "Manuel Parra" }, resumen: { que_toca: "Manuel manda la muestra" } });
      delete a.plan_seguimiento;
      var b = T("tIND", "Mantenimiento", { indefinida: true, f_vigente: "", ritmo: "Cada lunes", resumen: { que_toca: "Revisar pendientes con Samuel" } }); delete b.plan_seguimiento;
      var pa = planDe(a), pb = planDe(b);
      return { a: [pa.finiquito, pa.periodicidad, pa.hora, pa.proximo, pa.proximo_paso, pa.con_quien, pa.guardado], b: [pb.finiquito, pb.dias, pb.proximo, pb.proximo_paso], escribio: [a.plan_seguimiento, b.plan_seguimiento] }; });
    eq("Legado: finiquito, diario a las 10, próximo hoy, paso del resumen y con quién", L.a, ["2026-10-07", "diario", "10:00", "2026-10-07", "Manuel manda la muestra", "Manuel Parra", false]);
    eq("Legado indefinida «Cada lunes»: próximo lunes 12", L.b, ["indefinida", ["lun"], "2026-10-12", "Revisar pendientes con Samuel"]);
    eq("Leer no escribe nada", L.escribio, [null, null]);

    /* 2 · lo dictado va al plan y se enseña en una línea */
    var D = await p.evaluate(function () {
      var t = T("tDIC", "Bardas", { ritmo: "" }); delete t.plan_seguimiento; tareas = [t];
      aplicaCamposNota(t, "dale seguimiento dos veces a la semana, lunes y jueves", {});
      var g = t.plan_seguimiento || {}, x = T("tLLA", "Llamada", { ritmo: "" }); delete x.plan_seguimiento; aplicaCamposNota(x, "llama a Pepe el lunes", {});
      return { dias: g.dias, per: g.periodicidad, prox: g.proximo, por: g.actualizado && g.actualizado.por, linea: lineaPlanTxt(t), suelto: x.plan_seguimiento || null }; });
    eq("«lunes y jueves» → dias y próxima fecha calculada (jue 8)", [D.dias, D.per, D.prox, D.por], [["lun", "jue"], "", "2026-10-08", "salvador"]);
    eq("Se enseña en una línea", D.linea, "Seguimiento: lun y jue · próximo jue 8");
    eq("«llama a Pepe el lunes» no es un ritmo: no toca el plan", D.suelto, null);

    /* 3 · completo / incompleto / respuesta / vigía */
    var A = await p.evaluate(function () {
      var hace = function (f) { return new Date(f + "T12:00:00").getTime(); };
      var L = [
        T("tCOMP", "Completa", { plan_seguimiento: { dias: ["lun", "jue"], proximo_paso: "Claude le escribe a Pepe", actualizado: { ts: Date.now(), por: "salvador" } } }),
        T("tINC", "Incompleta", { ritmo: "", plan_seguimiento: {} }),
        T("tPERD", "Seguimiento perdido", { plan_seguimiento: { dias: ["lun"], proximo_paso: "Llamar a Samuel", actualizado: { ts: hace("2026-09-28"), por: "salvador" } } }),
        T("tDADO", "Seguimiento dado", { plan_seguimiento: { dias: ["lun"], proximo_paso: "Llamar a Samuel", actualizado: { ts: hace("2026-09-28"), por: "salvador" } }, plan_log: [{ fecha: "2026-10-05", hecho: true, por: "mac", nota: "Le escribí a Samuel" }] })
      ];
      home(L); var H = window.__H274, w = {}; H.preg.forEach(function (x) { w[x.t.id] = x.why; });
      var by = function (id) { return tareas.filter(function (t) { return t.id === id; })[0]; };
      var r = { preg: H.preg.map(function (x) { return x.t.id; }).sort(), why: w, faltaComp: faltaPlan(by("tCOMP")), qComp: faltaPreciso(by("tCOMP")).filter(function (q) { return /seguimiento|paso|terminar/.test(q); }),
        qInc: faltaPreciso(by("tINC")).filter(function (q) { return /seguimiento|paso/.test(q); }).sort(), proxDado: planDe(by("tDADO")).proximo, hoy: H.hoy.map(function (x) { return x.t.id; }) };
      planDesdeRespuesta(by("tINC"), "¿Cuál es el próximo paso que Claude debe hacer aquí? (revisión 8-oct)", "Pedirle a Pepe la cotización");
      planDesdeRespuesta(by("tINC"), "¿Cuándo te recuerdo para darle seguimiento?", "cada viernes a las 10");
      r.resp = [by("tINC").plan_seguimiento.proximo_paso, by("tINC").plan_seguimiento.dias, by("tINC").plan_seguimiento.hora, faltaPlan(by("tINC"))];
      return r; });
    eq("Te esperan: la incompleta y el seguimiento que no se dio", A.preg, ["tINC", "tPERD"]);
    eq("Dice qué falta", A.why.tINC, "Falta próximo seguimiento y próximo paso");
    eq("Vigía: «No se dio el seguimiento del lun 5»", A.why.tPERD, "No se dio el seguimiento del lun 5");
    eq("Completa: nada que preguntar y se queda en Hoy", [A.faltaComp, A.qComp, A.hoy.indexOf("tCOMP") >= 0, A.hoy.indexOf("tDADO") >= 0], [[], [], true, true]);
    eq("Con plan_log del lunes 5, el próximo es el lunes 12", A.proxDado, "2026-10-12");
    eq("Incompleta: el cuestionario pregunta seguimiento y paso", A.qInc, ["¿Cuál es el siguiente paso de esta tarea y quién lo hace?", "¿Cuándo te recuerdo para darle seguimiento?"].sort());
    eq("Sus respuestas quedan en el plan y ya no falta nada", A.resp, ["Pedirle a Pepe la cotización", ["vie"], "10:00", []]);

    /* 4 · la línea en la tarea abierta */
    var V = await p.evaluate(async function () { abierta = "tCOMP"; vista = "hilo"; render(); await espera(40); var e = document.querySelector(".plan-seg"); return e ? e.textContent : null; });
    eq("En la tarea: «Seguimiento: lun y jue · próximo jue 8»", V, "Seguimiento: lun y jue · próximo jue 8");
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
