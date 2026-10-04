#!/usr/bin/env node
/* PRUEBAS build 197 (chat limpio): avisos del mismo tema se reemplazan, Importante | Todo,
   ciclo de las indicaciones a Claude (fresca -> vista -> siguiente visita plegada) y que la
   respuesta de Claude diga que hizo. Correr: node tests/chat.test.js */
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
var FUNCS = ["_nn", "_normAviso", "temaAviso", "avisosReemplazados", "modoChat", "esImportante", "indicacionVigente", "notasPlegadas",
  "respuestaHecho", "traeFecha", "_fsa"];
var VARS = ["AVISO_RX", "AVISO_SIS", "_MESRE", "_DIARE"];
var codigo = VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var c = { console: console, JSON: JSON, String: String, Math: Math, Date: Date, yo: "salvador",
  PERSONAS: { salvador: { nombre: "Salvador" }, samuel: { nombre: "Samuel" } }, window: {} };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
function keys(o) { return Object.keys(o.set).map(Number); }

/* ---------- 1 avisos que se reemplazan ---------- */
var t1 = { msgs: [
  { k: "bo", de: "salvador", t: "hablar con José Mijares", ts: 1 },
  { k: "bal", aviso: 1, t: "“Hablar con José Mijares” vence en 4 días.", ts: 2 },
  { k: "bal", aviso: 1, t: "“Hablar con José Mijares” vence en 3 días.", ts: 3 },
  { k: "bi", wa_in: 1, wa_c: "José Mijares", t: "José: luego te marco", ts: 4 },
  { k: "bal", aviso: 1, t: "Ya venció “Hablar con José Mijares”. ¿Ya hablaste con José?", ts: 5 },
  { k: "bal", t: "Van 4 veces. ¿Ya hablaste con José Mijares?", ts: 6 },
  { k: "bi", t: "¿Cuánto cuesta el portón?", ts: 7 },
  { k: "bi", t: "¿Cuánto cuesta el portón?", ts: 8 },
  { k: "bi", t: "¿Quién lo instala?", ts: 9 },
  { k: "bi", t: "Movida del sáb 3 oct al lun 5 oct.", ts: 10 },
  { k: "bi", t: "Movida del lun 5 oct al mié 7 oct.", ts: 11 },
  { k: "bi", t: "Te aviso el lunes a las 9:00 am.", ts: 12 }
] };
var R = c.avisosReemplazados(t1);
eq("vencimiento: 4 dias -> 3 dias -> vencida -> 'van 4 veces': solo queda el ultimo", [1, 2, 4].every(function (i) { return R.set[i]; }) && !R.set[5], true);
eq("pregunta repetida: solo la ultima", [R.set[6], R.set[7]], [1, undefined]);
si("pregunta distinta se queda", !R.set[8]);
eq("Movida: la nueva reemplaza a la vieja", [R.set[9], R.set[10]], [1, undefined]);
si("temas distintos se quedan los dos (Movida y Te aviso)", !R.set[10] && !R.set[11]);
si("personas y WhatsApp nunca se ocultan", !R.set[0] && !R.set[3]);
eq("todos los ocultos", keys(R), [1, 2, 4, 6, 9]);
eq("tema de un aviso de vencimiento", c.temaAviso(t1.msgs[1]), "seguimiento");
eq("misma pregunta con otro numero = mismo tema", c.temaAviso({ k: "bi", t: "¿Ya llegaron los 3 focos?" }), c.temaAviso({ k: "bi", t: "¿Ya llegaron los 5 focos?" }));
eq("nota a Claude no es aviso", c.temaAviso({ k: "bi", nota_claude: 1, t: "Movida al lunes" }), "");
eq("mensaje con archivo no es aviso", c.temaAviso({ k: "bi", url: "x.jpg", t: "foto" }), "");
eq("mensaje de Samuel no es aviso", c.temaAviso({ k: "bi", de: "samuel", t: "¿Ya quedó?" }), "");

/* ---------- 2 Importante | Todo ---------- */
eq("por omision: Importante", c.modoChat({ id: "a" }), "importante");
c.window.__chatModo = { a: "todo" };
eq("se recuerda por tarea en la sesion", [c.modoChat({ id: "a" }), c.modoChat({ id: "b" })], ["todo", "importante"]);
var vis = t1.msgs.map(function (x, i) { return c.esImportante(x, i, R); });
eq("Importante: sin los avisos viejos", vis.filter(Boolean).length, 7);
eq("Todo: todo", t1.msgs.map(function (x, i) { return c.esImportante(x, i, { set: {} }); }).filter(Boolean).length, 12);
si("en Todo no se pliega nada (avisos, sistema, indicaciones)", /_todo\?\{set:\{\},ult:-1,n:0\}:avisosPlegados\(t\)/.test(html) && /notasPlegadas\(t, _todo \|\|/.test(html) && /avisosSistemaPlegados\(t, _todo \|\|/.test(html));
si("build 198: ningun renglon 'N … · ver' en el chat", !/data-ncexp="1"/.test(html) && !/data-sisexp="1"/.test(html) && !/data-avexp="1"/.test(html));
si("build 198: chat vacio en Importante -> pista 'Hay N mensajes ocultos · Todo' que cambia a Todo", /Hay '\+_ocultos\+' mensaje/.test(html) && /data-cmodo="todo">Hay /.test(html));
si("boton Importante | Todo en el chat", /data-cmodo="importante"/.test(html) && /data-cmodo="todo"/.test(html));

/* ---------- 3 indicaciones: fresca -> vista -> plegada en la siguiente visita ---------- */
var H = 1791200000000;
function tInd(visto) { return { msgs: [
  { k: "bo", de: "salvador", t: "hola", ts: H - 5000 },
  { k: "bo", de: "salvador", canal: "priv:salvador", nota_claude: 1, t: "Claude cambia el nombre a costo barda durock cumbres", ts: H - 4000 },
  { k: "bi", canal: "priv:salvador", nota_claude: 1, t: "Cambié el nombre de “Barda” a “Costo Barda Durock Cumbres”.", ts: H - 3000, visto_ts: visto }
] }; }
eq("fresca (sin ver): se ve", keys(c.notasPlegadas(tInd(undefined), false, H - 1000, H)), []);
eq("vista en ESTA visita: se sigue viendo", keys(c.notasPlegadas(tInd(H - 500), false, H - 1000, H)), []);
var pl = c.notasPlegadas(tInd(H - 500), false, H + 60000, H + 60000);
eq("siguiente visita: se pliega en '1 indicación a Claude'", [keys(pl), pl.cab], [[1, 2], { 1: 1 }]);
var tsr = tInd(undefined); tsr.msgs.pop();
eq("sin respuesta de Claude todavia: se ve", keys(c.notasPlegadas(tsr, false, H + 60000, H + 60000)), []);
var vieja = tInd(undefined); vieja.msgs[2].ts = H - 3 * 86400000;
eq("viejas sin visto (antes del build 197) cuentan como vistas: plegadas", keys(c.notasPlegadas(vieja, false, H, H)), [1, 2]);
si("al pintarla se marca visto_ts y se guarda", /x\.visto_ts=Date\.now\(\); _vistoNuevo=true;/.test(html) && /if\(_vistoNuevo\) setTimeout\(function\(\)\{ try\{ guarda\(t\); \}/.test(html));
si("salir de la tarea termina la visita", /if\(vista!=="hilo" && vista!=="galeria"\) window\.__visitaDe=null;/.test(html));

/* respuesta de Claude: siempre dice que hizo */
eq("hecho + entendi", c.respuestaHecho("Cambié el nombre a “X”.", "Querías que se llamara X"), "Cambié el nombre a “X”. Entendí: Querías que se llamara X.");
eq("'Listo' no cuenta como entender", c.respuestaHecho("La cerré como hecha.", "Listo"), "La cerré como hecha.");
eq("nada hecho, pero entendio", c.respuestaHecho("", "Es una nota para ti sobre el portón"), "Entendí: Es una nota para ti sobre el portón. No cambié nada en la tarea.");
eq("nada hecho y vago", c.respuestaHecho("", "Ok"), "No cambié nada: no me quedó claro qué hacer. Dímelo otra vez.");
si("prompt pide decir que entendio (nunca solo Listo)", /QUÉ ENTENDISTE/.test(html));

var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
eq("el script de index.html compila", okc, true);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
