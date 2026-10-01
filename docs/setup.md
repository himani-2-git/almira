# Connect Almira to Supabase and Groq

## What is ready

The app works locally without either account. Today has a shorter phone hero, a Style me sheet with occasion/mood/starting-piece controls, wardrobe-based combinations with save and wear actions, and a Today in Style design preview. Optional My style setup, editable confirmed memories and profile-aware color ranking now work on this device. The purple, glass, serif and doodle design is preserved.

Prepared backend files live in `almira-web/supabase/`:

- A database migration for private garments, outfits, wear history, preferences, feedback and photo storage.
- A second migration for structured profiles, private confirmed memories and transactional profile sync with revision conflict checks.
- Row Level Security policies and ownership-preserving foreign keys.
- A `style-me` Edge Function that authenticates the caller, reads their synced clothes, limits requests to 10 per hour, and calls Groq with a server-held key.
- A shared validator that rejects foreign IDs, repeated pieces, duplicate looks, conflicting categories and missing starting pieces.

**The user has applied the database setup; the AI function is not deployed yet.** Email/password account UI uses the configured Supabase client. Signed-in users have separate device data and manual Save/Load profile controls, which now need real account verification. Wardrobe/outfit cloud sync, resumable migration and the AI client remain to be connected. The current stylist uses local quick styling.

Almira is a unisex student project with a **₹0 service budget**. The [product requirements](product-requirements.md) put profile setup, editable style memory and strict editorial image filtering before personalized release. The new profile/memory schema is prepared; feedback learning, shared organization/token budgets and provider routing remain release work.

Connection check on 1 October 2026: the locally configured public URL/key reached Supabase Auth (HTTP 200). The preferences table and `style-me` function both returned missing-resource responses (HTTP 404). The user reports saving the Groq secret; no real model call has verified it yet. No paid resources or cloud writes were made during these checks.

After the user ran the combined SQL, their dashboard showed `Success. No rows returned`. The public connection check now reaches the private preferences endpoint and receives HTTP 401 / `42501` (anonymous access denied), rather than the earlier missing-table response. Auth still returns HTTP 200. This confirms the endpoint is present and blocks anonymous access; signed-in profile sync and two-account RLS remain unverified. The `style-me` function still returns HTTP 404 and needs deployment.

## 1. Create the projects

1. Create a **Free** project in [Supabase](https://supabase.com/dashboard). Keep the database password in your password manager. Supabase will provide a project URL and publishable key. Review the current [Free plan allowances](https://supabase.com/pricing) for database, photos, egress and functions before sizing the pilot.
2. Use the **Free** plan in [Groq Console](https://console.groq.com/keys) and create a project/API key. Keep the key locally; do not paste it into chat. No paid upgrade or paid fallback is part of this plan.
3. Inspect the actual model limits in Groq Console. Add conservative shared budgets before enabling requests for other people. Keys in the same organization share its ceiling; [Groq project quotas](https://console.groq.com/docs/projects) do not increase that ceiling. Extra keys alone will not supply more free capacity. Use cached results or local styling when capacity is exhausted.

## 2. Configure the database

**For the current project, this step is complete. Do not run the setup file again.** The instructions below are retained for a fresh project.

Export the existing wardrobe from Almira’s Settings first. Open the prepared root file `almira-web/supabase/setup.sql`, copy all its contents, and paste them into **Supabase project → SQL Editor → New query → Run**. Apply it once to the **new** project. This file combines both migrations in one transaction; a failure rolls the transaction back. It creates private tables/policies and does not delete existing data. It is not an upgrade script for a project that already has these tables.

Alternatively, use the Supabase CLI migration workflow below to apply both migrations. Choose one approach so they are not applied twice. Regenerate the combined file after migration edits with `node scripts/prepare-sql.mjs` from `almira-web`.

The migration creates a private `garment-photos` bucket. Store photos at `<user-id>/<garment-id>/<file-name>` and use authenticated downloads or short-lived signed URLs. Photo uploads are limited to JPEG, PNG or WebP and 5 MB. Preserve wear history by soft-deleting garments/outfits using `deleted_at`.

The frontend reads `almira-web/.env.local`: only the project URL and publishable key belong here. These are public configuration; RLS protects the records. Restart Vite after changing the file.

### Exact paste locations for the user's created projects

The user's `almira-web/.env.local` is now filled and its public connection has been checked. For future setup, open Supabase's **Connect** dialog (or Settings → API Keys), then fill these two lines locally:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Keep the variable names and replace the example values. Use the publishable key, not the secret/service-role key or database password. The file is ignored by Git. See [Supabase's key guide](https://supabase.com/docs/guides/getting-started/api-keys).

For Groq, open **Supabase project → Edge Functions → Secrets**, add a secret named `GROQ_API_KEY`, paste the Groq key into its Value, and save. Enter `GROQ_MODEL` and `ALMIRA_ALLOWED_ORIGINS` from the table below on the same page. [Supabase's secret guide](https://supabase.com/docs/guides/functions/secrets) documents this dashboard workflow. Reply with configuration status, not secret values. Public Supabase project URL/publishable configuration may be shared; private credentials stay in the file/dashboard.

## 3. Configure the server function

In Supabase’s Edge Function secrets, enter:

| Name | Value |
| --- | --- |
| `GROQ_API_KEY` | Your Groq API key |
| `GROQ_MODEL` | `openai/gpt-oss-20b` initially; verify availability before deployment |
| `ALMIRA_ALLOWED_ORIGINS` | Exact app origins, separated by commas; initially `http://127.0.0.1:4173,http://localhost:4173,http://127.0.0.1:5173,http://localhost:5173` |

The Supabase runtime supplies its URL and public key dictionary (`SUPABASE_PUBLISHABLE_KEYS`); the handler also supports the legacy anon key. The function uses the caller’s JWT for database requests. Keep JWT verification enabled in `supabase/config.toml`.

Never place the Groq key or a Supabase secret/service-role key in a `VITE_*` variable. Vite ships those variables to the browser. Supabase’s [secret configuration guide](https://supabase.com/docs/guides/functions/secrets) covers server environment variables.

### Optional CLI workflow

From `almira-web`, after installing the official [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started):

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy style-me --project-ref YOUR_PROJECT_REF
```

Use `db push` only if you have not already applied the migrations through SQL Editor. For local Edge Function development, copy `supabase/functions/.env.example` to `.env` and fill it privately. Both local secret files are ignored by Git.

Before public signup, configure a suitable free SMTP service or an approved OAuth flow. Supabase's [default email service](https://supabase.com/docs/guides/auth/auth-smtp) currently sends only to project-team addresses and has a two-email/hour limit. Keep email confirmation enabled. Add the development and eventual production URLs to Auth redirect settings before testing confirmation links.

## 4. Connection and verification work next

Once the projects exist, the next implementation step is to:

1. The prepared SQL is applied. Verify sign-in and profile/memory Save/Load with real accounts. Local My style setup and account UI are implemented; deployed profile sync remains unverified.
2. Export a backup including profile data, migrate records with stable IDs, upload compressed photos and resume failed migrations without duplicating them.
3. Test with two accounts: profiles, memories, feedback, records, linked outfit items, wear events and photos must remain isolated. Device data is separated by account; explicit Export & sign out backs it up and clears that account's cache. Audit expiry/account-change handling and verify the real policies. Check an added item on both phone and desktop after wardrobe sync is implemented.
4. The prepared `style-me` now retrieves authenticated preferences and relevant confirmed memory, honors opt-out and checks explicit color avoidances. Add shared quota/token reservation, bounded garment context, private cache invalidation and cooldown handling. Check the prepared 10/hour/user quota against the real shared free allowance; it is not an organization limit.
5. Call `style-me` only for a signed-in, synced wardrobe; validate drafts again in the browser. On timeout, rate limit or invalid output, offer quick styling. Never rotate keys to retry an exhausted quota scope.
6. Verify the real model response, latency and token usage before enabling AI by default. The shared validator checks structure and ownership; it cannot prove every natural-language preference was followed. Add checks for structured avoidances and identify missing garment information.

The handler’s unit tests use mocked Supabase and Groq responses. They verify auth/ownership boundaries, origin checks, response validation, quotas and fallback errors. They do **not** prove the deployed RLS policies or model quality; those need the real project.

Local verification on 1 October 2026: 22 tests, both TypeScript checks and the production build passed. Profile tests cover bounded fields, optional fashion preferences, relevant memory/opt-out, legacy backup compatibility, account cache keys, color constraints and revision validation. Backend tests include owner-scoped context and the current public-key dictionary. Earlier browser checks covered the local styling/feed flows. New profile/account checks covered 320, 390 and 1280 px without horizontal overflow, draft memory confirmation/editing, Escape cancellation, restored trigger focus and modal Tab wrapping. Signup has only email/password and does not require Fashion Preference. No account was created and no synthetic profile was saved; the existing two garments and saved look remain intact. The production build now separates the Supabase client (214 KB) and app (315 KB), removing the earlier chunk-size warning. A full mobile performance audit remains planned. Real PostgreSQL migrations, RLS isolation, cloud conflicts and model quality still need live verification.

## 5. Activate real fashion stories later

Today in Style currently contains original illustrations and clearly labeled sample stories. No daily job or live reporting is running. To activate it, choose article feeds/event sources and permitted image sources, then build the reviewed digest pipeline described in [the execution plan](roadmap.md).

Each published story needs a verified source, publication date, image permission and credit. Groq can label and summarize gathered stories. Search discovery and structured labeling need separate calls; [Groq Structured Outputs](https://console.groq.com/docs/structured-outputs) does not currently support tool use in the same call. Do not replace preview labels with “live” until this pipeline is verified.

Apply the image gates in [the product requirements](product-requirements.md): real relation to the article/event, native resolution, sharpness/artifacts, safe clothing crops, duplication checks and review. Run cheap checks before vision and cache decisions. Only approved images can become photo cards; rejected candidates never receive random replacement photos. Build one approved digest and personalize its ordering, preserving free AI allowance.

## Local checks

Use Node.js 22.18+ or a newer supported version for the TypeScript-based unit tests:

```powershell
cd almira-web
pnpm test
pnpm build
pnpm exec tsc --noEmit -p tsconfig.backend.json
pnpm dev --port 4173
```

Further references: [Supabase function authentication](https://supabase.com/docs/guides/functions/auth), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access policies](https://supabase.com/docs/guides/storage/security/access-control), and [Groq Quickstart](https://console.groq.com/docs/quickstart).
