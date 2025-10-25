import { getCurrentUser } from "@/utils/auth";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const user = await getCurrentUser();

  console.log("[LOGIN PAGE] user=", user?.email);

  return (
    <div className="max-w-md mx-auto pt-16 space-y-6">
      <div className="rounded border p-4 text-sm leading-relaxed">
        {user ? (
          <div className="text-green-700 bg-green-50 border border-green-300 rounded p-3">
            <strong>Debug:</strong> Supabase says you ARE signed in as{" "}
            <code>{user.email ?? "(no email)"}</code>.
            <br />
            We are NOT auto-redirecting you.
          </div>
        ) : (
          <div className="text-yellow-700 bg-yellow-50 border border-yellow-300 rounded p-3">
            <strong>Debug:</strong> Supabase says you are NOT signed in.
            <br />
            We are NOT auto-redirecting you.
          </div>
        )}
      </div>

      <LoginClient />
    </div>
  );
}
