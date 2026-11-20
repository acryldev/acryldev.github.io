import { Check, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CopyLine } from '../CopyLine'
import {
  deletePlugin, loadMine, PLUGIN_LABELS, PLUGIN_LIFECYCLE, PROJECT_LABELS, PROJECT_LIFECYCLE, PUBLICATION, PUBLICATION_LABELS,
  registerParticipant, parseServiceList, savePlugin, saveProject, updateParticipant, validateParticipant, validatePlugin, validateProject,
  type CatalogueEntry, type Credentials, type Idea, type MyPlugin, type MyProject, type Participant, type PluginInput, type PluginStatus, type ProjectInput,
  type ProjectStatus, type PublicationStatus, type Session, type SourceMode, type WorkshopEvent,
} from '../../lib/workshop'

interface ProjectFormState {
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

interface PluginFormState {
  readonly pluginName: string
  readonly featureTitle: string
  readonly description: string
  readonly version: string
  readonly routePrefix: string
  readonly requires: string
  readonly provides: string
  readonly lifecycle: PluginStatus
  readonly publicationStatus: PublicationStatus
  readonly repositoryUrl: string
  readonly releaseUrl: string
  readonly registryUrl: string
  readonly frankensteinOptIn: boolean
}

const EMPTY_PROJECT: ProjectFormState = {
  sourceMode: 'idea_pool', idea: '', appName: '', description: '', targetUser: '', blueprintId: '', blueprintVersion: '',
  blueprintRuntime: '', blueprintOrigin: '', profile: 'core', status: 'registered', repositoryUrl: '', demoUrl: '',
  blendsRegistryUrl: '', publicationStatus: 'local',
}

const EMPTY_PLUGIN: PluginFormState = {
  pluginName: '', featureTitle: '', description: '', version: '', routePrefix: '', requires: '', provides: '',
  lifecycle: 'planned', publicationStatus: 'local', repositoryUrl: '', releaseUrl: '', registryUrl: '', frankensteinOptIn: false,
}

function projectStateOf(project: MyProject | undefined): ProjectFormState {
  return project === undefined ? EMPTY_PROJECT : {
    sourceMode: project.sourceMode,
    idea: project.idea,
    appName: project.appName,
    description: project.description,
    targetUser: project.targetUser,
    blueprintId: project.blueprintId,
    blueprintVersion: project.blueprintVersion,
    blueprintRuntime: project.blueprintRuntime,
    blueprintOrigin: project.blueprintOrigin,
    profile: project.profile,
    status: project.status,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    blendsRegistryUrl: project.blendsRegistryUrl,
    publicationStatus: project.publicationStatus,
  }
}

function pluginStateOf(plugin: MyPlugin): PluginFormState {
  return {
    pluginName: plugin.pluginName,
    featureTitle: plugin.featureTitle,
    description: plugin.description,
    version: plugin.version,
    routePrefix: plugin.routePrefix,
    requires: plugin.requires.join(', '),
    provides: plugin.provides.join(', '),
    lifecycle: plugin.lifecycle,
    publicationStatus: plugin.publicationStatus,
    repositoryUrl: plugin.repositoryUrl,
    releaseUrl: plugin.releaseUrl,
    registryUrl: plugin.registryUrl,
    frankensteinOptIn: plugin.frankensteinOptIn,
  }
}

function inputOf(form: ProjectFormState): ProjectInput {
  return {
    sourceMode: form.sourceMode,
    idea: form.sourceMode === 'idea_pool' ? form.idea : '',
    appName: form.appName,
    description: form.description,
    targetUser: form.targetUser,
    blueprintId: form.sourceMode === 'catalogue_blueprint' ? form.blueprintId : '',
    blueprintVersion: form.sourceMode === 'catalogue_blueprint' ? form.blueprintVersion : '',
    blueprintRuntime: form.sourceMode === 'catalogue_blueprint' ? form.blueprintRuntime : '',
    blueprintOrigin: form.sourceMode === 'catalogue_blueprint' ? form.blueprintOrigin : '',
    profile: form.profile,
    status: form.status,
    repositoryUrl: form.repositoryUrl,
    demoUrl: form.demoUrl,
    blendsRegistryUrl: form.blendsRegistryUrl,
    publicationStatus: form.publicationStatus,
  }
}

function pluginInputOf(form: PluginFormState): PluginInput {
  return {
    pluginName: form.pluginName,
    featureTitle: form.featureTitle,
    description: form.description,
    version: form.version,
    routePrefix: form.routePrefix,
    requires: parseServiceList(form.requires),
    provides: parseServiceList(form.provides),
    lifecycle: form.lifecycle,
    publicationStatus: form.publicationStatus,
    repositoryUrl: form.repositoryUrl,
    releaseUrl: form.releaseUrl,
    registryUrl: form.registryUrl,
    frankensteinOptIn: form.frankensteinOptIn,
  }
}

type Notice = { readonly kind: 'ok' | 'error'; readonly text: string } | undefined

export interface ParticipantPanelProps {
  readonly event: WorkshopEvent
  readonly ideas: readonly Idea[]
  readonly session: Session | undefined
  readonly pickedBlueprint: CatalogueEntry | undefined
  readonly pickedIdea: string | undefined
  readonly onRegistered: (session: Session, credentials: Credentials) => void
  readonly onPickedConsumed: () => void
  readonly onIdeaConsumed: () => void
  readonly onParticipantUpdated: (participant: Participant) => void
  readonly onForget: () => void
  readonly onPublicChanged: () => void
}

export function ParticipantPanel(props: ParticipantPanelProps) {
  const { event, ideas, session, pickedBlueprint, pickedIdea, onRegistered, onPickedConsumed, onIdeaConsumed, onParticipantUpdated, onForget, onPublicChanged } = props
  const [mine, setMine] = useState<{ project?: MyProject; plugins: readonly MyPlugin[] }>()
  const [mineError, setMineError] = useState<string>()
  const [version, setVersion] = useState(0)
  const [projectForm, setProjectForm] = useState<ProjectFormState>(EMPTY_PROJECT)
  const [projectNotice, setProjectNotice] = useState<Notice>()
  const [savingProject, setSavingProject] = useState(false)

  useEffect(() => {
    if (session === undefined) { setMine(undefined); return undefined }
    let live = true
    setMineError(undefined)
    loadMine(session)
      .then(result => { if (live) setMine(result) })
      .catch(reason => { if (live) setMineError(reason instanceof Error ? reason.message : 'Your project did not load.') })
    return () => { live = false }
  }, [session, version])

  useEffect(() => { setProjectForm(projectStateOf(mine?.project)) }, [mine?.project?.id, mine?.project?.updated])

  useEffect(() => {
    if (pickedBlueprint === undefined) return
    setProjectForm(form => ({
      ...form,
      sourceMode: 'catalogue_blueprint',
      blueprintId: pickedBlueprint.id,
      blueprintVersion: pickedBlueprint.version,
      blueprintRuntime: pickedBlueprint.runtime === 'other' ? '' : pickedBlueprint.runtime,
      blueprintOrigin: pickedBlueprint.origin ?? '',
      appName: form.appName === '' ? pickedBlueprint.name : form.appName,
    }))
    setProjectNotice({ kind: 'ok', text: `Blueprint ${pickedBlueprint.name} is selected. Save your project to keep it.` })
    onPickedConsumed()
  }, [pickedBlueprint, onPickedConsumed])

  useEffect(() => {
    if (pickedIdea === undefined || pickedIdea === '') return
    setProjectForm(form => ({ ...form, sourceMode: 'idea_pool', idea: pickedIdea }))
    setProjectNotice({ kind: 'ok', text: 'The idea is selected. Save your project to keep it.' })
    onIdeaConsumed()
  }, [pickedIdea, onIdeaConsumed])

  if (session === undefined) return <RegistrationForm event={event} onRegistered={onRegistered} />
  if (mine === undefined && mineError === undefined) return <p className="workshop-note" role="status">Loading your project...</p>
  if (mineError !== undefined) {
    return (
      <div className="workshop-note" role="alert">
        <p>{mineError}</p>
        <button type="button" className="button secondary small" onClick={() => setVersion(value => value + 1)}>Try again</button>
      </div>
    )
  }

  const project = mine?.project
  const setProject = (patch: Partial<ProjectFormState>): void => setProjectForm(form => ({ ...form, ...patch }))

  const submitProject = async (): Promise<void> => {
    const input = inputOf(projectForm)
    const invalid = validateProject(input)
    if (invalid !== undefined) { setProjectNotice({ kind: 'error', text: invalid }); return }
    if (input.sourceMode === 'idea_pool' && input.idea === '') { setProjectNotice({ kind: 'error', text: 'Pick an idea from the pool, or choose another starting path.' }); return }
    if (input.sourceMode === 'catalogue_blueprint' && input.blueprintId === '') { setProjectNotice({ kind: 'error', text: 'Pick a Blueprint in the Blueprints tab first.' }); return }
    setSavingProject(true)
    try {
      await saveProject(session, project, input)
      setProjectNotice({ kind: 'ok', text: 'Your project is saved.' })
      setVersion(value => value + 1)
      onPublicChanged()
    } catch (reason) {
      setProjectNotice({ kind: 'error', text: reason instanceof Error ? reason.message : 'The project was not saved.' })
    } finally {
      setSavingProject(false)
    }
  }

  const addPlugin = async (form: PluginFormState): Promise<void> => {
    if (project === undefined) throw new Error('Save your project before adding a plugin.')
    const input = pluginInputOf(form)
    const invalid = validatePlugin(input)
    if (invalid !== undefined) throw new Error(invalid)
    await savePlugin(session, project.id, undefined, input)
    setVersion(value => value + 1)
    onPublicChanged()
  }

  const updatePlugin = async (plugin: MyPlugin, form: PluginFormState): Promise<void> => {
    if (project === undefined) throw new Error('Save your project before adding a plugin.')
    const input = pluginInputOf(form)
    const invalid = validatePlugin(input)
    if (invalid !== undefined) throw new Error(invalid)
    await savePlugin(session, project.id, plugin, input)
    setVersion(value => value + 1)
    onPublicChanged()
  }

  const removePlugin = async (plugin: MyPlugin): Promise<void> => {
    if (!window.confirm(`Remove the plugin ${plugin.pluginName}? Its record and links disappear from the plugin pool.`)) return
    await deletePlugin(session, plugin.id)
    setVersion(value => value + 1)
    onPublicChanged()
  }

  return (
    <section className="workshop-section" aria-labelledby="workshop-mine">
      <div className="workshop-section-head">
        <div>
          <p className="eyebrow">My project</p>
          <h2 id="workshop-mine">{session.participant.name}</h2>
        </div>
        <p>Everything you type here is yours. The public board only shows what you chose to publish, and your generated sign-in email is never shown.</p>
      </div>

      <div className="workshop-mine-grid">
        <div>
          <h3 className="workshop-subhead">The application</h3>
          <fieldset className="workshop-choice">
            <legend>Starting path</legend>
            {([['idea_pool', 'Idea pool'], ['custom_idea', 'Own idea'], ['catalogue_blueprint', 'Catalogue Blueprint']] as const).map(([value, label]) => (
              <label key={value}>
                <input type="radio" name="sourceMode" checked={projectForm.sourceMode === value} onChange={() => setProject({ sourceMode: value })} />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>

          {projectForm.sourceMode === 'idea_pool' && (
            <label className="workshop-field">
              <span>Idea</span>
              <select aria-label="Idea" value={projectForm.idea} onChange={event => setProject({ idea: event.target.value })}>
                <option value="">Pick an idea</option>
                {ideas.map(idea => <option key={idea.id} value={idea.id}>{idea.title}</option>)}
              </select>
            </label>
          )}
          {projectForm.sourceMode === 'custom_idea' && (
            <p className="workshop-note-inline">Submit your topic in the Idea pool tab. Once approved it appears there, and your project is listed as an own idea.</p>
          )}
          {projectForm.sourceMode === 'catalogue_blueprint' && (
            <div className="workshop-picked">
              {projectForm.blueprintId === ''
                ? <p className="workshop-note-inline">Pick a Blueprint in the Blueprints tab.</p>
                : <>
                    <p><strong>{projectForm.blueprintId}</strong> v{projectForm.blueprintVersion}</p>
                    <p className="workshop-note-inline">{projectForm.blueprintRuntime === 'acrylblends' ? 'Standalone ACRYL Blends app' : projectForm.blueprintRuntime === 'acryl' ? 'Starter for the ACRYL app' : 'Runtime not recorded'}{projectForm.blueprintOrigin === 'community' ? ' - Community Blueprint' : ''}</p>
                    <button type="button" className="button secondary small" onClick={() => setProject({ blueprintId: '', blueprintVersion: '', blueprintRuntime: '', blueprintOrigin: '' })}>Clear</button>
                  </>}
            </div>
          )}

          <div className="workshop-fields">
            <label className="workshop-field">
              <span>App name</span>
              <input value={projectForm.appName} maxLength={80} onChange={event => setProject({ appName: event.target.value })} placeholder="What are you building?" />
            </label>
            <label className="workshop-field">
              <span>Who is it for, and what problem does it solve?</span>
              <input value={projectForm.targetUser} maxLength={300} onChange={event => setProject({ targetUser: event.target.value })} />
            </label>
            <label className="workshop-field">
              <span>One-paragraph description</span>
              <textarea value={projectForm.description} maxLength={800} rows={3} onChange={event => setProject({ description: event.target.value })} />
            </label>
            <label className="workshop-field">
              <span>Blend profile</span>
              <select value={projectForm.profile} onChange={event => setProject({ profile: event.target.value === 'full' ? 'full' : 'core' })}>
                <option value="core">Core: no embedded Agent Loop</option>
                <option value="full">Full: adds in-app agent capabilities</option>
              </select>
            </label>
            <label className="workshop-field">
              <span>Build progress</span>
              <select value={projectForm.status} onChange={event => setProject({ status: event.target.value as ProjectStatus })}>
                {PROJECT_LIFECYCLE.map(status => <option key={status} value={status}>{PROJECT_LABELS[status]}</option>)}
              </select>
            </label>
            <label className="workshop-field">
              <span>Publication state</span>
              <select value={projectForm.publicationStatus} onChange={event => setProject({ publicationStatus: event.target.value as PublicationStatus })}>
                {PUBLICATION.map(status => <option key={status} value={status}>{PUBLICATION_LABELS[status]}</option>)}
              </select>
            </label>
            <label className="workshop-field">
              <span>App repository (GitHub)</span>
              <input type="url" value={projectForm.repositoryUrl} onChange={event => setProject({ repositoryUrl: event.target.value })} placeholder="https://github.com/you/app" />
            </label>
            <label className="workshop-field">
              <span>Blends catalogue link (once indexed)</span>
              <input type="url" value={projectForm.blendsRegistryUrl} onChange={event => setProject({ blendsRegistryUrl: event.target.value })} placeholder="https://acrylblends.github.io/blends/b/..." />
            </label>
            <label className="workshop-field">
              <span>Demo link</span>
              <input type="url" value={projectForm.demoUrl} onChange={event => setProject({ demoUrl: event.target.value })} placeholder="https://..." />
            </label>
          </div>
          {projectNotice !== undefined && <p className={projectNotice.kind === 'error' ? 'workshop-error' : 'workshop-ok'} role={projectNotice.kind === 'error' ? 'alert' : 'status'}>{projectNotice.text}</p>}
          <button type="button" className="button" disabled={savingProject} onClick={() => void submitProject()}>
            {savingProject ? <><Loader2 className="spin" aria-hidden="true" /> Saving</> : project === undefined ? 'Create my project' : 'Save my project'}
          </button>
        </div>

        <aside>
          <ParticipantSettings participant={session.participant} session={session} onUpdated={onParticipantUpdated} onForget={onForget} />
          <PublishHelp />
        </aside>
      </div>

      <h3 className="workshop-subhead">Plugin contributions</h3>
      <p className="workshop-note-inline">Each feature is one independently understandable Cordis Plugin. One showcase plugin is required; a second for your own app is encouraged.</p>
      {project === undefined && <p className="workshop-note">Create your project first, then add plugins to it.</p>}
      {mine?.plugins.map(plugin => (
        <details className="workshop-plugin-editor" key={`${plugin.id}-${plugin.lifecycle}-${plugin.version}`}>
          <summary>
            <strong>{plugin.pluginName}</strong>
            <span className="workshop-chip">{PLUGIN_LABELS[plugin.lifecycle]}</span>
            {plugin.frankensteinOptIn && <span className="workshop-chip accent">Frankenstein opt-in</span>}
          </summary>
          <PluginForm
            current={plugin}
            onSubmit={form => updatePlugin(plugin, form)}
            onDelete={() => removePlugin(plugin)}
          />
        </details>
      ))}
      {project !== undefined && (
        <details className="workshop-plugin-editor">
          <summary><strong>Add a plugin</strong></summary>
          <PluginForm current={undefined} onSubmit={addPlugin} />
        </details>
      )}
    </section>
  )
}

function RegistrationForm({ event, onRegistered }: { readonly event: WorkshopEvent; readonly onRegistered: (session: Session, credentials: Credentials) => void }) {
  const [name, setName] = useState('')
  const [githubLogin, setGithubLogin] = useState('')
  const [os, setOs] = useState('')
  const [consentPublic, setConsentPublic] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const first = useRef<HTMLInputElement>(null)

  useEffect(() => { first.current?.focus() }, [])

  if (!event.registrationOpen) {
    return (
      <section className="workshop-section" aria-labelledby="workshop-mine">
        <div className="workshop-section-head">
          <div><p className="eyebrow">My project</p><h2 id="workshop-mine">Registration is closed</h2></div>
        </div>
        <p className="workshop-note">The facilitator closed registration for this workshop. You can still read the public board, the idea pool and the plugin pool.</p>
      </section>
    )
  }

  const submit = async (): Promise<void> => {
    const invalid = validateParticipant({ name, githubLogin: githubLogin.trim(), os, consentPublic })
    if (invalid !== undefined) { setError(invalid); return }
    setBusy(true)
    setError(undefined)
    try {
      const result = await registerParticipant({ name, githubLogin: githubLogin.trim(), os, consentPublic })
      onRegistered(result.session, result.credentials)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The registration did not go through.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="workshop-section" aria-labelledby="workshop-mine">
      <div className="workshop-section-head">
        <div>
          <p className="eyebrow">My project</p>
          <h2 id="workshop-mine">Register<br /><span className="spectrum-text">for the room.</span></h2>
        </div>
        <p>A display name is all it takes. No password, no email, no account.</p>
      </div>
      <form className="workshop-form" onSubmit={input => { input.preventDefault(); void submit() }}>
        <label className="workshop-field">
          <span>Display name</span>
          <input ref={first} required minLength={2} maxLength={50} value={name} onChange={input => setName(input.target.value)} placeholder="How the room should see you" />
        </label>
        <label className="workshop-field">
          <span>GitHub login <em>optional</em></span>
          <input value={githubLogin} maxLength={39} onChange={input => setGithubLogin(input.target.value)} placeholder="your-login" />
        </label>
        <label className="workshop-field">
          <span>Operating system <em>optional</em></span>
          <select value={os} onChange={input => setOs(input.target.value)}>
            <option value="">Not saying</option>
            <option value="macos">macOS</option>
            <option value="windows">Windows</option>
            <option value="linux">Linux</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="workshop-consent">
          <input type="checkbox" checked={consentPublic} onChange={input => setConsentPublic(input.target.checked)} />
          <span>Show my display name, GitHub login and project on the public board. I can change this any time in My project.</span>
        </label>
        {error !== undefined && <p className="workshop-error" role="alert">{error}</p>}
        <button type="submit" className="button" disabled={busy}>{busy ? <><Loader2 className="spin" aria-hidden="true" /> Registering</> : 'Register'}</button>
      </form>
    </section>
  )
}

function ParticipantSettings({ participant, session, onUpdated, onForget }: {
  readonly participant: Participant
  readonly session: Session
  readonly onUpdated: (participant: Participant) => void
  readonly onForget: () => void
}) {
  const [consent, setConsent] = useState(participant.consentPublic)
  const [githubLogin, setGithubLogin] = useState(participant.githubLogin)
  const [notice, setNotice] = useState<Notice>()
  const [busy, setBusy] = useState(false)
  const save = async (): Promise<void> => {
    setBusy(true)
    try {
      const updated = await updateParticipant(session, { consentPublic: consent, githubLogin: githubLogin.trim() })
      onUpdated(updated)
      setNotice({ kind: 'ok', text: 'Your settings are saved.' })
    } catch (reason) {
      setNotice({ kind: 'error', text: reason instanceof Error ? reason.message : 'The settings were not saved.' })
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="workshop-aside-card">
      <h3>Public profile</h3>
      <label className="workshop-consent">
        <input type="checkbox" checked={consent} onChange={input => setConsent(input.target.checked)} />
        <span>Show me on the public board after the reveal</span>
      </label>
      <label className="workshop-field">
        <span>GitHub login</span>
        <input value={githubLogin} maxLength={39} onChange={input => setGithubLogin(input.target.value)} />
      </label>
      {notice !== undefined && <p className={notice.kind === 'error' ? 'workshop-error' : 'workshop-ok'} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
      <div className="workshop-aside-actions">
        <button type="button" className="button small" disabled={busy} onClick={() => void save()}>Save settings</button>
        <button type="button" className="button secondary small" onClick={onForget}>Use another identity</button>
      </div>
    </div>
  )
}

function PublishHelp() {
  return (
    <div className="workshop-aside-card">
      <h3>Publishing</h3>
      <p className="workshop-note-inline">The site never pushes code for you. Run these locally, then paste the links above.</p>
      <CopyLine command="npm run acryl -- plugin publish <plugin-name>" label="Copy the plugin publish command" />
      <CopyLine command="npm run share" label="Copy the app share command" />
      <p className="workshop-note-inline">Registry discovery runs hourly. Until your entry appears, keep <strong>Published - indexing pending</strong> selected. A publish command is not a catalogue entry.</p>
      <p className="workshop-note-inline">Community plugins and Blends are community-maintained and not reviewed by ACRYL.</p>
    </div>
  )
}

function PluginForm({ current, onSubmit, onDelete }: {
  readonly current: MyPlugin | undefined
  readonly onSubmit: (form: PluginFormState) => Promise<void>
  readonly onDelete?: () => Promise<void>
}) {
  const [form, setForm] = useState<PluginFormState>(current === undefined ? EMPTY_PLUGIN : pluginStateOf(current))
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice>()
  const set = (patch: Partial<PluginFormState>): void => setForm(value => ({ ...value, ...patch }))
  const submit = async (): Promise<void> => {
    setBusy(true)
    setNotice(undefined)
    try {
      await onSubmit(form)
      setNotice({ kind: 'ok', text: current === undefined ? 'The plugin is added.' : 'The plugin is saved.' })
      if (current === undefined) setForm(EMPTY_PLUGIN)
    } catch (reason) {
      setNotice({ kind: 'error', text: reason instanceof Error ? reason.message : 'The plugin was not saved.' })
    } finally {
      setBusy(false)
    }
  }
  const remove = async (): Promise<void> => {
    if (onDelete === undefined) return
    setBusy(true)
    try { await onDelete() } catch (reason) { setNotice({ kind: 'error', text: reason instanceof Error ? reason.message : 'The plugin was not removed.' }); setBusy(false) }
  }
  return (
    <form className="workshop-form" onSubmit={event => { event.preventDefault(); void submit() }}>
      <div className="workshop-fields two">
        <label className="workshop-field"><span>Plugin name</span><input required maxLength={60} value={form.pluginName} onChange={event => set({ pluginName: event.target.value })} placeholder="notes-board" /></label>
        <label className="workshop-field"><span>Feature title</span><input maxLength={80} value={form.featureTitle} onChange={event => set({ featureTitle: event.target.value })} placeholder="A board for quick notes" /></label>
        <label className="workshop-field"><span>Version</span><input maxLength={40} value={form.version} onChange={event => set({ version: event.target.value })} placeholder="0.1.0" /></label>
        <label className="workshop-field"><span>Route prefix</span><input maxLength={120} value={form.routePrefix} onChange={event => set({ routePrefix: event.target.value })} placeholder="/contributions/you/notes" /></label>
      </div>
      <label className="workshop-field"><span>Purpose</span><textarea rows={2} maxLength={600} value={form.description} onChange={event => set({ description: event.target.value })} /></label>
      <div className="workshop-fields two">
        <label className="workshop-field"><span>Requires services</span><input value={form.requires} onChange={event => set({ requires: event.target.value })} placeholder="router, database" /></label>
        <label className="workshop-field"><span>Provides services</span><input value={form.provides} onChange={event => set({ provides: event.target.value })} placeholder="notes" /></label>
        <label className="workshop-field"><span>Plugin state</span><select value={form.lifecycle} onChange={event => set({ lifecycle: event.target.value as PluginStatus })}>{PLUGIN_LIFECYCLE.map(status => <option key={status} value={status}>{PLUGIN_LABELS[status]}</option>)}</select></label>
        <label className="workshop-field"><span>Publication state</span><select value={form.publicationStatus} onChange={event => set({ publicationStatus: event.target.value as PublicationStatus })}>{PUBLICATION.map(status => <option key={status} value={status}>{PUBLICATION_LABELS[status]}</option>)}</select></label>
        <label className="workshop-field"><span>Repository</span><input type="url" value={form.repositoryUrl} onChange={event => set({ repositoryUrl: event.target.value })} placeholder="https://github.com/you/plugin" /></label>
        <label className="workshop-field"><span>Release</span><input type="url" value={form.releaseUrl} onChange={event => set({ releaseUrl: event.target.value })} placeholder="https://github.com/you/plugin/releases/tag/v0.1.0" /></label>
        <label className="workshop-field"><span>Registry entry</span><input type="url" value={form.registryUrl} onChange={event => set({ registryUrl: event.target.value })} placeholder="https://cordisplugins.github.io/..." /></label>
      </div>
      <label className="workshop-consent">
        <input type="checkbox" checked={form.frankensteinOptIn} onChange={event => set({ frankensteinOptIn: event.target.checked })} />
        <span>Offer this plugin to the Frankenstein App. The facilitator reviews it and runs it only in a separate test environment, never here.</span>
      </label>
      {notice !== undefined && <p className={notice.kind === 'error' ? 'workshop-error' : 'workshop-ok'} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
      <div className="workshop-aside-actions">
        <button type="submit" className="button small" disabled={busy}>{busy ? 'Saving' : current === undefined ? 'Add plugin' : 'Save plugin'}</button>
        {onDelete !== undefined && <button type="button" className="button secondary small" disabled={busy} onClick={() => void remove()}><Trash2 aria-hidden="true" /> Remove</button>}
        {current !== undefined && current.frankensteinOptIn && <span className="workshop-ok"><Check aria-hidden="true" /> Opted in</span>}
      </div>
    </form>
  )
}
