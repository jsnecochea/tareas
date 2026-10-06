#!/usr/bin/env node
/* PRUEBAS build 202 + 203 (Sí = alarma de Doit al instante + gcal "pendiente"; sin hora se pide hora o Todo el día):
   build 202: "¿Te lo agendo?" en Falta info. Tareas o datos con campo evento (Mac 18f) o con una cita
   detectada (palabra de cita + fecha exacta u hora) llevan como ULTIMO paso del checklist la pregunta Si / No;
   Si = recordatorio de Doit (nuevoAviso) + Google Calendar con el evento lleno (hora de Monterrey -> UTC) +
   agendado:true; No = agendar:false; sin fecha se pide el dia antes. Usa el nucleo de fechas REAL.
   Reloj fijo: domingo 4-oct-2026 19:30 Monterrey. Correr: TZ=America/Monterrey node tests/agenda.test.js */
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
function bloque(a, b) { var i = html.indexOf(a), j = html.indexOf(b); return html.slice(i, j + b.length); }
/* el nucleo de fechas, igual que tests/fechas.test.js */
var ft = fs.readFileSync(path.join(__dirname, "fechas.test.js"), "utf8");
var F_FUNCS = eval(ft.match(/var FUNCS = (\[[\s\S]*?\]);/)[1]), F_VARS = eval(ft.match(/var VARS = (\[[\s\S]*?\]);/)[1]);
var FUNCS = F_FUNCS.concat([ "_bpega", "viva249", "personasPara250", "resuelveDestino", "buscaContactos249", "contactosApp249", "nombreWA251", "nombresExactosWA251", "sinResultado251", "ordenesImposibles251", "refuerzo251", "preguntaConcreta251", "ultimos10_251", "ordenCondicional250", "ejecutaCond250", "resuelveCond250", "eventoDicho250", "venceCond250", "_diaAntes250", "mostrarAcomoda249", "ocultaAcomoda249", "liberaAcomoda249", "preguntas249", "abrePreguntas249", "esPersonaQ249", "palTema248", "temaComun248", "esCerradaReciente248", "nombreVinc248", "preguntaQuienYaResuelta248", "aplicaLecturaFechas248", "lecturaFechas248", "_hitsFecha248", "cierraDeEvento248", "pasosSeguimiento248", "armaMensajesSeguimiento248", "reintentaDudas248", "rangoHora", "eventoDe", "eventoPendiente", "mtyAUtcMs", "_gcalUtc", "urlGoogleCal", "vAgenda", "propuestaAgenda", "fechaRespaldada", "evidenciaDe", "vClipEvid", "guardaFechaEvento", "agendaEvento", "noAgendar", "lineaAgenda",
  "completitud", "contextoPct", "contextoDe", "tipoItem", "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "faltaPrimero",
  "revisaCompleta", "nuevoAviso", "textoCuando", "horaBonita", "conMayuscula", "tipoRevisar", "tipoRevisar0", "porAutorizar", "creadaPorSistema", "faltaInfoRev",
  "esDecisionSal", "meDetiene", "faltaVieja", "diaMonterrey"]).filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["MODO_CEREBRO", "TIPOS_ORDEN251", "ESTADO_COND250", "EMPRESAS248", "CITA_RE", "MESES229", "CTX_MIN_PAL", "REV_DESDE", "AGENDA_HORA_TODO_DIA"]);
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" +
  FUNCS.map(function (f) { return saca("function", f); }).join("\n");

var RealDate = Date, NOW = new RealDate(2026, 9, 4, 19, 30, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
  return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var abiertos = [], toasts = [], renders = 0, sincr = 0;
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, Intl: Intl,
  isNaN: isNaN, parseInt: parseInt, encodeURIComponent: encodeURIComponent,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true } }, tareas: [], vista: "lista", abierta: null,
  window: { open: function (u) { abiertos.push(u); return {}; } }, location: {},
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); },
  ico: function (n) { return "<svg data-ico=\"" + n + "\"></svg>"; }, fmt24: function () { return false; },
  toast: function (x) { toasts.push(x); }, render: function () { renders++; }, guarda: function () {}, sincronizaAvisos: function () { sincr++; },
  selloYSigue: function () {}, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; },
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); } };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
function T(x) { var b = { id: "tIAPRUEBA", nombre: "Boda de Ana y Luis", duenio: "salvador", creada_por: "ia_revisor", por_autorizar: true, estado: "abierta", tipo: "unica",
  f_vigente: "", contexto: "Invitación que mandó Karina por WhatsApp a la boda de Ana y Luis en el Jardín Los Álamos, etiqueta formal, hay que confirmar", msgs: [], creada: NOW - 60000 };
  for (var k in x) b[k] = x[k]; return b; }

/* 1 de donde sale el evento */
var BODA = T({ tipo_item: "dato", es_dato: true, de_quien: "Karina", datos_corregidos: [{ t: "Mesa 12" }], evento: { titulo: "Boda Ana y Luis", fecha: "2026-11-07", hora: "19:30", lugar: "Jardín Los Álamos", notas: "Etiqueta formal" } });
eq("campo evento (Mac 18f)", c.eventoDe(BODA), { titulo: "Boda Ana y Luis", fecha: "2026-11-07", hora: "19:30", lugar: "Jardín Los Álamos", notas: "Etiqueta formal", todo_dia: false, origen: "campo", hora_fin: "" });
eq("campo con fecha/hora mal formadas: vacías, nada se completa", c.eventoDe(T({ evento: { titulo: "Cita", fecha: "7 nov", hora: "7pm" } })).fecha + "|" + c.eventoDe(T({ evento: { titulo: "Cita", fecha: "7 nov", hora: "7pm" } })).hora, "|");
var DENT = T({ id: "tDENT", nombre: "Cita con el dentista", creada_por: "salvador", por_autorizar: false, contexto: "", msgs: [{ k: "bo", t: "La abriste dictando: “cita con el dentista el 12 de octubre a las 5 de la tarde”", ts: NOW - 1000 }] });
eq("detectada: palabra de cita + fecha exacta y hora (núcleo de fechas real)", c.eventoDe(DENT), { titulo: "Cita con el dentista", fecha: "2026-10-12", hora: "17:00", lugar: "", notas: "", todo_dia: false, origen: "detectado", hora_fin: "" });
eq("detectada con día de la semana sin número: la fecha NO se pone sola (se pregunta)", c.eventoDe(T({ evento: null, nombre: "Junta con socios", contexto: "", msgs: [{ k: "bo", t: "La abriste dictando: “junta con socios el jueves a las 10”" }] })).fecha, "");
eq("palabra de cita sin fecha ni hora: no es evento", c.eventoDe(T({ evento: null, nombre: "Agendar Reunión Consejo Colonia Cumbres", contexto: "de preferencia jueves a cenar o viernes a comer", msgs: [] })), null);
eq("sin palabra de cita: no es evento aunque tenga fecha", c.eventoDe(T({ evento: null, nombre: "Pagar predial", contexto: "el 12 de octubre", msgs: [] })), null);
eq("un recordatorio ya es alarma: no se detecta", c.eventoDe(T({ evento: null, es_recordatorio: true, nombre: "Cita dentista 12 de octubre" })), null);

/* 2 el checklist: ultimo paso */
var cb = c.completitud(BODA), ult = cb.items[cb.items.length - 1];
eq("último paso del checklist = ¿Te lo agendo?", [ult.k, ult.ok, ult.tx], ["agenda", false, "¿Te lo agendo?"]);
eq("y mientras no se decide NO queda completa", cb.completa, false);
eq("en el renglón de inicio: 'falta agendar' cuando es lo único", c.faltaPrimero(c.completitud(T({ tipo_item: "dato", es_dato: true, de_quien: "Karina", datos_corregidos: [{ t: "Mesa 12" }], evento: BODA.evento }))).txt, "falta agendar");
var SINF = T({ evento: { titulo: "Cena Mori", fecha: "", hora: "21:00", lugar: "", notas: "" } });
eq("sin fecha: el paso pide el día primero", c.completitud(SINF).items.slice(-1)[0].tx, "¿Qué día es? (para agendarlo)");
eq("evento que ya pasó: no se pregunta, ni en la tarjeta ni en el checklist (build 204)", [c.eventoPendiente(T({ evento: { titulo: "x", fecha: "2026-10-01", hora: "" } })), c.completitud(T({ evento: { titulo: "x", fecha: "2026-10-01" } })).items.some(function (x) { return x.k === "agenda"; })], [false, false]);
eq("tarea hecha a mano con cita detectada sale en Falta info", c.tipoRevisar(DENT), "falta");
eq("ya decidida (agendado o agendar:false): sale de Falta info por este motivo", [c.eventoPendiente(T({ evento: BODA.evento, agendado: true })), c.eventoPendiente(T({ evento: BODA.evento, agendar: false }))], [false, false]);

/* 3 la tarjeta */
var h1 = c.vAgenda(BODA);
si("build 229: franja compacta 'Agendar' con ícono de línea, Sí y ⋯ (el No va en el menú)", /<span class="agk">Agendar<\/span>/.test(h1) && /data-ico="cal"/.test(h1) && /data-agenda="si">Sí</.test(h1) && /data-agmenu="1"/.test(h1) && !/data-agenda="no"/.test(h1));
si("una línea con lo que propone Claude: día, hora, título y lugar", /Sáb 7 nov · a las 7:30 PM · Boda Ana y Luis · Jardín Los Álamos/.test(h1));
var h2 = c.vAgenda(SINF);
si("sin fecha: pide el día (fecha y hora) y NO enseña Sí", /¿Qué día es\? Sin fecha no lo agendo\./.test(h2) && /type="date"/.test(h2) && /type="time" id="agh" value="21:00"/.test(h2) && !/data-agenda=/.test(h2) && /data-agguarda="1">Guardar</.test(h2));
eq("Guardar Fecha sin día: no guarda", [c.guardaFechaEvento(SINF, "", "21:00"), toasts.slice(-1)[0]], [false, "Pon el día"]);
si("Guardar Fecha con día: queda en el evento como fecha dictada y ya aparece Sí / No", c.guardaFechaEvento(SINF, "2026-10-09", "21:00") && SINF.evento.fecha === "2026-10-09" && SINF.evento.fecha_dictada === true && /data-agenda="si"/.test(c.vAgenda(SINF)));

/* 4 Si (build 203: sin abrir Calendar) */
abiertos.length = 0; sincr = 0;
var B2 = JSON.parse(JSON.stringify(BODA)); var evA = c.agendaEvento(B2);
eq("Sí: NO abre Google Calendar", abiertos.length, 0);
eq("Sí: alarma de Doit al instante con el mecanismo de siempre (avisos + sincroniza)", [B2.avisos.length, B2.avisos[0].fecha, B2.avisos[0].hora, B2.avisos[0].texto, sincr], [1, "2026-11-07", "19:30", "Boda Ana y Luis", 1]);
eq("Sí: gcal pendiente + evento completo para el trabajador", [B2.gcal, B2.agendado, B2.agendar, B2.evento.titulo, B2.evento.fecha, B2.evento.hora, B2.evento.lugar, B2.evento.notas, B2.evento.todo_dia, B2.evento.aviso_ts === B2.avisos[0].ts],
  ["pendiente", true, true, "Boda Ana y Luis", "2026-11-07", "19:30", "Jardín Los Álamos", "Etiqueta formal", false, true]);
si("queda la nota en el hilo", /^Agendado: “Boda Ana y Luis” · sábado 7 de noviembre · a las 7:30 PM · Jardín Los Álamos\. La alarma de Doit ya quedó; el Calendario va en camino\.$/.test(B2.msgs.slice(-1)[0].t));
eq("y con todo lo demás completo queda lista para Autorizar (build 209: ya no sola)", [!!B2.autorizada, B2.en_revision, B2.pendiente_info || ""], [false, true, ""]);
eq("línea en la ficha: en camino", c.lineaAgenda(B2).replace(/<[^>]+>/g, ""), "Agendado ✓ · Calendario: en camino");
B2.gcal_id = "abc123"; eq("cuando el trabajador escribe gcal_id: Calendario ✓", c.lineaAgenda(B2).replace(/<[^>]+>/g, ""), "Agendado ✓ · Calendario ✓");
eq("sin agendar: no hay línea", c.lineaAgenda(BODA), "");
var SF2 = T({ evento: { titulo: "Cena", fecha: "", hora: "" } });
eq("Sí sin fecha: no agenda, pide el día", [c.agendaEvento(SF2), !!SF2.agendado, SF2.gcal, toasts.slice(-1)[0]], [null, false, undefined, "Primero el día"]);
/* sin hora: se pide en la misma pregunta */
var SH = T({ id: "tSH", evento: { titulo: "Graduación", fecha: "2026-12-05", hora: "", lugar: "Auditorio" } });
var hS = c.vAgenda(SH);
si("sin hora: propone todo el día, sin campo de hora a la vista (la hora va dentro de Cambiar)", /todo el día/.test(hS) && !/type="time"/.test(hS) && /data-agenda="si"/.test(hS));
eq("Sí sin hora ni Todo el día: no agenda", [c.agendaEvento(SH), !!SH.agendado, toasts.slice(-1)[0]], [null, false, "Pon la hora o Todo el día"]);
c.agendaEvento(SH, "18:00");
eq("con la hora puesta: alarma a esa hora y evento con hora", [SH.avisos[0].hora, SH.evento.hora, SH.evento.todo_dia, SH.gcal], ["18:00", "18:00", false, "pendiente"]);
var SD = T({ id: "tSD", evento: { titulo: "Kermés", fecha: "2026-11-15", hora: "" } }); c.window.__agTodoDia = {}; c.window.__agTodoDia[SD.id] = 1;
si("menú ⋯: Cambiar fecha u hora · Todo el día · No agendar", /\["Cambiar fecha u hora", function\(\)/.test(html) && /\["Todo el día", function\(\)\{ agendaTodoDia\(t\); render\(\); \}\]/.test(html) && /\["No agendar", function\(\)\{ noAgendar\(t\); \}\]/.test(html));
c.agendaEvento(SD, "", true);
eq("Todo el día: la alarma suena ese día a las 8:00, el evento queda de todo el día", [SD.avisos[0].fecha, SD.avisos[0].hora, SD.evento.hora, SD.evento.todo_dia, SD.gcal], ["2026-11-15", "08:00", "", true, "pendiente"]);
si("y la nota lo dice", /todo el día\. La alarma de Doit ya quedó \(ese día a las 8:00 AM\); el Calendario va en camino\.$/.test(SD.msgs.slice(-1)[0].t));
eq("el enlace de Calendar sigue sabiendo convertir la hora (por si se usa): 7-nov 19:30 MTY = 01:30 UTC", c.urlGoogleCal({ titulo: "x", fecha: "2026-11-07", hora: "19:30" }, null).match(/dates=([^&]+)/)[1], "20261108T013000Z/20261108T023000Z");

/* 5 No */
var B3 = JSON.parse(JSON.stringify(BODA)); abiertos.length = 0; c.noAgendar(B3);
eq("No: agendar:false, sin calendario ni recordatorio, y sigue (lista para Autorizar si ya estaba todo)", [B3.agendar, !!B3.agendado, abiertos.length, (B3.avisos || []).length, !!B3.autorizada, B3.en_revision], [false, false, 0, 0, false, true]);
eq("y el paso dice 'Sin agendar'", c.completitud(B3).items.slice(-1)[0].tx, "Sin agendar");

/* 6 en el codigo */
si("el paso va dentro de vFaltaInfo y los botones están cableados", /h\+=vAgenda\(t\);/.test(html) && /var _ev=eventoDe\(t\); agendaEvento\(t, "", !\(_ev&&_ev\.hora\)\);/.test(html) && /data-agmenu\]"\)/.test(html));
si("build 203: agendar ya NO abre Calendar ni navega", !/w=window\.open\(url/.test(html) && !/location\.href=url/.test(html));
si("build 203 → 234: el agendado vive en la ficha de FECHA (verde si está completo)", /var ag=estadoAgenda228\(t\), cz=citas234\(t\)/.test(html) && /data-chip="fecha"/.test(html) && !/data-chip="agenda"/.test(html));
si("VERSION_APP build 203 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 203);

console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
