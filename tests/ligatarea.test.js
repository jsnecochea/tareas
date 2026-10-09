#!/usr/bin/env node
/* Liga a una tarea (?recordatorio=<id>) desde WhatsApp del bot o una notificación. 390 px, Firebase simulado.
   1) Con sesión abre la tarea. 2) Sin sesión: el login por redirect (navegador dentro de WhatsApp, popup bloqueado)
   regresa SIN el parámetro y aun así abre la tarea (queda en localStorage, como ?alta=). 3) Cache vacía primero:
   espera al servidor. 4) Tarea fusionada: abre la tarea en que quedó. 5) Id que no existe o descartada: aviso claro.
   Correr: node tests/ligatarea.test.js */
"use strict";
var path = require("path"), IDX = path.join(__dirname, "..", "index.html");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var SAL = { email: "jsnecochea@gruponec.com.mx", displayName: "Salvador" };
var T = [{ id: "tREAL", nombre: "Comedor nuevo", duenio: "salvador", estado: "abierta", tipo_item: "tarea", f_vigente: "2026-10-20", msgs: [] }];
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), errs = [];
  async function pagina(url) {
    var ctx = await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), p = await ctx.newPage();
    p.on("pageerror", function (e) { errs.push(e.message); });
    await p.route(/^https?:/, function (r) { r.abort(); });
    await p.addInitScript(function () { var P = function () { return Promise.resolve(); }; window.__snaps = {};
      function col(name) { var q = { doc: function () { return { get: function () { return Promise.resolve({ exists: false, data: function () { return {}; } }); }, set: P, delete: P, onSnapshot: function () {} }; },
        where: function () { return q; }, limit: function () { return q; }, orderBy: function () { return q; }, get: function () { return Promise.resolve({ size: 0, docs: [], forEach: function () {} }); },
        onSnapshot: function (f) { (window.__snaps[name] = window.__snaps[name] || []).push(f); return function () {}; } }; return q; }
      var fs0 = { enablePersistence: P, collection: col, settings: function () {} };
      window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function (cb) { window.__authCb = cb; }, signOut: P,
        signInWithPopup: function () { return Promise.reject({ code: "auth/popup-blocked" }); }, signInWithRedirect: function () { window.__redirect = true; return Promise.resolve(); } }; } };
      window.firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = function () {}; };
      window.__emit = function (name, docs, cache) { (window.__snaps[name] || []).forEach(function (f) { f({ metadata: { fromCache: !!cache }, forEach: function (g) { docs.forEach(function (d) { g({ id: d.id, data: function () { var o = Object.assign({}, d); delete o.id; return o; } }); }); } }); }); };
      try { localStorage.setItem("bit_avisos_visto_salvador", "1"); localStorage.setItem("doit_motor_tareas", "firestore"); } catch (e) {}   /* la liga es igual en los dos motores; aquí se simula Firestore */ });
    await p.goto("file://" + IDX + url); await p.waitForTimeout(400); return { ctx: ctx, p: p };
  }
  var entra = function (p) { return p.evaluate(function (u) { window.__authCb(u); }, SAL).then(function () { return p.waitForTimeout(300); }); };
  var emite = function (p, docs, cache) { return p.evaluate(function (a) { __emit("bitacora_tareas", a[0], a[1]); }, [docs, !!cache]).then(function () { return p.waitForTimeout(300); }); };
  var estado = function (p) { return p.evaluate(function () { return { abierta: abierta, vista: vista, liga: localStorage.getItem("doit_ir_tarea"), aviso: document.getElementById("toast").classList.contains("on") ? document.getElementById("toast").textContent : "" }; }); };
  try {
    /* 1 · con sesión */
    var A = await pagina("?recordatorio=tREAL"); await entra(A.p); await emite(A.p, T);
    eq("con sesión: la liga abre el hilo de la tarea y no deja nada guardado", await estado(A.p), { abierta: "tREAL", vista: "hilo", liga: null, aviso: "" }); await A.ctx.close();
    /* 2 · sin sesión, login por redirect */
    var B = await pagina("?recordatorio=tREAL");
    var g = await B.p.evaluate(function () { return { url: location.search, liga: JSON.parse(localStorage.getItem("doit_ir_tarea") || "null") }; });
    eq("la liga se guarda en localStorage y la URL se limpia", [g.url, g.liga && g.liga.id], ["", "tREAL"]);
    await B.p.evaluate(function () { window.__authCb(null); }); await B.p.waitForTimeout(200); await B.p.click("#bgoogle"); await B.p.waitForTimeout(300);
    eq("popup bloqueado: el login se va por redirect", await B.p.evaluate(function () { return !!window.__redirect; }), true);
    await B.p.goto("file://" + IDX); await B.p.waitForTimeout(400);   // Google regresa a la URL ya limpia
    await entra(B.p); await emite(B.p, T);
    eq("después del login por redirect la tarea SÍ se abre", await estado(B.p), { abierta: "tREAL", vista: "hilo", liga: null, aviso: "" }); await B.ctx.close();
    /* 3 · cache vacía primero */
    var C = await pagina("?recordatorio=tREAL"); await entra(C.p); await emite(C.p, [], true);
    eq("cache sin la tarea: espera, no avisa en falso", (await estado(C.p)).aviso, "");
    await emite(C.p, T); eq("al llegar el servidor abre la tarea", (await estado(C.p)).abierta, "tREAL"); await C.ctx.close();
    /* 4 · fusionada */
    var D = await pagina("?recordatorio=tVIEJA"); await entra(D.p); await emite(D.p, T.concat([{ id: "tVIEJA", nombre: "Vieja", estado: "fusionada", fusionada_en: "tREAL" }]));
    eq("liga a una tarea fusionada abre la tarea en que quedó", [(await estado(D.p)).abierta, (await estado(D.p)).vista], ["tREAL", "hilo"]); await D.ctx.close();
    /* 5 · no existe / descartada */
    var E = await pagina("?recordatorio=tNOEXISTE"); await entra(E.p); await emite(E.p, T); var e5 = await estado(E.p);
    eq("id que no existe: no abre nada y lo dice claro", [e5.abierta, /No encontré la tarea de esa liga/.test(e5.aviso), e5.liga], [null, true, null]); await E.ctx.close();
    var F = await pagina("?recordatorio=tDESC"); await entra(F.p); await emite(F.p, T.concat([{ id: "tDESC", nombre: "X", estado: "descartada" }]));
    eq("tarea descartada: aviso de que se descartó", /se descartó/.test((await estado(F.p)).aviso), true); await F.ctx.close();
    /* 6 · liga vieja en localStorage (más de 15 min) no se usa */
    var G = await pagina(""); await G.p.evaluate(function () { localStorage.setItem("doit_ir_tarea", JSON.stringify({ id: "tREAL", ts: Date.now() - 20 * 60000 })); });
    await G.p.reload(); await G.p.waitForTimeout(400); await entra(G.p); await emite(G.p, T);
    eq("una liga guardada hace más de 15 min ya no abre nada", [(await estado(G.p)).abierta, (await estado(G.p)).liga], [null, null]); await G.ctx.close();
    eq("sin errores de página", errs.filter(function (m) { return !/firebase is not defined/.test(m); }), []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
