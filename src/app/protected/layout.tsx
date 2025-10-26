// src/app/protected/layout.tsx
import { requireUser } from "@/utils/auth";
import { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect("/login") on the server if you're not logged in.
  await requireUser();

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900">
      {/* global toaster for success/error toasts */}
      <Toaster />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              SoccerConnect Admin
            </h1>
            <p className="text-xs text-gray-500">
              Internal tools — Clubs, Reports, Reviews
            </p>
          </div>
          <div className="text-xs text-gray-500">
            {/* later we can add user email here */}
            Admin
          </div>
        </header>

        <main>{children}</main>
      </div>
    </section>
  );
}
