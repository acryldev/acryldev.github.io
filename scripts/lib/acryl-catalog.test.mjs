import { describe, expect, it } from 'vitest'
import { catalogPluginFromManifest, exactDiscoveryKeyword, inspectAcrylManifest } from './acryl-catalog.mjs'

const manifest = {
  name: '@example/acryl-memory',
  version: '1.0.0',
  description: 'Memory for ACRYL',
  keywords: ['acryl-package'],
  repository: { type: 'git', url: 'git+https://github.com/example/acryl-memory.git' },
  acryl: {
    schemaVersion: 1,
    artifacts: { skills: ['./skills'], extensions: ['./dist/extension.js'] },
    capabilities: ['filesystem:project-read'],
  },
}

describe('ACRYL npm catalog ingestion', () => {
  it('requires the exact discovery keyword', () => {
    expect(exactDiscoveryKeyword(manifest)).toBe(true)
    expect(exactDiscoveryKeyword({ keywords: ['acryl-package-example'] })).toBe(false)
  })

  it('validates a versioned manifest without executing package code', () => {
    expect(inspectAcrylManifest(manifest.acryl)).toEqual({ status: 'valid', kinds: ['skills', 'extensions'], surfaces: [] })
  })

  it('rejects paths that escape the package', () => {
    expect(inspectAcrylManifest({ schemaVersion: 1, artifacts: { skills: ['../private'] } }).status).toBe('invalid')
    expect(inspectAcrylManifest({ schemaVersion: 1, artifacts: { skills: ['https://example.com/skill'] } }).status).toBe('invalid')
  })

  it('reads which ACRYL surfaces a package declares itself for', () => {
    expect(inspectAcrylManifest({ ...manifest.acryl, surfaces: ['web', 'web', 'tui'] }))
      .toEqual({ status: 'valid', kinds: ['skills', 'extensions'], surfaces: ['web', 'tui'] })
    expect(catalogPluginFromManifest({ ...manifest, acryl: { ...manifest.acryl, surfaces: ['tui'] } }))
      .toMatchObject({ surfaces: ['tui'] })
  })

  it('rejects a surface outside the known vocabulary', () => {
    expect(inspectAcrylManifest({ ...manifest.acryl, surfaces: ['browser'] }).status).toBe('invalid')
  })

  it('indexes missing manifests as candidates without claiming compatibility', () => {
    expect(catalogPluginFromManifest({ ...manifest, acryl: undefined }, { publisher: { username: 'example' } }))
      .toMatchObject({ source: 'acryl', manifestStatus: 'missing', install: null, publisher: 'example' })
  })

  it('offers the official DSH path only when the package declares a DSH bundle', () => {
    expect(catalogPluginFromManifest({ ...manifest, dsh: { bundle: { patch: './cordis.patch.yml' } } })?.install)
      .toBe('dsh plugin --profile desktop add @example/acryl-memory')
  })
})
