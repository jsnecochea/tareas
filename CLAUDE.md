# Doit · reglas para trabajar en este repo

App de una sola página: `index.html` (HTML + CSS + JS) y `sw.js`. El servidor publica SOLO esos dos archivos
(no sirve `/img`, `/js` ni `/tests`); cualquier archivo nuevo que la app necesite en producción hay que
coordinarlo antes con Josué (el publicador).

## Para cada cambio

1. Código nuevo con nombre descriptivo, **sin número de build en el nombre** cuando sea posible
   (`ordenCaminata`, no `camLista276`). Si reemplaza a una función vieja, quita la vieja (con copia en `archivo/`).
2. **El historial va en el commit y en `CHANGELOG.md`, no en comentarios.** Un comentario explica el PORQUÉ
   de una regla vigente; no "build NNN", ni quién lo pidió y a qué hora, ni "antes era…".
3. Prueba nueva en `tests/`; si es de navegador, ponla en su área de `tests/areas.json`.
4. Corre solo lo del área tocada: `node tests/correr.js --area <área>`
   (home · tarea · barra · dictado · caminata · fechas · avisos · whatsapp · lectura). Ver `tests/LEEME.md`.

## Antes de publicar

- Batería completa: `node tests/correr.js --todo` (≈80 s en paralelo). Todo en verde.
- `VERSION_APP` en `index.html` y `SW_VERSION` en `sw.js` al siguiente build.
- Nunca force-push a `main`.

## Lo que no se toca sin preguntar a Salvador

- Funciones marcadas `/* PENDIENTE DE CONECTAR (revisión 8-oct) */`: parecen sin uso pero son funciones
  planeadas (metas/empuje, vista supervisor, claridad, Google Calendar, accesos, etc.).
- Nada se borra sin dejar copia íntegra en `archivo/` con el porqué.
- Las pruebas no se debilitan para que pasen; las que solo cubren funciones retiradas se apartan a `tests/retiradas/`.
