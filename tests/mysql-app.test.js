#!/usr/bin/env node
/* La app completa (390 px) con el motor MySQL: prueba_claude lee sus tareas de push.php simulado (fs_lista) y no del
   onSnapshot de Firestore; al guardar escribe en los dos (fs_set + Firestore). Salvador sigue en Firestore y la app
   no llama a fs_lista. Firebase simulado. Correr: node tests/mysql-app.test.js */
"use strict";
var path = require("path"), IDX = path.join(__dirname, "..", "index.html");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), errs = [];
  async function pagina() {
    var ctx = await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), p = await ctx.newPage();
    p.on("pageerror", function (e) { errs.push(e.message); });
    await p.route(/^https?:/, function (r) { r.abort(); });
    await p.addInitScript(function () { var P = function () { return Promise.resolve(); }; window.__snaps = {}; window.__fsSet = [];
      function col(name) { var q = { doc: function (id) { return { get: function () { return Promise.resolve({ exists: false, data: function () { return {}; } }); },
          set: function (d) { window.__fsSet.push({ col: name, id: id, nombre: d && d.nombre }); return P(); }, delete: P, onSnapshot: function () {} }; },
        where: function () { return q; }, limit: function () { return q; }, orderBy: function () { return q; }, get: function () { return Promise.resolve({ size: 0, docs: [], forEach: function () {} }); },
        onSnapshot: function (f) { (window.__snaps[name] = window.__snaps[name] || []).push(f); return function () {}; } }; return q; }
      var fs0 = { enablePersistence: P, collection: col, settings: function () {} };
      window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function (cb) { window.__authCb = cb; }, signOut: P }; } };
      window.firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = function () {}; };
      /* push.php simulado */
      window.__srv = { tareas: { tMY1: { nombre: "Tarea que vive en MySQL", duenio: "prueba_claude", estado: "abierta", tipo_item: "tarea", f_vigente: "2026-10-20", msgs: [] } }, llamadas: [] };
      var f0 = window.fetch;
      window.fetch = function (url, op) {
        var s = String(url); if (s.indexOf("push.php") < 0) return f0 ? f0.apply(this, arguments) : Promise.reject(new Error("sin red"));
        var u = new URL(s, "https://doit.ok-doit.com/"), a = u.searchParams.get("action"), c = op && op.body ? JSON.parse(op.body) : null;
        window.__srv.llamadas.push(a);
        function r(j) { return Promise.resolve(new Response(JSON.stringify(j), { status: 200, headers: { "content-type": "application/json" } })); }
        if (a === "fs_lista") return r(Object.keys(window.__srv.tareas).map(function (k) { return Object.assign({ id: k }, window.__srv.tareas[k]); }));
        if (a === "fs_set") { window.__srv.tareas[c.id] = Object.assign({}, window.__srv.tareas[c.id] || {}, c.data); return r({ ok: true }); }
        return r({ ok: true });
      };
      try { localStorage.setItem("bit_avisos_visto_salvador", "1"); localStorage.setItem("bit_avisos_visto_prueba_claude", "1"); } catch (e) {} });
    await p.goto("file://" + IDX); await p.waitForTimeout(400); return { ctx: ctx, p: p };
  }
  try {
    /* 1 · prueba_claude en MySQL */
    var A = await pagina();
    await A.p.evaluate(function () { APP_TOKEN = "tok-prueba"; PERSONAS.prueba_claude = PERSONAS.prueba_claude || { nombre: "prueba_claude", ini: "?", jefe: false }; entrar("prueba_claude"); });
    await A.p.waitForFunction(function () { return typeof tareas !== "undefined" && tareas.some(function (t) { return t.id === "tMY1"; }); }, null, { timeout: 5000 }).catch(function () {});
    var e1 = await A.p.evaluate(function () { return { motor: datosTareas.motor(), ids: tareas.map(function (t) { return t.id; }), snapFS: (window.__snaps.bitacora_tareas || []).length, lista: window.__srv.llamadas.indexOf("fs_lista") >= 0 }; });
    eq("prueba_claude: motor MySQL", e1.motor, "mysql");
    eq("prueba_claude: la tarea llega de fs_lista", [e1.lista, e1.ids.indexOf("tMY1") >= 0], [true, true]);
    eq("prueba_claude: no se engancha al onSnapshot de tareas de Firestore", e1.snapFS, 0);
    var e2 = await A.p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "tMY1"; })[0]; t.ultima = "probado desde la app"; guarda(t);
      return new Promise(function (ok) { setTimeout(function () { ok({ my: window.__srv.tareas.tMY1.ultima, fs: window.__fsSet.filter(function (x) { return x.id === "tMY1"; }).length > 0, cola: datosTareas.pendientes() }); }, 400); }); });
    eq("guarda(): escribe en MySQL y en Firestore, sin nada en cola", e2, { my: "probado desde la app", fs: true, cola: 0 });
    await A.ctx.close();
    /* 2 · salvador también en MySQL (MySQL es el de todos) */
    var B = await pagina();
    await B.p.evaluate(function () { APP_TOKEN = "tok-prueba"; entrar("salvador"); }); await B.p.waitForTimeout(600);
    var e3 = await B.p.evaluate(function () { return { motor: datosTareas.motor(), snapFS: (window.__snaps.bitacora_tareas || []).length, lista: window.__srv.llamadas.indexOf("fs_lista") >= 0 }; });
    eq("salvador: MySQL, sin onSnapshot de tareas y con fs_lista", e3, { motor: "mysql", snapFS: 0, lista: true });
    await B.ctx.close();
    eq("sin errores de página", errs.filter(function (m) { return !/firebase is not defined/.test(m); }), []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
