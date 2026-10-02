# AGENTS.md

ragforge: end-to-end RAG platform (early development). Three parts exist: the landing site (`site/`), the signed-in web app (`web/`), and the API (`backend/`). Retrieval and generation are not built yet.

## Commands
- `site/`: `npm install` · `npm run dev` (http://localhost:4321) · `npm run build`
- `web/`: `npm install` · `npm run dev` (http://localhost:3000) · `npm run lint` · `npm run build`
- `backend/`: `uv sync` · `uv run uvicorn app.main:app --reload --env-file .env` (http://localhost:8000) · `uv run pytest`
- Builds and tests for every part you touched must pass before finishing.

## Conventions
- `site/`: Astro 5 + Tailwind 3, static output only; no client frameworks, minimal inline `<script>`.
- Site-wide config (links, email, login URL) lives only in `site/src/data/site.ts`; never hardcode it.
- One section per component in `site/src/components/`; pages in `site/src/pages/`. Use cross-page anchors as `/#section`.
- `web/`: Next.js 16 (App Router, `src/proxy.ts` instead of middleware) + Tailwind 4 + Supabase Auth via `@supabase/ssr`. Read `web/AGENTS.md` and the bundled Next.js docs before changing it.
- `web/` config comes from env vars read in `web/src/lib/config.ts`; secrets go in `web/.env.local`, never in git.
- Database changes go in `web/supabase/migrations/` and every table needs row-level security.
- `backend/`: FastAPI, Python 3.12+, managed with uv. Every `/v1` route verifies the Supabase access token via `current_user`.
- Design tokens (shared by `site/` and `web/`): `green` #b9ff66, `dark` #191a23, `gray` #f3f3f3, `.card` (45px radius + offset shadow), `.greenhead`, `.btn-primary`/`.btn-secondary`.
- Placeholder responses must be labelled as placeholders. Don't present planned features as shipped; keep README roadmap in sync with reality.
- Never add third-party template credits or attributions to the site.
- Contact: arunk7033@gmail.com (sole maintainer). License: Apache 2.0.
