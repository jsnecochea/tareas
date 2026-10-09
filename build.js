#!/usr/bin/env node
/* Arma index.html (lo único que publica el servidor, junto con sw.js) a partir de src/:
     src/plantilla.html  con @@CSS@@ y @@JS@@
     src/css/app.css
     src/js/NN-*.js      en orden de nombre (el orden de hoy, intacto)
   Se edita SIEMPRE en src/ y luego: node build.js   (node build.js --revisa: solo comprueba que index.html esté al día).
   Todo el JS sigue en UN solo <script>, igual que antes: el orden y el alcance de las funciones no cambian. */
"use strict";
var fs = require("fs"), path = require("path");
var R = __dirname, S = path.join(R, "src");
function arma() {
  var pl = fs.readFileSync(path.join(S, "plantilla.html"), "utf8");
  var css = fs.readFileSync(path.join(S, "css", "app.css"), "utf8");
  var js = fs.readdirSync(path.join(S, "js")).filter(function (f) { return /^\d\d-.*\.js$/.test(f); }).sort()
    .map(function (f) { return fs.readFileSync(path.join(S, "js", f), "utf8"); }).join("");
  if (pl.split("@@CSS@@").length !== 2 || pl.split("@@JS@@").length !== 2) throw new Error("plantilla.html debe tener un @@CSS@@ y un @@JS@@");
  return pl.replace("@@CSS@@", function () { return css; }).replace("@@JS@@", function () { return js; });
}
/* src/MAPA.md: qué funciones viven en cada archivo (se regenera solo, para encontrar dónde editar sin abrir todo) */
function mapa() {
  var L = ["# Mapa de src/js (lo genera build.js; no se edita a mano)", ""];
  fs.readdirSync(path.join(S, "js")).filter(function (f) { return /^\d\d-.*\.js$/.test(f); }).sort().forEach(function (f) {
    var t = fs.readFileSync(path.join(S, "js", f), "utf8"), fn = [];
    t.replace(/^function ([A-Za-z0-9_$]+)\(/gm, function (_, n) { fn.push(n); return _; });
    L.push("## " + f + " (" + Math.round(t.length / 1024) + " KB, " + fn.length + " funciones)", fn.join(" · "), "");
  });
  var m = L.join("\n"), d = path.join(S, "MAPA.md");
  if (!fs.existsSync(d) || fs.readFileSync(d, "utf8") !== m) fs.writeFileSync(d, m);
}
mapa();
var nuevo = arma(), dest = path.join(R, "index.html"), viejo = fs.existsSync(dest) ? fs.readFileSync(dest, "utf8") : "";
if (process.argv.indexOf("--revisa") >= 0) {
  if (nuevo !== viejo) { console.log("index.html NO está al día con src/: corre  node build.js"); process.exit(1); }
  console.log("index.html al día con src/"); process.exit(0);
}
if (nuevo !== viejo) { fs.writeFileSync(dest, nuevo); console.log("index.html armado desde src/ (" + Math.round(nuevo.length / 1024) + " KB)"); }
else console.log("index.html ya estaba al día");
