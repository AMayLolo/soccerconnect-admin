import { getCurrentUser } from "@/utils/auth";

export default async function AdminHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex items-center justify-end border-b border-zinc-200 bg-white px-6 py-3">
      <div className="text-right text-sm leading-tight">
        <div className="font-medium text-zinc-900">
          {user?.email ?? "—"}
        </div>
        <div className="text-zinc-500 text-xs">admin</div>
        <button className="text-red-600 text-xs font-medium hover:underline mt-1">
          Sign out
        </button>
      </div>
    </header>
  );
}
