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

export function getMissingFields(club: ClubProfile): string[] {
  const missing: string[] = [];
  
  if (!club.club_name?.trim()) missing.push("Name");
  if (!club.city?.trim()) missing.push("City");
  if (!club.state?.trim()) missing.push("State");
  if (!club.website_url?.trim()) missing.push("Website");
  if (!club.about?.trim()) missing.push("About");
  if (!club.competition_level?.trim()) missing.push("Competition Level");
  if (!club.ages?.trim()) missing.push("Ages");
  if (!club.logo_url && !club.badge_logo_url) missing.push("Logo");
  
  return missing;
}
