import { ArrowUpRight, Check, Copy, ExternalLink, Github, Loader2, Star } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CataloguePane } from '../components/workshop/CataloguePane'
import { FacilitatorPanel } from '../components/workshop/FacilitatorPanel'
import { ParticipantPanel } from '../components/workshop/ParticipantPanel'
import {
  decodeRecovery, encodeRecovery, formatDateTime, formatTime, forgetCredentials, FRANKENSTEIN_LABELS, isRevealed, loadPublicWorkshop,
  PLUGIN_LABELS, PLUGIN_LIFECYCLE, PROJECT_LABELS, PROJECT_LIFECYCLE, PUBLICATION_LABELS, restoreSession, SOURCE_LABELS, storedCredentials,
  storeCredentials, submitIdea, TAB_LABELS, TABS, validateIdea, type BoardEntry, type CatalogueEntry, type Credentials, type Idea, type Participant, type PublicPlugin,
  type PublicWorkshop, type Session, type WorkshopTab, type WorkshopEvent,
} from '../lib/workshop'

type Load =
  | { readonly state: 'loading' }
  | { readonly state: 'live'; readonly data: PublicWorkshop }
  | { readonly state: 'failed'; readonly reason: string }

type Notice = { readonly kind: 'ok' | 'error'; readonly text: string } | undefined

function tabOf(value: string | null): WorkshopTab {
  return TABS.find(tab => tab === value) ?? 'overview'
}

export function WorkshopPanelPage() {
  const [params, setParams] = useSearchParams()
  const tab = tabOf(params.get('tab'))
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [session, setSession] = useState<Session>()
  const [recovery, setRecovery] = useState<string>()
  const [sessionNotice, setSessionNotice] = useState<Notice>()
  const [pickedBlueprint, setPickedBlueprint] = useState<CatalogueEntry>()
  const [pickedIdea, setPickedIdea] = useState<string>()

  const setTab = useCallback((next: WorkshopTab) => {
    setParams(previous => {
      const values = new URLSearchParams(previous)
      values.set('tab', next)
      return values
    }, { replace: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [setParams])

  const refresh = useCallback(() => setAttempt(value => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let live = true
    let busy = false
    const loadData = (): void => {
      if (busy) return
      busy = true
      loadPublicWorkshop(controller.signal)
        .then(data => { if (live) setLoad({ state: 'live', data }) })
        .catch((reason: unknown) => {
          if (!live || controller.signal.aborted) return
          setLoad(current => current.state === 'live' ? current : { state: 'failed', reason: reason instanceof Error ? reason.message : 'The workshop did not load.' })
        })
        .finally(() => { busy = false })
    }
    loadData()
    const timer = window.setInterval(loadData, 15_000)
    const onFocus = (): void => loadData()
    window.addEventListener('focus', onFocus)
    return () => { live = false; controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', onFocus) }
  }, [attempt])

  // One-time recovery link: `#restore=<code>` authenticates and is removed from the address bar at once.
  useEffect(() => {
    const code = window.location.hash.startsWith('#restore=') ? window.location.hash.slice('#restore='.length) : undefined
    if (code !== undefined) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      const credentials = decodeRecovery(code)
      if (credentials === undefined) { setSessionNotice({ kind: 'error', text: 'That edit code is not readable. Register again or ask the facilitator.' }); return }
      storeCredentials(credentials)
      restoreSession(credentials)
        .then(next => { setSession(next); setTab('mine') })
        .catch(() => setSessionNotice({ kind: 'error', text: 'That edit code is no longer valid. Register again or ask the facilitator.' }))
      return
    }
    const credentials = storedCredentials()
    if (credentials !== undefined) {
      restoreSession(credentials)
        .then(setSession)
        .catch(() => { forgetCredentials() })
    }
  }, [setTab])

  const onRegistered = (next: Session, credentials: Credentials): void => {
    setSession(next)
    setRecovery(encodeRecovery(credentials))
    setSessionNotice(undefined)
    setTab('mine')
    refresh()
  }

  const onForget = (): void => {
    forgetCredentials()
    setSession(undefined)
    setRecovery(undefined)
    setSessionNotice({ kind: 'ok', text: 'This browser now uses an empty identity. Your earlier record stays on the board; sign in with your edit code to return to it.' })
  }

  if (load.state === 'loading') {
    return <div className="workshop-page page-width"><p className="workshop-note" role="status"><Loader2 className="spin" aria-hidden="true" /> Loading the workshop...</p></div>
  }
  if (load.state === 'failed') {
    return (
      <div className="workshop-page page-width">
        <p className="eyebrow">ACRYL Workshop</p>
        <h1>The workshop panel did not load</h1>
        <p className="workshop-note" role="alert">{load.reason}</p>
        <button type="button" className="button" onClick={() => setAttempt(value => value + 1)}>Try again</button>
      </div>
    )
  }

  const { event, ideas, stats, board, plugins } = load.data
  const titleParts = event.title.split(': ')
  const revealed = isRevealed(event)
  const projects = board.filter(entry => entry.projectId !== '')

  return (
    <div className="workshop-page page-width">
      <header className="workshop-hero">
        <p className="eyebrow">ACRYL Workshop · {formatDateTime(event.startsAt, event.timezone)}</p>
        <h1>
          {titleParts.length > 1
            ? <>{titleParts[0]}:<br /><span className="spectrum-text">{titleParts.slice(1).join(': ')}</span></>
            : event.title}
        </h1>
        <p className="workshop-lede">{event.description}</p>
        <div className="workshop-facts">
          <span className="workshop-chip accent">{event.phase}</span>
          <span>{formatDateTime(event.startsAt, event.timezone)} to {formatTime(event.endsAt, event.timezone)} ({event.timezone})</span>
          <span>{event.registrationOpen ? 'Registration open' : 'Registration closed'}</span>
          <span>{stats.participants} registered</span>
          <span>{revealed ? `${board.length} on the public board` : `Board reveals ${formatDateTime(event.revealAt, event.timezone)}`}</span>
        </div>
        <div className="workshop-hero-actions">
          <button type="button" className="button" onClick={() => setTab('mine')}>{session === undefined ? 'Register and start' : 'Open my project'}</button>
          <button type="button" className="button secondary" onClick={() => setTab('board')}>See the participants</button>
          <a className="button secondary" href="#facilitator">Facilitator controls</a>
        </div>
      </header>

      {recovery !== undefined && <RecoveryBanner code={recovery} onDismiss={() => setRecovery(undefined)} />}
      {sessionNotice !== undefined && <p className={sessionNotice.kind === 'error' ? 'workshop-error' : 'workshop-ok'} role={sessionNotice.kind === 'error' ? 'alert' : 'status'}>{sessionNotice.text}</p>}

      <nav className="workshop-tabs" aria-label="Workshop sections">
        {TABS.map(value => (
          <button key={value} type="button" className={tab === value ? 'active' : undefined} aria-current={tab === value ? 'page' : undefined} onClick={() => setTab(value)}>
            {TAB_LABELS[value]}
          </button>
        ))}
      </nav>

      {tab === 'overview' && <Overview event={event} stats={stats} board={board} plugins={plugins} revealed={revealed} onJoin={() => setTab('mine')} onBoard={() => setTab('board')} />}
      {tab === 'ideas' && <IdeaPool ideas={ideas} session={session} onPick={ideasId => { setPickedIdea(ideasId); setTab('mine') }} onChanged={refresh} />}
      {tab === 'blueprints' && <CataloguePane onPick={entry => { setPickedBlueprint(entry); setTab('mine') }} />}
      {tab === 'board' && (revealed
        ? <Board board={board} plugins={plugins} />
        : <RevealGate event={event} stats={stats} what="The participant board" />)}
      {tab === 'plugins' && (revealed ? <PluginPool plugins={plugins} /> : <RevealGate event={event} stats={stats} what="The plugin pool" />)}
      {tab === 'gallery' && (revealed ? <Gallery projects={projects} plugins={plugins} /> : <RevealGate event={event} stats={stats} what="The app gallery" />)}
      {tab === 'frankenstein' && <Frankenstein event={event} plugins={plugins} revealed={revealed} />}
      {tab === 'mine' && (
        <ParticipantPanel
          event={event}
          ideas={ideas.filter(idea => idea.status !== 'pending' || idea.submittedBy === session?.participant.id)}
          session={session}
          pickedBlueprint={pickedBlueprint}
          pickedIdea={pickedIdea}
          onRegistered={onRegistered}
          onPickedConsumed={() => setPickedBlueprint(undefined)}
          onIdeaConsumed={() => setPickedIdea(undefined)}
          onParticipantUpdated={(participant: Participant) => setSession(current => current === undefined ? current : { ...current, participant })}
          onForget={onForget}
          onPublicChanged={refresh}
        />
      )}

      <FacilitatorPanel event={event} ideas={ideas} board={board} plugins={plugins} onChanged={refresh} />
      <footer className="workshop-footer">
        <p>Built with the public Blends catalogue and Cordis Plugins registry. Community plugins and Blends are community-maintained and not reviewed by ACRYL. The site never installs, builds or runs participant code.</p>
        <p><a href="https://acrylblends.github.io/blends" target="_blank" rel="noreferrer">Blends catalogue <ArrowUpRight aria-hidden="true" /></a> · <a href="https://cordisplugins.github.io" target="_blank" rel="noreferrer">Cordis Plugins <ArrowUpRight aria-hidden="true" /></a></p>
      </footer>
    </div>
  )
}

function RecoveryBanner({ code, onDismiss }: { readonly code: string; readonly onDismiss: () => void }) {
  const [copied, setCopied] = useState<'code' | 'link'>()
  const link = `${window.location.origin}${window.location.pathname}#restore=${code}`
  const copy = async (value: string, kind: 'code' | 'link'): Promise<void> => {
    await navigator.clipboard.writeText(value)
    setCopied(kind)
    window.setTimeout(() => setCopied(undefined), 2000)
  }
  return (
    <div className="workshop-recovery" role="status">
      <div>
        <strong>You're in. Your project is saved in this browser.</strong>
        <p>Switching laptops later? Keep this link - it opens your project anywhere. It is private, so don't post it.</p>
      </div>
      <div className="workshop-aside-actions">
        <button type="button" className="button small" onClick={onDismiss}>Start my project</button>
        <button type="button" className="button secondary small" onClick={() => void copy(link, 'link')}>{copied === 'link' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied === 'link' ? 'Copied' : 'Copy my private link'}</button>
      </div>
    </div>
  )
}

function Overview({ event, stats, board, plugins, revealed, onJoin, onBoard }: {
  readonly event: WorkshopEvent
  readonly stats: PublicWorkshop['stats']
  readonly board: readonly BoardEntry[]
  readonly plugins: readonly PublicPlugin[]
  readonly revealed: boolean
  readonly onJoin: () => void
  readonly onBoard: () => void
}) {
  const projects = board.filter(entry => entry.projectId !== '')
  const next = event.schedule[0]
  return (
    <>
      <section className="workshop-section" aria-labelledby="workshop-overview">
        <div className="workshop-section-head">
          <div>
            <p className="eyebrow">At a glance</p>
            <h2 id="workshop-overview">One room, twenty applications,<br /><span className="spectrum-text">one plugin pool.</span></h2>
          </div>
          <p>Each participant builds a real app, turns its features into Cordis Plugins, and publishes the links here. The public board opens after the topic reveal.</p>
        </div>
        <div className="workshop-stats">
          <div><strong>{stats.participants}</strong><span>registered</span></div>
          <div><strong>{revealed ? projects.length : '-'}</strong><span>projects</span></div>
          <div><strong>{revealed ? plugins.length : '-'}</strong><span>plugins</span></div>
          <div><strong>{revealed ? board.length : '-'}</strong><span>on the public board</span></div>
        </div>
        {!revealed && <p className="workshop-note">Participant names and topics stay hidden until {formatDateTime(event.revealAt, event.timezone)}. You can already read the idea pool and pick your own direction. <button type="button" className="workshop-link-button" onClick={onJoin}>Register</button>.</p>}
        {revealed && <p className="workshop-note">{projects.length} projects are on the board. <button type="button" className="workshop-link-button" onClick={onBoard}>See who is building what</button>.</p>}
      </section>

      <section className="workshop-section" aria-labelledby="workshop-program">
        <div className="workshop-section-head">
          <div><p className="eyebrow">Program</p><h2 id="workshop-program">The day, block by block</h2></div>
          <p>Next checkpoint: {next === undefined ? 'the wrap-up' : `${next.time} ${next.block}`}. The panel follows the room in real time.</p>
        </div>
        <ol className="workshop-schedule">
          {event.schedule.map(block => (
            <li key={`${block.time}-${block.block}`}>
              <span>{block.time}</span>
              <strong>{block.block}</strong>
              <p>{block.checkpoint}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

function IdeaPool({ ideas, session, onPick, onChanged }: {
  readonly ideas: readonly Idea[]
  readonly session: Session | undefined
  readonly onPick: (id: string) => void
  readonly onChanged: () => void
}) {
  const [title, setTitle] = useState('')
  const [pitch, setPitch] = useState('')
  const [category, setCategory] = useState('')
  const [features, setFeatures] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice>()

  const submit = async (): Promise<void> => {
    if (session === undefined) return
    const invalid = validateIdea(title, pitch)
    if (invalid !== undefined) { setNotice({ kind: 'error', text: invalid }); return }
    setBusy(true)
    try {
      await submitIdea(session, title, pitch, category, features.split(',').map(item => item.trim()).filter(item => item !== '').slice(0, 4))
      setNotice({ kind: 'ok', text: 'Your idea is sent to the facilitator for approval. It appears here once approved.' })
      setTitle(''); setPitch(''); setCategory(''); setFeatures('')
      onChanged()
    } catch (reason) {
      setNotice({ kind: 'error', text: reason instanceof Error ? reason.message : 'The idea was not submitted.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="workshop-section" aria-labelledby="workshop-ideas">
      <div className="workshop-section-head">
        <div><p className="eyebrow">Idea pool</p><h2 id="workshop-ideas">Pick a direction,<br /><span className="spectrum-text">or bring your own.</span></h2></div>
        <p>Every idea suggests two or three features that become separate Cordis Plugins. Duplicate themes are fine when the product or the user differs.</p>
      </div>
      <div className="workshop-ideas">
        {ideas.map(idea => (
          <article className="workshop-idea-card" key={idea.id}>
            <header>
              <span className="workshop-chip">{idea.category || 'Idea'}</span>
              {idea.status === 'pending' && <span className="workshop-chip accent">Pending approval</span>}
              {idea.status === 'approved' && <span className="workshop-chip accent">Approved suggestion</span>}
            </header>
            <h3>{idea.title}</h3>
            <p>{idea.pitch}</p>
            <ul>{idea.suggestedFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>
            <div className="workshop-idea-actions">
              <span className="workshop-note-inline">{idea.recommendedBlueprintId === '' ? 'Start from Blank' : `Start from ${idea.recommendedBlueprintId} (${idea.recommendedRuntime === 'acryl' ? 'ACRYL starter' : 'standalone Blends app'})`}</span>
              {session === undefined
                ? <span className="workshop-note-inline">Register to claim it</span>
                : idea.status !== 'pending' && <button type="button" className="button secondary small" onClick={() => onPick(idea.id)}>Choose this idea</button>}
            </div>
          </article>
        ))}
      </div>

      {session !== undefined && (
        <form className="workshop-form workshop-idea-form" onSubmit={event => { event.preventDefault(); void submit() }}>
          <h3 className="workshop-subhead">Suggest a new idea</h3>
          <div className="workshop-fields two">
            <label className="workshop-field"><span>Title</span><input required maxLength={80} value={title} onChange={event => setTitle(event.target.value)} placeholder="Community tool library" /></label>
            <label className="workshop-field"><span>Category</span><input maxLength={60} value={category} onChange={event => setCategory(event.target.value)} placeholder="Community" /></label>
          </div>
          <label className="workshop-field"><span>The problem and the app in one paragraph</span><textarea required rows={3} maxLength={400} value={pitch} onChange={event => setPitch(event.target.value)} /></label>
          <label className="workshop-field"><span>Suggested plugin features (comma separated)</span><input value={features} onChange={event => setFeatures(event.target.value)} placeholder="Catalogue, Loans, Returns" /></label>
          {notice !== undefined && <p className={notice.kind === 'error' ? 'workshop-error' : 'workshop-ok'} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
          <button type="submit" className="button small" disabled={busy}>{busy ? 'Sending' : 'Send for approval'}</button>
        </form>
      )}
    </section>
  )
}

function RevealGate({ event, stats, what }: { readonly event: WorkshopEvent; readonly stats: PublicWorkshop['stats']; readonly what: string }) {
  return (
    <section className="workshop-section">
      <div className="workshop-empty">
        <Star aria-hidden="true" />
        <h2>{what} opens after the reveal</h2>
        <p>{stats.participants} people are registered. Names, topics and projects appear at {formatDateTime(event.revealAt, event.timezone)} ({event.timezone}), or earlier if the facilitator reveals the board.</p>
        <p className="workshop-note-inline">Meanwhile: read the idea pool, browse the Blueprint catalogue, and set up your own project.</p>
      </div>
    </section>
  )
}

function Board({ board, plugins }: { readonly board: readonly BoardEntry[]; readonly plugins: readonly PublicPlugin[] }) {
  return (
    <section className="workshop-section" aria-labelledby="workshop-board">
      <div className="workshop-section-head">
        <div><p className="eyebrow">Participants</p><h2 id="workshop-board">Who is building<br /><span className="spectrum-text">what, right now.</span></h2></div>
        <p>Only people who chose to be on the board appear here. Progress is self-reported; a published link is the participant's own record, not an ACRYL review.</p>
      </div>
      {board.length === 0 && <p className="workshop-empty">No one has opted into the public board yet.</p>}
      <div className="workshop-board">
        {board.map(entry => {
          const contributions = plugins.filter(plugin => entry.projectId !== '' && plugin.projectId === entry.projectId)
          return (
            <article className={`workshop-board-card${entry.featured ? ' featured' : ''}`} key={`${entry.id}-${entry.projectId}`}>
              <header>
                <div>
                  <strong>{entry.participantName}</strong>
                  {entry.githubLogin !== '' && <a href={`https://github.com/${entry.githubLogin}`} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> {entry.githubLogin}</a>}
                </div>
                {entry.featured && <span className="workshop-chip accent">Featured</span>}
              </header>
              {entry.appName !== '' ? (
                <>
                  <h3>{entry.appName}</h3>
                  {entry.targetUser !== '' && <p className="workshop-note-inline">{entry.targetUser}</p>}
                  {entry.description !== '' && <p>{entry.description}</p>}
                  <div className="workshop-chips">
                    <span className="workshop-chip">{entry.sourceMode === '' ? 'Choosing' : SOURCE_LABELS[entry.sourceMode]}</span>
                    {entry.blueprintId !== '' && <span className="workshop-chip">{entry.blueprintId}{entry.blueprintOrigin === 'community' ? ' (Community)' : ''}</span>}
                    <span className="workshop-chip">{entry.profile === 'full' ? 'Full profile' : 'Core profile'}</span>
                    <span className="workshop-chip accent">{PROJECT_LABELS[entry.status]}</span>
                    <span className="workshop-chip">{PUBLICATION_LABELS[entry.publicationStatus]}</span>
                  </div>
                  <Progress status={entry.status} />
                </>
              ) : <p className="workshop-note">Choosing a direction.</p>}
              {contributions.length > 0 && (
                <div className="workshop-chips">
                  {contributions.map(plugin => <span className="workshop-chip" key={plugin.id}>{plugin.featureTitle || plugin.pluginName} · {PLUGIN_LABELS[plugin.lifecycle]}</span>)}
                </div>
              )}
              <div className="workshop-card-links">
                {entry.repositoryUrl !== '' && <a href={entry.repositoryUrl} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> repository</a>}
                {entry.blendsRegistryUrl !== '' && <a href={entry.blendsRegistryUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> catalogue</a>}
                {entry.demoUrl !== '' && <a href={entry.demoUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> demo</a>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Progress({ status }: { readonly status: BoardEntry['status'] }) {
  const index = PROJECT_LIFECYCLE.indexOf(status)
  return (
    <div className="workshop-progress" aria-label={`Progress: ${PROJECT_LABELS[status]} (${String(index + 1)} of ${String(PROJECT_LIFECYCLE.length)})`}>
      {PROJECT_LIFECYCLE.map((step, position) => (
        <span key={step} className={position <= index ? 'done' : undefined} title={PROJECT_LABELS[step]} />
      ))}
    </div>
  )
}

type PoolFilter = 'all' | 'planned' | 'tested' | 'released' | 'catalogued'

function PluginPool({ plugins }: { readonly plugins: readonly PublicPlugin[] }) {
  const [filter, setFilter] = useState<PoolFilter>('all')
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const shown = plugins.filter(plugin => {
    if (filter !== 'all') {
      const floor = PLUGIN_LIFECYCLE.indexOf(filter)
      if (PLUGIN_LIFECYCLE.indexOf(plugin.lifecycle) < floor) return false
    }
    return needle === '' || [plugin.pluginName, plugin.featureTitle, plugin.description, plugin.participantName, plugin.appName].some(field => field.toLowerCase().includes(needle))
  })
  return (
    <section className="workshop-section" aria-labelledby="workshop-plugins">
      <div className="workshop-section-head">
        <div><p className="eyebrow">Plugin pool</p><h2 id="workshop-plugins">Every contribution,<br /><span className="spectrum-text">in one place.</span></h2></div>
        <p>Community plugins run inside the app once installed. They are community-maintained and not reviewed by ACRYL.</p>
      </div>
      <div className="workshop-filters">
        <label className="workshop-search">
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search plugins, authors, apps" aria-label="Search the plugin pool" />
        </label>
        {(['all', 'planned', 'tested', 'released', 'catalogued'] as const).map(value => (
          <button key={value} type="button" className={filter === value ? 'button small' : 'button secondary small'} onClick={() => setFilter(value)}>
            {value === 'all' ? 'All states' : `From ${PLUGIN_LABELS[value]}`}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="workshop-empty">No plugin matches that filter.</p>}
      <div className="workshop-plugin-pool">
        {shown.map(plugin => (
          <article className="workshop-plugin-card" key={plugin.id}>
            <header>
              <div><strong>{plugin.pluginName}</strong>{plugin.version !== '' && <span className="workshop-note-inline"> v{plugin.version}</span>}</div>
              <span className={`workshop-chip${plugin.frankensteinStatus === 'included' || plugin.frankensteinStatus === 'tested' ? ' accent' : ''}`}>{FRANKENSTEIN_LABELS[plugin.frankensteinStatus]}</span>
            </header>
            {plugin.featureTitle !== '' && <h3>{plugin.featureTitle}</h3>}
            {plugin.description !== '' && <p>{plugin.description}</p>}
            <p className="workshop-note-inline">by {plugin.participantName}{plugin.appName !== '' ? ` for ${plugin.appName}` : ''}</p>
            <div className="workshop-chips">
              <span className="workshop-chip accent">{PLUGIN_LABELS[plugin.lifecycle]}</span>
              <span className="workshop-chip">{PUBLICATION_LABELS[plugin.publicationStatus]}</span>
              {plugin.routePrefix !== '' && <span className="workshop-chip"><code>{plugin.routePrefix}</code></span>}
              {plugin.requires.length > 0 && <span className="workshop-chip">requires {plugin.requires.join(', ')}</span>}
              {plugin.provides.length > 0 && <span className="workshop-chip">provides {plugin.provides.join(', ')}</span>}
            </div>
            {plugin.frankensteinStatus === 'blocked' && plugin.frankensteinBlockReason !== '' && <p className="workshop-error">Not in the collective app: {plugin.frankensteinBlockReason}</p>}
            <div className="workshop-card-links">
              {plugin.repositoryUrl !== '' && <a href={plugin.repositoryUrl} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> source</a>}
              {plugin.releaseUrl !== '' && <a href={plugin.releaseUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> release</a>}
              {plugin.registryUrl !== '' && <a href={plugin.registryUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> registry</a>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Gallery({ projects, plugins }: { readonly projects: readonly BoardEntry[]; readonly plugins: readonly PublicPlugin[] }) {
  const [filter, setFilter] = useState<'all' | 'published' | 'featured'>('all')
  const shown = projects.filter(project => {
    if (filter === 'featured') return project.featured
    if (filter === 'published') {
      const status = PROJECT_LIFECYCLE.indexOf(project.status)
      return status >= PROJECT_LIFECYCLE.indexOf('published') || project.publicationStatus === 'released' || project.publicationStatus === 'indexing_pending' || project.publicationStatus === 'catalogued'
    }
    return true
  }).sort((left, right) => PROJECT_LIFECYCLE.indexOf(right.status) - PROJECT_LIFECYCLE.indexOf(left.status))
  return (
    <section className="workshop-section" aria-labelledby="workshop-gallery">
      <div className="workshop-section-head">
        <div><p className="eyebrow">App gallery</p><h2 id="workshop-gallery">The applications<br /><span className="spectrum-text">of the room.</span></h2></div>
        <p>Published links are the participants' own. A registry link appears only after the hourly discovery has catalogued the app.</p>
      </div>
      <div className="workshop-filters">
        {([['all', 'All projects'], ['published', 'Published'], ['featured', 'Featured']] as const).map(([value, label]) => (
          <button key={value} type="button" className={filter === value ? 'button small' : 'button secondary small'} onClick={() => setFilter(value)}>{label}</button>
        ))}
      </div>
      {shown.length === 0 && <p className="workshop-empty">No project matches that filter yet.</p>}
      <div className="workshop-gallery">
        {shown.map(project => {
          const contributions = plugins.filter(plugin => plugin.projectId === project.projectId)
          return (
            <article className="workshop-gallery-card" key={project.projectId}>
              <header>
                <span className="workshop-chip accent">{PROJECT_LABELS[project.status]}</span>
                <span className="workshop-chip">{project.profile === 'full' ? 'Full profile' : 'Core profile'}</span>
              </header>
              <h3>{project.appName}</h3>
              <p className="workshop-note-inline">by {project.participantName}</p>
              <p>{project.description}</p>
              <p className="workshop-note-inline">{project.sourceMode === 'catalogue_blueprint' && project.blueprintId !== '' ? `From ${project.blueprintId}` : project.sourceMode === 'custom_idea' ? 'Own idea' : 'From the idea pool'} · {contributions.length} plugin{contributions.length === 1 ? '' : 's'}</p>
              {project.publicationStatus === 'indexing_pending' && <p className="workshop-ok">Published - indexing pending</p>}
              <div className="workshop-card-links">
                {project.repositoryUrl !== '' && <a href={project.repositoryUrl} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> repository</a>}
                {project.blendsRegistryUrl !== '' && <a href={project.blendsRegistryUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> catalogue</a>}
                {project.demoUrl !== '' && <a href={project.demoUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> demo</a>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Frankenstein({ event, plugins, revealed }: { readonly event: WorkshopEvent; readonly plugins: readonly PublicPlugin[]; readonly revealed: boolean }) {
  const record = event.frankenstein
  const opted = plugins.filter(plugin => plugin.frankensteinStatus !== 'not_opted_in')
  return (
    <section className="workshop-section" aria-labelledby="workshop-frankenstein">
      <div className="workshop-section-head">
        <div><p className="eyebrow">Frankenstein App</p><h2 id="workshop-frankenstein">One app<br /><span className="spectrum-text">from the room's plugins.</span></h2></div>
        <p>A curated composition, not a blind execution. The facilitator mounts only opted-in, reviewed plugins in a separate test environment without production secrets.</p>
      </div>
      <div className="workshop-frankenstein-card">
        <h3>{record.name}</h3>
        <p>{record.description}</p>
        <div className="workshop-chips">
          {record.version !== '' && <span className="workshop-chip">v{record.version}</span>}
          {record.lastTestedAt !== '' && <span className="workshop-chip">last tested {record.lastTestedAt}</span>}
          {record.repositoryUrl !== '' && <a className="workshop-chip" href={record.repositoryUrl} target="_blank" rel="noreferrer"><Github aria-hidden="true" /> repository</a>}
          {record.demoUrl !== '' && <a className="workshop-chip" href={record.demoUrl} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /> demo</a>}
        </div>
        {record.notes !== '' && <p className="workshop-note-inline">{record.notes}</p>}
      </div>
      {!revealed && <p className="workshop-note">Contributions appear after the reveal.</p>}
      {revealed && opted.length === 0 && <p className="workshop-empty">No plugin has opted in yet.</p>}
      {revealed && opted.length > 0 && (
        <div className="workshop-board">
          {opted.map(plugin => (
            <article className="workshop-plugin-card" key={plugin.id}>
              <header>
                <div><strong>{plugin.pluginName}</strong><span className="workshop-note-inline"> by {plugin.participantName}</span></div>
                <span className={`workshop-chip${plugin.frankensteinStatus === 'included' || plugin.frankensteinStatus === 'tested' ? ' accent' : ''}`}>{FRANKENSTEIN_LABELS[plugin.frankensteinStatus]}</span>
              </header>
              {plugin.description !== '' && <p>{plugin.description}</p>}
              {plugin.frankensteinStatus === 'blocked' && plugin.frankensteinBlockReason !== '' && <p className="workshop-error">Reason: {plugin.frankensteinBlockReason}</p>}
              <p className="workshop-note-inline">It stays in the Plugin Pool; a plugin is never dropped silently.</p>
            </article>
          ))}
        </div>
      )}
      <p className="workshop-note">Community plugin code is untrusted until reviewed. This site stores metadata and links only; it never pulls, installs or executes participant code.</p>
    </section>
  )
}
