"use client";

import { useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function UpdatePasswordPage() {
  const supabase = createClientComponentClient();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password successfully updated! You can now log in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleUpdate}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Update Password
        </h1>
        <p className="text-center text-gray-500 text-sm mb-2">
          Enter your new password below.
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
          type="password"
          placeholder="New Password"
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Update Password
        </button>

        <div className="text-center text-sm mt-2">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
