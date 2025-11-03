// src/app/login/LoginClient.tsx
"use client";

import LogoImg from "@/components/LogoImg";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import { loginAction } from "./actions";

export default function LoginClient() {
  const router = useRouter();
  // form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state / errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // server action pending state
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const handlePasswordRecovery = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const hashParams = new URLSearchParams(
        window.location.hash.startsWith("#") ? window.location.hash.slice(1) : ""
      );
      const searchParams = new URLSearchParams(window.location.search);
      const recoveryType = hashParams.get("type") ?? searchParams.get("type");

      if (recoveryType !== "recovery") {
        return;
      }

      try {
        if (searchParams.has("code")) {
          const code = searchParams.get("code");
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
          }
        } else if (window.location.hash.length > 1) {
          const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) throw error;
        }

        router.replace("/update-password");
      } catch (err) {
        console.error("[LoginClient] Failed to process password recovery tokens", err);
        setErrorMsg("Password reset link is invalid or expired.");
      }
    };

    handlePasswordRecovery();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    // read ?redirectTo=... from current URL
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirectTo");

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    if (redirectTo) {
      formData.set("redirectTo", redirectTo);
    }

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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-900 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-2xl">
        <div className="flex justify-center">
          <LogoImg className="h-16" />
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-neutral-600">
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign Up
          </Link>
          <Link href="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
            Reset Password
          </Link>
        </div>
      </div>
    </div>
  );
}
