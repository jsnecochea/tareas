# Notificaciones: contrato para push.php (Carlos)

Pedido de Salvador (8-oct 8:53 y 9-oct 8:03): cada tipo de aviso tiene DOS interruptores, uno para la notificación de
Doit (push) y otro para el WhatsApp del número de Doit. Por defecto a Salvador solo le llegan recordatorios, citas,
acuerdos de hora o lugar, llamadas, cuando alguien espera su respuesta y pagos o compras por autorizar. Todo lo demás
apagado en ambas columnas. La app (build 313) y el bot de la Mac (18z59) ya lo respetan; falta push.php.

## 1. Dónde vive la preferencia

`bitacora_personas/<usuario>.notif` (Firestore y la copia que lee `fs_doc&col=bitacora_personas&id=<usuario>`):

```json
{
  "v": 2,
  "preset": "esencial",
  "tipos": {
    "recordatorio": {"push": true,  "wa": true},
    "no_supe":      {"push": false, "wa": false}
  },
  "ts": 1760000000000
}
```

- La app la guarda en Firestore y también por `push.php?action=fs_set` (col `bitacora_personas`, merge), que es
  por donde la lee la Mac (`fs_doc`). push.php tiene que leer la misma.
- `push` = notificación de Doit en el teléfono. Es la que tiene que respetar push.php.
- `wa` = mensaje de WhatsApp del número de Doit. La respeta el bot de la Mac.
- `preset`: `esencial` | `todas` | `ninguna` | `personalizado`. Es solo informativo.
- **Cómo saber el formato:** es el nuevo si `v >= 2` y TODOS los valores de `tipos` son objetos. El formato anterior
  traía `true/false` por tipo y llegó a tener `v: 3`, así que **no basta con mirar `v`**. Lo guardado con el formato
  anterior NO se respeta: vale el defecto de abajo. Salvador pidió empezar de cero con su regla.
- Un tipo del catálogo que no venga en `tipos` toma el defecto de ese tipo.

## 2. Catálogo (mismas claves en la app, la Mac y push.php)

| clave | qué es | defecto Salvador (push / wa) |
|---|---|---|
| recordatorio | Recordatorio que pusiste | sí / sí |
| cita | Cita o reunión (invitación, cita nueva o cambio de agenda) | sí / sí |
| acuerdo | Acuerdo de hora o lugar | sí / sí |
| llamada | Llamada (alguien pide que le llames) | sí / sí |
| espera | Alguien espera tu respuesta o decisión | sí / sí |
| autorizar | Pago o compra por autorizar | sí / sí |
| ia_atorada | Claude necesita un dato tuyo | no / no |
| no_supe | No supe qué contestar | no / no |
| claude_listo | Claude terminó algo (copia de lo que contestó, encargo listo) | no / no |
| resumen | Resumen del día o de la semana | no / no |
| falla | Falla técnica del sistema | no / no |
| falta_info | Tarea nueva o dato por completar | no / no |
| seguimiento | Seguimiento atrasado | no / no |
| asignado | Te asignaron o te escribieron en una tarea | no / no |
| wa_tarea | Mensaje nuevo de WhatsApp de una persona (chat ligado a tus tareas) | no / no |
| wa_grupo | Mensaje en un grupo de WhatsApp | no / no |
| wa_todo | Cualquier otro mensaje de WhatsApp | no / no |

Defecto de quien NO es jefe (no es `salvador` ni tiene `jefe: true`): lo mismo, más `falta_info`, `seguimiento` y
`asignado` encendidos en push (su trabajo diario); en wa solo lo esencial.

Claves de antes que todavía pueden llegar y a qué renglón van:
`te_necesito` con `subtipo: llamada` → `llamada`; con `subtipo: ia_atorada` → `ia_atorada`; con otro o sin subtipo →
`espera`. `atorado` y `pregunta` → `espera`.

## 3. Lo que tiene que hacer push.php

1. **`action=send`**: cada envío trae `tipo` (clave del catálogo). Antes de mandar el push:
   - normalizar la clave vieja (tabla de arriba);
   - leer `bitacora_personas/<usuario>.notif`; si no hay o es del formato anterior, usar el defecto;
   - mandar SOLO si `tipos[tipo].push === true`;
   - **tipo vacío o que no está en el catálogo = no se manda** (antes sonaba). Dejarlo en el log con el título.
2. **`action=aviso_set`** (recordatorios programados que dispara el servidor): llevan `tipo: "recordatorio"`; al
   dispararse se aplica la misma regla. La app ya no los manda si `recordatorio.push` está apagado y borra los
   programados (`aviso_del`) cuando se apaga.
3. **Mensaje nuevo de WhatsApp** (el push que el servidor manda cuando entra un WhatsApp a la bandeja):
   - mandarlo con `tipo: "wa_tarea"` si el chat está ligado a una tarea del usuario, `"wa_grupo"` si el jid termina en
     `@g.us`, y `"wa_todo"` en cualquier otro caso;
   - respetar el interruptor `push` de ese tipo (los tres apagados por defecto).
4. Cada push conserva `tag` y `data.tag` como hoy (el sw.js agrupa y cierra por tag).
5. Cachear la preferencia por usuario como mucho 2 minutos (la Mac hace lo mismo) para que un cambio en la pantalla se
   note pronto.

## 4. Lo que ya hace cada parte

- **App (build 313)**: pantalla de dos columnas; `notifPermite` usa `push`; todo push que dispara la app lleva su clave
  del catálogo; tipo desconocido no sale.
- **Bot de la Mac (18z59)**: todo aviso por WhatsApp a Salvador pasa por una sola función que lee `wa` (caché de 2 min;
  sin leer todavía = defecto); tipo desconocido no sale; lo que no sale queda en el log y, si es falla técnica, en
  `~/.doit-wa/salud.jsonl`. Los push que manda la Mac (`action=send`) se filtran con `push` y llevan la clave nueva en
  `tipo`. Las respuestas a lo que Salvador le pide a la IA en su chat no son notificaciones y no se filtran.
- **push.php**: pendiente (puntos 1 a 5).
