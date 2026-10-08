#!/usr/bin/env node
/* REGRESO DE VERSIÓN de Doit (la app). Prepara el `git revert` del build que falló.
   Uso:  node vigia/regreso.js --build N [--publicar] [--motivo "texto"] [--sin-pruebas]
   · Busca en origin/main el commit que subió VERSION_APP a "build N" y los que vinieron después.
   · Sin --publicar: deja el revert en la rama regreso/build-N y la sube (NO toca main). Es lo que se hace
     cuando el build arranca pero trae errores de más: decide Salvador.
   · Con --publicar: SOLO si la app no arranca (humo.js salió 2). Revierte, corre la batería completa y,
     si queda en verde, lo sube a main SIN force. Si la batería falla, no publica y lo dice.
   Nunca hace force-push ni reescribe historia: un revert es un commit nuevo. */
"use strict";
var cp = require("child_process"), path = require("path");
var RAIZ = path.join(__dirname, "..");
function git(args, ok) { var r = cp.spawnSync("git", args, { cwd: RAIZ, encoding: "utf8" }); if (r.status !== 0 && !ok) throw new Error("git " + args.join(" ") + ": " + (r.stderr || r.stdout).trim()); return (r.stdout || "").trim(); }
/* commits a revertir: desde el que puso "build N" hasta la punta (los posteriores dependen de él) */
function commitsDelBuild(build, rama) {
  var lista = git(["log", "--format=%H", "-S", 'var VERSION_APP = "build ' + build + " ", rama, "--", "index.html"]).split("\n").filter(Boolean);
  if (!lista.length) return null;
  var base = lista[lista.length - 1];   /* el más viejo que tocó esa cadena = el que la introdujo */
  return git(["rev-list", "--reverse", base + "^.." + rama]).split("\n").filter(Boolean);
}
function regreso(o) {
  var pie = "\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01KZWqE49LSQg7J6tdzrDQ1m";
  var rama = o.rama || "origin/main";
  if (!o.local) git(["fetch", "origin"]);
  var cs = commitsDelBuild(o.build, rama); if (!cs) return { ok: false, error: "no encontré el commit del build " + o.build + " en " + rama };
  var nueva = "regreso/build-" + o.build;
  git(["checkout", "-q", "-B", nueva, rama]);
  git(["revert", "--no-edit", "--no-commit"].concat(cs.slice().reverse()));
  git(["commit", "-q", "-m", "Regreso: se revierte el build " + o.build + " (" + cs.length + " commit" + (cs.length === 1 ? "" : "s") + ")\n\n" + (o.motivo || "Falla detectada por el vigía de builds.") + "\nCommits revertidos: " + cs.map(function (c) { return c.slice(0, 7); }).join(" ") + pie]);
  var r = { ok: true, rama: nueva, commit: git(["rev-parse", "--short", "HEAD"]), revertidos: cs.map(function (c) { return c.slice(0, 7); }), publicado: false };
  if (o.publicar) {
    if (!o.sinPruebas) {
      var t = cp.spawnSync(process.execPath, [path.join(RAIZ, "tests", "correr.js"), "--todo"], { cwd: RAIZ, encoding: "utf8", timeout: 600000 });
      r.pruebas = t.status === 0 ? "verde" : "FALLAN";
      if (t.status !== 0) { r.ok = false; r.error = "la batería falla con el regreso; no se publicó"; r.salida = String(t.stdout || "").split("\n").filter(function (l) { return /X |FALLA|RESULTADO/.test(l); }).slice(0, 20); return r; }
    }
    if (!o.local) git(["push", "origin", "HEAD:main"]);   /* sin force: si main avanzó, falla y se avisa */
    r.publicado = true;
  } else if (!o.local) git(["push", "-u", "origin", nueva]);
  return r;
}
module.exports = { regreso: regreso, commitsDelBuild: commitsDelBuild };
if (require.main === module) {
  var a = process.argv.slice(2), o = {};
  for (var i = 0; i < a.length; i++) { if (a[i] === "--build") o.build = +a[++i]; else if (a[i] === "--publicar") o.publicar = true; else if (a[i] === "--motivo") o.motivo = a[++i]; else if (a[i] === "--sin-pruebas") o.sinPruebas = true; else if (a[i] === "--local") o.local = true; else if (a[i] === "--rama") o.rama = a[++i]; }
  if (!o.build) { console.log("Falta --build N"); process.exit(1); }
  try { var r = regreso(o); console.log(JSON.stringify(r, null, 1)); process.exit(r.ok ? 0 : 1); }
  catch (e) { console.log(JSON.stringify({ ok: false, error: String(e.message || e) })); process.exit(1); }
}
