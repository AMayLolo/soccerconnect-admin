import { supabase } from "./supabaseClient";

// Helper delay
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function ensureClub(club: { club_name: string; city: string; state: string; logo_url?: string | null; badge_logo_url?: string | null }) {
  const { data: existing } = await supabase
    .from("clubs")
    .select("id")
    .eq("club_name", club.club_name)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("clubs")
    .insert({ club_name: club.club_name, city: club.city, state: club.state, logo_url: club.logo_url ?? null, badge_logo_url: club.badge_logo_url ?? null })
    .select("id")
    .single();

  if (error) throw error;
  return data!.id as string;
}

async function ensureUser(user: { email: string; password: string; full_name: string; role?: string | null }) {
  // Try to find by email
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());

  let userId: string | null = existing ? existing.id : null;

  if (!userId) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        role: user.role ?? "parent",
      },
    });
    if (error) throw error;
    userId = created.user?.id ?? null;
  }
  if (!userId) throw new Error("Failed to create/find user");

  // Ensure profile row
  const { error: upsertErr } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        full_name: user.full_name,
        approved_role: null, // keep null to satisfy constraints; non-admin by default
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  if (upsertErr) throw upsertErr;

  return userId;
}

async function insertReview(review: {
  club_id: string;
  user_id: string;
  rating: number;
  comment: string;
  reviewer_type: "parent" | "player" | "staff";
  inserted_at?: string;
}) {
  // Upsert-like behavior: if this user already reviewed this club, update instead of insert
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("club_id", review.club_id)
    .eq("user_id", review.user_id)
    .maybeSingle();

  const payload: any = { ...review };
  if (!payload.inserted_at) delete payload.inserted_at;

  if (existing?.id) {
    const { error } = await supabase
      .from("reviews")
      .update({
        rating: review.rating,
        comment: review.comment,
        reviewer_type: review.reviewer_type,
        // preserve inserted_at if table allows; otherwise updated_at only
        ...(review.inserted_at ? { inserted_at: review.inserted_at } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("reviews").insert(payload);
    if (error) throw error;
  }
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

async function main() {
  console.log("Seeding sample users, clubs, and reviews…");

  // Sample clubs (add or reuse existing)
  const clubMap = new Map<string, string>();
  const clubs = [
    { club_name: "Austin United SC", city: "Austin", state: "TX", logo_url: null, badge_logo_url: null },
    { club_name: "Bay Area FC", city: "San Jose", state: "CA", logo_url: null, badge_logo_url: null },
    { club_name: "Lakeside Rovers", city: "Chicago", state: "IL", logo_url: null, badge_logo_url: null },
  ];

  for (const c of clubs) {
    const id = await ensureClub(c);
    clubMap.set(c.club_name, id);
  }
  console.log(`✔ Ensured ${clubs.length} clubs`);

  // Sample users
  const users = [
    { email: "parent.one@example.com", password: "Password123!", full_name: "Alex Johnson", role: "parent" },
    { email: "player.one@example.com", password: "Password123!", full_name: "Sam Lee", role: "player" },
    { email: "coach.one@example.com", password: "Password123!", full_name: "Coach Rivera", role: "staff" },
  ];

  const userIds: Record<string, string> = {};
  for (const u of users) {
    const id = await ensureUser(u);
    userIds[u.email] = id;
  }
  console.log(`✔ Ensured ${users.length} users`);

  // Sample reviews
  const reviews = [
    {
      email: "parent.one@example.com",
      club: "Austin United SC",
      rating: 5,
      reviewer_type: "parent" as const,
      comment: "Fantastic coaching staff and great communication. Highly recommend!",
      inserted_at: daysAgo(1),
    },
    {
      email: "player.one@example.com",
      club: "Austin United SC",
      rating: 4,
      reviewer_type: "player" as const,
      comment: "Practices are intense but super fun. Learned a lot this season.",
      inserted_at: daysAgo(3),
    },
    {
      email: "coach.one@example.com",
      club: "Bay Area FC",
      rating: 4,
      reviewer_type: "staff" as const,
      comment: "Strong club culture and supportive parents. Room to grow facilities.",
      inserted_at: daysAgo(5),
    },
    {
      email: "parent.one@example.com",
      club: "Lakeside Rovers",
      rating: 3,
      reviewer_type: "parent" as const,
      comment: "Good value but scheduling could be better.",
      inserted_at: daysAgo(8),
    },
  ];

  for (const r of reviews) {
    const user_id = userIds[r.email];
    const club_id = clubMap.get(r.club);
    if (!user_id || !club_id) continue;
    await insertReview({ club_id, user_id, rating: r.rating, comment: r.comment, reviewer_type: r.reviewer_type, inserted_at: r.inserted_at });
    // Be polite to DB
    await wait(100);
  }
  console.log(`✔ Inserted ${reviews.length} sample reviews`);

  console.log("Done. You can now browse clubs and see reviews + test auth with sample users.");
}

main().catch((e) => {
  console.error("Seed script failed:", e);
  process.exit(1);
});
