#!/usr/bin/env node
/* PRUEBAS build 269 (sobre 200): pantalla Notificaciones (maqueta "Fichas limpias", pantalla 7). Catalogo unico,
   atajos, preferencias por usuario en su ficha (con version) y filtro de los avisos que manda la app.
   Correr: node tests/notificaciones.test.js */
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
var FUNCS = ["_nn", "notifDePreset", "notifDefectoDe", "notifPrefs", "notifGuardadas", "notifPresetDe", "notifPermite", "tipoDePush", "guardaNotif",
  "vNotif", "tituloTarea", "disparaPushInstantaneo", "esJefe269", "subtipoDePush", "hash268", "tagDe268", "tidDeUrl268", "tareaResuelta268"];
var VARS = ["NOTIF_VERSION", "NOTIF_TIPOS", "NOTIF_PRESETS", "NOTIF_NIVEL", "NOTIF_DEFECTO", "TITULO_CONECTORES", "NOTIF_ESENCIAL"];
var codigo = VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var escritos = [], enviados = [];
var c = { console: { log: function () {}, error: function () {} }, JSON: JSON, String: String, Math: Math, Date: Date, Object: Object,
  yo: "salvador", APP_TOKEN: "x",
  PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, samuel: { nombre: "Samuel" }, cynthia: { nombre: "Cynthia" } },
  esc: function (s) { return String(s); }, ico: function (n) { return "<svg data-i=\"" + n + "\"></svg>"; }, toast: function () {},
  localStorage: { setItem: function () {} }, COLP: "bitacora_personas",
  db: { collection: function (col) { return { doc: function (id) { return { set: function (o, m) { escritos.push([col, id, o, m]); return Promise.resolve(); } }; } }; } },
  fetch: function (u, o) { enviados.push(JSON.parse(o.body)); return Promise.resolve({ json: function () { return {}; } }); } };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
function prendidos(o) { return Object.keys(o).filter(function (k) { return o[k]; }); }

/* ===== build 269: a Salvador solo le suenan 5 tipos ===== */
c.tareas = [];
var CINCO = ["acuerdo", "llamada", "atorado", "ia_atorada", "recordatorio"];
eq("Catálogo: los 5 esenciales existen en su propio grupo", c.NOTIF_TIPOS.filter(function (t) { return t.grupo === "Lo esencial"; }).map(function (t) { return t.k; }), ["acuerdo", "llamada", "atorado", "ia_atorada"]);
var esc_ = c.notifDePreset("esencial");
eq("Preset 'Solo lo esencial': solo los 5 (y te_necesito para el servidor); todo lo demás apagado", prendidos(esc_), ["acuerdo", "llamada", "atorado", "ia_atorada", "te_necesito", "recordatorio"]);
eq("Los apagados: wa_tarea, wa_todo, seguimiento, falta_info, asignado, falla, espera", ["wa_tarea", "wa_todo", "seguimiento", "falta_info", "asignado", "falla", "espera"].map(function (k) { return esc_[k]; }), [false, false, false, false, false, false, false]);
eq("Está en el tablero con su nombre", c.NOTIF_PRESETS.filter(function (x) { return x.k === "esencial"; })[0].tx, "Solo lo esencial");
eq("Defecto de Salvador (jefe) = esencial; el de los demás sigue igual", [c.notifDefectoDe("salvador"), c.notifDefectoDe("samuel")], ["esencial", "urgente"]);
/* sin haber elegido nada ya aplica; lo guardado con versión vieja también pasa a esencial */
delete c.PERSONAS.salvador.notif;
eq("Sin elegir: solo pasan los 5", c.notifPermite("salvador", "acuerdo") && c.notifPermite("salvador", "te_necesito", "llamada") && c.notifPermite("salvador", "te_necesito", "atorado") && c.notifPermite("salvador", "te_necesito", "ia_atorada") && c.notifPermite("salvador", "recordatorio"), true);
c.PERSONAS.salvador.notif = { v: 2, preset: "respuesta", tipos: c.notifDePreset("todas"), ts: 1 };
eq("Guardado con la versión vieja (todas): se le aplica lo esencial", c.notifPresetDe(c.notifPrefs("salvador")), "esencial");
c.guardaNotif(c.notifDePreset("esencial"));
eq("Se guarda con v3 y preset esencial", [escritos[escritos.length - 1][2].notif.v, escritos[escritos.length - 1][2].notif.preset], [3, "esencial"]);
["wa_tarea", "wa_todo", "seguimiento", "falta_info", "asignado", "falla", "espera", "", "cualquier_cosa"].forEach(function (k) { eq("Con 'Solo lo esencial' NO pasa: " + (k || "(sin tipo)"), c.notifPermite("salvador", k), false); });
eq("te_necesito sin subtipo cuenta como atorado (pasa)", c.notifPermite("salvador", "te_necesito"), true);
eq("Subtipo desconocido de te_necesito = atorado (pasa)", c.notifPermite("salvador", "te_necesito", "otra"), true);
/* apagando uno de los 5 a mano, ese no pasa */
var t2 = c.notifPrefs("salvador"); t2.llamada = false; c.guardaNotif(t2);
eq("Apagar 'llamada' la silencia y deja los otros 4", [c.notifPermite("salvador", "te_necesito", "llamada"), c.notifPermite("salvador", "acuerdo"), c.notifPermite("salvador", "recordatorio")], [false, true, true]);
c.guardaNotif(c.notifDePreset("esencial"));
/* lo que dispara la app hacia Salvador, por su título */
enviados.length = 0; c.yo = "samuel";
function manda(tit, cu, tipo) { c.disparaPushInstantaneo("salvador", tit, cu, "https://doit.ok-doit.com/?recordatorio=t1", tipo); }
manda("Nuevo mensaje", "Cynthia: hola"); manda("Nueva tarea asignada", "Te asignaron: x"); manda("Nuevo comentario", "x comentó"); manda("Respuesta a tu consulta", "x"); manda("Revisión asignada", "x");
manda("Tarea", "“Paso” está atrasado"); manda("Tarea", "Fulano no ha cumplido “x”"); manda("Meta", "Meta “x”: ¿para cuándo queda?", "seguimiento"); manda("Nuevo encargo", "x te encargó: y"); manda("Nueva medida en la tarea", "x");
manda("Decide", "Manuel no da el dato", "espera"); manda("Falta info", "algo por completar"); manda("Falla", "WhatsApp no salió");
eq("Nada de lo viejo le llega a Salvador (asignado, wa, seguimiento, falta_info, falla, espera, toques, empujones)", enviados.length, 0);
manda("Acuerdo", "Quedamos el jueves 10:00 en la oficina");
manda("Te necesito", "Te necesito en una llamada con el notario");
manda("Urgente: Requiere tu acción", "La tarea \"Pago\" requiere tu decisión/autorización");
manda("Claude necesita tu respuesta", "La IA se atoró y no puede seguir sin ti");
manda("Recordatorio", "Llamar al notario", "recordatorio");
eq("Los 5 sí le llegan, con su subtipo", enviados.map(function (x) { return [x.tipo, x.subtipo]; }), [["acuerdo", ""], ["te_necesito", "llamada"], ["te_necesito", "atorado"], ["te_necesito", "ia_atorada"], ["recordatorio", ""]]);
eq("Y todos llevan tag", enviados.every(function (x) { return !!x.tag; }), true);
eq("A los demás (no jefe) no se les cambia nada: siguen recibiendo 'asignado'", (function () { enviados.length = 0; c.disparaPushInstantaneo("cynthia", "Nueva tarea asignada", "Te asignaron: x", "u"); return enviados.length; })(), 1);
/* tablero de Salvador */
c.yo = "salvador"; var vh = c.vNotif();
eq("El tablero de Salvador muestra solo los 5 renglones y 2 atajos", [(vh.match(/data-ntipo=/g) || []).length, (vh.match(/data-npre=/g) || []).length, /Solo lo esencial/.test(vh)], [5, 2, true]);
eq("El de otra persona no muestra lo esencial de Salvador", (function () { c.yo = "samuel"; var h = c.vNotif(); c.yo = "salvador"; return /data-ntipo="acuerdo"/.test(h); })(), false);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
