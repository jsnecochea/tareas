#!/usr/bin/env node
/* PRUEBAS build 233 (opción A del encabezado, Salvador 18:45): audífono siempre · clip SOLO con archivos y la cantidad en azul · ⋯ siempre;
   los tres sin fondo ni borde, ~30 px, gap 6 px. Renglón de propietario en TODAS las vistas: mía = sin subtítulo; de otro = UNA línea
   "De Manuel" / "De Manuel · sup. tú" / "De Samuel · sup. Carlos" (primer nombre), nunca salta. Antes: build 232: sin restos viejos. El filtro por meta (fila "Todo · Azotea · Interior · Otro" del 225) vive en la hoja de la ficha
   "Metas n/m": tocar una meta filtra el chat y la ficha dice "Azotea ⌄"; "Todo" la regresa. Sin el selector "Importante | Todo" (Importante
   vive en el filtro). Título con fuente del sistema (-apple-system, SF Pro, Inter de respaldo). Ninguna fila/control viejo (219–226) en tarea
   con metas, con checklist, tarea nueva, dato y supervisor. App completa sin red, 390 px. Correr: node tests/b233.test.js  (CAP=<carpeta> guarda capturas) */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión 233", /var VERSION_APP = "build 233/.test(html), true);
eq("sin 'Lo hace … · supervisas tú' en el encabezado", /Lo hace <b>'\+esc\(nombreCorto\(ejecutorNombre/.test(html), false);
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
    async function caso(T, nom) {
      var r = await p.evaluate(function (T) {
        yo = "salvador"; if (!PERSONAS.salvador) PERSONAS.salvador = { nombre: "Salvador", jefe: true };
        window.__vf230 = {}; window.__cnlClaude = {}; window.__cnl = {}; window.__mfil225 = {}; window.__hoja225 = null;
        tareas = [T]; abierta = T.id; vista = "hilo"; render(); try { leeExtras(); } catch (e) {}
        [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex";
        var top = document.querySelector("#app .top"), d = top.querySelector(".own233"), t = top.querySelector(".t");
        var bs = [].slice.call(top.querySelectorAll(".iconbtn:not(#bback)")).filter(function (b) { return b.offsetParent; });
        var R = bs.map(function (b) { return b.getBoundingClientRect(); });
        return { ids: bs.map(function (b) { return b.id; }), tam: bs.map(function (b) { var c = getComputedStyle(b); return [Math.round(b.getBoundingClientRect().width), c.borderTopWidth, c.backgroundColor === "rgba(0, 0, 0, 0)" || c.backgroundImage === "none" && /rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor)]; }),
          gap: R.length > 1 ? Math.round(R[1].left - R[0].right) : null,
          cnt: (top.querySelector("#bgal .cnt") || {}).textContent || "", cntColor: top.querySelector("#bgal .cnt") ? getComputedStyle(top.querySelector("#bgal .cnt")).backgroundColor : "",
          sub: d ? d.textContent : null, subLineas: d ? Math.round(d.getBoundingClientRect().height / parseFloat(getComputedStyle(d).lineHeight || 18)) : 0, subWrap: d ? getComputedStyle(d).whiteSpace : "",
          subDentro: d ? d.getBoundingClientRect().right <= top.getBoundingClientRect().right : true, tituloAncho: Math.round(t.parentNode.parentNode.getBoundingClientRect().width), tw: [t.scrollWidth, t.clientWidth], lohace: /Lo hace|supervisas/.test(top.textContent) };
      }, T);
      if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b233-" + nom + ".png"), clip: { x: 0, y: 0, width: 390, height: 300 } });
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
    var fot = { data: "data:image/gif;base64,R0lGODlhAQABAAAAACw=", ts: Date.now() };
    var mia = JSON.parse(JSON.stringify(F.FIESTA)); delete mia.evidencias; delete mia.fotos; delete mia.adjuntos;
    var mia3 = JSON.parse(JSON.stringify(mia)); mia3.id = "tMIA3"; mia3.evidencias = [fot, fot, fot];
    var man = JSON.parse(JSON.stringify(F.LERDO)); man.revisa_ext = "Manuel Parra";
    var lar = JSON.parse(JSON.stringify(F.LERDO)); lar.id = "tLARGO"; lar.revisa_ext = "Manuel Parra Mármoles y Granitos"; lar.nombre = "Cubierta de mármol para el comedor nuevo y la barra de la cocina";
    var a = await caso(mia, "mia"), b3 = await caso(mia3, "mia-3archivos"), m = await caso(man, "manuel-sup-tu"), l = await caso(lar, "nombre-largo");
    var s1 = await caso({ id: "tS1", nombre: "Revisar facturas", duenio: "samuel", estado: "abierta", msgs: [] }, "samuel"),
        s2 = await caso({ id: "tS2", nombre: "Revisar facturas", duenio: "samuel", revisores: ["carlos"], estado: "abierta", msgs: [] }, "samuel-sup-carlos"),
        s3 = await caso({ id: "tS3", nombre: "Revisar facturas", duenio: "samuel", revisores: ["salvador"], estado: "abierta", msgs: [] }, "samuel-sup-tu");
    eq("mía sin archivos: audífono y ⋯, sin clip, sin subtítulo", [a.ids, a.sub], [["bleeh", "bmenu"], null]);
    eq("los botones: ~30 px, sin borde ni fondo, gap 6 px", [a.tam, a.gap], [[[30, "0px", true], [30, "0px", true]], 6]);
    eq("mía con 3 archivos: clip con '3' en azul", [b3.ids, b3.cnt, b3.cntColor, b3.sub], [["bleeh", "bgal", "bmenu"], "3", "rgb(10, 132, 255)", null]);
    eq("sin clip el título gana el espacio", a.tituloAncho - b3.tituloAncho >= 30, true);
    eq("de Manuel supervisada por Salvador", [m.sub, m.subLineas, m.subWrap, m.lohace], ["De Manuel · sup. tú", 1, "nowrap", false]);
    eq("nombre largo: una sola línea, dentro de la pantalla", [l.sub, l.subLineas, l.subWrap, l.subDentro], ["De Manuel · sup. tú", 1, "nowrap", true]);
    eq("de otro sin supervisor / sup. otro / sup. tú", [s1.sub, s2.sub, s3.sub], ["De Samuel", "De Samuel · sup. Carlos", "De Samuel · sup. tú"]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
