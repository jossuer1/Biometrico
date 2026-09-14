// Debe llamarse de forma síncrona dentro de un manejador de click/tap real
// (no después de un await), porque los navegadores solo conceden fullscreen
// como respuesta directa a un gesto del usuario.
// Funciona en Chrome/Edge para Android. Safari en iOS lo ignora (no está
// permitido ahí por política de Apple), así que en iPhone la barra de
// Safari seguirá visible pase lo que pase: es una limitación del sistema,
// no algo que se pueda arreglar desde el código.
export function requestFullscreenBestEffort() {
  const el = document.documentElement;
  const request =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen;
  try {
    request?.call(el);
  } catch {
    // Silencioso a propósito: si el navegador lo rechaza, seguimos igual.
  }
}
