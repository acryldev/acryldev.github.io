import { expect, test } from 'vitest'
import { parseCommit } from './lib/updates.mjs'

test('a feature with a scope splits its title from the details', () => {
  expect(parseCommit('feat(blends): the Order Desk starter - emails in, orders out')).toEqual({
    type: 'feat', scope: 'blends', title: 'the Order Desk starter', details: 'emails in, orders out',
  })
})

test('a fix without scope or details keeps the whole subject as the title', () => {
  expect(parseCommit('fix: start the web app on a spare port')).toEqual({ type: 'fix', scope: null, title: 'start the web app on a spare port', details: null })
})

test('docs, tests, chores and merges are not updates', () => {
  for (const subject of ['docs(testing): a guide', 'test: more', 'chore: bump', 'Merge branch main', 'wip(001): checkpoint']) {
    expect(parseCommit(subject)).toBeUndefined()
  }
})
