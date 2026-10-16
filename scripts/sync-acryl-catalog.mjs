import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogPluginFromManifest, discoveryKeyword } from './lib/acryl-catalog.mjs'
import { catalogPluginFromRelease, integrityOf, mergeCatalogEntries, packageJsonFromTarball } from './lib/github-releases.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src', 'data', 'acryl-catalog.json')
const maintainedPath = resolve(root, 'src', 'data', 'maintained-acryl-packages.json')
const searchEndpoint = 'https://registry.npmjs.org/-/v1/search'
const registryEndpoint = 'https://registry.npmjs.org'
const pageSize = 250
const concurrency = 12

// GitHub's search allows few anonymous requests; the Pages workflow passes its own token, which only reads public data here.
const githubHeaders = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ACRYL-Catalog-Sync/0.1 (+https://acryl.dev)',
      ...headers,
    },
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`${url} responded with ${response.status}`)
  return response.json()
}

async function discoverPackages() {
  const packages = []
  let from = 0
  let total = Number.POSITIVE_INFINITY
  while (from < total) {
    const params = new URLSearchParams({ text: `keywords:${discoveryKeyword}`, size: String(pageSize), from: String(from) })
    const page = await fetchJson(`${searchEndpoint}?${params}`)
    if (!Array.isArray(page.objects)) throw new Error('npm returned an invalid search result')
    total = typeof page.total === 'number' ? page.total : page.objects.length
    if (page.objects.length === 0) break
    packages.push(...page.objects.map(entry => entry?.package).filter(Boolean))
    from += page.objects.length
  }
  return packages
}

async function mapConcurrent(items, mapper) {
  const results = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await mapper(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return results
}

const searchPackages = await discoverPackages()
const discovered = (await mapConcurrent(searchPackages, async searchPackage => {
  const encodedName = encodeURIComponent(searchPackage.name)
  const manifest = await fetchJson(`${registryEndpoint}/${encodedName}/latest`)
  return catalogPluginFromManifest(manifest, searchPackage)
})).filter(Boolean)
// Packages shared on GitHub only: public repositories with the topic, each from its latest release's one .tgz (spec 044, acryldev/acryldev.github.io#1).
async function discoverGithubReleases() {
  const found = []
  for (let page = 1; page <= 10; page += 1) {
    const result = await fetchJson(`https://api.github.com/search/repositories?q=${encodeURIComponent(`topic:${discoveryKeyword} is:public archived:false`)}&per_page=100&page=${page}`, githubHeaders)
    if (!Array.isArray(result.items)) throw new Error('GitHub returned an invalid search result')
    found.push(...result.items)
    if (result.items.length < 100) break
  }
  const entries = await mapConcurrent(found, async repository => {
    try {
      const release = await fetchJson(`https://api.github.com/repos/${repository.full_name}/releases/latest`, githubHeaders)
      const tarballs = (release.assets ?? []).filter(asset => asset.name.endsWith('.tgz'))
      if (tarballs.length !== 1) return null
      const response = await fetch(tarballs[0].browser_download_url, { headers: { 'User-Agent': 'ACRYL-Catalog-Sync/0.1 (+https://acryl.dev)' }, signal: AbortSignal.timeout(20_000) })
      if (!response.ok) return null
      const bytes = new Uint8Array(await response.arrayBuffer())
      const manifest = packageJsonFromTarball(bytes)
      return manifest === null ? null : catalogPluginFromRelease({ manifest, repository: repository.html_url, owner: repository.owner.login, release, asset: tarballs[0], integrity: integrityOf(bytes) })
    } catch (cause) {
      console.warn(`skipped ${repository.full_name}: ${cause instanceof Error ? cause.message : String(cause)}`)
      return null
    }
  })
  return entries.filter(Boolean)
}

const fromGithub = await discoverGithubReleases()
const maintained = JSON.parse(await readFile(maintainedPath, 'utf8'))
if (!Array.isArray(maintained)) throw new Error('maintained ACRYL packages must be an array')
const plugins = [...new Map([...maintained, ...mergeCatalogEntries(discovered, fromGithub)].map(plugin => [plugin.id, plugin])).values()]
  .sort((left, right) => (right.added ?? '').localeCompare(left.added ?? '') || left.name.localeCompare(right.name))

const document = {
  generatedAt: new Date().toISOString(),
  source: {
    name: 'npm public registry and GitHub releases',
    registry: registryEndpoint,
    keyword: discoveryKeyword,
  },
  plugins,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`)
console.log(`Indexed ${plugins.length} ACRYL packages (${discovered.length} from npm, ${fromGithub.length} from GitHub releases)`)
