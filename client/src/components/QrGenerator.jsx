export default function QrGenerator({ onStart }) {
  const scanUrl = `${window.location.origin}${window.location.pathname}#/scan`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    scanUrl
  )}`;

  return (
    <main className="card">
      <p className="eyebrow">Verificación de identidad</p>
      <h1>Escanee el código o continúe aquí</h1>
      <p>
        Si va a usar la cámara de su celular, escanee este QR desde otro
        dispositivo. Si ya está en el teléfono, use el botón de abajo.
      </p>
      <img
        src={qrImage}
        alt="Código QR para iniciar la verificación"
        width={220}
        height={220}
        style={{ margin: "16px auto", display: "block" }}
      />
      <button onClick={onStart}>Comenzar verificación aquí</button>
    </main>
  );
}
