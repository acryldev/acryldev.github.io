import { describe, expect, it } from 'vitest'
import { news, orcaRouter } from './partners'

describe('partners and news', () => {
  it('links to https and discloses the referral', () => {
    expect(orcaRouter.url.startsWith('https://')).toBe(true)
    expect(orcaRouter.disclosure).toMatch(/referral/)
    for (const item of news) expect(item.body).toContain(orcaRouter.disclosure)
  })

  it('lists news newest first with ISO dates', () => {
    const dates = news.map(item => item.date)
    expect(dates.every(date => /^\d{4}-\d{2}-\d{2}$/u.test(date))).toBe(true)
    expect([...dates].sort().reverse()).toEqual(dates)
  })
})
