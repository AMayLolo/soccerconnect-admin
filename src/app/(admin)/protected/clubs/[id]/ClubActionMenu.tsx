"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isSuperAdminEmail } from "@/constants/admins"
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface ClubActionMenuProps {
  clubId: string
  canDelete: boolean
}

export function ClubActionMenu({ clubId, canDelete }: ClubActionMenuProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [allowed, setAllowed] = useState(canDelete)

  useEffect(() => {
    if (canDelete) return

    let cancelled = false
    const supabase = getSupabaseBrowserClient()

    const checkAdmin = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (cancelled) return
        if (isSuperAdminEmail(data?.user?.email)) {
          setAllowed(true)
        }
      } catch {
        // silently ignore client-side auth errors
      }
    }

    void checkAdmin()

    return () => {
      cancelled = true
    }
  }, [canDelete])

  const handleEdit = () => {
    router.push(`/protected/clubs/${clubId}/update`)
  }

  const handleDelete = async () => {
  if (!allowed || deleting) return
    const confirmed = window.confirm(
      "Delete this club profile? This action cannot be undone and will remove the club and its related data."
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/clubs/${clubId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        const message = payload?.error || "Failed to delete club."
        alert(message)
        return
      }

      router.push("/protected/clubs?deleted=1")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error deleting club."
      alert(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={deleting}>
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
          <span className="sr-only">Open club actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Details
        </DropdownMenuItem>
        {allowed && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                handleDelete()
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Club
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
