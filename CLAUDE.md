# CLAUDE.md

ragforge is an end-to-end RAG platform in early development: an Astro landing site (`site/`), a Next.js + Supabase web app (`web/`), and a FastAPI backend (`backend/`) that returns placeholder responses.

## Workflow
- `site/` and `web/`: `npm run dev` to preview, `npm run build` to verify. `backend/`: `uv run pytest`. Everything you touched must pass before you finish.
- Keep changes small and match the surrounding code style; avoid new dependencies unless asked.

## Rules
- Site config (links, contact email, login URL) belongs in `site/src/data/site.ts` only.
- Reuse Tailwind tokens (`green`, `dark`, `gray`) and classes (`.card`, `.greenhead`, `.btn-primary`); no ad-hoc colors.
- `site/` is static only: no server code, no React/Vue, minimal inline scripts. React belongs in `web/`.
- Auth is Supabase (Google OAuth); never fake authentication or commit keys. New tables need row-level security.
- Never claim unbuilt features exist; label placeholder answers as placeholders and update the README roadmap when shipping something.
- No third-party template attributions on the site.

See `AGENTS.md` for shared conventions. Maintainer: arunk7033@gmail.com.