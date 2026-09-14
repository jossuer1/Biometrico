// Umbral de coincidencia rostro-vs-cédula. FaceTec usa 15 como referencia
// recomendada en otras llamadas (3D:3D Re-Verificación, búsqueda 1:N);
// para 3D:2D Photo ID Matching específicamente, confirma en tu cuenta de
// dev.facetec.com (API Reference Guide / Match Level) si recomiendan otro
// valor para tu caso de uso, y ajusta esta constante según tus pruebas.
export const MIN_MATCH_LEVEL = 15;

// Interpreta el "result" que devuelve FaceTec Server (vía tu backend) al
// finalizar la sesión de Photo ID Match.
export function evaluateIdentityResult(result) {
  if (!result) {
    return { outcome: "error", message: "No se recibió resultado de FaceTec." };
  }
  if (result.livenessProven === false) {
    return { outcome: "no_liveness", message: "No se pudo confirmar que hay una persona real frente a la cámara." };
  }
  const matchLevel = Number(result.matchLevel ?? 0);
  if (matchLevel < MIN_MATCH_LEVEL) {
    return {
      outcome: "no_match",
      message: "El rostro capturado no coincide con la foto de la cédula.",
      matchLevel,
    };
  }
  return { outcome: "match", message: "El rostro coincide con la foto de la cédula.", matchLevel };
}
