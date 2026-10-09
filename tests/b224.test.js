#!/usr/bin/env node
/* PRUEBAS build 224 (maqueta supervisor aprobada por Salvador 12:03). Vista SUPERVISOR: "Lo hace X · supervisas tú", Metas
   compacta (rojo solo si atrasada, sin Cumplida/Foto), Contexto y Datos plegados con 1 línea, franja sin encimarse, abajo solo lo que
   le toca ("Nada pendiente para ti"); tarjeta "X terminó <meta>" con Aprobar / Pedir corrección; el ejecutor de Doit sí ve
   Cumplida + Foto y su Cumplida queda POR APROBAR. Notas del campo "notas" (nota_privada) en el hilo. Correr: node tests/b224.test.js */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm"), os = require("os");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"), L = html.split("\n");
function saca(n) { var re = new RegExp("^(function " + n.replace(/\$/g, "\\$") + "\\(|var " + n + "\\s*=)"), i = -1; L.forEach(function (l, k) { if (re.test(l)) i = k; });
  if (i < 0) throw new Error("no encontre " + n); var o = [L[i]]; for (var k = i + 1; k < L.length; k++) { var x = L[k]; if (x.length && !/^[\s}\]]/.test(x)) break; o.push(x); if (/^}/.test(x)) break; } return o.join("\n"); }
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
si("VERSION_APP build 224", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 224);
var F = ["_nn", "_n179", "nombreCorto", "tareaCorta", "esMetas", "metasDe", "metaCumplida", "metaCorta", "fechaMeta", "semaforoMeta", "fechaMovCorta", "dDif", "_compartirLista",
  "ejecutorNombre", "vistaSup", "necesitaAprobacion", "subSupHTML", "pila233", "propietario233", "_supAb", "porAprobar", "resumenDatos", "vMetasSup", "vSecSup", "vSupSecciones", "vEntregas", "apruebaMeta", "pideCorreccion", "sugSup", "cumpleMeta"];
var pre = 'var yo="salvador", PERSONAS={salvador:{nombre:"Salvador",jefe:true}, samuel:{nombre:"Samuel"}}, H0="2026-10-11", WA=[], PUSH=[], MSG=[], window_={};' +
  'function hoy(){ return H0; } function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); } function esDato(){ return false; }' +
  'function soySupervisor(t){ return !!(t && t.duenio && t.duenio!==yo && (t.revisores||[]).indexOf(yo)>=0); } function contextoDe(t){ return t.contexto||""; } function fechaConDia(f){ return f; }' +
  'function tipoRevisar(t){ return t._rev||""; } function soloMeFalta(t){ return t._falta||[]; } function completitud(t){ return {completa:!!t._completa}; }' +
  'function msg(t,k,tx){ (t.msgs=t.msgs||[]).push({k:k,t:tx}); MSG.push(tx); } function guarda(){} function pideWhatsApp(c){ WA.push(c); return Promise.resolve({id:"p"}); }' +
  'function disparaPushInstantaneo(k,a,b){ PUSH.push([k,b]); } function urlTarea(i){ return "u:"+i; }';
var css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || "";
var pagina = '<!doctype html><meta charset="utf-8"><style>' + css + '</style><body style="background:#000;color:#f5f5f7;font-family:-apple-system,sans-serif;margin:0;width:390px"><div id="m"></div><script>' + pre + F.map(saca).join("\n").replace(/<\/script>/g, "<\\/script>") + '</script>';
var tmp = path.join(os.tmpdir(), "b224-" + process.pid + ".html"); fs.writeFileSync(tmp, pagina);
function LERDO() { return { id: "tL", nombre: "Mantenimiento Casa Lerdo/Eloísa", duenio: "salvador", revisa_ext: "Manuel Parra", indefinida: true, contexto: "Mantenimiento integral de la casa Lerdo; Manuel ejecuta, Salvador supervisa.",
  seg_a: { contacto: "Manuel Parra", cada: "lunes, miércoles y viernes", hora: "10:00" }, compartir_con: ["María Eloísa Albores de la Peña (madre)", "Salvador N.S. (padre)", "Luis Mario Necochea (hermano)"], msgs: [],
  checklist: { titulo: "Metas", items: [
    { id: "j", tx: "Jardín: pasto cortado", fecha: "2026-10-09", estado: 0 },
    { id: "a", tx: "Azotea: techo limpio, impermeabilizado y panal resuelto", fecha: "2026-10-09", estado: 0 },
    { id: "i", tx: "Interior: cielo pintado", fecha: "2026-10-16", estado: 0 },
    { id: "f", tx: "Focos: todos funcionando", fecha: "2026-10-03", estado: 2, cumplida: "2026-10-03" }] } }; }
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  try { await p.goto("file://" + tmp);
    var r = await p.evaluate(function (T) { window.__supAb = {};
      var t = JSON.parse(JSON.stringify(T)), o = {};
      o.vista = [vistaSup(t), vistaSup({ id: "x", duenio: "salvador", msgs: [] }), vistaSup({ id: "y", duenio: "samuel", revisores: ["salvador"], checklist: { titulo: "Metas", items: [{ id: "1", tx: "x" }] } }), vistaSup({ id: "z", duenio: "samuel", revisores: ["salvador"] })];
      o.sub = subSupHTML(t);
      var m = document.getElementById("m"); m.innerHTML = '<div class="hd">' + o.sub + '</div>' + vEntregas(t) + vSupSecciones(t) + '<div class="sug">' + sugSup(t) + '</div>';
      o.metasHead = m.querySelector('[data-ssec="metas"] .ssh').textContent;
      o.rows = Array.prototype.map.call(m.querySelectorAll(".smeta"), function (x) { var c = getComputedStyle(x.querySelector(".f")).color; return [x.querySelector(".t").textContent, x.querySelector(".f").textContent, c === "rgb(255, 69, 58)" ? c : "normal"]; });
      o.botones = m.querySelectorAll("[data-metaok],[data-metafoto],.mtok,.mtfoto").length;
      o.hist = (m.querySelector(".shist") || {}).textContent;
      o.ctx = m.querySelector('[data-ssec="ctx"] .sone').textContent; o.datos = m.querySelector('[data-ssec="datos"] .sone').textContent;
      o.nada = m.querySelector(".suptodo").textContent; o.gigante = m.querySelectorAll(".autbtn").length;
      return o; }, LERDO());
    eq("vista supervisor: externo (sí), sin ejecutor (no), Doit con metas y yo revisor (sí), Doit sin metas (no, queda la de antes)", r.vista, [true, false, true, false]);
    eq("encabezado (233): 'De Manuel · sup. tú'", r.sub, "De Manuel · sup. tú");
    eq("Metas abierta y compacta: 1 renglón por meta; ROJO solo si atrasada", r.rows,
      [["Jardín", "atrasada · 2 días", "rgb(255, 69, 58)"], ["Azotea", "atrasada · 2 días", "rgb(255, 69, 58)"], ["Interior", "vie 16 oct", "normal"]]);
    eq("encabezado de Metas con el conteo en rojo", r.metasHead, "Metas2 atrasadas · 3▴");
    eq("al supervisor NO le salen Cumplida ni Foto", r.botones, 0);
    eq("historial resumido", r.hist, "Historial · 1 cumplida");
    eq("Contexto y Datos plegados con 1 línea", [r.ctx, r.datos], ["Mantenimiento integral de la casa Lerdo; Manuel ejecuta, Salvador supervisa.", "Seguimiento lunes, miércoles y viernes 10:00 · se comparte con 3"]);
    eq("abajo: 'Nada pendiente para ti', sin botón gigante", [r.nada, r.gigante], ["Nada pendiente para ti", 0]);
    await p.screenshot({ path: path.join(os.tmpdir(), "b224-sup.png") });
    /* entrega por aprobar */
    var e = await p.evaluate(function (T) { var t = JSON.parse(JSON.stringify(T)); t.checklist.items[1].estado = 1; t.checklist.items[1].entrega = { ts: 1, fotos: ["data:image/gif;base64,R0lGODlhAQABAAAAACw=", "data:image/gif;base64,R0lGODlhAQABAAAAACw=", "data:image/gif;base64,R0lGODlhAQABAAAAACw="], resumen: "techo limpio, sin panal, impermeabilizado" };
      var m = document.getElementById("m"); m.innerHTML = vEntregas(t) + vSupSecciones(t) + '<div class="sug">' + sugSup(t) + '</div>';
      var c = m.querySelector(".entc"), o = { q: c.querySelector(".eq").textContent, s: c.querySelector(".es").textContent, fotos: c.querySelectorAll(".eth img").length,
        btn: Array.prototype.map.call(c.querySelectorAll(".ebk"), function (x) { return x.textContent; }), sig: c.querySelector(".enx").textContent, fila: m.querySelectorAll(".smeta")[1].textContent, todo: m.querySelector(".suptodo").textContent };
      WA.length = 0; o.ap = apruebaMeta(t, "a"); o.est = t.checklist.items[1].estado; o.foto = !!t.checklist.items[1].foto; o.wa = WA.map(function (x) { return x.texto; });
      t.checklist.items[2].estado = 1; o.cor = pideCorreccion(t, "i"); o.est2 = t.checklist.items[2].estado; o.cnl = window.__cnl[t.id]; o.pf = window.__prefill.tx;
      return o; }, LERDO());
    await p.screenshot({ path: path.join(os.tmpdir(), "b224-entrega.png") });
    eq("tarjeta: 'Manuel terminó Azotea' con la evidencia que revisó Claude", [e.q, e.s, e.fotos], ["Manuel terminó Azotea", "Claude revisó la evidencia: 3 fotos · techo limpio, sin panal, impermeabilizado", 3]);
    eq("botones Aprobar / Pedir corrección y la siguiente meta", [e.btn, e.sig], [["Aprobar", "Pedir corrección"], "Sigue: Jardín · vie 9 oct"]);
    eq("en Metas sale 'por aprobar'; abajo dice que hay algo para él", [e.fila, e.todo], ["Azoteapor aprobar", "1 cosa para ti arriba"]);
    eq("Aprobar: cumplida, con foto, y se le agradece al ejecutor por la cola", [e.ap, e.est, e.foto, e.wa], ["Aprobada: “Azotea”. Queda en el historial.", 2, true, ["IA: ¡Gracias, Manuel! Salvador aprobó “Azotea”."]]);
    eq("Pedir corrección: vuelve a en curso y deja listo el texto en el canal de Manuel", [e.cor, e.est2, e.cnl, e.pf], ["Dicta qué falta en “Interior”", 0, "ext:Manuel Parra", "Para cerrar “Interior” falta: "]);
    /* ejecutor de Doit */
    var x = await p.evaluate(function () { yo = "samuel"; var t = { id: "tS", nombre: "Bodega", duenio: "samuel", revisores: ["salvador"], msgs: [], checklist: { titulo: "Metas", items: [{ id: "b", tx: "Bodega: limpia", fecha: "2026-10-12", estado: 0 }] } };
      PUSH.length = 0; var m = cumpleMeta(t, "b", "data:x"); var o = { vista: vistaSup(t), est: m.estado, ent: !!m.entrega && m.entrega.fotos.length, push: PUSH.map(function (q) { return q.join(" | "); }), msg: t.msgs[0].t };
      var t2 = { id: "tS2", nombre: "x", duenio: "samuel", msgs: [], checklist: { titulo: "Metas", items: [{ id: "c", tx: "C", estado: 0 }] } }; o.sinSup = cumpleMeta(t2, "c").estado; yo = "salvador"; return o; });
    eq("ejecutor de Doit: él ve su vista normal (con Cumplida/Foto); su Cumplida queda POR APROBAR con la foto y avisa al supervisor",
      [x.vista, x.est, x.ent, x.push, x.msg], [false, 1, 1, ["salvador | Por aprobar: “Bodega”"], "Entregaste “Bodega” con foto. Falta que la apruebe tu supervisor."]);
    eq("sin supervisor, Cumplida cierra como antes", x.sinSup, 2);
    var fz = await p.evaluate(function (T) { var t = JSON.parse(JSON.stringify(T)); t._rev = "falta"; var a = sugSup(t); t._falta = ["el próximo seguimiento"]; var b = sugSup(t); t._falta = []; t._completa = true; var c = sugSup(t); return [a, b, c]; }, LERDO());
    eq("en Falta info: lo que le falta en texto, o un 'Autorizar' discreto", fz, ['<div class="suptodo vac">Nada pendiente para ti</div>', '<div class="suptodo">Falta: el próximo seguimiento</div>', '<button class="op k supaut" id="autrev">Autorizar</button>']);
    /* franja: no se aplasta */
    var fr = await p.evaluate(function () { var m = document.getElementById("m");
      m.innerHTML = '<div style="display:flex;flex-direction:column;height:300px"><div style="height:280px;flex:none"></div><div class="cnlwrap"><button class="cnlpill" style="--cc:#30d158"><i></i>Manuel Parra · WhatsApp ▾</button></div><div style="flex:1;min-height:200px"></div></div>';
      var w = m.querySelector(".cnlwrap"), b = w.querySelector(".cnlpill"); return [Math.round(w.getBoundingClientRect().height) >= Math.round(b.getBoundingClientRect().height), getComputedStyle(w).flexShrink]; });
    eq("la franja de canales nunca se aplasta (flex:none) aunque no quepa todo", fr, [true, "0"]);
    /* lugares en el código */
    si("encabezado, sin Tarea|Dato ni la pastilla 'Lo hace' que se desbordaba", /\(propietario233\(t\)\?\x27<div class="d own233">\x27\+esc\(propietario233\(t\)\)\+\x27<\/div>\x27:\x27\x27\)/.test(html) && /tipoRevisar\(t\)==="falta" && !vistaSup\(t\) && esIA\(t\)\) h\+=vTipoToggle/.test(html) && /if\(t\.revisa_a \|\| \(t\.revisa_ext && !vistaSup\(t\)\)\)\{/.test(html));
    si("secciones y entregas en lugar del bloque de metas; abajo sugSup; sin la tarjeta grande de Falta info", /vVuelta\(t\)\+vEntregas\(t\)\+bannerDecision\(t\)/.test(html) && /if\(vistaSup\(t\)\) sug=sugSup\(t\);/.test(html) && /return vistaSup\(t\)\?"":vFaltaInfo\(t\);/.test(html));
    si("las notas del campo 'notas' (nota_privada) se pintan en su lugar; las privadas solo para Salvador", /var _nts=\(Array\.isArray\(t\.notas\)\?t\.notas:\[\]\)\.filter\(function\(n\)\{ return n && String\(n\.t\|\|""\)\.trim\(\) && !n\.oculto && \(!n\.privado \|\| yo==="salvador"\)/.test(html) && /_evHasta\(x\.ts\); _ntHasta\(x\.ts\);/.test(html));
    si("una meta entregada no cuenta como atrasada", /metaCumplida\(m\) \|\| \(\+m\.estado\|\|0\)===1 \|\|/.test(html));
    eq("sin errores de página", errs, []);
  } finally { await b.close(); try { fs.unlinkSync(tmp); } catch (e) {} }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
