// admin-web/src/app/auth/signout/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function POST() {
  const supabase = getServerClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL(
      '/login',
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    )
  );
}
