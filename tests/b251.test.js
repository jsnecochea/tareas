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
eq("versión >= 251", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 251, true);
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
      /* espera a que completaRevision TERMINE: sin "leyendo", sin palomeo en curso y la tarea quieta 400 ms; nunca más que el tope de antes */
      window.listoRev = async function (T, tope) { var t0 = Date.now(), ult = null, quieta = 0; await espera(60);
        while (Date.now() - t0 < tope) { var v = (typeof tareas !== "undefined" && tareas.filter(function (x) { return x && x.id === T.id; })[0]) || T, s = "";
          try { s = JSON.stringify(v); } catch (e) { s = String(Date.now()); }
          var libre = !v._leyendo && !T._leyendo && !((window.__palomeo || {})[T.id]);
          if (libre && s === ult) { quieta += 40; if (quieta >= 400) return; } else quieta = 0;
          ult = s; await espera(40); } };
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

    /* 1) modos: todo el cerebro va en "pesado" */
    var src = html;
    eq("MODO_CEREBRO = pesado", /var MODO_CEREBRO="pesado"/.test(src), true);
    var usos = function (nombre) { var i = src.indexOf("function " + nombre); var j = src.indexOf("\nfunction ", i + 10); var cuerpo = src.slice(i, j); return [/preguntaAClaude\(\[\{role:"user"[^\n]*?MODO_CEREBRO/.test(cuerpo), /"rapido"/.test(cuerpo)]; };
    /* build 283 (Salvador aprobó app-fix-dictado.md): dictados e indicaciones (completaRevision fuera de «Falta info») y la nota a Claude van en "rapido" */
    eq("build 283: completaRevision y nota a Claude en rapido; agregaContexto / barraEnviar / entrevista siguen en pesado", ["completaRevision", "ejecutaNotaClaude", "agregaContexto", "barraEnviar", "contestaEntrevista"].map(usos), [[false, true], [false, true], [true, false], [true, false], [true, false]]);
    var rmod = await p.evaluate(async function () { window.fetch = function () { return Promise.resolve({ ok: true, json: function () { return Promise.resolve({ model: "claude-sonnet-5-5", content: [{ text: "{}" }] }); } }); };
      APP_TOKEN = "tok"; var out = null; preguntaAClaude([{ role: "user", content: "x" }], "pesado", function () { out = Object.assign({}, window.__MODELO_CLAUDE); }); await espera(80); return out; });
    eq("la app anota el modelo que dice el servidor (campo model) por modo", rmod, { pesado: "claude-sonnet-5-5" });
    var r1 = await p.evaluate(async function () { var modos = []; preguntaAClaude = function (m, modo, cb) { modos.push(modo); setTimeout(function () { cb(JSON.stringify({ tipo: "tarea", fecha: null, ordenes: [{ tipo: "claude", que: "revisar el contrato", fecha: "2026-10-07" }], recordar: [], vinculos: [], dudas: [] })); }, 5); };
      var T = { id: "tM", nombre: "Contrato", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-12", f_original: "2026-10-12", fecha_dictada: true, contexto: "Contrato de arrendamiento de la bodega con el propietario, pendiente de firma.", msgs: [] };
      abre(T); completaRevision(T, "revisa el contrato de la bodega y dime qué cláusulas me conviene cambiar", { sinRevision: true }); await espera(300); return modos; });
    eq("build 283: completaRevision (indicación, fuera de Falta info) pide con 'rapido'", r1, ["rapido"]);

    /* 2) nada se atora: vacío -> reintento UNA vez con prompt reforzado -> pregunta concreta */
    var PEND = function () { return { id: "tP", nombre: "Bodega", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-12", f_original: "2026-10-12", fecha_dictada: true, contexto: "Bodega nueva de Gruponec en el parque industrial; falta definir quién la limpia antes de mudarse.",
      msgs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (i) { return { k: i % 2 ? "bo" : "bi", t: "mensaje número " + i + " de la bodega", ts: Date.now() - (13 - i) * 60000, h: "06:" + (10 + i) }; }) }; };
    await p.evaluate(function (f) { window.PEND = eval("(" + f + ")"); }, PEND.toString());
    var r2 = await p.evaluate(async function () { var prompts = [], modos = [], n = 0; preguntaAClaude = function (m, modo, cb) { prompts.push(m[0].content); modos.push(modo); n++; setTimeout(function () { cb(JSON.stringify({ tipo: "tarea", fecha: null, ordenes: n === 1 ? [] : [{ tipo: "claude", que: "revisar quién limpia la bodega", fecha: "2026-10-09" }], recordar: [], vinculos: [], dudas: [] })); }, 5); };
      var T = PEND(); abre(T); completaRevision(T, "ahí lo que sea con la bodega, tú sabes, hazlo", { sinRevision: true }); await espera(700);
      var V = tareas[0], H = V.hecho238 || {};
      return { llamadas: n, modos: modos, refuerzo: /REINTENTO/.test(prompts[1] || "") && !/REINTENTO/.test(prompts[0]), ctx: /Bodega nueva de Gruponec en el parque industrial/.test(prompts[1] || ""), ultimos: (prompts[1] || "").indexOf("mensaje número 12 de la bodega") > 0 && (prompts[1] || "").indexOf("mensaje número 2 de la bodega") < 0, hecho: H.hecho || [], falta: (H.falta || []).length, modal: !!document.getElementById("preg249"), dimelo: (V.msgs || []).some(function (m) { return /dímelo otra vez/i.test(m.t || ""); }) }; });
    /* build 283: ya no hay reintento en serie: UNA llamada en rápido; lo que no dejó nada queda de encargo para la Mac, sin tarjeta ni «dímelo otra vez» */
    eq("build 283: UNA sola llamada en 'rapido' (sin reintento reforzado)", [r2.llamadas, r2.modos, r2.refuerzo], [1, ["rapido"], false]);
    eq("build 283: sin resultado no hay 'dímelo otra vez' ni tarjeta", [r2.falta, r2.modal, r2.dimelo], [0, false, false]);
    var r3 = await p.evaluate(async function () { var n = 0; preguntaAClaude = function (m, modo, cb) { n++; setTimeout(function () { cb(JSON.stringify({ tipo: "tarea", fecha: null, ordenes: [], recordar: [], vinculos: [], dudas: [], pregunta: null })); }, 5); };
      var T = PEND(); abre(T); completaRevision(T, "ahí lo que sea con la bodega, tú sabes, hazlo", { sinRevision: true }); await listoRev(T, 2800);
      var V = tareas[0], H = V.hecho238 || {}, m = document.getElementById("preg249");
      var E = (V.encargos || []).filter(function (e) { return e && e.origen === "app283"; });
      return { llamadas: n, falta: (H.falta || []).map(function (f) { return f.q; }), modal: !!m, enc: E.map(function (e) { return [e.tipo, e.estado, e.motivo, e.t]; }), paso: (V.msgs || []).some(function (x) { return x.k === "bi" && /lo paso a Claude/.test(x.t || ""); }), dimelo: (V.msgs || []).some(function (x) { return /d[ií]melo otra vez|No pesqu/i.test(x.t || ""); }) }; });
    eq("build 283: sigue sin quedar claro -> 1 llamada, sin tarjeta; queda de encargo (orden pendiente) y el texto dice que lo pasa a Claude", [r3.llamadas, r3.modal, r3.enc, r3.paso], [1, false, [["orden", "pendiente", "sin_resultado", "ahí lo que sea con la bodega, tú sabes, hazlo"]], true]);
    eq("Nunca más 'Dímelo otra vez' sin pregunta", r3.dimelo, false);
    await foto("b251-1-pregunta-concreta.png");
    /* build 283: ya no sale la pregunta concreta del 251 (la orden la termina la Mac); el encargo queda una sola vez */
    var r3b = await p.evaluate(function () { var V = tareas[0]; return (V.encargos || []).filter(function (e) { return e && e.origen === "app283"; }).length; });
    eq("build 283: un solo encargo por orden (no se duplica)", r3b, 1);
    var r3c = await p.evaluate(async function () { var n = 0; preguntaAClaude = function (m, modo, cb) { n++; setTimeout(function () { cb(JSON.stringify({ tipo: "tarea", fecha: null, ordenes: [{ tipo: "volar_a_la_luna", que: "x" }], recordar: [], vinculos: [], dudas: [] })); }, 5); };
      var T = PEND(); abre(T); completaRevision(T, "dile a Pedro que me confirme la hora de la entrega de la bodega", { sinRevision: true }); await listoRev(T, 2800);
      var H = tareas[0].hecho238 || {}; return { n: n, falta: (H.falta || []).map(function (f) { return f.q; }), modal: !!document.getElementById("preg249"), enc: (tareas[0].encargos || []).filter(function (e) { return e && e.origen === "app283"; }).length }; });
    eq("build 283: acción imposible -> 1 llamada, sin tarjeta, queda de encargo para la Mac", [r3c.n, r3c.modal, r3c.falta, r3c.enc], [1, false, [], 1]);
    await p.evaluate(function () { var m = document.getElementById("preg249"); if (m) m.remove(); });
    var r3d = await p.evaluate(async function () { var n = 0; preguntaAClaude = function (m, modo, cb) { n++; setTimeout(function () { cb(JSON.stringify({ tipo: "tarea", ordenes: [], recordar: [], vinculos: [], dudas: [] })); }, 5); };
      var T = PEND(); abre(T); completaRevision(T, "ok", { sinRevision: true }); await espera(500); return n; });
    eq("Un 'ok' suelto no dispara reintentos ni preguntas", r3d, 1);

    /* 3) contactos dudosos en TODA orden que manda un mensaje: tarjeta al instante, nada se manda hasta elegir */
    await p.evaluate(function () { window.OTRA = function () { return { id: "tK2", nombre: "Pádel", duenio: "salvador", estado: "abierta", wa_contactos: [{ nombre: "Karina GP", desde: 1 }], msgs: [] }; };
      window.TKT = function () { return { id: "tKT", nombre: "Cena", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-08", f_original: "2026-10-08", fecha_dictada: true, contexto: "Cena del jueves con los amigos, hay que confirmar quiénes van.", wa_contactos: [{ nombre: "Karina Gomez", desde: 1 }], msgs: [] }; }; });
    var r4 = await p.evaluate(async function () { __WA.length = 0; var T = TKT(); abre(T, [OTRA()]);
      preguntaAClaude = function (m, modo, cb) { setTimeout(function () { cb(JSON.stringify({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], dudas: [], ordenes: [{ tipo: "mensaje", a: "Karina", canal: "whatsapp", texto: "¿Puedes cenar el jueves?" }] })); }, 5); };
      completaRevision(T, "mándale un mensaje a Karina para preguntarle si puede cenar el jueves con todos los amigos", { sinRevision: true }); await listoRev(T, 2800);
      var m = document.getElementById("preg249"), H = tareas[0].hecho238 || {};
      return { wa: __WA.length, modal: !!m, filas: m ? [].map.call(m.querySelectorAll(".pq255l li"), function (x) { return x.firstChild.textContent; }) : [], ops: m ? (m.querySelector(".pq255l small") || { textContent: "" }).textContent.replace(/[()]/g, "").split(" · ").filter(Boolean).sort() : [], falta: (H.falta || []).map(function (f) { return f.k; }) }; });
    eq("Mensaje simple: 'Karina' coincide con varias -> sale la tarjeta al momento y NO se manda nada", [r4.wa, r4.modal, r4.falta, r4.ops], [0, true, ["msg"], ["Karina GP", "Karina Gomez"]]);
    await foto("b251-2-cual-karina-mensaje.png");
    var r4b = await p.evaluate(async function () { modelo2({ respuestas: [{ n: 1, r: "Karina Gomez" }] }, {}, 5); dicta255("Karina Gomez"); await espera(600);
      return { wa: __WA.map(function (w) { return [w.contacto, /^IA: Karina, de parte de Salvador: ¿Puedes cenar el jueves\?/.test(w.texto)]; }), modal: !!document.getElementById("preg249") }; });
    eq("Al elegir, el mensaje sale al contacto exacto", [r4b.wa, r4b.modal], [[["Karina Gomez", true]], false]);
    /* ninguno: tampoco se manda; el campo autocompleta */
    var r5 = await p.evaluate(async function () { __WA.length = 0; var T = TKT(); abre(T, [OTRA()]);
      preguntaAClaude = function (m, modo, cb) { setTimeout(function () { cb(JSON.stringify({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], dudas: [], ordenes: [{ tipo: "mensaje", a: "Zacarías", canal: "whatsapp", texto: "¿Tienes la cotización?" }] })); }, 5); };
      completaRevision(T, "pídele a Zacarías la cotización de las sillas para la cena del jueves por favor", { sinRevision: true }); await listoRev(T, 2800);
      var m = document.getElementById("preg249"); return { wa: __WA.length, modal: !!m, campo: true, filas: m ? [].map.call(m.querySelectorAll(".pq255l li"), function (x) { return x.firstChild.textContent; }) : [] }; });
    eq("Sin coincidencia: tarjeta al instante con autocompletar y no se manda nada", [r5.wa, r5.modal, r5.campo, /No encontré a Zacarías/.test(r5.filas[0] || "")], [0, true, true, true]);
    /* seguimiento programado y "pídele algo" (pideMensaje) */
    var r6 = await p.evaluate(async function () { __WA.length = 0; var T = TKT(); abre(T, [OTRA()]);
      preguntaAClaude = function (m, modo, cb) { setTimeout(function () { cb(JSON.stringify({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], dudas: [], ordenes: [], seguimiento_a: { quien: "Karina", meta: "confirmar la cena", cada: "hoy", fechas: ["2026-10-07"], hora: "10:00", texto: "IA: Hola Karina, ¿confirmas la cena?" } })); }, 5); };
      completaRevision(T, "dale seguimiento a Karina hoy y mañana a las 10:00 para que confirme la cena del jueves con todos", { sinRevision: true }); await listoRev(T, 2800);
      var m = document.getElementById("preg249"), V = tareas[0]; return { prog: (V.msgs || []).filter(function (x) { return x.prog; }).length, modal: !!m, dudas: (V.quien_dudas || []).length, fila: m ? (m.querySelector(".pq255l li") || { firstChild: {} }).firstChild.textContent : "" }; });
    eq("Seguimiento programado a 'Karina' dudosa: tarjeta al instante y nada programado", [r6.prog, r6.modal, r6.dudas, r6.fila], [0, true, 1, "¿Quién es Karina?"]);
    var r7 = await p.evaluate(async function () { var T = TKT(); abre(T, [OTRA()]); pideMensaje(T, "mándale un mensaje a Karina para ver si puede cenar", { quien: "Karina", cuerpo: "para ver si puede cenar", pregunta: false }); await espera(400);
      var m = document.getElementById("preg249"); return { modal: !!m, borrador: !!tareas[0].msj_borrador }; });
    eq("Mensaje suelto ('mándale un mensaje a Karina…'): también sale la tarjeta y no hay borrador", [r7.modal, r7.borrador], [true, false]);
    /* nombre exacto de WhatsApp */
    var r8 = await p.evaluate(function () { var T = { id: "tMP", nombre: "Mantenimiento", msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: hola", ts: 1 }] }; tareas = [T]; window.AGENDA_WA = null;
      var a = nombreWA("Manuel Parra (Meny Parra)"), b = nombreWA("Manuel Parra"), c = nombreWA("Josue (ing Gruponec) Hernandez"), d = nombreWA("Ana Lopez (Anita)");
      window.AGENDA_WA = [{ nombre: "Rogelio Sada (Roger)" }]; var e = nombreWA("Rogelio Sada (Roger)"); window.AGENDA_WA = null; return [a, b, c, d, e]; });
    eq("Nombre exacto: el alias entre paréntesis no viaja a la Mac; si así se llama en la agenda, se respeta", r8, ["Manuel Parra", "Manuel Parra", "Josue (ing Gruponec) Hernandez", "Ana Lopez", "Rogelio Sada (Roger)"]);
    var r9 = await p.evaluate(async function () { __WA.length = 0; var T = { id: "tMX", nombre: "Mantenimiento Lerdo", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-12", f_original: "2026-10-12", fecha_dictada: true, contexto: "Mantenimiento de la casa de Lerdo con el maestro de obra, revisiones semanales.", wa_contactos: [{ nombre: "Manuel Parra (Meny Parra)", desde: 1 }], msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: ya terminé", ts: 1 }] }; abre(T);
      preguntaAClaude = function (m, modo, cb) { setTimeout(function () { cb(JSON.stringify({ tipo: "tarea", fecha: null, recordar: [], vinculos: [], dudas: [], ordenes: [{ tipo: "mensaje", a: "Manuel Parra (Meny Parra)", canal: "whatsapp", texto: "¿A qué hora vienes mañana?" }] })); }, 5); };
      completaRevision(T, "pídele a Manuel Parra que me diga a qué hora viene mañana a revisar el portón de la casa", { sinRevision: true }); await espera(600);
      return __WA.map(function (w) { return w.contacto; }); });
    eq("El WhatsApp sale con el nombre exacto 'Manuel Parra' (no 'Manuel Parra (Meny Parra)')", r9, ["Manuel Parra"]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? "FALLAS:\n" + malas.join("\n") : "todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
