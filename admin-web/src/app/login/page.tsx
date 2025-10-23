// admin-web/src/app/login/page.tsx
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 440, margin: '48px auto', padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        Admin Sign In
      </h1>
      <p style={{ opacity: 0.7, marginBottom: 16 }}>
        Use your admin email to receive a magic link.
      </p>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
