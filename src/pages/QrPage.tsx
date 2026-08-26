import { QRCodeSVG } from 'qrcode.react'

interface QrTarget {
  id: string
  label: string
  title: string
  url: string
  note: string
}

const qrTargets: QrTarget[] = [
  { id: 'website', label: 'Project', title: 'ACRYL.dev', url: 'https://acryl.dev/', note: 'The ACRYL website and source-aware package portal.' },
  { id: 'discord', label: 'Community', title: 'Join Discord', url: 'https://discord.gg/cY9KXMex69', note: 'Discuss ACRYL with the community.' },
  { id: 'github', label: 'Source', title: 'GitHub ACRYL', url: 'https://github.com/acryldev/acryl', note: 'Star the project and contribute.' },
]

export function QrPage() {
  return (
    <div className="qr-page page-width">
      <div className="qr-intro">
        <p className="eyebrow">Conference materials</p>
        <h1>Scan to connect.</h1>
        <p>Point a phone camera at any code to open the link instantly. Ready for booths, posters, and slides.</p>
      </div>
      <div className="qr-grid">
        {qrTargets.map((target) => (
          <article className="qr-card" key={target.id}>
            <div className="qr-code">
              <QRCodeSVG value={target.url} size={256} level="M" bgColor="#ffffff" fgColor="#171717" />
            </div>
            <p className="eyebrow">{target.label}</p>
            <h2>{target.title}</h2>
            <p className="qr-note">{target.note}</p>
            <a className="qr-url" href={target.url} target="_blank" rel="noreferrer">{target.url.replace(/^https:\/\//, '')}</a>
          </article>
        ))}
      </div>
    </div>
  )
}
