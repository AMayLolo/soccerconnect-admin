import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Layers, Flag, ShieldCheck, Users } from "lucide-react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, BASE_URL } from "@/env.mjs";

async function getDashboardStats() {
  const cookieStore = cookies();

  // Authenticated Supabase SSR client
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Call the protected API route with admin JWT
  const res = await fetch(`${BASE_URL}/api/admin/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
    cache: "no-store",
  });

  const json = await res.json();

  if (!json.success) {
    console.error("Stats API failed:", json.error);
    return {
      totalClubs: 0,
      pendingApprovals: 0,
      flaggedItems: 0,
      users: 0,
    };
  }

  return json.data;
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-10">
      {/* ---------------- Title ---------------- */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of system activity, flagged items, and approvals.
        </p>
      </div>

      {/* ---------------- Stats Cards ---------------- */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Clubs</CardTitle>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClubs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Flagged Items</CardTitle>
            <Flag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.flaggedItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.pendingApprovals}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
      </div>

      <Separator />
    </div>
  );
}
