import { Download, Loader2, LogOut, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  adminExport, adminListPendingIdeas, adminListPlugins, adminListProjects, adminLogin, adminPatchEvent, adminSetIdeaStatus, adminSetPluginFrankenstein, adminSetProjectFeatured,
  forgetAdminToken, parseDate, storedAdminToken, FRANKENSTEIN_LABELS, FRANKENSTEIN_STATUS, PHASES,
  type AdminPlugin, type AdminProject, type BoardEntry, type FrankensteinRecord, type FrankensteinStatus, type Idea, type Phase, type PublicPlugin, type WorkshopEvent,
} from '../../lib/workshop'

interface FacilitatorPanelProps {
  readonly event: WorkshopEvent
  readonly ideas: readonly Idea[]
  readonly board: readonly BoardEntry[]
  readonly plugins: readonly PublicPlugin[]
  readonly onChanged: () => void
}

type Notice = { readonly kind: 'ok' | 'error'; readonly text: string } | undefined

function toLocalInput(value: string): string {
  const date = parseDate(value)
  if (date === undefined) return ''
  const pad = (part: number): string => String(part).padStart(2, '0')
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIso(local: string): string {
  return local === '' ? '' : new Date(local).toISOString()
}

export function FacilitatorPanel({ event, ideas, board, plugins, onChanged }: FacilitatorPanelProps) {
  const [token, setToken] = useState<string | undefined>(storedAdminToken)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice>()
  const [pending, setPending] = useState<readonly Idea[]>([])
  const [adminProjects, setAdminProjects] = useState<readonly AdminProject[]>([])
  const [adminPlugins, setAdminPlugins] = useState<readonly AdminPlugin[]>([])
  const [phase, setPhase] = useState<Phase>(event.phase)
  const [registrationOpen, setRegistrationOpen] = useState(event.registrationOpen)
  const [revealAt, setRevealAt] = useState(toLocalInput(event.revealAt))
  const [frankenstein, setFrankenstein] = useState<FrankensteinRecord>(event.frankenstein)

  const boardEntryOf = (publicId: string): BoardEntry | undefined => board.find(entry => entry.projectId === publicId)

  const fail = (reason: unknown): void => {
    const message = reason instanceof Error ? reason.message : 'The action failed.'
    if (reason instanceof Error && 'status' in reason && (reason.status === 401 || reason.status === 403)) {
      forgetAdminToken()
      setToken(undefined)
      setNotice({ kind: 'error', text: 'The facilitator session expired. Sign in again.' })
      return
    }
    setNotice({ kind: 'error', text: message })
  }

  const loadAdmin = async (current: string): Promise<void> => {
    try {
      const [ideas, projects, pluginRows] = await Promise.all([adminListPendingIdeas(current), adminListProjects(current), adminListPlugins(current)])
      setPending(ideas)
      setAdminProjects(projects)
      setAdminPlugins(pluginRows)
    } catch (reason) { fail(reason) }
  }

  useEffect(() => {
    const stored = storedAdminToken()
    if (stored !== undefined) { setToken(stored); void loadAdmin(stored) }
  }, [])

  const signIn = async (): Promise<void> => {
    setBusy(true)
    setNotice(undefined)
    try {
      const next = await adminLogin(email.trim(), password)
      setToken(next)
      setPassword('')
      await loadAdmin(next)
      setNotice({ kind: 'ok', text: 'Signed in as facilitator.' })
    } catch (reason) {
      fail(reason)
    } finally {
      setBusy(false)
    }
  }

  const run = async (action: () => Promise<void>, done: string): Promise<void> => {
    setBusy(true)
    setNotice(undefined)
    try {
      await action()
      setNotice({ kind: 'ok', text: done })
      onChanged()
    } catch (reason) {
      fail(reason)
    } finally {
      setBusy(false)
    }
  }

  const saveEvent = (): Promise<void> => run(async () => {
    if (token === undefined) throw new Error('Sign in first.')
    await adminPatchEvent(token, event.id, { phase, registrationOpen, revealAt: toIso(revealAt) })
  }, 'Workshop settings are saved.')

  const revealNow = (): Promise<void> => run(async () => {
    if (token === undefined) throw new Error('Sign in first.')
    await adminPatchEvent(token, event.id, { revealed: true })
  }, 'The participant board is revealed.')

  const hideBoard = (): Promise<void> => run(async () => {
    if (token === undefined) throw new Error('Sign in first.')
    await adminPatchEvent(token, event.id, { revealed: false, revealAt: '' })
    setRevealAt('')
  }, 'The board is hidden again.')

  const saveFrankenstein = (): Promise<void> => run(async () => {
    if (token === undefined) throw new Error('Sign in first.')
    await adminPatchEvent(token, event.id, { frankenstein })
  }, 'The Frankenstein record is saved.')

  const download = async (): Promise<void> => {
    if (token === undefined) return
    try {
      const report = await adminExport(token)
      const url = URL.createObjectURL(new Blob([report], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'workshop-report.json'
      link.click()
      URL.revokeObjectURL(url)
      setNotice({ kind: 'ok', text: 'The report is downloaded.' })
    } catch (reason) {
      fail(reason)
    }
  }

  return (
    <details className="workshop-admin" id="facilitator">
      <summary><ShieldCheck aria-hidden="true" /> Facilitator controls <span className="workshop-note-inline">for the workshop team</span></summary>

      {token === undefined ? (
        <form className="workshop-form" onSubmit={input => { input.preventDefault(); void signIn() }}>
          <p className="workshop-note-inline">Sign in with the workshop server account. Every action is checked by the database, not by this page.</p>
          <div className="workshop-fields two">
            <label className="workshop-field"><span>Email</span><input type="email" autoComplete="username" required value={email} onChange={input => setEmail(input.target.value)} /></label>
            <label className="workshop-field"><span>Password</span><input type="password" autoComplete="current-password" required value={password} onChange={input => setPassword(input.target.value)} /></label>
          </div>
          {notice !== undefined && <p className={notice.kind === 'error' ? 'workshop-error' : 'workshop-ok'} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
          <button type="submit" className="button small" disabled={busy}>{busy ? 'Signing in' : 'Sign in'}</button>
        </form>
      ) : (
        <div className="workshop-admin-body">
          <p className="workshop-ok" role="status"><ShieldCheck aria-hidden="true" /> Signed in. <button type="button" className="workshop-link-button" onClick={() => { forgetAdminToken(); setToken(undefined); setPending([]) }}><LogOut aria-hidden="true" /> Sign out</button></p>

          <fieldset className="workshop-admin-block">
            <legend>Workshop</legend>
            <div className="workshop-fields two">
              <label className="workshop-field"><span>Phase</span><select value={phase} onChange={input => setPhase(input.target.value as Phase)}>{PHASES.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="workshop-field"><span>Registration</span><select value={registrationOpen ? 'open' : 'closed'} onChange={input => setRegistrationOpen(input.target.value === 'open')}><option value="open">Open</option><option value="closed">Closed</option></select></label>
              <label className="workshop-field"><span>Reveal at (browser time zone)</span><input type="datetime-local" value={revealAt} onChange={input => setRevealAt(input.target.value)} /></label>
            </div>
            <div className="workshop-aside-actions">
              <button type="button" className="button small" disabled={busy} onClick={() => void saveEvent()}>Save workshop</button>
              <button type="button" className="button secondary small" disabled={busy} onClick={() => void revealNow()}>Reveal now</button>
              <button type="button" className="button secondary small" disabled={busy} onClick={() => void hideBoard()}>Hide board</button>
              <button type="button" className="button secondary small" disabled={busy} onClick={() => void download()}><Download aria-hidden="true" /> Export JSON</button>
            </div>
            <p className="workshop-note-inline">Board now: {event.revealed || event.revealAt !== '' ? 'auto after the reveal time, or when revealed now' : 'hidden'}. Currently {event.revealed ? 'revealed' : 'not revealed'}.</p>
          </fieldset>

          <fieldset className="workshop-admin-block">
            <legend>Pending ideas ({pending.length})</legend>
            {pending.length === 0 && <p className="workshop-note-inline">No participant suggestions are waiting.</p>}
            {pending.map(idea => (
              <div className="workshop-admin-row" key={idea.id}>
                <div><strong>{idea.title}</strong><p>{idea.pitch}</p></div>
                <div className="workshop-aside-actions">
                  <button type="button" className="button small" disabled={busy} onClick={() => void run(async () => { if (token === undefined) throw new Error('Sign in first.'); await adminSetIdeaStatus(token, idea.id, 'approved'); await loadAdmin(token) }, 'The idea is approved.')}>Approve</button>
                  <button type="button" className="button secondary small" disabled={busy} onClick={() => void run(async () => { if (token === undefined) throw new Error('Sign in first.'); await adminSetIdeaStatus(token, idea.id, 'rejected'); await loadAdmin(token) }, 'The idea is rejected.')}>Reject</button>
                </div>
              </div>
            ))}
          </fieldset>

          <fieldset className="workshop-admin-block">
            <legend>Featured projects</legend>
            {adminProjects.map(project => {
              const board = boardEntryOf(project.publicId)
              return (
                <label className="workshop-admin-row" key={project.id}>
                  <span><strong>{project.appName}</strong> by {board?.participantName ?? 'a participant who is not public'}</span>
                  <input type="checkbox" checked={project.featured} disabled={busy} onChange={input => void run(async () => { if (token === undefined) throw new Error('Sign in first.'); await adminSetProjectFeatured(token, project.id, input.target.checked); await loadAdmin(token) }, input.target.checked ? 'The project is featured.' : 'The project is no longer featured.')} />
                </label>
              )
            })}
          </fieldset>

          <fieldset className="workshop-admin-block">
            <legend>Plugin review for Frankenstein</legend>
            {adminPlugins.length === 0 && <p className="workshop-note-inline">No plugin has been added yet.</p>}
            {adminPlugins.map(plugin => {
              const published = plugins.find(entry => entry.id === plugin.publicId)
              return (
                <div className="workshop-admin-row" key={plugin.id}>
                  <div>
                    <strong>{plugin.pluginName}</strong>
                    <p>{published?.participantName ?? 'a participant who is not public'} - {plugin.featureTitle || 'no feature title'}</p>
                    {plugin.frankensteinBlockReason !== '' && <p className="workshop-error">Reason: {plugin.frankensteinBlockReason}</p>}
                  </div>
                  <div className="workshop-aside-actions">
                    <select defaultValue={plugin.frankensteinStatus} disabled={busy} aria-label={`Frankenstein status of ${plugin.pluginName}`} onChange={input => void run(async () => { if (token === undefined) throw new Error('Sign in first.'); await adminSetPluginFrankenstein(token, plugin.id, input.target.value as FrankensteinStatus, ''); await loadAdmin(token) }, 'The compatibility state is saved.')}>
                      {FRANKENSTEIN_STATUS.map(status => <option key={status} value={status}>{FRANKENSTEIN_LABELS[status]}</option>)}
                    </select>
                    <input placeholder="Block reason" defaultValue={plugin.frankensteinBlockReason} disabled={busy} aria-label={`Block reason for ${plugin.pluginName}`} onKeyDown={input => { if (input.key === 'Enter') { input.preventDefault(); const reason = input.currentTarget.value; void run(async () => { if (token === undefined) throw new Error('Sign in first.'); await adminSetPluginFrankenstein(token, plugin.id, 'blocked', reason); await loadAdmin(token) }, 'The plugin is blocked with a reason.') } }} />
                  </div>
                </div>
              )
            })}
          </fieldset>

          <fieldset className="workshop-admin-block">
            <legend>The collective app</legend>
            <div className="workshop-fields two">
              <label className="workshop-field"><span>Name</span><input value={frankenstein.name} onChange={input => setFrankenstein(value => ({ ...value, name: input.target.value }))} /></label>
              <label className="workshop-field"><span>Version</span><input value={frankenstein.version} onChange={input => setFrankenstein(value => ({ ...value, version: input.target.value }))} /></label>
              <label className="workshop-field"><span>Repository</span><input value={frankenstein.repositoryUrl} onChange={input => setFrankenstein(value => ({ ...value, repositoryUrl: input.target.value }))} /></label>
              <label className="workshop-field"><span>Demo</span><input value={frankenstein.demoUrl} onChange={input => setFrankenstein(value => ({ ...value, demoUrl: input.target.value }))} /></label>
              <label className="workshop-field"><span>Last successful test</span><input value={frankenstein.lastTestedAt} onChange={input => setFrankenstein(value => ({ ...value, lastTestedAt: input.target.value }))} /></label>
            </div>
            <label className="workshop-field"><span>Description</span><textarea rows={2} value={frankenstein.description} onChange={input => setFrankenstein(value => ({ ...value, description: input.target.value }))} /></label>
            <label className="workshop-field"><span>Notes</span><textarea rows={2} value={frankenstein.notes} onChange={input => setFrankenstein(value => ({ ...value, notes: input.target.value }))} /></label>
            <button type="button" className="button small" disabled={busy} onClick={() => void saveFrankenstein()}>Save collective app</button>
          </fieldset>

          {notice !== undefined && <p className={notice.kind === 'error' ? 'workshop-error' : 'workshop-ok'} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
          {busy && <p className="workshop-note-inline" role="status"><Loader2 className="spin" aria-hidden="true" /> Working...</p>}
          <p className="workshop-note-inline">Ideas in the pool: {ideas.length}. Public plugins are the consented ones; the database never shows a participant who opted out.</p>
        </div>
      )}
    </details>
  )
}
