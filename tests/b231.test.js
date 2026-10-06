#!/usr/bin/env node
/* PRUEBAS build 231 (Salvador 17:00): UNA sola fila más compacta: fecha o Indefinida · Metas/Lista n/m · Agendado (si hay evento) · Filtro ⌄ ·
   Detalles (ⓘ). Sin ficha de personas (los integrantes viven en la hoja del filtro, que termina en "Invitar a nuevo miembro") ni ficha
   "Resumen" (vive en Importante y en Detalles). Detalles en orden fijo y numerado: 1 Resumen vivo (campo resumen: texto, acuerdos con
   palomita, Falta) · 2 Lo que sigue · 3 Metas · 4 Contexto (con clip) · 5 Seguimiento · 6 Origen; con minimizar y cerrar.
   App completa sin red, 390 px. Correr: node tests/b231.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión 231 o mayor", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 231, true);
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
      function abre(T) { window.__vf230 = {}; window.__cnlClaude = {}; window.__cnl = {}; window.__hoja225 = null; tareas = [T]; abierta = T.id; vista = "hilo"; render(); [].forEach.call(document.body.children, function (x) { if (x.id !== "app" && !/cnl/.test(x.className)) x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      function txt(sel) { return [].map.call(document.querySelectorAll(sel), function (x) { return x.textContent.replace(/\s+/g, " ").trim(); }); }
      function fila() { var bs = document.querySelectorAll(".chips225 > button"), r = [].map.call(bs, function (x) { var q = x.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.right)]; }); return [txt(".chips225 > button"), r.every(function (x) { return x[0] === r[0][0]; }), r[r.length - 1][1] <= 390, document.querySelectorAll('.chips225 [data-chip="personas"], .chips225 [data-chip="resumen"]').length]; }
      abre(FIESTA); o.fiesta = fila(); o.detIcon = [document.querySelector('.chips225 [data-chip="detalles"]').textContent];
      abre(LERDO); o.lerdo = fila();
      abre(FIESTA); document.getElementById("cnlpill").click(); o.hoja = txt(".fil227h [data-fil]").map(function (x) { return x.replace(/^(EM|AT|CS)/, ""); });
      var inv = document.querySelector('.fil227h [data-fil="__int"]'); o.invita = !!inv; document.querySelector(".cnlbg").click();
      abre(LERDO); document.querySelector('.chips225 [data-chip="detalles"]').click();
      var h = document.querySelector(".h225"); o.det = txt(".h225 .d225b h4");
      var b1 = h.querySelector(".d225b"); o.res1 = [b1.querySelector("p").textContent, txt(".h225 .d225b:first-child .racu li").length, /Falta:/.test(b1.textContent)];
      o.ctxClip = !!h.querySelectorAll(".d225b")[3].querySelector("[data-evid]");
      o.botones = [!!h.querySelector('[data-h225alto="min"]'), !!h.querySelector("[data-h225x]")];
      var L2 = JSON.parse(JSON.stringify(LERDO)); delete L2.resumen; abre(L2); document.querySelector('.chips225 [data-chip="detalles"]').click(); o.sinRes = document.querySelector(".h225 .d225b p").textContent;
      return o; });
    eq("con fecha y evento: fecha · Lista 3/4 · Agendado · Todo · ⓘ, en UNA fila que cabe a 390 px, sin personas ni Resumen", r.fiesta, [["vie 13 nov", "Lista 3/4", "Todo", "Resumen"], true, true, 0]);
    eq("Detalles es la ficha 'Resumen' (234)", r.detIcon, ["Resumen"]);
    eq("indefinida con metas: Indefinida · Metas 1/3 · filtro · ⓘ, cabe", r.lerdo, [["Indefinida", "Metas 1/3", "Manuel", "Resumen"], true, true, 0]);
    eq("hoja del filtro: Todo · Importante · Claude · integrantes · Invitar a nuevo miembro", [r.hoja, r.invita],
      [["Todotodo junto", "Importanteacuerdos y conclusiones", "Claudelo que le pediste y lo que contestó", "Eduardo Maderoexterno · por WhatsApp · solo ve lo suyo", "Arturo Tijerinaexterno · por WhatsApp · solo ve lo suyo", "Contacto sin nombre ·1884no está en tu agenda", "Invitar a nuevo miembroagregar o quitar integrantes"], true]);
    eq("Detalles en orden fijo y numerado", r.det, ["1Resumen vivo", "2Lo que sigue · de quién se espera", "3Metas", "4Contexto", "5Seguimiento y con quién se comparte", "6Origen"]);
    eq("1 Resumen vivo con el campo resumen: texto, acuerdos con palomita y Falta", r.res1, ["Esteban y Martín cortan ramas; Manuel manda fotos del techo esta semana para confirmar si hay panal.", 2, true]);
    eq("4 Contexto con el clip de evidencia", r.ctxClip, true);
    eq("minimizar y cerrar", r.botones, [true, true]);
    eq("sin campo resumen: lo de hoy (resumen vivo armado con lo que hay)", /^Sigue: Azotea/.test(r.sinRes), true);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
