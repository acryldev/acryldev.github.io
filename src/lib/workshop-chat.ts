// Room chat for the workshop: messages and files live in the same PocketBase as the panel, readable only by an
// authenticated participant (or the facilitator's superuser). Live updates use PocketBase's realtime SSE stream with a
// 3 s polling fallback. Attachments are fetched with the session token and shown from a blob URL.

import { EVENTS_API } from '../data/events'
import { workshopApi, WorkshopError } from './workshop'

export const CHAT_COLLECTION = 'workshop_chat_messages'
export const CHAT_PAGE_SIZE = 100
export const MAX_CHAT_BODY = 4000
export const MAX_CHAT_FILE = 10 * 1024 * 1024

export type ChatAuthorKind = 'participant' | 'facilitator'
export type ChatStatus = 'connecting' | 'live' | 'polling' | 'offline'

export interface ChatMessage {
  readonly id: string
  readonly participant: string
  readonly authorName: string
  readonly authorKind: ChatAuthorKind
  readonly body: string
  readonly file: string
  readonly created: string
}

export interface ChatPageResult {
  readonly messages: readonly ChatMessage[]
  readonly totalItems: number
}

function text(value: unknown): string { return typeof value === 'string' ? value : '' }

function mapMessage(record: Record<string, unknown>): ChatMessage {
  return {
    id: text(record.id),
    participant: text(record.participant),
    authorName: text(record.authorName),
    authorKind: record.authorKind === 'facilitator' ? 'facilitator' : 'participant',
    body: text(record.body),
    file: text(record.file),
    created: text(record.created),
  }
}

export async function loadChatMessages(token: string, page = 1): Promise<ChatPageResult> {
  const listed = await workshopApi<{ items: readonly Record<string, unknown>[]; totalItems: number }>(
    `/api/collections/${CHAT_COLLECTION}/records?perPage=${String(CHAT_PAGE_SIZE)}&page=${String(page)}&sort=-created`,
    { token },
  )
  return { messages: listed.items.map(mapMessage).reverse(), totalItems: listed.totalItems }
}

export interface ChatDraft {
  readonly token: string
  readonly participant?: string
  readonly authorName: string
  readonly authorKind: ChatAuthorKind
  readonly body: string
  readonly file?: File
}

export async function sendChatMessage(draft: ChatDraft): Promise<ChatMessage> {
  const form = new FormData()
  form.set('authorName', draft.authorName)
  form.set('authorKind', draft.authorKind)
  if (draft.participant !== undefined) form.set('participant', draft.participant)
  if (draft.body.trim() !== '') form.set('body', draft.body.trim())
  if (draft.file !== undefined) form.set('file', draft.file)
  let response: Response
  try {
    response = await fetch(`${EVENTS_API}/api/collections/${CHAT_COLLECTION}/records`, {
      method: 'POST',
      headers: { authorization: draft.token },
      body: form,
    })
  } catch {
    throw new WorkshopError('The chat server did not answer. Try again in a moment.')
  }
  const raw = await response.text()
  let payload: unknown
  try { payload = raw === '' ? undefined : JSON.parse(raw) } catch { payload = undefined }
  if (!response.ok) {
    const data = typeof payload === 'object' && payload !== null ? (payload as { data?: Record<string, { message?: string }> }).data : undefined
    const detail = data === undefined ? undefined : Object.values(data).find(entry => typeof entry?.message === 'string')?.message
    throw new WorkshopError(detail ?? (response.status === 413 ? 'The file is too large for the chat.' : `The message was not sent (${String(response.status)}).`))
  }
  return mapMessage(payload as Record<string, unknown>)
}

export function validateChatDraft(body: string, file: File | undefined): string | undefined {
  const clean = body.trim()
  if (clean === '' && file === undefined) return 'Write a message or attach a file.'
  if (clean.length > MAX_CHAT_BODY) return `The message is longer than ${String(MAX_CHAT_BODY)} characters.`
  if (file !== undefined && file.size > MAX_CHAT_FILE) return 'The file is larger than 10 MB.'
  return undefined
}

export function chatFileUrl(message: ChatMessage): string {
  return `${EVENTS_API}/api/files/${CHAT_COLLECTION}/${message.id}/${encodeURIComponent(message.file)}`
}

export async function fetchChatFile(token: string, message: ChatMessage): Promise<Blob> {
  // Protected files are served with a short-lived file token in the query, not the Authorization header.
  const issued = await workshopApi<{ token?: unknown }>('/api/files/token', { method: 'POST', token })
  if (typeof issued.token !== 'string') throw new WorkshopError('The file token was not issued.')
  const response = await fetch(`${chatFileUrl(message)}?token=${encodeURIComponent(issued.token)}`)
  if (!response.ok) throw new WorkshopError(`The file could not be loaded (${String(response.status)}).`)
  return response.blob()
}

export function isImageAttachment(message: ChatMessage): boolean {
  return /\.(png|jpe?g|gif|webp|avif)$/iu.test(message.file)
}

const URL_PATTERN = /https?:\/\/[^\s<]+/gu

export type ChatSegment = { readonly type: 'text'; readonly value: string } | { readonly type: 'link'; readonly value: string }

/** Split a message into text and http(s) links; trailing sentence punctuation stays text. */
export function linkify(body: string): readonly ChatSegment[] {
  const segments: ChatSegment[] = []
  let last = 0
  for (const match of body.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0
    const trailing = /[.,;:!?)\]]+$/u.exec(match[0])?.[0] ?? ''
    const url = match[0].slice(0, match[0].length - trailing.length)
    if (start > last) segments.push({ type: 'text', value: body.slice(last, start) })
    if (url !== '') segments.push({ type: 'link', value: url })
    if (trailing !== '') segments.push({ type: 'text', value: trailing })
    last = start + match[0].length
  }
  if (last < body.length) segments.push({ type: 'text', value: body.slice(last) })
  return segments
}

export interface SseEvent { readonly event: string; readonly data: string }

/** Parse complete SSE events out of a buffer; the trailing partial block is returned as `rest`. */
export function parseSseEvents(input: string): { readonly events: readonly SseEvent[]; readonly rest: string } {
  const blocks = input.replaceAll('\r\n', '\n').split('\n\n')
  const rest = blocks.pop() ?? ''
  const events: SseEvent[] = []
  for (const block of blocks) {
    if (block.trim() === '') continue
    let event = 'message'
    const data: string[] = []
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice('event:'.length).trim()
      else if (line.startsWith('data:')) data.push(line.slice('data:'.length).trimStart())
    }
    if (data.length > 0) events.push({ event, data: data.join('\n') })
  }
  return { events, rest }
}

interface WatchOptions {
  readonly token: string
  readonly onMessage: (message: ChatMessage) => void
  readonly onReplace: (messages: readonly ChatMessage[]) => void
  readonly onStatus: (status: ChatStatus) => void
  readonly signal: AbortSignal
}

const sleep = async (ms: number, signal: AbortSignal): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, ms)
    const abort = (): void => { window.clearTimeout(timer); reject(new DOMException('aborted', 'AbortError')) }
    signal.addEventListener('abort', abort, { once: true })
  })
}

async function streamChat(token: string, onMessage: (message: ChatMessage) => void, onStatus: (status: ChatStatus) => void, signal: AbortSignal): Promise<void> {
  onStatus('connecting')
  const response = await fetch(`${EVENTS_API}/api/realtime`, {
    headers: { authorization: token, accept: 'text/event-stream' },
    cache: 'no-store',
    signal,
  })
  if (!response.ok || response.body === null) throw new WorkshopError('The live connection did not open.')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let subscribed = false
  while (!signal.aborted) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parsed = parseSseEvents(buffer)
    buffer = parsed.rest
    for (const event of parsed.events) {
      if (event.event === 'PB_CONNECT') {
        const payload: unknown = JSON.parse(event.data)
        const clientId = typeof payload === 'object' && payload !== null ? (payload as { clientId?: unknown }).clientId : undefined
        if (typeof clientId !== 'string') throw new WorkshopError('The live connection did not identify itself.')
        const subscription = await fetch(`${EVENTS_API}/api/realtime`, {
          method: 'POST',
          headers: { authorization: token, 'content-type': 'application/json' },
          body: JSON.stringify({ clientId, subscriptions: [CHAT_COLLECTION] }),
          signal,
        })
        if (!subscription.ok) throw new WorkshopError('The live subscription was refused.')
        subscribed = true
        onStatus('live')
      } else if (event.event === CHAT_COLLECTION) {
        const payload: unknown = JSON.parse(event.data)
        if (typeof payload === 'object' && payload !== null) {
          const record = (payload as { action?: unknown; record?: unknown }).record
          if ((payload as { action?: unknown }).action === 'create' && typeof record === 'object' && record !== null) onMessage(mapMessage(record as Record<string, unknown>))
        }
      }
    }
  }
  if (!subscribed && !signal.aborted) throw new WorkshopError('The live connection closed.')
}

/** Live stream first; if it cannot stay open, refresh the latest page every 3 s until aborted. */
export async function watchChat(options: WatchOptions): Promise<void> {
  const token = options.token
  try {
    await streamChat(token, options.onMessage, options.onStatus, options.signal)
  } catch (cause) {
    if (options.signal.aborted) return
  }
  if (options.signal.aborted) return
  options.onStatus('polling')
  while (!options.signal.aborted) {
    try {
      await sleep(3000, options.signal)
    } catch {
      return
    }
    if (options.signal.aborted) return
    try {
      const page = await loadChatMessages(token)
      options.onReplace(page.messages)
      options.onStatus('polling')
    } catch {
      options.onStatus('offline')
    }
  }
}
