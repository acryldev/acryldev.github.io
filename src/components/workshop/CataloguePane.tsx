import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { loadCatalogue, type CatalogueEntry } from '../../lib/workshop'

type Load =
  | { readonly state: 'loading' }
  | { readonly state: 'live'; readonly entries: readonly CatalogueEntry[] }
  | { readonly state: 'failed'; readonly reason: string }

export function CataloguePane({ onPick }: { readonly onPick?: (entry: CatalogueEntry) => void }) {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [runtime, setRuntime] = useState('all')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoad({ state: 'loading' })
    loadCatalogue(controller.signal)
      .then(entries => setLoad({ state: 'live', entries }))
      .catch(reason => {
        if (!controller.signal.aborted) setLoad({ state: 'failed', reason: reason instanceof Error ? reason.message : 'The Blends registry did not answer.' })
      })
    return () => controller.abort()
  }, [attempt])

  const entries = load.state === 'live' ? load.entries : []
  const categories = useMemo(() => [...new Set(entries.map(entry => entry.category))].sort(), [entries])
  const needle = query.trim().toLowerCase()
  const shown = entries.filter(entry =>
    (category === 'all' || entry.category === category)
    && (runtime === 'all' || entry.runtime === runtime)
    && (needle === '' || [entry.name, entry.id, entry.description].some(field => field.toLowerCase().includes(needle))),
  )

  return (
    <section className="workshop-section" aria-labelledby="workshop-blueprints">
      <div className="workshop-section-head">
        <div>
          <p className="eyebrow">Start from a Blueprint</p>
          <h2 id="workshop-blueprints">The public Blends catalogue</h2>
        </div>
        <p>Read live from the ACRYL Blends registry. A Blueprint is a starting point, not a constraint: make the app your own and add an original plugin.</p>
      </div>

      <div className="workshop-filters">
        <label className="workshop-search">
          <Search aria-hidden="true" />
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the catalogue" aria-label="Search the Blends catalogue" />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={event => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Runtime</span>
          <select value={runtime} onChange={event => setRuntime(event.target.value)}>
            <option value="all">Both runtimes</option>
            <option value="acrylblends">acrylblends (standalone app)</option>
            <option value="acryl">acryl (ACRYL starter)</option>
          </select>
        </label>
      </div>

      {load.state === 'loading' && <p className="workshop-note" role="status">Loading the Blends registry...</p>}
      {load.state === 'failed' && (
        <div className="workshop-note" role="alert">
          <p>The registry is unavailable right now: {load.reason}</p>
          <button type="button" className="button secondary small" onClick={() => setAttempt(value => value + 1)}>Try again</button>
        </div>
      )}
      {load.state === 'live' && shown.length === 0 && <p className="workshop-note">No Blueprint matches that search. Clear the filters or start from Blank.</p>}

      {load.state === 'live' && shown.length > 0 && (
        <div className="discovery-grid">
          {shown.map(entry => (
            <article className="discovery-card" key={entry.id}>
              <div className="discovery-card-main">
                <div className="package-mark" aria-hidden="true">{entry.name.slice(0, 1).toUpperCase()}</div>
                <div className="discovery-card-copy">
                  <h3>{entry.name}</h3>
                  <p>{entry.description}</p>
                  <div className="package-facts">
                    <span>{entry.id}</span>
                    <span className="type-chip">{entry.category}</span>
                    <span>v{entry.version}</span>
                    <span>{entry.runtime === 'acrylblends' ? 'standalone app' : entry.runtime === 'acryl' ? 'ACRYL starter' : 'other runtime'}</span>
                    <span className="origin-chip">{entry.origin === 'community' ? 'Community' : 'Registry'}</span>
                  </div>
                  <div className="package-links">
                    <a href={`https://acrylblends.github.io/blends/b/${encodeURIComponent(entry.id)}`} target="_blank" rel="noreferrer">catalogue entry</a>
                    {entry.parent !== undefined && <span>grew from {entry.parent}</span>}
                  </div>
                </div>
              </div>
              <div className="workshop-card-action">
                {onPick === undefined
                  ? <span className="workshop-note-inline">Register to start from this Blueprint</span>
                  : <button type="button" className="button small" onClick={() => onPick(entry)}>Use this Blueprint</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
