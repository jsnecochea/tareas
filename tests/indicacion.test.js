#!/usr/bin/env node
/* PRUEBAS build 193: "Indicación para Claude" (menu, aviso de externo, canal naranja),
   notas a Claude plegadas (F36) y MISMO FORMATO EN TODAS (F38: pastilla + integrantes,
   una persona = uno aunque tenga varios nombres). Correr: node tests/indicacion.test.js
   Saca las funciones TAL CUAL de index.html. Fixture Samuel = forma real de
   wa_d1e84b7547937ba3 (leida por el conector Doit 2026-10-04). */
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var lineas = html.split("\n");
function saca(tipo, nombre) {
  var re = tipo === "function" ? new RegExp("^function " + nombre.replace(/\$/g, "\\$") + "\\(") : new RegExp("^var " + nombre + "\\s*=");
  var ini = -1;
  for (var i = 0; i < lineas.length; i++) if (re.test(lineas[i])) ini = i;
  if (ini < 0) throw new Error("no encontre " + tipo + " " + nombre);
  var out = [lineas[ini]];
  for (var k = ini + 1; k < lineas.length; k++) {
    var L = lineas[k];
    if (L.length && !/^[\s}]/.test(L)) break;
    out.push(L);
    if (/^}/.test(L)) break;
  }
  return out.join("\n");
}
var FUNCS = ["_nn", "esDelEquipo", "_telDe", "_nomWA", "esMsgWA", "miembroDeNombre", "contactosWA", "_contactosWA",
  "_contactoDeNombre", "canalDe", "externosDe", "nombreWADe", "canalesDe", "canalActual", "msgEnCanal", "integrantesDe",
  "responsableExt", "phCanal", "vPastilla", "modoClaude", "puedeSerIndicacion", "convierteEnIndicacion", "notasPlegadas",
  "notaClaude", "preguntaExterno", "nombreInt", "iniInt"];
var VARS = ["CNL_COL", "CNL_EXT", "CLAUDE_COL", "_cwMemo", "SVG_DESTELLO", "SVG_CHAT"];
var codigo = VARS.map(function (v) { return saca("var", v); }).join("\n") + "\n" +
  FUNCS.map(function (f) { return saca("function", f); }).join("\n");

function ctx() {
  var c = {
    console: console, JSON: JSON, String: String, Math: Math, Date: Date, Object: Object, Array: Array, RegExp: RegExp,
    yo: "salvador",
    PERSONAS: { salvador: { nombre: "Salvador", ini: "S", jefe: true }, samuel: { nombre: "Samuel", ini: "SM" },
      cynthia: { nombre: "Cynthia", ini: "C" }, josue: { nombre: "Josué", ini: "J", jefe: true } },
    window: {}, soySupervisor: function () { return false; }, esc: function (s) { return String(s); },
    msg: function (t, k, tx) { (t.msgs = t.msgs || []).push({ k: k, t: tx, ts: Date.now() }); },
    guarda: function () {}, render: function () {}, _ejecutadas: [], _wa: [],
    pideWhatsApp: function (cpo) { c._wa.push(cpo); return Promise.resolve({}); },
    document: fakeDoc(), $: function () { return null; }
  };
  c.ejecutaNotaClaude = function (t, v) { c._ejecutadas.push(v); };
  vm.createContext(c); vm.runInContext(codigo, c); return c;
}
function fakeDoc() {
  return { body: { appendChild: function (el) { this.ultimo = el; } },
    createElement: function () {
      var el = { innerHTML: "", parentNode: null, _btn: {}, setAttribute: function () {},
        querySelector: function (sel) { var k = sel.replace(/^\[data-ac="(\w+)"\]$/, "$1").replace(".", ""); if (!this._btn[k]) this._btn[k] = { onclick: null }; return this._btn[k]; } };
      return el;
    } };
}
var ok = 0, n = 0, malas = [];
function eq(nom, got, exp) { n++; var a = JSON.stringify(got), b = JSON.stringify(exp); if (a === b) ok++; else malas.push(nom + "\n    dio " + a + "\n    espera " + b); }
function si(nom, v) { eq(nom, !!v, true); }

/* ---------- fixtures ---------- */
function samuel() {   /* forma real de wa_d1e84b7547937ba3: sin chat/origen/bandeja_id en varios, dos nombres */
  return { id: "wa_d1e84b7547937ba3", nombre: "Mantenimiento y Mejoras Cumbres", duenio: "salvador", encargado: "salvador", indefinida: true, msgs: [
    { k: "bi", wa_in: 1, origen: "wa_entrante", wa_c: "Samuel Gamez ciper", t: "Samuel: [audio] ¿Qué tal, Salvador?...", ts: 1 },
    { k: "bo", de: "salvador", t: "Cambia el nombre de esta tarea a Mantenimiento y Mejoras Cumbres", ts: 2 },
    { k: "bi", wa_c: "Samuel Gamez ciper", chat: "Samuel Gamez ciper", origen: "wa_saliente", t: "Salvador: [audio] Querido Samuel...", ts: 3 },
    { k: "bi", wa_in: 1, wa_c: "Samuel Gamez ciper", t: "Samuel Gamez ciper: [audio] Le estaba moviendo...", ts: 4 },
    { k: "bi", wa_in: 0, wa_c: "Samuel Gamez ciper", t: "🎙️ Audio enviado: No, justo Chuy...", ts: 5 },
    { k: "bi", wa_in: 1, wa_id: null, wa_c: "Samuel Gamez ciper", t: "Samuel Gamez ciper: [audio] ya chequé lo de la fotocelda", ts: 6 },
    { k: "bi", origen: "wa_saliente", chat: "Samuel Gamez", wa_c: "Samuel Gamez", t: "Salvador: [audio] Otra cosa...", ts: 7 },
    { k: "bi", origen: "wa_saliente", chat: "Samuel Gamez", wa_c: "Samuel Gamez", t: "Salvador: [audio] Bien, por nuestra parte...", ts: 8 },
    { k: "bo", de: "salvador", canal: "priv:salvador", nota_claude: 1, t: "Claude, porque no se ve arriba a Samuel...", ts: 9 },
    { k: "bi", canal: "priv:salvador", nota_claude: 1, t: "No veo a Samuel en los contactos...", ts: 10 },
    { k: "bo", de: "salvador", t: "Adjúntalo", ts: 11, cita: { ix: 9 } },
    { k: "bo", de: "salvador", canal: "priv:salvador", nota_claude: 1, t: "Clau abre por favor este el costo de la barda", ts: 12 },
    { k: "bi", canal: "priv:salvador", nota_claude: 1, t: "No entiendo bien qué costo...", ts: 13 }
  ] };
}
function manuel() {
  return { id: "tBARDA", nombre: "Barda Manuel Parra", duenio: "salvador", msgs: [
    { k: "bi", wa_in: 1, origen: "wa_entrante", chat: "5218711112222@s.whatsapp.net", bandeja_id: "b1", wa_c: "Manuel Parra", t: "Manuel Parra: le paso el costo", ts: 1 },
    { k: "bo", de: "salvador", canal: "ext:Manuel Parra", wa_auto: "Manuel Parra", t: "¿Qué avances?", ts: 2 },
    { k: "bi", wa_in: 1, origen: "wa_entrante", chat: "5218711112222@s.whatsapp.net", wa_c: "Manuel Parra Marmoles", t: "Manuel Parra Marmoles: va", ts: 3 }
  ] };
}

/* ---------- F38: identidad, canales, pastilla, integrantes ---------- */
(function () {
  var c = ctx(), t = samuel(), cw = c.contactosWA(t);
  eq("Samuel: dos nombres = UNA persona del equipo", cw.map(function (g) { return [g.id, g.nombre, g.alias.length]; }), [["dm:samuel", "Samuel Gamez ciper", 2]]);
  eq("Samuel: sus mensajes (entrantes y salientes, nombre viejo o nuevo) van a su canal",
    [0, 2, 3, 4, 6, 7].map(function (i) { return c.canalDe(t.msgs[i], t); }), ["dm:samuel", "dm:samuel", "dm:samuel", "dm:samuel", "dm:samuel", "dm:samuel"]);
  eq("Samuel: lo dictado por Salvador sin canal sigue en equipo", c.canalDe(t.msgs[1], t), "equipo");
  var cs = c.canalesDe(t).map(function (x) { return x.id + (x.wa ? "·WA" : ""); });
  eq("Samuel: canales", cs, ["todo", "equipo", "dm:samuel·WA"]);
  var ca = c.canalActual(t);
  eq("Samuel: abre en su canal por WhatsApp", [ca.id, ca.wa], ["dm:samuel", "Samuel Gamez ciper"]);
  eq("Samuel: caja", c.phCanal(t), "Mensaje a Samuel por WhatsApp…");
  var p = c.vPastilla(t);
  si("Samuel: pastilla 'Samuel · WhatsApp'", /id="cnlpill"[^>]*>.*Samuel · WhatsApp/.test(p));
  si("Samuel: caritas de integrantes", /intbtn/.test(p) && /SM/.test(p));
  si("Samuel: canal naranja Claude", /id="cnlclaude"/.test(p));
  eq("Samuel: integrantes", c.integrantesDe(t).map(function (x) { return x.k; }), ["salvador", "samuel"]);
  eq("Samuel: no hay externos (es del equipo)", c.externosDe(t), []);
})();
(function () {
  var c = ctx(), t = manuel(), cw = c.contactosWA(t);
  eq("Manuel: mismo telefono, dos nombres = UNO", cw.map(function (g) { return [g.id, g.alias.length, g.tels]; }), [["ext:Manuel Parra", 2, ["8711112222"]]]);
  eq("Manuel: canal guardado ext:Manuel Parra se reconoce", c.canalDe(t.msgs[1], t), "ext:Manuel Parra");
  eq("Manuel: el del otro nombre tambien", c.canalDe(t.msgs[2], t), "ext:Manuel Parra");
  eq("Manuel: externos", c.externosDe(t), ["Manuel Parra"]);
  eq("Manuel: abre en su canal", c.canalActual(t).id, "ext:Manuel Parra");
  si("Manuel: pastilla", /Manuel Parra · WhatsApp/.test(c.vPastilla(t)));
  eq("Manuel: caja", c.phCanal(t), "Mensaje a Manuel Parra por WhatsApp…");
  eq("Manuel: integrantes", c.integrantesDe(t).map(function (x) { return x.k; }), ["salvador", "ext:Manuel Parra"]);
})();
(function () {
  var c = ctx();
  var t = { id: "x1", duenio: "salvador", msgs: [
    { k: "bi", wa_in: 1, wa_c: "Pato Cumbres", t: "a", ts: 1 }, { k: "bi", wa_in: 1, wa_c: "Pato Cumbres Zatarain", t: "b", ts: 2 },
    { k: "bi", wa_in: 1, wa_c: "Chuy Cumbres Zatarain", t: "c", ts: 3 }] };
  eq("sin telefono: prefijo de 2+ palabras une, otro nombre no", c.externosDe(t).length, 2);
  var t2 = { id: "x2", duenio: "salvador", msgs: [{ k: "bi", wa_in: 1, wa_c: "Juan", t: "a", ts: 1 }, { k: "bi", wa_in: 1, wa_c: "Juan Perez", t: "b", ts: 2 }] };
  eq("una sola palabra igual NO une (puede ser otro Juan)", c.externosDe(t2).length, 2);
  var t3 = { id: "x3", duenio: "samuel", encargado: "cynthia", msgs: [{ k: "bo", de: "salvador", t: "hola", ts: 1 }] };
  eq("tarea sin WhatsApp con involucrados: integrantes", c.integrantesDe(t3).map(function (x) { return x.k; }), ["samuel", "salvador", "cynthia"]);
  si("tarea sin WhatsApp con involucrados: pastilla y caritas", /cnlpill/.test(c.vPastilla(t3)) && /intbtn/.test(c.vPastilla(t3)));
  var t4 = { id: "x4", duenio: "salvador", msgs: [{ k: "bo", de: "salvador", t: "nota", ts: 1 }] };
  si("tarea solo mia: sin caritas, pero con canal Claude", !/intbtn/.test(c.vPastilla(t4)) && /cnlclaude/.test(c.vPastilla(t4)));
})();

/* ---------- 1a: menu "Indicación" ---------- */
(function () {
  var c = ctx(), t = samuel();
  si("mi mensaje en equipo puede ser indicacion", c.puedeSerIndicacion(t.msgs[1], t));
  si("nota_claude ya no", !c.puedeSerIndicacion(t.msgs[8], t));
  si("mensaje de Samuel (WhatsApp) no", !c.puedeSerIndicacion(t.msgs[0], t));
  si("audio que Salvador mando por WhatsApp no", !c.puedeSerIndicacion(t.msgs[6], t));
  var tm = manuel();
  si("lo que se le mando a Manuel no", !c.puedeSerIndicacion(tm.msgs[1], tm));
  si("privado a alguien no", !c.puedeSerIndicacion({ k: "bo", de: "salvador", canal: "dm:samuel", t: "x" }, t));
  si("de otra persona del equipo no", !c.puedeSerIndicacion({ k: "bo", de: "samuel", t: "x" }, t));
  /* caso real Decoracion Navidena: quedo en canal equipo tras "No, solo al equipo" */
  var td = { id: "chuy", duenio: "salvador", msgs: [{ k: "bi", wa_in: 1, wa_c: "Chuy Cumbres Zatarain", t: "x", ts: 1 },
    { k: "bo", de: "salvador", canal: "equipo", t: "recuérdame el martes de darle seguimiento a Pato y Chuy", ts: 2 }] };
  si("caso Decoracion: el de canal equipo SI", c.puedeSerIndicacion(td.msgs[1], td));
  var okc = c.convierteEnIndicacion(td, 1), x = td.msgs[1];
  eq("convertir: queda privada, nota_claude y recuerda el canal", [okc, x.canal, x.nota_claude, x.canal_antes], [true, "priv:salvador", 1, "equipo"]);
  eq("convertir: se le manda a Claude", c._ejecutadas, ["recuérdame el martes de darle seguimiento a Pato y Chuy"]);
  eq("convertir: NO sale por WhatsApp", c._wa.length, 0);
  eq("convertir: queda en notas_claude", td.notas_claude.length, 1);
  eq("convertir dos veces no repite", c.convierteEnIndicacion(td, 1), false);
  /* la opcion esta en el menu como ULTIMA */
  si("menu: 'Indicación' es la ultima opcion", /_ops\.push\(\["Indicación"/.test(html) && /\["Copiar",function\(\)\{ var x=t\.msgs\[ix\][\s\S]{0,200}_ops\.push\(\["Indicación"/.test(html));
})();

/* ---------- F36: notas plegadas ---------- */
(function () {
  var c = ctx(), t = samuel(), p = c.notasPlegadas(t, false);
  eq("pliega los 4 mensajes de notas", Object.keys(p.set).map(Number), [8, 9, 11, 12]);
  eq("dos renglones, uno por tramo, cuentan las notas", p.cab, { 8: 1, 11: 1 });
  eq("abiertas = nada plegado", Object.keys(c.notasPlegadas(t, true).set).length, 0);
  c.yo = "samuel"; vm.runInContext("yo='samuel'", c);
  eq("las de otro no las pliego (ni las ve)", Object.keys(c.notasPlegadas(t, false).set).length, 0);
  si("build 198: las indicaciones viejas se OCULTAN sin renglon (solo salen en Todo)", /if\(_pln\.set\[ix\] \|\| _pls\.set\[ix\] \|\| _plg\.set\[ix\]\)\{ _ocultos\+\+; return; \}/.test(html) && !/indicaci'\+\(_pln\.cab/.test(html));
})();

/* ---------- 1b: "Para Claude" primera opcion del aviso de externo ---------- */
(function () {
  var c = ctx(), llam = [];
  c.preguntaExterno("Chuy Cumbres Zatarain", "nota para mi", function () { llam.push("si"); }, function () { llam.push("no"); }, function () { llam.push("claude"); });
  var pop = c.document.body.ultimo;
  /* build 215: hoja de accion inferior; las opciones se reconocen por data-ac */
  var orden = (pop.innerHTML.match(/data-ac="(\w+)"/g) || []).map(function (s) { return s.replace(/.*data-ac="(\w+)"/, "$1"); });
  eq("aviso: Para Claude es la PRIMERA", orden, ["claude", "wa", "equipo", "cancel"]);
  si("aviso: dice 'Para Claude'", /Para Claude/.test(pop.innerHTML));
  pop._btn.claude.onclick();
  eq("aviso: Para Claude llama a Claude, no a WhatsApp", llam, ["claude"]);
  si("en el hilo los dos avisos pasan notaClaude", (html.match(/function\(\)\{ notaClaude\(t, _v[NR]\); \}(, function\(\)\{ notaParaMi\(t, _v[NR]\); \})?\);/g) || []).length === 2);
})();

/* ---------- 1c: canal naranja Claude ---------- */
(function () {
  var c = ctx(), t = samuel();
  eq("sin Claude: caja normal", c.phCanal(t), "Mensaje a Samuel por WhatsApp…");
  c.window.__cnlClaude = {}; c.window.__cnlClaude[t.id] = 1;
  eq("con Claude: caja", c.phCanal(t), "Indicación para Claude…");
  si("con Claude: pastilla encendida", /cnlcl on/.test(c.vPastilla(t)));
  si("con Claude: el envio va a notaClaude antes que cualquier canal",
    /if\(modoClaude\(t\)\)\{ \$\("txt"\)\.value=""; marcaEnvio\("tenv",""\); notaClaude\(t, v\); return; \}/.test(html) &&
    html.indexOf("if(modoClaude(t)){ $(\"txt\").value") < html.indexOf("var _cnA=canalActual(t)"));
  var t2 = { id: "y", duenio: "salvador", msgs: [] };
  c.notaClaude(t2, "Claude anota esto");
  eq("notaClaude: privada y plegable, sin WhatsApp", [t2.msgs[0].canal, t2.msgs[0].nota_claude, c._wa.length], ["priv:salvador", 1, 0]);
})();

var m = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/), okc = false;
try { new vm.Script(m[1]); okc = true; } catch (e) { console.log(e.message); }
eq("el script de index.html compila", okc, true);
console.log((malas.length ? malas.map(function (x) { return "  X " + x; }).join("\n") + "\n" : "") + "RESULTADO " + ok + "/" + n);
process.exit(malas.length ? 1 : 0);
