import "dotenv/config";
import axios from "axios";
import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 5000);
// SOLO PRUEBA/PoC: el Testing API de FaceTec no debe usarse en producción.
// Ver: https://dev.facetec.com/security-best-practices
const facetecTestingApiUrl =
  process.env.FACETEC_TESTING_API_URL || "https://api.facetec.com/api/v4/biometrics/process-request";
const deviceKey = process.env.FACETEC_DEVICE_KEY;

if (!deviceKey) throw new Error("FACETEC_DEVICE_KEY no está configurada.");

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "12mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Único endpoint de relevo: recibe el requestBlob que genera el FaceTecSDK
// en el navegador, lo reenvía sin tocar al Testing API de FaceTec, y
// devuelve la respuesta (responseBlob + result si aplica) sin tocarla.
app.post("/api/facetec/relay", async (req, res) => {
  const { requestBlob, testingApiHeader } = req.body || {};
  if (!requestBlob || typeof requestBlob !== "string") {
    return res.status(400).json({ error: true, message: "Falta requestBlob generado por el FaceTec Browser SDK." });
  }
  if (!testingApiHeader || typeof testingApiHeader !== "string") {
    return res.status(400).json({ error: true, message: "Falta testingApiHeader (FaceTecSDK.getTestingAPIHeader())." });
  }
  try {
    const response = await axios.post(
      facetecTestingApiUrl,
      { requestBlob },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Device-Key": deviceKey,
          "X-Testing-API-Header": testingApiHeader,
        },
        timeout: 60_000,
      }
    );
    // No se registra el cuerpo: puede contener biometría y PII.
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 502;
    const body = error.response?.data;
    console.error("FaceTec Testing API request failed", { status, body: typeof body === "string" ? body : body?.message });
    res.status(status).json({
      error: true,
      message: body?.message || body?.errorMessage || "FaceTec Testing API no pudo procesar la solicitud.",
      details: body || null,
    });
  }
});

app.use((err, _req, res, _next) => res.status(400).json({ error: true, message: err.message || "JSON inválido." }));
app.listen(port, () => console.log(`FaceTec PoC relay listening on http://localhost:${port}`));
