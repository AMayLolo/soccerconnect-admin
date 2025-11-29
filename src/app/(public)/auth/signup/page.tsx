"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signupAction } from "./action";

function SignupForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") || "";
  return (
    <div className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-semibold mb-6">Create an Account</h1>

      <form action={signupAction} className="space-y-6">
        {redirect && <input type="hidden" name="redirect" value={redirect} />}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <button className="w-full bg-black text-white py-2 rounded-md">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-20">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
