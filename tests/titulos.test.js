#!/usr/bin/env node
/* PRUEBAS build 196: titulos con Mayuscula Inicial (menos conectores), avisos del sistema
   plegados, nombres del encabezado que abren la ficha, fotos en Archivos y el aviso
   "acantilado" sin "vence". Correr: node tests/titulos.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var lineas = html.split("\n");
function saca(tipo, nombre) {
  var re = tipo === "function" ? new RegExp("^function " + nombre.replace(/\$/g, "\\$") + "\\(") : new RegExp("^var " + nombre + "\\s*=");
  var ini = -1;
  for (var i = 0; i < lineas.length; i++) if (re.test(lineas[i])) ini = i;
  if (ini < 0) throw new Error("no encontre " + tipo + " " + nombre);
  var out = [lineas[ini]];
  for (var k = ini + 1; k < lineas.length; k++) {
    var L = lineas[k];
    if (L.length && !/^[\s}\]]/.test(L)) break;
    out.push(L);
    if (/^}/.test(L)) break;
  }
  return out.join("\n");
}
var FUNCS = ["tituloTarea", "esAvisoSistema", "avisosSistemaPlegados", "subtituloHTML", "subtituloTarea", "_primerNombre", "juntaNombres",
  "esDato", "adjuntos", "iso", "dDif", "hoy", "subeAlJefe", "sinFinal", "esRecurrente"];
var VARS = ["TITULO_CONECTORES", "AVISO_SIS"];
var codigo = VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var c = { console: console, JSON: JSON, String: String, Math: Math, Date: Date, decodeURIComponent: decodeURIComponent,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador" }, samuel: { nombre: "Samuel" } },
  esc: function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); },
  integrantesDe: function (t) { return t._ints || [{ k: t.duenio }]; },
  nombreInt: function (k) { return String(k).indexOf("ext:") === 0 ? String(k).slice(4) : ((c.PERSONAS[k] || {}).nombre || k); },
  formaDanio: function () { return "acantilado"; }, DANIO: { acantilado: { avisa_antes: 3, escala: false } } };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }

/* ---------- 1 titulos ---------- */
[["costo barda durock cumbres", "Costo Barda Durock Cumbres"],
 ["decoración navideña cumbres", "Decoración Navideña Cumbres"],
 ["fideicomiso: seguimiento con BBVA", "Fideicomiso: Seguimiento con BBVA"],
 ["hablar con josé mijares", "Hablar con José Mijares"],
 ["trend rating aclaracion", "Trend Rating Aclaracion"],
 ["de la casa", "De la Casa"],
 ["poste PTR para el portón", "Poste PTR para el Portón"],
 ["pago CFE de la casa de apeninos", "Pago CFE de la Casa de Apeninos"],
 ["Programación Doit", "Programación Doit"],
 ["revisar iPhone de karina", "Revisar iPhone de Karina"],
 ["grava 3/4 para 6 sicomoros", "Grava 3/4 para 6 Sicomoros"],
 ["Mantenimiento Y Mejoras Cumbres", "Mantenimiento y Mejoras Cumbres"],
 ["  llamar  a   juan  ", "Llamar a Juan"],
 ["el lunes con la grúa", "El Lunes con la Grúa"],
 ["ángel y úrsula", "Ángel y Úrsula"],
 ["Barda Manuel Parra", "Barda Manuel Parra"],
 ["", ""]
].forEach(function (x) { eq("titulo '" + x[0] + "'", c.tituloTarea(x[0]), x[1]); });
eq("idempotente", c.tituloTarea(c.tituloTarea("fideicomiso: seguimiento con BBVA")), "Fideicomiso: Seguimiento con BBVA");
si("se guarda normalizado (guarda)", /function guarda\(t\)\{\n  t\.tocada=Date\.now\(\);\n  if\(t && t\.nombre && !t\.es_recordatorio\) t\.nombre=tituloTarea\(t\.nombre\)/.test(html));
si("se ve normalizado al cargar", /if\(o\.nombre && !o\.es_recordatorio\) o\.nombre=tituloTarea\(o\.nombre\)/.test(html));

/* ---------- 2b avisos del sistema plegados ---------- */
var NOW = 1791200000000;
var t = { msgs: [
  { k: "bo", t: "muévela al lunes", ts: NOW - 9e6 },
  { k: "bi", t: "Movida del sáb 3 oct al lun 5 oct.", ts: NOW - 9e6 },
  { k: "bi", t: "Te aviso el lunes a las 9:00 am.", ts: NOW - 9e6 },
  { k: "bal", t: "Cerrada sin hacerse. Le pregunto a Salvador qué sigue.", ts: NOW - 8e6 },
  { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel: va", ts: NOW - 7e6 },
  { k: "bi", t: "¿Por qué se movió? (opcional)", ts: NOW - 6e6 },
  { k: "bi", t: "Fecha: lun 5 oct (antes sáb 3 oct).", ts: NOW - 60000 }
] };
var p = c.avisosSistemaPlegados(t, false, NOW);
eq("pliega Movida/Te aviso/Cerrada en un renglon de 3", [Object.keys(p.set).map(Number), p.cab], [[1, 2, 3], { 1: 3 }]);
si("la pregunta y el WhatsApp no se pliegan", !p.set[4] && !p.set[5]);
si("el ultimo aviso reciente se deja a la vista", !p.set[6]);
eq("abiertos = nada plegado", Object.keys(c.avisosSistemaPlegados(t, true, NOW).set).length, 0);
si("nota a Claude no es aviso del sistema (ya tiene su plegado)", !c.esAvisoSistema({ k: "bi", t: "Movida al lunes", nota_claude: 1 }));
si("mensaje de una persona no", !c.esAvisoSistema({ k: "bi", de: "samuel", t: "Listo, ya quedó" }));
si("bal que pregunta no", !c.esAvisoSistema({ k: "bal", t: "Para medir a Samuel: ¿qué te entrega?" }));
si("el render usa el plegado", /data-sisexp="1"/.test(html) && /_pls\.set\[ix\]/.test(html));

/* ---------- 2c nombres del encabezado ---------- */
var hS = c.subtituloHTML({ duenio: "salvador", _ints: [{ k: "salvador" }, { k: "ext:Chuy Cumbres Zatarain" }, { k: "samuel" }] });
eq("subtitulo con botones", hS, 'Tuya · con <button class="pnom" data-persona="Chuy Cumbres Zatarain">Chuy</button> y <button class="pnom" data-persona="Samuel">Samuel</button>');
var hD = c.subtituloHTML({ es_dato: true, duenio: "salvador", _ints: [{ k: "salvador" }, { k: "ext:Manuel Parra" }] });
eq("dato: 'de Manuel Parra' abre su ficha", hD, 'Dato · de <button class="pnom" data-persona="Manuel Parra">Manuel Parra</button>');
si("los botones data-persona abren la ficha (abrePersona)", /querySelectorAll\("\[data-persona\]"\)[\s\S]{0,200}abrePersona\(el\.getAttribute\("data-persona"\)\)/.test(html));

/* ---------- 2a fotos en Archivos ---------- */
var adj = c.adjuntos({ msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel: [foto]", tipo: "foto", url: "https://doit.ok-doit.com/uploads/wa_media/sin_tarea/20261003_134058_89de9d.jpeg", ts: 5 },
  { k: "bi", t: "Manuel: cotización", tipo: "documento", url: "https://x/cotizacion.pdf", ts: 6 }] });
eq("la foto con la que se creo y el PDF estan en Archivos", adj.map(function (f) { return [f.img, f.nombre]; }), [[true, "20261003_134058_89de9d.jpeg"], [false, "cotizacion.pdf"]]);

/* ---------- 3 acantilado sin "vence" ---------- */
vm.runInContext("hoy=function(){return '2026-10-04'}", c);
var a1 = c.subeAlJefe({ nombre: "Pago predial", duenio: "samuel", f_vigente: "2026-10-05", empujones: [] });
si("acantilado: positivo y sin 'vence'", a1 && !/vence/i.test(a1.texto) && /empujón a Samuel/.test(a1.texto) && /en 1 día/.test(a1.texto));
eq("acantilado: indefinida no avisa", c.subeAlJefe({ nombre: "Inversiones", duenio: "samuel", indefinida: true, f_vigente: "2026-10-05", empujones: [] }), null);

var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
eq("el script de index.html compila", okc, true);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
