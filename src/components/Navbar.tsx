// Render a server-side <img> for the logo so the asset appears as a separate
// resource in DevTools (easier debugging) and to avoid client-only hydration
// surprises while we root-cause the inline-SVG mismatch.
import Logo from "@/components/LogoImg"
import LogoutButton from "@/components/LogoutButton"
import Link from "next/link"

export function Navbar() {
  return (
  <nav className="sticky top-4 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
  <div className="mx-auto max-w-7xl px-8 py-3">
  <div className="flex h-32 justify-between sm:h-40">
          {/* Logo and Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/protected" className="flex items-center h-full">
              {/* Logo */}
              <Logo className="h-12 sm:h-16 md:h-20 w-auto" />
            </Link>

            {/* Title moved back to the left area, mid-size between previous and current */}
            <div className="flex flex-col ml-8 sm:ml-10 navbar-title">
              <h1 className="text-lg md:text-3xl lg:text-4xl font-extrabold tracking-tight whitespace-nowrap text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Manage your SoccerConnect platform</p>
            </div>

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
          <div className="flex items-center gap-2 navbar-right pr-6 sm:pr-8 flex-nowrap">
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
