import { describe, expect, it } from 'vitest'
import { parseRegistryPage, parseRegistryPlugin, registryUrl } from './registry'

const plugin = {
  id: 'example/dsh-memory',
  name: 'dsh-memory',
  url: 'https://github.com/example/dsh-memory',
  category: 'memory',
  description: { en: 'Persistent memory for agents.' },
  install: 'dsh plugin --profile web add @example/dsh-memory',
  added: '2026-08-25',
  stars: 42,
  installCount: 12,
  pushedAt: '2026-08-25T10:00:00Z',
}

describe('registry boundary', () => {
  it('normalizes verified npm commands for the desktop profile', () => {
    expect(parseRegistryPlugin(plugin)).toMatchObject({
      id: plugin.id,
      install: 'dsh plugin --profile desktop add @example/dsh-memory',
      stars: 42,
      installCount: 12,
    })
  })

  it('does not offer source installs as verified install commands', () => {
    expect(parseRegistryPlugin({ ...plugin, install: 'dsh plugin --profile web add github:example/dsh-memory' })?.install).toBeNull()
  })

  it('accepts the object category returned by package detail routes', () => {
    expect(parseRegistryPlugin({ ...plugin, category: { id: 'memory' } })?.category).toBe('memory')
  })

  it('rejects malformed documents at the API boundary', () => {
    expect(parseRegistryPlugin({ ...plugin, url: 'https://example.com/package' })).toBeNull()
    expect(() => parseRegistryPage({ plugins: [] })).toThrow(/invalid catalog document/i)
  })

  it('builds bounded, source-aware catalog queries', () => {
    expect(registryUrl({ query: 'long term memory', category: 'memory', sort: 'newest', page: 2 }))
      .toBe('https://deepseek1024.com/api/v2/plugins?page=2&limit=24&sort=newest&q=long+term+memory&category=memory')
  })
})
