# Contributing

Thanks for helping improve Iconsax Search.

## Set up the project

Requirements:

- A currently supported Node.js LTS release
- npm

```sh
npm ci
npm run dev
```

## Make a change

- Keep search local and deterministic. A search must not trigger a paid or
  server-side inference request.
- Add general language to the maintained alias source, not directly to a
  generated catalog file.
- Regenerate the catalog after changing the Iconsax version or search metadata.
- Preserve the upstream icon export name, including upstream misspellings.
- Keep the UI keyboard-accessible and usable at narrow viewport widths.
- Do not add analytics, cookies, or remote data collection without a documented
  privacy review.

## Verify a change

Run the same checks as CI before opening a pull request:

```sh
npm run catalog:check
npm run lint
npm run typecheck
npm test
npm run build
```

If the generated catalog is stale, run `npm run catalog:generate`, review the
diff, and commit the generated output with the source change.

## Pull requests

Keep each pull request focused. Explain the user-facing effect, note any search
ranking changes, and include screenshots for visual changes. Do not include
generated icon files or third-party artwork unless their redistribution terms
have been reviewed.
