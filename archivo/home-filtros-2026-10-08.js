/* Copia íntegra de lo que reemplazó el cambio «Vencidas y Te encargaron como filtros» (build 295, 2026-10-08).
   Por qué se cambió: Salvador pidió que Vencidas y Te encargaron fueran filtros con globito de color arriba de Próximas y que
   lo vencido o encargado también cuente en la ficha Hoy (lo que hay que hacer) o Te esperan (decisión o respuesta).
   - El renglón de «Te encargaron» que se armaba dentro de vLista ahora es filaEncargoInicio (mismo HTML + etiqueta Vencida).
   - cuentasInicio / vFichasInicio contaban solo H.preg y H.hoy; ahora cuentan con filtrosInicio.
   - vListaInicio tenía el orden Vencidas, Próximas, Te encargaron… y el número de Vencidas en rojo sin globito.
   - filasInicio no marcaba lo vencido; vGrupoInicio pintaba H.hoy y H.venc tal cual. */

  var hMis="";   /* la lista de «Te encargaron»; se ve en su propia vista (vGrupoInicio) */
  if(mis.length){
    hMis='<ul class="list">';
    mis.forEach(function(e){
      var venc=dDif(e.limite,hoy())>0;
      hMis+='<li><button class="row" data-enc="'+e.id+'">'+
        '<span class="dot '+(venc?"d-venc":"d-esper")+'"></span><span>'+
        '<span class="nm">'+esc(PERSONAS[e.de].nombre)+' te encarg\u00f3</span>'+
        '<span class="ls">'+esc(e.texto)+'</span></span>'+
        '<span class="meta">'+(venc?'<span class="bdg g-venc">!</span>':'<span class="bdg g-esper">1</span>')+
        '</span></button></li>';
    });
    hMis+='</ul>';
  }


/* ---- */
function cuentasInicio(H){ return {esperan:(H.preg||[]).length, bandeja:cuentaBandeja().total, hoy:(H.hoy||[]).length}; }
function vFichasInicio(H){
  var n=cuentasInicio(H);
  return '<div class="fichas-inicio">'+["esperan","bandeja","hoy"].map(function(k){ var G=GRUPOS_INICIO[k];
    return '<button class="ficha-inicio'+(n[k]?'':' cero')+'" data-grupo="'+k+'" style="--fc:'+G.c+';--fb:'+G.b+'" aria-label="'+G.t+': '+n[k]+'">'+
      '<span class="fi-n" aria-hidden="true">'+n[k]+'</span><span class="fi-l" aria-hidden="true">'+G.t+'</span></button>'; }).join("")+'</div>';
}

/* ---- */
function vListaInicio(C){
  var H=C.H, R=[];
  if(H.venc.length) R.push(["venc", H.venc.length, "rojo"]);
  if(H.fut.length) R.push(["prox", H.fut.length]);
  if(C.nMis) R.push(["enc", C.nMis]);
  if(H.otros.length) R.push(["rev", H.otros.length]);
  var nc=nCompartidas(); if(nc) R.push(["comp", nc]);
  if(C.claude.length) R.push(["claude", C.claude.length, "", 1]);
  R.push(["hist", null]);
  return '<nav class="lista-inicio" aria-label="Más">'+R.map(function(r){ var t=GRUPOS_INICIO[r[0]].t;
    return '<button class="fila-inicio" data-grupo="'+r[0]+'" aria-label="'+t+(r[1]!=null?': '+r[1]:'')+'"><span class="fl-t">'+t+'</span>'+
      (r[3]?'<span class="fl-p" aria-hidden="true"></span>':'')+(r[1]!=null?'<span class="fl-n'+(r[2]?' '+r[2]:'')+'" aria-hidden="true">'+r[1]+'</span>':'')+'</button>'; }).join("")+'</nav>';
}

/* ---- */
/* los renglones de Vencidas y Hoy, iguales a los de las secciones de antes (con el renglón que se cierra tras «Ya está») */
function filasInicio(k, L){
  return '<div class="revl ttl l270 l-'+k+'">'+filas272(k, L, function(x){ return '<button class="revr ttr" data-id="'+esc(x.t.id)+'"><i style="background:'+COL270[k]+'"></i><span class="ttx"><span class="rn">'+esc(x.t.nombre||"Sin nombre")+'</span>'+(x.why?'<small>'+esc(x.why)+'</small>':'')+'</span></button>'; })+'</div>';
}

/* ---- */
function vGrupoInicio(g, C){
  var H=C.H, G=GRUPOS_INICIO[g], cuerpo="", vacio="Nada pendiente aquí.";
  if(g==="esperan") cuerpo=vDecide284(H, filas272, true);
  else if(g==="hoy"){ if(H.hoy.length) cuerpo=filasInicio("hoy", H.hoy); }
  else if(g==="venc"){ if(H.venc.length) cuerpo=filasInicio("venc", H.venc); }
