import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request.headers);
    const rl = rateLimit('adminReview', ip);
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded', retryInMs: rl.retryInMs }, { status: 429 });
    // 1. Check Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // 2. Create client authenticated AS the user
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    // Validate the user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Fetch the user's profile/role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Service role client for reading stats safely
    if (!env.ADMIN_FEATURES_ENABLED || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Admin features disabled or service role credentials not configured" },
        { status: 500 }
      );
    }

    const serviceClient = createClient(
      env.SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ---- Stats Queries ----
    const { count: clubsCount } = await serviceClient
      .from("clubs")
      .select("*", { head: true, count: "exact" });

    const { count: approvalsCount } = await serviceClient
      .from("club_admin_requests")
      .select("*", { head: true, count: "exact" })
      .eq("status", "pending");

    const { count: flaggedCount } = await serviceClient
      .from("flagged_items")
      .select("*", { head: true, count: "exact" })
      .eq("status", "pending");

    const { count: usersCount } = await serviceClient
      .from("profiles")
      .select("*", { head: true, count: "exact" });

    // 5. Response
    return NextResponse.json({
      success: true,
      data: {
        totalClubs: clubsCount ?? 0,
        pendingApprovals: approvalsCount ?? 0,
        flaggedItems: flaggedCount ?? 0,
        users: usersCount ?? 0,
      },
    });
  } catch (err: any) {
    console.error("Stats API Error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
