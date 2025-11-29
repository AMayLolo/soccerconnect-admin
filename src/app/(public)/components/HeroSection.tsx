import SearchBar from "./SearchBar";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-24 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
          Find Your Perfect Youth Soccer Club
        </h1>

        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Real reviews. Real families. Real insights.  
          Discover the right environment for your player.
        </p>

        <div className="mt-8 max-w-xl mx-auto">
          <SearchBar />
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/clubs"
            className="px-6 py-3 bg-black text-white rounded-md text-sm font-medium hover:opacity-90"
          >
            Browse Clubs
          </Link>

          <Link
            href="/auth/signup"
            className="px-6 py-3 border rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </section>
  );
}
