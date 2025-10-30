// src/app/protected/layout.tsx
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import SidebarNav from "@/components/SidebarNav";
import ThemeToggle from "@/components/ThemeToggle";

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
  if (!user) redirect("/login");

  const email = user.email || "Unknown User";
  const fullName =
    (user.user_metadata && user.user_metadata.full_name) || email;

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between">
        <div>
          {/* logo row */}
          <div className="flex items-center gap-3 px-5 py-5 border-b">
            {/* if your svg is named differently, change src here */}
            <Image
              src="/soccerconnect-logo.svg"
              alt="SoccerConnect"
              width={36}
              height={36}
              className="rounded-md"
            />
            <span className="text-lg font-semibold">SoccerConnect</span>
          </div>

          <SidebarNav />
        </div>

        {/* user footer */}
        <div className="border-t px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium leading-tight">{fullName}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* top bar */}
        <header className="h-14 bg-white border-b flex items-center px-8">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </header>

        {/* page content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>

        <footer className="border-t bg-white text-center py-4 text-sm text-gray-500">
          © 2025 SoccerConnect ·{" "}
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </footer>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}
