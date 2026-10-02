# AGENTS.md

ragforge: end-to-end RAG platform (early development). Only the website in `site/` exists today.

## Commands (run in `site/`)
- `npm install` · `npm run dev` (http://localhost:4321) · `npm run build` (must pass before finishing)

## Conventions
- Astro 5 + Tailwind 3, static output only; no client frameworks, minimal inline `<script>`.
- Site-wide config (links, email, `authEndpoint`) lives only in `site/src/data/site.ts`; never hardcode it.
- Design tokens: `green` #b9ff66, `dark` #191a23, `gray` #f3f3f3, `.card` (45px radius + offset shadow), `.greenhead`, `.btn-primary`/`.btn-secondary`.
- One section per component in `site/src/components/`; pages in `site/src/pages/`.
- Use cross-page anchors as `/#section`, not `#section`.
- Don't present planned features as shipped; keep README roadmap in sync with reality.
- Never add third-party template credits or attributions to the site.
- Contact: arunk7033@gmail.com (sole maintainer). License: Apache 2.0.
