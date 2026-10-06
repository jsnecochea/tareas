#!/usr/bin/env node
/* PRUEBAS build 249 (Salvador 6-oct 07:54 y 07:58). a 390 px, reloj fijo 2026-10-06 07:20 (Torreón).
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
eq("versión >= 249", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 249, true);
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
      window.modelo = function (j, ms) { preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; setTimeout(function () { cb(JSON.stringify(j)); }, ms || 20); }; };
    });

    /* ===== 1) Tarea nueva pide nombre ===== */
    var r1 = await p.evaluate(async function () { var T = ORIGEN(); abre(T); abreMover225(T, 0); document.querySelector("[data-movnueva]").click(); await espera(60);
      var d = document.getElementById("nom249"), i = d && d.querySelector("#nom249i"), nTar = tareas.length, mov = !!document.getElementById("mov225");
      return { hay: !!d, etiqueta: d ? /Nombre de la tarea nueva/.test(d.textContent) : false, valor: i ? i.value : "", botones: d ? [].map.call(d.querySelectorAll("button"), function (x) { return x.textContent; }) : [], nTar: nTar, hojaMover: mov, origen: T.nombre }; });
    eq("Nueva: sale la ventanita con el campo y la sugerencia", [r1.hay, r1.etiqueta, r1.botones.filter(Boolean)], [true, true, ["Cancelar", "Crear"]]);
    eq("Nueva: la sugerencia sale del mensaje, no del nombre de la tarea de origen", [r1.valor !== "" && r1.valor.toLowerCase() !== r1.origen.toLowerCase(), /material|port[oó]n|carlos/i.test(r1.valor)], [true, true]);
    eq("Nueva: aún no se creó nada y la hoja de mover se cerró", [r1.nTar, r1.hojaMover], [1, false]);
    await foto("b249-1-nombre-nueva.png");
    /* Cancelar: no crea */
    var r1b = await p.evaluate(async function () { document.querySelector('[data-nom249="x"]').click(); await espera(30); return { hay: !!document.getElementById("nom249"), nTar: tareas.length, ocultos: tareas[0].msgs.filter(function (m) { return m.oculto; }).length }; });
    eq("Cancelar: no crea ni mueve", r1b, { hay: false, nTar: 1, ocultos: 0 });
    /* nombre vacío no crea; con nombre crea y va a la tarea nueva */
    var r1c = await p.evaluate(async function () { var T = tareas[0]; abreMover225(T, 0); document.querySelector("[data-movnueva]").click(); await espera(40);
      var i = document.getElementById("nom249i"); i.value = "   "; document.querySelector('[data-nom249="ok"]').click(); await espera(30); var sigue = !!document.getElementById("nom249"), nT = tareas.length;
      i.value = "Material del Portón Eléctrico"; document.querySelector('[data-nom249="ok"]').click(); await espera(80);
      var N = tareas.filter(function (x) { return x.id !== "tORIGEN"; })[0];
      return { sigue: sigue, nT0: nT, nT: tareas.length, nombre: N && N.nombre, abierta: abierta === (N && N.id), vista: vista, adentro: N ? N.msgs.some(function (m) { return /Movido desde Mantenimiento Casa Lerdo: .*material del portón/i.test(m.t); }) : false, origenOculto: T.msgs[0].oculto === true, distinto: N && N.nombre !== T.nombre }; });
    eq("Nueva con nombre vacío: no crea", [r1c.sigue, r1c.nT0], [true, 1]);
    eq("Nueva: crea con el nombre elegido, va a ella y el mensaje queda adentro", [r1c.nT, r1c.nombre, r1c.abierta, r1c.vista, r1c.adentro, r1c.origenOculto, r1c.distinto], [2, "Material del Portón Eléctrico", true, "hilo", true, true, true]);
    /* Acomodo (botón Nueva): también pide nombre */
    var r1d = await p.evaluate(async function () { var T = ORIGEN(); abre(T); var d = document.createElement("div"); d.id = "pruebaAc"; d.innerHTML = botones247(1); document.body.appendChild(d); bindAcomodo(d, function () { return T; });
      d.querySelector("[data-acnueva]").click(); await espera(40); var v = document.getElementById("nom249i"), hay = !!v, val = v ? v.value : ""; v.value = "Cotización del motor"; document.querySelector('[data-nom249="ok"]').click(); await espera(80);
      var N = tareas.filter(function (x) { return x.id !== "tORIGEN"; })[0]; d.remove();
      return { hay: hay, val: val !== T.nombre && val !== "", nombre: N && N.nombre, va: abierta === (N && N.id) }; });
    eq("Acomodo > Nueva: pide nombre, crea y va a la nueva", r1d, { hay: true, val: true, nombre: "Cotización del Motor", va: true });
    /* lote: Mover todos > Tarea nueva */
    var r1e = await p.evaluate(async function () { var T = ORIGEN(); abre(T); abreMover225(T, 0, [0, 1], { lote: true }); document.querySelector("[data-movnueva]").click(); await espera(40);
      var hay = !!document.getElementById("nom249"); document.getElementById("nom249i").value = "Portón eléctrico y motor"; document.querySelector('[data-nom249="ok"]').click(); await espera(100);
      var N = tareas.filter(function (x) { return x.id !== "tORIGEN"; })[0];
      return { hay: hay, nombre: N && N.nombre, msgsN: N ? N.msgs.filter(function (m) { return m.nuevo_mov; }).length : 0, va: abierta === (N && N.id), ocultos: T.msgs.filter(function (m) { return m.oculto; }).length }; });
    eq("Lote: Tarea nueva pide nombre; pasan los 2 mensajes y va a la nueva", r1e, { hay: true, nombre: "Portón Eléctrico y Motor", msgsN: 2, va: true, ocultos: 2 });
    /* barra de selección */
    var r1f = await p.evaluate(async function () { var T = ORIGEN(); abre(T); window.__sel245 = { tid: T.id, set: { 0: 1 } }; pintaSel245(); var b = document.querySelector('[data-sel245="nueva"]'); b.click(); await espera(40);
      var hay = !!document.getElementById("nom249"); document.getElementById("nom249i").value = "Llegada del material"; document.querySelector('[data-nom249="ok"]').click(); await espera(100);
      var N = tareas.filter(function (x) { return x.id !== "tORIGEN"; })[0]; var bar = !!document.getElementById("selbar245");
      return { hay: hay, nombre: N && N.nombre, va: abierta === (N && N.id), bar: bar }; });
    eq("Barra de selección > Nueva: pide nombre y va a la nueva", r1f, { hay: true, nombre: "Llegada del Material", va: true, bar: false });
    /* Te pregunta > Mover > Tarea nueva */
    var r1g = await p.evaluate(async function () { var T = ORIGEN(); T.msgs.push({ k: "bi", wa_in: 1, wa_c: "Carlos Ibarra", t: "Carlos Ibarra: ¿Quieres que te cotice también las lámparas del jardín?", ts: NOW - 1000, h: "07:19", wa_id: "w3" }); abre(T);
      abreMover225(T, 2, [2, 3 - 1].filter(function (x, i, a) { return a.indexOf(x) === i; })); document.querySelector("[data-movnueva]").click(); await espera(40);
      var i = document.getElementById("nom249i"), val = i ? i.value : ""; return { hay: !!i, val: val, distinto: _nn(val) !== _nn(T.nombre) }; });
    eq("Te pregunta/Mover > Nueva: ventanita y sugerencia distinta de la tarea de origen", [r1g.hay, r1g.distinto, /l[aá]mparas|cotice|jard[ií]n|carlos/i.test(r1g.val)], [true, true, true]);
    await p.evaluate(function () { var d = document.getElementById("nom249"); if (d) d.remove(); });

    /* ===== 2) Vista de revisión: todo dictado va al cerebro, con pantalla difuminada y refrescada ===== */
    var D2 = "dile a Carlos que me confirme mañana si ya instalaron el motor del portón y que esta tarea es para el 15 de octubre, ya tengo el contexto: se está remodelando el acceso";
    var NUEVA = function () { return { id: "tNUEVA", nombre: "Portón eléctrico", duenio: "salvador", creada_por: "ia_revisor", origen: "wa_revisor", por_autorizar: true, estado: "abierta", tipo_item: "tarea", pendiente_info: "La IA la creó por WhatsApp de Carlos. ¿Fecha y quién la hace?", pendiente_tipo: "dato", falta_fecha: true,
      wa_contactos: [{ nombre: "Carlos Ibarra", desde: 1 }], contexto: "Carlos: ya llegó el material del portón.", msgs: [{ k: "bi", wa_in: 1, wa_c: "Carlos Ibarra", t: "Carlos Ibarra: ya llegó el material del portón", ts: Date.now() - 1e6, h: "06:50", wa_id: "w9" }] }; };
    await p.evaluate(function (src) { window.NUEVA = eval("(" + src + ")"); }, NUEVA.toString());
    var r2 = await p.evaluate(async function (D) { __WA.length = 0; var T = NUEVA(); abre(T);
      var enRev = enRevision249(T), enRevNormal = enRevision249(ORIGEN());
      window.__ESC249 = 0; var _pw = pideWhatsApp; pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      modelo({ tipo: "tarea", fecha: "2026-10-15", contexto: "Remodelación del acceso de la casa: portón eléctrico nuevo, Carlos instala el motor y Manuel termina la pintura del frente.", quien: null, recordar: [], vinculos: [], dudas: [], pregunta: null, palabras: ["portón", "motor"],
        ordenes: [{ tipo: "mensaje", a: "Carlos Ibarra", canal: "whatsapp", texto: "¿Me confirmas mañana si ya instalaron el motor del portón?" }] }, 900);
      document.getElementById("txt").value = D; document.getElementById("txt").dispatchEvent(new Event("input")); document.getElementById("tenv").click();
      await espera(350);
      var ov = document.getElementById("acom249"), cs = ov ? getComputedStyle(ov) : null, durante = { hay: !!ov, blur: !!(cs && /blur/.test((cs.backdropFilter || cs.webkitBackdropFilter || ""))), texto: ov ? ov.textContent : "", waCrudo: __WA.length };
      /* mientras trabaja, el snapshot reemplaza los objetos (como Firestore) */
      tareas = JSON.parse(JSON.stringify(tareas));
      window.__durante = durante; return { enRev: enRev, enRevNormal: enRevNormal, durante: durante }; }, D2);
    eq("enRevision249: la nueva sí, una normal no", [r2.enRev, r2.enRevNormal], [true, false]);
    eq("Revisión: mientras trabaja se difumina con 'Claude está acomodando…' y nada salió crudo al WhatsApp", [r2.durante.hay, r2.durante.blur, /Claude está acomodando/.test(r2.durante.texto), r2.durante.waCrudo], [true, true, true, 0]);
    await foto("b249-2-acomodando.png");
    await p.waitForTimeout(2600);
    var r2b = await p.evaluate(function () { var T = tareas.filter(function (x) { return x.id === "tNUEVA"; })[0], hc = document.querySelector(".hc238"), txt = document.getElementById("app").innerText;
      return { overlay: !!document.getElementById("acom249"), wa: __WA.map(function (w) { return [w.contacto, /^IA: Carlos, de parte de Salvador: ¿Me confirmas mañana si ya instalaron el motor del portón\?/.test(w.texto), w.texto.indexOf("dile a Carlos") < 0]; }),
        f: T.f_vigente, ctx: /Remodelación del acceso/.test(T.contexto || ""), hecho: !!(T.hecho238 && (T.hecho238.hecho || []).length), tarjeta: !!hc, tarjetaTxt: hc ? /Le escribí a Carlos/.test(hc.textContent) : false, enPantalla: /Remodelación del acceso|Hecho/.test(txt) }; });
    eq("Revisión: el cerebro armó el mensaje (con IA: y de parte de Salvador), no el dictado tal cual", r2b.wa, [["Carlos Ibarra", true, true]]);
    eq("Revisión: se libera la pantalla (sin overlay)", r2b.overlay, false);
    eq("Revisión: queda refrescada con el cambio hecho sobre la tarea viva (fecha, contexto, tarjeta Hecho)", [r2b.f, r2b.ctx, r2b.hecho, r2b.tarjeta, r2b.tarjetaTxt], ["2026-10-15", true, true, true, true]);
    await foto("b249-2-refrescada.png");

    /* ===== 3) Preguntas del cerebro en su ventanita ===== */
    var D3 = "dale seguimiento a Fernando hoy y el jueves a ver si ya tiene listo el fideicomiso";
    var r3 = await p.evaluate(async function (D) { __WA.length = 0;
      var T = { id: "tFIDE", nombre: "Fideicomiso: Seguimiento con BBVA", duenio: "salvador", creada_por: "ia_revisor", origen: "wa_revisor", por_autorizar: true, estado: "abierta", tipo_item: "tarea", pendiente_info: "La IA la creó. ¿Fecha y quién la hace?", pendiente_tipo: "dato", falta_fecha: true, contexto: "Seguimiento con BBVA para el fideicomiso.", wa_contactos: [], msgs: [] };
      var O1 = { id: "tO1", nombre: "Blue Cup", duenio: "salvador", estado: "abierta", wa_contactos: [{ nombre: "Fernando Fuentes BBVA", desde: 1 }, { nombre: "Fernando Ruiz BBVA", desde: 1 }], msgs: [] };
      var O2 = { id: "tO2", nombre: "Obra Cumbres", duenio: "salvador", estado: "abierta", wa_contactos: [{ nombre: "Fernando Garza", desde: 1 }], revisa_ext: "Fernando Lozano Constructora", msgs: [{ k: "bi", wa_in: 1, wa_c: "Fer Peñaloza", t: "Fer Peñaloza: hola", ts: 1, h: "05:00" }] };
      abre(T, [O1, O2]); window.AGENDA_WA = null;
      var cont0 = contactosApp249().length, cont = contactosApp249().map(function (c) { return c.nombre; });
      modelo({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], ordenes: [], pregunta: null, dudas: [{ pregunta: "¿A qué hora le escribo?", opciones: ["a las 10", "a las 12"] }],
        seguimiento_a: { quien: "Fernando", meta: "tener listo el fideicomiso", cada: "hoy y el jueves", fechas: ["2026-10-06", "2026-10-08"], hora: null, texto: "IA: Hola Fernando, ¿ya tienen listo el fideicomiso?" } }, 30);
      document.getElementById("txt").value = D; document.getElementById("txt").dispatchEvent(new Event("input")); document.getElementById("tenv").click();
      await espera(2800);
      var m = document.getElementById("preg249"), filas = m ? [].map.call(m.querySelectorAll(".pq255l li"), function (x) { return x.firstChild.textContent; }) : [];
      return { cont0: cont0, cont: cont, hay: !!m, filas: filas, overlay: !!document.getElementById("acom249"), dudas: (T.quien_dudas || []).length }; }, D3);
    console.log("CONTACTOS_ENCONTRADOS " + r3.cont0 + " :: " + r3.cont.join(" | "));
    eq("Preguntas (build 255): sale el bloque difuminado con las preguntas numeradas en texto", [r3.hay, r3.filas.slice(0, 2), r3.dudas, r3.overlay], [true, ["¿Quién es Fernando?", "¿A qué hora le escribo?"], 1, false]);
    eq("Contactos de la app (equipo, wa_contactos de todas las tareas, WhatsApp, responsables): incluye los Fernando de todas las tareas", [r3.cont.indexOf("Fernando Fuentes BBVA") >= 0, r3.cont.indexOf("Fernando Ruiz BBVA") >= 0, r3.cont.indexOf("Fernando Garza") >= 0, r3.cont.indexOf("Fernando Lozano Constructora") >= 0, r3.cont.indexOf("Fer Peñaloza") >= 0], [true, true, true, true, true]);
    await foto("b249-3-preguntas.png");
    /* contestar todo junto en un dictado: el cerebro reparte (persona + hora) y se aplica */
    var r3c = await p.evaluate(async function () { __WA.length = 0;
      var brain = { tipo: "tarea", fecha: "2026-10-08", contexto: "Seguimiento con BBVA para el fideicomiso: Fernando Fuentes debe tener listo el documento; se le escribe hoy y el jueves.", recordar: [], vinculos: [], ordenes: [], dudas: [], pregunta: null };
      var reparto = { respuestas: [{ n: 1, r: "Fernando Fuentes BBVA" }, { n: 2, r: "a las 10" }] };
      preguntaAClaude = function (msgs, mod, cb) { window.__PROMPT = msgs[0].content; window.__PROMPTS = (window.__PROMPTS || []).concat([msgs[0].content]); setTimeout(function () { cb(JSON.stringify(/Reparte su respuesta/.test(msgs[0].content) ? reparto : brain)); }, 30); };
      var tx = document.getElementById("txt"); tx.value = "Es Fernando Fuentes y escríbele a las 10"; document.getElementById("tenv").click(); await espera(2800);
      var T = tareas.filter(function (x) { return x.id === "tFIDE"; })[0];
      return { reparto: (window.__PROMPTS || []).some(function (q) { return /Reparte su respuesta/.test(q) && /1\. ¿Quién es Fernando\?/.test(q) && /2\. ¿A qué hora le escribo\?/.test(q); }), dbg: preguntas249(T).map(function(q){return q.q;}), cerrada: !document.getElementById("preg249"), overlay: !!document.getElementById("acom249"), dudas: (T.quien_dudas || []).length, wa: __WA.map(function (w) { return [w.contacto, /^\[A LAS 2026-10-0[68] \d{1,2}:\d{2}\]/.test(w.texto)]; }),
        prompt: /Respuesta a «¿A qué hora le escribo\?»: a las 10/.test(window.__PROMPT || ""), tarjeta: !!document.querySelector(".hc238"), seg: T.seg_a && T.seg_a.contacto, resp: (T.msgs || []).some(function (m) { return /Ya sé|Anoté: seguimiento a Fernando/.test(m.t || "") || (m.prog && m.prog.contacto === "Fernando Fuentes BBVA"); }) }; });
    eq("Un solo dictado: el cerebro (con las preguntas de contexto) reparte la respuesta", r3c.reparto, true);
    eq("Se libera la pantalla, no quedan preguntas de persona y en el bloque se quedan SOLO las que no contestó", [r3c.overlay, r3c.dudas, r3c.dbg], [false, 0, ["¿La fecha de finiquito (o si es indefinida)?", "¿Un poco más de contexto?"]]);
    eq("Lo contestado se manda junto al cerebro", r3c.prompt, true);
    eq("Queda programado el seguimiento a Fernando Fuentes BBVA (2 WhatsApp) y refrescado", [r3c.wa.length >= 2, r3c.wa[0] && r3c.wa[0][0], r3c.seg, r3c.tarjeta, r3c.resp], [true, "Fernando Fuentes BBVA", "Fernando Fuentes BBVA", true, true]);

    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? "FALLAS:\n" + malas.join("\n") : "todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
