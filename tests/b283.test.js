#!/usr/bin/env node
/* PRUEBAS build 283 (especificación app-fix-dictado.md, casos «Comedor Nuevo» 7-oct 21:30 y «Cobranza Moric» 21:20). 390 px, reloj fijo
   mié 2026-10-07 21:30 (Monterrey).
   1) Velocidad: dictados / indicaciones a Claude en "rapido" (corte 8 s, sin reintento), prompt recortado (10 días, sin 30 tareas), sin
      pantalla difuminada y con respuesta optimista; «Falta info» sigue en "pesado" (21 días).
   2) Ninguna orden se pierde: si el modelo no resuelve o se cae, queda de encargo (t.encargos, origen app283) y nunca «dímelo otra vez».
   3) Con el cuadro «Indicación para Claude…», «dile que mañana…» sin nombre va a Claude ANTES de programaWA (nunca «No programé nada»).
   4) Respuesta a «Decide tú»: encargo decision_resp + clasificador rápido; con red queda resuelta, aplicado38, que_toca y un paso IA con
      seguir; sin red se ve «Pendiente de aplicar» hasta que la Mac pone aplicado38, y entonces «Aplicado.» con su nota.
   5) falta_paso_claude (Mac 18z37) cuenta como «falta» y su pregunta sale en Falta info.
   Correr: node tests/b283.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 283", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 283, true);
eq("sw.js con versión >= 283", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 283, true);
eq("el corte de 25 s queda solo para pesado; el rápido corta a los 8 s y no reintenta", [/\(modelo==="rapido"\)\?8000:25000/.test(html), /intento<1 && modelo!=="rapido"/.test(html)], [true, true]);
eq("ya no existen «No pesqué datos nuevos; dímelo otra vez» ni «No cambié nada: no me quedó claro qué hacer. Dímelo otra vez.»", [html.indexOf("No pesqué datos nuevos"), html.indexOf("no me quedó claro qué hacer. Dímelo otra vez")], [-1, -1]);
eq("sin reintento en serie del 251 en completaRevision", /_lanza251\(promptRevision\(t, v, _ab\)\+refuerzo251/.test(html), false);
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
      window.__WA = []; window.__agendaNo = 1; window.__LL = [];
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.NOW = Date.now(); document.getElementById("app").style.display = "flex";
      window.abre = function (T, extra) { [].forEach.call(document.querySelectorAll("#preg249,#hoja254,#acom249,#det242,#mov225,.leemask,.cnlbg,.cnlsheet"), function (e) { e.remove(); });
        window.__dest254 = {}; tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; render(); };
      window.envia = function (v) { var tx = document.getElementById("txt"); tx.value = v; document.getElementById("tenv").click(); };
      /* modelo: j = objeto (contesta en ms) | "caido" (error) ; guarda cada llamada */
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { __LL.push({ modo: mod, prompt: msgs[0].content, t: Date.now() });
        setTimeout(function () { if (j === "caido") cb(null, "No contesto a tiempo."); else cb(JSON.stringify(typeof j === "function" ? j(msgs[0].content) : j)); }, ms || 20); }; };
      window.COMEDOR = function () { return { id: "tCOM", nombre: "Comedor Nuevo", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
        f_vigente: "2026-10-30", f_original: "2026-10-30", fecha_dictada: true, contexto: "Mesa del comedor nuevo en mármol con Manuel Parra (piedra); falta la cotización final.",
        wa_contactos: [{ nombre: "Manuel Parra", desde: 1 }],
        resumen: { que_toca: "Esperando la cotización de Manuel", plan: [{ id: "m1", quien: "Manuel Parra", que: "Mandar la cotización del mármol", estado: "pendiente", origen: "mac", fecha: "2026-10-09" }] },
        msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: Mañana le mando la cotización", ts: NOW - 3600000, h: "20:30", wa_id: "w1" }] }; };
      window.MORIC = function () { return { id: "tMOR", nombre: "Cobranza Moric", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
        f_vigente: "2026-10-15", f_original: "2026-10-15", fecha_dictada: true, contexto: "Cobrar al Moric la cena del 26 de septiembre; el gerente es Rodrigo.",
        wa_contactos: [{ nombre: "Rodrigo Moric", desde: 1 }], msgs: [] }; };
    });

    /* ===== 1) preguntaAClaude: el rápido corta a los 8 s y no reintenta ===== */
    var T8 = await p.evaluate(async function () { var llam = 0, t0 = Date.now(), res = null;
      window.fetch = function (u, o) { llam++; return new Promise(function (ok, no) { if (o && o.signal) o.signal.addEventListener("abort", function () { no(new Error("abort")); }); }); };
      APP_TOKEN = "tok"; preguntaAClaude([{ role: "user", content: "x" }], "rapido", function (tx, err) { res = { err: err, ms: Date.now() - t0 }; });
      await espera(9000); return { llam: llam, err: res && res.err, ms: res ? Math.round(res.ms / 1000) : null }; });
    eq("rápido: corta a los 8 s, una sola llamada (sin reintento)", T8, { llam: 1, err: "No contesto a tiempo.", ms: 8 });

    /* ===== 3) Comedor: «Indicación para Claude…» + «dile que mañana…» sin nombre -> Claude, no «No programé nada» ===== */
    var C = await p.evaluate(async function () { __LL.length = 0; window.modelo({ tipo: "tarea", ordenes: [], dudas: [], recordar: [], vinculos: [], entendi: "Que Manuel mande mañana la cotización",
        pasos: [{ quien: "IA", que: "Pedirle a Manuel la cotización del mármol", fecha: "2026-10-08", seguir: { en: "2026-10-08T10:00", a: "Manuel Parra", texto: "IA: Manuel, ¿me compartes hoy la cotización del mármol?" } }],
        que_toca: "Claude le pide a Manuel la cotización mañana a las 10" }, 300);
      var T = COMEDOR(); abre(T); var ph = document.getElementById("txt").getAttribute("data-ph");
      envia("dile que mañana me mande la cotización del mármol para la mesa");
      await espera(60); var durante = { overlay: !!document.getElementById("acom249"), caja: document.getElementById("txt").value, toast: (document.getElementById("toast") || {}).textContent || "" };
      await espera(700); var V = tareas[0], R = V.resumen || {};
      var dict = (V.msgs || []).filter(function (m) { return m.k === "bo" && /dile que mañana/.test(m.t || ""); })[0] || {};
      var nuevo = (R.plan || []).filter(function (x) { return x.origen === "salvador37"; })[0] || null;
      return { ph: ph, durante: durante, noProg: (V.msgs || []).some(function (m) { return /No program[eé] nada/.test(m.t || ""); }), modos: __LL.map(function (l) { return l.modo; }),
        contrato: [dict.k, dict.de, dict.canal, !!(dict.dict238 || dict.nota_claude || dict.completa_info)],
        pr: (function (q) { var cal = (q.match(/\d{4}-\d{2}-\d{2} (lunes|martes|miércoles|jueves|viernes|sábado|domingo)/g) || []).length; return { cal: cal, plan: /PLAN ACTUAL[\s\S]*m1 \| Manuel Parra \| Mandar la cotización/.test(q), contactos: /CONTACTOS DE LA TAREA: Manuel Parra/.test(q), sinTareas: /TAREAS ABIERTAS \(id \| nombre\):\n\(ninguna\)/.test(q), sinPalabras: !/- palabras:/.test(q) }; })((__LL[0] || {}).prompt || ""),
        plan: (R.plan || []).map(function (x) { return x.id.slice(0, 4) + ":" + x.origen; }), nuevo: nuevo && [nuevo.quien, nuevo.estado, nuevo.requiere_autorizacion, nuevo.dicho_ts === dict.ts, nuevo.fecha, nuevo.seguir],
        que_toca: R.que_toca, hecho: ((V.hecho238 || {}).hecho || []), WA: __WA.length }; });
    eq("Comedor: el cuadro dice «Indicación para Claude…»", C.ph, "Indicación para Claude…");
    eq("Comedor: no sale «No programé nada»; va al cerebro en rápido", [C.noProg, C.modos], [false, ["rapido"]]);
    eq("Latencia: el dictado no difumina la pantalla, la caja queda libre y responde en el acto «Entendido, lo aplico…»", C.durante, { overlay: false, caja: "", toast: "Entendido, lo aplico…" });
    eq("Contrato con la Mac: el dictado queda bo + de + canal priv + marca", C.contrato, ["bo", "salvador", "priv:salvador", true]);
    eq("Prompt rápido: 10 días de calendario, plan / contactos de la tarea, sin lista de tareas ni reglas de etiquetas", C.pr, { cal: 10, plan: true, contactos: true, sinTareas: true, sinPalabras: true });
    eq("El paso nuevo (origen salvador37) entra antes del primer paso pendiente que no es suyo", C.plan, ["a283:salvador37", "m1:mac"]);
    eq("Formato del paso (igual que la Mac): quien IA, pendiente, sin autorización, dicho_ts del dictado, fecha y seguir con hora de Monterrey", C.nuevo,
      ["IA", "pendiente", false, true, "2026-10-08", { en: "2026-10-08T10:00:00-06:00", a: "Manuel Parra", texto: "IA: Manuel, ¿me compartes hoy la cotización del mármol?" }]);
    eq("«En qué vamos» queda al día", C.que_toca, "Claude le pide a Manuel la cotización mañana a las 10");
    eq("La tarjeta Hecho dice el paso («Claude le escribe a Manuel el … a las 10:00: …») y en qué vamos", [C.hecho.length, /^Claude le escribe a Manuel el .+ a las 10:00: Pedirle a Manuel la cotización del mármol$/.test(C.hecho[0] || ""), C.hecho[1]], [2, true, "En qué vamos: Claude le pide a Manuel la cotización mañana a las 10"]);
    eq("No sale ningún WhatsApp directo (el «seguir» lo manda la Mac en su día)", C.WA, 0);

    /* ===== 2) Moric: modelo caído -> nunca «dímelo otra vez»; queda de encargo y el texto dice que lo pasa a Claude ===== */
    var M = await p.evaluate(async function () { __LL.length = 0; window.modelo("caido", 40); var T = MORIC(); abre(T);
      envia("Claude, pídele a Rodrigo que me confirme hoy el pago de la cena y si no paga esta semana me avisas para hablar con el dueño del Moric");
      await espera(800); var V = tareas[0];
      var bi = (V.msgs || []).filter(function (m) { return m.k === "bi" && !m.origen; }).map(function (m) { return m.t; });
      return { modos: __LL.map(function (l) { return l.modo; }), dimelo: bi.some(function (x) { return /d[ií]melo otra vez|No pesqu|No program[eé] nada/i.test(x); }), paso: bi.some(function (x) { return /lo paso a Claude|Claude lo termina/.test(x); }),
        nocambie: bi.some(function (x) { return /No cambié nada/.test(x); }),
        enc: (V.encargos || []).filter(function (e) { return e.origen === "app283"; }).map(function (e) { return [e.tipo, e.estado, e.motivo, /pídele a Rodrigo/.test(e.t)]; }),
        marcado: (V.msgs || []).some(function (m) { return m.k === "bo" && m.de === "salvador" && m.canal === "priv:salvador" && (m.dict238 || m.nota_claude) && /pídele a Rodrigo/.test(m.t || ""); }) }; });
    eq("Moric con el modelo caído: una sola llamada rápida, nunca «dímelo otra vez» / «No pesqué»", [M.modos, M.dimelo], [["rapido"], false]);
    eq("Moric: el texto dice que Claude lo termina (y la Mac lo reconoce como «No cambié nada»)", [M.paso, M.nocambie], [true, true]);
    eq("Moric: la orden queda de encargo para la Mac y el mensaje queda marcado", [M.enc, M.marcado], [[["orden", "pendiente", "ia_caida", true]], true]);

    /* 2b) sin resultado (el modelo contesta vacío): encargo, sin reintento */
    var S = await p.evaluate(async function () { __LL.length = 0; window.modelo({ tipo: null, ordenes: [], dudas: [], pasos: [], que_toca: null }, 20); var T = MORIC(); T.id = "tMOR2"; abre(T);
      envia("Claude, revisa con calma lo de la cobranza del Moric y acomódalo como mejor convenga para que quede esta semana");
      await espera(700); var V = tareas[0];
      return { n: __LL.length, enc: (V.encargos || []).filter(function (e) { return e.origen === "app283"; }).map(function (e) { return [e.tipo, e.motivo]; }), modal: !!document.getElementById("preg249"),
        dimelo: (V.msgs || []).some(function (m) { return /d[ií]melo otra vez|No pesqu/i.test(m.t || ""); }) }; });
    eq("Sin resultado: 1 llamada, encargo «sin_resultado», sin tarjeta ni «dímelo otra vez»", S, { n: 1, enc: [["orden", "sin_resultado"]], modal: false, dimelo: false });

    /* 1b) «Falta info» sigue en pesado (21 días, con overlay) */
    var F = await p.evaluate(async function () { __LL.length = 0; window.modelo({ tipo: "tarea", ordenes: [], dudas: [], contexto: "Revisar la bomba del jardín que hace ruido; la revisa el jardinero." }, 300);
      var T = { id: "tNEW", nombre: "Bomba jardín", duenio: "salvador", creada_por: "salvador", estado: "abierta", por_autorizar: true, msgs: [{ k: "bo", de: "salvador", t: "la bomba del jardín hace ruido", ts: NOW - 60000, h: "21:29" }] };
      abre(T); var falta = tipoRevisar(T); completaRevision(T, "es la bomba del jardín, la revisa el jardinero el sábado"); await espera(60);
      var ov = !!document.getElementById("acom249"); await espera(700);
      var q = (__LL[0] || {}).prompt || ""; return { falta: falta, modo: __LL.map(function (l) { return l.modo; }), ov: ov, cal: (q.match(/\d{4}-\d{2}-\d{2} (lunes|martes|miércoles|jueves|viernes|sábado|domingo)/g) || []).length }; });
    eq("Falta info / tarea nueva: cerebro pesado con overlay y 21 días de calendario", F, { falta: "falta", modo: ["pesado"], ov: true, cal: 21 });

    /* ===== 4) «Decide tú» con red: aplicado en <= 3 s ===== */
    var DEC = function () { return { id: "tDEC", nombre: "Cámaras bodega", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
      f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_dictada: true, contexto: "Cámaras para la bodega; dos cotizaciones: Dahua y Hikvision.", wa_contactos: [{ nombre: "Pepe Instalador", desde: 1 }],
      decision: { pregunta: "¿Cuál cotización autorizo?", recomendacion: "Dahua: cumple todo y es la más barata.", opciones: [{ nombre: "Dahua", recomendada: true }, { nombre: "Hikvision" }] },
      resumen: { plan: [] }, msgs: [] }; };
    await p.evaluate(function (f) { window.DEC = eval("(" + f + ")"); }, DEC.toString());
    var D1 = await p.evaluate(async function () { __LL.length = 0;
      window.modelo({ tipo: "decision", entendi: "Autorizas la de Dahua", hechos: [], decision_resuelta: true, que_toca: "Claude le confirma a Pepe la instalación de Dahua",
        pasos: [{ quien: "IA", que: "Confirmarle a Pepe que va la cotización de Dahua", fecha: "2026-10-08", seguir: { en: "2026-10-08T09:00", a: "Pepe Instalador", texto: "IA: Pepe, va la cotización de Dahua; ¿cuándo puedes instalar?" } }], campos: {} }, 200);
      var T = DEC(); abre(T); var t0 = Date.now(); contestaDecision(T, "Autorizo la de Dahua");
      var antes = ((document.querySelector("#cp273d .cp273ok span") || {}).textContent || "");
      var encAntes = (T.encargos || []).map(function (e) { return [e.tipo, e.estado]; });
      var V = null; for (var i = 0; i < 30; i++) { await espera(100); V = tareas.filter(function (x) { return x.id === "tDEC"; })[0]; if (V.decision.aplicado38) break; }
      var ms = Date.now() - t0; render(); await espera(30);
      var R = V.resumen || {}, P = (R.plan || [])[0] || {};
      return { modos: __LL.map(function (l) { return l.modo; }), antes: antes, encAntes: encAntes, ms3: ms <= 3000, resuelta: V.decision.resuelta, ap: V.decision.aplicado38 && [V.decision.aplicado38.resp_ts === V.decision.respuesta.ts, V.decision.aplicado38.por],
        que_toca: R.que_toca, paso: [P.quien, P.origen, !!P.seguir, P.seguir && P.seguir.en], enc: (V.encargos || []).map(function (e) { return [e.tipo, e.estado]; }),
        ui: ((document.querySelector("#cp273d .cp273ok span") || {}).textContent || ""), nota: ((document.querySelector("#cp273d .cp273n283") || {}).textContent || "") }; });
    eq("Decide tú: al contestar se ve «Pendiente de aplicar» (ya no «Claude lo aplica») y queda el encargo decision_resp", [D1.antes, D1.encAntes], ["Contestaste: «Autorizo la de Dahua». Pendiente de aplicar · Claude lo está aplicando…", [["decision_resp", "pendiente"]]]);
    eq("Decide tú con red: en <= 3 s, modo rápido, decisión resuelta y aplicado38 (resp_ts, por app)", [D1.modos, D1.ms3, D1.resuelta, D1.ap], [["rapido"], true, true, [true, "app"]]);
    eq("Decide tú con red: que_toca y un paso IA con seguir", [D1.que_toca, D1.paso], ["Claude le confirma a Pepe la instalación de Dahua", ["IA", "salvador37", true, "2026-10-08T09:00:00-06:00"]]);
    eq("Decide tú con red: el encargo se cierra y la capa dice «Aplicado.» con lo que cambió", [D1.enc, D1.ui, /^Entendí: Autorizas la de Dahua · Hice: .*Claude le escribe a Pepe/.test(D1.nota)], [[["decision_resp", "hecho"]], "Contestaste: «Autorizo la de Dahua». Aplicado.", true]);

    /* 4b) sin red: «aplicando…» hasta que la Mac pone aplicado38; luego «Aplicado.» con la nota de la Mac */
    var D2 = await p.evaluate(async function () { __LL.length = 0; window.modelo("caido", 30); var T = DEC(); abre(T); contestaDecision(T, "Que sea la de Hikvision"); await espera(300);
      var V = tareas[0]; render(); await espera(30);
      var o = { ui: ((document.querySelector("#cp273d .cp273ok span") || {}).textContent || ""), ap: !!V.decision.aplicado38, enc: (V.encargos || []).map(function (e) { return [e.tipo, e.estado]; }),
        bi: (V.msgs || []).filter(function (m) { return m.k === "bi"; }).length };
      /* la Mac (18z38) la aplica */
      V.decision.aplicado38 = { ts: Date.now(), resp_ts: V.decision.respuesta.ts }; V.decision.resuelta = true;
      V.msgs.push({ k: "bi", t: "IA: Entendí: va la de Hikvision · Hice: le pido a Pepe fecha de instalación", ts: Date.now(), h: "21:31", origen: "ia", canal: "priv:salvador", nota_claude: 1, orden38: "k1" });
      render(); await espera(30); V = tareas[0];
      o.ui2 = ((document.querySelector("#cp273d .cp273ok span") || {}).textContent || ""); o.nota2 = ((document.querySelector("#cp273d .cp273n283") || {}).textContent || "");
      o.enc2 = (V.encargos || []).map(function (e) { return [e.tipo, e.estado]; });
      o.vig = indicacionVigente(V.msgs, V.msgs.length - 1, Date.now() + 1000, Date.now());
      return o; });
    eq("Decide tú sin red: se ve «aplicando…», sin aplicado38 y con el encargo pendiente para la Mac", [D2.ui, D2.ap, D2.enc, D2.bi], ["Contestaste: «Que sea la de Hikvision». Pendiente de aplicar · Claude lo está aplicando…", false, [["decision_resp", "pendiente"]], 0]);
    eq("Cuando la Mac pone aplicado38: «Aplicado.» con su nota y el encargo se cierra solo", [D2.ui2, D2.nota2, D2.enc2], ["Contestaste: «Que sea la de Hikvision». Aplicado.", "IA: Entendí: va la de Hikvision · Hice: le pido a Pepe fecha de instalación", [["decision_resp", "hecho"]]]);
    eq("La nota de la Mac (orden38) no se pliega hasta que la veas", D2.vig, true);

    /* ===== notaClaude: «Claude, dile que mañana…» sin contacto -> lo decide Claude (no «No programé nada»); IA caída -> encargo ===== */
    var N = await p.evaluate(async function () { __LL.length = 0; window.modelo("caido", 20); var T = MORIC(); T.id = "tNOT"; abre(T); notaClaude(T, "Claude, dile que mañana me mande el estado de cuenta"); await espera(300);
      var V = tareas[0], bi = (V.msgs || []).filter(function (m) { return m.k === "bi"; }).map(function (m) { return m.t; });
      return { modos: __LL.map(function (l) { return l.modo; }), noProg: bi.some(function (x) { return /No program[eé] nada|d[ií]melo otra vez|^Anotado\.$/.test(x); }), paso: bi.some(function (x) { return /lo paso a Claude/.test(x); }),
        enc: (V.encargos || []).filter(function (e) { return e.origen === "app283"; }).map(function (e) { return [e.tipo, e.motivo]; }) }; });
    eq("Nota a Claude sin contacto claro: va a Claude en rápido; con la IA caída queda de encargo, sin «No programé nada»", N, { modos: ["rapido"], noProg: false, paso: true, enc: [["orden", "nota_sin_accion"]] });

    /* ===== 5) falta_paso_claude -> «Falta info» con su pregunta ===== */
    var FP = await p.evaluate(function () { var T = COMEDOR(); T.id = "tFP"; tareas = [T];
      var a = tipoRevisar(T); T.falta_paso_claude = { pregunta: "¿Con quién confirmo la instalación de la mesa?", ts: Date.now() };
      var b = tipoRevisar(T), q = faltaPreciso(T)[0]; T.falta_paso_claude.estado = "resuelto"; var c = tipoRevisar(T); T.falta_paso_claude = true; var d = faltaPasoClaude(T);
      return { antes: a, con: b, q: q, resuelto: c, true_: d }; });
    eq("falta_paso_claude: cuenta como «falta» con su pregunta; resuelto ya no", FP, { antes: null, con: "falta", q: "¿Con quién confirmo la instalación de la mesa?", resuelto: null, true_: "¿Cuál es el siguiente paso de esta tarea?" });

    /* encargos de órdenes que la Mac ya convirtió en paso se cierran; los viejos vencen a las 24 h */
    var CE = await p.evaluate(function () { var T = MORIC(); T.encargos = [{ id: "e1", tipo: "orden", estado: "pendiente", origen: "app283", creado: Date.now() - 60000 }, { id: "e2", tipo: "orden", estado: "pendiente", origen: "app283", creado: Date.now() - 25 * 3600000 }, { id: "e3", tipo: "condicional", estado: "esperando", creado: 1 }];
      T.resumen = { plan: [{ id: "x", quien: "IA", que: "Pedir el pago", estado: "pendiente", origen: "salvador37", dicho_ts: Date.now() - 50000 }] };
      var ch = cierraEncargos(T); return [ch].concat(T.encargos.map(function (e) { return e.estado; })); });
    eq("cierraEncargos: convertido -> hecho, viejo -> vencido, los de la Mac no se tocan", CE, [true, "hecho", "vencido", "esperando"]);

    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) console.log("FALLAS:\n" + malas.join("\n")); else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
