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
eq("versión >= 252", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 252, true);
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

    /* 1) modos: todo el cerebro va en "pesado" */
    var src = html;
    eq("MODO_CEREBRO = pesado", /var MODO_CEREBRO="pesado"/.test(src), true);
    var usos = function (nombre) { var i = src.indexOf("function " + nombre); var j = src.indexOf("\nfunction ", i + 10); var cuerpo = src.slice(i, j); return [/preguntaAClaude\(\[\{role:"user"[^\n]*?MODO_CEREBRO/.test(cuerpo), /"rapido"/.test(cuerpo)]; };
    eq("build 283: completaRevision y nota a Claude en rapido; agregaContexto / barraEnviar / entrevista siguen en pesado", ["completaRevision", "ejecutaNotaClaude", "agregaContexto", "barraEnviar", "contestaEntrevista"].map(usos), [[false, true], [false, true], [true, false], [true, false], [true, false]]);
    /* espía del focus: ¿ocurrió DENTRO del toque? (iOS solo abre el teclado así) */
    await p.evaluate(function () { window.__FOC = []; var _f = HTMLElement.prototype.focus; document.addEventListener("click", function () { window.__inClick = true; setTimeout(function () { window.__inClick = false; }, 0); }, true);
      HTMLElement.prototype.focus = function () { window.__FOC.push([this.id || this.className || this.tagName, !!window.__inClick]); return _f.apply(this, arguments); }; });
    var CLK = async function (sel) { await p.click(sel); await p.waitForTimeout(80); };
    var r1 = await p.evaluate(async function () { var T = ORIGEN(); abre(T); __FOC.length = 0; abreMover225(T, 0); return 1; });
    await CLK("[data-movnueva]");
    var f1 = await p.evaluate(function () { return { foc: __FOC.filter(function (f) { return f[0] === "nom249i"; }), act: document.activeElement && document.activeElement.id, mic: !!document.querySelector("#nom249 [data-mic252]") }; });
    eq("Nueva (Mover): el focus del campo ocurre DENTRO del toque y el campo queda activo", [f1.foc, f1.act], [[["nom249i", true]], "nom249i"]);
    eq("La ventanita lleva su micrófono", f1.mic, true);
    /* micrófono propio: dicta AL CAMPO, no cierra la ventanita, no toca la caja principal */
    await p.evaluate(function () { window.__SRS = []; window.SpeechRecognition = window.webkitSpeechRecognition = function () { var o = this; o.start = function () { __SRS.push(o); o.on = true; }; o.stop = function () { o.on = false; if (o.onend) o.onend(); }; o.abort = o.stop; }; document.getElementById("nom249i").value = ""; document.getElementById("txt").value = "borrador de la caja principal"; });
    await CLK("#nom249 [data-mic252]");
    var f2 = await p.evaluate(function () { var s = __SRS[0]; s.onresult({ results: [Object.assign([{ transcript: "Cena con los amigos" }], { isFinal: false })] }); return { hay: !!document.getElementById("nom249"), on: document.querySelector("#nom249 [data-mic252]").classList.contains("on"), campo: document.getElementById("nom249i").value, caja: document.getElementById("txt").value, oyendo: !!window.__oyendo, dictadoMain: !!document.querySelector("#dictado, .dictado") }; });
    eq("Micrófono de la ventanita: escribe en el campo, no cierra la ventanita y la caja principal queda igual", [f2.hay, f2.on, f2.campo, f2.caja, f2.oyendo], [true, true, "Cena con los amigos", "borrador de la caja principal", false]);
    await foto("b252-1-nombre-con-mic.png");
    var f3 = await p.evaluate(function () { var s = __SRS[0]; s.onresult({ results: [Object.assign([{ transcript: "Cena con los amigos del jueves" }], { isFinal: true })] }); return document.getElementById("nom249i").value; });
    eq("Sigue dictando sobre el mismo campo", f3, "Cena con los amigos del jueves");
    await CLK("#nom249 [data-mic252]");
    var f4 = await p.evaluate(function () { return { on: document.querySelector("#nom249 [data-mic252]").classList.contains("on"), hay: !!document.getElementById("nom249") }; });
    eq("Tocar otra vez el micrófono lo apaga y la ventanita sigue", f4, { on: false, hay: true });
    await CLK('[data-nom249="x"]');
    /* Acomodo y barra de selección: lo mismo */
    var f5 = await p.evaluate(async function () { var T = ORIGEN(); abre(T); var d = document.createElement("div"); d.id = "pruebaAc"; d.innerHTML = botones247(1); document.body.appendChild(d); bindAcomodo(d, function () { return T; }); __FOC.length = 0; return 1; });
    await CLK("#pruebaAc [data-acnueva]");
    var f6 = await p.evaluate(function () { var o = { foc: __FOC.filter(function (f) { return f[0] === "nom249i"; }), act: document.activeElement && document.activeElement.id }; var n = document.getElementById("nom249"); if (n) n.remove(); var d = document.getElementById("pruebaAc"); if (d) d.remove(); return o; });
    eq("Acomodo > Nueva: focus dentro del toque", [f6.foc, f6.act], [[["nom249i", true]], "nom249i"]);
    var f7 = await p.evaluate(function () { var T = ORIGEN(); abre(T); window.__sel245 = { tid: T.id, set: { 0: 1 } }; pintaSel245(); __FOC.length = 0; return 1; });
    await CLK('[data-sel245="nueva"]');
    var f8 = await p.evaluate(function () { var o = { foc: __FOC.filter(function (f) { return f[0] === "nom249i"; }), act: document.activeElement && document.activeElement.id }; var n = document.getElementById("nom249"); if (n) n.remove(); window.__sel245 = null; pintaSel245(); return o; });
    eq("Barra de selección > Nueva: focus dentro del toque", [f8.foc, f8.act], [[["nom249i", true]], "nom249i"]);
    /* bloque de preguntas (build 255): abierto por el cerebro (sin toque) no roba el focus y no trae campos por renglón */
    var f9 = await p.evaluate(async function () { var T = { id: "tFIDE", nombre: "Fideicomiso: Seguimiento", duenio: "salvador", creada_por: "ia_revisor", origen: "wa_revisor", por_autorizar: true, estado: "abierta", tipo_item: "tarea", pendiente_info: "x", pendiente_tipo: "dato", falta_fecha: true, contexto: "Seguimiento con BBVA.", wa_contactos: [], msgs: [],
        quien_dudas: [{ id: "q1", dicho: "Fernando", rol: "mensaje", cands: [], extra: {}, ts: 1 }], hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿Para qué día?", ops: [] }] } };
      var O = { id: "tO1", nombre: "Blue Cup", duenio: "salvador", estado: "abierta", wa_contactos: [{ nombre: "Fernando Fuentes BBVA", desde: 1 }, { nombre: "Fernando Ruiz BBVA", desde: 1 }], msgs: [] };
      abre(T, [O]); var m0 = document.getElementById("preg249"); if (m0) m0.remove(); __FOC.length = 0; abrePreguntas249("tFIDE"); var sinGesto = __FOC.filter(function (f) { return /qi/.test(f[0]); }).length;
      return { sinGesto: sinGesto, hay: !!document.getElementById("preg249"), campos: document.querySelectorAll("#preg249 input").length }; });
    eq("Bloque de preguntas abierto por el cerebro (sin toque): no roba el focus y no trae un campo por pregunta", [f9.sinGesto, f9.hay, f9.campos], [0, true, 0]);
    await p.evaluate(function () { var m = document.getElementById("preg249"); if (m) m.remove(); });
    /* Editar mensaje */
    var f12 = await p.evaluate(async function () { var T = { id: "tED", nombre: "Mensajes", duenio: "salvador", estado: "abierta", msgs: [{ k: "bo", t: "Hola", ts: Date.now() - 1000, h: "07:00", de: "salvador" }] }; abre(T); __FOC.length = 0; abreDetalle242(T, 0); return 1; });
    await CLK('[data-d247="edit"]');
    var f13 = await p.evaluate(function () { return { foc: __FOC.filter(function (f) { return f[0] === "ed247t"; }), act: document.activeElement && document.activeElement.id, mic: !!document.querySelector("#det242 [data-mic252]") }; });
    eq("Editar mensaje: focus dentro del toque y micrófono propio", [f13.foc, f13.act, f13.mic], [[["ed247t", true]], "ed247t", true]);
    await p.evaluate(function () { var d = document.getElementById("det242"); if (d) d.remove(); });

    /* ===== 2) Ver toda la plática con <persona> ===== */
    await p.evaluate(function () { var N = Date.now(), H = 3600000, D = 24 * H;
      var base = function (o) { return Object.assign({ duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, f_vigente: "2026-10-20", f_original: "2026-10-20", fecha_dictada: true, contexto: "x" }, o); };
      var W = function (txt, ts, extra) { return Object.assign({ k: "bi", wa_in: 1, wa_c: "Cynthia Contadora GrupoNec Rangel", t: "Cynthia Contadora GrupoNec Rangel: " + txt, ts: ts, h: "07:00", wa_id: "w" + ts }, extra || {}); };
      window.CY = [
        base({ id: "tTESTA", nombre: "Testamentos de los papás", contexto: "Notaría 14 y firmas de los testamentos de los papás.", msgs: [
          W("Salvador buenas tardes, me marcaron de la Notaria 14", N - 5 * D),
          W("Esto es de hace diez días", N - 10 * D),
          W("¿Puedes pasar a firmar el jueves?", N - 4 * D + H),
          { k: "bo", t: "IA: Cynthia, de parte de Salvador: sí paso el jueves", ts: N - 4 * D + 2 * H, h: "09:00", wa_auto: "Cynthia Contadora GrupoNec Rangel", canal: "ext:Cynthia Contadora GrupoNec Rangel", de: "salvador" },
          { k: "bi", t: "nota privada de Claude", ts: N - 4 * D + 3 * H, nota_claude: 1, canal: "priv:salvador", wa_c: "Cynthia Contadora GrupoNec Rangel" }] }),
        base({ id: "tFIDE2", nombre: "Fideicomiso BBVA", msgs: [
          W("Ya hablé con el notario del fideicomiso", N - 3 * D),
          W("jaja ok gracias", N - 3 * D + H, { oculto: true, oculto_ts: N, oculto_motivo: "platica", acomodo: { ok: 0, ts: N, por: "auto" } }),
          W("Mensaje que se movió", N - 2 * D, { oculto: true, oculto_motivo: "no_es_de_aqui", acomodo: { ok: 0, ts: N } }),
          W("este lo movimos", N - 2 * D + H, { oculto: true, oculto_motivo: "mover", movido_a: { id: "tTESTA", nombre: "Testamentos" }, acomodo: { ok: 0, ts: N } })] }),
        base({ id: "tNUEVA2", nombre: "Pendiente de revisar", por_autorizar: true, creada_por: "ia_revisor", origen: "wa_revisor", pendiente_info: "¿Fecha?", pendiente_tipo: "dato", falta_fecha: true, f_vigente: undefined, msgs: [W("Último mensaje, de hoy", N - 2 * H)] }),
        base({ id: "tOTRA2", nombre: "Otra persona", msgs: [{ k: "bi", wa_in: 1, wa_c: "Carlos Ibarra", t: "Carlos Ibarra: no es de Cynthia", ts: N - 3 * D, h: "08:00", wa_id: "wc1" }] })];
      window.NN = N; });
    var g1 = await p.evaluate(function () { tareas = CY.map(function (t) { return JSON.parse(JSON.stringify(t)); }); abierta = "tTESTA"; vista = "hilo"; render();
      var it = platicaDe252("Cynthia Contadora GrupoNec Rangel", 7); return it.map(function (i) { return [i.txt.slice(0, 20), i.tag, i.kind]; }); });
    eq("Plática: últimos 7 días, de TODAS las tareas, en orden de hora, con ocultos y 'no guardado' marcados; sin notas de Claude, sin otros contactos, sin lo de hace 10 días y el movido sale una vez (en su destino)", g1,
      [["Salvador buenas tard", "Testamentos de los papás", "t"], ["¿Puedes pasar a firm", "Testamentos de los papás", "t"], ["IA: Cynthia, de part", "Testamentos de los papás", "t"], ["Ya hablé con el nota", "Fideicomiso BBVA", "t"], ["jaja ok gracias", "no guardado", "ng"], ["Mensaje que se movió", "no guardado", "ng"], ["Último mensaje, de h", "sin acomodar", "sa"]]);
    /* el botón en el detalle de cualquier globo de una persona */
    var g2 = await p.evaluate(function () { abreDetalle242(tareas[0], 0); var b = document.querySelector('#det242 [data-d252="plat"]'); return b ? b.textContent : ""; });
    eq("Detalle del globo: 'Ver toda la plática con Cynthia'", g2, "Ver toda la plática con Cynthia");
    await CLK('#det242 [data-d252="plat"]');
    var g3 = await p.evaluate(function () { var v = document.getElementById("plat252"); return { hay: !!v, det: !!document.getElementById("det242"), n: v ? v.querySelectorAll(".pl252").length : 0, tags: v ? [].map.call(v.querySelectorAll(".pg"), function (x) { return x.textContent; }) : [], of: v ? v.querySelectorAll(".pl252.of").length : 0, pie: v ? /bandeja del servidor aún no se consulta/.test(v.textContent) : false, cab: v ? v.querySelector(".ph b").textContent : "" }; });
    eq("La vista de la plática se abre con los 7 mensajes, las etiquetas, los escondidos atenuados y la nota de la fuente", [g3.hay, g3.det, g3.n, g3.of, g3.pie, g3.cab], [true, false, 7, 2, true, "Plática con Cynthia"]);
    eq("Etiquetas chicas de dónde quedó cada mensaje", g3.tags, ["Testamentos de los papás", "Testamentos de los papás", "Testamentos de los papás", "Fideicomiso BBVA", "no guardado", "no guardado", "sin acomodar"]);
    await foto("b252-3-plática-con-cynthia.png");
    /* tocar la etiqueta abre esa tarea en ese mensaje */
    await p.evaluate(function () { document.querySelector('#plat252 [data-plt="3"]').click(); });
    await p.waitForTimeout(200);
    var g4 = await p.evaluate(function () { return { abierta: abierta, vista: vista, plat: !!document.getElementById("plat252"), msg: !!document.querySelector('.msgs [data-mix="0"]'), flash: !!document.querySelector(".msgs .flash") }; });
    eq("Tocar la etiqueta abre esa tarea en ese mensaje", [g4.abierta, g4.vista, g4.plat, g4.msg], ["tFIDE2", "hilo", false, true]);
    /* desde la plática: tocar un mensaje abre su detalle; No guardar lo marca y la plática se repinta */
    await p.evaluate(function () { abreDetalle242(tareas[0], 0); document.querySelector('#det242 [data-d252="plat"]').click(); });
    await p.evaluate(function () { document.querySelector('#plat252 [data-plm="1"]').click(); });
    var g5 = await p.evaluate(function () { var d = document.getElementById("det242"); return { det: !!d, botones: d ? [].map.call(d.querySelectorAll(".ac226 button"), function (b) { return b.textContent; }) : [] }; });
    eq("Desde la plática: el detalle del mensaje trae Mover · Nueva · No guardar (y OK · Dato)", [g5.det, ["Mover", "No guardar", "Nueva", "Dato"].every(function (b) { return g5.botones.indexOf(b) >= 0; })], [true, true]);
    await p.evaluate(function () { document.querySelector('#det242 [data-acng]').click(); });
    await p.waitForTimeout(800);
    var g6 = await p.evaluate(function () { var v = document.getElementById("plat252"); var it = platicaDe252("Cynthia Contadora GrupoNec Rangel", 7).filter(function (i) { return /pasar a firmar/.test(i.txt); })[0];
      return { plat: !!v, det: !!document.getElementById("det242"), tag: it && it.tag, ng: v ? v.querySelectorAll(".pg.ng").length : 0 }; });
    eq("No guardar desde ahí: la plática sigue abierta, se repinta y el mensaje queda marcado 'no guardado'", [g6.plat, g6.det, g6.tag, g6.ng], [true, false, "no guardado", 3]);
    /* escondido: volver a mostrarlo */
    await p.evaluate(function () { var idx = platicaDe252("Cynthia Contadora GrupoNec Rangel", 7).findIndex(function (i) { return /pasar a firmar/.test(i.txt); }); document.querySelector('#plat252 [data-plm="' + idx + '"]').click(); });
    var g7 = await p.evaluate(function () { var b = document.querySelector('#det242 [data-d252="restaura"]'); return b ? b.textContent : ""; });
    eq("Un mensaje escondido ofrece 'Volver a mostrarlo'", /^Volver a mostrarlo en /.test(g7), true);
    await p.evaluate(function () { document.querySelector('#det242 [data-d252="restaura"]').click(); });
    await p.waitForTimeout(800);
    var g8 = await p.evaluate(function () { var it = platicaDe252("Cynthia Contadora GrupoNec Rangel", 7).filter(function (i) { return /pasar a firmar/.test(i.txt); })[0]; return [it.tag, it.oculto, !!document.getElementById("det242")]; });
    eq("Restaurado: vuelve a su tarea y su detalle ya trae Mover · Nueva · No guardar", [g8[0], g8[1], g8[2]], ["Testamentos de los Papás", false, true]);
    /* Nueva desde la plática */
    var g9 = await p.evaluate(async function () { var dst = document.getElementById("det242"); if (dst) dst.remove(); var pl = document.getElementById("plat252"); if (pl) pl.remove();
      tareas = CY.map(function (t) { return JSON.parse(JSON.stringify(t)); }); abierta = "tTESTA"; vista = "hilo"; render(); abreDetalle242(tareas[0], 0); document.querySelector('#det242 [data-d252="plat"]').click(); document.querySelector('#plat252 [data-plm="0"]').click();
      document.querySelector('#det242 [data-acnueva]').click(); await espera(60); var nom = document.getElementById("nom249i"); var hay = !!nom; if (nom){ nom.value = "Notaría 14"; document.querySelector('[data-nom249="ok"]').click(); } await espera(120);
      return { hay: hay, nueva: tareas.filter(function (t) { return t.nombre === "Notaría 14"; }).length }; });
    eq("Nueva desde la plática: pide nombre y crea la tarea", g9, { hay: true, nueva: 1 });
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + (e && e.stack || e)); }
  await b.close();
  console.log(malas.length ? "FALLAS:\n" + malas.join("\n") : "todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
