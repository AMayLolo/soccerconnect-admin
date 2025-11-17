declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_SUPABASE_LOGO_BUCKET: string;

    NEXT_PUBLIC_SITE_URL: string;
    NEXT_PUBLIC_BASE_URL: string;
    NEXT_PUBLIC_DOMAIN: string;
    NEXT_PUBLIC_APP_URL: string;

    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
  }
}
