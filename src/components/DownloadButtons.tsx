import { Apple, Download, Monitor, Terminal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ALL_RELEASES_URL, RELEASES_API, REPOSITORY, detectOs, downloadUrl, latestDesktopRelease, orderForOs, type DesktopOs, type DesktopRelease } from '../lib/downloads'

const CACHE_KEY = 'acryl-desktop-release'
const CACHE_MS = 10 * 60 * 1000

const icons: Record<DesktopOs, typeof Apple> = { macOS: Apple, Windows: Monitor, Linux: Terminal }

interface CachedRelease { readonly at: number; readonly tag: string; readonly version: string; readonly assets: readonly string[] }

function readCache(): DesktopRelease | undefined {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY)
    if (raw === null) return undefined
    const cached = JSON.parse(raw) as CachedRelease
    if (Date.now() - cached.at > CACHE_MS) return undefined
    return { tag: cached.tag, version: cached.version, assets: new Set(cached.assets) }
  } catch { return undefined }
}

function writeCache(release: DesktopRelease): void {
  try {
    const cached: CachedRelease = { at: Date.now(), tag: release.tag, version: release.version, assets: [...release.assets] }
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch { /* storage can be blocked; the lookup then just runs again next time */ }
}

/**
 * One download button per platform, each pointing at the installer of the newest published Desktop release. The lookup is a single unauthenticated GitHub
 * API call (cached for ten minutes per tab); until it answers, or if it fails, every button opens the Desktop release list, so a visitor is never left with a dead button.
 */
export function DownloadButtons() {
  const [release, setRelease] = useState<DesktopRelease | undefined>(() => (typeof window === 'undefined' ? undefined : readCache()))
  useEffect(() => {
    if (release !== undefined) return undefined
    const controller = new AbortController()
    fetch(RELEASES_API, { signal: controller.signal, headers: { accept: 'application/vnd.github+json' } })
      .then(response => (response.ok ? response.json() as Promise<unknown> : undefined))
      .then(body => {
        if (!Array.isArray(body)) return
        const found = latestDesktopRelease(body)
        if (found === undefined) return
        writeCache(found)
        setRelease(found)
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [release])
  const ordered = useMemo(() => orderForOs(typeof navigator === 'undefined' ? undefined : detectOs(navigator.userAgent)), [])
  return (
    <div className="download-block" aria-label="Download ACRYL Desktop">
      <div className="command-label">
        <Download aria-hidden="true" />Download ACRYL Desktop{release === undefined ? '' : ` · v${release.version}`}
      </div>
      <div className="download-grid">
        {ordered.map((item, index) => {
          const Icon = icons[item.os]
          const href = release !== undefined && release.assets.has(item.asset) ? downloadUrl(release.tag, item.asset) : ALL_RELEASES_URL
          return (
            <a key={item.id} className={index === 0 ? 'button download-button' : 'button secondary download-button'} href={href} rel="noreferrer">
              <Icon aria-hidden="true" />
              <span>{item.os}</span>
              <em>{item.detail}</em>
            </a>
          )
        })}
      </div>
      <p className="download-note">
        Not code-signed yet: macOS asks you to confirm the first launch (right-click, Open) and Windows SmartScreen offers More info, then Run anyway.{' '}
        <a href={`${REPOSITORY}/releases`} target="_blank" rel="noreferrer">All releases</a>
      </p>
    </div>
  )
}
