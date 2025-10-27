// src/app/login/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear auth cookies as soon as we land on /login (this doubles as "signed out")
  useEffect(() => {
    function expireCookie(name: string) {
      // Kill cookie for this origin
      document.cookie = `${name}=; Path=/; Max-Age=0; Secure; SameSite=Lax`;
    }

    expireCookie("sb-access-token");
    expireCookie("sb-refresh-token");
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // this assumes you have a route at /api/auth/login
      // that validates creds, sets cookies, and redirects
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.redirected) {
        // If the server responded with a redirect (ex: to /protected),
        // just follow it.
        window.location.href = res.url;
        return;
      }

      if (!res.ok) {
        const bodyText = await res.text();
        setError(bodyText || "Login failed");
      } else {
        // fallback if no redirect header but success
        window.location.href = "/protected";
      }
    } catch (err: any) {
      console.error("login error", err);
      setError("Network or server error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-neutral-200 p-6 space-y-6">
        {/* Header / Branding */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-neutral-900">
            SoccerConnect Admin
          </h1>
          <p className="text-sm text-neutral-500">
            Sign in to continue
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-800"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="you@club.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-800"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <footer className="text-center text-[11px] text-neutral-400 leading-relaxed">
          <div>By signing in you agree to SoccerConnect Admin Terms.</div>
          <div className="text-neutral-300 select-none">
            &copy; {new Date().getFullYear()} SoccerConnect
          </div>
        </footer>
      </div>
    </main>
  );
}
