@AGENTS.md

# Formr Living — personal home-renovation dashboard

Personal DIY renovation app for Allison (River & Roost). Visual dashboard of projects; click a project for its full binder (overview, measurements, decisions/questions, materials, cut list, build plan, image gallery). AI assistant creates + builds out projects; per-project AI mockup images.

## Stack
Next.js 16 (App Router) · React 19 · Tailwind v4 (CSS-first `@theme` in `app/globals.css`) · Supabase (Postgres + Storage) · OpenAI (chat + image mockups). Deploy target: Railway.

## Run locally
1. `npm install`
2. Create `.env.local` in the repo root (it is gitignored — NOT in the repo). Vars:
   `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL` (gpt-4o), `APP_PASSWORD` (blank = open locally).
   Supabase values come from the **bills-dashboard** project → Settings → API. OpenAI key from your account.
3. `npm run dev` → http://localhost:3000
Without Supabase env it runs in **preview mode** on bundled sample data (`lib/sampleData.ts`); with it, it's **live**.

## Data
Supabase project **bills-dashboard** (org "Personal Projects"). Tables live in an isolated **`formr` schema** — the client sets `db.schema = 'formr'` (see `lib/supabase.ts`). Public **`mockups`** storage bucket holds cover/gallery images. Schema DDL: `supabase/schema.sql`. Both devices share this one cloud DB, so data stays in sync automatically.

## Map
- `app/page.tsx` dashboard · `app/projects/[id]/page.tsx` detail
- `components/`: FeaturedProject, ProjectCard, ProjectsView, ChatDock, HeroImage, Gallery, SectionCard, StatusPill, BudgetBar, Header
- `lib/`: data.ts (Supabase-or-sample fallback), supabase.ts, mutations.ts, types.ts, sampleData.ts, format.ts
- `app/api/`: chat (OpenAI tool-calling), mockup (image gen — uses uploaded reference images for image-to-image when present, else text-to-image), migrate (one-time seed, `?key=` guarded — remove before public deploy), login
- `proxy.ts` — password gate via `APP_PASSWORD`

## Conventions (Next 16 — differs from older docs)
`proxy.ts` not `middleware.ts`; `await params`; global `PageProps<'/route'>` / `RouteContext` types; route handlers `export async function GET/POST`. Design language: **modern English cottage** — warm cream, sage, natural oak; Fraunces serif headings, clean sans body; flat ivory cards, hairline borders.

## Next steps
Deploy to Railway; v2 = material price-search agents (cheapest-across-retailers + a Lowe's list).
