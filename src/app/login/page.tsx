// src/app/login/page.tsx
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  // ask the server "who is this?"
  const { user } = await getCurrentUser();

  // already logged in? go to dashboard
  if (user) {
    redirect("/protected");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6 border border-gray-200">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            SoccerConnect Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in with your admin credentials
          </p>
        </div>

        <LoginClient />
      </div>
    </main>
  );
}
