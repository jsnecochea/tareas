#!/usr/bin/env node
/* PRUEBAS build 278: el caso real del 7-oct («Estado de Cuenta Inversión Septiembre» quedó juntada con «Inversiones BBVA» aunque
   Salvador dijo que no tenía nada que ver): nombres estrictos, negación, su corrección manda, confirmación si no nombró la tarea;
   y el ↩ de la tarea (deshace lo último en ESA tarea, con un toque más), con la MISMA función que el «deshazlo» de voz. Mocks de b277. */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 278", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 278, true);
eq("sw.js con versión >= 278", +((fs.readFileSync(path.join(__dirname, "..", "sw.js"), "utf8").match(/var SW_VERSION = 'build (\d+)'/) || [0, 0])[1]) >= 278, true);
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

    /* fixtures del caso real */
    await p.evaluate(function () {
      var N = Date.now();
      window.fx8 = function () { var L = fx6();
        L.push(T("tBBVA", "Inversiones BBVA", { f_vigente: "2026-10-20", msgs: [{ k: "bi", wa_in: 1, wa_c: "Hernando UHN Bbva", t: "Hernando UHN Bbva: ya se asignaron", ts: N - 800000, h: "09:00" }] }));
        L.push(T("tEDC", "Estado de Cuenta Inversión Septiembre", { f_vigente: "2026-11-05", wa_contactos: [{ nombre: "Perlita Chi Contadora GrupoNec" }],
          hecho238: { hecho: ["Ritmo: cada mes"], falta: [{ k: "vinc", mac: 1, q: "¿Es el mismo tema que «Inversiones BBVA»? Si sí, la vinculo.", ops: [{ id: "tBBVA", label: "Inversiones BBVA" }] }] },
          msgs: [{ k: "bi", wa_in: 1, wa_c: "Perlita Chi Contadora GrupoNec", t: "Perlita: le encargo el edo. de cta. de la inversión de septiembre", ts: N - 700000, h: "10:00" }] }));
        return L; };
    });

    /* ---------- 0 · nombres, negación y corrección (sin voz) ---------- */
    var Z = await p.evaluate(function () {
      home(fx8()); var t = tid("tEDC"), bb = tid("tBBVA"), C = camCandidatas275(t);
      var frase = "No tiene nada que ver con mis inversiones de BBVA. Esa es la tarea de estado de cuenta inversiones";
      var c1 = correccion278(t, frase), c2 = correccion278(t, "¿es esta tarea?"), c3 = correccion278(t, "no, es la tarea de comedor"), c4 = correccion278(t, "no es la tarea de comedor");
      return {
        dest: [camDestino275(t, "inversiones"), (camDestino275(t, "inversiones bbva") || {}).id || null, (camDestino275(t, "tBBVA") || {}).id || null, camDestino275(t, "estado de cuenta inversiones")],
        nom: (resuelveNombre278("estado de cuenta inversiones", C.concat([t])) || {}).id,
        niega: [niega278(frase, bb), niega278(frase, t), niega278("no es la de BBVA, es la de estado de cuenta inversiones", t), niega278("júntala con inversiones bbva", bb), niega278("no, júntala con inversiones bbva", bb)],
        corr: [c1 && c1.misma, c2 && c2.misma, c3 && c3.x.id, c4] }; });
    eq("destino: una palabra suelta ya NO alcanza; el nombre completo o el id sí; el nombre de ESTA tarea no es destino", Z.dest, [null, "tBBVA", "tBBVA", null]);
    eq("«estado de cuenta inversiones» = la tarea de Septiembre (singular/plural, sin el mes)", Z.nom, "tEDC");
    eq("negación: «no tiene nada que ver con mis inversiones de BBVA» niega BBVA y no niega la otra", Z.niega, [true, false, false, false, false]);
    eq("corrección: «esa es la tarea de …» y «¿es esta tarea?» = esta misma; «es la tarea de comedor» = Comedor; sin la coma («no es la tarea de comedor») es negación, no corrección", Z.corr, [true, true, "tCOM", null]);

    /* ---------- 1 · el caso real: la IA dice vincular a BBVA, pero él lo negó → NO se junta ---------- */
    var A = await p.evaluate(async function () {
      var r = {}; window.__nivel276 = 0.2;
      document.getElementById("bcam274").click(); await esp2();
      if (CAM.L.indexOf("tEDC") < 0) { CAM.L.push("tEDC"); CAM.g.tEDC = "dec"; }
      CAM.i = CAM.L.indexOf("tEDC"); camPresenta274(); await esp2();
      var frase = "No tiene nada que ver con mis inversiones de BBVA. Esa es la tarea de estado de cuenta inversiones";
      __iaMap[frase] = { accion: "vincular", destino: "tBBVA", texto_para_tarea: "", respuesta_hablada: "Hecho, la junté." };
      var nB = tid("tBBVA").msgs.length, d0 = __dichos.length;
      di(frase, true); di("terminé", true);
      await hasta(function () { return __dichos.slice(d0).some(function (d) { return /no la junto/i.test(d.t); }); }, 6000);
      var t = tid("tEDC");
      r.dicho = dichos(d0).filter(function (x) { return /no la junto/i.test(x); })[0];
      r.datos = [tid("tBBVA").msgs.length === nB, !!t && !t.fusionada_en && _camVivo(t), ((t.hecho238 || {}).falta || []).filter(function (f) { return f.k === "vinc"; }).length, !!(t.censo_vinc_no && t.censo_vinc_no.propuestas[0].id === "tBBVA")];
      var ia = __ia.filter(function (x) { return /LO QUE DIJO/.test(x.c); }).slice(-1)[0];
      r.prompt = [/ESTA TAREA: id tEDC/.test(ia.c), /REGLAS DE VINCULAR/.test(ia.c)];
      r.ult = !!ultDe278("tEDC");
      return r; });
    eq("lo dice: no la junta con Inversiones BBVA", A.dicho, "Va, no la junto con Inversiones BBVA. Se queda aparte.");
    eq("BBVA intacta · la tarea sigue viva · sin la pregunta de vincular · queda el rechazo", A.datos, [true, true, 0, true]);
    eq("el prompt trae ESTA TAREA y las reglas de vincular", A.prompt, [true, true]);
    eq("…y se puede deshacer (↩ en la tarea)", A.ult, true);

    /* ---------- 2 · la IA quiere vincular a una tarea que él NO nombró → primero confirma ---------- */
    var B = await p.evaluate(async function () {
      var r = {};
      CAM.i = CAM.L.indexOf("tNUE"); camPresenta274(); await esp2();
      __iaMap["júntala con la otra de los lockers"] = { accion: "vincular", destino: "tVES", texto_para_tarea: "", respuesta_hablada: "Hecho." };
      var nV = tid("tVES").msgs.length, d0 = __dichos.length;
      di("júntala con la otra de los lockers", true); di("terminé", true);
      await hasta(function () { return CAM.conf && !!srViva() && !hablando(); }, 6000);
      r.conf = dichos(d0).slice(-2); r.sin = tid("tVES").msgs.length === nV && !tid("tNUE").fusionada_en;
      di("no", true); await hasta(function () { return !CAM.conf && !!srViva() && !hablando(); }, 5000);
      return r; });
    eq("confirma antes de juntar a una tarea que no nombró", B.conf, ["Entendí: juntar Cotizar cámaras extra con la tarea Vestidores.", "¿Lo hago? Dime sí o no."]);
    eq("…y no la juntó", B.sin, true);

    /* ---------- 3 · su corrección manda sobre la IA ---------- */
    var C = await p.evaluate(async function () {
      var r = {};
      __iaMap["no, es la tarea de comedor"] = { accion: "vincular", destino: "tVES", texto_para_tarea: "", respuesta_hablada: "Hecho." };
      var nV = tid("tVES").msgs.length;
      var d0 = __dichos.length; di("no, es la tarea de comedor", true); di("terminé", true);
      await hasta(function () { return CAM.conf && !!srViva() && !hablando(); }, 6000);   /* venía de un «no»: la siguiente orden se confirma (277) */
      r.conf = dichos(d0).filter(function (x) { return /^Entendí/.test(x); })[0];
      di("sí", true);
      await hasta(function () { var x = tid("tNUE"); return !x || !!x.fusionada_en; }, 6000);
      r.r = [tid("tVES").msgs.length === nV, (tid("tCOM").enlazadas || []).some(function (e) { return e.id === "tNUE"; })];
      camSal274(false); return r; });
    eq("«no, es la tarea de comedor»: lo que se confirma es Comedor, aunque la IA dijo Vestidores", C.conf, "Entendí: juntar Cotizar cámaras extra con la tarea Comedor.");
    eq("…y con su sí va a Comedor", C.r, [true, true]);

    /* ---------- 4 · el ↩ de la tarea: fecha ---------- */
    var D = await p.evaluate(async function () {
      var r = {}; home(fx8()); try { localStorage.removeItem("doit_ult278"); } catch (e) {} window.__ult278 = null;
      abierta = "tCER"; vista = "hilo"; render();
      r.sinNada = !document.getElementById("bund278");
      var t = tid("tCER"); mueveFecha(t, "2026-10-30", "prueba"); render();
      var b = document.getElementById("bund278");
      r.ico = [!!b, b && b.nextElementSibling && b.nextElementSibling.id, !!(b && b.querySelector("svg")), b && b.textContent.trim()];
      b.click(); await espera(30);
      var l = document.getElementById("und278"); r.linea = l ? l.querySelector("span").textContent : null; r.aunNo = tid("tCER").f_vigente;
      var N = Date.now(); t.msgs.push({ k: "bi", wa_in: 1, wa_c: "Rubén Garza", t: "Rubén Garza: llego a las 5", ts: N + 5000, h: "12:00" });
      document.getElementById("bund278ok").click(); await espera(30);
      var t2 = tid("tCER");
      r.despues = [t2.f_vigente, !document.getElementById("bund278"), t2.msgs.some(function (m) { return /llego a las 5/.test(m.t); })];
      return r; });
    eq("sin acciones no hay ↩", D.sinNada, true);
    eq("↩ junto al ⋯, ícono de línea sin texto", D.ico, [true, "bmenu", true, ""]);
    eq("primer toque: dice qué se va a deshacer y todavía no deshace", [D.linea, D.aunNo], ["Se deshace: se movió la fecha al " + (await p.evaluate(function () { return fechaMovCorta("2026-10-30"); })), "2026-10-30"]);
    eq("segundo toque: regresa la fecha, se va el ↩ y lo que llegó después se conserva", D.despues, ["2026-10-21", true, true]);

    /* ---------- 5 · el ↩ de la tarea: vínculo (desde la tarea destino) ---------- */
    var E = await p.evaluate(async function () {
      var r = {}; var nP = tid("tPOR").msgs.length;
      enlazaTareas("tCER", "tPOR"); abierta = "tPOR"; vista = "hilo"; render();
      document.getElementById("bund278").click(); await espera(30);
      r.linea = document.getElementById("und278").querySelector("span").textContent;
      document.getElementById("bund278ok").click(); await espera(30);
      var c = tid("tCER"); r.despues = [!!c && !c.fusionada_en, tid("tPOR").msgs.length === nP, (tid("tPOR").enlazadas || []).length]; r.dbg = [nP, tid("tPOR").msgs.map(function (m) { return m.t; })]; r.nom = c && c.nombre;
      return r; });
    eq("↩ en la destino: «se juntó aquí «…»» con el nombre de la que se juntó", E.linea, "Se deshace: se juntó aquí «" + E.nom + "»");
    eq("…y las dos regresan como estaban", E.despues, [true, true, 0]);

    /* ---------- 6 · una sola función; lo enviado por WhatsApp no deja ↩; tocar ↩ otra vez = no ---------- */
    var F = await p.evaluate(async function () {
      var r = {};
      r.misma = [/function camDeshaz275\(\)\{[\s\S]*?deshazUlt278\(u\)/.test(document.documentElement.innerHTML), typeof deshazUlt278];
      var f = ultEnvuelve278(function (t) { window.__ultPila278.env = true; t.x8 = 1; }, function (t) { return [t]; }, function () { return "algo"; }, 1);
      f(tid("tCOM")); r.wa = !ultDe278("tCOM");
      mueveFecha(tid("tCOM"), "2026-10-29", "prueba"); abierta = "tCOM"; vista = "hilo"; render();
      document.getElementById("bund278").click(); await espera(20); var on = !!document.getElementById("und278");
      document.getElementById("bund278").click(); await espera(20);
      r.toggle = [on, !document.getElementById("und278"), tid("tCOM").f_vigente];
      r.sinHist = !document.querySelector("[data-mn='historial']") && !/Historial de deshacer/.test(document.body.innerHTML);
      return r; });
    eq("voz y ↩ usan la MISMA función (deshazUlt278)", F.misma, [true, "function"]);
    eq("si se mandó algo por WhatsApp no queda ↩", F.wa, true);
    eq("tocar ↩ otra vez cierra la línea sin deshacer", F.toggle, [true, true, "2026-10-29"]);
    eq("no se agregó ningún historial", F.sinHist, true);
    await foto("278-undo.png");
    eq("sin errores de página", errs, []);
  } catch (e) { malas.push("EXCEPCIÓN " + (e && e.stack || e)); }
  await b.close();
  if (malas.length) { console.log("FALLAS:\n  " + malas.join("\n  ")); } else console.log("todo bien");
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
