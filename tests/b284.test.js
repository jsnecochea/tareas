#!/usr/bin/env node
/* PRUEBAS build 284 (mockup «C · Filas con respuesta rápida», aprobado por Salvador 7-oct). 390 px, reloj fijo mié 2026-10-07 21:30 (Monterrey).
   1) «Decide tú» en el home: encabezado limpio con contador, bloque gris #1C1C1E, SIN fondo rojo/naranja ni degradado en sus fichas.
   2) Botones con las opciones de la decisión (la recomendada primero y clara); sin opciones «Sí» / «Todavía no»; micrófono «Contestar dictando».
   3) Responder con un botón va por contestaDecision273 (encargo decision_resp + clasificaDecision283).
   4) Estado de la fila: «Aplicando…» mientras corre · «Listo · <lo que hizo>» en verde solo con aplicado38 · «Pendiente de aplicar» si falla.
   5) Resueltas fuera del home a las 24 h; sin decisiones la sección no aparece; lo que no es decisión queda en filas limpias con chevron.
   Correr: node tests/b284.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 284", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 284, true);
eq("sw.js con versión >= 284", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 284, true);
eq("las fichas de «Te pregunta Doit» ya no usan el fondo naranja (.l-preg)", /class="revl ttl l270 l-'\+k/.test(html) && /sec\("preg", "Te pregunta Doit"/.test(html), false);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    var RD = Date, base = RD.parse("2026-10-08T03:30:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true;
      window.__LL = []; window.__CD = [];
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      pideWhatsApp = function () { return Promise.resolve({ id: "p" }); };
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.NOW = Date.now(); document.getElementById("app").style.display = "flex";
      var _cd = contestaDecision273; contestaDecision273 = function (t, v) { __CD.push([t.id, v]); return _cd.apply(this, arguments); };
      window.home = function (L) { [].forEach.call(document.querySelectorAll("#preg249,#hoja254,#acom249,.leemask,.cnlbg,.cnlsheet"), function (e) { e.remove(); }); tareas = L; abierta = null; vista = "lista"; window.__grupoInicio = "esperan"; render(); };   /* home de tres fichas: «Decide tú» y «Te pregunta Doit» viven en la vista Te esperan */
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { __LL.push({ modo: mod }); setTimeout(function () { if (j === "caido") cb(null, "No contesto a tiempo."); else cb(JSON.stringify(j)); }, ms || 20); }; };
      window.base = function (id, nom, extra) { var o = { id: id, nombre: nom, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
        f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_dictada: true, contexto: "Contexto suficiente de la tarea para que no falte información.", resumen: { plan: [] }, msgs: [] }; for (var k in extra) o[k] = extra[k]; return o; };
      window.DEC = function () { return base("tDEC", "Cámaras bodega", { wa_contactos: [{ nombre: "Pepe Instalador", desde: 1 }],
        decision: { pregunta: "¿Cuál cotización autorizo?", recomendacion: "Hikvision: cumple todo.", opciones: [{ nombre: "Dahua" }, { nombre: "Hikvision", recomendada: true }], ts: NOW - 2 * 3600000 } }); };
      window.SIMPLE = function () { return base("tSIM", "Comedor Nuevo", { wa_contactos: [{ nombre: "Manuel Parra", desde: 1 }], decision: { pregunta: "¿Visto bueno a la muestra de acabado automotriz negro?", ts: NOW - 26 * 3600000 } }); };
      window.SAL = function () { return base("tSAL", "Colegio CAT", { pendiente_tipo: "decision_salvador", pendiente_info: "¿Vas tú solo a la reunión del viernes?" }); };
      window.FALTA = function () { return base("tFAL", "Bomba jardín", { contexto: "", pendiente_info: "¿Quién revisa la bomba?" }); };
      window.estado = function (id) { var f = document.querySelector('.f284[data-dec284="' + id + '"]'); if (!f) return null; var s = f.querySelector(".s284");
        return { e: f.getAttribute("data-e284"), txt: s ? s.textContent : "", color: s ? getComputedStyle(s).color : "", svg: !!(s && s.querySelector("svg")), botones: f.querySelectorAll(".p284").length }; };
    });

    /* ===== 1) estilo: encabezado, bloque gris y nada rojo ===== */
    var E = await p.evaluate(function () { home([DEC(), SIMPLE(), SAL()]);
      var sec = document.querySelector('.sc284[aria-label="Decide tú"]'); if (!sec) return null;
      var hd = sec.querySelector(".hd284"), bl = sec.querySelector(".bl284"), cs = getComputedStyle(hd.querySelector("span"));
      var rojo = [], todos = [sec].concat([].slice.call(sec.querySelectorAll("*")));
      var p = sec.parentElement; while (p && p.id !== "app") { todos.push(p); p = p.parentElement; }
      todos.forEach(function (el) { var g = getComputedStyle(el), bg = g.backgroundColor, bi = g.backgroundImage, m = bg.match(/\d+(\.\d+)?/g) || [];
        var r = +m[0], gg = +m[1], bb = +m[2], a = m.length > 3 ? +m[3] : 1;
        if ((a > 0 && r > 150 && r - gg > 60 && r - bb > 60) || /gradient/.test(bi)) rojo.push(el.className + " " + bg + " " + bi); });
      return { titulo: hd.querySelector("span").textContent, size: cs.fontSize, peso: cs.fontWeight, cuenta: (hd.querySelector("em") || {}).textContent, bg: getComputedStyle(bl).backgroundColor, radio: getComputedStyle(bl).borderRadius,
        filas: sec.querySelectorAll(".f284").length, linea: getComputedStyle(sec.querySelectorAll(".f284")[1]).borderTopColor, rojo: rojo,
        ini: [].map.call(sec.querySelectorAll(".f284i"), function (x) { return x.textContent; }), hace: [].map.call(sec.querySelectorAll(".f284"), function (f) { return (f.querySelector(".f284w") || {}).textContent || ""; }),
        q: (sec.querySelector(".f284q") || {}).textContent, emoji: /[\u{1F300}-\u{1FAFF}☀-➿]/u.test(sec.textContent) }; });
    eq("«Decide tú» 20px bold con contador gris y bloque #1C1C1E radio 14", E && [E.titulo, E.size, E.peso, E.cuenta, E.bg, E.radio], ["Decide tú", "20px", "700", "3", "rgb(28, 28, 30)", "14px"]);
    eq("tres filas separadas por línea #2C2C2E", E && [E.filas, E.linea], [3, "rgb(44, 44, 46)"]);
    eq("NINGÚN fondo rojo ni degradado en las fichas de decisión del home (ni en sus contenedores)", E && E.rojo, []);
    eq("iniciales de quien espera (o sigla del tema), cuánto lleva esperando y la pregunta; sin emoji", E && [E.ini, E.hace, E.q, E.emoji], [["PI", "MP", "CAT"], ["2 h", "ayer", ""], "¿Cuál cotización autorizo?", false]);

    /* ===== 2) botones ===== */
    var B = await p.evaluate(function () { var r = {}; ["tDEC", "tSIM", "tSAL"].forEach(function (id) { var f = document.querySelector('.f284[data-dec284="' + id + '"]');
        r[id] = [].map.call(f.querySelectorAll(".p284"), function (x) { var g = getComputedStyle(x); return [x.textContent, x.classList.contains("p284p"), g.backgroundColor, x.getBoundingClientRect().height >= 36]; }); });
      var m = document.querySelector('.f284[data-dec284="tDEC"] .p284m'); r.mic = [m.getAttribute("aria-label"), m.getBoundingClientRect().height >= 36, !!m.querySelector("svg")]; return r; });
    eq("opciones de la decisión: la recomendada primero, clara (#F5F5F7) y la otra #2C2C2E, ≥36 px", B.tDEC, [["Hikvision", true, "rgb(245, 245, 247)", true], ["Dahua", false, "rgb(44, 44, 46)", true]]);
    eq("sin opciones: «Sí» / «Todavía no» (t.decision y «esperando tu decisión»)", [B.tSIM.map(function (x) { return x[0]; }), B.tSAL.map(function (x) { return x[0]; })], [["Sí", "Todavía no"], ["Sí", "Todavía no"]]);
    eq("botón de micrófono «Contestar dictando» con ícono SVG, ≥36 px", B.mic, ["Contestar dictando", true, true]);

    /* ===== 3+4) responder: contestaDecision273, Aplicando… y Listo · lo que hizo ===== */
    var R = await p.evaluate(async function () { __CD.length = 0; __LL.length = 0;
      window.modelo({ tipo: "decision", entendi: "Autorizas la de Hikvision", hechos: [], decision_resuelta: true, que_toca: "Claude le confirma a Pepe",
        pasos: [{ quien: "IA", que: "Confirmarle a Pepe que va Hikvision", fecha: "2026-10-08", seguir: { en: "2026-10-08T09:00", a: "Pepe Instalador", texto: "IA: Pepe, va Hikvision." } }], campos: {} }, 300);
      home([DEC()]); document.querySelector('.f284[data-dec284="tDEC"] .p284p').click(); await espera(40);
      var antes = estado("tDEC"), T = tareas[0], enc = (T.encargos || []).map(function (e) { return [e.tipo, e.estado]; });
      for (var i = 0; i < 30; i++) { await espera(100); if (tareas[0].decision.aplicado38) break; } await espera(30);
      return { cd: __CD.slice(), modos: __LL.map(function (l) { return l.modo; }), antes: antes, enc: enc, despues: estado("tDEC"), sec: !!document.querySelector('.sc284[aria-label="Decide tú"]'), cuenta: (document.querySelector('.sc284[aria-label="Decide tú"] .hd284 em') || {}).textContent || "",
        q: (document.querySelector('.f284[data-dec284="tDEC"] .f284q') || {}).textContent, cont: (document.querySelector(".cont284 > summary") || {}).textContent || "", plegada: !!document.querySelector('.cont284:not([open]) .f284[data-dec284="tDEC"]') }; });
    eq("el botón contesta por contestaDecision273 con la opción", R.cd, [["tDEC", "Hikvision"]]);
    eq("mientras se aplica: «Aplicando…» en gris, sin botones, con el encargo decision_resp", [R.antes, R.enc], [{ e: "aplicando", txt: "Aplicando…", color: "rgb(142, 142, 147)", svg: false, botones: 0 }, [["decision_resp", "pendiente"]]]);
    eq("aplicado: «Listo · <lo que hizo>» en verde con palomita (de la nota Hice: …)", [R.modos, R.despues && R.despues.e, R.despues && /^Listo · Claude le escribe a Pepe/.test(R.despues.txt), R.despues && R.despues.color, R.despues && R.despues.svg], [["rapido"], "listo", true, "rgb(48, 209, 88)", true]);
    eq("ya listo: la fila YA NO enseña la pregunta/recomendación vieja, sino el próximo paso actualizado (que_toca)", R.q, "Claude le confirma a Pepe");
    eq("ya contestada sale de «Decide tú» al instante: solo un renglón plegado «1 contestada hoy · ver»", [R.sec, R.cuenta, R.cont, R.plegada], [false, "", "1 contestada hoy · ver", true]);

    /* falla: Pendiente de aplicar, nunca Listo; luego la Mac pone aplicado38 con su nota */
    var F = await p.evaluate(async function () { window.modelo("caido", 30); home([DEC()]); document.querySelector('.f284[data-dec284="tDEC"] .p284:not(.p284p)').click(); await espera(20);
      var a = estado("tDEC"); await espera(200); var b = estado("tDEC"), T = tareas[0];
      T.decision.aplicado38 = { ts: Date.now(), resp_ts: T.decision.respuesta.ts }; T.decision.resuelta = true;
      T.msgs.push({ k: "bi", t: "IA: Entendí: va la de Dahua · Hice: le pido a Pepe fecha de instalación", ts: Date.now(), h: "21:31", origen: "ia", canal: "priv:salvador", nota_claude: 1, orden38: "k1" });
      render(); await espera(20); var c = estado("tDEC");
      T.decision.aplicado38.ts = Date.now() - 25 * 3600000; render(); await espera(20);
      return { a: a.txt, b: b.txt, bListo: /Listo/.test(b.txt), c: c.txt, fuera: !document.querySelector(".f284"), sec: !!document.querySelector('.sc284[aria-label="Decide tú"]') }; });
    eq("sin red: «Aplicando…» y luego «Pendiente de aplicar» (nunca «Listo»)", [F.a, F.b, F.bListo], ["Aplicando…", "Pendiente de aplicar", false]);
    eq("con aplicado38 de la Mac: «Listo · le pido a Pepe fecha de instalación»", F.c, "Listo · le pido a Pepe fecha de instalación");
    eq("a las 24 h la resuelta se quita y, sin decisiones, la sección no aparece", [F.fuera, F.sec], [true, false]);

    /* «esperando tu decisión» (pendiente_info): el botón crea t.decision y va por el mismo camino; aplicado limpia pendiente_tipo */
    var S = await p.evaluate(async function () { __CD.length = 0; window.modelo({ tipo: "decision", entendi: "Vas tú solo", hechos: [], decision_resuelta: true, que_toca: "Salvador va solo a la reunión del viernes", pasos: [{ quien: "Salvador", que: "Ir a la reunión del viernes", fecha: "2026-10-09", seguir: null }], campos: {} }, 50);
      home([SAL()]); document.querySelector('.f284[data-dec284="tSAL"] .p284p').click(); await espera(400); var T = tareas[0];
      return { cd: __CD.slice(), preg: T.decision && T.decision.pregunta, ap: !!(T.decision && T.decision.aplicado38), pt: T.pendiente_tipo, e: (estado("tSAL") || {}).e }; });
    eq("«esperando tu decisión»: el botón contesta por contestaDecision273 y, aplicado, se limpia como «Ya decidí»", S, { cd: [["tSAL", "Sí"]], preg: "¿Vas tú solo a la reunión del viernes?", ap: true, pt: "", e: "listo" });

    /* ===== 5) lo que no es decisión: filas limpias con chevron, sin botones; sin decisiones no hay «Decide tú» ===== */
    var N = await p.evaluate(function () { home([FALTA()]); var s = [].slice.call(document.querySelectorAll(".sc284:not(.hist285)"));   /* build 285: «Tu historial» también usa el bloque 284 */
      var r = s.map(function (x) { return x.getAttribute("aria-label"); }), bl = document.querySelector(".bl284.l284");
      return { secs: r, botones: document.querySelectorAll(".bl284 .p284, .bl284 .p284m").length, chev: !!(bl && bl.querySelector(".revr > svg")), bg: bl && getComputedStyle(bl).backgroundColor,
        fila: bl && getComputedStyle(bl.querySelector(".revr")).backgroundColor }; });
    eq("sin decisiones no sale «Decide tú»; lo demás en «Te pregunta Doit» limpio, con chevron y sin botones", N, { secs: ["Te pregunta Doit"], botones: 0, chev: true, bg: "rgb(28, 28, 30)", fila: "rgba(0, 0, 0, 0)" });
    var V = await p.evaluate(function () { home([base("tX", "Nada pendiente", { ritmo: "cada lunes" })])   /* completa: fecha y próximo seguimiento */; return !!document.querySelector(".sc284:not(.hist285)"); });
    eq("sin nada que preguntar la sección no aparece", V, false);

    /* picar la fila abre la tarea; el micrófono abre el dictado de esa decisión */
    var O = await p.evaluate(async function () { home([DEC()]); document.querySelector('.f284[data-dec284="tDEC"] .f284h').click(); await espera(30); var a = [vista, abierta];
      var dict = null; arrancaDictadoRev = function (btn) { dict = btn.id; };
      home([DEC()]); document.querySelector('.f284[data-dec284="tDEC"] .p284m').click(); await espera(150);
      return { abre: a, mic: [vista, abierta, !!document.getElementById("cp273d"), dict], cd: __CD.length }; });
    eq("picar la fila abre la tarea", O.abre, ["hilo", "tDEC"]);
    eq("el micrófono abre la tarea y arranca el dictado de la respuesta a la decisión", O.mic, ["hilo", "tDEC", true, "dec273m"]);

    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) console.log("FALLAS:\n" + malas.join("\n")); else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
