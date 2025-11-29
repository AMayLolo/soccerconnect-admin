"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [message, setMessage] = useState("");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const password = (e.target as any).password.value;

    const { error } = await supabase.auth.updateUser({ password });

    setMessage(error ? error.message : "Password updated successfully.");
  }

  return (
    <div className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-semibold mb-6">Update Password</h1>

      <form onSubmit={handleUpdate} className="space-y-6">
        <input
          name="password"
          type="password"
          required
          className="w-full border rounded-md px-3 py-2"
          placeholder="New password"
        />

        <button className="w-full bg-black text-white py-2 rounded-md">
          Update Password
        </button>
      </form>

      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
}
