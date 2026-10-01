# Almira execution plan

_30 September 2026 · Working plan for the React/TypeScript rebuild_

## Product goal

Make Almira a delightful wardrobe companion on phone and desktop: people add clothes they own, create and wear looks, discover timely fashion stories, and adapt those stories to their own closet. Preserve the original purple gradients, glass cards, Playfair headings, and floating fashion doodles. Keep the interface playful and calm; the clothes and editorial photos should be the focus.

## Requirements confirmed on 1 October 2026

This is a **student project with a ₹0 service budget**. Use free tiers and local tools, respect their quotas, and fall back when an allowance is exhausted. Almira is **unisex**: every garment category and style is available to everyone. Profile setup, editable preferences and private, user-controlled style memory are foundational to personalization. Editorial images must pass relevance, provenance, rights and quality checks before publication; random photos are never a fallback.

The confirmed launch goal is a **public web app for the student's resume/portfolio**. Coverage is India + Global in English: everyday fashion, street style, runway, red carpet, traditional and Indo-western/fusion. Prioritize practical adaptations using clothes each person owns. The full feed uses Pinterest-like image cards with sources, tags, likes and saved posts. Add the optional, editable Fashion Preference field with exactly Womenswear, Menswear, Unisex, Mix of all, and Prefer not to say; account creation must not require it. Styles, colors, brands, lifestyle and wardrobe feedback also guide ranking.

The [product requirements](product-requirements.md) define profile fields, memory controls, free-quota routing and image gates. Local profiles and confirmed memory are implemented; deployed cloud verification, feedback learning, shared budgets and live imagery remain open.

## Current baseline

- **Done:** the PHP source and uploaded images are recoverable from `archive/almira-php-2025.zip`; the extracted PHP project was removed.
- **Done:** `almira-web/` runs as a responsive React/TypeScript PWA with Today, Wardrobe, Outfits, Insights, and Settings. Add/edit/search/favorite/delete garments, upload photos, save outfits, log wears, see basic insights, export/import a backup, and use the rule-based Quick remix.
- **Done locally:** optional four-section profile, editable confirmed memories, opt-out, version 2 backups and color-aware quick styling. Supabase email/password account UI uses separate guest/account device stores and prepares manual cloud profile Save/Load.
- **Verified:** 22 tests, both TypeScript checks and production build pass. Responsive layouts and core local flows were checked in a browser. Supabase Auth responds successfully with the user's public configuration.
- **Current limits:** wardrobe/outfit data stays in each browser's IndexedDB. The database setup is applied; the Edge Function is not deployed and signed-in cloud profiles remain unverified. There is no wardrobe device sync, live article feed or generative AI call. Quick remix remains a rule-based helper.

## The experience we are building

`Set up your style (optional) → add a piece → get editable photo tags → ask “Style me” → save or swap a look → log wearing it → see rewear insights`

On Today, a second path is `Today in Style → read a sourced story → “Wear this trend” → see looks from owned pieces`. AI suggestions are drafts until a person saves them. Every fashion story shows its publisher and date.

## Build order and completion gates

| Stage | Work | Completion gate |
| --- | --- | --- |
| **1. UI and product foundation** | Preserve the existing welcome screen; shorten the Today hero on phones; establish reusable cards, buttons, tags, image crops, empty states, loading states, and error states. Add a “Style me” entry point and a Today in Style preview with clearly marked design fixtures. Keep the five phone navigation items; use “See all” within Today for the full trends view. | The main tasks work at 320, 390, 768, and desktop widths; keyboard navigation, focus, text contrast, reduced motion, and image fallbacks are checked. No fixture is presented as current news. |
| **2. Profiles, accounts and safe sync** | Build skippable style setup and editable preferences locally first. Set up Supabase Free Auth, database migrations, private photo storage, and per-user Row Level Security. Extend preferences and add private style memory/feedback with edit, reset and export controls. Model garments, outfits, outfit items and wear events. Migrate a signed-in user's IndexedDB data after exporting a backup; deduplicate uploads and make migration resumable. | A profile can be skipped, saved and corrected without losing the wardrobe. Two test accounts cannot read or change each other's profile, memories, records or photos. An item added on a phone appears on desktop; an existing local wardrobe survives migration. |
| **3. Complete the daily wardrobe loop** | Improve filters and garment editing; add outfit editing, planned wear dates, a wear diary, and accurate category/rewear/cost-per-wear insights. Add explicit style feedback and confirmed memory updates. | A person can add a piece, build a look, schedule it, log it, and see counts and cost-per-wear update consistently on both devices. Feedback learning can be disabled; memory reset removes the learning signals that could recreate it. |
| **4. AI stylist within free allowances** | Extend the server-side Groq endpoint to retrieve relevant profile/memory context. Start with “Style me”: occasion and optional constraints in, up to three looks using owned garment IDs out, each with a brief reason and swap/save/wore-it actions. Add shared request/token budgets, private caching, provider cooldowns and a rule-based fallback. Multiple keys must share the correct organization/project quota scopes. Then add optional photo tagging, always editable before saving. | The server rejects invented or foreign garment IDs, unavailable items, and broken output. Explicit preferences take priority over inferred tastes; unknown garment attributes are flagged. No Groq key is shipped to the browser. Concurrent calls respect shared free quotas; exhausted AI capacity retains quick styling. |
| **5. Today in Style** | Build one small daily article digest from an approved source list, then rank it for each user's preferences. Gather candidate stories and metadata, verify source URLs and publication/event dates, deduplicate, and use Groq to tag and summarize once per story version. Accept a photo only after documented rights/credit, genuine relevance, native resolution, sharpness/artifact and crop checks. Add a review queue, source/date labels, and “Wear this trend” passing tags to the stylist. | Every card links to its source, shows a true date and approved image/credit, and has a working wardrobe-based action. Low-quality/unrelated/ambiguous images remain unpublished. Failed refreshes retain the last verified digest with its timestamp; no unverified story is labeled “today.” |
| **6. Pilot and release** | Test privacy, accessibility, phone/desktop behavior, slow networks, empty wardrobes, model errors, prompt injection in articles, offline behavior, and image failures. Run a small pilot, fix the confusing flows, then deploy the PWA with monitoring, backups, and a refresh-job alert. | Pilot users can complete the daily loop unaided. Cross-account isolation and article provenance tests pass. The deployed app can recover from a failed trend or AI request. |

Stages 1–3 form the reliable product. Stage 4 gives it a personal stylist. Stage 5 adds the editorial discovery loop. The trend UI can be designed during Stage 1; it stays clearly labeled as a fixture until Stage 5 supplies verified stories.

## AI implementation details

- **Stylist input:** garment IDs and useful metadata, wear counts, occasion, explicit user preferences, a small relevant set of confirmed memories, request constraints, and optional trend tags. Retrieve private context using the authenticated user. Send only the data needed for that request. Send a wardrobe photo to vision only when the user requests photo tagging.
- **Stylist output:** three structured look drafts with `itemIds`, a title, a short explanation, and optional swap suggestions. Validate IDs, ownership, category mix, and user constraints in server code before displaying anything. The model never saves a look directly.
- **Service boundary:** React calls an authenticated server function; the function reads the user's authorized profile/memory and wardrobe, reserves shared request/token capacity, calls Groq with a server-held key, then returns validated drafts. Cache personal results only within the owning user's scope and invalidate on profile/memory/wardrobe edits. Honor provider cooldowns and keep a deterministic fallback. Additional keys do not expand the organization quota.
- **Photo tags:** vision suggests category, colors, garment type, season, and occasions. Show suggestions as editable chips; do not silently overwrite user-entered details.
- **Quality:** maintain a small evaluation set with sparse wardrobes, unusual garments, cultural outfits, conflicting constraints, and adversarial article text. Measure invalid-ID rate, useful-look feedback, latency, and cost before widening access.

## Trends pipeline and editorial rules

1. Start with a short approved list of publisher feeds/APIs and event sources. Groq browser search can supplement discovery; its output is a candidate, not publication proof. The old `groq/compound` IDs were retired on 21 September 2026, so use currently supported search models.
2. Fetch the original article metadata. Store canonical URL, publisher, title, `published_at`, `event_at` when known, retrieval time, region, and evidence for each tag. Deduplicate syndicated copies and exclude inaccessible or ambiguous stories.
3. Use a separate Groq call to produce short summaries and labels such as Runway, Red Carpet, Street Style, Color, Silhouette, Sustainable, and Local/Global. Validate the returned fields and facts against the source. Groq browser search cannot be combined with Structured Outputs in one call.
4. Select a shared digest by freshness, source reliability and visual quality; personalize its ordering using the user's stated tastes, relevant memories, region and wardrobe. Include a controlled discovery portion. A human reviews early digests and any low-confidence item. Publish a small daily digest and cache its labels/summaries to preserve free allowances.
5. Use authorized event/editorial photos with source and photographer credit. A linked article alone does not grant image reuse. Apply the relevance, resolution, technical quality, duplication and crop gates in [the product requirements](product-requirements.md). If a permitted high-quality photo is unavailable, omit the photo card or use an explicitly labeled original illustration/text treatment. Never insert a random stock photo or present a generated image as event photography.
6. On Today, retain a small preview leading to “See all.” Build the full feed as a Pinterest-like responsive grid with approved photos, dates/source links, tag chips, like/save controls and “Wear this with mine.” Keep reading/keyboard order predictable and photo crops useful at every width. Do not add a sixth bottom-navigation item.

## Data and operations

- **Private data:** `profiles/preferences`, `style_memories`, `garments`, `outfits`, `outfit_items`, `wear_events`, `suggestion_feedback`, `trend_feedback`, and private garment photos. Use database and Storage policies keyed to the signed-in user. Keep service credentials only on the server. Local profile/memory correction, opt-out, reset and export are implemented. The second migration prepares private memories and profile revisions; trend feedback and cloud deletion/retention verification remain planned.
- **Public editorial data:** `sources`, `articles`, `article_images` with rights/credit metadata, `trend_tags`, `digest_items`, and `refresh_runs`. Only approved digest items are public. Give each refresh a status so a failed job does not silently look fresh.
- **Offline behavior:** retain the installable shell and locally cached wardrobe for reading; define how edits queue or explain when a network connection is required. AI and fresh stories require a connection. Keep backup export available.
- **Operational controls:** scheduled refresh, atomic shared request/token budgets, user limits, source allowlist, image checks, bounded retries, provider cooldowns and stale-digest monitoring. Keep usage within free database/storage/egress/function and AI allowances; pause optional jobs when capacity is low. Preserve article provenance and evaluation results without logging private profile/prompts.

## Decisions and external inputs before connected features

The user has configured public Supabase values locally and reports saving the Groq secret in Supabase. Auth is reachable; database/function deployment is pending. The combined `almira-web/supabase/setup.sql` is ready for the new project's SQL Editor. Public signup also needs a compatible free email/OAuth setup. Connected work still needs a hosting destination and permitted article/image ingestion routes. India + Global, English and practical wardrobe-first coverage are confirmed. Region remains editable per user. The initial reading/discovery shortlist is recorded in [the product requirements](product-requirements.md); no publisher photo is approved merely by being on that list.

## First implementation slice

1. Refactor the current Today screen into reusable sections and shorten its phone hero while preserving the original visual language.
2. Add the Today in Style card layout and “Style me” controls with clearly labeled local fixtures; no claims of live content.
3. Build the local profile setup and editable preferences, then add cloud profile/memory schema and auth behind the wardrobe UI and migrate local data safely.
4. Connect the first Groq-backed stylist request with profile/memory context and shared free quotas, validate up to three owned-item results, and keep Quick remix as fallback.
5. Connect and review the first real digest from approved sources with permitted images passing the quality gates, personalize its ordering, then turn on the daily refresh.

### Implementation progress · 1 October 2026

- **Implemented locally:** reusable Today sections, a shorter phone hero, Style me controls and wardrobe-based suggestions with save/wear actions, Today in Style sample cards, story details and category filters. Original purple/glass/doodle styling remains. The preview is explicitly labeled as sample content.
- **New local profile slice:** four skippable sections with the exact optional Fashion Preference choices; colors/comfort, routine/climate, exploration and a fashion perspective. Confirmed memories can be added, scoped, edited, forgotten and reset. Personalization can be paused. Backups include profiles/memories and retain old-format compatibility. The feedback-learning toggle is stored for the future feed; no automatic learning runs yet.
- **User guide:** Settings → How to use Almira explains the first-use flow, wardrobe, preferences, confirmed memories, styling, outfits, wears, accounts, backups, preview stories and troubleshooting. The shareable `docs/user-guide.md` is generated from the same content; both distinguish local features from pending sync/AI/live coverage.
- **Account integration:** configured Supabase Auth SDK, email/password UI, account-scoped device data, explicit guest wardrobe copy and export before sign-out. Manual cloud profile Save/Load uses expected revisions to protect against overwriting another device's changes. These cloud paths need the database and real tests.
- **Prepared backend:** private wardrobe/photo policies, structured profile and confirmed-memory migration/RPCs, 10/hour/user quota, and authenticated Groq handler. The handler retrieves relevant own memory, excludes identity from model context, honors opt-out and rejects explicit color conflicts. Shared organization/token budgets and cache/cooldown routing are still required. See [connected setup](setup.md).
- **Verified locally:** all 22 profile/suggestion/server tests, frontend and backend TypeScript checks, and production build pass. Earlier browser checks covered 320, 390, 768 and 1280 px styling/feed flows. New profile checks cover narrow phones, memory drafts/editing, cancellation and keyboard focus; the existing two-piece wardrobe and saved look remain intact. The earlier chunk-size warning is resolved by separating the Supabase client and app bundles; full mobile performance review remains planned. Real PostgreSQL migrations, two-account RLS, cloud conflicts, full accessibility and offline audit remain unverified.
- **Still required:** database/function deployment, actual cloud profile isolation/device tests, wardrobe sync and resumable migration, public signup email/OAuth configuration, shared free-quota routing/caching/fallback, real Groq tests, photo tagging, the expanded daily loop and an approved live trend/image pipeline.
- **Connection update:** public local Supabase configuration passed Auth HTTP 200; preferences and the Edge Function returned missing-resource HTTP 404. The user reports saving the Groq secret; the agent has not made a live model request or backend deployment. All cloud and live-content completion gates remain open.
- **Database setup update:** the user ran the combined SQL successfully. The preferences API now denies anonymous access (HTTP 401 / `42501`) instead of reporting a missing table. Signed-in profile Save/Load and two-account isolation are the next verification gate. Auth remains reachable; the AI function is still undeployed.

## Technical references checked on 30 September 2026

- [Supabase Auth with React](https://supabase.com/docs/guides/auth/quickstarts/react), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [private Storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals), and [scheduled Edge Functions](https://supabase.com/docs/guides/functions/schedule-functions).
- [Groq browser search](https://console.groq.com/docs/tool-use/built-in-tools/browser-search), [vision](https://console.groq.com/docs/vision), [structured output limitations](https://console.groq.com/docs/structured-outputs), and [model deprecations](https://console.groq.com/docs/deprecations).
- [Creative Commons reuse guidance](https://creativecommons.org/reusing-cc-licensed-content/) for one possible source of licensed imagery; each image's individual terms still need checking.

Additional free-resource checks on 1 October 2026: [Groq Projects and organization ceilings](https://console.groq.com/docs/projects), [Groq rate limits and retry headers](https://console.groq.com/docs/rate-limits), [Groq data controls](https://console.groq.com/docs/your-data), and [Supabase plans](https://supabase.com/pricing).
