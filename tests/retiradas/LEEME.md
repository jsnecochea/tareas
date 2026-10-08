# Pruebas retiradas

Aquí se apartan (no se borran) las pruebas que SOLO cubren funciones que ya se quitaron de la app.
`tests/correr.js` no las corre. Las funciones retiradas están íntegras en `archivo/`.

Revisión 8-oct-2026: ninguna prueba cubría *solo* funciones retiradas, así que no se apartó ninguna.
Las 6 funciones que estaban en listas de carga (refuerzo251, preguntaConcreta251, ultimos10_251,
opcionesMover, acomodoOk, grupoDe237) se quitaron de esas listas; ninguna aserción las usaba.
Las 9 funciones sin uso que todavía validan pruebas vivas (vDetalle en b204; subtituloTarea,
subtituloHTML, _primerNombre, juntaNombres en fichas/titulos; cosasParaTi, vResumenVivo, vFiltroMeta,
tareasParaMover en b225) se dejaron en la app marcadas «SIN USO, REEMPLAZADA»: se retiran junto con
esa parte de su prueba en otro paso.

8-oct-2026 · home de tres fichas: se apartó `b279.test.js`. Solo cubría la línea de estado
«N te preguntan · N vencidas · N hoy» al final del home (vEstado272), que se retiró: sus números viven
en las fichas Te esperan · Bandeja · Hoy y en la lista agrupada (lo prueba `tests/inicio.test.js`).
La función retirada está íntegra en `archivo/home-tres-fichas-2026-10-08.js`.

8-oct-2026 · home de tres fichas: `b285-plegado.test.js` es la copia íntegra de `b285.test.js` tal como
estaba en el build 293. Su parte 2 (secciones del home plegables por día, el resumen de abajo que abría
la sección plegada) cubría solo funciones retiradas: en el home nuevo cada grupo se abre en su propia
vista, siempre desplegado. La parte 1 («Tu historial») sigue viva en `tests/b285.test.js`.
