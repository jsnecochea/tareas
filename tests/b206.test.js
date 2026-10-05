#!/usr/bin/env node
/* PRUEBAS build 206 (base del arnés de 205) (Salvador 2026-10-04 21:14, "Agendar Reunión Consejo Colonia Cumbres"): lo dictado dentro de una tarea
   en "Falta info" la completa aunque suene a nota para Claude ("…es para que sepas el contexto" caía en esNotaClaude ->
   "No cambié nada en la tarea"). Al instante, sin IA: indefinida, ritmo, fecha y contexto; luego la IA afina; barras y
   renglones en vivo; "Solo me falta: …"; completa -> palomita. Núcleo de fechas REAL. Correr: TZ=America/Monterrey node tests/b205.test.js */
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
var FUNCS = F_FUNCS.concat(["checklistTexto", "aplicaChecklistClaude", "aplicaResponsable", "esMetas", "aplicaAvisoInmediato", "importanciaDe", "ejecutorMeta", "respuestasEjecutor", "textoEmpuje", "empujaEjecutor", "evidenciaMeta", "fechaPropuesta", "escalaMeta", "decideMeta", "vDecisionMeta", "miembroDeNombre", "metasDe", "metaCumplida", "metaCorta", "tareaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "metaNueva", "_raizMeta", "metaParecidaCumplida", "cumpleMeta", "fotoMeta", "programaSegMeta", "aplicaMetasClaude", "chequeoMetas", "vMetas", "hhmmAhora", "nombreCorto", "_tokPer", "nombresEnTexto", "_compartirLista", "candidatosPersona", "resuelvePersona", "nuevaDudaPersona", "asignaResponsable", "agregaCompartir", "fechasDeCada", "programaSeguimiento", "resuelveDudaPersona", "_n179", "nombreInt", "agregaIntegrante", "aplicaSeguimientoA", "_dichoNombre", "nombreCorto", "tieneChecklist", "chkNuevo", "chkPon", "_nv", "checklistDicho", "respChecklist", "_chkTok", "chkBusca", "hhmmAhora", "esConfirmacion", "juntaY", "tienePasos", "esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "eventoPendiente", "faltaVieja", "tipoRevisar", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "aplicaCamposNota", "autorizaRevision", "juntaNota", "ejecutaNotaClaude", "aplicaNotaClaude", "respuestaHecho", "traeFecha", "fechaConDia", "calendarioProximo", "fechaBonita"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "RITMO_RE", "CITA_RE", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var RealDate = Date, NOW = new RealDate(2026, 9, 4, 21, 14, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
  return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var IA = { resp: null, err: null, llamadas: 0 }, renders = 0, sellos = [];
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, Intl: Intl, isNaN: isNaN, parseInt: parseInt,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true } }, tareas: [], window: {}, vista: "hilo", abierta: null,
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }, ico: function () { return ""; },
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); }, guarda: function () {}, render: function () { renders++; },
  preguntaAClaude: function (m, mod, cb) { IA.llamadas++; IA.prompt = m[0].content; cb(IA.err ? null : JSON.stringify(IA.resp || {}), IA.err); },
  selloYSigue: function (t, o) { sellos.push(o.tipo); }, sincronizaAvisos: function () {}, cierraHecha: function () {}, completaPendiente: function () {}, nuevoAviso: function () {},
  setTimeout: function (f) { f(); }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, estadoReal: function (t) { return t.estado || "abierta"; },
  duenioDicho: function () { return null; }, transfiere: function () { return { ok: false }; }, faltanParaCerrar: function () { return []; }, tituloTarea: function (x) { return x; }, cierraSinEjecutar: function () {}, muestraDeshacer: function () {} };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
/* forma real de CONSEJO_CUMBRES_REUNION_20260927 (leída con el conector 2026-10-04 21:1x), antes del dictado */
function CONSEJO() { return { id: "CONSEJO_CUMBRES_REUNION_20260927", nombre: "Agendar Reunión Consejo Colonia Cumbres", creada_por: "claude", duenio: "salvador", tipo: "unica", estado: "abierta",
  f_original: "2026-09-27", f_vigente: "2026-09-27",
  tarea: "Agendar reunión del Consejo de la Colonia Cumbres con Enrique Martínez, Adolfo Rodríguez, Mario Castillo y Salvador — de preferencia jueves a cenar o viernes a comer",
  msgs: [{ aviso: 1, h: "14:53", k: "bal", t: "¿Para cuándo agendas la reunión con el Consejo Colonia Cumbres? Lleva 7 días vencida.", ts: NOW - 6 * 3600000 }] }; }
var DICTADO = "Esto es una tarea en contexto de donde meto todo lo que quiero hacer de proyectos en la colonia Cumbres donde yo estuve el presidente está Mario Castillo que es el secretario Adolfo Rodríguez que es el tesorero Enrique Martínez que es el vocal y Luis Mario no escucha que mi hermano y ahí nos ayuda a participar en el concepto no dormimos normalmente dos veces al año Y sacamos conclusiones de qué queremos hacer de nuevos proyectos como van las finanzas etc. entonces los casos importantes de proyectos grandes de finanzas aquí los meto cuando hay algo relevante es para que sepas el contexto Esta tarea es indefinida y cuyo propio es que merece un ritmo de una vez al mes estarme recordando este aquí para ver si vamos avanzando si no vamos avanzando ni pendiente el macro por lo pronto macro aquí tengo ahorita pues no no esté en mi proyecto de Navidad que es la decoración navideña cada año el proyecto de ponerle barda a todos los terrenos baldíos El proyecto de poner unas cámaras de seguridad el proyecto de ponerle jardinería alrededor de las plazas este para que queden muy bien el proyecto de reforestar unos árboles que se secaron";

var ult = function (t) { return t.msgs.slice(-1)[0]; };
function nota(t, v) { var a = t.msgs.length; c.ejecutaNotaClaude(t, v); return t.msgs.length > a ? ult(t).t : null; }

/* 1 el caso real: lo que contestó la IA ese día (accion nada + pregunta) ya no tira lo dicho */
IA.resp = { accion: "nada", respuesta: "No entendí bien: ¿quieres agendar la reunión para una fecha específica, o quieres que te recuerde una vez al mes?" };
var T1 = CONSEJO(); T1.autorizada = true; c.abierta = T1.id; var r1 = nota(T1, DICTADO);
eq("CONSEJO (respuesta vieja de la IA): aplica indefinida y ritmo aunque la IA dijo 'nada'", [T1.indefinida, T1.ritmo], [true, "Una vez al mes"]);
si("contesta 'Anoté: …' y ya no 'No cambié nada'", /^Anoté: indefinida, ritmo: una vez al mes(, contexto nuevo)?\./.test(r1) && !/No cambié nada/.test(r1));
si("la respuesta es nota privada de Claude", ult(T1).nota_claude === 1 && ult(T1).canal === "priv:salvador");
si("el prompt ya ofrece contexto, ritmo, indefinida, recurrente, fecha y pregunta", /\\"contexto\\":null,\\"contexto_modo\\":\\"sumar\|reemplazar\\",\\"ritmo\\":null,\\"indefinida\\":false,\\"recurrente\\":null,\\"fecha\\":null,(\\"checklist\\":null,)?(\\"responsable\\":null,\\"yo_superviso\\":false,\\"seguimiento_a\\":null,\\"compartir_con\\":\[\],)?\\"pregunta\\":null/.test(html));

/* 2 el caso real con la IA nueva: contexto reemplazado + ritmo + indefinida */
IA.resp = { accion: "contexto", contexto: "Tarea maestra de proyectos de la colonia Cumbres: Salvador presidente, Mario Castillo secretario, Adolfo Rodríguez tesorero, Enrique Martínez vocal; se reúnen dos veces al año.", contexto_modo: "reemplazar", ritmo: "una vez al mes", indefinida: true, respuesta: "Es la tarea maestra del consejo." };
var T2 = CONSEJO(); T2.autorizada = true; T2.contexto = "viejo"; var r2 = nota(T2, DICTADO);
eq("CONSEJO (IA nueva): indefinida, ritmo y contexto nuevo", [T2.indefinida, T2.ritmo, /^Tarea maestra/.test(T2.contexto)], [true, "Una vez al mes", true]);
eq("respuesta", r2, "Anoté: indefinida, ritmo: una vez al mes, contexto nuevo.");

/* 3 sumar contexto */
IA.resp = { accion: "contexto", contexto: "Luis Mario también participa.", contexto_modo: "sumar", respuesta: "Agregué a Luis Mario." };
var T3 = CONSEJO(); T3.autorizada = true; T3.contexto = "Consejo de la colonia."; var r3 = nota(T3, "Claude, agrégale que Luis Mario también participa");
eq("sumar contexto: se agrega al final", T3.contexto, "Consejo de la colonia. Luis Mario también participa.");
eq("respuesta sumar", r3, "Anoté: contexto.");

/* 4 recurrente: solo si lo dice */
IA.resp = { accion: "nada", recurrente: "mensual", respuesta: "Se repite cada mes." };
var T4 = CONSEJO(); T4.autorizada = true; nota(T4, "Claude, esta tarea es recurrente, se repite cada mes");
eq("recurrente cada mes", [T4.tipo, T4.periodicidad], ["recurrente", "mensual"]);
IA.resp = { accion: "nada", recurrente: "mensual", respuesta: "x" };
var T4b = CONSEJO(); T4b.autorizada = true; nota(T4b, "Claude, el contexto es la junta del consejo");
eq("recurrente inventado por la IA no se aplica", [T4b.tipo, T4b.periodicidad], ["unica", undefined]);

/* 5 fecha dictada junto con otra cosa + candado */
IA.resp = { accion: "contexto", contexto: "Junta con el consejo para revisar vigilancia.", contexto_modo: "sumar", fecha: "2026-10-09", respuesta: "ok" };
var T5 = CONSEJO(); T5.autorizada = true; var r5 = nota(T5, "Claude, es la junta con el consejo para revisar vigilancia, que sea el viernes 9 de octubre");
eq("fecha dictada además del contexto", [T5.f_vigente, T5.fecha_dictada], ["2026-10-09", true]);
si("respuesta lista contexto y fecha", /^Anoté: contexto, fecha: .*9.*\.$/.test(r5));
IA.resp = { accion: "contexto", contexto: "Junta.", fecha: "2026-10-15", respuesta: "ok" };
var T5b = CONSEJO(); T5b.autorizada = true; nota(T5b, "Claude, es la junta del consejo, sin fecha dicha");
eq("fecha que no dictó: no se mueve", T5b.f_vigente, "2026-09-27");

/* 6 ambiguo: pregunta SOLO eso y aplica lo demás */
IA.resp = { accion: "nada", ritmo: "cada semana", pregunta: "¿Con quién la agendo, con Mario o con Adolfo?", respuesta: "Revisar cada semana." };
var T6 = CONSEJO(); T6.autorizada = true; var r6 = nota(T6, "Claude, revísala cada semana y agéndala con uno de ellos");
eq("ambiguo: aplica el ritmo y pregunta solo lo dudoso", [T6.ritmo, r6], ["Cada semana", "Anoté: ritmo: cada semana. ¿Con quién la agendo, con Mario o con Adolfo?"]);

/* 7 sin IA (sin red): lo local se aplica igual */
IA.err = "sin red"; var T7 = CONSEJO(); T7.autorizada = true; var r7 = nota(T7, DICTADO); IA.err = null;
eq("sin red: indefinida + ritmo y 'Anoté'", [T7.indefinida, T7.ritmo, /^Anoté: indefinida, ritmo: una vez al mes(, contexto nuevo)?\.$/.test(r7)], [true, "Una vez al mes", true]);

/* 8 lo de antes sigue */
IA.resp = { accion: "nada", respuesta: "No sé qué quieres." };
var T8 = CONSEJO(); T8.autorizada = true; eq("nada de nada: sigue diciendo que no cambió nada", nota(T8, "Claude, hmm"), "Entendí: No sé qué quieres. No cambié nada en la tarea.");
IA.resp = { accion: "renombrar", valor: "Consejo Cumbres", ritmo: "una vez al mes", respuesta: "Le cambié el nombre." };
var T9 = CONSEJO(); T9.autorizada = true; var r9 = nota(T9, "Claude, ponle Consejo Cumbres y recuérdamela una vez al mes");
eq("renombrar + ritmo juntos", [T9.nombre, T9.ritmo], ["Consejo Cumbres", "Una vez al mes"]);
si("respuesta junta las dos", /^Anoté: ritmo: una vez al mes\. Cambié el nombre/.test(r9));

/* 9 en Falta info: si con eso queda completa, se autoriza */
IA.resp = { accion: "contexto", contexto: "Tarea maestra de proyectos de la colonia Cumbres con el consejo: presidente, secretario, tesorero y vocal; reuniones dos veces al año.", contexto_modo: "reemplazar", ritmo: "una vez al mes", indefinida: true, respuesta: "ok" };
sellos.length = 0; var T10 = CONSEJO(); c.abierta = T10.id; nota(T10, DICTADO);
eq("en Falta info y completa con la nota: lista para Autorizar (build 209: no sola)", [!!T10.autorizada, T10.en_revision, sellos], [false, true, []]);
si("VERSION_APP build 206 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 206);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
