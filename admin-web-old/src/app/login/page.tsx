import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const user = await getCurrentUser();

  // If you're already logged in, just go to dashboard.
  if (user) {
    redirect("/protected");
  }

  return (
    <main className="min-h-screen flex items-start justify-center bg-white text-gray-900 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded border p-4 text-sm leading-relaxed text-gray-700 bg-gray-50 border-gray-300">
          <strong>SoccerConnect Admin</strong>
          <div className="text-xs text-gray-500 mt-1">
            Sign in with your admin credentials.
          </div>
        </div>

        <LoginClient />
      </div>
    </main>
  );
}
