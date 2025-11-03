# SoccerConnect Admin — AI Agent Guide

## Architecture
- Next.js 16 app router under `src/app`; server routes (e.g. `api/auth`) sit beside pages. Tailwind + shadcn UI for styling.
- Supabase is the single backend: browser client via `getSupabaseBrowserClient` (`src/lib/supabaseBrowser.ts`), server clients via `src/lib/supabaseServer*.ts` and `src/utils/supabase/server.ts`.
- Protected routes use layouts in `src/app/protected/**`; authentication gate lives in `src/app/protected/layout.tsx` calling `getCurrentUser` from `src/utils/auth.ts`.
- Client state for metrics flows through `StatsProvider` (`src/components/StatsProvider.tsx`) with the `useSharedStats` hook, most visible in `src/app/protected/clubs/ClubsClient.tsx`.

## Workflow
- Install deps: `npm install`.
- Local dev: `npm run dev`. Production build: `npm run build`; start preview: `npm start`.
- No project-specific test command yet; Playwright is installed but unused.
- Tailwind utilities live in `tailwind.config.ts`; inspect via `scripts/run-tailwind-js-api.js`.
- When editing Supabase interactions, confirm environment vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) exist for the relevant client.

## Patterns & Conventions
- Keep Supabase client creation in helpers; don’t instantiate at module scope in shared files. Use `getSupabaseClient()` on the client, `createServerClientInstance()` or `getSupabaseServer*` on the server.
- Server components fetch data and pass to client components. Example: `src/app/protected/clubs/page.tsx` gets data with read-only client and hydrates `ClubsClient`.
- Client components must guard side effects; note defensive re-fetch pattern in `ClubsClient` when hydration fails.
- Auth state syncing handled by `SupabaseSessionListener`; use typed events (`AuthChangeEvent`, `Session`) to avoid TypeScript build breaks.
- File uploads use Supabase storage (`src/app/protected/clubs/[id]/update/page.tsx`) with `upsert: true` and public URL retrieval.
- Styling uses Tailwind + shadcn components (`src/components/ui`). Follow existing class patterns; prefer `class-variance-authority` helpers when available.
- Route handlers in `src/app/api/**` assume Supabase server client and return JSON; mirror existing structure when adding APIs.

## Gotchas
- Next.js 16 server `cookies()` call is async; await it (see `src/lib/supabaseServer.ts`).
- Enforce TypeScript strictness: avoid implicit `any`; type Supabase responses explicitly.
- Some directories (e.g. `scraper/`) run Node scripts with their own `package.json`; isolate changes there.
- Avoid referencing Supabase client during SSR; call getters inside React hooks/effects or component bodies marked `"use client"`.
