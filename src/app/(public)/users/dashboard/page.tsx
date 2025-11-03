import DashboardClient from "@/app/(public)/users/dashboard/DashboardClient"
import { createServerClientInstance } from "@/utils/supabase/server"
import { fetchDashboardSnapshot } from "./snapshot"

export default async function UsersDashboardPage() {
  const supabase = await createServerClientInstance()
  const initialData = await fetchDashboardSnapshot(supabase)

  return <DashboardClient initialData={initialData} />
}
