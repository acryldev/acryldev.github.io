import uiRegistryJson from '../data/ui-registry.json'

export interface UiRegistryItem {
  id: string
  version: string
  surfaces: readonly string[]
  summary: string
  props: readonly string[]
  origin: string
  from: string
  source: string
}

export interface UiRegistryDocument {
  generatedAt: string
  package: string
  repository: string
  items: readonly UiRegistryItem[]
}

export const uiRegistry = uiRegistryJson as UiRegistryDocument
