import { Download } from 'lucide-react'
import { useMemo } from 'react'
import { downloadUrl, FIRST_START, INSTALLERS, platformOf, CONTROL_CENTER_RELEASES, type Installer } from '../../lib/controlCenter'

function Button({ installer, highlighted }: { readonly installer: Installer; readonly highlighted: boolean }) {
  return (
    <a className={`button${highlighted ? '' : ' secondary'}`} href={downloadUrl(installer)} download>
      <Download aria-hidden="true" /> {installer.label}
    </a>
  )
}

/** Step one for everyone: the installer for this visitor's system first, the others a click away. */
export function InstallControlCenter() {
  const platform = useMemo(() => typeof navigator === 'undefined' ? 'other' : platformOf(navigator.userAgent, navigator.platform), [])
  const mine = INSTALLERS.filter(installer => installer.platform === platform)
  const lead = mine.filter(installer => installer.primary)
  const shown = lead.length > 0 ? lead : INSTALLERS.filter(installer => installer.primary)
  const rest = INSTALLERS.filter(installer => installer.platform !== platform && !shown.includes(installer))
  const small = mine.filter(installer => !installer.primary)
  return (
    <section className="workshop-install" aria-labelledby="workshop-install-title">
      <div>
        <p className="eyebrow">Step 1</p>
        <h2 id="workshop-install-title">Install ACRYL Control Center</h2>
        <p>It is the app you build in today. Install it, open it, and pick a Blueprint. No terminal needed.</p>
      </div>
      <div className="workshop-install-actions">
        {platform === 'other' && <p className="workshop-note-inline">Install it on your laptop or desktop. Pick yours:</p>}
        <div className="workshop-install-buttons">
          {shown.map(installer => <Button key={installer.id} installer={installer} highlighted={lead.length > 0} />)}
        </div>
        {lead.length > 1 && <p className="workshop-note-inline">{lead[1]?.hint}.</p>}
        {lead.length === 1 && <p className="workshop-note-inline">{lead[0]?.hint}.</p>}
        {platform !== 'other' && <p className="workshop-note-inline"><strong>First time:</strong> {FIRST_START[platform]}</p>}
        {(small.length > 0 || rest.length > 0) && (
          <details className="workshop-install-more">
            <summary>Another system</summary>
            <ul>
              {[...small, ...rest].map(installer => <li key={installer.id}><a href={downloadUrl(installer)} download>{installer.label}</a> <span>{installer.hint}</span></li>)}
              {platform === 'other' && (['mac', 'windows', 'linux'] as const).map(system => <li key={system}><span><strong>First time:</strong> {FIRST_START[system]}</span></li>)}
              <li><a href={CONTROL_CENTER_RELEASES} target="_blank" rel="noreferrer">All downloads</a></li>
            </ul>
          </details>
        )}
      </div>
    </section>
  )
}
