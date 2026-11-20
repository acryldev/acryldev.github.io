// WorkshopPanel data layer: the shared acryl.dev PocketBase (the same instance that stores the bootcamp registrations),
// its public projections, participant identity and validation. The site has no server, so every call here is a browser
// request under a PocketBase collection rule; the base tables have no public read rule and the panel only ever renders
// the two public views.

import { EVENTS_API } from '../data/events'
import { BLEND_REGISTRY_BASE, fetchBlendIndex, type BlendEntry } from './registries'

export const WORKSHOP_SLUG = 'workshop-2026-11-20'

export const TABS = ['overview', 'ideas', 'blueprints', 'board', 'plugins', 'gallery', 'frankenstein', 'mine'] as const
export type WorkshopTab = (typeof TABS)[number]

export const TAB_LABELS: Record<WorkshopTab, string> = {
  overview: 'Overview',
  ideas: 'Idea pool',
  blueprints: 'Blueprints',
  board: 'Participants',
  plugins: 'Plugin pool',
  gallery: 'App gallery',
  frankenstein: 'Frankenstein',
  mine: 'My project',
}

export interface ScheduleBlock { readonly time: string; readonly block: string; readonly checkpoint: string }

export interface FrankensteinRecord {
  readonly name: string
  readonly description: string
  readonly repositoryUrl: string
  readonly demoUrl: string
  readonly version: string
  readonly lastTestedAt: string
  readonly notes: string
}

export type Phase = 'draft' | 'registration' | 'selection' | 'building' | 'publishing' | 'showcase' | 'archived'
export const PHASES: readonly Phase[] = ['draft', 'registration', 'selection', 'building', 'publishing', 'showcase', 'archived']

export const PROJECT_LIFECYCLE = ['registered', 'idea_selected', 'app_running', 'plugin_building', 'plugin_tested', 'git_saved', 'published', 'demo_ready', 'presented'] as const
export type ProjectStatus = (typeof PROJECT_LIFECYCLE)[number]
export const PROJECT_LABELS: Record<ProjectStatus, string> = {
  registered: 'Registered',
  idea_selected: 'Idea selected',
  app_running: 'App running',
  plugin_building: 'Plugin building',
  plugin_tested: 'Plugin tested',
  git_saved: 'Saved to Git',
  published: 'Published',
  demo_ready: 'Demo ready',
  presented: 'Presented',
}

export const PLUGIN_LIFECYCLE = ['planned', 'building', 'installed', 'tested', 'committed', 'released', 'catalogued'] as const
export type PluginStatus = (typeof PLUGIN_LIFECYCLE)[number]
export const PLUGIN_LABELS: Record<PluginStatus, string> = {
  planned: 'Planned',
  building: 'Building',
  installed: 'Installed',
  tested: 'Tested',
  committed: 'Committed',
  released: 'Released',
  catalogued: 'Catalogued',
}

export const PUBLICATION = ['local', 'committed', 'pushed', 'released', 'indexing_pending', 'catalogued'] as const
export type PublicationStatus = (typeof PUBLICATION)[number]
export const PUBLICATION_LABELS: Record<PublicationStatus, string> = {
  local: 'Local',
  committed: 'Committed',
  pushed: 'Pushed',
  released: 'Release created',
  indexing_pending: 'Published - indexing pending',
  catalogued: 'Catalogued',
}

export const FRANKENSTEIN_STATUS = ['not_opted_in', 'pending_review', 'eligible', 'blocked', 'included', 'tested'] as const
export type FrankensteinStatus = (typeof FRANKENSTEIN_STATUS)[number]
export const FRANKENSTEIN_LABELS: Record<FrankensteinStatus, string> = {
  not_opted_in: 'Not opted in',
  pending_review: 'Pending review',
  eligible: 'Eligible',
  blocked: 'Blocked',
  included: 'Included',
  tested: 'Tested',
}

export type SourceMode = 'idea_pool' | 'custom_idea' | 'catalogue_blueprint'
export const SOURCE_LABELS: Record<SourceMode, string> = {
  idea_pool: 'Idea pool',
  custom_idea: 'Own idea',
  catalogue_blueprint: 'Catalogue Blueprint',
}

export interface WorkshopEvent {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly description: string
  readonly startsAt: string
  readonly endsAt: string
  readonly timezone: string
  readonly registrationOpen: boolean
  readonly registrationClosesAt: string
  readonly revealAt: string
  readonly revealed: boolean
  readonly phase: Phase
  readonly schedule: readonly ScheduleBlock[]
  readonly frankenstein: FrankensteinRecord
}

export interface Idea {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly category: string
  readonly pitch: string
  readonly suggestedFeatures: readonly string[]
  readonly recommendedBlueprintId: string
  readonly recommendedRuntime: string
  readonly recommendedProfile: string
  readonly status: 'seeded' | 'pending' | 'approved' | 'rejected' | 'archived'
  readonly submittedBy: string
  readonly sortOrder: number
}

export interface BoardEntry {
  readonly id: string
  readonly participantName: string
  readonly githubLogin: string
  readonly os: string
  readonly projectId: string
  readonly appName: string
  readonly sourceMode: SourceMode | ''
  readonly blueprintId: string
  readonly blueprintRuntime: string
  readonly blueprintOrigin: string
  readonly description: string
  readonly targetUser: string
  readonly profile: 'core' | 'full'
  readonly status: ProjectStatus
  readonly repositoryUrl: string
  readonly demoUrl: string
  readonly blendsRegistryUrl: string
  readonly publicationStatus: PublicationStatus
  readonly featured: boolean
  readonly updated: string
}

export interface PublicPlugin {
  readonly id: string
  readonly pluginName: string
  readonly featureTitle: string
  readonly description: string
  readonly version: string
  readonly routePrefix: string
  readonly requires: readonly string[]
  readonly provides: readonly string[]
  readonly lifecycle: PluginStatus
  readonly publicationStatus: PublicationStatus
  readonly repositoryUrl: string
  readonly releaseUrl: string
  readonly registryUrl: string
  readonly frankensteinStatus: FrankensteinStatus
  readonly frankensteinBlockReason: string
  readonly participantName: string
  readonly appName: string
  readonly projectId: string
  readonly updated: string
}

export interface WorkshopStats { readonly participants: number; readonly publicParticipants: number }

export interface Participant {
  readonly id: string
  readonly name: string
  readonly githubLogin: string
  readonly os: string
  readonly consentPublic: boolean
}

export interface MyProject {
  readonly id: string
  readonly participant: string
  readonly idea: string
  readonly sourceMode: SourceMode
  readonly appName: string
  readonly description: string
  readonly targetUser: string
  readonly blueprintId: string
  readonly blueprintVersion: string
  readonly blueprintRuntime: string
  readonly blueprintOrigin: string
  readonly profile: 'core' | 'full'
  readonly status: ProjectStatus
  readonly repositoryUrl: string
  readonly demoUrl: string
  readonly blendsRegistryUrl: string
  readonly publicationStatus: PublicationStatus
  readonly featured: boolean
  readonly updated: string
}

export interface MyPlugin {
  readonly id: string
  readonly participant: string
  readonly project: string
  readonly pluginName: string
  readonly featureTitle: string
  readonly description: string
  readonly version: string
  readonly routePrefix: string
  readonly requires: readonly string[]
  readonly provides: readonly string[]
  readonly lifecycle: PluginStatus
  readonly publicationStatus: PublicationStatus
  readonly repositoryUrl: string
  readonly releaseUrl: string
  readonly registryUrl: string
  readonly frankensteinOptIn: boolean
  readonly frankensteinStatus: FrankensteinStatus
  readonly frankensteinBlockReason: string
}

export interface ParticipantInput {
  readonly name: string
  readonly githubLogin: string
  readonly os: string
  readonly consentPublic: boolean
}

export interface ProjectInput {
  readonly sourceMode: SourceMode
  readonly idea: string
  readonly appName: string
  readonly description: string
  readonly targetUser: string
  readonly blueprintId: string
  readonly blueprintVersion: string
  readonly blueprintRuntime: string
  readonly blueprintOrigin: string
  readonly profile: 'core' | 'full'
  readonly status: ProjectStatus
  readonly repositoryUrl: string
  readonly demoUrl: string
  readonly blendsRegistryUrl: string
  readonly publicationStatus: PublicationStatus
}

export interface PluginInput {
  readonly pluginName: string
  readonly featureTitle: string
  readonly description: string
  readonly version: string
  readonly routePrefix: string
  readonly requires: readonly string[]
  readonly provides: readonly string[]
  readonly lifecycle: PluginStatus
  readonly publicationStatus: PublicationStatus
  readonly repositoryUrl: string
  readonly releaseUrl: string
  readonly registryUrl: string
  readonly frankensteinOptIn: boolean
}

export interface Credentials { readonly identity: string; readonly password: string }

const CREDENTIALS_KEY = 'acryl.workshop.participant'
const ADMIN_KEY = 'acryl.workshop.admin'

type PbList<T> = { readonly items: readonly T[]; readonly totalItems: number }

export class WorkshopError extends Error {
  constructor(message: string, readonly status?: number) { super(message) }
}

function errorMessage(response: Response, payload: unknown): string {
  if (typeof payload === 'object' && payload !== null) {
    const data = (payload as { data?: Record<string, { message?: string }> }).data
    if (data !== undefined) {
      const first = Object.values(data).find(entry => typeof entry?.message === 'string')
      if (first?.message !== undefined) return first.message
    }
    const message = (payload as { message?: unknown }).message
    if (typeof message === 'string' && message !== '') return message
  }
  return response.status === 429 ? 'Too many tries in a short time. Wait a minute and try again.' : `The workshop database answered ${String(response.status)}.`
}

async function pb<T>(path: string, init: { readonly method?: string; readonly body?: unknown; readonly token?: string; readonly signal?: AbortSignal } = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${EVENTS_API}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
        ...(init.token === undefined ? {} : { authorization: init.token }),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: init.signal ?? AbortSignal.timeout(20_000),
    })
  } catch (cause) {
    if (init.signal?.aborted === true) throw cause
    throw new WorkshopError('The workshop database did not answer. Try again in a moment.')
  }
  const text = await response.text()
  let payload: unknown
  try { payload = text === '' ? undefined : JSON.parse(text) } catch { payload = undefined }
  if (!response.ok) throw new WorkshopError(errorMessage(response, payload), response.status)
  return payload as T
}

const filter = (expression: string): string => `filter=${encodeURIComponent(expression)}`

function text(value: unknown): string { return typeof value === 'string' ? value : '' }
function bool(value: unknown): boolean { return value === true }
function strings(value: unknown): readonly string[] {
  if (typeof value === 'string' && value.trim() !== '') return [value]
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function ideaOf(record: Record<string, unknown>): Idea {
  return {
    id: text(record.id),
    slug: text(record.slug),
    title: text(record.title),
    category: text(record.category),
    pitch: text(record.pitch),
    suggestedFeatures: strings(record.suggestedFeatures),
    recommendedBlueprintId: text(record.recommendedBlueprintId),
    recommendedRuntime: text(record.recommendedRuntime),
    recommendedProfile: text(record.recommendedProfile),
    status: (text(record.status) || 'seeded') as Idea['status'],
    submittedBy: text(record.submittedBy),
    sortOrder: typeof record.sortOrder === 'number' ? record.sortOrder : 0,
  }
}

function eventOf(record: Record<string, unknown>): WorkshopEvent {
  const schedule = Array.isArray(record.schedule)
    ? record.schedule.filter((block): block is ScheduleBlock => typeof block === 'object' && block !== null && typeof (block as ScheduleBlock).time === 'string')
    : []
  const frankenstein = typeof record.frankenstein === 'object' && record.frankenstein !== null ? record.frankenstein as Partial<FrankensteinRecord> : {}
  return {
    id: text(record.id),
    slug: text(record.slug),
    title: text(record.title),
    description: text(record.description),
    startsAt: text(record.startsAt),
    endsAt: text(record.endsAt),
    timezone: text(record.timezone) || 'Europe/Vienna',
    registrationOpen: bool(record.registrationOpen),
    registrationClosesAt: text(record.registrationClosesAt),
    revealAt: text(record.revealAt),
    revealed: bool(record.revealed),
    phase: (text(record.phase) || 'draft') as Phase,
    schedule,
    frankenstein: {
      name: text(frankenstein.name) || 'Frankenstein App',
      description: text(frankenstein.description),
      repositoryUrl: text(frankenstein.repositoryUrl),
      demoUrl: text(frankenstein.demoUrl),
      version: text(frankenstein.version),
      lastTestedAt: text(frankenstein.lastTestedAt),
      notes: text(frankenstein.notes),
    },
  }
}

function boardOf(record: Record<string, unknown>): BoardEntry {
  return {
    id: text(record.id),
    participantName: text(record.participantName),
    githubLogin: text(record.githubLogin),
    os: text(record.os),
    projectId: text(record.projectId),
    appName: text(record.appName),
    sourceMode: text(record.sourceMode) as SourceMode | '',
    blueprintId: text(record.blueprintId),
    blueprintRuntime: text(record.blueprintRuntime),
    blueprintOrigin: text(record.blueprintOrigin),
    description: text(record.description),
    targetUser: text(record.targetUser),
    profile: text(record.profile) === 'full' ? 'full' : 'core',
    status: (text(record.status) || 'registered') as ProjectStatus,
    repositoryUrl: text(record.repositoryUrl),
    demoUrl: text(record.demoUrl),
    blendsRegistryUrl: text(record.blendsRegistryUrl),
    publicationStatus: (text(record.publicationStatus) || 'local') as PublicationStatus,
    featured: bool(record.featured),
    updated: text(record.updated),
  }
}

function publicPluginOf(record: Record<string, unknown>): PublicPlugin {
  return {
    id: text(record.id),
    pluginName: text(record.pluginName),
    featureTitle: text(record.featureTitle),
    description: text(record.description),
    version: text(record.version),
    routePrefix: text(record.routePrefix),
    requires: strings(record.requires),
    provides: strings(record.provides),
    lifecycle: (text(record.lifecycle) || 'planned') as PluginStatus,
    publicationStatus: (text(record.publicationStatus) || 'local') as PublicationStatus,
    repositoryUrl: text(record.repositoryUrl),
    releaseUrl: text(record.releaseUrl),
    registryUrl: text(record.registryUrl),
    frankensteinStatus: (text(record.frankensteinStatus) || 'not_opted_in') as FrankensteinStatus,
    frankensteinBlockReason: text(record.frankensteinBlockReason),
    participantName: text(record.participantName),
    appName: text(record.appName),
    projectId: text(record.projectId),
    updated: text(record.updated),
  }
}

export interface PublicWorkshop {
  readonly event: WorkshopEvent
  readonly ideas: readonly Idea[]
  readonly stats: WorkshopStats
  readonly board: readonly BoardEntry[]
  readonly plugins: readonly PublicPlugin[]
}

export async function loadPublicWorkshop(signal?: AbortSignal): Promise<PublicWorkshop> {
  const [events, ideas, stats, board, plugins] = await Promise.all([
    pb<PbList<Record<string, unknown>>>(`/api/collections/workshop_events/records?perPage=1&${filter(`slug = "${WORKSHOP_SLUG}"`)}`, { signal }),
    pb<PbList<Record<string, unknown>>>(`/api/collections/workshop_ideas/records?perPage=200&sort=sortOrder`, { signal }),
    pb<PbList<Record<string, unknown>>>(`/api/collections/workshop_stats/records?perPage=1`, { signal }),
    pb<PbList<Record<string, unknown>>>(`/api/collections/workshop_board/records?perPage=200&sort=-featured,participantName`, { signal }),
    pb<PbList<Record<string, unknown>>>(`/api/collections/workshop_plugins_public/records?perPage=200&sort=participantName`, { signal }),
  ])
  if (events.items[0] === undefined) throw new WorkshopError('The workshop is not set up yet.')
  const count = stats.items[0]
  return {
    event: eventOf(events.items[0]),
    ideas: ideas.items.map(ideaOf),
    stats: {
      participants: typeof count?.participants === 'number' ? count.participants : 0,
      publicParticipants: typeof count?.publicParticipants === 'number' ? count.publicParticipants : 0,
    },
    board: board.items.map(boardOf),
    plugins: plugins.items.map(publicPluginOf),
  }
}

// Participant identity: PocketBase stores only the password hash and its JWT authorizes owner-rule writes. The generated
// identity email is never displayed; the recovery code lets the same person continue in another browser.

function base64url(value: string): string {
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fromBase64url(value: string): string {
  return atob(value.replaceAll('-', '+').replaceAll('_', '/'))
}

function randomToken(bytes: number): string {
  const data = crypto.getRandomValues(new Uint8Array(bytes))
  return base64url(String.fromCharCode(...data))
}

export function newPublicId(prefix: string): string {
  return `${prefix}_${randomToken(8)}`
}

export function newCredentials(): Credentials {
  return { identity: `w-${randomToken(9)}@workshop.acryl.dev`, password: randomToken(24) }
}

export function encodeRecovery(credentials: Credentials): string {
  return base64url(JSON.stringify(credentials))
}

export function decodeRecovery(code: string): Credentials | undefined {
  try {
    const parsed: unknown = JSON.parse(fromBase64url(code))
    if (typeof parsed !== 'object' || parsed === null) return undefined
    const identity = (parsed as Partial<Credentials>).identity
    const password = (parsed as Partial<Credentials>).password
    return typeof identity === 'string' && typeof password === 'string' && identity.includes('@') && password.length >= 20 ? { identity, password } : undefined
  } catch {
    return undefined
  }
}

export function storedCredentials(): Credentials | undefined {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY)
    return raw === null ? undefined : decodeRecovery(raw)
  } catch {
    return undefined
  }
}

export function storeCredentials(credentials: Credentials): void {
  try { localStorage.setItem(CREDENTIALS_KEY, encodeRecovery(credentials)) } catch { /* storage can be full or blocked; the session still works for this tab */ }
}

export function forgetCredentials(): void {
  try { localStorage.removeItem(CREDENTIALS_KEY) } catch { /* nothing to clear */ }
}

export interface Session { readonly token: string; readonly participant: Participant }

function participantOf(record: Record<string, unknown>): Participant {
  return { id: text(record.id), name: text(record.name), githubLogin: text(record.githubLogin), os: text(record.os), consentPublic: bool(record.consentPublic) }
}

async function authParticipant(credentials: Credentials): Promise<Session> {
  const response = await pb<{ token?: unknown; record?: Record<string, unknown> }>('/api/collections/workshop_participants/auth-with-password', {
    method: 'POST',
    body: { identity: credentials.identity, password: credentials.password },
  })
  if (typeof response.token !== 'string' || response.record === undefined) throw new WorkshopError('The participant session could not be opened.')
  return { token: response.token, participant: participantOf(response.record) }
}

export async function registerParticipant(input: ParticipantInput): Promise<{ session: Session; credentials: Credentials }> {
  const credentials = newCredentials()
  const record = await pb<Record<string, unknown>>('/api/collections/workshop_participants/records', {
    method: 'POST',
    body: {
      email: credentials.identity,
      password: credentials.password,
      passwordConfirm: credentials.password,
      emailVisibility: false,
      publicId: newPublicId('p'),
      name: input.name,
      githubLogin: input.githubLogin,
      os: input.os,
      consentPublic: input.consentPublic,
    },
  })
  const session = await authParticipant(credentials)
  if (record.id !== session.participant.id) throw new WorkshopError('The registration could not be confirmed.')
  storeCredentials(credentials)
  return { session, credentials }
}

export async function restoreSession(credentials: Credentials): Promise<Session> {
  return authParticipant(credentials)
}

export async function updateParticipant(session: Session, patch: Partial<ParticipantInput>): Promise<Participant> {
  const record = await pb<Record<string, unknown>>(`/api/collections/workshop_participants/records/${session.participant.id}`, {
    method: 'PATCH',
    token: session.token,
    body: patch,
  })
  return participantOf(record)
}

export async function loadMine(session: Session): Promise<{ project?: MyProject; plugins: readonly MyPlugin[] }> {
  const [projects, plugins] = await Promise.all([
    pb<PbList<Record<string, unknown>>>(`/api/collections/workshop_projects/records?perPage=1&${filter(`participant = "${session.participant.id}"`)}`, { token: session.token }),
    pb<PbList<Record<string, unknown>>>(`/api/collections/workshop_plugins/records?perPage=100&sort=pluginName&${filter(`participant = "${session.participant.id}"`)}`, { token: session.token }),
  ])
  const project = projects.items[0]
  return {
    project: project === undefined ? undefined : ({
      id: text(project.id),
      participant: text(project.participant),
      idea: text(project.idea),
      sourceMode: (text(project.sourceMode) || 'idea_pool') as SourceMode,
      appName: text(project.appName),
      description: text(project.description),
      targetUser: text(project.targetUser),
      blueprintId: text(project.blueprintId),
      blueprintVersion: text(project.blueprintVersion),
      blueprintRuntime: text(project.blueprintRuntime),
      blueprintOrigin: text(project.blueprintOrigin),
      profile: text(project.profile) === 'full' ? 'full' : 'core',
      status: (text(project.status) || 'registered') as ProjectStatus,
      repositoryUrl: text(project.repositoryUrl),
      demoUrl: text(project.demoUrl),
      blendsRegistryUrl: text(project.blendsRegistryUrl),
      publicationStatus: (text(project.publicationStatus) || 'local') as PublicationStatus,
      featured: bool(project.featured),
      updated: text(project.updated),
    }),
    plugins: plugins.items.map(record => ({
      id: text(record.id),
      participant: text(record.participant),
      project: text(record.project),
      pluginName: text(record.pluginName),
      featureTitle: text(record.featureTitle),
      description: text(record.description),
      version: text(record.version),
      routePrefix: text(record.routePrefix),
      requires: strings(record.requires),
      provides: strings(record.provides),
      lifecycle: (text(record.lifecycle) || 'planned') as PluginStatus,
      publicationStatus: (text(record.publicationStatus) || 'local') as PublicationStatus,
      repositoryUrl: text(record.repositoryUrl),
      releaseUrl: text(record.releaseUrl),
      registryUrl: text(record.registryUrl),
      frankensteinOptIn: bool(record.frankensteinOptIn),
      frankensteinStatus: (text(record.frankensteinStatus) || 'not_opted_in') as FrankensteinStatus,
      frankensteinBlockReason: text(record.frankensteinBlockReason),
    })),
  }
}

export async function saveProject(session: Session, current: MyProject | undefined, input: ProjectInput): Promise<void> {
  if (current === undefined) {
    await pb('/api/collections/workshop_projects/records', {
      method: 'POST',
      token: session.token,
      body: { participant: session.participant.id, workshop: WORKSHOP_SLUG, publicId: newPublicId('pr'), ...input },
    })
    return
  }
  await pb(`/api/collections/workshop_projects/records/${current.id}`, { method: 'PATCH', token: session.token, body: input })
}

export async function savePlugin(session: Session, projectId: string, current: MyPlugin | undefined, input: PluginInput): Promise<void> {
  // A participant may only opt in (pending review) or out; every other status is the facilitator's, so an unchanged choice sends none.
  const frankenstein: FrankensteinStatus | undefined = !input.frankensteinOptIn
    ? 'not_opted_in'
    : current === undefined || current.frankensteinStatus === 'not_opted_in' ? 'pending_review' : undefined
  const body = {
    participant: session.participant.id,
    project: projectId,
    workshop: WORKSHOP_SLUG,
    ...(current === undefined ? { publicId: newPublicId('pl') } : {}),
    ...input,
    ...(frankenstein === undefined ? {} : { frankensteinStatus: frankenstein }),
  }
  if (current === undefined) {
    await pb('/api/collections/workshop_plugins/records', { method: 'POST', token: session.token, body })
    return
  }
  await pb(`/api/collections/workshop_plugins/records/${current.id}`, {
    method: 'PATCH',
    token: session.token,
    body: { ...input, ...(frankenstein === undefined ? {} : { frankensteinStatus: frankenstein }) },
  })
}

export async function deletePlugin(session: Session, id: string): Promise<void> {
  await pb(`/api/collections/workshop_plugins/records/${id}`, { method: 'DELETE', token: session.token })
}

export async function submitIdea(session: Session, title: string, pitch: string, category: string, features: readonly string[]): Promise<void> {
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 60) || 'idea'}-${randomToken(3).toLowerCase()}`
  await pb('/api/collections/workshop_ideas/records', {
    method: 'POST',
    token: session.token,
    body: {
      workshop: WORKSHOP_SLUG,
      slug,
      title,
      category,
      pitch,
      suggestedFeatures: features,
      status: 'pending',
      submittedBy: session.participant.id,
    },
  })
}

// Facilitator: the existing PocketBase superuser is the admin identity. The browser never holds a service key; the
// superuser types their own credentials and PocketBase enforces every write.

export async function adminLogin(email: string, password: string): Promise<string> {
  const response = await pb<{ token?: unknown }>('/api/collections/_superusers/auth-with-password', { method: 'POST', body: { identity: email, password } })
  if (typeof response.token !== 'string') throw new WorkshopError('The facilitator sign-in failed.')
  try { sessionStorage.setItem(ADMIN_KEY, response.token) } catch { /* private mode still works for this render */ }
  return response.token
}

export function storedAdminToken(): string | undefined {
  try { return sessionStorage.getItem(ADMIN_KEY) ?? undefined } catch { return undefined }
}

export function forgetAdminToken(): void {
  try { sessionStorage.removeItem(ADMIN_KEY) } catch { /* nothing to clear */ }
}

export async function adminPatchEvent(token: string, id: string, patch: Partial<Pick<WorkshopEvent, 'phase' | 'registrationOpen' | 'revealed' | 'revealAt'> & { readonly frankenstein?: FrankensteinRecord }>): Promise<void> {
  await pb(`/api/collections/workshop_events/records/${id}`, { method: 'PATCH', token, body: patch })
}

export interface AdminProject { readonly id: string; readonly publicId: string; readonly appName: string; readonly featured: boolean }
export interface AdminPlugin {
  readonly id: string
  readonly publicId: string
  readonly pluginName: string
  readonly featureTitle: string
  readonly frankensteinStatus: FrankensteinStatus
  readonly frankensteinBlockReason: string
}

export async function adminListProjects(token: string): Promise<readonly AdminProject[]> {
  const listed = await pb<PbList<Record<string, unknown>>>('/api/collections/workshop_projects/records?perPage=500&sort=appName', { token })
  return listed.items.map(record => ({ id: text(record.id), publicId: text(record.publicId), appName: text(record.appName), featured: bool(record.featured) }))
}

export async function adminListPlugins(token: string): Promise<readonly AdminPlugin[]> {
  const listed = await pb<PbList<Record<string, unknown>>>('/api/collections/workshop_plugins/records?perPage=500&sort=pluginName', { token })
  return listed.items.map(record => ({
    id: text(record.id),
    publicId: text(record.publicId),
    pluginName: text(record.pluginName),
    featureTitle: text(record.featureTitle),
    frankensteinStatus: (text(record.frankensteinStatus) || 'not_opted_in') as FrankensteinStatus,
    frankensteinBlockReason: text(record.frankensteinBlockReason),
  }))
}

export async function adminSetIdeaStatus(token: string, id: string, status: Idea['status']): Promise<void> {
  await pb(`/api/collections/workshop_ideas/records/${id}`, { method: 'PATCH', token, body: { status } })
}

export async function adminSetProjectFeatured(token: string, id: string, featured: boolean): Promise<void> {
  await pb(`/api/collections/workshop_projects/records/${id}`, { method: 'PATCH', token, body: { featured } })
}

export async function adminSetPluginFrankenstein(token: string, id: string, status: FrankensteinStatus, reason: string): Promise<void> {
  await pb(`/api/collections/workshop_plugins/records/${id}`, { method: 'PATCH', token, body: { frankensteinStatus: status, frankensteinBlockReason: status === 'blocked' ? reason : '' } })
}

export async function adminListPendingIdeas(token: string): Promise<readonly Idea[]> {
  const listed = await pb<PbList<Record<string, unknown>>>(`/api/collections/workshop_ideas/records?perPage=100&sort=-created&${filter('status = "pending"')}`, { token })
  return listed.items.map(ideaOf)
}

export async function adminExport(token: string): Promise<string> {
  const [projects, plugins, ideas] = await Promise.all([
    pb<PbList<Record<string, unknown>>>('/api/collections/workshop_projects/records?perPage=500', { token }),
    pb<PbList<Record<string, unknown>>>('/api/collections/workshop_plugins/records?perPage=500', { token }),
    pb<PbList<Record<string, unknown>>>('/api/collections/workshop_ideas/records?perPage=500', { token }),
  ])
  return JSON.stringify({ exportedAt: new Date().toISOString(), projects: projects.items, plugins: plugins.items, ideas: ideas.items }, null, 2)
}

// Blueprint catalogue: the existing Blends registry index plus its discovered community entries. The origin is only
// taken from the registry's own `origin` field; an index entry without one is labelled Registry, never Official.

export interface CatalogueEntry extends BlendEntry { readonly origin: 'community' | undefined }

export async function loadCatalogue(signal: AbortSignal): Promise<readonly CatalogueEntry[]> {
  const official = await fetchBlendIndex(signal)
  const entries: CatalogueEntry[] = official.map(entry => ({ ...entry, origin: undefined }))
  try {
    const response = await fetch(`${BLENDS_DISCOVERED}`, { signal })
    if (response.ok) {
      const document: unknown = await response.json()
      const list = typeof document === 'object' && document !== null ? (document as { entries?: unknown }).entries : undefined
      const seen = new Set(entries.map(entry => entry.id))
      if (Array.isArray(list)) {
        for (const item of list) {
          const parsed = parseDiscovered(item)
          if (parsed !== undefined && !seen.has(parsed.id)) {
            entries.push(parsed)
            seen.add(parsed.id)
          }
        }
      }
    }
  } catch (cause) {
    if (signal.aborted) throw cause
  }
  return entries
}

const BLENDS_DISCOVERED = `${BLEND_REGISTRY_BASE}discovered.json`

function parseDiscovered(value: unknown): CatalogueEntry | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const record = value as Record<string, unknown>
  const fields = ['id', 'name', 'kind', 'version', 'path', 'license', 'category', 'description'] as const
  if (!fields.every(field => typeof record[field] === 'string' && record[field] !== '')) return undefined
  if (record.origin !== 'community') return undefined
  const runtime = record.runtime === 'acryl' || record.runtime === 'acrylblends' ? record.runtime : 'other'
  return {
    id: record.id as string,
    name: record.name as string,
    kind: record.kind as string,
    version: record.version as string,
    path: record.path as string,
    license: record.license as string,
    category: record.category as string,
    description: record.description as string,
    ...(typeof record.parent === 'string' && record.parent !== '' ? { parent: record.parent } : {}),
    runtime,
    origin: 'community',
  }
}

// Validation: the browser checks first, PocketBase field limits check again.

const CONTROL = /[\u0000-\u001f\u007f]/u

export function cleanLine(value: string): string { return value.replace(/\s+/gu, ' ').trim() }

export function cleanMultiline(value: string): string { return value.replace(/\r\n/gu, '\n').replace(/[ \t]+/gu, ' ').trim() }

export function validateDisplayName(value: string): string | undefined {
  const name = cleanLine(value)
  if (CONTROL.test(value)) return 'The display name contains characters that are not allowed.'
  if (name.length < 2 || name.length > 50) return 'The display name needs 2 to 50 characters.'
  return undefined
}

export function validateParticipant(input: ParticipantInput): string | undefined {
  const name = validateDisplayName(input.name)
  if (name !== undefined) return name
  if (input.githubLogin !== '' && !/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/u.test(input.githubLogin)) return 'The GitHub login does not look right.'
  if (!input.consentPublic) return 'Please allow your display name and project on the public board, or register without the panel.'
  return undefined
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.includes('.') && !CONTROL.test(value)
  } catch {
    return false
  }
}

const ARTIFACT_HOSTS = ['github.com', 'github.io', 'npmjs.com', 'npmjs.org']

export function isArtifactUrl(value: string): boolean {
  if (!isHttpsUrl(value)) return false
  const host = new URL(value).hostname
  return ARTIFACT_HOSTS.some(allowed => host === allowed || host.endsWith(`.${allowed}`))
}

function checkUrl(label: string, value: string, artifact: boolean): string | undefined {
  if (value === '') return undefined
  if (!(artifact ? isArtifactUrl(value) : isHttpsUrl(value))) return `${label} must be an https link${artifact ? ' to GitHub, npm or a public registry' : ''}.`
  return undefined
}

export function validateProject(input: ProjectInput): string | undefined {
  const appName = cleanLine(input.appName)
  if (CONTROL.test(input.appName) || appName.length < 2 || appName.length > 80) return 'The app name needs 2 to 80 characters.'
  if (cleanMultiline(input.description).length > 800) return 'The description is longer than 800 characters.'
  if (cleanLine(input.targetUser).length > 300) return 'The target user line is longer than 300 characters.'
  return checkUrl('The repository', input.repositoryUrl, true)
    ?? checkUrl('The app\'s Blends catalogue link', input.blendsRegistryUrl, true)
    ?? checkUrl('The demo link', input.demoUrl, false)
}

export function parseServiceList(value: string): readonly string[] {
  return [...new Set(value.split(/[,\n]/u).map(item => cleanLine(item)).filter(item => item !== ''))].slice(0, 12)
}

export function validatePlugin(input: PluginInput): string | undefined {
  if (CONTROL.test(input.pluginName) || cleanLine(input.pluginName).length < 2 || cleanLine(input.pluginName).length > 60) return 'The plugin name needs 2 to 60 characters.'
  if (cleanLine(input.featureTitle).length > 80) return 'The feature title is longer than 80 characters.'
  if (cleanMultiline(input.description).length > 600) return 'The plugin description is longer than 600 characters.'
  if (cleanLine(input.routePrefix).length > 120) return 'The route prefix is longer than 120 characters.'
  if (input.requires.length > 12 || input.provides.length > 12) return 'Declare at most 12 required and 12 provided services.'
  return checkUrl('The plugin repository', input.repositoryUrl, true)
    ?? checkUrl('The release link', input.releaseUrl, true)
    ?? checkUrl('The registry link', input.registryUrl, true)
}

export function validateIdea(title: string, pitch: string): string | undefined {
  if (CONTROL.test(title) || cleanLine(title).length < 2 || cleanLine(title).length > 80) return 'The idea title needs 2 to 80 characters.'
  if (cleanMultiline(pitch).length < 10 || cleanMultiline(pitch).length > 400) return 'The pitch needs 10 to 400 characters.'
  return undefined
}

// Dates and status helpers.

export function parseDate(value: string): Date | undefined {
  if (value === '') return undefined
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function formatDateTime(value: string, timeZone: string): string {
  const date = parseDate(value)
  if (date === undefined) return ''
  return new Intl.DateTimeFormat('en-GB', { timeZone, dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function formatTime(value: string, timeZone: string): string {
  const date = parseDate(value)
  return date === undefined ? '' : new Intl.DateTimeFormat('en-GB', { timeZone, timeStyle: 'short' }).format(date)
}

export function isRevealed(event: WorkshopEvent, now: Date = new Date()): boolean {
  if (event.revealed) return true
  const revealAt = parseDate(event.revealAt)
  return revealAt !== undefined && revealAt.getTime() <= now.getTime()
}

export function progressOf(status: ProjectStatus): number {
  return PROJECT_LIFECYCLE.indexOf(status) + 1
}
