import { useState } from 'react'
import { CommandBox } from './CommandBox'

/** The one-line install of ACRYL Control Center (public/install.sh, public/install.ps1), for the visitor's OS first; a tab switches. */
const installs = {
  unix: { tab: 'macOS / Linux', command: 'curl -fsSL https://acryl.dev/install.sh | bash', label: 'Install ACRYL Control Center' },
  windows: { tab: 'Windows', command: 'irm https://acryl.dev/install.ps1 | iex', label: 'Install ACRYL Control Center (PowerShell)' },
} as const
type Os = keyof typeof installs

const visitorOs = (): Os => (typeof navigator !== 'undefined' && /win/i.test(navigator.userAgent) && !/darwin|mac/i.test(navigator.userAgent) ? 'windows' : 'unix')

export function InstallBox() {
  const [os, setOs] = useState<Os>(visitorOs)
  return (
    <div className="install-box">
      <div className="film-switch" role="tablist" aria-label="Choose your system">
        {(Object.keys(installs) as Os[]).map(key => (
          <button key={key} type="button" role="tab" aria-selected={key === os} className={key === os ? 'active' : undefined} onClick={() => setOs(key)}>{installs[key].tab}</button>
        ))}
      </div>
      <CommandBox command={installs[os].command} label={installs[os].label} />
      <p className="install-note">No admin, no Node. The download is checked against GitHub's sha256; Windows and macOS open it without warnings because it is not browser-downloaded.</p>
    </div>
  )
}
