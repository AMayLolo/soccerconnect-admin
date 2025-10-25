// admin-web/src/app/protected/data.ts
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabaseServer';
import type { ReviewRow, FlaggedRow } from './types';

// Helper to satisfy createSupabaseServer({ get })
async function getCookieValue(name: string): Promise<string | undefined> {
  const store = await cookies();
  return store.get(name)?.value;
}

// Get most recent public reviews for Reviews page / dashboard cards
export async function fetchLatestReviews(): Promise<ReviewRow[]> {
  const supabase = await createSupabaseServer({
    get: getCookieValue,
  });

  // Grab reviews + club name via join
  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        clubs (
          name
        )
      `
    )
    .order('inserted_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('fetchLatestReviews error:', error);
    return [];
  }

  // Normalize to ReviewRow[]
  return (data ?? []).map((row: any): ReviewRow => ({
    id: row.id,
    rating: row.rating ?? null,
    comment: row.comment ?? null,
    category: row.category,
    inserted_at: row.inserted_at,
    club_name: row.clubs?.name ?? null,
  }));
}

// Get unresolved moderation reports for Flagged
export async function fetchFlaggedReports(): Promise<FlaggedRow[]> {
  const supabase = await createSupabaseServer({
    get: getCookieValue,
  });

  // Pull reports with joined review + club name
  const { data, error } = await supabase
    .from('review_reports')
    .select(
      `
        id,
        review_id,
        reason,
        resolved,
        created_at,
        reviews (
          id,
          rating,
          comment,
          category,
          inserted_at,
          clubs (
            name
          )
        )
      `
    )
    .eq('resolved', false) // only unresolved
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('fetchFlaggedReports error:', error);
    return [];
  }

  // Normalize to FlaggedRow[]
  return (data ?? []).map((row: any): FlaggedRow => ({
    report_id: row.id,
    review_id: row.review_id,
    club_name: row.reviews?.clubs?.name ?? null,
    rating: row.reviews?.rating ?? null,
    comment: row.reviews?.comment ?? null,
    category: row.reviews?.category ?? 'unknown',
    inserted_at: row.reviews?.inserted_at ?? row.created_at,
    resolved: row.resolved ?? false,
  }));
}
