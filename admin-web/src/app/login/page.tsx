// src/app/login/page.tsx
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const user = await getCurrentUser();

  console.log("[LOGIN PAGE] user=", user?.email);

  // ✅ Already logged in? Go straight to /protected.
  if (user) {
    redirect("/protected");
  }

  // ❌ Not logged in? Show the login form.
  return (
    <main className="min-h-screen flex items-start justify-center bg-white text-gray-900 py-16">
      <div className="w-full max-w-md space-y-6">

        {/* Optional debug box. You can keep or remove. */}
        <div className="rounded border p-4 text-sm leading-relaxed text-yellow-700 bg-yellow-50 border-yellow-300">
          <strong>Debug:</strong> Supabase says you are NOT signed in.
          <br />
          You should sign in below.
        </div>

        <LoginClient />
      </div>
    </main>
  );
}
