import { cleanup, render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { Brand } from './Brand'

afterEach(cleanup)

/**
 * `public/404.html` rewrites the document URL to the requested deep path before
 * React renders, so a document-relative logo URL (`./acryl-logo.png`) would
 * resolve against that nested directory and 404 on every package page. Root
 * absolute URLs are the only ones that survive that rewrite.
 */
describe('Brand asset URLs', () => {
  it('points the brand mark at a root-absolute URL', () => {
    const { container } = render(createElement(MemoryRouter, null, createElement(Brand)))

    const logo = container.querySelector('img.brand-logo')
    expect(logo?.getAttribute('src')).toBe('/acryl-logo.png')
  })

  it('points the document favicon at a root-absolute URL', () => {
    const html = readFileSync('index.html', 'utf8')
    const match = /<link\s+rel="icon"\s+href="([^"]+)"/.exec(html)
    expect(match?.[1]).toBe('/acryl-logo.png')
  })
})
