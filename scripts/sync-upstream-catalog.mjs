import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const defaultSource = resolve(root, '..', 'awesome-deepseek-harness-plugins')
const source = resolve(process.env.ACRYL_CATALOG_SOURCE ?? defaultSource)
const pluginsDir = join(source, 'catalog', 'plugins')
const categoriesPath = join(source, 'catalog', 'categories.json')
const outputPath = join(root, 'src', 'data', 'catalog.json')

const [fileNames, categoriesDocument] = await Promise.all([
  readdir(pluginsDir),
  readFile(categoriesPath, 'utf8').then(JSON.parse),
])

const plugins = []
for (const fileName of fileNames.filter(name => name.endsWith('.json')).sort()) {
  const raw = JSON.parse(await readFile(join(pluginsDir, fileName), 'utf8'))
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string' || typeof raw.repository !== 'string') continue
  plugins.push({
    id: raw.id,
    name: raw.name,
    repository: raw.repository,
    category: typeof raw.category === 'string' ? raw.category : 'tools',
    description: {
      en: typeof raw.description?.en === 'string' ? raw.description.en : '',
    },
    added: typeof raw.added === 'string' ? raw.added : null,
    source: 'deepseek-harness',
  })
}

const categories = categoriesDocument.categories.map(category => ({
  id: category.id,
  label: category.label.en,
  order: category.order,
}))

const document = {
  generatedAt: new Date().toISOString(),
  upstream: {
    name: 'DSH 1024Store community catalog',
    repository: 'https://github.com/imsai-sh/awesome-deepseek-harness-plugins',
    license: 'CC0-1.0 catalog provenance; individual packages retain their own licenses',
  },
  categories,
  plugins,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`)
console.log(`Wrote ${plugins.length} packages to ${outputPath}`)
