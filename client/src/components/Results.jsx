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

  const success = result.wasProcessed !== false && !result.error;

  return (
    <main className="card">
      <p className="eyebrow">Resultado</p>
      <h1>{success ? "Verificación completada" : "No se pudo verificar"}</h1>

      {result.captures?.faceScan && (
        <img
          src={`data:image/jpeg;base64,${result.captures.faceScan}`}
          alt="Captura del rostro"
          style={{ width: 120, borderRadius: 8, marginBottom: 12 }}
        />
      )}

      <pre
        style={{
          textAlign: "left",
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

      <button onClick={onClear}>Nueva verificación</button>
    </main>
  );
}
