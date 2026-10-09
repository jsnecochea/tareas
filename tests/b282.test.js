#!/usr/bin/env node
/* PRUEBAS build 282 (rama build-pendientes-2026-10-07). 390 px, reloj fijo dom 2026-10-04 00:00 (Monterrey).
   F39 (Salvador 2026-10-04 00:17, "Hablar con José Mijares"): los seguimientos son proactivos y motivadores, como líder de empresa top:
       sin conteos ("van 3 veces"), sin regaños ("¿por qué no la terminaste?"), sin amenazas ("le aviso a tu jefe"), sin hablar de
       Salvador en tercera persona y sin repetir el mismo texto. Aplica al correteo (textos de respaldo y prompt de Claude), al aviso
       al jefe, a la insistencia de entregas (build 182) y al aviso de encargo.
   F36 (Salvador 2026-10-03, "Decoración Navideña Cumbres"): "Claude, recuérdame el martes de darle seguimiento a Pato y Chuy y pedir la
       grúa y el material" -> regla fija en el teléfono, sin IA: aviso el martes (9:00 o la hora dicha) + 3 pasos con la sección del día;
       el finiquito no se toca; la indicación queda privada; fecha dudosa = una pregunta y nada se guarda.
   Correr: node tests/b282.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 282", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 282, true);
eq("sw.js con versión >= 282", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 282, true);
eq("ya no existen los textos agresivos en el código", ["callado no se queda", "¿Por qué no la terminaste", "Necesito una fecha, no un", "Si mañana no está, le aviso a tu jefe", "le subes el tono", "se lo cobras", "el rojo es tuyo", "Ya le insistí 2 veces"].filter(function (x) { return html.indexOf(x) >= 0; }), []);
var MALO = /\b(veces|callado|ahorita|regañ\w*|salvador|jefe)\b|por\s+qu[eé]\s+no|van\s+\d/i;
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    var RD = Date, base = RD.parse("2026-10-04T06:00:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; window.__WA = []; window.__PROMPTS = [];
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      preguntaAClaude = function (msgs, mod, cb) { __PROMPTS.push(msgs[0].content); setTimeout(function () { cb(JSON.stringify({ accion: "nada", respuesta: "x" })); }, 20); };
      document.getElementById("app").style.display = "flex"; window.NOW = Date.now();
      window.abre = function (T) { tareas = [T]; abierta = T.id; vista = "hilo"; render(); };
      window.envia = function (v) { var tx = document.getElementById("txt"); tx.value = v; document.getElementById("tenv").click(); };
      window.NAV = function () { return { id: "tNAV", nombre: "Decoración Navideña Cumbres", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
        f_vigente: "2026-11-02", fecha_dictada: true, contexto: "Decoración navideña de la colonia Cumbres con Pato y Chuy; grúa y material para los árboles.", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: NOW - 100000, h: "07:00" }] }; };
    });

    /* ===== F39 ===== */
    var F = await p.evaluate(function () {
      var o = {}, L = [];
      for (var i = 0; i < 7; i++) L.push(textoEmpujon("Hablar con José Mijares", i));
      o.L = L;
      /* empujon() real sobre una tarea vencida, 1a, 2a, 3a y 4a vez */
      var T = { id: "tJM", nombre: "Hablar con José Mijares", duenio: "salvador", estado: "abierta", tipo: "unica", f_original: "2026-09-30", f_vigente: "2026-09-30", msgs: [] };
      tareas = [T]; o.emp = [];
      for (var k = 0; k < 4; k++) { var tx = empujon(T, null); var m = T.msgs[T.msgs.length - 1]; o.emp.push({ tx: tx, aviso: m.aviso, esAviso: esAvisoClaude(m) }); T.empujones[T.empujones.length - 1].f = "2026-10-0" + k; }
      /* prompt con que Claude redacta el correteo */
      APP_TOKEN = "tok"; __PROMPTS.length = 0; vozDelCorreteo([{ t: T, tipo: "empujon", ritmo: null }], function () {}); o.prompt = __PROMPTS[0] || "";
      /* aviso al jefe: sin conteo de toques */
      try { var sj = subeAlJefe(T); o.jefe = sj ? sj.texto : null; } catch (e) { o.jefe = "ERR " + e.message; }
      /* insistencia de entregas (build 182) */
      var H = { id: "tH", nombre: "Muestras comedor", duenio: "salvador", estado: "abierta", f_vigente: "2026-10-20", msgs: [], lista_pasos: [{ id: "p1", tx: "Muestra de melamina", hito: true, fecha: "2026-10-01", hecho: false }] };
      tareas = [H]; window.disparaPushInstantaneo = function () {}; chequeoHitos(); o.hito1 = (H.msgs[H.msgs.length - 1] || {}).t || "";
      H.hito_nag[0].ult = "2026-10-03"; H.hito_nag[0].ts = 0; chequeoHitos(); o.hito2 = (H.msgs[H.msgs.length - 1] || {}).t || "";
      H.hito_nag[0].ult = "2026-10-03"; H.hito_nag[0].ts = 0; window.quienSupervisa = function () { return []; }; chequeoHitos(); o.hito3 = (H.msgs[H.msgs.length - 1] || {}).t || "";
      return o;
    });
    eq("F39 textos de respaldo: ninguno trae conteos, regaños, amenazas ni a Salvador en tercera persona", F.L.filter(function (x) { return MALO.test(x); }), []);
    eq("F39 textos de respaldo: dos seguidos nunca son iguales", F.L.every(function (x, i) { return !i || x !== F.L[i - 1]; }), true);
    eq("F39 textos de respaldo: todos piden un paso o fecha y ofrecen ayuda u otro plan", F.L.every(function (x) { return /\?/.test(x) && /(dime|cuenta conmigo|ayudar|otro plan|resolvemos|necesitas)/i.test(x); }), true);
    eq("F39 empujon() 1a-4a vez: tono de líder, marcado como aviso (se limpia en Importante)", F.emp.map(function (e) { return [MALO.test(e.tx), e.aviso, e.esAviso]; }), [[false, 1, true], [false, 1, true], [false, 1, true], [false, 1, true]]);
    eq("F39 empujon(): la 1a y la 2a no repiten texto", F.emp[0].tx !== F.emp[1].tx && F.emp[1].tx !== F.emp[2].tx, true);
    eq("F39 prompt del correteo: pide tono proactivo y prohíbe conteos y amenazas", [/PROACTIVO y MOTIVADOR/.test(F.prompt), /nunca subas el tono/.test(F.prompt), /subes el tono|se lo cobras/.test(F.prompt), /van 3 veces/.test(F.prompt)], [true, true, false, true]);
    eq("F39 aviso al jefe sin 'Le pregunté N veces'", F.jefe === null || !/veces/.test(F.jefe), true);
    eq("F39 entregas atrasadas (182): 1a y 2a insistencia sin amenaza ni conteo, distintas", [MALO.test(F.hito1), MALO.test(F.hito2), F.hito1 !== F.hito2, /Muestra de melamina/.test(F.hito1)], [false, false, true, true]);
    eq("F39 aviso al supervisor sin 'Ya le insistí 2 veces'", [/insist/i.test(F.hito3), /veces/.test(F.hito3), /todavía no entrega/.test(F.hito3)], [false, false, true]);

    /* ===== F36: la regla fija ===== */
    var R = await p.evaluate(function () {
      var L = ["Claude recuérdame el martes de darle seguimiento a pato y Chuy y pedir la grúa y el material",
        "recuérdame mañana a las 5 de la tarde de llamar a Pato, revisar la grúa y comprar focos",
        "recuérdame el lunes 4 de llamar a Pato y revisar la grúa",
        "recuérdame el martes de llamar a Pato",
        "recuérdame llamar a Pato y a Chuy",
        "recuérdame el martes de llamar a Pato y el 15 de revisar la grúa"];
      return L.map(function (v) { var r = recuerdaLista(v); return r ? { f: r.fecha, d: r.duda, c: r.cosas } : null; });
    });
    eq("F36 caso real: martes 6-oct, 3 cosas (el verbo se hereda: 'pedir el material'; 'Pato y Chuy' no se parte)", R[0], { f: "2026-10-06", d: "", c: ["Darle seguimiento a pato y Chuy", "Pedir la grúa", "Pedir el material"] });
    eq("F36 con hora y comas", R[1], { f: "2026-10-05", d: "", c: ["Llamar a Pato", "Revisar la grúa", "Comprar focos"] });
    eq("F36 día y número que no cuadran = duda", [R[2].f, /domingo/.test(R[2].d)], [null, true]);
    eq("F36 una sola cosa, sin fecha u otra fecha adentro: no aplica (sigue su camino de siempre)", [R[3], R[4], R[5]], [null, null, null]);

    /* ===== F36: dentro de la tarea ===== */
    await p.evaluate(function () { __PROMPTS.length = 0; abre(NAV()); envia("Claude recuérdame el martes de darle seguimiento a pato y Chuy y pedir la grúa y el material"); });
    await p.waitForTimeout(500);
    var A = await p.evaluate(function () { var T = tareas[0]; var priv = T.msgs.slice(1).every(function (m) { return m.nota_claude === 1 && m.canal === "priv:salvador"; });
      return { fv: T.f_vigente, av: (T.avisos || []).map(function (a) { return [a.fecha, a.hora]; }), pasos: (T.lista_pasos || []).map(function (x) { return x.sec + "|" + x.tx; }), priv: priv, n: T.msgs.length, resp: T.msgs[T.msgs.length - 1].t, ia: __PROMPTS.length, wa: __WA.length }; });
    eq("F36 en la tarea: el finiquito (2-nov) no se toca", A.fv, "2026-11-02");
    eq("F36 en la tarea: un aviso el martes 6-oct a las 9:00", A.av, [["2026-10-06", "09:00"]]);
    eq("F36 en la tarea: 3 pasos con la sección del día", A.pasos, ["Mar 6 oct|Darle seguimiento a pato y Chuy", "Mar 6 oct|Pedir la grúa", "Mar 6 oct|Pedir el material"]);
    eq("F36 en la tarea: indicación y respuesta privadas (se pliegan como notas a Claude); sin IA ni WhatsApp", [A.priv, A.n, A.ia, A.wa], [true, 3, 0, 0]);
    eq("F36 respuesta armada por la app con la fecha guardada", /^Anotado\. Te aviso martes 6 de octubre/.test(A.resp) && /3 pasos/.test(A.resp), true);
    await p.evaluate(function () { abre(NAV()); envia("recuérdame mañana a las 5 de la tarde de llamar a Pato, revisar la grúa y comprar focos"); });
    await p.waitForTimeout(400);
    var B = await p.evaluate(function () { var T = tareas[0]; return (T.avisos || []).map(function (a) { return [a.fecha, a.hora]; }); });
    eq("F36 con hora dicha: mañana 5-oct a las 17:00", B, [["2026-10-05", "17:00"]]);
    await p.evaluate(function () { abre(NAV()); envia("recuérdame el lunes 4 de llamar a Pato y revisar la grúa"); });
    await p.waitForTimeout(400);
    var C = await p.evaluate(function () { var T = tareas[0]; return { av: (T.avisos || []).length, pasos: (T.lista_pasos || []).length, fv: T.f_vigente, ult: T.msgs[T.msgs.length - 1].t }; });
    eq("F36 fecha dudosa: nada se guarda y se hace UNA pregunta", [C.av, C.pasos, C.fv, /¿Qué fecha es\? No puse nada/.test(C.ult)], [0, 0, "2026-11-02", true]);
    /* un segundo dictado del mismo día no duplica el aviso */
    await p.evaluate(function () { var T = NAV(); abre(T); envia("recuérdame el martes de llamar a Pato y revisar la grúa"); });
    await p.waitForTimeout(300);
    await p.evaluate(function () { envia("recuérdame el martes de comprar focos y pedir el material"); });
    await p.waitForTimeout(300);
    var D = await p.evaluate(function () { var T = tareas[0]; return { av: (T.avisos || []).length, pasos: (T.lista_pasos || []).length }; });
    eq("F36 dos dictados para el mismo martes: un solo aviso, 4 pasos", D, { av: 1, pasos: 4 });
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN: " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) { console.log("FALLAN:\n  " + malas.join("\n  ")); }
  else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
