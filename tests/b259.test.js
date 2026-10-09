#!/usr/bin/env node
/* PRUEBAS build 259: hoja unica 'Vincular · Nueva' (orden, buscador, cerradas) y regla del cerebro (no cambia el proposito ni cierra con pasos sin palomear). 390 px. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 259", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 256, true);
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
      var B = function (id, nombre, extra) { var t = { id: id, nombre: nombre, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", f_original: "2026-10-20", msgs: [] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.MUNDO = function () { return [
        B("tORI", "Limpieza Lote Samuel", { contexto: "Limpiar el lote con Samuel", msgs: [{ k: "bi", t: "Samuel: ya quedó", ts: Date.now() - 5000, wa_in: 1, wa_c: "Samuel" }] }),
        B("tCON", "Proyectos Consejo Colonia Cumbres", { tocada: Date.now() }),
        B("tLIM", "Limpieza y mantenimiento lotes Cumbres", { contexto: "Limpieza de lotes con Samuel" }),
        B("tZ", "Zeta pendientes", {}), B("tA", "Árbol del patio", {}), B("tCOB", "Cobranza Moric Pádel Draw", { contexto: "Control de cobro de anuncios del restaurante Moric con vales", alias: ["vales moric"] }),
        B("tCER", "Contrato antiguo de alarma", { cierre: { tipo: "hecha", f: "2026-08-01" }, estado: "cerrada", contexto: "Alarma de la casa" })]; };
      window.abrirV = function () { tareas = MUNDO(); abierta = "tORI"; vista = "hilo"; render(); abreEnlazar("tORI", { similares: ["tLIM"] }); };
      window.nombresHoja = function () { return [].map.call(document.querySelectorAll("#enlv .enlr"), function (x) { return x.querySelector(".enln").textContent; }); };
      window.buscar = function (q) { var i = document.getElementById("enlq"); i.value = q; i.dispatchEvent(new Event("input", { bubbles: true })); return nombresHoja().slice(1); };
    });
    var limpia = async function () { await p.evaluate(function () { [].forEach.call(document.querySelectorAll("#enlv,#hojav,#nom249,#preg249,#mov225,.leemask,.cnlbg,.cnlsheet"), function (e) { e.remove(); }); }); };
    /* 1) hoja: título, primer renglón fijo, parecidas, luego alfabético sin acentos */
    var r1 = await p.evaluate(function () { abrirV(); return { tit: document.querySelector("#enlv .enlt b").textContent, ls: nombresHoja() }; });
    eq("Se llama 'Vincular · Nueva'", r1.tit, "Vincular · Nueva");
    eq("Orden: + Crear tarea nueva, la parecida, y luego TODAS las demás alfabéticas sin acentos (Árbol antes que Cobranza; Consejo ya no va primero)", r1.ls,
      [" Crear tarea nueva", "Limpieza y mantenimiento lotes Cumbresparecida", "Árbol del patio", "Cobranza Moric Pádel Draw", "Proyectos Consejo Colonia Cumbres", "Zeta pendientes"]);
    await foto("b259-1-hoja.png");
    /* 2) buscador: moric y cobranza (nombre/contexto/alias); cerradas solo si no hay abiertas */
    var r2 = await p.evaluate(function () { return { moric: buscar("moric"), cobranza: buscar("cobranza"), vales: buscar("vales moric"), cuenta: buscar("cobro de anuncios"), alarma: buscar("alarma"), nada: buscar("zzzz") }; });
    eq("'moric', 'cobranza', alias y contexto encuentran la tarea abierta", [r2.moric, r2.cobranza, r2.vales, r2.cuenta], [["Cobranza Moric Pádel Draw"], ["Cobranza Moric Pádel Draw"], ["Cobranza Moric Pádel Draw"], ["Cobranza Moric Pádel Draw"]]);
    eq("Sin abiertas que coincidan, sale la cerrada marcada 'cerrada' (por contexto)", r2.alarma, ["Contrato antiguo de alarmacerrada"]);
    eq("Sin coincidencias: lo dice", r2.nada, []);
    var r2b = await p.evaluate(function () { buscar("alarma"); var b = document.querySelector("#enlv .enlcer"); return { gris: !!b, tag: b ? b.querySelector(".enlcerr").textContent : "" }; });
    eq("La cerrada va en gris con la etiqueta", r2b, { gris: true, tag: "cerrada" });
    await foto("b259-2-cerrada.png");
    /* 3) cerrada: al vincular se reabre */
    var r3 = await p.evaluate(async function () { document.querySelector('#enlv [data-d="tCER"]').click(); await espera(60); var hay = !!document.getElementById("hojaok"); var ttl = document.querySelector("#hojav .ttl b").textContent; document.getElementById("hojaok").click(); await espera(150);
      var C = tareas.filter(function (x) { return x.id === "tCER"; })[0], O = tareas.filter(function (x) { return x.id === "tORI"; })[0]; return { hay: hay, ttl: ttl, cierre: C.cierre, estado: C.estado, reab: (C.reabierta || []).length, orig: O ? (O.fusionada_en || O.estado) : "fuera", msgs: C.msgs.filter(function (m) { return m.t && /Samuel: ya quedó/.test(m.t); }).length, vista: vista, abierta: abierta }; });
    eq("Vincular a una cerrada la REABRE y le pasa todo", [r3.hay, /Reabrir y pasar todo/.test(r3.ttl), r3.cierre, r3.estado, r3.reab, r3.orig, r3.msgs], [true, true, null, "abierta", 1, "fuera", 1]);
    /* 4) Crear tarea nueva: popup de nombre y navega a la nueva */
    await limpia();
    var r4 = await p.evaluate(async function () { abrirV(); document.getElementById("enlcrea").click(); await espera(60); var pop = document.getElementById("nom249"), inp = document.getElementById("nom249i"); var hay = !!pop; inp.value = "Cuadrilla de limpieza"; pop.querySelector('[data-nom249="ok"]').click(); await espera(150);
      var N = tareas.filter(function (x) { return /cuadrilla/i.test(x.nombre); })[0], O = tareas.filter(function (x) { return x.id === "tORI"; })[0]; return { hay: hay, nueva: !!N, fusion: !O, va: abierta === (N && N.id), vista: vista, msgs: N ? N.msgs.length : -1 }; });
    eq("+ Crear tarea nueva: pide el nombre (popup), crea, pasa lo de la origen y navega a la nueva", r4, { hay: true, nueva: true, fusion: true, va: true, vista: "hilo", msgs: r4.msgs });
    /* 5) la hoja de Mover (¿A dónde va?) comparte título, buscador y orden */
    await limpia();
    var r5 = await p.evaluate(function () { tareas = MUNDO(); abierta = "tORI"; vista = "hilo"; render(); abreMover(tareas[0], 0); var m = document.getElementById("mov225"); var tit = m.querySelector(".mvh").textContent, primero = m.querySelector(".nueva259 .two span").textContent;
      var alf = [].map.call(m.querySelectorAll("#mops253 .opt226:not(.sim262) .ot"), function (x) { return x.textContent; }); var i = document.getElementById("mbus253"); i.value = "moric"; i.dispatchEvent(new Event("input", { bubbles: true }));
      return { tit: tit, primero: primero, alf: alf, res: [].map.call(m.querySelectorAll("#mres253 .ot"), function (x) { return x.textContent; }) }; });
    eq("Mover: mismo título, '+ Crear tarea nueva' primero, el resto alfabético y el mismo buscador", [r5.tit, r5.primero, r5.alf.length > 0, JSON.stringify(r5.alf) === JSON.stringify(r5.alf.slice().sort(function (a, b) { return a.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() < b.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ? -1 : 1; })), r5.res], ["Vincular · Nueva", "+ Crear tarea nueva", true, true, ["Cobranza Moric Pádel Draw"]]);
    await limpia();
    /* 6) CEREBRO: dictado que contradice la tarea → pregunta, no renombra */
    await p.evaluate(function () { window.modelo = function (j) { preguntaAClaude = function (msgs, mod, cb) { window.__PR = msgs[0].content; setTimeout(function () { cb(JSON.stringify(j)); }, 20); }; };
      window.COBRA = function () { return { id: "tmuq8c6", nombre: "Cobranza Moric Pádel Draw", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_dictada: true,
        contexto: "Control de cobro de anuncios del restaurante Moric con vales. Se lleva el saldo por mes y se cobra al cierre.", lista_pasos: [{ tx: "Pedir lista de vales", hecho: false }, { tx: "Cobrar septiembre", hecho: false }, { tx: "Conciliar vales", hecho: false }, { tx: "Enviar estado de cuenta", hecho: false }],
        msgs: [{ k: "bi", t: "Carlos: ya quedó el cambio de la app", ts: Date.now() - 9000, h: "07:40", wa_in: 1, wa_c: "Carlos Ing", wa_id: "w1" }, { k: "bi", t: "Carlos: te mando la versión", ts: Date.now() - 8000, h: "07:41", wa_in: 1, wa_c: "Carlos Ing", wa_id: "w2" }, { k: "bo", t: "ok", ts: Date.now() - 7000, h: "07:42", de: "salvador" }, { k: "bi", t: "Moric: vales de septiembre", ts: Date.now() - 6000, h: "07:43", wa_in: 1, wa_c: "Moric", wa_id: "w3" }] }; };
      window.DICTADO = "esta tarea es para todo lo que me escribe Carlos el ingeniero que programa la app"; });
    var r6 = await p.evaluate(async function () { tareas = [COBRA()]; abierta = "tmuq8c6"; vista = "hilo"; render();
      modelo({ nombre: "App Doit Programación Carlos", tipo: "tarea", contexto: "Todo lo que escribe Carlos, el ingeniero que programa la app Doit.", contexto_modo: "reemplazar", fecha: null, ya_hecha: false, ordenes: [], dudas: [], vinculos: [], pregunta: null });
      completaRevision(tareas[0], DICTADO, {}); await espera(500); var T = tareas.filter(function (x) { return x.id === "tmuq8c6"; })[0] || tareas[0];
      var f = ((T.hecho238 || {}).falta || []).filter(function (x) { return x.k === "contradice259"; })[0];
      return { nombre: T.nombre, ctx: T.contexto.slice(0, 30), cerrada: !!T.cierre, pasos: T.lista_pasos.length, q: f ? f.q : null, ops: f ? f.ops.map(function (o) { return o.label; }) : null, rule: /NUNCA cambies el propósito/.test(window.__PR || "") }; });
    eq("Dictado contradictorio: NO renombra, NO cambia el contexto, no cierra; deja la pregunta con [Sí, crear nueva] [Cambiar esta]", [r6.nombre, r6.ctx, r6.cerrada, r6.pasos], ["Cobranza Moric Pádel Draw", "Control de cobro de anuncios d", false, 4]);
    eq("La pregunta dice el tema actual y propone crear una nueva con los mensajes de Carlos", [r6.q, r6.ops, r6.rule], ["Esta tarea es de “Cobranza Moric Pádel Draw”. ¿Creo una tarea nueva para “App Doit Programación Carlos” y muevo ahí los mensajes de Carlos Ing?", ["Sí, crear nueva", "Cambiar esta"], true]);
    await foto("b259-3-pregunta.png");
    /* 6b) responder 'Sí, crear nueva' crea la tarea y mueve los mensajes de Carlos */
    var r7 = await p.evaluate(async function () { var T = tareas[0], P = preguntas249(T), i = P.map(function (x) { return x.k; }).indexOf("contradice259"); var op = P[i].ops[0];
      enviaPreguntas(T.id, P, P.map(function (x, k) { return k === i ? { texto: "sí, crea una nueva", persona: null, opt: op } : { texto: "", persona: null, opt: null }; })); await espera(300);
      var N = tareas.filter(function (x) { return x.nombre === "App Doit Programación Carlos"; })[0], O = tareas.filter(function (x) { return x.id === "tmuq8c6"; })[0] || tareas[0];
      return { nueva: !!N, movidosNueva: N ? N.msgs.filter(function (m) { return m.movido_de; }).length : -1, ocultosOrigen: O.msgs.filter(function (m) { return m.oculto; }).length, origenNombre: O.nombre, siguePregunta: ((O.hecho238 || {}).falta || []).some(function (x) { return x.k === "contradice259"; }) }; });
    eq("'Sí, crear nueva': tarea nueva con los 2 mensajes de Carlos; la original sigue intacta (más el dictado procesado, oculto) y la pregunta se va", r7, { nueva: true, movidosNueva: 2, ocultosOrigen: 3, origenNombre: "Cobranza Moric Pádel Draw", siguePregunta: false });
    /* 6c) 'Cambiar esta' sí aplica */
    var r8 = await p.evaluate(async function () { tareas = [COBRA()]; abierta = "tmuq8c6"; vista = "hilo"; render();
      modelo({ nombre: "App Doit Programación Carlos", tipo: "tarea", contexto: "Todo lo que escribe Carlos.", ya_hecha: false, ordenes: [], dudas: [], vinculos: [], pregunta: null });
      completaRevision(tareas[0], DICTADO, {}); await espera(500); var T = tareas[0], P = preguntas249(T), i = P.map(function (x) { return x.k; }).indexOf("contradice259");
      enviaPreguntas(T.id, P, P.map(function (x, k) { return k === i ? { texto: "cambiar esta", persona: null, opt: P[i].ops[1] } : { texto: "", persona: null, opt: null }; })); await espera(200); return { n: tareas[0].nombre }; });
    eq("'Cambiar esta' aplica el nombre nuevo", r8.n, "App Doit Programación Carlos");
    /* 6d) renombre explícito sí se hace; sin historia (tarea recién nacida) se renombra libre */
    var r9 = await p.evaluate(async function () { tareas = [COBRA()]; abierta = "tmuq8c6"; vista = "hilo"; render();
      modelo({ nombre: "Cobranza Moric 2026", tipo: "tarea", contexto: null, ya_hecha: false, ordenes: [], dudas: [], vinculos: [], pregunta: null });
      completaRevision(tareas[0], "cámbiale el nombre a Cobranza Moric 2026", {}); await espera(500); var a = tareas[0].nombre;
      var N = { id: "tNUEVA", nombre: "Algo", duenio: "salvador", creada_por: "ia", estado: "abierta", tipo_item: "tarea", pendiente_info: "x", msgs: [{ k: "bi", t: "Pedro: planos", ts: Date.now(), wa_in: 1, wa_c: "Pedro" }] }; tareas = [N]; abierta = "tNUEVA"; vista = "hilo"; render();
      modelo({ nombre: "Planos de la azotea", tipo: "tarea", contexto: "Pedro manda los planos de la azotea.", ya_hecha: false, ordenes: [], dudas: [], vinculos: [], pregunta: null });
      completaRevision(tareas[0], "es para los planos que manda Pedro de la azotea", {}); await espera(500); return { explicito: a, nueva: tareas[0].nombre }; });
    eq("Renombrar con orden explícita sí; una tarea recién nacida (sin historia) se nombra libre", r9, { explicito: "Cobranza Moric 2026", nueva: "Planos de la Azotea" });
    /* 7) cierre: con pasos sin palomear NO cierra si no fue explícito; explícito sí */
    var r10 = await p.evaluate(async function () { tareas = [COBRA()]; abierta = "tmuq8c6"; vista = "hilo"; render();
      modelo({ nombre: null, tipo: null, contexto: null, ya_hecha: true, ordenes: [], dudas: [], vinculos: [], pregunta: null });
      completaRevision(tareas[0], "ya quedó lo importante", {}); await espera(500); var a = { cerrada: !!tareas[0].cierre, pasos: tareas[0].lista_pasos.filter(function (p) { return !p.hecho; }).length };
      tareas = [COBRA()]; abierta = "tmuq8c6"; vista = "hilo"; render(); modelo({ nombre: null, tipo: null, contexto: null, ya_hecha: true, ordenes: [], dudas: [], vinculos: [], pregunta: null });
      completaRevision(tareas[0], "ciérrala, ya está", {}); await espera(500); return { noExplicita: a, explicita: !!tareas[0].cierre }; });
    eq("Con 4 pasos sin palomear: 'ya quedó' NO la cierra; 'ciérrala' sí", r10, { noExplicita: { cerrada: false, pasos: 4 }, explicita: true });
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
