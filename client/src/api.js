import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getSessionToken() {
  const { data } = await axios.get(`${API_URL}/api/session-token`);
  return data;
}

export async function processIdCheck(capture) {
  const { data } = await axios.post(`${API_URL}/api/process-id-check`, {
    xUserAgent: capture.xUserAgent,
    faceScan: capture.faceScan,
    idScan: capture.idScan,
    auditTrailImage: capture.auditTrailImage,
    idScanFrontImage: capture.idScanFrontImage,
    idScanBackImage: capture.idScanBackImage,
  });
  return data;
}
