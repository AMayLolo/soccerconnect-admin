import Link from "next/link"
import { Logo } from "@/components/Logo"
import LogoutButton from "@/components/LogoutButton"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/protected/dashboard" className="flex items-center">
              <Logo className="h-12 w-auto sm:h-14" />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/protected/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/protected/clubs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Clubs
              </Link>
              <Link
                href="/protected/flagged"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Flagged
              </Link>
              <Link
                href="/protected/approvals"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Approvals
              </Link>
              <Link
                href="/protected/reviews"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Reviews
              </Link>
            </div>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-muted-foreground sm:block">Welcome back 👋</p>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
