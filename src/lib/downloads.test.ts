import { describe, expect, it } from 'vitest'
import { ALL_RELEASES_URL, DESKTOP_DOWNLOADS, detectOs, downloadUrl, latestDesktopRelease, orderForOs } from './downloads'

const release = (tag: string, names: string[] = [], extra: Record<string, unknown> = {}) => ({ tag_name: tag, assets: names.map(name => ({ name })), ...extra })

const installers = ['acryl-desktop-mac-arm64.dmg', 'acryl-desktop-win-x64.exe']

describe('latestDesktopRelease', () => {
  it('finds the highest version that carries installers, skipping CLI-only releases, drafts and prereleases', () => {
    const found = latestDesktopRelease([
      release('v0.2.3', ['acryl-cli-linux-x64.tar.gz']),
      release('v0.2.2', installers),
      release('desktop-v0.2.1', installers),
      release('v0.9.0', installers, { draft: true }),
      release('v0.4.0-alpha.1', installers, { prerelease: true }),
    ])
    expect(found?.tag).toBe('v0.2.2')
    expect(found?.version).toBe('0.2.2')
    expect(found?.assets.has('acryl-desktop-mac-arm64.dmg')).toBe(true)
  })

  it('still finds the separate desktop-v release older versions used', () => {
    expect(latestDesktopRelease([release('v0.2.1', ['acryl-cli-linux-x64.tar.gz']), release('desktop-v0.2.1', installers)])?.tag).toBe('desktop-v0.2.1')
  })

  it('prefers the one release over a desktop-v one of the same version', () => {
    expect(latestDesktopRelease([release('desktop-v0.2.2', installers), release('v0.2.2', installers)])?.tag).toBe('v0.2.2')
    expect(latestDesktopRelease([release('v0.2.2', installers), release('desktop-v0.2.2', installers)])?.tag).toBe('v0.2.2')
  })

  it('compares versions, not strings or dates', () => {
    expect(latestDesktopRelease([release('v0.9.0', installers), release('v0.10.0', installers), release('v0.2.9', installers)])?.tag).toBe('v0.10.0')
  })

  it('answers undefined when no release carries installers, or the listing is malformed', () => {
    expect(latestDesktopRelease([release('v0.2.1', ['acryl-cli-linux-x64.tar.gz'])])).toBeUndefined()
    expect(latestDesktopRelease([{ tag_name: 7 }, {}] as never)).toBeUndefined()
    expect(latestDesktopRelease([])).toBeUndefined()
  })
})

describe('downloads', () => {
  it('builds direct links from the constant asset names of the Desktop release', () => {
    expect(downloadUrl('desktop-v0.2.1', 'acryl-desktop-win-x64.exe')).toBe('https://github.com/acryldev/acryl/releases/download/desktop-v0.2.1/acryl-desktop-win-x64.exe')
  })

  it('offers exactly the five installers the release publishes', () => {
    expect(DESKTOP_DOWNLOADS.map(item => item.asset)).toEqual([
      'acryl-desktop-mac-arm64.dmg', 'acryl-desktop-mac-x64.dmg', 'acryl-desktop-win-x64.exe', 'acryl-desktop-linux-amd64.deb', 'acryl-desktop-linux-arm64.deb',
    ])
    expect(ALL_RELEASES_URL).toContain('desktop-v')
  })

  it('puts the visitor\'s OS first and keeps the rest', () => {
    expect(orderForOs('Windows').map(item => item.id)).toEqual(['win-x64', 'mac-arm64', 'mac-x64', 'linux-amd64', 'linux-arm64'])
    expect(orderForOs('Linux')[0]?.os).toBe('Linux')
    expect(orderForOs(undefined)).toEqual(DESKTOP_DOWNLOADS)
  })

  it('detects the OS and answers nothing for phones', () => {
    expect(detectOs('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Windows')
    expect(detectOs('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('macOS')
    expect(detectOs('Mozilla/5.0 (X11; Ubuntu; Linux x86_64)')).toBe('Linux')
    expect(detectOs('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBeUndefined()
    expect(detectOs('Mozilla/5.0 (Linux; Android 14)')).toBeUndefined()
  })
})
