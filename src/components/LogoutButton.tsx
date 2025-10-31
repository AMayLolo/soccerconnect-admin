"use client"

import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const handleLogout = async () => {
    // Add your logout logic here
    // For example, if using Supabase:
    // const supabase = createBrowserClient()
    // await supabase.auth.signOut()
    // router.push('/login')

    // For now, just redirect to home or login page
    window.location.href = "/"
  }

  return (
    <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 bg-transparent">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span className="hidden sm:inline">Logout</span>
    </Button>
  )
}
