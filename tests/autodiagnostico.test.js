#!/usr/bin/env node
/* PRUEBAS · autodiagnóstico y regreso (build 288).
   1) Vigía de errores del navegador: agrupa por firma, sin datos personales, cuenta repeticiones,
      atrapa promesas, guarda en localStorage y escribe UNA vez en bitacora_personas/<usuario>.errores_app.
   2) Arranque fallido (error de sintaxis en el script principal) → firma "arranque_fallido" y botón "Volver a intentar".
   3) vigia/humo.js: build bueno → ARRANCA (0); copia rota → NO ARRANCA (2).
   4) vigia/umbral.js: errores nuevos de más → supera; los de otro build o viejos no cuentan.
   5) vigia/regreso.js en un repo de juguete: revierte el build N en su rama, sin tocar main; con --publicar lo pone en main.
   Correr: node tests/autodiagnostico.test.js */
"use strict";
var fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var RAIZ = path.join(__dirname, ".."), html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
var BUILD = +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1];   /* el build vigente, no un número fijo */
eq("versión >= 288", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 288, true);
eq("el vigía va antes de Firebase", html.indexOf('<script id="vigia-errores">') > 0 && html.indexOf('<script id="vigia-errores">') < html.indexOf("firebase-app-compat.js"), true);
eq("el marcador de arranque es el último renglón del script principal", /window\.__doitArranco=Date\.now\(\);\n<\/script>\n<\/body>/.test(html), true);

/* ---- 4) umbral (Node puro) ---- */
var U = require(path.join(RAIZ, "vigia", "umbral.js")), AH = 1e12, PUB = AH - 10 * 60000;
var P = [
  { id: "salvador", errores_app: { eA: { msg: "x is not a function", donde: "vHilo", tipo: "error", n: 6, primero: PUB + 1000, ultimo: AH - 1000, build: 288, pantalla: "hilo" },
                                    eViejo: { msg: "viejo", donde: "f", tipo: "error", n: 50, primero: PUB - 999999, ultimo: AH - 1000, build: 288 },
                                    eOtro: { msg: "otro build", donde: "g", tipo: "error", n: 50, primero: PUB + 1, ultimo: AH, build: 287 } } },
  { id: "josue", errores_app: { eA: { msg: "x is not a function", donde: "vHilo", tipo: "error", n: 5, primero: PUB + 2000, ultimo: AH - 2000, build: 288, pantalla: "home" } } },
  { id: "chuy" }
];
var r = U.evaluaUmbral(P, { build: 288, desde: PUB, ahora: AH });
eq("umbral: 11 errores nuevos del build → supera", [r.supera, r.total, r.firmas.length, r.firmas[0].personas], [true, 11, 1, ["salvador", "josue"]]);
eq("umbral: no cuentan los de otro build ni los que ya existían", r.firmas.map(function (g) { return g.firma; }), ["eA"]);
eq("umbral: el aviso trae firma y dónde, y dice que no se publicó", /«x is not a function» en vHilo .*firma eA.*no se publicó/.test(U.textoAviso(288, r)), true);
eq("umbral: pocos errores → no supera", U.evaluaUmbral([P[1]], { build: 288, desde: PUB, ahora: AH }).supera, false);
eq("umbral: fuera de la ventana de 15 min → no cuenta", U.evaluaUmbral(P, { build: 288, desde: PUB, ahora: AH + 20 * 60000 }).total, 0);
eq("umbral: un arranque fallido es fatal", U.evaluaUmbral([{ id: "a", errores_app: { eZ: { msg: "arranque_fallido", tipo: "arranque", n: 1, primero: PUB + 5, ultimo: AH, build: 288 } } }], { build: 288, desde: PUB, ahora: AH }).fatal, true);

/* ---- 5) regreso en un repo de juguete ---- */
(function () {
  var d = fs.mkdtempSync(path.join(os.tmpdir(), "regreso-")), g = function (a) { return cp.execFileSync("git", a, { cwd: d, encoding: "utf8" }).trim(); };
  g(["init", "-q", "-b", "main"]); g(["config", "user.email", "t@t"]); g(["config", "user.name", "t"]);
  fs.mkdirSync(path.join(d, "vigia")); fs.copyFileSync(path.join(RAIZ, "vigia", "regreso.js"), path.join(d, "vigia", "regreso.js"));
  var w = function (b, extra) { fs.writeFileSync(path.join(d, "index.html"), 'var VERSION_APP = "build ' + b + ' · x";\n' + (extra || "")); g(["add", "."]); g(["commit", "-qm", "b" + b]); };
  w(287, "bien\n"); w(288, "roto\n"); fs.writeFileSync(path.join(d, "otro.txt"), "arreglo encima"); g(["add", "."]); g(["commit", "-qm", "encima de 288"]);
  var R = require(path.join(d, "vigia", "regreso.js"));
  var x = R.regreso({ build: 288, local: true, rama: "main" });
  eq("regreso: revierte el build y lo que vino encima, en su rama", [x.ok, x.rama, x.revertidos.length, x.publicado], [true, "regreso/build-288", 2, false]);
  eq("regreso: la rama queda como el build 287", fs.readFileSync(path.join(d, "index.html"), "utf8"), 'var VERSION_APP = "build 287 · x";\nbien\n');
  eq("regreso: main no se tocó", g(["show", "main:index.html"]).indexOf("build 288") >= 0, true);
  eq("regreso: commit con pie de Claude", /Co-Authored-By: Claude Opus 5\.5/.test(g(["log", "-1", "--format=%B"])), true);
  g(["checkout", "-q", "main"]);
  var y = R.regreso({ build: 288, local: true, rama: "main", publicar: true, sinPruebas: true });
  eq("regreso --publicar: queda listo para main", [y.ok, y.publicado], [true, true]);
  eq("regreso: build inexistente → error claro", R.regreso({ build: 999, local: true, rama: "main" }).ok, false);
})();

(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch();
  var mock = function () { var P0 = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P0, collection: function () { return { doc: function () { return { set: P0, get: P0, delete: P0, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P0 }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P0 }; } }; window.firebase.auth.GoogleAuthProvider = function () {}; };
  try {
    /* ---- 1) vigía en la app que sí arranca ---- */
    var ctx = await b.newContext({ viewport: { width: 390, height: 844 } }), p = await ctx.newPage();
    await p.route(/^https?:/, function (r) { r.abort(); });
    await p.addInitScript(mock);
    await p.goto("file://" + path.join(RAIZ, "index.html")); await p.waitForTimeout(400);
    eq("la app arrancó (marcador puesto)", await p.evaluate(function () { return !!window.__doitArranco && !!window.doitErrores; }), true);
    await p.evaluate(function () { yo = "salvador"; window.__SETS = [];
      db = { collection: function (c) { return { doc: function (id) { return { set: function (d, o) { __SETS.push({ c: c, id: id, d: JSON.parse(JSON.stringify(d)), merge: !!(o && o.merge) }); return Promise.resolve(); } }; } }; } };
      vista = "hilo";
      function falla() { throw new Error('No encontré "Juan Pérez" tel 8112345678 juan.perez@gmail.com en https://x.com/?t=123'); }
      for (var i = 0; i < 7; i++) setTimeout(falla, 0);
      setTimeout(function () { Promise.reject(new TypeError("Cannot read properties of undefined (reading 'nombre')")); }, 0);
    });
    await p.waitForTimeout(300);
    var F = await p.evaluate(function () { return window.doitErrores.firmas(); }), ks = Object.keys(F);
    var fa = ks.map(function (k) { return F[k]; }).filter(function (x) { return x.tipo === "error"; })[0] || {};
    var fp = ks.map(function (k) { return F[k]; }).filter(function (x) { return x.tipo === "promesa"; })[0] || {};
    eq("7 veces el mismo error → UNA firma con n=7", [ks.length, fa.n], [2, 7]);
    eq("sin datos personales en la firma", /Juan|Pérez|8112|gmail|x\.com|123/.test(JSON.stringify(F)), false);
    eq("el mensaje queda legible y genérico", fa.msg, "No encontré «…» tel # <correo> en <url>");
    eq("dónde: el nombre de la función", fa.donde.split(" < ")[0], "falla");
    eq("trae build y pantalla", [fa.build, fa.pantalla], [BUILD, "hilo"]);
    eq("la promesa rechazada también se atrapa", fp.msg, "Cannot read properties of undefined (reading «…»)");
    var e1 = await p.evaluate(function () { var r = window.doitErrores.envia(); return { r: r, sets: __SETS.slice() }; });
    var s1 = e1.sets[0] || { d: {} };
    eq("se escribe con merge en bitacora_personas/<usuario>.errores_app", [e1.sets.length, s1.c, s1.id, s1.merge, Object.keys(s1.d.errores_app || {}).length], [1, "bitacora_personas", "salvador", true, 2]);
    await p.waitForTimeout(50);
    eq("lo ya enviado no se vuelve a mandar", await p.evaluate(function () { var r = window.doitErrores.envia(); return [r, __SETS.length]; }), [false, 1]);
    eq("queda en localStorage", await p.evaluate(function () { return Object.keys(JSON.parse(localStorage.getItem("doit_errores_app"))).length; }), 2);
    await p.evaluate(function () { setTimeout(function falla() { throw new Error("otra vez"); }, 0); });
    await p.waitForTimeout(100);
    var e2 = await p.evaluate(function () { window.doitErrores.envia(); return __SETS[1] && Object.keys(__SETS[1].d.errores_app); });
    eq("un error nuevo manda solo esa firma", (e2 || []).length, 1);
    await ctx.close();

    /* ---- 2) arranque fallido: error de sintaxis en el script principal ---- */
    var tmp = fs.mkdtempSync(path.join(os.tmpdir(), "roto-")), roto = path.join(tmp, "index.html");
    fs.writeFileSync(roto, html.replace("window.__doitArranco=Date.now();", "window.__doitArranco=Date.now();\nvar = ;"));
    var c2 = await b.newContext({ viewport: { width: 390, height: 844 } }), p2 = await c2.newPage(), errs = [];
    p2.on("pageerror", function (e) { errs.push(e.message); });
    await p2.route(/^https?:/, function (r) { r.abort(); });
    await p2.addInitScript(mock); await p2.addInitScript(function () { window.__probarRescate = true; window.__vigiaEsperaArranque = 600; });
    await p2.goto("file://" + roto); await p2.waitForTimeout(1200);
    var R2 = await p2.evaluate(function () { var F = window.doitErrores.firmas(); return { arranco: !!window.__doitArranco, tipos: Object.keys(F).map(function (k) { return F[k].tipo + ":" + F[k].msg.slice(0, 16); }).sort(), boton: !!document.getElementById("rescateBtn") }; });
    eq("el script roto no arranca", R2.arranco, false);
    eq("se anotan el error de sintaxis y el arranque fallido", R2.tipos, ["arranque:arranque_fallido", "error:SyntaxError: Une"]);
    eq("aparece 'Volver a intentar'", R2.boton, true);
    await c2.close();
    var c3 = await b.newContext(), p3 = await c3.newPage();
    await p3.route(/^https?:/, function (r) { r.abort(); });
    await p3.goto("file://" + path.join(RAIZ, "index.html")); await p3.waitForTimeout(800);
    eq("en file:// sin bandera de prueba no sale el panel", await p3.evaluate(function () { return !document.getElementById("rescate"); }), true);
    await c3.close();
    await b.close();

    /* ---- 3) humo.js ---- */
    var H = require(path.join(RAIZ, "vigia", "humo.js"));
    var hb = await H.humo("file://" + path.join(RAIZ, "index.html"), { espera: 8000 });
    eq("humo: el build bueno ARRANCA", [hb.arranco, hb.build], [true, BUILD]);
    var hr = await H.humo("file://" + roto, { espera: 3000 });
    eq("humo: la copia rota NO ARRANCA", hr.arranco, false);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); try { await b.close(); } catch (_e) {} }
  malas.forEach(function (m) { console.log("  X " + m); });
  console.log("RESULTADO " + ok + "/" + n); process.exit(malas.length ? 1 : 0);
})();
