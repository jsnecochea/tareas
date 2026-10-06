#!/usr/bin/env node
/* PRUEBAS build 220 (Carlos 10:12): las palomitas LEEN de wa_estados (plural, tope 200, {pedidos, no_encontrados}, horas en
   null); wa_estado (singular) es de ESCRITURA de la Mac y no se usa en la app. Los no_encontrados se dejan de pedir.
   Notificaciones: la clave canonica "espera" (Urgente) existe y esta encendida en todos los atajos menos "Ninguna".
   Correr: node tests/b220.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"), L = html.split("\n");
function saca(n) { var re = new RegExp("^(function " + n.replace(/\$/g, "\\$") + "\\(|var " + n + "\\s*=)"), i = -1; L.forEach(function (l, k) { if (re.test(l)) i = k; });
  if (i < 0) throw new Error("no encontre " + n); var o = [L[i]]; for (var k = i + 1; k < L.length; k++) { var x = L[k]; if (x.length && !/^[\s}\]]/.test(x)) break; o.push(x); if (/^}/.test(x)) break; } return o.join("\n"); }
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
si("VERSION_APP build 220 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 220);
si("la app lee de wa_estados y nunca llama a wa_estado (escritura de la Mac)", /\?action=wa_estados"/.test(html) && !/\?action=wa_estado"/.test(html) && !/llamaPush\("wa_estado"/.test(html));
var F = ["WA_EST", "nivelWA", "llevaPalomitas", "pidsWA", "nivelMsgWA", "_estadosDe", "aplicaEstadosWA", "WA_EST_TOPE", "consultaEstadosWA"];
var c = { PUSH: "push.php", APP_TOKEN: "tok", yo: "salvador", vista: "lista", abierta: null, window: {}, FETCH: [], RESP: null, G: 0, Date: Date, JSON: JSON, String: String, Array: Array, Object: Object, Math: Math, Promise: Promise,
  guarda: function () { c.G++; }, render: function () {} };
c.fetch = function (u, o) { c.FETCH.push({ u: u, b: JSON.parse(o.body) }); var r = c.RESP; return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve(typeof r === "function" ? r() : r); } }); };
vm.createContext(c); vm.runInContext(F.map(saca).join("\n"), c);
(async function () {
  var now = Date.now();
  var t = { id: "t1", msgs: [{ k: "bo", t: "a", wa_auto: "R", wa_pid: "a1", ts: now }, { k: "bo", t: "b", wa_auto: "R", wa_pid: "viejo1", ts: now }] };
  c.RESP = { pedidos: [{ id: "a1", estado: "enviado", enviado_en: "2026-10-05 10:20:00", entregado_en: null, leido_en: null, tarea_id: "t1", contacto: "R" }], no_encontrados: ["viejo1"] };
  await c.consultaEstadosWA(t);
  eq("pide a wa_estados con {usuario, ids}", [c.FETCH[0].u, c.FETCH[0].b], ["push.php?action=wa_estados", { usuario: "salvador", ids: ["a1", "viejo1"] }]);
  eq("horas en null no inventan: enviado = ✓ (nivel 1)", t.msgs[0].wa_st.a1, { n: 1, e: "enviado" });
  eq("no_encontrados queda marcado en el mensaje", t.msgs[1].wa_st.viejo1, { n: 0, e: "", ne: 1 });
  c.FETCH.length = 0; c.RESP = { pedidos: [{ id: "a1", estado: "enviado", enviado_en: "x", entregado_en: "2026-10-05 10:21:00", leido_en: null }], no_encontrados: [] };
  await c.consultaEstadosWA(t);
  eq("y ya no se vuelve a pedir", c.FETCH[0].b.ids, ["a1"]);
  eq("entregado_en -> ✓✓ gris", t.msgs[0].wa_st.a1.n, 2);
  c.FETCH.length = 0; c.RESP = { error: "error temporal de base de datos" };
  await c.consultaEstadosWA(t); await c.consultaEstadosWA(t);
  eq("una falla temporal NO apaga la consulta (sigue preguntando)", [c.FETCH.length, !!c.window.__waEstNo], [2, false]);
  c.FETCH.length = 0; c.RESP = { pedidos: [], no_encontrados: ["a1"] };
  var cam = await c.consultaEstadosWA(t);
  eq("solo no_encontrados (pedidos vacío) también se aplica", [cam, t.msgs[0].wa_st.a1.ne, t.msgs[0].wa_st.a1.n], [true, 1, 2]);
  var big = { id: "t2", msgs: [] }; for (var i = 0; i < 250; i++) big.msgs.push({ k: "bo", t: "x" + i, wa_auto: "R", wa_pid: "p" + i, ts: now });
  c.FETCH.length = 0; c.RESP = { pedidos: [], no_encontrados: [] };
  await c.consultaEstadosWA(big);
  eq("tope de 200 ids por llamada (los más recientes)", [c.FETCH[0].b.ids.length, c.FETCH[0].b.ids[0], c.FETCH[0].b.ids[199]], [200, "p50", "p249"]);
  c.FETCH.length = 0; c.RESP = { error: "accion desconocida" };
  await c.consultaEstadosWA(t = { id: "t3", msgs: [{ k: "bo", t: "a", wa_auto: "R", wa_pid: "z1", ts: now }] }); await c.consultaEstadosWA(t);
  eq("si el servidor dice que la acción no existe: deja de preguntar", [c.FETCH.length, !!c.window.__waEstNo], [1, true]);
  /* ---------- notificaciones: clave "espera" ---------- */
  var N = { PERSONAS: { salvador: {} }, yo: "salvador", _nn: null, JSON: JSON, String: String, Object: Object };
  vm.createContext(N); vm.runInContext(["NOTIF_VERSION", "NOTIF_TIPOS", "NOTIF_PRESETS", "NOTIF_NIVEL", "NOTIF_DEFECTO", "_nn", "notifDePreset", "notifDefectoDe", "notifPrefs", "notifGuardadas", "notifPermite", "tipoDePush"].map(saca).join("\n"), N);
  var esp = N.NOTIF_TIPOS.filter(function (x) { return x.k === "espera"; });
  eq("hay UNA clave 'espera', grupo Urgente, texto 'Alguien te espera o está atorado'", esp.map(function (x) { return [x.grupo, x.nivel, x.tx]; }), [["Urgente", "urgente", "Alguien te espera o está atorado"]]);
  eq("encendida en Solo urgente, Normal y Todas; apagada en Ninguna", ["ninguna", "urgente", "normal", "todas"].map(function (k) { return N.notifDePreset(k).espera; }), [false, true, true, true]);
  eq("no hay otra clave vieja para lo mismo (nada que migrar)", N.NOTIF_TIPOS.filter(function (x) { return /espera|atorad|consulta/i.test(x.k + " " + x.tx); }).map(function (x) { return x.k; }), ["espera"]);
  eq("los avisos de consulta / atorado se clasifican 'espera'", [N.tipoDePush("Alguien te espera", ""), N.tipoDePush("Tarea atorada", "")], ["espera", "espera"]);
  N.PERSONAS.salvador.notif = { v: 1, tipos: { espera: false } };
  eq("la preferencia guardada de 'espera' se respeta tal cual", N.notifPermite("salvador", "espera"), false);
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
