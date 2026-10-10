#!/usr/bin/env node
/* Nada se queda zombi desde el toque (Salvador 10-oct 08:05). App completa a 390 px, Firebase simulado, push.php simulado.
   1) «Entrar» del alta y «Activar avisos aquí» con el service worker sin registrar: salen solos a los AVISOS_TOPE_MS y lo dicen.
   2) aviso_set que falla: no se da por mandado; se reintenta (también aviso_del) y al salir queda anotado.
   4) completaRevision cuyo aplicado truena: limpia «Claude está leyendo…», el dictado no queda en espera, queda encargo para
      la Mac y alTerminar se llama una vez. 5) Cerrar sesión con cambios sin subir: dice cuántos y deja elegir; quedarse no borra
      nada; salir los aparta y regresan al volver a entrar. 6) La bandeja no se queda «en curso» con el servidor mudo.
   7) «N cambios sin subir» visible cuando MySQL no recibe; WhatsApp automático que falla: «no salió · reintento» y se reintenta.
   8) guarda() y los avisos sin Firestore (motor MySQL) sí llegan al servidor. 9) Atrás de Android cierra la hoja abierta.
   10) Lectura en voz: el vigía regresa el botón y avisa aunque el motor de voz nunca termine. 11) Foto ilegible: no se queda
   en «Comprimiendo…». Correr: node tests/sin-zombis.test.js */
"use strict";
var path = require("path"), IDX = path.join(__dirname, "..", "index.html");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), errs = [];
  async function pagina(opts) {
    opts = opts || {};
    var ctx = opts.ctx || await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), p = await ctx.newPage();
    p.on("pageerror", function (e) { errs.push(e.message); });
    await p.route(/^https?:/, function (r) { r.abort(); });
    await p.addInitScript(function () { var P = function () { return Promise.resolve(); };
      function col() { var q = { doc: function () { return { get: function () { return Promise.resolve({ exists: false, data: function () { return {}; } }); }, set: P, delete: P, onSnapshot: function () {} }; },
        where: function () { return q; }, limit: function () { return q; }, orderBy: function () { return q; }, get: function () { return Promise.resolve({ size: 0, docs: [], forEach: function () {} }); },
        onSnapshot: function () { return function () {}; } }; return q; }
      var fs0 = { enablePersistence: P, collection: col, settings: function () {} };
      window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function (cb) { window.__authCb = cb; }, signOut: P }; } };
      window.firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = function () {}; };
      /* el service worker nunca queda registrado: ready no resuelve jamás */
      try { Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { ready: new Promise(function () {}), register: function () { return Promise.reject(new Error("no")); }, controller: null, addEventListener: function () {}, getRegistrations: function () { return Promise.resolve([]); } } }); } catch (e) {}
      window.PushManager = window.PushManager || function () {};
      window.Notification = { permission: "default", requestPermission: function () { return Promise.resolve("granted"); } };
      /* push.php simulado */
      window.__srv = { tareas: {}, llamadas: [], falla: {}, mudo: {} };
      window.fetch = function (url, op) {
        var s = String(url); var u = new URL(s, "https://doit.ok-doit.com/"), ac = u.searchParams.get("action") || "suscribe", c = op && op.body ? JSON.parse(op.body) : null;
        window.__srv.llamadas.push([ac, c]);
        function r(j, st) { return Promise.resolve(new Response(JSON.stringify(j), { status: st || 200, headers: { "content-type": "application/json" } })); }
        if (window.__srv.mudo[ac]) return new Promise(function () {});
        if (window.__srv.falla[ac]) return r({ error: "falla simulada" }, 500);
        if (ac === "fs_lista") return r(Object.keys(window.__srv.tareas).map(function (k) { return Object.assign({ id: k }, window.__srv.tareas[k]); }));
        if (ac === "fs_doc") { var d = window.__srv.tareas[u.searchParams.get("id")]; return d ? r(Object.assign({ id: u.searchParams.get("id") }, d)) : r({ error: "no" }, 404); }
        if (ac === "fs_set") { window.__srv.tareas[c.id] = Object.assign({}, window.__srv.tareas[c.id] || {}, c.data); return r({ ok: true }); }
        if (ac === "wa_pedido") return r({ ok: true, id: "wp" + window.__srv.llamadas.length });
        if (ac === "bandeja_lista") return r([]);
        return r({ ok: true });
      };
      try { localStorage.setItem("bit_avisos_visto_salvador", "1"); localStorage.setItem("bit_avisos_visto_josue", "1"); } catch (e) {} });
    await p.goto("file://" + IDX); await p.waitForTimeout(400);
    if (opts.entra) { await p.evaluate(function (u) { APP_TOKEN = "tok-prueba"; entrar(u); }, opts.entra); await p.waitForTimeout(700); }
    return { ctx: ctx, p: p };
  }
  var hasta = function (p, f, arg, ms) { return p.waitForFunction(f, arg, { timeout: ms || 4000 }).then(function () { return true; }, function () { return false; }); };
  try {
    /* ---- 1 · Entrar / Activar avisos sin service worker ---- */
    var A = await pagina();
    await A.p.evaluate(function () { AVISOS_TOPE_MS = 300; yo = "nuevo"; window.__entro = 0; try { localStorage.removeItem("bit_avisos_visto_nuevo"); } catch (e) {}
      pasoAvisos(function () { window.__entro++; }); });
    var b1 = await A.p.evaluate(function () { var b = document.getElementById("bsigue"); if (!b) return "sin botón"; b.click(); return b.textContent; });
    eq("Entrar: el botón dice «Entrando…» al tocarlo", b1, "Entrando…");
    eq("Entrar: sin service worker igual entra (una vez) al vencer el tope", await hasta(A.p, function () { return window.__entro === 1; }, null, 3000), true);
    eq("y dice que entró sin avisos", await A.p.evaluate(function () { return (document.getElementById("toast") || document.body).textContent.indexOf("Entraste sin avisos") >= 0; }), true);
    await A.p.waitForTimeout(500);
    eq("cont() no se llama dos veces", await A.p.evaluate(function () { return window.__entro; }), 1);
    var b2 = await A.p.evaluate(function () { var d = document.createElement("div"); d.innerHTML = '<button id="bavisos">Activar avisos aquí</button>'; document.body.appendChild(d); bindBotonAvisos(); document.getElementById("bavisos").click(); return document.getElementById("bavisos").textContent; });
    eq("Activar avisos: «Activando…» al tocar", b2, "Activando…");
    eq("y regresa solo a «Activar avisos aquí» (no se queda en Activando…)", await hasta(A.p, function () { var x = document.getElementById("bavisos"); return x && !x.disabled && x.textContent === "Activar avisos aquí"; }, null, 3000), true);
    await A.ctx.close();

    /* ---- 2 · avisos al servidor: solo cuenta lo confirmado; lo fallido se reintenta ---- */
    var B = await pagina({ entra: "salvador" });
    var r2 = await B.p.evaluate(async function () {
      var o = {}, F = new Date(Date.now() + 3 * 86400000), f = F.getFullYear() + "-" + String(F.getMonth() + 1).padStart(2, "0") + "-" + String(F.getDate()).padStart(2, "0");
      var t = { id: "tAV", nombre: "Pagar predial", duenio: "salvador", estado: "abierta", msgs: [] }, a = { id: "a1", fecha: f, hora: "10:00", texto: "Pagar predial" };
      window.__memAv263 = {}; try { localStorage.removeItem("bit_avsig263"); } catch (e) {}
      window.__srv.falla.aviso_set = true; window.__srv.llamadas = [];
      await avisoAlServidor(t, a, "tAV|a1");
      o.noMarcado = !memAv()["tAV|a1"]; o.anotado = (avisosFallidos()["tAV|a1"] || {}).accion;
      await avisoAlServidor(t, a, "tAV|a1");
      o.reintentaDeInmediato = window.__srv.llamadas.filter(function (x) { return x[0] === "aviso_set"; }).length;
      window.__srv.falla.aviso_set = false;
      o.pendientes = await reintentaAvisosFallidos();
      o.marcado = !!memAv()["tAV|a1"];
      await avisoAlServidor(t, a, "tAV|a1");
      o.yaNoRepite = window.__srv.llamadas.filter(function (x) { return x[0] === "aviso_set"; }).length;
      window.__srv.falla.aviso_del = true; borraAvisoEspejo("tAV|a1"); await new Promise(function (r) { setTimeout(r, 100); });
      o.delAnotado = (avisosFallidos()["tAV|a1"] || {}).accion;
      window.__srv.falla.aviso_del = false; await reintentaAvisosFallidos();
      o.delSalio = [window.__srv.llamadas.filter(function (x) { return x[0] === "aviso_del"; }).length, Object.keys(avisosFallidos()).length];
      return o; });
    eq("aviso_set que falla NO se da por mandado y queda anotado", [r2.noMarcado, r2.anotado], [true, "aviso_set"]);
    eq("el siguiente intento sí lo vuelve a mandar (no espera 20 h)", r2.reintentaDeInmediato, 2);
    eq("el reintento con el servidor bien lo confirma y vacía la lista", [r2.pendientes, r2.marcado], [0, true]);
    eq("ya confirmado, no se repite", r2.yaNoRepite, 3);
    eq("aviso_del que falla queda anotado y se reintenta", [r2.delAnotado, r2.delSalio], ["aviso_del", [2, 0]]);

    /* ---- 8 · guarda() y avisos sin Firestore, motor MySQL ---- */
    var r8 = await B.p.evaluate(async function () {
      var dbAntes = db; db = null; window.__srv.llamadas = [];
      var t = { id: "tSINDB", nombre: "Sin firestore", duenio: "salvador", estado: "abierta", msgs: [], aviso_hora: "09:30", f_vigente: "2030-01-15" };
      tareas.push(t); guarda(t); await new Promise(function (r) { setTimeout(r, 300); });
      var set = window.__srv.llamadas.filter(function (x) { return x[0] === "fs_set" && x[1].id === "tSINDB"; }).length;
      window.__srv.llamadas = []; window.__memAv263 = {};
      sincronizaAvisos({ id: "tSINDB2", nombre: "Recordatorio sin firestore", duenio: "salvador", estado: "abierta", es_recordatorio: true, f_vigente: "2030-01-15", aviso_hora: "09:30", msgs: [] });
      await new Promise(function (r) { setTimeout(r, 200); });
      var av = window.__srv.llamadas.filter(function (x) { return x[0] === "aviso_set"; }).length;
      db = dbAntes; return [set >= 1, av >= 1]; });
    eq("sin Firestore y en MySQL: guarda() sube la tarea y sincronizaAvisos manda el aviso", r8, [true, true]);

    /* ---- 7 · «N cambios sin subir» y WhatsApp automático que falla ---- */
    var r7 = await B.p.evaluate(async function () {
      var o = {}; window.__srv.falla.fs_doc = true; window.__srv.falla.fs_set = true;
      var t = tareas.filter(function (x) { return x.id === "tSINDB"; })[0]; t.nota = "x1"; guarda(t);
      await new Promise(function (r) { setTimeout(r, 300); });
      var el = document.getElementById("sinsubir"); o.visible = el ? el.textContent : null;
      window.__srv.falla.fs_doc = false; window.__srv.falla.fs_set = false;
      el.click(); await new Promise(function (r) { setTimeout(r, 400); });
      o.seQuita = !document.getElementById("sinsubir");
      /* WhatsApp automático (aprobar meta) con wa_pedido caído */
      var T = { id: "tMETA", nombre: "Mantenimiento Lerdo", duenio: "salvador", estado: "abierta", revisa_ext: "Manuel Parra", msgs: [],
        checklist: { titulo: "Metas", items: [{ id: "m1", tx: "Azotea limpia", fecha: "2030-01-10", estado: 1, entrega: { por_nombre: "Manuel Parra" } }] } };
      tareas.push(T); window.__srv.falla.wa_pedido = true;
      apruebaMeta(T, "m1"); await new Promise(function (r) { setTimeout(r, 300); });
      var nota = (T.msgs || []).filter(function (m) { return m.wa_nota; })[0];
      o.nota = nota ? [/no salió/.test(nota.t), /reintento/.test(nota.t)] : null;
      o.cola = waFallidos().length;
      window.__srv.falla.wa_pedido = false; await reintentaWAFallidos();
      o.salio = [nota && nota.t, waFallidos().length];
      return o; });
    eq("sin poder subir: se ve «1 cambio sin subir»", r7.visible, "1 cambio sin subir");
    eq("al tocarlo con el servidor de vuelta, sube y se quita", r7.seQuita, true);
    eq("WhatsApp automático que no salió: la tarea lo dice («no salió · reintento»)", r7.nota, [true, true]);
    eq("y queda para reintentar", r7.cola, 1);
    eq("al reintentar sale y la tarea lo dice", r7.salio, ["✓ El WhatsApp a Manuel Parra ya salió (en el reintento).", 0]);

    /* ---- 6 · bandeja con el servidor mudo: no se queda «en curso» ---- */
    var r6 = await B.p.evaluate(async function () { TOPE_SERVIDOR_MS = 200; window.__srv.mudo.bandeja_lista = true; BANDEJA_SRV.enCurso = false;
      var p = cargaBandejaSrv(), en = BANDEJA_SRV.enCurso; var res = await p; var o = [en, res, BANDEJA_SRV.enCurso, /tope/.test(BANDEJA_SRV.error)];
      window.__srv.mudo.bandeja_lista = false; TOPE_SERVIDOR_MS = 20000; return o; });
    eq("bandeja_lista sin respuesta: corta por tope y suelta «en curso»", r6, [true, false, false, true]);

    /* ---- 4 · completaRevision: si aplicar truena, nada queda a medias ---- */
    var r4 = await B.p.evaluate(async function () {
      var t = { id: "tREV", nombre: "Comedor nuevo", duenio: "salvador", estado: "abierta", tipo_item: "tarea", autorizada: true, msgs: [], f_vigente: "2030-01-20", plan_seguimiento: { proximo_paso: "x" } };
      tareas.push(t);
      var pAC = preguntaAClaude, aRC = aplicaRevisionClaude, n = 0, fin = null;
      preguntaAClaude = function (m, mo, cb) { setTimeout(function () { cb('{"hecho":["algo"]}', null); }, 20); };
      aplicaRevisionClaude = function () { throw new Error("tronó a propósito"); };
      registraDictado(t, "cambia el proveedor a Manuel");   /* como lo deja enviaHilo antes de llamar al cerebro */
      completaRevision(t, "cambia el proveedor a Manuel", { sinRevision: true, alTerminar: function (r) { n++; fin = r; } });
      var leyendo = !!t._leyendo;
      await new Promise(function (r) { setTimeout(r, 400); });
      preguntaAClaude = pAC; aplicaRevisionClaude = aRC;
      var T = tareas.filter(function (x) { return x.id === "tREV"; })[0];
      return { leyendo: leyendo, despues: !!T._leyendo, n: n, error: fin && fin.error, dict: (T.dictados || []).map(function (d) { return d.estado; }), espera: !!(window.__dict && window.__dict.espera),
        encargo: (T.encargos || []).map(function (e) { return e.motivo; }) }; });
    eq("mientras piensa: «Claude está leyendo…»", r4.leyendo, true);
    eq("si aplicar truena: se limpia, alTerminar UNA vez con el error, el dictado no queda en espera y queda de encargo para la Mac",
      [r4.despues, r4.n, r4.error, r4.dict, r4.espera, r4.encargo], [false, 1, "tronó a propósito", ["encargado"], false, ["falla_app"]]);

    /* ---- 9 · atrás de Android ---- */
    var r9 = await B.p.evaluate(async function () {
      var espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); }, o = {}, url0 = location.href, cancel = 0;
      sobreHoja('<div class="mov225" role="dialog"><div class="h225h"><b>Prueba</b><button class="h225b" data-hx254="1" aria-label="Cerrar">x</button></div></div>', function (k) { if (k === "cancela") cancel++; });
      await espera(50); o.guarda = !!(history.state && history.state.doitCapa);
      history.back(); await espera(150);
      o.cerro = [!document.getElementById("hoja254"), cancel, location.href === url0];
      /* abierta y cerrada con su ×: la guarda se devuelve sola */
      sobreHoja('<div class="mov225" role="dialog"><div class="h225h"><button class="h225b" data-hx254="1" aria-label="Cerrar">x</button></div></div>', function () {});
      await espera(50); document.querySelector("#hoja254 [data-hx254]").click(); await espera(150);
      o.devuelta = !(history.state && history.state.doitCapa);
      /* el visor de fotos */
      document.getElementById("visor").classList.add("on"); await espera(50); history.back(); await espera(150);
      o.visor = document.getElementById("visor").classList.contains("on");
      return o; });
    eq("con una hoja abierta queda una guarda en el historial", r9.guarda, true);
    eq("atrás cierra la hoja (como Cancelar) y no sale de la app", r9.cerro, [true, 1, true]);
    eq("cerrada con la ×, la guarda se devuelve sola", r9.devuelta, true);
    eq("atrás cierra el visor de fotos", r9.visor, false);

    /* ---- 10 · voz: el vigía no deja el botón en pausa ---- */
    var r10 = await B.p.evaluate(async function () {
      var S = { speaking: false, speak: function () { S.speaking = true; }, cancel: function () { S.speaking = false; }, getVoices: function () { return []; }, addEventListener: function () {} };
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: S });
      vigiaVoz = function () { return 150; };
      var b = document.createElement("button"); document.body.appendChild(b);
      leeEnVoz("hola", b); var enPausa = b.classList.contains("on");
      await new Promise(function (r) { setTimeout(r, 400); });
      var fin = 0; vozDi("hola", null, function () { fin++; });
      await new Promise(function (r) { setTimeout(r, 400); });
      return [enPausa, b.classList.contains("on"), window.__leyendo, fin]; });
    eq("lectura: el motor nunca avisa que terminó y el botón regresa a play; vozDi avisa una vez", r10, [true, false, false, 1]);

    /* ---- 11 · foto ilegible ---- */
    var r11 = await B.p.evaluate(async function () {
      var FR = window.FileReader;
      window.FileReader = function () { var s = this; this.readAsArrayBuffer = function () { setTimeout(function () { s.onerror && s.onerror(new Event("error")); }, 10); }; };
      var m = await new Promise(function (r) { leerExif(new File(["x"], "f.jpg", { type: "image/jpeg", lastModified: 0 }), r); });
      window.FileReader = FR;
      FOTO_TOPE_MS = 200; var I = window.Image; window.Image = function () { return {}; };   /* imagen que nunca carga */
      var c = await new Promise(function (r) { comprime(new File(["x"], "f.jpg", { type: "image/jpeg" }), function (d, meta) { r([d, !!meta]); }); });
      window.Image = I; return [!!m.error_lectura, c]; });
    eq("FileReader con error: leerExif contesta igual; una imagen que no carga no deja «Comprimiendo…»", r11, [true, [null, true]]);
    await B.ctx.close();

    /* ---- 5 · cerrar sesión con cambios sin subir ---- */
    var C = await pagina({ entra: "josue" });
    var dl = []; C.p.on("dialog", function (d) { dl.push(d.message()); if (dl.length === 2) d.dismiss(); else d.accept(); });
    var r5 = await C.p.evaluate(async function () {
      window.__srv.falla.fs_doc = true;
      var t = { id: "tJ", nombre: "De Josué", duenio: "josue", estado: "abierta", msgs: [] }; tareas.push(t); t.nota = "sin subir"; guarda(t);
      await new Promise(function (r) { setTimeout(r, 200); });
      var r = await cerrarSesion(); return { r: r, yo: yo, cola: datosTareas.pendientes() }; });
    eq("con cambios sin subir: dice cuántos y deja quedarse", [/Quedan 1 cambio sin subir/.test(dl[1] || ""), r5.r, r5.yo, r5.cola], [true, false, "josue", 1]);
    dl.length = 0; C.p.removeAllListeners("dialog"); C.p.on("dialog", function (d) { dl.push(d.message()); d.accept(); });
    var nav = C.p.waitForNavigation({ timeout: 8000 }).catch(function () {});
    await C.p.evaluate(function () { cerrarSesion(); }); await nav; await C.p.waitForTimeout(300);
    var ap = await C.p.evaluate(function () { return [localStorage.getItem("doit_cola_mysql"), Object.keys(JSON.parse(localStorage.getItem("doit_cola_mysql_de_josue") || "{}"))]; });
    eq("salir: la cola no se borra, queda apartada para josue", ap, [null, ["tJ"]]);
    var vuelve = await C.p.evaluate(async function () { APP_TOKEN = "tok-prueba"; entrar("josue"); await new Promise(function (r) { setTimeout(r, 600); });
      return [localStorage.getItem("doit_cola_mysql_de_josue"), window.__srv.tareas.tJ && window.__srv.tareas.tJ.nota]; });
    eq("al volver a entrar josue, regresan y suben", vuelve, [null, "sin subir"]);
    await C.ctx.close();

    eq("sin errores de página", errs.filter(function (m) { return !/firebase is not defined/.test(m); }), []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
