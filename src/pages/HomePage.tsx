import { ArrowLeftRight, ArrowRight, ArrowUpRight, Boxes, Braces, Cable, Globe, Layers3, Layout, MessageCircle, Monitor, Network, RefreshCw, Shield, Star, Terminal, UserCheck, Workflow } from 'lucide-react'
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
          <CommandBox command="npm i -g acryl" label="Install ACRYL CLI" />
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

      <section className="continuity-section">
        <div className="page-width continuity-grid">
          <div className="continuity-content">
            <p className="eyebrow">Continuity</p>
            <h2>Swap agents.<br />Keep working.</h2>
            <p>ACRYL treats every coding agent as an interchangeable worker. Claude Code, Codex, OpenCode, Gemini, Pi — the room owns the context, not the agent session. Swap mid-project without losing a decision, a file, or a thought.</p>
            <div className="continuity-links">
              <Link className="button inverse" to="/docs#architecture">How it works <ArrowRight aria-hidden="true" /></Link>
              <a className="button inverse secondary" href="https://github.com/acryldev/acryl" target="_blank" rel="noreferrer">
                <Star aria-hidden="true" /> Star on GitHub
              </a>
            </div>
          </div>
          <div className="continuity-features">
            <article>
              <ArrowLeftRight aria-hidden="true" />
              <h3>Swap mid-stream</h3>
              <p>Claude hits a rate limit? Codex gives a weak answer? Pick another agent and continue from the same context. No restart, no lost history.</p>
            </article>
            <article>
              <Shield aria-hidden="true" />
              <h3>Rate-limit recovery</h3>
              <p>Auth expires, tokens run out, a provider goes down — the room survives. Re-auth, switch runtimes, or pick a different model and pick up where you left off.</p>
            </article>
            <article>
              <UserCheck aria-hidden="true" />
              <h3>Agent identity</h3>
              <p>Every agent has a name, role, and capability contract. The room tracks who did what, even after the worker process is long gone.</p>
            </article>
            <article>
              <Workflow aria-hidden="true" />
              <h3>Structured handoffs</h3>
              <p>One agent finishes its slice, writes a handoff artifact, and the next agent reads it. No dump-the-chat, no lost context, no repeating yourself.</p>
            </article>
          </div>
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

      <section className="canvas-section grid-surface" aria-labelledby="canvas-heading">
        <div className="page-width canvas-content">
          <div className="section-intro">
            <div><p className="eyebrow">Development Canvas</p><h2 id="canvas-heading">Your workspace,<br />your way.</h2></div>
            <p>The workspace is not a single chat pane. Press <kbd>+</kbd> to add tiles — terminals, editors, browsers — alongside your agent conversation. Run Claude Code in one tile, edit a file in another, watch your local dev server in a third.</p>
          </div>
          <div className="canvas-showcase">
            <article className="canvas-card">
              <div className="canvas-card-header"><Terminal aria-hidden="true" /><span>Terminal</span></div>
              <p>Spawn a shell, run Claude Code, Codex, or any CLI tool. The Host starts the process, streams I/O into the tile, and disposes it cleanly when you close it.</p>
            </article>
            <article className="canvas-card">
              <div className="canvas-card-header"><Layout aria-hidden="true" /><span>Editor</span></div>
              <p>Open a text file directly in the canvas. Edit alongside your agent conversation — no alt-tabbing to a separate IDE.</p>
            </article>
            <article className="canvas-card">
              <div className="canvas-card-header"><Globe aria-hidden="true" /><span>Browser</span></div>
              <p>Preview your local app while an agent works on it. Navigate to any HTTP or HTTPS URL in an embedded view.</p>
            </article>
            <article className="canvas-card">
              <div className="canvas-card-header"><MessageCircle aria-hidden="true" /><span>Chat</span></div>
              <p>The conversation is always there. Chat tabs stay in the strip, switch between tiles without losing your agent mid-thought.</p>
            </article>
          </div>
          <div className="canvas-surfaces">
            <div className="canvas-surfaces-intro">
              <p className="eyebrow">Three surfaces, one runtime</p>
              <h3>Same engine.<br />Choose your interface.</h3>
            </div>
            <div className="surface-cards">
              <article className="surface-card">
                <Terminal aria-hidden="true" />
                <h4>Terminal</h4>
                <p><code>npm i -g acryl</code> gives you the full TUI experience. pi-tui-powered, direct host, durable sessions.</p>
              </article>
              <article className="surface-card">
                <Monitor aria-hidden="true" />
                <h4>Desktop</h4>
                <p>Electron app with the Development Canvas, plugin lifecycle control, and native OS integration.</p>
              </article>
              <article className="surface-card">
                <Globe aria-hidden="true" />
                <h4>Web</h4>
                <p>Local web surface — same runtime, same plugins, same durable sessions, served over loopback.</p>
              </article>
            </div>
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

      <section className="portal-section page-width" aria-labelledby="ecosystem-heading">
        <div className="section-intro">
          <div><p className="eyebrow">Ecosystem</p><h2 id="ecosystem-heading">Two sibling registries,<br />one composable ecosystem.</h2></div>
          <p>ACRYL is one Blend among many possible ones — the flagship, maxed-out expression of a small, reusable protocol. These two sites are where the rest of that ecosystem lives.</p>
        </div>
        <div className="portal-lines">
          <a href="https://acrylblends.github.io" target="_blank" rel="noreferrer"><strong>ACRYL Blends</strong><span>The Blend registry — complete, pullable Cordis compositions, browsable by a 100-category taxonomy.</span><em>acrylblends.github.io <ArrowUpRight aria-hidden="true" /></em></a>
          <a href="https://cordisplugins.github.io" target="_blank" rel="noreferrer"><strong>Cordis Plugins</strong><span>The plugin registry — every real Cordis plugin this ecosystem has built, the atoms every Blend composes.</span><em>cordisplugins.github.io <ArrowUpRight aria-hidden="true" /></em></a>
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
