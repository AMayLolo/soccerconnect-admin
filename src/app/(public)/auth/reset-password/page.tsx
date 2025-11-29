"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    const email = (e.target as any).email.value;

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setMessage(error ? error.message : "Check your email for reset instructions.");
  }

  return (
    <div className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-semibold mb-6">Reset Password</h1>

      <form onSubmit={handleReset} className="space-y-6">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border rounded-md px-3 py-2"
        />

        <button className="w-full bg-black text-white py-2 rounded-md">
          Send Reset Link
        </button>
      </form>

      {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}
    </div>
  );
}
