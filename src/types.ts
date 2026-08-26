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
  readonly source: 'deepseek-harness'
  readonly install?: string | null
  readonly stars?: number | null
  readonly installCount?: number | null
  readonly pushedAt?: string | null
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
