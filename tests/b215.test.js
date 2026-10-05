#!/usr/bin/env node
/* PRUEBAS build 215 (Salvador 8:52): Eliminar archivos elegidos (con cola si el servidor aun no tiene borrar_archivo) y la hoja
   "¿Para quién es?" estilo Apple. En Chromium (Playwright) con las funciones y el CSS reales. Correr: node tests/b215.test.js */
"use strict";
var fs = require("fs"), path = require("path"), os = require("os");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"), L = html.split("\n");
function saca(n) { var re = new RegExp("^(function " + n.replace(/\$/g, "\\$") + "\\(|var " + n + "\\s*=)"), i = -1; L.forEach(function (l, k) { if (re.test(l)) i = k; });
  if (i < 0) throw new Error("no encontre " + n); var o = [L[i]]; for (var k = i + 1; k < L.length; k++) { var x = L[k]; if (x.length && !/^[\s}\]]/.test(x)) break; o.push(x); if (/^}/.test(x)) break; } return o.join("\n"); }
var F = ["adjuntos", "fuenteAdj", "eliminaAdjuntos", "borraEnServidor", "procesaEliminar", "hojaEliminar", "svgBasura", "SVG_DESTELLO", "SVG_CHAT", "preguntaExterno", "PUSH"];
var css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || "";
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
si("VERSION_APP build 215 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 215);
si("en la selección: Eliminar (bote rojo) junto a Apartar y Copiar", /'<button class="gsb rojo" id="gsdel"'\+\(_ns\?'':' disabled'\)\+'>'\+svgBasura\(\)\+'Eliminar<\/button><\/div>'/.test(html) && html.indexOf('id="gscop"') < html.indexOf('id="gsdel"'));
si("en el chat, lo eliminado ya no sale", /if\(x && x\.eliminado\) return;/.test(html));
si("las fotos subidas desde la app (en el chat, de puntos y de la tarea origen) tampoco salen si se eliminaron",
  /var _evs=\(t\.evidencias\|\|\[\]\)\.filter\(function\(f\)\{ return f && !f\.eliminado; \}\)/.test(html) &&
  /var fotosArr=Object\.keys\(ft\)\.map\(function\(k\)\{return ft\[k\]\}\)\.filter\(function\(f\)\{ return f && !f\.eliminado; \}\)/.test(html) &&
  /var _orgEv=\(org\.evidencias\|\|\[\]\)\.filter\(function\(f\)\{ return f && !f\.eliminado; \}\)/.test(html));
si("el contador del clip sale de adjuntos() (que ya omite lo eliminado)", /function nuevos\(t\)\{ return Math\.max\(0, adjuntos\(t\)\.length/.test(html));
si("pastilla 'Claude' en naranja vivo #D97757 (sin descolorir)", /\.cnlpill\.cnlcl\{padding:6px 12px;opacity:1;[^}]*color:#D97757;border-color:#D97757/.test(html) && !/\.cnlpill\.cnlcl\{[^}]*opacity:\.55/.test(html));
var pagina = '<!doctype html><meta charset="utf-8"><style>' + css + '</style><body style="background:#111;color:#f5f5f7;font-family:-apple-system,sans-serif"><textarea id="txt"></textarea><script>' +
  'var yo="salvador", APP_TOKEN="tok", GUARDADO=0, TOAST=[], MODO="noexiste", LLAMADAS=[]; function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); }' +
  'function $(i){ return document.getElementById(i); } function guarda(){ GUARDADO++; } function toast(t){ TOAST.push(t); }' +
  'window.fetch=function(u,o){ LLAMADAS.push({u:u, b:JSON.parse(o.body)}); var ex=MODO==="existe"; return Promise.resolve({ok:ex, status:ex?200:400, json:function(){ return Promise.resolve(ex?{ok:true}:{error:"accion desconocida"}); }}); };' +
  F.map(saca).join("\n").replace(/<\/script>/g, "<\\/script>") + '</script>';
var tmp = path.join(os.tmpdir(), "b215-" + process.pid + ".html"); fs.writeFileSync(tmp, pagina);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  try { await p.goto("file://" + tmp);
  await p.evaluate(function () { window.T = { id: "tIAMUUK9ZCWJW", evidencias: [{ data: "data:image/jpeg;base64,AAAA", ts: 1 }], msgs: [
    { k: "bi", url: "https://doit.ok-doit.com/uploads/wa_media/sin_tarea/20261004_093334_f65c81.jpeg", tipo: "foto", t: "Salvador N.S.: wa_1.jpeg", ts: 2 },
    { k: "bi", url: "https://doit.ok-doit.com/uploads/wa_media/sin_tarea/20261004_093334_151028.jpeg", tipo: "foto", t: "Salvador N.S.: wa_2.jpeg", ts: 3 }] }; });
  eq("antes: 3 archivos", await p.evaluate(function () { return adjuntos(T).length; }), 3);
  /* la hoja de confirmacion */
  await p.evaluate(function () { window.SI = 0; hojaEliminar(2, function () { SI = 1; }); });
  var hj = await p.evaluate(function () { var v = document.getElementById("mveil"), cs = getComputedStyle(v), c = getComputedStyle(v.querySelector(".mcard")), r = getComputedStyle(document.getElementById("mvsi"));
    return { tx: v.innerText.replace(/\s+/g, " ").trim(), blur: cs.backdropFilter || cs.webkitBackdropFilter, rad: c.borderRadius, rojo: r.backgroundColor }; });
  eq("hoja: '¿Eliminar 2 archivos?' · 'No se podrán recuperar.' · Cancelar / Eliminar", hj.tx, "¿Eliminar 2 archivos? No se podrán recuperar. Cancelar Eliminar");
  si("con desenfoque de fondo y esquinas redondeadas; Eliminar en rojo", /blur\(14px\)/.test(hj.blur) && hj.rad === "18px" && hj.rojo === "rgb(255, 69, 58)");
  await p.screenshot({ path: path.join(os.tmpdir(), "b215-eliminar.png") });
  await p.click("#mvno"); eq("Cancelar: no hace nada", await p.evaluate(function () { return [SI, !!document.getElementById("mveil")]; }), [0, false]);
  /* eliminar sin endpoint: oculto + cola */
  var r = await p.evaluate(async function () { var x = eliminaAdjuntos(T, ["ev:0", "ms:0"]); var k = await procesaEliminar(T);
    return { n: x.n, urls: x.urls.length, quedan: adjuntos(T).length, bytes: T.evidencias[0].data, cola: (T.eliminar_pendiente || []).length, borrados: k, llamada: LLAMADAS[0] }; });
  eq("se eliminan 2: la foto guardada en la tarea pierde sus bytes ya; la del servidor queda oculta", [r.n, r.quedan, r.bytes], [2, 1, ""]);
  eq("sin endpoint: queda en la cola eliminar_pendiente (no se borra del servidor todavía)", [r.urls, r.cola, r.borrados], [1, 1, 0]);
  eq("pide al servidor borrar_archivo {tarea_id, url}", [/\?action=borrar_archivo$/.test(r.llamada.u), r.llamada.b], [true, { tarea_id: "tIAMUUK9ZCWJW", url: "https://doit.ok-doit.com/uploads/wa_media/sin_tarea/20261004_093334_f65c81.jpeg" }]);
  si("el aviso de una línea", /"Eliminé "\+r\.n\+"\. Se borrarán del servidor en cuanto esté listo\."/.test(html));
  /* cuando el endpoint exista: se borra solo */
  r = await p.evaluate(async function () { MODO = "existe"; var k = await procesaEliminar(T); return { k: k, cola: T.eliminar_pendiente.length, marca: !!T.msgs[0].borrado_servidor }; });
  eq("cuando Carlos ponga borrar_archivo: la cola se vacía sola y queda marcado como borrado", r, { k: 1, cola: 0, marca: true });
  si("se reintenta al abrir la app", /tareas\.forEach\(function\(t\)\{ if\(t && \(t\.eliminar_pendiente\|\|\[\]\)\.length\) procesaEliminar\(t\); \}\);/.test(html));
  /* la hoja "¿Para quién es?" */
  await p.evaluate(function () { window.R = ""; preguntaExterno("Rogelio Sada", "dile que la fiesta es el 13 de noviembre", function () { R = "wa"; }, function () { R = "equipo"; }, function () { R = "claude"; }); });
  var hs = await p.evaluate(function () { var s = document.querySelector(".acsheet"), v = document.querySelector(".acveil"), cl = s.querySelector(".acl b"), wa = s.querySelector(".awa b");
    return { tx: s.innerText.replace(/\s+/g, " ").trim(), blur: getComputedStyle(v).backdropFilter, cl: getComputedStyle(cl).color, clIco: getComputedStyle(s.querySelector(".acl .aci")).color, wa: getComputedStyle(wa).color,
      abajo: s.getBoundingClientRect().bottom > window.innerHeight - 60, svgs: s.querySelectorAll(".aci svg").length }; });
  eq("hoja inferior: título, Para Claude, Mandar a Rogelio Sada, Solo al equipo, Cancelar", hs.tx, "¿Para quién es? “dile que la fiesta es el 13 de noviembre” Para Claude Lo aplica en la tarea Mandar a Rogelio Sada Por WhatsApp Solo al equipo Cancelar");
  si("abajo, con desenfoque y un ícono en cada opción", hs.abajo && /blur\(12px\)/.test(hs.blur) && hs.svgs === 2);
  eq("'Para Claude' (y su destello) en el naranja de Claude; 'Mandar a' en verde", [hs.cl, hs.clIco, hs.wa], ["rgb(217, 119, 87)", "rgb(217, 119, 87)", "rgb(48, 209, 88)"]);
  await p.screenshot({ path: path.join(os.tmpdir(), "b215-para.png") });
  await p.click('[data-ac="claude"]'); eq("'Para Claude' -> Claude", await p.evaluate(function () { return [R, !!document.querySelector(".acsheet")]; }), ["claude", false]);
  await p.evaluate(function () { preguntaExterno("Rogelio Sada", "x", function () { R = "wa"; }, function () { R = "equipo"; }, function () { R = "claude"; }); });
  await p.click('[data-ac="wa"]'); eq("'Mandar a…' -> WhatsApp", await p.evaluate(function () { return R; }), "wa");
  await p.evaluate(function () { preguntaExterno("Rogelio Sada", "otra cosa", function () { R = "wa"; }, function () { R = "equipo"; }, function () { R = "claude"; }); });
  await p.click('[data-ac="cancel"]'); eq("Cancelar: regresa el texto a la caja", await p.evaluate(function () { return document.getElementById("txt").value; }), "otra cosa");
  si("el destello es propio (no el logo de Claude) y el ícono de WhatsApp es de línea genérico", /var SVG_DESTELLO='<svg viewBox="0 0 24 24"/.test(html) && /var SVG_CHAT='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"/.test(html));
  eq("sin errores de página", errs, []);
  } finally { await b.close(); try { fs.unlinkSync(tmp); } catch (e) {} }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
