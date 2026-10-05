#!/usr/bin/env node
/* PRUEBAS build 213 (Salvador 7:56): dictando entra una llamada; al volver, en pausa, "seguir" no seguia ni mandaba.
   Corre en Chromium real (Playwright): las funciones REALES de index.html (abreDictado, pintaDictado, pausaDictado,
   sigueDictado, enlazaRec, reaccionaFrio, borrador) con un motor de voz falso que se puede "matar" como el del iPhone.
   Correr: TZ=America/Monterrey node tests/b213.test.js */
"use strict";
var fs = require("fs"), path = require("path"), os = require("os");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"), L = html.split("\n");
function saca(n) { var re = new RegExp("^(function " + n.replace(/\$/g, "\\$") + "\\(|var " + n + "\\s*=)"), i = -1; L.forEach(function (l, k) { if (re.test(l)) i = k; });
  if (i < 0) throw new Error("no encontre " + n); var o = [L[i]]; for (var k = i + 1; k < L.length; k++) { var x = L[k]; if (x.length && !/^[\s}\]]/.test(x)) break; o.push(x); if (/^}/.test(x)) break; } return o.join("\n"); }
var F = ["barritasAudio", "abreDictado", "svgBasura", "pintaDictado", "cierraDictado", "marcaVivo", "paraVigia", "reaccionaFrio", "pausaDictado", "_dictaTexto", "guardaBorrador", "leeBorrador",
  "borraBorrador", "srLogD", "pintaPausa", "sigueDictado", "ofreceBorrador", "enlazaRec", "paraDictadoHilo", "srJunta", "srCorte", "srArranca"];
var _iv = html.indexOf('document.addEventListener("visibilitychange", function(){\n  if(document.visibilityState==="hidden"){ guardaBorrador();'), _fv = html.indexOf("\n", html.indexOf('window.addEventListener("pagehide"', _iv));
if (_iv < 0 || _fv < 0) throw new Error("no encontre el oyente de visibilitychange/pagehide");
var codigo = F.map(saca).join("\n") + "\n" + html.slice(_iv, _fv);   /* los oyentes REALES de llamada / cambio de app */
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
si("VERSION_APP build 213 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 213);
var pagina = '<!doctype html><meta charset="utf-8"><body><textarea id="txt"></textarea><button id="tenv"></button><button id="tmic"></button><script>' +
  'var vista="hilo", abierta="tmuuqah2egllq0", tareas=[{id:"tmuuqah2egllq0", nombre:"Fiesta Navideña Cumbres"}], TOAST=[], ENVIADO=[], RECARGO=false;' +
  'function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); } function ico(){ return ""; } function toast(t){ TOAST.push(t); } function render(){} function marcaEnvio(){}' +
  'function enviaHilo(){ ENVIADO.push(document.getElementById("txt").value); }' +
  'var SRS=[], MODO="vivo"; function FakeSR(){ SRS.push(this); } FakeSR.prototype.start=function(){ var me=this; me.vivo=true; if(MODO==="vivo") setTimeout(function(){ me.onaudiostart&&me.onaudiostart(); },50); };' +
  'FakeSR.prototype.stop=function(){ this.vivo=false; }; FakeSR.prototype.abort=function(){ this.vivo=false; this.abortado=true; };' +
  'FakeSR.prototype.di=function(tx,fin){ var r=[{transcript:tx}]; r.isFinal=!!fin; this.onresult({resultIndex:0, results:[r]}); };' +
  'window.webkitSpeechRecognition=FakeSR; window.SpeechRecognition=FakeSR;' +
  /* el flujo del microfono de la tarea, como en pintaHilo */
  'function dictaEnTarea(){ var ta=document.getElementById("txt"); var r=new FakeSR(); window.__rec=r; window.__oyendo=true; var previo=ta.value?ta.value+" ":""; window.__dicho=""; window.__parcial="";' +
  ' r.lang="es-MX"; r.continuous=true; r.interimResults=true; abreDictado(function(){ paraDictadoHilo(); enviaHilo(); }, function(){ paraDictadoHilo(); ta.value=""; });' +
  ' r.onresult=function(ev){ if(window.__pausado) return; var interim="", fin=""; for(var k=ev.resultIndex;k<ev.results.length;k++){ var x=ev.results[k][0].transcript; if(ev.results[k].isFinal) fin+=x; else interim+=x; }' +
  '  if(fin) window.__dicho+=fin+" "; ta.value=(previo+window.__dicho+interim).trim(); marcaVivo(); window.__parcial=interim; pintaDictado(); };' +
  ' enlazaRec(r, paraDictadoHilo); r.start(); }' +
  codigo.replace(/<\/script>/g, "<\\/script>") + '</script>';
var tmp = path.join(os.tmpdir(), "b213-" + process.pid + ".html"); fs.writeFileSync(tmp, pagina);
(async function () {
  var pw; try { pw = require("/opt/node22/lib/node_modules/playwright"); } catch (e) { console.log("  X falta Playwright"); process.exit(1); }
  var b = await pw.chromium.launch(), p = await b.newPage(), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  try { await p.goto("file://" + tmp);
  await p.evaluate(function () { localStorage.clear(); window.MARCA = 1; dictaEnTarea(); SRS[0].di("Esto es para Claude, la fiesta es el 15 de diciembre", true); SRS[0].di("y quiero", false); });
  var bor = await p.evaluate(function () { return JSON.parse(localStorage.getItem("doit_dictado")); });
  eq("en CADA resultado parcial lo dicho queda guardado en el teléfono (con la tarea)", [bor.texto, bor.tid, bor.campo], ["Esto es para Claude, la fiesta es el 15 de diciembre y quiero", "tmuuqah2egllq0", "txt"]);
  /* entra la llamada: la app se oculta */
  await p.evaluate(function () { Object.defineProperty(document, "visibilityState", { configurable: true, get: function () { return "hidden"; } }); document.dispatchEvent(new Event("visibilitychange")); });
  var st = await p.evaluate(function () { return { pausa: !!window.__enPausa, sigue: !!document.getElementById("dpsigue"), manda: !!document.getElementById("dpmanda"), ta: document.getElementById("txt").value,
    log: JSON.parse(localStorage.getItem("doit_sr_log") || "[]").filter(function (x) { return x.ev === "pausa"; }).slice(-1)[0] }; });
  eq("llamada: queda en pausa con lo dicho (el parcial no se pierde) y dos botones", [st.pausa, st.sigue, st.manda, st.ta], [true, true, true, "Esto es para Claude, la fiesta es el 15 de diciembre y quiero"]);
  eq("queda en el registro por qué se pausó", st.log && st.log.motivo, "app oculta (llamada, otra app o bloqueo)");
  /* cuelga; "Seguir dictando" con el micrófono que ya no oye (lo que le pasó) */
  await p.evaluate(function () { Object.defineProperty(document, "visibilityState", { configurable: true, get: function () { return "visible"; } }); document.dispatchEvent(new Event("visibilitychange")); MODO = "muerto"; document.getElementById("dpsigue").click(); });
  var n1 = await p.evaluate(function () { return SRS.length; });
  eq("'Seguir dictando' abre un motor NUEVO (no reusa el abortado)", n1, 2);
  await p.waitForTimeout(5200);
  st = await p.evaluate(function () { return { marca: window.MARCA, pausa: !!window.__enPausa, msg: (document.querySelector(".dpmsg") || {}).textContent || "", ta: document.getElementById("txt").value, capa: !!document.getElementById("dictacapa"), bor: !!localStorage.getItem("doit_dictado") }; });
  eq("si el micrófono no oye: NO recarga ni cierra; vuelve a la pausa y lo dice", [st.marca, st.pausa, st.capa, /^No pude volver a abrir el micrófono\. Lo que llevas está guardado/.test(st.msg)], [1, true, true, true]);
  eq("…y lo dicho sigue ahí (caja y teléfono)", [st.ta, st.bor], ["Esto es para Claude, la fiesta es el 15 de diciembre y quiero", true]);
  /* ahora sí oye: sigue y PEGA a lo que llevaba */
  await p.evaluate(function () { MODO = "vivo"; document.getElementById("dpsigue").click(); });
  await p.waitForTimeout(200);
  await p.evaluate(function () { SRS[SRS.length - 1].di("que me recuerdes el martes", true); });
  st = await p.evaluate(function () { return { ta: document.getElementById("txt").value, pausa: !!window.__enPausa, oye: !!window.__oyendo }; });
  eq("'Seguir dictando' funciona de verdad: reabre y concatena", st, { ta: "Esto es para Claude, la fiesta es el 15 de diciembre y quiero que me recuerdes el martes", pausa: false, oye: true });
  /* pausa otra vez y "Mandar así" */
  await p.evaluate(function () { pausaDictado(window.__rec, window.__recStop); document.getElementById("dpmanda").click(); });
  st = await p.evaluate(function () { return { env: ENVIADO.slice(-1)[0], bor: localStorage.getItem("doit_dictado"), capa: !!document.getElementById("dictacapa") }; });
  eq("'Mandar así' manda todo lo dicho y borra el guardado", st, { env: "Esto es para Claude, la fiesta es el 15 de diciembre y quiero que me recuerdes el martes", bor: null, capa: false });
  /* la app se cerró del todo: al volver se ofrece lo guardado */
  await p.evaluate(function () { document.getElementById("txt").value = ""; localStorage.setItem("doit_dictado", JSON.stringify({ texto: "la fiesta es el 15 de diciembre", campo: "txt", tid: "tmuuqah2egllq0", ts: Date.now() })); ofreceBorrador(); });
  st = await p.evaluate(function () { var e = document.getElementById("borrador"); return { hay: !!e, tx: e ? e.textContent : "", sig: !!document.getElementById("brsigue"), man: !!document.getElementById("brmanda") }; });
  si("al volver: 'Tienes un dictado sin mandar en “Fiesta Navideña Cumbres”' con Seguir dictando / Mandar así", st.hay && /Tienes un dictado sin mandar en “Fiesta Navideña Cumbres”la fiesta es el 15 de diciembre/.test(st.tx) && st.sig && st.man);
  await p.evaluate(function () { document.getElementById("tenv").onclick = function () { enviaHilo(); }; document.getElementById("brmanda").click(); });
  st = await p.evaluate(function () { return { env: ENVIADO.slice(-1)[0], bor: localStorage.getItem("doit_dictado"), banner: !!document.getElementById("borrador") }; });
  eq("'Mandar así' desde lo guardado: abre la tarea, lo pone y lo manda", st, { env: "la fiesta es el 15 de diciembre", bor: null, banner: false });
  await p.evaluate(function () { localStorage.setItem("doit_dictado", JSON.stringify({ texto: "y otra cosa", campo: "txt", tid: "tmuuqah2egllq0", ts: Date.now() })); ofreceBorrador(); document.getElementById("tmic").onclick = function () { window.MIC = 1; }; document.getElementById("brsigue").click(); });
  st = await p.evaluate(function () { return { ta: document.getElementById("txt").value, mic: window.MIC }; });
  eq("'Seguir dictando' desde lo guardado: lo pone en la caja y abre el micrófono (que pega lo nuevo)", st, { ta: "y otra cosa", mic: 1 });
  /* lo que se escribe a mano no es un "dictado sin mandar" */
  await p.evaluate(function () { localStorage.removeItem("doit_dictado"); document.getElementById("txt").value = "escrito a mano"; Object.defineProperty(document, "visibilityState", { configurable: true, get: function () { return "hidden"; } }); document.dispatchEvent(new Event("visibilitychange")); });
  eq("texto escrito (sin dictar) no se guarda como dictado", await p.evaluate(function () { return localStorage.getItem("doit_dictado"); }), null);
  si("reaccionaFrio ya no recarga con texto en la caja de la tarea", /var hayTexto=\(bq && String\(bq\.textContent\|\|""\)\.trim\(\)\) \|\| \(_ta && String\(_ta\.value\|\|""\)\.trim\(\)\) \|\| leeBorrador\(\);/.test(html));
  eq("sin errores de página", errs, []);
  } finally { await b.close(); try { fs.unlinkSync(tmp); } catch (e) {} }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
