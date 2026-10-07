#!/usr/bin/env node
/* PRUEBAS build 275: CAMINATA COMO PLÁTICA — orden (decisiones · llamadas de MAÑANA con guion · tareas nuevas de Acomodo), frase de
   arranque, sin menús, respuesta imprecisa -> la IA (mock) decide la acción, se ejecuta SIN reconfirmar, "no, eso no" deshace,
   aclaración con UNA pregunta, "va" se envía al instante, sonido de pensando, IA caída = queda anotado. Mocks de voz, micrófono e IA. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión = 275", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1], 275);
eq("sw.js con versión build 275", /var SW_VERSION = 'build 275'/.test(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")), true);
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

    /* ---- fixtures 275 + mock de la IA ---- */
    await p.evaluate(function () {
      var N = Date.now();
      window.fx5 = function () { var L = fx().filter(function (t) { return t.id === "tDEC" || t.id === "tVEN" || t.id === "tHOY"; });
        L.push(T("tLLA", "Llamar a Rogelio por la cotización", { f_vigente: "2026-10-08", resumen: { texto: "Rogelio mandó la cotización del portón. Quedó en ajustar el precio." } }));
        L.push(T("tLLH", "Llamar a Mario del seguro", { f_vigente: "2026-10-07" }));   /* llamada de HOY: no entra */
        L.push(T("tDEST", "Cámaras de la bodega", { f_vigente: "2026-10-20" }));
        L.push(T("tNUE", "Cotizar cámaras extra", { creada_por: "ia", tipo_elegido: false, autorizada: false, f_vigente: "", wa_contactos: [{ nombre: "Josué Treviño" }], por_que: "Josué pidió dos cámaras más para el patio.",
          msgs: [{ k: "bi", t: "Josué: oye, faltan dos cámaras para el patio", ts: N - 3600000, h: "09:00", wa_in: 1, wa_c: "Josué Treviño" }] }));
        L.push(T("tNUE2", "Teléfono del cerrajero", { creada_por: "ia", tipo_elegido: false, autorizada: false, f_vigente: "", wa_contactos: [{ nombre: "Rubén" }],
          msgs: [{ k: "bi", t: "Rubén: el cerrajero es el 81 1234 5678", ts: N - 7200000, h: "08:00", wa_in: 1, wa_c: "Rubén" }] }));
        return L; };
      window.tid = function (id) { return tareas.filter(function (x) { return x.id === id; })[0] || null; };
      /* la IA: el guion se contesta a los 40 ms; las decisiones según lo que dijo, a los 300 ms */
      window.__ia = []; window.__iaMap = {};
      window.preguntaAClaude = function (m, mod, cb) { var c = m[0].content; window.__ia.push({ c: c, mod: mod, ts: performance.now() });
        if (/GUION DE LLAMADA/.test(c)) return setTimeout(function () { cb('{"guion":"Saluda a Rogelio. Pregúntale si ya ajustó el precio del portón. Que te mande la cotización firmada."}'); }, 40);
        var q = (c.match(/LO QUE DIJO: “([^”]*)”/) || [])[1] || "", r = window.__iaMap[q];
        if (r === "ERR") return setTimeout(function () { cb(null, "Sin conexion."); }, 50);
        setTimeout(function () { cb(r ? "Aquí va: " + JSON.stringify(r) : '{"accion":"instruccion","texto_para_tarea":"' + q + '","respuesta_hablada":"Anotado."}'); }, 300); };
      window.esp2 = async function () { await hasta(function () { return !!srViva(); }, 4000); await espera(20); };
    });

    /* ---------- 1 · orden y frase de arranque ---------- */
    var A = await p.evaluate(async function () {
      home(fx5()); var r = {}, b = document.getElementById("bcam274");
      r.boton = b ? b.querySelector("small").textContent : null;
      var C = camLista275(); r.orden = C.L; r.grupos = C.L.map(function (id) { return C.g[id]; });
      b.click(); await esp2();
      r.dichos = dichos(); r.ia = __ia.map(function (x) { return [/GUION DE LLAMADA/.test(x.c), x.mod]; });
      r.tit = document.getElementById("c274tit").textContent;
      return r; });
    eq("orden: decisión · llamada de MAÑANA · tareas nuevas (sin vencidas, hoy ni llamadas de hoy)", [A.orden, A.grupos], [["tDEC", "tLLA", "tNUE", "tNUE2"], ["dec", "lla", "nue", "nue"]]);
    eq("botón del home con el total", A.boton, "4 pendientes en voz, sin ver la pantalla");
    eq("arranca con UNA frase de resumen", A.dichos[0], "Tienes 1 decisión, 1 llamada para mañana y 2 tareas nuevas. Empezamos.");
    eq("el guion de la llamada se pide a la IA desde el arranque, modo rápido", A.ia, [[true, "rapido"]]);
    eq("primera: la decisión, plantea tema y recomendación", [A.dichos[1], A.dichos.indexOf("Lo que hay que decidir: ¿Cuál reloj compramos?") > 0, A.dichos.some(function (x) { return /^Yo haría: El ZKTeco/.test(x); }), A.tit], ["Primera: Reloj checador.", true, true, "Reloj checador"]);
    eq("NADA de menú: no lee opciones antes de que conteste", A.dichos.some(function (x) { return /más detalle o|la dejamos para después\?|di sí o no|opción uno/i.test(x); }), false);
    eq("pregunta abierta al final", ["¿Qué hacemos?", "¿Cómo la ves?", "¿Qué decides?"].indexOf(A.dichos[A.dichos.length - 1]) >= 0, true);

    /* ---------- 2 · respuesta imprecisa -> IA -> acción, sin reconfirmar; pensando ---------- */
    var B = await p.evaluate(async function () {
      var r = {}, d0 = __dichos.length, n0 = __ia.length, pz = window.__piensa275 || 0;
      __iaMap["pues mira yo creo que el de la huella está bien no"] = { accion: "aprobar", texto_para_tarea: "Va con el ZKTeco de huella.", respuesta_hablada: "Listo, va el de huella." };
      di("pues mira yo creo que el de la huella está bien no", true); await espera(1000);
      r.nada1s = [__ia.length - n0, dichos(d0).length];
      di("terminé", true); await espera(80);
      r.pensando = [CAM.fase, document.getElementById("c274st").textContent, document.getElementById("c274o").className, (window.__piensa275 || 0) > pz, CAM.pensando];
      r.prompt = /LO QUE DIJO: “pues mira yo creo que el de la huella está bien no”/.test(__ia[__ia.length - 1].c) && /"accion"/.test(__ia[__ia.length - 1].c);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Llamar a Rogelio por la cotización"; }, 4000);
      await esp2();
      var t = tid("tDEC"); r.decision = t.decision.respuesta ? t.decision.respuesta.t : null;
      r.dicho = dichos(d0);
      r.sinPiensa = CAM.pensando;
      return r; });
    eq("1 s de silencio sigue sin enviar", B.nada1s, [0, 0]);
    eq("mientras la IA piensa: estado, círculo y sonido", B.pensando, ["pensando", "Pensando…", "c274o piensa", true, true]);
    eq("el texto va tal cual a la IA (sin palabras clave) pidiendo JSON", B.prompt, true);
    eq("ejecuta la acción de la IA: contesta la decisión", B.decision, "Va con el ZKTeco de huella.");
    eq("confirma corto con lo de la IA y sigue, SIN reconfirmar", [B.dicho[0], B.dicho.some(function (x) { return /seguro|confirm|¿es correcto|¿así\?/i.test(x); })], ["Listo, va el de huella.", false]);
    eq("el sonido de pensando se apaga", B.sinPiensa, false);

    /* ---------- 3 · llamada de mañana con su guion; "va" se envía al instante ---------- */
    var C = await p.evaluate(async function () {
      var r = {}, D = dichos(), i = D.lastIndexOf("Listo, va el de huella.");
      r.llamada = D.slice(i + 1);
      var t = tid("tLLA"), g = (t.msgs || []).filter(function (m) { return /^IA: Guion de llamada: /.test(m.t); });
      r.hilo = [g.length, g[0] && g[0].nota_ia, t.guion_llamada && t.guion_llamada.t];
      __iaMap["va"] = { accion: "aprobar", texto_para_tarea: "Va con el guion, mañana le llama.", respuesta_hablada: "Va, mañana le llamas." };
      var n0 = __ia.length, t0 = performance.now(); di("va", true);
      await hasta(function () { return __ia.length > n0; }, 2000); r.alInstante = Math.round(performance.now() - t0) < 400;
      await hasta(function () { return document.getElementById("c274tit").textContent === "Cotizar cámaras extra"; }, 4000); await esp2();
      r.nota = mio("tLLA").map(function (m) { return [m[0], m[4]]; });
      return r; });
    eq("la llamada: entrada, 'Guion de llamada.' y el guion de la IA en frases cortas", C.llamada.slice(0, 5).filter(function (x) { return !/^Ahora|^Vamos/.test(x); }).slice(1, 4), ["Guion de llamada.", "Saluda a Rogelio.", "Pregúntale si ya ajustó el precio del portón."]);
    eq("el guion queda en el hilo como 'IA: Guion de llamada: …' (nota IA) y en la tarea", C.hilo, [1, 1, "Saluda a Rogelio. Pregúntale si ya ajustó el precio del portón. Que te mande la cotización firmada."]);
    eq("'va' dicho solo se envía al instante (sin esperar 2.5 s ni 'terminé')", C.alInstante, true);
    eq("y queda anotado en la llamada", C.nota, [["Va con el guion, mañana le llama.", true]]);

    /* ---------- 4 · tarea nueva: vincular por nombre impreciso, deshacer, eliminar ---------- */
    var E = await p.evaluate(async function () {
      var r = {}, d0 = __dichos.length, nDest = tid("tDEST").msgs.length;
      r.nueva = dichos(d0 - 8).filter(function (x) { return /tareas nuevas|Cotizar cámaras extra|Josué|patio/.test(x); });
      __iaMap["esa júntala con lo de las cámaras de la bodega"] = { accion: "vincular", destino: "camaras de la bodega", texto_para_tarea: "", respuesta_hablada: "Listo, la junté con cámaras." };
      di("esa júntala con lo de las cámaras de la bodega", true); di("terminé", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Teléfono del cerrajero"; }, 4000); await esp2();
      r.vinc = [!tid("tNUE"), tid("tDEST").msgs.length > nDest, vista, abierta];
      var d1 = __dichos.length; di("no, eso no", true);
      await hasta(function () { return document.getElementById("c274tit").textContent.toLowerCase() === "cotizar cámaras extra" && dichos(d1).some(function (x) { return /Cotizar cámaras extra/.test(x); }); }, 4000); await esp2();
      var t = tid("tNUE"); r.undo = [!!t, t && !t.fusionada_en, t && esPropuesta256(t), tid("tDEST").msgs.length === nDest, dichos(d1).slice(0, 2)];
      __iaMap["elimínala ya no sirve"] = { accion: "eliminar", texto_para_tarea: "No sirve.", respuesta_hablada: "Listo, eliminada." };
      di("elimínala ya no sirve", true); di("terminé", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Teléfono del cerrajero"; }, 4000); await esp2();
      r.elim = [!tid("tNUE"), CAM.ult && CAM.ult.a];
      return r; });
    eq("tarea nueva: se presenta con su origen", E.nueva.length >= 2, true);
    eq("'júntala con lo de las cámaras…' (nombre impreciso) la vincula y la caminata no se mueve de vista", E.vinc, [true, true, "lista", null]);
    eq("'no, eso no' deshace y vuelve a esa tarea", [E.undo[0], E.undo[1], E.undo[2], E.undo[3]], [true, true, true, true]);
    eq("al deshacer lo dice corto y vuelve a presentarla", [["Va, lo deshice.", "Listo, lo regresé.", "Sale, como estaba."].indexOf(E.undo[4][0]) >= 0, /^(Otra vez|De nuevo): Cotizar cámaras extra\.$/i.test(E.undo[4][1])], [true, true]);
    eq("'elimínala' la descarta", E.elim, [true, "eliminar"]);

    /* ---------- 5 · aclaración: UNA pregunta y lo nuevo va junto con lo de antes; luego dato y fin ---------- */
    var F = await p.evaluate(async function () {
      var r = {}, d0 = __dichos.length;
      __iaMap["lo de la cosa esa"] = { accion: "aclarar", respuesta_hablada: "¿Es tarea o solo un dato?" };
      __iaMap["lo de la cosa esa. dato nomás"] = { accion: "dato", texto_para_tarea: "", respuesta_hablada: "Va, queda como dato." };
      di("lo de la cosa esa", true); di("terminé", true);
      await hasta(function () { return dichos(d0).indexOf("¿Es tarea o solo un dato?") >= 0; }, 4000); await esp2();
      r.pregunta = [dichos(d0), document.getElementById("c274tit").textContent];
      di("dato nomás", true); di("terminé", true);
      await hasta(function () { return !CAM.on; }, 4000);
      var t = tid("tNUE2"); r.dato = [t.tipo_item, t.es_dato, t.tipo_elegido];
      r.fin = dichos(d0).slice(-1)[0];
      return r; });
    eq("aclarar: UNA pregunta concreta y se queda en la tarea", F.pregunta, [["¿Es tarea o solo un dato?"], "Teléfono del cerrajero"]);
    eq("la respuesta a la aclaración va junto con lo de antes -> dato", F.dato, ["dato", true, true]);
    eq("al final: frase corta con lo resuelto", /^(Eso es todo\.|Listo, terminamos\.|Ya quedó todo\.) Resolvimos 4\.$/.test(F.fin), true);

    /* ---------- 6 · IA caída: no se pierde; mecánica del 274 intacta (2.5 s pregunta, pausa, salir) ---------- */
    var G = await p.evaluate(async function () {
      var r = {}; home(fx5()); camEmpieza274("tHOY"); await esp2();
      __iaMap["revisa la cláusula de renta"] = "ERR";
      var d0 = __dichos.length;
      di("revisa la cláusula de renta", true);
      await hasta(function () { return dichos(d0).indexOf("¿Terminaste o sigues?") >= 0; }, 4000); await esp2();
      r.check = dichos(d0);
      di("listo", true);
      await hasta(function () { return dichos(d0).indexOf("No me contestó la IA. Lo dejé anotado para Claude.") >= 0; }, 4000); await esp2();
      r.caida = mio("tHOY").map(function (m) { return [m[0], m[4]]; });
      var d1 = __dichos.length; di("pausa", true); await espera(150);
      r.pausa = [CAM.pausa, !!srViva(), dichos(d1)];
      document.getElementById("c274p").click(); await esp2();
      di("salir", true); await espera(200);
      r.salir = [!!document.getElementById("cam274"), CAM.on];
      return r; });
    eq("2.5 s callado con algo dicho: '¿Terminaste o sigues?' (274)", G.check, ["¿Terminaste o sigues?"]);
    eq("IA caída: queda anotado para Claude y lo dice", G.caida, [["revisa la cláusula de renta", true]]);
    eq("pausa y salir siguen igual (274)", [G.pausa, G.salir], [[true, false, ["En pausa."]], [false, false]]);
    await foto("275-caminata.png");
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) { console.log("FALLAS:\n  " + malas.join("\n  ")); } else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
