#!/usr/bin/env node
/* PRUEBAS build 219 (Salvador 2026-10-05 10:15), tres cosas:
   1) AGREGAR integrante con buscador (lupa) en TODOS los contactos (Doit + WhatsApp vistos + agenda de la Mac si el servidor
      la da: accion wa_agenda), sin acentos ni mayusculas, por nombre o apodo.
   2) Franja de canales: solo primer nombre y primer apellido, en UN renglon que se desliza de lado.
   3) Caso real "Mantenimiento Casa Lerdo/Eloísa" (tIAMUVF22TRJF): "el ejecutor responsable es Manuel Parra y yo sólo soy el
      supervisor" y "quiero que tú le des seguimiento a Manuel Parra…" no se aplicaban (quien solo aceptaba gente de Doit;
      no habia seguimiento hacia otra persona). Correr: TZ=America/Monterrey node tests/b219.test.js */
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
si("VERSION_APP build 219 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 219);

/* ---------- 3) responsable y seguimiento (caso real Casa Lerdo/Eloísa) ---------- */
var D1 = "Para Claus fíjate que tengo en Lerdo una propiedad de una casa que le desollemos llamar casa Eloísa o casa Lerdo esa casa está sin uso pero la podemos mantener al 100% … entonces este son los que pueden estar aquí es en esta tarea y que a veces les les mando también avisos para que sepan lo que se está haciendo entonces por lo pronto ahorita con el panel de abeja quiero que tú le des seguimiento a a Manuel Parra para ver este que quede solucionado esta semana Ya le dije que revise primero que efectivamente hay para que nos mande la evidencia";
var D2 = "La otra también mencionó que el ejecutor responsable de tener al 100% siempre esta tarea es Manuel Parra y yo sólo soy el supervisor en este caso tú me vas a estar ayudando a supervisar para yo para yo no estar distrayéndome tanto";
function T(o) { return Object.assign({ id: "tX", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", indefinida: true, msgs: [], wa_contactos: [{ nombre: "Manuel Parra" }] }, o || {}); }   /* como la tarea real (build 221: las personas se buscan en la tarea) */
var PR = c.promptRevision(T(), D2, []);
si("el prompt pide responsable, yo_superviso y seguimiento_a", /- responsable: /.test(PR) && /- seguimiento_a: /.test(PR) && /"seguimiento_a":null/.test(PR) && /"yo_superviso":false/.test(PR));
var t = T({ duenio: "manuel_parra", encargado: "manuel_parra" });
var r = c.aplicaRevisionClaude(t, D2, { responsable: "Manuel Parra", yo_superviso: true }, []);
eq("responsable de fuera: Salvador supervisa (dueño), Manuel lo hace (revisa_ext); dueño/encargado mal guardados se corrigen",
  [t.duenio, t.revisa_ext, t.encargado], ["salvador", "Manuel Parra", null]);
si("dice 'responsable: Manuel Parra · tú supervisas'", r.hecho.indexOf("responsable: Manuel Parra · tú supervisas") >= 0);
eq("y en el checklist: 'Quién: Manuel Parra · tú supervisas'", c.completitud(t).items.filter(function (x) { return x.k === "quien"; })[0], { k: "quien", ok: true, tx: "Quién: Manuel Parra · tú supervisas" });
t = T(); r = c.aplicaRevisionClaude(t, "la tarea es de Josué y yo solo la superviso", { responsable: "Josué", yo_superviso: true }, []);
eq("responsable de Doit: la tarea pasa a él y tú quedas de revisor", [t.duenio, t.revisores], ["josue", ["salvador"]]);
t = T(); r = c.aplicaRevisionClaude(t, "hay que pintar la barda", { responsable: "Manuel Parra", yo_superviso: true }, []);
eq("candado: si no lo nombró, no se pone responsable", [t.revisa_ext || "", t.duenio], ["", "salvador"]);
c.PROG.length = 0; t = T();
r = c.aplicaRevisionClaude(t, D1, { seguimiento_a: { quien: "Manuel Parra", meta: "que quede solucionado esta semana el panal", cada: "diario", fechas: ["2026-10-05", "2026-10-06"], hora: "09:00", texto: "IA: Hola Manuel, ¿cómo va lo del panal?" } }, []);
eq("D1 real: pidió seguimiento a Manuel sin decir cada cuándo ni a qué hora -> no se programa nada inventado; se pregunta", [c.PROG.length, r.dudas], [0, ["¿Cada cuándo y a qué hora le doy seguimiento a Manuel Parra?"]]);
eq("pero queda anotado a quién y para qué", [t.seg_a.contacto, t.seg_a.meta, t.seg_a.cada, t.seg_a.hora], ["Manuel Parra", "que quede solucionado esta semana el panal", "", ""]);
si("y el mensaje lo dice", r.hecho.indexOf("seguimiento a Manuel Parra (que quede solucionado esta semana el panal)") >= 0);
c.PROG.length = 0; t = T();
var D3 = "dale seguimiento a Manuel Parra cada lunes y jueves a las 9 de la mañana para lo del panal";
r = c.aplicaRevisionClaude(t, D3, { seguimiento_a: { quien: "Manuel Parra", meta: "lo del panal", cada: "cada lunes y jueves", fechas: ["2026-10-05", "2026-10-08", "2026-10-12", "2099-01-01", "2026-10-08"], hora: "09:00", texto: "IA: Hola Manuel, ¿cómo vas con lo del panal?" } }, []);
eq("con frecuencia y hora: WhatsApps programados por Doit (cola [A LAS]), solo fechas del calendario, futuras y sin repetir",
  c.PROG.map(function (p) { return [p.contacto, p.a_las.fecha, p.a_las.hora, p.texto]; }),
  [["Manuel Parra", "2026-10-05", "09:00", "IA: Hola Manuel, ¿cómo vas con lo del panal?"], ["Manuel Parra", "2026-10-08", "09:00", "IA: Hola Manuel, ¿cómo vas con lo del panal?"], ["Manuel Parra", "2026-10-12", "09:00", "IA: Hola Manuel, ¿cómo vas con lo del panal?"]]);
eq("ritmo y seguimiento quedan en la tarea (cuenta como 'próximo seguimiento')", [t.ritmo, t.seg_a.programados, c.completitud(t).items.filter(function (x) { return x.k === "seguimiento"; })[0].ok],
  ["Seguimiento a Manuel Parra: cada lunes y jueves a las 09:00", ["2026-10-05 09:00", "2026-10-08 09:00", "2026-10-12 09:00"], true]);
eq("sin dudas", r.dudas, []);
c.PROG.length = 0; t.msgs.push({ prog: { contacto: "Manuel Parra", a_las: { fecha: "2026-10-08", hora: "09:00" } } });
r = c.aplicaRevisionClaude(t, D3, { seguimiento_a: { quien: "Manuel Parra", cada: "cada lunes y jueves", fechas: ["2026-10-08", "2026-10-12"], hora: "09:00" } }, []);
eq("dictarlo otra vez no duplica lo ya programado", c.PROG.map(function (p) { return p.a_las.fecha; }), ["2026-10-12"]);
c.PROG.length = 0; t = T();
r = c.aplicaRevisionClaude(t, "dale seguimiento a Manuel Parra cada lunes", { seguimiento_a: { quien: "Manuel Parra", cada: "cada lunes", fechas: ["2026-10-12"], hora: "09:00" } }, []);
eq("(build 221) frecuencia sin hora: 10:00 por defecto y lo dice", [c.PROG.map(function (p) { return p.a_las.fecha + " " + p.a_las.hora; }), r.dudas, /a las 10:00 porque no dijiste hora/.test(r.hecho.join(" "))], [["2026-10-12 10:00"], [], true]);
c.PROG.length = 0; t = T(); r = c.aplicaRevisionClaude(t, "hay que revisar el techo", { seguimiento_a: { quien: "Manuel Parra", cada: "diario", fechas: ["2026-10-06"], hora: "09:00" } }, []);
eq("candado: sin pedir seguimiento ni nombrarlo, nada", [!!t.seg_a, c.PROG.length], [false, 0]);
t = T(); c.aplicaRevisionClaude(t, "x", { de_quien: "María Eloísa Albores de la Peña (propietaria), coordinación de Manuel Parra, ejecutor: Manuel Parra" }, []);
si("de_quien ya no se corta a media palabra ('ejecutor: Man.')", !/Man\.$/.test(t.de_quien) && t.de_quien.indexOf("ejecutor: Manuel Parra") > 0);
IA.resp = { responsable: "Manuel Parra", yo_superviso: true }; t = T({ duenio: "manuel_parra", encargado: "manuel_parra", ritmo: "", contexto: D1 });
c.completaRevision(t, D2);
var ult = t.msgs[t.msgs.length - 1].t;
si("de punta a punta: 'Anoté: responsable: Manuel Parra · tú supervisas'", /responsable: Manuel Parra · tú supervisas/.test(ult));
si("y 'quién la hace' ya no falta", !/quién la hace/.test(ult));

/* ---------- 2) nombres cortos ---------- */
eq("nombreCorto", ["Eduardo Madero \"Lalo\" (padel Verde) LNN", "Eduardo Madero “Lalo” 🎾 (padel)", "Manuel Parra", "Samuel Gamez ciper", "Juan de la Garza López", "😀 Rogelio Sada 🇲🇽", "Lalo LNN", "Equipo", "+52 871 123 4567", "Dr. Arturo Ramírez"].map(c.nombreCorto),
  ["Eduardo Madero", "Eduardo Madero", "Manuel Parra", "Samuel Gamez", "Juan de la Garza", "Rogelio Sada", "Lalo", "Equipo", "+52 871 123 4567", "Arturo Ramírez"]);
si("la pastilla usa el nombre corto; el menú sigue con el completo", /esc\(nombreCorto\(c\.nom\)\+\(c\.wa\?" · WhatsApp":""\)\)/.test(html) && /esc\(x\.nom\)\+'<small>'/.test(html));
si("la hoja de agregar trae lupa y busca en todos", /placeholder="Buscar en todos tus contactos"/.test(html) && /buscaContactos\(q, ya\)/.test(html));

/* ---------- UI en Chromium: franja en un renglon y buscador ---------- */
var css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || "";
var UF = ["_n179", "claveDe", "contactosConocidos", "haceCuanto", "_agendaDe", "cargaAgendaWA", "todosLosContactos", "buscaContactos", "nombreInt", "iniInt", "puedeQuitar", "agregaIntegrante", "abreIntegrantes", "nombreCorto", "vPastilla"];
var os = require("os");
var pagina = '<!doctype html><meta charset="utf-8"><style>' + css + '</style><body style="background:#111;color:#f5f5f7;font-family:-apple-system,sans-serif;margin:0"><div id="strip" style="width:390px"></div><div id="toast"></div><script>' +
  'var yo="salvador", vista="lista", PUSH="push.php", APP_TOKEN="tok", PERSONAS={salvador:{nombre:"Salvador",jefe:true}, samuel:{nombre:"Samuel",apellido:"Gámez"}, cynthia:{nombre:"Cynthia"}}, CLAUDE_COL="#D97757", FETCH=0, AG=null;' +
  'function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); } function ico(){ return "<svg width=18 height=18></svg>"; } function guarda(){} function render(){} function toast(){} function jefeDe(){ return false; }' +
  'var INTS=[{k:"salvador",rol:"hace"}]; function integrantesDe(){ return INTS; } var CNL={id:"ext:x", nom:"Eduardo Madero \\"Lalo\\" (padel Verde) LNN", col:"#30d158", wa:"Eduardo"}; function canalActual(){ return CNL; } function canalesDe(){ return [1,2,3,4]; } function modoClaude(){ return false; }' +
  'var tareas=[{id:"a", msgs:[{wa_c:"Eduardo Madero \\"Lalo\\" (padel Verde) LNN", ts:Date.now()-86400000}, {wa_c:"Rogelio Sada", ts:Date.now()}]}];' +
  'window.fetch=function(u){ FETCH++; return Promise.resolve({ok:true,status:200,json:function(){ return Promise.resolve(AG); }}); };' +
  UF.map(function (f) { return saca("function", f); }).join("\n").replace(/<\/script>/g, "<\\/script>") + '</script>';
var tmp = path.join(os.tmpdir(), "b219-" + process.pid + ".html"); fs.writeFileSync(tmp, pagina);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  try { await p.goto("file://" + tmp);
    var st = await p.evaluate(function () {
      INTS = [{ k: "salvador" }, { k: "samuel" }, { k: "cynthia" }, { k: "ext:Eduardo Madero" }];
      var el = document.getElementById("strip"); el.innerHTML = vPastilla({ id: "a" });
      var w = el.querySelector(".cnlwrap"), kids = Array.prototype.slice.call(w.children), tops = kids.map(function (k) { var r = k.getBoundingClientRect(); return Math.round((r.top + r.bottom) / 2 / 4); });
      return { tx: el.querySelector("#cnlpill").textContent, unRenglon: tops.every(function (x) { return x === tops[0]; }), ov: getComputedStyle(w).overflowX, wrap: getComputedStyle(w).flexWrap, nw: getComputedStyle(kids[0]).whiteSpace };
    });
    eq("pastilla: 'Eduardo Madero · WhatsApp ▾'", st.tx, "Eduardo Madero · WhatsApp ▾");
    eq("franja en un renglón, se desliza de lado si no cabe", [st.unRenglon, st.ov, st.wrap, st.nw], [true, "auto", "nowrap", "nowrap"]);
    var lg = await p.evaluate(function () {
      CNL.nom = "Alejandro Fernández de la Garza Villarreal"; var el = document.getElementById("strip"); el.style.width = "300px"; el.innerHTML = vPastilla({ id: "a" });
      var w = el.querySelector(".cnlwrap"), kids = Array.prototype.slice.call(w.children), tops = kids.map(function (k) { var r = k.getBoundingClientRect(); return Math.round((r.top + r.bottom) / 2 / 4); });
      return { tx: el.querySelector("#cnlpill").textContent, uno: tops.every(function (x) { return x === tops[0]; }), desliza: w.scrollWidth > w.clientWidth, ini: Math.round(kids[0].getBoundingClientRect().left) }; });
    eq("aunque no quepa: sigue en un renglón, se desliza y no se corta el inicio", [lg.tx, lg.uno, lg.desliza, lg.ini >= 0], ["Alejandro Fernández · WhatsApp ▾", true, true, true]);
    await p.screenshot({ path: path.join(os.tmpdir(), "b219-franja.png"), clip: { x: 0, y: 0, width: 390, height: 70 } });
    await p.evaluate(function () { INTS = [{ k: "salvador", rol: "hace" }]; AG = { contactos: [{ nombre: "María Eloísa Albores de la Peña" }, { nombre: "Arturo Ramírez (control de plagas)" }, { nombre: "Ángel Núñez" }, { nombre: "+52 871 000 0000" }, { nombre: "Rogelio Sada" }] }; abreIntegrantes({ id: "a", nombre: "Casa Lerdo", duenio: "salvador" }); document.querySelector(".itadd").click(); });
    var h0 = await p.evaluate(function () { return { lupa: !!document.querySelector(".itbus svg"), inp: !!document.querySelector("#itq"), n: document.querySelectorAll(".itlst [data-ak]").length, foco: document.activeElement && document.activeElement.id }; });
    eq("lupa arriba, enfocada, y abajo los recientes", [h0.lupa, h0.inp, h0.n > 0, h0.foco], [true, true, true, "itq"]);
    await p.waitForTimeout(50);
    async function busca(q) { await p.fill("#itq", q); return p.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll(".itlst [data-ak]"), function (b) { return b.getAttribute("data-ak"); }).concat(Array.prototype.map.call(document.querySelectorAll(".itvacio"), function (d) { return "VACIO:" + d.textContent; })); }); }
    eq("sin acentos ni mayúsculas, en la agenda: 'eloisa'", await busca("eloisa"), ["ext:María Eloísa Albores de la Peña"]);
    eq("'ANGEL nun' encuentra a Ángel Núñez", await busca("ANGEL nun"), ["ext:Ángel Núñez"]);
    eq("por apodo: 'lalo'", await busca("lalo"), ["ext:Eduardo Madero \"Lalo\" (padel Verde) LNN"]);
    eq("usuarios de Doit por apellido: 'gamez' -> Samuel", await busca("gamez"), ["samuel"]);
    eq("lo de la agenda y lo ya visto no se duplica (Rogelio)", await busca("rogelio"), ["ext:Rogelio Sada"]);
    eq("por lo de paréntesis: 'plagas'", await busca("plagas"), ["ext:Arturo Ramírez (control de plagas)"]);
    var nada = await busca("zzzz"); si("sin resultados lo dice", nada.length === 1 && /No encontré “zzzz”/.test(nada[0]));
    await p.screenshot({ path: path.join(os.tmpdir(), "b219-buscar.png") });
    eq("la agenda se pide UNA vez al servidor", await p.evaluate(function () { return FETCH; }), 1);
    var sin = await p.evaluate(async function () { window.AGENDA_WA = null; window.__agendaNo = 0; AG = { error: "accion desconocida" }; FETCH = 0;
      abreIntegrantes({ id: "b", nombre: "x", duenio: "salvador" }); document.querySelector(".itadd").click(); await new Promise(function (r) { setTimeout(r, 30); });
      var i = document.querySelector("#itq"); i.value = "eloisa"; i.dispatchEvent(new Event("input")); return document.querySelector(".itvacio").textContent; });
    eq("si el servidor no tiene la agenda: busca en lo que conoce y avisa que falta", sin, "No encontré “eloisa” · la agenda completa de WhatsApp aún no está en Doit");
    eq("sin errores de página", errs, []);
  } finally { await b.close(); try { fs.unlinkSync(tmp); } catch (e) {} }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
