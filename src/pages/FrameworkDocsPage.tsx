import { Link, useParams } from 'react-router-dom'
import { Markdown } from '../components/Markdown'
import { docUrl, keyFromUrl, nav, pages } from '../lib/framework-docs'

/** The framework docs at /docs: the sidebar lists every page, the body is the page's markdown. */
export function FrameworkDocsPage() {
  const { '*': splat } = useParams()
  const key = keyFromUrl(splat)
  const page = pages.get(key)
  if (!page) return <div className="not-found page-width"><span>404</span><h1>Page not found.</h1></div>
  const order = nav.flatMap((section) => section.keys)
  const at = order.indexOf(key)
  const previous = at > 0 ? pages.get(order[at - 1]!) : undefined
  const next = at >= 0 ? pages.get(order[at + 1] ?? '') : undefined
  return (
    <div className="docs-page page-width fw-docs">
      <aside className="docs-nav">
        {nav.map((section) => (
          <div key={section.title}>
            <p>{section.title.toUpperCase()}</p>
            {section.keys.map((k) => (
              <Link key={k} to={docUrl(k)} aria-current={k === key ? 'page' : undefined}>{pages.get(k)?.title}</Link>
            ))}
          </div>
        ))}
      </aside>
      <article className="docs-content">
        <Markdown key={key} pageKey={key}>{page.markdown}</Markdown>
        <div className="md-pager">
          {previous ? <Link to={docUrl(previous.key)}>&larr; {previous.title}</Link> : <span />}
          {next ? <Link to={docUrl(next.key)}>{next.title} &rarr;</Link> : <span />}
        </div>
      </article>
    </div>
  )
}
