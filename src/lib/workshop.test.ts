import { describe, expect, it } from 'vitest'
import {
  decodeRecovery, encodeRecovery, privateLinkOf, isArtifactUrl, isHttpsUrl, isRevealed, parseDate, parseServiceList, progressOf,
  validateDisplayName, validateIdea, validateParticipant, validatePlugin, validateProject, type PluginInput, type ProjectInput,
  type WorkshopEvent,
} from './workshop'

const project = (patch: Partial<ProjectInput> = {}): ProjectInput => ({
  sourceMode: 'idea_pool',
  idea: 'idea-1',
  appName: 'Note board',
  description: 'A board for quick notes.',
  targetUser: 'Small teams',
  blueprintId: '',
  blueprintVersion: '',
  blueprintRuntime: '',
  blueprintOrigin: '',
  profile: 'core',
  status: 'app_running',
  repositoryUrl: '',
  demoUrl: '',
  blendsRegistryUrl: '',
  publicationStatus: 'local',
  ...patch,
})

const plugin = (patch: Partial<PluginInput> = {}): PluginInput => ({
  pluginName: 'notes-board',
  featureTitle: 'A board for quick notes',
  description: 'Adds notes.',
  version: '0.1.0',
  routePrefix: '/contributions/you/notes',
  requires: ['router'],
  provides: ['notes'],
  lifecycle: 'planned',
  publicationStatus: 'local',
  repositoryUrl: '',
  releaseUrl: '',
  registryUrl: '',
  frankensteinOptIn: true,
  ...patch,
})

const event = (patch: Partial<WorkshopEvent> = {}): WorkshopEvent => ({
  id: 'event',
  slug: 'workshop-2026-11-20',
  title: 'Workshop',
  description: '',
  startsAt: '2026-11-20 17:00:00.000Z',
  endsAt: '2026-11-20 21:30:00.000Z',
  timezone: 'Europe/Vienna',
  registrationOpen: true,
  registrationClosesAt: '',
  revealAt: '2026-11-20 17:30:00.000Z',
  revealed: false,
  phase: 'registration',
  schedule: [],
  frankenstein: { name: 'Frankenstein App', description: '', repositoryUrl: '', demoUrl: '', version: '', lastTestedAt: '', notes: '' },
  ...patch,
})

describe('participant validation', () => {
  it('accepts a plain display name and refuses names out of bounds', () => {
    expect(validateDisplayName('Ada')).toBeUndefined()
    expect(validateDisplayName('A')).toContain('2 to 50')
    expect(validateDisplayName('a'.repeat(51))).toContain('2 to 50')
    expect(validateDisplayName('Ada\u0000')).toContain('not allowed')
  })

  it('requires public-board consent and a plausible GitHub login', () => {
    expect(validateParticipant({ name: 'Ada', githubLogin: 'ada', os: 'linux', consentPublic: true })).toBeUndefined()
    expect(validateParticipant({ name: 'Ada', githubLogin: 'not a login', os: '', consentPublic: true })).toContain('GitHub')
    expect(validateParticipant({ name: 'Ada', githubLogin: '', os: '', consentPublic: false })).toContain('public board')
  })
})

describe('URL validation', () => {
  it('accepts https only and keeps the artifact hosts to GitHub, npm and public registries', () => {
    expect(isHttpsUrl('https://example.com/app')).toBe(true)
    expect(isHttpsUrl('http://example.com/app')).toBe(false)
    expect(isHttpsUrl('not a url')).toBe(false)
    expect(isArtifactUrl('https://github.com/ada/notes')).toBe(true)
    expect(isArtifactUrl('https://cordisplugins.github.io/notes')).toBe(true)
    expect(isArtifactUrl('https://example.com/notes')).toBe(false)
  })

  it('refuses a repository link that is not a code host, but allows any https demo', () => {
    expect(validateProject(project({ repositoryUrl: 'https://example.com/notes' }))).toContain('GitHub')
    expect(validateProject(project({ repositoryUrl: 'https://github.com/ada/notes', demoUrl: 'https://notes.vercel.app' }))).toBeUndefined()
    expect(validateProject(project({ demoUrl: 'javascript:alert(1)' }))).toContain('https')
  })
})

describe('project and plugin validation', () => {
  it('bounds the app name and description', () => {
    expect(validateProject(project())).toBeUndefined()
    expect(validateProject(project({ appName: 'A' }))).toContain('2 to 80')
    expect(validateProject(project({ description: 'x'.repeat(801) }))).toContain('800')
  })

  it('bounds the plugin name and checks its links', () => {
    expect(validatePlugin(plugin())).toBeUndefined()
    expect(validatePlugin(plugin({ pluginName: '' }))).toContain('2 to 60')
    expect(validatePlugin(plugin({ releaseUrl: 'ftp://example.com' }))).toContain('https')
  })

  it('reads service lists from commas and newlines and de-duplicates them', () => {
    expect(parseServiceList('router, database\nrouter,  state')).toEqual(['router', 'database', 'state'])
  })

  it('checks an idea title and pitch', () => {
    expect(validateIdea('Library', 'Lend tools to neighbours and track returns.')).toBeUndefined()
    expect(validateIdea('L', 'Lend tools to neighbours.')).toContain('2 to 80')
    expect(validateIdea('Library', 'short')).toContain('10 to 400')
  })
})

describe('the private edit code', () => {
  it('round-trips and refuses anything else', () => {
    const credentials = { identity: 'w-abc@workshop.acryl.dev', password: 'p'.repeat(32) }
    expect(decodeRecovery(encodeRecovery(credentials))).toEqual(credentials)
    expect(decodeRecovery('not-base64')).toBeUndefined()
    const link = privateLinkOf('https://acryl.dev/workshoppanel', credentials)
    expect(link.startsWith('https://acryl.dev/workshoppanel#restore=')).toBe(true)
    expect(decodeRecovery(link.slice(link.indexOf('#restore=') + '#restore='.length))).toEqual(credentials)
    expect(decodeRecovery(btoa('{"identity":"x","password":"short"}'))).toBeUndefined()
  })
})

describe('reveal and progress', () => {
  it('reveals on the flag or once the reveal time passed', () => {
    expect(isRevealed(event({ revealed: true }), new Date('2026-11-20T10:00:00Z'))).toBe(true)
    expect(isRevealed(event(), new Date('2026-11-20T17:29:00Z'))).toBe(false)
    expect(isRevealed(event(), new Date('2026-11-20T17:31:00Z'))).toBe(true)
    expect(isRevealed(event({ revealAt: '' }), new Date('2026-11-21T00:00:00Z'))).toBe(false)
  })

  it('reads the PocketBase date format and counts lifecycle steps', () => {
    expect(parseDate('2026-11-20 17:30:00.000Z')?.toISOString()).toBe('2026-11-20T17:30:00.000Z')
    expect(parseDate('')).toBeUndefined()
    expect(progressOf('registered')).toBe(1)
    expect(progressOf('presented')).toBe(9)
  })
})
