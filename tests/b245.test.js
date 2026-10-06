#!/usr/bin/env node
/* PRUEBAS build 245 (Salvador 6-oct 06:47-06:56). a 390 px.
   1) Nombres de imagen en el texto (Acomodo, plática desplegada, detalle, globos): chip amarillo subrayado con ícono y miniatura; tocar = visor con X;
      sin url: gris y "foto no disponible".
   2) Confirmación de "No guardar": burbuja anclada donde se tocó, letra 17 px, botones de 44 px, 8 s o hasta que conteste.
   3) Acomodo: plática desplegada sin la fila repetida del final; las notas de la IA no cuentan como mensajes.
   4) Lo saliente (wa_in 0, fromMe, origen wa_saliente, de:"salvador") se pinta a la derecha, verde, sin el nombre del otro.
   5) Mover muchos: barra "Mover todos (N)" · "No guardar todos (N)" con filtro en una persona (solo desde <fecha>), selección por mantener presionado
      con barra Mover · No guardar · Nueva; todo al Historial con Deshacer y reglas en lote (una por contacto y tema).
   Correr: node tests/b245.test.js (CAP=<carpeta> para capturas) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 245", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 245, true);
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
    await p.evaluate(function () { yo = "salvador"; window.__ESCR = [];
      db = { collection: function (c) { return { doc: function (id) { return { set: function (v) { __ESCR.push([c, id, JSON.parse(JSON.stringify(v))]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      window.solo = function () { [].forEach.call(document.body.children, function (x) { if (["app", "undopill", "ng243", "mov225", "det242", "visor", "selbar245", "leemask"].indexOf(x.id) < 0) x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; };
      window.NOW = Date.now(); window.hh = function (ms) { var d = new Date(ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
      window.mkImg = function (c, c2) { var cv = document.createElement("canvas"); cv.width = 300; cv.height = 300; var g = cv.getContext("2d"), gr = g.createLinearGradient(0, 0, 300, 300); gr.addColorStop(0, c); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, 300, 300);
        g.fillStyle = "rgba(255,255,255,.4)"; g.beginPath(); g.arc(210, 90, 42, 0, 7); g.fill(); g.fillStyle = "rgba(0,0,0,.3)"; g.beginPath(); g.moveTo(0, 300); g.lineTo(110, 150); g.lineTo(200, 240); g.lineTo(250, 190); g.lineTo(300, 300); g.fill(); return cv.toDataURL("image/png"); }; });
    /* ---------- 1) imágenes en el Acomodo ---------- */
    var r1 = await p.evaluate(function () { var o = {}, IMG = mkImg("#2a9d8f", "#264653");
      var T = { id: "tCOM", nombre: "Comedor nuevo", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [
        { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: wa_1791209996617.jpeg", ts: NOW - 30 * 60000, h: hh(NOW - 30 * 60000), wa_id: "m1", tipo: "foto", url: IMG, duda_tarea: { alternativa_id: "tOTRA", alternativa_nombre: "Remodelación" } },
        { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: wa_1791209999999.png", ts: NOW - 29 * 60000, h: hh(NOW - 29 * 60000), wa_id: "m2", url: "" },
        { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: IA avisó a Salvador que Manuel mandó fotos de la piedra", ts: NOW - 27 * 60000, h: hh(NOW - 27 * 60000), wa_id: "m4", nota_ia: 1 },
        { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: IA avisó a Salvador que mandó otra foto", ts: NOW - 26 * 60000, h: hh(NOW - 26 * 60000), wa_id: "m5" }] };
      tareas = [T, { id: "tOTRA", nombre: "Remodelación", duenio: "salvador", estado: "abierta", msgs: [] }]; abierta = null; vista = "lista"; render(); solo();
      var card = document.querySelector(".aco226 .acor.g237"), c1 = card.querySelector(".acom .img245");
      o.n = card.querySelector(".n237").textContent; o.filas = card.querySelectorAll(".ac226").length;
      o.chip = c1 ? [c1.tagName, getComputedStyle(c1).color, getComputedStyle(c1).textDecorationLine, !!c1.querySelector("svg"), !!c1.querySelector("img.it245"), c1.querySelector(".in245").textContent] : null;
      card.querySelector(".x237").click();
      var ab = document.querySelector(".aco226 .acor.g237");
      o.abFilas = [ab.querySelectorAll(".msgs237 .ac226").length, ab.querySelectorAll(":scope > .acob > .ac226").length, ab.querySelectorAll(".m237").length];
      o.sin = [].map.call(ab.querySelectorAll(".img245.sin"), function (e) { var cs = getComputedStyle(e); return [e.textContent.replace(/\s+/g, " ").trim(), cs.color, cs.textDecorationLine]; });
      o.chips = ab.querySelectorAll("button.img245").length;
      return o; });
    await foto("b245-acomodo-imagen-amarilla.png");
    eq("la plática cuenta 2 mensajes (las 2 notas de la IA, \"IA avisó…\" y Nota IA, no cuentan)", r1.n, "2 mensajes");
    eq("el chip del extracto: botón amarillo (#FFD60A), subrayado, con ícono y miniatura", r1.chip, ["BUTTON", "rgb(255, 214, 10)", "underline", true, true, "wa_1791209996617.jpeg"]);
    eq("plegada: una sola fila de botones", r1.filas, 1);
    eq("desplegada: una fila por mensaje (2) y NO la del final", r1.abFilas, [2, 0, 2]);
    eq("sin url: gris, sin subrayado y 'foto no disponible'", r1.sin, [["wa_1791209999999.png · foto no disponible", "rgb(122, 122, 128)", "none"]]);
    eq("con url: el chip es botón (en el extracto y en el mensaje desplegado)", r1.chips, 2);
    var r1b = await p.evaluate(function () { var o = {}; var c = document.querySelector(".aco226 .msgs237 button.img245"); c.click(); var v = document.getElementById("visor");
      o.visor = [v.classList.contains("on"), /^data:image\/png/.test(v.querySelector("img").getAttribute("src")), !!v.querySelector(".vx"), v.querySelector(".vx").getBoundingClientRect().right > 300];
      var im = v.querySelector("img").getBoundingClientRect(); o.grande = [im.width > 250, im.height > 250]; return o; });
    await foto("b245-visor-abierto.png");
    var r1c = await p.evaluate(function () { var v = document.getElementById("visor"); v.querySelector(".vx").click(); return v.classList.contains("on"); });
    eq("tocar el chip abre el visor con la imagen y una X; la X lo cierra", [r1b.visor, r1c], [[true, true, true, true], false]);
    eq("el visor muestra la imagen grande", r1b.grande, [true, true]);
    /* ---------- 2) confirmación grande de No guardar ---------- */
    var r2 = await p.evaluate(function () { var o = {}; window.__g237open = {}; render(); solo();
      var card = document.querySelector(".aco226 .acor.g237"), bt = card.querySelector(":scope > .acob > .ac226 [data-acng]"), rb = bt.getBoundingClientRect(); o.btn = [Math.round(rb.left), Math.round(rb.top), Math.round(rb.bottom)];
      bt.click(); var q = document.getElementById("ng243"); if (!q) return { sin: true }; var r = q.getBoundingClientRect(), bs = q.querySelectorAll("button");
      o.q = [q.classList.contains("anc245"), getComputedStyle(q.querySelector(".q245")).fontSize, getComputedStyle(bs[0]).fontSize, Math.round(bs[0].getBoundingClientRect().height), Math.round(bs[1].getBoundingClientRect().height), [].map.call(bs, function (x) { return x.textContent; })];
      o.cerca = [Math.round(r.bottom), Math.round(r.top), r.left >= 0, r.right <= 390, (r.bottom <= rb.top + 1) || (r.top >= rb.bottom - 1)];
      o.pegado = Math.min(Math.abs(rb.top - r.bottom), Math.abs(r.top - rb.bottom)) <= 16;
      o.texto = q.querySelector(".q245").textContent; return o; });
    await foto("b245-no-guardar-confirmacion.png");
    eq("la confirmación sale anclada (popover) con letra de 17 px y botones Sí / No de 44 px", [r2.q[0], r2.q[1], r2.q[2], r2.q[3] >= 44, r2.q[4] >= 44, r2.q[5]], [true, "17px", "17px", true, true, ["Sí", "No"]]);
    eq("pegada al botón (a 16 px o menos), dentro de la pantalla, sin tapar el botón", [r2.pegado, r2.cerca[2], r2.cerca[3], r2.cerca[4]], [true, true, true, true]);
    eq("el texto sigue pidiendo la tarea", /¿Sí era de “Comedor Nuevo”\?/.test(r2.texto), true);
    await p.waitForTimeout(7200);
    var vivo7 = await p.evaluate(function () { return !!document.getElementById("ng243"); });
    await p.waitForTimeout(1200);
    var vivo9 = await p.evaluate(function () { return !!document.getElementById("ng243"); });
    eq("dura 8 s: a los 7.2 s sigue y a los 8.4 s ya no", [vivo7, vivo9], [true, false]);
    /* ---------- 4) lo saliente a la derecha ---------- */
    var r4 = await p.evaluate(function () { var o = {}, IMG = mkImg("#3a86ff", "#8338ec"), G = "Guillermo Herrera (padel Blanco)";
      function inn(tx, hace, ex) { var x = { k: "bi", wa_in: 1, wa_c: G, tipo: "texto", url: "", t: G + ": " + tx, ts: NOW - hace * 60000, h: hh(NOW - hace * 60000), wa_id: "i" + hace }; for (var k in (ex || {})) x[k] = ex[k]; return x; }
      function sal(tx, hace, ex) { var x = { k: "bi", wa_c: G, tipo: "texto", url: "", ts: NOW - hace * 60000, h: hh(NOW - hace * 60000), wa_id: "s" + hace }; for (var k in (ex || {})) x[k] = ex[k]; x.t = tx; return x; }
      var T = { id: "tCONS", nombre: "Proyectos Consejo Colonia Cumbres", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [
        inn("Kiuboles compadre, no sé nada, deja pregunto", 50),
        sal(G + ": ¿Qué ha habido, compadre? ¿Cómo andas? No le acabo de mandar al administrador", 48, { wa_in: 0 }),
        sal(G + ": Te marco mañana temprano", 46, { fromMe: true }),
        sal("Salvador: Gracias carnal, quedamos así", 44, { origen: "wa_saliente" }),
        sal("🎙️ Audio enviado: Oye, aquí hay otra colonia Cumbres, a lo mejor le pegaron", 42, { wa_in: 0, tipo: "audio_transcrito" }),
        sal(G + ": Va, ahí nos vemos", 40, { de: "salvador" }),
        sal("📷 Archivo enviado: wa_1791209996617.jpeg", 38, { wa_in: 0, tipo: "foto", url: IMG }),
        inn("Sale, gracias", 36)] };
      tareas = [T]; abierta = T.id; vista = "hilo"; render(); poneVista230(T, ""); window.__cnl = window.__cnl || {}; window.__cnl[T.id] = "todo"; window.__chatModo = window.__chatModo || {}; window.__chatModo[T.id] = "todo"; render(); solo();
      var bs = [].slice.call(document.querySelectorAll(".msgs [data-mix]")), W = 390;
      o.filas = bs.map(function (e) { var rc = e.getBoundingClientRect(); return [e.classList.contains("bo") ? "bo" : (e.classList.contains("bi") ? "bi" : "?"), rc.right >= 370, e.textContent.replace(/\s+/g, " ").trim().slice(0, 70)]; });
      o.sinNombre = bs.filter(function (e) { return e.classList.contains("bo"); }).every(function (e) { return !/Guillermo/.test(e.textContent); });
      var vb = bs.filter(function (e) { return e.classList.contains("bo"); })[0]; o.verde = vb ? getComputedStyle(vb).backgroundColor : "";
      var bi = bs.filter(function (e) { return e.classList.contains("bi"); })[0]; o.fondoIn = getComputedStyle(bi).backgroundColor; o.nombreEntrante = !!bi.querySelector(".cn");
      return o; });
    await foto("b245-mis-mensajes-derecha.png", 1500);
    eq("entrante a la izquierda con su nombre; los 6 salientes (wa_in 0, fromMe, origen wa_saliente, de salvador, foto enviada) a la derecha", r4.filas.map(function (f) { return f[0] + ":" + f[1]; }), ["bi:false", "bo:true", "bo:true", "bo:true", "bo:true", "bo:true", "bo:true", "bi:false"]);
    eq("los salientes salen sin el nombre del otro", [r4.sinNombre, r4.nombreEntrante], [true, true]);
    eq("el saliente va en el verde de Salvador, distinto del entrante", [r4.verde !== r4.fondoIn, r4.verde], [true, r4.verde]);
    eq("el texto del saliente conserva lo que dijo", [/^¿Qué ha habido, compadre\? ¿Cómo andas/.test(r4.filas[1][2]), /^Gracias carnal, quedamos así/.test(r4.filas[3][2])], [true, true]);
    /* ---------- 5) mover muchos ---------- */
    var r5 = await p.evaluate(function () { var o = {}, G = "Guillermo Herrera (padel Blanco)", S = "Samuel Cumbres", DIA = 86400000;
      var ms = [];
      for (var i = 0; i < 9; i++) ms.push({ k: "bi", wa_in: 1, wa_c: G, tipo: "texto", url: "", t: G + ": mensaje de pádel número " + (i + 1) + " del partido", ts: NOW - 3 * DIA + i * 60000, h: "10:0" + i, wa_id: "g" + i });
      for (var j = 0; j < 4; j++) ms.push({ k: "bi", wa_in: 1, wa_c: G, tipo: "texto", url: "", t: G + ": otro mensaje de hoy sobre el torneo " + (j + 1), ts: NOW - 30 * 60000 + j * 60000, h: hh(NOW - 30 * 60000 + j * 60000), wa_id: "h" + j });
      ms.push({ k: "bi", wa_in: 0, wa_c: G, tipo: "texto", url: "", t: "✉️ Enviado: Va, nos vemos en la cancha", ts: NOW - 20 * 60000, h: hh(NOW - 20 * 60000), wa_id: "gs1" });
      ms.push({ k: "bi", wa_in: 1, wa_c: S, tipo: "texto", url: "", t: S + ": Samuel, buenas noches, sabes algo del terreno de la esquina", ts: NOW - 10 * 60000, h: hh(NOW - 10 * 60000), wa_id: "sa1" });
      ms.push({ k: "bi", wa_in: 1, wa_c: S, tipo: "texto", url: "", t: S + ": No nada, déjame preguntar con el vecino", ts: NOW - 9 * 60000, h: hh(NOW - 9 * 60000), wa_id: "sa2" });
      ms.push({ nota_ia: 1, k: "bi", origen: "revisor", canal: "priv:salvador", t: "📝 Nota IA 23:10: no estoy seguro del tema", ts: NOW - 8 * 60000, h: hh(NOW - 8 * 60000), nid: "nia1" });
      var T = { id: "tCONS2", nombre: "Proyectos Consejo Colonia Cumbres", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: ms };
      var D = { id: "tPADEL2", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] };
      tareas = [T, D]; abierta = T.id; vista = "hilo"; render(); poneVista230(T, ""); window.__cnl = window.__cnl || {}; window.__chatModo = window.__chatModo || {}; window.__chatModo[T.id] = "todo";
      render(); var cn = canalesDe(T).filter(function (c) { return c.ext && /Guillermo/.test(c.nom); })[0]; o.canal = cn ? cn.id : null;
      o.barraEnTodo = !!document.querySelector(".lote245");
      window.__cnl[T.id] = cn.id; render(); solo();
      var br = document.querySelector(".lote245"); o.barra = br ? [br.textContent.replace(/\s+/g, " ").trim(), br.querySelectorAll("button").length] : null;
      return o; });
    await foto("b245-barra-mover-todos.png");
    eq("sin filtro en una persona no sale la barra", r5.barraEnTodo, false);
    eq("con el filtro en Guillermo: barra con Mover todos (14) · No guardar todos (14) (13 de él... 9 + 4 suyos y 1 de Salvador)", r5.barra, ["Guillermo · 14 mensajesMover todos (14)No guardar todos (14)", 2]);
    var r5b = await p.evaluate(function () { var o = {}; document.querySelector('[data-lote245="mover"]').click(); var v = document.getElementById("mov225"); if (!v) return { sin: true };
      o.desde = !!v.querySelector("#desde245"); o.cuenta = v.querySelector("#nd245").textContent; o.opciones = [].map.call(v.querySelectorAll(".opt226 .ot, .opt226 .two > span"), function (x) { return x.textContent; });
      var hoyIso = new Date(NOW).toISOString().slice(0, 10), loc = new Date(NOW); var ds = loc.getFullYear() + "-" + ("0" + (loc.getMonth() + 1)).slice(-2) + "-" + ("0" + loc.getDate()).slice(-2);
      var f = v.querySelector("#desde245"); f.value = ds; f.dispatchEvent(new Event("change")); o.cuentaHoy = v.querySelector("#nd245").textContent; f.value = ""; f.dispatchEvent(new Event("change")); o.cuentaTodos = v.querySelector("#nd245").textContent;
      return o; });
    await foto("b245-mover-todos-hoja.png");
    eq("la hoja ¿A dónde va? trae 'Solo desde <fecha>' con la cuenta", [r5b.desde, r5b.cuenta, r5b.cuentaHoy, r5b.cuentaTodos], [true, "14 mensajes", "5 mensajes", "14 mensajes"]);
    var r5c = await p.evaluate(function () { var o = {}, T = tareas[0], D = tareas[1]; __ESCR.length = 0; try { localStorage.removeItem("doit_hist240"); } catch (e) {}
      var v = document.getElementById("mov225"); var f = v.querySelector("#desde245"), loc = new Date(NOW); f.value = loc.getFullYear() + "-" + ("0" + (loc.getMonth() + 1)).slice(-2) + "-" + ("0" + loc.getDate()).slice(-2); f.dispatchEvent(new Event("change"));
      v.querySelector('[data-movto="tPADEL2"]').click();
      var G = T.msgs.filter(function (x) { return x.wa_c && /Guillermo/.test(x.wa_c); });
      o.ocultos = [G.filter(function (x) { return x.oculto; }).length, G.length]; o.samuel = T.msgs.filter(function (x) { return /Samuel/.test(x.wa_c || "") && !x.oculto; }).length; o.destino = D.msgs.length;
      var h = histLee240(); o.hist = [h.length, h[0] && h[0].que, h[0] && h[0].undo && h[0].undo.tipo, h[0] && h[0].undo && h[0].undo.items.length];
      var reglas = []; __ESCR.forEach(function (e) { var ar = e[2] && e[2].acomodo_reglas; if (ar) Object.keys(ar).forEach(function (k) { reglas.push([ar[k].contacto, ar[k].tipo, ar[k].mensajes, ar[k].lote === true, ar[k].tarea_destino]); }); });
      o.reglas = reglas; o.pill = !!document.getElementById("undopill");
      return o; });
    eq("solo desde hoy: se mueven 5 de Guillermo (los 4 de hoy + el saliente), los viejos y Samuel se quedan", [r5c.ocultos, r5c.samuel, r5c.destino], [[5, 14], 2, 5]);
    eq("Historial: UN renglón 'Movió 5 mensajes…' con Deshacer de lote", r5c.hist, [1, "Movió 5 mensajes de Guillermo a “Pádel Miércoles”", "mover_lote", 5]);
    eq("reglas en lote: UNA por contacto y tema (no una por mensaje)", r5c.reglas, [["Guillermo Herrera", "mover", 5, true, "tPADEL2"]]);
    eq("sale la pastilla 'Deshacer' al momento", r5c.pill, true);
    var r5d = await p.evaluate(function () { var o = {}, T = tareas[0], D = tareas[1]; var e = histLee240()[0]; var m = deshaz240(e);
      var G = T.msgs.filter(function (x) { return x.wa_c && /Guillermo/.test(x.wa_c); }); o.m = m; o.ocultos = G.filter(function (x) { return x.oculto; }).length; o.destino = D.msgs.length; o.hecho = histLee240()[0].hecho; return o; });
    eq("Deshacer del Historial regresa los 5 y limpia el destino", r5d, { m: "Deshecho: Movió 5 mensajes de Guillermo a “Pádel Miércoles”", ocultos: 0, destino: 0, hecho: true });
    /* No guardar todos */
    var r5e = await p.evaluate(function () { var o = {}, T = tareas[0]; render(); solo(); __ESCR.length = 0;
      document.querySelector('[data-lote245="ng"]').click(); var v = document.getElementById("mov225"); o.sheet = [v.querySelector(".mvh").textContent, !!v.querySelector("#desde245"), v.querySelectorAll("[data-movto]").length, v.querySelector("#ngt245").textContent];
      v.querySelector("[data-movplatica]").click();
      var G = T.msgs.filter(function (x) { return x.wa_c && /Guillermo/.test(x.wa_c); }); o.ocultos = [G.filter(function (x) { return x.oculto; }).length, G.filter(function (x) { return x.oculto_motivo === "platica"; }).length];
      var h = histLee240()[0]; o.hist = [h.que, h.undo && h.undo.tipo, h.undo && h.undo.tss.length]; o.pop = !!document.getElementById("ng243");
      var q = document.getElementById("ng243"); if (q) q.querySelector('[data-ngr="si"]').click();
      var reglas = []; __ESCR.forEach(function (e) { var ar = e[2] && e[2].acomodo_reglas; if (ar) Object.keys(ar).forEach(function (k) { reglas.push([ar[k].contacto, ar[k].tipo, ar[k].mensajes, ar[k].acierto_tema]); }); }); o.reglas = reglas;
      o.sam = T.msgs.filter(function (x) { return /Samuel/.test(x.wa_c || "") && !x.oculto; }).length; return o; });
    eq("No guardar todos: hoja corta (sin lista de tareas), con 'solo desde' y la cuenta", r5e.sheet, ["No guardar", true, 0, "No guardar 14 mensajes"]);
    eq("No guardar todos: los 14 quedan ocultos como plática, Historial con Deshacer y regla única", [r5e.ocultos, r5e.hist, r5e.pop, r5e.reglas, r5e.sam], [[14, 14], ["No guardar (14 mensajes)", "ng_lote", 14], true, [["Guillermo Herrera", "no_guardar", 14, true]], 2]);
    var r5f = await p.evaluate(function () { var T = tareas[0], e = histLee240()[0]; var m = deshaz240(e); var G = T.msgs.filter(function (x) { return x.wa_c && /Guillermo/.test(x.wa_c); }); return [m, G.filter(function (x) { return x.oculto; }).length]; });
    eq("Deshacer de No guardar todos los regresa", r5f, ["Deshecho: No guardar (14 mensajes)", 0]);
    /* ---------- selección por mantener presionado ---------- */
    var r6 = await p.evaluate(function () { var o = {}, T = tareas[0]; window.__cnl[T.id] = "todo"; poneVista230(T, ""); render(); solo(); window.__ESCR.length = 0;
      var bs = [].slice.call(document.querySelectorAll(".msgs [data-mix]")), b0 = bs.filter(function (e) { return /número 2 del partido/.test(e.textContent); })[0];
      var ops = leeOpcionesDe(b0); o.ops = ops.map(function (x) { return x[0]; }); ops[0][1]();
      o.bar = (function () { var br = document.getElementById("selbar245"); return br ? [br.textContent.replace(/\s+/g, " ").trim(), br.querySelectorAll("button").length] : null; })();
      var b1 = [].filter.call(document.querySelectorAll(".msgs [data-mix]"), function (e) { return /número 3 del partido/.test(e.textContent); })[0]; b1.click();
      var b2 = [].filter.call(document.querySelectorAll(".msgs [data-mix]"), function (e) { return /número 4 del partido/.test(e.textContent); })[0]; b2.click(); b2.click();
      o.marcados = document.querySelectorAll(".msgs .sel245").length; o.cuenta = document.querySelector("#selbar245 .sn").textContent; o.noAbrioDetalle = !document.getElementById("det242");
      return o; });
    await foto("b245-seleccion-barra.png");
    eq("mantener presionado un globo: la primera opción es Seleccionar", r6.ops[0], "Seleccionar");
    eq("barra de abajo: N seleccionados · Mover · No guardar · Nueva (+ cancelar)", r6.bar, ["1 seleccionadoMoverNo guardarNueva✕", 4]);
    eq("tocar marca y desmarca; sin abrir el detalle", [r6.marcados, r6.cuenta, r6.noAbrioDetalle], [2, "2 seleccionados", true]);
    var r7 = await p.evaluate(function () { var o = {}, T = tareas[0], D = tareas[1]; __ESCR.length = 0; try { localStorage.removeItem("doit_hist240"); } catch (e) {}
      document.querySelector('[data-sel245="mover"]').click(); var v = document.getElementById("mov225"); o.desde = !!v.querySelector("#desde245"); v.querySelector('[data-movto="tPADEL2"]').click();
      o.mov = [T.msgs.filter(function (x) { return x.oculto && x.movido_a; }).length, D.msgs.length, !!window.__sel245, !document.getElementById("selbar245")];
      var h = histLee240(); o.hist = [h.length, h[0].que, h[0].undo.tipo];
      var reglas = []; __ESCR.forEach(function (e) { var ar = e[2] && e[2].acomodo_reglas; if (ar) Object.keys(ar).forEach(function (k) { reglas.push([ar[k].contacto, ar[k].mensajes]); }); }); o.reglas = reglas;
      deshaz240(h[0]); o.vuelve = [T.msgs.filter(function (x) { return x.oculto; }).length, D.msgs.length];
      /* No guardar y Nueva desde la selección */
      var pon = function (re) { var b = [].filter.call(document.querySelectorAll(".msgs [data-mix]"), function (e) { return re.test(e.textContent); })[0]; return b; };
      render(); solo(); var l = ops2 = leeOpcionesDe(pon(/número 6 del partido/)); l[0][1](); pon(/número 7 del partido/).click(); document.querySelector('[data-sel245="ng"]').click();
      o.ng = [T.msgs.filter(function (x) { return x.oculto && x.oculto_motivo === "platica"; }).length, !!window.__sel245, histLee240()[0].undo.tipo];
      var q = document.getElementById("ng243"); if (q) q.remove();
      render(); solo(); leeOpcionesDe(pon(/número 8 del partido/))[0][1](); pon(/número 9 del partido/).click(); var nt = tareas.length; document.querySelector('[data-sel245="nueva"]').click(); (function(){ var ok=document.querySelector('[data-nom249="ok"]'); if(ok) ok.click(); })();
      o.nueva = [tareas.length === nt + 1, T.msgs.filter(function (x) { return x.oculto && x.movido_a; }).length, histLee240().filter(function (h) { return !/^Abri/.test(h.que); })[0].que.replace(/“.*”/, "“…”"), histLee240().filter(function (h) { return !/^Abri/.test(h.que); })[0].undo.tipo];
      return o; });
    eq("Mover desde la selección: sin 'solo desde', mueve los 2 marcados, cierra la selección", [r7.desde, r7.mov], [false, [2, 2, false, true]]);
    eq("Historial UN renglón con Deshacer; reglas: una por contacto", [r7.hist, r7.reglas], [[1, "Movió 2 mensajes de Guillermo a “Pádel Miércoles”", "mover_lote"], [["Guillermo Herrera", 2]]]);
    eq("Deshacer regresa los 2 y vacía el destino", r7.vuelve, [0, 0]);
    eq("No guardar desde la selección: 2 ocultos, se cierra la selección, Historial con Deshacer", r7.ng, [2, false, "ng_lote"]);
    eq("Nueva desde la selección: crea la tarea, pasan 2, un renglón del Historial con Deshacer", r7.nueva, [true, 2, "Movió 2 mensajes de Guillermo a “…”", "mover_lote"]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
