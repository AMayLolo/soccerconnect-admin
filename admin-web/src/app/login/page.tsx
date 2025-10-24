// admin-web/src/app/login/page.tsx
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
