import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { InstallBox } from './InstallBox'

describe('install box', () => {
  it('shows the one-line install and switches between macOS/Linux and Windows', () => {
    const { container } = render(<InstallBox />)
    const code = () => container.querySelector('code')?.textContent ?? ''
    fireEvent.click(screen.getByRole('tab', { name: 'macOS / Linux' }))
    expect(code()).toContain('curl -fsSL https://acryl.dev/install.sh | bash')
    fireEvent.click(screen.getByRole('tab', { name: 'Windows' }))
    expect(code()).toContain('irm https://acryl.dev/install.ps1 | iex')
  })
})
