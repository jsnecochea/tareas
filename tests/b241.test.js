#!/usr/bin/env node
/* PRUEBAS build 241 (Salvador 21:52, "Foto Anuario Colegio": "Todavía no la puedo cerrar: falta la foto" dos veces). Una orden de cerrar
   de Salvador cierra SIEMPRE (Ya está, ciérrala, por voz): la condición de la IA se ignora; la suya, cierra igual y anota "Cerrada sin
   <condición> por orden tuya". La condición solo frena a OTRA persona. Sin respuestas duplicadas. La condición que inventa la IA al
   crear (sin que Salvador la diga) queda en cierra_sugerido. Correr: node tests/b241.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 241", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 241, true);
var L = html.split("\n");
function saca(name) { var i = L.findIndex(function (l) { return l.indexOf("function " + name + "(") === 0; }); if (i < 0) throw new Error("no " + name); var out = []; for (var j = i; j < L.length; j++) { out.push(L[j]); if (j > i && /^}/.test(L[j])) break; if (j === i && /}\s*$/.test(L[j]) && (L[j].match(/{/g) || []).length === (L[j].match(/}/g) || []).length) break; } return out.join("\n"); }
var F = ["msg", "_fsa", "cierreLibre", "condicionDeIA", "faltanParaCerrar", "faltanParaCerrar0", "intentaCerrar", "cierraHecha", "cierraDicho"];
var c = { console: console, JSON: JSON, String: String, Date: Date, Math: Math, Object: Object, Array: Array, RegExp: RegExp, setTimeout: setTimeout,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, samuel: { nombre: "Samuel" }, josue: { nombre: "Josué", jefe: true, prueba: true } },
  hhmm: function () { return "21:52"; }, hoy: function () { return "2026-10-05"; }, dDif: function () { return 0; }, guarda: function () {}, sincronizaAvisos: function () {}, esRecurrente: function () { return false; } };
vm.createContext(c); vm.runInContext(F.map(saca).join("\n"), c);
function T(o) { return Object.assign({ id: "tFOTO", nombre: "Foto Anuario Colegio", duenio: "salvador", estado: "abierta", cierra: "La foto del anuario entregada", creada_por: "ia_revisor", origen: "wa_revisor", msgs: [] }, o || {}); }
var t = T(); c.intentaCerrar(t);
eq("Salvador: la condición de la IA no frena (Ya está / ciérrala)", [t.estado, !!t.cierre, t.msgs.some(function (m) { return /Todavía no/.test(m.t); }), t.msgs.some(function (m) { return /por orden tuya/.test(m.t); })], ["cerrada", true, false, false]);
var t2 = T({ creada_por: "salvador", origen: "" }); c.intentaCerrar(t2);
eq("condición que puso Salvador: cierra igual y lo anota", [t2.estado, t2.cerrada_sin, t2.msgs[0].t], ["cerrada", "la foto", "Cerrada sin la foto por orden tuya."]);
c.yo = "samuel"; var t3 = T({ duenio: "samuel" }); c.intentaCerrar(t3); c.intentaCerrar(t3);
eq("otra persona: la condición sí frena, y la respuesta no sale dos veces", [t3.estado, t3.msgs.filter(function (m) { return /Todavía no la puedo cerrar: falta la foto/.test(m.t); }).length], ["abierta", 1]);
c.yo = "josue"; var t4 = T({ duenio: "salvador" }); eq("usuario de prueba (jefe de pruebas) que no es dueño: frena", c.faltanParaCerrar(t4), ["falta la foto"]);
c.yo = "salvador";
eq("cierra_sugerido: la condición que inventó la IA no es obligación; la dicha sí", [c.cierraDicho({ cierra: "Foto del anuario", dicho: "Foto anuario colegio para el viernes" }), c.cierraDicho({ cierra: "Foto del anuario", dicho: "foto del anuario, se cierra con la foto que me mande Karina" }), c.cierraDicho({ cierra: "", dicho: "x" })], [false, true, true]);
var src = saca("creaTarea");
eq("creaTarea guarda la inventada en cierra_sugerido", /cierra:cierraDicho\(d\)\?\(d\.cierra\|\|""\):"", cierra_sugerido:cierraDicho\(d\)\?"":\(d\.cierra\|\|""\)/.test(src), true);
eq("Ya está, ciérrala por voz y por Claude pasan por la misma regla", [/var faltan=faltanParaCerrar\(t\);/.test(saca("intentaCerrar")), /f=faltanParaCerrar\(t\)\|\|\[\]/.test(html), /if\(a==="cerrar"\)\{ var f=\[\]; try\{ f=faltanParaCerrar\(t\)/.test(html)], [true, true, true]);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
