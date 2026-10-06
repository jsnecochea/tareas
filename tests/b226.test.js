#!/usr/bin/env node
/* PRUEBAS build 226 (Salvador 15:40, maqueta-acomodo pantallas 1-3 con ajustes). Carga la app COMPLETA (sin red) y prueba:
   mensaje con duda -> OK · Mover · Nueva abajo de la burbuja (sin "¿Es de esta tarea?"); OK quita la duda y cuenta como acierto;
   Mover abre "¿A dónde va?" (más probable resaltada, "aquí cayó", Tarea nueva con nombre sugerido, Solo plática); mover oculta en el
   origen y llega NUEVO al destino; Nueva crea la tarea en Falta info con el mensaje; cada corrección queda en el censo; Inicio con
   "Acomodo" (solo lo dudoso, deslizar) y plegado "Acomodé solo hoy · N · acerté X/Y"; iconos de línea 1.5 sin emojis.
   Caso real: Manuel Parra 11:51 "Mesa Comedor Alt Brillo" en Casa Lerdo con duda hacia Comedor Nuevo. Correr: node tests/b226.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
si("versión 226 o mayor", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 226);
si("iconos: trazo 1.5 fijo", /var s=px\|\|18, w=1\.5, p=\{/.test(html));
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };   /* firebase sin red: solo lo que se llama al arrancar */
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {}; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    var r = await p.evaluate(function () {
      yo = "salvador"; if (!PERSONAS.salvador) PERSONAS.salvador = { nombre: "Salvador", jefe: true };
      var NOW = Date.now(), o = {};
      function LERDO() { return { id: "tIAMUVF22TRJF", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", revisa_ext: "Manuel Parra", indefinida: true, estado: "abierta", por_autorizar: false,
        contexto: "Filtración en recámara/estudio por el baño; azotea con ramas y posible panal; luego impermeabilizar.", compartir_con: ["María Eloísa (madre)", "Salvador N.S. (padre)", "Luis Mario"],
        checklist: { titulo: "Metas", items: [{ id: "a", tx: "Azotea: techo limpio, impermeabilizado y panal resuelto", fecha: "2026-10-09", estado: 0 }] },
        msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: esta semana yo mando fotos del techo limpio", ts: NOW - 7e6, h: "11:23" },
          { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: Tema 2... Mesa Comedor Alt Brillo. Maribel González me pasó el teléfono de su carpintero de cocinas; mañana te dejamos la muestra de la melamina al alto brillo", ts: NOW - 5e6, h: "11:51",
            duda_tarea: { alternativa_id: "tCOMEDOR_NUEVO_300926", alternativa_nombre: "Comedor Nuevo" } }],
        notas: [{ t: "📝 Nota IA 11:52: vinculó al comedor", ts: NOW - 4e6, h: "11:52", privado: true }] }; }
      function COMEDOR() { return { id: "tCOMEDOR_NUEVO_300926", nombre: "Comedor Nuevo", duenio: "salvador", estado: "abierta", contexto: "Mesa del comedor: cubierta de melamina alto brillo o piedra", f_vigente: "2026-10-06", msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: te adelanto el trazo de la mesa", ts: NOW - 3e6, h: "12:42" }] }; }
      function VEST() { return { id: "tVEST", nombre: "Vestidores Carpintería", duenio: "salvador", estado: "abierta", msgs: [] }; }
      function pinta() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); var A = document.getElementById("app"); A.style.display = "flex"; document.body.style.height = "844px"; }
      /* ---- dentro de la tarea ---- */
      tareas = [LERDO(), COMEDOR(), VEST()]; abierta = "tIAMUVF22TRJF"; vista = "hilo"; render(); poneVista230(tareas[0], ""); render(); pinta();   /* 235: elige Todo */
      var ac = document.querySelector(".msgs .ac226");
      o.botones = ac ? [].map.call(ac.querySelectorAll("button"), function (x) { return x.textContent; }) : null;
      o.debajo = !!(ac && ac.previousElementSibling && ac.previousElementSibling.classList.contains("b") && !ac.closest(".b"));
      o.sinPregunta = !/¿Es de/.test(document.querySelector(".msgs").textContent);
      o.unaVez = document.querySelectorAll(".msgs .ac226").length;
      o.sinEmojiNota = !/📝/.test(document.querySelector(".msgs").textContent) && /Nota IA 11:52/.test(document.querySelector(".msgs").textContent);
      var chips = document.querySelector(".chips225"); o.chipsSinEmoji = !/[\u{1F300}-\u{1FAFF}ℹⓘ↻]/u.test(chips.textContent) && chips.querySelectorAll("svg").length >= 3;
      o.svgTrazo = [].every.call(document.querySelectorAll("#app svg.icx"), function (s) { return s.getAttribute("stroke-width") === "1.5"; });
      o.tituloCompacto = !!document.querySelector(".top .tnm") && !document.querySelector(".ttl");
      /* Mover: la hoja */
      document.querySelector('.msgs [data-acmov]').click();
      var hj = document.getElementById("mov225");
      o.hoja = { titulo: hj.querySelector(".mvh").textContent, ops: [].map.call(hj.querySelectorAll(".opt226"), function (x) { return (x.classList.contains("best") ? "*" : "") + x.textContent; }) };
      hj.querySelector('[data-movto="tCOMEDOR_NUEVO_300926"]').click();
      var L = tareas[0], C = tareas[1], x = L.msgs[1], d = C.msgs[C.msgs.length - 1];
      o.mover = [x.oculto, x.movido_a.id, d.t.indexOf("Movido desde Mantenimiento Casa Lerdo/Eloísa: "), !!d.nuevo_mov, L.msgs.length];
      o.censo = (L.censo_acomodo || []).map(function (c) { return [c.contacto, c.de, c.a, c.tipo, c.texto.slice(0, 22)]; });
      /* OK */
      tareas = [LERDO(), COMEDOR(), VEST()]; abierta = "tIAMUVF22TRJF"; render(); pinta();
      document.querySelector('.msgs [data-acok]').click();
      var L2 = tareas[0]; o.ok = [L2.msgs[1].duda_resuelta, L2.msgs[1].acomodo.ok, (L2.censo_acomodo || [])[0].tipo, document.querySelectorAll(".msgs .ac226").length, !!L2.msgs[1].oculto];
      /* Solo plática */
      tareas = [LERDO(), COMEDOR(), VEST()]; render(); document.querySelector('.msgs [data-acmov]').click(); document.querySelector('#mov225 [data-movplatica]').click();
      o.platica = [!!tareas[0].msgs[1].oculto, tareas[0].msgs[1].oculto_motivo, tareas[0].censo_acomodo[0].tipo, tareas.length];
      /* Nueva */
      tareas = [LERDO(), COMEDOR(), VEST()]; render(); document.querySelector('.msgs [data-acnueva]').click();
      var nv = tareas[tareas.length - 1];
      o.nueva = [tareas.length, nv.nombre, tipoRevisar(nv), !!nv.msgs.filter(function (m) { return m.movido_de; }).length, !!tareas[0].msgs[1].oculto, tareas[0].censo_acomodo[0].tipo];
      /* ---- Inicio ---- */
      var L3 = LERDO(); L3.msgs.push({ k: "bi", wa_in: 1, wa_c: "Lalo Madero", t: "Lalo Madero: ¿Hay miercolitos esta semana?", ts: NOW - 1e6, h: "13:50", duda_tarea: { alternativa_id: "tVEST", alternativa_nombre: "Vestidores Carpintería" } });
      var C3 = COMEDOR(); C3.msgs.push({ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: algo movido", ts: NOW - 2e6, h: "12:00", oculto: true, movido_a: { id: "x" } });
      tareas = [L3, C3, VEST()]; abierta = null; vista = "lista"; render(); pinta();
      var aco = document.querySelector(".aco226");
      o.inicio = aco ? { cab: aco.querySelector(".acoh").textContent, filas: [].map.call(aco.querySelectorAll(".acor"), function (f) { return [f.querySelector(".av226").textContent, f.querySelector(".acow b").textContent, f.querySelector(".pill226").textContent, [].map.call(f.querySelectorAll(".ac226 button"), function (x) { return x.textContent; }).join("·")]; }),
        plegado: aco.querySelector(".acof").textContent, lista: !!aco.querySelector(".acol") } : null;
      o.primero = !!(aco && document.querySelector(".scroll").firstElementChild && aco.compareDocumentPosition(document.querySelector(".scroll").lastElementChild) & 4);
      document.getElementById("bacof").click(); o.abre = document.querySelectorAll(".aco226 .acoli").length;
      document.querySelector('.aco226 .acor [data-acok]').click();
      o.okInicio = [document.querySelectorAll(".aco226 .acor").length, tareas[0].msgs.filter(function (m) { return m.duda_resuelta === "esta"; }).length];
      o.sugerido = [nombreSugerido({ wa_c: "Manuel Parra", t: "Manuel Parra: Tema 2... Mesa Comedor Alt Brillo. Maribel González…" }), nombreSugerido({ wa_c: "Lalo Madero", t: "Lalo Madero: ¿Hay miercolitos esta semana?" })];
      o.emojiUI = [sinEmojiUI("📝 Nota IA 11:52: x"), sinEmojiUI("✉️ Enviado: hola"), sinEmojiUI("Gracias 👍")];
      return o; });
    eq("en la tarea: abajo de la burbuja, una línea OK · Mover · Nueva, sin '¿Es de esta tarea?'", [r.botones, r.debajo, r.sinPregunta, r.unaVez], [["OK", "Mover", "Nueva"], true, true, 1]);
    eq("sin emojis: la nota del sistema se pinta sin 📝; chips con iconos de línea", [r.sinEmojiNota, r.chipsSinEmoji], [true, true]);
    eq("todos los iconos de la pantalla con trazo 1.5", r.svgTrazo, true);
    eq("encabezado con el título compacto original", r.tituloCompacto, true);
    eq("Mover: hoja '¿A dónde va?' — más probable resaltada, aquí cayó, otras, Tarea nueva con nombre sugerido, Solo plática", r.hoja,
      { titulo: "¿A dónde va?", ops: ["*Comedor Nuevomás probable", "Mantenimiento Casa Lerdo/Eloísaaquí cayó", "Vestidores Carpintería", "Tarea nueva“Mesa Comedor Alt Brillo con Manuel”", "Solo pláticano guardar en tarea"] });
    eq("Mover: oculto en el origen (no borrado) y NUEVO en el destino", r.mover, [true, "tCOMEDOR_NUEVO_300926", 0, true, 2]);
    eq("censo de aprendizaje: contacto, origen -> destino, texto corto", r.censo, [["Manuel Parra", "tIAMUVF22TRJF", "tCOMEDOR_NUEVO_300926", "mover", "Tema 2... Mesa Comedor"]]);
    eq("OK: quita la duda, cuenta como acierto y no oculta nada", r.ok, ["esta", 1, "ok", 0, false]);
    eq("Solo plática: oculto con motivo, censo, sin tarea nueva", r.platica, [true, "platica", "platica", 3]);
    eq("Nueva: crea la tarea con nombre sugerido, queda en Falta info y el mensaje pasa ahí", r.nueva, [4, "Mesa Comedor Alt Brillo con Manuel", "falta", true, true, "nueva"]);
    eq("Inicio · Acomodo arriba: solo lo dudoso, 1 renglón por mensaje con iniciales, nombre, pastilla y OK·Mover·Nueva", r.inicio && [r.inicio.cab, r.inicio.filas],
      ["Acomodo2 por revisar", [["LM", "Lalo Madero", "Casa Lerdo?", "OK·Mover·Nueva"], ["MP", "Manuel Parra", "Casa Lerdo?", "OK·Mover·Nueva"]]]);
    eq("plegado: 'Acomodé solo hoy · 3' y 'acerté 2/3' (el movido cuenta como fallo)", r.inicio && [r.inicio.plegado, r.inicio.lista], ["Acomodé solo hoy · 3acerté 2/3", false]);
    eq("se despliega la lista de hoy", r.abre, 3);
    eq("OK desde el Inicio quita el renglón", r.okInicio, [1, 1]);
    eq("nombre sugerido de tarea nueva", r.sugerido, ["Mesa Comedor Alt Brillo con Manuel", "Miercolitos Semana con Lalo"]);
    eq("sin emojis en la interfaz (los del sistema al inicio se quitan; los del contacto se respetan)", r.emojiUI, ["Nota IA 11:52: x", "Enviado: hola", "Gracias 👍"]);
    si("deslizar en el Inicio: derecha OK, izquierda Mover", /if\(dx>80\)\{ var s=acomodoOk\(t, ix\);[^}]*\} else if\(dx<-80\) abreMover225\(t, ix\);/.test(html));
    eq("sin errores de página", errs, []);
    await p.screenshot({ path: require("os").tmpdir() + "/b226-inicio.png" });
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
