#!/usr/bin/env node
/* PRUEBAS build 285 (Salvador 8-oct). 390 px, reloj fijo jue 2026-10-08 9:00 (Monterrey).
   1) «Tu historial» hasta abajo del home: lo que hizo el usuario actual HOY, lo más reciente arriba (hora · tarea · qué hizo, en
      segunda persona, ícono SVG por tipo); ignora lo de otros usuarios y «Abrió la tarea»; picar el renglón abre la tarea;
      «Ver días anteriores» carga 7 días más; sin nada hoy: «Hoy no has movido nada todavía». Eliminar y renombrar dejan rastro.
   2) Secciones plegables: día nuevo → todas plegadas menos «Decide tú»; tocar el encabezado abre/cierra y se recuerda en el día
      (localStorage con la fecha); al día siguiente amanecen plegadas otra vez; contador visible plegada; encabezado ≥44 px,
      chevron que gira, aria-expanded; el resumen de abajo abre la sección plegada. Nada de fondo rojo.
   Correr: node tests/b285.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 285", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 285, true);
eq("sw.js con versión >= 285", +((/var SW_VERSION = 'build (\d+)'/.exec(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")) || [0, 0])[1]) >= 285, true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    var RD = Date, base = RD.parse("2026-10-08T15:00:00Z"), t0 = RD.now(); window.__dt = 0;
    var ahora = function () { return base + RD.now() - t0 + (window.__dt || 0); };
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(ahora()).toString(); if (!a.length) return new RD(ahora()); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = ahora; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true;
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      pideWhatsApp = function () { return Promise.resolve({ id: "p" }); };
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      document.getElementById("app").style.display = "flex";
      window.home = function (L) { [].forEach.call(document.querySelectorAll("#preg249,#hoja254,#acom249,.leemask,.cnlbg,.cnlsheet"), function (e) { e.remove(); }); if (L) tareas = L; abierta = null; vista = "lista"; render(); };
      window.base = function (id, nom, extra) { var o = { id: id, nombre: nom, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
        f_vigente: "2026-10-08", f_original: "2026-10-08", fecha_dictada: true, contexto: "Tarea de prueba con contexto suficiente para que no falte nada de contexto en la ficha de la tarea y se vea completa.", ritmo: "diario", resumen: { plan: [] }, msgs: [{ k: "bo", de: "salvador", t: "Va", ts: Date.now() - 100000, h: "07:00" }] }; for (var k in extra) o[k] = extra[k]; return o; };
      window.FX = function () { return [
        base("tDEC", "Cámaras bodega", { f_vigente: "2026-10-20", f_original: "2026-10-20", decision: { pregunta: "¿Cuál cotización autorizo?", opciones: [{ nombre: "Dahua" }, { nombre: "Hikvision", recomendada: true }], ts: Date.now() - 3600000 } }),
        base("tFAL", "Bomba jardín", { f_vigente: "2026-10-20", f_original: "2026-10-20", contexto: "", pendiente_info: "¿Quién revisa la bomba?" }),
        base("tVEN", "Pagar predial", { f_vigente: "2026-10-05", f_original: "2026-10-05" }),
        base("tHOY", "Llamar a Manuel", {}),
        base("tHOY2", "Comedor Nuevo", {}),
        base("tFUT", "Revisar escrituras", { f_vigente: "2026-10-30", f_original: "2026-10-30" }) ]; };
      window.cab = function (sel) { var e = document.querySelector(sel); if (!e) return null; var r = e.getBoundingClientRect(), c = e.querySelector(".ch285");
        return { exp: e.getAttribute("aria-expanded"), alto: r.height >= 44, chev: !!c, gira: c ? getComputedStyle(c).transform : "", cuenta: (e.querySelector("em,.ttn") || {}).textContent || "" }; };
      window.visible = function (sel) { var e = document.querySelector(sel); return !!(e && e.getClientRects().length && getComputedStyle(e).display !== "none"); };
      window.hist = function () { return [].map.call(document.querySelectorAll(".hist285 .h285r"), function (r) { return [r.querySelector(".h285n").textContent, r.querySelector(".h285q").textContent]; }); };
    });

    /* ===== 2) plegado: día nuevo → todo plegado menos «Decide tú» ===== */
    var A = await p.evaluate(function () { try { localStorage.clear(); } catch (e) {} window.__pl285 = null; home(FX());
      return { dec: cab('.sc284[aria-label="Decide tú"] .hd284'), decV: visible('.sc284[aria-label="Decide tú"] .bl284'),
        preg: cab('.sc284[aria-label="Te pregunta Doit"] .hd284'), pregV: visible('.sc284[aria-label="Te pregunta Doit"] .bl284'),
        venc: cab("#sec272-venc"), vencV: visible(".l-venc"), hoy: cab("#sec272-hoy"), hoyV: visible(".l-hoy"),
        fut: cab("#bfut"), futL: !!document.querySelector("#bfut + .list, .pl270 .list"), hi: cab("#sec285-hist"), hiV: visible(".hist285 .bl285"),
        orden: [].map.call(document.querySelectorAll(".sc284,.sep270,.clh263,.est272"), function (e) { return e.getAttribute("aria-label") || e.className.split(" ")[0]; }).slice(-2) }; });
    eq("día nuevo: «Decide tú» abierta (con su contenido visible)", [A.dec && A.dec.exp, A.decV], ["true", true]);
    eq("día nuevo: Te pregunta Doit, Vencidas mías, Hoy mías, Mías futuras y Tu historial plegadas", [A.preg && A.preg.exp, A.pregV, A.venc && A.venc.exp, A.vencV, A.hoy && A.hoy.exp, A.hoyV, A.fut && A.fut.exp, A.futL, A.hi && A.hi.exp, A.hiV],
      ["false", false, "false", false, "false", false, "false", false, "false", false]);
    eq("plegadas muestran su contador", [A.preg.cuenta, A.venc.cuenta, A.hoy.cuenta, A.fut.cuenta], ["1", "1", "2", "1"]);
    eq("encabezados ≥44 px con chevron", [A.dec.alto, A.dec.chev, A.preg.alto, A.venc.alto, A.venc.chev, A.hoy.alto, A.hi.alto, A.hi.chev, A.fut.chev], [true, true, true, true, true, true, true, true, true]);
    eq("el chevron gira: abierto rotado, plegado sin rotar", [A.dec.gira !== "none", A.venc.gira], [true, "none"]);
    eq("«Tu historial» va hasta abajo, después del resumen", A.orden, ["Lo que te toca", "Tu historial"]);

    /* toggle: se abre y se recuerda en el día (re-render y localStorage con la fecha) */
    var T = await p.evaluate(function () { document.getElementById("sec272-hoy").click(); var a = [cab("#sec272-hoy").exp, visible(".l-hoy")];
      document.querySelector('.sc284[aria-label="Decide tú"] .hd284').click(); var d = [cab('.sc284[aria-label="Decide tú"] .hd284').exp, visible('.sc284[aria-label="Decide tú"] .bl284')];
      window.__pl285 = null; home(); var c = [cab("#sec272-hoy").exp, visible(".l-hoy"), cab('.sc284[aria-label="Decide tú"] .hd284').exp];
      var ls = JSON.parse(localStorage.getItem("doit_pleg285_salvador_2026-10-08") || "null");
      document.getElementById("bfut").click(); var f = [cab("#bfut").exp, !!document.querySelector(".pl270 .list"), verFuturas];
      return { a: a, d: d, c: c, ls: ls && ls.o, f: f }; });
    eq("tocar «Hoy mías» la abre", T.a, ["true", true]);
    eq("tocar «Decide tú» la pliega", T.d, ["false", false]);
    eq("lo que abrió/cerró se recuerda en el día (aun recargando)", T.c, ["true", true, "false"]);
    eq("localStorage con la fecha guarda lo tocado", T.ls, { hoy: true, decide: false });
    eq("«Mías futuras» usa el mismo estado del día", T.f, ["true", true, true]);

    /* al día siguiente: otra vez todo plegado menos «Decide tú» */
    var N = await p.evaluate(function () { window.__dt = 24 * 3600000; window.__pl285 = null; home(FX().map(function (t) { if (t.id !== "tDEC" && t.id !== "tFUT") { t.f_vigente = "2026-10-09"; } return t; }));
      var r = { dec: cab('.sc284[aria-label="Decide tú"] .hd284').exp, hoy: cab("#sec272-hoy").exp, hoyV: visible(".l-hoy"), fut: cab("#bfut").exp, viejo: localStorage.getItem("doit_pleg285_salvador_2026-10-08") };
      document.getElementById("sec272-hoy").click(); r.viejo2 = localStorage.getItem("doit_pleg285_salvador_2026-10-08"); window.__dt = 0; window.__pl285 = null; return r; });
    eq("día siguiente: amanecen plegadas otra vez, «Decide tú» abierta", [N.dec, N.hoy, N.hoyV, N.fut], ["true", "false", false, "false"]);
    eq("el estado del día anterior se aparta al guardar el de hoy", [N.viejo !== null, N.viejo2], [true, null]);

    /* el resumen de abajo («2 hoy») abre su sección plegada */
    var E = await p.evaluate(function () { localStorage.clear(); window.__pl285 = null; home(FX()); var b = document.querySelector('[data-est272="hoy"]'); if (!b) return null; b.click(); return [cab("#sec272-hoy").exp, visible(".l-hoy")]; });
    eq("tocar «2 hoy» del resumen abre «Hoy mías»", E, ["true", true]);

    /* ===== 1) «Tu historial» ===== */
    var V = await p.evaluate(function () { localStorage.clear(); window.__pl285 = null; window.__histRemoto240 = []; ponAbre285("hist", true); home(FX());
      return [cab("#sec285-hist").cuenta, (document.querySelector(".hist285 .h285v") || {}).textContent, document.querySelectorAll(".hist285 .h285r").length]; });
    eq("sin acciones hoy: «Hoy no has movido nada todavía»", V, ["", "Hoy no has movido nada todavía", 0]);

    var H = await p.evaluate(async function () { localStorage.clear(); window.__pl285 = null; window.__histRemoto240 = []; ponAbre285("hist", true); home(FX());
      var T = function (id) { return tareas.filter(function (x) { return x.id === id; })[0]; };
      var ayer = Date.now() - 20 * 3600000;   /* 7 oct, 14:00 */
      localStorage.setItem("doit_hist240", JSON.stringify([
        { id: "hA", ts: ayer, tid: "tFUT", tnom: "Revisar escrituras", que: "Dictado: “ya llegaron las copias”", por: "salvador" },
        { id: "hO", ts: Date.now() - 60000, tid: "tHOY", tnom: "Llamar a Manuel", que: "Movió la fecha al 9 oct", por: "luismario" } ]));
      window.__histRemoto240 = [{ id: "hR", ts: Date.now() - 30 * 60000, tid: "tHOY2", tnom: "Comedor Nuevo", que: "Acomodo: OK", por: "salvador" }];
      window.__dt += 60000; hist240("Abrió la tarea", T("tVEN"), null);
      window.__dt += 60000; mueveFecha(T("tVEN"), "2026-10-12");
      window.__dt += 60000; hist240("Vinculó a “Comedor Nuevo”", T("tHOY"), null);
      window.__dt += 60000; hist240("Contestó la decisión: Hikvision", T("tDEC"), null);
      window.__dt += 60000; cierraHecha(T("tHOY2"));
      window.__dt += 60000; cierraSinEjecutar(T("tFAL"), "ya_no_aplica");
      home(); await espera(20);
      var filas = hist(), horas = [].map.call(document.querySelectorAll(".hist285 .h285h"), function (x) { return x.textContent; });
      var icos = [].map.call(document.querySelectorAll(".hist285 .h285i"), function (x) { return !!x.querySelector("svg"); });
      var rojo = [], sec = document.querySelector(".hist285"); [sec].concat([].slice.call(sec.querySelectorAll("*"))).forEach(function (el) { var g = getComputedStyle(el), m = (g.backgroundColor.match(/\d+(\.\d+)?/g) || []).map(Number);
        if ((m.length < 4 || m[3] > 0) && m[0] > 150 && m[0] - m[1] > 60 && m[0] - m[2] > 60) rojo.push(el.className); });
      var bl = getComputedStyle(sec.querySelector(".bl284")), hd = getComputedStyle(sec.querySelector(".hd284 span"));
      return { filas: filas, horas: horas.length, h0: horas[0], icos: icos, cuenta: cab("#sec285-hist").cuenta, rojo: rojo, estilo: [bl.backgroundColor, bl.borderRadius, hd.fontSize, hd.fontWeight],
        n16: getComputedStyle(sec.querySelector(".h285n")).fontSize, h13: getComputedStyle(sec.querySelector(".h285h")).fontSize, emoji: /[\u{1F300}-\u{1FAFF}☀-➿]/u.test(sec.textContent) }; });
    eq("historial de hoy, lo más reciente arriba, en segunda persona; sin «Abrió la tarea» ni lo de otro usuario ni lo de ayer", H.filas, [
      ["Bomba Jardín", "Eliminaste la tarea (ya no aplica)"],
      ["Comedor Nuevo", "Cerraste · Ya está"],
      ["Cámaras bodega", "Respondiste Decide tú: «Hikvision»"],
      ["Llamar a Manuel", "Vinculaste con “Comedor Nuevo”"],
      ["Pagar Predial", "Cambiaste la fecha del lun 5 oct al lun 12 oct"],
      ["Comedor Nuevo", "Autorizaste acomodo"]]);
    eq("contador del día, hora en cada renglón (9:06 a. m.) e ícono SVG por renglón, sin emoji", [H.cuenta, H.horas, H.h0, H.icos.every(Boolean), H.emoji], ["6", 6, "9:06 a. m.", true, false]);
    eq("estilo 284: bloque #1C1C1E radio 14, encabezado 20px bold, tarea 16px, hora 13px", [H.estilo, H.n16, H.h13], [["rgb(28, 28, 30)", "14px", "20px", "700"], "16px", "13px"]);
    eq("nada de fondo rojo en «Tu historial»", H.rojo, []);

    var M = await p.evaluate(function () { document.getElementById("bhist285").click(); var f = hist(), d = [].map.call(document.querySelectorAll(".hist285 .h285d"), function (x) { return x.textContent; });
      return { ult: f[f.length - 1], n: f.length, dias: d, ventana: window.__hist285dias }; });
    eq("«Ver días anteriores» carga 7 días más (lo de ayer, con su día)", M, { ult: ["Revisar escrituras", "Dictaste: “ya llegaron las copias”"], n: 7, dias: ["Ayer"], ventana: 7 });

    var O = await p.evaluate(function () { var r = document.querySelector('.hist285 .h285r[data-h285="tDEC"]'); r.click(); return [vista, abierta]; });
    eq("picar el renglón abre la tarea", O, ["hilo", "tDEC"]);

    /* otro usuario en el mismo teléfono solo ve lo suyo */
    var U = await p.evaluate(function () { window.__hist285dias = 0; yo = "luismario"; PERSONAS.luismario = PERSONAS.luismario || { nombre: "Luis Mario" }; window.__pl285 = null; ponAbre285("hist", true); home();
      var r = hist(); yo = "salvador"; window.__pl285 = null; return r; });
    eq("cada usuario ve solo lo suyo", U, [["Llamar a Manuel", "Cambiaste la fecha al 9 oct"]]);

    /* renombrar deja rastro */
    var R = await p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "tHOY"; })[0]; abierta = "tHOY"; vista = "hilo"; editaNombre = "tHOY"; render();
      var e = document.getElementById("enom"); if (!e) return "sin campo"; e.value = "Llamar a Manuel Parra"; e.dispatchEvent(new Event("blur")); if (e.onblur) e.onblur(); if (e.onkeydown) e.onkeydown({ key: "Enter", preventDefault: function () {} });
      return histLee240().filter(function (x) { return x.tid === "tHOY" && /^Cambió el nombre/.test(x.que); }).map(function (x) { return tu285(x.que); })[0] || "nada"; });
    eq("cambiar el nombre queda en el historial", R, "Renombraste a “Llamar a Manuel Parra” (era “Llamar a Manuel”)");

    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) console.log("FALLAS:\n" + malas.join("\n")); else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
