import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import MaintenancePage from "./FixPage.tsx";

// // Lagos timezone = UTC+1
// const maintenanceStartDate = new Date("2026-05-21T00:00:00+01:00");

// const isMaintenanceTime = Date.now() >= maintenanceStartDate.getTime();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
<App/>
  </StrictMode>,
);
// {isMaintenanceTime ? <MaintenancePage /> : <App />}
