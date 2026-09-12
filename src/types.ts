export interface CatalogCategory {
  readonly id: string
  readonly label: string
  readonly order: number
  readonly count?: number | null
}

export interface CatalogPlugin {
  readonly id: string
  readonly name: string
  readonly repository: string
  readonly category: string
  readonly description: { readonly en: string }
  readonly added: string | null
  readonly source: 'deepseek-harness' | 'acryl'
  readonly install?: string | null
  readonly stars?: number | null
  readonly installCount?: number | null
  readonly pushedAt?: string | null
  readonly publisher?: string | null
  readonly version?: string | null
  readonly manifestStatus?: 'valid' | 'missing' | 'invalid'
  readonly kinds?: readonly string[]
  /**
   * Which ACRYL surfaces this package is built for - `tui` (the CLI's
   * terminal UI), `web`, `desktop`, or several. Declared by the package
   * itself (`acryl.surfaces` in its package.json, alongside the existing
   * `acryl.artifacts`) and carried straight through to the market
   * provider-page item's `compatibility.hosts` (dsh-community-market's
   * wire contract already reserves that field; this is its first producer).
   */
  readonly surfaces?: readonly AcrylSurface[]
}

/** Mirrors `acryl-harness-runtime`'s own `AcrylSurface` union - the one vocabulary a plugin's `acryl.surfaces` and the market's `compatibility.hosts` both speak. */
export type AcrylSurface = 'tui' | 'web' | 'desktop'

export interface AcrylCatalogDocument {
  readonly generatedAt: string
  readonly source: {
    readonly name: string
    readonly registry: string
    readonly keyword: string
  }
  readonly plugins: readonly CatalogPlugin[]
}

export interface CatalogDocument {
  readonly generatedAt: string
  readonly upstream: {
    readonly name: string
    readonly repository: string
    readonly license: string
  }
  readonly categories: readonly CatalogCategory[]
  readonly plugins: readonly CatalogPlugin[]
}
