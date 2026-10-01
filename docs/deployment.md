# Publish Almira for testing

Use **GitHub + Cloudflare Pages Free** for the frontend. Keep the prepared database and AI function in Supabase. This guide uses the existing repository: [himani-2-git/almira](https://github.com/himani-2-git/almira).

## 1. Push the clean project to GitHub

The local repository has been initialized on `main`, and `origin` points to your GitHub repository. No upload has happened yet.

Open a PowerShell terminal in the Almira project folder. This checkout uses the verified GitHub name **Himani** and its GitHub no-reply email for commits, so your personal email is kept private. Git commits do not send emails. For another clone, configure your own name and no-reply address under **GitHub → Settings → Emails**. [GitHub's commit email guide](https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address)

```powershell
cd C:\Users\enhim\projects\almira
git status --short
git push -u origin main
```

The cleanup includes a local initial commit. If `git log -1` shows no commit in another checkout, run `git add .` and `git commit -m "Prepare Almira testing build"` before pushing. Complete GitHub's normal browser login if Git asks. Use Git to upload this folder so `.gitignore` excludes local configuration, dependencies, recovery archives and personal backups. Do not upload the entire folder using a browser drag-and-drop.

After pushing, open GitHub and confirm the source/README are visible and **Actions → Checks** passes. The initial repository was empty when checked; if someone adds commits before this push, fetch and reconcile them instead of forcing a push.

## 2. Create a free Cloudflare Pages project

1. Sign in to [Cloudflare](https://dash.cloudflare.com/) and use its Free plan.
2. Open **Workers & Pages → Create application → Pages → Import an existing Git repository** (the exact wording may vary).
3. Connect GitHub and choose **only the Almira repository** when selecting repository access.
4. Select `himani-2-git/almira` and enter the settings below.

| Setting | Value |
| --- | --- |
| Project name | An available name, such as `almira-himani` |
| Production branch | `main` |
| Framework preset | Vite, or None with the settings below |
| Root directory | `almira-web` |
| Build command | `pnpm check && pnpm build` |
| Build output directory | `dist` |

These directories are relative to the selected root. Pages builds the app and provides an HTTPS `pages.dev` address. [Cloudflare's Vite deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/) and [build settings](https://developers.cloudflare.com/pages/configuration/build-configuration/) describe this flow.

Under build environment variables, add:

| Variable | Value |
| --- | --- |
| `NODE_VERSION` | `24` |
| `PNPM_VERSION` | `11.19.0` |

The repository also records these versions in `almira-web/.node-version` and `package.json`. Pages supports overrides for both tools. [Build image reference](https://developers.cloudflare.com/pages/configuration/build-image/)

For the **first guest testing deployment**, leave the two `VITE_SUPABASE_*` variables unset. Friends can use clothes, outfits, preferences, memories and backups on their own devices while account testing is completed.

Click **Save and Deploy**. When it succeeds, open the provided HTTPS address on a phone and desktop. Share this address with friends; localhost links only work on your computer. A custom domain is optional and not needed for this test.

The current Pages Free plan includes 500 builds/month with one concurrent build; use the Free plan and keep the pilot small. [Current limits](https://developers.cloudflare.com/pages/platform/limits/)

## 3. Enable accounts after the signup flow is verified

For account-enabled builds, add these to Cloudflare's **Production** build environment and redeploy:

| Variable | Paste locally in Cloudflare |
| --- | --- |
| `VITE_SUPABASE_URL` | The Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The public publishable key |

Only these public values belong in the frontend. `GROQ_API_KEY`, database passwords and Supabase secret/service-role keys stay outside frontend hosting. Vite embeds `VITE_*` values in browser code. [Vite environment variables](https://vite.dev/guide/env-and-mode)

In **Supabase → Authentication → URL Configuration**:

- Set **Site URL** to the exact HTTPS testing site URL supplied by Cloudflare.
- Add that exact URL to the redirect allowlist. Keep the localhost origins you use for development.
- Add individual trusted preview URLs only when you need account testing there. Keep ordinary PR previews in guest mode.

Almira's email redirect currently uses the app origin. [Supabase redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls)

Public signup needs a verified email-delivery service with a suitable free allowance or a configured OAuth login such as Google. Supabase's default email service currently restricts delivery to project-team addresses and two emails/hour; ordinary friends cannot rely on it. Email confirmation should remain enabled. Password recovery is also still being connected. [Email delivery requirements](https://supabase.com/docs/guides/auth/auth-smtp)

Before calling account sync ready, test two accounts, confirm one cannot access the other's profile/photos, and verify profile Save/Load on phone and desktop. Full wardrobe/photo/outfit sync is not implemented yet. Use backups to move those records.

## 4. Keep backend deployment separate

Pushing frontend code does **not** apply Supabase migrations or deploy its Edge Function. The owner's database setup is already applied; do not rerun `supabase/setup.sql` on it. For a fresh project, use that setup file once or the migrations workflow in [setup](setup.md).

The `style-me` function is prepared but not deployed or connected to the frontend. Before enabling public AI requests, finish shared free-quota/token budgets, bounded context, caching/cooldowns and live ownership/model tests. The existing 10/hour/user limit does not protect the shared Groq allowance.

When the server is ready, add the exact public app origin to the **Supabase Edge Function secret** `ALMIRA_ALLOWED_ORIGINS`. Keep the Groq key in Supabase secrets. Use the deployment steps in [setup](setup.md) for the function itself.

## 5. Fix bugs through GitHub

1. Ask friends to use the [Bug report form](https://github.com/himani-2-git/almira/issues/new/choose), including steps, expected/actual result, browser/device and guest/account mode. Screenshots should hide personal details.
2. Create a fix branch, reproduce the problem and make the change.
3. Run checks and push the branch:

```powershell
git switch -c fix/wardrobe-upload
cd almira-web
pnpm check
pnpm build
cd ..
git add .
git commit -m "Fix wardrobe upload"
git push -u origin fix/wardrobe-upload
```

4. Open a pull request. Review GitHub's checks and Cloudflare's guest preview link, then merge to `main`.
5. Cloudflare automatically rebuilds `main`; its build command reruns checks and keeps the previous deployment if the new build fails. Wait for success and ask testers to reload the app. Verify the fix before closing the issue. [Git-based deployment and previews](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/)

The service worker refreshes its offline HTML copy on successful online navigation and limits caching to public app assets. IndexedDB wardrobe data survives a frontend update. Friends should still export backups before clearing site data. Previously loaded tabs need a reload to run the new code.

## Pilot checklist

- Add/edit/search a test garment and try a photo upload.
- Build/save an outfit, log a wear and check Insights.
- Save/edit profile preferences and a confirmed memory.
- Export a backup, then test restore using disposable test data.
- Open Settings → How to use Almira on phone and desktop.
- Check a fresh browser and a returning browser after the next deployment.
- Keep AI/live stories/sync clearly marked until their real completion gates pass.
