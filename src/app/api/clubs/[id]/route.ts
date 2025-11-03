import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { isSuperAdminEmail } from "@/constants/admins"
import { LOGO_BUCKET } from "@/constants/storage"
import { getSupabaseServerAdmin } from "@/lib/supabaseServerAdmin"

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: clubId } = await context.params
  if (!clubId) {
    return NextResponse.json({ error: "Missing club id" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => Array.from(cookieStore.getAll()),
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isSuperAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const adminClient = getSupabaseServerAdmin()

  const { data: clubRow, error: fetchError } = await adminClient
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .maybeSingle()

  if (fetchError) {
    console.error("Failed to load club for delete", fetchError)
    return NextResponse.json({ error: "Failed to load club" }, { status: 500 })
  }

  if (!clubRow) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 })
  }

  const relatedTables = [
    { table: "reviews", column: "club_id" },
    { table: "discussions", column: "club_id" },
    { table: "club_admin_requests", column: "club_id" },
  ] as const

  for (const { table, column } of relatedTables) {
    const { error } = await adminClient.from(table).delete().eq(column, clubId)
    if (error) {
      console.error(`Failed to delete related ${table} rows for club ${clubId}`, error)
      return NextResponse.json({ error: `Failed to delete related ${table}` }, { status: 500 })
    }
  }

  try {
    let offset = 0
    const batchSize = 100
    const filesToRemove: string[] = []

    while (true) {
      const { data: files, error: listError } = await adminClient.storage
        .from(LOGO_BUCKET)
        .list(clubId, { limit: batchSize, offset })

      if (listError) {
        console.error(`Failed to list storage objects for club ${clubId}`, listError)
        break
      }

      if (!files || files.length === 0) {
        break
      }

      for (const file of files) {
        if (!file || !file.name) continue
        filesToRemove.push(`${clubId}/${file.name}`)
      }

      if (files.length < batchSize) {
        break
      }

      offset += files.length
    }

    if (filesToRemove.length > 0) {
      const { error: removeError } = await adminClient.storage.from(LOGO_BUCKET).remove(filesToRemove)
      if (removeError) {
        console.error(`Failed to remove storage objects for club ${clubId}`, removeError)
      }
    }
  } catch (err) {
    console.error(`Unexpected error pruning storage for club ${clubId}`, err)
  }

  const { error: deleteError } = await adminClient.from("clubs").delete().eq("id", clubId)
  if (deleteError) {
    console.error("Failed to delete club", deleteError)
    return NextResponse.json({ error: "Failed to delete club" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
