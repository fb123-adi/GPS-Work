import React from "react";
import ReactDOM from "react-dom/client";
// Self-hosted (SIL OFL 1.1) so visitors' browsers never contact a third-party font service.
import "@fontsource-variable/inter";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
