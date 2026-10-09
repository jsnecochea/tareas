#!/usr/bin/env node
/* PRUEBAS build 250 (condicionales) (Salvador 6-oct 07:54 y 07:58). a 390 px, reloj fijo 2026-10-06 07:20 (Torreón).
   1) Mover > "Tarea nueva": ventanita "Nombre de la tarea nueva" con sugerencia del MENSAJE (nunca el nombre de la tarea de origen), Crear / Cancelar;
      al crear, la app va a la tarea nueva con el mensaje adentro. Caminos: Mover (globo/Te pregunta), Acomodo (botón Nueva), lote y barra de selección.
   2) Vista de revisión: TODO dictado va al cerebro del 238 (el mensaje que pide lo arma el cerebro, no sale tal cual al WhatsApp); mientras trabaja
      la pantalla se difumina con "Claude está acomodando…"; al terminar se libera YA REFRESCADA (aunque el snapshot haya reemplazado los objetos).
   3) Preguntas del cerebro en su ventanita: una por renglón, con botones o campo; las de persona autocompletan con TODOS los contactos de la app;
      al contestar todas se aplican, se programa y queda refrescada.
   Correr: node tests/b249.test.js (CAP=<carpeta> para capturas) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 250", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 250, true);
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
    await p.evaluate(function () { yo = "salvador"; window.__WA = []; window.__agendaNo = 1;
      db = { collection: function () { return { doc: function () { return { set: function () { return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.NOW = Date.now();
      window.ORIGEN = function () { return { id: "tORIGEN", nombre: "Mantenimiento Casa Lerdo", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-12", f_original: "2026-10-12", fecha_dictada: true,
        contexto: "Mantenimiento de la casa de Lerdo: pintura, portón y jardín, con Carlos y Manuel.", ritmo: "Cada semana", wa_contactos: [{ nombre: "Carlos Ibarra", desde: 1 }],
        msgs: [{ k: "bi", wa_in: 1, wa_c: "Carlos Ibarra", t: "Carlos Ibarra: Oye ya llegó el material del portón eléctrico, te lo dejo mañana en la casa", ts: NOW - 3600000, h: "06:20", wa_id: "w1" },
               { k: "bi", wa_in: 1, wa_c: "Carlos Ibarra", t: "Carlos Ibarra: Y también te mando la cotización del motor", ts: NOW - 3500000, h: "06:21", wa_id: "w2" }] }; };
      window.abre = function (T, extra) { tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; render(); };
      window.modelo2 = function (reparto, j, ms) { preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; window.__PROMPTS = (window.__PROMPTS || []).concat([msgs[0].content]); var rep = /Reparte su respuesta/.test(msgs[0].content); setTimeout(function () { cb(JSON.stringify(rep ? reparto : j)); }, ms || 20); }; };
      window.dicta255 = function (v) { var tx = document.getElementById("txt"); tx.value = v; document.getElementById("tenv").click(); };
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; setTimeout(function () { cb(JSON.stringify(j)); }, ms || 20); }; };
    });

    var TXT = "Mañana tengo que contestarle a Eduardo… Si puedes mándale mensaje hoy a Karina y si te contesta que sí puede le confirmas a Eduardo que nosotros sí podemos cenar el jueves";
    await p.evaluate(function () {
      window.CENA = function (extra) { return { id: "tmuw49g3f2a7gt", nombre: "Cena Jueves Amigos", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-08", f_original: "2026-10-08", fecha_dictada: true,
        contexto: "Cena del jueves 8 de octubre con los amigos; Eduardo organiza y hay que confirmarle si podemos ir Karina y yo.", wa_contactos: [{ nombre: "Eduardo Madero", desde: 1 }].concat(extra || []),
        msgs: [{ k: "bi", wa_in: 1, wa_c: "Eduardo Madero", t: "Eduardo Madero: ¿Pueden cenar el jueves?", ts: Date.now() - 7200000, h: "19:10", wa_id: "e1" }] }; };
      window.MODELO = { tipo: "tarea", fecha: null, recordar: [{ fecha: "2026-10-07", hora: null }], vinculos: [], dudas: [], pregunta: null,
        ordenes: [{ tipo: "condicional", pregunta_a: "Karina", pregunta_texto: "¿Puedes cenar el jueves 8 con los amigos? Eduardo nos invitó y me pidió confirmarle.", si_a: "Eduardo", si_texto: "Sí podemos cenar el jueves.", vence: null, vence_hora: null, evento_fecha: "2026-10-08" }] };
    });
    /* A) un solo Karina: manda la pregunta y deja el encargo */
    var rA = await p.evaluate(async function (D) { __WA.length = 0; var T = CENA(); abre(T); modelo(MODELO, 20);
      completaRevision(T, D, { sinRevision: true }); await espera(500);
      var V = tareas[0], e = (V.encargos || [])[0] || {};
      return { wa: __WA.length, dm: (V.msgs || []).filter(function (m) { return m.k === "bo" && /^IA: ¿Puedes cenar el jueves 8/.test(m.t); }).length, ediMsg: (V.msgs || []).filter(function (m) { return /Eduardo, de parte de Salvador/.test(m.t || ""); }).length, nEnc: (V.encargos || []).length, tipo: e.tipo, estado: e.estado, preg: e.pregunta, sisi: e.si_si && [e.si_si.contacto, /^IA: Eduardo, de parte de Salvador: Sí podemos cenar el jueves\./.test(e.si_si.texto)], sino: e.si_no, vence: e.vence, por: e.por, tieneId: !!e.id, creado: typeof e.creado,
        hecho: ((V.hecho238 || {}).hecho || []), avisos: (V.avisos || []).length, falta: ((V.hecho238 || {}).falta || []).length }; }, TXT);
    eq("Condicional: manda SOLO la pregunta a Karina, con IA: y contexto (a Eduardo no se le manda nada todavía)", [rA.dm, rA.wa, rA.ediMsg], [1, 0, 0]);
    eq("Condicional: encargo {condicional, esperando, pregunta, si_si, si_no, vence, creado, por}", [rA.nEnc, rA.tipo, rA.estado, rA.sisi, rA.sino, rA.por, rA.tieneId, rA.creado], [1, "condicional", "esperando", ["Eduardo Madero", true], { accion: "nota" }, "salvador", true, "number"]);
    eq("Condicional: pregunta.contacto es Karina", rA.preg.contacto, "Karina");
    eq("Condicional: vence el día antes del evento (jueves 8) a las 20:00", rA.vence, "2026-10-07T20:00:00-06:00");
    eq("Hecho dice lo que pasó; NO hay aviso sin hora por 'Mañana tengo que contestarle a Eduardo'; nada por preguntar", [rA.hecho, rA.avisos, rA.falta], [["Le pregunté a Karina. Si dice que sí, le confirmo a Eduardo."], 0, 0]);
    var rA2 = await p.evaluate(function () { var h = document.querySelector(".cond250"); return { hay: !!h, txt: h ? h.textContent : "" }; });
    eq("La tarjeta de la tarea muestra 'Esperando respuesta de Karina → confirmar a Eduardo' con su estado", [rA2.hay, /Esperando respuesta de Karina → confirmar a Eduardo/.test(rA2.txt), /esperando respuesta · vence .*7 de octubre 20:00/.test(rA2.txt)], [true, true, true]);
    await foto("b250-1-encargo-condicional.png");
    /* estado que pone la Mac */
    /* build 263 (y b263.test.js): un condicional cerrado (contesto_si, contesto_no, confirmado, vencido…) se OCULTA solo; mientras espera, se ve */
    var rA3 = await p.evaluate(function () { var e = tareas[0].encargos[0]; e.estado = "contesto_si"; render(); var oculto = !document.querySelector(".cond250"), sigue = tareas[0].encargos.length === 1 && tareas[0].encargos[0].estado === "contesto_si";
      e.estado = "esperando"; render(); var h = document.querySelector(".cond250"); return [oculto, sigue, !!h && /esperando respuesta/.test(h.textContent)]; });
    eq("La tarjeta sigue el estado: al decir que sí se oculta (el encargo queda guardado) y si vuelve a esperar, reaparece", rA3, [true, true, true]);
    /* el pedido_id se anota cuando WhatsApp devuelve el id */
    var rA4 = await p.evaluate(async function (D) { __WA.length = 0; pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "ped77" }); }; var M2 = JSON.parse(JSON.stringify(MODELO)); M2.ordenes[0].pregunta_a = "Rogelio Sada"; var T = CENA([{ nombre: "Rogelio Sada", desde: 1 }]); abre(T); modelo(M2, 20); completaRevision(T, D, { sinRevision: true }); await espera(600); return tareas[0].encargos[0].pregunta; }, TXT);
    eq("pedido_id queda en el encargo", rA4, { contacto: "Rogelio Sada", pedido_id: "ped77" });
    /* B) dos Karina: pregunta cuál ANTES de mandar */
    var rB = await p.evaluate(async function (D) { __WA.length = 0; pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "pz" + __WA.length }); };
      var T = CENA([{ nombre: "Karina Gomez", desde: 1 }]); var O = { id: "tOTRA", nombre: "Pádel", duenio: "salvador", estado: "abierta", wa_contactos: [{ nombre: "Karina GP", desde: 1 }], msgs: [] }; abre(T, [O]); modelo(MODELO, 20);
      completaRevision(T, D, { sinRevision: true }); await espera(2700);
      var V = tareas[0], m = document.getElementById("preg249"), filas = m ? [].map.call(m.querySelectorAll(".pq255l li"), function (x) { return x.textContent; }) : [], ops = m ? (m.querySelector(".pq255l small") || { textContent: "" }).textContent.replace(/[()]/g, "").split(" · ").filter(Boolean) : [];
      return { wa: __WA.length, nEnc: (V.encargos || []).length, hay: !!m, filas: filas, ops: ops, falta: ((V.hecho238 || {}).falta || []).map(function (f) { return [f.k, f.lado]; }) }; }, TXT);
    eq("Varias Karina: no manda nada y pregunta cuál (tarjeta de preguntas), con las dos opciones", [rB.wa, rB.nEnc, rB.hay, rB.falta, rB.ops.sort()], [0, 0, true, [["cond", "A"]], ["Karina GP", "Karina Gomez"].sort()]);
    eq("Varias Karina: el renglón dice cuál", /¿Cuál Karina es\?/.test(rB.filas[0] || ""), true);
    await foto("b250-2-cual-karina.png");
    var rB2 = await p.evaluate(async function () { modelo2({ respuestas: [{ n: 1, r: "Karina GP" }] }, MODELO, 20); dicta255("La de Pádel, Karina GP"); await espera(2500);
      var V = tareas[0], e = (V.encargos || [])[0] || {};
      return { wa: __WA.map(function (w) { return [w.contacto, /^IA: /.test(w.texto) && !/de parte de Salvador/.test(w.texto)]; }), tipo: e.tipo, preg: e.pregunta && e.pregunta.contacto, si: e.si_si && e.si_si.contacto, hecho: ((V.hecho238 || {}).hecho || []).join("|"), pend: Object.keys(V.cond_pend250 || {}).length, modal: !!document.getElementById("preg249") }; });
    eq("Varias Karina: al elegir 'Karina GP' ahora sí manda la pregunta y deja el encargo", [rB2.wa, rB2.tipo, rB2.preg, rB2.si, rB2.pend], [[["Karina GP", true]], "condicional", "Karina GP", "Eduardo Madero", 0]);
    eq("Varias Karina: Hecho dice que le preguntó", /Le pregunté a Karina\. Si dice que sí, le confirmo a Eduardo\./.test(rB2.hecho), true);
    /* C) sin condicional, 'tengo que contestarle' con mensaje suelto tampoco es aviso sin hora; sin orden ejecutable sí queda el aviso */
    var rC = await p.evaluate(async function () { var T = CENA(); abre(T); modelo({ tipo: "tarea", fecha: null, recordar: [{ fecha: "2026-10-07", hora: null }], vinculos: [], dudas: [], pregunta: null, ordenes: [] }, 20);
      completaRevision(T, "Mañana tengo que contestarle a Eduardo", { sinRevision: true }); await espera(400); return (tareas[0].avisos || []).length; });
    eq("Sin orden ejecutable, el aviso del cerebro se conserva (no se rompe lo de antes)", rC, 1);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? "FALLAS:\n" + malas.join("\n") : "todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
