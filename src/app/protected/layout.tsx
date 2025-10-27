// src/app/protected/layout.tsx
import { ReactNode } from "react";
import { requireCurrentUser } from "@/utils/auth";
import ProtectedHeader from "@/components/ProtectedHeader";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // server-side auth gate
  await requireCurrentUser();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sticky-ish header bar */}
      <ProtectedHeader />

      {/* Page body wrapper */}
      <main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-8">
        {children}
      </main>
    </div>
  );
}
