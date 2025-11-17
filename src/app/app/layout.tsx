import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "SoccerConnect – My Dashboard",
  description: "User dashboard for SoccerConnect.",
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground">

        {/* Header */}
        <header className="border-b bg-card h-16 flex items-center">
          <div className="max-w-6xl mx-auto w-full px-6 flex items-center justify-between">
            <Link href="/app" className="flex items-center gap-3">
              <Image
                src="/logos/soccerconnect_logo.svg"
                alt="SoccerConnect Logo"
                width={30}
                height={30}
              />
              <span className="font-semibold text-lg">My SoccerConnect</span>
            </Link>

            <nav className="flex items-center gap-6">
              <Link href="/app/profile" className="hover:opacity-80">
                Profile
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
          {children}
        </main>

      </body>
    </html>
  );
}
