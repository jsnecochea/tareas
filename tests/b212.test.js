#!/usr/bin/env node
/* PRUEBAS build 212 (arnés de 205): Posible vinculación (botones invertidos, ✕ descarta) y rango de hora al agendar. Caso real "Fiesta Cumpleaños Papá" (tIAMUUK9ZCWJW) (Salvador 2026-10-04 21:14, "Agendar Reunión Consejo Colonia Cumbres"): lo dictado dentro de una tarea
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
var FUNCS = F_FUNCS.concat(["checklistTexto", "aplicaChecklistClaude", "aplicaResponsable", "esMetas", "necesitaAprobacion", "ejecutorNombre", "vistaSup", "porAprobar", "aplicaAvisoInmediato", "importanciaDe", "ejecutorMeta", "respuestasEjecutor", "textoEmpuje", "empujaEjecutor", "evidenciaMeta", "fechaPropuesta", "escalaMeta", "decideMeta", "vDecisionMeta", "miembroDeNombre", "metasDe", "metaCumplida", "metaCorta", "tareaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "metaNueva", "_raizMeta", "metaParecidaCumplida", "cumpleMeta", "fotoMeta", "programaSegMeta", "aplicaMetasClaude", "chequeoMetas", "vMetas", "hhmmAhora", "nombreCorto", "_tokPer", "nombresEnTexto", "_compartirLista", "candidatosPersona", "resuelvePersona", "nuevaDudaPersona", "asignaResponsable", "agregaCompartir", "fechasDeCada", "programaSeguimiento", "resuelveDudaPersona", "_n179", "nombreInt", "agregaIntegrante", "aplicaSeguimientoA", "_dichoNombre", "nombreCorto", "tieneChecklist", "chkNuevo", "chkPon", "_nv", "checklistDicho", "respChecklist", "_chkTok", "chkBusca", "hhmmAhora", "esConfirmacion", "juntaY", "tienePasos", "esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "propuestaAgenda", "fechaRespaldada", "evidenciaDe", "vClipEvid", "eventoPendiente", "faltaVieja", "tipoRevisar", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "okDeRevision", "palomeaEnOrden", "autorizaRevision", "fichaRevision", "rangoHora", "descartaVinculos", "agendaEvento", "urlGoogleCal", "_gcalUtc", "mtyAUtcMs", "horaBonita", "fmt24", "nuevoAviso", "abiertasParaVincular", "estadoParaClaude", "promptRevision", "aplicaRevisionClaude", "tituloTarea", "traeFecha", "transfiere", "posibleDup"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "AGENDA_HORA_TODO_DIA", "PALOMEO_MS", "TITULO_CONECTORES", "RITMO_RE", "CITA_RE", "MESES229", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
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
  localStorage: { getItem: function () { return null; } }, setTimeout: function (f) { f(); }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, estadoReal: function (t) { return t.estado || "abierta"; } };
vm.createContext(c); vm.runInContext(codigo, c);
c.clasif236 = function () { return true; };   /* build 236: estas pruebas son de la tarea YA clasificada (Tarea o Dato) */
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
/* forma real de CONSEJO_CUMBRES_REUNION_20260927 (leída con el conector 2026-10-04 21:1x), antes del dictado */
function CONSEJO() { return { id: "CONSEJO_CUMBRES_REUNION_20260927", nombre: "Agendar Reunión Consejo Colonia Cumbres", creada_por: "claude", duenio: "salvador", tipo: "unica", estado: "abierta",
  f_original: "2026-09-27", f_vigente: "2026-09-27",
  tarea: "Agendar reunión del Consejo de la Colonia Cumbres con Enrique Martínez, Adolfo Rodríguez, Mario Castillo y Salvador — de preferencia jueves a cenar o viernes a comer",
  msgs: [{ aviso: 1, h: "14:53", k: "bal", t: "¿Para cuándo agendas la reunión con el Consejo Colonia Cumbres? Lleva 7 días vencida.", ts: NOW - 6 * 3600000 }] }; }
var DICTADO = "Esto es una tarea en contexto de donde meto todo lo que quiero hacer de proyectos en la colonia Cumbres donde yo estuve el presidente está Mario Castillo que es el secretario Adolfo Rodríguez que es el tesorero Enrique Martínez que es el vocal y Luis Mario no escucha que mi hermano y ahí nos ayuda a participar en el concepto no dormimos normalmente dos veces al año Y sacamos conclusiones de qué queremos hacer de nuevos proyectos como van las finanzas etc. entonces los casos importantes de proyectos grandes de finanzas aquí los meto cuando hay algo relevante es para que sepas el contexto Esta tarea es indefinida y cuyo propio es que merece un ritmo de una vez al mes estarme recordando este aquí para ver si vamos avanzando si no vamos avanzando ni pendiente el macro por lo pronto macro aquí tengo ahorita pues no no esté en mi proyecto de Navidad que es la decoración navideña cada año el proyecto de ponerle barda a todos los terrenos baldíos El proyecto de poner unas cámaras de seguridad el proyecto de ponerle jardinería alrededor de las plazas este para que queden muy bien el proyecto de reforestar unos árboles que se secaron";

var CTX = "Salvador pide: \"Tu lista para q las mande tu o Karina por favor\" · Lista: 1.) pollo y Karina · 2.) PILY y Brayan · Invitación adjunta: Celebración Pre-Navideña entre amigos · Fecha: 13 de Noviembre · Hora: de 3:00 a 8:00 PM · Lugar: Calle Everest 164, Col Cumbres · Favor de confirmar asistencia antes del 3 de Noviembre · Anfitriones: Eloisa y Salvador";
function PAPA() { return { id: "tIAMUUK9ZCWJW", nombre: "Fiesta Cumpleaños Papá", creada_por: "ia_revisor", duenio: "salvador", tipo: "unica", tipo_item: "tarea", estado: "abierta", por_autorizar: true,
  creada: 1791163123520, contexto: CTX, f_vigente: "", posible_dup: ["tmuuqah2egllq0"], msgs: [] }; }
var FIESTA = { id: "tmuuqah2egllq0", nombre: "Fiesta Navideña Cumbres", duenio: "salvador", estado: "abierta", msgs: [] }, OTRA = { id: "tOTRA", nombre: "Posada Oficina", duenio: "salvador", estado: "abierta", msgs: [] };
c.tareas = [FIESTA, OTRA];
/* 1 rango de hora */
eq("'de 3:00 a 8:00 PM' -> 15:00 a 20:00", c.rangoHora("Hora: de 3:00 a 8:00 PM"), { ini: "15:00", fin: "20:00" });
eq("'de 10 am a 2 pm'", c.rangoHora("de 10 am a 2 pm"), { ini: "10:00", fin: "14:00" });
eq("'de 7:30 a 11 de la noche'", c.rangoHora("de 7:30 a 11 de la noche"), { ini: "19:30", fin: "23:00" });
eq("'de 11 a 1 pm' (cruza mediodía)", c.rangoHora("de 11:00 a 1:00 PM"), { ini: "11:00", fin: "13:00" });
eq("'de 3 a 5' sin hora clara: no adivina", c.rangoHora("de 3 a 5 personas"), null);
/* 2 caso real */
var T = PAPA(), ev = c.eventoDe(T);
eq("Fiesta Cumpleaños Papá: 13-nov, de 3:00 PM (inicio) a 8:00 PM", [ev.fecha, ev.hora, ev.hora_fin], ["2026-11-13", "15:00", "20:00"]);
si("'¿Te lo agendo?' dice 'de 3:00 PM a 8:00 PM'", /de 3:00 PM a 8:00 PM/i.test(c.vAgenda(T).replace(/&nbsp;| /g, " ")) || /de 3:00 p\.?\s?m\.? a 8:00 p\.?\s?m\.?/i.test(c.vAgenda(T)));
c.agendaEvento(T, "", false);
eq("al agendar: hora de inicio 15:00 y fin 20:00 (para la duración en Calendar)", [T.evento.hora, T.evento.hora_fin, T.avisos[0].hora], ["15:00", "20:00", "15:00"]);
var u = c.urlGoogleCal(T.evento, T);
si("Calendar: de 3 a 8 PM Monterrey (21:00 a 02:00 UTC)", /dates=20261113T210000Z\/20261114T020000Z/.test(u));
/* 3 tarjeta: botones invertidos y ✕ */
si("'Vincular' sin relleno (borde y texto morado)", /\.revc \.rvb\{background:transparent;border:1px solid #BF5AF2;[^}]*color:#D9B3FF/.test(html));
si("'Crear tarea nueva' con relleno morado", /\.revc \.rvn\{[^}]*background:#BF5AF2;border:0;color:#1C0B2B/.test(html));
si("✕ arriba a la derecha en la tarjeta del chat", /<div class="revc c-vincular"><button class="rvx" data-rvx="1" aria-label="Cerrar sugerencia">✕<\/button><span class="rct">POSIBLE VINCULACIÓN<\/span><span class="rcp">'\+\(_pd\.length===1/.test(html));
var T2 = PAPA(); T2.en_revision = true; var vf = c.vFaltaInfo(T2);
si("✕ también en la de Falta info (una sugerencia: Vincular sin relleno, misma clase)", /<div class="revc c-vincular"><button class="rvx" data-rvx="1" aria-label="Cerrar sugerencia">✕<\/button><span class="rct">POSIBLE VINCULACIÓN<\/span><span class="rcp">Propuesta de Claude; no la vinculé\.<\/span><div class="rvv"><span><b>Fiesta Navideña Cumbres<\/b><\/span><button class="rvb"/.test(vf));
si("la ✕ está conectada", /querySelectorAll\("\[data-rvx\]"\),function\(el\)\{ el\.onclick=function\(ev\)\{ ev\.stopPropagation\(\); descartaVinculos\(t\); render\(\); \}; \}\);/.test(html));
eq("✕: guarda las sugerencias como descartadas", c.descartaVinculos(T2), ["tmuuqah2egllq0"]);
eq("…y no vuelven a salir", [T2.vinculos_descartados, c.posibleDup(T2).length, /POSIBLE VINCULACIÓN/.test(c.vFaltaInfo(T2))], [["tmuuqah2egllq0"], 0, false]);
T2.posible_dup.push("tOTRA");
eq("si después sale OTRA tarea distinta, sí se muestra", c.posibleDup(T2).map(function (x) { return x.id; }), ["tOTRA"]);
var r = c.aplicaRevisionClaude(T2, "x", { vinculos: ["tmuuqah2egllq0", "tOTRA"] }, [FIESTA, OTRA]);
eq("Claude ya no vuelve a proponer la descartada", r.vinc, ["tOTRA"]);
si("VERSION_APP build 212 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 212);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
