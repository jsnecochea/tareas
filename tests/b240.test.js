#!/usr/bin/env node
/* PRUEBAS build 240 (Salvador 21:31–21:41). 1) Importante limpia: sin toques automáticos (bal: "Van 9 veces…", "Ya venció…"), sin avisos
   del sistema ("Movida del…", "Anotado…", "¿Para cuándo…?") ni órdenes de fecha/ritmo; con el dictado con contenido, las personas con
   contenido y los archivos. Caso real "Mandar a hacer testamentos" (tmubodpp3n4osw; mensajes copiados de la tarea, más un PDF de prueba
   porque la tarea real no trae archivo en msgs). 2) Tarea · Dato · Vincular solo en las que creó la IA. 3) Acomodo: Dato y "OK · sin
   importancia" (msg_imp 0 + regla "trivial"). 4) Historial (⋯ del Inicio): hora · tarea · qué hizo; tocar abre; Deshacer.
   Correr: node tests/b240.test.js (CAP=<carpeta>) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var FX = JSON.parse(fs.readFileSync(path.join(__dirname, "fx-testamentos-240.json"), "utf8"));
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 240", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 240, true);
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
    var r = await p.evaluate(function (FX) {
      yo = "salvador"; var o = {};
      try { localStorage.removeItem("doit_hist240"); } catch (e) {}
      window.__ESCR = []; db = { collection: function (c) { return { doc: function (id) { return { set: function (v, op) { __ESCR.push([c, id, JSON.parse(JSON.stringify(v))]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      function solo() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      window.solo = solo;
      window.T240 = JSON.parse(JSON.stringify(FX)); tareas = [T240]; abierta = T240.id; vista = "hilo"; render(); solo();
      o.filtro = document.getElementById("cnlpill").textContent;
      o.visibles = [].map.call(document.querySelectorAll(".msgs [data-mix], .msgs [data-hab]"), function (b) { return b.textContent.replace(/\s+/g, " ").slice(0, 40); });
      o.toggle = document.querySelectorAll(".tp236").length; var _r0 = document.querySelector(".msgs [data-mix]"); if (_r0) _r0.scrollIntoView({ block: "start" });
      return o; }, FX);
    if (process.env.CAP) { await p.setViewportSize({ width: 390, height: 1700 }); await p.evaluate(function () { var sc = document.querySelector(".scroll"); if (sc) sc.scrollTop = 0; });
      await p.screenshot({ path: path.join(process.env.CAP, "b240-testamentos-importante.png") }); await p.setViewportSize({ width: 390, height: 844 }); }
    var r2 = await p.evaluate(function () { var o = {}, NOW = Date.now(), hm = function (ms) { var d = new Date(NOW - ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
      /* tarea a mano vieja (sin tipo_item): nunca pide clasificar; la de la IA sí */
      var M = { id: "tMANO", nombre: "Revisar bomba", duenio: "salvador", estado: "abierta", creada_por: "salvador", pendiente_info: "falta fecha", msgs: [] };
      var I = { id: "tIA", nombre: "Cotización toldo", duenio: "salvador", estado: "abierta", creada_por: "ia_revisor", origen: "wa_revisor", por_autorizar: true, tipo_item: "tarea", pendiente_info: "x", msgs: [] };
      tareas = [M, I]; abierta = "tMANO"; render(); o.mano = [document.querySelectorAll(".tp236").length, clasif236(M)]; abierta = "tIA"; render(); o.ia = [document.querySelectorAll(".tp236").length, clasif236(I)];
      /* Acomodo con Dato y sin importancia */
      function m(c, tx, hace, extra) { var x = { k: "bi", wa_in: 1, wa_c: c, t: c + ": " + tx, ts: NOW - hace, h: hm(hace), wa_id: "w" + hace }; for (var k in (extra || {})) x[k] = extra[k]; return x; }
      var FI = { id: "tFIESTA", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [
        m("Javier Fernández", "Va a ir mi cuñado también, somos 4 en total para la comida", 40 * 60000, { duda_tarea: { alternativa_id: "tPADEL", alternativa_nombre: "Pádel miércoles" } }),
        m("Rogelio Sada", "El precio del salón quedó en $12,500 por la tarde completa", 20 * 60000, { duda_tarea: { alternativa_id: "tPADEL", alternativa_nombre: "Pádel miércoles" } })] };
      tareas = [FI, { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] }]; abierta = null; vista = "lista"; render(); solo();
      o.botones = [].map.call(document.querySelectorAll(".aco226 .acor.g237")[0].querySelectorAll(".ac226 button"), function (b) { return b.textContent; });
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b240-acomodo-dato-sinimportancia.png") });
    var r3 = await p.evaluate(function () { var o = {}, FI = tareas[0];
      function card(re) { return [].filter.call(document.querySelectorAll(".aco226 .acor.g237"), function (f) { return re.test(f.textContent); })[0]; }
      __ESCR.length = 0; card(/Javier/).querySelector("[data-actriv]").click();
      var x = FI.msgs[0]; o.triv = [x.acomodo && x.acomodo.trivial, FI.msg_imp && FI.msg_imp[msgId230(x)], __ESCR.filter(function (e) { return e[0] === "bitacora_personas" && e[2].acomodo_reglas; }).map(function (e) { var r = e[2].acomodo_reglas[Object.keys(e[2].acomodo_reglas)[0]]; return [r.tipo, r.tarea_destino]; })];
      card(/Rogelio/).querySelector(":scope > .acob > .ac226 [data-acdato]").click(); var n = tareas[tareas.length - 1];
      o.dato = [n.tipo_item, n.es_dato, n.tipo_elegido, n.msgs.filter(function (x) { return x.movido_de; }).length, FI.msgs[1].oculto];
      /* en la hoja ¿A dónde va? */
      var G = { id: "tG", nombre: "Comedor nuevo", duenio: "salvador", estado: "abierta", msgs: [{ k: "bi", wa_in: 1, wa_c: "Lalo", t: "Lalo: jajaja igualmente", ts: Date.now() - 1000, h: "21:00", wa_id: "zz" }] };
      tareas.push(G); abreMover225(G, 0); o.hoja = [].map.call(document.querySelectorAll("#mov225 .opt226.plain .two > span"), function (x) { return x.textContent; });
      document.querySelector("#mov225 [data-movtriv]").click(); o.hojaTriv = [G.msgs[0].acomodo && G.msgs[0].acomodo.trivial, G.msg_imp && G.msg_imp.zz];
      return o; });
    /* ---- Historial ---- */
    var r4 = await p.evaluate(function () { var o = {};
      var A = { id: "tA", nombre: "Comprar regalo", duenio: "salvador", estado: "abierta", f_vigente: "2026-10-10", msgs: [{ k: "bi", wa_in: 1, wa_c: "Pepe", t: "Pepe: te paso el link del regalo: https://x.y", ts: 1000, h: "10:00" }] };
      var B = { id: "tB", nombre: "Fiesta", duenio: "salvador", estado: "abierta", msgs: [] };
      tareas = [A, B]; abierta = "tA"; vista = "hilo"; render();
      mueveFecha(A, "2026-10-12", "prueba"); mueveMensaje(A, 0, "tB", "mover"); cierraHecha(A);
      abierta = null; vista = "lista"; render(); document.getElementById("bhmas").click(); document.getElementById("hmhist").click();
      [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex";
      o.renglones = [].map.call(document.querySelectorAll(".hist240 li"), function (li) { return [li.querySelector(".ht b").textContent, li.querySelector(".ht span").textContent, !!li.querySelector("[data-hund]")]; });
      o.remoto = (function () { return true; })();
      return o; });
    await p.waitForTimeout(1700);
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b240-historial.png") });
    var r5 = await p.evaluate(function () { var o = {}, A = tareas[0], B = tareas[1];
      o.guardado = __ESCR.filter(function (e) { return e[0] === "bitacora_personas" && e[1] === "salvador" && Array.isArray(e[2].historial_acciones); }).length > 0;
      var bs = document.querySelectorAll("[data-hund]"); bs[0].click(); o.reabierta = [!A.cierre, A.estado];
      document.querySelectorAll("[data-hund]")[0].click(); o.regreso = [!A.msgs[0].oculto, B.msgs.length];
      document.querySelectorAll("[data-hund]")[0].click(); o.fecha = A.f_vigente;
      o.deshecho = document.querySelectorAll(".hist240 .hok").length;
      document.querySelector('.hist240 [data-hid="tA"]').click(); o.abre = [vista, abierta];
      return o; });
    var vis = r.visibles.join(" | ");
    eq("Importante (arranca así)", r.filtro, "Importante");
    eq("sin toques automáticos, avisos del sistema ni cambios de fecha", [/Van \d|Llevas 9|toques|Ya venció|Segunda vez|Movida del|Anotado|Para cuándo|No le entendí|Modifícame|Quiero que me la mandas|Para el 2 de octubre|Se va ejecutar|para el 15 de noviembre/.test(vis)], [false]);
    eq("quedan: el dictado de Salvador, Garza con contenido y el archivo", [/OK prográmame el recordatorio/.test(vis), (vis.match(/Garza/g) || []).length >= 2, /Requisitos testamen/.test(vis)], [true, true, true]);
    eq("tarea hecha a mano: no pide Tarea · Dato · Vincular", r.toggle, 0);
    eq("a mano sin tipo: clasificada; la de la IA sin elegir: pide clasificar", [r2.mano, r2.ia], [[0, true], [1, false]]);
    eq("Acomodo: OK · Mover · Nueva · Dato y el atajo 'OK · sin importancia'", r2.botones, ["OK", "Mover", "Nueva", "Dato", "OK · sin importancia"]);
    eq("sin importancia: se queda con msg_imp 0 y regla 'trivial'", r3.triv, [1, 0, [["trivial", "tFIESTA"]]]);
    eq("Dato: un dato nuevo con el mensaje", r3.dato, ["dato", true, true, 1, true]);
    eq("hoja ¿A dónde va?: 'Bien, pero sin importancia' antes de 'Solo plática'", r3.hoja.slice(-2), ["Bien, pero sin importancia", "Solo plática"]);
    eq("y desde la hoja también", r3.hojaTriv, [1, 0]);
    eq("Historial: lo más reciente arriba, con Deshacer donde se puede", r4.renglones.slice(0, 4), [["Comprar Regalo", "Ya está (la cerró)", true], ["Comprar Regalo", "Movió un mensaje a “Fiesta”", true], ["Comprar Regalo", "Movió la fecha del sáb 10 oct al lun 12 oct", true], ["Comprar regalo", "Abrió la tarea", false]]);
    eq("se guarda también en bitacora_personas/salvador.historial_acciones", r5.guardado, true);
    eq("Deshacer: reabre, regresa el mensaje, restaura la fecha", [r5.reabierta, r5.regreso, r5.fecha, r5.deshecho], [[true, "abierta"], [true, 0], "2026-10-10", 3]);
    eq("tocar un renglón abre la tarea", r5.abre, ["hilo", "tA"]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
