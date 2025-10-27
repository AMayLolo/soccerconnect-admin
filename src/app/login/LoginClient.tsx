// src/app/login/LoginClient.tsx
"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { loginAction } from "./actions";

export default function LoginClient() {
  // form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state / errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // server action pending state
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    // read ?redirectTo=... from current URL
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirectTo") ?? "/protected";

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("redirectTo", redirectTo);

    startTransition(async () => {
      try {
        const result = await loginAction(formData);

        // On success, loginAction will redirect() server-side,
        // so execution won't continue here.
        // On failure, it returns { error: "..." }.
        if (result && "error" in result && result.error) {
          setErrorMsg(result.error);
        }
      } catch (err) {
        console.error("[LoginClient] Unexpected error:", err);
        setErrorMsg("Something went wrong logging you in.");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-white">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Enter your admin credentials.
        </p>

        {errorMsg && (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none ring-0 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-neutral-600">
          soccerconnect admin
        </p>
      </div>
    </div>
  );
}
