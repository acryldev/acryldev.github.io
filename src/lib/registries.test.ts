import { describe, expect, it } from 'vitest'
import { blendManifestUrl, blendPageUrl, facetCounts, matches, newAppCommand, parseBlendIndex, parsePluginIndex } from './registries'

// Real entries from the two live indexes (2026-10-19), shortened.
const gtd = { id: 'acryl.gtd', name: 'GTD Planner', kind: 'Blueprint', version: '0.1.0', path: 'blends/acryl.gtd', license: 'MIT', category: 'productivity', description: 'Getting Things Done.', parent: 'acryl.blank', runtime: 'acryl' }
const blank = { id: 'acryl.blank', name: 'Blank', kind: 'Blueprint', version: '0.1.0', path: 'blends/acryl.blank', license: 'MIT', category: 'starter', description: 'The smallest working agent.', runtime: 'acryl' }
// Real entry from the live index (2026-11-13), shortened.
const csv = { id: 'acrylblends.csv-explorer', name: 'CSV Explorer', kind: 'Blueprint', version: '0.1.0', path: 'blends/acrylblends.csv-explorer', license: 'MIT', category: 'data', description: 'Explore a CSV.', runtime: 'acrylblends' }
const zen = {
  id: 'a42null-dsh-opencode-zen-plugin', name: '@a42null/dsh-opencode-zen-plugin', description: 'OpenCode Console (Zen) models.', category: 'providers',
  compatibility: 'DSH stock', publisher: 'A42Null', repo: 'https://github.com/A42Null/dsh-opencode-zen-plugin',
  page: 'https://cordisplugins.github.io/plugins/p/a42null-dsh-opencode-zen-plugin', acrylPackage: false, provides: [], consumes: [],
  version: '0.3.6', releaseTag: 'v0.3.6', published: '2026-10-04', tarball: 'https://github.com/A42Null/dsh-opencode-zen-plugin/releases/download/v0.3.6/p.tgz',
  integrity: 'sha512-abc', install: 'dsh plugin --profile desktop add https://github.com/A42Null/dsh-opencode-zen-plugin/releases/download/v0.3.6/p.tgz',
  acrylPull: '/plugin pull github:A42Null/dsh-opencode-zen-plugin@0.3.6',
}
const unreleased = { id: 'acryl-quick-notes', name: 'acryl-quick-notes', description: '', category: 'tools', compatibility: 'ACRYL', publisher: 'inboxxobni', repo: 'https://github.com/inboxxobni/acryl-quick-notes', page: 'https://cordisplugins.github.io/plugins/p/acryl-quick-notes', acrylPackage: true, provides: ['notes'], consumes: [] }

describe('Blend registry index', () => {
  it('reads entries, keeps the parent only when present, and ignores unknown fields', () => {
    const entries = parseBlendIndex({ formatVersion: 1, entries: [blank, { ...gtd, futureField: 1 }] })
    expect(entries).toEqual([blank, gtd])
    expect(entries[0]).not.toHaveProperty('parent')
  })

  it('skips a malformed entry instead of failing the page', () => {
    expect(parseBlendIndex({ formatVersion: 1, entries: [gtd, { ...gtd, path: '../escape' }, { id: 'x' }, null] })).toEqual([gtd])
  })

  it('refuses another formatVersion', () => {
    expect(() => parseBlendIndex({ formatVersion: 2, entries: [] })).toThrow(/formatVersion 1/)
    expect(() => parseBlendIndex('<html>')).toThrow()
  })

  it('links the manifest and the page', () => {
    const [entry] = parseBlendIndex({ formatVersion: 1, entries: [gtd] })
    expect(blendManifestUrl(entry)).toBe('https://acrylblends.github.io/registry/blends/acryl.gtd/blend.yaml')
    expect(blendPageUrl(entry)).toBe('https://acrylblends.github.io/blends/b/acryl.gtd')
  })

  it('offers the create command only for a Blend acryl new can make an app from', () => {
    const [app, starter, unknown] = parseBlendIndex({ formatVersion: 1, entries: [csv, gtd, { ...csv, id: 'x.future', runtime: 'future' }] })
    expect(newAppCommand(app)).toBe('npx acryl new my-app --from acrylblends.csv-explorer')
    expect(starter.runtime).toBe('acryl')
    expect(newAppCommand(starter)).toBeUndefined()
    expect(unknown.runtime).toBe('other')
    expect(newAppCommand(unknown)).toBeUndefined()
  })
})

describe('Cordis plugin registry index', () => {
  it('groups release fields under release only for a released plugin', () => {
    const [released, plain] = parsePluginIndex({ formatVersion: 1, entries: [zen, unreleased] })
    expect(released.release).toEqual({ version: '0.3.6', releaseTag: 'v0.3.6', published: '2026-10-04', tarball: zen.tarball, integrity: 'sha512-abc', install: zen.install, acrylPull: zen.acrylPull })
    expect(plain).not.toHaveProperty('release')
    expect(plain.description).toBe('')
  })

  it('skips entries with an unknown compatibility, a non-https repo or missing lists', () => {
    const entries = parsePluginIndex({ formatVersion: 1, entries: [{ ...zen, compatibility: 'Maybe' }, { ...zen, repo: 'http://x' }, { ...zen, provides: 'notes' }, zen] })
    expect(entries.map(entry => entry.id)).toEqual([zen.id])
  })
})

describe('filtering', () => {
  it('matches text across fields and one exact facet', () => {
    expect(matches(['GTD Planner', 'acryl.gtd'], 'gtd', 'productivity', 'all')).toBe(true)
    expect(matches(['GTD Planner'], 'gtd', 'productivity', 'starter')).toBe(false)
    expect(matches(['GTD Planner', undefined], '  ', 'productivity', 'productivity')).toBe(true)
  })

  it('counts facets, most common first', () => {
    expect(facetCounts(['tools', 'providers', 'tools'])).toEqual([{ value: 'tools', count: 2 }, { value: 'providers', count: 1 }])
  })
})
