import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import App from "./App";
export default function Home() {
  return (
    <div className="flex justify-center items-center h-full">
      <SignedOut>
        <SignIn />
      </SignedOut>

      <SignedIn>
        <App />
      </SignedIn>
    </div>
  );
}