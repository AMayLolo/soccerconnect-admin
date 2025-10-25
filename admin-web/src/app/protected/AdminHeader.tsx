// src/app/protected/AdminHeader.tsx
import { getCurrentUser } from "@/utils/auth";

export default async function AdminHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex items-start justify-end border-b border-zinc-300 bg-white px-4 py-3 text-xs text-zinc-700">
      <div className="text-right leading-tight">
        <div className="font-medium text-zinc-900 text-sm">
          {user?.email ?? "—"}
        </div>
        <div className="text-zinc-500">admin</div>
        <button
          // TODO: hook this up to sign-out
          className="text-red-600 font-medium hover:underline"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
