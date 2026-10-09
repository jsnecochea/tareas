#!/usr/bin/env node
/* PRUEBAS build 263: avisos una vez, siguiente en orden, Hoy solo de Salvador, espera con fecha, falta info coherente, dictado oculto, WhatsApp sin contacto basura, siguiente paso arriba. 390 px. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 263", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 263, true);
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
    /* build 285: las secciones del home amanecen plegadas; en esta prueba vieja Acomodo, Mensajes, Te pregunta Doit, Vencidas y Hoy arrancan abiertas como antes (lo que se toque se sigue recordando) */
    await p.evaluate(function () { if (typeof abre285 === "function") abre285 = function (k) { var o = _pl(); return Object.prototype.hasOwnProperty.call(o.o, k) ? !!o.o[k] : /^(aco|msg|decide|preg|venc|hoy)$/.test(k); }; });
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true;
      window.__esp = []; window.__push = []; window.__pids = [];
      db = { collection: function () { return { doc: function (k) { return { set: function (d, o) { window.__esp.push([k, d, o]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      window.llamaPush = function (a, c) { window.__push.push([a, c]); };
      window.pideWhatsApp = function (c) { window.__pids.push(c); return Promise.resolve({ id: "wa_x" }); };
      document.getElementById("app").style.display = "flex"; window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      var N = Date.now();
      window.T = function (id, nombre, ctx, extra) { var t = { id: id, nombre: nombre, duenio: "salvador", plan_seguimiento: { proximo_paso: "Dar seguimiento" }, creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-06", fecha_dictada: true, contexto: ctx || "Tarea de prueba con contexto suficiente para que no falte nada de contexto en la ficha de la tarea y se vea completa.", ritmo: "diario", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 100000, h: "07:00" }] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.home = function (L) { tareas = L; abierta = null; vista = "lista"; window.__grupoInicio = null; window.__clL263 = false; window.__ttAb = { venc: true, hoy: true }; window.__rfF263 = 0; render(); };
      window.filas = function () { var o = []; ["esperan", "venc", "hoy"].forEach(function (g) { window.__grupoInicio = g; render(); [].forEach.call(document.querySelectorAll('[data-grupo-vista="' + g + '"] .ttl .ttr:not(.ttsum)' + (g === "hoy" ? ":not(.es-vencida)" : "")), function (b) { o.push(b.querySelector(".rn").textContent); }); }); window.__grupoInicio = null; render(); return o; };
      window.sumas = function () { return [].map.call(document.querySelectorAll(".ttsum .rn"), function (b) { return b.textContent; }); };
      /* build 270: secciones siempre desplegadas del home (Te pregunta Doit · Vencidas mías · Hoy mías) */
      /* home de tres fichas: cada sección vive en su propia vista (Te esperan · Vencidas · Hoy); se abren una por una y se regresa al inicio */
      window.secs = function () { var o = {};
        [["esperan"], ["venc", "Vencidas mías"], ["hoy", "Hoy mías"]].forEach(function (x) { window.__grupoInicio = x[0]; render(); var g = document.querySelector('[data-grupo-vista="' + x[0] + '"]'); if (!g) return;
          if (x[1]) { var L = [].map.call(g.querySelectorAll(x[0] === "hoy" ? ".ttr:not(.es-vencida) .rn" : ".ttr .rn"), function (b) { return b.textContent; }); if (L.length) o[x[1]] = L; }   /* «Hoy mías» = lo de hoy; las vencidas que la ficha Hoy junta arriba las cubre inicio-filtros */
          else [].forEach.call(g.querySelectorAll(".sc284"), function (sc) { o[sc.getAttribute("aria-label")] = [].map.call(sc.querySelectorAll(".ttr .rn, .f284n"), function (b) { return b.textContent; }); }); });
        window.__grupoInicio = null; render(); return o; };
    });
    /* ===================== 1. AVISOS UNA VEZ ===================== */
    var A = await p.evaluate(async function () {
      var r = {}; delete PERSONAS.salvador.notif;
      r.defecto = notifPresetDe(notifPrefs("salvador"));
      PERSONAS.salvador.notif = { v: 1, preset: "urgente", tipos: { recordatorio: true, espera: true, falla: true, wa_todo: false }, ts: 1 }; r.migra = notifPresetDe(notifPrefs("salvador"));
      delete PERSONAS.salvador.notif; window.__memAv263 = {}; try { localStorage.removeItem("bit_avsig263"); } catch (e) {}
      var rec = T("tREC", "Mandar documentos al contador", "x", { es_recordatorio: true, f_vigente: "2026-10-07", aviso_hora: "10:55", ritmo: "" });
      tareas = [rec]; window.__push = []; sincronizaAvisos(rec); r.conDefecto = window.__push.filter(function (x) { return x[0] === "aviso_set"; }).length;
      guardaNotif(notifDePreset("todas")); r.trasPreset = window.__push.filter(function (x) { return x[0] === "aviso_set"; }).length;
      window.__push = []; window.__esp = [];
      for (var i = 0; i < 4; i++) { sincronizaAvisos(rec); guarda(rec); }
      r.repetidos = window.__push.filter(function (x) { return x[0] === "aviso_set"; }).length;
      r.espejo = window.__esp.filter(function (e) { return e[1] && e[1].deep; }).map(function (e) { return [("avisado_en" in e[1]), !!(e[2] && e[2].merge)]; });
      rec.aviso_hora = "11:30"; sincronizaAvisos(rec); r.cambio = window.__push.filter(function (x) { return x[0] === "aviso_set"; }).map(function (x) { return [x[1].cuando, x[1].tipo, x[1].repite_max]; });
      /* de Claude */
      var tes = T("tTES", "Testamentos", "Testamentos de los papás con Cynthia.", { encargos: [{ id: "e1", estado: "pendiente", t: "revisar" }], f_vigente: "2026-10-20" });
      var rv = T("tRV", "Revisar si Cynthia ya mandó los testamentos", "x", { es_recordatorio: true, f_vigente: "2026-10-07", aviso_hora: "10:55", ritmo: "" });
      var av = T("tAV", "Mantenimiento y Mejoras Cumbres", "x", { encargos: [{ id: "e2", estado: "pendiente" }], f_vigente: "2026-10-20", avisos: [{ ts: 11, texto: "Recordatorio · Se va ejecutar para el 20 de octubre. y de revisar avances y ver que el ritmo no afloje", fecha: "2026-10-07", hora: "10:55", dicho: "", avisado_en: null }] });
      tareas = [tes, rv, av, rec]; window.__push = [];
      sincronizaAvisos(rv); sincronizaAvisos(av);
      r.deClaude = window.__push.filter(function (x) { return x[0] === "aviso_set"; }).length;
      /* con el atajo «Nada» no se manda ni uno */
      guardaNotif(notifDePreset("ninguna")); window.__push = []; window.__memAv263 = {}; rec.aviso_hora = "12:30"; sincronizaAvisos(rec);
      r.conRespuesta = window.__push.filter(function (x) { return x[0] === "aviso_set"; }).length;
      r.permite = [notifPermite("salvador", "recordatorio"), notifPermite("salvador", "te_necesito")];
      return r; });
    eq("Salvador: el defecto del tablero es 'Solo lo esencial'", A.defecto, "esencial");
    eq("Lo guardado con el formato de una columna pasa al defecto (Solo lo esencial)", A.migra, "esencial");
    eq("Con ese defecto el recordatorio SÍ se manda (es de lo esencial), una vez", A.conDefecto, 1);
    eq("Al cambiar de preset no se duplica el aviso (una vez)", A.trasPreset, 2);
    eq("Guardar la tarea 4 veces NO vuelve a mandar el aviso (antes: re-disparo en cada barrido)", A.repetidos, 0);
    eq("El espejo se escribe con merge y NO pisa avisado_en en cada guardado (solo la primera vez o si cambia)", [A.espejo.length > 1, A.espejo.slice(1).every(function (x) { return x[0] === false && x[1] === true; })], [true, true]);
    eq("Si cambia la hora sí se manda otra vez, tipo recordatorio y repite_max 1", A.cambio, [["2026-10-07 11:30:00", "recordatorio", 1]]);
    eq("Los de 'revisar avance' y 'revisar si Cynthia…' de lo que lleva Claude no se mandan a Salvador", A.deClaude, 0);
    eq("Con el atajo «Nada» el recordatorio ya no pasa para Salvador", [A.conRespuesta, A.permite], [0, [false, false]]);

    /* ===================== 2. SIGUIENTE EN ORDEN ===================== */
    var B = await p.evaluate(async function () {
      var ps = T("tPRO", "Propuesta de IA", "x", { creada_por: "ia_revisor", tipo_elegido: false, autorizada: false, f_vigente: "" });
      var L = [T("tV1", "Vencida uno", "", { f_vigente: "2026-10-01" }), T("tV2", "Vencida dos", "", { f_vigente: "2026-10-02" }), T("tV3", "Vencida tres", "", { f_vigente: "2026-10-03" }),
        T("tH1", "Hoy uno", "", { f_vigente: "2026-10-06" }), T("tH2", "Hoy dos", "", { f_vigente: "2026-10-06" }), ps];
      home(L); var ord = (window.ordenSwipe || []).slice(); var r = { ord: ord };
      var pasos = [];
      for (var i = 0; i < 4; i++) { var cur = abierta || ord[0]; if (!abierta) { abierta = "tV1"; vista = "hilo"; render(); cur = "tV1"; }
        var t = tareas.filter(function (x) { return x.id === cur; })[0]; t.cierre = { tipo: "hecha", f: "2026-10-06" }; t.estado = "cerrada";
        selloYSigue(t, { tipo: "hecha", texto: t.nombre, restaurar: null, sinDeshacer: true }); await espera(800); pasos.push([cur, abierta, vista]); }
      r.pasos = pasos;
      /* en reversa */
      tareas.forEach(function (x) { if (x.id !== "tPRO") { delete x.cierre; x.estado = "abierta"; } }); home(tareas); abierta = "tH1"; vista = "hilo"; render(); swipeATarea(-1); r.atras = abierta; swipeATarea(-1); r.atras2 = abierta;
      r.sinPropuesta = (window.ordenSwipe || []).indexOf("tPRO");
      return r; });
    eq("El orden del home: vencidas y luego hoy, sin la propuesta de Acomodo", [B.ord.indexOf("tV1") < B.ord.indexOf("tV2"), B.ord.indexOf("tV3") < B.ord.indexOf("tH1"), B.sinPropuesta], [true, true, -1]);
    eq("'Ya está' en una vencida lleva a la siguiente vencida; al acabarse, a Hoy; al acabarse todo, al inicio", B.pasos, [["tV1", "tV2", "hilo"], ["tV2", "tV3", "hilo"], ["tV3", "tH1", "hilo"], ["tH1", "tH2", "hilo"]]);
    eq("En reversa va con el mismo orden (de Hoy a la última vencida)", [B.atras, B.atras2], ["tV3", "tV2"]);

    /* ===================== 3. PARA HOY SOLO LO DE SALVADOR ===================== */
    var C = await p.evaluate(async function () {
      var L = [T("tTES", "Testamentos", "", { encargos: [{ id: "e", estado: "pendiente" }] }),
        T("tCEN", "Cena Jueves Amigos", "", { resumen: { que_toca: "Definir lugar y hora de la cena", pendientes: [{ t: "Definir lugar y hora de la cena", de: "Eduardo", nota: "él invita" }] } }),
        T("tCOM", "Comedor Nuevo", "", { seg_a: { contacto: "Manuel Parra", cada: "diario" } }),
        T("tTRE", "Trend Rating", "", { encargos: [{ id: "e", estado: "pendiente" }] }),
        T("tINV", "Inversiones BBVA", "", { resumen: { pendientes: [{ t: "Esperar el estado de cuenta", de: "Cynthia" }] } }),
        T("tMAN", "Mantenimiento y Mejoras Cumbres", "", { encargos: [{ id: "e", estado: "pendiente" }] }),
        T("tDEC", "Decoración Navideña", "", { resumen: { que_toca: "Esperando respuesta de Pato" } }),
        T("tBAR", "Proyecto Bardas Cumbres", "", { resumen: { pendientes: [{ t: "Llamar a José Mijares", de: "Salvador" }] } }),
        T("tFIE", "Fiesta Navideña", "", { resumen: { que_toca: "Definir fecha y forma de la fiesta" } }),
        T("tNEC", "Pregunta de Claude", "", { hecho238: { ts: 1, hecho: [], falta: [{ k: "txt", q: "¿A qué hora?", ops: [] }] } })];
      home(L); var r = { suma: sumas(), filas: filas(), secs: secs() };
      r.plegada = !document.querySelector(".cll263 .revl"); r.cabecera = (document.querySelector('.fila-inicio[data-grupo="claude"]') || {}).innerText || "";
      document.querySelector('.fila-inicio[data-grupo="claude"]').click(); await espera(50); r.abierta = [].map.call(document.querySelectorAll('[data-grupo-vista="claude"] .ttr'), function (b) { return b.innerText.replace(/\s+/g, " "); });
      r.pelotas = L.map(function (t) { var q = pelota263(t); return [t.id, q.de, q.esperaA]; });
      return r; });
    eq("Build 270: 'Hoy mías' solo lo de Salvador (Bardas, Fiesta); la pregunta de Claude va en 'Te pregunta Doit'", [C.secs["Hoy mías"], C.secs["Te pregunta Doit"]], [["Proyecto Bardas Cumbres", "Fiesta Navideña"], ["Pregunta de Claude"]]);
    eq("Las lleva Claude (7): en el inicio solo su renglón con el número", [C.plegada, C.cabecera.replace(/\s+/g, " ").trim()], [true, "Las lleva Claude 7"]   /* build 285: el chevron es un SVG que gira (ya no es texto) */);
    var rowOf = function (n) { return C.abierta.filter(function (x) { return x.indexOf(n) === 0; })[0] || ""; };
    eq("Al abrirla: Cena Jueves Amigos con su 'qué toca' y quién tiene la pelota", /Qué toca: Definir lugar y hora de la cena/.test(rowOf("Cena Jueves Amigos")) && /espera a Eduardo/.test(rowOf("Cena Jueves Amigos")), true);
    eq("Decoración Navideña: 'espera a Pato'; Inversiones: 'espera a Cynthia'", [/espera a Pato/.test(rowOf("Decoración Navideña")), /espera a Cynthia/.test(rowOf("Inversiones BBVA"))], [true, true]);
    eq("Las siete de Claude: Testamentos, Cena, Comedor, Trend Rating, Inversiones, Mantenimiento y Decoración", C.pelotas.filter(function (x) { return x[1] === "claude"; }).map(function (x) { return x[0]; }), ["tTES", "tCEN", "tCOM", "tTRE", "tINV", "tMAN", "tDEC"]);
    eq("Las de Salvador: Bardas (él llama a José Mijares), Fiesta (él define) y la pregunta te_necesito", C.pelotas.filter(function (x) { return x[1] === "yo"; }).map(function (x) { return x[0]; }), ["tBAR", "tFIE", "tNEC"]);
    await foto("b263-3-claude-las-lleva.png");

    /* ===================== 4. VENCIDA QUE NO ES SUYA ===================== */
    var D = await p.evaluate(async function () {
      var L = [T("tVES", "Vestidores Carpintería", "", { f_vigente: "2026-10-05", resumen: { pendientes: [{ t: "Manuel ya tiene cita con el carpintero", de: "Manuel", fecha: "2026-10-07" }, { t: "Presupuesto del carpintero", de: "Manuel", fecha: "2026-10-10" }, { t: "Muestra pintada", de: "Manuel", fecha: "2026-10-14" }] } }),
        T("tVEN", "Vencida de verdad", "", { f_vigente: "2026-10-05" })];
      home(L); var r = { estado: [estadoReal(L[0]), estadoReal(L[1])], filas: filas(), suma: secs()["Vencidas mías"] };
      abreGrupoInicio("claude"); await espera(50);
      r.fila = [].map.call(document.querySelectorAll('[data-grupo-vista="claude"] .ttr'), function (b) { return b.innerText.replace(/\s+/g, " "); }); r.hito = esperaConHito(L[0]); return r; });
    eq("Vestidores (siguiente paso de Manuel con fecha) pasa a 'espera' y NO es vencida", D.estado, ["espera", "vencida"]);
    eq("Solo cuenta como vencida la que de verdad lo es", [D.filas, D.suma], [["Vencida de verdad"], ["Vencida de verdad"]]);
    eq("Sale en Claude las lleva con la fecha del hito más próximo (mié 7 oct)", [D.hito && D.hito.fecha, /espera a Manuel/.test(D.fila[0] || "")], ["2026-10-07", true]);

    /* ===================== 5. FALTA INFO COHERENTE ===================== */
    var E = await p.evaluate(async function () {
      var rel = T("tREL", "Reloj Checador Casa", "", { f_vigente: "", fecha_dictada: false, ritmo: "", contexto: "" });
      var ok = T("tOK", "Tarea completa", "", {});
      home([rel, ok]); var r = { marca: porRevisar().map(function (x) { return x.t.id + ":" + x.k; }), preg: preguntas249(rel).map(function (q) { return q.q; }), filas: filas() };
      /* al abrirla sale la pregunta precisa */
      abierta = "tREL"; vista = "hilo"; render(); r.bloque = !!document.getElementById("preg249"); r.bloqueTx = (document.getElementById("preg249") || { innerText: "" }).innerText.replace(/\s+/g, " ").slice(0, 160); cierraPreg(); window.__pq255Last = null;
      /* se completa lo que faltaba: al guardar se recalcula y se quita la marca */
      rel.f_vigente = "2026-10-20"; rel.fecha_dictada = true; rel.ritmo = "diario"; rel.contexto = "Reloj checador de la casa para registrar la entrada y salida del personal doméstico y de los trabajadores, con su instalación y su configuración completas.";
      guarda(rel); r.despues = porRevisar().map(function (x) { return x.t.id + ":" + x.k; }); r.falta263 = rel.falta263 || null;
      /* invariante: toda marca 'falta' del home tiene pregunta al abrir (o su tarjeta propia) */
      var X = T("tX", "Otra sin dictar", "", { f_vigente: "", fecha_dictada: false }); tareas = [X, rel, ok]; refrescaFalta();
      r.inv = porRevisar().filter(function (x) { return x.k === "falta"; }).every(function (x) { return preguntas249(x.t).length > 0 || !hiddenManual(x.t); });
      return r; });
    eq("Reloj Checador (le falta fecha/ritmo/contexto) sale en Falta info Y trae sus preguntas precisas", [E.marca, E.preg.length > 0, E.filas.indexOf("Reloj Checador Casa") >= 0], [["tREL:falta"], true, true]);
    eq("Al abrir la tarea sale en el centro el bloque de preguntas con la pregunta precisa", [E.bloque, /¿Para cuándo la quieres terminar/.test(E.bloqueTx)], [true, true]);
    eq("Si ya no falta nada, al guardar se quita la marca", [E.despues, E.falta263], [[], null]);
    eq("Invariante: ninguna marca de Falta info queda sin pregunta dentro", E.inv, true);
    await foto("b263-5-falta-info.png");

    /* ===================== 6. ES PARA CLAUDE NO REINSERTA EL DICTADO ===================== */
    var F = await p.evaluate(async function () {
      var dict = "Claude, el dictado largo de la decoración navideña: mándale un WhatsApp a Pato para confirmar las luces y revisa los avances del proyecto con calma para el viernes.";
      var t = T("tDEC", "Decoración Navideña Cumbres", "", {}); t.msgs = [{ k: "bo", de: "salvador", t: dict, ts: Date.now() - 200000, h: "13:25" }]; tareas = [t]; abierta = "tDEC"; vista = "hilo";
      window.preguntaAClaude = function (m, mo, cb) { setTimeout(function () { cb("{}", ""); }, 5); };
      aparta247(t, 0, "es_para_claude");   /* "Es para Claude" oculta el original… */
      completaRevision(t, dict, { sinRevision: true }); completaRevision(t, dict, { sinRevision: true }); completaRevision(t, dict, { sinRevision: true });   /* …y antes metía una copia visible por cada vez */
      await espera(1200);
      var iguales = t.msgs.filter(function (m) { return m.k === "bo" && String(m.t).indexOf("el dictado largo") >= 0; });
      var nuevo = "Pato, necesito los costos de las luces de navidad completos para decidir";
      completaRevision(t, nuevo, { sinRevision: true }); await espera(800);
      var n2 = t.msgs.filter(function (m) { return m.k === "bo" && m.t === nuevo; });
      return { iguales: iguales.length, ocultos: iguales.every(function (m) { return m.oculto === true; }), imp: iguales.some(function (m) { return esImp(t, m); }), n2: n2.length, n2oc: n2.every(function (m) { return m.oculto === true && m.dict238; }) }; });
    eq("El mismo dictado procesado tres veces queda UNA sola vez y oculto (no sale en Importante)", [F.iguales, F.ocultos, F.imp], [1, true, false]);
    eq("Un dictado nuevo procesado como indicación se guarda una vez y oculto", [F.n2, F.n2oc], [1, true]);

    /* ===================== 7. EL DICTADO ARMÓ MAL UN WHATSAPP ===================== */
    var G = await p.evaluate(async function () {
      var t = T("tDEC", "Decoración Navideña Cumbres", "", { wa_contactos: [{ nombre: "Pato luces Navidad" }, { nombre: "Karina" }] }); tareas = [t]; abierta = "tDEC"; vista = "hilo"; render(); window.__pids = [];
      var r = {};
      var junk = programaWA("Desde hoy mándale un WhatsApp nomás para confirmar que ya quedaron las luces de Navidad", Date.parse("2026-10-06T19:20:00Z"));
      r.contactoCrudo = junk && junk.contacto; r.aLas = junk && junk.a_las;
      r.bloqueado = revisaPG(t, junk); await espera(200);
      r.wa = t.wa_contactos.map(function (c) { return c.nombre; }); r.pidio = window.__pids.length; r.falta = ((t.hecho238 || {}).falta || []).map(function (f) { return [f.k, (f.ops || []).map(function (o) { return o.label; })]; }); r.candidatos = candidatosPersona(t).map(function (c) { return [c.nombre, c.prio]; }); r.card = !!document.getElementById("preg249");
      cierraPreg();
      var bien = programaWA("Desde hoy mándale a Pato luces Navidad que ya quedó el pedido", Date.parse("2026-10-06T19:20:00Z")); r.bien = [bien.contacto, bien.a_las, revisaPG(t, bien), bien.contacto];
      r.ventana = [ventanaHabil(Date.parse("2026-10-06T19:20:00Z")), ventanaHabil(new Date(2026, 9, 6, 22, 30).getTime()), ventanaHabil(new Date(2026, 9, 4, 12, 0).getTime()), ventanaHabil(new Date(2026, 9, 6, 6, 0).getTime())];
      r.fechas = [(programaWA("Desde hoy mándale a Pato luces Navidad que ya quedó", new Date(2026, 9, 6, 12, 0).getTime()) || {}).a_las, (programaWA("Desde hoy mándale a Pato luces Navidad que ya quedó", new Date(2026, 9, 6, 22, 0).getTime()) || {}).a_las];
      /* limpieza de lo ya armado mal */
      var s = T("tSUC", "Con basura", "", { wa_contactos: [{ nombre: "un WhatsApp nomás para confirmar" }, { nombre: "Pato luces Navidad" }] });
      s.msgs.push({ k: "bi", wa: 1, wa_c: "un WhatsApp nomás para confirmar", t: "Programado", ts: Date.now(), h: "13:20", wa_pid: "wa_64c21258c3364ac228fea94f", prog: { a_las: { fecha: "2026-10-07", hora: "09:00" }, contacto: "un WhatsApp nomás para confirmar", texto: "x" } });
      tareas = [s]; window.__push = []; try { localStorage.removeItem("bit_limpia263"); } catch (e) {}
      limpiaWABasura(); r.limpio = s.wa_contactos.map(function (c) { return c.nombre; }); r.cancelado = s.msgs[s.msgs.length - 1].prog.cancelado === true; r.marcas = window.__push.filter(function (x) { return x[0] === "wa_marca"; }).map(function (x) { return x[1].id; }).sort();
      return r; });
    eq("El dictado crudo trae un contacto basura y 'desde hoy' deja el envío en la ventana hábil (a las 13:20 es horario hábil: sale ahora)", [G.contactoCrudo, G.aLas], ["un WhatsApp nomás para confirmar", null]);
    eq("Un contacto que no es de la agenda ni de la tarea NO se programa: es pregunta con autocompletar y sin basura en wa_contactos", [G.bloqueado, G.pidio, G.wa], [true, 0, ["Pato luces Navidad", "Karina"]]);
    eq("La tarjeta de dudas ofrece a Pato luces Navidad", [G.falta[0][0], G.falta[0][1].indexOf("Pato luces Navidad") >= 0, G.card], ["msg", true, true]);
    eq("Con un contacto real sí se programa", [G.bien[0], G.bien[2]], ["Pato luces Navidad", false]);
    eq("'Desde hoy': en horario hábil sale ahora; fuera (noche, domingo, antes de las 8), el siguiente día hábil a las 9", [G.ventana[0], G.ventana[1], G.ventana[2], G.ventana[3], G.fechas], [null, { fecha: "2026-10-07", hora: "09:00" }, { fecha: "2026-10-05", hora: "09:00" }, { fecha: "2026-10-06", hora: "09:00" }, [null, { fecha: "2026-10-07", hora: "09:00" }]]);
    eq("Se limpia el wa_contactos basura y se cancela el pedido programado; los dos pedidos de hoy se cierran en el servidor", [G.limpio, G.cancelado, G.marcas.indexOf("wa_64c21258c3364ac228fea94f") >= 0 && G.marcas.indexOf("wa_74673629d6dba4c3029f9a96") >= 0], [["Pato luces Navidad"], true, true]);

    /* ===================== 8. QUÉ TOCA = EL SIGUIENTE PASO ===================== */
    var H = await p.evaluate(async function () {
      var t = T("tCEN", "Cena Jueves Amigos", "", { encargos: [{ id: "c1", tipo: "condicional", estado: "hecho", pregunta: { contacto: "Karina" }, si_si: { contacto: "Eduardo" } }],
        resumen: { texto: "Cena del jueves con los amigos.", que_toca: "Esperando respuesta de Karina → confirmar a Eduardo · hecho", pendientes: [{ t: "Definir lugar y hora de la cena", de: "Eduardo", nota: "él invita" }], actualizado: Date.now() } });
      tareas = [t]; abierta = "tCEN"; vista = "hilo"; render(); var r = {};
      r.cond = !!document.querySelector(".cond250"); r.qt = (document.querySelector(".res230 .qtx") || {}).textContent || ""; r.hecho = /· hecho/.test(document.body.innerText);
      t.encargos[0].estado = "esperando"; render(); r.condEsperando = !!document.querySelector(".cond250");
      var u = T("tX2", "Otra", "", { resumen: { texto: "x", que_toca: "Esperando respuesta de Karina → confirmar a Eduardo · hecho", pendientes: [] } }); r.sinPaso = pasoSiguiente(u);
      return r; });
    eq("Arriba va el siguiente paso y quién lo tiene, no lo hecho", H.qt, "Definir lugar y hora de la cena — espera a Eduardo (él invita)");
    eq("La tarjeta condicional 'hecho' se oculta sola; si sigue esperando, se ve", [H.cond, H.hecho, H.condEsperando], [false, false, true]);
    eq("Un 'qué toca' que ya está hecho no se pone arriba", H.sinPaso, "");
    await p.evaluate(function () { var m = document.querySelector(".micmask,.micperm,#micperm"); [].forEach.call(document.querySelectorAll("[class*=mic] .cerrar, [data-micx]"), function (b) { b.click(); }); tareas[0].encargos[0].estado = "hecho"; render(); [].forEach.call(document.querySelectorAll(".leemask,.mic-ov,.hoja-velo"), function (e) { e.remove(); }); });
    await foto("b263-8-que-toca.png");
    eq("Sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCION " + e.message + "\n" + (e.stack || "").split("\n").slice(0, 4).join("\n")); }
  await b.close();
  console.log(malas.length ? malas.join("\n") : "");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
