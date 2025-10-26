// admin-web/src/app/protected/types.ts

// A single public review row for the Reviews table / dashboard.
// This is the *shape we render*, not necessarily the raw DB row.
export type ReviewRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: string;
  inserted_at: string;
  club_name: string | null;
};

// A single flagged report row, for moderation.
// Combines review_reports + joined review info (and club).
export type FlaggedRow = {
  report_id: string;        // the review_reports.id
  review_id: string;        // which review was reported
  club_name: string | null; // name of the club
  rating: number | null;
  comment: string | null;
  category: string;
  inserted_at: string;      // when the review was created (fallback to created_at of report)
  resolved: boolean;        // false means still needs attention
};
