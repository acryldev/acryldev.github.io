import { cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AcrylMicrovmPage } from './AcrylMicrovmPage'

afterEach(cleanup)

describe('ACRYL microVMs page', () => {
  const { container } = render(createElement(MemoryRouter, null, createElement(AcrylMicrovmPage)))
  const text = container.textContent ?? ''
  const links = [...container.querySelectorAll('a')].map(a => a.getAttribute('href') ?? '')

  it('never names the upstream project; attribution lives in the repository NOTICE', () => {
    expect(text).not.toMatch(/boxlite/i)
    expect(links.join(' ')).not.toMatch(/boxlite/i)
  })

  it('links the repository and promises no benchmark numbers it has not measured', () => {
    expect(links).toContain('https://github.com/acryldev/acrylmicrovm')
    expect(text).toMatch(/No numbers until then/)
    expect(text).not.toMatch(/\b\d+\s?(ms|milliseconds)\b/i)
  })
})
