// admin-web/src/app/login/page.tsx
import { LoginForm } from './ui/LoginForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SearchParams = { [key: string]: string | string[] | undefined };

export default function LoginPage({ searchParams }: { searchParams?: SearchParams }) {
  const e = typeof searchParams?.e === 'string' ? searchParams.e : undefined;

  return (
    <main style={{ maxWidth: 460, margin: '60px auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Admin Sign in</h1>
      <p style={{ color: '#4b5563', marginBottom: 16 }}>
        Use your admin email to receive a magic link.
      </p>

      {e === 'not_admin' && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: 12, borderRadius: 8, marginBottom: 12 }}>
          This account isn’t an admin. Ask an existing admin to add you in <code>admin_users</code>.
        </div>
      )}

      <LoginForm />

      <p style={{ marginTop: 16, fontSize: 12, color: '#6b7280' }}>
        You’ll be redirected to the admin dashboard after clicking the magic link.
      </p>
    </main>
  );
}
