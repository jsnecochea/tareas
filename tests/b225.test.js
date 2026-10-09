#!/usr/bin/env node
/* PRUEBAS build 225 (maquetas aprobadas: maqueta-chips-v2 + maqueta-info-tarea). Chips del encabezado, "Resumen vivo · Claude"
   (solo con lo que ya hay), filtro por meta, ficha de meta, hoja Detalles en su orden, "1 cosa para ti" sin botón verde gigante,
   bug Autorizar con por_autorizar=false, mensaje mal acomodado (duda_tarea + "Mover a otra tarea": oculto en origen, NUEVO en
   destino), "me mezclaste" sin tocar metas, y dictado: no se pierde lo dicho tras una pausa; "ponle un mensaje a Fernando para…"
   arma el borrador, pregunta "¿Quién es Fernando?" si hay varios y lo dictado queda en la tarea.
   Casos reales: tIAMUVF22TRJF (Casa Lerdo/Eloísa), tCOMEDOR_NUEVO_300926 (Comedor Nuevo), mensaje de Manuel 11:51. Correr: node tests/b225.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm"), os = require("os");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"), lineas = html.split("\n");
function saca(tipo, nombre) {
  var re = tipo === "function" ? new RegExp("^function " + nombre.replace(/\$/g, "\\$") + "\\(") : new RegExp("^var " + nombre + "\\s*=");
  var ini = -1; for (var i = 0; i < lineas.length; i++) if (re.test(lineas[i])) ini = i;
  if (ini < 0) throw new Error("no encontre " + tipo + " " + nombre);
  var out = [lineas[ini]];
  for (var k = ini + 1; k < lineas.length; k++) { var L = lineas[k]; if (L.length && !/^[\s}\]]/.test(L)) break; out.push(L); if (/^}/.test(L)) break; }
  return out.join("\n");
}
function bloque(a, b) { var i = html.indexOf(a), j = html.indexOf(b); return html.slice(i, j + b.length); }
var ft = fs.readFileSync(path.join(__dirname, "fechas.test.js"), "utf8"), t221 = fs.readFileSync(path.join(__dirname, "b221.test.js"), "utf8");
var F_VARS = eval(ft.match(/var VARS = (\[[\s\S]*?\]);/)[1]);
var B221 = eval(t221.match(/var FUNCS = F_FUNCS\.concat\((\[[\s\S]*?\])\)/)[1]), F_FUNCS = eval(ft.match(/var FUNCS = (\[[\s\S]*?\]);/)[1]);
var NUEVAS = ["min225", "togMin", "_txMsg", "msgVisible", "metasEnCurso", "palMeta", "metaDeMsg", "resumenVivo", "cosasParaTi", "personas225", "chipsTarea", "vResumenVivo", "filtroMeta", "vFiltroMeta",
  "evidenciaMeta225", "vFichaMeta", "vDetalles", "vPersonas", "dudasDeNotas", "aplicaDudasNota", "confirmado237", "acomodoIA", "esPlatica", "platicas237", "botonesG", "esSaludo238", "_fsa", "claudeAcomodo", "icoCl", "nombreLimpio", "esImp", "msgId", "hoja225", "abreHoja", "vHoja", "tareasParaMover", "mueveMensaje", "vDudaTarea", "_nmz", "mezclaDicho", "tareaNombrada", "mensajesMezclados", "arreglaMezcla",
  "clasif236", "esIA", "estadoAgenda", "citas234", "vFecha", "claves235", "semClaves", "vChipClaves", "evidClave", "vClaves", "vAgenda228", "vClipEvid", "evidenciaDe", "vista230", "nombreVisible", "_nomWA", "_telDe", "vPastilla", "canalActual", "modoClaude", "canalesDe", "externosDe", "censoAcomodo", "soloPlatica", "nombreSugerido", "nuevaDesdeMsg", "inicialesDe", "nombreLimpio", "sinEmojiUI", "ico", "chipEncabezado", "integrantesDe", "nombreInt", "quitaEtiquetasWA", "dDif", "soloMeFalta", "completitud", "contextoDe", "contextoPct", "esRecurrente", "fechaCorta", "lineaOrigen", "origenDe", "vChecklist", "tieneChecklist",
  "_notaPriv", "mensajeDicho", "_minus1", "armaMensaje", "resuelveDestino", "borradorMensaje", "pideMensaje", "msjEnCurso", "vBorradorMsj", "srJunta", "srCorte", "srArranca", "vQuienDudas", "_nn"];
var FUNCS = F_FUNCS.concat(B221).concat(NUEVAS).filter(function (x, i, a) { return a.indexOf(x) === i; });
var VARS = F_VARS.concat(["SEG_HORA_DEFECTO", "ESCALA_DIAS", "AVISO_INM_RE", "CHK_EST", "AGENDA_HORA_TODO_DIA", "PALOMEO_MS", "TITULO_CONECTORES", "RITMO_RE", "CITA_RE", "MESES229", "CTX_MIN_PAL", "SINONIMOS", "BUSCA_VACIAS", "REV_DESDE",
  "CNL_COL", "CNL_EXT", "CLAUDE_COL", "MIN225_KEY", "META_VACIAS", "MEZCLA_RE", "MEZCLA_DE_RE", "MSJ_RE", "MSJ_CORTE"]).filter(function (x, i, a) { return a.indexOf(x) === i; });
var codigo = bloque("/* @@CAMPOS-UNICOS-INICIO", "/* @@CAMPOS-UNICOS-FIN */") + "\n" + saca("function", "ctxCampos") + "\n" + bloque("/* @@FECHAS-INICIO", "/* @@FECHAS-FIN */") + "\n" + VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");
var RealDate = Date, NOW = new RealDate(2026, 9, 5, 13, 30, 0).getTime();
function FakeDate() { var a = Array.prototype.slice.call(arguments); if (!(this instanceof FakeDate)) return new RealDate(NOW).toString();
  return a.length ? new (Function.prototype.bind.apply(RealDate, [null].concat(a)))() : new RealDate(NOW); }
FakeDate.prototype = RealDate.prototype; FakeDate.now = function () { return NOW; }; FakeDate.UTC = RealDate.UTC; FakeDate.parse = RealDate.parse;
var GUARDADAS = [], ALMACEN = {};
var c = { Date: FakeDate, console: console, Math: Math, JSON: JSON, String: String, Number: Number, RegExp: RegExp, Array: Array, Object: Object, Intl: Intl, isNaN: isNaN, parseInt: parseInt,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador", jefe: true }, josue: { nombre: "Josué" } }, tareas: [], window: {}, vista: "hilo", abierta: null,
  esc: function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }, ico: function () { return ""; },
  msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx, h: "13:30", ts: NOW }); }, guarda: function (t) { GUARDADAS.push(t.id); }, render: function () {},
  localStorage: { getItem: function (k) { return ALMACEN[k] || null; }, setItem: function (k, v) { ALMACEN[k] = String(v); } },
  setTimeout: function (f) { f(); }, esEjemplo: function () { return false; }, contactosWA: function () { return []; }, soySupervisor: function () { return false; }, hayEquipo: function () { return false; }, posibleDup: function () { return []; },
  estadoReal: function (t) { return t.estado || "abierta"; }, todosLosContactos: function () { return c.CONTACTOS; }, CONTACTOS: [], cargaAgendaWA: function () {}, sincronizaAvisos: function () {},
  hhmm: function () { return "13:30"; }, toast: function () {}, eventoDe: function () { return null; } };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
var H0 = "2026-10-05";
/* forma de tIAMUVF22TRJF leída con el conector (resumida a los campos que usa la vista) */
function LERDO() { return { id: "tIAMUVF22TRJF", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", revisa_ext: "Manuel Parra", indefinida: true, estado: "abierta",
  contexto: "Filtración en recámara/estudio por el baño; azotea con ramas y posible panal; luego impermeabilizar.", por_autorizar: false, en_revision: true, autorizada: false,
  seg_a: { contacto: "Manuel Parra", cada: "lunes, miércoles y viernes", hora: "10:00" }, compartir_con: ["María Eloísa Albores de la Peña (madre)", "Salvador N.S. (padre)", "Luis Mario Necochea (hermano)"],
  checklist: { titulo: "Metas", items: [
    { id: "a", tx: "Azotea: techo limpio, impermeabilizado y panal resuelto", fecha: "2026-10-09", estado: 0 },
    { id: "i", tx: "Interior: cielo pintado", fecha: "2026-10-16", estado: 0 }] },
  msgs: [
    { k: "bo", t: "La abriste dictando: “Para Claus fíjate que tengo en Lerdo una propiedad…”", ts: NOW - 4 * 3600000, h: "10:02" },
    { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: Hablé con Esteban y él mismo con Martín cortarán las ramas, dicen que no se alcanza a apreciar panal", ts: NOW - 9720000, h: "10:48" },
    { k: "bo", hab: 0, t: "Qué bien, pero requiero la confirmación que si hay un panal", ts: NOW - 7740000, h: "11:21" },
    { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: Así es, esta semana yo mando fotos del techo limpio y listo para proceder a los trabajos de impermeabilización", ts: NOW - 7620000, h: "11:23" },
    { k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: Tema 2… Mesa Comedor Alt Brillo. Maribel González está incapacitada… me pasó el teléfono de su carpintero de cocinas… la muestra de la melamina al alto brillo", ts: NOW - 5940000, h: "11:51",
      duda_tarea: { alternativa_id: "tCOMEDOR_NUEVO_300926", alternativa_nombre: "Comedor Nuevo" } }] }; }
function COMEDOR() { return { id: "tCOMEDOR_NUEVO_300926", nombre: "Comedor Nuevo", duenio: "salvador", revisa_ext: "Manuel Parra", estado: "abierta", contexto: "Mesa de comedor nueva con piedra; proveedor Manuel Parra.", msgs: [] }; }
var r;
/* ---------- 6 bug: Autorizar con por_autorizar=false ---------- */
var L = LERDO(); c.tareas = [L, COMEDOR()];
eq("Casa Lerdo con en_revision y por_autorizar=false: ya NO sale como 'falta' (no más Autorizar)", c.tipoRevisar(L), null);
var L2 = LERDO(); delete L2.por_autorizar; eq("sin por_autorizar (como antes) sigue esperando Autorizar", c.tipoRevisar(L2), "falta");
/* ---------- 1 chips ---------- */
var ch = c.chipsTarea(L);
var chips = []; ch.replace(/data-chip="(\w+)"[^>]*>([\s\S]*?)<\/button>/g, function (_, k, tx) { chips.push([k, tx.replace(/<[^>]+>/g, "")]); });
eq("build 234: una fila: Indefinida · Metas n/m · (filtro) · Resumen; sin personas", chips, [["fecha", "Indefinida"], ["metas", "Metas 0/2"], ["detalles", "Resumen"]]);
var F = { id: "fiesta1", nombre: "Fiesta Cumpleaños Papá", duenio: "salvador", f_vigente: "2026-11-13", fecha_dictada: true, estado: "abierta", msgs: [], ritmo: "cada semana", agendado: true,
  contexto: "Comida de cumpleaños de mi papá el 13 de noviembre a partir de las dos de la tarde con la familia y los amigos de siempre en la casa",
  checklist: { titulo: "Invitados", items: [{ id: "1", tx: "Lore y Javier", estado: 2 }, { id: "2", tx: "Néstor", estado: 2 }, { id: "3", tx: "Sada", estado: 1 }, { id: "4", tx: "Lalo", estado: 1 }, { id: "5", tx: "Pollo", estado: 0 }, { id: "6", tx: "Pily", estado: 0 }, { id: "7", tx: "Braña", estado: 0 }, { id: "8", tx: "Vecino", estado: 0 }, { id: "9", tx: "Arq", estado: 0 }] } };
c.fechaMovCorta = function (f) { return { "2026-11-13": "vie 13 nov", "2026-10-09": "vie 9 oct", "2026-10-16": "vie 16 oct" }[f] || f; };
chips = []; c.chipsTarea(F).replace(/data-chip="(\w+)"[^>]*>([\s\S]*?)<\/button>/g, function (_, k, tx) { chips.push([k, tx.replace(/<[^>]+>/g, "")]); });
eq("con lista (234): fecha (con el agendado) · Lista 4/9 · Resumen", chips, [["fecha", "vie 13 nov"], ["lista", "Lista 4/9"], ["detalles", "Resumen"]]);
var FA = { id: "tFA", nombre: "Fiesta", duenio: "salvador", creada_por: "claude", por_autorizar: true, estado: "abierta", tipo_item: "tarea", msgs: [] };   /* 236: ya clasificada */
si("le falta algo: primer chip azul 'Falta N ›'", /^<div class="chips225"><button class="chip225 falta" data-chip="falta">Falta \d ›<\/button>/.test(c.chipsTarea(FA)));
/* ---------- 2 resumen vivo ---------- */
c.hoy = function () { return H0; };
r = c.resumenVivo(L);
eq("resumen vivo: lo que sigue, a quién se espera y lo último (solo con lo que hay)", r.una,
  "Sigue: Azotea · vie 9 oct · Se espera de Manuel Parra · Último: Manuel 11:51 «Tema 2… Mesa Comedor Alt Brillo. Maribel Gonzál…»");
eq("sin nada que decir, no se muestra", c.resumenVivo({ id: "x", nombre: "x", duenio: "salvador", indefinida: true, contexto: "algo que ya tiene contexto suficiente", msgs: [] }).una, "");
eq("build 228: el resumen está plegado en su ficha (no hay bloque fijo)", c.vResumenVivo(L), "");
c.togMin(L.id, "rvab"); si("build 231: ya no hay ficha 'Resumen' ni de personas (viven en el filtro y en Detalles)", !/data-chip="(resumen|personas)"/.test(c.chipsTarea(L)));
eq("y se recuerda (localStorage)", JSON.parse(ALMACEN.doit_min225), { "tIAMUVF22TRJF|rvab": 1 });
c.togMin(L.id, "rvab");
var LA = LERDO(); LA.checklist.items[0].fecha = "2026-10-02";
eq("meta atrasada: en rojo en el resumen", c.resumenVivo(LA).partes.filter(function (p) { return p.rojo; }).map(function (p) { return p.tx; }), ["Azotea: atrasada 3 días"]);
/* ---------- 3 filtro por meta ---------- */
eq("clasificación por palabras de la meta (lo que no encaja: Otro)", L.msgs.map(function (x) { return c.metaDeMsg(L, x); }), ["otro", "a", "a", "a", "otro"]);
var fm = c.vFiltroMeta(L), bot = []; fm.replace(/data-mfil="(\w*)">([^<]*)</g, function (_, k, tx) { bot.push(tx); });
eq("filtro: Todo · Azotea · Interior · Otro", bot, ["Todo", "Azotea", "Interior", "Otro"]);
c.togMin(L.id, "fm"); si("filtro minimizable", /fmb min/.test(c.vFiltroMeta(L))); c.togMin(L.id, "fm");
/* ---------- 4 ficha de meta ---------- */
var fi = c.vFichaMeta(L, "a");
si("ficha: fecha en tiempo SIN rojo", /<span class="k">Fecha<\/span><span class="v">vie 9 oct · en tiempo<\/span>/.test(fi));
si("ficha: se espera de Manuel y evidencia vacía", /Se espera de<\/span><span class="v">Manuel Parra/.test(fi) && /sin fotos aún/.test(fi));
eq("ficha: solo sus mensajes (3)", (fi.match(/class="mfm"/g) || []).length, 3);
si("ficha: sin Aprobar si no hay entrega", !/data-entok/.test(fi));
var LE = LERDO(); LE.checklist.items[0].estado = 1; LE.checklist.items[0].entrega = { fotos: ["data:image/gif;base64,R0lGODlhAQABAAAAACw="] };
var fe = c.vFichaMeta(LE, "a");
si("ficha con entrega: por aprobar, 1 foto, Aprobar / Pedir corrección", /por aprobar/.test(fe) && /1 foto/.test(fe) && /data-entok="a">Aprobar/.test(fe) && /data-entcor="a">Pedir corrección/.test(fe));
si("ficha atrasada: fecha en ROJO", /<span class="v red">vie 2 oct|<span class="v red">2026-10-02 · atrasada 3 días/.test(c.vFichaMeta(LA, "a")));
/* ---------- 5 Detalles en orden ---------- */
var de = c.vDetalles25 ? "" : c.vDetalles(L), tit = []; de.replace(/<h4><i>\d+<\/i>([^<]*)<\/h4>/g, function (_, x) { tit.push(x); });
eq("Detalles: Resumen, Lo que sigue, Metas, Contexto, Seguimiento, Origen (sin Lista ni Falta vacías)", tit,
  ["Resumen vivo", "Lo que sigue · de quién se espera", "Metas", "Contexto", "Seguimiento y con quién se comparte", "Origen"]);
si("Origen plegado con 'Creada con'", /Creada con/.test(de) && /data-orig225/.test(de) && !/class="dquote"/.test(de));
var tit2 = []; c.vDetalles(FA).replace(/<h4><i>\d+<\/i>([^<]*)<\/h4>/g, function (_, x) { tit2.push(x); });
si("build 231: Detalles en orden fijo; lo que falta va en su ficha 'Falta' (no se repite)", tit2.indexOf("Falta por poner") < 0);
/* ---------- 6 sin botón verde gigante ---------- */
eq("cosas para ti: la duda de tarea del 11:51", c.cosasParaTi(L), 1);
si("build 228: sin la pastilla '1 cosa para ti'; la ficha Todo va en la fila", !/paraTi225/.test(c.chipsTarea(L)) && /id="cnlpill"/.test(c.chipsTarea(L)));
si("vFaltaInfo ya no trae el botón verde gigante", !/class="autbtn"/.test(html.slice(html.indexOf("function vFaltaInfo("), html.indexOf("function vDatoCuerpo("))));
/* ---------- 7 mensaje mal acomodado ---------- */
var bd = c.vDudaTarea(L, L.msgs[4], 4);
si("burbuja con duda (242): debajo del globo ya no va nada; OK · Mover · Nueva · Dato viven en la hoja del globo", bd === "" && /function abreDetalle\(t, ix\)/.test(html) && /botonesG\(ix, \[ix\], " hj242"\)/.test(html));
var LM = LERDO(), CM = COMEDOR(); c.tareas = [LM, CM, { id: "tOtra", nombre: "Fideicomiso", duenio: "salvador", msgs: [] }];
eq("Mover: primero las del mismo contacto", c.tareasParaMover(LM, LM.msgs[4]).map(function (o) { return [o.d.id, o.mismo]; }), [["tCOMEDOR_NUEVO_300926", true], ["tOtra", false]]);
GUARDADAS.length = 0; r = c.mueveMensaje(LM, 4, "tCOMEDOR_NUEVO_300926");
var dst = CM.msgs[0];
eq("Mover: en el origen queda OCULTO (no borrado)", [LM.msgs.length, LM.msgs[4].oculto, LM.msgs[4].movido_a.id, LM.msgs[4].duda_resuelta], [5, true, "tCOMEDOR_NUEVO_300926", "otra"]);
eq("Mover: en el destino 'Movido desde <origen>: <texto>' marcado NUEVO", [dst.t.indexOf("Movido desde Mantenimiento Casa Lerdo/Eloísa: Manuel Parra: Tema 2…"), dst.nuevo_mov, dst.movido_de.id, dst.wa_c], [0, 1, "tIAMUVF22TRJF", "Manuel Parra"]);
eq("se guardan las dos tareas", GUARDADAS, ["tIAMUVF22TRJF", "tCOMEDOR_NUEVO_300926"]);
eq("lo oculto ya no cuenta ni sale en el resumen", [c.cosasParaTi(LM), c.resumenVivo(LM).una.indexOf("Comedor") < 0], [0, true]);
si("el hilo no pinta lo oculto y marca NUEVO lo movido", /if\(x && x\.oculto\) return;/.test(html) && /NUEVO · movido desde/.test(html));
si("dejar presionado: 'Mover a otra tarea' en el menú", /_ops\.push\(\["Mover a otra tarea",function\(\)\{ abreMover\(t, ix\); \}\]\)/.test(html));
/* ---------- 8 "me mezclaste": mueve, nunca toca metas ---------- */
eq("frases de mezcla", ["me mezclaste", "esto es de otra tarea", "Oye, este mensaje no es de esta tarea", "esto es del comedor", "esto es de la fiesta", "ponle un mensaje a Fernando", "ya quedó el techo"].map(function (v) { return c.mezclaDicho(v, LERDO()); }),
  [true, true, true, true, false, false, false]);
var LX = LERDO(), CX = COMEDOR(); c.tareas = [LX, CX]; var metasAntes = JSON.stringify(LX.checklist);
r = c.arreglaMezcla(LX, "me mezclaste, esto es del comedor");
eq("'me mezclaste…del comedor': mueve el de la duda al Comedor y no toca las metas", [r.movidos, r.dest, CX.msgs.length, JSON.stringify(LX.checklist) === metasAntes, LX.msgs.slice(-1)[0].t],
  [1, "tCOMEDOR_NUEVO_300926", 1, true, "Moví 1 mensaje a “Comedor Nuevo”. Aquí quedan ocultos, no borrados; no toqué las metas ni la lista."]);
var LY = LERDO(); delete LY.msgs[4].duda_tarea; c.tareas = [LY, COMEDOR(), { id: "tF2", nombre: "Fiesta Papá", msgs: [] }];
r = c.arreglaMezcla(LY, "me mezclaste esto");
eq("sin decir a cuál: pregunta con la lista (el último que llegó), sin tocar nada", [r.movidos, r.pregunta, LY.msgs[4].oculto || false], [0, 4, false]);
si("en el hilo la mezcla se atiende ANTES de checklist/Claude", html.indexOf("if(mezclaDicho(v, t))") > 0 && html.indexOf("if(mezclaDicho(v, t))") < html.indexOf("var _ck=checklistDicho(t, v);"));
/* ---------- 9 dictado ---------- */
c.window.__dicho = ""; c.window.__parcial = ""; c.srArranca();
function ev(i0, arr) { return { resultIndex: i0, results: arr.map(function (a) { var r = [{ transcript: a[0] }]; r.isFinal = a[1]; return r; }) }; }
c.srJunta(ev(0, [["Por favor, ponle un mensaje a Fernando", true]]));
c.srJunta(ev(1, [["Por favor, ponle un mensaje a Fernando", true], ["para ver si ya tiene", false]]));
c.srCorte();   /* iPhone cierra el motor tras la pausa: lo que iba a medias se queda */
c.srJunta(ev(0, [["el fideicomiso actualizado conforme a lo que vimos en la última reunión", false]]));
eq("(b) tras la pausa no se pierde nada (antes quedaba solo 'ponle un mensaje a Fernando')", (c.window.__dicho + c.window.__parcial).trim(),
  "Por favor, ponle un mensaje a Fernando para ver si ya tiene el fideicomiso actualizado conforme a lo que vimos en la última reunión");
c.srArranca(); c.window.__dicho = ""; c.window.__parcial = ""; c.srArranca();
c.srJunta(ev(0, [["hola", true]])); c.srJunta(ev(0, [["hola", true]])); c.srJunta(ev(0, [["hola", true], ["Manuel", true]]));
eq("Safari que reenvía lo mismo no lo repite", c.window.__dicho.trim(), "hola Manuel");
var cssDt = (html.match(/\.dictacapa \.dtxt\{[^}]*max-height:(\d+)px/) || [])[1];
eq("(a) la caja del dictado crece hasta 3 renglones (22px c/u + relleno) y baja sola al final", [cssDt, /c\.scrollTop=c\.scrollHeight;\s*\n\s*try\{ requestAnimationFrame/.test(html)], ["78", true]);
var md = c.mensajeDicho("Por favor, ponle un mensaje a Fernando para ver si ya tiene el fideicomiso actualizado conforme a lo que vimos en la última reunión");
eq("(c) 'ponle un mensaje a Fernando para…' -> a quién y el resto", [md.quien, md.cuerpo], ["Fernando", "para ver si ya tiene el fideicomiso actualizado conforme a lo que vimos en la última reunión"]);
eq("(c) arma el borrador (no pregunta '¿qué le digo?')", c.armaMensaje(md.cuerpo, "Fernando", false), "Hola Fernando, ¿ya tiene el fideicomiso actualizado conforme a lo que vimos en la última reunión?");
var FID = { id: "t1790622121475", nombre: "Fideicomiso: seguimiento con BBVA", duenio: "salvador", estado: "abierta", msgs: [] };
c.CONTACTOS = [{ id: "ext:Fer Peñaloza", nombre: "Fer Peñaloza", sub: "WhatsApp" }, { id: "ext:Fernando Martinez Smith", nombre: "Fernando Martinez Smith", sub: "WhatsApp" }];
c.tareas = [FID]; c.pideMensaje(FID, "Por favor, ponle un mensaje a Fernando para ver si ya tiene el fideicomiso actualizado conforme a lo que vimos en la última reunión", md);
eq("(d) dos Fernando: tarjeta '¿Quién es Fernando?' con los dos", [FID.quien_dudas.length, FID.quien_dudas[0].rol, FID.quien_dudas[0].cands.map(function (x) { return x.nombre; }).sort()], [1, "mensaje", ["Fer Peñaloza", "Fernando Martinez Smith"]]);
eq("(e) lo dictado y la respuesta quedan en la tarea", FID.msgs.map(function (x) { return [x.k, x.t.slice(0, 32)]; }), [["bo", "Por favor, ponle un mensaje a Fe"], ["bi", "¿Quién es Fernando? Te dejé las "]]);
c.resuelveDudaPersona(FID, FID.quien_dudas[0].id, { id: "ext:Fernando Martinez Smith", nombre: "Fernando Martinez Smith" });
eq("al escoger: borrador para confirmar", [FID.msj_borrador && FID.msj_borrador.texto, FID.msj_borrador && FID.msj_borrador.contacto], ["Hola Fernando, ¿ya tiene el fideicomiso actualizado conforme a lo que vimos en la última reunión?", "Fernando Martinez Smith"]);
si("la tarjeta trae Mandar / Cambiar / No mandar", /data-mbact="manda">Mandar<\/button><button class="dmk" data-mbact="cambia">Cambiar<\/button><button class="dmk" data-mbact="no">No mandar/.test(c.vBorradorMsj(FID)));
/* ---------- hojas ---------- */
c.window.__hoja225 = null; c.abreHoja(L, "metas"); var hm = c.vHoja(L);
si("hoja Metas (232): Todo + un renglón por meta que filtra el chat (› abre su ficha) + Otro", /data-mfil="">.*Todo/.test(hm) && /data-mfil="a"><span>Azotea<\/span><small class="">vie 9 oct<\/small>/.test(hm) && /data-fmeta="a"/.test(hm) && /data-mfil="otro"/.test(hm) && /Cumplidas \(historial\)/.test(hm));
c.abreHoja(F, "lista"); var hl = c.vHoja(F);
si("hoja Lista a media altura, ampliable a completa, con la lista abierta", /class="h225 media"/.test(hl) && /data-h225alto="completa"/.test(hl) && /class="plst"/.test(hl));
c.window.__hoja225.alto = "min"; si("hoja minimizada: una barrita", /^<button class="h225bar" data-h225alto="media">Invitados ▴<\/button>$/.test(c.vHoja(F)));
si("versión 225 o mayor", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 225);
/* ---------- render real en el navegador ---------- */
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  var css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || "";
  var tmp = path.join(os.tmpdir(), "b225-" + process.pid + ".html");
  fs.writeFileSync(tmp, '<!doctype html><meta charset="utf-8"><style>' + css + '</style><body style="background:#000;color:#f5f5f7;font-family:-apple-system,sans-serif;margin:0;width:390px"><div id="m"></div></body>');
  try { await p.goto("file://" + tmp);
    c.togMin("tIAMUVF22TRJF", "rvab"); var hh = c.chipsTarea(LERDO()) + c.vResumenVivo(LERDO()) + c.vFiltroMeta(LERDO()); c.togMin("tIAMUVF22TRJF", "rvab");
    var o = await p.evaluate(function (h) { var m = document.getElementById("m"); m.innerHTML = '<div style="display:flex;flex-direction:column">' + h + '</div>';
      var ch = m.querySelectorAll(".chip225"), tops = Array.prototype.map.call(ch, function (x) { return Math.round(x.getBoundingClientRect().top); });
      return { unaLinea: tops.every(function (y) { return y === tops[0]; }), rv: !!m.querySelector(".rv228 .rvt"), fm: m.querySelectorAll(".fm225 .fmb").length }; }, hh);
    eq("en pantalla: chips en una sola línea, resumen y filtro", o, { unaLinea: true, rv: true, fm: 4 });
    c.window.__hoja225 = null; c.abreHoja(LERDO(), "detalles");
    await p.evaluate(function (h) { document.getElementById("m").innerHTML = h; }, c.chipsTarea(LERDO()) + c.vHoja(LERDO()));
    await p.screenshot({ path: path.join(os.tmpdir(), "b225-detalles.png") });
    eq("sin errores de página", errs, []);
  } finally { await b.close(); try { fs.unlinkSync(tmp); } catch (e) {} }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
