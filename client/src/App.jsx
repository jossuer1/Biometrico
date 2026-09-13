import { useState } from "react";
import QrGenerator from "./components/QrGenerator";
import FaceTecScanner from "./components/FaceTecScanner";
import Results from "./components/Results";

export default function App() {
  const [screen, setScreen] = useState(location.hash === "#/scan" ? "scan" : "home");
  const [result, setResult] = useState(null);
  const clear = () => { setResult(null); location.hash = ""; setScreen("home"); };
  if (screen === "home") return <QrGenerator onStart={() => { location.hash = "/scan"; setScreen("scan"); }} />;
  if (screen === "scan") return <FaceTecScanner onComplete={(data) => { setResult(data); setScreen("results"); }} onCancel={clear} />;
  return <Results result={result} onClear={clear} />;
}
