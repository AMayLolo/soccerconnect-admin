// src/app/protected/layout.tsx
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "SoccerConnect Admin",
  description: "Moderation and club management dashboard",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // 🚫 Redirect unauthenticated users
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">
          SoccerConnect Admin
        </h1>
        <div className="space-x-4 text-sm text-gray-600">
          <Link href="/protected">Dashboard</Link>
          <Link href="/protected/flagged">Flagged Reports</Link>
          <Link href="/protected/reports">Reports</Link>
          <Link href="/signout" className="text-red-500">
            Sign Out
          </Link>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
