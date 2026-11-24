import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

afterEach(cleanup)

describe('home hero films', () => {
  it('opens on the product-team film and switches to the business film and back', () => {
    const { container } = render(createElement(MemoryRouter, null, createElement(HomePage)))
    const src = () => container.querySelector('.hero-film video')?.getAttribute('src')
    expect(src()).toBe('/hero/acryl-how-it-works.mp4')
    fireEvent.click(screen.getByRole('tab', { name: 'For business' }))
    expect(src()).toBe('/hero/acryl-for-business.mp4')
    expect(screen.getByRole('tab', { name: 'For business' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(screen.getByRole('tab', { name: 'For product teams' }))
    expect(src()).toBe('/hero/acryl-how-it-works.mp4')
  })
})
