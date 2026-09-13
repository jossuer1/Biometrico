/*
  Adaptador aislado para el Browser SDK privado de FaceTec.
  Copie FaceTecSDK.js y sus carpetas resources/ e images/ desde el ZIP oficial a
  client/public/facetec/; después implemente la llamada exacta de su versión en
  createFaceTecIntegration(). No use navigator.userAgent: el valor aceptado por
  FaceTec es el X-User-Agent que genera su SDK.
*/
function integration() { return window.createFaceTecIntegration?.(); }

export async function runIdentitySession({ sessionToken, onStep }) {
  const sdk = integration();
  if (!sdk) throw new Error("FaceTec Browser SDK no está instalado. Siga client/public/facetec/README.md.");
  // La operación oficial compuesta impone: liveness 3D -> ID front -> ID back.
  // El wrapper debe mostrar cada UI y resolver únicamente tras capturar las tres partes.
  const result = await sdk.start3DLivenessThen3D2DPhotoIDMatch({
    sessionToken,
    onLivenessComplete: () => onStep(2),
    onFrontIdComplete: () => onStep(3),
  });
  if (!result?.xUserAgent || !result?.faceScan || !result?.idScan) throw new Error("El Browser SDK devolvió una sesión incompleta.");
  return result;
}
