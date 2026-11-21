import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// `curl -fsSL https://acryl.dev/install | bash` was the README's headline install and is retired. The site is a single-page app that answers every unknown path
// with its HTML, so the retired installer must stay a real file under public/ (one that points at `npx acryl@latest`) or the command pipes a web page into bash.
describe('the retired one-line installer', () => {
  for (const name of ['install', 'install.sh']) {
    it(`public/${name} is a shell script that points at npx acryl@latest, not a web page`, () => {
      const text = readFileSync(resolve(process.cwd(), 'public', name), 'utf8')
      expect(text.startsWith('#!/usr/bin/env bash')).toBe(true)
      expect(text).not.toContain('<html')
      expect(text).toContain('npx acryl@latest')
      expect(text).toContain('exit 1')
    })
  }
})
