/* Copia íntegra de lo que reemplazó el «Plan de seguimiento» (build 299, 2026-10-08).
   Por qué: Salvador (8-oct 17:32) pidió UN plan por tarea (plan_seguimiento) que lean la app y el bot de la Mac.
   tieneFiniquito / tieneSeguimiento / faltanFechas / faltanFechasTxt leían los campos sueltos; ahora todo pasa por
   planDe(t) y faltaPlan / faltaPlanTxt. */
/* Toda tarea tuya necesita su fecha de finiquito (o ser indefinida/recurrente) Y su próximo seguimiento: sin eso
   no está completa y va a «Falta información» (Te esperan), nunca a Hoy, Vencidas ni Próximas. Una indefinida cuenta
   completa solo si trae su próximo seguimiento. Se usan los campos de siempre: finiquito = f_vigente (sin falta_fecha
   ni fecha puesta por el sistema) o indefinida/periodicidad; seguimiento = ritmo, avisos con fecha que no ha pasado,
   seg_a programados por venir o con cada, recurrente, o la próxima fecha (f_vigente) de una indefinida. */
function tieneFiniquito(t){ return !!(t.indefinida===true || esRecurrente(t) || t.tipo==="recurrente" || (t.f_vigente && !t.falta_fecha && !fechaPuestaSola(t))); }
function tieneSeguimiento(t){
  var H=hoy();
  if(esRecurrente(t) || t.tipo==="recurrente" || String(t.ritmo||"").trim() || String(t.ritmo_seguimiento||"").trim()) return true;
  if(t.indefinida===true && t.f_vigente) return true;
  if((t.avisos||[]).some(function(a){ return a && ((a.fecha && a.fecha>=H) || (a.fecha && String(a.cada||"").trim())); })) return true;
  if(t.seg_a && (String(t.seg_a.cada||"").trim() || (t.seg_a.programados||[]).some(function(x){ return String(x||"").slice(0,10)>=H; }))) return true;
  return false;
}
function faltanFechas(t){
  try{
    if(!t || t.cierre || t.fusionada_en || t.es_recordatorio || esDato(t) || esDormida264(t) || estadoReal(t)==="cerrada") return [];
    if(typeof esPropuesta256==="function" && esPropuesta256(t)) return [];
    if(!(t.duenio===yo || (!t.duenio && t.creada_por===yo))) return [];
    var L=[]; if(!tieneFiniquito(t)) L.push("finiquito"); if(!tieneSeguimiento(t)) L.push("seguimiento"); return L;
  }catch(e){ return []; }
}
function faltanFechasTxt(t){ var L=faltanFechas(t); if(!L.length) return "";
  if(L.length===2) return "Falta fecha de finiquito y próximo seguimiento";
  return L[0]==="finiquito"?"Falta fecha de finiquito":"Falta próximo seguimiento"; }
