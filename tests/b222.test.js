#!/usr/bin/env node
/* PRUEBAS build 222 (rama "metas"; NO publicar sin aprobación de Salvador): tareas continuas con METAS (checklist "Metas").
   Bloque Metas con semáforo, quién, foto y palomear; historial de cumplidas; en una continua toda fecha dictada es META (nunca
   finiquito) y avisa si se parece a una cumplida ("¿duró poco?"); seguimiento por meta por la cola [A LAS]; aviso de atraso.
   Caso real "Mantenimiento Casa Lerdo/Eloísa" (tIAMUVF22TRJF). Correr: TZ=America/Monterrey node tests/b222.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var lineas = html.split("\n");
function saca(tipo, nombre) {
  var re = tipo === "function" ? new RegExp("^function " + nombre.replace(/\$/g, "\\$") + "\\(") : new RegExp("^var " + nombre + "\\s*=");
  var ini = -1; for (var i = 0; i < lineas.length; i++) if (re.test(lineas[i])) ini = i;
  if (ini < 0) throw new Error("no encontre " + tipo + " " + nombre);
  var out = [lineas[ini]];
  for (var k = ini + 1; k < lineas.length; k++) { var L = lineas[k]; if (L.length && !/^[\s}\]]/.test(L)) break; out.push(L); if (/^}/.test(L)) break; }
  return out.join("\n");
}
function bloque(a, b) { var i = html.indexOf(a), j = html.indexOf(b); return html.slice(i, j + b.length); }
var ft = fs.readFileSync(path.join(__dirname, "fechas.test.js"), "utf8");
var F_FUNCS = eval(ft.match(/var FUNCS = (\[[\s\S]*?\]);/)[1]), F_VARS = eval(ft.match(/var VARS = (\[[\s\S]*?\]);/)[1]);
var FUNCS = F_FUNCS.concat(["checklistTexto", "aplicaChecklistClaude", "aplicaResponsable", "esMetas", "necesitaAprobacion", "ejecutorNombre", "vistaSup", "porAprobar", "aplicaAvisoInmediato", "importanciaDe", "ejecutorMeta", "respuestasEjecutor", "textoEmpuje", "empujaEjecutor", "evidenciaMeta", "fechaPropuesta", "escalaMeta", "decideMeta", "vDecisionMeta", "miembroDeNombre", "metasDe", "metaCumplida", "metaCorta", "tareaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "metaNueva", "_raizMeta", "metaParecidaCumplida", "cumpleMeta", "fotoMeta", "programaSegMeta", "aplicaMetasClaude", "chequeoMetas", "vMetas", "hhmmAhora", "nombreCorto", "_tokPer", "nombresEnTexto", "_compartirLista", "candidatosPersona", "resuelvePersona", "nuevaDudaPersona", "asignaResponsable", "agregaCompartir", "fechasDeCada", "programaSeguimiento", "resuelveDudaPersona", "_n179", "nombreInt", "agregaIntegrante", "aplicaSeguimientoA", "_dichoNombre", "nombreCorto", "tieneChecklist", "chkNuevo", "chkPon", "_nv", "checklistDicho", "respChecklist", "_chkTok", "chkBusca", "hhmmAhora", "esConfirmacion", "juntaY", "tienePasos", "esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "fechaMty238", "horaMty238", "duenoDicho238", "fechaOrden238", "candidatasVinc238", "nombreTarea238", "corto238", "mandaOrden238", "ejecutaOrdenes238", "dioFecha238", "vHecho238", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "eventoPendiente", "faltaVieja", "tipoRevisar", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "okDeRevision", "palomeaEnOrden", "autorizaRevision", "fichaRevision", "rangoHora", "descartaVinculos", "agendaEvento", "urlGoogleCal", "_gcalUtc", "mtyAUtcMs", "horaBonita", "fmt24", "nuevoAviso", "abiertasParaVincular", "estadoParaClaude", "promptRevision", "aplicaRevisionClaude", "tituloTarea", "traeFecha", "transfiere", "posibleDup", "contactoDeTarea", "miembroDeNombre", "_tsDe", "_fsa"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "AGENDA_HORA_TODO_DIA", "PALOMEO_MS", "TITULO_CONECTORES", "RITMO_RE", "CITA_RE", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var RealDate = Date, NOW = new RealDate(2026, 9, 4, 21, 14, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
  return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var IA = { resp: null, err: null, llamadas: 0 }, renders = 0, sellos = [];
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, Intl: Intl, isNaN: isNaN, parseInt: parseInt,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, josue: { nombre: "Josué" } }, tareas: [], window: {}, vista: "hilo", abierta: null,
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }, ico: function () { return ""; },
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); }, guarda: function () {}, render: function () { renders++; },
  preguntaAClaude: function (m, mod, cb) { IA.llamadas++; IA.prompt = m[0].content; cb(IA.err ? null : JSON.stringify(IA.resp || {}), IA.err); },
  selloYSigue: function (t, o) { sellos.push(o.tipo); }, sincronizaAvisos: function () {}, cierraHecha: function () {}, completaPendiente: function () {}, nuevoAviso: function () {},
  localStorage: { getItem: function () { return null; } }, setTimeout: function (f) { f(); }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, PROG: [], mandaProgramado: function (t, pg) { c.PROG.push(JSON.parse(JSON.stringify(pg))); }, fechaMovCorta: function (f) { return f.slice(5); }, estadoReal: function (t) { return t.estado || "abierta"; } };
vm.createContext(c); vm.runInContext(codigo, c);


var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
si("VERSION_APP build 222", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 222);
c.todosLosContactos = function () { return []; };
c.agregaIntegrante = function () {};
c.urlTarea = function (id) { return "u:" + id; }; c.PUSH = []; c.disparaPushInstantaneo = function (k, a, b) { c.PUSH.push([k, a, b]); };
function LERDO(o) { return Object.assign({ id: "tIAMUVF22TRJF", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", indefinida: true, revisa_ext: "Manuel Parra", f_vigente: "", wa_contactos: [{ nombre: "Manuel Parra" }], msgs: [],
  checklist: { titulo: "Metas", items: [
    { id: "lerdo01", tx: "Azotea: confirmar con foto si es panal; techo limpio (ramas y escombro fuera), impermeabilizado y panal/nido resuelto", fecha: "2026-10-09", estado: 0, seguimiento: "Manuel Parra L-M-V 10:00" },
    { id: "lerdo02", tx: "Interior: cielo pintado y mancha de humedad junto al baño limpia", fecha: "2026-10-16", estado: 0 }] } }, o || {}); }
var t = LERDO();
si("la tarea real es de metas", c.esMetas(t));
eq("nombres cortos: tarea y meta", [c.tareaCorta(t), c.metaCorta(t.checklist.items[0]), c.metaCorta(t.checklist.items[1]), c.fechaMeta("2026-10-09")], ["Casa Lerdo", "Azotea", "Interior", "9-oct"]);
var m0 = t.checklist.items[0];
eq("semáforo: a tiempo / vence hoy / atrasada (rojo)", [c.semaforoMeta(m0, "2026-10-04"), c.semaforoMeta(m0, "2026-10-09"), c.semaforoMeta(m0, "2026-10-11")],
  [{ k: "verde", tx: "A tiempo · faltan 5 días" }, { k: "ambar", tx: "Vence hoy" }, { k: "rojo", tx: "Atrasada · 2 días" }]);
eq("quién: si la meta no dice, el responsable de la tarea", c.quienMeta(t, m0), "Manuel Parra");
/* palomear -> historial */
var cm = c.cumpleMeta(t, "lerdo01", "data:image/jpeg;base64,AAA");
eq("palomear: cumplida hoy, con foto, NO se borra", [cm.estado, cm.cumplida, !!cm.foto, t.checklist.items.length, t.msgs.slice(-1)[0].t], [2, "2026-10-04", true, 2, "Meta cumplida: “Azotea” (4-oct, con foto). Queda en el historial."]);
/* fecha dictada en una continua = META, nunca finiquito */
var NOW = c.Date.now(), fd3 = c.fechaDictada("que impermeabilicen la azotea en 3 meses").todas;
t = LERDO(); t.checklist.items[0].estado = 2; t.checklist.items[0].cumplida = "2026-10-09";
var rv = c.aplicaRevisionClaude(t, "que impermeabilicen la azotea en 3 meses", { fecha: fd3[0], metas: [{ tx: "Impermeabilizar la azotea", fecha: fd3[0] }] }, []);
var nueva = t.checklist.items[t.checklist.items.length - 1];
eq("'en 3 meses' en una continua: meta con su fecha; finiquito intacto", [nueva.tx, nueva.fecha, t.f_vigente, rv.hecho.indexOf("meta “Impermeabilizar la azotea” para el " + c.fechaMeta(fd3[0])) >= 0], ["Impermeabilizar la azotea", fd3[0], "", true]);
si("se parece a una cumplida: '¿duró poco?'", rv.dudas.indexOf("Se cumplió “Azotea” el 9-oct; ¿duró poco?") >= 0);
t = LERDO(); rv = c.aplicaRevisionClaude(t, "que quede pintada la barda el 9", { fecha: "2026-10-09", metas: [{ tx: "Barda pintada", fecha: "2026-10-09" }] }, []);
eq("'que quede … el 9': meta 9-oct, no finiquito", [t.checklist.items.slice(-1)[0].fecha, t.f_vigente], ["2026-10-09", ""]);
t = LERDO(); rv = c.aplicaRevisionClaude(t, "hay que revisar la alberca", { metas: [{ tx: "Alberca revisada", fecha: "2026-10-20" }] }, []);
eq("meta sin fecha dictada: no se inventa la fecha, se pregunta", [t.checklist.items.slice(-1)[0].fecha, rv.dudas.indexOf("¿Para cuándo queda “Alberca revisada”?") >= 0], ["", true]);
t = LERDO({ indefinida: false, checklist: null, f_vigente: "" }); rv = c.aplicaRevisionClaude(t, "que quede el 9", { fecha: "2026-10-09", metas: [{ tx: "x", fecha: "2026-10-09" }] }, []);
eq("tarea NO continua: sin metas; la fecha sigue siendo su finiquito (como antes)", [!!t.checklist, t.f_vigente], [false, "2026-10-09"]);
t = LERDO({ checklist: { titulo: "Invitados", items: [{ id: "c1", tx: "Rogelio", estado: 0 }] } });
rv = c.aplicaRevisionClaude(t, "que quede el 9", { metas: [{ tx: "Azotea lista", fecha: "2026-10-09" }] }, []);
eq("si ya hay otra lista, no se pisa", [t.checklist.titulo, t.checklist.items.length, rv.dudas.some(function (d) { return /ya tiene la lista “Invitados”/.test(d); })], ["Invitados", 1, true]);
t = LERDO({ checklist: null }); c.aplicaRevisionClaude(t, "que quede la azotea el 9", { metas: [{ tx: "Azotea lista", fecha: "2026-10-09" }] }, []);
eq("sin lista: nace la lista 'Metas'", [t.checklist.titulo, t.checklist.items.length], ["Metas", 1]);
/* seguimiento por meta */
c.PROG.length = 0; t = LERDO();
rv = c.aplicaRevisionClaude(t, "que quede la azotea el 9 y dale seguimiento a Manuel lunes, miércoles y viernes", { metas: [{ tx: "Azotea lista", fecha: "2026-10-09", seguimiento: { quien: "Manuel", cada: "lunes, miércoles y viernes", hora: null } }] }, []);
eq("seguimiento de la meta: por la cola, solo hasta la fecha de la meta, 10:00 por defecto",
  c.PROG.map(function (p) { return [p.contacto, p.a_las.fecha, p.a_las.hora, p.texto]; }),
  [["Manuel Parra", "2026-10-05", "10:00", "IA: Hola Manuel, ¿cómo vas con azotea lista? Quedamos para el 9-oct."], ["Manuel Parra", "2026-10-07", "10:00", "IA: Hola Manuel, ¿cómo vas con azotea lista? Quedamos para el 9-oct."], ["Manuel Parra", "2026-10-09", "10:00", "IA: Hola Manuel, ¿cómo vas con azotea lista? Quedamos para el 9-oct."]]);
eq("queda en la meta {contacto, cada, hora}", (function (m) { return [m.seg.contacto, m.seg.cada, m.seg.hora]; })(t.checklist.items.slice(-1)[0]), ["Manuel Parra", "lunes, miércoles y viernes", "10:00"]);
/* ---- atraso (Salvador 11:17): primero el EJECUTOR, positivo, 1 al día; a Salvador solo decisiones armadas ---- */
c.WA = []; c.pideWhatsApp = function (cpo) { c.WA.push(cpo); return Promise.resolve({ id: "p" + c.WA.length }); };
var DIA = 86400000, HOY = c.hoy();   /* 2026-10-04 (reloj de prueba) */
t = LERDO(); t.checklist.items[0].fecha = "2026-10-03"; t.checklist.items[1].fecha = "2026-10-30"; c.tareas = [t]; c.PUSH.length = 0;
var at10 = new Date(HOY + "T10:00:00").getTime();
c.chequeoMetas(at10); c.chequeoMetas(at10 + 3600000);
eq("vence sin palomear (1 día, normal): mensaje al EJECUTOR por la cola, UNO al día; a Salvador nada",
  [c.WA.map(function (x) { return [x.contacto, x.texto]; }), (t.decision_meta || []).length, c.PUSH.length, t.pendiente_tipo || ""],
  [[["Manuel Parra", "IA: Hola Manuel, gracias por lo que van avanzando en Casa Lerdo. La meta “Azotea” estaba para el 3-oct. ¿Qué te falta para dejarla lista y para qué día la podemos cerrar? Si me mandas una foto de cómo va, mejor."]], 0, 0, ""]);
si("positivo: sin regaño ni conteo de veces", !/(van \d|otra vez|de nuevo|ya te|tarde|regañ|insist)/i.test(c.WA[0].texto));
si("queda en la tarea como '→ Manuel: … · en cola'", /^→ Manuel Parra: “Hola Manuel, gracias/.test(t.msgs.slice(-1)[0].t) && t.msgs.slice(-1)[0].wa === 1);
c.WA.length = 0; c.chequeoMetas(new Date(HOY + "T21:30:00").getTime());
eq("fuera de horario (después de 20 h) no se le escribe", c.WA.length, 0);
/* normal: 2 seguimientos sin respuesta -> escala */
c.WA.length = 0; t.checklist.items[0].empuje.ult = "2026-10-03"; c.chequeoMetas(at10 + 2 * 3600000);
eq("al día siguiente, sin respuesta: 2º mensaje al ejecutor (todavía no a Salvador)", [c.WA.length, (t.decision_meta || []).length], [1, 0]);
c.WA.length = 0; t.checklist.items[0].empuje.ult = "2026-10-03"; c.chequeoMetas(at10 + 3 * 3600000);
eq("2 seguimientos sin respuesta (normal) -> UNA tarjeta para Salvador, ya no se le escribe", [c.WA.length, (t.decision_meta || []).length, t.decision_meta && t.decision_meta[0].motivo], [0, 1, "no contestó 2 seguimientos"]);
/* respuesta del ejecutor, evidencia y costo en la tarjeta */
t = LERDO({ criticidad: "normal" }); t.checklist.items[0].fecha = "2026-10-01"; t.checklist.items[1].fecha = "2026-10-30"; c.tareas = [t];
t.msgs.push({ k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: new Date("2026-10-02T12:00:00").getTime(), t: "Manuel Parra: falta impermeabilizar, el material cuesta $2,800 y lo dejamos el martes 6" },
  { k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: new Date("2026-10-02T12:01:00").getTime(), t: "Manuel Parra: foto", tipo: "foto", url: "https://doit/f1.jpg" });
c.WA.length = 0; c.chequeoMetas(at10);
var D0 = t.decision_meta[0];
eq("3 días de atraso (normal) -> tarjeta completa: meta, fecha, atraso, qué contestó, fotos, costo, propuesta de fecha",
  [c.WA.length, D0.corta, D0.fecha, D0.atraso, D0.motivo, D0.resp, D0.fotos, D0.costo, D0.nueva],
  [0, "Azotea", "2026-10-01", 3, "lleva 3 días de atraso (importancia normal)", ["falta impermeabilizar, el material cuesta $2,800 y lo dejamos el martes 6", "foto"], ["https://doit/f1.jpg"], "$2,800", "2026-10-06"]);
eq("y en la lista sale como 'Esperando tu decisión'", [t.pendiente_tipo, t.pendiente_info], ["decision_salvador", "Meta “Azotea” atrasada 3 días · Manuel Parra: decide"]);
c.chequeoMetas(at10 + 3600000);
eq("una sola tarjeta (no se repite)", t.decision_meta.length, 1);
/* criticidad alta: 1 día; baja: 7 días; aviso_inmediato: de una */
function escala(o, fecha) { var x = LERDO(o); x.checklist.items[0].fecha = fecha; x.checklist.items[1].fecha = "2026-10-30"; c.tareas = [x]; c.WA.length = 0; c.chequeoMetas(at10); return [(x.decision_meta || []).length, c.WA.length]; }
eq("alta (diario): 1 día de atraso ya escala", escala({ criticidad: "diario" }, "2026-10-03"), [1, 0]);
eq("baja (lento): con 6 días todavía solo se le escribe al ejecutor", escala({ criticidad: "lento" }, "2026-09-28"), [0, 1]);
eq("baja (lento): con 7 días escala", escala({ criticidad: "lento" }, "2026-09-27"), [1, 0]);
eq("'avísame de inmediato si se vence' (tarea): escala el primer día", escala({ aviso_inmediato: true }, "2026-10-03"), [1, 0]);
/* decidir en un toque */
t = LERDO(); t.checklist.items[0].fecha = "2026-10-01"; t.checklist.items[1].fecha = "2026-10-30"; c.tareas = [t];
t.msgs.push({ k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: new Date("2026-10-02T12:00:00").getTime(), t: "Manuel Parra: el material cuesta $2,800, lo dejamos el martes 6" });
c.chequeoMetas(at10); c.WA.length = 0;
var tx = c.decideMeta(t, t.decision_meta[0].id, "fecha");
eq("Nueva fecha: la meta se mueve, se le confirma al ejecutor y se limpia la decisión",
  [tx, t.checklist.items[0].fecha, t.checklist.items[0].fecha_antes, (t.decision_meta || []).length, t.pendiente_tipo, c.WA.map(function (x) { return x.texto; })],
  ["Nueva fecha para “Azotea”: 6-oct.", "2026-10-06", ["2026-10-01"], 0, "", ["IA: Hola Manuel, quedamos para el 6-oct con “Azotea”. ¡Gracias!"]]);
t.checklist.items[0].fecha = "2026-10-01"; c.chequeoMetas(at10); c.decideMeta(t, t.decision_meta[0].id, "hablo"); c.WA.length = 0;
t.checklist.items[0].escalada = null; t.checklist.items[0].empuje = null; t.criticidad = "lento"; c.chequeoMetas(at10);
eq("'Hablo yo con él': Claude deja de insistirle al ejecutor", [t.checklist.items[0].yo_hablo, c.WA.length], [true, 0]);
t = LERDO(); t.checklist.items[0].fecha = "2026-10-01"; t.checklist.items[1].fecha = "2026-10-30"; c.tareas = [t];
t.msgs.push({ k: "bi", wa_in: 1, wa_c: "Manuel Parra", ts: new Date("2026-10-02T12:00:00").getTime(), t: "Manuel Parra: el control de plagas cuesta $2,800" });
c.chequeoMetas(at10); c.WA.length = 0; c.decideMeta(t, t.decision_meta[0].id, "autorizo");
eq("Autorizo: queda autorizado con su costo y se le avisa al ejecutor", [t.checklist.items[0].autorizado.costo, c.WA[0].texto], ["$2,800", "IA: Hola Manuel, Salvador autoriza “Azotea” ($2,800). Adelante, ¡gracias!"]);
var html0 = c.vDecisionMeta({ decision_meta: [{ id: "d1", meta: "Azotea: techo limpio", corta: "Azotea", fecha: "2026-10-01", atraso: 3, motivo: "lleva 3 días de atraso (importancia normal)", ejecutor: "Manuel Parra", resp: ["lo dejamos el martes 6"], fotos: ["https://doit/f1.jpg"], costo: "$2,800", nueva: "2026-10-06" }] });
si("tarjeta: una sola, con los botones 'Nueva fecha 6-oct' / 'Hablo yo con él' / 'Autorizo'", (html0.match(/class="revc c-decmeta"/g) || []).length === 1 && /Nueva fecha 6-oct</.test(html0) && />Hablo yo con él</.test(html0) && />Autorizo</.test(html0) && /3 días de atraso/.test(html0) && /“lo dejamos el martes 6”/.test(html0));
si("sin costo no se ofrece 'Autorizo'", !/Autorizo/.test(c.vDecisionMeta({ decision_meta: [{ id: "d2", meta: "x", corta: "x", fecha: "2026-10-01", atraso: 3, motivo: "m", ejecutor: "", resp: [], fotos: [], costo: "", nueva: "2026-10-06" }] })));
/* aviso_inmediato dictado */
t = LERDO(); rv = c.aplicaRevisionClaude(t, "avísame de inmediato si se vence", { aviso_inmediato: true }, []);
eq("'avísame de inmediato si se vence' -> aviso_inmediato:true", [t.aviso_inmediato, rv.hecho.indexOf("aviso inmediato si se vence") >= 0], [true, true]);
t = LERDO(); c.aplicaRevisionClaude(t, "que quede la azotea el 9", { aviso_inmediato: true }, []);
eq("candado: sin pedirlo, no se pone", t.aviso_inmediato || false, false);
/* nota a Claude y lugares */
si("nota a Claude: metas; 'fecha' en una continua no mueve el finiquito", /var _mt222=aplicaMetasClaude\(t, v, j\|\|\{\}\)/.test(html) && /if\(t\.indefinida===true && j && String\(j\.accion\|\|""\)\.toLowerCase\(\)==="fecha"\)/.test(html) && /if\(a!=="fecha" && j\.fecha && t\.indefinida!==true\)/.test(html));
si("la supervisión de metas corre con los hitos", /chequeoHitos\(\); try\{ chequeoMetas\(\); \}/.test(html));
si("vChecklist pinta Metas cuando la lista es de metas", /if\(esMetas\(t\)\) return vMetas\(t\);/.test(html));
/* UI */
var css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || "";
var os = require("os"), UF = ["esMetas", "metasDe", "metaCumplida", "metaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "nombreCorto", "fechaMovCorta", "dDif", "vMetas"];
var pagina = '<!doctype html><meta charset="utf-8"><style>' + css + '</style><body style="background:#111;color:#f5f5f7;font-family:-apple-system,sans-serif;margin:0;width:390px"><div id="m"></div><script>var PERSONAS={salvador:{nombre:"Salvador"}}, H0="2026-10-11";' +
  'function hoy(){ return H0; } function ico(){ return "<svg width=16 height=16></svg>"; } function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); }' + UF.map(function (f) { return saca("function", f); }).join("\n") + '</script>';
var tmp = path.join(os.tmpdir(), "b222-" + process.pid + ".html"); fs.writeFileSync(tmp, pagina);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  try { await p.goto("file://" + tmp);
    var T0 = LERDO(); T0.checklist.items.push({ id: "lerdo00", tx: "Jardín: pasto cortado", fecha: "2026-10-11", estado: 0, quien: "Esteban" }, { id: "lerdoH", tx: "Focos: todos funcionando", fecha: "2026-10-03", estado: 2, cumplida: "2026-10-03", foto: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" });
    T0.checklist.items[1].seg = { contacto: "Manuel Parra", cada: "lunes, miércoles y viernes", hora: "10:00" };
    var u = await p.evaluate(function (t) { var m = document.getElementById("m"); m.innerHTML = vMetas(t);
      var rows = Array.prototype.map.call(m.querySelectorAll(".mt"), function (r) { return { cls: r.className, tx: r.querySelector(".mtx").textContent, meta: r.querySelector(".mtm").textContent, dot: getComputedStyle(r.querySelector(".mts")).backgroundColor,
        btn: Array.prototype.map.call(r.querySelectorAll("button"), function (x) { return x.textContent; }), seg: (r.querySelector(".mtg") || {}).textContent || "" }; });
      return { head: m.querySelector(".mth").textContent, rows: rows, hist: m.querySelector("#bmetahist").textContent, histOpen: !!m.querySelector(".mthl") }; }, T0);
    eq("encabezado: '1 atrasada · 3 pendientes'", u.head, "Metas1 atrasada · 3 pendientes");
    eq("solo ROJO si está atrasada; vence hoy y a tiempo, color normal", u.rows.map(function (r) { return [r.tx.split(":")[0], r.cls.replace("mt ", ""), r.dot]; }),
      [["Azotea", "s-rojo", "rgb(255, 69, 58)"], ["Jardín", "s-ambar", "rgb(142, 142, 147)"], ["Interior", "s-verde", "rgb(142, 142, 147)"]]);
    eq("renglón: fecha meta, semáforo y quién", [u.rows[0].meta, u.rows[1].meta], ["Meta: vie 9 oct · Atrasada · 2 días · Manuel Parra", "Meta: dom 11 oct · Vence hoy · Esteban"]);
    eq("botones: foto y palomear", u.rows[0].btn, ["Foto", "✓ Cumplida"]);
    eq("seguimiento de la meta visible", u.rows[2].seg, "Seguimiento: Manuel Parra · lunes, miércoles y viernes · 10:00");
    eq("historial plegado con su cuenta", [u.hist, u.histOpen], ["Historial de metas (1) ▾", false]);
    var h2 = await p.evaluate(function (t) { window.__metaHist = {}; window.__metaHist[t.id] = true; var m = document.getElementById("m"); m.innerHTML = vMetas(t);
      return Array.prototype.map.call(m.querySelectorAll(".mth1"), function (x) { return [x.querySelector(".mtx").textContent, x.querySelector(".mtm").textContent, !!x.querySelector("img")]; }); }, T0);
    eq("historial abierto: cumplida con fecha y foto", h2, [["Focos: todos funcionando", "Cumplida 3-oct · meta 3-oct", true]]);
    await p.evaluate(function (t) { window.__metaHist = {}; document.getElementById("m").innerHTML = vMetas(t); }, T0);
    await p.screenshot({ path: path.join(os.tmpdir(), "b222-metas.png") });
    eq("sin errores de página", errs, []);
  } finally { await b.close(); try { fs.unlinkSync(tmp); } catch (e) {} }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
