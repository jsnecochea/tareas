#!/usr/bin/env node
/* PRUEBAS hotfix 276 (7-oct): la caminata NO pierde lo que dice Salvador.
   (1) cada respuesta se escribe al instante en caminata_dichos (merge, solo ese campo); (2) al esconderse la app, lo contestado
   del cuestionario se aplica; (3) "después" / vincular / aprobar nueva / dato con contenido dejan nota para Claude. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 276", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 276, true);
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


    await p.evaluate(function () {
      window.tid = function (id) { return tareas.filter(function (x) { return x.id === id; })[0] || null; };
      window.__cr = [];
      window.completaRevision = function (t, v, op) { window.__cr.push([t.id, v]); };
      window.preguntaAClaude = function (m, mod, cb) { setTimeout(function () { cb('{"accion":"despues","texto_para_tarea":"","respuesta_hablada":"Va."}'); }, 20); };
      window.dichosDe = function (id) { return window.__esp.filter(function (e) { return e[0] === id && e[1] && e[1].caminata_dichos && e[2] && e[2].merge; }).map(function (e) { return e[1].caminata_dichos.map(function (d) { return [d.t, d.k, d.q]; }); }); };
    });
    /* 1 · el dictado se escribe ANTES de la IA, solo ese campo, y queda aunque la IA diga "después" */
    var A = await p.evaluate(async function () {
      home([T("tVEN", "Pagar predial de Lerdo", { f_vigente: "2026-10-03" })]); window.__esp = [];
      CAM.on = true; CAM.L = ["tVEN"]; CAM.g = { tVEN: "dec" }; CAM.i = 0; CAM.qz = null; CAM.buf = "la pago el viernes quince con la transferencia"; CAM.par = "";
      camEnvia(); var inmediato = dichosDe("tVEN");
      await espera(300); var t = tid("tVEN");
      var notas = (t.msgs || []).filter(function (m) { return m.caminata274 && m.nota_claude; }).map(function (m) { return m.t; });
      camSal(false);
      return { inmediato: inmediato, notas: notas, local: (t.caminata_dichos || []).length, nombre: t.nombre }; });
    eq("se escribe al instante, con merge y solo caminata_dichos", A.inmediato, [[["la pago el viernes quince con la transferencia", "dec", ""]]]);
    eq("IA dice 'después' y aun así queda nota para Claude", A.notas, ["la pago el viernes quince con la transferencia"]);
    eq("también en la copia local", A.local, 1);
    /* 2 · cuestionario: la respuesta queda cruda con su pregunta, y al esconderse la app se aplica */
    var B = await p.evaluate(async function () {
      home([T("tFAL", "Pagar renta del local", { f_vigente: "", fecha_dictada: false })]); window.__esp = []; window.__cr = [];
      var Q = [{ k: "txt", q: "¿Para cuándo la quieres terminar, o es indefinida?" }, { k: "txt", q: "¿Quién la hace?" }];
      CAM.on = true; CAM.L = ["tFAL"]; CAM.g = { tFAL: "fal" }; CAM.i = 0; CAM.qz = { id: "tFAL", Q: Q, i: 0, A: [], salt: [] }; CAM.buf = "el viernes"; CAM.par = "";
      camEnvia(); var crudo = dichosDe("tFAL"), antes = window.__cr.length;
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
      var r = { crudo: crudo, antes: antes, cr: window.__cr.slice(), quedan: CAM.qz ? CAM.qz.A.length : -1 };
      Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
      CAM.qz = null; camSal(false); return r; });
    eq("cuestionario: crudo con la pregunta", B.crudo, [[["el viernes", "fal", "¿Para cuándo la quieres terminar, o es indefinida?"]]]);
    eq("cuestionario: antes solo vivía en memoria", B.antes, 0);
    eq("cuestionario: al esconderse se aplica", B.cr, [["tFAL", "Respuesta a «¿Para cuándo la quieres terminar, o es indefinida?»: el viernes."]]);
    eq("cuestionario: no se aplica dos veces", B.quedan, 0);
    /* 3 · vincular: lo que dijo llega a la tarea destino */
    var C = await p.evaluate(function () {
      home([T("tA", "Estado de cuenta inversión"), T("tB", "Inversiones BBVA")]); window.enlazaTareas = function () {};
      window.camCandidatas = function () { return [tid("tB")]; };
      CAM.on = true; CAM.L = ["tA"]; CAM.g = { tA: "dec" }; CAM.i = 0;
      camEjecuta(tid("tA"), "vincular", { destino: "tB", texto_para_tarea: "" }, "es recurrente cada mes del cinco al diez con Hernando");
      var n = (tid("tB").msgs || []).filter(function (m) { return m.caminata274; }).map(function (m) { return m.t; }); CAM.on = false; return n; });
    eq("vincular: nota en la tarea destino", C, ["es recurrente cada mes del cinco al diez con Hernando"]);
    var D = await p.evaluate(function () { home([T("tC", "Algo")]); CAM.on = true; CAM.L = ["tC"]; CAM.g = { tC: "dec" }; CAM.i = 0;
      camResuelve(tid("tC"), { accion: "despues" }, "va", false); var n = (tid("tC").msgs || []).filter(function (m) { return m.caminata274; }).length; CAM.on = false; return n; });
    eq("un 'va' suelto no genera nota", D, 0);
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) { console.log("FALLAS:\n  " + malas.join("\n  ")); } else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
