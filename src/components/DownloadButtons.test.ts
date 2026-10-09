import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DownloadButtons } from './DownloadButtons'

const releases = [
  { tag_name: 'v0.2.1', draft: false, prerelease: false, assets: [{ name: 'acryl-cli-linux-x64.tar.gz' }] },
  { tag_name: 'desktop-v0.2.1', draft: false, prerelease: false, assets: ['acryl-desktop-mac-arm64.dmg', 'acryl-desktop-mac-x64.dmg', 'acryl-desktop-win-x64.exe', 'acryl-desktop-linux-amd64.deb', 'acryl-desktop-linux-arm64.deb'].map(name => ({ name })) },
]

beforeEach(() => { window.sessionStorage.clear() })
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('DownloadButtons', () => {
  it('points each platform at its installer in the newest Desktop release', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => releases }))
    render(createElement(DownloadButtons))
    expect(await screen.findByText(/v0\.2\.1/u)).toBeTruthy()
    const base = 'https://github.com/acryldev/acryl/releases/download/desktop-v0.2.1/'
    expect(screen.getByRole('link', { name: /Apple Silicon/u }).getAttribute('href')).toBe(`${base}acryl-desktop-mac-arm64.dmg`)
    expect(screen.getByRole('link', { name: /Intel/u }).getAttribute('href')).toBe(`${base}acryl-desktop-mac-x64.dmg`)
    expect(screen.getByRole('link', { name: /Installer/u }).getAttribute('href')).toBe(`${base}acryl-desktop-win-x64.exe`)
    expect(screen.getByRole('link', { name: /x64 · Debian/u }).getAttribute('href')).toBe(`${base}acryl-desktop-linux-amd64.deb`)
    expect(screen.getByRole('link', { name: /arm64 · Debian/u }).getAttribute('href')).toBe(`${base}acryl-desktop-linux-arm64.deb`)
  })

  it('keeps every button on the release list when the lookup fails, so none is dead', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    render(createElement(DownloadButtons))
    const links = screen.getAllByRole('link').filter(link => /DMG|Installer|Debian/u.test(link.textContent ?? ''))
    expect(links).toHaveLength(5)
    for (const link of links) expect(link.getAttribute('href')).toContain('/releases?q=desktop-v')
  })

  it('links an installer the release does not carry to the release list, not to a 404', async () => {
    const partial = [{ tag_name: 'desktop-v0.2.1', assets: [{ name: 'acryl-desktop-win-x64.exe' }] }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => partial }))
    render(createElement(DownloadButtons))
    expect(await screen.findByText(/v0\.2\.1/u)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Installer/u }).getAttribute('href')).toContain('acryl-desktop-win-x64.exe')
    expect(screen.getByRole('link', { name: /Apple Silicon/u }).getAttribute('href')).toContain('/releases?q=desktop-v')
  })
})
