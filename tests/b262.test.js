#!/usr/bin/env node
/* PRUEBAS build 262: UN solo motor de parecidas y de busqueda en Vincular y Mover. 390 px. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 262", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 262, true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    window.__SWH = []; try { Object.defineProperty(navigator, "serviceWorker", { value: { addEventListener: function (t, f) { window.__SWH.push(f); }, register: function () { return Promise.resolve({}); }, ready: Promise.resolve({}) }, configurable: true }); } catch (e) {}
    var RD = Date, base = RD.parse("2026-10-06T13:20:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true };
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      document.getElementById("app").style.display = "flex"; window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      var N = Date.now();
      var T = function (id, nombre, ctx, extra) { var t = { id: id, nombre: nombre, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-20", contexto: ctx || "", msgs: [] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.arma = function () { var o = T("tVAL", "Vales Restaurante Denominaciones", "", { wa_contactos: [{ nombre: "mar" }] });
        o.msgs = [{ k: "bi", wa_in: 1, wa_c: "mar", t: "mar: Los vales del restaurante son de $500 y de $1,000", ts: N - 300000, h: "07:00" },
                  { k: "bi", wa_in: 1, wa_c: "mar", t: "mar: ¿Cuántos vales de $500 te mando?", ts: N - 250000, h: "07:01" }];
        tareas = [o,
          T("tPRO", "Proyectos Consejo Colonia Cumbres", "Obras y proyectos del consejo de la colonia."),
          T("tFIE", "Fiesta Navideña", "Posada de diciembre."),
          T("tBLU", "Blue Cup", "Torneo."),
          T("tCOB", "Cobranza Moric Pádel Draw", "Control de cobro de anuncios del restaurante Moric con vales de septiembre.", { wa_contactos: [{ nombre: "Moric" }] }),
          T("tEST", "Estado de Cuenta", "Banco."),
          T("tIQO", "IQOSA", "Asunto de la empresa."),
          T("tLER", "Mantenimiento Casa Lerdo", "Reparación de la casa de Lerdo."),
          T("tELO", "Mantenimiento Casa Eloísa", "Arreglo de la azotea de la residencia.")];
        abierta = "tVAL"; vista = "hilo"; window.__sug262 = {}; window.__sem262 = {}; render(); };
      window.nombresDe = function (sel) { return [].map.call(document.querySelectorAll(sel), function (b) { return { n: b.querySelector(".ot,.enln").childNodes[0].textContent.trim(), par: /parecida/.test(b.textContent) }; }); };
      window.abreV = function () { var c = document.getElementById("enlv"); if (c) c.remove(); abreEnlazar("tVAL"); };
      window.abreM = function () { var c = document.getElementById("mov225"); if (c) c.remove(); abreMover225(tareas[0], 0, [0, 1]); };
    });
    await p.evaluate(function () { arma(); window.preguntaAClaude = function (m, mo, cb) { window.__LLM = (window.__LLM || 0) + 1; cb("", "sin servidor"); }; });
    /* 1) mismas parecidas en Vincular y en Mover */
    var V = await p.evaluate(function () { abreV(); return nombresDe("#enll .enlr[data-d]"); });
    var M = await p.evaluate(function () { abreM(); return nombresDe("#mops253 .opt226"); });
    var par = function (L) { return L.filter(function (x) { return x.par; }).map(function (x) { return x.n; }); };
    eq("Vincular: Cobranza Moric es la primera parecida", par(V)[0], "Cobranza Moric Pádel Draw");
    eq("Mover: Cobranza Moric es la primera parecida", par(M)[0], "Cobranza Moric Pádel Draw");
    eq("Vincular y Mover dan las MISMAS parecidas", par(M), par(V));
    eq("Proyectos Consejo Colonia Cumbres no es parecida", par(V).indexOf("Proyectos Consejo Colonia Cumbres"), -1);
    var rest = function (L) { return L.filter(function (x) { return !x.par; }).map(function (x) { return x.n; }).filter(function (n) { return n !== "Vales Restaurante Denominaciones"; }); };
    var alf = function (L) { return L.slice().sort(function (a, b) { return a.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase() < b.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase() ? -1 : 1; }); };
    eq("Vincular: el resto va alfabético", rest(V), alf(rest(V)));
    eq("Mover: el resto va alfabético", rest(M), alf(rest(M)));
    eq("Mover: sin 'más probable'", await p.evaluate(function () { return /m[aá]s probable/.test(document.getElementById("mov225").innerText); }), false);
    eq("Mover: la tarea de origen queda en gris 'aquí cayó'", await p.evaluate(function () { return !!document.querySelector("#mops253 .tag.aqui262"); }), true);
    eq("Mover: la marca 'parecida' se ve completa a 390 px", await p.evaluate(function () { var t = document.querySelector("#mops253 .sim262 .tag"); var r = t.getBoundingClientRect(); return r.width > 20 && r.right <= 390; }), true);
    eq("Vincular: la marca 'parecida' visible", await p.evaluate(function () { abreV(); var t = document.querySelector("#enll .enlsim"); var r = t.getBoundingClientRect(); return r.width > 20 && r.right <= 390; }), true);
    eq("Vincular y Mover: tiene buscador y '+ Crear tarea nueva'", await p.evaluate(function () { abreV(); var a = !!document.getElementById("enlq") && !!document.getElementById("enlcrea"); document.getElementById("enlv").remove(); abreM(); return a && !!document.getElementById("mbus253") && !!document.querySelector(".nueva259"); }), true);
    await foto("b262-1-mover.png");
    await p.evaluate(function () { abreV(); }); await foto("b262-2-vincular.png");
    /* 2) búsquedas */
    var bus = async function (q) { return p.evaluate(function (q) { abreV(); var i = document.getElementById("enlq"); i.value = q; i.dispatchEvent(new Event("input")); var a = nombresDe("#enll .enlr[data-d]").map(function (x) { return x.n; }); abreM(); var m = document.getElementById("mbus253"); m.value = q; m.dispatchEvent(new Event("input")); return { v: a, m: [].map.call(document.querySelectorAll("#mres253 .ot"), function (e) { return e.textContent; }) }; }, q); };
    var rs = [["cobro moric", "Cobranza Moric Pádel Draw"], ["vales restaurante", "Cobranza Moric Pádel Draw"], ["anuncio padel", "Cobranza Moric Pádel Draw"], ["mantenimiento lerdo", "Mantenimiento Casa Lerdo"], ["arreglo azotea", "Mantenimiento Casa Eloísa"], ["cobransa moric", "Cobranza Moric Pádel Draw"]];
    for (var i = 0; i < rs.length; i++) { var r = await bus(rs[i][0]); eq("Buscar “" + rs[i][0] + "” (Vincular)", r.v[0], rs[i][1]); eq("Buscar “" + rs[i][0] + "” (Mover)", r.m[0], rs[i][1]); }
    await foto("b262-3-busqueda.png");
    /* 3) cerebro ligero: se usa con confianza baja y respeta la caché */
    var L = await p.evaluate(async function () {
      window.__LLM = 0; window.__sug262 = {}; var tr = tareas[0]; tr.nombre = "Asunto zeta"; tr.msgs = [{ k: "bi", wa_in: 1, wa_c: "zeta", t: "zeta: ya quedó el asunto de la glosa", ts: Date.now(), h: "08:00" }];
      window.preguntaAClaude = function (m, mo, cb) { window.__LLM++; window.__MODO = mo; (window.__P=window.__P||[]).push(String(m[0].content).slice(0,60)); setTimeout(function () { cb(JSON.stringify({ ids: ["tEST"] })); }, 10); };
      abreEnlazar("tVAL"); await espera(150); var a = nombresDe("#enll .enlr[data-d]"); var llam = window.__LLM; var modo = window.__MODO; document.getElementById("enlv").remove();
      abreEnlazar("tVAL"); await espera(100); var llam2 = window.__LLM; document.getElementById("enlv").remove();
      return { P: window.__P, primera: a[0], llam: llam, modo: modo, llam2: llam2 }; });
    eq("Confianza baja: el cerebro ligero (rapido) ordena y su elegida sale primero con 'parecida'", [L.primera.n, L.primera.par, L.modo], ["Estado de Cuenta", true, "rapido"]);
    eq("1 llamada por hoja y caché de 10 min", [L.llam, L.llam2], [1, 1]);
    var S = await p.evaluate(async function () {
      [].forEach.call(document.querySelectorAll("#enlv,#mov225"), function (e) { e.remove(); }); await espera(700); arma(); window.__LLM = 0; window.preguntaAClaude = function (m, mo, cb) { window.__LLM++; (window.__P2=window.__P2||[]).push(String(m[0].content).slice(0,50)); setTimeout(function () { cb(JSON.stringify({ ids: ["tFIE"] })); }, 5); };
      abreEnlazar("tVAL"); var i = document.getElementById("enlq"); i.value = "xqzw pendiente"; i.dispatchEvent(new Event("input")); await espera(300); var antes = window.__LLM; await espera(500);
      var n = nombresDe("#enll .enlr[data-d]").map(function (x) { return x.n; }); return { P2: window.__P2, antes: antes, desp: window.__LLM, n: n }; });
    eq("Búsqueda semántica: con debounce de 600 ms y suma al cerebro ligero", [S.antes, S.desp, S.n.indexOf("Fiesta Navideña") >= 0], [0, 1, true]);
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + e.message); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
