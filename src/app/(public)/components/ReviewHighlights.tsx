export default function ReviewHighlights() {
  const highlights = [
    {
      quote:
        "SoccerConnect helped us choose the right club—my daughter is thriving!",
      author: "Michelle R.",
      location: "Austin, TX",
    },
    {
      quote: "The reviews were spot on. We switched clubs and it’s night and day.",
      author: "David L.",
      location: "Seattle, WA",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 pb-16">
      <h2 className="text-2xl font-semibold text-center mb-10">
        What Families Are Saying
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {highlights.map((review) => (
          <div
            key={review.author}
            className="border rounded-xl p-6 bg-white shadow-sm"
          >
            <p className="text-lg italic text-gray-800 mb-4">
              “{review.quote}”
            </p>
            <p className="text-sm text-gray-600">
              — {review.author}, {review.location}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
