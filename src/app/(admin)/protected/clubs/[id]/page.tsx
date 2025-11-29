import { createClientRSC } from "@/lib/supabase/rsc";

export default async function AdminClubDetail({ params }: { params: { id: string } }) {
  const supabase = createClientRSC();
  const clubId = params.id;

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", clubId)
    .single();

  if (!club) return <div>Club not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{club.club_name}</h1>

      <div className="p-6 border bg-white rounded-xl">
        <p><strong>City:</strong> {club.city}</p>
        <p><strong>State:</strong> {club.state}</p>
        <p><strong>Website:</strong> {club.website_url}</p>
        <p><strong>Reviews:</strong> {club.review_count}</p>
      </div>
    </div>
  );
}
