// Tests for the dsh-community-market catalog artifacts built from the synced
// npm discovery catalog. Patterns are mirrored from
// dsh-community-market/docs/schemas/catalog-{source,provider-page}.schema.json.
import { describe, expect, it } from 'vitest'
import {
  MANIFEST_URL,
  PAGE_LIMIT,
  buildCatalogPage,
  buildSourceManifest,
  marketItemFromCatalogPlugin,
} from './build-market-catalog.mjs'

const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$/
const CATEGORY_ID = /^[a-z0-9][a-z0-9._:-]*$/
const HTTPS_URI = /^https:\/\/(?![^/?#]*@)(?![^/?#]*:)[^#]+$/
const NPM_NAME = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/
const ENDPOINT = /^https:\/\/(?![^/?#]*@)(?![^/?#]*:)[^/?#\s]+(?:\/[^?#\s]*)?\/v1\/plugins\.json$/
const PROVIDER_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)+$/
const ITEM_KEYS = new Set([
  'id', 'name', 'displayName', 'summary', 'description', 'homepage',
  'latestVersion', 'license', 'categories', 'keywords', 'repository',
  'package', 'publisher', 'media', 'capabilities', 'compatibility', 'updatedAt',
])

function catalogPlugin(overrides = {}) {
  return {
    id: 'dsh-editor',
    name: 'dsh-editor',
    repository: 'https://github.com/acryldev/acryl-dsh-editor-plugin',
    category: 'plugins',
    description: { en: 'VS Code-style code editor for DSH and ACRYL Desktop' },
    added: '2026-09-08',
    source: 'acryl',
    install: 'dsh plugin --profile desktop add dsh-editor',
    publisher: 'acryldev',
    version: '0.2.3',
    manifestStatus: 'valid',
    kinds: ['plugins'],
    ...overrides,
  }
}

describe('marketItemFromCatalogPlugin', () => {
  it('maps a catalog plugin to a conformant provider-page item', () => {
    const item = marketItemFromCatalogPlugin(catalogPlugin())
    expect(item).toEqual({
      id: 'dsh-editor',
      name: 'dsh-editor',
      displayName: 'dsh-editor',
      summary: 'VS Code-style code editor for DSH and ACRYL Desktop',
      latestVersion: '0.2.3',
      repository: { url: 'https://github.com/acryldev/acryl-dsh-editor-plugin' },
      package: { registry: 'npm', name: 'dsh-editor' },
      publisher: { name: 'acryldev' },
      categories: ['plugins'],
    })
    for (const key of Object.keys(item)) expect(ITEM_KEYS.has(key), key).toBe(true)
  })

  it('satisfies the repository-or-package requirement even when npm fields are missing', () => {
    const item = marketItemFromCatalogPlugin(catalogPlugin({ repository: null, version: null }))
    expect(item.repository).toBeUndefined()
    expect(item.latestVersion).toBeUndefined()
    expect(item.package).toEqual({ registry: 'npm', name: 'dsh-editor' })
  })

  it('omits package for names outside the npm-name pattern but keeps repository', () => {
    const item = marketItemFromCatalogPlugin(catalogPlugin({ id: 'Dsh-Editor', name: 'Dsh-Editor' }))
    expect(item.package).toBeUndefined()
    expect(item.repository).toEqual({ url: 'https://github.com/acryldev/acryl-dsh-editor-plugin' })
  })

  it('falls back to a non-empty summary when the description is missing', () => {
    const item = marketItemFromCatalogPlugin(catalogPlugin({ description: { en: '' } }))
    expect(item.summary).toBe('ACRYL package dsh-editor')
  })

  it('truncates displayName to 120 characters', () => {
    const name = 'a'.repeat(140)
    const item = marketItemFromCatalogPlugin(catalogPlugin({ id: name, name }))
    expect(item.displayName).toHaveLength(120)
    expect(item.name).toHaveLength(140)
  })

  it('maps scoped npm names to a scope-stripped id with canonical package.name', () => {
    const item = marketItemFromCatalogPlugin(catalogPlugin({ id: '@scope/thing', name: '@scope/thing' }))
    expect(item.id).toBe('scope/thing')
    expect(item.name).toBe('@scope/thing')
    expect(item.package).toEqual({ registry: 'npm', name: '@scope/thing' })
  })

  it('rejects identifiers that cannot conform', () => {
    expect(marketItemFromCatalogPlugin(catalogPlugin({ id: 'not valid', name: 'not valid' }))).toBeNull()
    expect(marketItemFromCatalogPlugin(catalogPlugin({ name: 'a'.repeat(161) }))).toBeNull()
    expect(marketItemFromCatalogPlugin(null)).toBeNull()
  })

  it('strips control and bidi characters from text fields', () => {
    const item = marketItemFromCatalogPlugin(catalogPlugin({ description: { en: 'ok\u0000\u202Editor' } }))
    expect(item.summary).toBe('okditor')
  })

  it('carries declared surfaces through to compatibility.hosts', () => {
    const item = marketItemFromCatalogPlugin(catalogPlugin({ surfaces: ['tui', 'web'] }))
    expect(item.compatibility).toEqual({ hosts: ['tui', 'web'] })
  })

  it('omits compatibility when no surfaces are declared', () => {
    expect(marketItemFromCatalogPlugin(catalogPlugin()).compatibility).toBeUndefined()
    expect(marketItemFromCatalogPlugin(catalogPlugin({ surfaces: [] })).compatibility).toBeUndefined()
  })

  it('drops a surface outside the known vocabulary rather than passing it through', () => {
    const item = marketItemFromCatalogPlugin(catalogPlugin({ surfaces: ['tui', 'browser'] }))
    expect(item.compatibility).toEqual({ hosts: ['tui'] })
  })
})

describe('buildCatalogPage', () => {
  const catalog = {
    generatedAt: '2026-09-08T10:50:40.397Z',
    source: { name: 'npm public registry', registry: 'https://registry.npmjs.org', keyword: 'acryl-package' },
    plugins: [],
  }

  it('emits an empty single page for an empty catalog', () => {
    const page = buildCatalogPage(catalog)
    expect(page.schemaVersion).toBe('1.0.0')
    expect(page.generatedAt).toBe('2026-09-08T10:50:40.397Z')
    expect(page.items).toEqual([])
    expect(page.page).toEqual({ total: 0 })
  })

  it('caps items at PAGE_LIMIT while reporting the full total', () => {
    const plugins = Array.from({ length: PAGE_LIMIT + 10 }, (_, index) =>
      catalogPlugin({ id: `pkg-${String(index).padStart(3, '0')}`, name: `pkg-${String(index).padStart(3, '0')}`, added: `2026-01-${String((index % 28) + 1).padStart(2, '0')}` }))
    const page = buildCatalogPage({ ...catalog, plugins })
    expect(page.items).toHaveLength(PAGE_LIMIT)
    expect(page.page.total).toBe(PAGE_LIMIT + 10)
  })

  it('preserves the sync ordering (most recently added first) and tags discovery keywords', () => {
    const plugins = [catalogPlugin({ id: 'newest', name: 'newest', added: '2026-09-08' }), catalogPlugin({ id: 'older', name: 'older', added: '2026-01-01' })]
    const page = buildCatalogPage({ ...catalog, plugins })
    expect(page.items.map(item => item.id)).toEqual(['newest', 'older'])
    expect(page.items[0].keywords).toEqual(['acryl-package', 'plugins'])
  })

  it('skips nonconformant plugins instead of poisoning the page', () => {
    const plugins = [catalogPlugin(), catalogPlugin({ id: 'bad name', name: 'bad name' })]
    const page = buildCatalogPage({ ...catalog, plugins })
    expect(page.items).toHaveLength(1)
    expect(page.page.total).toBe(2)
  })

  it('produces schema-valid items for arbitrary catalog input', () => {
    const plugins = [
      catalogPlugin(),
      catalogPlugin({ id: '@scope/thing', name: '@scope/thing', category: 'adapters', kinds: ['adapters'] }),
      catalogPlugin({ id: 'weird pkg', name: 'weird pkg' }),
    ]
    const page = buildCatalogPage({ ...catalog, plugins })
    for (const item of page.items) {
      expect(IDENTIFIER.test(item.id), item.id).toBe(true)
      expect(CATEGORY_ID.test(item.categories[0]), item.categories[0]).toBe(true)
      expect(HTTPS_URI.test(item.repository.url)).toBe(true)
      expect(NPM_NAME.test(item.package?.name ?? item.name)).toBe(true)
      expect(item.summary.length).toBeGreaterThan(0)
      expect(item.summary.length).toBeLessThanOrEqual(1000)
      expect(item.repository !== undefined || item.package !== undefined).toBe(true)
    }
    expect(page.items.map(item => item.id)).toEqual(['dsh-editor', 'scope/thing'])
  })
})

describe('buildSourceManifest', () => {
  const manifest = buildSourceManifest()

  it('conforms to the catalog-source 1.0.0 contract', () => {
    expect(manifest.manifestVersion).toBe('1.0.0')
    expect(manifest.providerId).toMatch(PROVIDER_ID)
    expect(manifest.providerId.length).toBeGreaterThanOrEqual(3)
    expect(manifest.transport).toEqual({ kind: 'https-json', endpoint: 'https://acryl.dev/v1/plugins.json', method: 'GET' })
    expect(ENDPOINT.test(manifest.transport.endpoint)).toBe(true)
  })

  it('advertises an honest static-query profile', () => {
    expect(manifest.query.supported).toEqual([])
    expect(manifest.query.defaultLimit).toBe(PAGE_LIMIT)
    expect(manifest.query.maxLimit).toBe(PAGE_LIMIT)
    expect(manifest.query.maxLimit).toBeLessThanOrEqual(100)
    expect(manifest.query.sorts).toEqual([])
  })

  it('points at the published manifest URL and pages on the same origin', () => {
    expect(MANIFEST_URL).toBe('https://acryl.dev/.well-known/acryl-catalog-source.json')
    expect(new URL(manifest.transport.endpoint).origin).toBe(new URL(MANIFEST_URL).origin)
    expect(HTTPS_URI.test(manifest.attribution.url)).toBe(true)
  })
})
