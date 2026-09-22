import { useMemo, useState } from 'react'
import { Copy, Check, LayoutGrid, Github } from 'lucide-react'
import manifestJson from '../ui-registry/manifest.json'
import categoriesJson from '../ui-registry/categories.json'
import { demos } from '../ui-registry/demos'
import '../ui-registry/tokens.css'

interface ManifestEntry {
  id: string
  version: string
  summary: string
  props: Record<string, unknown>
  origin: string
  from: string
  source: string
  componentFile: string | null
  exportName: string | null
}

interface Category {
  name: string
  componentIds: string[]
}

const manifest = manifestJson as ManifestEntry[]
const categories = (categoriesJson as { categories: Category[] }).categories
// categories.json's componentIds are contract names (spec 038's contracts/components.json keys,
// e.g. "Badge"), not registry item ids (e.g. "acryl.ui.badge") - match by the manifest's own
// exportName, which is the same name (the two vocabularies exist because the contract is
// per-component and the registry is per-published-item; most map 1:1, but a contract name with
// no registry item, e.g. re-exports like Tag/Pill, correctly has no entry here).
const byExportName = new Map(manifest.map(entry => [entry.exportName, entry]))

function usageSnippet(entry: ManifestEntry): string {
  const propsList = Object.keys(entry.props).slice(0, 3).map(name => `${name}={...}`).join(' ')
  return `acryl ui add ${entry.id} .\n\nimport { ${entry.exportName} } from './ui/${entry.id.replace(/^acryl\.ui\./u, '')}/${entry.componentFile}'\n\n<${entry.exportName} ${propsList} />`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => { void navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => { setCopied(false) }, 1600) }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'none', border: '1px solid var(--pv-border, #444)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: 'inherit' }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy usage'}
    </button>
  )
}

function ComponentCard({ entry }: { entry: ManifestEntry }) {
  const Demo = demos[entry.id]
  return (
    <div style={{ border: '1px solid var(--pv-border, #444)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15 }}>{entry.id}</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.75, maxWidth: '38rem' }}>{entry.summary}</p>
        </div>
        <a href={`https://github.com/acryldev/acryl-ui-registry/tree/main/registry/${entry.id}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, opacity: 0.7, whiteSpace: 'nowrap' }}>
          <Github size={12} /> source
        </a>
      </div>
      <div style={{ marginTop: 12, padding: 16, borderRadius: 8, background: 'var(--pv-surface, #fafafa)', border: '1px dashed var(--pv-border, #444)' }}>
        {Demo !== undefined ? <Demo /> : <span style={{ opacity: 0.6, fontSize: 12 }}>No live demo written yet.</span>}
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <pre style={{ margin: 0, fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap', opacity: 0.8, flex: 1 }}>{usageSnippet(entry)}</pre>
        <CopyButton text={usageSnippet(entry)} />
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 11, fontFamily: 'monospace', opacity: 0.6 }}>{entry.origin} &middot; {entry.source}</p>
    </div>
  )
}

export function UiPage() {
  const [active, setActive] = useState<string | null>(null)
  const hasRealEntry = (category: Category): boolean => category.componentIds.some(name => byExportName.has(name))
  const populated = useMemo(() => categories.filter(hasRealEntry), [])
  const empty = useMemo(() => categories.filter(category => !hasRealEntry(category)), [])
  const shown = active === null ? categories : categories.filter(category => category.name === active)

  return (
    <div className="page-width" style={{ display: 'flex', gap: 32, alignItems: 'flex-start', paddingTop: '2rem' }}>
      <aside style={{ width: 220, flexShrink: 0, position: 'sticky', top: 90 }}>
        <h2 style={{ fontSize: 14, margin: '0 0 8px' }}>Categories</h2>
        <p style={{ fontSize: 11, opacity: 0.6, margin: '0 0 12px' }}>{populated.length} built &middot; {empty.length} not yet built</p>
        <button type="button" onClick={() => { setActive(null) }} style={{ display: 'block', width: '100%', textAlign: 'left', background: active === null ? 'var(--pv-border, #333)' : 'none', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 13, cursor: 'pointer', color: 'inherit' }}>All</button>
        <div style={{ maxHeight: '70vh', overflowY: 'auto', marginTop: 4 }}>
          {populated.map(category => (
            <button key={category.name} type="button" onClick={() => { setActive(category.name) }}
              style={{ display: 'flex', justifyContent: 'space-between', width: '100%', textAlign: 'left', background: active === category.name ? 'var(--pv-border, #333)' : 'none', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 13, cursor: 'pointer', color: 'inherit' }}>
              {category.name} <span style={{ opacity: 0.5 }}>{category.componentIds.filter(name => byExportName.has(name)).length}</span>
            </button>
          ))}
          <div style={{ margin: '8px 0 4px', fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Not yet built</div>
          {empty.map(category => (
            <div key={category.name} style={{ padding: '4px 8px', fontSize: 12, opacity: 0.4 }}>{category.name}</div>
          ))}
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0, paddingBottom: '4rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><LayoutGrid size={20} /> UI component registry</h1>
        <p style={{ maxWidth: '42rem', opacity: 0.8 }}>
          Source-owned components for <code>@acryl/ui</code>. Copy one with <code>acryl ui add &lt;id&gt;</code> and own it, or install
          the whole package as a dependency. Categories follow shadcnblocks.com's taxonomy (naming only, no code); every category is shown, built or not.
        </p>
        {shown.filter(hasRealEntry).map(category => (
          <section key={category.name} style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 16, borderBottom: '1px solid var(--pv-border, #444)', paddingBottom: 6 }}>{category.name}</h2>
            {category.componentIds.map((name) => {
              const entry = byExportName.get(name)
              return entry === undefined ? null : <ComponentCard key={name} entry={entry} />
            })}
          </section>
        ))}
        {active !== null && shown.every(category => !hasRealEntry(category)) && (
          <p style={{ marginTop: 24, opacity: 0.6 }}>Nothing built in this category yet.</p>
        )}
      </main>
    </div>
  )
}
