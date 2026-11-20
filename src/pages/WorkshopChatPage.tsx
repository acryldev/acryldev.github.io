import { ArrowLeft, Download, Loader2, Paperclip, Send, ShieldCheck, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  adminLogin, forgetAdminToken, forgetCredentials, formatDateTime, restoreSession, storedAdminToken, storedCredentials, WorkshopError, type Session,
} from '../lib/workshop'
import {
  fetchChatFile, isImageAttachment, linkify, loadChatMessages, sendChatMessage, validateChatDraft, watchChat,
  MAX_CHAT_FILE, type ChatMessage, type ChatStatus,
} from '../lib/workshop-chat'

type Notice = { readonly kind: 'ok' | 'error'; readonly text: string } | undefined

const STATUS_LABEL: Record<ChatStatus, string> = {
  connecting: 'Connecting',
  live: 'Live',
  polling: 'Refreshing',
  offline: 'Offline',
}

function mergeMessages(...lists: readonly (readonly ChatMessage[])[]): readonly ChatMessage[] {
  const byId = new Map<string, ChatMessage>()
  for (const list of lists) for (const message of list) byId.set(message.id, message)
  return [...byId.values()].sort((left, right) => left.created.localeCompare(right.created) || left.id.localeCompare(right.id))
}

function fileSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024).toString()} KB`
}

export function WorkshopChatPage() {
  const [session, setSession] = useState<Session>()
  const [adminToken, setAdminToken] = useState<string | undefined>(storedAdminToken)
  const [auth, setAuth] = useState<'loading' | 'ready' | 'guest'>('loading')
  const [authNotice, setAuthNotice] = useState<string>()
  const restored = useRef(false)
  const [messages, setMessages] = useState<readonly ChatMessage[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [status, setStatus] = useState<ChatStatus>('connecting')
  const [draft, setDraft] = useState('')
  const [file, setFile] = useState<File>()
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<Notice>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string>()
  const logRef = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const stick = useRef(true)
  const token = adminToken ?? session?.token
  const facilitator = adminToken !== undefined

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const credentials = storedCredentials()
    if (credentials === undefined) {
      setAuth(adminToken === undefined ? 'guest' : 'ready')
      return
    }
    restoreSession(credentials)
      .then(next => { setSession(next); setAuth('ready') })
      .catch(reason => {
        // A 429 or a network hiccup is not an invalid identity; keep the saved credentials for the next load.
        const invalid = reason instanceof WorkshopError && reason.status !== undefined && reason.status !== 429 && reason.status < 500
        if (invalid) forgetCredentials()
        else setAuthNotice('Your participant session could not be opened right now. Reload to try again.')
        setAuth(storedAdminToken() === undefined ? 'guest' : 'ready')
      })
  }, [])

  useEffect(() => {
    if (token === undefined) return undefined
    let live = true
    const controller = new AbortController()
    setStatus('connecting')
    loadChatMessages(token)
      .then(result => {
        if (!live) return
        setMessages(current => mergeMessages(result.messages, current))
        setTotal(result.totalItems)
      })
      .catch(reason => {
        if (live) setNotice({ kind: 'error', text: reason instanceof Error ? reason.message : 'The chat history did not load.' })
      })
    void watchChat({
      token,
      signal: controller.signal,
      onMessage: message => {
        if (!live) return
        setMessages(current => mergeMessages(current, [message]))
        setTotal(value => value + 1)
      },
      onReplace: list => {
        if (!live) return
        setMessages(current => mergeMessages(list, current))
        setTotal(value => Math.max(value, list.length))
      },
      onStatus: value => { if (live) setStatus(value) },
    })
    return () => { live = false; controller.abort() }
  }, [token])

  useEffect(() => {
    const element = logRef.current
    if (element !== null && stick.current) element.scrollTop = element.scrollHeight
  }, [messages])

  const scrollState = (): void => {
    const element = logRef.current
    if (element !== null) stick.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80
  }

  const send = async (): Promise<void> => {
    if (token === undefined || sending) return
    const invalid = validateChatDraft(draft, file)
    if (invalid !== undefined) { setNotice({ kind: 'error', text: invalid }); return }
    setSending(true)
    setNotice(undefined)
    try {
      const message = await sendChatMessage({
        token,
        ...(facilitator ? {} : { participant: session?.participant.id ?? '' }),
        authorName: facilitator ? 'Facilitator' : session?.participant.name ?? '',
        authorKind: facilitator ? 'facilitator' : 'participant',
        body: draft,
        ...(file === undefined ? {} : { file }),
      })
      setMessages(current => mergeMessages(current, [message]))
      setTotal(value => value + 1)
      setDraft('')
      setFile(undefined)
      stick.current = true
    } catch (reason) {
      setNotice({ kind: 'error', text: reason instanceof Error ? reason.message : 'The message was not sent.' })
    } finally {
      setSending(false)
    }
  }

  const older = async (): Promise<void> => {
    if (token === undefined || loadingOlder) return
    setLoadingOlder(true)
    try {
      const result = await loadChatMessages(token, page + 1)
      setMessages(current => mergeMessages(result.messages, current))
      setPage(value => value + 1)
    } catch (reason) {
      setNotice({ kind: 'error', text: reason instanceof Error ? reason.message : 'Older messages did not load.' })
    } finally {
      setLoadingOlder(false)
    }
  }

  const signIn = async (): Promise<void> => {
    setSigningIn(true)
    setSignInError(undefined)
    try {
      const next = await adminLogin(email.trim(), password)
      setAdminToken(next)
      setPassword('')
      setAuth('ready')
    } catch (reason) {
      setSignInError(reason instanceof Error ? reason.message : 'The facilitator sign-in failed.')
    } finally {
      setSigningIn(false)
    }
  }

  const signOutFacilitator = (): void => {
    forgetAdminToken()
    setAdminToken(undefined)
    setAuth(session === undefined ? 'guest' : 'ready')
  }

  if (auth === 'loading') {
    return <div className="workshop-chat-page page-width"><p className="workshop-note" role="status"><Loader2 className="spin" aria-hidden="true" /> Opening the room chat...</p></div>
  }

  return (
    <div className="workshop-chat-page page-width">
      <Link className="back-link" to="/workshoppanel"><ArrowLeft aria-hidden="true" /> Workshop panel</Link>
      <header className="workshop-chat-hero">
        <p className="eyebrow">Room chat</p>
        <h1>The room,<br /><span className="spectrum-text">in one place.</span></h1>
        <p className="workshop-lede">Live for everyone registered for the workshop. Share an update, a link, or a file. The history stays on our own server.</p>
        <div className="workshop-facts">
          <span className={`workshop-chat-status ${status}`}>{STATUS_LABEL[status]}</span>
          <span>Registered participants only</span>
          {facilitator ? <span><ShieldCheck aria-hidden="true" /> Posting as Facilitator</span> : session !== undefined ? <span>Signed in as {session.participant.name}</span> : null}
        </div>
      </header>

      {auth === 'guest' ? (
        <section className="workshop-chat-gate" aria-labelledby="chat-join">
          <h2 id="chat-join">Join the room chat</h2>
          <p>Register at the workshop panel with your display name. Only registered participants can read and post here.</p>
          {authNotice !== undefined && <p className="workshop-error" role="alert">{authNotice}</p>}
          <Link className="button" to="/workshoppanel">Register at the panel</Link>
          <details className="workshop-chat-signin">
            <summary><ShieldCheck aria-hidden="true" /> Facilitator sign-in</summary>
            <form className="workshop-form" onSubmit={event => { event.preventDefault(); void signIn() }}>
              <div className="workshop-fields two">
                <label className="workshop-field"><span>Email</span><input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>
                <label className="workshop-field"><span>Password</span><input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
              </div>
              {signInError !== undefined && <p className="workshop-error" role="alert">{signInError}</p>}
              <button type="submit" className="button small" disabled={signingIn}>{signingIn ? 'Signing in' : 'Sign in as facilitator'}</button>
            </form>
          </details>
        </section>
      ) : (
        <section className="workshop-chat-card" aria-label="Room chat">
          <div className="workshop-chat-card-head">
            <span className="workshop-chat-status-line"><span className={`workshop-chat-status ${status}`}>{STATUS_LABEL[status]}</span><span>{messages.length} message{messages.length === 1 ? '' : 's'}</span></span>
            {facilitator
              ? <button type="button" className="workshop-link-button" onClick={signOutFacilitator}>Sign out of facilitator mode</button>
              : session !== undefined && <Link className="workshop-link-button" to="/workshoppanel?tab=mine">My project</Link>}
          </div>
          <div className="workshop-chat-log" ref={logRef} onScroll={scrollState} role="log" aria-live="polite" aria-label="Room chat messages">
            {messages.length === 0 && <p className="workshop-chat-empty">No messages yet. Say hello, share a link, or drop a file.</p>}
            {messages.length < total && (
              <button type="button" className="button secondary small workshop-chat-older" disabled={loadingOlder} onClick={() => void older()}>
                {loadingOlder ? 'Loading' : `Load older messages (${String(total - messages.length)})`}
              </button>
            )}
            {messages.map(message => <ChatMessageRow key={message.id} message={message} token={token ?? ''} />)}
          </div>
          <form className="workshop-chat-composer" onSubmit={event => { event.preventDefault(); void send() }}>
            {file !== undefined && (
              <span className="workshop-chat-file-chip">
                <Paperclip aria-hidden="true" /> {file.name} <em>{fileSize(file.size)}</em>
                <button type="button" aria-label="Remove the attachment" onClick={() => setFile(undefined)}><X aria-hidden="true" /></button>
              </span>
            )}
            <textarea
              value={draft}
              maxLength={4000}
              rows={2}
              placeholder={facilitator ? 'Write to the room as Facilitator' : 'Write to the room'}
              aria-label="Message"
              onChange={event => setDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send() }
              }}
            />
            <div className="workshop-chat-actions">
              <div>
                <input ref={fileInput} type="file" hidden aria-label="Attach a file" onChange={event => {
                  const chosen = event.target.files?.[0]
                  event.target.value = ''
                  if (chosen === undefined) return
                  if (chosen.size > MAX_CHAT_FILE) { setNotice({ kind: 'error', text: 'The file is larger than 10 MB.' }); return }
                  setFile(chosen)
                  setNotice(undefined)
                }} />
                <button type="button" className="button secondary small" onClick={() => fileInput.current?.click()}><Paperclip aria-hidden="true" /> Attach</button>
              </div>
              <button type="submit" className="button small" disabled={sending || (draft.trim() === '' && file === undefined)}>{sending ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />} Send</button>
            </div>
            <p className="workshop-chat-warning">Everyone registered can read this. Do not post a secret you do not want the room to have.</p>
            {notice !== undefined && <p className={notice.kind === 'error' ? 'workshop-error' : 'workshop-ok'} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
          </form>
        </section>
      )}
    </div>
  )
}

function ChatMessageRow({ message, token }: { readonly message: ChatMessage; readonly token: string }) {
  const facilitator = message.authorKind === 'facilitator'
  return (
    <article className={facilitator ? 'workshop-chat-message facilitator' : 'workshop-chat-message'}>
      <header>
        <strong>{message.authorName}</strong>
        {facilitator && <span className="workshop-chip accent">Facilitator</span>}
        <time dateTime={message.created.replace(' ', 'T')}>{formatDateTime(message.created, 'Europe/Vienna')}</time>
      </header>
      {message.body !== '' && (
        <p className="workshop-chat-body">
          {linkify(message.body).map((segment, index) => segment.type === 'link'
            ? <a key={index} href={segment.value} target="_blank" rel="noreferrer">{segment.value}</a>
            : <span key={index}>{segment.value}</span>)}
        </p>
      )}
      {message.file !== '' && <ChatAttachment message={message} token={token} />}
    </article>
  )
}

function ChatAttachment({ message, token }: { readonly message: ChatMessage; readonly token: string }) {
  const [url, setUrl] = useState<string>()
  const [failed, setFailed] = useState(false)
  const image = isImageAttachment(message)

  useEffect(() => {
    if (!image) return undefined
    let live = true
    let objectUrl: string | undefined
    fetchChatFile(token, message)
      .then(blob => {
        if (!live) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => { if (live) setFailed(true) })
    return () => { live = false; if (objectUrl !== undefined) URL.revokeObjectURL(objectUrl) }
  }, [token, message.id, message.file, image])

  const [downloading, setDownloading] = useState(false)
  const download = async (): Promise<void> => {
    setDownloading(true)
    try {
      const blob = await fetchChatFile(token, message)
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = message.file
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch {
      setFailed(true)
    } finally {
      setDownloading(false)
    }
  }

  if (!image || failed) {
    return (
      <button type="button" className="workshop-chat-attachment" onClick={() => void download()} disabled={downloading}>
        <Download aria-hidden="true" /> {message.file} <em>{downloading ? 'Preparing' : 'Download'}</em>
      </button>
    )
  }
  if (url === undefined) return <span className="workshop-chat-attachment">Loading {message.file}...</span>
  return (
    <a className="workshop-chat-image" href={url} download={message.file} aria-label={`Download ${message.file}`}>
      <img src={url} alt={message.file} />
    </a>
  )
}
