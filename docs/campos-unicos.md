# Campos únicos: contrato entre la app y el bot de la Mac

Vigente desde el build 300 de la app y la 18z46 del bot (8-oct-2026). Pedido de Salvador: cuatro cosas que hoy se leían
de varios campos, con reglas distintas en la app y en la Mac, se leen con **un solo lector cada una**, igual en los dos.

El código vive en un bloque marcado `/* @@CAMPOS-UNICOS-INICIO */ … /* @@CAMPOS-UNICOS-FIN */`. Es **el mismo texto, letra
por letra,** en `index.html` (app) y en `~/doit-whatsapp/index.js` (bot). Si se cambia en uno, se copia al otro y se corren
las dos pruebas: `tests/campos-unicos.test.js` (app) y `campos18z46.test.mjs` (bot). Las dos usan los mismos casos:
`tests/fx-campos-unicos.json`.

Regla de siempre: **leer nunca escribe** y no hay migración de datos. Lo de antes se lee como respaldo.

## 0. El contexto (`ctx`)

Los lectores reciben un `ctx` opcional: `{yo, personas: {id: {nombre, jefe}}, encargos: [{id, para | a, cerrado, creado, texto}], nombresYo: [...]}`.
Si no se pasa, cada anfitrión da el suyo con `ctxCampos()`:

- app: el usuario (`yo`), `PERSONAS`, `encargos` y `misNombres()`.
- bot: `yo: "salvador"`, el equipo (Salvador, Samuel, Cynthia, Josué, Carlos, Karina), sin encargos (el bot no lee esa colección), `nombresYo: ["salvador", "chava"]`.

## 1. ¿Está abierta? — `estaAbierta(t)`

Cerrada si pasa **cualquiera** de estas: `t.cierre`, `t.fusionada_en`, `t.vinculada_a`, o `t.estado` (sin importar mayúsculas)
es `cerrada`, `no_ejecutada`, `fusionada`, `eliminada`, `borrada` o `descartada`. Todo lo demás está abierta (`dormida` también:
es una abierta que duerme; quien no quiera dormidas lo filtra aparte).

- App: `estadoReal(t)` da `"cerrada"` (o `"no_ejecutada"`) cuando `estaAbierta` dice que no, aunque no haya `cierre`;
  `abiertaVisible`, el resumen del día, la ficha de persona, la barra y las listas usan `estaAbierta`.
  Al cargar, una tarea con `vinculada_a` se trata como fusionada: no se pinta y su liga lleva a la tarea donde quedó.
- Bot: `abierta24`, `abierta38`, `abierta45`, `abiertaQ`, `candidata37` y `estadoCandidata` usan `estaAbierta` para la parte
  de cerrada/abierta y conservan sus filtros propios (dormida, dato, recordatorio).
- **Quién escribe:** cerrar = `cierre {tipo, f}` (app) o `vinculada_a: <id destino>` / `fusionada_en` (Mac). Nadie más.

## 2. ¿Ya contestó? — `yaContestada(t, pregunta, ctx)` y `anotaRespuesta(...)`

Campo nuevo, solo se **agrega** al final (leer el arreglo, agregar, escribir el arreglo; tope 100):

```js
respuestas_log: [ { pregunta: "¿A quién le mando el plano?",  // tal cual se hizo
                    clave: "a quien le mando el plano",        // clavePregunta(pregunta)
                    texto: "A Manuel",                          // lo que contestó ("" si se sabe que contestó pero no qué)
                    por: "salvador", via: "app" | "caminata" | "mac" | "whatsapp", ts: 1791400000000 } ]
```

`pregunta` puede ser texto o un objeto `{pregunta | q | que | texto | t, ts}`. Dos preguntas son la misma (`mismaPregunta`)
si su clave es igual o una empieza con la otra (≥ 30 letras). La clave quita «IA ·» al principio y la marca «(revisión 8-oct)».
Contestada si:

1. está en `respuestas_log`;
2. respaldo: está en `resp267`; está apartada en `falta_paso_claude_apartado` (`q`/`pregunta`); hay un mensaje
   «Respuesta a «q»: …» en `msgs`; o la pregunta trae `ts` y es anterior a la última respuesta de Salvador
   (`ultimaRespuestaDe`: lo que él dictó o escribió, la nota «Entendí…», o `decision.respuesta.ts`).

`anotaRespuesta(t, pregunta, texto, por, via, ts)` agrega a `respuestas_log` y también a `resp267` (lo leen las versiones
viejas del bot hasta que se reinicie). No duplica.

- App: `respondida267`, `bloqueaQ267`, el cuestionario de la tarea, la Caminata y `purga267` usan `yaContestada` / `anotaRespuesta`.
- Bot: `preguntaResuelta` (avisos y recordatorios), PASOS37 (`yaContestada37`) usan `yaContestada`. Escribe `respuestas_log`
  cuando Salvador contesta por WhatsApp una pregunta de la app (`item.tipo === "app"`) y cuando PASOS37 convierte su respuesta.

## 3. ¿A quién espera? — `esperaDe(t, ctx)` / `esperasDe(t, ctx)`

Campo nuevo (el único que se escribe de aquí en adelante):

```js
espera_a: { id: "samuel" | "",          // id del equipo, o "" si es externo
            quien: "Samuel",             // nombre para mostrar
            desde: 1791300000000,        // ms (también se acepta "AAAA-MM-DD")
            motivo: "la cotización" }    // o null para quitarla
```

`esperasDe` da la lista en este orden y `esperaDe` la primera; cada una `{id, quien, desde, motivo, fuente, deMi, jefe}`:

| fuente | de dónde |
|---|---|
| `espera_a` | el campo nuevo (objeto o texto) |
| `detenido` | `t.detenido {quien, desde, que}` |
| `espera` | `t.estado` = `espera`/`esperando` con `t.espera` (id o nombre) y `espera_desde` |
| `encargo` | `encargadoDe(t)` con un encargo abierto en la colección de encargos |

`deMi` = la espera es de quien usa la app (Salvador en el bot). Una tarea cerrada (`estaAbierta` = no) o un recordatorio no espera.
`espera266` no es «a quién espera»: es la marca de «ya vi lo último que me escribió» y sigue igual.

- App: `esperaTercero272` (lo que pasa a «Las lleva Claude») es la primera espera que no es tuya; `meDetiene` también cuenta
  `espera_a` a ti. Al pedir autorización a Salvador se escribe `espera_a` además de `estado/espera` (y se limpia al contestar).
- La función de la fila que decía cómo va el encargo se llama ahora `respuestaEncargoTxt`.

## 4. ¿Quién la tiene encargada? — `encargadoDe(t, ctx)`

Da `{id, nombre, encargo, desde, fuente}` o `null`, y nunca truena:

| forma guardada | resultado |
|---|---|
| `"samuel"` / `"Josue"` / `"Manuel Parra"` | persona del equipo por id o por nombre; si no, externo `{id:"", nombre}` |
| `{a, id, desde}` (**forma canónica**, la que escribe `creaEncargo`) | `a` = persona, `id` = el encargo |
| `{id}` | si `id` es persona, esa; si no, se busca el encargo (`para` o `a`) |
| sin `encargado`, con `responsable` (lo pone la Mac al crear la tarea) | esa persona, `fuente: "responsable"` |
| vacío, número, `{}` | `null` |

- App: la fila enseña «→ Nombre · cómo va» solo con un encargo a otra persona (no con `responsable` ni cuando el encargado es el dueño);
  los canales y el contexto para la IA usan `encargadoDe`.
- **Quién escribe:** la app escribe `{a, id, desde}` (`creaEncargo`) y `null` al contestar. La Mac sigue escribiendo
  `responsable` al crear; no escribe `encargado`.

## 5. Datos al 8-oct (210 tareas leídas)

Sin `vinculada_a`, `espera`, `espera_a` ni `respuestas_log` todavía. `encargado` como texto `"salvador"` en 12 (dueño Salvador: ya no
enseña «→ salvador · encargado»). `responsable` en 7. Dos tareas con `estado: "cerrada"` sin `cierre` (PRUEBA_CLAUDE_BATERIA_20261003,
tVIGIA_TRIGGERS): ya se leían cerradas. No se corrigió ningún dato.
