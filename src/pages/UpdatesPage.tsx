import { ArrowUpRight, Bug, Sparkles, Tag } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import updates from '../data/updates.json'

interface Change {
  readonly type: 'feat' | 'fix'
  readonly scope: string | null
  readonly title: string
  readonly details: string | null
  readonly sha: string
  readonly date: string
  readonly url: string
}

interface Release {
  readonly tag: string
  readonly name: string
  readonly date: string
  readonly url: string
  readonly prerelease: boolean
}

type Filter = 'all' | 'feat' | 'fix'
const FILTERS: readonly { readonly id: Filter; readonly label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'feat', label: 'Features' },
  { id: 'fix', label: 'Fixes' },
]

const dayLabel = (iso: string) => new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Vienna' }).format(new Date(iso))
const dayKey = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Vienna' }).format(new Date(iso))

export function UpdatesPage() {
  const [params, setParams] = useSearchParams()
  const filter: Filter = params.get('type') === 'feat' || params.get('type') === 'fix' ? (params.get('type') as Filter) : 'all'
  const changes = updates.commits as readonly Change[]
  // Product releases only: the older separate desktop-v tags are the same versions.
  const releases = (updates.releases as readonly Release[]).filter(release => !release.tag.startsWith('desktop-'))

  const days = useMemo(() => {
    const groups = new Map<string, { label: string; releases: Release[]; changes: Change[] }>()
    const group = (iso: string) => {
      const key = dayKey(iso)
      if (!groups.has(key)) groups.set(key, { label: dayLabel(iso), releases: [], changes: [] })
      return groups.get(key)!
    }
    for (const change of changes) if (filter === 'all' || change.type === filter) group(change.date).changes.push(change)
    const oldest = changes.length > 0 ? dayKey(changes[changes.length - 1]!.date) : ''
    for (const release of releases) if (dayKey(release.date) >= oldest) group(release.date).releases.push(release)
    return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a))
  }, [changes, releases, filter])

  const counts = { all: changes.length, feat: changes.filter(change => change.type === 'feat').length, fix: changes.filter(change => change.type === 'fix').length }

  return (
    <div className="updates-page page-width">
      <header className="page-intro">
        <p className="eyebrow">Updates</p>
        <h1>What is new in ACRYL.</h1>
        <p>Every feature and fix that lands on <code>main</code>, and every release, straight from the git history. Refreshed every 15 minutes.</p>
      </header>

      <section className="release-strip" aria-label="Latest releases">
        {releases.slice(0, 4).map(release => (
          <a key={release.tag} className="release-chip" href={release.url} target="_blank" rel="noreferrer">
            <Tag aria-hidden="true" />
            <strong>{release.tag}</strong>
            <span>{dayLabel(release.date)}</span>
          </a>
        ))}
        <a className="release-chip all" href="https://github.com/acryldev/acryl/releases" target="_blank" rel="noreferrer">All releases <ArrowUpRight aria-hidden="true" /></a>
      </section>

      <div className="filter-row" role="tablist" aria-label="Show">
        {FILTERS.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={filter === item.id ? 'filter-chip active' : 'filter-chip'}
            onClick={() => setParams(item.id === 'all' ? {} : { type: item.id }, { replace: true })}
          >
            {item.label} <span>{counts[item.id]}</span>
          </button>
        ))}
      </div>

      <ol className="update-days">
        {days.map(([key, day]) => (
          <li key={key} className="update-day">
            <h2 className="eyebrow">{day.label}</h2>
            {day.releases.map(release => (
              <a key={release.tag} className="update-release" href={release.url} target="_blank" rel="noreferrer">
                <Tag aria-hidden="true" /> Released <strong>{release.tag}</strong> <ArrowUpRight aria-hidden="true" />
              </a>
            ))}
            <ul>
              {day.changes.map(change => (
                <li key={change.sha} className={`update-item ${change.type}`}>
                  <span className="update-kind">{change.type === 'feat' ? <Sparkles aria-hidden="true" /> : <Bug aria-hidden="true" />}{change.type === 'feat' ? 'New' : 'Fix'}</span>
                  <div className="update-copy">
                    <p className="update-title">
                      {change.scope && <span className="type-chip">{change.scope}</span>}
                      {change.title}
                    </p>
                    {change.details && <p className="update-details">{change.details}</p>}
                  </div>
                  <a className="update-sha" href={change.url} target="_blank" rel="noreferrer" aria-label={`Commit ${change.sha} on GitHub`}>{change.sha}</a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
