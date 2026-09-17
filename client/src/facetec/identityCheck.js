// Verificado empíricamente con matchLevel:7 sobre un match genuino (sep 2026).
// Confirma en dev.facetec.com > API Reference Guide > Match Level el valor
// exacto recomendado para 3D:2D Photo ID Match en tu cuenta/versión.
export const MIN_MATCH_LEVEL = 7;

export function evaluateIdentityResult(result) {
  if (!result) {
    return { outcome: "error", message: "No se recibió resultado de FaceTec." };
  }
  if (result.livenessProven === false) {
    return { outcome: "no_liveness", message: "No se pudo confirmar que hay una persona real frente a la cámara." };
  }
  if (result.matchLevel == null) {
    return {
      outcome: "indeterminado",
      message: "FaceTec no devolvió un nivel de coincidencia. No se puede afirmar ni negar que sea la misma persona.",
    };
  }
  const matchLevel = Number(result.matchLevel);
  if (matchLevel < MIN_MATCH_LEVEL) {
    return { outcome: "no_match", message: "El rostro capturado no coincide con la foto de la cédula.", matchLevel };
  }
  return { outcome: "match", message: "El rostro coincide con la foto de la cédula.", matchLevel };
}