# How Pi packages reach pi.dev, and a source-aware design for ACRYL

**Research date:** 2026-08-26  
**Scope:** Official `earendil-works/pi` and `earendil-works/pi-website` sources, live `pi.dev` responses, official npm sources, and the public GitHub Actions configuration. No third-party explanations were used.

## Executive answer

Pi's creator workflow is deliberately small:

1. Publish an ordinary public npm package.
2. Put the exact keyword `pi-package` in `package.json`.
3. Optionally declare Pi resources and gallery media under the `pi` key.

The official Pi documentation explicitly says that the gallery displays packages tagged `pi-package`, and the package command is the ordinary `pi install npm:<package>` command ([Pi package documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md#creating-a-pi-package), [gallery metadata](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md#gallery-metadata)). There is no documented Pi submission form, allow-list, pull request, or second publish step.

That keyword is sufficient for catalog eligibility, not for safety or compatibility. The current gallery lists, for example, [`@agimon-ai/doompi-extension-contracts`](https://pi.dev/packages/@agimon-ai/doompi-extension-contracts), whose npm `latest` metadata has `pi-package` and `pi-extension` keywords but no `pi` object ([live npm version metadata](https://registry.npmjs.org/@agimon-ai%2fdoompi-extension-contracts/latest)). Pi's own docs warn that third-party packages run with full system access and must be reviewed before installation ([security warning](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md#install-and-manage)).

The exact implementation of the **current** pi.dev ingestion service is not public. The only official website repository is archived and its last public revision predates the current server-rendered site ([repository status](https://github.com/earendil-works/pi-website), [last public commit](https://github.com/earendil-works/pi-website/commit/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c)). It is still valuable because it exposes the original gallery algorithm in full, but it must not be mistaken for the current deployment.

The right ACRYL analogue is therefore not a manual package directory. It is an automated, source-aware index over public registries. Anyone should be able to publish by adding `acryl-package` and an `acryl` manifest, while ACRYL independently records immutable package coordinates, source attestations, scan results, compatibility evidence, and moderation state.

## 1. What the public Pi implementation proves

### 1.1 The original public gallery queried npm directly

The archived official website implementation used the npm registry search endpoint:

```text
https://registry.npmjs.org/-/v1/search?text=keywords:pi-package&size=250
```

It repeatedly advanced `from` until it had fetched the reported total ([official gallery source](https://github.com/earendil-works/pi-website/blob/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/src/packages.html#L1130-L1150)). npm's official registry API describes `GET /-/v1/search`, its `size` maximum of 250, `from` offset, score weights, and the `keywords:<value>` qualifier ([npm Registry API](https://github.com/npm/registry/blob/ae49abf1bac0ec1a3f3f1fceea1cca6fe2dc00e1/docs/REGISTRY-API.md#get--v1search)).

The old page then:

- mapped npm search results into name, description, latest version date, publisher, maintainers, links, and monthly downloads;
- inferred extension, skill, theme, and prompt types from keywords;
- fetched each package's `latest` registry manifest in batches of 15;
- let a valid `pi.extensions`, `pi.skills`, `pi.themes`, or `pi.prompts` array override keyword-derived types;
- read `pi.video` and `pi.image` for previews;
- cached package data in browser `localStorage` for 15 minutes.

These behaviors are visible in the same official source: [type and media extraction](https://github.com/earendil-works/pi-website/blob/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/src/packages.html#L200-L235), [search-result mapping and manifest enrichment](https://github.com/earendil-works/pi-website/blob/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/src/packages.html#L1015-L1125), and [15-minute cache](https://github.com/earendil-works/pi-website/blob/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/src/packages.html#L100-L110).

There was no catalog database or publishing workflow in that public version. The browser assembled the catalog from npm responses. Deployment itself was a manual shell script that built static HTML, copied the repository to a server with `rsync`, and restarted containers over SSH ([official `publish.sh`](https://github.com/earendil-works/pi-website/blob/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/publish.sh)).

### 1.2 The current deployment is a different, server-rendered implementation

Live responses on 2026-08-26 establish the following current behavior:

- [`/packages`](https://pi.dev/packages) returns complete HTML with 50 package cards per page.
- The observed catalog contained 5,631 to 5,635 entries across 113 pages. The small count difference occurred across separately cached responses, so it should not be interpreted as a stable total.
- The GET parameters are `name`, `type`, `sort`, and `page`. Supported types shown by the form are `extension`, `skill`, `theme`, and `prompt`; supported sorts are downloads, recent, and name. Examples: [recent](https://pi.dev/packages?sort=recent), [skill and recent](https://pi.dev/packages?type=skill&sort=recent), and [name sort, page 2](https://pi.dev/packages?sort=name&page=2).
- Package detail pages expose latest version, publish date, monthly and weekly downloads, author, license, inferred types, unpacked size, dependency counts, repository/home links, optional Pi manifest JSON, README, install command, report link, and a security warning. See [`pi-mcp-adapter`](https://pi.dev/packages/pi-mcp-adapter).
- A browser endpoint batches preview media lookups: [`GET /api/packages/preview-media`](https://pi.dev/api/packages/preview-media?name=pi-mcp-adapter). The generic [`GET /api/packages`](https://pi.dev/api/packages) returned HTTP 501 with `API routes are reserved for future features`; no current public package JSON feed was found.
- Package and preview responses returned `Cache-Control: public, max-age=300, s-maxage=300`, permitting five minutes of browser and shared-cache staleness.

The default downloads order agrees with npm's monthly download count. At the observation time, both Pi and npm reported 607,892 monthly and 168,089 weekly downloads for `pi-mcp-adapter` ([npm keyword search response](https://registry.npmjs.org/-/v1/search?text=keywords%3Api-package&size=5), [npm last-month point endpoint](https://api.npmjs.org/downloads/point/last-month/pi-mcp-adapter)). npm's official download-count service documents point, range, and comma-separated bulk queries ([official download-count API](https://github.com/npm/download-counts/blob/aa81797faa29d18ba79cbc9cb3d1b19c2374308c/README.md#point-values)). No evidence was found that Pi computes an independent popularity score.

List-page type filtering currently appears keyword-derived rather than fully manifest-derived. For example, list cards for packages whose keywords do not name a resource type can say `package`, while their detail pages expose types from `pi`. This is observable for [`pi-subagents`](https://pi.dev/packages/pi-subagents), whose npm metadata has a Pi extension/skill/prompt manifest but no `extension`, `skill`, or `prompt` keyword ([npm metadata](https://registry.npmjs.org/pi-subagents/latest)). This can make list filtering incomplete even when the detail page understands the manifest.

### 1.3 What is automated, and what is not verifiable

A version-refresh observation gives an approximate upper bound, not an SLA. At 10:33 UTC on 2026-08-26, the live recent page already contained `@ferris1225/pi-subagents@4.1.8`, whose registry publish timestamp was 10:27:58 UTC ([live recent order](https://pi.dev/packages?sort=recent), [npm packument](https://registry.npmjs.org/@ferris1225%2fpi-subagents)). That is about six minutes from npm publish to an observed Pi response and is consistent with the site's five-minute cache header.

This does **not** prove how quickly a brand-new package appears. npm's official search documentation warns that newly published packages may take up to two weeks to enter npm search results and that fully deprecated packages are excluded ([npm search documentation](https://docs.npmjs.com/searching-for-and-choosing-packages-to-download)). The archived Pi gallery depended on npm search, but the current backend may use another mechanism. Its discovery query, polling interval, datastore, cache invalidation, retry policy, and deletion reconciliation are not in any public source located here.

The practical answer is:

- Publishing a public npm package with `pi-package` is the documented and observed eligibility mechanism.
- Version updates can appear within minutes.
- There is no public appearance-time guarantee for a new package.
- Moderation, transient registry/search delay, malformed metadata, deprecation, or an unpublished package can prevent or delay display.

## 2. Validation, installation, and abuse handling in Pi

### 2.1 Catalog inclusion is intentionally permissive

The public gallery implementation did not require a valid `pi` manifest before creating a card. It created entries from npm search results and enriched them later ([search-result processing](https://github.com/earendil-works/pi-website/blob/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/src/packages.html#L1015-L1040)). Pi itself tolerantly reads only string-array resource fields and returns `null` for malformed JSON or a non-object `pi` value ([current Pi manifest reader](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/pi-manifest.ts)). If no manifest is present, Pi also supports conventional `extensions/`, `skills/`, `prompts/`, and `themes/` directories ([package structure docs](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md#convention-directories)).

This low-friction design has a security cost. `pi install npm:<name>` delegates to the configured npm-compatible package manager, and the npm path does not add `--ignore-scripts` ([current package manager source](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/package-manager.ts#L1785-L1812)). npm publication provides tarball SHA-1 and SHA-512 integrity metadata, and npm installs verify the strongest supported hash, but integrity proves registry bytes, not benign behavior ([npm publish documentation](https://docs.npmjs.com/cli/v11/commands/npm-publish)). Pi therefore correctly tells users to review source rather than treating gallery inclusion as endorsement.

### 2.2 Reports are public; current enforcement is not

Every current package card and detail page links to the official GitHub `Package Report` issue form. The form accepts malicious/unsafe behavior, impersonation, and trademark/TOS complaints ([official report template](https://github.com/earendil-works/pi/blob/main/.github/ISSUE_TEMPLATE/package-report.yml)).

Pi's issue gate automatically closes issues from contributors who are not collaborators or explicitly approved, labels them untriaged, and says maintainers review auto-closed issues daily ([official Issue Gate workflow](https://github.com/earendil-works/pi/blob/main/.github/workflows/issue-gate.yml)). Triage automation can later mark issues `no-action` or preserve issues chosen for discussion ([official triage workflow](https://github.com/earendil-works/pi/blob/main/.github/workflows/issue-triage-labels.yml)).

The archived gallery had a concrete client-side rule: fetch package-report issues, warn on an open report, and hide packages whose report carried `package-hide`, with a 10-minute flag cache ([archived flag source](https://github.com/earendil-works/pi-website/blob/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/src/packages.html#L1190-L1280)). That code points to the former `badlogic/pi-mono` issue tracker and is not the current deployment. No public current source was found that connects reports to warnings, delisting, or quarantine. Those enforcement details remain unverifiable.

### 2.3 No public gallery cron or Action was found

The public `earendil-works/pi` workflow directory contains CI, release/build, issue gates, npm audit, and model-catalog publication, but no package-gallery ingestion workflow ([official workflow directory](https://github.com/earendil-works/pi/tree/main/.github/workflows)). The archived website has no `.github/workflows` directory and used the manual deploy script described above. Therefore the current gallery refresh is not traceable to public GitHub Actions. It may run in private server code or infrastructure, but naming a particular scheduler or registry mechanism would be speculation.

## 3. Recommended ACRYL package contract

ACRYL should copy Pi's one-keyword publishing experience while making trust claims independently verifiable.

### 3.1 Exact author convention

Use one exact discovery keyword and one versioned manifest namespace:

```json
{
  "name": "@publisher/acryl-example",
  "version": "1.0.0",
  "description": "Example ACRYL package",
  "keywords": ["acryl-package", "acryl-adapter"],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/publisher/acryl-example.git"
  },
  "acryl": {
    "schemaVersion": 1,
    "artifacts": {
      "adapters": ["./dist/adapters/*.js"],
      "skills": ["./skills"],
      "extensions": ["./dist/extensions/*.js"]
    },
    "compatibility": {
      "acryl": ">=0.1.0 <1.0.0",
      "hosts": {
        "deepseek-harness": ">=0.1.0"
      },
      "node": ">=22"
    },
    "capabilities": ["filesystem:project-read"],
    "source": {
      "subdirectory": "packages/acryl-example"
    }
  },
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

Rules:

- `acryl-package` is the only discovery keyword. Type keywords are display hints, never compatibility proof.
- `acryl.schemaVersion` is required for ACRYL-native packages. Unknown schema versions remain indexed but are not installable by an older client.
- Artifact paths must be relative, package-contained paths. No URL entries, absolute paths, traversal, or symlink escapes.
- Standard `repository` is the publisher's claimed repository. `acryl.source.subdirectory` may locate a monorepo package, but must not duplicate or override repository identity.
- `compatibility`, `capabilities`, and descriptions are declarations. ACRYL records them as such until independently tested.
- A package with only `acryl-package` can be shown as a legacy/candidate entry, as Pi does, but it receives no ACRYL-compatible badge or default one-click install.

npm documents `keywords` as an array used by search ([package.json docs](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#keywords)), and public scoped packages can be published with `npm publish --access public` ([npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish)). ACRYL should provide a template repository and `acryl package check` command, but neither should be mandatory for indexing.

### 3.2 Separate the package, source, and evidence identities

Never collapse these into one record:

- **Package coordinate:** `npm:<normalized-name>@<version>`
- **Registry artifact:** tarball URL plus registry SHA-512 integrity
- **Claimed source:** normalized `repository` URL plus optional subdirectory
- **Attested source:** repository, workflow, and commit extracted from a verified npm provenance statement
- **Catalog origin:** `acryl`, `dsh-1024store`, or another upstream source

Two npm names that claim one Git repository remain two packages. An upstream DSH entry and an npm package remain two catalog records connected by a `SAME_DISTRIBUTION_AS` or `PUBLISHED_AS` edge only after deterministic evidence or review. A self-declared repository URL must never transfer stars, trust, aliases, reports, or verification to a package by itself.

npm provenance is suitable evidence because it links a package to source and build instructions, is signed through Sigstore, and is logged in a transparency ledger. npm also emphasizes that provenance does not prove the code is non-malicious ([provenance documentation](https://docs.npmjs.com/generating-provenance-statements)). Trusted publishing uses short-lived OIDC credentials and automatically produces provenance for supported CI providers ([trusted publishing](https://docs.npmjs.com/trusted-publishers)).

## 4. Ingestion and refresh architecture

### 4.1 Discovery pipeline

Use two automated paths feeding one idempotent validator:

1. **Registry follower:** Consume npm's replication changes stream, persist its sequence checkpoint, and retrieve the current packument for each changed package. npm's official follower tutorial identifies `https://replicate.npmjs.com`, change sequence IDs, `include_docs`, and `update_seq` as the follower/checkpoint model ([official follower tutorial](https://github.com/npm/registry-follower-tutorial/blob/736c737f7bc01f348ffaa3bc2b8b2560ede0bd83/README.md#set-up-a-changes-stream)). Process a package only when its current public `latest` version contains exact `acryl-package`.
2. **Author-triggered refresh:** Offer unauthenticated `POST /v1/ingest/npm/{name}`. It accepts only an npm name, rate-limits by IP/name, and reads all metadata from npm. It cannot submit descriptions, source claims, downloads, or trust assertions. Authors can call it after `npm publish`, but packages are still discovered without it.

Add two reconciliation jobs:

- a periodic exact-keyword npm search to recover follower gaps;
- a slower full revalidation sweep over every active indexed coordinate to detect removed keywords, changed dist-tags, deprecation, unpublishing, and broken source links.

This avoids making npm search latency the only discovery path. It also avoids requiring a manual ACRYL pull request. The follower endpoint and behavior must be integration-tested before production because npm's public replication documentation and tutorial are older, while its current service behavior can evolve.

### 4.2 Proposed cadence

- Poll replication changes every minute, or run a continuously connected follower outside request-serving Workers.
- Drain at most a bounded number of changes per Cloudflare Cron invocation and persist the last successful sequence transactionally in D1.
- Process author refresh requests immediately through a queue.
- Refresh downloads daily in npm bulk-query batches; downloads are ranking data, never trust evidence.
- Revalidate active package metadata every six hours.
- Recheck source reachability and provenance daily.
- Serve API responses with 60-second edge caching, ETag, and `stale-while-revalidate`.

The public website can remain on GitHub Pages while a Cloudflare Worker/D1 service owns writes, queues, scans, and the package API. The committed static catalog should remain a last-known-good fallback, not a second source of truth.

### 4.3 Validation pipeline

For each candidate version:

1. Validate npm name and semantic version; require public `latest` and exact `acryl-package`.
2. Parse `acryl` against a strict, size-bounded JSON Schema. Preserve unknown manifest data for diagnostics but reject unknown keys from the canonical internal model.
3. Fetch only the registry-declared tarball host; stream with compressed/unpacked/file-count limits and timeouts.
4. Verify `dist.integrity` before inspection. Store the integrity digest as the immutable version identity.
5. Inspect without executing lifecycle scripts. Reject archive traversal, absolute paths, escaping symlinks, duplicate paths, case-collision ambiguity, oversized files, and manifest references absent from the tarball.
6. Inventory install scripts, binaries, native modules, dependencies, network-capable code indicators, secrets, and declared capabilities. Findings inform warnings/quarantine; they are not claims of perfect malware detection.
7. Sanitize README Markdown to a strict HTML allow-list. Proxy media with DNS/IP SSRF defenses, MIME sniffing, byte/pixel limits, and no SVG script execution.
8. Fetch and verify npm signatures/attestations where available. Confirm that attested repository and commit agree with the package's claimed source before granting source-attested status.
9. Run compatibility tests only in an ephemeral sandbox with no secrets, default-denied network, read-only fixtures, CPU/memory/time limits, and captured evidence.
10. Write package, version, evidence, findings, and state in one transaction; publish an immutable catalog event.

An ACRYL installer should resolve to an exact version and integrity digest, write both to a lockfile, display source/trust/capability information, and ask for confirmation before running package code. It should never treat download count or catalog presence as authorization.

## 5. Trust, compatibility, and moderation model

Use explicit tiers, but retain the underlying evidence dimensions so the UI does not compress unlike claims into one misleading badge.

| Tier | Meaning | Automated requirements |
|---|---|---|
| **T0 Quarantined/withdrawn** | Not offered for install | Registry deletion, confirmed malicious report, integrity mismatch, critical scanner policy, or maintainer action |
| **T1 Listed** | Public npm candidate, not endorsed | Exact keyword, retrievable immutable version, parseable bounded metadata, integrity verified |
| **T2 Source-attested** | Registry artifact is verifiably tied to a source commit/build | T1 plus valid npm provenance and reachable matching public source |
| **T3 Compatibility-verified** | A specific version passed an ACRYL/host test matrix | T2 plus signed, current conformance results for the declared ranges |
| **T4 Curated** | ACRYL maintainers reviewed a specific version | T3 plus recorded reviewer, policy version, date, and review evidence |

Always show orthogonal badges for `source`, `compatibility`, `security scan`, `publisher continuity`, and `review freshness`. A new version inherits package identity and report history, but not T3/T4 results. A renamed package does not inherit trust merely because it claims the old repository.

Compatibility states should be `unknown`, `declared`, `incompatible`, `tested`, or `verified`, always scoped to `package@version`, ACRYL version, host version, platform, and test-suite revision. Catalog inclusion must never be worded as "ACRYL compatible."

Reports should support security, impersonation, abandoned/moved package, trademark, source mismatch, and compatibility claims. High-risk reports immediately move install actions behind a warning while triage runs. Confirmed abuse creates a signed moderation record with reason, scope, expiry/review date, and audit history. Downloads must never override a security decision.

## 6. API and index schema

### 6.1 Public API

```text
GET  /v1/packages?q=&kind=&origin=&sourceTrust=&compatibility=&sort=&cursor=&limit=
GET  /v1/packages/{packageId}
GET  /v1/packages/{packageId}/versions
GET  /v1/packages/{packageId}/versions/{version}
GET  /v1/packages/{packageId}/evidence
GET  /v1/catalog/changes?since=&limit=
POST /v1/ingest/npm/{name}
POST /v1/reports
GET  /.well-known/acryl-package.schema.json
```

Use opaque cursor pagination over deterministic `(sort_value, package_id)` keys. Never use unbounded offsets. Responses include `generatedAt`, index cursor, evidence freshness, ETag, canonical source coordinates, and installability reason codes. `POST /ingest` returns `202`, a stable job ID, and status URL; repeated requests coalesce.

### 6.2 Core records

- `packages`: canonical ID, registry/name, current version, lifecycle state, first/last seen.
- `versions`: package ID, version, publish time, dist-tag state, tarball URL, integrity, size, manifest JSON, deprecation/yank state.
- `sources`: normalized source identity, claimed URL, subdirectory, reachability.
- `attestations`: version ID, predicate, verified repository/commit/workflow, verification time/result.
- `artifacts`: version ID, kind, path, content digest.
- `compatibility_results`: version, ACRYL/host/platform matrix, suite revision, result, evidence URL/signature.
- `scan_findings`: scanner/policy revision, severity, rule, evidence digest, disposition.
- `trust_snapshots`: computed tier plus exact evidence inputs.
- `catalog_origins` and `source_links`: ACRYL, DSH 1024Store, npm, and reviewed cross-source relations.
- `download_snapshots`: period and count, explicitly non-security data.
- `reports` and `moderation_actions`: state, scope, reason, actor, evidence, timestamps.
- `ingest_cursor` and `ingest_jobs`: replication checkpoint, retries, dead-letter state.
- `aliases`: reviewed renames/replacements only; never created from self-declaration alone.
- `catalog_events`: append-only discovery, update, delist, trust, and moderation changes.

## 7. Deduplication, deprecation, and unpublishing

- Normalize npm names case-insensitively and key each immutable version by `(registry, name, version, integrity)`.
- Coalesce repeated change events and author refreshes by package name, but always re-read authoritative registry state.
- If the `latest` version drops `acryl-package`, mark `pending_delist`, recheck after a grace period, then remove it from default discovery while retaining version history.
- If a version is deprecated, display the registry message and suppress it from recommendations. npm states that fully deprecated packages are removed from npm search ([npm search docs](https://docs.npmjs.com/searching-for-and-choosing-packages-to-download)).
- If a packument or version disappears, immediately disable new installs, retain a tombstone and prior evidence, and recheck before final withdrawal to distinguish a transient registry failure.
- Never recycle a package/version identity. npm registry data is immutable and an unpublished name/version cannot be reused; complete unpublish is restricted and deprecation is the normal fallback ([npm unpublish policy](https://docs.npmjs.com/policies/unpublish)).
- A replacement package needs publisher proof, matching provenance/source ownership, or maintainer review. A `replaces` field alone creates only an untrusted claim.

## 8. Phased implementation for ACRYL

### Phase 0 - Contract and transparent static presentation

- Publish the `acryl-package` convention and version-1 JSON Schema.
- Add source, origin, compatibility, and trust fields to the existing DSH-backed catalog model.
- Clearly separate `listed`, `source-linked`, and `compatible` in UI language.
- Keep source-only entries browse-only and retain the current static fallback.

### Phase 1 - Automated npm index

- Deploy Worker/D1 package APIs and queue-backed `POST /ingest/npm/{name}`.
- Bootstrap exact-keyword npm search, stopping on duplicate-page/no-progress conditions rather than trusting a reported total blindly.
- Start from T1 only: exact keyword, strict metadata/tar inspection, integrity, pagination, search, download snapshots, deprecation and tombstones.
- Add reports and moderation audit records.
- Point the website at ACRYL's API while preserving the static fallback.

### Phase 2 - Near-real-time discovery and source trust

- Add the npm replication follower with a durable cursor and scheduled reconciliation.
- Verify npm signatures and provenance; normalize source identities and monorepo subdirectories.
- Add source mismatch and publisher-change alerts.
- Introduce T2 badges and source-aware install confirmation.

### Phase 3 - Compatibility verification and safe installs

- Build sandboxed conformance runners and a versioned host matrix.
- Sign compatibility results and grant T3 per version/matrix.
- Ship an ACRYL lockfile containing exact source, version, integrity, capabilities, and evidence snapshot.
- Require reconfirmation when capabilities, publisher set, source attestation, or integrity lineage changes.

### Phase 4 - Federation and curation

- Ingest DSH 1024Store and other approved registries as separate origins.
- Link, rather than silently merge, equivalent distributions.
- Add reviewed aliases/replacements and T4 curation.
- Publish a signed incremental catalog feed so other ACRYL clients can mirror and audit decisions.

## 9. Unknowns that should remain labeled unknown

The following could not be verified from public primary sources:

- the current pi.dev backend repository or framework;
- whether current discovery uses npm search, npm replication, a private crawler, or a combination;
- its poll/cron schedule, ingestion queue, datastore, retries, or cache purge process;
- exact current package/manifest rejection rules;
- exact current unpublish, keyword-removal, and deprecation timing;
- whether reports automatically alter current gallery visibility;
- internal anti-spam, malware scanning, or download-anomaly controls;
- a guaranteed time from first npm publication to gallery appearance.

The live HTML and APIs demonstrate outcomes, not these internal mechanisms. ACRYL should publish its own ingestion state, evidence, reason codes, and freshness timestamps so users do not have to infer trust or automation from a gallery page.

## Primary-source index

- [Pi package documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md)
- [Pi manifest reader](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/pi-manifest.ts)
- [Pi package manager](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/package-manager.ts)
- [Pi package-report issue form](https://github.com/earendil-works/pi/blob/main/.github/ISSUE_TEMPLATE/package-report.yml)
- [Pi public workflows](https://github.com/earendil-works/pi/tree/main/.github/workflows)
- [Archived official Pi website](https://github.com/earendil-works/pi-website)
- [Archived package-gallery source](https://github.com/earendil-works/pi-website/blob/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/src/packages.html)
- [Live pi.dev package catalog](https://pi.dev/packages)
- [npm Registry API](https://github.com/npm/registry/blob/ae49abf1bac0ec1a3f3f1fceea1cca6fe2dc00e1/docs/REGISTRY-API.md)
- [npm registry follower tutorial](https://github.com/npm/registry-follower-tutorial/tree/736c737f7bc01f348ffaa3bc2b8b2560ede0bd83)
- [npm search behavior](https://docs.npmjs.com/searching-for-and-choosing-packages-to-download)
- [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers)
- [npm unpublish policy](https://docs.npmjs.com/policies/unpublish)
- [npm download-count API](https://github.com/npm/download-counts/blob/aa81797faa29d18ba79cbc9cb3d1b19c2374308c/README.md)
