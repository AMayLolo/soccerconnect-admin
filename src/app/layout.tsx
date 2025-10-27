import "./globals.css";
import { Toaster } from "react-hot-toast";
import LoadingOverlay from "@/components/LoadingOverlay";

export const metadata = {
  title: "Soccer Connect",
  description: "Admin Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LoadingOverlay />

        {children}

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
