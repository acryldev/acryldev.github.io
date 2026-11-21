import { Apple, Download, Monitor, Terminal } from 'lucide-react'
import { useMemo } from 'react'
import { ADE_RELEASES, detectOs, downloadUrl, orderForOs, type DesktopOs } from '../lib/downloads'

const icons: Record<DesktopOs, typeof Apple> = { macOS: Apple, Windows: Monitor, Linux: Terminal }

/** One download button per platform, each a direct link to that installer in ACRYL ADE's latest release; the visitor's OS first. */
export function DownloadButtons() {
  const ordered = useMemo(() => orderForOs(typeof navigator === 'undefined' ? undefined : detectOs(navigator.userAgent)), [])
  return (
    <div className="download-block" aria-label="Download ACRYL ADE">
      <div className="command-label">
        <Download aria-hidden="true" />Download ACRYL ADE
      </div>
      <div className="download-grid">
        {ordered.map((item, index) => {
          const Icon = icons[item.os]
          return (
            <a key={item.id} className={index === 0 ? 'button download-button' : 'button secondary download-button'} href={downloadUrl(item)} rel="noreferrer">
              <Icon aria-hidden="true" />
              <span>{item.os}</span>
              <em>{item.detail}</em>
            </a>
          )
        })}
      </div>
      <p className="download-note">
        Not code-signed yet: macOS asks you to confirm the first launch (right-click, Open) and Windows SmartScreen offers More info, then Run anyway.{' '}
        <a href={ADE_RELEASES} target="_blank" rel="noreferrer">All files of the latest release</a>
      </p>
    </div>
  )
}
