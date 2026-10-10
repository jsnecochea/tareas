#!/usr/bin/env node
/* Contestar sin voz (inventario funcional del 10-oct). 390 px táctil, servidor simulado.
   1) «Dime si te lo agendo» en la hoja de preguntas trae Sí / No en pantalla (antes solo «Toca y contesta con tu voz»):
      Sí agenda (aviso + agendado), No deja agendar:false; la hoja dice que también se puede escribir abajo.
   2) «Decide tú»: la flecha de enviar sin texto avisa qué hacer (antes no hacía nada) y no manda nada.
   Correr: node tests/contesta-en-pantalla.test.js */
"use strict";
var S = require("./pagina-simulada");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function fx() {
  return {
    tCEN: S.tarea("tCEN", "Cena con el notario", { autorizada: false, evento: { titulo: "Cena con el notario", fecha: "2026-10-20", hora: "20:00" } }),
    tCEN2: S.tarea("tCEN2", "Comida con BBVA", { autorizada: false, evento: { titulo: "Comida con BBVA", fecha: "2026-10-21", hora: "14:00" } }),
    tFIE: S.tarea("tFIE", "Fiesta cumpleaños papá", { decision: { pregunta: "¿Qué salón reservo?", opciones: [{ nombre: "Salón Coahuila" }, { nombre: "Casino Laguna", recomendada: true }], ts: Date.now() - 7200000 } })
  };
}
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), errs = [];
  try {
    var A = await S.abrePagina(b, { tareas: fx(), touch: true }), p = A.p;
    /* ===== 1) agendar con un toque ===== */
    await p.evaluate(function () { abierta = "tCEN"; vista = "hilo"; render(); abrePreguntas("tCEN"); }); await p.waitForTimeout(300);
    var h = await p.evaluate(function () { var v = document.getElementById("preg249"); return v ? { agenda: /te lo agendo/i.test(v.textContent), si: !!v.querySelector('[data-pqag="si"]'), no: !!v.querySelector('[data-pqag="no"]'), escribe: /escríbela/.test(v.textContent) } : null; });
    eq("1 la pregunta de agendar trae Sí / No y dice que se puede escribir", h, { agenda: true, si: true, no: true, escribe: true });
    await p.tap('[data-pqag="si"]'); await p.waitForTimeout(300);
    var r1 = await p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "tCEN"; })[0];
      return [t.agendado, (t.avisos || []).some(function (a) { return a.fecha === "2026-10-20" && a.hora === "20:00"; }), window.__srv.llamadas.some(function (x) { return x.ac === "aviso_set"; })]; });
    eq("1 Sí: queda agendada con su alarma (aviso al servidor)", r1, [true, true, true]);
    await p.evaluate(function () { var v = document.getElementById("preg249"); if (v) cierraPreg(); abierta = "tCEN2"; vista = "hilo"; render(); abrePreguntas("tCEN2"); }); await p.waitForTimeout(300);
    eq("1 «Dime si te lo agendo.» (lo que falta, sin preguntas precisas) lleva su renglón con Sí / No",
      await p.evaluate(function () { return faltaComoPreg(tareas.filter(function (x) { return x.id === "tCEN2"; })[0]).filter(function (q) { return /agendo/.test(q.q); }).map(function (q) { return [q.k, q.q]; }); }),
      [["agenda273", "Dime si te lo agendo."]]);
    await p.tap('[data-pqag="no"]'); await p.waitForTimeout(300);
    var r2 = await p.evaluate(function () { var t = tareas.filter(function (x) { return x.id === "tCEN2"; })[0]; return [t.agendar, !!t.agendado, eventoPendiente(t)]; });
    eq("1 No: no se agenda y ya no lo vuelve a preguntar", r2, [false, false, false]);

    /* ===== 2) Decide tú sin texto ===== */
    await p.evaluate(function () { var v = document.getElementById("preg249"); if (v) cierraPreg(); abierta = "tFIE"; vista = "hilo"; render(); }); await p.waitForTimeout(300);
    var n0 = await p.evaluate(function () { document.getElementById("toast").textContent = ""; return window.__srv.llamadas.length; });
    await p.tap("#dec273e"); await p.waitForTimeout(200);
    var r3 = await p.evaluate(function (n0) { var t = tareas.filter(function (x) { return x.id === "tFIE"; })[0];
      return [document.getElementById("toast").textContent, !!(t.decision && t.decision.respuesta), window.__srv.llamadas.slice(n0).filter(function (x) { return x.ac === "claude"; }).length]; }, n0);
    eq("2 flecha sin texto: avisa y no manda nada", r3, ["Escribe o dicta tu respuesta, o toca una opción", false, 0]);
    await A.ctx.close(); errs = errs.concat(A.errs);
  } catch (e) { malas.push("EXCEPCIÓN: " + (e && e.stack || e)); }
  await b.close();
  eq("sin errores de página", errs, []);
  console.log((malas.length ? "X " : "✓ ") + ok + "/" + n + " contesta-en-pantalla");
  malas.forEach(function (m) { console.log("  X " + m); });
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
