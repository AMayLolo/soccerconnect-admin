"use client";

import { useFormState } from "react-dom";
import { loginAction } from "./action";

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, { error: "" });

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-3xl font-semibold mb-6">Admin Login</h1>

      {state?.error && (
        <p className="text-red-600 mb-4">{state.error}</p>
      )}

      <form action={formAction} className="space-y-6">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border rounded-md px-3 py-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full border rounded-md px-3 py-2"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
