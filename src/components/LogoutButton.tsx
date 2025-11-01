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
    <Button
      onClick={handleLogout}
      variant="ghost"
      size="sm"
      className="gap-0 px-1! py-0.5! border-0! outline-none"
      style={{ padding: '2px 6px' }}
    >
      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span className="inline">Logout</span>
    </Button>
  )
}
