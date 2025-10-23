import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LoginPage() {
  return (
    <main style={{ padding: 24, maxWidth: 560 }}>
      <h1>Admin Login</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
