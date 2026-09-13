# Invitación de boda

Página estática que muestra una invitación personalizada por token y guarda la
confirmación en una hoja de Google.

- Front: este repo, servido por GitHub Pages.
- Backend: proyecto de Google Apps Script publicado como aplicación web.
- Datos: hoja de cálculo de Google, pestaña `Invitados`
  (`token`, `nombre`, `asiste`, `fecha_respuesta`).

## Despliegue

1. Push a `main`.
2. Settings > Pages > Source: *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
3. La URL sale en esa misma pantalla al cabo de un minuto.

Enlace de invitado:

```
https://USUARIO.github.io/REPO/?i=TOKEN
```

La barra antes del `?` es obligatoria en repos de proyecto.

## Configuración

La constante `API` al principio del `<script>` de `index.html` apunta a la URL
`/exec` del Apps Script. Al cambiar el backend hay que **crear una nueva
implementación** (o subir versión en la existente); guardar el `.gs` no basta.

## Secciones

La invitación se pinta a partir de la lista `SECCIONES`, al principio del
`<script>` de `index.html`. Cada entrada tiene un `tipo` que decide qué se
dibuja dentro:

| `tipo` | Qué pinta |
| --- | --- |
| `wip` | El texto de `texto`, con el sello *En preparación* |
| `cuenta` | La cuenta atrás, que corre contra `BODA.iso` |
| `rsvp` | Los botones de sí / no |
| `alergenos` | Los chips, plegados hasta que alguien dice que sí |
| `cierre` | El mensaje libre y el botón de enviar (sin título) |

Orden actual: cuenta atrás, save the date, dedicatoria, confirmación de
asistencia, alérgenos, playlist, transporte, alojamiento, sitio web.

Alérgenos va pegado a la confirmación, y no en el orden en que se pidió, porque
comparte el botón de enviar con ella: si se aleja, hay que rellenarlo y volver a
subir para mandar la respuesta.

Para rellenar una sección: cámbiale el `tipo`, quita su `texto` y añade la rama
que toque en `secciones()`. Reordenar es mover su entrada de sitio.

## Notas

- Al abrir, un sobre cerrado tapa la página hasta que el invitado toca. Lleva su
  nombre escrito en cuanto responde el backend. La invitación se pinta detrás
  mientras tanto; su animación de entrada espera a que el sobre se aparte.
  Con `prefers-reduced-motion` el sobre desaparece al primer toque, sin animación.
- El token va en el parámetro `i` y es la única credencial. Nada sensible en esta página.
- `robots.txt` y el `<meta robots>` evitan que los enlaces acaben indexados.
- El POST se manda con `Content-Type: text/plain` a propósito: `application/json`
  dispara el preflight CORS, que Apps Script no responde.