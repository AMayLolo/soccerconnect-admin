import "./globals.css";
import { PublicHeader } from "./components/PublicHeader";
import { PublicFooter } from "./components/PublicFooter";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "SoccerConnect",
  description: "Find youth soccer clubs, reviews, and details.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <PublicHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <PublicFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
