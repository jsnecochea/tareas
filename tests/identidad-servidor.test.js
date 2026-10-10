#!/usr/bin/env node
/* Prueba de identidad en cada llamada al servidor. La app completa (390 px) con Firebase y push.php simulados:
   1) con usuario de Firebase, TODA llamada a push.php y a claude.php lleva «Authorization: Bearer <ID token>» (además
      de x-app-token); se disparan a propósito las llamadas de cada parte de la app y se cuentan;
   2) sin usuario, o si getIdToken falla, las llamadas salen igual sin ese encabezado y nada truena;
   3) un 401 {error:"auth"} lleva al login UNA sola vez con «Tu sesión venció, vuelve a entrar»; un 403 que no es de
      sesión (tarea ajena) no saca a nadie;
   4) en el código armado no queda ningún fetch suelto: solo el de llamaServidor, y en sw.js los de push.php van con
      encabezadosSW.
   Correr: node tests/identidad-servidor.test.js */
"use strict";
var path = require("path"), fs = require("fs"), IDX = path.join(__dirname, "..", "index.html"), SW = path.join(__dirname, "..", "sw.js");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }

/* 4 · revisión del código: ningún fetch fuera de llamaServidor */
(function () {
  var html = fs.readFileSync(IDX, "utf8"), sw = fs.readFileSync(SW, "utf8");
  /* cada línea con fetch( que no sea comentario ni la de llamaServidor es una llamada que se saltó la identidad */
  var sueltos = html.split("\n").filter(function (l) { return /\bfetch\s*\(/.test(l) && !/^\s*(\/\*|\*|\/\/)/.test(l) && l.indexOf("var p; try{ p=fetch(url, op); }catch(e){ fin(); no(e); return; }") < 0; })
    .map(function (l) { return l.trim().slice(0, 120); });
  eq("index.html: ningún fetch suelto (todo sale por llamaServidor)", sueltos, []);
  /* el único fetch permitido vive dentro de llamaServidor (con tope y revisión de sesión) y está una sola vez */
  var ls0 = html.indexOf("function llamaServidor("), ls1 = html.indexOf("/* @@IDENTIDAD-FIN */"), cuerpoLS = html.slice(ls0, ls1);
  eq("el fetch de llamaServidor: uno, dentro de llamaServidor, y revisa la sesión", [html.split("p=fetch(url, op)").length - 1, cuerpoLS.indexOf("p=fetch(url, op)") > 0, /revisaSesion\(r\)/.test(cuerpoLS)], [1, true, true]);
  var pushSW = (sw.match(/fetch\(`\/push\.php[^`]*`/g) || []).length, conEnc = (sw.match(/encabezadosSW\(data\)\.then\(function \(h\) \{ return fetch\(`\/push\.php/g) || []).length;
  eq("sw.js: cada llamada a push.php va con encabezadosSW", [pushSW, conEnc], [2, 2]);
  eq("sw.js: encabezadosSW pone Authorization Bearer", /h\['Authorization'\] = 'Bearer ' \+ t/.test(sw), true);
})();

(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), errs = [];
  /* modo: "token" | "sin" | "falla" ; srv401: acción que contesta 401 auth ; srv403: acción que contesta 403 no-sesión */
  async function pagina(cfg) {
    var ctx = await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: "America/Monterrey" }), p = await ctx.newPage();
    p.on("pageerror", function (e) { errs.push(e.message); });
    await p.route(/^https?:/, function (r) { r.abort(); });
    await p.addInitScript(function (cfg) { var P = function () { return Promise.resolve(); }; window.__snaps = {}; window.__llamadas = [];
      function col(name) { var q = { doc: function (id) { return { get: function () { return Promise.resolve({ exists: false, data: function () { return {}; } }); }, set: P, delete: P, onSnapshot: function () {} }; },
        where: function () { return q; }, limit: function () { return q; }, orderBy: function () { return q; }, get: function () { return Promise.resolve({ size: 0, docs: [], forEach: function () {} }); },
        onSnapshot: function (f) { (window.__snaps[name] = window.__snaps[name] || []).push(f); return function () {}; } }; return q; }
      var fs0 = { enablePersistence: P, collection: col, settings: function () {} }, nTok = 0;
      var usuario = { email: "jsnecochea@gruponec.com.mx", displayName: "Salvador",
        getIdToken: function () { nTok++; return cfg.modo === "falla" ? Promise.reject(new Error("sin red")) : Promise.resolve("idtok-prueba"); } };
      var AUTH = { currentUser: null, onAuthStateChanged: function (cb) { window.__authCb = cb; },
        signOut: function () { AUTH.currentUser = null; try { sessionStorage.setItem("salio", String(+(sessionStorage.getItem("salio") || 0) + 1)); } catch (e) {} return P(); } };
      window.__usuario = usuario; window.__AUTH = AUTH; window.__nTok = function () { return nTok; };
      window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return AUTH; } };
      window.firebase.auth.GoogleAuthProvider = function () { this.setCustomParameters = function () {}; };
      window.fetch = function (url, op) {
        var s = String(url), h = (op && op.headers) || {};
        if (s.indexOf("push.php") < 0 && s.indexOf("claude.php") < 0) return Promise.reject(new Error("sin red"));
        var u = new URL(s, "https://doit.ok-doit.com/"), a = u.searchParams.get("action") || (s.indexOf("claude.php") >= 0 ? "claude" : "suscripcion");
        window.__llamadas.push({ a: a, auth: h.Authorization || h.authorization || "", app: h["x-app-token"] || "" });
        function r(j, st) { return Promise.resolve(new Response(JSON.stringify(j), { status: st || 200, headers: { "content-type": "application/json" } })); }
        if (cfg.srv401 && (cfg.srv401 === "*" || cfg.srv401 === a)) return r({ error: "auth" }, 401);
        if (cfg.srv403 && cfg.srv403 === a) return r({ error: "No autorizado para esa tarea" }, 403);
        if (a === "fs_lista") return r([{ id: "tS1", nombre: "Una tarea", duenio: "salvador", estado: "abierta", f_vigente: "2026-12-01", msgs: [] }]);
        if (a === "claude") return r({ content: [{ text: "ok" }] });
        if (a === "bandeja_lista" || a === "wa_agenda") return r([]);
        return r({ ok: true });
      };
      try { localStorage.setItem("bit_avisos_visto_salvador", "1"); localStorage.setItem("bit_avisos_visto_josue", "1"); } catch (e) {} }, cfg);
    await p.goto("file://" + IDX); await p.waitForTimeout(300); return { ctx: ctx, p: p };
  }
  /* dispara a propósito las llamadas de cada parte de la app */
  function disparaTodo(p) {
    return p.evaluate(function () {
      window.notifPermite = function () { return true; };
      try { guardaNotif({}); } catch (e) { window.__e1 = e.message; }
      disparaPushInstantaneo("josue", "Hola", "cuerpo", "", "asignado");
      borraEnServidor("tS1", "https://doit.ok-doit.com/archivos/a.jpg");
      window.__vistoTs = 0; avisaVisto();
      pideWhatsApp({ contacto: "Prueba", texto: "hola" }).catch(function () {});
      llamaPush("aviso_del", { id: "x1" });
      window.AGENDA_WA = null; window.__agendaNo = 0; window.__agendaPide = 0; cargaAgendaWA();
      llamaBandeja("bandeja_lista").catch(function () {});
      preguntaAClaude([{ role: "user", content: "hola" }], "rapido", function () {});
      datosTareas.vacia && datosTareas.vacia();
    });
  }
  try {
    /* 1 · con usuario: todo lleva Bearer */
    var A = await pagina({ modo: "token" });
    await A.p.evaluate(function () { APP_TOKEN = "tok-prueba"; window.__AUTH.currentUser = window.__usuario; window.__authCb(window.__usuario); });
    await A.p.waitForFunction(function () { return window.__llamadas.some(function (l) { return l.a === "fs_lista"; }); }, null, { timeout: 6000 }).catch(function () {});
    await disparaTodo(A.p); await A.p.waitForTimeout(700);
    var la = await A.p.evaluate(function () { return window.__llamadas; });
    var acciones = la.map(function (l) { return l.a; }).filter(function (a, i, s) { return s.indexOf(a) === i; }).sort();
    eq("con usuario: se dispararon las llamadas de todas las partes",
      ["aviso_del", "bandeja_lista", "borrar_archivo", "claude", "fs_lista", "fs_set", "send", "visto", "wa_agenda", "wa_pedido"].filter(function (a) { return acciones.indexOf(a) < 0; }), []);
    eq("con usuario: TODAS llevan Authorization Bearer <ID token>", la.filter(function (l) { return l.auth !== "Bearer idtok-prueba"; }).map(function (l) { return l.a; }), []);
    eq("con usuario: siguen llevando x-app-token", la.filter(function (l) { return l.app !== "tok-prueba"; }).map(function (l) { return l.a; }), []);
    eq("con usuario: " + la.length + " llamadas revisadas (más de 10)", la.length > 10, true);
    await A.ctx.close();

    /* 2a · sin usuario de Firebase: salen igual, sin Bearer, sin errores */
    var B = await pagina({ modo: "sin" });
    await B.p.evaluate(function () { APP_TOKEN = "tok-prueba"; entrar("josue"); });
    await B.p.waitForTimeout(400); await disparaTodo(B.p); await B.p.waitForTimeout(500);
    var lb = await B.p.evaluate(function () { return { l: window.__llamadas, e: window.__e1 || "" }; });
    eq("sin usuario: las llamadas salen igual", lb.l.length > 8, true);
    eq("sin usuario: ninguna lleva Authorization", lb.l.filter(function (l) { return l.auth; }).length, 0);
    eq("sin usuario: nada truena", lb.e, "");
    await B.ctx.close();

    /* 2b · getIdToken falla: salen igual, sin Bearer */
    var F = await pagina({ modo: "falla" });
    await F.p.evaluate(function () { APP_TOKEN = "tok-prueba"; window.__AUTH.currentUser = window.__usuario; window.__authCb(window.__usuario); });
    await F.p.waitForTimeout(400); await disparaTodo(F.p); await F.p.waitForTimeout(600);
    var lf = await F.p.evaluate(function () { return window.__llamadas; });
    eq("token falla: las llamadas salen igual sin Authorization", [lf.length > 8, lf.filter(function (l) { return l.auth; }).length], [true, 0]);
    await F.ctx.close();

    /* 3a · 403 que no es de sesión (tarea ajena): no saca a nadie */
    var D = await pagina({ modo: "token", srv403: "bandeja_lista" });
    await D.p.evaluate(function () { APP_TOKEN = "tok-prueba"; window.__AUTH.currentUser = window.__usuario; window.__authCb(window.__usuario); });
    await D.p.waitForTimeout(400);
    await D.p.evaluate(function () { return llamaBandeja("bandeja_lista").catch(function () {}); }); await D.p.waitForTimeout(500);
    eq("403 de tarea ajena: sigue adentro", await D.p.evaluate(function () { return { yo: yo, salio: sessionStorage.getItem("salio") }; }), { yo: "salvador", salio: null });
    await D.ctx.close();

    /* 3b · 401 auth: al login una sola vez, con el aviso */
    var C = await pagina({ modo: "token" });
    await C.p.evaluate(function () { APP_TOKEN = "tok-prueba"; window.__AUTH.currentUser = window.__usuario; window.__authCb(window.__usuario); });
    await C.p.waitForTimeout(400);
    var nav = C.p.waitForNavigation({ timeout: 8000 }).catch(function () {});
    await C.p.evaluate(function () {
      var f0 = window.fetch;
      window.fetch = function (url, op) { if (String(url).indexOf("push.php") >= 0) { window.__llamadas.push({ a: "401" }); return Promise.resolve(new Response('{"error":"auth"}', { status: 401, headers: { "content-type": "application/json" } })); } return f0.apply(this, arguments); };
      llamaBandeja("bandeja_lista").catch(function () {}); llamaBandeja("bandeja_lista").catch(function () {}); llamaPush("aviso_del", { id: "x" });
    });
    await nav; await C.p.waitForTimeout(400);
    var c = await C.p.evaluate(function () { window.__authCb(null);
      return { salio: sessionStorage.getItem("salio"), login: !!document.getElementById("bgoogle") && document.getElementById("gate").classList.contains("on"),
        msg: (document.getElementById("gerr") || {}).textContent || "", yo: yo }; });
    eq("401 auth: cierra la sesión UNA vez y queda en el login con el aviso", c, { salio: "1", login: true, msg: "Tu sesión venció, vuelve a entrar", yo: null });
    var c2 = await C.p.evaluate(function () { pintaLogin(); return document.getElementById("gerr").textContent; });
    eq("el aviso sale una sola vez (no se queda pegado)", c2, "");
    await C.ctx.close();

    eq("sin errores de página", errs.filter(function (m) { return !/firebase is not defined/.test(m); }), []);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  await b.close();
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
