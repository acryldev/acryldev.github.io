import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { QrPage } from './QrPage'

describe('QrPage', () => {
  it('renders three scannable targets with correct destinations', () => {
    render(createElement(QrPage))

    for (const title of ['ACRYL.dev', 'Join Discord', 'GitHub ACRYL']) {
      expect(screen.getByText(title)).toBeTruthy()
    }

    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('https://acryl.dev/')
    expect(hrefs).toContain('https://discord.gg/cY9KXMex69')
    expect(hrefs).toContain('https://github.com/acryldev/acryl')
  })
})
