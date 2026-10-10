# Seguridad del servidor de Doit (push.php · claude.php) — especificación para Carlos

Pedido de Salvador (9-oct-2026): «seguridad al máximo». Esta especificación acompaña el build 317 de la app.

## El problema de hoy

- `push.php` solo pide `x-app-token: APP_TOKEN`, y APP_TOKEN va escrito dentro de `index.html`, que es público:
  cualquiera que abra la página lo tiene.
- El servidor confía en el encabezado `x-usuario`, que lo pone la propia app: cualquiera puede escribir ahí el nombre
  de otra persona.
- `fs_lista` entrega TODAS las tareas (≈210) a cualquier teléfono. Desde el build 316 la app solo las esconde en
  pantalla; los datos ya bajaron.

## Lo que ya hace la app (build 317)

- **Toda** llamada a `push.php` y a `claude.php` sale por una sola función (`llamaServidor`, en
  `src/js/01-config-y-avisos.js`) y lleva:
  - `Authorization: Bearer <ID token de Firebase>` (de `firebase.auth().currentUser.getIdToken()`; el SDK lo cachea y
    lo renueva solo, dura 1 h).
  - Por ahora siguen `x-app-token` y `x-usuario` (para no romper nada mientras el servidor no exija el token).
- Si no hay usuario de Firebase o el token falla, la llamada sale igual SIN `Authorization` (y se anota en consola).
- El service worker (`sw.js`) manda el mismo Bearer en `recordatorio_del` y `recordatorio_snooze` (Borrar / Posponer
  desde la notificación), con el último token que le pasó la app. Además reenvía `x-accion-token` si el push trae
  `data.accion_token` (ver (a.4)).
- **Contrato de sesión vencida:** si el servidor contesta **HTTP 401** con cuerpo `{"error":"auth"}`, la app avisa
  «Tu sesión venció, vuelve a entrar», cierra la sesión de Firebase y manda al login (una vez; no reintenta). Los
  cambios sin subir se quedan en el teléfono y suben al volver a entrar.
  - Un **403 por tarea ajena** NO debe usar `error:"auth"`; usar p. ej. `{"error":"sin_permiso"}`. La app no saca a
    nadie por un 403 así.
  - La app reconoce como sesión vencida: `error` que empieza con `auth`, `sesion`/`sesión`, `id_token`, `bearer`,
    `firebase` o `unauthenticated`, o `{"auth": false}`.

Acciones que la app usa (todas deben quedar protegidas): `fs_lista`, `fs_doc`, `fs_set`, `msg_agregar`, `hay_nuevo`,
`bandeja_lista`, `bandeja_marca`, `send`, `visto`, `wa_pedido`, `wa_marca`, `wa_estados`, `wa_agenda`, `aviso_set`,
`aviso_del`, `borrar_archivo`, alta de suscripción (POST sin `action`), `recordatorio_del`, `recordatorio_snooze`, y
`claude.php`.

---

## (a) Verificar el ID token de Firebase en CADA llamada

1. Leer `Authorization: Bearer <jwt>`.
   - OJO Apache/PHP-FPM: muchas veces borra este encabezado. En `.htaccess`:
     `SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1` (o `CGIPassAuth On`), y leer
     `$_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']`.
2. Verificar el JWT (librería recomendada: `kreait/firebase-tokens` o `firebase/php-jwt`; no escribir la cripto a mano):
   - **Firma RS256** con las llaves públicas de Google:
     `https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com`
     (elegir por `kid` del encabezado; cachear las llaves según el `Cache-Control: max-age` de esa respuesta).
     Rechazar `alg` distinto de `RS256`.
   - `aud` = **`doit-cce6f`** (el `projectId` de la config Firebase de la app, `src/js/01-config-y-avisos.js`, `var FB`).
   - `iss` = **`https://securetoken.google.com/doit-cce6f`**.
   - `exp` > ahora; `iat` ≤ ahora; `auth_time` ≤ ahora (tolerancia de reloj ≤ 60 s).
   - `sub` no vacío.
   - `email` presente y `email_verified === true`.
3. Mapear el correo (en minúsculas, sin espacios) al usuario de Doit: tabla de usuarios, campos `mail_trabajo` o
   `mail_personal` → su clave (`salvador`, `josue`, …). Si el correo no tiene usuario o está en bloqueados
   (`bitacora_bloqueados`): 403 `{"error":"sin_permiso"}`.
4. **Ignorar `x-usuario`.** El usuario de la llamada es SOLO el que salió del token. El `usuario` que venga en el cuerpo
   (p. ej. `visto`, `wa_estados`, suscripción) debe coincidir con el del token o se rechaza (salvo el jefe).
5. Sin token, token inválido o vencido: **401 `{"error":"auth"}`**. APP_TOKEN deja de bastar.
6. Excepción del service worker (`recordatorio_del` / `recordatorio_snooze`): el ID token puede estar vencido cuando
   se toca el botón horas después. Propuesta: al mandar cada push, el servidor pone en `data.accion_token` un HMAC
   (secreto del servidor) de `usuario|id|aviso_ts|vence` (vence 7 días); el SW lo devuelve en `x-accion-token`. Esas
   dos acciones aceptan Bearer válido **o** `x-accion-token` válido para ese mismo aviso, nada más.
7. Para la Mac y el conector (llamadas de servidor a servidor, sin usuario de Firebase): darles su propia credencial
   (token de servicio distinto por cliente, rotable, guardado fuera del repo), no el APP_TOKEN de la página.

## (b) Autorización por tarea

En `fs_lista`, `fs_doc`, `fs_set`, `msg_agregar`, `hay_nuevo` y `bandeja_*`:

- Un usuario solo **recibe** y solo **escribe** tareas donde aparece en alguno de estos campos:
  `duenio`, `creada_por`, `encargado`, `revisor`/`revisores`, `integrantes`, `espera_a` (o `espera`), `suplente`.
- **Salvador (jefe) ve y escribe todo.**
- `fs_lista` filtra EN EL SERVIDOR (en la consulta SQL), no en la app.
- `fs_doc` de una tarea ajena: 403 `{"error":"sin_permiso"}` (no 404, para no confundir a la app).
- `fs_set` / `msg_agregar` sobre tarea ajena: 403; una tarea nueva solo se crea con `creada_por` = el usuario del token.
- `bandeja_*`: solo los mensajes del usuario del token (el jefe, todos).
- `send` (push a otra persona): solo si quien manda y quien recibe comparten esa tarea, o quien manda es el jefe; con
  límite de frecuencia por usuario.
- `fs_set` en `bitacora_personas`: cada quien solo su propio documento; el jefe, todos.

## (c) Rotar APP_TOKEN

Cuando (a) esté activo y probado: generar un APP_TOKEN nuevo, cambiarlo en el publicador (que lo inyecta en
`index.html` y `sw.js`) y en la Mac. El viejo deja de servir ese mismo día. Desde ahí APP_TOKEN es solo un filtro de
ruido, no una llave.

## (d) Cifrado en reposo en MySQL

- Campos: `msgs`, `contexto`, `evidencia`, `notas` de las tareas, y `datos_json` de usuarios.
- **AES-256-GCM** (PHP `openssl_encrypt($txt, 'aes-256-gcm', $llave, OPENSSL_RAW_DATA, $iv, $tag)`), IV aleatorio de
  12 bytes por valor; guardar `version|iv|tag|cifrado` en base64 para poder rotar la llave.
- La llave (32 bytes aleatorios) vive **fuera de la carpeta pública** y **fuera del repo** (variable de entorno o
  archivo con permisos 600 fuera del `public_html`). Nunca en el código, nunca en un respaldo junto con la base.
- Migración: leer → cifrar → escribir por lotes, con respaldo previo; el código de lectura acepta texto plano y
  cifrado mientras dura la migración.
- La búsqueda por texto de esos campos deja de poder hacerse en SQL; si hace falta, índice aparte sin el contenido.

## (e) Reglas de Firestore (mientras siga en uso)

Colecciones que la app todavía usa: `bitacora_personas`, `bitacora_bloqueados`, encargos, y las demás `bitacora_*`.

- Solo `request.auth != null` y `request.auth.token.email_verified == true` con correo autorizado (el de un usuario
  de Doit; lista en un documento de configuración o en custom claims).
- Cada quien lee y escribe **solo su documento** (`bitacora_personas/{clave}` cuyo `mail_trabajo`/`mail_personal`
  sea su correo); el jefe, todos.
- `bitacora_bloqueados`: lectura del propio correo (la app la consulta al entrar), escritura solo el jefe.
- Encargos: solo los que tienen al usuario como emisor o destinatario; el jefe, todos.
- Nada de `allow read, write: if true`.

## (f) Bitácora de accesos

Por cada llamada: fecha-hora, usuario (del token), correo, acción, id(s) de tarea, resultado (200/401/403),
IP y user-agent. En tabla propia, solo de agregar (sin UPDATE/DELETE desde la app), con retención de al menos 90 días.
Alerta al jefe si hay ráfagas de 401/403 de un mismo origen.

## (g) Prueba de aceptación

1. Con el ID token de **Josué**: `fs_lista` no trae **ninguna** tarea de Salvador en la que Josué no aparezca
   (duenio/creada_por/encargado/revisor/integrante/espera_a/suplente). Comparar contra la lista completa.
2. Con el token de Josué: `fs_doc` de una tarea solo de Salvador → 403 `sin_permiso`; `fs_set` sobre ella → 403 y
   la tarea no cambia.
3. Con `x-usuario: salvador` y el token de Josué → el servidor responde como Josué (ignora `x-usuario`).
4. Sin `Authorization`, con token alterado, con token de otro proyecto o con token vencido → **401 `{"error":"auth"}`**
   en todas las acciones, aunque traiga el APP_TOKEN correcto.
5. Con el token de Salvador: `fs_lista` trae todo.
6. En la app (build 317 o posterior): al recibir el 401, sale «Tu sesión venció, vuelve a entrar» y queda en el login.
7. En la base: un `msgs` leído directo de MySQL está cifrado; la app lo ve en claro.
8. La bitácora de accesos registra las pruebas 1–4.

> Este documento no contiene ni debe contener valores de llaves, tokens ni contraseñas.
