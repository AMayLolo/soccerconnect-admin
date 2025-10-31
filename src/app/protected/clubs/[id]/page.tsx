import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ClubDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const { id } = params;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">Club Details</h1>
      <p className="text-gray-600 text-sm mb-6">
        Viewing club ID: <span className="font-mono">{id}</span>
      </p>
      <p className="text-gray-500">Club detail page coming soon...</p>
    </div>
  );
}
