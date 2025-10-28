import "./globals.css";
import type { Metadata } from "next";
import { SupabaseSessionListener } from "@/components/SupabaseSessionListener";

export const metadata: Metadata = {
  title: "SoccerConnect Admin",
  description: "Moderation and club management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-50 text-gray-900">
      <body className="min-h-screen antialiased">
        {children}
        {/* ✅ Keeps Supabase cookies in sync */}
        <SupabaseSessionListener />
      </body>
    </html>
  );
}
