# Almira

**Your style, organized.**

[![Checks](https://github.com/himani-2-git/almira/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/himani-2-git/almira/actions/workflows/ci.yml)

Almira is a unisex wardrobe companion that helps you organize the clothes you own, build outfits and discover fresh combinations. Its interface brings together soft purple gradients, playful illustrations and layouts for phone and desktop.

![Almira interface](.github/assets/preview.jpg)

## Features

- **Digital wardrobe:** add photos, edit items, browse categories, search and mark favorites.
- **Outfit builder:** combine owned pieces and save looks for different occasions.
- **Quick styling:** find combinations using local rules, occasions and color preferences.
- **Style profile:** manage optional preferences and fashion memories you explicitly confirm.
- **Wear insights:** log outfits and rediscover pieces ready for another wear.
- **Backups and guidance:** export/import your collection and explore the built-in user guide.

## Technology

| Layer | Tools |
| --- | --- |
| Interface | React, TypeScript, CSS, Lucide icons |
| Development and builds | Vite, pnpm |
| Device storage | IndexedDB |
| Backend foundation | Supabase Auth, PostgreSQL, Row Level Security |
| AI integration in development | Groq through a Supabase Edge Function |
| Verification | Node.js test runner, TypeScript, GitHub Actions |

## Getting started

Install **Node.js 24** and **pnpm 11.19.0**, then run:

```bash
git clone https://github.com/himani-2-git/almira.git
cd almira/almira-web
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite. The guest experience runs without an account or API keys. In the app, **Settings → How to use Almira** explains the main flows.

## Development status

The current version stores clothes, photos, outfits and wear history in the browser. Styling uses local combinations, and the fashion feed contains clearly labeled illustrated previews.

Supabase authentication and manual profile saving/loading are implemented and awaiting live account verification. Full wardrobe synchronization, Groq styling and sourced fashion coverage are upcoming integrations.

## Configuration

For account development, copy [almira-web/.env.example](almira-web/.env.example) to `.env.local` in the same directory and enter your own public Supabase settings. Restart Vite after changing them.

Database migrations and server-function code are in [almira-web/supabase](almira-web/supabase). Groq credentials belong in server configuration, as shown in the [server environment example](almira-web/supabase/functions/.env.example).

## Checks and production build

From `almira-web`:

```bash
pnpm check
pnpm build
pnpm preview
```

Checks cover styling, profile validation, server authentication and ownership, and service-worker updates. The production build is written to `almira-web/dist`.

## Deployment

Cloudflare Workers can serve the built app using [almira-web/wrangler.json](almira-web/wrangler.json). For a Git-connected Worker named `almira`, use:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | `almira-web` |
| Build command | `pnpm check && pnpm build` |
| Deploy command | `npx wrangler deploy` |
| Build variable `NODE_VERSION` | `24` |
| Build variable `PNPM_VERSION` | `11.19.0` |

Cloudflare Pages is also supported with the same root directory, build command and build variables; its output directory is `dist`.

Account services and server functions require their own configuration and deployment. Public Supabase settings must be set as build variables; private server credentials must never be included in frontend builds.

## Feedback

Found a bug? Use the [bug report form](https://github.com/himani-2-git/almira/issues/new/choose) and include steps to reproduce it, your device/browser and the expected result.
