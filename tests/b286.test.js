#!/usr/bin/env node
/* PRUEBAS build 286 (Caminata 8-oct: testamentos, reloj, ICOSA): todo lo que Salvador dice dentro de una tarea en la Caminata
   se guarda PRIMERO como orden pendiente (t.encargos, tipo "orden", origen app283, caminata:1) ANTES de llamar a la IA.
   La IA solo clasifica y aplica lo rápido; «aclarar», una instrucción de trabajo, la IA caída o un «No» a «¿Lo hago?» nunca
   descartan la orden: queda viva para la Mac. La orden se guarda con merge SOLO del campo encargos (no toca el nombre).
   Correr: node tests/b286.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 286", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 286, true);
eq("sw.js con versión >= 286", +((fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8").match(/var SW_VERSION = 'build (\d+)'/) || [0, 0])[1]) >= 286, true);
eq("camEnvia274: la orden se escribe antes de la IA y de la confirmación", /camCrudo276\(t, v\);[^\n]*\n\s*camOrden286\(t, v\);[^\n]*\n\s*if\(CAM\.conf\) return camConfResp277\(v\);/.test(html), true);
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

    await p.evaluate(function () {
      window.tid = function (id) { return tareas.filter(function (x) { return x.id === id; })[0] || null; };
      window.__cr = []; window.__ia = [];
      window.completaRevision = function (t, v, op) { window.__cr.push([t.id, v]); };
      /* modelo: j fijo; al llamarse anota si la tarea YA tenía la orden pendiente guardada */
      window.modelo = function (j, ms) { window.preguntaAClaude = function (m, mod, cb) {
        var T = tid(CAM.L[CAM.i]), ya = !!(T && (T.encargos || []).some(function (e) { return e.caminata && e.estado === "pendiente"; }));
        var subio = window.__esp.some(function (e) { return e[1] && e[1].encargos && e[2] && e[2].merge && Object.keys(e[1]).length === 1; });
        window.__ia.push({ ya: ya, subio: subio });
        setTimeout(function () { if (j === "caido") cb(null, "No contesto a tiempo."); else cb(JSON.stringify(j)); }, ms || 20); }; };
      window.ords = function (id) { return (tid(id).encargos || []).filter(function (e) { return e.caminata; }).map(function (e) { return { t: e.t, estado: e.estado, motivo: e.motivo === "caminata286" ? (e.motivos286 || []).slice(-1)[0] || "" : e.motivo, tipo: e.tipo, origen: e.origen, pd: !!e.preguntar_despues, ent: e.entendi || "", res: e.resultado || "" }; }); };
      window.dile = async function (id, k, v) { CAM.on = true; if (CAM.L[0] !== id) { CAM.L = [id]; CAM.i = 0; } CAM.g = {}; CAM.g[id] = k; CAM.buf = v; CAM.par = ""; window.camSiguiente274 = function () {}; camEnvia274(); await espera(250); };
    });
    /* 1 · Caso reloj: «dame el link» = instrucción de TRABAJO → orden guardada ANTES de la IA y sigue pendiente para la Mac */
    var A = await p.evaluate(async function () {
      home([T("tREL", "Reloj checador", { resumen: { texto: "Se cotizaron dos relojes; Cynthia mandó opciones.", que_toca: "Escoger el reloj" } })]);
      window.__esp = []; window.__ia = [];
      modelo({ accion: "instruccion", texto_para_tarea: "Sigue; Salvador lo compra. Mandarle el link del que se ve en el celular.", respuesta_hablada: "Va, te busco el link." });
      await dile("tREL", "dec", "sigue yo lo compro dame el link del que se ve en el celular");
      var r = { o: ords("tREL"), ia: window.__ia.slice(), nombre: tid("tREL").nombre };
      CAM.on = false; return r; });
    eq("reloj: la orden ya existía y ya se había subido (merge solo encargos) cuando se llamó a la IA", A.ia, [{ ya: true, subio: true }]);
    eq("reloj: una orden, pendiente para la Mac por ser instrucción de trabajo", A.o.map(function (o) { return [o.t, o.estado, o.motivo, o.tipo, o.origen]; }),
      [["sigue yo lo compro dame el link del que se ve en el celular", "pendiente", "instruccion", "orden", "app283"]]);
    /* 2 · «aclarar» no descarta: queda pendiente con preguntar_despues; lo que contesta se suma a la MISMA orden */
    var B = await p.evaluate(async function () {
      home([T("tTES", "Testamentos", { resumen: { texto: "Cynthia mandó los borradores.", que_toca: "Revisar borradores" } })]);
      modelo({ accion: "aclarar", texto_para_tarea: "", respuesta_hablada: "¿Revisarlos contra qué?" });
      await dile("tTES", "dec", "revísalos contra lo que yo dicté y dime si están bien");
      var o1 = ords("tTES");
      modelo({ accion: "instruccion", texto_para_tarea: "Revisar los borradores contra lo dictado y avisar.", respuesta_hablada: "Va." });
      await dile("tTES", "dec", "contra lo que dicté en la tarea del fideicomiso");
      var r = { o1: o1, o2: ords("tTES") }; CAM.on = false; return r; });
    eq("aclarar: la orden queda viva, para preguntarle después", B.o1.map(function (o) { return [o.estado, o.motivo, o.pd]; }), [["pendiente", "aclarar", true]]);
    eq("aclarar: su respuesta se suma a la misma orden (no se duplica) y sigue para la Mac", B.o2.map(function (o) { return [o.t, o.estado, o.motivo]; }),
      [["revísalos contra lo que yo dicté y dime si están bien · Luego dijo: contra lo que dicté en la tarea del fideicomiso", "pendiente", "instruccion"]]);
    /* 3 · «No» a «¿Lo hago?» nunca descarta la orden */
    var C = await p.evaluate(async function () {
      home(fx()); var d0 = window.__dichos.length;
      modelo({ accion: "aprobar", texto_para_tarea: "Va con el ZKTeco.", respuesta_hablada: "Va.", pide_confirmar: true });
      await dile("tDEC", "dec", "sí el de huella pero que tenga wifi");
      var conf = !!CAM.conf;
      await dile("tDEC", "dec", "no");
      var r = { conf: conf, o: ords("tDEC"), voz: window.__dichos.slice(d0).map(function (d) { return d.t; }), resuelta: !!(tid("tDEC").decision && tid("tDEC").decision.resuelta) };
      CAM.conf = null; CAM.on = false; return r; });
    eq("no: se pidió confirmar", C.conf, true);
    eq("no: la orden sigue pendiente con lo que entendió y preguntar_despues", C.o.map(function (o) { return [o.t, o.estado, o.motivo, o.pd, !!o.ent]; }),
      [["sí el de huella pero que tenga wifi", "pendiente", "dijo_no_a_confirmacion", true, true]]);
    eq("no: la voz ya no dice «no hice nada, dímelo otra vez»", C.voz.some(function (t) { return /Dímelo otra vez/.test(t); }), false);
    eq("no: dice que queda anotado", C.voz.some(function (t) { return /anotado/.test(t); }), true);
    /* 4 · «sí» a la confirmación: se aplica y la orden se cierra con lo que se hizo */
    var D = await p.evaluate(async function () {
      home(fx());
      modelo({ accion: "dato", texto_para_tarea: "", respuesta_hablada: "Va.", pide_confirmar: true });
      await dile("tLLA", "dec", "eso guárdalo nomás como dato de Rogelio");
      await dile("tLLA", "dec", "sí");
      var r = ords("tLLA"); CAM.conf = null; CAM.on = false; return r; });
    eq("sí: una sola orden, cerrada (hecho) con resultado", D.map(function (o) { return [o.estado, !!o.res]; }), [["hecho", true]]);
    /* 5 · rápido sin confirmar (dato) se cierra · IA caída queda pendiente */
    var E = await p.evaluate(async function () {
      home(fx());
      modelo({ accion: "dato", texto_para_tarea: "", respuesta_hablada: "Va, dato." });
      await dile("tVEN", "dec", "esto es solo un dato del predial de Lerdo");
      var o1 = ords("tVEN");
      modelo("caido");
      await dile("tHOY", "dec", "pídele a Claude que revise la cláusula de renta contra el contrato anterior");
      var r = { o1: o1, o2: ords("tHOY") }; CAM.on = false; return r; });
    eq("dato: aplicado, orden cerrada", E.o1.map(function (o) { return o.estado; }), ["hecho"]);
    eq("IA caída: la orden queda pendiente", E.o2.map(function (o) { return [o.estado, o.motivo]; }), [["pendiente", "ia_sin_respuesta"]]);
    /* 6 · Caso ICOSA en caminata: «yo hoy los mando» como instrucción → pendiente para la Mac (que la convierte en tarea suya de hoy) */
    var F = await p.evaluate(async function () {
      home([T("tICO", "Planos ICOSA", { decision: { pregunta: "¿Quién manda los planos a ICOSA?", opciones: [{ nombre: "Cynthia" }, { nombre: "Salvador" }] } })]);
      modelo({ accion: "instruccion", texto_para_tarea: "Salvador manda hoy los planos.", respuesta_hablada: "Va." });
      await dile("tICO", "dec", "yo hoy mando los planos");
      var r = ords("tICO"); CAM.on = false; return r; });
    eq("ICOSA: la orden no se pierde aunque la IA solo la anote", F.map(function (o) { return [o.t, o.estado]; }), [["yo hoy mando los planos", "pendiente"]]);
    /* 7 · cuestionario: cada respuesta es orden y se cierra cuando el cuestionario se aplica */
    var G = await p.evaluate(async function () {
      home([T("tFAL", "Cotizar portón", { f_vigente: "" })]);
      var Q = [{ q: "¿Para cuándo la quieres terminar, o es indefinida?", k: "fecha" }, { q: "¿Cada cuánto le doy seguimiento?", k: "ritmo" }];
      CAM.on = true; CAM.L = ["tFAL"]; CAM.g = { tFAL: "fal" }; CAM.i = 0; CAM.qz = { id: "tFAL", Q: Q, i: 0, A: [], salt: [] }; CAM.buf = "el viernes"; CAM.par = "";
      camEnvia274(); var o1 = ords("tFAL"); await espera(200);
      CAM.buf = "cada dos días"; CAM.par = ""; camEnvia274(); await espera(300);
      var r = { o1: o1, o2: ords("tFAL"), cr: window.__cr.slice(-1) }; CAM.qz = null; CAM.on = false; return r; });
    eq("cuestionario: la respuesta quedó como orden al instante", G.o1.map(function (o) { return [o.t, o.estado]; }), [["el viernes", "pendiente"]]);
    eq("cuestionario: al aplicarse, las dos órdenes se cierran", G.o2.map(function (o) { return [o.t, o.estado]; }), [["el viernes", "hecho"], ["cada dos días", "hecho"]]);
    /* 8 · deshacer: la orden de lo deshecho queda «deshecho» (la Mac no la aplica) */
    var H = await p.evaluate(async function () {
      home(fx());
      modelo({ accion: "dato", texto_para_tarea: "", respuesta_hablada: "Va." });
      await dile("tLLA", "dec", "esto déjalo como dato por favor ya");
      camDeshaz275(); await espera(150);
      var r = ords("tLLA"); CAM.on = false; return r; });
    eq("deshacer: la orden queda deshecho", H.map(function (o) { return o.estado; }), ["deshecho"]);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) { console.log("FALLAS:\n  " + malas.join("\n  ")); } else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
