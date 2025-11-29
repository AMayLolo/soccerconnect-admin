import { createClientRSC } from "@/lib/supabase/rsc";

export default async function AdminProfilePage() {
  const supabase = createClientRSC();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your account information and settings</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
            <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
