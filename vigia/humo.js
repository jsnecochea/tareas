#!/usr/bin/env node
/* PRUEBA DE HUMO de Doit: abre la app como un teléfono (390 px, sin sesión) y dice si ARRANCA.
   Arrancar = el script principal llegó a su último renglón (window.__doitArranco) sin excepción fatal.
   Uso:  node vigia/humo.js [url] [--espera-build N] [--json]
         url por omisión https://doit.ok-doit.com/ ; también sirve file:///…/index.html
   Sale con: 0 arranca · 2 NO ARRANCA (pantalla en blanco / error fatal) · 3 aún no está publicado el build N · 1 no se pudo probar (red, navegador).
   No inicia sesión ni toca datos: solo carga la página. */
"use strict";
var path = require("path");
function cargaPlaywright() {
  var rutas = ["playwright", "/opt/node22/lib/node_modules/playwright", path.join(process.env.HOME || "", "doit-whatsapp/node_modules/playwright")];
  for (var i = 0; i < rutas.length; i++) { try { return require(rutas[i]); } catch (e) {} }
  throw new Error("no encontré playwright");
}
var STUB_FIREBASE = "(function(){var P=function(){return Promise.resolve()};var col=function(){return{doc:function(){return{set:P,get:function(){return Promise.resolve({exists:false,data:function(){return{}}})},delete:P,onSnapshot:function(){return function(){}}}},where:function(){return this},orderBy:function(){return this},limit:function(){return this},onSnapshot:function(){return function(){}},get:function(){return Promise.resolve({docs:[],forEach:function(){}})}}};" +
  "var fs0={enablePersistence:P,settings:function(){},collection:col};var au={onAuthStateChanged:function(cb){setTimeout(function(){cb(null)},50);return function(){}},signOut:P,signInWithPopup:P,signInWithRedirect:P,getRedirectResult:P,setPersistence:P,currentUser:null};" +
  "window.firebase={apps:[],initializeApp:function(){window.firebase.apps.push(1)},firestore:function(){return fs0},auth:function(){return au}};window.firebase.auth.GoogleAuthProvider=function(){this.setCustomParameters=function(){}};window.firebase.auth.Auth={Persistence:{LOCAL:'local'}};window.firebase.firestore.FieldValue={serverTimestamp:function(){return Date.now()},arrayUnion:function(){return[]},delete:function(){return null}};})();";
async function humo(url, opc) {
  opc = opc || {};
  var pw = cargaPlaywright(), b = await pw.chromium.launch(), r = { url: url, build: 0, arranco: false, errores: [], firmas: {}, ms: 0 };
  try {
    var ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" }), p = await ctx.newPage(), t0 = Date.now();
    p.on("pageerror", function (e) { r.errores.push(String(e && e.message || e).slice(0, 200)); });
    /* Firebase se sustituye por un simulacro (sin sesión, sin datos): así se prueba NUESTRO código igual
       desde la Mac que desde la nube (donde gstatic.com está bloqueado), y nunca se escribe nada. */
    if (!opc.firebaseReal) await p.route(/gstatic\.com\/firebasejs\//, function (rt) {
      var js = /firebase-app-compat/.test(rt.request().url()) ? STUB_FIREBASE : "";
      rt.fulfill({ status: 200, contentType: "application/javascript", body: js });
    });
    var u = url; if (/^https?:/.test(u)) u += (u.indexOf("?") < 0 ? "?" : "&") + "humo=" + Date.now();   /* sin caché intermedia */
    await p.goto(u, { waitUntil: "load", timeout: 45000 });
    var tope = Date.now() + (opc.espera || 15000), viejo = false;
    while (Date.now() < tope) {
      var e = await p.evaluate(function () { return { ok: !!window.__doitArranco, viejo: !window.doitErrores }; });
      if (e.ok || (e.viejo && Date.now() - t0 > 3000)) break; await p.waitForTimeout(250); }
    var d = await p.evaluate(function () {
      var m = /build\s+(\d+)/.exec(typeof VERSION_APP !== "undefined" ? String(VERSION_APP) : "");
      return { arranco: !!window.__doitArranco, build: m ? +m[1] : 0, firmas: window.doitErrores ? window.doitErrores.firmas() : {},
        visible: (document.body && document.body.innerText || "").trim().length };
    });
    if (!d.build) { var html = await p.content(), m2 = /var VERSION_APP = "build (\d+)/.exec(html); d.build = m2 ? +m2[1] : 0; }
    /* builds anteriores al 288 no traen el marcador: ahí cuenta "sin excepción y con algo en pantalla" */
    if (!d.arranco && d.build && d.build < 288) { d.arranco = !r.errores.length && d.visible > 0; r.sinMarcador = true; }
    r.arranco = d.arranco; r.build = d.build; r.firmas = d.firmas; r.visible = d.visible; r.ms = Date.now() - t0;
  } finally { await b.close(); }
  return r;
}
module.exports = { humo: humo };
if (require.main === module) {
  var a = process.argv.slice(2), url = "https://doit.ok-doit.com/", esperaBuild = 0, json = false;
  for (var i = 0; i < a.length; i++) { if (a[i] === "--espera-build") esperaBuild = +a[++i] || 0; else if (a[i] === "--json") json = true; else url = a[i]; }
  humo(url).then(function (r) {
    var code = r.arranco ? 0 : 2; if (esperaBuild && r.build < esperaBuild) code = 3;
    r.resultado = { 0: "ARRANCA", 2: "NO ARRANCA", 3: "AÚN NO PUBLICADO" }[code];
    if (json) console.log(JSON.stringify(r)); else console.log(r.resultado + " · build " + r.build + " · " + r.ms + " ms" + (r.errores.length ? "\n  errores: " + r.errores.join("\n           ") : ""));
    process.exit(code);
  }, function (e) { console.log((json ? JSON.stringify({ resultado: "NO SE PUDO PROBAR", error: String(e && e.message || e) }) : "NO SE PUDO PROBAR: " + (e && e.message || e))); process.exit(1); });
}
