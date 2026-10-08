# Plan de seguimiento: contrato entre la app y el bot de la Mac

Vigente desde el build 299 (8-oct-2026). Pedido de Salvador: **un solo plan por tarea**, el mismo para la app y para el bot.
La app ya lo lee y lo escribe (`planDe`, `escribePlan`, `faltaPlan`, `seguimientoPerdido` en `index.html`).
Este documento dice qué tiene que hacer el bot (`~/doit-whatsapp/index.js`) para usar el mismo plan.

## 1. Campos en el documento de la tarea (`bitacora_tareas/<id>`)

```js
plan_seguimiento: {
  finiquito:    "2026-10-30" | "indefinida",       // fecha de terminar, o "indefinida"
  cada:         "dos veces a la semana, lunes y jueves", // lo que se dijo, tal cual (solo para mostrar)
  dias:         ["lun","jue"],                     // de: dom lun mar mie jue vie sab (sin acento). Si hay días, periodicidad = ""
  periodicidad: "diario" | "semanal" | "quincenal" | "mensual" | "",
  hora:         "10:00" | "",                      // HH:MM, 24 h, hora de Monterrey
  proximo:      "2026-10-12",                      // próxima fecha de seguimiento (calculada, ver 3)
  metas:        [{ texto: "Muestra pintada", fecha: "2026-10-14", hecha: false }],
  proximo_paso: "Claude le escribe a Manuel por la muestra", // qué hace Claude/el bot (o quién) en el siguiente seguimiento
  con_quien:    "Manuel Parra",                    // contacto o persona a quien se le da seguimiento (opcional)
  actualizado:  { ts: 1791500000000, por: "salvador" | "mac" | "app" }
}
plan_log: [ { fecha: "2026-10-12", hecho: true, por: "mac", nota: "Le escribí a Manuel; dice que el viernes" } ]
```

- `plan` NO se usa: ese nombre ya es la lista de pasos (`t.plan[]`, `resumen.plan[]`).
- Escribir siempre con **merge** del campo `plan_seguimiento` completo (leer, cambiar lo suyo, escribir el objeto). Nunca mandar `msgs`.
- `plan_log` solo se **agrega** al final (leer el arreglo, agregar uno, escribir el arreglo). Nunca se borra.
- La fecha de la tarea sigue siendo `f_vigente` / `indefinida` (la usa toda la app). Si el bot cambia el finiquito, escribe **las dos cosas**:
  `f_vigente` (o `indefinida: true`) y `plan_seguimiento.finiquito`.

## 2. Cómo se lee (mismas reglas que `planDe(t)`)

Lo guardado en `plan_seguimiento` manda. Si un dato no está, se toma de los campos de antes (sin escribir nada):

| dato | si no está en el plan, de dónde sale |
|---|---|
| finiquito | `indefinida:true` o `periodicidad` semanal/mensual → "indefinida"; si no, `f_vigente` (si no trae `falta_fecha`) |
| dias / periodicidad | leer el texto de `ritmo`, `ritmo_seguimiento` o `seg_a.cada` (días de la semana; diario / semanal / quincenal / mensual; "a las 10") |
| proximo | calculado (punto 3); si no hay ritmo: `plan_seguimiento.proximo`, el aviso más cercano de `avisos[]`, `seg_a.programados`, o `f_vigente` de una indefinida |
| proximo_paso | `resumen.que_toca` (si no termina en "· hecho") o el primer paso pendiente de `plan[]` / `resumen.plan[]` / `resumen.pendientes[]` |
| con_quien | `seg_a.contacto` o el primer `wa_contactos[].nombre` |

Para tareas viejas sin `plan_seguimiento`, un `ritmo` escrito que no dice días ni periodicidad cuenta como seguimiento (así estaban).

## 3. La próxima fecha se calcula con código (nunca con IA)

- `ultimo` = la fecha más nueva de `plan_log` con `hecho !== false`.
- `desde` = `ultimo + 1 día`; si no hay `ultimo`: el día siguiente a `actualizado.ts` (y en tareas sin plan guardado, hoy).
- Con `dias`: la primera fecha desde `desde` cuyo día de la semana esté en `dias`.
- `diario`: `desde`. `semanal`: `(ultimo o el día de actualizado) + 7`. `quincenal`: `+15`. `mensual`: `+1 mes`.
- Al escribir el plan, guardar también `proximo` ya calculado.

## 4. Lo que tiene que hacer el bot

1. **Leer el plan con estas reglas** antes de cualquier seguimiento o pregunta.
2. **Dar el seguimiento el día `proximo`** (a la `hora`, si hay) haciendo `proximo_paso` con `con_quien`. Las fechas, con código.
3. **Anotarlo en `plan_log`**: `{fecha: <hoy AAAA-MM-DD>, hecho: true, por: "mac", nota: <qué hizo en una línea>}`.
   Si no se pudo: `hecho: false` con la nota del porqué (la app lo sigue marcando como no dado).
   Después, recalcular y guardar `plan_seguimiento.proximo`.
4. **No volver a preguntar** si el plan está completo: finiquito + (dias o periodicidad o proximo) + proximo_paso.
   En especial, NO escribir más «¿Cuál es el próximo paso que Claude debe hacer aquí? (revisión N-oct)» en `falta_paso_claude`
   ni en `hecho238.falta` cuando `proximo_paso` ya existe. Si ya la apartó (`falta_paso_claude_apartado`), quitarla también de `hecho238.falta`.
5. **Solo si el plan está incompleto**, preguntar lo que falta, una vez y con texto fijo (sin fecha en el texto):
   «¿Para cuándo la quieres terminar, o es indefinida?», «¿Cuándo te recuerdo para darle seguimiento?»,
   «¿Cuál es el siguiente paso de esta tarea y quién lo hace?». La respuesta se guarda en `plan_seguimiento`.
6. **No guardar en las tareas los avisos que el propio Doit le manda a Salvador por WhatsApp** (`wa_c: "Doit"`, texto
   «Doit: IA · …»). Hoy hay 84 en las tareas abiertas; la app ya los ignora, pero ensucian el hilo.

## 5. Lo que hace la app

- Te esperan enseña «Falta fecha de finiquito / próximo seguimiento / próximo paso» cuando el plan está incompleto.
- Si `proximo` ya pasó y no hay `plan_log` de esa fecha o después: «No se dio el seguimiento del <día>» en Te esperan.
- Lo que Salvador dicta («lunes y jueves», «diario a las 10») y sus respuestas a esas preguntas se escriben en `plan_seguimiento`,
  y la tarea enseña una línea: «Seguimiento: lun y jue · próximo jue 8».
