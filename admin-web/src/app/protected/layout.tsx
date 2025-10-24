// admin-web/src/app/protected/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSessionAndAdmin() {
  const cookieStore = await cookies();

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

  // who is logged in?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // confirm admin
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect('/login?e=not_admin');
  }

  return {
    email: user.email ?? '',
    role: adminRow.role ?? 'admin',
  };
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, role } = await getSessionAndAdmin();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* top nav bar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* left chunk: brand / title */}
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-gray-900">
              SoccerConnect • Admin
            </div>
            <div className="text-xs text-gray-500">
              Internal moderation dashboard
            </div>
          </div>

          {/* right chunk: user info + sign out */}
          <div className="flex flex-col text-right">
            <div className="text-sm text-gray-900">{email}</div>
            <div className="text-xs text-gray-500">{role}</div>
            <Link
              href="/auth/signout"
              className="text-xs text-red-600 font-semibold hover:text-red-700"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      {/* body: sidebar + page content */}
      <div className="flex flex-1">
        {/* sidebar */}
        <aside className="w-64 shrink-0 border-r bg-white">
          <div className="px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-600 text-white font-semibold">
                SC
              </div>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">
                  SoccerConnect
                </div>
                <div className="text-xs text-gray-500">
                  Admin console
                </div>
                <div className="mt-2 text-xs text-gray-700">{email}</div>
                <div className="text-xs text-gray-500">
                  Role: {role}
                </div>
              </div>
            </div>
          </div>

          <nav className="px-4 py-4 space-y-1 text-sm text-gray-700">
            <NavItem label="Dashboard" href="/protected" />
            <NavItem label="Reviews" href="/protected/reviews" />
            <NavItem label="Flagged" href="/protected/flagged" />
            <NavItem label="Reports" href="/protected/reports" />
          </nav>
        </aside>

        {/* main content */}
        <main className="flex-1 bg-gray-50 px-6 py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

// tiny helper component so we don't repeat styles
function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    >
      {label}
    </Link>
  );
}
