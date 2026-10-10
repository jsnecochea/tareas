#!/usr/bin/env node
/* Encargos, «Voy a estar fuera», «Tus datos» y la liga de alta se escriben en Firestore Y en push.php (fs_set con su col=),
   porque la Mac y el servidor ya leen por push.php. El aviso «Le llegó a Samuel» / «Listo» sale solo cuando al menos una
   escritura confirmó; si fallan las dos, lo dice (inventario funcional del 10-oct: antes solo Firestore y el aviso salía
   sin llamar al servidor). 390 px, servidor simulado. Correr: node tests/escritura-doble.test.js */
"use strict";
var S = require("./pagina-simulada");
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
var fx = function () { return { tCOM: S.tarea("tCOM", "Comedor nuevo") }; };
var sets = function (col) { return window.__srv.llamadas.filter(function (x) { return x.ac === "fs_set" && x.c && x.c.col === col; }).map(function (x) { return x.c; }); };
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), errs = [];
  async function encarga(p, txt) {
    await p.evaluate(function () { abierta = "tCOM"; vista = "encargar"; render(); document.getElementById("toast").textContent = ""; }); await p.waitForTimeout(200);
    await p.click('[data-pers="samuel"]'); await p.waitForTimeout(150);
    await p.fill("#enctxt", txt); await p.click("#encmandar"); await p.waitForTimeout(600);
  }
  try {
    /* ===== encargo ===== */
    var A = await S.abrePagina(b, { tareas: fx() }), p = A.p;
    await encarga(p, "Cotiza la piedra del comedor");
    var r1 = await p.evaluate(function (f) { var sets = eval("(" + f + ")"); var e = encargos.slice(-1)[0], s = sets("bitacora_encargos").slice(-1)[0];
      return { srv: !!(s && s.id === e.id && s.data.texto === "Cotiza la piedra del comedor" && s.data.para === "samuel"), fs: window.__fsEscribe.some(function (x) { return x.col === "bitacora_encargos" && x.id === e.id; }), toast: document.getElementById("toast").textContent }; }, sets.toString());
    eq("encargo: se escribe en push.php y en Firestore, y entonces dice «Le llegó»", r1, { srv: true, fs: true, toast: "Le llegó a Samuel" });
    /* las dos escrituras fallan: lo dice */
    await p.evaluate(function () { window.__fsFalla = true; window.__srv.falla.fs_set = true; });
    await encarga(p, "Y la del baño");
    eq("encargo sin ninguna escritura confirmada: no dice que le llegó", await p.evaluate(function () { return document.getElementById("toast").textContent; }), "No le llegó a Samuel: revisa tu conexión");
    /* solo el servidor confirma: basta */
    await p.evaluate(function () { window.__fsFalla = true; window.__srv.falla.fs_set = false; });
    await encarga(p, "Y la del jardín");
    eq("encargo con solo push.php confirmando: «Le llegó»", await p.evaluate(function () { return document.getElementById("toast").textContent; }), "Le llegó a Samuel");
    await p.evaluate(function () { window.__fsFalla = false; });

    /* ===== Voy a estar fuera ===== */
    await p.evaluate(function () { vista = "yo"; render(); document.getElementById("toast").textContent = ""; }); await p.waitForTimeout(200);
    await p.evaluate(function () { document.getElementById("suph").value = document.getElementById("supd").value; document.getElementById("sups").value = "samuel"; });
    await p.click("#bponsup"); await p.waitForTimeout(500);
    var r2 = await p.evaluate(function (f) { var sets = eval("(" + f + ")"); var s = sets("bitacora_suplencias").slice(-1)[0]; return { srv: !!(s && s.id === "salvador" && s.data.suplente === "samuel"), toast: document.getElementById("toast").textContent }; }, sets.toString());
    eq("suplencia: va a push.php (bitacora_suplencias) y entonces «Listo»", r2, { srv: true, toast: "Listo. Lo ve Samuel" });
    await p.evaluate(function () { document.getElementById("toast").textContent = ""; });
    var q = await p.$("#bquitasup"); if (q) { await q.click(); await p.waitForTimeout(500); }
    var r2b = await p.evaluate(function (f) { var sets = eval("(" + f + ")"); var s = sets("bitacora_suplencias").slice(-1)[0]; return { srv: !!(s && s.data.quitada && s.data.suplente === ""), toast: document.getElementById("toast").textContent }; }, sets.toString());
    eq("quitar la suplencia también llega a push.php", r2b, { srv: true, toast: "Bienvenido" });

    /* ===== Tus datos ===== */
    await p.evaluate(function () { vista = "ficha"; render(); document.getElementById("toast").textContent = ""; }); await p.waitForTimeout(200);
    await p.fill("#fnom", "Salvador"); await p.fill("#fape", "Necochea"); await p.fill("#fmt", "sal@ejemplo.com");
    await p.click("#fguarda"); await p.waitForTimeout(500);
    var r3 = await p.evaluate(function (f) { var sets = eval("(" + f + ")"); var s = sets("bitacora_personas").filter(function (x) { return x.data && x.data.apellido; }).slice(-1)[0]; return { srv: !!(s && s.id === "salvador" && s.data.apellido === "Necochea"), toast: document.getElementById("toast").textContent }; }, sets.toString());
    eq("Tus datos: van a push.php (bitacora_personas) y entonces «Listo»", r3, { srv: true, toast: "Listo. Tus iniciales son SN" });

    /* ===== liga de alta ===== */
    await p.evaluate(function () { vista = "admin"; render(); }); await p.waitForTimeout(300);
    var hayLiga = await p.$("#bliga");
    if (hayLiga) { await hayLiga.click(); await p.waitForTimeout(600); }
    var r4 = await p.evaluate(function (f) { var sets = eval("(" + f + ")"); var s = sets("bitacora_invitaciones").slice(-1)[0]; var o = document.getElementById("ligaout"), bl = document.getElementById("bliga");
      return { srv: !!(s && s.data.token && s.data.usada === 0), sale: !!((o && /alta=/.test(o.textContent)) || (bl && /Copiada/.test(bl.textContent))) }; }, sets.toString());
    eq("liga de alta: se registra en push.php (bitacora_invitaciones) y se entrega", [!!hayLiga, r4], [true, { srv: true, sale: true }]);
    await A.ctx.close(); errs = errs.concat(A.errs);
  } catch (e) { malas.push("EXCEPCIÓN: " + (e && e.stack || e)); }
  await b.close();
  eq("sin errores de página", errs, []);
  console.log((malas.length ? "X " : "✓ ") + ok + "/" + n + " escritura-doble");
  malas.forEach(function (m) { console.log("  X " + m); });
  console.log("RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
