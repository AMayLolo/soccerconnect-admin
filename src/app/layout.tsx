import type { Metadata } from "next";
import "./(admin)/globals.css";

export const metadata: Metadata = {
  title: "SoccerConnect USA",
  description: "Find and review youth soccer clubs across the United States",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
