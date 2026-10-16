import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { catalogPluginFromRelease, integrityOf, mergeCatalogEntries, packageJsonFromTarball } from './github-releases.mjs'

const made = []
afterEach(() => { for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true }) })

function tarball(manifest) {
  const dir = mkdtempSync(join(tmpdir(), 'acryl-catalog-'))
  made.push(dir)
  mkdirSync(join(dir, 'package'))
  writeFileSync(join(dir, 'package', 'package.json'), JSON.stringify(manifest))
  writeFileSync(join(dir, 'package', 'index.js'), 'export {}\n')
  execFileSync('tar', ['-czf', join(dir, 'p.tgz'), '-C', dir, 'package'])
  return readFileSync(join(dir, 'p.tgz'))
}

const quickNotes = {
  name: 'acryl-quick-notes',
  version: '0.2.2',
  description: 'Quick Notes',
  keywords: ['acryl-package', 'cordis-plugin', 'dsh-plugin'],
  repository: { type: 'git', url: 'git+https://github.com/inboxxobni/acryl-quick-notes.git' },
  dsh: { bundle: { patch: './cordis.patch.yml' } },
  acryl: {
    schemaVersion: 1,
    artifacts: { plugins: ['./index.js'] },
    requires: { host: ['connection', 'dshHomePath', 'webServer'], client: ['connection', 'slots'] },
    provides: { host: [], client: [] },
    slots: { offers: [], fills: ['conversation.session.header.actions'] },
  },
}
const release = { tag_name: 'v0.2.2', published_at: '2026-10-16T05:00:00Z' }
const asset = { name: 'acryl-quick-notes-0.2.2.tgz', browser_download_url: 'https://github.com/inboxxobni/acryl-quick-notes/releases/download/v0.2.2/acryl-quick-notes-0.2.2.tgz' }

describe('ACRYL packages shared as GitHub releases', () => {
  it('reads package.json from inside the release tarball without running anything', () => {
    expect(packageJsonFromTarball(tarball(quickNotes))).toEqual(quickNotes)
  })

  it('lists a release with its tarball, sha512, contract and an install line stock DSH also accepts', () => {
    const bytes = tarball(quickNotes)
    const entry = catalogPluginFromRelease({ manifest: quickNotes, repository: 'https://github.com/inboxxobni/acryl-quick-notes', owner: 'inboxxobni', release, asset, integrity: integrityOf(bytes) })
    expect(entry).toMatchObject({
      id: 'acryl-quick-notes', version: '0.2.2', source: 'acryl', added: '2026-10-16', publisher: 'inboxxobni', manifestStatus: 'valid', kinds: ['plugins'],
      repository: 'https://github.com/inboxxobni/acryl-quick-notes', tarball: asset.browser_download_url, releaseTag: 'v0.2.2',
      install: `dsh plugin --profile desktop add ${asset.browser_download_url}`,
      requires: quickNotes.acryl.requires, slots: quickNotes.acryl.slots,
    })
    expect(entry.integrity).toMatch(/^sha512-[A-Za-z0-9+/]+=*$/u)
  })

  it('skips a release whose package lacks the exact label, and npm wins over GitHub for the same repository', () => {
    expect(catalogPluginFromRelease({ manifest: { ...quickNotes, keywords: ['dsh-plugin'] }, repository: 'r', owner: 'o', release, asset, integrity: 'x' })).toBeNull()
    const npm = [{ id: 'acryl-quick-notes', repository: 'https://github.com/inboxxobni/acryl-quick-notes', source: 'acryl' }]
    const gh = [{ id: 'acryl-quick-notes', repository: 'https://github.com/inboxxobni/ACRYL-quick-notes' }, { id: 'other', repository: 'https://github.com/o/other' }]
    expect(mergeCatalogEntries(npm, gh).map(entry => entry.id)).toEqual(['acryl-quick-notes', 'other'])
  })
})
