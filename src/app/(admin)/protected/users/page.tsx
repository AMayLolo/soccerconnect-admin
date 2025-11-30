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

  // Fetch users from profiles table (email is not in profiles, we'll get it from auth.users)
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(`
      user_id,
      full_name,
      approved_role,
      status,
      is_banned,
      is_suspended,
      banned_at,
      suspended_at,
      ban_reason,
      suspension_reason,
      updated_at
    `)
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-red-600">Error loading users: {profilesError.message}</p>
        </div>
      </div>
    );
  }

  // Fetch emails from auth.users using admin client
  const userIds = profiles?.map(p => p.user_id) || [];
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  
  // Create a map of user_id to email
  const emailMap: Record<string, string> = {};
  authUsers?.users?.forEach(user => {
    if (user.id && user.email) {
      emailMap[user.id] = user.email;
    }
  });

  // Merge email data with profiles
  const users = profiles?.map(profile => ({
    ...profile,
    email: emailMap[profile.user_id] || null
  })) || [];

  if (!users) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-red-600">Error loading users</p>
        </div>
      </div>
    );
  }

  // Fetch activity counts for all users
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
