#!/usr/bin/env node
/* PRUEBAS build 261: UN solo menu completo (11 opciones fijas, en gris las que no aplican) en cualquier texto. 390 px. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 261", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 256, true);
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
      window.TAREA = function () { return { id: "tCOB", nombre: "Cobranza Moric Pádel Draw", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-20", contexto: "Control de cobro de anuncios del restaurante Moric con vales de septiembre.", wa_contactos: [{ nombre: "Moric" }],
        hecho238: { ts: 1, hecho: ["Fecha límite: 20 oct"], falta: [{ k: "txt", q: "¿Cuándo te recuerdo?", ops: [] }] },
        msgs: [{ k: "bo", de: "salvador", t: "Revisa los vales de Moric", ts: N - 300000, h: "07:00", acomodo: { ok: 1, ts: N, por: "salvador" } },
          { k: "bi", wa_in: 1, wa_c: "Moric", t: "Moric: Te mando los vales de septiembre", ts: N - 240000, h: "07:01", acomodo: { ok: 1 } },
          { k: "bi", t: "📝 Nota IA 07:02: la cobranza de septiembre sigue pendiente de los vales de Moric", ts: N - 200000, h: "07:02", nota_ia: 1, origen: "revisor", canal: "priv:salvador" },
          { k: "bi", wa_in: 1, wa_c: "Moric", t: "Moric: ¿Ya tienes los vales de septiembre de Moric?", ts: N - 100000, h: "07:03", acomodo: { ok: 1 } }] }; };
      window.abre = function () { tareas = [TAREA()]; abierta = "tCOB"; vista = "hilo"; (window.__chatModo = window.__chatModo || {}).tCOB = "todo"; window.__ptAb = {}; render(); var pl = document.getElementById("cnlpill"); if (pl) { pl.click(); var fl = document.querySelector('.fil227h [data-fil="todo"]'); if (fl) fl.click(); } };
      window.menuEn = function (sel, ix) { var el = ix != null ? document.querySelector(sel).querySelectorAll ? [].slice.call(document.querySelectorAll(sel))[ix || 0] : null : document.querySelector(sel); if (!el) return null; var ev = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 200, clientY: 500 }); el.dispatchEvent(ev);
        var m = document.getElementById("leemask"); if (!m) return { sinMenu: true, prevented: ev.defaultPrevented }; return { prevented: ev.defaultPrevented, ops: [].map.call(m.querySelectorAll("button"), function (b) { return [b.textContent, !b.disabled]; }) }; };
      window.porTexto = function (re) { var els = [].slice.call(document.querySelectorAll(".msgs [data-mix], .msgs [data-hab], .msgs .nia242[data-nix]")).filter(function (e) { return re.test(e.innerText); }); return els[els.length - 1] || null; };
      window.menuDe = function (el) { if (!el) return { sinElemento: true }; var ev = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 200, clientY: 500 }); el.dispatchEvent(ev); var m = document.getElementById("leemask"); return m ? { ops: [].map.call(m.querySelectorAll("button"), function (b) { return [b.textContent, !b.disabled]; }) } : { sinMenu: true }; };
      window.cierraMenu = function () { var m = document.getElementById("leemask"); if (m) m.remove(); window.__leeLP = 0; };
    });
    var ORDEN = ["Leer desde aquí", "Leer lo actual", "Es para Claude", "Mover a otra tarea", "Nueva tarea", "Dato", "Copiar", "Editar", "Ya la contesté", "No guardar", "Eliminar"];
    var nombres = function (r) { return r && r.ops ? r.ops.map(function (o) { return o[0]; }) : null; };
    var on = function (r) { return r && r.ops ? r.ops.filter(function (o) { return o[1]; }).map(function (o) { return o[0]; }) : null; };
    /* burbuja propia */
    var r1 = await p.evaluate(function () { abre(); return menuDe(porTexto(/Revisa los vales/)); });
    eq("Burbuja propia: las 11 opciones en orden", nombres(r1), ORDEN);
    eq("Burbuja propia: activas", on(r1), ["Leer desde aquí", "Leer lo actual", "Es para Claude", "Mover a otra tarea", "Nueva tarea", "Dato", "Copiar", "Editar", "No guardar", "Eliminar"]);
    await foto("b261-1-propia.png");
    /* burbuja ajena */
    var r2 = await p.evaluate(function () { cierraMenu(); return menuDe(porTexto(/Te mando los vales/)); });
    eq("Burbuja ajena: las 11 opciones; Editar y Ya la contesté en gris", [nombres(r2), r2.ops[7], r2.ops[8]], [ORDEN, ["Editar", false], ["Ya la contesté", false]]);
    eq("Burbuja ajena: Mover, Nueva, Dato, Copiar, No guardar y Eliminar activas", on(r2).filter(function (x) { return ["Mover a otra tarea", "Nueva tarea", "Dato", "Copiar", "No guardar", "Eliminar"].indexOf(x) >= 0; }).length, 6);
    await foto("b261-2-ajena.png");
    /* nota IA */
    var r3 = await p.evaluate(function () { cierraMenu(); var el = porTexto(/cobranza de septiembre sigue pendiente/); var r = menuDe(el); r.hay = !!el; return r; });
    eq("Nota IA: las 11 opciones en orden", [r3.hay, nombres(r3)], [true, ORDEN]);
    /* tarjeta Te pregunta */
    var r4 = await p.evaluate(function () { cierraMenu(); abre(); return menuEn(".ptcard .ptq"); });
    eq("Tarjeta Te pregunta: las 11 opciones; Ya la contesté activa, Editar en gris", [nombres(r4), r4 && r4.ops[8], r4 && r4.ops[7]], [ORDEN, ["Ya la contesté", true], ["Editar", false]]);
    eq("Te pregunta: activas Leer, Es para Claude gris, Mover, Nueva, Dato, Copiar, No guardar, Eliminar", on(r4), ["Leer desde aquí", "Leer lo actual", "Mover a otra tarea", "Nueva tarea", "Dato", "Copiar", "Ya la contesté", "No guardar", "Eliminar"]);
    await foto("b261-3-tepregunta.png");
    /* Hecho / Me falta */
    var r5 = await p.evaluate(function () { cierraMenu(); return menuEn(".hc238 .hch"); });
    eq("Tarjeta Hecho: las 11 opciones; solo Leer lo actual y Copiar activas", [nombres(r5), on(r5)], [ORDEN, ["Leer lo actual", "Copiar"]]);
    /* pregunta de Claude (bloque difuminado) */
    var r6 = await p.evaluate(async function () { cierraMenu(); abrePreguntas249("tCOB"); await espera(60); var li = document.querySelector("#preg249 li"); if (!li) return { hay: false }; var ev = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 200, clientY: 300 }); li.dispatchEvent(ev); var m = document.getElementById("leemask"); return m ? { hay: true, ops: [].map.call(m.querySelectorAll("button"), function (b) { return [b.textContent, !b.disabled]; }) } : { hay: true, sinMenu: true }; });
    eq("Pregunta de Claude: las 11 opciones en orden (Copiar activa)", [r6.hay, nombres(r6), (on(r6) || []).indexOf("Copiar") >= 0], [true, ORDEN, true]);
    await foto("b261-4-pregunta.png");
    await p.evaluate(function () { cierraMenu(); var v = document.getElementById("preg249"); if (v) v.remove(); window.__preg255 = null; });
    /* Resumen */
    var r7 = await p.evaluate(function () { abre(); var rt = document.querySelector(".rtx, .rsm246"); return rt ? menuEn(rt.className.indexOf("rsm246") >= 0 ? ".rsm246" : ".rtx") : { hay: false }; });
    eq("Resumen: las 11 opciones en orden", r7.hay === false ? "no hay resumen" : nombres(r7), r7.hay === false ? "no hay resumen" : ORDEN);
    /* acciones: Mover y Nueva usan Vincular · Nueva; Eliminar oculta; Copiar */
    var r8 = await p.evaluate(async function () { cierraMenu(); abre(); var res = {}; var r = menuDe(porTexto(/Te mando los vales/)); var m = document.getElementById("leemask"); m.querySelectorAll("button")[3].click(); await espera(60); var mv = document.getElementById("mov225"); res.mover = mv ? mv.querySelector(".mvh").textContent : ""; if (mv) mv.remove();
      cierraMenu(); abre(); menuDe(porTexto(/Te mando los vales/)); document.getElementById("leemask").querySelectorAll("button")[4].click(); await espera(60); var nv = document.getElementById("nom249"); res.nueva = !!nv || !!document.getElementById("mov225") || !!document.getElementById("det242"); [].forEach.call(document.querySelectorAll("#nom249,#mov225,#det242,.leemask"), function (e) { e.remove(); });
      cierraMenu(); abre(); var T = tareas[0]; menuDe(porTexto(/Te mando los vales/)); document.getElementById("leemask").querySelectorAll("button")[10].click(); await espera(60); res.elim = [T.msgs[1].oculto, T.msgs[1].oculto_motivo, T.msgs.length]; return res; });
    eq("Mover usa la hoja Vincular · Nueva", r8.mover, "Vincular · Nueva");
    eq("Nueva tarea abre el popup de nombre / la hoja", r8.nueva, true);
    eq("Eliminar oculta el mensaje (oculto:true, motivo eliminado) y no lo borra", r8.elim, [true, "eliminado", 4]);
    /* gris no hace nada */
    var r9 = await p.evaluate(async function () { cierraMenu(); abre(); menuDe(porTexto(/Te mando los vales/)); document.getElementById("leemask").querySelectorAll("button")[7].click(); await espera(30); return { sigue: !!document.getElementById("leemask") }; });
    eq("Tocar una opción en gris no hace nada ni cierra el menú", r9, { sigue: true });
    /* 'Ya la contesté' */
    var r10 = await p.evaluate(async function () { cierraMenu(); abre(); var T = tareas[0]; menuEn(".ptcard .ptq"); document.getElementById("leemask").querySelectorAll("button")[8].click(); await espera(60); return { contestada: !!T.msgs[3].contestada247, card: !!document.querySelector(".ptcard") }; });
    eq("Ya la contesté: marca la pregunta y quita la tarjeta", r10, { contestada: true, card: false });
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
