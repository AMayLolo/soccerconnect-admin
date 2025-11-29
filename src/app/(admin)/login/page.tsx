import { loginAction } from "./action";

export default function AdminLoginPage() {
  return (
    <div className="max-w-md mx-auto py-20">
      <h1 className="text-3xl font-semibold mb-6">Admin Login</h1>

      <form action={loginAction} className="space-y-6">
        <input name="email" type="email" placeholder="Email" className="w-full border px-3 py-2 rounded-md" />
        <input name="password" type="password" placeholder="Password" className="w-full border px-3 py-2 rounded-md" />

        <button className="w-full bg-black text-white py-2 rounded-md">Login</button>
      </form>
    </div>
  );
}
