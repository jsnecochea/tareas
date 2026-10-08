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
