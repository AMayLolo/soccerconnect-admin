// admin-web/src/app/auth/signout/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// We handle POST because the form in the header submits POST
export async function POST() {
  const supabase = getServerClient();

  // kill the session on Supabase
  await supabase.auth.signOut();

  // then bounce them to /login
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
