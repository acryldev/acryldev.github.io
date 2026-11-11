import { describe, expect, it } from 'vitest'
import { EVENTS } from './events'

describe('events', () => {
  it('gives every event a distinct slug and an ISO date', () => {
    expect(new Set(EVENTS.map(event => event.slug)).size).toBe(EVENTS.length)
    for (const event of EVENTS) expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/u)
  })

  it('lists the rebased lightning talk with its own page and its slides', () => {
    const event = EVENTS.find(entry => entry.slug === 'rebaseddotwtf')
    expect(event).toMatchObject({ date: '2026-11-11', href: '/events/rebaseddotwtf' })
    expect(event?.links?.map(link => link.href)).toContain('/demo/rebaseddotwtf/')
  })
})
