"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { loginAction } from "./action";

function LoginForm() {
  const [state, formAction] = useFormState(loginAction, { error: "" });
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0d7a9b]/5 to-[#1c3f60]/5 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d7a9b] rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1c3f60] mb-2">Welcome Back</h1>
          <p className="text-gray-600">
            Sign in to your account to continue reviewing and exploring clubs
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {state.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            {redirect && <input type="hidden" name="redirect" value={redirect} />}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0d7a9b] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0d7a9b] focus:border-transparent"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#0d7a9b] hover:bg-[#0a5f7a] text-white font-semibold py-3 rounded-lg transition-colors shadow-md"
            >
              Sign In
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link 
                href={redirect ? `/auth/signup?redirect=${encodeURIComponent(redirect)}` : "/auth/signup"}
                className="text-[#0d7a9b] hover:text-[#0a5f7a] font-semibold"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you can write reviews, help families find clubs, and access exclusive insights.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-[#0d7a9b]/5 to-[#1c3f60]/5 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
