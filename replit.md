# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### PaintLab Website (`artifacts/paintlab`)
- React + Vite single-page commercial paint systems marketing website
- Deployed at `/` (root path)
- Dark industrial theme with safety orange (#FF6600) accent
- Mobile-responsive with hamburger nav
- Sections: Hero, About/Trust, Services, Sectors (9 industries), Approach (3 pillars), Why PaintLab, Contact/Quote form (`id="quote"`), Footer
- Uses framer-motion for scroll animations
- AI-generated images in `public/images/`
- Subscription calculator with facility-specific pricing at `/subscription-lab` (query params) or `/subscriptions/:slug` (SEO slugs)
- SEO: structured data (LocalBusiness + Service), OG/Twitter cards, geo meta, canonical, hero preload in `index.html`
- `public/sitemap.xml`, `public/robots.txt`, `public/llms.txt` present
- All "Get a Quote" CTAs go to `/#quote` (Command Your Outcome contact section)
- Contact: (512) 484-3124 | hello@paintlabpro.com | Scott direct: scott@paintlabpro.com
- Slug routing: subscription-portal navigates to `/subscriptions/[keyword-slug]`; slugs resolve via `SLUG_TO_FACILITY` map in `subscription-lab.tsx`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
