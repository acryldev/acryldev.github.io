import { describe, expect, it } from 'vitest'
import { catalog, filterPlugins, findPlugin, installCommand, packagePath } from './catalog'

describe('catalog', () => {
  it('contains attributed upstream packages', () => {
    expect(catalog.plugins.length).toBeGreaterThan(400)
    expect(catalog.upstream.repository).toContain('awesome-deepseek-harness-plugins')
    expect(catalog.plugins.every(plugin => plugin.source === 'deepseek-harness')).toBe(true)
  })

  it('filters by category and text without case sensitivity', () => {
    const memory = filterPlugins(catalog.plugins, 'MEMORY', 'memory')
    expect(memory.length).toBeGreaterThan(0)
    expect(memory.every(plugin => plugin.category === 'memory')).toBe(true)
  })

  it('generates stable routes and upstream install commands', () => {
    const plugin = catalog.plugins[0]
    expect(plugin).toBeDefined()
    if (!plugin) return
    expect(findPlugin(plugin.id.toUpperCase())).toEqual(plugin)
    expect(packagePath(plugin)).toMatch(/^\/packages\//)
    expect(installCommand(plugin)).toBeNull()
  })
})
