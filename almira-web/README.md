# Almira web

A responsive TypeScript/React rebuild of Almira. It keeps the original purple gradient, glass-card landing screen and fashion doodles, and adds a functional local wardrobe, outfits, wear log, insights, backup export/import and installable web-app shell.

## Run locally

Use Node.js 24 (22.18+ supported) and pnpm 11.19.0.

```bash
pnpm install
pnpm dev
```

Open the local address shown by Vite. For a production build, run `pnpm build` and `pnpm preview`.

## What works now

- Open the user guide in Settings → How to use Almira, or read [the guide file](../docs/user-guide.md).
- Add, edit, search, favorite, delete and photograph wardrobe items.
- Build and save outfits; log a garment or saved look as worn.
- See basic insights and quick remixes from owned items.
- Use Style me with occasion, mood and a starting piece; save or log a suggested combination.
- Explore Today in Style sample stories, filters and wardrobe inspiration actions.
- Set up optional style preferences, including Fashion Preference, colors, comfort, lifestyle and a fashion perspective.
- Add/edit/forget confirmed memories by occasion; pause personalization. Quick styling uses supported color metadata.
- Sign in/create an account through Supabase; keep guest and account device data separate. Manual cloud profile Save/Load requires the prepared database setup.
- Export/import wardrobe, profile and memories as version 2 JSON; older wardrobe backups remain compatible.
- Responsive phone and desktop layout; installable PWA shell with basic offline caching.

Data is currently stored in this browser's IndexedDB. It does **not** sync between devices yet. Use Settings → Export backup before clearing browser data or changing devices. Style me and Quick remix use deterministic combinations; live generative AI is not connected. Today in Style is a labeled design preview with original illustrations, not current fashion news.

Backend migrations and Groq function files are prepared in `supabase/`. The user has applied the combined SQL, and Supabase Auth is reachable. Follow [connected setup](../docs/setup.md) for remaining verification and server deployment. Profile sync has conflict protection but needs signed-in live verification; the AI function is still undeployed. Feedback learning, wardrobe sync, shared AI budgets and the live feed remain in [the execution plan](../docs/roadmap.md).

Run `pnpm test` with Node.js 22.18+ to run the 27 profile, styling, mocked server-handler and service-worker regression tests. `pnpm exec tsc --noEmit -p tsconfig.backend.json` checks the shared/server modules; it does not replace deployed database or Edge runtime tests. `node scripts/check-connection.mjs` checks public connection/resource status without printing credentials. `node scripts/prepare-sql.mjs` regenerates the combined SQL.

The original PHP code was retired after this UI replacement. The owner retains a local recovery archive outside Git; personal legacy images are not published in this repository.

The in-app and Markdown user guides share `src/help.ts`. After changing its content, run `node scripts/prepare-guide.mjs` to update the guide file.
