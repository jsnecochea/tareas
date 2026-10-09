#!/usr/bin/env node
/* PRUEBAS build 251 (Salvador 6-oct 07:54 y 07:58). a 390 px, reloj fijo 2026-10-06 07:20 (Torreón).
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
eq("versión >= 254", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 254, true);
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
      window.NOW = Date.now(); document.getElementById("app").style.display = "flex";
      window.ORIGEN = function () { return { id: "tIQOSA", nombre: "IQOSA Proyecto", duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_dictada: true,
        contexto: "Proyecto con el equipo de IQOSA.", wa_contactos: [{ nombre: "iqosa team", desde: 1 }],
        msgs: [{ k: "bi", wa_in: 1, wa_c: "iqosa team", t: "iqosa team: Buen día, ¿cómo vamos con el proyecto?", ts: NOW - 3600000, h: "09:20", wa_id: "w1" }] }; };
      window.abre = function (T, extra) { tareas = [T].concat(extra || []); abierta = T.id; vista = "hilo"; render(); };
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; setTimeout(function () { cb(JSON.stringify(j)); }, ms || 20); }; };
    });

    var IQ = "Para que le comentes a iqosa team que necesito el avance del proyecto, a ver si tú le puedes poner el mensaje y irme dando el avance";
    await p.evaluate(function () { window.modelo({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], dudas: [], pregunta: null, ordenes: [] }, 20); });
    var abreT = async function () { await p.evaluate(function () { [].forEach.call(document.querySelectorAll("#preg249,#hoja254,#acom249,#det242,#mov225,.leemask,.cnlbg,.cnlsheet"), function (e) { e.remove(); }); __WA.length = 0; delete window.__dest254; window.__dest254 = {}; var T = ORIGEN(); abre(T); window.__T = T; }); await p.waitForTimeout(60); };
    var escribe = async function (v) { await p.evaluate(function (v) { var tx = document.getElementById("txt"); tx.value = v; tx.dispatchEvent(new Event("input", { bubbles: true })); }, v); await p.keyboard.press("Enter").catch(function () {}); };
    var envia = async function (v) { await p.evaluate(function (v) { var tx = document.getElementById("txt"); tx.value = v; document.getElementById("tenv").click(); }, v); await p.waitForTimeout(150); };
    await abreT();
    var h0 = await p.evaluate(function () { var c = document.getElementById("tdest254"); return { ph: document.getElementById("txt").getAttribute("data-ph"), chip: c ? c.textContent.replace("⌄", "") : null, izq: c ? (c.compareDocumentPosition(document.getElementById("txt")) & 4) > 0 : false }; });
    eq("Por defecto: placeholder 'Indicación para Claude…' y chip 'Claude' a la izquierda del cuadro", h0, { ph: "Indicación para Claude…", chip: "Claude", izq: true });
    await foto("b254-1-chip-claude.png");
    /* 1) el caso IQOSA literal */
    await envia(IQ); await p.waitForTimeout(500);
    var r1 = await p.evaluate(function () { var T = tareas[0]; return { wa: __WA.length, salioDirecto: T.msgs.some(function (m) { return m.wa_auto || m.wa_pid; }), indic: T.msgs.some(function (m) { return m.dict238 && /avance del proyecto/.test(m.t); }), prompt: /necesito el avance del proyecto/.test(window.__PROMPT || ""), hoja: !!document.getElementById("hoja254") }; });
    eq("IQOSA (texto real): NO sale por WhatsApp; entra como indicación al cerebro", r1, { wa: 0, salioDirecto: false, indic: true, prompt: true, hoja: false });
    /* 2) selector en WhatsApp + indicación para Claude -> hoja */
    await abreT();
    await p.click("#tdest254"); await p.waitForTimeout(60);
    var o2 = await p.evaluate(function () { return [].map.call(document.querySelectorAll("#dest254 [data-d254]"), function (b) { return b.textContent.replace(/\s+/g, " ").trim(); }); });
    eq("El chip abre el selector: Claude / WhatsApp a <contacto>", [/^Claude/.test(o2[0]), /^WhatsApp a iqosa team/.test(o2[1])], [true, true]);
    await p.click('#dest254 [data-d254="wa"]'); await p.waitForTimeout(80);
    var c2 = await p.evaluate(function () { return { chip: document.getElementById("tdest254").textContent.replace("⌄", ""), ph: document.getElementById("txt").getAttribute("data-ph") }; });
    eq("Con el selector en WhatsApp: chip 'WhatsApp' y placeholder del contacto", c2, { chip: "WhatsApp", ph: "Mensaje a iqosa team por WhatsApp…" });
    await envia(IQ);
    var h2 = await p.evaluate(function () { var h = document.getElementById("hoja254"); return { hoja: h ? h.querySelector("b").textContent : null, btns: h ? [].map.call(h.querySelectorAll("[data-h254]"), function (b) { return b.textContent; }) : [], wa: __WA.length, caja: document.getElementById("txt").value }; });
    eq("Aunque el selector esté en WhatsApp, el texto de indicación NO se manda: hoja con [Es para Claude] [Mandarlo así a iqosa]", [h2.hoja, h2.btns, h2.wa], ["Esto parece indicación para Claude", ["Es para Claude", "Mandarlo así a iqosa"], 0]);
    await foto("b254-2-hoja-indicacion.png");
    await p.click('#hoja254 [data-h254="claude"]'); await p.waitForTimeout(500);
    var r2 = await p.evaluate(function () { var T = tareas[0]; return { wa: __WA.length, indic: T.msgs.some(function (m) { return m.dict238; }), vuelve: !(window.__dest254 && window.__dest254[T.id]), chip: document.getElementById("tdest254").textContent.replace("⌄", "") }; });
    eq("[Es para Claude] procesa como indicación y el selector vuelve a Claude", r2, { wa: 0, indic: true, vuelve: true, chip: "Claude" });
    /* 3) mensaje normal: vista previa, cancelar y mandar */
    await abreT(); await p.evaluate(function () { window.__dest254[tareas[0].id] = "wa"; render(); });
    await envia("Hola, buen día. ¿Me confirmas el avance de hoy?");
    var v3 = await p.evaluate(function () { var h = document.getElementById("hoja254"); return { tit: h ? h.querySelector("b").textContent : null, txt: h ? h.querySelector(".pv254").textContent : null, btns: h ? [].map.call(h.querySelectorAll("[data-h254]"), function (b) { return b.textContent; }) : [], wa: __WA.length }; });
    eq("Mensaje directo: vista previa 'Se va a mandar a iqosa:' con [Mandar] [Cancelar]; aún no sale", v3, { tit: "Se va a mandar a iqosa:", txt: "Hola, buen día. ¿Me confirmas el avance de hoy?", btns: ["Mandar", "Cancelar"], wa: 0 });
    await foto("b254-3-vista-previa.png");
    await p.click('#hoja254 [data-h254="cancela"]'); await p.waitForTimeout(60);
    var k3 = await p.evaluate(function () { return { wa: __WA.length, caja: document.getElementById("txt").value, hoja: !!document.getElementById("hoja254") }; });
    eq("Cancelar: no sale y el texto vuelve a la caja", k3, { wa: 0, caja: "Hola, buen día. ¿Me confirmas el avance de hoy?", hoja: false });
    await envia("Hola, buen día. ¿Me confirmas el avance de hoy?"); await p.click('#hoja254 [data-h254="manda"]'); await p.waitForTimeout(250);
    var m3 = await p.evaluate(function () { var T = tareas[0]; return { wa: __WA.map(function (c) { return [c.contacto, c.texto]; }), canal: T.msgs[T.msgs.length - 1].canal, vuelve: !(window.__dest254 && window.__dest254[T.id]), chip: document.getElementById("tdest254").textContent.replace("⌄", "") }; });
    eq("Mandar: sale a iqosa team y el selector vuelve solo a Claude", m3, { wa: [["iqosa team", "Hola, buen día. ¿Me confirmas el avance de hoy?"]], canal: "ext:iqosa team", vuelve: true, chip: "Claude" });
    /* 4) 'Mandarlo así' manda aunque parezca indicación (elección explícita) */
    await abreT(); await p.evaluate(function () { window.__dest254[tareas[0].id] = "wa"; render(); });
    await envia("Para que le avises que ya pagué el anticipo"); await p.click('#hoja254 [data-h254="asi"]'); await p.waitForTimeout(250);
    eq("[Mandarlo así] lo manda (elección explícita)", await p.evaluate(function () { return __WA.length; }), 1);
    /* 5) clasificador */
    var cl = await p.evaluate(function () { return ["le comentes que ya llegué", "Dile que mañana paso", "pregúntale por el presupuesto", "irme dando el avance", "cotízame el motor", "a ver si tú le puedes escribir", "Hola, buen día", "Gracias, quedo atento", "¿Me mandas el plano por favor?", "iqosa dice que mañana viene"].map(function (x) { return clasifica254(x, "iqosa team"); }); });
    eq("Clasificador barato", cl, ["claude", "claude", "claude", "claude", "claude", "claude", "wa", "wa", "wa", "duda"]);
    /* 6) duda: Claude decide */
    await abreT(); await p.evaluate(function () { window.__dest254[tareas[0].id] = "wa"; render(); window.modelo({ para: "contacto" }, 20); });
    await envia("iqosa dice que mañana viene"); await p.waitForTimeout(150);
    eq("En duda decide Claude: 'contacto' = vista previa", await p.evaluate(function () { var h = document.getElementById("hoja254"); return h ? h.querySelector("b").textContent : null; }), "Se va a mandar a iqosa:");
    await abreT(); await p.evaluate(function () { window.__dest254[tareas[0].id] = "wa"; render(); preguntaAClaude = function (m, mo, cb) { setTimeout(function () { cb(null, "sin red"); }, 10); }; });
    await envia("iqosa dice que mañana viene"); await p.waitForTimeout(150);
    eq("En duda sin respuesta de Claude: lo seguro, hoja de indicación", await p.evaluate(function () { var h = document.getElementById("hoja254"); return h ? h.querySelector("b").textContent : null; }), "Esto parece indicación para Claude");
    /* 7) menú de pulsación larga */
    await p.evaluate(function () { window.modelo({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], dudas: [], pregunta: null, ordenes: [] }, 20); });
    await abreT(); await p.evaluate(function () { var T = tareas[0]; msg(T, "bo", "Pásale el avance a iqosa"); var m = T.msgs[T.msgs.length - 1]; m.de = "salvador"; m.canal = "ext:iqosa team"; m.wa_auto = "iqosa team"; m.wa_pid = "px"; guarda(T); window.__cnl[T.id] = "todo"; poneVista(T, ""); window.__cnl[T.id] = "todo"; render(); });
    var ixP = await p.evaluate(function () { return tareas[0].msgs.length - 1; });
    var menu = async function (ix) { return await p.evaluate(function (ix) { var el = document.querySelector('.msgs [data-mix="' + ix + '"]'); if (!el) return null; var ops = leeOpcionesDe(el); return ops ? ops.map(function (o) { return o[0]; }) : null; }, ix); };
    var mo = await menu(ixP);
    eq("Pulsación larga en burbuja propia: mismo menú que el toque (+ Seleccionar/Leer/Copiar)", mo, ["Seleccionar", "Leer desde aquí", "Leer lo actual", "Copiar", "Editar", "Eliminar", "Es para Claude", "Mover a otra tarea", "Nueva", "Dato", "No guardar"]);
    var mw = await menu(0);
    eq("En un globo ajeno: Mover · Nueva · Dato · No guardar, sin Editar/Eliminar/Es para Claude", mw.filter(function (x) { return /Editar|Eliminar|Es para Claude/.test(x); }).length + "|" + mw.indexOf("Nueva") + "|" + (mw.indexOf("Dato") > 0), "0|" + mw.indexOf("Nueva") + "|true");
    /* acciones del menú largo */
    await p.evaluate(function (ix) { var el = document.querySelector('.msgs [data-mix="' + ix + '"]'); leeOpcionesDe(el).filter(function (o) { return o[0] === "Es para Claude"; })[0][1](); }, ixP); await p.waitForTimeout(400);
    var a4 = await p.evaluate(function (ix) { var T = tareas[0], x = T.msgs[ix]; var h = document.getElementById("hoja254"); return { oculto: x.oculto_motivo, aviso: h ? h.querySelector("b").textContent : null, cuerpo: h ? h.querySelector(".h225v0").textContent : null, borra: __WA.length }; }, ixP);
    eq("Es para Claude en una burbuja que YA salió por WhatsApp: se procesa y avisa cómo borrarla (sin borrar por servidor)", a4, { oculto: "es_para_claude", aviso: "Este ya le llegó a iqosa", cuerpo: "Bórralo en tu WhatsApp: mantenlo presionado → Eliminar → Eliminar para todos.", borra: 0 });
    await foto("b254-4-aviso-ya-llego.png");
    /* Editar desde el menú largo */
    await p.evaluate(function () { var h = document.getElementById("hoja254"); if (h) h.remove(); });
    await abreT(); await p.evaluate(function () { var T = tareas[0]; msg(T, "bo", "Texto para editar"); var m = T.msgs[T.msgs.length - 1]; m.de = "salvador"; poneVista(T, ""); window.__cnl[T.id] = "todo"; render(); });
    var ixE = await p.evaluate(function () { return tareas[0].msgs.length - 1; });
    await p.evaluate(function (ix) { leeOpcionesDe(document.querySelector('.msgs [data-mix="' + ix + '"]')).filter(function (o) { return o[0] === "Editar"; })[0][1](); }, ixE); await p.waitForTimeout(100);
    eq("Editar desde el menú largo abre el editor del mensaje", await p.evaluate(function () { return !!document.querySelector("#det242 #ed247t"); }), true);
    await p.evaluate(function () { var d = document.getElementById("det242"); if (d) d.remove(); });
    await p.evaluate(function (ix) { leeOpcionesDe(document.querySelector('.msgs [data-mix="' + ix + '"]')).filter(function (o) { return o[0] === "Eliminar"; })[0][1](); }, ixE); await p.waitForTimeout(100);
    eq("Eliminar desde el menú largo aparta el mensaje (no lo borra)", await p.evaluate(function (ix) { var x = tareas[0].msgs[ix]; return [x.oculto, x.oculto_motivo]; }, ixE), [true, "eliminado"]);
    /* 8) una tarea sin WhatsApp no cambia */
    await p.evaluate(function () { var T = { id: "tSOLO", nombre: "Sin contactos", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_dictada: true, contexto: "x", msgs: [] }; abre(T); });
    eq("Sin contacto de WhatsApp no hay chip (el cuadro funciona como antes)", await p.evaluate(function () { return !document.getElementById("tdest254"); }), true);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? "FALLAS:\n" + malas.join("\n") : "todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
