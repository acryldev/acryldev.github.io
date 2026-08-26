import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Shell } from './Shell'

describe('Shell community links', () => {
  it('offers Discord in the header and footer with safe external navigation', () => {
    render(createElement(MemoryRouter, null, createElement(Shell)))

    const discordLinks = screen.getAllByRole('link', { name: /discord/i })

    expect(discordLinks).toHaveLength(2)
    for (const link of discordLinks) {
      expect(link.getAttribute('href')).toBe('https://discord.gg/r7j5PMWv4')
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noreferrer')
    }
  })
})
