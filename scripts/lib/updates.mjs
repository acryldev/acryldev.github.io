const SUBJECT = /^(feat|fix)(?:\(([^)]+)\))?!?:\s*(.+)$/u

/**
 * One commit subject as an Updates entry, or undefined when it is not a feature or a fix.
 * @param {string} subject - the first line of the commit message.
 * @returns {{ type: 'feat' | 'fix', scope: string | null, title: string, details: string | null } | undefined}
 */
export function parseCommit(subject) {
  const match = SUBJECT.exec(subject.trim())
  if (match === null) return undefined
  const [, type, scope, rest] = match
  const cut = rest.indexOf(' - ')
  const title = (cut < 0 ? rest : rest.slice(0, cut)).trim()
  const details = cut < 0 ? null : rest.slice(cut + 3).trim()
  return { type, scope: scope ?? null, title, details: details || null }
}
