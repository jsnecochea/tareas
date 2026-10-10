#!/usr/bin/env node
/* Nombrar un dato desde la Bandeja (Salvador, 10-oct 08:55: «al acomodar y ponerle que era DATO, quería ponerle el
   nombre y no me hacía caso»). 390 px, pantalla táctil, Firebase simulado, push.php y claude.php simulados.
   1) Bandeja → Mensajes → «Dato» de una plática: pide «Nombre del dato» (con foco) y guarda el nombre escrito, aunque
      llegue un repintado de fondo mientras escribe.
   2) Bandeja → Tareas nuevas → «Dato» → «Dato suelto»: pide el nombre (propone el que trae) y guarda el escrito.
   3) Tarea propuesta abierta → botón «Dato»: pide el nombre; Cancelar deja el que tenía.
   4) ⋯ → Cambiar nombre en el dato: un repintado de fondo (sondeo del servidor, respuesta de Claude) a media escritura
      ya no borra el campo; Enter guarda el nombre completo y luego se pinta lo pendiente.
   5) Tocar fuera del campo sí repinta en el acto (no se congela la pantalla).
   Correr: node tests/dato-nombre.test.js */
"use strict";
var path = require("path"), IDX = path.join(__dirname, "..", "index.html");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function fx() {
  var N = Date.now();
  var base = function (id, nombre, extra) { return Object.assign({ id: id, nombre: nombre, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true,
    f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_dictada: true, ritmo: "diario", contexto: "Contexto suficiente de la tarea para que la ficha se vea completa y no pida más datos.",
    plan_seguimiento: { proximo_paso: "x" }, msgs: [{ k: "bo", de: "salvador", t: "Arrancamos", ts: N - 86400000, h: "09:00" }] }, extra || {}); };
  return {
    tLER: base("tLER", "Mantenimiento casa Lerdo", { msgs: [{ k: "bi", wa_in: 1, wa_c: "Chuy Zatarain", t: "Chuy Zatarain: El número del cerrajero es 871 222 3344, cobra 450 por chapa", ts: N - 600000, h: "10:00", wa_id: "wq1", duda_tarea: { q: "¿Va aquí?" } }] }),
    tPROP: base("tPROP", "Cotización toldo terraza", { creada_por: "ia_revisor", origen: "wa_revisor", tipo_elegido: false, autorizada: false, por_autorizar: true,
      msgs: [{ k: "bi", wa_in: 1, wa_c: "Toldos Laguna", t: "Toldos Laguna: Le comparto la cotización del toldo: $38,500", ts: N - 5400000, h: "08:00", wa_id: "wt1" }] }),
    tIA2: base("tIA2", "Nuevo dato", { creada_por: "ia_revisor", origen: "wa_revisor", tipo_elegido: false, autorizada: false, f_vigente: "", f_original: "", fecha_dictada: false, ritmo: "", contexto: "", plan_seguimiento: null,
      msgs: [{ k: "bi", wa_in: 1, wa_c: "Taller", t: "Taller: La medida de la llanta es 265/70 R17", ts: N - 7000000, h: "07:40", wa_id: "wl1" }] }),
    tIA: base("tIA", "Nuevo dato", { creada_por: "ia_revisor", origen: "wa_revisor", tipo_elegido: false, autorizada: false, f_vigente: "", f_original: "", fecha_dictada: false, ritmo: "", contexto: "", plan_seguimiento: null,
      msgs: [{ k: "bi", wa_in: 1, wa_c: "Banco", t: "Banco: Su clave interbancaria es 0123 4567", ts: N - 7200000, h: "07:30", wa_id: "wb1" }] })
  };
}
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), errs = [];
  async function pagina() {
    var ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, timezoneId: "America/Monterrey" }), p = await ctx.newPage();
    p.on("pageerror", function (e) { errs.push(e.message); });
    await p.route(/^https?:/, function (r) { r.abort(); });
    await p.addInitScript(function (a) { var P = function () { return Promise.resolve(); };
      function col() { var q = { doc: function () { return { get: function () { return Promise.resolve({ exists: false, data: function () { return {}; } }); }, set: P, delete: P, onSnapshot: function () {} }; },
        where: function () { return q; }, limit: function () { return q; }, orderBy: function () { return q; }, get: function () { return Promise.resolve({ size: 0, docs: [], forEach: function () {} }); },
        onSnapshot: function () { return function () {}; }, add: P }; return q; }
      var fs0 = { enablePersistence: P, collection: col, settings: function () {} };
      window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function (cb) { window.__authCb = cb; }, signOut: P, currentUser: null }; } };
      window.firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = function () {}; };
      window.firebase.firestore.FieldValue = { delete: function () { return null; }, arrayUnion: function () { return []; } };
      window.__srv = { tareas: a.tareas };
      window.fetch = function (url, op) {
        var s = String(url), u = new URL(s, "https://doit.ok-doit.com/"), ac = u.searchParams.get("action"), c = null;
        try { c = op && op.body ? JSON.parse(op.body) : null; } catch (e) {}
        function r(j, st) { return Promise.resolve(new Response(JSON.stringify(j), { status: st || 200, headers: { "content-type": "application/json" } })); }
        if (/claude\.php/.test(s)) return r({ content: [{ type: "text", text: "{}" }] });
        if (ac === "fs_lista") return r(Object.keys(window.__srv.tareas).map(function (k) { return Object.assign({ id: k }, window.__srv.tareas[k]); }));
        if (ac === "fs_set") { if (c && c.id) window.__srv.tareas[c.id] = Object.assign({}, window.__srv.tareas[c.id] || {}, c.data); return r({ ok: true }); }
        if (ac === "bandeja_lista") return r([]);
        return r({ ok: true });
      };
      try { localStorage.setItem("bit_avisos_visto_salvador", "1"); localStorage.setItem("doit_motor_tareas", "mysql"); } catch (e) {} }, { tareas: fx() });
    await p.goto("file://" + IDX); await p.waitForTimeout(400);
    await p.evaluate(function () { APP_TOKEN = "tok-prueba"; entrar("salvador"); });
    await p.waitForTimeout(1000); return { ctx: ctx, p: p };
  }
  var hoja = function (p) { return p.evaluate(function () { var v = document.getElementById("nom249"), i = document.getElementById("nom249i");
    return v ? { titulo: v.querySelector("h3").textContent, etiqueta: v.querySelector("label").textContent, valor: i.value, foco: document.activeElement === i } : null; }); };
  async function escribe(p, txt) { await p.keyboard.press("Control+A"); await p.keyboard.press("Backspace"); await p.keyboard.type(txt, { delay: 20 }); }
  try {
    /* ===== 1) Bandeja → Mensajes → Dato ===== */
    var A = await pagina(), p = A.p;
    await p.evaluate(function () { abreGrupoInicio("bandeja", "mensajes"); }); await p.waitForTimeout(300);
    await p.tap("[data-acdato]"); await p.waitForTimeout(200);
    var h1 = await hoja(p);
    eq("1 Dato pide el nombre del dato, con el teclado listo", h1 && [h1.titulo, h1.etiqueta, h1.foco, !!h1.valor], ["Dato nuevo", "Nombre del dato", true, true]);
    var nAntes = await p.evaluate(function () { return tareas.length; });
    eq("1 todavía no crea nada", nAntes, 4);
    await escribe(p, "Cerrajero de Lerdo");
    await p.evaluate(function () { render(); });   /* repintado de fondo a media escritura */
    await p.keyboard.press("Enter"); await p.waitForTimeout(250);
    var r1 = await p.evaluate(function () { var d = tareas.filter(function (t) { return t.es_dato && t.id !== "tPROP" && t.id !== "tIA"; })[0];
      return d ? [d.nombre, d.tipo_item, d.msgs.some(function (m) { return /cerrajero/.test(m.t || ""); }), !!document.getElementById("nom249"), (window.__srv.tareas[d.id] || {}).nombre] : null; });
    eq("1 el dato queda con el nombre escrito (en la app y en el servidor)", r1, ["Cerrajero de Lerdo", "dato", true, false, "Cerrajero de Lerdo"]);

    /* ===== 4) ⋯ → Cambiar nombre con un repintado de fondo a media escritura ===== */
    var did = await p.evaluate(function () { var d = tareas.filter(function (t) { return t.nombre === "Cerrajero de Lerdo"; })[0]; abierta = d.id; vista = "hilo"; render(); return d.id; });
    await p.waitForTimeout(400);
    var desp = await p.$("text=Después"); if (desp) { await desp.tap(); await p.waitForTimeout(200); }
    await p.tap("#bmenu"); await p.waitForTimeout(150);
    await p.tap('[data-mn="renombrar"]'); await p.waitForTimeout(150);
    eq("4 el campo del nombre sale con el foco", await p.evaluate(function () { return document.activeElement && document.activeElement.id; }), "enom");
    await p.evaluate(function () { window.__campo = document.getElementById("enom"); });
    await p.keyboard.type("Cerra", { delay: 20 });
    await p.waitForTimeout(1600);   /* pasa el tiempo de "tocó fuera": lo que sigue es un repintado de fondo de verdad */
    await p.evaluate(function () { window.__srv.tareas.tLER.nota = "cambio de la Mac"; render(); render(); });
    var r4a = await p.evaluate(function () { var e = document.getElementById("enom"); return [e === window.__campo, document.activeElement === window.__campo, e ? e.value : null]; });
    eq("4 el repintado de fondo no borra el campo ni le quita el foco", r4a, [true, true, "Cerra"]);
    await p.keyboard.type("jero Lerdo centro", { delay: 20 }); await p.keyboard.press("Enter"); await p.waitForTimeout(250);
    var r4b = await p.evaluate(function (id) { var d = tareas.filter(function (t) { return t.id === id; })[0]; return [d.nombre, !!document.getElementById("enom"), document.querySelector(".top .t") ? document.querySelector(".top .t").textContent : ""]; }, did);
    eq("4 Enter guarda el nombre completo y vuelve el título", r4b, ["Cerrajero Lerdo Centro", false, "Cerrajero Lerdo Centro"]);

    /* ===== 5) tocar fuera del campo repinta en el acto ===== */
    await p.tap("#bmenu"); await p.waitForTimeout(150); await p.tap('[data-mn="renombrar"]'); await p.waitForTimeout(150);
    await p.keyboard.type("Otro", { delay: 20 });
    await p.tap("#bback"); await p.waitForTimeout(300);
    var r5 = await p.evaluate(function (id) { return [!!document.getElementById("enom"), tareas.filter(function (t) { return t.id === id; })[0].nombre]; }, did);
    eq("5 tocar fuera con el campo abierto: repinta en el acto y guarda lo escrito", r5, [false, "Otro"]);
    await A.ctx.close();

    /* ===== 2) Bandeja → Tareas nuevas → Dato → Dato suelto ===== */
    var B = await pagina(); p = B.p;
    await p.evaluate(function () { abreGrupoInicio("bandeja", "nuevas"); }); await p.waitForTimeout(300);
    await p.tap('[data-p256="tPROP"] [data-p256a="dato"]'); await p.waitForTimeout(250);
    await p.tap("#enlcrea"); await p.waitForTimeout(200);
    var h2 = await hoja(p);
    eq("2 Dato suelto pide el nombre y propone el que trae", h2 && [h2.titulo, h2.valor, h2.foco], ["Dato nuevo", "Cotización Toldo Terraza", true]);
    await escribe(p, "Precio toldo terraza 38,500");
    await p.evaluate(function () { render(); });
    await p.tap('[data-nom249="ok"]'); await p.waitForTimeout(250);
    var r2 = await p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "tPROP"; })[0]; return [t.nombre, t.tipo_item, t.es_dato, t.autorizada, (window.__srv.tareas.tPROP || {}).nombre]; });
    eq("2 la propuesta queda como dato con el nombre escrito", r2, ["Precio Toldo Terraza 38,500", "dato", true, true, "Precio Toldo Terraza 38,500"]);

    /* ===== 3) Tarea propuesta abierta → botón Dato ===== */
    await p.evaluate(function () { abierta = "tIA"; vista = "hilo"; render(); }); await p.waitForTimeout(300);
    var hay3 = await p.evaluate(function () { return !!document.querySelector('[data-tipoi="dato"]'); });
    eq("3 la tarea propuesta muestra Tarea · Dato · Vincular", hay3, true);
    await p.tap('[data-tipoi="dato"]'); await p.waitForTimeout(200);
    var h3 = await hoja(p);
    eq("3 Dato pide el nombre con el que trae", h3 && [h3.titulo, h3.valor, h3.foco], ["Dato nuevo", "Nuevo Dato", true]);
    await escribe(p, "Clabe del banco"); await p.keyboard.press("Enter"); await p.waitForTimeout(250);
    var r3 = await p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "tIA"; })[0]; return [t.nombre, t.tipo_item, t.tipo_elegido]; });
    eq("3 queda como dato con el nombre escrito", r3, ["Clabe del Banco", "dato", true]);
    /* Cancelar deja el nombre que tenía (y sí queda como dato) */
    await p.evaluate(function () { abierta = "tIA2"; vista = "hilo"; render(); }); await p.waitForTimeout(300);
    await p.tap('[data-tipoi="dato"]'); await p.waitForTimeout(150);
    await escribe(p, "No lo quiero"); await p.tap('[data-nom249="x"]'); await p.waitForTimeout(150);
    var r3b = await p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "tIA2"; })[0]; return [t.nombre, t.tipo_item, !!document.getElementById("nom249")]; });
    eq("3 Cancelar deja el nombre que tenía", r3b, ["Nuevo Dato", "dato", false]);
    await B.ctx.close();
  } catch (e) { malas.push("EXCEPCIÓN: " + (e && e.stack || e)); }
  await b.close();
  eq("sin errores de página", errs, []);
  console.log((malas.length ? "X " : "✓ ") + ok + "/" + n + " dato-nombre");
  malas.forEach(function (m) { console.log("  X " + m); });
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
