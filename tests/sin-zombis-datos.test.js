#!/usr/bin/env node
/* Nada se queda colgado ni se pisa en la capa de datos (Salvador 10-oct 08:05, «que nada se quede zombi»). Node puro, push.php simulado.
   1) llamaServidor tiene tope: un fetch que nunca contesta se corta (abort) y la promesa falla con «tope»; uno que contesta a
      tiempo no deja el reloj vivo. 2) La cola de MySQL sube de una en una: dos guardados casi juntos no suben en paralelo y lo
      último que queda en el servidor es lo más reciente. 3) La lectura de cada 20 s se vuelve a programar aunque pintar truene.
   4) Cerrar sesión con cambios sin subir: la cola se aparta para ese usuario (no se borra) y regresa cuando él vuelve a entrar.
   Correr: node tests/sin-zombis-datos.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var IDN = html.slice(html.indexOf("/* @@IDENTIDAD-INICIO"), html.indexOf("/* @@IDENTIDAD-FIN */"));
var codigo = html.slice(html.indexOf("/* @@DATOS-TAREAS-INICIO"), html.indexOf("/* @@DATOS-TAREAS-FIN */"));
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function memLS() { var m = {}; return { getItem: function (k) { return k in m ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; }, _m: m }; }
function resp(st, j) { return Promise.resolve({ ok: st < 400, status: st, json: function () { return Promise.resolve(j); } }); }
/* push.php simulado: cada fs_set puede quedar detenido hasta soltarlo a mano (para ver si hay dos en camino a la vez) */
function servidor() {
  var S = { tareas: {}, llamadas: [], detenidos: [], detener: false, enCamino: 0, maxEnCamino: 0, caido: false };
  S.fetch = function (url, op) {
    var u = new URL("https://doit.ok-doit.com/" + url), a = u.searchParams.get("action"), c = op && op.body ? JSON.parse(op.body) : null;
    S.llamadas.push(a);
    if (S.caido) return Promise.reject(new TypeError("Failed to fetch"));
    if (a === "fs_lista") return resp(200, Object.keys(S.tareas).map(function (k) { return Object.assign({ id: k }, S.tareas[k]); }));
    if (a === "fs_doc") { var d = S.tareas[u.searchParams.get("id")]; return d ? resp(200, Object.assign({ id: u.searchParams.get("id") }, JSON.parse(JSON.stringify(d)))) : resp(404, { error: "no" }); }
    if (a === "fs_set") {
      S.enCamino++; S.maxEnCamino = Math.max(S.maxEnCamino, S.enCamino);
      var aplica = function () { S.enCamino--; S.tareas[c.id] = Object.assign({}, S.tareas[c.id] || {}, c.data); return resp(200, { ok: true }); };
      if (!S.detener) return aplica();
      return new Promise(function (r) { S.detenidos.push(function () { r(aplica()); }); });
    }
    return resp(400, { error: "accion" });
  };
  return S;
}
function arma(usuario, opts) {
  opts = opts || {};
  var S = opts.S || servidor(), L = opts.ls || memLS(), timers = [];
  var c = { console: { warn: function () {}, error: function () {}, log: console.log }, JSON: JSON, Object: Object, Array: Array, String: String, Promise: Promise, Math: Math, Date: Date,
    encodeURIComponent: encodeURIComponent, URL: URL, AbortController: AbortController,
    window: { localStorage: L, addEventListener: function () {} },
    setTimeout: opts.relojReal ? setTimeout : function (f, ms) { timers.push({ f: f, ms: ms }); return timers.length; },
    clearTimeout: opts.relojReal ? clearTimeout : function (k) { if (timers[k - 1]) timers[k - 1].f = null; },
    fetch: opts.fetch || S.fetch, APP_TOKEN: "tok-prueba", PUSH: "push.php", COL: "bitacora_tareas", yo: usuario, PERSONAS: {}, db: null, toast: function () {} };
  vm.createContext(c); vm.runInContext(IDN + "\n" + codigo, c);
  return { c: c, S: S, L: L, timers: timers, d: c.datosTareas };
}
function espera(ms) { return new Promise(function (r) { setTimeout(r, ms || 0); }); }
async function vueltas(k) { for (var x = 0; x < (k || 8); x++) await new Promise(function (r) { setImmediate(r); }); }

(async function () {
  try {
    /* 1 · tope en llamaServidor */
    var abortada = null;
    var A = arma("salvador", { relojReal: true, fetch: function (url, op) { return new Promise(function (_ok, no) { op.signal.addEventListener("abort", function () { abortada = true; }); }); } });
    eq("tope por omisión: 20 s", A.c.TOPE_SERVIDOR_MS, 20000);
    var t0 = Date.now(), r1 = await A.c.llamaServidor("push.php?action=fs_doc", { method: "GET", headers: {}, tope: 80 }).then(function () { return "contestó"; }, function (e) { return [e.tope === true, /tope/.test(e.message)]; });
    eq("un fetch que nunca contesta se corta con «tope»", r1, [true, true]);
    eq("y se aborta la conexión (AbortController)", abortada, true);
    eq("corta cerca del tope (no espera de más)", Date.now() - t0 < 1500, true);
    var B = arma("salvador");
    await B.c.llamaServidor("push.php?action=fs_lista", { method: "GET", headers: {} }); await vueltas();
    eq("si contesta a tiempo, el reloj del tope se apaga", B.timers.filter(function (x) { return x.f; }).length, 0);
    eq("tope:0 = sin reloj (claude.php trae su propio corte)", (B.c.llamaServidor("push.php?action=fs_lista", { method: "GET", headers: {}, tope: 0 }), B.timers.length), 1);
    eq("la lista completa (fs_lista) lleva tope más largo", /if\(accion==="fs_lista"\) op\.tope=MYSQL_TOPE_LISTA_MS;/.test(codigo) && B.c.MYSQL_TOPE_LISTA_MS > B.c.TOPE_SERVIDOR_MS, true);
    var Lc = memLS(); Lc.setItem("doit_cola_mysql", JSON.stringify({ tX: { __v: 2, cambios: { nombre: "X" }, base: {} } }));
    var C0 = arma("salvador", { relojReal: true, ls: Lc, fetch: function () { return new Promise(function () {}); } });
    C0.c.TOPE_SERVIDOR_MS = 60;
    var rv = await Promise.race([C0.d.vacia().then(function () { return "subió"; }, function (e) { return "falló: " + (e.tope ? "tope" : e.message); }), espera(2000).then(function () { return "COLGADA"; })]);
    eq("vacia() con el servidor mudo no se queda colgada: falla por tope y reintenta", rv, "falló: tope");
    eq("y lo que no subió sigue en la cola", C0.d.pendientes(), 1);

    /* 2 · una subida a la vez; gana lo más reciente */
    var S = servidor(); S.tareas.t1 = { nombre: "Uno", nota: "a" };
    var D = arma("salvador", { S: S });
    await D.d.listar();
    S.detener = true;
    var t = { id: "t1", nombre: "Uno", nota: "b" };
    var p1 = D.d.guardar(t); await vueltas();
    t.nota = "c"; var p2 = D.d.guardar(t); await vueltas();
    eq("mientras sube el primero, el segundo NO sale en paralelo", [S.enCamino, S.llamadas.filter(function (x) { return x === "fs_set"; }).length], [1, 1]);
    S.detenidos.shift()(); await vueltas(12);
    eq("al terminar el primero sale el segundo", S.llamadas.filter(function (x) { return x === "fs_set"; }).length, 2);
    S.detenidos.shift()(); await Promise.all([p1, p2]); await vueltas();
    eq("nunca hubo dos subidas a la vez", S.maxEnCamino, 1);
    eq("en el servidor queda lo más reciente", S.tareas.t1.nota, "c");
    eq("y la cola queda vacía", D.d.pendientes(), 0);
    eq("el segundo no se cuenta como choque consigo mismo", S.tareas.t1.conflictos || [], []);

    /* 3 · la lectura periódica se reprograma aunque pintar truene */
    var E = arma("salvador"); E.S.tareas.t9 = { nombre: "Nueve" };
    E.d.suscribir(function () { throw new Error("render tronó"); }, function () {});
    for (var k = 0; k < 4; k++) { E.timers.filter(function (x) { return x.f && x.ms === 15000; }).forEach(function (x) { x.f = null; }); await vueltas(); }
    eq("tras un pintado que truena, la siguiente vuelta queda programada", E.timers.some(function (x) { return x.f && x.ms === E.c.MYSQL_CADA_MS; }), true);

    /* 4 · cerrar sesión con cambios sin subir: se apartan para ese usuario y regresan */
    var L = memLS(); L.setItem("doit_cola_mysql", JSON.stringify({ tA: { __v: 2, cambios: { nombre: "A" }, base: {} }, tB: { __v: 2, cambios: { nombre: "B" }, base: {} } }));
    var F = arma("josue", { ls: L });
    eq("aparta: cuántos quedaron guardados", F.d.aparta("josue"), 2);
    eq("la cola activa queda vacía (otra cuenta no los sube con su nombre) y lo apartado está bajo josue",
      [L.getItem("doit_cola_mysql"), Object.keys(JSON.parse(L.getItem("doit_cola_mysql_de_josue")))], [null, ["tA", "tB"]]);
    var G = arma("salvador", { ls: L });
    eq("otra cuenta no recupera lo de josue", [G.d.recupera("salvador"), G.d.pendientes()], [0, 0]);
    var H = arma("josue", { ls: L });
    eq("josue vuelve a entrar: regresan a su cola", [H.d.recupera("josue"), H.d.pendientes(), L.getItem("doit_cola_mysql_de_josue")], [2, 2, null]);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
