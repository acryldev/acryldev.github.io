import { Fragment, type ReactNode } from 'react'

/** Text where `code` spans are written with backticks; each becomes <code>. */
export function Inline({ text }: { readonly text: string }): ReactNode {
  return text.split(/(`[^`]+`)/u).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>)
}
