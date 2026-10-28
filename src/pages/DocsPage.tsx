import { ArrowUpRight, Braces, Box, Cable, Layers3, MonitorSmartphone } from 'lucide-react'
import { CommandBox } from '../components/CommandBox'

export function DocsPage() {
  return (
    <div className="docs-page page-width">
      <aside className="docs-nav"><p>GET STARTED</p><a href="#overview">Overview</a><a href="#install">Start an app</a><a href="#publish">Publish a package</a><a href="#contract">Compatibility contract</a><a href="#architecture">Runtime layers</a><p>FRAMEWORK DOCS</p><a href="/docs">Acryl on the web <ArrowUpRight aria-hidden="true" /></a><a href="/blends">The Blend registry <ArrowUpRight aria-hidden="true" /></a><p>RESOURCES</p><a href="https://github.com/acryldev">GitHub <ArrowUpRight aria-hidden="true" /></a><a href="https://agentcontextrelay.com/">ACR specification <ArrowUpRight aria-hidden="true" /></a></aside>
      <article className="docs-content">
        <p className="eyebrow">Documentation</p>
        <h1 id="overview">The ACRYL platform</h1>
        <p className="docs-lede">ACRYL is a Cordis plugin platform. Its web framework is Acryl: the router, the Node server, the data ports and live state, each one a Cordis plugin behind a service name. An app is a folder of those plugins, and every capability - including the agent - can be swapped by changing a configuration row.</p>
        <div className="docs-notice"><span>1.0</span><p>DeepSeek Harness is not the platform. It is one agent driver: the ACP driver runs any agent that speaks the Agent Client Protocol, and <code>dsh</code> is its first preset. An app that never starts an agent depends on neither.</p></div>
        <h2 id="install">Start an app</h2>
        <p>A new app is six templates on the same Cordis shape - <code>blank</code>, <code>nodejs</code>, <code>notes</code>, <code>chat</code>, <code>todo</code> and <code>agent</code> - with the framework docs, an <code>AGENTS.md</code> and a test inside it.</p>
        <CommandBox command="npm create acrylblends@latest my-app notes" label="Create an app from a template" />
        <p>A plugin joins an existing app as a folder in its one <code>plugins/</code> directory, so you own the code and can edit it.</p>
        <CommandBox command="npx acrylblends add desktop --dir ./my-app" label="Add a plugin to an app" />
        <div className="docs-cards"><div><Box aria-hidden="true" /><strong>One folder</strong><p>Every plugin of an app lives in <code>plugins/</code>, whether the library copied it or you wrote it.</p></div><div><Braces aria-hidden="true" /><strong>One manifest</strong><p><code>blend.yaml</code> names the plugins, their order and their config; switch one off without touching code.</p></div></div>
        <h2 id="publish">Publish a package</h2>
        <p>Publish an ordinary public npm package with the exact <code>acryl-package</code> keyword. The package catalog refreshes automatically - no ACRYL catalog pull request or repository access is required.</p>
        <CommandBox command={'npm publish --access public --provenance'} label="Publish to npm" />
        <div className="docs-notice"><span>MANIFEST</span><p>Add an <code>acryl</code> manifest with <code>schemaVersion: 1</code> and package-contained artifact paths. Discovery is deliberately permissive; compatibility and trust are shown as distinct evidence, never inferred from a listing.</p></div>
        <p><a className="text-link" href="https://github.com/acryldev/acryldev.github.io/blob/main/docs/packages/publishing.md" target="_blank" rel="noreferrer">Read the package publishing guide <ArrowUpRight aria-hidden="true" /></a></p>
        <h2 id="contract">ACRYL compatibility contract</h2>
        <ol className="contract-list"><li><span>01</span><p>Standard Cordis plugins run through the real Cordis runtime.</p></li><li><span>02</span><p>An app is a folder of Cordis plugins mounted from <code>blend.yaml</code>; nothing is hidden behind a framework-shaped wrapper.</p></li><li><span>03</span><p>A dependency is a service name, never a provider: swapping SQLite for Postgres, or the web for a desktop window, is one configuration row.</p></li><li><span>04</span><p>The 1.0 public surface of <code>acrylblends</code> is written down and versioned, and an app moves forward with <code>acrylblends upgrade</code>.</p></li><li><span>05</span><p>ACRYL capabilities are additive and optional: an app that uses none of them is still an Acryl app.</p></li></ol>
        <h2 id="architecture">Runtime layers</h2>
        <div className="docs-stack"><div><MonitorSmartphone aria-hidden="true" /><span><strong>ACRYL</strong>The product built on the platform: web, desktop and terminal surfaces, the agent panel, the door</span></div><div><Cable aria-hidden="true" /><span><strong>Acryl</strong>The web framework: router, Node server, <code>db</code> and <code>kv</code> ports, live state, JSX</span></div><div><Layers3 aria-hidden="true" /><span><strong>Cordis</strong>Services, Fibers, injection, effects, Loader reconciliation</span></div></div>
      </article>
    </div>
  )
}
