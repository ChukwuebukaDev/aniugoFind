import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import AniugoDefaultNavigationSystem from "../utilities/AniugoDefaultNavigationSystem.js";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <AniugoDefaultNavigationSystem />
  </StrictMode>
);
