import { Github, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Brand } from './Brand'
import { ThemeToggle } from './ThemeToggle'

const nav = [
  ['Product', '/'],
  ['Packages', '/packages'],
  ['Docs', '/docs'],
] as const

export function Shell() {
  const [open, setOpen] = useState(false)
  return (
    <div className="site-shell">
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
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <a className="icon-button" href="https://github.com/acryldev" target="_blank" rel="noreferrer" aria-label="ACRYL on GitHub">
              <Github aria-hidden="true" />
            </a>
            <Link className="button small" to="/packages">Explore packages</Link>
          </div>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>Agent Context Relay Yielding Lifecycles.</p>
        </div>
        <div className="footer-links">
          <Link to="/packages">Packages</Link>
          <Link to="/docs">Docs</Link>
          <a href="https://agentcontextrelay.com/">Agent Context Relay</a>
          <a href="https://github.com/acryldev">GitHub</a>
        </div>
        <p className="footer-note">Built on Cordis and DeepSeek Harness. ACRYL adds capabilities without replacing upstream APIs.</p>
      </footer>
    </div>
  )
}
