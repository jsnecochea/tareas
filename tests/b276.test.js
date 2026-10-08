#!/usr/bin/env node
/* PRUEBAS build 276: CAMINATA CON INTERRUPCIÓN Y BANDEJA LIMPIA — interrupción a media frase (espera / sigue / repíteme lo último /
   a ver voy / respuesta), que no se escuche a sí misma (eco y volumen), iOS que corta la voz al abrir el micrófono (se apaga sola),
   orden completo, cuestionario tras acomodar una tarea nueva, ficha Falta con cuestionario, mensajes con 2 candidatas y el cierre.
   Mocks de voz (con duración y cancel), micrófono, nivel de volumen e IA. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 276", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 276, true);   /* build 277: sube con cada build */
eq("sw.js con versión >= 276", +((fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8").match(/var SW_VERSION = 'build (\d+)'/) || [0, 0])[1]) >= 276, true);
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
    /* build 276: cada frase dura __lento ms (5 por omisión); cancel() la corta con onerror "interrupted" como el navegador */
    window.__lento = 5; window.__vivas = []; window.__cancels = 0;
    var SS = { speaking: false, pending: false, getVoices: function () { return VOCES; }, addEventListener: function () {},
      cancel: function () { window.__cancels++; var L = window.__vivas; window.__vivas = []; L.forEach(function (o) { clearTimeout(o.to); o.d.cortada = true; setTimeout(function () { if (o.u.onerror) o.u.onerror({ error: "interrupted" }); }, 0); }); },
      speak: function (u) { var d = { t: u.text, voz: u.voice ? u.voice.name : "", pitch: u.pitch, rate: u.rate, vol: u.volume }; window.__dichos.push(d);
        var o = { u: u, d: d }; o.to = setTimeout(function () { window.__vivas = window.__vivas.filter(function (z) { return z !== o; }); if (u.onend) u.onend({}); }, window.__lento); window.__vivas.push(o);
        if (window.__iosCorta && window.srBarge && window.srBarge()) { setTimeout(function () { SS.cancel(); window.__cancels--; }, 30); } } };   /* iOS: con el micrófono abierto la voz se corta sola */
    try { Object.defineProperty(window, "speechSynthesis", { value: SS, configurable: true }); } catch (e) { window.speechSynthesis = SS; }
    /* ---- mock de reconocimiento: __srs guarda cada sesión del motor; di(texto, final) emite en la sesión viva ---- */
    window.__srs = [];
    function SR() { this.fin = []; this.inter = ""; this.vivo = false; }
    SR.prototype.start = function () { this.vivo = true; window.__srs.push(this); };
    SR.prototype.stop = SR.prototype.abort = function () { var s = this; if (!s.vivo) return; s.vivo = false; setTimeout(function () { if (s.onend) s.onend(); }, 0); };
    window.SpeechRecognition = window.webkitSpeechRecognition = SR;
    window.srViva = function () { for (var i = window.__srs.length - 1; i >= 0; i--) if (window.__srs[i].vivo && !window.__srs[i].__barge) return window.__srs[i]; return null; };   /* build 276: el reconocedor de interrupción (mientras habla) no cuenta */
    window.srBarge = function () { for (var i = window.__srs.length - 1; i >= 0; i--) if (window.__srs[i].vivo && window.__srs[i].__barge) return window.__srs[i]; return null; };
    window.diB = function (txt, fin) { var s = srBarge(); if (!s) return false; var r = [{ transcript: txt }]; r.isFinal = !!fin; s.onresult({ resultIndex: 0, results: [r] }); return true; };
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


    /* ---- fixtures 276 + mock de la IA y de completaRevision ---- */
    await p.evaluate(function () {
      var N = Date.now();
      window.fx6 = function () { var L = fx().filter(function (t) { return t.id === "tDEC" || t.id === "tVEN" || t.id === "tHOY"; });
        L.push(T("tLLA", "Llamar a Rogelio por la cotización", { f_vigente: "2026-10-08", resumen: { texto: "Rogelio mandó la cotización del portón. Quedó en ajustar el precio." } }));
        L.push(T("tNUE", "Cotizar cámaras extra", { creada_por: "ia", tipo_elegido: false, autorizada: false, f_vigente: "", fecha_dictada: false, wa_contactos: [{ nombre: "Josué Treviño" }], por_que: "Josué pidió dos cámaras más para el patio.",
          msgs: [{ k: "bi", t: "Josué: oye, faltan dos cámaras para el patio", ts: N - 3600000, h: "09:00", wa_in: 1, wa_c: "Josué Treviño" }] }));
        L.push(T("tFAL", "Pagar renta del local", { f_vigente: "", fecha_dictada: false, falta263: [{ k: "txt", q: "¿Para cuándo la quieres terminar, o es indefinida?", d263: 1 }] }));
        L.push(T("tCOM", "Comedor", { f_vigente: "2026-10-20" }));
        L.push(T("tVES", "Vestidores", { f_vigente: "2026-10-20", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 900000, h: "07:00" },
          { k: "bi", wa_in: 1, wa_c: "Josué Treviño", t: "Josué Treviño: ya llegaron los lockers, ¿dónde los ponemos?", ts: N - 600000, h: "10:00", duda_tarea: { alternativa_id: "tCOM", alternativa_nombre: "Comedor" } }] }));
        L.push(T("tCER", "Cerrajería de la bodega", { f_vigente: "2026-10-21" }));
        L.push(T("tPOR", "Portón eléctrico", { f_vigente: "2026-10-21", msgs: [{ k: "bo", de: "salvador", t: "Va", ts: N - 900000, h: "07:00" },
          { k: "bi", wa_in: 1, wa_c: "Rubén Garza", t: "Rubén Garza: mañana paso a cambiar la chapa del almacén", ts: N - 300000, h: "11:00", duda_tarea: { alternativa_id: "tCER", alternativa_nombre: "Cerrajería de la bodega" } }] }));
        return L; };
      window.tid = function (id) { return tareas.filter(function (x) { return x.id === id; })[0] || null; };
      window.__ia = []; window.__iaMap = {};
      window.preguntaAClaude = function (m, mod, cb) { var c = m[0].content; window.__ia.push({ c: c, mod: mod });
        if (/GUION DE LLAMADA/.test(c)) return setTimeout(function () { cb('{"guion":"Saluda a Rogelio. Pregúntale si ya ajustó el precio."}'); }, 40);
        var q = (c.match(/LO QUE DIJO: “([^”]*)”/) || [])[1] || "", r = window.__iaMap[q];
        setTimeout(function () { cb(r ? JSON.stringify(r) : '{"accion":"instruccion","texto_para_tarea":"' + q + '","respuesta_hablada":"Anotado."}'); }, 120); };
      window.__cr = [];
      window.completaRevision = function (t, v, op) { window.__cr.push([t.id, v, !!(op && op.sinRevision), !!(op && op.alTerminar)]); setTimeout(function () { if (op && op.alTerminar) op.alTerminar({ hecho: [], dudas: [], vinc: [], falta: [] }); }, 10); };
      window.esp2 = async function () { await hasta(function () { return !!srViva(); }, 6000); await espera(20); };
      window.hablando = function () { return CAM.fase === "hablando"; };
    });

    /* ---------- 1 · orden completo y frase de arranque ---------- */
    var A = await p.evaluate(async function () {
      home(fx6()); var C = camLista276(), r = {};
      r.grupos = C.L.map(function (id) { return [id.replace(/\|\d+$/, ""), C.g[id]]; });
      r.boton = document.getElementById("bcam274").getAttribute("aria-label");   /* build 277: ícono chico junto al ⋯ */
      window.__nivel276 = 0.2;
      document.getElementById("bcam274").click(); await espera(30);
      r.resumen = dichos()[0];
      r.barge = !!srBarge() && hablando();
      return r; });
    eq("orden: decisiones · llamadas de mañana · tareas nuevas · ficha Falta · mensajes por acomodar", A.grupos,
      [["tDEC", "dec"], ["tLLA", "lla"], ["tNUE", "nue"], ["tFAL", "fal"], ["msg:tPOR", "msg"], ["msg:tVES", "msg"]]);
    eq("botón con el total", A.boton, "Caminata: 6 pendientes en voz");
    eq("frase de arranque con los 5 grupos", A.resumen, "Tienes 1 decisión, 1 llamada para mañana, 1 tarea nueva, 1 con datos que faltan y 2 mensajes por acomodar. Empezamos.");
    eq("mientras habla, el micrófono de interrupción está abierto", A.barge, true);

    /* ---------- 2 · que no se escuche a sí misma; interrupción a media frase ---------- */
    var B = await p.evaluate(async function () {
      var r = {}; window.__lento = 600;
      await hasta(function () { return hablando() && /Reloj checador/.test(CAM.dicho || "") && !!srBarge(); }, 4000);
      var c0 = __cancels, e0 = window.__eco276 || 0, b0 = window.__bajo276 || 0;
      diB("primera reloj checador", true); await espera(40);                          /* su propia voz (eco) */
      r.eco = [hablando(), __cancels - c0, (window.__eco276 || 0) - e0];
      window.__nivel276 = 0.005; diB("oye una cosa", true); await espera(40);        /* muy bajito: no es Salvador */
      r.bajo = [hablando(), __cancels - c0, (window.__bajo276 || 0) - b0];
      window.__nivel276 = 0.2;
      var cortada = CAM.dicho, d0 = __dichos.length, t0 = performance.now();
      diB("espera", true); await espera(5);
      var dc = __dichos.filter(function (x) { return x.t === cortada; }).slice(-1)[0];
      r.corte = [__cancels - c0 >= 1, !!(dc && dc.cortada), Math.round(performance.now() - t0) < 60];
      await hasta(function () { return !!srViva() && !hablando(); }, 3000);
      r.espera = dichos(d0);
      var d1 = __dichos.length; di("sigue", true);
      await hasta(function () { return __dichos.length > d1; }, 2000);
      r.sigue = [dichos(d1)[0], cortada];
      /* "repíteme lo último" a media frase: repite la anterior y la que iba */
      await hasta(function () { return hablando() && !!srBarge() && CAM.rest && CAM.rest.k >= 2; }, 4000);
      var R = CAM.rest, prev = R.G[R.k - 1].t, cur = R.G[R.k].t, d2 = __dichos.length;
      diB("repíteme lo último", true);
      await hasta(function () { return __dichos.length >= d2 + 2; }, 3000);
      r.ultimo = [dichos(d2).slice(0, 2), [prev, cur]];
      /* "a ver, voy" */
      await hasta(function () { return hablando() && !!srBarge(); }, 3000);
      var d3 = __dichos.length; diB("a ver voy", true);
      await hasta(function () { return !!srViva() && !hablando(); }, 3000);
      r.voy = dichos(d3);
      window.__lento = 5;
      return r; });
    eq("su propia voz NO la interrumpe (se ignora como eco)", B.eco, [true, 0, 1]);
    eq("lo que llega muy bajito NO la interrumpe (umbral de volumen)", B.bajo, [true, 0, 1]);
    eq("'espera' a media frase: se calla al instante", B.corte, [true, true, true]);
    eq("'espera' contesta en el momento y escucha", ["Va, te espero.", "Sale, aquí estoy."].indexOf(B.espera[0]) >= 0 && B.espera.length === 1, true);
    eq("'sigue' retoma la frase que cortó", B.sigue[0], B.sigue[1]);
    eq("'repíteme lo último' repite la frase anterior y la que iba", B.ultimo[0], B.ultimo[1]);
    eq("'a ver, voy' contesta corto y escucha", ["Te escucho.", "Dime."].indexOf(B.voy[0]) >= 0 && B.voy.length === 1, true);

    /* ---------- 3 · interrumpir con la respuesta: lo dicho no se pierde ---------- */
    var C2 = await p.evaluate(async function () {
      var r = {}; window.__lento = 600;
      CAM.limpia = true; camPresenta274(true);
      await hasta(function () { return hablando() && !!srBarge(); }, 3000);
      __iaMap["la de huella está bien"] = { accion: "aprobar", texto_para_tarea: "Va con el ZKTeco de huella.", respuesta_hablada: "Listo, va el de huella." };
      diB("la de huella", false); await espera(10);
      r.corta = [CAM.fase !== "hablando", CAM.buf];
      window.__lento = 5;
      await esp2(); di("está bien", true); di("terminé", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Llamar a Rogelio por la cotización" || (!!tid("tDEC").decision.respuesta && !hablando()); }, 5000);
      var ia = __ia.filter(function (x) { return /LO QUE DIJO/.test(x.c); }).slice(-1)[0];
      r.ia = (ia.c.match(/LO QUE DIJO: “([^”]*)”/) || [])[1];
      r.decision = tid("tDEC").decision.respuesta ? tid("tDEC").decision.respuesta.t : null;
      return r; });
    eq("interrumpe con su respuesta (2 palabras a medias bastan) y lo dicho se queda", C2.corta, [true, "la de huella"]);
    eq("lo de la interrupción + lo que siguió van juntos a la IA", C2.ia, "la de huella está bien");
    eq("y se ejecuta", C2.decision, "Va con el ZKTeco de huella.");

    /* ---------- 4 · llamada (va) y tarea nueva: al acomodarla, el cuestionario de lo que le falta ---------- */
    var D = await p.evaluate(async function () {
      var r = {}; await esp2();
      __iaMap["va"] = { accion: "aprobar", texto_para_tarea: "Va con el guion.", respuesta_hablada: "Va, mañana le llamas." };
      di("va", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Cotizar cámaras extra"; }, 5000); await esp2();
      __iaMap["sí va hazla"] = { accion: "aprobar", texto_para_tarea: "", respuesta_hablada: "Listo, va." };
      var d0 = __dichos.length; di("sí va hazla", true); di("terminé", true);
      await hasta(function () { return CAM.qz && !!srViva() && !hablando(); }, 5000);
      r.qz1 = dichos(d0); r.st = document.getElementById("c274st").textContent;
      r.esTarea = !esPropuesta256(tid("tNUE"));
      var d1 = __dichos.length, n0 = __dichos.length; di("el viernes", true);
      await espera(1500); r.noEnvia1s = __dichos.length === n0;
      await hasta(function () { return __dichos.length > d1 && !!srViva() && !hablando(); }, 5000);
      r.qz2 = dichos(d1);
      var d2 = __dichos.length; di("paso", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Pagar renta del local"; }, 5000);
      r.fin = dichos(d2);
      r.cr = __cr.slice();
      return r; });
    eq("acomodar la tarea nueva: confirma y de inmediato pregunta lo que falta, una a la vez", D.qz1,
      ["Listo, va.", "Le faltan 2 datos.", "Una por una. Si no lo sabes, di paso.", "¿Para cuándo la quieres terminar, o es indefinida?"]);
    eq("quedó como tarea", D.esTarea, true);
    eq("en pantalla: Pregunta 1 de 2", /^Pregunta 1 de 2/.test(D.st), true);
    eq("una respuesta corta se envía sola al callar (sin «¿Terminaste?»), no antes", [D.noEnvia1s, D.qz2.indexOf("¿Terminaste o sigues?") < 0], [true, true]);
    eq("siguiente pregunta con un acuse corto", [["Va.", "Anotado.", "Sale."].indexOf(D.qz2[0]) >= 0, D.qz2[1]], [true, "¿De cuánto es el monto?"]);
    eq("'paso' la deja pendiente y al terminar dice qué datos quedaron", D.fin[0], "Quedó pendiente: el monto.");
    eq("lo contestado va a la tarea (completaRevision, sin esperar)", D.cr, [["tNUE", "Respuesta a «¿Para cuándo la quieres terminar, o es indefinida?»: el viernes.", true, true]]);

    /* ---------- 5 · ficha roja Falta: el mismo cuestionario ---------- */
    var E = await p.evaluate(async function () {
      var r = {}; await esp2(); r.intro = dichos().slice(-5);
      var d0 = __dichos.length; di("el 15 de octubre", true); di("terminé", true);
      await hasta(function () { return __dichos.length > d0 && !!srViva() && !hablando(); }, 5000);
      r.q2 = dichos(d0);
      var d1 = __dichos.length; di("son 12 mil pesos", true); di("terminé", true);
      await hasta(function () { return /^Mensaje de /.test(document.getElementById("c274tit").textContent) && !!srViva() && !hablando(); }, 5000);
      r.fin = dichos(d1); r.cr = __cr.slice(1);
      return r; });
    eq("ficha Falta: nombre, cuántas preguntas y la primera", E.intro.slice(-3).map(function (x) { return x.replace(/^(Le faltan datos a|Sigue|Ahora): /, "X: "); }),
      ["X: Pagar renta del local.", "Son 2 preguntas.", "¿Para cuándo la quieres terminar, o es indefinida?"]);
    eq("segunda pregunta: el monto", E.q2.slice(-1)[0], "¿De cuánto es el monto?");
    eq("todo contestado: lo dice", ["Listo, ya tiene todo.", "Quedó completa."].indexOf(E.fin.filter(function (x) { return !/^(Va|Anotado|Sale)\.$/.test(x); })[0]) >= 0, true);
    eq("las dos respuestas juntas a la tarea", E.cr, [["tFAL", "Respuesta a «¿Para cuándo la quieres terminar, o es indefinida?»: el 15 de octubre. Respuesta a «¿De cuánto es el monto?»: son 12 mil pesos.", true, true]]);

    /* ---------- 6 · mensajes por acomodar: quién, qué dice y 2 candidatas; contesta libre ---------- */
    var F = await p.evaluate(async function () {
      var r = {}; r.m1 = dichos().slice(-4);
      var n0 = __ia.length, d0 = __dichos.length; di("la segunda", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Mensaje de Josué Treviño" && !!srViva() && !hablando(); }, 5000);
      r.local = [__ia.length - n0, dichos(d0)[0]];
      var x = tid("tPOR").msgs[1]; r.movido = [!!x.oculto, (tid("tCER").msgs || []).some(function (m) { return /chapa del almacén/.test(m.t || ""); })];
      r.m2 = dichos().slice(-3);
      __iaMap["eso es para donde comen los muchachos"] = { accion: "a_tarea", destino: "tCOM", respuesta_hablada: "Listo, a Comedor." };
      di("eso es para donde comen los muchachos", true); di("terminé", true);
      await hasta(function () { return !CAM.on; }, 6000);
      var ia = __ia.slice(-1)[0].c; r.prompt = [/LAS 2 MÁS PROBABLES:\n1\) tVES · Vestidores\n2\) tCOM · Comedor/.test(ia), __ia.slice(-1)[0].mod];
      r.com = (tid("tCOM").msgs || []).some(function (m) { return /lockers/.test(m.t || ""); });
      r.fin = dichos().slice(-2);
      return r; });
    eq("mensaje: quién, qué dice en una línea y las 2 tareas más probables", [F.m1[F.m1.length - 3].replace(/^(Y ahora, los mensajes por acomodar\.|Ahora los mensajes sin tarea\.)$/, "G"), F.m1.slice(-2)],
      ["Mensaje de Rubén Garza.", ["Dice: mañana paso a cambiar la chapa del almacén.", "¿Va a Portón eléctrico o a Cerrajería de la bodega?"]]);
    eq("'la segunda' se aplica sin IA y lo confirma corto", [F.local[0], F.local[1].toLowerCase()], [0, "listo, a cerrajería de la bodega."]);
    eq("y el mensaje pasa a esa tarea", F.movido, [true, true]);
    eq("segundo mensaje con su par de candidatas", F.m2.slice(-1)[0], "¿Va a Vestidores o a Comedor?");
    eq("respuesta libre: la IA (rápida) con las 2 candidatas decide", F.prompt, [true, "rapido"]);
    eq("y se mueve a Comedor", F.com, true);
    eq("cierre: quedó lo pendiente del cuestionario", F.fin.slice(-1)[0].toLowerCase(), "quedó 1 pendiente: el monto de cotizar cámaras extra.");

    /* ---------- 7 · bandeja limpia ---------- */
    var G = await p.evaluate(async function () {
      home(fx6().filter(function (t) { return ["tDEC", "tCOM"].indexOf(t.id) >= 0; })); __iaMap["va"] = { accion: "aprobar", texto_para_tarea: "Va.", respuesta_hablada: "Listo." };
      camEmpieza274(); await esp2(); di("va", true);
      await hasta(function () { return !CAM.on; }, 5000);
      return dichos().slice(-1)[0]; });
    eq("todo resuelto: «Bandeja limpia.»", G, "Bandeja limpia.");

    /* ---------- 8 · iOS: si la voz se corta al abrir el micrófono, se apaga la interrupción y repite la frase ---------- */
    var H = await p.evaluate(async function () {
      home(fx6()); window.__iosCorta = true; window.__lento = 200; var r = {};
      var d0 = __dichos.length; camEmpieza274(); await hasta(function () { return window.__barge276 && window.__barge276.off; }, 3000);
      window.__iosCorta = false;
      await hasta(function () { return !!srViva(); }, 6000); await espera(30);
      var D = dichos(d0); r.D = D.slice(0, 3); r.repite = D[0] === D[1] && /^Tienes /.test(D[0]);
      r.off = [window.__barge276.off, /se cortó/.test(window.__barge276.por), CAM.bargeNo];
      r.sinBarge = __srs.filter(function (s) { return s.__barge; }).length;
      var n = r.sinBarge; CAM.limpia = true; camPresenta274(true); await hasta(function () { return hablando(); }, 2000); await espera(50);
      r.despues = __srs.filter(function (s) { return s.__barge; }).length === n;
      /* tocar el círculo interrumpe */
      document.getElementById("c274o").click(); await espera(20);
      r.toca = [CAM.fase, !!srViva()];
      window.__lento = 5; camSal274(false);
      return r; });
    eq("iOS: la frase cortada se repite con el micrófono cerrado", [H.repite, H.D], [true, H.D]);
    eq("iOS: interrupción apagada en la sesión con el motivo", H.off, [true, true, true]);
    eq("iOS: ya no se abre el micrófono mientras habla", H.despues, true);
    eq("respaldo: tocar el círculo interrumpe y escucha", H.toca, ["escuchando", true]);
    await foto("276-caminata.png");
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) { console.log("FALLAS:\n  " + malas.join("\n  ")); } else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
