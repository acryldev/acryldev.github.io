import { ArrowUpRight, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPathOf } from '../../lib/controlCenter'
import { loadCatalogue, loadPlacement, type BlendPlacement, type CatalogueEntry, type Placements, type TaxonomyCategory } from '../../lib/workshop'

type Load =
  | { readonly state: 'loading' }
  | { readonly state: 'live'; readonly entries: readonly CatalogueEntry[]; readonly placement: Placements }
  | { readonly state: 'failed'; readonly reason: string }

const RUNTIME_LABEL = { acrylblends: 'Standalone app', acryl: 'ACRYL starter', other: 'Other runtime' } as const

/** The category an entry is filed under: the Blends site's own taxonomy, else the short one the publisher wrote. */
const two = (value: number): string => String(value).padStart(2, '0')

const categoryOf = (entry: CatalogueEntry, placement: BlendPlacement | undefined): string => placement?.category ?? entry.category

function Screenshot({ entry, placement }: { readonly entry: CatalogueEntry; readonly placement: BlendPlacement | undefined }) {
  const [failed, setFailed] = useState(false)
  const url = placement?.screenshot
  const image = url !== undefined && !failed
    ? <img src={url} alt={`${entry.name}, its first page`} loading="lazy" onError={() => setFailed(true)} />
    : <span className="workshop-bp-shot-empty" aria-hidden="true">{entry.name.slice(0, 1).toUpperCase()}</span>
  const kind = url !== undefined && !failed ? 'workshop-bp-shot' : 'workshop-bp-shot bare'
  return placement?.page === undefined
    ? <div className={kind}>{image}</div>
    : <a className={kind} href={placement.page} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">{image}</a>
}

export function CataloguePane({ onPick }: { readonly onPick?: (entry: CatalogueEntry) => void }) {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [subcategory, setSubcategory] = useState('all')
  const [runtime, setRuntime] = useState('all')
  /** The two ways the catalogue opens: by category, or the flat list of every Blend. */
  const [flat, setFlat] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoad({ state: 'loading' })
    Promise.all([loadCatalogue(controller.signal), loadPlacement(controller.signal)])
      .then(([entries, placement]) => setLoad({ state: 'live', entries, placement }))
      .catch(reason => {
        if (!controller.signal.aborted) setLoad({ state: 'failed', reason: reason instanceof Error ? reason.message : 'The Blends registry did not answer.' })
      })
    return () => controller.abort()
  }, [attempt])

  const entries = load.state === 'live' ? load.entries : []
  const placements = load.state === 'live' ? load.placement.entries : new Map<string, BlendPlacement>()
  const taxonomy: readonly TaxonomyCategory[] = load.state === 'live' ? load.placement.taxonomy : []
  const inCategory = (value: string) => entries.filter(entry => categoryOf(entry, placements.get(entry.id)) === value)
  // Every category of the Blends site, empty ones too: a name with nothing in it yet is still an invitation. Without the taxonomy, only the filled ones.
  const categories = useMemo(() => {
    const known = taxonomy.map(item => item.name)
    const extra = [...new Set(entries.map(entry => categoryOf(entry, placements.get(entry.id))))].filter(name => !known.includes(name)).sort((a, b) => a.localeCompare(b))
    return [...known, ...extra]
  }, [entries, placements, taxonomy])
  const space = taxonomy.find(item => item.name === category)
  const subcategories = useMemo(() => {
    if (category === 'all') return []
    const filed = [...new Set(inCategory(category).map(entry => placements.get(entry.id)?.subcategory).filter((value): value is string => value !== undefined))]
    const listed = space?.subs.map(item => item.name) ?? []
    return [...listed, ...filed.filter(name => !listed.includes(name)).sort((a, b) => a.localeCompare(b))]
  }, [entries, placements, category, space])
  const countIn = (name: string, sub?: string): number => inCategory(name).filter(entry => sub === undefined || placements.get(entry.id)?.subcategory === sub).length
  const numberOf = (name: string): string => { const item = taxonomy.find(entry => entry.name === name); return item === undefined ? '' : `${two(item.number)}  ` }
  const needle = query.trim().toLowerCase()
  const shown = entries.filter(entry => {
    const placement = placements.get(entry.id)
    return (category === 'all' || categoryOf(entry, placement) === category)
      && (subcategory === 'all' || placement?.subcategory === subcategory)
      && (runtime === 'all' || entry.runtime === runtime)
      && (needle === '' || [entry.name, entry.id, entry.description, categoryOf(entry, placement), placement?.subcategory ?? ''].some(field => field.toLowerCase().includes(needle)))
  })

  return (
    <section className="workshop-section" aria-labelledby="workshop-blueprints">
      <div className="workshop-section-head">
        <div>
          <p className="eyebrow">Start from a Blueprint</p>
          <h2 id="workshop-blueprints">The public<br /><span className="spectrum-text">Blends catalogue.</span></h2>
        </div>
        <p>A Blueprint is a ready app you start from: look at its first page, read what it does, open it on acrylblends.github.io, then pick it. It is a starting point, not a constraint: make it your own and add an original plugin.</p>
      </div>

      <div className="workshop-bp-filters">
        <label className="workshop-search">
          <Search aria-hidden="true" />
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Blueprints" aria-label="Search the Blends catalogue" />
        </label>
        <label>
          <span>Kind</span>
          <select value={runtime} onChange={event => setRuntime(event.target.value)}>
            <option value="all">All kinds</option>
            <option value="acrylblends">Standalone app</option>
            <option value="acryl">ACRYL starter</option>
          </select>
        </label>
      </div>
      {load.state === 'live' && category === 'all' && (
        <div className="workshop-bp-browse">
          <div className="workshop-bp-browse-head">
            <div>
              <p className="eyebrow">The taxonomy</p>
              <h3>{flat ? 'Every Blueprint' : 'Browse by category'}</h3>
            </div>
            <p className="workshop-note-inline">{flat ? 'The flat list: every published Blueprint, whichever category it sits in.' : 'Every category the Blends catalogue has, empty ones too: the address is ready before the first publication. Pick one, then a subcategory, or search above.'}</p>
            <div className="workshop-bp-view" role="group" aria-label="Catalogue view">
              <button type="button" className={flat ? 'active' : undefined} aria-pressed={!flat} onClick={() => setFlat(false)}>Categories</button>
              <button type="button" className={flat ? undefined : 'active'} aria-pressed={flat} onClick={() => { setFlat(true); setSubcategory('all') }}>All Blueprints</button>
            </div>
          </div>
          {!flat && <ul className="workshop-bp-cats">
            {categories.map(name => {
              const count = countIn(name)
              const subs = taxonomy.find(item => item.name === name)?.subs.map(item => item.name) ?? []
              return (
                <li key={name}>
                  <button type="button" className="workshop-bp-cat" onClick={() => { setCategory(name); setSubcategory('all') }}>
                    <span className="workshop-bp-cat-num">{numberOf(name).trim() || '-'}</span>
                    <span className="workshop-bp-cat-name">{name}</span>
                    {subs.length > 0 && <span className="workshop-bp-cat-subs">{subs.slice(0, 3).join(' · ')}{subs.length > 3 ? ' · ...' : ''}</span>}
                    <span className="workshop-bp-cat-count">{count === 0 ? 'Open space' : `${String(count)} ${count === 1 ? 'Blueprint' : 'Blueprints'}`}</span>
                  </button>
                </li>
              )
            })}
          </ul>}
        </div>
      )}
      {load.state === 'live' && category !== 'all' && (
        <div className="workshop-bp-space">
          <p className="eyebrow">{space === undefined ? 'Category' : `Category ${two(space.number)}`}</p>
          <h3>{category}</h3>
          <div className="workshop-bp-space-actions">
            <button type="button" className="button secondary small" onClick={() => { setCategory('all'); setSubcategory('all') }}>All categories</button>
          </div>
          {subcategories.length > 0 && (
            <div className="workshop-bp-subs" role="group" aria-label={`Subcategories of ${category}`}>
              <button type="button" className={subcategory === 'all' ? 'active' : undefined} aria-pressed={subcategory === 'all'} onClick={() => setSubcategory('all')}>
                All of {category}
              </button>
              {subcategories.map(value => (
                <button key={value} type="button" className={subcategory === value ? 'active' : undefined} aria-pressed={subcategory === value} onClick={() => setSubcategory(value)}>
                  {value}{countIn(category, value) > 0 && <em>{countIn(category, value)}</em>}
                </button>
              ))}
            </div>
          )}
          {shown.length === 0 && needle === '' && runtime === 'all' && (
            <p>No Blueprint here yet. This space is open: pick an idea that fits {subcategory === 'all' ? category : subcategory} and build the first one.</p>
          )}
          {(space?.subs.find(item => item.name === subcategory)?.page ?? space?.page) !== undefined && (
            <a className="button secondary small" href={space?.subs.find(item => item.name === subcategory)?.page ?? space?.page} target="_blank" rel="noreferrer">This space on Blends <ArrowUpRight aria-hidden="true" /></a>
          )}
        </div>
      )}
      {load.state === 'live' && <p className="workshop-note-inline workshop-bp-count" role="status">{shown.length === entries.length ? `${String(entries.length)} Blueprints` : `${String(shown.length)} of ${String(entries.length)} Blueprints`}</p>}

      {load.state === 'loading' && <p className="workshop-note" role="status">Loading the Blends registry...</p>}
      {load.state === 'failed' && (
        <div className="workshop-note" role="alert">
          <p>The registry is unavailable right now: {load.reason}</p>
          <button type="button" className="button secondary small" onClick={() => setAttempt(value => value + 1)}>Try again</button>
        </div>
      )}
      {load.state === 'live' && shown.length === 0 && (needle !== '' || runtime !== 'all' || category === 'all') && <p className="workshop-note">No Blueprint matches that search. Clear the filters or start from Blank.</p>}

      {load.state === 'live' && shown.length > 0 && (
        <div className="workshop-bp-grid">
          {shown.map(entry => {
            const placement = placements.get(entry.id)
            return (
              <article className="workshop-bp-card" key={entry.id}>
                <Screenshot entry={entry} placement={placement} />
                <div className="workshop-bp-body">
                  <div className="workshop-bp-meta">
                    <span className="type-chip">{categoryOf(entry, placement)}{placement?.subcategory !== undefined ? ` / ${placement.subcategory}` : ''}</span>
                    <span className="origin-chip">{entry.origin === 'community' ? 'Community' : 'Official'}</span>
                  </div>
                  <h3>{entry.name}</h3>
                  <p>{entry.description}</p>
                  <p className="workshop-bp-path">{createPathOf(entry.name)}</p>
                  <p className="workshop-note-inline">{RUNTIME_LABEL[entry.runtime]} · v{entry.version}{entry.parent !== undefined ? ` · grew from ${entry.parent}` : ''}</p>
                </div>
                <div className="workshop-bp-actions">
                  {placement?.page !== undefined
                    ? <a className="button secondary small" href={placement.page} target="_blank" rel="noreferrer">See it on Blends <ArrowUpRight aria-hidden="true" /></a>
                    : <a className="button secondary small" href={`https://acrylblends.github.io/blends/b/${encodeURIComponent(entry.id)}`} target="_blank" rel="noreferrer">See it on Blends <ArrowUpRight aria-hidden="true" /></a>}
                  {onPick === undefined
                    ? <span className="workshop-note-inline">Register to start from this one</span>
                    : <button type="button" className="button small" onClick={() => onPick(entry)}>Use this Blueprint</button>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
