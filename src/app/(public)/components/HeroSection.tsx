export default function HeroSection() {
  return (
    <section className="pt-20 pb-32 bg-linear-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-black">
          Find the Right Youth Soccer Club.
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Discover real parent reviews, compare clubs, and make informed decisions
          for your player’s development — all in one place.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a 
            href="/clubs"
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-900"
          >
            Browse Clubs
          </a>
          <a 
            href="/auth/signup"
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
