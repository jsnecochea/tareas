#!/usr/bin/env node
/* PRUEBAS build 244 (Salvador 6-oct 06:40, "Fiesta Cumpleaños Papá").
   1) "TE PREGUNTA · Jorge" ya contestada: si DESPUÉS de la pregunta hay un mensaje saliente de Salvador a ese mismo contacto (wa_in 0 /
   origen wa_saliente, los que manda desde su celular y la Mac registra en el hilo; o un globo suyo por WhatsApp) la tarjeta y el pendiente
   del Inicio (TE TOCA) se quitan solos. Un saliente a OTRO contacto, o ANTERIOR a la pregunta, no la quita. Mover sigue en la tarjeta.
   2) Fotos que salían como nombre de archivo ("Salvador N.S.: wa_1791128012427.jpeg"): miniatura sin el nombre; varias seguidas de la misma
   persona (<2 min) en UN globo en cuadrícula; sin url, ícono + "Foto"; en Importante el grupo cuenta como UN elemento.
   Correr: node tests/b244.test.js (CAP=<carpeta> para capturas) a 390 px */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 244", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 244, true);
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
    /* ---------- 1) TE PREGUNTA ya contestada ---------- */
    var r = await p.evaluate(function () {
      yo = "salvador"; var o = {}, NOW = Date.now();
      function solo() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      window.solo = solo;
      function hh(ms) { var d = new Date(ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
      var PREG = "Jorge Soto: ¿Qué onda Puesto, oye, te puedo llamar o andas ocupado?";
      function hilo(extra, conDuda) { var q = { k: "bi", wa_in: 1, wa_c: "Jorge Soto", t: PREG, ts: NOW - 50 * 60000, h: hh(NOW - 50 * 60000), wa_id: "jq" };
        if (conDuda) q.duda_tarea = { alternativa_id: "tPADEL", alternativa_nombre: "Pádel miércoles" };
        var ms = [{ k: "bi", wa_in: 1, wa_c: "Lalo Madero", t: "Lalo Madero: Ya quedó el salón para el sábado", ts: NOW - 90 * 60000, h: hh(NOW - 90 * 60000), wa_id: "l1" }, q].concat(extra || []);
        return { id: "tFIESTA", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: ms }; }
      function sal(c, tx, hace, extra) { var x = { k: "bi", wa_in: 0, wa_c: c, t: "✉️ Enviado: " + tx, ts: NOW - hace * 60000, h: hh(NOW - hace * 60000), tipo: "texto", wa_id: "s" + hace }; for (var k in (extra || {})) x[k] = extra[k]; return x; }
      function pide(t) { var p = preguntaParaMi(t); return p ? [p.de, p.ix] : null; }
      o.sinRespuesta = pide(hilo());
      o.salienteWaIn0 = pide(hilo([sal("Jorge Soto", "Ahorita te llamo", 49)]));
      o.salienteOrigen = pide(hilo([{ k: "bi", origen: "wa_saliente", chat: "Jorge Soto", t: "Salvador: Ya ando libre, llámame", ts: NOW - 45 * 60000, h: hh(NOW - 45 * 60000), tipo: "texto" }]));
      o.salienteSoloTelefono = pide(hilo([sal("", "Mejor mañana", 40, { tel: "8711234567" })]));
      o.aOtroContacto = pide(hilo([sal("Rogelio Sada", "Ya mero", 40)]));
      o.anteriorALaPregunta = pide(hilo([sal("Jorge Soto", "Qué onda Jorge", 120)]));
      o.programado = pide(hilo([sal("Jorge Soto", "luego te marco", 30, { prog: { a_las: { fecha: "2030-01-01", hora: "10:00" } } })]));
      o.globoSuyoWA = pide(hilo([{ k: "bo", de: "salvador", wa_c: "Jorge Soto", wa_auto: "Jorge Soto", t: "Te marco al rato", ts: NOW - 30 * 60000, h: hh(NOW - 30 * 60000) }]));
      o.sinTsPorOrden = (function () { var t = hilo([sal("Jorge Soto", "ya", 1)]); delete t.msgs[1].ts; delete t.msgs[2].ts; return pide(t); })();
      /* la tarjeta en la tarea y el pendiente del Inicio, con y sin respuesta */
      var PADEL = { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] };
      var A = hilo([sal("Jorge Soto", "Ahorita te llamo", 49)], true); tareas = [A, PADEL]; abierta = A.id; vista = "hilo"; render(); solo();
      o.tarjetaSin = [document.querySelectorAll(".ptcard").length, /TE PREGUNTA · Jorge/.test(document.getElementById("app").innerText)];
      abierta = null; vista = "lista"; render(); solo(); o.inicioSin = /Jorge te pregunta/i.test(document.getElementById("app").innerText);
      var B = hilo([sal("Jorge Soto", "Ahorita te llamo, andaba en la regadera", 49), { k: "bi", wa_in: 1, wa_c: "Jorge Soto", t: "Jorge Soto: Va, me dices", ts: NOW - 48 * 60000, h: hh(NOW - 48 * 60000), wa_id: "j2" }], true);
      tareas = [B, PADEL]; abierta = B.id; vista = "hilo"; render(); solo();
      o.tarjetaCon = document.querySelectorAll(".ptcard").length;
      return o; });
    /* captura: la Fiesta sin la tarjeta (Salvador sí contestó) */
    await p.evaluate(function () { var NOW = Date.now(); function hh(ms) { var d = new Date(ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
      var F = { id: "tFIESTA", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [
        { k: "bi", wa_in: 1, wa_c: "Lalo Madero", t: "Lalo Madero: Ya quedó el salón para el sábado, mil quinientos por el mariachi", ts: NOW - 90 * 60000, h: hh(NOW - 90 * 60000), wa_id: "l1" },
        { k: "bi", wa_in: 1, wa_c: "Jorge Soto", t: "Jorge Soto: ¿Qué onda Puesto, oye, te puedo llamar o andas ocupado?", ts: NOW - 50 * 60000, h: hh(NOW - 50 * 60000), wa_id: "jq", duda_tarea: { alternativa_id: "tPADEL", alternativa_nombre: "Pádel miércoles" } },
        { k: "bi", wa_in: 0, wa_c: "Jorge Soto", t: "✉️ Enviado: Ahorita te llamo, andaba en la regadera", ts: NOW - 49 * 60000, h: hh(NOW - 49 * 60000), tipo: "texto", wa_id: "s1" }] };
      tareas = [F, { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] }]; abierta = F.id; vista = "hilo"; poneVista230(F, ""); window.__cnl = window.__cnl || {}; window.__cnl[F.id] = "todo"; render(); solo(); });   /* vista Todo: se ve la pregunta y la respuesta */
    await foto("b244-fiesta-sin-tarjeta.png");
    eq("pregunta sin respuesta: sigue contando (Jorge)", r.sinRespuesta, ["Jorge", 1]);
    eq("saliente wa_in 0 al mismo contacto: ya no cuenta", r.salienteWaIn0, null);
    eq("saliente origen wa_saliente (chat por nombre): ya no cuenta", r.salienteOrigen, null);
    eq("saliente sin nombre de contacto (solo teléfono) en el hilo: cuenta como respuesta", r.salienteSoloTelefono, null);
    eq("saliente a OTRO contacto: la pregunta sigue", r.aOtroContacto, ["Jorge", 1]);
    eq("saliente ANTERIOR a la pregunta: la pregunta sigue", r.anteriorALaPregunta, ["Jorge", 1]);
    eq("mensaje programado (aún no sale): la pregunta sigue", r.programado, ["Jorge", 1]);
    eq("globo suyo por WhatsApp (bo con wa_auto) después: ya no cuenta", r.globoSuyoWA, null);
    eq("sin hora en los mensajes, cuenta por el orden del hilo", r.sinTsPorOrden, null);
    eq("tarea con respuesta: sin tarjeta TE PREGUNTA", r.tarjetaSin, [0, false]);
    eq("Inicio: sin 'Jorge te pregunta' en TE TOCA cuando ya contestó", r.inicioSin, false);
    eq("pregunta nueva de Jorge DESPUÉS de la respuesta: la tarjeta vuelve", r.tarjetaCon, 1);
    var rm = await p.evaluate(function () { var NOW = Date.now(), hh = function (ms) { var d = new Date(ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
      var A = { id: "tFIESTA", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [
        { k: "bi", wa_in: 1, wa_c: "Jorge Soto", t: "Jorge Soto: ¿Qué onda Puesto, oye, te puedo llamar o andas ocupado?", ts: NOW - 50 * 60000, h: hh(NOW - 50 * 60000), wa_id: "jq", duda_tarea: { alternativa_id: "tPADEL", alternativa_nombre: "Pádel miércoles" } }] };
      tareas = [A, { id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", msgs: [] }]; abierta = A.id; vista = "hilo"; render();
      return [document.querySelectorAll(".ptcard").length, [].map.call(document.querySelectorAll(".ptcard .ac226 button"), function (x) { return x.textContent; })]; });
    eq("sin respuesta y fuera de tema: la tarjeta sigue y ofrece Mover", [rm[0], rm[1].indexOf("Mover") >= 0], [1, true]);
    /* ---------- 2) fotos ---------- */
    var r2 = await p.evaluate(function () { var o = {}, NOW = Date.now() - 3 * 3600000;
      function hh(ms) { var d = new Date(ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
      function mk(c, c2) { var cv = document.createElement("canvas"); cv.width = 240; cv.height = 240; var g = cv.getContext("2d"), gr = g.createLinearGradient(0, 0, 240, 240); gr.addColorStop(0, c); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, 240, 240);
        g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.arc(170, 70, 34, 0, 7); g.fill(); g.fillStyle = "rgba(0,0,0,.28)"; g.beginPath(); g.moveTo(0, 240); g.lineTo(90, 120); g.lineTo(160, 190); g.lineTo(200, 150); g.lineTo(240, 240); g.fill(); return cv.toDataURL("image/png"); }
      window.IMG = [mk("#3a86ff", "#8338ec"), mk("#ff7b00", "#ffd60a"), mk("#2a9d8f", "#264653"), mk("#e63946", "#f4a261"), mk("#6a994e", "#a7c957")];
      function w(i, nom, hace, extra) { var x = { k: "bi", wa_in: 1, wa_c: "Salvador N.S.", t: "Salvador N.S.: " + nom, ts: NOW + hace, h: hh(NOW + hace), wa_id: "f" + i, tipo: "foto", url: IMG[i % 5] }; for (var k in (extra || {})) x[k] = extra[k]; return x; }
      var T = { id: "tFIESTA", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [
        { k: "bi", wa_in: 1, wa_c: "Salvador N.S.", t: "Salvador N.S.: Aquí les mando cómo quedó el salón por dentro", ts: NOW - 60000, h: hh(NOW - 60000), wa_id: "t0" },
        w(0, "wa_1791128012427.jpeg", 0), w(1, "wa_1791128014011.jpeg", 20000), w(2, "wa_1791128031577.jpeg", 45000), w(3, "wa_1791128090020.jpg", 70000),
        { k: "bi", wa_in: 1, wa_c: "Salvador N.S.", t: "Salvador N.S.: Los de la mesa principal son los últimos", ts: NOW + 120000, h: hh(NOW + 120000), wa_id: "t1" },
        w(4, "wa_1791128500000.png", 130000),
        w(0, "wa_1791129999999.jpeg", 135000 + 150000),          /* >2 min después: otro globo */
        { k: "bi", wa_in: 1, wa_c: "Lalo Madero", t: "Lalo Madero: wa_1791130000001.webp", ts: NOW + 600000, h: hh(NOW + 600000), wa_id: "l1", url: IMG[1] },
        { k: "bi", wa_in: 1, wa_c: "Lalo Madero", t: "Lalo Madero: wa_1791130000002.heic", ts: NOW + 610000, h: hh(NOW + 610000), wa_id: "l2" },       /* sin url */
        { k: "bi", wa_in: 1, wa_c: "Cynthia", t: "Cynthia: wa_1791130000003.jpeg", ts: NOW + 700000, h: hh(NOW + 700000), wa_id: "c1" },               /* sin url, sola */
        { k: "bi", wa_in: 0, wa_c: "Salvador N.S.", t: "📷 Archivo enviado: wa_1791130000004.jpeg", ts: NOW + 800000, h: hh(NOW + 800000), wa_id: "e1", tipo: "foto", url: IMG[2] },
        { k: "bi", wa_in: 1, wa_c: "Cynthia", t: "Cynthia: [foto] mira este mueble para el comedor", ts: NOW + 900000, h: hh(NOW + 900000), wa_id: "c2", tipo: "foto", url: IMG[3] }] };
      window.T244 = T; tareas = [T]; abierta = T.id; vista = "hilo"; poneVista230(T, "imp"); render(); solo();
      var msgs = [].slice.call(document.querySelectorAll(".msgs [data-mix]"));
      o.imp = msgs.map(function (e) { return e.classList.contains("bfoto244") ? ["FOTOS", e.querySelectorAll(".ft244").length, e.querySelectorAll("img").length, (e.querySelector(".fn244") || {}).textContent || ""] : e.textContent.replace(/\s+/g, " ").trim().slice(0, 40); });
      o.sinNombreArchivo = !/wa_\d+\.(jpe?g|png|webp|heic)/i.test(document.querySelector(".msgs").textContent);
      o.grupo4 = (function () { var g = document.querySelector(".bfoto244.c2"); return g ? [g.querySelectorAll(".ft244").length, getComputedStyle(g.querySelector(".gf244")).gridTemplateColumns.split(" ").length, 1] : null; })();
      var g0 = document.querySelector(".bfoto244"); var rc = g0.getBoundingClientRect(); o.ancho = [Math.round(rc.width), rc.left >= 0, rc.right <= 390];
      o.sinUrl = [].map.call(document.querySelectorAll(".ft244.sin"), function (e) { return e.textContent.trim(); });
      o.tamSinUrl = (function () { var e = document.querySelector(".ft244.sin"); var r3 = e.getBoundingClientRect(); return r3.width > 40 && r3.height > 40; })();
      return o; });
    await p.waitForTimeout(500);
    var cargan = await p.evaluate(function () { var im = [].slice.call(document.querySelectorAll(".bfoto244 img")); return [im.length, im.filter(function (i) { return i.naturalWidth > 0; }).length]; });
    await foto("b244-fotos-cuadricula.png", 2300);
    eq("las miniaturas con url cargan (data:)", cargan, [cargan[0], cargan[0]]);
    eq("fotos sueltas sin url: salen como 'Foto' con ícono (no el nombre del archivo)", r2.sinUrl, ["Foto", "Foto"]);
    eq("el texto de la lista nunca trae wa_….jpeg/png/webp/heic", r2.sinNombreArchivo, true);
    var gr = r2.imp.filter(function (x) { return x[0] === "FOTOS"; });
    eq("Importante: 4 fotos seguidas (<2 min) = UN globo de 4, con nombre de quien las mandó", gr[0], ["FOTOS", 4, 4, "Salvador N.S."]);
    eq("Importante: tras un texto, la foto siguiente es otro globo; la de >2 min después, otro más", [gr[1], gr[2]], [["FOTOS", 1, 1, "Salvador N.S."], ["FOTOS", 1, 1, "Salvador N.S."]]);
    eq("Importante: 2 de Lalo (una con url y otra sin) van en UN globo; Cynthia sola sin url, aparte", [gr[3], gr[4]], [["FOTOS", 2, 1, "Lalo Madero"], ["FOTOS", 1, 0, "Cynthia"]]);
    eq("la foto enviada por Salvador (wa_in 0, 'Archivo enviado:') es miniatura sin nombre", [gr[5][0], gr[5][1], gr[5][2], gr[5][3]], ["FOTOS", 1, 1, ""]);
    eq("la foto con texto de verdad sigue como mensaje", r2.imp.filter(function (x) { return typeof x === "string" && /mira este mueble/.test(x); }).length, 1);
    eq("cuadrícula de 4: 2 columnas", r2.grupo4, [4, 2, 1]);
    eq("el globo cabe en 390 px", r2.ancho[1] && r2.ancho[2], true);
    eq("el hueco sin url tiene tamaño de miniatura", r2.tamSinUrl, true);
    /* en Todo: lo mismo, un globo por grupo; tocar una miniatura abre el visor con las del grupo */
    var r3 = await p.evaluate(function () { var o = {}; poneVista230(T244, ""); window.__cnl = window.__cnl || {}; window.__cnl[T244.id] = "todo"; render(); solo();
      o.todo = [].map.call(document.querySelectorAll(".msgs .bfoto244"), function (e) { return e.querySelectorAll(".ft244").length; });
      o.todoSinNombre = !/wa_\d+\.(jpe?g|png|webp|heic)/i.test(document.querySelector(".msgs").textContent);
      document.querySelectorAll(".bfoto244")[0].querySelectorAll("button.ft244")[2].click();
      var v = document.getElementById("visor"); o.visor = [v.classList.contains("on"), /3 de 4/.test(v.textContent), !!v.querySelector("img")];
      v.classList.remove("on");
      document.querySelectorAll(".bfoto244")[0].click();
      o.detalle = !!document.getElementById("det242"); var d = document.getElementById("det242"); if (d) d.remove();
      return o; });
    eq("Todo: mismos globos (4 · 1 · 1 · 2 · 1 · 1)", r3.todo, [4, 1, 1, 2, 1, 1]);
    eq("Todo: tampoco sale el nombre del archivo", r3.todoSinNombre, true);
    eq("tocar la 3ª miniatura abre el visor en '3 de 4'", r3.visor, [true, true, true]);
    eq("tocar el globo (fuera de la miniatura) sigue abriendo el detalle", r3.detalle, true);
    /* separador entre dos globos de la misma persona: fotos con 2 min exactos de distancia NO se juntan */
    var r4 = await p.evaluate(function () { var NOW = Date.now() - 600000; var mk = function (i, d) { return { k: "bi", wa_in: 1, wa_c: "Rogelio Sada", t: "Rogelio Sada: wa_" + i + ".jpeg", ts: NOW + d, h: "10:00", wa_id: "r" + i, url: IMG[i % 5] }; };
      var T = { id: "tR", nombre: "Prueba", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [mk(1, 0), mk(2, 119000), mk(3, 119000 + 120000)] };
      tareas = [T]; abierta = T.id; vista = "hilo"; poneVista230(T, "imp"); render();
      return [].map.call(document.querySelectorAll(".msgs .bfoto244"), function (e) { return e.querySelectorAll(".ft244").length; }); });
    eq("1m59s se junta; 2m00s exactos ya es otro globo", r4, [2, 1]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
