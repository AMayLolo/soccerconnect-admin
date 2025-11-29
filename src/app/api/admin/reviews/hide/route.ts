import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rl = rateLimit('adminReview', ip);
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded', retryInMs: rl.retryInMs }, { status: 429 });
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const authClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await req.json();

    if (!env.ADMIN_FEATURES_ENABLED || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Admin features disabled or service role credentials not configured" },
        { status: 500 }
      );
    }

    const service = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!);

    await service
      .from("reviews")
      .update({ hidden: true })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
