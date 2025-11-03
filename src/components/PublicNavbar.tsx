"use client"

import Logo from "@/components/LogoImg"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { LogIn, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export function PublicNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const syncUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!mounted) return
      setIsAuthenticated(Boolean(user))
      setUserEmail(user?.email ?? null)
    }

    syncUser()

    const { data } = supabase.auth.onAuthStateChange((_: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return
      setIsAuthenticated(Boolean(session?.user))
      setUserEmail(session?.user?.email ?? null)
    })

    return () => {
      mounted = false
      data?.subscription.unsubscribe()
    }
  }, [supabase])

  const navItems = useMemo(
    () => [
      { name: "Dashboard", href: "/users/dashboard" },
      { name: "Profile", href: "/users" },
    ],
    []
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
  <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/users/dashboard" className="flex items-center gap-3">
            <Logo />
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold tracking-tight">SoccerConnect</h1>
              <p className="text-xs text-muted-foreground">Your community hub</p>
            </div>
          </Link>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && userEmail ? (
                <span className="hidden text-sm text-muted-foreground sm:inline">{userEmail}</span>
              ) : null}

              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
