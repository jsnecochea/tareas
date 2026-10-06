#!/usr/bin/env node
/* PRUEBAS build 207 (arnés de 205) (Salvador 2026-10-04 21:14, "Agendar Reunión Consejo Colonia Cumbres"): lo dictado dentro de una tarea
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
var FUNCS = F_FUNCS.concat(["checklistTexto", "aplicaChecklistClaude", "aplicaResponsable", "esMetas", "necesitaAprobacion", "ejecutorNombre", "vistaSup", "porAprobar", "aplicaAvisoInmediato", "importanciaDe", "ejecutorMeta", "respuestasEjecutor", "textoEmpuje", "empujaEjecutor", "evidenciaMeta", "fechaPropuesta", "escalaMeta", "decideMeta", "vDecisionMeta", "miembroDeNombre", "metasDe", "metaCumplida", "metaCorta", "tareaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "metaNueva", "_raizMeta", "metaParecidaCumplida", "cumpleMeta", "fotoMeta", "programaSegMeta", "aplicaMetasClaude", "chequeoMetas", "vMetas", "hhmmAhora", "nombreCorto", "_tokPer", "nombresEnTexto", "_compartirLista", "candidatosPersona", "resuelvePersona", "nuevaDudaPersona", "asignaResponsable", "agregaCompartir", "fechasDeCada", "programaSeguimiento", "resuelveDudaPersona", "_n179", "nombreInt", "agregaIntegrante", "aplicaSeguimientoA", "_dichoNombre", "nombreCorto", "tieneChecklist", "chkNuevo", "chkPon", "_nv", "checklistDicho", "respChecklist", "_chkTok", "chkBusca", "hhmmAhora", "esConfirmacion", "juntaY", "tienePasos", "esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "fechaMty238", "horaMty238", "duenoDicho238", "fechaOrden238", "candidatasVinc238", "nombreTarea238", "corto238", "mandaOrden238", "ejecutaOrdenes238", "dioFecha238", "vHecho238", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "propuestaAgenda", "fechaRespaldada", "evidenciaDe", "vClipEvid", "eventoPendiente", "faltaVieja", "tipoRevisar", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "okDeRevision", "palomeaEnOrden", "autorizaRevision", "fichaRevision", "abiertasParaVincular", "estadoParaClaude", "promptRevision", "aplicaRevisionClaude", "tituloTarea", "traeFecha", "transfiere", "posibleDup"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "PALOMEO_MS", "TITULO_CONECTORES", "RITMO_RE", "CITA_RE", "MESES229", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
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
  setTimeout: function (f) { f(); }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, posibleDup: function () { return []; }, estadoReal: function (t) { return t.estado || "abierta"; } };
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

var ult = function (t) { return t.msgs.slice(-1)[0]; };
var ABIERTAS = [
  { id: "JUNTA_CUMBRES_SEP", nombre: "Junta Consejo Cumbres septiembre", duenio: "salvador", estado: "abierta", contexto: "Junta del consejo de la colonia Cumbres", msgs: [] },
  { id: "PREDIAL_X", nombre: "Pagar predial", duenio: "salvador", estado: "abierta", msgs: [] },
  { id: "CERRADA_Y", nombre: "Consejo Cumbres vieja", duenio: "salvador", estado: "cerrada", cierre: { f: "2026-09-01" }, msgs: [] }];
c.tareas = ABIERTAS.slice();

/* 1 ORDEN: Claude primero (nada local antes de la llamada) */
var visto = null; var _pa = c.preguntaAClaude;
c.preguntaAClaude = function (m, mod, cb) { visto = { indef: T0.indefinida, ritmo: T0.ritmo, ctx: T0.contexto, prompt: m[0].content }; cb(JSON.stringify({}), null); };
var T0 = CONSEJO(); c.tareas.push(T0); c.completaRevision(T0, DICTADO); c.preguntaAClaude = _pa;
eq("Claude PRIMERO: al llamarlo todavía no se aplicó nada local", [visto.indef, visto.ritmo, visto.ctx], [undefined, undefined, undefined]);
si("la petición lleva el estado actual de la tarea", /ESTADO ACTUAL DE LA TAREA:\nNOMBRE: Agendar Reunión Consejo Colonia Cumbres\nTIPO: tarea\nQUIÉN LA HACE: Salvador\nFECHA: 2026-09-27/.test(visto.prompt));
si("…y la lista corta de tareas abiertas (la parecida primero; sin las cerradas ni ella misma)", /TAREAS ABIERTAS \(id \| nombre\):\nJUNTA_CUMBRES_SEP \| Junta Consejo Cumbres septiembre\nPREDIAL_X/.test(visto.prompt) && !/CERRADA_Y/.test(visto.prompt) && !/CONSEJO_CUMBRES_REUNION_20260927 \|/.test(visto.prompt));
si("una sola llamada que pide TODOS los campos", /"nombre":null,"tipo":null,"contexto":null,"contexto_modo":"reemplazar","fecha":null,"indefinida":false,"periodicidad":null,"ritmo":null,"recordar":\[\],"quien":null,("responsable":null,"yo_superviso":false,"seguimiento_a":null,("compartir_con":\[\],("metas":\[\],("aviso_inmediato":false,)?)?)?)?"palabras":\[\],"sinonimos":\[\],"vinculos":\[\],"de_quien":null,"cifras":null,"ya_hecha":false,"pregunta":null/.test(visto.prompt));
c.tareas = ABIERTAS.slice();

/* 2 CONSEJO CUMBRES, dictado real, con lo que regresaría Claude */
IA.resp = { nombre: "consejo de la colonia cumbres: proyectos", tipo: "tarea",
  contexto: "Tarea maestra donde Salvador mete todos los proyectos de la colonia Cumbres. Consejo: Salvador presidente, Mario Castillo secretario, Adolfo Rodríguez tesorero, Enrique Martínez vocal. Se reúnen dos veces al año.",
  indefinida: true, ritmo: "una vez al mes", quien: "Salvador", palabras: ["cumbres", "consejo", "colonia"], sinonimos: ["fraccionamiento", "junta vecinal"],
  vinculos: ["JUNTA_CUMBRES_SEP", "NO_EXISTE"], pregunta: null };
sellos.length = 0; var T1 = CONSEJO(); c.tareas.push(T1); c.abierta = T1.id; IA.llamadas = 0; c.completaRevision(T1, DICTADO);
eq("una sola llamada a Claude", IA.llamadas, 1);
eq("nombre bueno, mayúscula inicial salvo conectores", T1.nombre, "Consejo de la Colonia Cumbres: Proyectos");
eq("indefinida, ritmo, quién, tipo", [T1.indefinida, T1.ritmo, T1.duenio, T1.tipo_item], [true, "Una vez al mes", "salvador", "tarea"]);
si("contexto de Claude", /^Tarea maestra donde Salvador mete todos los proyectos/.test(T1.contexto));
eq("etiquetas + sinónimos", [T1.palabras, T1.sinonimos], [["cumbres", "consejo", "colonia", "fraccionamiento", "junta vecinal"], ["fraccionamiento", "junta vecinal"]]);
eq("vínculo PROPUESTO (solo ids de la lista; el inventado no)", T1.posible_dup, ["JUNTA_CUMBRES_SEP"]);
si("…y NO se aplicó (no se fusionó nada)", !T1.fusionada_en && !ABIERTAS[0].fusionada_en);
eq("completa: lista para Autorizar, no sola (build 209)", [!!T1.autorizada, T1.en_revision, sellos], [false, true, []]);
si("dice que lo deja propuesto", /Posible vínculo con “Junta Consejo Cumbres septiembre”: te lo dejo propuesto, no lo vinculé\./.test(ult(T1).t));
si("sigue en Falta info hasta Autorizar; después, la franja de vinculación", c.tipoRevisar(T1) === "falta" && c.autorizaRevision(T1) && c.tipoRevisar(T1) === "vincular");
c.tareas = ABIERTAS.slice();

/* 3 un DATO */
function DATO() { return { id: "WA_HERRERIA_1", nombre: "WhatsApp: Herrería López", creada_por: "claude", duenio: "salvador", estado: "abierta", msgs: [] }; }
var DICT_DATO = "Esto es un dato: la cotización de Herrería López para el barandal de la terraza, acero negro, 6.5 metros lineales a 2,800 pesos el metro, total 18,200 más IVA, para cuando decidamos";
IA.resp = { nombre: "cotización barandal terraza herrería lópez", tipo: "dato", contexto: "Cotización de Herrería López para el barandal de la terraza de acero negro, 6.5 metros lineales, para decidir después si se hace.",
  de_quien: "Herrería López", cifras: "6.5 m lineales a $2,800 el metro; total $18,200 más IVA", palabras: ["barandal", "herrería", "terraza"], sinonimos: ["baranda"], vinculos: [], pregunta: null };
sellos.length = 0; var D = DATO(); c.tareas.push(D); c.abierta = D.id; c.completaRevision(D, DICT_DATO);
eq("dato: tipo, nombre, de quién", [D.tipo_item, D.es_dato, D.nombre, D.de_quien], ["dato", true, "Cotización Barandal Terraza Herrería López", "Herrería López"]);
eq("dato: cifras guardadas tal cual", D.datos_corregidos.slice(-1)[0].t, "6.5 m lineales a $2,800 el metro; total $18,200 más IVA");
eq("dato completo -> listo para Autorizar", [!!D.autorizada, D.en_revision, c.tipoRevisar(D)], [false, true, "falta"]);
si("en un dato, el desglose dictado (lista) también va a Claude", /\(tipoItem\(t\)==="dato" \|\| \(!detectaLista\(v\) && listaNumerada\(v\)\.length<2\)\)/.test(html));
c.tareas = ABIERTAS.slice();

/* 4 candados: nada inventado */
IA.resp = { fecha: "2026-10-30", indefinida: true, periodicidad: "mensual", ritmo: "cada semana", quien: "Josué", contexto: "Barda del terreno baldío de la esquina." };
var T4 = { id: "tB", nombre: "Barda terreno", duenio: "salvador", creada_por: "claude", estado: "abierta", msgs: [] };
c.completaRevision(T4, "es la barda del terreno baldío de la esquina que nos pidió el consejo revisar");
eq("fecha, indefinida, recurrente, ritmo y quién que NO dijo: no entran", [T4.f_vigente, T4.indefinida, T4.periodicidad, T4.ritmo, T4.duenio], [undefined, undefined, undefined, undefined, "salvador"]);
si("el contexto corto de Claude no tira lo dictado", /nos pidió el consejo revisar/.test(T4.contexto));
IA.resp = { quien: "Josué", contexto: "Que Josué revise la barda del terreno." };
var T4b = { id: "tC", nombre: "Barda terreno", duenio: "salvador", creada_por: "claude", estado: "abierta", msgs: [] };
c.completaRevision(T4b, "esta la hace Josué, que revise la barda del terreno");
eq("quién SÍ dicho: se la pasa", T4b.duenio, "josue");

IA.resp = { fecha: "2026-10-31", contexto: "Pagar el predial de la casa en el banco." };
var T4c = { id: "tD", nombre: "Pagar predial", duenio: "salvador", creada_por: "claude", estado: "abierta", msgs: [] };
c.completaRevision(T4c, "el predial de la casa hay que pagarlo antes del 30 de octubre en el banco");
eq("fecha SÍ dictada: manda la dictada (Claude dijo 31, se dictó 30)", [T4c.f_vigente, T4c.fecha_dictada], ["2026-10-30", true]);
/* 5 ambiguo: pregunta solo eso y aplica lo demás */
IA.resp = { contexto: "Reunión del consejo de la colonia Cumbres para revisar la vigilancia y el alumbrado con todos los miembros del consejo y el administrador.", ritmo: "una vez al mes", pregunta: "¿Es jueves a cenar o viernes a comer?" };
var T5 = CONSEJO(); c.abierta = T5.id; c.completaRevision(T5, "es la reunión del consejo para la vigilancia y el alumbrado, recuérdamela una vez al mes, jueves o viernes");
eq("aplica lo claro", T5.ritmo, "Una vez al mes");
si("pregunta solo lo dudoso, junto con lo anotado", /^Anoté: contexto, ritmo: una vez al mes\. ¿Es jueves a cenar o viernes a comer\?/.test(ult(T5).t) && !T5.autorizada);

/* 6 sin red: respaldo local del 205 */
IA.err = "sin red"; sellos.length = 0; var T6 = CONSEJO(); c.abierta = T6.id; c.completaRevision(T6, DICTADO); IA.err = null;
eq("sin red: igual queda con lo local (indefinida + ritmo), lista para Autorizar", [T6.indefinida, T6.ritmo, !!T6.autorizada, T6.en_revision], [true, "Una vez al mes", false, true]);
IA.resp = null; var _pb = c.preguntaAClaude; c.preguntaAClaude = function (m, mod, cb) { cb("no es json", null); };
var T7 = CONSEJO(); c.completaRevision(T7, DICTADO); c.preguntaAClaude = _pb;
eq("respuesta ilegible: también respaldo local", [T7.indefinida, T7.ritmo], [true, "Una vez al mes"]);

/* 7 la tarjeta en vivo */
var T8 = CONSEJO(); T8._leyendo = Date.now(); T8.posible_dup = ["JUNTA_CUMBRES_SEP"];
var v8 = c.vFaltaInfo(T8);
si("tarjeta: 'Claude está leyendo…' mientras contesta", /Claude está leyendo lo que dictaste…/.test(v8));
si("tarjeta: la franja con el vínculo propuesto y su botón (no aplicado)", /POSIBLE VINCULACIÓN<\/span><span class="rcp">Propuesta de Claude; no la vinculé\.<\/span><div class="rvv"><span><b>Junta Consejo Cumbres septiembre<\/b><\/span><button class="rvb" data-rvinc="JUNTA_CUMBRES_SEP">Vincular/.test(v8));
si("VERSION_APP build 207 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 207);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
