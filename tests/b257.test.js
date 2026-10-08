#!/usr/bin/env node
/* PRUEBAS build 257: tareas nuevas de la IA = PROPUESTAS (Acomodo). 390 px. Correr: node tests/b257.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 257", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 256, true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    var RD = Date, base = RD.parse("2026-10-06T13:20:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD; });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    /* build 285: las secciones del home amanecen plegadas; en esta prueba vieja Acomodo, Mensajes, Te pregunta Doit, Vencidas y Hoy arrancan abiertas como antes (lo que se toque se sigue recordando) */
    await p.evaluate(function () { if (typeof abre285 === "function") abre285 = function (k) { var o = _pl285(); return Object.prototype.hasOwnProperty.call(o.o, k) ? !!o.o[k] : /^(aco|msg|decide|preg|venc|hoy)$/.test(k); }; });
    await p.evaluate(function () { yo = "salvador"; window.__agendaNo = 1;
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      document.getElementById("app").style.display = "flex";
      window.PR = function (id, nom, extra) { var t = { id: id, nombre: nom, duenio: "salvador", creada_por: "ia", estado: "abierta", tipo_item: "tarea", wa_contactos: [{ nombre: "Ing. Pedro" }], msgs: [{ id: "m" + id, de: "Ing. Pedro", t: "Ing. Pedro: mándame el plano de la azotea", ts: Date.now() - 60000 }] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.NORMAL = function () { return { id: "tN", contexto: "algo", nombre: "Tarea normal mía", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", f_original: "2026-10-20", msgs: [] }; };
      window.lista = function (T) { tareas = T; abierta = null; vista = "lista"; window.__aco256 = ""; window.__p256f = {}; window.__acoPleg260 = undefined; try { localStorage.removeItem("bit_aco_pleg260"); } catch (e) {} try { ponAbre285("aco", true); } catch (e) {} render(); };   /* build 285: el plegado vive en el estado del día; el helper lo reabre */
    });
    var limpia = async function () { await p.evaluate(function () { [].forEach.call(document.querySelectorAll("#preg249,#hoja254,#acom249,#det242,.leemask,.cnlbg,.cnlsheet,.pop243"), function (e) { e.remove(); }); }); };
    /* 1) propuesta excluida de las listas y visible en Acomodo */
    var r1 = await p.evaluate(function () { lista([PR("p1", "Plano de la azotea"), NORMAL(), PR("p2", "Ya elegida", { tipo_elegido: true }), PR("p3", "A mano", { creada_por: "salvador" })]);
      var app = document.getElementById("app").innerText;
      return { esP: [esPropuesta256(tareas[0]), esPropuesta256(tareas[1]), esPropuesta256(tareas[2]), esPropuesta256(tareas[3])], mias: mias().map(function (t) { return t.id; }), card: !!document.querySelector('[data-p256="p1"]'), txt: (document.querySelector('[data-p256="p1"]') || { innerText: "" }).innerText, fila: !!document.getElementById("bprop256"), filaTxt: (document.getElementById("bprop256") || { innerText: "" }).innerText.replace(/\s+/g, " "), enLista: /Plano de la azotea/.test(Array.prototype.map.call(document.querySelectorAll(".fila,.tar,.row"), function (x) { return x.innerText; }).join(" ")), ab: abiertaVisible(tareas[0]) }; });
    eq("Solo la de la IA sin tipo_elegido es propuesta; no entra en mias() ni abiertaVisible", [r1.esP, r1.mias.indexOf("p1") < 0, r1.ab], [[true, false, false, false], true, false]);
    eq("Acomodo muestra la tarjeta con título, contacto y mensaje", [r1.card, /Tarea nueva propuesta: Plano de la azotea/.test(r1.txt), /WhatsApp · Ing\. Pedro/.test(r1.txt), /plano de la azotea/.test(r1.txt), /OK/.test(r1.txt), /Vincular/.test(r1.txt), /Dato/.test(r1.txt), /No guardar/.test(r1.txt)], [true, true, true, true, true, true, true, true]);
    eq("Fila superior 'Tareas nuevas' + globito 1 (build 281) y la propuesta no sale en las listas", [r1.fila, /^Tareas nuevas ?1(?!\d)/.test(r1.filaTxt.trim()), r1.enLista], [true, true, false]);
    await foto("b256-1-propuesta.png");
    var r1b = await p.evaluate(function () { var ic = document.querySelector(".acoh span"); return ic ? ic.textContent : ""; });
    eq("Encabezado de Acomodo cuenta las tareas nuevas", /1 tarea nueva/.test(r1b), true);
    /* el banner pliega (260) */
    await p.evaluate(function () { lista([PR("p1", "Plano de la azotea"), NORMAL()]); document.getElementById("bprop256").click(); });
    eq("La fila (banner) pliega Acomodo (build 260)", await p.evaluate(function () { return !document.querySelector(".aco226"); }), true);
    /* 2) OK sin fecha -> fechas rápidas -> Mañana -> arriba en Por ejecutar con 'Nueva' */
    var r2 = await p.evaluate(function () { lista([PR("p1", "Plano de la azotea"), NORMAL()]); document.querySelector('[data-p256="p1"] [data-p256a="ok"]').click();
      var t = tareas[0], f = document.querySelector('[data-p256="p1"] .p256f');
      return { te: t.tipo_elegido, tipo: t.tipo_item, hayFechas: !!f, btns: f ? [].map.call(f.querySelectorAll("button"), function (b) { return b.textContent; }) : [], noEnMias: mias().map(function (x) { return x.id; }).indexOf("p1") >= 0 }; });
    eq("OK: tipo_elegido tarea y misma tarjeta con Hoy · Mañana · Esta semana · Sin fecha", [r2.te, r2.tipo, r2.hayFechas, r2.btns], [true, "tarea", true, ["Hoy", "Mañana", "Esta semana", "Sin fecha"]]);
    await foto("b256-2-fechas.png");
    var r3 = await p.evaluate(function () { var X = NORMAL(); X.id = "tX"; X.nombre = "Otra futura"; X.f_vigente = X.f_original = "2026-10-08"; tareas.unshift(X); document.querySelector('[data-p256="p1"] [data-p256d="man"]').click(); var bf = document.getElementById("bfut"); if (bf) bf.click(); var t = tareas.filter(function (x) { return x.id === "p1"; })[0];
      var filas = [].slice.call(document.querySelectorAll("#app .scroll *")).filter(function (e) { return e.children.length === 0 || /Nueva/.test(e.className); });
      var txt = document.getElementById("app").innerText;
      var nombres = [].map.call(document.querySelectorAll(".iatag.nueva256"), function (e) { return e.textContent; });
      var pos1 = txt.toLowerCase().indexOf("plano de la azotea"), pos2 = txt.indexOf("Otra futura");
      window.__TXT = txt; return { f: t.f_vigente, man: (function () { var d = new Date(hoy() + "T12:00:00"); d.setDate(d.getDate() + 1); return iso(d); })(), tags: nombres, arriba: pos1 >= 0 && pos2 >= 0 && pos1 < pos2, cardSigue: !!document.querySelector('[data-p256="p1"]'), es: esPropuesta256(t), est: estadoReal(t) }; });
    eq("Mañana: fecha de mañana, etiqueta 'Nueva', arriba de las demás en Próximas (por ejecutar) y la tarjeta se va", [r3.f === r3.man, r3.tags, r3.arriba, r3.cardSigue, r3.es, r3.est], [true, ["Nueva"], true, false, false, "por_ejecutar"]);
    await foto("b256-3-arriba.png");
    /* 3) Vincular */
    var r4 = await p.evaluate(function () { lista([PR("p1", "Plano de la azotea"), NORMAL()]); document.querySelector('[data-p256="p1"] [data-p256a="vinc"]').click(); return !!document.querySelector(".cnlsheet,.cnlbg,.enl,.hojaenl,[data-enl]") || document.body.innerText.indexOf("Tarea normal mía") >= 0; });
    eq("Vincular abre el selector con las tareas", r4, true);
    await foto("b256-4-vincular.png");
    var r5 = await p.evaluate(async function () { document.querySelector('#enll [data-d="tN"]').click(); await new Promise(function (r) { setTimeout(r, 60); }); document.getElementById("hojaok").click(); await new Promise(function (r) { setTimeout(r, 150); }); return { vista: vista }; });
    var r5b = await p.evaluate(function () { var p1 = (window.__orig256 = null, null); return { vista: vista, ab: abierta, hay: tareas.map(function (t) { return t.id + ":" + (t.estado || "") + ":" + (t.fusionada_en || ""); }), enl: (tareas.filter(function (t) { return t.id === "tN"; })[0] || {}).enlazadas || null }; });
    console.log("  [vincular]", JSON.stringify(r5), JSON.stringify(r5b));
    eq("Vincular a una tarea: la propuesta no aparece más (fusionada o fuera de la lista) y la destino la enlaza", [r5b.hay.filter(function (x) { return /^p1:/.test(x) && !/fusionada/.test(x); }).length === 0, !!r5b.enl], [true, true]);
    eq("Tras vincular se vuelve a la lista (no se queda en la tarea)", [r5b.vista], ["lista"]);
    /* 4) Dato */
    var r6 = await p.evaluate(function () { lista([PR("p1", "Plano de la azotea"), NORMAL()]); document.querySelector('[data-p256="p1"] [data-p256a="dato"]').click(); return /Dato suelto/.test(document.body.innerText); });
    eq("Dato abre el selector con la opción 'Dato suelto'", r6, true);
    await p.evaluate(function () { var els = [].slice.call(document.querySelectorAll("button")).filter(function (e) { return /Dato suelto/.test(e.textContent); }); els[0].click(); });
    var r7 = await p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "p1"; })[0]; return { dato: t.es_dato, tipo: t.tipo_item, te: t.tipo_elegido, es: esPropuesta256(t) }; });
    eq("Dato: queda como dato (tipo_elegido) y deja de ser propuesta", r7, { dato: true, tipo: "dato", te: true, es: false });
    /* 5) No guardar -> descartada + popover */
    await limpia();
    var r8 = await p.evaluate(function () { lista([PR("p1", "Plano de la azotea"), NORMAL()]); window.__ref = tareas[0]; document.querySelector('[data-p256="p1"] [data-p256a="ng"]').click();
      return { est: __ref.estado, ts: !!__ref.descartada256_ts, enTareas: tareas.some(function (t) { return t.id === "p1"; }), card: !!document.querySelector('[data-p256="p1"]'), pop: /¿Sí era de/.test(document.body.innerText), borrada: !!__ref.eliminada }; });
    eq("No guardar: estado 'descartada', no se borra del objeto, sale de la lista y de Acomodo", [r8.est, r8.ts, r8.enTareas, r8.card, r8.borrada], ["descartada", true, false, false, false]);
    eq("No guardar muestra el popover '¿Sí era de X?'", r8.pop, true);
    await foto("b256-5-nogd.png");
    /* 6) migración: varias propuestas viejas aparecen de una vez; ia_revisor/mac/revisor también */
    var r9 = await p.evaluate(function () { lista([PR("a", "Una"), PR("b", "Dos", { creada_por: "mac" }), PR("c", "Tres", { creada_por: "ia_revisor" }), PR("d", "Cuatro", { creada_por: "revisor" }), PR("e", "Cinco", { estado: "descartada" }), PR("f", "Seis", { fusionada_en: "x" })]); return { n: propuestas256().length, fila: (document.getElementById("bprop256") || { innerText: "" }).innerText.replace(/\s+/g, " ") }; });
    eq("Migración: las abiertas sin tipo_elegido (ia, mac, revisor, ia_revisor) salen de una vez; descartadas y fusionadas no", [r9.n, /^Tareas nuevas ?4(?!\d)/.test(r9.fila.trim())], [4, true]);
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
