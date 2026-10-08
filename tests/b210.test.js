#!/usr/bin/env node
/* PRUEBAS build 210 (arnés de 205): audífonos, escucha continua, todo a Claude, respuesta hablada. Caso real "Fiesta Navideña" (tmuuqah2egllq0, leída con el conector 2026-10-05) (Salvador 2026-10-04 21:14, "Agendar Reunión Consejo Colonia Cumbres"): lo dictado dentro de una tarea
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
var FUNCS = F_FUNCS.concat([ "_bpega", "viva249", "personasPara250", "resuelveDestino", "buscaContactos249", "contactosApp249", "nombreWA251", "nombresExactosWA251", "sinResultado251", "ordenesImposibles251", "ordenCondicional250", "ejecutaCond250", "resuelveCond250", "eventoDicho250", "venceCond250", "_diaAntes250", "mostrarAcomoda249", "ocultaAcomoda249", "liberaAcomoda249", "preguntas249", "abrePreguntas249", "esPersonaQ249", "palTema248", "temaComun248", "esCerradaReciente248", "nombreVinc248", "preguntaQuienYaResuelta248", "aplicaLecturaFechas248", "lecturaFechas248", "_hitsFecha248", "cierraDeEvento248", "pasosSeguimiento248", "armaMensajesSeguimiento248", "reintentaDudas248", "checklistTexto", "aplicaChecklistClaude", "aplicaResponsable", "esMetas", "necesitaAprobacion", "ejecutorNombre", "vistaSup", "porAprobar", "aplicaAvisoInmediato", "importanciaDe", "ejecutorMeta", "respuestasEjecutor", "textoEmpuje", "empujaEjecutor", "evidenciaMeta", "fechaPropuesta", "escalaMeta", "decideMeta", "vDecisionMeta", "miembroDeNombre", "metasDe", "metaCumplida", "metaCorta", "tareaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "metaNueva", "_raizMeta", "metaParecidaCumplida", "cumpleMeta", "fotoMeta", "programaSegMeta", "aplicaMetasClaude", "chequeoMetas", "vMetas", "hhmmAhora", "nombreCorto", "_tokPer", "nombresEnTexto", "_compartirLista", "candidatosPersona", "resuelvePersona", "nuevaDudaPersona", "asignaResponsable", "agregaCompartir", "fechasDeCada", "programaSeguimiento", "resuelveDudaPersona", "_n179", "nombreInt", "agregaIntegrante", "aplicaSeguimientoA", "_dichoNombre", "nombreCorto", "tieneChecklist", "chkNuevo", "chkPon", "_nv", "checklistDicho", "respChecklist", "_chkTok", "chkBusca", "hhmmAhora", "esConfirmacion", "juntaY", "tienePasos", "esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "fechaMty238", "horaMty238", "duenoDicho238", "fechaOrden238", "candidatasVinc238", "nombreTarea238", "corto238", "mandaOrden238", "ejecutaOrdenes238", "dioFecha238", "vHecho238", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "eventoPendiente", "faltaVieja", "tipoRevisar", "tipoRevisar0", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "okDeRevision", "palomeaEnOrden", "autorizaRevision", "fichaRevision", "srLog", "leeEscucha", "leePregunta", "leeComando", "mensajeDicho", "leeContactoWA", "leeSuenaMensaje", "leeAClaude", "leeDiceAnote", "leeAutoriza", "leeAgenda", "_nv", "limpiaHabla", "juntaY", "leeOtraVez", "asuntoRecordatorio", "avisoMismoDia", "nuevoAviso", "sonaraWhatsApp", "sinHoraEnTitulo", "_nn", "abiertasParaVincular", "estadoParaClaude", "promptRevision", "aplicaRevisionClaude", "contradice259", "preguntaContradice259", "historiaTarea259", "renombreExplicito259", "cierreExplicito259", "stems259", "tituloTarea", "traeFecha", "transfiere", "posibleDup"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["MODO_CEREBRO", "TIPOS_ORDEN251", "ESTADO_COND250", "EMPRESAS248", "SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "LEE", "LEE_SILENCIO", "PALOMEO_MS", "TITULO_CONECTORES", "RITMO_RE", "CITA_RE", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE", "MSJ_RE", "MSJ_CORTE"]);
var codigo = bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var RealDate = Date, NOW = new RealDate(2026, 9, 4, 21, 14, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
  return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var RELOJ = { t: 0, q: [], n: 0 }, HABLA = [], NAV = [], SRS = [], LS = {};
var IA = { resp: null, err: null, llamadas: 0 }, renders = 0, sellos = [];
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, Intl: Intl, isNaN: isNaN, parseInt: parseInt,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, josue: { nombre: "Josué" } }, tareas: [], window: {}, vista: "hilo", abierta: null,
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }, ico: function () { return ""; },
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx }); }, guarda: function () {}, render: function () { renders++; },
  preguntaAClaude: function (m, mod, cb) { IA.llamadas++; IA.prompt = m[0].content; cb(IA.err ? null : JSON.stringify(IA.resp || {}), IA.err); },
  selloYSigue: function (t, o) { sellos.push(o.tipo); }, sincronizaAvisos: function () {}, cierraHecha: function () {}, completaPendiente: function () {}, nuevoAviso: function () {},
  setTimeout: function (f, ms) { var h = { f: f, at: RELOJ.t + (ms || 0), id: ++RELOJ.n }; RELOJ.q.push(h); return h; }, clearTimeout: function (h) { if (h) h.muerto = true; }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, estadoReal: function (t) { return t.estado || "abierta"; } };
function FakeSR() { this.parado = false; this.abortado = false; SRS.push(this); }
FakeSR.prototype.start = function () { this.vivo = true; };
FakeSR.prototype.stop = function () { var me = this; me.parado = true; if (me.vivo) { me.vivo = false; c.setTimeout(function () { me.onend && me.onend(); }, 50); } };
FakeSR.prototype.abort = function () { this.abortado = true; this.stop(); };
FakeSR.prototype.di = function (tx, final) { var r = [{ transcript: tx }]; r.isFinal = !!final; this.onresult({ resultIndex: 0, results: [r] }); };
FakeSR.prototype.cae = function () { this.vivo = false; this.onend && this.onend(); };   /* el motor se cae solo */
c.window = { webkitSpeechRecognition: FakeSR };
c.localStorage = { getItem: function (k) { return LS[k] == null ? null : LS[k]; }, setItem: function (k, v) { LS[k] = String(v); } };
c.leeDi = function (tx, done) { HABLA.push(tx); if (done) done(); };
c.leeBarra = function () {}; c.leeAseguraHilo = function () {}; c.leePara = function () { NAV.push("para"); };
c.leeSiguienteTarea = function () { NAV.push("siguiente"); }; c.leeManda = function (t, v) { NAV.push("manda:" + v); }; c.leeDuda = function (t, v) { NAV.push("duda:" + v); };
c.leeResumenIA = function () {}; c.leeTarea = function () {}; c.leeActual = function () {}; c.leeNuevo = function () {}; c.leeHecha = function () { NAV.push("hecha"); }; c.leePideMotivo = function () { NAV.push("motivo"); };
c.agendaEvento = function (t, hr, td) { t.agendado = true; t.agenda_hora = hr; t.agenda_todo_dia = !!td; NAV.push("agenda:" + (td ? "todo" : hr)); }; c.noAgendar = function (t) { t.agendar = false; };
c.CONTACTOS = []; c.contactosWA = function () { return c.CONTACTOS; };
vm.createContext(c); vm.runInContext(codigo, c);
c.Date.now = function () { return NOW + RELOJ.t; };
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
/* forma real de CONSEJO_CUMBRES_REUNION_20260927 (leída con el conector 2026-10-04 21:1x), antes del dictado */
function CONSEJO() { return { id: "CONSEJO_CUMBRES_REUNION_20260927", nombre: "Agendar Reunión Consejo Colonia Cumbres", creada_por: "claude", duenio: "salvador", tipo: "unica", estado: "abierta",
  f_original: "2026-09-27", f_vigente: "2026-09-27",
  tarea: "Agendar reunión del Consejo de la Colonia Cumbres con Enrique Martínez, Adolfo Rodríguez, Mario Castillo y Salvador — de preferencia jueves a cenar o viernes a comer",
  msgs: [{ aviso: 1, h: "14:53", k: "bal", t: "¿Para cuándo agendas la reunión con el Consejo Colonia Cumbres? Lleva 7 días vencida.", ts: NOW - 6 * 3600000 }] }; }
var DICTADO = "Esto es una tarea en contexto de donde meto todo lo que quiero hacer de proyectos en la colonia Cumbres donde yo estuve el presidente está Mario Castillo que es el secretario Adolfo Rodríguez que es el tesorero Enrique Martínez que es el vocal y Luis Mario no escucha que mi hermano y ahí nos ayuda a participar en el concepto no dormimos normalmente dos veces al año Y sacamos conclusiones de qué queremos hacer de nuevos proyectos como van las finanzas etc. entonces los casos importantes de proyectos grandes de finanzas aquí los meto cuando hay algo relevante es para que sepas el contexto Esta tarea es indefinida y cuyo propio es que merece un ritmo de una vez al mes estarme recordando este aquí para ver si vamos avanzando si no vamos avanzando ni pendiente el macro por lo pronto macro aquí tengo ahorita pues no no esté en mi proyecto de Navidad que es la decoración navideña cada año el proyecto de ponerle barda a todos los terrenos baldíos El proyecto de poner unas cámaras de seguridad el proyecto de ponerle jardinería alrededor de las plazas este para que queden muy bien el proyecto de reforestar unos árboles que se secaron";

function avanza(ms) { var hasta = RELOJ.t + ms; for (;;) { RELOJ.q.sort(function (a, b) { return a.at - b.at || a.id - b.id; }); var h = RELOJ.q[0];
  if (!h || h.at > hasta) break; RELOJ.q.shift(); RELOJ.t = h.at; if (!h.muerto) h.f(); } RELOJ.t = hasta; }
var ult = function (t) { return t.msgs.slice(-1)[0]; };
var SR = function () { return SRS[SRS.length - 1]; };
/* forma real de "Fiesta Navideña" ANTES de lo dictado a las 07:38 (leída con el conector) */
function FIESTA() { return { id: "tmuuqah2egllq0", nombre: "Fiesta Navideña", creada_por: "salvador", duenio: "salvador", tipo: "unica", tipo_item: "tarea", estado: "abierta",
  f_original: "2026-10-04", f_vigente: "2026-10-04", falta_fecha: true, contexto: "", ritmo: "", avisos: [], creada: NOW - 3600000,
  msgs: [{ k: "bi", t: "La abriste dictando: “Fiesta navideña”.", ts: NOW - 3600000 }, { k: "bal", aviso: 1, t: "Ya venció “Fiesta Navideña”. ¿Por qué no la terminaste, y para cuándo la acabas?", ts: NOW - 60000 }] }; }
/* lo que dijo completo (Salvador: "la fecha era el 15 de diciembre y no estaba vencida"); lo que llegó a las 07:38 iba cortado */
var P1 = "Esto es para Claude, para que pongas el contexto", P2 = "la fecha es el 15 de diciembre, no está vencida", P3 = "y me des seguimiento, recuérdame el martes y el jueves";

/* 1 ESCUCHA CONTINUA: no corta en pausas cortas; si el motor se cae, se reabre sin perder nada */
c.LEE.charla = true; var OIDO = null; c.leeEscucha(function (v) { OIDO = v; });
var s1 = SR(); eq("motor: continuo con texto parcial, en es-MX", [s1.continuous, s1.interimResults, s1.lang], [true, true, "es-MX"]);
s1.di(P1, true); avanza(2500);
eq("pausa de 2.5 s: sigue escuchando", [OIDO, s1.parado], [null, false]);
s1.di(P2, false); s1.cae();   /* iOS lo cierra solo a media frase */
avanza(300); var s2 = SR();
eq("el motor se cayó: se reabre solo (otra sesión) sin cerrar lo dictado", [SRS.length, OIDO], [2, null]);
s2.di(P3, true); avanza(3000); eq("3 s de silencio: todavía no cierra", OIDO, null);
avanza(1500);
eq("~3.5 s de silencio: cierra con TODO lo dictado (lo de antes de caerse incluido)", OIDO, P1 + " " + P2 + " " + P3);
var LOG = JSON.parse(LS.doit_sr_log || "[]");
eq("queda registrado cuánto duró cada sesión del motor y quién cerró (para medir el límite del iPhone)", [LOG.filter(function (x) { return x.cerro === "motor"; }).length, LOG.filter(function (x) { return x.cerro === "nosotros"; }).length, LOG.slice(-1)[0].reinicios, LOG.slice(-1)[0].motivo], [1, 1, 1, "silencio"]);
OIDO = null; c.leeEscucha(function (v) { OIDO = v; }); avanza(8100); avanza(1000);
si("si no dice nada en 8 s: 'Toca para hablar' (no manda vacío)", OIDO === null && c.LEE.espera === true);

/* 2 CASO REAL: todo lo dictado va a Claude, se aplica y la voz dice qué anotó */
IA.resp = { contexto: "Fiesta navideña de Salvador el 15 de diciembre; falta definir los detalles de la fecha y darle seguimiento con avisos el martes y el jueves para dejarla lista.",
  fecha: "2026-12-15", recordar: [{ fecha: "2026-10-06" }, { fecha: "2026-10-08" }] };
var T = FIESTA(); c.tareas = [T]; c.LEE.t = T; c.LEE.charla = true; HABLA.length = 0; NAV.length = 0; c.abierta = T.id;
eq("antes: está en Falta info (fecha que puso el sistema, 'vencida')", c.tipoRevisar(T), "falta");
c.leeComando(P1 + " " + P2 + " " + P3); avanza(5000);
eq("NO pregunta '¿lo mando?': fue directo a Claude", [IA.llamadas > 0, HABLA.some(function (h) { return /lo mando|lo envío/i.test(h); }), NAV.filter(function (x) { return /^manda/.test(x); }).length], [true, false, 0]);
eq("fecha 15 de diciembre (dictada) y ya no 'falta fecha'", [T.f_vigente, T.fecha_dictada, T.falta_fecha], ["2026-12-15", true, false]);
eq("avisos martes y jueves, con el nombre de la tarea", T.avisos.map(function (a) { return a.fecha + " " + a.texto; }), ["2026-10-06 Fiesta Navideña", "2026-10-08 Fiesta Navideña"]);
si("lo dictado queda como nota para completar (no como mensaje para mandar)", T.msgs.some(function (m) { return m.k === "bo" && m.completa_info === 1; }));
var dicho = HABLA.slice(-1)[0];
si("la voz dice corto qué anotó: contexto, fecha y avisos martes y jueves", /^Anoté contexto, fecha .*15 de diciembre y avisos martes 6 de octubre y jueves 8 de octubre\./.test(dicho));
si("…y lo único que falta: si se agenda (es una fiesta con fecha)", /Solo falta si te lo agendo\.$/.test(dicho));
eq("se queda escuchando la siguiente orden", [SR().vivo, c.LEE.oye], [true, true]);
SR().di("agéndalo", true); avanza(4500);
eq("'agéndalo' sin hora: pregunta la hora", HABLA.slice(-1)[0], "¿A qué hora lo agendo, o todo el día?");
avanza(300); SR().di("todo el día", true); avanza(4500);
si("'todo el día': agendado y ya está completa", T.agendado === true && /^Anoté agendado todo el día\. Ya está completa\. Di autorízala, o siguiente\.$/.test(HABLA.slice(-1)[0]));
avanza(300); SR().di("autorízala", true); avanza(4500);
eq("'autorízala': autorizada, sale de Falta info y pasa a la siguiente", [T.autorizada, c.tipoRevisar(T) !== "falta", HABLA.slice(-1)[0], NAV.slice(-1)[0]], [true, true, "Autorizada.", "siguiente"]);

/* 3 parcial: dice lo que falta */
IA.resp = { contexto: "Fiesta navideña de Salvador; hay que definir todo lo de la fecha con la familia y los invitados, y darle seguimiento hasta tenerla lista.", recordar: [] };
var T3 = FIESTA(); c.tareas = [T3]; c.LEE.t = T3; c.abierta = T3.id; HABLA.length = 0;
c.leeComando("pon el contexto: es la fiesta navideña, hay que definir todo lo de la fecha con la familia y los invitados"); avanza(5000);
si("parcial: 'Anoté contexto. Solo falta …'", /^Anoté contexto\. Solo falta la fecha de finiquito \(o si es indefinida\) y el próximo seguimiento\.$/.test(HABLA.slice(-1)[0]));
avanza(300); SR().di("autorízala", true); avanza(4500);
si("'autorízala' incompleta: no la autoriza y dice qué falta", !T3.autorizada && /^Todavía no la puedo autorizar: falta /.test(HABLA.slice(-1)[0]));
avanza(300); SR().di("siguiente", true); avanza(4500); eq("'siguiente' pasa a la siguiente", NAV.slice(-1)[0], "siguiente");

/* 4 contacto de WhatsApp: solo si suena a mensaje para esa persona pregunta a quién va */
IA.resp = { contexto: "x" }; var T4 = FIESTA(); T4.autorizada = true; T4.f_vigente = "2026-12-15"; T4.fecha_dictada = true; T4.falta_fecha = false; T4.ritmo = "Cada semana"; T4.contexto = "Fiesta navideña de Salvador con la familia el quince de diciembre en su casa con todos los invitados de siempre y la cena";
c.tareas = [T4]; c.LEE.t = T4; c.CONTACTOS = [{ nombre: "Rogelio Sada" }]; HABLA.length = 0; NAV.length = 0; var ll = IA.llamadas;
c.leeComando("dile que la fiesta es el 15 de diciembre");
eq("suena a mensaje y hay contacto: '¿Es para Claude o se lo mando a Rogelio Sada?'", [HABLA.slice(-1)[0], IA.llamadas - ll], ["¿Es para Claude o se lo mando a Rogelio Sada?", 0]);
avanza(300); SR().di("mándaselo", true); avanza(4500); eq("'mándaselo' -> se manda por WhatsApp", NAV.slice(-1)[0], "manda:dile que la fiesta es el 15 de diciembre");
c.leeComando("dile que la fiesta es el 15 de diciembre"); avanza(300); SR().di("es para Claude", true); avanza(4500);
eq("'es para Claude' -> va a Claude", IA.llamadas - ll, 1);
HABLA.length = 0; c.leeComando("el ritmo es cada semana y ya no la muevas"); avanza(5000);
si("con contacto pero no suena a mensaje: directo a Claude, sin preguntar", !HABLA.some(function (h) { return /se lo mando/.test(h); }) && IA.llamadas - ll === 2);
eq("tarea ya autorizada: no regresa a Falta info y la voz cierra con '¿Algo más, o siguiente?'", [T4.en_revision, /¿Algo más, o siguiente\?$/.test(HABLA.slice(-1)[0])], [undefined, true]);
c.CONTACTOS = []; var T5 = FIESTA(); c.tareas = [T5]; c.LEE.t = T5; HABLA.length = 0; ll = IA.llamadas; IA.resp = { contexto: "y" };
c.leeComando("dile a Josué que compre las luces"); avanza(5000);
si("sin contacto de WhatsApp: nunca pregunta, va a Claude", !HABLA.some(function (h) { return /se lo mando|lo mando/.test(h); }) && IA.llamadas - ll === 1);

/* 5 el aviso basura "Este el y el" */
eq("'Este recuérdame el martes y el jueves' -> texto del aviso = nombre de la tarea", c.asuntoRecordatorio("Este recuérdame el martes y el jueves", { nombre: "Fiesta Navideña" }), "Fiesta Navideña");
eq("con asunto útil se queda el asunto", c.asuntoRecordatorio("recuérdame pagar el predial el martes", { nombre: "X" }), "pagar el predial");
var T6 = FIESTA(); c.nuevoAviso(T6, { texto: "Fiesta Navideña", fecha: "2026-10-06", dicho: "x" });
eq("aviso del mismo día ya existe: se reusa (no se duplica)", [!!c.avisoMismoDia(T6, "2026-10-06"), c.avisoMismoDia(T6, "2026-10-08")], [true, null]);
si("el 'recuérdame el martes y el jueves' del chat reusa el del mismo día", /var _ya=avisoMismoDia\(t, f\);/.test(html) && /!avisoMismoDia\(t, r\.fecha\)\)\{ nuevoAviso\(t,/.test(html));
si("VERSION_APP build 210 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 210);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
