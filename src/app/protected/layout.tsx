import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "SoccerConnect Admin",
  description: "Admin console for managing soccer clubs and reports.",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar (consolidated) */}
      <Navbar />

      {/* Page content */}
      <main className="flex-1 px-8 py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Toasts */}
      <Toaster position="top-right" />
    </div>
  );
}
