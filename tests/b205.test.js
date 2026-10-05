#!/usr/bin/env node
/* PRUEBAS build 205 (Salvador 2026-10-04 21:14, "Agendar Reunión Consejo Colonia Cumbres"): lo dictado dentro de una tarea
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
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "eventoPendiente", "faltaVieja", "tipoRevisar", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "okDeRevision", "palomeaEnOrden", "autorizaRevision", "fichaRevision", "abiertasParaVincular", "estadoParaClaude", "promptRevision", "aplicaRevisionClaude", "tituloTarea", "traeFecha", "transfiere", "posibleDup"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "PALOMEO_MS", "TITULO_CONECTORES", "RITMO_RE", "CITA_RE", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
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
  setTimeout: function (f) { f(); }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, estadoReal: function (t) { return t.estado || "abierta"; } };
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

/* 1 la causa */
si("CAUSA: el dictado real cae en esNotaClaude (\"para que sepas\")", c.esNotaClaude(DICTADO));
var iF = html.indexOf('if(tipoRevisar(t)==="falta" && !ordenClaraClaude(v)'), iN = html.indexOf('if(typeof esNotaClaude==="function" && esNotaClaude(v)){ $("txt").value=""; marcaEnvio("tenv",""); notaClaude(t, v); return; }');
si("CORRECCIÓN: en Falta info, completar va ANTES que la nota a Claude", iF > 0 && iN > 0 && iF < iN);
si("\"Esto es una tarea en contexto…\" (largo) también completa y fija el tipo; \"es tarea\" solo sigue su camino corto", /!\(tipoDicho\(v\) && _corto205\)/.test(html) && /var _tp205=tipoDicho\(v\); if\(_tp205\)\{ t\.tipo_item=_tp205;/.test(html));
eq("solo órdenes claras siguen yendo a Claude", [c.ordenClaraClaude(DICTADO), c.ordenClaraClaude("Claude, elimínala"), c.ordenClaraClaude("pásasela a Cynthia"), c.ordenClaraClaude("Claude: es indefinida y la reviso cada mes")], [false, true, true, false]);
eq("se quita el 'Claude,' del principio", c.sinPrefijoClaude("Claude, es indefinida"), "es indefinida");

/* 2 al instante, sin IA */
eq("ritmo: el que va con 'ritmo/recordar' (una vez al mes), no 'dos veces al año' de las juntas", c.ritmoDicho(DICTADO), "una vez al mes");
eq("ritmo: uno solo", c.ritmoDicho("revísala cada semana"), "cada semana");
eq("ritmo: varios sin pista = ninguno (que lo diga la IA)", c.ritmoDicho("nos vemos dos veces al año y comemos una vez al mes"), "");
var T1 = CONSEJO(); var h1 = c.extraeLocal(T1, DICTADO);
eq("extracción local: indefinida, ritmo y contexto", [T1.indefinida, T1.ritmo, h1], [true, "Una vez al mes", ["indefinida", "ritmo: una vez al mes", "contexto"]]);
si("el contexto queda con lo dictado (≥ la rayita)", c.contextoPct(T1) >= 75 && /Mario Castillo que es el secretario/.test(c.contextoDe(T1)));
eq("con eso ya está completa (contexto ✓, quién ✓, finiquito: indefinida ✓, seguimiento: ritmo ✓)", c.completitud(T1).completa, true);
var T2 = { id: "tX", nombre: "Pagar predial", duenio: "salvador", creada_por: "claude", estado: "abierta", msgs: [] };
c.extraeLocal(T2, "el predial de Apeninos hay que pagarlo antes del 30 de octubre en el banco");
eq("fecha dictada: entra al instante como dictada", [T2.f_vigente, T2.fecha_dictada], ["2026-10-30", true]);

/* 3 el flujo completo */
IA.resp = { contexto: "Tarea maestra de proyectos de la colonia Cumbres (Salvador presidente; Mario Castillo secretario; Adolfo Rodríguez tesorero; Enrique Martínez vocal). Se reúnen dos veces al año.", indefinida: true, ritmo: "una vez al mes", palabras: ["cumbres", "consejo"] };
sellos.length = 0; var T3 = CONSEJO(); c.abierta = T3.id; c.completaRevision(T3, DICTADO);
eq("dictado completo: queda lista para Autorizar, sin autorizarse sola (build 209)", [!!T3.autorizada, T3.en_revision, sellos, c.tipoRevisar(T3)], [false, true, [], "falta"]);
si("lo dictado queda en el chat como tuyo (no como nota a Claude)", T3.msgs.some(function (m) { return m.k === "bo" && m.completa_info === 1 && !m.nota_claude; }));
si("y la IA afinó el contexto", /Tarea maestra de proyectos/.test(T3.contexto));
IA.resp = { contexto: "Revisar la barda del terreno" }; var T4 = { id: "tB", nombre: "Barda terreno", duenio: "salvador", creada_por: "claude", estado: "abierta", msgs: [] };
c.completaRevision(T4, "es la barda del terreno baldío de la esquina que nos pidió el consejo revisar con Manuel Parra");
eq("dictado parcial: dice qué anotó y 'Solo me falta: …'", T4.msgs.slice(-1)[0].t, "Anoté: contexto. Solo me falta: la fecha de finiquito (o si es indefinida), el próximo seguimiento.");
IA.err = "sin red"; var T5 = CONSEJO(); sellos.length = 0; c.abierta = T5.id; c.completaRevision(T5, DICTADO); IA.err = null;
eq("sin IA (sin red) igual se completa con lo sacado al instante", [T5.indefinida, T5.ritmo, !!T5.autorizada, T5.en_revision], [true, "Una vez al mes", false, true]);
si("la IA ahora también trae 'ritmo'", /\\"ritmo\\":null/.test(saca("function", "completaRevision")) || /"ritmo":null/.test(IA.prompt));

/* 4 la tarjeta en vivo */
var T6 = { id: "tC", nombre: "Barda terreno", duenio: "salvador", creada_por: "claude", estado: "abierta", contexto: "Barda del terreno baldío de la esquina que nos pidió el consejo revisar con Manuel Parra y el ingeniero de obra", msgs: [] };
var v6 = c.vFaltaInfo(T6);
si("arriba: 'Solo me falta: …'", /<div class="solofalta"><b>Solo me falta:<\/b> la fecha de finiquito \(o si es indefinida\) · el próximo seguimiento<\/div>/.test(v6));
si("el contexto ya completo se pone tenue y plegado", /class="fic ctx hecho"><span class="ok">✓ Contexto<\/span>/.test(v6));
si("lo que ya está va tenue en un renglón; lo que falta, cada uno", /<li class="pend">○ Finiquito: ¿fecha o indefinida\?<\/li>/.test(v6) && /<li class="ok tenue">✓ Quién: tú<\/li>/.test(v6));
si("VERSION_APP build 205 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 205);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
