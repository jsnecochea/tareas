#!/usr/bin/env node
/* PRUEBAS build 200: pantalla Notificaciones (maqueta "Fichas limpias", pantalla 7). Catalogo unico,
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
  "vNotif", "tituloTarea", "disparaPushInstantaneo"];
var VARS = ["NOTIF_VERSION", "NOTIF_TIPOS", "NOTIF_PRESETS", "NOTIF_NIVEL", "NOTIF_DEFECTO", "TITULO_CONECTORES"];
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

/* catalogo */
eq("catalogo: 9 tipos en 3 grupos, como la maqueta", c.NOTIF_TIPOS.map(function (t) { return t.grupo + ":" + t.k; }),
  ["Urgente:te_necesito", "Urgente:recordatorio", "Urgente:espera", "Urgente:falla", "Trabajo:falta_info", "Trabajo:seguimiento", "Trabajo:asignado", "WhatsApp:wa_tarea", "WhatsApp:wa_todo"]);
si("cada tipo trae clave, grupo, nivel, icono, titulo y subtitulo", c.NOTIF_TIPOS.every(function (t) { return t.k && t.grupo && c.NOTIF_NIVEL[t.nivel] && t.ico && t.tx && t.sub; }));
eq("claves unicas", new Set(c.NOTIF_TIPOS.map(function (t) { return t.k; })).size, c.NOTIF_TIPOS.length);

/* atajos */
eq("Ninguna", prendidos(c.notifDePreset("ninguna")), []);
eq("Solo urgente (defecto de la maqueta)", prendidos(c.notifDePreset("urgente")), ["te_necesito", "recordatorio", "espera", "falla"]);
eq("Normal", prendidos(c.notifDePreset("normal")), ["te_necesito", "recordatorio", "espera", "falla", "falta_info", "seguimiento", "asignado", "wa_tarea"]);
eq("Todas", prendidos(c.notifDePreset("todas")).length, 9);
eq("defecto = Solo urgente", c.NOTIF_DEFECTO, "urgente");
eq("atajo que coincide", c.notifPresetDe(c.notifDePreset("normal")), "normal");
var pers = c.notifDePreset("urgente"); pers.wa_tarea = true;
eq("mezcla = personalizado (ningun atajo marcado)", c.notifPresetDe(pers), "");

/* guardar en la ficha, con version */
c.guardaNotif(c.notifDePreset("normal"));
eq("se guarda en bitacora_personas/<usuario>.notif con merge", [escritos[0][0], escritos[0][1], escritos[0][3]], ["bitacora_personas", "salvador", { merge: true }]);
eq("con version y atajo", [escritos[0][2].notif.v, escritos[0][2].notif.preset], [2, "normal"]);
eq("y queda en memoria", c.notifPrefs("salvador").asignado, true);
c.PERSONAS.samuel.notif = { v: 1, tipos: { recordatorio: true } };
eq("tipo nuevo que la persona nunca vio: toma el defecto", [c.notifPrefs("samuel").espera, c.notifPrefs("samuel").wa_todo], [true, false]);

/* filtro de lo que manda la app */
c.PERSONAS.samuel.notif = { v: 1, tipos: c.notifDePreset("urgente") };
eq("tipos de los avisos de la app", ["Urgente: Requiere tu acción", "Nueva tarea asignada", "Nuevo encargo", "Revisión asignada", "Nuevo comentario", "Respuesta a tu consulta", "Tarea"].map(function (x, i) { return c.tipoDePush(x, i === 6 ? "“Pintar” está atrasado" : ""); }),
  ["espera", "asignado", "asignado", "asignado", "asignado", "asignado", "seguimiento"]);
si("Samuel en Solo urgente: SI le llega lo urgente", c.notifPermite("samuel", "espera"));
si("Samuel en Solo urgente: NO le llega 'te asignaron'", !c.notifPermite("samuel", "asignado"));
si("quien nunca eligio: le llega todo como siempre", c.notifPermite("cynthia", "asignado"));
si("tipo desconocido: suena como siempre", c.notifPermite("samuel", "otro"));
c.disparaPushInstantaneo("samuel", "Nueva tarea asignada", "Te asignaron: X", "u");
eq("no se le manda lo que apago", enviados.length, 0);
c.disparaPushInstantaneo("samuel", "Urgente: Requiere tu acción", "La tarea X requiere tu decisión", "u");
eq("lo urgente si, y el tipo viaja al servidor", [enviados.length, enviados[0] && enviados[0].tipo], [1, "espera"]);
c.disparaPushInstantaneo("salvador", "Urgente: Requiere tu acción", "x", "u");
eq("nunca a uno mismo", enviados.length, 1);

/* pantalla */
c.PERSONAS.cynthia2 = { nombre: "Cynthia" }; vm.runInContext("yo='cynthia2'", c); escritos.length = 0;
var h = c.vNotif();
eq("al abrir sin nada guardado, se guarda lo que se ve (Solo urgente)", [escritos.length, escritos[0][2].notif.preset], [1, "urgente"]);
si("titulo y subtitulo", /Notificaciones/.test(h) && /Qué hace sonar tu celular/.test(h));
eq("4 atajos, 'Solo urgente' marcado", (h.match(/data-npre="(\w+)" class="on"/) || [])[1], "urgente");
eq("9 interruptores", (h.match(/data-ntipo=/g) || []).length, 9);
eq("prendidos los 4 urgentes", (h.match(/class="tg on"/g) || []).length, 4);
si("titulos con Mayúscula Inicial salvo conectores", /Recordatorios y Alarmas/.test(h) && /Mensaje de una Persona de una Tarea/.test(h) && /Falla del Sistema/.test(h));
si("iconos de linea", /data-i="reloj"/.test(h) && /data-i="msj"/.test(h));
si("⋯ del inicio abre Notificaciones", /id="bhmas"/.test(html) && /vista="notif"/.test(html) && /if\(vista==="notif"\)\{a\.innerHTML=vNotif\(\);bindNotif\(\);return\}/.test(html));
si("se lee de la ficha al cargar", /if\(o\.notif && typeof o\.notif==="object"\) p\.notif=o\.notif;/.test(html));

var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
eq("el script de index.html compila", okc, true);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
