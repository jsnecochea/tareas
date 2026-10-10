#!/usr/bin/env node
/* Nadie pisa a nadie (datosTareas, motor MySQL): la app manda solo lo que cambió, relee la tarea antes de escribir y junta
   las listas a tres bandas. Caso real 8-oct: la Mac y la app escribían la tarea completa y el último borraba al otro.
   Node puro. Correr: node tests/no-pisar.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var IDN = html.slice(html.indexOf("/* @@IDENTIDAD-INICIO"), html.indexOf("/* @@IDENTIDAD-FIN */"));   /* llamaServidor y su prueba de identidad: toda llamada al servidor pasa por ahí */
var i = html.indexOf("/* @@DATOS-TAREAS-INICIO"), j = html.indexOf("/* @@DATOS-TAREAS-FIN */");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function arma() {
  var S = { tareas: {}, sets: [], caido: false };
  var c = { console: { warn: function () {}, error: function () {}, log: console.log }, JSON: JSON, Object: Object, Array: Array, String: String, Promise: Promise, Math: Math, Date: Date,
    encodeURIComponent: encodeURIComponent, URL: URL, window: { localStorage: null, addEventListener: function () {} },
    setTimeout: function () { return 0; }, clearTimeout: function () {}, APP_TOKEN: "tok", PUSH: "push.php", COL: "bitacora_tareas", yo: "salvador", PERSONAS: {}, toast: function () {}, db: null,
    fetch: function (url, op) { var u = new URL("https://x/" + url), a = u.searchParams.get("action"), cu = op && op.body ? JSON.parse(op.body) : null;
      function r(st, j) { return Promise.resolve({ ok: st < 400, status: st, json: function () { return Promise.resolve(j); } }); }
      if (S.caido) return Promise.reject(new TypeError("Failed to fetch"));
      if (a === "fs_lista") return r(200, Object.keys(S.tareas).map(function (k) { return Object.assign({ id: k }, JSON.parse(JSON.stringify(S.tareas[k]))); }));
      if (a === "fs_doc") { var d = S.tareas[u.searchParams.get("id")]; return d ? r(200, Object.assign({ id: u.searchParams.get("id") }, JSON.parse(JSON.stringify(d)))) : r(404, { error: "no" }); }
      if (a === "fs_set") { S.sets.push(Object.keys(cu.data).filter(function (k) { return k !== "_tocado_por" && k !== "conflictos"; }).sort()); S.tareas[cu.id] = Object.assign({}, S.tareas[cu.id] || {}, cu.data); return r(200, { ok: true }); }
      return r(200, { ok: true }); } };
  vm.createContext(c); vm.runInContext(IDN + "\n" + html.slice(i, j), c); return { c: c, S: S, d: c.datosTareas };
}
var m = function (ts, t) { return { ts: ts, k: "bi", t: t }; };
(async function () {
  try {
    var A = arma();
    A.S.tareas.tX = { nombre: "Fiesta", contexto: "a", msgs: [m(1, "uno")], encargos: [{ id: "e1", estado: "abierto" }] };
    var L = await A.d.listar(); var T = JSON.parse(JSON.stringify(L.filter(function (x) { return x.id === "tX"; })[0]));
    /* la Mac escribe mientras la app tiene la tarea abierta */
    A.S.tareas.tX.msgs.push(m(2, "de la Mac")); A.S.tareas.tX._historico = { q: 1 }; A.S.tareas.tX.nombre = "Fiesta Papá";
    A.S.tareas.tX.encargos = [{ id: "e1", estado: "hecho" }];
    /* la app cambia el contexto, agrega un mensaje y un encargo */
    T.contexto = "b"; T.msgs.push(m(3, "de la app")); T.encargos.push({ id: "e2", estado: "abierto" });
    await A.d.guardar(T);
    var X = A.S.tareas.tX;
    eq("lo que cambió la app entra", X.contexto, "b");
    eq("mensajes de los dos, en orden, sin pisar", X.msgs.map(function (x) { return x.t; }), ["uno", "de la Mac", "de la app"]);
    eq("lo que solo cambió la Mac se respeta (nombre, _historico)", [X.nombre, X._historico], ["Fiesta Papá", { q: 1 }]);
    eq("encargo: el estado que puso la Mac se queda y el nuevo de la app entra", X.encargos, [{ id: "e1", estado: "hecho" }, { id: "e2", estado: "abierto" }]);
    eq("la app solo mandó lo que cambió", A.S.sets[A.S.sets.length - 1], ["contexto", "encargos", "msgs"]);
    /* la app quita un mensaje mientras la Mac agrega otro */
    L = await A.d.listar(); T = JSON.parse(JSON.stringify(L.filter(function (x) { return x.id === "tX"; })[0]));
    A.S.tareas.tX.msgs.push(m(4, "otro de la Mac"));
    T.msgs = T.msgs.filter(function (x) { return x.t !== "uno"; });
    await A.d.guardar(T);
    eq("lo que la app quitó no regresa; lo nuevo de la Mac se queda", A.S.tareas.tX.msgs.map(function (x) { return x.t; }), ["de la Mac", "de la app", "otro de la Mac"]);
    /* sin cambios: no escribe */
    var k = A.S.sets.length; L = await A.d.listar(); T = L.filter(function (x) { return x.id === "tX"; })[0]; await A.d.guardar(T);
    eq("sin cambios no se escribe nada", A.S.sets.length, k);
    /* sin red: queda en cola con su base; al volver, junta igual */
    L = await A.d.listar(); T = JSON.parse(JSON.stringify(L.filter(function (x) { return x.id === "tX"; })[0]));
    A.S.caido = true; T.msgs.push(m(5, "sin red")); await A.d.guardar(T);
    eq("sin red: queda en la cola", A.d.pendientes(), 1);
    A.S.caido = false; A.S.tareas.tX.msgs.push(m(6, "Mac mientras no había red")); await A.d.vacia();
    eq("al volver la red: junta lo de los dos", A.S.tareas.tX.msgs.map(function (x) { return x.t; }), ["de la Mac", "de la app", "otro de la Mac", "sin red", "Mac mientras no había red"]);
    eq("cola vacía", A.d.pendientes(), 0);
    /* choque: el mismo dato cambiado por la Mac y por la app → gana la persona; lo de la Mac queda en conflictos */
    L = await A.d.listar(); T = JSON.parse(JSON.stringify(L.filter(function (x) { return x.id === "tX"; })[0]));
    A.S.tareas.tX.f_vigente = "2026-11-14"; T.f_vigente = "2026-11-13"; await A.d.guardar(T);
    var Z = A.S.tareas.tX, cf = (Z.conflictos || []).slice(-1)[0] || {};
    eq("choque con la Mac: gana la persona", Z.f_vigente, "2026-11-13");
    eq("lo de la Mac queda en el historial de choques", [cf.campo, cf.otro, cf.otro_por, cf.quedo], ["f_vigente", "2026-11-14", "mac", "2026-11-13"]);
    eq("se anota quién cambió el campo", Z._tocado_por.f_vigente.por, "salvador");
    /* lo que la app recalcula sola (hecho238) no es decisión de una persona: en un choque gana lo que escribió la Mac */
    L = await A.d.listar(); T = JSON.parse(JSON.stringify(L.filter(function (x) { return x.id === "tX"; })[0]));
    A.S.tareas.tX.hecho238 = { falta: [{ q: "¿Cuál es la fecha?" }] }; T.hecho238 = { falta: [] }; await A.d.guardar(T);
    eq("choque en un campo calculado: se queda lo de la Mac", A.S.tareas.tX.hecho238, { falta: [{ q: "¿Cuál es la fecha?" }] });
    eq("y no se marca como de persona", !!(A.S.tareas.tX._tocado_por || {}).hecho238, false);
    /* guardado tardío: la app tiene la tarea (con su base), la Mac escribe, la lista se vuelve a leer, y DESPUÉS la app guarda
       el objeto viejo (como una respuesta del modelo que tarda 8 s): no deshace lo de la Mac */
    var snapObj = null; A.d.suscribir(function (sn) { sn.forEach(function (d) { if (d.id === "tX") { snapObj = d.data(); snapObj.id = d.id; } }); }, function () {});
    await new Promise(function (r) { setImmediate(r); }); await new Promise(function (r) { setImmediate(r); });
    var viejo = snapObj;
    A.S.tareas.tX.msgs.push(m(7, "Mac tarde")); A.S.tareas.tX.contexto = "de la Mac";
    await A.d.listar();   /* la base global ya trae lo de la Mac */
    viejo.msgs.push(m(8, "respuesta tardía")); viejo.notas_claude = [{ ts: 8, t: "ok" }];
    await A.d.guardar(viejo);
    var Y = A.S.tareas.tX;
    eq("guardado tardío: no borra el mensaje de la Mac ni regresa el contexto", [Y.msgs.map(function (x) { return x.t; }).slice(-2), Y.contexto], [["Mac tarde", "respuesta tardía"], "de la Mac"]);
  } catch (e) { malas.push("EXCEPCIÓN " + e.stack); }
  console.log("RESULTADO " + ok + "/" + n); if (malas.length) { console.log(malas.join("\n")); process.exit(1); }
})();
