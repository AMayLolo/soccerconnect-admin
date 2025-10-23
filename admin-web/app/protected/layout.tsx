import React from 'react';
import { redirect } from 'next/navigation';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import AdminTopBar from '@/components/AdminTopBar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSupabase(cookies: () => Promise<Headers>) {
  // Helper to align with Next 16 async cookies()
  const cookieHeader = (await cookies()).get('cookie');

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieHeader?.match(new RegExp(`${name}=([^;]+)`))?.[1];
        },
        set() {},
        remove() {},
      },
    }
  );
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Next 16: cookies() is async
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const cookieStore = async () => new Headers([['cookie', (await import('next/headers')).cookies().toString()]]);
  const supabase = await getSupabase(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Optional: ensure admin record exists
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRow) redirect('/login?e=not_admin');

  return (
    <html lang="en">
      <body>
        <AdminTopBar />
        <div style={{ maxWidth: 980, margin: '16px auto', padding: '0 16px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
