#!/usr/bin/env node
/* PRUEBAS build 214 (arnés de 205/206): checklist de 3 estados. Caso real "Fiesta Cumpleaños Papá" (tIAMUUK9ZCWJW) (Salvador 2026-10-04 21:14, "Agendar Reunión Consejo Colonia Cumbres"): lo dictado dentro de una tarea
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
var FUNCS = F_FUNCS.concat([ "_bpega", "viva249", "personasPara250", "resuelveDestino", "buscaContactos249", "contactosApp249", "nombreWA251", "nombresExactosWA251", "sinResultado251", "ordenesImposibles251", "refuerzo251", "preguntaConcreta251", "ultimos10_251", "ordenCondicional250", "ejecutaCond250", "resuelveCond250", "eventoDicho250", "venceCond250", "_diaAntes250", "mostrarAcomoda249", "ocultaAcomoda249", "liberaAcomoda249", "preguntas249", "abrePreguntas249", "esPersonaQ249", "palTema248", "temaComun248", "esCerradaReciente248", "nombreVinc248", "preguntaQuienYaResuelta248", "aplicaLecturaFechas248", "lecturaFechas248", "_hitsFecha248", "cierraDeEvento248", "pasosSeguimiento248", "armaMensajesSeguimiento248", "reintentaDudas248", "esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "fechaMty238", "horaMty238", "duenoDicho238", "fechaOrden238", "candidatasVinc238", "nombreTarea238", "corto238", "mandaOrden238", "ejecutaOrdenes238", "dioFecha238", "vHecho238", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "eventoPendiente", "faltaVieja", "tipoRevisar", "tipoRevisar0", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "aplicaCamposNota", "tieneChecklist", "_chkTok", "chkBusca", "chkNuevo", "chkPon", "checklistDicho", "hhmmAhora", "respChecklist", "aplicaChecklistClaude", "aplicaResponsable", "esMetas", "necesitaAprobacion", "ejecutorNombre", "vistaSup", "porAprobar", "aplicaAvisoInmediato", "importanciaDe", "ejecutorMeta", "respuestasEjecutor", "textoEmpuje", "empujaEjecutor", "evidenciaMeta", "fechaPropuesta", "escalaMeta", "decideMeta", "vDecisionMeta", "miembroDeNombre", "metasDe", "metaCumplida", "metaCorta", "tareaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "metaNueva", "_raizMeta", "metaParecidaCumplida", "cumpleMeta", "fotoMeta", "programaSegMeta", "aplicaMetasClaude", "chequeoMetas", "vMetas", "hhmmAhora", "nombreCorto", "_tokPer", "nombresEnTexto", "_compartirLista", "candidatosPersona", "resuelvePersona", "nuevaDudaPersona", "asignaResponsable", "agregaCompartir", "fechasDeCada", "programaSeguimiento", "resuelveDudaPersona", "_n179", "nombreInt", "agregaIntegrante", "aplicaSeguimientoA", "_dichoNombre", "nombreCorto", "checklistTexto", "vChecklist", "esConfirmacion", "esImportante", "_nv", "juntaY", "tienePasos", "autorizaRevision", "juntaNota", "ejecutaNotaClaude", "aplicaNotaClaude", "respuestaHecho", "traeFecha", "fechaConDia", "calendarioProximo", "fechaBonita"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["MODO_CEREBRO", "TIPOS_ORDEN251", "ESTADO_COND250", "EMPRESAS248", "SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "RITMO_RE", "CITA_RE", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
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

/* la lista del papá, tal cual (mensaje 18:39) */
var LISTA = ["Pollo y Karina", "Pily y Brayan", "Lore y Javier", "Vecino y esposa", "Néstor y esposa", "Braña y Yudi", "Sada y Chío", "Arq y señora"];
function PAPA() { return { id: "tIAMUUK9ZCWJW", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", estado: "abierta", autorizada: true, tipo_item: "tarea", f_vigente: "2026-11-13", fecha_dictada: true, msgs: [] }; }
var C8 = "Clau créame un Check-list con las la lista de los que voy a invitar y en ese Check-list veme poniendo palomita a la derecha de los nombres de los que ya me confirmaron y doble bueno de los que ya les mandé invitación y doble palomita a los que ya me confirmaron para saber quién me falta";
/* 1 la petición real de las 8:07 cae en la lista (no en preguntas) */
var T = PAPA();
eq("8:07 'créame un Check-list…' sin lista: va a Claude a armarla", c.checklistDicho(T, C8), { crear: true });
IA.resp = { accion: "nada", checklist: { titulo: "Invitados", items: LISTA.map(function (x) { return { tx: x, estado: 0 }; }) }, respuesta: "Armé la lista." };
var r = nota(T, C8);
eq("Claude arma la lista con los renglones tal cual", T.checklist.items.map(function (x) { return x.tx + ":" + x.estado; }), LISTA.map(function (x) { return x + ":0"; }));
si("y lo dice", /^Anoté: lista “Invitados” \(8\)/.test(r));
si("el prompt pide checklist y prohíbe contestar con preguntas en vez de hacerla", /NUNCA contestes con preguntas en vez de hacer la lista/.test(IA.prompt) && /\\"checklist\\":null/.test(html));
/* 2 por voz / escrito */
c.chkNuevo(T, "Eduardo Madero (Lalo)", 0); T.checklist.items[6].alias = ["Rogelio Sada"]; T.checklist.items[8].alias = ["Lalo"];
var k1 = c.checklistDicho(T, "ya invité a Rogelio, a Javier y a Lalo");
eq("'ya invité a Rogelio, a Javier y a Lalo' -> ✓ (con alias)", [T.checklist.items[6].estado, T.checklist.items[2].estado, T.checklist.items[8].estado, k1.dudas], [1, 1, 1, []]);
var k2 = c.checklistDicho(T, "Xavier ya me confirmó y Néstor también confirmó");
eq("'Xavier ya me confirmó' -> ✓✓ (Xavier = Javier)", T.checklist.items[2].estado, 2);
var k3 = c.checklistDicho(T, "agrega a Rafa Garza a la lista");
eq("'agrega a Rafa Garza a la lista' -> renglón nuevo ○", [T.checklist.items.length, T.checklist.items[9].tx, T.checklist.items[9].estado], [10, "Rafa garza", 0]);
var k4 = c.checklistDicho(T, "ya invité a Memo");
si("nombre que no está: lo dice (no inventa)", /^No encontré a Memo en la lista/.test(k4.dudas[0]));
eq("respuesta corta con el conteo", c.respChecklist(T, k1), "Anoté en la lista: Sada y Chío ✓, Lore y Javier ✓, Eduardo Madero (Lalo) ✓. Van 3 de 10 invitados y 1 confirmados.");
si("sin lista ni verbos de lista: no se mete", c.checklistDicho(PAPA(), "la fiesta es en casa de mi papá") === null);
/* 3 la sección desplegable y el toque */
c.window.__chkOpen = { tIAMUUK9ZCWJW: true }; var h = c.vChecklist(T);
si("sección arriba, desplegable, con conteo ✓ y ✓✓", /<div class="pasos chkl open" id="chkl"><button class="ph" id="bchkl"/.test(h) && /✓ 3 · ✓✓ 1 de 10/.test(h));
si("cada renglón con su estado a la derecha y tocable", /<button class="cit e2" data-chk="[^"]+" aria-label="Lore y Javier: confirmado"><span class="ctx2">Lore y Javier<\/span><span class="cst">✓✓<\/span><\/button>/.test(h) && /<span class="ctx2">Pollo y Karina<\/span><span class="cst">○<\/span>/.test(h));
si("tocar: ○ -> ✓ -> ✓✓ -> ○", /it\.estado=\(\(it\.estado\|\|0\)\+1\)%3;/.test(html));
si("va arriba del chat, junto a Pasos", /(?:vPasos\(t\)|vVuelta\(t\))\+(vEntregas\(t\)|\(vistaSup\(t\)\?vEntregas\(t\)\+vSupSecciones\(t\):vChecklist\(t\)\)|vChecklist\(t\))\+bannerDecision\(t\)/.test(html));
si("en el chat, lo dicho de la lista va ANTES que todo (incluida Falta info)", html.indexOf("var _ck=checklistDicho(t, v);") > 0 && html.indexOf("var _ck=checklistDicho(t, v);") < html.indexOf('if(tipoRevisar(t)==="falta" && !ordenClaraClaude(v)'));
si("en audífonos también", /function leeAClaude\(t, v\)\{\n  var _ck=checklistDicho\(t, v\);/.test(html));
/* 4 Importante: las confirmaciones siempre se ven */
eq("'Sí, ahí estaremos' / 'Confirmo' son confirmación; 'Jajaja' no", [c.esConfirmacion({ t: "Sí, ahí estaremos" }), c.esConfirmacion({ t: "Confirmo, gracias!" }), c.esConfirmacion({ t: "Jajaja" })], [true, true, false]);
eq("una confirmación sale en Importante aunque esté marcada para ocultar", c.esImportante({ t: "Confirmo, ahí estaremos" }, 3, { set: { 3: 1 } }), true);
si("VERSION_APP build 214 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 214);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
