import { Suspense } from "react";
import LoginPage from "@/components/LoginPage"; // move your component to a separate file

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
