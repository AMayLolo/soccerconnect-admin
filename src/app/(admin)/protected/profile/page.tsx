import { createClientRSC } from "@/lib/supabase/rsc";

export default async function AdminProfilePage() {
  const supabase = createClientRSC();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      <div className="p-6 bg-white border rounded-xl">
        <p><strong>Email:</strong> {user?.email}</p>
      </div>
    </div>
  );
}
