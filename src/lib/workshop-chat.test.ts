import { describe, expect, it } from 'vitest'
import { isImageAttachment, linkify, MAX_CHAT_BODY, MAX_CHAT_FILE, parseSseEvents, validateChatDraft, type ChatMessage } from './workshop-chat'

const message = (file: string): ChatMessage => ({ id: 'msg1', participant: 'p1', authorName: 'Ada', authorKind: 'participant', body: '', file, created: '2026-11-20 10:00:00.000Z' })

describe('links in a message', () => {
  it('keeps plain text and makes http(s) links clickable', () => {
    expect(linkify('Hello room')).toEqual([{ type: 'text', value: 'Hello room' }])
    expect(linkify('See https://acryl.dev/workshoppanel now')).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'link', value: 'https://acryl.dev/workshoppanel' },
      { type: 'text', value: ' now' },
    ])
  })

  it('leaves sentence punctuation outside the link', () => {
    expect(linkify('Read https://example.com/docs.')).toEqual([
      { type: 'text', value: 'Read ' },
      { type: 'link', value: 'https://example.com/docs' },
      { type: 'text', value: '.' },
    ])
  })

  it('handles several links and plain HTML-looking text as text', () => {
    const segments = linkify('<b>a</b> https://one.example and https://two.example/path?x=1')
    expect(segments.filter(segment => segment.type === 'link').map(segment => segment.value)).toEqual(['https://one.example', 'https://two.example/path?x=1'])
    expect(segments[0]).toEqual({ type: 'text', value: '<b>a</b> ' })
  })
})

describe('the realtime server-sent event stream', () => {
  it('parses complete events and keeps the partial tail', () => {
    const parsed = parseSseEvents('event:PB_CONNECT\ndata:{"clientId":"abc"}\n\nevent:workshop_chat_messages\ndata:{"action":"create"}\n\nevent:later')
    expect(parsed.events).toEqual([
      { event: 'PB_CONNECT', data: '{"clientId":"abc"}' },
      { event: 'workshop_chat_messages', data: '{"action":"create"}' },
    ])
    expect(parsed.rest).toBe('event:later')
  })

  it('accepts CRLF and multiple data lines', () => {
    expect(parseSseEvents('event: x\r\ndata: one\r\ndata: two\r\n\r\n')).toEqual({ events: [{ event: 'x', data: 'one\ntwo' }], rest: '' })
  })
})

describe('chat drafts', () => {
  it('needs text or a file and bounds both', () => {
    expect(validateChatDraft('', undefined)).toContain('message or attach')
    expect(validateChatDraft('hi', undefined)).toBeUndefined()
    expect(validateChatDraft('', new File(['x'], 'note.txt'))).toBeUndefined()
    expect(validateChatDraft('x'.repeat(MAX_CHAT_BODY + 1), undefined)).toContain('longer')
    expect(validateChatDraft('hi', { size: MAX_CHAT_FILE + 1 } as File)).toContain('10 MB')
  })

  it('renders raster images inline and treats other files as downloads', () => {
    expect(isImageAttachment(message('photo.PNG'))).toBe(true)
    expect(isImageAttachment(message('photo.jpeg'))).toBe(true)
    expect(isImageAttachment(message('diagram.svg'))).toBe(false)
    expect(isImageAttachment(message('notes.pdf'))).toBe(false)
  })
})
