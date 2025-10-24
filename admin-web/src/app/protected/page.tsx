// admin-web/src/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminHome() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!admin) redirect('/login?e=not_admin');

  // …your existing content…
  return (
    <main style={{ padding: 24 }}>
      <h1>Admin dashboard</h1>
      {/* render whatever you had here */}
    </main>
  );
}
