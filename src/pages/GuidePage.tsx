import { ArrowRight } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CopyLine } from '../components/CopyLine'
import { statusLabel, type Code, type Guide, type Section } from '../lib/guides'

/** `code` spans written with backticks become <code>. */
export function Inline({ text }: { readonly text: string }): ReactNode {
  return text.split(/(`[^`]+`)/u).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>)
}

function ListItem({ text }: { readonly text: string }) {
  const colon = text.indexOf(': ')
  if (colon > 0 && colon < 40) return <li><strong>{text.slice(0, colon)}</strong> <Inline text={text.slice(colon + 2)} /></li>
  return <li><Inline text={text} /></li>
}

function CodeBlock({ block }: { readonly block: Code }) {
  const [only] = block.lines
  return (
    <div className="guide-code">
      {block.label && <p className="guide-code-label">{block.label}</p>}
      {block.lines.length === 1 && only
        ? <CopyLine command={only} label={`Copy ${only}`} />
        : <pre><code>{block.lines.map(line => `$ ${line}`).join('\n')}</code></pre>}
    </div>
  )
}

function GuideSection({ section }: { readonly section: Section }) {
  return (
    <section className="guide-section" id={section.id} aria-labelledby={`${section.id}-h`}>
      <h2 id={`${section.id}-h`}>{section.title}{section.status && <span className={`status-tag ${section.status}`}>{statusLabel[section.status]}</span>}</h2>
      {section.code?.map((block, i) => <CodeBlock key={i} block={block} />)}
      {section.body?.map((p, i) => <p key={i}><Inline text={p} /></p>)}
      {section.after?.map((block, i) => <CodeBlock key={i} block={block} />)}
      {section.list && <ul>{section.list.map(item => <ListItem key={item} text={item} />)}</ul>}
    </section>
  )
}

export function GuidePage({ guide }: { readonly guide: Guide }) {
  return (
    <div className="guide-page page-width">
      <aside className="guide-toc" aria-label="On this page">
        <p className="eyebrow">{guide.eyebrow}</p>
        <nav>{guide.sections.map(s => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}</nav>
      </aside>
      <article className="guide-body">
        <header>
          <p className="eyebrow">{guide.eyebrow}</p>
          <h1>{guide.title}<br /><span className="spectrum-text">{guide.accent}</span></h1>
          <p className="guide-intro">{guide.intro}</p>
        </header>
        {guide.sections.map(section => <GuideSection key={section.id} section={section} />)}
        {guide.next && (
          <nav className="guide-next" aria-label="Next">
            {guide.next.map(n => <Link key={n.to} to={n.to}>{n.label} <ArrowRight aria-hidden="true" /></Link>)}
          </nav>
        )}
      </article>
    </div>
  )
}
