import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// `curl -fsSL https://acryl.dev/install | bash` is the README's headline install. The site is a single-page app that answers every unknown path with its HTML, so the
// installer must exist as a real file under public/ or the command pipes a web page into bash.
describe('the one-line installer', () => {
  for (const name of ['install', 'install.sh']) {
    it(`public/${name} is the shell script, not a web page`, () => {
      const text = readFileSync(resolve(process.cwd(), 'public', name), 'utf8')
      expect(text.startsWith('#!/usr/bin/env bash')).toBe(true)
      expect(text).not.toContain('<html')
      expect(text).toContain('acryl-release-manifest.json')
    })
  }
})
