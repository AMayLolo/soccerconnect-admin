import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";
import AuthRequiredLink from "../../components/AuthRequiredLink";
import { ReviewsSection } from "../../components/ReviewsSection";

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClientRSC();
  const { id: clubId } = await params;

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", clubId)
    .single();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("club_id", clubId)
    .order("inserted_at", { ascending: false });

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Club Not Found</h1>
          <p className="text-gray-600 mb-6">The club you're looking for doesn't exist.</p>
          <Link href="/clubs" className="text-[#0d7a9b] hover:text-[#0a5f7a] font-medium">
            ← Back to Clubs
          </Link>
        </div>
      </div>
    );
  }

  // Format reviews for ReviewsSection component
  const formattedReviews = (reviews || []).map(review => ({
    id: review.id,
    reviewer_name: review.profiles?.full_name || null,
    reviewer_type: review.reviewer_type,
    rating: review.rating,
    comment: review.comment,
    inserted_at: review.inserted_at,
  }));

  // Calculate separate averages
  const memberReviews = formattedReviews.filter(r => 
    r.reviewer_type === 'parent' || r.reviewer_type === 'player'
  );
  const staffReviews = formattedReviews.filter(r => 
    r.reviewer_type === 'staff'
  );

  const memberAvg = memberReviews.length > 0
    ? memberReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / memberReviews.length
    : null;

  const staffAvg = staffReviews.length > 0
    ? staffReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / staffReviews.length
    : null;

  // Parse leagues from competition_level
  const leagues = club.competition_level 
    ? club.competition_level.split(',').map((l: string) => l.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-[#1c3f60] to-[#0d7a9b] text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link 
            href="/clubs" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Clubs
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Club Badge */}
            <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 shrink-0">
              <img
                src={club.badge_logo_url || club.logo_url || "/placeholder.png"}
                alt={club.club_name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Club Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{club.club_name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{club.city}, {club.state}</span>
                </div>

                {club.founded && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Founded {club.founded}</span>
                  </div>
                )}
              </div>

              {/* Leagues */}
              {leagues.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {leagues.map((league: string) => (
                    <span 
                      key={league}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
                    >
                      {league}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                {club.website_url && (
                  <a
                    href={club.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-white text-[#1c3f60] rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Visit Website
                  </a>
                )}
                
                {club.tryout_info_url && (
                  <a
                    href={club.tryout_info_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg hover:bg-white/20 transition-colors font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tryout Info
                  </a>
                )}

                <AuthRequiredLink
                  href={`/reviews/submit?club_id=${club.id}`}
                  className="px-6 py-2.5 bg-[#0d7a9b] text-white rounded-lg hover:bg-[#0a5f7a] transition-colors font-medium shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Write a Review
                </AuthRequiredLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rating Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-[#1c3f60] mb-6">Ratings Overview</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {memberAvg !== null && (
                  <div className="border-2 border-[#0d7a9b]/20 rounded-xl p-6 bg-linear-to-br from-[#0d7a9b]/5 to-transparent">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-[#0d7a9b] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1c3f60]">Member Experience</h3>
                        <p className="text-sm text-gray-500">Parents & Players</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-[#0d7a9b]">
                        {memberAvg.toFixed(1)}
                      </span>
                      <span className="text-2xl text-gray-400">★</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Based on {memberReviews.length} {memberReviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                )}

                {staffAvg !== null && (
                  <div className="border-2 border-[#1c3f60]/20 rounded-xl p-6 bg-linear-to-br from-[#1c3f60]/5 to-transparent">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-[#1c3f60] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1c3f60]">Workplace Rating</h3>
                        <p className="text-sm text-gray-500">Staff & Coaches</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-[#1c3f60]">
                        {staffAvg.toFixed(1)}
                      </span>
                      <span className="text-2xl text-gray-400">★</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Based on {staffReviews.length} {staffReviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                )}

                {memberAvg === null && staffAvg === null && (
                  <div className="md:col-span-2 text-center py-8">
                    <p className="text-gray-500 mb-4">No ratings yet for this club</p>
                    <AuthRequiredLink
                      href={`/reviews/submit?club_id=${club.id}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0d7a9b] text-white rounded-lg hover:bg-[#0a5f7a] transition-colors font-medium"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Be the First to Review
                    </AuthRequiredLink>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-[#1c3f60] mb-4">About {club.club_name}</h2>
              <p className="text-gray-700 leading-relaxed">
                {club.about || "Information about this club is being gathered. Check back soon or contact the club directly for more details."}
              </p>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ReviewsSection 
                initialReviews={formattedReviews}
                clubId={club.id}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#1c3f60] mb-4">Club Information</h3>
              
              <div className="space-y-4">
                {club.ages && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Age Groups</p>
                    <p className="text-gray-900 font-medium">{club.ages}</p>
                  </div>
                )}

                {club.competition_level && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Competition Levels</p>
                    <p className="text-gray-900 font-medium">{club.competition_level}</p>
                  </div>
                )}

                {club.founded && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Established</p>
                    <p className="text-gray-900 font-medium">{club.founded}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-gray-900 font-medium">{club.city}, {club.state}</p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            {(club.website_url || club.tryout_info_url) && (
              <div className="bg-linear-to-br from-[#0d7a9b]/10 to-[#1c3f60]/10 rounded-xl border-2 border-[#0d7a9b]/20 p-6">
                <h3 className="text-lg font-bold text-[#1c3f60] mb-4">Get in Touch</h3>
                
                <div className="space-y-3">
                  {club.website_url && (
                    <a
                      href={club.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div className="w-10 h-10 bg-[#0d7a9b] rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Official Website</p>
                        <p className="text-xs text-gray-500 truncate">Visit club site</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0d7a9b] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}

                  {club.tryout_info_url && (
                    <a
                      href={club.tryout_info_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div className="w-10 h-10 bg-[#1c3f60] rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Tryout Information</p>
                        <p className="text-xs text-gray-500 truncate">Learn about tryouts</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0d7a9b] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* CTA Card */}
            <div className="bg-linear-to-br from-[#1c3f60] to-[#0d7a9b] rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Share Your Experience</h3>
              <p className="text-white/90 text-sm mb-4">
                Help other families make informed decisions by sharing your experience with {club.club_name}.
              </p>
              <AuthRequiredLink
                href={`/reviews/submit?club_id=${club.id}`}
                className="block w-full text-center px-6 py-3 bg-white text-[#1c3f60] rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Write a Review
              </AuthRequiredLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
