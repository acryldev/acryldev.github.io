import type { CatalogCategory, CatalogPlugin } from '../types'

const REGISTRY_ORIGIN = 'https://deepseek1024.com'

export const CATALOG_PAGE_SIZE = 24

export type CatalogSort = 'installs' | 'stars' | 'newest' | 'name'

export interface RegistryPage {
  readonly plugins: readonly CatalogPlugin[]
  readonly categories: readonly CatalogCategory[]
  readonly page: number
  readonly limit: number
  readonly total: number
  readonly totalPages: number
  readonly generatedAt: string
}

export interface RegistryQuery {
  readonly query: string
  readonly category: string
  readonly sort: CatalogSort
  readonly page: number
  readonly limit?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function installableCommand(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('dsh plugin ')) return null
  return value.includes(' github:') || value.includes(' https://github.com/') ? null : value.replace('--profile web', '--profile desktop')
}

export function parseRegistryPlugin(value: unknown): CatalogPlugin | null {
  if (!isRecord(value) || !isRecord(value.description)) return null
  const id = stringOrNull(value.id)
  const name = stringOrNull(value.name)
  const repository = stringOrNull(value.url)
  const category = stringOrNull(value.category) ?? (isRecord(value.category) ? stringOrNull(value.category.id) : null)
  const description = stringOrNull(value.description.en)
  if (!id || !name || !repository?.startsWith('https://github.com/') || !category || description === null) return null

  return {
    id,
    name,
    repository,
    category,
    description: { en: description },
    added: stringOrNull(value.added),
    source: 'deepseek-harness',
    install: installableCommand(value.install),
    stars: numberOrNull(value.stars),
    installCount: numberOrNull(value.installCount),
    pushedAt: stringOrNull(value.pushedAt),
  }
}

export function parseRegistryPage(value: unknown): RegistryPage {
  if (!isRecord(value) || !Array.isArray(value.plugins) || !Array.isArray(value.categories)) {
    throw new Error('The upstream registry returned an invalid catalog document.')
  }

  const page = numberOrNull(value.page)
  const limit = numberOrNull(value.limit)
  const total = numberOrNull(value.total)
  const totalPages = numberOrNull(value.totalPages)
  const generatedAt = stringOrNull(value.generatedAt)
  if (page === null || limit === null || total === null || totalPages === null || generatedAt === null) {
    throw new Error('The upstream registry returned invalid pagination metadata.')
  }

  const plugins = value.plugins.map(parseRegistryPlugin).filter((plugin): plugin is CatalogPlugin => plugin !== null)
  const categories = value.categories.flatMap(category => {
    if (!isRecord(category)) return []
    const id = stringOrNull(category.id)
    const label = stringOrNull(category.en)
    const count = numberOrNull(category.count)
    if (!id || !label) return []
    return [{ id, label, order: 0, count } satisfies CatalogCategory]
  })

  return { plugins, categories, page, limit, total, totalPages, generatedAt }
}

export function registryUrl(query: RegistryQuery): string {
  const params = new URLSearchParams({
    page: String(Math.max(1, query.page)),
    limit: String(query.limit ?? CATALOG_PAGE_SIZE),
    sort: query.sort,
  })
  if (query.query.trim()) params.set('q', query.query.trim())
  if (query.category && query.category !== 'all') params.set('category', query.category)
  return `${REGISTRY_ORIGIN}/api/v2/plugins?${params}`
}

export async function fetchRegistryPage(query: RegistryQuery, signal?: AbortSignal): Promise<RegistryPage> {
  const response = await fetch(registryUrl(query), { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`The upstream registry responded with ${response.status}.`)
  return parseRegistryPage(await response.json())
}

export async function fetchRegistryPlugin(id: string, signal?: AbortSignal): Promise<CatalogPlugin> {
  const encoded = id.split('/').map(encodeURIComponent).join('/')
  const response = await fetch(`${REGISTRY_ORIGIN}/api/v2/plugins/${encoded}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(response.status === 404 ? 'Package not found.' : `The upstream registry responded with ${response.status}.`)
  const plugin = parseRegistryPlugin(await response.json())
  if (!plugin) throw new Error('The upstream registry returned an invalid package document.')
  return plugin
}
