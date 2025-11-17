// src/app/(marketing)/layout.tsx
import "@/app/globals.css";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
