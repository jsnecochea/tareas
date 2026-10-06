#!/usr/bin/env node
/* PRUEBAS build 238 (Salvador 20:17 y 21:17). A) El dictado de la vista general obedece TODO: el mismo cerebro (promptRevision ->
   claude.php "rapido") devuelve además ordenes[] y dudas[]; se ejecutan (vincular / mensaje por la cola de WhatsApp con "IA: " / encargo
   a Claude en t.encargos / aviso / clasificar), fechas relativas con Monterrey, dueño sin cambio salvo que lo diga; al enviar queda
   el dictado como burbuja y UNA tarjeta "Hecho:" / "Me falta:" con botones. Caso real tIAMUVUZNUD1K, texto literal de las 19:49
   (la respuesta de Claude es un fijo: aquí se prueba lo que la app hace con ella). B) Iconito de Claude en CADA globo que acomodó
   (no en saludos); tocar el globo = OK · Mover · Nueva de ese mensaje; en el Inicio, al desplegar, cada mensaje con contenido trae
   su propuesta y sus botones; el de la tarjeta aplica a los que no se tocaron; reglas por mensaje. Correr: node tests/b238.test.js */
"use strict";
var fs = require("fs"), path = require("path");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
eq("versión >= 233", +(html.match(/var VERSION_APP = "build (\d+)/) || [0, 0])[1] >= 233, true);

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
    var DICT = "Esta tarea está se vincula a la del nuevo fideicomiso de tanto mi padre como de mi madre son dos fideicomisos en una sola tarea el fideicomiso de mi padre me lo tienes que revisar a este mañana pídele a Cynthia que que te ponga ambos ya sea que nos los mande por WhatsApp o por correo para que tú los los revises y que revises que estén bien todos los datos de mi padre de mi madre y de mi de mis hermanos y en el caso específico del fideicomiso de mi padre en el testamento por donde mi padre Todos sus bienes se van a dividir entre cuatro partes entre uno para mi madre y uno para mí y uno para mi hermano Luis Mario y otro para mi hermana lo hice y en el testamento de mi madre Este tiene una propiedad en Lerdo que es la propiedad de Ocampo 777 que le llamamos casa Eloísa esa propiedad se la heredaría única exclusivamente a mí y a mi hermano Luis Mari y todo lo demás de bienes que tenga de de dinero y de otros bienes eso se dividen entre entre tres en partes iguales entre mi hermano y mi hermana y yo";
    var r = await p.evaluate(function (DICT) {
      yo = "salvador"; var o = {}, NOW = Date.now();
      window.__WA = []; pideWhatsApp = function (c) { __WA.push(c); return Promise.resolve({ id: "p" + __WA.length }); };
      window.__PROMPT = ""; preguntaAClaude = function (msgs, mod, cb) { __PROMPT = msgs[0].content; window.__MOD = mod; setTimeout(function () { cb(JSON.stringify({
        tipo: "tarea", contexto: "Revisión de los testamentos de su padre y de su madre. Padre: todos sus bienes en 4 partes (madre, Salvador, Luis Mario y hermana). Madre: la casa de Lerdo (Ocampo 777, casa Eloísa) solo para Salvador y Luis Mario; el resto de sus bienes en 3 partes iguales entre Salvador, Luis Mario y su hermana.",
        quien: "Cynthia", responsable: "Cynthia Contadora GrupoNec Rangel", palabras: ["testamento", "fideicomiso", "herencia"], vinculos: [],
        ordenes: [{ tipo: "vincular", busca: "el nuevo fideicomiso de mi padre y de mi madre", tareas: ["tFIDEI", "tTESTAM", "tLERDO"] },
          { tipo: "mensaje", a: "Cynthia", canal: "whatsapp", texto: "¿Me mandas por WhatsApp o por correo los dos testamentos, el de mi padre y el de mi madre? Son para que Claude revise que estén bien todos los datos." },
          { tipo: "claude", que: "Revisar los testamentos de mi padre y de mi madre: que estén bien los datos de todos y el reparto", fecha: fechaMty238(1), hora: null }],
        dudas: [] })); }, 30); };
      function solo() { [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; }); document.getElementById("app").style.display = "flex"; }
      var T = { id: "tIAMUVUZNUD1K", nombre: "Firma de Testamento en Notaría 14", duenio: "salvador", estado: "abierta", creada_por: "ia_revisor", origen: "wa_revisor", por_autorizar: true, tipo_item: "tarea",
        pendiente_info: "La IA creó esta tarea por WhatsApp de Cynthia Contadora GrupoNec Rangel. ¿Fecha y quién la hace?", pendiente_tipo: "dato", falta_fecha: true,
        contexto: "Cynthia (contadora): me marcaron de la Notaria 14 para ver si pudiera pasar el Ing. y la Sra. Eloísa a firmar testamento a las 2:30 pm. No dice el día.",
        wa_contacto: "Cynthia Contadora GrupoNec Rangel", wa_contactos: [{ nombre: "Cynthia Contadora GrupoNec Rangel", desde: NOW - 1e7 }],
        msgs: [{ k: "bi", t: "Cynthia Contadora GrupoNec Rangel: Salvador buenas tardes, me marcaron de la Notaria 14 para ver si pudiera pasar el Ing. y la Sra. Eloísa a firmar testamento a las 2:30 pm.", wa_in: 1, wa_c: "Cynthia Contadora GrupoNec Rangel", ts: NOW - 1e7, h: "17:05" }] };
      tareas = [T, { id: "tFIDEI", nombre: "Fideicomiso: Seguimiento con BBVA", duenio: "salvador", estado: "abierta", contexto: "Fideicomiso testamentario F/4164471 con BBVA", msgs: [] },
        { id: "tTESTAM", nombre: "Mandar a Hacer Testamentos", duenio: "salvador", estado: "abierta", contexto: "Testamentos de mi padre y de mi madre con la notaría", msgs: [] },
        { id: "tLERDO", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", estado: "abierta", msgs: [] }];
      abierta = T.id; vista = "hilo"; render(); solo();
      document.getElementById("txt").value = DICT; try { document.getElementById("txt").dispatchEvent(new Event("input")); } catch (e) {}
      return o; }, DICT);
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b238-testamento-antes.png") });
    await p.evaluate(function () { document.getElementById("tenv").click(); });
    await p.waitForTimeout(3500);
    var r2 = await p.evaluate(function () { var o = {}, T = tareas.filter(function (x) { return x.id === "tIAMUVUZNUD1K"; })[0];
      [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; });
      var H = T.hecho238 || {}, c = document.querySelector(".hc238");
      o.modelo = [__MOD, /ordenes/.test(__PROMPT), /dudas/.test(__PROMPT), /HOY en Monterrey es/.test(__PROMPT)];
      o.duenio = [T.duenio, T.revisa_ext || "", T.transferida || null];
      o.wa = __WA.map(function (w) { return [w.contacto, /^IA: Cynthia, de parte de Salvador: ¿Me mandas/.test(w.texto), w.tarea_id]; });
      o.encargos = (T.encargos || []).map(function (e) { return [/Revisar los testamentos/.test(e.t), e.cuando === fechaMty238(1) + "T09:00:00-06:00", e.origen, e.estado, typeof e.creado]; });
      o.contexto = /4 partes/.test(T.contexto) && /Ocampo 777/.test(T.contexto);
      o.tarjeta = c ? { hecho: [].map.call(c.querySelectorAll(".hch li"), function (x) { return x.textContent; }), falta: [].map.call(c.querySelectorAll(".hcf li > span:first-child"), function (x) { return x.textContent; }), ops: [].map.call(c.querySelectorAll(".hco button"), function (x) { return x.textContent; }) } : null;
      o.limpio = [document.querySelectorAll(".solofalta,.fic.info,.fic.ctx").length, [].filter.call(document.querySelectorAll(".msgs [data-mix]"), function (b) { return /Esta tarea está se vincula/.test(b.textContent); }).length, [].filter.call(document.querySelectorAll(".msgs [data-mix]"), function (b) { return /^Anoté/.test(b.textContent.trim()); }).length];
      o.palomitas = document.querySelectorAll(".msgs .wtk").length; o.dbgm = [vista230(T), canalActual(T).id, (document.querySelector(".msgs")||{}).textContent.slice(0, 400), T.msgs.map(function (x) { return [x.k, (x.t||"").slice(0, 20), x.canal||"", x.res238||0]; })];
      var sc = document.querySelector(".scroll"); if (sc) sc.scrollTop = 0;
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b238-testamento-hecho.png") });
    var r3 = await p.evaluate(function () { var o = {};
      document.querySelector('.hc238 [data-hc238="0|0"]').click(); var d = tareas.filter(function (x) { return x.id === "tTESTAM"; })[0];
      o.vinc = [abierta, (d.encargos || []).length, (d.hecho238 && d.hecho238.hecho || []).some(function (x) { return /Vinculada a “Mandar a Hacer Testamentos”/.test(x); })];
      o.dueno = [["pídele a Cynthia que mande los testamentos", duenoDicho238("pídele a Cynthia que mande los testamentos", "Cynthia")], ["pásasela a Cynthia", duenoDicho238("pásasela a Cynthia", "Cynthia")], ["que la haga Cynthia", duenoDicho238("que la haga Cynthia", "Cynthia")], ["Cynthia me dio los datos", duenoDicho238("Cynthia me dio los datos", "Cynthia")]].map(function (x) { return x[1]; });
      o.ordenesDichas = [ordenesDichas238("ok gracias"), ordenesDichas238("Manuel revisa la azotea"), ordenesDichas238(document.getElementById ? "Claude revisa esto mañana" : "")];
      return o; });
    /* ---- B) Eduardo: 6 mensajes, 2 con destino distinto y 4 saludos ---- */
    var r4 = await p.evaluate(function () { var o = {}, NOW = Date.now(), hm = function (ms) { var d = new Date(NOW - ms); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
      window.__ESCR = []; db = { collection: function (c) { return { doc: function (id) { return { set: function (v, op) { __ESCR.push([c, id, JSON.parse(JSON.stringify(v))]); return Promise.resolve(); }, get: function () { return Promise.resolve({ exists: false }); } }; } }; } };
      function m(tx, hace, extra) { var x = { k: "bi", wa_in: 1, wa_c: "Eduardo Madero", t: "Eduardo Madero: " + tx, ts: NOW - hace, h: hm(hace), wa_id: "e" + hace }; for (var k in (extra || {})) x[k] = extra[k]; return x; }
      window.F238 = function () { return [{ id: "tPADEL", nombre: "Pádel miércoles", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, indefinida: true, contexto: "Pádel de los miércoles en el club con Lalo, Néstor y el Pollo; reservar cancha.", msgs: [
          m("Hola Salvador", 30 * 60000), m("¿Hay miercolitos esta semana? Reservé la cancha 3 de 8 a 9:30", 28 * 60000),
          m("Oye y lo de tu comedor: mi carpintero puede ir el jueves a medir la cubierta", 25 * 60000, { duda_tarea: { alternativa_id: "tCOMEDOR", alternativa_nombre: "Comedor nuevo" } }),
          m("ok", 22 * 60000), m("gracias", 21 * 60000), m("saludos", 20 * 60000)] },
        { id: "tCOMEDOR", nombre: "Comedor nuevo", duenio: "salvador", estado: "abierta", tipo_item: "tarea", tipo_elegido: true, msgs: [] }]; };
      tareas = F238(); abierta = null; vista = "lista"; render(); [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; });
      o.aco = !!document.querySelector(".aco226"); o.vista = vista; o.n = platicasAcomodo237().length; var cd = document.querySelector(".aco226 .acor.g237"); if (!cd) return o; cd.querySelector(".x237").click(); cd = document.querySelector(".aco226 .acor.g237");
      o.desplegada = [].map.call(cd.querySelectorAll(".m237"), function (x) { return [!!x.querySelector(".ac226"), (x.querySelector(".prop238") || {}).textContent || ""]; });
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b238-platica-eduardo.png") });
    var r5 = await p.evaluate(function () { var o = {}, cd = document.querySelector(".aco226 .acor.g237");
      var comedor = [].filter.call(cd.querySelectorAll(".m237"), function (x) { return /comedor/.test(x.textContent); })[0];
      comedor.querySelector("[data-acmov]").click(); document.querySelector('#mov225 [data-movto="tCOMEDOR"]').click();
      window.__g237open = {}; render(); cd = document.querySelector(".aco226 .acor.g237"); cd.querySelector(":scope > .acob > .ac226 [data-acok]").click();   /* 245: plegada para usar la fila de la tarjeta */
      var P = tareas[0], C = tareas[1];
      o.destinos = [C.msgs.filter(function (x) { return /comedor/.test(x.t); }).length, P.msgs.filter(function (x) { return x.acomodo && x.acomodo.ok === 1; }).length, P.msgs.filter(function (x) { return x.oculto; }).length];
      o.reglas = __ESCR.filter(function (e) { return e[0] === "bitacora_personas"; }).map(function (e) { var r = e[2].acomodo_reglas[Object.keys(e[2].acomodo_reglas)[0]]; return [r.tipo, r.tarea_destino, r.mensajes]; });
      /* ---- globo dentro de la tarea ---- */
      tareas = F238(); abierta = "tPADEL"; vista = "hilo"; window.__cl238 = {}; render(); poneVista230(tareas[0], ""); render();
      [].forEach.call(document.body.children, function (x) { if (x.id !== "app") x.style.display = "none"; });
      o.iconos = [].map.call(document.querySelectorAll(".msgs [data-mix]"), function (b) { return !!b.querySelector(".cl238"); });
      [].filter.call(document.querySelectorAll(".msgs [data-mix]"), function (b) { return /miercolitos/.test(b.textContent); })[0].click();
      o.menu = [].map.call(document.querySelectorAll("#det242 .ac226"), function (x) { return x.getAttribute("data-acg"); });   /* 242: en la hoja del globo */
      
      return o; });
    if (process.env.CAP) await p.screenshot({ path: path.join(process.env.CAP, "b238-globo-menu.png") });
    eq("el mismo cerebro (promptRevision, modelo 'pesado') pide ordenes y dudas, con la fecha de Monterrey", r2.modelo, ["pesado", true, true, true]);
    eq("dueño SIN cambio (aunque Claude dijo quien/responsable Cynthia)", r2.duenio, ["salvador", "", null]);
    eq("mensaje a Cynthia por la cola de WhatsApp, con 'IA: ' y de parte de Salvador", r2.wa, [["Cynthia Contadora GrupoNec Rangel", true, "tIAMUVUZNUD1K"]]);
    eq("encargo a Claude: revisar los testamentos MAÑANA (t.encargos)", r2.encargos, [[true, true, "dictado", "pendiente", "number"]]);
    eq("contexto: el reparto", r2.contexto, true);
    eq("tarjeta: Hecho (mensaje y encargo) · Me falta: ¿a cuál la vinculo? con 'Mandar a hacer testamentos' primero; no pide fecha", [r2.tarjeta.hecho.length >= 2, r2.tarjeta.hecho.some(function (x) { return /Le escribí a Cynthia/.test(x); }), r2.tarjeta.hecho.some(function (x) { return /Lo reviso yo mañana/.test(x); }), r2.tarjeta.falta[0], r2.tarjeta.ops[0], r2.tarjeta.falta.some(function (x) { return /fecha|finiquito/i.test(x); })],
      [true, true, true, "¿A cuál la vinculo?", "Mandar a Hacer Testamentos", false]);
    eq("pantalla limpia: sin bloques largos; el dictado queda como burbuja; sin 'Anoté…'", r2.limpio, [0, 1, 0]);
    eq("burbuja con palomitas (estilo Apple) en el mensaje que salió", r2.palomitas >= 1, true);
    eq("tocar la candidata vincula; el encargo y la tarjeta pasan a la tarea elegida", r3.vinc, ["tTESTAM", 1, true]);
    eq("dueño solo si lo dice explícito", r3.dueno, [false, true, true, false]);
    eq("dictado con órdenes en cualquier estado: largo o para Claude; un mensaje corto a una persona sigue su camino", r3.ordenesDichas, [false, false, true]);
    eq("plática de Eduardo desplegada: botones y propuesta SOLO en los 2 con contenido", r4.desplegada, [[false, ""], [true, "creo que es: Pádel miércoles"], [true, "creo que es: Pádel miércoles · ¿o Comedor nuevo?"], [false, ""], [false, ""], [false, ""]]);
    eq("destinos distintos: comedor movido, el resto se queda con el OK de la tarjeta", r5.destinos, [1, 5, 1]);
    eq("reglas por MENSAJE (los saludos no)", r5.reglas, [["mover", "tCOMEDOR", 1], ["ok", "tPADEL", 1]]);
    eq("iconito de Claude solo en los globos con contenido", r5.iconos, [false, true, true, false, false, false]);
    eq("tocar ESE globo: OK · Mover · Nueva para ese mensaje solo", r5.menu, ["1"]);
    eq("sin errores de página", errs, []);
  } finally { await b.close(); }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
