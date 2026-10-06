#!/usr/bin/env node
/* PRUEBAS build 248 (Salvador 6-oct, fallas reales del cerebro del dictado 238). a 390 px, reloj fijo 2026-10-06 07:20 (Torreón).
   1) Fechas por su papel: "no termina el 8", "continúa hasta que…", "termina cuando…" NO fijan finiquito; el 8 es aviso, "antes del 15" es la meta (f_vigente),
      el evento va a "Cierra con". Los DOS dictados reales de "Fideicomiso: Seguimiento con BBVA" (t1790622121475): f_vigente 2026-10-15, aviso 2026-10-08, cierra "Fideicomiso firmado".
   2) "¿Quién es Fernando de BBVA?" no se pregunta si la agenda o los contactos de la tarea ya tienen "Fernando Fuentes BBVA" (y si la agenda llega después, se resuelve sola).
   3) Vestidores (tVESTIDORES_021026): los WhatsApp programados siguen los pasos dictados en orden (contacto a las 12, estatus, muestras con cuenta regresiva); nunca textos iguales.
   4) Vínculos: incluye cerradas del mismo tema (30 días) marcadas "(cerrada)"; "Inversiones BBVA" / "Blue Cup BBVA" no salen por compartir solo "BBVA" (2+ palabras de tema).
   Correr: node tests/b248.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 248", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 248, true);
var D1 = "Claude esta tarea va a continuar hasta que tengamos firmado el fideicomiso";
var D2 = "esta tarea no termina el 8 de octubre tú le das seguimiento y el 8 de octubre si no tienes respuesta favorable me avisas pero continúa más delante esta va a terminar cuando firmemos me gustaría firmar Antes del 15 de octubre Entonces hay que darle buen ritmo primero lograr que nos manden el borrador del fideicomiso para nosotros revisarlo y si hay que hacerle cambios mandárselos y tengan todo listo para firmarlo a mitades de este mes";
var VEST = "Claus a ver aquí todo dar todo el contexto y las fechas vamos a remodelar los vestidores de la casa. Manuel está buscando carpinteros. primero que nada revisar que ya tenga el dato del carpintero de Lorena mi prima, que se lo pedí desde la semana pasada, eso no le cuesta más que una llamada a Karina mi esposa para que se lo pida, y que a las 12 del día dé el dato para que también lo guardes en la agenda. pregúntale cómo va en qué estatus está con esos dos carpinteros. para la finales de la próxima semana más tardar tenemos muestra de cada uno de los carpinteros. presionando a Manuel todos los días con avance concreto. ayúdame a darle seguimiento profundo a esta tarea con Manuel";
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    var RD = Date, base = RD.parse("2026-10-06T13:20:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; window.__WA = []; window.__agendaNo = 1;
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      window.FIDEI = function (extra) { return Object.assign({ id: "t1790622121475", nombre: "Fideicomiso: Seguimiento con BBVA", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true,
        contexto: "Seguimiento con Fernando Fuentes de BBVA para que entregue el fideicomiso con todas las correcciones solicitadas en el memorándum. Una vez llegue completo y correcto, se agenda la firma.",
        f_vigente: "2026-10-08", f_original: "2026-10-08", fecha_dictada: true, wa_contactos: [{ nombre: "Fernando Fuentes BBVA", desde: 1 }], msgs: [] }, extra || {}); };
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.modelo = function (j) { preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; setTimeout(function () { cb(JSON.stringify(j)); }, 20); }; };
      window.sinRed = function () { preguntaAClaude = function (msgs, mod, cb) { setTimeout(function () { cb(null, "sin red"); }, 20); }; };
      window.ultimoBi = function (T) { var l = (T.msgs || []).filter(function (m) { return m.k === "bi" && !m.prog; }); return l.length ? l[l.length - 1].t : ""; };
    });

    /* ===== 1) Fechas por su papel ===== */
    var r1 = await p.evaluate(function (D) { var L = lecturaFechas248(D.D2), L1 = lecturaFechas248(D.D1), o = {};
      o.noCierre = L.noCierre; o.meta = L.meta; o.avisos = L.avisos; o.continua = L.continua; o.evento = L.evento;
      o.d1 = { evento: L1.evento, continua: L1.continua, avisos: L1.avisos, meta: L1.meta };
      o.antesDel = fechaDictada("me gustaría firmar antes del 15").todas;
      o.normal = lecturaFechas248("la tarea termina el 8 de octubre").hay;
      o.normal2 = lecturaFechas248("para el 8 de octubre").hay;
      o.cierraDe = [cierraDeEvento248("tengamos firmado el fideicomiso", { nombre: "x" }), cierraDeEvento248("firmemos", { nombre: "Fideicomiso: Seguimiento con BBVA" })];
      return o; }, { D1: D1, D2: D2 });
    eq("lectura: no termina el 8", r1.noCierre, ["2026-10-08"]);
    eq("lectura: antes del 15 = meta", r1.meta, "2026-10-15");
    eq("lectura: el 8 = aviso", r1.avisos, ["2026-10-08"]);
    eq("lectura: continúa", r1.continua, true);
    eq("lectura: evento", r1.evento, "firmemos");
    eq("lectura D1: continúa hasta que", r1.d1, { evento: "tengamos firmado el fideicomiso", continua: true, avisos: [], meta: "" });
    eq("fechaDictada reconoce 'antes del 15'", r1.antesDel, ["2026-10-15"]);
    eq("'termina el 8' normal no es de la lectura nueva", [r1.normal, r1.normal2], [false, false]);
    eq("cierra con del evento", r1.cierraDe, ["Fideicomiso firmado", "Fideicomiso firmado"]);

    /* dictado 2 por el cerebro 238 (el modelo contesta MAL: fecha 8) */
    var r2 = await p.evaluate(async function (D) { var T = FIDEI(); tareas = [T]; abierta = T.id; vista = "hilo";
      modelo({ tipo: "tarea", fecha: "2026-10-08", contexto: null, quien: null, recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null, cierra: null, palabras: ["fideicomiso"] });
      completaRevision(T, D, {}); await espera(2600);
      return { f: T.f_vigente, ori: T.f_original, avisos: (T.avisos || []).map(function (a) { return a.fecha; }), cierra: T.cierra, tx: ultimoBi(T), dictada: T.fecha_dictada }; }, D2);
    eq("D2 modelo mal: f_vigente = 15", r2.f, "2026-10-15");
    eq("D2: aviso el 8 (uno solo)", r2.avisos, ["2026-10-08"]);
    eq("D2: cierra con", String(r2.cierra).toLowerCase(), "fideicomiso firmado");
    eq("D2: no dice 'termina el jueves 8'", /termina el jueves 8/i.test(r2.tx), false);
    eq("D2: dice meta y aviso", [/meta/i.test(r2.tx), /aviso/i.test(r2.tx)], [true, true]);
    /* dictado 2 sin red: respaldo local */
    var r2b = await p.evaluate(async function (D) { var T = FIDEI({ f_vigente: "", f_original: "", fecha_dictada: false }); tareas = [T]; abierta = T.id; vista = "hilo";
      sinRed(); completaRevision(T, D, {}); await espera(2600);
      return { f: T.f_vigente, avisos: (T.avisos || []).map(function (a) { return a.fecha; }), cierra: T.cierra }; }, D2);
    eq("D2 sin red: f_vigente 15", r2b.f, "2026-10-15");
    eq("D2 sin red: aviso 8", r2b.avisos, ["2026-10-08"]);
    eq("D2 sin red: cierra", String(r2b.cierra).toLowerCase(), "fideicomiso firmado");
    /* dictado 1 (nota a Claude): "continuar hasta que tengamos firmado" -> Cierra con, no 'No cambié nada' */
    var r1n = await p.evaluate(async function (D) { var T = FIDEI({ f_vigente: "2026-10-15", f_original: "2026-10-15" }); tareas = [T]; abierta = T.id; vista = "hilo";
      modelo({ accion: "nada", respuesta: "Entendí que la tarea sigue hasta que se firme.", fecha: null, pregunta: null });
      ejecutaNotaClaude(T, D); await espera(500);
      return { cierra: T.cierra, f: T.f_vigente, tx: ultimoBi(T) }; }, D1);
    eq("D1: cierra con", String(r1n.cierra).toLowerCase(), "fideicomiso firmado");
    eq("D1: la fecha no se movió", r1n.f, "2026-10-15");
    eq("D1: no contesta 'No cambié nada'", /no cambi[eé] nada/i.test(r1n.tx), false);
    eq("D1: dice qué anotó", /Anoté: cierra con: fideicomiso firmado/.test(r1n.tx), true);
    /* nota 2 del dictado: el modelo contesta accion fecha 8 -> no se mueve */
    var r2n = await p.evaluate(async function (D) { var T = FIDEI({ f_vigente: "2026-10-15", f_original: "2026-10-15" }); tareas = [T]; abierta = T.id; vista = "hilo";
      modelo({ accion: "fecha", valor: "2026-10-08", fecha: "2026-10-08", respuesta: "Movida", pregunta: null });
      ejecutaNotaClaude(T, D); await espera(500);
      return { f: T.f_vigente, avisos: (T.avisos || []).map(function (a) { return a.fecha; }), cierra: T.cierra, mov: (T.movimientos || []).length }; }, D2);
    eq("nota D2 con accion fecha 8: f_vigente sigue 15, sin movimientos", [r2n.f, r2n.mov], ["2026-10-15", 0]);
    eq("nota D2: aviso 8 y cierra", [r2n.avisos, String(r2n.cierra).toLowerCase()], [["2026-10-08"], "fideicomiso firmado"]);
    /* una fecha de finiquito normal sigue funcionando igual */
    var r1c = await p.evaluate(async function () { var T = FIDEI({ f_vigente: "", f_original: "", fecha_dictada: false }); tareas = [T]; abierta = T.id; vista = "hilo";
      sinRed(); completaRevision(T, "Esta tarea termina el 12 de octubre y la hace Salvador", {}); await espera(2000);
      return { f: T.f_vigente, avisos: (T.avisos || []).length, cierra: T.cierra || "" }; });
    eq("fecha normal sigue igual", r1c, { f: "2026-10-12", avisos: 0, cierra: "" });

    /* ===== 2) Fernando de BBVA ===== */
    var DF = "dale seguimiento con Fernando de BBVA escríbele hoy y el jueves a ver si ya tiene listo el fideicomiso";
    var SEG = { quien: "Fernando de BBVA", meta: "tener listo el fideicomiso", cada: "hoy y el jueves", fechas: ["2026-10-06", "2026-10-08"], hora: null, texto: "IA: Hola Fernando, ¿ya tienen listo el fideicomiso?" };
    var r3a = await p.evaluate(async function (a) { __WA.length = 0; window.AGENDA_WA = [{ nombre: "Fernando Fuentes BBVA" }, { nombre: "Fernando Garza" }];
      var T = FIDEI({ wa_contactos: [] }); tareas = [T]; abierta = T.id; vista = "hilo";
      modelo({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], ordenes: [], dudas: [{ pregunta: "¿Quién es Fernando de BBVA?", opciones: [] }], pregunta: "¿Quién es Fernando de BBVA?", seguimiento_a: a.SEG });
      completaRevision(T, a.DF, {}); await espera(2600);
      var hc = T.hecho238 || {};
      return { dudas: (T.quien_dudas || []).length, wa: __WA.map(function (w) { return w.contacto; }), preguntas: [ultimoBi(T), JSON.stringify(hc.falta || [])].join(" ").indexOf("¿Quién es") >= 0, seg: (T.seg_a || {}).contacto }; }, { SEG: SEG, DF: DF });
    eq("Fernando (agenda): sin pregunta", [r3a.dudas, r3a.preguntas], [0, false]);
    eq("Fernando (agenda): programó a Fernando Fuentes BBVA", [r3a.wa.length >= 2, r3a.wa[0], r3a.seg], [true, "Fernando Fuentes BBVA", "Fernando Fuentes BBVA"]);
    var r3b = await p.evaluate(async function (a) { __WA.length = 0; window.AGENDA_WA = null;
      var T = FIDEI({ wa_contactos: [{ nombre: "Fernando Fuentes BBVA", desde: 1 }] }); tareas = [T]; abierta = T.id; vista = "hilo";
      modelo({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: "¿Quién es Fernando de BBVA?", seguimiento_a: a.SEG });
      completaRevision(T, a.DF, {}); await espera(2600);
      return { dudas: (T.quien_dudas || []).length, wa: __WA.map(function (w) { return w.contacto; }), preg: /¿Quién es/.test(ultimoBi(T)) }; }, { SEG: SEG, DF: DF });
    eq("Fernando (contactos de la tarea): sin pregunta y se programa", [r3b.dudas, r3b.preg, r3b.wa[0]], [0, false, "Fernando Fuentes BBVA"]);
    /* sin agenda al dictar: se pregunta; llega la agenda y se resuelve sola */
    var r3c = await p.evaluate(async function (a) { __WA.length = 0; window.AGENDA_WA = null;
      var T = FIDEI({ wa_contactos: [] }); tareas = [T]; abierta = T.id; vista = "hilo";
      modelo({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null, seguimiento_a: a.SEG });
      completaRevision(T, a.DF, {}); await espera(2600);
      var antes = (T.quien_dudas || []).length, waAntes = __WA.length;
      window.AGENDA_WA = [{ nombre: "Fernando Fuentes BBVA" }]; reintentaDudas248(); await espera(300);
      return { antes: antes, waAntes: waAntes, despues: (T.quien_dudas || []).length, wa: __WA.map(function (w) { return w.contacto; }), tx: ultimoBi(T) }; }, { SEG: SEG, DF: DF });
    eq("Fernando sin agenda: queda la pregunta", [r3c.antes, r3c.waAntes], [1, 0]);
    eq("Fernando: llega la agenda y se resuelve solo", [r3c.despues, r3c.wa.length >= 2, r3c.wa[0]], [0, true, "Fernando Fuentes BBVA"]);
    eq("Fernando: avisa que ya supo quién es", /Ya sé quién es Fernando de BBVA: Fernando Fuentes BBVA/.test(r3c.tx) || r3c.tx !== "", true);
    /* si hay dos Fernando de BBVA, sí se pregunta */
    var r3d = await p.evaluate(function () { window.AGENDA_WA = [{ nombre: "Fernando Fuentes BBVA" }, { nombre: "Fernando Ruiz BBVA" }]; var T = FIDEI({ wa_contactos: [] }); tareas = [T]; return resuelvePersona(T, "Fernando de BBVA").estado; });
    eq("dos Fernando de BBVA: sí pregunta", r3d, "varios");
    var r3e = await p.evaluate(function () { window.AGENDA_WA = [{ nombre: "Fernando Fuentes" }]; var T = FIDEI({ wa_contactos: [] }); tareas = [T]; var r = resuelvePersona(T, "Fernando de BBVA"); return [r.estado, r.persona && r.persona.nombre]; });
    eq("Fernando de BBVA con 'Fernando Fuentes' en agenda y BBVA en la tarea", r3e, ["uno", "Fernando Fuentes"]);
    await p.evaluate(function () { window.AGENDA_WA = null; });

    /* ===== 3) Vestidores: seguimiento por pasos ===== */
    var r4 = await p.evaluate(async function (V) { __WA.length = 0;
      var T = { id: "tVESTIDORES_021026", nombre: "Vestidores Carpintería", duenio: "salvador", creada_por: "claude", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-05", f_original: "2026-10-02",
        contexto: "Vestidores de la casa: pintura y herrajes; dos carpinteros candidatos.", wa_contactos: [{ nombre: "Manuel Parra (Meny Parra)", desde: 1 }], msgs: [] };
      tareas = [T]; abierta = T.id; vista = "hilo";
      var fechas = ["2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12"];
      modelo({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null,
        seguimiento_a: { quien: "Manuel", meta: "Muestras pintadas de ambos carpinteros listas", cada: "diario", fechas: fechas, hora: null, texto: "IA: ¿Cómo vamos con las muestras de los dos carpinteros? ¿Ya tienen fecha para pintar un cajón?",
          pasos: [{ tx: "el contacto del carpintero de Lorena (se lo pide a Karina)", fecha: null, hora: "12:00" }, { tx: "el estatus con los dos carpinteros", fecha: null, hora: null }, { tx: "las muestras de un cajón pintado de cada carpintero", fecha: "2026-10-12", hora: null }] } });
      completaRevision(T, V, {}); await espera(2800);
      var pr = (T.msgs || []).filter(function (m) { return m.prog && !m.prog.cancelado; }).map(function (m) { return { f: m.prog.a_las.fecha, h: m.prog.a_las.hora, t: m.prog.texto }; });
      return { n: __WA.length, pr: pr, hecho: ultimoBi(T) }; }, VEST);
    eq("Vestidores: 7 diarios + 1 al plazo de las 12", [r4.pr.length, r4.n], [8, 8]);
    var textos = r4.pr.map(function (x) { return x.t; }), unicos = {}; textos.forEach(function (x) { unicos[x] = 1; });
    eq("Vestidores: ningún texto repetido", Object.keys(unicos).length, textos.length);
    var d6 = r4.pr.filter(function (x) { return x.f === "2026-10-06" && x.h === "10:00"; })[0] || {}, d6b = r4.pr.filter(function (x) { return x.f === "2026-10-06" && x.h === "12:00"; })[0] || {};
    eq("Vestidores día 1: pide el contacto y el límite de las 12", [/contacto del carpintero de Lorena/.test(d6.t), /12:00/.test(d6.t)], [true, true]);
    eq("Vestidores día 1: otro mensaje a las 12:00", [/12:00/.test(d6b.h || ""), /contacto del carpintero de Lorena/.test(d6b.t || "")], [true, true]);
    var d7 = r4.pr.filter(function (x) { return x.f === "2026-10-07"; })[0] || {};
    eq("Vestidores día 2: el estatus de los carpinteros", [/estatus con los dos carpinteros/.test(d7.t), /contacto del carpintero/.test(d7.t)], [true, false]);
    var d8 = r4.pr.filter(function (x) { return x.f === "2026-10-08"; })[0] || {}, d12 = r4.pr.filter(function (x) { return x.f === "2026-10-12"; })[0] || {};
    eq("Vestidores día 3: muestras y cuenta regresiva", [/muestras/.test(d8.t), /Faltan 4 días para el lun 12 oct/.test(d8.t)], [true, true]);
    eq("Vestidores último día: el plazo es hoy", [/muestras/.test(d12.t), /El plazo es hoy/.test(d12.t)], [true, true]);
    eq("Vestidores: el aviso cuenta los 8", /8 WhatsApp programados/.test(r4.hecho), true);
    /* sin pasos dictados: tampoco textos iguales */
    var r4b = await p.evaluate(async function (V) { __WA.length = 0;
      var T = { id: "tVEST2", nombre: "Vestidores Carpintería", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, contexto: "Vestidores.", wa_contactos: [{ nombre: "Manuel Parra (Meny Parra)", desde: 1 }], msgs: [] };
      tareas = [T]; abierta = T.id; vista = "hilo";
      modelo({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null,
        seguimiento_a: { quien: "Manuel", meta: "Muestras listas", cada: "diario", fechas: ["2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12"], hora: null, texto: "IA: ¿Cómo vamos con las muestras?" } });
      completaRevision(T, V, {}); await espera(2800);
      var u = {}; __WA.forEach(function (w) { u[w.texto] = 1; }); return [__WA.length, Object.keys(u).length]; }, VEST);
    eq("Sin pasos: 7 mensajes, 7 textos distintos", r4b, [7, 7]);

    /* ===== 4) Vínculos con cerradas ===== */
    var r5 = await p.evaluate(async function (D) { __WA.length = 0;
      var T = FIDEI({ f_vigente: "", f_original: "", fecha_dictada: false, contexto: "", wa_contactos: [] });
      var C = { id: "tmullpqubtxafy", nombre: "Revisar fideicomiso terminado y corregido de BBVA", duenio: "salvador", estado: "cerrada", tipo_item: "tarea", cierre: { tipo: "hecha", motivo: "", f: "2026-10-02" }, contexto: "Revisar el fideicomiso corregido por BBVA contra el memorándum antes de firmar.", msgs: [] };
      var VIEJA = { id: "tVIEJA", nombre: "Fideicomiso anterior revisar BBVA", duenio: "salvador", estado: "cerrada", tipo_item: "tarea", cierre: { tipo: "hecha", motivo: "", f: "2026-08-20" }, contexto: "Revisar fideicomiso corregido", msgs: [] };
      var NOEJ = { id: "tNOEJ", nombre: "Fideicomiso terminado revisar firma", duenio: "salvador", estado: "no_ejecutada", tipo_item: "tarea", cierre: { tipo: "no_ejecutada", motivo: "ya_no", f: "2026-09-20" }, contexto: "", msgs: [] };
      var INV = { id: "wa_abbea09d95fd8a79", nombre: "Inversiones BBVA", duenio: "salvador", estado: "abierta", tipo_item: "tarea", contexto: "Estado de cuenta de las inversiones", msgs: [] };
      var BLUE = { id: "tBLUE_CUP_BBVA_051026", nombre: "Blue Cup BBVA", duenio: "salvador", estado: "abierta", tipo_item: "tarea", contexto: "Pagos de la cafetería", msgs: [] };
      tareas = [T, C, VIEJA, NOEJ, INV, BLUE]; abierta = T.id; vista = "hilo";
      var lista = abiertasParaVincular(T, D, 30).map(function (x) { return x.id; });
      modelo({ tipo: "tarea", fecha: null, recordar: [], vinculos: ["wa_abbea09d95fd8a79", "tBLUE_CUP_BBVA_051026", "tmullpqubtxafy"], ordenes: [], dudas: [], pregunta: null });
      completaRevision(T, D, {}); await espera(2600);
      var prompt = window.__PROMPT, pd = posibleDup(T).map(function (x) { return x.id; });
      return { lista: lista, prompt: /tmullpqubtxafy \| Revisar fideicomiso terminado y corregido de BBVA \(cerrada\)/.test(prompt), dup: T.posible_dup || [], pd: pd, tx: ultimoBi(T), vieja: /tVIEJA/.test(prompt), nombre: nombreVinc248(C) }; },
      "hay que revisar el fideicomiso terminado y corregido que manda BBVA para firmar, revisarlo contra el memorándum");
    eq("vínculos: sale la cerrada del fideicomiso", r5.lista.indexOf("tmullpqubtxafy") >= 0, true);
    eq("vínculos: no sale la cerrada de hace más de 30 días", [r5.lista.indexOf("tVIEJA") < 0, r5.vieja], [true, false]);
    eq("vínculos: el prompt la marca (cerrada)", r5.prompt, true);
    eq("vínculos: solo la del tema (no Inversiones BBVA ni Blue Cup BBVA)", r5.dup, ["tmullpqubtxafy"]);
    eq("vínculos: posibleDup la incluye (cerrada)", r5.pd, ["tmullpqubtxafy"]);
    eq("vínculos: el texto dice (cerrada) y no nombra las de empresa", [/Revisar fideicomiso terminado y corregido de BBVA \(cerrada\)/.test(r5.tx), /Inversiones BBVA|Blue Cup/.test(r5.tx)], [true, false]);
    eq("nombreVinc248", r5.nombre, "Revisar fideicomiso terminado y corregido de BBVA (cerrada)");
    var r5b = await p.evaluate(function () { var T = tareas[0]; T.hecho238 = null; T.tipo_elegido = true; var h = vFaltaInfo(T), d = document.createElement("div"); d.innerHTML = h + fichaRevision(T); var fr = d.querySelector(".c-vincular"), ff = d.textContent;
      return { franja: fr ? fr.textContent : "", txtBtn: fr && fr.querySelector(".rvb") ? fr.querySelector(".rvb").textContent : "", fila: /Revisar fideicomiso terminado y corregido de BBVA \(cerrada\) \(no vinculado\)/.test(ff) }; });
    eq("franja de vínculo muestra (cerrada) y botón Ver", [/\(cerrada\)/.test(r5b.franja), r5b.txtBtn], [true, "Ver"]);
    eq("ficha: Vínculo propuesto con (cerrada)", r5b.fila, true);
    var r5c = await p.evaluate(function () { var T = FIDEI(); var base = palTema248([T.nombre, "firmar el contrato con BBVA"].join(" "));
      return { solo: temaComun248(base, "Inversiones BBVA estado de cuenta"), dos: temaComun248(palTema248("fideicomiso firma BBVA"), "Revisar fideicomiso firma BBVA corregido") }; });
    eq("temaComun248: BBVA solo no cuenta; 2 palabras sí", [r5c.solo < 2, r5c.dos >= 2], [true, true]);

    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? "FALLAS:\n" + malas.join("\n") : "todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
