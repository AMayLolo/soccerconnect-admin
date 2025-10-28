import "./globals.css";
import { SupabaseSessionListener } from "@/components/SupabaseSessionListener";
import SessionExpiredToast from "@/components/SessionExpiredToast";

export const metadata = {
  title: "SoccerConnect Admin",
  description: "Admin dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-gray-50 text-gray-900">
      <body className="min-h-screen antialiased">
        <SupabaseSessionListener />
        <SessionExpiredToast />
        {children}
      </body>
    </html>
  );
}
