#!/usr/bin/env node
/* PRUEBAS build 194 (F37): "abre el costo de la barda" busca en TODAS las tareas (tambien
   cerradas) y en sus datos. Fixture = forma real de tBARDA_MANUEL_031026 (leida por el
   conector Doit 2026-10-04) + 3 senuelos. Correr: node tests/buscar.test.js */
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
var FUNCS = ["_bw", "_bst", "_bpega", "palabrasBusqueda", "camposBusqueda", "_snip", "buscaTodo", "busquedaClara",
  "pideBuscar", "fraseCortaDeBusqueda", "vDatosTarea", "abreBusqueda"];
var codigo = saca("var", "BUSCA_VACIAS") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");

var BARDA = { id: "tBARDA_MANUEL_031026", nombre: "Barda Manuel Parra", duenio: "salvador", estado: "no_ejecutada", tocada: 1791090899254,
  cierra: "Manuel Parra confirma precio total y metros lineales de la barda",
  cierre: { culpa: "nadie", f: "2026-10-03", motivo: "ya_no", tipo: "no_ejecutada" },
  analisis: "Creada 3-oct 13:4x MTY. Comparada con tCOMEDOR_NUEVO_300926 (piedra/melamina del comedor), tOBRA_EXTERIOR_021026, tPEDIDOS_OBRAS_011026 y tmuqb29xtdvjzk (checklist Cumbres, bardas): ninguna trata de la barda ya construida con Manuel.",
  notas_claude: [{ t: "Claude, esta tarea ya no me la tienes que mostrar, nomás cerciórate que Manuel me responda el precio del portón… sólo quiero tener la info para cuando te la pida", ts: 1 }],
  datos_corregidos: [{ t: "COSTO BARDA (foto de Manuel Parra, WhatsApp 3-oct 13:40, 'Bardeado terreno baldío Cumbres', frente 30.00 mL), monto pagado: Muro de Durock 2.40 m alto x 26.00 mL $58,500.00 · Portón 4.00 m con camino de concreto para rueda y poste PTR $20,237.00 · Estuco muro y portón $11,720.00 · Pintura muro y portón $9,500.00 · 6 sicomoros $9,000.00 · Grava triturada 3/4\" $2,025.00 · TOTAL $110,982.00 · Costo promedio por mL fachada terminada $3,699.40.", ts: 2 }],
  msgs: [
    { k: "bi", origen: "wa_saliente", wa_c: "Salvador Necochea", chat: "Manuel Parra", t: "Salvador: [audio] ¿Me pasaste precio total de la barda que hicimos y cuántos metros lineales fueron?", ts: 1 },
    { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel: [foto]", tipo: "foto", analisis: "Foto reenviada por Manuel, probablemente la cotización de la barda.", ts: 2 },
    { k: "bo", canal: "ext:Manuel Parra", wa_auto: "Manuel Parra", t: "Manuel, porfs el lunes me pones el precio del portón. Mi duda es que tanta diferencia hay del precio en el muro de duroc vs portón!", ts: 3 }
  ] };
var CHECK = { id: "tmuqb29xtdvjzk", nombre: "Checklist Cumbres", duenio: "salvador", tocada: 1791190000000,
  lista_pasos: [{ tx: "Revisar bardas de terrenos baldíos" }, { tx: "Podar palmas" }, { tx: "Pintar guarniciones" }],
  msgs: [{ k: "bo", t: "Pendientes del fraccionamiento: bardas, palmas, guarniciones", ts: 1 }] };
var MESA = { id: "tmuqb178zb7e27", nombre: "Mesa directiva Cumbres", duenio: "salvador", tocada: 1791180000000,
  msgs: [{ k: "bo", t: "Temas para la junta: cuotas, vigilancia, la barda del lote 12", ts: 1 }] };
var ARB = { id: "chuy-cumbres-decidir-arboles", nombre: "Decoración Navideña Cumbres", duenio: "salvador", tocada: 1791170000000,
  msgs: [{ k: "bi", wa_in: 1, wa_c: "Chuy Cumbres Zatarain", t: "Chuy: decidir árboles junto a la barda de la entrada y el portón", ts: 1 }] };
var TODAS = [CHECK, MESA, ARB, BARDA];

var c = { console: console, JSON: JSON, String: String, Math: Math, tareas: TODAS, esEjemplo: function () { return false; },
  window: {}, esc: function (s) { return String(s); }, render: function () { c._render++; }, _render: 0,
  buscaPorSignificado: function (q, cb) { c._sig.push(q); cb([]); }, _sig: [],
  fechaDictada: function (s) { return { todas: /\b(lunes|martes|mañana|hoy)\b/i.test(s) ? ["x"] : [] }; } };
vm.createContext(c); vm.runInContext(codigo + "\nvar abierta=null, barraEstado=null, consulta='', vista='lista';", c);

var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
function ids(r) { return r.map(function (x) { return x.t.id; }); }

/* las 4 frases de Salvador (09:25) */
["abre el costo de la barda", "costo bardas", "barda cumbres", "barda y portón"].forEach(function (f) {
  var q = c.pideBuscar(f) || f, r = c.buscaTodo(q);
  eq("'" + f + "' -> la barda primero", r.length ? r[0].t.id : null, "tBARDA_MANUEL_031026");
});
eq("pideBuscar('abre el costo de la barda')", c.pideBuscar("abre el costo de la barda"), "el costo de la barda");
eq("pideBuscar('costo bardas')", c.pideBuscar("costo bardas"), "costo bardas");
eq("pideBuscar('Clau abre por favor este el costo de la barda') (dentro de la tarea)", c.pideBuscar("Clau abre por favor este el costo de la barda"), "este el costo de la barda");
eq("pideBuscar('cuánto costó la barda')", c.pideBuscar("cuánto costó la barda"), "cuánto costó la barda");
eq("pideBuscar('el precio del portón')", c.pideBuscar("el precio del portón"), "el precio del portón");
eq("pideBuscar('recuérdame el lunes')", c.pideBuscar("recuérdame el lunes"), null);
eq("pideBuscar('compra focos')", c.pideBuscar("compra focos"), null);

/* una clara se abre sola; ambiguas = lista */
eq("'el costo de la barda' es clara (se abre)", (c.busquedaClara(c.buscaTodo("el costo de la barda")) || {}).id, "tBARDA_MANUEL_031026");
eq("'costo bardas' es clara", (c.busquedaClara(c.buscaTodo("costo bardas")) || {}).id, "tBARDA_MANUEL_031026");
var rp = c.buscaTodo("barda y portón");
eq("'barda y portón' = lista (la de Chuy tambien dice barda y portón), barda primero", [c.busquedaClara(rp), rp[0].t.id, rp.length], [null, "tBARDA_MANUEL_031026", 2]);
var rc = c.buscaTodo("barda cumbres");
eq("'barda cumbres' = lista (varias pegan), barda primero", [c.busquedaClara(rc), rc[0].t.id, rc.length >= 2], [null, "tBARDA_MANUEL_031026", true]);
var rb = c.buscaTodo("barda");
si("'barda' sola = lista con las 4", rb.length === 4 && c.busquedaClara(rb) === null);
eq("lista: la barda primero (pega en nombre)", rb[0].t.id, "tBARDA_MANUEL_031026");
si("lista: dice por que pego (dato/mensaje/lista)", rb.every(function (x) { return x.porque; }) && /lista: .*bardas/i.test(rb.filter(function (x) { return x.t.id === "tmuqb29xtdvjzk"; })[0].porque));
eq("busca en el dato: '110,982' / 'durock'", (c.busquedaClara(c.buscaTodo("durock")) || {}).id, "tBARDA_MANUEL_031026");
eq("acentos y plural: 'pórtones' pega con 'portón'", ids(c.buscaTodo("portones")).indexOf("tBARDA_MANUEL_031026") >= 0, true);
eq("cerrada SI sale", c.buscaTodo("barda manuel")[0].t.id, "tBARDA_MANUEL_031026");
eq("nada pega -> []", c.buscaTodo("helicóptero amarillo"), []);
eq("solo palabras vacias -> []", c.buscaTodo("abre la tarea"), []);

/* abreBusqueda: abre / lista / no lo encontre, nunca crea */
c.abreBusqueda("el costo de la barda", "abre el costo de la barda", c.buscaTodo("el costo de la barda"));
eq("abre: una clara abre el hilo", [vm.runInContext("abierta", c), vm.runInContext("vista", c)], ["tBARDA_MANUEL_031026", "hilo"]);
eq("abre: marca que vino de busqueda (tarjeta de datos)", c.window.__porBusqueda, "tBARDA_MANUEL_031026");
c.abreBusqueda("barda", "abre barda", c.buscaTodo("barda"));
var be = vm.runInContext("barraEstado", c);
eq("abre: varias = lista para escoger, sin 'crear nueva'", [be.modo, be.sv.__abrir, be.sv.sinNueva, be.ops[0]], ["escoge", true, true, "tBARDA_MANUEL_031026"]);
c.abreBusqueda("helicoptero", "abre helicoptero", []);
be = vm.runInContext("barraEstado", c);
eq("abre: ninguna -> 'No lo encontré', no crea", [be.modo, /No lo encontr/.test(be.texto), /No creé nada/.test(be.texto)], ["respuesta", true, true]);
eq("abre: ninguna -> intento por significado", c._sig, ["helicoptero"]);

/* frases cortas */
si("'barda cumbres' es frase corta de busqueda", c.fraseCortaDeBusqueda("barda cumbres"));
si("'compra focos' no", !c.fraseCortaDeBusqueda("compra focos"));
si("'pipas el lunes' no (trae fecha)", !c.fraseCortaDeBusqueda("pipas el lunes"));
si("'¿ya llegó la grúa?' no (pregunta)", !c.fraseCortaDeBusqueda("¿ya llegó la grúa?"));

/* tarjeta de datos */
c.window.__porBusqueda = null;
si("vDatos: cerrada con datos muestra la tarjeta", /DATOS · tarea cerrada/.test(c.vDatosTarea(BARDA)) && /110,982\.00/.test(c.vDatosTarea(BARDA)));
eq("vDatos: abierta sin abrir por busqueda, nada", c.vDatosTarea({ id: "z", datos_corregidos: [{ t: "x" }] }), "");
eq("vDatos: sin datos, nada", c.vDatosTarea(CHECK), "");

/* en el codigo: la ruta vieja que solo miraba abiertas ya no existe; la de la tarea busca antes de la nota */
si("ya no hay candidatas(_q,null,false) (solo abiertas)", html.indexOf("candidatas(_q,null,false)") < 0);
si("en la tarea: busqueda antes que nota a Claude", html.indexOf("var _qT=pideBuscar(v)") > 0 && html.indexOf("var _qT=pideBuscar(v)") < html.indexOf('esNotaClaude(v)){ $("txt").value=""; marcaEnvio("tenv",""); notaClaude(t, v); return; }'));
si("en la barra: busqueda antes de Claude", html.indexOf("var _qB=detectaLista(texto)?null:pideBuscar(texto)") > 0 && html.indexOf("var _qB=detectaLista") < html.indexOf("hist.push(\"Persona: \"+texto);"));

var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
eq("el script de index.html compila", okc, true);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
