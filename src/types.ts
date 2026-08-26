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
}

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
