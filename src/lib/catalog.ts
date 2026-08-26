import acrylCatalogJson from '../data/acryl-catalog.json'
import catalogJson from '../data/catalog.json'
import type { AcrylCatalogDocument, CatalogDocument, CatalogPlugin } from '../types'

export const catalog = catalogJson as CatalogDocument
export const acrylCatalog = acrylCatalogJson as AcrylCatalogDocument

export function repositorySlug(repository: string): string {
  return repository.replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '')
}

export function installCommand(plugin: CatalogPlugin): string | null {
  return plugin.install ?? null
}

export function filterPlugins(
  plugins: readonly CatalogPlugin[],
  query: string,
  category: string,
): CatalogPlugin[] {
  const needle = query.trim().toLocaleLowerCase()
  return plugins.filter(plugin => {
    if (category !== 'all' && plugin.category !== category) return false
    if (!needle) return true
    return [plugin.name, plugin.id, plugin.description.en, plugin.category]
      .some(value => value.toLocaleLowerCase().includes(needle))
  })
}

export function packagePath(plugin: CatalogPlugin): string {
  return `/packages/${plugin.id.split('/').map(encodeURIComponent).join('/')}`
}

export function findPlugin(id: string): CatalogPlugin | undefined {
  const normalized = id.split('/').map(decodeURIComponent).join('/')
  return [...acrylCatalog.plugins, ...catalog.plugins]
    .find(plugin => plugin.id.toLocaleLowerCase() === normalized.toLocaleLowerCase())
}
