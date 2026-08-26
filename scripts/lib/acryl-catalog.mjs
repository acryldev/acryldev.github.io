const EXACT_KEYWORD = 'acryl-package'
const RESOURCE_KINDS = ['plugins', 'extensions', 'adapters', 'skills', 'workflows', 'blueprints', 'stemcells']
const SAFE_PATH = /^(?!\/)(?![A-Za-z]:\\)(?!.*(?:^|\/)\.\.(?:\/|$))(?!https?:\/\/).+/

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringArray(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string' && item.length > 0)
}

export function inspectAcrylManifest(value) {
  if (value === undefined) return { status: 'missing', kinds: [] }
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.artifacts)) {
    return { status: 'invalid', kinds: [] }
  }

  const keys = Object.keys(value.artifacts)
  if (keys.length === 0 || keys.some(key => !RESOURCE_KINDS.includes(key))) return { status: 'invalid', kinds: [] }
  for (const key of keys) {
    const paths = value.artifacts[key]
    if (!stringArray(paths) || paths.some(path => !SAFE_PATH.test(path))) return { status: 'invalid', kinds: [] }
  }
  if (value.capabilities !== undefined && !stringArray(value.capabilities)) return { status: 'invalid', kinds: [] }
  return { status: 'valid', kinds: keys }
}

export function exactDiscoveryKeyword(manifest) {
  return Array.isArray(manifest?.keywords) && manifest.keywords.includes(EXACT_KEYWORD)
}

function repositoryUrl(value, packageName) {
  const candidate = typeof value === 'string' ? value : isRecord(value) && typeof value.url === 'string' ? value.url : ''
  const normalized = candidate
    .replace(/^git\+/, '')
    .replace(/^git:\/\/github\.com\//, 'https://github.com/')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '')
  return /^https:\/\/github\.com\/[^/]+\/[^/]+/.test(normalized)
    ? normalized
    : `https://www.npmjs.com/package/${encodeURIComponent(packageName)}`
}

export function catalogPluginFromManifest(manifest, searchPackage = {}) {
  if (!isRecord(manifest) || typeof manifest.name !== 'string' || typeof manifest.version !== 'string') return null
  if (!exactDiscoveryKeyword(manifest)) return null

  const inspection = inspectAcrylManifest(manifest.acryl)
  const dshBundle = isRecord(manifest.dsh) && isRecord(manifest.dsh.bundle)
  const publisher = typeof searchPackage.publisher?.username === 'string'
    ? searchPackage.publisher.username
    : typeof manifest._npmUser?.name === 'string' ? manifest._npmUser.name : null

  return {
    id: manifest.name,
    name: manifest.name,
    repository: repositoryUrl(manifest.repository, manifest.name),
    category: inspection.kinds[0] ?? 'acryl',
    description: { en: typeof manifest.description === 'string' ? manifest.description : '' },
    added: typeof searchPackage.date === 'string' ? searchPackage.date.slice(0, 10) : null,
    source: 'acryl',
    install: dshBundle ? `dsh plugin --profile desktop add ${manifest.name}` : null,
    publisher,
    version: manifest.version,
    manifestStatus: inspection.status,
    kinds: inspection.kinds,
  }
}

export const discoveryKeyword = EXACT_KEYWORD
