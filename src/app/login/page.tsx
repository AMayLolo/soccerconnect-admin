// src/app/login/page.tsx
"use client";

import { useEffect } from "react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  // Clear auth cookies as soon as we land on /login (so "Sign Out" feels real)
  useEffect(() => {
    function expireCookie(name: string) {
      document.cookie = `${name}=; Path=/; Max-Age=0; Secure; SameSite=Lax`;
    }

    expireCookie("sb-access-token");
    expireCookie("sb-refresh-token");
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-neutral-200 p-6 space-y-6">
        {/* Header / Branding */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-neutral-900">
            SoccerConnect Admin
          </h1>
          <p className="text-sm text-neutral-500">Sign in to continue</p>
        </div>

        {/* Normal HTML form POST to our new /api/auth/login route */}
        <form
          method="POST"
          action="/api/auth/login"
          className="space-y-4"
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-800"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="you@club.org"
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
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow hover:bg-neutral-800"
          >
            Sign in
          </button>
        </form>

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
