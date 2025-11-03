import { PublicNavbar } from "@/components/PublicNavbar"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col">
        <PublicNavbar />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
