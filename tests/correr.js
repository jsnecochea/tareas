#!/usr/bin/env node
/* Corredor de pruebas de Doit. Uso (ver tests/LEEME.md):
     node tests/correr.js --area caminata      Node puro (todas) + navegador solo del área, en paralelo
     node tests/correr.js --area home,tarea    varias áreas
     node tests/correr.js --todo               todo, en paralelo (antes de publicar)
     node tests/correr.js b245 b277            solo esas (nombre sin .test.js)
     node tests/correr.js --lista              muestra áreas y pruebas sin área
   Opciones: -j N (cuántas a la vez; por omisión 4) · --serie (= -j 1) · --repite N (cada prueba N veces, para cazar inestables)
   Todas corren con TZ=America/Monterrey salvo que ya traigas TZ. Sale con código 1 si algo falla. */
"use strict";
var fs = require("fs"), path = require("path"), cp = require("child_process");
var DIR = __dirname;
var AREAS = JSON.parse(fs.readFileSync(path.join(DIR, "areas.json"), "utf8"));
var ALIAS = { claude: "barra", agenda: "fechas", acomodo: "home", hilo: "tarea", voz: "lectura", wa: "whatsapp", notificaciones: "avisos" };

var todas = fs.readdirSync(DIR).filter(function (f) { return /\.test\.js$/.test(f); }).sort().map(function (f) {
  var src = fs.readFileSync(path.join(DIR, f), "utf8");
  return { nom: f.replace(/\.test\.js$/, ""), arch: f, nav: /require\([^)]*playwright/.test(src) };
});
var porNom = {}; todas.forEach(function (t) { porNom[t.nom] = t; });
var areasDe = function (nom) { return Object.keys(AREAS).filter(function (a) { return a[0] !== "_" && AREAS[a].indexOf(nom) >= 0; }); };

var args = process.argv.slice(2), j = 4, repite = 1, modo = null, areas = [], sueltas = [];
for (var i = 0; i < args.length; i++) {
  var a = args[i];
  if (a === "--todo") modo = "todo";
  else if (a === "--lista") modo = "lista";
  else if (a === "--serie") j = 1;
  else if (a === "-j") j = Math.max(1, +args[++i] || 4);
  else if (a === "--repite") repite = Math.max(1, +args[++i] || 1);
  else if (a === "--area") { modo = "area"; areas = areas.concat(String(args[++i] || "").split(",").filter(Boolean)); }
  else if (/^--area=/.test(a)) { modo = "area"; areas = areas.concat(a.slice(7).split(",").filter(Boolean)); }
  else if (a[0] !== "-") { modo = modo || "sueltas"; sueltas.push(a.replace(/\.test\.js$/, "").replace(/^tests\//, "")); }
}

var sinArea = todas.filter(function (t) { return t.nav && !areasDe(t.nom).length; });
var fantasmas = []; Object.keys(AREAS).forEach(function (a) { if (a[0] !== "_") AREAS[a].forEach(function (n) { if (!porNom[n]) fantasmas.push(a + ":" + n); }); });

if (!modo || modo === "lista") {
  if (!modo) console.log("Falta qué correr. Ejemplos: --area caminata · --todo · b245\n");
  Object.keys(AREAS).filter(function (a) { return a[0] !== "_"; }).forEach(function (a) { console.log(("  " + a + "            ").slice(0, 13) + AREAS[a].join(" ")); });
  console.log("  (Node puro, siempre) " + todas.filter(function (t) { return !t.nav; }).map(function (t) { return t.nom; }).join(" "));
  if (sinArea.length) console.log("\n  OJO pruebas de navegador SIN área (solo corren con --todo): " + sinArea.map(function (t) { return t.nom; }).join(" "));
  if (fantasmas.length) console.log("\n  OJO areas.json nombra pruebas que no existen: " + fantasmas.join(" "));
  process.exit(modo ? 0 : 2);
}

var sel;
if (modo === "todo") sel = todas.slice();
else if (modo === "sueltas") {
  sel = sueltas.map(function (n) { if (!porNom[n]) { console.log("No existe la prueba: " + n); process.exit(2); } return porNom[n]; });
} else {
  var quiero = {};
  areas.forEach(function (a) { var r = ALIAS[a] || a; if (!AREAS[r] || r[0] === "_") { console.log("Área desconocida: " + a + " (hay: " + Object.keys(AREAS).filter(function (x) { return x[0] !== "_"; }).join(", ") + ")"); process.exit(2); } AREAS[r].forEach(function (n) { quiero[n] = 1; }); });
  sel = todas.filter(function (t) { return !t.nav || quiero[t.nom]; });
}
var cola = []; sel.forEach(function (t) { for (var k = 0; k < repite; k++) cola.push(t); });
/* las de navegador primero (las largas arriba) para que el paralelo rinda */
cola.sort(function (a, b) { return (b.nav ? 1 : 0) - (a.nav ? 1 : 0); });

var env = Object.assign({}, process.env); if (!env.TZ) env.TZ = "America/Monterrey";
var t0 = Date.now(), res = [], vivos = 0, ix = 0;
console.log("Corriendo " + cola.length + " pruebas (" + cola.filter(function (t) { return t.nav; }).length + " de navegador), " + j + " a la vez" + (modo === "area" ? " · área " + areas.join(",") : "") + " …");
function siguiente() {
  if (ix >= cola.length) { if (!vivos) fin(); return; }
  var t = cola[ix++], ini = Date.now(), out = ""; vivos++;
  var ch = cp.spawn(process.execPath, [path.join(DIR, t.arch)], { env: env, cwd: path.join(DIR, "..") });
  var tope = setTimeout(function () { out += "\n[correr.js] la detuve: más de 180 s"; ch.kill("SIGKILL"); }, 180000);
  ch.stdout.on("data", function (d) { out += d; }); ch.stderr.on("data", function (d) { out += d; });
  ch.on("close", function (code) {
    clearTimeout(tope); vivos--;
    var s = (Date.now() - ini) / 1000, m = out.match(/RESULTADO\s+(\d+)\/(\d+)/g), r = m ? m[m.length - 1].replace(/RESULTADO\s+/, "") : "?";
    res.push({ t: t, ok: code === 0, s: s, r: r, out: out });
    console.log((code === 0 ? "  ✓ " : "  ✗ ") + (t.nom + "                  ").slice(0, 17) + (s.toFixed(1) + " s     ").slice(0, 8) + r);
    siguiente();
  });
}
function fin() {
  var malas = res.filter(function (x) { return !x.ok; });
  malas.forEach(function (x) {
    console.log("\n──── FALLA " + x.t.nom + " ────\n" + x.out.split("\n").filter(function (l) { return /^\s*X |Error|RESULTADO|detuve/.test(l); }).slice(0, 25).join("\n"));
  });
  var lentas = res.slice().sort(function (a, b) { return b.s - a.s; }).slice(0, 5).map(function (x) { return x.t.nom + " " + x.s.toFixed(1) + "s"; });
  var suma = res.reduce(function (a, x) { return a + x.s; }, 0);
  console.log("\n" + (malas.length ? "FALLARON " + malas.length + " de " + res.length : "TODO EN VERDE " + res.length + "/" + res.length) +
    " · reloj " + ((Date.now() - t0) / 1000).toFixed(1) + " s (en serie serían " + suma.toFixed(0) + " s) · más lentas: " + lentas.join(", "));
  if (modo !== "todo" && sinArea.length) console.log("OJO pruebas de navegador sin área: " + sinArea.map(function (t) { return t.nom; }).join(" ") + " (agrégalas a tests/areas.json)");
  process.exit(malas.length ? 1 : 0);
}
for (var w = 0; w < Math.min(j, cola.length); w++) siguiente();
if (!cola.length) fin();
