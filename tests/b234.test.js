#!/usr/bin/env node
/* PRUEBAS build 234 (Salvador 18:56): sin ficha "Agendado": vive en la ficha de FECHA (calendario; VERDE icono y texto si está completo
   = alerta de Doit + Google Calendar; ícono ámbar si falta algo; sin evento, fecha normal). Tocarla abre la hoja con lo que hay y lo que
   falta, cada cita con su estado y "Mover la fecha". Indefinida verde con calendario si hay alguna cita completa. ⓘ pasa a "Resumen"
   (misma hoja numerada, titulada "Resumen"). La fila nunca hace dos renglones: cabe o se desliza. Correr: node tests/b234.test.js (CAP=<carpeta>) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 233", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 233, true);
eq("sin ficha 'Agendado' (data-chip=agenda)", /data-chip="agenda"/.test(html), false);
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
    async function caso(T, nom, hoja) {
      var r = await p.evaluate(function (a) { var T = a[0], hoja = a[1];
        yo = "salvador"; window.__vf230 = {}; window.__cnlClaude = {}; window.__cnl = {}; window.__mfil225 = {}; window.__hoja225 = null;
        tareas = [T]; abierta = T.id; vista = "hilo"; render(); poneVista(T, ""); render();
        [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex";
        var w = document.querySelector(".chips225"), bs = [].slice.call(w.querySelectorAll(":scope > button")), f = w.querySelector('[data-chip="fecha"]');
        var o = { fichas: bs.map(function (x) { return x.textContent; }), unaFila: bs.every(function (x) { return Math.round(x.getBoundingClientRect().top) === Math.round(bs[0].getBoundingClientRect().top); }),
          cabe: w.scrollWidth <= w.clientWidth, desliza: getComputedStyle(w).overflowX, wrap: getComputedStyle(w).flexWrap,
          f: f ? [f.classList.contains("verde"), getComputedStyle(f.querySelector(".ftx234")).color, getComputedStyle(f.querySelector("svg")).color, f.querySelector("svg").innerHTML.length > 0] : null };
        if (hoja) { (hoja === "res" ? w.querySelector('[data-chip="detalles"]') : f).click(); var h = document.querySelector(".h225");
          o.hoja = [h.querySelector(".h225h b").textContent, [].map.call(h.querySelectorAll(".mfr"), function (x) { return x.querySelector(".k").textContent + ": " + x.querySelector(".v").textContent; }), !!h.querySelector('[data-f234="mover"]'), h.querySelectorAll(".d225n, .d225s, [class*=d225]").length > 0]; }
        return o; }, [T, hoja || ""]);
      if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b234-" + nom + ".png"), clip: { x: 0, y: 0, width: 390, height: hoja ? 844 : 260 } });
      return r;
    }
    var F = await p.evaluate(function () { var NOW = Date.now();
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
      return { FIESTA: FIESTA, LERDO: LERDO }; });
    var VERDE = "rgb(48, 209, 88)", AMB = "rgb(255, 159, 10)";
    var fi = await caso(F.FIESTA, "fiesta-completo");
    var fiH = await caso(F.FIESTA, "fiesta-hoja", "fecha");
    var fc = JSON.parse(JSON.stringify(F.FIESTA)); fc.id = "tFC"; delete fc.gcal_id; fc.gcal = "pendiente"; var fcR = await caso(fc, "falta-calendario"), fcH = await caso(fc, "falta-calendario-hoja", "fecha");
    var dos = JSON.parse(JSON.stringify(F.FIESTA)); dos.id = "tDOS"; dos.nombre = "Juntas con el banco"; delete dos.checklist; delete dos.gcal_id; dos.agendado = true;
    dos.citas = [{ titulo: "Firma con BBVA", fecha: "2026-10-14", hora: "10:00", lugar: "Sucursal Colón", alerta: true, gcal_id: "e1" }, { titulo: "Revisión de avalúo", fecha: "2026-10-21", hora: "17:30", alerta: true }];
    var dosH = await caso(dos, "hoja-2-citas", "fecha");
    var sin = JSON.parse(JSON.stringify(F.FIESTA)); sin.id = "tSIN"; sin.nombre = "Revisar bomba"; sin.contexto = "Revisar la bomba de agua del jardín porque hace ruido"; delete sin.evento; delete sin.gcal_id; sin.agendado = false; sin.avisos = []; delete sin.checklist; sin.msgs = sin.msgs.slice(0, 1);
    var sinR = await caso(sin, "sin-evento");
    var ind = JSON.parse(JSON.stringify(F.LERDO)); ind.id = "tIND"; ind.citas = [{ titulo: "Visita de obra", fecha: "2026-10-09", hora: "09:00", alerta: true, gcal_id: "e9" }];
    var indR = await caso(ind, "indefinida-cita"), lerR = await caso(F.LERDO, "lerdo-metas"), resH = await caso(F.LERDO, "resumen-hoja", "res");
    eq("Fiesta completa: fecha · Lista 3/4 · Todo · Resumen, en una fila que cabe", [fi.fichas, fi.unaFila, fi.cabe], [["vie 13 nov", "Lista 3/4", "Todo", "Resumen"], true, true]);
    eq("Fiesta completa: ficha VERDE (icono y texto) con calendario", fi.f, [true, VERDE, VERDE, true]);
    eq("hoja de la fecha: qué hay + Mover la fecha", [fiH.hoja[0], fiH.hoja[1].slice(0, 2), fiH.hoja[2]], ["vie 13 nov", ["Alerta de Doit: Lista · vie 13 nov 14:00", "Google Calendar: Evento creado"], true]);
    eq("falta calendario: icono ámbar, texto normal; la hoja dice qué falta", [fcR.f[0], fcR.f[2], fcR.f[1] !== VERDE && fcR.f[1] !== AMB, fcH.hoja[1][1]], [false, AMB, true, "Google Calendar: Falta · en camino (lo crea el trabajador de Calendar)"]);
    eq("2 citas: la hoja las lista con su estado", [dosH.hoja[0], dosH.hoja[1], dosH.hoja[2]], ["vie 13 nov", ["mié 14 oct 10:00 · Firma con BBVA · Sucursal Colón: Agendada", "mié 21 oct 17:30 · Revisión de avalúo: Falta Google Calendar"], true]);
    eq("sin evento: la fecha normal, sin color", [sinR.f[0], sinR.f[2] === AMB, sinR.f[1] === VERDE], [false, false, false]);
    eq("indefinida con una cita completa: 'Indefinida' en verde con calendario", [indR.fichas[0], indR.f[0], indR.f[1]], ["Indefinida", true, VERDE]);
    eq("con Metas 1/3: una sola fila; si no cabe se desliza (nunca dos renglones)", [lerR.fichas, lerR.unaFila, lerR.desliza, lerR.wrap], [["Indefinida", "Metas 1/3", "Manuel", "Resumen"], true, "auto", "nowrap"]);
    eq("Resumen abre la hoja numerada titulada 'Resumen'", [resH.hoja[0], resH.hoja[3]], ["Resumen", true]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
