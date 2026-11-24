import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// `curl -fsSL https://acryl.dev/install.sh | bash` (and the older `.../install`) installs ACRYL Control Center from its latest release (owner 2026-11-24;
// the earlier terminal installer it replaces was retired in 306b7f9). The site is a single-page app that answers every unknown path with its HTML, so
// each installer must be a real file under public/, or the command pipes a web page into a shell.
describe('the one-line installers', () => {
  for (const name of ['install', 'install.sh']) {
    it(`public/${name} installs ACRYL Control Center and checks the download, not a web page`, () => {
      const text = readFileSync(resolve(process.cwd(), 'public', name), 'utf8')
      expect(text.startsWith('#!/bin/sh')).toBe(true)
      expect(text).not.toContain('<html')
      expect(text).toContain('acrylblends/63-acryl-control-center')
      expect(text).toContain('nothing was installed')
    })
  }
  it('public/install.ps1 installs it on Windows and checks the download', () => {
    const text = readFileSync(resolve(process.cwd(), 'public', 'install.ps1'), 'utf8')
    expect(text).toContain('acrylblends/63-acryl-control-center')
    expect(text).toContain('Get-FileHash -Algorithm SHA256')
  })
})
