#!/usr/bin/env node
/* PRUEBAS build 247 (Salvador 6-oct 07:25). a 390 px.
   1) TOCAR (click real, no mantener) cualquier globo abre la hoja del detalle: entrante, saliente propio, dictado (hab), nota de la IA, "Te pregunta" y sus "Dato:".
   2) Menú: todos Mover · No guardar · Nueva · Dato; propios Editar · Eliminar · Es para Claude; "No guardar" en uno ya acomodado = oculto con motivo no_es_de_aqui + Historial con Deshacer.
   3) Editar (aviso "ya se envió, solo se corrige aquí"), Eliminar (oculto), Es para Claude (cerebro del 238 + tarjeta Hecho / Me falta).
   4) "Te pregunta": Mover · No es de aquí · Ya la contesté; la tarjeta desaparece y la pregunta pasa con su mensaje a la tarea destino.
   5) Cobranza Moric (a mano, Falta 1 por seguimiento): sin "Solo me falta", sin "Datos de la tarea", resumen sin "Falta:/Último:"; solo la ficha "Falta 1". La creada por la IA sí pide revisión.
   Correr: node tests/b247.test.js (CAP=<carpeta> para capturas) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 247", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 247, true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {}; });
  async function foto(nom) { if (!process.env.CAP) return; await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; window.__ESCR = [];
      db = { collection: function (c) { return { doc: function (id) { return { set: function (v) { __ESCR.push([c, id, JSON.parse(JSON.stringify(v))]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      try { localStorage.removeItem("doit_hist240"); } catch (e) {}
      window.solo = function () { [].forEach.call(document.body.children, function (x) { if (["app", "det242", "mov225", "undopill", "toast"].indexOf(x.id) < 0 && !/toast/.test(x.className)) x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; };
      window.NOW = Date.now(); window.hh = function (ms) { var d = new Date(ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
      window.MORIC = function () { var N = NOW; return { id: "tMORIC", nombre: "Cobranza Moric", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: hoy(), pendiente_info: "falta el próximo seguimiento",
        contexto: "Cobranza del saldo de Moric: se le manda el estado de cuenta y se espera su transferencia. Salvador lleva el seguimiento con Rogelio y revisa el depósito cada semana en el banco para cerrar el pendiente.", msgs: [
        { k: "bo", de: "salvador", t: "Revisar el estado de cuenta de Moric", ts: N - 90 * 60000, h: hh(N - 90 * 60000), acomodo: { ok: 1, ts: N, por: "salvador" } },
        { k: "bi", wa_in: 1, wa_c: "Rogelio Sada", t: "Rogelio Sada: Te mando el comprobante del depósito de $12,500", ts: N - 80 * 60000, h: hh(N - 80 * 60000), wa_id: "w1", acomodo: { ok: 1, ts: N, por: "salvador" } },
        { k: "bo", de: "salvador", wa_c: "Rogelio Sada", wa: "1", t: "Va, ahorita lo reviso", ts: N - 70 * 60000, h: hh(N - 70 * 60000), wa_in: 0 },
        { k: "bi", t: "Nota IA 08:10: Rogelio mandó un comprobante; lo dejé en esta tarea.", ts: N - 60 * 60000, h: hh(N - 60 * 60000), nota_ia: 1, origen: "revisor", canal: "priv:salvador" },
        { k: "bo", de: "salvador", hab: true, tr: "Claude revísame el comprobante y dime si cuadra con el estado de cuenta", t: "Revisar el comprobante contra el estado de cuenta", ts: N - 50 * 60000, h: hh(N - 50 * 60000) },
        { k: "bo", de: "salvador", t: "Mañana le marco a Rogelio para confirmar el depósito de Moric", ts: N - 40 * 60000, h: hh(N - 40 * 60000) },
        { k: "bi", wa_in: 1, wa_c: "Rogelio Sada", t: "Rogelio Sada: ¿Me confirmas si ya viste el comprobante, Salvador?", ts: N - 5 * 60000, h: hh(N - 5 * 60000), wa_id: "w2", acomodo: { ok: 1, ts: N, por: "salvador" } }] }; };
      window.OTRA = function () { return { id: "tOTRA", nombre: "Remodelación", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [] }; };
      window.abre = function (T, extra) { tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; (window.__chatModo = window.__chatModo || {})[T.id] = "todo"; window.__ptAb = {}; render(); window.todo247(); solo(); };
      window.todo247 = function () { var pl = document.getElementById("cnlpill"); if (pl) { pl.click(); var f = document.querySelector('.fil227h [data-fil="todo"]'); if (f) f.click(); } };
      window.txtMsg = function (ix) { var e = document.querySelector('.msgs [data-mix="' + ix + '"]'); return e; }; });
    /* ---------- 1) tocar abre la hoja ---------- */
    var r1 = await p.evaluate(function () { var o = {}, T = MORIC(); abre(T, [OTRA()]);
      function tocaYMira(sel, nom) { var e = document.querySelector(sel); var r = { hay: !!e }; if (e) { e.click(); var d = document.getElementById("det242"); r.abre = !!d; r.btns = d ? [].map.call(d.querySelectorAll("button[data-acmov],button[data-acng],button[data-acnueva],button[data-acdato],button[data-d247],button[data-p247]"), function (b) { return b.textContent.trim(); }) : []; if (d) d.remove(); } o[nom] = r; }
      tocaYMira('.msgs [data-mix="1"]', "entrante"); tocaYMira('.msgs [data-mix="0"]', "propioApp"); tocaYMira('.msgs [data-mix="2"]', "saliente");
      tocaYMira('.msgs .nia242[data-nix$="|3"]', "notaIA"); tocaYMira('.msgs [data-hab$="|4"]', "dictado"); tocaYMira('.msgs [data-mix="5"]', "propio2");
      return o; });
    eq("tocar entrante: abre y trae Mover · No guardar · Nueva · Dato", [r1.entrante.abre, r1.entrante.btns], [true, ["Mover", "No guardar", "Nueva", "Dato"]]);
    eq("tocar propio (de la app): abre con Editar · Eliminar · Es para Claude", [r1.propioApp.abre, r1.propioApp.btns], [true, ["Mover", "No guardar", "Nueva", "Dato", "Editar", "Eliminar", "Es para Claude"]]);
    eq("tocar saliente por WhatsApp: abre con menú propio", [r1.saliente.abre, r1.saliente.btns.slice(-3)], [true, ["Editar", "Eliminar", "Es para Claude"]]);
    eq("tocar nota de la IA: abre con Mover · No guardar · Nueva · Dato (sin Editar)", [r1.notaIA.abre, r1.notaIA.btns], [true, ["Mover", "No guardar", "Nueva", "Dato"]]);
    eq("tocar el globo hablado (dictado): abre y es propio", [r1.dictado.abre, r1.dictado.btns.slice(-3)], [true, ["Editar", "Eliminar", "Es para Claude"]]);
    /* captura: menú de un globo propio con "Es para Claude" */
    await p.evaluate(function () { document.querySelector('.msgs [data-mix="5"]').click(); });
    await foto("b247-menu-globo-propio.png");
    await p.evaluate(function () { var d = document.getElementById("det242"); if (d) d.remove(); });
    /* ---------- 2) No guardar en uno ya acomodado ---------- */
    var r2 = await p.evaluate(function () { var o = {}, T = MORIC(); abre(T, [OTRA()]); var x = T.msgs[1];
      document.querySelector('.msgs [data-mix="1"]').click(); var d = document.getElementById("det242"); d.querySelector("[data-acng]").click();
      o.x = [x.oculto, x.oculto_motivo, T.msgs.length, !!x.t]; var h = JSON.parse(localStorage.getItem(HIST240_K) || "[]")[0]; o.hist = h ? [h.que, h.undo && h.undo.tipo] : null;
      o.visible = !document.querySelector('.msgs [data-mix="1"]'); deshaz240(h); o.deshecho = [x.oculto, x.oculto_motivo || null, !!x.acomodo]; return o; });
    eq("No guardar en uno acomodado: oculto, motivo no_es_de_aqui, no se borra", r2.x, [true, "no_es_de_aqui", 7, true]);
    eq("entra al Historial con Deshacer", r2.hist, ["No es de aquí (1 mensaje)", "ng_lote"]);
    eq("sale de la vista", r2.visible, true);
    eq("Deshacer lo regresa", r2.deshecho, [false, null, false]);
    /* ---------- 3) Editar / Eliminar / Es para Claude ---------- */
    var r3 = await p.evaluate(function () { var o = {}, T = MORIC(); abre(T, [OTRA()]); var toasts = []; var _t = window.toast; window.toast = function (s) { toasts.push(s); };
      document.querySelector('.msgs [data-mix="5"]').click(); var d = document.getElementById("det242"); d.querySelector('[data-d247="edit"]').click();
      var ta = d.querySelector("#ed247t"); o.ta = ta.value; ta.value = "Mañana le marco a Rogelio a las 10"; d.querySelector('[data-d247="save"]').click();
      o.edit = [T.msgs[5].t, !!T.msgs[5].editado, T.msgs[5].t_original.slice(0, 20), toasts[toasts.length - 1]];
      document.querySelector('.msgs [data-mix="2"]').click(); d = document.getElementById("det242"); d.querySelector('[data-d247="edit"]').click(); d.querySelector("#ed247t").value = "Va, lo reviso hoy"; d.querySelector('[data-d247="save"]').click();
      o.wa = [T.msgs[2].t, toasts[toasts.length - 1]];
      document.querySelector('.msgs [data-mix="0"]').click(); d = document.getElementById("det242"); d.querySelector('[data-d247="del"]').click();
      o.del = [T.msgs[0].oculto, T.msgs[0].oculto_motivo, T.msgs.length, !document.querySelector('.msgs [data-mix="0"]'), (JSON.parse(localStorage.getItem(HIST240_K) || "[]")[0] || {}).que];
      window.toast = _t; return o; });
    eq("Editar: cambia el texto local y guarda el original", r3.edit, ["Mañana le marco a Rogelio a las 10", true, "Mañana le marco a Ro", "Corregido"]);
    eq("Editar uno que ya salió por WhatsApp: avisa", r3.wa, ["Va, lo reviso hoy", "Ya se envió, solo se corrige aquí"]);
    eq("Eliminar: apartado (oculto, no borrado) y al Historial", r3.del, [true, "eliminado", 7, true, "Eliminó un mensaje propio"]);
    var r3b = await p.evaluate(function () { var o = {}, T = MORIC(); abre(T, [OTRA()]);
      window.preguntaAClaude = function (m, modo, cb) { cb(JSON.stringify({ ordenes: [{ tipo: "claude", que: "Revisar el comprobante contra el estado de cuenta", fecha: hoy() }], contexto: "" })); };
      var n0 = T.msgs.length, tx = T.msgs[4].tr; document.querySelector('.msgs [data-hab$="|4"]').click(); document.getElementById("det242").querySelector('[data-d247="claude"]').click();
      var nuevos = T.msgs.slice(n0);
      o.orig = [T.msgs[4].oculto, T.msgs[4].oculto_motivo]; o.dict = nuevos.filter(function (m) { return m.dict238 && m.k === "bo"; }).map(function (m) { return m.t; });
      o.hecho = T.hecho238 ? [T.hecho238.hecho.length > 0, (T.hecho238.hecho.join(" ") || "").slice(0, 40)] : null; o.enc = (T.encargos || []).length;
      o.card = !!document.querySelector(".hc238"); return o; });
    eq("Es para Claude: el dictado oculta el mensaje de chat y va al cerebro del 238 como indicación (sin copia visible: build 263)", [r3b.orig, r3b.dict], [[true, "es_para_claude"], []]);
    eq("ejecuta las órdenes y deja su tarjeta Hecho", [r3b.hecho && r3b.hecho[0], r3b.enc, r3b.card], [true, 1, true]);
    /* ---------- 4) Te pregunta ---------- */
    var r4 = await p.evaluate(function () { var o = {}, T = MORIC(); abre(T, [OTRA()]);
      var key = T.id + "|" + 6; window.__paraTi = {}; window.__paraTi[key] = { posturas: [], datos: [{ texto: "Depósito de $12,500", ix: 1 }], decidido: [], falta: [] }; window.__ptAb[T.id] = true; render(); solo();
      o.card = !!document.querySelector(".ptcard"); o.dato = !!document.querySelector(".ptcard .ptl[data-pt247]");
      document.querySelector(".ptcard .ptq").click(); var d = document.getElementById("det242"); o.btns = d ? [].map.call(d.querySelectorAll("[data-p247]"), function (b) { return b.textContent.trim(); }) : null; return o; });
    eq("tocar Te pregunta: Mover · No es de aquí · Ya la contesté", [r4.card, r4.dato, r4.btns], [true, true, ["Mover", "No es de aquí", "Ya la contesté", "Eliminar"]]);
    await foto("b247-menu-te-pregunta.png");
    var r4b = await p.evaluate(function () { var o = {}, T = MORIC(); abre(T, [OTRA()]); window.__paraTi = {}; window.__paraTi[T.id + "|6"] = { posturas: [], datos: [{ texto: "Depósito de $12,500", ix: 1 }], decidido: [], falta: [] }; window.__ptAb[T.id] = true; render(); solo();
      /* Dato: abre el mismo menú */
      document.querySelector(".ptcard .ptl[data-pt247]").click(); o.dato = !!document.querySelector("#det242 [data-p247]"); document.getElementById("det242").remove();
      /* Ya la contesté */
      document.querySelector(".ptcard .ptq").click(); document.querySelector('#det242 [data-p247="contesta"]').click(); o.contesta = [!document.querySelector(".ptcard"), !!T.msgs[6].contestada247, T.msgs[6].oculto || false];
      var h = JSON.parse(localStorage.getItem(HIST240_K) || "[]")[0]; deshaz240(h); o.deshaz = [!!T.msgs[6].contestada247]; render(); o.vuelve = !!document.querySelector(".ptcard");
      /* No es de aquí */
      document.querySelector(".ptcard .ptq").click(); document.querySelector('#det242 [data-p247="noaqui"]').click(); var _m = document.getElementById("mov225"); o.noaqui = [!!_m, _m ? _m.querySelector(".mvh").textContent : "", T.msgs[6].oculto || false]; if (_m) _m.remove();
      return o; });
    eq("tocar un Dato: abre el menú", r4b.dato, true);
    eq("Ya la contesté: desaparece la tarjeta y el mensaje no se oculta", r4b.contesta, [true, true, false]);
    eq("Deshacer del Historial la regresa", [r4b.deshaz, r4b.vuelve], [[false], true]);
    eq("No es de aquí (sin alternativa de Claude): abre la hoja Vincular · Nueva para elegir a dónde va (260)", r4b.noaqui, [true, "Vincular · Nueva", false]);
    var r4c = await p.evaluate(function () { var o = {}, T = MORIC(), O = OTRA(); abre(T, [O]); window.__paraTi = {}; window.__paraTi[T.id + "|6"] = { posturas: [], datos: [{ texto: "Depósito de $12,500", ix: 1 }], decidido: [], falta: [] }; window.__ptAb[T.id] = true; render(); solo();
      document.querySelector(".ptcard .ptl[data-pt247]").click(); document.querySelector('#det242 [data-p247="mover"]').click();
      var m = document.getElementById("mov225"); o.hoja = !!m; var b = m && m.querySelector('[data-movto="tOTRA"]'); o.opcion = !!b; if (b) b.click();
      o.mueve = [!document.querySelector(".ptcard"), T.msgs[6].oculto, T.msgs[6].movido_a && T.msgs[6].movido_a.id, O.msgs.length, O.msgs.map(function (x) { return /comprobante/.test(x.t); })];
      return o; });
    eq("Mover desde un Dato: la tarjeta desaparece y la pregunta pasa con su mensaje (y el del dato) a la tarea destino", [r4c.hoja, r4c.opcion, r4c.mueve[0], r4c.mueve[1], r4c.mueve[2], r4c.mueve[3]], [true, true, true, true, "tOTRA", 2]);
    var r4d = await p.evaluate(function () { var o = {}, T = MORIC(), O = OTRA(); T.msgs[6].duda_tarea = { alternativa_id: "tOTRA", alternativa_nombre: "Remodelación" }; abre(T, [O]); window.__paraTi = {}; window.__ptAb[T.id] = true; render(); solo();
      document.querySelector(".ptcard .ptq").click(); document.querySelector('#det242 [data-p247="noaqui"]').click(); o.r = [!document.querySelector(".ptcard"), O.msgs.length, T.msgs[6].movido_a && T.msgs[6].movido_a.id]; return o; });
    eq("No es de aquí con la tarea que propuso Claude: pasa allá", r4d.r, [true, 1, "tOTRA"]);
    /* ---------- 5) Cobranza Moric: sin modo revisión ---------- */
    var r5 = await p.evaluate(function () { var o = {}, T = MORIC(); T.resumen = null; abre(T, [OTRA()]); document.getElementById("cnlpill").click(); document.querySelector('.fil227h [data-fil="imp"]').click(); solo();
      var ap = document.getElementById("app").textContent;
      o.tipo = tipoRevisar(T); o.solofalta = !!document.querySelector(".solofalta"); o.datos = /Datos de la tarea/.test(ap); o.chip = [].map.call(document.querySelectorAll(".chip225.falta"), function (c) { return c.textContent.trim(); });
      o.resumen = [!!document.querySelector(".res230"), /Falta:|Último:/.test((document.querySelector(".res230") || { textContent: "" }).textContent)];
      var IA = JSON.parse(JSON.stringify(T)); IA.id = "tIA"; IA.creada_por = "ia_revisor"; IA.origen = "wa_revisor"; IA.por_autorizar = true; IA.tipo_elegido = true; IA.nombre = "Cotización toldo";
      abre(IA); o.ia = [!!document.querySelector(".solofalta"), /Datos de la tarea/.test(document.getElementById("app").textContent)];
      return o; });
    eq("Moric a mano: sigue con Falta pero NO cae en revisión grande", [r5.tipo, r5.solofalta, r5.datos], ["falta", false, false]);
    eq("Moric: la ficha 'Falta 1' queda", r5.chip, ["Falta 1 ›"]);
    eq("Moric: hay resumen local y no trae Falta: ni Último:", r5.resumen, [true, false]);
    eq("la creada por la IA y ya clasificada sí pide revisión (Solo me falta + Datos)", r5.ia, [true, true]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  malas.forEach(function (m) { console.log("MAL " + m); });
  console.log("RESULTADO " + ok + "/" + n); process.exit(ok === n ? 0 : 1);
})();
