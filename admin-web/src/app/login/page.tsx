// admin-web/src/app/login/page.tsx
import { LoginForm } from './ui/LoginForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// NOTE: read search params on the SERVER (no useSearchParams needed)
export default function LoginPage({
  searchParams,
}: {
  searchParams?: { e?: string; m?: string };
}) {
  const msg = searchParams?.m ?? null;
  const err = searchParams?.e ?? null;

  return (
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Admin login</h1>
      {msg ? <p style={{ color: '#155e75' }}>{msg}</p> : null}
      {err ? <p style={{ color: 'crimson' }}>{err}</p> : null}
      <LoginForm />
    </main>
  );
}
