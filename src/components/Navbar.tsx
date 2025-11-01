// Inline the header logo image directly to avoid importing a corrupted Logo component file
// (Logo.tsx is being cleaned separately). Using the public SVG ensures stable rendering.
import Logo from "@/components/Logo"
import LogoutButton from "@/components/LogoutButton"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
  <div className="mx-auto max-w-7xl px-8 py-3">
  <div className="flex h-32 items-center justify-between sm:h-40">
          {/* Logo and Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/protected" className="flex items-center">
              {/* Provide an explicit inline height so the Logo has a definite computed
                  height even if the corresponding Tailwind utility (e.g. .h-32)
                  isn't present in the generated CSS during dev. */}
              {/* Rely on Tailwind utility for definite height (h-20). */}
              <Logo className="h-20 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/protected"
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
