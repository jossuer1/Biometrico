import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Relevo genérico de blobs FaceTec (PRUEBA/PoC: pasa por el Testing API de
// FaceTec vía tu backend). Se llama una vez por cada requestBlob que genera
// el SDK durante una sesión (puede ser más de una vez por sesión).
export async function relayFaceTecBlob(requestBlob) {
  const testingApiHeader = window.FaceTecSDK?.getTestingAPIHeader?.();
  const { data } = await axios.post(`${API_URL}/api/facetec/relay`, {
    requestBlob,
    testingApiHeader,
  });
  // El SDK solo necesita el responseBlob; "result" (si viene) trae datos
  // adicionales como officialIDPhotoImage en modos específicos.
  return data.responseBlob;
}
