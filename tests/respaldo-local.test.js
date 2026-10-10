#!/usr/bin/env node
/* Lo que la app resuelve sola cuando Claude contesta vacío (inventario funcional del 10-oct). 390 px, servidor simulado.
   1) Recordatorio escrito en la tarea «mañana a las 9 am confirmar salón»: el texto queda «Confirmar salón» (antes «Am
      confirmar salón»); también a.m. / p.m. / hrs (asuntoRecordatorio y sinHoraEnTitulo).
   2) Dictado «recuérdame el lunes pagar el agua» con Claude vacío: la tarea se llama «Pagar el agua» (antes «El Lunes Pagar
      el Agua»), para el lunes; igual con hora («el lunes a las 9»).
   3) «Mándale WhatsApp a Manuel Parra que…» desde Inicio con Claude vacío: va a «Comedor nuevo», donde Manuel ya es
      contacto (antes creaba una tarea nueva). Con dos tareas donde está, pregunta en cuál y no crea nada.
   Correr: node tests/respaldo-local.test.js */
"use strict";
var S = require("./pagina-simulada");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function lunes() { var d = new Date(); d.setHours(12, 0, 0, 0); do { d.setDate(d.getDate() + 1); } while (d.getDay() !== 1); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
var FAKESR = function (frase) {
  window.__micOK = true; window.__frase = frase;
  function SR() { var me = this; this.start = function () { setTimeout(function () { var r = [{ transcript: window.__frase, confidence: 0.9 }]; r.isFinal = true; if (me.onresult) me.onresult({ resultIndex: 0, results: [r] }); }, 300); };
    this.stop = function () { setTimeout(function () { if (me.onend) me.onend({}); }, 50); }; this.abort = this.stop; }
  window.SpeechRecognition = SR; window.webkitSpeechRecognition = SR;
};
function fx(dosConManuel) {
  var o = {
    tCOM: S.tarea("tCOM", "Comedor nuevo", { wa_contactos: [{ nombre: "Manuel Parra", tel: "8711112222" }], integrantes: ["salvador", "karina"] }),
    tFIE: S.tarea("tFIE", "Fiesta cumpleaños papá"),
    tPRE: S.tarea("tPRE", "Pagar predial casa")
  };
  if (dosConManuel) o.tTER = S.tarea("tTER", "Barra de la terraza", { wa_contactos: [{ nombre: "Manuel Parra" }] });
  return o;
}
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), errs = [];
  try {
    /* ===== 1) limpiadores de la hora ===== */
    var A = await S.abrePagina(b, { tareas: fx() }), p = A.p;
    var L = await p.evaluate(function () { var t = { nombre: "X" };
      return ["mañana a las 9 am confirmar salón", "mañana a las 9 a.m. confirmar salón", "el viernes a las 6 p.m. pagar luz", "mañana a las 10 hrs junta", "mañana a las 9:30 pm cena", "mañana 9am confirmar salón"]
        .map(function (f) { return [asuntoRecordatorio(f, t), sinHoraEnTitulo(f)]; }); });
    eq("1 asuntoRecordatorio / sinHoraEnTitulo quitan am, a.m., p.m., hrs", L, [["confirmar salón", "Confirmar salón"], ["confirmar salón", "Confirmar salón"], ["pagar luz", "El viernes pagar luz"],
      ["junta", "Junta"], ["cena", "Cena"], ["confirmar salón", "Confirmar salón"]]);
    /* de punta a punta: hoja de recordatorios de la tarea → escribir → mandar */
    await p.evaluate(function () { abierta = "tFIE"; vista = "hilo"; render(); }); await p.waitForTimeout(300);
    await p.click("#brel"); await p.waitForTimeout(250); await p.click("#avadd"); await p.waitForTimeout(250);
    await p.click("#txt"); await p.keyboard.type("mañana a las 9 am confirmar salón");
    await p.click("#tenv"); await p.waitForTimeout(1500);
    var r1 = await p.evaluate(function () { var av = (tareas.filter(function (x) { return x.id === "tFIE"; })[0].avisos || []).slice(-1)[0] || {}; return [av.texto, av.hora]; });
    eq("1 recordatorio «mañana a las 9 am confirmar salón» → «Confirmar salón» a las 9:00", r1, ["Confirmar salón", "09:00"]);
    await A.ctx.close(); errs = errs.concat(A.errs);

    /* ===== 2) dictado con Claude vacío ===== */
    var casos = [["recuérdame el lunes pagar el agua", "Pagar el Agua"], ["Recuérdame el lunes a las 9 pagar el agua", "Pagar el Agua"]];
    for (var i = 0; i < casos.length; i++) {
      var B = await S.abrePagina(b, { tareas: fx() }); p = B.p;
      await p.evaluate(FAKESR, casos[i][0]); await p.click("#bmic"); await p.waitForTimeout(900);
      var bt = await p.$("#dictaok"); if (bt) await bt.click(); else await p.click("#bmic");
      await p.waitForTimeout(3000);
      var r2 = await p.evaluate(function () { var t = tareas.filter(function (x) { return !/^t(COM|FIE|PRE)$/.test(x.id); }).slice(-1)[0]; return t ? [t.nombre, t.f_vigente] : null; });
      eq("2 «" + casos[i][0] + "» con Claude vacío → nombre sin la fecha, para el lunes", r2, [casos[i][1], lunes()]);
      await B.ctx.close(); errs = errs.concat(B.errs);
    }

    /* ===== 3) WhatsApp a un contacto que ya está en una tarea ===== */
    var C = await S.abrePagina(b, { tareas: fx() }); p = C.p;
    await p.click("#bq"); await p.keyboard.type("Mándale WhatsApp a Manuel Parra que si mañana trae la muestra"); await p.click("#benv"); await p.waitForTimeout(2500);
    var r3 = await p.evaluate(function () { return { n: tareas.length, abierta: abierta, ped: window.__srv.llamadas.filter(function (x) { return x.ac === "wa_pedido"; }).length,
      enCom: tareas.filter(function (x) { return x.id === "tCOM"; })[0].msgs.some(function (m) { return /muestra/i.test(m.t || ""); }) }; });
    eq("3 WhatsApp a Manuel con Claude vacío: va a «Comedor nuevo», no crea tarea nueva", r3, { n: 3, abierta: "tCOM", ped: 1, enCom: true });
    await C.ctx.close(); errs = errs.concat(C.errs);
    /* solo el nombre de pila también pega */
    var C2 = await S.abrePagina(b, { tareas: fx() }); p = C2.p;
    await p.click("#bq"); await p.keyboard.type("Mándale WhatsApp a Manuel que si mañana trae la muestra"); await p.click("#benv"); await p.waitForTimeout(2500);
    eq("3 «Manuel» a secas también va a «Comedor nuevo»", await p.evaluate(function () { return [tareas.length, abierta]; }), [3, "tCOM"]);
    await C2.ctx.close(); errs = errs.concat(C2.errs);
    /* en dos tareas: pregunta */
    var D = await S.abrePagina(b, { tareas: fx(true) }); p = D.p;
    await p.click("#bq"); await p.keyboard.type("Mándale WhatsApp a Manuel Parra que si mañana trae la muestra"); await p.click("#benv"); await p.waitForTimeout(2500);
    var r4 = await p.evaluate(function () { return { n: tareas.length, vista: vista, ped: window.__srv.llamadas.filter(function (x) { return x.ac === "wa_pedido"; }).length,
      pregunta: /Manuel Parra está en 2 tareas.*Comedor Nuevo.*Barra de la Terraza|Manuel Parra está en 2 tareas.*Barra de la Terraza.*Comedor Nuevo/.test((barraEstado && barraEstado.texto) || "") }; });
    eq("3 Manuel en dos tareas: pregunta en cuál y no manda ni crea nada", r4, { n: 4, vista: "barra", ped: 0, pregunta: true });
    await D.ctx.close(); errs = errs.concat(D.errs);
  } catch (e) { malas.push("EXCEPCIÓN: " + (e && e.stack || e)); }
  await b.close();
  eq("sin errores de página", errs, []);
  console.log((malas.length ? "X " : "✓ ") + ok + "/" + n + " respaldo-local");
  malas.forEach(function (m) { console.log("  X " + m); });
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
