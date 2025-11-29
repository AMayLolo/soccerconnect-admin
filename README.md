# SoccerConnect Admin & Public Site

Next.js 16 (App Router) application powering the SoccerConnect admin portal and public marketing pages. Supabase provides auth, data, and storage.

## Tech Stack
| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS + shadcn/ui + Radix primitives |
| Backend | Supabase (Postgres, Auth, Storage) |
| Auth | Supabase cookie-based session (SSR via `@supabase/ssr`) |
| Types | TypeScript (strict) |
| Testing | Playwright (smoke tests TBD) |

## Local Development
```bash
npm install
npm run dev
```
App runs at `http://localhost:3000`.

## Production Build
```bash
npm run build
npm start
```

## Environment Variables
Only the Supabase anonymous client credentials are strictly required for a build. Administrative endpoints (review moderation, stats) additionally need the service role key.

| Variable | Required | Purpose | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | Public, used client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key | Public auth/session |
| `SUPABASE_URL` | ➖ (fallback to public) | Explicit server URL | Optional override |
| `SUPABASE_SERVICE_ROLE_KEY` | ➖ for basic site / ✅ for admin moderation | Service role operations (flags, stats) | Keep secret (server only) |
| `NEXT_PUBLIC_SUPABASE_LOGO_BUCKET` | ➖ | Storage bucket name | Defaults to `logos` |
| `NEXT_PUBLIC_SITE_URL` | ➖ | Public marketing canonical URL | Derived from `VERCEL_URL` if absent |
| `NEXT_PUBLIC_APP_URL` | ➖ | Admin domain URL | Falls back to SITE_URL |
| `NEXT_PUBLIC_DOMAIN` | ➖ | Apex/domain display | Derived from SITE_URL hostname |
| `ADMIN_FEATURES_ENABLED` | ➖ | Feature flag to enable admin service-role routes | Defaults off if unset |

Validation & fallback logic lives in `src/env.mjs`. Health inspection endpoint: `GET /api/health/env`.

### Adding Admin Features in Production
Set:
```
SUPABASE_SERVICE_ROLE_KEY=xxxx
ADMIN_FEATURES_ENABLED=true
```
Without these, moderation endpoints return 500 with a clear JSON error.

## Domain-Based Routing
Logic in `proxy.ts` will differentiate public vs admin traffic (planned enhancement):
1. Requests with host matching `admin.<domain>` are expected to use protected/admin paths.
2. Public host (`www.` or apex) should never expose `/protected` without auth; unauthenticated gets redirected to `/login`.

## Review Moderation Endpoints (Admin)
All under `/api/admin/reviews/*` (flag clearing, hide, restore) and `/api/admin/stats` require:
- Valid bearer token (Supabase session)
- User role = `admin`
- Feature flag + service role key present

## Health Endpoint
`/api/health/env` returns JSON summary (redacted) of active env configuration for debugging deployments.

## Rate Limiting (Planned)
Incoming endpoints for report & moderation will be protected by lightweight in-memory IP/token buckets. Consider Redis for horizontal scaling later.

## Testing (Planned)
Initial Playwright smoke tests will verify:
- Public home renders
- Clubs list loads
- Redirect to login for `/protected` when unauthenticated
- Authenticated admin sees stats

## Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint code quality |

## CI (Planned)
GitHub Actions workflow will run install → type check → build. Future: add Playwright smoke tests.

## Security Notes
Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side. Guarded in server routes only; audited via search for occurrences.

## License
Private / Proprietary (update if needed).

