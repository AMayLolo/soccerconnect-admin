"use client";

import { arrayToCSV, downloadCSV } from "@/utils/csvExport";

type Club = {
  id: string;
  club_name: string;
  city: string | null;
  state: string | null;
  website_url: string | null;
  ages: string | null;
  competition_level: string | null;
  about: string | null;
  founded: string | null;
  logo_url: string | null;
  badge_logo_url: string | null;
  inserted_at: string;
  updated_at: string | null;
};

export default function ExportClubsButton({ clubs }: { clubs: Club[] }) {
  function handleExport() {
    const headers = [
      'Club Name',
      'City',
      'State',
      'Website',
      'Ages',
      'Competition Level',
      'About',
      'Founded',
      'Logo URL',
      'Badge URL',
      'Created',
      'Updated'
    ];

    const rows = clubs.map(club => [
      club.club_name,
      club.city,
      club.state,
      club.website_url,
      club.ages,
      club.competition_level,
      club.about,
      club.founded,
      club.logo_url,
      club.badge_logo_url,
      club.inserted_at,
      club.updated_at
    ]);

    const csv = arrayToCSV(headers, rows);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(`clubs_export_${timestamp}.csv`, csv);
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
    >
      📥 Export to CSV
    </button>
  );
}
