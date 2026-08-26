import { ArrowUpRight, Braces, Box, Cable, Layers3, Terminal } from 'lucide-react'
import { CommandBox } from '../components/CommandBox'

export function DocsPage() {
  return (
    <div className="docs-page page-width">
      <aside className="docs-nav"><p>GET STARTED</p><a href="#overview">Overview</a><a href="#install">Install packages</a><a href="#publish">Publish a package</a><a href="#contract">Compatibility contract</a><a href="#architecture">Architecture</a><p>RESOURCES</p><a href="https://github.com/acryldev">GitHub <ArrowUpRight aria-hidden="true" /></a><a href="https://agentcontextrelay.com/">ACR specification <ArrowUpRight aria-hidden="true" /></a></aside>
      <article className="docs-content">
        <p className="eyebrow">Documentation · Early preview</p>
        <h1 id="overview">ACRYL developer platform</h1>
        <p className="docs-lede">ACRYL is an agent-agnostic desktop and lifecycle environment built as a clean plugin layer over DeepSeek Harness and Cordis.</p>
        <div className="docs-notice"><span>PREVIEW</span><p>The package portal provides live, source-aware discovery with a committed static fallback. Desktop deep links, compatibility scans, ACRYL verification badges, and an ACRYL-owned public API are planned.</p></div>
        <h2 id="install">Install a standard DSH package</h2>
        <p>ACRYL does not translate a DSH package into another format. Standard DSH bundles use the original package mechanism and enter the Cordis Loader composition directly.</p>
        <CommandBox command="dsh plugin --profile desktop add <package-or-git-url>" />
        <div className="docs-cards"><div><Terminal aria-hidden="true" /><strong>Upstream CLI</strong><p>Preserved as the exact compatibility interface.</p></div><div><Box aria-hidden="true" /><strong>ACRYL package UX</strong><p>A unified discovery and install layer above ecosystem-specific installers.</p></div></div>
        <h2 id="publish">Publish an ACRYL package</h2>
        <p>Publish an ordinary public npm package with the exact <code>acryl-package</code> keyword. The package catalog refreshes automatically - no ACRYL catalog pull request or repository access is required.</p>
        <CommandBox command={'npm publish --access public --provenance'} label="Publish to npm" />
        <div className="docs-notice"><span>MANIFEST</span><p>Add an <code>acryl</code> manifest with <code>schemaVersion: 1</code> and package-contained artifact paths. Discovery is deliberately permissive; compatibility and trust are shown as distinct evidence, never inferred from a listing.</p></div>
        <p><a className="text-link" href="https://github.com/acryldev/acryldev.github.io/blob/main/docs/packages/publishing.md" target="_blank" rel="noreferrer">Read the package publishing guide <ArrowUpRight aria-hidden="true" /></a></p>
        <h2 id="contract">ACRYL compatibility contract</h2>
        <ol className="contract-list"><li><span>01</span><p>Standard Cordis plugins run through the real Cordis runtime.</p></li><li><span>02</span><p>Standard DSH bundles install through official DSH package semantics.</p></li><li><span>03</span><p>DSH Web client plugins run through the embedded Harness client surface.</p></li><li><span>04</span><p>Existing Desktop and DSH service names remain compatible.</p></li><li><span>05</span><p>ACRYL capabilities are additive and optional.</p></li></ol>
        <h2 id="architecture">Runtime layers</h2>
        <div className="docs-stack"><div><Cable aria-hidden="true" /><span><strong>ACRYL</strong>Persistent context, relay, agent control, Blueprints, StemCells</span></div><div><Braces aria-hidden="true" /><span><strong>DeepSeek Harness</strong>Sessions, agents, profiles, tools, package semantics</span></div><div><Layers3 aria-hidden="true" /><span><strong>Cordis</strong>Services, Fibers, injection, effects, Loader reconciliation</span></div></div>
      </article>
    </div>
  )
}
