import { Github, Menu, MessageCircle, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Brand } from './Brand'
import { ThemeToggle } from './ThemeToggle'

const nav = [
  ['Product', '/'],
  ['Blends', '/blends'],
  ['Plugins', '/packages'],
  ['UI', '/ui'],
  ['Docs', '/docs'],
] as const

function formatStarCount(stars: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
    .format(stars)
    .toLowerCase()
}

export function Shell() {
  const [open, setOpen] = useState(false)
  const [starCount, setStarCount] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()
    void fetch('https://api.github.com/repos/acryldev/acryl', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
      .then(async response => {
        if (!response.ok) return undefined
        const payload: unknown = await response.json()
        if (typeof payload !== 'object' || payload === null || !('stargazers_count' in payload)) return undefined
        const stars = payload.stargazers_count
        return typeof stars === 'number' && Number.isFinite(stars) && stars >= 0 ? formatStarCount(stars) : undefined
      })
      .then(count => { if (count !== undefined) setStarCount(count) })
      .catch(() => undefined)
    return () => controller.abort()
  }, [])
  return (
    <div className="site-shell min-h-dvh bg-canvas text-ink">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <button className="mobile-menu" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <nav className={open ? 'site-nav open' : 'site-nav'} aria-label="Primary navigation">
            {nav.map(([label, href]) => (
              <NavLink key={href} to={href} end={href === '/'} onClick={() => setOpen(false)}>{label}</NavLink>
            ))}
            <a className="community-link" href="https://discord.gg/cY9KXMex69" target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" />
              Join Discord
            </a>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <a
              className="icon-button github-stars"
              href="https://github.com/acryldev/acryl"
              target="_blank"
              rel="noreferrer"
              aria-label={starCount === undefined ? 'Star ACRYL on GitHub' : `Star ACRYL on GitHub - ${starCount} stars`}
            >
              <Star aria-hidden="true" />
              {starCount === undefined ? null : <span aria-hidden="true">{starCount}</span>}
            </a>
            <a className="icon-button" href="https://github.com/acryldev" target="_blank" rel="noreferrer" aria-label="ACRYL on GitHub">
              <Github aria-hidden="true" />
            </a>
            <Link className="button small" to="/packages">Explore plugins</Link>
          </div>
        </div>
      </header>
      <main className="min-w-0"><Outlet /></main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>Agent Context Relay Yielding Lifecycles.</p>
        </div>
        <div className="footer-links">
          <Link to="/blends">Blends</Link>
          <Link to="/packages">Plugins</Link>
          <Link to="/docs">Docs</Link>
          <Link to="/qr">QR codes</Link>
          <a href="https://acrylblends.github.io" target="_blank" rel="noreferrer">ACRYL Blends — the Blend registry</a>
          <a href="https://cordisplugins.github.io" target="_blank" rel="noreferrer">Cordis Plugins — the plugin registry</a>
          <a href="https://agentcontextrelay.com/">Agent Context Relay</a>
          <a href="https://github.com/acryldev/acryl" target="_blank" rel="noreferrer">Star on GitHub</a>
          <a href="https://discord.gg/cY9KXMex69" target="_blank" rel="noreferrer">Discord</a>
        </div>
        <div className="footer-links footer-social" aria-label="Official ACRYL accounts">
          <a href="https://x.com/acryldev" target="_blank" rel="noreferrer">X</a>
          <a href="https://www.youtube.com/@ACRYLDEV" target="_blank" rel="noreferrer">YouTube</a>
          <a href="https://github.com/acryldev" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/company/acryldev/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://www.instagram.com/acryldev" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.tiktok.com/@acryldev" target="_blank" rel="noreferrer">TikTok</a>
          <a href="https://www.npmjs.com/~acryldev" target="_blank" rel="noreferrer">npm</a>
        </div>
        <p className="footer-note">Built on Cordis and DeepSeek Harness. ACRYL adds capabilities without replacing upstream APIs.</p>
        <p className="footer-note footer-scam-warning">
          <strong>Security notice:</strong> our only official accounts are listed above (x.com/acryldev,
          github.com/acryldev, and the others linked here). We have no token, no coin, and no crypto project.
          <code>x.com/acryl_dev</code> is impersonating us and is <strong>not affiliated with ACRYL</strong> — do
          not trust anything it posts, especially about a token or airdrop.
        </p>
      </footer>
    </div>
  )
}
