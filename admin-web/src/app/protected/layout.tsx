// admin-web/src/app/protected/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

async function getSessionAndRole() {
  const cookieStore = await cookies();

  // stub response for createServerClient
  const fakeRes = {
    cookies: {
      get() {},
      set() {},
      remove() {},
    },
  } as any;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // not signed in at all
    redirect('/login');
  }

  // verify admin_users row
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRow) {
    // signed in but not an admin
    redirect('/login?error=not_admin');
  }

  return { user, role: adminRow.role as string, supabase };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ensure valid admin session before rendering children
  await getSessionAndRole();

  return <>{children}</>;
}
