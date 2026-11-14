// Dirección de la "Aplicación web" de Google Apps Script (termina en /exec).
// Mientras esté vacía: la invitación envía todo por WhatsApp y el panel no muestra respuestas.
window.CONFIG = {
  apiUrl: '',

  // Dirección pública de la invitación (para los enlaces personalizados del panel)
  web: 'https://jadeinkinvitacionesdigitales-source.github.io/xv-neizi/',

  // WhatsApp para confirmaciones y contacto (Panamá +507)
  whatsapp: '50764947381',

  // Fecha y hora del evento (hora de Panamá, UTC-5)
  fechaEvento: '2027-01-23T20:00:00-05:00',

  // Fecha límite para confirmar (déjala vacía para no mostrarla)
  confirmarAntesDe: '23 de diciembre de 2026',

  // Música: pon tu archivo en la carpeta musica/ con este nombre
  musica: 'musica/cancion.mp3'
};
