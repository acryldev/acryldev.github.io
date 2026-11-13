import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, FileCode, Github, GitBranch, Layers, Search, ShieldCheck, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { CopyLine } from '../components/CopyLine'
import { Inline } from '../components/Inline'
import {
  BLEND_REGISTRY_INDEX, BLEND_REGISTRY_REPO, BLEND_REGISTRY_SITE, blendManifestUrl, blendPageUrl, facetCounts, fetchBlendIndex, matches, newAppCommand,
  type BlendEntry,
} from '../lib/registries'

type Load = { readonly state: 'loading' } | { readonly state: 'live'; readonly entries: readonly BlendEntry[] } | { readonly state: 'failed'; readonly reason: string }

function BlendCommand({ entry }: { readonly entry: BlendEntry }) {
  const command = newAppCommand(entry)
  if (command) return <CopyLine command={command} label={`Copy the command that creates an app from ${entry.name}`} />
  return <span className="browse-only">{entry.runtime === 'acryl' ? 'A starter for the ACRYL app itself: acryl new does not make an app from it' : 'Not an app acryl new can make yet'}</span>
}

const anatomy = [
  ['Name and id', 'The id, such as `acrylblends.csv-explorer`, is what you pass to `--from`. Its first part is the publisher.'],
  ['Kind and version', 'Every entry is a Blueprint: an app as data. The version is the Blueprint\'s, not ACRYL\'s.'],
  ['Grew from', 'The Blueprint it was made from. Follow it to see what the author added.'],
  ['blend.yaml', 'The app as data: its plugin rows in load order, each with its config. Read it before you start from a Blend.'],
] as const

const rules = [
  'A pull request to `acrylblends/acrylblends.github.io` that adds `registry/blends/<id>/`, with a dotted id you own (`yourlogin.thing`) and the folder named like the id.',
  '`blend.yaml` with `kind: Blueprint` and, in `metadata`, the `id`, `name`, `version`, an SPDX `license`, `visibility: public`, a `category` and a one-line `description`.',
  '`acryl.template.json` (`name`, `description`, `plugins`), `package.json`, `src/`, `plugins/` and a `README.md`. No `node_modules/`, `dist/` or `data/`.',
  'CI refuses a private entry, one with no licence, a repeated id, install scripts (`preinstall`, `postinstall`, `prepare` ...), links, `node_modules/` or `.git/`, more than 20 MB or 5000 files, and anything that looks like a key.',
  'Run `bun scripts/registry-index.ts registry` after adding the folder, so `index.json` matches.',
] as const

function BlendGuide() {
  return (
    <section className="blend-guide" aria-labelledby="blend-guide-heading">
      <h2 id="blend-guide-heading" className="sr-only">Reading, making and submitting Blends</h2>
      <div>
        <p className="eyebrow">How to read a Blend</p>
        <dl>{anatomy.map(([term, text]) => <div key={term}><dt>{term}</dt><dd><Inline text={text} /></dd></div>)}</dl>
      </div>
      <div>
        <p className="eyebrow">Make your own</p>
        <ol>
          <li><Inline text="Start an app with `npx acryl new my-app` and grow it with the agent." /></li>
          <li><Inline text="Add an `acryl.template.json` with a `name` and a `description`." /></li>
          <li><Inline text="`npm run save` commits it and pushes it to your GitHub." /></li>
          <li><Inline text="Anyone starts from it with `npx acryl new their-app --from github:you/my-app`. No registry needed." /></li>
        </ol>
      </div>
      <div>
        <p className="eyebrow">Submit it to the registry</p>
        <ul>{rules.map(rule => <li key={rule}><Inline text={rule} /></li>)}</ul>
        <p className="blend-guide-note">A listing is a review by the registry maintainers. A publish command is planned.</p>
      </div>
    </section>
  )
}

function BlendCard({ entry, parent }: { readonly entry: BlendEntry; readonly parent?: BlendEntry }) {
  return (
    <article className="discovery-card" id={entry.id}>
      <div className="discovery-card-main">
        <div className="package-mark"><Layers aria-hidden="true" /></div>
        <div className="discovery-card-copy">
          <a href={blendPageUrl(entry)} target="_blank" rel="noreferrer"><h3>{entry.name}</h3></a>
          <p>{entry.description}</p>
          <div className="package-facts">
            <span>{entry.id}</span>
            <span className="origin-chip acryl">{entry.kind}</span>
            <span className="type-chip">{entry.category}</span>
            <span>v{entry.version}</span>
            <span>{entry.license}</span>
          </div>
          <div className="package-links">
            {entry.parent && <a href={`#${entry.parent}`}><GitBranch aria-hidden="true" /> grew from {parent?.name ?? entry.parent}</a>}
            <a href={blendManifestUrl(entry)} target="_blank" rel="noreferrer"><FileCode aria-hidden="true" /> blend.yaml</a>
            <a href={blendPageUrl(entry)} target="_blank" rel="noreferrer">details <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>
      </div>
      <BlendCommand entry={entry} />
    </article>
  )
}

export function BlendsPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? 'all'
  const searchInput = useRef<HTMLInputElement>(null)
  const [load, setLoad] = useState<Load>({ state: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetchBlendIndex(controller.signal)
      .then(entries => setLoad({ state: 'live', entries }))
      .catch(reason => {
        if (!controller.signal.aborted) setLoad({ state: 'failed', reason: reason instanceof Error ? reason.message : 'The Blend registry did not answer.' })
      })
    return () => controller.abort()
  }, [])

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

  const entries = load.state === 'live' ? load.entries : []
  const byId = useMemo(() => new Map(entries.map(entry => [entry.id, entry])), [entries])
  const categories = useMemo(() => facetCounts(entries.map(entry => entry.category)), [entries])
  const shown = entries.filter(entry => matches([entry.name, entry.id, entry.description, entry.category], query, entry.category, category))
  const update = (values: Partial<Record<'q' | 'category', string>>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(values)) {
      if (!value || value === 'all') next.delete(key)
      else next.set(key, value)
    }
    setParams(next, { replace: true })
  }
  const reset = () => setParams({}, { replace: true })
  const hasFilters = Boolean(query || category !== 'all')

  return (
    <div className="packages-page min-w-0 overflow-clip">
      <section className="directory-intro grid-surface">
        <div className="page-width">
          <p className="eyebrow"><span /> Mirrored from the ACRYL Blends registry</p>
          <h1>Blend <em>registry.</em></h1>
          <p>A Blend is an app made into a starting point: its plugins, their versions and how they are composed, saved as one <code>blend.yaml</code>. Copy the command on a Blend to make your own app from it, change it, then save and share yours. ADE, the ACRYL IDE, is one of them.</p>
          <div className="directory-trust"><span><ShieldCheck aria-hidden="true" /> Source of truth: acrylblends.github.io</span><span>Read live, never copied</span></div>
        </div>
      </section>

      <section className="directory-section page-width" aria-labelledby="all-blends-heading">
        <div className="directory-section-heading">
          <div><p>DISCOVER</p><h2 id="all-blends-heading">All Blends</h2></div>
          {load.state === 'live' ? <span>{shown.length} / {entries.length}</span> : <a href={BLEND_REGISTRY_SITE} target="_blank" rel="noreferrer">Open the registry <ArrowUpRight aria-hidden="true" /></a>}
        </div>
        <div className="directory-action-bar directory-action-bar-short">
          <label className="directory-search">
            <span className="sr-only">Filter Blends by name, id or description</span>
            <Search aria-hidden="true" />
            <input ref={searchInput} type="search" value={query} onChange={event => update({ q: event.target.value })} placeholder="Filter Blends by name, id or description" autoComplete="off" />
            <kbd>/</kbd>
          </label>
          <label><span className="sr-only">Filter by category</span><select value={category} onChange={event => update({ category: event.target.value })}><option value="all">All categories</option>{categories.map(item => <option value={item.value} key={item.value}>{item.value} ({item.count})</option>)}</select></label>
          <button className="directory-reset" type="button" onClick={reset} disabled={!hasFilters}><X aria-hidden="true" /> Reset</button>
        </div>

        <div className="registry-status" role="status" aria-live="polite">
          <span className={load.state === 'live' ? 'live' : load.state}><i /> {load.state === 'live' ? 'Live Blend registry' : load.state === 'loading' ? 'Reading the registry' : 'Registry unavailable'}</span>
          <a href={BLEND_REGISTRY_INDEX} target="_blank" rel="noreferrer">index.json</a>
          {load.state === 'failed' && <span title={load.reason}>{load.reason}</span>}
        </div>

        {load.state === 'live' && shown.length > 0 && <div className="discovery-grid">{shown.map(entry => <BlendCard entry={entry} parent={entry.parent ? byId.get(entry.parent) : undefined} key={entry.id} />)}</div>}
        {load.state === 'live' && shown.length === 0 && (
          <div className="empty-state"><Search aria-hidden="true" /><h3>No matching Blends</h3><p>Try a shorter name or all categories.</p><button className="button secondary" type="button" onClick={reset}>Clear filters</button></div>
        )}
        {load.state === 'failed' && (
          <div className="empty-state"><Layers aria-hidden="true" /><h3>The Blend registry did not answer</h3><p>Browse it directly while it is unreachable from here.</p><a className="button secondary" href={BLEND_REGISTRY_SITE} target="_blank" rel="noreferrer">acrylblends.github.io <ArrowUpRight aria-hidden="true" /></a></div>
        )}
        {load.state === 'loading' && <div className="empty-state"><Layers aria-hidden="true" /><h3>Reading the Blend registry…</h3></div>}

        <BlendGuide />

        <aside className="directory-provenance">
          <div><Layers aria-hidden="true" /><strong>The registry lives on GitHub</strong><p>Its CI checks every Blend and rebuilds the index; this page reads that index live, so a new Blend shows here on the next visit.</p></div>
          <a href={BLEND_REGISTRY_REPO} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> github.com/acrylblends <ArrowUpRight aria-hidden="true" /></a>
        </aside>
      </section>
    </div>
  )
}
