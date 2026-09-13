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

## Secciones e índice lateral

La invitación es una sola página partida en `<section class="seccion" id="...">`.
El índice se genera desde la constante `SECCIONES` del `<script>`: cada entrada
es `{ id, titulo }` y se descarta sola si ese `id` no existe en la página.

Para añadir una sección: crea el `<section>` dentro de `pintar()` y añade su
entrada a `SECCIONES` en el mismo orden en que aparece.

Orden actual: inicio, fotos, el día, cuenta atrás, save the date, dedicatoria,
confirmar, playlist, transporte, alojamiento, sitio web.

### Secciones en obras

Las que todavía no tienen contenido viven en la constante `EN_OBRAS`
(`{ id, titulo, texto }`) y las pinta `seccionEnObras(id)`: título, el sello
*En preparación* y el texto provisional. Siguen apareciendo en el índice como
cualquier otra.

Para rellenar una: borra su entrada de `EN_OBRAS` y escribe su `<section>` a
mano en `pintar()`, en el mismo sitio donde estaba la llamada. Si se te olvida
lo segundo, la sección desaparece de la página y el índice descarta su entrada
él solo; no se rompe nada.

Los alérgenos no son una sección aparte: van dentro de *Confirmar*, plegados
hasta que alguien dice que sí, porque comparten el botón de enviar con ella.

En pantallas de 62rem o más el índice es un raíl fijo a la izquierda del texto;
por debajo es un panel que se abre con el botón de la esquina superior. La
sección activa se marca con `aria-current`, midiendo las secciones en cada
`scroll`: manda la última cuyo borde superior haya pasado el 42% de la pantalla.

## Fotos

La sección *Fotos* la pinta `seccionFotos()` a partir de la constante `FOTOS`
del `<script>` de `index.html`. Con la lista vacía no hay sección y el índice
descarta su entrada él solo, igual que con la cuenta atrás.

Los archivos van en `img/`, en `.webp`:

- Nombres en minúscula, sin espacios ni acentos: acaban en una URL.
- Ruta relativa (`img/foo.webp`). La absoluta da 404 en repos de proyecto,
  igual que la barra antes del `?`.
- 1200 px de ancho sobran: la columna mide 432 px como mucho, 864 px en
  pantallas 2x. Menos de 200 KB por foto; los invitados la abren con datos.
- `ancho` y `alto` son los píxeles reales del archivo. Sin ellos la página
  da saltos según van cargando.
- `pie` es opcional; si está, la foto se envuelve en un `<figure>`.

La primera foto se pide en cuanto se pinta la página y las demás esperan a que
el invitado baje hasta ellas. Descomentando el `<link rel="preload">` del
`<head>` con la ruta de la primera, esa empieza a bajar sin esperar al backend.

Convertir y quitar EXIF (las fotos de móvil llevan las coordenadas GPS de
casa) de una tacada, con ImageMagick:

```
magick mogrify -path img -resize 1200x1200\> -quality 75 -strip -format webp originales/*.jpg
```

El `<meta robots>` mantiene la página fuera de los buscadores, pero
cualquiera con la URL puede descargar las fotos directamente.

## Notas

- Al abrir, un sobre cerrado tapa la página hasta que el invitado toca. Lleva su
  nombre escrito en cuanto responde el backend. La invitación se pinta detrás
  mientras tanto; su animación de entrada espera a que el sobre se aparte.
  Con `prefers-reduced-motion` el sobre desaparece al primer toque, sin animación.
- El token va en el parámetro `i` y es la única credencial. Nada sensible en esta página.
- `robots.txt` y el `<meta robots>` evitan que los enlaces acaben indexados.
- El POST se manda con `Content-Type: text/plain` a propósito: `application/json`
  dispara el preflight CORS, que Apps Script no responde.
