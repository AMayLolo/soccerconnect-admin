"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMemo, useState } from "react";

export default function ResetPasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = useMemo(() => {
    const envUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

    if (envUrl) {
      return `${envUrl.replace(/\/$/, "")}/update-password`;
    }

    if (typeof window !== "undefined") {
      return `${window.location.origin}/update-password`;
    }

    return undefined;
  }, []);

  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!email.trim()) {
      setError("Please enter the email associated with your account.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setError(error.message ?? "Unable to send reset instructions right now.");
      return;
    }

    setMessage("Check your inbox for a password reset link.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleResetRequest}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Reset Password
        </h1>
        <p className="text-center text-gray-500 text-sm mb-2">
          Enter your email and we'll send password reset instructions.
        </p>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">
            {message}
          </div>
        )}

        <input
          type="email"
          placeholder="you@example.com"
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
