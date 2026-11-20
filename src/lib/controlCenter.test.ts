import { describe, expect, it } from 'vitest'
import { createPathOf, downloadUrl, INSTALLERS, platformOf, sharePathOf } from './controlCenter'

describe('the Control Center install block', () => {
  it('reads the visitor system from the browser', () => {
    expect(platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15')).toBe('mac')
    expect(platformOf('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130')).toBe('windows')
    expect(platformOf('Mozilla/5.0 (X11; Linux x86_64) Firefox/130')).toBe('linux')
    expect(platformOf('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari')).toBe('other')
    expect(platformOf('Mozilla/5.0 (Linux; Android 14) Chrome/130')).toBe('other')
  })
  it('links every installer on the latest release', () => {
    expect(INSTALLERS.map(downloadUrl)).toContain('https://github.com/acrylblends/63-acryl-control-center/releases/latest/download/ACRYL-Control-Center-mac-arm64.dmg')
    expect(INSTALLERS.filter(installer => installer.primary).map(installer => installer.id)).toEqual(['mac-arm64', 'mac-x64', 'win-x64', 'linux-x64'])
  })
  it('tells a participant where to click, with the Blueprint name in the path', () => {
    expect(createPathOf('Notes')).toBe('In Control Center: Blends > Notes > Create')
    expect(sharePathOf('My app')).toContain('My app')
  })
})
