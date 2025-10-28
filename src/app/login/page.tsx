export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold text-primary mb-4">Login</h1>
      <form className="bg-white shadow-md rounded-lg p-6 w-80 space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-md px-3 py-2"
        />
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-accent"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
