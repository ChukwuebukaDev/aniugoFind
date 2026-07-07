import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import MaintenancePage from "./FixPage.tsx";
const allowedCodes = [1990, 1996, 1865, 1864];
const question = prompt("Enter the code to access the application:");
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {allowedCodes.includes(Number(question)) ? <App /> : <MaintenancePage />}
  </StrictMode>,
);
