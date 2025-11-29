import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { club_name, city, state, website_url, additional_info } = await request.json();

    // Validate required fields
    if (!club_name || !city || !state) {
      return NextResponse.json(
        { error: "Club name, city, and state are required" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();
    
    // Get current user (optional - can be anonymous)
    const { data: { user } } = await supabase.auth.getUser();

    // Insert recommendation
    const { error } = await supabase
      .from("club_recommendations")
      .insert({
        club_name,
        city,
        state: state.toUpperCase(),
        website_url: website_url || null,
        additional_info: additional_info || null,
        submitted_by: user?.id || null,
        status: "pending",
      });

    if (error) {
      console.error("Error inserting club recommendation:", error);
      return NextResponse.json(
        { error: "Failed to submit recommendation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in recommend club API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
