const SHEET_ID = '1CWyE4-3iV2gzqoiOMJK4cf291ZrbVU8iNR_fGE6i6cY';
const HOJA = 'InvitacionesWeb';

/**
 * Boda — backend sobre Google Sheets.
 *
 * Pestaña "Invitados", cabeceras en la fila 1:
 *   A: token   B: nombre   C: asiste   D: fecha_respuesta   E: alergenos   F: nota
 *
 * Publicar: Implementar > Nueva implementación > Aplicación web
 *   Ejecutar como: Yo
 *   Quién tiene acceso: Cualquier usuario
 */

const COL = { token: 1, nombre: 2, asiste: 3, fecha: 4, alergenos: 5, nota: 6 };

function hoja_() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(HOJA);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Devuelve el número de fila del token, o null. */
function buscarFila_(token) {
  const h = hoja_();
  const ultima = h.getLastRow();
  if (ultima < 2) return null;

  const tokens = h.getRange(2, COL.token, ultima - 1, 1).getValues();
  for (let i = 0; i < tokens.length; i++) {
    if (String(tokens[i][0]).trim() === token) return i + 2;
  }
  return null;
}

/** GET ?token=XXXX -> { ok, nombre, asiste, alergenos, nota } */
function doGet(e) {
  const token = String((e.parameter && e.parameter.token) || '').trim();
  if (!token) return json_({ ok: false, error: 'sin_token' });

  const fila = buscarFila_(token);
  if (!fila) return json_({ ok: false, error: 'no_encontrado' });

  const f = hoja_().getRange(fila, COL.nombre, 1, 5).getValues()[0];
  // f = [nombre, asiste, fecha, alergenos, nota]
  return json_({
    ok: true,
    nombre: f[0],
    asiste: f[1] || null,
    alergenos: f[3] || '',
    nota: f[4] || ''
  });
}

/**
 * POST con cuerpo JSON (enviado como text/plain para evitar el preflight CORS):
 *   { "token": "XXXX", "asiste": true, "alergenos": "Gluten, Marisco", "nota": "…" }
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: 'ocupado' });
  }

  try {
    const datos = JSON.parse(e.postData.contents);
    const token = String(datos.token || '').trim();

    const fila = buscarFila_(token);
    if (!fila) return json_({ ok: false, error: 'no_encontrado' });

    const asiste = datos.asiste === true ? 'SI' : 'NO';
    const h = hoja_();

    // Una sola escritura de C a F: menos llamadas, menos riesgo de fila a medias.
    h.getRange(fila, COL.asiste, 1, 4).setValues([[
      asiste,
      new Date(),
      String(datos.alergenos || '').slice(0, 500),
      String(datos.nota || '').slice(0, 1000)
    ]]);

    return json_({ ok: true, asiste: asiste });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Rellena la columna token en las filas que tengan nombre y no tengan token.
 * Ejecutar a mano desde el editor cada vez que añadas invitados.
 */
function generarTokens() {
  // Sin caracteres ambiguos (0/O, 1/I/l) por si alguien lo teclea a mano.
  const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';
  const LONGITUD = 8;

  const h = hoja_();
  const ultima = h.getLastRow();
  if (ultima < 2) return;

  const rango = h.getRange(2, COL.token, ultima - 1, 2);
  const valores = rango.getValues(); // [token, nombre]

  const usados = {};
  valores.forEach(function (f) {
    if (f[0]) usados[String(f[0]).trim()] = true;
  });

  let nuevos = 0;
  for (let i = 0; i < valores.length; i++) {
    const tieneNombre = String(valores[i][1]).trim() !== '';
    const tieneToken = String(valores[i][0]).trim() !== '';
    if (!tieneNombre || tieneToken) continue;

    let t;
    do {
      t = '';
      for (let j = 0; j < LONGITUD; j++) {
        t += ALFABETO.charAt(Math.floor(Math.random() * ALFABETO.length));
      }
    } while (usados[t]);

    usados[t] = true;
    valores[i][0] = t;
    nuevos++;
  }

  rango.setValues(valores);
  Logger.log(nuevos + ' tokens generados');
}

/** Comprobación rápida del vínculo con la hoja. */
function test() {
  const h = hoja_();
  Logger.log(h ? 'OK, ' + h.getLastRow() + ' filas' : 'NULL — revisa el ID o el nombre de la pestaña');
}