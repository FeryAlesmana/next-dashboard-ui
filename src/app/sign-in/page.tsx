import { Suspense } from "react";
import LoginPage from "@/components/LoginPage"; // move your component to a separate file
import LoadingScreen from "@/components/LoadingScreen";

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPage />
    </Suspense>
  );
}
