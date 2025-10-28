import "./globals.css";
import type { Metadata } from "next";
import { SessionExpiredBanner } from "@/components/SessionExpiredBanner";

export const metadata: Metadata = {
  title: "SoccerConnect Admin",
  description: "Admin dashboard for SoccerConnect moderation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-50 text-gray-900">
      <body>
        {children}

        {/* 🔔 session-expired toast lives here, on every page */}
        <SessionExpiredBanner />
      </body>
    </html>
  );
}
