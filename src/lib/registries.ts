// The two registries acryl.dev mirrors: Blends from acrylblends.github.io and Cordis plugins from cordisplugins.github.io. Both publish a static
// `index.json` (formatVersion 1) that the acrylblends session owns; this site reads it in the browser at view time, so a new entry shows here
// without a site rebuild. Unknown fields are ignored and malformed entries are skipped; a different formatVersion is refused.

export const BLEND_REGISTRY_BASE = 'https://acrylblends.github.io/registry/'
export const BLEND_REGISTRY_INDEX = `${BLEND_REGISTRY_BASE}index.json`
export const BLEND_REGISTRY_SITE = 'https://acrylblends.github.io/blends'
export const BLEND_REGISTRY_REPO = 'https://github.com/acrylblends'

export const PLUGIN_REGISTRY_INDEX = 'https://cordisplugins.github.io/registry/index.json'
export const PLUGIN_REGISTRY_SITE = 'https://cordisplugins.github.io'
export const PLUGIN_REGISTRY_REPO = 'https://github.com/cordisplugins'

const FORMAT_VERSION = 1

export interface BlendEntry {
  readonly id: string
  readonly name: string
  readonly kind: string
  readonly version: string
  /** The entry's folder inside the registry, e.g. `blends/acryl.gtd`. */
  readonly path: string
  readonly license: string
  readonly category: string
  readonly description: string
  /** The id of the Blueprint it grew from; absent for a root such as `acryl.blank`. */
  readonly parent?: string
}

export type PluginCompatibility = 'Both' | 'ACRYL' | 'DSH stock'

export interface PluginRelease {
  readonly version: string
  readonly releaseTag?: string
  readonly published?: string
  readonly tarball?: string
  readonly integrity?: string
  /** The stock DSH install command. */
  readonly install?: string
  /** The ACRYL command, `/plugin pull github:owner/repo@version`. */
  readonly acrylPull?: string
}

export interface PluginEntry {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: string
  readonly compatibility: PluginCompatibility
  readonly publisher: string
  readonly repo: string
  readonly page: string
  readonly acrylPackage: boolean
  readonly provides: readonly string[]
  readonly consumes: readonly string[]
  /** Present only for a released plugin. */
  readonly release?: PluginRelease
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

function texts(value: unknown): readonly string[] | undefined {
  return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : undefined
}

function https(value: unknown): string | undefined {
  const url = text(value)
  return url?.startsWith('https://') ? url : undefined
}

function entriesOf(document: unknown): readonly unknown[] {
  if (!isRecord(document) || document.formatVersion !== FORMAT_VERSION || !Array.isArray(document.entries)) {
    throw new Error(`not a registry index this site reads (formatVersion ${FORMAT_VERSION} with entries)`)
  }
  return document.entries
}

export function parseBlendEntry(value: unknown): BlendEntry | null {
  if (!isRecord(value)) return null
  const id = text(value.id)
  const name = text(value.name)
  const kind = text(value.kind)
  const version = text(value.version)
  const path = text(value.path)
  const license = text(value.license)
  const category = text(value.category)
  const description = text(value.description)
  if (!id || !name || !kind || !version || !path || !/^blends\/[^/]+$/u.test(path) || !license || !category || !description) return null
  const parent = text(value.parent)
  return { id, name, kind, version, path, license, category, description, ...(parent ? { parent } : {}) }
}

const COMPATIBILITY: readonly PluginCompatibility[] = ['Both', 'ACRYL', 'DSH stock']

export function parsePluginEntry(value: unknown): PluginEntry | null {
  if (!isRecord(value)) return null
  const id = text(value.id)
  const name = text(value.name)
  const description = typeof value.description === 'string' ? value.description : undefined
  const category = text(value.category)
  const compatibility = COMPATIBILITY.find(item => item === value.compatibility)
  const publisher = text(value.publisher)
  const repo = https(value.repo)
  const page = https(value.page)
  const provides = texts(value.provides)
  const consumes = texts(value.consumes)
  if (!id || !name || description === undefined || !category || !compatibility || !publisher || !repo || !page || typeof value.acrylPackage !== 'boolean' || !provides || !consumes) return null
  const version = text(value.version)
  const release: PluginRelease | undefined = version ? {
    version,
    ...(text(value.releaseTag) ? { releaseTag: text(value.releaseTag) } : {}),
    ...(text(value.published) ? { published: text(value.published) } : {}),
    ...(https(value.tarball) ? { tarball: https(value.tarball) } : {}),
    ...(text(value.integrity) ? { integrity: text(value.integrity) } : {}),
    ...(text(value.install) ? { install: text(value.install) } : {}),
    ...(text(value.acrylPull) ? { acrylPull: text(value.acrylPull) } : {}),
  } : undefined
  return { id, name, description, category, compatibility, publisher, repo, page, acrylPackage: value.acrylPackage, provides, consumes, ...(release ? { release } : {}) }
}

export function parseBlendIndex(document: unknown): readonly BlendEntry[] {
  return entriesOf(document).map(parseBlendEntry).filter((entry): entry is BlendEntry => entry !== null)
}

export function parsePluginIndex(document: unknown): readonly PluginEntry[] {
  return entriesOf(document).map(parsePluginEntry).filter((entry): entry is PluginEntry => entry !== null)
}

async function fetchIndex(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  return response.json()
}

export async function fetchBlendIndex(signal: AbortSignal): Promise<readonly BlendEntry[]> {
  return parseBlendIndex(await fetchIndex(BLEND_REGISTRY_INDEX, signal))
}

export async function fetchPluginIndex(signal: AbortSignal): Promise<readonly PluginEntry[]> {
  return parsePluginIndex(await fetchIndex(PLUGIN_REGISTRY_INDEX, signal))
}

/** The URL of an entry's `blend.yaml` in the registry. */
export function blendManifestUrl(entry: BlendEntry): string {
  return `${BLEND_REGISTRY_BASE}${entry.path}/blend.yaml`
}

/** The Blend's own page on the registry's site. */
export function blendPageUrl(entry: BlendEntry): string {
  return `${BLEND_REGISTRY_SITE}/b/${encodeURIComponent(entry.id)}`
}

/** The command that creates a new app from a registry Blend. */
export function newAppCommand(entry: BlendEntry): string {
  return `acryl new my-app --from ${entry.id}`
}

/** Text search over the fields a reader recognizes an entry by, plus one exact-match facet (category or compatibility); `all` means no facet. */
export function matches(fields: readonly (string | undefined)[], query: string, facetValue: string, facet: string): boolean {
  if (facet !== 'all' && facetValue !== facet) return false
  const needle = query.trim().toLocaleLowerCase()
  return needle === '' || fields.some(field => field?.toLocaleLowerCase().includes(needle))
}

/** Distinct values with counts, most common first, then by name. */
export function facetCounts(values: readonly string[]): readonly { readonly value: string; readonly count: number }[] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}
