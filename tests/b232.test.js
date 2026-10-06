#!/usr/bin/env node
/* PRUEBAS build 232: sin restos viejos. El filtro por meta (fila "Todo · Azotea · Interior · Otro" del 225) vive en la hoja de la ficha
   "Metas n/m": tocar una meta filtra el chat y la ficha dice "Azotea ⌄"; "Todo" la regresa. Sin el selector "Importante | Todo" (Importante
   vive en el filtro). Título con fuente del sistema (-apple-system, SF Pro, Inter de respaldo). Ninguna fila/control viejo (219–226) en tarea
   con metas, con checklist, tarea nueva, dato y supervisor. App completa sin red, 390 px. Correr: node tests/b232.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 232", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 232, true);
eq("ninguna font-family sin respaldo del sistema", (html.match(/font-family:(Archivo|Barlow);/g) || []).length, 0);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { if (!/firebase is not defined/.test(e.message)) errs.push(e.message); });
  await p.route(/^https?:/, function (r) { r.abort(); });
  await p.addInitScript(function () { var P = function () { return Promise.resolve(); };   /* firebase sin red: solo lo que se llama al arrancar */
    var fs0 = { enablePersistence: P, collection: function () { return { doc: function () { return { set: P, get: P, delete: P, onSnapshot: function () {} }; }, where: function () { return this; }, onSnapshot: function () {}, get: P }; } };
    window.firebase = { apps: [1], initializeApp: function () {}, firestore: function () { return fs0; }, auth: function () { return { onAuthStateChanged: function () {}, signOut: P }; } }; window.firebase.auth.GoogleAuthProvider = function () {}; });
  try {
    await p.goto("file://" + path.join(__dirname, "..", "index.html")); await p.waitForTimeout(600);
    var r = await p.evaluate(function () {
      yo = "salvador"; if (!PERSONAS.salvador) PERSONAS.salvador = { nombre: "Salvador", jefe: true };
      var o = {};
  window.AGENDA_WA=[]; var NOW=Date.now();
  var LERDO={id:"tIAMUVF22TRJF",nombre:"Mantenimiento Casa Lerdo/Eloísa",duenio:"salvador",revisa_ext:"Manuel Parra",indefinida:true,estado:"abierta",por_autorizar:false,
    contexto:"Filtración en recámara/estudio por el baño; azotea con ramas y posible panal; luego impermeabilizar.",
    seg_a:{contacto:"Manuel Parra",cada:"lunes, miércoles y viernes",hora:"10:00"},compartir_con:["María Eloísa Albores de la Peña (madre)","Salvador N.S. (padre)","Luis Mario Necochea (hermano)"],
    evidencia:[{tipo:"texto",fuente:"whatsapp",titulo:"Manuel: fotos del techo esta semana",fecha:"2026-10-05",de:"Manuel Parra",texto:"Así es, esta semana yo mando fotos del techo limpio"}],
    resumen:{texto:"Esteban y Martín cortan ramas; Manuel manda fotos del techo esta semana para confirmar si hay panal.",acuerdos:[{t:"Ya no se pide control de plagas por ahora",fecha:"2026-10-05"},{t:"Manuel manda fotos del techo limpio",fecha:"2026-10-05",de:"Manuel"}],pendientes:[{t:"Confirmar si hay panal",de:"Manuel"},{t:"Costo del material y quién compra"}],actualizado:NOW-15*60000},
    checklist:{titulo:"Metas",items:[{id:"a",tx:"Azotea: techo limpio, impermeabilizado y panal resuelto",fecha:"2026-10-09",estado:0},{id:"i",tx:"Interior: cielo pintado",fecha:"2026-10-16",estado:0},{id:"f",tx:"Focos: todos funcionando",fecha:"2026-10-03",estado:2,cumplida:"2026-10-03"}]},
    msgs:[{k:"bo",de:"salvador",t:"La abriste dictando: “Para Claus fíjate que tengo en Lerdo una propiedad…”",ts:NOW-4*3600000,h:"10:02"},
      {k:"bi",wa_in:1,wa_c:"Manuel Parra",t:"Manuel Parra: Así es, esta semana yo mando fotos del techo limpio y listo para proceder a los trabajos de impermeabilización",ts:NOW-7620000,h:"11:23"}]};
  var FIESTA={id:"tFIESTA",nombre:"Fiesta Cumpleaños Papá",duenio:"salvador",estado:"abierta",f_vigente:"2026-11-13",fecha_dictada:true,agendado:true,gcal_id:"evt1",avisos:[{id:"a1",fecha:"2026-11-13",hora:"14:00"}],
    evento:{titulo:"Comida cumpleaños",fecha:"2026-11-13",hora:"14:00",lugar:"Casa"},contexto:"Comida de cumpleaños de mi papá el 13 de noviembre a partir de las dos de la tarde con la familia y amigos en la casa",ritmo:"cada semana",
    checklist:{titulo:"Invitados",items:[{id:"1",tx:"Lore y Javier",estado:2},{id:"2",tx:"Pollo",estado:0},{id:"3",tx:"Sada",estado:1},{id:"4",tx:"Néstor",estado:2}]},
    msgs:[{k:"bi",wa_in:1,wa_c:"Eduardo Madero",t:"Eduardo Madero: Ahí estaremos",ts:NOW-8e6,h:"09:40"},{k:"bi",wa_in:1,wa_c:"Arturo Tijerina",t:"Arturo Tijerina: Fecha separada",ts:NOW-7e6,h:"10:10"},{k:"bi",wa_in:1,wa_c:"86088425201884",t:"86088425201884: Gracias por la invitación",ts:NOW-6e6,h:"11:00"}]};
  var LOTE={id:"tIALOTE1",nombre:"Limpieza Lote Samuel",duenio:"salvador",creada_por:"ia_revisor",por_autorizar:true,estado:"abierta",msgs:[{k:"bi",wa_in:1,wa_c:"Samuel Gamez ciper",t:"Samuel Gamez ciper: Ya quedó la limpieza del lote, mañana te mando fotos",ts:NOW-3e6,h:"16:20"}]};
  var DATO={id:"tDATO1",nombre:"Precio barda Cumbres",duenio:"salvador",es_dato:true,tipo_item:"dato",estado:"abierta",datos_corregidos:[{t:"6.5 m lineales a $2,800 el metro; total $18,200 más IVA",ts:NOW-1e6}],msgs:[{k:"bi",wa_in:1,wa_c:"Herrería López",t:"Herrería López: Le paso el precio de la barda",ts:NOW-2e6,h:"15:00"}]};
      function abre(T) { window.__vf230 = {}; window.__cnlClaude = {}; window.__cnl = {}; window.__mfil225 = {}; window.__hoja225 = null; tareas = [T]; abierta = T.id; vista = "hilo"; render(); [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && !/cnl/.test(x.className)) x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      function txt(sel) { return [].map.call(document.querySelectorAll(sel), function (x) { return x.textContent.replace(/\s+/g, " ").trim(); }); }
      var VIEJOS = ".fm225,.cmodo,.cnlwrap,#cnlclaude,#intbtn,.paraTi225,.agst,.rv225,.rvrow227,.rv228,.hrow,.compc,.typep,.supsec,[data-chip=personas],[data-chip=resumen]";
      function limpio() { return document.querySelectorAll(VIEJOS).length; }
      var L = JSON.parse(JSON.stringify(LERDO)); L.msgs.push({ k: "bi", wa_in: 1, wa_c: "Manuel Parra", t: "Manuel Parra: el cielo del interior lo pintamos con un galón de Berel", ts: Date.now() - 1e6, h: "12:00" });
      abre(L); o.lerdo = [txt(".chips225 > button"), limpio(), document.querySelectorAll(".msgs [data-mix]").length];
      document.querySelector('.chips225 [data-chip="metas"]').click(); o.hoja = txt(".h225 .mf232 .mfb");
      o.fichaMeta = !!document.querySelector('.h225 [data-fmeta="a"]');
      document.querySelector('.h225 [data-mfil="a"]').click();
      o.filtrado = [txt(".chips225 > button")[1], !!document.querySelector(".h225"), txt(".msgs [data-mix]").map(function (x) { return /techo/.test(x); })];
      document.querySelector('.chips225 [data-chip="metas"]').click(); document.querySelector('.h225 [data-mfil=""]').click(); o.todo = [txt(".chips225 > button")[1], document.querySelectorAll(".msgs [data-mix]").length];
      var tt = getComputedStyle(document.querySelector(".top .t")); o.font = tt.fontFamily.split(",")[0].replace(/"/g, "").trim();
      abre(FIESTA); o.fiesta = [txt(".chips225 > button"), limpio()];
      abre(LOTE); o.nueva = [txt(".typep229 button"), limpio()];
      abre(DATO); o.dato = limpio();
      return o; });
    eq("Casa Lerdo: una sola fila, sin la fila de filtro por meta ni 'Importante | Todo'", r.lerdo, [["Indefinida", "Metas 1/3", "Manuel", "Resumen"], 0, 2]);
    eq("hoja de Metas: Todo · cada meta · Otro (con › a la ficha)", [r.hoja, r.fichaMeta], [["Todotodo el chat", "Azoteavie 9 oct", "Interiorvie 16 oct", "Otrolo que no es de ninguna meta"], true]);
    eq("tocar Azotea: filtra el chat, cierra la hoja y la ficha dice 'Azotea'", r.filtrado, ["Azotea", false, [true]]);
    eq("'Todo' lo regresa", r.todo, ["Metas 1/3", 2]);
    eq("título con la fuente del sistema", r.font, "-apple-system");
    eq("Fiesta con checklist: limpia", r.fiesta, [["vie 13 nov", "Lista 3/4", "Todo", "Resumen"], 0]);
    eq("tarea nueva: Tarea · Dato · Vincular y nada viejo", r.nueva, [["Tarea", "Dato", "Vincular"], 0]);
    eq("dato: nada viejo", r.dato, 0);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
