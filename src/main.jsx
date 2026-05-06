import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import MaintenancePage from "./FixPage.tsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MaintenancePage />
  </StrictMode>,
);
