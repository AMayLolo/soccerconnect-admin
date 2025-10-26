// src/app/protected/layout.tsx
import { getCurrentUser } from "@/utils/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ask server who this is
  const user = await getCurrentUser();

  // if no valid session, go to /login (with ?redirectTo=/protected)
  if (!user) {
    redirect("/login?redirectTo=/protected");
  }

  // if we DO have a user, render the real admin chrome
  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-900 p-4">
      <header className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <div className="font-semibold text-lg">SoccerConnect Admin</div>
          <div className="text-xs text-gray-500">
            Logged in as{" "}
            <span className="font-mono">{user.email ?? user.id}</span>
          </div>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/protected" className="underline">
            Dashboard
          </Link>
          <Link href="/protected/clubs" className="underline">
            Clubs
          </Link>
          <Link href="/protected/flagged" className="underline">
            Flagged
          </Link>
          <Link href="/api/auth/signout" className="underline text-red-600">
            Sign out
          </Link>
        </nav>
      </header>

      <section className="flex-1">{children}</section>
    </main>
  );
}
