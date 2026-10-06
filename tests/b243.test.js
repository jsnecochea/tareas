#!/usr/bin/env node
/* PRUEBAS build 243 (Salvador 22:02). 1) Después de vincular: la tarea DESTINO (caso real "Mandar a hacer testamentos", hecha a mano,
   con cita sin fecha en el contexto) abre en su vista normal, filtro Importante, sin Tarea · Dato · Vincular, sin "Solo me falta" ni
   Agendar ni ficha de revisión; aviso "Vinculada · Deshacer" (Deshacer regresa la origen). Causa: el vínculo NO copia campos; la destino
   se juzgaba con tipoRevisar() y salía "falta" por eventoPendiente/faltaVieja. Ahora una destino de vínculo nunca entra a revisión.
   2) Acomodo: OK · Mover · Nueva · Dato · No guardar; sin "OK · sin importancia" ni "Bien, pero sin importancia"; No guardar = Solo plática
   + pregunta de 6 s que guarda regla tipo "no_guardar" con acierto_tema. También en la hoja de detalle del globo.
   Correr: node tests/b243.test.js (CAP=<carpeta> para capturas) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var FX = JSON.parse(fs.readFileSync(path.join(__dirname, "fx-testamentos-240.json"), "utf8"));
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 243", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 243, true);
eq("ninguna font-family sin respaldo del sistema", (html.match(/font-family:(Archivo|Barlow);/g) || []).length, 0);
eq("la hoja ¿A dónde va? ya no trae 'Bien, pero sin importancia' en el código", /Bien, pero sin importancia/.test(html), false);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {}; });
  async function foto(nom, alto) { if (!process.env.CAP) return; await p.setViewportSize({ width: 390, height: alto || 844 }); await p.screenshot({ path: path.join(process.env.CAP, nom) }); await p.setViewportSize({ width: 390, height: 844 }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    /* ---------- 1) después de vincular ---------- */
    var r = await p.evaluate(function (FX) {
      yo = "salvador"; var o = {};
      window.__ESCR = []; db = { collection: function (c) { return { doc: function (id) { return { set: function (v) { __ESCR.push([c, id, JSON.parse(JSON.stringify(v))]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      function solo() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && x.id !== "undopill" && x.id !== "ng243") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      window.solo = solo;
      var D = JSON.parse(JSON.stringify(FX));
      var O = { id: "tIAorig", nombre: "Testamentos notaría", duenio: "salvador", estado: "abierta", creada_por: "ia_revisor", origen: "wa_revisor", por_autorizar: true, en_revision: true, tipo_item: "tarea", pendiente_info: "falta fecha", falta_fecha: true,
        msgs: [{ k: "bi", wa_in: 1, wa_c: "Notaría 14", t: "Notaría 14: La cita es el martes 13 de octubre a las 10:00", ts: Date.now() - 5000, h: "10:00", wa_id: "q1" }] };
      tareas = [D, O]; abierta = O.id; vista = "hilo"; render();
      o.antesOrigenPideClasificar = document.querySelectorAll(".tp236").length;
      var antes = JSON.stringify(["en_revision", "por_autorizar", "creada_por", "origen", "tipo_item", "tipo_elegido", "falta_fecha", "pendiente_info"].map(function (k) { return D[k]; }));
      enlazaTareas(O.id, D.id); solo();
      var app = document.getElementById("app").innerText;
      o.camposSinCopiar = JSON.stringify(["en_revision", "por_autorizar", "creada_por", "origen", "tipo_item", "tipo_elegido", "falta_fecha", "pendiente_info"].map(function (k) { return D[k]; })) === antes;
      o.vista = [vista, abierta, tipoRevisar(D), clasif236(D)];
      o.filtro = document.getElementById("cnlpill").textContent;
      o.sinRevision = [document.querySelectorAll(".tp236, .typep229").length, /Solo me falta|Datos de la tarea|Agendar/.test(app), document.querySelectorAll(".agst, .agenda229, [data-agendar]").length];
      var u = document.getElementById("undopill"); o.aviso = u ? u.textContent : null;
      return o; }, FX);
    await foto("b243-destino-despues-de-vincular.png");
    var r1b = await p.evaluate(function () { var o = {}, D = tareas[0];
      document.querySelector("#bundo").click();
      o.deshacer = [tareas.some(function (t) { return t.id === "tIAorig" && !t.fusionada_en; }), vista];
      return o; });
    /* hecha a mano con en_revision/por_autorizar: cuenta como clasificada */
    var r1c = await p.evaluate(function () { var M = { id: "tMANO2", nombre: "Pagar predial", duenio: "salvador", estado: "abierta", creada_por: "salvador", en_revision: true, por_autorizar: true, tipo_item: "tarea", msgs: [] };
      tareas = [M]; abierta = M.id; vista = "hilo"; render(); return [clasif236(M), document.querySelectorAll(".tp236").length]; });
    eq("vincular: la destino abre normal (hilo, tarea destino), sin revisión y clasificada", r.vista, ["hilo", "tmubodpp3n4osw", null, true]);
    eq("vincular: filtro Importante", r.filtro, "Importante");
    eq("vincular: sin Tarea · Dato · Vincular, sin 'Solo me falta', 'Datos de la tarea', Agendar", r.sinRevision, [0, false, 0]);
    eq("vincular: la destino no copia campos de la origen", r.camposSinCopiar, true);
    eq("vincular: aviso 'Vinculada · Deshacer'", r.aviso, "VinculadaDeshacer");
    eq("vincular: Deshacer regresa la origen", r1b.deshacer[0], true);
    eq("hecha a mano con en_revision/por_autorizar: clasificada, sin Tarea · Dato · Vincular", r1c, [true, 0]);
    /* ---------- 2) Acomodo ---------- */
    var r2 = await p.evaluate(function () { var o = {}, NOW = Date.now();
      document.getElementById("undopill") && document.getElementById("undopill").remove();
      [].forEach.call(document.body.children, function (x) { x.style.display = ""; });
      window.__ESCR = []; try { localStorage.removeItem("doit_hist240"); } catch (e) {}
      function m(c, tx, hace, extra) { var d = new Date(NOW - hace); var x = { k: "bi", wa_in: 1, wa_c: c, t: c + ": " + tx, ts: NOW - hace, h: ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2), wa_id: "w" + hace }; for (var k in (extra || {})) x[k] = extra[k]; return x; }
      var dud = { alternativa_id: "tPADEL", alternativa_nombre: "Pádel miércoles" };
      var FI = { id: "tFIESTA", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [
        m("Javier Fernández", "Va a ir mi cuñado también, somos 4 en total para la comida", 40 * 60000, { duda_tarea: dud }),
        m("Rogelio Sada", "El precio del salón quedó en $12,500 por la tarde completa", 20 * 60000, { duda_tarea: dud }),
        m("Lalo Madero", "Mañana te llevo el contrato firmado del salón a la oficina", 10 * 60000, { duda_tarea: dud })] };
      tareas = [FI, { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] }]; abierta = null; vista = "lista"; render();
      window.solo2 = function () { [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && x.id !== "ng243") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }; solo2();
      function card(re) { return [].filter.call(document.querySelectorAll(".aco226 .acor.g237"), function (f) { return re.test(f.textContent); })[0]; }
      window.card243 = card;
      o.botones = [].map.call(card(/Javier/).querySelectorAll(":scope > .acob > .ac226 button"), function (b) { return b.textContent; });
      o.sinImportancia = /sin importancia/i.test(document.getElementById("app").innerText);
      return o; });
    await foto("b243-acomodo-tarjeta.png");
    var r3 = await p.evaluate(function () { var o = {}, FI = tareas[0];
      /* No guardar -> Sí */
      card243(/Javier/).querySelector(":scope > .acob > .ac226 [data-acng]").click();
      var x = FI.msgs[0]; o.ng = [x.oculto, x.oculto_motivo, !!document.getElementById("ng243"), (document.getElementById("ng243") || {}).textContent];
      document.querySelector('#ng243 [data-ngr="si"]').click();
      var reglas = __ESCR.filter(function (e) { return e[0] === "bitacora_personas" && e[2].acomodo_reglas; }).map(function (e) { var r = e[2].acomodo_reglas[Object.keys(e[2].acomodo_reglas)[0]]; return [r.tipo, r.acierto_tema, r.tarea_destino]; });
      o.si = [reglas, !!document.getElementById("ng243")];
      /* No guardar -> No */
      __ESCR.length = 0; var c2 = card243(/Rogelio/); c2.querySelector(":scope > .acob > .ac226 [data-acng]").click();
      document.querySelector('#ng243 [data-ngr="no"]').click();
      o.no = __ESCR.filter(function (e) { return e[0] === "bitacora_personas" && e[2].acomodo_reglas; }).map(function (e) { var r = e[2].acomodo_reglas[Object.keys(e[2].acomodo_reglas)[0]]; return [r.tipo, r.acierto_tema]; });
      o.noOculto = FI.msgs[1].oculto === true;
      /* sin contestar: se quita sola a los 6 s y no guarda regla */
      __ESCR.length = 0; var c3 = card243(/Lalo/); c3.querySelector(":scope > .acob > .ac226 [data-acng]").click();
      o.sinContestar = [!!document.getElementById("ng243"), FI.msgs[2].oculto === true]; window.__escrAntes = __ESCR.length;
      return o; });
    await p.waitForTimeout(8300);   /* 245: la confirmación dura 8 s */
    var r4 = await p.evaluate(function () { return [!!document.getElementById("ng243"), __ESCR.filter(function (e) { return e[2] && e[2].acomodo_reglas; }).length]; });
    /* hoja ¿A dónde va? y detalle del globo */
    var r5 = await p.evaluate(function () { var o = {}, G = { id: "tG", nombre: "Comedor nuevo", duenio: "salvador", estado: "abierta", msgs: [{ k: "bi", wa_in: 1, wa_c: "Lalo", t: "Lalo: jajaja igualmente", ts: Date.now() - 1000, h: "21:00", wa_id: "zz" }] };
      tareas.push(G); abreMover225(G, 0); o.hoja = [].map.call(document.querySelectorAll("#mov225 .opt226.plain .two > span"), function (x) { return x.textContent; });
      document.querySelector("#mov225 [data-movx]").click();
      var H = { id: "tH", nombre: "Comedor nuevo 2", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: Te mando la cotización de la piedra mañana temprano", ts: Date.now() - 2000, h: "20:10", wa_id: "hh" }] };
      tareas = [H]; abierta = H.id; vista = "hilo"; render();
      var g = document.querySelector(".msgs [data-mix]"); g.click(); var h = document.getElementById("det242");
      o.det = h ? [].map.call(h.querySelectorAll(".ac226 button"), function (b) { return b.textContent; }) : null;
      if (h) { h.querySelector("[data-acng]").click(); o.detOculto = H.msgs[0].oculto === true; var q = document.getElementById("ng243"); o.detPregunta = !!q; if (q) q.remove(); }
      return o; });
    eq("Acomodo: OK · Mover · Nueva · Dato · No guardar, sin 'sin importancia'", [r2.botones, r2.sinImportancia], [["OK", "Mover", "Nueva", "Dato", "No guardar"], false]);
    eq("No guardar = Solo plática: oculto con motivo, sin borrarse, y sale la pregunta", [r3.ng[0], r3.ng[1], r3.ng[2], /¿Sí era de/.test(r3.ng[3])], [true, "platica", true, true]);
    eq("pregunta Sí: regla no_guardar con acierto_tema true y la línea se quita", r3.si, [[["no_guardar", true, "tFIESTA"]], false]);
    eq("pregunta No: regla no_guardar con acierto_tema false (y queda oculto)", [r3.no, r3.noOculto], [[["no_guardar", false]], true]);
    eq("sin contestar: oculto, y a los 8 s se quita sola sin regla", [r3.sinContestar, r4], [[true, true], [false, 0]]);
    eq("hoja ¿A dónde va?: solo Tarea nueva y Solo plática", r5.hoja, ["Tarea nueva", "Solo plática"]);
    eq("hoja de detalle del globo: OK · Mover · Nueva · Dato · No guardar, y No guardar funciona", [r5.det, r5.detOculto, r5.detPregunta], [["OK", "Mover", "Nueva", "Dato", "No guardar"], true, true]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
