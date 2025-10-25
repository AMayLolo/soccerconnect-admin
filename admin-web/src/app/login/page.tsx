// src/app/login/page.tsx
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  // ❗ We are intentionally NOT calling getCurrentUser() here
  //     and NOT redirecting to /protected if already signed in.
  //     Reason: avoiding redirect ping-pong between /login and /protected
  //     if Supabase cookie isn't consistent across both requests yet.

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
