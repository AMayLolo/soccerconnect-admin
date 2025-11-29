import { loginAction } from "./action";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Login</h1>

      <form action={loginAction} className="space-y-4 w-full max-w-sm">

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="border w-full p-2 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="border w-full p-2 rounded"
        />

        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>

      </form>
    </div>
  );
}
