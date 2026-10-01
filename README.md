# Almira

A responsive, unisex wardrobe app built with React, TypeScript and Vite. Organize your clothes, create outfits and rediscover what you already own.

![Almira preview](.github/assets/preview.jpg)

## Features

- Wardrobe photos, search, categories, favorites and editing.
- Outfit building, saved looks, wear tracking and rewear insights.
- Local styling from owned pieces, with occasion and color preferences.
- Optional style profiles and editable, user-confirmed memories.
- Phone and desktop layouts, JSON backups and an in-app guide under **Settings → How to use Almira**.

## Run locally

Use **Node.js 24** and **pnpm 11.19.0**.

```bash
git clone https://github.com/himani-2-git/almira.git
cd almira/almira-web
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. Guest mode works without keys.

```bash
pnpm check    # Tests and frontend/backend TypeScript
pnpm build    # Production build
pnpm preview  # Preview the build
```

## Optional account setup

For a fresh clone, copy `almira-web/.env.example` to `almira-web/.env.local` and enter the public Supabase URL and publishable key. Local secret files are ignored by Git. Restart Vite after changing them.

Database migrations and the prepared `style-me` function are in `almira-web/supabase/`. For a fresh Supabase project, use the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) from `almira-web`:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The owner's existing database setup has already been applied manually. Do not apply those migrations to it a second time. Live account/profile tests are still required.

For future AI deployment, `GROQ_API_KEY`, `GROQ_MODEL` and `ALMIRA_ALLOWED_ORIGINS` belong in Supabase Edge Function secrets. The function's `.env.example` shows the server settings. Groq keys and Supabase secret/service-role keys must never use the browser's `VITE_*` variables.

## Deploy

Use **Cloudflare Pages Free** with GitHub integration. Push the repository to `main`, import it in Cloudflare Pages, and configure:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | `almira-web` |
| Build command | `pnpm check && pnpm build` |
| Output directory | `dist` |
| `NODE_VERSION` | `24` |
| `PNPM_VERSION` | `11.19.0` |

For the first guest pilot, leave `VITE_SUPABASE_*` unset. Share the supplied HTTPS `pages.dev` address. Pushes to `main` rebuild the site; friends should reload after a successful deployment. [Cloudflare deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/)

To enable account testing, add the public Supabase URL/key to the Production build environment and redeploy. Set Supabase Auth's Site URL and redirect allowlist to the exact app URL. Public email signup needs custom SMTP; Supabase's default email service only supports project-team addresses and two emails per hour. A configured OAuth flow is another option. [Email setup](https://supabase.com/docs/guides/auth/auth-smtp)

Supabase migrations and functions deploy separately from the frontend. The prepared AI function still needs shared quota controls and live verification before public use.

## Project structure

```text
.github/          Automated checks, bug form and README preview
almira-web/
  src/            App interface, storage and styling
  public/         App icons, manifest, cache worker and hosting headers
  supabase/       Database migrations and prepared server function
  scripts/        Connection diagnostic
  tests/          Behavior and regression tests
README.md         Setup, deployment and project status
```

## Status and feedback

This is a **testing build**. Guest wardrobe flows work locally. Account UI and manual profile Save/Load are implemented but need signed-in testing. Full wardrobe/photo sync, live Groq styling and sourced fashion coverage remain unfinished; fashion stories are labeled previews.

Report reproducible bugs through the [GitHub bug form](https://github.com/himani-2-git/almira/issues/new/choose). Fix on a branch, run `pnpm check` and `pnpm build`, then open a pull request. Merge to `main` after reviewing checks and the preview. Report exposed credentials or account-isolation problems privately to the repository owner.
