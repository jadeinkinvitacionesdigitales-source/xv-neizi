/**
 * XV Neizi — guarda confirmaciones, playlist, mensajes e invitaciones en esta Hoja de cálculo.
 *
 * Cómo instalarlo (una sola vez):
 * 1. Crea una Hoja de cálculo nueva en Google Drive (ej. "XV Neizi — Respuestas").
 * 2. Menú Extensiones → Apps Script. Borra lo que haya y pega TODO este archivo.
 * 3. Cambia CLAVE (abajo) por la clave que usará la familia para entrar al panel.
 * 4. Guardar → Implementar → Nueva implementación → tipo "Aplicación web".
 *      Ejecutar como: Yo      ·      Quién tiene acceso: Cualquier usuario
 * 5. Autoriza los permisos y copia la URL que termina en /exec.
 *    Esa URL va en config.js (apiUrl).
 *
 * Si luego cambias este código: Implementar → Gestionar implementaciones → editar (lápiz)
 * → Versión: "Nueva versión" → Implementar. Así la URL /exec no cambia.
 */

const CLAVE = 'CAMBIA-ESTA-CLAVE';

const HOJAS = {
  confirmaciones: { nombre: 'Confirmaciones', campos: ['fecha', 'nombre', 'asistira', 'personas', 'puestos', 'invitacion'],
                    encabezados: ['Fecha', 'Nombre', 'Asistirá', 'Personas', 'Puestos reservados', 'Invitación'] },
  playlist:       { nombre: 'Playlist', campos: ['fecha', 'cancion', 'nombre'],
                    encabezados: ['Fecha', 'Canción', 'Sugerida por'] },
  mensajes:       { nombre: 'Mensajes', campos: ['fecha', 'nombre', 'mensaje'],
                    encabezados: ['Fecha', 'Nombre', 'Mensaje'] },
  invitaciones:   { nombre: 'Invitaciones', campos: ['nombre', 'puestos', 'creada'],
                    encabezados: ['Nombre', 'Puestos', 'Creada'] }
};

function hoja_(clave) {
  const def = HOJAS[clave];
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let h = libro.getSheetByName(def.nombre);
  if (!h) {
    h = libro.insertSheet(def.nombre);
    h.appendRow(def.encabezados);
    h.getRange(1, 1, 1, def.encabezados.length).setFontWeight('bold');
    h.setFrozenRows(1);
  }
  return h;
}

// Texto limpio: corto y sin fórmulas
function txt_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
function num_(v, max) {
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : Math.max(0, Math.min(max || 50, n));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    switch (p.tipo) {
      case 'rsvp':
        hoja_('confirmaciones').appendRow([
          new Date(), txt_(p.nombre, 80), p.asistira === 'si' ? 'Sí' : 'No',
          p.asistira === 'si' ? num_(p.personas, 20) : 0, num_(p.puestos, 20) || '', txt_(p.invitacion, 80)
        ]);
        break;
      case 'cancion':
        hoja_('playlist').appendRow([new Date(), txt_(p.cancion, 120), txt_(p.nombre, 60)]);
        break;
      case 'mensaje':
        hoja_('mensajes').appendRow([new Date(), txt_(p.nombre, 60), txt_(p.mensaje, 600)]);
        break;
      case 'invitacion':
      case 'quitar': {
        if (p.clave !== CLAVE) return json_({ ok: false });
        const h = hoja_('invitaciones');
        const nombre = txt_(p.nombre, 80);
        const datos = h.getDataRange().getValues();
        let fila = -1;
        for (let i = 1; i < datos.length; i++) {
          if (String(datos[i][0]).trim().toLowerCase() === nombre.toLowerCase()) { fila = i + 1; break; }
        }
        if (p.tipo === 'quitar') { if (fila > 0) h.deleteRow(fila); }
        else if (fila > 0) h.getRange(fila, 2).setValue(num_(p.puestos, 20));
        else h.appendRow([nombre, num_(p.puestos, 20), new Date()]);
        break;
      }
      default:
        return json_({ ok: false });
    }
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function filas_(clave) {
  const def = HOJAS[clave];
  const valores = hoja_(clave).getDataRange().getValues().slice(1);
  return valores.map(r => {
    const o = {};
    def.campos.forEach((c, i) => {
      const v = r[i];
      o[c] = v instanceof Date ? v.toISOString() : v;
    });
    return o;
  });
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.clave !== CLAVE) return json_({ ok: false });
  return json_({
    ok: true,
    confirmaciones: filas_('confirmaciones'),
    playlist: filas_('playlist'),
    mensajes: filas_('mensajes'),
    invitaciones: filas_('invitaciones')
  });
}
