'use client';

import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { useEffect, useState } from 'react';

type AdminRow = { id: string; role: string };

export default function ClientAdminInfo() {
  const [admin, setAdmin] = useState<AdminRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Browser client (no cookies API needed)
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const {
          data: { user },
          error: uErr,
        } = await supabase.auth.getUser();
        if (uErr) throw uErr;
        if (!user) {
          if (!cancelled) {
            setAdmin(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select('id, role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!cancelled) {
          setAdmin((data as AdminRow) ?? null);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message ?? 'Failed to load admin info');
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="p-4 text-sm text-gray-600">Loading admin info…</p>;
  if (err) return <p className="p-4 text-sm text-red-600">{err}</p>;
  if (!admin) return <p className="p-4 text-sm text-gray-600">Not signed in.</p>;

  return (
    <div className="p-4 border rounded-md bg-white">
      <h2 className="font-semibold">Admin</h2>
      <div className="text-sm text-gray-700">ID: {admin.id}</div>
      <div className="text-sm text-gray-700">Role: {admin.role}</div>
    </div>
  );
}
