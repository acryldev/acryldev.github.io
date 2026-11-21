/**
 * Where ACRYL ADE's installers are: its own release repository, whose `releases/latest/download/<file>` links never change, whichever version is the latest
 * (the same arrangement as Control Center, src/lib/controlCenter.ts). The earlier ACRYL desktop's installers in acryldev/acryl are no longer offered here.
 */

export type DesktopOs = 'macOS' | 'Windows' | 'Linux'

export interface DesktopDownload {
  readonly id: string
  readonly os: DesktopOs
  /** What the person picks between inside one OS: the CPU or the package kind. */
  readonly detail: string
  /** The installer's file name in every ADE release. */
  readonly file: string
}

export const ADE_REPOSITORY = 'https://github.com/acrylblends/05-acryl-ade'
export const ADE_RELEASES = `${ADE_REPOSITORY}/releases/latest`

export const DESKTOP_DOWNLOADS: readonly DesktopDownload[] = [
  { id: 'mac-arm64', os: 'macOS', detail: 'Apple Silicon · DMG', file: 'ACRYL-ADE-mac-arm64.dmg' },
  { id: 'mac-x64', os: 'macOS', detail: 'Intel · DMG', file: 'ACRYL-ADE-mac-x64.dmg' },
  { id: 'win-x64', os: 'Windows', detail: 'x64 · Installer', file: 'ACRYL-ADE-win-x64.exe' },
  { id: 'win-arm64', os: 'Windows', detail: 'ARM · Installer', file: 'ACRYL-ADE-win-arm64.exe' },
  { id: 'linux-x64', os: 'Linux', detail: 'x64 · Debian .deb', file: 'ACRYL-ADE-linux-x64.deb' },
  { id: 'linux-arm64', os: 'Linux', detail: 'arm64 · Debian .deb', file: 'ACRYL-ADE-linux-arm64.deb' },
]

/** The direct link of one installer in ADE's latest release. */
export const downloadUrl = (item: DesktopDownload): string => `${ADE_RELEASES}/download/${item.file}`

/** The OS a browser reports, or undefined when it cannot be told (a phone, an unknown agent). */
export function detectOs(userAgent: string): DesktopOs | undefined {
  if (/android|iphone|ipad|ipod/iu.test(userAgent)) return undefined
  if (/windows/iu.test(userAgent)) return 'Windows'
  if (/macintosh|mac os x/iu.test(userAgent)) return 'macOS'
  if (/linux|x11|cros/iu.test(userAgent)) return 'Linux'
  return undefined
}

/** The downloads with the visitor's OS first; the order inside an OS and between the others is unchanged. */
export function orderForOs(os: DesktopOs | undefined): readonly DesktopDownload[] {
  if (os === undefined) return DESKTOP_DOWNLOADS
  return [...DESKTOP_DOWNLOADS.filter(item => item.os === os), ...DESKTOP_DOWNLOADS.filter(item => item.os !== os)]
}
