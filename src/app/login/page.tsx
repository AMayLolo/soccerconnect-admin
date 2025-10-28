"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Autofocus the email input
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Show message if redirected with ?expired=1
  useEffect(() => {
    if (expired) {
      setError("Your session expired. Please sign in again.");
    }
  }, [expired]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Slight delay to allow Supabase cookies to sync
    setTimeout(() => {
      window.location.href = "/protected";
    }, 300);
  };

  const handleForgotPassword = async () => {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset email sent! Check your inbox.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900">
          SoccerConnect Admin
        </h1>
        <p className="text-center text-gray-500 text-sm mb-2">
          Sign in to access your dashboard
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
          ref={emailRef}
          type="email"
          placeholder="Email"
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="w-full text-sm text-blue-600 hover:text-blue-800 mt-2 underline"
        >
          Forgot password?
        </button>
      </form>
    </div>
  );
}
