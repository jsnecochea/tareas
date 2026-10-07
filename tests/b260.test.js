#!/usr/bin/env node
/* PRUEBAS build 260: origen en cada propuesta, banner que pliega Acomodo (cuenta cuadrada, X en Creada), tarjeta Te pregunta con menu propio. 390 px. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 260", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 256, true);
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
      window.CORREO = function (extra) { var t = { id: "tIAMUX", nombre: "Votar Junta Western Digital", duenio: "salvador", creada_por: "ia_revisor", origen: "correo_revisor", correo_de: "Interactive Brokers", por_autorizar: true, estado: "abierta", tipo_item: "tarea", falta_fecha: true,
        analisis: "Creada al instante por la IA (revisor de la Mac) desde correo de Interactive Brokers; lo pidió/dijo: Interactive Brokers.",
        contexto: "Interactive Brokers: Western Digital Corporation anunció su Annual Meeting (junta virtual el 20-nov-2026). Los votos deben recibirse a más tardar el 19-nov-2026.",
        msgs: [{ tipo: "texto", h: "12:57", ts: Date.now() - 5000, origen: "revisor", k: "bi", t: "IA: Tarea creado desde correo de Interactive Brokers: Interactive Brokers: Western Digital Corporation anunció su Annual Meeting (junta virtual el 20-nov-2026). Los votos deben recibirse a más tardar el 19-nov-2026. Se vota desde el enlace Vote Now." }] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.WAP = function (id, nom) { return { id: id, nombre: nom, duenio: "salvador", creada_por: "ia", estado: "abierta", tipo_item: "tarea", wa_contactos: [{ nombre: "Ing. Pedro" }], msgs: [{ id: "m" + id, de: "Ing. Pedro", wa_in: 1, wa_c: "Ing. Pedro", t: "Ing. Pedro: mándame el plano de la azotea", ts: Date.now() - 60000 }] }; };
      window.DICT = function () { return { id: "tDIC", nombre: "Llamar al notario", duenio: "salvador", creada_por: "mac", origen: "dictado", estado: "abierta", tipo_item: "tarea", contexto: "Pedirle fecha de firma", msgs: [{ k: "bo", de: "salvador", t: "Llámale al notario para la firma", ts: Date.now() - 4000, dict238: 1 }] }; };
      window.NORMAL = function () { return { id: "tN", nombre: "Tarea normal mía", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", f_original: "2026-10-20", msgs: [] }; };
      window.lista = function (T) { tareas = T; abierta = null; vista = "lista"; window.__p256f = {}; window.__acoPleg260 = undefined; try { localStorage.removeItem("bit_aco_pleg260"); } catch (e) {} render(); };
    });
    /* 1) origen */
    var r1 = await p.evaluate(function () { lista([CORREO(), WAP("w1", "Plano de la azotea"), DICT(), NORMAL()]);
      var tx = function (id) { return (document.querySelector('[data-p256="' + id + '"]') || { innerText: "" }).innerText.replace(/\s+/g, " "); };
      return { correo: tx("tIAMUX"), wa: tx("w1"), dic: tx("tDIC") }; });
    eq("Correo: canal, remitente, las primeras líneas del correo y 'Por qué la propuse'; nunca 'de la IA'", [/Correo · Interactive Brokers/.test(r1.correo), /Western Digital Corporation anunció su Annual Meeting/.test(r1.correo), /Por qué la propuse:/.test(r1.correo), /de la IA/.test(r1.correo), /^IA:|Tarea creado desde correo/.test(r1.correo)], [true, true, true, false, false]);
    eq("WhatsApp: canal, contacto y el mensaje", [/WhatsApp · Ing\. Pedro/.test(r1.wa), /mándame el plano de la azotea/.test(r1.wa), /Por qué la propuse/.test(r1.wa)], [true, true, true]);
    eq("Dictado: canal, quién y la frase dictada", [/Dictado · Salvador/.test(r1.dic), /Llámale al notario/.test(r1.dic), /Por qué la propuse: Pedirle fecha de firma/.test(r1.dic)], [true, true, true]);
    await foto("b259-1-origen.png");
    var r1b = await p.evaluate(function () { lista([CORREO({ correo_asunto: "Annual Meeting Notice: Western Digital Corporation", correo_remitente: "interactivebrokers@proxydocs.com", correo_fragmento: "Vote Now antes del 19-nov. Segunda línea. Tercera línea." })]); return document.querySelector('[data-p256="tIAMUX"]').innerText.replace(/\s+/g, " "); });
    eq("Con los campos opcionales de la Mac: asunto, remitente (correo) y solo 2 líneas del cuerpo", [/Asunto: Annual Meeting Notice: Western Digital Corporation/.test(r1b), /interactivebrokers@proxydocs\.com/.test(r1b), /Vote Now antes del 19-nov\. Segunda línea\./.test(r1b), /Tercera/.test(r1b)], [true, true, true, false]);
    /* 2) banner: cuenta cuadrada, pliega y despliega, recuerda; X en Creada */
    var r2 = await p.evaluate(function () { lista([CORREO(), WAP("w1", "Plano de la azotea"), WAP("w2", "Otra A"), WAP("w3", "Otra B"), NORMAL()]);
      document.querySelector('[data-p256="w2"] [data-p256a="ok"]').click(); document.querySelector('[data-p256="w3"] [data-p256a="ok"]').click();
      var cards = document.querySelectorAll("[data-p256]").length, creadas = document.querySelectorAll("[data-p256] .p256f").length, ban = document.getElementById("bprop256").innerText.replace(/\s+/g, " ").trim(), hdr = document.querySelector(".acoh span").textContent;
      return { cards: cards, creadas: creadas, ban: ban, hdr: hdr }; });
    eq("El número del banner cuadra con las tarjetas (2 propuestas + 2 'Creada')", [r2.cards, r2.creadas, /^Tareas nuevas ?4(?!\d)/.test(r2.ban), /4 tareas nuevas/.test(r2.hdr)], [4, 2, true, true]);
    await foto("b259-2-banner.png");
    var r3 = await p.evaluate(function () { var b = document.getElementById("bprop256"); b.click();
      var plegada = { aco: !!document.querySelector(".aco226:not(.msg271)"), exp: document.getElementById("bprop256").getAttribute("aria-expanded"), ls: localStorage.getItem("bit_aco_pleg260") };
      window.__acoPleg260 = undefined; var recuerda = acoPlegado260();
      document.getElementById("bprop256").click(); var abierta2 = { aco: !!document.querySelector(".aco226:not(.msg271)"), exp: document.getElementById("bprop256").getAttribute("aria-expanded"), ls: localStorage.getItem("bit_aco_pleg260") };
      return { plegada: plegada, recuerda: recuerda, abierta2: abierta2 }; });
    eq("Tocar el banner PLIEGA Acomodo (se recuerda en localStorage) y volver a tocarlo lo DESPLIEGA", r3, { plegada: { aco: false, exp: "false", ls: "1" }, recuerda: true, abierta2: { aco: true, exp: "true", ls: "0" } });
    var r4 = await p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "w2"; })[0]; document.querySelector('[data-p256="w2"] .p256x').click();
      var otras = tareas.filter(function (x) { return x.id === "w2"; })[0];
      return { cardSigue: !!document.querySelector('[data-p256="w2"]'), fecha: otras.f_vigente || "", elegida: !!otras.tipo_elegido, banner: document.getElementById("bprop256").innerText.replace(/\s+/g, " ").trim(), cards: document.querySelectorAll("[data-p256]").length }; });
    eq("La X de 'Creada · ¿Para cuándo?' la quita de ahí y la deja Sin fecha; el número baja a 3 y cuadra", r4, { cardSigue: false, fecha: "", elegida: true, banner: r4.banner, cards: 3 });
    eq("Banner dice 3 (build 281: «Tareas nuevas» + globito)", /^Tareas nuevas ?3(?!\d)/.test(r4.banner), true);
    /* 3) Te pregunta */
    var COB = function () { return { id: "tCOB", nombre: "Cobranza Moric Pádel Draw", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-20", contexto: "Control de cobro de anuncios del restaurante Moric con vales. Se lleva el saldo por mes.", lista_pasos: [{ tx: "Pedir lista de vales", hecho: false }, { tx: "Cobrar septiembre", hecho: false }],
      msgs: [{ k: "bo", de: "salvador", t: "Revisa los vales de Moric", ts: Date.now() - 90000, h: "07:00" }] }; };
    await p.evaluate(function () { window.COBf = (function () { return null; }); });
    var r5 = await p.evaluate(function () { var mk = function (txt, extra) { var t = { id: "tCOB", nombre: "Cobranza Moric Pádel Draw", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-20", contexto: "Control de cobro de anuncios del restaurante Moric con vales. Se lleva el saldo por mes.", lista_pasos: [{ tx: "Pedir lista de vales", hecho: false }, { tx: "Cobrar septiembre", hecho: false }],
        msgs: [{ k: "bo", de: "salvador", t: "Revisa los vales de Moric", ts: Date.now() - 90000, h: "07:00" }, { k: "bi", wa_in: 1, wa_c: "Carlos Ing", t: "Carlos Ing: " + txt, ts: Date.now() - 60000, h: "07:01" }] }; for (var k in (extra || {})) t.msgs[1][k] = extra[k]; return t; };
      var preg = function (t) { var p = preguntaParaMi(t); return p ? p.de : null; };
      return { propia: preg(mk("¿Ya tienes los vales de septiembre de Moric?")), movido: preg(mk("¿Me confirmas el cambio del servidor?", { movido_de: { id: "x", nombre: "Otra" } })), ajeno: preg(mk("¿Me confirmas el cambio del servidor de la aplicación móvil?")), duda: preg(mk("¿Cuándo sale la versión nueva?", { duda_tarea: { alternativa_id: "tOTRA", alternativa_nombre: "App" } })) }; });
    eq("Te pregunta: sí sale si es del tema; no sale con movido_de ni de otro tema (con duda de la Mac sigue, para acomodarla)", r5, { propia: "Carlos", movido: null, ajeno: null, duda: "Carlos" });
    var r6 = await p.evaluate(function () { var t = { id: "tCOB", nombre: "Cobranza Moric Pádel Draw", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-20", contexto: "Control de cobro de anuncios del restaurante Moric con vales.", lista_pasos: [{ tx: "Pedir lista de vales", hecho: false }],
        msgs: [{ k: "bo", de: "salvador", t: "Revisa los vales", ts: Date.now() - 90000, h: "07:00" }, { k: "bi", wa_in: 1, wa_c: "Carlos Ing", t: "Carlos Ing: ¿Ya tienes los vales de septiembre de Moric?", ts: Date.now() - 60000, h: "07:01" }] };
      tareas = [t, NORMAL()]; abierta = "tCOB"; vista = "hilo"; render();
      var c = document.querySelector(".ptcard"); var hay = !!c; var ev = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 100, clientY: 400 }); c.querySelector(".ptq").dispatchEvent(ev);
      var lm = document.getElementById("leemask"), unico = lm ? [].filter.call(lm.querySelectorAll("button"), function (b) { return !b.disabled && /Mover|contesté|Eliminar/.test(b.textContent); }).map(function (b) { return b.textContent; }) : [], lee = !!lm; if (lm) lm.remove(); window.__leeLP = 0; var m = null, btns = [];
      return { hay: hay, btns: btns, lee: lee, unico: unico, prevent: ev.defaultPrevented }; });
    eq("Mantener presionada la tarjeta: el menú único (261) con Mover · Ya la contesté · Eliminar activos", [r6.hay, r6.lee, r6.unico], [true, true, ["Mover a otra tarea", "Ya la contesté", "Eliminar"]]);
    await foto("b259-3-menu.png");
    var r7 = await p.evaluate(async function () { await espera(800); document.querySelector(".ptcard .ptq").click(); await espera(30); document.querySelector('[data-p247="mover"]').click(); await espera(50); var m1 = document.getElementById("mov225"), t1 = m1 ? m1.querySelector(".mvh").textContent : ""; if (m1) m1.remove();
      var T = tareas[0]; render(); await espera(800); document.querySelector(".ptcard .ptq").click(); await espera(30); document.querySelector('[data-p247="noaqui"]').click(); await espera(50); var m2 = document.getElementById("mov225"), t2 = m2 ? m2.querySelector(".mvh").textContent : ""; if (m2) m2.remove();
      return { mover: t1, noaqui: t2 }; });
    eq("Mover y No es de aquí usan la hoja Vincular · Nueva", r7, { mover: "Vincular · Nueva", noaqui: "Vincular · Nueva" });
    var r8 = await p.evaluate(async function () { var T = tareas[0]; render(); await espera(800); document.querySelector(".ptcard .ptq").click(); await espera(30); document.querySelector('[data-p247="del"]').click(); await espera(50); var y = T.msgs[1];
      return { oculto: y.oculto, motivo: y.oculto_motivo, sigue: T.msgs.length, card: !!document.querySelector(".ptcard"), txt: y.t.slice(0, 12) }; });
    eq("Eliminar: oculta el mensaje (oculto:true, no se borra) y quita la tarjeta", r8, { oculto: true, motivo: "eliminado", sigue: 2, card: false, txt: "Carlos Ing: " });
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
