import AuthRequiredLink from "../components/AuthRequiredLink";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1c3f60] mb-6">
          About SoccerConnect
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Making youth soccer club selection transparent, informed, and stress-free for families across the United States.
        </p>
      </div>

      {/* Mission Section */}
      <section className="mb-16">
        <div className="bg-linear-to-br from-[#0d7a9b]/10 to-[#1c3f60]/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-[#1c3f60] mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Finding the right youth soccer club can be overwhelming. SoccerConnect was created to empower parents and players with honest, community-driven reviews and comprehensive club information. We believe every family deserves access to transparent feedback from real parents who have experienced these clubs firsthand.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-[#1c3f60] mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0d7a9b] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1c3f60] mb-3">1. Search</h3>
            <p className="text-gray-600">
              Find clubs near you by name, city, or state. Browse hundreds of clubs across the country.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#0d7a9b] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1c3f60] mb-3">2. Review</h3>
            <p className="text-gray-600">
              Read honest feedback from real parents and players about coaching, development, and club culture.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#0d7a9b] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1c3f60] mb-3">3. Choose</h3>
            <p className="text-gray-600">
              Make an informed decision with confidence, knowing you have the insights you need.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-[#1c3f60] mb-8 text-center">What Makes Us Different</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-[#0d7a9b]/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#0d7a9b]/10 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-[#0d7a9b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1c3f60] mb-2">Community-Driven</h3>
                <p className="text-gray-600">
                  Every review comes from real parents and players, not paid endorsements or marketing copy.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#0d7a9b]/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#0d7a9b]/10 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-[#0d7a9b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1c3f60] mb-2">Trustworthy & Safe</h3>
                <p className="text-gray-600">
                  We moderate all reviews to ensure authenticity and maintain a respectful, helpful community.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#0d7a9b]/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#0d7a9b]/10 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-[#0d7a9b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1c3f60] mb-2">Comprehensive Coverage</h3>
                <p className="text-gray-600">
                  From recreational to elite competitive clubs, we're building the most complete database in youth soccer.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#0d7a9b]/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#0d7a9b]/10 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-[#0d7a9b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1c3f60] mb-2">Always Free</h3>
                <p className="text-gray-600">
                  SoccerConnect is free for families. No paywalls, no hidden fees—just honest information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Clubs Section */}
      <section className="mb-16">
        <div className="bg-[#1c3f60] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Are You a Club Administrator?</h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Claim your club's profile, respond to reviews, and keep your information up-to-date. Join hundreds of clubs already on SoccerConnect.
          </p>
          <a
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-[#0d7a9b] text-white rounded-lg hover:bg-[#0a5f7a] transition-colors font-medium shadow-lg"
          >
            Claim Your Club
          </a>
        </div>
      </section>

      {/* Join Community */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-[#1c3f60] mb-4">Join Our Community</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Help other families by sharing your club experience. Your insights make a difference in helping players find their perfect fit.
        </p>
        <AuthRequiredLink
          href="/reviews/submit"
          className="inline-block px-8 py-3 bg-[#0d7a9b] text-white rounded-lg hover:bg-[#0a5f7a] transition-colors font-medium shadow-md"
        >
          Write a Review
        </AuthRequiredLink>
      </section>
    </div>
  );
}
