import { describe, expect, it } from 'vitest'
import { ADE_RELEASES, DESKTOP_DOWNLOADS, detectOs, downloadUrl, orderForOs } from './downloads'

describe('ACRYL ADE downloads', () => {
  it('link each installer in ADE\'s latest release by its constant name', () => {
    expect(ADE_RELEASES).toBe('https://github.com/acrylblends/05-acryl-ade/releases/latest')
    expect(DESKTOP_DOWNLOADS.map(downloadUrl)).toEqual(['mac-arm64.dmg', 'mac-x64.dmg', 'win-x64.exe', 'win-arm64.exe', 'linux-x64.deb', 'linux-arm64.deb']
      .map(file => `https://github.com/acrylblends/05-acryl-ade/releases/latest/download/ACRYL-ADE-${file}`))
  })

  it('tells the visitor\'s OS and puts it first, keeping the rest', () => {
    expect(detectOs('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('macOS')
    expect(detectOs('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Windows')
    expect(detectOs('Mozilla/5.0 (X11; Linux x86_64)')).toBe('Linux')
    expect(detectOs('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)')).toBeUndefined()
    expect(orderForOs('Linux').map(item => item.os)).toEqual(['Linux', 'Linux', 'macOS', 'macOS', 'Windows', 'Windows'])
    expect(orderForOs(undefined)).toBe(DESKTOP_DOWNLOADS)
  })
})
