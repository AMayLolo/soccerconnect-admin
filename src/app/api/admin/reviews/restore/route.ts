import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";

export async function POST(req: Request) {
  try {
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

    const service = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    await service
      .from("reviews")
      .update({ hidden: false, flagged: false })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
