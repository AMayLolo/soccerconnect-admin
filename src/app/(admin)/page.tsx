import { createClientRSC } from "@/lib/supabase/rsc";

export default async function AdminDashboard() {
  const supabase = createClientRSC();

  const { count: clubs } = await supabase
    .from("clubs")
    .select("*", { count: "exact", head: true });

  const { count: reviews } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-semibold">Overview</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6 bg-white border rounded-xl">
          <p className="text-gray-500">Total Clubs</p>
          <p className="text-3xl font-bold">{clubs ?? 0}</p>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-gray-500">Total Reviews</p>
          <p className="text-3xl font-bold">{reviews ?? 0}</p>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-gray-500">System Status</p>
          <p className="text-3xl font-bold text-green-600">Healthy</p>
        </div>
      </div>
    </div>
  );
}
