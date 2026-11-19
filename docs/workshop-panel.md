# WorkshopPanel: implementation note

The `/workshoppanel` route in this site (spec: `acryldev/acrylworkshop/ACRYL-WorkshopPanel-Coding-Agent-Spec.md`).
This note records what the repository and database actually are, and the decisions that follow from them.

## What exists today

- Vite 6 + React 19 + React Router 7 + Tailwind 4 single-page app, deployed to GitHub Pages by
  `.github/workflows/deploy-pages.yml` (runs `pnpm check`). `vite.config.ts` keeps `base: '/'` and `public/404.html`
  restores deep links, so `/workshoppanel` needs no deploy change.
- Visual language: `src/styles.css` tokens (`--background`, `--card`, `--border`, `--accent-foreground`), Manrope for text,
  DM Mono for labels, square 1px borders, `.page-width`, `.eyebrow`, `.button`. The panel uses these, not new tokens.
- The workshop registration page is `/events/acrylbootcamp` (`src/pages/BootcampPage.tsx`). It posts to the existing
  PocketBase on our own server (`REGISTRATIONS_ENDPOINT` in `src/data/events.ts`), collection `event_registrations`:
  create-only for the public (`@request.body.consent = true && @request.body.event = "acrylbootcamp"`), no public read.
- There is no server component. Everything a client writes goes straight to PocketBase under collection API rules.

## Database decision

Reuse the same PocketBase instance (one database, no parallel backend). `event_registrations` is not reused as the
panel's participant table: it stores private invitation emails and cannot be read publicly. The panel adds:

| Collection | Purpose | Public access |
| --- | --- | --- |
| `workshop_events` | one record per workshop: phase, registration window, reveal settings, schedule, Frankenstein record | read |
| `workshop_ideas` | seeded idea pool and participant suggestions | seeded/approved read |
| `workshop_participants` (auth) | display name, GitHub login, OS, public-board consent | own record only |
| `workshop_projects` | one project per participant: app, Blueprint, profile, status, links | owner writes, public via view |
| `workshop_plugins` | plugin contributions: lifecycle, services, links, Frankenstein state | owner writes, public via view |
| `workshop_board` (view) | safe projection of consented participants and their projects, only after reveal | read |
| `workshop_plugins_public` (view) | safe projection of the plugin pool, only after reveal | read |

The two view collections are read-only SQL projections. That is how pre-reveal hiding and the public-field allowlist are
enforced by the database rather than by the browser: the base tables have no public read rule at all.
The reveal filter is `revealed = true OR datetime(reveal_at) <= datetime('now')`, so no cron job is needed.

## Participant identity (adaptation of the spec's session design)

GitHub Pages cannot set an HttpOnly cookie, and there is no server to hash a token. The panel therefore uses a
PocketBase auth collection: the browser generates a random identity (`w-<random>@workshop.acryl.dev`) and a random
password, PocketBase stores only the password hash, and owner API rules (`id = @request.auth.id`) authorize edits.
The credentials stay in the browser's localStorage; a recovery code (the same pair, base64url) is shown once after
registration so a participant can continue on another device. The generated email is never shown to anyone.

Admin uses the existing PocketBase superuser: the facilitator signs in with email and password on the page, the token
lives in sessionStorage, and every admin action is authorized and enforced by PocketBase. No service key is embedded.

## Public fields

`workshop_board`: participant display name, GitHub login, project app name, source mode, Blueprint id/runtime,
description, target user, profile, lifecycle status, repository/demo/registry URLs, publication status, featured flag.
`workshop_plugins_public`: plugin name, feature title, description, version, lifecycle, repository/release/registry URLs,
Frankenstein status and block reason, participant display name, app name.

Never public: email, password hash, participant ids, auth tokens, unpublished (custom) ideas, admin notes. Emails from
`event_registrations` are never read by the panel.

## Skipped on purpose

- No separate publications table: projects and plugins carry their repository, release, registry, demo URLs and a
  publication status (`local ... catalogued`). One record per artifact, no join to keep in sync.
- No new registry: the Blueprint tab reads the existing `acrylblends.github.io/registry/index.json` in the browser.
- No websockets: 15 s polling plus refresh on focus.
- No code execution or installation of participant artifacts anywhere in the site.

## Verification

- Unit tests cover validation, session encoding, lifecycle metadata and the catalogue parser use.
- `pnpm check` (typecheck, vitest, build) must pass before the branch is reported.
- Screenshots at 1440x900 and 390x844 are taken from the built site against the live database.
- Tests never write to `event_registrations`; the shared DB is only read during screenshots. Seeding writes only the new
  workshop collections and is idempotent (`scripts/workshop-migrate.mjs`).
