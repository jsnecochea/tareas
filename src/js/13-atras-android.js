/* ===================== BOTÓN «ATRÁS» DE ANDROID =====================
   Con una hoja, menú o visor abierto, el atrás del teléfono (o el gesto) sacaba de la app en vez de cerrar lo de
   encima. Mientras haya algo abierto se deja UNA entrada de historial de guarda (pushState): el atrás la consume y
   aquí se cierra lo de arriba (como si se tocara el velo o la ×). Si lo abierto se cierra con un toque, la guarda se
   devuelve sola (history.back) para que el siguiente atrás no se «gaste» en nada. Con nada abierto el atrás hace lo
   de siempre. */
var ATRAS={guarda:false, ignora:0, obs:null, pend:false};
/* lo que se puede cerrar, de arriba hacia abajo */
function capasAbiertas(){
  var L=[];
  try{
    var v=document.getElementById("visor"); if(v && v.classList.contains("on")) L.push({k:"visor", el:v});
    Array.prototype.forEach.call(document.body.children, function(el){
      if(el && el.nodeType===1 && /(^|\s)(leemask|hoja-velo)(\s|$)/.test(el.className||"") && el.style.display!=="none") L.push({k:"velo", el:el}); });
    if(typeof window.__hoja225!=="undefined" && window.__hoja225 && document.querySelector(".h225")) L.push({k:"hoja225"});
  }catch(e){}
  return L;
}
function hayCapaAbierta(){ return capasAbiertas().length>0; }
/* cierra la de más arriba: el visor, luego el último velo agregado (su ×, o el toque en el velo), luego la hoja de la tarea */
function cierraCapaArriba(){
  var L=capasAbiertas(); if(!L.length) return false;
  var vis=L.filter(function(c){ return c.k==="visor"; })[0];
  if(vis){ vis.el.classList.remove("on"); return true; }
  var velos=L.filter(function(c){ return c.k==="velo"; });
  if(velos.length){
    var el=velos[velos.length-1].el, x=el.querySelector('[data-hx254],[data-bsrvx],[aria-label="Cerrar"]');
    try{ if(x) x.click(); else el.dispatchEvent(new MouseEvent("click", {bubbles:true, cancelable:true})); }catch(e){}
    if(el.parentNode && el.style.display!=="none"){ try{ el.remove(); }catch(e){} }   /* si no supo cerrarse, se quita */
    return true;
  }
  if(L.some(function(c){ return c.k==="hoja225"; })){ window.__hoja225=null; try{ render(); }catch(e){} return true; }
  return false;
}
function revisaGuardaAtras(){
  ATRAS.pend=false;
  var hay=hayCapaAbierta();
  try{
    if(hay && !ATRAS.guarda){ history.pushState({doitCapa:Date.now()}, ""); ATRAS.guarda=true; }
    else if(!hay && ATRAS.guarda){ ATRAS.guarda=false;
      if(history.state && history.state.doitCapa){ ATRAS.ignora++; history.back(); } }
  }catch(e){}
}
function alAtras(){
  if(ATRAS.ignora>0){ ATRAS.ignora--; return; }
  ATRAS.guarda=false;
  if(!hayCapaAbierta()) return;
  cierraCapaArriba();
  /* si quedó otra abajo, se vuelve a poner la guarda para el siguiente atrás */
  setTimeout(revisaGuardaAtras, 0);
}
(function(){
  try{
    if(!window.history || typeof history.pushState!=="function" || typeof MutationObserver==="undefined") return;
    window.addEventListener("popstate", alAtras);
    var pide=function(){ if(ATRAS.pend) return; ATRAS.pend=true; setTimeout(revisaGuardaAtras, 0); };
    ATRAS.obs=new MutationObserver(pide);
    var monta=function(){ try{ ATRAS.obs.observe(document.body, {childList:true, subtree:true});
      var v=document.getElementById("visor"); if(v) ATRAS.obs.observe(v, {attributes:true, attributeFilter:["class"]}); }catch(e){} };
    if(document.body) monta(); else document.addEventListener("DOMContentLoaded", monta);
  }catch(e){}
})();
