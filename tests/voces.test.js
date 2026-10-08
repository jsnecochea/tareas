#!/usr/bin/env node
/* PRUEBAS: VOCES (⋯ del inicio → Voces). Lista las voces en español del dispositivo agrupadas por país, con calidad y
   mujer/hombre solo por nombre conocido; Play dice la frase de muestra con ESA voz; palomear guarda el elenco (máx. 3) en
   bitacora_personas/<usuario>.voces y localStorage; "Probar el elenco" alterna voces; la Caminata y la lectura rotan el elenco
   (turno nuevo = voz distinta); una voz guardada que no existe se salta; sin elenco se usa la mejor es-MX (Premium primero);
   en iOS las voces llegan tarde (voiceschanged). speechSynthesis simulado. */
"use strict";
var path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    try { Object.defineProperty(navigator, "serviceWorker", { value: { addEventListener: function () {}, register: function () { return Promise.resolve({}); }, ready: Promise.resolve({}) }, configurable: true }); } catch (e) {}
    try { localStorage.clear(); } catch (e) {}
    window.__dichos = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    /* como en iOS: al principio no hay voces; llegan con voiceschanged */
    window.__VOCES = [];
    window.VOCES_REALES = [
      { name: "Juan", lang: "es-MX", voiceURI: "com.apple.voice.compact.es-MX.Juan" },
      { name: "Paulina (Premium)", lang: "es-MX", voiceURI: "com.apple.voice.premium.es-MX.Paulina" },
      { name: "Mónica", lang: "es-ES", voiceURI: "com.apple.voice.compact.es-ES.Monica" },
      { name: "Diego (Mejorada)", lang: "es-AR", voiceURI: "com.apple.voice.enhanced.es-AR.Diego" },
      { name: "Google español de Estados Unidos", lang: "es-US", voiceURI: "Google español de Estados Unidos" },
      { name: "Samantha", lang: "en-US", voiceURI: "com.apple.voice.compact.en-US.Samantha" } ];
    var oyentes = [];
    var SS = { speaking: false, pending: false, getVoices: function () { return window.__VOCES; }, cancel: function () { window.__cancel = (window.__cancel || 0) + 1; },
      addEventListener: function (ev, f) { if (ev === "voiceschanged") oyentes.push(f); },
      speak: function (u) { window.__dichos.push({ t: u.text, voz: u.voice ? u.voice.name : "", pitch: u.pitch, rate: u.rate }); setTimeout(function () { if (u.onend) u.onend({}); }, 5); } };
    window.lleganVoces = function () { window.__VOCES = window.VOCES_REALES; oyentes.forEach(function (f) { f(); }); };
    try { Object.defineProperty(window, "speechSynthesis", { value: SS, configurable: true }); } catch (e) { window.speechSynthesis = SS; }
    function SR() {} SR.prototype.start = function () {}; SR.prototype.stop = SR.prototype.abort = function () {};
    window.SpeechRecognition = window.webkitSpeechRecognition = SR;
  });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true };
      window.__esp = [];
      db = { collection: function () { return { doc: function (k) { return { set: function (d, o) { window.__esp.push([k, d, o]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      document.getElementById("app").style.display = "flex";
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.hasta = async function (f, ms) { var t0 = performance.now(); while (performance.now() - t0 < (ms || 3000)) { if (f()) return true; await espera(15); } return false; };
      tareas = []; abierta = null; vista = "lista"; render(); });

    /* ---------- 1 · el ⋯ del inicio tiene Voces; las voces llegan tarde (iOS) ---------- */
    var A = await p.evaluate(async function () {
      var r = {}; document.getElementById("bhmas").click();
      var bv = document.getElementById("hmvoces"); r.boton = bv ? bv.textContent.trim() : null; r.svg = !!(bv && bv.querySelector("svg"));
      bv.click(); r.vista = vista; r.vacio = !!document.getElementById("vocvacio");
      lleganVoces(); await hasta(function () { return document.querySelectorAll("[data-vsel]").length > 0; }, 1500);
      r.grupos = [].map.call(document.querySelectorAll(".vocgrp"), function (x) { return x.textContent; });
      r.filas = [].map.call(document.querySelectorAll(".vocsel"), function (x) { return x.querySelector(".tx").childNodes[0].textContent + " | " + x.querySelector("small").textContent; });
      r.ingles = document.body.textContent.indexOf("Samantha") >= 0;
      r.ancho = document.documentElement.scrollWidth <= 390;
      r.ayuda = /Ajustes → Accesibilidad → Contenido leído/.test(document.body.textContent);
      r.emoji = /[\u{1F300}-\u{1FAFF}]/u.test(document.getElementById("app").innerHTML);
      return r; });
    eq("⋯ del inicio: entrada Voces con ícono SVG", [A.boton, A.svg], ["Voces", true]);
    eq("abre la pantalla Voces; mientras no hay voces lo dice", [A.vista, A.vacio], ["voces", true]);
    eq("agrupadas por país", A.grupos, ["México", "EE.UU. y Latinoamérica", "España"]);
    eq("filas: Premium primero, mujer/hombre por nombre conocido, sin dato si no se sabe", A.filas,
      ["Paulina | Mujer · Premium · es-MX", "Juan | Hombre · es-MX", "Diego | Hombre · Mejorada · es-AR", "español de Estados Unidos | Sin dato · es-US", "Mónica | Mujer · es-ES"]);
    eq("solo español (sin la voz en inglés)", A.ingles, false);
    eq("cabe en 390 px, sin emoji, con la ayuda del iPhone", [A.ancho, A.emoji, A.ayuda], [true, false, true]);

    /* ---------- 2 · Play dice la frase de muestra con esa voz ---------- */
    var B = await p.evaluate(async function () {
      var d0 = __dichos.length; document.querySelector('[data-vplay="com.apple.voice.compact.es-ES.Monica"]').click(); await espera(30);
      return __dichos.slice(d0).map(function (d) { return [d.voz, d.t]; }); });
    eq("Play: la muestra tipo tráiler en la voz de esa fila", B, [["Mónica", "En un mundo donde cada minuto cuenta… hoy tienes tres pendientes y una cita a las ocho."]]);

    /* ---------- 3 · palomear guarda el elenco, máximo 3 ---------- */
    var C = await p.evaluate(async function () {
      var r = {}, sel = function (id) { document.querySelector('[data-vsel="' + id + '"]').click(); };
      sel("com.apple.voice.premium.es-MX.Paulina"); sel("com.apple.voice.compact.es-MX.Juan"); sel("com.apple.voice.compact.es-ES.Monica");
      r.n3 = vocesConfig().elenco.slice();
      var e0 = __esp.length; sel("com.apple.voice.enhanced.es-AR.Diego");
      r.cuarta = [vocesConfig().elenco.length, __esp.length - e0, document.getElementById("toast").textContent];
      var u = __esp[__esp.length - 1]; r.firestore = [u[0], u[1].voces.v, u[1].voces.elenco.length, typeof u[1].voces.ts, u[2] && u[2].merge];
      r.local = JSON.parse(localStorage.getItem("bit_voces_salvador")).elenco.length;
      r.marcadas = [].map.call(document.querySelectorAll('.vocsel[aria-checked="true"]'), function (x) { return x.getAttribute("data-vsel"); }).length;
      r.titulo = document.querySelector(".vocelv").textContent;
      sel("com.apple.voice.compact.es-MX.Juan"); r.quita = vocesConfig().elenco.slice();
      sel("com.apple.voice.compact.es-MX.Juan");
      return r; });
    eq("palomear 3: quedan en el elenco en orden", C.n3, ["com.apple.voice.premium.es-MX.Paulina", "com.apple.voice.compact.es-MX.Juan", "com.apple.voice.compact.es-ES.Monica"]);
    eq("la cuarta no entra y avisa", C.cuarta, [3, 0, "Máximo 3 voces. Quita una para poner otra."]);
    eq("se guarda en bitacora_personas/<usuario>.voces con merge", C.firestore, ["salvador", 1, 3, "number", true]);
    eq("respaldo en localStorage y la pantalla lo muestra", [C.local, C.marcadas, C.titulo], [3, 3, "Paulina · Juan · Mónica"]);
    eq("quitar la palomita la saca del elenco", C.quita, ["com.apple.voice.premium.es-MX.Paulina", "com.apple.voice.compact.es-ES.Monica"]);

    /* ---------- 4 · Probar el elenco alterna las voces; deslizadores guardan ritmo y tono ---------- */
    var D = await p.evaluate(async function () {
      var d0 = __dichos.length; document.getElementById("vocprueba").click(); await hasta(function () { return __dichos.length - d0 >= 4; }, 3000);
      var dia = __dichos.slice(d0).map(function (d) { return d.voz; });
      var t = document.getElementById("voctono"); t.value = "1.1"; t.dispatchEvent(new Event("change"));
      var r = document.getElementById("vocritmo"); r.value = "1.25"; r.dispatchEvent(new Event("change")); await espera(30);
      var c = vocesConfig(), ult = __dichos[__dichos.length - 1];
      return { dia: dia, cfg: [c.tono, c.ritmo, _leeRate()], ult: [ult.pitch, ult.rate] }; });
    eq("Probar el elenco: mini diálogo alternando las 3 voces", D.dia, ["Paulina (Premium)", "Mónica", "Juan", "Paulina (Premium)"]);
    eq("velocidad y tono se guardan y se usan", [D.cfg, D.ult], [[1.1, 1.25, 1.25], [1.1, 1.25]]);

    /* ---------- 5 · la Caminata rota el elenco: turno nuevo = voz distinta ---------- */
    var E = await p.evaluate(async function () {
      window.__vocTok++; await espera(200); CAM.on = true; VOZ_ROT.i = -1; var d0 = __dichos.length, listo = false;
      camDi274([{ v: "A", t: "¿Cuál reloj compramos?" }, { v: "B", t: "Yo haría el de huella." }, { v: "B", t: "Cuesta tres mil." }, { v: "A", t: "¿Lo compro?" }], function () { listo = true; });
      await hasta(function () { return listo; }, 3000);
      var a = __dichos.slice(d0).map(function (d) { return d.voz; });
      d0 = __dichos.length; listo = false;
      camDi274([{ v: "A", t: "Anotado." }], function () { listo = true; }); await hasta(function () { return listo; }, 3000);
      CAM.on = false; CAM.tok++;
      return { a: a, sig: __dichos.slice(d0).map(function (d) { return d.voz; }) }; });
    eq("Caminata: pregunta y respuesta con voces distintas; el mismo que sigue hablando conserva su voz", E.a, ["Paulina (Premium)", "Mónica", "Mónica", "Juan"]);
    eq("Caminata: el mensaje siguiente toma la siguiente voz del elenco", E.sig, ["Paulina (Premium)"]);

    /* ---------- 6 · la lectura en voz alta rota por mensaje ---------- */
    var F = await p.evaluate(async function () {
      VOZ_ROT.i = -1; var t = { id: "tL", nombre: "Prueba", msgs: [] }, d0 = __dichos.length;
      leeArranca(t, [{ tx: "Primer mensaje." }, { tx: "Segundo mensaje." }, { tx: "Tercer mensaje." }], "suelto");
      await hasta(function () { return __dichos.length - d0 >= 3; }, 3000); leePara();
      return __dichos.slice(d0, d0 + 3).map(function (d) { return d.voz; }); });
    eq("lectura: cada mensaje con la siguiente voz", F, ["Paulina (Premium)", "Mónica", "Juan"]);

    /* ---------- 7 · voz guardada que no existe en este dispositivo: se salta sin error ---------- */
    var G = await p.evaluate(async function () {
      PERSONAS.salvador.voces = { v: 1, elenco: ["voz.fantasma.de.otro.telefono", "com.apple.voice.compact.es-MX.Juan"], ritmo: 1.1, tono: 1, ts: 1 };
      VOZ_ROT.i = -1; var el = vozElenco().map(function (v) { return v.name; });
      CAM.on = true; var d0 = __dichos.length, listo = false, err = null;
      try { camDi274([{ v: "A", t: "Hola." }, { v: "B", t: "Qué tal." }], function () { listo = true; }); } catch (e) { err = e.message; }
      await hasta(function () { return listo; }, 3000); CAM.on = false; CAM.tok++;
      vista = "voces"; render(); var fil = document.querySelectorAll('.vocsel[aria-checked="true"]').length;
      return { el: el, err: err, voces: __dichos.slice(d0).map(function (d) { return [d.voz, d.pitch !== undefined && d.pitch !== 1]; }), fil: fil }; });
    eq("voz inexistente: el elenco queda con la que sí hay", G.el, ["Juan"]);
    eq("con una sola voz la Caminata no truena y distingue A/B por tono", [G.err, G.voces], [null, [["Juan", true], ["Juan", true]]]);
    eq("la pantalla marca solo la que existe", G.fil, 1);

    /* ---------- 8 · sin elenco: la mejor es-MX (Premium antes que normal) ---------- */
    var H = await p.evaluate(async function () {
      PERSONAS.salvador.voces = { v: 1, elenco: [], tono: 1, ts: 2 };
      var r = { mejor: vozMejor().name, lee: _leeVoz().name, cam: camVoces274().A.name };
      CAM.on = true; var d0 = __dichos.length, listo = false;
      camDi274([{ v: "A", t: "Hola." }], function () { listo = true; }); await hasta(function () { return listo; }, 3000); CAM.on = false; CAM.tok++;
      r.dicho = __dichos[d0].voz; return r; });
    eq("sin elenco: Paulina Premium (es-MX) en lectura y Caminata", H, { mejor: "Paulina (Premium)", lee: "Paulina (Premium)", cam: "Paulina (Premium)", dicho: "Paulina (Premium)" });

    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN: " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? "FALLAS:\n  " + malas.join("\n  ") : "todo bien");
  console.log("RESULTADO " + ok + "/" + n); process.exit(malas.length ? 1 : 0);
})();
