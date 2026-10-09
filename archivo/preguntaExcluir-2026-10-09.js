/* Retirada el 9-oct-2026 (build 312). Por qué: Salvador 9-oct 07:32 — un mismo contacto puede tener hasta 10 tareas y mandar
   memes, avisos o comprobantes de otras; sacar al contacto de la tarea por haber borrado 2+ cosas suyas es incorrecto.
   Lo correcto: la Mac clasifica cada foto y PDF por su contenido (bot 18z55). Copia íntegra: */
/* APRENDER DE LO QUE SE ELIMINA (Salvador 9-oct: «borré imágenes que no tienen nada que ver y volvieron; que aprenda»).
   Si ya quitó 2 o más cosas que mandó el mismo contacto, se le ofrece sacar a ese contacto de la tarea: la Mac (18z53) deja de
   pegar aquí lo suyo por la liga del contacto y lo manda a Acomodo. Se pregunta una vez por contacto. */
function preguntaExcluir(tid){
  var t=tareas.filter(function(x){ return x.id===tid; })[0]; if(!t) return;
  var cuenta={}; (t.msgs||[]).forEach(function(m){ if(m && m.wa_c && (m.eliminado||m.apartado) && (m.wa_in===1 || m.k==="bi")) cuenta[m.wa_c]=(cuenta[m.wa_c]||0)+1; });
  var ya=(t.wa_excluidos||[]).concat(t.wa_no_excluir||[]);
  var c=Object.keys(cuenta).filter(function(k){ return cuenta[k]>=2 && ya.indexOf(k)<0; })[0]; if(!c) return;
  var corto=nombreCorto(c);
  sobreHoja('<div class="mov225" role="dialog" aria-label="¿Saco a este contacto?"><div class="h225g"></div><div class="h225h"><b>¿Ya no meto aquí lo de '+esc(corto)+'?</b><button class="h225b" data-hx254="1" aria-label="Cerrar">×</button></div>'+
    '<div class="h225c"><p class="h225v0">Quitaste '+cuenta[c]+' cosas que mandó '+esc(corto)+'. Si dices que sí, lo que mande ya no cae solo en esta tarea: se va a Acomodo para que tú decidas.</p>'+
    '<button class="hop big254 pri" data-h254="si">Sí, ya no lo metas aquí</button><button class="hop big254" data-h254="no">No, sí es de esta tarea</button></div></div>',
    function(k){ var T=tareas.filter(function(x){ return x.id===tid; })[0]||t;
      if(k==="si"){ T.wa_excluidos=(T.wa_excluidos||[]).concat([c]); T.wa_contactos=(T.wa_contactos||[]).filter(function(x){ return x && x.nombre!==c; });
        msg(T,"bi","Listo: lo que mande "+corto+" ya no cae solo en esta tarea; va a Acomodo."); var m=T.msgs[T.msgs.length-1]; m.canal="priv:"+yo; m.res238=1; }
      else T.wa_no_excluir=(T.wa_no_excluir||[]).concat([c]);
      guarda(T); try{ render(); }catch(e){} });
}
