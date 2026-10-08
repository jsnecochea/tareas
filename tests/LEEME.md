# Pruebas de Doit

Todas las pruebas son `tests/*.test.js`. Hay dos tipos:

- **Node puro** (sin navegador): sacan funciones de `index.html` y las corren en `vm`. Tardan ~5 s en total y **siempre** se corren.
- **Navegador** (Playwright + Chromium): cargan la app completa a 390 px. Cada una está en una o varias **áreas** de `tests/areas.json`.

## Cómo correrlas

```bash
node tests/correr.js --area caminata      # para cada cambio: Node puro + navegador del área, en paralelo
node tests/correr.js --area home,tarea    # varias áreas
node tests/correr.js --todo               # batería completa en paralelo (antes de publicar)
node tests/correr.js b245 b277            # solo esas
node tests/correr.js --lista              # áreas y qué pruebas tiene cada una
```

Opciones: `-j N` cuántas a la vez (por omisión 4) · `--serie` una por una (para medir) · `--repite N` cada prueba N veces (para cazar inestables).
Todas corren con `TZ=America/Monterrey` salvo que ya pongas otra `TZ`. Sale con código 1 si algo falla y muestra las líneas `X` de cada falla.

## Áreas

| área | qué cubre |
|---|---|
| home | inicio: Acomodo, Decide tú, Te pregunta, Vencidas/Hoy, Tu historial |
| tarea | la tarea abierta: encabezado, fichas, plática, mover/vincular, detalle |
| barra | barra de Claude, cerebro del dictado (`completaRevision`), órdenes |
| dictado | burbuja de dictado, voz, pausa/seguir |
| caminata | modo Caminata (274-286) |
| fechas | fechas, agenda, metas, seguimientos |
| avisos | notificaciones, sw.js, avisos una vez |
| whatsapp | mensajes de WhatsApp, Acomodo de mensajes, palomitas, imágenes |
| lectura | lectura en voz, menú único, audífono |

Alias: `claude`=barra, `agenda`=fechas, `acomodo`=home, `hilo`=tarea, `voz`=lectura, `wa`=whatsapp.

## Reglas

- Prueba nueva de navegador → agrégala a su área en `areas.json` (el corredor avisa de las que no tienen área).
- Nada de esperas largas fijas para "que NO pase": espera la condición real (con tope) o una espera corta fija.
- `tests/retiradas/` guarda pruebas de funciones que se quitaron de la app; no se corren (ver `archivo/`).
