#!/usr/bin/env node
/* PRUEBAS build 192: el bote borra SIN MOTIVO solo a las recien nacidas
   (por autorizar / falta informacion desde que nacio / accidente < 15 min) y deja
   el CENSO en la tarea. Correr:  node tests/borrar.test.js
   Saca las funciones TAL CUAL de index.html y las corre con un "ahora" fijo. */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var lineas = html.split("\n");
function saca(tipo, nombre) {
  var re = tipo === "function" ? new RegExp("^function " + nombre + "\\(") : new RegExp("^var " + nombre + "\\s*=");
  var ini = -1;
  for (var i = 0; i < lineas.length; i++) if (re.test(lineas[i])) ini = i;
  if (ini < 0) throw new Error("no encontre " + tipo + " " + nombre);
  var out = [lineas[ini]];
  for (var k = ini + 1; k < lineas.length; k++) {
    var L = lineas[k];
    if (L.length && !/^[\s}]/.test(L)) break;
    out.push(L);
    if (/^}/.test(L)) break;
  }
  return out.join("\n");
}
var FUNCS = ["iso", "dDif", "dmDe", "hoy", "estadoReal", "esRecurrente", "esDecisionSal", "creadaPorSistema",
  "porAutorizar", "faltaInfoRev", "msCreacion", "_fechaDeId", "vivioTarea", "deOtrosEnTarea", "borraSinMotivo",
  "origenTarea", "textoQueLaCreo", "descartaAlNacer", "censoEjemplos"];
var VARS = ["REV_DESDE", "ACCIDENTE_MS"];
var codigo = VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" +
  FUNCS.map(function (f) { return saca("function", f); }).join("\n");

var NOW = new Date(2026, 9, 4, 9, 0, 0).getTime();   /* domingo 4-oct 09:00 local */
function ctx(tareas) {
  var RealDate = Date;
  function FakeDate() {
    var a = Array.prototype.slice.call(arguments);
    return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW);
  }
  FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC;
  var c = { Date: FakeDate, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array,
    yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, samuel: { nombre: "Samuel" } },
    tareas: tareas || [], esEjemplo: function (t) { return t.id === "demo1"; },
    guarda: function (t) { c._guardadas.push(t.id); }, sincronizaAvisos: function () {},
    selloYSigue: function (t, o) { c._sello = o; }, _guardadas: [] };
  vm.createContext(c); vm.runInContext(codigo, c); return c;
}
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }

var MIN = 60000, c = ctx();
var base = function (o) { return Object.assign({ id: "t" + Math.random().toString(36).slice(2), nombre: "x", duenio: "salvador", estado: "abierta", msgs: [] }, o); };

/* 1) POR AUTORIZAR (creada por el sistema, nadie la autorizo) */
eq("WhatsApp sin autorizar", c.borraSinMotivo(base({ id: "wa_123", creada: NOW - 86400000, f_vigente: "2026-10-06",
  msgs: [{ k: "bo", wa_in: 1, wa_c: "Juan", t: "oye mañana paso" }] })), "por_autorizar");
eq("por_autorizar:true del trabajador", c.borraSinMotivo(base({ por_autorizar: true, creada_por: "trabajador", creada: NOW - 86400000 })), "por_autorizar");
eq("del sistema pero YA autorizada -> motivo", c.borraSinMotivo(base({ id: "wa_9", creada: NOW - 86400000, autorizada: true })), "");
eq("del sistema, autorizada y desautorizada (ts) -> motivo", c.borraSinMotivo(base({ id: "wa_9", creada: NOW - 86400000, autorizada_ts: NOW - 5000 })), "");
eq("del sistema pero movida -> motivo", c.borraSinMotivo(base({ por_autorizar: true, creada: NOW - 86400000, movimientos: [{ de: "a", a: "b" }] })), "");
eq("del sistema, de otra persona -> no es mia, no aplica", c.borraSinMotivo(base({ por_autorizar: true, duenio: "samuel", creada: NOW - 86400000 })), "");

/* 2) FALTA INFORMACION desde que nacio */
eq("dictada por mi, sin fecha y con pendiente_info, hace 2 dias", c.borraSinMotivo(base({ creada_por: "salvador", creada: NOW - 2 * 86400000,
  pendiente_info: "¿Para cuándo?", msgs: [{ k: "bo", t: "comprar focos" }] })), "falta_info");
eq("falta info pero ya contesto otra persona -> motivo", c.borraSinMotivo(base({ creada_por: "salvador", creada: NOW - 2 * 86400000,
  pendiente_info: "¿Para cuándo?", msgs: [{ k: "bo", de: "samuel", t: "ya fui" }] })), "");
eq("falta info pero encargada -> motivo", c.borraSinMotivo(base({ creada_por: "salvador", creada: NOW - 2 * 86400000, pendiente_info: "x", encargado: { a: "samuel" } })), "");
eq("decision de Salvador NO cuenta como falta info", c.borraSinMotivo(base({ creada_por: "salvador", creada: NOW - 2 * 86400000,
  pendiente_tipo: "decision_salvador", pendiente_info: "¿autorizas?" })), "");

/* 3) ACCIDENTE: la acabo de crear yo */
eq("creada hace 1 min, un solo dictado", c.borraSinMotivo(base({ creada_por: "salvador", creada: NOW - MIN, f_vigente: "2026-10-04",
  msgs: [{ k: "bo", t: "compr" }, { k: "bi", t: "Listo" }] })), "accidente");
eq("creada hace 14 min", c.borraSinMotivo(base({ creada_por: "salvador", creada: NOW - 14 * MIN, f_vigente: "2026-10-05" })), "accidente");
eq("creada hace 16 min -> motivo", c.borraSinMotivo(base({ creada_por: "salvador", creada: NOW - 16 * MIN, f_vigente: "2026-10-05" })), "");
eq("creada hace 1 min pero ya dicte 2 cosas -> motivo", c.borraSinMotivo(base({ creada_por: "salvador", creada: NOW - MIN, f_vigente: "2026-10-05",
  msgs: [{ k: "bo", t: "a" }, { k: "bo", t: "b" }] })), "");
eq("sin fecha de creacion -> motivo", c.borraSinMotivo(base({ creada_por: "salvador", f_vigente: "2026-10-05" })), "");

/* 4) VIVIDAS y casos que nunca aplican */
eq("tarea normal vieja -> motivo", c.borraSinMotivo(base({ creada_por: "salvador", creada: NOW - 20 * 86400000, f_vigente: "2026-10-05" })), "");
eq("ya cerrada -> nada", c.borraSinMotivo(base({ por_autorizar: true, creada: NOW - MIN, cierre: { tipo: "hecha" } })), "");
eq("recordatorio suelto -> su propio bote", c.borraSinMotivo(base({ por_autorizar: true, creada: NOW - MIN, es_recordatorio: true })), "");
eq("ejemplo -> nada", c.borraSinMotivo(base({ id: "demo1", por_autorizar: true, creada: NOW - MIN })), "");
eq("con vueltas (recurrente que ya corrio) -> motivo", c.borraSinMotivo(base({ por_autorizar: true, creada: NOW - MIN, vueltas: [{}] })), "");
eq("dup ya resuelto (Crear tarea nueva) -> motivo", c.borraSinMotivo(base({ por_autorizar: true, creada: NOW - MIN, dup_resuelto: true })), "");

/* 5) CENSO */
var t = base({ id: "wa_77", nombre: "Pago luz", creada: NOW - 86400000,
  msgs: [{ k: "bi", t: "Creada" }, { k: "bo", wa_in: 1, wa_c: "CFE", tr: "su recibo vence el 10" }] });
c.descartaAlNacer(t, c.borraSinMotivo(t));
eq("censo: campos", [t.descartada_al_nacer, t.descartada_ts, t.descartada_como, t.censo_origen, t.censo_texto, t.censo_nombre, t.cierre.motivo],
  [true, NOW, "por_autorizar", "WhatsApp", "su recibo vence el 10", "Pago luz", "al_nacer"]);
eq("censo: se guardo y salio el bote rojo", [c._guardadas.indexOf("wa_77") >= 0, c._sello && c._sello.tipo], [true, "eliminada"]);
c._sello.restaurar();
eq("deshacer: regresa viva y sin marca", [t.cierre, t.descartada_al_nacer, t.estado], [null, null, "abierta"]);
eq("origen trabajador", c.origenTarea({ id: "x1", por_autorizar: true }), "trabajador");
eq("origen correo", c.origenTarea({ id: "x2", analisis: "llego por correo de Telmex" }), "correo");
eq("origen dictado", c.origenTarea({ id: "x3", creada_por: "salvador" }), "dictado app");

var c2 = ctx([
  { id: "a", nombre: "Llamar a Juan", descartada_al_nacer: true, descartada_ts: 5, censo_origen: "WhatsApp", censo_texto: "jaja ok" },
  { id: "b", nombre: "Pipas", enlazadas: [{ nombre: "pipa sabado", ts: 9, propuso: "trabajador (posible duplicado)" }], censo_sumados: [{ texto: "pipa extra", ts: 3, propuso: "Claude" }] }
]);
var ce = c2.censoEjemplos();
eq("censoEjemplos no_eran_tarea", ce.no_eran_tarea, [{ nombre: "Llamar a Juan", origen: "WhatsApp", texto: "jaja ok" }]);
eq("censoEjemplos vinculaciones (recientes primero)", ce.vinculaciones.map(function (x) { return x.de + ">" + x.a; }), ["pipa sabado>Pipas", "pipa extra>Pipas"]);

/* el script completo compila */
var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
eq("el script de index.html compila", okc, true);

console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
