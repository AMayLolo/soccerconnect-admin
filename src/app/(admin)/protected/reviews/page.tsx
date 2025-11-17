import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, BASE_URL } from "@/env.mjs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Load reviews by category
async function loadReviews(filter: "flagged" | "hidden" | "all") {
  const cookieStore = cookies();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  let query = supabase
    .from("reviews")
    .select(
      `id, rating, comment, flagged, hidden, inserted_at, 
       profiles(full_name, email), 
       clubs(club_name)`
    )
    .order("inserted_at", { ascending: false });

  if (filter === "flagged") {
    query = query.eq("flagged", true).eq("hidden", false);
  }

  if (filter === "hidden") {
    query = query.eq("hidden", true);
  }

  const { data } = await query;

  return data || [];
}

async function getToken() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token;
}

export default async function ReviewsPage() {
  const [flagged, hidden, all] = await Promise.all([
    loadReviews("flagged"),
    loadReviews("hidden"),
    loadReviews("all"),
  ]);

  const token = await getToken();

  async function hideReview(id: string) {
    "use server";
    await fetch(`${BASE_URL}/api/admin/reviews/hide`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
  }

  async function restoreReview(id: string) {
    "use server";
    await fetch(`${BASE_URL}/api/admin/reviews/restore`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
  }

  async function clearFlag(id: string) {
    "use server";
    await fetch(`${BASE_URL}/api/admin/reviews/clear-flag`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
  }

  const renderList = (reviews: any[], mode: "flagged" | "hidden" | "all") => (
    <div className="grid gap-6">
      {reviews.length === 0 && (
        <p className="text-muted-foreground">No reviews found.</p>
      )}
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{review.clubs?.club_name}</CardTitle>

              <Badge variant="outline">Rating: {review.rating}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(review.inserted_at).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              By: {review.profiles?.full_name} • {review.profiles?.email}
            </p>

            <div className="flex gap-2 mt-2">
              {review.flagged && <Badge variant="destructive">Flagged</Badge>}
              {review.hidden && (
                <Badge variant="secondary">Hidden</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <p className="mb-4">{review.comment}</p>

            <div className="flex gap-3">
              {mode !== "hidden" && (
                <form action={hideReview.bind(null, review.id)}>
                  <Button variant="destructive" type="submit">
                    Hide Review
                  </Button>
                </form>
              )}

              {mode === "hidden" && (
                <form action={restoreReview.bind(null, review.id)}>
                  <Button variant="default" type="submit">
                    Restore Review
                  </Button>
                </form>
              )}

              {review.flagged && (
                <form action={clearFlag.bind(null, review.id)}>
                  <Button variant="outline" type="submit">
                    Clear Flag
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Review Moderation</h1>

      <Tabs defaultValue="flagged" className="w-full">
        <TabsList>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="hidden">Hidden</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged">{renderList(flagged, "flagged")}</TabsContent>

        <TabsContent value="hidden">{renderList(hidden, "hidden")}</TabsContent>

        <TabsContent value="all">{renderList(all, "all")}</TabsContent>
      </Tabs>
    </div>
  );
}
