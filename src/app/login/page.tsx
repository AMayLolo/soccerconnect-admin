import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-6">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
