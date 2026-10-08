#!/usr/bin/env node
/* PRUEBAS build 239 (Salvador): en el Acomodo no salen saludos ("Igualmente pollo", "Jajaja", 👍…). Saludo = regla del 230 (menos de
   60 letras, sin cifra, fecha, pregunta ni archivo) o la lista ampliada. Plática de puro saludo: no sale y se marca sola como plática
   (como "Solo plática"), sin regla de aprendizaje; plática mixta: solo cuentan los mensajes con contenido. "Solo plática" en la hoja
   "¿A dónde va?": "saludo o charla, no va a ninguna tarea". Correr: node tests/b239.test.js (CAP=<carpeta>) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión 239", /var VERSION_APP = "build 23[9]|build 24\d/.test(html), true);
eq("versión >= 233", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 233, true);

eq("ninguna font-family sin respaldo del sistema", (html.match(/font-family:(Archivo|Barlow);/g) || []).length, 0);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };   /* firebase sin red: solo lo que se llama al arrancar */
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {}; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    /* build 285: las secciones del home amanecen plegadas; en esta prueba vieja Acomodo, Mensajes, Te pregunta Doit, Vencidas y Hoy arrancan abiertas como antes (lo que se toque se sigue recordando) */
    await p.evaluate(function () { if (typeof abre285 === "function") abre285 = function (k) { var o = _pl285(); return Object.prototype.hasOwnProperty.call(o.o, k) ? !!o.o[k] : /^(aco|msg|decide|preg|venc|hoy)$/.test(k); }; });
    var r = await p.evaluate(function () {
      yo = "salvador"; var o = {}, NOW = Date.now(), hm = function (ms) { var d = new Date(NOW - ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
      window.__ESCR = []; db = { collection: function (c) { return { doc: function (id) { return { set: function (v, op) { __ESCR.push([c, id]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      var DU = { alternativa_id: "tFIESTA", alternativa_nombre: "Fiesta Cumpleaños Papá" };
      function m(c, tx, hace, extra) { var x = { k: "bi", wa_in: 1, wa_c: c, t: c + ": " + tx, ts: NOW - hace, h: hm(hace), wa_id: "w" + hace }; for (var k in (extra || {})) x[k] = extra[k]; return x; }
      var PAD = { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [
        m("Javier Fernández", "Igualmente pollo", 11 * 3600000, { duda_tarea: DU }),
        m("Eduardo Madero", "Jajaja", 3 * 3600000, { duda_tarea: DU }), m("Eduardo Madero", "👍", 3 * 3600000 - 60000),
        m("Lalo Madero", "Hola", 90 * 60000), m("Lalo Madero", "Igualmente", 89 * 60000), m("Lalo Madero", "¿Reservaste cancha para el miércoles a las 8?", 88 * 60000, { duda_tarea: DU }),
        m("Manuel Parra", "Mañana te dejo la muestra de melamina para la cubierta del comedor, a las 10", 30 * 60000, { duda_tarea: { alternativa_id: "tCOM", alternativa_nombre: "Comedor nuevo" } })] };
      tareas = [PAD, { id: "tFIESTA", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", msgs: [] }, { id: "tCOM", nombre: "Comedor nuevo", duenio: "salvador", estado: "abierta", msgs: [] }];
      abierta = null; vista = "lista"; window.__grupoInicio = "bandeja"; window.__segBandeja = "mensajes"; render();   /* home de tres fichas: Bandeja › Mensajes */
      o.saludos = ["Igualmente pollo", "Jajaja", "👍", "Buenas noches", "Bonita semana", "Un abrazo", "ahí estaremos", "va", "¿Vienes el miércoles?", "Te mando la cotización: $38,500"].map(function (tx) { return esSaludo239(PAD, { t: "X: " + tx, k: "bi", wa_in: 1, wa_c: "X" }); });
      return o; });
    await p.waitForTimeout(300);
    var r2 = await p.evaluate(function () { var o = {}; render(); [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex";
      var P = tareas[0], aco = document.querySelector(".aco226");
      o.tarjetas = [].map.call(aco.querySelectorAll(".acor.g237"), function (f) { return [f.querySelector(".acow b").textContent, f.querySelector(".n237").textContent, f.querySelector(".x237").textContent]; });
      o.sola = P.msgs.slice(0, 3).map(function (x) { return [!!x.oculto, x.oculto_motivo || "", x.acomodo && x.acomodo.por]; });
      o.lalo = P.msgs.slice(3, 6).map(function (x) { return !!x.oculto; });
      var _ac = ((aco.querySelector(".acof .r") || {}).textContent || "").match(/(\d+)\/(\d+)/); o.acerte = _ac ? _ac[1] === _ac[2] : null;
      o.reglas = __ESCR.filter(function (e) { return e[0] === "bitacora_personas"; }).length;
      o.censo = (P.censo_acomodo || []).map(function (c) { return c.tipo; });
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b239-acomodo-sin-saludos.png") });
    var r3 = await p.evaluate(function () { var cd = [].filter.call(document.querySelectorAll(".aco226 .acor.g237"), function (f) { return /Manuel/.test(f.textContent); })[0];
      cd.querySelector("[data-acmov]").click(); var pl = document.querySelector("#mov225 [data-movplatica] small").textContent; document.getElementById("mov225").remove(); return pl; });
    eq("lista ampliada + regla del 230", r.saludos, [true, true, true, true, true, true, true, true, false, false]);
    eq("en el Acomodo solo las pláticas con contenido (sin 'Igualmente pollo' ni 'Jajaja'); en la mixta solo cuenta el mensaje con contenido", r2.tarjetas,
      [["Manuel Parra", "1 mensaje", "Mañana te dejo la muestra de melamina para la cubierta del comedor, a las 10"], ["Lalo Madero", "1 mensaje", "¿Reservaste cancha para el miércoles a las 8?"]]);
    eq("las de puro saludo se marcan solas como plática", r2.sola, [[true, "platica", "auto"], [true, "platica", "auto"], [true, "platica", "auto"]]);
    eq("la mixta no se toca sola", r2.lalo, [false, false, false]);
    eq("sin regla de aprendizaje (solo el censo de la tarea)", [r2.reglas, r2.censo], [0, ["platica_auto", "platica_auto"]]);
    eq("'Solo plática' con su nuevo subtítulo", r3, "saludo o charla, no va a ninguna tarea");
    eq("los saludos sacados solos no cuentan como error en 'acerté'", r2.acerte, true);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
