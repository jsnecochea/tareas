#!/usr/bin/env node
/* Bandeja → Mensajes con los mensajes de WhatsApp que esperan acomodo en el servidor (push.php bandeja_lista /
   bandeja_marca simulados). 390 px, Firebase simulado, motor MySQL (fs_lista simulado).
   1) Lista y contadores (ficha Bandeja y pestaña Mensajes). 2) Un toque en la tarea que propuso la Mac: pega el mensaje
   («Contacto: texto», k bi, wa_in 1) y llama bandeja_marca {estado:"acomodado", tarea_id}. 3) Saliente (es_salida=1): k bo,
   wa_in 0, sin prefijo. 4) «Acomodar en…» con la hoja de tareas. 5) Descartar. 6) Marca que falla: no regresa y se reintenta.
   7) Se relee al abrir la pestaña y cada 60 s. 8) Sin token no llama a nada y no rompe. 9) Otro usuario no la pide ni la ve.
   Correr: node tests/bandeja-servidor.test.js */
"use strict";
var path = require("path"), IDX = path.join(__dirname, "..", "index.html");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var d = new Date(), HOY = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
var TAREAS = {
  tCOM: { nombre: "Comedor nuevo", duenio: "salvador", estado: "abierta", tipo_item: "tarea", f_vigente: "2026-10-20", plan_seguimiento: { proximo_paso: "x" }, msgs: [] },
  tFIE: { nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", tipo_item: "tarea", f_vigente: "2026-10-25", plan_seguimiento: { proximo_paso: "x" }, msgs: [] },
  tGOL: { nombre: "Torneo de golf", duenio: "salvador", estado: "abierta", tipo_item: "tarea", f_vigente: "2026-10-22", plan_seguimiento: { proximo_paso: "x" }, msgs: [] }
};
var BANDEJA = [
  { id: 101, contacto: "Manuel Parra", texto: "Ya tengo la piedra para la mesa, ¿cuándo la llevo?", tipo: "texto", url: "", creado: HOY + " 08:30:00", wa_id: "wa101", propuesta_tarea_id: "tCOM", es_salida: 0 },
  { id: 102, contacto: "Luis Mario", texto: "Confirmo el salón para el sábado", tipo: "texto", creado: HOY + " 08:40:00", wa_id: "wa102", propuesta_tarea_id: "tFIE", es_salida: 1 },
  { id: 103, contacto: "Arturo Tijerina", texto: "¿Vas al torneo?", tipo: "texto", hora: HOY + " 08:50:00", wa_id: "wa103", url: null, es_salida: 0 },   /* forma real: hora con fecha, url null */
  { id: 104, contacto: "Promociones", texto: "Oferta del día", tipo: "texto", creado: HOY + " 09:00:00", wa_id: "wa104", es_salida: 0 }
];
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), errs = [];
  async function pagina(conToken, quien) {
    var ctx = await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), p = await ctx.newPage();
    p.on("pageerror", function (e) { errs.push(e.message); });
    await p.route(/^https?:/, function (r) { r.abort(); });
    await p.addInitScript(function (a) { var P = function () { return Promise.resolve(); }; window.__snaps = {};
      function col(name) { var q = { doc: function () { return { get: function () { return Promise.resolve({ exists: false, data: function () { return {}; } }); }, set: P, delete: P, onSnapshot: function () {} }; },
        where: function () { return q; }, limit: function () { return q; }, orderBy: function () { return q; }, get: function () { return Promise.resolve({ size: 0, docs: [], forEach: function () {} }); },
        onSnapshot: function (f) { (window.__snaps[name] = window.__snaps[name] || []).push(f); return function () {}; } }; return q; }
      var fs0 = { enablePersistence: P, collection: col, settings: function () {} };
      window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function (cb) { window.__authCb = cb; }, signOut: P }; } };
      window.firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = function () {}; };
      /* el intervalo de 60 s se guarda para dispararlo a mano */
      var si = window.setInterval; window.__int60 = [];
      window.setInterval = function (f, ms) { var id = si.apply(this, arguments); if (ms === 60000) window.__int60.push(f); return id; };
      /* push.php simulado */
      window.__srv = { tareas: a.tareas, bandeja: a.bandeja, llamadas: [], marcas: [], heads: [], fallaMarca: false };
      var f0 = window.fetch;
      window.fetch = function (url, op) {
        var s = String(url); if (s.indexOf("push.php") < 0) return f0 ? f0.apply(this, arguments) : Promise.reject(new Error("sin red"));
        var u = new URL(s, "https://doit.ok-doit.com/"), ac = u.searchParams.get("action"), c = op && op.body ? JSON.parse(op.body) : null;
        window.__srv.llamadas.push(ac);
        function r(j, st) { return Promise.resolve(new Response(JSON.stringify(j), { status: st || 200, headers: { "content-type": "application/json" } })); }
        if (ac === "fs_lista") return r(Object.keys(window.__srv.tareas).map(function (k) { return Object.assign({ id: k }, window.__srv.tareas[k]); }));
        if (ac === "fs_set") { window.__srv.tareas[c.id] = Object.assign({}, window.__srv.tareas[c.id] || {}, c.data); return r({ ok: true }); }
        if (ac === "bandeja_lista") { window.__srv.heads.push(op && op.headers); return r(window.__srv.bandeja.filter(function (x) { return !x._fuera; })); }
        if (ac === "bandeja_marca") { if (window.__srv.fallaMarca) return r({ error: "falla" }, 500); window.__srv.marcas.push(c);
          window.__srv.bandeja.forEach(function (x) { if (String(x.id) === String(c.id)) x._fuera = 1; }); return r({ ok: true }); }
        return r({ ok: true });
      };
      try { localStorage.setItem("bit_avisos_visto_salvador", "1"); } catch (e) {} }, { tareas: TAREAS, bandeja: BANDEJA });
    await p.goto("file://" + IDX); await p.waitForTimeout(400);
    await p.evaluate(function (a) { if (a.t) APP_TOKEN = "tok-prueba"; entrar(a.q); }, { t: conToken, q: quien || "salvador" });
    await p.waitForTimeout(900); return { ctx: ctx, p: p };
  }
  var vista = function (p) { return p.evaluate(function () {
    var em = Array.prototype.map.call(document.querySelectorAll(".seg-bandeja [data-seg]"), function (x) { return x.getAttribute("data-seg") + ":" + (x.querySelector("em") || {}).textContent; });
    var fb = document.querySelector('.ficha-inicio[data-grupo="bandeja"] .fi-n');
    return { tabs: em, ficha: fb ? fb.textContent : null, filas: Array.prototype.map.call(document.querySelectorAll(".bsrv [data-bsrv]"), function (x) { return x.getAttribute("data-bsrv"); }),
      prop: Array.prototype.map.call(document.querySelectorAll(".bsrv [data-bsrv] .bsrv-si"), function (x) { return x.textContent; }) }; }); };
  var tarea = function (p, id) { return p.evaluate(function (id) { var t = tareas.filter(function (x) { return x.id === id; })[0]; return (t.msgs || []).map(function (m) { return { k: m.k, wa_in: m.wa_in, t: m.t, wa_c: m.wa_c, origen: m.origen, bandeja_id: m.bandeja_id }; }); }, id); };
  var srv = function (p) { return p.evaluate(function () { return JSON.parse(JSON.stringify(window.__srv)); }); };
  try {
    var A = await pagina(true);
    /* 1 · contador en la ficha antes de abrir, luego la pestaña */
    var f0 = await vista(A.p);
    eq("la ficha Bandeja cuenta los 4 del servidor", f0.ficha, "4");
    var s0 = await srv(A.p), h0 = s0.heads[0] || {};
    eq("bandeja_lista con x-app-token y x-usuario", [h0["x-app-token"], h0["x-usuario"]], ["tok-prueba", "salvador"]);
    await A.p.evaluate(function () { abreGrupoInicio("bandeja", "mensajes"); }); await A.p.waitForTimeout(300);
    var v1 = await vista(A.p);
    eq("pestaña Mensajes con su número y las 4 tarjetas (la más reciente arriba)", [v1.tabs, v1.filas], [["nuevas:0", "mensajes:4"], ["104", "103", "102", "101"]]);
    eq("la tarea que propuso la Mac sale como primer botón", v1.prop, ["A «Fiesta Cumpleaños Papá»", "A «Comedor Nuevo»"]);
    eq("al abrir la pestaña se volvió a leer", (await srv(A.p)).llamadas.filter(function (x) { return x === "bandeja_lista"; }).length >= 2, true);
    /* 2 · un toque: entrante a su propuesta */
    await A.p.click('[data-bsrv="101"] .bsrv-si'); await A.p.waitForTimeout(400);
    eq("entrante pegado en Comedor como lo deja la Mac", await tarea(A.p, "tCOM"),
      [{ k: "bi", wa_in: 1, t: "Manuel Parra: Ya tengo la piedra para la mesa, ¿cuándo la llevo?", wa_c: "Manuel Parra", origen: "wa_entrante", bandeja_id: "101" }]);
    var s2 = await srv(A.p);
    eq("bandeja_marca acomodado con tarea_id", s2.marcas.map(function (m) { return [m.id, m.estado, m.tarea_id]; }), [["101", "acomodado", "tCOM"]]);
    eq("se guardó en el servidor (fs_set)", (s2.tareas.tCOM.msgs || []).length, 1);
    var v2 = await vista(A.p);
    eq("la tarjeta se va y el número baja", [v2.filas, v2.tabs[1]], [["104", "103", "102"], "mensajes:3"]);
    /* 3 · saliente: de Salvador */
    await A.p.click('[data-bsrv="102"] .bsrv-si'); await A.p.waitForTimeout(400);
    eq("saliente como de Salvador: k bo, wa_in 0, sin «Contacto: »", await tarea(A.p, "tFIE"),
      [{ k: "bo", wa_in: 0, t: "Confirmo el salón para el sábado", wa_c: "Luis Mario", origen: "wa_saliente", bandeja_id: "102" }]);
    /* 4 · sin propuesta: Acomodar en… */
    await A.p.click('[data-bsrv="103"] [data-bsrva="otra"]'); await A.p.waitForTimeout(200);
    eq("se abre la hoja ¿A qué tarea va? con las tareas abiertas", await A.p.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll("#bsrv-hoja [data-bsrvto]"), function (x) { return x.getAttribute("data-bsrvto"); }).sort(); }), ["tCOM", "tFIE", "tGOL"]);
    await A.p.fill("#bsrvbus", "golf"); await A.p.waitForTimeout(150);
    await A.p.click('#bsrvres [data-bsrvto="tGOL"]'); await A.p.waitForTimeout(400);
    eq("acomodado en Torneo de golf desde el buscador", (await tarea(A.p, "tGOL")).map(function (m) { return m.t; }), ["Arturo Tijerina: ¿Vas al torneo?"]);
    eq("y marcado con su tarea", (await srv(A.p)).marcas.slice(-1).map(function (m) { return [m.id, m.estado, m.tarea_id]; }), [["103", "acomodado", "tGOL"]]);
    /* 5 · descartar */
    await A.p.click('[data-bsrv="104"] [data-bsrva="desc"]'); await A.p.waitForTimeout(300);
    var s5 = await srv(A.p), m5 = s5.marcas.slice(-1)[0];
    eq("descartar: bandeja_marca descartado sin tarea", [m5.id, m5.estado, m5.tarea_id === undefined], ["104", "descartado", true]);
    eq("descartar no toca ninguna tarea", [(await tarea(A.p, "tCOM")).length, (await tarea(A.p, "tFIE")).length, (await tarea(A.p, "tGOL")).length], [1, 1, 1]);
    var v5 = await vista(A.p);
    eq("bandeja vacía: sin tarjetas y en cero", [v5.filas.length, v5.tabs[1], v5.ficha], [0, "mensajes:0", null]);
    /* 6 · llega uno nuevo en la lectura de cada 60 s; su marca falla y se reintenta */
    await A.p.evaluate(function () { window.__srv.bandeja.push({ id: 105, contacto: "Manuel Parra", texto: "Mando foto", tipo: "imagen", url: "https://doit.ok-doit.com/f/105.jpg", creado: new Date().toISOString(), propuesta_tarea_id: "tCOM", es_salida: 0 }); });
    eq("hay un intervalo de 60 s", await A.p.evaluate(function () { return window.__int60.length >= 1; }), true);
    await A.p.evaluate(function () { window.__int60.forEach(function (f) { f(); }); }); await A.p.waitForTimeout(400);
    eq("la lectura de cada 60 s trae el nuevo", (await vista(A.p)).filas, ["105"]);
    eq("con liga al archivo", await A.p.evaluate(function () { var a = document.querySelector('[data-bsrv="105"] .bsrv-url'); return a && a.getAttribute("href"); }), "https://doit.ok-doit.com/f/105.jpg");
    await A.p.evaluate(function () { window.__srv.fallaMarca = true; });
    await A.p.click('[data-bsrv="105"] .bsrv-si'); await A.p.waitForTimeout(400);
    eq("marca fallida: el mensaje igual queda en la tarea y no regresa a la lista", [(await tarea(A.p, "tCOM")).length, (await vista(A.p)).filas], [2, []]);
    await A.p.evaluate(function () { window.__srv.fallaMarca = false; var m = JSON.parse(localStorage.getItem("doit_bandeja_marcas")); m["105"].ts = 0; localStorage.setItem("doit_bandeja_marcas", JSON.stringify(m)); });
    await A.p.evaluate(function () { return cargaBandejaSrv(); }); await A.p.waitForTimeout(300);
    eq("la siguiente lectura reintenta la marca", (await srv(A.p)).marcas.slice(-1).map(function (m) { return [m.id, m.estado, m.tarea_id]; }), [["105", "acomodado", "tCOM"]]);
    await A.p.evaluate(function () { return cargaBandejaSrv(); }); await A.p.waitForTimeout(200);
    eq("cuando el servidor ya no lo lista se olvida la marca", await A.p.evaluate(function () { return localStorage.getItem("doit_bandeja_marcas"); }), "{}");
    eq("acomodar dos veces el mismo no lo duplica", await A.p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "tCOM"; })[0]; acomodaBandeja(normalizaBandeja({ id: 105, contacto: "Manuel Parra", texto: "Mando foto" }), t); return t.msgs.length; }), 2);
    eq("grupo (forma real del servidor): se respeta «Quién: texto» y no se pone el grupo encima; url null no sale", await A.p.evaluate(function () {
      var t = tareas.filter(function (x) { return x.id === "tGOL"; })[0], x = normalizaBandeja({ id: "wa_3A90", texto: "Silvia Gomez: Gracias comadrita", contacto: "Grupo Gómez padilla", tipo: "texto", estado: "por_acomodar", es_salida: 0, hora: "2026-10-09 10:38:46", wa_id: "3A90", url: null });
      acomodaBandeja(x, t); var m = t.msgs.filter(function (y) { return y.bandeja_id === "wa_3A90"; })[0] || {}; return [x.h, x.url, m.t, m.wa_c, m.url === undefined]; }), ["10:38", "", "Silvia Gomez: Gracias comadrita", "Grupo Gómez padilla", true]);
    await A.ctx.close();
    /* 8 · sin token */
    var B = await pagina(false);
    await B.p.evaluate(function () { abreGrupoInicio("bandeja", "mensajes"); }); await B.p.waitForTimeout(300);
    var sB = await srv(B.p), vB = await vista(B.p);
    eq("sin token: no llama a bandeja_lista, la pestaña sale en cero", [sB.llamadas.indexOf("bandeja_lista"), vB.tabs], [-1, ["nuevas:0", "mensajes:0"]]);
    await B.ctx.close();
    /* 9 · otro usuario (Josué, con token): la bandeja es el WhatsApp de Salvador; ni se pide ni se ve */
    var C = await pagina(true, "josue");
    await C.p.evaluate(function () { abreGrupoInicio("bandeja", "mensajes"); }); await C.p.waitForTimeout(300);
    var sC = await srv(C.p), vC = await vista(C.p);
    eq("otro usuario: no llama a bandeja_lista ni bandeja_marca y no ve mensajes", [sC.llamadas.indexOf("bandeja_lista"), sC.llamadas.indexOf("bandeja_marca"), vC.filas.length, await C.p.evaluate(function () { return bandejaSrvVisible().length; })], [-1, -1, 0, 0]);
    await C.ctx.close();
    eq("sin errores de página", errs.filter(function (m) { return !/firebase is not defined/.test(m); }), []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
