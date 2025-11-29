import { signupAction } from "./action";

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-semibold mb-6">Create an Account</h1>

      <form action={signupAction} className="space-y-6">
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
