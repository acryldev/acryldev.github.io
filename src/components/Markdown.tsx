import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { resolveLink } from '../lib/framework-docs'

/** One page of markdown, with links between pages resolved to site routes and code highlighted. */
export function Markdown({ pageKey, children }: { pageKey: string; children: string }) {
  return (
    <div className="md-doc">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={{
          a({ href = '', children: label }) {
            const target = resolveLink(pageKey, href)
            if (target.external) return <a href={target.href} target="_blank" rel="noreferrer">{label}</a>
            if (target.href.startsWith('#')) return <a href={target.href}>{label}</a>
            return <Link to={target.href}>{label}</Link>
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
