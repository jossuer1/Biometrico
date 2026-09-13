import { useState } from "react";
import { getSessionToken, processIdCheck } from "../api";
import { runIdentitySession } from "../facetec/browserAdapter";

export default function FaceTecScanner({ onComplete, onCancel }) {
  const [step, setStep] = useState(1); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const labels = ["Prueba de vida facial", "Cédula: frente", "Cédula: reverso", "Validando OCR y coincidencia"];
  async function start() {
    setBusy(true); setError("");
    try {
      const tokenResponse = await getSessionToken();
      const sessionToken = tokenResponse.sessionToken || tokenResponse.token;
      if (!sessionToken) throw new Error("FaceTec no devolvió un sessionToken.");
      const capture = await runIdentitySession({ sessionToken, onStep: setStep });
      setStep(4);
      const response = await processIdCheck(capture);
      onComplete({ ...response, captures: capture.previewImages || {} });
    } catch (e) { setError(e.message || "No se completó la verificación."); }
    finally { setBusy(false); }
  }
  return <main className="card"><p className="eyebrow">Proceso seguro</p><h1>Verifique su identidad</h1><ol className="steps">{labels.map((label, i) => <li className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""} key={label}>{label}</li>)}</ol><p>El orden es obligatorio: rostro, frente y reverso. Las capturas solo viven en memoria durante esta sesión.</p>{error && <p className="error">{error}</p>}<button disabled={busy} onClick={start}>{busy ? `Procesando: ${labels[step - 1]}` : "Comenzar con cámara"}</button><button className="secondary" disabled={busy} onClick={onCancel}>Cancelar</button></main>;
}
