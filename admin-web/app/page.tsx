// admin-web/app/page.tsx
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export default function Home() {
  // TEMP marker so we can see which build is live.
  // Comment this out after testing.
  if (process.env.NEXT_PUBLIC_APP_MARK) {
    return (
      <main style={{ padding: 24 }}>
        <h1>BUILD MARKER: {process.env.NEXT_PUBLIC_APP_MARK}</h1>
        <p>Home is redirecting to /protected …</p>
      </main>
    );
  }
  redirect('/protected');
}
