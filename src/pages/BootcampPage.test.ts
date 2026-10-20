import { describe, expect, it } from 'vitest'
import { register } from './BootcampPage'

const answer = (status: number, body: unknown): typeof fetch => (async () => new Response(JSON.stringify(body), { status })) as typeof fetch

describe('bootcamp registration', () => {
  it('sends the event, the email, the name and the consent', async () => {
    let sent: unknown
    const fetcher = (async (_url: string, init?: RequestInit) => { sent = JSON.parse(String(init?.body)); return new Response('{}', { status: 200 }) }) as typeof fetch
    expect(await register('a@example.com', 'Ada', fetcher)).toEqual({ state: 'done' })
    expect(sent).toEqual({ event: 'acrylbootcamp', email: 'a@example.com', name: 'Ada', consent: true })
  })

  it('treats an email that is already on the list as done', async () => {
    expect(await register('a@example.com', '', answer(400, { data: { email: { code: 'validation_not_unique' } } }))).toEqual({ state: 'done' })
  })

  it('names a rejected email address', async () => {
    const result = await register('nope', '', answer(400, { data: { email: { code: 'validation_is_email' } } }))
    expect(result).toMatchObject({ state: 'failed', reason: expect.stringContaining('email address') })
  })

  it('asks to wait when rate limited, and to retry when the server is unreachable', async () => {
    expect(await register('a@example.com', '', answer(429, {}))).toMatchObject({ state: 'failed', reason: expect.stringContaining('wait a minute') })
    const offline = (async () => { throw new TypeError('network') }) as typeof fetch
    expect(await register('a@example.com', '', offline)).toMatchObject({ state: 'failed', reason: expect.stringContaining('did not answer') })
  })
})
