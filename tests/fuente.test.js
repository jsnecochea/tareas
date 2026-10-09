#!/usr/bin/env node
/* index.html se arma de src/ (build.js). Esta prueba falla si alguien editó index.html a mano o si src/ no se armó.
   Node puro. Correr: node tests/fuente.test.js */
"use strict";
var cp = require("child_process"), path = require("path");
var r = cp.spawnSync(process.execPath, [path.join(__dirname, "..", "build.js"), "--revisa"]);
var ok = r.status === 0;
console.log("RESULTADO " + (ok ? 1 : 0) + "/1"); if (!ok) { console.log("  X index.html no coincide con src/: edita en src/ y corre node build.js"); process.exit(1); }
