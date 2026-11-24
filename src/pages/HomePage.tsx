import {
  ArrowRight, ArrowUpRight, Bot, Cloud, DoorOpen, Folder, Github, History, Laptop, Layers, MessageCircle, Monitor, PlugZap, Puzzle, Scale, Server, Share2,
  Sparkles, Star, Terminal, Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CommandBox } from '../components/CommandBox'
import { CopyLine } from '../components/CopyLine'
import { DownloadButtons } from '../components/DownloadButtons'
import { orcaRouter } from '../data/partners'
import { blendPageUrl, fetchBlendIndex, newAppCommand, type BlendEntry } from '../lib/registries'

const ways = [
  {
    icon: Terminal, title: 'The launcher', command: 'npx acryl@latest',
    body: 'Every step offered in a terminal: create an app, install a Blend, open one, pull or share a plugin, check your machine.',
    note: 'terminal, window and browser',
  },
  { icon: Sparkles, title: 'A blank app', command: 'npx acryl@latest new my-app', body: 'An empty app with the agent inside it. Ask for what you need and it grows from there.' },
  { icon: Layers, title: 'A Blend from the catalog', command: 'npx acryl@latest new my-app --from acrylblends.csv-explorer', body: 'Start from a working app someone made, then make it yours.' },
] as const

const nouns = [
  { icon: Folder, name: 'App', line: 'A folder: blend.yaml, its plugins, its data. Copy the folder, copy the app.' },
  { icon: Server, name: 'Host', line: 'One process per app. It loads plugins and swaps them while the app runs.' },
  { icon: Puzzle, name: 'Plugin', line: 'The only unit of capability: a page, a tool, a service.' },
  { icon: Monitor, name: 'Surface', line: 'Web or Desktop. It draws what the Host serves and owns no logic.' },
  { icon: Bot, name: 'Driver', line: 'An agent working inside the app. The built-in chat is one of many.' },
] as const

const gets = [
  { icon: PlugZap, title: 'An agent that builds plugins live', body: 'Ask in the chat. The agent writes a plugin into the running app; the page appears without a restart.' },
  { icon: Share2, title: 'Share and pull plugins', body: 'Publish a plugin to your GitHub with one confirmed plan, pull anyone\'s into your app by its address.' },
  { icon: History, title: 'Snapshots and versions', body: 'Every save is a version. Restore any one; history is never rewritten.' },
  { icon: Laptop, title: 'Web, desktop and terminal', body: 'The same app in the browser, in its own window, or in your terminal.' },
  { icon: DoorOpen, title: 'A door for any agent', body: 'look, act, plugin, tool: on the command line and over MCP, so an outside agent can drive any app.' },
  { icon: Bot, title: 'Bring your own agent', body: 'Claude Code, Codex, pi, Cursor CLI, Qwen Code, Amp and Goose have each built plugins into running apps.' },
] as const

type Startable = { readonly entry: BlendEntry; readonly command: string }
type Preview = { readonly state: 'loading' } | { readonly state: 'live'; readonly entries: readonly Startable[] } | { readonly state: 'failed' }

/** The first Blends `acryl new` can make an app from, each with its command. */
function startable(entries: readonly BlendEntry[]): readonly Startable[] {
  return entries.flatMap(entry => { const command = newAppCommand(entry); return command ? [{ entry, command }] : [] }).slice(0, 6)
}
const paints = ['var(--spectrum-start)', 'var(--spectrum-mid)', 'var(--spectrum-end)'] as const

function BlendsPreview() {
  const [load, setLoad] = useState<Preview>({ state: 'loading' })
  useEffect(() => {
    const controller = new AbortController()
    fetchBlendIndex(controller.signal)
      .then(entries => setLoad({ state: 'live', entries: startable(entries) }))
      .catch(() => { if (!controller.signal.aborted) setLoad({ state: 'failed' }) })
    return () => controller.abort()
  }, [])
  if (load.state === 'failed') return <p className="preview-note">The catalog could not be read just now. <Link to="/blends">Open the full catalog</Link>.</p>
  if (load.state === 'loading') return <div className="blend-preview-grid" aria-busy="true">{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="blend-preview skeleton" />)}</div>
  return (
    <div className="blend-preview-grid">
      {load.entries.map(({ entry, command }, i) => (
        <article className="blend-preview" key={entry.id} style={{ ['--paint' as string]: paints[i % 3] }}>
          <a href={blendPageUrl(entry)} target="_blank" rel="noreferrer"><h3>{entry.name}</h3></a>
          <p>{entry.description}</p>
          <span className="blend-preview-meta">{entry.category} · v{entry.version}</span>
          <CopyLine command={command} label={`Copy the command that creates an app from ${entry.name}`} />
        </article>
      ))}
    </div>
  )
}

const heroShots = [
  {
    id: 'control-center',
    tab: 'Control Center',
    src: '/img/home/control-center.png',
    alt: 'ACRYL Control Center: the Blends store, with ready-made apps and Deploy to WebBoxes.ai on every card',
    caption: 'ACRYL Control Center: the Blends store, with Deploy to WebBoxes.ai on every card.',
    href: 'https://github.com/acrylblends/63-acryl-control-center/releases/latest',
    link: 'Download for macOS, Windows or Linux',
    width: 1440,
    height: 956,
  },
  {
    id: 'ade',
    tab: 'ADE',
    src: '/img/home/ade.png',
    alt: 'ACRYL ADE: projects and worktrees on the left, a chat in the middle, and the menu of terminals and coding agents',
    caption: 'ACRYL ADE: projects and worktrees, chats and terminals, and any coding agent on one canvas.',
    href: 'https://acrylblends.github.io/blends/ai/ade/acryl.ade',
    link: 'ADE in the catalog',
    width: 1440,
    height: 900,
  },
  {
    id: 'webboxes',
    tab: 'WebBoxes.ai',
    src: '/img/home/webboxes.webp',
    alt: 'A real WebBox: the Productivity Hub app, its code and versions, and the agent chat',
    caption: 'A real WebBox: the Productivity Hub app, its agent, and its own address.',
    href: 'https://webboxes.ai',
    link: 'Open WebBoxes.ai',
    width: 1440,
    height: 1000,
  },
] as const

function HeroGallery() {
  const [active, setActive] = useState<(typeof heroShots)[number]['id']>('control-center')
  const shot = heroShots.find(item => item.id === active) ?? heroShots[0]
  return (
    <figure className="hero-film">
      <div className="film-switch" role="tablist" aria-label="Choose the product">
        {heroShots.map(item => (
          <button key={item.id} type="button" role="tab" aria-selected={item.id === active} className={item.id === active ? 'active' : undefined} onClick={() => setActive(item.id)}>{item.tab}</button>
        ))}
      </div>
      <img
        key={shot.id}
        className="hero-shot"
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        decoding="async"
      />
      <figcaption>{shot.caption} <a href={shot.href} target="_blank" rel="noreferrer">{shot.link}</a>.</figcaption>
    </figure>
  )
}

const layerSteps = [
  { title: 'Building blocks, not source code', body: 'Every app is assembled from Cordis plugins: UI, data and actions behind stable services.' },
  { title: 'The agent builds with those blocks', body: "ACRYL's chat, and Claude Code, Codex or Pi, operate the app through its door. The core code stays untouched." },
  { title: 'Sandboxed per person', body: 'Every app runs in its own instance, on your machine or in your own WebBox, with your rights only.' },
  { title: 'Your change is a versioned layer: a Blend', body: 'Save, roll back, share it to GitHub, list it in the store.' },
  { title: 'The foundation keeps shipping', body: 'acrylblends update merges new releases under your layer, and your changes stay.' },
] as const

export function HomePage() {
  return (
    <>
      <section className="home-hero grid-surface">
        <div className="page-width hero-content">
          <p className="eyebrow">The platform for agentic apps</p>
          <h1>Everything is a plugin.<br /><strong className="spectrum-text">Build agentic apps.</strong></h1>
          <p className="hero-subhero">Let your users build the product they need.</p>
          <p className="hero-lede">Every ACRYL app has its own agent. Your users say &ldquo;add XYZ&rdquo;, and seconds later the change is live for them and their team. You keep shipping the foundation; they keep their layer.</p>
          <p className="hero-lede hero-lede-follow">Build agentic apps from plugins. Start blank, grow with an agent, share what you make. ACRYL is the open platform and framework underneath: the agent is one part of your app, and our own development environment, ACRYL ADE, is one app built on it.</p>
          <div className="hero-actions">
            <CommandBox command="npx acryl@latest" label="Open the launcher" />
            <div className="hero-cta">
              <Link className="button" to="/start">Get started <ArrowRight aria-hidden="true" /></Link>
              <Link className="button secondary" to="/blends">Browse Blends</Link>
              <a className="button secondary" href="https://github.com/acryldev/acryl" target="_blank" rel="noreferrer"><Star aria-hidden="true" /> Star on GitHub</a>
            </div>
          </div>
          <HeroGallery />
        </div>
      </section>

      <section className="home-band page-width" aria-labelledby="layer-heading">
        <div className="section-intro">
          <div><p className="eyebrow">How your users build</p><h2 id="layer-heading">Five steps.<br /><span className="spectrum-text">Your foundation, their layer.</span></h2></div>
          <p>A prompt box inside the product instead of a feature request and six months of waiting. This is how ACRYL makes it safe.</p>
        </div>
        <ol className="atoms-grid layer-steps">
          {layerSteps.map((step, index) => (
            <li className="atom-card" key={step.title}>
              <div><span>{String(index + 1).padStart(2, '0')}</span></div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
          <li className="atom-card layer-closing"><p>Stop selling features. <span className="spectrum-text">Sell a platform your customers finish themselves.</span></p></li>
        </ol>
      </section>

      <section className="home-band page-width" aria-labelledby="ways-heading">
        <div className="section-intro">
          <div><p className="eyebrow">Three ways in</p><h2 id="ways-heading">Pick a door.<br /><span className="spectrum-text">Every one is a command.</span></h2></div>
          <p>Node.js 22.19 or newer, npm and git are all you need. Nothing to install first: <code>npx</code> fetches ACRYL when you run it.</p>
        </div>
        <div className="ways-grid">
          {ways.map(way => (
            <article className="way-card" key={way.title}>
              <way.icon aria-hidden="true" />
              <h3>{way.title}</h3>
              <p>{way.body}</p>
              <CopyLine command={way.command} label={`Copy ${way.command}`} />
              {'note' in way && <span className="status-tag shipped">{way.note}</span>}
            </article>
          ))}
        </div>
      </section>

      <section className="nouns-section" aria-labelledby="nouns-heading">
        <div className="page-width">
          <div className="section-intro">
            <div><p className="eyebrow">How it works</p><h2 id="nouns-heading">Five nouns.<br /><span className="spectrum-text">That is the whole model.</span></h2></div>
            <p>Every ACRYL app is made of the same five things. Learn them once and every app, including ADE, reads the same way. <Link to="/concepts">Read the concepts</Link>.</p>
          </div>
          <ol className="nouns-row">
            {nouns.map(n => (
              <li key={n.name}><n.icon aria-hidden="true" /><strong>{n.name}</strong><span>{n.line}</span></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-band page-width" aria-labelledby="gets-heading">
        <div className="section-intro">
          <div><p className="eyebrow">What you get</p><h2 id="gets-heading">An app that keeps<br /><span className="spectrum-text">building itself.</span></h2></div>
          <p>All of this works today from npm.</p>
        </div>
        <div className="atoms-grid">
          {gets.map(g => (
            <article className="atom-card" key={g.title}>
              <div><g.icon aria-hidden="true" /></div>
              <h3>{g.title}</h3><p>{g.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-band page-width" aria-labelledby="blends-heading">
        <div className="section-intro">
          <div><p className="eyebrow">Blends catalog</p><h2 id="blends-heading">Start from<br /><span className="spectrum-text">something that works.</span></h2></div>
          <p>A Blend is an app made into a starting point. These come live from the registry. <Link to="/blends">See all Blends</Link>.</p>
        </div>
        <BlendsPreview />
      </section>

      <section className="continuity-section" aria-labelledby="ade-heading">
        <div className="page-width continuity-grid">
          <div className="continuity-content">
            <p className="eyebrow">ACRYL ADE</p>
            <h2 id="ade-heading">The agentic development environment<br /><span className="spectrum-text">is an app too.</span></h2>
            <p>ADE is ACRYL's own development environment, made as an ACRYL app: projects and worktrees, chats and terminals side by side, diffs and review. Run Claude Code, Codex or any other agent next to the built-in chat, and swap them without losing context. It is built on the same platform as your apps, and it is in the catalog as the Blend <code>acryl.ade</code>.</p>
            <div className="continuity-links">
              <a className="button inverse" href="https://acrylblends.github.io/blends/ai/ade/acryl.ade" target="_blank" rel="noreferrer">ADE in the catalog <ArrowUpRight aria-hidden="true" /></a>
              <span className="status-tag shipped on-dark"><code>npx acryl@latest ade</code> opens it</span>
            </div>
          </div>
          <div className="continuity-features">
            <article><Users aria-hidden="true" /><h3>Any coding agent</h3><p>The project owns the context, not the agent session. Switch agents mid-task and keep every decision and file.</p></article>
            <article><Terminal aria-hidden="true" /><h3>Terminals and chats</h3><p>Chats, terminals, files and diffs as tabs on one canvas, per project and worktree.</p></article>
            <article className="ade-download"><Laptop aria-hidden="true" /><h3>Desktop app</h3><DownloadButtons /></article>
          </div>
        </div>
      </section>

      <section className="home-band page-width" aria-labelledby="microvm-heading">
        <div className="section-intro">
          <div><p className="eyebrow">ACRYL microVMs</p><h2 id="microvm-heading">Untrusted code<br /><span className="spectrum-text">gets its own kernel.</span></h2></div>
          <p>ACRYL also makes micro-VMs: small virtual machines started from ordinary container images, for the code an agent writes. Use them as a library in Node.js or Rust, as a command, or as a service. Open source, Apache-2.0.</p>
        </div>
        <div className="partner-actions">
          <div className="mv-try"><CopyLine command="npx acrylmicrovm run --rm alpine:latest echo hello" label="Copy the command that runs a first micro-VM" /></div>
          <Link className="button secondary" to="/acrylmicrovm">About ACRYL microVMs <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="home-band page-width" aria-labelledby="run-heading">
        <div className="section-intro">
          <div><p className="eyebrow">Run anywhere</p><h2 id="run-heading">Your machine today.<br /><span className="spectrum-text">The terminal and the cloud too.</span></h2></div>
          <p>An app is a folder in your own git repository. Run it on your machine, in a terminal, or host it at WebBoxes.ai.</p>
        </div>
        <div className="run-grid">
          <article><Laptop aria-hidden="true" /><h3>Your machine</h3><p>Web with <code>npm run dev</code>, Desktop with <code>npm run desktop</code>. macOS, Windows, Linux.</p><span className="status-tag shipped">today</span></article>
          <article><Terminal aria-hidden="true" /><h3>Terminal surface</h3><p>The same app drawn in a terminal, with <code>acryl</code> or <code>acryl --tui</code>.</p><span className="status-tag shipped">today</span></article>
          <article><Cloud aria-hidden="true" /><h3>WebBoxes.ai</h3><p>Your apps hosted, with the same plugins and the same folder. A new WebBox adds about 3.5 MB of its own files on one shared, read-only package store, and publishes at <code>name.webboxes.ai</code>. <a href="https://webboxes.ai" target="_blank" rel="noreferrer">Open WebBoxes.ai</a>.</p><span className="status-tag shipped">live</span></article>
        </div>
      </section>

      <section className="home-band page-width partner-band" aria-labelledby="partner-heading">
        <div className="section-intro">
          <div><p className="eyebrow">Partner</p><h2 id="partner-heading">{orcaRouter.name} is an ACRYL partner.<br /><span className="spectrum-text">200+ models, no markup.</span></h2></div>
          <p>{orcaRouter.summary}</p>
        </div>
        <div className="partner-actions">
          <a className="button" href={orcaRouter.url} target="_blank" rel="noreferrer sponsored">Get a key at {orcaRouter.name} <ArrowUpRight aria-hidden="true" /></a>
          <span className="licence-note">Referral link: ACRYL earns a share if you sign up. You pay nothing extra.</span>
        </div>
      </section>

      <section className="final-cta grid-surface" aria-labelledby="community-heading">
        <p className="eyebrow">Open source and community</p>
        <h2 id="community-heading">MIT licensed.<br /><span className="spectrum-text">Built in the open.</span></h2>
        <p>The framework, the launcher, ADE and both registries are open source. Publish a plugin, start a Blend, or come to a workshop.</p>
        <div>
          <a className="button" href="https://github.com/acryldev/acryl" target="_blank" rel="noreferrer"><Github aria-hidden="true" /> GitHub</a>
          <Link className="button secondary" to="/ecosystem/plugins"><Puzzle aria-hidden="true" /> Community plugins</Link>
          <Link className="button secondary" to="/events/acrylbootcamp"><Users aria-hidden="true" /> Workshop</Link>
          <a className="button secondary" href="https://discord.gg/cY9KXMex69" target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Discord</a>
          <span className="licence-note"><Scale aria-hidden="true" /> MIT</span>
        </div>
      </section>
    </>
  )
}
