import { describe, expect, it } from 'vitest'
import { pieces } from './Inline'

describe('guide text', () => {
  it('reads code spans and links, and leaves plain text alone', () => {
    expect(pieces('Run `npm run share` then read [the guide](/docs/guides/share-blends) or [GitHub](https://github.com/acryldev/acryl).')).toEqual([
      { kind: 'text', text: 'Run ' },
      { kind: 'code', text: 'npm run share' },
      { kind: 'text', text: ' then read ' },
      { kind: 'link', text: 'the guide', href: '/docs/guides/share-blends' },
      { kind: 'text', text: ' or ' },
      { kind: 'link', text: 'GitHub', href: 'https://github.com/acryldev/acryl' },
      { kind: 'text', text: '.' },
    ])
    expect(pieces('no markup, [not a link] (here)')).toEqual([{ kind: 'text', text: 'no markup, [not a link] (here)' }])
  })
})
