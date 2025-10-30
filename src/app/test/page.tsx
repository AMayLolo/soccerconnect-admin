export default function TestPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100 text-gray-900">
      <h1 className="text-4xl font-bold text-blue-600">
        ✅ Tailwind CSS is Working!
      </h1>

      <div className="p-8 rounded-2xl shadow-xl bg-white text-center space-y-2">
        <p className="text-lg">
          This box uses <code>bg-white</code>, <code>shadow-xl</code>,{" "}
          <code>rounded-2xl</code>, and <code>text-lg</code>.
        </p>
        <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
          Hover me 🚀
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-10">
        If you see proper colors, spacing, and hover effects — Tailwind is active.
      </p>
    </main>
  );
}
