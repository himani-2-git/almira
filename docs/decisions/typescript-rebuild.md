# Almira: TypeScript rebuild for phone and desktop

Historical decision record. See the [current README](../../README.md) and [roadmap](../roadmap.md) for the latest implementation status.

_Decision record, 30 September 2026. The responsive TypeScript app is now in `almira-web/`. The extracted PHP project was retired after preserving it in `archive/almira-php-2025.zip` for reference and possible data import._

The current staged work, including the AI stylist and Today in Style feed, is in [the execution plan](../roadmap.md).

## Recommended stack

Build one responsive **Progressive Web App** with **TypeScript, React and Vite**. It should work in phone and desktop browsers and be installable where supported. Use **Supabase Auth, Postgres and Storage** for accounts, private wardrobes, photos and cross-device sync. Call AI through a server-side function so keys never reach the browser. If app-store distribution becomes important, assess **Capacitor** after the web experience works; it supports web, Android and iOS.

This avoids translating dated PHP templates line by line. A PWA gives us one interface to design and test across screen sizes. TypeScript helps catch data-shape mistakes, while React components let the Today card, garment card, outfit board and navigation share a design system. Vite has an official React/TypeScript starter. Supabase provides Auth and database Row Level Security to protect each user's rows. No PHP setup is needed.

**Trade-off:** a PWA is web-first. App-store release and some device-specific features need a packaging and testing pass. Supabase requires a project/account for sync; a local demo can work before that connection, but browser-only data does not sync between devices.

Sources: [Vite](https://vite.dev/guide/), [PWA installability](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [Supabase React auth](https://supabase.com/docs/guides/auth/quickstarts/react), [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup).

## What carries over

| Legacy idea | New version |
| --- | --- |
| Wardrobe item fields and photos | Import valid records into a clean `garments` table and private photo storage after reviewing any real data. |
| Add item, wardrobe, outfits and wear log | Rebuild the central daily loop with editing, ownership checks and clear empty/error states. |
| Search and analytics | Retain useful filters and cost-per-wear, with verified calculations from consistent data. |
| AI chat and trends | Replace with wardrobe-aware actions and sourced inspiration; discard random scores and old content presented as live. |
| Gradient/glass UI | Build a fresh "little wardrobe studio" design system, retaining only motifs that make the app feel charming. |
| Demo login and public setup scripts | Do not port. Use proper auth, migrations and private-data policies from the start. |

## Screens and responsive behavior

- **Today:** outfit options from owned clothes, occasion/weather/comfort controls, save, swap and mark worn.
- **Closet:** camera/upload, proposed tags with user correction, categories, search, favorites and item editing.
- **Looks:** visual outfit board, saved looks, calendar and wear history.
- **You:** preferences, optional cultural and comfort settings, privacy, export and account controls.
- **Remix this:** pick a neglected garment and receive three combinations using actual wardrobe item IDs.

The current app uses five-item bottom navigation on phones and a top navigation on desktops. It has large touch targets, a photo upload flow and cards that reflow from one column to a grid. Components and data stay shared across screen sizes. Before launch, check additional narrow widths, keyboard navigation and reduced-motion behavior.

## Data and AI

Core tables: `garments`, `outfits`, `outfit_garments`, `wear_events`, `preferences`, and later `suggestion_feedback`. Each private row has an owner ID. Photos go in private storage. Enable and test Row Level Security for every exposed table and storage bucket; one user must not see or change another user's data. Keep AI suggestions separate from saved outfits until accepted.

AI sequence: optional photo tags -> rule-filtered outfit candidates -> model ranking and explanation using structured item IDs -> feedback and personalization. Validate every item ID and user constraint after model output. Keep API secrets server-side, rate-limit calls, cache repeated results and provide a rule-based fallback. Label general ideas separately from recommendations using the user's clothes.

## Milestones

| Milestone | Deliverable | Done when |
| --- | --- | --- |
| 1. Responsive prototype | New `almira-web/` Vite/React/TypeScript app with Today, Wardrobe, Outfits, Insights and Settings, design tokens and PWA shell. | Phone and desktop layouts are usable; production build passes; complete accessibility review before launch. |
| 2. Real wardrobe | Supabase project, auth, RLS, private photos, garment CRUD, search and import of valid legacy items if needed. | Two-account isolation passes; a garment added on phone appears on desktop. |
| 3. Daily loop | Outfit builder, scheduling, wear diary and accurate insights. | A user creates a look, logs wearing it and sees correct wear count and cost-per-wear. |
| 4. Useful AI | Editable photo tags, three owned-item options, swaps, feedback and graceful failure. | Suggested IDs exist and belong to the user; suggestions can be saved and worn. |
| 5. Pilot | Remix, shopping check, polish, offline behavior and user feedback. | Users complete the daily loop unaided and find useful ways to rewear an owned item. |

## Current status and next implementation step

The responsive shell, local wardrobe CRUD, outfit builder, wear log, basic insights, quick remix, backup import/export, and installable app assets are implemented in `almira-web/`. Desktop and 390 px phone browser layouts have been reviewed; TypeScript and the production build pass. Data currently lives in the local browser's IndexedDB, so it does not sync between devices. Scheduling, cost-per-wear and generative AI remain planned.

Next, add Supabase Auth, private image storage, per-user tables and Row Level Security. After two-account isolation and cross-device sync are verified, build AI suggestions from real wardrobe IDs. The archived PHP source and uploaded images can be imported if their records are needed.
