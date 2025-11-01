import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoccerConnect Admin",
  description: "Admin console for managing soccer clubs and reviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        {/* Global horizontal gutters so pages don't run edge-to-edge.
            Do not constrain max-width here — individual pages/layouts control max width. */}
        <div className="min-h-screen">
          <div className="site-container">
            {children}
          </div>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
