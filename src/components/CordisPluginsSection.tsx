import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, ChevronRight, Github, Plug, Search, X } from 'lucide-react'
import { CopyLine } from './CopyLine'
import { facetCounts, fetchPluginIndex, matches, PLUGIN_REGISTRY_INDEX, PLUGIN_REGISTRY_REPO, PLUGIN_REGISTRY_SITE, type PluginEntry } from '../lib/registries'

type Load = { readonly state: 'loading' } | { readonly state: 'live'; readonly entries: readonly PluginEntry[] } | { readonly state: 'failed'; readonly reason: string }

function PluginInstall({ entry }: { readonly entry: PluginEntry }) {
  const command = entry.release?.acrylPull ?? entry.release?.install
  if (!command) return <span className="browse-only">Not released yet</span>
  return <CopyLine command={command} label={`Copy the install command for ${entry.name}`} />
}

function PluginCard({ entry }: { readonly entry: PluginEntry }) {
  return (
    <article className="discovery-card">
      <div className="discovery-card-main">
        <div className="package-mark"><Plug aria-hidden="true" /></div>
        <div className="discovery-card-copy">
          <a href={entry.page} target="_blank" rel="noreferrer"><h3>{entry.name}</h3></a>
          <p>{entry.description || 'A Cordis plugin.'}</p>
          <div className="package-facts">
            <span>{entry.publisher}</span>
            <span className={entry.compatibility === 'DSH stock' ? 'origin-chip' : 'origin-chip acryl'}>{entry.compatibility}</span>
            <span className="type-chip">{entry.category}</span>
            {entry.release && <span>v{entry.release.version}</span>}
            {entry.release?.published && <span>{entry.release.published}</span>}
          </div>
          <div className="package-links">
            <a href={entry.repo} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> repo</a>
            <a href={entry.page} target="_blank" rel="noreferrer">details <ChevronRight aria-hidden="true" /></a>
          </div>
        </div>
      </div>
      <PluginInstall entry={entry} />
    </article>
  )
}

/** Released plugins (those with a pull command) first, each group in the registry's own id order. */
function releasedFirst(entries: readonly PluginEntry[]): readonly PluginEntry[] {
  return [...entries.filter(entry => entry.release), ...entries.filter(entry => !entry.release)]
}

/** The Cordis plugin registry (cordisplugins.github.io), mirrored live: its index is read in the browser on each visit. */
export function CordisPluginsSection() {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [query, setQuery] = useState('')
  const [compatibility, setCompatibility] = useState('all')

  useEffect(() => {
    const controller = new AbortController()
    fetchPluginIndex(controller.signal)
      .then(entries => setLoad({ state: 'live', entries: releasedFirst(entries) }))
      .catch(reason => {
        if (!controller.signal.aborted) setLoad({ state: 'failed', reason: reason instanceof Error ? reason.message : 'The plugin registry did not answer.' })
      })
    return () => controller.abort()
  }, [])

  const entries = load.state === 'live' ? load.entries : []
  const facets = useMemo(() => facetCounts(entries.map(entry => entry.compatibility)), [entries])
  const shown = entries.filter(entry => matches([entry.name, entry.id, entry.description, entry.publisher, entry.category], query, entry.compatibility, compatibility))
  const hasFilters = Boolean(query || compatibility !== 'all')
  const reset = () => { setQuery(''); setCompatibility('all') }

  return (
    <section className="native-section page-width" aria-labelledby="cordis-plugins-heading">
      <div className="directory-section-heading">
        <div><p>MIRRORED FROM THE CORDIS PLUGIN REGISTRY</p><h2 id="cordis-plugins-heading">Cordis plugins</h2></div>
        {load.state === 'live' ? <span>{shown.length} / {entries.length}</span> : <a href={PLUGIN_REGISTRY_SITE} target="_blank" rel="noreferrer">Open the registry <ArrowUpRight aria-hidden="true" /></a>}
      </div>
      <div className="directory-action-bar directory-action-bar-short">
        <label className="directory-search">
          <span className="sr-only">Filter Cordis plugins by name, publisher or description</span>
          <Search aria-hidden="true" />
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter Cordis plugins by name, publisher or description" autoComplete="off" />
        </label>
        <label><span className="sr-only">Filter by where the plugin runs</span><select value={compatibility} onChange={event => setCompatibility(event.target.value)}><option value="all">Runs on: any</option>{facets.map(item => <option value={item.value} key={item.value}>{item.value} ({item.count})</option>)}</select></label>
        <button className="directory-reset" type="button" onClick={reset} disabled={!hasFilters}><X aria-hidden="true" /> Reset</button>
      </div>
      <div className="registry-status" role="status" aria-live="polite">
        <span className={load.state === 'live' ? 'live' : load.state}><i /> {load.state === 'live' ? 'Live plugin registry' : load.state === 'loading' ? 'Reading the registry' : 'Registry unavailable'}</span>
        <a href={PLUGIN_REGISTRY_INDEX} target="_blank" rel="noreferrer">index.json</a>
        <a href={PLUGIN_REGISTRY_REPO} target="_blank" rel="noreferrer">github.com/cordisplugins</a>
        {load.state === 'failed' && <span title={load.reason}>{load.reason}</span>}
      </div>
      {load.state === 'live' && shown.length > 0 && <div className="discovery-grid">{shown.map(entry => <PluginCard entry={entry} key={entry.id} />)}</div>}
      {load.state === 'live' && shown.length === 0 && (
        <div className="empty-state"><Search aria-hidden="true" /><h3>No matching plugins</h3><p>Try a shorter name or any runtime.</p><button className="button secondary" type="button" onClick={reset}>Clear filters</button></div>
      )}
      {load.state === 'failed' && (
        <div className="empty-state"><Plug aria-hidden="true" /><h3>The plugin registry did not answer</h3><p>Browse it directly while it is unreachable from here.</p><a className="button secondary" href={PLUGIN_REGISTRY_SITE} target="_blank" rel="noreferrer">cordisplugins.github.io <ArrowUpRight aria-hidden="true" /></a></div>
      )}
      {load.state === 'loading' && <div className="empty-state"><Plug aria-hidden="true" /><h3>Reading the plugin registry…</h3></div>}
    </section>
  )
}
