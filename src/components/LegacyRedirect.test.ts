import { cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { LegacyRedirect } from './LegacyRedirect'

afterEach(cleanup)

function Where() {
  const { pathname, search, hash } = useLocation()
  return createElement('output', null, `${pathname}${search}${hash}`)
}

function landOn(url: string): string | null {
  const { container } = render(createElement(MemoryRouter, { initialEntries: [url] },
    createElement(Routes, null,
      createElement(Route, { path: 'packages/*', element: createElement(LegacyRedirect, { from: '/packages', to: '/ecosystem/plugins' }) }),
      createElement(Route, { path: '*', element: createElement(Where) }))))
  return container.querySelector('output')?.textContent ?? null
}

describe('old /packages links', () => {
  it('land on the same page under /ecosystem/plugins, with the query and fragment', () => {
    expect(landOn('/packages')).toBe('/ecosystem/plugins')
    expect(landOn('/packages?q=notes&page=2')).toBe('/ecosystem/plugins?q=notes&page=2')
    expect(landOn('/packages/acme/repo/plugin#install')).toBe('/ecosystem/plugins/acme/repo/plugin#install')
  })
})
