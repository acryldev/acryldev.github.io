import { describe, expect, it } from 'vitest'
import { createPathOf, downloadUrl, INSTALLERS, MAKE_STEPS, FIRST_START, platformOf, SHARE_APP_IN_CONTROL_CENTER, SHARE_APP_IN_THE_APP, SHARE_PLUGIN_STEPS } from './controlCenter'

describe('the Control Center install block', () => {
  it('reads the visitor system from the browser', () => {
    expect(platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15')).toBe('mac')
    expect(platformOf('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130')).toBe('windows')
    expect(platformOf('Mozilla/5.0 (X11; Linux x86_64) Firefox/130')).toBe('linux')
    expect(platformOf('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari')).toBe('other')
    expect(platformOf('Mozilla/5.0 (Linux; Android 14) Chrome/130')).toBe('other')
  })
  it('links every installer on the latest release', () => {
    expect(INSTALLERS.map(downloadUrl)).toContain('https://github.com/acryldev/acryl/releases/download/control-center-v0.2.0/ACRYL-Control-Center-mac-arm64.dmg')
    expect(INSTALLERS).toHaveLength(6)
    expect(INSTALLERS.filter(installer => installer.primary).map(installer => installer.id)).toEqual(['mac-arm64', 'mac-x64', 'win-x64', 'linux-x64'])
  })
  it('tells a participant where to click, with the Blueprint name in the path', () => {
    expect(createPathOf('Notes')).toBe('In Control Center: Blends store > Notes > Make an app > Make it')
    expect(MAKE_STEPS.join(' ')).toContain('Make an app')
  })
  it('says the first-start line per system, with no terminal command', () => {
    for (const line of Object.values(FIRST_START)) expect(line).not.toMatch(/\bsudo\b|\bapt\b|\bnpm\b/)
    expect(FIRST_START.linux).toContain('Double-click')
  })
  it('keeps every step to one action and shows no terminal command', () => {
    for (const step of [...MAKE_STEPS, ...SHARE_APP_IN_CONTROL_CENTER, ...SHARE_APP_IN_THE_APP, ...SHARE_PLUGIN_STEPS]) expect(step).not.toMatch(/\bnpm\b|\bnpx\b|\$ /)
  })
})
