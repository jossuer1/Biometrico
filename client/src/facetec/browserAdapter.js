/*
  Adaptador real para el FaceTec Browser SDK 10.1.17 (SOLO PRUEBA/PoC).

  Esta versión del SDK NO devuelve faceScan/idScan al navegador ni acepta
  un sessionToken previo. Funciona por relevo de "blobs" opacos:
  1) El SDK genera un requestBlob cifrado.
  2) Tu backend lo reenvía tal cual al servidor de FaceTec (aquí: el Testing
     API, válido solo para pruebas, no para producción).
  3) El servidor de FaceTec responde con un responseBlob, que se lo devuelves
     tal cual al SDK.
  4) Al terminar la sesión, el SDK solo te da un status (completada,
     cancelada, error de cámara, etc.). El resultado real de la
     verificación (match, liveness, OCR) vive en FaceTec Server, no aquí.

  Requiere que en index.html se cargue antes:
  <script src="/facetec/FaceTecSDK-browser-10.1.17/core-sdk/FaceTecSDK.js/FaceTecSDK.js"></script>

  Nota: todo lo que está en client/public/ es un archivo estático que Vite
  copia tal cual (no forma parte del grafo de módulos), así que no se puede
  hacer `import` de Config.js desde ahí -- por eso el DeviceKeyIdentifier se
  copia aquí como constante en vez de importarlo. No es secreto: viaja igual
  al navegador dentro del propio Config.js.
*/
import { relayFaceTecBlob } from "../api";

const DEVICE_KEY_IDENTIFIER = "dEHioZ0I0AgYkR31G08ToL2kdpN9t6wm";

let sdkInstance = null;
let initPromise = null;

function getSDK() {
  const sdk = window.FaceTecSDK;
  if (!sdk) throw new Error("FaceTecSDK.js no se cargó. Revisa el <script> en index.html.");
  return sdk;
}

function buildSessionRequestProcessor(onExit, onResult) {
  return {
    // El SDK llama esto cuando genera un blob que hay que mandar a FaceTec Server.
    onSessionRequest(requestBlob, sessionRequestCallback) {
      relayFaceTecBlob(requestBlob)
        .then((data) => {
          console.log("[FaceTec] respuesta:", Object.keys(data), data.result);
          if (data?.result) onResult?.(data.result);
          if (data?.idScanResultsSoFar) onResult?.(data.idScanResultsSoFar);
          sessionRequestCallback.processResponse(data.responseBlob);
        })
        .catch(() => sessionRequestCallback.abortOnCatastrophicError());
    },
    // Progreso de subida, útil para la barra de progreso propia del SDK.
    onUploadProgress(_progressEvent) {},
    // Se llama SIEMPRE al cerrar la sesión del SDK (éxito, cancelación o error).
    onFaceTecExit(faceTecSessionResult) {
      onExit?.(faceTecSessionResult);
    },
  };
}

function initSDK() {
  if (initPromise) return initPromise;
  const FaceTecSDK = getSDK();

  FaceTecSDK.setResourceDirectory("/facetec/FaceTecSDK-browser-10.1.17/core-sdk/FaceTecSDK.js/resources");
  FaceTecSDK.setImagesDirectory("/facetec/FaceTecSDK-browser-10.1.17/core-sdk/FaceTec_images");

  initPromise = new Promise((resolve, reject) => {
    // El SessionRequestProcessor usado solo para inicializar no dispara sesión real,
    // pero el SDK igual puede necesitar el mismo contrato de blobs al iniciar.
    const initProcessor = buildSessionRequestProcessor();
    FaceTecSDK.initializeWithSessionRequest(DEVICE_KEY_IDENTIFIER, initProcessor, {
      onSuccess: (instance) => {
        sdkInstance = instance;
        resolve(instance);
      },
      onError: (error) => reject(new Error(`No se pudo inicializar FaceTecSDK (código ${error}).`)),
    });
  });
  return initPromise;
}

export async function runIdentitySession({ onStep }) {
  const instance = sdkInstance || (await initSDK());

  return new Promise((resolve, reject) => {
    let merged = null;
    const all = [];
    const processor = buildSessionRequestProcessor(
      (faceTecSessionResult) => {
        const FaceTecSDK = getSDK();
        if (faceTecSessionResult.status === FaceTecSDK.FaceTecSessionStatus.SessionCompleted) {
          onStep?.(3);
          console.log("[FaceTec] results de la sesión:", all);
          resolve({ status: faceTecSessionResult.status, result: merged, all });
        } else {
          reject(Object.assign(
            new Error(`Sesión de FaceTec no completada (status ${faceTecSessionResult.status}).`),
            { status: faceTecSessionResult.status, result: merged, all }
          ));
        }
      },
      (result) => { all.push(result); merged = { ...merged, ...result }; }
    );
    onStep?.(1);
    instance.start3DLivenessThen3D2DPhotoIDMatch(processor);
  });
}
