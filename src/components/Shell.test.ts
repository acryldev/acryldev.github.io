import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { Shell } from './Shell'

afterEach(cleanup)

describe('Shell community links', () => {
  it('offers Discord in the header and footer with safe external navigation', () => {
    render(createElement(MemoryRouter, null, createElement(Shell)))

    const discordLinks = screen.getAllByRole('link', { name: /discord/i })

    expect(discordLinks).toHaveLength(2)
    for (const link of discordLinks) {
      expect(link.getAttribute('href')).toBe('https://discord.gg/9bcTjqCa3')
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noreferrer')
    }
  })

  it('offers a GitHub star link in the header and footer', () => {
    render(createElement(MemoryRouter, null, createElement(Shell)))

    const starLinks = screen.getAllByRole('link', { name: /star/i })

    expect(starLinks).toHaveLength(2)
    for (const link of starLinks) {
      expect(link.getAttribute('href')).toBe('https://github.com/acryldev/acryl')
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noreferrer')
    }
  })
})
