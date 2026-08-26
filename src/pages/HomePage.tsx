import { ArrowRight, Boxes, Braces, Cable, Layers3, MessageCircle, Network, RefreshCw, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CommandBox } from '../components/CommandBox'
import { acrylCatalog, catalog } from '../lib/catalog'

const atoms = [
  { icon: Network, n: '01', title: 'Context', body: 'Persistent project memory belongs to the workspace, not a disposable agent session.' },
  { icon: RefreshCw, n: '02', title: 'Agents', body: 'Move work among Claude, Codex, Pi, OpenCode, DSH, and the next runtime without losing continuity.' },
  { icon: Boxes, n: '03', title: 'Packages', body: 'Tools, skills, adapters, workflows, Blueprints, and StemCells are independently inspectable building blocks.' },
  { icon: Cable, n: '04', title: 'Services', body: 'Cordis lifecycles let capabilities mount, replace, reconcile, and dispose through explicit contracts.' },
  { icon: Braces, n: '05', title: 'Compatibility', body: 'Standard DeepSeek Harness packages retain their upstream install path and source identity.' },
  { icon: Layers3, n: '06', title: 'Lifecycles', body: 'A room outlives any one worker and becomes the evolving home for people, agents, artifacts, and decisions.' },
]

const packageCount = catalog.plugins.length + acrylCatalog.plugins.length

export function HomePage() {
  return (
    <>
      <section className="home-hero grid-surface">
        <div className="page-width hero-content">
          <p className="eyebrow">Agent Context Relay Yielding Lifecycles</p>
          <h1>Everything is a plugin.<br /><strong>Compose anything.</strong></h1>
          <p className="hero-lede">ACRYL is a programmable desktop for persistent agent work. Compose models, tools, agents, skills, and surfaces around one canonical project lifecycle.</p>
          <div className="hero-cta">
            <Link className="button" to="/packages">Explore {packageCount.toLocaleString()} packages <ArrowRight aria-hidden="true" /></Link>
            <Link className="button secondary" to="/docs">Read the architecture</Link>
            <a className="button secondary" href="https://github.com/acryldev/acryl" target="_blank" rel="noreferrer">
              <Star aria-hidden="true" />
              Support ACRYL on GitHub
            </a>
          </div>
          <CommandBox command="dsh plugin --profile desktop add <package>" label="DeepSeek Harness packages run directly" />
        </div>
      </section>

      <section className="foundation-strip" aria-label="Platform foundations">
        <span>ACRYL IS BUILT WITH</span><strong>Cordis</strong><span>·</span><strong>DeepSeek Harness</strong><span>·</span><strong>Electron</strong><span>·</span><strong>Agent Context Relay</strong>
      </section>

      <section className="atoms-section page-width" aria-labelledby="atoms-heading">
        <div className="section-intro">
          <div><p className="eyebrow">The molecule</p><h2 id="atoms-heading">Atoms bond into<br />working lifecycles.</h2></div>
          <p>ACRYL treats the workspace as the center. Agents are interchangeable workers, while context, decisions, and project state remain durable.</p>
        </div>
        <div className="atoms-grid">
          {atoms.map(({ icon: Icon, n, title, body }) => (
            <article className="atom-card" key={title}>
              <div><span>{n}</span><Icon aria-hidden="true" /></div>
              <h3>{title}</h3><p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="runtime-section">
        <div className="page-width runtime-grid">
          <div>
            <p className="eyebrow">One runtime, many sources</p>
            <h2>Keep the upstream.<br />Add the lifecycle.</h2>
            <p>ACRYL is continuing DeepSeek Harness in a desktop host, not rewriting its ecosystem. DSH packages install through their documented command and stay visibly attributed to their original source.</p>
            <div className="runtime-links"><Link className="button inverse" to="/packages">Browse the registry <ArrowRight aria-hidden="true" /></Link><a className="button inverse secondary" href="https://github.com/acryldev" target="_blank" rel="noreferrer">GitHub</a></div>
          </div>
          <div className="formula-panel" aria-label="ACRYL composition example">
            <div><i /><i /><i /><span>acryl.formula.ts</span></div>
            <pre>{`export default Acryl.compose({
  atoms: [
    "agent",
    "context",
    "tooling",
    "surfaces",
  ],
  bonds: {
    agent: { context: "room" },
  },
})`}</pre>
          </div>
        </div>
      </section>

      <section className="portal-section page-width" aria-labelledby="portal-heading">
        <div className="section-intro">
          <div><p className="eyebrow">Registry</p><h2 id="portal-heading">The ACRYL<br />package portal.</h2></div>
          <p>Discover native ACRYL packages and the DeepSeek Harness ecosystem in one source-aware directory. A catalog entry never implies compatibility or a security review.</p>
        </div>
        <div className="portal-command"><span>search</span><Link to="/packages">memory, browser, agent, workflow, Blueprints… <ArrowRight aria-hidden="true" /></Link></div>
        <div className="portal-lines">
          <Link to="/packages?category=memory"><strong>Persistent context</strong><span>Memory packages for evolving agent work.</span><em>Explore <ArrowRight aria-hidden="true" /></em></Link>
          <Link to="/packages?category=tools"><strong>Capabilities</strong><span>Tools and integrations that extend the workspace.</span><em>Explore <ArrowRight aria-hidden="true" /></em></Link>
          <Link to="/packages?category=workflow"><strong>Living workflows</strong><span>Repeatable systems that can develop into Blueprints.</span><em>Explore <ArrowRight aria-hidden="true" /></em></Link>
        </div>
      </section>

      <section className="final-cta grid-surface">
        <p className="eyebrow">Community</p>
        <h2>Publish an atom.<br />Change what agents can do.</h2>
        <p>Publish a public npm package with one keyword. ACRYL discovers it automatically and keeps its source, version, and compatibility evidence explicit.</p>
        <div><Link className="button" to="/docs#publish">Publish a package <ArrowRight aria-hidden="true" /></Link><Link className="button secondary" to="/packages">Explore the registry</Link><a className="button secondary" href="https://github.com/acryldev/acryl" target="_blank" rel="noreferrer"><Star aria-hidden="true" /> Star on GitHub</a><a className="button secondary" href="https://discord.gg/cY9KXMex69" target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Join Discord</a></div>
      </section>
    </>
  )
}
