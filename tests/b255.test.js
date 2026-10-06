#!/usr/bin/env node
/* PRUEBAS build 251 (Salvador 6-oct 07:54 y 07:58). a 390 px, reloj fijo 2026-10-06 07:20 (Torreón).
   1) Mover > "Tarea nueva": ventanita "Nombre de la tarea nueva" con sugerencia del MENSAJE (nunca el nombre de la tarea de origen), Crear / Cancelar;
      al crear, la app va a la tarea nueva con el mensaje adentro. Caminos: Mover (globo/Te pregunta), Acomodo (botón Nueva), lote y barra de selección.
   2) Vista de revisión: TODO dictado va al cerebro del 238 (el mensaje que pide lo arma el cerebro, no sale tal cual al WhatsApp); mientras trabaja
      la pantalla se difumina con "Claude está acomodando…"; al terminar se libera YA REFRESCADA (aunque el snapshot haya reemplazado los objetos).
   3) Preguntas del cerebro en su ventanita: una por renglón, con botones o campo; las de persona autocompletan con TODOS los contactos de la app;
      al contestar todas se aplican, se programa y queda refrescada.
   Correr: node tests/b249.test.js (CAP=<carpeta> para capturas) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 255", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 255, true);
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
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; window.__WA = []; window.__agendaNo = 1;
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.NOW = Date.now(); document.getElementById("app").style.display = "flex"; window.__srlog = 0;
      window.FIDE = function () { return { id: "tRELOJ", nombre: "Reloj Checador Casa", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_fija: true, fecha_dictada: true, contexto: "Instalar el reloj checador en la casa.", wa_contactos: [], msgs: [],
        hecho238: { ts: 1, hecho: ["Fecha límite: 20 oct"], falta: [{ k: "txt", q: "¿Cuándo te recuerdo antes de la fecha límite?", ops: [] }, { k: "txt", q: "¿El próximo seguimiento?", ops: [] }] } }; };
      window.__SRS = []; window.__micOK = true; window.SpeechRecognition = window.webkitSpeechRecognition = function () { var o = this; o.start = function () { __SRS.push(o); o.on = true; }; o.stop = function () { o.on = false; if (o.onend) o.onend(); }; o.abort = o.stop; };
      window.dicta255 = function (v) { var tx = document.getElementById("txt"); tx.value = v; document.getElementById("tenv").click(); };
      window.abre = function (T, extra) { tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; render(); };
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; setTimeout(function () { cb(JSON.stringify(j)); }, ms || 20); }; };
    });

    var limpia = async function () { await p.evaluate(function () { [].forEach.call(document.querySelectorAll("#preg249,#acom249,#hoja254,#dictacapa,.leemask,.cnlbg,.cnlsheet"), function (e) { e.remove(); }); window.__oyendo = false; window.__SRS.length = 0; window.__pq255Last = null; window.__preg255 = null; __WA.length = 0; }); };
    /* 1) al entrar: bloque difuminado con las preguntas en texto; sin tarjeta ni botón */
    var r1 = await p.evaluate(async function () { tareas = [FIDE()]; abierta = null; vista = "lista"; render(); abierta = "tRELOJ"; vista = "hilo"; render(); await espera(60); var m = document.getElementById("preg249"), cs = m ? getComputedStyle(m) : null;
      return { hay: !!m, blur: cs ? /blur/.test(cs.backdropFilter || cs.webkitBackdropFilter || "") : false, titulo: m ? m.querySelector("h3").textContent : "", items: m ? [].map.call(m.querySelectorAll("ol li"), function (x) { return x.textContent; }) : [], num: m ? m.querySelector("ol").tagName : "", campos: m ? m.querySelectorAll("input,textarea").length : -1, boton249: !!document.querySelector("[data-hc249]"), meFalta: /Me falta/.test((document.querySelector(".hc238") || { textContent: "" }).textContent), tarjetaHecho: !!document.querySelector(".hc238"), chip: (document.querySelector('[data-chip="falta"]') || {}).textContent }; });
    eq("Al entrar: bloque con blur, título con el nombre de la tarea y las preguntas numeradas en texto (sin campos)", [r1.hay, r1.blur, r1.titulo, r1.items, r1.num, r1.campos], [true, true, "Contéstame por favor estas preguntas sobre Reloj Checador Casa", ["¿Cuándo te recuerdo antes de la fecha límite?", "¿El próximo seguimiento?"], "OL", 0]);
    eq("Ya no hay tarjeta 'Me falta' ni botón 'Contestar mis preguntas'; el chip dice 'Falta 2'", [r1.boton249, r1.meFalta, r1.chip], [false, false, "Falta 2 ›"]);
    await foto("b255-1-bloque.png");
    /* 2) el micrófono arrancó SOLO al entrar (mismo toque) y la barra normal queda libre abajo */
    var r2 = await p.evaluate(function () { var tx = document.getElementById("txt"), r = tx.getBoundingClientRect(), x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2), m = document.getElementById("preg249"), cr = m.getBoundingClientRect();
      return { mic: __SRS.length, oyendo: !!window.__oyendo, barraLibre: !m.contains(x), bloqueArribaDeLaBarra: cr.bottom <= r.top + 2, txt: !!tx }; });
    eq("Al entrar el micrófono arranca solo (1 sola escucha) y la barra (cuadro + micrófono) queda libre y habilitada", r2, { mic: 1, oyendo: true, barraLibre: true, bloqueArribaDeLaBarra: true, txt: true });
    /* 3) Después cierra; el chip lo vuelve a abrir (y arranca el mic en ese toque) */
    await p.evaluate(function () { document.querySelector('#preg249 [data-pq255="later"].pq255d').click(); });
    var r3 = await p.evaluate(function () { return { hay: !!document.getElementById("preg249"), oyendo: !!window.__oyendo, chip: !!document.querySelector('[data-chip="falta"]') }; });
    eq("'Después' cierra el blur (y detiene el dictado); queda el chip 'Falta N'", r3, { hay: false, oyendo: false, chip: true });
    await p.evaluate(function () { document.getElementById("dictacapa") && document.getElementById("dictacapa").remove(); window.__SRS.length = 0; document.querySelector('[data-chip="falta"]').click(); });
    var r3b = await p.evaluate(function () { return { hay: !!document.getElementById("preg249"), mic: __SRS.length, oyendo: !!window.__oyendo }; });
    eq("El chip 'Falta N' vuelve a abrir el bloque y el micrófono arranca en ese toque", r3b, { hay: true, mic: 1, oyendo: true });
    /* X y tocar fuera */
    await p.evaluate(function () { document.querySelector("#preg249 .pq255x").click(); });
    eq("La X lo cierra", await p.evaluate(function () { return !document.getElementById("preg249"); }), true);
    await limpia(); await p.evaluate(function () { abre(FIDE()); }); await p.waitForTimeout(60);
    await p.evaluate(function () { var m = document.getElementById("preg249"); m.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
    eq("Tocar fuera lo cierra", await p.evaluate(function () { return !document.getElementById("preg249"); }), true);
    /* 4) un solo dictado contesta todo; blur con loader mientras procesa; refresca */
    await limpia();
    var r4 = await p.evaluate(async function () { var T = FIDE(); abre(T); await espera(50); window.__PROMPTS = [];
      var reparto = { respuestas: [{ n: 1, r: "el jueves a las 9" }, { n: 2, r: "el lunes" }] };
      preguntaAClaude = function (msgs, mod, cb) { window.__PROMPTS.push([mod, msgs[0].content]); var rep = /Reparte su respuesta/.test(msgs[0].content); setTimeout(function () { cb(JSON.stringify(rep ? reparto : { tipo: "tarea", fecha: null, contexto: "Instalar el reloj checador en la casa. Recordar el jueves a las 9 y seguimiento el lunes.", recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null })); }, 400); };
      dicta255("recuérdame el jueves a las 9 y el seguimiento el lunes"); await espera(120);
      var durante = { loader: !!document.getElementById("acom249"), bloque: !!document.getElementById("preg249"), caja: document.getElementById("txt").value };
      await espera(1800);
      var V = tareas[0], m = document.getElementById("preg249");
      return { durante: durante, modos: window.__PROMPTS.map(function (x) { return x[0]; }), ctx: /¿Cuándo te recuerdo antes de la fecha límite\?/.test(window.__PROMPTS[0][1]) && /1\. /.test(window.__PROMPTS[0][1]) && /2\. ¿El próximo seguimiento\?/.test(window.__PROMPTS[0][1]) && /recuérdame el jueves a las 9 y el seguimiento el lunes/.test(window.__PROMPTS[0][1]), brain: /Respuesta a «¿Cuándo te recuerdo antes de la fecha límite\?»: el jueves a las 9\./.test((window.__PROMPTS[1] || [0, ""])[1]) && /Respuesta a «¿El próximo seguimiento\?»: el lunes\./.test((window.__PROMPTS[1] || [0, ""])[1]),
        despues: { loader: !!document.getElementById("acom249"), bloque: !!m, falta: ((V.hecho238 || {}).falta || []).length }, contexto: /jueves a las 9/.test(V.contexto || ""), nota: (V.msgs || []).some(function (x) { return x.resp_preguntas255; }) }; });
    eq("Durante: blur con loader, el bloque ya no está y la caja queda vacía", r4.durante, { loader: true, bloque: false, caja: "" });
    eq("Se manda al cerebro en modo pesado: primero reparte (con las preguntas como contexto), luego aplica", [r4.modos, r4.ctx, r4.brain], [["pesado", "pesado"], true, true]);
    eq("Al terminar: sin loader, sin bloque, sin preguntas pendientes y refrescada con lo dicho", [r4.despues, r4.contexto, r4.nota], [{ loader: false, bloque: false, falta: 0 }, true, true]);
    await foto("b255-2-listo.png");
    /* 5) contesta solo una: se queda SOLO la otra en el bloque */
    await limpia();
    var r5 = await p.evaluate(async function () { var T = FIDE(); abre(T); await espera(50);
      preguntaAClaude = function (msgs, mod, cb) { var rep = /Reparte su respuesta/.test(msgs[0].content); setTimeout(function () { cb(JSON.stringify(rep ? { respuestas: [{ n: 1, r: "el jueves a las 9" }, { n: 2, r: null }] } : { tipo: "tarea", fecha: "2026-10-08", recordar: [{ fecha: "2026-10-08", hora: "09:00" }], vinculos: [], ordenes: [], dudas: [], pregunta: null })); }, 20); };
      dicta255("recuérdame el jueves a las 9"); await espera(1800);
      var m = document.getElementById("preg249"); return { bloque: !!m, items: m ? [].map.call(m.querySelectorAll("ol li"), function (x) { return x.textContent; }) : [], chip: (document.querySelector('[data-chip="falta"]') || {}).textContent }; });
    eq("Quedó una sin contestar: en el mismo bloque queda solo esa (y el chip dice Falta 1)", [r5.bloque, r5.items, r5.chip], [true, ["¿El próximo seguimiento?"], "Falta 1 ›"]);
    /* 6) el reparto falla: nada se pierde */
    await limpia();
    var r6 = await p.evaluate(async function () { var T = FIDE(); abre(T); await espera(50); preguntaAClaude = function (msgs, mod, cb) { setTimeout(function () { cb(null, "sin red"); }, 20); };
      dicta255("el jueves a las 9 y el lunes"); await espera(300);
      var m = document.getElementById("preg249"); return { bloque: !!m, loader: !!document.getElementById("acom249"), caja: document.getElementById("txt").value, falta: ((tareas[0].hecho238 || {}).falta || []).length }; });
    eq("Si el cerebro no contesta: el bloque vuelve, el texto regresa a la caja y no se pierde ninguna pregunta", r6, { bloque: true, loader: false, caja: "el jueves a las 9 y el lunes", falta: 2 });
    /* 7) salir de la tarea cierra el bloque; al volver a entrar sale otra vez */
    await limpia();
    var r7 = await p.evaluate(async function () { abre(FIDE()); await espera(40); var a = !!document.getElementById("preg249"); vista = "lista"; abierta = null; render(); await espera(40); var b = !!document.getElementById("preg249"); abierta = "tRELOJ"; vista = "hilo"; render(); await espera(40); return [a, b, !!document.getElementById("preg249")]; });
    eq("Entrar abre el bloque, salir lo cierra, volver a entrar lo abre otra vez", r7, [true, false, true]);
    /* 8) sin preguntas pendientes no sale nada */
    await limpia();
    eq("Sin preguntas pendientes no hay bloque ni chip", await p.evaluate(async function () { var T = FIDE(); T.hecho238 = { ts: 1, hecho: ["x"], falta: [] }; abre(T); await espera(40); return [!!document.getElementById("preg249"), !!document.querySelector('[data-chip="falta"]')]; }), [false, false]);
    /* 9) pregunta de persona y de opciones salen en texto con sus opciones */
    await limpia();
    var r9 = await p.evaluate(async function () { var T = FIDE(); T.quien_dudas = [{ id: "q1", dicho: "Fernando", rol: "mensaje", cands: [{ id: "ext:Fernando Fuentes BBVA", nombre: "Fernando Fuentes BBVA" }, { id: "ext:Fernando Ruiz BBVA", nombre: "Fernando Ruiz BBVA" }], extra: {}, ts: 1 }]; abre(T); await espera(50);
      var m = document.getElementById("preg249"); return [].map.call(m.querySelectorAll("ol li"), function (x) { return x.textContent; }); });
    eq("Las de persona traen sus candidatos en el texto", r9[0], "¿Quién es Fernando?(Fernando Fuentes BBVA · Fernando Ruiz BBVA)");
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? "FALLAS:\n" + malas.join("\n") : "todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
