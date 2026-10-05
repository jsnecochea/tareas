#!/usr/bin/env node
/* PRUEBAS build 216 (Salvador): opcion "Para mí (nota)" en la hoja "¿Para quién es?". Nota privada: no sale por
   WhatsApp, no avisa, no es orden para Claude; Claude si la lee como contexto y entra en la busqueda.
   En Chromium (Playwright) con las funciones y el CSS reales. Correr: node tests/b216.test.js */
"use strict";
var fs = require("fs"), path = require("path"), os = require("os");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"), L = html.split("\n");
function saca(n) { var re = new RegExp("^(function " + n.replace(/\$/g, "\\$") + "\\(|var " + n + "\\s*=)"), i = -1; L.forEach(function (l, k) { if (re.test(l)) i = k; });
  if (i < 0) throw new Error("no encontre " + n); var o = [L[i]]; for (var k = i + 1; k < L.length; k++) { var x = L[k]; if (x.length && !/^[\s}\]]/.test(x)) break; o.push(x); if (/^}/.test(x)) break; } return o.join("\n"); }
var F = ["SVG_DESTELLO", "SVG_CHAT", "SVG_LAPIZ", "hayEquipo", "notaParaMi", "preguntaExterno", "camposBusqueda", "detalleTarea", "msg"];
var css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || "";
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
si("VERSION_APP build 216 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 216);
si("los dos lugares que preguntan pasan 'Para mí' y 'A todo el equipo' solo si hay equipo",
  (html.match(/hayEquipo\(t\)\?function\(\)\{ (msg\(t,"bo",_v[NR]\);|mandaAlEquipo\(t, _v[NR],)[^\n]*:null,\n\s*function\(\)\{ notaClaude\(t, _v[NR]\); \}, function\(\)\{ notaParaMi\(t, _v[NR]\); \}\);/g) || []).length === 2);   /* build 217: A todo el equipo = mandaAlEquipo */
si("la nota no se vuelve indicacion para Claude (los canales priv: no se convierten)", /c\.indexOf\("priv:"\)===0 \|\| c==="sup"\) return false;/.test(html));
si("en el chat se ve marcada 'nota para ti'", /\(x\.nota_mia\?" · nota para ti":""\)/.test(html));
si("las notas privadas de otros no se pintan (canal priv:<otro>)", /if\(_cx\.indexOf\("priv:"\)===0 && _cx!=="priv:"\+yo\) return;/.test(html));
si("Claude al ejecutar una nota lee tus notas como contexto (marcadas), aunque sean viejas", /\(nota suya, contexto\)/.test(html) && /\.slice\(0,-40\)\.forEach\(function\(x\)\{ if\(x && x\.nota_mia && x\.de===yo/.test(html));
si("por voz se lee 'Tu nota:'", /"Tú \(nota\)"\?"Tu nota: "/.test(html));
var pagina = '<!doctype html><meta charset="utf-8"><style>' + css + '</style><body style="background:#111;color:#f5f5f7;font-family:-apple-system,sans-serif"><textarea id="txt"></textarea><script>' +
  'var yo="salvador", PERSONAS={salvador:{nombre:"Salvador"}, samuel:{nombre:"Samuel"}}, GUARDADO=0, TOAST=[], INTS=[]; function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); }' +
  'function $(i){ return document.getElementById(i); } function guarda(){ GUARDADO++; } function toast(t){ TOAST.push(t); } function render(){} function hhmm(){ return "9:10"; }' +
  'function integrantesDe(t){ return INTS; } function estadoReal(){ return "abierta"; } function ritmo(){ return null; } function adjuntos(){ return []; } function fechaCorta(d){ return "5 oct"; }' +
  F.map(saca).join("\n").replace(/<\/script>/g, "<\\/script>") + '</script>';
var tmp = path.join(os.tmpdir(), "b216-" + process.pid + ".html"); fs.writeFileSync(tmp, pagina);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  try { await p.goto("file://" + tmp);
  async function abre(conEquipo) {
    return p.evaluate(function (ce) { window.R = ""; window.T = { id: "t1", nombre: "Fiesta", msgs: [] };
      INTS = ce ? [{ k: "salvador" }, { k: "samuel" }, { k: "ext:Rogelio Sada" }] : [{ k: "salvador" }, { k: "ext:Rogelio Sada" }];
      preguntaExterno("Rogelio Sada", "el salón cobra 18 mil", function () { R = "wa"; }, hayEquipo(T) ? function () { R = "equipo"; } : null,
        function () { R = "claude"; }, function () { notaParaMi(T, "el salón cobra 18 mil"); R = "mia"; });
      var s = document.querySelector(".acsheet");
      return { orden: Array.prototype.map.call(s.querySelectorAll("[data-ac]"), function (e) { return e.getAttribute("data-ac"); }),
        tx: s.innerText.replace(/\s+/g, " ").trim(), ico: getComputedStyle(s.querySelector(".ami .aci")).color, svg: !!s.querySelector(".ami .aci svg") }; }, conEquipo);
  }
  var h = await abre(true);
  eq("con equipo: Para Claude, Mandar a, A todo el equipo, Para mí, Cancelar", h.orden, ["claude", "wa", "equipo", "mia", "cancel"]);
  si("dice 'Para mí (nota)' · 'Solo tú la ves · no se manda'", /Para mí \(nota\) Solo tú la ves · no se manda Cancelar$/.test(h.tx));
  eq("ícono de lápiz de línea en azul", [h.svg, h.ico], [true, "rgb(10, 132, 255)"]);
  await p.screenshot({ path: path.join(os.tmpdir(), "b216-para.png") });
  await p.click('[data-ac="mia"]');
  var r = await p.evaluate(function () { var m = T.msgs[0]; return { R: R, k: m.k, t: m.t, de: m.de, canal: m.canal, mia: m.nota_mia, nc: !!m.nota_claude, wa: !!(m.wa || m.wa_auto), g: GUARDADO, toast: TOAST[0], hoja: !!document.querySelector(".acsheet") }; });
  eq("Para mí: nota privada tuya, sin WhatsApp ni orden a Claude, guardada", r,
    { R: "mia", k: "bo", t: "el salón cobra 18 mil", de: "salvador", canal: "priv:salvador", mia: 1, nc: false, wa: false, g: 1, toast: "Nota guardada · solo tú la ves", hoja: false });
  h = await abre(false);
  eq("sin nadie más de Doit en la tarea: no sale 'A todo el equipo'", h.orden, ["claude", "wa", "mia", "cancel"]);
  await p.click('[data-ac="cancel"]');
  /* busqueda y contexto de Claude */
  r = await p.evaluate(function () {
    var t = { id: "t2", nombre: "Comedor", msgs: [{ k: "bo", t: "la piedra mide 2.40 por 1.10", de: "salvador", canal: "priv:salvador", nota_mia: 1, ts: 1 },
      { k: "bo", t: "nota secreta de samuel", de: "samuel", canal: "priv:samuel", nota_mia: 1 }, { k: "bi", t: "foto", url: "x", eliminado: true },
      { k: "bo", t: "a", de: "salvador" }, { k: "bo", t: "b", de: "salvador" }, { k: "bo", t: "c", de: "salvador" }, { k: "bo", t: "d", de: "salvador" }] };
    var cs = camposBusqueda(t), d = detalleTarea(t, false);
    return { mia: cs.filter(function (c) { return c[0] === "mia"; }), otra: cs.some(function (c) { return /samuel/.test(c[2]); }), elim: cs.some(function (c) { return c[2] === "foto"; }),
      ctx: d.notas_mias_contexto_no_ordenes, notas: d.notas }; });
  eq("búsqueda: tu nota entra (pesa como dato)", r.mia, [["mia", 2, "la piedra mide 2.40 por 1.10"]]);
  eq("búsqueda: la nota privada de otro y lo eliminado no entran", [r.otra, r.elim], [false, false]);
  eq("Claude la lee como contexto aunque ya no esté entre los últimos mensajes", r.ctx, ["5 oct: la piedra mide 2.40 por 1.10"]);
  eq("y las notas recientes que lee no traen la privada de otro", r.notas, ["a", "b", "c", "d"]);
  si("la búsqueda dice 'tu nota' cuando pega ahí", /mia:"tu nota"/.test(html));
  eq("sin errores de página", errs, []);
  } finally { await b.close(); try { fs.unlinkSync(tmp); } catch (e) {} }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
