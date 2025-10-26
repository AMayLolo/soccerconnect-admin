// src/app/protected/layout.tsx
import { requireUser } from "@/utils/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect("/login") on the server if not authed
  await requireUser();

  return (
    <section className="min-h-screen bg-white text-gray-900">
      {children}
    </section>
  );
}
