#!/usr/bin/env node
/* PRUEBAS build 217 (Salvador 5-oct 9:20 y 9:23: "todos los avisos iguales, por WhatsApp", con palomitas como WhatsApp).
   1) "A todo el equipo" queda en el canal equipo y ademas sale por WhatsApp a cada integrante de Doit de la tarea con su
      WhatsApp en la tarea (nunca a Salvador ni a quien escribe), un pedido por persona, misma cola que "Mandar a".
   2) Palomitas: reloj = en cola, ✓ enviado, ✓✓ gris entregado, ✓✓ azul leido (estado del pedido en el servidor).
   3) "Para mí (nota)" y "Para Claude" no llevan palomitas. 4) Lo redactado por Claude lleva "IA: " desde la app.
   En Chromium (Playwright) con las funciones y el CSS reales. Correr: node tests/b217.test.js */
"use strict";
var fs = require("fs"), path = require("path"), os = require("os");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8"), L = html.split("\n");
function saca(n) { var re = new RegExp("^(function " + n.replace(/\$/g, "\\$") + "\\(|var " + n + "\\s*=)"), i = -1; L.forEach(function (l, k) { if (re.test(l)) i = k; });
  if (i < 0) throw new Error("no encontre " + n); var o = [L[i]]; for (var k = i + 1; k < L.length; k++) { var x = L[k]; if (x.length && !/^[\s}\]]/.test(x)) break; o.push(x); if (/^}/.test(x)) break; } return o.join("\n"); }
var F = ["_nn", "_telDe", "_nomWA", "esMsgWA", "miembroDeNombre", "_cwMemo", "contactosWA", "_contactosWA", "integrantesDe", "msg",
  "equipoConWA", "mandaAlEquipo", "WA_EST", "nivelWA", "llevaPalomitas", "pidsWA", "nivelMsgWA", "SVG_WA_RELOJ", "SVG_WA_1", "SVG_WA_2",
  "palomitasHTML", "_estadosDe", "aplicaEstadosWA", "consultaEstadosWA", "conIA"];
var css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/) || [])[1] || "";
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }
/* ---- en el codigo ---- */
si("VERSION_APP build 217 o posterior", +((html.match(/var VERSION_APP = "build (\d+)/) || [])[1] || 0) >= 217);
si("build 218: la opción dice 'A todo el equipo'", /data-ac="equipo">A todo el equipo<\/button>/.test(html));
eq("los dos 'A todo el equipo' usan mandaAlEquipo", (html.match(/hayEquipo\(t\)\?function\(\)\{ mandaAlEquipo\(t, _v[NR], (_cita|null)\); \}:null,/g) || []).length, 2);
si("ya no queda el 'A todo el equipo' que solo guardaba en el canal", !/hayEquipo\(t\)\?function\(\)\{ msg\(t,"bo",_v[NR]\)/.test(html));
si("palomitas en la burbuja normal (a la derecha, dentro de la hora)", /palomitasHTML\(x\)\+'<\/span>'\+/.test(html));
si("palomitas en la burbuja compacta de WhatsApp", /\+cab\+palomitasHTML\(x\)\+'<button/.test(html));
si("Mandar a: tras crear el pedido pregunta su estado", /m\.wa_pid=pid; guarda\(t\); if\(vista==="hilo"&&abierta===t\.id\) render\(\); setTimeout\(function\(\)\{ consultaEstadosWA\(t\); \}, 15000\);/.test(html));
si("lo redactado por Claude (dile a, programado, respaldo) lleva conIA", /texto:conIA\(_txPed\)/.test(html) && /texto:conIA\(etiquetasWA\(a_las, sino\)\+texto\)/.test(html) && /texto:conIA\(wp\.texto\)/.test(html));
si("lo escrito a mano (Mandar a / contestar en el chat) va tal cual, sin conIA", /var cpo=\{usuario:yo, tarea_id:t\.id, contacto:nombre, texto:v, auto_respuesta:1/.test(html) && /cpo=\{usuario:yo, tarea_id:t\.id, contacto:contacto, texto:v, auto_respuesta:1/.test(html));
var pagina = '<!doctype html><meta charset="utf-8"><style>' + css + '</style><body style="background:#111;color:#f5f5f7;font-family:-apple-system,sans-serif"><div class="msgs" id="m"></div><script>' +
  'var yo="salvador", PERSONAS={salvador:{nombre:"Salvador",jefe:true}, samuel:{nombre:"Samuel"}, cynthia:{nombre:"Cynthia"}, josue:{nombre:"Josué",jefe:true}}, GUARDADO=0, TOAST=[], PED=[], RENDER=0, vista="hilo", abierta="t1", PUSH="push.php", APP_TOKEN="tok", FETCH=[], RESP=null;' +
  'function guarda(){ GUARDADO++; } function toast(t){ TOAST.push(t); } function render(){ RENDER++; } function hhmm(){ return "9:30"; }' +
  'function pideWhatsApp(c){ PED.push(c); return Promise.resolve({id:"p"+PED.length}); }' +
  'window.fetch=function(u,o){ FETCH.push({u:u, b:JSON.parse(o.body)}); return Promise.resolve({ok:true, status:200, json:function(){ return Promise.resolve(RESP); }}); };' +
  F.map(saca).join("\n").replace(/<\/script>/g, "<\\/script>") + '</script>';
var tmp = path.join(os.tmpdir(), "b217-" + process.pid + ".html"); fs.writeFileSync(tmp, pagina);
(async function () {
  var pw = require("/opt/node22/lib/node_modules/playwright"), b = await pw.chromium.launch(), p = await b.newPage({ viewport: { width: 390, height: 844 } }), errs = [];
  p.on("pageerror", function (e) { errs.push(e.message); });
  try { await p.goto("file://" + tmp);
  /* ---- 1) A todo el equipo ---- */
  var r = await p.evaluate(async function () {
    var t = { id: "t1", nombre: "Portón", duenio: "salvador", encargado: "cynthia", msgs: [
      { k: "bi", t: "Samuel Gamez: ya llegó la grúa", wa_in: 1, wa_c: "Samuel Gamez", ts: 1 },
      { k: "bi", t: "Josué: listo el servidor", wa_in: 1, wa_c: "Josué Ramírez", ts: 2 },
      { k: "bi", t: "Salvador: va", wa_in: 1, wa_c: "Salvador", ts: 3 },
      { k: "bi", t: "Rogelio Sada: ¿cuánto?", wa_in: 1, wa_c: "Rogelio Sada", ts: 4 }] };
    var lista = equipoConWA(t);
    var m = mandaAlEquipo(t, "Mañana a las 9 viene el herrero", null);
    await new Promise(function (r) { setTimeout(r, 30); });
    return { lista: lista, canal: m.canal, de: m.de, eq: m.wa_eq, pids: m.wa_pids, ped: PED.map(function (x) { return [x.contacto, x.texto, x.auto_respuesta, x.tarea_id, !!x.desde_ts]; }), toast: TOAST.slice(-1)[0], g: GUARDADO > 0 };
  });
  eq("a quién: integrantes de Doit con WhatsApp en la tarea (ni Salvador, ni Cynthia sin WhatsApp, ni el externo)", r.lista, [{ k: "samuel", c: "Samuel Gamez" }, { k: "josue", c: "Josué Ramírez" }]);
  eq("queda en el canal equipo, tuyo, con a quién salió", [r.canal, r.de, r.eq], ["equipo", "salvador", ["Samuel Gamez", "Josué Ramírez"]]);
  eq("un pedido por persona, texto tal cual (sin IA:), misma cola que Mandar a", r.ped,
    [["Samuel Gamez", "Mañana a las 9 viene el herrero", 1, "t1", true], ["Josué Ramírez", "Mañana a las 9 viene el herrero", 1, "t1", true]]);
  eq("cada pedido queda ligado al mensaje", r.pids, { "Samuel Gamez": "p1", "Josué Ramírez": "p2" });
  eq("aviso corto", r.toast, "Al equipo · por WhatsApp a Samuel y Josué");
  r = await p.evaluate(function () { PED = []; var t = { id: "t2", duenio: "salvador", encargado: "cynthia", msgs: [] }; var m = mandaAlEquipo(t, "hola", null);
    return { ped: PED.length, eq: m.wa_eq || null, canal: m.canal }; });
  eq("si nadie del equipo tiene WhatsApp en la tarea: solo canal equipo, sin pedidos", r, { ped: 0, eq: null, canal: "equipo" });
  r = await p.evaluate(function () { PED = []; yo = "samuel";
    var t = { id: "t3", duenio: "samuel", msgs: [{ k: "bi", t: "Salvador N: ok", wa_in: 1, wa_c: "Salvador Necochea", ts: 1 }, { k: "bi", t: "Josué: ok", wa_in: 1, wa_c: "Josué", ts: 2 }] };
    var l = equipoConWA(t); yo = "salvador"; return l.map(function (x) { return x.k; }); });
  eq("si escribe otro (Samuel): a Salvador NUNCA se le manda; a Josué sí", r, ["josue"]);
  /* ---- 2) palomitas ---- */
  r = await p.evaluate(function () {
    WA_EST = {};
    function nv(x) { var h = palomitasHTML(x); var m = h.match(/data-wtk="(\d)"/); return m ? +m[1] : null; }
    var x = { k: "bo", t: "hola", wa_auto: "Rogelio Sada" }, o = {};
    o.sinPid = nv(x);
    x.wa_pid = "a1"; o.cola = nv(x);
    WA_EST.a1 = { id: "a1", estado: "pendiente" }; o.pend = nv(x);
    WA_EST.a1 = { id: "a1", estado: "enviado", enviado_en: "2026-10-05 09:31:00" }; o.env = nv(x);
    WA_EST.a1 = { id: "a1", estado: "enviado", enviado_en: "x", entregado_en: "2026-10-05 09:31:05" }; o.ent = nv(x);
    WA_EST.a1 = { id: "a1", estado: "entregado", leido_en: "2026-10-05 09:40:00" }; o.lei = nv(x);
    WA_EST.a1 = { id: "a1", estado: "respondido" }; o.resp = nv(x);
    WA_EST.a1 = { id: "a1", estado: "cerrado" }; o.cerr = nv(x);
    var e = { k: "bo", t: "x", canal: "equipo", wa_eq: ["Samuel Gamez", "Josué"], wa_pids: { "Samuel Gamez": "s1", "Josué": "j1" } };
    WA_EST.s1 = { estado: "entregado", leido_en: "y" }; WA_EST.j1 = { estado: "enviado", entregado_en: "z" }; o.grupo = nv(e);
    WA_EST.j1 = { estado: "leido" }; o.grupoLeido = nv(e);
    e.wa_pids["Josué"] = null; o.grupoUnoSinPid = nv(e);
    o.nota = palomitasHTML({ k: "bo", t: "n", canal: "priv:salvador", nota_mia: 1 });
    o.claude = palomitasHTML({ k: "bo", t: "n", canal: "priv:salvador", nota_claude: 1 });
    o.equipoSinWA = palomitasHTML({ k: "bo", t: "n", canal: "equipo" });
    o.entrante = palomitasHTML({ k: "bi", t: "n", wa_in: 1, wa_c: "Rogelio", wa_pid: "zz" });
    o.guardado = nv({ k: "bo", t: "n", wa_auto: "R", wa_pid: "q9", wa_st: { q9: { n: 2, e: "entregado" } } });
    var box = document.getElementById("m"); box.innerHTML = [0, 1, 2, 3].map(function (n) { return '<div class="b bo"><span>hola</span><span class="st">Tú · 9:30' +
      palomitasHTML({ k: "bo", t: "h", wa_auto: "R", wa_pid: "v" + n, wa_st: (function () { var s = {}; s["v" + n] = { n: n }; return s; })() }) + '</span></div>'; }).join("");
    var w = box.querySelectorAll(".wtk");
    o.col = Array.prototype.map.call(w, function (el) { return getComputedStyle(el).color; });
    o.svg = Array.prototype.map.call(w, function (el) { return el.querySelectorAll("path").length + (el.querySelector("circle") ? "c" : ""); });
    o.lbl = Array.prototype.map.call(w, function (el) { return el.getAttribute("aria-label"); });
    o.der = (function () { var st = box.querySelector(".st").getBoundingClientRect(), k = w[0].getBoundingClientRect(); return k.left > st.left + 40; })();
    return o; });
  eq("sin pedido aún (en los 30 s): reloj", r.sinPid, 0);
  eq("con pedido sin estado del servidor: reloj (en cola)", [r.cola, r.pend], [0, 0]);
  eq("✓ enviado · ✓✓ entregado · ✓✓ leído · respondido = leído", [r.env, r.ent, r.lei, r.resp], [1, 2, 3, 3]);
  eq("cerrado (cancelado / no salió): sin palomitas", r.cerr, null);
  eq("A todo el equipo: manda el que va más atrás (como grupo)", [r.grupo, r.grupoLeido, r.grupoUnoSinPid], [2, 3, 0]);
  eq("Para mí, Para Claude, equipo sin WhatsApp y lo que entra: sin palomitas", [r.nota, r.claude, r.equipoSinWA, r.entrante], ["", "", "", ""]);
  eq("el estado guardado en el mensaje (wa_st) se respeta al volver a abrir", r.guardado, 2);
  eq("colores: gris, gris, gris, azul WhatsApp", r.col.map(function (c, i) { return i < 3 ? (c === "rgb(83, 189, 235)" ? "azul" : "gris") : (c === "rgb(83, 189, 235)" ? "azul" : c); }), ["gris", "gris", "gris", "azul"]);
  eq("dibujos: reloj, una palomita, dos, dos", r.svg, ["1c", "1", "2", "2"]);
  eq("se leen por voz", r.lbl, ["En cola", "Enviado", "Entregado", "Leído"]);
  si("van a la derecha de la hora", r.der);
  await p.screenshot({ path: path.join(os.tmpdir(), "b217-palomitas.png") });
  /* ---- consulta al servidor ---- */
  r = await p.evaluate(async function () {
    WA_EST = {}; FETCH = []; GUARDADO = 0; RENDER = 0; window.__waEstNo = 0;
    var t = { id: "t1", msgs: [{ k: "bo", t: "a", wa_auto: "Rogelio Sada", wa_pid: "a1", ts: Date.now() },
      { k: "bo", t: "b", canal: "equipo", wa_eq: ["Samuel Gamez"], wa_pids: { "Samuel Gamez": "s1" }, ts: Date.now() },
      { k: "bo", t: "c", wa_auto: "R", wa_pid: "viejo", wa_st: { viejo: { n: 3 } }, ts: Date.now() },
      { k: "bo", t: "nota", nota_mia: 1, canal: "priv:salvador", ts: Date.now() }] };
    RESP = { success: true, pedidos: [{ id: "a1", estado: "enviado", enviado_en: "2026-10-05 09:31:00", entregado_en: "2026-10-05 09:31:04", leido_en: null }, { id: "s1", estado: "pendiente" }] };
    var c1 = await consultaEstadosWA(t);
    var o = { pide: FETCH[0] && FETCH[0].u, ids: FETCH[0] && FETCH[0].b.ids, c1: c1, st: t.msgs[0].wa_st, st2: t.msgs[1].wa_st, g: GUARDADO, r: RENDER,
      pal: palomitasHTML(t.msgs[0]).match(/data-wtk="(\d)"/)[1] };
    RESP = { error: "accion desconocida" }; FETCH = [];
    var c2 = await consultaEstadosWA(t); var c3 = await consultaEstadosWA(t);
    o.sinAccion = [c2, c3, FETCH.length, !!window.__waEstNo, palomitasHTML(t.msgs[0]).match(/data-wtk="(\d)"/)[1]];
    return o; });
  eq("pregunta a push.php?action=wa_estado solo por los que no van en azul (ni notas)", [r.pide, r.ids], ["push.php?action=wa_estado", ["a1", "s1"]]);
  eq("aplica lo que dice el servidor y lo guarda en el mensaje", [r.c1, r.st, r.st2, r.g > 0, r.r > 0], [true, { a1: { n: 2, e: "enviado" } }, { s1: { n: 0, e: "pendiente" } }, true, true]);
  eq("✓✓ gris al estar entregado", r.pal, "2");
  eq("si el servidor no tiene la acción: deja de preguntar sin avisos y no cambia nada", r.sinAccion, [false, false, 1, true, "2"]);
  /* ---- 4) IA: ---- */
  r = await p.evaluate(function () { return [conIA("Me pase el precio"), conIA("IA: ya"), conIA("[A LAS 2026-10-05 08:00] Hola"), conIA("[A LAS 2026-10-05 08:00] IA: Hola"),
    conIA("[CORREO] asunto: x | mensaje: y"), conIA("[ARCHIVO] archivo: plano.pdf")]; });
  eq("conIA: pone 'IA: ' una sola vez, después de las etiquetas; correo y archivo no", r,
    ["IA: Me pase el precio", "IA: ya", "[A LAS 2026-10-05 08:00] IA: Hola", "[A LAS 2026-10-05 08:00] IA: Hola", "[CORREO] asunto: x | mensaje: y", "[ARCHIVO] archivo: plano.pdf"]);
  eq("sin errores de página", errs, []);
  } finally { await b.close(); try { fs.unlinkSync(tmp); } catch (e) {} }
  console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
  process.exit(malas.length ? 1 : 0);
})();
