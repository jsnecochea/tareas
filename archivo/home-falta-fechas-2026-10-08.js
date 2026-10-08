/* Copia íntegra de lo que se quitó con la regla «sin fechas = Falta información» (build 296, 2026-10-08).
   Por qué: Salvador (8-oct 16:48) — las tareas sin fecha de finiquito o sin próximo seguimiento van a «Falta información»
   (Te esperan), no a Vencidas ni a Hoy. sinDefinir270 mandaba las de sin fecha a «Vencidas mías» con
   «sin fecha · falta definir cuándo»; ahora las detecta faltanFechas. */
function sinDefinir270(t){ try{ return !!t && !t.f_vigente && !t.es_recordatorio && t.indefinida!==true && !campanaDe(t); }catch(e){ return false; } }
/* en armaHome270: */
//  hoyL.forEach(function(t){ if(suya270(t) && sinDefinir270(t)) pon(out.venc, t, pre(t, "sin fecha · falta definir cuándo")); });
/* en filasInicio (build 295): marca es-sinfecha para las de sin fecha que la ficha Hoy juntaba */
//  var sf=k!=="venc" && !v && sinDefinir270(x.t);
