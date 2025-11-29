// Utility to check if a club profile is complete
// A complete profile should have all essential fields filled

export type ClubProfile = {
  club_name?: string | null;
  city?: string | null;
  state?: string | null;
  website_url?: string | null;
  about?: string | null;
  competition_level?: string | null;
  ages?: string | null;
  logo_url?: string | null;
  badge_logo_url?: string | null;
};

export function isClubProfileComplete(club: ClubProfile): boolean {
  // Required fields for a complete profile
  const requiredFields = [
    club.club_name,
    club.city,
    club.state,
    club.about,
    club.competition_level,
    club.ages,
  ];

  // Optional but recommended fields
  const hasLogo = !!(club.logo_url || club.badge_logo_url);
  const hasWebsite = !!club.website_url;

  // All required fields must be filled and not empty strings
  const allRequiredFilled = requiredFields.every(
    (field) => field != null && field.trim() !== ""
  );

  // For a truly "complete" profile, we also want logo and website
  return allRequiredFilled && hasLogo && hasWebsite;
}

export function getProfileCompletionPercentage(club: ClubProfile): number {
  const fields = [
    club.club_name,
    club.city,
    club.state,
    club.website_url,
    club.about,
    club.competition_level,
    club.ages,
    club.logo_url || club.badge_logo_url,
  ];

  const filledFields = fields.filter(
    (field) => field != null && String(field).trim() !== ""
  ).length;

  return Math.round((filledFields / fields.length) * 100);
}
