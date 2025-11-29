import { env } from "@/env.mjs";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Rate limit (report action)
    const ip = getClientIp(req.headers);
    const rl = rateLimit('report', ip);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded', retryInMs: rl.retryInMs }, { status: 429 });
    }
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate user
    const authClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: sessionData } = await authClient.auth.getUser();
    const user = sessionData?.user;

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { review_id, reason } = await req.json();

    if (!env.ADMIN_FEATURES_ENABLED || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Admin features disabled or service role credentials not configured" },
        { status: 500 }
      );
    }

    const service = createClient(
      env.SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await service
      .from("reviews")
      .update({
        flagged: true,
        report_reason: reason,
      })
      .eq("id", review_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Report Error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
