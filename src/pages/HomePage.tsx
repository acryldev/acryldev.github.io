import { ArrowRight, Boxes, Braces, Cable, Layers3, Network, RefreshCw, Sparkles, Workflow } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CommandBox } from '../components/CommandBox'
import { catalog } from '../lib/catalog'

const capabilities = [
  { icon: Network, title: 'Persistent relay', body: 'Project context belongs to the workspace, not to a disposable agent session.' },
  { icon: RefreshCw, title: 'Agent continuity', body: 'Move work between Claude, Codex, Pi, OpenCode, DSH, and future runtimes.' },
  { icon: Boxes, title: 'Everything is a plugin', body: 'Cordis lifecycles make capabilities mountable, replaceable, and cleanly disposable.' },
  { icon: Workflow, title: 'Living workflows', body: 'Blueprints become StemCells that learn and grow into domain-specific applications.' },
]

export function HomePage() {
  return (
    <>
      <section className="home-hero grid-surface">
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="home-hero-inner">
          <p className="eyebrow"><span /> Open agent lifecycle platform</p>
          <h1>One workspace.<br /><em>Every agent.</em><br />A lifecycle that lasts.</h1>
          <p className="hero-lede">ACRYL is the programmable desktop for persistent AI work. Bring your agents, compose capabilities through Cordis, and keep context alive across every handoff.</p>
          <div className="hero-cta">
            <Link className="button" to="/packages">Explore {catalog.plugins.length} packages <ArrowRight aria-hidden="true" /></Link>
            <a className="button secondary" href="https://github.com/acryldev">View on GitHub</a>
          </div>
          <CommandBox command="dsh plugin --profile desktop add <package>" label="Standard DSH packages run directly" />
        </div>
        <div className="lifecycle-visual" aria-label="ACRYL lifecycle architecture">
          <div className="visual-kicker">THE CONTINUITY LAYER</div>
          <div className="visual-core">
            <span>ACRYL</span>
            <small>owns context</small>
          </div>
          <div className="agent-node node-claude"><span>Claude</span><small>worker</small></div>
          <div className="agent-node node-codex"><span>Codex</span><small>worker</small></div>
          <div className="agent-node node-pi"><span>Pi</span><small>worker</small></div>
          <div className="agent-node node-dsh"><span>DSH</span><small>runtime</small></div>
          <svg viewBox="0 0 600 480" role="presentation" aria-hidden="true">
            <path d="M300 240 C200 240 195 92 105 92" />
            <path d="M300 240 C400 240 405 92 495 92" />
            <path d="M300 240 C200 240 195 388 105 388" />
            <path d="M300 240 C400 240 405 388 495 388" />
          </svg>
          <div className="visual-status"><span /> ROOM ACTIVE · CONTEXT PERSISTED</div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Platform foundations">
        <span>BUILT WITH</span><strong>Cordis</strong><span>+</span><strong>DeepSeek Harness</strong><span>+</span><strong>Electron</strong><span>+</span><strong>Agent Context Relay</strong>
      </section>

      <section className="section page-width">
        <div className="section-heading split">
          <div><p className="eyebrow">Architecture</p><h2>The layer above agents.</h2></div>
          <p>Most tools make one agent the center. ACRYL makes the workspace the center and treats agents as interchangeable workers.</p>
        </div>
        <div className="capability-grid">
          {capabilities.map(({ icon: Icon, title, body }, index) => (
            <article className="capability-card" key={title}>
              <span className="card-index">0{index + 1}</span><Icon aria-hidden="true" />
              <h3>{title}</h3><p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section page-width ecosystem-section">
        <div className="ecosystem-copy">
          <p className="eyebrow">Open ecosystem</p>
          <h2>Use what already exists.<br />Build what comes next.</h2>
          <p>ACRYL runs on the real DeepSeek Harness and Cordis runtime. Existing DSH bundles install through upstream package semantics. ACRYL-native extensions can add relay, agent control, lifecycles, Blueprints, and StemCells.</p>
          <Link className="text-link" to="/packages">Browse the package portal <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="layer-stack">
          <div><Sparkles aria-hidden="true" /><strong>ACRYL Native</strong><span>Relay · Blueprints · StemCells</span></div>
          <div><Cable aria-hidden="true" /><strong>DSH Compatibility</strong><span>Tools · Agents · Web plugins</span></div>
          <div><Braces aria-hidden="true" /><strong>DeepSeek Harness</strong><span>Profiles · Sessions · Runtime</span></div>
          <div><Layers3 aria-hidden="true" /><strong>Cordis</strong><span>Services · Fibers · Effects</span></div>
        </div>
      </section>

      <section className="section final-cta grid-surface">
        <p className="eyebrow">A lifecycle, not another chat</p>
        <h2>Any agent. Any model.<br />One evolving workspace.</h2>
        <div><Link className="button" to="/packages">Explore packages <ArrowRight aria-hidden="true" /></Link><Link className="button secondary" to="/docs">Read the architecture</Link></div>
      </section>
    </>
  )
}
