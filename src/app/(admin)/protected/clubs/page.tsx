import { createClientRSC } from "@/lib/supabase/rsc";
import { isClubProfileComplete } from "@/utils/clubProfileCompletion";
import Link from "next/link";
import ClubsClient from "./ClubsClient";
import CSVImportButton from "./CSVImportButton";
import ExportClubsButton from "./ExportClubsButton";
import { RefreshButton } from "./RefreshButton";

export default async function AdminClubsPage() {
  const supabase = createClientRSC();

  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .order("club_name", { ascending: true });

  const completeClubs = data?.filter(club => isClubProfileComplete(club)) ?? [];
  const incompleteClubs = data?.filter(club => !isClubProfileComplete(club)) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Clubs</h1>
          <p className="text-gray-600">View and manage all soccer clubs in the directory</p>
          
          {/* Stats Summary */}
          <div className="mt-4 flex gap-4">
            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm font-medium text-green-700">{completeClubs.length} Complete Profiles</span>
            </div>
            <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-sm font-medium text-orange-700">{incompleteClubs.length} Incomplete Profiles</span>
            </div>
          </div>
        </div>
        
        {/* Export and CSV Import Buttons */}
        <div className="flex gap-2">
          {data && data.length > 0 && (
            <ExportClubsButton clubs={data} />
          )}
          <RefreshButton>
            <CSVImportButton />
          </RefreshButton>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600">Error loading clubs: {error.message}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No clubs found</p>
          <Link 
            href="/protected/clubs/new"
            className="mt-4 inline-block px-4 py-2 bg-[#0d7a9b] text-white rounded-md hover:bg-[#0a5f7a] transition-colors"
          >
            Add Your First Club
          </Link>
        </div>
      ) : (
        <ClubsClient initialClubs={data} />
      )}
    </div>
  );
}
