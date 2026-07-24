import {
  SignOutButton,
  SignedIn,
  UserButton,
} from "@clerk/clerk-react";

export default function SignOut() {
  return (
   <div className="z-6000">
     <SignedIn>
      <UserButton />
    </SignedIn>
   </div>
  );
}