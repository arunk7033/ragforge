# CLAUDE.md

ragforge is an end-to-end RAG platform in early development; only the Astro website in `site/` exists.

## Workflow
- Work in `site/`: `npm run dev` to preview, `npm run build` to verify. Build must pass before you finish.
- Keep changes small and match the surrounding code style; avoid new dependencies unless asked.

## Rules
- Config (links, contact email, `authEndpoint`) belongs in `site/src/data/site.ts` only.
- Reuse Tailwind tokens (`green`, `dark`, `gray`) and classes (`.card`, `.greenhead`, `.btn-primary`); no ad-hoc colors.
- Static site only: no server code, no React/Vue, minimal inline scripts.
- Login is UI-only until `authEndpoint` is set; don't fake authentication.
- Never claim unbuilt features exist; update the README roadmap when shipping something.
- No third-party template attributions on the site.

See `AGENTS.md` for shared conventions. Maintainer: arunk7033@gmail.com.
