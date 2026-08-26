# acryl.dev

Public website and source-aware package portal for **ACRYL - Agent Context Relay Yielding Lifecycles**.

Built with React 19, TypeScript, Vite, Tailwind CSS 4, and React Router.

## Local development

```bash
pnpm install
pnpm dev
```

Run the complete local gate:

```bash
pnpm check
```

## Catalog

Package discovery reads the public, read-only DSH 1024Store v2 API at runtime. This supplies live search, categories, pagination, install counts, stars, and recent additions across the upstream catalog.

A committed static catalog provides the initial render and automatic fallback when the live registry is unavailable. Regenerate it from a local upstream checkout with:

```bash
ACRYL_CATALOG_SOURCE=../awesome-deepseek-harness-plugins pnpm catalog:sync
```

Only verified npm package commands are offered. Source-only entries remain browse-only. Package sources remain visible, and catalog inclusion is not presented as ACRYL-native compatibility. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Deployment

`.github/workflows/deploy-pages.yml` builds and deploys the site to GitHub Pages. `public/CNAME` configures `acryl.dev`.

GitHub Pages is sufficient for this read-only release: landing pages, live upstream discovery, static fallback, package detail pages, install commands, and documentation. Authentication, submissions, ACRYL-owned analytics, trust verification, or any public write API will need an ACRYL backend. Cloudflare Worker/D1 is a stronger fit for that phase than moving the static site to Netlify alone.

### DNS for `acryl.dev`

Configure the domain provider with GitHub Pages' current apex-domain records and add `www` as a CNAME to `acryldev.github.io`. Verify the exact values in GitHub's Pages documentation before changing DNS. In repository Settings -> Pages, choose **GitHub Actions** as the source and enforce HTTPS after the certificate is issued.
