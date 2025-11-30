import { getSupabaseServerAdmin } from "@/lib/supabaseServerAdmin";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import UserManagementClient from "./UserManagementClient";

export default async function UserManagementPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect("/login?redirect=/protected/users");
  }

  const supabase = getSupabaseServerAdmin();

  // Fetch users with their activity counts
  const { data: users, error } = await supabase
    .from("profiles")
    .select(`
      user_id,
      full_name,
      email,
      approved_role,
      status,
      is_banned,
      is_suspended,
      inserted_at,
      updated_at
    `)
    .order("inserted_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-red-600">Error loading users: {error.message}</p>
        </div>
      </div>
    );
  }

  // Fetch activity counts for all users
  const userIds = users?.map(u => u.user_id) || [];
  
  const [reviewCounts, discussionCounts] = await Promise.all([
    // Get review counts per user
    supabase
      .from("reviews")
      .select("user_id")
      .in("user_id", userIds)
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        data?.forEach(r => {
          counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        });
        return counts;
      }),
    // Get discussion counts per user
    supabase
      .from("discussions")
      .select("user_id")
      .in("user_id", userIds)
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        data?.forEach(d => {
          counts[d.user_id] = (counts[d.user_id] || 0) + 1;
        });
        return counts;
      }),
  ]);

  const usersWithCounts = users?.map(user => ({
    ...user,
    reviewCount: reviewCounts[user.user_id] || 0,
    discussionCount: discussionCounts[user.user_id] || 0,
  })) || [];

  return (
    <UserManagementClient 
      initialUsers={usersWithCounts}
    />
  );
}
