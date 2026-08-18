# Cloudflare deployment

The site is a static single-page application served by Cloudflare Pages. It has no Worker script, database, AI model, or per-search service call.

Production: <https://iconsax-search.pages.dev>

## Local release

Use the Node.js version in `.nvmrc`, install the locked dependencies, and authenticate Wrangler once:

```sh
npm ci
npx wrangler login
npx wrangler pages project create iconsax-search --production-branch main # first deployment only
npm run deploy
```

The deploy script runs a production build, then Wrangler reads `wrangler.jsonc`, uploads `dist`, and publishes the Pages project named `iconsax-search`. Cloudflare Pages serves `index.html` as the SPA fallback when no top-level `404.html` is present.

Before sharing a release, open the URL printed by Wrangler and verify:

- `/` returns `200` and the expected release.
- a non-asset client-side path returns the SPA shell.
- an existing hashed file under `/assets/` has an immutable one-year browser cache header.
- HTML revalidates and includes the security headers defined in `public/_headers`.

## GitHub Actions

For a manually triggered Actions deployment, add these secrets to the GitHub repository:

- `CLOUDFLARE_API_TOKEN`: a scoped token with Cloudflare Pages write access.
- `CLOUDFLARE_ACCOUNT_ID`: the target Cloudflare account ID.

Prefer a dedicated token limited to the deployment account. Do not commit either value. The local OAuth session used by `wrangler login` is separate from GitHub Actions.

## Rollback

Use the Pages deployment history to roll back to a known-good version, or deploy a known-good Git commit with the same command above. Because all assets are content-hashed, a rollback does not require a cache purge.

## Optional custom domain

The generated `iconsax-search.pages.dev` address is the default production URL. A custom domain can be added later in the Pages project settings without changing application code. Keep the `pages.dev` address enabled until DNS and TLS are verified on the custom domain.
