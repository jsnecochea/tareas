/* ARCHIVO — copia íntegra de lo que reemplazaron los lectores únicos (docs/campos-unicos.md), 2026-10-08.
   Por qué: abierta/cerrada, contestada, a quién espera y encargado se leían de varios campos con reglas distintas en la app
   y en el bot de la Mac (una tarea que la Mac cerraba con vinculada_a seguía saliendo en la app; una pregunta contestada en
   un lugar regresaba en otro). Ahora: estaAbierta, yaContestada (+ anotaRespuesta / respuestas_log), esperaDe / esperasDe y
   encargadoDe, en el bloque @@CAMPOS-UNICOS de index.html (el mismo bloque vive en el bot).
   - claveQ / apartadaQ / respondida267 / ultimaRespuesta: ahora clavePregunta, mismaPregunta, yaContestada, ultimaRespuestaDe.
   - esperaDe (texto del encargo en la fila): renombrada respuestaEncargoTxt; el nombre esperaDe es ahora el lector de a quién espera.
   - abiertaVisible / viva: usan estaAbierta. */

function claveQ(q){ return normQ267(String(q||"").replace(/\(\s*revisi[oó]n[^)]*\)/gi," ")).replace(/\s*\brevision \d{1,2} [a-z]{3,}$/,"").trim(); }
/* la última vez que Salvador contestó algo en esta tarea: lo que dictó o escribió él, la nota «Entendí…» con la que
   el cerebro aplicó su respuesta, o su respuesta a la decisión. Una pregunta hecha ANTES de eso ya quedó contestada. */
function ultimaRespuesta(t){
  var m=0; if(!t) return 0;
  (t.msgs||[]).forEach(function(x){ if(!x || x.oculto || x.eliminado) return; var ts=+x.ts||0; if(!ts) return;
    var suyo=x.k==="bo" && (x.de===yo || (!x.de && t.duenio===yo));
    var aplicada=x.k==="bi" && /^\s*(IA:\s*)?Entend[ií]/.test(String(x.t||""));
    if((suyo || aplicada) && ts>m) m=ts; });
  var D=t.decision; if(D && typeof D==="object" && D.respuesta && (+D.respuesta.ts||0)>m) m=+D.respuesta.ts;
  return m;
}
function contestadaDespues(t, f){ var ts=+(f && f.ts)||0; return ts>0 && ts<=ultimaRespuesta(t); }
function apartadaQ(t, n){ var A=t && t.falta_paso_claude_apartado; if(!A) return false; return (Array.isArray(A)?A:[A]).some(function(a){ return a && claveQ(a.q||a.pregunta||"")===n; }); }
function respondida267(t, q){ var n=claveQ(q); if(!n) return false; return (t.resp267||[]).some(function(r){ return claveQ(r)===n; }) || apartadaQ(t, n); }

function esperaDe(t){
  if(!t.encargado) return t.ultima||"";
  var e=encargos.filter(function(x){return x.id===t.encargado.id})[0];
  if(!e) return "encargado";
  if(e.cerrado) return "contestó";
  var d=dDif(e.creado?iso(e.creado):t.encargado.desde, hoy());
  return d<=0 ? "sin respuesta todavía" : "sin respuesta desde hace "+d+(d===1?" día":" días");
}

function esperaTercero272(t){
  if(!t || t.cierre || t.es_recordatorio) return null;
  var p=null; try{ p=pelota263(t); }catch(e){} if(p && p.por==='te_necesito') return null;
  var yoN=[]; try{ yoN=misNombres().map(_n179); }catch(e){}
  var esYo=function(q){ var n=_n179(q); return !n || q===yo || n===_n179(yo) || yoN.indexOf(n)>=0 || (PERSONAS[q] && q===yo); };
  var msDia=function(f){ return /^\d{4}-\d{2}-\d{2}$/.test(String(f||''))?new Date(f+'T00:00:00').getTime():0; };
  var c=null;
  if(t.detenido && t.detenido.quien && !esYo(String(t.detenido.quien))) c={quien:String(t.detenido.quien), desde:msDia(t.detenido.desde)};
  else if(t.estado==='espera' && t.espera && !esYo(String(t.espera)) && !(PERSONAS[t.espera] && PERSONAS[t.espera].jefe)) c={quien:(PERSONAS[t.espera]||{}).nombre||String(t.espera), desde:+t.espera_desde||0};
  else if(t.encargado && t.encargado.id){ var e=null; try{ e=(encargos||[]).filter(function(x){ return x.id===t.encargado.id; })[0]; }catch(err){}
    if(e && !e.cerrado && e.a && !esYo(String(e.a))) c={quien:(PERSONAS[e.a]||{}).nombre||String(e.a), desde:msDia(t.encargado.desde)||(+e.creado||0)}; }
  if(!c) return null;
  var lastIn=0; (t.msgs||[]).forEach(function(m){ if(m && !m.oculto && !m.eliminado && +m.wa_in===1 && (+m.ts||0)>lastIn) lastIn=+m.ts||0; });
  if(c.desde && lastIn>c.desde) return null;   /* ya contestó: vuelve a sus secciones */
  c.corto=nombreCorto(c.quien).split(' ')[0]||c.quien;
  return c;
}

function abiertaVisible(t){ return t && !esPropuesta256(t) && !t.cierre && !t.fusionada_en && !t.es_recordatorio && estadoReal(t)!=="cerrada" && (t.duenio===yo || (PERSONAS[yo]&&PERSONAS[yo].jefe)); }

  function viva(t){ return !t.cierre; }   /* dentro de fichaPersona */
