import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, Github, PackageSearch, Search, ShieldCheck, Star, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { CopyLine } from '../components/CopyLine'
import { CordisPluginsSection } from '../components/CordisPluginsSection'
import { catalog, filterPlugins, installCommand, packagePath, repositorySlug } from '../lib/catalog'
import { CATALOG_PAGE_SIZE, fetchRegistryPage, type CatalogSort, type RegistryPage } from '../lib/registry'
import type { CatalogPlugin } from '../types'

const SORTS: readonly { value: CatalogSort; label: string }[] = [
  { value: 'installs', label: 'Most installed' },
  { value: 'stars', label: 'Most starred' },
  { value: 'newest', label: 'Recently added' },
  { value: 'name', label: 'A-Z' },
]

function asPage(value: string | null): number {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function asSort(value: string | null): CatalogSort {
  return SORTS.some(option => option.value === value) ? value as CatalogSort : 'installs'
}

function formatMetric(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function fallbackPage(query: string, category: string, sort: CatalogSort, page: number): RegistryPage {
  const plugins = [...filterPlugins(catalog.plugins, query, category)].sort((left, right) => {
    if (sort === 'name') return left.name.localeCompare(right.name)
    if (sort === 'newest') return (right.added ?? '').localeCompare(left.added ?? '')
    return 0
  })
  const start = (page - 1) * CATALOG_PAGE_SIZE
  return {
    plugins: plugins.slice(start, start + CATALOG_PAGE_SIZE),
    categories: catalog.categories,
    page,
    limit: CATALOG_PAGE_SIZE,
    total: plugins.length,
    totalPages: Math.max(1, Math.ceil(plugins.length / CATALOG_PAGE_SIZE)),
    generatedAt: catalog.generatedAt,
  }
}

function InstallControl({ plugin }: { readonly plugin: CatalogPlugin }) {
  const command = installCommand(plugin)
  if (!command) return <span className="browse-only">Browse only</span>
  return <CopyLine command={command} label={`Copy install command for ${plugin.name}`} />
}

function PackageCard({ plugin }: { readonly plugin: CatalogPlugin }) {
  const author = plugin.publisher ?? repositorySlug(plugin.repository).split('/')[0] ?? 'community'
  return (
    <article className="discovery-card">
      <div className="discovery-card-main">
        <div className="package-mark"><PackageSearch aria-hidden="true" /></div>
        <div className="discovery-card-copy">
          <Link to={packagePath(plugin)}><h3>{plugin.name}</h3></Link>
          <p>{plugin.description.en || 'Community package for the DeepSeek Harness ecosystem.'}</p>
          <div className="package-facts">
            <span>{author}</span>
            <span className={`origin-chip ${plugin.source}`}>{plugin.source === 'acryl' ? 'ACRYL' : 'DSH'}</span>
            <span className="type-chip">{plugin.category}</span>
            {plugin.installCount !== undefined && <span><Download aria-hidden="true" /> {formatMetric(plugin.installCount)}</span>}
            {plugin.stars !== undefined && <span><Star aria-hidden="true" /> {formatMetric(plugin.stars)}</span>}
          </div>
          <div className="package-links">
            <a href={plugin.repository} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> repo</a>
            <Link to={packagePath(plugin)}>details <ChevronRight aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
      <InstallControl plugin={plugin} />
    </article>
  )
}

export function PackagesPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const deferredQuery = useDeferredValue(query)
  const category = params.get('category') ?? 'all'
  const sort = asSort(params.get('sort'))
  const page = asPage(params.get('page'))
  const searchInput = useRef<HTMLInputElement>(null)
  const [catalogPage, setCatalogPage] = useState(() => fallbackPage(query, category, sort, page))
  const [recent, setRecent] = useState<readonly CatalogPlugin[]>(() => [...catalog.plugins].sort((a, b) => (b.added ?? '').localeCompare(a.added ?? '')).slice(0, 8))
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return
      event.preventDefault()
      searchInput.current?.focus()
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setError(null)
    fetchRegistryPage({ query: deferredQuery, category, sort, page }, controller.signal)
      .then(result => {
        setCatalogPage(result)
        setStatus('live')
      })
      .catch(reason => {
        if (controller.signal.aborted) return
        setCatalogPage(fallbackPage(deferredQuery, category, sort, page))
        setStatus('fallback')
        setError(reason instanceof Error ? reason.message : 'The live registry is temporarily unavailable.')
      })
    return () => controller.abort()
  }, [deferredQuery, category, sort, page])

  useEffect(() => {
    const controller = new AbortController()
    fetchRegistryPage({ query: '', category: 'all', sort: 'newest', page: 1, limit: 8 }, controller.signal)
      .then(result => setRecent(result.plugins))
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  const categories = useMemo(() => catalogPage.categories.length > 0 ? catalogPage.categories : catalog.categories, [catalogPage.categories])
  const update = (values: Partial<Record<'q' | 'category' | 'sort' | 'page', string>>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(values)) {
      if (!value || value === 'all' || (key === 'sort' && value === 'installs') || (key === 'page' && value === '1')) next.delete(key)
      else next.set(key, value)
    }
    if (!('page' in values)) next.delete('page')
    setParams(next, { replace: true })
  }
  const reset = () => setParams({}, { replace: true })
  const hasFilters = Boolean(query || category !== 'all' || sort !== 'installs')
  const rangeStart = catalogPage.total === 0 ? 0 : (catalogPage.page - 1) * catalogPage.limit + 1
  const rangeEnd = Math.min(catalogPage.page * catalogPage.limit, catalogPage.total)

  return (
    <div className="packages-page min-w-0 overflow-clip">
      <section className="directory-intro grid-surface">
        <div className="page-width">
          <p className="eyebrow"><span /> ACRYL plugin discovery</p>
          <h1>Plugin <em>catalog.</em></h1>
          <p>Cordis plugins from the Cordis plugin registry first, then the wider DeepSeek Harness ecosystem. Inspect provenance, then pull a plugin into ACRYL with one command.</p>
          <div className="directory-trust"><span><ShieldCheck aria-hidden="true" /> Upstream attribution preserved</span><span>Compatibility is never implied</span></div>
        </div>
      </section>

      {!hasFilters && page === 1 && <CordisPluginsSection />}

      {!hasFilters && page === 1 && (
        <section className="recent-section page-width" aria-labelledby="recent-heading">
          <div className="directory-section-heading"><div><p>FRESH FROM THE DSH 1024STORE</p><h2 id="recent-heading">Recently added</h2></div><span>Updated continuously</span></div>
          <div className="recent-grid">
            {recent.map(plugin => (
              <Link to={packagePath(plugin)} className="recent-card" key={plugin.id}>
                <strong>{plugin.name}</strong>
                <p>{plugin.description.en || 'Community package for DeepSeek Harness.'}</p>
                <span>{plugin.added ?? 'New'} <ChevronRight aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="directory-section page-width" aria-labelledby="all-packages-heading">
        <div className="directory-section-heading"><div><p>DISCOVER IN THE DSH 1024STORE</p><h2 id="all-packages-heading">DeepSeek Harness plugins</h2></div><span>{rangeStart.toLocaleString()}-{rangeEnd.toLocaleString()} / {catalogPage.total.toLocaleString()}</span></div>
        <div className="directory-action-bar">
          <label className="directory-search">
            <span className="sr-only">Filter packages by name, description, or author</span>
            <Search aria-hidden="true" />
            <input ref={searchInput} type="search" value={query} onChange={event => update({ q: event.target.value })} placeholder="Filter packages by name, description, or author" autoComplete="off" />
            <kbd>/</kbd>
          </label>
          <label><span className="sr-only">Filter by category</span><select value={category} onChange={event => update({ category: event.target.value })}><option value="all">All categories</option>{categories.map(item => <option value={item.id} key={item.id}>{item.label}{item.count ? ` (${item.count.toLocaleString()})` : ''}</option>)}</select></label>
          <label><span className="sr-only">Sort packages</span><select value={sort} onChange={event => update({ sort: event.target.value })}>{SORTS.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
          <button className="directory-reset" type="button" onClick={reset} disabled={!hasFilters}><X aria-hidden="true" /> Reset</button>
        </div>

        <div className="registry-status" role="status" aria-live="polite">
          <span className={status}><i /> {status === 'live' ? 'Live DSH registry' : status === 'loading' ? 'Updating results' : 'Static catalog fallback'}</span>
          <span>Source-aware discovery</span>
          {error && <span title={error}>Live source unavailable</span>}
        </div>

        {catalogPage.plugins.length > 0 ? <div className="discovery-grid">{catalogPage.plugins.map(plugin => <PackageCard plugin={plugin} key={plugin.id} />)}</div> : (
          <div className="empty-state"><Search aria-hidden="true" /><h3>No matching packages</h3><p>Try a shorter name, a broader capability, or all categories.</p><button className="button secondary" type="button" onClick={reset}>Clear filters</button></div>
        )}

        {catalogPage.totalPages > 1 && (
          <nav className="catalog-pagination" aria-label="Package catalog pages">
            <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}><ChevronLeft aria-hidden="true" /> Previous</button>
            <span>Page <strong>{catalogPage.page.toLocaleString()}</strong> of {catalogPage.totalPages.toLocaleString()}</span>
            <button type="button" disabled={page >= catalogPage.totalPages} onClick={() => update({ page: String(page + 1) })}>Next <ChevronRight aria-hidden="true" /></button>
          </nav>
        )}

        <aside className="directory-provenance">
          <div><ShieldCheck aria-hidden="true" /><strong>Source-aware by design</strong><p>Catalog metadata comes from the DSH 1024Store registry. Package authors retain ownership and licenses.</p></div>
          <a href={catalog.upstream.repository} target="_blank" rel="noreferrer">View upstream catalog <ArrowUpRight aria-hidden="true" /></a>
        </aside>
      </section>
    </div>
  )
}
