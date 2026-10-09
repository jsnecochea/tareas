#!/usr/bin/env node
/* Cada quien ve solo lo suyo y puede cerrar sesión. La app completa (390 px) con el motor MySQL: fs_lista entrega
   la base COMPLETA (tareas de Salvador, de Josué y de Samuel, propuestas de la Mac sin dueño, por autorizar, en
   espera sin nombre…), como hace el servidor. Josué entra con su correo por el camino real (onAuthStateChanged →
   resuelveAcceso) y no debe ver nada de Salvador en ninguna vista; Salvador (jefe) sigue viendo lo de su equipo.
   «Cerrar sesión» (⋯ del inicio) pide confirmación, limpia lo local de la sesión y regresa al login.
   Firebase simulado. Correr: node tests/sesion.test.js */
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
    await p.addInitScript(function () { var P = function () { return Promise.resolve(); }; window.__snaps = {}; window.__salio = 0;
      function col(name) { var q = { doc: function (id) { return { get: function () { return Promise.resolve({ exists: false, data: function () { return {}; } }); }, set: P, delete: P, onSnapshot: function () {} }; },
        where: function () { return q; }, limit: function () { return q; }, orderBy: function () { return q; }, get: function () { return Promise.resolve({ size: 0, docs: [], forEach: function () {} }); },
        onSnapshot: function (f) { (window.__snaps[name] = window.__snaps[name] || []).push(f); return function () {}; } }; return q; }
      var fs0 = { enablePersistence: P, collection: col, settings: function () {} };
      window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; },
        auth: function () { return { onAuthStateChanged: function (cb) { window.__authCb = cb; }, signOut: function () { window.__salio++; return P(); } }; } };
      window.firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = function () {}; };
      var H = new Date(), hoy = H.getFullYear() + "-" + String(H.getMonth() + 1).padStart(2, "0") + "-" + String(H.getDate()).padStart(2, "0");
      window.__srv = { tareas: {
        tS1: { nombre: "Salvador hoy", duenio: "salvador", estado: "abierta", tipo_item: "tarea", f_vigente: hoy, msgs: [] },
        tS2: { nombre: "Salvador vencida", duenio: "salvador", estado: "abierta", tipo_item: "tarea", f_vigente: "2026-09-01", msgs: [] },
        tS3: { nombre: "Propuesta mac sin dueno", creada_por: "mac", estado: "abierta", f_vigente: hoy, msgs: [] },
        tS4: { nombre: "Salvador por autorizar", creada_por: "claude", duenio: "salvador", por_autorizar: true, estado: "abierta", f_vigente: "", msgs: [] },
        tS5: { nombre: "Salvador espera sin nombre", duenio: "salvador", estado: "espera", f_vigente: hoy, msgs: [] },
        tS6: { nombre: "Salvador falta finiquito", creada_por: "ia_revisor", duenio: "salvador", estado: "abierta", f_vigente: "", en_revision: true, msgs: [{ k: "bo", de: "salvador", t: "hola", ts: 1 }] },
        tM1: { nombre: "Samuel sin escalar", duenio: "samuel", estado: "abierta", tipo_item: "tarea", f_vigente: "2026-12-01", msgs: [] },
        tJ1: { nombre: "Josue propia", duenio: "josue", estado: "abierta", tipo_item: "tarea", f_vigente: hoy, msgs: [] },
        tJ2: { nombre: "Salvador revisa Josue", duenio: "salvador", revisores: ["josue"], estado: "abierta", tipo_item: "tarea", f_vigente: hoy, msgs: [] },
        tJ3: { nombre: "Salvador espera a Josue", duenio: "salvador", estado: "espera", espera: "josue", f_vigente: hoy, msgs: [] }
      } };
      var f0 = window.fetch;
      window.fetch = function (url, op) {
        var s = String(url); if (s.indexOf("push.php") < 0) return f0 ? f0.apply(this, arguments) : Promise.reject(new Error("sin red"));
        var u = new URL(s, "https://doit.ok-doit.com/"), a = u.searchParams.get("action");
        function r(j) { return Promise.resolve(new Response(JSON.stringify(j), { status: 200, headers: { "content-type": "application/json" } })); }
        if (a === "fs_lista") return r(Object.keys(window.__srv.tareas).map(function (k) { return Object.assign({ id: k }, window.__srv.tareas[k]); }));
        return r({ ok: true });
      };
      try { localStorage.setItem("bit_avisos_visto_josue", "1"); localStorage.setItem("bit_avisos_visto_salvador", "1"); } catch (e) {} });
    await p.goto("file://" + IDX); await p.waitForTimeout(300); return { ctx: ctx, p: p };
  }
  function visto(p) {
    return p.evaluate(function () {
      var G = ["esperan", "bandeja", "hoy", "venc", "prox", "enc", "rev", "comp", "claude"], txt = document.getElementById("app").innerText;
      G.forEach(function (g) { abreGrupoInicio(g); txt += "\n" + document.getElementById("app").innerText; cierraGrupoInicio(); });
      return { yo: yo, ids: tareas.map(function (t) { return t.id; }).sort(), txt: txt };
    });
  }
  try {
    /* 1 · Josué entra con su correo y ve solo lo suyo y lo que le toca */
    var A = await pagina();
    await A.p.evaluate(function () { APP_TOKEN = "tok-prueba"; window.__authCb({ email: "jescamilla@gruponec.com.mx", displayName: "Josué Escamilla" }); });
    await A.p.waitForFunction(function () { return typeof tareas !== "undefined" && tareas.some(function (t) { return t.id === "tJ1"; }); }, null, { timeout: 6000 }).catch(function () {});
    var j = await visto(A.p);
    eq("josue: entra como josue", j.yo, "josue");
    eq("josue: en su teléfono solo lo suyo, lo que revisa y lo que lo espera", j.ids, ["tJ1", "tJ2", "tJ3"]);
    eq("josue: ninguna vista pinta tareas de Salvador ni de Samuel",
      ["Salvador Hoy", "Salvador Vencida", "Propuesta Mac", "Salvador Por Autorizar", "Salvador Espera Sin", "Salvador Falta Finiquito", "Samuel Sin"].filter(function (s) { return j.txt.toLowerCase().indexOf(s.toLowerCase()) >= 0; }), []);
    eq("josue: sí ve la suya", j.txt.toLowerCase().indexOf("josue propia") >= 0, true);
    eq("josue: sin ejemplos sembrados", (await A.p.evaluate(function () { return tareas.some(function (t) { return esEjemplo(t); }); })), false);
    /* 2 · Cerrar sesión: ⋯ del inicio → confirma → limpia lo local y regresa al login */
    await A.p.evaluate(function () { localStorage.setItem("doit_cola_mysql", "{}"); localStorage.setItem("doit_motor_tareas", "mysql"); });
    var dlg = []; A.p.on("dialog", function (d) { dlg.push(d.message()); d.accept(); });
    var hay = await A.p.evaluate(function () { var b = document.getElementById("bhmas"); if (!b) return "sin ⋯"; b.click(); var s = document.getElementById("hmsalir"); return s ? s.textContent.trim() : "sin botón"; });
    eq("⋯ del inicio trae «Cerrar sesión»", hay, "Cerrar sesión");
    var nav = A.p.waitForNavigation({ timeout: 8000 }).catch(function () {});
    await A.p.evaluate(function () { document.getElementById("hmsalir").click(); });
    await nav; await A.p.waitForTimeout(300);
    eq("pide confirmación con el nombre", dlg.length === 1 && /Cerrar sesión de Josué/.test(dlg[0]), true);
    var s = await A.p.evaluate(function () { window.__authCb(null);
      return { bit_u: localStorage.getItem("bit_u"), cola: localStorage.getItem("doit_cola_mysql"), motor: localStorage.getItem("doit_motor_tareas"),
        login: !!document.getElementById("bgoogle") && document.getElementById("gate").classList.contains("on"), yo: yo }; });
    eq("tras cerrar sesión: login y sin datos locales de la sesión", s, { bit_u: null, cola: null, motor: null, login: true, yo: null });
    await A.ctx.close();
    /* 3 · Josué cancela: no sale */
    var C = await pagina();
    await C.p.evaluate(function () { APP_TOKEN = "tok-prueba"; entrar("josue"); }); await C.p.waitForTimeout(400);
    C.p.on("dialog", function (d) { d.dismiss(); });
    var c = await C.p.evaluate(function () { return cerrarSesion().then(function (r) { return { r: r, yo: yo, salio: window.__salio }; }); });
    eq("cancelar no cierra la sesión", c, { r: false, yo: "josue", salio: 0 });
    await C.ctx.close();
    /* 4 · Salvador (jefe) sigue viendo lo de su equipo */
    var B = await pagina();
    await B.p.evaluate(function () { APP_TOKEN = "tok-prueba"; window.__authCb({ email: "jsnecochea@gruponec.com.mx", displayName: "Salvador" }); });
    await B.p.waitForFunction(function () { return typeof tareas !== "undefined" && tareas.length > 3; }, null, { timeout: 6000 }).catch(function () {});
    var sv = await B.p.evaluate(function () { return { yo: yo, ids: tareas.map(function (t) { return t.id; }).sort(), cuenta: (vista = "yo", render(), !!document.getElementById("bsalir")) }; });
    eq("salvador: recibe todas las del equipo", sv.ids, ["tJ1", "tJ2", "tJ3", "tM1", "tS1", "tS2", "tS3", "tS4", "tS5", "tS6"]);
    eq("salvador: entra como salvador", sv.yo, "salvador");
    eq("Tu cuenta también trae «Cerrar sesión»", sv.cuenta, true);
    await B.ctx.close();
    eq("sin errores de página", errs.filter(function (m) { return !/firebase is not defined/.test(m); }), []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
