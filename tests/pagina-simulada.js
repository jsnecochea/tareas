/* Página de Doit para pruebas de navegador: 390 px (táctil si se pide), zona Monterrey, Firebase simulado,
   push.php y claude.php simulados en window.__srv (cada llamada queda anotada en __srv.llamadas con su acción y cuerpo).
   Claude contesta vacío ("{}") salvo que la prueba cambie window.__srv.claude. Lo usan respaldo-local, contesta-en-pantalla
   y escritura-doble. No es una prueba (no termina en .test.js). */
"use strict";
var path = require("path"), IDX = path.join(__dirname, "..", "index.html");
async function abrePagina(b, a) {
  a = a || {};
  var ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: !!a.touch, isMobile: !!a.touch, timezoneId: "America/Monterrey" }), p = await ctx.newPage(), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  p.on("dialog", function (dg) { dg.accept().catch(function () {}); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function (a) {
    var P = function () { return Promise.resolve(); };
    window.__fsEscribe = [];
    function col(nombre) { var q = { doc: function (id) { return { get: function () { return Promise.resolve({ exists: false, data: function () { return {}; } }); },
        set: function (d) { window.__fsEscribe.push({ col: nombre, id: id, data: d }); return window.__fsFalla ? Promise.reject(new Error("sin red")) : P(); },
        delete: function () { window.__fsEscribe.push({ col: nombre, id: id, borra: 1 }); return window.__fsFalla ? Promise.reject(new Error("sin red")) : P(); }, onSnapshot: function () {} }; },
      where: function () { return q; }, limit: function () { return q; }, orderBy: function () { return q; }, get: function () { return Promise.resolve({ size: 0, docs: [], forEach: function () {} }); },
      onSnapshot: function () { return function () {}; }, add: P }; return q; }
    var fs0 = { enablePersistence: P, collection: col, settings: function () {} };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function (cb) { window.__authCb = cb; }, signOut: P, currentUser: null }; } };
    window.firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = function () {}; };
    window.firebase.firestore.FieldValue = { delete: function () { return null; }, arrayUnion: function () { return []; } };
    window.__srv = { tareas: a.tareas || {}, llamadas: [], claude: "{}", falla: {} };
    window.fetch = function (url, op) {
      var s = String(url), u = new URL(s, "https://doit.ok-doit.com/"), ac = u.searchParams.get("action"), c = null;
      try { c = op && op.body ? JSON.parse(op.body) : null; } catch (e) {}
      function r(j, st) { return Promise.resolve(new Response(JSON.stringify(j), { status: st || 200, headers: { "content-type": "application/json" } })); }
      if (/claude\.php/.test(s)) { window.__srv.llamadas.push({ ac: "claude" }); return r({ content: [{ type: "text", text: window.__srv.claude }] }); }
      window.__srv.llamadas.push({ ac: ac, c: c });
      if (window.__srv.falla[ac]) return r({ error: "falla simulada" }, 500);
      if (ac === "fs_lista") return r(Object.keys(window.__srv.tareas).map(function (k) { return Object.assign({ id: k }, window.__srv.tareas[k]); }));
      if (ac === "fs_set") { if (c && c.id && (!c.col || c.col === "bitacora_tareas")) window.__srv.tareas[c.id] = Object.assign({}, window.__srv.tareas[c.id] || {}, c.data); return r({ ok: true }); }
      if (ac === "bandeja_lista") return r([]);
      if (ac === "wa_pedido") return r({ ok: true, id: "wp" + window.__srv.llamadas.length });
      return r({ ok: true });
    };
    try { localStorage.setItem("bit_avisos_visto_" + (a.quien || "salvador"), "1"); localStorage.setItem("doit_motor_tareas", "mysql"); } catch (e) {}
  }, { tareas: a.tareas, quien: a.quien });
  await p.goto("file://" + IDX); await p.waitForTimeout(400);
  await p.evaluate(function (q) { APP_TOKEN = "tok-prueba"; entrar(q); }, a.quien || "salvador");
  await p.waitForTimeout(1000);
  return { ctx: ctx, p: p, errs: errs };
}
/* tarea completa (no pide datos) con lo que se le agregue */
function tarea(id, nombre, extra) {
  var N = Date.now();
  return Object.assign({ id: id, nombre: nombre, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
    f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_dictada: true, ritmo: "diario", contexto: "Contexto suficiente de la tarea para que la ficha se vea completa y no pida más datos.",
    plan_seguimiento: { proximo_paso: "x" }, msgs: [{ k: "bo", de: "salvador", t: "Arrancamos", ts: N - 86400000, h: "09:00" }] }, extra || {});
}
module.exports = { abrePagina: abrePagina, tarea: tarea, IDX: IDX };
