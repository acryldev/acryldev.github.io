import { Github, Menu, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Brand } from './Brand'
import { ThemeToggle } from './ThemeToggle'

const nav = [
  ['Get started', '/start'],
  ['Concepts', '/concepts'],
  ['Build', '/build'],
  ['Blends', '/blends'],
  ['ACRYL AXI', '/acrylaxi'],
  ['Reference', '/reference'],
  ['Ecosystem', '/ecosystem'],
  ['Vision', '/vision'],
] as const

function formatStarCount(stars: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
    .format(stars)
    .toLowerCase()
}

/** Discord's mark (Simple Icons, CC0), drawn in the text colour so it sits with the outlined lucide icons beside it. */
function DiscordIcon() {
  return (
    <svg className="discord-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  )
}

export function Shell() {
  const [open, setOpen] = useState(false)
  const [starCount, setStarCount] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()
    // The count the deploy wrote (scripts/sync-stars.mjs): the browser never asks GitHub's rate-limited API itself.
    void fetch('/stars.json', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) return undefined
        const payload: unknown = await response.json()
        if (typeof payload !== 'object' || payload === null || !('stars' in payload)) return undefined
        const stars = payload.stars
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
              <NavLink key={href} to={href} onClick={() => setOpen(false)}>{label}</NavLink>
            ))}
            <a className="github-link" href="https://github.com/acryldev/acryl" target="_blank" rel="noreferrer">GitHub</a>
            <a href="/merch/">Merch</a>
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
            <a className="icon-button" href="https://discord.gg/cY9KXMex69" target="_blank" rel="noreferrer" aria-label="Join Discord">
              <DiscordIcon />
            </a>
            <Link className="button small" to="/start">Get started</Link>
          </div>
        </div>
      </header>
      <main className="min-w-0"><Outlet /></main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>The platform for agentic apps. Everything is a plugin.</p>
        </div>
        <div className="footer-links">
          <Link to="/start">Get started</Link>
          <Link to="/concepts">Concepts</Link>
          <Link to="/build">Build</Link>
          <Link to="/reference">Reference</Link>
          <Link to="/vision">Vision</Link>
          <Link to="/ecosystem">Ecosystem</Link>
          <Link to="/blends">Blends</Link>
          <Link to="/acrylaxi">ACRYL AXI</Link>
          <Link to="/ecosystem/plugins">Community plugins</Link>
          <Link to="/docs">Framework docs</Link>
          <Link to="/ui">UI components</Link>
          <Link to="/updates">Changelog</Link>
          <Link to="/events">Events</Link>
          <a href="/merch/">Merch</a>
          <Link to="/qr">QR codes</Link>
          <a href="https://acrylblends.github.io" target="_blank" rel="noreferrer">ACRYL Blends: the Blend registry</a>
          <a href="https://cordisplugins.github.io" target="_blank" rel="noreferrer">Cordis Plugins: the plugin registry</a>
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
        <p className="footer-note">Built on Cordis. An agent joins as a driver, so the app is not tied to one of them.</p>
        <p className="footer-note footer-scam-warning">
          <strong>Security notice:</strong> our only official accounts are listed above (x.com/acryldev,
          github.com/acryldev, and the others linked here). We have no token, no coin, and no crypto project.
          <code>x.com/acryl_dev</code> is impersonating us and is <strong>not affiliated with ACRYL</strong>: do
          not trust anything it posts, especially about a token or airdrop.
        </p>
      </footer>
    </div>
  )
}
