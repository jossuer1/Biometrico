import { evaluateIdentityResult } from "../facetec/identityCheck";

export default function Results({ result, onClear }) {
  if (!result) {
    return (
      <main className="card">
        <h1>No hay resultado</h1>
        <p>No se encontró información de una verificación previa.</p>
        <button onClick={onClear}>Volver al inicio</button>
      </main>
    );
  }

  const { outcome, message, matchLevel } = evaluateIdentityResult(result);
  const titles = {
    match: "Identidad verificada",
    no_match: "No coincide con la cédula",
    no_liveness: "No se pudo confirmar que hay una persona real",
    error: "No se pudo verificar",
  };

  return (
    <main className="card">
      <p className="eyebrow">Resultado</p>
      <h1>{titles[outcome]}</h1>
      <p className={outcome === "match" ? "" : "error"}>{message}</p>
      {outcome === "no_match" && (
        <p>
          Esto puede significar que la persona frente a la cámara no es la
          misma que aparece en la cédula, o que la captura tuvo mala
          iluminación/calidad. Se recomienda repetir el intento antes de
          rechazar definitivamente.
        </p>
      )}
      {typeof matchLevel === "number" && (
        <p style={{ fontSize: 13, color: "#888" }}>matchLevel: {matchLevel}</p>
      )}

      <details style={{ textAlign: "left", marginTop: 12 }}>
        <summary style={{ cursor: "pointer", fontSize: 13, color: "#888" }}>Ver datos técnicos</summary>
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 8,
            maxHeight: 240,
            overflow: "auto",
            fontSize: 12,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>

      <button onClick={onClear}>Nueva verificación</button>
    </main>
  );
}
