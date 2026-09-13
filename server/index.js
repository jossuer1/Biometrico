import "dotenv/config";
import axios from "axios";
import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 5000);
const facetecUrl = (process.env.FACETEC_SERVER_URL || "https://api.facetec.com/api/v4").replace(/\/$/, "");
const deviceKey = process.env.FACETEC_DEVICE_KEY;

if (!deviceKey) throw new Error("FACETEC_DEVICE_KEY no está configurada.");

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "12mb" }));

function faceTecError(error, res) {
  const status = error.response?.status || 502;
  const body = error.response?.data;
  console.error("FaceTec request failed", { status, body: typeof body === "string" ? body : body?.message });
  return res.status(status).json({
    error: true,
    message: body?.message || body?.errorMessage || "FaceTec no pudo procesar la solicitud.",
    details: body || null,
  });
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/session-token", async (_req, res) => {
  try {
    const response = await axios.get(`${facetecUrl}/session-token`, {
      headers: { "X-Device-Key": deviceKey, Accept: "application/json" },
      timeout: 15_000,
    });
    res.json(response.data);
  } catch (error) { faceTecError(error, res); }
});

app.post("/api/process-id-check", async (req, res) => {
  const { xUserAgent, ...payload } = req.body || {};
  if (!xUserAgent || typeof xUserAgent !== "string") {
    return res.status(400).json({ error: true, message: "Falta xUserAgent generado por FaceTec Browser SDK." });
  }
  // No se registra el payload: puede contener biometría y PII.
  try {
    const response = await axios.post(`${facetecUrl}/match-3d-2d-idcard`, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-Device-Key": deviceKey,
        "X-User-Agent": xUserAgent,
      },
      timeout: 60_000,
    });
    res.json(response.data);
  } catch (error) { faceTecError(error, res); }
});

app.use((err, _req, res, _next) => res.status(400).json({ error: true, message: err.message || "JSON inválido." }));
app.listen(port, () => console.log(`FaceTec PoC API listening on http://localhost:${port}`));
