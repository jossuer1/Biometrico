import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Relevo genérico de blobs FaceTec (PRUEBA/PoC: pasa por el Testing API de
// FaceTec vía tu backend). Se llama una vez por cada requestBlob que genera
// el SDK durante una sesión (puede ser más de una vez por sesión).
// Devuelve la respuesta completa: { responseBlob, result }.
// - responseBlob: se lo pasas de vuelta al SDK (sessionRequestCallback.processResponse).
// - result: trae matchLevel, livenessProven, documentData, success, etc.
//   Solo el ÚLTIMO "result" de la sesión importa para tomar la decisión final.
export async function relayFaceTecBlob(requestBlob) {
  const testingApiHeader = window.FaceTecSDK?.getTestingAPIHeader?.();
  const { data } = await axios.post(`${API_URL}/api/facetec/relay`, {
    requestBlob,
    testingApiHeader,
  });
  return data;
}
