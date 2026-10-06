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
eq("versión >= 253", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 253, true);
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
      window.NOW = Date.now();
      window.ORIGEN = function () { return { id: "tORIGEN", nombre: "Mantenimiento Casa Lerdo", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-12", f_original: "2026-10-12", fecha_dictada: true,
        contexto: "Mantenimiento de la casa de Lerdo: pintura, portón y jardín, con Carlos y Manuel.", ritmo: "Cada semana", wa_contactos: [{ nombre: "Carlos Ibarra", desde: 1 }],
        msgs: [{ k: "bi", wa_in: 1, wa_c: "Carlos Ibarra", t: "Carlos Ibarra: Oye ya llegó el material del portón eléctrico, te lo dejo mañana en la casa", ts: NOW - 3600000, h: "06:20", wa_id: "w1" },
               { k: "bi", wa_in: 1, wa_c: "Carlos Ibarra", t: "Carlos Ibarra: Y también te mando la cotización del motor", ts: NOW - 3500000, h: "06:21", wa_id: "w2" }] }; };
      window.abre = function (T, extra) { tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; render(); };
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; setTimeout(function () { cb(JSON.stringify(j)); }, ms || 20); }; };
    });

    /* 1) modos: todo el cerebro va en "pesado" */
    var src = html;
    eq("MODO_CEREBRO = pesado", /var MODO_CEREBRO="pesado"/.test(src), true);
    var usos = function (nombre) { var i = src.indexOf("function " + nombre); var j = src.indexOf("\nfunction ", i + 10); var cuerpo = src.slice(i, j); return [/preguntaAClaude\(\[\{role:"user"[^\n]*?MODO_CEREBRO/.test(cuerpo), /"rapido"/.test(cuerpo)]; };
    eq("completaRevision / nota a Claude / agregaContexto / barraEnviar / entrevista: modo pesado, ya no rapido", ["completaRevision", "ejecutaNotaClaude", "agregaContexto", "barraEnviar", "contestaEntrevista"].map(usos), [[true, false], [true, false], [true, false], [true, false], [true, false]]);
    await p.evaluate(function () { window.__FOC = []; var _f = HTMLElement.prototype.focus; document.addEventListener("click", function () { window.__inClick = true; setTimeout(function () { window.__inClick = false; }, 0); }, true);
      HTMLElement.prototype.focus = function () { window.__FOC.push([this.id || this.className || this.tagName, !!window.__inClick]); return _f.apply(this, arguments); };
      var base = function (o) { return Object.assign({ duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_dictada: true, contexto: "x", msgs: [] }, o); };
      window.MUNDO = function () { return [ ORIGEN(),
        base({ id: "tA", nombre: "Instalación de cámaras", palabras: ["seguridad"], sinonimos: ["videovigilancia"], contexto: "Cámaras en la bodega de Torreón" }),
        base({ id: "tB", nombre: "Pago de nómina", contexto: "Quincena del personal de la planta" }),
        base({ id: "tC", nombre: "Reparación del portón", contexto: "El portón eléctrico de la casa Lerdo" }),
        base({ id: "tD", nombre: "Revisión de planos de la ampliación", cierre: { f: fechaMty238(-5) }, estado: "cerrada" }),
        base({ id: "tE", nombre: "Planos viejos del terreno", cierre: { f: fechaMty238(-60) }, estado: "cerrada" }),
        base({ id: "tF", nombre: "Reunión de consejo Cumbres" }) ]; }; });
    var busca = async function (q) { await p.fill("#mbus253", q); await p.waitForTimeout(60); return await p.evaluate(function () { return { res: [].map.call(document.querySelectorAll("#mres253 .opt226 .ot"), function (x) { return x.textContent; }), props: document.getElementById("mops253").style.display, vacio: (document.querySelector("#mres253 .bus253x") || {}).textContent || "" }; }); };
    await p.evaluate(function () { tareas = MUNDO(); abierta = "tORIGEN"; vista = "hilo"; render(); abreMover225(tareas[0], 0); __FOC.length = 0; });
    var h = await p.evaluate(function () { return { campo: !!document.querySelector("#mov225 #mbus253"), ph: document.getElementById("mbus253").placeholder, lupa: !!document.querySelector("#mov225 [data-lupa253]"), arriba: document.querySelector("#mov225 .bus253").compareDocumentPosition(document.getElementById("mops253")) & 4 ? true : false }; });
    eq("La hoja trae el campo con lupa 'Buscar tarea…' arriba de la lista", h, { campo: true, ph: "Buscar tarea…", lupa: true, arriba: true });
    await p.click("[data-lupa253]"); await p.waitForTimeout(60);
    var f = await p.evaluate(function () { return { foc: __FOC.filter(function (x) { return x[0] === "mbus253"; }), act: document.activeElement && document.activeElement.id }; });
    eq("Tocar la lupa enfoca el campo DENTRO del toque", [f.foc, f.act], [[["mbus253", true]], "mbus253"]);
    await foto("b253-1-buscador-vacio.png");
    var r1 = await busca("camaras");
    eq("Busca sin acentos por nombre ('camaras' = Cámaras) y oculta las propuestas", [r1.res, r1.props], [["Instalación de cámaras"], "none"]);
    eq("Por sinónimo", (await busca("videovigilancia")).res, ["Instalación de cámaras"]);
    eq("Por palabra clave", (await busca("seguridad")).res, ["Instalación de cámaras"]);
    eq("Por contexto", (await busca("quincena")).res, ["Pago de nómina"]);
    eq("Todas las palabras deben estar (portón + lerdo)", (await busca("porton lerdo")).res, ["Reparación del portón"]);
    var r6 = await busca("planos");
    eq("Sin abiertas que coincidan, salen las cerradas (de cualquier antigüedad), marcadas 'cerrada'", r6.res, ["Planos viejos del terreno", "Revisión de planos de la ampliación"]);
    eq("Sin resultados: lo dice", (await busca("zzzz")).vacio, "No encontré “zzzz” en tus tareas.");
    var r8 = await busca("mantenimiento");
    eq("No ofrece la tarea de origen", r8.res.indexOf("Mantenimiento Casa Lerdo"), -1);
    await busca("camaras"); await foto("b253-2-resultado.png");
    var r9 = await busca("");
    eq("Campo vacío: vuelven las propuestas", r9.props, "");
    await busca("quincena");
    await p.click('#mres253 [data-movto="tB"]'); await p.waitForTimeout(150);
    var m1 = await p.evaluate(function () { var B = tareas.filter(function (x) { return x.id === "tB"; })[0]; return { hoja: !!document.getElementById("mov225"), origen: tareas[0].msgs[0].oculto === true, destino: (B.msgs || []).length }; });
    eq("Elegir un resultado = mover ahí (el mensaje queda oculto en el origen y pasa a esa tarea)", m1, { hoja: false, origen: true, destino: 1 });
    /* lote */
    var m2 = await p.evaluate(async function () { tareas = MUNDO(); abierta = "tORIGEN"; vista = "hilo"; render(); abreMover225(tareas[0], 0, [0, 1], { lote: true }); var i = document.getElementById("mbus253"); i.value = "videovigilancia"; i.dispatchEvent(new Event("input", { bubbles: true })); await espera(40);
      document.querySelector('#mres253 [data-movto="tA"]').click(); await espera(150); var A = tareas.filter(function (x) { return x.id === "tA"; })[0]; return { hoja: !!document.getElementById("mov225"), ocultos: tareas[0].msgs.filter(function (m) { return m.oculto; }).length, destino: (A.msgs || []).length }; });
    eq("En lote: el resultado mueve toda la selección", m2, { hoja: false, ocultos: 2, destino: 2 });
    /* cerrada */
    var m3 = await p.evaluate(async function () { tareas = MUNDO(); abierta = "tORIGEN"; vista = "hilo"; render(); abreMover225(tareas[0], 0); var i = document.getElementById("mbus253"); i.value = "ampliacion"; i.dispatchEvent(new Event("input", { bubbles: true })); await espera(40);
      document.querySelector('#mres253 [data-movto="tD"]').click(); await espera(150); return (tareas.filter(function (x) { return x.id === "tD"; })[0].msgs || []).length; });
    eq("Mover a una cerrada la REABRE (queda el mensaje y la nota 'Reabierta')", m3, 2);
    /* sin buscar: las 5 propuestas siguen igual */
    var m4 = await p.evaluate(function () { tareas = MUNDO(); abierta = "tORIGEN"; render(); abreMover225(tareas[0], 0); return { props: document.querySelectorAll("#mops253 [data-movto]").length > 0, nueva: !!document.querySelector("[data-movnueva]"), ng: !!document.querySelector("[data-movplatica]") }; });
    eq("Las propuestas, Tarea nueva y Solo plática siguen ahí", m4, { props: true, nueva: true, ng: true });
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? "FALLAS:\n" + malas.join("\n") : "todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
