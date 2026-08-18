# Iconsax Search

[![CI](https://github.com/ohnoah/iconsax-search/actions/workflows/ci.yml/badge.svg)](https://github.com/ohnoah/iconsax-search/actions/workflows/ci.yml)
[![Deploy](https://github.com/ohnoah/iconsax-search/actions/workflows/deploy.yml/badge.svg)](https://github.com/ohnoah/iconsax-search/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An unofficial, fast explorer for the exact version of
[`iconsax-react`](https://www.npmjs.com/package/iconsax-react) installed in this
repository.

**[Open the live explorer](https://iconsax-search.xqf5cypcyy.workers.dev)**

Search happens entirely in the browser. There is no model download, vector
database, backend, tracking request, or per-query cost.

> [!IMPORTANT]
> This community project is not affiliated with or endorsed by Iconsax,
> Vuesax, or the `iconsax-react` maintainers.

## What it does

- Ranks matches across export names, word boundaries, curated aliases,
  categories, and typo-tolerant fuzzy matches.
- Generates the searchable catalog from the installed `iconsax-react` package,
  so the UI and package version cannot silently drift apart.
- Previews every supported Iconsax variant, size, and color.
- Copies component names and ready-to-paste React code.
- Keeps searches and selected icons shareable in the URL.
- Supports keyboard-first navigation and responsive layouts.
- Deploys as static assets on Cloudflare Workers with no runtime service.

## Quick start

Requires Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Vite prints the local URL. Search for a concept such as `delete`, `settings`,
`presentation`, or `menu`, then select an icon to inspect and copy it.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite server. |
| `npm run catalog:generate` | Regenerate searchable metadata from the installed package. |
| `npm run catalog:check` | Fail if committed generated metadata is stale. |
| `npm run test` | Run the search and catalog tests once. |
| `npm run lint` | Run ESLint with zero warnings allowed. |
| `npm run typecheck` | Type-check the application. |
| `npm run build` | Validate the catalog and create the production build in `dist`. |
| `npm run check` | Run every CI check. |
| `npm run deploy:dry-run` | Build and validate the Cloudflare upload without publishing. |
| `npm run deploy` | Build and deploy with Wrangler. |

## Staying in sync with Iconsax

`iconsax-react` is an exact dependency, not a separately maintained icon list.
To update it:

```sh
npm install --save-exact iconsax-react@<version>
npm run catalog:generate
npm run check
```

Review both the lockfile and generated catalog diff. The generator intentionally
preserves upstream export spellings so copied imports match the installed
package. Conceptual synonyms belong in the maintained alias source rather than
the generated output.

## How search works

The build-time generator turns package exports and category metadata into a
small static catalog. At runtime, a deterministic scorer combines exact,
prefix, token, alias, category, and bounded fuzzy matches. The browser searches
the in-memory catalog; it does not call Cloudflare or any AI provider.

This deliberately keeps the first release simple. A future semantic-search
experiment can remain optional and client-side without changing the catalog's
source of truth.

## Deploying to Cloudflare

The repository includes the Cloudflare Worker Static Assets configuration and
GitHub Actions deployment workflow as infrastructure as code.

For a local deployment:

```sh
npx wrangler login
npm run deploy
```

For a manually triggered GitHub Actions deployment, configure these repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`, scoped to deploy Workers in that account

See [the deployment runbook](docs/deployment.md) for verification, rollback,
and custom-domain guidance. Do not commit Cloudflare credentials.

## Project policy

- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)

The original code in this repository is available under the [MIT License](LICENSE).
Icons and third-party packages remain subject to their respective licenses and
terms. In particular, review the third-party notice before adding bulk downloads
or other loose-icon redistribution.
