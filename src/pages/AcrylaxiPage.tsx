import { ArrowRight, ArrowUpRight, Github, MessageCircle, ShieldCheck, Sparkles, Terminal, Wifi } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CommandBox } from '../components/CommandBox'

const PAGE_TITLE = 'ACRYL AXI — Agent External Interface'
const PAGE_DESCRIPTION =
  'HTML is the new markdown. ACRYL AXI opens the HTML artifacts your agent writes as a local review surface: annotate elements, select text, edit whiteboards, queue fixes, and send feedback back as text instead of screenshots.'
const PAGE_URL = 'https://acryl.dev/acrylaxi'

function usePageMetadata() {
  useEffect(() => {
    const previousTitle = document.title
    const tags: Array<{ element: HTMLMetaElement; content: string }> = []
    const setMeta = (attribute: 'name' | 'property', key: string, content: string) => {
      const selector = `meta[${attribute}="${key}"]`
      let element = document.head.querySelector<HTMLMetaElement>(selector)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.appendChild(element)
      }
      tags.push({ element, content: element.getAttribute('content') ?? '' })
      element.setAttribute('content', content)
    }
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const previousCanonical = canonical?.getAttribute('href') ?? null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    document.title = `${PAGE_TITLE} | ACRYL`
    canonical.href = PAGE_URL
    setMeta('name', 'description', PAGE_DESCRIPTION)
    setMeta('property', 'og:title', PAGE_TITLE)
    setMeta('property', 'og:description', PAGE_DESCRIPTION)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', PAGE_URL)
    setMeta('property', 'og:image', `${PAGE_URL}/media/og.png`)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', PAGE_TITLE)
    setMeta('name', 'twitter:description', PAGE_DESCRIPTION)
    setMeta('name', 'twitter:image', `${PAGE_URL}/media/og.png`)
    return () => {
      document.title = previousTitle
      for (const { element, content } of tags) element.setAttribute('content', content)
      if (canonical) canonical.href = previousCanonical ?? PAGE_URL
    }
  }, [])
}

const loop = [
  'The agent writes one self-contained HTML artifact: a plan, a comparison, a diagram, a table, a diff, or an interactive prototype.',
  'ACRYL AXI opens it in a local review surface over a loopback CLI. Nothing is uploaded.',
  'The human points at elements, selects text, edits a diagram, answers controls, or queues layout fixes. Each note becomes one prompt.',
  'The agent long-polls, receives selectors and anchors instead of screenshots, edits the file, and the page live-reloads.',
]

const cli = [
  ['acrylaxi <html-file>', 'Open or resume a review session for one artifact file.'],
  ['acrylaxi poll <html-file>', 'Long-poll until feedback arrives, the session ends, or every reviewer disconnects.'],
  ['acrylaxi reply <html-file>', 'Post an agent reply and exit once the server accepts it.'],
  ['acrylaxi end <html-file>', 'End a session as the agent; a plain open can resume it later.'],
  ['acrylaxi export <html-file>', 'Write one portable HTML file with local assets inlined.'],
  ['acrylaxi share <html-file>', 'Publish to ht-ml.app, a third-party host, and get a link plus update key.'],
  ['acrylaxi playbook [id]', 'Read focused artifact guidance: plan, comparison, diagram, code, input, slides.'],
  ['acrylaxi design', 'Read the agent-facing design guidance and snippets.'],
  ['acrylaxi setup hooks | plugin', 'Install session hooks, or register the package as an Agent Plugin.'],
  ['acrylaxi stop', 'Shut down the background review server.'],
]

const config = [
  ['ACRYLAXI_PORT', 'Review server port. Default 4387.'],
  ['ACRYLAXI_STATE_DIR', 'Durable session state. Default ~/.acrylaxi/.'],
  ['ACRYLAXI_HOST', 'Bind one concrete address. Wildcards are refused; loopback is always bound.'],
  ['ACRYLAXI_PUBLIC_URL', 'Public origin for session links behind a reverse proxy.'],
  ['ACRYLAXI_ALLOWED_HOSTS', 'Extra Host headers accepted by the DNS-rebinding guard.'],
  ['ACRYLAXI_NO_OPEN', 'Create or resume a session without launching a browser.'],
  ['ACRYLAXI_TELEMETRY', 'Set 0 to opt out. Telemetry is off unless a build configures an endpoint.'],
  ['ACRYLAXI_IDLE_TIMEOUT_MS', 'Stop the detached server after this idle period. Default 30 minutes.'],
]

function Shot({ src, alt, caption }: { readonly src: string; readonly alt: string; readonly caption: string }) {
  return (
    <figure className="shot">
      <img src={src} alt={alt} loading="lazy" />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export function AcrylaxiPage() {
  usePageMetadata()
  return (
    <>
      <section className="acrylaxi-hero grid-surface">
        <div className="page-width acrylaxi-hero-inner">
          <div className="acrylaxi-hero-copy">
            <img className="acrylaxi-mark" src="/acrylaxi/acrylaxi-logo.png" alt="ACRYL AXI" width="96" height="96" />
            <p className="eyebrow">ACRYL AXI · Agent External Interface</p>
            <h1>HTML is the new markdown.<br /><strong>Review it like a document.</strong></h1>
            <p className="hero-lede">
              Your agent can write a page. What it cannot do is watch you point at it. ACRYL AXI opens the HTML
              artifacts an agent writes in a local review surface: annotate an element, select a sentence, redraw a
              diagram, answer a control. The feedback returns as text with exact anchors, not screenshots.
            </p>
            <ul className="acrylaxi-facts">
              <li><Sparkles aria-hidden="true" /> One artifact, one file</li>
              <li><Terminal aria-hidden="true" /> One CLI command</li>
              <li><ShieldCheck aria-hidden="true" /> Local-first, no cloud</li>
              <li><Wifi aria-hidden="true" /> Phone-ready over Tailscale</li>
            </ul>
            <div className="hero-cta">
              <a className="button" href="https://github.com/acryldev/acrylaxi" target="_blank" rel="noreferrer">
                <Github aria-hidden="true" /> Get the repository
              </a>
              <a className="button secondary" href="#docs">Read the docs <ArrowRight aria-hidden="true" /></a>
            </div>
            <CommandBox command="npx skills add acryldev/acrylaxi --skill acrylaxi" label="Install the agent skill" />
            <p className="credit-line">
              Extended from <a href="https://github.com/kunchenguid/lavish-axi" target="_blank" rel="noreferrer">Lavish Editor</a> by
              Kun Chen · MIT
            </p>
          </div>
          <figure className="acrylaxi-hero-shot">
            <img src="/acrylaxi/media/review.png" alt="ACRYL AXI review surface with an annotated HTML artifact" />
            <figcaption>An agent-written plan, open for review. Every element is annotatable.</figcaption>
          </figure>
        </div>
      </section>

      <section className="foundation-strip" aria-label="How the loop runs">
        <span>THE LOOP</span><strong>Agent writes</strong><span>→</span><strong>You point</strong><span>→</span><strong>Prompts queue</strong><span>→</span><strong>Agent edits</strong><span>→</span><strong>Live reload</strong>
      </section>

      <section className="acrylaxi-video-section page-width" aria-labelledby="explainer-heading">
        <div className="section-intro">
          <div>
            <p className="eyebrow">60-second explainer</p>
            <h2 id="explainer-heading">From prose to<br />point-and-answer.</h2>
          </div>
          <p>
            Why agents and humans keep trading screenshots, and how one local page replaces that loop with anchors,
            selectors, and text. Rendered with HyperFrames; the same artifact-first discipline the product is for.
          </p>
        </div>
        <video
          className="explainer-video"
          controls
          playsInline
          preload="metadata"
          poster="/acrylaxi/media/acrylaxi-explainer-poster.jpg"
        >
          <source src="/acrylaxi/media/acrylaxi-explainer.mp4" type="video/mp4" />
          <source src="/acrylaxi/media/acrylaxi-explainer.webm" type="video/webm" />
          Your browser does not support the video element.
        </video>
      </section>

      <section className="loop-section page-width" aria-labelledby="loop-heading">
        <div className="section-intro">
          <div>
            <p className="eyebrow">The review loop</p>
            <h2 id="loop-heading">Four steps,<br />no images.</h2>
          </div>
          <p>
            The artifact is the author's file. ACRYL AXI adds one injected SDK tag when it serves it, so the saved
            file still renders identically in any browser. Feedback is queued as prompts and delivered by a long poll.
          </p>
        </div>
        <div className="loop-grid">
          {loop.map((body, index) => (
            <article className="loop-card" key={body}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{body}</p>
            </article>
          ))}
        </div>

        <div className="loop-video">
          <div className="loop-video-head">
            <div>
              <p className="eyebrow">45-second loop film</p>
              <h3>One round, in motion.</h3>
            </div>
            <p>
              A real round, animated: the file opens, an annotation lands, the poll returns prompts, the artifact
              changes and the review reloads — captured from the running CLI and re-rendered with HyperFrames.
            </p>
          </div>
          <video
            className="explainer-video"
            controls
            playsInline
            preload="metadata"
            poster="/acrylaxi/media/acrylaxi-how-it-works-poster.jpg"
          >
            <source src="/acrylaxi/media/acrylaxi-how-it-works.mp4" type="video/mp4" />
            <source src="/acrylaxi/media/acrylaxi-how-it-works.webm" type="video/webm" />
            Your browser does not support the video element.
          </video>
        </div>
      </section>

      <section className="shot-section page-width" aria-labelledby="shots-heading">
        <div className="section-intro">
          <div>
            <p className="eyebrow">What it looks like</p>
            <h2 id="shots-heading">Point at the thing.<br />Say the thing.</h2>
          </div>
          <p>
            Annotate an element or a text range, queue a batch of proven layout failures, turn a Mermaid diagram into
            an editable whiteboard, reveal what changed between revisions, or review from a phone on the same tailnet.
            The conversation panel is the only queue.
          </p>
        </div>
        <Shot
          src="/acrylaxi/media/review.png"
          alt="Full ACRYL AXI review window with conversation panel and an open annotation card"
          caption="The review surface: artifact on the left, one conversation queue on the right. Delivery receipts show Seen, Working, Done."
        />
        <div className="shot-grid">
          <Shot
            src="/acrylaxi/media/annotate.png"
            alt="Annotation card attached to a selected paragraph"
            caption="Annotations carry the element or the selected text with a range anchor, so 'this bit' is unambiguous."
          />
          <Shot
            src="/acrylaxi/media/whiteboard.png"
            alt="A Mermaid diagram opened as an editable Excalidraw whiteboard"
            caption="Mermaid diagrams become whiteboards. The Mermaid source stays authoritative; edits come back as a summary."
          />
          <Shot
            src="/acrylaxi/media/conversation.png"
            alt="Conversation panel with queued prompts and an agent reply"
            caption="Every note, selection, whiteboard edit, and layout batch lands in one transcript the agent reads."
          />
          <Shot
            src="/acrylaxi/media/mobile.png"
            alt="ACRYL AXI review on a phone with the conversation sheet raised"
            caption="On a phone the conversation becomes a bottom sheet. The session link works over Tailscale, not the internet."
          />
          <Shot
            src="/acrylaxi/media/revisions.png"
            alt="Revisions drawer listing two review rounds with summaries and reveal controls"
            caption="Revisions: the agent declares what changed each round, and Reveal flashes those blocks instead of restyling the page."
          />
          <Shot
            src="/acrylaxi/media/inbox.png"
            alt="Layout issues drawer showing a severe horizontal overflow finding with queue controls"
            caption="Layout issues: proven overflow, clipping, or occlusion is filed passively, then queued as one fix batch when you choose."
          />
          <Shot
            src="/acrylaxi/media/share.png"
            alt="Publish dialog warning that ht-ml.app is a third-party host"
            caption="Export one portable file, or publish explicitly. ht-ml.app is a third-party host, not part of Acrylaxi."
          />
        </div>
      </section>

      <section className="demo-section" aria-labelledby="demo-heading">
        <div className="page-width">
          <div className="section-intro">
            <div>
              <p className="eyebrow">Live demo artifact</p>
              <h2 id="demo-heading">A page written to be answered.</h2>
            </div>
            <p>
              The page below is a plain HTML file, authored for a review round: a plan, a comparison table, a decision,
              a diagram, and a checklist. Here it is inert. Run it through the CLI and every one of those becomes
              feedback with a target.
            </p>
          </div>
          <div className="demo-frame">
            <iframe src="/acrylaxi/demo.html" title="ACRYL AXI demo artifact" loading="lazy" />
          </div>
          <div className="demo-actions">
            <CommandBox command="npx -y acrylaxi demo.html" label="Review the demo artifact locally" />
            <a className="button inverse secondary" href="/acrylaxi/demo.html" target="_blank" rel="noreferrer">
              Open the artifact alone <ArrowUpRight aria-hidden="true" />
            </a>
            <a
              className="button inverse secondary"
              href="https://github.com/acryldev/acrylaxi/blob/main/examples/acrylaxi-demo.html"
              target="_blank"
              rel="noreferrer"
            >
              Get the source file <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="acrylaxi-docs page-width" id="docs" aria-labelledby="docs-heading">
        <div className="docs-intro">
          <p className="eyebrow">Documentation</p>
          <h2 id="docs-heading">Install it once.<br />Every agent can use it.</h2>
          <p>
            ACRYL AXI is an AXI: a CLI any capable agent can run, optimized for agent ergonomics. The skill is only
            discovery; the CLI is the interface, and its help, design guidance, and playbooks are always current.
          </p>
        </div>

        <div className="acrylaxi-docs-grid">
          <article className="docs-block">
            <p className="eyebrow">01 · install</p>
            <h3>Skill (recommended)</h3>
            <p>Installs the <code>acrylaxi</code> skill in the Agent Skills format. Then invoke <code>/acrylaxi</code> in agents that expose skills as slash commands.</p>
            <CommandBox command="npx skills add acryldev/acrylaxi --skill acrylaxi" label="Agent Skills" />
            <h3>Zero setup</h3>
            <p>Any shell-capable agent can skip installation entirely and call the CLI on demand.</p>
            <CommandBox command="npx -y acrylaxi <artifact.html>" label="On demand" />
            <h3>Hooks or plugin</h3>
            <p>Install globally, then opt into session context or register the package with VS Code, Cursor, and GitHub Copilot CLI.</p>
            <CommandBox command="npm i -g acrylaxi && acrylaxi setup hooks" label="Session hooks" />
            <CommandBox command="npm i -g acrylaxi && acrylaxi setup plugin" label="Agent Plugin" />
          </article>

          <article className="docs-block">
            <p className="eyebrow">02 · the loop, for agents</p>
            <h3>Open, then poll</h3>
            <p>
              Opening resumes the session keyed by the canonical file path. The poll stays attached to the turn; it
              returns when the human sends, ends, or leaves. Answer with <code>--agent-reply</code> so the browser
              shows the result.
            </p>
            <pre className="code-block">{`$ acrylaxi plan.html
$ acrylaxi poll plan.html
# edit the artifact, then
$ acrylaxi poll plan.html --agent-reply "Updated the pricing section."`}</pre>
            <h3>What comes back</h3>
            <p>
              Prompts with element selectors, text range anchors, table cell names, whiteboard edit summaries with
              local image paths, and layout-issue batches tagged <code>layout-warnings</code>. Images are file paths,
              never base64 in the prompt.
            </p>
            <pre className="code-block">{`$ acrylaxi poll plan.html
status: feedback
prompts[2]{uid,prompt,selector,tag,text}:
  "1","Lead with the cost: one note equals one short prompt…",
      "html > body > div:nth-of-type(1) > header > p",p,
      "This page is a plain HTML file written by an agent…"
  "","Keep the token-cost table as the hero…","",message,
      "Freeform message"`}</pre>
            <h3>Session state</h3>
            <p>
              Sessions, transcripts, and attachments live under <code>~/.acrylaxi/</code>. Export inlines local assets
              into one portable file; share is explicit, opt-in, and hosted by a third party.
            </p>
          </article>
        </div>

        <div className="docs-table-wrap">
          <h3>CLI reference</h3>
          <table className="docs-table">
            <thead><tr><th scope="col">Command</th><th scope="col">What it does</th></tr></thead>
            <tbody>
              {cli.map(([command, description]) => (
                <tr key={command}><td><code>{command}</code></td><td>{description}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="docs-table-wrap">
          <h3>Configuration</h3>
          <table className="docs-table">
            <thead><tr><th scope="col">Variable</th><th scope="col">Effect</th></tr></thead>
            <tbody>
              {config.map(([name, effect]) => (
                <tr key={name}><td><code>{name}</code></td><td>{effect}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="docs-fineprint">
            Full environment reference, attachment limits, export limits, and the diagnostics set live in the
            repository README.
          </p>
        </div>

        <div className="docs-notes">
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Security posture</h3>
            <p>
              The review server binds loopback and, when Tailscale is present, this machine's tailnet address. It is
              unauthenticated by design: never expose it to an untrusted network. Session keys are file paths, not
              secrets. The artifact iframe is sandboxed without same-origin access.
            </p>
          </div>
          <div>
            <Terminal aria-hidden="true" />
            <h3>Upstream reference</h3>
            <p>
              Lavish Editor stays vendored as a pinned git submodule at <code>upstream/lavish-axi</code>, reference
              only. <code>pnpm run upstream:status</code> reports what upstream changed; <code>pnpm run upstream:pull</code>
              moves the pin so improvements can be ported deliberately.
            </p>
          </div>
          <div>
            <Sparkles aria-hidden="true" />
            <h3>Provenance</h3>
            <p>
              ACRYL AXI is extended from Lavish Editor and <code>lavish-axi</code> v0.1.99 by Kun Chen, under the MIT
              license. The review loop, whiteboards, and invariants are his work; the ACRYL productization is ours.
            </p>
          </div>
        </div>

        <div className="docs-links">
          <a href="https://github.com/acryldev/acrylaxi#readme" target="_blank" rel="noreferrer">README <ArrowUpRight aria-hidden="true" /></a>
          <a href="https://github.com/acryldev/acrylaxi/blob/main/docs/invariants.md" target="_blank" rel="noreferrer">Invariants <ArrowUpRight aria-hidden="true" /></a>
          <a href="https://github.com/acryldev/acrylaxi/blob/main/docs/upstream-reference.md" target="_blank" rel="noreferrer">Upstream reference <ArrowUpRight aria-hidden="true" /></a>
          <a href="https://github.com/acryldev/acrylaxi/blob/main/LICENSE" target="_blank" rel="noreferrer">License <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className="final-cta">
        <p className="eyebrow">Stop describing the page</p>
        <h2>Let the agent watch you point.</h2>
        <p>ACRYL AXI is part of the ACRYL ecosystem: an agent-agnostic control surface that keeps the work in the workspace, not in a chat log.</p>
        <div>
          <a className="button" href="https://github.com/acryldev/acrylaxi" target="_blank" rel="noreferrer"><Github aria-hidden="true" /> acryldev/acrylaxi</a>
          <a className="button secondary" href="https://discord.gg/cY9KXMex69" target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /> Join Discord</a>
          <Link className="button secondary" to="/ecosystem/plugins">Explore the ecosystem</Link>
        </div>
      </section>
    </>
  )
}
