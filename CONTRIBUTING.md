# Contributing to Almira

## Report a bug

Open an [issue](https://github.com/himani-2-git/almira/issues/new/choose), choose Bug report, and include the page, steps, expected result, actual result, device/browser and account mode. Use test clothing and crop personal information from screenshots.

## Make a change

1. Create a branch from `main`, for example `fix/wardrobe-upload`.
2. Reproduce the issue, then make the smallest useful fix.
3. From `almira-web`, run `pnpm check` and `pnpm build`. Check the affected flow on phone and desktop if it changes the UI.
4. Push the branch and open a pull request linked to the issue. Review its checks and Cloudflare preview before merging.
5. Merge into `main`. Cloudflare rebuilds the testing site; verify the reported steps on the new deployment before closing the issue.

Builds also run the checks on Cloudflare, so a failed check does not publish a new version. GitHub checks alone do not prevent merging; the owner can require them using branch protection after the first push.

## Project conventions

- Preserve the purple/glass/serif design and five navigation items.
- Keep all garment categories open to everyone; Fashion Preference is optional.
- Use owned garment IDs for styling. Keep AI drafts separate from saved outfits.
- Clearly label preview stories and unfinished cloud/AI features.
- Keep credentials in local ignored configuration or server secrets. Do not commit backups, private garment photos or the PHP recovery archive.
- Update `src/help.ts` when usage changes and run `pnpm docs:generate` to refresh the shared guide and setup SQL.

The [roadmap](docs/roadmap.md) records remaining product work. New tests should cover behavior or a real regression rather than repeat implementation details.
