#!/usr/bin/env node
/* PRUEBAS build 274: MODO CAMINATA — botón en el home, orden (decisiones · llamadas de hoy · vencidas/hoy), dos voces tipo podcast,
   escucha sin cortar (1 s de silencio NO envía; 2.5 s pregunta "¿Terminaste o sigues?"; "terminé" envía), comandos de voz,
   la respuesta va al hilo, pantalla mínima a 390 px. Mocks de speechSynthesis y SpeechRecognition. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión = 274", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1], 274);
eq("sw.js con versión build 274", /var SW_VERSION = 'build 274'/.test(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")), true);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {};
    try { Object.defineProperty(navigator, "serviceWorker", { value: { addEventListener: function () {}, register: function () { return Promise.resolve({}); }, ready: Promise.resolve({}) }, configurable: true }); } catch (e) {}
    var RD = Date, base = RD.parse("2026-10-07T15:00:00Z"), t0 = RD.now();
    function FD() { var a = [].slice.call(arguments); if (!(this instanceof FD)) return new RD(base + RD.now() - t0).toString(); if (!a.length) return new RD(base + RD.now() - t0); return new (Function.prototype.bind.apply(RD, [null].concat(a)))(); }
    FD.prototype = RD.prototype; FD.now = function () { return base + RD.now() - t0; }; FD.parse = RD.parse; FD.UTC = RD.UTC; window.Date = FD;
    /* ---- mock de voz: cada utterance queda en __dichos y "termina" a los 5 ms ---- */
    window.__dichos = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    var VOCES = [{ name: "Paulina", lang: "es-MX" }, { name: "Juan", lang: "es-MX" }, { name: "Samantha", lang: "en-US" }];
    var SS = { speaking: false, pending: false, getVoices: function () { return VOCES; }, cancel: function () {}, addEventListener: function () {},
      speak: function (u) { window.__dichos.push({ t: u.text, voz: u.voice ? u.voice.name : "", pitch: u.pitch, rate: u.rate, vol: u.volume }); setTimeout(function () { if (u.onend) u.onend({}); }, 5); } };
    try { Object.defineProperty(window, "speechSynthesis", { value: SS, configurable: true }); } catch (e) { window.speechSynthesis = SS; }
    /* ---- mock de reconocimiento: __srs guarda cada sesión del motor; di(texto, final) emite en la sesión viva ---- */
    window.__srs = [];
    function SR() { this.fin = []; this.inter = ""; this.vivo = false; }
    SR.prototype.start = function () { this.vivo = true; window.__srs.push(this); };
    SR.prototype.stop = SR.prototype.abort = function () { var s = this; if (!s.vivo) return; s.vivo = false; setTimeout(function () { if (s.onend) s.onend(); }, 0); };
    window.SpeechRecognition = window.webkitSpeechRecognition = SR;
    window.srViva = function () { for (var i = window.__srs.length - 1; i >= 0; i--) if (window.__srs[i].vivo) return window.__srs[i]; return null; };
    window.di = function (txt, fin) { var s = srViva(); if (!s) return false; if (fin) { s.fin.push(txt); s.inter = ""; } else s.inter = txt;
      var R = s.fin.map(function (x) { var r = [{ transcript: x }]; r.isFinal = true; return r; }); if (s.inter) { var q = [{ transcript: s.inter }]; q.isFinal = false; R.push(q); }
      s.onresult({ resultIndex: 0, results: R }); return true; };
    window.motorSeCae = function () { var s = srViva(); if (!s) return; s.vivo = false; s.onend(); };
  });
  async function foto(nom) { if (!process.env.CAP) return; await p.waitForTimeout(250); await p.screenshot({ path: path.join(process.env.CAP, nom) }); }
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    await p.evaluate(function () { yo = "salvador"; PERSONAS.salvador = PERSONAS.salvador || { nombre: "Salvador", jefe: true }; PERSONAS.salvador.jefe = true;
      window.__esp = [];
      db = { collection: function () { return { doc: function (k) { return { set: function (d, o) { window.__esp.push([k, d, o]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); }, delete: function () { return Promise.resolve(); } }; } }; } };
      window.llamaPush = function () {}; window.pideWhatsApp = function () { return Promise.resolve({ id: "wa_x" }); };
      document.getElementById("app").style.display = "flex"; window.espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      window.hasta = async function (f, ms) { var t0 = performance.now(); while (performance.now() - t0 < (ms || 3000)) { if (f()) return true; await espera(15); } return false; };
      var N = Date.now();
      window.T = function (id, nombre, extra) { var t = { id: id, nombre: nombre, duenio: "salvador", creada_por: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, autorizada: true, f_vigente: "2026-10-07", fecha_dictada: true, contexto: "Tarea de prueba con contexto suficiente para que no falte nada de contexto en la ficha de la tarea y se vea completa.", ritmo: "diario", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 100000, h: "07:00" }] }; for (var k in (extra || {})) t[k] = extra[k]; return t; };
      window.fx = function () { return [
        T("tHOY", "Revisar contrato de la bodega", { resumen: { texto: "El contrato llegó ayer por correo. Faltan las firmas de los dos socios.", que_toca: "Revisar la cláusula de renta y firmar" } }),
        T("tVEN", "Pagar predial de Lerdo", { f_vigente: "2026-10-03", resumen: { texto: "El predial vence este mes. Hay descuento si se paga antes del 15." } }),
        T("tLLA", "Llamar a Rogelio por la cotización", { resumen: { texto: "Rogelio mandó la cotización del portón. Quedó en ajustar el precio." } }),
        T("tDEC", "Reloj checador", { f_vigente: "2026-10-12", resumen: { texto: "Hay que controlar la asistencia de la oficina. El de tarjetas se pierde seguido. Se cotizaron dos equipos. Y otro dato que ya no debe leerse." },
          sabemos: ["Son 14 personas en la oficina", { t: "El de tarjetas se descartó", tipo: "descartado", por_que: "se pierden" }, "La instalación tarda un día"],
          decision: { pregunta: "¿Cuál reloj compramos?", recomendacion: "El ZKTeco de huella",
            opciones: [{ nombre: "ZKTeco de huella", precio: "$3,200", link: "https://x.com/a", cumple: { "Huella": true, "Reporte en Excel": true, "Wifi": false }, recomendada: true },
                       { nombre: "Steren de tarjeta", precio: "$1,900", cumple: { "Huella": false, "Reporte en Excel": true, "Wifi": false } }] } }) ]; };
      window.home = function (L) { tareas = L; abierta = null; vista = "lista"; render(); };
      window.dichos = function (desde) { return window.__dichos.slice(desde || 0).map(function (d) { return d.t; }); };
      window.mio = function (id) { var t = tareas.filter(function (x) { return x.id === id; })[0]; return (t.msgs || []).filter(function (m) { return m.caminata274; }).map(function (m) { return [m.t, m.de, m.k, m.canal, !!m.nota_claude]; }); };
    });

    /* ---------- 1 · el botón y el orden ---------- */
    var A = await p.evaluate(function () {
      home(fx()); var r = {}, b = document.getElementById("bcam274");
      r.boton = b ? [b.querySelector("b").textContent, b.querySelector("small").textContent] : null;
      r.ancho = b ? [Math.round(b.getBoundingClientRect().right) <= 390, b.getBoundingClientRect().height >= 60, document.documentElement.scrollWidth <= 390] : null;
      r.arriba = b ? b.getBoundingClientRect().top < (document.querySelector(".h270") || b).getBoundingClientRect().top + 1 : null;
      r.orden = camLista274();
      return r; });
    eq("home: botón grande Caminata con el número de pendientes", A.boton, ["Caminata", "4 pendientes en voz, sin ver la pantalla"]);
    eq("home: el botón cabe en 390 px y es grande (≥60 px)", A.ancho, [true, true, true]);
    eq("home: el botón va arriba de las secciones", A.arriba, true);
    eq("orden: decisiones · llamadas de hoy · vencidas · hoy", A.orden, ["tDEC", "tLLA", "tVEN", "tHOY"]);
    await foto("274-home.png");

    /* ---------- 2 · arranca: dos voces tipo podcast ---------- */
    var B = await p.evaluate(async function () {
      document.getElementById("bcam274").click();
      await hasta(function () { return !!srViva(); }, 4000);
      var r = {}, D = window.__dichos;
      r.ui = [!!document.getElementById("cam274"), document.getElementById("c274tit").textContent, document.getElementById("c274n").textContent, document.getElementById("c274p").textContent, document.getElementById("c274s").textContent];
      r.textos = D.map(function (d) { return d.t; });
      r.voces = D.map(function (d) { return d.voz; });
      r.largas = D.filter(function (d) { return d.t.length > 220; }).length;
      r.sr = (function (s) { return s ? [s.lang, s.continuous, s.interimResults] : null; })(srViva());
      r.estado = document.getElementById("c274st").textContent;
      r.circ = document.getElementById("c274o").className;
      return r; });
    eq("pantalla mínima: título, contador, Pausa y Siguiente", B.ui, [true, "Reloj checador", "Caminata · 1 de 4", "Pausa", "Siguiente"]);
    eq("voz A presenta: 'Tarea 1 de 4: Reloj checador.'", B.textos[1], "Tarea 1 de 4: Reloj checador.");
    eq("voz A abre con cuántas son", B.textos[0], "Caminata. Son 4 tareas.");
    eq("voz B: contexto corto (máx. 2 frases del resumen, sin la tercera)", [B.textos.indexOf("El de tarjetas se pierde seguido.") > 0, B.textos.some(function (x) { return /ya no debe leerse/.test(x); })], [true, false]);
    eq("voz B: 'Lo que hay que decidir: …'", B.textos.indexOf("Lo que hay que decidir: ¿Cuál reloj compramos?") > 0, true);
    eq("voz B: 'Yo haría: … porque …' con lo que cumple la recomendada", B.textos.filter(function (x) { return /^Yo haría:/.test(x); }), ["Yo haría: El ZKTeco de huella, porque cumple con huella y reporte en excel y cuesta 3,200 pesos."]);
    eq("primera vez: explica 'di terminé' antes de la pregunta", B.textos.slice(-2), ["Cuando acabes de contestar, di: terminé.", "¿Lo hacemos, quieres más detalle o la dejamos para después?"]);
    var iA = B.textos.indexOf("Tarea 1 de 4: Reloj checador."), iB = B.textos.indexOf("Lo que hay que decidir: ¿Cuál reloj compramos?");
    eq("dos voces distintas (A presentadora, B analista)", [B.voces[iA], B.voces[iB], B.voces[B.voces.length - 1]], ["Paulina", "Juan", "Paulina"]);
    eq("frases cortas (ninguna de más de 220 caracteres)", B.largas, 0);
    eq("escucha continua con resultados parciales, es-MX", B.sr, ["es-MX", true, true]);
    eq("escuchando: círculo verde y el aviso de 'terminé'", [B.estado, B.circ], ["Te escucho · di «terminé» al acabar", "c274o oye"]);
    await foto("274-escucha.png");

    /* ---------- 3 · 1 s de silencio NO envía; "terminé" sí ---------- */
    var C = await p.evaluate(async function () {
      var r = {}, d0 = __dichos.length;
      di("Sí, compra el de huella", true); await espera(1000);
      r.tras1s = [mio("tDEC").length, dichos(d0)];
      r.oido = document.getElementById("c274oy").textContent;
      di("terminé", true);
      await hasta(function () { return dichos(d0).indexOf("Tarea 2 de 4: Llamar a Rogelio por la cotización.") >= 0; }, 3000);
      r.guardado = mio("tDEC");
      var t = tareas.filter(function (x) { return x.id === "tDEC"; })[0];
      r.decision = t.decision.respuesta ? t.decision.respuesta.t : null;
      r.dicho = dichos(d0).slice(0, 2);
      r.tit = document.getElementById("c274tit").textContent;
      r.explicaOtraVez = dichos(d0).filter(function (x) { return /di: terminé/.test(x); }).length;
      r.guardoDb = __esp.some(function (e) { return e[0] === "tDEC"; });
      await hasta(function () { return !!srViva(); }, 3000);
      return r; });
    eq("1 s de silencio: no se envía nada ni se pregunta", C.tras1s, [0, []]);
    eq("se ve lo que va oyendo", C.oido, "Sí, compra el de huella");
    eq("'terminé' envía: va al hilo como mensaje de Salvador (nota para Claude), sin la palabra 'terminé'", C.guardado, [["Sí, compra el de huella", "salvador", "bo", "priv:salvador", true]]);
    eq("en una decisión, queda también como su respuesta", C.decision, "Sí, compra el de huella");
    eq("voz A: 'Anotado.' y pasa a la siguiente", C.dicho, ["Anotado.", "Tarea 2 de 4: Llamar a Rogelio por la cotización."]);
    eq("pasa a la tarea 2 en pantalla", C.tit, "Llamar a Rogelio por la cotización");
    eq("la explicación de 'terminé' solo la primera vez", C.explicaOtraVez, 0);
    eq("se guarda (guarda a la base)", C.guardoDb, true);

    /* ---------- 4 · 2.5 s de silencio: "¿Terminaste o sigues?" bajito; "sigo" acumula; "listo" envía ---------- */
    var D = await p.evaluate(async function () {
      var r = {}, d0 = __dichos.length;
      di("Márcale mañana temprano", true); await espera(2000);
      r.a2s = dichos(d0).length;
      await hasta(function () { return dichos(d0).indexOf("¿Terminaste o sigues?") >= 0; }, 2000);
      var q = __dichos.filter(function (x) { return x.t === "¿Terminaste o sigues?"; }).pop();
      r.pregunta = [dichos(d0), q.voz, q.vol < 1, mio("tLLA").length];
      await hasta(function () { return !!srViva(); }, 2000); await espera(30);
      di("sigo", true); await espera(400);
      r.sigo = [mio("tLLA").length, document.getElementById("c274st").textContent];
      di("y dile que traiga la cotización firmada", true);
      await hasta(function () { return dichos(d0).filter(function (x) { return x === "¿Terminaste o sigues?"; }).length === 2; }, 4000);
      await hasta(function () { return !!srViva(); }, 2000); await espera(30);
      di("listo", true);
      await hasta(function () { return mio("tLLA").length > 0; }, 2000);
      r.guardado = mio("tLLA").map(function (m) { return m[0]; });
      await hasta(function () { return dichos(d0).indexOf("Tarea 3 de 4: Pagar predial de Lerdo.") >= 0; }, 3000);
      await hasta(function () { return !!srViva(); }, 3000);
      return r; });
    eq("a los 2 s todavía no pregunta", D.a2s, 0);
    eq("a los 2.5 s: voz A pregunta bajito, sin enviar", D.pregunta, [["¿Terminaste o sigues?"], "Paulina", true, 0]);
    eq("'sigo': no envía y sigue escuchando", D.sigo, [0, "Te escucho · di «terminé» al acabar"]);
    eq("'listo': envía TODO lo acumulado", D.guardado, ["Márcale mañana temprano y dile que traiga la cotización firmada"]);

    /* ---------- 5 · comandos de voz ---------- */
    var E = await p.evaluate(async function () {
      var r = {}, d0 = __dichos.length;
      var espSR = async function () { await hasta(function () { return !!srViva(); }, 3000); await espera(20); };
      di("repite", true); await hasta(function () { return dichos(d0).indexOf("Tarea 3 de 4: Pagar predial de Lerdo.") >= 0; }, 2000); await espSR();
      r.repite = dichos(d0)[0];
      var d1 = __dichos.length; di("siguiente", true); await hasta(function () { return dichos(d1).length > 0; }, 2000); await espSR();
      r.siguiente = [dichos(d1)[0], document.getElementById("c274tit").textContent];
      var d2 = __dichos.length; di("atrás", true); await hasta(function () { return dichos(d2).length > 0; }, 2000); await espSR();
      r.atras = dichos(d2)[0];
      /* más detalle en la tarea de la decisión: viñetas de sabemos y comparativa */
      CAM.i = 0; var d3 = __dichos.length; di("más detalle", true); await hasta(function () { return dichos(d3).indexOf("¿Lo hacemos, quieres más detalle o la dejamos para después?") >= 0; }, 3000); await espSR();
      r.detalle = dichos(d3);
      var d4 = __dichos.length; di("la dejamos para después", true); await hasta(function () { return dichos(d4).length > 1; }, 2000); await espSR();
      r.despues = [dichos(d4).slice(0, 2).map(function (x) { return x.toLowerCase(); }), mio("tDEC").length];
      var d5 = __dichos.length; di("pausa", true); await espera(150);
      r.pausa = [CAM.pausa, !!srViva(), document.getElementById("c274p").textContent, document.getElementById("c274st").textContent, document.getElementById("c274o").className, dichos(d5)];
      document.getElementById("c274p").click(); await espSR();
      r.sigue = [CAM.pausa, document.getElementById("c274p").textContent];
      /* el motor se cae solo (iOS): se reabre sin perder lo dictado */
      var n0 = __srs.length; di("dile que sí", true); motorSeCae(); await hasta(function () { return __srs.length > n0 && !!srViva(); }, 2000);
      r.reabre = __srs.length > n0;
      di("terminé", true); await hasta(function () { return mio("tLLA").length > 1; }, 2000);
      r.tras = mio("tLLA").map(function (m) { return m[0]; });
      await espSR();
      var d6 = __dichos.length; di("salir", true); await espera(200);
      r.salir = [!!document.getElementById("cam274"), CAM.on, !!srViva(), dichos(d6)];
      return r; });
    eq("'repite' vuelve a presentar la tarea", E.repite, "Tarea 3 de 4: Pagar predial de Lerdo.");
    eq("'siguiente' pasa a la 4", E.siguiente, ["Tarea 4 de 4: Revisar contrato de la bodega.", "Revisar contrato de la bodega"]);
    eq("'atrás' regresa a la 3", E.atras, "Tarea 3 de 4: Pagar predial de Lerdo.");
    eq("'más detalle': viñetas de Lo que sabemos y la comparativa resumida", E.detalle, ["Lo que sabemos.", "Son 14 personas en la oficina.", "Descartado: El de tarjetas se descartó.", "La instalación tarda un día.", "Las opciones.",
      "ZKTeco de huella, 3,200 pesos. Cumple con huella y reporte en excel. No cumple con wifi.", "Steren de tarjeta, 1,900 pesos. Cumple con reporte en excel. No cumple con huella y wifi.", "¿Lo hacemos, quieres más detalle o la dejamos para después?"]);
    eq("'la dejamos para después': pasa sin anotar", E.despues, [["va, la dejamos para después.", "tarea 2 de 4: llamar a rogelio por la cotización."], 1]);
    eq("'pausa': deja de hablar y de escuchar; el botón dice Seguir", E.pausa, [true, false, "Seguir", "En pausa", "c274o pausa", ["En pausa."]]);
    eq("Seguir retoma", E.sigue, [false, "Pausa"]);
    eq("si el motor se cae solo, se reabre y no pierde lo dicho", E.reabre, true);
    eq("lo dicho antes de la caída se envía con 'terminé'", E.tras, ["Márcale mañana temprano y dile que traiga la cotización firmada", "dile que sí"]);
    eq("'salir' cierra la caminata", E.salir, [false, false, false, ["Listo, salimos de la caminata."]]);

    /* ---------- 6 · el audífono de la tarea abre la Caminata desde esa tarea; sin pendientes, sin botón ---------- */
    var F = await p.evaluate(async function () {
      var r = {}; home(fx()); abierta = "tHOY"; vista = "hilo"; render(); await espera(50);
      var b = document.getElementById("bleeh"); r.hay = !!b; if (b) b.click();
      await hasta(function () { return !!srViva(); }, 4000);
      r.primera = [document.getElementById("c274tit").textContent, CAM.L[0]];
      camSal274(false);
      home([]); r.sinBoton = !document.getElementById("bcam274");
      return r; });
    eq("el audífono de la tarea abre la Caminata empezando por esa tarea", [F.hay, F.primera], [true, ["Revisar contrato de la bodega", "tHOY"]]);
    eq("sin pendientes no sale el botón", F.sinBoton, true);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) { console.log("FALLAS:\n  " + malas.join("\n  ")); } else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
