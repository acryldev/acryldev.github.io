import { ArrowRight, ArrowUpRight, CalendarDays, History, Layers, Puzzle, Store, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const internal = [
  { icon: Puzzle, title: 'Community plugins', body: 'Every public Cordis plugin we can find, with its source, version and what it is compatible with. A listing is not a review.', to: '/ecosystem/plugins', cta: 'Browse plugins' },
  { icon: Layers, title: 'Blends', body: 'Apps made into starting points, live from the registry, with the command that makes your own copy.', to: '/blends', cta: 'Browse Blends' },
  { icon: CalendarDays, title: 'Workshop and events', body: 'Talks, the ACRYL Bootcamp, and where to meet the people building it.', to: '/events', cta: 'See events' },
  { icon: History, title: 'Changelog', body: 'What changed in ACRYL, release by release and commit by commit.', to: '/updates', cta: 'Read the changelog' },
] as const

const external = [
  { icon: Store, title: 'ACRYL Blends', body: 'The Blend registry and the framework docs: categories, search, and how to submit a Blend.', href: 'https://acrylblends.github.io' },
  { icon: Puzzle, title: 'Cordis Plugins', body: 'The plugin registry: the plugins this ecosystem has built, the parts every Blend is made of.', href: 'https://cordisplugins.github.io' },
  { icon: Users, title: 'Publishers', body: 'The people and teams behind the packages: every publisher on npm.', href: 'https://www.npmjs.com/~acryldev' },
] as const

export function EcosystemPage() {
  return (
    <div className="page-width ecosystem-page">
      <header className="guide-hero">
        <p className="eyebrow">Ecosystem</p>
        <h1>Everything built<br /><span className="spectrum-text">on ACRYL.</span></h1>
        <p className="guide-intro">Plugins, Blends, the people who publish them, and the events where we build together.</p>
      </header>
      <h2 className="ecosystem-group">On acryl.dev</h2>
      <div className="atoms-grid ecosystem-grid">
        {internal.map(item => (
          <Link className="atom-card link-card" to={item.to} key={item.title}>
            <div><item.icon aria-hidden="true" /></div>
            <h3>{item.title}</h3><p>{item.body}</p>
            <span className="card-cta">{item.cta} <ArrowRight aria-hidden="true" /></span>
          </Link>
        ))}
      </div>
      <h2 className="ecosystem-group">Registries and publishers</h2>
      <div className="atoms-grid">
        {external.map(item => (
          <a className="atom-card link-card" href={item.href} target="_blank" rel="noreferrer" key={item.title}>
            <div><item.icon aria-hidden="true" /></div>
            <h3>{item.title}</h3><p>{item.body}</p>
            <span className="card-cta">{item.href.replace('https://', '')} <ArrowUpRight aria-hidden="true" /></span>
          </a>
        ))}
      </div>
    </div>
  )
}
