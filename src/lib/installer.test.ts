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
    it(`public/${name} makes sure git is there first: Apple's Command Line Tools on macOS, the system's package manager on Linux`, () => {
      const text = readFileSync(resolve(process.cwd(), 'public', name), 'utf8')
      // macOS: Apple's own dialog, then wait (with a limit) until git works.
      expect(text).toContain('xcode-select --install')
      expect(text).toContain('ACRYL_GIT_WAIT')
      // Linux: git and the libraries Electron links to, by apt, dnf or pacman, after one question read from the terminal (stdin is the script).
      for (const word of ['apt-get', 'dnf', 'pacman']) expect(text).toContain(word)
      for (const lib of ['libgtk-3-0', 'libnss3', 'libasound2', 'libxss1', 'libgbm1']) expect(text).toContain(lib)
      expect(text).toContain('${base}t64') // Ubuntu 24.04 names some with a t64 suffix
      expect(text).toContain('/dev/tty')
      expect(text).toContain('ACRYL_YES')
      // Without sudo the exact command is printed, and the install goes on.
      expect(text).toContain('There is no sudo here')
      // Whatever is missing is never fatal, and the app's own steps stay.
      expect(text).toContain('ACRYL_NO_LAUNCH')
      expect(text).toContain('ACRYL_PREFIX')
    })
  }
  it('public/install.ps1 installs it on Windows and checks the download', () => {
    const text = readFileSync(resolve(process.cwd(), 'public', 'install.ps1'), 'utf8')
    expect(text).toContain('acrylblends/63-acryl-control-center')
    expect(text).toContain('Get-FileHash -Algorithm SHA256')
  })
  it('public/install.ps1 installs git with winget for this user when it is missing, and says where to get it without winget', () => {
    const text = readFileSync(resolve(process.cwd(), 'public', 'install.ps1'), 'utf8')
    expect(text).toContain('winget install --id Git.Git -e --scope user --silent --accept-source-agreements --accept-package-agreements')
    expect(text).toContain("GetEnvironmentVariable('Path', 'User')")
    expect(text).toContain('https://git-scm.com/download/win')
    expect(text).toContain('ACRYL_YES')
  })
  it('public/install and public/install.sh are the same file', () => {
    expect(readFileSync(resolve(process.cwd(), 'public', 'install'), 'utf8')).toBe(readFileSync(resolve(process.cwd(), 'public', 'install.sh'), 'utf8'))
  })
})
