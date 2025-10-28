// src/app/layout.tsx
import "../styles/globals.css";
import type { Metadata } from "next";

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
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
