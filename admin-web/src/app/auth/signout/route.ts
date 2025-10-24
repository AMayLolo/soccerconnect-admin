// admin-web/src/app/auth/signout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// tiny helper to make a server-side supabase client
function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// handle GET /auth/signout
export async function GET() {
  const supabase = getServerClient();

  // ignore any error here, we just want them logged out
  await supabase.auth.signOut();

  // send them back to login
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'https://admin.soccerconnectusa.com'));
}

// handle POST too (just in case something still tries to POST)
export async function POST() {
  return GET();
}
