#!/usr/bin/env node
/* PRUEBAS build 223 (Salvador 11:23): respuesta NO clara a una pregunta concreta, leída por el Claude de la app.
   Nota "📝 Nota IA: respuesta no clara a «…» — falta: …"; repregunta por la cola (máx 1 cada 4 h por el mismo dato); si Salvador
   ya repreguntó (audio incluido) solo se anota; tras 2 repreguntas, tarjeta de decisión. Espera 10 min y no duplica a la Mac (v18m).
   Caso real tIAMUVF22TRJF: Manuel 10:48 "no se alcanza a apreciar panal por todo el ramerío"; Salvador audio 11:21. Correr: node tests/b223.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"), L = html.split("\n");
function saca(n) { var re = new RegExp("^(function " + n.replace(/\$/g, "\\$") + "\\(|var " + n + "\\s*=)"), i = -1; L.forEach(function (l, k) { if (re.test(l)) i = k; });
  if (i < 0) throw new Error("no encontre " + n); var o = [L[i]]; for (var k = i + 1; k < L.length; k++) { var x = L[k]; if (x.length && !/^[\s}\]]/.test(x)) break; o.push(x); if (/^}/.test(x)) break; } return o.join("\n"); }
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
si("VERSION_APP build 223", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 223);
var F = ["_nn", "_n179", "nombreCorto", "tareaCorta", "CLARIDAD_ESPERA_MS", "_quienMsg", "_esPreguntaA", "candidatoClaridad", "_raizDato", "aplicaNoClara", "promptClaridad", "revisaClaridadTodas", "decideDato", "vDecisionDato"];
var c = { yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador" }, samuel: { nombre: "Samuel" } }, window: {}, vista: "lista", abierta: null, WA: [], PUSH: [], IA: null, tareas: [],
  JSON: JSON, String: String, Array: Array, Object: Object, Math: Math, Date: Date, RegExp: RegExp,
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx, ts: c.AHORA }); }, guarda: function () {}, render: function () {},
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); },
  estadoReal: function () { return "abierta"; }, urlTarea: function (id) { return "u:" + id; }, disparaPushInstantaneo: function (k, a, b) { c.PUSH.push([k, b]); },
  pideWhatsApp: function (cpo) { c.WA.push(cpo); return Promise.resolve({ id: "p" + c.WA.length }); },
  preguntaAClaude: function (m, mod, cb) { c.LLAMADAS = (c.LLAMADAS || 0) + 1; c.PROMPT = m[0].content; cb(JSON.stringify(c.IA), null); } };
vm.createContext(c); vm.runInContext(F.map(saca).join("\n"), c);
var H = function (hh, mm) { return new Date("2026-10-05T" + String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0") + ":00").getTime(); };
function LERDO(extra) {
  return { id: "tIAMUVF22TRJF", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", msgs: [
    { k: "bo", de: "salvador", t: "¿Sí es panal? Mándame foto", wa_auto: "Manuel Parra", ts: H(10, 30) },
    { k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: H(10, 48), t: "Manuel Parra: Hablé con Esteban y él mismo con Martín cortarán las ramas, dicen que no se alcanza a apreciar panal, por todo el ramerío, pero que ellos se avientan la misión con serrucho y tijeras de jardinería" }].concat(extra || []) };
}
var NOCLARA = { clara: false, pregunta: "¿sí es panal?", falta: "si hay o no hay panal (foto donde se vea)", texto: "IA: Gracias, Manuel. Para poder decidir necesito el dato concreto: ¿sí hay o no hay panal? (foto donde se vea)" };
/* build 267: el mecanismo de "respuesta no clara" está APAGADO; el seguimiento a terceros lo lleva la Mac con plan[] */
var t = LERDO(); c.AHORA = H(11, 30);
var cand = c.candidatoClaridad(t, H(11, 30));
eq("sigue detectando la respuesta (función pura), pero ya no se aplica", [cand.contacto, cand.pregunta], ["Manuel Parra", "¿Sí es panal? Mándame foto"]);
var n0 = t.msgs.length, r = c.aplicaNoClara(t, cand, NOCLARA, H(11, 30));
eq("aplicaNoClara ya no escribe nada: ni nota, ni repregunta, ni registros", [r, c.WA.length, t.msgs.length - n0, t.repreg || null, t.decision_dato || null, t.pendiente_tipo || "", t.msgs[1].claridad || null], ["", 0, 0, null, null, "", null]);
c.WA.length = 0; c.LLAMADAS = 0; c.IA = NOCLARA; c.tareas = [LERDO()];
c.revisaClaridadTodas(H(11, 0));
eq("revisaClaridadTodas no llama a Claude ni manda WhatsApp", [c.LLAMADAS, c.WA.length], [0, 0]);
si("ya no corre junto a hitos y metas", !/try\{ revisaClaridadTodas\(\); \}catch\(e3\)/.test(html));
si("build 266: la ficha de botones ya no sale en la tarea; es pregunta en texto (registroPreg)", !/h\+=vDecisionMeta\(t\)\+vDecisionDato\(t\)/.test(html) && /registroPreg/.test(html));
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
