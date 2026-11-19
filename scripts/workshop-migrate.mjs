/**
 * Creates the WorkshopPanel collections, view projections and seed rows in the existing acryl.dev PocketBase.
 *
 * Idempotent: existing collections get missing fields, rules and indexes patched in; seed rows are created by slug
 * only when absent, so facilitator edits (phase, reveal, approvals) are never overwritten.
 *
 * Run with the superuser credentials in the environment (never committed):
 *   ACRYL_EVENTS_API=https://... ACRYL_EVENTS_EMAIL=... ACRYL_EVENTS_PASSWORD=... node scripts/workshop-migrate.mjs
 */

const API = process.env.ACRYL_EVENTS_API?.replace(/\/$/u, '')
const EMAIL = process.env.ACRYL_EVENTS_EMAIL
const PASSWORD = process.env.ACRYL_EVENTS_PASSWORD

if (!API || !EMAIL || !PASSWORD) {
  console.error('Set ACRYL_EVENTS_API, ACRYL_EVENTS_EMAIL and ACRYL_EVENTS_PASSWORD.')
  process.exit(1)
}

const SLUG = 'workshop-2026-11-20'

let token = ''

async function request(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: token } : {}),
      ...init.headers,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const text = await response.text()
  const payload = text === '' ? undefined : JSON.parse(text)
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path}: ${response.status} ${JSON.stringify(payload)}`)
  return payload
}

const LIFECYCLE = ['registered', 'idea_selected', 'app_running', 'plugin_building', 'plugin_tested', 'git_saved', 'published', 'demo_ready', 'presented']
const PLUGIN_LIFECYCLE = ['planned', 'building', 'installed', 'tested', 'committed', 'released', 'catalogued']
const PUBLICATION = ['local', 'committed', 'pushed', 'released', 'indexing_pending', 'catalogued']
const FRANKENSTEIN = ['not_opted_in', 'pending_review', 'eligible', 'blocked', 'included', 'tested']
const PHASES = ['draft', 'registration', 'selection', 'building', 'publishing', 'showcase', 'archived']

const text = (name, max, required = false) => ({ name, type: 'text', required, ...(required ? { min: 2 } : {}), max })
const select = (name, values, required = false) => ({ name, type: 'select', required, values, maxSelect: 1 })
const timestamps = [
  { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
  { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
]
const relation = (name, collectionId) => ({ name, type: 'relation', required: true, collectionId, maxSelect: 1, cascadeDelete: false })
const optionalRelation = (name, collectionId) => ({ name, type: 'relation', required: false, collectionId, maxSelect: 1, cascadeDelete: false })

const collections = [
  {
    name: 'workshop_events',
    type: 'base',
    fields: [
      text('slug', 100, true),
      text('title', 120, true),
      text('description', 600),
      { name: 'startsAt', type: 'date' },
      { name: 'endsAt', type: 'date' },
      text('timezone', 60),
      { name: 'registrationOpen', type: 'bool' },
      { name: 'registrationClosesAt', type: 'date' },
      { name: 'revealAt', type: 'date' },
      { name: 'revealed', type: 'bool' },
      select('phase', PHASES, true),
      { name: 'schedule', type: 'json', maxSize: 200000 },
      { name: 'frankenstein', type: 'json', maxSize: 200000 },
      ...timestamps,
    ],
    indexes: ['CREATE UNIQUE INDEX `idx_workshop_events_slug` ON `workshop_events` (`slug`)'],
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null,
  },
  {
    name: 'workshop_participants',
    type: 'auth',
    fields: [
      text('name', 50, true),
      text('githubLogin', 50),
      select('os', ['macos', 'windows', 'linux', 'other']),
      { name: 'consentPublic', type: 'bool' },
      { name: 'publicId', type: 'text', required: true, max: 40 },
      ...timestamps,
    ],
    authRule: '',
    manageRule: null,
    passwordAuth: { enabled: true, identityFields: ['email'] },
    listRule: null,
    viewRule: null,
    createRule: '',
    updateRule: 'id = @request.auth.id',
    deleteRule: null,
  },
  {
    name: 'workshop_ideas',
    type: 'base',
    fields: [
      text('workshop', 100, true),
      text('slug', 100, true),
      text('title', 80, true),
      text('category', 60),
      text('pitch', 400),
      { name: 'suggestedFeatures', type: 'json', maxSize: 20000 },
      text('recommendedBlueprintId', 120),
      select('recommendedRuntime', ['acrylblends', 'acryl']),
      select('recommendedProfile', ['core', 'full']),
      select('status', ['seeded', 'pending', 'approved', 'rejected', 'archived'], true),
      optionalRelation('submittedBy', 'workshop_participants'),
      { name: 'sortOrder', type: 'number' },
      ...timestamps,
    ],
    indexes: [
      'CREATE UNIQUE INDEX `idx_workshop_ideas_slug` ON `workshop_ideas` (`slug`)',
      'CREATE INDEX `idx_workshop_ideas_status` ON `workshop_ideas` (`status`)',
    ],
    listRule: '(status = "seeded" || status = "approved") || (@request.auth.id != "" && submittedBy = @request.auth.id)',
    viewRule: '(status = "seeded" || status = "approved") || (@request.auth.id != "" && submittedBy = @request.auth.id)',
    createRule: '@request.auth.id != "" && @request.body.status = "pending" && @request.body.submittedBy = @request.auth.id',
    updateRule: '@request.auth.id != "" && status = "pending" && submittedBy = @request.auth.id',
    deleteRule: '@request.auth.id != "" && status = "pending" && submittedBy = @request.auth.id',
  },
  {
    name: 'workshop_projects',
    type: 'base',
    fields: [
      relation('participant', 'workshop_participants'),
      text('workshop', 100, true),
      optionalRelation('idea', 'workshop_ideas'),
      select('sourceMode', ['idea_pool', 'custom_idea', 'catalogue_blueprint']),
      text('appName', 80, true),
      text('description', 800),
      text('targetUser', 300),
      text('blueprintId', 120),
      text('blueprintVersion', 40),
      select('blueprintRuntime', ['acrylblends', 'acryl', 'blank']),
      select('blueprintOrigin', ['official', 'community', 'registry']),
      select('profile', ['core', 'full']),
      select('status', LIFECYCLE),
      text('repositoryUrl', 300),
      text('demoUrl', 300),
      text('blendsRegistryUrl', 300),
      select('publicationStatus', PUBLICATION),
      { name: 'featured', type: 'bool' },
      { name: 'publicId', type: 'text', required: true, max: 40 },
      ...timestamps,
    ],
    indexes: ['CREATE INDEX `idx_workshop_projects_participant` ON `workshop_projects` (`participant`)'],
    listRule: '@request.auth.id != "" && participant = @request.auth.id',
    viewRule: '@request.auth.id != "" && participant = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.body.participant = @request.auth.id',
    updateRule: '@request.auth.id != "" && participant = @request.auth.id',
    deleteRule: null,
  },
  {
    name: 'workshop_plugins',
    type: 'base',
    fields: [
      relation('participant', 'workshop_participants'),
      optionalRelation('project', 'workshop_projects'),
      text('workshop', 100, true),
      text('pluginName', 60, true),
      text('featureTitle', 80),
      text('description', 600),
      text('version', 40),
      text('routePrefix', 120),
      { name: 'requires', type: 'json', maxSize: 20000 },
      { name: 'provides', type: 'json', maxSize: 20000 },
      select('lifecycle', PLUGIN_LIFECYCLE),
      select('publicationStatus', PUBLICATION),
      text('repositoryUrl', 300),
      text('releaseUrl', 300),
      text('registryUrl', 300),
      { name: 'frankensteinOptIn', type: 'bool' },
      select('frankensteinStatus', FRANKENSTEIN),
      text('frankensteinBlockReason', 300),
      { name: 'publicId', type: 'text', required: true, max: 40 },
      ...timestamps,
    ],
    indexes: ['CREATE INDEX `idx_workshop_plugins_participant` ON `workshop_plugins` (`participant`)'],
    listRule: '@request.auth.id != "" && participant = @request.auth.id',
    viewRule: '@request.auth.id != "" && participant = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.body.participant = @request.auth.id',
    updateRule: '@request.auth.id != "" && participant = @request.auth.id',
    deleteRule: '@request.auth.id != "" && participant = @request.auth.id',
  },
]

const revealed = (alias) => `(${alias}.revealed = TRUE OR (${alias}.revealAt IS NOT NULL AND ${alias}.revealAt != '' AND datetime(${alias}.revealAt) <= datetime('now')))`

const views = [
  {
    name: 'workshop_board',
    type: 'view',
    fields: [
      { name: 'id', type: 'text', required: true },
      { name: 'participantName', type: 'text' },
      { name: 'githubLogin', type: 'text' },
      { name: 'projectId', type: 'text' },
      { name: 'appName', type: 'text' },
      { name: 'sourceMode', type: 'text' },
      { name: 'blueprintId', type: 'text' },
      { name: 'blueprintRuntime', type: 'text' },
      { name: 'blueprintOrigin', type: 'text' },
      { name: 'description', type: 'text' },
      { name: 'targetUser', type: 'text' },
      { name: 'profile', type: 'text' },
      { name: 'status', type: 'text' },
      { name: 'repositoryUrl', type: 'text' },
      { name: 'demoUrl', type: 'text' },
      { name: 'blendsRegistryUrl', type: 'text' },
      { name: 'publicationStatus', type: 'text' },
      { name: 'featured', type: 'bool' },
      { name: 'updated', type: 'text' },
    ],
    viewQuery: `SELECT
        p.publicId AS id,
        p.name AS participantName,
        p.githubLogin AS githubLogin,
        COALESCE(pr.publicId, '') AS projectId,
        COALESCE(pr.appName, '') AS appName,
        COALESCE(pr.sourceMode, '') AS sourceMode,
        COALESCE(pr.blueprintId, '') AS blueprintId,
        COALESCE(pr.blueprintRuntime, '') AS blueprintRuntime,
        COALESCE(pr.blueprintOrigin, '') AS blueprintOrigin,
        COALESCE(pr.description, '') AS description,
        COALESCE(pr.targetUser, '') AS targetUser,
        COALESCE(pr.profile, 'core') AS profile,
        COALESCE(pr.status, 'registered') AS status,
        COALESCE(pr.repositoryUrl, '') AS repositoryUrl,
        COALESCE(pr.demoUrl, '') AS demoUrl,
        COALESCE(pr.blendsRegistryUrl, '') AS blendsRegistryUrl,
        COALESCE(pr.publicationStatus, 'local') AS publicationStatus,
        COALESCE(pr.featured, 0) AS featured,
        COALESCE(pr.updated, p.updated) AS updated
      FROM workshop_participants p
      LEFT JOIN workshop_projects pr ON pr.participant = p.id
      JOIN workshop_events e ON e.slug = '${SLUG}'
      WHERE p.consentPublic = TRUE AND ${revealed('e')}`,
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null,
  },
  {
    name: 'workshop_plugins_public',
    type: 'view',
    fields: [
      { name: 'id', type: 'text', required: true },
      { name: 'pluginName', type: 'text' },
      { name: 'featureTitle', type: 'text' },
      { name: 'description', type: 'text' },
      { name: 'version', type: 'text' },
      { name: 'routePrefix', type: 'text' },
      { name: 'requires', type: 'json' },
      { name: 'provides', type: 'json' },
      { name: 'lifecycle', type: 'text' },
      { name: 'publicationStatus', type: 'text' },
      { name: 'repositoryUrl', type: 'text' },
      { name: 'releaseUrl', type: 'text' },
      { name: 'registryUrl', type: 'text' },
      { name: 'frankensteinStatus', type: 'text' },
      { name: 'frankensteinBlockReason', type: 'text' },
      { name: 'participantName', type: 'text' },
      { name: 'appName', type: 'text' },
      { name: 'projectId', type: 'text' },
      { name: 'updated', type: 'text' },
    ],
    viewQuery: `SELECT
        pl.publicId AS id,
        pl.pluginName AS pluginName,
        COALESCE(pl.featureTitle, '') AS featureTitle,
        COALESCE(pl.description, '') AS description,
        COALESCE(pl.version, '') AS version,
        COALESCE(pl.routePrefix, '') AS routePrefix,
        COALESCE(pl.requires, '[]') AS requires,
        COALESCE(pl.provides, '[]') AS provides,
        COALESCE(pl.lifecycle, 'planned') AS lifecycle,
        COALESCE(pl.publicationStatus, 'local') AS publicationStatus,
        COALESCE(pl.repositoryUrl, '') AS repositoryUrl,
        COALESCE(pl.releaseUrl, '') AS releaseUrl,
        COALESCE(pl.registryUrl, '') AS registryUrl,
        COALESCE(pl.frankensteinStatus, 'not_opted_in') AS frankensteinStatus,
        COALESCE(pl.frankensteinBlockReason, '') AS frankensteinBlockReason,
        p.name AS participantName,
        COALESCE(pr.appName, '') AS appName,
        COALESCE(pr.publicId, '') AS projectId,
        pl.updated AS updated
      FROM workshop_plugins pl
      JOIN workshop_participants p ON p.id = pl.participant
      LEFT JOIN workshop_projects pr ON pr.id = pl.project
      JOIN workshop_events e ON e.slug = '${SLUG}'
      WHERE p.consentPublic = TRUE AND ${revealed('e')}`,
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null,
  },
  {
    name: 'workshop_stats',
    type: 'view',
    fields: [
      { name: 'id', type: 'text', required: true },
      { name: 'participants', type: 'number' },
      { name: 'publicParticipants', type: 'number' },
    ],
    viewQuery: `SELECT
        e.slug AS id,
        (SELECT COUNT(*) FROM workshop_participants) AS participants,
        (SELECT COUNT(*) FROM workshop_participants WHERE consentPublic = TRUE) AS publicParticipants
      FROM workshop_events e
      WHERE e.slug = '${SLUG}'`,
    listRule: '',
    viewRule: '',
    createRule: null,
    updateRule: null,
    deleteRule: null,
  },
]

const schedule = [
  { time: '00:00-00:15', block: 'Welcome and WorkshopPanel', checkpoint: 'Register by display name, inspect the idea pool, understand the shared outcome.' },
  { time: '00:15-00:35', block: 'Choose a direction', checkpoint: 'Idea, own topic or catalogue Blueprint; the project card is complete.' },
  { time: '00:35-00:55', block: 'Create and run', checkpoint: 'The app runs locally; Git initialized.' },
  { time: '00:55-01:15', block: 'Cordis Plugin model', checkpoint: 'A plugin skeleton with a known provides/consumes contract.' },
  { time: '01:15-02:00', block: 'Build the first feature', checkpoint: 'One original Cordis Plugin works and persists a record.' },
  { time: '02:00-02:10', block: 'Break', checkpoint: 'The shared board stays on the projector.' },
  { time: '02:10-02:40', block: 'Modify, test, and update', checkpoint: 'Create, install, modify, update, test.' },
  { time: '02:40-03:00', block: 'Git and peer exchange', checkpoint: 'Git history exists; a peer plugin was pulled and tried.' },
  { time: '03:00-03:30', block: 'Publish the ecosystem', checkpoint: 'Publication links entered; registry indexing may be pending.' },
  { time: '03:30-03:55', block: 'Frankenstein integration', checkpoint: 'The collective app boots and lists the included contributions.' },
  { time: '03:55-04:25', block: 'Demo gallery', checkpoint: 'Final App Gallery and Plugin Pool are complete.' },
  { time: '04:25-04:30', block: 'Wrap-up', checkpoint: 'Shared links and next steps are visible.' },
]

const ideas = [
  ['personal-crm', 'Personal CRM', 'Community', 'Remember people, conversations, and follow-ups.', ['Contacts', 'Interaction log', 'Follow-up reminders']],
  ['local-events-hub', 'Local Events Hub', 'Community', 'Discover local events and coordinate attendance.', ['Events', 'RSVP', 'Attendee check-in']],
  ['studio-booking', 'Studio and Equipment Booking', 'Bookings', 'Manage rooms, equipment, availability, and bookings.', ['Resources', 'Availability', 'Reservations']],
  ['community-lending-library', 'Community Lending Library', 'Community', 'Lend tools, books, or equipment to neighbours.', ['Catalogue', 'Loans', 'Returns']],
  ['small-business-order-desk', 'Small Business Order Desk', 'Business', 'Track customers, orders, stock, and fulfillment.', ['Customers', 'Orders', 'Inventory']],
  ['invoice-expense-desk', 'Invoice and Expense Desk', 'Finance', 'Track invoices, expenses, and period summaries.', ['Invoices', 'Expenses', 'Reports']],
  ['travel-itinerary-builder', 'Travel Itinerary Builder', 'Travel', 'Assemble trips, stops, and a shared budget.', ['Trips', 'Itinerary stops', 'Expenses']],
  ['sports-club-manager', 'Sports Club Manager', 'Sports', 'Manage members, training sessions, and attendance.', ['Members', 'Sessions', 'Attendance']],
  ['volunteer-coordinator', 'Volunteer Coordinator', 'Volunteering', 'Coordinate volunteers and shifts.', ['Volunteers', 'Shifts', 'Check-ins']],
  ['learning-tracker', 'Learning Tracker', 'Learning', 'Organize learning paths and personal progress.', ['Courses', 'Learning sessions', 'Progress']],
  ['research-notebook', 'Research Notebook', 'Research', 'Collect sources, notes, tags, and findings.', ['Sources', 'Annotations', 'Collections']],
  ['pantry-meal-planner', 'Pantry and Meal Planner', 'Food', 'Track ingredients and plan meals.', ['Pantry items', 'Recipes', 'Meal plan']],
  ['maker-inventory', 'Maker Inventory', 'Making', 'Keep track of parts, tools, and projects.', ['Items', 'Locations', 'Stock movements']],
  ['neighbourhood-help-board', 'Neighbourhood Help Board', 'Neighbourhood', 'Offer and request help in a local community.', ['Requests', 'Offers', 'Matching']],
  ['band-rehearsal-planner', 'Band Rehearsal Planner', 'Music', 'Organize rehearsals, setlists, and availability.', ['Bands', 'Rehearsal calendar', 'Setlists']],
  ['home-maintenance-tracker', 'Home Maintenance Tracker', 'Maintenance', 'Record assets, repairs, and recurring tasks.', ['Assets', 'Maintenance records', 'Reminders']],
  ['retrospective-board', 'Project Retrospective Board', 'Business', 'Collect observations and vote on improvements.', ['Boards', 'Cards', 'Votes']],
  ['api-orbit-console', 'API Orbit Console', 'Developer', 'Explore and test an API using local fixtures.', ['Endpoint catalogue', 'Request runner', 'Snippets']],
  ['reading-media-log', 'Reading and Media Log', 'Media', 'Track books, films, music, and recommendations.', ['Library', 'Activity log', 'Lists']],
  ['accessibility-review-board', 'Accessibility Review Board', 'Accessibility', 'Track interface findings and remediation.', ['Audits', 'Findings', 'Remediation status']],
]

async function getCollection(name) {
  const response = await fetch(`${API}/api/collections/${encodeURIComponent(name)}`, { headers: token ? { authorization: token } : {} })
  if (response.status === 404) return undefined
  const payload = await response.json()
  if (!response.ok) throw new Error(`GET collection ${name}: ${response.status} ${JSON.stringify(payload)}`)
  return payload
}

const rulesOf = (definition) => Object.fromEntries(
  ['listRule', 'viewRule', 'createRule', 'updateRule', 'deleteRule', 'authRule', 'manageRule']
    .filter((key) => definition[key] !== undefined)
    .map((key) => [key, definition[key]]),
)

async function ensureCollection(definition) {
  const existing = await getCollection(definition.name)
  if (existing !== undefined && existing.type !== definition.type) {
    throw new Error(`${definition.name} is a ${existing.type} collection, expected ${definition.type}; remove it by hand before rerunning`)
  }
  if (existing === undefined) {
    const created = await request('/api/collections', { method: 'POST', body: definition })
    console.log(`created ${definition.name}`)
    return created
  }
  const current = existing.fields ?? []
  const missing = definition.fields.filter((field) => !current.some((entry) => entry.name === field.name))
  const patch = { ...rulesOf(definition) }
  if (definition.type === 'view') patch.fields = definition.fields
  else if (missing.length > 0) patch.fields = [...current, ...missing]
  if (definition.viewQuery !== undefined) patch.viewQuery = definition.viewQuery
  if (definition.indexes !== undefined) patch.indexes = [...new Set([...(existing.indexes ?? []), ...definition.indexes])]
  const patched = await request(`/api/collections/${existing.id}`, { method: 'PATCH', body: patch })
  console.log(`patched ${definition.name}${missing.length > 0 ? ` (+${missing.map((field) => field.name).join(', ')})` : ''}`)
  return patched
}

async function seedEvent() {
  const listed = await request(`/api/collections/workshop_events/records?perPage=1&filter=${encodeURIComponent(`slug = "${SLUG}"`)}`)
  if (listed.totalItems > 0) {
    console.log('event already seeded')
    return
  }
  await request('/api/collections/workshop_events/records', {
    method: 'POST',
    body: {
      slug: SLUG,
      title: 'ACRYL Workshop: Build Together, Publish Together',
      description: 'Every participant builds a real application from an idea they care about, turns its features into reusable Cordis Plugins, and publishes the result. Twenty applications, one plugin pool, one collective app.',
      startsAt: '2026-11-20T17:00:00.000Z',
      endsAt: '2026-11-20T21:30:00.000Z',
      timezone: 'Europe/Vienna',
      registrationOpen: true,
      revealAt: '2026-11-20T17:30:00.000Z',
      revealed: false,
      phase: 'registration',
      schedule,
      frankenstein: {
        name: 'Frankenstein App',
        description: 'One Blank-based app composed from the compatible, opted-in showcase plugins of the room.',
        repositoryUrl: '',
        demoUrl: '',
        version: '',
        lastTestedAt: '',
        notes: '',
      },
    },
  })
  console.log('seeded event')
}

async function seedIdeas() {
  for (const [index, [slug, title, category, pitch, features]] of ideas.entries()) {
    const filter = encodeURIComponent(`slug = "${slug}"`)
    const listed = await request(`/api/collections/workshop_ideas/records?perPage=1&filter=${filter}`)
    if (listed.totalItems > 0) continue
    await request('/api/collections/workshop_ideas/records', {
      method: 'POST',
      body: {
        workshop: SLUG,
        slug,
        title,
        category,
        pitch,
        suggestedFeatures: features,
        recommendedBlueprintId: 'acryl.blank',
        recommendedRuntime: 'acrylblends',
        recommendedProfile: 'core',
        status: 'seeded',
        sortOrder: index + 1,
      },
    })
  }
  const listed = await request('/api/collections/workshop_ideas/records?perPage=1')
  console.log(`idea pool: ${listed.totalItems}`)
}

async function main() {
  const auth = await request('/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    body: { identity: EMAIL, password: PASSWORD },
  })
  token = auth.token

  // Relation fields name their target collection while this file is declarative; PocketBase needs its id, so each
  // collection is resolved just before it is created (targets always come earlier in the list).
  const ids = new Map()
  for (const definition of [...collections, ...views]) {
    for (const field of definition.fields) {
      if (field.type === 'relation' && !field.collectionId.startsWith('pbc_')) {
        const target = ids.get(field.collectionId)
        if (target === undefined) throw new Error(`${definition.name}.${field.name}: unknown relation target ${field.collectionId}`)
        field.collectionId = target
      }
    }
    const ensured = await ensureCollection(definition)
    ids.set(definition.name, ensured.id)
  }

  await seedEvent()
  await seedIdeas()

  const counts = await request(`/api/collections/workshop_stats/records?perPage=1`)
  console.log(`done: ${JSON.stringify(counts.items[0])}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
