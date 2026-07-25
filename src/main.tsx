import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider} from "@clerk/clerk-react";
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import "./index.css";
import Home from "./Clerk.tsx";
import App from "./App.tsx";
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
       <SignedOut>
        <SignIn />
      </SignedOut>

      <SignedIn>
        <App />
      </SignedIn>
    </ClerkProvider>
  </StrictMode>
);
