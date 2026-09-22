import { useDeferredValue, useMemo, useState } from 'react'
import { Github, LayoutGrid, PackageSearch, Search } from 'lucide-react'
import { uiRegistry, type UiRegistryItem } from '../lib/ui-registry'

function ItemCard({ item }: { readonly item: UiRegistryItem }) {
  return (
    <article className="discovery-card">
      <div className="discovery-card-main">
        <div className="package-mark"><LayoutGrid aria-hidden="true" /></div>
        <div className="discovery-card-copy">
          <h3>{item.id}</h3>
          <p>{item.summary}</p>
          <div className="package-facts">
            <span>v{item.version}</span>
            {item.surfaces.map(surface => <span key={surface} className="type-chip">{surface}</span>)}
            <span className="origin-chip acryl">{item.origin}</span>
          </div>
          {item.props.length > 0 && (
            <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', opacity: 0.7 }}>
              props: {item.props.join(', ')}
            </p>
          )}
          <div className="package-links">
            <a href={`${uiRegistry.repository}/tree/main/registry/${item.id}`} target="_blank" rel="noreferrer">
              <Github aria-hidden="true" /> source
            </a>
            <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', opacity: 0.6 }}>{item.source}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export function UiPage() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const shown = useMemo(
    () => uiRegistry.items.filter(item =>
      [item.id, item.summary, item.origin, ...item.surfaces].join(' ').toLowerCase().includes(deferredQuery.toLowerCase())),
    [deferredQuery],
  )
  return (
    <div className="page-width">
      <header style={{ padding: '3rem 0 1.5rem' }}>
        <h1>UI component registry</h1>
        <p style={{ maxWidth: '46rem', opacity: 0.8 }}>
          Source-owned components for <code>@acryl/ui</code> (spec 038-ui-component-library). Copy one with{' '}
          <code>acryl ui add &lt;id&gt;</code> and own it in your own plugin, or install the whole package as a
          dependency. Every item's source is extracted from the pinned DeepSeek Harness commit named on its card,
          never redrawn from scratch.
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.7 }}>
          {uiRegistry.items.length} items · package <code>{uiRegistry.package}</code> ·{' '}
          <a href={uiRegistry.repository} target="_blank" rel="noreferrer">{uiRegistry.repository.replace('https://', '')}</a>
        </p>
      </header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border, #2a2a2a)', paddingBottom: '1.5rem' }}>
        <Search size={16} aria-hidden="true" />
        <input
          value={query}
          onChange={event => { setQuery(event.target.value) }}
          placeholder="Search by name, surface or origin"
          aria-label="Search the UI registry"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem' }}
        />
      </div>
      <div className="discovery-grid" style={{ marginTop: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', paddingBottom: '3rem' }}>
        {shown.map(item => <ItemCard key={item.id} item={item} />)}
        {shown.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', opacity: 0.6 }}>
            <PackageSearch aria-hidden="true" />
            <p>No registry item matches this search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
