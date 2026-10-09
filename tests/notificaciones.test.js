#!/usr/bin/env node
/* PRUEBAS: pantalla Notificaciones de dos columnas (Doit = push de la app, WhatsApp = número de Doit). Catálogo único,
   atajos que ponen ambas columnas, defecto de Salvador (recordatorio, cita, acuerdo, llamada, espera, autorizar), migración
   del formato de una columna, guardado v2 {k:{push,wa}} y filtro de los avisos que manda la app (columna push).
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
var FUNCS = ["_nn", "notifClave", "notifTipo", "esJefe", "notifDePreset", "notifDefectoDe", "notifFormatoNuevo", "notifGuardadas", "notifPrefs", "notifPresetDe", "notifPermite",
  "subtipoDePush", "tipoDePush", "guardaNotif", "notifSwitch", "vNotif", "tituloTarea", "disparaPushInstantaneo", "hash268", "tagDe268", "tidDeUrl", "tareaResuelta"];
var VARS = ["NOTIF_VERSION", "NOTIF_TIPOS", "NOTIF_PRESETS", "NOTIF_EQUIPO", "TITULO_CONECTORES", "PUSH"];
var codigo = VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var escritos = [], enviados = [], fichas = [];
var c = { console: { log: function () {}, error: function () {} }, JSON: JSON, String: String, Math: Math, Date: Date, Object: Object,
  yo: "salvador", APP_TOKEN: "x", tareas: [],
  PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, samuel: { nombre: "Samuel" }, cynthia: { nombre: "Cynthia" } },
  esc: function (s) { return String(s); }, ico: function (n) { return "<svg data-i=\"" + n + "\"></svg>"; }, toast: function () {},
  localStorage: { setItem: function () {} }, COLP: "bitacora_personas",
  db: { collection: function (col) { return { doc: function (id) { return { set: function (o, m) { escritos.push([col, id, o, m]); return Promise.resolve(); } }; } }; } },
  fetch: function (u, o) { if (/action=fs_set/.test(u)) fichas.push(JSON.parse(o.body)); else enviados.push(JSON.parse(o.body)); return Promise.resolve({ json: function () { return {}; } }); } };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
function col(o, c2) { return Object.keys(o).filter(function (k) { return o[k][c2]; }); }
var ESENCIAL = ["recordatorio", "cita", "acuerdo", "llamada", "espera", "autorizar", "falla"];

/* catálogo */
var KEYS = c.NOTIF_TIPOS.map(function (t) { return t.k; });
eq("catálogo: todos los tipos, agrupados", c.NOTIF_TIPOS.map(function (t) { return t.grupo + ":" + t.k; }),
  ["Lo que te toca:recordatorio", "Lo que te toca:cita", "Lo que te toca:acuerdo", "Lo que te toca:llamada", "Lo que te toca:espera", "Lo que te toca:autorizar",
   "Claude y el sistema:ia_atorada", "Claude y el sistema:no_supe", "Claude y el sistema:claude_listo", "Claude y el sistema:resumen", "Claude y el sistema:falla",
   "Tareas:falta_info", "Tareas:seguimiento", "Tareas:asignado", "WhatsApp:wa_tarea", "WhatsApp:wa_grupo", "WhatsApp:wa_todo"]);
si("cada tipo trae clave, grupo, icono, título y descripción", c.NOTIF_TIPOS.every(function (t) { return t.k && t.grupo && t.ico && t.tx && t.sub; }));
eq("claves únicas", new Set(KEYS).size, KEYS.length);
eq("lo esencial es lo que pidió Salvador", c.NOTIF_TIPOS.filter(function (t) { return t.esencial; }).map(function (t) { return t.k; }), ESENCIAL);

/* atajos: ponen ambas columnas */
eq("Solo lo esencial: Doit", col(c.notifDePreset("esencial"), "push"), ESENCIAL);
eq("Solo lo esencial: WhatsApp", col(c.notifDePreset("esencial"), "wa"), ESENCIAL);
eq("Todo: ambas columnas", [col(c.notifDePreset("todas"), "push").length, col(c.notifDePreset("todas"), "wa").length], [KEYS.length, KEYS.length]);
eq("Nada: ambas columnas", [col(c.notifDePreset("ninguna"), "push").length, col(c.notifDePreset("ninguna"), "wa").length], [0, 0]);
eq("tres atajos", c.NOTIF_PRESETS.map(function (x) { return x.k + ":" + x.tx; }), ["esencial:Solo lo esencial", "todas:Todo", "ninguna:Nada"]);

/* defectos */
delete c.PERSONAS.salvador.notif;
eq("Salvador sin elegir: Doit = lo esencial", col(c.notifPrefs("salvador"), "push"), ESENCIAL);
eq("Salvador sin elegir: WhatsApp = lo esencial", col(c.notifPrefs("salvador"), "wa"), ESENCIAL);
eq("«No supe qué contestar» apagado por defecto en ambas", c.notifPrefs("salvador").no_supe, { push: false, wa: false });
eq("Equipo sin elegir: además su trabajo en Doit, WhatsApp solo lo esencial", [col(c.notifPrefs("samuel"), "push"), col(c.notifPrefs("samuel"), "wa")], [ESENCIAL.concat(["falta_info", "seguimiento", "asignado"]), ESENCIAL]);

/* migración: lo de una columna (true/false, cualquier versión) no se conserva */
c.PERSONAS.salvador.notif = { v: 3, preset: "todas", tipos: { recordatorio: false, wa_todo: true, falla: true, no_supe: true }, ts: 1 };
eq("formato viejo v3 → defecto", [c.notifGuardadas("salvador"), c.notifPresetDe(c.notifPrefs("salvador"))], [false, "esencial"]);
c.PERSONAS.salvador.notif = { v: 1, tipos: { espera: false } };
eq("formato viejo v1 → defecto", c.notifPrefs("salvador").espera, { push: true, wa: true });

/* guardar v2 */
escritos.length = 0;
var p0 = c.notifPrefs("salvador"); p0.no_supe = { push: true, wa: false }; c.guardaNotif(p0);
var g = escritos[0];
eq("se guarda en bitacora_personas/<usuario>.notif con merge", [g[0], g[1], g[3]], ["bitacora_personas", "salvador", { merge: true }]);
eq("v2, a tu medida, ts", [g[2].notif.v, g[2].notif.preset, typeof g[2].notif.ts], [2, "personalizado", "number"]);
eq("cada tipo {push, wa}", [g[2].notif.tipos.no_supe, g[2].notif.tipos.recordatorio, Object.keys(g[2].notif.tipos).length], [{ push: true, wa: false }, { push: true, wa: true }, KEYS.length]);
eq("y la misma ficha va a push.php (fs_set merge), por donde la lee la Mac", [fichas.length > 0 && fichas[fichas.length - 1].col, fichas.length > 0 && fichas[fichas.length - 1].id, fichas.length > 0 && fichas[fichas.length - 1].merge, fichas.length > 0 && fichas[fichas.length - 1].data.notif.tipos.no_supe], ["bitacora_personas", "salvador", true, { push: true, wa: false }]);
eq("y se lee igual (formato nuevo)", [c.notifGuardadas("salvador"), c.notifPrefs("salvador").no_supe], [true, { push: true, wa: false }]);
c.PERSONAS.salvador.notif = { v: 2, preset: "personalizado", tipos: { recordatorio: { push: false, wa: true } }, ts: 2 };
eq("tipo que lo guardado no trae: toma su defecto", [c.notifPrefs("salvador").recordatorio, c.notifPrefs("salvador").cita, c.notifPrefs("salvador").falla], [{ push: false, wa: true }, { push: true, wa: true }, { push: true, wa: true }]);

/* notifPermite = columna Doit (push) */
eq("recordatorio con push apagado no suena aunque WhatsApp esté prendido", c.notifPermite("salvador", "recordatorio"), false);
eq("cita sí", c.notifPermite("salvador", "cita"), true);
["", "cualquier_cosa", "otro"].forEach(function (k) { eq("tipo desconocido = apagado: " + (k || "(vacío)"), c.notifPermite("salvador", k), false); });
eq("claves de antes: te_necesito/llamada → llamada, sin subtipo → espera, ia_atorada → apagado", [c.notifPermite("salvador", "te_necesito", "llamada"), c.notifPermite("salvador", "te_necesito"), c.notifPermite("salvador", "te_necesito", "ia_atorada"), c.notifPermite("salvador", "atorado")], [true, true, false, true]);
eq("Salvador ya no está forzado: si prende wa_todo en Doit, le suena", (function () { var p = c.notifPrefs("salvador"); p.wa_todo = { push: true, wa: false }; c.guardaNotif(p); return c.notifPermite("salvador", "wa_todo"); })(), true);

/* lo que dispara la app hacia Salvador (con el defecto) */
delete c.PERSONAS.salvador.notif; enviados.length = 0; c.yo = "samuel";
function manda(tit, cu, tipo) { c.disparaPushInstantaneo("salvador", tit, cu, "https://doit.ok-doit.com/?recordatorio=t1", tipo); }
manda("Nuevo mensaje", "Cynthia: hola"); manda("Nueva tarea asignada", "Te asignaron: x"); manda("Nuevo comentario", "x comentó"); manda("Respuesta a tu consulta", "x"); manda("Revisión asignada", "x");
manda("Tarea", "“Paso” está atrasado"); manda("Tarea", "Fulano no ha cumplido “x”"); manda("Meta", "Meta “x”: ¿para cuándo queda?", "seguimiento"); manda("Nuevo encargo", "x te encargó: y"); manda("Nueva medida en la tarea", "x");
manda("Falta info", "algo por completar"); manda("Falla", "WhatsApp no salió"); manda("Claude necesita tu respuesta", "La IA se atoró"); manda("Hola", "algo que no se reconoce");
eq("Con el defecto no le llega nada de lo demás (ni lo que no se reconoce), salvo la falla técnica (encendida 9-oct)", enviados.map(function (x) { return x.tipo; }), ["falla"]);
manda("Acuerdo", "Quedamos el jueves 10:00 en la oficina");
manda("Te necesito", "Te necesito en una llamada con el notario");
manda("Urgente: Requiere tu acción", "La tarea \"Pago\" requiere tu decisión/autorización");
manda("Decide", "Manuel no da el dato", "espera");
manda("Compra", "Hay que autorizar la compra de cemento");
manda("Recordatorio", "Llamar al notario", "recordatorio");
manda("Cita", "Reunión con el arquitecto el lunes");
eq("Lo esencial sí, con su clave del catálogo", enviados.map(function (x) { return x.tipo; }), ["falla", "acuerdo", "llamada", "espera", "espera", "autorizar", "recordatorio", "cita"]);
eq("Y todos llevan tag", enviados.every(function (x) { return !!x.tag; }), true);
eq("Al equipo le sigue llegando 'te asignaron' por defecto", (function () { enviados.length = 0; c.disparaPushInstantaneo("cynthia", "Nueva tarea asignada", "Te asignaron: x", "u"); return enviados.map(function (x) { return x.tipo; }); })(), ["asignado"]);
eq("nunca a uno mismo", (function () { enviados.length = 0; c.yo = "salvador"; manda("Recordatorio", "x", "recordatorio"); return enviados.length; })(), 0);

/* pantalla */
c.yo = "salvador"; delete c.PERSONAS.salvador.notif; escritos.length = 0;
var h = c.vNotif();
eq("al abrir con nada guardado se guarda lo que se ve (v2, esencial)", [escritos.length, escritos[0][2].notif.v, escritos[0][2].notif.preset], [1, 2, "esencial"]);
eq("una fila por tipo, nada oculto para Salvador", (h.match(/data-nfila=/g) || []).length, KEYS.length);
eq("dos interruptores por fila", [(h.match(/data-ncol="push"/g) || []).length, (h.match(/data-ncol="wa"/g) || []).length], [KEYS.length, KEYS.length]);
eq("prendidos: los 7 esenciales en ambas columnas", (h.match(/class="tg on"/g) || []).length, 14);
eq("tres atajos, «Solo lo esencial» marcado", [(h.match(/data-npre=/g) || []).length, (h.match(/data-npre="(\w+)" class="on"/) || [])[1]], [3, "esencial"]);
si("encabezados de columna Doit y WhatsApp", /class="ncol">Doit</.test(h) && /class="ncol">WhatsApp</.test(h));
si("interruptores accesibles (role switch, aria-label)", /role="switch" aria-checked="true" aria-label="Doit: Recordatorio que pusiste"/.test(h));
si("sin emoji", !/[\u{1F300}-\u{1FAFF}☀-➿]/u.test(h));
si("iconos de línea", /data-i="reloj"/.test(h) && /data-i="msj"/.test(h));
c.PERSONAS.samuel.notif = undefined; c.yo = "samuel"; var hs = c.vNotif(); c.yo = "salvador";
eq("otra persona ve el mismo catálogo completo", (hs.match(/data-nfila=/g) || []).length, KEYS.length);
si("⋯ del inicio abre Notificaciones", /id="bhmas"/.test(html) && /vista="notif"/.test(html) && /if\(vista==="notif"\)\{a\.innerHTML=vNotif\(\);bindNotif\(\);return\}/.test(html));
si("se lee de la ficha al cargar", /if\(o\.notif && typeof o\.notif==="object"\) p\.notif=o\.notif;/.test(html));

var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
eq("el script de index.html compila", okc, true);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
