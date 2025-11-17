// src/app/(public)/layout.tsx
import "@/app/globals.css";

export default function PublicAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="max-w-4xl mx-auto px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
