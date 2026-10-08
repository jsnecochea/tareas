# vigia/ · autodiagnóstico y regreso de la app

No se publica (el servidor solo sirve `index.html` y `sw.js`). Lo corren la Mac o una tarea programada.

| pieza | qué hace | sale con |
|---|---|---|
| vigía en `index.html` (`<script id="vigia-errores">`) | atrapa `error` y `unhandledrejection`, agrupa por firma sin datos personales, guarda en localStorage y escribe con merge `bitacora_personas/<usuario>.errores_app`. Si el script principal no llega a `window.__doitArranco` en 12 s: firma `arranque_fallido` y botón «Volver a intentar» (quita SW y cachés, recarga; una vez por sesión) | — |
| `humo.js [url] [--espera-build N] [--json]` | abre la app a 390 px con Firebase simulado (sin sesión, no escribe nada) y dice si arranca | 0 arranca · 2 NO ARRANCA · 3 aún no publicado · 1 no se pudo probar |
| `umbral.js personas.json --build N --desde ms` | con los `errores_app` de todas las personas decide si el build trae errores nuevos de más (≥10 en 15 min, o la misma firma en ≥3 personas, o arranque fallido) y arma el texto del aviso | 0 normal · 4 supera |
| `regreso.js --build N [--publicar]` | revierte el commit que subió el build N y todo lo de encima. Sin `--publicar`: rama `regreso/build-N` (no toca main). Con `--publicar` (solo si humo dio 2): batería completa y push a main sin force | 0 ok · 1 error |

Regla: el revert se publica solo cuando la app NO ARRANCA. Si arranca con errores de más, se avisa a Salvador con la firma y queda la rama `regreso/build-N` lista.
