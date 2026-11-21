import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type Piece =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'code'; readonly text: string }
  | { readonly kind: 'link'; readonly text: string; readonly href: string }

/** Text where `code` spans are written with backticks and [a link](/path or https://address) in the usual way. */
export function pieces(text: string): Piece[] {
  return text.split(/(`[^`]+`|\[[^\]]+\]\([^)\s]+\))/u).flatMap((part): Piece[] => {
    if (part === '') return []
    if (part.startsWith('`') && part.endsWith('`')) return [{ kind: 'code', text: part.slice(1, -1) }]
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/u.exec(part)
    return link?.[1] !== undefined && link[2] !== undefined ? [{ kind: 'link', text: link[1], href: link[2] }] : [{ kind: 'text', text: part }]
  })
}

export function Inline({ text }: { readonly text: string }): ReactNode {
  return pieces(text).map((piece, i) => {
    if (piece.kind === 'code') return <code key={i}>{piece.text}</code>
    if (piece.kind === 'link') {
      return piece.href.startsWith('/')
        ? <Link key={i} className="text-link" to={piece.href}>{piece.text}</Link>
        : <a key={i} className="text-link" href={piece.href} target="_blank" rel="noreferrer">{piece.text}</a>
    }
    return <Fragment key={i}>{piece.text}</Fragment>
  })
}
