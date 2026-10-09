/**
 * Where the latest ACRYL Desktop installers are. From 0.2.2 every surface (CLI, Web, Desktop) is one `v<version>` GitHub release, so `releases/latest` is the one;
 * releases up to 0.2.1 kept the installers in a separate `desktop-v<version>` release. This finds the highest-version published release that really carries
 * installers, whichever of the two it is, and builds one direct link per platform from the constant asset names the release workflow publishes.
 */

export type DesktopOs = 'macOS' | 'Windows' | 'Linux'

export interface DesktopDownload {
  readonly id: string
  readonly os: DesktopOs
  /** What the person picks between inside one OS: the CPU or the package kind. */
  readonly detail: string
  /** The constant asset name in the Desktop release (`apps/acryl-desktop` `artifactName`). */
  readonly asset: string
}

export const DESKTOP_DOWNLOADS: readonly DesktopDownload[] = [
  { id: 'mac-arm64', os: 'macOS', detail: 'Apple Silicon · DMG', asset: 'acryl-desktop-mac-arm64.dmg' },
  { id: 'mac-x64', os: 'macOS', detail: 'Intel · DMG', asset: 'acryl-desktop-mac-x64.dmg' },
  { id: 'win-x64', os: 'Windows', detail: 'x64 · Installer', asset: 'acryl-desktop-win-x64.exe' },
  { id: 'linux-amd64', os: 'Linux', detail: 'x64 · Debian .deb', asset: 'acryl-desktop-linux-amd64.deb' },
  { id: 'linux-arm64', os: 'Linux', detail: 'arm64 · Debian .deb', asset: 'acryl-desktop-linux-arm64.deb' },
]

export const REPOSITORY = 'https://github.com/acryldev/acryl'
/** Where every release is listed; the target of a button until (or unless) the newest Desktop release is known. */
export const ALL_RELEASES_URL = `${REPOSITORY}/releases?q=desktop-v&expanded=true`
export const RELEASES_API = 'https://api.github.com/repos/acryldev/acryl/releases?per_page=30'

/** The part of a GitHub release this reads. */
export interface GithubRelease {
  readonly tag_name?: unknown
  readonly draft?: unknown
  readonly prerelease?: unknown
  readonly assets?: unknown
}

export interface DesktopRelease {
  readonly tag: string
  readonly version: string
  /** Asset names the release really has, so a button never links an installer that was not published. */
  readonly assets: ReadonlySet<string>
}

const DESKTOP_TAG = /^(?:desktop-)?v(\d+)\.(\d+)\.(\d+)$/u

function compare(a: readonly number[], b: readonly number[]): number {
  for (let index = 0; index < 3; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0)
    if (difference !== 0) return difference
  }
  return 0
}

/**
 * The highest-version published, non-prerelease release in a GitHub releases listing that carries at least one Desktop installer, or undefined when there is none.
 * Highest version, not newest date: a patch release of an older line must not displace a newer minor. A release without installers (a CLI-only one) is skipped, so
 * the buttons never point at a release that has nothing to download; on an equal version the `v` release wins over the old `desktop-v` one.
 */
export function latestDesktopRelease(releases: readonly GithubRelease[]): DesktopRelease | undefined {
  let best: { release: DesktopRelease; parts: readonly number[] } | undefined
  for (const release of releases) {
    if (typeof release.tag_name !== 'string' || release.draft === true || release.prerelease === true) continue
    const match = DESKTOP_TAG.exec(release.tag_name)
    if (match === null) continue
    const parts = [Number(match[1]), Number(match[2]), Number(match[3])]
    const assets = new Set<string>()
    if (Array.isArray(release.assets)) {
      for (const asset of release.assets as ReadonlyArray<{ readonly name?: unknown }>) if (typeof asset.name === 'string') assets.add(asset.name)
    }
    if (!DESKTOP_DOWNLOADS.some(item => assets.has(item.asset))) continue
    const order = best === undefined ? 1 : compare(parts, best.parts)
    if (order < 0 || (order === 0 && !release.tag_name.startsWith('v'))) continue
    best = { parts, release: { tag: release.tag_name, version: parts.join('.'), assets } }
  }
  return best?.release
}

/** The direct download link of one installer in a Desktop release. */
export function downloadUrl(tag: string, asset: string): string {
  return `${REPOSITORY}/releases/download/${tag}/${asset}`
}

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
