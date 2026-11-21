import { cleanup, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { DownloadButtons } from './DownloadButtons'

afterEach(cleanup)

describe('DownloadButtons', () => {
  it('links ACRYL ADE\'s installers straight away, with no lookup', () => {
    render(createElement(DownloadButtons))
    const base = 'https://github.com/acrylblends/05-acryl-ade/releases/latest/download/'
    expect(screen.getByRole('link', { name: /Apple Silicon/u }).getAttribute('href')).toBe(`${base}ACRYL-ADE-mac-arm64.dmg`)
    expect(screen.getByRole('link', { name: /x64 · Installer/u }).getAttribute('href')).toBe(`${base}ACRYL-ADE-win-x64.exe`)
    expect(screen.getByRole('link', { name: /x64 · Debian/u }).getAttribute('href')).toBe(`${base}ACRYL-ADE-linux-x64.deb`)
    expect(screen.getByText(/Download ACRYL ADE/u)).toBeTruthy()
  })
})
