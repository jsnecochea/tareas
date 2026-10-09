#!/usr/bin/env node
/* PRUEBAS build 237 (Salvador 19:42): ACOMODO POR PLÁTICA. Inicio: una tarjeta por plática (mismo contacto, <30 min entre mensajes)
   con contacto · "N mensajes" (sin la pura plática) · extracto (el de más contenido) · "creo que es: <tarea>" · OK · Mover · Nueva para
   TODA la plática; tocar = desplegar. Solo las dudosas (duda_tarea, o la nota de la Mac "no estoy seguro del tema…", o tarea de la IA sin
   clasificar). En la tarea: "acomodó Claude" (tocar = OK · Mover · Nueva); con duda, botones UNA vez por plática. Cada acción deja una
   regla en bitacora_personas/<usuario>.acomodo_reglas. Correr: node tests/b237.test.js (CAP=<carpeta>) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
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
    await p.evaluate(function () { if (typeof abre285 === "function") abre285 = function (k) { var o = _pl(); return Object.prototype.hasOwnProperty.call(o.o, k) ? !!o.o[k] : /^(aco|msg|decide|preg|venc|hoy)$/.test(k); }; });
    var r = await p.evaluate(function () {
      yo = "salvador"; var o = {}, NOW = Date.now(), hm = function (ms) { var d = new Date(NOW - ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
      window.esPropuesta = function () { return false; };   /* build 256: este suite prueba el camino viejo de la plática sin clasificar; las propuestas lo tienen b256 */ window.__ESCR = []; db = { collection: function (c) { return { doc: function (id) { return { set: function (v, op) { window.__ESCR.push([c, id, JSON.parse(JSON.stringify(v)), op || null]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false, data: function () { return null; } }); } }; } }; } };
      function solo() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && x.id !== "mov225") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      function m(c, tx, hace, extra) { var x = { k: "bi", wa_in: 1, wa_c: c, t: c + ": " + tx, ts: NOW - hace, h: hm(hace), wa_id: "w" + Math.random().toString(36).slice(2, 8) }; for (var k in (extra || {})) x[k] = extra[k]; return x; }
      window.F237 = function () {
        var PAD = { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", tipo_item: "tarea", msgs: [] };
        var COM = { id: "tCOMEDOR", nombre: "Comedor nuevo", duenio: "salvador", estado: "abierta", tipo_item: "tarea", msgs: [] };
        var LER = { id: "tLERDO", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", estado: "abierta", tipo_item: "tarea", indefinida: true, msgs: [
          m("Lalo Madero", "Hola Salvador", 50 * 60000), m("Lalo Madero", "ok", 48 * 60000), m("Lalo Madero", "¿Hay miercolitos esta semana? Reservé la cancha 3 de 8 a 9:30 en el club", 45 * 60000),
          m("Lalo Madero", "va Nestor y el Pollo", 40 * 60000), m("Lalo Madero", "gracias", 35 * 60000), m("Lalo Madero", "ahí estaremos", 30 * 60000),
          { k: "bi", t: "📝 Nota IA " + hm(45 * 60000) + ": no estoy seguro del tema del mensaje de Lalo Madero de las " + hm(45 * 60000) + "; lo puse aquí, pero puede ser de «Pádel miércoles». En Doit: “¿Es de esta o de otra?”.", ts: NOW - 44 * 60000, h: hm(44 * 60000), nota_ia: 1, canal: "priv:salvador", origen: "revisor" },
          m("Manuel Parra", "Tema 2… Mesa comedor alto brillo: mañana te dejo la muestra de melamina para que la veas en tu casa", 20 * 60000, { duda_tarea: { alternativa_id: "tCOMEDOR", alternativa_nombre: "Comedor nuevo" } }),
          m("Manuel Parra", "y el carpintero pasa el jueves a medir", 15 * 60000),
          m("Manuel Parra", "Esteban ya cortó las ramas del techo, mando fotos", 5 * 3600000) ] };
        var TOL = { id: "tIATOLDO", nombre: "Cotización toldo terraza", duenio: "salvador", estado: "abierta", creada_por: "ia_revisor", origen: "wa_revisor", por_autorizar: true, tipo_item: "tarea", pendiente_info: "x",
          msgs: [m("Toldos Laguna", "Le comparto la cotización del toldo retráctil de 4x3 m: $38,500 con instalación", 90 * 60000), m("Toldos Laguna", "quedo atento", 88 * 60000)] };
        return [LER, PAD, COM, TOL]; };
      tareas = F237(); abierta = null; vista = "lista"; window.__grupoInicio = "bandeja"; window.__segBandeja = "mensajes"; render(); solo();   /* home de tres fichas: Bandeja › Mensajes */
      var aco = document.querySelector(".aco226");
      o.cab = document.querySelector('.seg-bandeja [data-seg="mensajes"]').textContent;   /* la pestaña Mensajes de Bandeja lleva el número */
      o.tarjetas = [].map.call(aco.querySelectorAll(".acor.g237"), function (f) { return [f.querySelector(".acow b").textContent, f.querySelector(".n237").textContent, f.querySelector(".x237").textContent, f.querySelector(".pill226").textContent, f.getAttribute("data-acg").split(",").length]; });
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b237-acomodo-3-platicas.png") });
    var r2 = await p.evaluate(function () { var o = {};
      var lalo = [].filter.call(document.querySelectorAll(".aco226 .acor.g237"), function (f) { return /Lalo/.test(f.textContent); })[0];
      lalo.querySelector(".x237").click(); var ab = [].filter.call(document.querySelectorAll(".aco226 .acor.g237"), function (f) { return /Lalo/.test(f.textContent); })[0];
      o.desplegada = [].map.call(ab.querySelectorAll(".m237"), function (x) { return [x.textContent.replace(/^\d{2}:\d{2}/, ""), x.classList.contains("tenue")]; });
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b237-platica-desplegada.png") });
    var r3 = await p.evaluate(function () { var o = {};
      function card(re) { return [].filter.call(document.querySelectorAll(".aco226 .acor.g237"), function (f) { return re.test(f.textContent); })[0]; }
      __ESCR.length = 0; window.__g237open = {}; render();   /* 245: desplegada, la fila del final sobra (cada mensaje trae la suya); se pliega para usar la de la TARJETA */
      card(/Lalo/).querySelector(":scope > .acob > .ac226 [data-acok]").click();
      var L = tareas[0]; o.ok = [L.msgs.filter(function (x) { return /Lalo/.test(x.wa_c || "") && x.acomodo && x.acomodo.ok === 1; }).length, document.querySelectorAll(".aco226 .acor.g237").length];
      var w = __ESCR.filter(function (e) { return e[0] === "bitacora_personas"; })[0]; var rg = w ? w[2].acomodo_reglas[Object.keys(w[2].acomodo_reglas)[0]] : null;
      o.regla = w ? [w[1], JSON.stringify(w[3]), rg.contacto, rg.tipo, rg.tarea_destino, rg.palabras_clave.length >= 3 && rg.palabras_clave.length <= 5, /^\d{4}-\d{2}-\d{2}T/.test(rg.fecha)] : null;
      card(/Manuel/).querySelector("[data-acmov]").click(); var mv = document.getElementById("mov225"); o.hojaMover = mv.querySelector(".mvt small").textContent.replace(/^.*· /, "");
      mv.querySelector('[data-movto="tCOMEDOR"]').click();
      var C = tareas[2]; o.mover = [C.msgs.length, tareas[0].msgs.filter(function (x) { return /Manuel/.test(x.wa_c || "") && x.oculto; }).length];
      var rm = __ESCR.filter(function (e) { return e[0] === "bitacora_personas"; }).pop(); var rr = rm[2].acomodo_reglas[Object.keys(rm[2].acomodo_reglas)[0]]; o.reglaMover = [rr.tipo, rr.tarea_destino, rr.mensajes];
      card(/Toldos/).querySelector("[data-acnueva]").click(); (function(){ var ok=document.querySelector('[data-nom249="ok"]'); if(ok) ok.click(); })(); var nv = tareas[tareas.length - 1]; o.nueva = [nv.id !== "tIATOLDO", nv.msgs.filter(function (x) { return x.movido_de; }).length, tareas[3].msgs.filter(function (x) { return x.oculto; }).length];
      o.quedan = document.querySelectorAll(".aco226 .acor.g237").length;
      /* dentro de la tarea */
      tareas = F237(); abierta = "tLERDO"; vista = "hilo"; poneVista(tareas[0], ""); render(); poneVista(tareas[0], ""); render();
      [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; });
      o.dentro = { botones: [].map.call(document.querySelectorAll("#app .ac226"), function (x) { return x.getAttribute("data-acg").split(",").length; }), marquitas: [].map.call(document.querySelectorAll(".msgs .cl238"), function (x) { return x.getAttribute("aria-label"); }) };
      return o; });
    var r4 = await p.evaluate(function () { var o = {};
      var _bb = [].filter.call(document.querySelectorAll(".msgs [data-mix]"), function (b) { return /Esteban/.test(b.textContent); })[0]; _bb.click(); o.abierta = [document.querySelectorAll("#det242 .ac226").length, document.querySelectorAll("#det242 .ac226 button").length];
      
      return o; });
    var r5 = await p.evaluate(function () { document.querySelector("#det242 [data-acok]").click(); var L = tareas[0];
      return [L.msgs.filter(function (x) { return /Manuel/.test(x.wa_c || "") && x.ts < Date.now() - 3600000 && x.acomodo && x.acomodo.ok === 1; }).length, document.querySelectorAll(".msgs .cl238").length]; });
    var r6 = await p.evaluate(function () {   /* captura limpia: tarea ya clasificada con una plática que acomodó Claude, marquita abierta */
      var NOW = Date.now(), hm = function (ms) { var d = new Date(NOW - ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
      var T = { id: "tLIMPIA", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, indefinida: true, por_autorizar: false, revisa_ext: "Manuel Parra",
        contexto: "Filtración en recámara/estudio por el baño; azotea con ramas; luego impermeabilizar y pintar el cielo.",
        msgs: [{ k: "bo", de: "salvador", t: "Manuel, ¿cómo va lo del techo?", ts: NOW - 40 * 60000, h: hm(40 * 60000) },
          { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: Esteban ya cortó las ramas del techo y mañana empiezan a impermeabilizar", ts: NOW - 30 * 60000, h: hm(30 * 60000), wa_id: "a1" },
          { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: te mando 3 fotos del techo limpio en un rato", ts: NOW - 28 * 60000, h: hm(28 * 60000), wa_id: "a2" }] };
      tareas = [T]; abierta = T.id; vista = "hilo"; window.__cl238 = {}; render(); poneVista(T, ""); render();
      [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; });
      document.querySelector(".msgs .cl238").closest("[data-mix]").click(); return [document.querySelectorAll("#det242 .ac226").length]; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b237-tarea-acomodo-claude.png") });
    eq("Acomodo: 3 pláticas (no 10 mensajes)", r.cab, "Mensajes3");
    eq("tarjetas: contacto · N mensajes (sin 'ok/gracias/ahí estaremos') · extracto · creo que es · tamaño de la plática", r.tarjetas, [
      ["Manuel Parra", "2 mensajes", "Tema 2… Mesa comedor alto brillo: mañana te dejo la muestra de melamina para que la veas en tu casa", "creo que es: Casa Lerdo", 2],
      ["Lalo Madero", "1 mensaje", "¿Hay miercolitos esta semana? Reservé la cancha 3 de 8 a 9:30 en el club", "creo que es: Casa Lerdo", 6],
      ["Toldos Laguna", "1 mensaje", "Le comparto la cotización del toldo retráctil de 4x3 m: $38,500 con instalación", "creo que es: Cotización toldo terraza · sin clasificar", 2]]);
    eq("desplegada: los 6 mensajes, la pura plática en tenue", r2.desplegada.map(function (x) { return x[1]; }), [true, true, false, true, true, true]);   /* 239: tenue = saludo por la regla del 230 ("va Nestor y el Pollo" es corto y sin cifra) */
    eq("OK aplica a TODA la plática (6) y la tarjeta se va", r3.ok, [6, 2]);
    eq("regla en bitacora_personas/salvador · acomodo_reglas (merge)", r3.regla, ["salvador", '{"merge":true}', "Lalo Madero", "ok", "tLERDO", true, true]);
    eq("Mover: la hoja dice '2 mensajes' y pasan los 2", [r3.hojaMover, r3.mover], ["2 mensajes", [2, 2]]);
    eq("regla de Mover (238: una por mensaje)", r3.reglaMover, ["mover", "tCOMEDOR", 1]);
    eq("Nueva: tarea nueva con toda la plática", r3.nueva, [true, 2, 2]);
    eq("ya no queda nada por revisar", r3.quedan, 0);
    eq("en la tarea (238 por MENSAJE): botones en cada mensaje con duda (Lalo por la nota de la Mac en Te pregunta, Manuel) e iconito de Claude en los acomodados con contenido", [r3.dentro.botones, r3.dentro.marquitas], [[1],   /* 242: solo la tarjeta Te pregunta; los demás en la hoja del globo */ ["Lo acomodó Claude", "Lo acomodó Claude", "Lo acomodó Claude", "Lo acomodó Claude", "Lo acomodó Claude"]]);
    eq("tocar el globo con el iconito abre OK · Mover · Nueva para ese mensaje", r4.abierta, [1, 5]);   /* 243: + No guardar */   /* 240: + Dato */
    eq("OK desde el globo confirma ese mensaje y le quita el iconito", r5[0], 1);
    eq("tarea limpia: globo tocado abierto", r6, [1]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
