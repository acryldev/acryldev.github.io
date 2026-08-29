import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Shell } from './Shell'

afterEach(cleanup)

describe('Shell community links', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('offers Discord in the header and footer with safe external navigation', () => {
    render(createElement(MemoryRouter, null, createElement(Shell)))

    const discordLinks = screen.getAllByRole('link', { name: /discord/i })

    expect(discordLinks).toHaveLength(2)
    for (const link of discordLinks) {
      expect(link.getAttribute('href')).toBe('https://discord.gg/cY9KXMex69')
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noreferrer')
    }
  })

  it('renders the current GitHub stargazer count in the header star link', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stargazers_count: 1234 }),
    }))

    render(createElement(MemoryRouter, null, createElement(Shell)))

    expect(await screen.findByText('1.2k')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Star ACRYL on GitHub - 1.2k stars' })).toBeTruthy()
  })

  it('keeps the star link usable when GitHub star lookup fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    render(createElement(MemoryRouter, null, createElement(Shell)))

    const starLink = screen.getByRole('link', { name: 'Star ACRYL on GitHub' })
    expect(starLink).toBeTruthy()
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
