import { LogoutButton } from "@/components/LogoutButton";
import { getCurrentUser } from "@/utils/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Dashboard",
  description: "SoccerConnect Admin Panel",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Navbar */}
      <header className="flex justify-between items-center p-4 border-b bg-white shadow-sm">
        <Link href="/protected" className="text-xl font-semibold">
          SoccerConnect Admin
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
