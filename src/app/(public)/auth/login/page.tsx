import { loginAction } from "./action";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessage = searchParams?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white p-8 border rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
            {errorMessage}
          </div>
        )}

        <form action={loginAction} className="space-y-4 w-full">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              required
              className="border w-full p-2 rounded"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              className="border w-full p-2 rounded"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded hover:opacity-90"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-black underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
