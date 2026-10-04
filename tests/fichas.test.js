#!/usr/bin/env node
/* PRUEBAS build 195 (maqueta "Fichas limpias", aprobada 2026-10-04 11:14): chip del
   encabezado, subtitulo, completitud (Tarea vs Dato, minimo de contexto), desglose del texto
   real de la barda (tBARDA_MANUEL_031026) y sinonimos en la busqueda. Correr:
   TZ=America/Monterrey node tests/fichas.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var lineas = html.split("\n");
function saca(tipo, nombre) {
  var re = tipo === "function" ? new RegExp("^function " + nombre.replace(/\$/g, "\\$") + "\\(") : new RegExp("^var " + nombre + "\\s*=");
  var ini = -1;
  for (var i = 0; i < lineas.length; i++) if (re.test(lineas[i])) ini = i;
  if (ini < 0) throw new Error("no encontre " + tipo + " " + nombre);
  var out = [lineas[ini]];
  for (var k = ini + 1; k < lineas.length; k++) {
    var L = lineas[k];
    if (L.length && !/^[\s}\]]/.test(L)) break;
    out.push(L);
    if (/^}/.test(L)) break;
  }
  return out.join("\n");
}
var FUNCS = ["iso", "dDif", "hoy", "fechaMovCorta", "esRecurrente", "msCreacion", "_bw", "_bst", "_bpega", "palabrasBusqueda",
  "camposBusqueda", "_snip", "buscaTodo", "_sinGrupo", "mismoSentido", "esDato", "tipoItem", "_primerNombre", "juntaNombres",
  "subtituloTarea", "chipEncabezado", "creadaCon", "palabrasClave", "contextoPct", "completitud", "faltaPrimero", "_monto",
  "_limpiaEtiqueta", "parseDesglose", "fmtMonto", "tipoDicho", "_nn", "contextoDe", "fechaPuestaSola", "_diaCreacion", "_fechaDeId"];
var VARS = ["BUSCA_VACIAS", "CTX_MIN_PAL", "SINONIMOS"];
var codigo = VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" + FUNCS.map(function (f) { return saca("function", f); }).join("\n");

var c = { console: console, JSON: JSON, String: String, Number: Number, Math: Math, Date: Date, Array: Array, Object: Object, RegExp: RegExp,
  yo: "salvador", PERSONAS: { salvador: { nombre: "Salvador" }, samuel: { nombre: "Samuel" } }, esEjemplo: function () { return false; },
  contactosWA: function (t) { return t._cw || []; },
  integrantesDe: function (t) { return t._ints || [{ k: t.duenio }]; },
  nombreInt: function (k) { return String(k).indexOf("ext:") === 0 ? String(k).slice(4) : ((c.PERSONAS[k] || {}).nombre || k); },
  tareas: [] };
vm.createContext(c); vm.runInContext(codigo, c);
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }

/* ---------- 1 chip del encabezado ---------- */
eq("finiquito", c.chipEncabezado({ f_vigente: "2026-11-02" }), { cls: "", ico: "cal", txt: "Finiquito: lun 2 nov" });
eq("indefinida", c.chipEncabezado({ indefinida: true, f_vigente: "2026-10-07" }), { cls: "ind", ico: "recur", txt: "Indefinida · próx. mié 7 oct" });
eq("recurrente semanal = indefinida azul", c.chipEncabezado({ periodicidad: "semanal", f_vigente: "2026-10-07" }).cls, "ind");
eq("indefinida sin proxima", c.chipEncabezado({ indefinida: true }).txt, "Indefinida");
eq("sin fecha", c.chipEncabezado({}), { cls: "sin", ico: "cal", txt: "Sin fecha de finiquito" });
eq("dato: fecha de cuando llego, no de cuando se capturo", c.chipEncabezado({ es_dato: true, datos_corregidos: [{ t: "x", ts: new Date(2026, 9, 4, 1, 0).getTime() }], msgs: [{ k: "bi", wa_c: "Manuel Parra", origen: "wa_saliente", t: "a", ts: new Date(2026, 9, 3, 13, 40).getTime() }] }), { cls: "dato", ico: "dato", txt: "Dato · 3 oct" });

/* ---------- subtitulo ---------- */
eq("Tuya · con Chuy y Pato", c.subtituloTarea({ duenio: "salvador", _ints: [{ k: "salvador" }, { k: "ext:Chuy Cumbres Zatarain" }, { k: "ext:Pato Cumbres" }] }), "Tuya · con Chuy y Pato");
eq("Tuya sola", c.subtituloTarea({ duenio: "salvador", _ints: [{ k: "salvador" }] }), "Tuya");
eq("De Samuel · con Salvador no se dice (soy yo)", c.subtituloTarea({ duenio: "samuel", _ints: [{ k: "samuel" }, { k: "salvador" }] }), "De Samuel");
eq("Dato · de Manuel Parra", c.subtituloTarea({ es_dato: true, duenio: "salvador", _ints: [{ k: "salvador" }, { k: "ext:Manuel Parra" }] }), "Dato · de Manuel Parra");

/* ---------- 3 completitud ---------- */
var CTX18 = "Arreglos del fraccionamiento con Samuel: bomba, focos de jardineras, fuentes, fotocelda del alumbrado y escombro en terrenos baldíos del fraccionamiento";
eq("contexto vacio = 0%", c.contextoPct({}), 0);
eq("contexto 9 palabras = 38%", c.contextoPct({ contexto: "uno dos tres cuatro cinco seis siete ocho nueve" }), 38);
eq("contexto 18+ palabras pasa la rayita (>=75)", c.contextoPct({ contexto: CTX18 }) >= 75, true);
var tA = { duenio: "samuel", contexto: CTX18 };
var cA = c.completitud(tA);
eq("tarea: quien ✓, finiquito ○, seguimiento ○", cA.items.map(function (x) { return [x.k, x.ok]; }), [["quien", true], ["finiquito", false], ["seguimiento", false]]);
eq("tarea: 1 de 3 y no completa", [cA.hechos, cA.completa, cA.tipo], [1, false, "tarea"]);
eq("tarea: lo primero que falta = finiquito (azul)", c.faltaPrimero(cA).txt, "falta finiquito");
var tB = { duenio: "samuel", contexto: CTX18, indefinida: true, f_vigente: "2026-10-12" };
eq("tarea indefinida con proxima = completa", c.completitud(tB).completa, true);
var tC = { duenio: "salvador", contexto: "pago predial", f_vigente: "2026-10-30", avisos: [{ fecha: "2026-10-28" }] };
var cC = c.completitud(tC);
eq("tarea con todo menos contexto: no completa, falta contexto (verde)", [cC.completa, c.faltaPrimero(cC)], [false, { txt: "falta contexto", col: "#30d158" }]);
eq("falta_fecha no cuenta como finiquito", c.completitud({ duenio: "salvador", f_vigente: "2026-10-04", falta_fecha: true }).items[1].ok, false);
var tD = { tipo_item: "dato", nombre: "Costo barda Cumbres", contexto: CTX18, _cw: [{ nombre: "Manuel Parra" }], datos_corregidos: [{ t: "TOTAL $110,982.00" }] };
var cD = c.completitud(tD);
eq("dato: que/de/cifras ✓ y completo", [cD.tipo, cD.items.map(function (x) { return x.ok; }), cD.completa], ["dato", [true, true, true], true]);
eq("dato sin cifras ni de quien", c.completitud({ tipo_item: "dato", nombre: "WhatsApp: 1206", contexto: CTX18 }).items.map(function (x) { return x.ok; }), [false, false, false]);
eq("tipo preseleccionado: cifras sin fecha = dato", c.tipoItem({ datos_corregidos: [{ t: "$2,025.00" }] }), "dato");
eq("tipo preseleccionado: normal = tarea", c.tipoItem({ f_vigente: "2026-10-05" }), "tarea");
eq("lo dicho manda sobre lo adivinado", c.tipoItem({ tipo_item: "tarea", datos_corregidos: [{ t: "$2,025.00" }] }), "tarea");
eq("voz: 'es dato'", c.tipoDicho("es dato"), "dato");
eq("voz: 'no, es información'", c.tipoDicho("no, es información"), "dato");
eq("voz: 'es tarea'", c.tipoDicho("Es una tarea"), "tarea");
eq("voz: otra cosa", c.tipoDicho("el dato del portón está mal"), "");

/* ---------- 4 desglose del texto real de la barda ---------- */
var BARDA = "COSTO BARDA (foto de Manuel Parra, WhatsApp 3-oct 13:40, 'Bardeado terreno baldío Cumbres', frente 30.00 mL), monto pagado: Muro de Durock 2.40 m alto x 26.00 mL $58,500.00 · Portón 4.00 m con camino de concreto para rueda y poste PTR $20,237.00 · Estuco muro y portón $11,720.00 · Pintura muro y portón $9,500.00 · 6 sicomoros $9,000.00 · Grava triturada 3/4\" $2,025.00 · TOTAL $110,982.00 · Costo promedio por mL fachada terminada $3,699.40. Fuente: https://doit.ok-doit.com/uploads/wa_media/sin_tarea/20261003_134058_89de9d.jpeg";
var D = c.parseDesglose(BARDA);
eq("total", D.total, 110982);
eq("por metro lineal", D.porML, 3699.4);
eq("montos del desglose", D.items.map(function (x) { return x.monto; }), [58500, 20237, 11720, 9500, 9000, 2025]);
eq("etiquetas sin medidas", D.items.map(function (x) { return x.tx; }), ["Muro de Durock", "Portón", "Estuco muro y portón", "Pintura muro y portón", "6 sicomoros", "Grava triturada 3/4\""]);
eq("los renglones suman el total (el total viene del texto, no se calcula)", D.items.reduce(function (a, x) { return a + x.monto; }, 0), 110982);
eq("formato", [c.fmtMonto(110982, true), c.fmtMonto(3699.4, true), c.fmtMonto(58500, false)], ["$110,982.00", "$3,699.40", "$58,500"]);
eq("sin TOTAL en el texto no se inventa", c.parseDesglose("Muro $100 · Puerta $50").total, null);
eq("texto sin montos", c.parseDesglose("nada aqui").items.length, 0);

/* ---------- 7 sinonimos ---------- */
var T = [{ id: "tBARDA_MANUEL_031026", nombre: "Barda Manuel Parra", cierre: { tipo: "no_ejecutada" }, datos_corregidos: [{ t: BARDA }], msgs: [] },
  { id: "x", nombre: "Pago predial Apeninos", msgs: [] }];
eq("'muro' encuentra la barda", c.buscaTodo("muro", T).map(function (x) { return x.t.id; }), ["tBARDA_MANUEL_031026"]);
eq("'tapia' encuentra la barda", c.buscaTodo("tapia", T)[0].t.id, "tBARDA_MANUEL_031026");
eq("'precio puerta' encuentra la barda (costo/portón)", c.buscaTodo("precio puerta", T)[0].t.id, "tBARDA_MANUEL_031026");
eq("'cotización cerca' encuentra la barda", c.buscaTodo("cotización cerca", T)[0].t.id, "tBARDA_MANUEL_031026");
eq("'residencia' no encuentra la barda", c.buscaTodo("residencia", T).length, 0);
si("plurales: 'muros' = 'muro'", c.mismoSentido("muros", "barda"));
eq("palabras clave con sinonimo", c.palabrasClave({ nombre: "Barda Manuel Parra" }).slice(0, 2), ["barda", "muro"]);

/* ---------- creada con ---------- */
eq("creada con: dictado", c.creadaCon({ msgs: [{ k: "bi", t: "La abriste dictando: “Comprar focos para la fuente”. Se cierra con: foto", ts: 5 }] }), { texto: "Comprar focos para la fuente", ts: 5, quien: "Dictado tuyo", foto: "" });
eq("creada con: foto de WhatsApp", c.creadaCon({ msgs: [{ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel: [foto]", tipo: "foto", url: "https://x/f.jpg", ts: 7 }] }), { texto: "[foto]", ts: 7, quien: "WhatsApp de Manuel Parra", foto: "https://x/f.jpg" });

/* ---------- en el codigo ---------- */
si("sin la tira de resumen bajo el encabezado", html.indexOf('<span class="rsm2">') < 0);
si("Resumen/Se cierra con fuera del chat", /Resumen:\|Se cierra con:\|La abriste dictando:/.test(html));
si("Falta info: lo nuevo se llena ANTES de cualquier canal (nunca sale por WhatsApp)", html.indexOf('if(tipoRevisar(t)==="falta"){') < html.indexOf("var _cnA=canalActual(t)"));
si("completar = misma palomita sin Deshacer", /sinDeshacer:true/.test(html) && /if\(!o\.sinDeshacer\) muestraDeshacer/.test(html));
si("datos sin campana/Ya está/bote", /t\.duenio===yo && !esDato\(t\)\)\{/.test(html));
si("tipoRevisar ya no regresa 'autorizar'", !/return "autorizar";/.test(saca("function", "tipoRevisar")));
si("iconos de la maqueta", /cal:'<rect x="3\.5" y="5"/.test(html) && /recur:'/.test(html) && /dato:'/.test(html) && /chk:'/.test(html));

var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
eq("el script de index.html compila", okc, true);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
