#!/usr/bin/env node
/* UMBRAL DE ERRORES POR BUILD. La app guarda en bitacora_personas/<usuario>.errores_app un mapa
   {firma: {msg, donde, tipo, n, primero, ultimo, build, pantalla}} (vigía de errores de index.html).
   Este módulo decide si un build recién publicado trae errores NUEVOS de más:
   cuenta solo las firmas del build vigilado cuyo "primero" cae después de la publicación y cuyo "ultimo"
   está dentro de la ventana (15 min por omisión). Supera el umbral si:
     · alguna firma es de arranque (tipo "arranque") → fatal, o
     · las firmas nuevas suman >= umbralN apariciones (10), o
     · una misma firma nueva la tienen >= umbralPersonas personas (3).
   Uso CLI: node vigia/umbral.js personas.json --build N --desde <ms> [--ventana-min 15]
   (personas.json = arreglo de documentos de bitacora_personas con su "id"). Imprime JSON; sale 0 normal, 4 supera. */
"use strict";
function evaluaUmbral(personas, o) {
  o = o || {}; var ahora = o.ahora || Date.now(), ventana = (o.ventanaMin || 15) * 60000, umbralN = o.umbralN || 10, umbralP = o.umbralPersonas || 3;
  var porFirma = {};
  (personas || []).forEach(function (doc) {
    var ea = doc && doc.errores_app; if (!ea || typeof ea !== "object") return;
    Object.keys(ea).forEach(function (f) {
      var x = ea[f]; if (!x || +x.build !== +o.build) return;
      if (o.desde && !(x.primero >= o.desde)) return;
      if (!(x.ultimo >= ahora - ventana)) return;
      var g = porFirma[f] || (porFirma[f] = { firma: f, msg: x.msg, donde: x.donde, tipo: x.tipo, n: 0, personas: [] , pantallas: [] });
      g.n += +x.n || 0; if (g.personas.indexOf(doc.id) < 0) g.personas.push(doc.id); if (x.pantalla && g.pantallas.indexOf(x.pantalla) < 0) g.pantallas.push(x.pantalla);
    });
  });
  var firmas = Object.keys(porFirma).map(function (k) { return porFirma[k]; }).sort(function (a, b) { return b.n - a.n; });
  var total = firmas.reduce(function (s, g) { return s + g.n; }, 0);
  var fatal = firmas.some(function (g) { return g.tipo === "arranque"; });
  var masPersonas = firmas.some(function (g) { return g.personas.length >= umbralP; });
  var razon = fatal ? "arranque fallido" : total >= umbralN ? (total + " errores nuevos en " + (o.ventanaMin || 15) + " min") : masPersonas ? "un mismo error en " + umbralP + "+ personas" : "";
  return { supera: !!razon, fatal: fatal, razon: razon, total: total, firmas: firmas };
}
/* texto del aviso: la firma y dónde, sin datos personales (las firmas ya vienen limpias de la app) */
function textoAviso(build, r) {
  var g = r.firmas[0] || {};
  return "Doit build " + build + ": " + r.razon + ". Principal: «" + (g.msg || "") + "» en " + (g.donde || "?") + " (" + g.n + " veces, " + (g.personas || []).length + " personas, pantalla " + (g.pantallas || []).join("/") + ", firma " + g.firma + ")." +
    (r.fatal ? " La app no arranca: se publica el regreso." : " Quedó preparado el regreso (rama regreso/build-" + build + "); no se publicó.");
}
module.exports = { evaluaUmbral: evaluaUmbral, textoAviso: textoAviso };
if (require.main === module) {
  var a = process.argv.slice(2), arch = null, o = {};
  for (var i = 0; i < a.length; i++) { if (a[i] === "--build") o.build = +a[++i]; else if (a[i] === "--desde") o.desde = +a[++i]; else if (a[i] === "--ventana-min") o.ventanaMin = +a[++i]; else arch = a[i]; }
  var r = evaluaUmbral(JSON.parse(require("fs").readFileSync(arch, "utf8")), o);
  if (r.supera) r.aviso = textoAviso(o.build, r);
  console.log(JSON.stringify(r, null, 1)); process.exit(r.supera ? 4 : 0);
}
