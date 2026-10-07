#!/usr/bin/env node
/* PRUEBAS build 277: CAMINATA — «confírmame» / «¿entendiste bien?» (repite la orden y cómo la entendió y espera su sí; no / corrección),
   «deshazlo» / «cancela eso» / «retrocede» / frases sueltas y la acción "deshacer" de la IA, «repíteme» y «regresa un poco»,
   y el ícono chico de caminata junto al ⋯ del home (sin barra grande ni audífono). Mismos mocks que b276. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión = 277", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1], 277);
eq("sw.js con versión build 277", /var SW_VERSION = 'build 277'/.test(fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8")), true);
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

    /* ---------- 0 · comandos (sin voz) ---------- */
    var Z = await p.evaluate(function () {
      var F = ["deshazlo", "cancela eso", "retrocede", "no, deshazlo, la juntaste con otra", "esa no era", "la vinculaste mal", "regresa un poco", "regrésate tantito", "más atrás",
        "repíteme", "repite", "regresa", "¿entendiste bien?", "confírmame", "dile a Rubén que hay que deshacer el muro", "anula la factura de Rubén", "no lo deshagas", "cancela la cita con Rubén"];
      return { cmd: F.map(function (f) { return camComando274(f); }),
        pide: [camPideConf277("Júntala con Vestidores, ¿entendiste bien?"), camPideConf277("la de huella confírmame"), camPideConf277("Júntala con Vestidores")],
        sin: camSinConf277("Júntala con Vestidores, ¿entendiste bien?") }; });
    eq("comandos: deshacer · regresa un poco · repíteme · ¿entendiste? (y órdenes que NO son deshacer)", Z.cmd,
      ["deshaz", "deshaz", "deshaz", "deshaz", "deshaz", "deshaz", "rebobina", "rebobina", "rebobina", "ultimo", "repite", "deshaz", "entendiste", "entendiste", "", "", "", ""]);
    eq("detecta el pedido de confirmación dentro de la orden", Z.pide, [true, true, false]);
    eq("lo que dijo sin el «¿entendiste bien?»", Z.sin, "Júntala con Vestidores");

    /* ---------- 1 · home: ícono chico junto al ⋯, sin barra grande ni audífono ---------- */
    var A = await p.evaluate(function () {
      home(fx6()); var b = document.getElementById("bcam274");
      return { enEnc: !!(b && b.closest("#enc .r1")), sig: b && b.nextElementSibling ? b.nextElementSibling.id : "", svg: !!(b && b.querySelector("svg")), texto: b ? b.textContent.trim() : null,
        barra: !!document.querySelector(".cam274b"), audif: !!document.getElementById("bttlee"), aria: b && b.getAttribute("aria-label") }; });
    eq("ícono de caminata en el encabezado, justo antes del ⋯", [A.enEnc, A.sig, A.svg, A.texto], [true, "bhmas", true, ""]);
    eq("sin barra grande ni audífono en el título de la sección", [A.barra, A.audif], [false, false]);
    eq("el total va en el aria-label", A.aria, "Caminata: 6 pendientes en voz");
    /* 277b: silueta SÓLIDA en zancada (cabeza rellena, trazo grueso), ya no la de línea delgada */
    var S = await p.evaluate(function () { var v = document.querySelector("#bcam274 svg"), c = v && v.querySelector("circle");
      var ws = [].map.call(v ? v.querySelectorAll("path") : [], function (e) { return +e.getAttribute("stroke-width"); });
      return { cabeza: c ? c.getAttribute("fill") : null, minTrazo: Math.min.apply(null, ws), color: v ? v.getAttribute("stroke") : null, caja: v ? [v.getAttribute("viewBox"), v.getAttribute("width")] : null }; });
    eq("ícono sólido: cabeza rellena, trazo ≥ 2.5, currentColor, misma caja 24/22", [S.cabeza, S.minTrazo >= 2.5, S.color, S.caja], ["currentColor", true, "currentColor", ["0 0 24 24", "22"]]);
    await foto("277-home.png");

    /* ---------- 2 · «confírmame»: repite, NO ejecuta; «no» no hace nada; la siguiente también se confirma; «sí» ejecuta ---------- */
    var B = await p.evaluate(async function () {
      var r = {}; window.__nivel276 = 0.2;
      document.getElementById("bcam274").click(); await esp2();
      __iaMap["la de huella confírmame"] = { accion: "aprobar", texto_para_tarea: "Va con el ZKTeco de huella.", respuesta_hablada: "Listo." };
      var d0 = __dichos.length; di("la de huella confírmame", true); di("terminé", true);
      await hasta(function () { return CAM.conf && !!srViva() && !hablando(); }, 5000);
      r.conf = dichos(d0); r.sinEjecutar = !tid("tDEC").decision.respuesta;
      var d1 = __dichos.length; di("no", true);
      await hasta(function () { return __dichos.length > d1 && !!srViva() && !hablando(); }, 5000);
      r.no = dichos(d1); r.sigueSin = !tid("tDEC").decision.respuesta && !CAM.conf;
      __iaMap["la de tarjeta"] = { accion: "aprobar", texto_para_tarea: "Va con el Steren de tarjeta.", respuesta_hablada: "Listo." };
      var d2 = __dichos.length; di("la de tarjeta", true); di("terminé", true);
      await hasta(function () { return CAM.conf && !!srViva() && !hablando(); }, 5000);
      r.conf2 = dichos(d2);
      di("sí", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Llamar a Rogelio por la cotización"; }, 5000);
      r.hecho = tid("tDEC").decision.respuesta ? tid("tDEC").decision.respuesta.t : null;
      return r; });
    eq("confírmame: repite lo que dijo, cómo lo entendió y pregunta", B.conf,
      ["Me dijiste: la de huella.", "Entendí: contestar la decisión de Reloj checador: Va con el ZKTeco de huella.", "¿Lo hago? Dime sí o no."]);
    eq("…y NO ejecuta todavía", B.sinEjecutar, true);
    eq("«no»: no hace nada y pide la orden otra vez", [["Va, no hice nada. Dímelo otra vez.", "Sale, no lo hago. ¿Cómo sería?"].indexOf(B.no[0]) >= 0, B.sigueSin], [true, true]);
    eq("la orden que sigue al «no» también se confirma", B.conf2, ["Me dijiste: la de tarjeta.", "Entendí: contestar la decisión de Reloj checador: Va con el Steren de tarjeta.", "¿Lo hago?"]);
    eq("«sí»: ahora sí se ejecuta", B.hecho, "Va con el Steren de tarjeta.");

    /* ---------- 3 · «¿qué hiciste?» y «no, deshazlo, la juntaste con otra» ---------- */
    var C = await p.evaluate(async function () {
      var r = {}; await esp2();
      var d0 = __dichos.length; di("qué hiciste", true);
      await hasta(function () { return __dichos.length >= d0 + 2 && !!srViva() && !hablando(); }, 5000);
      r.que = dichos(d0);
      var d1 = __dichos.length; di("no, deshazlo, la juntaste con otra", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Reloj checador" && !!srViva() && !hablando(); }, 5000);
      r.undo = dichos(d1)[0]; r.sinResp = !tid("tDEC").decision.respuesta;
      return r; });
    eq("«¿qué hiciste?» dice lo último que hizo", C.que, ["Lo último que hice: contestar la decisión de Reloj checador: Va con el Steren de tarjeta.", "Si está mal, di deshazlo."]);
    eq("frase natural de deshacer: lo deshace y lo dice", [["Va, lo deshice.", "Listo, lo regresé.", "Sale, como estaba."].indexOf(C.undo) >= 0, C.sinResp], [true, true]);

    /* ---------- 4 · la IA entiende "deshacer" ("no oye esa no era la buena") ---------- */
    var D = await p.evaluate(async function () {
      var r = {};
      __iaMap["la de huella"] = { accion: "aprobar", texto_para_tarea: "Va con el ZKTeco de huella.", respuesta_hablada: "Listo." };
      di("la de huella", true); di("terminé", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Llamar a Rogelio por la cotización"; }, 5000);
      r.antes = tid("tDEC").decision.respuesta ? tid("tDEC").decision.respuesta.t : null;
      await esp2();
      __iaMap["oye esa no era la buena"] = { accion: "deshacer", respuesta_hablada: "" };
      di("oye esa no era la buena", true); di("terminé", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Reloj checador"; }, 5000);
      r.despues = !tid("tDEC").decision.respuesta;
      var ia = __ia.filter(function (x) { return /LO QUE DIJO/.test(x.c); }).slice(-1)[0];
      r.prompt = /- deshacer:/.test(ia.c) && /pide_confirmar/.test(ia.c);
      return r; });
    eq("la IA devuelve deshacer y se deshace", [D.antes, D.despues], ["Va con el ZKTeco de huella.", true]);
    eq("el prompt trae la acción deshacer y pide_confirmar", D.prompt, true);

    /* ---------- 5 · vincular a la tarea equivocada y «cancela eso» ---------- */
    var E = await p.evaluate(async function () {
      var r = {}; await esp2();
      CAM.i = CAM.L.indexOf("tNUE"); camPresenta274(); await esp2();
      var nV = tid("tVES").msgs.length;
      __iaMap["júntala con vestidores"] = { accion: "vincular", destino: "tVES", texto_para_tarea: "", respuesta_hablada: "Hecho, la junté." };
      di("júntala con vestidores", true); di("terminé", true);
      await hasta(function () { return document.getElementById("c274tit").textContent !== "Cotizar cámaras extra"; }, 5000);
      var tn = tid("tNUE"); r.junto = [tid("tVES").msgs.length > nV, !tn || !!tn.fusionada_en || !_camVivo(tn)];
      await esp2();
      var d1 = __dichos.length; di("cancela eso", true);
      await hasta(function () { return document.getElementById("c274tit").textContent === "Cotizar cámaras extra" && !!srViva() && !hablando(); }, 5000);
      r.undo = dichos(d1)[0];
      var tn2 = tid("tNUE"); r.regreso = [tid("tVES").msgs.length === nV, !!tn2 && !tn2.fusionada_en, !!tn2 && esPropuesta256(tn2)];
      return r; });
    eq("vinculó (a la equivocada)", E.junto, [true, true]);
    eq("«cancela eso» (aunque ya esté en el cuestionario de la siguiente) lo deshace", ["Va, lo deshice.", "Listo, lo regresé.", "Sale, como estaba."].indexOf(E.undo) >= 0, true);
    eq("…y las dos tareas quedan como estaban", E.regreso, [true, true, true]);

    /* ---------- 6 · mensaje por acomodar con «confírmame» ---------- */
    var F = await p.evaluate(async function () {
      var r = {};
      CAM.i = CAM.L.filter(function (k) { return /^msg:tVES/.test(k); }).map(function (k) { return CAM.L.indexOf(k); })[0]; camPresenta274(); await esp2();
      var d0 = __dichos.length; di("a comedor confírmame", true); di("terminé", true);
      await hasta(function () { return CAM.conf && !!srViva() && !hablando(); }, 5000);
      r.conf = dichos(d0);
      r.sinMover = !tid("tCOM").msgs.some(function (m) { return /lockers/.test(m.t); });
      di("correcto", true);
      await hasta(function () { return tid("tCOM").msgs.some(function (m) { return /lockers/.test(m.t); }); }, 5000);
      r.movido = true;
      return r; });
    eq("mensaje: repite y pregunta antes de moverlo", F.conf, ["Me dijiste: a comedor.", "Entendí: mandar el mensaje de Josué Treviño a la tarea Comedor.", "¿Lo hago?"]);
    eq("…no lo movió antes del sí; con «correcto» sí", [F.sinMover, F.movido], [true, true]);

    /* ---------- 7 · «regrésate un poco» y «repíteme» a media lectura ---------- */
    var G = await p.evaluate(async function () {
      var r = {}; window.__lento = 600;
      CAM.i = CAM.L.indexOf("tDEC"); camPresenta274(true);
      await hasta(function () { return hablando() && !!srBarge() && CAM.rest && CAM.rest.k >= 3; }, 6000);
      var R = CAM.rest, esp = R.G.slice(R.k - 2, R.k + 1).map(function (x) { return x.t; }), d0 = __dichos.length;
      diB("regrésate un poco", true);
      await hasta(function () { return __dichos.length >= d0 + 3; }, 5000);
      r.reb = [dichos(d0).slice(0, 3), esp];
      await hasta(function () { return hablando() && !!srBarge() && CAM.rest && CAM.rest.k >= 1; }, 5000);
      var R2 = CAM.rest, esp2_ = [R2.G[R2.k - 1].t, R2.G[R2.k].t], d1 = __dichos.length;
      diB("repíteme", true);
      await hasta(function () { return __dichos.length >= d1 + 2; }, 5000);
      r.rep = [dichos(d1).slice(0, 2), esp2_];
      window.__lento = 5; camSal274(false);
      return r; });
    eq("«regrésate un poco» relee desde dos frases antes", G.reb[0], G.reb[1]);
    eq("«repíteme» repite lo último (la anterior y la que iba)", G.rep[0], G.rep[1]);
    await foto("277-caminata.png");
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) { console.log("FALLAS:\n  " + malas.join("\n  ")); } else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
