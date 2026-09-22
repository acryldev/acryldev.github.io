#!/usr/bin/env node
// Sync real component source from acryldev/acryl-ui-registry into this site (spec
// 038-ui-component-library). Copies web/*.tsx and *.module.css verbatim - nothing is
// rewritten - plus item.yaml (parsed into a small JS manifest) and the shared
// contracts/categories.json. Run with a local path to a cloned acryl-ui-registry:
//   node scripts/sync-ui-registry.mjs <path-to-cloned-registry> <path-to-acryl-ui-package-contracts>
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as yamlParse } from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'src', 'ui-registry', 'components')
const registryDir = process.argv[2]
const contractsDir = process.argv[3]

if (registryDir === undefined || contractsDir === undefined) {
  console.error('usage: node scripts/sync-ui-registry.mjs <cloned-acryl-ui-registry>/registry <acryl-ui-package>/contracts')
  process.exit(2)
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const index = JSON.parse(readFileSync(join(registryDir, 'index.json'), 'utf8'))
const manifest = []
for (const entry of index.items) {
  const itemDir = join(registryDir, entry.id)
  const item = yamlParse(readFileSync(join(itemDir, 'item.yaml'), 'utf8'))
  const webFiles = entry.files.filter(file => file.path.startsWith('web/'))
  if (webFiles.length === 0) continue
  const destDir = join(out, entry.id)
  mkdirSync(destDir, { recursive: true })
  const tsxFile = webFiles.find(file => file.path.endsWith('.tsx'))
  for (const file of webFiles) {
    const content = readFileSync(join(itemDir, file.path))
    writeFileSync(join(destDir, file.path.split('/').pop()), content)
  }
  manifest.push({
    id: entry.id,
    version: entry.version,
    summary: item.contract.summary,
    props: item.contract.props ?? {},
    origin: item.origin.note,
    from: item.origin.from,
    source: item.origin.source,
    componentFile: tsxFile?.path.split('/').pop() ?? null,
    exportName: (() => {
      if (tsxFile === undefined) return null
      const text = readFileSync(join(itemDir, tsxFile.path), 'utf8')
      const match = /export function ([A-Z][A-Za-z]*)/u.exec(text)
      return match?.[1] ?? null
    })(),
  })
}
manifest.sort((left, right) => left.id.localeCompare(right.id))
writeFileSync(join(root, 'src', 'ui-registry', 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

const categories = JSON.parse(readFileSync(join(contractsDir, 'categories.json'), 'utf8'))
writeFileSync(join(root, 'src', 'ui-registry', 'categories.json'), `${JSON.stringify(categories, null, 2)}\n`)

console.log(`synced ${manifest.length} component(s) and ${categories.categories.length} categories into src/ui-registry/`)
