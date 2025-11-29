"use client";

import { useSearchParams } from "next/navigation";
import { useFormState } from "react-dom";
import { loginAction } from "./action";

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, { error: "" });
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-3xl font-semibold mb-6">Log In</h1>

      {state.error && <p className="text-red-600 mb-4">{state.error}</p>}

      <form action={formAction} className="space-y-6">
        {redirect && <input type="hidden" name="redirect" value={redirect} />}
        <input name="email" type="email" required className="w-full border px-3 py-2" />
        <input name="password" type="password" required className="w-full border px-3 py-2" />

        <button className="w-full bg-black text-white py-2 rounded-md">
          Sign In
        </button>
      </form>
    </div>
  );
}
