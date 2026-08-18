# Security policy

## Supported versions

Only the version deployed from the `main` branch receives security fixes.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's
**Security > Report a vulnerability** flow to submit a private report to the
maintainers. Include the affected URL or commit, reproduction steps, expected
impact, and any suggested mitigation.

Please allow a reasonable period for triage before disclosing the issue. The
maintainers will acknowledge a report when received and will coordinate fixes
and disclosure for confirmed vulnerabilities.

## Deployment credentials

The application does not need runtime secrets. Cloudflare deployment
credentials belong only in GitHub Actions secrets or a local Wrangler login.
Never commit API tokens, account IDs, `.dev.vars`, or environment files.
