"use client"

import Logo from "@/components/LogoImg"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { LogOut } from 'lucide-react'
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const navItems = [
    { name: "Clubs", href: "/protected/clubs" },
    { name: "Flagged", href: "/protected/flagged" },
    { name: "Approvals", href: "/protected/approvals" },
    { name: "Reviews", href: "/protected/reviews" },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/protected">
            <Logo />
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/protected" className="hover:opacity-80 transition-opacity">
              <div>
                <h1 className="text-base md:text-xl lg:text-2xl font-bold">
                  Admin Dashboard
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Manage your SoccerConnect platform
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}