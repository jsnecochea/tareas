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
/* caso real: Salvador ya repreguntó con audio 11:21 -> solo anotar */
var t = LERDO([{ k: "bo", de: "salvador", hab: 1, t: "[audio] Manuel, ¿entonces sí es panal o no? mándame la foto", ts: H(11, 21) }]);
c.AHORA = H(11, 30);
var cand = c.candidatoClaridad(t, H(11, 30));
eq("encuentra la respuesta de Manuel a la pregunta '¿Sí es panal?'", [cand.ix, cand.qix, cand.contacto, cand.pregunta], [1, 0, "Manuel Parra", "¿Sí es panal? Mándame foto"]);
var r = c.aplicaNoClara(t, cand, NOCLARA, H(11, 30));
eq("caso real: Salvador ya repreguntó (audio) -> NO se repregunta; solo nota y espera", [r, c.WA.length, t.msgs.slice(-2).map(function (x) { return [x.t, x.canal, x.nota_ia]; })],
  ["espera", 0, [["📝 Nota IA: respuesta no clara a «¿sí es panal?» — falta: si hay o no hay panal (foto donde se vea)", "priv:salvador", 1], ["📝 Nota IA: ya le repreguntaste a Manuel Parra; no repregunto, espero su respuesta.", "priv:salvador", 1]]]);
eq("y esa respuesta ya no se vuelve a revisar", c.candidatoClaridad(t, H(12, 0)), null);
/* espera 10 min (la Mac va primero) */
t = LERDO(); eq("antes de 10 min no se revisa (la Mac va primero)", c.candidatoClaridad(t, H(10, 55)), null);
/* la Mac ya lo anotó */
t = LERDO([{ k: "bi", t: "📝 Nota IA 10:49: respuesta no clara a «¿sí es panal?» — falta: foto", ts: H(10, 49), nota_ia: 1 }]);
r = c.aplicaNoClara(t, c.candidatoClaridad(t, H(11, 0)), NOCLARA, H(11, 0));
eq("si la Mac ya lo anotó: nada (nunca doble repregunta)", [r, c.WA.length, t.msgs.length], ["mac", 0, 3]);
/* sin repregunta de Salvador: repregunta por la cola */
t = LERDO(); c.WA.length = 0; c.AHORA = H(11, 0);
r = c.aplicaNoClara(t, c.candidatoClaridad(t, H(11, 0)), NOCLARA, H(11, 0));
eq("repregunta positiva pero firme, por la cola", [r, c.WA.map(function (x) { return [x.contacto, x.texto]; })], ["repregunto", [["Manuel Parra", "IA: Gracias, Manuel. Para poder decidir necesito el dato concreto: ¿sí hay o no hay panal? (foto donde se vea)"]]]);
si("queda en la tarea '→ Manuel Parra: … · en cola'", /^→ Manuel Parra: “Gracias, Manuel/.test(t.msgs.slice(-1)[0].t));
/* otra evasiva antes de 4 h */
t.msgs.push({ k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: H(11, 30), t: "Manuel Parra: ahorita lo checo" });
r = c.aplicaNoClara(t, c.candidatoClaridad(t, H(12, 0)), NOCLARA, H(12, 0));
eq("máx 1 repregunta cada 4 h por el mismo dato", [r, c.WA.length], ["esperando", 1]);
t.msgs.push({ k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: H(15, 30), t: "Manuel Parra: creo que sí" });
r = c.aplicaNoClara(t, c.candidatoClaridad(t, H(15, 45)), { clara: false, pregunta: "¿hay panal?", falta: "foto del panal" }, H(15, 45));
eq("pasadas 4 h: 2ª repregunta (mismo dato aunque dicho distinto)", [r, c.WA.length], ["repregunto", 2]);
t.msgs.push({ k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: H(20, 0), t: "Manuel Parra: luego te digo" });
r = c.aplicaNoClara(t, c.candidatoClaridad(t, H(20, 15)), NOCLARA, H(20, 15));
var D = t.decision_dato && t.decision_dato[0];
eq("tras 2 repreguntas: tarjeta de decisión con todo el contexto (no más repreguntas)", [r, c.WA.length, D.contacto, D.pregunta, D.falta, D.n, D.resp.length, t.pendiente_tipo],
  ["escalado", 2, "Manuel Parra", "¿sí es panal?", "si hay o no hay panal (foto donde se vea)", 2, 4, "decision_salvador"]);
var vh = c.vDecisionDato(t);
si("tarjeta: pregunta, falta, respuestas y botones", /Manuel Parra no contesta: «¿sí es panal\?»/.test(vh) && /“luego te digo”/.test(vh) && />Hablo yo con él</.test(vh) && />Repregúntale otra vez</.test(vh) && />Ya no hace falta</.test(vh));
eq("Hablo yo con él: se limpia y ya no se le repregunta", [c.decideDato(t, D.id, "hablo"), t.pendiente_tipo, (t.decision_dato || []).length], ["Tú hablas con Manuel Parra; ya no le repregunto.", "", 0]);
t.msgs.push({ k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: H(22, 0), t: "Manuel Parra: mañana" });
eq("y en adelante: pausa", c.aplicaNoClara(t, c.candidatoClaridad(t, H(23, 0)), NOCLARA, H(23, 0)), "pausa");
/* respuesta clara: nada */
t = LERDO(); c.WA.length = 0;
eq("respuesta clara: nada", [c.aplicaNoClara(t, c.candidatoClaridad(t, H(11, 0)), { clara: true }, H(11, 0)), c.WA.length, t.msgs.length], ["clara", 0, 2]);
/* sin pregunta antes: no aplica */
t = { id: "x", nombre: "x", msgs: [{ k: "bo", de: "salvador", t: "Gracias Manuel", wa_auto: "Manuel Parra", ts: H(10, 0) }, { k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: H(10, 5), t: "Manuel Parra: de nada" }] };
eq("sin pregunta concreta antes: no se revisa", c.candidatoClaridad(t, H(11, 0)), null);
/* ciclo con Claude */
c.WA.length = 0; c.LLAMADAS = 0; c.IA = NOCLARA; c.tareas = [LERDO()];
c.revisaClaridadTodas(H(11, 0));
eq("ciclo: una llamada a Claude con pregunta y respuesta, y aplica", [c.LLAMADAS, /«¿Sí es panal\? Mándame foto»/.test(c.PROMPT), /no se alcanza a apreciar panal/.test(c.PROMPT), c.WA.length], [1, true, true, 1]);
si("corre junto a hitos y metas", /try\{ revisaClaridadTodas\(\); \}catch\(e3\)/.test(html));
si("la tarjeta sale arriba de la tarea", /h\+=vDecisionMeta\(t\)\+vDecisionDato\(t\)\+vQuienDudas\(t\)\+vCompartir\(t\);/.test(html));
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
