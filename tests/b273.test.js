#!/usr/bin/env node
/* PRUEBAS build 273: la TAREA en 4 capas (En qué vamos · Decide tú · Lo que sabemos · Plática con lo archivado plegado) y la ficha
   roja "Falta" que SIEMPRE abre el cuestionario. 390 px, anti-regresión. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión ≥ 273", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 273, true);
eq("sw.js con versión build ≥ 273", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 273, true);
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
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD;
    window.__SRS = []; window.SpeechRecognition = window.webkitSpeechRecognition = function () { var o = this; o.start = function () { __SRS.push(o); o.on = true; }; o.stop = function () { o.on = false; if (o.onend) o.onend(); }; o.abort = o.stop; }; });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true; window.__agendaNo = 1;
      window.__esp = [];
      db = { collection: function () { return { doc: function (k) { return { set: function (d, o) { window.__esp.push([k, d, o]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      window.pideWhatsApp = function () { return Promise.resolve({ id: "wa_x" }); };
      window.preguntaAClaude = function (m, mod, cb) { setTimeout(function () { cb("{}"); }, 10); };
      document.getElementById("app").style.display = "flex"; window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      var N = Date.now(), D = 86400000;
      window.FX = function (extra) { var t = { id: "tCAM", nombre: "Cámaras de la bodega", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-10", fecha_dictada: true,
        contexto: "Poner cámaras en la bodega de Escobedo, con grabación de 30 días y vista desde el teléfono.", ritmo: "diario",
        plan: [{ t: "Cotización de Hikvision", de: "Claude", hecho: true }, { t: "Mandar la cotización corregida", de: "Josué Treviño", fecha: "2026-10-09" }],
        resumen: { texto: "Se pidieron tres cotizaciones; dos ya llegaron.", acuerdos: [{ t: "Que incluya instalación", fecha: "2026-10-05" }], actualizado: N - 3600000 },
        decision: { pregunta: "¿Cuál cotización autorizo?", recomendacion: "Dahua: cumple todo y es la más barata.",
          opciones: [{ nombre: "Hikvision", precio: "$18,500", link: "https://ejemplo.com/hik", cumple: { "30 días": true, "Ver en el teléfono": true, "Instalación": false } },
                     { nombre: "Dahua", precio: "$16,900", link: "https://ejemplo.com/dahua", cumple: { "30 días": true, "Ver en el teléfono": true, "Instalación": true }, recomendada: true },
                     { nombre: "Steren", precio: "$9,800", link: "", cumple: { "30 días": false, "Ver en el teléfono": true, "Instalación": true } }] },
        sabemos: [{ t: "Son 6 cámaras", tipo: "cifra" }, { t: "Se graba 30 días en disco local", tipo: "decision" }, { t: "Steren", tipo: "descartado", por_que: "solo graba 7 días" }, "La bodega no tiene internet fijo todavía"],
        msg_imp: { m1: 1, m2: 1, m3: 1, m4: 1 },
        msgs: [{ id: "m1", k: "bo", de: "salvador", t: "Pide tres cotizaciones de cámaras", ts: N - 5 * D, h: "09:00", archivado: true },
               { id: "m2", k: "bi", t: "Josué: ya pedí a Hikvision y Dahua", ts: N - 4 * D, h: "10:00", wa_in: 1, wa_c: "Josué Treviño", archivado: true },
               { id: "m3", k: "bo", de: "salvador", t: "Que incluya instalación", ts: N - 3 * D, h: "11:00" },
               { id: "m4", k: "bi", t: "Josué: listo, ya llegó la de Dahua", ts: N - 2 * 3600000, h: "13:00", wa_in: 1, wa_c: "Josué Treviño", archivado: true }] };
        for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.abre = function (T) { tareas = [T]; abierta = T.id; vista = "hilo"; window.__vf230 = {}; window.__arch273 = {}; render(); };
      window.secs = function () { return [].map.call(document.querySelectorAll(".cp273w4 > *"), function (e) { return e.id; }); };
      window.globos = function () { return [].map.call(document.querySelectorAll(".msgs .b"), function (e) { return e.textContent.replace(/\s+/g, " ").trim().slice(0, 40); }); };
    });

    /* ===== 1. las 4 capas en orden ===== */
    var A = await p.evaluate(async function () { abre(FX()); await espera(60);
      var r = {}; r.secs = secs();
      r.vamos = [document.querySelector("#cp273v h4").textContent, document.querySelector("#cp273v .cp273sig").textContent, [].map.call(document.querySelectorAll("#cp273v .cp273m span"), function (s) { return s.textContent; })];
      r.verRes = [!!document.querySelector("#cp273v details.cp273r"), document.querySelector("#cp273v details.cp273r").open, /tres cotizaciones/.test(document.querySelector("#cp273v details").textContent), /Que incluya instalación/.test(document.querySelector("#cp273v details").textContent)];
      var d = document.getElementById("cp273d");
      r.decide = [d.querySelector("h4").textContent, d.querySelector(".cp273q").textContent, d.querySelector(".cp273rec span").textContent];
      r.tabla = [].map.call(d.querySelectorAll("tr"), function (tr) { return [].map.call(tr.children, function (c) { return c.textContent; }).join("|"); });
      r.rec = [].map.call(d.querySelectorAll("th.rec"), function (c) { return c.textContent; });
      r.links = [].map.call(d.querySelectorAll("a"), function (a) { return a.getAttribute("href"); });
      r.caja = [!!document.getElementById("dec273t"), !!document.getElementById("dec273m"), !!document.getElementById("dec273e")];
      r.sabemos = [].map.call(document.querySelectorAll("#cp273s li"), function (l) { return l.className + ":" + l.textContent; });
      r.tachado = !!document.querySelector("#cp273s li.descartado s");
      r.ar = [document.querySelectorAll(".ar273").length, document.querySelector(".ar273").textContent, document.querySelector(".ar273").getAttribute("aria-expanded")];
      r.globos = globos();
      var y = function (s) { return document.querySelector(s).getBoundingClientRect().top; };
      r.y = [y("#cp273v"), y("#cp273d"), y("#cp273s"), y("#cp273h"), y(".ar273")];
      r.ancho = [document.documentElement.scrollWidth <= 390, [].every.call(document.querySelectorAll(".cp273"), function (e) { return e.getBoundingClientRect().right <= 390; }), document.querySelector(".cp273t").scrollWidth <= document.querySelector(".cp273t").clientWidth];
      r.scrollTop = document.querySelector(".scroll").scrollTop;
      return r; });
    await foto("b273-1-capas.png");
    eq("las 4 capas en orden: En qué vamos · Decide tú · Lo que sabemos · Plática", A.secs, ["cp273v", "cp273d", "cp273s", "cp273h"]);
    eq("en pantalla de arriba hacia abajo (y el plegado de la plática debajo)", A.y.every(function (v, i, a) { return !i || v > a[i - 1]; }), true);
    eq("En qué vamos: el siguiente paso, quién y para cuándo", [A.vamos[0], A.vamos[1], A.vamos[2][0], A.vamos[2].length], ["En qué vamos", "Mandar la cotización corregida", "Espera a Josué", 2]);
    eq("para cuándo = la fecha del paso (9 oct)", /vie|9 oct|pasado/.test(A.vamos[2][1]), true);
    eq("resumen y acuerdos de siempre, plegados en Ver resumen", A.verRes, [true, false, true, true]);
    eq("Decide tú: pregunta y recomendación", A.decide, ["Decide tú", "¿Cuál cotización autorizo?", "Dahua: cumple todo y es la más barata."]);
    eq("comparativa compacta con palomita/tache, precio y links", A.tabla, ["|Hikvision|Dahua|Steren", "30 días|✓|✓|✕", "Ver en el teléfono|✓|✓|✓", "Instalación|✕|✓|✓", "Precio|$18,500|$16,900|$9,800", "|Ver ›|Ver ›|"]);
    eq("la recomendada resaltada", A.rec, ["Dahua"]);
    eq("links de las opciones", A.links, ["https://ejemplo.com/hik", "https://ejemplo.com/dahua"]);
    eq("caja + micrófono + enviar para contestar ahí mismo", A.caja, [true, true, true]);
    eq("Lo que sabemos en viñetas (cifra, decisión, descartado y por qué, texto)", A.sabemos, ["cifra:Son 6 cámaras", "decision:Se graba 30 días en disco local", "descartado:Steren — solo graba 7 días", ":La bodega no tiene internet fijo todavía"]);
    eq("lo descartado va tachado", A.tachado, true);
    eq("Plática anterior (2) ▸ plegada", A.ar, [1, "Plática anterior (2) ▸", "false"]);
    eq("se ven el no archivado y el archivado reciente; los viejos archivados no", [A.globos.some(function (g) { return /Que incluya instalación/.test(g); }), A.globos.some(function (g) { return /ya llegó la de Dahua/.test(g); }), A.globos.some(function (g) { return /Pide tres cotizaciones|ya pedí a Hikvision/.test(g); })], [true, true, false]);
    eq("cabe en 390 px sin scroll horizontal (la tabla tampoco)", A.ancho, [true, true, true]);
    eq("al abrir se ve arriba (En qué vamos visible)", A.scrollTop, 0);

    /* ===== 2. Plática anterior: se abre y se vuelve a plegar ===== */
    var B = await p.evaluate(async function () { document.querySelector(".ar273").click(); await espera(30);
      var r = { ab: [document.querySelector(".ar273").textContent, document.querySelector(".ar273").getAttribute("aria-expanded"), globos().filter(function (g) { return /Pide tres cotizaciones|ya pedí a Hikvision/.test(g); }).length] };
      var g = globos(); r.orden = g.indexOf(g.filter(function (x) { return /Pide tres/.test(x); })[0]) < g.indexOf(g.filter(function (x) { return /Que incluya instalación/.test(x); })[0]);
      document.querySelector(".ar273").click(); await espera(30);
      r.pleg = [document.querySelector(".ar273").textContent, globos().filter(function (g) { return /Pide tres cotizaciones|ya pedí a Hikvision/.test(g); }).length];
      return r; });
    eq("al tocar se abre: Plática anterior (2) ▾ y salen los 2", B.ab, ["Plática anterior (2) ▾", "true", 2]);
    eq("abiertos, en su orden de siempre", B.orden, true);
    eq("al tocar otra vez se pliega", B.pleg, ["Plática anterior (2) ▸", 0]);

    /* ===== 3. el plegado también en la vista Todo ===== */
    var C = await p.evaluate(async function () { poneVista(tareas[0], ""); window.__cnl = { tCAM: "todo" }; render(); await espera(30);
      return [!!document.querySelector(".cp273w4"), document.querySelectorAll(".ar273").length, globos().filter(function (g) { return /Pide tres cotizaciones/.test(g); }).length]; });
    eq("en Todo: sin capas (son de Importante), la plática archivada sigue plegada", C, [false, 1, 0]);

    /* ===== 4. contestar la decisión ahí mismo (dictado y escrito) ===== */
    var D = await p.evaluate(async function () { abre(FX()); await espera(40); window.__SRS.length = 0;
      var r = {};
      document.getElementById("dec273m").click(); await espera(30);
      var sr = __SRS[0]; r.mic = [__SRS.length, !!window.__oyendo];
      if (sr && sr.onresult) sr.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: "Autorizo la de Dahua" }], { isFinal: true })] });
      await espera(30); r.dictado = document.getElementById("dec273t").value;
      render(); await espera(20); r.sobreviveRender = document.getElementById("dec273t").value;
      document.getElementById("dec273e").click(); await espera(40);
      var T = tareas[0], m = T.msgs[T.msgs.length - 1];
      r.msg = [m.k, m.t, m.de, m.canal, m.nota_claude, m.resp_decision273];
      r.resp = [T.decision.respuesta && T.decision.respuesta.t, T.decision.respuesta && T.decision.respuesta.de];
      r.guardo = __esp.some(function (e) { return e[1] && e[1].decision && e[1].decision.respuesta; });
      r.ui = [!!document.getElementById("dec273t"), document.querySelector("#cp273d .cp273ok span").textContent];
      r.oyendo = !!window.__oyendo;
      /* Cambiar: vuelve la caja; escrito con Enter */
      document.querySelector('[data-dec273="otra"]').click(); await espera(40);
      var ta = document.getElementById("dec273t"); ta.value = "Mejor la de Hikvision"; ta.dispatchEvent(new Event("input"));
      ta.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); await espera(40);
      r.escrito = [tareas[0].decision.respuesta.t, tareas[0].msgs.filter(function (x) { return x.resp_decision273; }).length];
      return r; });
    await foto("b273-2-contestada.png");
    eq("el micrófono de la capa dicta", D.mic, [1, true]);
    eq("lo dictado cae en la caja de la decisión", D.dictado, "Autorizo la de Dahua");
    eq("lo dictado no se pierde si la pantalla se repinta", D.sobreviveRender, "Autorizo la de Dahua");
    eq("la respuesta va al hilo como nota para Claude (no sale por WhatsApp)", D.msg, ["bo", "Autorizo la de Dahua", "salvador", "priv:salvador", 1, 1]);
    eq("queda en decision.respuesta y se guarda", [D.resp, D.guardo], [["Autorizo la de Dahua", "salvador"], true]);
    eq("la capa dice lo que contestaste (build 283: pendiente de aplicar hasta aplicado38)", D.ui, [false, "Contestaste: «Autorizo la de Dahua». Pendiente de aplicar · Claude lo está aplicando…"]);
    eq("el dictado se apagó al mandar", D.oyendo, false);
    eq("Cambiar → se contesta otra vez (escrito, con Enter)", D.escrito, ["Mejor la de Hikvision", 2]);

    /* ===== 5. sin campos nuevos, sin capas nuevas; Decide tú solo para el jefe; resuelta no sale ===== */
    var E = await p.evaluate(async function () { var r = {};
      abre(FX({ decision: undefined, sabemos: undefined })); await espera(30); r.sin = secs();
      abre(FX({ decision: Object.assign(FX().decision, { resuelta: true }) })); await espera(30); r.resuelta = secs();
      abre(FX({ sabemos: "- Son 6 cámaras\n- Steren descartada: graba poco\n" })); await espera(30); r.texto = [].map.call(document.querySelectorAll("#cp273s li"), function (l) { return l.textContent; });
      abre(FX({ plan: [], resumen: { texto: "Se pidieron tres cotizaciones." } })); await espera(30); r.sinPaso = [!!document.querySelector("#cp273v .cp273sig"), /tres cotizaciones/.test(document.getElementById("cp273v").textContent)];
      abre(FX({ msgs: [{ k: "bo", de: "salvador", t: "Hola", ts: Date.now() - 86400000 * 3, h: "09:00" }] })); await espera(30); r.sinArch = document.querySelectorAll(".ar273").length;
      PERSONAS.salvador.jefe = false; abre(FX()); await espera(30); r.noJefe = secs(); PERSONAS.salvador.jefe = true;
      return r; });
    eq("sin decision ni sabemos: solo En qué vamos y Plática", E.sin, ["cp273v", "cp273h"]);
    eq("decisión resuelta: no sale Decide tú", E.resuelta, ["cp273v", "cp273s", "cp273h"]);
    eq("sabemos en texto: una viñeta por renglón", E.texto, ["Son 6 cámaras", "Steren descartada: graba poco"]);
    eq("sin siguiente paso: En qué vamos con el resumen de siempre", E.sinPaso, [false, true]);
    eq("sin archivados: no hay renglón de plática anterior", E.sinArch, 0);
    eq("quien no es el jefe no ve Decide tú", E.noJefe, ["cp273v", "cp273s", "cp273h"]);

    /* ===== 6. la decisión pendiente es pelota de Salvador ===== */
    var F = await p.evaluate(function () { var a = FX({ decision: undefined }), b2 = FX(), c = FX(); c.decision.respuesta = { t: "x", ts: 1 };
      return [pelota263(b2).de, pelota263(c).de, pelota263(a).de]; });
    eq("con decisión pendiente le toca a Salvador; contestada o sin decisión, sigue la regla", F, ["yo", "claude", "claude"]);

    /* ===== 7. la ficha roja Falta SIEMPRE abre el cuestionario ===== */
    var G = await p.evaluate(async function () { var r = {}; window.__SRS.length = 0;
      var FA = { id: "tFA", nombre: "Fiesta de fin de año", duenio: "salvador", creada_por: "claude", por_autorizar: true, estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [] };
      tareas = [FA]; abierta = "tFA"; vista = "hilo"; window.__vf230 = {}; window.__pq255Last = null; render(); await espera(60);
      r.antes = [!!document.querySelector('[data-chip="falta"]'), preguntas249(FA).length, !!document.getElementById("preg249")];
      document.querySelector('[data-chip="falta"]').click(); await espera(40);
      var m = document.getElementById("preg249");
      r.abre = [!!m, m ? m.querySelectorAll("ol li").length > 0 : false, m ? /^Dime /.test(m.querySelector("ol li").textContent) : false, m ? m.querySelector("ol li").length === undefined : null];
      r.n = [document.querySelector('[data-chip="falta"]').textContent.match(/\d+/)[0], m ? String(m.querySelectorAll("ol li").length) : "0"];
      r.mic = __SRS.length;
      /* contestar con el bloque abierto: completa la tarea (completaRevision) */
      var llamo = null; window.completaRevision = function (t, v, op) { llamo = [t.id, v, !!(op && op.sinRevision)]; };
      document.getElementById("txt").value = "Es el 12 de diciembre en la casa"; document.getElementById("tenv").click(); await espera(30);
      r.contesta = [llamo, !!document.getElementById("preg249")];
      /* las preguntas precisas (falta263) siguen abriendo su cuestionario de siempre */
      var FB = { id: "tFB", nombre: "Pagar predial", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-20", fecha_dictada: true, contexto: "Pagar el predial de la casa antes de que suba.", msgs: [], falta263: [{ k: "txt", q: "¿De cuál casa?", d263: 1 }] };
      tareas = [FB]; abierta = "tFB"; vista = "hilo"; window.__pq255Last = "tFB"; render(); await espera(40);
      var ch = document.querySelector('[data-chip="falta"]'); r.precisa = [!!ch];
      if (ch) { ch.click(); await espera(30); var m2 = document.getElementById("preg249"); r.precisa.push(!!m2, m2 ? m2.querySelector("ol li").textContent : ""); }
      /* cerrarlo con Después y volver a picarle: abre otra vez */
      var dsp = document.querySelector('#preg249 .pq255d'); if (dsp) dsp.click(); await espera(20);
      r.otraVez = [!!document.getElementById("preg249")]; document.querySelector('[data-chip="falta"]').click(); await espera(20); r.otraVez.push(!!document.getElementById("preg249"));
      return r; });
    await foto("b273-3-falta.png");
    eq("tarea con Falta sin preguntas precisas: hay chip y antes del 273 no había cuestionario", G.antes, [true, 0, false]);
    eq("picarle a Falta abre el cuestionario con lo que falta", G.abre.slice(0, 3), [true, true, true]);
    eq("el número del chip = renglones del cuestionario", G.n[0], G.n[1]);
    eq("el micrófono no arranca solo", G.mic, 0);
    eq("lo dicho con el cuestionario abierto completa la tarea", G.contesta, [["tFA", "Es el 12 de diciembre en la casa", false], false]);
    eq("preguntas precisas: el chip abre su cuestionario de siempre", G.precisa, [true, true, "¿De cuál casa?"]);
    eq("Después y volver a picar: abre otra vez", G.otraVez, [false, true]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "todo bien"); console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
