# Publish an ACRYL package

ACRYL packages are ordinary public npm packages. There is no submission form or catalog pull request.

## Quick start

Add the exact `acryl-package` keyword and a versioned `acryl` manifest to `package.json`:

```json
{
  "name": "@your-name/acryl-example",
  "version": "1.0.0",
  "description": "What this package adds to an agent lifecycle",
  "keywords": ["acryl-package", "acryl-skill"],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-name/acryl-example.git"
  },
  "acryl": {
    "schemaVersion": 1,
    "artifacts": {
      "skills": ["./skills"]
    },
    "runtime": "content",
    "compatibility": {
      "acryl": ">=0.1.0 <1.0.0",
      "node": ">=22"
    },
    "capabilities": []
  },
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

Validate the package paths locally, authenticate with npm, and publish:

```bash
npm pack --dry-run
npm publish --access public --provenance
```

The public catalog searches npm for the exact `acryl-package` keyword and refreshes automatically. No ACRYL repository access is required. GitHub Actions rebuilds the public index four times per hour; npm search indexing can add additional delay for a package's first publication.

## Artifact kinds

The version 1 manifest accepts:

- `plugins`
- `extensions`
- `adapters`
- `skills`
- `workflows`
- `blueprints`
- `stemcells`

Paths are relative to the published package root. Absolute paths, remote URLs, and `..` traversal are rejected. The deployed JSON Schema is available at:

```text
https://acryl.dev/.well-known/acryl-package.schema.json
```

Until the custom domain is connected, the same file is available from:

```text
https://acryldev.github.io/.well-known/acryl-package.schema.json
```

## Discovery versus verification

The keyword makes a package discoverable. It does not make it trusted or compatible.

- **Candidate:** exact keyword, but no valid ACRYL manifest.
- **Manifest declared:** schema-valid manifest whose package paths can be inspected.
- **DSH installable:** the npm manifest also declares a standard `dsh.bundle`; ACRYL can offer the official DSH installation path.
- **Verified:** reserved for a future version-scoped compatibility test and evidence record.

Package code is never executed by the catalog synchronization job. ACRYL preserves the npm package identity, publisher, repository link, version, and source status.

## Discovering packages inside ACRYL Desktop

The same catalog is exposed as a standard catalog source for the Desktop market UI. Users register the manifest URL once:

```text
https://acryl.dev/.well-known/acryl-catalog-source.json
```

The manifest points at the static page `https://acryl.dev/v1/plugins`, rebuilt by the same synchronization job. The static endpoint answers every query with a single page (the 50 most recently added packages), so the manifest advertises no query features. When the catalog outgrows one page, this artifact is replaced by the filtered API planned in [`../research/pi-package-gallery-publishing.md`](../research/pi-package-gallery-publishing.md).

## Updating or removing a listing

Publish a new npm version to update metadata. Remove the `acryl-package` keyword from the latest version to leave default discovery. Deprecate unsafe or obsolete versions through npm rather than silently replacing their identity.

## Why this model

Pi demonstrates the low-friction pattern: publish a normal npm package with the exact `pi-package` keyword and it becomes eligible for automatic gallery discovery. ACRYL adopts that author experience while keeping source, compatibility, and trust evidence separate.

Primary references:

- [Pi package documentation](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md)
- [Archived official Pi gallery implementation](https://github.com/earendil-works/pi-website/blob/2f5e410b97474d0a34ec2500aa1aa58d6c3f992c/src/packages.html)
- [npm package keywords](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#keywords)
- [npm publish and provenance](https://docs.npmjs.com/cli/v11/commands/npm-publish)

The deeper implementation and trust analysis is recorded in [`../research/pi-package-gallery-publishing.md`](../research/pi-package-gallery-publishing.md).
