import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Box, Calendar, Download, Github, ShieldAlert, Star, Tag } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CommandBox } from '../components/CommandBox'
import { catalog, findPlugin, installCommand, repositorySlug } from '../lib/catalog'
import { fetchRegistryPlugin } from '../lib/registry'
import type { CatalogPlugin } from '../types'

function formatMetric(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Not reported'
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function PackagePage() {
  const params = useParams()
  const id = `${params.owner ?? ''}/${params['*'] ?? ''}`.replace(/\/$/, '')
  const localPlugin = findPlugin(id)
  const [plugin, setPlugin] = useState<CatalogPlugin | undefined>(localPlugin)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const local = findPlugin(id)
    setPlugin(local)
    setFailed(false)
    if (local?.source === 'acryl') return () => controller.abort()
    fetchRegistryPlugin(id, controller.signal)
      .then(setPlugin)
      .catch(() => {
        if (!controller.signal.aborted && !findPlugin(id)) setFailed(true)
      })
    return () => controller.abort()
  }, [id])

  if (!plugin && !failed) return <div className="not-found page-width"><span>REGISTRY</span><h1>Loading package…</h1></div>
  if (!plugin) return <div className="not-found page-width"><span>404</span><h1>Package not found.</h1><Link className="button" to="/packages">Return to packages</Link></div>

  const category = catalog.categories.find(item => item.id === plugin.category)?.label ?? plugin.category
  const command = installCommand(plugin)
  return (
    <div className="package-detail page-width">
      <Link className="back-link" to="/packages"><ArrowLeft aria-hidden="true" /> All packages</Link>
      <section className="package-detail-hero">
        <div className="package-detail-icon"><Box aria-hidden="true" /></div>
        <div className="package-detail-title">
          <p className="eyebrow">{plugin.source === 'acryl' ? 'ACRYL package ecosystem' : 'DeepSeek Harness ecosystem'}</p>
          <h1>{plugin.name}</h1>
          <p>{plugin.description.en}</p>
          <div className="detail-tags">
            <span><Tag aria-hidden="true" /> {category}</span>
            {plugin.added && <span><Calendar aria-hidden="true" /> Added {plugin.added}</span>}
            {plugin.installCount !== undefined && <span><Download aria-hidden="true" /> {formatMetric(plugin.installCount)} installs</span>}
            {plugin.stars !== undefined && <span><Star aria-hidden="true" /> {formatMetric(plugin.stars)} stars</span>}
          </div>
        </div>
        <a className="button secondary" href={plugin.repository} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> Repository <ArrowUpRight aria-hidden="true" /></a>
      </section>
      <div className="detail-grid">
        <main>
          <section className="detail-panel">
            <p className="panel-label">INSTALL</p>
            {command ? (
              <>
                <h2>Install in an ACRYL Desktop profile</h2>
                <p>This npm package declares a DeepSeek Harness bundle. ACRYL preserves the standard DSH installation path and changes only the target profile.</p>
                <CommandBox command={command} />
              </>
            ) : (
              <>
                <h2>Browse-only package</h2>
                <p>No verified npm installation method is available in the upstream registry. Source installs are intentionally not offered. Review the repository while its package manifest is being verified.</p>
                <a className="button secondary" href={plugin.repository} target="_blank" rel="noreferrer">Inspect repository <ArrowUpRight aria-hidden="true" /></a>
              </>
            )}
          </section>
          <section className="detail-panel">
            <p className="panel-label">COMPATIBILITY</p>
            <h2>Source-aware, not compatibility-washed.</h2>
            <div className="compatibility-row"><strong>DeepSeek Harness</strong><span className="status native">Native source</span></div>
            <div className="compatibility-row"><strong>Cordis</strong><span className="status inspect">Inspect manifest</span></div>
            <div className="compatibility-row"><strong>ACRYL Desktop</strong><span className="status inspect">Unverified</span></div>
            <p className="fine-print">Catalog inclusion is not a security review or compatibility guarantee. Inspect each repository and its license before installation.</p>
          </section>
        </main>
        <aside className="detail-aside">
          <section><p className="panel-label">SOURCE</p><dl><dt>Registry</dt><dd>{plugin.source === 'acryl' ? 'npm · acryl-package' : 'DSH 1024Store'}</dd><dt>Repository</dt><dd>{repositorySlug(plugin.repository)}</dd>{plugin.version && <><dt>Version</dt><dd>{plugin.version}</dd></>}<dt>Package license</dt><dd>See upstream</dd><dt>Catalog source</dt><dd>{plugin.source === 'acryl' ? 'Automated npm discovery' : 'Live API with static fallback'}</dd><dt>Install status</dt><dd>{command ? 'Verified npm path' : 'Browse only'}</dd></dl></section>
          <section className="security-callout"><ShieldAlert aria-hidden="true" /><div><strong>Third-party code</strong><p>Host plugins may access Node.js, files, and network resources. Install only code you trust.</p></div></section>
        </aside>
      </div>
    </div>
  )
}
