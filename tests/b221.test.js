#!/usr/bin/env node
/* PRUEBAS build 221 (Salvador: "Si no la tienes, me preguntas, ¿quién es fulanito?… si tienes duda, pones todos los manuales y
   yo te los selecciono. Pero tiene que hacer entendimiento de todo."). Toda persona nombrada se resuelve contra la tarea
   (wa_contactos, revisa_ext, de_quien, compartir_con), Doit y la agenda; nunca se suelta ni se corta; varias o ninguna ->
   tarjeta "¿Quién es X?" con TODAS las opciones + "Otro / nuevo". Seguimiento por días sin hora = 10:00. compartir_con en la
   ficha. Correr: TZ=America/Monterrey node tests/b221.test.js */
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
var FUNCS = F_FUNCS.concat([ "_bpega", "palTema248", "temaComun248", "esCerradaReciente248", "nombreVinc248", "preguntaQuienYaResuelta248", "aplicaLecturaFechas248", "lecturaFechas248", "_hitsFecha248", "cierraDeEvento248", "pasosSeguimiento248", "armaMensajesSeguimiento248", "reintentaDudas248", "checklistTexto", "aplicaChecklistClaude", "aplicaResponsable", "esMetas", "necesitaAprobacion", "ejecutorNombre", "vistaSup", "porAprobar", "aplicaAvisoInmediato", "importanciaDe", "ejecutorMeta", "respuestasEjecutor", "textoEmpuje", "empujaEjecutor", "evidenciaMeta", "fechaPropuesta", "escalaMeta", "decideMeta", "vDecisionMeta", "miembroDeNombre", "metasDe", "metaCumplida", "metaCorta", "tareaCorta", "fechaMeta", "semaforoMeta", "quienMeta", "segMetaTx", "metaNueva", "_raizMeta", "metaParecidaCumplida", "cumpleMeta", "fotoMeta", "programaSegMeta", "aplicaMetasClaude", "chequeoMetas", "vMetas", "hhmmAhora", "nombreCorto", "_tokPer", "nombresEnTexto", "_compartirLista", "candidatosPersona", "resuelvePersona", "nuevaDudaPersona", "asignaResponsable", "agregaCompartir", "fechasDeCada", "programaSeguimiento", "resuelveDudaPersona", "_n179", "nombreInt", "agregaIntegrante", "aplicaSeguimientoA", "_dichoNombre", "nombreCorto", "tieneChecklist", "chkNuevo", "chkPon", "_nv", "checklistDicho", "respChecklist", "_chkTok", "chkBusca", "hhmmAhora", "esConfirmacion", "juntaY", "tienePasos", "esNotaClaude", "ordenClaraClaude", "sinPrefijoClaude", "ritmoDicho", "extraeLocal", "soloMeFalta", "fechaMty238", "horaMty238", "duenoDicho238", "fechaOrden238", "candidatasVinc238", "nombreTarea238", "corto238", "mandaOrden238", "ejecutaOrdenes238", "dioFecha238", "vHecho238", "completaRevision", "completitud", "contextoPct", "contextoDe", "tipoItem",
  "esDato", "creadaCon", "msCreacion", "_fechaDeId", "_diaCreacion", "fechaPuestaSola", "eventoDe", "revisaCompleta", "preguntasFalta", "fechasRaras", "conMayuscula", "vFaltaInfo", "palabrasClave",
  "palabrasBusqueda", "_sinGrupo", "_bst", "_bw", "vAgenda", "eventoPendiente", "faltaVieja", "tipoRevisar", "porAutorizar", "creadaPorSistema", "faltaInfoRev", "esDecisionSal", "meDetiene", "diaMonterrey", "okDeRevision", "palomeaEnOrden", "autorizaRevision", "fichaRevision", "rangoHora", "descartaVinculos", "agendaEvento", "urlGoogleCal", "_gcalUtc", "mtyAUtcMs", "horaBonita", "fmt24", "nuevoAviso", "abiertasParaVincular", "estadoParaClaude", "promptRevision", "aplicaRevisionClaude", "tituloTarea", "traeFecha", "transfiere", "posibleDup", "contactoDeTarea", "miembroDeNombre", "_tsDe", "_fsa"])
  .filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["EMPRESAS248", "SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "AGENDA_HORA_TODO_DIA", "PALOMEO_MS", "TITULO_CONECTORES", "RITMO_RE", "CITA_RE", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE"]);
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
si("VERSION_APP build 221 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 221);
var AG = [];
c.todosLosContactos = function () { return AG.map(function (nm) { return { id: "ext:" + nm, nombre: nm, sub: "agenda de WhatsApp", n: 0, ts: 0 }; }); };
c.agregaIntegrante = function (t, k) { (t.integrantes = t.integrantes || []).push(k); };
c.PERSONAS.samuel = { nombre: "Samuel", apellido: "Gámez" };
var DQ = "Mantenimiento reportado normalmente por Manuel Parra. Propietaria: María Eloísa Albores de la Peña. Ejecutor responsable (duenio): Manuel Parra. Supervisa: Salvador (sin ejecutar él mismo). A veces se comparte también con Salvador S.N. (padre) y Luis Mario Necochea (hermano).";
function T(o) { return Object.assign({ id: "tX", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", indefinida: true, msgs: [] }, o || {}); }
function nombres(r) { return (r.cands || []).map(function (x) { return x.nombre; }); }
/* ---- resolver ---- */
AG = ["Manuel López", "Manuel Parra", "Ángel Núñez"];
var r = c.resuelvePersona(T({ wa_contactos: [{ nombre: "Manuel Parra" }] }), "Manuel");
eq("'Manuel' con Manuel Parra en la tarea: es él (la tarea manda), aunque la agenda tenga otro", [r.estado, r.persona.nombre, r.persona.sub], ["uno", "Manuel Parra", "en esta tarea"]);
r = c.resuelvePersona(T(), "Manuel");
eq("'Manuel' sin contexto en la tarea: varios -> TODAS las coincidencias", [r.estado, nombres(r)], ["varios", ["Manuel López", "Manuel Parra"]]);
eq("nombre completo exacto: uno", c.resuelvePersona(T(), "manuel parra").persona.nombre, "Manuel Parra");
eq("sin acentos ni mayúsculas: 'angel nunez'", c.resuelvePersona(T(), "angel nunez").persona.nombre, "Ángel Núñez");
eq("usuarios de Doit (por apellido): 'Samuel Gámez'", c.resuelvePersona(T(), "Samuel Gámez").persona.id, "samuel");
eq("ninguno: 'Fulanito'", c.resuelvePersona(T(), "Fulanito").estado, "ninguno");
eq("nombres dentro de de_quien cuentan como de la tarea", c.nombresEnTexto(DQ), ["Manuel Parra", "María Eloísa Albores de la Peña", "Luis Mario Necochea"]);
r = c.resuelvePersona(T({ de_quien: DQ }), "Eloísa");
eq("'Eloísa' -> María Eloísa Albores de la Peña (de_quien)", [r.estado, r.persona && r.persona.nombre], ["uno", "María Eloísa Albores de la Peña"]);
/* ---- responsable: nunca se suelta ni se corta ---- */
var t = T({ de_quien: DQ, duenio: "manuel_parra", encargado: "manuel_parra" });
var rv = c.aplicaRevisionClaude(t, "el responsable es Manuel Parra y yo solo superviso", { responsable: "Manuel Parra", yo_superviso: true }, []);
eq("responsable externo encontrado en la tarea: completo, tú supervisas", [t.revisa_ext, t.duenio, t.encargado, rv.hecho.indexOf("responsable: Manuel Parra · tú supervisas") >= 0], ["Manuel Parra", "salvador", null, true]);
t = T(); rv = c.aplicaRevisionClaude(t, "la hace Pedro Gómez Treviño", { quien: "Pedro Gómez Treviño" }, []);
eq("'quien' de fuera de Doit ya no se suelta: no está en ningún lado -> pregunta con 'Otro / nuevo'", [t.revisa_ext || "", t.quien_dudas.length, t.quien_dudas[0].dicho, t.quien_dudas[0].cands.length, rv.dudas], ["", 1, "Pedro Gómez Treviño", 0, ["¿Quién es Pedro Gómez Treviño? Te dejé la pregunta en la ficha."]]);
var did = t.quien_dudas[0].id, tx = c.resuelveDudaPersona(t, did, { id: "ext:Pedro Gómez Treviño", nombre: "Pedro Gómez Treviño" });
eq("Otro / nuevo: queda tal cual lo escribió, completo", [t.revisa_ext, t.quien_dudas.length, tx], ["Pedro Gómez Treviño", 0, "Anoté: responsable: Pedro Gómez Treviño · tú supervisas."]);
t = T(); rv = c.aplicaRevisionClaude(t, "la tarea es de Manuel y yo superviso", { responsable: "Manuel", yo_superviso: true }, []);
eq("'Manuel' con dos en la agenda: '¿Quién es Manuel?' con las dos opciones", [t.quien_dudas[0].rol, t.quien_dudas[0].cands.map(function (x) { return x.nombre; }), rv.dudas], ["responsable", ["Manuel López", "Manuel Parra"], ["¿Quién es Manuel? Te dejé las opciones en la ficha."]]);
c.resuelveDudaPersona(t, t.quien_dudas[0].id, t.quien_dudas[0].cands[1]);
eq("al escoger se aplica lo que esperaba (responsable + supervisas)", [t.revisa_ext, t.msgs.slice(-1)[0].t], ["Manuel Parra", "Anoté: responsable: Manuel Parra · tú supervisas."]);
/* ---- con quién se comparte ---- */
var D1 = "A veces la comparto con mi madre María Eloísa albores de la Peña este con mi padre Salvador S. N. Este con quien más lo puede compartir con mi hermano Luis Mario Necochea entonces este son los que pueden estar aquí";
t = T({ de_quien: DQ });
rv = c.aplicaRevisionClaude(t, D1, { compartir_con: ["María Eloísa Albores de la Peña", "Salvador S. N.", "Luis Mario Necochea", "Samuel"] }, []);
eq("compartir_con: los encontrados, completos", t.compartir_con, [{ id: "ext:María Eloísa Albores de la Peña", nombre: "María Eloísa Albores de la Peña" }, { id: "ext:Luis Mario Necochea", nombre: "Luis Mario Necochea" }]);
eq("'Salvador S. N.' no se adivina: se pregunta; 'Samuel' no lo dijo: no entra", [t.quien_dudas.map(function (d) { return [d.rol, d.dicho]; })], [[["compartir", "Salvador S. N."]]]);
c.resuelveDudaPersona(t, t.quien_dudas[0].id, { id: "ext:Salvador N.S.", nombre: "Salvador N.S." });
eq("al escoger, se agrega", t.compartir_con.map(function (x) { return x.nombre; }), ["María Eloísa Albores de la Peña", "Luis Mario Necochea", "Salvador N.S."]);
t = T(); c.aplicaRevisionClaude(t, "compártela con Samuel Gámez", { compartir_con: ["Samuel Gámez"] }, []);
eq("alguien de Doit: entra a compartir_con y como integrante", [t.compartir_con, t.integrantes], [[{ id: "samuel", nombre: "Samuel Gámez" }], ["samuel"]]);
/* ---- seguimiento: lunes, miércoles y viernes sin hora = 10:00 ---- */
c.PROG.length = 0; t = T({ wa_contactos: [{ nombre: "Manuel Parra" }] });
rv = c.aplicaRevisionClaude(t, "dale seguimiento a Manuel lunes, miércoles y viernes para lo del panal", { seguimiento_a: { quien: "Manuel", meta: "lo del panal", cada: "lunes, miércoles y viernes", fechas: [], hora: null } }, []);
eq("fechas del calendario por los días dichos (3 semanas), a las 10:00", c.PROG.map(function (p) { return p.a_las.fecha + " " + p.a_las.hora; }),
  ["2026-10-05 10:00", "2026-10-07 10:00", "2026-10-09 10:00", "2026-10-12 10:00", "2026-10-14 10:00", "2026-10-16 10:00", "2026-10-19 10:00", "2026-10-21 10:00", "2026-10-23 10:00"]);
eq("seg_a {contacto, cada, hora} y lo dice", [t.seg_a.contacto, t.seg_a.cada, t.seg_a.hora, t.seg_a.hora_defecto, /a las 10:00 porque no dijiste hora/.test(rv.hecho.join(" "))], ["Manuel Parra", "lunes, miércoles y viernes", "10:00", true, true]);
var seg = c.completitud(t).items.filter(function (x) { return x.k === "seguimiento"; })[0];
eq("ya no pide 'próximo seguimiento'", [seg.ok, c.soloMeFalta(t).indexOf("el próximo seguimiento")], [true, -1]);
t = T({ seg_a: { contacto: "Manuel Parra", cada: "lunes, miércoles y viernes", hora: "10:00" }, ritmo: "" });
eq("seg_a con 'cada' (aunque no haya programados) cuenta como seguimiento", c.completitud(t).items.filter(function (x) { return x.k === "seguimiento"; })[0].ok, true);
c.PROG.length = 0; t = T();
rv = c.aplicaRevisionClaude(t, "dale seguimiento a Manuel cada lunes a las 9", { seguimiento_a: { quien: "Manuel", cada: "cada lunes", fechas: ["2026-10-05"], hora: "09:00" } }, []);
eq("seguimiento a un 'Manuel' dudoso: no se programa nada hasta que escoja", [c.PROG.length, t.quien_dudas[0].rol, t.quien_dudas[0].cands.length], [0, "seguimiento", 2]);
c.resuelveDudaPersona(t, t.quien_dudas[0].id, t.quien_dudas[0].cands[1]);
eq("al escoger: se programa con lo que había dicho", c.PROG.map(function (p) { return [p.contacto, p.a_las.fecha, p.a_las.hora]; }), [["Manuel Parra", "2026-10-05", "09:00"], ["Manuel Parra", "2026-10-12", "09:00"], ["Manuel Parra", "2026-10-19", "09:00"]].slice(0, 1));
/* ---- prompts ---- */
var PR = c.promptRevision(T(), "x", []);
si("revisión: pide compartir_con y nombres completos", /- compartir_con: /.test(PR) && /"compartir_con":\[\]/.test(PR) && /nunca abreviados ni cortados/.test(PR) && /nunca lo sueltes/.test(PR));
si("nota a Claude (tarea autorizada): pide y aplica responsable, seguimiento_a y compartir_con", /\\"compartir_con\\":\[\],\\"pregunta\\":null/.test(html) && /var _pr221=aplicaResponsable\(t, v, j\|\|\{\}\)/.test(html) && /var _sg221=aplicaSeguimientoA\(t, v, j\|\|\{\}\)/.test(html));
/* ---- ficha ---- */
t = T({ revisa_ext: "Manuel Parra", compartir_con: [{ id: "ext:María Eloísa Albores de la Peña", nombre: "María Eloísa Albores de la Peña" }, "Luis Mario Necochea"], seg_a: { contacto: "Manuel Parra", cada: "lunes, miércoles y viernes", hora: "10:00", hora_defecto: true },
  quien_dudas: [{ id: "q1", dicho: "Manuel", rol: "responsable", cands: [{ id: "ext:Manuel López", nombre: "Manuel López", sub: "agenda de WhatsApp" }, { id: "ext:Manuel Parra", nombre: "Manuel Parra", sub: "en esta tarea" }] }, { id: "q2", dicho: "Fulanito", rol: "compartir", cands: [] }] });
var fr = c.fichaRevision(t);
si("ficha: Quién = Manuel Parra · tú supervisas; Seguimiento; Se comparte con (completos)", /Manuel Parra · tú supervisas/.test(fr) && /Manuel Parra · lunes, miércoles y viernes · 10:00 \(por defecto\)/.test(fr) && /María Eloísa Albores de la Peña · Luis Mario Necochea/.test(fr));
si("arriba de la tarea siempre: ¿Quién es X? y Se comparte con", /h\+=(vDecisionMeta\(t\)\+)?(vDecisionDato\(t\)\+)?vQuienDudas\(t\)(\+vBorradorMsj\(t\))?(\+vCompartir\(t\))?;/.test(html));
si("la ficha ▾ trae Lo hace / Seguimiento a / Se comparte con", /_fr\("Lo hace"/.test(html) && /_fr\("Seguimiento a"/.test(html) && /_fr\("Se comparte con"/.test(html));
si("botones: escoger, Otro / nuevo y Listo", /\[data-qdpick\]/.test(html) && /\[data-qdotro\]/.test(html) && /\[data-qdnuevo\]/.test(html));
var css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || "";
var os = require("os"), UF = ["_compartirLista", "vQuienDudas", "vCompartir", "nombreCorto", "nombreInt"];
var pagina = '<!doctype html><meta charset="utf-8"><style>' + css + '</style><body style="background:#111;color:#f5f5f7;font-family:-apple-system,sans-serif;margin:0;width:390px"><div id="m"></div><script>var PERSONAS={}, window_=window;' +
  'function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); }' + UF.map(function (f) { return saca("function", f); }).join("\n") + '</script>';
var tmp = path.join(os.tmpdir(), "b221-" + process.pid + ".html"); fs.writeFileSync(tmp, pagina);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  try { await p.goto("file://" + tmp);
    var u = await p.evaluate(function (t) { var m = document.getElementById("m"); m.innerHTML = vQuienDudas(t) + vCompartir(t);
      var c1 = m.querySelector('[data-qd="q1"]'), c2 = m.querySelector('[data-qd="q2"]');
      return { q1: c1.querySelector(".rcq").textContent, b1: Array.prototype.map.call(c1.querySelectorAll(".qdb"), function (x) { return x.querySelector("b").textContent; }),
        q2: c2.querySelector(".rcq").textContent + " | " + c2.querySelector(".rcp").textContent, b2: Array.prototype.map.call(c2.querySelectorAll(".qdb"), function (x) { return x.querySelector("b").textContent; }),
        comp: m.querySelector(".compc").textContent, bg: getComputedStyle(c1).backgroundColor }; }, t);
    eq("tarjeta: ¿Quién es Manuel? con TODAS las opciones + Otro / nuevo", [u.q1, u.b1], ["¿Quién es Manuel?", ["Manuel López", "Manuel Parra", "Otro / nuevo"]]);
    eq("sin coincidencias: lo dice y deja Otro / nuevo", [u.q2, u.b2], ["¿Quién es Fulanito? | No lo tengo en tus contactos", ["Otro / nuevo"]]);
    eq("franja 'Se comparte con' con nombres completos (se desliza)", u.comp, "Se comparte conMaría Eloísa Albores de la PeñaLuis Mario Necochea");
    await p.screenshot({ path: path.join(os.tmpdir(), "b221-quien.png") });
    eq("sin errores de página", errs, []);
  } finally { await b.close(); try { fs.unlinkSync(tmp); } catch (e) {} }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
