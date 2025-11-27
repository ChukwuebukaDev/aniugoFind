import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AniugoDefaultNavigationSystem from "../utilities/AniugoDefaultNavigationSystem.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <AniugoDefaultNavigationSystem />
  </StrictMode>
);
