import { useState } from "react";
import { runIdentitySession } from "../facetec/browserAdapter";

export default function FaceTecScanner({ onComplete, onCancel }) {
  const [step, setStep] = useState(1); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const labels = ["Prueba de vida facial", "Cédula: frente y reverso", "Sesión enviada a FaceTec"];
  async function start() {
    setBusy(true); setError("");
    try {
      await runIdentitySession({ onStep: setStep });
      // El resultado (match, liveness, OCR) vive en FaceTec Server; esta
      // versión de prueba solo confirma que la sesión del SDK se completó.
      onComplete({ status: "session_completed" });
    } catch (e) { setError(e.message || "No se completó la verificación."); }
    finally { setBusy(false); }
  }
  return <main className="card"><p className="eyebrow">Proceso seguro</p><h1>Verifique su identidad</h1><ol className="steps">{labels.map((label, i) => <li className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""} key={label}>{label}</li>)}</ol><p>El orden es obligatorio: rostro, frente y reverso.</p>{error && <p className="error">{error}</p>}<button disabled={busy} onClick={start}>{busy ? `Procesando: ${labels[step - 1]}` : "Comenzar con cámara"}</button><button className="secondary" disabled={busy} onClick={onCancel}>Cancelar</button></main>;
}
