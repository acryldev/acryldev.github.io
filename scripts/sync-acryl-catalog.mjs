import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogPluginFromManifest, discoveryKeyword } from './lib/acryl-catalog.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src', 'data', 'acryl-catalog.json')
const maintainedPath = resolve(root, 'src', 'data', 'maintained-acryl-packages.json')
const searchEndpoint = 'https://registry.npmjs.org/-/v1/search'
const registryEndpoint = 'https://registry.npmjs.org'
const pageSize = 250
const concurrency = 12

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ACRYL-Catalog-Sync/0.1 (+https://acryl.dev)',
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
const maintained = JSON.parse(await readFile(maintainedPath, 'utf8'))
if (!Array.isArray(maintained)) throw new Error('maintained ACRYL packages must be an array')
const plugins = [...new Map([...maintained, ...discovered].map(plugin => [plugin.id, plugin])).values()]
  .sort((left, right) => (right.added ?? '').localeCompare(left.added ?? '') || left.name.localeCompare(right.name))

const document = {
  generatedAt: new Date().toISOString(),
  source: {
    name: 'npm public registry',
    registry: registryEndpoint,
    keyword: discoveryKeyword,
  },
  plugins,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`)
console.log(`Indexed ${plugins.length} ACRYL packages from npm`)
