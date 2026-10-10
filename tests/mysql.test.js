#!/usr/bin/env node
/* Capa de datos de tareas (datosTareas) con push.php SIMULADO: motor por usuario, listar (fs_lista), leer (fs_doc),
   guardar (fs_set con merge), agregar mensaje (msg_agregar), hay_nuevo, escritura doble MySQL + Firestore,
   error de red -> queda en cola local, se reintenta solo y no se pierde nada; en MySQL no se borra (queda descartada).
   Node puro. Correr: node tests/mysql.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var IDN = html.slice(html.indexOf("/* @@IDENTIDAD-INICIO"), html.indexOf("/* @@IDENTIDAD-FIN */"));   /* llamaServidor y su prueba de identidad: toda llamada al servidor pasa por ahí */
var i = html.indexOf("/* @@DATOS-TAREAS-INICIO"), j = html.indexOf("/* @@DATOS-TAREAS-FIN */");
if (i < 0 || j < 0) { console.log("RESULTADO 0/1\nno encontre el bloque @@DATOS-TAREAS"); process.exit(1); }
var codigo = html.slice(i, j);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var sin = function (k, v) { return k === "_tocado_por" ? undefined : v; }; var a = JSON.stringify(got, sin), b = JSON.stringify(exp, sin);   /* _tocado_por (quién cambió cada campo) se prueba en no-pisar */ if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }

/* ---- push.php simulado: tabla tareas en memoria ---- */
function servidor() {
  var S = { tareas: {}, notas: {}, llamadas: [], caido: false, token: null };
  S.fetch = function (url, op) {
    var u = new URL("https://doit.ok-doit.com/" + url), a = u.searchParams.get("action"), cuerpo = op && op.body ? JSON.parse(op.body) : null;
    S.llamadas.push({ action: a, metodo: op.method, q: Object.fromEntries(u.searchParams), cuerpo: cuerpo, token: op.headers["x-app-token"] });
    if (S.caido) return Promise.reject(new TypeError("Failed to fetch"));
    function resp(st, j) { return Promise.resolve({ ok: st < 400, status: st, json: function () { return Promise.resolve(j); } }); }
    if (op.headers["x-app-token"] !== "tok-prueba") return resp(401, { error: "token" });
    if (a === "fs_lista") return resp(200, Object.keys(S.tareas).map(function (k) { return Object.assign({ id: k }, S.tareas[k]); }));
    if (a === "fs_doc") { var d = S.tareas[u.searchParams.get("id")]; return d ? resp(200, Object.assign({ id: u.searchParams.get("id") }, d)) : resp(404, { error: "Documento no encontrado" }); }
    if (a === "fs_set") { var id = cuerpo.id; S.tareas[id] = cuerpo.merge === false ? cuerpo.data : Object.assign({}, S.tareas[id] || {}, cuerpo.data);
      return resp(200, { ok: true, doc: Object.assign({ id: id }, S.tareas[id]) }); }
    if (a === "msg_agregar") { var l = (S.notas[cuerpo.tarea_id] = S.notas[cuerpo.tarea_id] || []); l.push(cuerpo.texto);
      return resp(200, { ok: true, tarea_id: cuerpo.tarea_id, notas: l.length, privado: cuerpo.privado, ts: 1760000000000, campo: "notas" }); }
    if (a === "hay_nuevo") return resp(200, { ok: true, bandeja_por_acomodar: 0, pedidos_pendientes: 2, ultimo_ts: 1760000000000, hay_nuevo: 1 });
    return resp(400, { error: "accion desconocida" });
  };
  return S;
}
/* ---- Firestore simulado ---- */
function firestore() {
  var F = { docs: {}, snaps: 0, borrados: [] };
  F.collection = function () { return {
    doc: function (id) { return {
      set: function (d, o) { F.docs[id] = (o && o.merge) ? Object.assign({}, F.docs[id] || {}, JSON.parse(JSON.stringify(d))) : JSON.parse(JSON.stringify(d)); return Promise.resolve(); },
      get: function () { return Promise.resolve({ exists: !!F.docs[id], data: function () { return F.docs[id]; } }); },
      delete: function () { F.borrados.push(id); delete F.docs[id]; return Promise.resolve(); } }; },
    onSnapshot: function () { F.snaps++; return function () {}; } }; };
  return F;
}
function memLS() { var m = {}; return { getItem: function (k) { return k in m ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; }, _m: m }; }

function arma(usuario, opts) {
  opts = opts || {};
  var S = opts.S || servidor(), F = firestore(), L = opts.ls || memLS(), timers = [], toasts = [];
  var c = { console: { warn: function () {}, error: function () {}, log: console.log }, JSON: JSON, Object: Object, Array: Array, String: String, Promise: Promise, Math: Math, Date: Date,
    encodeURIComponent: encodeURIComponent, URL: URL,
    window: { localStorage: L, addEventListener: function (ev, f) { if (ev === "online") c.__online = f; } },
    setTimeout: function (f, ms) { timers.push({ f: f, ms: ms }); return timers.length; }, clearTimeout: function (k) { if (timers[k - 1]) timers[k - 1].f = null; },
    fetch: S.fetch, APP_TOKEN: "tok-prueba", PUSH: "push.php", COL: "bitacora_tareas", yo: usuario, PERSONAS: opts.personas || {}, db: F,
    toast: function (x) { toasts.push(x); } };
  vm.createContext(c); vm.runInContext(IDN + "\n" + codigo, c);
  return { c: c, S: S, F: F, L: L, timers: timers, toasts: toasts, d: c.datosTareas,
    corre: function () { var t = timers.filter(function (x) { return x.f; }); timers.length = 0; t.forEach(function (x) { x.f(); }); return t.map(function (x) { return x.ms; }); } };
}
function espera() { return new Promise(function (r) { setImmediate(r); }); }
async function vueltas(k) { for (var x = 0; x < (k || 6); x++) await espera(); }

(async function () {
  try {
    /* 1 · motor por usuario */
    eq("salvador ya en MySQL (todos en MySQL por omisión)", arma("salvador").d.motor(), "mysql");
    eq("prueba_claude arranca en MySQL", arma("prueba_claude").d.motor(), "mysql");
    eq("la ficha (bitacora_personas.motor) manda sobre la omisión", arma("josue", { personas: { josue: { motor: "firestore" } } }).d.motor(), "firestore");
    var lsF = memLS(); lsF.setItem("doit_motor_tareas", "firestore");
    eq("localStorage manda sobre todo (regreso a Firestore en un teléfono)", arma("prueba_claude", { ls: lsF }).d.motor(), "firestore");

    /* 2 · Firestore intacto para quien sigue ahí */
    var lsA = memLS(); lsA.setItem("doit_motor_tareas", "firestore"); var A = arma("salvador", { ls: lsA }); A.d.guardar({ id: "t1", nombre: "Uno" }); await vueltas();
    eq("Firestore: guardar escribe en Firestore", A.F.docs.t1, { id: "t1", nombre: "Uno" });
    eq("Firestore: no toca push.php", A.S.llamadas.length, 0);
    A.d.suscribir(function () {}, function () {}); eq("Firestore: la lista sigue siendo el onSnapshot", A.F.snaps, 1);

    /* 3 · MySQL: listar */
    var B = arma("prueba_claude"); B.S.tareas = { tA: { nombre: "Planos Parra", duenio: "prueba_claude" }, tB: { nombre: "Otra", duenio: "salvador" } };
    var lista = await B.d.listar();
    eq("listar trae todo de fs_lista", lista.map(function (o) { return o.id + ":" + o.nombre; }).sort(), ["tA:Planos Parra", "tB:Otra"]);
    var q = B.S.llamadas[0]; eq("fs_lista con col=bitacora_tareas, limit 1000 y el token", [q.action, q.q.col, q.q.limit, q.metodo, q.token], ["fs_lista", "bitacora_tareas", "1000", "GET", "tok-prueba"]);

    /* 4 · leer */
    eq("leer una (fs_doc)", (await B.d.leer("tA")).nombre, "Planos Parra");
    eq("leer una que no existe -> null (404)", await B.d.leer("tNO"), null);

    /* 5 · guardar = escritura doble */
    var t = { id: "tPRUEBA_CLAUDE_MYSQL", nombre: "Prueba MySQL", duenio: "prueba_claude", msgs: [{ k: "yo", t: "hola" }] };
    await B.d.guardar(t); await vueltas();
    eq("guardar sube a MySQL (fs_set merge=true, sin id dentro de data)", B.S.tareas.tPRUEBA_CLAUDE_MYSQL, { nombre: "Prueba MySQL", duenio: "prueba_claude", msgs: [{ k: "yo", t: "hola" }] });
    var fsSet = B.S.llamadas.filter(function (x) { return x.action === "fs_set"; })[0];
    eq("fs_set va por POST con col, id y merge", [fsSet.metodo, fsSet.cuerpo.col, fsSet.cuerpo.id, fsSet.cuerpo.merge, fsSet.q.col], ["POST", "bitacora_tareas", "tPRUEBA_CLAUDE_MYSQL", true, "bitacora_tareas"]);
    eq("y también queda en Firestore (escritura doble)", B.F.docs.tPRUEBA_CLAUDE_MYSQL.nombre, "Prueba MySQL");
    eq("la cola queda vacía", B.d.pendientes(), 0);
    await B.d.guardarCampos("tA", { encargos: [{ id: "e1" }] }); await vueltas();
    eq("guardarCampos hace merge en MySQL sin borrar lo demás", B.S.tareas.tA, { nombre: "Planos Parra", duenio: "prueba_claude", encargos: [{ id: "e1" }] });
    eq("guardarCampos hace merge en Firestore", B.F.docs.tA, { encargos: [{ id: "e1" }] });

    /* 6 · agregar mensaje y hay_nuevo */
    var r = await B.d.agregarMsg("tA", "nota de prueba", false);
    eq("msg_agregar (POST tarea_id, texto, privado)", [r.ok, r.campo, B.S.notas.tA], [true, "notas", ["nota de prueba"]]);
    var h = await B.d.hayNuevo(1759999999999); var hq = B.S.llamadas[B.S.llamadas.length - 1];
    eq("hay_nuevo con usuario y desde_ts", [h.hay_nuevo, hq.q.usuario, hq.q.desde_ts], [1, "prueba_claude", "1759999999999"]);

    /* 7 · error de red -> cola local, reintento, sin pérdida */
    var C = arma("prueba_claude"); C.S.caido = true;
    await C.d.guardar({ id: "tRED", nombre: "Sin red", estado: "abierta" }); await vueltas();
    eq("sin red: Firestore sí la tiene", C.F.docs.tRED.nombre, "Sin red");
    eq("sin red: queda 1 en la cola local", C.d.pendientes(), 1);
    eq("la cola vive en localStorage (sobrevive a cerrar la app)", Object.keys(JSON.parse(C.L.getItem("doit_cola_mysql"))), ["tRED"]);
    await C.d.guardar({ id: "tRED", nombre: "Sin red", estado: "hoy" }); await vueltas();
    eq("dos cambios sin red: se queda la versión más nueva", JSON.parse(C.L.getItem("doit_cola_mysql")).tRED.cambios.estado, "hoy");
    var ms1 = C.corre(); await vueltas();
    eq("reintenta con espera creciente", ms1.length >= 1 && ms1[0] >= 2000, true);
    eq("sigue sin red: no se pierde", C.d.pendientes(), 1);
    var lst = (C.S.caido = false, await C.d.listar());
    eq("mientras no sube, la lista la muestra como el usuario la dejó", lst.filter(function (o) { return o.id === "tRED"; })[0].estado, "hoy");
    C.corre(); await vueltas();
    eq("vuelve la red: sube sola a MySQL", C.S.tareas.tRED, { nombre: "Sin red", estado: "hoy" });
    eq("y la cola queda vacía", [C.d.pendientes(), JSON.parse(C.L.getItem("doit_cola_mysql"))], [0, {}]);
    /* la app se cerró sin red y se vuelve a abrir */
    var L2 = memLS(); L2.setItem("doit_cola_mysql", JSON.stringify({ tVIEJA: { nombre: "Pendiente de ayer" } }));
    var D = arma("prueba_claude", { ls: L2 }); D.d.suscribir(function () {}, function () {}); await vueltas();
    eq("al abrir la app sube lo que quedó pendiente", D.S.tareas.tVIEJA, { nombre: "Pendiente de ayer" });
    /* evento online */
    var E = arma("prueba_claude"); E.S.caido = true; await E.d.guardar({ id: "tON", nombre: "x" }); await vueltas();
    E.S.caido = false; E.c.__online(); await vueltas();
    eq("al volver la red (evento online) se vacía la cola", [E.S.tareas.tON && E.S.tareas.tON.nombre, E.d.pendientes()], ["x", 0]);

    /* 8 · en MySQL no se borra */
    var G = arma("prueba_claude"); G.S.tareas.tDES = { nombre: "Deshecha" }; G.F.docs.tDES = { nombre: "Deshecha" };
    G.d.borrar("tDES"); await vueltas();
    eq("borrar: en MySQL queda descartada (no se borra)", [G.S.tareas.tDES.nombre, G.S.tareas.tDES.estado], ["Deshecha", "descartada"]);
    eq("borrar: Firestore como siempre", G.F.borrados, ["tDES"]);

    /* 9 · suscribir en MySQL: snap igual al de Firestore, solo avisa si cambió, reintenta si falla */
    var H = arma("prueba_claude"); H.S.tareas = { t1: { nombre: "Uno" } }; var snaps = [], fallas = 0;
    H.d.suscribir(function (s) { var a = []; s.forEach(function (d) { a.push(d.id + ":" + d.data().nombre + ":" + ("id" in d.data())); }); snaps.push({ a: a, cache: s.metadata.fromCache }); }, function () { fallas++; });
    await vueltas();
    eq("primera lectura llega como snap de Firestore (id aparte, fromCache false)", snaps, [{ a: ["t1:Uno:false"], cache: false }]);
    H.corre(); await vueltas(); eq("si nada cambió no vuelve a pintar", snaps.length, 1);
    H.S.tareas.t2 = { nombre: "Dos" }; H.corre(); await vueltas(); eq("si cambió, pinta", snaps.length, 2);
    H.S.caido = true; H.corre(); await vueltas(); H.corre(); await vueltas();
    eq("si falla la red avisa UNA vez y sigue intentando", [fallas, H.toasts.length, H.timers.filter(function (x) { return x.f; }).length], [2, 1, 1]);
    H.d.para(); H.S.caido = false; H.corre(); await vueltas(); eq("para() detiene la lectura", snaps.length, 2);

    /* 10 · sin token no se llama al servidor */
    var I = arma("prueba_claude"); I.c.APP_TOKEN = "__APP_TOKEN__"; await I.d.guardar({ id: "tTK", nombre: "x" }); await vueltas();
    eq("sin token: no llama, queda en cola", [I.S.llamadas.length, I.d.pendientes()], [0, 1]);

    /* 11 · la app pasa por la capa (nadie escribe tareas directo a Firestore) */
    var fuera = html.slice(0, i) + html.slice(j);
    eq("fuera de la capa no hay db.collection(COL)", (fuera.match(/db\.collection\(COL\)/g) || []).length, 0);
    eq("la lista se engancha con datosTareas.suscribir", /datosTareas\.suscribir\(function\(snap\)\{\s*dbFail=false;/.test(html), true);
    eq("guarda() usa datosTareas.guardar", /_p=datosTareas\.guardar\(t\)/.test(html), true);
    eq("no hay token escrito en el repo", /var APP_TOKEN="__APP_TOKEN__";/.test(html), true);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
